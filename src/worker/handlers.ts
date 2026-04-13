import { state, stripThoughts, layer_norm } from "./state";
import { analyzeLFM } from "../workerFuncs/analyzeLFM";
import { RawImage } from "./state";

export async function handleGenerate(data: any) {
  const { text, messages, max_new_tokens = 256 } = data;
  if (!state.generator && !state.model) {
    self.postMessage({ type: "error", data: { message: "Model not loaded" } });
    return;
  }

  try {
    self.postMessage({ type: "status", data: { message: "Processing prompt..." } });
    state.isInterrupted = false;
    let startTime = performance.now();
    let tokenCount = 0;
    let promptLength = 0;

    const rawInput = messages || text;
    let finalInput = rawInput;
    
    self.postMessage({ type: "status", data: { message: "Preparing input..." } });

    if (state.isGemma4 && state.model && state.processor) {
      const chatMessages = Array.isArray(rawInput) ? [...rawInput] : [{ role: "user", content: rawInput }];
      const processedMessages = chatMessages.map((m, idx) => {
        if (idx === chatMessages.length - 1) return m;
        return { ...m, content: stripThoughts(m.content) };
      });

      const enableThinking = processedMessages.some(m => m.role === 'system' && m.content.includes('<|think|>'));
      const prompt = state.processor.apply_chat_template(processedMessages, { 
        enable_thinking: enableThinking,
        add_generation_prompt: true 
      });

      const inputs = await state.processor(prompt);
      const generateOptions: any = {
        ...inputs,
        max_new_tokens,
        do_sample: true,
        temperature: 1.0,
        top_p: 0.95,
        top_k: 64,
        callback_function: (beams: any) => {
          if (state.isInterrupted) return true;
          tokenCount++;
          const now = performance.now();
          const duration = (now - startTime) / 1000;
          const tps = (tokenCount / duration).toFixed(2);
          
          const outputTokens = beams[0].output_token_ids;
          const inputTokenCount = inputs.input_ids.dims.at(-1);
          const newTokens = outputTokens.slice(inputTokenCount);
          const decoded = state.processor.tokenizer.decode(newTokens, { skip_special_tokens: false });
          
          self.postMessage({ 
            type: "update", 
            data: { 
              output: decoded.trim(),
              stats: { tps, tokens: tokenCount }
            } 
          });
        }
      };

      const outputs = await state.model.generate(generateOptions);
      const inputTokenCount = inputs.input_ids.dims.at(-1);
      const newTokens = outputs.slice(null, [inputTokenCount, null]);
      const decoded = state.processor.batch_decode(newTokens, { skip_special_tokens: true });
      self.postMessage({ type: "complete", data: { output: decoded[0].trim() } });

    } else if (state.generator) {
      const tokenizer = state.generator.tokenizer;
      let inputTokenCount = 0;
      
      if (tokenizer && Array.isArray(rawInput)) {
        try {
          finalInput = tokenizer.apply_chat_template(rawInput, { tokenize: false, add_generation_prompt: true });
          const encoded = await tokenizer(finalInput);
          inputTokenCount = encoded.input_ids.dims.at(-1);
        } catch (e) {
          finalInput = rawInput;
        }
      } else if (typeof rawInput === 'string') {
        const encoded = await tokenizer(rawInput);
        inputTokenCount = encoded.input_ids.dims.at(-1);
      }

      self.postMessage({ type: "status", data: { message: "Generating response..." } });

      const output = await state.generator(finalInput, {
        max_new_tokens,
        return_full_text: false,
        callback_function: (beams: any) => {
          if (state.isInterrupted) return true;
          tokenCount++;
          const now = performance.now();
          const duration = (now - startTime) / 1000;
          const tps = (tokenCount / duration).toFixed(2);
          
          const outputTokens = beams[0].output_token_ids;
          const newTokens = inputTokenCount > 0 ? outputTokens.slice(inputTokenCount) : outputTokens;
          const decoded = tokenizer ? tokenizer.decode(newTokens, { skip_special_tokens: true }) : "Decoding failed";
          
          self.postMessage({ 
            type: "update", 
            data: { output: decoded.trim(), stats: { tps, tokens: tokenCount } } 
          });
        },
      });

      let resultText = "";
      if (!state.isInterrupted && output && output.length > 0) {
        const result = output[0].generated_text;
        if (typeof result === 'string') resultText = result;
        else if (Array.isArray(result)) resultText = result[result.length - 1].content || JSON.stringify(result[result.length - 1]);
        else if (result && typeof result === 'object') resultText = (result as any).content || JSON.stringify(result);
      }
      self.postMessage({ type: "complete", data: { output: resultText.trim() } });
    } else if (state.model && state.processor) {
      const chatMessages = Array.isArray(rawInput) ? rawInput : [{ role: "user", content: rawInput }];
      const formattedPrompt = state.processor.apply_chat_template(chatMessages, { add_generation_prompt: true });
      const inputs = await state.processor(null, formattedPrompt);
      
      const outputs = await state.model.generate({
        ...inputs,
        max_new_tokens,
        do_sample: false,
        callback_function: (beams: any) => {
          if (state.isInterrupted) return true;
          tokenCount++;
          const now = performance.now();
          const duration = (now - startTime) / 1000;
          const tps = (tokenCount / duration).toFixed(2);
          const decoded = state.processor.tokenizer.decode(beams[0].output_token_ids, { skip_special_tokens: true });
          self.postMessage({ 
            type: "update", 
            data: { output: decoded.trim(), stats: { tps, tokens: tokenCount } } 
          });
        }
      });

      const decoded = state.processor.batch_decode(outputs, { skip_special_tokens: true });
      self.postMessage({ type: "complete", data: { output: decoded[0].trim() } });
    }
  } catch (error: any) {
    self.postMessage({ type: "error", data: { message: error.message } });
  }
}

