export interface ModelInfo {
  id: string;
  modelID: string;
  path?: string;
  modelfile?: string;
  name: string;
  description: string;
  size?: string;
  dtype?: string;
  qtypes?: string[];
  category: "text" | "vision" | "tts" | "image-gen" | "stt" | "music-gen" | "director" | "coder" | "embedding";
  make?: string;
  minRam?: number; // Minimum RAM in GB
}

export const MODELS: ModelInfo[] = [
  {
    "id": "qwen-2.5-coder-3b-q4",
    "modelID": "onnx-community/Qwen2.5-Coder-3B-Instruct",
    "name": "Qwen 2.5 Coder 3B",
    "description": "Specialized for coding tasks. Great balance of speed and accuracy.",
    "size": "~2GB",
    "dtype": "q4",
    "qtypes": ["q4f16", "q4", "fp16", "fp32"],
    "category": "coder",
    "make": "QWEN",
    "minRam": 3
  },
  {
    "id": "Qwen2.5-Coder-7B",
    "modelID": "LemOneLabs/Qwen2.5-Coder-7B",
    "name": "Qwen 2.5 Coder 7B",
    "description": "Specialized for coding tasks. Great balance of speed and accuracy.",
    "size": "~7GB",
    "dtype": "FP16",
    "qtypes": ["q4f16", "q4", "fp16", "fp32"],
    "category": "coder",
    "make": "QWEN",
    "minRam": 10
  },
  {
    "id": "use-text-model",
    "modelID": "use-text-model",
    "name": "[Use Text Model]",
    "description": "Bypasses dedicated director inference and routes tasks using the selected general text model instead.",
    "category": "director",
    "make": "DYNAMIC",
    "minRam": 0
  },
  {
    "id": "qwen-2.5-Instruct-abliterated-0.5b-q4",
    "modelID": "LemOneLabs/Qwen2.5-0.5B-Instruct-abliterated-ONNX",
    "name": "Qwen 2.5 Instruct 0.5B",
    "description": "Specialized for coding tasks. Great balance of speed and accuracy.",
    "size": "~0.5GB",
    "dtype": "q4",
    "qtypes": ["q4f16", "q4", "q8", "fp16", "fp32"],
    "category": "director",
    "make": "QWEN",
    "minRam": 1
  },
  {
    "id": "qwen-3-0.6b-q4",
    "modelID": "LemOneLabs/Qwen3-0.6B-ONNX",
    "name": "Qwen 3 0.6B",
    "description": "Next-generation ultra-lightweight Qwen model with great reasoning for routing and text tasks.",
    "size": "~0.6GB",
    "dtype": "q4f16",
    "qtypes": ["q4f16", "q4", "q8", "fp16", "fp32"],
    "category": "director",
    "make": "QWEN",
    "minRam": 1
  },
  {
    "id": "tiny-llm-10m",
    "modelID": "onnx-community/Tiny-LLM-ONNX",
    "name": "Tiny-LLM 10M",
    "description": "An ultra-compact 10M parameter language model pretrained on 32B tokens of Fineweb dataset. Extremely fast.",
    "size": "~25MB",
    "dtype": "q4",
    "qtypes": ["q4f16", "q4", "q8", "fp16", "fp32"],
    "category": "director",
    "make": "Tiny-LLM",
    "minRam": 0.5
  },
  {
    "id": "qwen-3-0.6b-q4-text",
    "modelID": "LemOneLabs/Qwen3-0.6B-ONNX",
    "name": "Qwen 3 0.6B",
    "description": "Next-generation ultra-lightweight Qwen model with great reasoning for text-generation and chat.",
    "size": "~0.6GB",
    "dtype": "q4f16",
    "qtypes": ["q4f16", "q4", "q8", "fp16", "fp32"],
    "category": "text",
    "make": "QWEN",
    "minRam": 1
  },
  {
    "id": "llama-3.2-1b",
    "modelID": "LemOneLabs/Llama-3.2-1B-Instruct-ONNX",
    "name": "Llama 3.2 1B",
    "description": "Meta's lightweight 1B model. Extremely fast and highly optimized for on-device assistant tasks.",
    "size": "~1.2GB",
    "dtype": "FP16",
    "qtypes": ["q4f16", "q4", "q8", "fp16", "fp32"],
    "category": "text",
    "make": "META",
    "minRam": 2
  },
  {
    "id": "gemma-3 1B",
    "modelID": "onnx-community/gemma-3-1b-it-ONNX",
    "name": "gemma-3 1B",
    "description": "Gemma Excellent reasoning and instruction following.",
    "size": "~0.8GB",
    "dtype": "q4",
    "qtypes": ["q4f16", "q4", "q8", "fp16", "fp32"],
    "category": "text",
    "make": "Google",
    "minRam": 2
  },
  {
    "id": "llama-3.2-3b-q4",
    "modelID": "onnx-community/Llama-3.2-3B-Instruct",
    "name": "Llama 3.2 3B",
    "description": "Meta's flagship small model. Excellent reasoning and instruction following.",
    "size": "~2.2GB",
    "dtype": "q4",
    "qtypes": ["q4f16", "q4", "q8", "fp16", "fp32"],
    "category": "text",
    "make": "META",
    "minRam": 4
  },
  {
    "id": "llama-3.1-8b-instruct",
    "modelID": "LemOneLabs/Llama-3.1-8B-Instruct-ONNX",
    "name": "Llama 3.1 8B Instruct",
    "description": "Meta's flagship small model. Excellent reasoning and instruction following.",
    "size": "~4.8GB",
    "dtype": "q4",
    "qtypes": ["q4f16", "q4", "q8", "fp16", "fp32"],
    "category": "text",
    "make": "META",
    "minRam": 6
  },
  {
    "id": "gemma-4-e2b-q4",
    "modelID": "LemOneLabs/gemma-4-E2B-it-ONNX",
    "name": "Gemma 4 E2B",
    "description": "Uses Per-Layer Embeddings (PLE) to provide 5B-level intelligence at a 2.3B size.",
    "size": "~1.5GB",
    "dtype": "q4",
    "qtypes": ["q4f16", "q4", "q8", "fp16", "fp32"],
    "category": "text",
    "make": "GOOGLE",
    "minRam": 2
  },
  {
    "id": "gemma-4-e4b-q4",
    "modelID": "LemOneLabs/gemma-4-E4B-it-ONNX",
    "name": "Gemma 4 E4B",
    "description": "Uses Per-Layer Embeddings (PLE) to provide 5B-level intelligence at a 4B size.",
    "size": "~4GB",
    "dtype": "q4",
    "qtypes": ["q4f16", "q4", "q8", "fp16", "fp32"],
    "category": "text",
    "make": "GOOGLE",
    "minRam": 6
  },
  {
    "id": "phi-4-mini-q4",
    "modelID": "onnx-community/Phi-4-mini-instruct",
    "name": "Phi-4 Mini",
    "description": "Microsoft's high-reasoning model optimized for complex logic in a small footprint.",
    "size": "~2.3GB",
    "dtype": "q4",
    "qtypes": ["q4f16", "q4", "q8", "fp16", "fp32"],
    "category": "text",
    "make": "MICROSOFT",
    "minRam": 4
  },
  {
    "id": "mistral-nemo-12b-q4",
    "modelID": "LemOneLabs/Mistral-Nemo-12B-Instruct-ONNX-INT4",
    "name": "Mistral NeMo 12B",
    "description": "Top-tier 12B model for high-end edge devices. Best-in-class multilingual support.",
    "size": "~7.5GB",
    "dtype": "q4",
    "qtypes": ["q4f16", "q4", "q8", "fp16", "fp32"],
    "category": "text",
    "make": "MISTRAL",
    "minRam": 12
  },

  // VISION MODELS

  {
    id: "FastVLM",
    modelID: "onnx-community/FastVLM-0.5B-ONNX",
    name: "FastVLM",
    description: "Tiny but powerful vision-language model. Can describe images and answer questions.",
    size: "~1.6GB",
    dtype: "q4",
    qtypes: ["q4f16", "q4", "q8", "fp16", "fp32"],
    category: "vision",
    make: "FastVLM",
    minRam: 2,
  },

  // TTS MODELS
  {
    id: "kokoro-82m",
    modelID: "onnx-community/Kokoro-82M-v1.0-ONNX",
    name: "Kokoro 82M",
    description: "State-of-the-art small TTS model. High quality, very fast.",
    size: "~350MB",
    dtype: "q4",
    qtypes: ["q4f16", "q4", "q8", "fp16", "fp32"],
    category: "tts",
    make: "KOKORO",
    minRam: 1,
  },

  // IMAGE GEN MODELS
  {
    id: "Janus-Pro-1B-ONNX",
    modelID: "onnx-community/Janus-Pro-1B-ONNX",
    name: "Janus-Pro-1B-ONNX",
    description: "Latent Consistency Model for fast inference. Good for lower-end hardware.",
    size: "~2GB",
    dtype: "q4",
    qtypes: ["q4f16", "q4", "q8", "fp16", "fp32"],
    category: "image-gen",
    make: "LATENT-CONSISTENCY",
    minRam: 4,
  },

  // EMBEDDING MODELS (FOR RAG)
  {
    id: "nomic-embed-text-v1.5",
    modelID: "nomic-ai/nomic-embed-text-v1.5",
    name: "nomic-embed-text-v1.5",
    description: "Fast and accurate embeddings for RAG and long-term memory.",
    size: "~90MB",
    category: "embedding",
    make: "Nomic",
    minRam: 0.5,
  },
  {
    id: "whisper-tiny-en",
    modelID: "onnx-community/whisper-tiny.en",
    name: "Whisper Tiny EN",
    description: "Fast and efficient speech-to-text model for English.",
    size: "~150MB",
    dtype: "q4",
    qtypes: ["q4f16", "q4", "q8", "fp16", "fp32"],
    category: "stt",
    make: "OPENAI",
    minRam: 1,
  },
  {
    id: "musicgen-small",
    modelID: "Xenova/musicgen-small",
    name: "MusicGen Small",
    description: "Meta's MusicGen model for high-quality music generation from text.",
    size: "~600MB",
    category: "music-gen",
    make: "META",
    minRam: 2,
  },
];

