import { 
  pipeline, 
  AutoTokenizer, 
  AutoProcessor,
  AutoModelForImageTextToText,
  MultiModalityCausalLM,
  RawImage,
  env 
} from "@huggingface/transformers";
import { MODELS, normalizeAndRegisterModel } from "@shared/modelList";
import { checkShaderF16Support, safeDispose, safeDisposeTensors } from "./helpers/helpers.worker";
import { handleTextInference, runDirectorInference, getEmbedding } from "./modes/text";
import { handleImageInference } from "./modes/image";
import { handleMusicInference } from "./modes/music";
import { handleSandboxInference } from "./modes/sandbox";
import { handleRealtimeInference } from "./modes/realtime";

export class WorkerModelEngine {
  public currentModelId: string | null = null;
  public currentDtype: string | null = null;
  public pipeline: any = null;
  public processor: any = null;
  public model: any = null;
  public director: any = null;
  public directorModel: any = null;
  public directorProcessor: any = null;
  public directorModelId: string | null = null;
  public directorDtype: string | null = null;
  public sttPipeline: any = null;
  public currentSttModelId: string | null = null;
  public ttsPipeline: any = null;
  public currentTtsModelId: string | null = null;
  public embeddingPipeline: any = null;
  public isBusy: boolean = false;
  public isLowMemory: boolean = false;

  public Gemma4ForConditionalGeneration: any = null;
  public MusicgenForConditionalGeneration: any = null;

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

  async getDirector(modelId: string = "onnx-community/Qwen2.5-0.5B-Instruct", sendProgress?: (p: any) => void, customDtype?: string) {
    if (this.director || this.directorModel) return this.director || this.directorModel;

    const resolved = normalizeAndRegisterModel(modelId, "director");
    const info = resolved;
    modelId = resolved.id;
    const requestedDtype = (customDtype || info?.dtype || "q4").toLowerCase();

    // Direct bypass: Check if we have the SAME model already loaded in the text-generation pipeline or custom model
    if (modelId.toLowerCase().includes("gemma-4")) {
      if (this.model && this.currentModelId) {
        const parts = this.currentModelId.split(":");
        const loadedModelId = parts[1];
        const loadedInfo = MODELS.find(m => m.id === loadedModelId);
        if (loadedInfo && (loadedInfo.modelID === info.modelID || loadedInfo.id === modelId)) {
          if (!this.currentDtype || this.currentDtype === requestedDtype) {
            console.log(`♻️ (Worker) Reusing already loaded Gemma 4 model (${loadedInfo.id}) as Director`);
            this.directorModel = this.model;
            this.directorProcessor = this.processor;
            this.directorModelId = modelId;
            this.directorDtype = this.currentDtype || requestedDtype;
            return this.directorModel;
          }
        }
      }
    } else {
      if (this.pipeline && this.currentModelId) {
        const parts = this.currentModelId.split(":");
        const loadedModelId = parts[1];
        const loadedInfo = MODELS.find(m => m.id === loadedModelId);
        if (loadedInfo && (loadedInfo.modelID === info.modelID || loadedInfo.id === modelId)) {
          if (!this.currentDtype || this.currentDtype === requestedDtype) {
            console.log(`♻️ (Worker) Reusing already loaded text generation model (${loadedInfo.id}) as Director`);
            this.director = this.pipeline;
            this.directorModelId = modelId;
            this.directorDtype = this.currentDtype || requestedDtype;
            return this.director;
          }
        }
      }
    }

    if (this.pipeline || this.model) {
      await this.clearHeavy();
    }

    const options: any = {
      progress_callback: (p: any) => {
        if (sendProgress) sendProgress(p);
      }
    };
    
    console.log(`📦 (Worker) Persistent Director Engine Dtype: ${requestedDtype}`);
    
    let finalDtype = requestedDtype;
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
    
    if (modelId.toLowerCase().includes("gemma-4")) {
      console.log(`🚀 (Worker) Loading Persistent Director Engine (Gemma 4): ${info.modelID}...`);
      options.device = "webgpu";
      options.dtype = finalDtype;

      if (!this.Gemma4ForConditionalGeneration) await this.init();

      try {
        this.directorProcessor = await AutoProcessor.from_pretrained(info.modelID);
      } catch (e) {
        this.directorProcessor = await AutoTokenizer.from_pretrained(info.modelID);
      }

      try {
        this.directorModel = await (this.Gemma4ForConditionalGeneration as any).from_pretrained(info.modelID, options);
      } catch (e) {
        console.warn("Director Gemma 4 WebGPU failed, falling back to WASM:", e);
        options.device = "wasm";
        options.dtype = (finalDtype === "fp16" || finalDtype === "q8") ? "q4" : finalDtype;
        this.directorModel = await (this.Gemma4ForConditionalGeneration as any).from_pretrained(info.modelID, options);
      }

      this.directorModelId = modelId;
      this.directorDtype = finalDtype;
      return this.directorModel;
    } else {
      console.log(`🚀 (Worker) Loading Persistent Director Engine: ${info.modelID}...`);
      try {
        this.director = await pipeline("text-generation", info.modelID, {
          ...options,
          device: "webgpu",
          dtype: finalDtype
        });
      } catch (e) {
        console.warn("Director WebGPU failed in worker, falling back to WASM:", e);
        this.director = await pipeline("text-generation", info.modelID, {
          ...options,
          device: "wasm",
          dtype: (finalDtype === "fp16" || finalDtype === "q8") ? "q4" : finalDtype
        });
      }
      this.directorModelId = modelId;
      this.directorDtype = finalDtype;
      return this.director;
    }
  }

