export interface SandboxFile {
  name: string;
  content: string;
  language: "typescript" | "javascript" | "html" | "css";
}

export interface Message {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  image?: string;
  audio?: string;
  hidden?: boolean;
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
