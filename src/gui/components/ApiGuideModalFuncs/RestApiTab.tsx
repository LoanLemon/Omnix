import React from "react";
import { Terminal, Bot, Image as ImageIcon, Activity, Zap, Music, Mic, Volume2, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ParameterSchemaTable } from "./ParameterSchemaTable";
import {
  textParams,
  visionParams,
  isolatedRagParams,
  injectRagParams,
  directorParams,
  imageParams,
  musicParams,
  sttParams,
  ttsParams,
  healthParams,
  waitVoiceParams,
  autoSttTtsParams
} from "./types";

interface RestApiTabProps {
  PORT: string;
}

export function RestApiTab({ PORT }: RestApiTabProps) {
  return (
    <>
      {/* List Models */}
      <section id="api-guide-list-models" className="space-y-6 scroll-mt-6">
        <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-zinc-500/10 flex items-center justify-center border border-zinc-500/20">
              <Terminal className="w-4 h-4 text-zinc-500" />
            </div>
            <h3 className="text-lg font-mono font-bold uppercase tracking-tight">List Models</h3>
          </div>
          <code className="px-2 py-1 bg-zinc-900 text-blue-400 border border-zinc-800 rounded text-[10px]">GET /api/listModels</code>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Retrieve a complete list of all locally supported and configurable models inside Omnix. Useful for dynamically discovering capabilities before task submission.
        </p>

        {/* Examples */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 font-mono">Payload Examples</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider pl-1">Request HTTP</span>
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] h-48 w-full">
                <pre className="text-zinc-300">
{`GET /api/listModels HTTP/1.1
Host: localhost`}
                </pre>
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider pl-1">Response JSON (Truncated)</span>
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] h-48 overflow-y-auto w-full">
                <pre className="text-emerald-500">
{`[
  {
    "id": "qwen-2.5-coder-3b-text",
    "modelID": "onnx-community/Qwen2.5-Coder-3B-Instruct",
    "name": "Qwen 2.5 Coder 3B",
    "description": "Specialized for coding tasks.",
    "size": "~2GB",
    "dtype": "q4",
    "qtypes": [
      "q4f16",
      "q4",
      "fp16",
      "fp32"
    ],
    "category": "text",
    "make": "QWEN",
    "minRam": 3
  }
]`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

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
          <ParameterSchemaTable parameters={textParams} borderType="accent" />
        </div>

        {/* Examples */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 font-mono">Payload Examples</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider pl-1">Request JSON</span>
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] h-48 overflow-y-auto w-full">
                <pre className="text-zinc-300">
{`{
  "prompt": "Tell me about my training at the towers...",
  "systemPrompt": "You are a wise wizard NPC.",
  "isolatedRAG": true,
  "ocean": {
    "openness": 95,
    "conscientiousness": 80,
    "extraversion": 30,
    "agreeableness": 70,
    "neuroticism": 40
  },
  "model": {
    "id": "LemOneLabs/Llama-3.2-1B-Instruct-ONNX",
    "qtype": "q4fp16",
    "temperature": 0.5,
    "top_p": 0.9,
    "top_k": 0.5,
    "maxTokens": 512
  }
}`}
                </pre>
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider pl-1">Response JSON</span>
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] h-48 overflow-y-auto w-full">
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
          <ParameterSchemaTable parameters={visionParams} borderType="normal" />
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
                  <div><span className="text-orange-500">model</span>: <code className="text-zinc-400">{"{\"id\": \"paligemma-3b\", \"qtype\": \"q4fp16\"}"}</code></div>
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

      {/* Isolated RAG */}
      <section id="api-guide-isolated-rag" className="space-y-6 scroll-mt-6">
        <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Activity className="w-4 h-4 text-emerald-500" />
            </div>
            <h3 className="text-lg font-mono font-bold uppercase tracking-tight">Isolated RAG & OCEAN</h3>
          </div>
          <code className="px-2 py-1 bg-zinc-900 text-emerald-400 border border-zinc-800 rounded text-[10px]">POST /api/injectRAG</code>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Build distinct, character-centric sessions with isolated vector memory stores and customize personality using the Big Five (OCEAN) traits.
        </p>

        {/* Schema */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 font-mono">1. Isolated RAG Parameters (Optional on /api/text & /api/vision)</span>
          <ParameterSchemaTable parameters={isolatedRagParams} borderType="accent" />
        </div>

        <div className="space-y-3">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 font-mono">2. Inject Background Story (POST /api/injectRAG)</span>
          <ParameterSchemaTable parameters={injectRagParams} borderType="accent" />
        </div>

        {/* Examples */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 font-mono">Injected & Isolated Query Examples</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider pl-1">Inject Story (POST /api/injectRAG)</span>
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] h-48 overflow-y-auto w-full">
                <pre className="text-zinc-300">
{`{
  "isolatedRAG": true,
  "text": "The wizard was trained at the floating towers of Dalaran, mastering spatial magic.",
  "metadata": { "type": "background_lore" }
}`}
                </pre>
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider pl-1">Response JSON (POST /api/injectRAG)</span>
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] h-48 overflow-y-auto w-full">
                <pre className="text-emerald-500">
{`{
  "success": true,
  "message": "Successfully injected background story into isolated RAG.",
  "entry": {
    "id": "e0b59b1da9b",
    "text": "The wizard was trained at the floating towers...",
    "timestamp": 1782820980000
  }
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
          <ParameterSchemaTable parameters={directorParams} borderType="normal" />
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
          Generate photorealistic or graphic assets using Janus-Pro-1B models inside the local workspace.
        </p>

        {/* Schema */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 font-mono">Parameters & Schema</span>
          <ParameterSchemaTable parameters={imageParams} borderType="normal" />
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
  "model": {
    "id": "Janus-Pro-1B-ONNX",
    "qtype": "q4fp16"
  }
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
          <ParameterSchemaTable parameters={musicParams} borderType="normal" />
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
  "model": {
    "id": "music-gen-default",
    "qtype": "q4fp16",
    "maxTokens": 512
  }
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
          <ParameterSchemaTable parameters={sttParams} borderType="normal" />
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
          <ParameterSchemaTable parameters={ttsParams} borderType="normal" />
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
  "voiceID": "af_heart"
}`}
                </pre>
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest pl-1">Response JSON</span>
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] h-32 overflow-y-auto w-full">
                <pre className="text-cyan-400">
{`{
  "audio": [
    -2.52568071346104e-7,
    6.39836116533843e-7,
    ...
  ],
  "sampling_rate": 24000,
  "wav_base64": "UklGRiQAAABXQVZFZm10IBAAAAABAAEA..."
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
          Verify status, availability, and permissions. If a cross-origin external page invokes this endpoint and is authorized via{" "}
          <span className="text-white font-semibold"> Allow Once</span>, a grace token is temporarily cached. The domain is then allowed to make its next core inference request (e.g., text, image, or sound generation) automatically without generating a secondary permissions prompt.
        </p>

        {/* Schema */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 font-mono">Request Headers</span>
          <ParameterSchemaTable parameters={healthParams} borderType="normal" />
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

      {/* Wait Voice (Microphone STT) */}
      <section id="api-guide-wait-voice" className="space-y-6 scroll-mt-6">
        <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
              <Mic className="w-4 h-4 text-orange-500" />
            </div>
            <h3 className="text-lg font-mono font-bold uppercase tracking-tight">Wait Voice (Microphone STT)</h3>
          </div>
          <code className="px-2 py-1 bg-zinc-900 text-blue-400 border border-zinc-800 rounded text-[10px]">GET/POST /api/waitVoice</code>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Actively triggers the host microphone, listens for speech activity, detects natural pauses/silence, auto-stops recording, transcribes local audio buffer with Whisper STT, and returns the speech text to the requesting system.
        </p>

        {/* Schema */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 font-mono">Parameters & Schema</span>
          <ParameterSchemaTable parameters={waitVoiceParams} />
        </div>

        {/* Examples */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 font-mono">Payload Examples</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider pl-1">Request JSON</span>
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] h-36 w-full">
                <pre className="text-zinc-300">
{`POST /api/waitVoice HTTP/1.1
Host: localhost:${PORT}
Content-Type: application/json

{
  "maxDuration": 12000,
  "silenceDuration": 2000
}`}
                </pre>
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider pl-1">Response JSON</span>
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] h-36 overflow-y-auto w-full">
                <pre className="text-emerald-500">
{`{
  "text": "Hello, this is my spoken response."
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Auto STT and TTS (Unified Conversational Loop) */}
      <section id="api-guide-auto-stt-tts" className="space-y-6 scroll-mt-6">
        <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
              <Volume2 className="w-4 h-4 text-violet-400" />
            </div>
            <h3 className="text-lg font-mono font-bold uppercase tracking-tight">Auto STT & TTS Workflow</h3>
          </div>
          <code className="px-2 py-1 bg-zinc-900 text-blue-400 border border-zinc-800 rounded text-[10px]">GET/POST /api/auto-stt-tts</code>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Executes a complete voice interaction workflow: (1) Activates the user's microphone, (2) Captures and transcribes audio speech-to-text using local Whisper STT, (3) Sends the transcribed query to the text generation model for a response, and (4) Synthesizes and plays back the response voice live using local Kokoro TTS.
        </p>

        {/* Schema */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 font-mono">Parameters & Schema</span>
          <ParameterSchemaTable parameters={autoSttTtsParams} />
        </div>

        {/* Examples */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 font-mono">Payload Examples</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider pl-1">Request JSON</span>
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] h-40 w-full">
                <pre className="text-zinc-300">
{`POST /api/auto-stt-tts HTTP/1.1
Host: localhost:${PORT}
Content-Type: application/json

{
  "maxDuration": 10000,
  "silenceDuration": 1500,
  "voiceID": "af_heart",
  "systemPrompt": "You are a friendly NPC."
}`}
                </pre>
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider pl-1">Response JSON</span>
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] h-40 overflow-y-auto w-full">
                <pre className="text-emerald-500">
{`{
  "stt": "Who are you?",
  "text": "I am Omnix, your local AI companion. How can I help you today?"
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
            Omnix supports direct cross-origin access from external web applications (CORS). It is engineered with{" "}
            explicit support for <span className="text-white font-semibold">Private Network Access (PNA)</span>,{" "}
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
    </>
  );
}
