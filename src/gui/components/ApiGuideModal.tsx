import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, Code2, Globe, Zap, Image as ImageIcon, Music, Bot, Mic, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ApiGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiGuideModal({ isOpen, onClose }: ApiGuideModalProps) {
  const PORT = window.location.port || "7770";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] p-0 bg-[#0A0A0A] border-zinc-800 text-zinc-100 overflow-hidden">
        <div className="flex flex-col h-full max-h-[85vh]">
          {/* Header */}
          <div className="p-6 border-b border-zinc-800 bg-zinc-900/50">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <Globe className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-mono font-bold tracking-tight uppercase">Omnix Local API Guide</DialogTitle>
                  <DialogDescription className="text-zinc-500 font-mono text-xs uppercase tracking-widest mt-1">
                    Headless Inference Engine • Localhost Access
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="mt-4 p-3 bg-zinc-950/50 border border-zinc-800 rounded-md font-mono text-xs flex items-center gap-2">
              <span className="text-zinc-500">BASE URL:</span>
              <code className="text-orange-500 select-all">http://localhost:{PORT}/api</code>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Local Nav (Optional: for jumping to sections) */}
            <div className="w-48 border-r border-zinc-800 bg-zinc-900/20 p-4 hidden md:block">
              <nav className="space-y-1">
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter mb-4">Endpoints</p>
                {['Text', 'Vision', 'Director', 'Image', 'Music', 'STT', 'TTS'].map(item => (
                  <button 
                    key={item}
                    className="w-full text-left px-3 py-1.5 text-xs font-mono text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </nav>
            </div>

            <ScrollArea className="flex-1 p-6 lg:p-10">
              <div className="max-w-3xl mx-auto space-y-16 pb-20">
                
                {/* Text Generation */}
                <section className="space-y-6">
                  <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                        <Bot className="w-4 h-4 text-blue-500" />
                      </div>
                      <h3 className="text-lg font-mono font-bold uppercase tracking-tight">Text Generation</h3>
                    </div>
                    <code className="px-2 py-1 bg-zinc-900 text-blue-400 border border-zinc-800 rounded text-[10px]">POST /api/text</code>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Generate text responses using LLMs like Gemma, Llama, or Qwen. Supports system prompts and standard sampling parameters.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest pl-1">Request JSON</span>
                      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] h-32 overflow-y-auto">
                        <pre className="text-zinc-300">
{`{
  "prompt": "Write a poem...",
  "systemPrompt": "Expert poet",
  "max_tokens": 512
}`}
                        </pre>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest pl-1">Response JSON</span>
                      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] h-32 overflow-y-auto">
                        <pre className="text-emerald-500">
{`{
  "response": "In silicon hearts...",
  "tokens": 42
}`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Vision Analysis */}
                <section className="space-y-6">
                  <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                        <ImageIcon className="w-4 h-4 text-purple-500" />
                      </div>
                      <h3 className="text-lg font-mono font-bold uppercase tracking-tight">Vision Analysis</h3>
                    </div>
                    <code className="px-2 py-1 bg-zinc-900 text-purple-400 border border-zinc-800 rounded text-[10px]">POST /api/vision</code>
                  </div>
                  <p className="text-sm text-zinc-400">
                    Analyze images using Vision-LLMs. Accepts multipart form-data with the physical image file.
                  </p>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px]">
                    <div className="grid grid-cols-2 gap-4 border-b border-zinc-800 pb-3 mb-3 uppercase text-[9px] font-bold text-zinc-600 tracking-tighter">
                      <span>Parameter</span>
                      <span>Type</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-orange-500">image</span>
                        <span className="text-zinc-500">File (Binary)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-orange-500">prompt</span>
                        <span className="text-zinc-500">string (Optional)</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Director */}
                <section className="space-y-6">
                  <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                        <Zap className="w-4 h-4 text-orange-500" />
                      </div>
                      <h3 className="text-lg font-mono font-bold uppercase tracking-tight">Director Routing</h3>
                    </div>
                    <code className="px-2 py-1 bg-zinc-900 text-orange-400 border border-zinc-800 rounded text-[10px]">POST /api/director</code>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Classify intent and extract prompt parameters using the lightweight Director model.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="bg-zinc-950 border border-dashed border-zinc-800 rounded-lg p-4 font-mono text-[10px]">
                        <p className="text-zinc-600 mb-2">// Request</p>
                        <pre className="text-zinc-300">{`{ "prompt": "Create music" }`}</pre>
                     </div>
                     <div className="bg-zinc-950 border border-dashed border-zinc-800 rounded-lg p-4 font-mono text-[10px]">
                        <p className="text-zinc-600 mb-2">// Intent Map</p>
                        <pre className="text-orange-400">{`{ "intent": "music_gen" }`}</pre>
                     </div>
                  </div>
                </section>

                {/* Example CLI */}
                <section className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Terminal className="w-24 h-24" />
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    <Terminal className="w-4 h-4 text-zinc-500" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Example Usage (CURL)</h3>
                  </div>
                  <div className="bg-black/40 rounded border border-white/5 p-4 font-mono text-xs text-zinc-300 whitespace-pre overflow-x-auto">
{`curl -X POST http://localhost:${PORT}/api/text \\
     -H "Content-Type: application/json" \\
     -d '{"prompt": "Sync brain."}'`}
                  </div>
                </section>

              </div>
            </ScrollArea>
          </div>
          
          {/* Footer Info */}
          <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950 text-[10px] font-mono text-zinc-500 flex justify-between items-center">
            <span>OMNIX ENGINE v0.2.0 • HEADLESS_STABLE</span>
            <div className="flex gap-4">
              <span className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-emerald-500" /> API READY</span>
              <span className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-blue-500" /> WS_SESSION: {PORT}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
