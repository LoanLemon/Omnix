import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, Code2, Globe, Zap, Image as ImageIcon, Music, Bot, Mic, Volume2, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ApiGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiGuideModal({ isOpen, onClose }: ApiGuideModalProps) {
  const PORT = window.location.port || "9777";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-[80vw] w-full max-h-[90vh] h-[85vh] p-0 bg-[#0A0A0A] border-[#222222] text-zinc-100 overflow-hidden">
        <div className="flex flex-col h-full max-h-[90vh]">
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
            {/* Local Nav */}
            <div className="w-56 border-r border-zinc-800 bg-zinc-900/20 hidden md:block">
              <ScrollArea className="h-full p-4">
                <nav className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter mb-4">Endpoints</p>
                  {['Text', 'Vision', 'Director', 'Image', 'Music', 'STT', 'TTS', 'Health Check', 'Domain Integration'].map(item => (
                    <button 
                      key={item}
                      onClick={() => {
                        const sectionId = `api-guide-${item.toLowerCase().replace(/\s+/g, "-")}`;
                        const el = document.getElementById(sectionId);
                        if (el) {
                          el.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-mono text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded transition-colors flex items-center justify-between group"
                    >
                      <span>{item}</span>
                      <span className="text-[10px] text-zinc-600 group-hover:text-orange-500 font-mono">→</span>
                    </button>
                  ))}
                </nav>
              </ScrollArea>
            </div>

            <ScrollArea className="flex-1 p-6 lg:p-10">
              <div className="max-w-5xl lg:max-w-6xl mx-auto space-y-16 pb-20">
                
                {/* Text Generation */}
                <section id="api-guide-text" className="space-y-6 scroll-mt-6">
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
                  
                  {/* Schema */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 font-mono">Parameters & Schema</span>
                    <div className="bg-zinc-950/70 border border-zinc-900 rounded-lg p-4 font-mono text-[11px] w-full divide-y divide-zinc-800/45">
                      <div className="grid grid-cols-12 gap-4 pb-2 text-[9px] font-bold text-zinc-600 tracking-wider uppercase">
                        <div className="col-span-3">Field</div>
                        <div className="col-span-3">Type / Presence</div>
                        <div className="col-span-6">Description</div>
                      </div>
                      <div className="grid grid-cols-12 gap-4 py-2 hover:bg-zinc-900/10">
                        <div className="col-span-3 text-orange-500">prompt</div>
                        <div className="col-span-3 text-zinc-400">string • Required</div>
                        <div className="col-span-6 text-zinc-500">The core text content or instruction to the model.</div>
                      </div>
                      <div className="grid grid-cols-12 gap-4 py-2 hover:bg-zinc-900/10">
                        <div className="col-span-3 text-orange-500">systemPrompt</div>
                        <div className="col-span-3 text-zinc-400">string • Optional</div>
                        <div className="col-span-6 text-zinc-500">Guiding rules or custom system-level persona for the response.</div>
                      </div>
                      <div className="grid grid-cols-12 gap-4 py-2 hover:bg-zinc-900/10">
                        <div className="col-span-3 text-orange-500">modelId</div>
                        <div className="col-span-3 text-zinc-400">string • Optional</div>
                        <div className="col-span-6 text-zinc-500">Target a specific loaded text model. If absent, reuse current or default model.</div>
                      </div>
                      <div className="grid grid-cols-12 gap-4 py-2 hover:bg-zinc-900/10">
                        <div className="col-span-3 text-orange-500">reqId</div>
                        <div className="col-span-3 text-zinc-400">string • Optional</div>
                        <div className="col-span-6 text-zinc-500">Unique tracking key for task correlation, logs, and streaming updates. Body, query, or header.</div>
                      </div>
                    </div>
                  </div>

                  {/* Examples */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 font-mono">Payload Examples</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider pl-1">Request JSON</span>
                        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] h-32 overflow-y-auto w-full">
                          <pre className="text-zinc-300">
{`{
  "prompt": "Write a poem...",
  "systemPrompt": "Expert poet",
  "modelId": "gemma-2:2b-instruct"
}`}
                          </pre>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider pl-1">Response JSON</span>
                        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] h-32 overflow-y-auto w-full">
                          <pre className="text-emerald-500">
{`{
  "response": "In silicon hearts...",
  "think": "Analyzing user query for creative poetic forms. Developing rhyming scheme...",
  "tokens": 42
}`}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Vision Analysis */}
                <section id="api-guide-vision" className="space-y-6 scroll-mt-6">
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

                  {/* Schema */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 font-mono">Parameters & Schema (Multipart Form-Data)</span>
                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] w-full divide-y divide-zinc-800/45">
                      <div className="grid grid-cols-12 gap-4 pb-2 text-[9px] font-bold text-zinc-600 tracking-wider uppercase">
                        <div className="col-span-3">Field</div>
                        <div className="col-span-3">Type / Presence</div>
                        <div className="col-span-6">Description</div>
                      </div>
                      <div className="grid grid-cols-12 gap-4 py-2 hover:bg-zinc-900/10">
                        <div className="col-span-3 text-orange-500">image</div>
                        <div className="col-span-3 text-zinc-400">File (Binary) • Required</div>
                        <div className="col-span-6 text-zinc-500">The physical image file input (JPEG/PNG/WebP).</div>
                      </div>
                      <div className="grid grid-cols-12 gap-4 py-2 hover:bg-zinc-900/10">
                        <div className="col-span-3 text-orange-500">prompt</div>
                        <div className="col-span-3 text-zinc-400">string • Optional</div>
                        <div className="col-span-6 text-zinc-500">Visual query/question (defaults to image description).</div>
                      </div>
                      <div className="grid grid-cols-12 gap-4 py-2 hover:bg-zinc-900/10">
                        <div className="col-span-3 text-orange-500">modelId</div>
                        <div className="col-span-3 text-zinc-400">string • Optional</div>
                        <div className="col-span-6 text-zinc-500">Loaded vision model to target (e.g. fastvlm-1).</div>
                      </div>
                      <div className="grid grid-cols-12 gap-4 py-2 hover:bg-zinc-900/10">
                        <div className="col-span-3 text-orange-500">reqId</div>
                        <div className="col-span-3 text-zinc-400">string • Optional</div>
                        <div className="col-span-6 text-zinc-500">Unique tracking key for task correlation, logs, and streaming updates. Form field, query, or header.</div>
                      </div>
                    </div>
                  </div>

                  {/* Examples */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 font-mono">Payload Examples</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider pl-1">Request Payload (FormData)</span>
                        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] h-32 overflow-y-auto w-full text-zinc-300">
                          <div><span className="text-zinc-500">Headers:</span> <code className="text-zinc-400">Content-Type: multipart/form-data</code></div>
                          <div className="mt-2"><span className="text-zinc-500">Fields:</span></div>
                          <div className="pl-4 space-y-1">
                            <div><span className="text-orange-500">image</span>: <code className="text-zinc-400">[pixel_buffer.png]</code></div>
                            <div><span className="text-orange-500">prompt</span>: <code className="text-zinc-400">"What object is listed here?"</code></div>
                            <div><span className="text-orange-500">modelId</span>: <code className="text-zinc-400">"paligemma-3b"</code></div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider pl-1">Response JSON</span>
                        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] h-32 overflow-y-auto w-full">
                          <pre className="text-purple-400">
{`{
  "response": "The image displays a localized electrical transistor marked 5V...",
  "think": "Detecting fine-grained high-contrast visual features. Spotting part labels on high-res PCB components..."
}`}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Director */}
                <section id="api-guide-director" className="space-y-6 scroll-mt-6">
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

                  {/* Schema */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 font-mono">Parameters & Schema</span>
                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] w-full divide-y divide-zinc-800/45">
                      <div className="grid grid-cols-12 gap-4 pb-2 text-[9px] font-bold text-zinc-600 tracking-wider uppercase">
                        <div className="col-span-3">Field</div>
                        <div className="col-span-3">Type / Presence</div>
                        <div className="col-span-6">Description</div>
                      </div>
                      <div className="grid grid-cols-12 gap-4 py-2 hover:bg-zinc-900/10">
                        <div className="col-span-3 text-orange-500">prompt</div>
                        <div className="col-span-3 text-zinc-400">string • Required</div>
                        <div className="col-span-6 text-zinc-500">The user query representing overall system instructions (e.g. generate music).</div>
                      </div>
                      <div className="grid grid-cols-12 gap-4 py-2 hover:bg-zinc-900/10">
                        <div className="col-span-3 text-orange-500">reqId</div>
                        <div className="col-span-3 text-zinc-400">string • Optional</div>
                        <div className="col-span-6 text-zinc-500">Unique tracking key for task correlation, logs, and streaming updates. Body, query, or header.</div>
                      </div>
                    </div>
                  </div>

                  {/* Examples */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 font-mono">Payload Examples</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-zinc-950 border border-dashed border-zinc-800 rounded-lg p-4 font-mono text-[11px] w-full">
                        <p className="text-zinc-600 mb-2 font-bold uppercase text-[9px] tracking-wider">// Request JSON</p>
                        <pre className="text-zinc-300">{`{ 
  "prompt": "Create music" 
}`}</pre>
                      </div>
                      <div className="bg-zinc-950 border border-dashed border-zinc-800 rounded-lg p-4 font-mono text-[11px] w-full">
                        <p className="text-zinc-600 mb-2 font-bold uppercase text-[9px] tracking-wider">// Response JSON</p>
                        <pre className="text-orange-400">{`{ 
  "intent": "music_gen", 
  "prompt": "Create music" 
}`}</pre>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Image Generation */}
                <section id="api-guide-image" className="space-y-6 scroll-mt-6">
                  <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-pink-500/10 flex items-center justify-center border border-pink-500/20">
                        <ImageIcon className="w-4 h-4 text-pink-500" />
                      </div>
                      <h3 className="text-lg font-mono font-bold uppercase tracking-tight">Image Generation</h3>
                    </div>
                    <code className="px-2 py-1 bg-zinc-900 text-pink-400 border border-zinc-800 rounded text-[10px]">POST /api/image</code>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Generate photorealistic or graphic assets using Imagen or Stable Diffusion models inside the local workspace.
                  </p>

                  {/* Schema */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 font-mono">Parameters & Schema</span>
                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] w-full divide-y divide-zinc-800/45">
                      <div className="grid grid-cols-12 gap-4 pb-2 text-[9px] font-bold text-zinc-600 tracking-wider uppercase">
                        <div className="col-span-3">Field</div>
                        <div className="col-span-3">Type / Presence</div>
                        <div className="col-span-6">Description</div>
                      </div>
                      <div className="grid grid-cols-12 gap-4 py-2 hover:bg-zinc-900/10">
                        <div className="col-span-3 text-orange-500">prompt</div>
                        <div className="col-span-3 text-zinc-400">string • Required</div>
                        <div className="col-span-6 text-zinc-500">Description of image layout and artistic requirements.</div>
                      </div>
                      <div className="grid grid-cols-12 gap-4 py-2 hover:bg-zinc-900/10">
                        <div className="col-span-3 text-orange-500">modelId</div>
                        <div className="col-span-3 text-zinc-400">string • Optional</div>
                        <div className="col-span-6 text-zinc-500">Loaded image diffusion target to utilize (e.g. stable-diffusion-1.5).</div>
                      </div>
                      <div className="grid grid-cols-12 gap-4 py-2 hover:bg-zinc-900/10">
                        <div className="col-span-3 text-orange-500">reqId</div>
                        <div className="col-span-3 text-zinc-400">string • Optional</div>
                        <div className="col-span-6 text-zinc-500">Unique tracking key for task correlation, logs, and streaming updates. Body, query, or header.</div>
                      </div>
                    </div>
                  </div>

                  {/* Examples */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 font-mono">Payload Examples</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest pl-1">Request JSON</span>
                        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] h-32 overflow-y-auto w-full">
                          <pre className="text-zinc-300">
{`{
  "prompt": "Futuristic cyberpunk terminal with soft holograms, 8k resolution",
  "modelId": "imagen-3"
}`}
                          </pre>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest pl-1">Response JSON</span>
                        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] h-32 overflow-y-auto w-full">
                          <pre className="text-pink-400">
{`{
  "status": "success",
  "image": "data:image/png;base64,iVBORw0KGgoAAAANS..."
}`}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Music Generation */}
                <section id="api-guide-music" className="space-y-6 scroll-mt-6">
                  <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                        <Music className="w-4 h-4 text-yellow-500" />
                      </div>
                      <h3 className="text-lg font-mono font-bold uppercase tracking-tight">Music Generation</h3>
                    </div>
                    <code className="px-2 py-1 bg-zinc-900 text-yellow-400 border border-zinc-800 rounded text-[10px]">POST /api/music</code>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Generate audio soundtracks, backing melodies, or ambient loops.
                  </p>

                  {/* Schema */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 font-mono">Parameters & Schema</span>
                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] w-full divide-y divide-zinc-800/45">
                      <div className="grid grid-cols-12 gap-4 pb-2 text-[9px] font-bold text-zinc-600 tracking-wider uppercase">
                        <div className="col-span-3">Field</div>
                        <div className="col-span-3">Type / Presence</div>
                        <div className="col-span-6">Description</div>
                      </div>
                      <div className="grid grid-cols-12 gap-4 py-2 hover:bg-zinc-900/10">
                        <div className="col-span-3 text-orange-500">prompt</div>
                        <div className="col-span-3 text-zinc-400">string • Required</div>
                        <div className="col-span-6 text-zinc-500">Acoustic criteria (genre, feeling, speed, instruments).</div>
                      </div>
                      <div className="grid grid-cols-12 gap-4 py-2 hover:bg-zinc-900/10">
                        <div className="col-span-3 text-orange-500">modelId</div>
                        <div className="col-span-3 text-zinc-400">string • Optional</div>
                        <div className="col-span-6 text-zinc-500">Id of specific loaded music model inside workspace.</div>
                      </div>
                      <div className="grid grid-cols-12 gap-4 py-2 hover:bg-zinc-900/10">
                        <div className="col-span-3 text-orange-500">reqId</div>
                        <div className="col-span-3 text-zinc-400">string • Optional</div>
                        <div className="col-span-6 text-zinc-500">Unique tracking key for task correlation, logs, and streaming updates. Body, query, or header.</div>
                      </div>
                    </div>
                  </div>

                  {/* Examples */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 font-mono">Payload Examples</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest pl-1">Request JSON</span>
                        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] h-32 overflow-y-auto w-full">
                          <pre className="text-zinc-300">
{`{
  "prompt": "80s synthwave loop, high energy, fast tempo",
  "modelId": "music-gen-default"
}`}
                          </pre>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest pl-1">Response JSON</span>
                        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] h-32 overflow-y-auto w-full">
                          <pre className="text-yellow-400">
{`{
  "status": "success",
  "audio": "data:audio/mp3;base64,SUQzBAAAAAAA..."
}`}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Speech-to-Text */}
                <section id="api-guide-stt" className="space-y-6 scroll-mt-6">
                  <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                        <Mic className="w-4 h-4 text-teal-500" />
                      </div>
                      <h3 className="text-lg font-mono font-bold uppercase tracking-tight">Speech-To-Text</h3>
                    </div>
                    <code className="px-2 py-1 bg-zinc-900 text-teal-400 border border-zinc-800 rounded text-[10px]">POST /api/stt</code>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Transcribe audio recordings or vocal speech into literal transcripts. Accepts multipart form-data.
                  </p>

                  {/* Schema */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 font-mono">Parameters & Schema (Multipart Form-Data)</span>
                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] w-full divide-y divide-zinc-800/45">
                      <div className="grid grid-cols-12 gap-4 pb-2 text-[9px] font-bold text-zinc-600 tracking-wider uppercase">
                        <div className="col-span-3">Field</div>
                        <div className="col-span-3">Type / Presence</div>
                        <div className="col-span-6">Description</div>
                      </div>
                      <div className="grid grid-cols-12 gap-4 py-2 hover:bg-zinc-900/10">
                        <div className="col-span-3 text-orange-500">audio</div>
                        <div className="col-span-3 text-zinc-400">File (Binary) • Required</div>
                        <div className="col-span-6 text-zinc-500">Binary voice recording file format (e.g. wav/mp3).</div>
                      </div>
                      <div className="grid grid-cols-12 gap-4 py-2 hover:bg-zinc-900/10">
                        <div className="col-span-3 text-orange-500">reqId</div>
                        <div className="col-span-3 text-zinc-400">string • Optional</div>
                        <div className="col-span-6 text-zinc-500">Unique tracking key for task correlation, logs, and streaming updates. Form field, query, or header.</div>
                      </div>
                    </div>
                  </div>

                  {/* Examples */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 font-mono">Payload Examples</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider pl-1">Request Payload (FormData)</span>
                        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] h-32 overflow-y-auto w-full text-zinc-300">
                          <div><span className="text-zinc-500">Headers:</span> <code className="text-zinc-400">Content-Type: multipart/form-data</code></div>
                          <div className="mt-2"><span className="text-zinc-500">Fields:</span></div>
                          <div className="pl-4 space-y-1">
                            <div><span className="text-orange-500">audio</span>: <code className="text-zinc-400">[vocal_record.wav]</code></div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider pl-1">Response JSON</span>
                        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] h-32 overflow-y-auto w-full">
                          <pre className="text-teal-400">
{`{
  "text": "Identify local networks and boot database container automatically."
}`}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Text-to-Speech */}
                <section id="api-guide-tts" className="space-y-6 scroll-mt-6">
                  <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                        <Volume2 className="w-4 h-4 text-cyan-500" />
                      </div>
                      <h3 className="text-lg font-mono font-bold uppercase tracking-tight">Text-To-Speech</h3>
                    </div>
                    <code className="px-2 py-1 bg-zinc-900 text-cyan-400 border border-zinc-800 rounded text-[10px]">POST /api/tts</code>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Synthesize text and create realistic audible spoken audio with adjustable voices.
                  </p>

                  {/* Schema */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 font-mono">Parameters & Schema</span>
                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] w-full divide-y divide-zinc-800/45">
                      <div className="grid grid-cols-12 gap-4 pb-2 text-[9px] font-bold text-zinc-600 tracking-wider uppercase">
                        <div className="col-span-3">Field</div>
                        <div className="col-span-3">Type / Presence</div>
                        <div className="col-span-6">Description</div>
                      </div>
                      <div className="grid grid-cols-12 gap-4 py-2 hover:bg-zinc-900/10">
                        <div className="col-span-3 text-orange-500">text</div>
                        <div className="col-span-3 text-zinc-400">string • Required</div>
                        <div className="col-span-6 text-zinc-500">The textual message content to read.</div>
                      </div>
                      <div className="grid grid-cols-12 gap-4 py-2 hover:bg-zinc-900/10">
                        <div className="col-span-3 text-orange-500">modelId</div>
                        <div className="col-span-3 text-zinc-400">string • Optional</div>
                        <div className="col-span-6 text-zinc-500">Timbre pattern/voice id to load in background.</div>
                      </div>
                      <div className="grid grid-cols-12 gap-4 py-2 hover:bg-zinc-900/10">
                        <div className="col-span-3 text-orange-500">reqId</div>
                        <div className="col-span-3 text-zinc-400">string • Optional</div>
                        <div className="col-span-6 text-zinc-500">Unique tracking key for task correlation, logs, and streaming updates. Body, query, or header.</div>
                      </div>
                    </div>
                  </div>

                  {/* Examples */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 font-mono">Payload Examples</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest pl-1">Request JSON</span>
                        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] h-32 overflow-y-auto w-full">
                          <pre className="text-zinc-300">
{`{
  "text": "Intelligent system online. All operations active.",
  "modelId": "tts-voice-male-1"
}`}
                          </pre>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest pl-1">Response JSON</span>
                        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] h-32 overflow-y-auto w-full">
                          <pre className="text-cyan-400">
{`{
  "audioUrl": "data:audio/mp3;base64,SUQzBAAAAAAA...",
  "type": "audio/mp3"
}`}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Health Check */}
                <section id="api-guide-health-check" className="space-y-6 scroll-mt-6">
                  <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <Activity className="w-4 h-4 text-emerald-500" />
                      </div>
                      <h3 className="text-lg font-mono font-bold uppercase tracking-tight">Health Check</h3>
                    </div>
                    <code className="px-2 py-1 bg-zinc-900 text-emerald-400 border border-zinc-800 rounded text-[10px]">GET /api/health</code>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Verify status, availability, and permissions. If a cross-origin external page invokes this endpoint and is authorized via 
                    <span className="text-white font-semibold"> Allow Once</span>, a grace token is temporarily cached. The domain is then allowed to make its next core inference request (e.g., text, image, or sound generation) automatically without generating a secondary permissions prompt.
                  </p>

                  {/* Schema */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 font-mono">Request Headers</span>
                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] w-full divide-y divide-zinc-800/45">
                      <div className="grid grid-cols-12 gap-4 pb-2 text-[9px] font-bold text-zinc-600 tracking-wider uppercase">
                        <div className="col-span-3">Field</div>
                        <div className="col-span-3">Type / Presence</div>
                        <div className="col-span-6">Description</div>
                      </div>
                      <div className="grid grid-cols-12 gap-4 py-2 hover:bg-zinc-900/10">
                        <div className="col-span-3 text-orange-500">Origin / Referer</div>
                        <div className="col-span-3 text-zinc-400">string • Implicit</div>
                        <div className="col-span-6 text-zinc-500">Automatically supplied by browser to allow hostname validation and access checks.</div>
                      </div>
                      <div className="grid grid-cols-12 gap-4 py-2 hover:bg-zinc-900/10">
                        <div className="col-span-3 text-orange-500">reqId</div>
                        <div className="col-span-3 text-zinc-400">string • Optional</div>
                        <div className="col-span-6 text-zinc-500">Unique tracking key for health correlation. Supported as query parameter or header.</div>
                      </div>
                    </div>
                  </div>

                  {/* Examples */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 font-mono">Payload Examples</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider pl-1">Request Payload</span>
                        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] h-32 overflow-y-auto w-full text-zinc-400">
                          <code className="text-emerald-400">GET http://localhost:{PORT}/api/health</code>
                          <div className="mt-4 text-zinc-500">// Native JS invocation:</div>
                          <pre className="text-zinc-300 mt-1">
{`fetch("http://localhost:${PORT}/api/health")
  .then(res => res.json())`}
                          </pre>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider pl-1">Response JSON</span>
                        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] h-32 overflow-y-auto w-full">
                          <pre className="text-emerald-400">
{`{
  "status": "ok",
  "pid": 2841
}`}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Domain Integration & Private Network Security */}
                <section id="api-guide-domain-integration" className="space-y-6 scroll-mt-6">
                  <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                        <Globe className="w-4 h-4 text-teal-500" />
                      </div>
                      <h3 className="text-lg font-mono font-bold uppercase tracking-tight">Domain Integration & PNA</h3>
                    </div>
                    <Badge className="bg-teal-500/10 border-teal-500/20 text-teal-400 hover:bg-teal-500/20">CORS PNA ENABLED</Badge>
                  </div>
                  
                  <div className="space-y-4 text-sm text-zinc-400 leading-relaxed">
                    <p>
                      Omnix supports direct cross-origin access from external web applications (CORS). It is engineered with 
                      explicit support for <span className="text-white font-semibold">Private Network Access (PNA)</span>, 
                      which allows secure requests from public internet web pages directly to your local computer's Omnix server.
                    </p>

                    <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-lg space-y-3">
                      <h4 className="text-xs uppercase font-mono tracking-wider text-zinc-200">Interactive User Consent Prompting</h4>
                      <p className="text-xs text-zinc-400">
                        To protect your privacy and compute power, Omnix intercepts all external website requests. Whenever an external site attempts to query your running models, you will be prompted on the Omnix GUI with three options:
                      </p>
                      <ul className="list-disc pl-5 mt-2 space-y-1.5 text-xs">
                        <li><strong className="text-white">Allow Once:</strong> Authorizes only the current pending api request.</li>
                        <li><strong className="text-teal-400">Allow Always:</strong> Stores the referring domain persistently in <code className="text-orange-500">permissions.json</code> so future requests can automatically execute without prompting.</li>
                        <li><strong className="text-red-400">Never Allow:</strong> Immediately blocks the domain from communicating with Omnix.</li>
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest pl-1">JavaScript Fetch Example</span>
                      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] overflow-x-auto">
                        <pre className="text-teal-300">
{`// From your external website:
fetch("http://localhost:\${PORT}/api/text", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    prompt: "Hello Omnix! What is your active model?"
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error("Access refused or blocked. Ensure Omnix is running."));`}
                        </pre>
                      </div>
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
            <span>OMNIX ENGINE v0.4.0 • HEADLESS_STABLE</span>
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
