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
  setLoadingProgress: React.Dispatch<React.SetStateAction<Record<string, { progress: number; status: string }>>>
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
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last && last.role === "assistant") {
              return [...prev.slice(0, -1), { ...last, content: last.content + token, isQueued: false }];
            }
            return prev;
          });
        }
      );

      if (category === "image-gen") {
        setMessages(prev => [...prev.slice(0, -1), { role: "assistant", content: "Image generated successfully.", image: result as string }]);
      } else if (category === "music-gen") {
        setMessages(prev => [...prev.slice(0, -1), { role: "assistant", content: "Audio synthesized successfully.", audio: (result as any).audio }]);
      } else {
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last && last.role === "assistant") {
            const finalContent = last.content || (result as string) || "";
            return [...prev.slice(0, -1), { ...last, content: finalContent, isQueued: false }];
          }
          return prev;
        });
      }

      // Automatic memory indexing for completed interactions if active
      if (enableRAG && (category === "text" || category === "coder")) {
        // Index the user prompt and the generated AI answer asynchronously
        indexMemory(text);
        if (typeof result === "string" && result) {
          indexMemory(result);
        }
      }
      
      addLog(`Engine: Task complete.`, "success");
    } catch (err: any) {
      addLog(`Engine Error: ${err?.message || err?.toString() || "Unknown error occurred during inference"}`, "error");
      setMessages(prev => [...prev.slice(0, -1), { role: "assistant", content: `Error: ${err?.message || "Inference failed."}` }]);
    } finally {
      setIsGenerating(false);
      setIsModelLoading(false);
      setLoadingProgress({});
    }
  }, [selectedModels, addLog, enableRAG, indexMemory, loadModel, setIsModelLoading, setLoadingProgress]);

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
      await browserEngine.unloadDirector();
      addLog(`System: Routed to ${category} engine by Director.`, "success");
    }

    await performLocalInference(finalInput, category, finalOptions);
  }, [input, pendingImage, isCoderMode, chatMode, performLocalInference, addLog, setIsModelLoading, setLoadingProgress]);

  const handleSendInternal = useCallback(async (text: string, systemPrompt?: string, role: "user" | "system" = "user", hidden = false) => {
    if (!text.trim()) return;
    if (!hidden) setMessages(prev => [...prev, { role, content: text, hidden }]);
    const cat = isCoderMode ? "coder" : "text";
    await performLocalInference(text, cat, { systemPrompt });
  }, [isCoderMode, performLocalInference]);

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
