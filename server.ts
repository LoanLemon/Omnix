import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import multer from "multer";
import { pipeline } from "@huggingface/transformers";
import { WebSocketServer } from "ws";
import { engine } from "./src/engine/ModelManager.js";

const upload = multer({ storage: multer.memoryStorage() });

// --- PROXY ARCHITECTURE FOR ELECTRON ---
const pendingRequests = new Map<string, any>();

if (process.send) {
  process.on('message', (msg: any) => {
    if (msg.type === 'api-inference-response') {
      const res = pendingRequests.get(msg.requestId);
      if (res) {
        res.json(msg.response);
        pendingRequests.delete(msg.requestId);
      }
    }
  });
}

async function requestInference(category: string, prompt: string, extraData: any = {}) {
  return new Promise((resolve, reject) => {
    const requestId = Math.random().toString(36).substring(7);
    
    // Timeout after 60 seconds
    const timeout = setTimeout(() => {
      if (pendingRequests.has(requestId)) {
        pendingRequests.delete(requestId);
        reject(new Error("Inference request timed out"));
      }
    }, 60000);

    pendingRequests.set(requestId, {
      json: (data: any) => {
        clearTimeout(timeout);
        resolve(data);
      }
    });

    if (process.send) {
      process.send({
        type: 'api-inference-request',
        data: { requestId, prompt, category, ...extraData }
      });
    } else {
      reject(new Error("Not running in Electron proxy mode"));
    }
  });
}
// ----------------------------------------

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 9777;

  app.use(cors());
  app.use(express.json());

  // Health endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      engine: "Omnix Local Engine v0.2.0",
      node: process.version,
      platform: process.platform,
      arch: process.arch
    });
  });

  // Verify native acceleration
  try {
    await import("onnxruntime-node");
    console.log("ONNX Runtime native acceleration ready.");
  } catch (e: any) {
    console.warn("WARNING: onnxruntime-node not found. Engine will run on CPU WASM backend.");
  }

  // AI Models Cache
  let textPipeline: any = null;
  let visionPipeline: any = null;

  async function getTextPipeline() {
    if (!textPipeline) {
      textPipeline = await pipeline("text-generation", "Xenova/phi-3-mini-4k-instruct");
    }
    return textPipeline;
  }

  async function getVisionPipeline() {
    if (!visionPipeline) {
      visionPipeline = await pipeline("image-to-text", "Xenova/vit-gpt2-image-captioning");
    }
    return visionPipeline;
  }

  let sttPipeline: any = null;
  async function getSTTPipeline() {
    if (!sttPipeline) {
      sttPipeline = await pipeline("automatic-speech-recognition", "Xenova/whisper-tiny.en");
    }
    return sttPipeline;
  }

  // API Endpoints
  app.post("/api/text", async (req, res) => {
    try {
      const { prompt, systemPrompt } = req.body;
      if (!prompt) return res.status(400).json({ error: "Prompt is required" });

      if (process.send) {
        const result: any = await requestInference("text", prompt, { systemPrompt });
        return res.json(result);
      }

      const generator = await getTextPipeline();
      const messages = [
        { role: "system", content: systemPrompt || "You are Omnix, a helpful AI assistant." },
        { role: "user", content: prompt }
      ];

      const output = await generator(messages, { max_new_tokens: 512 });
      res.json({ response: output[0].generated_text });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/vision", upload.single("image"), async (req: any, res) => {
    try {
      const { prompt } = req.body;
      const file = req.file;
      if (!file) return res.status(400).json({ error: "Image is required" });

      if (process.send) {
        // Convert buffer to base64 for IPC
        const base64Image = file.buffer.toString('base64');
        const result: any = await requestInference("vision", prompt || "Describe this image", { image: base64Image });
        return res.json(result);
      }

      const captioner = await getVisionPipeline();
      const imageBuffer = file.buffer;
      const blob = new Blob([imageBuffer]);
      const imageUrl = URL.createObjectURL(blob);

      const output = await captioner(imageUrl);
      
      // If prompt is provided, we could use the caption as context for a text model
      if (prompt) {
        const generator = await getTextPipeline();
        const messages = [
          { role: "system", content: `You are an image analysis assistant. The image caption is: ${output[0].generated_text}` },
          { role: "user", content: prompt }
        ];
        const textOutput = await generator(messages, { max_new_tokens: 256 });
        res.json({ caption: output[0].generated_text, response: textOutput[0].generated_text });
      } else {
        res.json({ caption: output[0].generated_text });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/director", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) return res.status(400).json({ error: "Prompt is required" });

      if (process.send) {
        const result: any = await requestInference("director", prompt);
        return res.json(result);
      }

      const generator = await getTextPipeline();
      const directorPrompt = `Identify the users intent.
If the user wants an image generated, output: "image_gen"
If the user wants music generated, output: "music_gen"
If the user wants a website or app generated, output: "sandbox"
For all other prompts/text generated, output: "route_to_text"

Only output one of the four valid outputs (image_gen/music_gen/sandbox/route_to_text). 
No other outputs are valid.`;

      const messages = [
        { role: "system", content: directorPrompt },
        { role: "user", content: prompt }
      ];

      const output = await generator(messages, { max_new_tokens: 10 });
      const intent = output[0].generated_text.trim().toLowerCase();
      
      res.json({ intent, prompt });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/image", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) return res.status(400).json({ error: "Prompt is required" });

      // In a real scenario, we'd use a Diffusion pipeline here.
      // For this local API demo, we'll return a simulated success.
      res.json({ 
        status: "success", 
        message: "Image generation triggered", 
        prompt,
        url: `https://picsum.photos/seed/${encodeURIComponent(prompt)}/1024/1024` 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/music", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) return res.status(400).json({ error: "Prompt is required" });

      // Simulated music generation
      res.json({ 
        status: "success", 
        message: "Music generation triggered", 
        prompt,
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/stt", upload.single("audio"), async (req: any, res) => {
    try {
      const file = req.file;
      if (!file) return res.status(400).json({ error: "Audio file is required" });

      if (process.send) {
        const base64Audio = file.buffer.toString('base64');
        const result: any = await requestInference("stt", "transcribe", { audio: base64Audio });
        return res.json(result);
      }

      const transcriber = await getSTTPipeline();
      
      // Convert buffer to Float32Array for Whisper
      const audioBuffer = file.buffer;
      // Note: In a real scenario, we'd need to ensure the audio is 16kHz mono
      // For this demo, we assume the client sends compatible data or we use a library to resample
      const output = await transcriber(audioBuffer);
      
      res.json({ text: output.text });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tts", async (req, res) => {
    try {
      const { text, voice } = req.body;
      if (!text) return res.status(400).json({ error: "Text is required" });

      if (process.send) {
        const result: any = await requestInference("tts", text, { voice });
        return res.json(result);
      }

      // Simulated TTS generation
      // In a real scenario, we'd use a TTS pipeline and return a buffer or URL
      res.json({ 
        status: "success", 
        message: "Speech generation triggered", 
        text,
        voice: voice || "af_bella",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { prompt, category = "text" } = req.body;
      if (!prompt) return res.status(400).json({ error: "Prompt is required" });

      const intent = await engine.route(prompt);
      // Logic to select the right model ID based on intent
      const targetModel = intent.includes("image") ? "janus-pro-1b" : "llama-3.2-3b";
      
      const pipe = await engine.swapModel(targetModel, category);
      const output = await pipe(prompt);
      
      res.json({ intent, response: output[0].generated_text });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Omnix Server running on http://localhost:${PORT}`);
    console.log(`Local API available at http://localhost:${PORT}/api`);
  });

  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("WebSocket client connected to Omnix Engine");
    ws.on("message", async (message) => {
      try {
        const { type, prompt, modelId, category } = JSON.parse(message.toString());

        if (type === "GENERATE") {
          const pipe = await engine.swapModel(modelId, category, (p) => {
            ws.send(JSON.stringify({ type: "PROGRESS", data: p }));
          });
          
          await pipe(prompt, {
            max_new_tokens: 512,
            callback_function: (beams: any) => {
              const decoded = pipe.tokenizer.decode(beams[0].output_token_ids, { skip_special_tokens: true });
              ws.send(JSON.stringify({ type: "TOKEN", text: decoded }));
            }
          });
          ws.send(JSON.stringify({ type: "COMPLETE" }));
        }
      } catch (err: any) {
        console.error("WebSocket message error:", err);
        ws.send(JSON.stringify({ type: "ERROR", message: err.message }));
      }
    });

    ws.on("close", () => console.log("WebSocket client disconnected"));
  });
}

startServer();
