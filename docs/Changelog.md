# Changelog

All notable changes to the **OmniX** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.6.0] - 2026-06-25

### Added
- **Context Retention Limits**: Replaced raw message count retention with character-based limits (Context Length). This normalizes conversation memory scaling across different models.
- **Generation Parameters**: Added visual sliders to the sidebar for precise user control over model generation parameters, including `Temperature`, `Top_P`, and `Top_K`.
- **Gemma 4 Support**: Integrated full support for the Gemma 4 model architecture.
- **Industry Standard Chat Templates**: Aligned model instruction delivery with standard Chat ML array formats using `apply_chat_template`, phasing out legacy role tokens.
- **Thinking Channel Integration**: Configured automated injection of `<|think|>` tokens into the system block to enable step-by-step reasoning natively.
- **Strict Context Management**: Implemented automatic parsing rules to strip `<|channel>thought...<channel|>` outputs from historical turns, preserving multi-turn context integrity.
- **Strict Multimodal Input Rules**: Engineered modality ordering constraints to pass images before text and audio after text, strictly adhering to Gemma 4 multimodal specifications.
- **Dedicated Gemma 4 System Prompts**: Authored and deployed `gemma4TextSystemPrompt` tailored exclusively for Gemma 4's formatting requirements and identity guidelines.
- **Dedicated Sandbox Dialog Prompt**: Implemented a dialog box that triggers when users manually select the Sandbox mode in the operational dropdown. This gives users a choice to start a new sandbox session or convert the current chat tab into a Sandbox session.
- **Multi-Model Routing & Scheduling (MMRS) Engine**: Implemented a highly performant concurrent model execution pipeline using separate dedicated Web Workers.
- **Dual Web-Worker Isolation**: Separated the main linguistic model thread ("text" worker) from auxiliary operation models ("op" worker) to prevent any blocking of text inference when streaming/generating TTS, STT, or images.
- **Dynamic MMRS Switch**: Added a control switch under the GUI sidebar (`MULTI_MODEL_MMRS`) allowing users to easily toggle parallel multi-model scheduling on the fly.
- **Port Documentation Realignment**: Updated default API port reference to port `9777` in both code config and global README documentation to prevent user confusion.
- **Dynamic RAM Calculations by QTYPE**: Implemented the `getRequiredRamForModel` and `getBestFittingQtype` functions in `modelList.ts` to calculate minimum RAM requirements dynamically. This handles parameter size tiers (0.5B, 1B, 3B, 6B, 8B) across multiple quantization and precision levels (Q4, Q8, FP16, FP32).
- **Llama 3.1 8B Instruct Support**: Replaced the heavy FP16 variant of Llama 3.1 8B with `LemOneLabs/Llama-3.1-8B-Instruct-ONNX` (id: `llama-3.1-8b-instruct`), setting its default precision to Q4 and base minimum RAM requirement to 6GB.
- **Dynamic Precision Selection Warnings**: Enhanced the Sidebar UI to disable individual QTYPE options that exceed the system's detected RAM capacity, appending a descriptive minimum RAM requirement warning badge inline.
- **Disabled Model Capacity Badging**: Added clear RAM capacity notifications next to models in the dropdown that are disabled due to insufficient system RAM resources.

