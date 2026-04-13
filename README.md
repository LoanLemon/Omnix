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

Omnix provides a local API running on `http://localhost:3000/api`.

### Endpoints

#### 1. Text Generation (`POST /api/text`)
- **Body**: `{"prompt": "string", "systemPrompt": "string"}`
- **Response**: `{"response": "string"}`

#### 2. Vision Analysis (`POST /api/vision`)
- **Body**: `multipart/form-data`
  - `image`: File (Binary)
  - `prompt`: string (Optional)
- **Response**: `{"caption": "string", "response": "string"}`

#### 3. Director Routing (`POST /api/director`)
- **Body**: `{"prompt": "string"}`
- **Response**: `{"intent": "string", "prompt": "string"}`

#### 4. Image Generation (`POST /api/image`)
- **Body**: `{"prompt": "string"}`
- **Response**: `{"status": "success", "url": "string"}`

#### 5. Music Generation (`POST /api/music`)
- **Body**: `{"prompt": "string"}`
- **Response**: `{"status": "success", "audioUrl": "string"}`

#### 6. Speech-to-Text (`POST /api/stt`)
- **Body**: `multipart/form-data`
  - `audio`: File (WAV/MP3)
- **Response**: `{"text": "string"}`

#### 7. Text-to-Speech (`POST /api/tts`)
- **Body**: `{"text": "string", "voice": "string"}`
- **Response**: `{"status": "success", "audioUrl": "string"}`

### Example Usage (CURL)
```bash
curl -X POST http://localhost:3000/api/text \
     -H "Content-Type: application/json" \
     -d '{"prompt": "Hello Omnix!"}'
```

---

## Electron Setup Guide

The desktop version of Omnix provides unrestricted RAM access, WebGPU acceleration, and native filesystem integration.

### Prerequisites
- **Node.js**: v18 or higher recommended.
- **NPM**: Standard package manager.

### Installation
1. **Clone the repository**:
   ```bash
   git clone https://github.com/LoanLemon/Omnix
   cd omnix
   ```
2. **Install dependencies**:
   ```bash
   npm install
   npm install concurrently wait-on --save-dev
   ```

### Running the Application

#### Development Mode
1. **Start the Vite development server**:
   ```bash
   npm run dev
   ```
2. **In a separate terminal, launch Electron**:
   ```bash
   npm run electron:dev
   ```

#### Production Build
1. **Build the frontend**:
   ```bash
   npm run build
   ```
2. **Run Electron**:
   ```bash
   npx electron .
   ```

### Desktop Features
- **Unrestricted RAM**: Up to 16GB of heap memory for large models.
- **WebGPU Acceleration**: Hardware acceleration enabled by default.
- **Minimize to Tray**: Moves to system tray on close/minimize.
- **Local Filesystem**: Direct interaction with local files.

### Troubleshooting
- **WebGPU Errors**: Ensure your graphics drivers are up to date. Some older GPUs may not support WebGPU.
- **Port Conflicts**: If port 3000 is occupied, the Electron app may fail to connect in dev mode.

---

*Developed by Dustin Lee at LemOne Labs.*
