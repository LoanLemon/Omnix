import { useState, useEffect, useRef, useCallback } from "react";
import { Message } from "@shared/types";
import { browserEngine } from "@/lib/ModelEngine";
import { sanitizeSttOutput } from "@/hooks/useSpeechToText";
import { stringify as masonStringify } from "mason-parser";
import { memoryStore } from "@/lib/memory";
import { getToneInstruction } from "@shared/prompts";
import { MODELS } from "@shared/modelList";

export function useSocketInference(
  addLog: (msg: string, type?: "info" | "error" | "success") => void,
  setIsModelReady: (val: boolean) => void,
  setIsModelLoading: (val: boolean) => void,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setLoadingProgress: React.Dispatch<React.SetStateAction<Record<string, { progress: number; status: string }>>>,
  setWorkerCount: (count: number) => void,
  enableRelayMode: boolean,
  setIsRemoteProcessing: (val: boolean) => void,
  loadModel: (category: string, modelId?: string, skipLoadingVisuals?: boolean) => Promise<void>,
  selectedModels: Record<string, string>
) {
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeAuthRequest, setActiveAuthRequest] = useState<{ authId: string; webdomain: string; category: string } | null>(null);

  const respondToAuth = useCallback((authId: string, decision: "once" | "always" | "never" | "block_once") => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "AUTHORIZATION_RESPONSE",
        authId,
        decision
      }));
    }
    setActiveAuthRequest(null);
  }, []);

  useEffect(() => {
    if (!enableRelayMode) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      setIsConnected(false);
      setWorkerCount(0);
      return;
    }

    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      const origin = window.location.origin;
      const host = window.location.host;
      const protocol = window.location.protocol;
      
      const isElectron = typeof window !== "undefined" && !!(window as any).electron;
      const electronPort = isElectron ? (window as any).electron.server.getPort() : '9777';
      
      let wsUrl: string;
      if (origin && origin.startsWith('http')) {
        const baseWs = origin.replace(/^http/, 'ws');
        wsUrl = `${baseWs}/ws-active-compute`;
      } else if (host) {
        const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
        wsUrl = `${wsProtocol}//${host}/ws-active-compute`;
      } else {
        wsUrl = `ws://127.0.0.1:${electronPort}/ws-active-compute`;
      }

      console.log(`🔌 WebSocket Connection: ${wsUrl}`);
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = async () => {
        setIsConnected(true);
        addLog(`Omnix Bridge: Connected to Relay`, "success");

        const hasWebGPU = !!navigator.gpu;
        const capabilities = ["text"];
        if (hasWebGPU) capabilities.push("webgpu");
        
        socket.send(JSON.stringify({
          type: "REGISTER",
          metadata: {
            type: window.navigator.userAgent.toLowerCase().includes('electron') ? "electron" : "browser",
            capabilities
          }
        }));

        const hbInterval = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "HEARTBEAT" }));
          }
        }, 10000);
        (socket as any)._hbInterval = hbInterval;
      };

      let activeTaskCount = 0;
      let isProcessingQueue = false;
      const taskQueue: { operationalMode: string; processingModel: string; request: any }[] = [];

      const getDefaultModelForCategory = (cat: string): string => {
        if (cat === "text") {
          const gemma = MODELS.find(m => m.id === "gemma-3 1B" && m.category === "text");
          if (gemma) return gemma.id;
        }
        const found = MODELS.find(m => m.category === cat);
        return found ? found.id : "";
      };

      const stripThinkTags = (text: string): string => {
        if (!text) return "";
        return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
      };

      const chunkTextForTTS = (text: string): string[] => {
        const cleanText = stripThinkTags(text);
        if (!cleanText) return [];

        const sentenceRegex = /[^.!?\n]+[.!?\n]*/g;
        const rawSentences = cleanText.match(sentenceRegex) || [cleanText];

        const subChunks: string[] = [];

        for (const sentence of rawSentences) {
          const trimmedSentence = sentence.trim();
          if (!trimmedSentence) continue;

          const pauseRegex = /[^,;:—\n]+[,;:—\n]*/g;
          const segments = trimmedSentence.match(pauseRegex) || [trimmedSentence];

          for (const segment of segments) {
            const trimmedSegment = segment.trim();
            if (!trimmedSegment) continue;

            const words = trimmedSegment.split(/\s+/).filter(Boolean);
            if (words.length === 0) continue;

            if (words.length <= 10) {
              subChunks.push(trimmedSegment);
            } else {
              let remainingWords = [...words];
              while (remainingWords.length > 0) {
                const chunkWords = remainingWords.splice(0, 10);
                subChunks.push(chunkWords.join(" "));
              }
            }
          }
        }

        return subChunks.map(c => c.trim()).filter(Boolean);
      };

      const processQueue = async () => {
        if (isProcessingQueue || taskQueue.length === 0) return;
        isProcessingQueue = true;
        setIsRemoteProcessing(true);
        
        try {
          while (taskQueue.length > 0) {
            const queuedTask = taskQueue[0]; // peek
            const { operationalMode, processingModel, request } = queuedTask;
            
            try {
              // 1. First make sure the correct model is loaded: "processing model"
              addLog(`🔄 Queuing engine: loading processing model "${processingModel}" for "${operationalMode}" remote task...`, "info");
              await loadModel(operationalMode, processingModel, true); // true = skipLoadingVisuals

              // 2. Process the "request"
              await handleTask(request, processingModel);
            } catch (err: any) {
              addLog(`❌ Failed processing queued task ${request.requestId}: ${err?.message || String(err)}`, "error");
              if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: "TASK_RESULT", requestId: request.requestId, error: err?.message || String(err) }));
              }
            } finally {
              // 3. Remove the item from queue
              taskQueue.shift();
            }
          }
        } finally {
          isProcessingQueue = false;
          setIsRemoteProcessing(false);
        }
      };

      socket.onmessage = async (event) => {
        const payload = JSON.parse(event.data);
        const { type, requestId, category, workerCount } = payload;

        if (type === "NETWORK_STATS") {
          setWorkerCount(workerCount || 0);
          return;
        }

        if (type === "AUTHORIZATION_REQUEST") {
          const { authId, webdomain, category: reqCat } = payload;
          addLog(`🔐 Security prompt: authorization requested from external site ${webdomain}!`, "info");
          setActiveAuthRequest({ authId, webdomain, category: reqCat });
          return;
        }

        if (type === "CANCEL_TASK") {
          addLog(`🚫 Task ${requestId} cancelled by server.`, "error");
          browserEngine.cancelInference(requestId);
          const idx = taskQueue.findIndex(t => t.request.requestId === requestId);
          if (idx !== -1) taskQueue.splice(idx, 1);
          return;
        }

        if (type === "REMOTE_TASK") {
          const operationalMode = category || "text";
          let processingModel = payload.options?.modelId;
          if (!processingModel) {
            if (operationalMode === "livews") {
              processingModel = selectedModels["text"] || getDefaultModelForCategory("text");
            } else {
              processingModel = selectedModels[operationalMode] || getDefaultModelForCategory(operationalMode);
            }
          }

          taskQueue.push({
            operationalMode,
            processingModel,
            request: payload
          });
          processQueue();
          return;
        }
      };

      const handleTask = async (payload: any, activeModelId: string) => {
        const { type, requestId, category, input, options } = payload;

        if (type === "REMOTE_TASK") {
          addLog(`🌐 Remote Task Received: ${category}`, "info");
          addLog(`📥 [API INPUT]: ${typeof input === "string" ? input : JSON.stringify(input)}`, "info");
          if (options && Object.keys(options).length > 0) {
            addLog(`⚙️ [API OPTIONS]: ${JSON.stringify(options)}`, "info");
          }
          activeTaskCount++;
          socket.send(JSON.stringify({ type: "STATUS_UPDATE", activeTasks: activeTaskCount }));

          const isNormalRequest = !options?.reqId;

          if (isNormalRequest) {
            let promptText = "";
            let promptImage: string | undefined = undefined;

            switch (category) {
              case "text":
                promptText = input;
                break;
              case "director":
                promptText = `[Director Routing Request] ${input}`;
                break;
              case "vision":
                promptText = options?.prompt || "Analyze this image";
                promptImage = input;
                break;
              case "image-gen":
                promptText = `Generate image: ${input}`;
                break;
              case "music-gen":
                promptText = `Generate music: ${input}`;
                break;
              case "stt":
                promptText = `[Speech to Text Transcribe Request]`;
                break;
              case "tts":
                promptText = `Speak: ${input}`;
                break;
              default:
                promptText = `[${category}] ${typeof input === "string" ? input : "Inference payload"}`;
                break;
            }

            const userMsg = {
              id: `remote-user-${requestId}`,
              role: "user" as const,
              content: promptText,
              image: promptImage
            };

            const assistantMsg = {
              id: `remote-assistant-${requestId}`,
              role: "assistant" as const,
              content: "Thinking...",
              isQueued: true
            };

            setMessages(prev => [...prev, userMsg, assistantMsg]);
          }

          try {
            setIsModelLoading(true);

            let finalInput = input;
            if (category === "stt" && typeof input === "string") {
              addLog("Converting STT input from Base64 to Float32Array...", "info");
              try {
                const binaryString = window.atob(input);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);
                finalInput = audioBuffer.getChannelData(0);
              } catch (convErr: any) {
                console.error("Failed to decode base64 STT payload:", convErr);
                addLog(`Engine STT Decode Error: ${convErr?.message || String(convErr)}`, "error");
              }
            }

            let result;
            if (category === "inject-rag") {
              const textToInject = finalInput;
              const targetRAG = options?.isolatedRAG || options?.reqId;
              
              if (!textToInject || !targetRAG) {
                throw new Error("Missing text or isolatedRAG/reqId for inject-rag task.");
              }

              addLog(`📥 Generating embeddings for injected RAG entry [id: ${String(targetRAG)}]...`, "info");
              const embedding = await browserEngine.getEmbedding(textToInject, (p: any) => {
                if (p.status === "progress" && socket.readyState === WebSocket.OPEN) {
                  socket.send(JSON.stringify({ type: "PROGRESS_UPDATE", requestId, progress: p }));
                }
              });

              const entryId = typeof crypto !== "undefined" && crypto.randomUUID
                ? crypto.randomUUID()
                : Math.random().toString(36).substring(2, 11);

              const entry = {
                id: entryId,
                text: textToInject,
                embedding,
                timestamp: Date.now(),
                metadata: {
                  isolatedRAG: String(targetRAG),
                  ...(options?.metadata || {})
                }
              };

              await memoryStore.add(entry);
              addLog(`📥 Successfully stored isolated RAG memory entry for key: ${targetRAG}`, "success");

              result = {
                success: true,
                message: "Successfully injected background story into isolated RAG.",
                entry: {
                  id: entryId,
                  text: textToInject,
                  timestamp: entry.timestamp
                }
              };
            } else if (category === "director") {
              result = await browserEngine.runDirectorInference(finalInput, activeModelId || options?.modelId, (p: any) => {
                if (p.status === "progress") {
                  setLoadingProgress(prev => ({
                    ...prev,
                    [p.file]: { progress: p.progress, status: `Downloading ${p.file}` }
                  }));
                }
                if (socket.readyState === WebSocket.OPEN) {
                  socket.send(JSON.stringify({ type: "PROGRESS_UPDATE", requestId, progress: p }));
                }
              });
            } else if (category === "tts") {
              const cleanText = stripThinkTags(finalInput);
              addLog(`🎙️ Synthesizing TTS with robust 10-word sentence chunking...`, "info");
              const ttsChunks = chunkTextForTTS(cleanText);
              addLog(`Generated ${ttsChunks.length} chunks for synthesis.`, "info");
              
              let concatenatedAudio: number[] = [];
              let samplingRate = 24000;
              const finalOptions = { ...options };

              for (let i = 0; i < ttsChunks.length; i++) {
                const chunkText = ttsChunks[i];
                addLog(`🗣️ Synthesizing chunk ${i+1}/${ttsChunks.length}: "${chunkText}"`, "info");
                
                try {
                  const ttsRes = await browserEngine.runInference("tts", chunkText, {
                    ...finalOptions,
                    progress_callback: (p: any) => {
                      if (p.status === "progress") {
                        setLoadingProgress(prev => ({
                          ...prev,
                          [p.file]: { progress: p.progress, status: `Downloading ${p.file}` }
                        }));
                      }
                    }
                  });
                  
                  if (ttsRes && ttsRes.audio) {
                    concatenatedAudio.push(...ttsRes.audio);
                    if (ttsRes.sampling_rate) {
                      samplingRate = ttsRes.sampling_rate;
                    }
                  }
                } catch (err: any) {
                  addLog(`⚠️ TTS chunk synthesis failed: ${err?.message || String(err)}`, "error");
                }
              }

              result = {
                audio: concatenatedAudio,
                sampling_rate: samplingRate
              };
            } else if (category === "livews") {
              addLog(`📡 Starting LiveWS Task Execution...`, "info");
              
              const sendUpdate = (data: any) => {
                if (socket.readyState === WebSocket.OPEN) {
                  socket.send(JSON.stringify({ type: "TASK_UPDATE", requestId, data }));
                }
              };

              let userInput = finalInput.text;

              // Step 1: STT
              if (finalInput.audio) {
                sendUpdate({ type: "status", status: "processing-stt" });
                addLog("LiveWS: Converting audio input using STT...", "info");
                
                let audioData = finalInput.audio;
                if (typeof audioData === "string") {
                  try {
                    const binaryString = window.atob(audioData);
                    const len = binaryString.length;
                    const bytes = new Uint8Array(len);
                    for (let i = 0; i < len; i++) {
                      bytes[i] = binaryString.charCodeAt(i);
                    }
                    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                    const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);
                    audioData = audioBuffer.getChannelData(0);
                  } catch (convErr: any) {
                    console.error("Failed to decode base64 STT payload:", convErr);
                    addLog(`Engine STT Decode Error: ${convErr?.message || String(convErr)}`, "error");
                  }
                }

                const sttRes = await browserEngine.runInference("stt", audioData, {
                  progress_callback: (p: any) => {
                    if (p.status === "progress") {
                      setLoadingProgress(prev => ({
                        ...prev,
                        [p.file]: { progress: p.progress, status: `Downloading STT Model ${p.file}` }
                      }));
                    }
                  }
                });

                userInput = typeof sttRes === "string" ? sanitizeSttOutput(sttRes) : sanitizeSttOutput(sttRes.text || "");
                sendUpdate({ type: "stt-result", text: userInput });
                addLog(`LiveWS: Transcribed STT: "${userInput}"`, "success");
              }

              // Step 2: Text Gen
              let assistantText = "";
              if (userInput) {
                sendUpdate({ type: "status", status: "processing-text" });
                addLog(`LiveWS: Running Text Generation for input: "${userInput}"`, "info");

                let finalOptions = {
                  ...options,
                  modelId: activeModelId || options?.modelId,
                  systemPrompt: finalInput.systemPrompt,
                  isolatedRAG: finalInput.isolatedRAG,
                  reqId: options?.reqId,
                  isLiveWS: true
                };
                if (finalOptions.chatHistory && Array.isArray(finalOptions.chatHistory) && finalOptions.chatHistory.length > 0) {
                  finalOptions.chatHistory = [...finalOptions.chatHistory];
                  const lastIdx = finalOptions.chatHistory.length - 1;
                  if (finalOptions.chatHistory[lastIdx].role === "user") {
                    finalOptions.chatHistory[lastIdx] = {
                      ...finalOptions.chatHistory[lastIdx],
                      content: userInput
                    };
                  }
                }

                // Handle RAG memory lookup
                const isolatedRAGRaw = finalInput.isolatedRAG;
                const hasIsolatedRAG = isolatedRAGRaw !== undefined && isolatedRAGRaw !== null && isolatedRAGRaw !== "" && isolatedRAGRaw !== "false" && isolatedRAGRaw !== false;

                if (hasIsolatedRAG) {
                  const targetRAGKey = (isolatedRAGRaw === true || String(isolatedRAGRaw).toLowerCase() === "true")
                    ? String(options?.reqId || "default")
                    : String(isolatedRAGRaw);

                  addLog(`🔍 Semantic RAG lookup active for liveWS key: "${targetRAGKey}"`, "info");
                  try {
                    const queryVector = await browserEngine.getEmbedding(userInput);
                    const matches = await memoryStore.search(queryVector, 5, 0.35);

                    const filteredMatches = matches.filter(m => {
                      const itemRag = m.metadata?.isolatedRAG;
                      return itemRag !== undefined && String(itemRag) === targetRAGKey;
                    });

                    if (filteredMatches.length > 0) {
                      addLog(`🎯 Context retrieved: Found ${filteredMatches.length} matching memory nodes for "${targetRAGKey}"`, "success");
                      const mergedMemories = filteredMatches.map(m => `[Memory - ${new Date(m.timestamp).toLocaleDateString()}]: ${m.text}`).join("\n");
                      const contextBlock = `\n[THE FOLLOWING ARE RELEVANT MEMORIES AND KNOWLEDGE INJECTED FOR THE CHARACTER OR CONVERSATION SESSION]:\n${mergedMemories}\n[END OF MEMORIES]\n`;

                      if (finalOptions.systemPrompt) {
                        finalOptions.systemPrompt = `${finalOptions.systemPrompt}\n${contextBlock}`;
                      } else {
                        finalOptions.systemPrompt = `You are a character NPC. Leverage these retrieved memories if they are relevant to the user query:\n${contextBlock}`;
                      }
                    } else {
                      addLog(`ℹ️ No isolated memories matched this query for key "${targetRAGKey}".`, "info");
                    }
                  } catch (ragErr) {
                    console.warn("Socket worker RAG retrieval failed:", ragErr);
                  }
                }

                // Handle Personality Shaping
                if (finalInput.ocean) {
                  const personalityBlock = getToneInstruction(finalInput.ocean);
                  if (personalityBlock) {
                    addLog(`🎭 Applying OCEAN traits mapped tone: ${personalityBlock.slice(0, 80)}...`, "info");
                    if (finalOptions.systemPrompt) {
                      finalOptions.systemPrompt = `${personalityBlock}\n\n${finalOptions.systemPrompt}`;
                    } else {
                      finalOptions.systemPrompt = personalityBlock;
                    }
                  }
                }

                const textRes = await browserEngine.runInference("text", userInput, {
                  ...finalOptions,
                  progress_callback: (p: any) => {
                    if (p.status === "progress") {
                      setLoadingProgress(prev => ({
                        ...prev,
                        [p.file]: { progress: p.progress, status: `Downloading Text Model ${p.file}` }
                      }));
                    }
                  }
                });

                assistantText = typeof textRes === "string" ? textRes : (textRes.response || textRes);
                
                // Strip <think>...</think> tags!
                assistantText = stripThinkTags(assistantText);

                sendUpdate({ type: "text-result", text: assistantText,
                transcribed: userInput });
                addLog(`LiveWS AI Text Output: "${assistantText}"`, "success");
              }

              // Step 3: TTS
              if (assistantText) {
                sendUpdate({ type: "status", status: "processing-tts" });
                addLog(`LiveWS: Synthesizing TTS with chunking...`, "info");

                const ttsChunks = chunkTextForTTS(assistantText);
                addLog(`LiveWS: Created ${ttsChunks.length} chunks for TTS.`, "info");

                for (let i = 0; i < ttsChunks.length; i++) {
                  const chunkText = ttsChunks[i];
                  addLog(`LiveWS: Synthesizing chunk ${i+1}/${ttsChunks.length}: "${chunkText}"`, "info");

                  try {
                    const ttsResult = await browserEngine.runInference("tts", chunkText, {
                      voiceId: finalInput.voiceId || "af_heart"
                    });

                    if (ttsResult && ttsResult.audio) {
                      sendUpdate({ type: "tts-result", audio: ttsResult.audio });
                    }
                  } catch (ttsErr: any) {
                    console.error(`LiveWS: Chunk ${i+1} synthesis failed:`, ttsErr);
                    addLog(`LiveWS: Chunk synthesis error: ${ttsErr?.message || String(ttsErr)}`, "error");
                  }
                }
              }

              sendUpdate({ type: "status", status: "idle" });
              
              result = {
                success: true,
                text: assistantText,
                transcribed: userInput
              };
            } else {
              // Handle RAG memory lookup if isolatedRAG is requested
              let finalOptions = { ...options, modelId: activeModelId };
              const isolatedRAGRaw = options?.isolatedRAG;
              const hasIsolatedRAG = isolatedRAGRaw !== undefined && isolatedRAGRaw !== null && isolatedRAGRaw !== "" && isolatedRAGRaw !== "false" && isolatedRAGRaw !== false;

              if (hasIsolatedRAG && (category === "text" || category === "vision")) {
                const targetRAGKey = (isolatedRAGRaw === true || String(isolatedRAGRaw).toLowerCase() === "true")
                  ? String(options?.reqId || "default")
                  : String(isolatedRAGRaw);

                addLog(`🔍 Semantic RAG lookup active for isolation key: "${targetRAGKey}"`, "info");
                try {
                  const queryText = category === "vision" ? (options?.prompt || "Analyze this image") : finalInput;
                  const queryVector = await browserEngine.getEmbedding(queryText);
                  const matches = await memoryStore.search(queryVector, 5, 0.35);

                  const filteredMatches = matches.filter(m => {
                    const itemRag = m.metadata?.isolatedRAG;
                    return itemRag !== undefined && String(itemRag) === targetRAGKey;
                  });

                  if (filteredMatches.length > 0) {
                    addLog(`🎯 Context retrieved: Found ${filteredMatches.length} matching memory nodes for "${targetRAGKey}"`, "success");
                    const mergedMemories = filteredMatches.map(m => `[Memory - ${new Date(m.timestamp).toLocaleDateString()}]: ${m.text}`).join("\n");
                    const contextBlock = `\n[THE FOLLOWING ARE RELEVANT MEMORIES AND KNOWLEDGE INJECTED FOR THE CHARACTER OR CONVERSATION SESSION]:\n${mergedMemories}\n[END OF MEMORIES]\n`;

                    if (finalOptions.systemPrompt) {
                      finalOptions.systemPrompt = `${finalOptions.systemPrompt}\n${contextBlock}`;
                    } else {
                      finalOptions.systemPrompt = `You are a character NPC. Leverage these retrieved memories if they are relevant to the user query:\n${contextBlock}`;
                    }
                  } else {
                    addLog(`ℹ️ No isolated memories matched this query for key "${targetRAGKey}".`, "info");
                  }
                } catch (ragErr) {
                  console.warn("Socket worker RAG retrieval failed:", ragErr);
                }
              }

              // Handle OCEAN Personality traits prompt shaping
              if (options?.ocean && (category === "text" || category === "vision")) {
                const personalityBlock = getToneInstruction(options.ocean);
                if (personalityBlock) {
                  addLog(`🎭 Applying OCEAN traits mapped tone: ${personalityBlock.slice(0, 80)}...`, "info");
                  if (finalOptions.systemPrompt) {
                    finalOptions.systemPrompt = `${personalityBlock}\n\n${finalOptions.systemPrompt}`;
                  } else {
                    finalOptions.systemPrompt = personalityBlock;
                  }
                }
              }

              result = await browserEngine.runInference(category, finalInput, {
                ...finalOptions,
                progress_callback: (p: any) => {
                  if (p.status === "progress") {
                    setLoadingProgress(prev => ({
                      ...prev,
                      [p.file]: { progress: p.progress, status: `Downloading ${p.file}` }
                    }));
                  }
                  if (socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({ type: "PROGRESS_UPDATE", requestId, progress: p }));
                  }
                }
              });
            }
            
            setLoadingProgress({});
            setIsModelLoading(false);
            
            if (category === "stt") {
              if (typeof result === "string") {
                result = sanitizeSttOutput(result);
              } else if (result && typeof result === "object" && (result as any).text !== undefined) {
                (result as any).text = sanitizeSttOutput((result as any).text);
              }
            }
            
            socket.send(JSON.stringify({ type: "TASK_RESULT", requestId, output: result }));
            
            const usedModel = options?.modelId ? options.modelId : (category === "director" ? "auto (director)" : "auto (default)");
            addLog(`✅ Remote Task Completed: ${requestId.substring(0, 8)} | Model: ${usedModel}`, "success");
            addLog(`📤 [API OUTPUT]: ${typeof result === "string" ? result : JSON.stringify(result)}`, "success");

            if (isNormalRequest) {
              setMessages(prev => prev.map(msg => {
                if (msg.id === `remote-assistant-${requestId}`) {
                  const updated = {
                    ...msg,
                    isQueued: false,
                    content: ""
                  } as any;
                  if (category === "image-gen") {
                    updated.content = "Image generated successfully.";
                    updated.image = result;
                  } else if (category === "music-gen") {
                    updated.content = "Audio synthesized successfully.";
                    updated.audio = result.audio;
                  } else if (category === "tts") {
                    updated.content = "Speech synthesized successfully.";
                    updated.audio = result.audioUrl || result.audio;
                  } else if (category === "stt") {
                    updated.content = result.text || result;
                  } else if (category === "director") {
                    updated.content = `Routed intent: ${result.category || result.intent || masonStringify(result, 0, undefined, { compact: true })}`;
                  } else {
                    updated.content = typeof result === "string" ? result : (result.response || masonStringify(result, 0, undefined, { compact: true }));
                  }
                  return updated;
                }
                return msg;
              }));
            }
          } catch (err: any) {
            addLog(`❌ Remote Task Failed: ${err?.message || String(err)}`, "error");
            socket.send(JSON.stringify({ type: "TASK_RESULT", requestId, error: err?.message || String(err) }));

            if (isNormalRequest) {
              setMessages(prev => prev.map(msg => {
                if (msg.id === `remote-assistant-${requestId}`) {
                  return {
                    ...msg,
                    isQueued: false,
                    content: `Error: ${err?.message || String(err)}`
                  };
                }
                return msg;
              }));
            }
          } finally {
            activeTaskCount = Math.max(0, activeTaskCount - 1);
            socket.send(JSON.stringify({ type: "STATUS_UPDATE", activeTasks: activeTaskCount }));
          }
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
        if ((socket as any)._hbInterval) clearInterval((socket as any)._hbInterval);
        addLog("Omnix Bridge: Disconnected. Retrying in 5s...", "error");
        reconnectTimeout = setTimeout(connect, 5000);
      };

      socket.onerror = (err) => {
        console.error("WebSocket Error:", err);
        socket.close();
      };
    };

    connect();

    return () => {
      if (socketRef.current) socketRef.current.close();
      clearTimeout(reconnectTimeout);
    };
  }, [addLog, setIsModelLoading, setLoadingProgress, setWorkerCount, enableRelayMode]);

  const sendInference = useCallback((payload: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.send(JSON.stringify({ type: "GENERATE", ...payload }));
    }
  }, [isConnected]);

  return { isConnected, sendInference, activeAuthRequest, respondToAuth };
}
