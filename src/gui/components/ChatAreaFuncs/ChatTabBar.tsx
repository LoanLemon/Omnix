import { Plus, Clock, Activity, Monitor, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";

interface ChatTabBarProps {
  chatTabs: any[];
  activeTabId: any;
  selectTab: (id: any) => void;
  openNewTab: (isTemp: boolean) => void;
  closeTab: (id: any) => void;
  renameTab: (id: any, name: string) => void;
  enableMMRS: boolean;
  isCoderMode: boolean;
  mmrsMode: "operational" | "bob" | "duality" | "polarity";
  setMmrsMode: (mode: "operational" | "bob" | "duality" | "polarity") => void;
  livePermissionError: boolean;
  setLivePermissionError: (val: boolean) => void;
}

export function ChatTabBar({
  chatTabs,
  activeTabId,
  selectTab,
  openNewTab,
  closeTab,
  renameTab,
  enableMMRS,
  isCoderMode,
  mmrsMode,
  setMmrsMode,
  livePermissionError,
  setLivePermissionError,
}: ChatTabBarProps) {
  const handleMmrsModeToggle = () => {
    const modes: ("operational" | "bob" | "duality" | "polarity")[] = ["operational", "bob", "duality", "polarity"];
    const currentIndex = modes.indexOf(mmrsMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setMmrsMode(modes[nextIndex]);
  };

  const mmrsModeLabels = {
    "operational": "Operational Mode",
    "bob": "Best Of Both (Bob)",
    "duality": "Duality",
    "polarity": "Polarity"
  };

  const handleExportTab = (tab: any) => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(tab, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute(
      "download",
      `${tab.name.replace(/\s+/g, "_")}_export.json`,
    );
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleRelabelTab = (tabId: string, currentName: string) => {
    const newName = window.prompt("Enter new tab name:", currentName);
    if (newName && newName.trim() !== "") {
      renameTab(tabId, newName.trim());
    }
  };

  return (
    <>
      {/* Horizontally scrolling tab bar */}
      <div className="flex items-center justify-between border-b border-border/30 bg-muted/5 shrink-0 px-4 py-2 mt-1 select-none overflow-x-auto gap-2 scrollbar-none">
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-[80%] scrollbar-none py-1">
          {(chatTabs || []).map((tab: any) => {
            const isActive = tab.id === activeTabId;
            const isTemp = tab.isTemporary || String(tab.id).startsWith("-");
            return (
              <ContextMenu key={tab.id}>
                <ContextMenuTrigger
                  onClick={() => selectTab(tab.id)}
                  className={`group flex items-center gap-2 h-7 px-3 rounded-md text-xs border font-mono transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-zinc-900 border-orange-500/50 text-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.1)] font-bold"
                      : "bg-transparent border-zinc-800 text-muted-foreground hover:bg-zinc-800/30 hover:text-foreground"
                  }`}
                >
                  {isTemp ? (
                    <span className="flex items-center gap-1 text-[8px] px-1 py-0.5 rounded bg-red-950/40 border border-red-500/20 text-red-400 font-extrabold uppercase animate-pulse">
                      TEMP
                    </span>
                  ) : (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.6)]" : "bg-zinc-600"}`}
                    />
                  )}

                  <span className="truncate max-w-[100px]" title={tab.name}>
                    {tab.name}
                  </span>

                  {/* Close Button unless it's the last one remaining */}
                  {(chatTabs || []).length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        closeTab(tab.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 h-4 w-4 rounded-full flex items-center justify-center hover:bg-zinc-800 hover:text-red-500 text-zinc-500 transition-all text-[10px]"
                      title="Close and purge tab"
                    >
                      ×
                    </button>
                  )}
                </ContextMenuTrigger>
                <ContextMenuContent className="w-48 bg-zinc-950 border-zinc-800 text-zinc-300 font-mono text-xs">
                  <ContextMenuItem
                    className="focus:bg-zinc-900 focus:text-white cursor-pointer"
                    onClick={() => handleRelabelTab(tab.id, tab.name)}
                  >
                    Relabel
                  </ContextMenuItem>
                  <ContextMenuItem
                    className="focus:bg-zinc-900 focus:text-white cursor-pointer"
                    onClick={() => handleExportTab(tab)}
                  >
                    Export
                  </ContextMenuItem>
                  {(chatTabs || []).length > 1 && (
                    <>
                      <ContextMenuSeparator className="bg-zinc-800" />
                      <ContextMenuItem
                        className="focus:bg-red-950 focus:text-red-400 text-red-400 cursor-pointer"
                        onClick={() => closeTab(tab.id)}
                      >
                        Close
                      </ContextMenuItem>
                    </>
                  )}
                </ContextMenuContent>
              </ContextMenu>
            );
          })}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openNewTab(false)}
            className="h-7 px-2 bg-zinc-900 border border-border/40 hover:bg-accent text-[9px] font-mono hover:text-orange-500 font-bold flex items-center gap-1"
            title="Open a new standard archived chat tab (id: 0)"
          >
            <Plus className="w-3 h-3 text-orange-500" />
            <span>+ CHAT</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openNewTab(true)}
            className="h-7 px-2 bg-zinc-900/40 border border-red-950/30 hover:bg-red-950/20 text-[9px] font-mono hover:text-red-400 text-zinc-400 hover:border-red-500/30 flex items-center gap-1"
            title="Open a temporary session. Purged on close/API response!"
          >
            <Clock className="w-3 h-3 text-red-500/70" />
            <span>+ TEMP</span>
          </Button>
        </div>
      </div>

      {enableMMRS && !isCoderMode && (
        <div className="border-b border-border/30 bg-muted/10 backdrop-blur-md shrink-0 transition-all duration-300">
          <div className="max-w-2xl mx-auto px-6 py-2 flex flex-col items-center justify-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMmrsModeToggle}
              className="text-[10px] font-mono h-6 bg-zinc-900/50 border-orange-500/30 text-orange-500 hover:bg-orange-500/10 transition-colors flex items-center gap-2 rounded-full px-4"
              title="Toggle MMRS Interaction Mode"
            >
              <Activity className="w-3 h-3" />
              <span>MMRS MODE: {mmrsModeLabels[mmrsMode]}</span>
            </Button>
            <span className="text-[9px] font-mono text-muted-foreground/60 max-w-[80%] text-center leading-tight">
              {mmrsMode === "operational" && "Uses Operational Mode model and only uses the MMRS to generate images/music"}
              {mmrsMode === "bob" && "Prompts both models, then asks both models to pick their favorite response. Retries until consensus."}
              {mmrsMode === "duality" && "Prompts Operational Model, then allows MMRS model to also include their response"}
              {mmrsMode === "polarity" && "Prompts Operational Model, then MMRS model provides a dissenting or opposing response"}
            </span>
          </div>
        </div>
      )}

      {livePermissionError && (
        <div className="mx-6 mt-4 p-4 rounded bg-red-950/35 border border-red-500/20 text-foreground relative z-10 animate-in fade-in duration-300">
          <div className="flex gap-3">
            <div className="p-1.5 rounded bg-red-500/10 text-red-400 h-fit">
              <Monitor className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-red-400">
                Screen Share Permission Denied or Not Supported
              </h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed uppercase">
                Please allow screen capture permission when prompted. If the
                prompt does not appear, or you face any issues, you can also
                open the application in a new tab.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <a
                  href={window.location.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-mono font-bold bg-orange-500 hover:bg-orange-600 text-black rounded transition-all"
                >
                  <ExternalLink className="w-3 h-3 text-black" />
                  OPEN OMNIX IN NEW TAB
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2.5 text-[9px] font-mono hover:text-foreground text-zinc-500 hover:bg-zinc-800/30"
                  onClick={() => setLivePermissionError(false)}
                >
                  DISMISS
                </Button>
              </div>
            </div>
            <button
              onClick={() => setLivePermissionError(false)}
              className="text-zinc-500 hover:text-foreground transition-colors text-sm font-mono self-start"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
