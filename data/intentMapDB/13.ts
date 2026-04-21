
import { IntentMap } from '../../types';

export const INTENT_MAP_CHUNK_13: IntentMap = new Map([
  ['REQUEST_SIMPLIFICATION', {
    topic: 'Clarification',
    keywords: { 'explain': 3.0, 'simpler': 4.0, 'simple': 3.5, 'easier': 3.0, 'understand': 2.0, 'dumb': 2.5, 'down': 2.0, 'break': 2.5, 'basic': 2.5, 'layman': 3.0 },
    booster_phrases: { 
        'explain that in a simpler way': 5,
        'can you make it simpler': 5,
        'explain it to me like i am five': 5.5,
        'dumb it down for me': 5,
        'break that down': 4,
        'in basic terms': 4,
        'in layman\'s terms': 4.5
    }
  }]
]);
