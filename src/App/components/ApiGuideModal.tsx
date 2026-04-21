import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, Globe, Zap, Image as ImageIcon, Music, Bot, Mic, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ApiGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiGuideModal({ isOpen, onClose }: ApiGuideModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] bg-popover border-border text-foreground">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-5 h-5 text-orange-500" />
            <DialogTitle className="text-xl font-bold tracking-tight uppercase">Omnix Local API Guide</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Use Omnix as a local inference engine for your other applications. 
            The API runs on <code className="text-orange-500 bg-orange-500/10 px-1 rounded">http://localhost:3000/api</code>.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4 mt-4">
          <div className="space-y-8">
            {/* Text Generation */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Bot className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Text Generation</h3>
                <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-400">POST /api/text</Badge>
              </div>
              <div className="bg-muted rounded-lg p-4 font-mono text-xs space-y-2 border border-border">
                <p className="text-muted-foreground">// Request Body</p>
                <pre className="text-foreground">
{`{
  "prompt": "Write a poem about WebGPU",
  "systemPrompt": "You are a creative poet."
}`}
                </pre>
                <Separator className="bg-border my-2" />
                <p className="text-muted-foreground">// Response</p>
                <pre className="text-green-500">
{`{
  "response": "In the silicon heart where currents flow..."
}`}
                </pre>
              </div>
            </section>

            {/* Vision Analysis */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon className="w-4 h-4 text-purple-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Vision Analysis</h3>
                <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-400">POST /api/vision</Badge>
              </div>
              <div className="bg-muted rounded-lg p-4 font-mono text-xs space-y-2 border border-border">
                <p className="text-muted-foreground">// Form Data (multipart/form-data)</p>
                <ul className="list-disc list-inside text-foreground space-y-1">
                  <li><span className="text-orange-500">image</span>: File (Binary)</li>
                  <li><span className="text-orange-500">prompt</span>: string (Optional)</li>
                </ul>
                <Separator className="bg-border my-2" />
                <p className="text-muted-foreground">// Response</p>
                <pre className="text-green-500">
{`{
  "caption": "A sunset over a calm ocean",
  "response": "The image shows a beautiful sunset..."
}`}
                </pre>
              </div>
            </section>

            {/* Director Routing */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-orange-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Director Routing</h3>
                <Badge variant="outline" className="text-[10px] border-orange-500/30 text-orange-400">POST /api/director</Badge>
              </div>
              <div className="bg-muted rounded-lg p-4 font-mono text-xs space-y-2 border border-border">
                <p className="text-muted-foreground">// Request Body</p>
                <pre className="text-foreground">
{`{
  "prompt": "Generate a picture of a cat"
}`}
                </pre>
                <Separator className="bg-border my-2" />
                <p className="text-muted-foreground">// Response</p>
                <pre className="text-green-500">
{`{
  "intent": "image_gen",
  "prompt": "Generate a picture of a cat"
}`}
                </pre>
              </div>
            </section>

            {/* Image Generation */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon className="w-4 h-4 text-purple-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Image Generation</h3>
                <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-400">POST /api/image</Badge>
              </div>
              <div className="bg-muted rounded-lg p-4 font-mono text-xs space-y-2 border border-border">
                <p className="text-muted-foreground">// Request Body</p>
                <pre className="text-foreground">
{`{
  "prompt": "A futuristic city at night"
}`}
                </pre>
                <Separator className="bg-border my-2" />
                <p className="text-muted-foreground">// Response</p>
                <pre className="text-green-500">
{`{
  "status": "success",
  "url": "https://..."
}`}
                </pre>
              </div>
            </section>

            {/* Music Generation */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Music className="w-4 h-4 text-pink-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Music Generation</h3>
                <Badge variant="outline" className="text-[10px] border-pink-500/30 text-pink-400">POST /api/music</Badge>
              </div>
              <div className="bg-muted rounded-lg p-4 font-mono text-xs space-y-2 border border-border">
                <p className="text-muted-foreground">// Request Body</p>
                <pre className="text-foreground">
{`{
  "prompt": "Lofi hip hop for studying"
}`}
                </pre>
                <Separator className="bg-border my-2" />
                <p className="text-muted-foreground">// Response</p>
                <pre className="text-green-500">
{`{
  "status": "success",
  "audioUrl": "https://..."
}`}
                </pre>
              </div>
            </section>

            {/* Speech-to-Text */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Mic className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Speech-to-Text</h3>
                <Badge variant="outline" className="text-[10px] border-red-500/30 text-red-400">POST /api/stt</Badge>
              </div>
              <div className="bg-muted rounded-lg p-4 font-mono text-xs space-y-2 border border-border">
                <p className="text-muted-foreground">// Form Data (multipart/form-data)</p>
                <ul className="list-disc list-inside text-foreground space-y-1">
                  <li><span className="text-orange-500">audio</span>: File (WAV/MP3)</li>
                </ul>
                <Separator className="bg-border my-2" />
                <p className="text-muted-foreground">// Response</p>
                <pre className="text-green-500">
{`{
  "text": "The transcribed text from audio."
}`}
                </pre>
              </div>
            </section>

            {/* Text-to-Speech */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Volume2 className="w-4 h-4 text-green-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Text-to-Speech</h3>
                <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-400">POST /api/tts</Badge>
              </div>
              <div className="bg-muted rounded-lg p-4 font-mono text-xs space-y-2 border border-border">
                <p className="text-muted-foreground">// Request Body</p>
                <pre className="text-foreground">
{`{
  "text": "Hello, I am Omnix.",
  "voice": "af_bella"
}`}
                </pre>
                <Separator className="bg-border my-2" />
                <p className="text-muted-foreground">// Response</p>
                <pre className="text-green-500">
{`{
  "status": "success",
  "audioUrl": "https://..."
}`}
                </pre>
              </div>
            </section>

            {/* Example Usage */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Terminal className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Example CURL</h3>
              </div>
              <div className="bg-muted rounded-lg p-4 font-mono text-xs border border-border overflow-x-auto">
                <code className="text-foreground whitespace-pre">
{`curl -X POST http://localhost:3000/api/text \\
     -H "Content-Type: application/json" \\
     -d '{"prompt": "Hello Omnix!"}'`}
                </code>
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
