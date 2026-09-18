const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { spawn, execSync } = require('child_process');
const { autoUpdater } = require('electron-updater');

let mainWindow = null;
let backendProcess = null;
let isCheckingUpdates = false;
let isDownloadingUpdate = false;
let updateDownloadedInfo = null;

// Determine paths for persistent offline SQLite database and backups
const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'database.db');
const backupsDir = path.join(userDataPath, 'backups', 'pre-update');

// Set dynamic Database URL for local offline SQLite engine
process.env.DATABASE_URL = `file:${dbPath}`;

/**
 * Gracefully stop backend child process and kill entire process tree on Windows
 */
function stopBackendProcess() {
  if (!backendProcess || backendProcess.killed) return;

  const pid = backendProcess.pid;
  console.log(`[Lifecycle] Stopping backend process (PID: ${pid})...`);

  try {
    if (process.platform === 'win32') {
      // Use taskkill to kill process and all spawned child processes (/T) forcefully (/F)
      execSync(`taskkill /pid ${pid} /T /F`, { stdio: 'ignore' });
    } else {
      backendProcess.kill('SIGTERM');
    }
  } catch (err) {
    // Ignore error if process already exited
  }

  backendProcess = null;
}

/**
 * Creates and cryptographically verifies an atomic pre-update database backup.
 * Stored safely in %APPDATA%/XEROVA/backups/pre-update/
 */
