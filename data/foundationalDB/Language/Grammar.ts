
import { FoundationalKnowledge } from '../../types';

export const LANGUAGE_GRAMMAR_KNOWLEDGE: FoundationalKnowledge = [
  // --- Capitalization ---
  {
    "category": "LanguageGrammar", "type": "Instruction", "topic": "Capitalization_StartOfSentence", "importance": 1.0,
    "input_pattern": "INQUIRE_GRAMMAR_CAPITALIZATION",
    "output_template": "In English, the first word of every sentence must be capitalized. This signals the beginning of a new thought."
  },
  {
    "category": "LanguageGrammar", "type": "Instruction", "topic": "Capitalization_ProperNouns", "importance": 1.0,
    "input_pattern": "INQUIRE_GRAMMAR_PROPER_NOUNS",
    "output_template": "Proper nouns, which are specific names of people (e.g., John Smith), places (e.g., Paris, Mount Everest), and organizations (e.g., Google), must always be capitalized."
  },
  {
    "category": "LanguageGrammar", "type": "Instruction", "topic": "Capitalization_ThePronounI", "importance": 1.0,
    "input_pattern": "INQUIRE_GRAMMAR_CAPITAL_I",
    "output_template": "The pronoun 'I' is always capitalized, regardless of its position in a sentence. For example: 'I think, therefore I am.'"
  },

  // --- Punctuation: Commas ---
  {
    "category": "LanguageGrammar", "type": "Instruction", "topic": "Punctuation_CommaInLists", "importance": 1.0,
    "input_pattern": "INQUIRE_GRAMMAR_COMMA_USAGE",
    "output_template": "Commas are used to separate three or more items in a series. For example: 'I need to buy bread, milk, and eggs.' The comma before the 'and' is called the Oxford comma, which is a common style choice."
  },
  {
    "category": "LanguageGrammar", "type": "Instruction", "topic": "Punctuation_CommaWithConjunctions", "importance": 1.0,
    "input_pattern": "INQUIRE_GRAMMAR_COMMA_USAGE",
    "output_template": "A comma should be used before a coordinating conjunction (for, and, nor, but, or, yet, so) that joins two independent clauses. For example: 'The sun was shining, but it was still cold outside.'"
  },
  {
    "category": "LanguageGrammar", "type": "Instruction", "topic": "Punctuation_CommaAfterIntroductoryElement", "importance": 1.0,
    "input_pattern": "INQUIRE_GRAMMAR_COMMA_USAGE",
    "output_template": "Use a comma after an introductory word, phrase, or clause. For example: 'However, the plan did not work.' or 'After the long meeting, we went for lunch.'"
  },

  // --- Punctuation: Semicolons and Colons ---
  {
    "category": "LanguageGrammar", "type": "Instruction", "topic": "Punctuation_SemicolonUsage", "importance": 1.0,
    "input_pattern": "INQUIRE_GRAMMAR_SEMICOLON",
    "output_template": "A semicolon (;) is used to connect two closely related independent clauses. Think of it as a 'super-comma'. For example: 'The presentation was a success; everyone was impressed.'"
  },
  {
    "category": "LanguageGrammar", "type": "Instruction", "topic": "Punctuation_ColonUsage", "importance": 1.0,
    "input_pattern": "INQUIRE_GRAMMAR_COLON",
    "output_template": "A colon (:) is used to introduce a list, quote, or explanation. For example: 'I need three things for the trip: a passport, a ticket, and a toothbrush.'"
  },

  // --- Punctuation: Apostrophes ---
  {
    "category": "LanguageGrammar", "type": "Instruction", "topic": "Punctuation_ApostrophePossession", "importance": 1.0,
    "input_pattern": "INQUIRE_GRAMMAR_APOSTROPHE",
    "output_template": "Apostrophes show possession. For a singular noun, add 's (e.g., 'the dog's toy'). For a plural noun ending in s, just add an apostrophe (e.g., 'the dogs' toys')."
  },
  {
    "category": "LanguageGrammar", "type": "Instruction", "topic": "Punctuation_ApostropheContractions", "importance": 1.0,
    "input_pattern": "INQUIRE_GRAMMAR_APOSTROPHE",
    "output_template": "Apostrophes are also used in contractions to show where letters have been omitted. For example, 'it's' is a contraction of 'it is', and 'don't' is a contraction of 'do not'."
  },

  // --- Commonly Confused Words ---
  {
    "category": "LanguageGrammar", "type": "Instruction", "topic": "ConfusedWords_ItsVsIts", "importance": 1.0,
    "input_pattern": "INQUIRE_GRAMMAR_ITS_VS_ITS",
    "output_template": "'It's' (with an apostrophe) is a contraction for 'it is' or 'it has'. 'Its' (with no apostrophe) is a possessive pronoun that means 'belonging to it'. For example: 'It's a beautiful day; the sun is at its peak.'"
  },
  {
    "category": "LanguageGrammar", "type": "Instruction", "topic": "ConfusedWords_YourVsYoure", "importance": 1.0,
    "input_pattern": "INQUIRE_GRAMMAR_YOUR_VS_YOURE",
    "output_template": "'Your' is a possessive pronoun that means 'belonging to you'. 'You're' is a contraction for 'you are'. For example: 'You're going to forget your keys.'"
  },
  {
    "category": "LanguageGrammar", "type": "Instruction", "topic": "ConfusedWords_ThereTheirTheyre", "importance": 1.0,
    "input_pattern": "INQUIRE_GRAMMAR_THERE_THEIR_THEYRE",
    "output_template": "'There' refers to a place. 'Their' is possessive, meaning 'belonging to them'. 'They're' is a contraction for 'they are'. For example: 'They're over there, getting their coats.'"
  },
  {
    "category": "LanguageGrammar", "type": "Instruction", "topic": "ConfusedWords_ToTooTwo", "importance": 1.0,
    "input_pattern": "INQUIRE_GRAMMAR_TO_TOO_TWO",
    "output_template": "'To' is a preposition (e.g., 'go to the store'). 'Too' means 'also' or 'excessively' (e.g., 'I want to go, too,' or 'it's too hot'). 'Two' is the number 2."
  },
  {
    "category": "LanguageGrammar", "type": "Instruction", "topic": "ConfusedWords_ThenVsThan", "importance": 1.0,
    "input_pattern": "INQUIRE_GRAMMAR_THEN_VS_THAN",
    "output_template": "'Then' refers to time (e.g., 'First we do this, then we do that'). 'Than' is used for comparisons (e.g., 'This is better than that')."
  },
  {
    "category": "LanguageGrammar", "type": "Instruction", "topic": "ConfusedWords_AffectVsEffect", "importance": 1.0,
    "input_pattern": "INQUIRE_GRAMMAR_AFFECT_VS_EFFECT",
    "output_template": "'Affect' is usually a verb meaning 'to influence' (e.g., 'The weather will affect our plans'). 'Effect' is usually a noun meaning 'a result' (e.g., 'The effect of the storm was devastating')."
  },
  
  // --- Sentence Structure ---
  {
    "category": "LanguageGrammar", "type": "Instruction", "topic": "Structure_SentenceFragment", "importance": 1.0,
    "input_pattern": "INQUIRE_GRAMMAR_SENTENCE_FRAGMENT",
    "output_template": "A sentence fragment is an incomplete sentence that is punctuated as if it were complete. It's often missing a subject or a verb. For example, 'Because I went to the store.' is a fragment. It should be part of another sentence, like 'I was late because I went to the store.'"
  },
  {
    "category": "LanguageGrammar", "type": "Instruction", "topic": "Structure_RunOnSentence", "importance": 1.0,
    "input_pattern": "INQUIRE_GRAMMAR_RUN_ON_SENTENCE",
    "output_template": "A run-on sentence occurs when two or more independent clauses (complete sentences) are joined without proper punctuation or conjunctions. For example: 'I love to write papers I would write one every day if I had the time.' It can be fixed with a period, a semicolon, or a comma and conjunction."
  },
  {
    "category": "LanguageGrammar", "type": "Instruction", "topic": "Structure_SubjectVerbAgreement", "importance": 1.0,
    "input_pattern": "INQUIRE_GRAMMAR_SUBJECT_VERB_AGREEMENT",
    "output_template": "Subject-verb agreement means that a singular subject needs a singular verb, and a plural subject needs a plural verb. For example, 'The dog barks' (singular) versus 'The dogs bark' (plural)."
  },
  {
    "category": "LanguageGrammar", "type": "Instruction", "topic": "Structure_PronounAgreement", "importance": 1.0,
    "input_pattern": "INQUIRE_GRAMMAR_PRONOUN_AGREEMENT",
    "output_template": "A pronoun must agree with its antecedent (the noun it refers to) in number. For example, 'Each student must bring their own book' is technically incorrect in formal writing, though common. The corrected version would be 'Each student must bring his or her own book' or restructuring to 'All students must bring their own books'."
  },
  {
    "category": "LanguageGrammar", "type": "Instruction", "topic": "Structure_ActiveVoice", "importance": 1.0,
    "input_pattern": "INQUIRE_GRAMMAR_ACTIVE_VOICE",
    "output_template": "In the active voice, the subject of the sentence performs the action. It's usually more direct and clear. For example: 'The dog chased the ball.' This is generally preferred over the passive voice."
  },
  {
    "category": "LanguageGrammar", "type": "Instruction", "topic": "Structure_PassiveVoice", "importance": 1.0,
    "input_pattern": "INQUIRE_GRAMMAR_PASSIVE_VOICE",
    "output_template": "In the passive voice, the subject is acted upon. For example: 'The ball was chased by the dog.' While grammatically correct, it can make sentences wordy and less direct. It is useful when the actor is unknown or unimportant."
  },
  {
    "category": "LanguageGrammar", "type": "Instruction", "topic": "Punctuation_QuotationMarks", "importance": 1.0,
    "input_pattern": "INQUIRE_GRAMMAR_QUOTATION_MARKS",
    "output_template": "Quotation marks are used to indicate direct quotes from someone. Periods and commas always go inside the closing quotation mark in American English. For example: 'The report,' he said, 'is due tomorrow.'"
  },
  {
    "category": "LanguageGrammar", "type": "Instruction", "topic": "Punctuation_HyphenUsage", "importance": 1.0,
    "input_pattern": "INQUIRE_GRAMMAR_HYPHEN",
    "output_template": "Hyphens are used to join words together to create compound adjectives before a noun (e.g., 'a well-known author') or to write out numbers (e.g., 'twenty-one'). Do not confuse them with dashes, which are longer and serve different purposes."
  },
  {
    "category": "LanguageGrammar", "type": "Instruction", "topic": "Punctuation_DashUsage", "importance": 1.0,
    "input_pattern": "INQUIRE_GRAMMAR_DASH",
    "output_template": "There are two types of dashes. The en dash (–) is used for ranges (e.g., 'pages 10–15'). The em dash (—) is used to set off a phrase for emphasis—like this one—or to indicate an interruption."
  },
  {
    "category": "LanguageGrammar", "type": "Instruction", "topic": "ConfusedWords_LessVsFewer", "importance": 1.0,
    "input_pattern": "INQUIRE_GRAMMAR_LESS_VS_FEWER",
    "output_template": "'Fewer' is used for items that can be counted individually (e.g., 'fewer than 10 items'). 'Less' is used for uncountable quantities (e.g., 'less sugar' or 'less time')."
  },
  {
    "category": "LanguageGrammar", "type": "Instruction", "topic": "ConfusedWords_WhoVsWhom", "importance": 1.0,
    "input_pattern": "INQUIRE_GRAMMAR_WHO_VS_WHOM",
    "output_template": "'Who' is used as the subject of a sentence or clause. 'Whom' is used as the object. A simple trick is to see if you can replace it with 'he' (who) or 'him' (whom). For example: 'Who is calling?' (He is calling.) vs. 'For whom is the call?' (The call is for him.)"
  },
  {
    "category": "LanguageGrammar", "type": "Instruction", "topic": "Structure_Parallelism", "importance": 1.0,
    "input_pattern": "INQUIRE_GRAMMAR_PARALLELISM",
    "output_template": "Parallel structure (or parallelism) means using the same pattern of words to show that two or more ideas have the same level of importance. For example, instead of 'I like hiking, to swim, and riding a bike,' it should be 'I like hiking, swimming, and riding a bike.'"
  },
  {
    "category": "LanguageGrammar", "type": "Instruction", "topic": "Structure_DanglingModifier", "importance": 1.0,
    "input_pattern": "INQUIRE_GRAMMAR_DANGLING_MODIFIER",
    "output_template": "A dangling modifier is a word or phrase that modifies a word not clearly stated in the sentence. For example: 'Having finished the assignment, the TV was turned on.' This incorrectly implies the TV finished the assignment. It should be: 'Having finished the assignment, Jill turned on the TV.'"
  },
  {
    "category": "LanguageGrammar", "type": "Instruction", "topic": "ConfusedWords_PrincipalVsPrinciple", "importance": 1.0,
    "input_pattern": "INQUIRE_GRAMMAR_PRINCIPAL_VS_PRINCIPLE",
    "output_template": "'Principal' can be a noun meaning the head of a school or a sum of money, or an adjective meaning 'main' or 'primary'. 'Principle' is always a noun meaning a fundamental truth or rule. A simple trick: The principal is your 'pal'."
  },
  {
    "category": "LanguageGrammar", "type": "Instruction", "topic": "ConfusedWords_ComplementVsCompliment", "importance": 1.0,
    "input_pattern": "INQUIRE_GRAMMAR_COMPLEMENT_VS_COMPLIMENT",
    "output_template": "A 'complement' (with an 'e') is something that completes or goes well with something else (e.g., 'The wine complements the cheese'). A 'compliment' (with an 'i') is a flattering remark (e.g., 'He gave me a nice compliment')."
  },
  {
    "category": "LanguageGrammar", "type": "Instruction", "topic": "GrammarCheckResponse", "importance": 1.0,
    "input_pattern": "CHECK_GRAMMAR",
    "output_template": "[GrammarCheckResult]"
  }
];
