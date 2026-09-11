import React, { useState } from 'react';

interface PoModalProps {
  partName: string | null;
  onClose: () => void;
  onConfirmPo: (partName: string, supplier: string, qty: number) => void;
}

export const PoModal: React.FC<PoModalProps> = ({ partName, onClose, onConfirmPo }) => {
  if (!partName) return null;

  const [supplier, setSupplier] = useState('Bajaj Genuine Spare Parts Distributor');
  const [qty, setQty] = useState(25);
  const [urgency, setUrgency] = useState<'Standard' | 'Urgent (1-Day Transit)'>('Urgent (1-Day Transit)');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmPo(partName, supplier, qty);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-lg shadow-2xl border border-surface-container-highest overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-3 bg-surface-container flex items-center justify-between border-b border-surface-container-high">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">add_shopping_cart</span>
            <div>
              <div className="font-headline-md text-sm text-on-surface font-bold">
                Generate Reorder Purchase Order (PO)
              </div>
              <div className="text-[11px] text-outline truncate max-w-[280px]">
                {partName}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
          <div>
            <label className="font-bold text-outline uppercase block mb-1">Select Authorized Supplier</label>
            <select
              value={supplier}
              onChange={e => setSupplier(e.target.value)}
              className="w-full h-8 px-2 bg-surface-container-low rounded border border-surface-container-highest text-on-surface"
            >
              <option>Bajaj Genuine Spare Parts Distributor</option>
              <option>TVS Authorized Spares Agency</option>
              <option>Hero MotoCorp Regional Hub</option>
              <option>Rolon Transmission Chains Corp</option>
              <option>Endurance Technologies Braking</option>
              <option>Motul Lubricants South Depot</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-outline uppercase block mb-1">Reorder Quantity (Pcs)</label>
              <input
                type="number"
                min={1}
                value={qty}
                onChange={e => setQty(Number(e.target.value))}
                className="w-full h-8 px-2 bg-surface-container-low rounded border border-surface-container-highest font-mono font-bold text-on-surface"
                required
              />
            </div>
            <div>
              <label className="font-bold text-outline uppercase block mb-1">Delivery Priority</label>
              <select
                value={urgency}
                onChange={e => setUrgency(e.target.value as any)}
                className="w-full h-8 px-2 bg-surface-container-low rounded border border-surface-container-highest font-semibold text-secondary"
              >
                <option>Urgent (1-Day Transit)</option>
                <option>Standard (3-5 Days)</option>
              </select>
            </div>
          </div>

          <div className="bg-surface-container-low p-2.5 rounded text-[11px] text-outline">
            PO will automatically trigger EDI dispatch notification and register in Goods Receipt Note (GRN) pipeline.
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-surface-container-high">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-surface-container-low hover:bg-surface-container text-on-surface rounded font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-secondary hover:bg-secondary-container text-on-secondary rounded font-semibold transition-colors shadow-xs"
            >
              Generate PO #{Math.floor(8000 + Math.random() * 1000)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
