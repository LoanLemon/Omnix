import { useState, useEffect, useRef, useCallback } from "react";
import { MODELS, getRequiredRamForModel, getBestFittingQtype } from "@shared/modelList";
import { browserEngine } from "@/lib/ModelEngine";
import { ErrorReport } from "@shared/types";

export function useModelManagement(
  systemRam: number, 
  isRamDetected: boolean,
  addLog: (msg: string, type?: "info" | "error" | "success") => void,
  setError: (msg: ErrorReport | null) => void,
  setDidError: (val: boolean) => void
) {
  const filteredModelsList = MODELS;

  const [selectedModels, setSelectedModels] = useState<Record<string, string>>(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("omnix_selected_models") : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          text: parsed.text || "LFM2-1.2B-ONNX",
          vision: parsed.vision || "FastVLM",
          stt: parsed.stt || "whisper-tiny-en",
          tts: parsed.tts || "kokoro-82m",
          "image-gen": parsed["image-gen"] || "Janus-Pro-1B-ONNX",
          "music-gen": parsed["music-gen"] || "musicgen-small",
          director: parsed.director || "use-text-model",
          coder: parsed.coder || "qwen-2.5-coder-3b-q4",
        };
      } catch (e) {
        // Fallback below
      }
    }
    return {
      text: "LFM2-1.2B-ONNX",
      vision: "FastVLM",
      stt: "whisper-tiny-en",
      tts: "kokoro-82m",
      "image-gen": "Janus-Pro-1B-ONNX",
      "music-gen": "musicgen-small",
      director: "use-text-model",
      coder: "qwen-2.5-coder-3b-q4",
    };
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("omnix_selected_models", JSON.stringify(selectedModels));
    }
  }, [selectedModels]);
  const [selectedQtypes, setSelectedQtypes] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    MODELS.forEach(m => {
      initial[m.id] = getBestFittingQtype(m, systemRam);
    });
    return initial;
  });
  const [activeCategory, setActiveCategory] = useState<string>("director");
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<Record<string, { progress: number; status: string }>>({});
  const [loadedModelId, setLoadedModelId] = useState<string | null>(null);

  const selectedQtypesRef = useRef(selectedQtypes);
  useEffect(() => {
    selectedQtypesRef.current = selectedQtypes;
  }, [selectedQtypes]);

  const isCategoryDisabled = useCallback((cat: string) => {
    return !filteredModelsList.some(m => m.category === cat && 
      (m.qtypes || [m.dtype || "q4"]).some(q => getRequiredRamForModel(m, q) <= systemRam)
    );
  }, [systemRam, filteredModelsList]);

  const loadModel = useCallback(async (category: string, modelId?: string, skipLoadingVisuals = false) => {
    let id = modelId || selectedModels[category];
    let actualCategory = category;

    if (category === "director" && id === "use-text-model") {
      actualCategory = "text";
      id = selectedModels.text;
    }

    if (category === "livews") {
      actualCategory = "text";
      id = modelId || selectedModels.text;
    }

    let modelInfo = filteredModelsList.find((m) => m.id === id);
    
    if (modelInfo && getRequiredRamForModel(modelInfo, selectedQtypes[id]) > systemRam) {
      // Find if we can just change to a fitting QTYPE for the SAME model first!
      const currentModelInfo = modelInfo;
      const bestFitQtype = (currentModelInfo.qtypes || []).find(q => getRequiredRamForModel(currentModelInfo, q) <= systemRam);
      if (bestFitQtype) {
        setSelectedQtypes(prev => ({ ...prev, [id]: bestFitQtype }));
      } else {
        // No QTYPE fits, search for fallback model
        const fallback = filteredModelsList
          .filter(m => m.category === category && (m.qtypes || [m.dtype || "q4"]).some(q => getRequiredRamForModel(m, q) <= systemRam))
          .sort((a, b) => {
            const aMin = Math.min(...(a.qtypes || [a.dtype || "q4"]).map(q => getRequiredRamForModel(a, q)));
            const bMin = Math.min(...(b.qtypes || [b.dtype || "q4"]).map(q => getRequiredRamForModel(b, q)));
            return bMin - aMin;
          })[0];
        
        if (fallback) {
          id = fallback.id;
          modelInfo = fallback;
          setSelectedModels(prev => ({ ...prev, [category]: id }));
          const fallbackQtype = getBestFittingQtype(fallback, systemRam);
          setSelectedQtypes(prev => ({ ...prev, [fallback.id]: fallbackQtype }));
        } else {
          setError({
            message: `No models in ${category} fit your RAM (~${systemRam}GB).`,
            activeModel: modelId || selectedModels[category]
          });
          return;
        }
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
      const customDtype = selectedQtypes[id];
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
      }, customDtype);
      
      setLoadedModelId(id);
      setIsModelReady(true);
      setIsModelLoading(false);
      setLoadingProgress({});
      if (!skipLoadingVisuals) {
        addLog(`Engine Ready: ${modelInfo.name}${customDtype ? ` (${customDtype.toUpperCase()})` : ""}`, "success");
      } else {
        addLog(`Engine active: ${modelInfo.name} (retained from Director)`, "success");
      }
    } catch (err: any) {
      addLog(`Engine Error: ${err.message}`, "error");
      setError({
        message: err.message,
        activeModel: id
      });
      setDidError(true);
      setIsModelLoading(false);
    }
  }, [selectedModels, selectedQtypes, systemRam, filteredModelsList, setError, addLog, setDidError]);

  useEffect(() => {
    if (!isRamDetected) return;
    
    setSelectedModels(prev => {
      let changed = false;
      const next = { ...prev };
      const currentQtypes = selectedQtypesRef.current;

      ["text", "vision", "stt", "tts", "image-gen", "music-gen", "director", "coder"].forEach(cat => {
        const currentId = prev[cat];
        const currentModel = filteredModelsList.find(m => m.id === currentId);
        if (currentModel && getRequiredRamForModel(currentModel, currentQtypes[currentId]) <= systemRam) {
          return;
        }

        // Check if current model fits at a different QTYPE first
        if (currentModel) {
          const alternativeQtype = (currentModel.qtypes || []).find(q => getRequiredRamForModel(currentModel, q) <= systemRam);
          if (alternativeQtype) {
            setSelectedQtypes(prevQ => ({ ...prevQ, [currentId]: alternativeQtype }));
            return;
          }
        }

        const possible = filteredModelsList.filter(m => m.category === cat && (m.qtypes || [m.dtype || "q4"]).some(q => getRequiredRamForModel(m, q) <= systemRam));
        
        if (possible.length > 0) {
          changed = true;
          let chosenModelId = possible[0].id;
          if (cat === "text") {
            const preferred = possible.find(m => m.id === "LFM2-1.2B-ONNX") || possible.find(m => m.id === "qwen-3-0.6b-q4-text");
            chosenModelId = preferred ? preferred.id : possible[0].id;
          } else if (cat === "director") {
            const preferred = possible.find(m => m.id === "use-text-model");
            chosenModelId = preferred ? preferred.id : possible[0].id;
          } else {
            const sorted = [...possible].sort((a, b) => {
              const aMin = Math.min(...(a.qtypes || [a.dtype || "q4"]).map(q => getRequiredRamForModel(a, q)));
              const bMin = Math.min(...(b.qtypes || [b.dtype || "q4"]).map(q => getRequiredRamForModel(b, q)));
              return bMin - aMin;
            });
            chosenModelId = sorted[0].id;
          }
          next[cat] = chosenModelId;

          const chosenModel = possible.find(m => m.id === chosenModelId);
          if (chosenModel) {
            const compatibleQtype = getBestFittingQtype(chosenModel, systemRam);
            setSelectedQtypes(prevQ => ({ ...prevQ, [chosenModelId]: compatibleQtype }));
          }
        }
      });
      return changed ? next : prev;
    });
  }, [systemRam, isRamDetected, filteredModelsList]);

  return {
    selectedModels,
    setSelectedModels,
    selectedQtypes,
    setSelectedQtypes,
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
