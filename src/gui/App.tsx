/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppLogicProvider } from "@/context/AppLogicProvider";
import { useApp } from "@/context/AppContext";
import { useState } from "react";
import { AlertTriangle, X, ChevronDown, ChevronUp } from "lucide-react";

// Components
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { ChatArea } from "@/components/ChatArea";
import { PreviewSidebar } from "@/components/PreviewSidebar";
import { WorkflowTracker } from "@/components/WorkflowTracker";
import { ErrorOverlay } from "@/components/ErrorOverlay";
import { AuthPromptModal } from "@/components/AuthPromptModal";
import { LiveResearchPopup } from "@/components/LiveResearchPopup";

function AppContent() {
  const {
    showSidebar,
    loadModel,
    logEndRef,
    handleSend,
    analyzeImage,
    speakEnabled,
    pendingImage,
    setPendingImage,
    activeTab,
    setActiveTab,
    scrollRef,
    generatedImage,
    sandboxFiles,
    isRecording,
    toggleRecording,
    clearChat,
    clearCache,
    error,
    setError,
    setDidError,
    isWorkerMode,
    safeMode,
    setSafeMode,
    activeAuthRequest,
    respondToAuth,
    showMemoryDashboard,
    setShowMemoryDashboard,
    hasWebGPU,
    chatMode
  } = useApp();

  const [isGpuNoticeDismissed, setIsGpuNoticeDismissed] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("omnix_gpu_notice_dismissed") === "true";
    }
    return false;
  });
  const [showGpuInstructions, setShowGpuInstructions] = useState(false);

  const dismissGpuNotice = () => {
    setIsGpuNoticeDismissed(true);
    sessionStorage.setItem("omnix_gpu_notice_dismissed", "true");
  };

  if (isWorkerMode) {
    return (
      <div className="h-screen w-screen bg-black flex flex-col items-center justify-center font-mono p-12 overflow-hidden">
        <div className="relative group cursor-wait">
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative p-8 bg-zinc-950 ring-1 ring-zinc-800 rounded-lg space-y-4">
            <div className="flex items-center gap-4 text-orange-500">
              <div className="w-4 h-4 bg-orange-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(249,115,22,0.5)]"></div>
              <span className="text-sm font-bold tracking-widest uppercase">OMNIX_HEADLESS_WORKER</span>
            </div>
            <div className="text-[10px] text-zinc-500 max-w-sm border-l-2 border-orange-500/20 pl-4 py-2 italic font-serif">
              "This interface is optimized for background compute. All UI renderers are disabled to maximize AI inference efficiency."
            </div>
            <div className="space-y-1">
               <div className="flex justify-between text-[8px] text-zinc-600 uppercase tracking-tighter">
                  <span>Engine Activity</span>
                  <span className="animate-pulse">Active_Compute</span>
               </div>
               <div className="h-1 bg-zinc-900 overflow-hidden relative">
                  <div className="absolute h-full bg-orange-500/30 w-1/3 animate-ping"></div>
                  <div className="absolute h-full bg-orange-500/50 w-full translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
               </div>
            </div>
            <div className="pt-4 flex justify-end">
              <button 
                onClick={() => window.location.href = '/'}
                className="text-[9px] text-zinc-700 hover:text-orange-500 underline underline-offset-4 decoration-zinc-800 hover:decoration-orange-500/50 transition-all font-mono"
              >
                EXIT_HEADLESS_MODE_
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background text-foreground font-sans selection:bg-orange-500/30 flex flex-col overflow-hidden">
      <Header 
        clearChat={clearChat}
        clearCache={clearCache}
      />

      {hasWebGPU === false && !isGpuNoticeDismissed && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-3 relative z-40 text-xs text-foreground animate-in fade-in slide-in-from-top-4 duration-300 shrink-0">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-1 rounded bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4 animate-pulse" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold font-mono tracking-wide text-amber-700 dark:text-amber-400 uppercase text-[10px]">
                  Hardware Acceleration Disabled / WebGPU Unsupported
                </p>
                <p className="text-muted-foreground leading-relaxed max-w-4xl text-[11px]">
                  Omnix detected that WebGPU acceleration is unavailable. This usually happens when <strong>hardware acceleration</strong> is turned off in your browser settings, preventing high-speed neural processing.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 shrink-0 self-end md:self-center font-mono">
              <button 
                onClick={() => setShowGpuInstructions(!showGpuInstructions)}
                className="px-3 py-1.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-all flex items-center gap-1 text-[10px] font-bold cursor-pointer"
              >
                {showGpuInstructions ? "Hide Guide" : "How to Enable"}
                {showGpuInstructions ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              <button 
                onClick={dismissGpuNotice}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {showGpuInstructions && (
            <div className="max-w-7xl mx-auto mt-4 pt-4 border-t border-amber-500/10 grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px] leading-relaxed animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-3 rounded bg-black/5 dark:bg-white/5 border border-border/50">
                <h4 className="font-bold text-foreground mb-1.5 font-mono">🌐 Google Chrome & Brave</h4>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Open <code className="px-1 py-0.5 bg-muted rounded font-mono text-[10px]">chrome://settings/system</code></li>
                  <li>Enable <span className="font-medium text-foreground">"Use graphics acceleration when available"</span></li>
                  <li>Relaunch the browser and refresh this page.</li>
                </ol>
              </div>
              <div className="p-3 rounded bg-black/5 dark:bg-white/5 border border-border/50">
                <h4 className="font-bold text-foreground mb-1.5 font-mono">🌐 Microsoft Edge</h4>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Open <code className="px-1 py-0.5 bg-muted rounded font-mono text-[10px]">edge://settings/system</code></li>
                  <li>Enable <span className="font-medium text-foreground">"Use graphics acceleration when available"</span></li>
                  <li>Click <span className="font-medium text-foreground">"Restart"</span> to apply the settings.</li>
                </ol>
              </div>
              <div className="p-3 rounded bg-black/5 dark:bg-white/5 border border-border/50">
                <h4 className="font-bold text-foreground mb-1.5 font-mono">🦊 Mozilla Firefox</h4>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Go to <span className="font-medium text-foreground">Settings &gt; General &gt; Performance</span></li>
                  <li>Uncheck <span className="font-medium text-foreground">"Use recommended performance settings"</span></li>
                  <li>Check <span className="font-medium text-foreground">"Use hardware acceleration when available"</span></li>
                </ol>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {showSidebar && (
          <Sidebar 
            loadModel={loadModel}
            logEndRef={logEndRef as any}
          />
        )}

        <ChatArea 
          handleSend={handleSend}
          analyzeImage={analyzeImage}
          speak={(text) => { /* logic moved to speak helper if needed or kept simple here */ }}
          handleToolCall={() => {}}
          handleMusicGen={() => {}}
          pendingImage={pendingImage}
          setPendingImage={setPendingImage}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          scrollRef={scrollRef as any}
          onScroll={() => {}}
          generatedImage={generatedImage}
          sandboxFiles={sandboxFiles}
          isRecording={isRecording}
          toggleRecording={toggleRecording}
          handleOptionSelect={() => {}}
        />

        {chatMode === "sandbox" && (
          <WorkflowTracker />
        )}

        {(sandboxFiles.length > 0 || generatedImage || showMemoryDashboard || chatMode === "sandbox") && (
          <PreviewSidebar />
        )}
      </div>

      <ErrorOverlay 
        error={error}
        setError={setError}
        setDidError={setDidError}
        loadModel={loadModel}
        clearCache={clearCache}
        safeMode={safeMode}
        setSafeMode={setSafeMode}
      />

      <AuthPromptModal 
        activeAuthRequest={activeAuthRequest}
        respondToAuth={respondToAuth}
      />

      <LiveResearchPopup />
    </div>
  );
}

export default function App() {
  return (
    <AppLogicProvider>
      <AppContent />
    </AppLogicProvider>
  );
}
