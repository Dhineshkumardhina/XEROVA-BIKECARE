import React from 'react';
import { SparePart } from '../../types';

interface POSHeaderRibbonProps {
  isQuotation: boolean;
  onToggleQuotation: (val: boolean) => void;
  heldCount: number;
  onOpenHeldBills: () => void;
  onHoldCurrentBill: () => void;
  onOpenSalesReturn: () => void;
  onOpenNewCustomer: () => void;
  onPrintLastInvoice: () => void;
  hasLastInvoice: boolean;
  parts: SparePart[];
  onAddToCart: (part: SparePart) => void;
  onNewSale: () => void;
  cartCount: number;
}

export const POSHeaderRibbon: React.FC<POSHeaderRibbonProps> = ({
  isQuotation,
  onToggleQuotation,
  heldCount,
  onOpenHeldBills,
  onHoldCurrentBill,
  onOpenSalesReturn,
  onOpenNewCustomer,
  onPrintLastInvoice,
  hasLastInvoice,
  parts,
  onAddToCart,
  onNewSale,
  cartCount
}) => {
  const quickCategories = [
    { label: 'Engine Oil', keywords: ['engine oil', 'motul', '20w40', '4t'] },
    { label: 'Spark Plug', keywords: ['spark plug', 'rg6yc', 'champion', 'ngk'] },
    { label: 'Brake Shoe', keywords: ['brake shoe', 'endurance', 'shoe'] },
    { label: 'Chain Lube', keywords: ['chain lube', 'c2'] },
    { label: 'Air Filter', keywords: ['air filter', 'filter'] },
    { label: 'Clutch Cable', keywords: ['clutch cable', 'cable'] },
    { label: 'Brake Pad', keywords: ['brake pad', 'pad'] },
  ];

  const handleQuickAdd = (keywords: string[]) => {
    const match = parts.find(p =>
      keywords.some(k =>
        p.name.toLowerCase().includes(k) ||
        p.category.toLowerCase().includes(k) ||
        p.brand.toLowerCase().includes(k)
      )
    );
    if (match) {
      onAddToCart(match);
    } else if (parts.length > 0) {
      onAddToCart(parts[0]);
    }
  };

  return (
    <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs">
      {/* Top Bar: Mode Toggle + Clean Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Left: Invoice Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => onToggleQuotation(false)}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                !isQuotation
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Tax Invoice
            </button>
            <button
              type="button"
              onClick={() => onToggleQuotation(true)}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                isQuotation
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Estimate / Quotation
            </button>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={onNewSale}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium flex items-center gap-1 transition-colors cursor-pointer"
            title="Start a fresh sale (F4)"
          >
            <span className="material-symbols-outlined text-[15px]">refresh</span>
            <span>New (F4)</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewCustomer}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">person_add</span>
            <span>+ Customer</span>
          </button>

          <button
            type="button"
            disabled={cartCount === 0}
            onClick={onHoldCurrentBill}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-lg font-medium flex items-center gap-1 transition-colors cursor-pointer"
            title="Hold current bill (Ctrl+S)"
          >
            <span className="material-symbols-outlined text-[15px]">pause_circle</span>
            <span>Hold</span>
          </button>

          <button
            type="button"
            onClick={onOpenHeldBills}
            className={`px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              heldCount > 0
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title="Recall held bills (Alt+R)"
          >
            <span className="material-symbols-outlined text-[15px]">play_circle</span>
            <span>Recall ({heldCount})</span>
          </button>

          <button
            type="button"
            onClick={onOpenSalesReturn}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">assignment_return</span>
            <span>Return</span>
          </button>

          <button
            type="button"
            disabled={!hasLastInvoice}
            onClick={onPrintLastInvoice}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-lg font-medium flex items-center gap-1 transition-colors cursor-pointer"
            title="Reprint last invoice (Alt+P)"
          >
            <span className="material-symbols-outlined text-[15px]">print</span>
            <span>Last Bill</span>
          </button>
        </div>
      </div>

      {/* Quick Spares Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
        <span className="text-[10px] font-semibold uppercase text-slate-400 shrink-0 flex items-center gap-1">
          <span className="material-symbols-outlined text-[13px] text-blue-600">bolt</span>
          Fast Add:
        </span>
        {quickCategories.map((cat, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleQuickAdd(cat.keywords)}
            className="px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-[11px] font-medium text-slate-600 whitespace-nowrap transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <span>+</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

