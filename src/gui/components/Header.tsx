import { Sparkles, Trash2, Database, Settings, Cpu, Bot, Image as ImageIcon, Music, Code2, Monitor, Zap, Globe, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "../context/AppContext";
import { ChatMode } from "@shared/types";
import { useState } from "react";
import { ApiGuideModal } from "./ApiGuideModal";

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
    setShowSidebar,
    isLiveMode,
    toggleLiveMode,
    setIsCoderMode,
    theme,
    setTheme
  } = useApp();

  const [isApiGuideOpen, setIsApiGuideOpen] = useState(false);

  const handleModeChange = (val: ChatMode) => {
    setChatMode(val);
    if (val === "live" && !isLiveMode) {
      toggleLiveMode();
    } else if (val !== "live" && isLiveMode) {
      toggleLiveMode();
    }

    if (val === "sandbox") {
      setIsCoderMode(true);
    } else {
      setIsCoderMode(false);
    }
  };

  return (
    <header className="h-14 border-b border-border bg-background flex items-center justify-between px-6 shrink-0 relative z-50">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent" />
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-orange-500/10 border border-orange-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.1)]">
            <Sparkles className="w-4 h-4 text-orange-500" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-mono text-[11px] font-bold tracking-[0.2em] uppercase text-foreground/90">Omnix.ai</h1>
            <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest opacity-60">Control Center</span>
          </div>
        </div>
        
        <Separator orientation="vertical" className="h-4 bg-border/50" />
        
        <div className="flex items-center gap-2">
          <div className="group flex items-center gap-1.5 px-2 py-1 rounded bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
            <Zap className={`w-3 h-3 ${hasWebGPU ? "text-orange-500" : "text-zinc-500"}`} />
            <span className="font-mono text-[9px] font-bold text-muted-foreground uppercase">{hasWebGPU ? "WebGPU-ACCEL" : "CPU-WASM"}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted/30 border border-border/50">
            <Cpu className="w-3 h-3 text-zinc-400" />
            <span className="font-mono text-[9px] font-bold text-muted-foreground uppercase">{systemRam}GB CORE</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest mb-0.5 opacity-50">Operational Mode</span>
            <Select value={chatMode} onValueChange={(val) => handleModeChange(val as ChatMode)}>
              <SelectTrigger className="h-7 w-40 bg-muted/30 border-border text-[10px] text-foreground font-mono focus:ring-orange-500/30 hover:border-orange-500/30 transition-all rounded-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border/50 text-popover-foreground text-[10px] font-mono shadow-md">
                <SelectItem value="director" className="focus:bg-orange-500/10 focus:text-orange-500">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3" />
                    [0x0] DIRECTOR_AUTO
                  </div>
                </SelectItem>
                <SelectItem value="text" className="focus:bg-blue-500/10 focus:text-blue-500">
                  <div className="flex items-center gap-2">
                    <Bot className="w-3 h-3" />
                    [0x1] LLM_TEXT_SYNC
                  </div>
                </SelectItem>
                <SelectItem value="image" className="focus:bg-purple-500/10 focus:text-purple-500">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-3 h-3" />
                    [0x2] FLUX_IMAGE_GEN
                  </div>
                </SelectItem>
                <SelectItem value="music" className="focus:bg-pink-500/10 focus:text-pink-500">
                  <div className="flex items-center gap-2">
                    <Music className="w-3 h-3" />
                    [0x3] SONIC_MUSIC_GEN
                  </div>
                </SelectItem>
                <SelectItem value="sandbox" className="focus:bg-green-500/10 focus:text-green-500">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-3 h-3" />
                    [0x4] CODER_SANDBOX
                  </div>
                </SelectItem>
                <SelectItem value="live" className="focus:bg-red-500/10 focus:text-red-500">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-3 h-3" />
                    [0x5] REALTIME_LIVE
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="h-7 px-3 flex items-center gap-3 rounded-sm bg-black/20 border border-border/50 group relative overflow-hidden">
          <div className={`w-1.5 h-1.5 rounded-full ${isModelReady ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-zinc-700 animate-pulse"}`} />
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.1em]">
            {isModelReady ? "SYSTEM_ACTIVE" : "ENGINE_IDLE"}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
        </div>

        <Separator orientation="vertical" className="h-4 bg-border/50 mx-1" />

        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} title="Toggle Theme">
            {theme === "dark" ? <Sun className="w-4 h-4 shadow-orange-500" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10" onClick={() => setIsApiGuideOpen(true)} title="API Guide">
            <Globe className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10" onClick={clearChat} title="Clear Chat">
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10" onClick={clearCache} title="Clear Model Cache">
            <Database className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-8 w-8 transition-all ${showSidebar ? 'text-orange-500 bg-orange-500/10' : 'text-muted-foreground'} hover:text-orange-500 hover:bg-orange-500/10`} 
            onClick={() => setShowSidebar(!showSidebar)} 
            title="Toggle Sidebar"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ApiGuideModal isOpen={isApiGuideOpen} onClose={() => setIsApiGuideOpen(false)} />
    </header>
  );
}
