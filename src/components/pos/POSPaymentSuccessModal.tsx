import React from 'react';
import { Invoice } from '../../types';

interface POSPaymentSuccessModalProps {
  invoice: Invoice | null;
  onClose: () => void;
  onPrint: (invoice: Invoice, format?: 'A4' | 'A5' | 'Thermal') => void;
  onNewSale: () => void;
}

export const POSPaymentSuccessModal: React.FC<POSPaymentSuccessModalProps> = ({
  invoice,
  onClose,
  onPrint,
  onNewSale
}) => {
  if (!invoice) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-lg shadow-2xl border border-surface-container-highest overflow-hidden text-xs">
        {/* Header Strip with Check Icon */}
        <div className="bg-secondary p-4 text-on-secondary flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[20px]">check</span>
            </div>
            <div>
              <h3 className="font-bold text-base tracking-wide">✓ SALE COMPLETED</h3>
              <span className="text-[11px] text-on-secondary/80">Stock deducted • GST Ledger Updated</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-on-secondary/80 hover:text-white p-1 rounded"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Invoice Summary Details */}
        <div className="p-5 space-y-3 bg-surface-container-lowest">
          <div className="bg-surface-container-low p-3 rounded-md space-y-2 border border-surface-container-high font-mono">
            <div className="flex justify-between items-center">
              <span className="text-outline uppercase text-[10px]">Invoice Number:</span>
              <span className="font-bold text-sm text-secondary">{invoice.id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-outline uppercase text-[10px]">Customer:</span>
              <span className="font-bold text-on-surface">{invoice.customerName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-outline uppercase text-[10px]">Payment Mode:</span>
              <span className="font-bold text-on-surface">{invoice.payMode}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-surface-container-high">
              <span className="text-outline uppercase text-[11px] font-bold">Total Paid:</span>
              <span className="font-bold text-xl text-secondary">
                ₹{invoice.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Print Format Options */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] uppercase font-bold text-outline block">Quick Print Formats:</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onPrint(invoice, 'A4')}
                className="py-2 px-2 bg-surface-container hover:bg-surface-container-high rounded border border-surface-container-highest text-center font-semibold text-on-surface flex flex-col items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Print A4</span>
              </button>

              <button
                type="button"
                onClick={() => onPrint(invoice, 'A5')}
                className="py-2 px-2 bg-surface-container hover:bg-surface-container-high rounded border border-surface-container-highest text-center font-semibold text-on-surface flex flex-col items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                <span>Print A5</span>
              </button>

              <button
                type="button"
                onClick={() => onPrint(invoice, 'Thermal')}
                className="py-2 px-2 bg-surface-container hover:bg-surface-container-high rounded border border-surface-container-highest text-center font-semibold text-on-surface flex flex-col items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">receipt</span>
                <span>Thermal 3"</span>
              </button>
            </div>
          </div>

          {/* Secondary Actions: Download, Share, New Sale */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-surface-container-high">
            <button
              type="button"
              onClick={() => {
                alert(`PDF for invoice ${invoice.id} downloaded.`);
              }}
              className="py-2 px-3 bg-surface-container-low hover:bg-surface-container rounded font-semibold text-on-surface flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Download PDF</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const phone = invoice.customerPhone ? invoice.customerPhone.replace(/\D/g, '') : '';
                alert(`Invoice ${invoice.id} shared via WhatsApp to ${phone || 'customer'}.`);
              }}
              className="py-2 px-3 bg-surface-container-low hover:bg-surface-container rounded font-semibold text-on-surface flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">share</span>
              <span>Share (WhatsApp)</span>
            </button>
          </div>

          {/* Big New Sale Button (F4) */}
          <button
            type="button"
            onClick={onNewSale}
            className="w-full py-2.5 px-4 bg-secondary hover:bg-secondary-container text-on-secondary rounded font-bold text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Start New Sale (F4)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
