import { useState, useRef, useCallback } from "react";
import { browserEngine } from "@/lib/ModelEngine";

export function useSpeechToText(
  addLog: (msg: string, type?: "info" | "error" | "success") => void,
  setInput: (val: string | ((prev: string) => string)) => void,
  checkModel: () => boolean | Promise<boolean>
) {
  const [isRecording, setIsRecording] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioDataRef = useRef<number[]>([]);

  const stopRecording = useCallback(async () => {
    if (!isRecording) return;
    
    setIsRecording(false);
    addLog("Recording stopped. Transcribing...");

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    const audioData = new Float32Array(audioDataRef.current);
    audioDataRef.current = [];

    let transcribedText = "";
    
    // Direct Client-Side Local Whisper STT to bypass loopback server latency
    try {
      addLog("Engine: Executing STT locally on client thread to bypass network roundtrips...", "info");
      const result = await browserEngine.runInference("stt", audioData, {
        progress_callback: (p: any) => {
          if (p.status === "progress") {
            addLog(`Downloading Whisper Asset: ${p.file} (${Math.round(p.progress)}%)`, "info");
          }
        }
      });
      
      if (typeof result === "string") {
        transcribedText = result;
      } else if (result && typeof result === "object" && (result as any).text) {
        transcribedText = (result as any).text;
      }
      
      if (transcribedText) {
        setInput(prev => {
          const base = prev.trim();
          return base ? `${base} ${transcribedText.trim()}` : transcribedText.trim();
        });
        addLog("Transcription complete (Client Local).", "success");
        return;
      }
    } catch (clientErr: any) {
      addLog(`Engine Client STT notice (falling back to server): ${clientErr.message || clientErr.toString()}`, "info");
    }

    // Server-Side Relay Backup Fallback
    try {
      const formData = new FormData();
      const blob = new Blob([audioData.buffer], { type: 'application/octet-stream' });
      formData.append('audio', blob, 'recording.raw');
      
      const res = await fetch('/api/stt', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.text) {
        setInput(prev => {
          const base = prev.trim();
          return base ? `${base} ${data.text.trim()}` : data.text.trim();
        });
        addLog("Transcription complete (Server Relay Backup).", "success");
      }
    } catch (err: any) {
      addLog("Transcription failed: " + err.message, "error");
    }
  }, [isRecording, addLog, setInput]);

  const startRecording = useCallback(async () => {
    try {
      // Trigger model check/load but don't block microphone activation
      checkModel();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      audioDataRef.current = [];

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        for (let i = 0; i < inputData.length; i++) {
          audioDataRef.current.push(inputData[i]);
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      setIsRecording(true);
      addLog("Recording started...");
    } catch (err: any) {
      addLog("Failed to start recording: " + err.message, "error");
    }
  }, [addLog, checkModel]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const flushRecording = useCallback(() => {
    if (!isRecording) return null;
    
    // Ensure we have at least some data
    if (audioDataRef.current.length === 0) {
      return { audioData: null, isSilent: true };
    }

    const audioData = new Float32Array(audioDataRef.current);
    audioDataRef.current = [];
    
    // Simple VAD: Calculate RMS energy
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
      sum += audioData[i] * audioData[i];
    }
    const rms = Math.sqrt(sum / audioData.length);
    const isSilent = rms < 0.005; // Threshold for silence

    return { audioData, isSilent };
  }, [isRecording]);

  return {
    isRecording,
    toggleRecording,
    startRecording,
    stopRecording,
    flushRecording
  };
}
