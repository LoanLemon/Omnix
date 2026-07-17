export interface OceanPersonality {
  openness?: number;
  conscientiousness?: number;
  extraversion?: number;
  agreeableness?: number;
  neuroticism?: number;
}

export function getToneDescriptor(trait: string, value: number | undefined): string {
  if (value === undefined || value === null) return "";
  const v = Number(value);
  if (v <= 33) {
    switch (trait) {
      case "openness": return "pragmatic and literal";
      case "conscientiousness": return "flexible and spontaneous";
      case "extraversion": return "reserved and quiet";
      case "agreeableness": return "critical and direct";
      case "neuroticism": return "calm and stable";
    }
  } else if (v <= 66) {
    switch (trait) {
      case "openness": return "balanced and curious";
      case "conscientiousness": return "diligent and methodical";
      case "extraversion": return "conversational and social";
      case "agreeableness": return "polite and helpful";
      case "neuroticism": return "reflective and cautious";
    }
  } else {
    switch (trait) {
      case "openness": return "visionary and imaginative";
      case "conscientiousness": return "perfectionist and rigid";
      case "extraversion": return "high-energy and bold";
      case "agreeableness": return "warm and supportive";
      case "neuroticism": return "intense and vigilant";
    }
  }
  return "";
}

export function getToneInstruction(ocean: OceanPersonality): string {
  if (!ocean) return "";
  const parts: string[] = [];

  if (ocean.openness !== undefined) {
    parts.push(getToneDescriptor("openness", ocean.openness));
  }
  if (ocean.conscientiousness !== undefined) {
    parts.push(getToneDescriptor("conscientiousness", ocean.conscientiousness));
  }
  if (ocean.extraversion !== undefined) {
    parts.push(getToneDescriptor("extraversion", ocean.extraversion));
  }
  if (ocean.agreeableness !== undefined) {
    parts.push(getToneDescriptor("agreeableness", ocean.agreeableness));
  }
  if (ocean.neuroticism !== undefined) {
    parts.push(getToneDescriptor("neuroticism", ocean.neuroticism));
  }

  const activeParts = parts.filter(Boolean);
  if (activeParts.length === 0) return "";

  return `Speak with a tone that is ${activeParts.join(", ")}. These characteristics must ONLY drive the emotional tone, conversational warmth, speaking cadence, and minor linguistic choices of your outputs. They MUST NOT affect the factual context, accuracy, formatting, instructions, or role/persona restrictions of your response. Do NOT get absorbed into a roleplay persona or pretend to be a different entity. Maintain your core identity as Omnix at all times.`;
}
