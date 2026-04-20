import { pipeline, env } from "@huggingface/transformers";
import { MODELS, ModelInfo } from "../modelList";

// Configure for Node.js environment
env.allowLocalModels = false;
env.backends.onnx.wasm.numThreads = 1;

class ModelManager {
  private currentModelId: string | null = null;
  private currentPipeline: any = null;
  private directorPipeline: any = null;
  
  // LRU-lite: Keep the Director in memory if possible, swap others
  async getDirector() {
    if (!this.directorPipeline) {
      console.log("Loading Director Model (Orchestrator)...");
      this.directorPipeline = await pipeline("text-generation", "onnx-community/Qwen2.5-0.5B-Instruct", {
        device: "cpu", // Keep director on CPU to save GPU VRAM for heavy tasks
      });
    }
    return this.directorPipeline;
  }

  async swapModel(modelId: string, category: string) {
    if (this.currentModelId === modelId) return this.currentPipeline;

    console.log(`Hot-swapping to: ${modelId} (${category})`);
    
    // Explicitly clear memory of previous pipeline
    if (this.currentPipeline) {
      this.currentPipeline = null;
      if (global.gc) global.gc(); // Requires --expose-gc
    }

    const modelInfo = MODELS.find(m => m.id === modelId);
    if (!modelInfo) throw new Error("Model not found");

    let task: any = "text-generation";
    if (category === "vision") task = "image-to-text";
    if (category === "stt") task = "automatic-speech-recognition";

    this.currentPipeline = await pipeline(task, modelInfo.modelID, {
      device: "node", // Uses onnxruntime-node
      progress_callback: (p) => console.log(`Loading ${modelId}: ${Math.round(p.progress || 0)}%`)
    });

    this.currentModelId = modelId;
    return this.currentPipeline;
  }

  async route(prompt: string) {
    const director = await this.getDirector();
    const out = await director(prompt, { max_new_tokens: 10 });
    const intent = out[0].generated_text.trim();
    return intent; // e.g., "image_gen", "route_to_text"
  }
}

export const engine = new ModelManager();