import { CanonicalLexicon } from '../../types';

export const CANONICAL_LEXICON_CHUNK_9: CanonicalLexicon = new Map([
  // --- Expanded Time and Sequence ---
  [8279, { // Time
    canonicalWord: "time",
    synonyms: [
      { wordIndex: 8279, word: "time", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 6526, word: "period", definitionMatch: 0.8, intensity: 1.1 },
      { wordIndex: 2686, word: "duration", definitionMatch: 0.8, intensity: 1.1 },
      { wordIndex: 5882, word: "moment", definitionMatch: 0.9, intensity: 0.8 }
    ]
  }],
  [2742, { // Day
    canonicalWord: "day",
    synonyms: [
      { wordIndex: 2742, word: "day", definitionMatch: 1.0, intensity: 1.0 }
    ]
  }],
  [5898, { // Month
    canonicalWord: "month",
    synonyms: [
      { wordIndex: 5898, word: "month", definitionMatch: 1.0, intensity: 1.0 }
    ]
  }],
  [8740, { // Year
    canonicalWord: "year",
    synonyms: [
      { wordIndex: 8740, word: "year", definitionMatch: 1.0, intensity: 1.0 }
    ]
  }]
]);