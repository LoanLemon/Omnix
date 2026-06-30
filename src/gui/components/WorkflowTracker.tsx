import { useApp } from "@/context/AppContext";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

export function WorkflowTracker() {
  const { chatMode, isPipelineRunning, currentStepIndex } = useApp();

  // Define the workflow nodes as described in the user's plan
  const nodes = [
    { id: "plan", label: "Action Plan", description: "Review prompt & create plan" },
    { id: "list", label: "File Structure", description: "Create filename & purpose list" },
    { id: "generate", label: "Generation", description: "Iterate, generate, and correct files" },
    { id: "lint", label: "Linting", description: "Validate and fix errors" },
  ];

  const getStepStatus = (index: number) => {
    if (!isPipelineRunning && chatMode !== "sandbox") return "idle";
    if (chatMode === "sandbox" && currentStepIndex === -1) return "idle";
    
    const mappedIndex = currentStepIndex;

    if (mappedIndex > index) return "complete";
    if (mappedIndex === index) return "active";
    return "idle";
  };

  if (chatMode !== "sandbox" && !isPipelineRunning) return null;

  return (
    <div className="w-0 flex flex-col items-center justify-center relative z-20">
      <div className="absolute top-0 bottom-0 w-[1px] bg-border transition-colors"></div>
      <div className="space-y-6 flex flex-col items-center z-20 relative bg-background/80 backdrop-blur-sm py-6 rounded-full border border-border shadow-sm">
        {nodes.map((node, index) => {
          const status = getStepStatus(index);
          
          return (
            <div key={node.id} className="relative flex items-center justify-center group">
              <div className={`rounded-full bg-background flex items-center justify-center ${
                status === "active" ? "text-orange-500 animate-pulse bg-orange-500/10" : 
                status === "complete" ? "text-green-500 bg-green-500/10" : "text-muted-foreground bg-muted/50"
              }`}>
                {status === "complete" ? (
                  <CheckCircle2 className="w-7 h-7 p-0.5" />
                ) : status === "active" ? (
                  <Loader2 className="w-7 h-7 p-0.5 animate-spin" />
                ) : (
                  <Circle className="w-7 h-7 p-1" />
                )}
              </div>
              <div className="absolute left-full ml-3 px-3 py-2 bg-black/90 dark:bg-white/90 text-white dark:text-black rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 flex flex-col items-start min-w-max">
                <span className="text-[12px] font-bold">{node.label}</span>
                <span className="text-[10px] opacity-80">{node.description}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
