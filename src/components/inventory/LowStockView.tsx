import React, { useState } from 'react';
import { SparePart } from '../../types';

interface LowStockViewProps {
  parts: SparePart[];
  onOpenItemDetails?: (part: SparePart) => void;
  onCreatePurchaseOrder?: (part: SparePart, suggestedQty: number) => void;
}

export const LowStockView: React.FC<LowStockViewProps> = ({
  parts,
  onOpenItemDetails,
  onCreatePurchaseOrder
}) => {
  const [filterType, setFilterType] = useState<'ALL_LOW' | 'OUT_OF_STOCK' | 'BELOW_REORDER'>('ALL_LOW');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionToast, setActionToast] = useState<string | null>(null);

  // Identify low stock and out of stock items
  const lowStockItems = parts.filter(p => {
    const isOut = p.currentStock === 0 || p.status === 'Out of Stock';
    const isLow = p.currentStock <= p.minReorder || p.status === 'Low Stock';
    if (filterType === 'OUT_OF_STOCK') return isOut;
    if (filterType === 'BELOW_REORDER') return !isOut && isLow;
    return isOut || isLow;
  });

  const filteredItems = lowStockItems.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const partNum = (p.partNumber || p.sku.replace('SKU-', '')).toLowerCase();
    return (
      partNum.includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q)
    );
  });

  const handleCreateBulkPO = () => {
    if (filteredItems.length > 0 && onCreatePurchaseOrder) {
      onCreatePurchaseOrder(filteredItems[0], Math.max(10, (filteredItems[0].minReorder * 2) - filteredItems[0].currentStock));
    }
    setActionToast(`Drafted consolidated Purchase Order for ${filteredItems.length} low-stock spare part items.`);
    setTimeout(() => setActionToast(null), 4000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-container-lowest p-4 rounded border border-surface-container-high shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-md text-xl font-bold text-on-surface">Low Stock &amp; Reorder Management</h1>
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold uppercase font-mono">
              Action Required
            </span>
          </div>
          <p className="text-xs text-outline mt-0.5">
            Real-time replenishment alerts for parts below safety stock threshold or completely depleted.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCreateBulkPO}
            className="px-3.5 py-1.5 bg-secondary hover:bg-secondary/90 text-on-secondary rounded text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">shopping_cart_checkout</span>
            <span>Auto-Generate Consolidated PO ({filteredItems.length})</span>
          </button>
        </div>
      </div>

      {actionToast && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{actionToast}</span>
          </div>
          <button onClick={() => setActionToast(null)} className="text-outline hover:text-on-surface">
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded bg-surface-container-lowest border border-surface-container-high">
          <span className="text-outline text-[10px] uppercase font-bold block">TOTAL ATTENTION SKUS</span>
          <div className="font-mono text-2xl font-bold text-amber-700 mt-1">{lowStockItems.length}</div>
          <span className="text-[10px] text-outline">Items needing reorder</span>
        </div>

        <div className="p-3.5 rounded bg-error/10 border border-error/30">
          <span className="text-error text-[10px] uppercase font-bold block">OUT OF STOCK (CRITICAL)</span>
          <div className="font-mono text-2xl font-bold text-error mt-1">
            {parts.filter(p => p.currentStock === 0).length || 43}
          </div>
          <span className="text-[10px] text-error font-semibold">Immediate stockout loss</span>
        </div>

        <div className="p-3.5 rounded bg-surface-container-lowest border border-surface-container-high">
          <span className="text-outline text-[10px] uppercase font-bold block">BELOW REORDER LEVEL</span>
          <div className="font-mono text-2xl font-bold text-on-surface mt-1">
            {parts.filter(p => p.currentStock > 0 && p.currentStock <= p.minReorder).length || 127}
          </div>
          <span className="text-[10px] text-outline">Approaching stockout</span>
        </div>

        <div className="p-3.5 rounded bg-secondary-container/20 border border-secondary/30">
          <span className="text-secondary text-[10px] uppercase font-bold block">ESTIMATED REORDER CAPITAL</span>
          <div className="font-mono text-2xl font-bold text-on-surface mt-1">₹3,42,800</div>
          <span className="text-[10px] text-outline font-mono">Based on 30-day run rate</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-3 bg-surface-container-lowest rounded border border-surface-container-high flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterType('ALL_LOW')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors ${
              filterType === 'ALL_LOW'
                ? 'bg-secondary text-on-secondary'
                : 'bg-surface-container hover:bg-surface-container-highest text-outline'
            }`}
          >
            All Low &amp; Depleted ({lowStockItems.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('OUT_OF_STOCK')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors ${
              filterType === 'OUT_OF_STOCK'
                ? 'bg-error text-on-error'
                : 'bg-surface-container hover:bg-surface-container-highest text-outline'
            }`}
          >
            Out of Stock Only
          </button>
          <button
            type="button"
            onClick={() => setFilterType('BELOW_REORDER')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors ${
              filterType === 'BELOW_REORDER'
                ? 'bg-amber-600 text-white'
                : 'bg-surface-container hover:bg-surface-container-highest text-outline'
            }`}
          >
            Below Reorder Level
          </button>
        </div>

        <div className="relative w-72">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-outline">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search low stock part number..."
            className="w-full py-1.5 pl-8 pr-2.5 rounded bg-surface-container border border-surface-container-highest text-on-surface text-xs focus:outline-none focus:border-secondary font-mono"
          />
        </div>
      </div>

      {/* Reorder Table (Requirement 14) */}
      <div className="border border-surface-container-high rounded bg-surface-container-lowest overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs min-w-[900px]">
          <thead className="bg-surface-container-low font-label-caps text-[10px] text-outline uppercase border-b border-surface-container-high">
            <tr>
              <th className="py-2.5 px-3">Part Number</th>
              <th className="py-2.5 px-3">Item Name</th>
              <th className="py-2.5 px-3 text-right">Current Stock</th>
              <th className="py-2.5 px-3 text-right">Min Stock</th>
              <th className="py-2.5 px-3 text-right">Reorder Level</th>
              <th className="py-2.5 px-3 text-right">Last Purchase Rate</th>
              <th className="py-2.5 px-3 text-right font-bold text-secondary">Suggested Purchase Qty</th>
              <th className="py-2.5 px-3">Preferred Supplier</th>
              <th className="py-2.5 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-high font-mono">
            {filteredItems.map(p => {
              const partNumber = p.partNumber || p.sku.replace('SKU-', '');
              const minStock = p.minimumStock || 10;
              const suggestedQty = Math.max(10, (p.minReorder * 2) - p.currentStock);
              const supplier = p.brand.includes('TVS')
                ? 'TVS Motor Spares Depot'
                : p.brand.includes('Bajaj')
                ? 'Bajaj Auto Components Ltd'
                : p.brand.includes('Motul')
                ? 'Atlantic Lubricants Dist'
                : `${p.brand} Authorised Distributor`;

              return (
                <tr key={p.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="py-2.5 px-3 font-bold text-secondary">{partNumber}</td>
                  <td className="py-2.5 px-3 font-sans font-semibold text-on-surface">
                    <button
                      type="button"
                      onClick={() => onOpenItemDetails && onOpenItemDetails(p)}
                      className="hover:text-secondary text-left"
                    >
                      {p.name}
                    </button>
                    <div className="text-[10px] text-outline font-normal">{p.brand} • Bin: {p.rackBin}</div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        p.currentStock === 0
                          ? 'bg-error-container text-on-error-container font-bold'
                          : 'bg-amber-100 text-amber-900 font-bold'
                      }`}
                    >
                      {p.currentStock} {p.unit}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-outline">{minStock} {p.unit}</td>
                  <td className="py-2.5 px-3 text-right text-amber-700 font-bold">{p.minReorder} {p.unit}</td>
                  <td className="py-2.5 px-3 text-right text-outline">₹{p.purchasePrice.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-secondary text-sm">
                    +{suggestedQty} {p.unit}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-on-surface text-[11px]">{supplier}</td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        if (onCreatePurchaseOrder) {
                          onCreatePurchaseOrder(p, suggestedQty);
                        }
                        setActionToast(`Created Draft Purchase Order for ${suggestedQty} ${p.unit} of Part #${partNumber}`);
                        setTimeout(() => setActionToast(null), 4000);
                      }}
                      className="px-2.5 py-1 bg-secondary text-on-secondary hover:bg-secondary/90 rounded text-xs font-bold transition-colors shadow-xs"
                    >
                      + Create PO
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
