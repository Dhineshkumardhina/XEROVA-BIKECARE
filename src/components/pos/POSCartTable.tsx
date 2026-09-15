import React, { useState } from 'react';
import { CartLineItem, SparePart } from '../../types';

interface POSCartTableProps {
  cart: CartLineItem[];
  onUpdateQty: (cartItemId: string, newQty: number) => void;
  onUpdateRate: (cartItemId: string, newRate: number) => void;
  onUpdateDiscount: (cartItemId: string, discount: number, discountType: 'flat' | 'percent') => void;
  onUpdateVehicle: (cartItemId: string, vehicle: string) => void;
  onRemoveItem: (cartItemId: string) => void;
  onDuplicateItem: (cartItemId: string) => void;
  onSelectItemForDetails: (part: SparePart) => void;
  selectedCartItemId: string | null;
  onSelectCartItem: (cartItemId: string) => void;
  isRateEditAuthorized: boolean;
  onToggleRateAuth: () => void;
  selectedCustomerVehicle?: string;
}

export const POSCartTable: React.FC<POSCartTableProps> = ({
  cart,
  onUpdateQty,
  onUpdateRate,
  onUpdateDiscount,
  onUpdateVehicle,
  onRemoveItem,
  onDuplicateItem,
  onSelectItemForDetails,
  selectedCartItemId,
  onSelectCartItem,
  isRateEditAuthorized,
  onToggleRateAuth,
  selectedCustomerVehicle
}) => {
  // Local state for tracking which row has inline rate edit or discount edit open
  const [editingRateId, setEditingRateId] = useState<string | null>(null);
  const [tempRate, setTempRate] = useState<string>('');

  const [editingDiscId, setEditingDiscId] = useState<string | null>(null);
  const [tempDisc, setTempDisc] = useState<string>('');
  const [tempDiscType, setTempDiscType] = useState<'flat' | 'percent'>('flat');

  // Insufficient stock alert helper
  const [stockWarningId, setStockWarningId] = useState<string | null>(null);

  const handleQtyChange = (item: CartLineItem, newQty: number) => {
    if (newQty <= 0) {
      onRemoveItem(item.id);
      return;
    }
    if (newQty > item.part.currentStock) {
      setStockWarningId(item.id);
    } else {
      setStockWarningId(null);
    }
    onUpdateQty(item.id, newQty);
  };

  const handleSaveRate = (itemId: string) => {
    const val = parseFloat(tempRate);
    if (!isNaN(val) && val >= 0) {
      onUpdateRate(itemId, val);
    }
    setEditingRateId(null);
  };

  const handleSaveDiscount = (itemId: string) => {
    const val = parseFloat(tempDisc);
    if (!isNaN(val) && val >= 0) {
      onUpdateDiscount(itemId, val, tempDiscType);
    }
    setEditingDiscId(null);
  };

  return (
    <div className="bg-surface-container-lowest border border-surface-container-high rounded-md shadow-xs flex flex-col overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-2.5 bg-surface-container-low flex flex-wrap items-center justify-between border-b border-surface-container-high gap-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[20px]">shopping_cart</span>
          <span className="font-bold text-sm text-on-surface">Current Cart</span>
          <span className="px-2 py-0.5 rounded-full bg-secondary text-on-secondary font-mono text-xs font-bold">
            {cart.length} {cart.length === 1 ? 'item' : 'items'}
          </span>
          <span className="hidden md:inline text-xs text-outline">
            Total Qty: <strong className="font-mono text-on-surface">{cart.reduce((a, b) => a + b.qty, 0)}</strong>
          </span>
        </div>

        {/* Rate authorization toggle */}
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={onToggleRateAuth}
            className={`flex items-center gap-1 px-2 py-1 rounded border text-[11px] font-semibold transition-colors ${
              isRateEditAuthorized
                ? 'border-secondary bg-secondary/10 text-secondary'
                : 'border-surface-container-high text-outline hover:text-on-surface'
            }`}
            title="Toggle Supervisor Permission to override item selling rates"
          >
            <span className="material-symbols-outlined text-[14px]">
              {isRateEditAuthorized ? 'lock_open' : 'lock'}
            </span>
            <span>{isRateEditAuthorized ? 'Rate Editing Unlocked' : 'Rate Locked (Auth)'}</span>
          </button>
        </div>
      </div>

      {/* Cart Items Table */}
      <div className="overflow-x-auto min-h-[220px]">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-surface-container font-label-caps text-[11px] uppercase text-outline tracking-wider sticky top-0 z-10">
            <tr>
              <th className="py-2 px-2.5 text-center w-10">#</th>
              <th className="py-2 px-2.5 w-24">Part No.</th>
              <th className="py-2 px-2.5">Item Description</th>
              <th className="py-2 px-2.5 w-32 hidden sm:table-cell">Vehicle</th>
              <th className="py-2 px-2.5 text-center w-28">Qty</th>
              <th className="py-2 px-2.5 text-right w-24">Rate</th>
              <th className="py-2 px-2.5 text-right w-24">Discount</th>
              <th className="py-2 px-2.5 text-center w-16 hidden md:table-cell">GST</th>
              <th className="py-2 px-2.5 text-right w-24">Amount</th>
              <th className="py-2 px-2.5 text-center w-20">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-surface-container-high font-table-cell">
            {cart.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-outline">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-4xl text-outline/50">add_shopping_cart</span>
                    <span className="font-medium text-sm">Cart is empty</span>
                    <span className="text-xs text-outline/80">
                      Scan a barcode, press <kbd className="px-1 py-0.5 rounded bg-surface-container font-mono text-[10px]">F2</kbd> to search, or pick a fast spare
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              cart.map((item, idx) => {
                const partNo = item.part.sku.replace('SKU-', '');
                const effectiveRate = item.rate;
                const isOverStock = item.qty > item.part.currentStock;

                // Line discount calculation
                const discountAmount =
                  item.discountType === 'percent'
                    ? (effectiveRate * item.qty * item.discount) / 100
                    : item.discount;

                const lineTotal = Math.max(0, effectiveRate * item.qty - discountAmount);
                const isSelected = selectedCartItemId === item.id;
                const activeVehicle = item.selectedVehicle || selectedCustomerVehicle || item.part?.vehicles?.[0] || 'Universal';

                return (
                  <React.Fragment key={item.id}>
                    <tr
                      onClick={() => onSelectCartItem(item.id)}
                      className={`transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-secondary/10 font-medium'
                          : idx % 2 === 0
                          ? 'bg-surface-container-lowest hover:bg-surface-container-low'
                          : 'bg-surface-container-low/40 hover:bg-surface-container-low'
                      } ${isOverStock ? 'bg-error-container/15' : ''}`}
                    >
                      {/* # Row Index */}
                      <td className="py-2 px-2.5 text-center font-mono text-outline">{idx + 1}</td>

                      {/* Part No. */}
                      <td className="py-2 px-2.5 font-mono font-bold text-secondary">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectItemForDetails(item.part);
                          }}
                          className="hover:underline text-left"
                          title="Click to view full specs"
                        >
                          {partNo}
                        </button>
                      </td>

                      {/* Item */}
                      <td className="py-2 px-2.5">
                        <div className="font-semibold text-on-surface line-clamp-1">{item.part.name}</div>
                        <div className="flex items-center gap-1.5 text-[10px] text-outline font-mono">
                          <span>{item.part.brand}</span>
                          <span>•</span>
                          <span>Bin: <strong className="text-secondary">{item.part.rackBin}</strong></span>
                          <span>•</span>
                          <span className={isOverStock ? 'text-error font-bold' : 'text-on-tertiary-container'}>
                            Avail: {item.part.currentStock}
                          </span>
                        </div>
                      </td>

                      {/* Vehicle */}
                      <td className="py-2 px-2.5 hidden sm:table-cell">
                        <select
                          value={activeVehicle}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => onUpdateVehicle(item.id, e.target.value)}
                          className="w-full h-6 px-1.5 text-[11px] bg-surface-container-low border border-surface-container-high rounded text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary truncate"
                        >
                          <option value="Universal">Universal Fit</option>
                          {item.part.vehicles.map((v, i) => (
                            <option key={i} value={v}>
                              {v}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Quantity with inline editing and stock validation */}
                      <td className="py-2 px-2.5 text-center">
                        <div
                          className="inline-flex items-center bg-surface-container rounded border border-surface-container-high"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => handleQtyChange(item, item.qty - 1)}
                            className="px-1.5 py-0.5 hover:bg-surface-container-high text-on-surface font-bold text-xs"
                            title="Decrease quantity"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={item.part.currentStock}
                            value={item.qty}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              handleQtyChange(item, val);
                            }}
                            className={`w-10 text-center font-mono font-bold text-xs bg-transparent focus:outline-none ${
                              isOverStock ? 'text-error font-extrabold' : 'text-on-surface'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => handleQtyChange(item, item.qty + 1)}
                            className="px-1.5 py-0.5 hover:bg-surface-container-high text-on-surface font-bold text-xs"
                            title="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Rate (Editable if authorized, else Rate locked indicator) */}
                      <td className="py-2 px-2.5 text-right font-mono font-bold" onClick={(e) => e.stopPropagation()}>
                        {editingRateId === item.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-outline">₹</span>
                            <input
                              type="number"
                              value={tempRate}
                              autoFocus
                              onChange={(e) => setTempRate(e.target.value)}
                              onBlur={() => handleSaveRate(item.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveRate(item.id);
                                if (e.key === 'Escape') setEditingRateId(null);
                              }}
                              className="w-16 h-6 px-1 text-right text-xs bg-surface-container-lowest border border-secondary rounded font-mono font-bold"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <span>₹{item.rate.toFixed(2)}</span>
                            {isRateEditAuthorized ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingRateId(item.id);
                                  setTempRate(item.rate.toString());
                                }}
                                className="text-outline hover:text-secondary p-0.5"
                                title="Edit Selling Rate"
                              >
                                <span className="material-symbols-outlined text-[13px]">edit</span>
                              </button>
                            ) : (
                              <span
                                className="material-symbols-outlined text-[12px] text-outline"
                                title="Rate locked by manager"
                              >
                                lock
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Discount (% or ₹) */}
                      <td className="py-2 px-2.5 text-right font-mono" onClick={(e) => e.stopPropagation()}>
                        {editingDiscId === item.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="number"
                              value={tempDisc}
                              autoFocus
                              onChange={(e) => setTempDisc(e.target.value)}
                              onBlur={() => handleSaveDiscount(item.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveDiscount(item.id);
                                if (e.key === 'Escape') setEditingDiscId(null);
                              }}
                              className="w-12 h-6 px-1 text-right text-xs bg-surface-container-lowest border border-secondary rounded font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => setTempDiscType(prev => (prev === 'flat' ? 'percent' : 'flat'))}
                              className="px-1 text-[10px] bg-surface-container rounded font-bold"
                            >
                              {tempDiscType === 'flat' ? '₹' : '%'}
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingDiscId(item.id);
                              setTempDisc(item.discount.toString());
                              setTempDiscType(item.discountType);
                            }}
                            className="hover:underline text-outline hover:text-on-surface"
                            title="Click to apply item discount"
                          >
                            {item.discount > 0 ? (
                              <span className="text-secondary font-semibold">
                                {item.discountType === 'percent' ? `${item.discount}%` : `₹${item.discount}`}
                              </span>
                            ) : (
                              '₹0'
                            )}
                          </button>
                        )}
                      </td>

                      {/* GST Rate */}
                      <td className="py-2 px-2.5 text-center font-mono text-outline hidden md:table-cell">
                        {item.part.gstRate}%
                      </td>

                      {/* Amount */}
                      <td className="py-2 px-2.5 text-right font-mono font-bold text-secondary text-sm">
                        ₹{lineTotal.toFixed(2)}
                      </td>

                      {/* Actions: Duplicate, Delete */}
                      <td className="py-2 px-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => onDuplicateItem(item.id)}
                            className="p-1 rounded text-outline hover:text-on-surface hover:bg-surface-container"
                            title="Duplicate item line"
                          >
                            <span className="material-symbols-outlined text-[15px]">content_copy</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.id)}
                            className="p-1 rounded text-error hover:bg-error-container/30"
                            title="Remove from cart"
                          >
                            <span className="material-symbols-outlined text-[15px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Stock Alert Warning Banner if user requested more than available */}
                    {isOverStock && (
                      <tr className="bg-error-container/20 border-b border-error/30">
                        <td colSpan={10} className="py-1 px-3 text-xs text-error font-medium">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[16px]">warning</span>
                              <span>
                                Insufficient stock. Available quantity: <strong>{item.part.currentStock}</strong> (Requested: {item.qty})
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleQtyChange(item, item.part.currentStock)}
                              className="px-2 py-0.5 rounded bg-error text-white font-bold text-[11px] hover:bg-error/90"
                            >
                              Reduce to {item.part.currentStock}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
