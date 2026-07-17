import { pipeline, AutoProcessor, AutoTokenizer } from "@huggingface/transformers";
import { MODELS } from "@shared/modelList";
import { DIRECTOR_SYSTEM_PROMPT } from "@shared/prompts";
import { compileChatTemplate, safeDisposeTensors } from "../helpers/helpers.worker";

function chunkDataset(dataset: string, maxChunkLength: number = 2000): string[] {
  const trimmed = dataset.trim();
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        const chunks: string[] = [];
        let currentGroup: any[] = [];
        let currentLength = 0;
        for (const item of parsed) {
          const itemStr = JSON.stringify(item);
          if (currentLength + itemStr.length > maxChunkLength && currentGroup.length > 0) {
            chunks.push(JSON.stringify(currentGroup, null, 2));
            currentGroup = [item];
            currentLength = itemStr.length;
          } else {
            currentGroup.push(item);
            currentLength += itemStr.length;
          }
        }
        if (currentGroup.length > 0) {
          chunks.push(JSON.stringify(currentGroup, null, 2));
        }
        return chunks;
      }
    } catch (e) {
      // Fallback to text line/char-based chunking
    }
  }

  const lines = dataset.split("\n");
  const chunks: string[] = [];
  let currentChunk = "";
  for (const line of lines) {
    if ((currentChunk.length + line.length > maxChunkLength) && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = line + "\n";
    } else {
      currentChunk += line + "\n";
    }
  }
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  return chunks;
}

function mergeAndDeduplicateJSON(outputs: string[]): string {
  const items: any[] = [];
  let isAllArrays = true;
  const parsedObjects: any[] = [];
  let isAllObjects = true;

  for (const out of outputs) {
    const trimmed = out.trim();
    const cleanStr = trimmed.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    try {
      const parsed = JSON.parse(cleanStr);
      if (Array.isArray(parsed)) {
        items.push(...parsed);
        isAllObjects = false;
      } else if (parsed && typeof parsed === "object") {
        parsedObjects.push(parsed);
        isAllArrays = false;
      } else {
        isAllArrays = false;
        isAllObjects = false;
      }
    } catch (e) {
      isAllArrays = false;
      isAllObjects = false;
    }
  }

  if (isAllArrays && items.length > 0) {
    const uniqueItems: any[] = [];
    const seen = new Set<string>();
    for (const item of items) {
      let key = "";
      if (item && typeof item === "object") {
        key = item.id !== undefined ? `id:${item.id}` : JSON.stringify(item);
      } else {
        key = String(item);
      }
      if (!seen.has(key)) {
        seen.add(key);
        uniqueItems.push(item);
      }
    }
    return JSON.stringify(uniqueItems, null, 2);
  }

  if (isAllObjects && parsedObjects.length > 0) {
    const mergedObj: any = {};
    for (const obj of parsedObjects) {
      for (const key of Object.keys(obj)) {
        if (mergedObj[key] !== undefined) {
          if (Array.isArray(mergedObj[key]) && Array.isArray(obj[key])) {
            mergedObj[key] = [...mergedObj[key], ...obj[key]];
            const seenItems = new Set<string>();
            mergedObj[key] = mergedObj[key].filter((item: any) => {
              const k = typeof item === "object" ? JSON.stringify(item) : String(item);
              if (seenItems.has(k)) return false;
              seenItems.add(k);
              return true;
            });
          } else {
            mergedObj[key] = obj[key];
          }
        } else {
          mergedObj[key] = obj[key];
        }
      }
    }
    return JSON.stringify(mergedObj, null, 2);
  }

  const combinedText = outputs.join("\n");
  const lines = combinedText.split("\n");
  const uniqueLines: string[] = [];
  const seenLines = new Set<string>();
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.length === 0) {
      uniqueLines.push("");
      continue;
    }
    if (!seenLines.has(trimmedLine)) {
      seenLines.add(trimmedLine);
      uniqueLines.push(line);
    }
  }
  return uniqueLines.join("\n");
}

