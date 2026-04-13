/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { MODELS } from "./modelList";
import { memoryStore } from "./lib/memory";
import { tts } from "./lib/tts";
import { float32ArrayToWav } from "./lib/audioUtils";

// Hooks
import { useSystemStats } from "./App/hooks/useSystemStats";
import { useSettings } from "./App/hooks/useSettings";
import { useModelManagement } from "./App/hooks/useModelManagement";
import { useChatLogic } from "./App/hooks/useChatLogic";
import { useAppHandlers } from "./App/hooks/useAppHandlers";
import { useSpeechManagement } from "./App/hooks/useSpeechManagement";
import { useSpeechToText } from "./App/hooks/useSpeechToText";
import { useLiveMode } from "./App/hooks/useLiveMode";

// Context
import { AppProvider } from "./App/context/AppContext";

// Components
import { Header } from "./App/components/Header";
import { Sidebar } from "./App/components/Sidebar";
import { ChatArea } from "./App/components/ChatArea";
import { PreviewSidebar } from "./App/components/PreviewSidebar";
import { ErrorOverlay } from "./App/components/ErrorOverlay";

// Types
import { LogEntry, SandboxFile } from "./App/types";

import { TEXT_SYSTEM_PROMPT, CODER_SYSTEM_PROMPT, DIRECTOR_SYSTEM_PROMPT, getModePrompt } from "./promptLibrary/systemPrompts";

// Suppress specific ONNX Runtime warnings in the main thread
const originalLog = console.log;
const originalInfo = console.info;
const originalWarn = console.warn;
const originalError = console.error;

const isIgnoredWarning = (...args: any[]) => {
  const msg = args.map(arg => String(arg)).join(' ');
  return msg.includes('VerifyEachNodeIsAssignedToAnEp') || 
         msg.includes('preferred execution providers') ||
         msg.includes('Rerunning with verbose output') ||
         msg.includes('shape related ops to CPU');
};

console.log = (...args) => {
  if (isIgnoredWarning(...args)) return;
  originalLog(...args);
};

console.info = (...args) => {
  if (isIgnoredWarning(...args)) return;
  originalInfo(...args);
};

console.warn = (...args) => {
  if (isIgnoredWarning(...args)) return;
  originalWarn(...args);
};

console.error = (...args) => {
  if (isIgnoredWarning(...args)) return;
  originalError(...args);
};

