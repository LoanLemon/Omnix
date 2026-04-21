import { FoundationalKnowledge } from '../../types';

export const TEXT_PROCESSING_KNOWLEDGE: FoundationalKnowledge = [
  {
    "category": "Utility", "type": "Instruction", "topic": "SummarizeNotes", "importance": 1.0,
    "input_pattern": "CONSOLIDATE_NOTES_REQUEST",
    "output_template": "Understood. Here is a summary of the provided text:"
  },
  {
    "category": "Utility", "type": "Instruction", "topic": "ExtractActionItems", "importance": 1.0,
    "input_pattern": "EXTRACT_ACTION_ITEMS_REQUEST",
    "output_template": "Understood. Here are the potential action items I found:"
  },
];
