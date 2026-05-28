import { Cpu, Settings2, Download, Loader2, Activity, Database, Bot, History, Maximize2, Volume2, FolderOpen, Zap, Workflow, CheckCircle2, PlayCircle, Circle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { MODELS } from "@shared/modelList";
import { tts as ttsEngine } from "@/lib/tts";
import type { RefObject } from "react";
import { useApp } from "@/context/AppContext";

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
    isElectron,
    minimizeToTray,
    setMinimizeToTray,
    isCoderMode,
    enableRelayMode,
    setEnableRelayMode,
    relayActive,
    startRelayServer,
    workerCount,
    rebootEngine,
    currentStepIndex,
    isPipelineRunning,
    workflow
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
    <aside id="omnix-sidebar" className="w-80 border-r border-border bg-background flex flex-col shrink-0 overflow-y-auto relative">
      <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-orange-500/10 to-transparent" />
      
      <div className="p-5 space-y-8">
        {isElectron && (
          <section id="sidebar-fs-section" className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground/60 px-1">
              <FolderOpen className="w-3 h-3" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] font-mono italic">FS_ACCESS</span>
            </div>
            <Button 
              id="btn-open-local-files"
              variant="outline" 
              className="w-full h-9 bg-zinc-900 dark:bg-black/40 border-border hover:border-orange-500/30 hover:bg-orange-500/5 text-[10px] gap-2 font-mono transition-all rounded-sm group"
              onClick={handleOpenFile}
            >
              <FolderOpen className="w-3.5 h-3.5 text-orange-500/70 group-hover:text-orange-500" />
              OPEN_LOCAL_FILES
            </Button>
          </section>
        )}

        {/* Resource Monitor */}
        <section id="sidebar-sys-heap" className="space-y-4 pt-2">
          <div className="flex items-center justify-between text-muted-foreground/60 px-1">
            <div className="flex items-center gap-2">
              <Cpu className="w-3 h-3" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] font-mono italic">SYS_HEAP</span>
            </div>
            <span id="heap-usage-text" className="text-[9px] font-mono opacity-80 tabular-nums tracking-tighter">[{heapUsage.used} / {heapUsage.limit}] MB</span>
          </div>
          <div className="relative h-1.5 bg-muted/30 rounded-full overflow-hidden border border-border/20">
            <motion.div 
              id="heap-usage-progress"
              className="absolute inset-y-0 left-0 bg-orange-500"
              initial={{ width: 0 }}
              animate={{ width: `${(heapUsage.used / heapUsage.limit) * 100}%` }}
              transition={{ type: "spring", bounce: 0, duration: 2 }}
            />
          </div>
        </section>

        {/* Project Pipeline (Coder Mode Only) */}
        {isCoderMode && (
          <section id="sidebar-pipeline" className="space-y-4 border-t border-border/30 pt-6">
            <div className="flex items-center justify-between text-muted-foreground/60 px-1">
              <div className="flex items-center gap-2">
                <Workflow className="w-3 h-3" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] font-mono italic">PROJECT_PIPELINE</span>
              </div>
              {isPipelineRunning && (
                <span className="flex items-center gap-1 text-[8px] text-orange-500 font-mono animate-pulse">
                  <PlayCircle className="w-2.5 h-2.5" />
                  GEN_ACTIVE
                </span>
              )}
            </div>
            
            <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {workflow.map((step, idx) => {
                const isFinished = idx < currentStepIndex;
                const isActive = idx === currentStepIndex;
                const isPending = idx > currentStepIndex;
                
                return (
                  <div 
                    key={step.id} 
                    className={`group flex items-start gap-3 p-2 rounded-sm border transition-all ${
                      isActive 
                        ? "bg-orange-500/5 border-orange-500/30 shadow-[inset_0_0_12px_rgba(249,115,22,0.03)]" 
                        : isFinished 
                        ? "bg-emerald-500/5 border-emerald-500/20" 
                        : "bg-muted/5 border-transparent hover:bg-muted/10"
                    }`}
                  >
                    <div className="mt-0.5">
                      {isFinished ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ) : isActive ? (
                        <Loader2 className="w-3.5 h-3.5 text-orange-500 animate-spin" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-muted-foreground/30" />
                      )}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <div className={`text-[10px] font-mono font-bold leading-none ${
                        isActive ? "text-orange-500" : isFinished ? "text-emerald-500/80" : "text-muted-foreground/50"
                      }`}>
                        {step.name}
                      </div>
                      <div className="text-[8px] text-muted-foreground/40 font-mono truncate">
                        {step.file}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Model Grid */}
        <section id="sidebar-engine-stack" className="space-y-4 border-t border-border/30 pt-6">
          <div className="flex items-center gap-2 text-muted-foreground/60 px-1 mb-2">
            <Settings2 className="w-3 h-3" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] font-mono italic">ENGINE_STACK</span>
          </div>
          
          <div className="grid gap-1.5 px-0.5">
            {["text", "vision", "stt", "tts", "image-gen", "music-gen", "director", "coder"].map((cat) => {
              const modelsInCategory = filteredModels.filter(m => m.category === cat);
              const showDropdown = modelsInCategory.length > 1;
              const isActive = activeCategory === cat;
              
              return (
                <div id={`model-item-${cat}`} key={cat} className={`p-2.5 rounded-sm border transition-all duration-300 ${isActive ? "bg-orange-500/5 border-orange-500/30 shadow-[inset_0_0_12px_rgba(249,115,22,0.03)]" : "bg-muted/10 border-border/40 hover:border-border/80"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase opacity-60 tracking-wider">0x{cat.substring(0,2).toUpperCase()} // {cat.replace("-", "_")}</span>
                    {isCategoryDisabled(cat) && <span className="text-[8px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded font-bold border border-red-500/20">LOW_RAM_LOCKED</span>}
                  </div>
                  
                  <div className="flex gap-2">
                    {showDropdown ? (
                      <Select 
                        value={selectedModels[cat]} 
                        onValueChange={(val) => setSelectedModels((prev: any) => ({ ...prev, [cat]: val }))}
                        disabled={isModelLoading}
                      >
                        <SelectTrigger className="h-7 flex-1 bg-black/20 border-border/50 text-[10px] font-mono rounded-none group hover:border-orange-500/20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-border/50 text-[10px] font-mono">
                          {Array.from(new Set(modelsInCategory.map(m => m.make))).map(make => (
                            <SelectGroup key={make}>
                              <SelectLabel className="text-[9px] text-muted-foreground/50 uppercase px-2 py-1 font-bold">{make}</SelectLabel>
                              {modelsInCategory.filter(m => m.make === make).map(m => (
                                <SelectItem key={m.id} value={m.id} className="text-[10px] focus:bg-orange-500/10 focus:text-orange-500" disabled={!!(m.minRam && m.minRam > systemRam)}>
                                  {m.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex-1 h-7 flex items-center px-2 bg-black/10 border border-border/30 text-[9px] font-mono text-muted-foreground/60 italic overflow-hidden whitespace-nowrap">
                        {modelsInCategory[0]?.name || "EMPTY"}
                      </div>
                    )}
                    <Button 
                      size="icon" 
                      variant="outline" 
                      className={`h-7 w-7 transition-all rounded-none relative overflow-hidden ${isActive ? "bg-orange-500 border-orange-500 text-white shadow-[0_0_10px_rgba(249,115,22,0.3)]" : "border-border/50 hover:border-orange-500/50"}`}
                      onClick={() => loadModel(cat)}
                      disabled={isModelLoading}
                    >
                      {isModelLoading && isActive ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin relative z-10" />
                          <div className="absolute inset-0 bg-black/20" />
                        </>
                      ) : <Download className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                  {isModelLoading && isActive && Object.values(useApp().loadingProgress).length > 0 && (
                    <div className="mt-2 space-y-1">
                      <Progress 
                        value={Object.values(useApp().loadingProgress).reduce((acc, curr) => acc + (curr.progress || 0), 0) / Object.values(useApp().loadingProgress).length} 
                        className="h-1 bg-black/40"
                      />
                      <div className="flex justify-between text-[7px] font-mono uppercase opacity-50">
                        <span>Loading_Assets_...</span>
                        <span>{Math.round(Object.values(useApp().loadingProgress).reduce((acc, curr) => acc + (curr.progress || 0), 0) / Object.values(useApp().loadingProgress).length)}%</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Compute Cluster Status (Optional Relay) */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between text-muted-foreground/60 px-1">
            <div className="flex items-center gap-2">
              <Zap className={`w-3 h-3 ${relayActive ? 'text-yellow-500' : 'text-zinc-500'}`} />
              <span className={`text-[9px] font-bold uppercase tracking-[0.2em] font-mono italic ${relayActive ? 'text-yellow-500/80' : 'text-zinc-500/80'}`}>
                {relayActive ? 'COMPUTE_RELAY_ACTIVE' : 'STANDALONE_MODE'}
              </span>
            </div>
            {relayActive && (
              <div className="flex items-center gap-1.5 bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20">
                <span className="text-[8px] font-mono text-yellow-400">{workerCount} NODES</span>
              </div>
            )}
          </div>
          <div className="px-4 py-3 rounded-sm bg-zinc-900 border border-border/40 space-y-3">
             {isElectron && !relayActive ? (
               <div className="space-y-3">
                 <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                      <p className="text-[10px] font-mono text-yellow-500 italic">Starting Relay Bridge...</p>
                    </div>
                    <p className="text-[8px] font-mono text-muted-foreground leading-tight">
                      Electron is initializing the local relay server to route external requests.
                    </p>
                 </div>
               </div>
             ) : (
               <>
                 <div className="flex items-start gap-3">
                   <div className={`w-1.5 h-1.5 rounded-full mt-1 ${relayActive ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'}`} />
                   <div className="space-y-1">
                     <p className="text-[10px] font-mono text-zinc-300">
                       {relayActive ? (isElectron ? 'Main Desktop Processor Active' : 'Local Relay Active') : 'Relay Mode Disabled'}
                     </p>
                     <p className="text-[8px] font-mono text-muted-foreground leading-tight">
                       {relayActive 
                         ? (isElectron 
                            ? "Running as primary relay. Your desktop is now a gateway for other instances."
                            : "This instance is sharing compute with the network. Other apps can send tasks to your browser.")
                         : "Processors are locked to this application only. No external task sharing is active."}
                     </p>
                   </div>
                 </div>
                 <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    <span className="text-[8px] font-mono text-muted-foreground">ENGINE_ROLE</span>
                    <span className={`text-[8px] font-mono ${relayActive ? (isElectron ? 'text-amber-400' : 'text-blue-400') : 'text-zinc-500'}`}>
                      {relayActive ? (isElectron ? 'MAIN_DESKTOP_PROCESSOR' : 'PRIMARY_COMPUTE_NODE') : 'LOCAL_ONLY'}
                    </span>
                 </div>
               </>
             )}
          </div>
        </section>

        {/* Activity Feed */}
        <section className="space-y-4 pt-2">
          <div className="flex items-center justify-between text-muted-foreground/60 px-1">
            <div className="flex items-center gap-2">
              <Activity className="w-3 h-3" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] font-mono italic">TELEMETRY</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-4 w-4 hover:text-red-500" 
              title="REBOOT_ENGINE_STACK"
              onClick={useApp().rebootEngine}
            >
              <Zap className="w-2.5 h-2.5" />
            </Button>
          </div>
          <div className="p-4 rounded-sm bg-zinc-900 dark:bg-black/40 border border-border/40 space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <Zap className="w-12 h-12 text-orange-500" />
            </div>

            <div className="space-y-2 relative">
              <div className="flex justify-between text-[9px] font-mono uppercase text-muted-foreground/70">
                <span>CTX_MEM_ALLOC</span>
                <span className="text-foreground">{(memoryUsage.used / 1024 / 1024).toFixed(1)} MB</span>
              </div>
              <div className="h-1 bg-muted/20 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]"
                  animate={{ width: `${(memoryUsage.used / (memoryUsage.total * (ramLimitPercent / 100))) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-3 relative">
              <div className="flex justify-between text-[9px] font-mono uppercase text-muted-foreground/70 tracking-tighter">
                <span>RAM_CAP_LIMIT</span>
                <span className="text-orange-500 font-bold tracking-normal">{ramLimitPercent}%</span>
              </div>
              <Slider 
                value={[ramLimitPercent]} 
                onValueChange={(val) => setRamLimitPercent(val[0])} 
                max={90} 
                min={10} 
                step={1}
                className="py-1"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3 relative border-t border-border/30 pt-4">
              <div className="space-y-2">
                <span className="text-[8px] font-mono text-muted-foreground/50 uppercase">RAG_STORE</span>
                <Switch 
                  checked={enableRAG} 
                  onCheckedChange={setEnableRAG}
                  className="scale-75 data-[state=checked]:bg-orange-600 ml-[-4px]"
                />
              </div>
              <div className="space-y-2">
                <span className="text-[8px] font-mono text-muted-foreground/50 uppercase">KOKORO_TTS</span>
                <Switch 
                  checked={speakEnabled} 
                  onCheckedChange={(val) => {
                    setSpeakEnabled(val);
                    if (val) ttsEngine.resume();
                  }}
                  className="scale-75 data-[state=checked]:bg-orange-600 ml-[-4px]"
                />
              </div>
              <div className="space-y-2">
                <span className="text-[8px] font-mono text-muted-foreground/50 uppercase">SAFE_ENGINE</span>
                <Switch 
                  checked={useApp().safeMode} 
                  onCheckedChange={useApp().setSafeMode}
                  className="scale-75 data-[state=checked]:bg-orange-600 ml-[-4px]"
                />
              </div>
              <div className="space-y-2">
                <span className="text-[8px] font-mono text-muted-foreground/50 uppercase">RELAY_BRIDGE</span>
                <Switch 
                  checked={enableRelayMode} 
                  onCheckedChange={setEnableRelayMode}
                  className="scale-75 data-[state=checked]:bg-yellow-600 ml-[-4px]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Live Logs */}
        <section className="space-y-4 pt-2 pb-10">
          <div className="flex items-center justify-between text-muted-foreground/60 px-1">
            <div className="flex items-center gap-2">
              <History className="w-3 h-3" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] font-mono italic">OPERATOR_LOGS</span>
            </div>
            <Button variant="ghost" size="icon" className="h-4 w-4 hover:text-orange-500" onClick={() => setShowLogs(!showLogs)}>
              <Maximize2 className="w-2.5 h-2.5" />
            </Button>
          </div>
          <div className="h-48 bg-zinc-950 border border-border/50 rounded-sm p-3 font-mono text-[9px] overflow-y-auto space-y-1.5 selection:bg-orange-500/40 relative">
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,3px_100%] opacity-20" />
            {logs.map((log, i) => (
              <div key={i} className={`flex gap-2 relative ${log.type === 'error' ? 'text-red-500' : log.type === 'success' ? 'text-green-500' : 'text-orange-500/80'}`}>
                <span className="opacity-40 shrink-0 font-bold">[{log.timestamp}]</span>
                <span className="break-all opacity-90">{log.message}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </section>
      </div>
    </aside>
  );
}
