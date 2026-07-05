import { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { stringify as masonStringify } from "mason-parser";

interface PendingAuth {
  resolve: (allowed: boolean) => void;
  webdomain: string;
  category: string;
}

const pendingAuths = new Map<string, PendingAuth>();
const reqIdChatHistories = new Map<string, Array<{ role: "system" | "user" | "assistant"; content: string }>>();
const allowedOnceGrace = new Set<string>();

const PERMISSIONS_FILE = path.join(process.cwd(), "permissions.json");
let permissions: Record<string, "allow" | "deny"> = {};

function loadPermissions() {
  try {
    if (fs.existsSync(PERMISSIONS_FILE)) {
      permissions = JSON.parse(fs.readFileSync(PERMISSIONS_FILE, "utf-8"));
    }
  } catch (e) {
    console.warn("⚠️ permissions.json not found or corrupted, starting with clean rules.");
  }
}

function savePermissions() {
  try {
    fs.writeFileSync(PERMISSIONS_FILE, JSON.stringify(permissions, null, 2), "utf-8");
  } catch (e) {
    console.error("❌ Failed to save domain permissions:", e);
  }
}

// Initial load of server permissions
loadPermissions();

interface Worker {
  id: string;
  type: "browser" | "electron";
  ws: any;
  activeTasks: number;
  maxTasks: number;
  capabilities: string[];
  lastSeen: number;
}

interface PendingTask {
  requestId: string;
  category: string;
  input: any;
  options: any;
  resolve: (data: any) => void;
  reject: (err: any) => void;
  onUpdate?: (data: any) => void;
  timeout: NodeJS.Timeout;
  workerId: string | null;
  retries: number;
  priority: number;
  createdAt: number;
}

const pendingTasks = new Map<string, PendingTask>();
let workers: Worker[] = [];
const taskQueue: { category: string; input: any; options: any; resolve: any; reject: any; onUpdate?: (data: any) => void; requestId: string; priority: number; createdAt: number; retries: number }[] = [];

const MAX_QUEUE_SIZE = 1000;
const MAX_WAIT_TIME = 300000; // 5 minutes in queue max

function broadcastNetworkStats(wss: WebSocketServer | null) {
  if (!wss) return;
  const stats = {
    type: "NETWORK_STATS",
    workerCount: workers.length,
    activeTasks: Array.from(pendingTasks.values()).length,
    timestamp: Date.now()
  };
  const payload = JSON.stringify(stats);
  wss.clients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(payload);
    }
  });
}

// Cleanup stale workers every 5 seconds
let globalWss: WebSocketServer | null = null;
setInterval(() => {
  const now = Date.now();
  
  // 1. Clean stale workers
  const staleWorkers = workers.filter(w => now - w.lastSeen > 15000);
  if (staleWorkers.length > 0) {
    console.log(`🔌 Cleaning up ${staleWorkers.length} stale workers`);
    staleWorkers.forEach(sw => {
      pendingTasks.forEach((task, id) => {
        if (task.workerId === sw.id) {
          requeueTask(task);
        }
      });
      sw.ws.terminate();
    });
    workers = workers.filter(w => now - w.lastSeen <= 15000);
    broadcastNetworkStats(globalWss);
  }

  // 2. Clean expired queue tasks
  for (let i = taskQueue.length - 1; i >= 0; i--) {
    if (now - taskQueue[i].createdAt > MAX_WAIT_TIME) {
      taskQueue[i].reject(new Error("Task expired in queue: No workers available."));
      taskQueue.splice(i, 1);
    }
  }

  if (staleWorkers.length > 0) processQueue();
}, 5000);

function requeueTask(task: any) {
  if (task.timeout) {
    clearTimeout(task.timeout);
  }
  if (task.retries < 3) {
    console.log(`🔄 Re-queueing task: ${task.requestId} (Retry ${task.retries + 1}/3)`);
    taskQueue.push({ 
      category: task.category, 
      input: task.input, 
      options: task.options, 
      resolve: task.resolve, 
      reject: task.reject, 
      requestId: task.requestId,
      priority: task.priority || 0,
      createdAt: task.createdAt,
      retries: task.retries + 1
    });
    pendingTasks.delete(task.requestId);
  } else {
    task.reject(new Error("Task failed after maximum retries."));
    pendingTasks.delete(task.requestId);
  }
}

