import { useState, useEffect, useRef, useCallback } from "react";
import { Message } from "@shared/types";
import { browserEngine } from "@/lib/ModelEngine";
import { sanitizeSttOutput } from "@/hooks/useSpeechToText";
import { stringify as masonStringify } from "mason-parser";
import { memoryStore, chunkBySentences, classifyChunk, prioritizeAndClassifyMemories } from "@/lib/memory";
import { getToneInstruction, getFormattedTimestamp } from "@shared/prompts";
import { MODELS } from "@shared/modelList";
import { tts } from "@/lib/tts";

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
  selectedModels: Record<string, string>,
  speakEnabled: boolean
) {
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeAuthRequest, setActiveAuthRequest] = useState<{ authId: string; webdomain: string; category: string } | null>(null);
  
  const ttsUnloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sttUnloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const addLogRef = useRef(addLog);
  const setIsModelReadyRef = useRef(setIsModelReady);
  const setIsModelLoadingRef = useRef(setIsModelLoading);
  const setMessagesRef = useRef(setMessages);
  const setLoadingProgressRef = useRef(setLoadingProgress);
  const setWorkerCountRef = useRef(setWorkerCount);
  const setIsRemoteProcessingRef = useRef(setIsRemoteProcessing);
  const loadModelRef = useRef(loadModel);
  const selectedModelsRef = useRef(selectedModels);
  const speakEnabledRef = useRef(speakEnabled);

  addLogRef.current = addLog;
  setIsModelReadyRef.current = setIsModelReady;
  setIsModelLoadingRef.current = setIsModelLoading;
  setMessagesRef.current = setMessages;
  setLoadingProgressRef.current = setLoadingProgress;
  setWorkerCountRef.current = setWorkerCount;
  setIsRemoteProcessingRef.current = setIsRemoteProcessing;
  loadModelRef.current = loadModel;
  selectedModelsRef.current = selectedModels;
  speakEnabledRef.current = speakEnabled;

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
    const addLog = (...args: Parameters<typeof addLogRef.current>) => addLogRef.current(...args);
    const setIsModelReady = (...args: Parameters<typeof setIsModelReadyRef.current>) => setIsModelReadyRef.current(...args);
    const setIsModelLoading = (...args: Parameters<typeof setIsModelLoadingRef.current>) => setIsModelLoadingRef.current(...args);
    const setMessages = (...args: Parameters<typeof setMessagesRef.current>) => setMessagesRef.current(...args);
    const setLoadingProgress = (...args: Parameters<typeof setLoadingProgressRef.current>) => setLoadingProgressRef.current(...args);
    const setWorkerCount = (...args: Parameters<typeof setWorkerCountRef.current>) => setWorkerCountRef.current(...args);
    const setIsRemoteProcessing = (...args: Parameters<typeof setIsRemoteProcessingRef.current>) => setIsRemoteProcessingRef.current(...args);
    const loadModel = (...args: Parameters<typeof loadModelRef.current>) => loadModelRef.current(...args);

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

      const getDefaultModelForCategory = (cat: string): string => {
        if (cat === "text") {
          const gemma = MODELS.find(m => m.id === "gemma-3 1B" && m.category === "text");
          if (gemma) return gemma.id;
        }
        const found = MODELS.find(m => m.category === cat);
        return found ? found.id : "";
      };

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

        // Clear unload timeouts if they are active
        if (ttsUnloadTimeoutRef.current) {
          clearTimeout(ttsUnloadTimeoutRef.current);
          ttsUnloadTimeoutRef.current = null;
        }
        if (sttUnloadTimeoutRef.current) {
          clearTimeout(sttUnloadTimeoutRef.current);
          sttUnloadTimeoutRef.current = null;
        }

        // Initialize/download Kokoro TTS and keep in standby
        addLog("LiveWS: Preparing Kokoro TTS standby mode...", "info");
        tts.init().then(() => {
          addLog("LiveWS: Kokoro TTS engine is ready and in standby.", "success");
        }).catch(err => {
          console.error("Failed to initialize Kokoro standby:", err);
          addLog(`LiveWS: Kokoro standby initialization failed: ${err?.message || String(err)}`, "error");
        });

        // Initialize/download STT model in dedicated worker if Cascade Pipeline is selected
        const liveModel = selectedModelsRef.current["live"] || "cascade-pipeline";
        if (liveModel === "cascade-pipeline") {
          browserEngine.isDedicatedSttWorkerEnabled = true;
          const sttModelId = selectedModelsRef.current["stt"] || getDefaultModelForCategory("stt");
          if (sttModelId) {
            addLog(`LiveWS: Preparing dedicated STT worker for model "${sttModelId}"...`, "info");
            browserEngine.loadModel("stt", sttModelId, (p: any) => {
              if (p.status === "progress") {
                setLoadingProgress(prev => ({
                  ...prev,
                  [p.file]: { progress: p.progress, status: `Downloading Dedicated STT Model ${p.file}` }
                }));
              }
            }).then(() => {
              addLog(`LiveWS: Dedicated STT model "${sttModelId}" successfully loaded and standby.`, "success");
            }).catch(err => {
              console.error("Failed to load dedicated STT model:", err);
              addLog(`LiveWS: Dedicated STT model load failed: ${err?.message || String(err)}`, "error");
            });
          }
        }
      };

      let activeTaskCount = 0;
      let isProcessingQueue = false;
      const taskQueue: { operationalMode: string; processingModel: string; request: any }[] = [];

      const stripThinkTags = (text: string): string => {
        if (!text) return "";
        return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
      };

      const stripTTSIgnoredText = (text: string): string => {
        if (!text) return "";
        let cleaned = stripThinkTags(text);
        cleaned = cleaned.replace(/\{\{[\s\S]*?\}\}/g, "");
        cleaned = cleaned.replace(/\{[\s\S]*?\}/g, "");
        return cleaned.trim();
      };

      const chunkTextForTTS = (text: string): string[] => {
        const cleanText = stripTTSIgnoredText(text);
        if (!cleanText) return [];

        const sentenceRegex = /[^.!?\n]+[.!?\n]*/g;
        const rawSentences = cleanText.match(sentenceRegex) || [cleanText];

        const subChunks: string[] = [];

        for (const sentence of rawSentences) {
          const trimmedSentence = sentence.trim();
          if (!trimmedSentence) continue;

          const sentenceWords = trimmedSentence.split(/\s+/).filter(Boolean);
          if (sentenceWords.length === 0) continue;

          // Rule 1: If the sentence is 11 words or less, we speak it as-is
          if (sentenceWords.length <= 11) {
            subChunks.push(trimmedSentence);
            continue;
          }

          // Rule 2: If greater than 11 words, attempt to chunk by comma or semicolon
          const segmentRegex = /[^,;\n]+[,;\n]*/g;
          const segments = trimmedSentence.match(segmentRegex) || [trimmedSentence];

          for (const segment of segments) {
            const trimmedSegment = segment.trim();
            if (!trimmedSegment) continue;

            const segmentWords = trimmedSegment.split(/\s+/).filter(Boolean);
            if (segmentWords.length === 0) continue;

            // Rule 3: If the sub-segment is 11 words or less, speak it
            if (segmentWords.length <= 11) {
              subChunks.push(trimmedSegment);
            } else {
              // Rule 4: If still greater than 11, chunk strictly by 10 words
              let remainingWords = [...segmentWords];
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
              await loadModel(operationalMode === "wait-voice" ? "stt" : operationalMode, processingModel, true); // true = skipLoadingVisuals

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

        if (type === "ABORT_AND_RESPAWN") {
          addLog(`🚫 Server requested abort. Unloading all model workers and reconnecting...`, "error");
          browserEngine.terminateAllWorkers();
          taskQueue.splice(0, taskQueue.length);
          activeTaskCount = 0;
          isProcessingQueue = false;
          setIsRemoteProcessing(false);
          if (socketRef.current) {
            socketRef.current.close();
          }
          return;
        }

        if (type === "REMOTE_TASK") {
          const operationalMode = category || "text";
          let processingModel = payload.options?.modelId;
          if (!processingModel) {
            if (operationalMode === "livews") {
              const liveModel = selectedModelsRef.current["live"] || "cascade-pipeline";
              if (liveModel !== "cascade-pipeline") {
                processingModel = liveModel;
              } else {
                processingModel = selectedModelsRef.current["text"] || getDefaultModelForCategory("text");
              }
            } else if (operationalMode === "wait-voice") {
              processingModel = selectedModelsRef.current["stt"] || getDefaultModelForCategory("stt");
            } else {
              processingModel = selectedModelsRef.current[operationalMode] || getDefaultModelForCategory(operationalMode);
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
              case "wait-voice":
                promptText = `[Waiting for User Voice Response]`;
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
            if (category === "wait-voice") {
              addLog("🎙️ WaitVoice: Activating microphone and waiting for user response...", "info");
              
              // Read parameters from options or input
              const maxDuration = Number(options?.maxDuration || input?.maxDuration || 10000);
              const silenceDuration = Number(options?.silenceDuration || input?.silenceDuration || 1500);
              const silenceThreshold = Number(options?.silenceThreshold || input?.silenceThreshold || 0.005);

              // Record voice
              const audioData = await new Promise<Float32Array>((resolveRecord, rejectRecord) => {
                let stream: MediaStream | null = null;
                let audioContext: AudioContext | null = null;
                let processor: ScriptProcessorNode | null = null;
                let audioSamples: number[] = [];
                let speechStarted = false;
                let continuousSoundStart: number | null = null;
                let lastSoundTime = 0;
                let lastActiveTime = Date.now();
                let finished = false;

                const cleanup = () => {
                  if (finished) return;
                  finished = true;
                  if (processor) {
                    try { processor.disconnect(); } catch (e) {}
                  }
                  if (stream) {
                    try { stream.getTracks().forEach(track => track.stop()); } catch (e) {}
                  }
                  if (audioContext) {
                    try { audioContext.close(); } catch (e) {}
                  }
                };

                navigator.mediaDevices.getUserMedia({ audio: true }).then((micStream) => {
                  stream = micStream;
                  audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                  const source = audioContext.createMediaStreamSource(stream);
                  processor = audioContext.createScriptProcessor(4096, 1, 1);
                  
                  processor.onaudioprocess = (e) => {
                    if (finished) return;
                    const inputData = e.inputBuffer.getChannelData(0);
                    
                    // Calculate RMS to see if there is voice activity
                    let sum = 0;
                    for (let i = 0; i < inputData.length; i++) {
                      const val = inputData[i];
                      audioSamples.push(val);
                      sum += val * val;
                    }
                    const rms = Math.sqrt(sum / inputData.length);
                    const now = Date.now();

                    if (rms > silenceThreshold) {
                      if (continuousSoundStart === null) {
                        continuousSoundStart = now;
                      }
                      lastSoundTime = now;
                      
                      if (now - continuousSoundStart >= 1000) {
                        if (!speechStarted) {
                          speechStarted = true;
                          addLog("🎙️ WaitVoice: Continuous speech detected (at least 1s of active sound)...", "success");
                        }
                        lastActiveTime = now;
                      }
                    } else {
                      // If silent gap is longer than 300ms, reset continuous sound tracker
                      if (now - lastSoundTime > 300) {
                        continuousSoundStart = null;
                      }
                      
                      if (speechStarted) {
                        if (now - lastActiveTime > silenceDuration) {
                          addLog("🎙️ WaitVoice: Silence detected, stopping recording automatically.", "info");
                          cleanup();
                          resolveRecord(new Float32Array(audioSamples));
                        }
                      }
                    }
                  };

                  source.connect(processor);
                  processor.connect(audioContext.destination);

                  // Setup max duration timeout
                  setTimeout(() => {
                    if (!finished) {
                      addLog("🎙️ WaitVoice: Maximum recording duration reached.", "info");
                      cleanup();
                      resolveRecord(new Float32Array(audioSamples));
                    }
                  }, maxDuration);

                }).catch((err) => {
                  cleanup();
                  rejectRecord(new Error("Microphone permission denied or device error: " + err.message));
                });
              });

              if (audioData.length === 0) {
                result = "";
              } else {
                addLog("🎙️ WaitVoice: Transcribing voice using local Whisper STT...", "info");
                const sttRes = await browserEngine.runInference("stt", audioData, {
                  progress_callback: (p: any) => {
                    if (p.status === "progress" && socket.readyState === WebSocket.OPEN) {
                      socket.send(JSON.stringify({ type: "PROGRESS_UPDATE", requestId, progress: p }));
                    }
                  }
                });

                const rawText = typeof sttRes === "string" ? sttRes : (sttRes.text || "");
                result = sanitizeSttOutput(rawText);
                addLog(`🎙️ WaitVoice: Transcribed Text: "${result}"`, "success");
              }
            } else if (category === "inject-rag") {
              const textToInject = finalInput;
              const targetRAG = options?.isolatedRAG || options?.reqId;
              
              if (!textToInject || !targetRAG) {
                throw new Error("Missing text or isolatedRAG/reqId for inject-rag task.");
              }

              const chunks = chunkBySentences(textToInject);
              addLog(`📥 Input split into ${chunks.length} sentence chunks for ingestion.`, "info");

              const storedEntries = [];

              for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                addLog(`📥 [${i + 1}/${chunks.length}] Generating embedding for: "${chunk.slice(0, 40)}..."`, "info");
                
                const embedding = await browserEngine.getEmbedding(chunk, (p: any) => {
                  if (p.status === "progress" && socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({ type: "PROGRESS_UPDATE", requestId, progress: p }));
                  }
                });

                const entryId = typeof crypto !== "undefined" && crypto.randomUUID
                  ? crypto.randomUUID()
                  : Math.random().toString(36).substring(2, 11);

                const classification = classifyChunk(chunk);

                const entry = {
                  id: entryId,
                  text: chunk,
                  embedding,
                  timestamp: Date.now() + i, // Add tiny offset to preserve order
                  metadata: {
                    isolatedRAG: String(targetRAG),
                    classification,
                    ...(options?.metadata || {})
                  }
                };

                await memoryStore.add(entry);
                storedEntries.push({
                  id: entryId,
                  text: chunk,
                  classification,
                  timestamp: entry.timestamp
                });
              }

              addLog(`📥 Successfully stored ${chunks.length} chunked RAG memories with classification labels.`, "success");

              result = {
                success: true,
                message: `Successfully chunked and injected ${chunks.length} background stories into isolated RAG.`,
                entries: storedEntries
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
              let concatenatedAudio: number[] = [];
              let samplingRate = 24000;

              if (options?.cachedAudio && Array.isArray(options.cachedAudio)) {
                addLog(`🎯 Replaying pre-synthesized TTS audio from server-side cache.`, "info");
                concatenatedAudio = options.cachedAudio;
                if (options.samplingRate) {
                  samplingRate = options.samplingRate;
                }
              } else {
                const cleanText = stripThinkTags(finalInput);
                addLog(`🎙️ Synthesizing TTS with robust 10-word sentence chunking...`, "info");
                const ttsChunks = chunkTextForTTS(cleanText);
                addLog(`Generated ${ttsChunks.length} chunks for synthesis.`, "info");
                
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
              }

              result = {
                audio: concatenatedAudio,
                sampling_rate: samplingRate
              };

              if (options?.play && concatenatedAudio.length > 0) {
                try {
                  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: samplingRate });
                  const audioBuffer = audioCtx.createBuffer(1, concatenatedAudio.length, samplingRate);
                  audioBuffer.getChannelData(0).set(new Float32Array(concatenatedAudio));
                  await tts.speak(audioBuffer, undefined, undefined, options?.volume, options?.speed, options?.pitch);
                } catch (playErr) {
                  console.error("Failed to auto-play generated TTS:", playErr);
                  addLog("⚠️ Failed to play generated TTS audio live.", "error");
                }
              }
            } else if (category === "livews") {
              addLog(`📡 Starting LiveWS Task Execution...`, "info");
              
              const sendUpdate = (data: any) => {
                if (socket.readyState === WebSocket.OPEN) {
                  socket.send(JSON.stringify({ type: "TASK_UPDATE", requestId, data }));
                }
              };

              let userInput = finalInput.text;
              let assistantText = "";
              const liveModel = selectedModelsRef.current["live"] || "cascade-pipeline";

              if (liveModel === "cascade-pipeline") {
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
                      // Get slightly larger candidate pool to ensure we find rules/knowledge matches
                      const matches = await memoryStore.search(queryVector, 15, 0.20);

                      const filterBadResponses = (entry: any) => {
                        if (!entry) return false;
                        const tag = entry.metadata?.tag;
                        const tags = entry.metadata?.tags;
                        if (tag === "NEGATIVE/BAD RESPONSE") return false;
                        if (Array.isArray(tags) && tags.includes("NEGATIVE/BAD RESPONSE")) return false;
                        return true;
                      };

                      const filteredMatches = matches.filter(m => {
                        const itemRag = m.metadata?.isolatedRAG;
                        return itemRag !== undefined && String(itemRag) === targetRAGKey;
                      }).filter(filterBadResponses);

                      const allDbEntries = await memoryStore.getAll();
                      const filteredAllDbEntries = allDbEntries.filter(m => {
                        const itemRag = m.metadata?.isolatedRAG;
                        return itemRag !== undefined && String(itemRag) === targetRAGKey;
                      }).filter(filterBadResponses);

                      const { prioritized, debugLogs } = prioritizeAndClassifyMemories(
                        filteredMatches,
                        filteredAllDbEntries,
                        5
                      );

                      debugLogs.forEach(log => console.log(`[RAG PRIORITIZER] ${log}`));

                      if (prioritized.length > 0) {
                        addLog(`🎯 Context retrieved: Found ${prioritized.length} prioritized memories for "${targetRAGKey}"`, "success");
                        const mergedMemories = prioritized.map(m => {
                          const classification = m.metadata?.classification || "";
                          const label = classification ? ` [${classification}]` : "";
                          return `[Memory - ${new Date(m.timestamp).toLocaleDateString()}]${label}: ${m.text}`;
                        }).join("\n");
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

                  // Handle Personality Shaping and tags replacement
                  const socketTimestamp = getFormattedTimestamp();
                  let socketTone = "Direct, clean, concise, helpful, and professional.";
                  let socketOceanApplied = false;
                  if (finalInput.ocean) {
                    const personalityBlock = getToneInstruction(finalInput.ocean);
                    if (personalityBlock) {
                      socketTone = personalityBlock;
                      socketOceanApplied = true;
                    }
                  }

                  if (finalOptions.systemPrompt && (finalOptions.systemPrompt.includes("{{tone}}") || finalOptions.systemPrompt.includes("{{timestamp}}"))) {
                    finalOptions.systemPrompt = finalOptions.systemPrompt
                      .replace(/\{\{tone\}\}/g, socketTone)
                      .replace(/\{\{timestamp\}\}/g, socketTimestamp);
                  } else {
                    if (socketOceanApplied) {
                      addLog(`🎭 Applying OCEAN traits mapped tone: ${socketTone.slice(0, 80)}...`, "info");
                      if (finalOptions.systemPrompt) {
                        finalOptions.systemPrompt = `${socketTone}\n\n${finalOptions.systemPrompt}`;
                      } else {
                        finalOptions.systemPrompt = socketTone;
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
              } else {
                // Voxtral Direct Audio-to-Text Generation Pipeline
                if (finalInput.audio) {
                  sendUpdate({ type: "status", status: "processing-text" });
                  addLog(`LiveWS: Running Voxtral model "${liveModel}" for direct audio-to-text-generation...`, "info");

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
                      addLog(`Engine Voxtral Decode Error: ${convErr?.message || String(convErr)}`, "error");
                    }
                  }

                  let finalOptions = {
                    ...options,
                    modelId: liveModel,
                    systemPrompt: finalInput.systemPrompt,
                    isolatedRAG: finalInput.isolatedRAG,
                    reqId: options?.reqId,
                    isLiveWS: true,
                    prompt: finalInput.text || options?.prompt || "Transcribe and understand this audio. Generate a response."
                  };

                  const textRes = await browserEngine.runInference("text", { audio: audioData }, {
                    ...finalOptions,
                    progress_callback: (p: any) => {
                      if (p.status === "progress") {
                        setLoadingProgress(prev => ({
                          ...prev,
                          [p.file]: { progress: p.progress, status: `Downloading Live Model ${p.file}` }
                        }));
                      }
                    }
                  });

                  assistantText = typeof textRes === "string" ? textRes : (textRes.response || textRes);
                  assistantText = stripThinkTags(assistantText);

                  sendUpdate({ type: "stt-result", text: assistantText });
                  sendUpdate({ type: "text-result", text: assistantText, transcribed: "[Voxtral Direct]" });
                  addLog(`LiveWS AI Text Output (Voxtral): "${assistantText}"`, "success");
                } else if (userInput) {
                  // Direct Text Input for Voxtral
                  sendUpdate({ type: "status", status: "processing-text" });
                  addLog(`LiveWS: Running Text Generation for Voxtral input: "${userInput}"`, "info");

                  let finalOptions = {
                    ...options,
                    modelId: liveModel,
                    systemPrompt: finalInput.systemPrompt,
                    isolatedRAG: finalInput.isolatedRAG,
                    reqId: options?.reqId,
                    isLiveWS: true
                  };

                  const textRes = await browserEngine.runInference("text", userInput, {
                    ...finalOptions,
                    progress_callback: (p: any) => {
                      if (p.status === "progress") {
                        setLoadingProgress(prev => ({
                          ...prev,
                          [p.file]: { progress: p.progress, status: `Downloading Live Model ${p.file}` }
                        }));
                      }
                    }
                  });

                  assistantText = typeof textRes === "string" ? textRes : (textRes.response || textRes);
                  assistantText = stripThinkTags(assistantText);

                  sendUpdate({ type: "text-result", text: assistantText, transcribed: userInput });
                  addLog(`LiveWS AI Text Output (Voxtral Text): "${assistantText}"`, "success");
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
                      addLog(`LiveWS: TTS Chunk failed: ${ttsErr?.message || String(ttsErr)}`, "error");
                    }
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
                  const matches = await memoryStore.search(queryVector, 15, 0.20);

                  const filterBadResponses = (entry: any) => {
                    if (!entry) return false;
                    const tag = entry.metadata?.tag;
                    const tags = entry.metadata?.tags;
                    if (tag === "NEGATIVE/BAD RESPONSE") return false;
                    if (Array.isArray(tags) && tags.includes("NEGATIVE/BAD RESPONSE")) return false;
                    return true;
                  };

                  const filteredMatches = matches.filter(m => {
                    const itemRag = m.metadata?.isolatedRAG;
                    return itemRag !== undefined && String(itemRag) === targetRAGKey;
                  }).filter(filterBadResponses);

                  const allDbEntries = await memoryStore.getAll();
                  const filteredAllDbEntries = allDbEntries.filter(m => {
                    const itemRag = m.metadata?.isolatedRAG;
                    return itemRag !== undefined && String(itemRag) === targetRAGKey;
                  }).filter(filterBadResponses);

                  const { prioritized, debugLogs } = prioritizeAndClassifyMemories(
                    filteredMatches,
                    filteredAllDbEntries,
                    5
                  );

                  debugLogs.forEach(log => console.log(`[RAG PRIORITIZER] ${log}`));

                  if (prioritized.length > 0) {
                    addLog(`🎯 Context retrieved: Found ${prioritized.length} prioritized memories for "${targetRAGKey}"`, "success");
                    const mergedMemories = prioritized.map(m => {
                      const classification = m.metadata?.classification || "";
                      const label = classification ? ` [${classification}]` : "";
                      return `[Memory - ${new Date(m.timestamp).toLocaleDateString()}]${label}: ${m.text}`;
                    }).join("\n");
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

              // Handle OCEAN Personality traits prompt shaping and tags replacement
              const secondTimestamp = getFormattedTimestamp();
              let secondTone = "Direct, clean, concise, helpful, and professional.";
              let secondOceanApplied = false;
              if (options?.ocean && (category === "text" || category === "vision")) {
                const personalityBlock = getToneInstruction(options.ocean);
                if (personalityBlock) {
                  secondTone = personalityBlock;
                  secondOceanApplied = true;
                }
              }

              if (finalOptions.systemPrompt && (finalOptions.systemPrompt.includes("{{tone}}") || finalOptions.systemPrompt.includes("{{timestamp}}"))) {
                finalOptions.systemPrompt = finalOptions.systemPrompt
                  .replace(/\{\{tone\}\}/g, secondTone)
                  .replace(/\{\{timestamp\}\}/g, secondTimestamp);
              } else {
                if (secondOceanApplied) {
                  addLog(`🎭 Applying OCEAN traits mapped tone: ${secondTone.slice(0, 80)}...`, "info");
                  if (finalOptions.systemPrompt) {
                    finalOptions.systemPrompt = `${secondTone}\n\n${finalOptions.systemPrompt}`;
                  } else {
                    finalOptions.systemPrompt = secondTone;
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
            
            let formattedOutputStr = "";
            if (typeof result === "string") {
              if (result.startsWith("data:image/") || result.startsWith("data:audio/") || (result.length > 500 && /^[a-zA-Z0-9+/=]+$/.test(result.replace(/^data:[^;]+;base64,/, "")))) {
                const prefix = result.substring(0, 30);
                formattedOutputStr = `${prefix}... [Truncated Base64 Data, length: ${result.length}]`;
              } else if (result.length > 1000) {
                formattedOutputStr = result.substring(0, 1000) + "... [Truncated, length: " + result.length + "]";
              } else {
                formattedOutputStr = result;
              }
            } else if (result && typeof result === "object") {
              try {
                const cleanObj = JSON.parse(JSON.stringify(result, (key, value) => {
                  if (Array.isArray(value) && value.length > 20) {
                    const firstFew = value.slice(0, 3).map(v => typeof v === "number" ? v.toFixed(6) : String(v));
                    return `[Array of ${value.length} elements: ${firstFew.join(", ")}...]`;
                  }
                  if (typeof value === "string") {
                    if (value.startsWith("data:image/") || value.startsWith("data:audio/") || (value.length > 500 && /^[a-zA-Z0-9+/=]+$/.test(value.replace(/^data:[^;]+;base64,/, "")))) {
                      return `${value.substring(0, 30)}... [Truncated Base64 Data, length: ${value.length}]`;
                    }
                    if (value.length > 1000) {
                      return value.substring(0, 1000) + "... [Truncated, length: " + value.length + "]";
                    }
                  }
                  return value;
                }));
                formattedOutputStr = JSON.stringify(cleanObj);
              } catch (e) {
                formattedOutputStr = "[Complex Object]";
              }
            } else {
              formattedOutputStr = String(result);
            }
            addLog(`📤 [API OUTPUT]: ${formattedOutputStr}`, "success");

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
                  } else if (category === "stt" || category === "wait-voice") {
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
            const errMsg = err?.message || String(err);
            addLog(`❌ Remote Task Failed: ${errMsg}`, "error");
            socket.send(JSON.stringify({ type: "TASK_RESULT", requestId, error: errMsg }));

            // Check for specific fatal engine/WebGPU errors that require model respawning
            const isFatalEngineError = 
              errMsg.includes("Engine Total Failure") ||
              errMsg.includes("OrtRun") ||
              errMsg.includes("A valid external Instance reference no longer exists") ||
              errMsg.includes("Failed to download data from buffer") ||
              errMsg.includes("mapAsync") ||
              errMsg.includes("GPUBuffer");

            if (isFatalEngineError) {
              addLog("🚨 Fatal Engine/WebGPU Failure detected! Respawning engine workers...", "error");
              browserEngine.terminateAllWorkers();
            }

            if (isNormalRequest) {
              setMessages(prev => prev.map(msg => {
                if (msg.id === `remote-assistant-${requestId}`) {
                  return {
                    ...msg,
                    isQueued: false,
                    content: `Error: ${errMsg}`
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

        // 1. Unload Kokoro after 10s if "Kokoro_TTS" is not enabled
        if (ttsUnloadTimeoutRef.current) {
          clearTimeout(ttsUnloadTimeoutRef.current);
        }
        ttsUnloadTimeoutRef.current = setTimeout(() => {
          ttsUnloadTimeoutRef.current = null;
          if (!speakEnabledRef.current) {
            addLog("LiveWS: Unloading Kokoro TTS engine to free memory...", "info");
            tts.unload().catch(err => {
              console.error("Failed to unload Kokoro TTS:", err);
            });
          }
        }, 10000);

        // 2. Unload dedicated STT worker after 10s if Cascade Pipeline was selected
        const liveModel = selectedModelsRef.current["live"] || "cascade-pipeline";
        if (liveModel === "cascade-pipeline") {
          if (sttUnloadTimeoutRef.current) {
            clearTimeout(sttUnloadTimeoutRef.current);
          }
          sttUnloadTimeoutRef.current = setTimeout(() => {
            sttUnloadTimeoutRef.current = null;
            addLog("LiveWS: Unloading dedicated STT worker to free memory...", "info");
            browserEngine.unloadWorker("stt").then(() => {
              browserEngine.isDedicatedSttWorkerEnabled = false;
            }).catch(err => {
              console.error("Failed to unload dedicated STT worker:", err);
            });
          }, 10000);
        }
      };

      socket.onerror = (err) => {
        console.error("WebSocket Error:", err);
        socket.close();
      };
    };

    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.onopen = null;
        socketRef.current.onclose = null;
        socketRef.current.onerror = null;
        socketRef.current.onmessage = null;
        socketRef.current.close();
        socketRef.current = null;
      }
      clearTimeout(reconnectTimeout);
      if (ttsUnloadTimeoutRef.current) {
        clearTimeout(ttsUnloadTimeoutRef.current);
      }
      if (sttUnloadTimeoutRef.current) {
        clearTimeout(sttUnloadTimeoutRef.current);
      }
    };
  }, [enableRelayMode]);

  const sendInference = useCallback((payload: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.send(JSON.stringify({ type: "GENERATE", ...payload }));
    }
  }, [isConnected]);

  return { isConnected, sendInference, activeAuthRequest, respondToAuth };
}
