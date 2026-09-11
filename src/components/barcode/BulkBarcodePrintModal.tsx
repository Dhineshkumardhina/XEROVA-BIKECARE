import React, { useState } from 'react';
import { SparePart } from '../../types';

interface BulkBarcodePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  parts: SparePart[];
}

export const BulkBarcodePrintModal: React.FC<BulkBarcodePrintModalProps> = ({
  isOpen,
  onClose,
  parts
}) => {
  const [labelsPerItem, setLabelsPerItem] = useState<number>(2);
  const [labelSize, setLabelSize] = useState<'50x25' | '38x25' | '100x50'>('50x25');

  const [showPrice, setShowPrice] = useState<boolean>(true);
  const [showPartNumber, setShowPartNumber] = useState<boolean>(true);
  const [showItemName, setShowItemName] = useState<boolean>(true);
  const [showRackBin, setShowRackBin] = useState<boolean>(true);

  if (!isOpen) return null;

  const totalLabels = parts.length * labelsPerItem;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 bg-black/50 backdrop-blur-[1px] animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-surface-container-lowest rounded shadow-2xl border border-surface-container-high flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-surface-container-low border-b border-surface-container-high flex items-center justify-between">
          <div>
            <h2 className="font-headline-md text-base font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[20px]">print</span>
              <span>Bulk Barcode Label Printing</span>
            </h2>
            <p className="text-xs text-outline mt-0.5">
              Selected: <strong className="text-on-surface">{parts.length} items</strong> • Total labels to generate: <strong className="text-secondary">{totalLabels} stickers</strong>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-container text-outline hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Configuration Toolbar */}
        <div className="p-4 border-b border-surface-container-high bg-surface-container-low flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="text-outline font-bold text-[10px] uppercase block mb-1">Labels per SKU</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={labelsPerItem}
                  onChange={e => setLabelsPerItem(Math.max(1, Number(e.target.value)))}
                  className="w-16 py-1 px-2 rounded bg-surface-container border border-surface-container-highest text-on-surface font-mono font-bold text-center"
                />
                <span className="text-outline text-[11px]">copies each</span>
              </div>
            </div>

            <div>
              <label className="text-outline font-bold text-[10px] uppercase block mb-1">Label Size</label>
              <select
                value={labelSize}
                onChange={e => setLabelSize(e.target.value as any)}
                className="py-1 px-2.5 rounded bg-surface-container border border-surface-container-highest text-on-surface font-mono text-xs"
              >
                <option value="50x25">50mm x 25mm (Standard 2"x1")</option>
                <option value="38x25">38mm x 25mm (Compact Spares)</option>
                <option value="100x50">100mm x 50mm (Master Box)</option>
              </select>
            </div>
          </div>

          {/* Visibility options */}
          <div className="flex items-center gap-3 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showItemName}
                onChange={e => setShowItemName(e.target.checked)}
                className="rounded text-secondary focus:ring-0"
              />
              <span>Item Name</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showPartNumber}
                onChange={e => setShowPartNumber(e.target.checked)}
                className="rounded text-secondary focus:ring-0"
              />
              <span>Part No</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showPrice}
                onChange={e => setShowPrice(e.target.checked)}
                className="rounded text-secondary focus:ring-0"
              />
              <span>Selling Price</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showRackBin}
                onChange={e => setShowRackBin(e.target.checked)}
                className="rounded text-secondary focus:ring-0"
              />
              <span>Rack Bin</span>
            </label>
          </div>
        </div>

        {/* Live Sticker Sheet Preview */}
        <div className="flex-1 overflow-y-auto p-5 bg-surface-container">
          <div className="text-xs text-outline mb-3 flex items-center justify-between">
            <span>Sticker Sheet Layout (Live Preview of first 12 labels):</span>
            <span className="font-mono text-on-surface font-semibold">Ready for Zebra / TSC / Citizen Thermal Printers</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {parts.slice(0, 12).map((part, idx) => {
              const partNo = part.partNumber || part.sku.replace('SKU-', '');
              return (
                <div
                  key={idx}
                  className="bg-white text-black p-2.5 rounded shadow-sm border border-neutral-300 flex flex-col justify-between h-36 select-none"
                >
                  <div className="flex items-center justify-between border-b border-black/20 pb-0.5 text-[8px] font-bold uppercase tracking-wider">
                    <span>BIKE ERP SPARES</span>
                    <span>HSN: {part.hsn}</span>
                  </div>

                  {showItemName && (
                    <div className="font-bold text-[10px] leading-tight line-clamp-2 my-0.5 text-neutral-900">
                      {part.name}
                    </div>
                  )}

                  {/* SVG Barcode */}
                  <div className="py-0.5 flex flex-col items-center justify-center">
                    <svg className="w-full h-8" viewBox="0 0 200 32" preserveAspectRatio="none">
                      <rect x="0" y="0" width="3" height="32" fill="#000" />
                      <rect x="5" y="0" width="2" height="32" fill="#000" />
                      <rect x="9" y="0" width="4" height="32" fill="#000" />
                      <rect x="15" y="0" width="3" height="32" fill="#000" />
                      <rect x="20" y="0" width="5" height="32" fill="#000" />
                      <rect x="28" y="0" width="2" height="32" fill="#000" />
                      <rect x="32" y="0" width="4" height="32" fill="#000" />
                      <rect x="38" y="0" width="6" height="32" fill="#000" />
                      <rect x="46" y="0" width="3" height="32" fill="#000" />
                      <rect x="51" y="0" width="4" height="32" fill="#000" />
                      <rect x="57" y="0" width="2" height="32" fill="#000" />
                      <rect x="61" y="0" width="5" height="32" fill="#000" />
                      <rect x="68" y="0" width="3" height="32" fill="#000" />
                      <rect x="73" y="0" width="4" height="32" fill="#000" />
                      <rect x="79" y="0" width="2" height="32" fill="#000" />
                      <rect x="83" y="0" width="5" height="32" fill="#000" />
                      <rect x="90" y="0" width="3" height="32" fill="#000" />
                      <rect x="95" y="0" width="4" height="32" fill="#000" />
                      <rect x="101" y="0" width="2" height="32" fill="#000" />
                      <rect x="105" y="0" width="6" height="32" fill="#000" />
                      <rect x="113" y="0" width="2" height="32" fill="#000" />
                      <rect x="117" y="0" width="4" height="32" fill="#000" />
                      <rect x="123" y="0" width="3" height="32" fill="#000" />
                      <rect x="128" y="0" width="5" height="32" fill="#000" />
                      <rect x="135" y="0" width="2" height="32" fill="#000" />
                      <rect x="139" y="0" width="6" height="32" fill="#000" />
                      <rect x="147" y="0" width="3" height="32" fill="#000" />
                      <rect x="152" y="0" width="4" height="32" fill="#000" />
                      <rect x="158" y="0" width="2" height="32" fill="#000" />
                      <rect x="162" y="0" width="5" height="32" fill="#000" />
                      <rect x="169" y="0" width="3" height="32" fill="#000" />
                      <rect x="174" y="0" width="4" height="32" fill="#000" />
                      <rect x="180" y="0" width="2" height="32" fill="#000" />
                      <rect x="184" y="0" width="6" height="32" fill="#000" />
                      <rect x="192" y="0" width="3" height="32" fill="#000" />
                      <rect x="197" y="0" width="3" height="32" fill="#000" />
                    </svg>
                    <span className="font-mono text-[8px] tracking-wider text-neutral-700">{part.barcode}</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-black/20 pt-0.5 text-[9px] font-mono leading-none">
                    {showPartNumber && (
                      <span className="font-bold">
                        #{partNo} {showRackBin ? `• ${part.rackBin}` : ''}
                      </span>
                    )}
                    {showPrice && (
                      <span className="font-extrabold text-black text-[11px]">
                        ₹{part.counterPrice}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface-container-low border-t border-surface-container-high flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 hover:bg-surface-container text-on-surface rounded text-xs font-semibold"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => alert(`Exported PDF for ${totalLabels} barcode labels.`)}
              className="px-4 py-2 bg-surface-container hover:bg-surface-container-highest text-on-surface rounded text-xs font-semibold border border-surface-container-highest flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
              <span>Export PDF Sheet</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 bg-secondary hover:bg-secondary/90 text-on-secondary rounded text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Print {totalLabels} Labels</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
