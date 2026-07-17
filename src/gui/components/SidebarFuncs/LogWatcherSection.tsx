import { useState, useEffect } from "react";
import { Eye, Plus, Trash2, FileText, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LogWatcherSection() {
  const [filepaths, setFilepaths] = useState<string[]>([]);
  const [enabled, setEnabled] = useState<boolean>(false);
  const [newPath, setNewPath] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getApiUrl = (endpoint: string) => {
    const isElectron = typeof window !== "undefined" && !!(window as any).electron;
    if (isElectron) {
      const electronPort = (window as any).electron.server?.getPort ? (window as any).electron.server.getPort() : '9777';
      return `http://localhost:${electronPort}${endpoint}`;
    }
    return endpoint;
  };

  // Fetch initial config
  useEffect(() => {
    let active = true;
    const fetchConfig = async () => {
      try {
        const res = await fetch(getApiUrl("/api/log-watcher/config"));
        if (!res.ok) throw new Error("Failed to load Log Watcher configuration");
        const data = await res.json();
        if (active) {
          setFilepaths(data.filepaths || []);
          setEnabled(data.enabled || false);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    fetchConfig();
    return () => {
      active = false;
    };
  }, []);

  // Save config helper
  const saveConfig = async (updatedPaths: string[], updatedEnabled: boolean) => {
    try {
      setError(null);
      const res = await fetch(getApiUrl("/api/log-watcher/config"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ filepaths: updatedPaths, enabled: updatedEnabled })
      });
      if (!res.ok) throw new Error("Failed to save Log Watcher configuration");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggle = async (val: boolean) => {
    setEnabled(val);
    await saveConfig(filepaths, val);
  };

  const handleAddPath = async () => {
    const trimmed = newPath.trim();
    if (!trimmed) return;
    if (filepaths.includes(trimmed)) {
      setError("Filepath is already in the queue");
      return;
    }
    const updated = [...filepaths, trimmed];
    setFilepaths(updated);
    setNewPath("");
    await saveConfig(updated, enabled);
  };

  const handleRemovePath = async (pathToRemove: string) => {
    const updated = filepaths.filter(p => p !== pathToRemove);
    setFilepaths(updated);
    await saveConfig(updated, enabled);
  };

  return (
    <section id="sidebar-log-watcher" className="space-y-4 border-t border-border/30 pt-6">
      <div className="flex items-center justify-between text-muted-foreground/60 px-1">
        <div className="flex items-center gap-2">
          <Eye className={`w-3 h-3 ${enabled ? "text-orange-500 animate-pulse" : ""}`} />
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] font-mono italic">LOG_WATCHER</span>
        </div>
        <div className="flex items-center gap-1.5">
          {loading ? (
            <Loader2 className="w-2.5 h-2.5 animate-spin opacity-50" />
          ) : (
            <Switch
              checked={enabled}
              onCheckedChange={handleToggle}
              className="scale-75 data-[state=checked]:bg-orange-600 ml-[-4px]"
            />
          )}
        </div>
      </div>

      <div className="space-y-3">
        {/* Error message */}
        {error && (
          <div className="text-[8px] text-red-500 font-mono bg-red-500/5 border border-red-500/15 p-1.5 rounded-sm">
            {error}
          </div>
        )}

        {/* Path queue list */}
        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
          {filepaths.length === 0 ? (
            <div className="text-[9px] text-muted-foreground/40 font-mono italic p-2 text-center border border-dashed border-border/30 rounded-sm">
              No files in watcher queue
            </div>
          ) : (
            filepaths.map((path) => (
              <div 
                key={path} 
                className="flex items-center justify-between gap-2 p-1.5 bg-zinc-950 border border-border/30 rounded-sm hover:border-orange-500/20 group"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <FileText className="w-3 h-3 text-orange-500/50 shrink-0" />
                  <span className="text-[9px] font-mono truncate text-muted-foreground group-hover:text-foreground" title={path}>
                    {path}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4.5 w-4.5 text-muted-foreground/50 hover:text-red-500 transition-colors shrink-0"
                  onClick={() => handleRemovePath(path)}
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Input box to add path */}
        <div className="flex gap-1.5">
          <Input
            value={newPath}
            onChange={(e) => setNewPath(e.target.value)}
            placeholder="Add absolute file path..."
            className="h-7 text-[9px] font-mono bg-zinc-900 border-border/50 text-foreground placeholder:text-muted-foreground/40 rounded-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddPath();
              }
            }}
          />
          <Button 
            variant="outline" 
            className="h-7 px-2 border-border/50 hover:border-orange-500/30 hover:bg-orange-500/5 text-orange-500 rounded-sm font-mono text-[9px]"
            onClick={handleAddPath}
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
