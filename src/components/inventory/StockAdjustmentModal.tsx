import React, { useState, useEffect } from 'react';
import { SparePart, StockAdjustmentReason } from '../../types';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  part: SparePart | null;
  onConfirmAdjustment: (partId: string, qtyDelta: number, reason: StockAdjustmentReason, notes: string) => void;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  part,
  onConfirmAdjustment
}) => {
  const [adjustmentType, setAdjustmentType] = useState<'delta' | 'target'>('delta');
  const [deltaQty, setDeltaQty] = useState<number>(1);
  const [targetQty, setTargetQty] = useState<number>(0);
  const [reason, setReason] = useState<StockAdjustmentReason>('Physical Count');
  const [notes, setNotes] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (part) {
      setTargetQty(part.currentStock);
      setDeltaQty(0);
      setNotes('');
      setFormError(null);
    }
  }, [part]);

  if (!isOpen || !part) return null;

  const currentStock = part.currentStock;
  const computedFinalStock =
    adjustmentType === 'delta'
      ? Math.max(0, currentStock + deltaQty)
      : Math.max(0, targetQty);

  const effectiveDelta =
    adjustmentType === 'delta' ? deltaQty : targetQty - currentStock;

  const handleConfirm = () => {
    if (effectiveDelta === 0) {
      setFormError('Adjustment quantity cannot be 0.');
      return;
    }
    onConfirmAdjustment(part.id, effectiveDelta, reason, notes || `${reason} adjustment`);
    onClose();
  };

  const partNumber = part.partNumber || part.sku.replace('SKU-', '');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 bg-black/50 backdrop-blur-[1px] animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-surface-container-lowest rounded shadow-2xl border border-surface-container-high flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-surface-container-low border-b border-surface-container-high flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">tune</span>
            <div>
              <h2 className="font-headline-md text-base font-bold text-on-surface">Physical Stock Adjustment</h2>
              <p className="text-xs text-outline font-mono">Part #{partNumber} • {part.name}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-container text-outline hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {formError && (
          <div className="mx-4 mt-3 p-2.5 bg-error/10 border border-error/20 rounded text-error text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{formError}</span>
          </div>
        )}

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Item Identification Card */}
          <div className="p-3 bg-surface-container rounded border border-surface-container-high flex items-center justify-between">
            <div>
              <span className="font-semibold text-on-surface">{part.name}</span>
              <div className="text-[11px] text-outline font-mono mt-0.5">
                Brand: {part.brand} | Rack: {part.rackBin} | Unit: {part.unit}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-outline uppercase font-bold block">Current Stock</span>
              <span className="font-mono text-xl font-bold text-on-surface">{currentStock} {part.unit}</span>
            </div>
          </div>

          {/* Adjustment Mode Toggle */}
          <div className="flex rounded border border-surface-container-high overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => setAdjustmentType('delta')}
              className={`flex-1 py-1.5 font-semibold text-center transition-colors ${
                adjustmentType === 'delta'
                  ? 'bg-secondary text-on-secondary'
                  : 'bg-surface-container hover:bg-surface-container-highest text-outline'
              }`}
            >
              Add / Deduct Quantity (+ / -)
            </button>
            <button
              type="button"
              onClick={() => setAdjustmentType('target')}
              className={`flex-1 py-1.5 font-semibold text-center transition-colors ${
                adjustmentType === 'target'
                  ? 'bg-secondary text-on-secondary'
                  : 'bg-surface-container hover:bg-surface-container-highest text-outline'
              }`}
            >
              Set New Count Directly
            </button>
          </div>

          {/* Quantity Input */}
          {adjustmentType === 'delta' ? (
            <div>
              <label className="block text-outline font-bold uppercase tracking-wider text-[10px] mb-1">
                Adjustment Delta (+ to add inward, - to deduct damage/loss)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDeltaQty(prev => prev - 1)}
                  className="w-10 h-10 rounded bg-surface-container hover:bg-surface-container-highest text-error font-bold text-lg flex items-center justify-center border border-surface-container-highest"
                >
                  -
                </button>
                <input
                  type="number"
                  value={deltaQty}
                  onChange={e => setDeltaQty(Number(e.target.value))}
                  placeholder="e.g. +5 or -3"
                  className="flex-1 py-2 px-3 rounded bg-surface-container border border-surface-container-highest text-on-surface font-mono font-bold text-base text-center focus:outline-none focus:border-secondary"
                />
                <button
                  type="button"
                  onClick={() => setDeltaQty(prev => prev + 1)}
                  className="w-10 h-10 rounded bg-surface-container hover:bg-surface-container-highest text-tertiary font-bold text-lg flex items-center justify-center border border-surface-container-highest"
                >
                  +
                </button>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-outline font-bold uppercase tracking-wider text-[10px] mb-1">
                Actual Physical Count on Shelf
              </label>
              <input
                type="number"
                min={0}
                value={targetQty}
                onChange={e => setTargetQty(Math.max(0, Number(e.target.value)))}
                className="w-full py-2 px-3 rounded bg-surface-container border border-surface-container-highest text-on-surface font-mono font-bold text-base text-center focus:outline-none focus:border-secondary"
              />
            </div>
          )}

          {/* Reason Selection (Requirement 13) */}
          <div>
            <label className="block text-outline font-bold uppercase tracking-wider text-[10px] mb-1">
              Reason for Adjustment <span className="text-error">*</span>
            </label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value as StockAdjustmentReason)}
              className="w-full py-1.5 px-2.5 rounded bg-surface-container border border-surface-container-highest text-on-surface font-semibold focus:outline-none focus:border-secondary"
            >
              <option value="Damaged">Damaged (Scrapped / Broken / Water damage)</option>
              <option value="Lost">Lost / Theft / Shrinkage</option>
              <option value="Physical Count">Physical Count / Shelf Audit Variance</option>
              <option value="Correction">Correction / Data Entry Inaccuracy</option>
              <option value="Other">Other (Special Audit)</option>
            </select>
          </div>

          {/* Calculation Preview (Requirement 13) */}
          <div className="p-3.5 rounded bg-surface-container-low border border-surface-container-high space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-outline block">Calculation Audit Preview</span>
            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="p-2 bg-surface-container rounded">
                <span className="text-[10px] text-outline block">Before</span>
                <span className="font-bold text-sm text-on-surface">{currentStock}</span>
              </div>
              <div className="p-2 bg-surface-container rounded">
                <span className="text-[10px] text-outline block">Adjustment</span>
                <span className={`font-bold text-sm ${effectiveDelta >= 0 ? 'text-tertiary' : 'text-error'}`}>
                  {effectiveDelta >= 0 ? `+${effectiveDelta}` : effectiveDelta}
                </span>
              </div>
              <div className="p-2 bg-secondary/15 rounded border border-secondary/30">
                <span className="text-[10px] text-secondary font-bold block">After</span>
                <span className="font-bold text-base text-secondary">{computedFinalStock}</span>
              </div>
            </div>
          </div>

          {/* Notes Input */}
          <div>
            <label className="block text-outline font-semibold mb-1">
              Audit Notes &amp; Inspector Remarks
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Verified by physical count in Rack B-04 during monthly cycle check."
              className="w-full py-1.5 px-2.5 rounded bg-surface-container border border-surface-container-highest text-on-surface focus:outline-none focus:border-secondary"
            />
          </div>

          <div className="text-[11px] text-outline flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px]">shield</span>
            <span>Recorded under: <strong>Admin (Ramesh) — Stock Auditor Terminal #1</strong></span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-surface-container-low border-t border-surface-container-high flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 hover:bg-surface-container text-on-surface rounded text-xs font-semibold"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={effectiveDelta === 0}
            className="px-5 py-2 bg-secondary hover:bg-secondary/90 disabled:opacity-50 text-on-secondary rounded text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>Confirm Stock Adjustment</span>
          </button>
        </div>
      </div>
    </div>
  );
};
