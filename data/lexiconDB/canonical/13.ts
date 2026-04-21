import { CanonicalLexicon } from '../../types';

export const CANONICAL_LEXICON_CHUNK_13: CanonicalLexicon = new Map([
  // --- Expanded Descriptors of Quantity and Measurement ---
  [5206, { // Length
    canonicalWord: "length",
    synonyms: [
      { wordIndex: 5206, word: "length", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 2976, word: "extent", definitionMatch: 0.8, intensity: 1.1 },
      { wordIndex: 2686, word: "duration", definitionMatch: 0.85, intensity: 1.0 }
    ]
  }],
  [8650, { // Width
    canonicalWord: "width",
    synonyms: [
      { wordIndex: 8650, word: "width", definitionMatch: 1.0, intensity: 1.0 }
    ]
  }],
  [4245, { // Height
    canonicalWord: "height",
    synonyms: [
      { wordIndex: 4245, word: "height", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 2843, word: "elevation", definitionMatch: 0.8, intensity: 1.2 }
    ]
  }],
  [7867, { // Speed
    canonicalWord: "speed",
    synonyms: [
      { wordIndex: 7867, word: "speed", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 8588, word: "velocity", definitionMatch: 0.9, intensity: 1.2 },
      { wordIndex: 6348, word: "pace", definitionMatch: 0.8, intensity: 0.9 },
      { wordIndex: 7155, word: "rate", definitionMatch: 0.85, intensity: 1.0 }
    ]
  }],
  [2716, { // Data (specific to input/output)
    canonicalWord: "data (specific to input/output)",
    synonyms: [
      { wordIndex: 2715, word: "data", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 4676, word: "input", definitionMatch: 0.8, intensity: 1.0 },
      { wordIndex: 6311, word: "output", definitionMatch: 0.8, intensity: 1.0 },
      { wordIndex: 3624, word: "information", definitionMatch: 0.9, intensity: 1.0 }
    ]
  }]
]);