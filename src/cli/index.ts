import { Command } from "commander";
import fetch from "node-fetch";

const program = new Command();

program
  .name("omnix")
  .description("Omnix Local AI CLI")
  .version("0.2.0")
  .requiredOption("-p, --prompt <string>", "The prompt to send to the AI")
  .option("-m, --mode <string>", "Operational mode (director, chat, text, vision)", "director")
  .action(async (options) => {
    const { prompt, mode } = options;
    console.log(`\n[Omnix CLI] Initializing one-shot inference...`);
    console.log(`Mode: ${mode}`);
    console.log(`Prompt: "${prompt}"`);
    console.log("Thinking...");

    const port = process.env.PORT || 9777;
    // Map mode to appropriate endpoint
    const endpoint = mode === "chat" ? "/api/chat" : `/api/${mode}`;
    
    try {
      const response = await fetch(`http://localhost:${port}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, category: mode })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      console.log("\n" + "=".repeat(40));
      if (mode === "director" || data.intent && !data.response) {
        console.log(`[Director] Detected Intent: ${data.intent || "Unknown"}`);
      } else if (data.response) {
        const prefix = data.intent ? `[${data.intent}] ` : "[Omnix] ";
        console.log(`${prefix}Response:\n${data.response}`);
      } else {
        console.log("[Omnix] Result:", JSON.stringify(data, null, 2));
      }
      console.log("=".repeat(40) + "\n");
      
    } catch (error: any) {
      console.error("\n[Error] Failed to execute one-shot inference:");
      console.error(error.message);
      console.log("\nMake sure the Omnix engine is initialized and running.");
    }
  });

// Handle -prompt and -mode as aliases for --prompt and --mode
const args = process.argv.map(arg => {
  if (arg === "-prompt") return "--prompt";
  if (arg === "-mode") return "--mode";
  return arg;
});

program.parse(args);