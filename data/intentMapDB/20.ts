import { IntentMap } from '../../types';

export const INTENT_MAP_CHUNK_20: IntentMap = new Map([
  ['REQUEST_EXTERNAL_LOOKUP', {
    topic: 'External Knowledge',
    keywords: { 'look up': 4.0, 'lookup': 4.0, 'search for': 4.0, 'find information on': 3.5, 'google': 3.0, 'search': 3.0 },
    booster_phrases: { 'can you look up': 5, 'look up the definition of': 5, 'search for information about': 5 }
  }]
]);