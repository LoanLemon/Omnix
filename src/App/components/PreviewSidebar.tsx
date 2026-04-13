import { Code2, ImageIcon, ExternalLink } from "lucide-react";
import { Card, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sandbox } from "../../components/Sandbox";

import { SandboxFile } from "../types";

interface PreviewSidebarProps {
  activeTab: string;
  setActiveTab: (tab: "chat" | "sandbox" | "gallery") => void;
  sandboxFiles: SandboxFile[];
  generatedImage: string | null;
}

export function PreviewSidebar({
  activeTab,
  setActiveTab,
  sandboxFiles,
  generatedImage,
}: PreviewSidebarProps) {
  return (
    <aside className="w-[400px] border-l border-zinc-800 bg-zinc-950 flex flex-col shrink-0 overflow-hidden">
      <div className="h-10 border-b border-zinc-800 flex items-center px-4 gap-4 bg-zinc-900/50">
        {sandboxFiles.length > 0 && (
          <button 
            className={`text-[10px] font-bold uppercase tracking-widest pb-3 pt-3 border-b-2 transition-colors ${activeTab === 'sandbox' ? 'border-orange-500 text-zinc-100' : 'border-transparent text-zinc-500'}`}
            onClick={() => setActiveTab('sandbox')}
          >
            Sandbox
          </button>
        )}
        {generatedImage && (
          <button 
            className={`text-[10px] font-bold uppercase tracking-widest pb-3 pt-3 border-b-2 transition-colors ${activeTab === 'gallery' ? 'border-orange-500 text-zinc-100' : 'border-transparent text-zinc-500'}`}
            onClick={() => setActiveTab('gallery')}
          >
            Gallery
          </button>
        )}
      </div>

      <div className="flex-1 overflow-hidden p-4">
        {activeTab === 'sandbox' ? (
          sandboxFiles.length > 0 ? (
            <Sandbox files={sandboxFiles} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-zinc-600">
              <Code2 className="w-12 h-12 opacity-20" />
              <p className="text-xs max-w-[200px]">Ask the assistant to "create a sandbox app" to see code here.</p>
            </div>
          )
        ) : (
          <div className="space-y-4">
            {generatedImage ? (
              <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
                <img src={generatedImage} alt="Generated" className="w-full aspect-square object-cover" referrerPolicy="no-referrer" />
                <CardFooter className="p-3 bg-zinc-950 flex justify-between items-center">
                  <span className="text-[10px] text-zinc-500 font-mono">GENERATED_ASSET_01.PNG</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => window.open(generatedImage!)}>
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center space-y-4 text-zinc-600 border-2 border-dashed border-zinc-800 rounded-xl">
                <ImageIcon className="w-12 h-12 opacity-20" />
                <p className="text-xs max-w-[200px]">Generated images will appear here.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
