import React from "react";

export interface ParamInfo {
  field: string;
  type: string;
  presence: "Required" | "Optional" | "Implicit";
  description: React.ReactNode;
}

export const textParams: ParamInfo[] = [
  {
    field: "prompt",
    type: "string",
    presence: "Required",
    description: "The core text content or instruction to the model."
  },
  {
    field: "systemPrompt",
    type: "string",
    presence: "Optional",
    description: "Guiding rules or custom system-level persona for the response."
  },
  {
    field: "model",
    type: "object",
    presence: "Optional",
    description: React.createElement(React.Fragment, null, "Optional config object containing ", React.createElement("code", null, "id"), ", ", React.createElement("code", null, "qtype"), ", ", React.createElement("code", null, "temperature"), ", ", React.createElement("code", null, "top_p"), ", ", React.createElement("code", null, "top_k"), ", ", React.createElement("code", null, "maxTokens"), ". If absent, reuse current or default model.")
  },
  {
    field: "isolatedRAG",
    type: "boolean",
    presence: "Optional",
    description: "If true, queries will retrieve context ONLY from this session's isolated RAG storage tied to the specific reqId."
  },
  {
    field: "ocean",
    type: "object",
    presence: "Optional",
    description: React.createElement(React.Fragment, null, "Big Five personality traits containing ", React.createElement("code", null, "openness"), ", ", React.createElement("code", null, "conscientiousness"), ", ", React.createElement("code", null, "extraversion"), ", ", React.createElement("code", null, "agreeableness"), ", ", React.createElement("code", null, "neuroticism"), " (values 0-100) to guide character personality.")
  },
  {
    field: "reqId",
    type: "string",
    presence: "Optional",
    description: "Unique tracking key for task correlation, logs, and streaming updates. Body, query, or header."
  }
];

export const visionParams: ParamInfo[] = [
  {
    field: "image",
    type: "File (Binary)",
    presence: "Required",
    description: "The physical image file input (JPEG/PNG/WebP)."
  },
  {
    field: "prompt",
    type: "string",
    presence: "Optional",
    description: "Visual query/question (defaults to image description)."
  },
  {
    field: "model",
    type: "string (JSON)",
    presence: "Optional",
    description: React.createElement(React.Fragment, null, "Optional config string containing ", React.createElement("code", null, "{\"id\": \"...\", \"qtype\": \"...\"}"), ".")
  },
  {
    field: "isolatedRAG",
    type: "boolean",
    presence: "Optional",
    description: "If true, queries will retrieve context ONLY from this session's isolated RAG storage tied to the specific reqId."
  },
  {
    field: "ocean",
    type: "string (JSON)",
    presence: "Optional",
    description: React.createElement(React.Fragment, null, "JSON-string or keys (like ", React.createElement("code", null, "ocean"), " object) mapping Big Five traits containing ", React.createElement("code", null, "openness"), ", ", React.createElement("code", null, "conscientiousness"), ", etc.")
  },
  {
    field: "reqId",
    type: "string",
    presence: "Optional",
    description: "Unique tracking key for task correlation, logs, and streaming updates. Form field, query, or header."
  }
];

export const isolatedRagParams: ParamInfo[] = [
  {
    field: "isolatedRAG",
    type: "boolean",
    presence: "Optional",
    description: "If true, queries will retrieve context ONLY from this session's isolated vector database tied to the specific reqId."
  },
  {
    field: "ocean",
    type: "object",
    presence: "Optional",
    description: React.createElement(React.Fragment, null, "Object containing values (0-100) for ", React.createElement("code", null, "openness"), ", ", React.createElement("code", null, "conscientiousness"), ", ", React.createElement("code", null, "extraversion"), ", ", React.createElement("code", null, "agreeableness"), ", ", React.createElement("code", null, "neuroticism"), " to mold response personality traits. Alternatively, these keys can be supplied flat on the parent object.")
  }
];