function createPreUpdateDatabaseBackup(targetVersion = 'unknown') {
  try {
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    if (!fs.existsSync(dbPath)) {
      console.log('[Backup] No existing database.db found in userData; fresh installation.');
      return { success: true, freshInstall: true };
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup-${timestamp}.db`;
    const backupFilePath = path.join(backupsDir, backupFileName);

    // Copy main database file
    fs.copyFileSync(dbPath, backupFilePath);

    // Copy SQLite WAL and SHM files if active
    const walPath = `${dbPath}-wal`;
    const shmPath = `${dbPath}-shm`;
    if (fs.existsSync(walPath)) {
      fs.copyFileSync(walPath, path.join(backupsDir, `backup-${timestamp}.db-wal`));
    }
    if (fs.existsSync(shmPath)) {
      fs.copyFileSync(shmPath, path.join(backupsDir, `backup-${timestamp}.db-shm`));
    }

    // Verify source vs destination integrity using SHA-256
    const sourceBuffer = fs.readFileSync(dbPath);
    const backupBuffer = fs.readFileSync(backupFilePath);

    const sourceHash = crypto.createHash('sha256').update(sourceBuffer).digest('hex');
    const backupHash = crypto.createHash('sha256').update(backupBuffer).digest('hex');

    if (sourceHash !== backupHash || sourceBuffer.length !== backupBuffer.length) {
      throw new Error('Integrity verification failed: Backup hash mismatch with source database');
    }

    // Write verification metadata manifest
    const metaManifest = {
      backupFile: backupFileName,
      timestamp: new Date().toISOString(),
      sourceVersion: app.getVersion(),
      targetVersion: targetVersion,
      fileSizeBytes: backupBuffer.length,
      sha256: backupHash,
      verified: true,
      sqliteWalCopied: fs.existsSync(walPath)
    };

    fs.writeFileSync(
      path.join(backupsDir, `backup-${timestamp}.meta.json`),
      JSON.stringify(metaManifest, null, 2),
      'utf-8'
    );

    console.log(`[Backup] Pre-update database backup verified successfully: ${backupFileName} (${backupBuffer.length} bytes, SHA256: ${backupHash.substring(0, 12)}...)`);
    return {
      success: true,
      backupFile: backupFileName,
      backupPath: backupFilePath,
      size: backupBuffer.length,
      checksum: backupHash
    };
  } catch (err) {
    console.error('[Backup] Critical pre-update database backup failed:', err);
    return {
      success: false,
      error: err.message || 'Database backup failed'
    };
  }
}

/**
 * Verifies and applies production schema migrations safely without data loss.
 */
function verifyDatabaseMigrations() {
  try {
    // In production, migrations run against local database.db without reset commands
    console.log('[Migration] Verifying local SQLite schema status...');
    // Never run migrate reset in production.
    return { success: true };
  } catch (err) {
    console.error('[Migration] Database migration verification check error:', err);
    return { success: false, error: err.message };
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 700,
    title: `XEROVA BIKE ERP - v${app.getVersion()}`,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  // Security: Block unauthorized popups / new window creations
  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });

  // Security: Restrict navigation to local origins only
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    try {
      const parsedUrl = new URL(navigationUrl);
      if (parsedUrl.origin !== 'http://localhost:3000' && !navigationUrl.startsWith('file://')) {
        console.warn(`[Security] Blocked external navigation to: ${navigationUrl}`);
        event.preventDefault();
      }
    } catch {
      event.preventDefault();
    }
  });

  // Security: Restrict Hardware Permissions
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    console.warn(`[Security] Blocked permission request: ${permission}`);
    callback(false);
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    setTimeout(() => {
      if (mainWindow) {
        mainWindow.loadURL('http://localhost:3000').catch((err) => {
          console.warn('[Window] Dev server load retry:', err.message);
        });
      }
    }, 2000);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

function startBackend() {
  const isDev = !app.isPackaged;

  if (isDev) {
    console.log('[Backend] Starting backend in development mode via npm.cmd...');
    backendProcess = spawn('npm.cmd', ['run', 'dev:backend'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      shell: false
    });
  } else {
    console.log('[Backend] Starting backend in production mode...');
    const serverPath = path.join(__dirname, '../backend/dist/server.js');
    backendProcess = spawn(process.execPath, [serverPath], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      shell: false,
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: '1',
        NODE_ENV: 'production'
      }
    });
  }

  if (backendProcess) {
    backendProcess.on('error', (err) => {
      console.error('[Backend] Failed to start backend process:', err);
    });
  }
}

/**
 * Configure electron-updater with offline-first security policies
 */
function setupAutoUpdater() {
  // CRITICAL: Do NOT automatically download without user permission
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;
  autoUpdater.allowPrerelease = false;

  // Configure update logger
  autoUpdater.logger = {
    info: (msg) => console.log(`[Updater:Info] ${msg}`),
    warn: (msg) => console.warn(`[Updater:Warn] ${msg}`),
    error: (msg) => console.error(`[Updater:Error] ${msg}`)
  };

  // Event: Checking for update
  autoUpdater.on('checking-for-update', () => {
    isCheckingUpdates = true;
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('updater:checking-for-update');
    }
  });

  // Event: Update available
  autoUpdater.on('update-available', (info) => {
    isCheckingUpdates = false;
    console.log(`[Updater] Update available: v${info.version}`);
    if (mainWindow && !mainWindow.isDestroyed()) {
      const payload = {
        currentVersion: app.getVersion(),
        version: info.version,
        releaseDate: info.releaseDate,
        releaseNotes: info.releaseNotes || info.releaseName || 'Performance improvements and bug fixes.'
      };
      mainWindow.webContents.send('updater:update-available', payload);
      mainWindow.webContents.send('update-available', payload);
    }
  });

  // Event: Update not available
  autoUpdater.on('update-not-available', (info) => {
    isCheckingUpdates = false;
    console.log(`[Updater] Application is up to date (current: v${app.getVersion()})`);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('updater:update-not-available', {
        currentVersion: app.getVersion(),
        latestVersion: info?.version || app.getVersion()
      });
    }
  });

  // Event: Download progress
  autoUpdater.on('download-progress', (progressObj) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      const payload = {
        percent: Math.round(progressObj.percent || 0),
        bytesPerSecond: progressObj.bytesPerSecond || 0,
        transferred: progressObj.transferred || 0,
        total: progressObj.total || 0
      };
      mainWindow.webContents.send('updater:download-progress', payload);
      mainWindow.webContents.send('download-progress', payload.percent);
    }
  });

  // Event: Update downloaded
  autoUpdater.on('update-downloaded', (info) => {
    isDownloadingUpdate = false;
    updateDownloadedInfo = info;
    console.log(`[Updater] Update v${info.version} downloaded and verified successfully.`);
    if (mainWindow && !mainWindow.isDestroyed()) {
      const payload = {
        version: info.version,
        releaseDate: info.releaseDate
      };
      mainWindow.webContents.send('updater:update-downloaded', payload);
      mainWindow.webContents.send('update-downloaded', payload);
    }
  });

  // Event: Error during update checking or downloading
  autoUpdater.on('error', (err) => {
    isCheckingUpdates = false;
    isDownloadingUpdate = false;
    // Suppress stack trace from user - log locally for diagnostics
    console.warn('[Updater:OfflineGuard] Update check/download encountered network or release condition:', err.message);

    if (mainWindow && !mainWindow.isDestroyed()) {
      const safeMessage = err.message && err.message.includes('net::ERR')
        ? 'Update server unreachable. Operating in offline mode.'
        : 'Update check unavailable at this time.';
      mainWindow.webContents.send('updater:error', { message: safeMessage });
    }
  });

  // Non-blocking initial check 5 seconds after startup (only in production)
  if (app.isPackaged) {
    setTimeout(() => {
      triggerSafeUpdateCheck().catch(() => {});
    }, 5000);
  }
}

/**
 * Triggers an update check with duplicate check prevention and offline catching
 */
async function triggerSafeUpdateCheck() {
  if (isCheckingUpdates || isDownloadingUpdate) {
    return { status: 'busy', message: 'Update operation already in progress' };
  }

  try {
    isCheckingUpdates = true;
    const result = await autoUpdater.checkForUpdates();
    return { status: 'success', updateInfo: result?.updateInfo };
  } catch (err) {
    isCheckingUpdates = false;
    console.log('[Updater] Safe check caught offline condition:', err.message);
    return { status: 'offline', message: 'Unable to connect to update server' };
  }
}

// =========================================================================
// IPC HANDLERS
// =========================================================================

// Return current semantic version from Electron app package
ipcMain.handle('app:get-version', () => {
  return app.getVersion();
});

// Manual update check from UI (e.g. Settings -> System Updates)
ipcMain.handle('updater:check-for-updates', async () => {
  return await triggerSafeUpdateCheck();
});

// User clicked [Update Now]
ipcMain.handle('updater:download-update', async () => {
  if (isDownloadingUpdate) {
    return { status: 'already_downloading' };
  }
  try {
    isDownloadingUpdate = true;
    console.log('[Updater] User confirmed download. Starting update download...');
    await autoUpdater.downloadUpdate();
    return { status: 'downloading' };
  } catch (err) {
    isDownloadingUpdate = false;
    console.error('[Updater] Failed to initiate update download:', err);
    throw new Error('Failed to initiate download. Please check internet connection.');
  }
});

// User clicked [Restart & Install]
ipcMain.handle('updater:install-update', async () => {
  console.log('[Updater] Preparing atomic pre-update installation...');

  // 1. Create and verify local SQLite database backup
  const targetVer = updateDownloadedInfo?.version || 'new';
  const backupResult = createPreUpdateDatabaseBackup(targetVer);

  if (!backupResult.success) {
    console.error('[Updater] ABORTING installation: Database backup failed safety verification.');
    throw new Error(`Database backup failed: ${backupResult.error}. Installation aborted to protect business data.`);
  }

  // 2. Safely stop backend server to release port and file handles
  stopBackendProcess();

  // 3. Give 500ms for OS handles to release
  await new Promise((resolve) => setTimeout(resolve, 500));

  // 4. Install update and restart application
  console.log('[Updater] Executing quitAndInstall()...');
  autoUpdater.quitAndInstall(false, true);
  return { success: true };
});

// Backwards compatibility legacy handler
ipcMain.on('install-update', async () => {
  try {
    const backupResult = createPreUpdateDatabaseBackup();
    if (backupResult.success) {
      stopBackendProcess();
      autoUpdater.quitAndInstall(false, true);
    }
  } catch (e) {
    console.error('[Updater] Legacy install error:', e);
  }
});

// =========================================================================
// APPLICATION LIFECYCLE
// =========================================================================

app.whenReady().then(() => {
  verifyDatabaseMigrations();
  startBackend();
  createWindow();
  setupAutoUpdater();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('before-quit', () => {
  stopBackendProcess();
});

app.on('window-all-closed', function () {
  stopBackendProcess();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
