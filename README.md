# Omnix Studio

Omnix is a local multi-modal AI studio that allows you to orchestrate vision, speech, and text models entirely on your machine. It also provides a robust local API for other applications to use Omnix as an inference engine.

## Features

- **Multi-Modal**: Support for Text, Vision, STT, TTS, Image Generation, and Music Generation.
- **Local First**: All models run locally using WebGPU or WASM.
- **Theme Support**: Polished Light and Dark modes.
- **Live Mode**: Real-time screen and voice analysis.
- **Sandbox**: Built-in environment for generating and running code.

---

## Local API Guide

Omnix provides a local API running on `http://localhost:7770/api`.

### Endpoints

#### 1. Text Generation (`POST /api/text`)
- **Body**: `{"prompt": "string", "systemPrompt": "string", "modelId": "string"}`
- **Response**: `{"response": "string"}`

#### 2. Vision Analysis (`POST /api/vision`)
- **Body**: `multipart/form-data`
  - `image`: File (Binary)
  - `prompt`: string (Optional)
  - `modelId`: string
- **Response**: `{"response": "string"}`

#### 3. Director Routing (`POST /api/director`)
- **Body**: `{"prompt": "string"}`
- **Response**: `{"intent": "string", "prompt": "string"}`

#### 4. Image Generation (`POST /api/image`)
- **Body**: `{"prompt": "string"}`
- **Response**: `{"status": "success", "image": "data:image/png;base64,..."}`

#### 5. Music Generation (`POST /api/music`)
- **Body**: `{"prompt": "string"}`
- **Response**: `{"status": "success", "audio": [...], "sampling_rate": number}`

#### 6. Speech-to-Text (`POST /api/stt`)
- **Body**: `multipart/form-data`
  - `audio`: File (WAV/MP3)
- **Response**: `{"text": "string"}`

#### 7. Text-to-Speech (`POST /api/tts`)
- **Body**: `{"text": "string", "modelId": "string"}`
- **Response**: `{"audio": [...], "sampling_rate": number}`

### Example Usage (CURL)
```bash
curl -X POST http://localhost:7770/api/text \
     -H "Content-Type: application/json" \
     -d '{"prompt": "Hello Omnix!"}'
```

---

## For Developers (Headless Mode)

Omnix can be used as a backend service for your own applications.

- **Silent Start**: `omnix --silent` (Starts the engine without opening any GUI window)
- **Process Attachment**: `omnix --dependent-pid <PID>` (Omnix will automatically shut down when the parent PID is no longer active)
- **Port Selection**: Use the `PORT` environment variable to override the default 7770 port.
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
- **Port Conflicts**: If port 7770 is occupied, the Brain API may fail to start. Ensure no other instances of Omnix are running on port 7770.

---

*Developed by Dustin Lee at LemOne Labs.*
