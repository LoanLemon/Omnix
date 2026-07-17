# Omnix Studio

Omnix is a local multi-modal AI studio that allows you to orchestrate vision, speech, and text models entirely on your machine. It also provides a robust local API for other applications to use Omnix as an inference engine.

## Features

- **Multi-Modal**: Support for Text, Vision, STT, TTS, Image Generation, and Music Generation.
- **Multi-Model Routing & Scheduling (MMRS)**: Advanced dual-Web-Worker engine allowing concurrent text generation and auxiliary operations (STT, TTS, Image Gen, Music Gen) simultaneously.
- **Dual Brain Inference Engine**: Run parallel text evaluations and speed chunking across twin dedicated linguistic Web Workers (`brain1` and `brain2`).
- **Local First**: All models run locally using WebGPU or WASM.
- **Theme Support**: Polished Light and Dark modes.
- **Live Mode**: Real-time screen and voice analysis.
- **Sandbox**: Built-in environment for generating and running code.

---

## Multi-Model Routing & Scheduling (MMRS) & Dual Brain

Omnix includes an advanced **Multi-Model Routing & Scheduling (MMRS)** and **Dual Brain** execution architecture designed to maximize local performance and prevent single-thread bottlenecks.

### Worker Architecture & Topology
- **Brain 1 & Brain 2 Workers (`brain1` / `brain2`)**: Paired linguistic workers dedicated to parallel text processing when **Dual Brain Mode** is enabled.
- **Text Worker (`text`)**: Fallback single-worker standard conversational chat, code generation, and text completions.
- **Operations Worker (`op`)**: Handles background auxiliary pipelines, such as:
  - Speech-to-Text (STT) via Whisper
  - Text-to-Speech (TTS) via Kokoro
  - Image Generation via Janus-Pro
  - Music Generation

### Dual Brain Operational Modes
When the **DUAL_BRAIN** toggle is enabled under the sidebar, text queries are processed using twin-engine acceleration:
1. **Speed Mode (`enhanced-speed`)**: Splices long text prompts or instructions into individual sentence-level chunks, processes them in parallel across `brain1` and `brain2` concurrently, and utilizes a coordination prompt to seamlessly synthesize the outputs back into a cohesive, high-speed response stream.
2. **Check Mode (`double-check`)**: Solves hallucination and logic faults by generating candidate answers from both brains in parallel for each sentence, initiating a real-time peer review between the two models, selecting the highest-fidelity logical candidate, and outputting the consensus response.

### Key Benefits
- **Zero-Block Multitasking**: Trigger heavy vocal synthesis (TTS) or generate images while continuing to chat and generate text uninterrupted.
- **Parallel Inference Throughput**: Substantially higher generation throughput and peer-verified precision.
- **Dynamic Resource Toggle**: Can be enabled or disabled instantly using the **MULTI_MODEL_MMRS** and **DUAL_BRAIN** control switches in the GUI sidebar.

---

## Omnix Developer Guide

Omnix provides a local API running on `http://localhost:9777/api`.

### Endpoints

#### 1. Text Generation (`POST /api/text`)
- **Body**:
  ```json
  {
    "prompt": "string (Required)",
    "systemPrompt": "string (Optional)",
    "isolatedRAG": "boolean (Optional - If true, ties isolated vector memory RAG lookup to the specific reqId)",
    "ocean": {
      "openness": "number (Optional, 0-100)",
      "conscientiousness": "number (Optional, 0-100)",
      "extraversion": "number (Optional, 0-100)",
      "agreeableness": "number (Optional, 0-100)",
      "neuroticism": "number (Optional, 0-100)"
    },
    "model": {
      "id": "string (Optional)",
      "qtype": "string (Optional) defaults to q4fp16",
      "temperature": "number (Optional)",
      "top_p": "number (Optional)",
      "top_k": "number (Optional)",
      "maxTokens": "number (Optional)"
    }
  }
  ```
  - **model.id**: Targets a specific loaded text model (e.g., `gemma-2-2b-instruct`). If absent, reuse current or default model.
  - **isolatedRAG**: Enables session-isolated RAG context search for this request, tying it to the specific reqId.
  - **ocean**: Allows setting specific Big Five OCEAN traits dynamically to shape character traits. Supports nested `"ocean": { ... }` or flat parameter key-values in the parent JSON structure.
  - **reqId**: Unique tracking key for task correlation, isolated conversation history logs, and streaming updates. Can also be supplied via URL query parameter `?reqId=...` or headers `x-req-id` / `reqid`.
- **Response**:
  ```json
  {
    "response": "string",
    "think": "string (Optional - populated if the model output contains a <think> block)"
  }
  ```

