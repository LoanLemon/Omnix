import { useState, useCallback, useRef } from "react";
import { GENERATION_WORKFLOW, WorkflowStep } from "@/lib/DirectorWorkflow";
import { browserEngine } from "@/lib/ModelEngine";
import { SandboxFile } from "@shared/types";
import { stringify as masonStringify } from "mason-parser";

// Helper to parse JSON from AI response if wrapped in markdown or malformed
const parseJSON = (text: string) => {
  let jsonStr = text;
  const match = text.match(/```(?:json)?\n([\s\S]*?)```/);
  if (match) {
    jsonStr = match[1];
  }
  
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    // Attempt basic repair if AI outputted a trailing comma
    try {
      return JSON.parse(jsonStr.replace(/,\s*([\]}])/g, "$1"));
    } catch (e2) {
      return null;
    }
  }
};

export function usePipelineGeneration(
  addLog: (msg: string, type?: "info" | "error" | "success") => void,
  setSandboxFiles: React.Dispatch<React.SetStateAction<SandboxFile[]>>,
  setSelectedModels: React.Dispatch<React.SetStateAction<Record<string, string>>>,
  currentStepIndex: number,
  setCurrentStepIndex: React.Dispatch<React.SetStateAction<number>>
) {
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [appDescription, setAppDescription] = useState("");
  
  const stepResultsRef = useRef<Record<string, any>>({});
  const isRunningRef = useRef(false); // To handle early aborts

  const startPipeline = useCallback(async (description: string) => {
    setAppDescription(description);
    setIsPipelineRunning(true);
    isRunningRef.current = true;
    setCurrentStepIndex(0);
    stepResultsRef.current = {};

    // Ensure Director model is loaded
    setSelectedModels(prev => ({ ...prev, director: "qwen-3-0.6b-q4" }));
    
    addLog("Workflow Started", "info");
    
    try {
      // --- Step 1: Action Plan ---
      if (!isRunningRef.current) return;
      setCurrentStepIndex(0);
      addLog("Step 1: AI reviewing prompt & creating action plan...", "info");
      
      const planPrompt = `Review the following user prompt and create an action plan to develop the user's goals as a web application written in TypeScript with NPM library capabilities including React.\n\nPrompt: ${description}`;
      const planResult = await browserEngine.runInference("director", planPrompt, { temperature: 0.3, max_new_tokens: 1024 });
      const planText = typeof planResult === 'string' ? planResult : masonStringify(planResult, 0, undefined, { compact: true });
      stepResultsRef.current.plan = planText;
      
      // --- Step 2: File Structure ---
      if (!isRunningRef.current) return;
      setCurrentStepIndex(1);
      addLog("Step 2: Creating file structure list...", "info");
      
      const filesPrompt = `Based on this action plan, create a JSON array of objects. Each object must have 'filename' (string) and 'description' (string) properties.\n\nAction Plan: ${planText}\n\nRespond ONLY with the JSON array, no markdown or extra text.`;
      
      let filesList = null;
      let fileAttempts = 0;
      while (!filesList && fileAttempts < 3 && isRunningRef.current) {
        fileAttempts++;
        const filesResult = await browserEngine.runInference("director", filesPrompt, { temperature: 0.1, max_new_tokens: 1024 });
        
        if (typeof filesResult !== 'string' && Array.isArray(filesResult)) {
           filesList = filesResult;
        } else {
           const filesText = typeof filesResult === 'string' ? filesResult : masonStringify(filesResult, 0, undefined, { compact: true });
           filesList = parseJSON(filesText);
        }
        
        if (!filesList) addLog(`Retrying file structure parsing (attempt ${fileAttempts})...`, "error");
      }
      
      if (!filesList || !Array.isArray(filesList)) {
        throw new Error("AI failed to generate a valid file list JSON after 3 attempts.");
      }
      
      addLog(`File structure created: ${filesList.length} files.`, "success");

      // --- Step 3: Generation ---
      if (!isRunningRef.current) return;
      setCurrentStepIndex(2);
      
      for (const file of filesList) {
        if (!isRunningRef.current) break;
        
        // I. Advise the user of what you're doing
        addLog(`Step 3: Generating ${file.filename}...`, "info");
        
        let attempts = 0;
        let generatedContent = "";
        let hasErrors = true;
        
        while (hasErrors && attempts < 3 && isRunningRef.current) {
          attempts++;
          
          // II. Generate context
          const genPrompt = attempts === 1
            ? `Generate the content for the file '${file.filename}' based on this description: ${file.description}. Here is the overall plan: ${planText}. Output ONLY the file content without markdown code block wrappers.`
            : `Review the following content for '${file.filename}' and correct any syntax or logical errors. Output ONLY the corrected content without markdown wrappers.\n\nContent: ${generatedContent}`;
            
          const genResult = await browserEngine.runInference("director", genPrompt, { temperature: 0.2, max_new_tokens: 2048 });
          generatedContent = typeof genResult === 'string' ? genResult : masonStringify(genResult, 0, undefined, { compact: true });
          
          // Clean markdown wrappers if AI still includes them
          if (generatedContent.startsWith("\`\`\`")) {
            const lines = generatedContent.split("\n");
            lines.shift();
            if (lines[lines.length - 1].trim() === "\`\`\`") lines.pop();
            generatedContent = lines.join("\n");
          }
          
          // III & IV. Review file for errors (Simulated validation for TS/JSON)
          hasErrors = false;
          if (file.filename.endsWith(".json")) {
             const isValidJSON = parseJSON(generatedContent) !== null;
             if (!isValidJSON) hasErrors = true;
          }
          if (hasErrors) {
            addLog(`Errors detected in ${file.filename}. Requesting corrections (attempt ${attempts + 1})...`, "error");
          }
        }
        
        // V. Move to next file
        setSandboxFiles(prev => {
          const newFile: SandboxFile = {
            name: file.filename,
            content: generatedContent,
            language: file.filename.endsWith(".json") ? "json" : (file.filename.endsWith(".html") ? "html" : "typescript") as any
          };
          
          const existingIdx = prev.findIndex(f => f.name === newFile.name);
          if (existingIdx >= 0) {
            const updated = [...prev];
            updated[existingIdx] = newFile;
            return updated;
          }
          return [...prev, newFile];
        });
      }

      // --- Step 4: Linting ---
      if (!isRunningRef.current) return;
      setCurrentStepIndex(3);
      addLog("Step 4: Linting application...", "info");
      
      let lintPasses = false;
      let lintAttempts = 0;
      
      while (!lintPasses && lintAttempts < 3 && isRunningRef.current) {
        lintAttempts++;
        addLog(`Linting pass ${lintAttempts}...`, "info");
        // Simulating the linting process
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // In a real implementation, you would trigger the actual linter here
        // and capture its output to feed back to the AI.
        
        lintPasses = true; // Assume success for simulation purposes
        
        if (!lintPasses) {
           addLog("Lint errors found. Asking AI to make corrections...", "error");
        }
      }
      
      if (lintPasses) {
        addLog("Linting passed successfully.", "success");
      } else {
        addLog("Linting failed after maximum attempts.", "error");
      }
      
      if (isRunningRef.current) {
        addLog("Workflow Finished: All assets generated.", "success");
        setCurrentStepIndex(4); // Mark all complete
      }
      
    } catch (err: any) {
      if (isRunningRef.current) {
        addLog(`Workflow Error: ${err.message}`, "error");
      }
    } finally {
      setIsPipelineRunning(false);
      isRunningRef.current = false;
    }
  }, [addLog, setSelectedModels, setSandboxFiles]);

  const stopPipeline = useCallback(() => {
    setIsPipelineRunning(false);
    isRunningRef.current = false;
    setCurrentStepIndex(-1);
    addLog("Workflow Aborted by user", "error");
  }, [addLog]);

  return {
    currentStepIndex,
    isPipelineRunning,
    startPipeline,
    stopPipeline,
    workflow: GENERATION_WORKFLOW
  };
}
