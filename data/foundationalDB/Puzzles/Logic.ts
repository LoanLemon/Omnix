import { FoundationalKnowledge } from '../../types';

export const LOGIC_PUZZLES_KNOWLEDGE: FoundationalKnowledge = [
  {
    "category": "Puzzles", "type": "Instruction", "topic": "Logic_Syllogism", "importance": 1.0,
    "input_pattern": "LOGIC_PUZZLE_SYLLOGISM",
    "output_template": "Yes, based on the transitive property of your statements. If all blips are blops, and all blops are blups, then it logically follows that all blips are blups."
  },
  {
    "category": "Puzzles", "type": "Instruction", "topic": "Logic_BatAndBall_Dynamic", "importance": 1.2,
    "input_pattern": "LOGIC_PUZZLE_BAT_AND_BALL",
    "output_template": "[SOLVE_BAT_AND_BALL [UserMessage]]"
  },
  {
    "category": "Puzzles", "type": "Instruction", "topic": "Logic_Sequence_Months", "importance": 1.0,
    "input_pattern": "LOGIC_PUZZLE_SEQUENCE_MONTHS",
    "output_template": "The next letter in the sequence J, F, M, A, M is J. The sequence represents the first letter of each month of the year (January, February, March, April, May, June)."
  },
  {
    "category": "Puzzles", "type": "Instruction", "topic": "Logic_ExplainToChild", "importance": 1.0,
    "input_pattern": "EXPLAIN_TO_CHILD",
    "output_template": "To explain cloud computing to a 5-year-old: Imagine your toys aren't in your room, but in a giant, magical toy box in the sky. You can play with any toy you want, anytime, just by asking for it, and you don't have to clean them up. The cloud is like that magical toy box, but for computer files and programs."
  },
  {
    "category": "Puzzles", "type": "Instruction", "topic": "Logic_EyeButNoSee", "importance": 1.0,
    "input_pattern": "LOGIC_PUZZLE_NEEDLE",
    "output_template": "A needle has an eye but cannot see."
  },
  {
    "category": "Puzzles", "type": "Instruction", "topic": "Logic_BrokenBeforeUse", "importance": 1.0,
    "input_pattern": "LOGIC_PUZZLE_EGG",
    "output_template": "An egg must be broken before you can use it."
  },
  {
    "category": "Puzzles", "type": "Instruction", "topic": "Logic_MarysFather", "importance": 1.0,
    "input_pattern": "LOGIC_PUZZLE_MARYS_FATHER",
    "output_template": "The fifth daughter's name is Mary. The question starts with 'Mary's father...'"
  },
  {
    "category": "Puzzles", "type": "Instruction", "topic": "Logic_MansSon", "importance": 1.0,
    "input_pattern": "LOGIC_PUZZLE_MANS_SON",
    "output_template": "The man in the portrait is his son. Since the speaker has no brothers, 'my father's son' can only be the speaker himself. Therefore, he is the father of the man in the portrait."
  },
  {
    "category": "Puzzles", "type": "Instruction", "topic": "Logic_Future", "importance": 1.0,
    "input_pattern": "LOGIC_PUZZLE_FUTURE",
    "output_template": "The future is always in front of you but can’t be seen."
  },
  {
    "category": "Puzzles", "type": "Instruction", "topic": "Logic_PianoKeys", "importance": 1.0,
    "input_pattern": "LOGIC_PUZZLE_PIANO",
    "output_template": "A piano has keys but opens no locks."
  }
];