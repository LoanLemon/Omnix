import { useState, useEffect, useRef, useCallback } from "react";
import { MODELS } from "../../modelList";

export function useModelManagement(
  systemRam: number, 
  isRamDetected: boolean,
  addLog: (msg: string, type?: "info" | "error" | "success") => void,
  setError: (msg: string | null) => void,
  setDidError: (val: boolean) => void
) {
  const filteredModelsList = MODELS;

  const [selectedModels, setSelectedModels] = useState<Record<string, string>>({
    text: "gemma-3 1B",
    vision: "",
    stt: "",
    tts: "",
    "image-gen": "",
    "music-gen": "",
    director: "qwen-2.5-Instruct-abliterated-0.5b-q4",
    coder: "",
  });
  const [activeCategory, setActiveCategory] = useState<string>("director");
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<Record<string, { progress: number; status: string }>>({});
  const [loadedModelId, setLoadedModelId] = useState<string | null>(null);
  const worker = useRef<Worker | null>(null);

  const isCategoryDisabled = useCallback((cat: string) => {
    return !filteredModelsList.some(m => m.category === cat && (!m.minRam || m.minRam <= systemRam));
  }, [systemRam, filteredModelsList]);

  const loadModel = useCallback((category: string, modelId?: string) => {
    if (!worker.current) return;
    let id = modelId || selectedModels[category];
    let modelInfo = filteredModelsList.find((m) => m.id === id);
    
    // Check if already loaded and ready
    if (modelInfo && loadedModelId === `${modelInfo.modelID}@main` && activeCategory === category && isModelReady) {
      return;
    }
    
    // Auto-sync vision model if Gemma 4 is selected as text model
    if (category === "text" && id === "gemma-4-e2b-q4") {
      setSelectedModels(prev => {
        if (prev.vision === "gemma-4-e2b-q4") return prev;
        return { ...prev, vision: "gemma-4-e2b-q4" };
      });
    }
    
    if (modelInfo && modelInfo.minRam && modelInfo.minRam > systemRam) {
      const fallback = filteredModelsList
        .filter(m => m.category === category && (!m.minRam || m.minRam <= systemRam))
        .sort((a, b) => (b.minRam || 0) - (a.minRam || 0))[0];
      
      if (fallback) {
        id = fallback.id;
        modelInfo = fallback;
        setSelectedModels(prev => {
          if (prev[category] === id) return prev;
          return { ...prev, [category]: id };
        });
      } else {
        setError(`No models in ${category} fit your RAM (~${systemRam}GB).`);
        setIsModelLoading(false);
        return;
      }
    }

    if (!modelInfo) return;

    setIsModelLoading(true);
    setIsModelReady(false);
    setDidError(false);
    setActiveCategory(category);
    setError(null);
    setLoadingProgress({});
    addLog(`Loading ${modelInfo.name}...`);
    worker.current.postMessage({ 
      type: "load", 
      data: { 
        modelID: modelInfo.modelID,
        path: modelInfo.path,
        modelfile: modelInfo.modelfile,
        dtype: modelInfo.dtype, 
        category: modelInfo.category 
      } 
    });
  }, [selectedModels, systemRam, addLog, setError, setDidError, filteredModelsList]);

  useEffect(() => {
    if (!isRamDetected) return;
    
    setSelectedModels(prev => {
      let changed = false;
      const next = { ...prev };
      ["text", "vision", "stt", "tts", "image-gen", "music-gen", "director", "coder"].forEach(cat => {
        const currentId = prev[cat];
        const currentModel = filteredModelsList.find(m => m.id === currentId);
        if (currentModel && (!currentModel.minRam || currentModel.minRam <= systemRam)) {
          return;
        }

        const possible = filteredModelsList.filter(m => m.category === cat && (!m.minRam || m.minRam <= systemRam));
        
        if (possible.length > 0) {
          changed = true;
          if (cat === "text") {
            const preferred = possible.find(m => m.id === "gemma-3 1B");
            next[cat] = preferred ? preferred.id : possible[0].id;
          } else if (cat === "director") {
            const preferred = possible.find(m => m.id === "qwen-2.5-Instruct-abliterated-0.5b-q4");
            next[cat] = preferred ? preferred.id : possible[0].id;
          } else {
            const sorted = [...possible].sort((a, b) => (b.minRam || 0) - (a.minRam || 0));
            next[cat] = sorted[0].id;
          }
        }
      });
      return changed ? next : prev;
    });
  }, [systemRam, isRamDetected, filteredModelsList]);

  return {
    selectedModels,
    setSelectedModels,
    activeCategory,
    setActiveCategory,
    isModelLoading,
    setIsModelLoading,
    isModelReady,
    setIsModelReady,
    loadingProgress,
    setLoadingProgress,
    loadedModelId,
    setLoadedModelId,
    worker,
    loadModel,
    isCategoryDisabled
  };
}