### Changed
- **Version Bump**: Bumped core package configuration versioning to `0.6.0`.
- **Sandbox Operational Mode Fix**: Ensured the operational mode select dropdown is disabled when the active tab is already in a Sandbox Session, preventing changes.
- **Sandbox JSON Parsing Fix**: Added error recovery to the JSON parser in Sandbox mode to handle invalid escaped characters (like `\}`) inside JSON strings before parsing tool calls.
- **Sandbox JSON Automatic Retry**: Implemented automatic rejection of malformed or non-JSON responses from the AI. The system will now inject an error message asking the AI to output valid JSON conforming to the schema and automatically queue a retry (up to 3 times) to ensure the AI recovers.
- **Sandbox Mental Notes Implementation**: Updated system prompt and chat UI to treat any text output outside JSON tool calls as invisible "mental notes from AI to AI" which are preserved in context but hidden from the user, ensuring the agent uses `chat_user` for explicit communication.
- **Sandbox Error Routing**: Added feature to pipe client-side console errors thrown in the Sandbox preview directly back to the active chat session (debounced). This allows the AI agent to immediately detect and automatically attempt to resolve runtime script errors without user intervention.
- **Sandbox HTML Inlining**: Added automatic inlining of CSS and JS files within Sandbox blob iframe preview. Ensures multi-file projects run cohesively within standard Blob iframes.
- **Sandbox Language Case Check**: Standardized language casing logic so files labeled with `"language": "HTML"` correctly map to HTML compilation paths.
- **Sandbox Build & Compilation Fix**: Ensured the Sandbox correctly creates and deploys TypeScript apps as an iframe "blob" object by natively loading `@babel/standalone` and `react` via import maps in the iframe payload template, facilitating live previews of code natively.
- **Sandbox Preview Sidebar Fix**: Resolved an issue where the Sandbox UI would not render on empty sessions. Updated app layout logic to always force render the Preview Sidebar and set the `activeTab` to 'sandbox' whenever the operational mode is 'sandbox'.
- **Adaptive Model Selection Hook**: Refactored `useModelManagement` to dynamically resolve model compatibility. The system now searches for alternative, compatible precision modes (QTYPEs) for the same model before falling back to smaller models when detected system RAM drops.
- **Optimized Initial Precision Bootstrapping**: Standardized state initialization to automatically pair each model with the highest-precision QTYPE that fits the user's current system RAM profile.

---

## [0.5.0] - 2026-06-24

### Added
- **Multi-Client Input Normalization Middleware**: Introduced a robust, automated body-parsing pipeline in `server.ts` that dynamically detects and normalizes raw plain text, nested stringified JSON, and double-wrapped URL-encoded structures. This enables seamless integration with PowerShell CLI (`Invoke-RestMethod`), Curl, and custom external HTTP tools without triggering parsing failures.
- **Strict Parsing Fallbacks**: Added secondary parsing layers for clients that omit standard `Content-Type: application/json` headers or transmit multi-layered payloads.

### Changed
- **Express Payload Processing Flow**: Reordered and augmented standard parser middlewares (`express.json`, `express.urlencoded`, and `express.text`) to resolve request streaming contentions.
- **API Robustness**: Consolidated internal validation checks on `/api/text` and `/api/health` endpoints to immediately flag malformed structures while allowing permissive parsing variations.
- **Version Bump**: Bumped core package configuration versioning to `0.5.0`.

---

## [0.4.0] - 2026-06-24

### Added
- **Janus-Pro Browser Integration**: Integrated native **Janus-Pro-1B-ONNX** model support, allowing deep multimodal vision-to-text understanding and local text-to-image synthesis directly within browser environments.
- **Asymmetric Hybrid Device Execution Strategy**: Solved severe VRAM limits by offloading heavy raw embedding lookups (`prepare_inputs_embeds`) to WebAssembly (WASM CPU) while processing core attention layers, decoding matrices, and visual layers under full WebGPU acceleration.
- **Shader F16 Fallback Protection**: Engineered dynamic pipeline downscaling. If client hardware fails `shader-f16` compatibility, the model loader gracefully falls back to FP32 or integer-quantized Q4 parameters to prevent loading failures.
- **Vision-to-Text ChatML Formatting**: Built a dual-structure ChatML templating engine with fallback image placeholders for visual processing tasks.
- **Autoregressive Text-to-Image Generation**: Supported 576-token grid generation loops using `text_to_image` chat templates.
- **Proactive Tensor Garbage Collection**: Added strict post-inference memory reclamation routines to deallocate native WebGPU buffers and release JS heap objects, preventing memory leaks during sustained user sessions.

---

## [0.3.0] - 2026-06-18

### Added
- **Local Dev Server Controls**: Expanded custom relay controllers inside the server module to manage hot reload, system re-boots, and background socket handler state machines.
- **Task Queue Prioritization**: Created a synchronized priority worker queue to process concurrent visual and linguistic generation jobs without bottlenecking worker threads.
