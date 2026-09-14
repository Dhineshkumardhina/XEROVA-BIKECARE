import React, { useState } from 'react';
import { SparePart } from '../../types';

interface ItemDetailsDrawerProps {
  part: SparePart | null;
  onClose: () => void;
  onEditItem: (part: SparePart) => void;
  onPrintBarcode: (part: SparePart) => void;
  onViewStockLedger: (part: SparePart) => void;
  onAdjustStock?: (part: SparePart) => void;
}

export const ItemDetailsDrawer: React.FC<ItemDetailsDrawerProps> = ({
  part,
  onClose,
  onEditItem,
  onPrintBarcode,
  onViewStockLedger,
  onAdjustStock
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'compatibility' | 'movements'>('details');
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);

  if (!part) return null;

  const partNumber = part.partNumber || (part.sku ? part.sku.replace('SKU-', '') : 'PART');
  const counterPrice = part.counterPrice ?? (part as any).sellingRate ?? 0;
  const purchasePrice = part.purchasePrice ?? (part as any).purchaseRate ?? 0;
  const currentStock = part.currentStock ?? (part as any).stockQty ?? 0;
  const stockValue = currentStock * purchasePrice;
  const marginPercent = counterPrice > 0 ? Math.round(((counterPrice - purchasePrice) / counterPrice) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/40 backdrop-blur-[1px] animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-surface-container-lowest h-full shadow-2xl border-l border-surface-container-high flex flex-col animate-in slide-in-from-right duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 bg-surface-container-low border-b border-surface-container-high flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-secondary-container/30 border border-secondary/40 flex items-center justify-center text-secondary font-mono font-bold text-sm">
              {partNumber.slice(0, 4)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline-md text-base font-bold text-on-surface line-clamp-1">{part.name}</h2>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    part.status === 'Normal'
                      ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                      : part.status === 'Low Stock'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-error-container text-on-error-container'
                  }`}
                >
                  {part.status}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-surface-container text-outline text-[10px] font-mono">
                  ACTIVE
                </span>
              </div>
              <div className="text-xs text-outline flex items-center gap-3 font-mono mt-0.5">
                <span>Part No: <strong className="text-secondary">{partNumber}</strong></span>
                <span>•</span>
                <span>Barcode: <strong className="text-on-surface">{part.barcode}</strong></span>
                <span>•</span>
                <span>Rack: <strong className="text-on-surface">{part.rackBin}</strong></span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-container text-outline hover:text-on-surface transition-colors"
            title="Close Drawer (Esc)"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-surface-container-high bg-surface-container-lowest px-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`py-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'details'
                ? 'border-secondary text-secondary font-bold'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">info</span>
            <span>Item Overview</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('compatibility')}
            className={`py-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'compatibility'
                ? 'border-secondary text-secondary font-bold'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">two_wheeler</span>
            <span>Vehicle Compatibility ({part.vehicles.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('movements')}
            className={`py-2.5 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'movements'
                ? 'border-secondary text-secondary font-bold'
                : 'border-transparent text-outline hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">history</span>
            <span>Stock Movements ({part.stockMovements?.length || 0})</span>
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'details' && (
            <>
              {/* SECTION 1: BASIC INFORMATION */}
              <div className="border border-surface-container-high rounded p-3.5 bg-surface-container-lowest space-y-2.5">
                <div className="flex items-center justify-between border-b border-surface-container pb-1.5">
                  <span className="font-bold text-[11px] uppercase tracking-wider text-outline">Basic Information</span>
                  <span className="font-mono text-[11px] text-outline">SKU ID: {part.sku}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-outline text-[11px]">Item Name:</span>
                    <p className="font-semibold text-on-surface">{part.name}</p>
                  </div>
                  <div>
                    <span className="text-outline text-[11px]">Combination Name:</span>
                    <p className="font-mono text-on-surface">{part.combinationName || `${part.name} [${part.brand}]`}</p>
                  </div>
                  <div>
                    <span className="text-outline text-[11px]">Short Name:</span>
                    <p className="font-mono text-on-surface">{part.shortName || part.name.split(' ')[0]}</p>
                  </div>
                  <div>
                    <span className="text-outline text-[11px]">OEM Code:</span>
                    <p className="font-mono text-on-surface">{part.oemCode || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-outline text-[11px]">Barcode (EAN-13):</span>
                    <p className="font-mono font-bold text-secondary">{part.barcode}</p>
                  </div>
                  <div>
                    <span className="text-outline text-[11px]">Rack / Bin Location:</span>
                    <p className="font-mono font-bold text-on-surface">{part.rackBin}</p>
                  </div>
                </div>
              </div>

              {/* SECTION 2: CLASSIFICATION */}
              <div className="border border-surface-container-high rounded p-3.5 bg-surface-container-lowest space-y-2.5">
                <div className="border-b border-surface-container pb-1.5 font-bold text-[11px] uppercase tracking-wider text-outline">
                  Classification &amp; Taxation
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-outline text-[11px]">Brand:</span>
                    <p className="font-semibold text-on-surface">{part.brand}</p>
                  </div>
                  <div>
                    <span className="text-outline text-[11px]">Category:</span>
                    <p className="text-on-surface">{part.category}</p>
                  </div>
                  <div>
                    <span className="text-outline text-[11px]">Subcategory:</span>
                    <p className="text-on-surface">{part.subcategory || 'Friction Spares'}</p>
                  </div>
                  <div>
                    <span className="text-outline text-[11px]">Unit of Measure:</span>
                    <p className="font-mono text-on-surface">{part.unit}</p>
                  </div>
                  <div>
                    <span className="text-outline text-[11px]">HSN Code:</span>
                    <p className="font-mono font-bold text-on-surface">{part.hsn}</p>
                  </div>
                  <div>
                    <span className="text-outline text-[11px]">GST Rate:</span>
                    <span className="inline-block font-mono font-bold px-1.5 py-0.5 rounded bg-secondary/10 text-secondary">
                      {part.gstRate}% GST
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: PRICING */}
              <div className="border border-surface-container-high rounded p-3.5 bg-surface-container-lowest space-y-2.5">
                <div className="border-b border-surface-container pb-1.5 font-bold text-[11px] uppercase tracking-wider text-outline flex items-center justify-between">
                  <span>Pricing Structure</span>
                  <span className="text-[11px] text-tertiary font-mono">Gross Margin: {marginPercent.toFixed(1)}%</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="p-2 rounded bg-surface-container-low border border-surface-container">
                    <span className="text-outline text-[10px] uppercase font-bold">MRP</span>
                    <div className="font-mono text-base font-bold text-on-surface mt-0.5">₹{part.mrp.toFixed(2)}</div>
                    <span className="text-[10px] text-outline">Maximum Retail</span>
                  </div>
                  <div className="p-2 rounded bg-surface-container-low border border-surface-container">
                    <span className="text-outline text-[10px] uppercase font-bold">Purchase Rate</span>
                    <div className="font-mono text-base font-bold text-outline mt-0.5">₹{part.purchasePrice.toFixed(2)}</div>
                    <span className="text-[10px] text-outline">Landing Cost</span>
                  </div>
                  <div className="p-2 rounded bg-secondary/10 border border-secondary/30">
                    <span className="text-secondary text-[10px] uppercase font-bold">Selling Rate (POS)</span>
                    <div className="font-mono text-base font-bold text-secondary mt-0.5">₹{part.counterPrice.toFixed(2)}</div>
                    <span className="text-[10px] text-outline">Wholesale: ₹{part.wholesalePrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* SECTION 4: INVENTORY & STOCK LEVELS */}
              <div className="border border-surface-container-high rounded p-3.5 bg-surface-container-lowest space-y-2.5">
                <div className="border-b border-surface-container pb-1.5 font-bold text-[11px] uppercase tracking-wider text-outline flex items-center justify-between">
                  <span>Inventory Status</span>
                  <span className="font-mono text-xs font-bold text-on-surface">Total Valuation: ₹{stockValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="p-2 rounded bg-surface-container-low border border-surface-container">
                    <span className="text-outline text-[10px] font-bold">CURRENT STOCK</span>
                    <div className="font-mono text-lg font-bold text-on-surface mt-0.5">{part.currentStock} {part.unit}</div>
                  </div>
                  <div className="p-2 rounded bg-surface-container-low border border-surface-container">
                    <span className="text-outline text-[10px] font-bold">MINIMUM STOCK</span>
                    <div className="font-mono text-lg font-bold text-outline mt-0.5">{part.minimumStock || 10} {part.unit}</div>
                  </div>
                  <div className="p-2 rounded bg-surface-container-low border border-surface-container">
                    <span className="text-outline text-[10px] font-bold">REORDER LEVEL</span>
                    <div className="font-mono text-lg font-bold text-amber-700 mt-0.5">{part.minReorder} {part.unit}</div>
                  </div>
                  <div className="p-2 rounded bg-surface-container-low border border-surface-container">
                    <span className="text-outline text-[10px] font-bold">30D VELOCITY</span>
                    <div className="font-mono text-lg font-bold text-secondary mt-0.5">{part.thirtyDayVelocity || 28} units</div>
                  </div>
                </div>
              </div>

              {/* SECTION 5: MEDIA */}
              <div className="border border-surface-container-high rounded p-3.5 bg-surface-container-lowest space-y-2">
                <div className="font-bold text-[11px] uppercase tracking-wider text-outline">Media &amp; Product Image</div>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded bg-surface-container border border-surface-container-high flex flex-col items-center justify-center text-outline overflow-hidden">
                    {customPhoto ? (
                      <img src={customPhoto} alt={part.name} className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[28px]">image</span>
                        <span className="text-[9px] uppercase font-mono">Part Pic</span>
                      </>
                    )}
                  </div>
                  <div className="text-xs text-outline space-y-1">
                    <p className="font-semibold text-on-surface">Standard Motorcycle Component Asset</p>
                    <p className="text-[11px]">Direct fit for TVS &amp; Bajaj clutch assembly units. Packaged with factory grease seal.</p>
                    <label className="text-secondary hover:underline font-semibold text-[11px] cursor-pointer inline-flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">upload_file</span>
                      <span>+ Upload High-Res Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              setCustomPhoto(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'compatibility' && (
            <div className="space-y-3">
              <div className="text-xs text-outline">
                This item is verified compatible with <strong className="text-on-surface">{part.vehicles.length} motorcycle models</strong>:
              </div>
              <div className="grid grid-cols-1 gap-2">
                {part.compatMatrix && part.compatMatrix.length > 0 ? (
                  part.compatMatrix.map((c, idx) => (
                    <div key={idx} className="p-2.5 rounded border border-surface-container-high bg-surface-container-lowest flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-on-surface">{c.model}</span>
                        <div className="text-outline text-[11px] mt-0.5">{c.specs}</div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          c.fitType === '100% Direct Fit'
                            ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                            : c.fitType === 'Compatible'
                            ? 'bg-secondary/15 text-secondary'
                            : 'bg-surface-container text-outline'
                        }`}
                      >
                        {c.fitType}
                      </span>
                    </div>
                  ))
                ) : (
                  part.vehicles.map((veh, idx) => (
                    <div key={idx} className="p-2.5 rounded border border-surface-container-high bg-surface-container-lowest flex items-center justify-between text-xs">
                      <span className="font-semibold text-on-surface">{veh}</span>
                      <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold uppercase">
                        Verified Fit
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'movements' && (
            <div className="space-y-3">
              <div className="text-xs text-outline flex items-center justify-between">
                <span>Recent chronological stock inward and outward logs:</span>
                <span className="font-mono font-bold text-on-surface">Current: {part.currentStock} {part.unit}</span>
              </div>
              <div className="border border-surface-container-high rounded overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-container-low font-label-caps text-[10px] text-outline uppercase border-b border-surface-container-high">
                    <tr>
                      <th className="py-2 px-2.5">Date</th>
                      <th className="py-2 px-2.5">Ref #</th>
                      <th className="py-2 px-2.5">Type</th>
                      <th className="py-2 px-2.5 text-right">Qty</th>
                      <th className="py-2 px-2.5 text-right">Balance</th>
                      <th className="py-2 px-2.5">User / Party</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-high font-mono">
                    {part.stockMovements && part.stockMovements.length > 0 ? (
                      part.stockMovements.map((m, idx) => (
                        <tr key={idx} className="hover:bg-surface-container-low">
                          <td className="py-2 px-2.5 text-outline">{m.date}</td>
                          <td className="py-2 px-2.5 font-bold text-secondary">{m.ref}</td>
                          <td className="py-2 px-2.5">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-sans font-bold ${
                              m.qty > 0 ? 'bg-tertiary/15 text-tertiary' : 'bg-surface-container text-on-surface'
                            }`}>
                              {m.type}
                            </span>
                          </td>
                          <td className={`py-2 px-2.5 text-right font-bold ${m.qty > 0 ? 'text-tertiary' : 'text-error'}`}>
                            {m.qty > 0 ? `+${m.qty}` : m.qty}
                          </td>
                          <td className="py-2 px-2.5 text-right font-bold text-on-surface">{m.balance}</td>
                          <td className="py-2 px-2.5 font-sans text-outline">{m.userOrParty}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-outline font-sans">
                          No recent movement logs for this SKU.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Bottom Actions */}
        <div className="p-3.5 bg-surface-container-low border-t border-surface-container-high flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onEditItem(part)}
              className="px-3.5 py-1.5 bg-secondary hover:bg-secondary/90 text-on-secondary rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              <span>Edit Item</span>
            </button>

            <button
              type="button"
              onClick={() => onPrintBarcode(part)}
              className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-highest text-on-surface rounded text-xs font-semibold flex items-center gap-1.5 transition-colors border border-surface-container-highest"
            >
              <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
              <span>Print Barcode</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onAdjustStock && (
              <button
                type="button"
                onClick={() => onAdjustStock(part)}
                className="px-3 py-1.5 hover:bg-surface-container text-amber-700 rounded text-xs font-semibold flex items-center gap-1 transition-colors border border-amber-300"
              >
                <span className="material-symbols-outlined text-[16px]">tune</span>
                <span>Adjust Stock</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onViewStockLedger(part)}
              className="px-3 py-1.5 hover:bg-surface-container text-secondary rounded text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">menu_book</span>
              <span>View Stock Ledger</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