#### 2. Vision Analysis (`POST /api/vision`)
- **Body**: `multipart/form-data`
  - `image`: File (Binary - Required)
  - `prompt`: string (Optional)
  - `model`: JSON string of model object (Optional)
    - `id`: string (Optional)
    - `qtype`: string (Optional) defaults to q4fp16
    - `temperature`: number (Optional)
    - `top_p`: number (Optional)
    - `top_k`: number (Optional)
    - `maxTokens`: number (Optional)
  - `reqId`: string (Optional - can also be passed via URL query or headers)
- **Response**:
  ```json
  {
    "response": "string",
    "think": "string (Optional)"
  }
  ```

#### 3. Director Routing (`POST /api/director`)
- **Body**:
  ```json
  {
    "prompt": "string (Required)",
    "reqId": "string (Optional)"
  }
  ```
- **Response**:
  ```json
  {
    "intent": "string",
    "prompt": "string"
  }
  ```

#### 4. Image Generation (`POST /api/image`)
- **Body**:
  ```json
  {
    "prompt": "string (Required)",
    "model": {
      "id": "string (Optional)",
      "qtype": "string (Optional) defaults to q4fp16"
    },
    "reqId": "string (Optional)"
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "image": "data:image/png;base64,..."
  }
  ```

#### 5. Music Generation (`POST /api/music`)
- **Body**:
  ```json
  {
    "prompt": "string (Required)",
    "model": {
      "id": "string (Optional)",
      "qtype": "string (Optional) defaults to q4fp16",
      "maxTokens": "number (Optional)"
    },
    "reqId": "string (Optional)"
  }
  ```
- **Response**:
  ```json
  {
    "status": "success",
    "audio": [0.012, -0.005, ...],
    "sampling_rate": 32000
  }
  ```

#### 6. Speech-to-Text (`POST /api/stt`)
- **Body**: `multipart/form-data`
  - `audio`: File (Binary WAV/MP3 - Required)
  - `reqId`: string (Optional)
- **Response**:
  ```json
  {
    "text": "string"
  }
  ```

#### 7. Text-to-Speech (`POST /api/tts`)
- **Body**:
  ```json
  {
    "text": "string (Required)",
    "modelId": "string (Optional)",
    "format": "string (Optional, e.g., 'wav')",
    "reqId": "string (Optional)"
  }
  ```
- **Response**:
  ```json
  {
    "audio": [0.0, 0.05, ...],
    "sampling_rate": 24000,
    "wav_base64": "UklGRiQAAABXQVZFZm10IBAAAAABAAEA..."
  }
  ```

#### 8. Wait Voice (Microphone Speech-to-Text) (`GET/POST /api/waitVoice` or `/api/wait-voice`)
- Actively triggers the host microphone, listens for voice activity, detects natural pauses/silence, auto-stops recording, transcribes the local audio buffer with Whisper STT, and returns the transcribed text to the requester.
- **Body / Query**:
  ```json
  {
    "maxDuration": 10000, // Optional, max recording duration in ms (default: 10000)
    "silenceDuration": 1500, // Optional, silence duration in ms before auto-stop (default: 1500)
    "silenceThreshold": 0.005, // Optional, RMS voice activity amplitude silence threshold (default: 0.005)
    "reqId": "string" // Optional tracking key for logs & correlation
  }
  ```
- **Response**:
  ```json
  {
    "text": "Hello, this is my spoken response."
  }
  ```

#### 9. Inject Background Story / Lore (`POST /api/injectRAG`)
- **Body**:
  ```json
  {
    "isolatedRAG": "boolean (Required - Set to true to isolate to the specific reqId)",
    "text": "string (Required - Background lore, history, or knowledge context to inject)",
    "metadata": "object (Optional - Custom key-value meta objects)"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Successfully injected background story into isolated RAG.",
    "entry": {
      "id": "string",
      "text": "string",
      "embedding": [0.1, -0.05, ...],
      "timestamp": 1719777000
    }
  }
  ```

#### 10. Health Check (`GET /api/health`)
- **Response**:
  ```json
  {
    "status": "ok",
    "pid": 12345
  }
  ```

#### 11. Log Watcher Configuration (`GET/POST /api/log-watcher/config`)
- **GET /api/log-watcher/config**: Retrieve the list of active watch filepaths and enabled state.
  - **Response**:
    ```json
    {
      "filepaths": ["/path/to/log.txt"],
      "enabled": true
    }
    ```
- **POST /api/log-watcher/config**: Update the monitored queue of filepaths and active watcher daemon status.
  - **Body**:
    ```json
    {
      "filepaths": ["/path/to/log.txt"],
      "enabled": true
    }
    ```
  - **Response**:
    ```json
    {
      "success": true,
      "config": {
        "filepaths": ["/path/to/log.txt"],
        "enabled": true
      }
    }
    ```

