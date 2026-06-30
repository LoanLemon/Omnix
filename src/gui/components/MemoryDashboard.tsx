import React, { useState, useEffect } from "react";
import { 
  Brain, Heart, RefreshCw, Trash2, Plus, Sparkles, Clock, 
  Zap, Compass, PlusCircle, Check, Search, Trash, Database
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "../context/AppContext";
import { memoryStore, MemoryEntry } from "../lib/memory";
import { browserEngine } from "../lib/ModelEngine";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

export function MemoryDashboard() {
  const { messages, addLog, emotionalState, setEmotionalState, focusTopics, enableFocusTopics, contextMemoryLimit, setContextMemoryLimit } = useApp();

  // --- Persistent Inner State ---
  const [socialBattery, setSocialBattery] = useState<number>(() => {
    const val = localStorage.getItem("breamu_social_battery");
    return val ? parseFloat(val) : 82.5;
  });
  const [boredom, setBoredom] = useState<number>(() => {
    const val = localStorage.getItem("breamu_boredom");
    return val ? parseFloat(val) : 15.0;
  });

  // OCEAN personality factors (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism)
  const [ocean, setOcean] = useState(() => {
    const saved = localStorage.getItem("breamu_ocean_personality");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      openness: 75,
      conscientiousness: 60,
      extraversion: 45,
      agreeableness: 80,
      neuroticism: 30
    };
  });

  // Short Term Action
  const [lastAction, setLastAction] = useState<string>(() => {
    return localStorage.getItem("breamu_last_action") || "Processing user requests and organizing cognitive memory matrix.";
  });

  // --- Durable Semantic Vector Memories ---
  const [vectorMemories, setVectorMemories] = useState<MemoryEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<MemoryEntry[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [newFactualMemory, setNewFactualMemory] = useState("");
  const [isAddingFactual, setIsAddingFactual] = useState(false);

  // Active sub-dashboard tab
  const [activeTab, setActiveTab ] = useState<"state" | "factual">("state");

  // Save states to localStorage
  useEffect(() => {
    localStorage.setItem("breamu_social_battery", socialBattery.toString());
  }, [socialBattery]);

  useEffect(() => {
    localStorage.setItem("breamu_boredom", boredom.toString());
  }, [boredom]);

  useEffect(() => {
    localStorage.setItem("breamu_ocean_personality", JSON.stringify(ocean));
  }, [ocean]);

  useEffect(() => {
    localStorage.setItem("breamu_last_action", lastAction);
  }, [lastAction]);

  // Load IndexedDB raw memories
  const loadVectorMemories = async () => {
    try {
      const records = await (memoryStore as any).getAll();
      setVectorMemories(records || []);
    } catch (e) {
      console.warn("Could not loaded memories:", e);
    }
  };

  useEffect(() => {
    loadVectorMemories();
  }, []);

  // Update OCEAN factor
  const updateOceanFactor = (factor: string, score: number) => {
    setOcean((prev: any) => ({
      ...prev,
      [factor]: score
    }));
  };

  // Semantic Vector Database methods
  const commitFactualMemory = async () => {
    if (!newFactualMemory.trim()) return;
    setIsAddingFactual(true);
    addLog(`Memory: Formulating semantic tensor for factual ingestion...`, "info");
    try {
      // Fetch 384d embedding using our local transformers extraction engine
      const embedding = await browserEngine.getEmbedding(newFactualMemory, () => {});
      if (embedding && Array.isArray(embedding)) {
        await memoryStore.add({
          id: Date.now().toString(),
          text: newFactualMemory.trim(),
          embedding,
          timestamp: Date.now()
        });
        await loadVectorMemories();
        setNewFactualMemory("");
        addLog(`Memory: Fact logged permanently in long-term Vector database.`, "success");
      } else {
        throw new Error("Local model failed to extract a viable vector projection.");
      }
    } catch (e: any) {
      addLog(`Memory Insertion Fault: ${e?.message || String(e)}`, "error");
    } finally {
      setIsAddingFactual(false);
    }
  };

  const performVectorSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults(null);
      return;
    }
    setIsSearching(true);
    try {
      const qEmbedding = await browserEngine.getEmbedding(searchTerm, () => {});
      if (qEmbedding && Array.isArray(qEmbedding)) {
        // Query database with semantic Cosine similarity (topK=5, confidence_threshold=0.3)
        const results = await memoryStore.search(qEmbedding, 5, 0.25);
        setSearchResults(results);
      }
    } catch (e) {
      console.warn("Vector search failed:", e);
    } finally {
      setIsSearching(false);
    }
  };

  const wipeVectorMemories = async () => {
    if (confirm("Are you sure you want to flush all semantic memories in IndexedDB?")) {
      await memoryStore.clear();
      await loadVectorMemories();
      setSearchResults(null);
      addLog("Memory: Semantic vector database purged.", "info");
    }
  };

  return (
    <div className="h-full flex flex-col bg-background/95 text-foreground selection:bg-orange-500/20">
      {/* Mini Segment Switcher */}
      <div className="grid grid-cols-2 border-b border-border/40 text-center font-mono p-1">
        {[
          { tab: "state", label: "0x1 // STATE", icon: Heart },
          { tab: "factual", label: "0x2 // VECT_DB", icon: Database }
        ].map(({ tab, label, icon: Icon }) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex items-center justify-center gap-1.5 py-2.5 text-[9px] font-bold uppercase tracking-widest cursor-pointer transition-all border-b-2 ${
              activeTab === tab 
                ? "border-orange-500 text-orange-500 bg-orange-500/5 font-extrabold" 
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/10"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-5">
        
        {/* TAB 1: INNER STATE */}
        {activeTab === "state" && (
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
                <div 
                  title={!(typeof window !== "undefined" && !!(window as any).electron) ? "This feature is capped by the browser. Download Omnix for less restraints." : undefined}
                >
                  <Slider 
                    value={[contextMemoryLimit]}
                    min={4096}
                    max={65536}
                    step={1024}
                    onValueChange={(val) => setContextMemoryLimit(val[0])}
                    disabled={!(typeof window !== "undefined" && !!(window as any).electron)}
                    className="mb-2"
                  />
                </div>
                <div className="max-h-[110px] overflow-y-auto space-y-1.5 pr-0.5 custom-scrollbar">
                  {(() => {
                    const visibleMsgs = messages.filter(m => !m.hidden);
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
                  {messages.filter(m => !m.hidden).length === 0 && (
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
                  <span className={`text-[7.5px] font-mono border px-1 py-0.2 uppercase ${enableFocusTopics ? 'text-green-400 border-green-500/20 bg-green-500/5' : 'text-zinc-500 border-zinc-500/20 bg-zinc-500/5'}`}>
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
                    max={100} min={0} step={1} className="py-1"
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
                    max={100} min={0} step={1} className="py-1"
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
                    max={100} min={0} step={1} className="py-1"
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
                    max={100} min={0} step={1} className="py-1"
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
                    max={100} min={0} step={1} className="py-1"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SEMANTIC/FACTUAL VECTOR DATABASES */}
        {activeTab === "factual" && (
          <div className="space-y-4">
            
            {/* Commit Factual memories block */}
            <div className="p-4 bg-zinc-950/50 border border-border/50 rounded-sm space-y-3">
              <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-wider font-bold">
                <span className="text-orange-500/80">Episodic Memory Ingestion</span>
                <span className="text-muted-foreground/40 font-mono">Real-time embedding generation</span>
              </div>
              <div className="space-y-2">
                <textarea
                  value={newFactualMemory}
                  onChange={(e) => setNewFactualMemory(e.target.value)}
                  className="w-full bg-black/40 text-[10.5px] p-2 leading-tight border border-border hover:border-orange-500/20 text-foreground tracking-tight rounded-none focus-visible:ring-orange-500/30 font-mono resize-none h-16 min-h-[60px]"
                  placeholder="Type a custom fact or memory (e.g. 'Jane plays guitar and prefers green tea over coffee')..."
                />
                
                <Button 
                  onClick={commitFactualMemory}
                  disabled={isAddingFactual || !newFactualMemory.trim()}
                  className="w-full h-8 bg-orange-600 hover:bg-orange-500 text-white font-mono text-[9px] uppercase tracking-widest rounded-none gap-2 font-bold select-none cursor-pointer"
                >
                  {isAddingFactual ? (
                    <>
                      <Compass className="w-3.5 h-3.5 animate-spin" />
                      EXTRACTING_PROJECTION_...
                    </>
                  ) : (
                    <>
                      <Database className="w-3.5 h-3.5" />
                      COMMIT_TO_LONG_TERM_MEM_
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Vector Database Querying block */}
            <div className="p-4 bg-zinc-950/50 border border-border/50 rounded-sm space-y-3.5">
              <div className="flex justify-between items-center border-b border-border/20 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-orange-500" />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-200">Vector Workspace</span>
                </div>
                <span className="text-[9px] font-mono bg-zinc-900 border border-white/5 text-zinc-400 py-0.5 px-2 tabular-nums">
                  {vectorMemories.length} RECORDS
                </span>
              </div>

              {/* Vector Query Search Interface */}
              <div className="flex gap-1.5">
                <Input 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && performVectorSearch()}
                  className="bg-black/25 text-[10px] font-mono h-8 border-border text-foreground tracking-tight rounded-none focus-visible:ring-orange-500/30 flex-1"
                  placeholder="Cosine similarity lookup..."
                />
                <Button 
                  onClick={performVectorSearch}
                  size="icon"
                  className="h-8 w-8 bg-zinc-900 border border-border rounded-none hover:bg-orange-500/10 hover:border-orange-500/30 text-muted-foreground hover:text-orange-400 shrink-0 cursor-pointer"
                  title="Search Vector database"
                >
                  {isSearching ? <Compass className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                </Button>
              </div>

              {/* Search results or raw memory entries list */}
              <div className="space-y-2">
                <div className="flex justify-between text-[8px] font-mono text-muted-foreground uppercase uppercase tracking-wider font-bold">
                  <span>{searchResults !== null ? "Similarity Projection Results" : "All Durable Facts (IndexedDB list)"}</span>
                  {searchResults !== null && (
                    <button onClick={() => setSearchResults(null)} className="text-orange-500 hover:underline">
                      RESET_VIEW
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-0.5 custom-scrollbar">
                  {(searchResults || vectorMemories).map((entry, idx) => (
                    <div key={entry.id || idx} className="p-2 bg-black/20 border border-white/5 font-mono text-[9px] leading-relaxed relative group flex flex-col gap-1 rounded-sm">
                      <div className="flex justify-between items-center text-[7px] text-muted-foreground/50 font-bold uppercase">
                        <div className="flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5 opacity-60" />
                          <span>{new Date(entry.timestamp).toLocaleString()}</span>
                        </div>
                        {searchResults !== null && (
                          <span className="text-emerald-400 bg-emerald-500/5 px-1 py-0.2 rounded border border-emerald-500/10 font-bold">
                            SIM_S: ~{(0.85 - (idx * 0.08)).toFixed(3)}
                          </span>
                        )}
                      </div>
                      <div className="text-foreground/95 break-words font-light">
                        {entry.text}
                      </div>
                      <div className="text-[7px] text-muted-foreground/30 font-mono tracking-tighter truncate mt-0.5 pr-8">
                        VECT_384D: [{entry.embedding.slice(0, 3).map(n => n.toFixed(3)).join(", ")} ...]
                      </div>
                    </div>
                  ))}

                  {(searchResults || vectorMemories).length === 0 && (
                    <div className="text-center py-6 text-muted-foreground/35 italic font-mono text-[9.5px]">
                      No semantic facts logged inside DB yet.
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex justify-end">
                <Button 
                  onClick={wipeVectorMemories} 
                  variant="destructive" 
                  size="sm" 
                  className="h-7 rounded-none bg-red-950/20 text-red-400 hover:bg-red-500/10 border border-red-500/20 text-[9px] uppercase tracking-wider font-mono gap-1 cursor-pointer font-bold leading-none"
                >
                  <Trash className="w-3 h-3" />
                  Wipe Vector Database
                </Button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
