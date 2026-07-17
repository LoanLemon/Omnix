import { MODELS } from "../shared/modelList.ts";

let textPipeline: any = null;
let currentModelId: string | null = null;

export async function runNodeTextInference(
  prompt: string,
  options: {
    systemPrompt?: string;
    modelId?: string;
    temperature?: number;
    top_p?: number;
    top_k?: number;
    maxTokens?: number;
    chatHistory?: Array<{ role: string; content: string }>;
  }
) {
  try {
    console.log(`[Turbo Node Engine] Starting Node.js native inference`);
    
    // Lazy import @huggingface/transformers to keep server startup instant
    const { pipeline } = await import("@huggingface/transformers");

    const requestedModelId = options.modelId;
    const modelInfo = MODELS.find(m => m.id === requestedModelId || m.modelID === requestedModelId) || 
                      MODELS.find(m => m.category === "text" || m.category === "coder") ||
                      MODELS[0];
    
    const modelID = modelInfo.modelID;

    if (!textPipeline || currentModelId !== modelID) {
      console.log(`[Turbo Node Engine] Loading model "${modelID}" using native onnxruntime-node driver...`);
      textPipeline = await pipeline("text-generation", modelID, {
        device: "cpu", // Utilizes multi-threaded native C++ onnxruntime-node provider
      });
      currentModelId = modelID;
      console.log(`[Turbo Node Engine] Successfully loaded model "${modelID}" in full RAM access mode.`);
    }

    const messages: any[] = [];
    if (options.systemPrompt) {
      messages.push({ role: "system", content: options.systemPrompt });
    }

    if (options.chatHistory && options.chatHistory.length > 0) {
      options.chatHistory.forEach((msg) => {
        // Map roles to standard roles expected by transformers.js: 'system', 'user', 'assistant'
        let role = msg.role;
        if (role === "model") role = "assistant";
        messages.push({ role, content: msg.content });
      });
      
      // Ensure the latest user prompt is at the end of history if not already there
      const lastMsg = messages[messages.length - 1];
      if (!lastMsg || lastMsg.role !== "user" || lastMsg.content !== prompt) {
        messages.push({ role: "user", content: prompt });
      }
    } else {
      messages.push({ role: "user", content: prompt });
    }

    console.log(`[Turbo Node Engine] Generating tokens...`);
    const genOptions: any = {
      max_new_tokens: options.maxTokens || 512,
      temperature: options.temperature ?? 0.7,
      top_p: options.top_p ?? 0.9,
      top_k: options.top_k ?? 50,
      do_sample: (options.temperature ?? 0.7) > 0,
    };

    const output = await textPipeline(messages, genOptions);

    let resultText = "";
    if (Array.isArray(output)) {
      const lastMsg = output[output.length - 1];
      if (lastMsg && typeof lastMsg === "object" && lastMsg.role === "assistant") {
        resultText = lastMsg.content;
      } else if (lastMsg && typeof lastMsg === "object" && typeof lastMsg.generated_text === "string") {
        resultText = lastMsg.generated_text;
      } else if (typeof output[0]?.generated_text === "string") {
        resultText = output[0].generated_text;
      } else {
        resultText = JSON.stringify(output);
      }
    } else if (typeof output === "string") {
      resultText = output;
    } else {
      resultText = JSON.stringify(output);
    }

    console.log(`[Turbo Node Engine] Generation complete. Generated ${resultText.length} characters.`);
    return resultText;
  } catch (error: any) {
    console.error(`[Turbo Node Engine] Inference error:`, error);
    throw error;
  }
}