export async function handleVisionAnalyze(data: any) {
  const { image, prompt } = data;
  if (!state.generator && !state.model && !state.lfmSessions) {
    self.postMessage({ type: "error", data: { message: "Vision model not loaded" } });
    return;
  }

  try {
    self.postMessage({ type: "status", data: { message: "Analyzing image..." } });
    if (state.isLFM && state.lfmSessions && state.lfmTokenizer) {
      const finalOutput = await analyzeLFM(image, prompt, state.lfmSessions, state.lfmTokenizer, state.lfmProcessor, state.isInterrupted, (msg) => self.postMessage(msg));
      self.postMessage({ type: "vision-result", data: { output: finalOutput, prompt } });
    } else if (state.generator) {
      const output = await state.generator(image, prompt);
      self.postMessage({ type: "vision-result", data: { output: output[0].generated_text, prompt } });
    } else if (state.model && state.processor) {
      let inputs;
      let formattedPrompt = "";
      if (state.isJanus) {
        const conversation = [{ role: "<|User|>", content: `<image_placeholder>\n${prompt}`, images: [image] }];
        inputs = await state.processor(conversation);
      } else {
        const rawImage = await RawImage.read(image);
        let messages;
        if (state.isGemma4) {
          messages = [{ role: "user", content: [{ type: "image" }, { type: "text", text: prompt }] }];
        } else {
          messages = [{ role: "user", content: `<image>\n${prompt}` }];
        }
        formattedPrompt = state.processor.apply_chat_template(messages, { add_generation_prompt: true });
        inputs = await state.processor(state.isGemma4 ? formattedPrompt : rawImage, state.isGemma4 ? rawImage : formattedPrompt);
      }

      const generateOptions: any = { ...inputs, max_new_tokens: 512, do_sample: false };
      if (state.isGemma4) {
        generateOptions.temperature = 1.0;
        generateOptions.top_p = 0.95;
        generateOptions.top_k = 64;
      }

      const outputs = await state.model.generate(generateOptions);
      let result;
      if (state.isJanus) {
        const new_tokens = outputs.slice(null, [inputs.input_ids.dims.at(-1), null]);
        const decoded = state.processor.batch_decode(new_tokens, { skip_special_tokens: true });
        result = decoded[0];
      } else {
        const decoded = state.processor.batch_decode(outputs, { skip_special_tokens: true });
        result = decoded[0];
        if (formattedPrompt && result.includes(formattedPrompt)) result = result.replace(formattedPrompt, "").trim();
      }
      self.postMessage({ type: "vision-result", data: { output: result, prompt } });
    }
  } catch (error: any) {
    self.postMessage({ type: "error", data: { message: error.message } });
  }
}

