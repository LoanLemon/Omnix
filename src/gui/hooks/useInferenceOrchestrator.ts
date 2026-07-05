import { useEffect } from "react";

export function useInferenceOrchestrator(
  activeCategory: string,
  isGenerating: boolean,
  isAnalyzing: boolean,
  isModelLoading: boolean,
  isCoderMode: boolean,
  queues: {
    text: number;
    director: number;
    vision: number;
    image: number;
    music: number;
  },
  loadModel: (category: string) => void,
  enableMMRS?: boolean,
  isRemoteProcessing?: boolean
) {
  useEffect(() => {
    if (isModelLoading || enableMMRS || isRemoteProcessing) return;
    
    const textCategories = ["text", "director", "coder"];
    const isTextActive = textCategories.includes(activeCategory);
    const defaultTextCategory = isCoderMode ? "coder" : "text";

    // Priority: Director -> Text -> Vision -> Image -> Music
    if (!isGenerating && queues.text === 0 && queues.director === 0) {
      if (queues.vision > 0 && activeCategory !== 'vision') {
        loadModel('vision');
      } else if (isTextActive && queues.image > 0) {
        loadModel('image-gen');
      } else if (isTextActive && queues.music > 0) {
        loadModel('music-gen');
      }
    } else if (activeCategory === 'vision' && !isAnalyzing && queues.vision === 0) {
      if (queues.director > 0) {
        loadModel('director');
      } else if (queues.text > 0) {
        loadModel(defaultTextCategory);
      } else if (queues.image > 0) {
        loadModel('image-gen');
      } else if (queues.music > 0) {
        loadModel('music-gen');
      }
    } else if (activeCategory === 'image-gen' && !isGenerating && queues.image === 0) {
      if (queues.director > 0) {
        loadModel('director');
      } else if (queues.text > 0) {
        loadModel(defaultTextCategory);
      } else if (queues.vision > 0) {
        loadModel('vision');
      } else if (queues.music > 0) {
        loadModel('music-gen');
      }
    } else if (activeCategory === 'music-gen' && !isGenerating && queues.music === 0) {
      if (queues.director > 0) {
        loadModel('director');
      } else if (queues.text > 0) {
        loadModel(defaultTextCategory);
      } else if (queues.vision > 0) {
        loadModel('vision');
      } else if (queues.image > 0) {
        loadModel('image-gen');
      }
    }
  }, [
    activeCategory, 
    isGenerating, 
    isAnalyzing, 
    isModelLoading, 
    isCoderMode,
    queues.text, 
    queues.director, 
    queues.vision, 
    queues.image, 
    queues.music, 
    loadModel
  ]);
}
