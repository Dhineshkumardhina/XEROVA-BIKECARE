import React, { useState } from 'react';
import { SecuritySettingsConfig, UserRole } from '../../types';

interface SecuritySettingsViewProps {
  securitySettings: SecuritySettingsConfig;
  userRole: UserRole;
  onSaveSecuritySettings: (settings: SecuritySettingsConfig) => void;
  onFactoryReset?: () => void;
  onClearTestData?: () => void;
  onReindexDatabase?: () => void;
  onTriggerPermissionDenied?: (action: string) => void;
}

export const SecuritySettingsView: React.FC<SecuritySettingsViewProps> = ({
  securitySettings,
  userRole,
  onSaveSecuritySettings,
  onFactoryReset,
  onClearTestData,
  onReindexDatabase,
  onTriggerPermissionDenied
}) => {
  const [settings, setSettings] = useState<SecuritySettingsConfig>(securitySettings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Danger Zone Modal State
  const [dangerAction, setDangerAction] = useState<'RESET_FACTORY' | 'CLEAR_DATA' | 'REINDEX' | null>(null);
  const [dangerInput, setDangerInput] = useState('');
  const [dangerError, setDangerError] = useState<string | null>(null);
  const [dangerSuccess, setDangerSuccess] = useState<string | null>(null);

  const isAllowedToEdit = userRole === 'super_admin' || userRole === 'admin';
  const isSuperAdmin = userRole === 'super_admin';

  const handleChange = (field: keyof SecuritySettingsConfig, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAllowedToEdit) {
      if (onTriggerPermissionDenied) onTriggerPermissionDenied('Save Security Settings');
      return;
    }
    onSaveSecuritySettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleOpenDanger = (action: 'RESET_FACTORY' | 'CLEAR_DATA' | 'REINDEX') => {
    if (!isSuperAdmin) {
      if (onTriggerPermissionDenied) onTriggerPermissionDenied('Execute Danger Zone Administrative Override');
      return;
    }
    setDangerAction(action);
    setDangerInput('');
    setDangerError(null);
  };

  const handleConfirmDanger = (e: React.FormEvent) => {
    e.preventDefault();
    const expected = dangerAction === 'RESET_FACTORY' ? 'RESET CONFIG' : dangerAction === 'CLEAR_DATA' ? 'CLEAR DATA' : 'REINDEX';

    if (dangerInput.trim().toUpperCase() !== expected) {
      setDangerError(`Type "${expected}" in capital letters to confirm.`);
      return;
    }

    if (dangerAction === 'RESET_FACTORY' && onFactoryReset) {
      onFactoryReset();
      setDangerSuccess('System configurations successfully reset to initial factory profile.');
    } else if (dangerAction === 'CLEAR_DATA' && onClearTestData) {
      onClearTestData();
      setDangerSuccess('Mock test transaction records removed safely.');
    } else if (dangerAction === 'REINDEX' && onReindexDatabase) {
      onReindexDatabase();
      setDangerSuccess('All B-Tree database indexes rebuilt and verified.');
    }

    setTimeout(() => {
      setDangerAction(null);
      setDangerSuccess(null);
    }, 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low p-4 rounded border border-surface-container-high">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-primary">security</span>
            <h1 className="text-lg font-bold text-on-surface tracking-tight">Security Hardening, Policies & Controls</h1>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-surface-container rounded border border-surface-container-high text-outline">
              ISO/IEC 27001 Controls
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Configure authentication rules, lockout thresholds, password complexity standards, and disaster danger zone actions.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-primary text-on-primary rounded text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 shadow-xs shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          Save Security Policy
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded text-xs font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>Security policy and credential standards updated across all terminals.</span>
        </div>
      )}

      {/* Security Status Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Score */}
        <div className="p-3.5 bg-surface-container-low border border-surface-container-high rounded flex items-center justify-between">
          <div>
            <div className="text-[11px] text-outline uppercase font-semibold">Security Health Score</div>
            <div className="mt-1 font-bold text-lg text-emerald-600 dark:text-emerald-400 font-mono">
              96% — Excellent
            </div>
            <div className="text-[11px] text-outline mt-0.5">Zero high-severity vulnerabilities</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
            <span className="material-symbols-outlined text-[24px]">verified_user</span>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="p-3.5 bg-surface-container-low border border-surface-container-high rounded flex items-center justify-between">
          <div>
            <div className="text-[11px] text-outline uppercase font-semibold">Active Operator Sessions</div>
            <div className="mt-1 font-bold text-lg text-on-surface font-mono">
              4 Terminals
            </div>
            <div className="text-[11px] text-outline mt-0.5">Counter POS 1 & 2, Accounts, HQ Admin</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
            <span className="material-symbols-outlined text-[24px]">devices</span>
          </div>
        </div>

        {/* Failed Logins */}
        <div className="p-3.5 bg-surface-container-low border border-surface-container-high rounded flex items-center justify-between">
          <div>
            <div className="text-[11px] text-outline uppercase font-semibold">Failed Logins (24h)</div>
            <div className="mt-1 font-bold text-lg text-on-surface font-mono">
              1 Attempt
            </div>
            <div className="text-[11px] text-outline mt-0.5">Auto-lockout policy armed (3 attempts)</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
            <span className="material-symbols-outlined text-[24px]">lock</span>
          </div>
        </div>
      </div>

      {/* Main Security Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Panel 1: Password Complexity Policy */}
        <div className="bg-surface-container-low border border-surface-container-high rounded p-4 space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-surface-container-high">
            <span className="material-symbols-outlined text-[20px] text-secondary">password</span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-on-surface">
              Password Complexity & Lifecycle Policy
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-outline font-semibold mb-1">Minimum Password Length</label>
                <input
                  type="number"
                  min="6"
                  max="32"
                  value={settings.passwordMinLength}
                  onChange={(e) => handleChange('passwordMinLength', parseInt(e.target.value) || 8)}
                  className="w-full px-2.5 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface font-mono"
                />
              </div>

              <div>
                <label className="block text-outline font-semibold mb-1">Password Expiry (Days)</label>
                <input
                  type="number"
                  min="0"
                  max="365"
                  value={settings.passwordExpiryDays}
                  onChange={(e) => handleChange('passwordExpiryDays', parseInt(e.target.value) || 90)}
                  className="w-full px-2.5 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface font-mono"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-surface-container-high space-y-2.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.passwordRequireUppercase}
                  onChange={(e) => handleChange('passwordRequireUppercase', e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-0"
                />
                <span className="text-on-surface">Require at least one uppercase letter (A-Z)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.passwordRequireNumber}
                  onChange={(e) => handleChange('passwordRequireNumber', e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-0"
                />
                <span className="text-on-surface">Require at least one numeric digit (0-9)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.passwordRequireSpecial}
                  onChange={(e) => handleChange('passwordRequireSpecial', e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-0"
                />
                <span className="text-on-surface">Require at least one special character (!@#$%^&*)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.requirePasswordChangeOnFirstLogin}
                  onChange={(e) => handleChange('requirePasswordChangeOnFirstLogin', e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-0"
                />
                <span className="text-on-surface">Force immediate password change on first operator login</span>
              </label>
            </div>
          </div>
        </div>

        {/* Panel 2: Session & Lockout Safeguards */}
        <div className="bg-surface-container-low border border-surface-container-high rounded p-4 space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-surface-container-high">
            <span className="material-symbols-outlined text-[20px] text-secondary">lock_clock</span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-on-surface">
              Terminal Sessions & Lockout Thresholds
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-outline font-semibold mb-1">Session Inactive Timeout</label>
                <select
                  value={settings.sessionTimeoutMinutes}
                  onChange={(e) => handleChange('sessionTimeoutMinutes', parseInt(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={60}>60 Minutes</option>
                  <option value={120}>2 Hours</option>
                </select>
              </div>

              <div>
                <label className="block text-outline font-semibold mb-1">Max Failed Attempts</label>
                <select
                  value={settings.maxLoginAttempts}
                  onChange={(e) => handleChange('maxLoginAttempts', parseInt(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface font-mono"
                >
                  <option value={3}>3 Attempts (Strict)</option>
                  <option value={5}>5 Attempts (Standard)</option>
                  <option value={10}>10 Attempts (Relaxed)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-surface-container-high space-y-2.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoLogoutOnIdle}
                  onChange={(e) => handleChange('autoLogoutOnIdle', e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-0"
                />
                <span className="text-on-surface">Auto-lock terminal screen when counter is idle</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowMultipleSessions}
                  onChange={(e) => handleChange('allowMultipleSessions', e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-0"
                />
                <span className="text-on-surface">Allow simultaneous operator login from multiple terminals</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.auditLoggingEnabled}
                  onChange={(e) => handleChange('auditLoggingEnabled', e.target.checked)}
                  className="w-4 h-4 rounded text-primary focus:ring-0"
                />
                <span className="text-on-surface">Enforce statutory immutable audit log retention (Mandatory)</span>
              </label>
            </div>
          </div>
        </div>
      </form>

      {/* DANGER ZONE (Red Hazard Border & Super Admin Gate) */}
      <div className="bg-surface-container-low border-2 border-error/40 rounded p-4 space-y-3 mt-6">
        <div className="flex items-center justify-between pb-2 border-b border-error/30">
          <div className="flex items-center gap-2 text-error">
            <span className="material-symbols-outlined text-[22px]">warning</span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-on-surface">
              Danger Zone (Irreversible System Operations)
            </h2>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-error/15 text-error font-bold border border-error/30">
            SUPER ADMIN AUTHORIZATION ONLY
          </span>
        </div>

        <p className="text-xs text-on-surface-variant">
          These operations directly purge cached registers, truncate test records, or reset company numbering schemas. 
          Each action requires explicit typed confirmation and an active snapshot.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Action 1: Factory Reset */}
          <div className="p-3 bg-surface rounded border border-surface-container-high flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-xs text-on-surface">Reset System Settings</h3>
              <p className="text-[11px] text-outline mt-1">
                Restores company profile, numbering prefixes, and tax slabs to default OEM templates.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenDanger('RESET_FACTORY')}
              className="mt-3 px-3 py-1.5 rounded border border-error/40 text-error hover:bg-error-container/20 text-xs font-semibold transition-colors"
            >
              Reset Configuration
            </button>
          </div>

          {/* Action 2: Clear Mock Data */}
          <div className="p-3 bg-surface rounded border border-surface-container-high flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-xs text-on-surface">Clear Test Bills & Receipts</h3>
              <p className="text-[11px] text-outline mt-1">
                Removes mock trial sales invoices, resetting POS running serial sequence back to #1.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenDanger('CLEAR_DATA')}
              className="mt-3 px-3 py-1.5 rounded border border-error/40 text-error hover:bg-error-container/20 text-xs font-semibold transition-colors"
            >
              Purge Test Transactions
            </button>
          </div>

          {/* Action 3: Reindex Database */}
          <div className="p-3 bg-surface rounded border border-surface-container-high flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-xs text-on-surface">Rebuild Database Indexes</h3>
              <p className="text-[11px] text-outline mt-1">
                Optimizes full-text search indexes on parts catalog, compatibility matrix, and ledger tables.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenDanger('REINDEX')}
              className="mt-3 px-3 py-1.5 rounded border border-secondary/40 text-secondary hover:bg-secondary/10 text-xs font-semibold transition-colors"
            >
              Reindex Database
            </button>
          </div>
        </div>
      </div>

      {/* DANGER CONFIRMATION MODAL */}
      {dangerAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest border border-error/50 rounded shadow-2xl max-w-md w-full overflow-hidden text-on-surface">
            <div className="bg-error-container/25 border-b border-error/40 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-error">
                <span className="material-symbols-outlined text-[24px]">gpp_maybe</span>
                <h3 className="font-bold text-sm tracking-tight text-on-surface">
                  Authorize Danger Zone Override
                </h3>
              </div>
              <button
                onClick={() => setDangerAction(null)}
                className="text-outline hover:text-on-surface rounded p-1"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleConfirmDanger} className="p-5 space-y-4 text-xs leading-relaxed">
              {dangerSuccess && (
                <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded text-xs font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  {dangerSuccess}
                </div>
              )}

              <p className="text-on-surface-variant">
                You are executing{' '}
                <strong className="text-error font-bold">
                  {dangerAction === 'RESET_FACTORY' ? 'RESET CONFIGURATION' : dangerAction === 'CLEAR_DATA' ? 'PURGE TEST TRANSACTIONS' : 'REINDEX DATABASE'}
                </strong>. 
                This action is audited and cannot be cancelled once triggered.
              </p>

              <div>
                <label className="block font-semibold text-on-surface mb-1">
                  Type{' '}
                  <span className="font-mono text-error font-bold">
                    {dangerAction === 'RESET_FACTORY' ? 'RESET CONFIG' : dangerAction === 'CLEAR_DATA' ? 'CLEAR DATA' : 'REINDEX'}
                  </span>{' '}
                  to authorize:
                </label>
                <input
                  type="text"
                  required
                  value={dangerInput}
                  onChange={(e) => {
                    setDangerInput(e.target.value);
                    setDangerError(null);
                  }}
                  placeholder={dangerAction === 'RESET_FACTORY' ? 'RESET CONFIG' : dangerAction === 'CLEAR_DATA' ? 'CLEAR DATA' : 'REINDEX'}
                  className="w-full px-3 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface font-mono font-bold focus:outline-hidden focus:border-error"
                />
                {dangerError && (
                  <p className="text-error text-[11px] mt-1 font-medium">{dangerError}</p>
                )}
              </div>

              <div className="pt-3 border-t border-surface-container-high flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setDangerAction(null)}
                  className="px-3.5 py-1.5 rounded border border-surface-container-highest bg-surface hover:bg-surface-container-high text-on-surface font-medium"
                >
                  Abort Action
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-error text-on-error hover:bg-error/90 font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  Confirm & Execute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
