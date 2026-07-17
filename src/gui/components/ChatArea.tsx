import { Loader2, Bot, Brain, ChevronDown, ChevronUp, History } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import React, { useState } from "react";
import type { RefObject } from "react";

import { ChatTabBar } from "./ChatAreaFuncs/ChatTabBar";
import { SystemWelcome } from "./ChatAreaFuncs/SystemWelcome";
import { MessageItem } from "./ChatAreaFuncs/MessageItem";
import { InputDock } from "./chat/InputDock";

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
  handleToolCall,
  handleMusicGen,
  scrollRef,
  onScroll,
  handleOptionSelect,
}: ChatAreaProps) {
  const {
    messages,
    isGenerating,
    isAnalyzing,
    isSummarizing,
    isModelLoading,
    loadingProgress,
    isModelReady,
    setInput,
    enableMMRS,
    mmrsMode,
    setMmrsMode,
    textModelQueue,
    directorModelQueue,
    visionModelQueue,
    imageModelQueue,
    musicModelQueue,
    isCoderMode,
    hasWebGPU,
    chatTabs,
    activeTabId,
    selectTab,
    openNewTab,
    closeTab,
    renameTab,
    livePermissionError,
    setLivePermissionError,
    logs,
    showLogs,
    setShowLogs,
    logEndRef,
  } = useApp();

  const [isThinkExpanded, setIsThinkExpanded] = useState(true);
  const prevLengthRef = React.useRef(messages.length);

  const [logsHeight, setLogsHeight] = useState(() => {
    const saved = localStorage.getItem("omnix_logs_height");
    return saved ? parseInt(saved, 10) : 180;
  });
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  React.useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newHeight = Math.max(40, Math.min(600, window.innerHeight - e.clientY));
      setLogsHeight(newHeight);
      localStorage.setItem("omnix_logs_height", newHeight.toString());
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Operator logs stateful filtering and counts
  const errorCount = logs.filter((l) => l.type === "error").length;
  const successCount = logs.filter((l) => l.type === "success").length;
  const infoCount = logs.filter((l) => l.type === "info").length;

  const [filterErrors, setFilterErrors] = useState(() => {
    const saved = localStorage.getItem("omnix_filter_errors");
    return saved !== "false";
  });
  const [filterSuccess, setFilterSuccess] = useState(() => {
    const saved = localStorage.getItem("omnix_filter_success");
    return saved !== "false";
  });
  const [filterInfo, setFilterInfo] = useState(() => {
    const saved = localStorage.getItem("omnix_filter_info");
    return saved !== "false";
  });

  React.useEffect(() => {
    localStorage.setItem("omnix_filter_errors", filterErrors.toString());
  }, [filterErrors]);

  React.useEffect(() => {
    localStorage.setItem("omnix_filter_success", filterSuccess.toString());
  }, [filterSuccess]);

  React.useEffect(() => {
    localStorage.setItem("omnix_filter_info", filterInfo.toString());
  }, [filterInfo]);

  const filteredLogs = logs.filter((log) => {
    if (log.type === "error" && !filterErrors) return false;
    if (log.type === "success" && !filterSuccess) return false;
    if (log.type === "info" && !filterInfo) return false;
    return true;
  });

  React.useEffect(() => {
    if (showLogs && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [filteredLogs, showLogs, logEndRef]);

  const totalProgress =
    Object.values(loadingProgress).length > 0
      ? Math.round(
          Object.values(loadingProgress).reduce(
            (acc, curr: any) => acc + (curr.progress || 0),
            0,
          ) / Object.values(loadingProgress).length,
        )
      : 0;

  React.useEffect(() => {
    if (scrollRef && "current" in scrollRef && scrollRef.current) {
      const container = scrollRef.current;
      const threshold = 180;
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <=
        threshold;

      const hasNewMessage = messages.length > prevLengthRef.current;
      const isLastUser =
        messages.length > 0 && messages[messages.length - 1].role === "user";

      if (hasNewMessage || isLastUser || isNearBottom) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (container) {
              container.scrollTop = container.scrollHeight;
            }
          });
        });
      }
      prevLengthRef.current = messages.length;
    }
  }, [
    messages,
    isGenerating,
    isModelLoading,
    isAnalyzing,
    isSummarizing,
    isThinkExpanded,
    scrollRef,
  ]);

  const extractThoughts = (
    content: string,
  ): { thoughts: string; cleanContent: string } | null => {
    const thinkRegex = /<think>([\s\S]*?)(?:<\/think>|$)/i;
    const thinkMatch = content.match(thinkRegex);
    if (thinkMatch) {
      const thoughts = thinkMatch[1].trim();
      const cleanContent = content.replace(thinkRegex, "").trim();
      return { thoughts, cleanContent };
    }

    const thoughtMatch = content.match(
      /<\|channel>thought\n([\s\S]*?)(?:<channel\|>|$)/,
    );
    if (thoughtMatch) {
      const thoughts = thoughtMatch[1].trim();
      const cleanContent = content.replace(thoughtMatch[0], "").trim();
      return { thoughts, cleanContent };
    }

    return null;
  };

  const latestThoughtMsg = [...messages]
    .reverse()
    .find(
      (m) =>
        m.role === "assistant" &&
        (m.content.includes("<think>") ||
          m.content.includes("<|channel>thought")),
    );

  const thoughtData = latestThoughtMsg
    ? extractThoughts(latestThoughtMsg.content)
    : null;

  return (
    <main className="flex-1 flex flex-col bg-background relative overflow-hidden h-full">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

      <ChatTabBar
        chatTabs={chatTabs || []}
        activeTabId={activeTabId}
        selectTab={selectTab}
        openNewTab={openNewTab}
        closeTab={closeTab}
        renameTab={renameTab}
        enableMMRS={enableMMRS}
        isCoderMode={isCoderMode}
        mmrsMode={mmrsMode}
        setMmrsMode={setMmrsMode}
        livePermissionError={!!livePermissionError}
        setLivePermissionError={setLivePermissionError}
      />

      {thoughtData && (
        <div className="border-b border-border/30 bg-muted/10 backdrop-blur-md shrink-0 transition-all duration-300">
          <div className="max-w-2xl mx-auto px-6 py-2.5 flex items-center justify-between select-none">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Brain className="w-3.5 h-3.5 text-orange-500" />
                <div className="absolute -inset-0.5 bg-orange-500/20 blur-sm rounded-full animate-pulse" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
                Orchestrator_Thinking_Process
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6 rounded-md text-zinc-500 hover:text-orange-500 hover:bg-zinc-800/50"
              onClick={() => setIsThinkExpanded(!isThinkExpanded)}
            >
              {isThinkExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>
          <AnimatePresence initial={false}>
            {isThinkExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="max-w-2xl mx-auto px-6 pb-4 pt-1 font-mono">
                  <div className="p-3 bg-zinc-950/50 border border-border/30 rounded-lg text-[11px] leading-relaxed text-zinc-400 max-h-36 overflow-y-auto whitespace-pre-wrap selection:bg-orange-500/30">
                    {thoughtData.thoughts}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <ScrollArea
          className="h-full"
          ref={scrollRef}
          viewportProps={{ onScroll }}
        >
          <div className="p-6 max-w-2xl mx-auto space-y-8">
            {messages.length === 0 && !isModelLoading && (
              <SystemWelcome
                isModelReady={isModelReady}
                hasWebGPU={!!hasWebGPU}
                setInput={setInput}
                handleToolCall={handleToolCall}
                handleMusicGen={handleMusicGen}
              />
            )}

            <AnimatePresence initial={false}>
              {messages
                .filter((m) => !m.hidden)
                .map((msg, i, filtered) => (
                  <MessageItem
                    key={i}
                    msg={msg}
                    index={i}
                    isLast={i === filtered.length - 1}
                    isGenerating={isGenerating}
                    handleOptionSelect={handleOptionSelect}
                    extractThoughts={extractThoughts}
                  />
                ))}

              {(isGenerating ||
                isAnalyzing ||
                isSummarizing ||
                isModelLoading ||
                textModelQueue.length > 0 ||
                directorModelQueue.length > 0 ||
                visionModelQueue.length > 0 ||
                imageModelQueue.length > 0 ||
                musicModelQueue.length > 0) &&
                (messages.length === 0 ||
                  messages[messages.length - 1].role !== "assistant" ||
                  isSummarizing ||
                  isAnalyzing ||
                  isModelLoading ||
                  textModelQueue.length +
                    directorModelQueue.length +
                    visionModelQueue.length +
                    imageModelQueue.length +
                    musicModelQueue.length >
                    0) && (
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
                            {isSummarizing ? (
                              "Summarizing context..."
                            ) : isModelLoading ? (
                              <div>
                                <div className="mb-1 uppercase tracking-widest text-[9px]">
                                  Engine_Activation_Sequence:{" "}
                                  {totalProgress > 0
                                    ? `${totalProgress}%`
                                    : "In Progress..."}
                                </div>
                                {Object.entries(loadingProgress).map(
                                  ([file, info]: [string, any]) => (
                                    <div
                                      key={file}
                                      className="text-[8px] opacity-70 flex justify-between gap-4"
                                    >
                                      <span className="truncate max-w-[150px]">
                                        {file}
                                      </span>
                                      <span>
                                        {info.progress
                                          ? `${Math.round(info.progress)}%`
                                          : "Downloading..."}
                                      </span>
                                    </div>
                                  ),
                                )}
                              </div>
                            ) : (
                              "Formulating response"
                            )}
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

      <InputDock
        handleSend={handleSend}
        analyzeImage={analyzeImage}
        handleToolCall={handleToolCall}
        handleMusicGen={handleMusicGen}
      />

      {showLogs ? (
        <div 
          style={{ height: `${logsHeight}px` }} 
          className="relative flex flex-col bg-zinc-950 border-t border-border/50 shrink-0"
        >
          {/* Splitter bar */}
          <div 
            onMouseDown={handleMouseDown}
            className={`absolute top-0 left-0 right-0 h-1 cursor-row-resize hover:bg-orange-500/40 transition-colors z-50 ${isDragging ? "bg-orange-500/60" : "bg-transparent"}`}
            title="Drag to resize Operator Logs"
          />
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-muted-foreground/60 px-4 py-2 sm:py-1.5 border-b border-border/30 shrink-0 bg-zinc-900/40 gap-2 sm:gap-0">
            <div className="flex flex-wrap items-center gap-2 select-none">
              <div className="flex items-center gap-2 mr-2">
                <History className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] font-mono italic">OPERATOR_LOGS</span>
              </div>
              
              <div className="flex items-center gap-1.5 font-mono text-[8px]">
                <button 
                  onClick={() => setFilterErrors(!filterErrors)}
                  className={`px-1.5 py-0.5 rounded-sm transition-all flex items-center gap-1 border ${
                    filterErrors 
                      ? "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20" 
                      : "bg-transparent text-zinc-600 border-zinc-800 hover:text-zinc-500"
                  }`}
                  title="Toggle error messages"
                >
                  <span className={`w-1 h-1 rounded-full ${filterErrors ? "bg-red-500 animate-pulse" : "bg-zinc-600"}`} />
                  <span>ERRORS ({errorCount})</span>
                </button>

                <button 
                  onClick={() => setFilterSuccess(!filterSuccess)}
                  className={`px-1.5 py-0.5 rounded-sm transition-all flex items-center gap-1 border ${
                    filterSuccess 
                      ? "bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20" 
                      : "bg-transparent text-zinc-600 border-zinc-800 hover:text-zinc-500"
                  }`}
                  title="Toggle success messages"
                >
                  <span className={`w-1 h-1 rounded-full ${filterSuccess ? "bg-green-500 animate-pulse" : "bg-zinc-600"}`} />
                  <span>SUCCESS ({successCount})</span>
                </button>

                <button 
                  onClick={() => setFilterInfo(!filterInfo)}
                  className={`px-1.5 py-0.5 rounded-sm transition-all flex items-center gap-1 border ${
                    filterInfo 
                      ? "bg-orange-500/10 text-orange-400 border-orange-500/30 hover:bg-orange-500/20" 
                      : "bg-transparent text-zinc-600 border-zinc-800 hover:text-zinc-500"
                  }`}
                  title="Toggle info messages"
                >
                  <span className={`w-1 h-1 rounded-full ${filterInfo ? "bg-orange-500 animate-pulse" : "bg-zinc-600"}`} />
                  <span>INFO ({infoCount})</span>
                </button>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5 hover:text-orange-500 text-muted-foreground/50 hover:bg-zinc-800 self-end sm:self-auto" 
              onClick={() => setShowLogs(false)}
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </Button>
          </div>
          
          <div className="flex-1 p-3 font-mono text-[9px] overflow-y-auto space-y-1.5 selection:bg-orange-500/40 relative bg-zinc-950 custom-scrollbar">
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,3px_100%] opacity-20" />
            {filteredLogs.length === 0 ? (
              <div className="text-[9px] text-zinc-600 italic">
                {logs.length === 0 ? "No logs recorded yet..." : "No logs match current active filters..."}
              </div>
            ) : (
              filteredLogs.map((log, i) => (
                <div key={i} className={`flex gap-2 relative ${log.type === 'error' ? 'text-red-500' : log.type === 'success' ? 'text-green-500' : 'text-orange-500/80'}`}>
                  <span className="opacity-40 shrink-0 font-bold">[{log.timestamp}]</span>
                  <span className="break-all opacity-90">{log.message}</span>
                </div>
              ))
            )}
            <div ref={logEndRef as any} />
          </div>
        </div>
      ) : (
        <div 
          className="flex items-center justify-between text-muted-foreground/40 px-4 py-1.5 border-t border-border/30 bg-zinc-950 shrink-0 select-none hover:text-muted-foreground/60 transition-colors cursor-pointer" 
          onClick={() => setShowLogs(true)}
        >
          <div className="flex items-center gap-2">
            <History className="w-3 text-orange-500/70 h-3" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] font-mono italic flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>OPERATOR_LOGS (COLLAPSED)</span>
              {logs.length > 0 && (
                <span className="normal-case tracking-normal not-italic text-muted-foreground/30 font-mono text-[9px] inline-flex items-center gap-2">
                  <span className={errorCount > 0 ? "text-red-500/50" : ""}>Errors: {errorCount}</span>
                  <span className="opacity-30">|</span>
                  <span className={successCount > 0 ? "text-green-500/50" : ""}>Success: {successCount}</span>
                  <span className="opacity-30">|</span>
                  <span>Info: {infoCount}</span>
                </span>
              )}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-4 w-4 hover:text-orange-500 text-muted-foreground/40 hover:bg-zinc-800" 
          >
            <ChevronUp className="w-3 h-3" />
          </Button>
        </div>
      )}
    </main>
  );
}
