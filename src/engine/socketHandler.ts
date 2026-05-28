import { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";

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
  timeout: NodeJS.Timeout;
  workerId: string | null;
  retries: number;
  priority: number;
  createdAt: number;
}

const pendingTasks = new Map<string, PendingTask>();
let workers: Worker[] = [];
const taskQueue: { category: string; input: any; options: any; resolve: any; reject: any; requestId: string; priority: number; createdAt: number; retries: number }[] = [];

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

export function setupWebSockets(server: any) {
  const wss = new WebSocketServer({ 
    server,
    path: "/ws-active-compute" 
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
    const { category, input, options, requestId, resolve, reject, retries, priority, createdAt } = nextTask;

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
  // Backpressure limit
  if (taskQueue.length >= MAX_QUEUE_SIZE) {
    throw new Error("System High-Load: Task queue is full. Please try again later.");
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

    taskQueue.push({ 
      category, 
      input, 
      options, 
      resolve: (data: any) => { clearTimeout(queueTimeout); resolve(data); }, 
      reject: (err: any) => { clearTimeout(queueTimeout); reject(err); }, 
      requestId,
      priority: options.priority || 0,
      createdAt: Date.now(),
      retries: 0
    });
    processQueue();
  });
}
