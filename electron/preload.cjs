const { contextBridge, ipcRenderer } = require('electron');

// Expose safe, isolated API to the renderer process
contextBridge.exposeInMainWorld('api', {
  // Application Information
  getAppVersion: () => ipcRenderer.invoke('app:get-version'),

  // Updater Trigger Actions
  checkForUpdates: () => ipcRenderer.invoke('updater:check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('updater:download-update'),
  installUpdate: () => ipcRenderer.invoke('updater:install-update'),

  // Event Listeners
  onCheckingForUpdate: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('updater:checking-for-update', handler);
    return () => ipcRenderer.removeListener('updater:checking-for-update', handler);
  },

  onUpdateAvailable: (callback) => {
    const handler = (_event, info) => callback(info);
    ipcRenderer.on('updater:update-available', handler);
    // Legacy event support
    ipcRenderer.on('update-available', handler);
    return () => {
      ipcRenderer.removeListener('updater:update-available', handler);
      ipcRenderer.removeListener('update-available', handler);
    };
  },

  onUpdateNotAvailable: (callback) => {
    const handler = (_event, info) => callback(info);
    ipcRenderer.on('updater:update-not-available', handler);
    return () => ipcRenderer.removeListener('updater:update-not-available', handler);
  },

  onDownloadProgress: (callback) => {
    const handler = (_event, progressObj) => callback(progressObj);
    ipcRenderer.on('updater:download-progress', handler);
    // Legacy event support (passes percent directly or object)
    ipcRenderer.on('download-progress', handler);
    return () => {
      ipcRenderer.removeListener('updater:download-progress', handler);
      ipcRenderer.removeListener('download-progress', handler);
    };
  },

  onUpdateDownloaded: (callback) => {
    const handler = (_event, info) => callback(info);
    ipcRenderer.on('updater:update-downloaded', handler);
    // Legacy event support
    ipcRenderer.on('update-downloaded', handler);
    return () => {
      ipcRenderer.removeListener('updater:update-downloaded', handler);
      ipcRenderer.removeListener('update-downloaded', handler);
    };
  },

  onUpdateError: (callback) => {
    const handler = (_event, error) => callback(error);
    ipcRenderer.on('updater:error', handler);
    return () => ipcRenderer.removeListener('updater:error', handler);
  },

  // Cleanup helper
  removeUpdateListeners: () => {
    ipcRenderer.removeAllListeners('updater:checking-for-update');
    ipcRenderer.removeAllListeners('updater:update-available');
    ipcRenderer.removeAllListeners('updater:update-not-available');
    ipcRenderer.removeAllListeners('updater:download-progress');
    ipcRenderer.removeAllListeners('updater:update-downloaded');
    ipcRenderer.removeAllListeners('updater:error');
    ipcRenderer.removeAllListeners('update-available');
    ipcRenderer.removeAllListeners('download-progress');
    ipcRenderer.removeAllListeners('update-downloaded');
  }
});
