import { app, BrowserWindow, Tray, Menu, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import isDev from 'electron-is-dev';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let tray;

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
  const iconPath = path.join(__dirname, 'icon.png'); // Placeholder, you should add a real icon
  tray = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show App', click: () => mainWindow.show() },
    { label: 'Quit', click: () => {
      app.isQuitting = true;
      app.quit();
    }}
  ]);

  tray.setToolTip('OmniTrader Studio');
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
  // createTray(); // Requires an icon file to work properly, commenting out for now to avoid crash if icon missing
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Filesystem API Handlers
ipcMain.handle('fs:readDir', async (event, dirPath) => {
  try {
    const files = await fs.readdir(dirPath, { withFileTypes: true });
    return files.map(f => ({ name: f.name, isDirectory: f.isDirectory() }));
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('fs:readFile', async (event, filePath) => {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('fs:writeFile', async (event, filePath, content) => {
  try {
    await fs.writeFile(filePath, content, 'utf-8');
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
