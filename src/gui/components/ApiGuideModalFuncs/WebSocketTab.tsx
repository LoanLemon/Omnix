import React from "react";
import { Globe, Activity, Code2, Mic } from "lucide-react";
import { ParameterSchemaTable } from "./ParameterSchemaTable";
import { liveParams } from "./types";

interface WebSocketTabProps {
  PORT: string;
}

export function WebSocketTab({ PORT }: WebSocketTabProps) {
  return (
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
        <p className="text-sm text-zinc-400 leading-relaxed font-sans">
          The Live API provides a high-performance WebSocket voice pipeline coordinating speech transcribing, natural language processing, and speech synthesis. Input payloads are safely queued and dispatched in sequential order.
        </p>

        <div className="bg-zinc-950/60 border border-zinc-900 rounded-lg p-4 space-y-3 font-sans text-xs text-zinc-400">
          <div className="font-mono text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Internal Processing Workflow</div>
          <ol className="list-decimal list-inside space-y-1 text-zinc-400 font-mono text-[11px]">
            <li><span className="text-zinc-300 font-sans font-semibold">Queueing Stage:</span> Incoming payloads are added to the LiveWS queue to prevent concurrent engine congestion or model thrashing.</li>
            <li><span className="text-zinc-300 font-sans font-semibold">Speech-To-Text (STT):</span> If audio payload is provided, the engine transcribes it first into raw text.</li>
            <li><span className="text-zinc-300 font-sans font-semibold">Text Generation:</span> Transcribed text (or direct text input) is processed by the selected Text model to generate the AI response.</li>
            <li><span className="text-zinc-300 font-sans font-semibold">Reasoning Clean-up:</span> Any internal model thinking blocks wrapped in <code className="text-red-400">&lt;think&gt;...&lt;/think&gt;</code> tags are automatically stripped from the generated text prior to synthesis.</li>
            <li><span className="text-zinc-300 font-sans font-semibold">Robust TTS Chunking:</span> The clean text response is chunked intelligently based on natural pause punctuation (commas, semicolons, colons, and long dashes) with a strict fallback limit of 10 words per chunk to guarantee smooth real-time speech generation without VRAM crashes or stalls.</li>
          </ol>
        </div>

        <div className="space-y-3">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 font-mono">Input Payload (JSON)</span>
          <ParameterSchemaTable parameters={liveParams} borderType="accent" />
        </div>

        <div className="space-y-3">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 font-mono">Response Events</span>
          <div className="bg-zinc-950/70 border border-zinc-900 rounded-lg p-4 font-mono text-[11px] w-full divide-y divide-zinc-800/45">
            <div className="grid grid-cols-12 gap-4 py-2">
              <div className="col-span-3 text-orange-500">status</div>
              <div className="col-span-9 text-zinc-500">Contains the current pipeline status (e.g. <code>queued</code>, <code>processing-stt</code>, <code>processing-text</code>, <code>processing-tts</code>, <code>idle</code>).</div>
            </div>
            <div className="grid grid-cols-12 gap-4 py-2">
              <div className="col-span-3 text-orange-500">stt-result</div>
              <div className="col-span-9 text-zinc-500">Returns the transcribed <code>text</code> if audio was provided.</div>
            </div>
            <div className="grid grid-cols-12 gap-4 py-2">
              <div className="col-span-3 text-orange-500">text-result</div>
              <div className="col-span-9 text-zinc-500">Returns the generated assistant <code>text</code> response (with thinking tags automatically stripped).</div>
            </div>
            <div className="grid grid-cols-12 gap-4 py-2">
              <div className="col-span-3 text-orange-500">tts-result</div>
              <div className="col-span-9 text-zinc-500">Returns synthesized speech <code>audio</code> chunk samples sequentially as they complete generation.</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
