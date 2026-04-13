import { Cpu, Settings2, Download, Loader2, Activity, Database, Bot, History, Maximize2, Volume2, FolderOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { MODELS } from "../../modelList";
import { tts as ttsEngine } from "../../lib/tts";
import type { RefObject } from "react";
import { useApp } from "../context/AppContext";

interface SidebarProps {
  loadModel: (cat: string) => void;
  logEndRef: RefObject<HTMLDivElement | null>;
}

export function Sidebar({
  loadModel,
  logEndRef
}: SidebarProps) {
  const {
    heapUsage,
    selectedModels,
    setSelectedModels,
    isModelLoading,
    activeCategory,
    systemRam,
    isCategoryDisabled,
    memoryUsage,
    ramLimitPercent,
    setRamLimitPercent,
    enableRAG,
    setEnableRAG,
    speakEnabled,
    setSpeakEnabled,
    liveModeTimer,
    setLiveModeTimer,
    longTermMemories,
    logs,
    showLogs,
    setShowLogs,
    isElectron
  } = useApp();

  const filteredModels = MODELS;

  const handleOpenFile = async () => {
    if (isElectron && (window as any).electron) {
      const result = await (window as any).electron.dialog.openFile();
      if (!result.canceled && result.filePaths.length > 0) {
        // You could do something with the file paths here
        console.log("Selected files:", result.filePaths);
      }
    }
  };

  return (
    <aside className="w-72 border-right border-zinc-800 bg-zinc-950 flex flex-col shrink-0 overflow-y-auto">
      <div className="p-4 space-y-6">
        {isElectron && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-zinc-500">
              <FolderOpen className="w-3 h-3" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Electron Filesystem</span>
            </div>
            <Button 
              variant="outline" 
              className="w-full h-8 bg-zinc-900 border-zinc-800 text-[10px] gap-2"
              onClick={handleOpenFile}
            >
              <FolderOpen className="w-3 h-3" />
              Open Local Files
            </Button>
          </section>
        )}

        <section className="space-y-3">
          <div className="flex items-center justify-between text-zinc-500">
            <div className="flex items-center gap-2">
              <Cpu className="w-3 h-3" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Heap Usage</span>
            </div>
            <span className="text-[10px] font-mono">{heapUsage.used}MB / {heapUsage.limit}MB</span>
          </div>
          <Progress value={(heapUsage.used / heapUsage.limit) * 100} className="h-1 bg-zinc-800" />
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 text-zinc-500">
            <Settings2 className="w-3 h-3" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Model Orchestration</span>
          </div>
          
          {["text", "vision", "stt", "tts", "image-gen", "music-gen", "director", "coder"].map((cat) => {
            const modelsInCategory = filteredModels.filter(m => m.category === cat);
            const showDropdown = modelsInCategory.length > 1;
            
            return (
              <div key={cat} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-zinc-500 uppercase">{cat.replace("-", " ")}</span>
                  {isCategoryDisabled(cat) && <span className="text-[8px] text-red-500 font-bold">LOW RAM</span>}
                </div>
                <div className="flex gap-1.5">
                  {showDropdown ? (
                    <Select 
                      value={selectedModels[cat]} 
                      onValueChange={(val) => setSelectedModels((prev: any) => ({ ...prev, [cat]: val }))}
                      disabled={isModelLoading}
                    >
                      <SelectTrigger className="h-7 bg-zinc-900 border-zinc-800 text-[10px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800">
                        {Array.from(new Set(modelsInCategory.map(m => m.make))).map(make => (
                          <SelectGroup key={make}>
                            <SelectLabel className="text-[9px] text-zinc-600 uppercase px-2">{make}</SelectLabel>
                            {modelsInCategory.filter(m => m.make === make).map(m => (
                              <SelectItem key={m.id} value={m.id} className="text-[10px]" disabled={m.minRam && m.minRam > systemRam}>
                                {m.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex-1 h-7 flex items-center px-3 bg-zinc-900/30 border border-zinc-800/50 rounded-md text-[10px] text-zinc-400 italic">
                      {modelsInCategory[0]?.name || "No model available"}
                    </div>
                  )}
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className={`h-7 w-7 shrink-0 ${activeCategory === cat ? "border-orange-500/50 bg-orange-500/10 text-orange-500" : "border-zinc-800"}`}
                    onClick={() => loadModel(cat)}
                    disabled={isModelLoading}
                  >
                    {isModelLoading && activeCategory === cat ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                  </Button>
                </div>
              </div>
            );
          })}
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 text-zinc-500">
            <Activity className="w-3 h-3" />
            <span className="text-[10px] font-bold uppercase tracking-widest">System Monitor</span>
          </div>
          <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-[9px] text-zinc-500">
                <span>Context Cache</span>
                <span>{(memoryUsage.used / 1024 / 1024).toFixed(1)} MB</span>
              </div>
              <Progress value={(memoryUsage.used / (memoryUsage.total * (ramLimitPercent / 100))) * 100} className="h-1 bg-zinc-800" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[9px] text-zinc-500">
                <span>RAM Usage Limit</span>
                <span className="text-orange-500 font-bold">{ramLimitPercent}%</span>
              </div>
              <Slider 
                value={[ramLimitPercent]} 
                onValueChange={(val) => setRamLimitPercent(val[0])} 
                max={90} 
                min={10} 
                step={1}
                className="py-2"
              />
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex justify-between text-[9px] text-zinc-500">
                <span>Live Mode Capture Timer</span>
                <span className="text-orange-500 font-bold">{liveModeTimer}s</span>
              </div>
              <Slider 
                value={[liveModeTimer]} 
                onValueChange={(val) => setLiveModeTimer(val[0])} 
                max={60} 
                min={2} 
                step={1}
                className="py-2"
              />
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className={`w-3 h-3 ${enableRAG ? "text-orange-500" : "text-zinc-600"}`} />
                  <span className="text-[9px] text-zinc-400">Long-term Memory</span>
                </div>
                <Switch 
                  checked={enableRAG} 
                  onCheckedChange={setEnableRAG}
                  className="scale-75 data-[state=checked]:bg-orange-600"
                />
              </div>
              <div className="flex justify-between text-[8px] text-zinc-600 italic px-1">
                <span>{enableRAG ? "Active (RAG Enabled)" : "Disabled (Faster Chat)"}</span>
                <span>{longTermMemories} memories</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className={`w-3 h-3 ${speakEnabled ? "text-orange-500" : "text-zinc-600"}`} />
                  <span className="text-[9px] text-zinc-400">Speak Responses</span>
                </div>
                <div className="flex items-center gap-2">
                  {speakEnabled && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 text-zinc-500 hover:text-orange-500"
                      onClick={() => ttsEngine.speak("Testing speech system. If you hear this, audio is working correctly.")}
                    >
                      <Volume2 className="w-3 h-3" />
                    </Button>
                  )}
                  <Switch 
                    checked={speakEnabled} 
                    onCheckedChange={(val) => {
                      setSpeakEnabled(val);
                      if (val) ttsEngine.resume();
                    }}
                    className="scale-75 data-[state=checked]:bg-orange-600"
                  />
                </div>
              </div>
              <div className="flex justify-between text-[8px] text-zinc-600 italic px-1">
                <span>{speakEnabled ? "Active (Kokoro TTS)" : "Disabled (Silent)"}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 text-zinc-500">
            <Bot className="w-3 h-3" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Features Enabled</span>
          </div>
          <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 grid grid-cols-2 gap-2">
            {[
              { label: "Text", active: !!selectedModels.text },
              { label: "Speech", active: speakEnabled },
              { label: "Vision", active: !!selectedModels.vision },
              { label: "Image", active: !!selectedModels["image-gen"] }
            ].map(feat => (
              <div key={feat.label} className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${feat.active ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" : "bg-zinc-800"}`} />
                <span className={`text-[10px] ${feat.active ? "text-zinc-300" : "text-zinc-600"}`}>{feat.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-500">
              <History className="w-3 h-3" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Console Logs</span>
            </div>
            <Button variant="ghost" size="icon" className="h-4 w-4" onClick={() => setShowLogs(!showLogs)}>
              <Maximize2 className="w-2.5 h-2.5" />
            </Button>
          </div>
          <div className="h-40 bg-black/40 border border-zinc-800 rounded p-2 font-mono text-[9px] overflow-y-auto space-y-1">
            {logs.map((log, i) => (
              <div key={i} className={`flex gap-2 ${log.type === 'error' ? 'text-red-500' : log.type === 'success' ? 'text-green-500' : 'text-zinc-500'}`}>
                <span className="opacity-30 shrink-0">[{log.timestamp}]</span>
                <span className="break-all">{log.message}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </section>
      </div>
    </aside>
  );
}
