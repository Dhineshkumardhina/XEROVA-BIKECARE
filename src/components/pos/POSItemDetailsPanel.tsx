import React from 'react';
import { SparePart } from '../../types';

interface POSItemDetailsPanelProps {
  part: SparePart | null;
  onClose: () => void;
  onAddToCart: (part: SparePart) => void;
  lastSaleRate?: number;
  lastPurchaseRate?: number;
}

export const POSItemDetailsPanel: React.FC<POSItemDetailsPanelProps> = ({
  part,
  onClose,
  onAddToCart,
  lastSaleRate = 690,
  lastPurchaseRate = 560
}) => {
  if (!part) return null;

  const isOutOfStock = part.currentStock === 0;

  return (
    <div className="bg-surface-container-lowest border border-surface-container-high rounded-md p-3.5 shadow-sm text-xs space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
      {/* Header with Title and Close */}
      <div className="flex items-start justify-between border-b border-surface-container-high pb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-secondary bg-surface-container px-1.5 py-0.5 rounded">
              {part.sku.replace('SKU-', '')}
            </span>
            <span className="font-bold text-sm text-on-surface">{part.name}</span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-outline">
            <span>Brand: <strong className="text-on-surface">{part.brand}</strong></span>
            <span>•</span>
            <span>Category: <strong className="text-on-surface">{part.category}</strong></span>
            <span>•</span>
            <span>Rack/Bin: <strong className="font-mono text-secondary">{part.rackBin}</strong></span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 text-outline hover:text-on-surface rounded hover:bg-surface-container"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      {/* Grid of Key Technical & Commercial Attributes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-surface-container-low p-2.5 rounded">
        <div>
          <span className="text-[10px] uppercase font-bold text-outline block">HSN &amp; GST</span>
          <span className="font-mono text-on-surface font-semibold">{part.hsn} ({part.gstRate}%)</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-outline block">Current Stock</span>
          <span className={`font-mono font-bold ${isOutOfStock ? 'text-error' : 'text-on-tertiary-container'}`}>
            {part.currentStock} {part.unit} {isOutOfStock ? '(Out)' : ''}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-outline block">Counter MRP</span>
          <span className="font-mono text-outline line-through">₹{part.mrp.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-outline block">Selling Rate</span>
          <span className="font-mono text-secondary font-bold text-sm">₹{part.counterPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* Pricing Intelligence: Last Sale & Last Purchase Comparison */}
      <div className="grid grid-cols-2 gap-2 bg-surface-container p-2 rounded">
        <div className="flex items-center justify-between">
          <span className="text-outline text-[11px]">Last Counter Sale Rate:</span>
          <span className="font-mono font-bold text-on-surface">₹{lastSaleRate.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between border-l border-surface-container-high pl-2">
          <span className="text-outline text-[11px]">Last Purchase Rate:</span>
          <span className="font-mono font-bold text-on-surface">₹{lastPurchaseRate.toFixed(2)}</span>
        </div>
      </div>

      {/* Vehicle Compatibility Chips */}
      <div>
        <span className="text-[10px] uppercase font-bold text-outline block mb-1">
          Vehicle Compatibility &amp; Direct Fitment:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {part.vehicles.map((v, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface text-[11px] font-medium border border-surface-container-highest"
            >
              🏍️ {v}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-1 border-t border-surface-container-high">
        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded text-outline hover:bg-surface-container text-xs font-semibold"
        >
          Dismiss
        </button>
        <button
          disabled={isOutOfStock}
          onClick={() => {
            onAddToCart(part);
            onClose();
          }}
          className={`px-4 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 ${
            isOutOfStock
              ? 'bg-surface-container text-outline cursor-not-allowed'
              : 'bg-secondary text-on-secondary hover:bg-secondary-container shadow-xs'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
          <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
        </button>
      </div>
    </div>
  );
};
