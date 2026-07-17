import { useState, useEffect } from "react";
import { ChatMode } from "@shared/types";

export function useSettings() {
  const [ramLimitPercent, setRamLimitPercent] = useState<number>(() => {
    const saved = localStorage.getItem("omnix_ram_limit");
    return saved ? parseInt(saved, 10) : 66;
  });

  const [contextMemoryLimit, setContextMemoryLimit] = useState<number>(() => {
    const isElectron = typeof window !== "undefined" && !!(window as any).electron;
    const saved = localStorage.getItem("omnix_context_memory_limit");
    const val = saved ? parseInt(saved, 10) : (isElectron ? 8192 : 4096);
    let parsed = val < 100 ? (isElectron ? 8192 : 4096) : val; // Convert old message count to new default length
    return isElectron ? parsed : Math.min(parsed, 4096);
  });

  const [temperature, setTemperature] = useState<number>(() => {
    const saved = localStorage.getItem("omnix_temperature");
    return saved ? parseFloat(saved) : 0.7;
  });

  const [topP, setTopP] = useState<number>(() => {
    const saved = localStorage.getItem("omnix_top_p");
    return saved ? parseFloat(saved) : 0.9;
  });

  const [topK, setTopK] = useState<number>(() => {
    const saved = localStorage.getItem("omnix_top_k");
    return saved ? parseInt(saved, 10) : 50;
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

  const [allowRemote, setAllowRemote] = useState<boolean>(() => {
    const saved = localStorage.getItem("omnix_allow_remote");
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

  const [researchEnabled, setResearchEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("omnix_research_enabled");
    return saved === "true";
  });

  const [liveResearchEnabled, setLiveResearchEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem("omnix_live_research_enabled");
    return saved === "true";
  });

  const [researchSrc, setResearchSrc] = useState<string>(() => {
    const saved = localStorage.getItem("omnix_research_src");
    return saved || "https://duckduckgo.com/?q=[query]&ia=web";
  });

  const [enableMMRS, setEnableMMRS] = useState<boolean>(() => {
    const saved = localStorage.getItem("omnix_enable_mmrs");
    return saved === "true"; // default to false
  });

  const [enableDualBrain, setEnableDualBrain] = useState<boolean>(() => {
    const saved = localStorage.getItem("omnix_enable_dual_brain");
    return saved === "true"; // default to false
  });

  const [dualBrainMode, setDualBrainMode] = useState<"enhanced-speed" | "double-check">(() => {
    const saved = localStorage.getItem("omnix_dual_brain_mode");
    return (saved as "enhanced-speed" | "double-check") || "enhanced-speed";
  });

  const [enableTurboMode, setEnableTurboMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("omnix_enable_turbo");
    return saved === "true"; // default to false
  });

  const [mmrsModel, setMmrsModel] = useState<"text" | "image" | "music">(() => {
    const saved = localStorage.getItem("omnix_mmrs_model");
    return (saved as "text" | "image" | "music") || "text";
  });

  const [mmrsMode, setMmrsMode] = useState<"operational" | "bob" | "duality" | "polarity">(() => {
    const saved = localStorage.getItem("omnix_mmrs_mode");
    return (saved as "operational" | "bob" | "duality" | "polarity") || "operational";
  });

  const [previousTextModel, setPreviousTextModel] = useState<string | null>(() => {
    return localStorage.getItem("omnix_prev_text_model");
  });

  const [inactivityTimeout, setInactivityTimeout] = useState<number>(() => {
    const saved = localStorage.getItem("omnix_inactivity_timeout");
    return saved ? parseInt(saved, 10) : 10;
  });

  const [onlyExecute, setOnlyExecute] = useState<boolean>(() => {
    const saved = localStorage.getItem("omnix_only_execute");
    return saved === "true";
  });

  const [developerView, setDeveloperView] = useState<boolean>(() => {
    const saved = localStorage.getItem("omnix_developer_view");
    return saved !== "false";
  });

  // --- ACE Vocal Synthesizer Parameters ---
  const [aceBpm, setAceBpm] = useState<number>(() => {
    const saved = localStorage.getItem("omnix_ace_bpm");
    return saved ? parseInt(saved, 10) : 120;
  });

  const [aceKey, setAceKey] = useState<string>(() => {
    const saved = localStorage.getItem("omnix_ace_key");
    return saved || "A Minor";
  });

  const [aceRegisterShift, setAceRegisterShift] = useState<number>(() => {
    const saved = localStorage.getItem("omnix_ace_register_shift");
    return saved ? parseFloat(saved) : 1.0;
  });

  const [aceVibratoSwell, setAceVibratoSwell] = useState<number>(() => {
    const saved = localStorage.getItem("omnix_ace_vibrato_swell");
    return saved ? parseFloat(saved) : 1.0;
  });

  const [aceReverbDelayFeed, setAceReverbDelayFeed] = useState<number>(() => {
    const saved = localStorage.getItem("omnix_ace_reverb_delay_feed");
    return saved ? parseFloat(saved) : 0.35;
  });

  const [aceVocalStyle, setAceVocalStyle] = useState<string>(() => {
    const saved = localStorage.getItem("omnix_ace_vocal_style");
    return saved || "synth";
  });

  const [aceKokoroVoice, setAceKokoroVoice] = useState<string>(() => {
    const saved = localStorage.getItem("omnix_ace_kokoro_voice");
    return saved || "af_heart";
  });

  const [aceAutoSettings, setAceAutoSettings] = useState<boolean>(() => {
    const saved = localStorage.getItem("omnix_ace_auto_settings");
    return saved ? saved === "true" : true;
  });

  useEffect(() => {
    localStorage.setItem("omnix_ram_limit", ramLimitPercent.toString());
  }, [ramLimitPercent]);

  useEffect(() => {
    localStorage.setItem("omnix_context_memory_limit", contextMemoryLimit.toString());
  }, [contextMemoryLimit]);

  useEffect(() => {
    localStorage.setItem("omnix_temperature", temperature.toString());
  }, [temperature]);

  useEffect(() => {
    localStorage.setItem("omnix_top_p", topP.toString());
  }, [topP]);

  useEffect(() => {
    localStorage.setItem("omnix_top_k", topK.toString());
  }, [topK]);

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
    localStorage.setItem("omnix_allow_remote", allowRemote.toString());
    const updateServerConfig = async () => {
      try {
        const port = window.location.port || "9777";
        await fetch(`http://localhost:${port}/api/server/config`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ allowRemote })
        });
      } catch (e) {
        // Safe ignore
      }
    };
    updateServerConfig();
  }, [allowRemote]);

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
    localStorage.setItem("omnix_research_enabled", researchEnabled.toString());
  }, [researchEnabled]);

  useEffect(() => {
    localStorage.setItem("omnix_live_research_enabled", liveResearchEnabled.toString());
  }, [liveResearchEnabled]);

  useEffect(() => {
    localStorage.setItem("omnix_research_src", researchSrc);
  }, [researchSrc]);

  useEffect(() => {
    localStorage.setItem("omnix_enable_mmrs", enableMMRS.toString());
  }, [enableMMRS]);

  useEffect(() => {
    localStorage.setItem("omnix_enable_dual_brain", enableDualBrain.toString());
  }, [enableDualBrain]);

  useEffect(() => {
    localStorage.setItem("omnix_dual_brain_mode", dualBrainMode);
  }, [dualBrainMode]);

  useEffect(() => {
    localStorage.setItem("omnix_enable_turbo", enableTurboMode.toString());
  }, [enableTurboMode]);

  useEffect(() => {
    localStorage.setItem("omnix_inactivity_timeout", inactivityTimeout.toString());
  }, [inactivityTimeout]);

  useEffect(() => {
    localStorage.setItem("omnix_only_execute", onlyExecute.toString());
  }, [onlyExecute]);

  useEffect(() => {
    localStorage.setItem("omnix_developer_view", developerView.toString());
  }, [developerView]);

  useEffect(() => {
    localStorage.setItem("omnix_mmrs_model", mmrsModel);
  }, [mmrsModel]);

  useEffect(() => {
    localStorage.setItem("omnix_mmrs_mode", mmrsMode);
  }, [mmrsMode]);

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

  useEffect(() => {
    localStorage.setItem("omnix_ace_bpm", aceBpm.toString());
  }, [aceBpm]);

  useEffect(() => {
    localStorage.setItem("omnix_ace_key", aceKey);
  }, [aceKey]);

  useEffect(() => {
    localStorage.setItem("omnix_ace_register_shift", aceRegisterShift.toString());
  }, [aceRegisterShift]);

  useEffect(() => {
    localStorage.setItem("omnix_ace_vibrato_swell", aceVibratoSwell.toString());
  }, [aceVibratoSwell]);

  useEffect(() => {
    localStorage.setItem("omnix_ace_reverb_delay_feed", aceReverbDelayFeed.toString());
  }, [aceReverbDelayFeed]);

  useEffect(() => {
    localStorage.setItem("omnix_ace_vocal_style", aceVocalStyle);
  }, [aceVocalStyle]);

  useEffect(() => {
    localStorage.setItem("omnix_ace_kokoro_voice", aceKokoroVoice);
  }, [aceKokoroVoice]);

  useEffect(() => {
    localStorage.setItem("omnix_ace_auto_settings", aceAutoSettings.toString());
  }, [aceAutoSettings]);

  return {
    ramLimitPercent,
    setRamLimitPercent,
    contextMemoryLimit,
    setContextMemoryLimit,
    temperature,
    setTemperature,
    topP,
    setTopP,
    topK,
    setTopK,
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
    allowRemote,
    setAllowRemote,
    enableFocusTopics,
    setEnableFocusTopics,
    thinkEnabled,
    setThinkEnabled,
    researchEnabled,
    setResearchEnabled,
    liveResearchEnabled,
    setLiveResearchEnabled,
    researchSrc,
    setResearchSrc,
    enableMMRS,
    setEnableMMRS,
    enableDualBrain,
    setEnableDualBrain,
    dualBrainMode,
    setDualBrainMode,
    enableTurboMode,
    setEnableTurboMode,
    mmrsModel,
    setMmrsModel,
    mmrsMode,
    setMmrsMode,
    previousTextModel,
    setPreviousTextModel,
    inactivityTimeout,
    setInactivityTimeout,
    onlyExecute,
    setOnlyExecute,
    developerView,
    setDeveloperView,
    aceBpm,
    setAceBpm,
    aceKey,
    setAceKey,
    aceRegisterShift,
    setAceRegisterShift,
    aceVibratoSwell,
    setAceVibratoSwell,
    aceReverbDelayFeed,
    setAceReverbDelayFeed,
    aceVocalStyle,
    setAceVocalStyle,
    aceKokoroVoice,
    setAceKokoroVoice,
    aceAutoSettings,
    setAceAutoSettings,
  };
}
