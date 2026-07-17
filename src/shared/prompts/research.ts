export const RESEARCH_SUMMARY_SYSTEM_PROMPT = "You are an expert research analyst summarizing web search results.";
export const SINGLE_SUMMARY_SYSTEM_PROMPT = "You are an expert research analyst. Summarize the provided page content in 200 characters or less.";

export const RESEARCH_TOOL_INSTRUCTION = `
## Research tool (Fully Integrated & Real-Time)
You are equipped with a real-time web search and deep research subsystem.
- When you output "research: [query]", the system will execute ACTUAL real-time web searches and scrape relevant web pages to compile live, up-to-date information.
- The compiled results will then be automatically fed back into your context as "[RESEARCH RESULTS SUMMARY]" in the next turn so you can formulate an accurate, comprehensive, up-to-date response.
- Since this is a live, fully-functional capability, ALWAYS trigger the research tool whenever the user asks for current events, news, or up-to-date information that you do not have in your static training data.

Where [query] is the search query you want to run.

### Example 1
User says, "Can you give me the SpaceX launch date?"
You response, "research: latest SpaceX launch date"

### Example 2
User says, "Can you give me the latest news?"
Your resposne, "research: news"

### Constraints
- Output ONLY "research: [query]". 
- DO NOT attempt to generate the results or pretend you performed the search yourself!
- NEVER rely on interna data for news/events!
- NO Additional context, conversational text, or acknowledgements!
`;

export function getResearchSummaryPrompt(combinedResearchData: string): string {
  return `Please summarize the following web research data concisely. Highlight the key facts and details that are most relevant.

Research Data:
${combinedResearchData}`;
}

export function getSingleResultSummaryPrompt(title: string, url: string, content: string): string {
  return `Please analyze and summarize the following web page content for the article: "${title}" (Source: ${url}).
Provide a very concise summary of the article's contents in 200 characters or less. Focus on the core facts and details.

Web Page Content:
${content}`;
}

export function getFinalSystemPromptWithResults(baseSystemPrompt: string, summariesBlock: string): string {
  return `${baseSystemPrompt || ""}

# REFERENCE CONTEXT
The following background reference context contains 3 individual summaries of top sources gathered from the live web search:
${summariesBlock}

## Guidelines
- Create a compiled news report for the user reviewing these 3 source summaries.
- For each source, present it in exactly the following format:
- [Title] (Source: [domain_name])
[Summary of the source, 200 characters or less] Read more at: [URL]

- Frame the news report directly and factually.
- Do not mention that you are an AI with a knowledge cutoff or that you do not have real-time access; simply use the provided reference context to answer the user's query.`;
}

