import React from "react";
import { Eye, FileText, Code, Settings, Terminal, Zap, ArrowRight } from "lucide-react";
import { ParameterSchemaTable } from "./ParameterSchemaTable";
import { ParamInfo } from "./types";

const logWatcherParams: ParamInfo[] = [
  {
    field: "filepaths",
    type: "string[]",
    presence: "Required",
    description: "An array of absolute file paths to the log files that the background daemon should poll and monitor."
  },
  {
    field: "enabled",
    type: "boolean",
    presence: "Required",
    description: "Master switch to enable or disable the background log watcher polling daemon."
  }
];

export function LogWatcherTab() {
  return (
    <div className="space-y-16">
      {/* Overview */}
      <section id="log-watcher-overview" className="space-y-6 scroll-mt-6">
        <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
              <Eye className="w-4 h-4 text-orange-500 animate-pulse" />
            </div>
            <h3 className="text-lg font-mono font-bold uppercase tracking-tight">Log Watcher Overview</h3>
          </div>
          <span className="px-2 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded text-[10px] font-mono font-bold uppercase tracking-widest">
            Daemon Active
          </span>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">
          The <strong>Omnix Log Watcher</strong> is an integrated background daemon designed for seamless headless integrations. It polls configured log files (e.g. game logs, system event files, or custom buffers) every 1.5 seconds. When the daemon detects new lines being appended, it automatically parses them, dispatches requests to local API endpoints, and writes the response payload back to your specified target files.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-zinc-900/40 border border-zinc-800/60 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-zinc-300">
              <Terminal className="w-4 h-4 text-orange-500" />
              <span className="font-mono text-xs font-bold uppercase">Non-Intrusive Polling</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Monitors file size changes and processes updates differentially, ensuring extremely low CPU and disk I/O usage.
            </p>
          </div>
          <div className="p-4 bg-zinc-900/40 border border-zinc-800/60 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-zinc-300">
              <Code className="w-4 h-4 text-orange-500" />
              <span className="font-mono text-xs font-bold uppercase">Smart Script Injection</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Detects if response targets are JS/TS files, updating or injecting the <code className="text-zinc-300">let OmnixResponse</code> variable instead of overwriting the script.
            </p>
          </div>
          <div className="p-4 bg-zinc-900/40 border border-zinc-800/60 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-zinc-300">
              <Zap className="w-4 h-4 text-orange-500" />
              <span className="font-mono text-xs font-bold uppercase">Robust Pre-Cleaning</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Cleans common log prefixes, stripping out timestamps, categories, process names, and surrounding quotes seamlessly.
            </p>
          </div>
        </div>
      </section>

      {/* Syntax Format */}
      <section id="log-watcher-syntax-format" className="space-y-6 scroll-mt-6">
        <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-zinc-500/10 flex items-center justify-center border border-zinc-500/20">
              <FileText className="w-4 h-4 text-zinc-400" />
            </div>
            <h3 className="text-lg font-mono font-bold uppercase tracking-tight">Syntax Format & Parsing</h3>
          </div>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">
          The parser identifies commands based on the trigger <code className="text-zinc-300">OmnixLogAPI:</code>. A single command block comprises of the endpoint declaration, an optional JSON Payload block, and an optional custom response file redirection.
        </p>

        {/* Syntax Spec */}
        <div className="space-y-4">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 font-mono">Standard Block Syntax</span>
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-5 font-mono text-[11px] leading-relaxed max-w-3xl">
            <div className="text-zinc-500 mb-2">// Declaration line (prefix is automatically stripped out by parser)</div>
            <div>
              <span className="text-orange-500 font-bold">15:43:00 [INFO] ["GTaiO01"] "</span>
              <span className="text-emerald-400 font-bold"># OmnixLogAPI:/api/health</span>
              <span className="text-orange-500 font-bold">"</span>
            </div>
            <div className="text-zinc-500 my-2">// Payload: (Followed by raw JSON string on one or multiple lines)</div>
            <div>
              <span className="text-orange-500">Payload:</span>{" "}
              <span className="text-zinc-300">{"{"}</span>
            </div>
            <div className="pl-4 text-zinc-300">
              "prompt": "Scan for nearest civilian...",
              <br />
              "maxTokens": 128
            </div>
            <div>
              <span className="text-zinc-300">{"}"}</span>
            </div>
            <div className="text-zinc-500 my-2">// Passthru: (Optional state management payload passed untouched into JS variables)</div>
            <div>
              <span className="text-orange-500">Passthru:</span>{" "}
              <span className="text-yellow-400">{"{\"state\":0, \"targetModelId\":0}"}</span>
            </div>
            <div className="text-zinc-500 my-2">// Response: (Defines the custom output file target, otherwise original_log_file_omnixResponse.txt is used)</div>
            <div>
              <span className="text-orange-500">Response:</span>{" "}
              <span className="text-yellow-400">CLEO/GTaiOmnix_Civilian.js</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 font-mono">Parser Features</span>
          <ul className="space-y-2 text-xs text-zinc-400 pl-4 list-disc leading-relaxed">
            <li>
              <strong>Prefix Tolerance:</strong> Handles and strips timestamp prefixes like <code className="text-zinc-300">15:43:00 [INFO] ["GTaiO01"]</code> or generic brackets.
            </li>
            <li>
              <strong>Quote Stripping:</strong> Automatically strips surrounding quotes added by typical mod logging wrappers (e.g. converting <code className="text-zinc-300">"OmnixLogAPI:..."</code> to clean content).
            </li>
            <li>
              <strong>Passthru Preservation:</strong> If a <code className="text-zinc-300">Passthru:</code> line is supplied, it is automatically unescaped (if needed) and injected as <code className="text-zinc-300">let OmnixPassthru = "...";</code> into target JS/TS files to retain client-side states.
            </li>
            <li>
              <strong>State Clearing (RESET Command):</strong> To purge cached responses, you can log <code className="text-zinc-300"># OmnixLogAPI:RESET</code> with a <code className="text-zinc-300">Response: [file].js</code>. The watcher will intercept this command and purge the value inside <code className="text-zinc-300">OmnixResponse</code> in that script.
            </li>
            <li>
              <strong>Path Resolution:</strong> Custom <code className="text-zinc-300">Response:</code> paths are relative to the folder containing the watched log file. If absolute, they write directly to that location.
            </li>
          </ul>
        </div>
      </section>

      {/* Variables & Injections */}
      <section id="log-watcher-variables-&-injections" className="space-y-6 scroll-mt-6">
        <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
              <Code className="w-4 h-4 text-yellow-500" />
            </div>
            <h3 className="text-lg font-mono font-bold uppercase tracking-tight">Variables & Injections (JS/TS Files)</h3>
          </div>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">
          When the targeted <code className="text-zinc-300">Response:</code> file ends with a JavaScript (<code className="text-zinc-300">.js</code>) or TypeScript (<code className="text-zinc-300">.ts</code>) extension, Omnix processes the response with variable-level injection logic instead of overwriting the entire file. This is crucial for environments like <strong>CLEO Redux (GTA San Andreas)</strong> or custom Eclipse script injectors.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 font-mono">Case A: Variable Already Exists</span>
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg font-mono text-[11px] leading-relaxed space-y-4">
              <div>
                <div className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-2">Original File Contents (CLEO script):</div>
                <pre className="text-zinc-400">
{`let OmnixResponse = "stale state";
showSubtitle("Engaging civilian...");`}
                </pre>
              </div>
              <div className="flex items-center gap-2 text-zinc-500 justify-center">
                <span>Processing Injection</span>
                <ArrowRight className="w-4 h-4 text-orange-500 animate-pulse" />
              </div>
              <div>
                <div className="text-emerald-500 text-[10px] uppercase font-bold tracking-wider mb-2">Injected Result (Safely Updated):</div>
                <pre className="text-zinc-300">
{`let OmnixResponse = "{\\"status\\":\\"ok\\",\\"pid\\":12345}";
showSubtitle("Engaging civilian...");`}
                </pre>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 font-mono">Case B: Variable Does Not Exist</span>
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg font-mono text-[11px] leading-relaxed space-y-4">
              <div>
                <div className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-2">Original File Contents:</div>
                <pre className="text-zinc-400">
{`showSubtitle("Awaiting incoming mission details...");`}
                </pre>
              </div>
              <div className="flex items-center gap-2 text-zinc-500 justify-center">
                <span>Processing Injection</span>
                <ArrowRight className="w-4 h-4 text-orange-500 animate-pulse" />
              </div>
              <div>
                <div className="text-emerald-500 text-[10px] uppercase font-bold tracking-wider mb-2">Injected Result (Prepended to Top):</div>
                <pre className="text-zinc-300">
{`let OmnixResponse = "{\\"status\\":\\"ok\\",\\"pid\\":12345}";
showSubtitle("Awaiting incoming mission details...");`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* API Configuration Details */}
      <section id="log-watcher-api-config-details" className="space-y-6 scroll-mt-6">
        <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-zinc-800/50 flex items-center justify-center border border-zinc-800/50">
              <Settings className="w-4 h-4 text-zinc-400" />
            </div>
            <h3 className="text-lg font-mono font-bold uppercase tracking-tight">API Configuration Details</h3>
          </div>
          <code className="px-2 py-1 bg-zinc-900 text-blue-400 border border-zinc-800 rounded text-[10px]">GET/POST /api/log-watcher/config</code>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">
          While the Sidebar interface provides a convenient visual panel to add files and toggle the watcher, you can also inspect or update the configuration programmatically via local REST endpoints.
        </p>

        {/* Schema */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1 font-mono">Config Schema & Payload</span>
          <ParameterSchemaTable parameters={logWatcherParams} borderType="normal" />
        </div>

        {/* Config endpoints JSON example */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider pl-1">GET Response JSON</span>
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] h-32 overflow-y-auto w-full">
              <pre className="text-emerald-500">
{`{
  "filepaths": [
    "C:\\\\Program Files\\\\Rockstar Games\\\\GTA San Andreas\\\\cleo_redux.log"
  ],
  "enabled": true
}`}
              </pre>
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider pl-1">POST Request Body</span>
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] h-32 overflow-y-auto w-full">
              <pre className="text-zinc-300">
{`{
  "filepaths": [
    "C:\\\\Program Files\\\\Rockstar Games\\\\GTA San Andreas\\\\cleo_redux.log"
  ],
  "enabled": true
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
