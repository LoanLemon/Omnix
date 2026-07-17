import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  MicOff,
  Mic,
  Send,
  Image as ImageIcon,
  Monitor,
  Volume2,
  Sparkles,
  Music,
  Workflow,
  Code2,
  Layout,
  X,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { tts } from "@/lib/tts";
import { MODELS } from "@shared/modelList";

interface InputDockProps {
  handleSend: () => void;
  analyzeImage: (file: File) => void;
  handleToolCall: (toolCall: any) => void;
  handleMusicGen: (prompt: string) => void;
}

export function InputDock({
  handleSend,
  analyzeImage,
  handleToolCall,
  handleMusicGen,
}: InputDockProps) {
  const {
    input,
    setInput,
    isModelReady,
    isRecording,
    toggleRecording,
    isLiveMode,
    toggleLiveMode,
    speakEnabled,
    setSpeakEnabled,
    isCoderMode,
    isPipelineRunning,
    startPipeline,
    stopPipeline,
    sandboxFiles,
    generatedImage,
    activeTab,
    setActiveTab,
    pendingImage,
    setPendingImage,
    selectedModels,
    activeCategory,
  } = useApp();

  React.useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf("image") !== -1) {
            const file = items[i].getAsFile();
            if (file) {
              analyzeImage(file);
              e.preventDefault();
              break;
            }
          }
        }
      }
    };

    window.addEventListener("paste", handleGlobalPaste);
    return () => {
      window.removeEventListener("paste", handleGlobalPaste);
    };
  }, [analyzeImage]);

  const currentModelId = isCoderMode ? selectedModels.coder : selectedModels[activeCategory] || selectedModels.text;
  const currentModel = MODELS.find(m => m.id === currentModelId);
  const maxContext = Math.floor((currentModel?.maxContextChars || 8192) * 0.8);
  const isOverContext = input.length > maxContext;

  return (
    <div className="p-6 border-t border-border bg-background/50 backdrop-blur-xl shrink-0">
      <div className="max-w-2xl mx-auto relative">
        <div className="flex justify-between items-center mb-2 px-1">
          <span className={`text-xs ${isOverContext ? "text-red-500 font-bold" : "text-muted-foreground"}`}>
            Context: {input.length} / {maxContext} chars
          </span>
        </div>
        {pendingImage && (
          <div className="mb-3 relative inline-block">
            <img
              src={pendingImage}
              className="h-20 w-20 object-cover rounded-lg border border-border"
              alt="Pending"
            />
            <button
              type="button"
              onClick={() => setPendingImage(null)}
              className="absolute -top-2 -right-2 bg-muted border border-border rounded-full p-1 text-muted-foreground hover:text-foreground shadow-xl"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <div className="relative flex-1">
            <Input
              placeholder={
                isModelReady ? "Command the studio..." : "Initializing engine..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="bg-muted border-border h-12 pl-4 pr-12 focus-visible:ring-orange-500/50 rounded-xl"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className={`h-8 w-8 rounded-lg ${
                  isRecording && !isLiveMode
                    ? "text-red-500 bg-red-500/10 hover:bg-red-500/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
                onClick={toggleRecording}
                disabled={isLiveMode}
              >
                {isRecording ? (
                  <MicOff className="w-4 h-4 animate-pulse" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </Button>
              <Button
                type="submit"
                size="icon"
                className="h-8 w-8 bg-orange-600 hover:bg-orange-500 text-white rounded-lg"
                disabled={!input.trim() && !pendingImage}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </form>

        <div className="flex items-center gap-4 mt-3 px-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-[10px] text-muted-foreground hover:text-orange-500 gap-1.5"
              onClick={() =>
                (document.getElementById("vision-upload") as HTMLInputElement)?.click()
              }
            >
              <ImageIcon className="w-3 h-3" />
              Vision
            </Button>
            <input
              type="file"
              id="vision-upload"
              className="hidden"
              accept="image/*"
              onChange={(e) =>
                e.target.files?.[0] && analyzeImage(e.target.files[0])
              }
            />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`h-7 text-[10px] gap-1.5 ${
                isLiveMode
                  ? "text-red-500 hover:text-red-400 bg-red-500/10"
                  : "text-muted-foreground hover:text-orange-500"
              }`}
              onClick={toggleLiveMode}
              title="Toggle Live Mode (Screen + Voice)"
            >
              <Monitor
                className={`w-3 h-3 ${isLiveMode ? "animate-pulse" : ""}`}
              />
              Live
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`h-7 text-[10px] gap-1.5 ${
                speakEnabled
                  ? "text-orange-500 bg-orange-500/10 hover:bg-orange-500/20"
                  : "text-muted-foreground hover:text-orange-500"
              }`}
              title={
                speakEnabled
                  ? "Disable Speak Responses (TTS)"
                  : "Enable Speak Responses (TTS)"
              }
              onClick={() => {
                const nextVal = !speakEnabled;
                setSpeakEnabled(nextVal);
                if (nextVal) {
                  tts.resume();
                } else {
                  tts.stop();
                }
              }}
            >
              <Volume2 className="w-3 h-3" />
              Speak
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-[10px] text-muted-foreground hover:text-orange-500 gap-1.5"
              onClick={() =>
                handleToolCall({
                  tool: "image_gen",
                  params: { prompt: input },
                })
              }
              disabled={!input.trim()}
            >
              <Sparkles className="w-3 h-3" />
              Generate
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-[10px] text-muted-foreground hover:text-orange-500 gap-1.5"
              onClick={() => handleMusicGen(input)}
              disabled={!input.trim()}
            >
              <Music className="w-3 h-3" />
              Music
            </Button>

            {isCoderMode && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={`h-7 text-[10px] gap-1.5 ${
                  isPipelineRunning
                    ? "text-orange-500 bg-orange-500/10"
                    : "text-muted-foreground hover:text-orange-500"
                }`}
                onClick={() =>
                  isPipelineRunning ? stopPipeline() : startPipeline(input)
                }
                disabled={!input.trim() && !isPipelineRunning}
              >
                <Workflow
                  className={`w-3 h-3 ${isPipelineRunning ? "animate-spin" : ""}`}
                />
                {isPipelineRunning ? "Abort Pipeline" : "Build Project"}
              </Button>
            )}
          </div>
          <Separator orientation="vertical" className="h-3 bg-border" />
          <div className="flex gap-2">
            {sandboxFiles.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={`h-7 text-[10px] gap-1.5 ${
                  activeTab === "sandbox" ? "text-orange-500" : "text-muted-foreground"
                }`}
                onClick={() => setActiveTab("sandbox")}
              >
                <Code2 className="w-3 h-3" />
                Sandbox
              </Button>
            )}
            {generatedImage && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={`h-7 text-[10px] gap-1.5 ${
                  activeTab === "gallery" ? "text-orange-500" : "text-muted-foreground"
                }`}
                onClick={() => setActiveTab("gallery")}
              >
                <Layout className="w-3 h-3" />
                Gallery
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
