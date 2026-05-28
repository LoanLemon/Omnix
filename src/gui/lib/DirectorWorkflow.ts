export interface WorkflowStep {
  id: string;
  name: string;
  file: string;
  description: string;
  prompt: string;
}

export const GENERATION_WORKFLOW: WorkflowStep[] = [
  {
    id: "spec",
    name: "1. Specification",
    file: "spec.json",
    description: "Defining the purpose, components, and events.",
    prompt: "Generate a spec.json for a [APP_DESCRIPTION]. Include purpose, components, state, and events in JSON format."
  },
  {
    id: "architecture",
    name: "2. Architecture",
    file: "architecture.json",
    description: "Structuring the component tree and modules.",
    prompt: "Based on the spec.json, generate architecture.json. Define components (with props and children), state types, styles list, and module list."
  },
  {
    id: "types",
    name: "3. Types",
    file: "types.ts",
    description: "Defining TypeScript interfaces.",
    prompt: "Generate types.ts containing the TypeScript interfaces defined in architecture.json."
  },
  {
    id: "signatures",
    name: "4. Signatures",
    file: "signatures.ts",
    description: "Function headers and contract definitions.",
    prompt: "Generate signatures.ts with function declarations (no bodies) for the events and functions defined in architecture.json."
  },
  {
    id: "deps",
    name: "5. Dependencies",
    file: "deps.json",
    description: "Listing libraries and devDependencies.",
    prompt: "Generate deps.json with libraries and devDependencies needed for this app."
  },
  {
    id: "styles",
    name: "6. Styling",
    file: "styles/",
    description: "Generating CSS modules per variable.",
    prompt: "Generate separate CSS snippets for each style variable defined in architecture.json. Surround each with its filename."
  },
  {
    id: "functions",
    name: "7. Logic",
    file: "functions/",
    description: "Implementing individual functions.",
    prompt: "Generate the implementation for each function declared in signatures.ts. Provide one module per function."
  },
  {
    id: "state",
    name: "8. State Management",
    file: "state.ts",
    description: "Initializing the application state.",
    prompt: "Generate state.ts that initializes the state object using the types from types.ts."
  },
  {
    id: "ui",
    name: "9. UI Rendering",
    file: "ui/render.ts",
    description: "DOM manipulation and event attachment.",
    prompt: "Generate ui/render.ts. It should use document.createElement to build the UI based on architecture.json and attach event listeners that update state.ts and re-render."
  },
  {
    id: "entry",
    name: "10. Entry Point",
    file: "index.ts",
    description: "Bootstrapping the application.",
    prompt: "Generate index.ts as the main entry point that calls render() on an #app element."
  },
  {
    id: "html",
    name: "11. HTML",
    file: "index.html",
    description: "Main HTML shell.",
    prompt: "Generate index.html. Include the necessary link tags for all generated CSS files and a script tag for the bundled JS."
  },
  {
    id: "config",
    name: "12. Configuration",
    file: "tsconfig.json",
    description: "TypeScript compiler settings.",
    prompt: "Generate a tsconfig.json for this project."
  }
];
