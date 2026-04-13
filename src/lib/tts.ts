import { KokoroTTS } from "kokoro-js";
import { env } from "@huggingface/transformers";

// Suppress unnecessary logs
(env as any).debug = false;
(env as any).logLevel = 'error';
if (env.backends?.onnx) {
    env.backends.onnx.logLevel = 'error';
}

class KokoroEngine {
    private tts: any = null;
    private audioContext: AudioContext | null = null;
    private currentSource: AudioBufferSourceNode | null = null;
    private loading: boolean = false;
    private initialized: boolean = false;
    private playSessionId: number = 0;

    /**
     * Initializes the Kokoro model.
     * Uses WebGPU if available, otherwise falls back to WASM.
     */
    async init() {
        if (this.initialized || this.loading) return;
        this.loading = true;
        this.playSessionId++; // Invalidate any pending actions

        try {
            const device = 'gpu' in navigator ? 'webgpu' : 'wasm';
            
            // Using fp32 for better quality. 
            // Note: Use smaller text chunks to mitigate VRAM spikes on mobile.
            this.tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-ONNX", {
                dtype: "fp32", 
                device, 
            });
            this.initialized = true;
            console.log("Kokoro TTS Engine initialized");
            
            // Pre-create AudioContext to handle user gesture
            if (!this.audioContext) {
                this.audioContext = new AudioContext({ sampleRate: 24000 });
            }
        } catch (error) {
            console.error("Kokoro initialization failed:", error);
            this.initialized = false;
        } finally {
            this.loading = false;
        }
    }

    /**
     * Resumes the AudioContext. Should be called from a user gesture.
     */
    async resume() {
        if (!this.audioContext) {
            this.audioContext = new AudioContext({ sampleRate: 24000 });
        }
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    /**
     * Unloads the Kokoro model to free up memory.
     */
    async unload() {
        this.stop();
        if (this.tts) {
            // Transformers.js models often have a dispose method if they are using WebGPU/WASM backends
            if (typeof this.tts.dispose === 'function') {
                await this.tts.dispose();
            }
            this.tts = null;
        }
        this.initialized = false;
        this.loading = false;
        console.log("Kokoro TTS Engine unloaded");
    }

    /**
     * Generates an AudioBuffer from text.
     */
    async generate(text: string, voice: string = "af_bella"): Promise<AudioBuffer> {
        if (!this.initialized) await this.init();

        // Clean text for natural speech (remove markdown, handle pauses)
        const cleanText = text
            .replace(/[*_`#~]/g, '') // Remove markdown symbols
            .replace(/\[.*?\]\(.*?\)/g, '') // Remove links
            .replace(/[()]/g, ' ') // Replace parentheses with space for natural pause
            .trim();

        if (!cleanText) throw new Error("Text is empty after cleaning");

        console.log(`Generating speech for: "${cleanText.slice(0, 50)}${cleanText.length > 50 ? '...' : ''}"`);

        try {
            const start = performance.now();
            const result = await this.tts.generate(cleanText, { voice });
            const end = performance.now();
            
            console.log(`Speech generated in ${(end - start).toFixed(0)}ms`);
            
            // kokoro-js generate() returns a RawAudio object with 'audio' and 'sampling_rate'
            const audioData = result.audio || result.data || result;

            console.log("Audio data type:", audioData?.constructor?.name, "Length:", audioData?.length);

            if (!audioData || !(audioData instanceof Float32Array)) {
                console.error("Invalid audio data structure:", result);
                throw new Error("Invalid audio data format received");
            }

            // Normalize audio to prevent distortion
            let max = 0;
            for (let i = 0; i < audioData.length; ++i) {
                const abs = Math.abs(audioData[i]);
                if (abs > max) max = abs;
            }
            if (max > 1) {
                for (let i = 0; i < audioData.length; ++i) {
                    audioData[i] /= max;
                }
            }

            if (!this.audioContext) {
                this.audioContext = new AudioContext({ sampleRate: 24000 });
            }

            const buffer = this.audioContext.createBuffer(1, audioData.length, 24000);
            buffer.getChannelData(0).set(audioData);
            return buffer;
        } catch (err) {
            console.error("Speech generation error:", err);
            throw err;
        }
    }

    /**
     * Plays the generated audio.
     */
    async speak(input: string | AudioBuffer, voice: string = "af_bella", onStart?: () => void) {
        const sessionId = ++this.playSessionId;
        
        if (!this.initialized) await this.init();
        if (sessionId !== this.playSessionId) return;

        this.stop(false);

        try {
            const buffer = typeof input === 'string' ? await this.generate(input, voice) : input;
            if (sessionId !== this.playSessionId) return;

            if (!this.audioContext) {
                this.audioContext = new AudioContext({ sampleRate: 24000 });
            }

            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            this.currentSource = this.audioContext.createBufferSource();
            this.currentSource.buffer = buffer;
            this.currentSource.connect(this.audioContext.destination);
            
            return new Promise<void>((resolve) => {
                if (!this.currentSource || sessionId !== this.playSessionId) return resolve();
                
                this.currentSource.onended = () => {
                    if (this.currentSource && sessionId === this.playSessionId) {
                        this.currentSource = null;
                    }
                    resolve();
                };
                
                if (onStart) onStart();
                this.currentSource.start();
            });
        } catch (err) {
            console.error("Playback error:", err);
            throw err;
        }
    }

    /**
     * Stops current playback and invalidates pending sessions.
     */
    stop(incrementSession = true) {
        if (incrementSession) this.playSessionId++;
        if (this.currentSource) {
            try { this.currentSource.stop(); } catch (e) {}
            this.currentSource = null;
        }
    }

    isInitialized() { return this.initialized; }
    isLoading() { return this.loading; }
}

export const tts = new KokoroEngine();
