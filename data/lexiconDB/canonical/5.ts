import { CanonicalLexicon } from '../../types';

export const CANONICAL_LEXICON_CHUNK_5: CanonicalLexicon = new Map([
  // --- P) Pronouns and Determinants ---
  [4489, { // I
    canonicalWord: "i",
    synonyms: [
      { wordIndex: 4489, word: "i", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 5764, word: "me", definitionMatch: 1.0, intensity: 1.0 }
    ]
  }],
  [8750, { // You
    canonicalWord: "you",
    synonyms: [
      { wordIndex: 8750, word: "you", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 8756, word: "your", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 8758, word: "yourself", definitionMatch: 1.0, intensity: 1.0 }
    ]
  }],
  [4218, { // He / Him
    canonicalWord: "he",
    synonyms: [
      { wordIndex: 4218, word: "he", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 4330, word: "him", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 4340, word: "his", definitionMatch: 1.0, intensity: 1.0 }
    ]
  }],
  [7651, { // She / Her
    canonicalWord: "she",
    synonyms: [
      { wordIndex: 7651, word: "she", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 4261, word: "her", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 4264, word: "hers", definitionMatch: 1.0, intensity: 1.0 }
    ]
  }],
  [4735, { // It
    canonicalWord: "it",
    synonyms: [
      { wordIndex: 4735, word: "it", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 4736, word: "its", definitionMatch: 1.0, intensity: 1.0 }
    ]
  }],
  [8597, { // We / Us
    canonicalWord: "we",
    synonyms: [
      { wordIndex: 8597, word: "we", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 8402, word: "us", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 6271, word: "our", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 6272, word: "ours", definitionMatch: 1.0, intensity: 1.0 }
    ]
  }],
  [8191, { // They / Them
    canonicalWord: "they",
    synonyms: [
      { wordIndex: 8191, word: "they", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 8129, word: "them", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 8121, word: "their", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: -1, word: "theirs", definitionMatch: 1.0, intensity: 1.0 }
    ]
  }],

  // --- Q) Common Nouns ---
  [6531, { // Person / People
    canonicalWord: "person",
    synonyms: [
      { wordIndex: 6531, word: "person", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 6516, word: "people", definitionMatch: 0.9, intensity: 1.0 },
      { wordIndex: 4663, word: "individual", definitionMatch: 0.8, intensity: 1.1 },
      { wordIndex: 4426, word: "human", definitionMatch: 0.95, intensity: 1.0 }
    ]
  }],
  [6634, { // Place
    canonicalWord: "place",
    synonyms: [
      { wordIndex: 6634, word: "place", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 5275, word: "location", definitionMatch: 0.9, intensity: 1.1 },
      { wordIndex: 7808, word: "spot", definitionMatch: 0.9, intensity: 0.9 },
      { wordIndex: 522, word: "area", definitionMatch: 0.8, intensity: 1.0 }
    ]
  }],
  [8192, { // Thing
    canonicalWord: "thing",
    synonyms: [
      { wordIndex: 8192, word: "thing", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 6145, word: "object", definitionMatch: 0.85, intensity: 1.1 },
      { wordIndex: 4737, word: "item", definitionMatch: 0.9, intensity: 1.0 },
      { wordIndex: 2882, word: "entity", definitionMatch: 0.7, intensity: 1.3 }
    ]
  }],
  [8662, { // World
    canonicalWord: "world",
    synonyms: [
      { wordIndex: 8662, word: "world", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 2740, word: "earth", definitionMatch: 0.9, intensity: 1.0 },
      { wordIndex: 3845, word: "globe", definitionMatch: 0.85, intensity: 1.0 },
      { wordIndex: 8378, word: "universe", definitionMatch: 0.7, intensity: 1.5 }
    ]
  }],

  // --- R) Miscellaneous Useful Terms ---
  [6952, { // Part
    canonicalWord: "part",
    synonyms: [
      { wordIndex: 6952, word: "part", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 6723, word: "portion", definitionMatch: 0.9, intensity: 1.0 },
      { wordIndex: 7639, word: "segment", definitionMatch: 0.8, intensity: 1.1 },
      { wordIndex: 2169, word: "component", definitionMatch: 0.8, intensity: 1.2 }
    ]
  }],
  [6261, { // Other
    canonicalWord: "other",
    synonyms: [
      { wordIndex: 6261, word: "other", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 421, word: "another", definitionMatch: 0.95, intensity: 1.0 },
      { wordIndex: 315, word: "alternative", definitionMatch: 0.8, intensity: 1.1 }
    ]
  }],
  [6197, { // Only
    canonicalWord: "only",
    synonyms: [
      { wordIndex: 6197, word: "only", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 7723, word: "solely", definitionMatch: 0.8, intensity: 1.2 },
      { wordIndex: 2924, word: "exclusively", definitionMatch: 0.75, intensity: 1.3 },
      { wordIndex: 4841, word: "just", definitionMatch: 0.9, intensity: 0.9 }
    ]
  }]
]);