export async function handleTextInference(
  engine: any,
  category: string,
  input: any,
  options: any,
  maxTokens: number,
  sendProgress?: (p: any) => void,
  onToken?: (token: string) => void
): Promise<any> {
  let promptText = "";
  if (typeof input === "string") {
    promptText = input;
  } else if (options && typeof options.prompt === "string") {
    promptText = options.prompt;
  }

  const isRegenerateTrigger = promptText && (!options || !options.bypassChunking) && /^\s*regenerate\s+(my\s+)?json\s+data\s*:/i.test(promptText);

  if (isRegenerateTrigger) {
    console.log("🚀 [WebGPU Chunking] Detected Regenerate JSON Data trigger. Processing massive dataset with memory chunking...");
    const match = promptText.match(/^\s*(regenerate\s+(my\s+)?json\s+data\s*:\s*)([\s\S]+)/i);
    if (match) {
      const taskPrefix = "Regenerate JSON Data:";
      const dataset = match[3];
      const datasetChunks = chunkDataset(dataset, 2000);
      console.log(`📡 [WebGPU Chunking] Dataset split into ${datasetChunks.length} chunks.`);

      const chunkOutputs: string[] = [];
      for (let i = 0; i < datasetChunks.length; i++) {
        const chunk = datasetChunks[i];
        const chunkPrompt = `${taskPrefix}\n${chunk}`;
        console.log(`👉 [WebGPU Chunking] Processing chunk ${i + 1}/${datasetChunks.length} (${chunk.length} chars)`);
        
        const chunkOptions = {
          ...options,
          bypassChunking: true,
          prompt: chunkPrompt,
        };

        if (onToken) {
          onToken(`\n--- Processing Dataset Chunk ${i + 1}/${datasetChunks.length} ---\n`);
        }

        const chunkRes = await handleTextInference(
          engine,
          category,
          chunkPrompt,
          chunkOptions,
          maxTokens,
          sendProgress,
          onToken
        );

        chunkOutputs.push(chunkRes);
      }

      console.log("🔄 [WebGPU Chunking] All chunks processed. Merging and deduplicating outputs...");
      const mergedResult = mergeAndDeduplicateJSON(chunkOutputs);
      
      if (onToken) {
        onToken(`\n--- Merge & Deduplication Complete ---\n`);
      }

      return mergedResult;
    }
  }

  if (engine.currentModelId?.toLowerCase().includes("gemma-4") || engine.currentModelId?.toLowerCase().includes("voxtral") || (engine.model && engine.processor)) {
    const isVision = !!input.image;
    const isAudio = !!input.audio;
    const isMultimodal = isVision || isAudio;
    
    let messages: any[] = [];
    if (options.chatHistory && Array.isArray(options.chatHistory) && options.chatHistory.length > 0) {
      const hasSystem = options.chatHistory.some((m: any) => m.role === "system");
      const isLiveWS = !!options.isLiveWS;
      if (!isLiveWS && !hasSystem && options.systemPrompt) {
        messages.push({ role: "system", content: options.systemPrompt });
      }
      options.chatHistory.forEach((m: any) => {
        if (m.role === "system") {
          messages.push({ role: "system", content: m.content });
        } else if (m.role === "user") {
          const hasImg = !!m.image;
          const textContent = m.content;
          if (hasImg) {
            messages.push({
              role: "user",
              content: [
                { type: "image" },
                { type: "text", text: textContent }
              ]
            });
          } else {
            messages.push({ role: "user", content: textContent });
          }
        } else {
          let textContent = m.content;
          if (textContent.includes("<|channel>thought")) {
            textContent = textContent.replace(/<\|channel>thought.*?<channel\|>/gs, "").trim();
          }
          messages.push({ role: "model", content: textContent });
        }
      });
      if (isLiveWS && !hasSystem && options.systemPrompt) {
        messages.push({ role: "system", content: options.systemPrompt });
      }
    } else if (isMultimodal) {
      if (options.systemPrompt) {
        messages.push({ role: "system", content: options.systemPrompt });
      }
      messages.push({
        role: "user",
        content: [
          ...(isVision ? [{ type: "image" }] : []),
          {
            type: "text",
            text: options.prompt || (typeof input === 'string' ? input : "Describe this content"),
          },
          ...(isAudio ? [{ type: "audio" }] : []),
        ],
      });
    } else {
      if (options.systemPrompt) {
        messages.push({ role: "system", content: options.systemPrompt });
      }
      messages.push({ role: "user", content: typeof input === 'string' ? input : (options.prompt || "Hello") });
    }

    // Ensure engine.processor is loaded (self-healing / fallback)
    if (!engine.processor) {
      console.warn("⚠️ (Worker) engine.processor was null during generation. Loading on-the-fly...");
      const modelId = options.modelId;
      const modelInfo = MODELS.find(m => m.id === modelId || m.modelID === modelId || (engine.currentModelId && engine.currentModelId.includes(m.id)));
      if (modelInfo) {
        try {
          if (modelInfo.id.toLowerCase().includes("voxtral")) {
            if (!engine.VoxtralProcessor) {
              const transformers = await import("@huggingface/transformers");
              engine.VoxtralProcessor = transformers.VoxtralProcessor;
            }
            const ProcessorClass = engine.VoxtralProcessor || AutoProcessor;
            engine.processor = await ProcessorClass.from_pretrained(modelInfo.modelID);
          } else {
            engine.processor = await AutoProcessor.from_pretrained(modelInfo.modelID);
          }
        } catch (e) {
          try {
            engine.processor = await AutoTokenizer.from_pretrained(modelInfo.modelID);
          } catch (tokenErr) {
            console.error("❌ (Worker) On-the-fly load of tokenizer failed:", tokenErr);
          }
        }
      }
    }

    if (!engine.processor) {
      throw new Error("Unable to run generation: Processor/Tokenizer is null and failed to load.");
    }

    let prompt: string = "";
    let hasApplyChatTemplate = false;

    // Try apply_chat_template on the processor or tokenizer
    const tokenizerOrProcessor = engine.processor.tokenizer || engine.processor;
    if (tokenizerOrProcessor && typeof tokenizerOrProcessor.apply_chat_template === "function") {
      try {
        prompt = tokenizerOrProcessor.apply_chat_template(messages, {
          add_generation_prompt: true,
          tokenize: false,
          enable_thinking: options.thinkEnabled || false,
          ...(options?.tools ? { tools: options.tools } : {})
        }) as string;
        hasApplyChatTemplate = true;
      } catch (e) {
        console.warn("⚠️ (Worker) apply_chat_template failed on processor/tokenizer, falling back to compileChatTemplate:", e);
      }
    }

    if (!hasApplyChatTemplate || !prompt) {
      console.log("ℹ️ (Worker) Using compileChatTemplate fallback for Gemma 4...");
      prompt = compileChatTemplate(engine.currentModelId || "", messages, options);
    }

    let inputs;
    if (engine.processor.tokenizer) {
      inputs = await engine.processor(prompt, isVision ? input.image : null, isAudio ? input.audio : null, {
        add_special_tokens: false,
      });
    } else {
      inputs = await engine.processor(prompt, {
        add_special_tokens: false,
      });
    }

    const tempVal = options.temperature !== undefined ? Number(options.temperature) : undefined;
    const topPVal = options.top_p !== undefined ? Number(options.top_p) : undefined;
    const topKVal = options.top_k !== undefined ? Number(options.top_k) : undefined;
    let gemmaDoSample = options.do_sample !== undefined ? !!options.do_sample : false;
    if (tempVal !== undefined || topPVal !== undefined || topKVal !== undefined) {
      gemmaDoSample = tempVal !== 0;
    }

    let stopped = false;
    let accumulatedText = "";
    let currentInputs = inputs;
    let remainingTokens = maxTokens;
    const CHUNK_SIZE = 256;
    let currentPrompt = prompt;

    const transformers = await import("@huggingface/transformers");

    while (remainingTokens > 0 && !stopped) {
      const chunkMaxTokens = Math.min(CHUNK_SIZE, remainingTokens);
      console.log(`📡 [WebGPU Chunking] Generating chunk of max ${chunkMaxTokens} tokens. Remaining: ${remainingTokens}`);

      const streamer = onToken ? new transformers.TextStreamer(engine.processor.tokenizer || engine.processor, {
        skip_prompt: true,
        skip_special_tokens: true,
        callback_function: (token: string) => {
          if (stopped) return;
          if (token.includes("<turn|>") || token.includes("<|turn>") || token.includes("<end_of_turn>") || token.includes("<start_of_turn>")) {
            stopped = true;
            return;
          }
          onToken(token);
        }
      }) : undefined;

      let outputs;
      try {
        outputs = await engine.model.generate({
          ...currentInputs,
          max_new_tokens: chunkMaxTokens,
          do_sample: gemmaDoSample,
          streamer,
          ...(tempVal !== undefined ? { temperature: tempVal } : {}),
          ...(topPVal !== undefined ? { top_p: topPVal } : {}),
          ...(topKVal !== undefined ? { top_k: topKVal } : {}),
        });
      } catch (genErr: any) {
        if (String(genErr).includes("unaligned accesses") || String(genErr).includes("memory access out of bounds")) {
           throw new Error("CONTEXT_LENGTH_EXCEEDED: The input context exceeds the safe memory limits of the current engine. Please shorten your prompt or enable Safe Engine Mode.");
        }
        throw genErr;
      }

      const promptLength = currentInputs.input_ids.dims.at(-1);
      const sliceOutput = outputs.slice(null, [promptLength, null]);
      let decoded = engine.processor.batch_decode(
        sliceOutput,
        { skip_special_tokens: true },
      );

      const chunkResult = decoded[0] || "";
      accumulatedText += chunkResult;
      remainingTokens -= chunkMaxTokens;

      const generatedTokensCount = sliceOutput.dims ? sliceOutput.dims.at(-1) : 0;

      // Clean up WebGPU buffers/tensors for this chunk to prevent VRAM spikes
      safeDisposeTensors(sliceOutput);
      safeDisposeTensors(outputs);
      safeDisposeTensors(currentInputs);

      // Check if we should stop
      const stopTags = ["<turn|>", "<|turn>", "<end_of_turn>", "<start_of_turn>"];
      let foundStopTag = false;
      for (const tag of stopTags) {
        if (chunkResult.includes(tag) || accumulatedText.includes(tag)) {
          foundStopTag = true;
          break;
        }
      }

      if (foundStopTag || stopped || chunkResult.length === 0 || (generatedTokensCount !== undefined && generatedTokensCount < chunkMaxTokens)) {
        console.log(`📡 [WebGPU Chunking] Generation finished naturally or hit stop tag.`);
        break;
      }

      // Re-tokenize with accumulated text appended
      currentPrompt = prompt + accumulatedText;
      if (engine.processor.tokenizer) {
        currentInputs = await engine.processor(currentPrompt, isVision ? input.image : null, isAudio ? input.audio : null, {
          add_special_tokens: false,
        });
      } else {
        currentInputs = await engine.processor(currentPrompt, {
          add_special_tokens: false,
        });
      }
    }

    let result = accumulatedText;
    const stopTags = ["<turn|>", "<|turn>", "<end_of_turn>", "<start_of_turn>"];
    for (const tag of stopTags) {
      const idx = result.indexOf(tag);
      if (idx !== -1) {
        result = result.substring(0, idx).trim();
      }
    }
    
    return result;
  }

  if (engine.pipeline) {
    const pipeTemp = options.temperature !== undefined ? Number(options.temperature) : undefined;
    const pipeTopP = options.top_p !== undefined ? Number(options.top_p) : undefined;
    const pipeTopK = options.top_k !== undefined ? Number(options.top_k) : undefined;
    let pipeDoSample = options.do_sample !== undefined ? !!options.do_sample : undefined;
    if (pipeTemp !== undefined || pipeTopP !== undefined || pipeTopK !== undefined) {
      pipeDoSample = pipeTemp !== 0;
    }

    const pipeOptions: any = {
      ...options,
      max_new_tokens: maxTokens,
      ...(pipeTemp !== undefined ? { temperature: pipeTemp } : {}),
      ...(pipeTopP !== undefined ? { top_p: pipeTopP } : {}),
      ...(pipeTopK !== undefined ? { top_k: pipeTopK } : {}),
      ...(pipeDoSample !== undefined ? { do_sample: pipeDoSample } : {}),
    };
    let formattedInput: any = input;
    let promptString = "";
    let promptWithoutSpecialTokens = "";

    const isTextGen = engine.pipeline.task === "text-generation" || engine.pipeline.task === "image-text-to-text";

    if (isTextGen && typeof input === "string") {
      const messages = [];
      if (options.chatHistory && Array.isArray(options.chatHistory) && options.chatHistory.length > 0) {
        const hasSystem = options.chatHistory.some((m: any) => m.role === "system");
        const isLiveWS = !!options.isLiveWS;
        if (!isLiveWS && !hasSystem) {
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
            let textContent = m.content;
            if (m.role === "assistant" && textContent.includes("<|channel>thought")) {
              textContent = textContent.replace(/<\|channel>thought.*?<channel\|>/gs, "").trim();
            }
            messages.push({ role: m.role, content: textContent });
          }
        });
        if (isLiveWS && !hasSystem) {
          if (options.systemPrompt) {
            messages.push({ role: "system", content: options.systemPrompt });
          } else {
            messages.push({ role: "system", content: "You are a helpful assistant." });
          }
        }
      } else {
        if (options.systemPrompt) {
          messages.push({ role: "system", content: options.systemPrompt });
        } else {
          messages.push({ role: "system", content: "You are a helpful assistant." });
        }
        messages.push({ role: "user", content: input });
      }

      let isTemplatedOk = false;
      const modelIdLower = String(engine.currentModelId || "").toLowerCase();
      const preferCustomTemplate = modelIdLower.includes("qwen") || 
                                   modelIdLower.includes("llama") || 
                                   modelIdLower.includes("gemma") || 
                                   modelIdLower.includes("tiny-llm") || 
                                   modelIdLower.includes("janus") ||
                                   modelIdLower.includes("fara");

      const isLfm2 = modelIdLower.includes("lfm2");

      if (isLfm2) {
        formattedInput = messages;
        isTemplatedOk = true;
        if (options.tools) {
          pipeOptions.tokenizer_encode_kwargs = { tools: options.tools };
        }
      } else {
        try {
          if (!preferCustomTemplate && engine.pipeline.tokenizer?.apply_chat_template) {
            const templated = engine.pipeline.tokenizer.apply_chat_template(messages, {
              tokenize: false,
              add_generation_prompt: true,
              enable_thinking: options?.thinkEnabled || false,
              ...(options?.tools ? { tools: options.tools } : {})
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
          const compiled = compileChatTemplate(engine.currentModelId || "", messages, options);
          formattedInput = compiled;
          promptString = compiled;
        }
      }
    }

    if (engine.pipeline.tokenizer && typeof formattedInput === "string") {
      try {
        const promptTokens = engine.pipeline.tokenizer.encode(formattedInput);
        const tokensArray = Array.from((promptTokens && promptTokens.data) || promptTokens || []);
        promptWithoutSpecialTokens = engine.pipeline.tokenizer.decode(tokensArray, { skip_special_tokens: true });
      } catch (e) {
        console.warn("Failed to decode prompt without special tokens in worker:", e);
        promptWithoutSpecialTokens = typeof formattedInput === "string" ? formattedInput : "";
      }
    }

    let accumulatedText = "";
    let currentInput = formattedInput;
    let remainingTokens = maxTokens;
    const CHUNK_SIZE = 256;
    let stopped = false;

    while (remainingTokens > 0 && !stopped) {
      const chunkMaxTokens = Math.min(CHUNK_SIZE, remainingTokens);
      console.log(`📡 [WebGPU Chunking Pipeline] Generating chunk of max ${chunkMaxTokens} tokens. Remaining: ${remainingTokens}`);

      const currentPipeOptions: any = {
        ...options,
        max_new_tokens: chunkMaxTokens,
        return_full_text: false,
        ...(pipeTemp !== undefined ? { temperature: pipeTemp } : {}),
        ...(pipeTopP !== undefined ? { top_p: pipeTopP } : {}),
        ...(pipeTopK !== undefined ? { top_k: pipeTopK } : {}),
        ...(pipeDoSample !== undefined ? { do_sample: pipeDoSample } : {}),
      };

      if (onToken && engine.pipeline.tokenizer) {
        if (typeof currentInput === "object") {
          const transformers = await import("@huggingface/transformers");
          currentPipeOptions.streamer = new transformers.TextStreamer(engine.pipeline.tokenizer, {
            skip_prompt: true,
            skip_special_tokens: true,
            callback_function: (val: string) => {
              if (options.abortId && (engine as any).abortFlags && (engine as any).abortFlags[options.abortId]) {
                throw new Error("Inference aborted by client.");
              }
              if (stopped) return;
              onToken(val);
            }
          });
        } else {
          let lastLength = 0;
          currentPipeOptions.callback_function = (beams: any) => {
            if (options.abortId && (engine as any).abortFlags && (engine as any).abortFlags[options.abortId]) {
              throw new Error("Inference aborted by client.");
            }
            const decoded = engine.pipeline.tokenizer.decode(beams[0].output_token_ids, { skip_special_tokens: true });
            let currentText = decoded;

            if (promptWithoutSpecialTokens) {
              if (currentText.startsWith(promptWithoutSpecialTokens)) {
                currentText = currentText.substring(promptWithoutSpecialTokens.length);
              } else {
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
                  } else if (promptIdx > promptWithoutSpecialTokens.length * 0.5) {
                    const approxResIdx = Math.min(currentText.length, Math.max(resIdx, promptWithoutSpecialTokens.length - (promptWithoutSpecialTokens.length - promptIdx)));
                    currentText = currentText.substring(approxResIdx);
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
              }
            } else if (promptString && currentText.startsWith(promptString)) {
              currentText = currentText.substring(promptString.length);
            }

            const newToken = currentText.substring(lastLength);
            lastLength = currentText.length;
            if (newToken && !stopped) {
              onToken(newToken);
            }
          };
        }
      }

      let output;
      try {
        output = await engine.pipeline(currentInput, currentPipeOptions);
      } catch (pipelineErr: any) {
        if (String(pipelineErr).includes("unaligned accesses") || String(pipelineErr).includes("memory access out of bounds")) {
           throw new Error("CONTEXT_LENGTH_EXCEEDED: The input context exceeds the safe memory limits of the current engine. Please shorten your prompt or enable Safe Engine Mode.");
        }
        throw pipelineErr;
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
          let strippedResponse = responseText;
          if (promptWithoutSpecialTokens) {
            if (strippedResponse.startsWith(promptWithoutSpecialTokens)) {
              strippedResponse = strippedResponse.substring(promptWithoutSpecialTokens.length).trim();
            } else {
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
                } else if (promptIdx > promptWithoutSpecialTokens.length * 0.5) {
                  const approxResIdx = Math.min(strippedResponse.length, Math.max(resIdx, promptWithoutSpecialTokens.length - (promptWithoutSpecialTokens.length - promptIdx)));
                  strippedResponse = strippedResponse.substring(approxResIdx).trim();
                }
              } catch (e) {
                if (strippedResponse.startsWith(promptWithoutSpecialTokens)) {
                  strippedResponse = strippedResponse.substring(promptWithoutSpecialTokens.length).trim();
                }
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

      accumulatedText += responseText;
      remainingTokens -= chunkMaxTokens;

      safeDisposeTensors(output);

      if (responseText.length === 0 || stopped) {
        break;
      }

      // Prepare input for the next chunk
      if (typeof formattedInput === "string") {
        currentInput = formattedInput + accumulatedText;
        try {
          if (engine.pipeline.tokenizer) {
            const promptTokens = engine.pipeline.tokenizer.encode(currentInput);
            const tokensArray = Array.from((promptTokens && promptTokens.data) || promptTokens || []);
            promptWithoutSpecialTokens = engine.pipeline.tokenizer.decode(tokensArray, { skip_special_tokens: true });
          }
        } catch (e) {
          promptWithoutSpecialTokens = currentInput;
        }
      } else {
        const updatedMessages = [...(currentInput as any)];
        const lastMsg = updatedMessages[updatedMessages.length - 1];
        if (lastMsg && lastMsg.role === "assistant") {
          lastMsg.content += responseText;
        } else {
          updatedMessages.push({ role: "assistant", content: responseText });
        }
        currentInput = updatedMessages;
      }
    }

    safeDisposeTensors(formattedInput);
    return accumulatedText;
  }
  return null;
}

export async function runDirectorInference(
  engine: any,
  input: string,
  modelId?: string,
  sendProgress?: (p: any) => void,
  customDtype?: string
) {
  const director = await engine.getDirector(modelId, sendProgress, customDtype);
  
  const messages = [
    { role: "system", content: DIRECTOR_SYSTEM_PROMPT },
    { role: "user", content: input }
  ];

  const isGemma4 = modelId?.toLowerCase().includes("gemma-4") || (engine.directorModelId && engine.directorModelId.toLowerCase().includes("gemma-4"));

  let text = "";
  let query: any = "";

  if (isGemma4) {
    const modelToUse = engine.directorModel;
    const processorToUse = engine.directorProcessor;
    
    let prompt = "";
    let hasApplyChatTemplate = false;
    const tokenizerOrProcessor = processorToUse.tokenizer || processorToUse;
    if (tokenizerOrProcessor && typeof tokenizerOrProcessor.apply_chat_template === "function") {
      try {
        prompt = tokenizerOrProcessor.apply_chat_template(messages, {
          add_generation_prompt: true,
          tokenize: false,
        }) as string;
        hasApplyChatTemplate = true;
      } catch (e) {
        console.warn("⚠️ (Worker) Director apply_chat_template failed, using compileChatTemplate fallback:", e);
      }
    }
    
    if (!hasApplyChatTemplate || !prompt) {
      prompt = compileChatTemplate(modelId || engine.directorModelId || "", messages);
    }
    query = prompt;

    let inputs;
    if (processorToUse.tokenizer) {
      inputs = await processorToUse(prompt, null, null, {
        add_special_tokens: false,
      });
    } else {
      inputs = await processorToUse(prompt, {
        add_special_tokens: false,
      });
    }
    
    const outputs = await modelToUse.generate({
      ...inputs,
      max_new_tokens: 128,
      do_sample: false,
      temperature: 0.1,
    });
    
    const sliceOutput = outputs.slice(null, [inputs.input_ids.dims.at(-1), null]);
    const decoded = processorToUse.batch_decode(
      sliceOutput,
      { skip_special_tokens: true },
    );
    
    text = decoded[0] || "";
    
    safeDisposeTensors(inputs);
    safeDisposeTensors(outputs);
    safeDisposeTensors(sliceOutput);
  } else {
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

    let output;
    try {
      output = await director(query, {
        max_new_tokens: 128,
        temperature: 0.1,
        do_sample: false,
        return_full_text: false
      });
    } catch (directorErr: any) {
      if (String(directorErr).includes("unaligned accesses") || String(directorErr).includes("memory access out of bounds")) {
         throw new Error("CONTEXT_LENGTH_EXCEEDED: The input context exceeds the safe memory limits of the current engine. Please shorten your prompt or enable Safe Engine Mode.");
      }
      throw directorErr;
    }

    const gen = output[0].generated_text;
    if (Array.isArray(gen)) {
      const assistantMsgs = gen.filter((m: any) => m.role === "assistant");
      const lastMsg = assistantMsgs.length > 0 ? assistantMsgs[assistantMsgs.length - 1] : gen[gen.length - 1];
      text = lastMsg?.content || lastMsg || "";
    } else {
      text = String(gen);
    }
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
  
  if (!text && thinking) {
     text = thinking;
     thinking = "";
  }
  
  let cleanOutput = text.trim();
  
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

export async function getEmbedding(engine: any, text: string, sendProgress?: (p: any) => void): Promise<number[]> {
  if (!engine.embeddingPipeline) {
    console.log("🚀 (Worker) Loading Lightweight Semantic Embeddings Engine (all-MiniLM-L6-v2)...");
    engine.embeddingPipeline = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
      device: "wasm",
      progress_callback: sendProgress
    });
  }
  const output = await engine.embeddingPipeline(text, { pooling: "mean", normalize: true });
  return Array.from(output.data);
}
