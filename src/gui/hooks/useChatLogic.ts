import { useState, useRef, useCallback, useEffect } from "react";
import { Message, ChatMode } from "@shared/types";
import { MODELS } from "@shared/modelList";
import { browserEngine } from "@/lib/ModelEngine";
import { memoryStore } from "@/lib/memory";

export function useChatLogic(
  messages: Message[],
  setMessages: React.Dispatch<React.SetStateAction<any[]>>,
  sendInference: (payload: any) => void,
  chatMode: ChatMode,
  enableRAG: boolean,
  loadedModelId: string | null,
  selectedModels: Record<string, string>,
  loadModel: (category: string, modelId?: string) => Promise<void>,
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
  setLoadingProgress: React.Dispatch<React.SetStateAction<Record<string, { progress: number; status: string }>>>,
  thinkEnabled?: boolean
) {
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
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

  useEffect(() => { textModelQueueRef.current = textModelQueue; }, [textModelQueue]);
  useEffect(() => { directorModelQueueRef.current = directorModelQueue; }, [directorModelQueue]);
  useEffect(() => { visionModelQueueRef.current = visionModelQueue; }, [visionModelQueue]);
  useEffect(() => { imageModelQueueRef.current = imageModelQueue; }, [imageModelQueue]);
  useEffect(() => { musicModelQueueRef.current = musicModelQueue; }, [musicModelQueue]);

  const [longTermMemories, setLongTermMemories] = useState(0);
  const isProcessingRef = useRef(false);

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

  const indexMemory = useCallback(async (content: string) => {
    if (!content || content.trim().length < 5) return;
    try {
      console.log("Adding memory indices for:", content.substring(0, 30));
      const embedding = await browserEngine.getEmbedding(content);
      await memoryStore.add({
        id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
        text: content,
        embedding,
        timestamp: Date.now()
      });
      await refreshMemoryCount();
    } catch (e) {
      console.warn("RAG Indexer Failure:", e);
    }
  }, [refreshMemoryCount]);

  const performLocalInference = useCallback(async (text: string, category: string, options: any = {}) => {
    setIsGenerating(true);
    addLog(`Engine: Executing ${category} task...`, "info");
    
    // Add assistant message for streaming
    setMessages(prev => [...prev, { role: "assistant", content: "", isQueued: true }]);

    try {
      // Ensure the correct model is loaded and sync React state
      const targetModelId = options.modelId || (category === "text" ? selectedModels.text : selectedModels[category]);
      await loadModel(category, targetModelId);

      // Contextual RAG retrieval if enabled
      let contextNotes = "";
      if (enableRAG && (category === "text" || category === "coder")) {
        addLog("Retrieving related memories via Semantic Cosine Similarity search...", "info");
        try {
          const queryVector = await browserEngine.getEmbedding(text, (p) => {
            if (p.status === "progress") {
              setIsModelLoading(true);
              setLoadingProgress(prev => ({
                ...prev,
                [p.file]: { progress: p.progress, status: `Downloading vector indices...` }
              }));
            }
          });
          const matches = await memoryStore.search(queryVector, 3, 0.45);
          if (matches && matches.length > 0) {
            contextNotes = matches.map(m => `[Recalled Memory]: ${m.text}`).join("\n");
            addLog(`Semantic match successful: Recalled ${matches.length} context nodes.`, "success");
          } else {
            addLog("No semantic memories matched query threshold.", "info");
          }
        } catch (ragRErr: any) {
          console.warn("RAG retrieval failed:", ragRErr);
        }
      }

      let finalSystemPrompt = options.systemPrompt || "";
      if (contextNotes) {
        finalSystemPrompt = (finalSystemPrompt ? `${finalSystemPrompt}\n\n` : "") + 
          `Here are some recalled memories from past interactions to help you maintain continuous context:\n${contextNotes}`;
      }

      let accumulatedText = "";
      const result = await browserEngine.runInference(
        category,
        text,
        {
          ...options,
          systemPrompt: finalSystemPrompt || undefined,
          modelId: targetModelId,
          progress_callback: (p: any) => {
            if (p.status === "progress") {
              setIsModelLoading(true);
              setLoadingProgress(prev => ({
                ...prev,
                [p.file]: { progress: p.progress, status: `Downloading ${p.file}` }
              }));
            } else if (p.status === "init" || p.status === "loaded") {
              setLoadingProgress(prev => ({
                ...prev,
                [p.file || "engine"]: { progress: 100, status: p.status === "init" ? `Initializing ${p.file || "Engine"}` : "Model Loaded" }
              }));
            }
          }
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
                cleanText = accumulatedText.substring(0, openIdx) + accumulatedText.substring(closeIdx + 8);
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

            setMessages(prev => {
              const filtered = prev.filter(m => !m.isThinking);
              const last = filtered[filtered.length - 1];
              if (last && last.role === "assistant") {
                return [...filtered.slice(0, -1), { ...last, content: displayContent, isQueued: false }];
              }
              return filtered;
            });
          } else {
            setMessages(prev => {
              const filtered = prev.filter(m => !m.isThinking);
              const last = filtered[filtered.length - 1];
              if (last && last.role === "assistant") {
                return [...filtered.slice(0, -1), { ...last, content: last.content + token, isQueued: false }];
              }
              return filtered;
            });
          }
        }
      );

      if (category === "image-gen") {
        setMessages(prev => [...prev.filter(m => !m.isThinking && !m.isQueued), { role: "assistant", content: "Image generated successfully.", image: result as string }]);
      } else if (category === "music-gen") {
        setMessages(prev => [...prev.filter(m => !m.isThinking && !m.isQueued), { role: "assistant", content: "Audio synthesized successfully.", audio: (result as any).audio }]);
      } else {
        setMessages(prev => {
          const filtered = prev.filter(m => !m.isThinking);
          const last = filtered[filtered.length - 1];
          if (last && last.role === "assistant") {
            let finalContent = last.content || (result as string) || "";
            if (category === "text" || category === "coder") {
              finalContent = finalContent.replace(/<think>[\s\S]*?<\/think>/gi, "");
              const thinkOpenIdx = finalContent.toLowerCase().indexOf("<think>");
              if (thinkOpenIdx !== -1) {
                finalContent = finalContent.substring(0, thinkOpenIdx);
              }
              finalContent = finalContent.replace(/<\|channel>thought[\s\S]*?<channel\|>/gi, "");
              finalContent = finalContent.trim();
            }
            return [...filtered.slice(0, -1), { ...last, content: finalContent, isQueued: false }];
          }
          return filtered;
        });
      }

      // Automatic memory indexing for completed interactions if active
      if (enableRAG && (category === "text" || category === "coder")) {
        // Index the user prompt and the generated AI answer asynchronously
        indexMemory(text);
        if (typeof result === "string" && result) {
          let cleanResult = result.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
          const thinkOpenIdx = cleanResult.toLowerCase().indexOf("<think>");
          if (thinkOpenIdx !== -1) {
            cleanResult = cleanResult.substring(0, thinkOpenIdx).trim();
          }
          indexMemory(cleanResult);
        }
      }
      
      addLog(`Engine: Task complete.`, "success");
    } catch (err: any) {
      addLog(`Engine Error: ${err?.message || err?.toString() || "Unknown error occurred during inference"}`, "error");
      setMessages(prev => {
        const filtered = prev.filter(m => !m.isThinking);
        return [...filtered.slice(0, -1), { role: "assistant", content: `Error: ${err?.message || "Inference failed."}` }];
      });
    } finally {
      setIsGenerating(false);
      setIsModelLoading(false);
      setLoadingProgress({});
    }
  }, [selectedModels, addLog, enableRAG, indexMemory, loadModel, setIsModelLoading, setLoadingProgress, thinkEnabled]);

  const summarizeChat = useCallback(async () => {
    addLog("Summarization logic not fully implemented yet", "info");
  }, [addLog]);

  const handleSend = useCallback(async () => {
    if (!input.trim() && !pendingImage) return;

    const currentInput = input;
    const currentImage = pendingImage;
    setInput("");
    setPendingImage(null);
    
    const userMsg: Message = { role: "user", content: currentInput, image: currentImage || undefined };
    setMessages(prev => [...prev, userMsg]);

    let category = currentImage ? "vision" : (isCoderMode ? "coder" : "text");
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
    let finalInput = currentImage || currentInput;
    let finalOptions: any = { prompt: currentImage ? currentInput : undefined };

    if (chatMode === "director" && !currentImage) {
      addLog("System: Engaging Director for task routing...", "info");
      const directorInfo = MODELS.find(m => m.id === selectedModels.director);
      const routing = await browserEngine.runDirectorInference(currentInput, directorInfo?.modelID, (p) => {
        if (p.status === "progress") {
          setIsModelLoading(true);
          setLoadingProgress(prev => ({
            ...prev,
            [p.file]: { progress: p.progress, status: `Downloading Director...` }
          }));
        }
      });
      category = routing.category;
      finalInput = routing.prompt;

      if (thinkEnabled && routing.thinking) {
        addLog("Director: Showing reasoning process in chat.", "info");
        setMessages(prev => [...prev, {
          role: "assistant",
          content: `💭 *Reasoning:* \n\n${routing.thinking}`,
          isThinking: true
        }]);
      }

      const targetModelId = category === "text" ? selectedModels.text : selectedModels[category];
      const targetModelInfo = MODELS.find(m => m.id === targetModelId);
      const isSameModel = targetModelInfo && directorInfo && (targetModelInfo.modelID === directorInfo.modelID);

      if (!isSameModel) {
        await browserEngine.unloadDirector();
        await new Promise(resolve => setTimeout(resolve, 500)); // Let WebGPU and GC settle completely before loading next model
      } else {
        addLog("System: Retaining Director as active text model (bypass reload).", "info");
      }
      
      addLog(`System: Routed to ${category} engine by Director.`, "success");
    }

    const chatHistory = [...messages, userMsg].filter(
      (m: any) => m.role === "user" || m.role === "assistant"
    ).slice(-10);

    finalOptions.chatHistory = chatHistory;

    await performLocalInference(finalInput, category, finalOptions);
  }, [input, pendingImage, isCoderMode, chatMode, performLocalInference, addLog, setIsModelLoading, setLoadingProgress, messages]);

  const handleSendInternal = useCallback(async (text: string, systemPrompt?: string, role: "user" | "system" = "user", hidden = false) => {
    if (!text.trim()) return;
    const userMsg: Message = { role, content: text, hidden };
    if (!hidden) setMessages(prev => [...prev, userMsg]);
    const cat = isCoderMode ? "coder" : "text";

    const chatHistory = [...messages, userMsg].filter(
      (m: any) => m.role === "user" || m.role === "assistant"
    ).slice(-10);

    await performLocalInference(text, cat, { systemPrompt, chatHistory });
  }, [isCoderMode, performLocalInference, messages]);

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
    handleSend
  };
}
