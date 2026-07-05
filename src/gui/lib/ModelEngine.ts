import { RawImage } from "@huggingface/transformers";
import { MODELS, normalizeAndRegisterModel } from "@shared/modelList";
import { float32ArrayToWav } from "./audioUtils";
import { tts } from "./tts";

// Globally override and silence the CORS content-length headers warning on main thread
const originalWarn = console.warn;
console.warn = function (...args) {
  if (args[0] && typeof args[0] === 'string' && (
    args[0].includes('Unable to determine content-length') ||
    args[0].includes('content-length')
  )) {
    return;
  }
  originalWarn.apply(console, args);
};

function sanitizePayload(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "function") return undefined;
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizePayload(item));
  }
  if (typeof obj === "object") {
    if (obj instanceof ArrayBuffer || ArrayBuffer.isView(obj) || obj instanceof Blob || typeof File !== 'undefined' && obj instanceof File || typeof ImageBitmap !== 'undefined' && obj instanceof ImageBitmap) {
      return obj;
    }
    const copy: any = {};
    for (const key of Object.keys(obj)) {
      const val = sanitizePayload(obj[key]);
      if (val !== undefined) {
        copy[key] = val;
      }
    }
    return copy;
  }
  return obj;
}

export class BrowserModelEngine {
  private workers: Map<string, Worker | null> = new Map();
  private workerQueues: Map<string, Promise<void>> = new Map();
  private enableMMRS: boolean = false;
  private pendingRequests: Map<string, {
    resolve: (val: any) => void;
    reject: (err: any) => void;
    progress_callback?: (p: any) => void;
    onToken?: (token: string) => void;
    workerKey?: string;
  }> = new Map();

  // Keep track of lightweight load states locally for synchronous UI stats queries
  public useLocalServerApi = false;
  private currentModelId: string | null = null;
  private currentOpModelId: string | null = null;
  private hasDirector: boolean = false;
  private hasStt: boolean = false;
  private hasTts: boolean = false;
  private hasEmbedding: boolean = false;
  private isLowMemory: boolean = false;

