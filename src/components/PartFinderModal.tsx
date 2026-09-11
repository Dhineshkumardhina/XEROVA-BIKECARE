import React, { useState } from 'react';
import { SparePart } from '../types';

interface PartFinderModalProps {
  parts: SparePart[];
  isOpen: boolean;
  onClose: () => void;
  onSelectPartForDrawer: (part: SparePart) => void;
  onAddToCart?: (part: SparePart) => void;
}

export const PartFinderModal: React.FC<PartFinderModalProps> = ({
  parts,
  isOpen,
  onClose,
  onSelectPartForDrawer,
  onAddToCart
}) => {
  if (!isOpen) return null;

  const [selectedBike, setSelectedBike] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const bikeList = [
    'All',
    'Apache RTR 160',
    'Pulsar 150',
    'Splendor',
    'Honda Shine',
    'Activa',
    'Yamaha FZ',
    'Classic 350',
    'Universal'
  ];

  const filtered = parts.filter(part => {
    if (selectedBike !== 'All') {
      const match = part.vehicles.some(v => v.toLowerCase().includes(selectedBike.toLowerCase()));
      if (!match) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        part.name.toLowerCase().includes(q) ||
        part.sku.toLowerCase().includes(q) ||
        part.category.toLowerCase().includes(q) ||
        part.rackBin.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest w-full max-w-3xl rounded-lg shadow-2xl border border-surface-container-highest overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-3 bg-surface-container flex items-center justify-between border-b border-surface-container-high select-none">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">two_wheeler</span>
            <div>
              <div className="font-headline-md text-sm text-on-surface font-bold flex items-center gap-1.5">
                <span>Fast Motorcycle Part Finder</span>
                <kbd className="px-1.5 py-0.5 rounded bg-surface-container-highest font-shortcut-key text-[10px] text-primary">
                  F2
                </kbd>
              </div>
              <div className="text-[11px] text-outline">
                Cross-referenced compatibility catalog with rack &amp; bin locations
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

        {/* Search & Model Chips */}
        <div className="p-3 bg-surface-container-low border-b border-surface-container-high space-y-2">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-outline text-[18px]">search</span>
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search part name, OEM code, category (e.g. Brake, Clutch, Cable, Oil)..."
              className="w-full h-8 pl-8 pr-3 bg-surface-container-lowest rounded text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[10px] font-bold text-outline uppercase whitespace-nowrap">Filter Model:</span>
            {bikeList.map(bike => (
              <button
                key={bike}
                onClick={() => setSelectedBike(bike)}
                className={`px-2.5 py-1 rounded text-xs whitespace-nowrap font-semibold transition-colors ${
                  selectedBike === bike
                    ? 'bg-secondary text-on-secondary shadow-2xs'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {bike}
              </button>
            ))}
          </div>
        </div>

        {/* Parts Grid / List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-outline text-xs">
              No matching spare parts found for the selected model. Try clearing search filters.
            </div>
          ) : (
            filtered.map(part => {
              const isOutOfStock = part.currentStock === 0;
              return (
                <div
                  key={part.id}
                  className="p-2.5 rounded bg-surface-container-lowest border border-surface-container-high hover:border-secondary transition-all flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-secondary">{part.sku}</span>
                      <span className="text-xs font-semibold text-on-surface truncate">{part.name}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-outline">
                      <span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface font-mono">
                        Bin: {part.rackBin}
                      </span>
                      <span>Brand: <strong className="text-on-surface">{part.brand}</strong></span>
                      <span>Category: {part.category}</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-1">
                      {part.vehicles.map((v, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-surface-container text-outline">
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end flex-shrink-0">
                    <div className="font-mono text-sm font-bold text-on-surface">₹{part.counterPrice.toFixed(2)}</div>
                    <div className={`text-[11px] font-bold ${isOutOfStock ? 'text-error' : 'text-on-tertiary-container'}`}>
                      {isOutOfStock ? 'Out of Stock' : `${part.currentStock} in stock`}
                    </div>

                    <div className="flex items-center gap-1.5 mt-2">
                      <button
                        onClick={() => {
                          onSelectPartForDrawer(part);
                          onClose();
                        }}
                        className="px-2 py-1 bg-surface-container hover:bg-surface-container-high text-on-surface rounded text-[11px] font-semibold transition-colors"
                      >
                        Stock Card
                      </button>
                      {onAddToCart && !isOutOfStock && (
                        <button
                          onClick={() => {
                            onAddToCart(part);
                            alert(`Added 1x ${part.name} to POS Cart!`);
                          }}
                          className="px-2.5 py-1 bg-secondary hover:bg-secondary-container text-on-secondary rounded text-[11px] font-semibold transition-colors flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[14px]">add_shopping_cart</span>
                          Add to Bill
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-surface-container border-t border-surface-container-high flex items-center justify-between text-xs text-outline">
          <span>Found {filtered.length} compatible parts</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-surface-container-lowest hover:bg-surface-container text-on-surface rounded text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
