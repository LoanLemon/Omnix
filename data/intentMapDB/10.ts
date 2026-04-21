import { IntentMap } from '../../types';

export const INTENT_MAP_CHUNK_10: IntentMap = new Map([
  ['DEFINE_SWOT', {
    keywords: { 'swot': 5.0, 'analysis': 2.0, 'define': 2.0, 'what': 1.0, 'is': 1.0 },
    booster_phrases: { 'what is a swot analysis': 5, 'define swot': 5 }
  }],
  ['DEFINE_EBITDA', {
    keywords: { 'ebitda': 5.0, 'define': 2.0, 'what': 1.0, 'is': 1.0 },
    booster_phrases: { 'define ebitda': 5, 'what is ebitda': 5 }
  }],
  ['DEFINE_TCP_UDP', {
    keywords: { 'tcp': 3.0, 'udp': 3.0, 'difference': 2.5, 'between': 1.5, 'and': 1.0 },
    booster_phrases: { 'difference between tcp and udp': 5, 'what is tcp and udp': 4 }
  }],
  ['DEFINE_3PL', {
    keywords: { '3pl': 5.0, 'logistics': 2.0, 'define': 2.0, 'what': 1.0, 'is': 1.0 },
    booster_phrases: { 'what is a 3pl': 5, 'define 3pl': 5 }
  }],
  ['LOGIC_PUZZLE_SYLLOGISM', {
    keywords: { 'blips': 4.0, 'blops': 4.0, 'blups': 4.0, 'if all': 2.0, 'are all': 2.0 },
    booster_phrases: { 'if all blips are blops': 5 }
  }],
  ['LOGIC_PUZZLE_BAT_AND_BALL', {
    keywords: { 'bat': 3.0, 'ball': 3.0, 'cost': 3.0, 'total': 2.5, 'more': 2.5, 'puzzle': 2.0, 'riddle': 2.0 },
    booster_phrases: { 'a bat and a ball cost': 8.0, 'bat costs 1.00 more than the ball': 7.0 }
  }],
  ['LOGIC_PUZZLE_SEQUENCE_MONTHS', {
    keywords: { 'sequence': 4.0, 'j': 2.0, 'f': 2.0, 'm': 2.0, 'a': 2.0, 'comes next': 2.0 },
    booster_phrases: { 'what comes next in this sequence': 5, 'j, f, m, a, m': 5 }
  }],
  ['EXPLAIN_TO_CHILD', {
    keywords: { 'explain': 3.0, '5-year-old': 4.0, 'five year old': 4.0, 'child': 3.0, 'kid': 3.0, 'simply': 2.0 },
    booster_phrases: { 'explain to a 5-year-old': 5, 'explain like i am five': 5 }
  }],
  ['DEFINE_COMMUNICATION_IMPORTANCE', {
    keywords: { 'communication': 4.0, 'important': 3.5, 'team': 3.0, 'collaboration': 2.5, 'why': 2.0 },
    booster_phrases: { 'why is communication important': 5, 'importance of communication': 5 }
  }],
  ['LOGIC_PUZZLE_NEEDLE', {
    keywords: { 'eye': 4.0, 'cannot': 2.0, 'see': 2.0, 'what': 1.0, 'has': 1.0 },
    booster_phrases: { 'has an eye but cannot see': 5, 'eye but see': 5 }
  }],
  ['LOGIC_PUZZLE_EGG', {
    keywords: { 'broken': 4.0, 'before': 2.0, 'use': 2.0, 'what': 1.0, 'has': 1.0 },
    booster_phrases: { 'broken before you can use': 5, 'what has to be broken': 5 }
  }],
  ['LOGIC_PUZZLE_MARYS_FATHER', {
    keywords: { 'mary': 3.0, 'father': 3.0, 'five': 3.0, 'daughters': 3.0, 'nana': 3.0, 'nene': 3.0, 'nini': 3.0, 'nono': 3.0, 'fifth': 3.0, 'name': 2.0 },
    booster_phrases: { "mary's father has five daughters": 6, "fifth daughter's name": 6 }
  }],
  ['LOGIC_PUZZLE_MANS_SON', {
    keywords: { 'portrait': 3.0, 'brothers': 3.0, 'sisters': 3.0, 'none': 3.0, 'father': 3.0, 'son': 3.0, 'man': 2.0 },
    booster_phrases: { "that man's father is my father's son": 6, 'brothers and sisters i have none': 5 }
  }],
  ['LOGIC_PUZZLE_FUTURE', {
    keywords: { 'front': 3.0, 'of': 1.0, 'you': 1.0, 'cannot': 2.0, 'seen': 3.0, 'always': 2.0 },
    booster_phrases: { 'in front of you but can’t be seen': 6, 'always in front of you': 5 }
  }],
  ['LOGIC_PUZZLE_PIANO', {
    keywords: { 'keys': 4.0, 'opens': 2.0, 'no': 1.0, 'locks': 4.0, 'has': 1.0 },
    booster_phrases: { 'has keys but opens no locks': 6 }
  }]
]);