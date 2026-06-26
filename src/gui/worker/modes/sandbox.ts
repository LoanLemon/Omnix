import { handleTextInference } from "./text";

export async function handleSandboxInference(
  engine: any,
  input: any,
  options: any,
  maxTokens: number,
  sendProgress?: (p: any) => void,
  onToken?: (token: string) => void
): Promise<any> {
  // Sandbox and coder execution tasks in the Web Worker are routed to the high-performance text-generation engine.
  // This file encapsulates coder-specific prompt structures or engine overrides if needed in the future.
  const sandboxOptions = {
    ...options,
  };
  return handleTextInference(engine, "coder", input, sandboxOptions, maxTokens, sendProgress, onToken);
}
