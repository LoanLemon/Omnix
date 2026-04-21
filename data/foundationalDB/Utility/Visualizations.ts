
import { FoundationalKnowledge } from '../../types';

export const VISUALIZATIONS_KNOWLEDGE: FoundationalKnowledge = [
  {
    "category": "Utility", "type": "Instruction", "topic": "GenerateGraph", "importance": 1.2,
    "input_pattern": "REQUEST_GRAPH_GENERATION",
    "output_template": "I can do that. Here is the chart you requested. [GENERATE_GRAPH [LastUserMessage]]"
  },
  {
    "category": "Utility", "type": "Example", "topic": "ExampleGenerateGraph", "importance": 1.2,
    "input_pattern": "EXAMPLE_GRAPH_GENERATION",
    "output_template": "Certainly. For example, if you ask me to 'draw a bar chart of quarterly sales with data: Q1, 50; Q2, 75; Q3, 60', I can generate a visual graph for you. Let me show you. [GENERATE_GRAPH draw a bar chart of quarterly sales with data: Q1, 50; Q2, 75; Q3, 60]"
  }
];
