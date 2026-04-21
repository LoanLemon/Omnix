import { useState, useRef, useCallback, useEffect, MutableRefObject } from "react";
import { Message, ChatMode } from "../types";

export function useChatLogic(
  worker: MutableRefObject<Worker | null>,
  chatMode: ChatMode,
  enableRAG: boolean,
  loadedModelId: string | null,
  selectedModels: Record<string, string>,
  loadModel: (cat: string, id?: string) => void,
  addLog: (msg: string, type?: "info" | "error" | "success") => void,
  setIsModelLoading: (val: boolean) => void,
  setLoadingProgress: (val: any) => void
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

  const handleSendInternal = useCallback(async (userInput: string, _systemContext?: string, role: "user" | "system" = "user", hidden: boolean = false) => {
    if (!userInput.trim()) return;
    const userMsg: Message = { role, content: userInput, hidden };
    setMessages(prev => [...prev, userMsg]);
    // For now, internal sending just adds to message history
  }, []);

  const summarizeChat = useCallback(async () => {
    // Summarization logic can be added here
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setIsGenerating(true);

    const connectAndSend = (retryCount = 0) => {
      const isElectron = !!(window as any).electron;
      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      const host = isElectron ? "localhost:9777" : window.location.host;
      
      try {
        const socket = new WebSocket(`${protocol}://${host}`);
        
        socket.onopen = () => {
          addLog("Connected to Omnix Engine.", "success");
          setIsModelLoading(true); // WebSocket engine will likely need to load/swap the model
          socket.send(JSON.stringify({
            type: "GENERATE",
            prompt: input,
            modelId: selectedModels.text || "phi-3-mini",
            category: "text"
          }));
        };

        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === "PROGRESS") {
            const progressInfo = data.data;
            const progressValue = isNaN(progressInfo.progress) ? 0 : progressInfo.progress;
            
            setLoadingProgress((prev: any) => ({
              ...prev,
              [progressInfo.file || "engine-model"]: {
                progress: progressInfo.status === "done" ? 100 : progressValue,
                status: progressInfo.status || "loading"
              }
            }));
            
            addLog(`Engine Progress: ${progressInfo.status} ${Math.round(progressValue)}%`);
          } else if (data.type === "TOKEN") {
            setIsModelLoading(false); // Once tokens flow, loading is definitely done
            setMessages(prev => {
              if (prev[prev.length - 1].role === "user") {
                return [...prev, { role: "assistant", content: data.text }];
              }
              const newMessages = [...prev];
              for (let i = newMessages.length - 1; i >= 0; i--) {
                if (newMessages[i].role === "assistant") {
                  newMessages[i] = { ...newMessages[i], content: data.text };
                  break;
                }
              }
              return newMessages;
            });
          } else if (data.type === "COMPLETE") {
            setIsGenerating(false);
            setIsModelLoading(false);
            setLoadingProgress({});
            socket.close();
          } else if (data.type === "ERROR") {
            addLog(`Engine Error: ${data.message}`, "error");
            setIsGenerating(false);
            setIsModelLoading(false);
            socket.close();
          }
        };

        socket.onerror = (err) => {
          console.error("WebSocket error:", err);
          if (retryCount < 3) {
            addLog(`Retrying connection to engine (${retryCount + 1}/3)...`, "info");
            setTimeout(() => connectAndSend(retryCount + 1), 1000);
          } else {
            addLog("Could not connect to Omnix Engine. Please check if the local server is running.", "error");
            setIsGenerating(false);
          }
        };
      } catch (err) {
        console.error("Failed to connect to WebSocket:", err);
        setIsGenerating(false);
      }
    };

    connectAndSend();
    setInput("");
  }, [input, selectedModels, addLog, setIsModelLoading, setLoadingProgress]);

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
