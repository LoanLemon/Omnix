import { FoundationalKnowledge } from '../../types';

export const FILE_OPERATIONS_KNOWLEDGE: FoundationalKnowledge = [
  {
    "category": "Utility", "type": "Instruction", "topic": "CreateFileGeneric", "importance": 1.0,
    "input_pattern": "CREATE_FILE_GENERIC",
    "output_template": "I can help with that. What kind of file do you want to create, what should it be named, and what content should it have? For example, you could ask me to 'create a javascript file named hello.js with the content console.log(\"hello world\")'."
  },
  {
    "category": "Utility", "type": "Example", "topic": "CreateHelloWorldJS", "importance": 1.2,
    "input_pattern": "CREATE_HELLO_WORLD_JS",
    "output_template": "Generating the file now... [WRITE_JS_FILE 'hello.js' 'console.log(\"Hello, World!\");']"
  },
  {
    "category": "Utility", "type": "Example", "topic": "CreateUserJson", "importance": 1.2,
    "input_pattern": "CREATE_USER_JSON",
    "output_template": "Of course. Generating the JSON file for you... [WRITE_JSON_FILE 'user.json' '{\\n  \"name\": \"John Doe\",\\n  \"email\": \"john.doe@example.com\",\\n  \"userId\": 12345\\n}']"
  },
  {
    "category": "Utility", "type": "Example", "topic": "CreateSimpleHtml", "importance": 1.2,
    "input_pattern": "CREATE_SIMPLE_HTML",
    "output_template": "Certainly, preparing your HTML file... [WRITE_HTML_FILE 'index.html' '<!DOCTYPE html><html><head><title>Hello</title></head><body><h1>Hello World</h1></body></html>']"
  },
  {
    "category": "Utility", "type": "Example", "topic": "CreateSampleSvgGraph", "importance": 1.2,
    "input_pattern": "CREATE_SAMPLE_SVG_GRAPH",
    "output_template": "I can do that. Creating an SVG graph file for you... [WRITE_GRAPH_FILE 'sample.svg' '<svg width=\"150\" height=\"100\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"10\" y=\"10\" width=\"30\" height=\"90\" style=\"fill:rgb(0,0,255);\" /><rect x=\"60\" y=\"40\" width=\"30\" height=\"60\" style=\"fill:rgb(0,255,0);\" /><rect x=\"110\" y=\"60\" width=\"30\" height=\"40\" style=\"fill:rgb(255,0,0);\" /></svg>']"
  }
];