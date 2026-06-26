import { env } from "@huggingface/transformers";

// Silence resource warn / content-length headers output globally inside the worker
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

// WebGPU shader-int64 patch for stable execution in headless/worker Chromium contexts (like Electron).
export function applyWebGpuShaderPatch() {
  if (typeof globalThis !== 'undefined' && globalThis.navigator && globalThis.navigator.gpu) {
    try {
      const originalRequestAdapter = globalThis.navigator.gpu.requestAdapter;
      if (typeof originalRequestAdapter === 'function') {
        globalThis.navigator.gpu.requestAdapter = async function (options?: any) {
          const adapter = await originalRequestAdapter.call(globalThis.navigator.gpu, options);
          if (adapter) {
            // Intercept requestDevice to drop 'shader-int64'
            const originalRequestDevice = adapter.requestDevice;
            if (typeof originalRequestDevice === 'function') {
              adapter.requestDevice = async function (deviceDescriptor?: any) {
                if (deviceDescriptor && deviceDescriptor.requiredFeatures) {
                  if (Array.isArray(deviceDescriptor.requiredFeatures)) {
                    deviceDescriptor.requiredFeatures = deviceDescriptor.requiredFeatures.filter(
                      (f: any) => f !== 'shader-int64'
                    );
                  }
                }
                const device = await originalRequestDevice.call(adapter, deviceDescriptor);
                if (device) {
                  if (device.features && typeof device.features.has === 'function') {
                    const originalHas = device.features.has;
                    device.features.has = function (feature: string) {
                      if (feature === 'shader-int64') return false;
                      return originalHas.call(device.features, feature);
                    };
                  }
                }
                return device;
              };
            }
            // Hide from Adapter features too
            if (adapter.features && typeof adapter.features.has === 'function') {
              const originalAdapterHas = adapter.features.has;
              adapter.features.has = function (feature: string) {
                if (feature === 'shader-int64') return false;
                return originalAdapterHas.call(adapter.features, feature);
              };
            }
          }
          return adapter;
        };
      }
    } catch (e) {
      originalWarn("Failed to apply WebGPU shader patch in worker:", e);
    }
  }
}

// Apply the patch on import
applyWebGpuShaderPatch();

// Configure huggingface env for worker safety
env.allowLocalModels = false;
env.allowRemoteModels = true;
env.useBrowserCache = true; 

// Inside Web Worker, avoid nested worker proxy threads by setting this to false.
if (env.backends?.onnx?.wasm) {
  env.backends.onnx.wasm.proxy = false; 
  env.backends.onnx.wasm.numThreads = 1; 
  env.backends.onnx.wasm.simd = true;
}

let cachedShaderF16Support: boolean | null = null;

export async function checkShaderF16Support(): Promise<boolean> {
  if (cachedShaderF16Support !== null) return cachedShaderF16Support;
  if (typeof navigator === 'undefined' || !navigator.gpu) {
    cachedShaderF16Support = false;
    return false;
  }
  try {
    const adapter = await navigator.gpu.requestAdapter();
    if (adapter && adapter.features && typeof adapter.features.has === 'function') {
      cachedShaderF16Support = adapter.features.has('shader-f16');
      console.log(`📡 (Worker) WebGPU shader-f16 capability detected: ${cachedShaderF16Support}`);
    } else {
      cachedShaderF16Support = false;
    }
  } catch (e) {
    console.warn("(Worker) Error checking shader-f16 capability:", e);
    cachedShaderF16Support = false;
  }
  return cachedShaderF16Support;
}