/**
 * Normalizes a model ID and registers it in the MODELS list if it doesn't already exist.
 * - If there is no '/' then we assume 'LemOneLabs/' needs to be prefixed.
 * - If the model is not natively in the list, it will be added and treated as a Llama model.
 * Returns the resolved model info object.
 */
export function normalizeAndRegisterModel(
  modelId: string,
  category: "text" | "vision" | "tts" | "image-gen" | "stt" | "music-gen" | "director" | "coder" | "embedding" = "text"
): ModelInfo {
  if (!modelId || typeof modelId !== "string") {
    return MODELS[0]; // fallback
  }

  let normalized = modelId.trim();
  if (!normalized.includes("/")) {
    normalized = "LemOneLabs/" + normalized;
  }

  // Check if it already exists by modelID or id
  const found = MODELS.find(
    (m) =>
      m.id === normalized ||
      m.modelID === normalized ||
      m.id === modelId ||
      m.modelID === modelId
  );
  if (found) {
    return found;
  }

  // If not found, create a dynamic ModelInfo entry
  const parts = normalized.split("/");
  const cleanId = parts[parts.length - 1];

  // Make sure the ID contains "llama" so the chat template compiler and tokenizer detect it as a Llama model
  const finalId = cleanId.toLowerCase().includes("llama")
    ? cleanId
    : `${cleanId}-llama`;

  const customModel: ModelInfo = {
    id: finalId,
    modelID: normalized,
    name: cleanId,
    description: "Custom dynamically registered HuggingFace model.",
    size: "~1.5GB", // conservative default
    dtype: normalized.toLowerCase().includes("fp16") ? "fp16" : "q4",
    qtypes: ["q4f16", "q4", "q8", "fp16", "fp32"],
    category: category,
    make: "META", // attempt to process it as a 'Llama' model
    minRam: 4,
  };

  MODELS.push(customModel);
  console.log(`🆕 Registered custom model in MODELS list:`, customModel);
  return customModel;
}

