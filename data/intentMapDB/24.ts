import { IntentMap } from '../../types';

export const INTENT_MAP_CHUNK_24: IntentMap = new Map([
  ['RECALL_USER_GOAL', {
    topic: 'Goal Recall',
    keywords: { 'what': 2.0, 'my': 1.5, 'goals': 4.0, 'goal': 3.5, 'am': 1.0, 'i': 1.0, 'doing': 3.0, 'tracking': 2.5 },
    booster_phrases: { 'what are my goals': 5, 'what is my goal': 4.5, 'what am i doing': 4 }
  }],
  ['RECALL_SHOPPING_LIST', {
    topic: 'Goal Recall',
    keywords: { 'what': 2.0, 'am': 1.0, 'i': 1.0, 'buying': 4.0, 'shopping': 3.5, 'list': 3.5, 'on': 1.0 },
    booster_phrases: { 'what am i buying': 5, 'what is on my shopping list': 5, "what's on my list": 4.5 }
  }],
  ['RECALL_SPENDING_BUDGET', {
    topic: 'Goal Recall',
    keywords: { 'what': 2.0, 'my': 1.5, 'budget': 4.0, 'spending': 3.5, 'how': 2.0, 'much': 2.5, 'money': 3.5, 'dollars': 3.5, 'have': 1.5, 'spend': 3.0, 'again': 1.0 },
    booster_phrases: { 'how much money do i have': 5, 'how many dollars do i have': 5, 'what is my spending budget': 5, 'do you know how much money i have': 6 }
  }],
]);