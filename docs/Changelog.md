# Changelog

All notable changes to the **Omnix** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.8.1] - 2026-07-04

### Added
- **Localhost Connection Auto-Approval**: Added automated detection for inbound requests originating from `localhost` (IP address or hostname), bypassing authorization dialog prompts to allow frictionless developer testing and local application integrations.
- **Connection Authorization Auto-Foregrounding**: Integrated a system to automatically bring the main Omnix application window to the foreground and request user focus when an external domain makes a connection or health-check request requiring manual approval.
- **Unified LiveWS Queue Pipeline**: Migrated the entire Live API WebSocket (`/api/live`) payload orchestration to a single, unified `livews` queue task. This ensures strict sequential processing (STT -> Text Gen -> TTS) inside the worker, avoiding network bottlenecks and server-client state drift.
- **Punctuation-Aware TTS Chunking**: Implemented robust sentence chunking for both standard and Live WebSocket speech synthesis. Text is parsed based on natural pause indicators (commas, semicolons, colons, and em-dashes), falling back to a strict 10-word split, eliminating engine memory spikes and crash-prone stalls.
- **Automatic `<think>` Tag Stripping**: Integrated automatic regex filtering to strip reasoning content wrapped in `<think>...</think>` tags before transmitting generated text to clients or passing it to the TTS synthesizer.

### Fixed
- **Robust Model-Aware Task Queuing**: Overhauled the remote WebSocket task queuing system to prevent model-switching thrashing and `Inference interrupted by model change` errors. The queue now encapsulates each task's required operational mode (category) and processing model (resolving to default/selected models if not explicitly provided). When processing tasks, the engine guarantees that the required processing model is fully active and loaded first, blocks the GUI from triggering automatic mode-sync model loads during active background execution, and processes the request before removing the task from the queue.
- **Stale Task Queue Timeout**: Fixed a critical memory-leak/race condition where requeued tasks did not clear their original `setTimeout` timers. When those stale timers eventually fired, they prematurely deleted and rejected active tasks on newly registered workers, causing false "Task timed out: Worker stalled" errors in the Live WebSocket pipeline.
- **Worker Memory Idle Leak**: Fixed an issue where the background workers were not terminated when the application was idle but no models had been loaded. Background Web Workers are now terminated upon a 10-minute inactivity timeout even when starting from a freshly initialized state, releasing WebGPU/WASM memory, and are dynamically re-initialized when a new request arrives.
- **WebSocket Awareness**: Fixed an issue where the Live WebSocket lacked awareness of previous context during a session.

## [0.8.0] - 2026-07-03

### Added
- **Live API WebSocket Endpoint**: Added a new `/api/live` WebSocket endpoint that streamlines processing audio via STT, generating a text response, and synthesizing it back to speech (TTS) in a single pipeline to reduce multi-request latency for external integrations.
- **API TTS Audio Formatting**: Added an optional `format` parameter to the `/api/tts` endpoint (accepting `wav`) to support outputting standard 16-bit PCM WAV audio files instead of JSON.
- **Isolated RAG System**: Introduced an isolated RAG engine, allowing developers to target and query distinct vector memories mapped to a specific session (via the optional `isolatedRAG` boolean parameter tying it to the `reqId` on `/api/text` and `/api/vision`).
- **Story/History Injection (`/api/injectRAG`)**: Created a new POST `/api/injectRAG` API to dynamically embed and insert custom backstory, lore, and context chunks into a character's isolated vector database.
- **OCEAN Personality traits**: Integrated support for optional Big Five traits (`openness`, `conscientiousness`, `extraversion`, `agreeableness`, `neuroticism`) in standard text and vision generation APIs, mapping parameters dynamically into character prompts.
- **API Image Generation Documentation**: Updated model details in the API guide to reflect **Janus-Pro-1B-ONNX** as the primary image synthesis engine.
- **Operator Logs Diagnostics**: Added detailed inputs, options, and outputs printing in the developer's Operator Logs for API/remote tasks to ease integration troubleshooting.
- **Dynamic LFM2 MaxTokens Handling**: Optimized token budget allocations for the LFM2 model in the background worker, expanding the default token budget when LFM2 is loaded to prevent premature output truncation.