export function setupWebSockets() {
  const wss = new WebSocketServer({ 
    noServer: true
  });
  globalWss = wss;

  console.log("📡 WebSocket Relay Server Initialized on /ws-active-compute");

  wss.on("connection", (ws: any, req: any) => {
    const workerId = uuidv4();
    let currentWorker: Worker | null = null;

    ws.on("message", (message: any) => {
      try {
        const payload = JSON.parse(message.toString());
        const { type, requestId, output, error, metadata } = payload;

        if (type === "REGISTER") {
          currentWorker = {
            id: workerId,
            type: metadata?.type || "browser",
            ws,
            activeTasks: 0,
            maxTasks: metadata?.type === "electron" ? 4 : 2,
            capabilities: metadata?.capabilities || [],
            lastSeen: Date.now()
          };
          workers.push(currentWorker);
          console.log(`🔌 Worker Registered: ${currentWorker.type} [ID: ${workerId.slice(0, 8)}]`);
          broadcastNetworkStats(wss);
          processQueue();
        }

        if (type === "HEARTBEAT") {
          if (currentWorker) {
            currentWorker.lastSeen = Date.now();
          }
        }

        if (type === "STATUS_UPDATE") {
          if (currentWorker) {
            currentWorker.activeTasks = payload.activeTasks;
            currentWorker.lastSeen = Date.now();
            processQueue();
          }
        }

        if (type === "AUTHORIZATION_RESPONSE") {
          const { authId, decision } = payload;
          const pending = pendingAuths.get(authId);
          if (pending) {
            console.log(`👤 User responded to API request authorization from domain (${pending.webdomain}): ${decision}`);
            if (decision === "always") {
              permissions[pending.webdomain] = "allow";
              savePermissions();
              pending.resolve(true);
            } else if (decision === "once") {
              if (pending.category === "health") {
                allowedOnceGrace.add(pending.webdomain);
                console.log(`🎁 Temp grace access set for domain: ${pending.webdomain}`);
              }
              pending.resolve(true);
            } else if (decision === "block_once") {
              console.log(`🛡️ User blocked this attempt from domain: ${pending.webdomain} (one-time deny)`);
              pending.resolve(false);
            } else {
              permissions[pending.webdomain] = "deny";
              savePermissions();
              pending.resolve(false);
            }
            pendingAuths.delete(authId);
          }
        }

        if (type === "TASK_UPDATE") {
          const pending = pendingTasks.get(requestId);
          if (pending && pending.onUpdate) {
            pending.onUpdate(payload.data);
          }
        }

        if (type === "TASK_RESULT") {
          if (currentWorker) {
            currentWorker.activeTasks = Math.max(0, currentWorker.activeTasks - 1);
            currentWorker.lastSeen = Date.now();
          }
          
          const pending = pendingTasks.get(requestId);
          if (pending) {
            clearTimeout(pending.timeout);
            if (error) pending.reject(new Error(error));
            else pending.resolve(output);
            pendingTasks.delete(requestId);
          }
          processQueue();
        }
      } catch (err) {
        console.error("❌ WS Message Error:", err);
      }
    });

    ws.on("close", () => {
      pendingTasks.forEach((task, id) => {
        if (task.workerId === workerId) {
          requeueTask(task);
        }
      });

      workers = workers.filter(w => w.id !== workerId);
      console.log(`🔌 Worker Disconnected: ${workerId.slice(0, 8)}`);
      broadcastNetworkStats(wss);
      processQueue();
    });
  });

  return wss;
}

