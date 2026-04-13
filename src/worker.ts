import * as ort from "onnxruntime-web";
import { env, state } from "./worker/state";
import { loadModel } from "./worker/loader";
import { 
  handleGenerate, 
  handleVisionAnalyze, 
  handleImageGenerate, 
  handleMusicGenerate, 
  handleTTSGenerate, 
  handleTranscribe, 
  handleEmbed 
} from "./worker/handlers";

// Skip local check for models
env.allowLocalModels = false;

// Configure ONNX Runtime and Transformers environment for WebGPU stability
if (ort.env.wasm) ort.env.wasm.numThreads = 1;
if (ort.env.webgpu) {
  ort.env.webgpu.powerPreference = 'high-performance';
  // @ts-ignore
  ort.env.webgpu.validateInputOutputNames = false;
}

// Also configure through Transformers env if available
if (env.backends?.onnx?.wasm) env.backends.onnx.wasm.numThreads = 1;
if (env.backends?.onnx?.webgpu) {
  env.backends.onnx.webgpu.powerPreference = 'high-performance';
  env.backends.onnx.webgpu.validateInputOutputNames = false;
}

// Listen for messages from the main thread
let isBusy = false;
const messageQueue: any[] = [];

async function processQueue() {
  if (isBusy || messageQueue.length === 0) return;
  isBusy = true;
  const event = messageQueue.shift();
  try {
    await handleMessage(event);
  } catch (err: any) {
    console.error("Worker queue error:", err);
    self.postMessage({ type: "error", data: { message: `Worker queue error: ${err.message}` } });
  } finally {
    isBusy = false;
    processQueue();
  }
}

self.addEventListener("message", (event) => {
  const { type } = event.data;
  if (type === "interrupt") {
    state.isInterrupted = true;
    return;
  }
  messageQueue.push(event);
  processQueue();
});

async function handleMessage(event: MessageEvent) {
  const { type, data } = event.data;

  switch (type) {
    case "load":
      await loadModel(data);
      break;
    case "generate":
      await handleGenerate(data);
      break;
    case "vision-analyze":
      await handleVisionAnalyze(data);
      break;
    case "image-generate":
      await handleImageGenerate(data);
      break;
    case "music-generate":
      await handleMusicGenerate(data);
      break;
    case "tts-generate":
      await handleTTSGenerate(data);
      break;
    case "transcribe":
      await handleTranscribe(data);
      break;
    case "embed":
      await handleEmbed(data);
      break;
    default:
      console.warn("Unknown message type:", type);
  }
}
