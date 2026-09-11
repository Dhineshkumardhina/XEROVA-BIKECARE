import React from 'react';
import { HeldBill } from '../../types';

interface POSHeldBillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  heldBills: HeldBill[];
  onResumeBill: (bill: HeldBill) => void;
  onDeleteHeldBill: (billId: string) => void;
}

export const POSHeldBillsModal: React.FC<POSHeldBillsModalProps> = ({
  isOpen,
  onClose,
  heldBills,
  onResumeBill,
  onDeleteHeldBill
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest w-full max-w-lg rounded-lg shadow-2xl border border-surface-container-highest overflow-hidden text-xs">
        {/* Header */}
        <div className="p-3 bg-surface-container flex items-center justify-between border-b border-surface-container-high">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">pause_circle</span>
            <span className="font-bold text-sm text-on-surface">Held Bills Queue</span>
            <span className="px-2 py-0.5 rounded-full bg-secondary text-on-secondary font-mono text-xs font-bold">
              {heldBills.length} held
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-outline hover:text-on-surface hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* List of Held Bills */}
        <div className="p-4 max-h-96 overflow-y-auto space-y-2.5">
          {heldBills.length === 0 ? (
            <div className="p-8 text-center text-outline">
              <span className="material-symbols-outlined text-3xl mb-1 text-outline/60">inbox</span>
              <p className="font-medium text-sm">No bills currently on hold</p>
              <p className="text-[11px]">Click "Hold Bill" (Ctrl+S) during counter rush to park an active cart</p>
            </div>
          ) : (
            heldBills.map((bill) => (
              <div
                key={bill.id}
                className="bg-surface-container-low border border-surface-container-high rounded-md p-3 flex items-center justify-between gap-3 hover:border-secondary/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-secondary text-xs">{bill.id}</span>
                    <span className="font-bold text-on-surface text-sm truncate">{bill.customerName}</span>
                    <span className="text-[10px] font-mono text-outline">{bill.heldAt}</span>
                  </div>

                  <div className="text-[11px] text-outline mt-1 truncate">
                    <span>{bill.items.length} items: </span>
                    <span className="text-on-surface-variant font-medium">
                      {bill.items.map(i => i.part.name.split(' ')[0]).join(', ').slice(0, 45)}...
                    </span>
                  </div>

                  {bill.vehicleNo && (
                    <div className="text-[10px] font-mono text-outline mt-0.5">
                      Vehicle: <strong className="text-on-surface">{bill.vehicleNo}</strong> ({bill.bikeModel || 'Motorcycle'})
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono text-base font-extrabold text-secondary">
                    ₹{bill.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>

                  <div className="flex items-center gap-1.5 mt-2 justify-end">
                    <button
                      type="button"
                      onClick={() => onDeleteHeldBill(bill.id)}
                      className="p-1 rounded text-error hover:bg-error-container/30"
                      title="Discard held bill"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onResumeBill(bill)}
                      className="px-3 py-1 bg-secondary hover:bg-secondary-container text-on-secondary rounded font-bold text-xs flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">play_arrow</span>
                      <span>Resume</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-surface-container-low border-t border-surface-container-high flex justify-between items-center text-[11px] text-outline">
          <span>Resuming a bill will restore all cart items, discounts &amp; customer details</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-surface-container hover:bg-surface-container-high rounded text-on-surface font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
