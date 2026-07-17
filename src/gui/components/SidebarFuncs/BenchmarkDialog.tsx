import React, { useState } from "react";
import { Activity, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getRequiredRamForModel, getBestFittingQtype } from "@shared/modelList";

interface CellData {
  val: string;
  bold?: boolean;
}

interface BenchmarkRow {
  score: CellData;
  formatAdherence: CellData;
  logicalReasoning: CellData;
  knowledgeRecall: CellData;
  constraintFollowing: CellData;
  firstPassSuccess: CellData;
  eventualSuccess: CellData;
  fci: CellData;
  avgLatency: CellData;
}

const BENCHMARK_DATA: Record<string, BenchmarkRow> = {
  "gemma-3 1B": {
    score: { val: "65/100 (D)" },
    formatAdherence: { val: "97/100" },
    logicalReasoning: { val: "23/100" },
    knowledgeRecall: { val: "90/100" },
    constraintFollowing: { val: "59/100" },
    firstPassSuccess: { val: "60%" },
    eventualSuccess: { val: "74%" },
    fci: { val: "1.56" },
    avgLatency: { val: "9545ms" }
  },
  "gemma-4-e2b-q4": {
    score: { val: "73/100 (C)" },
    formatAdherence: { val: "100/100", bold: true },
    logicalReasoning: { val: "33/100" },
    knowledgeRecall: { val: "88/100" },
    constraintFollowing: { val: "83/100" },
    firstPassSuccess: { val: "72%" },
    eventualSuccess: { val: "83%" },
    fci: { val: "0.78" },
    avgLatency: { val: "20575ms" }
  },
  "gemma-4-e4b-q4": {
    score: { val: "89/100 (B)", bold: true },
    formatAdherence: { val: "100/100", bold: true },
    logicalReasoning: { val: "67/100", bold: true },
    knowledgeRecall: { val: "100/100", bold: true },
    constraintFollowing: { val: "94/100", bold: true },
    firstPassSuccess: { val: "94%", bold: true },
    eventualSuccess: { val: "94%", bold: true },
    fci: { val: "0.22", bold: true },
    avgLatency: { val: "34308ms" }
  },
  "LFM2-1.2B-ONNX": {
    score: { val: "71/100 (C)" },
    formatAdherence: { val: "86/100" },
    logicalReasoning: { val: "33/100" },
    knowledgeRecall: { val: "100/100", bold: true },
    constraintFollowing: { val: "67/100" },
    firstPassSuccess: { val: "78%" },
    eventualSuccess: { val: "78%" },
    fci: { val: "0.89" },
    avgLatency: { val: "2077ms", bold: true }
  },
  "llama-3.2-1b": {
    score: { val: "55/100 (D)" },
    formatAdherence: { val: "87/100" },
    logicalReasoning: { val: "30/100" },
    knowledgeRecall: { val: "64/100" },
    constraintFollowing: { val: "46/100" },
    firstPassSuccess: { val: "47%" },
    eventualSuccess: { val: "57%" },
    fci: { val: "2.28" },
    avgLatency: { val: "2689ms" }
  },
  "qwen-2.5-coder-3b-text": {
    score: { val: "76/100 (C)" },
    formatAdherence: { val: "94/100" },
    logicalReasoning: { val: "50/100" },
    knowledgeRecall: { val: "95/100" },
    constraintFollowing: { val: "68/100" },
    firstPassSuccess: { val: "72%" },
    eventualSuccess: { val: "87%" },
    fci: { val: "1.11" },
    avgLatency: { val: "3601ms" }
  },
  "llama-3.2-3b-q4": {
    score: { val: "75/100 (C)" },
    formatAdherence: { val: "89/100" },
    logicalReasoning: { val: "37/100" },
    knowledgeRecall: { val: "98/100" },
    constraintFollowing: { val: "84/100" },
    firstPassSuccess: { val: "78%" },
    eventualSuccess: { val: "84%" },
    fci: { val: "0.89" },
    avgLatency: { val: "5559ms" }
  },
  "qwen-3-4b-q4": {
    score: { val: "92/100 (A)", bold: true },
    formatAdherence: { val: "97/100" },
    logicalReasoning: { val: "77/100", bold: true },
    knowledgeRecall: { val: "100/100", bold: true },
    constraintFollowing: { val: "95/100", bold: true },
    firstPassSuccess: { val: "89%" },
    eventualSuccess: { val: "95%", bold: true },
    fci: { val: "0.56" },
    avgLatency: { val: "16140ms" }
  },
  "bonsai-8b-q4": {
    score: { val: "63/100 (D)" },
    formatAdherence: { val: "89/100" },
    logicalReasoning: { val: "13/100" },
    knowledgeRecall: { val: "88/100" },
    constraintFollowing: { val: "76/100" },
    firstPassSuccess: { val: "75%" },
    eventualSuccess: { val: "76%" },
    fci: { val: "1.11" },
    avgLatency: { val: "9721ms" }
  },
  "qwen-3-0.6b-q4-text": {
    score: { val: "71/100 (C)" },
    formatAdherence: { val: "80/100" },
    logicalReasoning: { val: "33/100" },
    knowledgeRecall: { val: "100/100", bold: true },
    constraintFollowing: { val: "73/100" },
    firstPassSuccess: { val: "71%" },
    eventualSuccess: { val: "81%" },
    fci: { val: "1.28" },
    avgLatency: { val: "7474ms" }
  }
};

