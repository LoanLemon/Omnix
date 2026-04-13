import { useCallback } from "react";
import { LogEntry } from "../types";

export function useAppHandlers(
  addLog: (message: string, type?: "info" | "error" | "success") => void,
  setMessages: React.Dispatch<React.SetStateAction<any[]>>,
  setVisionModelQueue: React.Dispatch<React.SetStateAction<any[]>>,
  worker: React.MutableRefObject<Worker | null>,
  setGeneratedImage: (val: string | null) => void,
  setActiveTab: (val: "chat" | "sandbox" | "gallery") => void,
  setPendingImage: (val: string | null) => void
) {
  const analyzeImage = useCallback(async (file: File) => {
    if (!worker.current) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result;
      if (!imageData) return;
      setPendingImage(imageData as string);
      addLog("Image attached. Add a prompt and press send.");
    };
    reader.readAsDataURL(file);
  }, [addLog, setPendingImage, worker]);

  const handleImageResult = useCallback((image: any) => {
    if (image && image.data) {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imageData = ctx.createImageData(image.width, image.height);
        imageData.data.set(image.data);
        ctx.putImageData(imageData, 0, 0);
        setGeneratedImage(canvas.toDataURL());
        setActiveTab("gallery");
      }
    }
  }, [setGeneratedImage, setActiveTab]);

  return {
    analyzeImage,
    handleImageResult
  };
}