function processQueue() {
  if (taskQueue.length === 0) return;

  // 1. Sort queue by priority then by time
  taskQueue.sort((a, b) => b.priority - a.priority || a.createdAt - b.createdAt);

  const getBestWorker = (category: string) => {
    const eligible = workers.filter(w => w.activeTasks < w.maxTasks);
    
    return eligible.sort((a, b) => {
      const aWeight = (a.type === "electron" ? 2 : 1) + (a.capabilities.includes("webgpu") ? 2 : 1);
      const bWeight = (b.type === "electron" ? 2 : 1) + (b.capabilities.includes("webgpu") ? 2 : 1);
      
      if (aWeight !== bWeight) return bWeight - aWeight;
      return a.activeTasks - b.activeTasks;
    })[0];
  };

  let tasksProcessed = 0;
  while (taskQueue.length > tasksProcessed) {
    const nextTask = taskQueue[tasksProcessed];
    const bestWorker = getBestWorker(nextTask.category);

    if (!bestWorker) break;

    taskQueue.splice(tasksProcessed, 1);
    
    bestWorker.activeTasks++;
    const { category, input, options, requestId, resolve, reject, retries, priority, createdAt, onUpdate } = nextTask;

    const timeout = setTimeout(() => {
      const pending = pendingTasks.get(requestId);
      if (pending) {
        pendingTasks.delete(requestId);
        reject(new Error("Task timed out: Worker stalled."));
        if (bestWorker) bestWorker.activeTasks = Math.max(0, bestWorker.activeTasks - 1);
        processQueue();
      }
    }, 180000);

    pendingTasks.set(requestId, { 
      requestId,
      category,
      input,
      options,
      resolve, 
      reject, 
      onUpdate,
      timeout,
      workerId: bestWorker.id,
      retries,
      priority,
      createdAt
    });

    bestWorker.ws.send(JSON.stringify({
      type: "REMOTE_TASK",
      requestId,
      category,
      input,
      options
    }));
  }
}

