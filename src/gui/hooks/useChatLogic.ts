import { useState, useRef, useCallback, useEffect } from "react";
import { Message, ChatMode, FocusTopic, ErrorReport } from "@shared/types";
import { MODELS } from "@shared/modelList";
import { browserEngine } from "@/lib/ModelEngine";
import { memoryStore } from "@/lib/memory";
import {
  TEXT_SYSTEM_PROMPT,
  gemma4TextSystemPrompt,
  CODER_SYSTEM_PROMPT,
  IMAGE_SYSTEM_PROMPT,
  MUSIC_SYSTEM_PROMPT,
  LIVE_SYSTEM_PROMPT,
  DIRECTOR_SYSTEM_PROMPT,
  formatMemoryPrompt,
  formatMemoriesAsTable,
  distillMemories,
  formatConversationTranscript,
} from "@shared/prompts";

export const getFormattedTimestamp = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

export function useChatLogic(
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<any[]>>,
  sendInference: (payload: any) => void,
  chatMode: ChatMode,
  enableRAG: boolean,
  loadedModelId: string | null,
  selectedModels: Record<string, string>,
  loadModel: (
    category: string,
    modelId?: string,
    skipLoadingVisuals?: boolean,
  ) => Promise<void>,
  addLog: (msg: string, type?: "info" | "error" | "success") => void,
  ramLimitPercent: number,
  setMemoryUsage: (val: any) => void,
  activeCategory: string,
  onStopCallback: () => void,
  isCoderMode: boolean,
  isHiddenRef: React.MutableRefObject<boolean>,
  isLiveModeRef: React.MutableRefObject<boolean>,
  isRoutingRef: React.MutableRefObject<boolean>,
  setIsModelLoading: (val: boolean) => void,
  setLoadingProgress: React.Dispatch<
    React.SetStateAction<Record<string, { progress: number; status: string }>>
  >,
  thinkEnabled?: boolean,
  setError?: (msg: ErrorReport | null) => void,
  activeTabId?: string,
  focusTopics?: FocusTopic[],
  enableFocusTopics?: boolean,
  selectedQtypes?: Record<string, string>,
  contextMemoryLimit?: number,
  temperature?: number,
  topP?: number,
  topK?: number,
  setSandboxFiles?: React.Dispatch<React.SetStateAction<any[]>>,
  enableMMRS?: boolean,
  feedSpeechToken?: (fullText: string) => void,
  flushSpeech?: (fullText: string) => void,
) {
  const [input, setInput] = useState("");
  const [isTextGenerating, setIsTextGenerating] = useState(false);
  const [isOpGenerating, setIsOpGenerating] = useState(false);
  const isGenerating = isTextGenerating || isOpGenerating;
  const setIsGenerating = useCallback((val: boolean) => {
    if (!val) {
      setIsTextGenerating(false);
      setIsOpGenerating(false);
    } else {
      setIsTextGenerating(true);
    }
  }, []);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);

  // Queues (Now used for local sequencing)
  const [textModelQueue, setTextModelQueue] = useState<any[]>([]);
  const [directorModelQueue, setDirectorModelQueue] = useState<any[]>([]);
  const [visionModelQueue, setVisionModelQueue] = useState<any[]>([]);
  const [imageModelQueue, setImageModelQueue] = useState<any[]>([]);
  const [musicModelQueue, setMusicModelQueue] = useState<any[]>([]);

  const textModelQueueRef = useRef(textModelQueue);
  const directorModelQueueRef = useRef(directorModelQueue);
  const visionModelQueueRef = useRef(visionModelQueue);
  const imageModelQueueRef = useRef(imageModelQueue);
  const musicModelQueueRef = useRef(musicModelQueue);

  useEffect(() => {
    textModelQueueRef.current = textModelQueue;
  }, [textModelQueue]);
  useEffect(() => {
    directorModelQueueRef.current = directorModelQueue;
  }, [directorModelQueue]);
  useEffect(() => {
    visionModelQueueRef.current = visionModelQueue;
  }, [visionModelQueue]);
  useEffect(() => {
    imageModelQueueRef.current = imageModelQueue;
  }, [imageModelQueue]);
  useEffect(() => {
    musicModelQueueRef.current = musicModelQueue;
  }, [musicModelQueue]);

  const [longTermMemories, setLongTermMemories] = useState(0);
  const isProcessingRef = useRef(false);
  const isProcessingTextRef = useRef(false);
  const isProcessingOpRef = useRef(false);
  const masterQueueRef = useRef<any[]>([]);
  const textQueueRef = useRef<any[]>([]);
  const opQueueRef = useRef<any[]>([]);
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const refreshMemoryCount = useCallback(async () => {
    try {
      const cnt = await memoryStore.count();
      setLongTermMemories(cnt);
    } catch (e) {
      console.warn("Error counting memories:", e);
    }
  }, []);

  useEffect(() => {
    refreshMemoryCount();
  }, [refreshMemoryCount]);

  const indexMemory = useCallback(
    async (
      content: string,
      sender: "User" | "AI",
      direction: "Input" | "Output",
    ) => {
      if (!content || content.trim().length < 5) return;
      try {
        console.log("Adding memory indices for:", content.substring(0, 30));
        const embedding = await browserEngine.getEmbedding(content);
        await memoryStore.add({
          id:
            typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : Math.random().toString(36).substring(2, 11),
          text: content,
          embedding,
          timestamp: Date.now(),
          metadata: { sender, direction },
        });
        await refreshMemoryCount();
      } catch (e) {
        console.warn("RAG Indexer Failure:", e);
      }
    },
    [refreshMemoryCount],
  );

  const performLocalInference = useCallback(
    async (
      text: string,
      category: string,
      options: any = {},
      assistantMsgId?: string,
    ) => {
      if (enableMMRS) {
        if (category === "text") {
          setIsTextGenerating(true);
        } else {
          setIsOpGenerating(true);
        }
      } else {
        setIsGenerating(true);
      }
      addLog(`Engine: Executing ${category} task...`, "info");

      let targetModelId =
        options.modelId ||
        (category === "text" ? selectedModels.text : selectedModels[category]);
      let finalSystemPrompt = options.systemPrompt || "";
      try {
        // Ensure the correct model is loaded and sync React state
        await loadModel(category, targetModelId, options.skipModelLoadVisuals);

        // Contextual RAG retrieval and chronological session history integration
        let contextNotes = "";
        let retrievedItems: any[] = [];

        const lowerText = text.toLowerCase();
        const isMemoryQuery =
          /remember|recall|memory|memories|forget|history|who am i|know about me|what did we|our chats|session|say|said|tell me|ask|asked|chat|chats/i.test(
            lowerText,
          );

        // Seed history reference table with the active chat session's actual messages ONLY when asking about history/memories
        if (
          isMemoryQuery &&
          options.chatHistory &&
          Array.isArray(options.chatHistory)
        ) {
          options.chatHistory.forEach((m: any) => {
            if (m.hidden || m.isThinking || m.isQueued) return;
            retrievedItems.push({
              timestamp: m.timestamp,
              text: m.content || m.text || "",
              metadata: {
                sender:
                  m.role === "assistant" || m.role === "model" ? "AI" : "User",
                direction:
                  m.role === "assistant" || m.role === "model"
                    ? "Output"
                    : "Input",
              },
            });
          });
        }

        if (enableRAG && (category === "text" || category === "coder")) {
          addLog(
            "Retrieving related memories via Semantic Cosine Similarity search...",
            "info",
          );
          try {
            const queryVector = await browserEngine.getEmbedding(text, (p) => {
              if (p.status === "progress") {
                setIsModelLoading(true);
                setLoadingProgress((prev) => ({
                  ...prev,
                  [p.file]: {
                    progress: p.progress,
                    status: `Downloading vector indices...`,
                  },
                }));
              }
            });
            const matches = await memoryStore.search(queryVector, 3, 0.45);
            let dbItems = [...(matches || [])];

            // Force-inject recent memory notes if the query is a meta-request asking what the AI remembers/knows
            if (isMemoryQuery) {
              addLog(
                "Memory-recall intent detected. Retrieving latest database memories...",
                "info",
              );
              const allMemories = await memoryStore.getAll();
              const recent = allMemories
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, 10);

              recent.forEach((r) => {
                if (!dbItems.find((x) => x.id === r.id)) {
                  dbItems.push(r);
                }
              });
            }

            // Merge non-duplicate background memories into the retrievedItems list
            dbItems.forEach((dbItem) => {
              const dbText = (dbItem.text || "").trim().toLowerCase();
              const isDuplicate = retrievedItems.some((item) => {
                const activeText = (item.text || item.content || "")
                  .trim()
                  .toLowerCase();
                return (
                  activeText === dbText ||
                  activeText.includes(dbText) ||
                  dbText.includes(activeText)
                );
              });
              if (!isDuplicate) {
                retrievedItems.push({
                  timestamp: dbItem.timestamp,
                  text: dbItem.text,
                  metadata: dbItem.metadata || {
                    sender: "User",
                    direction: "Input",
                  },
                });
              }
            });

            addLog(
              `RAG integration successful: Combined ${retrievedItems.length} conversational contexts.`,
              "success",
            );
          } catch (ragRErr: any) {
            console.warn("RAG retrieval failed:", ragRErr);
          }
        }

        if (retrievedItems.length > 0) {
          // Sort ascending chronologically by parsed timestamp
          retrievedItems.sort((a, b) => {
            const tA = a.timestamp
              ? typeof a.timestamp === "number"
                ? a.timestamp
                : new Date(a.timestamp).getTime()
              : 0;
            const tB = b.timestamp
              ? typeof b.timestamp === "number"
                ? b.timestamp
                : new Date(b.timestamp).getTime()
              : 0;
            return tA - tB;
          });

          if (isMemoryQuery) {
            contextNotes = formatConversationTranscript(retrievedItems);
          } else {
            contextNotes = distillMemories(retrievedItems);
          }
        }

        finalSystemPrompt = options.systemPrompt || "";
        const timeStr = `[Current Time & Date: ${getFormattedTimestamp()}]`;
        finalSystemPrompt = finalSystemPrompt
          ? `${timeStr}\n\n${finalSystemPrompt}`
          : timeStr;

        if (contextNotes) {
          const memoryPrompt = formatMemoryPrompt(contextNotes, isMemoryQuery);
          if (memoryPrompt) {
            finalSystemPrompt =
              (finalSystemPrompt ? `${finalSystemPrompt}\n\n` : "") +
              memoryPrompt;
          }
        }

        if (enableFocusTopics && focusTopics && focusTopics.length > 0) {
          const topicsStr = [
            "**Focus Topics:**",
            ...focusTopics.map(
              (t) => `* ${t.name} (${Math.round(t.energy)}% focus)`,
            ),
          ].join("\n");
          finalSystemPrompt =
            (finalSystemPrompt ? `${finalSystemPrompt}\n\n` : "") + topicsStr;
        }

        const isSmallModel =
          targetModelId &&
          (targetModelId.toLowerCase().includes("llama") ||
            targetModelId.toLowerCase().includes("qwen") ||
            targetModelId.toLowerCase().includes("tiny-llm"));

        let adjustedHistory = options.chatHistory || [];
        if (isSmallModel) {
          const isUltraTiny =
            targetModelId.toLowerCase().includes("tiny-llm") ||
            targetModelId.toLowerCase().includes("0.5b") ||
            targetModelId.toLowerCase().includes("0.6b");
          const limit = isUltraTiny ? -4 : -6;
          if (adjustedHistory.length > Math.abs(limit)) {
            adjustedHistory = adjustedHistory.slice(limit);
          }
        }

        let accumulatedText = "";
        const result = await browserEngine.runInference(
          category,
          text,
          {
            ...options,
            chatHistory: adjustedHistory,
            repetition_penalty: isSmallModel
              ? 1.18
              : options.repetition_penalty || undefined,
            temperature: isSmallModel
              ? 0.7
              : options.temperature !== undefined
                ? options.temperature
                : temperature,
            top_p: options.top_p !== undefined ? options.top_p : topP,
            top_k: options.top_k !== undefined ? options.top_k : topK,
            systemPrompt: finalSystemPrompt || undefined,
            modelId: targetModelId,
            progress_callback: (p: any) => {
              if (p.status === "progress") {
                setIsModelLoading(true);
                setLoadingProgress((prev) => ({
                  ...prev,
                  [p.file]: {
                    progress: p.progress,
                    status: `Downloading ${p.file}`,
                  },
                }));
              } else if (p.status === "init" || p.status === "loaded") {
                setLoadingProgress((prev) => ({
                  ...prev,
                  [p.file || "engine"]: {
                    progress: 100,
                    status:
                      p.status === "init"
                        ? `Initializing ${p.file || "Engine"}`
                        : "Model Loaded",
                  },
                }));
              }
            },
          },
          (token) => {
            setIsModelLoading(false);
            setLoadingProgress({}); // Clear once we start getting tokens

            if (category === "text" || category === "coder") {
              accumulatedText += token;
              let thoughts = "";
              let cleanText = "";
              const lowerText = accumulatedText.toLowerCase();
              const openIdx = lowerText.indexOf("<think>");
              if (openIdx !== -1) {
                const closeIdx = lowerText.indexOf("</think>", openIdx + 7);
                if (closeIdx !== -1) {
                  thoughts = accumulatedText.substring(openIdx + 7, closeIdx);
                  cleanText =
                    accumulatedText.substring(0, openIdx) +
                    accumulatedText.substring(closeIdx + 8);
                } else {
                  thoughts = accumulatedText.substring(openIdx + 7);
                  cleanText = accumulatedText.substring(0, openIdx);
                }
              } else {
                cleanText = accumulatedText;
              }

              let displayContent = "";
              if (thinkEnabled && thoughts.trim()) {
                displayContent = `<|channel>thought\n${thoughts.trim()}\n<channel|>\n${cleanText}`;
              } else {
                displayContent = cleanText;
              }

              if (feedSpeechToken) {
                feedSpeechToken(cleanText);
              }

              setMessages((prev) => {
                const filtered = prev.filter((m) => !m.isThinking);
                return filtered.map((m) => {
                  if (m.id === assistantMsgId) {
                    return { ...m, content: displayContent, isQueued: false };
                  }
                  return m;
                });
              });
            } else {
              setMessages((prev) => {
                const filtered = prev.filter((m) => !m.isThinking);
                return filtered.map((m) => {
                  if (m.id === assistantMsgId) {
                    return {
                      ...m,
                      content: m.content + token,
                      isQueued: false,
                    };
                  }
                  return m;
                });
              });
            }
          },
        );

        if (category === "image-gen") {
          setMessages((prev) => {
            return prev
              .filter((m) => !m.isThinking)
              .map((m) => {
                if (m.id === assistantMsgId) {
                  return {
                    ...m,
                    content: "Image generated successfully.",
                    image: result as string,
                    isQueued: false,
                  };
                }
                return m;
              });
          });
        } else if (category === "music-gen") {
          setMessages((prev) => {
            return prev
              .filter((m) => !m.isThinking)
              .map((m) => {
                if (m.id === assistantMsgId) {
                  return {
                    ...m,
                    content: "Audio synthesized successfully.",
                    audio: (result as any).audio,
                    isQueued: false,
                  };
                }
                return m;
              });
          });
        } else {
          setMessages((prev) => {
            return prev
              .filter((m) => !m.isThinking)
              .map((m) => {
                if (m.id === assistantMsgId) {
                  let finalContent = m.content || (result as string) || "";
                  if (category === "text" || category === "coder") {
                    finalContent = finalContent.replace(
                      /<think>[\s\S]*?<\/think>/gi,
                      "",
                    );
                    const thinkOpenIdx = finalContent
                      .toLowerCase()
                      .indexOf("<think>");
                    if (thinkOpenIdx !== -1) {
                      finalContent = finalContent.substring(0, thinkOpenIdx);
                    }
                    finalContent = finalContent.replace(
                      /<\|channel>thought[\s\S]*?<channel\|>/gi,
                      "",
                    );
                    finalContent = finalContent.trim();
                    if (flushSpeech) {
                      flushSpeech(finalContent);
                    }
                  }
                  return {
                    ...m,
                    content: finalContent,
                    isQueued: false,
                  };
                }
                return m;
              });
          });
        }

        // Parse Sandbox Tools if in Coder mode
        if (category === "coder" && typeof result === "string") {
          try {
            let cleanResult = result
              .replace(/<think>[\s\S]*?<\/think>/gi, "")
              .trim();
            const thinkOpenIdx = cleanResult.toLowerCase().indexOf("<think>");
            if (thinkOpenIdx !== -1)
              cleanResult = cleanResult.substring(0, thinkOpenIdx).trim();
            cleanResult = cleanResult
              .replace(/<\|channel>thought[\s\S]*?<channel\|>/gi, "")
              .trim();

            let jsonString = cleanResult;
            const jsonMatch = cleanResult.match(
              /```(?:json)?\s*([\s\S]*?)\s*```/,
            );
            if (jsonMatch) {
              jsonString = jsonMatch[1].trim();
            } else {
              const firstBrace = cleanResult.indexOf("{");
              const lastBrace = cleanResult.lastIndexOf("}");
              if (
                firstBrace !== -1 &&
                lastBrace !== -1 &&
                lastBrace > firstBrace
              ) {
                jsonString = cleanResult.substring(firstBrace, lastBrace + 1);
              }
            }

            let parsed;
            try {
              parsed = JSON.parse(jsonString);
            } catch (e) {
              jsonString = jsonString
                .replace(/\\}/g, "}")
                .replace(/\\{/g, "{")
                .replace(/\\'/g, "'");
              parsed = JSON.parse(jsonString);
            }
            if (
              parsed &&
              parsed.tool === "write_file" &&
              parsed.params &&
              parsed.params.name &&
              parsed.params.content
            ) {
              if (setSandboxFiles) {
                setSandboxFiles((prev) => {
                  const newFile = {
                    name: parsed.params.name,
                    content: parsed.params.content,
                    language: parsed.params.language || "typescript",
                  };
                  const existingIdx = prev.findIndex(
                    (f) => f.name === newFile.name,
                  );
                  if (existingIdx >= 0) {
                    const updated = [...prev];
                    updated[existingIdx] = newFile;
                    return updated;
                  }
                  return [...prev, newFile];
                });
                addLog(`Sandbox: Wrote file ${parsed.params.name}`, "success");
              }
            }
          } catch (e: any) {
            // JSON parsing failed, likely not a tool call or malformed
            const retryCount = options.retryCount || 0;
            if (retryCount < 3) {
              const errorMessage = `Your last response was not valid JSON or failed to parse. Please try again and output ONLY a single valid JSON object containing the tool call. Do not write tutorials or raw text. Error: ${e.message}`;

              setMessages((prev) => [
                ...prev,
                {
                  id: Date.now().toString(),
                  role: "user",
                  content: errorMessage,
                  timestamp: Date.now(),
                  category: "coder",
                },
              ]);

              masterQueueRef.current.push({
                category: "coder",
                text: errorMessage,
                options: { ...options, retryCount: retryCount + 1 },
              });
            } else {
              addLog(
                "Sandbox: AI failed to produce valid JSON 3 times. Halting retries.",
                "error",
              );
            }
          }
        }

        // Automatic memory indexing for completed interactions if active
        if (enableRAG && (category === "text" || category === "coder")) {
          // Index the user prompt and the generated AI answer asynchronously
          indexMemory(text, "User", "Input");
          if (typeof result === "string" && result) {
            let cleanResult = result
              .replace(/<think>[\s\S]*?<\/think>/gi, "")
              .trim();
            const thinkOpenIdx = cleanResult.toLowerCase().indexOf("<think>");
            if (thinkOpenIdx !== -1) {
              cleanResult = cleanResult.substring(0, thinkOpenIdx).trim();
            }
            cleanResult = cleanResult
              .replace(/<\|channel>thought[\s\S]*?<channel\|>/gi, "")
              .trim();
            indexMemory(cleanResult, "AI", "Output");
          }
        }

        addLog(`Engine: Task complete.`, "success");
      } catch (err: any) {
        addLog(
          `Engine Error: ${err?.message || err?.toString() || "Unknown error occurred during inference"}`,
          "error",
        );
        setMessages((prev) => {
          return prev
            .filter((m) => !m.isThinking)
            .map((m) => {
              if (m.id === assistantMsgId) {
                return {
                  ...m,
                  content: `Error: ${err?.message || "Inference failed."}`,
                  isQueued: false,
                };
              }
              return m;
            });
        });
        if (setError) {
          setError({
            message: err?.message || String(err),
            activeModel: targetModelId,
            contextLength: text.length + (finalSystemPrompt?.length || 0),
            rawPrompt: text,
          });
        }
      } finally {
        if (enableMMRS) {
          if (category === "text") {
            setIsTextGenerating(false);
          } else {
            setIsOpGenerating(false);
          }
        } else {
          setIsGenerating(false);
        }
        setIsModelLoading(false);
        setLoadingProgress({});
      }
    },
    [
      selectedModels,
      selectedQtypes,
      addLog,
      enableRAG,
      indexMemory,
      loadModel,
      setIsModelLoading,
      setLoadingProgress,
      thinkEnabled,
      setError,
      enableMMRS,
    ],
  );

  const summarizeChat = useCallback(async () => {
    addLog("Summarization logic not fully implemented yet", "info");
  }, [addLog]);

  const executeJob = useCallback(
    async (job: any) => {
      let category = job.category;
      let finalInput = job.text;
      let finalOptions = { ...job.options, thinkEnabled: thinkEnabled };

      try {
        if (job.isDirector) {
          addLog("System: Engaging Director for task routing...", "info");
          const directorId =
            selectedModels.director === "use-text-model"
              ? selectedModels.text
              : selectedModels.director;
          const directorInfo = MODELS.find((m) => m.id === directorId);
          const directorCustomDtype = selectedQtypes
            ? selectedQtypes[directorId]
            : undefined;

          const routing = await browserEngine.runDirectorInference(
            job.text,
            directorInfo?.modelID,
            (p) => {
              if (p.status === "progress") {
                setIsModelLoading(true);
                setLoadingProgress((prev) => ({
                  ...prev,
                  [p.file]: {
                    progress: p.progress,
                    status: `Downloading Director...`,
                  },
                }));
              }
            },
            directorCustomDtype,
          );

          category = routing.category;
          finalInput = routing.prompt;

          if (thinkEnabled && routing.thinking) {
            addLog("Director: Showing reasoning process in chat.", "info");
            setMessages((prev) => {
              const idx = prev.findIndex((m) => m.id === job.assistantMsgId);
              if (idx !== -1) {
                const updated = [...prev];
                updated.splice(idx, 0, {
                  role: "assistant",
                  content: `💭 *Reasoning:* \n\n${routing.thinking}`,
                  isThinking: true,
                  timestamp: getFormattedTimestamp(),
                });
                return updated;
              }
              return [
                ...prev,
                {
                  role: "assistant",
                  content: `💭 *Reasoning:* \n\n${routing.thinking}`,
                  isThinking: true,
                  timestamp: getFormattedTimestamp(),
                },
              ];
            });
          }

          const targetModelId =
            category === "text"
              ? selectedModels.text
              : selectedModels[category];
          const targetModelInfo = MODELS.find((m) => m.id === targetModelId);
          const isSameModel =
            targetModelInfo &&
            directorInfo &&
            targetModelInfo.modelID === directorInfo.modelID;

          if (!isSameModel) {
            await browserEngine.unloadDirector();
            await new Promise((resolve) => setTimeout(resolve, 500)); // Let WebGPU and GC settle completely before loading next model
          } else {
            addLog(
              "System: Retaining Director as active text model (bypass reload).",
              "info",
            );
            finalOptions.skipModelLoadVisuals = true;
          }

          let targetSystemPrompt = TEXT_SYSTEM_PROMPT;
          if (category === "coder" || category === "sandbox") {
            targetSystemPrompt = CODER_SYSTEM_PROMPT;
          } else if (category === "image-gen" || category === "image") {
            targetSystemPrompt = IMAGE_SYSTEM_PROMPT;
          } else if (category === "music-gen" || category === "music") {
            targetSystemPrompt = MUSIC_SYSTEM_PROMPT;
          } else if (category === "vision" || category === "live") {
            targetSystemPrompt = LIVE_SYSTEM_PROMPT;
          } else if (
            category === "text" &&
            targetModelId?.toLowerCase().includes("gemma-4")
          ) {
            targetSystemPrompt = gemma4TextSystemPrompt;
          }
          finalOptions.systemPrompt = targetSystemPrompt;

          addLog(
            `System: Routed to ${category} engine by Director.`,
            "success",
          );
        }

        const messagesLatest = messagesRef.current;
        const userMsgIndex = messagesLatest.findIndex(
          (m) => m.id === job.userMsgId,
        );

        let upToUser;
        if (userMsgIndex !== -1) {
          upToUser = messagesLatest.slice(0, userMsgIndex + 1);
        } else {
          const isImage = job.options.prompt !== undefined;
          upToUser = [
            ...messagesLatest,
            {
              id: job.userMsgId,
              role: "user",
              content: isImage ? job.options.prompt : job.text,
              image: isImage ? job.text : undefined,
              timestamp: getFormattedTimestamp(),
            },
          ];
        }

        const filteredMessages = upToUser.filter(
          (m: any) =>
            (m.role === "user" || m.role === "assistant") &&
            !m.hidden &&
            !m.isThinking,
        );

        const chatHistory = [];
        let currentLength = 0;
        const limit = contextMemoryLimit || 8192;

        for (let i = filteredMessages.length - 1; i >= 0; i--) {
          const msg = filteredMessages[i];
          const msgLength = (msg.content?.length || 0) + (msg.image ? 500 : 0); // Approximate image length if any
          if (chatHistory.length > 0 && currentLength + msgLength > limit) {
            break;
          }
          chatHistory.unshift(msg);
          currentLength += msgLength;
        }

        finalOptions.chatHistory = chatHistory;
        if (activeTabId) {
          finalOptions.reqId = activeTabId;
        }

        await performLocalInference(
          finalInput,
          category,
          finalOptions,
          job.assistantMsgId,
        );
      } catch (err: any) {
        addLog(
          `System/Director Error: ${err?.message || err?.toString()}`,
          "error",
        );
        if (setError) {
          setError({
            message: err?.message || String(err),
            activeModel:
              selectedModels.director === "use-text-model"
                ? selectedModels.text
                : selectedModels.director,
            contextLength: job.text.length,
            rawPrompt: job.text,
          });
        }
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id === job.assistantMsgId) {
              return {
                ...m,
                content: `Error: ${err?.message || "Routing / inference failed."}`,
                isQueued: false,
              };
            }
            return m;
          }),
        );
        if (enableMMRS) {
          if (job.category === "text") {
            setIsTextGenerating(false);
          } else {
            setIsOpGenerating(false);
          }
        } else {
          setIsGenerating(false);
        }
        setIsModelLoading(false);
        setLoadingProgress({});
      }
    },
    [
      selectedModels,
      thinkEnabled,
      activeTabId,
      performLocalInference,
      setError,
      setIsModelLoading,
      setLoadingProgress,
      addLog,
      setMessages,
      enableMMRS,
    ],
  );

  const processNextTextJob = useCallback(async () => {
    if (isProcessingTextRef.current) return;
    if (textQueueRef.current.length === 0) return;

    isProcessingTextRef.current = true;
    setIsTextGenerating(true);

    const job = textQueueRef.current[0];

    try {
      await executeJob(job);
    } catch (err) {
      console.error("Text job execution failed:", err);
    } finally {
      textQueueRef.current.shift();
      setTextModelQueue((prev) => prev.filter((j) => j.id !== job.id));

      isProcessingTextRef.current = false;
      setIsTextGenerating(false);

      setTimeout(() => {
        processNextTextJob();
      }, 0);
    }
  }, [executeJob]);

  const processNextOpJob = useCallback(async () => {
    if (isProcessingOpRef.current) return;
    if (opQueueRef.current.length === 0) return;

    isProcessingOpRef.current = true;
    setIsOpGenerating(true);

    const job = opQueueRef.current[0];

    try {
      await executeJob(job);
    } catch (err) {
      console.error("Op job execution failed:", err);
    } finally {
      opQueueRef.current.shift();
      if (job.category === "director") {
        setDirectorModelQueue((prev) => prev.filter((j) => j.id !== job.id));
      } else if (job.category === "vision" || job.category === "live") {
        setVisionModelQueue((prev) => prev.filter((j) => j.id !== job.id));
      } else if (job.category === "image-gen" || job.category === "image") {
        setImageModelQueue((prev) => prev.filter((j) => j.id !== job.id));
      } else if (job.category === "music-gen" || job.category === "music") {
        setMusicModelQueue((prev) => prev.filter((j) => j.id !== job.id));
      } else {
        setTextModelQueue((prev) => prev.filter((j) => j.id !== job.id));
      }

      isProcessingOpRef.current = false;
      setIsOpGenerating(false);

      setTimeout(() => {
        processNextOpJob();
      }, 0);
    }
  }, [executeJob]);

  const processNextJob = useCallback(async () => {
    if (isProcessingRef.current) return;
    if (masterQueueRef.current.length === 0) return;

    isProcessingRef.current = true;
    setIsGenerating(true);

    const job = masterQueueRef.current[0];

    try {
      await executeJob(job);
    } catch (err) {
      console.error("Job execution failed:", err);
    } finally {
      masterQueueRef.current.shift();

      if (job.category === "director") {
        setDirectorModelQueue((prev) => prev.filter((j) => j.id !== job.id));
      } else if (job.category === "vision" || job.category === "live") {
        setVisionModelQueue((prev) => prev.filter((j) => j.id !== job.id));
      } else if (job.category === "image-gen" || job.category === "image") {
        setImageModelQueue((prev) => prev.filter((j) => j.id !== job.id));
      } else if (job.category === "music-gen" || job.category === "music") {
        setMusicModelQueue((prev) => prev.filter((j) => j.id !== job.id));
      } else {
        setTextModelQueue((prev) => prev.filter((j) => j.id !== job.id));
      }

      isProcessingRef.current = false;
      setIsGenerating(false);

      setTimeout(() => {
        processNextJob();
      }, 0);
    }
  }, [executeJob, setIsGenerating]);

  const pushJob = useCallback(
    (job: any) => {
      if (enableMMRS) {
        if (job.category === "text") {
          textQueueRef.current.push(job);
          setTextModelQueue((prev) => [...prev, job]);
          processNextTextJob();
        } else {
          opQueueRef.current.push(job);
          if (job.category === "director") {
            setDirectorModelQueue((prev) => [...prev, job]);
          } else if (job.category === "vision" || job.category === "live") {
            setVisionModelQueue((prev) => [...prev, job]);
          } else if (job.category === "image-gen" || job.category === "image") {
            setImageModelQueue((prev) => [...prev, job]);
          } else if (job.category === "music-gen" || job.category === "music") {
            setMusicModelQueue((prev) => [...prev, job]);
          } else {
            setTextModelQueue((prev) => [...prev, job]);
          }
          processNextOpJob();
        }
      } else {
        masterQueueRef.current.push(job);
        if (job.category === "director") {
          setDirectorModelQueue((prev) => [...prev, job]);
        } else if (job.category === "vision" || job.category === "live") {
          setVisionModelQueue((prev) => [...prev, job]);
        } else if (job.category === "image-gen" || job.category === "image") {
          setImageModelQueue((prev) => [...prev, job]);
        } else if (job.category === "music-gen" || job.category === "music") {
          setMusicModelQueue((prev) => [...prev, job]);
        } else {
          setTextModelQueue((prev) => [...prev, job]);
        }

        processNextJob();
      }
    },
    [processNextJob, processNextTextJob, processNextOpJob, enableMMRS],
  );

  const handleSend = useCallback(async () => {
    if (!input.trim() && !pendingImage) return;

    const currentInput = input;
    const currentImage = pendingImage;
    setInput("");
    setPendingImage(null);

    const userMsgId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 11);
    const assistantMsgId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 11);

    const userMsg: Message = {
      id: userMsgId,
      role: "user",
      content: currentInput,
      image: currentImage || undefined,
      timestamp: getFormattedTimestamp(),
    };
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      isQueued: true,
      timestamp: getFormattedTimestamp(),
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);

    let category = currentImage ? "vision" : isCoderMode ? "coder" : "text";
    if (!currentImage) {
      if (chatMode === "image") {
        category = "image-gen";
      } else if (chatMode === "music") {
        category = "music-gen";
      } else if (chatMode === "live") {
        category = "vision";
      } else if (chatMode === "sandbox") {
        category = "coder";
      }
    }

    let systemPrompt = TEXT_SYSTEM_PROMPT;
    if (chatMode === "sandbox" || isCoderMode) {
      systemPrompt = CODER_SYSTEM_PROMPT;
    } else if (chatMode === "image") {
      systemPrompt = IMAGE_SYSTEM_PROMPT;
    } else if (chatMode === "music") {
      systemPrompt = MUSIC_SYSTEM_PROMPT;
    } else if (chatMode === "live") {
      systemPrompt = LIVE_SYSTEM_PROMPT;
    } else if (chatMode === "director") {
      systemPrompt = DIRECTOR_SYSTEM_PROMPT;
    } else if (
      chatMode === "text" &&
      selectedModels.text?.toLowerCase().includes("gemma-4")
    ) {
      systemPrompt = gemma4TextSystemPrompt;
    }

    const job = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2, 11),
      category,
      chatMode,
      text: currentImage || currentInput,
      options: {
        prompt: currentImage ? currentInput : undefined,
        systemPrompt,
      },
      userMsgId,
      assistantMsgId,
      isDirector: chatMode === "director" && !currentImage,
      isInternal: false,
    };

    pushJob(job);
  }, [input, pendingImage, isCoderMode, chatMode, pushJob]);

  const handleSendInternal = useCallback(
    async (
      text: string,
      systemPrompt?: string,
      role: "user" | "system" = "user",
      hidden = false,
    ) => {
      if (!text.trim()) return;

      const userMsgId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2, 11);
      const assistantMsgId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2, 11);

      const userMsg: Message = {
        id: userMsgId,
        role,
        content: text,
        hidden,
        timestamp: getFormattedTimestamp(),
      };
      const assistantMsg: Message = {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        isQueued: true,
        timestamp: getFormattedTimestamp(),
      };

      if (!hidden) {
        setMessages((prev) => [...prev, userMsg, assistantMsg]);
      } else {
        setMessages((prev) => [...prev, assistantMsg]);
      }

      const category = isCoderMode ? "coder" : "text";

      const job = {
        id:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : Math.random().toString(36).substring(2, 11),
        category,
        chatMode,
        text,
        options: {
          systemPrompt,
        },
        userMsgId,
        assistantMsgId,
        isDirector: false,
        isInternal: true,
      };

      pushJob(job);
    },
    [isCoderMode, chatMode, pushJob],
  );

  return {
    messages,
    setMessages,
    input,
    setInput,
    isGenerating,
    setIsGenerating,
    textModelQueue,
    setTextModelQueue,
    textModelQueueRef,
    directorModelQueue,
    setDirectorModelQueue,
    directorModelQueueRef,
    visionModelQueue,
    setVisionModelQueue,
    visionModelQueueRef,
    imageModelQueue,
    setImageModelQueue,
    imageModelQueueRef,
    musicModelQueue,
    setMusicModelQueue,
    musicModelQueueRef,
    longTermMemories,
    isProcessingRef,
    isSummarizing,
    setIsSummarizing,
    pendingImage,
    setPendingImage,
    summarizeChat,
    handleSendInternal,
    handleSend,
  };
}
