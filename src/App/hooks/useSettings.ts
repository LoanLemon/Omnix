import { useState, useEffect } from "react";

export function useSettings() {
  const [ramLimitPercent, setRamLimitPercent] = useState<number>(() => {
    const saved = localStorage.getItem("omnix_ram_limit");
    return saved ? parseInt(saved, 10) : 66;
  });

  const [enableRAG, setEnableRAG] = useState<boolean>(() => {
    const saved = localStorage.getItem("omnix_enable_rag");
    return saved === "true";
  });

  const [speakEnabled, setSpeakEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("omnix_speak_enabled");
    return saved === "true";
  });

  const [chatMode, setChatMode] = useState<"default" | "discuss" | "edit">(() => {
    const saved = localStorage.getItem("omnix_chat_mode");
    return (saved as any) || "default";
  });

  const [liveModeTimer, setLiveModeTimer] = useState<number>(() => {
    const saved = localStorage.getItem("omnix_live_mode_timer");
    return saved ? parseInt(saved, 10) : 15;
  });

  useEffect(() => {
    localStorage.setItem("omnix_ram_limit", ramLimitPercent.toString());
  }, [ramLimitPercent]);

  useEffect(() => {
    localStorage.setItem("omnix_enable_rag", enableRAG.toString());
  }, [enableRAG]);

  useEffect(() => {
    localStorage.setItem("omnix_speak_enabled", speakEnabled.toString());
  }, [speakEnabled]);

  useEffect(() => {
    localStorage.setItem("omnix_chat_mode", chatMode);
  }, [chatMode]);

  useEffect(() => {
    localStorage.setItem("omnix_live_mode_timer", liveModeTimer.toString());
  }, [liveModeTimer]);

  return {
    ramLimitPercent,
    setRamLimitPercent,
    enableRAG,
    setEnableRAG,
    speakEnabled,
    setSpeakEnabled,
    chatMode,
    setChatMode,
    liveModeTimer,
    setLiveModeTimer,
  };
}
