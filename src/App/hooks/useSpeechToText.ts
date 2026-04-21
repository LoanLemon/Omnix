import React, { useState, useRef, useCallback } from "react";

export function useSpeechToText(
  worker: React.MutableRefObject<Worker | null>,
  addLog: (msg: string, type?: "info" | "error" | "success") => void,
  setInput: (val: string | ((prev: string) => string)) => void,
  checkModel: () => boolean | Promise<boolean>
) {
  const [isRecording, setIsRecording] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioDataRef = useRef<number[]>([]);

  const stopRecording = useCallback(() => {
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

    if (worker.current) {
      worker.current.postMessage({
        type: "transcribe",
        data: { audio: audioData }
      });
    }
  }, [isRecording, addLog, worker]);

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