  // Idle timer & listener states
  private idleTimeoutId: any = null;
  private idleLimitMinutes: number = 10;
  private listeners: Set<() => void> = new Set();
  private onIdleUnloadCallback: (() => void) | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      const savedTimeout = localStorage.getItem("omnix_inactivity_timeout");
      if (savedTimeout) {
        this.idleLimitMinutes = parseInt(savedTimeout, 10);
      }
    }
    this.initWorker("main");
    this.restartIdleTimer();
  }

  getCurrentModelId(): string | null {
    return this.currentModelId;
  }

  setIdleTimeout(minutes: number) {
    this.idleLimitMinutes = minutes;
    this.restartIdleTimer();
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  onIdleUnload(cb: (() => void) | null) {
    this.onIdleUnloadCallback = cb;
  }

  private stopIdleTimer() {
    if (this.idleTimeoutId) {
      clearTimeout(this.idleTimeoutId);
      this.idleTimeoutId = null;
    }
  }

  private restartIdleTimer() {
    this.stopIdleTimer();
    
    if (this.idleLimitMinutes <= 0) return;
    
    const hasActiveWorkers = Array.from(this.workers.values()).some(w => w !== null);
    
    // Only start idle timer if there are no pending requests and at least one model or worker is active
    if (this.pendingRequests.size === 0 && (hasActiveWorkers || this.currentModelId || this.currentOpModelId || this.hasDirector || this.hasStt || this.hasTts || this.hasEmbedding)) {
      console.log(`⏱️ Starting ${this.idleLimitMinutes}-minute idle unload timer...`);
      this.idleTimeoutId = setTimeout(async () => {
        console.log(`💤 App idle for ${this.idleLimitMinutes} minutes. Unloading active models and workers to free up GPU/RAM memory...`);
        try {
          await this.clear();
          if (this.onIdleUnloadCallback) {
            this.onIdleUnloadCallback();
          }
        } catch (e) {
          console.error("Failed to unload models during idle cleanup:", e);
        }
      }, this.idleLimitMinutes * 60 * 1000);
    }
  }

  setEnableMMRS(val: boolean) {
    if (this.enableMMRS === val) return;
    this.enableMMRS = val;
    this.terminateAllWorkers();
    
    if (val) {
      this.initWorker("text");
      this.initWorker("op");
    } else {
      this.initWorker("main");
    }
    this.restartIdleTimer();
    this.notify();
  }

  terminateAllWorkers() {
    for (const [key, w] of Array.from(this.workers.entries())) {
      if (w) w.terminate();
    }
    this.workers.clear();
    
    this.currentModelId = null;
    this.currentOpModelId = null;
    this.hasDirector = false;
    this.hasStt = false;
    this.hasTts = false;
    this.hasEmbedding = false;
    
    for (const [id, req] of Array.from(this.pendingRequests.entries())) {
      req.reject(new Error("Engine workers reset due to configuration change."));
      this.pendingRequests.delete(id);
    }
  }

  private getWorkerKeyForCategory(category: string): string {
    if (!this.enableMMRS) {
      return "main";
    }
    return category === "text" ? "text" : "op";
  }

  private initWorker(key: string) {
    if (this.workers.get(key)) return;
    try {
      // Native Vite chunk worker syntax
      const worker = new Worker(
        new URL('../worker/main.worker.ts', import.meta.url),
        { type: 'module' }
      );

      worker.addEventListener("error", (e) => {
        const errorMsg = e.message || String(e);
        console.error(`Worker [${key}] generic error:`, errorMsg);
        if (
          errorMsg.includes("A valid external Instance reference no longer exists") || 
          errorMsg.includes("failed to call OrtRun") || 
          errorMsg.includes("GPUBuffer") || 
          errorMsg.includes("mapAsync") || 
          errorMsg.includes("device lost") ||
          errorMsg.includes("bad_alloc")
        ) {
          console.error(`🚨 Fatal memory or WebGPU error caught at worker [${key}] level. Restarting worker...`);
          this.restartWorker(key);
        }
      });

      worker.addEventListener("message", (e) => {
        const { type, requestId, result, error, progress, token } = e.data;
        
        if (type === "error" && requestId === "global") {
          if (error && typeof error === "string" && (
            error.includes("A valid external Instance reference no longer exists") || 
            error.includes("failed to call OrtRun") || 
            error.includes("GPUBuffer") || 
            error.includes("mapAsync") || 
            error.includes("device lost") ||
            error.includes("destroy") ||
            error.includes("disposed") ||
            error.includes("session") ||
            error.includes("bad_alloc")
          )) {
            console.error(`🚨 Fatal memory or WebGPU error detected globally on worker [${key}]. Restarting worker...`);
            this.restartWorker(key);
          }
          return;
        }

        const pending = this.pendingRequests.get(requestId);
        if (!pending) return;

        if (type === "progress" && pending.progress_callback) {
          pending.progress_callback(progress);
        } else if (type === "token" && pending.onToken) {
          pending.onToken(token);
        } else if (type === "complete") {
          this.pendingRequests.delete(requestId);
          
          // Reconstruct RawImage if return type is serialized image payload
          if (result && result.__serialized_type__ === "RawImage") {
            const reconstructed = new RawImage(
              new Uint8Array(result.data),
              result.width,
              result.height,
              result.channels || 4
            );
            resolveRequest(pending, reconstructed);
          } else {
            resolveRequest(pending, result);
          }
        } else if (type === "error") {
          this.pendingRequests.delete(requestId);
          
          if (error && typeof error === "string" && (
            error.includes("A valid external Instance reference no longer exists") || 
            error.includes("failed to call OrtRun") || 
            error.includes("GPUBuffer") || 
            error.includes("mapAsync") || 
            error.includes("device lost") ||
            error.includes("destroy") ||
            error.includes("disposed") ||
            error.includes("session") ||
            error.includes("bad_alloc")
          )) {
            console.error(`🚨 Fatal memory or WebGPU error detected on worker [${key}]. Terminating and restarting to recover...`);
            this.restartWorker(key);
          }

          pending.reject(new Error(error));
        }
      });

      this.workers.set(key, worker);
      
      // Automatically dispatch init to the newly created worker
      worker.postMessage({
        type: "init",
        requestId: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36),
        payload: {}
      });
    } catch (err) {
      console.error(`Critical: Failed to initialize Web Worker [${key}] inside ModelEngine:`, err);
    }
  }

  restartWorker(key: string) {
    const w = this.workers.get(key);
    if (w) {
      w.terminate();
      this.workers.set(key, null);
    }
    
    // Clear all model states so the UI knows they are unloaded
    if (!this.enableMMRS) {
      this.currentModelId = null;
      this.hasDirector = false;
      this.hasStt = false;
      this.hasTts = false;
      this.hasEmbedding = false;
    } else {
      if (key === "text") {
        if (this.currentModelId && this.currentModelId.startsWith("text:")) {
          this.currentModelId = null;
        }
      } else {
        if (this.currentOpModelId) {
          this.currentOpModelId = null;
        }
        this.hasDirector = false;
        this.hasStt = false;
        this.hasTts = false;
        this.hasEmbedding = false;
      }
    }
    
    // Reject any other pending requests for this specific worker
    for (const [id, req] of Array.from(this.pendingRequests.entries())) {
      if ((req as any).workerKey === key) {
        req.reject(new Error(`Worker [${key}] was restarted. Please try your request again.`));
        this.pendingRequests.delete(id);
      }
    }
    
    this.initWorker(key);
    if (this.isLowMemory) {
      this.postToWorker("setSafeMode", { val: this.isLowMemory }, undefined, undefined, key)
        .catch(e => console.error(`Failed to restore safe mode on restart of worker [${key}]`, e));
    }
    this.notify();
  }

  private async postToWorker(
    type: string, 
    payload?: any, 
    progress_callback?: (p: any) => void, 
    onToken?: (token: string) => void,
    targetWorkerKey?: string
  ): Promise<any> {
    const category = payload?.category || "";
    const workerKey = targetWorkerKey || this.getWorkerKeyForCategory(category);

    let taskResolve: () => void;
    const nextQueue = new Promise<void>((res) => {
      taskResolve = res;
    });

    const currentQueue = this.workerQueues.get(workerKey) || Promise.resolve();
    this.workerQueues.set(workerKey, currentQueue.catch(() => {}).then(() => nextQueue));

    await currentQueue.catch(() => {});

    this.initWorker(workerKey);
    const worker = this.workers.get(workerKey);
    if (!worker) {
      taskResolve!();
      return Promise.reject(new Error(`Worker [${workerKey}] not initialized`));
    }

    this.stopIdleTimer();

    const requestId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : (Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(requestId, {
        resolve: (val: any) => {
          resolve(val);
          taskResolve();
          this.restartIdleTimer();
        },
        reject: (err: any) => {
          reject(err);
          taskResolve();
          this.restartIdleTimer();
        },
        progress_callback,
        onToken,
        workerKey
      } as any);
      const cleanPayload = sanitizePayload(payload);
      worker.postMessage({
        type,
        requestId,
        payload: cleanPayload
      });
    });
  }

  async init() {
    const isElectron = typeof window !== "undefined" && !!(window as any).electron;
    if (!isElectron) {
      try {
        console.log("🔍 Checking if local Omnix server is running at http://localhost:9777...");
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);
        const res = await fetch("http://localhost:9777/api/health", { signal: controller.signal });
        clearTimeout(timeoutId);
        this.useLocalServerApi = true;
        console.log("✅ Omnix local server detected running! Enabling local server API mode for AI requests.");
      } catch (e) {
        console.log("❌ Omnix local server not running or unreachable. Using browser-side Web Worker.");
        this.useLocalServerApi = false;
      }
    } else {
      this.useLocalServerApi = false;
    }

    if (this.useLocalServerApi) {
      return { success: true, mode: "api" };
    }
    return this.postToWorker("init");
  }

  setSafeMode(val: boolean) {
    this.isLowMemory = val;
    if (this.useLocalServerApi) return;
    this.postToWorker("setSafeMode", { val }).catch(e => {
       console.error("Error setting safe mode in worker:", e);
    });
  }

  async loadModel(category: string, modelId: string, progressCallback?: (p: any) => void, customDtype?: string) {
    const modelKey = `${category}:${modelId}`;
    if (category === "stt") {
      this.hasStt = true;
    } else if (category === "tts") {
      this.hasTts = true;
    } else if (this.enableMMRS) {
      if (category === "text") {
        this.currentModelId = modelKey;
      } else {
        this.currentOpModelId = modelKey;
      }
    } else {
      this.currentModelId = modelKey;
    }

    if (this.useLocalServerApi) {
      console.log(`🚀 Omnix local server active. Bypassing browser-side model download/load for ${modelKey}`);
      if (progressCallback) {
        progressCallback({ status: "init", file: "Omnix Local API Engine" });
        setTimeout(() => {
          progressCallback({ status: "loaded", file: "Omnix Local API Engine" });
        }, 100);
      }
      this.notify();
      return { success: true, mode: "api" };
    }

    const res = await this.postToWorker("loadModel", { category, modelId, customDtype }, progressCallback);
    this.notify();
    return res;
  }

  async unloadDirector() {
    this.hasDirector = false;
    if (this.useLocalServerApi) {
      this.notify();
      return { success: true };
    }
    const res = await this.postToWorker("unloadDirector");
    this.notify();
    return res;
  }

  async clear() {
    if (this.useLocalServerApi) {
      this.currentModelId = null;
      this.currentOpModelId = null;
      this.hasDirector = false;
      this.hasStt = false;
      this.hasTts = false;
      this.hasEmbedding = false;
      this.notify();
      return { success: true };
    }
    
    console.log("🧹 Gracefully purging WebGPU buffers before worker termination...");
    try {
      // Create a promise array to clear all active workers gracefully first
      const clearPromises = [];
      for (const [key, w] of Array.from(this.workers.entries())) {
        if (w) {
          clearPromises.push(this.postToWorker("clear", undefined, undefined, undefined, key).catch(() => {}));
        }
      }
      await Promise.all(clearPromises);
    } catch (e) {
      console.warn("Failed to gracefully clear some workers:", e);
    }
    
    // Give the browser a small window to process the WebGPU buffer releases
    await new Promise(resolve => setTimeout(resolve, 200));

    console.log("🧹 Terminating all workers to completely free WebAssembly memory...");
    this.terminateAllWorkers();
    
    this.notify();
    return { success: true };
  }

  getEstimatedLoadedWeightsBytes(): number {
    let sizeMB = 0;
    const modelIdsToCount = [this.currentModelId, this.currentOpModelId].filter(Boolean) as string[];
    
    for (const modelKey of modelIdsToCount) {
      const parts = modelKey.split(":");
      const modelId = parts[1] || parts[0];
      const info = MODELS.find(m => m.id === modelId || m.modelID === modelId);
      if (info?.size) {
        const numStr = info.size.replace(/[~GMB\s]/g, "");
        const val = parseFloat(numStr);
        if (!isNaN(val)) {
          if (info.size.includes("GB")) {
            sizeMB += val * 1024;
          } else {
            sizeMB += val;
          }
        }
      } else {
        sizeMB += 1000;
      }
    }
    if (this.hasDirector) sizeMB += 500;
    if (this.hasStt) sizeMB += 150;
    if (this.hasTts) sizeMB += 350;
    if (this.hasEmbedding) sizeMB += 100;
    
    return sizeMB * 1024 * 1024;
  }

  async runDirectorInference(input: string, modelId?: string, progressCallback?: (p: any) => void, customDtype?: string) {
    this.hasDirector = true;
    if (this.useLocalServerApi) {
      this.notify();
      try {
        const response = await fetch("http://localhost:9777/api/director", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: input, modelId, customDtype })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        return data.intent || data;
      } catch (err: any) {
        console.error("Local API Director inference failed:", err);
        throw err;
      }
    }
    return this.postToWorker("runDirectorInference", { input, modelId, customDtype }, progressCallback);
  }

  async getEmbedding(text: string, progressCallback?: (p: any) => void): Promise<number[]> {
    this.hasEmbedding = true;
    return this.postToWorker("getEmbedding", { text }, progressCallback);
  }

  cancelInference(requestId: string) {
    const pending = this.pendingRequests.get(requestId);
    if (pending && pending.workerKey) {
      const worker = this.workers.get(pending.workerKey);
      if (worker) {
        worker.postMessage({ type: "cancelInference", requestId });
      }
    } else {
      // Broadcast to all just in case
      for (const worker of this.workers.values()) {
        if (worker) {
          worker.postMessage({ type: "cancelInference", requestId });
        }
      }
    }
  }

  async runInference(category: string, input: any, options: any = {}, onToken?: (token: string) => void) {
    if (category === "embedding") {
      return this.getEmbedding(input);
    }

    if (category === "tts") {
      const voiceID = options.voiceID || options.voiceId || options.modelId || "af_heart";
      try {
        console.log(`🎙️ Running main-thread Kokoro TTS via kokoro-js for voice: ${voiceID}`);
        const raw = await tts.generateRaw(input, voiceID);
        return {
          audio: Array.from(raw.audio),
          sampling_rate: raw.sampling_rate
        };
      } catch (err: any) {
        console.error("Main-thread Kokoro TTS failed:", err);
        throw err;
      }
    }

    let modelId = options.modelId;
    if (!modelId && this.currentModelId) {
      const [curCategory, curModelId] = this.currentModelId.split(":");
      if (curCategory === category) {
        modelId = curModelId;
      }
    }
    if (!modelId) {
      modelId = this.getDefaultModel(category);
    }

    if (modelId) {
      const resolved = normalizeAndRegisterModel(modelId, category as any);
      modelId = resolved.id;
      options.modelId = resolved.id;
    }
    
    // Warm memory tracking states before calling worker
    if (category === "stt") {
      this.hasStt = true;
    } else if (category === "tts") {
      this.hasTts = true;
    } else if (category === "director") {
      this.hasDirector = true;
    } else {
      this.currentModelId = `${category}:${modelId}`;
    }

    if (this.useLocalServerApi) {
      console.log(`📡 Direct API request to Omnix server for ${category}...`);
      
      let url = "http://localhost:9777/api/text";
      let body: any = {};
      let isMultipart = false;
      const formData = new FormData();

      if (category === "text" || category === "coder") {
        url = "http://localhost:9777/api/text";
        body = {
          prompt: input,
          systemPrompt: options.systemPrompt,
          modelId: modelId,
          temperature: options.temperature,
          top_p: options.top_p,
          maxTokens: options.maxTokens
        };
      } else if (category === "director") {
        url = "http://localhost:9777/api/director";
        body = {
          prompt: input,
          modelId: modelId
        };
      } else if (category === "vision") {
        url = "http://localhost:9777/api/vision";
        isMultipart = true;
        
        let blob: Blob;
        if (typeof input === "string" && input.startsWith("data:")) {
          const parts = input.split(",");
          const mimeType = parts[0].match(/:(.*?);/)?.[1] || "image/jpeg";
          const byteString = atob(parts[1] || input);
          const arrayBuffer = new ArrayBuffer(byteString.length);
          const uint8Array = new Uint8Array(arrayBuffer);
          for (let i = 0; i < byteString.length; i++) {
            uint8Array[i] = byteString.charCodeAt(i);
          }
          blob = new Blob([uint8Array], { type: mimeType });
        } else if (input instanceof Blob) {
          blob = input;
        } else {
          blob = new Blob([input], { type: "image/jpeg" });
        }
        
        formData.append("image", blob, "image.jpg");
        formData.append("prompt", options.prompt || "Analyze this image");
        if (modelId) formData.append("modelId", modelId);
      } else if (category === "stt") {
        url = "http://localhost:9777/api/stt";
        isMultipart = true;
        
        let blob: Blob;
        if (input instanceof Float32Array) {
          blob = float32ArrayToWav(input, 16000);
        } else if (typeof input === "string") {
          const byteCharacters = atob(input);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          blob = new Blob([byteArray], { type: "audio/wav" });
        } else if (input instanceof Blob) {
          blob = input;
        } else {
          blob = new Blob([input], { type: "audio/wav" });
        }
        
        formData.append("audio", blob, "audio.wav");
        if (modelId) formData.append("modelId", modelId);
      } else if (category === "tts") {
        url = "http://localhost:9777/api/tts";
        body = {
          text: input,
          voiceID: (modelId && modelId !== "kokoro-82m") ? modelId : "af_heart"
        };
      } else if (category === "image-gen") {
        url = "http://localhost:9777/api/image";
        body = {
          prompt: input,
          modelId: modelId
        };
      } else if (category === "music-gen") {
        url = "http://localhost:9777/api/music";
        body = {
          prompt: input,
          modelId: modelId
        };
      }

      try {
        const fetchOptions: RequestInit = {
          method: "POST"
        };
        if (isMultipart) {
          fetchOptions.body = formData;
        } else {
          fetchOptions.headers = { "Content-Type": "application/json" };
          fetchOptions.body = JSON.stringify(body);
        }

        const res = await fetch(url, fetchOptions);
        if (!res.ok) {
          throw new Error(`Local API request failed with status ${res.status}`);
        }
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        if (category === "text" || category === "coder") {
          let outputText = data.response || "";
          if (data.think) {
            outputText = `<think>${data.think}</think>\n${outputText}`;
          }
          if (onToken) {
            onToken(outputText);
          }
          return outputText;
        } else if (category === "director") {
          return data.intent || data;
        } else if (category === "vision") {
          let outputText = data.response || "";
          if (data.think) {
            outputText = `<think>${data.think}</think>\n${outputText}`;
          }
          if (onToken) {
            onToken(outputText);
          }
          return outputText;
        } else if (category === "stt") {
          return data.text || data;
        } else if (category === "image-gen") {
          return data.image || data;
        } else {
          return data;
        }
      } catch (err: any) {
        console.error(`Local API call failed for ${category}:`, err);
        throw err;
      }
    }

    const res = await this.postToWorker(
      "runInference",
      { category, input, options },
      options.progress_callback,
      onToken
    );

    if (res instanceof RawImage) {
      return await this.rawImageToBase64(res);
    }
    return res;
  }

  private getDefaultModel(category: string) {
    if (category === "text") {
      const gemma = MODELS.find(m => m.id === "gemma-3 1B" && m.category === "text");
      if (gemma) return gemma.id;
    }
    const found = MODELS.find(m => m.category === category);
    return found ? found.id : "";
  }

  private async rawImageToBase64(raw: RawImage): Promise<string> {
    const canvas = document.createElement('canvas');
    canvas.width = raw.width;
    canvas.height = raw.height;
    const ctx = canvas.getContext('2d')!;
    
    // Robustly handle different raw image channels (like 3 channels RGB)
    const numPixels = raw.width * raw.height;
    let rgbaData: Uint8ClampedArray;
    
    if (raw.data.length === numPixels * 4) {
      rgbaData = new Uint8ClampedArray(raw.data);
    } else if (raw.data.length === numPixels * 3) {
      rgbaData = new Uint8ClampedArray(numPixels * 4);
      for (let i = 0; i < numPixels; ++i) {
        const i3 = i * 3;
        const i4 = i * 4;
        rgbaData[i4] = raw.data[i3];         // R
        rgbaData[i4 + 1] = raw.data[i3 + 1]; // G
        rgbaData[i4 + 2] = raw.data[i3 + 2]; // B
        rgbaData[i4 + 3] = 255;              // A
      }
    } else if (raw.data.length === numPixels) {
      rgbaData = new Uint8ClampedArray(numPixels * 4);
      for (let i = 0; i < numPixels; ++i) {
        const i4 = i * 4;
        const val = raw.data[i];
        rgbaData[i4] = val;
        rgbaData[i4 + 1] = val;
        rgbaData[i4 + 2] = val;
        rgbaData[i4 + 3] = 255;
      }
    } else {
      rgbaData = new Uint8ClampedArray(numPixels * 4);
      const copyLen = Math.min(raw.data.length, numPixels * 4);
      rgbaData.set(raw.data.subarray ? raw.data.subarray(0, copyLen) : raw.data.slice(0, copyLen));
      for (let i = Math.floor(copyLen / 4); i < numPixels; ++i) {
        rgbaData[i * 4 + 3] = 255;
      }
    }

    const imageData = new ImageData(rgbaData as any, raw.width, raw.height);
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/png');
  }
}

function resolveRequest(pending: any, val: any) {
  pending.resolve(val);
}

export const browserEngine = new BrowserModelEngine();
