import { useState, useEffect } from "react";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { User, Bot, Clock, Activity, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseMarkdownToolCalls } from "@/lib/parseMarkdownToolCalls";
import { Message } from "@shared/types";
import { VocalWaveformPlayer } from "../chat/VocalWaveformPlayer";
import { useApp } from "../../context/AppContext";

const getWorkerId = (msg: Message) => {
  const cat = (msg.category || "text").toLowerCase();
  if (cat === "text") return "TEXT_NODE";
  if (cat === "coder") return "CODER_NODE";
  if (cat === "sandbox") return "SANDBOX_NODE";
  if (cat === "image-gen" || cat === "image") return "IMAGE_NODE";
  if (cat === "music-gen" || cat === "music") return "MUSIC_NODE";
  if (cat === "vision" || cat === "live") return "VISION_NODE";
  if (cat === "director") return "DIRECTOR_NODE";
  return "COMPUTE_NODE";
};

function DynamicStatus({ msg, isGenerating, isLast }: { msg: Message; isGenerating: boolean; isLast: boolean }) {
  const startTime = msg.stats?.startTime;
  const finished = msg.stats?.finished;
  const [elapsed, setElapsed] = useState<number>(() => {
    return startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
  });

  useEffect(() => {
    if (finished || !startTime) return;

    // Set initial value immediately
    setElapsed(Math.round((Date.now() - startTime) / 1000));

    const interval = setInterval(() => {
      setElapsed(Math.round((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, finished]);

  const isCurrentlyGenerating = !finished && (isGenerating && isLast || msg.isQueued || (startTime && !finished));

  if (isCurrentlyGenerating) {
    const displaySecs = startTime ? elapsed : 0;
    return <span>("Responding.. {displaySecs} secs")</span>;
  }

  const duration = msg.stats?.duration || (startTime && finished ? parseFloat(((Date.now() - startTime) / 1000).toFixed(1)) : 0.1);
  const tokens = msg.stats?.tokens || Math.max(1, Math.round((msg.content || "").length / 4));
  return (
    <span>
      ("Response took {duration} secs [{tokens} Tokens]")
    </span>
  );
}

interface MessageItemProps {
  msg: Message;
  index: number;
  isLast: boolean;
  isGenerating: boolean;
  handleOptionSelect: (option: string) => void;
  extractThoughts: (content: string) => { thoughts: string; cleanContent: string } | null;
}

export function MessageItem({
  msg,
  index,
  isLast,
  isGenerating,
  handleOptionSelect,
  extractThoughts,
}: MessageItemProps) {
  const { developerView } = useApp();
  return (
    <motion.div
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
          {msg.role === "user" ? (
            <>
              <span>0XUSR_NODE</span>
              <span>•</span>
              <Clock className="w-2.5 h-2.5 text-muted-foreground/35 inline" />
              <span className="opacity-90">
                {msg.timestamp || new Date().toLocaleTimeString()}
              </span>
            </>
          ) : (
            <>
              <span>
                OMNIX_{getWorkerId(msg)}
              </span>
              <span>•</span>
              <span className="opacity-90">
                {msg.timestamp || new Date().toLocaleTimeString()}
              </span>
              <span className="text-orange-500/80 font-semibold normal-case">
                <DynamicStatus msg={msg} isGenerating={isGenerating} isLast={isLast} />
              </span>
            </>
          )}
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
          {msg.role === "user" && msg.promptFormat && (
            <div className="flex items-center gap-1 mb-2.5 text-[9px] font-mono font-bold text-orange-400 uppercase tracking-widest bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 rounded-sm w-fit ml-auto">
              <Sparkles className="w-2.5 h-2.5 text-orange-400" />
              {msg.promptFormat}
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

              let hasValidToolCalls = false;
              // Parse Coder Tool Calls
              if (msg.role === "assistant") {
                try {
                  const toolCalls = parseMarkdownToolCalls(contentToRender);
                  if (toolCalls.length > 0) {
                    hasValidToolCalls = true;
                    contentToRender = toolCalls.map((t: any) => {
                      if (t.tool === "chat_user" && t.params && t.params.message) {
                        return t.params.message;
                      }
                      let s = `\`\`\`markdown\n# ${t.tool}\n`;
                      for (const [k, v] of Object.entries(t.params)) {
                        s += `\n## ${k}\n${v}\n`;
                      }
                      s += `\`\`\``;
                      return s;
                    }).join("\n\n");
                  }
                } catch (e) {
                  // Not valid tool calls, keep as is
                }
              }

              if (msg.category === "coder" && msg.role === "assistant" && !hasValidToolCalls && contentToRender.trim() !== "") {
                contentToRender = `\`\`\`text\n${contentToRender}\n\`\`\``;
              }

              if (msg.isScript) {
                if (!developerView) {
                  return (
                    <div className="text-sm text-zinc-100 whitespace-pre-wrap leading-relaxed space-y-2">
                      {msg.scriptOutputItems && msg.scriptOutputItems.length > 0 ? (
                        msg.scriptOutputItems.map((item, idx) => (
                          <div
                            key={idx}
                            className={`transition-all duration-500 ease-in-out ${
                              item.pending ? "blur-[5px] select-none opacity-60 pointer-events-none" : ""
                            }`}
                          >
                            {item.val}
                          </div>
                        ))
                      ) : (
                        msg.scriptOutput || ""
                      )}
                    </div>
                  );
                }

                const codeBlock = `\`\`\`javascript\n${contentToRender}\n\`\`\``;
                return (
                  <div className="space-y-4 w-full">
                    {parsed && (
                      <div className="p-3 bg-muted/80 border border-border rounded-lg text-xs text-muted-foreground italic font-mono">
                        <div className="flex items-center gap-2 mb-1 text-[10px] uppercase tracking-widest font-bold text-muted-foreground/70">
                          <Sparkles className="w-3 h-3" />
                          Reasoning
                        </div>
                        {parsed.thoughts}
                      </div>
                    )}
                    <div className="border border-purple-500/20 bg-purple-500/5 p-4 rounded-sm space-y-2">
                      <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-purple-400 uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                        [EXECUTION OUTPUT]
                      </div>
                      <div className="text-[11px] font-mono text-zinc-100 whitespace-pre-wrap selection:bg-purple-500/30 space-y-2">
                        {msg.scriptOutputItems && msg.scriptOutputItems.length > 0 ? (
                          msg.scriptOutputItems.map((item, idx) => (
                            <div
                              key={idx}
                              className={`transition-all duration-500 ease-in-out ${
                                item.pending ? "blur-[5px] select-none opacity-60 pointer-events-none" : ""
                              }`}
                            >
                              {item.val}
                            </div>
                          ))
                        ) : (
                          msg.scriptOutput || "[No Output]"
                        )}
                      </div>
                    </div>
                    
                    <details className="group border border-border/30 bg-black/20 rounded-sm">
                      <summary className="flex items-center justify-between p-2 text-[9px] font-mono text-muted-foreground/80 uppercase tracking-widest cursor-pointer hover:text-zinc-200 select-none">
                        <span>[SOURCE CODE]</span>
                        <span className="text-[7px] transition-transform group-open:rotate-180">▼</span>
                      </summary>
                      <div className="p-2 border-t border-border/20 text-xs">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {codeBlock}
                        </ReactMarkdown>
                      </div>
                    </details>
                  </div>
                );
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
            <div className="mt-2">
              <VocalWaveformPlayer
                audioUrl={msg.audio}
                lyricText={msg.role === "assistant" ? msg.content : undefined}
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
            isLast &&
            msg.role === "assistant" && (
              <span className="inline-block w-1 h-4 ml-1 bg-orange-500 animate-pulse align-middle" />
            )}
        </div>
      </div>
    </motion.div>
  );
}
