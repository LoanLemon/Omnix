/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppLogicProvider } from "@/context/AppLogicProvider";
import { useApp } from "@/context/AppContext";

// Components
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { ChatArea } from "@/components/ChatArea";
import { PreviewSidebar } from "@/components/PreviewSidebar";
import { ErrorOverlay } from "@/components/ErrorOverlay";
import { AuthPromptModal } from "@/components/AuthPromptModal";

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
    setShowMemoryDashboard
  } = useApp();

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

        {(sandboxFiles.length > 0 || generatedImage || showMemoryDashboard) && (
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
