import os from 'os';
import { app, BrowserWindow, Tray, Menu, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import isDev from 'electron-is-dev';
import fs from 'fs/promises';

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
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      // Enable WebGPU
      enableBlinkFeatures: 'WebGPU',
    },
    backgroundColor: '#080808',
    show: false,
  });

  const startURL = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  mainWindow.loadURL(startURL);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('minimize', (event) => {
    event.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
}

function createTray() {
  const iconPath = path.join(__dirname, 'icon.png');
  tray = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show App', click: () => mainWindow.show() },
    { label: 'Quit', click: () => {
      app.isQuitting = true;
      app.quit();
    }}
  ]);

  tray.setToolTip('Omnix');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
}

// Unrestricted RAM flags
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=16384');
app.commandLine.appendSwitch('enable-unsafe-webgpu');

app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
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