import React from "react";
import { Heart, Brain } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { getToneDescriptor } from "@shared/prompts";

interface StateTabProps {
  lastAction: string;
  setLastAction: (val: string) => void;
  contextMemoryLimit: number;
  setContextMemoryLimit: (val: number) => void;
  messages: any[];
  emotionalState: string;
  setEmotionalState: (state: any) => void;
  focusTopics: any[];
  enableFocusTopics: boolean;
  socialBattery: number;
  setSocialBattery: (val: number) => void;
  boredom: number;
  setBoredom: (val: number) => void;
  ocean: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  updateOceanFactor: (factor: string, score: number) => void;
}

export function StateTab({
  lastAction,
  setLastAction,
  contextMemoryLimit,
  setContextMemoryLimit,
  messages,
  emotionalState,
  setEmotionalState,
  focusTopics,
  enableFocusTopics,
  socialBattery,
  setSocialBattery,
  boredom,
  setBoredom,
  ocean,
  updateOceanFactor
}: StateTabProps) {
  const isElectron = typeof window !== "undefined" && !!(window as any).electron;

  return (
    <div className="space-y-4">
      {/* Short-Term Working/Status Panel */}
      <div className="p-3 bg-zinc-950/40 border border-border/50 rounded-sm space-y-2.5">
        <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-wider font-bold">
          <span className="text-orange-500/80">Working Log</span>
          <span className="text-muted-foreground/40 font-normal">Active Session Frame</span>
        </div>
        <div className="space-y-2">
          <div className="text-[9px] font-mono font-semibold text-muted-foreground">CURRENT_AGENT_TASK:</div>
          <Input
            value={lastAction}
            onChange={(e) => setLastAction(e.target.value)}
            className="bg-black/25 text-[10px] font-mono h-8 border-border text-foreground tracking-tight rounded-none focus-visible:ring-orange-500/30"
            placeholder="Inject active task frame..."
          />
        </div>

        {/* Rolling short term chats list (from useAppContext message queue) */}
        <div className="space-y-1.5 pt-1.5 border-t border-border/35">
          <div className="flex items-center justify-between">
            <div className="text-[9px] font-mono text-muted-foreground/60 uppercase">Context Retention (Tokens)</div>
            <div className="text-[9px] font-mono text-orange-500">{contextMemoryLimit}</div>
          </div>
          <div title={!isElectron ? "Capped at 4096 tokens in browser to prevent memory issues. Download Omnix desktop app for higher limits." : undefined}>
            <Slider
              value={[contextMemoryLimit]}
              min={512}
              max={isElectron ? 65536 : 4096}
              step={256}
              onValueChange={(val) => setContextMemoryLimit(val[0])}
              className="mb-2"
            />
          </div>
          <div className="max-h-[110px] overflow-y-auto space-y-1.5 pr-0.5 custom-scrollbar">
            {(() => {
              const visibleMsgs = messages.filter((m) => !m.hidden);
              const retained = [];
              let len = 0;
              for (let i = visibleMsgs.length - 1; i >= 0; i--) {
                const m = visibleMsgs[i];
                const mLen = (m.content?.length || 0) / 4 + (m.image ? 125 : 0); // Approximate tokens
                if (retained.length > 0 && len + mLen > contextMemoryLimit) break;
                retained.unshift(m);
                len += mLen;
              }
              return retained.map((m, i) => (
                <div key={i} className="text-[9.5px] font-mono leading-tight bg-black/15 p-1.5 border border-white/5 flex flex-col gap-1">
                  <div className="flex justify-between text-[7.5px] opacity-40 font-bold uppercase text-muted-foreground">
                    <span>{m.role === "user" ? "USR" : "BOT"}</span>
                    <span>{m.timestamp || "PRE_INDEX_TIME"}</span>
                  </div>
                  <div className="truncate text-foreground/80 font-normal">
                    {m.content || "[Image/Media]"}
                  </div>
                </div>
              ));
            })()}
            {messages.filter((m) => !m.hidden).length === 0 && (
              <div className="text-[8.5px] italic text-muted-foreground/40 font-mono p-1">
                No global messages loaded in active frameset.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inner Biological/Physiological Variables */}
      <div className="p-4 bg-zinc-950/50 border border-border/50 rounded-sm space-y-4">
        <div className="flex items-center gap-1.5 border-b border-border/30 pb-2">
          <Heart className="w-4 h-4 text-orange-500 animate-[pulse_2s_infinite]" />
          <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-200">Physiological Variables</h3>
        </div>

        {/* Mood Frame */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[9px] font-mono uppercase text-muted-foreground font-bold">
            <span>Current Emotional State</span>
            <span className="text-orange-400 font-extrabold text-[10px]">{emotionalState}</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 pt-0.5">
            {["Focused", "Curious", "Creative", "Analytical", "Excited", "Thoughtful"].map((m) => (
              <button
                key={m}
                onClick={() => setEmotionalState(m as any)}
                className={`py-1 text-[8.5px] font-mono uppercase border rounded-none cursor-pointer transition-colors ${
                  emotionalState === m
                    ? "bg-orange-500/10 border-orange-500 text-orange-400 font-extrabold"
                    : "border-border/40 hover:border-border/80 text-muted-foreground hover:bg-white/5"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Focus Topics Section */}
        <div className="space-y-3 pt-3 border-t border-border/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono uppercase text-muted-foreground font-bold">Focus Topics (Target Context)</span>
            </div>
            <span
              className={`text-[7.5px] font-mono border px-1 py-0.2 uppercase ${
                enableFocusTopics
                  ? "text-green-400 border-green-500/20 bg-green-500/5"
                  : "text-zinc-500 border-zinc-500/20 bg-zinc-500/5"
              }`}
            >
              {enableFocusTopics ? "ACTIVE" : "STANDBY"}
            </span>
          </div>

          {enableFocusTopics ? (
            <div className="space-y-3">
              {focusTopics && focusTopics.length > 0 ? (
                focusTopics.map((topic, i) => (
                  <div key={topic.name || i} className="space-y-1 font-mono p-2 bg-black/15 border border-white/5 rounded-sm">
                    <div className="flex justify-between text-[9px] uppercase font-bold">
                      <span className="text-zinc-200 truncate max-w-[150px]">{topic.name}</span>
                      <span className="text-orange-400 font-extrabold">{Math.round(topic.energy)}% focus</span>
                    </div>
                    <div className="w-full bg-zinc-900/80 h-1 rounded-full overflow-hidden border border-white/5">
                      <div
                        className="bg-gradient-to-r from-orange-600 to-orange-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(0, topic.energy))}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[7px] text-muted-foreground/60">
                      <span>DECAY: -{topic.decayRate.toFixed(1)}%/sec</span>
                      <span>STABILITY: {Math.max(0, 100 - topic.decayRate * 10).toFixed(0)}/100</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground/35 italic font-mono text-[8.5px] bg-black/10 border border-white/5 p-2">
                  No active focus topics. Discuss a topic in chat to anchor attention.
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground/35 italic font-mono text-[8.5px] bg-black/10 border border-white/5 p-2">
              Focus topics are disabled in Settings.
            </div>
          )}
        </div>

        {/* Social Battery Slider */}
        <div className="space-y-2 pt-2 border-t border-border/20">
          <div className="flex justify-between text-[9px] font-mono uppercase text-muted-foreground font-bold">
            <span>Social Battery Level</span>
            <span className="font-bold text-orange-500">{socialBattery.toFixed(1)}%</span>
          </div>
          <div className="flex gap-4 items-center">
            <Slider
              value={[socialBattery]}
              onValueChange={(val) => setSocialBattery(val[0])}
              max={100}
              min={0}
              step={0.5}
              className="flex-1 py-1"
            />
          </div>
        </div>

        {/* Boredom Slider */}
        <div className="space-y-2 pt-2 border-t border-border/20">
          <div className="flex justify-between text-[9px] font-mono uppercase text-muted-foreground font-bold">
            <span>Boredom Matrix Level</span>
            <span className="font-bold text-blue-400">{boredom.toFixed(1)}%</span>
          </div>
          <div className="flex gap-4 items-center">
            <Slider
              value={[boredom]}
              onValueChange={(val) => setBoredom(val[0])}
              max={100}
              min={0}
              step={0.5}
              className="flex-1 py-1"
            />
          </div>
        </div>
      </div>

      {/* OCEAN Personality Factor Set (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism) */}
      <div className="p-4 bg-zinc-950/50 border border-border/50 rounded-sm space-y-4">
        <div className="flex items-center gap-1.5 border-b border-border/30 pb-2">
          <Brain className="w-4 h-4 text-orange-500" />
          <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-200">OCEAN personality settings</h3>
        </div>

        {/* Active Tone Archetype Display */}
        <div className="p-2.5 bg-orange-950/15 border border-orange-500/15 rounded-sm">
          <div className="text-[8px] uppercase font-bold text-orange-400 tracking-wider font-mono">Mapped Tone Archetype:</div>
          <div className="text-xs text-zinc-300 font-sans italic mt-1 capitalize leading-relaxed">
            "{[
              getToneDescriptor("openness", ocean.openness),
              getToneDescriptor("conscientiousness", ocean.conscientiousness),
              getToneDescriptor("extraversion", ocean.extraversion),
              getToneDescriptor("agreeableness", ocean.agreeableness),
              getToneDescriptor("neuroticism", ocean.neuroticism)
            ].filter(Boolean).join(", ")}"
          </div>
        </div>

        <div className="space-y-3.5 font-mono">
          {/* OPENNESS */}
          <div className="space-y-1">
            <div className="flex justify-between text-[8px] font-bold uppercase text-muted-foreground/80">
              <span>O_OPENNESS (Creative / Curious)</span>
              <span className="text-foreground font-semibold">{ocean.openness}%</span>
            </div>
            <Slider
              value={[ocean.openness]}
              onValueChange={(val) => updateOceanFactor("openness", val[0])}
              max={100}
              min={0}
              step={1}
              className="py-1"
            />
          </div>

          {/* CONSCIENTIOUSNESS */}
          <div className="space-y-1">
            <div className="flex justify-between text-[8px] font-bold uppercase text-muted-foreground/80">
              <span>C_CONSCIENTIOUSNESS (Disciplined / Orderly)</span>
              <span className="text-foreground font-semibold">{ocean.conscientiousness}%</span>
            </div>
            <Slider
              value={[ocean.conscientiousness]}
              onValueChange={(val) => updateOceanFactor("conscientiousness", val[0])}
              max={100}
              min={0}
              step={1}
              className="py-1"
            />
          </div>

          {/* EXTRAVERSION */}
          <div className="space-y-1">
            <div className="flex justify-between text-[8px] font-bold uppercase text-muted-foreground/80">
              <span>E_EXTRAVERSION (Outgoing / Social)</span>
              <span className="text-foreground font-semibold">{ocean.extraversion}%</span>
            </div>
            <Slider
              value={[ocean.extraversion]}
              onValueChange={(val) => updateOceanFactor("extraversion", val[0])}
              max={100}
              min={0}
              step={1}
              className="py-1"
            />
          </div>

          {/* AGREEABLENESS */}
          <div className="space-y-1">
            <div className="flex justify-between text-[8px] font-bold uppercase text-muted-foreground/80">
              <span>A_AGREEABLENESS (Empathetic / Helpful)</span>
              <span className="text-foreground font-semibold">{ocean.agreeableness}%</span>
            </div>
            <Slider
              value={[ocean.agreeableness]}
              onValueChange={(val) => updateOceanFactor("agreeableness", val[0])}
              max={100}
              min={0}
              step={1}
              className="py-1"
            />
          </div>

          {/* NEUROTICISM */}
          <div className="space-y-1">
            <div className="flex justify-between text-[8px] font-bold uppercase text-muted-foreground/80">
              <span>N_NEUROTICISM (Sensitive / Highly Aware)</span>
              <span className="text-foreground font-semibold">{ocean.neuroticism}%</span>
            </div>
            <Slider
              value={[ocean.neuroticism]}
              onValueChange={(val) => updateOceanFactor("neuroticism", val[0])}
              max={100}
              min={0}
              step={1}
              className="py-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
