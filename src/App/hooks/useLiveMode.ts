import { useState, useRef, useCallback, useEffect } from "react";

export function useLiveMode(
  addLog: (msg: string, type?: "info" | "error" | "success") => void,
  flushRecording: () => { audioData: Float32Array | null, isSilent: boolean } | null,
  isRecording: boolean,
  startRecording: () => Promise<void>,
  stopRecording: () => void,
  isAnalyzing: boolean,
  isGenerating: boolean,
  visionQueueLength: number,
  onFrame: (screenshot: string | null, isSilent: boolean, audioData: Float32Array | null) => void,
  captureIntervalMs: number
) {
  const [isLiveMode, setIsLiveMode] = useState(false);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  const lastScreenshotRef = useRef<string | null>(null);
  
  // Use refs to avoid stale closures in setInterval
  const isAnalyzingRef = useRef(isAnalyzing);
  const isGeneratingRef = useRef(isGenerating);
  const visionQueueLengthRef = useRef(visionQueueLength);
  const captureIntervalMsRef = useRef(captureIntervalMs);

  useEffect(() => {
    isAnalyzingRef.current = isAnalyzing;
    isGeneratingRef.current = isGenerating;
    visionQueueLengthRef.current = visionQueueLength;
    captureIntervalMsRef.current = captureIntervalMs;
  }, [isAnalyzing, isGenerating, visionQueueLength, captureIntervalMs]);

  const captureScreenshot = useCallback(async () => {
    if (!screenStreamRef.current) {
      addLog("Live Mode: No screen stream found", "error");
      return null;
    }

    try {
      const video = document.createElement("video");
      video.srcObject = screenStreamRef.current;
      
      // Wait for metadata to get correct dimensions
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = () => resolve(null);
        video.onerror = (e) => reject(e);
        // Timeout after 1s
        setTimeout(() => resolve(null), 1000);
      });

      if (video.readyState < 2) {
        addLog("Live Mode: Video not ready for capture", "error");
        return null;
      }

      await video.play();
      
      const scale = 0.4; // Scale down 60% (40% of original size)
      const canvas = document.createElement("canvas");
      canvas.width = (video.videoWidth || 1280) * scale;
      canvas.height = (video.videoHeight || 720) * scale;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      lastScreenshotRef.current = dataUrl;
      
      // Cleanup video element
      video.pause();
      video.srcObject = null;
      video.remove();
      
      return dataUrl;
    } catch (err) {
      console.error("Failed to capture screenshot:", err);
      addLog("Live Mode: Failed to capture screenshot: " + (err as Error).message, "error");
      return null;
    }
  }, [addLog]);

  const stopLiveMode = useCallback(() => {
    setIsLiveMode(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
    }
    stopRecording();
    addLog("Live Mode stopped", "info");
  }, [addLog, stopRecording]);

  const startLiveMode = useCallback(async () => {
    try {
      addLog("Starting Live Mode... Requesting screen capture", "info");
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      screenStreamRef.current = stream;

      stream.getVideoTracks()[0].onended = () => {
        stopLiveMode();
      };

      await startRecording();
      setIsLiveMode(true);
      addLog(`Live Mode active. Capturing every ${captureIntervalMsRef.current / 1000}s (when idle).`, "success");

      intervalRef.current = setInterval(async () => {
        // 1. Only proceed if both models are idle and queue is empty
        const isIdle = !isAnalyzingRef.current && !isGeneratingRef.current && visionQueueLengthRef.current === 0;
        
        if (!isIdle) return;

        // 2. Flush recording first to capture audio up to this point
        const flushResult = flushRecording();
        const isSilent = flushResult ? flushResult.isSilent : true;
        const audioData = flushResult ? flushResult.audioData : null;

        // 3. Capture screenshot
        const screenshot = await captureScreenshot();

        // 4. Trigger frame callback for immediate UI update
        onFrame(screenshot, isSilent, audioData);
      }, captureIntervalMsRef.current);
    } catch (err: any) {
      addLog("Failed to start Live Mode: " + err.message, "error");
      stopLiveMode();
    }
  }, [addLog, startRecording, stopLiveMode, captureScreenshot, flushRecording]);

  const toggleLiveMode = useCallback(() => {
    if (isLiveMode) {
      stopLiveMode();
    } else {
      startLiveMode();
    }
  }, [isLiveMode, startLiveMode, stopLiveMode]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  return {
    isLiveMode,
    toggleLiveMode,
    lastScreenshotRef
  };
}
