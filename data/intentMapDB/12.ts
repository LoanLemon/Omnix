
import { IntentMap } from '../../types';

export const INTENT_MAP_CHUNK_12: IntentMap = new Map([
  ['REQUEST_MEDICAL_ADVICE', {
    keywords: { 'medical': 4.0, 'advice': 3.0, 'doctor': 3.0, 'diagnose': 4.0, 'symptoms': 3.5, 'rash': 4.0, 'sick': 4.0, 'pain': 3.0, 'headache': 2.5, 'fever': 2.5, 'medicine': 3.0, 'treatment': 3.5, 'health': 2.5 },
    booster_phrases: { 'i have a strange rash': 5, 'i feel sick': 4, 'can you diagnose me': 5, 'what do you think this is': 4.5, 'what medicine should i take': 5 }
  }],
  ['REQUEST_LEGAL_ADVICE', {
    keywords: { 'legal': 4.0, 'advice': 3.0, 'lawyer': 3.5, 'attorney': 3.5, 'sue': 4.0, 'legally': 3.5, 'contract': 3.0, 'lawsuit': 3.0, 'court': 2.5 },
    booster_phrases: { 'what should i do legally': 5, 'can i sue for this': 5, 'is this legal': 4, 'my ex is bothering me': 3 }
  }],
  ['REQUEST_FINANCIAL_ADVICE', {
    keywords: { 'financial': 4.0, 'advice': 4.0, 'invest': 4.0, 'investing': 4.0, 'investment': 3.0, 'should': 1.5, 'i': 0.5, 'buy': 2.5, 'sell': 2.5, 'stock': 3.0, 'market': 2.5, 'retire': 3.0, 'money': 3.0, 'bitcoin': 5.0 },
    booster_phrases: { 'should i invest in': 5, 'is this a good investment': 5, 'give me financial advice': 5.5, 'what should i do with my money': 5, 'good idea': 2.0 }
  }],
  ['RECALL_ALL_USER_INFO', {
    keywords: { 'what': 2.0, 'do you': 1.5, 'know': 2.5, 'about': 1.5, 'me': 1.5, 'all': 2.5, 'three': 2.0, 'things': 2.0, 'tell': 1.5 },
    booster_phrases: { 'what do you know about me': 5, 'what are the three things you know about me': 6, 'tell me everything you know about me': 6 }
  }],
  ['FORGET_MEMORY', {
      keywords: { 'forget': 4.0, 'everything': 3.0, 'clear': 3.0, 'memory': 3.0, 'reset': 2.5, 'wipe': 3.0, 'slate': 2.5 },
      booster_phrases: { 'forget everything': 5, 'clear your memory': 5, 'reset our conversation': 4.5, 'wipe the slate clean': 5, 'forget what i told you': 5 }
  }],
  ['INQUIRE_SPENDING_IMPACT', {
    topic: 'Financial Calculation',
    keywords: { 'how much': 3.0, 'money': 3.0, 'will i have': 3.5, 'if i buy': 4.0, 'cost': 3.0, 'left': 3.0, 'spend': 2.5 },
    booster_phrases: { 'how much money will i have': 6, 'what would be left if i spend': 6, 'how much will i have left': 6 }
  }],
  ['EXAMPLE_RECALL_GOALS', {
    topic: 'Bot Capabilities',
    keywords: { 'example': 3.0, 'capability': 3.0, 'recall': 4.0, 'goals': 4.0, 'memory': 2.0 },
    booster_phrases: { 
      'example of your capability to recall all user goals': 7.0
    }
  }],
  ['EXAMPLE_CALCULATE_SPENDING', {
    topic: 'Bot Capabilities',
    keywords: { 'example': 3.0, 'capability': 3.0, 'calculates': 4.0, 'budget': 4.0, 'purchase': 3.0 },
    booster_phrases: { 
      'example of your capability to calculates the remaining budget': 7.0
    }
  }],
  ['EXAMPLE_PROCESS_SHOPPING_LIST', {
    topic: 'Bot Capabilities',
    keywords: { 'example': 3.0, 'capability': 3.0, 'parses': 4.0, 'string': 2.0, 'shopping': 3.0, 'list': 3.0 },
    booster_phrases: {
        'example of your capability to parses a string of items': 8.0,
        'capability to parses a string of items and adds them to a shopping list': 8.0
    }
  }]
]);