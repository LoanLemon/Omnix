import { CanonicalLexicon } from '../../types';

export const CANONICAL_LEXICON_CHUNK_4: CanonicalLexicon = new Map([
  // --- M) Spatial and Positional ---
  [4267, { // Here
    canonicalWord: "here",
    synonyms: [
      { wordIndex: 4267, word: "here", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: -1, word: "at this location", definitionMatch: 0.9, intensity: 1.1 },
      { wordIndex: -1, word: "in this spot", definitionMatch: 0.9, intensity: 1.0 }
    ]
  }],
  [8141, { // There
    canonicalWord: "there",
    synonyms: [
      { wordIndex: 8141, word: "there", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: -1, word: "at that location", definitionMatch: 0.9, intensity: 1.1 },
      { wordIndex: -1, word: "in that spot", definitionMatch: 0.9, intensity: 1.0 }
    ]
  }],
  [14, { // Above
    canonicalWord: "above",
    synonyms: [
      { wordIndex: 14, word: "above", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 6314, word: "over", definitionMatch: 0.95, intensity: 1.0 },
      { wordIndex: -1, word: "on top of", definitionMatch: 0.8, intensity: 1.0 }
    ]
  }],
  [887, { // Below
    canonicalWord: "below",
    synonyms: [
      { wordIndex: 887, word: "below", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 8345, word: "under", definitionMatch: 0.95, intensity: 1.0 },
      { wordIndex: 890, word: "beneath", definitionMatch: 0.8, intensity: 1.1 }
    ]
  }],
  [4658, { // In / Inside
    canonicalWord: "in",
    synonyms: [
      { wordIndex: 4658, word: "in", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 4679, word: "inside", definitionMatch: 0.9, intensity: 1.0 },
      { wordIndex: 8546, word: "within", definitionMatch: 0.8, intensity: 1.2 }
    ]
  }],
  [6309, { // Out / Outside
    canonicalWord: "out",
    synonyms: [
      { wordIndex: 6309, word: "out", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 6310, word: "outside", definitionMatch: 0.9, intensity: 1.0 },
      { wordIndex: 2975, word: "external", definitionMatch: 0.8, intensity: 1.2 }
    ]
  }],
  [6008, { // Near
    canonicalWord: "near",
    synonyms: [
      { wordIndex: 6008, word: "near", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: -1, word: "close to", definitionMatch: 0.95, intensity: 1.0 },
      { wordIndex: 6009, word: "nearby", definitionMatch: 0.9, intensity: 1.0 }
    ]
  }],

  // --- N) Descriptors of Quantity and Measurement ---
  [406, { // Amount
    canonicalWord: "amount",
    synonyms: [
      { wordIndex: 406, word: "amount", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 7122, word: "quantity", definitionMatch: 0.9, intensity: 1.1 },
      { wordIndex: 8624, word: "volume", definitionMatch: 0.8, intensity: 1.0 },
      { wordIndex: 8295, word: "total", definitionMatch: 0.85, intensity: 1.0 }
    ]
  }],
  [5738, { // Measure
    canonicalWord: "measure",
    synonyms: [
      { wordIndex: 5738, word: "measure", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: -1, word: "quantify", definitionMatch: 0.8, intensity: 1.2 },
      { wordIndex: 3267, word: "gauge", definitionMatch: 0.7, intensity: 1.1 },
      { wordIndex: 2942, word: "evaluate", definitionMatch: 0.75, intensity: 1.1 }
    ]
  }],
  [7703, { // Size
    canonicalWord: "size",
    synonyms: [
      { wordIndex: 7703, word: "size", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 2888, word: "dimensions", definitionMatch: 0.8, intensity: 1.1 },
      { wordIndex: 5462, word: "magnitude", definitionMatch: 0.7, intensity: 1.3 },
      { wordIndex: 2976, word: "extent", definitionMatch: 0.75, intensity: 1.1 }
    ]
  }],
  [8608, { // Weight
    canonicalWord: "weight",
    synonyms: [
      { wordIndex: 8608, word: "weight", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 5635, word: "mass", definitionMatch: 0.9, intensity: 1.1 },
      { wordIndex: -1, word: "heaviness", definitionMatch: 0.9, intensity: 1.0 }
    ]
  }],

  // --- O) General Purpose Adverbs ---
  [7215, { // Really / Truly
    canonicalWord: "really",
    synonyms: [
      { wordIndex: 7215, word: "really", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 8332, word: "truly", definitionMatch: 0.95, intensity: 1.1 },
      { wordIndex: 226, word: "actually", definitionMatch: 0.9, intensity: 1.0 },
      { wordIndex: -1, word: "genuinely", definitionMatch: 0.8, intensity: 1.2 }
    ]
  }],
  [8592, { // Very
    canonicalWord: "very",
    synonyms: [
      { wordIndex: 8592, word: "very", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 2978, word: "extremely", definitionMatch: 0.9, intensity: 1.4 },
      { wordIndex: 4323, word: "highly", definitionMatch: 0.8, intensity: 1.2 },
      { wordIndex: -1, word: "exceedingly", definitionMatch: 0.7, intensity: 1.5 }
    ]
  }],
  [4841, { // Just
    canonicalWord: "just",
    synonyms: [
      { wordIndex: 4841, word: "just", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 7696, word: "simply", definitionMatch: 0.95, intensity: 1.0 },
      { wordIndex: 5800, word: "merely", definitionMatch: 0.8, intensity: 1.1 },
      { wordIndex: 6197, word: "only", definitionMatch: 0.9, intensity: 1.0 }
    ]
  }],
  [307, { // Almost
    canonicalWord: "almost",
    synonyms: [
      { wordIndex: 307, word: "almost", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 6010, word: "nearly", definitionMatch: 0.95, intensity: 1.0 },
      { wordIndex: 509, word: "approximately", definitionMatch: 0.8, intensity: 1.1 }
    ]
  }]
]);