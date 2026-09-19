import React, { useState, useEffect } from 'react';
import { useSyncStatus } from '../../hooks/useSyncStatus';

export const NetworkBanner: React.FC = () => {
  const { isOnline, isSyncing, pendingCount, lastSyncedAt, syncNow } = useSyncStatus();
  const [showSyncedNotice, setShowSyncedNotice] = useState(false);

  useEffect(() => {
    if (lastSyncedAt && isOnline && pendingCount === 0) {
      setShowSyncedNotice(true);
      const timer = setTimeout(() => setShowSyncedNotice(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [lastSyncedAt, isOnline, pendingCount]);

  if (isOnline && !isSyncing && !showSyncedNotice) {
    return null;
  }

  // 1. Just synced notice
  if (showSyncedNotice && !isSyncing && isOnline) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-emerald-600 text-white text-center py-1.5 px-4 text-xs font-semibold z-50 flex items-center justify-center gap-2 shadow-lg animate-in fade-in slide-in-from-bottom duration-300">
        <span className="material-symbols-outlined text-[16px]">cloud_done</span>
        <span>All offline invoices and transactions synchronized with Neon Cloud database successfully.</span>
        <button
          onClick={() => setShowSyncedNotice(false)}
          className="ml-3 text-[11px] underline opacity-80 hover:opacity-100 cursor-pointer"
        >
          Dismiss
        </button>
      </div>
    );
  }

  // 2. Currently syncing
  if (isSyncing) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white text-center py-1.5 px-4 text-xs font-semibold z-50 flex items-center justify-center gap-2 shadow-lg">
        <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
        <span>Connecting to Neon Cloud: Synchronizing {pendingCount} offline transaction(s)...</span>
      </div>
    );
  }

  // 3. Offline mode active
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-amber-600 text-white text-center py-1.5 px-4 text-xs font-semibold z-50 flex items-center justify-center gap-3 shadow-lg select-none">
      <div className="flex items-center gap-1.5">
        <span className="material-symbols-outlined text-[16px]">wifi_off</span>
        <span>
          <strong>Offline Mode Active:</strong> Invoices are stored locally in your laptop.
          {pendingCount > 0 ? (
            <span className="ml-1 bg-amber-700/60 px-1.5 py-0.5 rounded text-[11px]">
              {pendingCount} bill(s) pending sync
            </span>
          ) : (
            ' System will auto-sync when internet reconnects.'
          )}
        </span>
      </div>

      <button
        onClick={() => syncNow()}
        className="px-2.5 py-0.5 rounded bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold transition-colors cursor-pointer"
        title="Check connection and retry sync"
      >
        Retry Connection
      </button>
    </div>
  );
};
