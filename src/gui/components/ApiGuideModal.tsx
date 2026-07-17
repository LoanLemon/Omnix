import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Globe } from "lucide-react";
import { RestApiTab } from "./ApiGuideModalFuncs/RestApiTab";
import { WebSocketTab } from "./ApiGuideModalFuncs/WebSocketTab";
import { LogWatcherTab } from "./ApiGuideModalFuncs/LogWatcherTab";

interface ApiGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiGuideModal({ isOpen, onClose }: ApiGuideModalProps) {
  const isElectron = typeof window !== "undefined" && !!(window as any).electron;
  const PORT = isElectron && (window as any).electron?.server?.getPort ? (window as any).electron.server.getPort() : (window.location.port || "9777");
  const [activeTab, setActiveTab] = useState<"api" | "websocket" | "logwatcher">("api");

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
                <button
                  onClick={() => setActiveTab("logwatcher")}
                  className={`px-4 py-1.5 text-xs font-mono rounded ${activeTab === "logwatcher" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-zinc-200"}`}
                >
                  Log Watcher
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
              {activeTab === "logwatcher" && (
                <div className="p-2 bg-zinc-950/50 border border-zinc-800 rounded-md font-mono text-xs flex items-center gap-2">
                  <span className="text-zinc-500">CONFIG URL:</span>
                  <code className="text-emerald-500 select-all">http://localhost:{PORT}/api/log-watcher/config</code>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Local Nav */}
            <div className="w-56 border-r border-zinc-800 bg-zinc-900/20 hidden md:block">
              <ScrollArea className="h-full p-4">
                <nav className="space-y-1">
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter mb-4">
                    {activeTab === "api" ? "Endpoints" : activeTab === "websocket" ? "WebSocket Docs" : "Log Watcher Docs"}
                  </p>
                  {activeTab === "api"
                    ? [
                        "List Models",
                        "Text",
                        "Vision",
                        "Isolated RAG",
                        "Director",
                        "Image",
                        "Music",
                        "STT",
                        "TTS",
                        "Wait Voice",
                        "Auto STT TTS",
                        "Health Check",
                        "Domain Integration"
                      ].map((item) => (
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
                      ))
                    : activeTab === "websocket"
                    ? ["Connection", "Streaming", "Event Types", "Live API"].map((item) => (
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
                      ))
                    : ["Overview", "Syntax Format", "Variables & Injections", "API Config Details"].map((item) => (
                        <button
                          key={item}
                          onClick={() => {
                            const sectionId = `log-watcher-${item.toLowerCase().replace(/\s+/g, "-")}`;
                            const el = document.getElementById(sectionId);
                            if (el) {
                              el.scrollIntoView({ behavior: "smooth", block: "start" });
                            }
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-mono text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded transition-colors flex items-center justify-between group"
                        >
                          <span>{item}</span>
                          <span className="text-[10px] text-zinc-600 group-hover:text-emerald-500 font-mono">→</span>
                        </button>
                      ))}
                </nav>
              </ScrollArea>
            </div>

            <ScrollArea className="flex-1 p-6 lg:p-10">
              <div className="max-w-5xl lg:max-w-6xl mx-auto space-y-16 pb-20">
                {activeTab === "api" ? (
                  <RestApiTab PORT={PORT} />
                ) : activeTab === "websocket" ? (
                  <WebSocketTab PORT={PORT} />
                ) : (
                  <LogWatcherTab />
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Footer Info */}
          <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950 text-[10px] font-mono text-zinc-500 flex justify-between items-center">
            <span>OMNIX ENGINE v0.9.0 • HEADLESS_STABLE</span>
            <div className="flex gap-4">
              <span className="flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-emerald-500" /> API READY
              </span>
              <span className="flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-blue-500" /> WS_SESSION: {PORT}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
