import { useState, useEffect, useRef, useCallback } from "react";
import { Message } from "@shared/types";
import { browserEngine } from "@/lib/ModelEngine";

export function useSocketInference(
  addLog: (msg: string, type?: "info" | "error" | "success") => void,
  setIsModelReady: (val: boolean) => void,
  setIsModelLoading: (val: boolean) => void,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setLoadingProgress: React.Dispatch<React.SetStateAction<Record<string, { progress: number; status: string }>>>,
  setWorkerCount: (count: number) => void,
  enableRelayMode: boolean
) {
  const socketRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!enableRelayMode) {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      setIsConnected(false);
      setWorkerCount(0);
      return;
    }

    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      const origin = window.location.origin;
      const host = window.location.host;
      const protocol = window.location.protocol;
      
      let wsUrl: string;
      if (origin && origin.startsWith('http')) {
        const baseWs = origin.replace(/^http/, 'ws');
        wsUrl = `${baseWs}/ws-active-compute`;
      } else if (host) {
        const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
        wsUrl = `${wsProtocol}//${host}/ws-active-compute`;
      } else {
        wsUrl = 'ws://127.0.0.1:3000/ws-active-compute';
      }

      console.log(`🔌 WebSocket Connection: ${wsUrl}`);
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = async () => {
        setIsConnected(true);
        addLog(`Omnix Bridge: Connected to Relay`, "success");

        const hasWebGPU = !!navigator.gpu;
        const capabilities = ["text"];
        if (hasWebGPU) capabilities.push("webgpu");
        
        socket.send(JSON.stringify({
          type: "REGISTER",
          metadata: {
            type: window.navigator.userAgent.toLowerCase().includes('electron') ? "electron" : "browser",
            capabilities
          }
        }));

        const hbInterval = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "HEARTBEAT" }));
          }
        }, 10000);
        (socket as any)._hbInterval = hbInterval;
      };

      let activeTaskCount = 0;

      socket.onmessage = async (event) => {
        const payload = JSON.parse(event.data);
        const { type, requestId, category, input, options, workerCount, output, error } = payload;

        if (type === "NETWORK_STATS") {
          setWorkerCount(workerCount || 0);
          return;
        }

        if (type === "REMOTE_TASK") {
          addLog(`🌐 Remote Task Received: ${category}`, "info");
          activeTaskCount++;
          socket.send(JSON.stringify({ type: "STATUS_UPDATE", activeTasks: activeTaskCount }));

          try {
            setIsModelLoading(true);

            let finalInput = input;
            if (category === "stt" && typeof input === "string") {
              addLog("Converting STT input from Base64 to Float32Array...", "info");
              try {
                const binaryString = window.atob(input);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
                }
                finalInput = new Float32Array(bytes.buffer);
              } catch (convErr: any) {
                console.error("Failed to decode base64 STT payload:", convErr);
                addLog(`Engine STT Decode Error: ${convErr?.message || String(convErr)}`, "error");
              }
            }

            const result = await browserEngine.runInference(category, finalInput, {
              ...options,
              progress_callback: (p: any) => {
                if (p.status === "progress") {
                  setLoadingProgress(prev => ({
                    ...prev,
                    [p.file]: { progress: p.progress, status: `Downloading ${p.file}` }
                  }));
                }
                if (socket.readyState === WebSocket.OPEN) {
                  socket.send(JSON.stringify({ type: "PROGRESS_UPDATE", requestId, progress: p }));
                }
              }
            });
            
            setLoadingProgress({});
            setIsModelLoading(false);
            
            socket.send(JSON.stringify({ type: "TASK_RESULT", requestId, output: result }));
            addLog(`✅ Remote Task Completed: ${requestId.substring(0, 8)}`, "success");
          } catch (err: any) {
            addLog(`❌ Remote Task Failed: ${err?.message || String(err)}`, "error");
            socket.send(JSON.stringify({ type: "TASK_RESULT", requestId, error: err?.message || String(err) }));
          } finally {
            activeTaskCount = Math.max(0, activeTaskCount - 1);
            socket.send(JSON.stringify({ type: "STATUS_UPDATE", activeTasks: activeTaskCount }));
          }
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
        if ((socket as any)._hbInterval) clearInterval((socket as any)._hbInterval);
        addLog("Omnix Bridge: Disconnected. Retrying in 5s...", "error");
        reconnectTimeout = setTimeout(connect, 5000);
      };

      socket.onerror = (err) => {
        console.error("WebSocket Error:", err);
        socket.close();
      };
    };

    connect();

    return () => {
      if (socketRef.current) socketRef.current.close();
      clearTimeout(reconnectTimeout);
    };
  }, [addLog, setIsModelLoading, setLoadingProgress, setWorkerCount, enableRelayMode]);

  const sendInference = useCallback((payload: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.send(JSON.stringify({ type: "GENERATE", ...payload }));
    }
  }, [isConnected]);

  return { isConnected, sendInference };
}
