import { 
  pipeline, 
  AutoTokenizer, 
  AutoProcessor,
  AutoModelForImageTextToText,
  MultiModalityCausalLM,
  RawImage,
  env 
} from "@huggingface/transformers";
import { MODELS } from "@shared/modelList";
import { DIRECTOR_SYSTEM_PROMPT } from "@shared/prompts";

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
// In Electron, GPU capabilities (such as 64-bit integer indexing shader-int64) are often reported
// as supported by the card/driver, but compiling them in Tint/WGSL fails inside background renderers.
// This results in validation errors like '[Invalid ComputePipeline "Gather"]' and scrambled text.
// Intercepting navigator.gpu to hide 'shader-int64' safely triggers the high-performance 32-bit Integer fallback.
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

// Worker-specific configuration for safe performance
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

async function checkShaderF16Support(): Promise<boolean> {
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

function compileChatTemplate(modelId: string, messages: any[]): string {
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

class WorkerModelEngine {
  private currentModelId: string | null = null;
  private pipeline: any = null;
  private processor: any = null;
  private model: any = null;
  private director: any = null;
  private directorModelId: string | null = null;
  private sttPipeline: any = null;
  private currentSttModelId: string | null = null;
  private ttsPipeline: any = null;
  private currentTtsModelId: string | null = null;
  private embeddingPipeline: any = null;
  private isBusy: boolean = false;
  private isLowMemory: boolean = false;

  private Gemma4ForConditionalGeneration: any = null;
  private MusicgenForConditionalGeneration: any = null;

  async init() {
    try {
      const transformers = await import("@huggingface/transformers");
      // @ts-ignore
      this.Gemma4ForConditionalGeneration = transformers.Gemma4ForConditionalGeneration;
      // @ts-ignore
      this.MusicgenForConditionalGeneration = transformers.MusicgenForConditionalGeneration;
    } catch (e) {
      console.error("Failed to load special model classes in worker:", e);
    }
  }

  setSafeMode(val: boolean) {
    this.isLowMemory = val;
    if (val) {
      env.useBrowserCache = false;
      // @ts-ignore
      if (env.backends?.onnx?.wasm) {
        env.backends.onnx.wasm.numThreads = 1;
      }
    }
  }

  private async safeDispose(obj: any) {
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

  private safeDisposeTensors(obj: any) {
    if (!obj) return;
    try {
      if (typeof obj.dispose === "function") {
        obj.dispose();
        return;
      }
      if (Array.isArray(obj)) {
        for (const item of obj) {
          this.safeDisposeTensors(item);
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
              this.safeDisposeTensors(val);
            }
          }
        }
      }
    } catch (err) {
      // Quiet failure for manual garbage collection
    }
  }

  async getDirector(modelId: string = "onnx-community/Qwen2.5-0.5B-Instruct", sendProgress?: (p: any) => void) {
    if (this.director) return this.director;

    // Direct bypass: Check if we have the SAME model already loaded in the text-generation pipeline
    if (this.pipeline && this.currentModelId) {
      const parts = this.currentModelId.split(":");
      const loadedModelId = parts[1];
      const info = MODELS.find(m => m.id === loadedModelId);
      if (info && (info.modelID === modelId || info.id === modelId)) {
        console.log(`♻️ (Worker) Reusing already loaded text generation model (${info.id}) as Director`);
        this.director = this.pipeline;
        this.directorModelId = modelId;
        return this.director;
      }
    }

    if (this.pipeline || this.model) {
      await this.clearHeavy();
    }

    console.log(`🚀 (Worker) Loading Persistent Director Engine: ${modelId}...`);
    const options: any = {
      progress_callback: (p: any) => {
        if (sendProgress) sendProgress(p);
      }
    };
    
    const info = MODELS.find(m => m.id === modelId || m.modelID === modelId);
    const dtype = info?.dtype || "q4";
    console.log(`📦 (Worker) Persistent Director Engine Dtype: ${dtype}`);
    
    let finalDtype = dtype.toLowerCase();
    const hasShaderF16 = await checkShaderF16Support();
    if (!hasShaderF16) {
      if (finalDtype === "fp16") {
        console.warn(`⚠️ (Worker) WebGPU shader-f16 NOT supported. Falling back to fp32 for Persistent Director`);
        finalDtype = "fp32";
      } else if (finalDtype === "q4f16") {
        console.warn(`⚠️ (Worker) WebGPU shader-f16 NOT supported. Falling back to q4 for Persistent Director`);
        finalDtype = "q4";
      }
    }
    
    try {
      this.director = await pipeline("text-generation", modelId, {
        ...options,
        device: "webgpu",
        dtype: finalDtype
      });
    } catch (e) {
      console.warn("Director WebGPU failed in worker, falling back to WASM:", e);
      this.director = await pipeline("text-generation", modelId, {
        ...options,
        device: "wasm",
        dtype: (finalDtype === "fp16" || finalDtype === "q8") ? "q4" : finalDtype
      });
    }
    this.directorModelId = modelId;
    return this.director;
  }

  async unloadDirector() {
    if (this.director) {
      console.log("🧹 (Worker) Unloading Director Engine to reclaim VRAM...");
      if (typeof this.director.dispose === "function") {
        await this.safeDispose(this.director);
      } else if (this.director.model) {
        await this.safeDispose(this.director.model);
      }
      this.director = null;
      this.directorModelId = null;
      // Settle time for GC and webgpu cache release
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  async forceUnloadDirector() {
    if (this.director) {
      console.log("🧹 (Worker) Force unloading Director Engine...");
      if (typeof this.director.dispose === "function") {
        await this.safeDispose(this.director);
      } else if (this.director.model) {
        await this.safeDispose(this.director.model);
      }
      this.director = null;
      this.directorModelId = null;
      // Settle time for GC and webgpu cache release
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  async clearHeavy() {
    console.log("🧹 (Worker) Purging heavy asset threads...");
    try {
      if (this.pipeline) {
        if (typeof this.pipeline.dispose === "function") {
          await this.safeDispose(this.pipeline);
        } else if (this.pipeline.model) {
          await this.safeDispose(this.pipeline.model);
        }
      }
      if (this.model) {
        await this.safeDispose(this.model);
      }
    } catch (gcErr) {
      console.warn("Exception during explicit pipeline GC cleaning in worker:", gcErr);
    }
    this.pipeline = null;
    this.model = null;
    this.processor = null;
    this.currentModelId = null;
    this.isBusy = false;
    // Settle time for GC and webgpu cache release
    await new Promise(resolve => setTimeout(resolve, 300));
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
    if (this.director) sizeMB += 500;
    if (this.sttPipeline) sizeMB += 150;
    if (this.ttsPipeline) sizeMB += 350;
    if (this.embeddingPipeline) sizeMB += 100;
    return sizeMB * 1024 * 1024;
  }

  async loadModel(category: string, modelId: string, sendProgress?: (p: any) => void) {
    const modelKey = `${category}:${modelId}`;

    if (category === "stt") {
      if (this.currentSttModelId === modelKey && this.sttPipeline) return;
    } else if (category === "tts") {
      if (this.currentTtsModelId === modelKey && this.ttsPipeline) return;
    } else {
      if (this.currentModelId === modelKey && (this.pipeline || this.model)) return;

      // Check if we can reuse the active director as the text pipeline
      const info = MODELS.find(m => m.id === modelId);
      if (this.director && info && (this.directorModelId === info.modelID || this.directorModelId === info.id)) {
        console.log(`♻️ (Worker) Reusing active Director as text pipeline (${info.id})`);
        this.pipeline = this.director;
        this.currentModelId = modelKey;
        return;
      }

      await this.clearHeavy();
      await this.forceUnloadDirector();
    }

    const info = MODELS.find(m => m.id === modelId);
    if (!info) throw new Error("Model not found in list");

    const dtype = info.dtype || (info.id.includes("fp16") ? "fp16" : "q4");
    console.log(`📦 (Worker) Engine Request: ${info.name} (${category}) with ${dtype}...`);

    let finalDtype = dtype.toLowerCase();

    const isJanus = info.id.toLowerCase().includes("janus");
    const deviceChoice = isJanus ? {
      prepare_inputs_embeds: 'wasm',
      language_model: 'webgpu',
      lm_head: 'webgpu',
      gen_head: 'webgpu',
      gen_img_embeds: 'webgpu',
      image_decode: 'webgpu'
    } : (this.isLowMemory || category === "music-gen" || category === "stt" || category === "tts" || category === "image-gen") ? "wasm" : "webgpu";

    // Check shader-f16 capability if Device is WebGPU (fully or partially)
    const isUsingWebGPU = (typeof deviceChoice === "string" && deviceChoice === "webgpu") || 
                          (typeof deviceChoice === "object" && Object.values(deviceChoice).includes("webgpu"));

    if (isUsingWebGPU) {
      const hasShaderF16 = await checkShaderF16Support();
      if (!hasShaderF16) {
        if (finalDtype === "fp16") {
          console.warn(`⚠️ (Worker) WebGPU shader-f16 NOT supported. Falling back to fp32 for ${info.name}`);
          finalDtype = "fp32";
        } else if (finalDtype === "q4f16") {
          console.warn(`⚠️ (Worker) WebGPU shader-f16 NOT supported. Falling back to q4 for ${info.name}`);
          finalDtype = "q4";
        }
      }
    }

    const commonOptions: any = {
      device: deviceChoice,
      dtype: finalDtype,
      progress_callback: (p: any) => {
        if (sendProgress) sendProgress(p);
      }
    };

    const tryLoad = async (options: any) => {
      if (category === "music-gen") {
        if (!this.MusicgenForConditionalGeneration) await this.init();
        this.processor = await AutoProcessor.from_pretrained(info.modelID);
        this.model = await (this.MusicgenForConditionalGeneration as any).from_pretrained(info.modelID, options);
      } else if (info.id === "FastVLM") {
        this.processor = await AutoProcessor.from_pretrained(info.modelID);
        this.model = await AutoModelForImageTextToText.from_pretrained(info.modelID, options);
      } else if (info.id.toLowerCase().includes("janus")) {
        this.processor = await AutoProcessor.from_pretrained(info.modelID);
        this.model = await MultiModalityCausalLM.from_pretrained(info.modelID, options);
      } else if (info.id.toLowerCase().includes("gemma-4")) {
        if (!this.Gemma4ForConditionalGeneration) await this.init();
        try {
          this.processor = await AutoProcessor.from_pretrained(info.modelID);
        } catch (e) {
          this.processor = await AutoTokenizer.from_pretrained(info.modelID);
        }
        this.model = await (this.Gemma4ForConditionalGeneration as any).from_pretrained(info.modelID, options);
      } else if (category === "image-gen") {
        this.pipeline = await (pipeline as any)("image-to-image", info.modelID, options);
      } else if (category === "stt") {
        this.sttPipeline = await pipeline("automatic-speech-recognition", info.modelID, options);
        this.currentSttModelId = modelKey;
      } else if (category === "tts") {
        this.ttsPipeline = await pipeline("text-to-audio", info.modelID, options);
        this.currentTtsModelId = modelKey;
      } else {
        let task: any = "text-generation";
        if (category === "vision") task = "image-to-text";
        this.pipeline = await pipeline(task, info.modelID, options);
      }
    };

    try {
      await tryLoad(commonOptions);
      if (category !== "stt" && category !== "tts") {
        this.currentModelId = modelKey;
      }
    } catch (err: any) {
      const errMsg = String(err);
      const isMemoryFault = 
        errMsg.includes("11514632") || 
        errMsg.includes("7503920") || 
        errMsg.includes("Aborted") || 
        errMsg.includes("OOM") ||
        errMsg.includes("Unexpected internal error");

      const isDeviceWebGPU = typeof commonOptions.device === "string" 
        ? commonOptions.device === "webgpu"
        : (typeof commonOptions.device === "object" && Object.values(commonOptions.device).includes("webgpu"));

      const isWebGPUError = isDeviceWebGPU && (
        !navigator.gpu ||
        errMsg.toLowerCase().includes("webgpu") ||
        errMsg.toLowerCase().includes("adapter") ||
        errMsg.toLowerCase().includes("device") ||
        errMsg.toLowerCase().includes("lost") ||
        errMsg.toLowerCase().includes("gpudevice") ||
        errMsg.toLowerCase().includes("unsupported") ||
        errMsg.toLowerCase().includes("not supported") ||
        errMsg.toLowerCase().includes("not authorized") ||
        errMsg.toLowerCase().includes("permission") ||
        errMsg.toLowerCase().includes("wgsl") ||
        errMsg.toLowerCase().includes("shader") ||
        errMsg.toLowerCase().includes("computepipeline") ||
        errMsg.toLowerCase().includes("gather") ||
        errMsg.toLowerCase().includes("f16") ||
        errMsg.toLowerCase().includes("validation error")
      );

      if (isMemoryFault || isWebGPUError) {
        if (isWebGPUError) {
          console.warn("(Worker) WebGPU is unsupported or throws error. Falling back to WASM engine.");
        } else {
          this.isLowMemory = true;
          console.warn("(Worker) Memory fault detected. Switching to Safe_Stack mode (WASM/q4/Single-Thread).");
          env.useBrowserCache = false;
          // @ts-ignore
          if (env.backends?.onnx?.wasm) {
            env.backends.onnx.wasm.numThreads = 1;
          }
        }
        
        commonOptions.device = "wasm";
        if (finalDtype === "fp16" || finalDtype === "q8") {
          commonOptions.dtype = "q4"; // FP16/q8 on WebAssembly can be slow/unsupported, fallback to q4
        }
        try {
          await tryLoad(commonOptions);
          if (category !== "stt" && category !== "tts") {
            this.currentModelId = modelKey;
          }
        } catch (retryFallback: any) {
          throw new Error(`Engine Total Failure in worker retry: ${String(retryFallback)}`);
        }
      } else {
        throw err;
      }
    }
  }

  async runDirectorInference(input: string, modelId?: string, sendProgress?: (p: any) => void) {
    const director = await this.getDirector(modelId, sendProgress);
    
    const messages = [
      { role: "system", content: DIRECTOR_SYSTEM_PROMPT },
      { role: "user", content: input }
    ];

    let query: any = "";
    if (director.tokenizer?.apply_chat_template) {
      try {
        query = director.tokenizer.apply_chat_template(messages, {
          tokenize: false,
          add_generation_prompt: true
        });
      } catch (e) {
        query = `${DIRECTOR_SYSTEM_PROMPT}\nUser: ${input}\nAssistant:`;
      }
    } else {
      query = `${DIRECTOR_SYSTEM_PROMPT}\nUser: ${input}\nAssistant:`;
    }

    const output = await director(query, {
      max_new_tokens: 128,
      temperature: 0.1,
      do_sample: false,
      return_full_text: false
    });

    const gen = output[0].generated_text;
    let text = "";
    if (Array.isArray(gen)) {
      const assistantMsgs = gen.filter((m: any) => m.role === "assistant");
      const lastMsg = assistantMsgs.length > 0 ? assistantMsgs[assistantMsgs.length - 1] : gen[gen.length - 1];
      text = lastMsg?.content || lastMsg || "";
    } else {
      text = String(gen);
    }
    
    let thinking = "";
    const thinkRegex = /<think>([\s\S]*?)<\/think>/gi;
    const thinkMatch = thinkRegex.exec(text);
    if (thinkMatch) {
      thinking = thinkMatch[1].trim();
      text = text.replace(thinkRegex, "").trim();
    } else {
      const openThinkIdx = text.toLowerCase().indexOf("<think>");
      if (openThinkIdx !== -1) {
        thinking = text.substring(openThinkIdx + 7).trim();
        text = text.substring(0, openThinkIdx).trim();
      }
    }
    
    let cleanOutput = text.trim();
    
    // If the full text was still returned by the engine, let's aggressively strip the prompt
    const lowerText = text.toLowerCase();
    const markers = ["assistant\n", "assistant:", "output:", "<|im_start|>assistant\n"];
    let bestIndex = -1;
    let markerLength = 0;
    
    for (const marker of markers) {
      const idx = lowerText.lastIndexOf(marker);
      if (idx > bestIndex) {
        bestIndex = idx;
        markerLength = marker.length;
      }
    }
    
    if (bestIndex !== -1) {
      cleanOutput = text.substring(bestIndex + markerLength).trim();
    } else {
      if (typeof query === "string" && cleanOutput.startsWith(query)) {
        cleanOutput = cleanOutput.substring(query.length).trim();
      } else if (cleanOutput.includes("Current User Input:")) {
        cleanOutput = cleanOutput.split("Current User Input:")[1].split("\n").slice(1).join("\n").trim();
      }
    }

    // Strip wrapping quotes if any (e.g. "image_gen" -> image_gen or "draw" -> draw)
    cleanOutput = cleanOutput.replace(/^["'`]|["'`]$/g, "").trim();

    console.log("🎬 (Worker) Director Output Raw:", text);
    console.log("🎬 (Worker) Director Output Parsed:", cleanOutput);
    
    let category = "text";
    let prompt = input;

    const lowerOutput = cleanOutput.toLowerCase();

    if (lowerOutput.includes("@image")) {
      category = "image-gen";
      const parts = cleanOutput.split(/@image/i);
      const content = parts[parts.length - 1].replace(/^:/, "").trim();
      if (content.length > 0 && !["gen", "_gen"].includes(content.toLowerCase())) {
        prompt = content;
      }
    } else if (lowerOutput.includes("@music")) {
      category = "music-gen";
      const parts = cleanOutput.split(/@music/i);
      const content = parts[parts.length - 1].replace(/^:/, "").trim();
      if (content.length > 0 && !["gen", "_gen"].includes(content.toLowerCase())) {
        prompt = content;
      }
    } else if (lowerOutput.includes("@vision")) {
      category = "vision";
      const parts = cleanOutput.split(/@vision/i);
      const content = parts[parts.length - 1].replace(/^:/, "").trim();
      if (content.length > 0) {
        prompt = content;
      }
    } else if (lowerOutput.includes("@coder") || lowerOutput.includes("@sandbox")) {
      category = "coder";
      const parts = cleanOutput.split(/@coder|@sandbox/i);
      const content = parts[parts.length - 1].replace(/^:/, "").trim();
      if (content.length > 0) {
        prompt = content;
      }
    } else if (lowerOutput.includes("@text")) {
      category = "text";
      const parts = cleanOutput.split(/@text/i);
      const content = parts[parts.length - 1].replace(/^:/, "").trim();
      if (content.length > 0) {
        prompt = content;
      }
    } else {
      if (lowerOutput.includes("image_gen") || lowerOutput.includes("mage_gen") || lowerOutput.includes("image") || lowerOutput.includes("draw") || lowerOutput.includes("paint") || lowerOutput.includes("picture") || lowerOutput.includes("sketch") || lowerOutput.includes("generate an image") || lowerOutput.includes("generate image")) {
        category = "image-gen";
      } else if (lowerOutput.includes("music_gen") || lowerOutput.includes("music") || lowerOutput.includes("song") || lowerOutput.includes("melody")) {
        category = "music-gen";
      } else if (lowerOutput.includes("sandbox") || lowerOutput.includes("coder") || lowerOutput.includes("code") || lowerOutput.includes("program") || lowerOutput.includes("javascript") || lowerOutput.includes("html") || lowerOutput.includes("react") || lowerOutput.includes("website") || lowerOutput.includes("app ")) {
        category = "coder";
      } else {
        category = "text";
      }
    }

    return { category, prompt, thinking };
  }

  async runInference(category: string, input: any, options: any = {}, sendProgress?: (p: any) => void, onToken?: (token: string) => void) {
    if (this.isBusy) throw new Error("Engine Busy");
    this.isBusy = true;
    try {
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
      await this.loadModel(category, modelId, sendProgress);

      let parsedMaxTokens: number | undefined;
      const rawMaxTokens = options.maxTokens !== undefined ? options.maxTokens : options.max_new_tokens;
      if (rawMaxTokens !== undefined) {
        parsedMaxTokens = Number(rawMaxTokens);
      }

      let maxTokens = this.isLowMemory ? 256 : (parsedMaxTokens || 512);

      const capacity = this.getModelCapacity();
      if (maxTokens > capacity) {
        console.log(`⚠️ Requested maxTokens (${maxTokens}) exceeds model capacity (${capacity}). Capping to capacity.`);
        maxTokens = capacity;
      }

      if (category === "music-gen") {
        const inputs = this.processor(input);
        const audio_values = await this.model.generate({ ...inputs, max_new_tokens: maxTokens, do_sample: true, guidance_scale: 3 });
        
        const sampling_rate = this.model.config.audio_encoder.sampling_rate;
        const wavUrl = await this.float32ArrayToWavUrl(audio_values.audio_values.data, sampling_rate);
        
        this.safeDisposeTensors(inputs);
        this.safeDisposeTensors(audio_values);
        
        return { audio: wavUrl, sampling_rate };
      }

      if (category === "stt") {
        if (!this.sttPipeline) throw new Error("STT pipeline not loaded");
        const pipeOptions = { max_new_tokens: maxTokens, ...options };
        const output = await this.sttPipeline(input, pipeOptions);
        if (Array.isArray(output) && output[0]?.text !== undefined) {
          return output[0].text;
        }
        if (output && typeof output === "object" && (output as any).text !== undefined) {
          return (output as any).text;
        }
        return output;
      }

      if (category === "tts") {
        if (!this.ttsPipeline) throw new Error("TTS pipeline not loaded");
        const pipeOptions = { max_new_tokens: maxTokens, ...options };
        const output = await this.ttsPipeline(input, pipeOptions);
        return output;
      }

      if (this.currentModelId?.toLowerCase().includes("gemma-4")) {
        const isVision = !!input.image;
        const isAudio = !!input.audio;
        const isMultimodal = isVision || isAudio;
        
        let messages;
        if (options.chatHistory && Array.isArray(options.chatHistory)) {
          messages = options.chatHistory.map((m: any) => {
            if (m.role === "system") {
              return { role: "system", content: m.content };
            } else if (m.role === "user") {
              const hasImg = !!m.image;
              const textContent = m.timestamp ? `[${m.timestamp}] ${m.content}` : m.content;
              if (hasImg) {
                return {
                  role: "user",
                  content: [
                    { type: "image" },
                    { type: "text", text: textContent }
                  ]
                };
              } else {
                return { role: "user", content: textContent };
              }
            } else {
              const textContent = m.timestamp ? `[${m.timestamp}] ${m.content}` : m.content;
              return { role: "assistant", content: textContent };
            }
          });
        } else if (isMultimodal) {
          messages = [
            {
              role: "user",
              content: [
                ...(isVision ? [{ type: "image" }] : []),
                ...(isAudio ? [{ type: "audio" }] : []),
                {
                  type: "text",
                  text: options.prompt || (typeof input === 'string' ? input : "Describe this content"),
                },
              ],
            },
          ];
        } else {
          messages = [
            { role: "user", content: typeof input === 'string' ? input : (options.prompt || "Hello") }
          ];
        }

        const prompt = this.processor.apply_chat_template(messages, {
          enable_thinking: false,
          add_generation_prompt: true,
          tokenize: false,
        });

        let inputs;
        if (isMultimodal && this.processor.constructor.name === "Processor") {
          inputs = await this.processor(prompt, isVision ? input.image : null, isAudio ? input.audio : null, {
            add_special_tokens: false,
          });
        } else {
          inputs = await this.processor(prompt, {
            add_special_tokens: false,
          });
        }

        const tempVal = options.temperature !== undefined ? Number(options.temperature) : undefined;
        const topPVal = options.top_p !== undefined ? Number(options.top_p) : undefined;
        let gemmaDoSample = options.do_sample !== undefined ? !!options.do_sample : false;
        if (tempVal !== undefined || topPVal !== undefined) {
          gemmaDoSample = tempVal !== 0;
        }

        const outputs = await this.model.generate({
          ...inputs,
          max_new_tokens: maxTokens,
          do_sample: gemmaDoSample,
          ...(tempVal !== undefined ? { temperature: tempVal } : {}),
          ...(topPVal !== undefined ? { top_p: topPVal } : {}),
        });

        const sliceOutput = outputs.slice(null, [inputs.input_ids.dims.at(-1), null]);
        const decoded = this.processor.batch_decode(
          sliceOutput,
          { skip_special_tokens: true },
        );
        
        this.safeDisposeTensors(inputs);
        this.safeDisposeTensors(outputs);
        this.safeDisposeTensors(sliceOutput);
        
        return decoded[0];
      }

      if (this.currentModelId?.toLowerCase()?.includes("fastvlm")) {
        const isVision = category === "vision";
        if (!isVision) {
          // Fallback to text mode if somehow called without image
          const inputs = await this.processor(input);
          const outputs = await this.model.generate({ ...inputs, max_new_tokens: maxTokens });
          const new_tokens = outputs.slice(null, [inputs.input_ids.dims.at(-1), null]);
          const decoded = this.processor.batch_decode(new_tokens, { skip_special_tokens: true });
          
          this.safeDisposeTensors(inputs);
          this.safeDisposeTensors(outputs);
          this.safeDisposeTensors(new_tokens);
          
          return decoded[0];
        }

        // We have an image (input is the base64 string or RawImage)
        const image = await RawImage.fromURL(input);
        
        let inputs;
        try {
          if (this.processor.apply_chat_template || this.processor.tokenizer?.apply_chat_template) {
            const conversation = [
              {
                role: "user",
                content: [
                  { type: "image" },
                  { type: "text", text: options.prompt || "Describe this image" }
                ]
              }
            ];
            inputs = await this.processor(conversation, { images: image });
          } else {
            throw new Error("No apply_chat_template");
          }
        } catch (e) {
          console.warn("(Worker) Processor apply_chat_template failed, using fallback image+text processing for FastVLM:", e);
          const prompt = `<|im_start|>user\n<image>\n${options.prompt || "Describe this image"}<|im_end|>\n<|im_start|>assistant\n`;
          inputs = await this.processor(image, prompt);
        }

        const outputs = await this.model.generate({
          ...inputs,
          max_new_tokens: maxTokens,
          do_sample: false,
        });

        const sliceOutput = outputs.slice(null, [inputs.input_ids.dims.at(-1), null]);
        const decoded = this.processor.batch_decode(
          sliceOutput,
          { skip_special_tokens: true },
        );
        
        this.safeDisposeTensors(inputs);
        this.safeDisposeTensors(outputs);
        this.safeDisposeTensors(sliceOutput);
        if (image && typeof (image as any).dispose === 'function') {
          try { (image as any).dispose(); } catch (e) {}
        }
        
        return decoded[0];
      }

      if (this.currentModelId?.toLowerCase().includes("janus")) {
        const isVision = category === "vision";
        
        let inputs;
        if (isVision) {
          const rawImage = await RawImage.fromURL(input);
          
          // Try modern content array format matching Python structure
          try {
            const messages = [
              {
                role: "<|User|>",
                content: [
                  { type: "image" },
                  { type: "text", text: options.prompt || "Describe this image" }
                ],
                images: [rawImage]
              }
            ];
            inputs = await this.processor(messages, { generation_mode: "text" });
          } catch (err) {
            console.warn("(Worker) Janus modern content-array format failed, falling back to original format", err);
            const conversation = [
              { role: "<|User|>", content: `<image_placeholder>\n${options.prompt || "Describe this image"}`, images: [rawImage] }
            ];
            inputs = await this.processor(conversation);
          }
          
          const outputs = await this.model.generate({ 
            ...inputs, 
            max_new_tokens: maxTokens,
            generation_mode: "text" 
          });
          const new_tokens = outputs.slice(null, [inputs.input_ids.dims.at(-1), null]);
          const decoded = this.processor.batch_decode(new_tokens, { skip_special_tokens: true });
          
          this.safeDisposeTensors(inputs);
          this.safeDisposeTensors(outputs);
          this.safeDisposeTensors(new_tokens);
          if (rawImage && typeof (rawImage as any).dispose === 'function') {
            try { (rawImage as any).dispose(); } catch (e) {}
          }
          
          return decoded[0];
          
        } else {
          // Text to Image task
          try {
            const messages = [
              {
                role: "<|User|>",
                content: [
                  { type: "text", text: input }
                ]
              }
            ];
            inputs = await this.processor(messages, { chat_template: "text_to_image" });
          } catch (err) {
            console.warn("(Worker) Janus text_to_image modern messages failed, falling back to simple format", err);
            const conversation = [
              { role: "<|User|>", content: input }
            ];
            inputs = await this.processor(conversation, { chat_template: "text_to_image" });
          }
          
          const num_image_tokens = this.processor.num_image_tokens || 576;
          const outputs = await this.model.generate_images({ 
            ...inputs, 
            min_new_tokens: num_image_tokens, 
            max_new_tokens: num_image_tokens, 
            do_sample: true 
          });
          
          const raw = outputs[0];
          const result = {
            __serialized_type__: "RawImage",
            width: raw.width,
            height: raw.height,
            channels: raw.channels,
            data: Array.from(raw.data)
          };
          
          this.safeDisposeTensors(inputs);
          this.safeDisposeTensors(outputs);
          
          return result;
        }
      }

      if (this.pipeline) {
        const pipeTemp = options.temperature !== undefined ? Number(options.temperature) : undefined;
        const pipeTopP = options.top_p !== undefined ? Number(options.top_p) : undefined;
        let pipeDoSample = options.do_sample !== undefined ? !!options.do_sample : undefined;
        if (pipeTemp !== undefined || pipeTopP !== undefined) {
          pipeDoSample = pipeTemp !== 0;
        }

        const pipeOptions: any = {
          ...options,
          max_new_tokens: maxTokens,
          ...(pipeTemp !== undefined ? { temperature: pipeTemp } : {}),
          ...(pipeTopP !== undefined ? { top_p: pipeTopP } : {}),
          ...(pipeDoSample !== undefined ? { do_sample: pipeDoSample } : {}),
        };
        let formattedInput: any = input;
        let promptString = "";
        let promptWithoutSpecialTokens = "";

        const isTextGen = this.pipeline.task === "text-generation";

        if (isTextGen && typeof input === "string") {
          const messages = [];
          if (options.chatHistory && Array.isArray(options.chatHistory)) {
            const hasSystem = options.chatHistory.some((m: any) => m.role === "system");
            if (!hasSystem) {
              if (options.systemPrompt) {
                messages.push({ role: "system", content: options.systemPrompt });
              } else {
                messages.push({ role: "system", content: "You are a helpful assistant." });
              }
            }
            options.chatHistory.forEach((m: any) => {
              if (m.role === "system") {
                messages.push({ role: "system", content: m.content });
              } else if (m.role === "user" || m.role === "assistant") {
                messages.push({ role: m.role, content: m.content });
              }
            });
          } else {
            if (options.systemPrompt) {
              messages.push({ role: "system", content: options.systemPrompt });
            } else {
              messages.push({ role: "system", content: "You are a helpful assistant." });
            }
            messages.push({ role: "user", content: input });
          }

          let isTemplatedOk = false;
          try {
            if (this.pipeline.tokenizer?.apply_chat_template) {
              const templated = this.pipeline.tokenizer.apply_chat_template(messages, {
                tokenize: false,
                add_generation_prompt: true
              });
              if (templated && typeof templated === "string" && templated.trim().length > 0) {
                formattedInput = templated;
                promptString = templated;
                isTemplatedOk = true;
              }
            }
          } catch (templateErr) {
            console.warn("Worker: apply_chat_template failed, using robust fallback compileChatTemplate:", templateErr);
          }

          if (!isTemplatedOk) {
            const compiled = compileChatTemplate(this.currentModelId || "", messages);
            formattedInput = compiled;
            promptString = compiled;
          }
        }

        if (this.pipeline.tokenizer) {
          try {
            const promptTokens = this.pipeline.tokenizer.encode(formattedInput);
            const tokensArray = Array.from((promptTokens && promptTokens.data) || promptTokens || []);
            promptWithoutSpecialTokens = this.pipeline.tokenizer.decode(tokensArray, { skip_special_tokens: true });
          } catch (e) {
            console.warn("Failed to decode prompt without special tokens in worker:", e);
            promptWithoutSpecialTokens = typeof formattedInput === "string" ? formattedInput : "";
          }
        }

        if (onToken && this.pipeline.tokenizer) {
          let lastLength = 0;

          pipeOptions.callback_function = (beams: any) => {
            const decoded = this.pipeline.tokenizer.decode(beams[0].output_token_ids, { skip_special_tokens: true });
            let currentText = decoded;

            if (promptWithoutSpecialTokens) {
              try {
                let resIdx = 0;
                let promptIdx = 0;
                while (promptIdx < promptWithoutSpecialTokens.length && resIdx < currentText.length) {
                  const pChar = promptWithoutSpecialTokens[promptIdx];
                  const rChar = currentText[resIdx];
                  if (pChar === rChar) {
                    promptIdx++;
                    resIdx++;
                  } else if (/\s/.test(pChar)) {
                    promptIdx++;
                  } else if (/\s/.test(rChar)) {
                    resIdx++;
                  } else {
                    break;
                  }
                }
                if (promptIdx >= promptWithoutSpecialTokens.length - 2) {
                  currentText = currentText.substring(resIdx);
                } else {
                  currentText = "";
                }
              } catch (e) {
                if (currentText.startsWith(promptWithoutSpecialTokens)) {
                  currentText = currentText.substring(promptWithoutSpecialTokens.length);
                } else {
                  currentText = "";
                }
              }
            } else if (promptString && currentText.startsWith(promptString)) {
              currentText = currentText.substring(promptString.length);
            }

            const newToken = currentText.substring(lastLength);
            lastLength = currentText.length;
            if (newToken) {
              onToken(newToken);
            }
          };
        }

        const output = await this.pipeline(formattedInput, pipeOptions);
        if (output instanceof RawImage) {
          const result = {
            __serialized_type__: "RawImage",
            width: output.width,
            height: output.height,
            channels: output.channels,
            data: Array.from(output.data)
          };
          this.safeDisposeTensors(output);
          this.safeDisposeTensors(formattedInput);
          return result;
        }
        
        let responseText = "";
        if (Array.isArray(output) && output[0]?.generated_text !== undefined) {
          const gen = output[0].generated_text;
          if (Array.isArray(gen)) {
            const assistantMsgs = gen.filter((m: any) => m.role === "assistant");
            const lastMsg = assistantMsgs.length > 0 ? assistantMsgs[assistantMsgs.length - 1] : gen[gen.length - 1];
            if (lastMsg && typeof lastMsg.content === "string") {
              responseText = lastMsg.content;
            } else if (lastMsg && typeof lastMsg === "string") {
              responseText = lastMsg;
            } else {
              responseText = JSON.stringify(gen);
            }
          } else if (typeof gen === "string") {
            responseText = gen;
            
            // Apply the robust prompt stripper on responseText
            let strippedResponse = responseText;
            if (promptWithoutSpecialTokens) {
              try {
                let resIdx = 0;
                let promptIdx = 0;
                while (promptIdx < promptWithoutSpecialTokens.length && resIdx < strippedResponse.length) {
                  const pChar = promptWithoutSpecialTokens[promptIdx];
                  const rChar = strippedResponse[resIdx];
                  if (pChar === rChar) {
                    promptIdx++;
                    resIdx++;
                  } else if (/\s/.test(pChar)) {
                    promptIdx++;
                  } else if (/\s/.test(rChar)) {
                    resIdx++;
                  } else {
                    break;
                  }
                }
                if (promptIdx >= promptWithoutSpecialTokens.length - 5) {
                  strippedResponse = strippedResponse.substring(resIdx).trim();
                }
              } catch (e) {
                if (strippedResponse.startsWith(promptWithoutSpecialTokens)) {
                  strippedResponse = strippedResponse.substring(promptWithoutSpecialTokens.length).trim();
                }
              }
            }
            
            if (strippedResponse !== responseText) {
              responseText = strippedResponse;
            } else if (promptString && responseText.startsWith(promptString)) {
              responseText = responseText.substring(promptString.length).trim();
            } else if (typeof input === "string" && responseText.startsWith(input)) {
              responseText = responseText.substring(input.length).trim();
            }
          } else {
            responseText = String(gen);
          }
        } else {
          responseText = typeof output === "string" ? output : JSON.stringify(output);
        }

        this.safeDisposeTensors(output);
        this.safeDisposeTensors(formattedInput);
        return responseText;
      }
      return null;
    } finally {
      this.isBusy = false;
    }
  }

  async getEmbedding(text: string, sendProgress?: (p: any) => void): Promise<number[]> {
    if (!this.embeddingPipeline) {
      console.log("🚀 (Worker) Loading Lightweight Semantic Embeddings Engine (all-MiniLM-L6-v2)...");
      this.embeddingPipeline = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
        device: "wasm",
        progress_callback: sendProgress
      });
    }
    const output = await this.embeddingPipeline(text, { pooling: "mean", normalize: true });
    return Array.from(output.data);
  }

  async clear() {
    console.log("🧹 (Worker) Engine Purge requested...");
    await this.clearHeavy();
    await this.forceUnloadDirector();
    
    if (this.sttPipeline) {
      await this.safeDispose(this.sttPipeline);
      this.sttPipeline = null;
      this.currentSttModelId = null;
    }
    if (this.ttsPipeline) {
      await this.safeDispose(this.ttsPipeline);
      this.ttsPipeline = null;
      this.currentTtsModelId = null;
    }
    if (this.embeddingPipeline) {
      await this.safeDispose(this.embeddingPipeline);
      this.embeddingPipeline = null;
    }
    this.isBusy = false;
  }

  private getDefaultModel(category: string) {
    const found = MODELS.find(m => m.category === category);
    return found ? found.id : "";
  }

  private getModelCapacity(): number {
    const config = this.model?.config || this.pipeline?.model?.config;
    if (config) {
      const maxPos = config.max_position_embeddings || config.n_positions || config.n_ctx || config.max_seq_len;
      if (typeof maxPos === "number" && maxPos > 0) {
        return maxPos;
      }
    }
    const tokenizer = this.processor?.tokenizer || this.pipeline?.tokenizer;
    if (tokenizer && typeof tokenizer.model_max_length === "number" && tokenizer.model_max_length > 0 && tokenizer.model_max_length < 100000) {
      return tokenizer.model_max_length;
    }
    if (this.currentModelId) {
      const lower = this.currentModelId.toLowerCase();
      if (lower.includes("llama-3")) return 8192;
      if (lower.includes("gemma")) return 8192;
      if (lower.includes("qwen")) return 32768;
      if (lower.includes("phi-4")) return 16384;
    }
    return 2048;
  }

  private async float32ArrayToWavUrl(audioData: Float32Array, sampleRate: number): Promise<string> {
    const buffer = new ArrayBuffer(44 + audioData.length * 2);
    const view = new DataView(buffer);

    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + audioData.length * 2, true);
    this.writeString(view, 8, 'WAVE');
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    this.writeString(view, 36, 'data');
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

  private writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
  }
}

const engine = new WorkerModelEngine();

// Web Worker API listener
self.addEventListener("message", async (e: MessageEvent) => {
  const { type, requestId, payload } = e.data;

  try {
    switch (type) {
      case "init": {
        await engine.init();
        self.postMessage({ type: "complete", requestId });
        break;
      }
      case "setSafeMode": {
        engine.setSafeMode(payload.val);
        self.postMessage({ type: "complete", requestId });
        break;
      }
      case "loadModel": {
        await engine.loadModel(payload.category, payload.modelId, (p) => {
          self.postMessage({ type: "progress", requestId, progress: p });
        });
        self.postMessage({ type: "complete", requestId });
        break;
      }
      case "unloadDirector": {
        await engine.unloadDirector();
        self.postMessage({ type: "complete", requestId });
        break;
      }
      case "clear": {
        await engine.clear();
        self.postMessage({ type: "complete", requestId });
        break;
      }
      case "getEstimatedLoadedWeightsBytes": {
        const bytes = engine.getEstimatedLoadedWeightsBytes();
        self.postMessage({ type: "complete", requestId, result: bytes });
        break;
      }
      case "runDirectorInference": {
        const res = await engine.runDirectorInference(payload.input, payload.modelId, (p) => {
          self.postMessage({ type: "progress", requestId, progress: p });
        });
        self.postMessage({ type: "complete", requestId, result: res });
        break;
      }
      case "getEmbedding": {
        const res = await engine.getEmbedding(payload.text, (p) => {
          self.postMessage({ type: "progress", requestId, progress: p });
        });
        self.postMessage({ type: "complete", requestId, result: res });
        break;
      }
      case "runInference": {
        const res = await engine.runInference(
          payload.category,
          payload.input,
          payload.options,
          (p) => {
            self.postMessage({ type: "progress", requestId, progress: p });
          },
          (token) => {
            self.postMessage({ type: "token", requestId, token });
          }
        );
        self.postMessage({ type: "complete", requestId, result: res });
        break;
      }
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (err: any) {
    console.error(`Worker error executing command ${type}:`, err);
    self.postMessage({ type: "error", requestId, error: err.message || String(err) });
  }
});
