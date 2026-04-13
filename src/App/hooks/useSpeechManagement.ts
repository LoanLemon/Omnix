import { useCallback } from "react";
import { tts } from "../../lib/tts";

export function useSpeechManagement(
  speakEnabledRef: React.MutableRefObject<boolean>,
  spokenTextLengthRef: React.MutableRefObject<number>,
  speechQueueRef: React.MutableRefObject<string[]>,
  isSpeakingRef: React.MutableRefObject<boolean>,
  setMessages: React.Dispatch<React.SetStateAction<any[]>>,
  isHiddenRef: React.MutableRefObject<boolean>
) {
  const processSpeechQueue = useCallback(async () => {
    if (isSpeakingRef.current || speechQueueRef.current.length === 0) return;
    
    isSpeakingRef.current = true;
    console.log(`Processing speech queue: ${speechQueueRef.current.length} chunks pending`);
    
    while (speechQueueRef.current.length > 0) {
      const chunk = speechQueueRef.current.shift();
      if (chunk) {
        try {
          console.log(`Speaking chunk: "${chunk.slice(0, 30)}..."`);
          await tts.speak(chunk);
        } catch (err) {
          console.error("Speech chunk playback failed:", err);
        }
      }
    }
    isSpeakingRef.current = false;
  }, [isSpeakingRef, speechQueueRef]);

  const handleAssistantUpdate = useCallback((output: string, stats: any) => {
    if (isHiddenRef.current) return;
    
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.role === "assistant") {
        return [...prev.slice(0, -1), { ...last, content: output, stats }];
      }
      return [...prev, { role: "assistant", content: output, stats }];
    });

    // Real-time TTS Chunking
    if (speakEnabledRef.current) {
      let currentText = output.slice(spokenTextLengthRef.current);
      const sentenceEndRegex = /[.!?\n]/;
      
      let match = currentText.match(sentenceEndRegex);
      while (match && match.index !== undefined) {
        const chunkEndIndex = spokenTextLengthRef.current + match.index + 1;
        const chunk = output.slice(spokenTextLengthRef.current, chunkEndIndex).trim();
        
        if (chunk && !chunk.startsWith('{') && !chunk.includes('"tool":')) {
          speechQueueRef.current.push(chunk);
          processSpeechQueue();
        }
        
        spokenTextLengthRef.current = chunkEndIndex;
        currentText = output.slice(spokenTextLengthRef.current);
        match = currentText.match(sentenceEndRegex);
      }
    }
  }, [setMessages, speakEnabledRef, spokenTextLengthRef, speechQueueRef, processSpeechQueue]);

  return {
    processSpeechQueue,
    handleAssistantUpdate
  };
}
