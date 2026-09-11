import React, { useState, useMemo } from 'react';
import { AuditLogEntry, UserRole } from '../../types';

interface AuditLogsViewProps {
  logs: AuditLogEntry[];
  userRole: UserRole;
  filterUsername?: string;
  onClearUserFilter?: () => void;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({
  logs,
  userRole,
  filterUsername,
  onClearUserFilter
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [selectedUser, setSelectedUser] = useState<string>(filterUsername || 'ALL');
  const [inspectEntry, setInspectEntry] = useState<AuditLogEntry | null>(null);

  // Synchronize when filterUsername prop changes
  React.useEffect(() => {
    if (filterUsername) {
      setSelectedUser(filterUsername);
    }
  }, [filterUsername]);

  const uniqueModules = useMemo(() => {
    return Array.from(new Set(logs.map((l) => l.module))).sort();
  }, [logs]);

  const uniqueActions = useMemo(() => {
    return Array.from(new Set(logs.map((l) => l.action))).sort();
  }, [logs]);

  const uniqueUsers = useMemo(() => {
    return Array.from(new Set(logs.map((l) => l.username))).sort();
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchSearch =
        l.recordId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.ipAddress.includes(searchQuery);

      const matchMod = selectedModule === 'ALL' || l.module === selectedModule;
      const matchAct = selectedAction === 'ALL' || l.action === selectedAction;
      const matchUsr = selectedUser === 'ALL' || l.username === selectedUser;

      return matchSearch && matchMod && matchAct && matchUsr;
    });
  }, [logs, searchQuery, selectedModule, selectedAction, selectedUser]);

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Username', 'Action', 'Module', 'Record ID', 'Previous Value', 'New Value', 'IP Address', 'Status', 'Details'];
    const rows = filteredLogs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.username}"`,
      `"${l.action}"`,
      `"${l.module}"`,
      `"${l.recordId}"`,
      `"${l.previousValue.replace(/"/g, '""')}"`,
      `"${l.newValue.replace(/"/g, '""')}"`,
      `"${l.ipAddress}"`,
      `"${l.status}"`,
      `"${l.details.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `BIKE_ERP_AUDIT_LOGS_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  const getStatusBadge = (status: AuditLogEntry['status']) => {
    switch (status) {
      case 'Success':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
      case 'Warning':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
      case 'Denied':
      case 'Error':
        return 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20 font-bold';
      default:
        return 'bg-surface-container text-on-surface border-surface-container-high';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low p-4 rounded border border-surface-container-high">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-primary">history</span>
            <h1 className="text-lg font-bold text-on-surface tracking-tight">System Audit Trail & Compliance Ledger</h1>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-surface-container rounded border border-surface-container-high text-outline">
              Statutory GST Compliance
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Immutable, non-repudiation audit trail recording previous vs revised states for invoices, stock adjustments, rate alterations, and access attempts.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-1.5 rounded border border-surface-container-highest bg-surface hover:bg-surface-container-high text-on-surface text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
          Export Audit CSV
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-container-low p-3 rounded border border-surface-container-high flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-outline">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by record ID, action, user, or IP address..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface border border-surface-container-high rounded text-on-surface focus:outline-hidden focus:border-primary"
          />
        </div>

        {/* Module Filter */}
        <select
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
          className="px-2.5 py-1.5 text-xs bg-surface border border-surface-container-high rounded text-on-surface focus:outline-hidden focus:border-primary"
        >
          <option value="ALL">All Modules</option>
          {uniqueModules.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        {/* Action Filter */}
        <select
          value={selectedAction}
          onChange={(e) => setSelectedAction(e.target.value)}
          className="px-2.5 py-1.5 text-xs bg-surface border border-surface-container-high rounded text-on-surface focus:outline-hidden focus:border-primary"
        >
          <option value="ALL">All Actions</option>
          {uniqueActions.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        {/* User Filter */}
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="px-2.5 py-1.5 text-xs bg-surface border border-surface-container-high rounded text-on-surface focus:outline-hidden focus:border-primary"
        >
          <option value="ALL">All Users</option>
          {uniqueUsers.map((u) => (
            <option key={u} value={u}>@{u}</option>
          ))}
        </select>

        {(searchQuery || selectedModule !== 'ALL' || selectedAction !== 'ALL' || selectedUser !== 'ALL') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedModule('ALL');
              setSelectedAction('ALL');
              setSelectedUser('ALL');
              if (onClearUserFilter) onClearUserFilter();
            }}
            className="text-xs text-secondary hover:underline px-2 py-1"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Audit Log Table */}
      <div className="bg-surface-container-low border border-surface-container-high rounded overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container border-b border-surface-container-high text-outline uppercase font-semibold text-[11px] tracking-wider">
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">User</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Module</th>
                <th className="py-2.5 px-3">Record Ref</th>
                <th className="py-2.5 px-3">Previous State</th>
                <th className="py-2.5 px-3">New State</th>
                <th className="py-2.5 px-3">Terminal / IP</th>
                <th className="py-2.5 px-3 text-center">Result</th>
                <th className="py-2.5 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high text-on-surface">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-outline">
                    <span className="material-symbols-outlined text-3xl mb-1 block">search_off</span>
                    No audit log records match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((l) => (
                  <tr
                    key={l.id}
                    onClick={() => setInspectEntry(l)}
                    className="hover:bg-surface-container-highest/40 transition-colors cursor-pointer"
                  >
                    {/* Date/Time */}
                    <td className="py-2 px-3 font-mono text-[11px] text-outline whitespace-nowrap">
                      {l.timestamp}
                    </td>

                    {/* User */}
                    <td className="py-2 px-3 font-mono text-[11px] text-on-surface-variant font-medium">
                      @{l.username}
                    </td>

                    {/* Action */}
                    <td className="py-2 px-3 font-semibold text-on-surface whitespace-nowrap">
                      {l.action}
                    </td>

                    {/* Module */}
                    <td className="py-2 px-3">
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-surface-container text-outline border border-surface-container-high">
                        {l.module}
                      </span>
                    </td>

                    {/* Record */}
                    <td className="py-2 px-3 font-mono text-[11px] text-primary whitespace-nowrap">
                      {l.recordId}
                    </td>

                    {/* Prev Value */}
                    <td className="py-2 px-3 font-mono text-[11px] text-outline max-w-[130px] truncate">
                      {l.previousValue}
                    </td>

                    {/* New Value */}
                    <td className="py-2 px-3 font-mono text-[11px] text-on-surface font-medium max-w-[130px] truncate">
                      {l.newValue}
                    </td>

                    {/* IP / Device */}
                    <td className="py-2 px-3 font-mono text-[10px] text-outline whitespace-nowrap">
                      {l.ipAddress}
                    </td>

                    {/* Status */}
                    <td className="py-2 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadge(l.status)}`}>
                        {l.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectEntry(l);
                        }}
                        className="p-1 rounded hover:bg-surface-container text-outline hover:text-on-surface"
                        title="View Detailed Payload"
                      >
                        <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECT DETAIL MODAL */}
      {inspectEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest border border-surface-container-highest rounded shadow-2xl max-w-lg w-full overflow-hidden text-on-surface">
            {/* Header */}
            <div className="bg-surface-container-low px-5 py-3.5 border-b border-surface-container-high flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-primary">manage_search</span>
                <h3 className="font-bold text-sm tracking-tight text-on-surface">
                  Audit Entry: {inspectEntry.recordId}
                </h3>
              </div>
              <button
                onClick={() => setInspectEntry(null)}
                className="text-outline hover:text-on-surface rounded p-1"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Details */}
            <div className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-surface rounded border border-surface-container-high">
                <div>
                  <div className="text-[10px] text-outline uppercase font-semibold">Action Executed</div>
                  <div className="font-bold text-on-surface mt-0.5">{inspectEntry.action}</div>
                </div>
                <div>
                  <div className="text-[10px] text-outline uppercase font-semibold">Responsible User</div>
                  <div className="font-mono text-on-surface mt-0.5">@{inspectEntry.username}</div>
                </div>
                <div>
                  <div className="text-[10px] text-outline uppercase font-semibold">Module</div>
                  <div className="text-on-surface mt-0.5">{inspectEntry.module}</div>
                </div>
                <div>
                  <div className="text-[10px] text-outline uppercase font-semibold">Timestamp</div>
                  <div className="font-mono text-outline mt-0.5">{inspectEntry.timestamp}</div>
                </div>
                <div>
                  <div className="text-[10px] text-outline uppercase font-semibold">Client Terminal IP</div>
                  <div className="font-mono text-outline mt-0.5">{inspectEntry.ipAddress}</div>
                </div>
                <div>
                  <div className="text-[10px] text-outline uppercase font-semibold">Execution Outcome</div>
                  <div className="font-semibold text-on-surface mt-0.5">{inspectEntry.status}</div>
                </div>
              </div>

              {/* State Comparison */}
              <div className="space-y-2">
                <div className="font-semibold text-on-surface text-[11px] uppercase tracking-wider">
                  Delta State Comparison
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="p-2.5 bg-rose-500/5 border border-rose-500/20 rounded">
                    <div className="text-[10px] font-sans text-rose-700 dark:text-rose-400 font-bold mb-1">
                      PREVIOUS STATE
                    </div>
                    <div className="break-all whitespace-pre-wrap">{inspectEntry.previousValue}</div>
                  </div>
                  <div className="p-2.5 bg-emerald-500/5 border border-emerald-500/20 rounded">
                    <div className="text-[10px] font-sans text-emerald-700 dark:text-emerald-400 font-bold mb-1">
                      NEW REVISED STATE
                    </div>
                    <div className="break-all whitespace-pre-wrap">{inspectEntry.newValue}</div>
                  </div>
                </div>
              </div>

              {/* Details text */}
              <div>
                <div className="font-semibold text-on-surface text-[11px] mb-1">Audit Narrative</div>
                <p className="p-2.5 bg-surface-container rounded border border-surface-container-high text-on-surface-variant leading-relaxed">
                  {inspectEntry.details}
                </p>
              </div>

              {/* Footer Close */}
              <div className="pt-2 border-t border-surface-container-high flex justify-end">
                <button
                  type="button"
                  onClick={() => setInspectEntry(null)}
                  className="px-4 py-1.5 rounded bg-primary text-on-primary font-medium text-xs shadow-xs"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
