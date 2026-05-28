import React, { createContext, useContext, ReactNode } from "react";
import { LogEntry, Message, ChatMode, SandboxFile } from "@shared/types";

interface AppContextType {
  // Settings
  ramLimitPercent: number;
  setRamLimitPercent: (val: number) => void;
  enableRAG: boolean;
  setEnableRAG: (val: boolean) => void;
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
  relayActive: boolean;
  startRelayServer: () => Promise<void>;

  // Model State
  isModelLoading: boolean;
  isModelReady: boolean;
  loadingProgress: Record<string, { progress: number; status: string }>;
  loadedModelId: string | null;
  activeCategory: string;
  selectedModels: Record<string, string>;
  setSelectedModels: React.Dispatch<React.SetStateAction<Record<string, string>>>;

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

  // Sidebar
  showSidebar: boolean;
  setShowSidebar: (val: boolean) => void;

  // Error State
  error: string | null;
  setError: (val: string | null) => void;
  setDidError: (val: boolean) => void;

  // Connection
  isConnected: boolean;
  workerCount: number;
  setWorkerCount: (val: number) => void;

  // Sandbox & Media
  sandboxFiles: SandboxFile[];
  setSandboxFiles: React.Dispatch<React.SetStateAction<SandboxFile[]>>;
  activeTab: "chat" | "sandbox" | "gallery";
  setActiveTab: (val: "chat" | "sandbox" | "gallery") => void;
  generatedImage: string | null;
  setGeneratedImage: (val: string | null) => void;
  pendingImage: string | null;
  setPendingImage: (val: string | null) => void;

  // Operations
  loadModel: (category: string, modelId?: string) => Promise<void>;
  analyzeImage: (file: File) => void;
  handleSend: () => void;
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
