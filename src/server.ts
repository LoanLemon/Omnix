import express from "express";
import { engine } from "./engine/ModelManager";
import { createServer } from "http";
import { WebSocketServer } from "ws";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json());

// Streaming Token Support via WebSocket
wss.on("connection", (ws) => {
  ws.on("message", async (message) => {
    const { type, prompt, modelId, category } = JSON.parse(message.toString());

    if (type === "GENERATE") {
      const pipe = await engine.swapModel(modelId, category);
      
      await pipe(prompt, {
        max_new_tokens: 512,
        callback_function: (beams: any) => {
          const decoded = pipe.tokenizer.decode(beams[0].output_token_ids, { skip_special_tokens: true });
          ws.send(JSON.stringify({ type: "TOKEN", text: decoded }));
        }
      });
      ws.send(JSON.stringify({ type: "COMPLETE" }));
    }
  });
});

// REST Fallback
app.post("/api/chat", async (req, res) => {
  const { prompt, category = "text" } = req.body;
  
  // 1. Ask Director where to go
  const intent = await engine.route(prompt);
  
  // 2. Logic to select the right model ID based on intent
  // (Simplified for this example)
  const targetModel = intent.includes("image") ? "janus-pro-1b" : "llama-3.2-3b";
  
  const pipe = await engine.swapModel(targetModel, category);
  const output = await pipe(prompt);
  
  res.json({ intent, response: output[0].generated_text });
});

server.listen(3000, () => console.log("Omnix Engine API running on port 3000"));