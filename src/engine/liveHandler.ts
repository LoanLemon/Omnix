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

    const ip = req.socket?.remoteAddress || "";
    const isLocalHost = !ip || ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1" || ip.toLowerCase() === "localhost";

    ws.on("message", async (message: any) => {
      try {
        const payload = JSON.parse(message.toString());
        const { audio, text, systemPrompt, voiceId, modelId, isolatedRAG, reqId: payloadReqId } = payload;
        
        const currentReqId = payloadReqId || reqId;

        ws.send(JSON.stringify({ type: "status", status: "queued" }));

        await dispatchTask("livews", {
          audio,
          text,
          systemPrompt,
          voiceId,
          modelId,
          isolatedRAG
        }, {
          reqId: currentReqId,
          origin: "live-api",
          isLocalHost,
          onUpdate: (update: any) => {
            if (ws.readyState === 1) { // OPEN
              ws.send(JSON.stringify(update));
            }
          }
        });
        
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
