import { safeDisposeTensors, float32ArrayToWavUrl } from "../helpers/helpers.worker";

export async function handleMusicInference(
  engine: any,
  input: any,
  maxTokens: number
): Promise<any> {
  const inputs = engine.processor(input);
  const audio_values = await engine.model.generate({ 
    ...inputs, 
    max_new_tokens: maxTokens, 
    do_sample: true, 
    guidance_scale: 3 
  });
  
  const sampling_rate = engine.model.config.audio_encoder.sampling_rate;
  const wavUrl = await float32ArrayToWavUrl(audio_values.audio_values.data, sampling_rate);
  
  safeDisposeTensors(inputs);
  safeDisposeTensors(audio_values);
  
  return { audio: wavUrl, sampling_rate };
}
