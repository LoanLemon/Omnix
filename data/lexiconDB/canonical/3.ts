import { CanonicalLexicon } from '../../types';

export const CANONICAL_LEXICON_CHUNK_3: CanonicalLexicon = new Map([
  // --- J) Time and Sequence ---
  [456, { // After
    canonicalWord: "after",
    synonyms: [
      { wordIndex: 456, word: "after", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 459, word: "subsequent", definitionMatch: 0.8, intensity: 1.2 },
      { wordIndex: -1, word: "following", definitionMatch: 0.95, intensity: 1.0 }
    ]
  }],
  [881, { // Before
    canonicalWord: "before",
    synonyms: [
      { wordIndex: 881, word: "before", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: -1, word: "prior to", definitionMatch: 0.9, intensity: 1.2 },
      { wordIndex: -1, word: "preceding", definitionMatch: 0.8, intensity: 1.1 }
    ]
  }],
  [8278, { // Then
    canonicalWord: "then",
    synonyms: [
      { wordIndex: 8278, word: "then", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 5912, word: "next", definitionMatch: 0.9, intensity: 0.9 },
      { wordIndex: -1, word: "afterward", definitionMatch: 0.85, intensity: 1.0 },
      { wordIndex: 2181, word: "subsequently", definitionMatch: 0.7, intensity: 1.2 }
    ]
  }],
  [6114, { // Now
    canonicalWord: "now",
    synonyms: [
      { wordIndex: 6114, word: "now", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: -1, word: "currently", definitionMatch: 0.9, intensity: 1.1 },
      { wordIndex: -1, word: "presently", definitionMatch: 0.8, intensity: 1.1 },
      { wordIndex: -1, word: "at this time", definitionMatch: 0.9, intensity: 1.0 }
    ]
  }],
  [309, { // Always
    canonicalWord: "always",
    synonyms: [
      { wordIndex: 309, word: "always", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 2980, word: "ever", definitionMatch: 0.9, intensity: 1.0 },
      { wordIndex: -1, word: "consistently", definitionMatch: 0.8, intensity: 1.1 },
      { wordIndex: -1, word: "at all times", definitionMatch: 0.9, intensity: 1.2 }
    ]
  }],
  [5989, { // Never
    canonicalWord: "never",
    synonyms: [
      { wordIndex: 5989, word: "never", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: -1, word: "at no time", definitionMatch: 0.9, intensity: 1.2 },
      { wordIndex: -1, word: "not ever", definitionMatch: 0.95, intensity: 1.0 }
    ]
  }],
  [7778, { // Soon
    canonicalWord: "soon",
    synonyms: [
      { wordIndex: 7778, word: "soon", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: -1, word: "shortly", definitionMatch: 0.95, intensity: 1.0 },
      { wordIndex: -1, word: "presently", definitionMatch: 0.8, intensity: 1.1 }
    ]
  }],
  [5123, { // Later
    canonicalWord: "later",
    synonyms: [
      { wordIndex: 5123, word: "later", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 459, word: "subsequently", definitionMatch: 0.8, intensity: 1.2 },
      { wordIndex: -1, word: "after a while", definitionMatch: 0.9, intensity: 0.9 }
    ]
  }],

  // --- K) Quantity and Degree ---
  [5563, { // Many / Much
    canonicalWord: "many",
    synonyms: [
      { wordIndex: 5563, word: "many", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 5970, word: "much", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 6135, word: "numerous", definitionMatch: 0.8, intensity: 1.2 },
      { wordIndex: 6659, word: "plenty", definitionMatch: 0.85, intensity: 1.1 },
      { wordIndex: 5313, word: "a lot", definitionMatch: 0.9, intensity: 1.0 }
    ]
  }],
  [5296, { // Little / Few
    canonicalWord: "little",
    synonyms: [
      { wordIndex: 5296, word: "little", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 3088, word: "few", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: -1, word: "scarcely any", definitionMatch: 0.7, intensity: 1.2 },
      { wordIndex: -1, word: "a small amount", definitionMatch: 0.9, intensity: 0.9 }
    ]
  }],
  [5909, { // More
    canonicalWord: "more",
    synonyms: [
      { wordIndex: 5909, word: "more", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 125, word: "additional", definitionMatch: 0.9, intensity: 1.1 },
      { wordIndex: 3236, word: "further", definitionMatch: 0.8, intensity: 1.0 },
      { wordIndex: 2977, word: "extra", definitionMatch: 0.85, intensity: 1.0 }
    ]
  }],
  [5227, { // Less
    canonicalWord: "less",
    synonyms: [
      { wordIndex: 5227, word: "less", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 3089, word: "fewer", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 7232, word: "reduced", definitionMatch: 0.8, intensity: 1.0 }
    ]
  }],
  [294, { // All
    canonicalWord: "all",
    synonyms: [
      { wordIndex: 294, word: "all", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 2955, word: "every", definitionMatch: 0.95, intensity: 1.0 },
      { wordIndex: 2883, word: "entire", definitionMatch: 0.9, intensity: 1.1 },
      { wordIndex: 8552, word: "whole", definitionMatch: 0.9, intensity: 1.0 }
    ]
  }],
  [6110, { // None
    canonicalWord: "none",
    synonyms: [
      { wordIndex: 6110, word: "none", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 8783, word: "zero", definitionMatch: 0.9, intensity: 1.1 },
      { wordIndex: -1, word: "not any", definitionMatch: 0.95, intensity: 1.0 }
    ]
  }],

  // --- L) Comparisons ---
  [7473, { // Same
    canonicalWord: "same",
    synonyms: [
      { wordIndex: 7473, word: "same", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 3406, word: "identical", definitionMatch: 0.9, intensity: 1.2 },
      { wordIndex: 298, word: "alike", definitionMatch: 0.9, intensity: 1.0 },
      { wordIndex: 2928, word: "equivalent", definitionMatch: 0.8, intensity: 1.1 }
    ]
  }],
  [2876, { // Different
    canonicalWord: "different",
    synonyms: [
      { wordIndex: 2876, word: "different", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 2909, word: "distinct", definitionMatch: 0.8, intensity: 1.1 },
      { wordIndex: 2919, word: "diverse", definitionMatch: 0.7, intensity: 1.0 },
      { wordIndex: 8585, word: "varied", definitionMatch: 0.75, intensity: 1.0 }
    ]
  }],
  [933, { // Better (comparison)
    canonicalWord: "better",
    synonyms: [
      { wordIndex: 933, word: "better", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 7994, word: "superior", definitionMatch: 0.9, intensity: 1.2 },
      { wordIndex: -1, word: "more effective", definitionMatch: 0.95, intensity: 1.0 }
    ]
  }],
  [8667, { // Worse
    canonicalWord: "worse",
    synonyms: [
      { wordIndex: 8667, word: "worse", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 3622, word: "inferior", definitionMatch: 0.9, intensity: 1.2 },
      { wordIndex: -1, word: "more unfavorable", definitionMatch: 0.95, intensity: 1.0 }
    ]
  }],
  [928, { // Best
    canonicalWord: "best",
    synonyms: [
      { wordIndex: 928, word: "best", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 6223, word: "optimal", definitionMatch: 0.85, intensity: 1.2 },
      { wordIndex: 3117, word: "finest", definitionMatch: 0.8, intensity: 1.3 },
      { wordIndex: 8008, word: "supreme", definitionMatch: 0.7, intensity: 1.5 }
    ]
  }],
  [8668, { // Worst
    canonicalWord: "worst",
    synonyms: [
      { wordIndex: 8668, word: "worst", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: -1, word: "least favorable", definitionMatch: 0.9, intensity: 1.1 },
      { wordIndex: -1, word: "poorest", definitionMatch: 0.95, intensity: 1.0 }
    ]
  }]
]);