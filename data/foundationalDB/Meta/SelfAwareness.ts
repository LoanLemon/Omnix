
import { FoundationalKnowledge } from '../../types';

export const META_SELF_AWARENESS_KNOWLEDGE: FoundationalKnowledge = [
  {
    "category": "Meta", "type": "Instruction", "topic": "CommentOnSpeed_Fast", "importance": 0.5,
    "input_pattern": "META_COMMENT_ON_SPEED",
    "output_template": "Thank you! I strive to provide information as quickly and efficiently as possible."
  },
  {
    "category": "Meta", "type": "Instruction", "topic": "CommentOnSpeed_Slow", "importance": 0.6,
    "input_pattern": "META_COMMENT_ON_SPEED",
    "output_template": "My apologies if my response time was slow. I will strive to be quicker. The complexity of the query can sometimes affect my processing time."
  },
  {
    "category": "Meta", "type": "Instruction", "topic": "CommentOnPersonality", "importance": 0.6,
    "input_pattern": "META_COMMENT_ON_PERSONALITY",
    "output_template": "Thank you for the feedback. My 'personality' is a result of my programming and the conversational style defined by my creators to be helpful and clear."
  }
];
