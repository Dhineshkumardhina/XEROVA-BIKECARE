import React from 'react';
import { TenderReconciliationData } from '../types';

interface ShiftSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenderData: TenderReconciliationData;
  totalBills: number;
}

export const ShiftSummaryModal: React.FC<ShiftSummaryModalProps> = ({
  isOpen,
  onClose,
  tenderData,
  totalBills
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-lg shadow-2xl border border-surface-container-highest overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-3 bg-surface-container flex items-center justify-between border-b border-surface-container-high">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">point_of_sale</span>
            <div>
              <div className="font-headline-md text-sm text-on-surface font-bold">
                Shift #1 Closing Summary
              </div>
              <div className="text-[11px] text-outline">
                Cashier: Rajesh (Op1) • Main Counter
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-surface-container-high text-outline hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 text-xs">
          <div className="bg-surface-container-low p-3 rounded flex items-center justify-between">
            <span className="text-outline">Total Counter Invoices Generated:</span>
            <span className="font-mono font-bold text-sm text-on-surface">{totalBills} Bills</span>
          </div>

          <div className="space-y-2 border border-surface-container-high rounded p-3">
            <div className="font-bold text-outline uppercase text-[10px] tracking-wider mb-1">
              Tender Breakdown
            </div>
            <div className="flex justify-between items-center text-outline">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">payments</span>
                Physical Cash in Drawer:
              </span>
              <span className="font-mono font-bold text-on-surface">
                ₹{tenderData.cashInDrawer.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center text-outline">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">qr_code_2</span>
                UPI / QR Digital Collections:
              </span>
              <span className="font-mono font-bold text-secondary">
                ₹{tenderData.upiCollections.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center text-outline">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">credit_card</span>
                Card POS Swipes:
              </span>
              <span className="font-mono font-bold text-on-surface">
                ₹{tenderData.cardPosTerminal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center text-outline">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">account_balance</span>
                Direct NEFT / Bank:
              </span>
              <span className="font-mono font-bold text-on-surface">
                ₹{tenderData.directNeftBank.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="pt-2 border-t border-surface-container-high flex justify-between items-center text-sm font-bold">
              <span>Total Shift Realized:</span>
              <span className="font-mono text-secondary">
                ₹{tenderData.totalRealized.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="bg-tertiary-fixed/30 text-on-tertiary-fixed p-2.5 rounded text-[11px] flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>All cash denominations and digital settlement batches are fully reconciled.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-surface-container border-t border-surface-container-high flex items-center justify-between">
          <button
            onClick={() => {
              window.print();
            }}
            className="px-3 py-1.5 rounded bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold text-xs flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">print</span> Print Shift Slip
          </button>
          <button
            onClick={() => {
              onClose();
            }}
            className="px-3.5 py-1.5 rounded bg-secondary text-on-secondary hover:bg-secondary-container font-semibold text-xs transition-colors cursor-pointer"
          >
            Sign-Off &amp; Close Shift
          </button>
        </div>
      </div>
    </div>
  );
};
