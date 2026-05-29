import { useState, useCallback, useRef } from "react";
import { GENERATION_WORKFLOW, WorkflowStep } from "@/lib/DirectorWorkflow";
import { browserEngine } from "@/lib/ModelEngine";
import { SandboxFile } from "@shared/types";

export function usePipelineGeneration(
  addLog: (msg: string, type?: "info" | "error" | "success") => void,
  setSandboxFiles: React.Dispatch<React.SetStateAction<SandboxFile[]>>,
  setSelectedModels: React.Dispatch<React.SetStateAction<Record<string, string>>>
) {
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [appDescription, setAppDescription] = useState("");
  
  const stepResultsRef = useRef<Record<string, string>>({});

  const executeStep = useCallback(async (step: WorkflowStep, description: string) => {
    addLog(`Pipeline: Executing ${step.name}...`, "info");
    
    let prompt = step.prompt.replace("[APP_DESCRIPTION]", description);
    
    // Enrich prompt with previous results for context
    if (Object.keys(stepResultsRef.current).length > 0) {
      prompt += "\n\nContext from previous steps:\n";
      if (stepResultsRef.current["spec"]) prompt += `spec.json: ${stepResultsRef.current["spec"]}\n`;
      if (stepResultsRef.current["architecture"]) prompt += `architecture.json: ${stepResultsRef.current["architecture"]}\n`;
    }

    try {
      const output = await browserEngine.runInference("director", prompt, {
        temperature: 0.2,
        max_new_tokens: 1024
      });

      const resultText = typeof output === "string" ? output : JSON.stringify(output);
      stepResultsRef.current[step.id] = resultText;

      // Update sandbox files
      setSandboxFiles(prev => {
        // If it's a multi-file step (styles/functions), we might need parsing logic
        // For now, let's treat it as a single file update or generic handler
        const newFile: SandboxFile = {
          name: step.file.endsWith("/") ? `${step.file}generated_${step.id}.ts` : step.file,
          content: resultText,
          language: step.file.endsWith(".json") ? "json" : (step.file.endsWith(".html") ? "html" : "typescript") as any
        };
        
        const existingIdx = prev.findIndex(f => f.name === newFile.name);
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = newFile;
          return updated;
        }
        return [...prev, newFile];
      });

      addLog(`Pipeline: ${step.name} Complete`, "success");
      return true;
    } catch (err: any) {
      addLog(`Pipeline Error at ${step.name}: ${err.message}`, "error");
      return false;
    }
  }, [addLog, setSandboxFiles]);

  const startPipeline = useCallback(async (description: string) => {
    setAppDescription(description);
    setIsPipelineRunning(true);
    setCurrentStepIndex(0);
    stepResultsRef.current = {};

    // Ensure Director model is loaded
    setSelectedModels(prev => ({ ...prev, director: "qwen-3-0.6b-q4" }));
    
    addLog("Pipeline Start: Rooting generation sequence...", "info");
    
    let index = 0;
    while (index < GENERATION_WORKFLOW.length) {
      const success = await executeStep(GENERATION_WORKFLOW[index], description);
      if (!success) break;
      index++;
      setCurrentStepIndex(index);
    }

    setIsPipelineRunning(false);
    if (index === GENERATION_WORKFLOW.length) {
      addLog("Pipeline Finished: All assets generated.", "success");
    }
  }, [executeStep, addLog, setSelectedModels]);

  const stopPipeline = useCallback(() => {
    setIsPipelineRunning(false);
    setCurrentStepIndex(-1);
    addLog("Pipeline Aborted by user", "error");
  }, [addLog]);

  return {
    currentStepIndex,
    isPipelineRunning,
    startPipeline,
    stopPipeline,
    workflow: GENERATION_WORKFLOW
  };
}