export const injectRagParams: ParamInfo[] = [
  {
    field: "isolatedRAG",
    type: "boolean",
    presence: "Required",
    description: "Set to true to inject this background history/story into the isolated session tied to the specific reqId."
  },
  {
    field: "text",
    type: "string",
    presence: "Required",
    description: "The history text, lore, or memories to embed and inject."
  },
  {
    field: "metadata",
    type: "object",
    presence: "Optional",
    description: "Optional key-value pairs representing custom metadata."
  }
];

export const directorParams: ParamInfo[] = [
  {
    field: "prompt",
    type: "string",
    presence: "Required",
    description: "The user query representing overall system instructions (e.g. generate music)."
  },
  {
    field: "reqId",
    type: "string",
    presence: "Optional",
    description: "Unique tracking key for task correlation, logs, and streaming updates. Body, query, or header."
  }
];

export const imageParams: ParamInfo[] = [
  {
    field: "prompt",
    type: "string",
    presence: "Required",
    description: "Description of image layout and artistic requirements."
  },
  {
    field: "model",
    type: "object",
    presence: "Optional",
    description: React.createElement(React.Fragment, null, "Optional config object containing ", React.createElement("code", null, "id"), " and ", React.createElement("code", null, "qtype"), ".")
  },
  {
    field: "reqId",
    type: "string",
    presence: "Optional",
    description: "Unique tracking key for task correlation, logs, and streaming updates. Body, query, or header."
  }
];

export const musicParams: ParamInfo[] = [
  {
    field: "prompt",
    type: "string",
    presence: "Required",
    description: "Acoustic criteria (genre, feeling, speed, instruments)."
  },
  {
    field: "model",
    type: "object",
    presence: "Optional",
    description: React.createElement(React.Fragment, null, "Optional config object containing ", React.createElement("code", null, "id"), ", ", React.createElement("code", null, "qtype"), ", and ", React.createElement("code", null, "maxTokens"), ".")
  },
  {
    field: "reqId",
    type: "string",
    presence: "Optional",
    description: "Unique tracking key for task correlation, logs, and streaming updates. Body, query, or header."
  }
];

export const sttParams: ParamInfo[] = [
  {
    field: "audio",
    type: "File (Binary)",
    presence: "Required",
    description: "Binary voice recording file format (e.g. wav/mp3)."
  },
  {
    field: "reqId",
    type: "string",
    presence: "Optional",
    description: "Unique tracking key for task correlation, logs, and streaming updates. Form field, query, or header."
  }
];

export const ttsParams: ParamInfo[] = [
  {
    field: "text",
    type: "string",
    presence: "Required",
    description: "The textual message content to read."
  },
  {
    field: "voiceID",
    type: "string",
    presence: "Optional",
    description: "The specific Kokoro voice ID to use. Default is 'af_heart'."
  },
  {
    field: "format",
    type: "string",
    presence: "Optional",
    description: "The desired output format (e.g. 'wav'). If not provided, the audio is played natively in Omnix and no data is returned."
  },
  {
    field: "speed",
    type: "number",
    presence: "Optional",
    description: "Speed rate multiplier for speech (e.g. 1.0 is default, 1.2 is faster, 0.8 is slower)."
  },
  {
    field: "pitch",
    type: "number",
    presence: "Optional",
    description: "Pitch multiplier for speech (e.g. 1.0 is default, 1.2 is higher pitch, 0.8 is lower pitch)."
  },
  {
    field: "volume",
    type: "number",
    presence: "Optional",
    description: "Loudness volume level (e.g. 1.0 is default, 0.5 is half volume, 2.0 is double volume)."
  },
  {
    field: "reqId",
    type: "string",
    presence: "Optional",
    description: "Unique tracking key for task correlation, logs, and streaming updates. Body, query, or header."
  }
];

export const healthParams: ParamInfo[] = [
  {
    field: "Origin / Referer",
    type: "string",
    presence: "Implicit",
    description: "Automatically supplied by browser to allow hostname validation and access checks."
  },
  {
    field: "reqId",
    type: "string",
    presence: "Optional",
    description: "Unique tracking key for health correlation. Supported as query parameter or header."
  }
];