export default function App() {
  // --- Settings & Persistence ---
  const {
    ramLimitPercent,
    setRamLimitPercent,
    enableRAG,
    setEnableRAG,
    speakEnabled,
    setSpeakEnabled,
    chatMode,
    setChatMode,
    liveModeTimer,
    setLiveModeTimer
  } = useSettings();

  // --- State ---
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [didError, setDidError] = useState(false);
  const [hasWebGPU, setHasWebGPU] = useState<boolean | null>(null);
  const [showLogs, setShowLogs] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  // Sandbox State
  const [sandboxFiles, setSandboxFiles] = useState<SandboxFile[]>([]);
  const [activeTab, setActiveTab] = useState<"chat" | "sandbox" | "gallery">("chat");
  const [isCoderMode, setIsCoderMode] = useState(false);
  const [previousTextModel, setPreviousTextModel] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(true);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      // If we are within 100px of the bottom, we consider it "at the bottom"
      shouldScrollRef.current = scrollHeight - scrollTop - clientHeight < 100;
    }
  }, []);
  
  // TTS Chunking Refs
  const spokenTextLengthRef = useRef(0);
  const speechQueueRef = useRef<string[]>([]);
  const isSpeakingRef = useRef(false);

  // Refs for stale closure protection in worker listener
  const isSummarizingRef = useRef(false);
  const speakEnabledRef = useRef(false);
  const isQueueBusyRef = useRef(false);
  const isHiddenRef = useRef(false);
  const isRoutingRef = useRef(false);
  const isLiveModeRef = useRef(false);
  const lastRouterPromptRef = useRef<string>("");
  const sandboxFilesRef = useRef<SandboxFile[]>([]);
  useEffect(() => { sandboxFilesRef.current = sandboxFiles; }, [sandboxFiles]);

  // --- Helpers ---
  const addLog = useCallback((message: string, type: "info" | "error" | "success" = "info") => {
    setLogs((prev) => [
      ...prev,
      { timestamp: new Date().toLocaleTimeString(), message, type },
    ].slice(-50));
  }, []);

  // --- Hooks ---
  const { 
    systemRam, 
    isRamDetected, 
    isElectron,
    heapUsage, 
    memoryUsage, 
    setMemoryUsage 
  } = useSystemStats(addLog);

  const {
    selectedModels,
    setSelectedModels,
    activeCategory,
    isModelLoading,
    setIsModelLoading,
    isModelReady,
    setIsModelReady,
    loadingProgress,
    setLoadingProgress,
    loadedModelId,
    setLoadedModelId,
    worker,
    loadModel,
    isCategoryDisabled
  } = useModelManagement(systemRam, isRamDetected, addLog, setError, setDidError);

  const {
    messages,
    setMessages,
    input,
    setInput,
    isGenerating,
    setIsGenerating,
    textModelQueue,
    setTextModelQueue,
    textModelQueueRef,
    directorModelQueue,
    setDirectorModelQueue,
    directorModelQueueRef,
    visionModelQueue,
    setVisionModelQueue,
    visionModelQueueRef,
    imageModelQueue,
    setImageModelQueue,
    imageModelQueueRef,
    musicModelQueue,
    setMusicModelQueue,
    musicModelQueueRef,
    longTermMemories,
    isProcessingRef,
    isSummarizing,
    setIsSummarizing,
    pendingImage,
    setPendingImage,
    summarizeChat,
    handleSendInternal,
    handleSend
  } = useChatLogic(
    worker, 
    chatMode, 
    enableRAG, 
    loadedModelId, 
    selectedModels, 
    loadModel, 
    addLog, 
    ramLimitPercent, 
    setMemoryUsage,
    activeCategory,
    () => {
      tts.stop();
      speechQueueRef.current = [];
      spokenTextLengthRef.current = 0;
      isSpeakingRef.current = false;
    },
    isCoderMode,
    isHiddenRef,
    isLiveModeRef,
    isRoutingRef
  );

  // Coder Mode Switching Logic
  useEffect(() => {
    if (activeTab === "sandbox") {
      if (!isCoderMode) {
        setIsCoderMode(true);
        setPreviousTextModel(selectedModels.text);
        const coderModelId = selectedModels.coder || "qwen-2.5-coder-3b-q4";
        const coderModel = MODELS.find(m => m.id === coderModelId);
        if (coderModel) {
          addLog(`Entering Coder Mode. Loading specialized coder model: ${coderModel.name}...`, "info");
          loadModel("coder", coderModel.id);
        }
      }
    } else if (activeTab === "chat") {
      if (isCoderMode) {
        setIsCoderMode(false);
        if (previousTextModel) {
          addLog("Exiting Coder Mode. Restoring previous text model...", "info");
          setSelectedModels(prev => ({ ...prev, text: previousTextModel }));
          setPreviousTextModel(null);
        }
      }
    }
  }, [activeTab, isCoderMode, previousTextModel, selectedModels.text, setSelectedModels, addLog]);

  const { analyzeImage, handleImageResult } = useAppHandlers(
    addLog,
    setMessages,
    setVisionModelQueue,
    worker,
    setGeneratedImage,
    setActiveTab,
    setPendingImage
  );

  const { processSpeechQueue, handleAssistantUpdate } = useSpeechManagement(
    speakEnabledRef,
    spokenTextLengthRef,
    speechQueueRef,
    isSpeakingRef,
    setMessages,
    isHiddenRef
  );

  const { isRecording, toggleRecording, startRecording, stopRecording, flushRecording } = useSpeechToText(
    worker, 
    addLog, 
    setInput,
    async () => {
      const whisperModel = MODELS.find(m => m.id === "whisper-tiny-en");
      const modelKey = `${whisperModel?.modelID}@${whisperModel?.path || 'main'}`;
      
      if (activeCategory === "stt" && isModelReady && loadedModelId === modelKey) return true;
      
      addLog("Loading transcription engine (Whisper)...");
      loadModel("stt", "whisper-tiny-en");
      return false;
    }
  );

  const { isLiveMode, toggleLiveMode, lastScreenshotRef } = useLiveMode(
    addLog,
    flushRecording,
    isRecording,
    startRecording,
    stopRecording,
    isAnalyzing,
    isGenerating,
    visionModelQueue.length,
    (screenshot, isSilent, audioData) => {
      if (!screenshot && isSilent) return;

      const messageId = crypto.randomUUID();
      
      // 1. Post hidden message to chat (to keep context but not clutter UI)
      setMessages(prev => [...prev, { 
        id: messageId,
        role: "user", 
        content: isSilent ? "Analyzing screen..." : "Listening...", 
        image: screenshot || undefined,
        hidden: true 
      }]);

      // 2. Handle analysis
      if (isSilent) {
        if (screenshot && !isAnalyzingRef.current) {
          const livePrompt = "The users screen shows:";
          setVisionModelQueue(prev => [...prev, { image: screenshot, prompt: livePrompt }]);
        }
      } else if (audioData && worker.current) {
        worker.current.postMessage({
          type: "transcribe",
          data: { 
            audio: audioData, 
            isLive: true, 
            messageId, 
            screenshot // Pass screenshot along to associate with transcription result
          }
        });
      }
    },
    liveModeTimer * 1000
  );

  useEffect(() => {
    isLiveModeRef.current = isLiveMode;
  }, [isLiveMode]);

  const handleEmbedResult = async (embedding: number[], text: string, metadata?: any) => {
    if (metadata?.type === "archive") {
      await memoryStore.add({
        id: crypto.randomUUID(),
        text: text.trim(),
        embedding,
        timestamp: metadata.timestamp || Date.now(),
        metadata: { source: "auto-summary-archive" }
      });
      return;
    }

    addLog("Searching long-term memory...");
    const relevant = await memoryStore.search(embedding, 5, 0.6); // Top 5, slightly lower threshold for more context
    
    let systemPrompt = isCoderMode 
      ? CODER_SYSTEM_PROMPT 
      : `${TEXT_SYSTEM_PROMPT}
    
    CURRENT MODE: ${chatMode.toUpperCase()}
    ${getModePrompt(chatMode)}`;

    if (relevant.length > 0) {
      addLog(`Found ${relevant.length} relevant memories.`, "success");
      const context = relevant.map((m, i) => `[Reference ${i+1} - ${new Date(m.timestamp).toLocaleDateString()}]: ${m.text}`).join("\n---\n");
      systemPrompt += `\n\n### LONG-TERM MEMORY REFERENCES (Optional)
The following are relevant snippets from past conversations. You may use them as context if they help answer the user's current request, or ignore them if they are irrelevant:

${context}

---`;
    } else {
      addLog("No relevant long-term memories found for this context.");
    }

    // Queue for text model and switch back
    addLog(`Queuing prompt for text model: ${text.substring(0, 30)}...`);
    setTextModelQueue(prev => [...prev, { text, systemPrompt }]);
    
    const targetCategory = isCoderMode ? "coder" : "text";
    const currentTextModelId = selectedModels[targetCategory];
    const textModel = MODELS.find(m => m.id === currentTextModelId);
    
    if (textModel) {
      addLog(`Switching back to ${textModel.name} (${textModel.id}) in ${targetCategory} category...`);
      loadModel(targetCategory, textModel.id);
    } else {
      addLog(`Warning: Could not find model info for ${currentTextModelId}. Attempting to load anyway...`, "error");
      loadModel(targetCategory, currentTextModelId);
    }
  };

  // Update refs that are used in the worker listener
  const isModelReadyRef = useRef(isModelReady);
  const activeCategoryRef = useRef(activeCategory);
  const loadedModelIdRef = useRef(loadedModelId);
  const isAnalyzingRef = useRef(isAnalyzing);
  const isGeneratingRef = useRef(isGenerating);
  const didErrorRef = useRef(didError);
  const loadModelRef = useRef(loadModel);
  const handleAssistantCompleteRef = useRef<any>(null);
  const handleAssistantUpdateRef = useRef<any>(null);
  const handleEmbedResultRef = useRef<any>(null);

  useEffect(() => { isModelReadyRef.current = isModelReady; }, [isModelReady]);
  useEffect(() => { activeCategoryRef.current = activeCategory; }, [activeCategory]);
  useEffect(() => { loadedModelIdRef.current = loadedModelId; }, [loadedModelId]);
  useEffect(() => { isAnalyzingRef.current = isAnalyzing; }, [isAnalyzing]);
  useEffect(() => { isGeneratingRef.current = isGenerating; }, [isGenerating]);
  useEffect(() => { speakEnabledRef.current = speakEnabled; }, [speakEnabled]);
  useEffect(() => { isSummarizingRef.current = isSummarizing; }, [isSummarizing]);
  useEffect(() => { didErrorRef.current = didError; }, [didError]);
  useEffect(() => { loadModelRef.current = loadModel; }, [loadModel]);
  useEffect(() => { handleEmbedResultRef.current = handleEmbedResult; }, [handleEmbedResult]);
  useEffect(() => { isLiveModeRef.current = isLiveMode; }, [isLiveMode]);

  // --- Effects ---
  useEffect(() => {
    // Initialize Vector Store
    memoryStore.init().then(() => {
      addLog("Vector Store initialized", "success");
    });

    // Check WebGPU support
    if ("gpu" in navigator) {
      (navigator as any).gpu.requestAdapter().then((adapter: any) => {
        setHasWebGPU(!!adapter);
        if (adapter) {
          addLog("WebGPU detected and available", "success");
        } else {
          addLog("WebGPU not available, falling back to WASM", "info");
        }
      });
    } else {
      setHasWebGPU(false);
      addLog("WebGPU not supported", "error");
    }

    // Initialize worker
    worker.current = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });

    worker.current.onmessage = (event) => {
      const { type, data } = event.data;

      switch (type) {
        case "status":
          addLog(data.message);
          break;
        case "progress":
          setLoadingProgress((prev) => {
            const progressValue = isNaN(data.progress) ? 0 : data.progress;
            return {
              ...prev,
              [data.file]: { 
                progress: data.status === "done" ? 100 : progressValue, 
                status: data.status 
              },
            };
          });
          break;
        case "embed-result":
          handleEmbedResultRef.current?.(data.embedding, data.text, data.metadata);
          break;
        case "ready":
          setIsModelLoading(false);
          setIsModelReady(true);
          setLoadedModelId(data.model);
          addLog(`${(data.category || "model").toUpperCase()} model ready!`, "success");
          setLoadingProgress({});

          if (activeCategoryRef.current === "vision" && data.category === "vision") {
            // Processing handled by queue effect
          }
          break;
        case "vision-result":
          setIsAnalyzing(false);
          if (!didErrorRef.current) {
            addLog("Vision analysis complete. Queuing for text model...", "success");
            addLog(`Vision Output: ${data.output}`, "info");
            const originalPrompt = data.prompt || "Describe this image in detail.";
            // Queue the vision output for the text model
            setTextModelQueue(prev => [...prev, { 
              text: `User uploaded an image. Here is the visual analysis of the image:\n\n\`\`\`image\n${data.output}\n\`\`\`\n\nUser's original prompt: ${originalPrompt}`,
              role: "user",
              hidden: true
            }]);
          }
          break;
        case "tts-result":
          setIsGenerating(false);
          playAudio(data.audio, data.sampling_rate);
          addLog("Speech generated and playing", "success");
          break;
        case "music-result":
          setIsGenerating(false);
          playAudio(data.audio, data.sampling_rate);
          addLog("Music generated and playing", "success");
          
          // Add audio message to chat
          const wavBlob = float32ArrayToWav(data.audio, data.sampling_rate);
          const audioUrl = URL.createObjectURL(wavBlob);
          setMessages(prev => [...prev, { 
            role: "assistant", 
            content: "Here is your generated music:",
            audio: audioUrl 
          }]);
          
          // Switch back to director model if no more music is queued
          if (musicModelQueueRef.current.length === 0 && !isLiveModeRef.current) {
            addLog("Switching back to director model...");
            loadModelRef.current('director');
          }
          break;
        case "image-result":
          setIsGenerating(false);
          handleImageResult(data.image);
          addLog("Image generated", "success");
          if (!isCoderMode && imageModelQueueRef.current.length === 0 && !isLiveModeRef.current) {
            addLog("Switching back to director model...");
            loadModelRef.current('director');
          }
          break;
        case "transcribe-result":
          if (data.isLive) {
            const { text, messageId, screenshot } = data;
            const speechText = text?.trim();
            
            // Update the existing message with the transcription
            if (messageId) {
              setMessages(prev => prev.map(m => 
                m.id === messageId 
                  ? { ...m, content: speechText || "Analyzing screen..." } 
                  : m
              ));
            }

            // Queue for vision analysis now that we have the speech context
            if (screenshot && !isAnalyzingRef.current) {
              const livePrompt = speechText 
                ? `${speechText}. \`\`\`vision [vision description]\`\`\`` 
                : "The users screen shows:";
              setVisionModelQueue(prev => [...prev, { image: screenshot, prompt: livePrompt }]);
            }
          } else {
            setInput(prev => (prev ? prev + " " + data.text : data.text));
            addLog("Transcription complete", "success");
          }
          break;
        case "update":
          handleAssistantUpdateRef.current?.(data.output, data.stats);
          break;
        case "complete":
          handleAssistantCompleteRef.current?.(data.output);
          break;
        case "error":
          setIsModelLoading(false);
          setIsGenerating(false);
          setIsAnalyzing(false);
          isProcessingRef.current = false;
          isRoutingRef.current = false;
          setError(data.message);
          setDidError(true);
          addLog(data.message, "error");
          break;
      }
    };

    return () => {
      worker.current?.terminate();
    };
  }, [addLog]);

  // Handle TTS loading/unloading based on speakEnabled
  useEffect(() => {
    if (speakEnabled) {
      addLog("Initializing Kokoro TTS...");
      tts.init().then(() => {
        addLog("Kokoro TTS Engine ready", "success");
        // Resume context on init
        tts.resume();
      }).catch(err => {
        addLog("Failed to load Kokoro TTS: " + err.message, "error");
      });
    } else {
      if (tts.isInitialized()) {
        tts.unload().then(() => {
          addLog("Kokoro TTS Engine unloaded");
        });
      }
    }
  }, [speakEnabled, addLog]);

  // Initial load effect
  useEffect(() => {
    if (selectedModels.director && !isModelReady && !isModelLoading && isRamDetected && !didError) { 
      loadModel("director", selectedModels.director);
    }
  }, [selectedModels.director, isModelReady, isModelLoading, isRamDetected, loadModel, didError]);

  // Process director queue
  useEffect(() => {
    if (activeCategory === 'director' && isModelReady && directorModelQueue.length > 0 && !isGenerating && !isQueueBusyRef.current) {
      isQueueBusyRef.current = true;
      const next = directorModelQueue[0];
      setDirectorModelQueue(prev => prev.slice(1));
      
      lastRouterPromptRef.current = next.text;
      isRoutingRef.current = true;
      // Use handleSendInternal but with router settings
      handleSendInternal(next.text, DIRECTOR_SYSTEM_PROMPT, "user", true);
      
      setTimeout(() => { isQueueBusyRef.current = false; }, 100);
    }
  }, [activeCategory, isModelReady, directorModelQueue, isGenerating, setDirectorModelQueue, handleSendInternal]);

  // Process vision queue
  useEffect(() => {
    if (activeCategory === 'vision' && isModelReady && visionModelQueue.length > 0 && !isAnalyzing && !isQueueBusyRef.current) {
      isQueueBusyRef.current = true;
      const next = visionModelQueue[0];
      setVisionModelQueue(prev => prev.slice(1));
      setIsAnalyzing(true);
      worker.current?.postMessage({
        type: "vision-analyze",
        data: { image: next.image, prompt: next.prompt }
      });
      setTimeout(() => { isQueueBusyRef.current = false; }, 100);
    }
  }, [activeCategory, isModelReady, visionModelQueue, isAnalyzing, setVisionModelQueue, worker]);

  // Process image queue
  useEffect(() => {
    if (activeCategory === 'image-gen' && isModelReady && imageModelQueue.length > 0 && !isGenerating && !isQueueBusyRef.current) {
      isQueueBusyRef.current = true;
      const next = imageModelQueue[0];
      setImageModelQueue(prev => prev.slice(1));
      setIsGenerating(true);
      worker.current?.postMessage({
        type: "image-generate",
        data: { prompt: next.prompt }
      });
      setTimeout(() => { isQueueBusyRef.current = false; }, 100);
    }
  }, [activeCategory, isModelReady, imageModelQueue, isGenerating, setImageModelQueue, worker]);

  // Process music queue
  useEffect(() => {
    if (activeCategory === 'music-gen' && isModelReady && musicModelQueue.length > 0 && !isGenerating && !isQueueBusyRef.current) {
      isQueueBusyRef.current = true;
      const next = musicModelQueue[0];
      setMusicModelQueue(prev => prev.slice(1));
      setIsGenerating(true);
      worker.current?.postMessage({
        type: "music-generate",
        data: { prompt: next.prompt }
      });
      addLog("Generating music...", "info");
      setTimeout(() => { isQueueBusyRef.current = false; }, 100);
    }
  }, [activeCategory, isModelReady, musicModelQueue, isGenerating, setMusicModelQueue, worker, addLog]);

  // Model switching logic based on queues
  useEffect(() => {
    if (isModelLoading) return;
    
    const textCategories = ["text", "director", "coder"];
    const isTextActive = textCategories.includes(activeCategory);
    const defaultTextCategory = isCoderMode ? "coder" : "text";

    // Priority: Director -> Text -> Vision -> Image -> Music
    if (!isGenerating && textModelQueue.length === 0 && directorModelQueue.length === 0) {
      if (visionModelQueue.length > 0 && activeCategory !== 'vision') {
        loadModel('vision');
      } else if (isTextActive && imageModelQueue.length > 0) {
        loadModel('image-gen');
      } else if (isTextActive && musicModelQueue.length > 0) {
        loadModel('music-gen');
      }
    } else if (activeCategory === 'vision' && !isAnalyzing && visionModelQueue.length === 0) {
      if (directorModelQueue.length > 0) {
        loadModel('director');
      } else if (textModelQueue.length > 0) {
        loadModel(defaultTextCategory);
      } else if (imageModelQueue.length > 0) {
        loadModel('image-gen');
      } else if (musicModelQueue.length > 0) {
        loadModel('music-gen');
      }
    } else if (activeCategory === 'image-gen' && !isGenerating && imageModelQueue.length === 0) {
      if (directorModelQueue.length > 0) {
        loadModel('director');
      } else if (textModelQueue.length > 0) {
        loadModel(defaultTextCategory);
      } else if (visionModelQueue.length > 0) {
        loadModel('vision');
      } else if (musicModelQueue.length > 0) {
        loadModel('music-gen');
      }
    } else if (activeCategory === 'music-gen' && !isGenerating && musicModelQueue.length === 0) {
      if (directorModelQueue.length > 0) {
        loadModel('director');
      } else if (textModelQueue.length > 0) {
        loadModel(defaultTextCategory);
      } else if (visionModelQueue.length > 0) {
        loadModel('vision');
      } else if (imageModelQueue.length > 0) {
        loadModel('image-gen');
      }
    }
  }, [activeCategory, isGenerating, isAnalyzing, isModelLoading, textModelQueue.length, directorModelQueue.length, visionModelQueue.length, imageModelQueue.length, musicModelQueue.length, loadModel, isCoderMode]);

  useEffect(() => {
    if (scrollRef.current) {
      const lastMessage = messages[messages.length - 1];
      const isUserMessage = lastMessage?.role === "user";
      
      if (shouldScrollRef.current || isUserMessage) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
  }, [messages]);

  useEffect(() => {
    if (logEndRef.current) logEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // --- Handlers ---
  const playAudio = (audio: Float32Array, sampling_rate: number) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = audioContext.createBuffer(1, audio.length, sampling_rate);
    audioBuffer.getChannelData(0).set(audio);
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
  };

  const handleMusicGen = (prompt: string) => {
    setMusicModelQueue(prev => [...prev, { prompt }]);
    loadModel("music-gen");
  };

  const handleOptionSelect = (option: string) => {
    // Clear options from the message so they don't stay clickable
    setMessages(prev => {
      const last = prev[prev.length - 1];
      if (last && last.role === "assistant") {
        return [...prev.slice(0, -1), { ...last, options: [] }];
      }
      return prev;
    });
    
    // Add user message and trigger generation
    setMessages(prev => [...prev, { role: "user", content: option, isQueued: true }]);
    handleSendInternal(option);
  };

  const handleToolCall = useCallback(async (toolCall: any) => {
    const { tool, params } = toolCall;
    addLog(`Tool Call Detected: ${tool}`, "info");

    switch (tool) {
      case "image_gen":
        if (isCategoryDisabled("image-gen")) {
          addLog("Image Generation disabled due to RAM limits", "error");
          return;
        }
        addLog(`Adding image request to queue: ${params.prompt}...`);
        setImageModelQueue(prev => [...prev, { prompt: params.prompt }]);
        loadModel("image-gen");
        break;

      case "music_gen":
        if (isCategoryDisabled("music-gen")) {
          addLog("Music Generation disabled due to RAM limits", "error");
          return;
        }
        addLog(`Adding music request to queue: ${params.prompt}...`);
        setMusicModelQueue(prev => [...prev, { prompt: params.prompt }]);
        loadModel("music-gen");
        break;

      case "sandbox":
        if (params.files && Array.isArray(params.files)) {
          setSandboxFiles(params.files);
        } else {
          setSandboxFiles([{
            name: "index." + (params.language === "html" ? "html" : "ts"),
            content: params.code,
            language: params.language || "typescript"
          }]);
        }
        setActiveTab("sandbox");
        addLog("Code sent to sandbox", "success");
        break;

      case "tts":
        if (isCategoryDisabled("tts")) return;
        if (!speakEnabled) {
          addLog("TTS tool call ignored: 'Speak Responses' is disabled", "info");
          return;
        }
        setIsGenerating(true);
        addLog(`Speaking: ${params.text.substring(0, 30)}...`);
        tts.speak(params.text).finally(() => {
          setIsGenerating(false);
        });
        break;

      case "prompt_user":
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last && last.role === "assistant") {
            return [...prev.slice(0, -1), { ...last, options: params.options }];
          }
          return prev;
        });
        addLog(`Prompting user with options: ${params.options.join(", ")}`, "info");
        break;

      case "self":
        addLog(`Self-Prompt triggered`, "info");
        // We use a small delay to allow the current message to finish rendering
        setTimeout(() => {
          setTextModelQueue(prev => [...prev, { 
            text: params.message || params.prompt, 
            role: "user",
            hidden: false // We show self-prompts in chat for transparency
          }]);
        }, 500);
        break;

      case "write_file":
        setSandboxFiles(prev => {
          const existing = prev.findIndex(f => f.name === params.name);
          if (existing !== -1) {
            const updated = [...prev];
            updated[existing] = { ...updated[existing], content: params.content, language: params.language || updated[existing].language };
            return updated;
          }
          return [...prev, { name: params.name, content: params.content, language: params.language || "typescript" }];
        });
        addLog(`File updated: ${params.name}`, "success");
        break;

      case "chat_user":
        setMessages(prev => [...prev, { role: "assistant", content: params.message }]);
        addLog("Coder Model sent a message", "info");
        break;

      case "list_files":
        const fileList = sandboxFilesRef.current.map(f => f.name).join(", ");
        addLog(`Listing files: ${fileList}`, "info");
        setTextModelQueue(prev => [...prev, { 
          text: `Current files in sandbox: ${fileList || "None"}`, 
          role: "system",
          hidden: true 
        }]);
        break;

      case "read_file":
        const fileToRead = sandboxFilesRef.current.find(f => f.name === params.name);
        if (fileToRead) {
          addLog(`Reading file: ${params.name}`, "info");
          // Naive stripping of function bodies to save tokens as requested
          const strippedContent = fileToRead.content
            .replace(/(function\s+\w+\s*\(.*?\)\s*)\{([\s\S]*?)\}/g, "$1{ /* body removed */ }")
            .replace(/(const\s+\w+\s*=\s*\(.*?\)\s*=>\s*)\{([\s\S]*?)\}/g, "$1{ /* body removed */ }");
            
          setTextModelQueue(prev => [...prev, { 
            text: `Content of ${params.name} (Function context removed):\n\n${strippedContent}`, 
            role: "system",
            hidden: true 
          }]);
        } else {
          addLog(`File not found: ${params.name}`, "error");
          setTextModelQueue(prev => [...prev, { 
            text: `Error: File ${params.name} not found.`, 
            role: "system",
            hidden: true 
          }]);
        }
        break;

      case "read_function":
        const fileWithFunc = sandboxFilesRef.current.find(f => f.name === params.name);
        if (fileWithFunc) {
          addLog(`Reading function ${params.function} in ${params.name}`, "info");
          // Try to find the function body
          const functionRegex = new RegExp(`(function\\s+${params.function}\\s*\\([\\s\\S]*?\\)\\s*\\{[\\s\\S]*?\\})|(const\\s+${params.function}\\s*=\\s*\\([\\s\\S]*?\\)\\s*=>\\s*\\{[\\s\\S]*?\\})`, 'g');
          const match = fileWithFunc.content.match(functionRegex);
          if (match) {
            setTextModelQueue(prev => [...prev, { 
              text: `Function ${params.function} in ${params.name}:\n\n${match[0]}`, 
              role: "system",
              hidden: true 
            }]);
          } else {
            setTextModelQueue(prev => [...prev, { 
              text: `Error: Function ${params.function} not found in ${params.name}.`, 
              role: "system",
              hidden: true 
            }]);
          }
        } else {
          setTextModelQueue(prev => [...prev, { 
            text: `Error: File ${params.name} not found.`, 
            role: "system",
            hidden: true 
          }]);
        }
        break;

      case "write_function":
        setSandboxFiles(prev => {
          const fileIndex = prev.findIndex(f => f.name === params.name);
          const newFuncContent = `function ${params.function}(${params.params || ""}) {\n${params.content}\n}`;
          
          if (fileIndex !== -1) {
            const updated = [...prev];
            const file = updated[fileIndex];
            const functionRegex = new RegExp(`(function\\s+${params.function}\\s*\\([\\s\\S]*?\\)\\s*\\{[\\s\\S]*?\\})|(const\\s+${params.function}\\s*=\\s*\\([\\s\\S]*?\\)\\s*=>\\s*\\{[\\s\\S]*?\\})`, 'g');
            
            if (file.content.match(functionRegex)) {
              updated[fileIndex] = { ...file, content: file.content.replace(functionRegex, newFuncContent) };
            } else {
              updated[fileIndex] = { ...file, content: file.content + "\n\n" + newFuncContent };
            }
            return updated;
          } else {
            return [...prev, { name: params.name, content: newFuncContent, language: "typescript" }];
          }
        });
        addLog(`Function ${params.function} updated in ${params.name}`, "success");
        break;

      case "route_to_text":
        addLog(`Routing to text model: ${params.prompt.substring(0, 30)}...`, "info");
        const embedModel = MODELS.find(m => m.id === "nomic-embed-text-v1.5");
        if (enableRAG && embedModel && worker.current) {
          const isEmbedLoaded = loadedModelId === `${embedModel.modelID}@main`;
          if (!isEmbedLoaded) {
            addLog("Loading memory engine (temporary)...");
            loadModel("text", embedModel.id);
            const onReady = (event: MessageEvent) => {
              const { type, data } = event.data;
              if (type === "ready" && data.model === `${embedModel.modelID}@main`) {
                worker.current?.removeEventListener("message", onReady);
                addLog("Memory engine ready. Embedding query...");
                worker.current?.postMessage({ type: "embed", data: { text: params.prompt } });
              }
            };
            worker.current.addEventListener("message", onReady);
          } else {
            addLog("Embedding query for long-term memory...");
            worker.current.postMessage({ type: "embed", data: { text: params.prompt } });
          }
        } else {
          const targetCategory = isCoderMode ? "coder" : "text";
          loadModel(targetCategory);
          setTextModelQueue(prev => [...prev, { text: params.prompt }]);
        }
        break;
    }
  }, [addLog, isCategoryDisabled, setImageModelQueue, setMusicModelQueue, setSandboxFiles, setActiveTab, speakEnabled, setIsGenerating, setMessages, setTextModelQueue, enableRAG, worker, loadedModelId, loadModel, isCoderMode]);

  const handleAssistantComplete = useCallback((output: string) => {
    setIsGenerating(false);
    isProcessingRef.current = false;

    // 1. Handle Summarization first
    if (isSummarizingRef.current) {
      if (output && output.length > 20) {
        setMessages(prev => {
          const queued = prev.filter(m => m.isQueued);
          return [
            { role: "system", content: `Summary of previous conversation: ${output}` },
            ...queued
          ];
        });
        addLog("Context pruned and replaced with summary.", "success");
      } else {
        addLog("Summarization failed or produced empty output. Context not pruned.", "error");
      }
      setIsSummarizing(false);
      return;
    }

    // 2. Handle Hidden Tool Calls (Router)
    if (isHiddenRef.current && isRoutingRef.current) {
      isRoutingRef.current = false;
      const trimmedOutput = output.trim().toLowerCase();
      
      // Handle the new simplified "Director" output
      if (trimmedOutput.includes("music_gen")) {
        handleToolCall({ tool: "music_gen", params: { prompt: lastRouterPromptRef.current } });
        return;
      }
      if (trimmedOutput.includes("image_gen")) {
        handleToolCall({ tool: "image_gen", params: { prompt: lastRouterPromptRef.current } });
        return;
      }
      if (trimmedOutput.includes("sandbox")) {
        setActiveTab("sandbox");
        setTextModelQueue(prev => [...prev, { text: lastRouterPromptRef.current }]);
        return;
      }
      if (trimmedOutput.includes("route_to_text")) {
        handleToolCall({ tool: "route_to_text", params: { prompt: lastRouterPromptRef.current } });
        return;
      }

      const jsonBlocks = output.match(/\{[\s\S]*?\}/g);
      if (jsonBlocks) {
        for (let i = jsonBlocks.length - 1; i >= 0; i--) {
          try {
            const toolCall = JSON.parse(jsonBlocks[i]);
            if (toolCall && toolCall.tool) {
              handleToolCall(toolCall);
              return;
            }
          } catch (e) {}
        }
      }
      
      // Fallback: if it was a hidden routing call but no JSON or keyword found, 
      // it likely failed to route. Force route to text.
      addLog("Router failed to produce valid tool call. Output: " + output.substring(0, 50) + "...", "error");
      handleToolCall({ tool: "route_to_text", params: { prompt: lastRouterPromptRef.current || "Hello" } });
      return;
    }
    
    // 3. Handle Normal Assistant Messages
    const jsonBlocks = output.match(/\{[\s\S]*?\}/g);
    let toolExecuted = false;
    let cleanOutput = output;

    if (jsonBlocks) {
      // Try from the end of the message first (most likely location)
      for (let i = jsonBlocks.length - 1; i >= 0; i--) {
        const block = jsonBlocks[i];
        try {
          const toolCall = JSON.parse(block);
          if (toolCall && toolCall.tool) {
            handleToolCall(toolCall);
            toolExecuted = true;
            // Remove the tool call from the visible output if it's a system tool
            if (["self", "write_file", "sandbox"].includes(toolCall.tool)) {
              cleanOutput = cleanOutput.replace(block, "").trim();
            }
            break; 
          }
        } catch (e) {
          // Try to repair common AI mistakes
          try {
            const repaired = block.replace(/`([\s\S]*?)`/g, (match, p1) => {
              return `"${p1.replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r')}"`;
            });
            const toolCall = JSON.parse(repaired);
            if (toolCall && toolCall.tool) {
              handleToolCall(toolCall);
              toolExecuted = true;
              if (["self", "write_file", "sandbox"].includes(toolCall.tool)) {
                cleanOutput = cleanOutput.replace(block, "").trim();
              }
              break;
            }
          } catch (innerE) {}
        }
      }
    }

    if (cleanOutput || !toolExecuted) {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.role === "assistant") {
          return [...prev.slice(0, -1), { ...last, content: cleanOutput || (toolExecuted ? "Executing tool..." : output) }];
        }
        return [...prev, { role: "assistant", content: cleanOutput || (toolExecuted ? "Executing tool..." : output) }];
      });
    }

    // Speak remaining text
    if (speakEnabledRef.current && cleanOutput) {
      const remainingText = cleanOutput.slice(spokenTextLengthRef.current).trim();
      if (remainingText && !remainingText.startsWith('{') && !remainingText.includes('"tool":')) {
        speechQueueRef.current.push(remainingText);
        processSpeechQueue();
      }
      spokenTextLengthRef.current = 0;
    }

    // Check if summarization is needed
    summarizeChat();

    // If coder mode and no tool was executed, treat as file update
    if (isCoderMode && !toolExecuted && output.trim()) {
      addLog("Coder output detected as raw code. Updating index.ts...", "info");
      handleToolCall({
        tool: "write_file",
        params: {
          name: "index.ts",
          content: output,
          language: "typescript"
        }
      });
    }

    // Switch back to director model if not in coder mode and no more text prompts are queued
    if (!isCoderMode && !isLiveModeRef.current && textModelQueueRef.current.length === 0 && activeCategoryRef.current !== 'director' && activeCategoryRef.current !== 'stt') {
      addLog("Switching back to director model for routing...");
      loadModelRef.current('director');
    }
  }, [addLog, handleToolCall, processSpeechQueue, summarizeChat, isCoderMode]);

  useEffect(() => {
    handleAssistantCompleteRef.current = handleAssistantComplete;
  }, [handleAssistantComplete]);

  useEffect(() => {
    handleAssistantUpdateRef.current = handleAssistantUpdate;
  }, [handleAssistantUpdate]);

  const clearChat = () => {
    setMessages([]);
    setSandboxFiles([]);
    setGeneratedImage(null);
    addLog("Session cleared");
  };

  const clearCache = async () => {
    try {
      const cacheNames = await caches.keys();
      for (const name of cacheNames) {
        await caches.delete(name);
      }
      addLog("Model cache cleared successfully", "success");
      window.location.reload();
    } catch (e) {
      addLog("Failed to clear cache: " + e, "error");
    }
  };

  const appContextValue = {
    ramLimitPercent,
    setRamLimitPercent,
    enableRAG,
    setEnableRAG,
    speakEnabled,
    setSpeakEnabled,
    chatMode,
    setChatMode,
    liveModeTimer,
    setLiveModeTimer,
    isModelLoading,
    isModelReady,
    loadingProgress,
    loadedModelId,
    activeCategory,
    selectedModels,
    setSelectedModels,
    messages,
    isGenerating,
    isAnalyzing,
    isSummarizing,
    input,
    setInput,
    textModelQueue,
    directorModelQueue,
    visionModelQueue,
    imageModelQueue,
    musicModelQueue,
    isCategoryDisabled,
    longTermMemories,
    systemRam,
    heapUsage,
    memoryUsage,
    hasWebGPU,
    logs,
    showLogs,
    setShowLogs,
    isElectron,
    isCoderMode,
    setIsCoderMode,
    previousTextModel,
    setPreviousTextModel,
    isLiveMode,
    toggleLiveMode,
    showSidebar,
    setShowSidebar
  };

  return (
    <AppProvider value={appContextValue}>
      <div className="h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-orange-500/30 flex flex-col overflow-hidden">
        <Header 
          clearChat={clearChat}
          clearCache={clearCache}
        />

        <div className="flex-1 flex overflow-hidden">
          {showSidebar && (
            <Sidebar 
              loadModel={loadModel}
              logEndRef={logEndRef}
            />
          )}

          <ChatArea 
            handleSend={handleSend}
            analyzeImage={analyzeImage}
            speak={(text) => {
              if (!speakEnabled) {
                addLog("Please enable 'Speak Responses' in the sidebar to use TTS", "error");
                return;
              }
              setIsGenerating(true);
              tts.speak(text).finally(() => setIsGenerating(false));
            }}
            handleToolCall={handleToolCall}
            handleMusicGen={handleMusicGen}
            pendingImage={pendingImage}
            setPendingImage={setPendingImage}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            scrollRef={scrollRef}
            onScroll={handleScroll}
            generatedImage={generatedImage}
            sandboxFiles={sandboxFiles}
            isRecording={isRecording}
            toggleRecording={toggleRecording}
            handleOptionSelect={handleOptionSelect}
          />

          {(sandboxFiles.length > 0 || generatedImage) && (
            <PreviewSidebar 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              sandboxFiles={sandboxFiles}
              generatedImage={generatedImage}
            />
          )}
        </div>

        <ErrorOverlay 
          error={error}
          setError={setError}
          setDidError={setDidError}
          loadModel={loadModel}
          clearCache={clearCache}
        />
      </div>
    </AppProvider>
  );
}
