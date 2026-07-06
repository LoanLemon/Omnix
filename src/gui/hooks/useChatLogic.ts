import { useState, useRef, useCallback, useEffect } from "react";
import { Message, ChatMode, FocusTopic, ErrorReport } from "@shared/types";
import { MODELS } from "@shared/modelList";
import { browserEngine } from "@/lib/ModelEngine";
import { memoryStore } from "@/lib/memory";
import { parseMarkdownToolCalls } from "@/lib/parseMarkdownToolCalls";
import {
  TEXT_SYSTEM_PROMPT,
  gemma4TextSystemPrompt,
  getCoderSystemPrompt,
  IMAGE_SYSTEM_PROMPT,
  MUSIC_SYSTEM_PROMPT,
  LIVE_SYSTEM_PROMPT,
  DIRECTOR_SYSTEM_PROMPT,
  formatMemoryPrompt,
  formatMemoriesAsTable,
  distillMemories,
  formatConversationTranscript,
  getToneInstruction,
} from "@shared/prompts";

export const getFormattedTimestamp = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

function chunkText(text: string, maxLength: number): string[] {
  if (text.length <= maxLength) return [text];
  
  const chunks: string[] = [];
  let currentText = text;
  
  while (currentText.length > maxLength) {
    let splitIndex = -1;
    const searchArea = currentText.substring(0, maxLength);
    
    // Primary: Double line break
    splitIndex = searchArea.lastIndexOf('\n\n');
    
    // Secondary: Single line break
    if (splitIndex === -1) {
      splitIndex = searchArea.lastIndexOf('\n');
    }
    
    // Code breaks
    if (splitIndex === -1) {
      const braceIndex = searchArea.lastIndexOf('}');
      const bracketIndex = searchArea.lastIndexOf('>');
      splitIndex = Math.max(braceIndex, bracketIndex);
    }
    
    // Comma fallback
    if (splitIndex === -1) {
      splitIndex = searchArea.lastIndexOf(',');
    }
    
    // Hard fallback
    if (splitIndex === -1 || splitIndex === 0) {
      splitIndex = maxLength - 1;
    } else {
      // Include the separator in the current chunk if it's not a hard fallback
      splitIndex += 1;
    }
    
    chunks.push(currentText.substring(0, splitIndex));
    currentText = currentText.substring(splitIndex);
  }
  
  if (currentText.length > 0) {
    chunks.push(currentText);
  }
  
  return chunks;
}

