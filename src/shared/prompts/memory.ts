export const MEMORY_HISTORY_SYSTEM_PROMPT = `
## Retrospect Conversational History (Session & Long-term Memory):
{memories}

The transcript above lists the current session history and relevant long-term memories in chronological order. Use this data ONLY to answer the user's specific questions regarding what was previously said, who said it, or any past historical interaction.
`;

export const MEMORY_CONTEXT_SYSTEM_PROMPT = `
## Instructions & User Preferences:
{memories}

The instructions and user preferences above are relevant past facts or guidelines recalled from memory. Adhere to these guidelines when formulating your response. Do not repeat them word-for-word, and do not begin your reply with standard greetings unless natural. Focus entirely on answering the user's latest incoming message.
`;

export const MEMORY_SYSTEM_PROMPT = MEMORY_HISTORY_SYSTEM_PROMPT;

export function formatTimestamp(timestampNum: number): string {
  const d = new Date(timestampNum);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function isGenericGreetingOrIntro(text: string): boolean {
  const lower = text.toLowerCase().trim();
  if (lower === "hello" || lower === "hello there!" || lower === "hello there" || lower === "hi" || lower === "hey" || lower === "that's very cool!") return true;
  if (/how are you|how can i assist|how can i help/i.test(lower)) return true;
  if (/as an ai assistant|developed by dustin/i.test(lower)) return true;
  if (lower.includes("provide high-quality text responses") || lower.includes("developed by dustin lee") || lower.includes("as an omnix")) return true;
  return false;
}

export function distillMemories(memories: any[]): string {
  if (!memories || memories.length === 0) return "";

  const preferences: string[] = [];
  const facts: string[] = [];

  memories.forEach(m => {
    const rawText = (m.text || m.content || "").trim();
    if (!rawText) return;

    // Filter out generic intros/greetings to prevent anchoring/repeating loops
    if (isGenericGreetingOrIntro(rawText)) return;

    const lower = rawText.toLowerCase();

    // Clean bullet text
    let bullet = rawText;
    bullet = bullet.replace(/^[-*•\s]+/, "").trim();
    if (bullet.length > 120) {
      bullet = bullet.slice(0, 117) + "...";
    }

    if (
      lower.includes("prefer") || 
      lower.includes("like") || 
      lower.includes("dislike") || 
      lower.includes("want") || 
      lower.includes("tone") || 
      lower.includes("style") || 
      lower.includes("concise") || 
      lower.includes("verbose")
    ) {
      preferences.push(`- User prefers: ${bullet}`);
    } else {
      facts.push(`- Context fact: ${bullet}`);
    }
  });

  // Limit total items to 3 max for each category to keep prompt context extremely small
  const finalPreferences = preferences.slice(0, 3);
  const finalFacts = facts.slice(0, 3);

  let output = "";
  if (finalPreferences.length > 0) {
    output += finalPreferences.join("\n") + "\n";
  }
  if (finalFacts.length > 0) {
    output += finalFacts.join("\n") + "\n";
  }

  return output.trim();
}

export function formatConversationTranscript(memories: any[]): string {
  if (!memories || memories.length === 0) return "";
  
  const lines: string[] = [];
  // Keep last 6 turns to avoid context explosion
  memories.slice(-6).forEach(m => {
    const rawText = (m.text || m.content || "").trim();
    if (!rawText) return;
    
    // Skip system/greetings if appropriate, but keep actual conversation
    let sender = m.metadata?.sender;
    if (!sender) {
      const lower = rawText.toLowerCase();
      if (lower.startsWith("hello") || lower.includes("assist you") || lower.includes("how can i") || lower.includes("developer with skills") || lower.includes("as an omnix")) {
        sender = "AI";
      } else {
        sender = "User";
      }
    }
    
    lines.push(`[${sender}]: ${rawText}`);
  });
  
  return lines.join("\n");
}

export function formatMemoriesAsTable(memories: any[]): string {
  // Legacy table formatting fallback
  return formatConversationTranscript(memories);
}

export function formatMemoryPrompt(memoriesStr: string, isMemoryQuery: boolean = false): string {
  if (!memoriesStr.trim()) return "";
  if (isMemoryQuery) {
    return MEMORY_HISTORY_SYSTEM_PROMPT.replace("{memories}", memoriesStr.trim());
  } else {
    return MEMORY_CONTEXT_SYSTEM_PROMPT.replace("{memories}", memoriesStr.trim());
  }
}

