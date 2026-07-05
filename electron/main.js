import { app, BrowserWindow, ipcMain, dialog, Tray, Menu } from 'electron';
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
app.commandLine.appendSwitch('js-flags', '--max-wasm-memory=16384');
app.commandLine.appendSwitch('enable-webgpu-developer-features');

// Handling ESM directory names
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if we are in development mode
const isDev = !app.isPackaged;
const isWorkerMode = process.argv.includes('--worker');
const OMNIX_PORT = process.env.PORT || '9777';
let serverProcess = null;

let tray = null;
let mainWindow = null;
let isQuitting = false;

async function isPortActive() {
  try {
    const res = await fetch(`http://localhost:${OMNIX_PORT}/api/health`);
    return res.ok;
  } catch (e) {
    return false;
  }
}

function sendLogToWindow(text, type = 'info') {
  console.log(`[Omnix Main Log] ${type.toUpperCase()}: ${text}`);
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('server:log', { text, type });
  }
}

function startBackgroundServer() {
  if (isWorkerMode) return; // Background server shouldn't start its own background server
  if (serverProcess) {
    sendLogToWindow('Omnix Console: Server process already active.', 'info');
    return;
  }

  isPortActive().then((active) => {
    if (active) {
      sendLogToWindow(`Omnix Console: Backend API server is already running on port ${OMNIX_PORT}. Reusing active instance.`, "success");
      return;
    }
    
    const tsxCliPath = path.join(__dirname, '../node_modules/tsx/dist/cli.mjs');
    const serverTsPath = isDev 
      ? path.join(__dirname, '../server.ts')
      : path.join(process.resourcesPath, 'server.ts');
    const serverCjsPath = path.join(__dirname, '../dist/server.cjs');
    const cwd = isDev ? path.join(__dirname, '..') : process.resourcesPath;

    Promise.all([
      fs.stat(serverCjsPath).then(() => true).catch(() => false),
      fs.stat(serverTsPath).then(() => true).catch(() => false)
    ]).then(([cjsExists, tsExists]) => {
      sendLogToWindow(`Omnix Diagnostics: Compiled engine cached: ${cjsExists ? 'YES' : 'NO'}, Dynamic source: ${tsExists ? 'YES' : 'NO'}`, "info");

      const strategies = [];

      if (cjsExists) {
        strategies.push(
          {
            name: 'Electron Node (Compiled CJS)',
            serverPath: serverCjsPath,
            execPath: process.execPath,
            execArgv: [],
            env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' }
          },
          {
            name: 'System Node (Compiled CJS)',
            serverPath: serverCjsPath,
            execPath: 'node',
            execArgv: [],
            env: { ...process.env }
          }
        );
      }

      if (tsExists) {
        strategies.push(
          {
            name: 'System Node with tsx Loader (TS source)',
            serverPath: serverTsPath,
            execPath: 'node',
            execArgv: [tsxCliPath],
            env: { ...process.env }
          },
          {
            name: 'System Node with --import (TS source)',
            serverPath: serverTsPath,
            execPath: 'node',
            execArgv: ['--import', 'tsx'],
            env: { ...process.env }
          },
          {
            name: 'Electron Node with tsx CLI (TS source)',
            serverPath: serverTsPath,
            execPath: process.execPath,
            execArgv: [tsxCliPath],
            env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' }
          }
        );
      }

      let attempt = 0;

      function spawnWithRetry() {
        if (attempt >= strategies.length) {
          sendLogToWindow("Omnix Critical: All background server launch strategies failed. Standalone local-only mode active.", "error");
          serverProcess = null;
          return;
        }

        const strat = strategies[attempt];
        attempt++;

        sendLogToWindow(`Omnix Console: Launching server via [${strat.name}] (Attempt ${attempt}/${strategies.length})...`, "info");

        try {
          serverProcess = fork(strat.serverPath, ['--silent', '--dependent-pid', process.pid.toString()], {
            execPath: strat.execPath,
            execArgv: strat.execArgv,
            cwd,
            silent: true,
            env: { 
              ...strat.env,
              PORT: OMNIX_PORT,
              NODE_ENV: isDev ? 'development' : 'production'
            }
          });

          let spawnedSuccessfully = true;
          const processStartTime = Date.now();

          if (serverProcess.stdout) {
            serverProcess.stdout.on('data', (data) => {
              const text = data.toString().trim();
              if (text) {
                sendLogToWindow(text, 'info');
              }
            });
          }

          if (serverProcess.stderr) {
            serverProcess.stderr.on('data', (data) => {
              const text = data.toString().trim();
              if (text) {
                sendLogToWindow(`[Server Error] ${text}`, 'error');
              }
            });
          }

          serverProcess.on('message', (msg) => {
            if (msg && msg.type === 'SPAWN_WORKER') {
              sendLogToWindow('Omnix Console: Server requested a compute worker spawn.', 'info');
              createWorkerWindow();
            } else if (msg && msg.type === 'FOREGROUND_REQUEST') {
              sendLogToWindow('Omnix Console: Server requested foreground focus.', 'info');
              if (mainWindow) {
                mainWindow.show();
                mainWindow.restore();
                mainWindow.focus();
                app.focus({ steal: true });
              }
            }
          });

          serverProcess.on('error', (err) => {
            console.error(`Omnix: Strategy [${strat.name}] failed with error:`, err);
            spawnedSuccessfully = false;
            serverProcess = null;
            spawnWithRetry();
          });

          serverProcess.on('exit', (code, signal) => {
            const activeDuration = Date.now() - processStartTime;
            console.log(`Omnix: Process representing [${strat.name}] exited. Code: ${code}, Signal: ${signal}, Duration: ${activeDuration}ms`);
            
            serverProcess = null;

            // If it exited with non-zero code very quickly (less than 4 seconds), it likely failed startup tasks
            if (spawnedSuccessfully && code !== 0 && code !== null && activeDuration < 4000) {
              sendLogToWindow(`Omnix Warning: Strategy [${strat.name}] exited quickly (code: ${code}). Trying next option...`, "error");
              spawnWithRetry();
            } else {
              if (code === 0) {
                sendLogToWindow(`Omnix Console: Server process exited successfully (code 0).`, "info");
              } else if (activeDuration >= 4000) {
                sendLogToWindow(`Omnix Console: Server process stopped.`, "info");
              }
            }
          });

        } catch (err) {
          console.error(`Omnix: Exception launching [${strat.name}]:`, err);
          serverProcess = null;
          spawnWithRetry();
        }
      }

      spawnWithRetry();
    });
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

  const workerUrl = isDev ? `http://localhost:${OMNIX_PORT}?mode=worker` : `file://${path.join(__dirname, '../dist/index.html')}?mode=worker`;
  
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

  mainWindow = win;

  win.webContents.on('context-menu', (e, params) => {
    const menu = Menu.buildFromTemplate([
      { role: 'cut', label: 'Cut', enabled: params.editFlags.canCut },
      { role: 'copy', label: 'Copy', enabled: params.editFlags.canCopy },
      { role: 'paste', label: 'Paste', enabled: params.editFlags.canPaste },
      { type: 'separator' },
      { role: 'selectAll', label: 'Select All', enabled: params.editFlags.canSelectAll }
    ]);
    menu.popup({ window: win });
  });

  if (isDev) {
    win.loadURL(`http://localhost:${OMNIX_PORT}`);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Minimize to tray
  win.on('minimize', (event) => {
    event.preventDefault();
    win.hide();
  });

  // Minimize to tray when close button is clicked
  win.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      win.hide();
    }
  });

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

  ipcMain.on('server:getPortSync', (event) => {
    event.returnValue = OMNIX_PORT;
  });
}

app.whenReady().then(() => {
  registerIpcHandlers();
  
  if (isWorkerMode) {
    createWindow();
  } else {
    const win = createWindow();

    // Create system tray icon and context menu
    const iconPath = path.join(__dirname, 'icon.png');
    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show App',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.restore();
            mainWindow.focus();
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Exit',
        click: () => {
          isQuitting = true;
          app.quit();
        }
      }
    ]);

    tray.setToolTip('Omnix Local AI Studio');
    tray.setContextMenu(contextMenu);

    tray.on('double-click', () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.restore();
        mainWindow.focus();
      }
    });
    
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
          detail: `Launching the API server allows outside applications to address our REST/WebSocket APIs on Port ${OMNIX_PORT} to send processing requests.\n\nSelecting "Keep Standalone" runs all compute completely locally within this app window without opening any ports.`
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
    if (mainWindow) {
      mainWindow.show();
      mainWindow.restore();
      mainWindow.focus();
    } else if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});