import { Bot, User, Loader2, Send, Image as ImageIcon, Volume2, Sparkles, Code2, Layout, Mic, MicOff, Music, X, Monitor, Activity, Workflow } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Message } from "@shared/types";
import type { RefObject } from "react";
import { useApp } from "@/context/AppContext";

interface ChatAreaProps {
  handleSend: () => void;
  analyzeImage: (file: File) => void;
  speak: (text: string) => void;
  handleToolCall: (toolCall: any) => void;
  handleMusicGen: (prompt: string) => void;
  activeTab: string;
  setActiveTab: (tab: "chat" | "sandbox" | "gallery") => void;
  scrollRef: RefObject<HTMLDivElement | null>;
  onScroll?: () => void;
  generatedImage: string | null;
  sandboxFiles: any[];
  isRecording: boolean;
  toggleRecording: () => void;
  handleOptionSelect: (option: string) => void;
  pendingImage: string | null;
  setPendingImage: (val: string | null) => void;
}

export function ChatArea({
  handleSend,
  analyzeImage,
  speak,
  handleToolCall,
  handleMusicGen,
  activeTab,
  setActiveTab,
  scrollRef,
  onScroll,
  generatedImage,
  sandboxFiles,
  isRecording,
  toggleRecording,
  handleOptionSelect,
  pendingImage,
  setPendingImage
}: ChatAreaProps) {
  const { 
    messages, 
    isGenerating, 
    isAnalyzing,
    isSummarizing, 
    isModelLoading, 
    loadingProgress, 
    isModelReady, 
    input, 
    setInput,
    speakEnabled,
    textModelQueue,
    directorModelQueue,
    visionModelQueue,
    imageModelQueue,
    musicModelQueue,
    isCoderMode,
    isLiveMode,
    toggleLiveMode,
    hasWebGPU,
    currentStepIndex,
    isPipelineRunning,
    startPipeline,
    stopPipeline
  } = useApp();

  const totalProgress = Object.values(loadingProgress).length > 0
    ? Math.round(Object.values(loadingProgress).reduce((acc, curr) => acc + (curr.progress || 0), 0) / Object.values(loadingProgress).length)
    : 0;

  return (
    <main className="flex-1 flex flex-col bg-background relative overflow-hidden h-full">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollRef} viewportProps={{ onScroll }}>
          <div className="p-6 max-w-2xl mx-auto space-y-8">
          {messages.length === 0 && !isModelLoading && (
            <div className="py-12 space-y-12">
              <div className="text-center space-y-4">
                <div className="relative inline-block">
                  <div className="w-20 h-20 rounded-xl bg-zinc-900 border border-orange-500/30 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(249,115,22,0.1)] group">
                    <Sparkles className="w-10 h-10 text-orange-500 group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute -inset-1 bg-orange-500/10 blur-xl rounded-full opacity-50 pulse-slow" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-mono font-bold tracking-tighter uppercase text-foreground">Omnix_Studio_v0.2</h2>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.3em] opacity-40">Orchestration_Interface</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
                <div className="p-4 rounded-sm border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all group cursor-pointer" onClick={() => setInput("Describe the current context and available models.")}>
                  <div className="flex items-center gap-3 mb-2">
                    <Activity className="w-4 h-4 text-orange-500/70" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground/80">System_Status</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed uppercase opacity-60">Query the orchestration engine for status and capabilities.</p>
                </div>

                <div className="p-4 rounded-sm border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all group cursor-pointer" onClick={() => (document.getElementById('vision-upload') as HTMLInputElement)?.click()}>
                  <div className="flex items-center gap-3 mb-2">
                    <ImageIcon className="w-4 h-4 text-blue-500/70" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground/80">Vision_Analysis</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed uppercase opacity-60">Upload imagery for multi-modal analysis and extraction.</p>
                </div>

                <div className="p-4 rounded-sm border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all group cursor-pointer" onClick={() => handleToolCall({tool: "image_gen", params: {prompt: "A futuristic command center in space"}})}>
                  <div className="flex items-center gap-3 mb-2">
                    <Sparkles className="w-4 h-4 text-purple-500/70" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground/80">Visual_Synthesis</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed uppercase opacity-60">Generate high-fidelity visual assets using local FLUX nodes.</p>
                </div>

                <div className="p-4 rounded-sm border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all group cursor-pointer" onClick={() => handleMusicGen("Ambient cinematic sci-fi background")}>
                  <div className="flex items-center gap-3 mb-2">
                    <Music className="w-4 h-4 text-pink-500/70" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground/80">Audio_Composition</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed uppercase opacity-60">Synthesize sonic landscapes and musical motifs locally.</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-8 py-4 opacity-30">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${isModelReady ? "bg-green-400" : "bg-zinc-600"}`} />
                  <span className="text-[8px] font-mono uppercase tracking-[0.2em] font-bold italic">Engine_Locked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  <span className="text-[8px] font-mono uppercase tracking-[0.2em] font-bold italic">{hasWebGPU ? "GPU_ACCEL" : "CPU_ONLY"}</span>
                </div>
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.filter(m => !m.hidden).map((msg, i, filtered) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-8 h-8 rounded-sm flex items-center justify-center shrink-0 border relative ${
                  msg.role === "user" ? "bg-zinc-900 border-orange-500/50 text-orange-500" : "bg-zinc-900 border-border/50"
                }`}>
                  {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-background border border-border/50 flex items-center justify-center">
                    <div className={`w-1 h-1 rounded-full ${msg.role === 'user' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                  </div>
                </div>
                <div className={`max-w-[85%] space-y-2 ${msg.role === "user" ? "text-right ml-auto" : "mr-auto"}`}>
                  <div className={`relative px-5 py-4 text-sm leading-relaxed overflow-hidden border transition-all duration-500 ${
                    msg.role === "user" 
                      ? "bg-zinc-950/40 border-orange-500/20 text-foreground rounded-r-none rounded-l-xl" 
                      : "bg-muted/10 border-border/30 text-foreground rounded-l-none rounded-r-xl backdrop-blur-md"
                  }`}>
                    {msg.role === 'user' && (
                      <div className="absolute top-0 right-0 p-1 opacity-20 pointer-events-none">
                        <Activity className="w-16 h-16 text-orange-500 stroke-[1]" />
                      </div>
                    )}
                    {msg.isQueued && (
                      <div className="flex items-center gap-2 mb-2 text-[10px] font-mono font-bold text-orange-500/70 uppercase tracking-[0.2em]">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        [ASYNC_QUEUE] PROCESSING_...
                      </div>
                    )}
                    <div className="markdown-content relative z-10 selection:bg-orange-500/30">
                      {(() => {
                        const thoughtMatch = msg.content.match(/<\|channel>thought\n([\s\S]*?)<channel\|>/);
                        if (thoughtMatch) {
                          const thought = thoughtMatch[1];
                          const rest = msg.content.replace(thoughtMatch[0], "").trim();
                          return (
                            <div className="space-y-4">
                              <div className="p-3 bg-muted/80 border border-border rounded-lg text-xs text-muted-foreground italic font-mono">
                                <div className="flex items-center gap-2 mb-1 text-[10px] uppercase tracking-widest font-bold text-muted-foreground/70">
                                  <Sparkles className="w-3 h-3" />
                                  Reasoning
                                </div>
                                {thought}
                              </div>
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>{rest}</ReactMarkdown>
                            </div>
                          );
                        }
                        return <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>;
                      })()}
                    </div>
                    {msg.image && (
                      <div className="mt-2 rounded-lg overflow-hidden border border-border max-sm">
                        <img src={msg.image} alt="Uploaded" className="w-full h-auto" referrerPolicy="no-referrer" />
                      </div>
                    )}
                    {msg.audio && (
                      <div className="mt-2 rounded-lg overflow-hidden border border-border bg-muted p-2">
                        <audio src={msg.audio} controls className="w-full h-8" />
                      </div>
                    )}
                    {msg.options && msg.options.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {msg.options.map((opt, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            className="bg-muted border-border hover:bg-accent hover:text-orange-500 text-xs rounded-xl"
                            onClick={() => handleOptionSelect(opt)}
                          >
                            {opt}
                          </Button>
                        ))}
                      </div>
                    )}
                    {isGenerating && i === filtered.length - 1 && msg.role === "assistant" && (
                      <span className="inline-block w-1 h-4 ml-1 bg-orange-500 animate-pulse align-middle" />
                    )}
                  </div>
                  {msg.stats && msg.role === "assistant" && (
                    <div className="flex gap-3 text-[9px] text-muted-foreground font-mono uppercase tracking-tighter">
                      <span>{msg.stats.tps} tps</span>
                      <span>{msg.stats.tokens} tokens</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {(isGenerating || isAnalyzing || isSummarizing || isModelLoading || textModelQueue.length > 0 || directorModelQueue.length > 0 || visionModelQueue.length > 0 || imageModelQueue.length > 0 || musicModelQueue.length > 0) && 
             (messages.length === 0 || messages[messages.length - 1].role !== "assistant" || isSummarizing || isAnalyzing || isModelLoading || (textModelQueue.length + directorModelQueue.length + visionModelQueue.length + imageModelQueue.length + musicModelQueue.length) > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border bg-muted border-border">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="max-w-[85%] space-y-2">
                  <div className="inline-block rounded-2xl px-4 py-2.5 text-sm leading-relaxed bg-muted/50 text-foreground border border-border backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-orange-500">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span className="text-[10px] font-bold uppercase tracking-wider animate-pulse whitespace-pre-wrap">
                        {isSummarizing 
                          ? "Summarizing context..." 
                          : isModelLoading 
                            ? (
                                <div>
                                  <div className="mb-1 uppercase tracking-widest text-[9px]">
                                    Engine_Activation_Sequence: {totalProgress > 0 ? `${totalProgress}%` : "In Progress..."}
                                  </div>
                                  {Object.entries(loadingProgress).map(([file, info]) => (
                                    <div key={file} className="text-[8px] opacity-70 flex justify-between gap-4">
                                      <span className="truncate max-w-[150px]">{file}</span>
                                      <span>{info.progress ? `${Math.round(info.progress)}%` : "Downloading..."}</span>
                                    </div>
                                  ))}
                                </div>
                              )
                            : "Formulating response"}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>

    {/* Input Area */}
      <div className="p-6 border-t border-border bg-background/50 backdrop-blur-xl shrink-0">
        <div className="max-w-2xl mx-auto relative">
          {pendingImage && (
            <div className="mb-3 relative inline-block">
              <img src={pendingImage} className="h-20 w-20 object-cover rounded-lg border border-border" />
              <button 
                type="button"
                onClick={() => setPendingImage(null)}
                className="absolute -top-2 -right-2 bg-muted border border-border rounded-full p-1 text-muted-foreground hover:text-foreground shadow-xl"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <form 
            className="flex gap-2" 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          >
            <div className="relative flex-1">
              <Input
                placeholder={isModelReady ? "Command the studio..." : "Initializing engine..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="bg-muted border-border h-12 pl-4 pr-12 focus-visible:ring-orange-500/50 rounded-xl"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className={`h-8 w-8 rounded-lg ${isRecording && !isLiveMode ? "text-red-500 bg-red-500/10 hover:bg-red-500/20" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
                  onClick={toggleRecording}
                  disabled={isLiveMode}
                >
                  {isRecording ? <MicOff className="w-4 h-4 animate-pulse" /> : <Mic className="w-4 h-4" />}
                </Button>
                <Button 
                  type="submit"
                  size="icon"
                  className="h-8 w-8 bg-orange-600 hover:bg-orange-500 text-white rounded-lg"
                  disabled={!input.trim() && !pendingImage}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </form>
          
          <div className="flex items-center gap-4 mt-3 px-2">
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="h-7 text-[10px] text-muted-foreground hover:text-orange-500 gap-1.5" onClick={() => (document.getElementById('vision-upload') as HTMLInputElement)?.click()}>
                <ImageIcon className="w-3 h-3" />
                Vision
              </Button>
              <input type="file" id="vision-upload" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && analyzeImage(e.target.files[0])} />

              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-7 text-[10px] gap-1.5 ${isLiveMode ? "text-red-500 hover:text-red-400 bg-red-500/10" : "text-muted-foreground hover:text-orange-500"}`} 
                onClick={toggleLiveMode}
                title="Toggle Live Mode (Screen + Voice)"
              >
                <Monitor className={`w-3 h-3 ${isLiveMode ? "animate-pulse" : ""}`} />
                Live
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-7 text-[10px] gap-1.5 ${speakEnabled ? 'text-muted-foreground hover:text-orange-500' : 'text-muted-foreground/30 cursor-not-allowed'}`} 
                title={speakEnabled ? "Speak input text" : "Enable 'Speak Responses' in sidebar to use TTS"}
                onClick={() => speak(input)} 
                disabled={!input.trim()}
              >
                <Volume2 className="w-3 h-3" />
                Speak
              </Button>
              
              <Button variant="ghost" size="sm" className="h-7 text-[10px] text-muted-foreground hover:text-orange-500 gap-1.5" onClick={() => handleToolCall({tool: "image_gen", params: {prompt: input}})} disabled={!input.trim()}>
                <Sparkles className="w-3 h-3" />
                Generate
              </Button>

              <Button variant="ghost" size="sm" className="h-7 text-[10px] text-muted-foreground hover:text-orange-500 gap-1.5" onClick={() => handleMusicGen(input)} disabled={!input.trim()}>
                <Music className="w-3 h-3" />
                Music
              </Button>

              {isCoderMode && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`h-7 text-[10px] gap-1.5 ${isPipelineRunning ? "text-orange-500 bg-orange-500/10" : "text-muted-foreground hover:text-orange-500"}`} 
                  onClick={() => isPipelineRunning ? stopPipeline() : startPipeline(input)}
                  disabled={!input.trim() && !isPipelineRunning}
                >
                  <Workflow className={`w-3 h-3 ${isPipelineRunning ? "animate-spin" : ""}`} />
                  {isPipelineRunning ? "Abort Pipeline" : "Build Project"}
                </Button>
              )}
            </div>
            <Separator orientation="vertical" className="h-3 bg-border" />
            <div className="flex gap-2">
              {sandboxFiles.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`h-7 text-[10px] gap-1.5 ${activeTab === 'sandbox' ? 'text-orange-500' : 'text-muted-foreground'}`}
                  onClick={() => setActiveTab('sandbox')}
                >
                  <Code2 className="w-3 h-3" />
                  Sandbox
                </Button>
              )}
              {generatedImage && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`h-7 text-[10px] gap-1.5 ${activeTab === 'gallery' ? 'text-orange-500' : 'text-muted-foreground'}`}
                  onClick={() => setActiveTab('gallery')}
                >
                  <Layout className="w-3 h-3" />
                  Gallery
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
