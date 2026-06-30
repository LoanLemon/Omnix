import React, { createContext, useContext, ReactNode } from "react";
import { LogEntry, Message, ChatMode, SandboxFile, ChatTab, FocusTopic, EmotionalState, ErrorReport } from "@shared/types";

interface AppContextType {
  // Tabs State
  chatTabs: ChatTab[];
  activeTabId: string;
  selectTab: (id: string) => void;
  openNewTab: (isTemporary?: boolean, mode?: ChatMode) => void;
  closeTab: (id: string) => void;
  renameTab: (id: string, newName: string) => void;

  // Settings
  ramLimitPercent: number;
  setRamLimitPercent: (val: number) => void;
  contextMemoryLimit: number;
  setContextMemoryLimit: (val: number) => void;
  temperature: number;
  setTemperature: (val: number) => void;
  topP: number;
  setTopP: (val: number) => void;
  topK: number;
  setTopK: (val: number) => void;
  enableRAG: boolean;
  setEnableRAG: (val: boolean) => void;
  enableFocusTopics: boolean;
  setEnableFocusTopics: (val: boolean) => void;
  focusTopics: FocusTopic[];
  setFocusTopics: React.Dispatch<React.SetStateAction<FocusTopic[]>>;
  emotionalState: EmotionalState;
  setEmotionalState: (val: EmotionalState) => void;
  speakEnabled: boolean;
  setSpeakEnabled: (val: boolean) => void;
  chatMode: ChatMode;
  setChatMode: (val: ChatMode) => void;
  liveModeTimer: number;
  setLiveModeTimer: (val: number) => void;
  theme: "light" | "dark";
  setTheme: (val: "light" | "dark") => void;
  minimizeToTray: boolean;
  setMinimizeToTray: (val: boolean) => void;
  enableRelayMode: boolean;
  setEnableRelayMode: (val: boolean) => void;
  thinkEnabled: boolean;
  setThinkEnabled: (val: boolean) => void;
  enableMMRS: boolean;
  setEnableMMRS: (val: boolean) => void;
  mmrsModel: "text" | "image" | "music";
  setMmrsModel: (val: "text" | "image" | "music") => void;
  mmrsMode: "operational" | "bob" | "duality" | "polarity";
  setMmrsMode: (val: "operational" | "bob" | "duality" | "polarity") => void;
  inactivityTimeout: number;
  setInactivityTimeout: (val: number) => void;
  relayActive: boolean;
  isApiServerActive: boolean;
  startRelayServer: () => Promise<void>;
  launchApiServer: () => Promise<void>;
  shutdownApiServer: () => Promise<void>;

  // Model State
  isModelLoading: boolean;
  isModelReady: boolean;
  loadingProgress: Record<string, { progress: number; status: string }>;
  loadedModelId: string | null;
  activeCategory: string;
  selectedModels: Record<string, string>;
  setSelectedModels: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  selectedQtypes: Record<string, string>;
  setSelectedQtypes: React.Dispatch<React.SetStateAction<Record<string, string>>>;

  // Chat State
  messages: Message[];
  isGenerating: boolean;
  isAnalyzing: boolean;
  isSummarizing: boolean;
  input: string;
  setInput: (val: string) => void;
  textModelQueue: any[];
  directorModelQueue: any[];
  visionModelQueue: any[];
  imageModelQueue: any[];
  musicModelQueue: any[];
  isCategoryDisabled: (cat: string) => boolean;
  longTermMemories: number;
  
  // System State
  systemRam: number;
  isElectron: boolean;
  isWorkerMode: boolean;
  heapUsage: { used: number; limit: number };
  memoryUsage: { used: number; total: number };
  hasWebGPU: boolean | null;
  logs: LogEntry[];
  addLog: (message: string, type?: "info" | "error" | "success") => void;
  showLogs: boolean;
  setShowLogs: (val: boolean) => void;

  // Coder Mode
  isCoderMode: boolean;
  setIsCoderMode: (val: boolean) => void;
  previousTextModel: string | null;
  setPreviousTextModel: (val: string | null) => void;

  // Live Mode
  isLiveMode: boolean;
  toggleLiveMode: () => void;
  safeMode: boolean;
  setSafeMode: (val: boolean) => void;
  livePermissionError: boolean;
  setLivePermissionError: (val: boolean) => void;

  // Sidebar
  showSidebar: boolean;
  setShowSidebar: (val: boolean) => void;
  showMemoryDashboard: boolean;
  setShowMemoryDashboard: (val: boolean) => void;

  // Error State
  error: ErrorReport | null;
  setError: (val: ErrorReport | null) => void;
  setDidError: (val: boolean) => void;

  // Connection
  isConnected: boolean;
  workerCount: number;
  setWorkerCount: (val: number) => void;
  activeAuthRequest: { authId: string; webdomain: string; category: string } | null;
  respondToAuth: (authId: string, decision: "once" | "always" | "never" | "block_once") => void;

  // Sandbox & Media
  sandboxFiles: SandboxFile[];
  setSandboxFiles: React.Dispatch<React.SetStateAction<SandboxFile[]>>;
  activeTab: "chat" | "sandbox" | "gallery" | "memory";
  setActiveTab: (val: "chat" | "sandbox" | "gallery" | "memory") => void;
  generatedImage: string | null;
  setGeneratedImage: (val: string | null) => void;
  pendingImage: string | null;
  setPendingImage: (val: string | null) => void;

  // Operations
  loadModel: (category: string, modelId?: string, skipLoadingVisuals?: boolean) => Promise<void>;
  analyzeImage: (file: File) => void;
  handleSend: () => void;
  handleSendInternal: (text: string, systemPrompt?: string, role?: "user" | "system", hidden?: boolean) => Promise<void>;
  clearChat: () => void;
  clearCache: () => void;
  rebootEngine: () => void;
  isRecording: boolean;
  toggleRecording: () => void;

  // Layout Refs
  scrollRef: React.RefObject<HTMLDivElement | null>;
  logEndRef: React.RefObject<HTMLDivElement | null>;

  // Pipeline Generation
  currentStepIndex: number;
  isPipelineRunning: boolean;
  startPipeline: (description: string) => Promise<void>;
  stopPipeline: () => void;
  workflow: any[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children, value }: { children: ReactNode; value: AppContextType }) {
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
