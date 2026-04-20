// Inside useChatLogic.ts
const handleSend = useCallback(async () => {
  if (!input.trim()) return;

  const userMsg = { role: "user", content: input };
  setMessages(prev => [...prev, userMsg]);
  setIsGenerating(true);

  // Use WebSocket for streaming
  const socket = new WebSocket("ws://localhost:3000");
  
  socket.onopen = () => {
    socket.send(JSON.stringify({
      type: "GENERATE",
      prompt: input,
      modelId: selectedModels.text,
      category: "text"
    }));
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "TOKEN") {
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last.role === "assistant") {
          return [...prev.slice(0, -1), { ...last, content: data.text }];
        }
        return [...prev, { role: "assistant", content: data.text }];
      });
    } else if (data.type === "COMPLETE") {
      setIsGenerating(false);
      socket.close();
    }
  };
}, [input, selectedModels]);