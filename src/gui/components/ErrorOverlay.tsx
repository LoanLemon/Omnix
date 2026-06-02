import { motion, AnimatePresence } from "motion/react";
import { Activity } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ErrorOverlayProps {
  error: string | null;
  setError: (val: string | null) => void;
  setDidError: (val: boolean) => void;
  loadModel: (cat: string) => void;
  clearCache: () => void;
  safeMode: boolean;
  setSafeMode: (val: boolean) => void;
}

export function ErrorOverlay({
  error,
  setError,
  setDidError,
  loadModel,
  clearCache,
  safeMode,
  setSafeMode
}: ErrorOverlayProps) {
  const isOOMError = error?.toLowerCase().includes("bad_alloc") || 
                    error?.toLowerCase().includes("out of memory") ||
                    error?.toLowerCase().includes("memory") ||
                    error?.toLowerCase().includes("array buffer") ||
                    error?.toLowerCase().includes("std::bad_alloc") ||
                    error?.includes("11514632");
  
  const isQuotaError = error?.toLowerCase().includes("quota") || 
                      error?.toLowerCase().includes("disk") || 
                      error?.toLowerCase().includes("space");

  const isGPUError = error?.toLowerCase().includes("gpu") || 
                    error?.toLowerCase().includes("adapter") || 
                    error?.toLowerCase().includes("backend found") ||
                    error?.toLowerCase().includes("failed to get gpu") ||
                    error?.toLowerCase().includes("webgpu") ||
                    error?.toLowerCase().includes("device lost") ||
                    error?.toLowerCase().includes("gpudevice");

  return (
    <AnimatePresence>
      {error && (
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
        >
          <Card className="bg-red-950/90 border-red-500/50 backdrop-blur-xl text-red-200 shadow-2xl">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2 font-mono uppercase tracking-widest text-red-400">
                <Activity className="w-3 h-3" />
                {isGPUError ? "DEVICE_NOT_FOUND" : isOOMError ? "CORE_MEMORY_FAILURE" : isQuotaError ? "STORAGE_OVERFLOW" : "ENGINE_EXCEPTION"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-[10px] font-mono opacity-80 leading-relaxed break-all">
              {error}
              {isGPUError && (
                <div className="mt-3 p-2 bg-red-900/40 border border-red-500/30 rounded text-[9px] space-y-1">
                  <p className="font-bold text-red-100 uppercase">GPU Device Recovery Protocol:</p>
                  <p>WebGPU accelerator could not find an available GPU adapter, or your GPU driver crashed/lost context. Enable Safe Engine Mode to run on highly stable CPU-based WebAssembly (slower but guaranteed compilation).</p>
                  {!safeMode && (
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-blue-300 decoration-blue-300/50 hover:text-blue-200 text-[9px]"
                      onClick={() => setSafeMode(true)}
                    >
                      {">"} ACTIVATE_SAFE_STACK_MODE
                    </Button>
                  )}
                </div>
              )}
              {isOOMError && !isGPUError && (
                <div className="mt-3 p-2 bg-red-900/40 border border-red-500/30 rounded text-[9px] space-y-1">
                  <p className="font-bold text-red-100 uppercase">Recovery Protocol Suggestion:</p>
                  <p>Model size exceeds current buffer. Enable Safe Engine Mode to force single-thread WASM stack (highly stable, slower).</p>
                  {!safeMode && (
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-blue-300 decoration-blue-300/50 hover:text-blue-200 text-[9px]"
                      onClick={() => setSafeMode(true)}
                    >
                      {">"} ACTIVATE_SAFE_STACK_MODE
                    </Button>
                  )}
                </div>
              )}
              {isQuotaError && (
                <p className="mt-2 text-red-400 font-bold">
                  Your browser has run out of storage space for models. Try clearing the model cache using the database icon at the top.
                </p>
              )}
            </CardContent>
            <CardFooter className="p-3 bg-red-900/20 flex justify-end gap-2">
              <Button variant="ghost" size="sm" className="h-7 text-[10px] hover:bg-red-500/20" onClick={() => { setError(null); setDidError(false); }}>Dismiss</Button>
              {!isQuotaError && <Button variant="outline" size="sm" className="h-7 text-[10px] border-red-500/50 hover:bg-red-500/20" onClick={() => loadModel("text")}>Retry Load</Button>}
              {isQuotaError && <Button variant="destructive" size="sm" className="h-7 text-[10px]" onClick={clearCache}>Clear Cache</Button>}
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
