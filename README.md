# Omnix Studio

Omnix is a local multi-modal AI studio that allows you to orchestrate vision, speech, and text models entirely on your machine. It provides a robust local API and a powerful Command Line Interface (CLI) to use Omnix as a high-performance inference engine for local workflows.

## Features

- **Multi-Modal Engine**: Support for Text, Vision, STT, TTS, Image Generation, and Music Generation.
- **Local First**: All models run locally using WebGPU or WASM. No data leaves your machine.
- **Orchestration**: Intelligent routing via the "Director" mode to handle complex requests.
- **Live Mode**: Real-time screen and voice analysis for interactive AI assistance.
- **Sandbox Environment**: Built-in environment for generating, executing, and visualizing code output.
- **Unified CLI**: Execute complex AI tasks directly from your terminal.
- **Theme Support**: Polished Light and Dark modes with a modern UI.

---

## Command Line Interface (CLI)

Omnix includes a built-in CLI for one-shot AI interactions. Once built or running, you can use the CLI to prompt the local engine.

### Usage

```bash
# Using npm script
npm run cli -- -prompt "Analyze the sentiment of this text" -mode director

# Using the precompiled binary (after build)
./omnix.exe --cli -prompt "Write a story about a brave cat" -mode chat
```

### Options
- `-p, --prompt <string>`: **(Required)** The prompt to send to the AI.
- `-m, --mode <string>`: Operational mode. Options: `director` (default), `chat`, `text`, `vision`, `image`, `music`, `stt`, `tts`.

---

## Local API Guide

Omnix provides a local REST API running on `http://localhost:3000/api`. This allows you to integrate Omnix into your own custom scripts and applications.

### Endpoints

#### 1. Director Routing (`POST /api/director`)
*The recommended entry point for general queries. It automatically routes the request to the best model.*
- **Body**: `{"prompt": "string"}`
- **Response**: `{"intent": "string", "prompt": "string", "response": "string"}`

#### 2. Text Generation (`POST /api/text`)
- **Body**: `{"prompt": "string", "systemPrompt": "string"}`
- **Response**: `{"response": "string"}`

#### 3. Vision Analysis (`POST /api/vision`)
- **Body**: `multipart/form-data`
  - `image`: File (Binary)
  - `prompt`: string (Optional)
- **Response**: `{"caption": "string", "response": "string"}`

#### 4. Image Generation (`POST /api/image`)
- **Body**: `{"prompt": "string"}`
- **Response**: `{"status": "success", "url": "string"}`

#### 5. Speech-to-Text (`POST /api/stt`)
- **Body**: `multipart/form-data`
  - `audio`: File (WAV/MP3)
- **Response**: `{"text": "string"}`

---

## Setup & Installation

### Prerequisites
- **Node.js**: v18 or higher.
- **NPM**: Standard package manager.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/LoanLemon/Omnix
   cd Omnix
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

## Running the Application

### Development (Browser/API)
Starts the local inference server and the UI:
```bash
npm run dev
```

### Desktop Version (Electron)
Launches the full desktop application with WebGPU acceleration:
```bash
npm run desktop
```

### Building for Production
To package the application for portable use:
```bash
npm run build
```
The output will be available in the `dist` and `dist-electron` directories.

---

## Desktop Features
- **Unrestricted RAM**: Local models can access up to 16GB of system memory for larger parameters.
- **WebGPU Acceleration**: Direct hardware access for blazing fast inference.
- **Native Filesystem**: Securely interact with local files and directories via the Sandbox.
- **Minimize to Tray**: Runs silently in the background for quick access.

### Troubleshooting
- **WebGPU Errors**: Ensure your graphics drivers support WebGPU. If not, the engine will fallback to WASM (slower).
- **Port Conflicts**: Port 3000 is required for the local API. Ensure it's not being used by other services.

---

*Developed by Dustin Lee at LemOne Labs.*  
*Contact: loan.lemone@gmail.com*

