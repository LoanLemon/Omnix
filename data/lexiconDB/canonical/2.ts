import { CanonicalLexicon } from '../../types';

export const CANONICAL_LEXICON_CHUNK_2: CanonicalLexicon = new Map([
  // --- H) Adjectives of State & Emotion ---
  [4167, { // Happy / Pleased
    canonicalWord: "happy",
    synonyms: [
      { wordIndex: 4167, word: "happy", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 6650, word: "pleased", definitionMatch: 0.9, intensity: 1.1 },
      { wordIndex: 3840, word: "glad", definitionMatch: 0.95, intensity: 1.0 },
      { wordIndex: 2790, word: "delighted", definitionMatch: 0.85, intensity: 1.4 }
    ]
  }],
  [7183, { // Sad / Upset
    canonicalWord: "sad",
    synonyms: [
      { wordIndex: 7183, word: "sad", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 8761, word: "upset", definitionMatch: 0.8, intensity: 1.1 },
      { wordIndex: 2884, word: "disappointed", definitionMatch: 0.7, intensity: 1.1 }
    ]
  }],
  [1470, { // Certain / Sure
    canonicalWord: "certain",
    synonyms: [
      { wordIndex: 1470, word: "certain", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 8032, word: "sure", definitionMatch: 0.95, intensity: 0.9 },
      { wordIndex: 2137, word: "confident", definitionMatch: 0.8, intensity: 1.2 },
      { wordIndex: 6740, word: "positive", definitionMatch: 0.85, intensity: 1.1 }
    ]
  }],
  [2141, { // Confused / Unclear
    canonicalWord: "confused",
    synonyms: [
      { wordIndex: 2141, word: "confused", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: -1, word: "unclear", definitionMatch: 0.8, intensity: 0.9 },
      { wordIndex: -1, word: "unsure", definitionMatch: 0.8, intensity: 0.9 },
      { wordIndex: 5295, word: "lost", definitionMatch: 0.7, intensity: 1.1 }
    ]
  }],

  // --- I) General Purpose Verbs ---
  [8708, { // Understand
    canonicalWord: "understand",
    synonyms: [
      { wordIndex: 8708, word: "understand", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 6169, word: "comprehend", definitionMatch: 0.9, intensity: 1.2 },
      { wordIndex: 7635, word: "grasp", definitionMatch: 0.8, intensity: 1.0 },
      { wordIndex: -1, word: "follow", definitionMatch: 0.85, intensity: 0.9 }
    ]
  }],
  [7322, { // Respond
    canonicalWord: "respond",
    synonyms: [
      { wordIndex: 7322, word: "respond", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 408, word: "answer", definitionMatch: 0.95, intensity: 0.9 },
      { wordIndex: 7637, word: "reply", definitionMatch: 0.95, intensity: 0.9 },
      { wordIndex: 7856, word: "state", definitionMatch: 0.7, intensity: 1.1 }
    ]
  }],
  [7856, { // Say / Tell
    canonicalWord: "say",
    synonyms: [
      { wordIndex: 7856, word: "say", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 8118, word: "tell", definitionMatch: 0.9, intensity: 1.0 },
      { wordIndex: 7859, word: "speak", definitionMatch: 0.85, intensity: 1.1 },
      { wordIndex: 8243, word: "talk", definitionMatch: 0.9, intensity: 0.9 },
      { wordIndex: 1779, word: "communicate", definitionMatch: 0.7, intensity: 1.2 }
    ]
  }],
  [8770, { // Use
    canonicalWord: "use",
    synonyms: [
      { wordIndex: 8770, word: "use", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 469, word: "apply", definitionMatch: 0.8, intensity: 1.1 },
      { wordIndex: -1, word: "utilize", definitionMatch: 0.85, intensity: 1.2 },
      { wordIndex: -1, word: "employ", definitionMatch: 0.7, intensity: 1.0 }
    ]
  }],
  [5812, { // Mean
    canonicalWord: "mean",
    synonyms: [
      { wordIndex: 5812, word: "mean", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 2831, word: "denote", definitionMatch: 0.8, intensity: 1.2 },
      { wordIndex: 4652, word: "imply", definitionMatch: 0.7, intensity: 1.1 },
      { wordIndex: 8708, word: "intend", definitionMatch: 0.9, intensity: 1.0 }
    ]
  }],
  [5000, { // Know
    canonicalWord: "know",
    synonyms: [
      { wordIndex: 5000, word: "know", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 8708, word: "understand", definitionMatch: 0.8, intensity: 1.0 },
      { wordIndex: 4208, word: "have knowledge", definitionMatch: 0.9, intensity: 1.1 },
      { wordIndex: 4945, word: "be aware", definitionMatch: 0.85, intensity: 1.0 }
    ]
  }],
  [8202, { // Think
    canonicalWord: "think",
    synonyms: [
      { wordIndex: 8202, word: "think", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 2105, word: "consider", definitionMatch: 0.8, intensity: 1.1 },
      { wordIndex: 1530, word: "believe", definitionMatch: 0.9, intensity: 1.0 },
      { wordIndex: 8201, word: "opine", definitionMatch: 0.6, intensity: 1.3 }
    ]
  }],
  [8638, { // Want
    canonicalWord: "want",
    synonyms: [
      { wordIndex: 8638, word: "want", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 6019, word: "desire", definitionMatch: 0.9, intensity: 1.3 },
      { wordIndex: 8739, word: "wish", definitionMatch: 0.9, intensity: 1.1 },
      { wordIndex: -1, word: "would like", definitionMatch: 1.0, intensity: 1.0 }
    ]
  }]
]);