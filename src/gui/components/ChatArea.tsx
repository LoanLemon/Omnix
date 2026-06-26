import {
  Bot,
  User,
  Loader2,
  Send,
  Image as ImageIcon,
  Volume2,
  Sparkles,
  Code2,
  Layout,
  Mic,
  MicOff,
  Music,
  X,
  Monitor,
  Activity,
  Workflow,
  Plus,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Message } from "@shared/types";
import React, { useState } from "react";
import type { RefObject } from "react";
import { ChevronDown, ChevronUp, Brain, ExternalLink } from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { useApp } from "@/context/AppContext";
import { tts } from "@/lib/tts";

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
  setPendingImage,
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
    setSpeakEnabled,
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
    stopPipeline,
    chatTabs,
    activeTabId,
    selectTab,
    openNewTab,
    closeTab,
    renameTab,
    livePermissionError,
    setLivePermissionError,
  } = useApp();

  const handleExportTab = (tab: any) => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(tab, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute(
      "download",
      `${tab.name.replace(/\s+/g, "_")}_export.json`,
    );
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleRelabelTab = (tabId: string, currentName: string) => {
    const newName = window.prompt("Enter new tab name:", currentName);
    if (newName && newName.trim() !== "") {
      renameTab(tabId, newName.trim());
    }
  };

  const totalProgress =
    Object.values(loadingProgress).length > 0
      ? Math.round(
          Object.values(loadingProgress).reduce(
            (acc, curr) => acc + (curr.progress || 0),
            0,
          ) / Object.values(loadingProgress).length,
        )
      : 0;

  const [isThinkExpanded, setIsThinkExpanded] = useState(true);

  const prevLengthRef = React.useRef(messages.length);

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

      {/* Horizontally scrolling tab bar */}
      <div className="flex items-center justify-between border-b border-border/30 bg-muted/5 shrink-0 px-4 py-2 mt-1 select-none overflow-x-auto gap-2 scrollbar-none">
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-[80%] scrollbar-none py-1">
          {(chatTabs || []).map((tab: any) => {
            const isActive = tab.id === activeTabId;
            const isTemp = tab.isTemporary || String(tab.id).startsWith("-");
            return (
              <ContextMenu key={tab.id}>
                <ContextMenuTrigger
                  onClick={() => selectTab(tab.id)}
                  className={`group flex items-center gap-2 h-7 px-3 rounded-md text-xs border font-mono transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-zinc-900 border-orange-500/50 text-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.1)] font-bold"
                      : "bg-transparent border-zinc-800 text-muted-foreground hover:bg-zinc-800/30 hover:text-foreground"
                  }`}
                >
                  {isTemp ? (
                    <span className="flex items-center gap-1 text-[8px] px-1 py-0.5 rounded bg-red-950/40 border border-red-500/20 text-red-400 font-extrabold uppercase animate-pulse">
                      TEMP
                    </span>
                  ) : (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.6)]" : "bg-zinc-600"}`}
                    />
                  )}

                  <span className="truncate max-w-[100px]" title={tab.name}>
                    {tab.name}
                  </span>

                  {/* Close Button unless it's the last one remaining */}
                  {(chatTabs || []).length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        closeTab(tab.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 h-4 w-4 rounded-full flex items-center justify-center hover:bg-zinc-800 hover:text-red-500 text-zinc-500 transition-all text-[10px]"
                      title="Close and purge tab"
                    >
                      ×
                    </button>
                  )}
                </ContextMenuTrigger>
                <ContextMenuContent className="w-48 bg-zinc-950 border-zinc-800 text-zinc-300 font-mono text-xs">
                  <ContextMenuItem
                    className="focus:bg-zinc-900 focus:text-white cursor-pointer"
                    onClick={() => handleRelabelTab(tab.id, tab.name)}
                  >
                    Relabel
                  </ContextMenuItem>
                  <ContextMenuItem
                    className="focus:bg-zinc-900 focus:text-white cursor-pointer"
                    onClick={() => handleExportTab(tab)}
                  >
                    Export
                  </ContextMenuItem>
                  {(chatTabs || []).length > 1 && (
                    <>
                      <ContextMenuSeparator className="bg-zinc-800" />
                      <ContextMenuItem
                        className="focus:bg-red-950 focus:text-red-400 text-red-400 cursor-pointer"
                        onClick={() => closeTab(tab.id)}
                      >
                        Close
                      </ContextMenuItem>
                    </>
                  )}
                </ContextMenuContent>
              </ContextMenu>
            );
          })}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openNewTab(false)}
            className="h-7 px-2 bg-zinc-900 border border-border/40 hover:bg-accent text-[9px] font-mono hover:text-orange-500 font-bold flex items-center gap-1"
            title="Open a new standard archived chat tab (id: 0)"
          >
            <Plus className="w-3 h-3 text-orange-500" />
            <span>+ CHAT</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openNewTab(true)}
            className="h-7 px-2 bg-zinc-900/40 border border-red-950/30 hover:bg-red-950/20 text-[9px] font-mono hover:text-red-400 text-zinc-400 hover:border-red-500/30 flex items-center gap-1"
            title="Open a temporary session. Purged on close/API response!"
          >
            <Clock className="w-3 h-3 text-red-500/70" />
            <span>+ TEMP</span>
          </Button>
        </div>
      </div>

      {livePermissionError && (
        <div className="mx-6 mt-4 p-4 rounded bg-red-950/35 border border-red-500/20 text-foreground relative z-10 animate-in fade-in duration-300">
          <div className="flex gap-3">
            <div className="p-1.5 rounded bg-red-500/10 text-red-400 h-fit">
              <Monitor className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-red-400">
                Screen Share Permission Denied or Not Supported
              </h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed uppercase">
                Please allow screen capture permission when prompted. If the
                prompt does not appear, or you face any issues, you can also
                open the application in a new tab.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <a
                  href={window.location.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-mono font-bold bg-orange-500 hover:bg-orange-600 text-black rounded transition-all"
                >
                  <ExternalLink className="w-3 h-3 text-black" />
                  OPEN OMNIX IN NEW TAB
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2.5 text-[9px] font-mono hover:text-foreground text-zinc-500 hover:bg-zinc-800/30"
                  onClick={() => setLivePermissionError(false)}
                >
                  DISMISS
                </Button>
              </div>
            </div>
            <button
              onClick={() => setLivePermissionError(false)}
              className="text-zinc-500 hover:text-foreground transition-colors text-sm font-mono self-start"
            >
              ×
            </button>
          </div>
        </div>
      )}

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
              <div className="py-12 space-y-12">
                <div className="text-center space-y-4">
                  <div className="relative inline-block">
                    <div className="w-20 h-20 rounded-xl bg-zinc-900 border border-orange-500/30 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(249,115,22,0.1)] group">
                      <Sparkles className="w-10 h-10 text-orange-500 group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute -inset-1 bg-orange-500/10 blur-xl rounded-full opacity-50 pulse-slow" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-2xl font-mono font-bold tracking-tighter uppercase text-foreground">
                      OMNIX_V0.6
                    </h2>
                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.3em] opacity-40">
                      Orchestration_Interface
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
                  <div
                    className="p-4 rounded-sm border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all group cursor-pointer"
                    onClick={() =>
                      setInput(
                        "Describe the current context and available models.",
                      )
                    }
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Activity className="w-4 h-4 text-orange-500/70" />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground/80">
                        System_Status
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed uppercase opacity-60">
                      Query the orchestration engine for status and
                      capabilities.
                    </p>
                  </div>

                  <div
                    className="p-4 rounded-sm border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all group cursor-pointer"
                    onClick={() =>
                      (
                        document.getElementById(
                          "vision-upload",
                        ) as HTMLInputElement
                      )?.click()
                    }
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <ImageIcon className="w-4 h-4 text-blue-500/70" />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground/80">
                        Vision_Analysis
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed uppercase opacity-60">
                      Upload imagery for multi-modal analysis and extraction.
                    </p>
                  </div>

                  <div
                    className="p-4 rounded-sm border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all group cursor-pointer"
                    onClick={() =>
                      handleToolCall({
                        tool: "image_gen",
                        params: {
                          prompt: "A futuristic command center in space",
                        },
                      })
                    }
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Sparkles className="w-4 h-4 text-purple-500/70" />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground/80">
                        Visual_Synthesis
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed uppercase opacity-60">
                      Generate high-fidelity visual assets using local FLUX
                      nodes.
                    </p>
                  </div>

                  <div
                    className="p-4 rounded-sm border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all group cursor-pointer"
                    onClick={() =>
                      handleMusicGen("Ambient cinematic sci-fi background")
                    }
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Music className="w-4 h-4 text-pink-500/70" />
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground/80">
                        Audio_Composition
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed uppercase opacity-60">
                      Synthesize sonic landscapes and musical motifs locally.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-8 py-4 opacity-30">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${isModelReady ? "bg-green-400" : "bg-zinc-600"}`}
                    />
                    <span className="text-[8px] font-mono uppercase tracking-[0.2em] font-bold italic">
                      Engine_Locked
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    <span className="text-[8px] font-mono uppercase tracking-[0.2em] font-bold italic">
                      {hasWebGPU ? "GPU_ACCEL" : "CPU_ONLY"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages
                .filter((m) => !m.hidden)
                .map((msg, i, filtered) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-sm flex items-center justify-center shrink-0 border relative ${
                        msg.role === "user"
                          ? "bg-zinc-900 border-orange-500/50 text-orange-500"
                          : "bg-zinc-900 border-border/50"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                      <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-background border border-border/50 flex items-center justify-center">
                        <div
                          className={`w-1 h-1 rounded-full ${msg.role === "user" ? "bg-orange-500" : "bg-blue-500"}`}
                        />
                      </div>
                    </div>
                    <div
                      className={`max-w-[85%] space-y-2 ${msg.role === "user" ? "text-right ml-auto" : "mr-auto"}`}
                    >
                      <div
                        className={`flex items-center gap-1.5 mb-1 text-[8px] font-mono text-muted-foreground/50 uppercase tracking-widest ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <span>
                          {msg.role === "user" ? "0XUSR_NODE" : "0XBOT_NODE"}
                        </span>
                        <span>•</span>
                        <Clock className="w-2.5 h-2.5 text-muted-foreground/35 inline" />
                        <span className="opacity-90">
                          {msg.timestamp || new Date().toLocaleTimeString()}
                        </span>
                      </div>
                      <div
                        className={`relative px-5 py-4 text-sm leading-relaxed overflow-hidden border transition-all duration-500 ${
                          msg.role === "user"
                            ? "bg-zinc-950/40 border-orange-500/20 text-foreground rounded-r-none rounded-l-xl"
                            : "bg-muted/10 border-border/30 text-foreground rounded-l-none rounded-r-xl backdrop-blur-md"
                        }`}
                      >
                        {msg.role === "user" && (
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
                            const parsed = extractThoughts(msg.content);
                            let contentToRender = parsed
                              ? parsed.cleanContent
                              : msg.content;

                            // Parse Coder Tool Calls
                            if (msg.role === "assistant") {
                              try {
                                let cleanJSON = contentToRender.trim();
                                const jsonMatch = cleanJSON.match(
                                  /```(?:json)?\s*([\s\S]*?)\s*```/,
                                );

                                let extractedJSON = cleanJSON;
                                let textBefore = "";
                                let textAfter = "";

                                if (jsonMatch) {
                                  extractedJSON = jsonMatch[1].trim();
                                  textBefore = cleanJSON
                                    .substring(0, jsonMatch.index)
                                    .trim();
                                  textAfter = cleanJSON
                                    .substring(
                                      jsonMatch.index! + jsonMatch[0].length,
                                    )
                                    .trim();
                                } else {
                                  const firstBrace = cleanJSON.indexOf("{");
                                  const lastBrace = cleanJSON.lastIndexOf("}");
                                  if (
                                    firstBrace !== -1 &&
                                    lastBrace !== -1 &&
                                    lastBrace > firstBrace
                                  ) {
                                    extractedJSON = cleanJSON.substring(
                                      firstBrace,
                                      lastBrace + 1,
                                    );
                                    textBefore = cleanJSON
                                      .substring(0, firstBrace)
                                      .trim();
                                    textAfter = cleanJSON
                                      .substring(lastBrace + 1)
                                      .trim();
                                  }
                                }

                                if (extractedJSON.startsWith("{")) {
                                  let jsonObj;
                                  try {
                                    jsonObj = JSON.parse(extractedJSON);
                                  } catch (e) {
                                    extractedJSON = extractedJSON
                                      .replace(/\\}/g, "}")
                                      .replace(/\\{/g, "{")
                                      .replace(/\\'/g, "'");
                                    jsonObj = JSON.parse(extractedJSON);
                                  }

                                  if (jsonObj && jsonObj.tool) {
                                    let extraText = [textBefore, textAfter]
                                      .filter(Boolean)
                                      .join("\n\n");

                                    if (
                                      jsonObj.tool === "chat_user" &&
                                      jsonObj.params &&
                                      jsonObj.params.message
                                    ) {
                                      contentToRender = jsonObj.params.message;
                                    } else {
                                      contentToRender =
                                        "```json\n" +
                                        JSON.stringify(jsonObj, null, 2) +
                                        "\n```";
                                    }
                                  }
                                }
                              } catch (e) {
                                // Not valid JSON, keep as is
                              }
                            }

                            if (parsed) {
                              return (
                                <div className="space-y-4">
                                  <div className="p-3 bg-muted/80 border border-border rounded-lg text-xs text-muted-foreground italic font-mono">
                                    <div className="flex items-center gap-2 mb-1 text-[10px] uppercase tracking-widest font-bold text-muted-foreground/70">
                                      <Sparkles className="w-3 h-3" />
                                      Reasoning
                                    </div>
                                    {parsed.thoughts}
                                  </div>
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {contentToRender}
                                  </ReactMarkdown>
                                </div>
                              );
                            }
                            return (
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {contentToRender}
                              </ReactMarkdown>
                            );
                          })()}
                        </div>
                        {msg.image && (
                          <div className="mt-2 rounded-lg overflow-hidden border border-border max-sm">
                            <img
                              src={msg.image}
                              alt="Uploaded"
                              className="w-full h-auto"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
                        {msg.audio && (
                          <div className="mt-2 rounded-lg overflow-hidden border border-border bg-muted p-2">
                            <audio
                              src={msg.audio}
                              controls
                              className="w-full h-8"
                            />
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
                        {isGenerating &&
                          i === filtered.length - 1 &&
                          msg.role === "assistant" && (
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
                                  ([file, info]) => (
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

      {/* Input Area */}
      <div className="p-6 border-t border-border bg-background/50 backdrop-blur-xl shrink-0">
        <div className="max-w-2xl mx-auto relative">
          {pendingImage && (
            <div className="mb-3 relative inline-block">
              <img
                src={pendingImage}
                className="h-20 w-20 object-cover rounded-lg border border-border"
              />
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
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <div className="relative flex-1">
              <Input
                placeholder={
                  isModelReady
                    ? "Command the studio..."
                    : "Initializing engine..."
                }
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
                  {isRecording ? (
                    <MicOff className="w-4 h-4 animate-pulse" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
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
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[10px] text-muted-foreground hover:text-orange-500 gap-1.5"
                onClick={() =>
                  (
                    document.getElementById("vision-upload") as HTMLInputElement
                  )?.click()
                }
              >
                <ImageIcon className="w-3 h-3" />
                Vision
              </Button>
              <input
                type="file"
                id="vision-upload"
                className="hidden"
                accept="image/*"
                onChange={(e) =>
                  e.target.files?.[0] && analyzeImage(e.target.files[0])
                }
              />

              <Button
                variant="ghost"
                size="sm"
                className={`h-7 text-[10px] gap-1.5 ${isLiveMode ? "text-red-500 hover:text-red-400 bg-red-500/10" : "text-muted-foreground hover:text-orange-500"}`}
                onClick={toggleLiveMode}
                title="Toggle Live Mode (Screen + Voice)"
              >
                <Monitor
                  className={`w-3 h-3 ${isLiveMode ? "animate-pulse" : ""}`}
                />
                Live
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`h-7 text-[10px] gap-1.5 ${speakEnabled ? "text-orange-500 bg-orange-500/10 hover:bg-orange-500/20" : "text-muted-foreground hover:text-orange-500"}`}
                title={
                  speakEnabled
                    ? "Disable Speak Responses (TTS)"
                    : "Enable Speak Responses (TTS)"
                }
                onClick={() => {
                  const nextVal = !speakEnabled;
                  setSpeakEnabled(nextVal);
                  if (nextVal) {
                    tts.resume();
                  } else {
                    tts.stop();
                  }
                }}
              >
                <Volume2 className="w-3 h-3" />
                Speak
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[10px] text-muted-foreground hover:text-orange-500 gap-1.5"
                onClick={() =>
                  handleToolCall({
                    tool: "image_gen",
                    params: { prompt: input },
                  })
                }
                disabled={!input.trim()}
              >
                <Sparkles className="w-3 h-3" />
                Generate
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[10px] text-muted-foreground hover:text-orange-500 gap-1.5"
                onClick={() => handleMusicGen(input)}
                disabled={!input.trim()}
              >
                <Music className="w-3 h-3" />
                Music
              </Button>

              {isCoderMode && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 text-[10px] gap-1.5 ${isPipelineRunning ? "text-orange-500 bg-orange-500/10" : "text-muted-foreground hover:text-orange-500"}`}
                  onClick={() =>
                    isPipelineRunning ? stopPipeline() : startPipeline(input)
                  }
                  disabled={!input.trim() && !isPipelineRunning}
                >
                  <Workflow
                    className={`w-3 h-3 ${isPipelineRunning ? "animate-spin" : ""}`}
                  />
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
                  className={`h-7 text-[10px] gap-1.5 ${activeTab === "sandbox" ? "text-orange-500" : "text-muted-foreground"}`}
                  onClick={() => setActiveTab("sandbox")}
                >
                  <Code2 className="w-3 h-3" />
                  Sandbox
                </Button>
              )}
              {generatedImage && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 text-[10px] gap-1.5 ${activeTab === "gallery" ? "text-orange-500" : "text-muted-foreground"}`}
                  onClick={() => setActiveTab("gallery")}
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
