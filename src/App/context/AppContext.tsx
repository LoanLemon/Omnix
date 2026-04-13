import React, { createContext, useContext, ReactNode } from "react";
import { LogEntry, Message } from "../types";

interface AppContextType {
  // Settings
  ramLimitPercent: number;
  setRamLimitPercent: (val: number) => void;
  enableRAG: boolean;
  setEnableRAG: (val: boolean) => void;
  speakEnabled: boolean;
  setSpeakEnabled: (val: boolean) => void;
  chatMode: "default" | "discuss" | "edit";
  setChatMode: (val: "default" | "discuss" | "edit") => void;
  liveModeTimer: number;
  setLiveModeTimer: (val: number) => void;

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

  // Sidebar
  showSidebar: boolean;
  setShowSidebar: (val: boolean) => void;
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
