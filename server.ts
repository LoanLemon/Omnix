import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import multer from "multer";
import { createServer } from "http";
import open from "open";
import { setupWebSockets, dispatchTask } from "./src/engine/socketHandler.ts";

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000');
const args = process.argv.slice(2);
const isSilent = args.includes("--silent") || process.env.NODE_ENV === "production" || !!process.env.K_SERVICE;
const pidArgIndex = args.indexOf("--dependent-pid");
const dependentPid = pidArgIndex !== -1 ? parseInt(args[pidArgIndex + 1]) : null;

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  console.log("🚀 Initializing Omnix Brain...");
  const app = express();
  const server = createServer(app);
  
  // Initialize WebSockets (Relay Mode) - ONLY IF EXPLICITLY ENABLED OR IN CERTAIN ENVIRONMENTS
  const isElectron = !!process.versions.electron;
  let relayActive = false;

  const startRelay = () => {
    if (relayActive) return;
    console.log("📡 Setting up WebSockets (Relay Mode Enabled)...");
    setupWebSockets(server);
    relayActive = true;
  };

  // In standard browser mode (Cloud Run/AI Studio), we don't start the relay by default 
  // as per user request to avoid server overhead.
  if (isElectron) {
    console.log("Omnix: Running in Electron mode. Auto-launching relay server...");
    startRelay();
  } else {
    console.log("Omnix: Running in Standalone Browser mode.");
  }

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

  // Relay Control
  app.post("/api/server/relay", (req, res) => {
    const { action } = req.body;
    if (action === "start") {
      startRelay();
      return res.json({ status: "ok", message: "Relay started" });
    }
    res.json({ status: "ok", relayActive });
  });

  app.get("/api/server/status", (req, res) => {
    res.json({ 
      relayActive, 
      isElectron, 
      platform: process.platform,
      arch: process.arch
    });
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", pid: process.pid });
  });

  // --- 2. PID MONITORING ---
  if (dependentPid && !isNaN(dependentPid)) {
    console.log(`Omnix: Monitoring parent process PID ${dependentPid}`);
    setInterval(() => {
      try {
        process.kill(dependentPid, 0);
      } catch (e) {
        console.log("Omnix: Parent process ended or unreachable. Shutting down...");
        process.exit();
      }
    }, 2000);
  } else if (pidArgIndex !== -1) {
    console.log("Omnix: --dependent-pid provided but invalid. Skipping monitoring.");
  }

  // --- API ENDPOINTS (Relayed to Browser Engine) ---
  
  // Text Generation
  app.post("/api/text", async (req, res) => {
    try {
      const { prompt, systemPrompt, modelId } = req.body;
      if (!prompt) return res.status(400).json({ error: "Prompt is required" });

      const output = await dispatchTask("text", prompt, { systemPrompt, modelId });
      res.json({ response: output });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Director Routing
  app.post("/api/director", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) return res.status(400).json({ error: "Prompt is required" });

      const intent = await dispatchTask("director", prompt);
      res.json({ intent, prompt });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vision Analysis
  app.post("/api/vision", upload.single("image"), async (req: any, res) => {
    try {
      const { prompt, modelId } = req.body;
      const file = req.file;
      if (!file) return res.status(400).json({ error: "Image is required" });

      const base64Image = `data:image/jpeg;base64,${file.buffer.toString('base64')}`;
      const response = await dispatchTask("vision", base64Image, { prompt, modelId });

      res.json({ response });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Speech-to-Text
  app.post("/api/stt", upload.single("audio"), async (req: any, res) => {
    try {
      const file = req.file;
      if (!file) return res.status(400).json({ error: "Audio file is required" });
      
      const base64Audio = file.buffer.toString('base64');
      const text = await dispatchTask("stt", base64Audio);

      res.json({ text });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Text-to-Speech
  app.post("/api/tts", async (req, res) => {
    try {
      const { text, modelId } = req.body;
      if (!text) return res.status(400).json({ error: "Text is required" });

      const output = await dispatchTask("tts", text, { modelId });
      res.json(output);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Image Generation
  app.post("/api/image", async (req, res) => {
    try {
      const { prompt, modelId } = req.body;
      if (!prompt) return res.status(400).json({ error: "Prompt is required" });

      const image = await dispatchTask("image-gen", prompt, { modelId });
      res.json({ status: "success", image });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Music Generation
  app.post("/api/music", async (req, res) => {
    try {
      const { prompt, modelId } = req.body;
      if (!prompt) return res.status(400).json({ error: "Prompt is required" });

      const output = await dispatchTask("music-gen", prompt, { modelId });
      res.json({ status: "success", ...output });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- FRONTEND MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    console.log("🛠️ Starting Vite in development mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("📦 Serving production build...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.error(`❌ Port ${PORT} is already in use. Please close the other process or set a different PORT.`);
    } else {
      console.error("❌ Server Error:", err);
    }
  });

  server.listen(PORT, "0.0.0.0", async () => {
    console.log(`🚀 Omnix Brain Active [PID: ${process.pid}] on port ${PORT}`);
    console.log(`🤖 Local API available at http://localhost:${PORT}/api`);
    
    // Only launch GUI if we are definitely local and not silent
    const isLocal = !process.env.K_SERVICE && !process.env.GAE_SERVICE; // Cloud Run / App Engine check
    if (!isSilent && isLocal) {
      launchGUI();
    }
  });
}

async function launchGUI() {
  try {
    const { default: electron } = await import("electron" as any).catch(() => ({ default: null }));
    
    if (electron && (electron as any).app) {
      console.log("Omnix: Handled by Electron shell.");
    } else {
      console.log("Omnix: Opening GUI in default browser...");
      await open(`http://localhost:${PORT}`);
    }
  } catch (err) {
    console.log("Omnix: Error launching GUI, opening in default browser...");
    await open(`http://localhost:${PORT}`);
  }
}

startServer().catch((err) => {
  console.error("Critical: Omnix Brain failed to start:", err);
  process.exit(1);
});
