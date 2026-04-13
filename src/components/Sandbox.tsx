import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw, Terminal, FileCode, Eye, Code2 } from "lucide-react";
import { SandboxFile } from "../App/types";
import { useApp } from "../App/context/AppContext";

interface SandboxProps {
  files: SandboxFile[];
}

export function Sandbox({ files }: SandboxProps) {
  const [output, setOutput] = useState<string[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const activeFile = files[activeFileIndex] || files[0];

  const runCode = () => {
    if (!iframeRef.current || files.length === 0) return;
    setOutput([]);

    const entryFile = files.find(f => f.name === "index.html") || 
                      files.find(f => f.name.startsWith("index.")) || 
                      files[0];

    const isHtml = entryFile.language === 'html';
    
    let srcDoc = "";
    if (isHtml) {
      srcDoc = entryFile.content;
      const logScript = `
        <script>
          const originalLog = console.log;
          console.log = (...args) => {
            window.parent.postMessage({ type: 'sandbox-log', data: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }, '*');
            originalLog(...args);
          };
          window.onerror = (msg, url, line, col, error) => {
            window.parent.postMessage({ type: 'sandbox-error', data: msg }, '*');
            return false;
          };
        </script>
      `;
      srcDoc = srcDoc.replace('<head>', `<head>${logScript}`);
      if (!srcDoc.includes('<head>')) srcDoc = logScript + srcDoc;
    } else {
      srcDoc = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: sans-serif; color: #e4e4e7; background: #09090b; margin: 0; padding: 1rem; }
              pre { white-space: pre-wrap; word-break: break-all; }
            </style>
          </head>
          <body>
            <div id="root"></div>
            <script>
              const originalLog = console.log;
              console.log = (...args) => {
                window.parent.postMessage({ type: 'sandbox-log', data: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }, '*');
                originalLog(...args);
              };
              window.onerror = (msg, url, line, col, error) => {
                window.parent.postMessage({ type: 'sandbox-error', data: msg }, '*');
                return false;
              };
              try {
                ${entryFile.content}
              } catch (e) {
                window.parent.postMessage({ type: 'sandbox-error', data: e.message }, '*');
              }
            </script>
          </body>
        </html>
      `;
    }

    iframeRef.current.srcdoc = srcDoc;
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'sandbox-log') {
        setOutput(prev => [...prev, event.data.data]);
      } else if (event.data.type === 'sandbox-error') {
        setOutput(prev => [...prev, `Error: ${event.data.data}`]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (files.length > 0) runCode();
  }, [files]);

  return (
    <Card className="bg-zinc-900 border-zinc-800 overflow-hidden flex flex-col h-full shadow-2xl">
      <CardHeader className="py-2 px-4 border-b border-zinc-800 flex flex-row items-center justify-between bg-zinc-950">
        <div className="flex items-center gap-4">
          <CardTitle className="text-xs font-mono flex items-center gap-2">
            <Terminal className="w-3 h-3 text-orange-500" />
            Sandbox
          </CardTitle>
          <div className="flex bg-zinc-900 rounded-md p-0.5 border border-zinc-800">
            <Button 
              variant={viewMode === "preview" ? "secondary" : "ghost"} 
              size="sm" 
              className="h-6 px-2 text-[10px] gap-1.5"
              onClick={() => setViewMode("preview")}
            >
              <Eye className="w-3 h-3" />
              Preview
            </Button>
            <Button 
              variant={viewMode === "code" ? "secondary" : "ghost"} 
              size="sm" 
              className="h-6 px-2 text-[10px] gap-1.5"
              onClick={() => setViewMode("code")}
            >
              <Code2 className="w-3 h-3" />
              Code
            </Button>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={runCode} title="Run Code">
            <Play className="w-3 h-3 text-green-500" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => iframeRef.current && (iframeRef.current.srcdoc = '')} title="Reset">
            <RotateCcw className="w-3 h-3 text-zinc-500" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex overflow-hidden">
        {/* File Viewer Sidebar */}
        <div className="w-48 border-r border-zinc-800 bg-zinc-950/80 flex flex-col shrink-0">
          <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">
              Explorer
            </span>
            <FileCode className="w-3 h-3 text-zinc-600" />
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {files.map((file, idx) => (
              <button
                key={idx}
                onClick={() => setActiveFileIndex(idx)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[11px] font-mono transition-all duration-200 ${
                  activeFileIndex === idx 
                    ? "bg-zinc-800 text-orange-400 shadow-inner" 
                    : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
                }`}
              >
                <FileCode className={`w-3.5 h-3.5 shrink-0 ${activeFileIndex === idx ? "text-orange-500" : "text-zinc-600"}`} />
                <span className="truncate">{file.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-black/20">
          {viewMode === "preview" ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 bg-white relative">
                <iframe
                  ref={iframeRef}
                  className="w-full h-full border-none"
                  title="Sandbox Preview"
                  sandbox="allow-scripts"
                />
              </div>
              {output.length > 0 && (
                <div className="h-40 bg-zinc-950 border-t border-zinc-800 p-2 font-mono text-[10px] overflow-y-auto">
                  <div className="flex items-center gap-2 mb-2 text-zinc-500 border-b border-zinc-900 pb-1">
                    <Terminal className="w-3 h-3" />
                    <span className="uppercase tracking-tighter">Console Output</span>
                  </div>
                  {output.map((line, i) => (
                    <div key={i} className="text-zinc-400 border-b border-zinc-900/30 py-0.5">
                      <span className="text-zinc-600 mr-2">[{i+1}]</span>
                      {line}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-2 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
                <span className="text-[10px] font-mono text-zinc-400">{activeFile?.name}</span>
                <span className="text-[9px] text-zinc-600 uppercase tracking-widest">{activeFile?.language}</span>
              </div>
              <div className="flex-1 overflow-auto p-4 font-mono text-xs text-zinc-300 bg-zinc-950/30">
                <pre className="whitespace-pre-wrap break-all">
                  {activeFile?.content || "// No content"}
                </pre>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

