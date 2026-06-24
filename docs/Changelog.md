# Changelog

All notable changes to the **OmniX** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
