import React, { useState, useEffect } from 'react';

export type ConfirmationType =
  | 'void_invoice'
  | 'cancel_purchase'
  | 'reverse_receipt'
  | 'reverse_payment'
  | 'restore_backup'
  | 'stock_adjustment'
  | 'delete_item'
  | 'delete_user'
  | 'generic';

interface ConfirmationModalProps {
  isOpen: boolean;
  type?: ConfirmationType;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  requiresReason?: boolean;
  reasonPlaceholder?: string;
  auditWarning?: string;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  type = 'generic',
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  isDestructive = true,
  requiresReason = false,
  reasonPlaceholder = 'Enter mandatory reason for audit trail...',
  auditWarning = 'This financial action will be permanently recorded in the system audit logs.',
  onConfirm,
  onCancel
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const handleExecute = () => {
    if (requiresReason && !reason.trim()) {
      setError('Please provide a reason before confirming this action.');
      return;
    }
    onConfirm(reason);
  };

  // Default explicit action labels based on type
  const defaultActionLabels: Record<ConfirmationType, string> = {
    void_invoice: 'Void Invoice',
    cancel_purchase: 'Cancel Purchase',
    reverse_receipt: 'Reverse Receipt',
    reverse_payment: 'Reverse Payment',
    restore_backup: 'Restore Backup',
    stock_adjustment: 'Confirm Stock Adjustment',
    delete_item: 'Delete SKU',
    delete_user: 'Disable User',
    generic: 'Confirm Action'
  };

  const finalConfirmLabel = confirmLabel || defaultActionLabels[type];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-lg shadow-2xl border border-surface-container-highest overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-surface-container border-b border-surface-container-high flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`material-symbols-outlined text-[20px] ${
                isDestructive ? 'text-error' : 'text-secondary'
              }`}
            >
              {isDestructive ? 'warning' : 'help'}
            </span>
            <h3 className="font-headline-md text-sm font-bold text-on-surface">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-outline hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3 text-xs">
          <p className="text-on-surface leading-relaxed">{message}</p>

          {/* Reason Input for Audit Logs */}
          {requiresReason && (
            <div className="space-y-1 pt-1">
              <label className="font-label-caps text-label-caps text-outline uppercase font-semibold">
                Reason / Audit Justification <span className="text-error">*</span>
              </label>
              <textarea
                autoFocus
                rows={2}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (error) setError(null);
                }}
                placeholder={reasonPlaceholder}
                className="w-full p-2 bg-surface-container-low border border-surface-container-highest rounded text-xs text-on-surface focus:outline-none focus:border-secondary"
              />
              {error && <div className="text-[11px] text-error font-medium">{error}</div>}
            </div>
          )}

          {/* Audit Notification Banner */}
          {auditWarning && (
            <div className="p-2.5 rounded bg-surface-container border border-surface-container-high flex items-start gap-2 text-[11px] text-outline">
              <span className="material-symbols-outlined text-secondary text-[16px] flex-shrink-0 mt-0.5">
                verified_user
              </span>
              <span>{auditWarning}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-surface-container border-t border-surface-container-high flex items-center justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-1.5 rounded border border-surface-container-highest bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold transition-colors"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={handleExecute}
            className={`px-4 py-1.5 rounded font-bold transition-colors shadow-xs ${
              isDestructive
                ? 'bg-error hover:bg-error/90 text-on-error'
                : 'bg-secondary hover:bg-secondary-container text-on-secondary'
            }`}
          >
            {finalConfirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
