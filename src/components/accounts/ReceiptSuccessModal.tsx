import React from 'react';
import { ReceiptVoucher } from '../../types';

interface ReceiptSuccessModalProps {
  receipt: ReceiptVoucher | null;
  isOpen: boolean;
  onClose: () => void;
  onPrint: (r: ReceiptVoucher) => void;
  onNewReceipt: () => void;
}

export const ReceiptSuccessModal: React.FC<ReceiptSuccessModalProps> = ({
  receipt,
  isOpen,
  onClose,
  onPrint,
  onNewReceipt
}) => {
  if (!isOpen || !receipt) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest rounded-lg shadow-2xl border border-surface-container-high w-full max-w-md overflow-hidden text-xs">
        {/* Success Header Banner */}
        <div className="bg-emerald-600 text-white p-5 text-center space-y-1">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="material-symbols-outlined text-3xl text-white">check</span>
          </div>
          <h2 className="text-base font-bold tracking-wide uppercase">✓ RECEIPT RECORDED</h2>
          <p className="text-white/80 text-[11px]">Voucher successfully posted to customer ledger</p>
        </div>

        {/* Receipt Key Metrics */}
        <div className="p-5 space-y-3.5 bg-surface-container-lowest">
          <div className="p-3 rounded bg-surface-container-low border border-surface-container-high space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-outline">Receipt Number</span>
              <span className="font-mono font-bold text-secondary text-sm">{receipt.receiptNo}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-outline">Customer</span>
              <span className="font-bold text-on-surface">{receipt.customerName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-outline">Amount Received</span>
              <span className="font-mono font-bold text-base text-tertiary">
                ₹{receipt.amount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-outline">Payment Mode</span>
              <span className="font-mono font-semibold text-on-surface">
                {receipt.paymentMode} {receipt.refNo ? `(${receipt.refNo})` : ''}
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-surface-container">
              <span className="text-outline font-bold text-amber-800">New Outstanding Balance</span>
              <span className="font-mono font-bold text-amber-700 text-sm">
                ₹{receipt.newBalance.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-outline text-center">
            Date: <strong>{receipt.date} {receipt.time}</strong> • Recorded by <strong>{receipt.createdBy}</strong>
          </div>
        </div>

        {/* Modal Action Buttons: [ Print ] [ PDF ] [ Share ] [ New Receipt ] */}
        <div className="p-4 bg-surface-container border-t border-surface-container-high grid grid-cols-2 gap-2">
          <button
            onClick={() => onPrint(receipt)}
            className="py-2 px-3 bg-secondary hover:bg-secondary-container text-on-secondary rounded font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Print Voucher</span>
          </button>

          <button
            onClick={() => alert(`Downloaded receipt ${receipt.receiptNo} PDF.`)}
            className="py-2 px-3 bg-surface-container-low hover:bg-surface-container border border-surface-container-high text-on-surface rounded font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
            <span>Download PDF</span>
          </button>

          <button
            onClick={() => alert(`Shared receipt via WhatsApp & SMS to ${receipt.customerMobile}`)}
            className="py-2 px-3 bg-surface-container-low hover:bg-surface-container border border-surface-container-high text-on-surface rounded font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">share</span>
            <span>WhatsApp / Share</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onNewReceipt();
            }}
            className="py-2 px-3 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>+ New Receipt</span>
          </button>
        </div>
      </div>
    </div>
  );
};
