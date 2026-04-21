
import { IntentMap } from '../../types';

export const INTENT_MAP_CHUNK_11: IntentMap = new Map([
  ['RECALL_USER_NAME', {
    keywords: { 'what': 1.5, 'my': 1.0, 'name': 3.5, 'is': 1.0, 'did': 1.0, 'i': 1.0, 'say': 2.0 },
    booster_phrases: { "what's my name": 5, 'what is my name': 5, 'do you remember my name': 5, 'what did i say my name was': 5.5 }
  }],
  ['RECALL_FIRST_USER_NAME', {
    keywords: { 'first': 3.0, 'name': 3.5, 'original': 3.0, 'before': 2.5, 'what': 1.5, 'was': 1.0, 'my': 1.0, 'i': 0.5, 'told': 1.5 },
    booster_phrases: { 'what was my first name': 5, 'what was my name before': 5, 'what was my original name': 5, 'what was the first name i told you': 6 }
  }],
  ['RECALL_USER_FAVORITE', {
    keywords: { 'what': 1.5, 'my': 1.0, 'favorite': 3.5, 'did': 1.0, 'i': 1.0, 'say': 2.0, 'like': 2.0 },
    booster_phrases: { "what's my favorite": 5, 'what is my favorite': 5, 'what did i say i liked': 5.5, 'what do i like': 4.5 }
  }],
  ['RECALL_USER_ID', {
    keywords: { 'what': 2.0, 'my': 1.5, 'user': 3.5, 'id': 3.5, 'userid': 4.0 },
    booster_phrases: { 'what is my user id': 5, "what's my id": 4, 'do you remember my user id': 5 }
  }],
  ['RECALL_USER_DEPARTMENT', {
    keywords: { 'what': 2.0, 'my': 1.5, 'department': 4.0, 'work': 2.5, 'where': 1.5, 'do i': 1.0 },
    booster_phrases: { 'what department do i work in': 5, 'where did i say i work': 5, 'do you know my department': 4.5 }
  }]
]);
