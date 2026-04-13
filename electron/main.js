import os from 'os';
import { app, BrowserWindow, Tray, Menu, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import isDev from 'electron-is-dev';
import fs from 'fs/promises';
import { fork } from 'child_process';

let serverProcess;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let tray;

// --- SECURITY: Define Workspace Boundary ---
const WORKSPACE_DIR = path.join(app.getPath('documents'), 'OmnixWorkspace');

// Ensure workspace exists
fs.mkdir(WORKSPACE_DIR, { recursive: true }).catch(console.error);

// Utility to safely resolve and validate paths
function getSafePath(requestedPath) {
  const resolvedPath = path.resolve(WORKSPACE_DIR, requestedPath);
  if (!resolvedPath.startsWith(WORKSPACE_DIR)) {
    throw new Error('Security Error: Path traversal attempt blocked.');
  }
  return resolvedPath;
}
// -------------------------------------------

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200, height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'), 
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
    backgroundColor: '#080808',
    show: false,
  });

  const startURL = isDev 
    ? 'http://127.0.0.1:3000' 
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  mainWindow.loadURL(startURL);

  mainWindow.webContents.on('did-finish-load', () => {
     mainWindow.show();
     if (isDev) mainWindow.webContents.openDevTools();
  });

  // --- PERSISTENCE LOGIC ---
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault(); // Stop the app from quitting
      mainWindow.hide();      // Just hide the window
    }
    return false;
  });
}

function createTray() {
  // NOTE: Ensure icon.png exists in the electron/ folder or this will error
  const iconPath = path.join(__dirname, 'icon.png'); 
  tray = new Tray(iconPath);
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show Omnix Studio', click: () => mainWindow.show() },
    { type: 'separator' },
    { label: 'Quit Omnix (Stop API)', click: () => {
      app.isQuitting = true; // Set flag so the 'close' event allows it
      app.quit();
    }}
  ]);

  tray.setToolTip('Omnix AI Studio');
  tray.setContextMenu(contextMenu);
  tray.on('click', () => mainWindow.show());
}

// In main.js

function startInternalServer() {
  const serverPath = path.join(__dirname, '../server.js');
  
  // Use tsx to run the .ts file in development
  // In production, you would typically bundle this to .js
  serverProcess = fork(serverPath, [], {
    execArgv: isDev ? ['--import', 'tsx'] : []
  });
  
  serverProcess.on('message', async (request) => {
    if (request.type === 'api-inference-request') {
      mainWindow.webContents.send('execute-inference', request.data);
    }
  });
}

ipcMain.on('inference-result', (event, { requestId, response }) => {
  serverProcess.send({ type: 'api-inference-response', requestId, response });
});

// Unrestricted RAM flags
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=16384');
app.commandLine.appendSwitch('enable-unsafe-webgpu');

app.whenReady().then(async () => {
  // Ensure the workspace is ready BEFORE the window opens
  await fs.mkdir(WORKSPACE_DIR, { recursive: true }).catch(console.error);
  startInternalServer();
  createWindow();
  createTray(); // <--- You were missing this call
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('before-quit', () => {
  if (serverProcess) serverProcess.kill(); // Clean up when the user actually QUITS
});

app.on('window-all-closed', () => {
	
});

ipcMain.handle('os:getMemoryStats', () => {
  const total = os.totalmem();
  const free = os.freemem();
  const used = total - free;
  
  return {
    totalMB: Math.round(total / 1024 / 1024),
    usedMB: Math.round(used / 1024 / 1024),
    totalGB: Math.round(total / 1024 / 1024 / 1024) 
  };
});
// --- SECURE Filesystem API Handlers ---
ipcMain.handle('fs:readDir', async (event, dirPath) => {
  try {
    const safePath = getSafePath(dirPath || './');
    const files = await fs.readdir(safePath, { withFileTypes: true });
    return files.map(f => ({ name: f.name, isDirectory: f.isDirectory() }));
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('fs:readFile', async (event, filePath) => {
  try {
    const safePath = getSafePath(filePath);
    return await fs.readFile(safePath, 'utf-8');
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('fs:writeFile', async (event, filePath, content) => {
  try {
    const safePath = getSafePath(filePath);
    await fs.writeFile(safePath, content, 'utf-8');
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('dialog:openFile', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections']
  });
  return result;
});