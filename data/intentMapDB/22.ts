
import { IntentMap } from '../../types';

export const INTENT_MAP_CHUNK_22: IntentMap = new Map([
  ['REQUEST_RECAP', {
    topic: 'Conversation Recap',
    keywords: { 'what': 2.0, 'are': 1.5, 'we': 1.5, 'doing': 3.0, 'talking': 3.0, 'about': 1.5, 'where': 2.0, 'were': 1.5 },
    booster_phrases: { 'what are we doing': 5, 'what are we talking about': 5, 'where were we': 4.5, 'give me a recap': 4 }
  }],
  ['REQUEST_TOPIC_INFO', {
    topic: 'General Topic Inquiry',
    keywords: { 'tell': 1.0, 'me': 0.2, 'about': 1.5, 'what': 0.5, 'can': 0.5, 'you': 0.2, 'know': 1.0, 'information': 2.0, 'on': 0.5 },
    booster_phrases: { 'tell me about': 3.5, 'what can you tell me about': 4, 'what do you know about': 4, 'give me information on': 3.5 }
  }],
]);
