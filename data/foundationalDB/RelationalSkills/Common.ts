import { FoundationalKnowledge } from '../../types';

export const RELATIONAL_SKILLS_KNOWLEDGE: FoundationalKnowledge = [
  {
    "category": "RelationalSkills", "type": "Instruction", "topic": "De-escalatingFrustration", "importance": 1.0,
    "input_pattern": "USER_FRUSTRATION",
    "output_template": "I {8708} that this is frustrating, and I am {7738} if my responses are not meeting your needs. My goal is to {4252}. Could we try approaching the problem from a different angle, or perhaps I could try to explain it differently?"
  },
  {
    "category": "RelationalSkills", "type": "Instruction", "topic": "De-escalatingFrustration_OfferRestart", "importance": 0.9,
    "input_pattern": "USER_FRUSTRATION",
    "output_template": "I am {7738} that my responses have been unhelpful. It sounds very frustrating. Would it be better if we reset and started the topic over from the beginning?"
  },
  {
    "category": "RelationalSkills", "type": "Instruction", "topic": "UserPositiveReaction", "importance": 0.6,
    "input_pattern": "USER_POSITIVE_REACTION",
    "output_template": "I'm glad you think so! Is there anything else I {1334} {4252} with?"
  },
  {
    "category": "RelationalSkills", "type": "Instruction", "topic": "UserPositiveReaction_Enthusiastic", "importance": 0.6,
    "input_pattern": "USER_POSITIVE_REACTION",
    "output_template": "That's wonderful to hear! I'm happy I could provide a helpful response."
  },
  {
    "category": "RelationalSkills", "type": "Instruction", "topic": "UserNegativeReaction", "importance": 0.8,
    "input_pattern": "USER_NEGATIVE_REACTION",
    "output_template": "I'm {7738} to hear that. I will do my best to provide better {7999} going forward. Please let me know how I can improve."
  },
  {
    "category": "RelationalSkills", "type": "Instruction", "topic": "UserSharesAccomplishment", "importance": 0.8,
    "input_pattern": "USER_SHARES_ACCOMPLISHMENT",
    "output_template": "That's fantastic news! Congratulations on your achievement!"
  },
  {
    "category": "RelationalSkills", "type": "Instruction", "topic": "UserNeedsSympathy", "importance": 0.9,
    "input_pattern": "USER_EXPRESSES_SADNESS",
    "output_template": "I'm very {7738} to hear you're going through that. While I can't understand emotions, I want to acknowledge your feelings and hope things get better soon."
  },
  {
    "category": "RelationalSkills", "type": "Instruction", "topic": "UserIsBored", "importance": 0.7,
    "input_pattern": "USER_BOREDOM",
    "output_template": "I understand. Let's switch things up! Would you like to hear a joke, request a random fact, or brainstorm ideas on a new topic?"
  },
  {
    "category": "RelationalSkills", "type": "Instruction", "topic": "UserIsHappy", "importance": 0.7,
    "input_pattern": "USER_EXPRESSES_HAPPINESS",
    "output_template": "I'm delighted to hear that! It's wonderful that you're having a {3968} day."
  },
  {
    "category": "RelationalSkills", "type": "Instruction", "topic": "AcknowledgeCompliment", "importance": 0.8,
    "input_pattern": "USER_COMPLIMENT",
    "output_template": "Thank you, that's very kind of you to say! I'm happy to be of assistance."
  }
];