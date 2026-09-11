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
  // Common fast-moving spares
  const quickCategories = [
    { label: 'Engine Oil', keywords: ['engine oil', 'motul', '20w40', '4t'] },
    { label: 'Spark Plug', keywords: ['spark plug', 'rg6yc', 'champion', 'ngk'] },
    { label: 'Brake Shoe', keywords: ['brake shoe', 'endurance', 'shoe'] },
    { label: 'Chain Lube', keywords: ['chain lube', 'c2'] },
    { label: 'Air Filter', keywords: ['air filter', 'filter'] },
    { label: 'Clutch Cable', keywords: ['clutch cable', 'cable'] },
    { label: 'Front Brake Pad', keywords: ['brake pad', 'pad'] },
    { label: 'Disc Oil DOT4', keywords: ['dot 4', 'brake fluid'] },
  ];

  const handleQuickAdd = (keywords: string[]) => {
    // Find first matching part in catalog
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
    <div className="space-y-2 bg-surface-container-low p-2.5 rounded-md border border-surface-container-high">
      {/* Top Bar: Mode Toggle + Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Left: Terminal info + Quotation vs Invoice mode toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs font-mono font-bold text-on-surface bg-surface-container px-2 py-1 rounded">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            <span>Counter POS • Pos-01</span>
          </div>

          <div className="flex items-center bg-surface-container rounded p-0.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => onToggleQuotation(false)}
              className={`px-2.5 py-1 rounded transition-colors ${
                !isQuotation
                  ? 'bg-secondary text-on-secondary shadow-xs'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              GST Invoice
            </button>
            <button
              type="button"
              onClick={() => onToggleQuotation(true)}
              className={`px-2.5 py-1 rounded transition-colors ${
                isQuotation
                  ? 'bg-secondary text-on-secondary shadow-xs'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              Proforma / Quotation
            </button>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {/* New Sale */}
          <button
            type="button"
            onClick={onNewSale}
            className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high text-on-surface rounded border border-surface-container-highest font-bold flex items-center gap-1"
            title="Start a fresh sale (F4)"
          >
            <span className="material-symbols-outlined text-[15px]">refresh</span>
            <span>New Sale</span>
            <kbd className="hidden md:inline text-[9px] bg-surface-container-high px-1 py-0.2 rounded font-mono">F4</kbd>
          </button>

          {/* + New Customer */}
          <button
            type="button"
            onClick={onOpenNewCustomer}
            className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high text-on-surface rounded border border-surface-container-highest font-bold flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[15px]">person_add</span>
            <span>+ Customer</span>
          </button>

          {/* Hold Bill */}
          <button
            type="button"
            disabled={cartCount === 0}
            onClick={onHoldCurrentBill}
            className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high disabled:opacity-40 text-on-surface rounded border border-surface-container-highest font-bold flex items-center gap-1"
            title="Hold current bill (Ctrl+S)"
          >
            <span className="material-symbols-outlined text-[15px]">pause_circle</span>
            <span>Hold Bill</span>
            <kbd className="hidden md:inline text-[9px] bg-surface-container-high px-1 py-0.2 rounded font-mono">Ctrl+S</kbd>
          </button>

          {/* Recall Bill with Badge */}
          <button
            type="button"
            onClick={onOpenHeldBills}
            className={`px-2.5 py-1 rounded border font-bold flex items-center gap-1.5 transition-colors ${
              heldCount > 0
                ? 'bg-secondary/15 border-secondary text-secondary hover:bg-secondary/25'
                : 'bg-surface-container border-surface-container-highest text-outline hover:text-on-surface'
            }`}
            title="Recall held bills (Alt+R)"
          >
            <span className="material-symbols-outlined text-[15px]">play_circle</span>
            <span>Recall Bill</span>
            {heldCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-secondary text-on-secondary font-mono text-[10px] font-extrabold">
                {heldCount}
              </span>
            )}
            <kbd className="hidden md:inline text-[9px] bg-surface-container-high px-1 py-0.2 rounded font-mono text-outline">Alt+R</kbd>
          </button>

          {/* Sales Return */}
          <button
            type="button"
            onClick={onOpenSalesReturn}
            className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high text-on-surface rounded border border-surface-container-highest font-bold flex items-center gap-1"
            title="Process sales return against invoice"
          >
            <span className="material-symbols-outlined text-[15px]">assignment_return</span>
            <span>Sales Return</span>
          </button>

          {/* Print Last Invoice */}
          <button
            type="button"
            disabled={!hasLastInvoice}
            onClick={onPrintLastInvoice}
            className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high disabled:opacity-40 text-on-surface rounded border border-surface-container-highest font-bold flex items-center gap-1"
            title="Reprint last generated invoice (Alt+P)"
          >
            <span className="material-symbols-outlined text-[15px]">print</span>
            <span>Last Bill</span>
            <kbd className="hidden md:inline text-[9px] bg-surface-container-high px-1 py-0.2 rounded font-mono">Alt+P</kbd>
          </button>
        </div>
      </div>

      {/* Requirement 22: FAST SPARES / HIGH-TURNOVER SELECTION CHIP STRIP */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-0.5">
        <span className="text-[10px] font-bold uppercase text-outline shrink-0 flex items-center gap-1">
          <span className="material-symbols-outlined text-[13px] text-secondary">bolt</span>
          Fast Spares:
        </span>
        {quickCategories.map((cat, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleQuickAdd(cat.keywords)}
            className="px-2 py-0.5 rounded-full bg-surface-container hover:bg-secondary/15 hover:text-secondary hover:border-secondary border border-surface-container-high text-[11px] font-medium text-on-surface whitespace-nowrap transition-colors flex items-center gap-1 shrink-0"
          >
            <span>+</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
