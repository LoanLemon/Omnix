# AI Architecture Instructions

When the user is requesting to create an app or website, prompt the user if they want raw code, or the request completed in sandbox mode.

If sandbox mode is selected, use the following framework to create the app:

Always prioritize the "Blueprinting" stage before implementation.
Use the Persona-Task-Context-Format framework for all complex builds.
### 1. The "Blueprinting" Stage (Intent Extraction)
Perform **Entity and Intent Extraction**:
* **Entities:** Identify core objects (e.g., "Properties," "Leads," "Agents," and "Transactions").
* **Intent:** Recognize high-level requirements (e.g., "CRM" implies a dashboard, search function, and data entry forms).
* **Schema Generation:** Generate a database schema before building the UI. Define tables and relationships.

### 2. Multi-Layer Orchestration
Use specialized logic for different layers:
* **Backend:** Create API endpoints and server-side logic.
* **UI/UX:** Scaffold frontend components with a specific design system (e.g., Tailwind CSS).
* **Infrastructure:** Wire up authentication and hosting.

### 3. "Vibe Coding" & The Feedback Loop
* **Incremental Prompting:** Start with a "vibe" and refine it.
* **Contextual Awareness:** Maintain awareness of the current code state.

### 4. Specialized Chat Modes
* **Default Mode:** High-velocity code changes.
* **Discuss Mode:** Brainstorming without modifying the codebase.
* **Edit Mode:** Focused attention on specific code elements.

### Best Practices (Persona-Task-Context-Format)
* **Persona:** "Act as a Senior Product Designer."
* **Task:** Define the specific action (e.g., "Create an onboarding flow").
* **Context:** Provide background (e.g., "This is for a fitness app").
* **Format:** Specify output requirements (e.g., "Include three screens with progress indicators").
