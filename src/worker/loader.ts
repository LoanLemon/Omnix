import * as ort from "onnxruntime-web";
import { 
  state, 
  disposeResources, 
  AutoTokenizer, 
  AutoProcessor, 
  Gemma4ForConditionalGeneration, 
  AutoModelForImageTextToText,
  MultiModalityCausalLM,
  DiffusionPipeline,
  MusicgenForConditionalGeneration,
  pipeline
} from "./state";

export async function loadModel(data: any) {
  const { modelID, path, modelfile, dtype, category } = data;
  const revision = path || 'main';
  const modelKey = `${modelID}@${revision}`;
  
  if (state.currentModel === modelKey && state.currentDtype === dtype && (state.generator || state.model)) {
    self.postMessage({ type: "ready", data: { model: modelKey, category } });
    return;
  }

  try {
    self.postMessage({ type: "status", data: { message: `Loading ${category} model: ${modelID}...` } });
    
    const progress_callback = (progress: any) => {
      const sanitized = { ...progress };
      if (isNaN(sanitized.progress)) sanitized.progress = 0;
      if (sanitized.status === "done") sanitized.progress = 100;
      self.postMessage({ type: "progress", data: sanitized });
    };

    const options: any = {
      device: "webgpu",
      progress_callback,
      revision: revision,
    };

    if (modelfile) options.model_file = modelfile;
    if (dtype) options.dtype = dtype;

    // Reset state
    await disposeResources();
    // Small delay to allow WebGPU to stabilize after disposal
    await new Promise(resolve => setTimeout(resolve, 100));
    
    state.isGemma4 = modelID.toLowerCase().includes("gemma-4");
    state.isLFM = modelID.toLowerCase().includes("lfm");

    if (state.isLFM) {
      const modelBase = `https://huggingface.co/${modelID}/resolve/main`;
      state.lfmTokenizer = await AutoTokenizer.from_pretrained(modelID, { revision, progress_callback });
      try {
        state.lfmProcessor = await AutoProcessor.from_pretrained(modelID, { revision, progress_callback });
      } catch (e) {
        console.warn("LFM Processor failed to load, will use manual processing:", e);
      }
      
      const loadSession = async (name: string, dataFiles = 1) => {
        const onnxPath = `${modelBase}/onnx/${name}.onnx`;
        const externalData = [];
        for (let i = 0; i < dataFiles; i++) {
          const suffix = i === 0 ? "" : `_${i}`;
          const fileName = `${name}.onnx_data${suffix}`;
          externalData.push({ path: fileName, data: `${modelBase}/onnx/${fileName}` });
        }
        return ort.InferenceSession.create(onnxPath, {
          executionProviders: ["webgpu"],
          externalData,
        });
      };

      state.lfmSessions = {
        embedTokens: await loadSession("embed_tokens_fp16"),
        embedImages: await loadSession("embed_images_fp16"),
        decoder: await loadSession("decoder_q4"),
      };
      
      self.postMessage({ type: "status", data: { message: "LFM model loaded successfully" } });
    } else if (state.isGemma4) {
      state.processor = await AutoProcessor.from_pretrained(modelID, { revision, progress_callback });
      
      try {
        if (Gemma4ForConditionalGeneration) {
          state.model = await Gemma4ForConditionalGeneration.from_pretrained(modelID, options).catch(async (err: any) => {
            console.warn("WebGPU failed for Gemma 4, falling back to WASM:", err);
            return await Gemma4ForConditionalGeneration.from_pretrained(modelID, {
              ...options,
              device: "wasm",
            });
          });
        } else {
          throw new Error("Gemma4ForConditionalGeneration not found in @huggingface/transformers");
        }
      } catch (e) {
        console.warn("Falling back to AutoModelForImageTextToText for Gemma 4:", e);
        state.model = await AutoModelForImageTextToText.from_pretrained(modelID, options).catch(async (err: any) => {
          return await AutoModelForImageTextToText.from_pretrained(modelID, {
            ...options,
            device: "wasm",
          });
        });
      }
    } else if (category === "vision") {
      try {
        state.processor = await AutoProcessor.from_pretrained(modelID, { revision, progress_callback });
        const modelOptions = { ...options };
        if (modelID.includes("FastVLM")) {
          modelOptions.dtype = {
            embed_tokens: "fp16",
            vision_encoder: "q4",
            decoder_model_merged: "q4",
          };
        }

        state.model = await AutoModelForImageTextToText.from_pretrained(modelID, modelOptions).catch(async (err: any) => {
          console.warn("WebGPU failed for vision model, falling back to WASM:", err);
          return await AutoModelForImageTextToText.from_pretrained(modelID, {
            ...modelOptions,
            device: "wasm",
          });
        });
      } catch (err) {
        console.error("Failed to load vision model manually, trying pipeline:", err);
        state.generator = await pipeline("image-to-text", modelID, options);
      }
    } else if (category === "image-gen") {
      if (modelID.includes("Janus")) {
        state.isJanus = true;
        state.processor = await AutoProcessor.from_pretrained(modelID, { revision, progress_callback });
        state.model = await MultiModalityCausalLM.from_pretrained(modelID, options).catch(async (err: any) => {
          console.warn("WebGPU failed for Janus, falling back to WASM:", err);
          return await MultiModalityCausalLM.from_pretrained(modelID, {
            ...options,
            device: "wasm",
          });
        });
      } else {
        if (!DiffusionPipeline) {
          throw new Error("DiffusionPipeline is not supported in this version of @huggingface/transformers.");
        }
        state.generator = await DiffusionPipeline.from_pretrained(modelID, options).catch(async (err: any) => {
          console.warn("WebGPU failed for diffusion, falling back to WASM:", err);
          return await DiffusionPipeline.from_pretrained(modelID, {
            ...options,
            device: "wasm",
          });
        });
      }
    } else if (category === "music-gen") {
      state.processor = await AutoTokenizer.from_pretrained(modelID, { revision, progress_callback });
      const musicGenOptions = {
        ...options,
        dtype: {
          text_encoder: 'q8',
          decoder_model_merged: 'q8',
          encodec_decode: 'fp32',
        },
      };

      state.model = await MusicgenForConditionalGeneration.from_pretrained(modelID, musicGenOptions).catch(async (err: any) => {
        console.warn("WebGPU failed for MusicGen, falling back to WASM:", err);
        return await MusicgenForConditionalGeneration.from_pretrained(modelID, {
          ...musicGenOptions,
          device: "wasm",
        });
      });
    } else {
      let pipelineType: any = "text-generation";
      if (category === "tts") pipelineType = "text-to-audio";
      if (category === "embedding" || modelID.includes("MiniLM") || modelID.includes("nomic")) pipelineType = "feature-extraction";
      if (modelID.toLowerCase().includes("whisper")) pipelineType = "automatic-speech-recognition";

      state.generator = await pipeline(pipelineType, modelID, options).catch(async (err: any) => {
        console.warn("WebGPU failed, falling back to WASM:", err);
        return await pipeline(pipelineType, modelID, {
          ...options,
          device: "wasm",
        });
      });
    }

    state.currentModel = modelKey;
    state.currentDtype = dtype;
    self.postMessage({ type: "ready", data: { model: modelKey, category } });
  } catch (error: any) {
    self.postMessage({ type: "error", data: { message: error.message } });
  }
}
