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
import { LogEntry, SandboxFile, ChatTab, ChatMode, FocusTopic, EmotionalState, ErrorReport } from "@shared/types";

export function AppLogicProvider({ children }: { children: ReactNode }) {
  // --- Settings & Persistence ---
  const {
    ramLimitPercent,
    setRamLimitPercent,
    contextMemoryLimit,
    setContextMemoryLimit,
    temperature,
    setTemperature,
    topP,
    setTopP,
    topK,
    setTopK,
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
    allowRemote,
    setAllowRemote,
    enableFocusTopics,
    setEnableFocusTopics,
    thinkEnabled,
    setThinkEnabled,
    researchEnabled,
    setResearchEnabled,
    liveResearchEnabled,
    setLiveResearchEnabled,
    researchSrc,
    setResearchSrc,
    enableMMRS,
    setEnableMMRS,
    enableDualBrain,
    setEnableDualBrain,
    dualBrainMode,
    setDualBrainMode,
    enableTurboMode,
    setEnableTurboMode,
    mmrsModel,
    setMmrsModel,
    mmrsMode,
    setMmrsMode,
    inactivityTimeout,
    setInactivityTimeout,
    onlyExecute,
    setOnlyExecute,
    developerView,
    setDeveloperView,
    aceBpm,
    setAceBpm,
    aceKey,
    setAceKey,
    aceRegisterShift,
    setAceRegisterShift,
    aceVibratoSwell,
    setAceVibratoSwell,
    aceReverbDelayFeed,
    setAceReverbDelayFeed,
    aceVocalStyle,
    setAceVocalStyle,
    aceKokoroVoice,
    setAceKokoroVoice,
    aceAutoSettings,
    setAceAutoSettings,
  } = useSettings();

  // --- State ---
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const addLog = useCallback((message: string, type: "info" | "error" | "success" = "info") => {
    setLogs((prev) => [
      ...prev,
      { timestamp: new Date().toLocaleTimeString(), message, type },
    ].slice(-50));
  }, []);

  const [messages, setMessages] = useState<any[]>([]);
  const [didError, setDidError] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const [focusTopics, setFocusTopics] = useState<FocusTopic[]>([]);
  const [emotionalState, setEmotionalState] = useState<EmotionalState>("Focused");

  useEffect(() => {
    if (browserEngine) {
      browserEngine.setIdleTimeout(inactivityTimeout);
    }
  }, [inactivityTimeout]);

  // --- Focus Topics and Emotional State Helpers & Effects ---

  const capitalizeWords = useCallback((str: string): string => {
    return str
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }, []);

  const adjustEmotionalStateForTopic = useCallback((topicName: string) => {
    const t = topicName.toLowerCase();
    if (/\b(math|science|physics|chemistry|logic|coder|coding|programming|algorithm|rust|python|javascript|database|query|sql|react|server|engine|model|network|telemetry|token|inference)\b/i.test(t)) {
      setEmotionalState("Analytical");
    } else if (/\b(art|music|design|fiction|novel|poetry|drawing|creative|ui|ux|color|palette|illustration|song|sound|beats|lyrics|craft|craftsmanship)\b/i.test(t)) {
      setEmotionalState("Creative");
    } else if (/\b(game|play|fun|awesome|incredible|win|fast|excited|party|celebrate|achievement|sport|cool|thrilled)\b/i.test(t)) {
      setEmotionalState("Excited");
    } else if (/\b(mind|consciousness|philosophy|meaning|future|ethics|moral|meditation|spirit|human|nature|universe|life|wisdom|think|thought)\b/i.test(t)) {
      setEmotionalState("Thoughtful");
    } else if (/\b(why|how|what|question|space|alien|mystery|curious|curiosity|exploration|discovery|seek|find|learn)\b/i.test(t)) {
      setEmotionalState("Curious");
    } else {
      setEmotionalState("Focused");
    }
  }, []);

  const extractTopicFromText = useCallback((text: string): string | null => {
    if (!text || text.trim().length < 3) return null;
    
    // Clean up text
    const cleanText = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();
    
    // Pattern matches
    const patterns = [
      /about\s+([a-z0-9\s]{3,25})/i,
      /discuss\s+([a-z0-9\s]{3,25})/i,
      /explain\s+([a-z0-9\s]{3,25})/i,
      /what\s+is\s+([a-z0-9\s]{3,25})/i,
      /tell\s+me\s+about\s+([a-z0-9\s]{3,25})/i,
      /how\s+does\s+([a-z0-9\s]{3,25})/i,
      /learn\s+about\s+([a-z0-9\s]{3,25})/i,
      /familiar\s+with\s+([a-z0-9\s]{3,25})/i,
      /think\s+about\s+([a-z0-9\s]{3,25})/i,
      /talk\s+about\s+([a-z0-9\s]{3,25})/i,
      /interested\s+in\s+([a-z0-9\s]{3,25})/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const candidate = match[1].trim();
        const words = candidate.split(/\s+/).slice(0, 3).join(" ");
        if (words.length >= 3) {
          return capitalizeWords(words);
        }
      }
    }
    
    // Fallback: extract meaningful non-filler words
    const stopWords = new Set([
      "the", "a", "an", "and", "or", "but", "if", "then", "else", "when", "where",
      "who", "what", "why", "how", "is", "are", "was", "were", "be", "been", "being",
      "to", "of", "in", "on", "at", "by", "for", "with", "about", "against", "between",
      "into", "through", "during", "before", "after", "above", "below", "from", "up",
      "down", "in", "out", "on", "off", "over", "under", "again", "further", "then",
      "once", "here", "there", "when", "where", "why", "how", "all", "any", "both",
      "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not",
      "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will",
      "just", "don", "should", "now", "i", "you", "he", "she", "it", "we", "they",
      "me", "him", "her", "us", "them", "my", "your", "his", "her", "its", "our", "their",
      "am", "have", "has", "had", "do", "does", "did", "please", "hello", "hi", "hey"
    ]);
    
    const words = cleanText.split(/\s+/);
    const contentWords = words.filter(w => w.length > 2 && !stopWords.has(w.toLowerCase()));
    
    if (contentWords.length > 0) {
      const topic = contentWords.slice(0, 2).join(" ");
      return capitalizeWords(topic);
    }
    
    return null;
  }, [capitalizeWords]);

  // Decay timer effect (0.1% starting decay rate, increments by 0.1% every second)
  useEffect(() => {
    if (!enableFocusTopics) {
      if (focusTopics.length > 0) setFocusTopics([]);
      return;
    }
    const timer = setInterval(() => {
      setFocusTopics(prev => {
        if (prev.length === 0) return prev;
        const updated = prev.map(t => ({
          ...t,
          energy: t.energy - t.decayRate,
          decayRate: t.decayRate + 0.1
        })).filter(t => t.energy > 0);
        return updated;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [enableFocusTopics, focusTopics.length]);

  const processedMessageRef = useRef<Set<string>>(new Set());

  // Watch messages for user turns to extract topics
  useEffect(() => {
    if (!enableFocusTopics || messages.length === 0) return;
    
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === "user" && lastMsg.content) {
      const msgKey = lastMsg.id || (lastMsg.content + "_" + lastMsg.timestamp);
      if (processedMessageRef.current.has(msgKey)) return;
      processedMessageRef.current.add(msgKey);

      const text = lastMsg.content;
      const extractedTopic = extractTopicFromText(text);
      if (extractedTopic) {
        setFocusTopics(prev => {
          const lowerExtracted = extractedTopic.toLowerCase();
          
          // Check if user is mentioning an existing topic
          const existingIndex = prev.findIndex(t => t.name.toLowerCase() === lowerExtracted);
          if (existingIndex !== -1) {
            addLog(`Focus Topics: Reinforcing "${prev[existingIndex].name}" (+10% focus energy)`, "success");
            const updated = [...prev];
            updated[existingIndex] = {
              ...updated[existingIndex],
              energy: Math.min(100, updated[existingIndex].energy + 10),
              decayRate: 0.1
            };
            adjustEmotionalStateForTopic(prev[existingIndex].name);
            return updated;
          }

          // New topic energy starting logic
          let initialEnergy = 50;
          if (prev.length === 1) initialEnergy = 40;
          else if (prev.length >= 2) initialEnergy = 33;

          // Curious state bonus (+15% focus energy)
          if (emotionalState === "Curious") {
            initialEnergy = Math.min(100, initialEnergy + 15);
            addLog(`Focus Topics: Curious state boosted starting focus by +15%!`, "info");
          }

          const newTopic: FocusTopic = {
            name: extractedTopic,
            energy: initialEnergy,
            decayRate: 0.1
          };

          addLog(`Focus Topics: New topic detected - "${extractedTopic}" (${initialEnergy}% focus energy)`, "success");
          adjustEmotionalStateForTopic(extractedTopic);

          if (prev.length < 3) {
            return [...prev, newTopic];
          } else {
            // Find lowest energy topic and replace it
            let lowestIdx = 0;
            let lowestEnergy = prev[0].energy;
            for (let i = 1; i < prev.length; i++) {
              if (prev[i].energy < lowestEnergy) {
                lowestEnergy = prev[i].energy;
                lowestIdx = i;
              }
            }
            addLog(`Focus Topics: Replacing lowest energy topic "${prev[lowestIdx].name}" with "${extractedTopic}"`, "info");
            const updated = [...prev];
            updated[lowestIdx] = newTopic;
            return updated;
          }
        });
      }
    }
  }, [messages, enableFocusTopics, emotionalState, addLog, extractTopicFromText, adjustEmotionalStateForTopic]);
  
  const [sandboxFiles, setSandboxFiles] = useState<SandboxFile[]>([]);
  const sandboxFilesRef = useRef(sandboxFiles);
  useEffect(() => { sandboxFilesRef.current = sandboxFiles; }, [sandboxFiles]);

  const [activeTab, setActiveTab] = useState<"chat" | "sandbox" | "gallery" | "memory">("chat");
  const [isCoderMode, setIsCoderMode] = useState(false);
  const [previousTextModel, setPreviousTextModel] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showMemoryDashboard, setShowMemoryDashboard] = useState(false);

  // --- Multi-Tab Chat State & Operations ---
  const [chatTabs, setChatTabs] = useState<ChatTab[]>(() => {
    return [{
      id: "0",
      name: "New Chat",
      messages: [],
      sandboxFiles: [],
      generatedImage: null,
      chatMode: "director",
      isCoderMode: false
    }];
  });
  const [activeTabId, setActiveTabId] = useState<string>("0");
  const isSwitchingTabRef = useRef(false);

  // Auto-sync active states to active tab in tabs list
  useEffect(() => {
    if (isSwitchingTabRef.current) return;
    setChatTabs(prev => {
      const activeTabObj = prev.find(t => t.id === activeTabId);
      if (!activeTabObj) return prev;
      
      if (
        activeTabObj.messages === messages &&
        activeTabObj.sandboxFiles === sandboxFiles &&
        activeTabObj.generatedImage === generatedImage &&
        activeTabObj.chatMode === chatMode &&
        activeTabObj.isCoderMode === isCoderMode
      ) {
        return prev;
      }
      
      return prev.map(t => {
        if (t.id === activeTabId) {
          return {
            ...t,
            messages,
            sandboxFiles,
            generatedImage,
            chatMode,
            isCoderMode
          };
        }
        return t;
      });
    });
  }, [messages, sandboxFiles, generatedImage, chatMode, isCoderMode, activeTabId]);

  // Purge temporary on unload
  useEffect(() => {
    const handleUnload = () => {
      chatTabs.forEach(t => {
        if (t.isTemporary || t.id.startsWith("-")) {
          const blob = new Blob([JSON.stringify({ reqId: t.id })], { type: 'application/json' });
          navigator.sendBeacon("/api/purge-history", blob);
        }
      });
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [chatTabs]);

  const selectTab = useCallback((targetId: string) => {
    if (targetId === activeTabId) return;
    isSwitchingTabRef.current = true;

    setChatTabs(prev => {
      const updated = prev.map(t => {
        if (t.id === activeTabId) {
          return {
            ...t,
            messages,
            sandboxFiles,
            generatedImage,
            chatMode,
            isCoderMode
          };
        }
        return t;
      });

      const targetTab = updated.find(t => t.id === targetId);
      if (targetTab) {
        setMessages(targetTab.messages || []);
        setSandboxFiles(targetTab.sandboxFiles || []);
        setGeneratedImage(targetTab.generatedImage || null);
        setChatMode(targetTab.chatMode || "director");
        setIsCoderMode(targetTab.isCoderMode || false);
      }
      return updated;
    });

    setActiveTabId(targetId);

    setTimeout(() => {
      isSwitchingTabRef.current = false;
    }, 50);
  }, [activeTabId, messages, sandboxFiles, generatedImage, chatMode, isCoderMode]);

  const openNewTab = useCallback((isTemporary: boolean = false, mode?: ChatMode) => {
    const prevActiveId = activeTabId;
    let archivedId = "";

    setChatTabs(prev => {
      let updated = [...prev];

      if (prevActiveId === "0") {
        archivedId = (isTemporary ? "-" : "") + Date.now().toString() + "_" + Math.floor(Math.random() * 1000);
        
        updated = updated.map(t => {
          if (t.id === "0") {
            const dateStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return {
              ...t,
              id: archivedId,
              name: t.name === "New Chat" || t.name === "Sandbox Session" ? (t.chatMode === "sandbox" ? `Sandbox #${dateStr}` : `Chat #${dateStr}`) : t.name,
              messages,
              sandboxFiles,
              generatedImage,
              chatMode,
              isCoderMode,
              isTemporary: t.isTemporary
            };
          }
          return t;
        });

        // Backend archive history
        fetch("/api/archive-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ oldReqId: "0", newReqId: archivedId })
        }).catch(err => console.warn("Failed to archive on backend", err));
      }

      const newTab: ChatTab = {
        id: "0",
        name: mode === "sandbox" ? "Sandbox Session" : (isTemporary ? "Temporary Chat" : "New Chat"),
        messages: [],
        sandboxFiles: [],
        generatedImage: null,
        chatMode: mode || "director",
        isCoderMode: mode === "sandbox",
        isTemporary
      };

      updated.push(newTab);
      return updated;
    });

    setMessages([]);
    setSandboxFiles([]);
    setGeneratedImage(null);
    setChatMode(mode || "director");
    setIsCoderMode(mode === "sandbox");
    setActiveTabId("0");
  }, [activeTabId, messages, sandboxFiles, generatedImage, chatMode, isCoderMode]);

  const renameTab = useCallback((id: string, newName: string) => {
    setChatTabs(prev => {
      const updated = [...prev];
      const targetIdx = updated.findIndex(t => t.id === id);
      if (targetIdx !== -1) {
        updated[targetIdx] = { ...updated[targetIdx], name: newName };
      }
      return updated;
    });
  }, []);

  const closeTab = useCallback((id: string) => {
    const isTemp = id.startsWith("-") || (chatTabs.find(t => t.id === id)?.isTemporary);
    if (isTemp) {
      fetch("/api/purge-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reqId: id })
      }).catch(err => console.warn("Failed to purge temporary tab on backend", err));
    }

    setChatTabs(prev => {
      const updated = prev.filter(t => t.id !== id);
      if (id === activeTabId) {
        const nextTab = updated[updated.length - 1] || {
          id: "0",
          name: "New Chat",
          messages: [],
          sandboxFiles: [],
          generatedImage: null,
          chatMode: "director",
          isCoderMode: false
        };
        if (!updated.some(t => t.id === nextTab.id)) {
          updated.push(nextTab);
        }
        
        setMessages(nextTab.messages || []);
        setSandboxFiles(nextTab.sandboxFiles || []);
        setGeneratedImage(nextTab.generatedImage || null);
        setChatMode(nextTab.chatMode || "director");
        setIsCoderMode(nextTab.isCoderMode || false);
        setActiveTabId(nextTab.id);
      }
      return updated;
    });
  }, [activeTabId, chatTabs]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(true);

  // Refs for speech/live mode
  const isHiddenRef = useRef(false);
  const isRoutingRef = useRef(false);
  const isLiveModeRef = useRef(false);
  const speakEnabledRef = useRef(speakEnabled);
  useEffect(() => {
    speakEnabledRef.current = speakEnabled;
    if (!speakEnabled) {
      tts.stop();
      speechQueueRef.current = [];
      spokenTextLengthRef.current = 0;
      setMessages((prev) => {
        return prev.map((msg) => {
          if (msg.role === "assistant" && msg.fullContent) {
            return {
              ...msg,
              content: msg.fullContent
            };
          }
          return msg;
        });
      });
    } else {
      tts.init().catch(console.error);
    }
  }, [speakEnabled, setMessages]);
  const speechQueueRef = useRef<string[]>([]);
  const spokenTextLengthRef = useRef(0);
  const isSpeakingRef = useRef(false);

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

  const [error, setErrorState] = useState<ErrorReport | null>(null);

  const setError = useCallback((err: ErrorReport | null) => {
    if (err) {
      setErrorState({
        ...err,
        memoryAtError: err.memoryAtError || (memoryUsage ? `${Math.round(memoryUsage.used / 1024 / 1024)} MB / ${Math.round(memoryUsage.total / 1024 / 1024 / 1024)} GB` : undefined),
        stackHeapAtError: err.stackHeapAtError || (heapUsage ? `${heapUsage.used} MB / ${heapUsage.limit} MB` : undefined),
      });
    } else {
      setErrorState(null);
    }
  }, [memoryUsage, heapUsage]);

  const [isRemoteProcessing, setIsRemoteProcessing] = useState(false);

  useEffect(() => {
    browserEngine.init().then(() => {
      if (browserEngine.useLocalServerApi) {
        addLog("Omnix System: Local Omnix Desktop API Server detected running on Port 9777! AI capabilities are routed through local high-performance hardware, bypassing browser WASM downloads.", "success");
      } else {
        addLog("Omnix System: Local Omnix Desktop API Server is offline or unreachable. Initializing local browser-side models (WebGPU/WASM mode).", "info");
      }
    }).catch(err => {
      addLog(`Omnix System: Initialization warning/error: ${err?.message || String(err)}`, "error");
    });
  }, [addLog]);

  const {
    selectedModels,
    setSelectedModels,
    selectedQtypes,
    setSelectedQtypes,
    activeCategory,
    setActiveCategory,
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

  useEffect(() => {
    const unsubscribe = browserEngine.subscribe(() => {
      const modelId = browserEngine.getCurrentModelId();
      if (!modelId) {
        setIsModelReady(false);
        setLoadedModelId(null);
      } else {
        const parts = modelId.split(":");
        const category = parts[0];
        const id = parts[1] || parts[0];
        setLoadedModelId(id);
        setIsModelReady(true);
        setActiveCategory(category);
        setSelectedModels(prev => ({ ...prev, [category]: id }));
      }
    });

    browserEngine.onIdleUnload(() => {
      addLog("System: Active models unloaded due to 10 minutes of inactivity.", "info");
    });

    return () => {
      unsubscribe();
      browserEngine.onIdleUnload(null);
    };
  }, [setIsModelReady, setLoadedModelId, setActiveCategory, setSelectedModels, addLog]);

  const [safeMode, setSafeMode] = useState(false);
  useEffect(() => {
    browserEngine.setSafeMode(safeMode);
    if (safeMode) addLog("Engine: Safe Mode Engaged (Single-thread WASM/No-Cache)", "info");
  }, [safeMode, addLog]);

  // Synchronize background server logs from Electron main process via contextBridge/IPC
  useEffect(() => {
    if (isElectron && (window as any).electron?.onServerLog) {
      const unsubscribe = (window as any).electron.onServerLog((logData: { text: string; type: "info" | "error" | "success" }) => {
        addLog(logData.text, logData.type || "info");
      });
      return unsubscribe;
    }
  }, [isElectron, addLog]);

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

  const { isConnected, sendInference, activeAuthRequest, respondToAuth } = useSocketInference(
    addLog,
    setIsModelReady,
    setIsModelLoading,
    setMessages,
    setLoadingProgress,
    setWorkerCount,
    enableRelayMode || isElectron,
    setIsRemoteProcessing,
    loadModel,
    selectedModels,
    speakEnabled
  );

  const { processSpeechQueue, feedSpeechToken, flushSpeech } = useSpeechManagement(
    speakEnabledRef,
    spokenTextLengthRef,
    speechQueueRef,
    isSpeakingRef,
    setMessages,
    isHiddenRef,
    speakEnabled
  );

  const [currentStepIndex, setCurrentStepIndex] = useState(-1);

  const {
    isPipelineRunning,
    startPipeline,
    stopPipeline,
    workflow
  } = usePipelineGeneration(addLog, setSandboxFiles, setSelectedModels, currentStepIndex, setCurrentStepIndex);

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
    activeResearch,
    setActiveResearch,
    handleSend,
    handleSendInternal
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
    setError,
    activeTabId,
    focusTopics,
    enableFocusTopics,
    selectedQtypes,
    contextMemoryLimit,
    temperature,
    topP,
    topK,
    sandboxFiles,
    setSandboxFiles,
    currentStepIndex,
    setCurrentStepIndex,
    enableMMRS,
    feedSpeechToken,
    flushSpeech,
    speakEnabled,
    researchEnabled,
    liveResearchEnabled,
    researchSrc,
    aceBpm,
    aceKey,
    aceRegisterShift,
    aceVibratoSwell,
    aceReverbDelayFeed,
    aceVocalStyle,
    aceKokoroVoice,
    aceAutoSettings,
    (params: any) => {
      if (params.bpm !== undefined) setAceBpm(params.bpm);
      if (params.key !== undefined) setAceKey(params.key);
      if (params.vocalStyle !== undefined) setAceVocalStyle(params.vocalStyle);
      if (params.kokoroVoice !== undefined) setAceKokoroVoice(params.kokoroVoice);
      if (params.registerShift !== undefined) setAceRegisterShift(params.registerShift);
      if (params.vibratoSwell !== undefined) setAceVibratoSwell(params.vibratoSwell);
      if (params.reverbDelayFeed !== undefined) setAceReverbDelayFeed(params.reverbDelayFeed);
    },
    enableDualBrain,
    dualBrainMode,
    onlyExecute
  );

  // Reset error when mode changes explicitly
  useEffect(() => {
    setError(null);
    setDidError(false);
  }, [chatMode, isCoderMode, setError]);

  // Sync MMRS state with model engine
  useEffect(() => {
    browserEngine.setEnableMMRS(enableMMRS);
  }, [enableMMRS]);

  // Sync Dual Brain states with model engine
  useEffect(() => {
    if (browserEngine && typeof (browserEngine as any).setEnableDualBrain === "function") {
      (browserEngine as any).setEnableDualBrain(enableDualBrain);
    }
  }, [enableDualBrain]);

  useEffect(() => {
    if (browserEngine && typeof (browserEngine as any).setDualBrainMode === "function") {
      (browserEngine as any).setDualBrainMode(dualBrainMode);
    }
  }, [dualBrainMode]);

  // Sync Turbo state with model engine
  useEffect(() => {
    if (browserEngine && typeof (browserEngine as any).setEnableTurboMode === "function") {
      (browserEngine as any).setEnableTurboMode(enableTurboMode);
    }
  }, [enableTurboMode]);

  // --- Mode Sync: Auto-load or switch model based on active chat/coder mode ---
  useEffect(() => {
    if (!isRamDetected || isModelLoading || isRemoteProcessing || error) return;

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

    let isMatched = activeCategory === targetCategory;
    if (targetCategory === "director" && selectedModels.director === "use-text-model" && activeCategory === "text") {
      isMatched = true;
    }
    if (targetCategory === "text" && selectedModels.director === "use-text-model" && activeCategory === "director") {
      isMatched = true;
    }

    let expectedModelId = selectedModels[targetCategory];
    if (targetCategory === "director" && expectedModelId === "use-text-model") {
      expectedModelId = selectedModels.text;
    }
    const isModelMatched = loadedModelId === expectedModelId;

    if (!isMatched || !isModelMatched) {
      addLog(`System: Mode switch to ${isCoderMode ? 'Coder' : chatMode} detected. Loading model for ${targetCategory}...`, "info");
      loadModel(targetCategory);
    }
  }, [isRamDetected, isCoderMode, chatMode, activeCategory, loadedModelId, isModelLoading, isRemoteProcessing, loadModel, addLog, error, selectedModels]);

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
    loadModel,
    enableMMRS,
    isRemoteProcessing
  );

  const { analyzeImage } = useAppHandlers(
    addLog,
    setMessages,
    setVisionModelQueue,
    setGeneratedImage,
    setActiveTab,
    setPendingImage
  );

  // Speech management is instantiated above

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

  const { isLiveMode, toggleLiveMode, livePermissionError, setLivePermissionError } = useLiveMode(
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

  // Sync chatMode with isLiveMode (so if live mode fails/stops, we return to director mode)
  useEffect(() => {
    if (!isLiveMode && chatMode === "live") {
      setChatMode("director");
    }
  }, [isLiveMode, chatMode, setChatMode]);

  // Enable Kokoro TTS when Live Mode starts, but allow user to toggle it off manually
  useEffect(() => {
    if (isLiveMode) {
      setSpeakEnabled(true);
      tts.resume();
    }
  }, [isLiveMode, setSpeakEnabled]);

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
    contextMemoryLimit, setContextMemoryLimit,
    temperature, setTemperature,
    topP, setTopP,
    topK, setTopK,
    enableRAG, setEnableRAG,
    speakEnabled, setSpeakEnabled,
    chatMode, setChatMode,
    liveModeTimer, setLiveModeTimer,
    theme, setTheme,
    minimizeToTray, setMinimizeToTray,
    aceBpm, setAceBpm,
    aceKey, setAceKey,
    aceRegisterShift, setAceRegisterShift,
    aceVibratoSwell, setAceVibratoSwell,
    aceReverbDelayFeed, setAceReverbDelayFeed,
    aceVocalStyle, setAceVocalStyle,
    aceKokoroVoice, setAceKokoroVoice,
    aceAutoSettings, setAceAutoSettings,
    enableRelayMode, setEnableRelayMode,
    allowRemote, setAllowRemote,
    enableFocusTopics, setEnableFocusTopics,
    focusTopics, setFocusTopics,
    emotionalState, setEmotionalState,
    thinkEnabled, setThinkEnabled,
    researchEnabled, setResearchEnabled,
    liveResearchEnabled, setLiveResearchEnabled,
    researchSrc, setResearchSrc,
    activeResearch, setActiveResearch,
    enableMMRS, setEnableMMRS,
    enableDualBrain, setEnableDualBrain,
    dualBrainMode, setDualBrainMode,
    enableTurboMode, setEnableTurboMode,
    mmrsModel, setMmrsModel,
    mmrsMode, setMmrsMode,
    inactivityTimeout, setInactivityTimeout,
    onlyExecute, setOnlyExecute,
    developerView, setDeveloperView,
    chatTabs, activeTabId, selectTab, openNewTab, closeTab, renameTab,
    relayActive, isApiServerActive, startRelayServer, launchApiServer, shutdownApiServer,
    isModelLoading, isModelReady, loadingProgress, loadedModelId,
    activeCategory, selectedModels, setSelectedModels,
    selectedQtypes, setSelectedQtypes,
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
    logs, addLog, showLogs, setShowLogs,
    isElectron, isCoderMode, setIsCoderMode,
    previousTextModel, setPreviousTextModel,
    isLiveMode, toggleLiveMode,
    safeMode, setSafeMode,
    livePermissionError, setLivePermissionError,
    showSidebar, setShowSidebar,
    showMemoryDashboard, setShowMemoryDashboard,
    error, setError, didError, setDidError,
    isConnected,
    activeAuthRequest, respondToAuth,
    sandboxFiles, setSandboxFiles,
    activeTab, setActiveTab,
    generatedImage, setGeneratedImage,
    pendingImage, setPendingImage,
    loadModel, analyzeImage, handleSend, handleSendInternal,
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
