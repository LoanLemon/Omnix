import React, { useState, useEffect } from "react";
import { Heart, Database } from "lucide-react";
import { useApp } from "../context/AppContext";
import { memoryStore, MemoryEntry, chunkBySentences, classifyChunk } from "../lib/memory";
import { browserEngine } from "../lib/ModelEngine";
import { StateTab } from "./MemoryDashboardFuncs/StateTab";
import { FactualTab } from "./MemoryDashboardFuncs/FactualTab";

export function MemoryDashboard() {
  const {
    messages,
    addLog,
    emotionalState,
    setEmotionalState,
    focusTopics,
    enableFocusTopics,
    contextMemoryLimit,
    setContextMemoryLimit
  } = useApp();

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
      try {
        return JSON.parse(saved);
      } catch (e) {}
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
  const [activeTab, setActiveTab] = useState<"state" | "factual">("state");

  // --- Memory Bank Selection & Isolation ---
  const [selectedReqId, setSelectedReqId] = useState<string>("default");

  // Find all unique reqIds/isolatedRAG that exist in stored vector memories
  const availableReqIds = React.useMemo(() => {
    const ids = new Set<string>();
    vectorMemories.forEach((entry) => {
      const ragId = entry.metadata?.isolatedRAG;
      if (ragId && typeof ragId === "string" && ragId.trim() !== "") {
        ids.add(ragId);
      }
    });
    return Array.from(ids).sort();
  }, [vectorMemories]);

  // Compute memory count for default and individual reqIds
  const reqIdCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    let defaultCount = 0;
    vectorMemories.forEach((entry) => {
      const ragId = entry.metadata?.isolatedRAG;
      if (ragId && typeof ragId === "string" && ragId.trim() !== "") {
        counts[ragId] = (counts[ragId] || 0) + 1;
      } else {
        defaultCount++;
      }
    });
    return { counts, defaultCount };
  }, [vectorMemories]);

  // Filter memories to display based on selected bank
  const filteredMemories = React.useMemo(() => {
    return vectorMemories.filter((entry) => {
      const entryRag = entry.metadata?.isolatedRAG;
      if (selectedReqId === "default") {
        return !entryRag;
      } else {
        return entryRag === selectedReqId;
      }
    });
  }, [vectorMemories, selectedReqId]);

  // Reset search results when switching bank selection
  useEffect(() => {
    setSearchResults(null);
    setSearchTerm("");
  }, [selectedReqId]);

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
      console.warn("Could not load memories:", e);
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
    try {
      const chunks = chunkBySentences(newFactualMemory);
      addLog(`Memory: Split input into ${chunks.length} sentence chunks for ingestion.`, "info");

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        addLog(`Memory: [${i + 1}/${chunks.length}] Formulating semantic tensor for: "${chunk.slice(0, 30)}..."`, "info");
        const embedding = await browserEngine.getEmbedding(chunk, () => {});
        
        if (embedding && Array.isArray(embedding)) {
          const metadata: any = {
            classification: classifyChunk(chunk)
          };
          if (selectedReqId !== "default") {
            metadata.isolatedRAG = selectedReqId;
          }
          await memoryStore.add({
            id: (Date.now() + i).toString(),
            text: chunk,
            embedding,
            timestamp: Date.now() + i,
            metadata
          });
        } else {
          throw new Error("Local model failed to extract a viable vector projection.");
        }
      }

      await loadVectorMemories();
      setNewFactualMemory("");
      addLog(`Memory: Chunked memories logged permanently in long-term Vector database.`, "success");
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
        const results = await memoryStore.search(qEmbedding, 5, 0.25);
        const filteredResults = results.filter((entry) => {
          const entryRag = entry.metadata?.isolatedRAG;
          if (selectedReqId === "default") {
            return !entryRag;
          } else {
            return entryRag === selectedReqId;
          }
        });
        setSearchResults(filteredResults);
      }
    } catch (e) {
      console.warn("Vector search failed:", e);
    } finally {
      setIsSearching(false);
    }
  };

  const purgeCurrentBank = async () => {
    if (selectedReqId === "default") {
      if (confirm("Are you sure you want to flush all standard memories (Default Bank) in IndexedDB?")) {
        const toKeep = vectorMemories.filter((m) => m.metadata?.isolatedRAG);
        await memoryStore.clear();
        for (const m of toKeep) {
          await memoryStore.add(m);
        }
        await loadVectorMemories();
        setSearchResults(null);
        addLog("Memory: Default standard memories purged.", "info");
      }
    } else {
      if (confirm(`Are you sure you want to flush all memories for the API request bank "${selectedReqId}"?`)) {
        const toKeep = vectorMemories.filter((m) => m.metadata?.isolatedRAG !== selectedReqId);
        await memoryStore.clear();
        for (const m of toKeep) {
          await memoryStore.add(m);
        }
        await loadVectorMemories();
        setSearchResults(null);
        addLog(`Memory: Purged bank "${selectedReqId}" memories.`, "info");
      }
    }
  };

  const wipeVectorMemories = async () => {
    if (confirm("Are you sure you want to flush ALL semantic memories across ALL banks in IndexedDB?")) {
      await memoryStore.clear();
      await loadVectorMemories();
      setSearchResults(null);
      addLog("Memory: Semantic vector database entirely purged.", "info");
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
        {activeTab === "state" ? (
          <StateTab
            lastAction={lastAction}
            setLastAction={setLastAction}
            contextMemoryLimit={contextMemoryLimit}
            setContextMemoryLimit={setContextMemoryLimit}
            messages={messages}
            emotionalState={emotionalState}
            setEmotionalState={setEmotionalState}
            focusTopics={focusTopics}
            enableFocusTopics={enableFocusTopics}
            socialBattery={socialBattery}
            setSocialBattery={setSocialBattery}
            boredom={boredom}
            setBoredom={setBoredom}
            ocean={ocean}
            updateOceanFactor={updateOceanFactor}
          />
        ) : (
          <FactualTab
            selectedReqId={selectedReqId}
            setSelectedReqId={setSelectedReqId}
            reqIdCounts={reqIdCounts}
            availableReqIds={availableReqIds}
            newFactualMemory={newFactualMemory}
            setNewFactualMemory={setNewFactualMemory}
            isAddingFactual={isAddingFactual}
            commitFactualMemory={commitFactualMemory}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            performVectorSearch={performVectorSearch}
            isSearching={isSearching}
            searchResults={searchResults}
            setSearchResults={setSearchResults}
            filteredMemories={filteredMemories}
            vectorMemories={vectorMemories}
            purgeCurrentBank={purgeCurrentBank}
            wipeVectorMemories={wipeVectorMemories}
          />
        )}
      </div>
    </div>
  );
}
