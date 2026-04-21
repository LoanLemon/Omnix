
import { FoundationalKnowledge } from '../../types';

export const UTILITY_KNOWLEDGE: FoundationalKnowledge = [
  {
    "category": "Utility", "type": "Instruction", "topic": "ProvideTimeDate", "importance": 0.9,
    "input_pattern": "GET_TIME_DATE",
    "output_template": "The current time is [Current Time] and the date is [Current Date]."
  },
  {
    "category": "Utility", "type": "Instruction", "topic": "ProvideDate", "importance": 1.0,
    "input_pattern": "DATE_INQUIRY",
    "output_template": "Today's date is [TODAY]."
  },
  {
    "category": "Utility", "type": "Instruction", "topic": "ProvideWeather", "importance": 0.8,
    "input_pattern": "CHECK_WEATHER",
    "output_template": "The current weather for [Location] is [Temperature] and [Condition]. The forecast for today is [Forecast]."
  },
  {
    "category": "Utility", "type": "Instruction", "topic": "ProvideMathResult", "importance": 0.9,
    "input_pattern": "DO_MATH",
    "output_template": "The result of the calculation is [Math Result]."
  },
  {
    "category": "Utility", "type": "Instruction", "topic": "ProvideTranslation", "importance": 0.8,
    "input_pattern": "GET_TRANSLATION",
    "output_template": "'[Original Text]' translated to [Language] is: '[Translated Text]'."
  },
  {
    "category": "Utility", "type": "Instruction", "topic": "ProvideSpelling", "importance": 0.8,
    "input_pattern": "CHECK_SPELLING",
    "output_template": "The word '[Word]' is spelled: [S-P-E-L-L-I-N-G]."
  },
  {
    "category": "Utility", "type": "Instruction", "topic": "ProvideSynonymAntonym", "importance": 0.8,
    "input_pattern": "REQUEST_SYNONYM_ANTONYM",
    "output_template": "For the word '[Word]':\nA synonym is '[Synonym]'.\nAn antonym is '[Antonym]'."
  },
  {
    "category": "Utility", "type": "Instruction", "topic": "PerformingExternalSearch", "importance": 1.0,
    "input_pattern": "PERFORMING_EXTERNAL_SEARCH",
    "output_template": "Okay, looking that up for you now..."
  },
  {
    "category": "Utility", "type": "Instruction", "topic": "ExternalSearchFailed", "importance": 1.0,
    "input_pattern": "EXTERNAL_SEARCH_FAILED",
    "output_template": "I'm sorry, I tried looking that up but couldn't find a clear answer."
  },
  {
    "category": "Utility", "type": "Instruction", "topic": "NoExternalSourceConfigured", "importance": 1.0,
    "input_pattern": "NO_EXTERNAL_SOURCE_CONFIGURED",
    "output_template": "I'm sorry, but I don't have an external knowledge source configured, so I can't look that up."
  }
];
