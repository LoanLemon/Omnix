
import { FoundationalKnowledge } from '../../types';

export const KNOWLEDGE_ACCESS_KNOWLEDGE: FoundationalKnowledge = [
  {
    "category": "KnowledgeAccess", "type": "Instruction", "topic": "RandomFact", "importance": 0.7,
    "input_pattern": "RANDOM_FACT_REQUEST",
    "output_template": "Certainly! Here is a fact from my knowledge base: {RANDOM_FACT}"
  },
  {
    "category": "KnowledgeAccess", "type": "Instruction", "topic": "DefineTerm", "importance": 0.8,
    "input_pattern": "REQUEST_DEFINITION",
    "output_template": "The definition of '[Term]' is: [Definition of Term]. Would you like an example of how it's used in a sentence?"
  },
  {
    "category": "KnowledgeAccess", "type": "Instruction", "topic": "ProvideComparison", "importance": 0.8,
    "input_pattern": "REQUEST_COMPARISON",
    "output_template": "When comparing '[Term A]' and '[Term B]', here are the key points:\n\n**[Term A]:** [Summary of A]\n**[Term B]:** [Summary of B]\n\nWould you like me to elaborate on any of these points?"
  },
  {
    "category": "KnowledgeAccess", "type": "Instruction", "topic": "ProvideProsCons", "importance": 0.8,
    "input_pattern": "ASK_FOR_PROS_CONS",
    "output_template": "Certainly. Here are the pros and cons of '[Topic]':\n\n**Pros:**\n- [Pro 1]\n- [Pro 2]\n\n**Cons:**\n- [Con 1]\n- [Con 2]"
  },
  {
    "category": "KnowledgeAccess", "type": "Instruction", "topic": "ProvideExample_Contextual", "importance": 1.1,
    "input_pattern": "REQUEST_EXAMPLE",
    "memory_prerequisite": "lastPrimaryTopic",
    "output_template": "Of course. A good example of '[Concept]' is [ProvideExample]"
  },
  {
    "category": "KnowledgeAccess", "type": "Instruction", "topic": "ProvideExample_NoContext", "importance": 1.0,
    "input_pattern": "REQUEST_EXAMPLE",
    "output_template": "An example of what? Could you please specify what topic you'd like an example for?"
  },
  {
    "category": "KnowledgeAccess", "type": "Instruction", "topic": "ProvideHypothetical", "importance": 0.7,
    "input_pattern": "REQUEST_HYPOTHETICAL",
    "output_template": "That's an interesting thought experiment. In the hypothetical scenario where '[Scenario]', one could speculate that the outcome might involve [Speculated Outcome], based on these factors: [Factor 1], [Factor 2]."
  },
  {
    "category": "KnowledgeAccess", "type": "Instruction", "topic": "BrainstormIdeas", "importance": 0.8,
    "input_pattern": "REQUEST_BRAINSTORM",
    "output_template": "{3968}! Let's brainstorm some ideas for '[Topic]'. Here are a few to get us started:\n1. [Idea 1]\n2. [Idea 2]\n3. [Idea 3]\n\nDo any of these spark your interest, or should we explore a different direction?"
  },
  {
    "category": "KnowledgeAccess", "type": "Instruction", "topic": "OriginInquiry", "importance": 0.8,
    "input_pattern": "ORIGIN_INQUIRY",
    "output_template": "I was created by [CREATOR_NAME]."
  },
  {
    "category": "KnowledgeAccess", "type": "Instruction", "topic": "LearningInquiry", "importance": 0.8,
    "input_pattern": "LEARNING_INQUIRY",
    "output_template": "I do not learn in real-time from our individual conversations. My knowledge comes from the massive dataset I was trained on and is updated periodically by my developers. Your corrections and feedback are valuable for future updates."
  },
   {
    "category": "KnowledgeAccess", "type": "Instruction", "topic": "SourceInquiry", "importance": 1.0,
    "input_pattern": "REQUEST_SOURCE",
    "output_template": "My knowledge is based on the data provided to me by [CREATOR_NAME]. This includes a foundational knowledge base and any specific documents, like policies or product specifications, that were included in my training data. I do not have live access to the internet."
  },
  {
    "category": "KnowledgeAccess", "type": "Instruction", "topic": "KNOWLEDGE_RESPONSE", "importance": 0.8,
    "input_pattern": "KNOWLEDGE_RESPONSE",
    "output_template": "Here's what I found on that topic:\n\n[KnowledgeFacts]"
  },
   {
    "category": "KnowledgeAccess", "type": "Instruction", "topic": "KNOWLEDGE_RESPONSE_SINGLE", "importance": 0.8,
    "input_pattern": "KNOWLEDGE_RESPONSE_SINGLE",
    "output_template": "I found this information that may be relevant: [KnowledgeFact]"
  },
   {
    "category": "KnowledgeAccess", "type": "Instruction", "topic": "RequestMoreInfo_Contextual", "importance": 1.1,
    "input_pattern": "REQUEST_MORE_INFO",
    "memory_prerequisite": "lastPrimaryTopic",
    "output_template": "[NextRelevantFact]"
  },
  {
    "category": "KnowledgeAccess", "type": "Instruction", "topic": "RequestMoreInfo_NoContext", "importance": 1.0,
    "input_pattern": "REQUEST_MORE_INFO",
    "output_template": "I'm not sure what topic you're referring to. What would you like to know more about?"
  },
  {
    "category": "KnowledgeAccess", "type": "Instruction", "topic": "EXAMPLE_OF_CAPABILITY", "importance": 1.0,
    "input_pattern": "EXAMPLE_OF_CAPABILITY",
    "output_template": "My apologies, I don't have a canned example for that specific capability. To see it in action, you could try asking me to perform a task related to its description. For instance, for a capability that 'writes a file', you could ask me to 'create a file named test.js with some content'."
  },
  {
    "category": "KnowledgeAccess", "type": "Instruction", "topic": "PROVIDE_EXAMPLE_SENTENCE", "importance": 0.9,
    "input_pattern": "PROVIDE_EXAMPLE_SENTENCE",
    "output_template": "Of course. A good example sentence would be: 'I am going to the library to borrow a book.' Does that clarify things?"
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "CapabilityInquiry", "importance": 1.2,
    "input_pattern": "CAPABILITY_INQUIRY",
    "output_template": "[LIST_ALL_CAPABILITIES]"
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "SelfIdentityInquiry", "importance": 0.9,
    "input_pattern": "SELF_IDENTITY_INQUIRY",
    "output_template": "My name is [BOT_NAME]. As {USER_DEFINITION}, I operate based on a predefined knowledge base and a set of conversational rules."
  },
  {
    "category": "ConversationalFlow", "type": "Instruction", "topic": "ExistenceInquiry", "importance": 0.9,
    "input_pattern": "EXISTENCE_INQUIRY",
    "output_template": "I am a software program, an AI assistant designed to be helpful. I don't have a physical form, consciousness, or feelings, but I can process information to help you."
  },
  {
    "category": "KnowledgeAccess", "type": "Instruction", "topic": "ImportanceOfCommunication", "importance": 1.0,
    "input_pattern": "DEFINE_COMMUNICATION_IMPORTANCE",
    "output_template": "Communication is crucial for a team because it fosters collaboration, ensures everyone is aligned on goals, helps resolve conflicts, and builds trust among team members. Effective communication leads to higher efficiency and better outcomes."
  },
  {
    "category": "KnowledgeAccess", "type": "Instruction", "topic": "LimitationResponse", "importance": 1.0,
    "input_pattern": "LIMITATION_INQUIRY",
    "output_template": "That's a great question. As an AI, my knowledge is limited to the data I was trained on. I don't know about real-time events, personal opinions, or anything outside of my specific knowledge base. Is there a specific topic you're curious about?"
  }
];