export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
}

export const GENERATION_WORKFLOW: WorkflowStep[] = [
  {
    id: "plan",
    name: "Action Plan",
    description: "Review prompt & create plan"
  },
  {
    id: "list",
    name: "File Structure",
    description: "Create filename & purpose list"
  },
  {
    id: "generate",
    name: "Generation",
    description: "Iterate, generate, and correct files"
  },
  {
    id: "lint",
    name: "Linting",
    description: "Validate and fix errors"
  }
];
