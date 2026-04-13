import * as Transformers from "@huggingface/transformers";

export const { 
  pipeline, 
  env, 
  AutoProcessor, 
  AutoModelForImageTextToText,
  RawImage,
  AutoTokenizer,
  DiffusionPipeline,
  MultiModalityCausalLM,
  MusicgenForConditionalGeneration,
  layer_norm,
} = Transformers as any;

// @ts-ignore
export const Gemma4ForConditionalGeneration = (Transformers as any).Gemma4ForConditionalGeneration;

export interface WorkerState {
  generator: any;
  processor: any;
  model: any;
  currentModel: string | null;
  currentDtype: string | null;
  isInterrupted: boolean;
  isGemma4: boolean;
  isLFM: boolean;
  isJanus: boolean;
  lfmSessions: any;
  lfmTokenizer: any;
  lfmProcessor: any;
}

export const state: WorkerState = {
  generator: null,
  processor: null,
  model: null,
  currentModel: null,
  currentDtype: null,
  isInterrupted: false,
  isGemma4: false,
  isLFM: false,
  isJanus: false,
  lfmSessions: null,
  lfmTokenizer: null,
  lfmProcessor: null,
};

export function stripThoughts(text: string) {
  if (typeof text !== 'string') return text;
  return text.replace(/<\|channel>thought[\s\S]*?<channel\|>/g, "").trim();
}

export async function disposeResources() {
  if (state.lfmSessions) {
    try {
      for (const session of Object.values(state.lfmSessions)) {
        if (session && typeof (session as any).release === 'function') {
          (session as any).release();
        }
      }
      console.log("LFM sessions released");
    } catch (e) {
      console.warn("Error releasing LFM sessions:", e);
    }
    state.lfmSessions = null;
  }
  state.lfmTokenizer = null;
  state.lfmProcessor = null;
  
  if (state.generator) {
    try {
      if (typeof state.generator.dispose === 'function') {
        await state.generator.dispose();
      }
      console.log("Generator disposed");
    } catch (e) {
      console.warn("Error disposing generator:", e);
    }
  }
  if (state.model) {
    try {
      if (typeof state.model.dispose === 'function') {
        await state.model.dispose();
      }
      console.log("Model disposed");
    } catch (e) {
      console.warn("Error disposing model:", e);
    }
  }
  state.generator = null;
  state.model = null;
  state.processor = null;
}
