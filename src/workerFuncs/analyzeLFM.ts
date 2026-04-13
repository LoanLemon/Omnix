import * as Transformers from "@huggingface/transformers";
import * as ort from "onnxruntime-web";

const { 
  RawImage,
  AutoTokenizer,
  AutoProcessor,
} = Transformers as any;

export async function analyzeLFM(
  image: string, 
  prompt: string, 
  lfmSessions: any, 
  lfmTokenizer: any, 
  lfmProcessor: any,
  isInterrupted: boolean,
  postMessage: (msg: any) => void
) {
  const rawImage = await RawImage.read(image);
  const messages = [{ role: "user", content: [{ type: "image" }, { type: "text", text: prompt }] }];
  const formattedPrompt = lfmTokenizer.apply_chat_template(messages, { add_generation_prompt: true, tokenize: false });
  const inputIds = lfmTokenizer.encode(formattedPrompt);
  
  const getTextEmbeddings = async (ids: number[]) => {
    const tensor = new ort.Tensor("int64", new BigInt64Array(ids.map(BigInt)), [1, ids.length]);
    const out = await lfmSessions.embedTokens.run({ input_ids: tensor });
    return out.inputs_embeds;
  };

  const getImageEmbeddings = async (img: any) => {
    let pixelValues;
    if (lfmProcessor) {
      const processed = await lfmProcessor(img);
      pixelValues = processed.pixel_values;
    } else {
      const resized = await img.resize(224, 224);
      pixelValues = new ort.Tensor("float32", new Float32Array(resized.data), [1, 3, 224, 224]);
    }
    const out = await lfmSessions.embedImages.run({ pixel_values: pixelValues });
    return out.image_features || out.output || Object.values(out)[0];
  };

  const initCache = () => {
    const cache: any = {};
    const hiddenSize = 1536;
    const numKVHeads = 12;
    const headDim = 128;
    for (const name of lfmSessions.decoder.inputNames) {
      if (name.startsWith("past_conv")) {
        cache[name] = new ort.Tensor("float32", new Float32Array(hiddenSize * 3), [1, hiddenSize, 3]);
      } else if (name.startsWith("past_key_values")) {
        cache[name] = new ort.Tensor("float32", new Float32Array(0), [1, numKVHeads, 0, headDim]);
      }
    }
    return cache;
  };

  const updateCache = (cache: any, outputs: any) => {
    for (const [name, tensor] of Object.entries(outputs)) {
      if (name.startsWith("present_conv")) {
        cache[name.replace("present_conv", "past_conv")] = tensor;
      } else if (name.startsWith("present.")) {
        cache[name.replace("present.", "past_key_values.")] = tensor;
      }
    }
  };

  let inputsEmbeds = await getTextEmbeddings(inputIds);
  const imageTokenId = lfmTokenizer.image_token_id || lfmTokenizer.encode("<image>")[0];
  const imageIdx = inputIds.indexOf(imageTokenId);
  
  if (imageIdx !== -1) {
    const imgEmbeds = await getImageEmbeddings(rawImage);
    const textData = inputsEmbeds.data as Float32Array;
    const imgData = imgEmbeds.data as Float32Array;
    const hiddenSize = 1536;
    const newData = new Float32Array(textData.length - hiddenSize + imgData.length);
    newData.set(textData.slice(0, imageIdx * hiddenSize));
    newData.set(imgData, imageIdx * hiddenSize);
    newData.set(textData.slice((imageIdx + 1) * hiddenSize), imageIdx * hiddenSize + imgData.length);
    inputsEmbeds = new ort.Tensor("float32", newData, [1, inputIds.length - 1 + (imgData.length / hiddenSize), hiddenSize]);
  }

  const cache = initCache();
  const eosTokenId = lfmTokenizer.eos_token_id;
  const generatedTokens: number[] = [];
  let curLen = inputsEmbeds.dims[1];
  let embeds = inputsEmbeds;

  for (let step = 0; step < 512; step++) {
    if (isInterrupted) break;
    const attentionMask = new ort.Tensor("int64", new BigInt64Array(curLen).fill(1n), [1, curLen]);
    const outputs = await lfmSessions.decoder.run({ inputs_embeds: embeds, attention_mask: attentionMask, ...cache });
    const logits = outputs.logits;
    const vocabSize = logits.dims[2];
    const lastLogits = logits.data.slice((logits.dims[1] - 1) * vocabSize);
    
    let nextToken = 0;
    let maxLogit = -Infinity;
    for (let i = 0; i < vocabSize; i++) {
      if (lastLogits[i] > maxLogit) {
        maxLogit = lastLogits[i] as number;
        nextToken = i;
      }
    }
    generatedTokens.push(nextToken);
    if (nextToken === eosTokenId) break;
    updateCache(cache, outputs);
    embeds = await getTextEmbeddings([nextToken]);
    curLen++;
    if (step % 5 === 0) {
      const partial = lfmTokenizer.decode(generatedTokens, { skip_special_tokens: true });
      postMessage({ type: "update", data: { output: partial, stats: { tps: "N/A", tokens: generatedTokens.length } } });
    }
  }
  return lfmTokenizer.decode(generatedTokens, { skip_special_tokens: true });
}
