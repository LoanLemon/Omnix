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
import { setupWebSockets, dispatchTask, handleHealthCheck, archiveReqIdHistory, purgeReqIdHistory, abortAllTasksAndUnloadWorkers } from "./src/engine/socketHandler.ts";
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

  // --- LOG WATCHER ENGINE ---
  interface WatchedFileState {
    filepath: string;
    oldContents: string;
  }
  const watchedFilesStates: { [path: string]: WatchedFileState } = {};

  const getLogWatcherConfigPath = () => path.join(process.cwd(), "log-watcher-config.json");

  const getLogWatcherConfig = () => {
    const configPath = getLogWatcherConfigPath();
    let config = { filepaths: [] as string[], enabled: false };
    try {
      if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      }
    } catch (e) {
      // ignore
    }
    return config;
  };

  const saveLogWatcherConfig = (config: { filepaths: string[], enabled: boolean }) => {
    const configPath = getLogWatcherConfigPath();
    try {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
    } catch (e) {
      console.error("Failed to save log watcher config:", e);
    }
  };

  function cleanLogLine(line: string): string {
    let clean = line.trim();
    // Strip standard prefixes
    clean = clean.replace(/^\d{2}:\d{2}:\d{2}\s+\[\w+\]\s+\["[^"]+"\]\s*/, "");
    clean = clean.replace(/^\d{2}:\d{2}:\d{2}\s+/, "");
    clean = clean.trim();
    // Strip enclosing/trailing/leading quotes if they exist from logging wrappers
    if (clean.startsWith('"') && clean.endsWith('"')) {
      clean = clean.slice(1, -1);
    } else if (clean.startsWith('"')) {
      clean = clean.slice(1);
    } else if (clean.endsWith('"')) {
      clean = clean.slice(0, -1);
    }
    return clean.trim();
  }

  // Helper to extract JSON from strings robustly
  function extractJson(str: string): any {
    const start = str.indexOf("{");
    if (start === -1) {
      const arrayStart = str.indexOf("[");
      if (arrayStart === -1) return {};
      const end = str.lastIndexOf("]");
      if (end === -1) return [];
      try {
        return JSON.parse(str.substring(arrayStart, end + 1));
      } catch {
        return [];
      }
    }
    const end = str.lastIndexOf("}");
    if (end === -1) return {};
    try {
      return JSON.parse(str.substring(start, end + 1));
    } catch (e) {
      return {};
    }
  }

  // Process a discrete block containing OmnixLogAPI:
  async function handleLogApiBlock(filepath: string, blockLines: string[]) {
    try {
      const firstLine = blockLines[0];
      const apiMatch = firstLine.match(/OmnixLogAPI:\s*(\S+)/);
      if (!apiMatch) return;
      
      const endpoint = apiMatch[1].replace(/["';,]+$/, "").trim();
      let payloadJsonStr = "";
      let foundPayloadKeyword = false;
      let responseFileOverride = "";
      let passthruText: string | null = null;
      
      for (let i = 1; i < blockLines.length; i++) {
        const line = blockLines[i];
        
        if (line.includes("Response:")) {
          const resMatch = line.match(/Response:\s*(\S+)/);
          if (resMatch) {
            responseFileOverride = resMatch[1].replace(/["';,]+$/, "").trim();
          }
        } else if (line.includes("Passthru:")) {
          let raw = line.substring(line.indexOf("Passthru:") + 9).trim();
          if (raw.includes('\\"')) {
            raw = raw.replace(/\\"/g, '"');
          }
          passthruText = JSON.stringify(raw);
        } else if (line.includes("Payload:")) {
          foundPayloadKeyword = true;
          payloadJsonStr = line.substring(line.indexOf("Payload:") + 8).trim();
        } else if (foundPayloadKeyword && !line.includes("Response:") && !line.includes("OmnixLogAPI:") && !line.includes("Passthru:")) {
          payloadJsonStr += "\n" + line;
        }
      }
      
      let apiResponseText = "";
      if (endpoint === "RESET") {
        console.log(`🧹 [LogWatcher] Reset command detected. Clearing OmnixResponse.`);
        apiResponseText = "";
      } else {
        const payload = extractJson(payloadJsonStr);
        const targetUrl = `http://127.0.0.1:${PORT}${endpoint}`;
        console.log(`📡 [LogWatcher] Dispatching log API request to ${endpoint} with payload`, payload);
        
        try {
          const res = await fetch(targetUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify(payload)
          });
          apiResponseText = await res.text();
        } catch (err: any) {
          apiResponseText = JSON.stringify({ error: `Local API request failed: ${err.message}` });
        }
      }
      
      // Determine response output file path
      let responsePath = "";
      if (responseFileOverride) {
        if (path.isAbsolute(responseFileOverride)) {
          responsePath = responseFileOverride;
        } else {
          const logDir = path.dirname(filepath);
          responsePath = path.join(logDir, responseFileOverride);
        }
      } else {
        // Default: [original_log_filepath]_omnixResponse.txt
        responsePath = filepath + "_omnixResponse.txt";
      }
      
      // Ensure containing directory exists
      const responseDir = path.dirname(responsePath);
      if (!fs.existsSync(responseDir)) {
        fs.mkdirSync(responseDir, { recursive: true });
      }
      
      // WRITE RESPONSE (WITH JS FILE LOGIC OVERRIDE!)
      const isJsOrTs = responsePath.toLowerCase().endsWith(".js") || responsePath.toLowerCase().endsWith(".ts");
      if (isJsOrTs) {
        let fileContent = "";
        if (fs.existsSync(responsePath)) {
          fileContent = fs.readFileSync(responsePath, "utf8");
        }
        
        const variableRegex = /(let|const|var)\s+OmnixResponse\s*=\s*(['"`])([\s\S]*?)\2(;?)/;
        const escapedResponse = JSON.stringify(apiResponseText);
        
        if (variableRegex.test(fileContent)) {
          fileContent = fileContent.replace(variableRegex, `$1 OmnixResponse = ${escapedResponse}$4`);
        } else {
          fileContent = `let OmnixResponse = ${escapedResponse};\n` + fileContent;
        }

        // Handle Passthru parameter if present
        if (passthruText !== null) {
          const passthruRegex = /(let|const|var)\s+OmnixPassthru\s*=\s*(['"`])([\s\S]*?)\2(;?)/;
          if (passthruRegex.test(fileContent)) {
            fileContent = fileContent.replace(passthruRegex, `$1 OmnixPassthru = ${passthruText}$4`);
          } else {
            fileContent = `let OmnixPassthru = ${passthruText};\n` + fileContent;
          }
        }
        
        fs.writeFileSync(responsePath, fileContent, "utf8");
        if (endpoint === "RESET") {
          console.log(`🧹 [LogWatcher] Cleared OmnixResponse in JS file: ${responsePath}`);
        } else {
          console.log(`✅ [LogWatcher] Appended/replaced OmnixResponse in JS file: ${responsePath}`);
        }
      } else {
        // Pretty print JSON if applicable for other files
        let formattedResponse = apiResponseText;
        try {
          const parsed = JSON.parse(apiResponseText);
          formattedResponse = JSON.stringify(parsed, null, 2);
        } catch {
          // Keep as raw text
        }
        fs.writeFileSync(responsePath, formattedResponse, "utf8");
        console.log(`✅ [LogWatcher] Wrote response to: ${responsePath}`);
      }
    } catch (err: any) {
      console.error("Error handling log API block:", err);
    }
  }

  // Parse lines for OmnixLogAPI requests
  async function processLogAPIRequests(filepath: string, updatedContents: string) {
    // Replace both actual newlines and literal \n sequences with actual newlines
    const normalized = updatedContents
      .replace(/\\r\\n/g, "\n")
      .replace(/\\r/g, "\n")
      .replace(/\\n/g, "\n")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n");
      
    const rawLines = normalized.split("\n");
    let currentBlock: string[] = [];
    
    for (const rawLine of rawLines) {
      const cleaned = cleanLogLine(rawLine);
      if (cleaned.includes("OmnixLogAPI:")) {
        if (currentBlock.length > 0) {
          await handleLogApiBlock(filepath, currentBlock);
          currentBlock = [];
        }
        currentBlock.push(cleaned);
      } else if (currentBlock.length > 0) {
        currentBlock.push(cleaned);
      }
    }
    if (currentBlock.length > 0) {
      await handleLogApiBlock(filepath, currentBlock);
    }
  }

  // Polling loop to check for log file updates
  async function pollWatchedFiles() {
    const config = getLogWatcherConfig();
    if (!config.enabled || !config.filepaths || config.filepaths.length === 0) {
      return;
    }
    
    for (const filepath of config.filepaths) {
      try {
        if (!fs.existsSync(filepath)) {
          continue;
        }
        const newContents = fs.readFileSync(filepath, "utf8");
        const state = watchedFilesStates[filepath];
        if (!state) {
          watchedFilesStates[filepath] = {
            filepath,
            oldContents: newContents
          };
          continue;
        }
        
        if (newContents.length > state.oldContents.length) {
          const updatedContents = newContents.substring(state.oldContents.length);
          state.oldContents = newContents;
          
          if (updatedContents.includes("OmnixLogAPI:")) {
            console.log(`🎙️ [LogWatcher] Change detected in watched file: ${filepath}`);
            await processLogAPIRequests(filepath, updatedContents);
          }
        } else if (newContents.length < state.oldContents.length) {
          state.oldContents = newContents;
        }
      } catch (err: any) {
        console.error(`Error polling log file ${filepath}:`, err.message);
      }
    }
  }

  // Start polling every 1.5 seconds
  setInterval(() => {
    pollWatchedFiles().catch((err) => {
      console.error("Error in log watcher loop:", err);
    });
  }, 1500);

  // --- Log Watcher endpoints ---
  app.get("/api/log-watcher/config", (req, res) => {
    res.json(getLogWatcherConfig());
  });

  app.post("/api/log-watcher/config", (req, res) => {
    try {
      const { filepaths, enabled } = req.body;
      if (!Array.isArray(filepaths) || typeof enabled !== "boolean") {
        return res.status(400).json({ error: "Invalid body schema" });
      }
      
      const config = { filepaths, enabled };
      saveLogWatcherConfig(config);
      
      for (const filepath of filepaths) {
        if (!watchedFilesStates[filepath]) {
          try {
            if (fs.existsSync(filepath)) {
              watchedFilesStates[filepath] = {
                filepath,
                oldContents: fs.readFileSync(filepath, "utf8")
              };
            }
          } catch (e) {
            // ignore
          }
        }
      }
      
      res.json({ success: true, config });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Health check
  app.all("/api/health", async (req, res) => {
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
      let prompt = req.body.prompt || req.body.text || req.body.input || req.body.message;
      let systemPrompt = req.body.systemPrompt || req.body.system_prompt || req.body["System Prompt"] || req.body["system-prompt"];
      let modelId = req.body.modelId || req.body.model_id || req.body.textModelId || req.body.text_model_id || req.body.model;
      let qtype = req.body.qtype || req.body.q_type || req.body.precision || "q4fp16";
      let temperature = req.body.temperature || req.body.temp;
      let top_p = req.body.top_p || req.body.topP;
      let top_k = req.body.top_k || req.body.topK;
      let maxTokens = req.body.maxTokens || req.body.max_tokens || req.body.max_new_tokens;

      let isolatedRAG = req.body.isolatedRAG || req.body.isolated_rag || req.body.isolatedRag;
      let ocean = req.body.ocean || req.body.ocean_traits;

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
      const turbo = req.body.turbo === true || req.body.turbo === "true" || req.query.turbo === "true";
      
      console.log(`\n🚀 [API] Processing Text Request [reqId: ${reqId || 'none'}] (Turbo: ${turbo})`);
      console.log(`   - Model: ${modelId || 'auto-selected (default)'}`);
      console.log(`   - Origin: ${origin}`);
      
      let output: string;
      if (turbo) {
        console.log(`⚡ [Turbo Mode] running model native inference in Node.js...`);
        const { runNodeTextInference } = await import("./src/engine/nodeEngine.ts");
        
        let chatHistory = req.body.chatHistory || req.body.history;
        if (!chatHistory && reqId) {
          const { reqIdChatHistories } = await import("./src/engine/socketHandler.ts");
          chatHistory = reqIdChatHistories.get(String(reqId));
        }

        output = await runNodeTextInference(prompt, {
          systemPrompt,
          modelId,
          temperature,
          top_p,
          top_k,
          maxTokens,
          chatHistory
        });

        // Update server-side history so other parts of the session can access it
        if (reqId) {
          const { reqIdChatHistories } = await import("./src/engine/socketHandler.ts");
          let history = reqIdChatHistories.get(String(reqId)) || [];
          if (history.length === 0) {
            if (systemPrompt) {
              history.push({ role: "system", content: systemPrompt });
            }
            history.push({ role: "user", content: prompt });
          } else {
            const lastMsg = history[history.length - 1];
            if (!lastMsg || lastMsg.content !== prompt) {
              history.push({ role: "user", content: prompt });
            }
          }
          history.push({ role: "assistant", content: output });
          reqIdChatHistories.set(String(reqId), history);
        }
      } else {
        output = await dispatchTask("text", prompt, { 
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
      }
      
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
      const turbo = req.body.turbo === true || req.body.turbo === "true" || req.query.turbo === "true";
      
      console.log(`\n🚀 [API] Processing Director Request [reqId: ${reqId || 'none'}] (Turbo: ${turbo})`);
      console.log(`   - Origin: ${origin}`);
      
      let intent: string;
      if (turbo) {
        console.log(`⚡ [Turbo Mode] running director native inference in Node.js...`);
        const { runNodeTextInference } = await import("./src/engine/nodeEngine.ts");
        intent = await runNodeTextInference(prompt, {
          systemPrompt: "You are a routing intent classifier. Analyze the user request and return the most appropriate category.",
          modelId: req.body.modelId || "qwen-2.5-Instruct-abliterated-0.5b-q4",
          temperature: 0.1,
          maxTokens: 16
        });
      } else {
        intent = await dispatchTask("director", prompt, { origin, reqId, isLocalHost: checkIsLocalHost(req), abortSignal: (req as any).abortSignal });
      }
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

  // Wait Voice - triggers local mic capture on worker, waits, transcribes, and returns the STT output
  app.all(["/api/waitVoice", "/api/wait-voice"], async (req, res) => {
    if (req.method !== "POST" && req.method !== "GET") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }
    try {
      const origin = req.headers.origin || req.headers.referer || "unknown";
      const reqId = req.body?.reqId || req.query?.reqId || req.headers?.["x-req-id"] || req.headers?.["reqid"];
      const maxDuration = req.body?.maxDuration || req.query?.maxDuration || req.body?.duration || req.query?.duration;
      const silenceDuration = req.body?.silenceDuration || req.query?.silenceDuration;
      const silenceThreshold = req.body?.silenceThreshold || req.query?.silenceThreshold;

      console.log(`\n🎙️ [API] Processing WaitVoice Request [reqId: ${reqId || 'none'}]`);
      console.log(`   - Origin: ${origin}`);

      const text = await dispatchTask("wait-voice", {
        maxDuration: maxDuration ? Number(maxDuration) : undefined,
        silenceDuration: silenceDuration ? Number(silenceDuration) : undefined,
        silenceThreshold: silenceThreshold ? Number(silenceThreshold) : undefined
      }, {
        origin,
        reqId,
        isLocalHost: checkIsLocalHost(req),
        abortSignal: (req as any).abortSignal
      });

      res.json({ text });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AutoSTTandTTS - Complete workflow: records voice -> transcribes -> text generation -> TTS (plays live + returns response)
  app.all(["/api/auto-stt-tts", "/api/autoSTTandTTS", "/api/auto-stt-and-tts"], async (req, res) => {
    if (req.method !== "POST" && req.method !== "GET") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }
    try {
      const origin = req.headers.origin || req.headers.referer || "unknown";
      const reqId = req.body?.reqId || req.query?.reqId || req.headers?.["x-req-id"] || req.headers?.["reqid"];
      
      console.log(`\n🎙️ [API] Starting AutoSTTandTTS Workflow [reqId: ${reqId || 'none'}]`);
      console.log(`   - Origin: ${origin}`);

      // 1. STT / Microphone Recording
      const maxDuration = req.body?.maxDuration || req.query?.maxDuration || req.body?.duration || req.query?.duration;
      const silenceDuration = req.body?.silenceDuration || req.query?.silenceDuration;
      const silenceThreshold = req.body?.silenceThreshold || req.query?.silenceThreshold;

      const sttText = await dispatchTask("wait-voice", {
        maxDuration: maxDuration ? Number(maxDuration) : undefined,
        silenceDuration: silenceDuration ? Number(silenceDuration) : undefined,
        silenceThreshold: silenceThreshold ? Number(silenceThreshold) : undefined
      }, {
        origin,
        reqId,
        isLocalHost: checkIsLocalHost(req),
        abortSignal: (req as any).abortSignal
      });

      const transcribed = typeof sttText === "string" ? sttText : (sttText?.text || "");
      console.log(`   - Step 1 & 2 Completed (STT): "${transcribed}"`);

      if (!transcribed || transcribed.trim() === "") {
        console.log(`   - Workflow Aborted: No voice activity / transcription empty`);
        return res.json({
          stt: "",
          text: "",
          tts: null,
          message: "No speech detected or transcription was empty."
        });
      }

      // 2. Text Generation
      const systemPrompt = req.body?.systemPrompt || req.query?.systemPrompt || req.body?.system_prompt || req.query?.system_prompt || req.body?.["System Prompt"] || req.query?.["System Prompt"] || req.body?.["system-prompt"] || req.query?.["system-prompt"];
      const modelId = req.body?.modelId || req.query?.modelId || req.body?.textModelId || req.query?.textModelId || req.body?.model_id || req.query?.model_id || req.body?.text_model_id || req.query?.text_model_id || req.body?.model || req.query?.model;
      const qtype = req.body?.qtype || req.query?.qtype || req.body?.q_type || req.query?.q_type || req.body?.precision || req.query?.precision || "q4f16";
      const temperature = req.body?.temperature || req.query?.temperature || req.body?.temp || req.query?.temp;
      const top_p = req.body?.top_p || req.query?.top_p || req.body?.topP || req.query?.topP;
      const top_k = req.body?.top_k || req.query?.top_k || req.body?.topK || req.query?.topK;
      const maxTokens = req.body?.maxTokens || req.query?.maxTokens || req.body?.max_tokens || req.query?.max_tokens || req.body?.max_new_tokens || req.query?.max_new_tokens;
      const isolatedRAG = req.body?.isolatedRAG || req.query?.isolatedRAG || req.body?.isolated_rag || req.query?.isolated_rag || req.body?.isolatedRag || req.query?.isolatedRag;
      const ocean = req.body?.ocean || req.query?.ocean || req.body?.ocean_traits || req.query?.ocean_traits;

      console.log(`   - Step 3 (Text Generation) starting...`);
      const generatedText = await dispatchTask("text", transcribed, {
        systemPrompt,
        modelId,
        qtype,
        origin,
        reqId,
        temperature: temperature ? Number(temperature) : undefined,
        top_p: top_p ? Number(top_p) : undefined,
        top_k: top_k ? Number(top_k) : undefined,
        maxTokens: maxTokens ? Number(maxTokens) : undefined,
        isolatedRAG,
        ocean,
        isLocalHost: checkIsLocalHost(req),
        abortSignal: (req as any).abortSignal
      });

      console.log(`   - Step 3 Completed (Text Response): "${generatedText}"`);

      // Return the response immediately with stt and text
      res.json({
        stt: transcribed,
        text: generatedText
      });

      // 3. TTS Synthesis and Playback (run in background, non-blocking)
      const voiceID = req.body?.voiceID || req.query?.voiceID || req.body?.voiceId || req.query?.voiceId || req.body?.voice || req.query?.voice || "af_heart";
      const volumeVal = req.body?.volume !== undefined ? req.body.volume : req.query?.volume;
      const volume = volumeVal !== undefined ? Number(volumeVal) : undefined;

      const speedVal = req.body?.speed !== undefined ? req.body.speed : (req.query?.speed !== undefined ? req.query.speed : (req.body?.rate !== undefined ? req.body.rate : req.query?.rate));
      const speed = speedVal !== undefined ? Number(speedVal) : undefined;

      const pitchVal = req.body?.pitch !== undefined ? req.body.pitch : req.query?.pitch;
      const pitch = pitchVal !== undefined ? Number(pitchVal) : undefined;

      console.log(`   - Step 4 (TTS & Playback) starting with voice ${voiceID}, volume ${volume !== undefined ? volume : "default"}, speed ${speed !== undefined ? speed : "default"}, pitch ${pitch !== undefined ? pitch : "default"}... (Async/Non-blocking)`);
      dispatchTask("tts", generatedText, {
        voiceID,
        origin,
        reqId,
        play: true, // triggers the play logic we added to useSocketInference.ts
        volume,
        speed,
        pitch,
        isLocalHost: checkIsLocalHost(req)
      }).then(() => {
        console.log(`   - Async TTS Synthesis Completed successfully`);
      }).catch(err => {
        console.error("❌ Async TTS failed:", err);
      });
    } catch (error: any) {
      console.error("❌ AutoSTTandTTS workflow error:", error);
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
  interface TtsCacheEntry {
    output: {
      audio: number[];
      sampling_rate: number;
    };
    timestamp: number;
  }

  const ttsCache = new Map<string, TtsCacheEntry>();
  const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache TTL

  function cleanTtsCache() {
    const now = Date.now();
    for (const [key, entry] of ttsCache.entries()) {
      if (now - entry.timestamp > CACHE_TTL_MS) {
        ttsCache.delete(key);
      }
    }
  }

  app.post("/api/tts", async (req, res) => {
    try {
      const { text, voiceID, voiceId, modelId, format } = req.body;
      if (!text) return res.status(400).json({ error: "Text is required" });

      const origin = req.headers.origin || req.headers.referer || "unknown";
      const reqId = req.body?.reqId || req.query?.reqId || req.headers?.["x-req-id"] || req.headers?.["reqid"];
      
      const selectedVoice = voiceID || voiceId || modelId || "af_heart";

      const speedVal = req.body?.speed !== undefined ? req.body.speed : (req.query?.speed !== undefined ? req.query.speed : (req.body?.rate !== undefined ? req.body.rate : req.query?.rate));
      const speed = speedVal !== undefined ? Number(speedVal) : undefined;

      const pitchVal = req.body?.pitch !== undefined ? req.body.pitch : req.query?.pitch;
      const pitch = pitchVal !== undefined ? Number(pitchVal) : undefined;

      const volumeVal = req.body?.volume !== undefined ? req.body.volume : req.query?.volume;
      const volume = volumeVal !== undefined ? Number(volumeVal) : undefined;

      const hasFormat = (format !== undefined && format !== "") || (req.query?.format !== undefined && req.query?.format !== "");

      console.log(`\n🚀 [API] Processing TTS Request [reqId: ${reqId || 'none'}]`);
      console.log(`   - Voice Model: ${selectedVoice}`);
      console.log(`   - Origin: ${origin}`);
      console.log(`   - Speed: ${speed !== undefined ? speed : "default"}`);
      console.log(`   - Pitch: ${pitch !== undefined ? pitch : "default"}`);
      console.log(`   - Volume: ${volume !== undefined ? volume : "default"}`);
      console.log(`   - Play Natively (No format): ${!hasFormat}`);

      // Cache key includes: text (cleaned), voice, pitch, speed
      const cacheKey = JSON.stringify({
        text: text.trim(),
        voiceId: selectedVoice,
        pitch: pitch !== undefined ? Number(pitch) : null,
        speed: speed !== undefined ? Number(speed) : null
      });

      cleanTtsCache();
      const cached = ttsCache.get(cacheKey);

      if (cached) {
        console.log(`🎯 [TTS CACHE] Hit! Replaying from cache. Key: ${cacheKey}`);
        const cachedOutput = cached.output;

        if (!hasFormat) {
          // Play the cached audio natively via websocket task dispatch
          await dispatchTask("tts", text, { 
            voiceID: selectedVoice, 
            origin, 
            reqId, 
            speed, 
            pitch, 
            volume,
            play: true,
            cachedAudio: cachedOutput.audio,
            samplingRate: cachedOutput.sampling_rate,
            isLocalHost: checkIsLocalHost(req), 
            abortSignal: (req as any).abortSignal 
          });
          return res.json({});
        }

        const samples = cachedOutput.audio;
        const sampleRate = cachedOutput.sampling_rate;
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

      // Cache miss - execute live task
      const output = await dispatchTask("tts", text, { 
        voiceID: selectedVoice, 
        origin, 
        reqId, 
        speed, 
        pitch, 
        volume,
        play: !hasFormat,
        isLocalHost: checkIsLocalHost(req), 
        abortSignal: (req as any).abortSignal 
      });

      if (output && output.audio) {
        const samples = Array.isArray(output.audio) ? output.audio : Object.values(output.audio) as number[];
        const sampleRate = output.sampling_rate || 24000;

        // Populate cache
        ttsCache.set(cacheKey, {
          output: {
            audio: samples,
            sampling_rate: sampleRate
          },
          timestamp: Date.now()
        });

        if (!hasFormat) {
          return res.json({});
        }

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

  // Abort (Clears all queues and unloads/respawns workers)
  app.all("/api/abort", async (req, res) => {
    try {
      ttsCache.clear();
      abortAllTasksAndUnloadWorkers();
      res.json({ success: true, message: "Queues cleared and workers unloaded/respawning." });
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

  // Research Scraping Proxy (Avoids browser CORS/webview limits and speeds up search)
  app.post("/api/research", async (req, res) => {
    try {
      const { url, isInitialSearch } = req.body;
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      console.log(`🔍 [API] Research Tool: Fetching ${url}`);

      // Modify DuckDuckGo URL to use the html-only version if we are on the server side
      // as it's 10x faster and doesn't require JS execution!
      let targetUrl = url;
      if (url.includes("duckduckgo.com") && !url.includes("html.duckduckgo.com")) {
        targetUrl = url.replace("duckduckgo.com", "html.duckduckgo.com/html");
      }

      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5"
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      
      // Extract clean text from HTML
      const cleanHtml = (rawHtml: string): string => {
        return rawHtml
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]*>/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      };
      const text = cleanHtml(html);
      let results: { title: string, url: string }[] = [];

      const cleanUrl = (href: string): string => {
        if (!href) return "";
        let clean = href;
        if (clean.startsWith("//")) {
          clean = "https:" + clean;
        }
        if (clean.includes("uddg=")) {
          try {
            const urlObj = new URL(clean.startsWith("http") ? clean : "https://duckduckgo.com" + clean);
            const uddg = urlObj.searchParams.get("uddg");
            if (uddg) {
              clean = uddg;
            }
          } catch (e) {
            const m = clean.match(/[?&]uddg=([^&]+)/);
            if (m) {
              clean = decodeURIComponent(m[1]);
            }
          }
        }
        return clean;
      };

      const isInternalUrl = (u: string): boolean => {
        const lower = u.toLowerCase();
        return (
          (lower.includes("duckduckgo.com") && !lower.includes("uddg=")) ||
          lower.includes("yandex.com") ||
          lower.includes("google.com") ||
          lower.startsWith("/") ||
          lower.startsWith("#") ||
          lower.includes("javascript:")
        );
      };

      if (isInitialSearch) {
        // Try parsing DuckDuckGo HTML result-link titles & urls
        const ddgRegex = /<a[^>]+class="[^"]*(result__snippet|result__url|result__link)[^"]*"[^>]* href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
        let match;
        while ((match = ddgRegex.exec(html)) !== null) {
          const rawUrl = match[2];
          const url = cleanUrl(rawUrl);
          const title = match[3].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
          if (title && url && !isInternalUrl(url) && !results.some(r => r.title === title || r.url === url)) {
            results.push({ title, url });
          }
        }

        // General result__url titles as fallback
        if (results.length === 0) {
          const titleRegex = /<a[^>]+class="[^"]*result__url[^"]*"[^+]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
          while ((match = titleRegex.exec(html)) !== null) {
            const rawUrl = match[1];
            const url = cleanUrl(rawUrl);
            const title = match[2].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
            if (title && url && !isInternalUrl(url) && !results.some(r => r.title === title || r.url === url)) {
              results.push({ title, url });
            }
          }
        }

        // Fallback for anchors if still empty
        if (results.length === 0) {
          const generalRegex = /<a\s+[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
          let matchCount = 0;
          while ((match = generalRegex.exec(html)) !== null && matchCount < 20) {
            const rawUrl = match[1];
            const url = cleanUrl(rawUrl);
            const innerText = match[2].replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
            if (innerText.length > 15 && url && !isInternalUrl(url) && !innerText.toLowerCase().includes("privacy") && !innerText.toLowerCase().includes("terms")) {
              if (!results.some(r => r.title === innerText || r.url === url)) {
                results.push({ title: innerText, url });
                matchCount++;
              }
            }
          }
        }
        
        console.log(`🔍 [API] Scraped ${results.length} search results with URLs`);
      }

      res.json({ text, results });
    } catch (error: any) {
      console.error(`💥 [API] Research error:`, error.message);
      res.json({ text: "", results: [] }); // Fallback graceful response
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
