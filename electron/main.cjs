const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;

// Set up dynamic Database URL for local offline SQLite
const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'database.db');
process.env.DATABASE_URL = `file:${dbPath}`;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  // Security: Prevent creating new windows
  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });

  // Security: Prevent navigation to external sites
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    // Allow local navigations
    if (parsedUrl.origin !== 'http://localhost:3000' && !navigationUrl.startsWith('file://')) {
      event.preventDefault();
    }
  });

  // Security: Restrict Hardware Permissions (Camera, Mic, Clipboard, etc.)
  const { session } = require('electron');
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    console.warn(`[Security] Blocked permission request: ${permission}`);
    callback(false); // Deny all permissions by default
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    // In development, wait a second for the Vite dev server to start
    setTimeout(() => {
      mainWindow.loadURL('http://localhost:3000');
    }, 2000);
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built React files
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

function startBackend() {
  const isDev = !app.isPackaged;
  
  if (isDev) {
    console.log('Starting backend in development mode...');
    backendProcess = spawn('npm.cmd', ['run', 'dev:backend'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      shell: false
    });
  } else {
    console.log('Starting backend in production mode...');
    // In production, we assume the backend is compiled to a JS file
    // Note: this will need adjustment depending on how we package Prisma and the backend
    backendProcess = spawn(process.execPath, [path.join(__dirname, '../backend/dist/server.js')], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      shell: false
    });
  }

  backendProcess.on('error', (err) => {
    console.error('Failed to start backend process.', err);
  });
}

app.whenReady().then(() => {
  startBackend();
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // Setup auto-updater
  const { autoUpdater } = require('electron-updater');
  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on('update-available', () => {
    if (mainWindow) mainWindow.webContents.send('update-available');
  });

  autoUpdater.on('download-progress', (progressObj) => {
    if (mainWindow) mainWindow.webContents.send('download-progress', progressObj.percent);
  });

  autoUpdater.on('update-downloaded', () => {
    if (mainWindow) mainWindow.webContents.send('update-downloaded');
  });

  const { ipcMain } = require('electron');
  ipcMain.on('install-update', () => {
    autoUpdater.quitAndInstall();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    if (backendProcess) {
      backendProcess.kill();
    }
    app.quit();
    
  }
});

