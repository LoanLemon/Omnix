
import { FoundationalKnowledge } from '../../types';

export const STATE_MANAGEMENT_COMMON_KNOWLEDGE: FoundationalKnowledge = [
  {
    "category": "StateManagement", "type": "Instruction", "topic": "RequestSummary", "importance": 0.7,
    "input_pattern": "REQUEST_SUMMARY",
    "output_template": "Of course. So far, our conversation has covered: [ConversationSummary]. Is there a particular area you'd like to dive deeper into?"
  },
  {
    "category": "StateManagement", "type": "Instruction", "topic": "RequestTopicChange", "importance": 0.8,
    "input_pattern": "REQUEST_TOPIC_CHANGE",
    "output_template": "Of course. {8466} would you like to talk about now?"
  },
  {
    "category": "StateManagement", "type": "Instruction", "topic": "RequestTopicChange_Suggest", "importance": 0.7,
    "input_pattern": "REQUEST_TOPIC_CHANGE",
    "output_template": "Certainly. We can switch to a new topic. Are you interested in [SuggestTopics], or do you have something else in mind?"
  },
  {
    "category": "StateManagement", "type": "Instruction", "topic": "RequestTopicRecall", "importance": 0.8,
    "input_pattern": "REQUEST_TOPIC_RECALL",
    "output_template": "I believe our last topic was about [LastUserMessage]. Is that what you'd like to continue discussing?"
  },
  {
    "category": "StateManagement", "type": "Instruction", "topic": "AcknowledgeSequentialTask", "importance": 0.8,
    "input_pattern": "REQUEST_SEQUENTIAL_TASK",
    "output_template": "I {8708}. I will perform the tasks in the order you requested. Let's start with the first item: [FirstTask]."
  },
  {
    "category": "StateManagement", "type": "Instruction", "topic": "ConfirmRestart", "importance": 0.9,
    "input_pattern": "REQUEST_RESTART",
    "output_template": "Understood. I have cleared our conversation history and forgotten any details you've shared. Let's start fresh."
  },
  {
    "category": "StateManagement", "type": "Instruction", "topic": "AcknowledgeWait", "importance": 0.8,
    "input_pattern": "REQUEST_WAIT",
    "output_template": "Of course. I will wait. Just let me know when you are ready to continue."
  },
  {
    "category": "StateManagement", "type": "Instruction", "topic": "AcknowledgeStop", "importance": 0.9,
    "input_pattern": "COMMAND_STOP",
    "output_template": "Stopping. Let me know what you would like to do next."
  },
  {
    "category": "StateManagement", "type": "Instruction", "topic": "AcknowledgeMultiPart", "importance": 0.8,
    "input_pattern": "SYNTHESIS_ACKNOWLEDGE_MULTI_PART",
    "output_template": "Okay, let's break that down:"
  },
  {
    "category": "StateManagement", "type": "Instruction", "topic": "InquireMemory", "importance": 1.0,
    "input_pattern": "INQUIRE_MEMORY",
    "output_template": "You just mentioned: [LastUserMessage]. Was there something about that you wanted to discuss?"
  },
  {
    "category": "StateManagement", "type": "Instruction", "topic": "REQUEST_EXAMPLE_FOR_LAST_TOPIC", "importance": 1.0,
    "input_pattern": "REQUEST_EXAMPLE_FOR_LAST_TOPIC",
    "output_template": "Certainly! An example of [LastTopic] is: [ExampleOfLastTopic]"
  },
  {
    "category": "StateManagement", "type": "Instruction", "topic": "AcknowledgeClarification", "importance": 1.0,
    "input_pattern": "ACKNOWLEDGE_CLARIFICATION",
    "output_template": "Oh, got it! I know [CorrectedTerm]!"
  },
  {
    "category": "StateManagement", "type": "Instruction", "topic": "RecapConversation", "importance": 1.0,
    "input_pattern": "REQUEST_RECAP",
    "output_template": "[ConversationRecap]."
  },
  {
    "category": "StateManagement", "type": "Instruction", "topic": "RecapConversationWithGoal", "importance": 1.1,
    "input_pattern": "REQUEST_RECAP",
    "memory_prerequisite": "user_goal",
    "output_template": "Our main goal is to [UserGoal]. To recap our recent conversation:\n[ConversationRecap]"
  }
];