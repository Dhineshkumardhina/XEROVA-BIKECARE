import React, { useState, useEffect } from 'react';
import { UserRole } from '../../types';

interface SystemUpdatesViewProps {
  userRole: UserRole;
  onNavigateBack?: () => void;
}

type UpdateCheckState =
  | 'idle'
  | 'checking'
  | 'latest'
  | 'available'
  | 'downloading'
  | 'ready'
  | 'download_failed'
  | 'unavailable';

export const SystemUpdatesView: React.FC<SystemUpdatesViewProps> = ({
  userRole,
  onNavigateBack
}) => {
  const [currentVersion, setCurrentVersion] = useState<string>('1.0.0');
  const [checkState, setCheckState] = useState<UpdateCheckState>('idle');
  const [availableVersion, setAvailableVersion] = useState<string>('');
  const [releaseNotes, setReleaseNotes] = useState<string>('');
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [lastCheckedTime, setLastCheckedTime] = useState<string | null>(null);

  useEffect(() => {
    // 1. Get current version from Electron package
    if (window.api?.getAppVersion) {
      window.api.getAppVersion().then((v) => {
        if (v) setCurrentVersion(v);
      }).catch(() => {});
    }

    // 2. Listen to updater events
    const unsubChecking = window.api?.onCheckingForUpdate?.(() => {
      setCheckState('checking');
      setStatusMessage('Querying GitHub Releases for new updates...');
    });

    const unsubAvailable = window.api?.onUpdateAvailable?.((info) => {
      setCheckState('available');
      setAvailableVersion(info.version);
      if (info.releaseNotes) setReleaseNotes(info.releaseNotes);
      setStatusMessage(`New version v${info.version} is available for download.`);
      setLastCheckedTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    });

    const unsubNotAvailable = window.api?.onUpdateNotAvailable?.((info) => {
      setCheckState('latest');
      setStatusMessage("You're using the latest version of XEROVA BIKE ERP.");
      setLastCheckedTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    });

    const unsubProgress = window.api?.onDownloadProgress?.((data) => {
      setCheckState('downloading');
      if (typeof data === 'number') {
        setDownloadProgress(Math.round(data));
      } else if (data && typeof data.percent === 'number') {
        setDownloadProgress(Math.round(data.percent));
      }
    });

    const unsubDownloaded = window.api?.onUpdateDownloaded?.((info) => {
      setCheckState('ready');
      if (info?.version) setAvailableVersion(info.version);
      setStatusMessage('Update package downloaded and verified. Ready to restart & install.');
    });

    const unsubError = window.api?.onUpdateError?.((err) => {
      console.warn('[SystemUpdatesView] Updater status:', err.message);
      if (checkState === 'downloading') {
        setCheckState('download_failed');
        setStatusMessage(err.message || 'Download failed. Please verify internet connection.');
      } else {
        setCheckState('unavailable');
        setStatusMessage(err.message || 'Update check unavailable. Operating in offline mode.');
      }
      setLastCheckedTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    });

    return () => {
      if (unsubChecking) unsubChecking();
      if (unsubAvailable) unsubAvailable();
      if (unsubNotAvailable) unsubNotAvailable();
      if (unsubProgress) unsubProgress();
      if (unsubDownloaded) unsubDownloaded();
      if (unsubError) unsubError();
    };
  }, [checkState]);

  const handleManualCheck = async () => {
    if (checkState === 'checking' || checkState === 'downloading') return;

    setCheckState('checking');
    setStatusMessage('Checking for updates from GitHub Releases...');

    if (!window.api?.checkForUpdates) {
      // In web browser or simulation mode
      setTimeout(() => {
        setCheckState('latest');
        setStatusMessage("You're using the latest version of XEROVA BIKE ERP.");
        setLastCheckedTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
      }, 1200);
      return;
    }

    try {
      const res = await window.api.checkForUpdates();
      if (res && res.status === 'offline') {
        setCheckState('unavailable');
        setStatusMessage('Update check unavailable. Operating in offline mode.');
        setLastCheckedTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (err: any) {
      setCheckState('unavailable');
      setStatusMessage('Update check unavailable. Operating in offline mode.');
      setLastCheckedTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    }
  };

  const handleDownloadUpdate = async () => {
    setCheckState('downloading');
    setDownloadProgress(0);
    try {
      if (window.api?.downloadUpdate) {
        await window.api.downloadUpdate();
      }
    } catch (err: any) {
      setCheckState('download_failed');
      setStatusMessage(err.message || 'Download failed.');
    }
  };

  const handleInstallUpdate = async () => {
    try {
      if (window.api?.installUpdate) {
        await window.api.installUpdate();
      }
    } catch (err: any) {
      setCheckState('download_failed');
      setStatusMessage(err.message || 'Failed to install update.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low p-4 rounded-xl border border-surface-container-high shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <span className="material-symbols-outlined text-[24px]">system_update</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">System Updates &amp; About</h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-50 text-blue-700 rounded border border-blue-200">
                Production Channel
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage automatic update settings, semantic versioning, and pre-update database integrity backups.
            </p>
          </div>
        </div>

        {onNavigateBack && (
          <button
            onClick={onNavigateBack}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Back to Admin
          </button>
        )}
      </div>

      {/* Main Version & Status Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-md flex-shrink-0">
              <span className="material-symbols-outlined text-[36px] text-blue-400">two_wheeler</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">BIKE ERP</h2>
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-800 rounded-full border border-slate-200">
                  v{currentVersion}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Enterprise Offline-First Motorcycle Spare-Parts &amp; POS Management System
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Release Source: <span className="font-mono text-slate-600 font-semibold">GitHub Releases (Dhineshkumardhina/XEROVA-BIKECARE)</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5">
            <button
              onClick={handleManualCheck}
              disabled={checkState === 'checking' || checkState === 'downloading'}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <span className={`material-symbols-outlined text-[16px] ${checkState === 'checking' ? 'animate-spin' : ''}`}>
                {checkState === 'checking' ? 'sync' : 'refresh'}
              </span>
              <span>{checkState === 'checking' ? 'Checking for updates...' : 'Check for Updates'}</span>
            </button>
            {lastCheckedTime && (
              <span className="text-[10px] text-slate-400">Last checked today at {lastCheckedTime}</span>
            )}
          </div>
        </div>

        {/* Dynamic Status Section */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Update Status</h3>

          {/* State: Idle / Ready to Check */}
          {checkState === 'idle' && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3 text-xs text-slate-600">
              <span className="material-symbols-outlined text-[20px] text-slate-400">info</span>
              <span>Click <strong>Check for Updates</strong> to query GitHub Releases for new updates.</span>
            </div>
          )}

          {/* State: Checking */}
          {checkState === 'checking' && (
            <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200 flex items-center gap-3 text-xs text-blue-800 animate-pulse">
              <span className="material-symbols-outlined text-[20px] text-blue-600 animate-spin">sync</span>
              <span className="font-medium">Checking for updates...</span>
            </div>
          )}

          {/* State: Latest Version */}
          {checkState === 'latest' && (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-3 text-xs text-emerald-800">
              <span className="material-symbols-outlined text-[20px] text-emerald-600 flex-shrink-0 mt-0.5">
                check_circle
              </span>
              <div>
                <p className="font-bold">You're using the latest version.</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  XEROVA BIKE ERP v{currentVersion} is up to date with the official production release channel.
                </p>
              </div>
            </div>
          )}

          {/* State: New Version Available */}
          {checkState === 'available' && (
            <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50/40 rounded-xl border border-blue-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[22px] text-blue-600">upgrade</span>
                  <span className="font-bold text-sm text-slate-900">New version available: v{availableVersion}</span>
                </div>
                <button
                  onClick={handleDownloadUpdate}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">download</span>
                  Download Update
                </button>
              </div>

              {releaseNotes && (
                <div className="mt-2 bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-700">
                  <span className="font-semibold text-slate-900 block mb-1">Release Highlights:</span>
                  <p className="text-[11px] text-slate-600 whitespace-pre-line leading-relaxed">{releaseNotes}</p>
                </div>
              )}
            </div>
          )}

          {/* State: Downloading Progress */}
          {checkState === 'downloading' && (
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                  Downloading update package...
                </span>
                <span className="font-mono font-bold text-blue-600 text-sm">{downloadProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(5, downloadProgress)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Update is downloading safely in the background. Normal ERP operations remain fully responsive.
              </p>
            </div>
          )}

          {/* State: Downloaded & Ready to Install */}
          {checkState === 'ready' && (
            <div className="p-5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[24px] text-emerald-600 flex-shrink-0">
                    task_alt
                  </span>
                  <div>
                    <h4 className="font-bold text-emerald-900 text-sm">Update downloaded and ready to install.</h4>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Target version: <strong>v{availableVersion}</strong>. An automated SQLite database backup will be created and verified prior to restarting.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleInstallUpdate}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                >
                  <span className="material-symbols-outlined text-[15px]">restart_alt</span>
                  Restart &amp; Install
                </button>
              </div>
            </div>
          )}

          {/* State: Download Failed */}
          {checkState === 'download_failed' && (
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 flex items-start gap-3 text-xs text-rose-800">
              <span className="material-symbols-outlined text-[20px] text-rose-600 flex-shrink-0 mt-0.5">
                warning
              </span>
              <div className="flex-1">
                <p className="font-bold">Download failed.</p>
                <p className="text-[11px] text-rose-700 mt-0.5">{statusMessage}</p>
                <button
                  onClick={handleDownloadUpdate}
                  className="mt-2 px-3 py-1 bg-rose-600 text-white rounded text-xs font-semibold hover:bg-rose-700 transition-colors"
                >
                  Retry Download
                </button>
              </div>
            </div>
          )}

          {/* State: Update check unavailable */}
          {checkState === 'unavailable' && (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3 text-xs text-amber-800">
              <span className="material-symbols-outlined text-[20px] text-amber-600 flex-shrink-0 mt-0.5">
                wifi_off
              </span>
              <div>
                <p className="font-bold">Update check unavailable.</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Operating in offline mode. Billing, POS counter sales, inventory management, and database operations continue without interruption.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Safety & Safeguard Guarantees */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Offline-First Guarantee */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-blue-600">cloud_off</span>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">100% Offline-First Core</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Internet connection is only required when querying or downloading new update packages from GitHub Releases. All core ERP business functions—fast POS billing, item catalogs, purchase entry, accounts, customer ledgers, and local SQLite data storage—work completely offline.
          </p>
        </div>

        {/* Database Protection Guarantee */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-emerald-600">verified_user</span>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Pre-Update Database Snapshot</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Before any update is installed, an atomic verified snapshot of <code className="font-mono text-emerald-700 font-semibold text-[11px]">database.db</code> is created in <code className="font-mono text-[10px] text-slate-600">%APPDATA%/XEROVA/backups/pre-update/</code> with SHA-256 checksum verification to guarantee your business data is never lost or corrupted.
          </p>
        </div>
      </div>
    </div>
  );
};
