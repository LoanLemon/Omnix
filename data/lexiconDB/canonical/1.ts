import { CanonicalLexicon } from '../../types';

export const CANONICAL_LEXICON_CHUNK_1: CanonicalLexicon = new Map([
  // --- D) Nouns of Concept & Logic ---
  [3624, { // Information
    canonicalWord: "information",
    synonyms: [
      { wordIndex: 3624, word: "information", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 2715, word: "data", definitionMatch: 0.9, intensity: 1.1 },
      { wordIndex: 2854, word: "details", definitionMatch: 0.8, intensity: 1.0 },
      { wordIndex: 2235, word: "content", definitionMatch: 0.8, intensity: 0.9 },
      { wordIndex: 3037, word: "facts", definitionMatch: 0.85, intensity: 1.1 }
    ]
  }],
  [6928, { // Problem
    canonicalWord: "problem",
    synonyms: [
      { wordIndex: 6928, word: "problem", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 4626, word: "issue", definitionMatch: 0.95, intensity: 1.1 },
      { wordIndex: 1483, word: "challenge", definitionMatch: 0.8, intensity: 1.0 },
      { wordIndex: 2876, word: "difficulty", definitionMatch: 0.9, intensity: 1.0 },
      { wordIndex: 2109, word: "concern", definitionMatch: 0.8, intensity: 0.9 }
    ]
  }],
  [7724, { // Solution
    canonicalWord: "solution",
    synonyms: [
      { wordIndex: 7724, word: "solution", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 408, word: "answer", definitionMatch: 0.9, intensity: 0.9 },
      { wordIndex: 476, word: "approach", definitionMatch: 0.7, intensity: 1.0 },
      { wordIndex: 5854, word: "method", definitionMatch: 0.75, intensity: 1.0 }
    ]
  }],
  [3396, { // Idea
    canonicalWord: "idea",
    synonyms: [
      { wordIndex: 3396, word: "idea", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 2105, word: "concept", definitionMatch: 0.9, intensity: 1.2 },
      { wordIndex: 8201, word: "thought", definitionMatch: 0.95, intensity: 0.9 },
      { wordIndex: 6523, word: "perspective", definitionMatch: 0.7, intensity: 1.1 }
    ]
  }],
  [3848, { // Goal
    canonicalWord: "goal",
    synonyms: [
      { wordIndex: 3848, word: "goal", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 7096, word: "purpose", definitionMatch: 0.9, intensity: 1.1 },
      { wordIndex: 6146, word: "objective", definitionMatch: 0.95, intensity: 1.2 },
      { wordIndex: 3676, word: "intent", definitionMatch: 0.85, intensity: 1.0 },
      { wordIndex: 238, word: "aim", definitionMatch: 0.9, intensity: 1.0 }
    ]
  }],

  // --- E) Logical & Structural Connectors ---
  [368, { // And / Also
    canonicalWord: "and",
    synonyms: [
      { wordIndex: 368, word: "and", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 308, word: "also", definitionMatch: 0.9, intensity: 1.0 },
      { wordIndex: 6683, word: "plus", definitionMatch: 0.8, intensity: 1.0 },
      { wordIndex: 124, word: "addition", definitionMatch: 0.7, intensity: 1.2 }, // "in addition"
      { wordIndex: 5912, word: "moreover", definitionMatch: 0.6, intensity: 1.3 }
    ]
  }],
  [1248, { // But / However
    canonicalWord: "but",
    synonyms: [
      { wordIndex: 1248, word: "but", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 4453, word: "however", definitionMatch: 0.95, intensity: 1.2 },
      { wordIndex: 316, word: "although", definitionMatch: 0.8, intensity: 1.1 },
      { wordIndex: 8749, word: "yet", definitionMatch: 0.9, intensity: 1.1 }
    ]
  }],
  [7715, { // So / Therefore
    canonicalWord: "so",
    synonyms: [
      { wordIndex: 7715, word: "so", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 8142, word: "therefore", definitionMatch: 0.9, intensity: 1.3 },
      { wordIndex: 8215, word: "thus", definitionMatch: 0.85, intensity: 1.2 },
      { wordIndex: 2181, word: "consequently", definitionMatch: 0.8, intensity: 1.4 }
    ]
  }],

  // --- F) Modality & Possibility ---
  [1334, { // Can / Able to
    canonicalWord: "can",
    synonyms: [
      { wordIndex: 1334, word: "can", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 2420, word: "could", definitionMatch: 0.95, intensity: 0.9 },
      { wordIndex: 10, word: "able", definitionMatch: 0.8, intensity: 1.0 },
      { wordIndex: 1324, word: "capable", definitionMatch: 0.8, intensity: 1.1 }
    ]
  }],
  [8511, { // Will / Would
    canonicalWord: "will",
    synonyms: [
      { wordIndex: 8511, word: "will", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 8660, word: "would", definitionMatch: 0.95, intensity: 0.9 },
      { wordIndex: 7649, word: "shall", definitionMatch: 0.7, intensity: 1.2 }
    ]
  }],
  [5971, { // Must / Should
    canonicalWord: "must",
    synonyms: [
      { wordIndex: 5971, word: "must", definitionMatch: 1.0, intensity: 1.2 },
      { wordIndex: 7683, word: "should", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 6019, word: "need", definitionMatch: 0.9, intensity: 1.1 },
      { wordIndex: 7293, word: "require", definitionMatch: 0.8, intensity: 1.3 }
    ]
  }],
  
    // --- G) Interrogatives (Question Words) ---
  [8466, { // What
    canonicalWord: "what",
    synonyms: [
      { wordIndex: 8466, word: "what", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 8480, word: "which", definitionMatch: 0.9, intensity: 1.0 }
    ]
  }],
  [4452, { // How
    canonicalWord: "how",
    synonyms: [
      { wordIndex: 4452, word: "how", definitionMatch: 1.0, intensity: 1.0 }
    ]
  }],
  [8502, { // Why
    canonicalWord: "why",
    synonyms: [
      { wordIndex: 8502, word: "why", definitionMatch: 1.0, intensity: 1.0 }
    ]
  }],
  [8486, { // Who
    canonicalWord: "who",
    synonyms: [
      { wordIndex: 8486, word: "who", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 8488, word: "whom", definitionMatch: 0.9, intensity: 1.1 }
    ]
  }],
  [8474, { // When
    canonicalWord: "when",
    synonyms: [
      { wordIndex: 8474, word: "when", definitionMatch: 1.0, intensity: 1.0 }
    ]
  }],
  [8476, { // Where
    canonicalWord: "where",
    synonyms: [
      { wordIndex: 8476, word: "where", definitionMatch: 1.0, intensity: 1.0 }
    ]
  }]
]);