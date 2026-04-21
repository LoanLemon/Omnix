import { IntentMap } from '../../types';

export const INTENT_MAP_CHUNK_16: IntentMap = new Map([
  ['CONSOLIDATE_NOTES_REQUEST', {
    keywords: { 'notes': 3.0, 'consolidate': 4.0, 'summary': 3.5, 'summarize': 4.0, 'tldr': 2.5, 'gist': 2.5 },
    booster_phrases: { 'here are my notes': 4, 'please consolidate them': 4, 'give me a summary': 4, 'can you summarize this': 4.5 }
  }],
  ['EXTRACT_ACTION_ITEMS_REQUEST', {
    keywords: { 'emails': 3.0, 'action items': 4.0, 'to-do': 3.5, 'tasks': 3.0, 'address': 2.5, 'follow up': 3.0 },
    booster_phrases: { 'here are all my emails': 4, 'are there any action items': 5, 'what do i need to address': 4, 'extract the action items': 5 }
  }],
]);
