export interface ModelInfo {
  id: string;
  modelID: string;
  path?: string;
  modelfile?: string;
  name: string;
  description: string;
  size?: string;
  dtype?: string;
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
    "category": "coder",
    "make": "QWEN",
    "minRam": 10
  },
  {
    "id": "qwen-2.5-Instruct-abliterated-0.5b-q4",
    "modelID": "LemOneLabs/Qwen2.5-0.5B-Instruct-abliterated-ONNX",
    "name": "Qwen 2.5 Instruct 0.5B",
    "description": "Specialized for coding tasks. Great balance of speed and accuracy.",
    "size": "~0.5GB",
    "dtype": "q4",
    "category": "director",
    "make": "QWEN",
    "minRam": 1
  },
  {
    "id": "gemma-3 1B",
    "modelID": "onnx-community/gemma-3-1b-it-ONNX",
    "name": "gemma-3 1B",
    "description": "Gemma Excellent reasoning and instruction following.",
    "size": "~0.8GB",
    "dtype": "q4",
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
    "category": "text",
    "make": "META",
    "minRam": 4
  },
  {
    "id": "llama-3.1-8b-fp16",
    "modelID": "LemOneLabs/Llama-3.1-8B-FP16",
    "name": "Llama 3.1 8b",
    "description": "Meta's flagship small model. Excellent reasoning and instruction following.",
    "size": "~16GB",
    "dtype": "FP16",
    "category": "text",
    "make": "META",
    "minRam": 24
  },
  {
    "id": "gemma-4-e2b-q4",
    "modelID": "LemOneLabs/gemma-4-E2B-it-ONNX",
    "name": "Gemma 4 E2B",
    "description": "Uses Per-Layer Embeddings (PLE) to provide 5B-level intelligence at a 2.3B size.",
    "size": "~1.5GB",
    "dtype": "q4",
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
