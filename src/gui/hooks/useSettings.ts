import { useState, useEffect } from "react";
import { ChatMode } from "@shared/types";

export function useSettings() {
  const [ramLimitPercent, setRamLimitPercent] = useState<number>(() => {
    const saved = localStorage.getItem("omnix_ram_limit");
    return saved ? parseInt(saved, 10) : 66;
  });

  const [enableRAG, setEnableRAG] = useState<boolean>(() => {
    const saved = localStorage.getItem("omnix_enable_rag");
    return saved === null ? true : saved === "true";
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

  const [minimizeToTray, setMinimizeToTray] = useState<boolean>(() => {
    const saved = localStorage.getItem("omnix_minimize_to_tray");
    return saved === "true";
  });

  const [isCoderMode, setIsCoderMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("omnix_coder_mode");
    return saved === "true";
  });

  const [enableRelayMode, setEnableRelayMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("omnix_enable_relay");
    // Default to false to reduce server overhead as requested
    return saved === "true";
  });

  const [enableFocusTopics, setEnableFocusTopics] = useState<boolean>(() => {
    const saved = localStorage.getItem("omnix_enable_focus_topics");
    return saved === null ? true : saved === "true";
  });

  const [thinkEnabled, setThinkEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("omnix_think_enabled");
    return saved === "true";
  });

  const [previousTextModel, setPreviousTextModel] = useState<string | null>(() => {
    return localStorage.getItem("omnix_prev_text_model");
  });

  useEffect(() => {
    localStorage.setItem("omnix_ram_limit", ramLimitPercent.toString());
  }, [ramLimitPercent]);

  useEffect(() => {
    localStorage.setItem("omnix_coder_mode", isCoderMode.toString());
  }, [isCoderMode]);

  useEffect(() => {
    if (previousTextModel) {
      localStorage.setItem("omnix_prev_text_model", previousTextModel);
    } else {
      localStorage.removeItem("omnix_prev_text_model");
    }
  }, [previousTextModel]);

  useEffect(() => {
    localStorage.setItem("omnix_enable_relay", enableRelayMode.toString());
  }, [enableRelayMode]);

  useEffect(() => {
    localStorage.setItem("omnix_enable_rag", enableRAG.toString());
  }, [enableRAG]);

  useEffect(() => {
    localStorage.setItem("omnix_enable_focus_topics", enableFocusTopics.toString());
  }, [enableFocusTopics]);

  useEffect(() => {
    localStorage.setItem("omnix_think_enabled", thinkEnabled.toString());
  }, [thinkEnabled]);

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
    localStorage.setItem("omnix_minimize_to_tray", minimizeToTray.toString());
    if (window.electron) {
      (window.electron as any).ipcRenderer?.send("update-tray-setting", minimizeToTray);
    }
  }, [minimizeToTray]);

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
    minimizeToTray,
    setMinimizeToTray,
    isCoderMode,
    setIsCoderMode,
    enableRelayMode,
    setEnableRelayMode,
    enableFocusTopics,
    setEnableFocusTopics,
    thinkEnabled,
    setThinkEnabled,
    previousTextModel,
    setPreviousTextModel,
  };
}
