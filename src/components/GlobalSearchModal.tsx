import React, { useState, useEffect } from 'react';
import { SparePart, Invoice } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  parts: SparePart[];
  invoices: Invoice[];
  onSelectPart: (part: SparePart) => void;
  onSelectInvoice: (invoice: Invoice) => void;
  onNavigate: (screen: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  parts,
  invoices,
  onSelectPart,
  onSelectInvoice,
  onNavigate
}) => {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const matchingParts = parts.filter(p =>
    !query ||
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.sku.toLowerCase().includes(query.toLowerCase()) ||
    p.rackBin.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  const matchingInvoices = invoices.filter(i =>
    !query ||
    i.id.toLowerCase().includes(query.toLowerCase()) ||
    i.customerName.toLowerCase().includes(query.toLowerCase()) ||
    (i.vehicleNo && i.vehicleNo.toLowerCase().includes(query.toLowerCase()))
  ).slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-16 p-4 animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest w-full max-w-xl rounded-lg shadow-2xl border border-surface-container-highest overflow-hidden flex flex-col">
        {/* Search Input */}
        <div className="p-3 bg-surface-container flex items-center gap-2 border-b border-surface-container-high">
          <span className="material-symbols-outlined text-secondary text-[20px]">search</span>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search parts, invoices, racks, customers or shortcuts..."
            className="w-full bg-transparent text-sm text-on-surface focus:outline-none placeholder:text-outline"
          />
          <kbd className="px-1.5 py-0.5 rounded bg-surface-container-high text-outline text-[10px] font-mono">
            ESC
          </kbd>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-3 text-xs">
          {/* Quick Navigation / Shortcuts */}
          <div>
            <div className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
              ERP Shortcuts
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  onNavigate('pos');
                  onClose();
                }}
                className="p-2 rounded bg-surface-container-low hover:bg-surface-container text-left flex items-center justify-between"
              >
                <span className="font-semibold text-on-surface">New POS Counter Bill</span>
                <kbd className="px-1 py-0.5 rounded bg-surface-container text-[10px] font-mono">F4</kbd>
              </button>
              <button
                onClick={() => {
                  onNavigate('items-master');
                  onClose();
                }}
                className="p-2 rounded bg-surface-container-low hover:bg-surface-container text-left flex items-center justify-between"
              >
                <span className="font-semibold text-on-surface">Item Master &amp; Catalog</span>
                <kbd className="px-1 py-0.5 rounded bg-surface-container text-[10px] font-mono">F2</kbd>
              </button>
            </div>
          </div>

          {/* Matching Parts */}
          <div>
            <div className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
              Spare Parts Catalog ({matchingParts.length})
            </div>
            <div className="space-y-1">
              {matchingParts.map(part => (
                <div
                  key={part.id}
                  onClick={() => {
                    onSelectPart(part);
                    onClose();
                  }}
                  className="p-2 rounded hover:bg-surface-container-low cursor-pointer flex items-center justify-between border border-transparent hover:border-surface-container-high"
                >
                  <div>
                    <div className="font-semibold text-on-surface">{part.name}</div>
                    <div className="text-[11px] text-outline font-mono">
                      {part.sku} • Bin: {part.rackBin} • {part.brand}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-secondary">₹{part.counterPrice}</div>
                    <div className="text-[10px] text-on-tertiary-container font-semibold">
                      Stock: {part.currentStock}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Matching Invoices */}
          <div>
            <div className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
              Recent Invoices &amp; Bills ({matchingInvoices.length})
            </div>
            <div className="space-y-1">
              {matchingInvoices.map(inv => (
                <div
                  key={inv.id}
                  onClick={() => {
                    onSelectInvoice(inv);
                    onClose();
                  }}
                  className="p-2 rounded hover:bg-surface-container-low cursor-pointer flex items-center justify-between border border-transparent hover:border-surface-container-high"
                >
                  <div>
                    <div className="font-semibold text-on-surface flex items-center gap-1.5">
                      <span className="font-mono text-secondary">{inv.id}</span>
                      <span>• {inv.customerName}</span>
                    </div>
                    <div className="text-[11px] text-outline">
                      {inv.vehicleNo} • {inv.payMode}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-on-surface">₹{inv.totalAmount.toFixed(2)}</div>
                    <div className="text-[10px] font-semibold text-tertiary-fixed">{inv.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-surface-container border-t border-surface-container-high flex items-center justify-between text-[11px] text-outline">
          <span>Tip: Use ↑ ↓ arrows to navigate, Enter to open</span>
          <button
            onClick={onClose}
            className="text-secondary font-semibold hover:underline"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
