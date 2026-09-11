import React from 'react';
import { SparePart } from '../../types';

interface InventoryDashboardViewProps {
  parts: SparePart[];
  onOpenItemDetails?: (part: SparePart) => void;
  onNavigateToStockReport?: () => void;
  onNavigateToStockLedger?: () => void;
  onNavigateToLowStock?: () => void;
  onCreatePurchaseOrder?: (part: SparePart) => void;
}

export const InventoryDashboardView: React.FC<InventoryDashboardViewProps> = ({
  parts,
  onOpenItemDetails,
  onNavigateToStockReport,
  onNavigateToStockLedger,
  onNavigateToLowStock,
  onCreatePurchaseOrder
}) => {
  // Category breakdown for Stock Value by Category chart
  const categoryData = [
    { category: 'Clutch & Transmission', value: 840000, percentage: 29.5, color: '#006a6a' },
    { category: 'Engine & Cylinder', value: 685000, percentage: 24.1, color: '#005b5c' },
    { category: 'Brakes & Hydraulics', value: 450000, percentage: 15.8, color: '#146c2e' },
    { category: 'Lubricants & Fluids', value: 390000, percentage: 13.7, color: '#006874' },
    { category: 'Electrical & Spark', value: 290000, percentage: 10.2, color: '#855300' },
    { category: 'Suspension & Chassis', value: 190000, percentage: 6.7, color: '#ba1a1a' }
  ];

  // Stock Movement: Monthly Inward GRN vs Outward POS Sales (Requirement 10)
  const monthlyMovement = [
    { month: 'May', inward: 480000, outward: 420000 },
    { month: 'Jun', inward: 520000, outward: 490000 },
    { month: 'Jul', inward: 610000, outward: 580000 },
    { month: 'Aug', inward: 590000, outward: 630000 },
    { month: 'Sep', inward: 720000, outward: 690000 },
    { month: 'Oct', inward: 640000, outward: 610000 }
  ];

  // Fast vs Slow vs Dead Stock breakdown (Requirement 10)
  const velocityBreakdown = [
    { type: 'Fast Moving (>30 units/mo)', count: 238, percent: 45, color: 'bg-tertiary text-on-tertiary' },
    { type: 'Medium Moving (10-30 units/mo)', count: 412, percent: 35, color: 'bg-secondary text-on-secondary' },
    { type: 'Slow Moving (1-10 units/mo)', count: 184, percent: 14, color: 'bg-amber-600 text-white' },
    { type: 'Dead Stock (0 sales >90 days)', count: 391, percent: 6, color: 'bg-error text-on-error' }
  ];

  // Low stock sample list
  const lowStockList = parts.filter(p => p.currentStock <= p.minReorder).slice(0, 5);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-container-lowest p-4 rounded border border-surface-container-high shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-md text-xl font-bold text-on-surface">Inventory Management Dashboard</h1>
            <span className="px-2 py-0.5 rounded bg-secondary/15 text-secondary text-[10px] font-bold uppercase font-mono">
              Live Warehouse Sync
            </span>
          </div>
          <p className="text-xs text-outline mt-0.5">
            Real-time multi-bin inventory valuation, replenishment signals, and SKU velocity analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToLowStock && (
            <button
              type="button"
              onClick={onNavigateToLowStock}
              className="px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded text-xs font-bold flex items-center gap-1.5 transition-colors border border-amber-300"
            >
              <span className="material-symbols-outlined text-[16px]">warning</span>
              <span>127 Low Stock Alerts</span>
            </button>
          )}

          {onNavigateToStockReport && (
            <button
              type="button"
              onClick={onNavigateToStockReport}
              className="px-3.5 py-1.5 bg-surface-container hover:bg-surface-container-highest text-on-surface rounded text-xs font-bold border border-surface-container-highest flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">bar_chart</span>
              <span>Stock Report</span>
            </button>
          )}

          {onNavigateToStockLedger && (
            <button
              type="button"
              onClick={onNavigateToStockLedger}
              className="px-3.5 py-1.5 bg-secondary hover:bg-secondary/90 text-on-secondary rounded text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">menu_book</span>
              <span>Stock Ledger</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards (Exact numbers requested by user in Requirement 9) */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {/* Total Stock Items: 48,921 */}
        <div className="p-3.5 rounded bg-surface-container-lowest border border-surface-container-high shadow-xs">
          <span className="text-outline text-[10px] uppercase font-bold block">TOTAL STOCK ITEMS</span>
          <div className="font-mono text-2xl font-bold text-on-surface mt-1">48,921</div>
          <span className="text-[10px] text-outline font-mono">Catalog SKUs on hand</span>
        </div>

        {/* Stock Value: ₹28,45,000 */}
        <div className="p-3.5 rounded bg-secondary-container/20 border border-secondary/30 shadow-xs">
          <span className="text-secondary text-[10px] uppercase font-bold block">STOCK VALUE (VALUATION)</span>
          <div className="font-mono text-2xl font-bold text-on-surface mt-1">₹28,45,000</div>
          <span className="text-[10px] text-outline font-mono">FIFO Landed Cost basis</span>
        </div>

        {/* Low Stock: 127 */}
        <div className="p-3.5 rounded bg-amber-500/10 border border-amber-500/30 shadow-xs">
          <span className="text-amber-700 text-[10px] uppercase font-bold block">LOW STOCK</span>
          <div className="font-mono text-2xl font-bold text-amber-700 mt-1">127</div>
          <span className="text-[10px] text-amber-700">Reorder triggered</span>
        </div>

        {/* Out of Stock: 43 */}
        <div className="p-3.5 rounded bg-error/10 border border-error/30 shadow-xs">
          <span className="text-error text-[10px] uppercase font-bold block">OUT OF STOCK</span>
          <div className="font-mono text-2xl font-bold text-error mt-1">43</div>
          <span className="text-[10px] text-error font-semibold">Zero balance SKUs</span>
        </div>

        {/* Fast Moving: 238 */}
        <div className="p-3.5 rounded bg-tertiary/10 border border-tertiary/30 shadow-xs">
          <span className="text-tertiary text-[10px] uppercase font-bold block">FAST MOVING</span>
          <div className="font-mono text-2xl font-bold text-tertiary mt-1">238</div>
          <span className="text-[10px] text-tertiary font-semibold">&gt;30 units monthly run</span>
        </div>

        {/* Dead Stock: 391 */}
        <div className="p-3.5 rounded bg-surface-container-lowest border border-surface-container-high shadow-xs">
          <span className="text-outline text-[10px] uppercase font-bold block">DEAD STOCK</span>
          <div className="font-mono text-2xl font-bold text-on-surface mt-1">391</div>
          <span className="text-[10px] text-outline font-mono">&gt;90 days zero sales</span>
        </div>
      </div>

      {/* Visual Charts Section (Requirement 10) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* CHART 1: Stock Value by Category */}
        <div className="p-4 rounded bg-surface-container-lowest border border-surface-container-high shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-surface-container pb-2">
            <span className="font-bold text-xs uppercase tracking-wider text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-[16px]">pie_chart</span>
              <span>Stock Value by Category</span>
            </span>
            <span className="font-mono text-[11px] text-outline font-bold">₹28.45 L</span>
          </div>

          <div className="space-y-2.5 pt-1">
            {categoryData.map(c => (
              <div key={c.category} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-on-surface font-medium truncate max-w-[170px]">{c.category}</span>
                  <div className="font-mono text-[11px] text-right">
                    <span className="font-bold text-on-surface">₹{(c.value / 100000).toFixed(2)}L</span>
                    <span className="text-outline ml-1.5">({c.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${c.percentage}%`, backgroundColor: c.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CHART 2: Stock Movement (Monthly Inward GRN vs Outward POS Sales) */}
        <div className="p-4 rounded bg-surface-container-lowest border border-surface-container-high shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-surface-container pb-2">
            <span className="font-bold text-xs uppercase tracking-wider text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-[16px]">stacked_bar_chart</span>
              <span>Stock Movement (GRN In vs POS Out)</span>
            </span>
            <div className="flex items-center gap-3 text-[10px] font-semibold">
              <span className="flex items-center gap-1 text-tertiary">
                <span className="w-2 h-2 rounded-full bg-tertiary"></span> Inward
              </span>
              <span className="flex items-center gap-1 text-secondary">
                <span className="w-2 h-2 rounded-full bg-secondary"></span> Outward
              </span>
            </div>
          </div>

          {/* Bar Visualization */}
          <div className="pt-2 flex items-end justify-between h-48 px-2 gap-3 border-b border-surface-container">
            {monthlyMovement.map((m, idx) => {
              const inwardHeight = (m.inward / 800000) * 100;
              const outwardHeight = (m.outward / 800000) * 100;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-1 h-36">
                    {/* Inward Bar */}
                    <div
                      className="w-1/2 bg-tertiary/80 hover:bg-tertiary rounded-t transition-all"
                      style={{ height: `${inwardHeight}%` }}
                      title={`Inward (${m.month}): ₹${m.inward.toLocaleString()}`}
                    ></div>
                    {/* Outward Bar */}
                    <div
                      className="w-1/2 bg-secondary/80 hover:bg-secondary rounded-t transition-all"
                      style={{ height: `${outwardHeight}%` }}
                      title={`Outward (${m.month}): ₹${m.outward.toLocaleString()}`}
                    ></div>
                  </div>
                  <span className="text-[10px] font-mono text-outline font-bold mt-1">{m.month}</span>
                </div>
              );
            })}
          </div>

          <div className="text-[11px] text-outline font-mono text-center pt-1">
            6-Month Aggregate: +₹35.6L Received • -₹34.2L Billed
          </div>
        </div>

        {/* CHART 3: Fast Moving vs Slow Moving vs Dead Stock */}
        <div className="p-4 rounded bg-surface-container-lowest border border-surface-container-high shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-surface-container pb-2">
            <span className="font-bold text-xs uppercase tracking-wider text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-secondary text-[16px]">speed</span>
              <span>SKU Velocity Distribution</span>
            </span>
            <span className="font-mono text-[11px] text-outline">1,225 Tracked SKUs</span>
          </div>

          <div className="space-y-3 pt-2">
            {velocityBreakdown.map(v => (
              <div key={v.type} className="p-2.5 rounded bg-surface-container-low border border-surface-container space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-on-surface">{v.type}</span>
                  <span className="font-mono font-bold text-on-surface">{v.count} SKUs</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                  <div
                    className={`h-full rounded-full ${v.color.split(' ')[0]}`}
                    style={{ width: `${v.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Stock Table (Requirement 10) */}
      <div className="p-4 rounded bg-surface-container-lowest border border-surface-container-high shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-surface-container pb-2">
          <div>
            <h2 className="font-bold text-xs uppercase tracking-wider text-on-surface flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Low Stock Replenishment Priority</span>
            </h2>
            <p className="text-xs text-outline mt-0.5">
              Items currently at or below minimum threshold needing purchase order creation.
            </p>
          </div>

          {onNavigateToLowStock && (
            <button
              type="button"
              onClick={onNavigateToLowStock}
              className="text-xs text-secondary hover:underline font-bold"
            >
              View All 127 Items →
            </button>
          )}
        </div>

        <div className="border border-surface-container-high rounded overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-container-low font-label-caps text-[10px] text-outline uppercase border-b border-surface-container-high">
              <tr>
                <th className="py-2.5 px-3">Part Number</th>
                <th className="py-2.5 px-3">Item Name</th>
                <th className="py-2.5 px-3 text-right">Current Stock</th>
                <th className="py-2.5 px-3 text-right">Reorder Level</th>
                <th className="py-2.5 px-3 text-right">Suggested Reorder</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-mono">
              {lowStockList.map(p => {
                const partNumber = p.partNumber || p.sku.replace('SKU-', '');
                const suggestedQty = (p.minReorder * 2) - p.currentStock;

                return (
                  <tr key={p.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-2 px-3 font-bold text-secondary">{partNumber}</td>
                    <td className="py-2 px-3 font-sans font-semibold text-on-surface">{p.name}</td>
                    <td className="py-2 px-3 text-right font-bold">
                      <span className={`px-1.5 py-0.5 rounded text-[11px] ${
                        p.currentStock === 0 ? 'bg-error-container text-on-error-container' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {p.currentStock} {p.unit}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-amber-700 font-bold">{p.minReorder} {p.unit}</td>
                    <td className="py-2 px-3 text-right font-bold text-secondary">+{suggestedQty} {p.unit}</td>
                    <td className="py-2 px-3 text-center">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-sans font-bold uppercase bg-amber-100 text-amber-900">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 font-sans">
                        <button
                          type="button"
                          onClick={() => onOpenItemDetails && onOpenItemDetails(p)}
                          className="px-2 py-1 bg-surface-container hover:bg-surface-container-highest rounded text-xs text-on-surface font-semibold"
                        >
                          View Item
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (onCreatePurchaseOrder) onCreatePurchaseOrder(p);
                            else alert(`Drafted purchase order for ${p.name}`);
                          }}
                          className="px-2.5 py-1 bg-secondary text-on-secondary hover:bg-secondary/90 rounded text-xs font-bold shadow-xs"
                        >
                          Create PO
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
