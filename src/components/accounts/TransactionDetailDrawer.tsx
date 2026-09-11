import React from 'react';
import { CustomerLedgerEntry, SupplierLedgerEntry, UserRole } from '../../types';

interface TransactionDetailDrawerProps {
  entry: CustomerLedgerEntry | SupplierLedgerEntry | null;
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
  onViewInvoice?: (invNumber: string) => void;
  onViewReceipt?: (receiptNumber: string) => void;
  onViewPayment?: (paymentNumber: string) => void;
  onRequestReversal?: (entry: CustomerLedgerEntry | SupplierLedgerEntry) => void;
}

export const TransactionDetailDrawer: React.FC<TransactionDetailDrawerProps> = ({
  entry,
  isOpen,
  onClose,
  userRole,
  onViewInvoice,
  onViewReceipt,
  onViewPayment,
  onRequestReversal
}) => {
  if (!isOpen || !entry) return null;

  const refNumber =
    ('invoice' in entry && entry.invoice) ||
    ('receiptNo' in entry && entry.receiptNo) ||
    ('purchase' in entry && entry.purchase) ||
    ('paymentNo' in entry && entry.paymentNo) ||
    '—';

  const amount = entry.debit > 0 ? entry.debit : entry.credit;
  const isDebit = entry.debit > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-surface-container-lowest shadow-2xl border-l border-surface-container-high flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 bg-surface-container border-b border-surface-container-high flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">description</span>
            <div>
              <h3 className="font-headline-md text-sm font-bold text-on-surface">
                Transaction Detail
              </h3>
              <p className="text-[11px] text-outline">Ref: {refNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Amount Badge */}
          <div className="p-4 rounded-lg bg-surface-container-low border border-surface-container-high text-center">
            <div className="text-[11px] font-bold text-outline uppercase tracking-wider">
              Transaction Value
            </div>
            <div className="font-mono text-2xl font-bold text-on-surface mt-1 flex items-center justify-center gap-2">
              <span>₹{amount.toLocaleString('en-IN')}</span>
              <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                isDebit ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {isDebit ? 'DEBIT (Dr)' : 'CREDIT (Cr)'}
              </span>
            </div>
            <div className="text-[11px] text-outline mt-1">
              Resulting Balance: <strong>₹{entry.balance.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          {/* Key Properties Grid */}
          <div className="space-y-2.5 bg-surface-container-lowest border border-surface-container-high rounded p-3.5">
            <div className="flex items-center justify-between py-1 border-b border-surface-container">
              <span className="text-outline">Transaction Type</span>
              <span className="px-2 py-0.5 rounded bg-surface-container font-bold text-[11px] uppercase text-on-surface">
                {entry.type}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-surface-container">
              <span className="text-outline">Reference Number</span>
              <span className="font-mono font-bold text-secondary">{refNumber}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-surface-container">
              <span className="text-outline">Date of Entry</span>
              <span className="font-mono text-on-surface">{entry.date}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-surface-container">
              <span className="text-outline">Payment / Accounting Status</span>
              <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-bold text-[10px]">
                RECONCILED &amp; POSTED
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-surface-container">
              <span className="text-outline">Created By</span>
              <span className="font-medium text-on-surface">{entry.createdBy}</span>
            </div>

            <div className="py-1">
              <span className="text-outline block mb-0.5">Particulars / Description</span>
              <p className="text-on-surface bg-surface-container-low p-2 rounded text-[11px] font-medium leading-relaxed">
                {entry.particular}
              </p>
            </div>
          </div>

          {/* Audit Trail Note */}
          <div className="p-3 bg-surface-container-low rounded border border-surface-container-high text-[11px] text-outline space-y-1">
            <div className="flex items-center gap-1 font-bold text-on-surface">
              <span className="material-symbols-outlined text-[14px] text-secondary">verified</span>
              <span>Double-Entry Integrity Check</span>
            </div>
            <p>
              This transaction is posted in the subledger and automatically synced with General Ledger balances. Changes require an audited reversal entry.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-surface-container border-t border-surface-container-high flex flex-col gap-2">
          {/* Dynamic Action based on document type */}
          {('invoice' in entry && entry.invoice) && onViewInvoice && (
            <button
              onClick={() => {
                onClose();
                onViewInvoice(entry.invoice!);
              }}
              className="w-full py-2 bg-secondary hover:bg-secondary-container text-on-secondary rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">receipt_long</span>
              <span>View Invoice [{entry.invoice}]</span>
            </button>
          )}

          {('receiptNo' in entry && entry.receiptNo) && onViewReceipt && (
            <button
              onClick={() => {
                onClose();
                onViewReceipt(entry.receiptNo!);
              }}
              className="w-full py-2 bg-secondary hover:bg-secondary-container text-on-secondary rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">receipt</span>
              <span>View Receipt [{entry.receiptNo}]</span>
            </button>
          )}

          {('paymentNo' in entry && entry.paymentNo) && onViewPayment && (
            <button
              onClick={() => {
                onClose();
                onViewPayment(entry.paymentNo!);
              }}
              className="w-full py-2 bg-primary hover:bg-primary/90 text-on-primary rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">payments</span>
              <span>View Payment Voucher [{entry.paymentNo}]</span>
            </button>
          )}

          {/* Reversal / Void Action */}
          {onRequestReversal && (
            <div>
              {userRole !== 'billing_operator' ? (
                <button
                  onClick={() => onRequestReversal(entry)}
                  className="w-full py-1.5 bg-surface-container-low hover:bg-error-container text-error rounded text-xs font-bold flex items-center justify-center gap-1 transition-colors border border-surface-container-high"
                >
                  <span className="material-symbols-outlined text-[14px]">history</span>
                  <span>Void / Reverse Transaction</span>
                </button>
              ) : (
                <div className="text-center text-[11px] text-outline italic py-1">
                  Reversal restricted for Billing Operator role
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