export function compileChatTemplate(modelId: string, messages: any[], options?: any): string {
  const modelIdLower = String(modelId || "").toLowerCase();
  
  if (modelIdLower.includes("qwen") || modelIdLower.includes("tiny-llm") || modelIdLower.includes("janus")) {
    let chat = "";
    messages.forEach((msg) => {
      const role = msg.role === "model" ? "assistant" : msg.role;
      chat += `<|im_start|>${role}\n${msg.content}<|im_end|>\n`;
    });
    chat += `<|im_start|>assistant\n`;
    return chat;
  }
  
  if (modelIdLower.includes("llama")) {
    let chat = "<|begin_of_text|>";
    messages.forEach((msg) => {
      const role = msg.role === "model" ? "assistant" : msg.role;
      chat += `<|start_header_id|>${role}<|end_header_id|>\n\n${msg.content}<|eot_id|>\n`;
    });
    chat += `<|start_header_id|>assistant<|end_header_id|>\n\n`;
    return chat;
  }
  
  if (modelIdLower.includes("gemma-4")) {
    let chat = "";
    let hasSystem = false;
    messages.forEach((msg) => {
      let role = msg.role;
      if (role === "assistant") role = "model";
      
      let content = msg.content;
      if (role === "system") {
        hasSystem = true;
        if (options?.thinkEnabled && !content.startsWith("<|think|>")) {
          content = "<|think|>\n" + content;
        }
      }
      chat += `<|turn>${role}\n${content}<turn|>\n`;
    });
    
    if (!hasSystem && options?.thinkEnabled) {
      chat = `<|turn>system\n<|think|>\n<turn|>\n` + chat;
    }
    
    chat += `<|turn>model\n`;
    return chat;
  }
  
  if (modelIdLower.includes("gemma")) {
    let chat = "<bos>";
    let systemPrompt = "";
    messages.forEach((msg) => {
      if (msg.role === "system") {
        systemPrompt = msg.content;
      } else {
        const role = (msg.role === "assistant" || msg.role === "model") ? "model" : "user";
        let content = msg.content;
        if (role === "user" && systemPrompt) {
          content = `${systemPrompt}\n\n${content}`;
          systemPrompt = "";
        }
        chat += `<start_of_turn>${role}\n${content}<end_of_turn>\n`;
      }
    });
    chat += `<start_of_turn>model\n`;
    return chat;
  }
  
  // Generic ChatML fallback
  let chat = "";
  messages.forEach((msg) => {
    const role = msg.role === "model" ? "assistant" : msg.role;
    chat += `<|im_start|>${role}\n${msg.content}<|im_end|>\n`;
  });
  chat += `<|im_start|>assistant\n`;
  return chat;
}

export async function safeDispose(obj: any) {
  if (!obj) return;
  if (obj._disposed) {
    console.log("ℹ️ Prevented double disposal on already disposed object");
    return;
  }
  try {
    if (typeof obj.dispose === "function") {
      obj._disposed = true;
      const res = obj.dispose();
      if (res instanceof Promise) {
        await res;
      }
    }
  } catch (err: any) {
    const msg = String(err);
    if (
      msg.includes("release session") || 
      msg.includes("session id") || 
      msg.includes("already disposed") ||
      msg.includes("invalid session id")
    ) {
      console.log("ℹ️ Handled redundant session disposal:", msg);
    } else {
      console.warn("⚠️ Warning during safeDispose in worker:", err);
    }
  }
}

export function safeDisposeTensors(obj: any) {
  if (!obj) return;
  try {
    if (typeof obj.dispose === "function") {
      obj.dispose();
      return;
    }
    if (Array.isArray(obj)) {
      for (const item of obj) {
        safeDisposeTensors(item);
      }
    } else if (typeof obj === "object") {
      for (const key of Object.keys(obj)) {
        const val = obj[key];
        if (val && typeof val === "object") {
          if (typeof val.dispose === "function") {
            try {
              val.dispose();
            } catch (err) {}
          } else {
            safeDisposeTensors(val);
          }
        }
      }
    }
  } catch (err) {
    // Quiet failure for manual garbage collection
  }
}

export async function float32ArrayToWavUrl(audioData: Float32Array, sampleRate: number): Promise<string> {
  const buffer = new ArrayBuffer(44 + audioData.length * 2);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + audioData.length * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, audioData.length * 2, true);

  let index = 44;
  for (let i = 0; i < audioData.length; i++) {
      const s = Math.max(-1, Math.min(1, audioData[i]));
      view.setInt16(index, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      index += 2;
  }

  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
  }
}
