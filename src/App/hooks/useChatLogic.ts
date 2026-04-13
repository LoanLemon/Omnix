import { useState, useRef, useCallback, useEffect, MutableRefObject } from "react";
import { Message, ChatMode } from "../types";
import { memoryStore } from "../../lib/memory";
import { tts } from "../../lib/tts";
import { MODELS } from "../../modelList";

import { TEXT_SYSTEM_PROMPT, CODER_SYSTEM_PROMPT, DIRECTOR_SYSTEM_PROMPT, getModePrompt } from "../../promptLibrary/systemPrompts";

export function useChatLogic(
  worker: MutableRefObject<Worker | null>,
  chatMode: ChatMode,
  enableRAG: boolean,
  loadedModelId: string | null,
  selectedModels: Record<string, string>,
  loadModel: (cat: string, id?: string) => void,
  addLog: (msg: string, type?: "info" | "error" | "success") => void,
  ramLimitPercent: number,
  setMemoryUsage: (val: { used: number; total: number }) => void,
  activeCategory: string,
  resetSpeech?: () => void,
  isCoderMode?: boolean,
  isHiddenRef?: MutableRefObject<boolean>,
  isLiveModeRef?: MutableRefObject<boolean>,
  isRoutingRef?: MutableRefObject<boolean>
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [textModelQueue, setTextModelQueue] = useState<{ text: string; systemPrompt?: string; role?: "user" | "system"; hidden?: boolean }[]>([]);
  const [directorModelQueue, setDirectorModelQueue] = useState<{ text: string }[]>([]);
  const [visionModelQueue, setVisionModelQueue] = useState<{ image: string; prompt: string }[]>([]);
  const [imageModelQueue, setImageModelQueue] = useState<{ prompt: string }[]>([]);
  const [musicModelQueue, setMusicModelQueue] = useState<{ prompt: string }[]>([]);
  const musicModelQueueRef = useRef(musicModelQueue);
  const textModelQueueRef = useRef(textModelQueue);
  const directorModelQueueRef = useRef(directorModelQueue);
  const visionModelQueueRef = useRef(visionModelQueue);
  const imageModelQueueRef = useRef(imageModelQueue);

  useEffect(() => { musicModelQueueRef.current = musicModelQueue; }, [musicModelQueue]);
  useEffect(() => { textModelQueueRef.current = textModelQueue; }, [textModelQueue]);
  useEffect(() => { directorModelQueueRef.current = directorModelQueue; }, [directorModelQueue]);
  useEffect(() => { visionModelQueueRef.current = visionModelQueue; }, [visionModelQueue]);
  useEffect(() => { imageModelQueueRef.current = imageModelQueue; }, [imageModelQueue]);

  const [longTermMemories, setLongTermMemories] = useState(0);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const isProcessingRef = useRef(false);
  const isSummarizingRef = useRef(false);

  useEffect(() => {
    isSummarizingRef.current = isSummarizing;
  }, [isSummarizing]);

  const summarizeChat = useCallback(async () => {
    if (!worker.current || isSummarizingRef.current) return;
    
    const contextSize = messages.reduce((acc, m) => acc + m.content.length, 0);
    if (contextSize < 12000) return; // Increased threshold to 12k chars (~3k tokens)

    setIsSummarizing(true);
    addLog("Context limit reached. Formulating summary to prune memory...", "info");

    const fullContext = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");

    // 1. Send summarization request FIRST while the text model is still loaded
    worker.current.postMessage({
      type: "generate",
      data: {
        text: "Summarize our entire conversation so far in 500 characters or less. Be concise and capture all key points, especially any active tasks or goals.",
        messages: [
          { role: "system", content: "You are a summarization assistant. Summarize the following conversation in 500 characters or less." },
          { role: "user", content: fullContext }
        ],
        max_new_tokens: 300
      }
    });

    // 2. Archive to long-term memory if RAG is enabled
    if (enableRAG) {
      addLog("Archiving context to long-term memory...", "info");
      // Parse by punctuations and newlines
      const chunks = fullContext.split(/[.!?\n]+/).filter(c => c.trim().length > 20);
      
      const embedModel = MODELS.find(m => m.id === "nomic-embed-text-v1.5");
      if (embedModel) {
        // This will be queued AFTER the generate request in the worker
        const isEmbedLoaded = loadedModelId === `${embedModel.modelID}@main`;
        if (!isEmbedLoaded) {
          loadModel("text", embedModel.id);
        }
        
        // Send chunks to worker for embedding - these will be queued after the load
        for (const chunk of chunks.slice(0, 50)) { // Limit to 50 chunks to avoid flooding
          worker.current.postMessage({
            type: "embed",
            data: { 
              text: chunk.trim(), 
              metadata: { type: "archive", timestamp: Date.now() } 
            }
          });
        }
        setLongTermMemories(prev => prev + Math.min(chunks.length, 50));
      }
    }
  }, [messages, enableRAG, worker, loadedModelId, loadModel, addLog]);

  const handleSendInternal = useCallback((userInput: string, systemContext?: string, role: "user" | "system" = "user", hidden: boolean = false) => {
    if (!worker.current) {
      setIsGenerating(false);
      isProcessingRef.current = false;
      return;
    }
    if (resetSpeech) resetSpeech();
    isProcessingRef.current = true;
    setIsGenerating(true);
    if (isHiddenRef) isHiddenRef.current = hidden;
    
    const defaultSystemPrompt = isCoderMode 
      ? CODER_SYSTEM_PROMPT 
      : `${TEXT_SYSTEM_PROMPT}
    
    CURRENT MODE: ${chatMode.toUpperCase()}
    ${getModePrompt(chatMode)}`;

    setMessages(prev => {
      let newMessages = [...prev];
      
      // Find the last queued user message and mark it as processed
      const lastQueuedIndex = [...newMessages].reverse().findIndex(m => m.role === "user" && m.isQueued);
      if (lastQueuedIndex !== -1) {
        const actualIndex = newMessages.length - 1 - lastQueuedIndex;
        newMessages[actualIndex] = { ...newMessages[actualIndex], isQueued: false };
      }

      // If this is a hidden call (like routing), we still add it to the state 
      // so it's included in the worker's context, but it will be filtered out in the UI.
      const lastMessage = newMessages[newMessages.length - 1];
      if (role === "user" && !hidden && lastMessage && lastMessage.role === "user" && lastMessage.hidden && lastMessage.content === userInput) {
        // If we're un-hiding a previously hidden routing message
        lastMessage.hidden = false;
      } else if (role === "user" && lastQueuedIndex !== -1) {
        // If it's a normal user message and we just un-queued it, update its content
        const actualIndex = newMessages.length - 1 - lastQueuedIndex;
        newMessages[actualIndex].content = userInput;
        newMessages[actualIndex].isQueued = false;
        newMessages[actualIndex].hidden = hidden;
      } else {
        // Otherwise push a new message (hidden or system or non-queued user)
        newMessages.push({ role, content: userInput, hidden });
      }

      const chatMessages = (systemContext || defaultSystemPrompt)
        ? [{ role: "system", content: systemContext || defaultSystemPrompt }, ...newMessages]
        : newMessages;

      // Ensure roles alternate (user/assistant/user/assistant)
      // This fixes the "Conversation roles must alternate" error
      const sanitizedMessages: { role: string; content: string }[] = [];
      for (const msg of chatMessages) {
        const last = sanitizedMessages[sanitizedMessages.length - 1];
        if (last && last.role === msg.role) {
          // Merge consecutive messages of the same role
          last.content += "\n\n" + msg.content;
        } else {
          sanitizedMessages.push({ role: msg.role, content: msg.content });
        }
      }

      worker.current?.postMessage({
        type: "generate",
        data: { 
          text: userInput, 
          messages: sanitizedMessages,
          max_new_tokens: 1024 
        },
      });
      return newMessages;
    });

    setInput("");
  }, [worker, chatMode, resetSpeech, isCoderMode, isHiddenRef]);

  const isProcessingQueueRef = useRef(false);

  // Process the queue
  useEffect(() => {
    const textCategories = ["text", "director", "coder"];
    const currentCategory = textCategories.includes(activeCategory) ? activeCategory : "text";
    const textModel = MODELS.find(m => m.id === selectedModels[currentCategory]);
    const isTextModelLoaded = loadedModelId === `${textModel?.modelID}@${textModel?.path || 'main'}`;

    if (textModelQueue.length > 0 && isTextModelLoaded && !isGenerating && !isProcessingQueueRef.current) {
      isProcessingQueueRef.current = true;
      const next = textModelQueue[0];
      setTextModelQueue(prev => prev.slice(1));
      handleSendInternal(next.text, next.systemPrompt, next.role, next.hidden);
      
      // Reset the ref after a short delay to allow state updates to propagate
      setTimeout(() => {
        isProcessingQueueRef.current = false;
      }, 100);
    }
  }, [textModelQueue, loadedModelId, selectedModels, handleSendInternal, isGenerating, activeCategory]);

  const checkAndEvictContext = useCallback(async () => {
    const contextSize = messages.reduce((acc, m) => acc + m.content.length, 0);
    const totalRam = (performance as any).memory?.jsHeapSizeLimit || 4 * 1024 * 1024 * 1024;
    setMemoryUsage({ used: contextSize, total: totalRam });

    if (contextSize > 8000) {
      await summarizeChat();
    }
  }, [messages, summarizeChat, setMemoryUsage]);

  const handleSend = useCallback(async () => {
    if ((!input.trim() && !pendingImage) || !worker.current) return;
    
    const userInput = input;
    const currentImage = pendingImage;
    setInput("");
    setPendingImage(null);
    
    // Add to chat immediately with loading state
    setMessages(prev => [...prev, { role: "user", content: userInput || (currentImage ? "Analyze this image" : ""), image: currentImage || undefined, isQueued: true }]);
    
    if (resetSpeech) resetSpeech();
    await checkAndEvictContext();
 
    if (currentImage) {
      addLog("Image detected. Queuing for vision model...", "info");
      setVisionModelQueue(prev => [...prev, { image: currentImage, prompt: userInput || "Describe this image in detail." }]);
      return;
    }

    if (chatMode === "text") {
      setTextModelQueue(prev => [...prev, { text: userInput }]);
      return;
    }

    if (chatMode === "image") {
      setImageModelQueue(prev => [...prev, { prompt: userInput }]);
      return;
    }

    if (chatMode === "music") {
      setMusicModelQueue(prev => [...prev, { prompt: userInput }]);
      return;
    }

    if (chatMode === "sandbox" || isCoderMode) {
      setTextModelQueue(prev => [...prev, { text: userInput }]);
      return;
    }

    if (chatMode === "live" || isLiveModeRef?.current) {
      setTextModelQueue(prev => [...prev, { text: userInput }]);
      return;
    }

    // Route through director model (Auto)
    addLog("Routing through director model...", "info");
    setDirectorModelQueue(prev => [...prev, { text: userInput }]);
  }, [input, enableRAG, loadedModelId, loadModel, checkAndEvictContext, addLog, worker, handleSendInternal, resetSpeech, isCoderMode, activeCategory, isLiveModeRef]);

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
    setLongTermMemories,
    isSummarizing,
    setIsSummarizing,
    pendingImage,
    setPendingImage,
    summarizeChat,
    isProcessingRef,
    handleSendInternal,
    handleSend
  };
}
