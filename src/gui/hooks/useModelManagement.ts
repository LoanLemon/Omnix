import { useState, useEffect, useRef, useCallback } from "react";
import { MODELS } from "@shared/modelList";
import { browserEngine } from "@/lib/ModelEngine";

export function useModelManagement(
  systemRam: number, 
  isRamDetected: boolean,
  addLog: (msg: string, type?: "info" | "error" | "success") => void,
  setError: (msg: string | null) => void,
  setDidError: (val: boolean) => void
) {
  const filteredModelsList = MODELS;

  const [selectedModels, setSelectedModels] = useState<Record<string, string>>({
    text: "qwen-3-0.6b-q4-text",
    vision: "FastVLM",
    stt: "whisper-tiny-en",
    tts: "kokoro-82m",
    "image-gen": "Janus-Pro-1B-ONNX",
    "music-gen": "musicgen-small",
    director: "use-text-model",
    coder: "qwen-2.5-coder-3b-q4",
  });
  const [activeCategory, setActiveCategory] = useState<string>("director");
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<Record<string, { progress: number; status: string }>>({});
  const [loadedModelId, setLoadedModelId] = useState<string | null>(null);

  const isCategoryDisabled = useCallback((cat: string) => {
    return !filteredModelsList.some(m => m.category === cat && (!m.minRam || m.minRam <= systemRam));
  }, [systemRam, filteredModelsList]);

  const loadModel = useCallback(async (category: string, modelId?: string, skipLoadingVisuals = false) => {
    let id = modelId || selectedModels[category];
    let actualCategory = category;

    if (category === "director" && id === "use-text-model") {
      actualCategory = "text";
      id = selectedModels.text;
    }

    let modelInfo = filteredModelsList.find((m) => m.id === id);
    
    if (modelInfo && modelInfo.minRam && modelInfo.minRam > systemRam) {
      const fallback = filteredModelsList
        .filter(m => m.category === category && (!m.minRam || m.minRam <= systemRam))
        .sort((a, b) => (b.minRam || 0) - (a.minRam || 0))[0];
      
      if (fallback) {
        id = fallback.id;
        modelInfo = fallback;
        setSelectedModels(prev => ({ ...prev, [category]: id }));
      } else {
        setError(`No models in ${category} fit your RAM (~${systemRam}GB).`);
        return;
      }
    }

    if (!modelInfo) return;

    setActiveCategory(category);
    if (!skipLoadingVisuals) {
      setIsModelLoading(true);
      setIsModelReady(false);
      addLog(`Loading Engine: ${modelInfo.name}...`, "info");
    }

    try {
      await browserEngine.loadModel(actualCategory, id, (p: any) => {
        if (skipLoadingVisuals) return;
        if (p.status === "progress") {
          setLoadingProgress(prev => ({
            ...prev,
            [p.file]: { progress: p.progress, status: `Downloading ${p.file}` }
          }));
        } else if (p.status === "init" || p.status === "loaded") {
          setLoadingProgress(prev => ({
            ...prev,
            [p.file || "engine"]: { progress: 100, status: p.status === "init" ? `Initializing ${p.file || "Engine"}` : "Model Loaded" }
          }));
        }
      });
      
      setLoadedModelId(id);
      setIsModelReady(true);
      setIsModelLoading(false);
      setLoadingProgress({});
      if (!skipLoadingVisuals) {
        addLog(`Engine Ready: ${modelInfo.name}`, "success");
      } else {
        addLog(`Engine active: ${modelInfo.name} (retained from Director)`, "success");
      }
    } catch (err: any) {
      addLog(`Engine Error: ${err.message}`, "error");
      setError(err.message);
      setDidError(true);
      setIsModelLoading(false);
    }
  }, [selectedModels, systemRam, filteredModelsList, setError, addLog]);

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
            const preferred = possible.find(m => m.id === "qwen-3-0.6b-q4-text");
            next[cat] = preferred ? preferred.id : possible[0].id;
          } else if (cat === "director") {
            const preferred = possible.find(m => m.id === "use-text-model");
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
    loadModel,
    isCategoryDisabled
  };
}
