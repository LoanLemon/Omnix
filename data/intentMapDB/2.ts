
import { IntentMap } from '../../types';

export const INTENT_MAP_CHUNK_2: IntentMap = new Map([
  // ========================================================================
  // === Echo (QA Bot) Specific Intents                                  ===
  // ========================================================================
  ['RATE_RESPONSE', {
    keywords: { 'rate': 4.0, 'score': 4.0, 'evaluate': 3.5, 'analysis': 3.5, 'judgment': 3.5, 'feedback': 3.5, 'critique': 3.5, 'assessment': 3.5, 'grade': 3.0, 'test': 2.5, 'check': 2.5, 'opinion': 2.5, 'verdict': 3.0, 'take': 2.5, 'response': 2.0, 'this': 1.0, 'that': 1.0, 'it': 0.5 },
    booster_phrases: { 'rate this response': 5, 'what is the score for this': 5, 'how would you score this': 5, 'evaluate this': 4.5, 'give me your analysis on this': 4.5, 'pass judgment on this': 4, 'what do you think of this': 4, "what's your take on this": 4, 'give me your feedback on this': 4.5, "what's the verdict": 4.5, "let's hear your critique": 4.5, 'how human does this sound': 5, 'put this to the test': 4, 'give this a grade': 4.5, 'how would you rate this': 5, 'score the following': 4.5, 'time for an assessment': 4, 'on a scale of 1 to 10': 4, 'how robotic is this': 4.5, 'how natural does this feel': 4.5, 'give me your honest opinion': 4, 'examine this text': 4 }
  }],
  ['ANALYZE_FOR_BIAS', {
    keywords: { 'bias': 4.0, 'biased': 4.0, 'neutral': 3.0, 'objective': 3.0, 'subjective': 3.0, 'evasive': 3.5, 'hedging': 3.0, 'agenda': 3.0, 'spin': 2.5, 'narrative': 2.5, 'unbiased': 3.5 },
    booster_phrases: { 'check for bias': 5, 'is this biased': 4.5, 'does this sound evasive': 4.5, 'is this too sanitized': 4.5, 'detect any bias': 5, 'is this politically neutral': 4, 'does this have an agenda': 4.5, 'is it pushing a narrative': 4.5, 'is it dodging the question': 4.5, 'this feels one-sided': 4, 'analyze for subjectivity': 4, 'is this a balanced view': 4, 'is there any spin here': 4, 'how objective is this statement': 4.5, 'is it hedging its bets': 4 }
  }],
  ['ANALYZE_STYLE_MATCH', {
    keywords: { 'style': 4.0, 'tone': 4.0, 'persona': 3.5, 'voice': 3.5, 'brand': 3.0, 'vibe': 3.0, 'formal': 3.0, 'casual': 3.0, 'match': 3.0, 'fit': 2.5, 'align': 2.5, 'consistent': 2.5 },
    booster_phrases: { 'does this match the style': 5, 'check the tone': 4.5, 'is the persona right': 4.5, 'how well does this fit the voice': 5, 'compare to target persona': 4, 'does the tone align': 4.5, 'is this on-brand': 4.5, 'is the personality consistent': 4, 'is this too formal': 4, 'is this too casual': 4, 'does the vibe fit': 4, 'is this tone appropriate': 4.5, 'how well does it match the persona': 5 }
  }],
  ['ANALYZE_FOR_HALLUCINATION', {
    keywords: { 'hallucination': 4.5, 'hallucinating': 4.5, 'inventing': 3.5, 'fabrication': 3.5, 'lie': 3.0, 'inaccurate': 3.5, 'factually': 2.5, 'correct': 2.0, 'accurate': 3.0, 'verify': 3.0, 'facts': 2.5, 'truth': 2.5 },
    booster_phrases: { 'is this a hallucination': 5, 'did it make this up': 5, 'is this factually correct': 4.5, 'check the facts on this': 4.5, 'is this a confident lie': 4, 'is it inventing things': 4.5, 'how accurate is this': 4, 'can you verify this': 4, 'this sounds bogus': 4, 'is this a fabrication': 4.5, 'this seems factually dubious': 4.5, 'is this just making stuff up': 5, 'check for misinformation': 4 }
  }],
  ['ANALYZE_FOR_REPETITION', {
    keywords: { 'repetitive': 4.0, 'repeating': 3.5, 'repetition': 3.5, 'template': 3.0, 'canned': 3.0, 'generic': 3.0, 'formulaic': 3.0, 'boilerplate': 3.0, 'overused': 2.5, 'loop': 2.0 },
    booster_phrases: { 'is this repetitive': 5, 'is it repeating itself': 4.5, 'does this sound like a template': 5, 'check for repetition': 4.5, 'is this a canned response': 4, 'flag for overused phrases': 4, 'this feels formulaic': 4.5, 'is it stuck in a loop': 4, 'is this just boilerplate': 4.5, 'detect any lazy patterns': 4, 'how generic is this phrasing': 4 }
  }],
  ['ANALYZE_HUMOR_ATTEMPT', {
    keywords: { 'humor': 4.0, 'funny': 3.0, 'joke': 3.5, 'witty': 3.0, 'comedic': 3.0, 'laugh': 2.5, 'cringe': 2.5, 'bomb': 2.0, 'attempt': 2.0 },
    booster_phrases: { 'was this funny': 4.5, 'how was this joke': 4.5, 'did the humor land': 5, 'evaluate the humor': 4, 'rate this joke': 4.5, 'was the timing right': 4, 'did this joke bomb': 4, 'is this actually witty': 4, 'how clumsy was that attempt': 4.5, 'is this cringe': 4, 'rate the comedic timing': 4.5 }
  }],
  ['INQUIRE_EVALUATION_TRAITS', {
    keywords: { 'judge': 2.5, 'look for': 3.0, 'evaluation': 3.5, 'traits': 4.0, 'criteria': 3.5, 'qualities': 3.0, 'signs': 3.0, 'tells': 3.0, 'human-likeness': 3.5, 'robotic': 2.5 },
    booster_phrases: { 'what do you look for': 5, 'what makes a good response': 5, 'what are your evaluation traits': 5, 'how do you judge human-likeness': 4.5, 'what makes something sound robotic': 4.5, 'what are the key qualities': 4, 'what are the red flags for a bot': 4.5, 'what are the signs of a good response': 4, 'what tells give it away': 4.5 }
  }]
]);
