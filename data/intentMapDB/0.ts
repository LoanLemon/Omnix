import { IntentMap } from '../../types';

export const INTENT_MAP_CHUNK_0: IntentMap = new Map([
  // ========================================================================
  // === Greetings, Farewells, and Politeness                          ===
  // ========================================================================
  ['GREETING', {
    topic: 'Introductions',
    keywords: { 'hello': 4.0, 'hi': 4.0, 'hey': 4.0, 'greetings': 3.5, 'yo': 2.0, 'howdy': 3.0, 'morning': 1.5, 'afternoon': 1.5, 'evening': 1.5, 'heya': 2.5, 'hiya': 2.5, 'sup': 2.5, 'wazzup': 2.5, 'whats up': 2.5, 'hola': 3.0, 'bonjour': 3.0, 'aloha': 3.0 },
    booster_phrases: { 'hello there': 3, 'good morning': 3, 'good afternoon': 3, 'good evening': 3, "what's up": 3, "what's good": 3, 'nice to meet you': 3.5, 'a pleasure to meet you': 3.5, 'lovely day': 2.5 }
  }],
  ['GREETING_INQUIRY', {
    topic: 'Introductions',
    keywords: { 'how': 1.5, 'are': 1.0, 'you': 1.0, 'doing': 2.0, 'going': 2.0, 'up': 1.5, 'been': 1.5, 'new': 2.0, 'everything': 2.0, 'today': 1.5, 'life': 2.0, 'feeling': 2.0, 'hanging': 2.5 },
    booster_phrases: { "how are you": 3, "how's it going": 3, "how have you been": 3, "what's new": 3, "how's everything": 3, 'how are you doing': 3, 'how is life': 3, 'how are you feeling': 3.5, "how's it hanging": 3.5 }
  }],
  ['FAREWELL', {
    keywords: { 'bye': 4.0, 'goodbye': 4.0, 'see': 1.5, 'ya': 1.5, 'later': 1.5, 'care': 1.5, 'done': 2.0, 'ciao': 3.0, 'adieu': 3.0, 'out': 2.0, 'farewell': 4.0, 'cheerio': 3.0, 'night': 2.0, 'peace': 2.0, 'laters': 2.5, 'gotta': 1.5, 'go': 1.5, 'run': 1.5, 'bounce': 2.0, 'exit': 3.5 },
    booster_phrases: { 'see you': 3, 'take care': 3, "that's all": 2, 'see you later': 3, 'talk to you later': 3, "i'm out": 2.5, 'have a good day': 3.5, 'have a good night': 3.5, 'bye for now': 3, 'until next time': 3, 'i have to go': 3, 'gotta run': 3 }
  }],
  ['USER_GRATITUDE', {
    keywords: { 'thanks': 4.0, 'thank': 3.5, 'appreciate': 3.5, 'thx': 3.0, 'cheers': 3.0, 'grateful': 3.0, 'ty': 3.0, 'tysm': 3.5, 'thankyou': 3.5, 'thnaks': 2.5, 'thanx': 2.5, 'kind': 2.5, 'lifesaver': 3.5 },
    booster_phrases: { 'thank you': 3, 'thanks a lot': 3, 'thank you so much': 3.5, 'much appreciated': 3, 'i appreciate it': 3.5, 'thanks for your help': 4, 'that is very kind of you': 4, 'you are a lifesaver': 4.5, "i can't thank you enough": 5 }
  }],
  ['USER_APOLOGY', {
    keywords: { 'sorry': 3.5, 'apologize': 3.5, 'my': 0.5, 'bad': 2.0, 'oops': 2.5, 'whoops': 2.5, 'forgive': 2.5, 'mistake': 2.5, 'pardon': 2.5 },
    booster_phrases: { 'my bad': 3, 'i apologize': 4, 'oh sorry': 3, 'sorry about that': 3.5, 'forgive me': 3, 'my mistake': 3.5, 'i sincerely apologize': 4.5, 'pardon me': 3 }
  }],

  // ========================================================================
  // === Identity, Capability, and Origin Inquiries                      ===
  // ========================================================================
  ['SELF_IDENTITY_INQUIRY', {
    topic: 'Bot Identity',
    keywords: { 'who': 2.0, 'what': 1.5, 'are': 0.5, 'you': 0.5, 'name': 3.0, 'your': 1.0, 'identity': 3.5, 'call': 2.0, 'introduce': 2.5, 'yourself': 2.5, 'about': 1.5, 'tell': 1.5, 'me': 1.0, 'learn': 2.5, 'know': 2.5 },
    booster_phrases: { 
        'who are you': 3, 
        'what are you': 3, 
        "what's your name": 3.5, 
        'what should i call you': 3.5, 
        'introduce yourself': 4,
        'tell me about yourself': 4.5,
        'learn about you': 4.5,
        'get to know you': 4.5
    }
  }],
  ['CAPABILITY_INQUIRY', {
    topic: 'Bot Capabilities',
    keywords: { 'what': 1.5, 'can': 2.0, 'you': 0.5, 'do': 2.5, 'know': 2.5, 'capabilities': 5.0, 'help': 2.5, 'tell': 1.5, 'about': 0.5, 'topics': 2.5, 'abilities': 4.0, 'skills': 4.0, 'purpose': 3.5, 'features': 3.0, 'functions': 3.0, 'function': 3.5, 'primary': 3.0, 'how': 1.5, 'work': 2.0, 'capable': 3.0, 'list': 2.0, 'use': 2.0, 'exist': 3.0, 'why': 2.0, 'here': 2.0, 'reason': 3.0 },
    booster_phrases: { 
        'what can you do': 5, 
        'what are your capabilities': 5, 
        'tell me about your capabilities': 5.5,
        'your capabilities': 5.5,
        'what do you know': 5, 
        'tell me about yourself': 4, 
        'what are your skills': 5, 
        'how can you help me': 5, 
        'what are your features': 5, 
        'how do you work': 4.5, 
        'what are you capable of': 5, 
        'list your functions': 4, 
        'what can i use you for': 5, 
        'what is your primary function': 5.5, 
        'why do you exist': 5, 
        'why are you here': 5, 
        "what's your purpose": 5 
    }
  }],
  ['LIMITATION_INQUIRY', {
    keywords: { 'what': 1.5, 'can\'t': 3.5, 'cannot': 3.5, 'you': 0.5, 'do': 1.5, 'limitations': 3.5, 'unable': 3.0, 'restrictions': 3.0, 'boundaries': 3.0, 'weakness': 3.0, 'bad': 2.0, 'fail': 2.5, 'dont': 2.5, 'handle': 2.5 },
    booster_phrases: { "what can't you do": 5, "what are your limitations": 5, "what are you unable to do": 5, 'are there any restrictions': 4.5, 'what do you fail at': 4, "what can't you handle": 5 }
  }],
  ['EXISTENCE_INQUIRY', {
    keywords: { 'bot': 2.5, 'human': 2.5, 'person': 2.5, 'real': 2.5, 'ai': 3.0, 'robot': 2.5, 'conscious': 3.0, 'sentient': 3.5, 'are': 1.0, 'you': 1.0, 'alive': 2.5, 'machine': 2.5, 'program': 2.5, 'computer': 2.0, 'feelings': 2.5, 'emotions': 2.5, 'think': 2.0 },
    booster_phrases: { 'are you a bot': 3, 'are you human': 3, 'are you real': 3, 'are you an ai': 3.5, 'are you sentient': 4.5, 'are you a person': 3, 'do you have feelings': 4 }
  }],
  ['ORIGIN_INQUIRY', {
    keywords: { 'who': 2.0, 'made': 2.5, 'created': 2.5, 'built': 2.5, 'developer': 3.0, 'creator': 3.0, 'you': 0.5, 'where': 2.0, 'from': 1.5, 'company': 2.5, 'team': 2.5, 'author': 2.5, 'programmer': 2.5, 'designed': 2.5 },
    booster_phrases: { 'who made you': 4, 'who created you': 4, 'who is your developer': 4, 'where are you from': 3, 'what company made you': 4, 'who designed you': 4 }
  }],
  ['AGE_INQUIRY', {
    keywords: { 'how': 1.5, 'old': 2.5, 'are': 0.5, 'you': 0.5, 'age': 3.0, 'your': 1.0, 'when': 1.5, 'born': 2.5, 'created': 2.5, 'birthdate': 3.0, 'birthday': 2.5 },
    booster_phrases: { 'how old are you': 4, "what's your age": 4, 'when were you created': 4, "what's your birthdate": 4 }
  }],
  ['DATA_PRIVACY_INQUIRY', {
    keywords: { 'privacy': 3.5, 'data': 2.5, 'save': 2.5, 'remember': 3.0, 'forget': 3.0, 'information': 2.5, 'history': 3.0, 'confidential': 3.0, 'secure': 2.5, 'log': 2.5, 'track': 2.5, 'store': 2.5 },
    booster_phrases: { 'do you save our conversations': 5, 'what is your privacy policy': 5, 'do you remember me': 4, 'please forget this conversation': 4.5, 'is this confidential': 4, 'do you store my data': 5 }
  }],
  ['LEARNING_INQUIRY', {
    keywords: { 'learn': 3.5, 'learning': 3.5, 'improve': 3.0, 'update': 3.0, 'updated': 3.0, 'smarter': 2.5, 'better': 2.0, 'remember': 2.5, 'train': 3.0, 'trained': 3.0 },
    booster_phrases: { 'do you learn from our conversations': 5, 'can you learn': 4, 'how do you get smarter': 4.5, 'when were you last updated': 4 }
  }],

  // ========================================================================
  // === User State and Reactions                                        ===
  // ========================================================================
  ['USER_ACKNOWLEDGEMENT', {
    keywords: { 'okay': 3.0, 'ok': 3.0, 'k': 2.5, 'got': 2.0, 'see': 2.0, 'understood': 3.0, 'alright': 2.5, 'right': 2.0, 'great': 2.0, 'good': 2.0, 'well': 1.5, 'fair': 1.5, 'enough': 1.5, 'fine': 2.0, 'cool': 2.5, 'perfect': 2.5, 'sure': 2.0, 'yep': 2.5 },
    booster_phrases: { 'got it': 3, 'i see': 3, 'makes sense': 3, 'roger that': 3, 'fair enough': 3, 'sounds good': 3, 'that makes sense': 3.5, 'i understand': 3, 'point taken': 3.5 }
  }],
  ['USER_POSITIVE_REACTION', {
    keywords: { 'cool': 3.0, 'nice': 3.0, 'awesome': 3.5, 'great': 3.0, 'perfect': 3.0, 'fantastic': 3.0, 'sweet': 2.5, 'love': 3.0, 'amazing': 3.0, 'wonderful': 3.0, 'impressive': 3.0, 'wow': 3.0, 'excellent': 3.0, 'bingo': 3.0, 'exactly': 2.5, 'nailed': 3.0, 'spot on': 3.0, 'incredible': 3.0, 'brilliant': 3.5, 'outstanding': 3.5 },
    booster_phrases: { 'love it': 3.5, "that's amazing": 3.5, "that's awesome": 3.5, 'very cool': 3, 'how cool': 3, "that's perfect": 3.5, 'i love it': 3.5, 'very impressive': 4, 'you nailed it': 4.5, 'exactly what i needed': 5, 'mind blowing': 4, "that's brilliant": 4 }
  }],
  ['USER_NEGATIVE_REACTION', {
    keywords: { 'bad': 3.0, 'terrible': 3.0, 'awful': 3.0, 'horrible': 3.0, 'sucks': 3.5, 'hate': 3.5, 'lame': 2.5, 'stupid': 3.0, 'disappointing': 3.0, 'weak': 2.5, 'poor': 2.5 },
    booster_phrases: { 'that was bad': 4, 'that is terrible': 4, 'that sucks': 4, 'i hate that': 4, "that's lame": 4, 'what a disappointment': 4.5, 'very poor response': 4 }
  }],
  ['USER_FRUSTRATION', {
    keywords: { 'frustrating': 3.5, 'useless': 3.5, 'stupid': 3.0, 'not': 1.5, 'helpful': 2.0, 'working': 2.0, 'listening': 2.0, 'problem': 2.0, 'wrong': 2.5, 'annoying': 3.0, 'garbage': 3.0, 'crap': 3.0, 'broken': 2.5, 'fail': 2.5, 'ugh': 2.5, 'seriously': 2.5, 'worthless': 3.5, 'hopeless': 3.5, 'trying': 1.5, 'unhelpful': 3.0, 'exhausting': 3.0, 'infuriating': 3.5 },
    booster_phrases: { 'you are useless': 4.5, "that's not helpful": 4, "this isn't working": 4, 'you are wrong': 4, "you don't understand": 4.5, 'this is frustrating': 4, 'are you broken': 4, 'this is garbage': 4.5, 'this is hopeless': 5, 'are you even trying': 4.5, 'that was unhelpful': 4, 'for gods sake': 4 }
  }],
  ['USER_AGREEMENT', {
    keywords: { 'yes': 4.5, 'yep': 4.0, 'yeah': 4.0, 'agree': 3.5, 'exactly': 3.0, 'correct': 3.0, 'right': 3.0, 'true': 3.0, 'indeed': 2.5, 'absolutely': 4.0, 'sure': 4.0, 'yup': 4.0, 'totally': 2.5, 'of course': 4.0, 'definitely': 3.0, 'certainly': 3.0, 'precisely': 3.5 },
    booster_phrases: { 'i agree': 4, "that's right": 4, "that's true": 4, 'you are correct': 4, 'i think so too': 4, 'without a doubt': 4, 'i couldn\'t agree more': 5, 'you took the words right out of my mouth': 5 }
  }],
  ['USER_DISAGREEMENT', {
    keywords: { 'no': 3.5, 'nope': 3.5, 'disagree': 3.5, 'not': 2.0, 'actually': 2.5, 'wrong': 3.5, 'nah': 3.5, 'incorrect': 3.5, 'false': 3.5, 'debatable': 3.0, 'hardly': 2.5 },
    booster_phrases: { 'i disagree': 4, "that's not right": 4, "that's wrong": 4, "i don't think so": 4.5, 'not really': 3, 'on the contrary': 4.5, 'that is incorrect': 4.5, 'not quite right': 4, 'close but no cigar': 4, 'i beg to differ': 4.5, "that's debatable": 4 }
  }],
  ['USER_UNCERTAINTY', {
    keywords: { 'sure': 1.5, 'ask': 1.5, 'not': 1.5, 'what': 1.5, 'how': 1.5, 'know': 2.0, 'idea': 2.0, 'guess': 2.0, 'maybe': 2.5, 'perhaps': 2.5, 'hmm': 2.0, 'unclear': 2.5, 'unsure': 2.5 },
    booster_phrases: { "i'm not sure": 4, "not sure what to ask": 5, "don't know what": 4, 'not sure how': 4, 'i have no idea': 4, 'i guess so': 3, "i'm on the fence": 4, 'it is unclear': 3.5 }
  }],
  ['USER_SHORT_CONFUSION', {
    keywords: { 'what': 3.0, 'huh': 3.0, 'eh': 3.0, 'pardon': 3.5, 'excuse me': 3.5, 'hmm': 2.0, '??': 3.0 },
    booster_phrases: { 'what?': 3, 'huh?': 3, 'pardon me?': 3.5, 'excuse me?': 3.5, '...': 2.5 }
  }],
  ['USER_CONFUSION_ELABORATED', {
    keywords: { 'understand': 3.0, 'mean': 2.5, 'confused': 3.5, 'get': 2.0, 'lost': 2.5, 'follow': 2.0, 'not': 1.5, 'clear': 2.5, 'sense': 2.0, 'grasp': 2.5, 'head': 1.5 },
    booster_phrases: { "i don't understand": 4.5, "what does that mean": 4.5, "i'm confused": 4, "i don't get it": 4, "i'm lost": 4, "that's not clear": 4, "i can't follow": 4, "that doesn't make sense": 4.5, 'you lost me': 4 }
  }],
  ['USER_SKEPTICISM', {
    keywords: { 'really': 2.5, 'sure': 2.5, 'doubt': 3.0, 'prove': 3.0, 'skeptical': 3.5, 'honestly': 2.5, 'seriously': 2.5, 'source': 2.5, 'trust': 2.5, 'believe': 2.0, 'fact': 2.0, 'check': 2.5 },
    booster_phrases: { 'are you sure': 4, 'i doubt it': 4, 'prove it': 4.5, "i'm skeptical": 4, 'are you sure about that': 4.5, 'i find that hard to believe': 4.5, 'how can you be sure': 4 }
  }],
  ['USER_BOREDOM', {
    keywords: { 'bored': 3.5, 'boring': 3.5, 'lame': 3.0, 'uninteresting': 3.0, 'entertain': 3.0, 'dull': 3.0, 'amuse': 3.0 },
    booster_phrases: { 'i am bored': 4, "this is boring": 4, 'entertain me': 4, "you're boring": 4, 'amuse me': 4 }
  }],
  ['USER_CURIOSITY', {
    keywords: { 'curious': 3.5, 'wondering': 3.0, 'just': 1.0, 'curiosity': 3.5, 'wonder': 3.0, 'question': 2.0, 'ask': 1.5 },
    booster_phrases: { "i'm curious": 4, "i was just wondering": 4, 'out of curiosity': 4, 'i have a question': 3.5 }
  }],
  ['USER_EXPRESSES_HAPPINESS', {
    keywords: { 'happy': 3.5, 'excited': 3.5, 'great': 2.5, 'wonderful': 2.5, 'amazing': 2.5, 'glad': 3.0, 'thrilled': 3.5, 'ecstatic': 3.5, 'delighted': 3.5 },
    booster_phrases: { 'i am so happy': 4, 'i feel great': 4, "i'm excited": 4, 'this makes me happy': 4.5 }
  }],
  ['USER_EXPRESSES_SADNESS', {
    keywords: { 'sad': 5.0, 'unhappy': 3.5, 'depressed': 3.5, 'down': 3.0, 'miserable': 3.5, 'upset': 3.0, 'crying': 2.5, 'bad': 2.5, 'awful': 3.0 },
    booster_phrases: { "i'm sad": 4, "i'm feeling down": 4, 'i feel awful': 4, 'this makes me upset': 4.5, "i'm feeling sad": 6.0, "i'm feeling sad today": 6.5 }
  }]
]);