function loadWebviewTextAndResults(url: string, isInitialSearch: boolean, liveResearchEnabled?: boolean): Promise<{ text: string, results: string[] }> {
  const isElectron = typeof window !== "undefined" && window.navigator && window.navigator.userAgent && window.navigator.userAgent.includes("Electron");
  
  if (!isElectron || !liveResearchEnabled) {
    return fetch("/api/research", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url, isInitialSearch })
    })
    .then(r => r.json())
    .catch(err => {
      console.error("Failed to query /api/research proxy:", err);
      return { text: "", results: [] };
    });
  }

  return new Promise((resolve) => {
    try {
      const webview = document.createElement("webview") as any;
      webview.setAttribute("webpreferences", "contextIsolation=no");

      const popupContainer = liveResearchEnabled ? document.getElementById("live-research-popup-webview-container") : null;

      if (popupContainer) {
        webview.style.width = "100%";
        webview.style.height = "100%";
        webview.style.border = "none";
        webview.style.backgroundColor = "transparent";
        popupContainer.innerHTML = "";
        popupContainer.appendChild(webview);
      } else {
        webview.style.width = "0px";
        webview.style.height = "0px";
        webview.style.position = "absolute";
        webview.style.visibility = "hidden";
        document.body.appendChild(webview);
      }

      webview.src = url;

      let resolved = false;
      const cleanupAndResolve = (text: string, results: string[]) => {
        if (resolved) return;
        resolved = true;
        try {
          if (webview.parentNode) {
            webview.parentNode.removeChild(webview);
          }
        } catch (e) {
          console.error("Error removing webview:", e);
        }
        resolve({ text, results });
      };

      // Timeout safety: 15 seconds max
      const timeoutId = setTimeout(() => {
        cleanupAndResolve("", []);
      }, 15000);

      const onLoad = async () => {
        clearTimeout(timeoutId);
        try {
          // Execute script to get text and optional results
          const text = await webview.executeJavaScript("document.body.innerText || ''");
          let results: string[] = [];
          if (isInitialSearch) {
            results = await webview.executeJavaScript(`
              (() => {
                try {
                  let elements = Array.from(document.querySelectorAll('[data-testid="result-title-a"]'));
                  if (elements.length === 0) {
                    elements = Array.from(document.querySelectorAll('.organic__url, .organic__title a'));
                  }
                  if (elements.length === 0) {
                    elements = Array.from(document.querySelectorAll('.title a, .compTitle a'));
                  }
                  if (elements.length === 0) {
                    elements = Array.from(document.querySelectorAll('.result__title a, .result__snippet'));
                  }
                  if (elements.length === 0) {
                    elements = Array.from(document.querySelectorAll('h2 a'));
                  }
                  if (elements.length === 0) {
                    elements = Array.from(document.querySelectorAll('.result a'));
                  }
                  return elements.map(el => el.textContent || el.innerText || "").map(t => t.trim()).filter(Boolean);
                } catch (err) {
                  return [];
                }
              })()
            `);
          }
          cleanupAndResolve(text, results);
        } catch (err) {
          console.error("Error executing javascript in webview:", err);
          cleanupAndResolve("", []);
        }
      };

      webview.addEventListener("did-finish-load", onLoad);
      webview.addEventListener("did-fail-load", () => {
        clearTimeout(timeoutId);
        cleanupAndResolve("", []);
      });
    } catch (err) {
      console.error("Failed to create webview:", err);
      resolve({ text: "", results: [] });
    }
  });
}

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
  sandboxFiles?: any[],
  setSandboxFiles?: React.Dispatch<React.SetStateAction<any[]>>,
  currentStepIndex?: number,
  setCurrentStepIndex?: React.Dispatch<React.SetStateAction<number>>,
  enableMMRS?: boolean,
  feedSpeechToken?: (fullText: string) => void,
  flushSpeech?: (fullText: string) => void,
  speakEnabled?: boolean,
  researchEnabled?: boolean,
  liveResearchEnabled?: boolean,
  researchSrc?: string,
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
  const [activeResearch, setActiveResearch] = useState<{
    query: string;
    url: string;
    status: string;
    results: string[];
    deepDiveUrls: string[];
    currentDeepDiveIndex: number;
    currentDeepDiveUrl: string;
  } | null>(null);

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

      if (!options.qtype && selectedQtypes && selectedQtypes[targetModelId]) {
        options.qtype = selectedQtypes[targetModelId];
      }

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
        if (researchEnabled && category === "text") {
          const researchToolInstruction = `
## Research tool
For up-to-date news, or events output only "research: [query]"
Where [query] is the search query you want to run.

### Example 1
User says, "Can you give me the SpaceX launch date?"
You response, "research: latest SpaceX launch date"

### Example 2
User says, "Can you give me the latest news?"
Your resposne, "research: news"

### Constraints
- Output ONLY "research: [query]". 
- DO NOT attempt to generate the results!
- NEVER rely on interna data for news/events!
- NO Additional context, conversational text, or acknowledgements!
`;
          finalSystemPrompt =
            (finalSystemPrompt ? `${finalSystemPrompt}\n\n` : "") +
            researchToolInstruction;
        }

        const savedOcean = (() => {
          try {
            const saved = localStorage.getItem("breamu_ocean_personality");
            if (saved) return JSON.parse(saved);
          } catch (e) {}
          return undefined;
        })();
        if (savedOcean && (category === "text" || category === "vision" || category === "coder")) {
          const personalityBlock = getToneInstruction(savedOcean);
          if (personalityBlock) {
            finalSystemPrompt = `${personalityBlock}\n\n${finalSystemPrompt}`;
          }
        }
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
                    let actualContent = displayContent;
                    if (speakEnabled) {
                       actualContent = (thinkEnabled && thoughts.trim()) ? `<|channel>thought\n${thoughts.trim()}\n<channel|>\n` + (m.spokenContent || "") : (m.spokenContent || "");
                    }
                    return { ...m, content: actualContent, fullContent: displayContent, isQueued: false };
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

        // Check for Research Tool call
        let cleanTextResult = (typeof result === "string" ? result : accumulatedText)
          .replace(/<think>[\s\S]*?<\/think>/gi, "")
          .replace(/<\|channel>thought[\s\S]*?<channel\|>/gi, "")
          .trim();
        
        const researchMatch = cleanTextResult.match(/^research:\s*(.+)$/i);

        if (researchEnabled && category === "text" && researchMatch && assistantMsgId) {
          const searchQuery = researchMatch[1].trim();
          addLog(`Research Tool: Triggered search query "${searchQuery}"`, "info");
          
          setMessages((prev) => {
            return prev.map((m) => {
              if (m.id === assistantMsgId) {
                return {
                  ...m,
                  content: `🔍 *Researching:* "${searchQuery}"...`,
                  isQueued: true
                };
              }
              return m;
            });
          });

          const chosenSrc = researchSrc || "https://duckduckgo.com/?q=[query]&ia=web";
          const initialUrl = chosenSrc.replace("[query]", encodeURIComponent(searchQuery));

          try {
            addLog(`Research Tool: Loading initial search page: ${initialUrl}`, "info");
            
            // Set active research state
            setActiveResearch({
              query: searchQuery,
              url: initialUrl,
              status: "Loading Search Page",
              results: [],
              deepDiveUrls: [],
              currentDeepDiveIndex: -1,
              currentDeepDiveUrl: ""
            });

            const initialData = await loadWebviewTextAndResults(initialUrl, true, liveResearchEnabled);
            addLog(`Research Tool: Initial search loaded. Found ${initialData.results.length} results.`, "info");
            
            const resultsToResearch = initialData.results.slice(0, 3);
            const deepDiveUrls = resultsToResearch.map(resTitle =>
              chosenSrc.replace("[query]", encodeURIComponent(resTitle))
            );

            setActiveResearch({
              query: searchQuery,
              url: initialUrl,
              status: "Identifying Deep-Dive Subjects",
              results: resultsToResearch,
              deepDiveUrls: deepDiveUrls,
              currentDeepDiveIndex: -1,
              currentDeepDiveUrl: ""
            });
            
            setMessages((prev) => {
              return prev.map((m) => {
                if (m.id === assistantMsgId) {
                  return {
                    ...m,
                    content: `🔍 *Researching:* "${searchQuery}"\n\nDigging deeper into top results:\n${resultsToResearch.map((r, i) => `${i + 1}. ${r}`).join("\n")}`,
                  };
                }
                return m;
              });
            });

            // Load secondary results in parallel to speed up results by 3x!
            addLog("Research Tool: Fetching deep-dive pages in parallel...", "info");
            const deepDivePromises = deepDiveUrls.map(async (url, i) => {
              addLog(`Research Tool: Loading deep-dive page (${i + 1}/${resultsToResearch.length}): ${url}`, "info");
              const output = await loadWebviewTextAndResults(url, false, liveResearchEnabled);
              return output;
            });
            const researchOutputs = await Promise.all(deepDivePromises);
            
            const cleanAndTrim = (rawText: string) => {
              const stripped = rawText.replace(/<[^>]*>/g, "").trim();
              return stripped.substring(0, 1000);
            };

            const initialTextCleaned = cleanAndTrim(initialData.text);
            const secondaryTextsCleaned = researchOutputs.map(output => cleanAndTrim(output.text));

            const combinedResearchData = `
Primary Search Results for "${searchQuery}":
${initialTextCleaned}

Deep Research results:
${secondaryTextsCleaned.map((txt, i) => `Result ${i + 1} ("${resultsToResearch[i]}"):\n${txt}`).join("\n\n")}
`.trim();

            setActiveResearch({
              query: searchQuery,
              url: initialUrl,
              status: "Analyzing Research Material",
              results: resultsToResearch,
              deepDiveUrls: deepDiveUrls,
              currentDeepDiveIndex: resultsToResearch.length,
              currentDeepDiveUrl: ""
            });

            setMessages((prev) => {
              return prev.map((m) => {
                if (m.id === assistantMsgId) {
                  return {
                    ...m,
                    content: `🔍 *Researching:* "${searchQuery}"\n\nAnalyzing and summarizing gathered research data...`,
                  };
                }
                return m;
              });
            });

            addLog("Research Tool: Summarizing research data...", "info");
            const summaryPrompt = `Please summarize the following web research data concisely. Highlight the key facts and details that are most relevant.

Research Data:
${combinedResearchData}`;

            let summaryResult = "";
            await browserEngine.runInference(
              "text",
              summaryPrompt,
              {
                ...options,
                chatHistory: [], // empty chat history for intermediate summary
                systemPrompt: "You are an expert research analyst summarizing web search results.",
                progress_callback: () => {},
              },
              (token) => {
                summaryResult += token;
                setMessages((prev) => {
                  return prev.map((m) => {
                    if (m.id === assistantMsgId) {
                      return {
                        ...m,
                        content: `🔍 *Researching:* "${searchQuery}"\n\n*Summary of findings:* \n\n${summaryResult}`,
                      };
                    }
                    return m;
                  });
                });
              }
            );
            
            addLog("Research Tool: Summary complete. Generating final response to user query...", "success");

            setActiveResearch({
              query: searchQuery,
              url: initialUrl,
              status: "Generating Final Response",
              results: resultsToResearch,
              deepDiveUrls: deepDiveUrls,
              currentDeepDiveIndex: resultsToResearch.length,
              currentDeepDiveUrl: ""
            });

            setMessages((prev) => {
              return prev.map((m) => {
                if (m.id === assistantMsgId) {
                  return {
                    ...m,
                    content: `🔍 *Researching:* "${searchQuery}"\n\n*Summary of findings:* \n\n${summaryResult}\n\n---\n\n*Generating final response...*`,
                  };
                }
                return m;
              });
            });

            // Feed user's prompt and results summary to AI
            const finalSystemPromptWithResults = `${options.systemPrompt || ""}\n\n[RESEARCH RESULTS SUMMARY]\n${summaryResult}\n\nUse the summarized research findings above to comprehensively and accurately answer the user's question. Reference key details from the research as appropriate.`;

            let finalResponse = "";
            await browserEngine.runInference(
              "text",
              text, // original user query
              {
                ...options,
                systemPrompt: finalSystemPromptWithResults,
                progress_callback: () => {},
              },
              (token) => {
                finalResponse += token;
                if (feedSpeechToken) {
                  feedSpeechToken(finalResponse);
                }
                setMessages((prev) => {
                  return prev.map((m) => {
                    if (m.id === assistantMsgId) {
                      return {
                        ...m,
                        content: finalResponse,
                        fullContent: finalResponse,
                        isQueued: false
                      };
                    }
                    return m;
                  });
                });
              }
            );

            if (flushSpeech) {
              flushSpeech(finalResponse);
            }

            if (enableRAG) {
              indexMemory(text, "User", "Input");
              indexMemory(finalResponse, "AI", "Output");
            }

            addLog(`Engine: Research task complete.`, "success");
          } catch (err: any) {
            addLog(`Research Tool: Error occurred: ${err?.message || err}`, "error");
            setMessages((prev) => {
              return prev.map((m) => {
                if (m.id === assistantMsgId) {
                  return {
                    ...m,
                    content: `❌ *Research failed:* ${err?.message || "An unexpected error occurred."}`,
                    isQueued: false
                  };
                }
                return m;
              });
            });
          } finally {
            setActiveResearch(null);
          }
          return; // Return early, skipping standard response-processing of the initial result
        }

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
                    if (!finalContent && (m.content || result)) {
                      finalContent = m.content || result || "";
                      // remove unclosed tags at the end for display if needed
                      finalContent = finalContent.replace(/<think>|<\|channel>thought/gi, "").trim();
                    }
                    if (flushSpeech) {
                      flushSpeech(finalContent);
                    }
                  }
                  let actualFinalContent = finalContent;
                  if (speakEnabled) {
                     const parsedThoughts = m.fullContent ? (m.fullContent.match(/<think>[\s\S]*?(?:<\/think>|$)/i) || m.fullContent.match(/<\|channel>thought\n[\s\S]*?(?:<channel\|>|$)/i)) : null;
                     const thoughtsText = parsedThoughts ? parsedThoughts[0] + "\n" : "";
                     actualFinalContent = thoughtsText + (m.spokenContent || "");
                  }

                  return {
                    ...m,
                    content: actualFinalContent,
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
            if (!cleanResult && result) {
               cleanResult = result.replace(/<think>|<\|channel>thought/gi, "").trim();
            }

            const toolCalls = parseMarkdownToolCalls(cleanResult);

            if (toolCalls.length === 0 && cleanResult.trim() !== "") {
              // Just a safety check if no tool calls were found, maybe throw or log.
              throw new Error("No tool calls found in response.");
            }

            for (let parsed of toolCalls) {
              if (parsed && parsed.tool) {
                let toolResponse = "";
                let shouldReply = false;

                if (parsed.tool === "write_file" && parsed.params && parsed.params.name) {
                  if (setSandboxFiles) {
                    setSandboxFiles((prev) => {
                      const newFile = {
                        name: parsed.params.name,
                        content: parsed.params.content || "",
                        language: parsed.params.language || "typescript",
                      };
                      const existingIdx = prev.findIndex((f) => f.name === newFile.name);
                      if (existingIdx >= 0) {
                        const updated = [...prev];
                        updated[existingIdx] = newFile;
                        return updated;
                      }
                      return [...prev, newFile];
                    });
                    addLog(`Sandbox: Wrote file ${parsed.params.name}`, "success");
                  }
                  toolResponse = `System: Successfully wrote ${parsed.params.name}. You may continue.`;
                  shouldReply = true;
                } else if (parsed.tool === "list_files") {
                  const files = sandboxFiles ? sandboxFiles.map(f => f.name).join("\n") : "";
                  toolResponse = `Files in sandbox:\n${files}`;
                  shouldReply = true;
                  addLog(`Sandbox: Listed files`, "info");
                } else if (parsed.tool === "read_file" && parsed.params && parsed.params.name) {
                  const file = sandboxFiles?.find(f => f.name === parsed.params.name);
                  if (file) {
                    toolResponse = `Content of ${parsed.params.name}:\n${file.content}`;
                  } else {
                    toolResponse = `File ${parsed.params.name} not found.`;
                  }
                  shouldReply = true;
                  addLog(`Sandbox: Read file ${parsed.params.name}`, "info");
                } else if (parsed.tool === "read_function" && parsed.params && parsed.params.name && parsed.params.function) {
                  toolResponse = "The read_function tool is currently limited. Please use read_file to view the entire file context instead.";
                  shouldReply = true;
                } else if (parsed.tool === "write_function" && parsed.params && parsed.params.name && parsed.params.function) {
                  toolResponse = "The write_function tool is currently limited. Please use read_file and write_file to overwrite the entire file with your changes.";
                  shouldReply = true;
                } else if (parsed.tool === "submit_step") {
                  if (chatMode === "sandbox" && currentStepIndex !== undefined && currentStepIndex >= 0 && currentStepIndex < 3 && setCurrentStepIndex) {
                    if (parsed.params && parsed.params.validated === "true") {
                      const stepNames = ["Action Plan", "File Structure", "Generation", "Linting"];
                      const nextStep = currentStepIndex + 1;
                      setCurrentStepIndex(nextStep);

                      // Automatically post the validated data to chat and move to the next workflow step
                      if (parsed.params.data) {
                        setMessages((prev) => [
                          ...prev,
                          {
                            id: Date.now().toString() + "-submitted",
                            role: "assistant",
                            content: `\`\`\`markdown\n# chat_user\n\n## message\n${parsed.params.data}\n\`\`\``,
                            timestamp: Date.now(),
                            category: "coder",
                          },
                        ]);
                      }

                      toolResponse = `System: Advanced to ${stepNames[nextStep]} step. Please proceed with the next step.`;
                      shouldReply = true;
                    } else {
                      toolResponse = `System: Please validate the completion of this step. Review your work carefully. If it is fully complete and correct, call submit_step again with the parameter 'validated' set to 'true' and include your 'data'. If not, continue working.`;
                      shouldReply = true;
                    }
                  }
                } else if (parsed.tool === "chat_user") {
                  addLog(`Sandbox: Messaged user`, "info");
                  // Removed automatic workflow progression from chat_user to ensure system manages it via submit_step
                }

                if (shouldReply) {
                  const uniqueId = Date.now().toString() + Math.random().toString(36).substring(2, 9);
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: uniqueId,
                      role: "user",
                      content: toolResponse,
                      timestamp: Date.now(),
                      category: "coder",
                    },
                  ]);

                  masterQueueRef.current.push({
                    category: "coder",
                    text: toolResponse,
                    options: { ...options, retryCount: 0 },
                  });
                }
              }
            }
          } catch (e: any) {
            // parsing failed, likely not a tool call or malformed
            const retryCount = options.retryCount || 0;
            if (retryCount < 3) {
              const errorMessage = `Your last response did not contain a valid Markdown Tool Call or failed to parse. Please try again and follow the AI Output Schema exactly. Do not write tutorials or raw text. Error: ${e.message}`;

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
                "Sandbox: AI failed to produce a valid Tool Call 3 times. Halting retries.",
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
            if (!cleanResult && result) {
               cleanResult = result.replace(/<think>|<\|channel>thought/gi, "").trim();
            }
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

          let routing;
          try {
            routing = await browserEngine.runDirectorInference(
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
          } catch (directorErr) {
            console.error("Director routing failed:", directorErr);
            addLog(`Director routing failed. Defaulting to text model.`, "error");
            routing = { category: "text", prompt: job.text, thinking: "" };
          }

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
            targetSystemPrompt = getCoderSystemPrompt(currentStepIndex);
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
        let limit = contextMemoryLimit || 8192;
        
        const actualTargetModelId =
          job.category === "text"
            ? selectedModels.text
            : selectedModels[job.category] || selectedModels.text;
        const actualTargetModelInfo = MODELS.find((m: any) => m.id === actualTargetModelId);
        
        if (actualTargetModelInfo && actualTargetModelInfo.maxContextChars) {
           const modelTokenLimit = Math.floor(actualTargetModelInfo.maxContextChars / 4);
           // Reserve 15% of context for system prompt and generation space
           limit = Math.min(limit, Math.floor(modelTokenLimit * 0.85));
        }

        const isElectron = typeof window !== "undefined" && !!(window as any).electron;
        if (!isElectron) {
          limit = Math.min(limit, 4096);
        }

        for (let i = filteredMessages.length - 1; i >= 0; i--) {
          const msg = filteredMessages[i];
          const msgLength = (msg.content?.length || 0) / 4 + (msg.image ? 125 : 0); // Approximate image length in tokens
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

    const currentModelId = isCoderMode ? selectedModels.coder : selectedModels[activeCategory] || selectedModels.text;
    const currentModel = MODELS.find((m: any) => m.id === currentModelId);
    const maxContext = currentModel?.maxContextChars || 8192;
    // Chunk at 80% of maxContext to ensure room for system prompt and generation space
    const chunkLimit = Math.floor(maxContext * 0.8);

    const chunks = currentImage ? [currentInput] : chunkText(currentInput, chunkLimit);

    const newMessages: Message[] = [];
    const jobs: any[] = [];

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
        if (setCurrentStepIndex && (currentStepIndex === -1 || currentStepIndex === undefined || currentStepIndex === 3)) {
          setCurrentStepIndex(0);
        }
      }
    }

    let systemPrompt = TEXT_SYSTEM_PROMPT;
    let actualStepIndex = currentStepIndex;
    if (chatMode === "sandbox" || isCoderMode) {
      if (chatMode === "sandbox" && (currentStepIndex === -1 || currentStepIndex === undefined || currentStepIndex === 3)) {
        actualStepIndex = 0;
      }
      systemPrompt = getCoderSystemPrompt(actualStepIndex);
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

    chunks.forEach((chunkTextItem, index) => {
      const userMsgId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2, 11);
      const assistantMsgId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2, 11);

      newMessages.push({
        id: userMsgId,
        role: "user",
        content: chunkTextItem,
        image: index === 0 && currentImage ? currentImage : undefined,
        timestamp: getFormattedTimestamp(),
      });
      
      newMessages.push({
        id: assistantMsgId,
        role: "assistant",
        content: "",
        isQueued: true,
        timestamp: getFormattedTimestamp(),
      });

      jobs.push({
        id:
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : Math.random().toString(36).substring(2, 11),
        category,
        chatMode,
        text: index === 0 && currentImage ? currentImage : chunkTextItem,
        options: {
          prompt: index === 0 && currentImage ? chunkTextItem : undefined,
          systemPrompt,
        },
        userMsgId,
        assistantMsgId,
        isDirector: chatMode === "director" && !currentImage,
        isInternal: false,
      });
    });

    setMessages((prev) => [...prev, ...newMessages]);
    jobs.forEach(job => pushJob(job));
  }, [input, pendingImage, isCoderMode, chatMode, pushJob, selectedModels, activeCategory, currentStepIndex, setCurrentStepIndex]);

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
    activeResearch,
    setActiveResearch,
    summarizeChat,
    handleSendInternal,
    handleSend,
  };
}