#### 12. Log Watcher Log File Syntax & Processing Engine
The Log Watcher daemon actively monitors the configured filepaths for updates. When a file grows, it extracts the new contents and processes requests matching the following log block format:

##### Standard Log API Block Format
```text
# OmnixLogAPI:/api/[Endpoint]
Payload: { "your": "json", "params": true }
Passthru: {"state": 0, "targetModelId": 0}
Response: [log_filename]_omnixResponse.txt
```

- **Timestamp/Info Prefixes**: Lines in log files are often prefixed with timestamps or process info. The parser automatically strips standard prefixes (e.g., `13:29:25 [INFO] ["GTaiO01"] # OmnixLogAPI:/api/[Endpoint]`) to locate the endpoint and retrieve the clean payload block.
- **`Response:` Override**: If the `Response:` line is specified, Omnix writes the API response to the named file (resolved relative to the directory of the watched log file if it's a relative path). If omitted, it defaults to `[original_log_filepath]_omnixResponse.txt`.
- **Special JS/TS Variable Injection**: If the target response filepath ends with `.js` or `.ts` (e.g. `GameMod.js`), instead of overwriting the entire file, Omnix:
  1. Checks if the variable definition `let OmnixResponse = ...;` already exists in the file and replaces it, or prepends `let OmnixResponse = "your response string";` at the very top.
  2. Checks for a `Passthru:` line in the log block. If present, it will unescape and write/inject `let OmnixPassthru = "your passthru value";` in the exact same manner. This is perfect for retaining state parameters across headless invocations.
- **`RESET` Command**: You can log `# OmnixLogAPI:RESET` with a target JS/TS script defined by `Response: file.js`. The watcher will automatically intercept the reset call and set `OmnixResponse` to an empty string (`""`), clearing out previous cached state.

##### Example Log Blocks
```text
// Standard JSON query writing to log.txt_omnixResponse.txt
13:29:25 [INFO] ["GTaiO01"] # OmnixLogAPI:/api/text
Payload: { "prompt": "Identify the main character of Hamlet" }

// Script injection with state preservation (Passthru)
# OmnixLogAPI:/api/waitVoice
Payload: { "maxDuration": 8000 }
Passthru: {"state":3,"npcId":104}
Response: GameMod.js

// Resetting/clearing a mod script's response variable
# OmnixLogAPI:RESET
Response: GameMod.js
```

#### 13. Conversation History Management
- **Archive History (`POST /api/archive-history`)**:
  - **Body**: `{"oldReqId": "string", "newReqId": "string"}`
  - **Response**: `{"success": true, "message": "Archived oldReqId to newReqId"}`
- **Purge History (`POST /api/purge-history`)**:
  - **Body**: `{"reqId": "string"}`
  - **Response**: `{"success": true, "message": "Purged reqId: ..."}`

### Example Usage (CURL)
```bash
curl -X POST http://localhost:9777/api/text \
     -H "Content-Type: application/json" \
     -d '{
           "prompt": "Hello Omnix!",
           "model": {
             "temperature": 0.7
           }
         }'
```

---

## For Developers (Headless Mode & Silent Launch)

Omnix can be used as a fully silent, headless backend service or an in-game inference engine for other applications.

### 1. Native Desktop Headless Mode (`--worker` CLI flag)
For native/desktop distributions, you can launch the Omnix process silently with zero user interaction:
- **Headless Worker Launch**: `omnix --worker`
  - Runs in a fully hidden, offscreen background context.
  - Automatically bypasses the visual prompt asking *"Do you want to launch the API server?"* and boots the server immediately.
  - Spawns only a hidden, lightweight BrowserWindow to leverage full local GPU hardware-accelerated WebGPU/WebGL model inference.
- **Process Attachment**: `omnix --dependent-pid <PID>`
  - Omnix automatically monitors the specified parent process PID and gracefully shuts down when that parent process terminates. Perfect for bundling Omnix inside games or companion applications.
- **Silent CLI Flag**: `omnix --silent` (Bypasses window focus prompts)
- **Port Selection**: Use the `PORT` environment variable to override the default 9777 port.
- **Singleton Check**: Starting a second instance of Omnix on the same port will print the PID of the existing instance to `stdout` and terminate immediately.

### 2. Browser / Webview Headless Mode (`?mode=worker` query parameter)
If you are embedding Omnix inside a standard browser context, custom webview, or frame:
- **Web Worker URL**: Append `?mode=worker` (e.g. `http://localhost:9777/?mode=worker`) to the address.
- **Behavior**: The page deactivates the heavy visual React DOM renderer and presents a single static black backdrop, maximizing the browser's thread priority and WebGPU acceleration for raw background API inference.

### 3. Network Security & Global IP Access (Disabled by Default)
For maximum local system safety, the local API server binds exclusively to **Localhost only (`127.0.0.1`) by default**. This blocks random network devices or WAN/Global IP requests from accessing your local WebGPU hardware/APIs.

To allow connection via your **Global IP or Local LAN IP**:
- **Option A (GUI Toggle)**: Open settings in the Sidebar and toggle **GLOBAL_API** to `ON`. This persists the setting immediately. Restart the API server or app to bind to `0.0.0.0`.
- **Option B (CLI Flags)**: Launch the app or server with `--allow-remote` or `--global`.
- **Option C (Environment Variables)**: Run the process with the environment variable `ALLOW_REMOTE=true` or `OMNIX_GLOBAL_ACCESS=true`.
- **Option D (Config File)**: Create or edit an `omnix-config.json` file in your root folder with:
  ```json
  {
    "allowRemote": true
  }
  ```

#### 🌐 Troubleshooting Global/WAN Connections
Even with `GLOBAL_API` enabled (binding to `0.0.0.0`), incoming connections from the public Internet (using your Global IP) will be blocked by standard network security barriers. If you see connection errors like `Unable to connect to the remote server`:

1. **Router Port Forwarding**: Your router acts as a NAT firewall. It does not know which device on your home/office network is running Omnix. You must log into your router's administration panel and forward incoming TCP traffic on port `9777` to the **Local LAN IP** of the machine running Omnix (e.g., `192.168.1.15`).
2. **OS/System Firewall Rules**: Windows Defender or macOS/Linux Firewalls block incoming traffic on non-standard ports by default. You must create an **Inbound Rule** to allow TCP traffic on port `9777`.
3. **ISP Constraints & CGNAT**: Many residential Internet Service Providers place customers behind a Carrier-Grade NAT (CGNAT), where multiple households share a single public IP. In this setup, traditional port forwarding will not work.
4. **Secure Alternatives (Tunneling)**: Instead of exposing your machine directly to the public web, it is highly recommended to use secure tunneling services:
   - **ngrok**: Run `ngrok http 9777` to create a secure public URL forwarding to your local Omnix server.
   - **Tailscale / ZeroTier**: Create a private virtual mesh network between your devices so they can communicate securely as if they were on the same local network, without exposing ports to the public Internet.

---

### 🎙️ Text-to-Speech (TTS) API Format & Saving Audio
The TTS API (`/api/tts`) outputs high-quality raw audio samples (`Float32Array`) at a sample rate of `24000 Hz`.

To make saving audio files seamless, we support two output formats:

#### Method A: Direct WAV File Download (Recommended)
You can request the API to package the audio samples into a standard **16-bit PCM WAV file** by adding `"format": "wav"` to your JSON payload or appending `?format=wav` to your URI. This can be saved directly using PowerShell:

```powershell
# Call TTS API requesting a WAV file and save it directly to output.wav
Invoke-RestMethod -Uri "http://localhost:9777/api/tts" -Method Post `
  -ContentType "application/json" `
  -Body '{"text": "Hello world from Omnix TTS!", "format": "wav"}' `
  -OutFile "output.wav"
```

#### Method B: Raw JSON PCM Samples
By default, the endpoint returns raw floats and sample rate:
```json
{
  "audio": [-0.00012, 0.00034, ...],
  "sampling_rate": 24000
}
```
If you need to process these samples manually, you can use standard browser Web Audio APIs (like `AudioContext.createBuffer()`) or convert them using a custom processing script.

---

## Electron Setup Guide

The desktop version of Omnix provides unrestricted RAM access, WebGPU acceleration, and native filesystem integration.
### Precompiled


### Prerequisites
- **Node.js**: v18 or higher recommended.
- **NPM**: Standard package manager.

## Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/LoanLemon/Omnix
   cd omnix
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

## Running the Application

### Development Mode
To run the app in development mode with hot-reloading:

1. **Start the Omnix Orchestrator**:
   ```bash
   npm run dev
   ```

2. **Run as Desktop App (Alternative)**:
   ```bash
   npm run desktop
   ```

### Production Build
To build the application for production:

1. **Build the web frontend**:
   ```bash
   npm run build
   ```

### Desktop Features
- **Unrestricted RAM**: Up to 16GB of heap memory for large models.
- **WebGPU Acceleration**: Hardware acceleration enabled by default.
- **Minimize to Tray**: Moves to system tray on close/minimize.
- **Local Filesystem**: Direct interaction with local files.

### Troubleshooting
- **WebGPU Errors**: Ensure your graphics drivers are up to date. Some older GPUs may not support WebGPU.
- **Port Conflicts**: If port 9777 is occupied, the Brain API may fail to start. Ensure no other instances of Omnix are running on port 9777.

---

*Developed by Dustin Lee at LemOne Labs.*
