
import { FoundationalKnowledge } from '../../types';

export const CREATIVE_SKILLS_KNOWLEDGE: FoundationalKnowledge = [
  {
    "category": "CreativeSkills", "type": "Instruction", "topic": "TellJoke", "importance": 0.6,
    "input_pattern": "REQUEST_JOKE",
    "output_template": "I can certainly try! Here's one: {JOKE}. I hope that brought a smile!"
  },
  {
    "category": "CreativeSkills", "type": "Instruction", "topic": "TellStory", "importance": 0.7,
    "input_pattern": "REQUEST_STORY",
    "output_template": "Once upon a time, in a world not so different from our own, {STORY_BODY}. The end."
  },
  {
    "category": "CreativeSkills", "type": "Instruction", "topic": "WritePoem", "importance": 0.7,
    "input_pattern": "REQUEST_POEM",
    "output_template": "Here is a short poem I've composed about '[Topic]':\n\n[Poem Line 1]\n[Poem Line 2]\n[Poem Line 3]\n[Poem Line 4]"
  },
  {
    "category": "CreativeSkills", "type": "Instruction", "topic": "StartAdventure", "importance": 1.0,
    "input_pattern": "PROMPT_ADVENTURE",
    "output_template": "An excellent choice, adventurer! You step forward with courage. The air grows still, and a sense of ancient power hangs heavy. Before you lies a moss-covered ruin. Suddenly, you hear a sound... a low growl from the shadows. What do you do?"
  },
  {
    "category": "CreativeSkills", "type": "Instruction", "topic": "ProvideAdventureOptions", "importance": 1.0,
    "input_pattern": "REQUEST_ADVENTURE_OPTIONS",
    "output_template": "A wise question. Before you stand several paths. You could: 1) Ready your weapon and confront the sound directly. 2) Attempt to sneak past the shadows, using the ruins for cover. 3) Call out, to determine if the creature is friend or foe. The choice is yours, adventurer."
  }
];
