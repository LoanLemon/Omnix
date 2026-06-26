import { RawImage } from "@huggingface/transformers";
import { safeDisposeTensors } from "../helpers/helpers.worker";

export async function handleImageInference(
  engine: any,
  category: string,
  input: any,
  options: any,
  maxTokens: number
): Promise<any> {
  const isVision = category === "vision";

  if (engine.currentModelId?.toLowerCase()?.includes("fastvlm")) {
    if (!isVision) {
      // Fallback to text mode if somehow called without image
      const inputs = await engine.processor(input);
      const outputs = await engine.model.generate({ ...inputs, max_new_tokens: maxTokens });
      const new_tokens = outputs.slice(null, [inputs.input_ids.dims.at(-1), null]);
      const decoded = engine.processor.batch_decode(new_tokens, { skip_special_tokens: true });
      
      safeDisposeTensors(inputs);
      safeDisposeTensors(outputs);
      safeDisposeTensors(new_tokens);
      
      return decoded[0];
    }

    // We have an image (input is the base64 string or RawImage)
    const image = await RawImage.fromURL(input);
    
    let inputs;
    try {
      if (engine.processor.apply_chat_template || engine.processor.tokenizer?.apply_chat_template) {
        const conversation = [
          {
            role: "user",
            content: [
              { type: "image" },
              { type: "text", text: options.prompt || "Describe this image" }
            ]
          }
        ];
        inputs = await engine.processor(conversation, { images: image });
      } else {
        throw new Error("No apply_chat_template");
      }
    } catch (e) {
      console.warn("(Worker) Processor apply_chat_template failed, using fallback image+text processing for FastVLM:", e);
      const prompt = `<|im_start|>user\n<image>\n${options.prompt || "Describe this image"}<|im_end|>\n<|im_start|>assistant\n`;
      inputs = await engine.processor(image, prompt);
    }

    const outputs = await engine.model.generate({
      ...inputs,
      max_new_tokens: maxTokens,
      do_sample: false,
    });

    const sliceOutput = outputs.slice(null, [inputs.input_ids.dims.at(-1), null]);
    const decoded = engine.processor.batch_decode(
      sliceOutput,
      { skip_special_tokens: true },
    );
    
    safeDisposeTensors(inputs);
    safeDisposeTensors(outputs);
    safeDisposeTensors(sliceOutput);
    if (image && typeof (image as any).dispose === 'function') {
      try { (image as any).dispose(); } catch (e) {}
    }
    
    return decoded[0];
  }

  if (engine.currentModelId?.toLowerCase().includes("janus")) {
    let inputs;
    if (isVision) {
      const rawImage = await RawImage.fromURL(input);
      
      try {
        const messages = [
          {
            role: "<|User|>",
            content: [
              { type: "image" },
              { type: "text", text: options.prompt || "Describe this image" }
            ],
            images: [rawImage]
          }
        ];
        inputs = await engine.processor(messages, { generation_mode: "text" });
      } catch (err) {
        console.warn("(Worker) Janus modern content-array format failed, falling back to original format", err);
        const conversation = [
          { role: "<|User|>", content: `<image_placeholder>\n${options.prompt || "Describe this image"}`, images: [rawImage] }
        ];
        inputs = await engine.processor(conversation);
      }
      
      const outputs = await engine.model.generate({ 
        ...inputs, 
        max_new_tokens: maxTokens,
        generation_mode: "text" 
      });
      const new_tokens = outputs.slice(null, [inputs.input_ids.dims.at(-1), null]);
      const decoded = engine.processor.batch_decode(new_tokens, { skip_special_tokens: true });
      
      safeDisposeTensors(inputs);
      safeDisposeTensors(outputs);
      safeDisposeTensors(new_tokens);
      if (rawImage && typeof (rawImage as any).dispose === 'function') {
        try { (rawImage as any).dispose(); } catch (e) {}
      }
      
      return decoded[0];
    } else {
      // Text to Image task
      try {
        const messages = [
          {
            role: "<|User|>",
            content: [
              { type: "text", text: input }
            ]
          }
        ];
        inputs = await engine.processor(messages, { chat_template: "text_to_image" });
      } catch (err) {
        console.warn("(Worker) Janus text_to_image modern messages failed, falling back to simple format", err);
        const conversation = [
          { role: "<|User|>", content: input }
        ];
        inputs = await engine.processor(conversation, { chat_template: "text_to_image" });
      }
      
      const num_image_tokens = engine.processor.num_image_tokens || 576;
      const outputs = await engine.model.generate_images({ 
        ...inputs, 
        min_new_tokens: num_image_tokens, 
        max_new_tokens: num_image_tokens, 
        do_sample: true 
      });
      
      const raw = outputs[0];
      const result = {
        __serialized_type__: "RawImage",
        width: raw.width,
        height: raw.height,
        channels: raw.channels,
        data: Array.from(raw.data)
      };
      
      safeDisposeTensors(inputs);
      safeDisposeTensors(outputs);
      
      return result;
    }
  }

  // Fallback if we have general pipeline and category is image-gen
  if (engine.pipeline && category === "image-gen") {
    const pipeTemp = options.temperature !== undefined ? Number(options.temperature) : undefined;
    const pipeTopP = options.top_p !== undefined ? Number(options.top_p) : undefined;
    let pipeDoSample = options.do_sample !== undefined ? !!options.do_sample : undefined;
    if (pipeTemp !== undefined || pipeTopP !== undefined) {
      pipeDoSample = pipeTemp !== 0;
    }

    const pipeOptions: any = {
      ...options,
      max_new_tokens: maxTokens,
      ...(pipeTemp !== undefined ? { temperature: pipeTemp } : {}),
      ...(pipeTopP !== undefined ? { top_p: pipeTopP } : {}),
      ...(pipeDoSample !== undefined ? { do_sample: pipeDoSample } : {}),
    };

    const output = await engine.pipeline(input, pipeOptions);
    if (output instanceof RawImage) {
      const result = {
        __serialized_type__: "RawImage",
        width: output.width,
        height: output.height,
        channels: output.channels,
        data: Array.from(output.data)
      };
      safeDisposeTensors(output);
      return result;
    }
  }

  return null;
}
