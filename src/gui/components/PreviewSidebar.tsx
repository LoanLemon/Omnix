import React, { useEffect } from "react";
import { Code2, ImageIcon, ExternalLink, Brain, X } from "lucide-react";
import { Card, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sandbox } from "./Sandbox";
import { MemoryDashboard } from "./MemoryDashboard";
import { useApp } from "../context/AppContext";

export function PreviewSidebar() {
  const {
    activeTab,
    setActiveTab,
    sandboxFiles,
    generatedImage,
    showMemoryDashboard,
    setShowMemoryDashboard
  } = useApp();

  // Dynamic activeTab fallback and shifting
  useEffect(() => {
    if (activeTab === "chat") {
      if (sandboxFiles.length > 0) {
        setActiveTab("sandbox");
      } else if (generatedImage) {
        setActiveTab("gallery");
      } else if (showMemoryDashboard) {
        setActiveTab("memory");
      }
    } else if (activeTab === "memory" && !showMemoryDashboard) {
      if (sandboxFiles.length > 0) {
        setActiveTab("sandbox");
      } else if (generatedImage) {
        setActiveTab("gallery");
      }
    } else if (activeTab === "sandbox" && sandboxFiles.length === 0) {
      if (generatedImage) {
        setActiveTab("gallery");
      } else if (showMemoryDashboard) {
        setActiveTab("memory");
      }
    } else if (activeTab === "gallery" && !generatedImage) {
      if (sandboxFiles.length > 0) {
        setActiveTab("sandbox");
      } else if (showMemoryDashboard) {
        setActiveTab("memory");
      }
    }
  }, [activeTab, sandboxFiles, generatedImage, showMemoryDashboard, setActiveTab]);

  return (
    <aside id="omnix-preview-sidebar" className="w-[420px] border-l border-border bg-background flex flex-col shrink-0 overflow-hidden relative">
      {/* Visual Accent Bar */}
      <div className="absolute inset-y-0 left-0 w-[1px] bg-gradient-to-b from-transparent via-orange-500/10 to-transparent" />
      
      <div className="h-11 border-b border-border flex items-center px-4 gap-4 bg-muted/60 justify-between">
        <div className="flex gap-4">
          {sandboxFiles.length > 0 && (
            <button 
              className={`text-[9.5px] font-mono font-bold uppercase tracking-widest pb-3.5 pt-3.5 border-b-2 transition-colors cursor-pointer ${activeTab === 'sandbox' ? 'border-orange-500 text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('sandbox')}
            >
              Sandbox
            </button>
          )}
          {generatedImage && (
            <button 
              className={`text-[9.5px] font-mono font-bold uppercase tracking-widest pb-3.5 pt-3.5 border-b-2 transition-colors cursor-pointer ${activeTab === 'gallery' ? 'border-orange-500 text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('gallery')}
            >
              Gallery
            </button>
          )}
          {showMemoryDashboard && (
            <button 
              className={`text-[9.5px] font-mono font-bold uppercase tracking-widest pb-3.5 pt-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${activeTab === 'memory' ? 'border-orange-500 text-orange-500' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
              onClick={() => setActiveTab('memory')}
            >
              <Brain className="w-3 h-3 text-orange-500" />
              Cognitive Space
            </button>
          )}
        </div>

        {activeTab === 'memory' && (
          <button 
            onClick={() => setShowMemoryDashboard(false)}
            className="text-muted-foreground/50 hover:text-foreground p-1 transition-colors"
            title="Close Dashboard"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'sandbox' && (
          sandboxFiles.length > 0 ? (
            <div className="h-full p-4 overflow-auto">
              <Sandbox files={sandboxFiles} />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-muted-foreground p-4">
              <Code2 className="w-12 h-12 opacity-20 animate-pulse" />
              <p className="text-xs max-w-[200px]">Ask the assistant to "create a sandbox app" to view source assets here.</p>
            </div>
          )
        )}

        {activeTab === 'gallery' && (
          <div className="p-4 overflow-y-auto h-full space-y-4">
            {generatedImage ? (
              <Card className="bg-muted border-border overflow-hidden rounded-md">
                <img src={generatedImage} alt="Generated" className="w-full aspect-square object-cover" referrerPolicy="no-referrer" />
                <CardFooter className="p-3 bg-background flex justify-between items-center rounded-none border-t border-border/30">
                  <span className="text-[9px] text-muted-foreground font-mono">OMNIX_GEN_ASSET_01.PNG</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-orange-500" onClick={() => window.open(generatedImage!)}>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center space-y-4 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                <ImageIcon className="w-12 h-12 opacity-20" />
                <p className="text-xs max-w-[200px]">Generated assets will manifest inside this slot.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'memory' && showMemoryDashboard && (
          <MemoryDashboard />
        )}
      </div>
    </aside>
  );
}
