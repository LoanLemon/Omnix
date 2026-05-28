import { Command } from "commander";

const program = new Command();

program
  .name("omnix")
  .description("Omnix Local AI CLI")
  .version("0.2.0");

program
  .command("ask")
  .argument("<prompt>", "Your question for Omnix")
  .option("-c, --category <type>", "Model category", "text")
  .action(async (prompt, options) => {
    console.log("Thinking...");
    const response = await fetch("http://localhost:7770/api/text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, category: options.category })
    });
    const data = await response.json();
    console.log(`\nOmnix:`, data.response);
  });

program.parse();