export async function dispatchTask(category: string, input: any, options: any = {}): Promise<any> {
  const rawReqId = options.reqId !== undefined && options.reqId !== null && options.reqId !== "" ? options.reqId : "0";
  const reqId = String(rawReqId);
  options.reqId = reqId;

  if (category === "text" || category === "vision" || category === "livews") {
    const history = reqIdChatHistories.get(reqId) || [];
    let userContent = "";
    if (category === "vision") {
        userContent = options.prompt || "Analyze this image";
    } else if (category === "livews") {
        userContent = input.text || (input.audio ? "[Audio Input]" : "Speak with me");
    } else {
        userContent = typeof input === "string" ? input : masonStringify(input, 0, undefined, { compact: true });
    }
    const chatHistory = [...history, { role: "user" as const, content: userContent }];
    options.chatHistory = chatHistory;
    console.log(`💬 Injected ${history.length} isolation history nodes for reqId: ${reqId}`);
  }

  // Backpressure limit
  if (taskQueue.length >= MAX_QUEUE_SIZE) {
    throw new Error("System High-Load: Task queue is full. Please try again later.");
  }

  // --- External Requester Permission Checks ---
  const origin = options.origin;
  let webdomain = "";
  if (origin && origin !== "unknown") {
    try {
      const url = new URL(origin);
      webdomain = url.hostname;
    } catch (e) {
      webdomain = origin;
    }
  }

  const isLocal = !webdomain || webdomain === "localhost" || webdomain === "127.0.0.1" || webdomain === "::1" || !!options.isLocalHost;

  if (!isLocal) {
    if (permissions[webdomain] === "deny") {
      throw new Error(`Inbound request blocked: Access from domain '${webdomain}' has been denied by policy.`);
    }

    if (permissions[webdomain] !== "allow") {
      if (allowedOnceGrace.has(webdomain)) {
        console.log(`🎁 Using temp grace access for domain: ${webdomain}`);
        allowedOnceGrace.delete(webdomain);
      } else {
        console.log(`🔐 Inbound API request from external domain '${webdomain}' detected. Prompting user...`);
        
        if (process.send) {
          console.log("Foregrounding Omnix for inbound connection approval...");
          process.send({ type: "FOREGROUND_REQUEST" });
        }

        const authId = uuidv4();
        
        const approved = await new Promise<boolean>((resolveAuth) => {
          const timeout = setTimeout(() => {
            if (pendingAuths.has(authId)) {
              console.log(`⏳ Authorization prompt from '${webdomain}' timed out.`);
              pendingAuths.delete(authId);
              resolveAuth(false);
            }
          }, 60000);

          pendingAuths.set(authId, {
            resolve: (val) => {
              clearTimeout(timeout);
              resolveAuth(val);
            },
            webdomain,
            category
          });

          // Broadcast authorization request message to GUI clients
          if (workers.length === 0) {
            console.log(`⚠️ No active GUI workers connected to authorize request from '${webdomain}'`);
            clearTimeout(timeout);
            pendingAuths.delete(authId);
            resolveAuth(false);
            return;
          }

          const msg = JSON.stringify({
            type: "AUTHORIZATION_REQUEST",
            authId,
            webdomain,
            category
          });

          workers.forEach((w) => {
            if (w.ws && w.ws.readyState === 1) {
              w.ws.send(msg);
            }
          });
        });

        if (!approved) {
          throw new Error(`Inbound request blocked: Permission from domain '${webdomain}' was rejected.`);
        }
      }
    }
  }

  if (workers.length === 0) {
    if (process.send) {
      console.log("🛠️ No workers available. Requesting Electron to spawn compute node...");
      process.send({ type: "SPAWN_WORKER" });
    }
  }

  const requestId = uuidv4();

  return new Promise((resolve, reject) => {
    const queueTimeout = setTimeout(() => {
      const idx = taskQueue.findIndex(t => t.requestId === requestId);
      if (idx >= 0) {
        taskQueue.splice(idx, 1);
        reject(new Error("No compute worker connected to process this request. Please open the Omnix GUI."));
      }
    }, 30000); 

    const handleAbort = () => {
      const idx = taskQueue.findIndex(t => t.requestId === requestId);
      if (idx >= 0) {
        taskQueue.splice(idx, 1);
        clearTimeout(queueTimeout);
        console.log(`🚫 Task ${requestId} aborted in queue by client.`);
        reject(new Error("Request aborted by client."));
      } else {
        const pending = pendingTasks.get(requestId);
        if (pending) {
          clearTimeout(pending.timeout);
          pendingTasks.delete(requestId);
          const worker = workers.find(w => w.id === pending.workerId);
          if (worker) {
            worker.ws.send(JSON.stringify({ type: "CANCEL_TASK", requestId }));
            console.log(`🚫 Task ${requestId} aborted while running. Sent CANCEL_TASK to worker.`);
            processQueue();
          }
          reject(new Error("Request aborted by client."));
        }
      }
    };

    if (options.abortSignal) {
      options.abortSignal.addEventListener("abort", handleAbort);
    }

    const cleanupAbort = () => {
      if (options.abortSignal) {
        options.abortSignal.removeEventListener("abort", handleAbort);
      }
    };

    taskQueue.push({ 
      category, 
      input, 
      options, 
      resolve: (data: any) => { 
        clearTimeout(queueTimeout); 
        cleanupAbort();
        if (reqId && (category === "text" || category === "vision" || category === "livews")) {
          const history = reqIdChatHistories.get(reqId) || [];
          let userContent = "";
          if (category === "vision") {
              userContent = options.prompt || "Analyze this image";
          } else if (category === "livews") {
              userContent = (data && data.transcribed) ? data.transcribed : (input.text || (input.audio ? "[Audio Input]" : "Speak with me"));
          } else {
              userContent = typeof input === "string" ? input : masonStringify(input, 0, undefined, { compact: true });
          }
          let assistantContent = "";
          if (typeof data === "string") {
            assistantContent = data;
          } else if (data && typeof data === "object") {
            if (category === "livews" && data.text) {
              assistantContent = data.text;
            } else {
              assistantContent = data.response || masonStringify(data, 0, undefined, { compact: true });
            }
          }
          history.push({ role: "user", content: userContent });
          history.push({ role: "assistant", content: assistantContent });
          if (history.length > 30) {
            history.splice(0, history.length - 30);
          }
          reqIdChatHistories.set(reqId, history);
          console.log(`📝 Appended interaction to isolated history for reqId: ${reqId} (new len: ${history.length})`);

          // If a reqId is a negative value, it is a temporary chat and must be purged when the chat window is closed/API response is sent.
          const nId = Number(reqId);
          if (!isNaN(nId) && nId < 0) {
            console.log(`🧹 Purging temporary isolated history for negative reqId: ${reqId}`);
            reqIdChatHistories.delete(reqId);
          }
        }
        resolve(data); 
      }, 
      reject: (err: any) => { 
        clearTimeout(queueTimeout); 
        cleanupAbort();
        if (reqId) {
          const nId = Number(reqId);
          if (!isNaN(nId) && nId < 0) {
            console.log(`🧹 Purging temporary isolated history on reject for negative reqId: ${reqId}`);
            reqIdChatHistories.delete(reqId);
          }
        }
        reject(err); 
      }, 
      onUpdate: options.onUpdate,
      requestId,
      priority: options.priority || 0,
      createdAt: Date.now(),
      retries: 0
    });
    processQueue();
  });
}

