import { WebSocketServer } from "ws";
import { dispatchTask } from "./socketHandler.ts";

export function setupLiveApiSocket() {
  const wss = new WebSocketServer({ 
    noServer: true
  });

  console.log("📡 WebSocket Live API Initialized on /api/live");

  wss.on("connection", (ws: any, req: any) => {
    console.log("🟢 Live API Client Connected");
    let reqId = req.url ? new URL(req.url, 'http://localhost').searchParams.get('reqId') : null;
    if (!reqId) reqId = "live-session-" + Date.now();

    ws.on("message", async (message: any) => {
      try {
        const payload = JSON.parse(message.toString());
        const { audio, text, systemPrompt, voiceId, modelId, isolatedRAG, reqId: payloadReqId } = payload;
        
        const currentReqId = payloadReqId || reqId;
        let userInput = text;

        if (audio) {
          // Process STT
          ws.send(JSON.stringify({ type: "status", status: "processing-stt" }));
          const sttRes = await dispatchTask("stt", audio, { reqId: currentReqId, origin: "live-api" });
          userInput = sttRes;
          ws.send(JSON.stringify({ type: "stt-result", text: userInput }));
        }

        if (userInput) {
          // Process Text Gen
          ws.send(JSON.stringify({ type: "status", status: "processing-text" }));
          const textRes = await dispatchTask("text", userInput, { 
            systemPrompt, 
            modelId, 
            reqId: currentReqId, 
            isolatedRAG,
            origin: "live-api" 
          });
          
          const assistantText = typeof textRes === "string" ? textRes : (textRes.response || textRes);
          ws.send(JSON.stringify({ type: "text-result", text: assistantText }));

          // Process TTS
          ws.send(JSON.stringify({ type: "status", status: "processing-tts" }));
          const ttsRes = await dispatchTask("tts", assistantText, { 
            voiceId: voiceId || "af_heart", 
            origin: "live-api", 
            reqId: currentReqId 
          });
          
          ws.send(JSON.stringify({ type: "tts-result", audio: ttsRes.audio }));
        }
        
        ws.send(JSON.stringify({ type: "status", status: "idle" }));
        
      } catch (err: any) {
        console.error("Live API Error:", err);
        ws.send(JSON.stringify({ type: "error", error: err.message || String(err) }));
      }
    });

    ws.on("close", () => {
      console.log("🔴 Live API Client Disconnected");
    });
  });

  return wss;
}
