import { CanonicalLexicon } from '../../types';

export const CANONICAL_LEXICON_CHUNK_10: CanonicalLexicon = new Map([
  // --- Expanded Quantity and Degree ---
  [7770, { // Some
    canonicalWord: "some",
    synonyms: [
      { wordIndex: 7770, word: "some", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 3088, word: "few", definitionMatch: 0.9, intensity: 0.9 },
      { wordIndex: 7644, word: "several", definitionMatch: 0.8, intensity: 1.1 },
      { wordIndex: 6723, word: "portion", definitionMatch: 0.7, intensity: 1.0 }
    ]
  }],
  [4120, { // Half
    canonicalWord: "half",
    synonyms: [
      { wordIndex: 4120, word: "half", definitionMatch: 1.0, intensity: 1.0 }
    ]
  }],
  [3648, { // Full
    canonicalWord: "full",
    synonyms: [
      { wordIndex: 3648, word: "full", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 2125, word: "complete", definitionMatch: 0.9, intensity: 1.1 },
      { wordIndex: 2883, word: "entire", definitionMatch: 0.85, intensity: 1.2 },
      { wordIndex: 6363, word: "packed", definitionMatch: 0.7, intensity: 1.1 }
    ]
  }],
  [2870, { // Empty
    canonicalWord: "empty",
    synonyms: [
      { wordIndex: 2870, word: "empty", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 8579, word: "vacant", definitionMatch: 0.8, intensity: 1.1 },
      { wordIndex: 8366, word: "unfilled", definitionMatch: 0.9, intensity: 1.0 }
    ]
  }],
  [2902, { // Enough
    canonicalWord: "enough",
    synonyms: [
      { wordIndex: 2902, word: "enough", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 7979, word: "sufficient", definitionMatch: 0.85, intensity: 1.2 },
      { wordIndex: 142, word: "adequate", definitionMatch: 0.8, intensity: 1.1 }
    ]
  }],
  [8275, { // Too much / Too many
    canonicalWord: "too much",
    synonyms: [
      { wordIndex: 8275, word: "too", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 2972, word: "excessive", definitionMatch: 0.8, intensity: 1.3 },
      { wordIndex: 6317, word: "overwhelming", definitionMatch: 0.7, intensity: 1.5 }
    ]
  }]
]);