export const liveParams: ParamInfo[] = [
  {
    field: "audio",
    type: "string (Base64)",
    presence: "Required",
    description: "Base64 encoded audio string for Speech-to-Text (conditionally required if text is not provided)."
  },
  {
    field: "text",
    type: "string",
    presence: "Required",
    description: "Raw text query (conditionally required if audio is not provided)."
  },
  {
    field: "systemPrompt",
    type: "string",
    presence: "Optional",
    description: "Optional system prompt/persona guidance for text generation."
  },
  {
    field: "voiceId",
    type: "string",
    presence: "Optional",
    description: React.createElement(React.Fragment, null, "Voice ID for the TTS model (e.g. ", React.createElement("code", null, "af_heart"), ").")
  },
  {
    field: "modelId",
    type: "string",
    presence: "Optional",
    description: "Optional text generation model ID."
  },
  {
    field: "isolatedRAG",
    type: "boolean",
    presence: "Optional",
    description: "If true, queries will retrieve context ONLY from this session's isolated RAG storage tied to the specific reqId."
  },
  {
    field: "reqId",
    type: "string",
    presence: "Optional",
    description: "Unique tracking key for task correlation, logs, and session-history persistence."
  }
];

export const waitVoiceParams: ParamInfo[] = [
  {
    field: "maxDuration",
    type: "number",
    presence: "Optional",
    description: "Maximum recording duration in milliseconds (default: 10000)."
  },
  {
    field: "silenceDuration",
    type: "number",
    presence: "Optional",
    description: "Silence duration in milliseconds before automatic stop (default: 1500)."
  },
  {
    field: "silenceThreshold",
    type: "number",
    presence: "Optional",
    description: "RMS voice amplitude silence threshold (default: 0.005)."
  },
  {
    field: "reqId",
    type: "string",
    presence: "Optional",
    description: "Unique tracking key for task correlation, logs, and streaming updates. Body, query, or header."
  }
];

export const autoSttTtsParams: ParamInfo[] = [
  {
    field: "maxDuration",
    type: "number",
    presence: "Optional",
    description: "Maximum recording duration in milliseconds (default: 10000)."
  },
  {
    field: "silenceDuration",
    type: "number",
    presence: "Optional",
    description: "Silence duration in milliseconds before automatic stop (default: 1500)."
  },
  {
    field: "silenceThreshold",
    type: "number",
    presence: "Optional",
    description: "RMS voice amplitude silence threshold (default: 0.005)."
  },
  {
    field: "systemPrompt",
    type: "string",
    presence: "Optional",
    description: "Guiding rules or custom system-level persona for the response text generation."
  },
  {
    field: "modelId",
    type: "string",
    presence: "Optional",
    description: "Optional text generation model ID (falls back to selected text model)."
  },
  {
    field: "voiceID",
    type: "string",
    presence: "Optional",
    description: "The specific Kokoro voice ID to use for live playback (e.g. 'af_heart')."
  },
  {
    field: "temperature",
    type: "number",
    presence: "Optional",
    description: "Sampling temperature for the text response model (0.0 to 1.0)."
  },
  {
    field: "isolatedRAG",
    type: "boolean",
    presence: "Optional",
    description: "If true, queries will retrieve context ONLY from this session's isolated RAG storage tied to the specific reqId."
  },
  {
    field: "volume",
    type: "number",
    presence: "Optional",
    description: "Volume level for audio playback (e.g. 1.0 is default, 0.5 is half volume, 2.0 is double volume)."
  },
  {
    field: "speed",
    type: "number",
    presence: "Optional",
    description: "Speed rate multiplier for speech (e.g. 1.0 is default, 1.2 is faster, 0.8 is slower)."
  },
  {
    field: "pitch",
    type: "number",
    presence: "Optional",
    description: "Pitch multiplier for speech (e.g. 1.0 is default, 1.2 is higher pitch, 0.8 is lower pitch)."
  },
  {
    field: "reqId",
    type: "string",
    presence: "Optional",
    description: "Tracking key for session logs and task correlation."
  }
];
