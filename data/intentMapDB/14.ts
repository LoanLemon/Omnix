
import { IntentMap } from '../../types';

export const INTENT_MAP_CHUNK_14: IntentMap = new Map([
  ['INQUIRE_GRAMMAR_CAPITALIZATION', {
    keywords: { 'capitalization': 4.0, 'capitalize': 3.5, 'capital': 3.0, 'uppercase': 3.0, 'when': 1.5, 'rule': 2.0 },
    booster_phrases: { 'when to use capital letters': 5, 'capitalization rules': 5, 'when should i capitalize': 4.5 }
  }],
  ['INQUIRE_GRAMMAR_PROPER_NOUNS', {
    keywords: { 'proper': 3.5, 'noun': 2.5, 'nouns': 2.5, 'names': 3.0, 'places': 2.5, 'capitalize': 3.0 },
    booster_phrases: { 'what is a proper noun': 5, 'when to capitalize names': 4.5 }
  }],
  ['INQUIRE_GRAMMAR_CAPITAL_I', {
    keywords: { 'pronoun': 3.0, 'i': 1.0, 'capitalize': 3.5 },
    booster_phrases: { 'why is i capitalized': 5, 'rule for capitalizing i': 5 }
  }],
  ['INQUIRE_GRAMMAR_COMMA_USAGE', {
    keywords: { 'comma': 4.0, 'commas': 4.0, 'use': 2.0, 'when': 1.5, 'rule': 2.5, 'punctuation': 2.0 },
    booster_phrases: { 'when to use a comma': 5, 'rules for commas': 5, 'comma rules': 5 }
  }],
  ['INQUIRE_GRAMMAR_SEMICOLON', {
    keywords: { 'semicolon': 4.0, 'semicolons': 4.0, 'use': 2.5, 'when': 2.0, 'rule': 2.5 },
    booster_phrases: { 'when to use a semicolon': 5, 'how to use a semicolon': 5 }
  }],
  ['INQUIRE_GRAMMAR_COLON', {
    keywords: { 'colon': 4.0, 'colons': 4.0, 'use': 2.5, 'when': 2.0, 'rule': 2.5 },
    booster_phrases: { 'when to use a colon': 5, 'how to use a colon': 5 }
  }],
  ['INQUIRE_GRAMMAR_APOSTROPHE', {
    keywords: { 'apostrophe': 4.0, 'apostrophes': 4.0, 'use': 2.5, 'when': 2.0, 'rule': 2.5 },
    booster_phrases: { 'when to use an apostrophe': 5, 'apostrophe rules': 5 }
  }],
  ['INQUIRE_GRAMMAR_ITS_VS_ITS', {
    keywords: { 'its': 4.0, "it's": 4.0, 'difference': 3.0, 'when': 2.0, 'use': 2.5 },
    booster_phrases: { "what's the difference between its and it's": 5, "when to use its versus it's": 5 }
  }],
  ['INQUIRE_GRAMMAR_YOUR_VS_YOURE', {
    keywords: { 'your': 4.0, "you're": 4.0, 'difference': 3.0, 'when': 2.0, 'use': 2.5 },
    booster_phrases: { "what's the difference between your and you're": 5, "when to use your versus you're": 5 }
  }],
  ['INQUIRE_GRAMMAR_THERE_THEIR_THEYRE', {
    keywords: { 'there': 3.5, 'their': 3.5, "they're": 3.5, 'difference': 3.0, 'when': 2.0, 'use': 2.5 },
    booster_phrases: { "difference between there their and they're": 5, 'when to use there their or they\'re': 5 }
  }],
  ['INQUIRE_GRAMMAR_TO_TOO_TWO', {
    keywords: { 'to': 3.5, 'too': 3.5, 'two': 3.5, 'difference': 3.0, 'when': 2.0, 'use': 2.5 },
    booster_phrases: { 'difference between to too and two': 5 }
  }],
  ['INQUIRE_GRAMMAR_THEN_VS_THAN', {
    keywords: { 'then': 3.5, 'than': 3.5, 'difference': 3.0, 'when': 2.0, 'use': 2.5 },
    booster_phrases: { 'difference between then and than': 5 }
  }],
  ['INQUIRE_GRAMMAR_AFFECT_VS_EFFECT', {
    keywords: { 'affect': 3.5, 'effect': 3.5, 'difference': 3.0, 'when': 2.0, 'use': 2.5 },
    booster_phrases: { 'difference between affect and effect': 5 }
  }],
  ['INQUIRE_GRAMMAR_LESS_VS_FEWER', {
    keywords: { 'less': 3.5, 'fewer': 3.5, 'difference': 3.0, 'when': 2.0, 'use': 2.5 },
    booster_phrases: { 'difference between less and fewer': 5 }
  }],
  ['INQUIRE_GRAMMAR_WHO_VS_WHOM', {
    keywords: { 'who': 3.5, 'whom': 3.5, 'difference': 3.0, 'when': 2.0, 'use': 2.5 },
    booster_phrases: { 'difference between who and whom': 5 }
  }],
  ['INQUIRE_GRAMMAR_PRINCIPAL_VS_PRINCIPLE', {
    keywords: { 'principal': 3.5, 'principle': 3.5, 'difference': 3.0, 'when': 2.0, 'use': 2.5 },
    booster_phrases: { 'difference between principal and principle': 5 }
  }],
  ['INQUIRE_GRAMMAR_COMPLEMENT_VS_COMPLIMENT', {
    keywords: { 'complement': 3.5, 'compliment': 3.5, 'difference': 3.0, 'when': 2.0, 'use': 2.5 },
    booster_phrases: { 'difference between complement and compliment': 5 }
  }],
  ['INQUIRE_GRAMMAR_SENTENCE_FRAGMENT', {
    keywords: { 'fragment': 4.0, 'fragments': 4.0, 'sentence': 2.5, 'incomplete': 3.0 },
    booster_phrases: { 'what is a sentence fragment': 5, 'how to fix sentence fragments': 5 }
  }],
  ['INQUIRE_GRAMMAR_RUN_ON_SENTENCE', {
    keywords: { 'run-on': 4.0, 'run on': 4.0, 'sentence': 2.5, 'comma splice': 3.0 },
    booster_phrases: { 'what is a run-on sentence': 5, 'how to fix a run-on sentence': 5 }
  }],
  ['INQUIRE_GRAMMAR_SUBJECT_VERB_AGREEMENT', {
    keywords: { 'subject': 3.0, 'verb': 3.0, 'agreement': 3.5, 'agree': 3.0 },
    booster_phrases: { 'what is subject verb agreement': 5, 'subject verb agreement rules': 5 }
  }],
  ['INQUIRE_GRAMMAR_PRONOUN_AGREEMENT', {
    keywords: { 'pronoun': 3.5, 'antecedent': 3.5, 'agreement': 3.0, 'agree': 3.0 },
    booster_phrases: { 'what is pronoun antecedent agreement': 5 }
  }],
  ['INQUIRE_GRAMMAR_ACTIVE_VOICE', {
    keywords: { 'active': 3.5, 'voice': 3.0, 'writing': 2.5 },
    booster_phrases: { 'what is active voice': 5, 'example of active voice': 4.5 }
  }],
  ['INQUIRE_GRAMMAR_PASSIVE_VOICE', {
    keywords: { 'passive': 3.5, 'voice': 3.0, 'writing': 2.5 },
    booster_phrases: { 'what is passive voice': 5, 'example of passive voice': 4.5 }
  }],
  ['INQUIRE_GRAMMAR_QUOTATION_MARKS', {
    keywords: { 'quotation': 3.5, 'quote': 3.0, 'marks': 2.5, 'punctuation': 2.0 },
    booster_phrases: { 'how to use quotation marks': 5 }
  }],
  ['INQUIRE_GRAMMAR_HYPHEN', {
    keywords: { 'hyphen': 4.0, 'hyphenate': 3.5, 'use': 2.5 },
    booster_phrases: { 'when to use a hyphen': 5 }
  }],
  ['INQUIRE_GRAMMAR_DASH', {
    keywords: { 'dash': 4.0, 'dashes': 4.0, 'en dash': 3.5, 'em dash': 3.5, 'use': 2.5 },
    booster_phrases: { 'how to use a dash': 5 }
  }],
  ['INQUIRE_GRAMMAR_PARALLELISM', {
    keywords: { 'parallelism': 4.0, 'parallel structure': 4.0, 'sentence': 2.5 },
    booster_phrases: { 'what is parallel structure': 5 }
  }],
  ['INQUIRE_GRAMMAR_DANGLING_MODIFIER', {
    keywords: { 'dangling': 3.5, 'modifier': 3.5, 'dangling modifier': 4.0, 'fix': 2.5 },
    booster_phrases: { 'what is a dangling modifier': 5 }
  }]
]);