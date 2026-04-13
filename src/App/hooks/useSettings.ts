import { useState, useEffect } from "react";
import { ChatMode } from "../types";

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

  const [chatMode, setChatMode] = useState<ChatMode>(() => {
    const saved = localStorage.getItem("omnix_chat_mode");
    return (saved as ChatMode) || "director";
  });

  const [liveModeTimer, setLiveModeTimer] = useState<number>(() => {
    const saved = localStorage.getItem("omnix_live_mode_timer");
    return saved ? parseInt(saved, 10) : 15;
  });

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("omnix_theme");
    if (saved) return saved as "light" | "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
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

  useEffect(() => {
    localStorage.setItem("omnix_theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

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
    theme,
    setTheme,
  };
}