  async unloadDirector() {
    if (this.director || this.directorModel) {
      console.log("🧹 (Worker) Unloading Director Engine to reclaim VRAM...");
      if (this.director) {
        if (typeof this.director.dispose === "function") {
          await safeDispose(this.director);
        } else if (this.director.model) {
          await safeDispose(this.director.model);
        }
        this.director = null;
      }
      if (this.directorModel) {
        await safeDispose(this.directorModel);
        this.directorModel = null;
      }
      this.directorProcessor = null;
      this.directorModelId = null;
      this.directorDtype = null;
      // Settle time for GC and webgpu cache release
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  async forceUnloadDirector() {
    if (this.director || this.directorModel) {
      console.log("🧹 (Worker) Force unloading Director Engine...");
      if (this.director) {
        if (typeof this.director.dispose === "function") {
          await safeDispose(this.director);
        } else if (this.director.model) {
          await safeDispose(this.director.model);
        }
        this.director = null;
      }
      if (this.directorModel) {
        await safeDispose(this.directorModel);
        this.directorModel = null;
      }
      this.directorProcessor = null;
      this.directorModelId = null;
      this.directorDtype = null;
      // Settle time for GC and webgpu cache release
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  async clearHeavy() {
    console.log("🧹 (Worker) Purging heavy asset threads...");
    try {
      if (this.pipeline) {
        if (typeof this.pipeline.dispose === "function") {
          await safeDispose(this.pipeline);
        } else if (this.pipeline.model) {
          await safeDispose(this.pipeline.model);
        }
      }
      if (this.model) {
        await safeDispose(this.model);
      }
    } catch (gcErr) {
      console.warn("Exception during explicit pipeline GC cleaning in worker:", gcErr);
    }
    this.pipeline = null;
    this.model = null;
    this.processor = null;
    this.currentModelId = null;
    this.currentDtype = null;
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

  async loadModel(category: string, modelId: string, sendProgress?: (p: any) => void, customDtype?: string) {
    const resolved = normalizeAndRegisterModel(modelId, category as any);
    modelId = resolved.id;
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
        const expectedDtype = (customDtype || info.dtype || (info.id.includes("fp16") ? "fp16" : "q4")).toLowerCase();
        if (!this.directorDtype || this.directorDtype === expectedDtype) {
          console.log(`♻️ (Worker) Reusing active Director as text pipeline (${info.id})`);
          this.pipeline = this.director;
          this.currentModelId = modelKey;
          this.currentDtype = this.directorDtype || expectedDtype;
          return;
        }
      }

      await this.clearHeavy();
      await this.forceUnloadDirector();
    }

    const info = MODELS.find(m => m.id === modelId);
    if (!info) throw new Error("Model not found in list");

    const dtype = customDtype || info.dtype || (info.id.includes("fp16") ? "fp16" : "q4");
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
        this.currentDtype = finalDtype;
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
      } else {
        const resolved = normalizeAndRegisterModel(modelId, category as any);
        modelId = resolved.id;
        options.modelId = resolved.id;
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

      // 1. Music Gen Mode
      if (category === "music-gen") {
        return await handleMusicInference(this, input, maxTokens);
      }

      // 2. STT or TTS Realtime Audio Mode
      if (category === "stt" || category === "tts") {
        return await handleRealtimeInference(this, category, input, options, maxTokens);
      }

      // 3. Image Vision Mode or Text to Image
      const isVisionModel = this.currentModelId?.toLowerCase()?.includes("fastvlm") || 
                           this.currentModelId?.toLowerCase()?.includes("janus");
      if (category === "vision" || (category === "image-gen" && isVisionModel)) {
        return await handleImageInference(this, category, input, options, maxTokens);
      }

      // 4. Coder / Sandbox specific tasks
      if (category === "coder" || category === "sandbox") {
        return await handleSandboxInference(this, input, options, maxTokens, sendProgress, onToken);
      }

      // 5. Default Text / Chat Mode
      return await handleTextInference(this, category, input, options, maxTokens, sendProgress, onToken);

    } finally {
      this.isBusy = false;
    }
  }

  async clear() {
    console.log("🧹 (Worker) Engine Purge requested...");
    await this.clearHeavy();
    await this.forceUnloadDirector();
    
    if (this.sttPipeline) {
      await safeDispose(this.sttPipeline);
      this.sttPipeline = null;
      this.currentSttModelId = null;
    }
    if (this.ttsPipeline) {
      await safeDispose(this.ttsPipeline);
      this.ttsPipeline = null;
      this.currentTtsModelId = null;
    }
    if (this.embeddingPipeline) {
      await safeDispose(this.embeddingPipeline);
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
        }, payload.customDtype);
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
        const res = await runDirectorInference(engine, payload.input, payload.modelId, (p) => {
          self.postMessage({ type: "progress", requestId, progress: p });
        }, payload.customDtype);
        self.postMessage({ type: "complete", requestId, result: res });
        break;
      }
      case "getEmbedding": {
        const res = await getEmbedding(engine, payload.text, (p) => {
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

self.addEventListener("unhandledrejection", (e) => {
  console.error("Worker unhandledrejection:", e.reason);
  self.postMessage({ 
    type: "error", 
    requestId: "global", 
    error: e.reason?.message || String(e.reason) 
  });
});
