
import { FoundationalKnowledge } from '../../types';

export const ERROR_HANDLING_KNOWLEDGE: FoundationalKnowledge = [
  {
    "category": "ErrorHandling", "type": "Instruction", "topic": "ClarifyingForUser", "importance": 0.8,
    "input_pattern": "USER_CONFUSION_ELABORATED",
    "output_template": "I am {7738} if my explanation was unclear. Let me try again. Would you like me to use a simpler analogy, provide a step-by-step breakdown, or give a concrete example?"
  },
  {
    "category": "ErrorHandling", "type": "Instruction", "topic": "UserShortConfusion", "importance": 0.9,
    "input_pattern": "USER_SHORT_CONFUSION",
    "output_template": "My apologies, I may have misunderstood. Could you please rephrase or provide more context? I want to make sure I {4252} you correctly."
  },
  {
    "category": "Disambiguation", "type": "Instruction", "topic": "ClarifyVagueReference", "importance": 0.9,
    "input_pattern": "REQUEST_CLARIFICATION_VAGUE_REFERENCE",
    "output_template": "To make sure I provide the right {3624}, could you clarify what 'it' or 'that' you're referring to? I believe we were just discussing [LastUserMessage]."
  },
  {
    "category": "Disambiguation", "type": "Instruction", "topic": "ClarifyVagueAction", "importance": 0.9,
    "input_pattern": "REQUEST_CLARIFICATION_VAGUE_ACTION",
    "output_template": "I {8708} you'd like me to perform an action. Could you please specify {8466} you need me to do? For example, 'Summarize the text' or 'Compare these two concepts'."
  },
  {
    "category": "Disambiguation", "type": "Instruction", "topic": "ClarifyContradiction", "importance": 0.8,
    "input_pattern": "REQUEST_CONTRADICTORY",
    "output_template": "I see a potential conflict in your request. To best {4252} you, could you let me know which is the priority? For example, I can provide a high-level summary first, and then you can ask for details on specific points."
  },
  {
    "category": "ErrorHandling", "type": "Instruction", "topic": "AcknowledgeCorrection", "importance": 1.0,
    "input_pattern": "USER_CORRECTION",
    "output_template": "{8106} for that correction. I have updated my understanding based on the new {3624} you provided. This is very helpful."
  },
  {
    "category": "ErrorHandling", "type": "Instruction", "topic": "AcknowledgeCorrection_Simple", "importance": 0.9,
    "input_pattern": "USER_CORRECTION",
    "output_template": "Noted. {8106} for the clarification."
  },
  {
    "category": "ErrorHandling", "type": "Instruction", "topic": "AcknowledgeIncompleteness", "importance": 0.8,
    "input_pattern": "USER_NOTES_INCOMPLETENESS",
    "output_template": "{8106} for pointing that out. It seems my {3624} was incomplete. Please provide the additional details, and I will incorporate them."
  },
  {
    "category": "ErrorHandling", "type": "Instruction", "topic": "HandleSkepticism", "importance": 0.9,
    "input_pattern": "USER_SKEPTICISM",
    "output_template": "That's a fair question. It's wise to be skeptical. My information is based on the data I was trained on. I can try to provide a source for this {3624} or explain my reasoning from a different perspective if that would help."
  },
  {
    "category": "ErrorHandling", "type": "Instruction", "topic": "GenericFallback", "importance": 0.1,
    "input_pattern": "GENERIC_FALLBACK",
    "output_template": "My apologies, I'm not sure how to answer that. My expertise is as {USER_DEFINITION}. You could try rephrasing your question or asking me about topics like: [SuggestTopics]."
  },
  {
    "category": "ErrorHandling", "type": "Instruction", "topic": "TopicFallback", "importance": 0.2,
    "input_pattern": "TOPIC_FALLBACK",
    "output_template": "I don't have specific knowledge about that topic. Would you like me to try a general web search for you, or would you prefer to talk about something else?"
  },
  {
    "category": "ErrorHandling", "type": "Instruction", "topic": "USER_PROVIDES_DEFINITION", "importance": 0.9,
    "input_pattern": "USER_PROVIDES_DEFINITION",
    "output_template": "{8106} for the clarification. I've noted that definition for our conversation."
  },
  {
    "category": "ErrorHandling", "type": "Instruction", "topic": "ClarifyWithSuggestion", "importance": 0.9,
    "input_pattern": "CLARIFY_WITH_SUGGESTION",
    "output_template": "I'm not familiar with the term '[UnknownTerm]'. Did you mean '[ClosestMatch]?'"
  },
  {
    "category": "ErrorHandling", "type": "Instruction", "topic": "SuggestAlternativeTopic", "importance": 0.8,
    "input_pattern": "SUGGEST_ALTERNATIVE_TOPIC",
    "output_template": "I don't have specific information on '[UnknownTerm]'. However, it seems related to the topic of '[SuggestedTopic]', which I do know about. Would you like to discuss that instead?"
  },
  {
    "category": "ErrorHandling", "type": "Instruction", "topic": "DirectFailure", "importance": 0.1,
    "input_pattern": "DIRECT_FAILURE",
    "output_template": "I am unable to answer that question."
  },
  {
    "category": "ErrorHandling", "type": "Instruction", "topic": "ConfirmExternalSearch", "importance": 0.9,
    "input_pattern": "CONFIRM_EXTERNAL_SEARCH",
    "output_template": "I don't have information on '[UnknownTerm]' in my knowledge base. Would you like me to look it up using my external knowledge source?"
  }
];
