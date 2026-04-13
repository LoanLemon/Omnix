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
}

export function ErrorOverlay({
  error,
  setError,
  setDidError,
  loadModel,
  clearCache
}: ErrorOverlayProps) {
  const isOOMError = error?.toLowerCase().includes("bad_alloc") || 
                    error?.toLowerCase().includes("out of memory") ||
                    error?.toLowerCase().includes("memory") ||
                    error?.toLowerCase().includes("array buffer") ||
                    error?.toLowerCase().includes("std::bad_alloc");
  
  const isQuotaError = error?.toLowerCase().includes("quota") || 
                      error?.toLowerCase().includes("disk") ||
                      error?.toLowerCase().includes("space");

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
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4" />
                {isOOMError ? "Memory Exhausted" : isQuotaError ? "Storage Limit Reached" : "Engine Error"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 text-xs opacity-80 leading-relaxed">
              {error}
              {isOOMError && (
                <p className="mt-2 text-red-400 font-bold">
                  This model is too large for your browser's memory. Try a smaller model (e.g., Qwen 0.5B or Gemma 2B).
                </p>
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
