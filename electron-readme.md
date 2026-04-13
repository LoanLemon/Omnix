# Omnix Studio - Electron Setup Guide

This guide will help you set up and run the desktop version of Omnix using Electron. The Electron version provides unrestricted RAM access, WebGPU acceleration, and native filesystem integration.

## Prerequisites

- **Node.js**: Ensure you have Node.js installed (v18 or higher recommended).
- **NPM**: Standard package manager included with Node.js.

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

1. **Start the Vite development server**:
   ```bash
   npm run start
   ```

### Production Build
To package the application for production:

1. **Build the app**:
   ```bash
   # Note: You may need to install electron-builder or electron-packager for full distribution
   npm run electron:build
   ```

## Desktop Features

- **Unrestricted RAM**: The desktop app is configured to allow up to 16GB of heap memory for large local models.
- **WebGPU Acceleration**: Hardware acceleration is enabled by default for high-speed AI inference.
- **Minimize to Tray**: Closing or minimizing the window will move the app to your system tray. Right-click the tray icon to quit or restore.
- **Local Filesystem**: Use the "Electron Filesystem" section in the sidebar to interact with your local files directly.

## Troubleshooting

- **WebGPU Errors**: Ensure your graphics drivers are up to date. Some older GPUs may not support WebGPU.
- **Port Conflicts**: If port 3000 is occupied, the Electron app may fail to connect in dev mode. Ensure no other services are running on port 3000.
- **Tray Icon**: If the tray icon doesn't appear, ensure you have placed a valid `icon.png` in the `electron/` directory.

---
*Developed by Dustin Lee at LemOne Labs.*
