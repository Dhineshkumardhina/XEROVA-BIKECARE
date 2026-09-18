import React, { useState, useEffect } from 'react';

export interface UpdateInfoPayload {
  currentVersion?: string;
  version: string;
  releaseDate?: string;
  releaseNotes?: string;
}

export interface DownloadProgressPayload {
  percent: number;
  bytesPerSecond?: number;
  transferred?: number;
  total?: number;
}

declare global {
  interface Window {
    api?: {
      getAppVersion?: () => Promise<string>;
      checkForUpdates?: () => Promise<{ status: string; message?: string }>;
      downloadUpdate?: () => Promise<any>;
      installUpdate?: () => Promise<any>;
      onCheckingForUpdate?: (cb: () => void) => () => void;
      onUpdateAvailable?: (cb: (info: UpdateInfoPayload) => void) => () => void;
      onUpdateNotAvailable?: (cb: (info: any) => void) => () => void;
      onDownloadProgress?: (cb: (progress: DownloadProgressPayload | number) => void) => () => void;
      onUpdateDownloaded?: (cb: (info: any) => void) => () => void;
      onUpdateError?: (cb: (error: { message: string }) => void) => () => void;
      removeUpdateListeners?: () => void;
    };
  }
}

export const UpdateAlert: React.FC = () => {
  const [updateStatus, setUpdateStatus] = useState<'none' | 'available' | 'downloading' | 'ready' | 'error'>('none');
  const [currentVersion, setCurrentVersion] = useState<string>('1.0.0');
  const [newVersion, setNewVersion] = useState<string>('');
  const [releaseNotes, setReleaseNotes] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [downloadSpeed, setDownloadSpeed] = useState<string>('');
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isInstalling, setIsInstalling] = useState<boolean>(false);

  useEffect(() => {
    if (!window.api) return;

    // Fetch dynamic package version
    if (window.api.getAppVersion) {
      window.api.getAppVersion().then((ver) => {
        if (ver) setCurrentVersion(ver);
      }).catch(() => {});
    }

    // Subscribe to update events
    const unsubAvailable = window.api.onUpdateAvailable?.((info) => {
      setNewVersion(info.version);
      if (info.currentVersion) setCurrentVersion(info.currentVersion);
      if (info.releaseNotes) setReleaseNotes(info.releaseNotes);
      setUpdateStatus('available');
      setIsDismissed(false);
    });

    const unsubProgress = window.api.onDownloadProgress?.((data) => {
      setUpdateStatus('downloading');
      setIsDismissed(false);
      if (typeof data === 'number') {
        setProgress(Math.round(data));
      } else if (data && typeof data.percent === 'number') {
        setProgress(Math.round(data.percent));
        if (data.bytesPerSecond) {
          const mbps = (data.bytesPerSecond / (1024 * 1024)).toFixed(1);
          setDownloadSpeed(`${mbps} MB/s`);
        }
      }
    });

    const unsubDownloaded = window.api.onUpdateDownloaded?.((info) => {
      if (info?.version) setNewVersion(info.version);
      setUpdateStatus('ready');
      setIsDismissed(false);
    });

    const unsubError = window.api.onUpdateError?.((err) => {
      console.warn('[UpdateAlert] Received updater status:', err.message);
      if (updateStatus === 'downloading') {
        setErrorMessage(err.message || 'Download interrupted. Please check network.');
        setUpdateStatus('error');
      }
    });

    return () => {
      if (unsubAvailable) unsubAvailable();
      if (unsubProgress) unsubProgress();
      if (unsubDownloaded) unsubDownloaded();
      if (unsubError) unsubError();
    };
  }, [updateStatus]);

  const handleStartDownload = async () => {
    try {
      setUpdateStatus('downloading');
      setProgress(0);
      if (window.api?.downloadUpdate) {
        await window.api.downloadUpdate();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to begin download.');
      setUpdateStatus('error');
    }
  };

  const handleInstallNow = async () => {
    try {
      setIsInstalling(true);
      if (window.api?.installUpdate) {
        await window.api.installUpdate();
      }
    } catch (err: any) {
      setIsInstalling(false);
      setErrorMessage(err.message || 'Installation could not proceed.');
      setUpdateStatus('error');
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  if (updateStatus === 'none' || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden z-50 animate-in slide-in-from-bottom-3 duration-200 text-slate-800">
      {/* Header Bar with Branding */}
      <div className="bg-slate-900 px-4 py-3 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-[18px]">system_update</span>
          </div>
          <div>
            <h4 className="text-xs font-bold tracking-tight">BIKE ERP Update Available</h4>
            <p className="text-[10px] text-slate-400">Official Production Release</p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
          title="Dismiss for now (Later)"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>

      {/* Modal Content */}
      <div className="p-4 space-y-3">
        {/* Version Difference Banner */}
        <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
          <div className="text-center flex-1">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Current Version</span>
            <span className="font-mono font-bold text-slate-700">v{currentVersion}</span>
          </div>
          <div className="px-2 text-slate-400">
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </div>
          <div className="text-center flex-1">
            <span className="text-[10px] uppercase font-semibold text-blue-600 block">New Version</span>
            <span className="font-mono font-bold text-blue-600">v{newVersion || 'Next'}</span>
          </div>
        </div>

        {/* State: Available */}
        {updateStatus === 'available' && (
          <div className="space-y-2">
            <div className="text-xs text-slate-600">
              <span className="font-semibold text-slate-800">What's New:</span>
              <div className="mt-1 max-h-24 overflow-y-auto bg-slate-50 p-2 rounded text-[11px] font-sans text-slate-600 border border-slate-100 whitespace-pre-line leading-relaxed">
                {releaseNotes || '• Enhanced offline performance & high-velocity POS\n• Automatic pre-update database integrity backups\n• GST & inventory stability improvements'}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleStartDownload}
                className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold py-2 px-3 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">download</span>
                Update Now
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Later
              </button>
            </div>
          </div>
        )}

        {/* State: Downloading */}
        {updateStatus === 'downloading' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-600">
              <span className="font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Downloading update...
              </span>
              <span className="font-mono font-semibold text-slate-800">{progress}%</span>
            </div>

            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                style={{ width: `${Math.max(4, progress)}%` }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Verified Package Stream</span>
              <span>{downloadSpeed || 'In progress...'}</span>
            </div>
          </div>
        )}

        {/* State: Ready to Install */}
        {updateStatus === 'ready' && (
          <div className="space-y-2.5">
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] text-emerald-600 flex-shrink-0 mt-0.5">
                verified
              </span>
              <div>
                <p className="font-semibold">Update downloaded and ready to install.</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Your customer database will be automatically backed up before restarting.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleInstallNow}
                disabled={isInstalling}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 px-3 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                {isInstalling ? 'Backing up & Restarting...' : 'Restart & Install'}
              </button>
              <button
                onClick={handleDismiss}
                disabled={isInstalling}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                Later
              </button>
            </div>
          </div>
        )}

        {/* State: Error */}
        {updateStatus === 'error' && (
          <div className="space-y-2">
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-rose-600 flex-shrink-0">
                error
              </span>
              <p className="text-[11px] leading-tight">{errorMessage || 'Update interrupted. Offline operation active.'}</p>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={handleStartDownload}
                className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 border border-slate-200 rounded text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
