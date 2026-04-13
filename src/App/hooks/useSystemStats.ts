import { useState, useEffect, useCallback } from "react";

export function useSystemStats(addLog: (msg: string, type?: "info" | "error" | "success") => void) {
  const [systemRam, setSystemRam] = useState<number>(8);
  const [isRamDetected, setIsRamDetected] = useState(false);
  const [isElectron, setIsElectron] = useState(false);
  const [heapUsage, setHeapUsage] = useState<{ used: number; limit: number }>({ used: 0, limit: 0 });
  const [memoryUsage, setMemoryUsage] = useState<{ used: number; total: number }>({ used: 0, total: 0 });

  useEffect(() => {
    const isElectronEnv = !!(window as any).electron;
    setIsElectron(isElectronEnv);

    if (isElectronEnv) {
      (window as any).electron.os.getMemoryStats().then((stats: any) => {
        setSystemRam(stats.totalGB);
        setIsRamDetected(true);
        addLog(`Electron detected. Physical RAM: ${stats.totalGB}GB. V8 Limits Unrestricted.`, "success");
      });

      const memoryInterval = setInterval(async () => {
        try {
          const stats = await (window as any).electron.os.getMemoryStats();
          setHeapUsage({
            used: stats.usedMB,
            limit: stats.totalMB
          });
        } catch (e) {
          console.error("Failed to fetch OS memory stats");
        }
      }, 2000);

      return () => clearInterval(memoryInterval);

    } else if ("deviceMemory" in navigator) {
      const detectedRam = (navigator as any).deviceMemory;
      const ua = navigator.userAgent;
      const isChrome = /Chrome/.test(ua) && /Google Inc/.test(navigator.vendor) && !/Edg/.test(ua);
      const isEdge = /Edg/.test(ua);
      const isFirefox = /Firefox/.test(ua);
      const isSupportedBrowser = isChrome || isEdge || isFirefox;
      
      // If in a supported browser, be more lenient on low-RAM devices
      // If RAM is 2GB or less, use full detected amount. Otherwise, cut for stability but keep at least 2GB.
      const usableRam = isSupportedBrowser 
        ? (detectedRam <= 2 ? detectedRam : Math.max(2, Math.floor(detectedRam / 2)))
        : detectedRam;
      
      setSystemRam(usableRam);
      setIsRamDetected(true);
      
      if (isSupportedBrowser) {
        const browserName = isEdge ? "Edge" : isFirefox ? "Firefox" : "Chrome";
        addLog(`${browserName} detected. Adjusted usable RAM from ${detectedRam}GB to ${usableRam}GB for stability.`, "info");
      } else {
        addLog(`System RAM detected: ~${detectedRam}GB`, "info");
      }
    } else {
      setIsRamDetected(true);
      addLog("RAM detection not supported, using default limits", "info");
    }

    const heapInterval = setInterval(() => {
      if ((performance as any).memory) {
        const mem = (performance as any).memory;
        setHeapUsage({
          used: Math.round(mem.usedJSHeapSize / 1024 / 1024),
          limit: Math.round(mem.jsHeapSizeLimit / 1024 / 1024)
        });
      }
    }, 2000);

    return () => clearInterval(heapInterval);
  }, [addLog]);

  return {
    systemRam,
    isRamDetected,
    isElectron,
    heapUsage,
    memoryUsage,
    setMemoryUsage
  };
}
