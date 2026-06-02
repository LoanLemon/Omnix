import React, { useState, useEffect, useRef, useCallback, ReactNode, useMemo } from "react";
import { MODELS } from "@shared/modelList";
import { memoryStore } from "@/lib/memory";
import { tts } from "@/lib/tts";
import { browserEngine } from "@/lib/ModelEngine";

// Hooks
import { useSystemStats } from "@/hooks/useSystemStats";
import { useSettings } from "@/hooks/useSettings";
import { useModelManagement } from "@/hooks/useModelManagement";
import { useChatLogic } from "@/hooks/useChatLogic";
import { useAppHandlers } from "@/hooks/useAppHandlers";
import { useSpeechManagement } from "@/hooks/useSpeechManagement";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { useLiveMode } from "@/hooks/useLiveMode";
import { useSocketInference } from "@/hooks/useSocketInference";
import { useInferenceOrchestrator } from "@/hooks/useInferenceOrchestrator";
import { usePipelineGeneration } from "@/hooks/usePipelineGeneration";

// Context
import { AppProvider } from "./AppContext";

// Types
import { LogEntry, SandboxFile } from "@shared/types";
import { TEXT_SYSTEM_PROMPT, CODER_SYSTEM_PROMPT, getModePrompt } from "@shared/prompts";