export async function handleImageGenerate(data: any) {
  const { prompt } = data;
  if (!state.generator && !state.model) {
    self.postMessage({ type: "error", data: { message: "Image generation model not loaded" } });
    return;
  }
  try {
    self.postMessage({ type: "status", data: { message: "Generating image..." } });
    let image;
    if (state.isJanus) {
      const conversation = [{ role: "<|User|>", content: prompt }];
      const inputs = await state.processor(conversation, { chat_template: "text_to_image" });
      const num_image_tokens = state.processor.num_image_tokens;
      const outputs = await state.model.generate_images({ ...inputs, min_new_tokens: num_image_tokens, max_new_tokens: num_image_tokens, do_sample: true });
      image = outputs[0];
    } else {
      const output = await state.generator(prompt);
      image = output.images ? output.images[0] : (Array.isArray(output) ? output[0] : output);
    }
    self.postMessage({ type: "image-result", data: { image } });
  } catch (error: any) {
    self.postMessage({ type: "error", data: { message: error.message } });
  }
}

export async function handleMusicGenerate(data: any) {
  const { prompt, max_new_tokens = 500 } = data;
  if (!state.model || !state.processor) {
    self.postMessage({ type: "error", data: { message: "MusicGen model not loaded" } });
    return;
  }
  try {
    self.postMessage({ type: "status", data: { message: "Generating music..." } });
    const inputs = state.processor(prompt);
    const audio_values = await state.model.generate({ ...inputs, max_new_tokens, do_sample: true, guidance_scale: 3 });
    self.postMessage({ type: "music-result", data: { audio: audio_values.data, sampling_rate: state.model.config.audio_encoder.sampling_rate } });
  } catch (error: any) {
    self.postMessage({ type: "error", data: { message: error.message } });
  }
}

export async function handleTTSGenerate(data: any) {
  const { text } = data;
  if (!state.generator) {
    self.postMessage({ type: "error", data: { message: "TTS model not loaded" } });
    return;
  }
  try {
    self.postMessage({ type: "status", data: { message: "Generating speech..." } });
    const output = await state.generator(text);
    self.postMessage({ type: "tts-result", data: { audio: output.audio, sampling_rate: output.sampling_rate } });
  } catch (error: any) {
    self.postMessage({ type: "error", data: { message: error.message } });
  }
}

export async function handleTranscribe(data: any) {
  if (!state.generator) {
    self.postMessage({ type: "error", data: { message: "Transcription model not loaded" } });
    return;
  }
  try {
    const { audio, ...metadata } = data;
    const output = await state.generator(audio);
    self.postMessage({ type: "transcribe-result", data: { text: output.text, ...metadata } });
  } catch (error: any) {
    self.postMessage({ type: "error", data: { message: error.message } });
  }
}

export async function handleEmbed(data: any) {
  const { text, metadata } = data;
  if (!state.generator) {
    self.postMessage({ type: "error", data: { message: "Embedding model not loaded" } });
    return;
  }
  try {
    // Nomic v1.5 requires specific pooling and normalization for Matryoshka embeddings
    const isNomic = state.currentModel?.includes("nomic");
    const output = await state.generator(text, { pooling: 'mean' });
    
    let finalEmbedding;
    if (isNomic) {
      const matryoshka_dim = 512;
      const normalized = layer_norm(output, [output.dims[1]])
          .slice(null, [0, matryoshka_dim])
          .normalize(2, -1);
      finalEmbedding = Array.from(normalized.data);
    } else {
      const normalized = output.normalize(2, -1);
      finalEmbedding = Array.from(normalized.data);
    }

    self.postMessage({ type: "embed-result", data: { embedding: finalEmbedding, text, metadata } });
  } catch (error: any) {
    self.postMessage({ type: "error", data: { message: error.message } });
  }
}
