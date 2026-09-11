import React, { useState } from 'react';
import { PaymentModeConfig, UserRole } from '../../types';

interface PaymentModesViewProps {
  paymentModes: PaymentModeConfig[];
  userRole: UserRole;
  onSavePaymentModes: (modes: PaymentModeConfig[]) => void;
  onTriggerPermissionDenied?: (action: string) => void;
}

export const PaymentModesView: React.FC<PaymentModesViewProps> = ({
  paymentModes,
  userRole,
  onSavePaymentModes,
  onTriggerPermissionDenied
}) => {
  const [modes, setModes] = useState<PaymentModeConfig[]>(paymentModes);
  const [editingMode, setEditingMode] = useState<PaymentModeConfig | null>(null);

  const isAllowedToEdit = userRole === 'super_admin' || userRole === 'admin';

  const handleToggleActive = (id: string) => {
    if (!isAllowedToEdit) {
      if (onTriggerPermissionDenied) onTriggerPermissionDenied('Toggle Payment Mode');
      return;
    }
    const next = modes.map((m) => (m.id === id ? { ...m, isEnabled: !m.isEnabled } : m));
    setModes(next);
    onSavePaymentModes(next);
  };

  const handleToggleRefRequired = (id: string) => {
    if (!isAllowedToEdit) {
      if (onTriggerPermissionDenied) onTriggerPermissionDenied('Update Payment Mode Settings');
      return;
    }
    const next = modes.map((m) => (m.id === id ? { ...m, requiresReference: !m.requiresReference } : m));
    setModes(next);
    onSavePaymentModes(next);
  };

  const handleOpenEdit = (mode: PaymentModeConfig) => {
    if (!isAllowedToEdit) {
      if (onTriggerPermissionDenied) onTriggerPermissionDenied('Edit Payment Mode');
      return;
    }
    setEditingMode({ ...mode });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMode) {
      const next = modes.map((m) => (m.id === editingMode.id ? editingMode : m));
      setModes(next);
      onSavePaymentModes(next);
      setEditingMode(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low p-4 rounded border border-surface-container-high">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-primary">payments</span>
            <h1 className="text-lg font-bold text-on-surface tracking-tight">Payment Modes & Ledger Accounts</h1>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-surface-container rounded border border-surface-container-high text-outline">
              Counter POS & Receipt Vouchers
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Configure tender methods, UTR transaction reference mandates, and automated financial accounting ledger mapping.
          </p>
        </div>
      </div>

      {/* Payment Modes Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {modes.map((m) => (
          <div
            key={m.id}
            className={`p-4 rounded border transition-colors flex flex-col justify-between ${
              m.isEnabled
                ? 'bg-surface-container-low border-surface-container-high'
                : 'bg-surface-container-highest/20 border-surface-container-high/40 opacity-70'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-surface-container-high">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded border ${
                    m.isEnabled ? 'bg-primary-container text-on-primary-container border-primary/20' : 'bg-surface-container text-outline border-surface-container-high'
                  }`}>
                    <span className="material-symbols-outlined text-[20px]">{m.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-on-surface">{m.displayName}</h3>
                    <div className="text-[11px] font-mono text-outline">{m.key}</div>
                  </div>
                </div>

                {/* Enable/Disable Toggle */}
                <button
                  onClick={() => handleToggleActive(m.id)}
                  className={`text-xs px-2.5 py-1 rounded font-semibold border flex items-center gap-1 transition-colors ${
                    m.isEnabled
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25'
                      : 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/25'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${m.isEnabled ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                  {m.isEnabled ? 'Active' : 'Disabled'}
                </button>
              </div>

              {/* Details & Ledger Account */}
              <div className="py-3 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-outline">Ledger Account:</span>
                  <span className="font-medium text-on-surface font-mono bg-surface px-1.5 py-0.5 rounded border border-surface-container-high">
                    {m.accountMapping}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-outline">Reference Mandate:</span>
                  <button
                    onClick={() => handleToggleRefRequired(m.id)}
                    className={`font-semibold cursor-pointer text-[11px] ${
                      m.requiresReference ? 'text-secondary' : 'text-outline'
                    }`}
                  >
                    {m.requiresReference ? 'Mandatory (e.g. UTR / Cheque)' : 'Optional'}
                  </button>
                </div>

                <div className="text-[11px] text-outline pt-1">
                  {m.description}
                </div>
              </div>
            </div>

            <div className="pt-2.5 border-t border-surface-container-high flex items-center justify-end">
              <button
                onClick={() => handleOpenEdit(m)}
                className="px-2.5 py-1 rounded bg-surface border border-surface-container-high hover:bg-surface-container text-on-surface text-xs flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">tune</span>
                Configure
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {editingMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest border border-surface-container-highest rounded shadow-2xl max-w-sm w-full overflow-hidden text-on-surface">
            <div className="bg-surface-container-low px-4 py-3 border-b border-surface-container-high flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">{editingMode.icon}</span>
                <h3 className="font-bold text-xs tracking-tight text-on-surface">
                  Configure {editingMode.displayName}
                </h3>
              </div>
              <button
                onClick={() => setEditingMode(null)}
                className="text-outline hover:text-on-surface rounded p-1"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-outline font-semibold mb-1">Display Label *</label>
                <input
                  type="text"
                  required
                  value={editingMode.displayName}
                  onChange={(e) => setEditingMode({ ...editingMode, displayName: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface"
                />
              </div>

              <div>
                <label className="block text-outline font-semibold mb-1">Financial Ledger Account Mapping</label>
                <select
                  value={editingMode.accountMapping}
                  onChange={(e) => setEditingMode({ ...editingMode, accountMapping: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface font-mono"
                >
                  <option value="Cash-in-Hand (Main Counter)">Cash-in-Hand (Main Counter)</option>
                  <option value="HDFC Bank Current A/c - 1928">HDFC Bank Current A/c - 1928</option>
                  <option value="HDFC Bank - UPI QR Settlement">HDFC Bank - UPI QR Settlement</option>
                  <option value="ICICI POS Card Settlement A/c">ICICI POS Card Settlement A/c</option>
                  <option value="Cheques in Hand / Clearing">Cheques in Hand / Clearing</option>
                  <option value="Sundry Debtors Control Account">Sundry Debtors Control Account</option>
                </select>
              </div>

              <div className="pt-2 border-t border-surface-container-high space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingMode.requiresReference}
                    onChange={(e) => setEditingMode({ ...editingMode, requiresReference: e.target.checked })}
                    className="w-4 h-4 rounded text-primary focus:ring-0"
                  />
                  <div>
                    <div className="font-semibold text-on-surface">Require Reference Number</div>
                    <div className="text-[11px] text-outline">Forces operator to record UTR or Cheque number during billing</div>
                  </div>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingMode.isEnabled}
                    onChange={(e) => setEditingMode({ ...editingMode, isEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-primary focus:ring-0"
                  />
                  <div>
                    <div className="font-semibold text-on-surface">Enable in Fast Counter POS</div>
                    <div className="text-[11px] text-outline">Display as active tender button on billing screen</div>
                  </div>
                </label>
              </div>

              <div className="pt-2 border-t border-surface-container-high flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingMode(null)}
                  className="px-3 py-1 rounded border border-surface-container-highest bg-surface hover:bg-surface-container-high text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded bg-primary text-on-primary hover:bg-primary/90 font-medium"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
