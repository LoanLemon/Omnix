export async function handleRealtimeInference(
  engine: any,
  category: string,
  input: any,
  options: any,
  maxTokens: number
): Promise<any> {
  if (category === "stt") {
    if (!engine.sttPipeline) throw new Error("STT pipeline not loaded");
    const pipeOptions = { max_new_tokens: maxTokens, ...options };
    const output = await engine.sttPipeline(input, pipeOptions);
    if (Array.isArray(output) && output[0]?.text !== undefined) {
      return output[0].text;
    }
    if (output && typeof output === "object" && (output as any).text !== undefined) {
      return (output as any).text;
    }
    return output;
  }

  if (category === "tts") {
    if (!engine.ttsPipeline) throw new Error("TTS pipeline not loaded");
    const pipeOptions = { max_new_tokens: maxTokens, ...options };
    const output = await engine.ttsPipeline(input, pipeOptions);
    return output;
  }

  return null;
}
