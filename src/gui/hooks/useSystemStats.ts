import { useState, useEffect, useCallback } from "react";
import { browserEngine } from "../lib/ModelEngine";

export function useSystemStats(addLog: (msg: string, type?: "info" | "error" | "success") => void) {
  const [systemRam, setSystemRam] = useState<number>(8);
  const [isRamDetected, setIsRamDetected] = useState(false);
  const [isElectron, setIsElectron] = useState(false);
  const [isWorkerMode, setIsWorkerMode] = useState(false);
  const [heapUsage, setHeapUsage] = useState<{ used: number; limit: number }>({ used: 0, limit: 0 });
  const [memoryUsage, setMemoryUsage] = useState<{ used: number; total: number }>({ used: 0, total: 0 });
  const [hasWebGPU, setHasWebGPU] = useState<boolean>(false);

  useEffect(() => {
    const checkWebGPU = async () => {
      if (!navigator.gpu) {
        addLog("WebGPU not supported. Using CPU fallback.", "error");
        setHasWebGPU(false);
        return;
      }
      try {
        const adapter = await navigator.gpu.requestAdapter();
        if (adapter) {
          addLog("WebGPU Accelerator Ready", "success");
          setHasWebGPU(true);
        }
      } catch (err) {
        setHasWebGPU(false);
      }
    };
    checkWebGPU();

    const isElectronEnv = !!(window as any).electron;
    setIsElectron(isElectronEnv);

    const params = new URLSearchParams(window.location.search);
    const isWorker = params.get("mode") === "worker";
    setIsWorkerMode(isWorker);

    let ramGb = 8;
    if (isElectronEnv) {
      (window as any).electron.os.getMemoryStats().then((stats: any) => {
        setSystemRam(stats.totalGB);
        setIsRamDetected(true);
        addLog(`Electron mode. physical RAM: ${stats.totalGB}GB`, "success");
      });
    } else if ("deviceMemory" in navigator) {
      const detectedRam = (navigator as any).deviceMemory;
      ramGb = detectedRam;
      setSystemRam(detectedRam);
      setIsRamDetected(true);
    } else {
      setIsRamDetected(true);
    }

    const interval = setInterval(() => {
      const weightsBytes = browserEngine.getEstimatedLoadedWeightsBytes();
      let usedJSHeapBytes = 0;

      if ((performance as any).memory) {
        const mem = (performance as any).memory;
        usedJSHeapBytes = mem.usedJSHeapSize;
        setHeapUsage({
          used: Math.round(mem.usedJSHeapSize / 1024 / 1024),
          limit: Math.round(mem.jsHeapSizeLimit / 1024 / 1024)
        });
      } else {
        usedJSHeapBytes = 150 * 1024 * 1024;
        setHeapUsage({
          used: 150,
          limit: 4096
        });
      }

      const totalBytes = ramGb * 1024 * 1024 * 1024;
      const totalUsedBytes = usedJSHeapBytes + weightsBytes;

      setMemoryUsage({
        used: totalUsedBytes,
        total: totalBytes
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [addLog]);

  return {
    systemRam,
    isRamDetected,
    isElectron,
    isWorkerMode,
    heapUsage,
    memoryUsage,
    setMemoryUsage,
    hasWebGPU
  };
}