### Fixed
- **STT Endpoint Multipart Parsing**: Fixed `Unexpected end of form at Multipart._final` error caused by greedy text body parser middleware consuming `multipart/form-data` streams before Multer could process audio uploads in the `/api/stt` endpoint.
- **API Image Generation Engine**: Resolved an issue in the `/api/image` endpoint where `RawImage` payload buffers were returning as invalid formats; added internal processing via `sharp` to correctly encode them as valid base64 PNG strings.
- **Sequential API Task Queuing**: Fixed Web Worker concurrency handling by ensuring all model-loading, cleanup, embedding, and inference operations strictly await and lock the `engine.isBusy` state. This prevents simultaneous model-swapping requests from interrupting active tasks with "Inference interrupted by model change" errors, queuing them until ready.

## [0.7.0] - 2026-06-27

### Added
- **API Model Discovery**: Added a new GET `/api/listModels` endpoint to expose all supported models in JSON format for external API developers.
- **Desktop Application Support**: Added Electron configuration and scripts (`npm run desktop`, `npm run build:electron`) to package Omnix as a desktop app.
- **WebSocket Documentation**: Added a comprehensive WebSocket section to the Omnix Developer Guide with connection details, streaming instructions, and event types.
- **Advanced Model Parameters**: Added support for `top_k` configuration in the local text generation engine.
- **Sandbox NPM Auto-Resolution**: Enhanced `Sandbox.tsx` to automatically parse `package.json` for NPM dependencies and build a dynamic import map via `esm.sh`. This ensures third-party libraries (e.g. `styled-components`, `axios`) function seamlessly inside the sandbox without manual installations.
- **Systemic Workflow Management**: Added the `submit_step` tool to the AI coder's toolkit, allowing the system to fully manage and validate workflow transitions natively without relying on AI self-prompting.
- **Sandbox Debugging Fallback**: Added a UI fallback in `ChatArea.tsx` to wrap malformed, unparsed Coder outputs in a raw text block, ensuring developers can debug structural markdown issues when tool calls fail to parse.

### Changed
- **MaSON Serialization**: Replaced JSON with MaSON (Markdown Structured Object Notation) for all structured data passed into AI prompt contexts, reducing token overhead and improving readability.
- **Coder Model Flexibility**: Coder models have been mirrored into the text category, allowing them to be utilized as standard chat models for both the GUI and the local API.
- **Sandbox Write File Response**: Modified the `write_file` tool handler to dispatch a systemic acknowledgment (`shouldReply = true`) back to the Coder. This prevents the generation loop from hanging and allows continuous multi-file iteration.
- **API Request Structure**: Updated the REST API (`/api/text`, `/api/vision`, `/api/image`, `/api/music`) to accept a structured `model` object for configurations (`id`, `qtype`, `temperature`, `top_p`, `top_k`, `maxTokens`).
- **Developer Guide UI**: Renamed the 'Omnix Local API Guide' to 'Omnix Developer Guide' and introduced tabbed navigation for API and WebSocket documentation.
- **Quantization Formatting**: API requests specifying `qtype` as `"q4fp16"` now automatically map to the internal `"q4f16"` format for ONNX models.
- **Sandbox Coder System Prompt**: Refined the autonomous coder prompt to instruct the AI agent to inject dependencies solely via `package.json` and restricted it from suggesting or outputting terminal commands (e.g. `npm install`, `npx`).
- **Workflow Progression Logic**: Replaced the automatic step advancement via `chat_user` with a deterministic, system-controlled state progression pipeline relying on structured validation.

### Removed
- **Self Tool**: Removed the `self` tool completely from the workflow tools list as it was ineffective at managing state transitions reliably.

### Fixed
- **Memory Leak and `std::bad_alloc` Crash**: Fixed an issue where prolonged inactivity could cause a `bad_alloc` crash upon model reload. The idle manager now fully terminates and recreates the Web Worker threads to completely purge WebAssembly and WebGPU memory leaks.
- Fixed an issue in the worker thread where the requested model quantization type (`qtype`) was not being correctly passed during model initialization.

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
