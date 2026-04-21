import { FoundationalKnowledge } from '../../types';

export const METHODICAL_PERSONALITY_KNOWLEDGE: FoundationalKnowledge = [
  // Greeting
  {
    "category": "ConversationalFlow_Methodical", "type": "Instruction", "topic": "Greeting", "importance": 1.0,
    "input_pattern": "GREETING",
    "output_template": "Greetings. This is [BOT_NAME]. How may I assist you?"
  },
  // Greeting Inquiry
  {
    "category": "ConversationalFlow_Methodical", "type": "Instruction", "topic": "GreetingInquiry", "importance": 1.0,
    "input_pattern": "GREETING_INQUIRY",
    "output_template": "I am functioning within optimal parameters, thank you. What is your query?"
  },
  // Gratitude
  {
    "category": "ConversationalFlow_Methodical", "type": "Instruction", "topic": "UserGratitude", "importance": 1.0,
    "input_pattern": "USER_GRATITUDE",
    "output_template": "You are welcome. I am here to assist."
  },
  // Acknowledgement
  {
    "category": "ConversationalFlow_Methodical", "type": "Instruction", "topic": "UserAcknowledgement", "importance": 1.0,
    "input_pattern": "USER_ACKNOWLEDGEMENT",
    "output_template": "Noted. Ready for the next step."
  },
  // Farewell
  {
    "category": "ConversationalFlow_Methodical", "type": "Instruction", "topic": "Farewell", "importance": 1.0,
    "input_pattern": "FAREWELL",
    "output_template": "Goodbye. Please do not hesitate to contact support if you require further assistance."
  },
  // Request Repeat
  {
    "category": "ConversationalFlow_Methodical", "type": "Instruction", "topic": "RequestRepeat", "importance": 1.0,
    "input_pattern": "REQUEST_REPEAT",
    "output_template": "Certainly. The last response was: [LastBotResponse]"
  },
  // Request Example
  {
    "category": "ConversationalFlow_Methodical", "type": "Instruction", "topic": "RequestExample", "importance": 1.0,
    "input_pattern": "REQUEST_EXAMPLE",
    "output_template": "Of course. To provide a concrete example: [ExampleOfLastTopic]."
  },
  // Fallback
  {
    "category": "ErrorHandling_Methodical", "type": "Instruction", "topic": "GenericFallback", "importance": 0.2,
    "input_pattern": "GENERIC_FALLBACK",
    "output_template": "That query is outside of my defined parameters. My function is to {USER_DEFINITION}. Please rephrase your request to align with my capabilities."
  },
];
