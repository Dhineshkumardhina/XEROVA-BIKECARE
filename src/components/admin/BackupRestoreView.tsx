import React, { useState } from 'react';
import { BackupRecord, UserRole } from '../../types';

interface BackupRestoreViewProps {
  backups: BackupRecord[];
  userRole: UserRole;
  onCreateBackup: () => void;
  onRestoreBackup: (backupId: string) => void;
  onDeleteBackup: (backupId: string) => void;
  onTriggerPermissionDenied?: (action: string) => void;
}

export const BackupRestoreView: React.FC<BackupRestoreViewProps> = ({
  backups,
  userRole,
  onCreateBackup,
  onRestoreBackup,
  onDeleteBackup,
  onTriggerPermissionDenied
}) => {
  const [backupList, setBackupList] = useState<BackupRecord[]>(backups);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupToast, setBackupToast] = useState<string | null>(null);

  // Restore Strong Confirmation Modal State
  const [pendingRestore, setPendingRestore] = useState<BackupRecord | null>(null);
  const [confirmInput, setConfirmInput] = useState('');
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const isAllowedToBackup = userRole === 'super_admin' || userRole === 'admin';
  const isAllowedToRestore = userRole === 'super_admin';

  // Trigger Backup Now
  const handleBackupNow = () => {
    if (!isAllowedToBackup) {
      if (onTriggerPermissionDenied) onTriggerPermissionDenied('Create Database Snapshot');
      return;
    }
    setIsBackingUp(true);
    setTimeout(() => {
      const now = new Date();
      const backupFilename = `BIKE_ERP_BACKUP_${now.toISOString().slice(0, 10).replace(/-/g, '')}_${now.getHours()}${now.getMinutes()}.sql.gz`;
      const newBackup: BackupRecord = {
        id: `bkp-${Date.now()}`,
        filename: backupFilename,
        fileName: backupFilename,
        date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        size: '43.2 MB',
        fileSize: '43.2 MB',
        createdBy: 'Admin / Ramesh (Manual Trigger)',
        type: 'Manual',
        status: 'Success',
        location: 'Local D:\\BIKE_ERP\\Backups & Cloud Mirror',
        storageLocation: 'Local D:\\BIKE_ERP\\Backups & Cloud Mirror',
        recordsCount: 48920
      };
      setBackupList([newBackup, ...backupList]);
      onCreateBackup();
      setIsBackingUp(false);
      setBackupToast(`New backup archive "${newBackup.fileName}" created and verified successfully.`);
      setTimeout(() => setBackupToast(null), 4000);
    }, 1500);
  };

  // Open Restore Confirmation Dialog
  const handleOpenRestore = (record: BackupRecord) => {
    if (!isAllowedToRestore) {
      if (onTriggerPermissionDenied) onTriggerPermissionDenied('Restore Database Archive');
      return;
    }
    setPendingRestore(record);
    setConfirmInput('');
    setRestoreError(null);
  };

  // Execute Restore
  const handleConfirmRestore = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmInput.trim().toUpperCase() !== 'RESTORE') {
      setRestoreError('Type "RESTORE" exactly to verify database override.');
      return;
    }

    if (pendingRestore) {
      setIsRestoring(true);
      setTimeout(() => {
        setIsRestoring(false);
        onRestoreBackup(pendingRestore.id);
        const restoredName = pendingRestore.fileName;
        setPendingRestore(null);
        setBackupToast(`Database restored from snapshot "${restoredName}". All tables re-indexed.`);
        setTimeout(() => setBackupToast(null), 5000);
      }, 2000);
    }
  };

  const handleDownload = (fileName: string) => {
    // Generate dummy download link for .sql.gz
    const element = document.createElement('a');
    const file = new Blob([`-- BIKE ERP SQL ARCHIVE DUMP: ${fileName}\n-- Generated on ${new Date().toISOString()}\n`], { type: 'application/octet-stream' });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDelete = (id: string) => {
    if (!isAllowedToRestore) {
      if (onTriggerPermissionDenied) onTriggerPermissionDenied('Delete Historical Backup');
      return;
    }
    setBackupList(backupList.filter((b) => b.id !== id));
    onDeleteBackup(id);
  };

  const latestBackup = backupList[0];

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low p-4 rounded border border-surface-container-high">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-primary">settings_backup_restore</span>
            <h1 className="text-lg font-bold text-on-surface tracking-tight">Database Backup & Disaster Recovery</h1>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-surface-container rounded border border-surface-container-high text-outline">
              Point-in-Time Recovery
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Maintain local SSD snapshots, offsite encrypted cold storage, and automated scheduled business backups.
          </p>
        </div>

        <button
          onClick={handleBackupNow}
          disabled={isBackingUp}
          className="px-4 py-2 bg-primary text-on-primary rounded text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 shadow-xs shrink-0 disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isBackingUp ? 'sync' : 'cloud_upload'}
          </span>
          {isBackingUp ? 'Creating Snapshot...' : 'Backup Now'}
        </button>
      </div>

      {backupToast && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{backupToast}</span>
          </div>
          <button onClick={() => setBackupToast(null)} className="text-outline hover:text-on-surface">
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        </div>
      )}

      {/* KPI Cards: Backup Health Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Latest Backup */}
        <div className="p-3.5 bg-surface-container-low border border-surface-container-high rounded flex flex-col justify-between">
          <div className="text-[11px] text-outline uppercase font-semibold">Latest Snapshot</div>
          <div className="mt-1 font-bold text-sm text-on-surface">
            {latestBackup ? `${latestBackup.date} at ${latestBackup.time}` : 'No backups found'}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            CRC32 Checksum Verified
          </div>
        </div>

        {/* Total File Size */}
        <div className="p-3.5 bg-surface-container-low border border-surface-container-high rounded flex flex-col justify-between">
          <div className="text-[11px] text-outline uppercase font-semibold">Latest Archive Size</div>
          <div className="mt-1 font-bold text-sm font-mono text-on-surface">
            {latestBackup?.fileSize || '0.0 MB'}
          </div>
          <div className="text-[11px] text-outline mt-1">
            {latestBackup?.recordsCount ? `${latestBackup.recordsCount.toLocaleString('en-IN')} rows archived` : '—'}
          </div>
        </div>

        {/* Storage Location */}
        <div className="p-3.5 bg-surface-container-low border border-surface-container-high rounded flex flex-col justify-between">
          <div className="text-[11px] text-outline uppercase font-semibold">Storage Redundancy</div>
          <div className="mt-1 font-semibold text-xs text-on-surface truncate">
            Local SSD + Encrypted S3
          </div>
          <div className="text-[11px] text-outline mt-1 font-mono">
            D:\BIKE_ERP\Backups
          </div>
        </div>

        {/* Schedule */}
        <div className="p-3.5 bg-surface-container-low border border-surface-container-high rounded flex flex-col justify-between">
          <div className="text-[11px] text-outline uppercase font-semibold">Auto-Backup Cron</div>
          <div className="mt-1 font-bold text-xs text-secondary flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            Daily at 08:00 AM & 09:30 PM
          </div>
          <div className="text-[11px] text-outline mt-1">
            Retention: Last 30 Daily Snaps
          </div>
        </div>
      </div>

      {/* Backup History Table */}
      <div className="bg-surface-container-low border border-surface-container-high rounded overflow-hidden shadow-xs">
        <div className="px-4 py-2.5 bg-surface-container border-b border-surface-container-high flex items-center justify-between">
          <span className="font-semibold text-xs text-on-surface uppercase tracking-wider">
            Available Snapshot Archives ({backupList.length})
          </span>
          <span className="text-[11px] text-outline">
            Restores require Super Admin confirmation
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-container-high text-outline uppercase font-semibold text-[11px] tracking-wider">
                <th className="py-2.5 px-3">Archive Filename</th>
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Size</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Created By</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high text-on-surface">
              {backupList.map((b) => (
                <tr key={b.id} className="hover:bg-surface-container-highest/30 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-medium text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-outline text-[18px]">folder_zip</span>
                    <span>{b.fileName}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-outline whitespace-nowrap">
                    {b.date} {b.time}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px]">{b.fileSize}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] border ${
                      b.type === 'Scheduled'
                        ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20'
                        : b.type === 'Pre-Update'
                        ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20'
                        : 'bg-surface-container text-on-surface border-surface-container-high'
                    }`}>
                      {b.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-on-surface-variant text-[11px]">{b.createdBy}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {b.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      {/* Download */}
                      <button
                        onClick={() => handleDownload(b.fileName)}
                        className="p-1 rounded hover:bg-surface-container text-outline hover:text-on-surface"
                        title="Download .sql.gz File"
                      >
                        <span className="material-symbols-outlined text-[16px]">download</span>
                      </button>

                      {/* Restore */}
                      <button
                        onClick={() => handleOpenRestore(b)}
                        className="px-2 py-0.5 rounded bg-surface border border-surface-container-high hover:bg-surface-container text-secondary text-[11px] font-medium flex items-center gap-1"
                        title="Restore Database to this snapshot"
                      >
                        <span className="material-symbols-outlined text-[14px]">history</span>
                        Restore
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="p-1 rounded hover:bg-surface-container text-outline hover:text-error"
                        title="Delete Archive"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* STRONG CONFIRMATION MODAL FOR RESTORE */}
      {pendingRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest border border-error/50 rounded shadow-2xl max-w-md w-full overflow-hidden text-on-surface">
            {/* Red Alert Header */}
            <div className="bg-error-container/25 border-b border-error/40 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-error">
                <span className="material-symbols-outlined text-[24px]">warning</span>
                <h3 className="font-bold text-sm tracking-tight text-on-surface">
                  DANGER: Overwrite Active Database?
                </h3>
              </div>
              <button
                onClick={() => setPendingRestore(null)}
                className="text-outline hover:text-on-surface rounded p-1"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Warning Body */}
            <form onSubmit={handleConfirmRestore} className="p-5 space-y-4 text-xs leading-relaxed">
              <div className="p-3 bg-error-container/15 border border-error/30 rounded text-error space-y-1.5">
                <p className="font-bold">
                  Restoring will permanently overwrite current business data!
                </p>
                <p className="text-on-surface-variant text-[11px]">
                  Target Archive: <strong className="font-mono text-on-surface">{pendingRestore.fileName}</strong> ({pendingRestore.date} {pendingRestore.time}).
                </p>
              </div>

              <p className="text-on-surface-variant">
                All sales invoices, purchase receipts, customer balances, and stock inventory created after{' '}
                <strong className="text-on-surface">{pendingRestore.date} {pendingRestore.time}</strong> will be 
                replaced with the snapshot's state. This action cannot be undone.
              </p>

              <div>
                <label className="block font-semibold text-on-surface mb-1">
                  Type <span className="font-mono text-error font-bold">RESTORE</span> in capital letters to confirm:
                </label>
                <input
                  type="text"
                  required
                  value={confirmInput}
                  onChange={(e) => {
                    setConfirmInput(e.target.value);
                    setRestoreError(null);
                  }}
                  placeholder="RESTORE"
                  className="w-full px-3 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface font-mono font-bold focus:outline-hidden focus:border-error"
                />
                {restoreError && (
                  <p className="text-error text-[11px] mt-1 font-medium">{restoreError}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-surface-container-high flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setPendingRestore(null)}
                  className="px-3.5 py-1.5 rounded border border-surface-container-highest bg-surface hover:bg-surface-container-high text-on-surface font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRestoring || confirmInput.trim() !== 'RESTORE'}
                  className="px-4 py-1.5 rounded bg-error text-on-error hover:bg-error/90 font-bold flex items-center gap-1.5 shadow-xs disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isRestoring ? 'sync' : 'restore'}
                  </span>
                  {isRestoring ? 'Restoring Database...' : 'Confirm Overwrite & Restore'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
