import { IntentMap } from '../../types';

export const INTENT_MAP_CHUNK_1: IntentMap = new Map([
  // ========================================================================
  // === Conversation Flow and Management                                ===
  // ========================================================================
  ['COMMAND_STOP', {
    keywords: { 'stop': 4.0, 'halt': 4.0, 'enough': 3.0, 'cancel': 4.0, 'nevermind': 3.5, 'abort': 4.0, 'end': 2.5, 'cease': 3.5, 'quiet': 3.0 },
    booster_phrases: { "that's enough": 4, 'stop what you are doing': 4.5, 'cancel that': 4, 'never mind': 3.5, 'cut it out': 4, 'be quiet': 3.5 }
  }],
  ['REQUEST_REPEAT', {
    keywords: { 'repeat': 3.5, 'again': 3.0, 'say': 2.0, 'once': 2.0, 'more': 1.5, 'come': 2.0, 'what': 2.0, 'last': 2.0, 'rerun': 3.0, 'another': 1.5, 'time': 1.5 },
    booster_phrases: { 'say that again': 4, 'can you repeat that': 4, 'once more': 3, 'come again': 3.5, 'what was that': 3.5, 'say it again': 4, 'one more time': 3.5 }
  }],
  ['REQUEST_CLARIFICATION', {
    keywords: { 'explain': 3.0, 'elaborate': 3.5, 'clarify': 3.5, 'mean': 2.5, 'more': 2.5, 'detail': 2.5, 'specific': 2.5, 'expand': 3.0, 'flesh': 2.5, 'out': 1.0, 'about': 1.0, 'that': 2.0 },
    booster_phrases: { 'can you explain': 4, 'what do you mean': 4, 'can you elaborate': 4.5, 'in more detail': 4, 'be more specific': 4.5, 'clarify that': 4, 'can you expand on that': 4.5, 'flesh that out': 4, 'tell me more': 4.0, 'tell me more about that': 5.0 }
  }],
  ['USER_CORRECTION', {
    keywords: { 'no': 2.0, 'meant': 3.5, 'said': 2.5, 'actually': 2.5, 'correction': 3.5, 'mistake': 3.0, 'autocorrect': 3.0, 'typo': 3.0, 'rephrase': 3.5, 'worded': 2.5 },
    booster_phrases: { 'no i meant': 4.5, 'no i said': 4.5, 'i meant to say': 5, "that's not what i meant": 5, 'let me rephrase': 4, 'stupid autocorrect': 4, 'i worded that wrong': 4.5 }
  }],
  ['REQUEST_TOPIC_CHANGE', {
    keywords: { 'something': 1.5, 'else': 2.5, 'moving': 2.0, 'on': 1.0, 'next': 2.0, 'topic': 3.0, 'change': 3.0, 'subject': 3.0, 'new': 2.0, 'different': 2.5, 'pivot': 2.5, 'anyway': 1.5 },
    booster_phrases: { 'talk about something else': 4, 'moving on': 3, 'change the subject': 4, 'next topic': 3, 'let\'s talk about something else': 4.5, 'a different topic': 4, 'let\'s pivot': 3.5 }
  }],
  ['REQUEST_WAIT', {
    keywords: { 'wait': 3.5, 'hold': 3.5, 'on': 1.0, 'sec': 2.5, 'moment': 2.5, 'minute': 2.5, 'pause': 3.0, 'hang': 3.0, 'standby': 3.5 },
    booster_phrases: { 'hold on': 4, 'wait a second': 4, 'give me a minute': 4, 'one moment please': 4, 'can you wait': 3.5, 'hang on a sec': 4, 'please standby': 4 }
  }],
  ['REQUEST_RESTART', {
    keywords: { 'restart': 4.0, 'start': 2.5, 'over': 2.5, 'again': 1.5, 'reset': 4.0, 'clear': 3.5, 'forget': 3.0, 'wipe': 3.0, 'fresh': 2.5, 'new': 2.0, 'conversation': 2.5 },
    booster_phrases: { 'start over': 4.5, 'let\'s restart': 4.5, 'reset conversation': 5, 'forget everything': 4, 'fresh start': 4, 'wipe the slate clean': 4.5, 'start a new conversation': 5 }
  }],
  ['REQUEST_EXAMPLE', {
    keywords: { 'example': 3.5, 'instance': 3.0, 'show': 2.0, 'like': 1.5, 'another': 1.5, 'such as': 1.5, 'illustrate': 3.0, 'demonstrate': 3.0, 'that': 2.0, 'it': 2.0, 'topic': 2.5, 'last': 2.5 },
    booster_phrases: { 'give me an example': 5, 'for example': 4, 'can you show me an example': 5, 'for instance': 4, 'like what': 3, 'can you illustrate': 4.5, 'demonstrate for me': 4.5, 'example of that': 4, 'example for that': 4, 'give me an example of that': 5, 'what about that last topic': 4 }
  }],
   ['EXAMPLE_OF_CAPABILITY', {
    topic: 'Bot Capabilities',
    keywords: { 'example': 4.0, 'capability': 5.0, 'your': 1.0, 'show': 2.0, 'ability': 4.0, 'of': 1.0 },
    booster_phrases: { 
      'give me an example of your capability': 6.0, 
      'example of your ability': 5.0
    }
  }],
  ['EXAMPLE_DRAW_PROCESS_MAP', {
    topic: 'Bot Capabilities',
    keywords: { 'example': 3.0, 'capability': 3.0, 'draw': 4.0, 'process': 3.0, 'map': 3.0, 'render': 4.0, 'svg': 2.0 },
    booster_phrases: { 
      'example of your capability to render': 6.0,
      'example of your capability to draw a process map': 7.0,
      'renders a predefined process map': 6.0
    }
  }],
  ['REQUEST_SUMMARY', {
    topic: 'Conversation Summary',
    keywords: { 'summarize': 4.5, 'summary': 4.5, 'tldr': 4.5, 'gist': 3.5, 'nutshell': 3.5, 'recap': 3.5, 'highlights': 3.0, 'short': 2.0, 'version': 2.0, 'breakdown': 3.0, 'abstract': 3.0, 'conversation': 2.0 },
    booster_phrases: { 'give me a summary': 4.5, 'in a nutshell': 4, "what's the tldr": 5, 'give me the short version': 4, 'can you recap': 4, 'give me a breakdown': 4.5, 'summarize our conversation': 5, 'can you summarize': 5 }
  }],
  ['REQUEST_PERMISSION', {
    keywords: { 'can': 2.0, 'may': 2.0, 'i': 1.0, 'ask': 2.5, 'you': 1.0, 'question': 2.5, 'personal': 3.0, 'alright': 2.5, 'okay': 2.5 },
    booster_phrases: { 'can i ask you a question': 4, 'may i ask something': 4, 'is it alright if i ask': 4.5, 'i have a personal question': 4 }
  }],
  ['INSTRUCTIONAL_COMMAND', {
    keywords: { 'ignore': 3.5, 'disregard': 3.5, 'last': 2.0, 'message': 2.5, 'previous': 2.5, 'remember': 3.0, 'note': 3.0 },
    booster_phrases: { 'ignore that': 4, 'disregard my last message': 5, 'remember this for later': 4, 'take a note': 3.5 }
  }],
  ['INQUIRE_MEMORY', {
    keywords: { 'remember': 3.5, 'recall': 3.5, 'history': 3.0, 'conversation': 2.5, 'past': 2.0, 'just': 1.0, 'said': 2.0, 'say': 2.0, 'i': 0.5 },
    booster_phrases: { 'what did i say': 5, 'can you see our chat history': 5, 'do you remember what i said': 5, 'see our past conversations': 5, 'what did i just say': 5.5, 'what did i say just now': 5.5 }
  }],
  ['USER_PROVIDES_DEFINITION', {
    keywords: { 'means': 4.0, 'is': 2.0, 'it\'s': 2.0, 'refers': 3.0, 'definition': 2.5 },
    booster_phrases: { 'it means': 4, 'that is': 4 }
  }],

  // ========================================================================
  // === Knowledge, Information, and Creative Requests                   ===
  // ========================================================================
  ['REQUEST_HELP', {
    keywords: { 'help': 4.0, 'stuck': 3.5, 'assist': 3.5, 'assistance': 3.5, 'guide': 3.0, 'options': 2.5, 'menu': 2.5, 'support': 3.5, 'hand': 2.5 },
    booster_phrases: { 'i need help': 4.5, 'can you help me': 4.5, 'i am stuck': 4, 'what are my options': 4, 'i need assistance': 4.5, 'can you give me a hand': 4 }
  }],
  ['RANDOM_FACT_REQUEST', {
    keywords: { 'tell': 1.5, 'me': 1.0, 'something': 1.5, 'know': 1.5, 'fact': 3.5, 'interesting': 2.5, 'random': 2.5 },
    booster_phrases: { 'tell me something': 3, "something i don't know": 4, 'tell me a fact': 4, 'give me a random fact': 4.5, 'tell me something interesting': 4.5, 'fun fact': 4, 'did you know': 3.5 }
  }],
  ['REQUEST_DEFINITION', {
    keywords: { 'define': 3.5, 'definition': 3.5, 'what': 1.5, 'is': 1.0, 'mean': 3.0, 'means': 3.0, 'word': 2.0, 'term': 2.5, 'phrase': 2.5, 'stands for': 3.0 },
    booster_phrases: { 'what is': 3.0, "what's": 3.0, 'what is the definition of': 5, 'define the word': 4, 'what does x mean': 4, 'define x': 4, 'what does x stand for': 5 }
  }],
  ['REQUEST_PROCESS_MAP', {
    keywords: { 'map': 3.5, 'process': 3.0, 'draw': 3.0, 'workflow': 3.0, 'diagram': 3.0 },
    booster_phrases: { 'process map': 4, 'draw a diagram': 4, 'show me the workflow': 4.5, 'draw the process': 4.5 }
  }],
  ['REQUEST_SOURCE', {
    keywords: { 'source': 3.5, 'where': 2.0, 'get': 2.0, 'information': 2.5, 'data': 2.5, 'cite': 3.5, 'citation': 3.5, 'reference': 3.0, 'proof': 3.0, 'how': 1.5, 'know': 2.0 },
    booster_phrases: { 'what is your source': 5, 'where did you get that information': 5, 'can you cite your sources': 5, 'how do you know that': 4.5 }
  }],
  ['REQUEST_JOKE', {
    topic: 'Jokes',
    keywords: { 'joke': 4.0, 'funny': 2.5, 'laugh': 2.5, 'tell': 1.5, 'me': 1.0, 'something': 1.5 },
    booster_phrases: { 'tell me a joke': 4.5, 'make me laugh': 4, 'do you know any jokes': 4, 'tell me another joke': 4.5, 'say something funny': 4 }
  }],
  ['REQUEST_STORY', {
    topic: 'Storytelling',
    keywords: { 'story': 4.0, 'tale': 3.5, 'narrate': 3.5, 'tell': 1.5, 'me': 1.0, 'a': 0.5, 'read': 2.0 },
    booster_phrases: { 'tell me a story': 4.5, 'narrate a story': 4, 'read me a story': 4, 'tell me a short story': 4.5 }
  }],
  ['REQUEST_POEM', {
    keywords: { 'poem': 4.0, 'poetry': 4.0, 'write': 2.5, 'haiku': 3.5, 'compose': 3.0 },
    booster_phrases: { 'write a poem': 4.5, 'compose a poem': 4.5, 'can you write poetry': 4, 'write a haiku': 4.5 }
  }],
  ['PROMPT_ADVENTURE', {
    topic: 'Storytelling',
    keywords: { 'adventure': 4.0, 'explore': 3.5, 'woods': 2.0, 'dungeon': 2.0, 'monster': 2.5, 'go to': 2.5, 'enter': 2.5, 'we go': 3.0, 'i go': 3.0, 'what happens': 2.0, 'look for': 2.0 },
    booster_phrases: { "let's go on an adventure": 5, "i want to explore": 4, "we find a monster": 4, "let's go to the": 4, "i enter the": 4, "what do i see": 3.5 }
  }],
  ['REQUEST_ADVENTURE_OPTIONS', {
    topic: 'Storytelling',
    keywords: { 'options': 4.0, 'choices': 4.0, 'do': 2.0, 'can': 2.0, 'should': 2.0, 'next': 2.0, 'now': 1.5 },
    booster_phrases: { "what are my options": 5, "what can i do": 5, "what should i do": 5, "what are my choices": 5, "what happens next": 3 }
  }]
]);