import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { fork } from 'child_process';
import fs from 'fs/promises';
import os from 'os';

// Configure Chromium switches for forcing High Performance discrete GPU and advanced WebGPU features
app.commandLine.appendSwitch('force-high-performance-gpu');
app.commandLine.appendSwitch('force_high_performance_gpu');
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-unsafe-webgpu');
app.commandLine.appendSwitch('enable-dawn-features', 'allow_unsafe_apis');
app.commandLine.appendSwitch('enable-features', 'WebGPUService,WebAssemblySimd,WebAssemblyThreads');

// Handling ESM directory names
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if we are in development mode
const isDev = !app.isPackaged;
const isWorkerMode = process.argv.includes('--worker');
let serverProcess = null;

function startBackgroundServer() {
  if (isWorkerMode) return; // Background server shouldn't start its own background server
  if (serverProcess) {
    console.log('Omnix: Server process already active.');
    return;
  }

  const serverPath = isDev 
    ? path.join(__dirname, '../server.ts')
    : path.join(process.resourcesPath, 'server.ts');
  
  const tsxPath = path.join(__dirname, '../node_modules/tsx/dist/cli.mjs');

  serverProcess = fork(serverPath, ['--silent', '--dependent-pid', process.pid.toString()], {
    execPath: 'node',
    execArgv: [tsxPath],
    env: { ...process.env, NODE_ENV: isDev ? 'development' : 'production' }
  });

  serverProcess.on('message', (msg) => {
    if (msg.type === 'SPAWN_WORKER') {
      console.log('Omnix: Server requested a compute worker spawn.');
      createWorkerWindow();
    }
  });

  serverProcess.on('error', (err) => {
    console.error('Failed to start server:', err);
    serverProcess = null;
  });

  serverProcess.on('exit', () => {
    console.log('Omnix: Server process exited.');
    serverProcess = null;
  });
}

function stopBackgroundServer() {
  if (serverProcess) {
    try {
      serverProcess.kill();
    } catch (e) {
      console.error('Omnix: Error trying to kill server process:', e);
    }
    serverProcess = null;
    console.log('Omnix: Server process stopped.');
  }
}

let workerWindowsCount = 0;
const MAX_WORKERS = 2;

function createWorkerWindow() {
  if (workerWindowsCount >= MAX_WORKERS) {
    console.log('Omnix: Max workers reached. Skipping spawn.');
    return;
  }

  const workerWin = new BrowserWindow({
    show: false, // HEADLESS
    width: 200,
    height: 200,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      offscreen: false, // Don't use offscreen rendering, as it impairs hardware-accelerated WebGPU/WebGL. show: false is sufficient for headless compute.
      preload: path.join(__dirname, 'preload.cjs')
    },
  });

  const workerUrl = isDev ? 'http://localhost:3000?mode=worker' : `file://${path.join(__dirname, '../dist/index.html')}?mode=worker`;
  
  if (isDev) {
    workerWin.loadURL(workerUrl);
  } else {
    workerWin.loadURL(workerUrl);
  }

  workerWindowsCount++;

  workerWin.on('closed', () => {
    workerWindowsCount--;
  });

  workerWin.webContents.on('did-finish-load', () => {
    console.log(`Omnix: Headless Compute Worker Ready. [Workers: ${workerWindowsCount}]`);
  });
}

function createWindow() {
  if (isWorkerMode) {
    createWorkerWindow();
    return null;
  }

  const win = new BrowserWindow({
    width: 1300,
    height: 900,
    title: "Omnix Local AI Studio",
    backgroundColor: '#000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  return win;
}

function registerIpcHandlers() {
  ipcMain.handle('os:getMemoryStats', async () => {
    const totalGB = Math.round(os.totalmem() / (1024 * 1024 * 1024));
    return { totalGB };
  });

  ipcMain.handle('fs:readDir', async (event, dirPath) => {
    try {
      return await fs.readdir(dirPath);
    } catch (err) {
      console.error(`Error in fs:readDir on path ${dirPath}:`, err);
      throw err;
    }
  });

  ipcMain.handle('fs:readFile', async (event, filePath) => {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (err) {
      console.error(`Error in fs:readFile on path ${filePath}:`, err);
      throw err;
    }
  });

  ipcMain.handle('fs:writeFile', async (event, filePath, content) => {
    try {
      await fs.writeFile(filePath, content, 'utf-8');
      return true;
    } catch (err) {
      console.error(`Error in fs:writeFile on path ${filePath}:`, err);
      throw err;
    }
  });

  ipcMain.handle('dialog:openFile', async () => {
    try {
      const result = await dialog.showOpenDialog({
        properties: ['openFile']
      });
      if (result.canceled || result.filePaths.length === 0) {
        return null;
      }
      return result.filePaths[0];
    } catch (err) {
      console.error('Error in dialog:openFile:', err);
      throw err;
    }
  });

  ipcMain.handle('server:start', async () => {
    try {
      startBackgroundServer();
      return true;
    } catch (err) {
      console.error('Failed to start server via IPC:', err);
      return false;
    }
  });

  ipcMain.handle('server:stop', async () => {
    try {
      stopBackgroundServer();
      return true;
    } catch (err) {
      console.error('Failed to stop server via IPC:', err);
      return false;
    }
  });

  ipcMain.handle('server:isStarted', async () => {
    return serverProcess !== null;
  });
}

app.whenReady().then(() => {
  registerIpcHandlers();
  
  if (isWorkerMode) {
    createWindow();
  } else {
    const win = createWindow();
    
    // Show prompt after a short delay so the window has finished loading and is displayed
    setTimeout(async () => {
      try {
        const { response } = await dialog.showMessageBox(win, {
          type: 'question',
          buttons: ['Launch API Server', 'Keep Standalone (Local Only)'],
          defaultId: 1, // Safe default
          cancelId: 1,
          title: 'Omnix API Server',
          message: 'Do you want to launch the API server for this app?',
          detail: 'Launching the API server allows outside applications to address our REST/WebSocket APIs on Port 3000 to send processing requests.\n\nSelecting "Keep Standalone" runs all compute completely locally within this app window without opening any ports.'
        });

        if (response === 0) {
          console.log('Omnix: User chose to start the background API server.');
          startBackgroundServer();
        } else {
          console.log('Omnix: User selected Standalone local-only operation.');
        }
      } catch (err) {
        console.error('Error in API server selection dialog:', err);
      }
    }, 1200);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});