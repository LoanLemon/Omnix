import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, Code2, Globe, Zap, Image as ImageIcon, Music, Bot, Mic, Volume2, Activity, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ParamInfo {
  field: string;
  type: string;
  presence: "Required" | "Optional" | "Implicit";
  description: React.ReactNode;
}

interface ParameterSchemaTableProps {
  parameters: ParamInfo[];
  borderType?: "normal" | "accent";
}

function ParameterSchemaTable({ parameters, borderType = "normal" }: ParameterSchemaTableProps) {
  const [showOptional, setShowOptional] = useState(false);

  const requiredParams = parameters.filter((p) => p.presence === "Required" || p.presence === "Implicit");
  const optionalParams = parameters.filter((p) => p.presence === "Optional");

  const borderClass = borderType === "accent" ? "border-zinc-900 bg-zinc-950/70" : "border-zinc-800 bg-zinc-950";

  return (
    <div className="space-y-3">
      <div className={`border rounded-lg p-4 font-mono text-[11px] w-full divide-y divide-zinc-800/45 ${borderClass}`}>
        <div className="grid grid-cols-12 gap-4 pb-2 text-[9px] font-bold text-zinc-600 tracking-wider uppercase">
          <div className="col-span-3">Field</div>
          <div className="col-span-3">Type / Presence</div>
          <div className="col-span-6">Description</div>
        </div>

        {/* Required/Implicit parameters */}
        {requiredParams.map((param, index) => (
          <div key={index} className="grid grid-cols-12 gap-4 py-2 hover:bg-zinc-900/10">
            <div className="col-span-3 text-orange-500">{param.field}</div>
            <div className="col-span-3 text-zinc-400">
              {param.type} • <span className="text-emerald-500 font-semibold">{param.presence}</span>
            </div>
            <div className="col-span-6 text-zinc-500">{param.description}</div>
          </div>
        ))}

        {requiredParams.length === 0 && (
          <div className="grid grid-cols-12 gap-4 py-3 text-zinc-500 italic text-center">
            <div className="col-span-12">No required parameters.</div>
          </div>
        )}

        {/* Optional parameters (Collapsible) */}
        {showOptional &&
          optionalParams.map((param, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-4 py-2 hover:bg-zinc-900/10 animate-in fade-in slide-in-from-top-1 duration-150"
            >
              <div className="col-span-3 text-orange-500">{param.field}</div>
              <div className="col-span-3 text-zinc-400">
                {param.type} • <span className="text-zinc-500">{param.presence}</span>
              </div>
              <div className="col-span-6 text-zinc-500">{param.description}</div>
            </div>
          ))}
      </div>

      {optionalParams.length > 0 && (
        <div className="flex justify-start">
          <button
            onClick={() => setShowOptional(!showOptional)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider font-mono text-zinc-400 hover:text-zinc-200 bg-zinc-950/20 hover:bg-zinc-900 border border-zinc-800 rounded transition-all cursor-pointer group"
          >
            {showOptional ? (
              <>
                <span>Hide Optional Parameters</span>
                <ChevronUp className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300" />
              </>
            ) : (
              <>
                <span>Show Optional Parameters</span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300" />
              </>
            )}
            <span className="text-[9px] text-zinc-500">({optionalParams.length})</span>
          </button>
        </div>
      )}
    </div>
  );
}

const textParams: ParamInfo[] = [
  {
    field: "prompt",
    type: "string",
    presence: "Required",
    description: "The core text content or instruction to the model."
  },
  {
    field: "systemPrompt",
    type: "string",
    presence: "Optional",
    description: "Guiding rules or custom system-level persona for the response."
  },
  {
    field: "model",
    type: "object",
    presence: "Optional",
    description: <>Optional config object containing <code>id</code>, <code>qtype</code>, <code>temperature</code>, <code>top_p</code>, <code>top_k</code>, <code>maxTokens</code>. If absent, reuse current or default model.</>
  },
  {
    field: "isolatedRAG",
    type: "boolean",
    presence: "Optional",
    description: "If true, queries will retrieve context ONLY from this session's isolated RAG storage tied to the specific reqId."
  },
  {
    field: "ocean",
    type: "object",
    presence: "Optional",
    description: <>Big Five personality traits containing <code>openness</code>, <code>conscientiousness</code>, <code>extraversion</code>, <code>agreeableness</code>, <code>neuroticism</code> (values 0-100) to guide character personality.</>
  },
  {
    field: "reqId",
    type: "string",
    presence: "Optional",
    description: "Unique tracking key for task correlation, logs, and streaming updates. Body, query, or header."
  }
];

const visionParams: ParamInfo[] = [
  {
    field: "image",
    type: "File (Binary)",
    presence: "Required",
    description: "The physical image file input (JPEG/PNG/WebP)."
  },
  {
    field: "prompt",
    type: "string",
    presence: "Optional",
    description: "Visual query/question (defaults to image description)."
  },
  {
    field: "model",
    type: "string (JSON)",
    presence: "Optional",
    description: <>Optional config string containing <code>{"{\"id\": \"...\", \"qtype\": \"...\"}"}</code>.</>
  },
  {
    field: "isolatedRAG",
    type: "boolean",
    presence: "Optional",
    description: "If true, queries will retrieve context ONLY from this session's isolated RAG storage tied to the specific reqId."
  },
  {
    field: "ocean",
    type: "string (JSON)",
    presence: "Optional",
    description: <>JSON-string or keys (like <code>ocean</code> object) mapping Big Five traits containing <code>openness</code>, <code>conscientiousness</code>, etc.</>
  },
  {
    field: "reqId",
    type: "string",
    presence: "Optional",
    description: "Unique tracking key for task correlation, logs, and streaming updates. Form field, query, or header."
  }
];

const isolatedRagParams: ParamInfo[] = [
  {
    field: "isolatedRAG",
    type: "boolean",
    presence: "Optional",
    description: "If true, queries will retrieve context ONLY from this session's isolated vector database tied to the specific reqId."
  },
  {
    field: "ocean",
    type: "object",
    presence: "Optional",
    description: <>Object containing values (0-100) for <code>openness</code>, <code>conscientiousness</code>, <code>extraversion</code>, <code>agreeableness</code>, <code>neuroticism</code> to mold response personality traits. Alternatively, these keys can be supplied flat on the parent object.</>
  }
];

const injectRagParams: ParamInfo[] = [
  {
    field: "isolatedRAG",
    type: "boolean",
    presence: "Required",
    description: "Set to true to inject this background history/story into the isolated session tied to the specific reqId."
  },
  {
    field: "text",
    type: "string",
    presence: "Required",
    description: "The history text, lore, or memories to embed and inject."
  },
  {
    field: "metadata",
    type: "object",
    presence: "Optional",
    description: "Optional key-value pairs representing custom metadata."
  }
];

const directorParams: ParamInfo[] = [
  {
    field: "prompt",
    type: "string",
    presence: "Required",
    description: "The user query representing overall system instructions (e.g. generate music)."
  },
  {
    field: "reqId",
    type: "string",
    presence: "Optional",
    description: "Unique tracking key for task correlation, logs, and streaming updates. Body, query, or header."
  }
];

const imageParams: ParamInfo[] = [
  {
    field: "prompt",
    type: "string",
    presence: "Required",
    description: "Description of image layout and artistic requirements."
  },
  {
    field: "model",
    type: "object",
    presence: "Optional",
    description: <>Optional config object containing <code>id</code> and <code>qtype</code>.</>
  },
  {
    field: "reqId",
    type: "string",
    presence: "Optional",
    description: "Unique tracking key for task correlation, logs, and streaming updates. Body, query, or header."
  }
];

const musicParams: ParamInfo[] = [
  {
    field: "prompt",
    type: "string",
    presence: "Required",
    description: "Acoustic criteria (genre, feeling, speed, instruments)."
  },
  {
    field: "model",
    type: "object",
    presence: "Optional",
    description: <>Optional config object containing <code>id</code>, <code>qtype</code>, and <code>maxTokens</code>.</>
  },
  {
    field: "reqId",
    type: "string",
    presence: "Optional",
    description: "Unique tracking key for task correlation, logs, and streaming updates. Body, query, or header."
  }
];

const sttParams: ParamInfo[] = [
  {
    field: "audio",
    type: "File (Binary)",
    presence: "Required",
    description: "Binary voice recording file format (e.g. wav/mp3)."
  },
  {
    field: "reqId",
    type: "string",
    presence: "Optional",
    description: "Unique tracking key for task correlation, logs, and streaming updates. Form field, query, or header."
  }
];

const ttsParams: ParamInfo[] = [
  {
    field: "text",
    type: "string",
    presence: "Required",
    description: "The textual message content to read."
  },
  {
    field: "voiceID",
    type: "string",
    presence: "Optional",
    description: "The specific Kokoro voice ID to use. Default is 'af_heart'."
  },
  {
    field: "format",
    type: "string",
    presence: "Optional",
    description: "The desired output format. Set to 'wav' to receive a raw WAV file instead of JSON."
  },
  {
    field: "reqId",
    type: "string",
    presence: "Optional",
    description: "Unique tracking key for task correlation, logs, and streaming updates. Body, query, or header."
  }
];

const healthParams: ParamInfo[] = [
  {
    field: "Origin / Referer",
    type: "string",
    presence: "Implicit",
    description: "Automatically supplied by browser to allow hostname validation and access checks."
  },
  {
    field: "reqId",
    type: "string",
    presence: "Optional",
    description: "Unique tracking key for health correlation. Supported as query parameter or header."
  }
];

const liveParams: ParamInfo[] = [
  {
    field: "audio",
    type: "string (Base64)",
    presence: "Required",
    description: "Base64 encoded audio string for Speech-to-Text (conditionally required if text is not provided)."
  },
  {
    field: "text",
    type: "string",
    presence: "Required",
    description: "Raw text query (conditionally required if audio is not provided)."
  },
  {
    field: "systemPrompt",
    type: "string",
    presence: "Optional",
    description: "Optional system prompt/persona guidance for text generation."
  },
  {
    field: "voiceId",
    type: "string",
    presence: "Optional",
    description: <>Voice ID for the TTS model (e.g. <code>af_heart</code>).</>
  },
  {
    field: "modelId",
    type: "string",
    presence: "Optional",
    description: "Optional text generation model ID."
  },
  {
    field: "isolatedRAG",
    type: "boolean",
    presence: "Optional",
    description: "If true, queries will retrieve context ONLY from this session's isolated RAG storage tied to the specific reqId."
  },
  {
    field: "reqId",
    type: "string",
    presence: "Optional",
    description: "Unique tracking key for task correlation, logs, and session-history persistence."
  }
];

interface ApiGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiGuideModal({ isOpen, onClose }: ApiGuideModalProps) {
  const PORT = window.location.port || "9777";
  const [activeTab, setActiveTab] = useState<"api" | "websocket">("api");

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
                  <DialogTitle className="text-2xl font-mono font-bold tracking-tight uppercase">Omnix Developer Guide</DialogTitle>
                  <DialogDescription className="text-zinc-500 font-mono text-xs uppercase tracking-widest mt-1">
                    Headless Inference Engine • Localhost Access
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex bg-zinc-950 border border-zinc-800 rounded-md p-1">
                <button
                  onClick={() => setActiveTab("api")}
                  className={`px-4 py-1.5 text-xs font-mono rounded ${activeTab === "api" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"}`}
                >
                  REST API
                </button>
                <button
                  onClick={() => setActiveTab("websocket")}
                  className={`px-4 py-1.5 text-xs font-mono rounded ${activeTab === "websocket" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"}`}
                >
                  WebSocket
                </button>
              </div>
              {activeTab === "api" && (
                <div className="p-2 bg-zinc-950/50 border border-zinc-800 rounded-md font-mono text-xs flex items-center gap-2">
                  <span className="text-zinc-500">BASE URL:</span>
                  <code className="text-orange-500 select-all">http://localhost:{PORT}/api</code>
                </div>
              )}
              {activeTab === "websocket" && (
                <div className="p-2 bg-zinc-950/50 border border-zinc-800 rounded-md font-mono text-xs flex items-center gap-2">
                  <span className="text-zinc-500">WS URL:</span>
                  <code className="text-blue-500 select-all">ws://localhost:{PORT}/ws</code>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Local Nav */}
            <div className="w-56 border-r border-zinc-800 bg-zinc-900/20 hidden md:block">
              <ScrollArea className="h-full p-4">
                <nav className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter mb-4">{activeTab === "api" ? "Endpoints" : "WebSocket Docs"}</p>
                  {activeTab === "api" ? ['List Models', 'Text', 'Vision', 'Isolated RAG', 'Director', 'Image', 'Music', 'STT', 'TTS', 'Health Check', 'Domain Integration'].map(item => (
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
                  )) : ['Connection', 'Streaming', 'Event Types', 'Live API'].map(item => (
                    <button 
                      key={item}
                      onClick={() => {
                        const sectionId = `ws-guide-${item.toLowerCase().replace(/\s+/g, "-")}`;
                        const el = document.getElementById(sectionId);
                        if (el) {
                          el.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-mono text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded transition-colors flex items-center justify-between group"
                    >
                      <span>{item}</span>
                      <span className="text-[10px] text-zinc-600 group-hover:text-blue-500 font-mono">→</span>
                    </button>
                  ))}
                </nav>
              </ScrollArea>
            </div>

            <ScrollArea className="flex-1 p-6 lg:p-10">
              <div className="max-w-5xl lg:max-w-6xl mx-auto space-y-16 pb-20">
                
                {activeTab === "api" && (
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
                    Verify status, availability, and permissions. If a cross-origin external page invokes this endpoint and is authorized via 
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
                  </>
                )}

                {activeTab === "websocket" && (
                  <>
                    <section id="ws-guide-connection" className="space-y-6 scroll-mt-6">
                      <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <Globe className="w-4 h-4 text-blue-500" />
                          </div>
                          <h3 className="text-lg font-mono font-bold uppercase tracking-tight">Connection</h3>
                        </div>
                        <code className="px-2 py-1 bg-zinc-900 text-blue-400 border border-zinc-800 rounded text-[10px]">ws://localhost:{PORT}/ws</code>
                      </div>
                      <p className="text-sm text-zinc-400 leading-relaxed">
                        Connect to the Omnix WebSocket server for real-time bi-directional streaming of text generation, images, and audio. Send JSON commands and receive streaming events.
                      </p>
                      
                      <div className="space-y-3">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 font-mono">Connecting in JavaScript</span>
                        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] overflow-x-auto">
                          <pre className="text-blue-300">
{`const ws = new WebSocket("ws://localhost:${PORT}/ws");

ws.onopen = () => {
  console.log("Connected to Omnix WS");
};`}
                          </pre>
                        </div>
                      </div>
                    </section>

                    <section id="ws-guide-streaming" className="space-y-6 scroll-mt-6">
                      <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                            <Activity className="w-4 h-4 text-teal-500" />
                          </div>
                          <h3 className="text-lg font-mono font-bold uppercase tracking-tight">Streaming Generation</h3>
                        </div>
                      </div>
                      <p className="text-sm text-zinc-400 leading-relaxed">
                        To stream responses, emit an event containing your target endpoint and payload. The server will stream token chunks back as they are generated.
                      </p>
                      
                      <div className="space-y-3">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 font-mono">Example: Requesting a Stream</span>
                        <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] overflow-x-auto">
                          <pre className="text-teal-300">
{`// 1. Send the request
ws.send(JSON.stringify({
  type: "text_generation",
  payload: {
    prompt: "Write a short poem about stars",
    reqId: "my-unique-req-123"
  }
}));

// 2. Listen for streamed chunks
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === "stream_chunk") {
    // Process text stream
    process.stdout.write(data.chunk);
  }
  
  if (data.type === "stream_complete") {
    console.log("\\n--- Generation Finished ---");
  }
};`}
                          </pre>
                        </div>
                      </div>
                    </section>

                    <section id="ws-guide-event-types" className="space-y-6 scroll-mt-6">
                      <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                            <Code2 className="w-4 h-4 text-purple-500" />
                          </div>
                          <h3 className="text-lg font-mono font-bold uppercase tracking-tight">Event Types</h3>
                        </div>
                      </div>
                      <p className="text-sm text-zinc-400 leading-relaxed">
                        These are the common events returned by the WebSocket server during streaming and execution.
                      </p>
                      
                      <div className="space-y-3">
                        <div className="bg-zinc-950/70 border border-zinc-900 rounded-lg p-4 font-mono text-[11px] w-full divide-y divide-zinc-800/45">
                          <div className="grid grid-cols-12 gap-4 pb-2 text-[9px] font-bold text-zinc-600 tracking-wider uppercase">
                            <div className="col-span-3">Event Type</div>
                            <div className="col-span-9">Payload Description</div>
                          </div>
                          <div className="grid grid-cols-12 gap-4 py-2 hover:bg-zinc-900/10">
                            <div className="col-span-3 text-orange-500">stream_chunk</div>
                            <div className="col-span-9 text-zinc-500">Contains the <code>reqId</code> and <code>chunk</code> text for real-time text output.</div>
                          </div>
                          <div className="grid grid-cols-12 gap-4 py-2 hover:bg-zinc-900/10">
                            <div className="col-span-3 text-orange-500">think_chunk</div>
                            <div className="col-span-9 text-zinc-500">Contains <code>reqId</code> and <code>chunk</code> text for the model's internal reasoning process.</div>
                          </div>
                          <div className="grid grid-cols-12 gap-4 py-2 hover:bg-zinc-900/10">
                            <div className="col-span-3 text-orange-500">stream_complete</div>
                            <div className="col-span-9 text-zinc-500">Fired when the generation for a specific <code>reqId</code> finishes.</div>
                          </div>
                          <div className="grid grid-cols-12 gap-4 py-2 hover:bg-zinc-900/10">
                            <div className="col-span-3 text-orange-500">error</div>
                            <div className="col-span-9 text-zinc-500">Contains an <code>error</code> message string if execution fails.</div>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section id="ws-guide-live-api" className="space-y-6 scroll-mt-6">
                      <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-red-500/10 flex items-center justify-center border border-red-500/20">
                            <Mic className="w-4 h-4 text-red-500" />
                          </div>
                          <h3 className="text-lg font-mono font-bold uppercase tracking-tight">Live API (Voice Pipeline)</h3>
                        </div>
                        <code className="px-2 py-1 bg-zinc-900 text-red-400 border border-zinc-800 rounded text-[10px]">ws://localhost:{PORT}/api/live</code>
                      </div>
                      <p className="text-sm text-zinc-400 leading-relaxed">
                        The Live API provides a single WebSocket endpoint to handle the entire STT -&gt; Text Generation -&gt; TTS pipeline. You can send audio or text, and it will return the processed text and synthesized speech audio back.
                      </p>
                      
                      <div className="space-y-3">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 font-mono">Input Payload (JSON)</span>
                        <ParameterSchemaTable parameters={liveParams} borderType="accent" />
                      </div>

                      <div className="space-y-3">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 font-mono">Response Events</span>
                        <div className="bg-zinc-950/70 border border-zinc-900 rounded-lg p-4 font-mono text-[11px] w-full divide-y divide-zinc-800/45">
                          <div className="grid grid-cols-12 gap-4 py-2">
                            <div className="col-span-3 text-orange-500">status</div>
                            <div className="col-span-9 text-zinc-500">Contains the current pipeline status (e.g. <code>processing-stt</code>, <code>processing-text</code>, <code>processing-tts</code>, <code>idle</code>).</div>
                          </div>
                          <div className="grid grid-cols-12 gap-4 py-2">
                            <div className="col-span-3 text-orange-500">stt-result</div>
                            <div className="col-span-9 text-zinc-500">Returns the transcribed <code>text</code> if audio was provided.</div>
                          </div>
                          <div className="grid grid-cols-12 gap-4 py-2">
                            <div className="col-span-3 text-orange-500">text-result</div>
                            <div className="col-span-9 text-zinc-500">Returns the generated assistant <code>text</code> response.</div>
                          </div>
                          <div className="grid grid-cols-12 gap-4 py-2">
                            <div className="col-span-3 text-orange-500">tts-result</div>
                            <div className="col-span-9 text-zinc-500">Returns the generated speech <code>audio</code> as an array of samples.</div>
                          </div>
                        </div>
                      </div>
                    </section>
                  </>
                )}

              </div>
            </ScrollArea>
          </div>
          
          {/* Footer Info */}
          <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950 text-[10px] font-mono text-zinc-500 flex justify-between items-center">
            <span>OMNIX ENGINE v0.5.0 • HEADLESS_STABLE</span>
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
