# Janus-Pro ONNX Integration in OmniX

This document explains how **Janus-Pro-1B-ONNX** is integrated and used directly in the browser within OmniX. It details the hybrid device execution strategy, input/output formatting templates, and memory-management routines required to make this powerful multimodal model run efficiently on consumer web hardware.

---

## 1. Role of Janus in OmniX

Janus-Pro is a unified, multimodal model developed by **DeepSeek**. It acts as a versatile dual-purpose engine in OmniX:
1. **Multimodal Understanding (Vision-to-Text)**: Allows users to upload an image and ask questions, performing visual feature extraction and contextual reasoning.
2. **Text-to-Image Generation (Image-Gen)**: Converts textual descriptions into high-quality visual assets natively inside the user's web browser, bypassing the need for remote servers.

---

## 2. In-Browser Model Initialization & WebGPU Optimization

WebGPU provides high-speed, hardware-accelerated tensor computations directly in browser sandboxes. However, Janus-Pro's memory footprint requires unique scheduling. To prevent out-of-memory (OOM) crashes and maximize inference speeds, we apply an **asymmetric hybrid device mapping** inside our model worker (`src/gui/lib/model.worker.ts`):

```typescript
const isJanus = info.id.toLowerCase().includes("janus");
const deviceChoice = isJanus ? {
  prepare_inputs_embeds: 'wasm', // CPU WebAssembly handles heavy raw embedding lookups
  language_model: 'webgpu',       // WebGPU speeds up the core self-attention block calculations
  lm_head: 'webgpu',
  gen_head: 'webgpu',
  gen_img_embeds: 'webgpu',
  image_decode: 'webgpu'
} : "webgpu";
```

### Why this architecture works:
* **`prepare_inputs_embeds` on WASM**: Precomputing input embeddings is extremely memory-intensive on WebGPU and can easily trigger VRAM constraints. Offloading this initial phase to CPU-side WebAssembly maintains system stability.
* **Core processing inside WebGPU**: The heavy causal autoregressive decoder (`language_model`), output projection heads (`lm_head`/`gen_head`), visual projection heads (`gen_img_embeds`), and image-space decoding layers (`image_decode`) utilize WebGPU. This provides massive parallelization for both text generation and image generation steps.
* **Shader F16 Fallback Protection**: If WebGPU does not support `shader-f16` (checked via `checkShaderF16Support()`), our loading pipeline dynamically degrades precision from standard `fp16` or `q4f16` down to `fp32` or vanilla `q4` to prevent pipeline compiles from failing.

---

## 3. Direct Pipeline Execution & Prompt Compilation

Janus uses a specific message formatting scheme. We compile prompts into the appropriate ChatML format or modern Python structures to ensure optimal results.

### A. Template Construction (ChatML formatting)
For conversational interactions, the model parses text using standard ChatML delimiters:
```text
<|im_start|>user
{user_message}<|im_end|>
<|im_start|>assistant
```

### B. Vision Mode (Image-to-Text)
When digesting user images, raw pixels are converted into `RawImage` objects and formatted into dual structured profiles:

```typescript
const conversation = [
  {
    role: "<|User|>",
    content: [
      { type: "image" },
      { type: "text", text: prompt }
    ],
    images: [rawImage]
  }
];
const inputs = await this.processor(conversation, { generation_mode: "text" });
```

If the modern content array layout fails, the engine falls back to a template using an explicit placeholder tag:
```typescript
const conversationFallback = [
  { 
    role: "<|User|>", 
    content: `<image_placeholder>\n${prompt}`, 
    images: [rawImage] 
  }
];
```

The output causal matrix is sliced to capture only the newly generated response tokens, discarding the original context tokens:
```typescript
const new_tokens = outputs.slice(null, [inputs.input_ids.dims.at(-1), null]);
const decoded = this.processor.batch_decode(new_tokens, { skip_special_tokens: true });
```

---

## 4. Text-to-Image Generation (Image-Gen Mode)

Janus generates visual content by autoregressively computing a grid of discrete visual tokens based on text descriptions.

### A. Chat Template Alignment
To generate images, we run the text input through the processor using `chat_template: "text_to_image"`:
```typescript
const messages = [
  {
    role: "<|User|>",
    content: [
      { type: "text", text: userPrompt }
    ]
  }
];
const inputs = await this.processor(messages, { chat_template: "text_to_image" });
```

### B. Image Token Constraints
In contrast to standard conversational loops, image generation requires a fixed visual output dimension:
* **Token Budget**: 576 tokens (`num_image_tokens`).
* **Generation Strategy**: Strict minimum and maximum constraints are set to exactly match this budget:
```typescript
const num_image_tokens = this.processor.num_image_tokens || 576;
const outputs = await this.model.generate_images({ 
  ...inputs, 
  min_new_tokens: num_image_tokens, 
  max_new_tokens: num_image_tokens, 
  do_sample: true 
});
```

The generated grid is decoded back into a serialized `RawImage` object, specifying width, height, channel layout, and pixel matrices, and returned to the main UI context.

---

## 5. Garbage Collection & Memory Reclamation

Running multi-gigabyte machine learning models in modern web browsers requires strict memory management. Accumulating stale tensors will trigger the hardware watchdog or browser tab crashes.

OmniX implements a proactive cleanup routine post-inference:
```typescript
// Explicit tensor cleanup
this.safeDisposeTensors(inputs);
this.safeDisposeTensors(outputs);
this.safeDisposeTensors(new_tokens);

// Deallocate Raw Image sources immediately
if (rawImage && typeof rawImage.dispose === 'function') {
  try { rawImage.dispose(); } catch (e) {}
}
```

This deallocates native WebGPU device buffer allocations and JS heap objects immediately, preventing memory leaks during long-running sessions.
