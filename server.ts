import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import multer from "multer";
import { createServer } from "http";
import open from "open";
import fs from "fs";
import sharp from "sharp";
import { setupWebSockets, dispatchTask, handleHealthCheck, archiveReqIdHistory, purgeReqIdHistory } from "./src/engine/socketHandler.ts";
import { setupLiveApiSocket } from "./src/engine/liveHandler.ts";
import { MODELS } from "./src/shared/modelList.ts";

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});

const resolvedFilename = typeof __filename !== "undefined" ? __filename : fileURLToPath(import.meta.url);
const resolvedDirname = typeof __dirname !== "undefined" ? __dirname : path.dirname(resolvedFilename);

const PORT = parseInt(process.env.PORT || '9777');
const args = process.argv.slice(2);
const isSilent = args.includes("--silent") || process.env.NODE_ENV === "production" || !!process.env.K_SERVICE;
const pidArgIndex = args.indexOf("--dependent-pid");
const dependentPid = pidArgIndex !== -1 ? parseInt(args[pidArgIndex + 1]) : null;

// Determine if we are running in a cloud/container environment where external proxy needs 0.0.0.0
const isContainer = !!(process.env.K_SERVICE || process.env.GAE_SERVICE || process.env.PORT === "3000" || process.env.NODE_ENV === "production");

// Read local config file for allowed global access
let allowRemoteFromConfig = false;
try {
  const configPath = path.join(process.cwd(), "omnix-config.json");
  if (fs.existsSync(configPath)) {
    const configData = JSON.parse(fs.readFileSync(configPath, "utf8"));
    if (configData.allowRemote || configData.globalAccess) {
      allowRemoteFromConfig = true;
    }
  }
} catch (e) {
  // Ignore error
}

const isGlobalAccessEnabled = 
  process.env.ALLOW_REMOTE === "true" || 
  process.env.OMNIX_GLOBAL_ACCESS === "true" || 
  args.includes("--allow-remote") || 
  args.includes("--global") || 
  allowRemoteFromConfig;

const HOST = (isContainer || isGlobalAccessEnabled) ? "0.0.0.0" : "127.0.0.1";

