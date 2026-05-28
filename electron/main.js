import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { fork } from 'child_process';

// Handling ESM directory names
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if we are in development mode
const isDev = !app.isPackaged;
const isWorkerMode = process.argv.includes('--worker');
let serverProcess = null;

function startBackgroundServer() {
  if (isWorkerMode) return; // Background server shouldn't start its own background server

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
  });
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
      offscreen: true // Use offscreen rendering for headless compute
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
    return;
  }

  const win = new BrowserWindow({
    width: 1300,
    height: 900,
    title: "Omnix Local AI Studio",
    backgroundColor: '#000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  startBackgroundServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});