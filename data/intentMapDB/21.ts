
import { IntentMap } from '../../types';

export const INTENT_MAP_CHUNK_21: IntentMap = new Map([
  ['REQUEST_MORE_INFO', {
    topic: 'Contextual Inquiry',
    keywords: { 'more': 3.5, 'else': 3.0, 'another': 2.5, 'further': 2.5, 'additional': 2.5, 'detail': 2.0, 'details': 2.0, 'about': 1.0, 'that': 1.0, 'something': 1.0 },
    booster_phrases: { 
        'tell me more': 5, 
        'tell me more about that': 6, 
        'what else do you know': 5, 
        'is there anything else': 4,
        'can you elaborate': 4.5,
        'give me more details': 5,
        'tell me something else': 4.5
    }
  }],
]);
