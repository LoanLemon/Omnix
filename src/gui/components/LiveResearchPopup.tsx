/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useApp } from "@/context/AppContext";
import { Loader2, Search, CheckCircle2, ChevronDown, ChevronUp, Globe } from "lucide-react";
import { useState } from "react";

export function LiveResearchPopup() {
  const { activeResearch, liveResearchEnabled } = useApp();
  const [isMinimized, setIsMinimized] = useState(false);

  if (!liveResearchEnabled || !activeResearch) {
    return null;
  }

  const { query, status, results, currentDeepDiveIndex, currentDeepDiveUrl } = activeResearch;

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-zinc-950/95 border border-blue-500/30 rounded-lg shadow-2xl z-50 overflow-hidden backdrop-blur-md flex flex-col transition-all duration-300 max-h-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-blue-950/20 border-b border-blue-500/20 shrink-0 select-none">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Globe className="w-4 h-4 text-blue-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold tracking-wider text-blue-400 uppercase">
            LIVE DEEP RESEARCH
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded transition-all cursor-pointer"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`p-4 space-y-4 flex-1 flex flex-col overflow-y-auto ${isMinimized ? 'hidden' : 'block'}`}>
        {/* Status Tracker */}
        <div className="space-y-1.5 shrink-0">
          <div className="flex justify-between items-center text-[10px] font-mono">
            <span className="text-muted-foreground uppercase">CURRENT QUERY</span>
            <span className="text-blue-400 px-1.5 py-0.5 bg-blue-500/10 rounded-sm font-semibold truncate max-w-[180px]">
              "{query}"
            </span>
          </div>
          <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-sm flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin shrink-0" />
              <span className="text-[11px] font-mono text-zinc-300 truncate">
                {status}
              </span>
            </div>
          </div>
        </div>

        {/* Deep Dive Subjects */}
        {results && results.length > 0 && (
          <div className="space-y-1.5 shrink-0">
            <span className="text-[9px] font-mono text-muted-foreground uppercase">IDENTIFIED DEEP DIVES</span>
            <div className="space-y-1">
              {results.map((res, i) => {
                const isActive = currentDeepDiveIndex === i;
                const isCompleted = currentDeepDiveIndex > i;
                return (
                  <div
                    key={i}
                    className={`p-2 rounded-sm text-[10px] font-mono flex items-center gap-2 border transition-all ${
                      isActive
                        ? "bg-blue-500/10 border-blue-500/40 text-blue-300 font-semibold"
                        : isCompleted
                        ? "bg-zinc-900/50 border-zinc-800/40 text-zinc-500"
                        : "bg-zinc-900/20 border-zinc-900 text-zinc-400"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                    ) : isActive ? (
                      <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin shrink-0" />
                    ) : (
                      <span className="w-3.5 h-3.5 text-zinc-600 font-bold shrink-0 text-center">{i + 1}</span>
                    )}
                    <span className="truncate flex-1">{res}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Embedded Scraper View Container */}
        <div className="flex-1 flex flex-col min-h-[160px] space-y-1.5">
          <div className="flex justify-between items-center text-[9px] font-mono">
            <span className="text-muted-foreground uppercase">BROWSER SCRAPER VIEW</span>
            {currentDeepDiveUrl ? (
              <span className="text-zinc-500 truncate max-w-[200px]" title={currentDeepDiveUrl}>
                {currentDeepDiveUrl}
              </span>
            ) : (
              <span className="text-zinc-500">Searching...</span>
            )}
          </div>
          <div
            id="live-research-popup-webview-container"
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-md overflow-hidden relative min-h-[150px]"
          >
            {/* The webview will be dynamically appended here */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600 space-y-2 pointer-events-none font-mono text-[10px]">
              <Search className="w-6 h-6 animate-pulse text-zinc-700" />
              <span>Web Scraper Stream Offline</span>
            </div>
          </div>
        </div>
      </div>

      {/* Minimized Tiny Footer */}
      {isMinimized && (
        <div className="px-4 py-2 bg-zinc-900/30 flex items-center justify-between text-[10px] font-mono shrink-0 border-t border-blue-500/10">
          <div className="flex items-center gap-2 min-w-0">
            <Loader2 className="w-3 h-3 text-blue-500 animate-spin shrink-0" />
            <span className="text-zinc-400 truncate">{status}</span>
          </div>
          <span className="text-[9px] text-blue-500/80 font-bold tracking-widest bg-blue-500/10 px-1 py-0.5 rounded-sm shrink-0 uppercase ml-2">
            "{query}"
          </span>
        </div>
      )}
    </div>
  );
}