export function AppLogicProvider({ children }: { children: ReactNode }) {
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
    setLiveModeTimer,
    theme,
    setTheme,
    minimizeToTray,
    setMinimizeToTray,
    enableRelayMode,
    setEnableRelayMode,
    thinkEnabled,
    setThinkEnabled,
  } = useSettings();

  // --- State ---
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [didError, setDidError] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  const [sandboxFiles, setSandboxFiles] = useState<SandboxFile[]>([]);
  const sandboxFilesRef = useRef(sandboxFiles);
  useEffect(() => { sandboxFilesRef.current = sandboxFiles; }, [sandboxFiles]);

  const [activeTab, setActiveTab] = useState<"chat" | "sandbox" | "gallery">("chat");
  const [isCoderMode, setIsCoderMode] = useState(false);
  const [previousTextModel, setPreviousTextModel] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(true);

  // Refs for speech/live mode
  const isHiddenRef = useRef(false);
  const isRoutingRef = useRef(false);
  const isLiveModeRef = useRef(false);
  const speakEnabledRef = useRef(speakEnabled);
  useEffect(() => { speakEnabledRef.current = speakEnabled; }, [speakEnabled]);
  const speechQueueRef = useRef<string[]>([]);
  const spokenTextLengthRef = useRef(0);
  const isSpeakingRef = useRef(false);

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
    isWorkerMode,
    heapUsage, 
    memoryUsage, 
    setMemoryUsage,
    hasWebGPU
  } = useSystemStats(addLog);

  useEffect(() => {
    browserEngine.init();
  }, []);

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
    loadModel,
    isCategoryDisabled
  } = useModelManagement(systemRam, isRamDetected, addLog, setError, setDidError);

  const [safeMode, setSafeMode] = useState(false);
  useEffect(() => {
    browserEngine.setSafeMode(safeMode);
    if (safeMode) addLog("Engine: Safe Mode Engaged (Single-thread WASM/No-Cache)", "info");
  }, [safeMode, addLog]);

  const [workerCount, setWorkerCount] = useState(0);
  const [relayActive, setRelayActive] = useState(false);
  const [isApiServerActive, setIsApiServerActive] = useState(false);

  const checkRelayStatus = useCallback(async () => {
    try {
      const resp = await fetch("/api/server/status");
      const data = await resp.json();
      setRelayActive(data.relayActive);
      setIsApiServerActive(true);
    } catch (e) {
      setRelayActive(false);
      setIsApiServerActive(false);
    }
  }, []);

  useEffect(() => {
    checkRelayStatus();
    const interval = setInterval(checkRelayStatus, 4000);
    return () => clearInterval(interval);
  }, [checkRelayStatus]);

  const startRelayServer = useCallback(async () => {
    try {
      addLog("System: Requesting Relay Server Initialization...", "info");
      const resp = await fetch("/api/server/relay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" })
      });
      const data = await resp.json();
      if (data.status === "ok") {
        setRelayActive(true);
        setEnableRelayMode(true);
        addLog("System: Relay Server Active. Other nodes can now connect.", "success");
      }
    } catch (e) {
      addLog("System: Failed to start relay server. Ensure standalone core is running.", "error");
    }
  }, [addLog, setEnableRelayMode]);

  const launchApiServer = useCallback(async () => {
    if (isElectron && (window as any).electron?.server) {
      addLog("System: Spawning background API server process...", "info");
      const ok = await (window as any).electron.server.start();
      if (ok) {
        addLog("System: API server process spawned successfully.", "success");
        setIsApiServerActive(true);
        setTimeout(checkRelayStatus, 2000);
      } else {
        addLog("System: Failed to spawn background API server process.", "error");
      }
    } else {
      addLog("System: Not in Electron environment. Cannot spawn server process.", "error");
    }
  }, [isElectron, addLog, checkRelayStatus]);

  const shutdownApiServer = useCallback(async () => {
    if (isElectron && (window as any).electron?.server) {
      addLog("System: Terminating background API server process...", "info");
      const ok = await (window as any).electron.server.stop();
      if (ok) {
        setIsApiServerActive(false);
        setRelayActive(false);
        addLog("System: API server process terminated.", "success");
      } else {
        addLog("System: Failed to terminate background API server process.", "error");
      }
    }
  }, [isElectron, addLog]);

  const { isConnected, sendInference } = useSocketInference(
    addLog,
    setIsModelReady,
    setIsModelLoading,
    setMessages,
    setLoadingProgress,
    setWorkerCount,
    enableRelayMode
  );

  const {
    input,
    setInput,
    isGenerating,
    setIsGenerating,
    textModelQueue,
    setTextModelQueue,
    directorModelQueue,
    setDirectorModelQueue,
    visionModelQueue,
    setVisionModelQueue,
    imageModelQueue,
    setImageModelQueue,
    musicModelQueue,
    setMusicModelQueue,
    longTermMemories,
    pendingImage,
    setPendingImage,
    handleSend
  } = useChatLogic(
    messages,
    setMessages,
    sendInference,
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
    isRoutingRef,
    setIsModelLoading,
    setLoadingProgress,
    thinkEnabled,
    setError
  );

  const {
    currentStepIndex,
    isPipelineRunning,
    startPipeline,
    stopPipeline,
    workflow
  } = usePipelineGeneration(addLog, setSandboxFiles, setSelectedModels);

  // Reset error when mode changes explicitly
  useEffect(() => {
    setError(null);
    setDidError(false);
  }, [chatMode, isCoderMode, setError]);

  // --- Mode Sync: Auto-load or switch model based on active chat/coder mode ---
  useEffect(() => {
    if (!isRamDetected || isModelLoading || error) return;

    let targetCategory = "text";
    
    if (isCoderMode) {
      targetCategory = "coder";
    } else {
      switch (chatMode) {
        case "director":
          targetCategory = "director";
          break;
        case "image":
          targetCategory = "image-gen";
          break;
        case "music":
          targetCategory = "music-gen";
          break;
        case "live":
          targetCategory = "vision";
          break;
        case "sandbox":
          targetCategory = "coder";
          break;
        default:
          targetCategory = "text";
      }
    }

    if (activeCategory !== targetCategory || !loadedModelId) {
      addLog(`System: Mode switch to ${isCoderMode ? 'Coder' : chatMode} detected. Loading model for ${targetCategory}...`, "info");
      loadModel(targetCategory);
    }
  }, [isRamDetected, isCoderMode, chatMode, activeCategory, loadedModelId, isModelLoading, loadModel, addLog, error]);

  // Orchestrate model switching based on queues
  useInferenceOrchestrator(
    activeCategory,
    isGenerating,
    isAnalyzing,
    isModelLoading,
    isCoderMode,
    {
      text: textModelQueue.length,
      director: directorModelQueue.length,
      vision: visionModelQueue.length,
      image: imageModelQueue.length,
      music: musicModelQueue.length
    },
    loadModel
  );

  const { analyzeImage } = useAppHandlers(
    addLog,
    setMessages,
    setVisionModelQueue,
    setGeneratedImage,
    setActiveTab,
    setPendingImage
  );

  const { processSpeechQueue } = useSpeechManagement(
    speakEnabledRef,
    spokenTextLengthRef,
    speechQueueRef,
    isSpeakingRef,
    setMessages,
    isHiddenRef
  );

  const { isRecording, toggleRecording, flushRecording, startRecording, stopRecording } = useSpeechToText(
    addLog, 
    setInput,
    async () => {
      const whisperModel = MODELS.find(m => m.id === "whisper-tiny-en");
      const modelKey = `${whisperModel?.modelID}@${whisperModel?.path || 'main'}`;
      if (activeCategory === "stt" && isModelReady && loadedModelId === modelKey) return true;
      loadModel("stt", "whisper-tiny-en");
      return false;
    }
  );

  const { isLiveMode, toggleLiveMode } = useLiveMode(
    addLog,
    flushRecording,
    isRecording,
    startRecording,
    stopRecording,
    isAnalyzing,
    isGenerating,
    visionModelQueue.length,
    (screenshot, isSilent) => {
      if (!screenshot && isSilent) return;
      setMessages(prev => [...prev, { 
        id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
        role: "user", 
        content: isSilent ? "Analyzing screen..." : "Listening...", 
        image: screenshot || undefined,
        hidden: true 
      }]);
      if (isSilent && screenshot && !isAnalyzing) {
        setVisionModelQueue(prev => [...prev, { image: screenshot, prompt: "The users screen shows:" }]);
      }
    },
    liveModeTimer * 1000
  );

  // Sync refs
  useEffect(() => { isLiveModeRef.current = isLiveMode; }, [isLiveMode]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setSandboxFiles([]);
    setGeneratedImage(null);
    addLog("Session cleared");
  }, [addLog]);

  const clearCache = useCallback(async () => {
    try {
      // 1. Clear standard Cache API
      const cacheNames = await caches.keys();
      for (const name of cacheNames) await caches.delete(name);
      
      // 2. Clear IndexedDB (used by transformers.js and ORT)
      const commonDBNames = ['onnxruntime-web-cache', 'transformers-cache', 'huggingface-cache'];
      
      if (window.indexedDB && (window.indexedDB as any).databases) {
        try {
          const dbs = await (window.indexedDB as any).databases();
          for (const dbInfo of dbs) {
            if (dbInfo.name && (
              dbInfo.name.includes('transformers') || 
              dbInfo.name.includes('onnx') || 
              dbInfo.name.includes('huggingface')
            )) {
              console.log(`🧹 Clearing Detected IndexedDB: ${dbInfo.name}`);
              window.indexedDB.deleteDatabase(dbInfo.name);
            }
          }
        } catch (dbErr) {
          console.warn("Failed to list IndexedDBs, falling back to common names", dbErr);
          commonDBNames.forEach(name => window.indexedDB.deleteDatabase(name));
        }
      } else {
        commonDBNames.forEach(name => window.indexedDB.deleteDatabase(name));
      }

      addLog("Model and Engine caches cleared successfully", "success");
      setTimeout(() => window.location.reload(), 1000);
    } catch (e) {
      addLog("Failed to clear cache: " + e, "error");
    }
  }, [addLog]);

  const rebootEngine = useCallback(async () => {
    addLog("System: Initializing Engine_Full_Reboot...", "info");
    await browserEngine.clear();
    setIsModelReady(false);
    setLoadedModelId(null);
    addLog("System: Engine_Stack Purged. Re-select model to activate.", "success");
  }, [addLog, setIsModelReady, setLoadedModelId]);

  const value = {
    ramLimitPercent, setRamLimitPercent,
    enableRAG, setEnableRAG,
    speakEnabled, setSpeakEnabled,
    chatMode, setChatMode,
    liveModeTimer, setLiveModeTimer,
    theme, setTheme,
    minimizeToTray, setMinimizeToTray,
    enableRelayMode, setEnableRelayMode,
    thinkEnabled, setThinkEnabled,
    relayActive, isApiServerActive, startRelayServer, launchApiServer, shutdownApiServer,
    isModelLoading, isModelReady, loadingProgress, loadedModelId,
    activeCategory, selectedModels, setSelectedModels,
    workerCount, setWorkerCount,
    messages, setMessages,
    isGenerating, setIsGenerating,
    isAnalyzing, setIsAnalyzing,
    input, setInput,
    textModelQueue, setTextModelQueue,
    directorModelQueue, setDirectorModelQueue,
    visionModelQueue, setVisionModelQueue,
    imageModelQueue, setImageModelQueue,
    musicModelQueue, setMusicModelQueue,
    isCategoryDisabled, longTermMemories,
    systemRam, heapUsage, memoryUsage, hasWebGPU,
    logs, showLogs, setShowLogs,
    isElectron, isCoderMode, setIsCoderMode,
    previousTextModel, setPreviousTextModel,
    isLiveMode, toggleLiveMode,
    safeMode, setSafeMode,
    showSidebar, setShowSidebar,
    isConnected,
    sandboxFiles, setSandboxFiles,
    activeTab, setActiveTab,
    generatedImage, setGeneratedImage,
    pendingImage, setPendingImage,
    loadModel, analyzeImage, handleSend,
    clearChat, clearCache, rebootEngine,
    isRecording, toggleRecording,
    scrollRef, logEndRef,
    currentStepIndex,
    isPipelineRunning,
    startPipeline,
    stopPipeline,
    workflow
  };

  /** System-level Side Effects (Singleton logic, etc.) could go here */

  return <AppProvider value={value as any}>{children}</AppProvider>;
}
