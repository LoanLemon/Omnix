import { CanonicalLexicon } from '../../types';

export const CANONICAL_LEXICON_CHUNK_0: CanonicalLexicon = new Map([
  // --- A) Politeness & Conversational Flow ---
  [4250, { // Hello
    canonicalWord: "hello",
    synonyms: [
      { wordIndex: 4250, word: "hello", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 4305, word: "hi", definitionMatch: 0.95, intensity: 0.9 },
      { wordIndex: 4301, word: "hey", definitionMatch: 0.9, intensity: 0.9 },
      { wordIndex: 3971, word: "greetings", definitionMatch: 0.85, intensity: 1.2 }
    ]
  }],
  [3860, { // Goodbye
    canonicalWord: "goodbye",
    synonyms: [
      { wordIndex: 3860, word: "goodbye", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 1217, word: "bye", definitionMatch: 0.95, intensity: 0.8 },
      { wordIndex: -1, word: "farewell", definitionMatch: 0.8, intensity: 1.3 }
    ]
  }],
  [8106, { // Thanks
    canonicalWord: "thanks",
    synonyms: [
      { wordIndex: 8106, word: "thanks", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 8105, word: "thank you", definitionMatch: 1.0, intensity: 1.1 },
      { wordIndex: 473, word: "appreciate", definitionMatch: 0.8, intensity: 1.4 }
    ]
  }],
  [7738, { // Sorry
    canonicalWord: "sorry",
    synonyms: [
      { wordIndex: 7738, word: "sorry", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 449, word: "apologize", definitionMatch: 0.9, intensity: 1.3 },
      { wordIndex: -1, word: "my apologies", definitionMatch: 0.9, intensity: 1.2 }
    ]
  }],
  [6649, { // Please
    canonicalWord: "please",
    synonyms: [
      { wordIndex: 6649, word: "please", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: -1, word: "if you would", definitionMatch: 0.8, intensity: 1.1 },
      { wordIndex: -1, word: "could you", definitionMatch: 0.9, intensity: 0.9 }
    ]
  }],
  [8746, { // Yes
    canonicalWord: "yes",
    synonyms: [
      { wordIndex: 8746, word: "yes", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 8743, word: "yeah", definitionMatch: 0.95, intensity: 0.9 },
      { wordIndex: 1471, word: "certainly", definitionMatch: 0.8, intensity: 1.2 },
      { wordIndex: 21, word: "absolutely", definitionMatch: 0.75, intensity: 1.5 },
      { wordIndex: 3608, word: "indeed", definitionMatch: 0.7, intensity: 1.3 }
    ]
  }],
  [6109, { // No
    canonicalWord: "no",
    synonyms: [
      { wordIndex: 6109, word: "no", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: -1, word: "not really", definitionMatch: 0.8, intensity: 1.1 },
      { wordIndex: 3618, word: "incorrect", definitionMatch: 0.9, intensity: 1.2 }
    ]
  }],
  [6169, { // Okay / Acknowledge
    canonicalWord: "okay",
    synonyms: [
      { wordIndex: 6169, word: "okay", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 78, word: "acknowledge", definitionMatch: 0.7, intensity: 1.2 },
      { wordIndex: 8708, word: "understand", definitionMatch: 0.8, intensity: 1.0 },
      { wordIndex: -1, word: "got it", definitionMatch: 0.9, intensity: 0.9 },
      { wordIndex: 7635, word: "see", definitionMatch: 0.75, intensity: 0.9 },
      { wordIndex: -1, word: "makes sense", definitionMatch: 0.85, intensity: 1.0 }
    ]
  }],

  // --- B) Core Verbs of Action & Cognition ---
  [4252, { // Help
    canonicalWord: "help",
    synonyms: [
      { wordIndex: 4252, word: "help", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 592, word: "assist", definitionMatch: 0.95, intensity: 1.1 },
      { wordIndex: 236, word: "aid", definitionMatch: 0.9, intensity: 1.0 },
      { wordIndex: 7999, word: "support", definitionMatch: 0.8, intensity: 1.0 }
    ]
  }],
  [2515, { // Create
    canonicalWord: "create",
    synonyms: [
      { wordIndex: 2515, word: "create", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 3284, word: "generate", definitionMatch: 0.9, intensity: 1.1 },
      { wordIndex: 1177, word: "build", definitionMatch: 0.85, intensity: 1.0 },
      { wordIndex: 5476, word: "make", definitionMatch: 0.95, intensity: 0.9 },
      { wordIndex: 2199, word: "construct", definitionMatch: 0.8, intensity: 1.2 }
    ]
  }],
  [2993, { // Explain
    canonicalWord: "explain",
    synonyms: [
      { wordIndex: 2993, word: "explain", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 2831, word: "describe", definitionMatch: 0.9, intensity: 1.0 },
      { wordIndex: -1, word: "clarify", definitionMatch: 0.85, intensity: 1.1 },
      { wordIndex: -1, word: "elaborate on", definitionMatch: 0.8, intensity: 1.2 }
    ]
  }],
  [7004, { // Provide
    canonicalWord: "provide",
    synonyms: [
      { wordIndex: 7004, word: "provide", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 6161, word: "offer", definitionMatch: 0.85, intensity: 1.0 },
      { wordIndex: 7652, word: "share", definitionMatch: 0.7, intensity: 0.9 },
      { wordIndex: 6847, word: "present", definitionMatch: 0.8, intensity: 1.1 },
      { wordIndex: 3835, word: "give", definitionMatch: 0.95, intensity: 0.9 }
    ]
  }],
  [3105, { // Find
    canonicalWord: "find",
    synonyms: [
      { wordIndex: 3105, word: "find", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 5275, word: "locate", definitionMatch: 0.95, intensity: 1.1 },
      { wordIndex: 2911, word: "discover", definitionMatch: 0.8, intensity: 1.3 },
      { wordIndex: -1, word: "look up", definitionMatch: 0.9, intensity: 0.9 },
      { wordIndex: 7351, word: "retrieve", definitionMatch: 0.85, intensity: 1.2 }
    ]
  }],
  [7687, { // Show
    canonicalWord: "show",
    synonyms: [
      { wordIndex: 7687, word: "show", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 2901, word: "display", definitionMatch: 0.9, intensity: 1.1 },
      { wordIndex: -1, word: "illustrate", definitionMatch: 0.8, intensity: 1.2 },
      { wordIndex: 2795, word: "demonstrate", definitionMatch: 0.85, intensity: 1.3 }
    ]
  }],

  // --- C) Adjectives of Quality & State ---
  [3968, { // Great / Good
    canonicalWord: "great",
    synonyms: [
      { wordIndex: 3968, word: "great", definitionMatch: 1.0, intensity: 1.2 },
      { wordIndex: 3862, word: "good", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 3045, word: "fantastic", definitionMatch: 0.9, intensity: 1.5 },
      { wordIndex: 8652, word: "wonderful", definitionMatch: 0.9, intensity: 1.4 },
      { wordIndex: 714, word: "awesome", definitionMatch: 0.85, intensity: 1.6 },
      { wordIndex: 325, word: "amazing", definitionMatch: 0.85, intensity: 1.6 },
      { wordIndex: 2980, word: "excellent", definitionMatch: 0.95, intensity: 1.4 },
      { wordIndex: 7993, word: "superb", definitionMatch: 0.8, intensity: 1.7 }
    ]
  }],
  [701, { // Bad / Wrong
    canonicalWord: "bad",
    synonyms: [
      { wordIndex: 701, word: "bad", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 8676, word: "wrong", definitionMatch: 0.9, intensity: 1.0 },
      { wordIndex: 3618, word: "incorrect", definitionMatch: 0.9, intensity: 1.1 },
      { wordIndex: 6699, word: "poor", definitionMatch: 0.8, intensity: 1.2 },
      { wordIndex: -1, word: "flawed", definitionMatch: 0.7, intensity: 1.3 }
    ]
  }],
  [3591, { // Important
    canonicalWord: "important",
    synonyms: [
      { wordIndex: 3591, word: "important", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 2548, word: "crucial", definitionMatch: 0.9, intensity: 1.5 },
      { wordIndex: 8612, word: "vital", definitionMatch: 0.9, intensity: 1.4 },
      { wordIndex: 7674, word: "significant", definitionMatch: 0.95, intensity: 1.2 },
      { wordIndex: 4868, word: "key", definitionMatch: 0.8, intensity: 1.1 }
    ]
  }],
  [7695, { // Simple / Easy
    canonicalWord: "simple",
    synonyms: [
      { wordIndex: 7695, word: "simple", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 2748, word: "easy", definitionMatch: 0.9, intensity: 0.9 },
      { wordIndex: 7949, word: "straightforward", definitionMatch: 0.85, intensity: 1.1 },
      { wordIndex: 762, word: "basic", definitionMatch: 0.9, intensity: 0.8 }
    ]
  }],
  [2875, { // Difficult / Complex
    canonicalWord: "difficult",
    synonyms: [
      { wordIndex: 2875, word: "difficult", definitionMatch: 1.0, intensity: 1.0 },
      { wordIndex: 2154, word: "complex", definitionMatch: 0.9, intensity: 1.1 },
      { wordIndex: 1486, word: "challenging", definitionMatch: 0.85, intensity: 1.0 },
      { wordIndex: 2165, word: "complicated", definitionMatch: 0.9, intensity: 1.1 },
      { wordIndex: 8308, word: "tough", definitionMatch: 0.95, intensity: 1.0 }
    ]
  }]
]);