import { Sparkles, Trash2, Database, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useApp } from "../context/AppContext";

interface HeaderProps {
  clearChat: () => void;
  clearCache: () => void;
}

export function Header({
  clearChat,
  clearCache
}: HeaderProps) {
  const {
    hasWebGPU,
    systemRam,
    isModelReady,
    chatMode,
    setChatMode,
    showSidebar,
    setShowSidebar
  } = useApp();

  return (
    <header className="h-14 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-orange-500" />
          <h1 className="font-bold text-sm tracking-tight uppercase">Omnix (Local AI)</h1>
        </div>
        <Separator orientation="vertical" className="h-4 bg-zinc-800" />
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] h-5 border-zinc-800 bg-zinc-900/50 text-zinc-400">
            {hasWebGPU ? "WebGPU" : "WASM"}
          </Badge>
          <Badge variant="outline" className="text-[10px] h-5 border-zinc-800 bg-zinc-900/50 text-zinc-400">
            {systemRam}GB RAM
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex bg-zinc-900 rounded-md p-0.5 border border-zinc-800">
          <Button 
            variant={chatMode === "default" ? "secondary" : "ghost"} 
            size="sm" 
            className="h-7 text-[10px] px-2"
            onClick={() => setChatMode("default")}
          >
            Default
          </Button>
          <Button 
            variant={chatMode === "discuss" ? "secondary" : "ghost"} 
            size="sm" 
            className="h-7 text-[10px] px-2"
            onClick={() => setChatMode("discuss")}
          >
            Discuss
          </Button>
          <Button 
            variant={chatMode === "edit" ? "secondary" : "ghost"} 
            size="sm" 
            className="h-7 text-[10px] px-2"
            onClick={() => setChatMode("edit")}
          >
            Edit
          </Button>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800">
          <div className={`w-1.5 h-1.5 rounded-full ${isModelReady ? "bg-green-500" : "bg-zinc-700"}`} />
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
            {isModelReady ? "Engine Ready" : "Initializing"}
          </span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-200" onClick={clearChat} title="Clear Chat">
          <Trash2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-200" onClick={clearCache} title="Clear Model Cache">
          <Database className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`h-8 w-8 ${showSidebar ? 'text-orange-500 bg-orange-500/10' : 'text-zinc-500'} hover:text-zinc-200`} 
          onClick={() => setShowSidebar(!showSidebar)} 
          title="Toggle Sidebar"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
