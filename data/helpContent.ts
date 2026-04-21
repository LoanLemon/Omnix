
export const HELP_HTML_CONTENT = `
<main class="space-y-8">
    <section>
        <h2 class="text-2xl font-bold text-amber-400 border-b border-stone-700 pb-2 mb-4">AI-ina-JavaScript Help Guide</h2>
        <nav>
            <h3 class="font-semibold text-amber-300 mb-2">Table of Contents</h3>
            <ul class="list-disc list-inside space-y-1 text-stone-300">
                <li><a href="#about" class="hover:underline text-amber-400">About This Tool</a></li>
                <li><a href="#roadmap" class="hover:underline text-amber-400">Roadmap to Superior Intelligence</a></li>
                <li><a href="#how-it-works" class="hover:underline text-amber-400">How It Works: The 5 Stages</a></li>
                <li><a href="#technical-integration" class="hover:underline text-amber-400">Technical Integration Guide</a>
                    <ul class="list-disc list-inside ml-6">
                        <li><a href="#integration-1" class="hover:underline text-amber-500">Option 1: ES Module Import (Modern Apps)</a></li>
                        <li><a href="#integration-2" class="hover:underline text-amber-500">Option 2: Classic Script Tag (Simple HTML)</a></li>
                        <li><a href="#integration-3" class="hover:underline text-amber-500">Option 3: Web Component (Encapsulated Widget)</a></li>
                        <li><a href="#integration-4" class="hover:underline text-amber-500">Option 4: Node.js API Endpoint (Server-Side)</a></li>
                        <li><a href="#integration-5" class="hover:underline text-amber-500">Option 5: iframe Embedding (Quick & Easy)</a></li>
                    </ul>
                </li>
                <li><a href="#faq" class="hover:underline text-amber-400">Frequently Asked Questions</a></li>
            </ul>
        </nav>
    </section>

    <section id="about">
        <h2 class="text-2xl font-bold text-amber-400 border-b border-stone-700 pb-2 mb-4">About This Tool</h2>
        <p class="text-stone-300">
            AI-ina-JavaScript is a tool for brewing the perfect offline AI assistant. It allows you to define a persona, pour in your specific knowledge, and then test and export a fully self-contained JavaScript-based chatbot.
        </p>
        <p class="text-stone-300 mt-2">
            The key feature is its ability to run entirely in the browser without needing a constant connection to a backend API, making your exported bot fast, private, and deployable anywhere.
        </p>
    </section>

    <section id="roadmap">
        <h2 class="text-2xl font-bold text-amber-400 border-b border-stone-700 pb-2 mb-4">Roadmap to Superior Intelligence</h2>
        <p class="text-stone-300 mb-4">
            This strategic roadmap outlines the phases of development to evolve this application's AI generation capabilities from a highly capable offline assistant to a truly intelligent, learning agent.
        </p>
        <div class="space-y-6">
            <div>
                <h3 class="text-xl font-semibold text-amber-300 mb-2">Phase 1: The Modern AI Foundation (RAG &amp; Tool Use)</h3>
                <p class="text-stone-300 mb-2">Shift the bot's core from a rule-based system to a modern, LLM-driven reasoning engine grounded in its knowledge base. This is the most critical upgrade to unlock higher-level reasoning.</p>
                <ul class="list-disc list-inside space-y-2 text-stone-300 pl-4">
                    <li><strong>Vectorized Knowledge Base:</strong> Move from keyword-based fact retrieval to semantic, meaning-based retrieval using a vector database. This allows the bot to find facts based on conceptual similarity, not just keyword matches.</li>
                    <li><strong>Implement Retrieval-Augmented Generation (RAG):</strong> Ensure the bot answers questions based on its verified knowledge base, dramatically reducing "hallucinations" and improving factual accuracy.</li>
                    <li><strong>Upgrade to LLM-Native Tool Use:</strong> Replace the current capability system with a more robust and flexible function-calling model, allowing the LLM itself to determine which tools to use and chain them together for complex tasks.</li>
                </ul>
            </div>
            <div>
                <h3 class="text-xl font-semibold text-amber-300 mb-2">Phase 2: Dynamic &amp; Proactive Interaction</h3>
                <p class="text-stone-300 mb-2">With the new foundation, we can make the bot feel truly alive and aware, capable of anticipating needs and understanding more than just text.</p>
                <ul class="list-disc list-inside space-y-2 text-stone-300 pl-4">
                    <li><strong>Advanced Conversational Memory:</strong> Implement a system for the bot to remember the entire context of a conversation over many turns, using summarization to maintain a persistent "memory."</li>
                    <li><strong>Proactive Goal-Oriented Agency:</strong> Transition the bot from a reactive assistant to a proactive agent that can anticipate user needs and suggest the next logical steps.</li>
                    <li><strong>Multi-Modal Understanding:</strong> Utilize multi-modal LLMs to allow the bot to understand images, diagrams, and audio, not just text.</li>
                </ul>
            </div>
            <div>
                <h3 class="text-xl font-semibold text-amber-300 mb-2">Phase 3: The Learning Flywheel</h3>
                <p class="text-stone-300 mb-2">Create a system where the bot continuously improves through interaction and feedback, creating a self-reinforcing loop of intelligence.</p>
                <ul class="list-disc list-inside space-y-2 text-stone-300 pl-4">
                    <li><strong>Feedback-Driven Fine-Tuning:</strong> Systematically collect user corrections and feedback to create high-quality datasets for fine-tuning the base language model, improving its accuracy and persona adherence over time.</li>
                    <li><strong>Automated Knowledge Base Curation:</strong> Allow the bot to learn new, verified information from successful tool use and, with administrative approval, add it to its core vector database to expand its expertise.</li>
                </ul>
            </div>
        </div>
    </section>

    <section id="how-it-works">
        <h2 class="text-2xl font-bold text-amber-400 border-b border-stone-700 pb-2 mb-4">How It Works: The 5 Stages</h2>
        <dl class="space-y-4">
            <div>
                <dt class="font-bold text-amber-300">Stage 1: Persona</dt>
                <dd class="text-stone-300 pl-4 border-l-2 border-stone-700 ml-2 mt-1">
                    Define the core identity of your AI. Its name, purpose, and personality instructions are crucial. This is the "System Prompt" that governs its behavior.
                </dd>
            </div>
            <div>
                <dt class="font-bold text-amber-300">Stage 2: Knowledge</dt>
                <dd class="text-stone-300 pl-4 border-l-2 border-stone-700 ml-2 mt-1">
                    Provide the raw text knowledge base for your bot. You can start with Wikipedia content generation and then refine it. Use markdown headers (## Topic) to structure facts.
                </dd>
            </div>
            <div>
                <dt class="font-bold text-amber-300">Stage 3: Filters & Guardrails</dt>
                <dd class="text-stone-300 pl-4 border-l-2 border-stone-700 ml-2 mt-1">
                    Fine-tune the bot's conversational abilities. Disable skills it doesn't need, block it from using certain words, and adjust its personality from direct to expressive.
                </dd>
            </div>
            <div>
                <dt class="font-bold text-amber-300">Stage 4: Analysis & Test</dt>
                <dd class="text-stone-300 pl-4 border-l-2 border-stone-700 ml-2 mt-1">
                    Brew the bot and see how it has interpreted your knowledge. Test its responses in the chat window to see how it performs with the information you provided.
                </dd>
            </div>
            <div>
                <dt class="font-bold text-amber-300">Stage 5: Capabilities & QA</dt>
                <dd class="text-stone-300 pl-4 border-l-2 border-stone-700 ml-2 mt-1">
                    Define custom JavaScript functions the bot can execute. Run the final Quality Assurance test to get a detailed report on its performance before exporting.
                </dd>
            </div>
        </dl>
    </section>

    <section id="technical-integration">
        <h2 class="text-2xl font-bold text-amber-400 border-b border-stone-700 pb-2 mb-4">Technical Integration Guide</h2>
        <p class="text-stone-300 mb-4">
            You can export your bot as a standalone <code class="bg-stone-700 px-1.5 py-1 rounded">.html</code> file with a chat UI, a <code class="bg-stone-700 px-1.5 py-1 rounded">.ps1</code> script for terminal chat, or a <code class="bg-stone-700 px-1.5 py-1 rounded">.js</code> module for custom integration. Here are five ways to use the exported JavaScript file.
        </p>

        <article id="integration-1" class="mt-6">
            <h3 class="text-xl font-semibold text-amber-300 mb-2">Option 1: ES Module Import (Modern Apps)</h3>
            <p class="text-stone-300 mb-2">Ideal for modern JavaScript frameworks like React, Vue, Svelte, or any project that uses a bundler (like Vite or Webpack).</p>
<pre><code class="language-javascript">// 1. Place the exported 'your-bot.js' file in your project's source folder.
// 2. Import the class into your component or script.
import { AIPersonaBot } from './your-bot.js';

// 3. Create a new instance of the bot.
const bot = new AIPersonaBot();

// 4. Send messages and get responses asynchronously.
async function chat(message) {
  const reply = await bot.sendMessage(message);
  console.log('Bot says:', reply.response);
  // reply.svg will contain an SVG string if one was generated
}

chat("Hello, what can you do?");
</code></pre>
        </article>

        <article id="integration-2" class="mt-6">
            <h3 class="text-xl font-semibold text-amber-300 mb-2">Option 2: Classic &lt;script&gt; Tag (Simple HTML)</h3>
            <p class="text-stone-300 mb-2">For simple websites without a build step. Note that the exported JS module uses modern features, so this works best if you export the full HTML file which contains a compatible script.</p>
            <p class="text-stone-300 mb-2">If you want to do this manually, you would use the "Package in .html" export option, then extract the script content from it. The bot class will be attached to the global <code class="bg-stone-700 px-1.5 py-1 rounded">window</code> object.</p>
<pre><code class="language-html">&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;&lt;title&gt;My Bot Page&lt;/title&gt;&lt;/head&gt;
&lt;body&gt;
  &lt;h1&gt;Chat with my AI&lt;/h1&gt;
  
  &lt;!-- Include the bot script extracted from the exported HTML file --&gt;
  &lt;script src="./your-bot-script.js"&gt;&lt;/script&gt;
  &lt;script&gt;
    // The bot class is now available globally
    const bot = new window.AIPersonaBot();

    async function talkToBot() {
      const reply = await bot.sendMessage("Hello there!");
      document.body.append(document.createElement('p')).textContent = reply.response;
    }

    talkToBot();
  &lt;/script&gt;
&lt;/body&gt;
&lt;/html&gt;
</code></pre>
        </article>

        <article id="integration-3" class="mt-6">
            <h3 class="text-xl font-semibold text-amber-300 mb-2">Option 3: Web Component (Encapsulated Widget)</h3>
            <p class="text-stone-300 mb-2">This advanced method wraps your bot in a custom HTML tag (e.g., <code class="bg-stone-700 px-1.5 py-1 rounded">&lt;persona-chat-widget&gt;&lt;/persona-chat-widget&gt;</code>) for easy and clean reuse across any web page.</p>
<pre><code class="language-javascript">// In a file like 'chat-widget.js'
import { AIPersonaBot } from './your-bot.js';

class PersonaChatWidget extends HTMLElement {
  constructor() {
    super();
    this.bot = new AIPersonaBot();
    this.attachShadow({ mode: 'open' }); // Use Shadow DOM for encapsulation
    this.shadowRoot.innerHTML = \`
      &lt;style&gt;/* Add your chat widget styles here */&lt;/style&gt;
      &lt;div id="chat-container"&gt;&lt;/div&gt;
      &lt;input type="text" id="chat-input" placeholder="Ask something..." /&gt;
    \`;
  }
  
  connectedCallback() {
    const input = this.shadowRoot.getElementById('chat-input');
    input.addEventListener('keypress', async (e) => {
      if (e.key === 'Enter') {
        const message = input.value;
        const reply = await this.bot.sendMessage(message);
        // ... code to display the reply in the chat-container ...
        input.value = '';
      }
    });
  }
}

customElements.define('persona-chat-widget', PersonaChatWidget);

// Then in your HTML: &lt;persona-chat-widget&gt;&lt;/persona-chat-widget&gt;
</code></pre>
        </article>

        <article id="integration-4" class="mt-6">
            <h3 class="text-xl font-semibold text-amber-300 mb-2">Option 4: Node.js API Endpoint (Server-Side)</h3>
            <p class="text-stone-300 mb-2">Run the bot on a server and create an API endpoint. This separates the AI logic from your front-end, which can then fetch responses. This is a robust, scalable solution. The <code class="bg-stone-700 px-1.5 py-1 rounded">.ps1</code> export option uses this Node.js-based approach.</p>
<pre><code class="language-javascript">// In a server file like 'server.js' using Express.js
import express from 'express';
import { AIPersonaBot } from './your-bot.js';

const app = express();
app.use(express.json());

const bot = new AIPersonaBot();
const chatHistory = {}; // Store history per user session

app.post('/chat', async (req, res) => {
  const { userId, message } = req.body;
  
  // You would manage separate bot instances or history for each user
  if (!chatHistory[userId]) {
    chatHistory[userId] = []; // Simplified history management
  }
  
  const reply = await bot.sendMessage(message);
  res.json(reply);
});

app.listen(3000, () => console.log('Bot API server running on port 3000'));
</code></pre>
        </article>

        <article id="integration-5" class="mt-6">
            <h3 class="text-xl font-semibold text-amber-300 mb-2">Option 5: &lt;iframe&gt; Embedding (Quick & Easy)</h3>
            <p class="text-stone-300 mb-2">The simplest method. Export your bot using the "Package in .html" option, host that HTML file on your server, and then embed it directly into another page using an iframe.</p>
<pre><code class="language-html">&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;body&gt;
  &lt;h1&gt;My Main Website&lt;/h1&gt;
  &lt;p&gt;Here is my embedded AI assistant:&lt;/p&gt;
  
  &lt;iframe
    src="/path/to/your-exported-bot.html"
    width="400"
    height="600"
    style="border: 1px solid #ccc; border-radius: 8px;"
    title="AI Persona Chat"&gt;
  &lt;/iframe&gt;
  
&lt;/body&gt;
&lt;/html&gt;
</code></pre>
        </article>
    </section>

    <section id="faq">
        <h2 class="text-2xl font-bold text-amber-400 border-b border-stone-700 pb-2 mb-4">Frequently Asked Questions</h2>
        <dl class="space-y-4">
            <div>
                <dt class="font-bold text-amber-300">Why does my bot give generic answers?</dt>
                <dd class="text-stone-300 pl-4 border-l-2 border-stone-700 ml-2 mt-1">
                    This usually happens when its knowledge base is too sparse or the user's question doesn't match any known facts or intents. Try adding more specific information to the Knowledge Base in Stage 2.
                </dd>
            </div>
            <div>
                <dt class="font-bold text-amber-300">How do I make the bot sound more like its persona?</dt>
                <dd class="text-stone-300 pl-4 border-l-2 border-stone-700 ml-2 mt-1">
                    Be very explicit in the Persona instructions (Stage 1). Use phrases like "You are...", "You always...", "You never...". The more detailed the instructions, the better it will adhere to the persona. Also, adjust the "Formality" slider in Stage 3.
                </dd>
            </div>
            <div>
                <dt class="font-bold text-amber-300">What are capabilities for?</dt>
                <dd class="text-stone-300 pl-4 border-l-2 border-stone-700 ml-2 mt-1">
                    Capabilities (Stage 5) allow your bot to execute custom JavaScript code. You can use this to have your bot perform actions like fetching live data from an API, performing complex calculations, or interacting with other parts of your web page. You call a capability from a response template by using its tag, like <code class="bg-stone-700 px-1.5 py-1 rounded">[MY_CUSTOM_TAG]</code>.
                </dd>
            </div>
        </dl>
    </section>
</main>
`;