const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false
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
    backendProcess = spawn('npm', ['run', 'dev:backend'], {
      cwd: path.join(__dirname, '..'),
      shell: true,
      stdio: 'inherit'
    });
  } else {
    console.log('Starting backend in production mode...');
    // In production, we assume the backend is compiled to a JS file
    // Note: this will need adjustment depending on how we package Prisma and the backend
    backendProcess = spawn('node', [path.join(__dirname, '../backend/dist/server.js')], {
      cwd: path.join(__dirname, '..'),
      shell: true,
      stdio: 'inherit'
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
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    if (backendProcess) {
      backendProcess.kill();
    }
    app.quit();
    
  }
});

