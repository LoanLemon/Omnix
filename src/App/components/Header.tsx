import { Sparkles, Trash2, Database, Settings, Bot, Image as ImageIcon, Music, Code2, Monitor, Zap, Globe, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "../context/AppContext";
import { ChatMode } from "../types";
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
    <header className="h-14 border-b border-border bg-background flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-orange-500" />
          <h1 className="font-bold text-sm tracking-tight uppercase">Omnix (Local AI)</h1>
        </div>
        <Separator orientation="vertical" className="h-4 bg-border" />
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] h-5 border-border bg-muted/50 text-muted-foreground">
            {hasWebGPU ? "WebGPU" : "WASM"}
          </Badge>
          <Badge variant="outline" className="text-[10px] h-5 border-border bg-muted/50 text-muted-foreground">
            {systemRam}GB RAM
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Mode</span>
          <Select value={chatMode} onValueChange={(val) => handleModeChange(val as ChatMode)}>
            <SelectTrigger className="h-8 w-36 bg-muted border-border text-[10px] focus:ring-orange-500/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="director" className="text-[10px] focus:bg-accent focus:text-orange-500">
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-orange-500" />
                  Director (Auto)
                </div>
              </SelectItem>
              <SelectItem value="text" className="text-[10px] focus:bg-accent focus:text-orange-500">
                <div className="flex items-center gap-2">
                  <Bot className="w-3 h-3 text-blue-500" />
                  Text Mode
                </div>
              </SelectItem>
              <SelectItem value="image" className="text-[10px] focus:bg-accent focus:text-orange-500">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-3 h-3 text-purple-500" />
                  Image Mode
                </div>
              </SelectItem>
              <SelectItem value="music" className="text-[10px] focus:bg-accent focus:text-orange-500">
                <div className="flex items-center gap-2">
                  <Music className="w-3 h-3 text-pink-500" />
                  Music Mode
                </div>
              </SelectItem>
              <SelectItem value="sandbox" className="text-[10px] focus:bg-accent focus:text-orange-500">
                <div className="flex items-center gap-2">
                  <Code2 className="w-3 h-3 text-green-500" />
                  Sandbox
                </div>
              </SelectItem>
              <SelectItem value="live" className="text-[10px] focus:bg-accent focus:text-orange-500">
                <div className="flex items-center gap-2">
                  <Monitor className="w-3 h-3 text-red-500" />
                  Live Mode
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border">
          <div className={`w-1.5 h-1.5 rounded-full ${isModelReady ? "bg-green-500" : "bg-zinc-700"}`} />
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
            {isModelReady ? "Engine Ready" : "Initializing"}
          </span>
        </div>

        <Separator orientation="vertical" className="h-4 bg-border mx-1" />

        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-orange-500" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} title="Toggle Theme">
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-orange-500" onClick={() => setIsApiGuideOpen(true)} title="API Guide">
          <Globe className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={clearChat} title="Clear Chat">
          <Trash2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={clearCache} title="Clear Model Cache">
          <Database className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`h-8 w-8 ${showSidebar ? 'text-orange-500 bg-orange-500/10' : 'text-muted-foreground'} hover:text-foreground`} 
          onClick={() => setShowSidebar(!showSidebar)} 
          title="Toggle Sidebar"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      <ApiGuideModal isOpen={isApiGuideOpen} onClose={() => setIsApiGuideOpen(false)} />
    </header>
  );
}
