import React, { useState, useEffect, useRef } from 'react';
import { SparePart } from '../../types';

interface POSItemSearchProps {
  parts: SparePart[];
  onAddToCart: (part: SparePart) => void;
  onSelectItemForDetails: (part: SparePart) => void;
  isScannerReady?: boolean;
}

export const POSItemSearch: React.FC<POSItemSearchProps> = ({
  parts,
  onAddToCart,
  onSelectItemForDetails,
  isScannerReady = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [barcodeInputMode, setBarcodeInputMode] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter parts based on input: Barcode, SKU/Part No, Name, Brand, Category, Vehicles
  const query = searchTerm.trim().toLowerCase();
  const matchedParts = query
    ? parts.filter(p => {
        const skuMatch = p.sku.toLowerCase().includes(query) || p.sku.replace(/\D/g, '').includes(query);
        const nameMatch = p.name.toLowerCase().includes(query);
        const barcodeMatch = p.barcode.toLowerCase().includes(query);
        const brandMatch = p.brand.toLowerCase().includes(query);
        const catMatch = p.category.toLowerCase().includes(query);
        const oemMatch = p.oemCode?.toLowerCase().includes(query);
        const vehMatch = p.vehicles.some(v => v.toLowerCase().includes(query));
        return skuMatch || nameMatch || barcodeMatch || brandMatch || catMatch || oemMatch || vehMatch;
      }).slice(0, 8)
    : [];

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
    setIsOpen(matchedParts.length > 0 && query.length > 0);
  }, [searchTerm]);

  // Handle global F2 shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If enter is pressed and there is an exact barcode match
    if (e.key === 'Enter') {
      e.preventDefault();
      // Check for exact barcode scan match first
      const exactBarcodeMatch = parts.find(p => p.barcode === searchTerm.trim());
      if (exactBarcodeMatch) {
        onAddToCart(exactBarcodeMatch);
        setSearchTerm('');
        setIsOpen(false);
        return;
      }

      // Or if a dropdown item is highlighted
      if (matchedParts.length > 0 && matchedParts[selectedIndex]) {
        onAddToCart(matchedParts[selectedIndex]);
        setSearchTerm('');
        setIsOpen(false);
      }
      return;
    }

    // Keyboard navigation
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < matchedParts.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelectPart = (part: SparePart) => {
    onAddToCart(part);
    setSearchTerm('');
    setIsOpen(false);
    searchInputRef.current?.focus();
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2 bg-surface-container-lowest border-2 border-secondary/60 focus-within:border-secondary rounded-md shadow-sm px-3 py-2 transition-all">
        {/* Search icon or Barcode scanner indicator */}
        <div className="flex items-center gap-1.5 text-secondary">
          <span className="material-symbols-outlined text-[24px]">barcode_scanner</span>
        </div>

        {/* Big Search Input */}
        <input
          ref={searchInputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (matchedParts.length > 0) setIsOpen(true);
          }}
          placeholder="Scan barcode or search part number (e.g. 1302), item name, vehicle..."
          className="flex-1 bg-transparent text-sm md:text-base font-medium text-on-surface placeholder:text-outline/70 focus:outline-none tracking-wide"
          autoFocus
        />

        {/* Clear button if text */}
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              setIsOpen(false);
              searchInputRef.current?.focus();
            }}
            className="text-outline hover:text-on-surface p-1 rounded"
            title="Clear"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}

        {/* Scanner Status Badge */}
        <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-surface-container-high text-xs">
          <span className={`w-2 h-2 rounded-full ${isScannerReady ? 'bg-secondary animate-pulse' : 'bg-outline'}`} />
          <span className="font-shortcut-key text-[11px] text-outline font-semibold">
            {isScannerReady ? 'Scanner Ready' : 'Standby'}
          </span>
          <kbd className="hidden lg:inline px-1 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono text-[10px]">
            F2
          </kbd>
        </div>
      </div>

      {/* Immediate Matching Results Dropdown */}
      {isOpen && matchedParts.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-surface-container-lowest border border-surface-container-highest rounded-md shadow-2xl overflow-hidden divide-y divide-surface-container-high/60">
          <div className="px-3 py-1.5 bg-surface-container-low flex justify-between items-center text-[11px] font-label-caps text-outline uppercase font-semibold">
            <span>Search Results ({matchedParts.length} matches)</span>
            <span>Use ↑↓ arrows &amp; press Enter to Add</span>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {matchedParts.map((part, idx) => {
              const isSelected = idx === selectedIndex;
              const isOut = part.currentStock === 0;

              return (
                <div
                  key={part.id}
                  onClick={() => handleSelectPart(part)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-2.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-secondary/10 border-l-4 border-secondary' : 'hover:bg-surface-container-low'
                  }`}
                >
                  {/* Left: Part Code & Name & Fitment */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-secondary bg-surface-container px-1.5 py-0.5 rounded">
                        {part.sku.replace('SKU-', '')}
                      </span>
                      <span className="font-semibold text-xs md:text-sm text-on-surface truncate">
                        {part.name}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
                        {part.brand}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-outline">
                      <span className="truncate">
                        Compatible: <strong className="text-on-surface-variant">{part.vehicles.slice(0, 2).join(' / ')}</strong>
                      </span>
                      <span>•</span>
                      <span>Bin: <strong className="font-mono text-on-surface-variant">{part.rackBin}</strong></span>
                      <span>•</span>
                      <span>HSN: <strong className="font-mono">{part.hsn}</strong></span>
                    </div>
                  </div>

                  {/* Middle: Stock & Pricing */}
                  <div className="flex items-center gap-4 text-right shrink-0">
                    <div>
                      <div className="text-[10px] text-outline uppercase font-mono">Stock</div>
                      <div className={`font-mono text-xs font-bold ${isOut ? 'text-error' : 'text-on-tertiary-container'}`}>
                        {isOut ? '0 (Out)' : `${part.currentStock} ${part.unit}`}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-outline uppercase line-through font-mono">MRP ₹{part.mrp}</div>
                      <div className="font-mono text-sm font-bold text-secondary">
                        ₹{part.counterPrice.toFixed(2)}
                      </div>
                    </div>

                    {/* Actions: View details button & Add button */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectItemForDetails(part);
                        }}
                        title="View Full Item Details"
                        className="p-1 rounded text-outline hover:text-on-surface hover:bg-surface-container"
                      >
                        <span className="material-symbols-outlined text-[18px]">info</span>
                      </button>

                      <button
                        type="button"
                        disabled={isOut}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectPart(part);
                        }}
                        className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 ${
                          isOut
                            ? 'bg-surface-container text-outline cursor-not-allowed'
                            : 'bg-secondary text-on-secondary hover:bg-secondary-container'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">add</span>
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
