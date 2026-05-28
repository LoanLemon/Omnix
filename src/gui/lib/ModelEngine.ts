import { RawImage } from "@huggingface/transformers";
import { MODELS } from "@shared/modelList";

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
  private worker: Worker | null = null;
  private pendingRequests: Map<string, {
    resolve: (val: any) => void;
    reject: (err: any) => void;
    progress_callback?: (p: any) => void;
    onToken?: (token: string) => void;
  }> = new Map();

  // Keep track of lightweight load states locally for synchronous UI stats queries
  private currentModelId: string | null = null;
  private hasDirector: boolean = false;
  private hasStt: boolean = false;
  private hasTts: boolean = false;
  private hasEmbedding: boolean = false;
  private isLowMemory: boolean = false;

  constructor() {
    this.initWorker();
  }

  private initWorker() {
    if (this.worker) return;
    try {
      // Native Vite chunk worker syntax
      this.worker = new Worker(
        new URL('./model.worker.ts', import.meta.url),
        { type: 'module' }
      );

      this.worker.addEventListener("message", (e) => {
        const { type, requestId, result, error, progress, token } = e.data;
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
              4
            );
            resolveRequest(pending, reconstructed);
          } else {
            resolveRequest(pending, result);
          }
        } else if (type === "error") {
          this.pendingRequests.delete(requestId);
          pending.reject(new Error(error));
        }
      });
    } catch (err) {
      console.error("Critical: Failed to initialize Web Worker inside ModelEngine:", err);
    }
  }

  private postToWorker(type: string, payload?: any, progress_callback?: (p: any) => void, onToken?: (token: string) => void): Promise<any> {
    this.initWorker();
    if (!this.worker) {
      return Promise.reject(new Error("Worker not initialized"));
    }

    const requestId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : (Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(requestId, {
        resolve,
        reject,
        progress_callback,
        onToken
      });
      const cleanPayload = sanitizePayload(payload);
      this.worker!.postMessage({
        type,
        requestId,
        payload: cleanPayload
      });
    });
  }

  async init() {
    return this.postToWorker("init");
  }

  setSafeMode(val: boolean) {
    this.isLowMemory = val;
    this.postToWorker("setSafeMode", { val }).catch(e => {
       console.error("Error setting safe mode in worker:", e);
    });
  }

  async loadModel(category: string, modelId: string, progressCallback?: (p: any) => void) {
    const modelKey = `${category}:${modelId}`;
    if (category === "stt") {
      this.hasStt = true;
    } else if (category === "tts") {
      this.hasTts = true;
    } else {
      this.currentModelId = modelKey;
    }

    return this.postToWorker("loadModel", { category, modelId }, progressCallback);
  }

  async unloadDirector() {
    if (this.isLowMemory) {
      this.hasDirector = false;
    }
    return this.postToWorker("unloadDirector");
  }

  async clear() {
    this.currentModelId = null;
    this.hasDirector = false;
    this.hasStt = false;
    this.hasTts = false;
    this.hasEmbedding = false;
    return this.postToWorker("clear");
  }

  getEstimatedLoadedWeightsBytes(): number {
    let sizeMB = 0;
    if (this.currentModelId) {
      const parts = this.currentModelId.split(":");
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

  async runDirectorInference(input: string, modelId?: string, progressCallback?: (p: any) => void) {
    this.hasDirector = true;
    return this.postToWorker("runDirectorInference", { input, modelId }, progressCallback);
  }

  async getEmbedding(text: string, progressCallback?: (p: any) => void): Promise<number[]> {
    this.hasEmbedding = true;
    return this.postToWorker("getEmbedding", { text }, progressCallback);
  }

  async runInference(category: string, input: any, options: any = {}, onToken?: (token: string) => void) {
    const modelId = options.modelId || this.getDefaultModel(category);
    
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
    const found = MODELS.find(m => m.category === category);
    return found ? found.id : "";
  }

  private async rawImageToBase64(raw: RawImage): Promise<string> {
    const canvas = document.createElement('canvas');
    canvas.width = raw.width;
    canvas.height = raw.height;
    const ctx = canvas.getContext('2d')!;
    const imageData = new ImageData(new Uint8ClampedArray(raw.data), raw.width, raw.height);
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/png');
  }
}

function resolveRequest(pending: any, val: any) {
  pending.resolve(val);
}

export const browserEngine = new BrowserModelEngine();
