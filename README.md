# Omnix Studio

Omnix is a local multi-modal AI studio that allows you to orchestrate vision, speech, and text models entirely on your machine. It also provides a robust local API for other applications to use Omnix as an inference engine.

## Features

- **Multi-Modal**: Support for Text, Vision, STT, TTS, Image Generation, and Music Generation.
- **Multi-Model Routing & Scheduling (MMRS)**: Advanced dual-Web-Worker engine allowing concurrent text generation and auxiliary operations (STT, TTS, Image Gen, Music Gen) simultaneously.
- **Local First**: All models run locally using WebGPU or WASM.
- **Theme Support**: Polished Light and Dark modes.
- **Live Mode**: Real-time screen and voice analysis.
- **Sandbox**: Built-in environment for generating and running code.

---

## Multi-Model Routing & Scheduling (MMRS)

Omnix includes an advanced **Multi-Model Routing & Scheduling (MMRS)** engine designed to prevent single-thread execution bottlenecks.

### Dual Web-Worker Architecture
- **Text Worker (`text`)**: Processes standard conversational chat, code generation, and complex text completions.
- **Operations Worker (`op`)**: Handles background auxiliary pipelines, such as:
  - Speech-to-Text (STT) via Whisper
  - Text-to-Speech (TTS) via Kokoro
  - Image Generation via Janus-Pro
  - Music Generation

### Key Benefits
- **Zero-Block Multitasking**: Users can trigger voice synthesis (TTS) or generate images while continuing to chat and generate text uninterrupted.
- **Independent Context Isolation**: Prevents heavy model switches from blocking the text reasoning pipeline.
- **Dynamic Resource Toggle**: Can be enabled or disabled instantly using the **MULTI_MODEL_MMRS** control switch in the GUI sidebar.

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
    "reqId": "string (Optional)"
  }
  ```
- **Response**:
  ```json
  {
    "audio": [0.0, 0.05, ...],
    "sampling_rate": 24000
  }
  ```

#### 8. Health Check (`GET /api/health`)
- **Response**:
  ```json
  {
    "status": "ok",
    "pid": 12345
  }
  ```

#### 9. Conversation History Management
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

## For Developers (Headless Mode)

Omnix can be used as a backend service for your own applications.

- **Silent Start**: `omnix --silent` (Starts the engine without opening any GUI window)
- **Process Attachment**: `omnix --dependent-pid <PID>` (Omnix will automatically shut down when the parent PID is no longer active)
- **Port Selection**: Use the `PORT` environment variable to override the default 9777 port.
- **Singleton Pattern**: Starting a second instance of Omnix on the same port will return the PID of the existing process to `stdout` and exit immediately.

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