interface BenchmarkDialogProps {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  modelsInCategory: any[];
  selectedModels: Record<string, string>;
  setSelectedModels: (updater: any) => void;
  selectedQtypes: Record<string, string>;
  setSelectedQtypes: (updater: any) => void;
  systemRam: number;
  isModelLoading: boolean;
  cat: string;
}

export function BenchmarkDialog({
  open,
  onOpenChange,
  modelsInCategory,
  selectedModels,
  setSelectedModels,
  selectedQtypes,
  setSelectedQtypes,
  systemRam,
  isModelLoading,
  cat
}: BenchmarkDialogProps) {
  const [sortColumn, setSortColumn] = useState<string>("score");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const parsePercent = (val: string): number => {
    const match = val.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const getPercentageDetails = (val: string) => {
    const p = parsePercent(val);
    const display = `${p}%`;
    let colorClass = "text-zinc-300"; // neutral
    let bgClass = "bg-zinc-500/5 border border-zinc-500/10";
    if (p < 67) {
      colorClass = "text-red-400 font-medium";
      bgClass = "bg-red-500/10 border border-red-500/20";
    } else if (p < 80) {
      colorClass = "text-yellow-400 font-medium";
      bgClass = "bg-yellow-500/10 border border-yellow-500/20";
    } else if (p > 90) {
      colorClass = "text-emerald-400 font-medium";
      bgClass = "bg-emerald-500/10 border border-emerald-500/20";
    }
    return { p, display, colorClass, bgClass };
  };

  const getLatencyDetails = (val: string) => {
    const match = val.match(/^(\d+)/);
    const ms = match ? parseInt(match[1], 10) : 0;
    const sec = ms / 1000;
    let colorClass = "text-emerald-400 font-medium";
    let bgClass = "bg-emerald-500/10 border border-emerald-500/20";
    if (sec > 8) {
      colorClass = "text-red-400 font-medium";
      bgClass = "bg-red-500/10 border border-red-500/20";
    } else if (sec > 4) {
      colorClass = "text-yellow-400 font-medium";
      bgClass = "bg-yellow-500/10 border border-yellow-500/20";
    }
    return { ms, colorClass, bgClass, display: val };
  };

  const getFciDetails = (val: string) => {
    const fci = parseFloat(val) || 0;
    let colorClass = "text-zinc-300";
    let bgClass = "bg-zinc-500/5 border border-zinc-500/10";
    if (fci < 0.3) {
      colorClass = "text-emerald-400 font-medium";
      bgClass = "bg-emerald-500/10 border border-emerald-500/20";
    } else if (fci > 2) {
      colorClass = "text-red-400 font-medium";
      bgClass = "bg-red-500/10 border border-red-500/20";
    } else if (fci > 1) {
      colorClass = "text-yellow-400 font-medium";
      bgClass = "bg-yellow-500/10 border border-yellow-500/20";
    }
    return { fci, colorClass, bgClass, display: val };
  };

  const getSortValue = (m: any, col: string): number | string => {
    const stats = BENCHMARK_DATA[m.id];
    if (col === "name") return m.name.toLowerCase();
    if (!stats) {
      return col === "avgLatency" ? 999999 : -999999;
    }
    switch (col) {
      case "score":
        return parsePercent(stats.score.val);
      case "formatAdherence":
        return parsePercent(stats.formatAdherence.val);
      case "logicalReasoning":
        return parsePercent(stats.logicalReasoning.val);
      case "knowledgeRecall":
        return parsePercent(stats.knowledgeRecall.val);
      case "constraintFollowing":
        return parsePercent(stats.constraintFollowing.val);
      case "firstPassSuccess":
        return parsePercent(stats.firstPassSuccess.val);
      case "eventualSuccess":
        return parsePercent(stats.eventualSuccess.val);
      case "fci":
        return parseFloat(stats.fci.val) || 0;
      case "avgLatency": {
        const match = stats.avgLatency.val.match(/^(\d+)/);
        return match ? parseInt(match[1], 10) : 999999;
      }
      default:
        return 0;
    }
  };

  const renderSortHeader = (label: string, colKey: string, alignRight = false, tooltip?: string) => {
    const isCurrent = sortColumn === colKey;
    return (
      <th
        onClick={() => {
          if (isCurrent) {
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
          } else {
            setSortColumn(colKey);
            setSortDirection(colKey === "name" || colKey === "avgLatency" || colKey === "fci" ? "asc" : "desc");
          }
        }}
        title={tooltip || label}
        className={`py-2 px-1.5 bg-zinc-900/90 backdrop-blur cursor-pointer select-none transition-colors hover:bg-zinc-800/80 hover:text-orange-400 group ${
          alignRight ? "text-right" : ""
        }`}
      >
        <div className={`flex items-center gap-1 ${alignRight ? "justify-end" : ""}`}>
          <span className="truncate text-[10px]">{label}</span>
          {isCurrent ? (
            sortDirection === "asc" ? (
              <ArrowUp className="w-3 h-3 text-orange-500 shrink-0" />
            ) : (
              <ArrowDown className="w-3 h-3 text-orange-500 shrink-0" />
            )
          ) : (
            <ArrowUpDown className="w-3 h-3 text-zinc-600 opacity-20 group-hover:opacity-100 transition-opacity shrink-0" />
          )}
        </div>
      </th>
    );
  };

  const activeM = modelsInCategory.find((m) => m.id === selectedModels[cat]);
  const stats = activeM ? BENCHMARK_DATA[activeM.id] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            disabled={isModelLoading}
            className="h-7 flex-1 bg-muted/40 dark:bg-black/20 border-border/50 text-[10px] text-foreground font-mono rounded-none group hover:border-orange-500/20 flex items-center justify-between px-2 text-left"
          />
        }
      >
        <span className="truncate">
          {activeM ? (stats ? `${activeM.name} (${stats.score.val})` : activeM.name) : "Select Text Model"}
        </span>
        <span className="text-[8px] bg-orange-500/15 border border-orange-500/20 text-orange-500 px-1 py-0.5 rounded ml-1 uppercase scale-90 font-bold font-mono shrink-0">
          BENCHMARKS
        </span>
      </DialogTrigger>
      <DialogContent className="max-w-5xl sm:max-w-5xl bg-zinc-950 border border-zinc-800 text-zinc-100 font-mono p-6 rounded-lg shadow-2xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-sm font-bold uppercase tracking-wider text-orange-500 flex items-center gap-2">
            <Activity className="w-4 h-4" /> 📊 OMNIX BENCHMARK COMPARISON & MODEL SELECTOR
          </DialogTitle>
          <div className="text-[10px] text-zinc-400 uppercase tracking-wide">
            Select a general text model below to apply it. Scores are derived from standardized reasoning, recall, formatting, and constraint tests.
          </div>
        </DialogHeader>

        <div className="overflow-x-auto border border-zinc-800 rounded bg-black/40 custom-scrollbar max-h-[450px] overflow-y-auto">
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/60 text-[9px] uppercase tracking-wider text-zinc-400 sticky top-0 z-10">
                {renderSortHeader("Model", "name")}
                {renderSortHeader("Latency", "avgLatency", false, "Average Latency")}
                {renderSortHeader("Overall", "score", false, "Overall Score")}
                {renderSortHeader("Formatting", "formatAdherence", false, "Format Adherence")}
                {renderSortHeader("Reasoning", "logicalReasoning", false, "Logical Reasoning")}
                {renderSortHeader("Recall", "knowledgeRecall", false, "Knowledge Recall")}
                {renderSortHeader("Constraints", "constraintFollowing", false, "Constraint Following")}
                {renderSortHeader("1st Pass", "firstPassSuccess", false, "First-Pass Rate")}
                {renderSortHeader("Eventual", "eventualSuccess", false, "Eventual Success")}
                {renderSortHeader("FCI", "fci", false, "Friction Index (FCI)")}
              </tr>
            </thead>
            <tbody>
              {(() => {
                const sortedModels = [...modelsInCategory].sort((a, b) => {
                  const hasStatsA = !!BENCHMARK_DATA[a.id];
                  const hasStatsB = !!BENCHMARK_DATA[b.id];

                  if (sortColumn === null) return 0;

                  if (sortColumn !== "name") {
                    if (!hasStatsA && hasStatsB) return 1;
                    if (hasStatsA && !hasStatsB) return -1;
                    if (!hasStatsA && !hasStatsB) return 0;
                  }

                  const valA = getSortValue(a, sortColumn);
                  const valB = getSortValue(b, sortColumn);

                  if (typeof valA === "string" && typeof valB === "string") {
                    return sortDirection === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
                  } else {
                    return sortDirection === "asc" ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
                  }
                });

                return sortedModels.map((m) => {
                  const modelStats = BENCHMARK_DATA[m.id];
                  const isSelected = selectedModels[cat] === m.id;
                  const fitsAtLeastOneQtype = (m.qtypes || [m.dtype || "q4"]).some((q: string) => getRequiredRamForModel(m, q) <= systemRam);

                  return (
                    <tr
                      key={m.id}
                      onClick={() => {
                        if (!fitsAtLeastOneQtype) return;
                        setSelectedModels((prev: any) => ({ ...prev, [cat]: m.id }));
                        const chosenModel = modelsInCategory.find((model) => model.id === m.id);
                        if (chosenModel) {
                          const currentQtype = selectedQtypes[m.id] || chosenModel.dtype || "q4";
                          if (getRequiredRamForModel(chosenModel, currentQtype) > systemRam) {
                            const bestQ = getBestFittingQtype(chosenModel, systemRam);
                            setSelectedQtypes((prevQ: any) => ({ ...prevQ, [m.id]: bestQ }));
                          }
                        }
                        onOpenChange(false);
                      }}
                      className={`border-b border-zinc-900/50 transition-colors ${
                        !fitsAtLeastOneQtype
                          ? "opacity-40 cursor-not-allowed bg-zinc-950"
                          : isSelected
                          ? "bg-orange-500/10 text-orange-400 border-l-2 border-l-orange-500 font-medium cursor-pointer"
                          : "hover:bg-zinc-900/30 cursor-pointer text-zinc-300"
                      }`}
                    >
                      <td className="py-2 px-1.5">
                        <div className="flex flex-col">
                          <span className="font-semibold text-[11px] truncate max-w-[150px]">{m.name}</span>
                          <span className="text-[9px] text-zinc-500 font-normal mt-0.5 max-w-[150px] truncate" title={m.description}>
                            {m.description}
                          </span>
                          {!fitsAtLeastOneQtype && (
                            <span className="text-[8px] text-red-500 font-bold uppercase mt-1 leading-tight">
                              (LOW_RAM: &gt;=
                              {Math.ceil(Math.min(...(m.qtypes || [m.dtype || "q4"]).map((q: string) => getRequiredRamForModel(m, q))))}G)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-1.5 text-left">
                        {modelStats ? (
                          (() => {
                            const { display, colorClass, bgClass } = getLatencyDetails(modelStats.avgLatency.val);
                            return <span className={`px-1.5 py-0.5 rounded border text-[10px] inline-block ${bgClass} ${colorClass}`}>{display}</span>;
                          })()
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-2 px-1.5">
                        {modelStats ? (
                          (() => {
                            const { display, colorClass, bgClass } = getPercentageDetails(modelStats.score.val);
                            return <span className={`px-1.5 py-0.5 rounded border text-[10px] inline-block ${bgClass} ${colorClass}`}>{display}</span>;
                          })()
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-2 px-1.5">
                        {modelStats ? (
                          (() => {
                            const { display, colorClass, bgClass } = getPercentageDetails(modelStats.formatAdherence.val);
                            return <span className={`px-1.5 py-0.5 rounded border text-[10px] inline-block ${bgClass} ${colorClass}`}>{display}</span>;
                          })()
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-2 px-1.5">
                        {modelStats ? (
                          (() => {
                            const { display, colorClass, bgClass } = getPercentageDetails(modelStats.logicalReasoning.val);
                            return <span className={`px-1.5 py-0.5 rounded border text-[10px] inline-block ${bgClass} ${colorClass}`}>{display}</span>;
                          })()
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-2 px-1.5">
                        {modelStats ? (
                          (() => {
                            const { display, colorClass, bgClass } = getPercentageDetails(modelStats.knowledgeRecall.val);
                            return <span className={`px-1.5 py-0.5 rounded border text-[10px] inline-block ${bgClass} ${colorClass}`}>{display}</span>;
                          })()
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-2 px-1.5">
                        {modelStats ? (
                          (() => {
                            const { display, colorClass, bgClass } = getPercentageDetails(modelStats.constraintFollowing.val);
                            return <span className={`px-1.5 py-0.5 rounded border text-[10px] inline-block ${bgClass} ${colorClass}`}>{display}</span>;
                          })()
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-2 px-1.5">
                        {modelStats ? (
                          (() => {
                            const { display, colorClass, bgClass } = getPercentageDetails(modelStats.firstPassSuccess.val);
                            return <span className={`px-1.5 py-0.5 rounded border text-[10px] inline-block ${bgClass} ${colorClass}`}>{display}</span>;
                          })()
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-2 px-1.5">
                        {modelStats ? (
                          (() => {
                            const { display, colorClass, bgClass } = getPercentageDetails(modelStats.eventualSuccess.val);
                            return <span className={`px-1.5 py-0.5 rounded border text-[10px] inline-block ${bgClass} ${colorClass}`}>{display}</span>;
                          })()
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="py-2 px-1.5">
                        {modelStats ? (
                          (() => {
                            const { display, colorClass, bgClass } = getFciDetails(modelStats.fci.val);
                            return <span className={`px-1.5 py-0.5 rounded border text-[10px] inline-block ${bgClass} ${colorClass}`}>{display}</span>;
                          })()
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
