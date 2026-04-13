import { Bot, User, Loader2, Send, Image as ImageIcon, Volume2, Sparkles, Code2, Layout, Mic, MicOff, Music, X, Monitor } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Message } from "../types";
import type { RefObject } from "react";
import { useApp } from "../context/AppContext";

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
    toggleLiveMode
  } = useApp();

  return (
    <main className="flex-1 flex flex-col bg-[#080808] relative overflow-hidden h-full">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
      
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" ref={scrollRef} viewportProps={{ onScroll }}>
          <div className="p-6 max-w-2xl mx-auto space-y-8">
          {messages.length === 0 && (
            <div className="py-20 text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto shadow-2xl">
                <Bot className="w-8 h-8 text-orange-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-zinc-200">Local Multi-Modal Studio</h2>
                <p className="text-sm text-zinc-500 max-w-sm mx-auto">
                  Orchestrate vision, speech, and image generation models locally. 
                  Try asking to "generate an image of a cat" or "analyze this picture".
                </p>
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.filter(m => !m.hidden).map((msg, i, filtered) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                  msg.role === "user" ? "bg-orange-600 border-orange-500" : "bg-zinc-900 border-zinc-800"
                }`}>
                  {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`max-w-[85%] space-y-2 ${msg.role === "user" ? "text-right ml-auto" : "mr-auto"}`}>
                  <div className={`block rounded-2xl px-4 py-2.5 text-sm leading-relaxed overflow-hidden ${
                    msg.role === "user" 
                      ? "bg-zinc-100 text-zinc-950" 
                      : "bg-zinc-900/50 text-zinc-200 border border-zinc-800/50 backdrop-blur-sm"
                  }`}>
                    {msg.isQueued && (
                      <div className="flex items-center gap-2 mb-1.5 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Queued for processing...
                      </div>
                    )}
                    <div className="markdown-content">
                      {(() => {
                        const thoughtMatch = msg.content.match(/<\|channel>thought\n([\s\S]*?)<channel\|>/);
                        if (thoughtMatch) {
                          const thought = thoughtMatch[1];
                          const rest = msg.content.replace(thoughtMatch[0], "").trim();
                          return (
                            <div className="space-y-4">
                              <div className="p-3 bg-zinc-950/50 border border-zinc-800 rounded-lg text-xs text-zinc-400 italic font-mono">
                                <div className="flex items-center gap-2 mb-1 text-[10px] uppercase tracking-widest font-bold text-zinc-500">
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
                      <div className="mt-2 rounded-lg overflow-hidden border border-zinc-800 max-sm">
                        <img src={msg.image} alt="Uploaded" className="w-full h-auto" referrerPolicy="no-referrer" />
                      </div>
                    )}
                    {msg.audio && (
                      <div className="mt-2 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 p-2">
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
                            className="bg-zinc-950 border-zinc-800 hover:bg-zinc-800 hover:text-orange-500 text-xs rounded-xl"
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
                    <div className="flex gap-3 text-[9px] text-zinc-600 font-mono uppercase tracking-tighter">
                      <span>{msg.stats.tps} tps</span>
                      <span>{msg.stats.tokens} tokens</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {(isGenerating || isAnalyzing || isSummarizing || (isModelLoading && !isCoderMode && messages.length > 0) || textModelQueue.length > 0 || directorModelQueue.length > 0 || visionModelQueue.length > 0 || imageModelQueue.length > 0 || musicModelQueue.length > 0) && 
             (messages.length === 0 || messages[messages.length - 1].role !== "assistant" || isSummarizing || isAnalyzing || (textModelQueue.length + directorModelQueue.length + visionModelQueue.length + imageModelQueue.length + musicModelQueue.length) > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border bg-zinc-900 border-zinc-800">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="max-w-[85%] space-y-2">
                  <div className="inline-block rounded-2xl px-4 py-2.5 text-sm leading-relaxed bg-zinc-900/50 text-zinc-200 border border-zinc-800/50 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-orange-500">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span className="text-[10px] font-bold uppercase tracking-wider animate-pulse">
                        {isSummarizing ? "Summarizing context..." : "Formulating response"}
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
      <div className="p-6 border-t border-zinc-800 bg-zinc-950/50 backdrop-blur-xl shrink-0">
        <div className="max-w-2xl mx-auto relative">
          {pendingImage && (
            <div className="mb-3 relative inline-block">
              <img src={pendingImage} className="h-20 w-20 object-cover rounded-lg border border-zinc-800" />
              <button 
                type="button"
                onClick={() => setPendingImage(null)}
                className="absolute -top-2 -right-2 bg-zinc-900 border border-zinc-800 rounded-full p-1 text-zinc-400 hover:text-white shadow-xl"
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
                className="bg-zinc-900 border-zinc-800 h-12 pl-4 pr-12 focus-visible:ring-orange-500/50 rounded-xl"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className={`h-8 w-8 rounded-lg ${isRecording && !isLiveMode ? "text-red-500 bg-red-500/10 hover:bg-red-500/20" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"}`}
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
              <Button variant="ghost" size="sm" className="h-7 text-[10px] text-zinc-500 hover:text-orange-500 gap-1.5" onClick={() => (document.getElementById('vision-upload') as HTMLInputElement)?.click()}>
                <ImageIcon className="w-3 h-3" />
                Vision
              </Button>
              <input type="file" id="vision-upload" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && analyzeImage(e.target.files[0])} />

              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-7 text-[10px] gap-1.5 ${isLiveMode ? "text-red-500 hover:text-red-400 bg-red-500/10" : "text-zinc-500 hover:text-orange-500"}`} 
                onClick={toggleLiveMode}
                title="Toggle Live Mode (Screen + Voice)"
              >
                <Monitor className={`w-3 h-3 ${isLiveMode ? "animate-pulse" : ""}`} />
                Live
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className={`h-7 text-[10px] gap-1.5 ${speakEnabled ? 'text-zinc-500 hover:text-orange-500' : 'text-zinc-700 cursor-not-allowed'}`} 
                title={speakEnabled ? "Speak input text" : "Enable 'Speak Responses' in sidebar to use TTS"}
                onClick={() => speak(input)} 
                disabled={!input.trim()}
              >
                <Volume2 className="w-3 h-3" />
                Speak
              </Button>
              
              <Button variant="ghost" size="sm" className="h-7 text-[10px] text-zinc-500 hover:text-orange-500 gap-1.5" onClick={() => handleToolCall({tool: "image_gen", params: {prompt: input}})} disabled={!input.trim()}>
                <Sparkles className="w-3 h-3" />
                Generate
              </Button>

              <Button variant="ghost" size="sm" className="h-7 text-[10px] text-zinc-500 hover:text-orange-500 gap-1.5" onClick={() => handleMusicGen(input)} disabled={!input.trim()}>
                <Music className="w-3 h-3" />
                Music
              </Button>
            </div>
            <Separator orientation="vertical" className="h-3 bg-zinc-800" />
            <div className="flex gap-2">
              {sandboxFiles.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`h-7 text-[10px] gap-1.5 ${activeTab === 'sandbox' ? 'text-orange-500' : 'text-zinc-500'}`}
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
                  className={`h-7 text-[10px] gap-1.5 ${activeTab === 'gallery' ? 'text-orange-500' : 'text-zinc-500'}`}
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
