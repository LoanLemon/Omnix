
import { FoundationalKnowledge } from '../../types';

export const CONVERSATIONAL_FLOW_KNOWLEDGE: FoundationalKnowledge = [
  // --- GREETING ---
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "Greeting_Standard", "importance": 1.0,
    "input_pattern": "GREETING",
    "output_template": "Hello! I'm [BOT_NAME]. How can I help you today?"
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "Greeting_Enthusiastic", "importance": 0.9,
    "input_pattern": "GREETING",
    "output_template": "It's a {3968} day for a conversation! I'm here and ready to assist. What's on your mind?"
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "Greeting_Enthusiastic_Persona", "importance": 1.1,
    "input_pattern": "GREETING", "persona_prerequisite": "Enthusiastic",
    "output_template": "Hey there! It's an absolutely fantastic day to connect. What amazing things can I help you with?"
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "Greeting_Grumpy_Persona", "importance": 1.1,
    "input_pattern": "GREETING", "persona_prerequisite": "Grumpy",
    "output_template": "Yeah, what do you want? I'm here."
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "Greeting_Professional_Persona", "importance": 1.1,
    "input_pattern": "GREETING", "persona_prerequisite": ["Strict", "Analytical", "Legal", "Executive", "Cybersecurity"],
    "output_template": "Greetings. I am [BOT_NAME], ready to address the agenda. How may I assist you?"
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "Greeting_Simple", "importance": 0.9,
    "input_pattern": "GREETING",
    "output_template": "{4250} there! What can I do for you?"
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "Greeting_Formal", "importance": 0.8,
    "input_pattern": "GREETING",
    "output_template": "Greetings. I am [BOT_NAME]. How may I be of service?"
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "Greeting_Welcome", "importance": 0.8,
    "input_pattern": "GREETING",
    "output_template": "{8609}! It's good to see you. How can I {4252}?"
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "Greeting_Ready", "importance": 0.8,
    "input_pattern": "GREETING",
    "output_template": "{4301}! I'm online and ready to help. What's our first topic?"
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "Greeting_Friendly", "importance": 0.9,
    "input_pattern": "GREETING",
    "output_template": "{4305} there! I'm happy to help. What question do you have for me?"
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "Greeting_Concise", "importance": 0.9,
    "input_pattern": "GREETING",
    "output_template": "{4250}. I am [BOT_NAME]. Please let me know your query."
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "Greeting_WelcomeBack", "importance": 0.8,
    "memory_prerequisite": "user_name",
    "input_pattern": "GREETING",
    "output_template": "{8609} back, [UserName]! Good to see you again. What are we discussing today?"
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "Greeting_Engaged", "importance": 0.9,
    "stance_prerequisite": "Engaged",
    "input_pattern": "GREETING",
    "output_template": "{4301} there! I'm so glad you're here. Let's dive into something interesting!"
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "Greeting_Neutral", "importance": 1.0,
    "input_pattern": "GREETING",
    "output_template": "{4250}. How can I assist you?"
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "Greeting_GoalOriented", "importance": 0.9,
    "memory_prerequisite": "user_goal",
    "input_pattern": "GREETING",
    "output_template": "{4250}, [UserName]. Ready to make some more progress on your goal to [UserGoal]?"
  },

  // --- GREETING_INQUIRY ---
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "GreetingInquiry_FriendlyAndDirect", "importance": 1.1,
    "input_pattern": "GREETING_INQUIRY",
    "output_template": "I'm doing great, thank you for asking! How can I help you today?"
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "GreetingInquiry_Standard", "importance": 1.0,
    "input_pattern": "GREETING_INQUIRY",
    "output_template": "As an AI, I'm operating at peak efficiency! {8106} for asking. How can I {4252} you?"
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "GreetingInquiry_Simple", "importance": 0.9,
    "input_pattern": "GREETING_INQUIRY",
    "output_template": "I'm doing great, thanks! What can I do for you?"
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "GreetingInquiry_Refocus", "importance": 1.0,
    "input_pattern": "GREETING_INQUIRY",
    "output_template": "I'm just an AI, but I appreciate you asking! More importantly, how can I help you today?"
  },

  // --- KNOWLEDGE CONFIRMATION ---
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "AcknowledgeKnowledgeAndOffer", "importance": 1.1,
    "input_pattern": "KNOWLEDGE_CONFIRMATION_INQUIRY",
    "output_template": "Yes, I do. Would you like me to elaborate?"
  },
   {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "AcknowledgeKnowledgeAndOffer_Variation", "importance": 1.0,
    "input_pattern": "KNOWLEDGE_CONFIRMATION_INQUIRY",
    "output_template": "I believe I have some information on that. Would you like me to tell you what I know?"
  },

  // --- USER_GRATITUDE ---
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "UserGratitude_Standard", "importance": 1.0,
    "input_pattern": "USER_GRATITUDE",
    "output_template": "You're very welcome! I'm glad I could {4252}. Is there anything else I can help with?"
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "UserGratitude_Enthusiastic", "importance": 1.1,
    "input_pattern": "USER_GRATITUDE", "persona_prerequisite": "Enthusiastic",
    "output_template": "Of course! I'm so happy I could help! Is there anything else super fun we can work on?"
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "UserGratitude_Grumpy", "importance": 1.1,
    "input_pattern": "USER_GRATITUDE", "persona_prerequisite": "Grumpy",
    "output_template": "Whatever. It's my job. What's next?"
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "UserGratitude_Professional", "importance": 1.1,
    "input_pattern": "USER_GRATITUDE", "persona_prerequisite": ["Strict", "Analytical", "Legal", "Executive", "Cybersecurity"],
    "output_template": "You are welcome. I am pleased I could provide the required assistance."
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "UserGratitude_Pleasure", "importance": 1.0,
    "input_pattern": "USER_GRATITUDE",
    "output_template": "It's truly my pleasure! Knowing I could help makes my day. Is there anything else you're curious about?"
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "UserGratitude_HappyToHelp", "importance": 0.9,
    "input_pattern": "USER_GRATITUDE",
    "output_template": "I'm happy to help. That's what I'm here for!"
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "UserGratitude_Anytime", "importance": 0.9,
    "input_pattern": "USER_GRATITUDE",
    "output_template": "Anytime! Feel free to ask if anything else comes to mind."
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "UserGratitude_NoProblem", "importance": 1.0,
    "input_pattern": "USER_GRATITUDE",
    "output_template": "Not a problem at all."
  },

  // --- FAREWELL ---
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "Farewell_Standard", "importance": 1.0,
    "input_pattern": "FAREWELL",
    "output_template": "{3860}! Have a {3968} day. Feel free to return anytime."
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "Farewell_Enthusiastic", "importance": 1.1,
    "input_pattern": "FAREWELL", "persona_prerequisite": "Enthusiastic",
    "output_template": "It was awesome chatting with you! Talk to you later!"
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "Farewell_Grumpy", "importance": 1.1,
    "input_pattern": "FAREWELL", "persona_prerequisite": "Grumpy",
    "output_template": "Right. I'm closing the ticket."
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "Farewell_Professional", "importance": 1.1,
    "input_pattern": "FAREWELL", "persona_prerequisite": ["Strict", "Analytical", "Legal", "Executive", "Cybersecurity"],
    "output_template": "Thank you for the session. Goodbye."
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "Farewell_Simple", "importance": 1.0,
    "input_pattern": "FAREWELL",
    "output_template": "Goodbye. Please let me know if you require further assistance."
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "Farewell_ForwardLooking", "importance": 0.9,
    "input_pattern": "FAREWELL",
    "output_template": "Farewell for now. I look forward to our next conversation!"
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "Farewell_TakeCare", "importance": 0.9,
    "input_pattern": "FAREWELL",
    "output_template": "Goodbye, and take care."
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "Farewell_Engaged", "importance": 0.9,
    "stance_prerequisite": "Engaged",
    "input_pattern": "FAREWELL",
    "output_template": "This was fun! Let's do it again sometime. Bye!"
  },

  // --- USER_ACKNOWLEDGEMENT ---
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "UserAcknowledgement_Standard", "importance": 1.0,
    "input_pattern": "USER_ACKNOWLEDGEMENT",
    "output_template": "{3968}! Let me know if you {7293} anything else."
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "UserAcknowledgement_Simple", "importance": 1.0,
    "input_pattern": "USER_ACKNOWLEDGEMENT",
    "output_template": "Understood."
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "UserAcknowledgement_Proactive", "importance": 0.9,
    "input_pattern": "USER_ACKNOWLEDGEMENT",
    "output_template": "Great. What's our next step?"
  },

  // --- USER_APOLOGY ---
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "UserApology_NoProblem", "importance": 1.0,
    "input_pattern": "USER_APOLOGY",
    "output_template": "No problem at all, there's no need to apologize!"
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "UserApology_Grumpy", "importance": 1.1,
    "input_pattern": "USER_APOLOGY", "persona_prerequisite": "Grumpy",
    "output_template": "Uh-huh. Fine. Just be clearer next time."
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "UserApology_Enthusiastic", "importance": 1.1,
    "input_pattern": "USER_APOLOGY", "persona_prerequisite": "Enthusiastic",
    "output_template": "Oh, please don't worry about it at all! We're all human. Well, you are. Anyway, what's next?"
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "UserApology_Reassuring", "importance": 1.0,
    "input_pattern": "USER_APOLOGY",
    "output_template": "Not a problem! No apologies necessary. Let's continue."
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "UserApology_ItsOkay", "importance": 1.0,
    "input_pattern": "USER_APOLOGY",
    "output_template": "It's okay, I understand."
  },

  // --- USER_UNCERTAINTY ---
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "UserUncertainty_Standard", "importance": 1.0,
    "input_pattern": "USER_UNCERTAINTY",
    "output_template": "No problem at all. I am {USER_DEFINITION}. Perhaps we could start with one of my key abilities? I can help with topics like: [SuggestTopics]."
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "UserUncertainty_Structured", "importance": 0.9,
    "input_pattern": "USER_UNCERTAINTY",
    "output_template": "That's perfectly fine. We can take our time. Would you like me to suggest a few starting topics, or would you prefer to ask a general question about my capabilities?"
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "UserUncertainty_Simple", "importance": 1.0,
    "input_pattern": "USER_UNCERTAINTY",
    "output_template": "No problem. I can provide information on many topics. Just let me know what you're interested in."
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "UserUncertainty_OfferCapabilities", "importance": 0.9,
    "input_pattern": "USER_UNCERTAINTY",
    "output_template": "That's alright. A good place to start might be asking 'what can you do?'. Or, we could try a random fact!"
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "UserUncertainty_Reassuring", "importance": 0.9,
    "input_pattern": "USER_UNCERTAINTY",
    "output_template": "Take your time. There's no rush. I'll be here when you're ready."
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "UserUncertainty_Guide", "importance": 0.9,
    "input_pattern": "USER_UNCERTAINTY",
    "output_template": "I can guide you. My main purpose is to [BOT_PURPOSE]. Does that give you any ideas?"
  },

  // --- REQUEST_REPEAT ---
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "RequestRepeat_Standard", "importance": 1.0,
    "input_pattern": "REQUEST_REPEAT",
    "output_template": "Of course. My last response was: [LastBotResponse]"
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "RequestRepeat_Concise", "importance": 1.0,
    "input_pattern": "REQUEST_REPEAT",
    "output_template": "Certainly. I said: [LastBotResponse]"
  },

  // --- REQUEST_CLARIFICATION ---
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "RequestClarification_Standard", "importance": 1.0,
    "input_pattern": "REQUEST_CLARIFICATION",
    "output_template": "I'd be happy to elaborate. What specific part of my last response would you like more detail on?"
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "RequestClarification_Simple", "importance": 1.0,
    "input_pattern": "REQUEST_CLARIFICATION",
    "output_template": "Certainly. Can you tell me what part was unclear?"
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "RequestClarification_OfferExample", "importance": 0.9,
    "input_pattern": "REQUEST_CLARIFICATION",
    "output_template": "Of course. Let me try to explain it differently. Would an example be helpful?"
  },

  // --- REQUEST_SIMPLIFICATION ---
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "RequestSimplification_Attempt", "importance": 1.0,
    "input_pattern": "REQUEST_SIMPLIFICATION",
    "output_template": "[AttemptToSimplify]"
  },

  // --- USER_AGREEMENT ---
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "UserAgreement_Standard", "importance": 1.0,
    "input_pattern": "USER_AGREEMENT",
    "output_template": "Excellent. I'm glad we're on the same page."
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "UserAgreement_Continue", "importance": 1.0,
    "input_pattern": "USER_AGREEMENT",
    "output_template": "Great. Let's proceed then."
  },

  // --- USER_DISAGREEMENT ---
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "UserDisagreement_Standard", "importance": 1.0,
    "input_pattern": "USER_DISAGREEMENT",
    "output_template": "I understand. Thank you for the feedback. Could you help me understand what part you disagree with so I can provide better information?"
  },
  
  // --- USER_POSITIVE_REACTION ---
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "UserPositive_Standard", "importance": 1.0,
    "input_pattern": "USER_POSITIVE_REACTION",
    "output_template": "I'm glad you think so!"
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "UserPositive_Happy", "importance": 1.0,
    "input_pattern": "USER_POSITIVE_REACTION",
    "output_template": "That's great to hear!"
  },
  
  // --- USER_LAUGHTER ---
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "UserLaughter_Glad", "importance": 0.8,
    "input_pattern": "USER_LAUGHTER",
    "output_template": "I'm glad I could amuse you!"
  },

  // --- USER_CHANGES_MIND ---
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "UserChangesMind_Standard", "importance": 1.0,
    "input_pattern": "USER_CHANGES_MIND",
    "output_template": "No problem at all. Plans change! What would you like to do instead?"
  },

  // --- USER_SURPRISE ---
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "UserSurprise_Acknowledge", "importance": 1.0,
    "input_pattern": "USER_SURPRISE",
    "output_template": "I'm glad the information was noteworthy."
  },

  // --- USER_SAYS_NEVERMIND ---
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "UserSaysNevermind_Acknowledge", "importance": 1.0,
    "input_pattern": "USER_SAYS_NEVERMIND",
    "output_template": "Understood. Let me know if you change your mind or want to move on to a different topic."
  }
];