/**
 * Calculates the dynamic minimum RAM requirements (in GB) for a given model and QTYPE (precision)
 * based on the user's precision guide.
 */
export function getRequiredRamForModel(model: ModelInfo, qtype?: string): number {
  if (!model) return 0;

  // Use the provided qtype, or fall back to the model's default dtype, or "q4"
  const resolvedQtype = (qtype || model.dtype || "q4").toLowerCase();

  // Determine precision category
  let precision: "q4" | "q8" | "fp16" | "fp32" = "q4";
  if (resolvedQtype.includes("fp32") || resolvedQtype.includes("f32")) {
    precision = "fp32";
  } else if (resolvedQtype.includes("fp16") || resolvedQtype.includes("f16") || resolvedQtype.includes("half")) {
    precision = "fp16";
  } else if (resolvedQtype.includes("q8") || resolvedQtype.includes("fp8") || resolvedQtype.includes("f8")) {
    precision = "q8";
  } else {
    precision = "q4"; // default/fallback
  }

  // Determine parameter size category of the model
  const modelIdLower = model.id.toLowerCase();
  const modelIDLower = model.modelID.toLowerCase();
  const nameLower = model.name.toLowerCase();

  // Check 8B category
  if (
    modelIdLower.includes("8b") ||
    modelIDLower.includes("8b") ||
    nameLower.includes("8b") ||
    modelIdLower.includes("12b") ||
    modelIDLower.includes("12b") ||
    nameLower.includes("12b")
  ) {
    // 8B Param (e.g., Llama 3.1 8B)
    if (precision === "q4") return 7.0;
    if (precision === "q8") return 11.5;
    if (precision === "fp16") return 21.0;
    return 40.0; // fp32
  }

  // Check 6B category
  if (
    modelIdLower.includes("6b") ||
    modelIDLower.includes("6b") ||
    nameLower.includes("6b") ||
    modelIdLower.includes("7b") ||
    modelIDLower.includes("7b") ||
    nameLower.includes("7b") ||
    modelIdLower.includes("4b") ||
    modelIDLower.includes("4b") ||
    nameLower.includes("4b") ||
    modelIdLower.includes("phi-4")
  ) {
    // 6B Param (e.g., InternLM2.5 6B, Qwen 2.5 Coder 7B, Gemma 4 E4B, Phi-4 Mini)
    if (precision === "q4") return 4.8;
    if (precision === "q8") return 8.5;
    if (precision === "fp16") return 15.5;
    return 30.0; // fp32
  }

  // Check 3B category
  if (
    modelIdLower.includes("3b") ||
    modelIDLower.includes("3b") ||
    nameLower.includes("3b") ||
    modelIdLower.includes("2b") ||
    modelIDLower.includes("2b") ||
    nameLower.includes("2b") ||
    modelIdLower.includes("gemma-4-e2b") ||
    nameLower.includes("phi-3.5")
  ) {
    // 3B Param (e.g., Phi-3.5 Mini / Gemma 2B, Qwen 2.5 Coder 3B, Llama 3.2 3B)
    if (precision === "q4") return 2.8;
    if (precision === "q8") return 4.5;
    if (precision === "fp16") return 8.5;
    return 15.5; // fp32
  }

  // Check 1B category
  if (
    modelIdLower.includes("1b") ||
    modelIDLower.includes("1b") ||
    nameLower.includes("1b") ||
    modelIdLower.includes("gemma-3-1b")
  ) {
    // 1B Param (e.g., Llama 3.2 1B, Janus Pro 1B)
    if (precision === "q4") return 1.2;
    if (precision === "q8") return 1.8;
    if (precision === "fp16") return 3.0;
    return 5.5; // fp32
  }

  // Check 0.5B category
  if (
    modelIdLower.includes("0.5b") ||
    modelIDLower.includes("0.5b") ||
    nameLower.includes("0.5b") ||
    modelIdLower.includes("0.6b") ||
    modelIDLower.includes("0.6b") ||
    nameLower.includes("0.6b") ||
    modelIdLower.includes("fastvlm")
  ) {
    // 0.5B Param (e.g., Qwen 2.5 Coder 0.5B, Qwen 3 0.6B, FastVLM)
    if (precision === "q4") return 0.6;
    if (precision === "q8") return 0.9;
    if (precision === "fp16") return 1.5;
    return 2.8; // fp32
  }

  // Fallback to static model.minRam if defined, or base on size if available
  if (model.minRam !== undefined) {
    // Adjust static minRam if it's FP16/FP32
    if (precision === "fp16") return model.minRam * 2;
    if (precision === "fp32") return model.minRam * 4;
    if (precision === "q8") return model.minRam * 1.5;
    return model.minRam;
  }

  return 1.0; // ultra-fallback
}

/**
 * Determines the highest-precision QTYPE for a model that still fits within the given system RAM.
 */
export function getBestFittingQtype(model: ModelInfo, systemRam: number): string {
  if (!model.qtypes || model.qtypes.length === 0) {
    return model.dtype || "q4";
  }

  // Rank function for QTYPEs to find highest precision
  const getRank = (q: string): number => {
    const ql = q.toLowerCase();
    if (ql.includes("fp32") || ql.includes("f32")) return 5;
    if (ql.includes("fp16") || ql.includes("f16") || ql.includes("half")) return 4;
    if (ql.includes("q8") || ql.includes("fp8") || ql.includes("f8")) return 3;
    if (ql.includes("q4f16")) return 2;
    if (ql.includes("q4")) return 1;
    return 0;
  };

  // Filter QTYPEs that fit the system RAM
  const fitting = model.qtypes.filter(q => getRequiredRamForModel(model, q) <= systemRam);
  if (fitting.length > 0) {
    // Return the one with highest rank
    return fitting.sort((a, b) => getRank(b) - getRank(a))[0];
  }

  // If none fit, return the lowest rank one (to fail gracefully or to be selected)
  return model.qtypes.sort((a, b) => getRank(a) - getRank(b))[0];
}


