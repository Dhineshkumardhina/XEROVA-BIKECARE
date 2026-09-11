import React, { useState } from 'react';
import { CustomerLedgerEntry, SupplierLedgerEntry, ReceiptVoucher, PaymentVoucher } from '../../types';

interface ReversalConfirmationModalProps {
  target: CustomerLedgerEntry | SupplierLedgerEntry | ReceiptVoucher | PaymentVoucher | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmReversal: (target: any, reason: string) => void;
}

export const ReversalConfirmationModal: React.FC<ReversalConfirmationModalProps> = ({
  target,
  isOpen,
  onClose,
  onConfirmReversal
}) => {
  const [reason, setReason] = useState<string>('Incorrect customer account selected by billing operator');

  if (!isOpen || !target) return null;

  const refNumber =
    ('receiptNo' in target && target.receiptNo) ||
    ('paymentNo' in target && target.paymentNo) ||
    ('invoice' in target && target.invoice) ||
    ('particular' in target && target.particular) ||
    'Transaction';

  const amount =
    'amount' in target
      ? target.amount
      : 'debit' in target && target.debit > 0
      ? target.debit
      : 'credit' in target
      ? target.credit
      : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150 text-xs">
      <div className="bg-surface-container-lowest rounded-lg shadow-2xl border border-surface-container-high w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-surface-container border-b border-surface-container-high flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-error text-[22px]">history</span>
            <div>
              <h2 className="font-headline-md text-base font-bold text-on-surface">
                Audited Ledger Reversal
              </h2>
              <p className="text-[11px] text-outline">Non-destructive financial correction</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-surface-container-high text-outline hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded text-amber-900 space-y-1">
            <div className="font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">info</span>
              <span>Audit Compliance Notice</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Accounting principles strictly prohibit deleting ledger entries. This action will create an opposite <strong>Reversal Contra Entry</strong> preserving the entire audit history and balancing the book.
            </p>
          </div>

          <div className="p-3 rounded bg-surface-container-low border border-surface-container-high space-y-2">
            <div className="flex justify-between">
              <span className="text-outline">Transaction to Reverse:</span>
              <span className="font-mono font-bold text-on-surface">{refNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">Amount:</span>
              <span className="font-mono font-bold text-base text-error">
                ₹{amount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-outline font-medium mb-1">
              Audit Narration / Reason for Reversal <span className="text-error">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide reason for reversing this financial entry..."
              className="w-full p-2.5 bg-surface-container-low border border-surface-container-high rounded text-xs text-on-surface focus:outline-none focus:border-secondary"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface-container border-t border-surface-container-high flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-surface-container-low hover:bg-surface-container text-on-surface rounded text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirmReversal(target, reason)}
            className="px-4 py-2 bg-error hover:bg-error/90 text-white rounded text-xs font-bold shadow-xs flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">undo</span>
            <span>Confirm Reversal Entry</span>
          </button>
        </div>
      </div>
    </div>
  );
};
