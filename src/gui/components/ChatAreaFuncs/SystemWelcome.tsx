import { Sparkles, Activity, Image as ImageIcon, Music } from "lucide-react";

interface SystemWelcomeProps {
  isModelReady: boolean;
  hasWebGPU: boolean;
  setInput: (val: string) => void;
  handleToolCall: (toolCall: any) => void;
  handleMusicGen: (prompt: string) => void;
}

export function SystemWelcome({
  isModelReady,
  hasWebGPU,
  setInput,
  handleToolCall,
  handleMusicGen,
}: SystemWelcomeProps) {
  return (
    <div className="py-12 space-y-12">
      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="w-20 h-20 rounded-xl bg-zinc-900 border border-orange-500/30 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(249,115,22,0.1)] group">
            <Sparkles className="w-10 h-10 text-orange-500 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute -inset-1 bg-orange-500/10 blur-xl rounded-full opacity-50 pulse-slow" />
          </div>
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-mono font-bold tracking-tighter uppercase text-foreground">
            OMNIX
          </h2>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.3em] opacity-40">
            Orchestration_Interface
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
        <div
          className="p-4 rounded-sm border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all group cursor-pointer animate-in fade-in slide-in-from-bottom-2 duration-300"
          onClick={() =>
            setInput(
              "Describe the current context and available models.",
            )
          }
        >
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-4 h-4 text-orange-500/70" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground/80">
              System_Status
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed uppercase opacity-60">
            Query the orchestration engine for status and capabilities.
          </p>
        </div>

        <div
          className="p-4 rounded-sm border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all group cursor-pointer animate-in fade-in slide-in-from-bottom-2 duration-300"
          style={{ animationDelay: "50ms" }}
          onClick={() =>
            (
              document.getElementById(
                "vision-upload",
              ) as HTMLInputElement
            )?.click()
          }
        >
          <div className="flex items-center gap-3 mb-2">
            <ImageIcon className="w-4 h-4 text-blue-500/70" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground/80">
              Vision_Analysis
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed uppercase opacity-60">
            Upload imagery for multi-modal analysis and extraction.
          </p>
        </div>

        <div
          className="p-4 rounded-sm border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all group cursor-pointer animate-in fade-in slide-in-from-bottom-2 duration-300"
          style={{ animationDelay: "100ms" }}
          onClick={() =>
            handleToolCall({
              tool: "image_gen",
              params: {
                prompt: "A futuristic command center in space",
              },
            })
          }
        >
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-4 h-4 text-purple-500/70" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground/80">
              Visual_Synthesis
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed uppercase opacity-60">
            Generate high-fidelity visual assets using local FLUX nodes.
          </p>
        </div>

        <div
          className="p-4 rounded-sm border border-border/50 bg-muted/20 hover:bg-muted/40 transition-all group cursor-pointer animate-in fade-in slide-in-from-bottom-2 duration-300"
          style={{ animationDelay: "150ms" }}
          onClick={() =>
            handleMusicGen("Ambient cinematic sci-fi background")
          }
        >
          <div className="flex items-center gap-3 mb-2">
            <Music className="w-4 h-4 text-pink-500/70" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground/80">
              Audio_Composition
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed uppercase opacity-60">
            Synthesize sonic landscapes and musical motifs locally.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-8 py-4 opacity-30">
        <div className="flex items-center gap-2">
          <div
            className={`w-1.5 h-1.5 rounded-full ${isModelReady ? "bg-green-400" : "bg-zinc-600"}`}
          />
          <span className="text-[8px] font-mono uppercase tracking-[0.2em] font-bold italic">
            Engine_Locked
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
          <span className="text-[8px] font-mono uppercase tracking-[0.2em] font-bold italic">
            {hasWebGPU ? "GPU_ACCEL" : "CPU_ONLY"}
          </span>
        </div>
      </div>
    </div>
  );
}
