import React, { useState, useRef, useEffect } from 'react';
import { useSyncStatus } from '../../hooks/useSyncStatus';

export const CloudSyncBadge: React.FC = () => {
  const { isOnline, isSyncing, pendingCount, lastSyncedAt, lastError, queue, syncNow } = useSyncStatus();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 30) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative select-none" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
          isSyncing
            ? 'bg-blue-50 border-blue-200 text-blue-700'
            : !isOnline
            ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100/80'
            : pendingCount > 0
            ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100/80'
            : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100/80'
        }`}
        title="Click to view Cloud Synchronization status"
      >
        {isSyncing ? (
          <>
            <span className="material-symbols-outlined text-[15px] animate-spin text-blue-600">sync</span>
            <span>Syncing...</span>
          </>
        ) : !isOnline ? (
          <>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span>Offline</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded-full text-[10px]">
                {pendingCount}
              </span>
            )}
          </>
        ) : pendingCount > 0 ? (
          <>
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>{pendingCount} Pending</span>
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Cloud Synced</span>
          </>
        )}
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-84 bg-white border border-slate-200 rounded-xl shadow-xl py-3 z-50 text-xs">
          <div className="px-3.5 pb-2.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-blue-600">cloud_sync</span>
              <span className="font-bold text-slate-900 text-sm">Cloud Auto-Sync Center</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isOnline ? 'Connected' : 'Offline'}
            </span>
          </div>

          <div className="px-3.5 py-2.5 space-y-2 border-b border-slate-100 bg-slate-50/60">
            <div className="flex justify-between items-center text-slate-600">
              <span>Database Target:</span>
              <span className="font-semibold text-slate-800">Neon Cloud (PostgreSQL)</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Local Queue Storage:</span>
              <span className="font-semibold text-slate-800">IndexedDB (Offline Persistent)</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Last Synchronized:</span>
              <span className="font-semibold text-slate-800">{formatTime(lastSyncedAt)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-600">
              <span>Pending Offline Bills:</span>
              <span className="font-bold text-slate-900">{pendingCount}</span>
            </div>
          </div>

          {lastError && (
            <div className="mx-3 my-2 p-2 rounded bg-rose-50 border border-rose-200 text-rose-700 text-[11px]">
              <strong>Sync Note:</strong> {lastError}
            </div>
          )}

          {/* Queue List Preview */}
          <div className="px-3.5 py-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Recent Offline Queue
            </div>
            {queue.length === 0 ? (
              <div className="text-slate-400 text-center py-3 text-[11px]">
                No pending offline transactions. All data is in cloud.
              </div>
            ) : (
              <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 text-[11px]">
                {queue.slice(0, 5).map((q) => (
                  <div key={q.id} className="py-1.5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800">{q.clientReference}</span>
                      <span className="ml-1.5 text-[10px] text-slate-400">({q.entityType})</span>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        q.status === 'SYNCED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : q.status === 'SYNCING'
                          ? 'bg-blue-50 text-blue-700 animate-pulse'
                          : q.status === 'FAILED'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {q.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="px-3.5 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">Auto-syncs every 15s</span>
            <button
              onClick={() => syncNow()}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
            >
              <span className={`material-symbols-outlined text-[15px] ${isSyncing ? 'animate-spin' : ''}`}>
                sync
              </span>
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
