import { useCallback, useRef, useEffect } from "react";
import { tts } from "@/lib/tts";

const extractThoughts = (content: string) => {
  const thinkRegex = /<think>([\s\S]*?)(?:<\/think>|$)/i;
  const thinkMatch = content.match(thinkRegex);
  if (thinkMatch) {
    return { thoughts: `<think>${thinkMatch[1]}</think>\n` };
  }
  const thoughtMatch = content.match(/<\|channel>thought\n([\s\S]*?)(?:<channel\|>|$)/);
  if (thoughtMatch) {
    return { thoughts: `<|channel>thought\n${thoughtMatch[1]}<channel|>\n` };
  }
  return null;
};

export function useSpeechManagement(
  speakEnabledRef: React.MutableRefObject<boolean>,
  spokenTextLengthRef: React.MutableRefObject<number>,
  speechQueueRef: React.MutableRefObject<string[]>,
  isSpeakingRef: React.MutableRefObject<boolean>,
  setMessages: React.Dispatch<React.SetStateAction<any[]>>,
  isHiddenRef: React.MutableRefObject<boolean>,
  speakEnabled?: boolean
) {
  const wordTimerRef = useRef<any>(null);

  const clearTimer = useCallback(() => {
    if (wordTimerRef.current) {
      clearInterval(wordTimerRef.current);
      wordTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  useEffect(() => {
    if (!speakEnabled) {
      clearTimer();
    }
  }, [speakEnabled, clearTimer]);

  const processSpeechQueue = useCallback(async () => {
    if (isSpeakingRef.current || speechQueueRef.current.length === 0) return;
    
    isSpeakingRef.current = true;
    console.log(`Processing speech queue: ${speechQueueRef.current.length} chunks pending`);
    
    while (speechQueueRef.current.length > 0) {
      const chunk = speechQueueRef.current.shift();
      if (chunk) {
        try {
          console.log(`Speaking chunk: "${chunk.slice(0, 30)}..."`);
          
          clearTimer();
          
          // Generate audio buffer first to obtain precise timing
          let buffer: AudioBuffer;
          try {
            buffer = await tts.generate(chunk);
          } catch (genErr) {
            console.error("Audio buffer generation failed, falling back to direct speaking:", genErr);
            // Fallback: speak chunk immediately and reveal instantly
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.role === "assistant") {
                const prevCompleted = last.completedSpokenContent || "";
                const newCompleted = prevCompleted + (prevCompleted ? " " : "") + chunk;
                const parsed = last.fullContent ? extractThoughts(last.fullContent) : null;
                const thoughtsPart = parsed ? parsed.thoughts : "";
                
                return [
                  ...prev.slice(0, -1),
                  {
                    ...last,
                    completedSpokenContent: newCompleted,
                    spokenContent: newCompleted,
                    content: thoughtsPart + newCompleted
                  }
                ];
              }
              return prev;
            });
            await tts.speak(chunk);
            continue;
          }
          
          const duration = buffer.duration;
          const words = chunk.split(/\s+/).filter(Boolean);
          
          if (words.length > 0) {
            const delayPerWord = (duration * 1000) / words.length;
            let currentWordIndex = 0;
            
            wordTimerRef.current = setInterval(() => {
              if (currentWordIndex < words.length) {
                setMessages((prev) => {
                  const last = prev[prev.length - 1];
                  if (last && last.role === "assistant") {
                    const prevCompleted = last.completedSpokenContent || "";
                    const activeWords = words.slice(0, currentWordIndex + 1).join(" ");
                    const newSpoken = prevCompleted + (prevCompleted ? " " : "") + activeWords;
                    
                    const parsed = last.fullContent ? extractThoughts(last.fullContent) : null;
                    const thoughtsPart = parsed ? parsed.thoughts : "";
                    
                    return [
                      ...prev.slice(0, -1),
                      {
                        ...last,
                        spokenContent: newSpoken,
                        content: thoughtsPart + newSpoken
                      }
                    ];
                  }
                  return prev;
                });
                currentWordIndex++;
              } else {
                clearTimer();
              }
            }, delayPerWord);
          }
          
          // Play audio
          await tts.speak(buffer);
          clearTimer();
          
          // Set exact sentence content on completion
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.role === "assistant") {
              const prevCompleted = last.completedSpokenContent || "";
              const newCompleted = prevCompleted + (prevCompleted ? " " : "") + chunk;
              
              const parsed = last.fullContent ? extractThoughts(last.fullContent) : null;
              const thoughtsPart = parsed ? parsed.thoughts : "";
              
              return [
                ...prev.slice(0, -1),
                {
                  ...last,
                  completedSpokenContent: newCompleted,
                  spokenContent: newCompleted,
                  content: thoughtsPart + newCompleted
                }
              ];
            }
            return prev;
          });
          
        } catch (err) {
          console.error("Speech chunk playback failed:", err);
          clearTimer();
        }
      }
    }
    isSpeakingRef.current = false;
  }, [isSpeakingRef, speechQueueRef, setMessages, clearTimer]);

  const feedSpeechToken = useCallback((fullText: string) => {
    if (!speakEnabledRef.current) return;
    
    let currentText = fullText.slice(spokenTextLengthRef.current);
    const sentenceEndRegex = /[.!?\n]/;
    
    let match = currentText.match(sentenceEndRegex);
    while (match && match.index !== undefined) {
      const chunkEndIndex = spokenTextLengthRef.current + match.index + 1;
      const chunk = fullText.slice(spokenTextLengthRef.current, chunkEndIndex).trim();
      
      if (chunk && !chunk.startsWith('{') && !chunk.includes('"tool":')) {
        speechQueueRef.current.push(chunk);
        processSpeechQueue();
      }
      
      spokenTextLengthRef.current = chunkEndIndex;
      currentText = fullText.slice(spokenTextLengthRef.current);
      match = currentText.match(sentenceEndRegex);
    }
  }, [speakEnabledRef, spokenTextLengthRef, speechQueueRef, processSpeechQueue]);

  const flushSpeech = useCallback((fullText: string) => {
    if (!speakEnabledRef.current) return;
    
    const remaining = fullText.slice(spokenTextLengthRef.current).trim();
    if (remaining && !remaining.startsWith('{') && !remaining.includes('"tool":')) {
      speechQueueRef.current.push(remaining);
      processSpeechQueue();
    }
    spokenTextLengthRef.current = fullText.length;
  }, [speakEnabledRef, spokenTextLengthRef, speechQueueRef, processSpeechQueue]);

  const handleAssistantUpdate = useCallback((output: string, stats: any) => {
    if (isHiddenRef.current) return;
    
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.role === "assistant") {
        const speakEnabled = speakEnabledRef.current;
        let displayedContent = output;
        
        if (speakEnabled) {
          const thinkMatch = output.match(/<think>([\s\S]*?)(?:<\/think>|$)/i);
          const hasUnfinishedThink = thinkMatch && !output.includes("</think>");
          
          if (hasUnfinishedThink) {
            displayedContent = output;
          } else {
            const parsed = extractThoughts(output);
            const thoughtsPart = parsed ? parsed.thoughts : "";
            const spokenPart = last.spokenContent || "";
            displayedContent = thoughtsPart + spokenPart;
          }
        }
        
        return [
          ...prev.slice(0, -1),
          { 
            ...last, 
            content: displayedContent, 
            fullContent: output, 
            stats 
          }
        ];
      }
      return [
        ...prev, 
        { 
          role: "assistant", 
          content: output, 
          fullContent: output, 
          stats 
        }
      ];
    });

    // Real-time TTS Chunking
    let textToSpeak = output;
    const thinkRegex = /<think>([\s\S]*?)(?:<\/think>|$)/i;
    textToSpeak = output.replace(thinkRegex, "");

    const thoughtRegex2 = /<\|channel>thought\n([\s\S]*?)(?:<channel\|>|$)/i;
    textToSpeak = textToSpeak.replace(thoughtRegex2, "");

    feedSpeechToken(textToSpeak);
  }, [setMessages, isHiddenRef, feedSpeechToken, speakEnabledRef]);

  return {
    processSpeechQueue,
    feedSpeechToken,
    flushSpeech,
    handleAssistantUpdate
  };
}
