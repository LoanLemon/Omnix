export type ChatMode = "director" | "text" | "image" | "music" | "sandbox" | "live";

export interface FocusTopic {
  name: string;
  energy: number;
  decayRate: number;
}

export type EmotionalState = "Focused" | "Curious" | "Creative" | "Analytical" | "Excited" | "Thoughtful";


export interface ErrorReport {
  message: string;
  activeModel?: string;
  contextLength?: number;
  rawPrompt?: string;
}

export interface SandboxFile {
  name: string;
  content: string;
  language: "typescript" | "javascript" | "html" | "css" | "json";
}

export interface Message {
  id?: string;
  category?: string;
  role: "user" | "assistant" | "system";
  content: string;
  spokenContent?: string;
  completedSpokenContent?: string;
  fullContent?: string;
  image?: string;
  audio?: string;
  hidden?: boolean;
  timestamp?: string;
  stats?: { tps: string; tokens: number };
  isProgress?: boolean;
  isQueued?: boolean;
  loadingProgress?: Record<string, { progress: number; status: string }>;
  options?: string[];
  toolCall?: {
    tool: string;
    params: any;
    status: "pending" | "success" | "error";
    result?: string;
  };
}

export interface ChatTab {
  id: string;
  name: string;
  messages: Message[];
  sandboxFiles: SandboxFile[];
  generatedImage: string | null;
  chatMode: ChatMode;
  isCoderMode: boolean;
  isTemporary?: boolean;
}

export interface LogEntry {
  timestamp: string;
  message: string;
  type: "info" | "error" | "success";
}

export interface ModelInfo {
  id: string;
  name: string;
  category: string;
  modelID: string;
  path: string;
  modelfile: string;
  dtype: string;
  minRam?: number;
  make?: string;
}

declare global {
  interface Window {
    electron?: {
      fs: {
        readDir: (dirPath: string) => Promise<any>;
        readFile: (filePath: string) => Promise<any>;
        writeFile: (filePath: string, content: string) => Promise<any>;
      };
      os: {
        getMemoryStats: () => Promise<any>;
      };
      dialog: {
        openFile: () => Promise<any>;
      };
      onInferenceRequest: (callback: (data: any) => void) => void;
      sendInferenceResult: (requestId: string, response: any) => void;
    };
  }
}
