import { useState, useRef, useCallback, useEffect, MutableRefObject } from "react";
import { Message, ChatMode } from "../types";

export function useChatLogic(
  worker: MutableRefObject<Worker | null>,
  chatMode: ChatMode,
  enableRAG: boolean,
  loadedModelId: string | null,
  selectedModels: Record<string, string>,
  loadModel: (cat: string, id?: string) => void,
  addLog: (msg: string, type?: "info" | "error" | "success") => void
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

    // Use WebSocket for streaming from the backend engine
    try {
      const socket = new WebSocket(`ws://${window.location.host}`);
      
      socket.onopen = () => {
        socket.send(JSON.stringify({
          type: "GENERATE",
          prompt: input,
          modelId: selectedModels.text || "phi-3-mini",
          category: "text"
        }));
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "TOKEN") {
          setMessages(prev => {
            // Check if transition from user message to assistant response
            if (prev[prev.length - 1].role === "user") {
              return [...prev, { role: "assistant", content: data.text }];
            }
            
            // Otherwise update last assistant message
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
          socket.close();
        }
      };

      socket.onerror = (err) => {
        console.error("WebSocket error:", err);
        setIsGenerating(false);
        addLog("WebSocket connection error", "error");
      };
    } catch (err) {
      console.error("Failed to connect to WebSocket:", err);
      setIsGenerating(false);
    }
    
    setInput("");
  }, [input, selectedModels, addLog]);

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
