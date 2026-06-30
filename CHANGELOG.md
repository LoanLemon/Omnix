# Changelog

## [v0.7] - 2026-06-29

### Added
- **Fara-7B Support**: Added native support for loading `onnx-community/Fara-7B-Onnx` (a multimodal SLM based on Qwen2.5-VL) through the `image-text-to-text` pipeline while maintaining compatibility with coder/text execution tasks.
- **LFM2 Model Support**: Added robust native support for the `LFM2-1.2B-ONNX` model in the worker engine, fully enabling direct array `messages` execution and `TextStreamer` compatibility to natively support Tool Calling formats via `tokenizer_encode_kwargs`.
- **Mason-Parser Optimization**: Implemented the new `{ compact: true }` mode for `mason-parser` across the application (`useSocketInference.ts`, `usePipelineGeneration.ts`, `socketHandler.ts`) to minimize token usage and improve stringification efficiency.

### Changed
- **Dependency Updates**: Updated `mason-parser` to the latest version.

### Fixed
- **WebGPU Crash Recovery**: Implemented graceful error handling and recovery for aborted WebGPU generation caused by model swapping, session disposal, or destruction (updated worker and ModelEngine).
- **Qtype Selection Fix**: Fixed an issue where changing the `qtype` in the sidebar wasn't properly switching the loaded model. The selected `qtype` is now correctly retrieved from state and passed to model loading and inference routines.