function checkIsLocalHost(req: any): boolean {
  const ip = req.ip || "";
  const remoteAddress = req.socket?.remoteAddress || "";
  const isLocalIP = (addr: string) => 
    addr === "127.0.0.1" || 
    addr === "::1" || 
    addr === "::ffff:127.0.0.1" || 
    addr.toLowerCase() === "localhost";
  return isLocalIP(ip) || isLocalIP(remoteAddress);
}

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  console.log("🚀 Initializing Omnix Brain...");
  const app = express();
  const server = createServer(app);
  
  // Setup Live API Socket
  const liveWss = setupLiveApiSocket();
  
  // Initialize WebSockets (Relay Mode) - ONLY IF EXPLICITLY ENABLED OR IN CERTAIN ENVIRONMENTS
  const isElectron = !!process.versions.electron;
  let relayActive = false;
  let relayWss: any = null;

  const startRelay = () => {
    if (relayActive) return;
    console.log("📡 Setting up WebSockets (Relay Mode Enabled)...");
    relayWss = setupWebSockets();
    relayActive = true;
  };
  server.on('upgrade', (request, socket, head) => {
    const pathname = request.url ? new URL(request.url, 'http://localhost').pathname : '';

    if (pathname === '/api/live') {
      liveWss.handleUpgrade(request, socket, head, (ws: any) => {
        liveWss.emit('connection', ws, request);
      });
    } else if (pathname === '/ws-active-compute' && relayWss) {
      relayWss.handleUpgrade(request, socket, head, (ws: any) => {
        relayWss.emit('connection', ws, request);
      });
    }
  });

  // In standard browser mode (Cloud Run/AI Studio), we don't start the relay by default 
  // as per user request to avoid server overhead.
  if (isElectron) {
    console.log("Omnix: Running in Electron mode. Auto-launching relay server...");
    startRelay();
  } else {
    console.log("Omnix: Running in Standalone Browser mode.");
  }

  app.use((req, res, next) => {
    const origin = req.headers.origin || "*";
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE, PATCH, HEAD");
    res.setHeader("Access-Control-Allow-Headers", req.headers["access-control-request-headers"] || "Content-Type, Authorization, X-Requested-With, x-req-id, reqid, reqId, Accept");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    
    if (req.headers["access-control-request-private-network"]) {
      res.setHeader("Access-Control-Allow-Private-Network", "true");
    }
    
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Private-Network", "true");
      return res.status(200).end(); // Respond immediately to preflight OPTIONS requests to bypass CORS
    }
    next();
  });
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use(express.text({ 
    type: (req) => {
      const contentType = req.headers['content-type'] || '';
      return !contentType.includes('multipart/form-data');
    }, 
    limit: '50mb' 
  }));

  // Normalization middleware to parse stringified JSON or urlencoded JSON from PowerShell/clients
  app.use((req: any, res: any, next: any) => {
    const abortController = new AbortController();
    req.abortSignal = abortController.signal;

    // We do not bind to req.on("aborted") or res.on("close") to abort the controller
    // because proxies like Cloud Run can occasionally drop or close connections 
    // prematurely during long-running inference requests, which would incorrectly 
    // cancel the background task.

    if (typeof req.body === "string") {
      const trimmed = req.body.trim();
      if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        try {
          req.body = JSON.parse(trimmed);
        } catch (e) {
          // Leave as raw string
        }
      } else {
        try {
          const params = new URLSearchParams(trimmed);
          const obj: any = {};
          let hasKeys = false;
          for (const [key, val] of params.entries()) {
            obj[key] = val;
            hasKeys = true;
          }
          if (hasKeys) {
            const keys = Object.keys(obj);
            if (keys.length === 1 && keys[0].trim().startsWith("{")) {
              try {
                req.body = JSON.parse(keys[0]);
              } catch {
                req.body = obj;
              }
            } else {
              req.body = obj;
            }
          }
        } catch (e) {
          // Leave as raw string
        }
      }
    }
    next();
  });

  // Relay Control
  app.post("/api/server/relay", (req, res) => {
    const { action } = req.body;
    if (action === "start") {
      startRelay();
      return res.json({ status: "ok", message: "Relay started" });
    }
    res.json({ status: "ok", relayActive });
  });

  app.get("/api/server/config", (req, res) => {
    res.json({
      port: PORT,
      host: HOST,
      isGlobalAccessEnabled,
      isContainer
    });
  });

  app.post("/api/server/config", (req, res) => {
    try {
      const { allowRemote } = req.body;
      const configPath = path.join(process.cwd(), "omnix-config.json");
      
      let configData: any = {};
      try {
        if (fs.existsSync(configPath)) {
          configData = JSON.parse(fs.readFileSync(configPath, "utf8"));
        }
      } catch (e) {}

      configData.allowRemote = !!allowRemote;
      
      fs.writeFileSync(configPath, JSON.stringify(configData, null, 2), "utf8");
      
      res.json({ 
        success: true, 
        message: "Configuration saved successfully. Please restart the Omnix API server to apply changes.",
        config: configData
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
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
  app.get("/api/health", async (req, res) => {
    try {
      const origin = req.headers.origin || req.headers.referer || "unknown";
      const isLocalHost = checkIsLocalHost(req);
      const check = await handleHealthCheck(origin, isLocalHost);
      if (!check.allowed) {
        return res.status(403).json({ error: check.error || "Blocked by permission policy" });
      }
      res.json({ status: "ok", pid: process.pid });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // List supported models
  app.get("/api/listModels", (req, res) => {
    res.json(MODELS);
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
      let prompt = req.body.prompt;
      let systemPrompt = req.body.systemPrompt;
      let modelId = req.body.modelId;
      let qtype = req.body.qtype || "q4fp16";
      let temperature = req.body.temperature;
      let top_p = req.body.top_p;
      let top_k = req.body.top_k;
      let maxTokens = req.body.maxTokens;

      let isolatedRAG = req.body.isolatedRAG;
      let ocean = req.body.ocean;

      if (req.body.model && typeof req.body.model === "object") {
        modelId = req.body.model.id || modelId;
        qtype = req.body.model.qtype || qtype;
        temperature = req.body.model.temperature ?? temperature;
        top_p = req.body.model.top_p ?? top_p;
        top_k = req.body.model.top_k ?? top_k;
        maxTokens = req.body.model.maxTokens ?? maxTokens;
      }

      if (qtype === "q4fp16") {
        qtype = "q4f16";
      }

      if (!ocean) {
        const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = req.body;
        if (openness !== undefined || conscientiousness !== undefined || extraversion !== undefined || agreeableness !== undefined || neuroticism !== undefined) {
          ocean = { openness, conscientiousness, extraversion, agreeableness, neuroticism };
        }
      }

      if (!prompt) return res.status(400).json({ error: "Prompt is required" });

      const origin = req.headers.origin || req.headers.referer || "unknown";
      const reqId = req.body?.reqId || req.query?.reqId || req.headers?.["x-req-id"] || req.headers?.["reqid"];
      
      console.log(`\n🚀 [API] Processing Text Request [reqId: ${reqId || 'none'}]`);
      console.log(`   - Model: ${modelId || 'auto-selected (default)'}`);
      console.log(`   - Origin: ${origin}`);
      
      const output = await dispatchTask("text", prompt, { 
        systemPrompt, 
        modelId, 
        qtype, 
        origin, 
        reqId, 
        temperature, 
        top_p, 
        top_k, 
        maxTokens,
        isolatedRAG,
        ocean,
        isLocalHost: checkIsLocalHost(req),
        abortSignal: (req as any).abortSignal
      });
      
      let cleanResponse = output;
      let thinkText: string | undefined = undefined;
      
      if (typeof output === "string") {
        const thinkRegex = /<think>([\s\S]*?)(?:<\/think>|$)/i;
        const match = output.match(thinkRegex);
        if (match) {
          thinkText = match[1].trim();
          cleanResponse = output.replace(thinkRegex, "").trim();
          if (!cleanResponse) {
            cleanResponse = thinkText;
            thinkText = undefined;
          }
        } else {
          const thoughtRegex = /<\|channel>thought\n([\s\S]*?)(?:<channel\|>|$)/i;
          const thoughtMatch = output.match(thoughtRegex);
          if (thoughtMatch) {
            thinkText = thoughtMatch[1].trim();
            cleanResponse = output.replace(thoughtRegex, "").trim();
            if (!cleanResponse) {
              cleanResponse = thinkText;
              thinkText = undefined;
            }
          }
        }
      }

      if (thinkText !== undefined) {
        res.json({ response: cleanResponse, think: thinkText });
      } else {
        res.json({ response: output });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Director Routing
  app.post("/api/director", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) return res.status(400).json({ error: "Prompt is required" });

      const origin = req.headers.origin || req.headers.referer || "unknown";
      const reqId = req.body?.reqId || req.query?.reqId || req.headers?.["x-req-id"] || req.headers?.["reqid"];
      
      console.log(`\n🚀 [API] Processing Director Request [reqId: ${reqId || 'none'}]`);
      console.log(`   - Origin: ${origin}`);
      
      const intent = await dispatchTask("director", prompt, { origin, reqId, isLocalHost: checkIsLocalHost(req), abortSignal: (req as any).abortSignal });
      res.json({ intent, prompt });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Archive isolated chat history for a reqId
  app.post("/api/archive-history", (req, res) => {
    const { oldReqId, newReqId } = req.body;
    if (oldReqId !== undefined && newReqId !== undefined) {
      archiveReqIdHistory(String(oldReqId), String(newReqId));
      return res.json({ success: true, message: `Archived ${oldReqId} to ${newReqId}` });
    }
    return res.status(400).json({ error: "oldReqId and newReqId are required" });
  });

  // Purge isolated chat history for a reqId
  app.post("/api/purge-history", (req, res) => {
    const { reqId } = req.body;
    if (reqId !== undefined) {
      purgeReqIdHistory(String(reqId));
      return res.json({ success: true, message: `Purged reqId: ${reqId}` });
    }
    return res.status(400).json({ error: "reqId is required" });
  });

  // Inject background story / lore into isolated RAG memory store
  app.post(["/api/injectRAG", "/api/inject-rag"], async (req, res) => {
    try {
      const { isolatedRAG, text, metadata } = req.body;
      const reqId = req.body.reqId || req.query.reqId || req.headers?.["x-req-id"] || req.headers?.["reqid"];
      
      let targetRAG: string | undefined = undefined;
      if (isolatedRAG === true || String(isolatedRAG).toLowerCase() === "true") {
        targetRAG = reqId ? String(reqId) : undefined;
      } else if (isolatedRAG !== undefined && isolatedRAG !== null && isolatedRAG !== "") {
        targetRAG = String(isolatedRAG);
      } else if (reqId) {
        targetRAG = String(reqId);
      }

      if (!targetRAG) {
        return res.status(400).json({ error: "isolatedRAG or reqId is required to specify the isolation session" });
      }
      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "text parameter is required and must be a string" });
      }

      console.log(`\n📥 [API] Injecting RAG entry for isolatedRAG/reqId: ${targetRAG}`);
      
      const origin = req.headers.origin || req.headers.referer || "unknown";
      
      const result = await dispatchTask("inject-rag", text, { 
        isolatedRAG: targetRAG,
        metadata: metadata || {},
        origin,
        reqId,
        isLocalHost: checkIsLocalHost(req),
        abortSignal: (req as any).abortSignal
      });

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vision Analysis
  app.post("/api/vision", upload.single("image"), async (req: any, res) => {
    try {
      let prompt = req.body.prompt;
      let modelId = req.body.modelId;
      let qtype = req.body.qtype || "q4fp16";
      let temperature = req.body.temperature;
      let top_p = req.body.top_p;
      let top_k = req.body.top_k;
      let maxTokens = req.body.maxTokens;

      let isolatedRAG = req.body.isolatedRAG;
      let ocean = req.body.ocean;

      if (typeof ocean === "string") {
        try {
          ocean = JSON.parse(ocean);
        } catch (e) {
          // ignore
        }
      }

      if (req.body.model && typeof req.body.model === "object") {
        modelId = req.body.model.id || modelId;
        qtype = req.body.model.qtype || qtype;
        temperature = req.body.model.temperature ?? temperature;
        top_p = req.body.model.top_p ?? top_p;
        top_k = req.body.model.top_k ?? top_k;
        maxTokens = req.body.model.maxTokens ?? maxTokens;
      }

      if (qtype === "q4fp16") {
        qtype = "q4f16";
      }

      if (!ocean) {
        const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = req.body;
        if (openness !== undefined || conscientiousness !== undefined || extraversion !== undefined || agreeableness !== undefined || neuroticism !== undefined) {
          ocean = {
            openness: openness !== undefined ? Number(openness) : undefined,
            conscientiousness: conscientiousness !== undefined ? Number(conscientiousness) : undefined,
            extraversion: extraversion !== undefined ? Number(extraversion) : undefined,
            agreeableness: agreeableness !== undefined ? Number(agreeableness) : undefined,
            neuroticism: neuroticism !== undefined ? Number(neuroticism) : undefined
          };
        }
      }

      const file = req.file;
      if (!file) return res.status(400).json({ error: "Image is required" });

      const origin = req.headers.origin || req.headers.referer || "unknown";
      const reqId = req.body?.reqId || req.query?.reqId || req.headers?.["x-req-id"] || req.headers?.["reqid"];
      
      console.log(`\n🚀 [API] Processing Vision Request [reqId: ${reqId || 'none'}]`);
      console.log(`   - Model: ${modelId || 'auto-selected (default)'}`);
      console.log(`   - Origin: ${origin}`);
      
      const base64Image = `data:image/jpeg;base64,${file.buffer.toString('base64')}`;
      const response = await dispatchTask("vision", base64Image, { 
        prompt, 
        modelId, 
        qtype, 
        origin, 
        reqId, 
        temperature, 
        top_p, 
        top_k, 
        maxTokens,
        isolatedRAG,
        ocean,
        isLocalHost: checkIsLocalHost(req),
        abortSignal: (req as any).abortSignal
      });

      let cleanResponse = response;
      let thinkText: string | undefined = undefined;
      
      if (typeof response === "string") {
        const thinkRegex = /<think>([\s\S]*?)(?:<\/think>|$)/i;
        const match = response.match(thinkRegex);
        if (match) {
          thinkText = match[1].trim();
          cleanResponse = response.replace(thinkRegex, "").trim();
          if (!cleanResponse) {
            cleanResponse = thinkText;
            thinkText = undefined;
          }
        } else {
          const thoughtRegex = /<\|channel>thought\n([\s\S]*?)(?:<channel\|>|$)/i;
          const thoughtMatch = response.match(thoughtRegex);
          if (thoughtMatch) {
            thinkText = thoughtMatch[1].trim();
            cleanResponse = response.replace(thoughtRegex, "").trim();
            if (!cleanResponse) {
              cleanResponse = thinkText;
              thinkText = undefined;
            }
          }
        }
      }

      if (thinkText !== undefined) {
        res.json({ response: cleanResponse, think: thinkText });
      } else {
        res.json({ response });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Speech-to-Text
  function sanitizeSttOutput(text: string): string {
    if (!text) return "";
    const sanitized = text
      .replace(/\bi['’]?m\s+next\b/gi, "Omnix")
      .replace(/\bi['’]?m\s+nix\b/gi, "Omnix");
    
    const trimmed = sanitized.trim().toLowerCase().replace(/[.,?!]/g, "");
    if (trimmed === "you") {
      return "";
    }
    return sanitized;
  }

  app.post("/api/stt", upload.single("audio"), async (req: any, res) => {
    try {
      const file = req.file;
      if (!file) return res.status(400).json({ error: "Audio file is required" });
      
      const origin = req.headers.origin || req.headers.referer || "unknown";
      const reqId = req.body?.reqId || req.query?.reqId || req.headers?.["x-req-id"] || req.headers?.["reqid"];
      
      console.log(`\n🚀 [API] Processing STT Request [reqId: ${reqId || 'none'}]`);
      console.log(`   - Model: auto-selected (default stt)`);
      console.log(`   - Origin: ${origin}`);
      
      const base64Audio = file.buffer.toString('base64');
      const text = await dispatchTask("stt", base64Audio, { origin, reqId, isLocalHost: checkIsLocalHost(req), abortSignal: (req as any).abortSignal });

      let sanitizedText = text;
      if (typeof text === "string") {
        sanitizedText = sanitizeSttOutput(text);
      } else if (text && typeof text === "object" && (text as any).text !== undefined) {
        (text as any).text = sanitizeSttOutput((text as any).text);
        sanitizedText = text;
      }

      const finalOutput = typeof sanitizedText === "string" ? sanitizedText : (sanitizedText?.text || sanitizedText);
      res.json({ text: finalOutput });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  function encodeWAV(samples: number[], sampleRate: number = 24000): Buffer {
    const buffer = Buffer.alloc(44 + samples.length * 2);
    
    // RIFF identifier
    buffer.write('RIFF', 0);
    // file length minus RIFF header
    buffer.writeUInt32LE(36 + samples.length * 2, 4);
    // RIFF type
    buffer.write('WAVE', 8);
    // format chunk identifier
    buffer.write('fmt ', 12);
    // format chunk length
    buffer.writeUInt32LE(16, 16);
    // sample format (raw PCM = 1)
    buffer.writeUInt16LE(1, 20);
    // channel count (mono = 1)
    buffer.writeUInt16LE(1, 22);
    // sample rate
    buffer.writeUInt32LE(sampleRate, 24);
    // byte rate (sample rate * block align)
    buffer.writeUInt32LE(sampleRate * 2, 28);
    // block align (channel count * bytes per sample)
    buffer.writeUInt16LE(2, 32);
    // bits per sample (16-bit)
    buffer.writeUInt16LE(16, 34);
    // data chunk identifier
    buffer.write('data', 36);
    // data chunk length
    buffer.writeUInt32LE(samples.length * 2, 40);

    let offset = 44;
    for (let i = 0; i < samples.length; i++) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      const intSample = s < 0 ? s * 0x8000 : s * 0x7FFF;
      buffer.writeInt16LE(Math.floor(intSample), offset);
      offset += 2;
    }

    return buffer;
  }

  // Text-to-Speech
  app.post("/api/tts", async (req, res) => {
    try {
      const { text, voiceID, voiceId, modelId, format } = req.body;
      if (!text) return res.status(400).json({ error: "Text is required" });

      const origin = req.headers.origin || req.headers.referer || "unknown";
      const reqId = req.body?.reqId || req.query?.reqId || req.headers?.["x-req-id"] || req.headers?.["reqid"];
      
      const selectedVoice = voiceID || voiceId || modelId || "af_heart";

      console.log(`\n🚀 [API] Processing TTS Request [reqId: ${reqId || 'none'}]`);
      console.log(`   - Voice Model: ${selectedVoice}`);
      console.log(`   - Origin: ${origin}`);

      const output = await dispatchTask("tts", text, { voiceID: selectedVoice, origin, reqId, isLocalHost: checkIsLocalHost(req), abortSignal: (req as any).abortSignal });
      
      if (output && output.audio) {
        const samples = Array.isArray(output.audio) ? output.audio : Object.values(output.audio) as number[];
        const sampleRate = output.sampling_rate || 24000;
        const wavBuffer = encodeWAV(samples, sampleRate);
        
        const wantWav = format === "wav" || req.query?.format === "wav" || req.headers.accept?.includes("audio/wav");
        
        if (wantWav) {
          res.setHeader("Content-Type", "audio/wav");
          res.setHeader("Content-Disposition", "attachment; filename=\"speech.wav\"");
          return res.send(wavBuffer);
        } else {
          return res.json({
            audio: samples,
            sampling_rate: sampleRate,
            wav_base64: wavBuffer.toString("base64")
          });
        }
      }
      
      res.json(output);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Image Generation
  app.post("/api/image", async (req, res) => {
    try {
      let prompt = req.body.prompt;
      let modelId = req.body.modelId;
      let qtype = req.body.qtype || "q4fp16";

      if (req.body.model && typeof req.body.model === "object") {
        modelId = req.body.model.id || modelId;
        qtype = req.body.model.qtype || qtype;
      }

      if (qtype === "q4fp16") {
        qtype = "q4f16";
      }

      if (!prompt) return res.status(400).json({ error: "Prompt is required" });

      const origin = req.headers.origin || req.headers.referer || "unknown";
      const reqId = req.body?.reqId || req.query?.reqId || req.headers?.["x-req-id"] || req.headers?.["reqid"];
      
      console.log(`\n🚀 [API] Processing Image Gen Request [reqId: ${reqId || 'none'}]`);
      console.log(`   - Model: ${modelId || 'auto-selected (default)'}`);
      console.log(`   - Origin: ${origin}`);
      
      const image = await dispatchTask("image-gen", prompt, { modelId, qtype, origin, reqId, isLocalHost: checkIsLocalHost(req), abortSignal: (req as any).abortSignal });
      
      let finalImage = image;
      if (image && image.__serialized_type__ === "RawImage" && image.data) {
        const width = image.width;
        const height = image.height;
        const numPixels = width * height;
        const rawData = image.data;
        let rgbaData: Buffer;
        
        if (rawData.length === numPixels * 4) {
          rgbaData = Buffer.from(rawData);
        } else if (rawData.length === numPixels * 3) {
          rgbaData = Buffer.alloc(numPixels * 4);
          for (let i = 0; i < numPixels; ++i) {
            rgbaData[i * 4] = rawData[i * 3];
            rgbaData[i * 4 + 1] = rawData[i * 3 + 1];
            rgbaData[i * 4 + 2] = rawData[i * 3 + 2];
            rgbaData[i * 4 + 3] = 255;
          }
        } else if (rawData.length === numPixels) {
          rgbaData = Buffer.alloc(numPixels * 4);
          for (let i = 0; i < numPixels; ++i) {
            const val = rawData[i];
            rgbaData[i * 4] = val;
            rgbaData[i * 4 + 1] = val;
            rgbaData[i * 4 + 2] = val;
            rgbaData[i * 4 + 3] = 255;
          }
        } else {
          rgbaData = Buffer.alloc(numPixels * 4);
          const copyLen = Math.min(rawData.length, numPixels * 4);
          rgbaData.set(Buffer.from(rawData.slice(0, copyLen)));
          for (let i = Math.floor(copyLen / 4); i < numPixels; ++i) {
            rgbaData[i * 4 + 3] = 255;
          }
        }
        
        try {
          const pngBuffer = await sharp(rgbaData, {
            raw: {
              width,
              height,
              channels: 4
            }
          }).png().toBuffer();
          finalImage = "data:image/png;base64," + pngBuffer.toString('base64');
        } catch (e) {
          console.error("Failed to process RawImage with sharp:", e);
        }
      }

      res.json({ status: "success", image: finalImage });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Music Generation
  app.post("/api/music", async (req, res) => {
    try {
      let prompt = req.body.prompt;
      let modelId = req.body.modelId;
      let qtype = req.body.qtype || "q4fp16";
      let maxTokens = req.body.maxTokens;

      if (req.body.model && typeof req.body.model === "object") {
        modelId = req.body.model.id || modelId;
        qtype = req.body.model.qtype || qtype;
        maxTokens = req.body.model.maxTokens ?? maxTokens;
      }

      if (qtype === "q4fp16") {
        qtype = "q4f16";
      }

      if (!prompt) return res.status(400).json({ error: "Prompt is required" });

      const origin = req.headers.origin || req.headers.referer || "unknown";
      const reqId = req.body?.reqId || req.query?.reqId || req.headers?.["x-req-id"] || req.headers?.["reqid"];
      
      console.log(`\n🚀 [API] Processing Music Gen Request [reqId: ${reqId || 'none'}]`);
      console.log(`   - Model: ${modelId || 'auto-selected (default)'}`);
      console.log(`   - Origin: ${origin}`);
      
      const output = await dispatchTask("music-gen", prompt, { modelId, qtype, origin, reqId, maxTokens, isLocalHost: checkIsLocalHost(req), abortSignal: (req as any).abortSignal });
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
    let distPath: string;
    if (resolvedFilename.endsWith("server.cjs")) {
      distPath = resolvedDirname;
    } else {
      distPath = path.join(resolvedDirname, "dist");
    }
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

  server.listen(PORT, HOST, async () => {
    console.log(`🚀 Omnix Brain Active [PID: ${process.pid}] on port ${PORT}`);
    console.log(`🤖 Local API available at http://${HOST === "0.0.0.0" ? "0.0.0.0" : "127.0.0.1"}:${PORT}/api`);
    if (HOST === "127.0.0.1") {
      console.log(`🔒 Secure Local-Only Mode active (connections restricted to localhost).`);
      console.log(`💡 To allow other network/global devices to connect, run with ALLOW_REMOTE=true or add "allowRemote": true in omnix-config.json`);
    } else {
      console.log(`🌍 LAN/WAN Remote Access Mode active (listening on all network interfaces).`);
    }
    
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
