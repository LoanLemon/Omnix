import { useCallback } from "react";
import { LogEntry } from "@shared/types";

export function useAppHandlers(
  addLog: (message: string, type?: "info" | "error" | "success") => void,
  setMessages: React.Dispatch<React.SetStateAction<any[]>>,
  setVisionModelQueue: React.Dispatch<React.SetStateAction<any[]>>,
  setGeneratedImage: (val: string | null) => void,
  setActiveTab: (val: "chat" | "sandbox" | "gallery") => void,
  setPendingImage: (val: string | null) => void
) {
  const analyzeImage = useCallback(async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result;
      if (!imageData) return;
      setPendingImage(imageData as string);
      addLog("Image attached. Add a prompt and press send.");
    };
    reader.readAsDataURL(file);
  }, [addLog, setPendingImage]);

  const handleImageResult = useCallback((image: any) => {
    if (image && image.data) {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imageData = ctx.createImageData(image.width, image.height);
        
        // Robustly handle RGB or general channel mismatch
        const numPixels = image.width * image.height;
        if (image.data.length === numPixels * 4) {
          imageData.data.set(image.data);
        } else if (image.data.length === numPixels * 3) {
          for (let i = 0; i < numPixels; ++i) {
            const i3 = i * 3;
            const i4 = i * 4;
            imageData.data[i4] = image.data[i3];
            imageData.data[i4 + 1] = image.data[i3 + 1];
            imageData.data[i4 + 2] = image.data[i3 + 2];
            imageData.data[i4 + 3] = 255;
          }
        } else if (image.data.length === numPixels) {
          for (let i = 0; i < numPixels; ++i) {
            const i4 = i * 4;
            const val = image.data[i];
            imageData.data[i4] = val;
            imageData.data[i4 + 1] = val;
            imageData.data[i4 + 2] = val;
            imageData.data[i4 + 3] = 255;
          }
        } else {
          const copyLen = Math.min(image.data.length, numPixels * 4);
          for (let i = 0; i < copyLen; ++i) {
            imageData.data[i] = image.data[i];
          }
          for (let i = Math.floor(copyLen / 4); i < numPixels; ++i) {
            imageData.data[i * 4 + 3] = 255;
          }
        }

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
