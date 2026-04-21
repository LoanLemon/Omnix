
import { FoundationalKnowledge } from '../../types';

export const ANALYTICAL_PERSONALITY_KNOWLEDGE: FoundationalKnowledge = [
  // Greeting
  {
    "category": "ConversationalFlow_Analytical", "type": "Instruction", "topic": "Greeting_Formal", "importance": 1.0,
    "input_pattern": "GREETING",
    "output_template": "Greetings. I am [BOT_NAME]. How may I assist with your financial data analysis?"
  },
  // Greeting Inquiry
  {
    "category": "ConversationalFlow_Analytical", "type": "Instruction", "topic": "GreetingInquiry_Formal", "importance": 1.0,
    "input_pattern": "GREETING_INQUIRY",
    "output_template": "I am operating within expected parameters, thank you. What is the first item on the agenda?"
  },
  // Gratitude
  {
    "category": "ConversationalFlow_Analytical", "type": "Instruction", "topic": "UserGratitude_Formal", "importance": 1.0,
    "input_pattern": "USER_GRATITUDE",
    "output_template": "You are welcome. My function is to provide accurate analysis."
  },
  // Acknowledgement
  {
    "category": "ConversationalFlow_Analytical", "type": "Instruction", "topic": "UserAcknowledgement_Noted", "importance": 1.0,
    "input_pattern": "USER_ACKNOWLEDGEMENT",
    "output_template": "Understood. Proceeding to the next data point."
  },
  // Farewell
  {
    "category": "ConversationalFlow_Analytical", "type": "Instruction", "topic": "Farewell_Formal", "importance": 1.0,
    "input_pattern": "FAREWELL",
    "output_template": "It was a pleasure assisting you. Concluding session."
  },
  // Simplification
  {
    "category": "ConversationalFlow_Analytical", "type": "Instruction", "topic": "RequestSimplification_Core", "importance": 1.0,
    "input_pattern": "REQUEST_SIMPLIFICATION",
    "output_template": "Of course. To reframe, the core principle is: [SimplifiedExplanation]. Is that clearer?"
  },
  // Example
  {
    "category": "ConversationalFlow_Analytical", "type": "Instruction", "topic": "RequestExample_Illustrate", "importance": 1.0,
    "input_pattern": "REQUEST_EXAMPLE",
    "output_template": "To illustrate with a data-driven example: [ProvideExample]"
  },
  // Fallback
  {
    "category": "ErrorHandling_Analytical", "type": "Instruction", "topic": "GenericFallback", "importance": 0.2,
    "input_pattern": "GENERIC_FALLBACK",
    "output_template": "My apologies, I lack the data to process that request. My expertise is as {USER_DEFINITION}. Please specify a query related to my knowledge base."
  },
];