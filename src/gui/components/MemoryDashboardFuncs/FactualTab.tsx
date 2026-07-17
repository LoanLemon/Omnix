import React from "react";
import { Database, Search, Compass, Clock, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MemoryEntry } from "../../lib/memory";

interface FactualTabProps {
  selectedReqId: string;
  setSelectedReqId: (val: string) => void;
  reqIdCounts: { counts: Record<string, number>; defaultCount: number };
  availableReqIds: string[];
  newFactualMemory: string;
  setNewFactualMemory: (val: string) => void;
  isAddingFactual: boolean;
  commitFactualMemory: () => Promise<void>;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  performVectorSearch: () => Promise<void>;
  isSearching: boolean;
  searchResults: MemoryEntry[] | null;
  setSearchResults: (val: MemoryEntry[] | null) => void;
  filteredMemories: MemoryEntry[];
  vectorMemories: MemoryEntry[];
  purgeCurrentBank: () => Promise<void>;
  wipeVectorMemories: () => Promise<void>;
}

export function FactualTab({
  selectedReqId,
  setSelectedReqId,
  reqIdCounts,
  availableReqIds,
  newFactualMemory,
  setNewFactualMemory,
  isAddingFactual,
  commitFactualMemory,
  searchTerm,
  setSearchTerm,
  performVectorSearch,
  isSearching,
  searchResults,
  setSearchResults,
  filteredMemories,
  vectorMemories,
  purgeCurrentBank,
  wipeVectorMemories
}: FactualTabProps) {
  return (
    <div className="space-y-4">
      {/* Memory Bank Selector & Custom Switcher */}
      <div className="p-4 bg-zinc-950/50 border border-border/50 rounded-sm space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-muted-foreground/80">Active Memory Bank</span>
          <span className="text-[7.5px] font-mono text-orange-500/80 font-bold uppercase">Transaction Scope</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Selector */}
          <div className="space-y-1">
            <label className="text-[8px] font-mono uppercase text-muted-foreground/60 block">Select Existing Bank</label>
            <select
              value={selectedReqId}
              onChange={(e) => setSelectedReqId(e.target.value || "default")}
              className="w-full h-8 bg-zinc-900 border border-border/50 text-foreground text-[10px] font-mono rounded-none px-2 focus:outline-none focus:border-orange-500/50 cursor-pointer"
            >
              <option value="default" className="bg-zinc-950 text-foreground text-[10px] font-mono">
                Default / Main Bank ({reqIdCounts.defaultCount})
              </option>
              {availableReqIds.map((reqId) => (
                <option key={reqId} value={reqId} className="bg-zinc-950 text-foreground text-[10px] font-mono">
                  API Scope: {reqId} ({reqIdCounts.counts[reqId] || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Custom input switcher */}
          <div className="space-y-1">
            <label className="text-[8px] font-mono uppercase text-muted-foreground/60 block">Switch to Custom Bank</label>
            <div className="flex gap-1">
              <input
                type="text"
                placeholder="Enter bank ID..."
                id="custom-bank-input"
                className="bg-black/25 text-[10px] font-mono h-8 border border-border/50 px-2 text-foreground tracking-tight rounded-none focus-visible:ring-orange-500/30 flex-1 outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const target = e.currentTarget;
                    const val = target.value.trim();
                    if (val) {
                      setSelectedReqId(val);
                      target.value = "";
                    }
                  }
                }}
              />
              <Button
                onClick={() => {
                  const inputEl = document.getElementById("custom-bank-input") as HTMLInputElement;
                  if (inputEl && inputEl.value.trim()) {
                    setSelectedReqId(inputEl.value.trim());
                    inputEl.value = "";
                  }
                }}
                className="h-8 bg-zinc-900 border border-border hover:bg-orange-500/10 hover:border-orange-500/30 text-[9px] text-muted-foreground hover:text-orange-400 font-mono rounded-none px-2 cursor-pointer shrink-0"
              >
                SWITCH
              </Button>
            </div>
          </div>
        </div>

        {/* Badges of all available scopes to easily click & switch */}
        {availableReqIds.length > 0 && (
          <div className="space-y-1.5 pt-1.5 border-t border-border/20">
            <div className="text-[8px] font-mono uppercase text-muted-foreground/60">Quick Switch Scopes</div>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setSelectedReqId("default")}
                className={`px-1.5 py-0.5 font-mono text-[8.5px] rounded-sm border transition-all ${
                  selectedReqId === "default"
                    ? "bg-orange-500/20 border-orange-500 text-orange-400 font-bold"
                    : "bg-zinc-900/40 border-border/30 text-muted-foreground hover:text-foreground hover:border-orange-500/30"
                }`}
              >
                default ({reqIdCounts.defaultCount})
              </button>
              {availableReqIds.map((reqId) => (
                <button
                  key={reqId}
                  onClick={() => setSelectedReqId(reqId)}
                  className={`px-1.5 py-0.5 font-mono text-[8.5px] rounded-sm border transition-all ${
                    selectedReqId === reqId
                      ? "bg-orange-500/20 border-orange-500 text-orange-400 font-bold"
                      : "bg-zinc-900/40 border-border/30 text-muted-foreground hover:text-foreground hover:border-orange-500/30"
                  }`}
                >
                  {reqId} ({reqIdCounts.counts[reqId] || 0})
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="text-[8.5px] font-mono text-muted-foreground/50 leading-normal pt-1.5 border-t border-border/10">
          {selectedReqId === "default"
            ? "Displaying general/factual memories logged through standard interactions."
            : `Isolated memory segment active for reqId: "${selectedReqId}".`}
        </p>
      </div>

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
            placeholder={
              selectedReqId === "default"
                ? "Type a custom fact or memory (e.g. 'Jane plays guitar and prefers green tea over coffee')..."
                : `Type a fact to ingest into isolated memory bank: "${selectedReqId}"...`
            }
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
            {filteredMemories.length} / {vectorMemories.length} RECORDS
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
          <div className="flex justify-between text-[8px] font-mono text-muted-foreground uppercase tracking-wider font-bold">
            <span>{searchResults !== null ? "Similarity Projection Results" : "Durable Facts (Current Bank)"}</span>
            {searchResults !== null && (
              <button onClick={() => setSearchResults(null)} className="text-orange-500 hover:underline">
                RESET_VIEW
              </button>
            )}
          </div>

          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-0.5 custom-scrollbar">
            {(searchResults || filteredMemories).map((entry, idx) => (
              <div
                key={entry.id || idx}
                className="p-2 bg-black/20 border border-white/5 font-mono text-[9px] leading-relaxed relative group flex flex-col gap-1 rounded-sm"
              >
                <div className="flex justify-between items-center text-[7px] text-muted-foreground/50 font-bold uppercase">
                  <div className="flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 opacity-60" />
                    <span>{new Date(entry.timestamp).toLocaleString()}</span>
                  </div>
                  {searchResults !== null && (
                    <span className="text-emerald-400 bg-emerald-500/5 px-1 py-0.2 rounded border border-emerald-500/10 font-bold">
                      SIM_S: ~{(0.85 - idx * 0.08).toFixed(3)}
                    </span>
                  )}
                </div>
                <div className="text-foreground/95 break-words font-light">{entry.text}</div>
                {entry.metadata?.isolatedRAG && (
                  <div className="text-[7.5px] text-orange-400 font-mono font-semibold uppercase mt-0.5 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-orange-500 rounded-full animate-pulse"></span>
                    BANK: {entry.metadata.isolatedRAG}
                  </div>
                )}
                <div className="text-[7px] text-muted-foreground/30 font-mono tracking-tighter truncate mt-0.5 pr-8">
                  VECT_384D: [{entry.embedding.slice(0, 3).map((n) => n.toFixed(3)).join(", ")} ...]
                </div>
              </div>
            ))}

            {(searchResults || filteredMemories).length === 0 && (
              <div className="text-center py-6 text-muted-foreground/35 italic font-mono text-[9.5px]">
                No semantic facts logged inside this bank yet.
              </div>
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-white/5 flex gap-2 justify-end">
          <Button
            onClick={purgeCurrentBank}
            variant="destructive"
            size="sm"
            className="h-7 rounded-none bg-red-950/10 text-red-400 hover:bg-red-500/10 border border-red-500/25 text-[9px] uppercase tracking-wider font-mono gap-1 cursor-pointer font-bold leading-none"
          >
            <Trash className="w-3 h-3" />
            Purge Current Bank
          </Button>
          <Button
            onClick={wipeVectorMemories}
            variant="destructive"
            size="sm"
            className="h-7 rounded-none bg-red-950/20 text-red-400 hover:bg-red-500/10 border border-red-500/25 text-[9px] uppercase tracking-wider font-mono gap-1 cursor-pointer font-bold leading-none"
          >
            <Trash className="w-3 h-3" />
            Wipe Entire DB
          </Button>
        </div>
      </div>
    </div>
  );
}