export function archiveReqIdHistory(oldReqId: string, newReqId: string) {
  const history = reqIdChatHistories.get(oldReqId);
  if (history) {
    reqIdChatHistories.set(newReqId, history);
    reqIdChatHistories.delete(oldReqId);
    console.log(`📦 Archived backend history from ${oldReqId} to ${newReqId} (length: ${history.length})`);
  }
}

export function purgeReqIdHistory(reqId: string) {
  reqIdChatHistories.delete(reqId);
  console.log(`🧹 Explicitly purged history index for reqId: ${reqId}`);
}

export async function handleHealthCheck(origin: string, isLocalHost?: boolean): Promise<{ allowed: boolean; error?: string }> {
  let webdomain = "";
  if (origin && origin !== "unknown") {
    try {
      const url = new URL(origin);
      webdomain = url.hostname;
    } catch (e) {
      webdomain = origin;
    }
  }

  const isLocal = !webdomain || webdomain === "localhost" || webdomain === "127.0.0.1" || webdomain === "::1" || !!isLocalHost;

  if (isLocal) {
    return { allowed: true };
  }

  if (permissions[webdomain] === "deny") {
    return { allowed: false, error: `Inbound request blocked: Access from domain '${webdomain}' has been denied by policy.` };
  }

  if (permissions[webdomain] === "allow" || allowedOnceGrace.has(webdomain)) {
    return { allowed: true };
  }

  console.log(`🔐 Inbound health check request from external domain '${webdomain}' detected. Prompting user...`);

  if (process.send) {
    console.log("Foregrounding Omnix for inbound connection approval...");
    process.send({ type: "FOREGROUND_REQUEST" });
  }

  const authId = uuidv4();

  const approved = await new Promise<boolean>((resolveAuth) => {
    const timeout = setTimeout(() => {
      if (pendingAuths.has(authId)) {
        console.log(`⏳ Authorization prompt for health check from '${webdomain}' timed out.`);
        pendingAuths.delete(authId);
        resolveAuth(false);
      }
    }, 60000);

    pendingAuths.set(authId, {
      resolve: (val) => {
        clearTimeout(timeout);
        resolveAuth(val);
      },
      webdomain,
      category: "health"
    });

    if (workers.length === 0) {
      console.log(`⚠️ No active GUI workers connected to authorize health check from '${webdomain}'`);
      clearTimeout(timeout);
      pendingAuths.delete(authId);
      resolveAuth(false);
      return;
    }

    const msg = JSON.stringify({
      type: "AUTHORIZATION_REQUEST",
      authId,
      webdomain,
      category: "health"
    });

    workers.forEach((w) => {
      if (w.ws && w.ws.readyState === 1) {
        w.ws.send(msg);
      }
    });
  });

  if (!approved) {
    return { allowed: false, error: `Inbound request blocked: Permission from domain '${webdomain}' was rejected.` };
  }

  return { allowed: true };
}
