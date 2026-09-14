import React, { useState } from 'react';
import { SparePart } from '../../types';

interface BarcodeManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  part: SparePart | null;
}

export const BarcodeManagementModal: React.FC<BarcodeManagementModalProps> = ({
  isOpen,
  onClose,
  part
}) => {
  const [barcodeType, setBarcodeType] = useState<'Code 128' | 'QR Code'>('Code 128');
  const [labelQty, setLabelQty] = useState<number>(2);
  const [labelSize, setLabelSize] = useState<'50x25' | '38x25' | '100x50'>('50x25');

  // Display toggles
  const [showPrice, setShowPrice] = useState<boolean>(true);
  const [showPartNumber, setShowPartNumber] = useState<boolean>(true);
  const [showItemName, setShowItemName] = useState<boolean>(true);
  const [showHsn, setShowHsn] = useState<boolean>(true);
  const [companyHeader, setCompanyHeader] = useState<string>('BIKE ERP SPARES');

  if (!isOpen || !part) return null;

  const partNumber = part.partNumber || part.sku.replace('SKU-', '');

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 bg-black/50 backdrop-blur-[1px] animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-surface-container-lowest rounded shadow-2xl border border-surface-container-high flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-surface-container-low border-b border-surface-container-high flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">qr_code_2</span>
            <div>
              <h2 className="font-headline-md text-base font-bold text-on-surface">Barcode Label Generator</h2>
              <p className="text-xs text-outline">{part.name} (Part #{partNumber})</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-container text-outline hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Controls Column */}
          <div className="space-y-4 text-xs">
            {/* Barcode Type */}
            <div>
              <label className="block text-outline font-bold uppercase tracking-wider text-[10px] mb-1">
                Barcode Symbology
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBarcodeType('Code 128')}
                  className={`py-2 px-3 rounded border text-center font-semibold transition-colors ${
                    barcodeType === 'Code 128'
                      ? 'border-secondary bg-secondary-container/20 text-on-surface'
                      : 'border-surface-container-high bg-surface-container-low text-outline'
                  }`}
                >
                  Code 128 (1D)
                </button>
                <button
                  type="button"
                  onClick={() => setBarcodeType('QR Code')}
                  className={`py-2 px-3 rounded border text-center font-semibold transition-colors ${
                    barcodeType === 'QR Code'
                      ? 'border-secondary bg-secondary-container/20 text-on-surface'
                      : 'border-surface-container-high bg-surface-container-low text-outline'
                  }`}
                >
                  2D QR Code
                </button>
              </div>
            </div>

            {/* Label Size */}
            <div>
              <label className="block text-outline font-bold uppercase tracking-wider text-[10px] mb-1">
                Label Dimension (Thermal / Sticker)
              </label>
              <select
                value={labelSize}
                onChange={e => setLabelSize(e.target.value as any)}
                className="w-full py-1.5 px-2.5 rounded bg-surface-container border border-surface-container-highest text-on-surface text-xs focus:outline-none focus:border-secondary font-mono"
              >
                <option value="50x25">50mm x 25mm (Standard 2"x1" Shelf Tag)</option>
                <option value="38x25">38mm x 25mm (Compact Spares Sticker)</option>
                <option value="100x50">100mm x 50mm (Master Box / Carton)</option>
              </select>
            </div>

            {/* Label Quantity */}
            <div>
              <label className="block text-outline font-bold uppercase tracking-wider text-[10px] mb-1">
                Number of Copies to Print
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={labelQty}
                  onChange={e => setLabelQty(Math.max(1, Number(e.target.value)))}
                  className="w-24 py-1.5 px-2.5 rounded bg-surface-container border border-surface-container-highest text-on-surface font-mono font-bold text-center focus:outline-none"
                />
                <div className="flex items-center gap-1">
                  {[1, 2, 5, 10, 20].map(qty => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setLabelQty(qty)}
                      className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-highest text-on-surface font-mono text-[11px]"
                    >
                      {qty}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Visibility Toggles */}
            <div className="space-y-1.5 p-2.5 rounded bg-surface-container-low border border-surface-container-high">
              <span className="block text-[10px] font-bold uppercase text-outline mb-1">Content Options</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showItemName}
                  onChange={e => setShowItemName(e.target.checked)}
                  className="rounded text-secondary focus:ring-0"
                />
                <span>Show Item Name</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPartNumber}
                  onChange={e => setShowPartNumber(e.target.checked)}
                  className="rounded text-secondary focus:ring-0"
                />
                <span>Show Part Number &amp; Rack</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPrice}
                  onChange={e => setShowPrice(e.target.checked)}
                  className="rounded text-secondary focus:ring-0"
                />
                <span>Show MRP &amp; Selling Rate</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showHsn}
                  onChange={e => setShowHsn(e.target.checked)}
                  className="rounded text-secondary focus:ring-0"
                />
                <span>Show HSN Code</span>
              </label>
            </div>
          </div>

          {/* Live Preview Column */}
          <div className="flex flex-col items-center justify-center p-4 bg-surface-container rounded border border-surface-container-high">
            <span className="text-[10px] font-bold uppercase text-outline mb-3 tracking-wider">
              Live Label Preview ({labelSize}mm)
            </span>

            {/* Realistic Barcode Label Card */}
            <div
              className={`bg-white text-black p-3 rounded shadow-md border border-neutral-300 flex flex-col justify-between select-none ${
                labelSize === '38x25'
                  ? 'w-56 h-36 text-[10px]'
                  : labelSize === '100x50'
                  ? 'w-72 h-44 text-xs'
                  : 'w-64 h-40 text-xs'
              }`}
            >
              {/* Top Header */}
              <div className="flex items-center justify-between border-b border-black/20 pb-1 leading-tight">
                <span className="font-bold uppercase tracking-wider text-[9px] truncate">{companyHeader}</span>
                {showHsn && <span className="font-mono text-[9px]">HSN: {part.hsn}</span>}
              </div>

              {/* Item Name */}
              {showItemName && (
                <div className="font-bold leading-snug line-clamp-2 mt-0.5 text-neutral-900 text-[11px]">
                  {part.name}
                </div>
              )}

              {/* Barcode Graphic */}
              <div className="py-1 flex flex-col items-center justify-center">
                {barcodeType === 'Code 128' ? (
                  <>
                    {/* Realistic SVG Barcode 1D */}
                    <svg className="w-full h-10" viewBox="0 0 240 40" preserveAspectRatio="none">
                      <rect x="0" y="0" width="4" height="36" fill="#000" />
                      <rect x="6" y="0" width="2" height="36" fill="#000" />
                      <rect x="10" y="0" width="5" height="36" fill="#000" />
                      <rect x="18" y="0" width="3" height="36" fill="#000" />
                      <rect x="24" y="0" width="6" height="36" fill="#000" />
                      <rect x="34" y="0" width="2" height="36" fill="#000" />
                      <rect x="38" y="0" width="4" height="36" fill="#000" />
                      <rect x="46" y="0" width="7" height="36" fill="#000" />
                      <rect x="56" y="0" width="3" height="36" fill="#000" />
                      <rect x="62" y="0" width="5" height="36" fill="#000" />
                      <rect x="70" y="0" width="2" height="36" fill="#000" />
                      <rect x="75" y="0" width="6" height="36" fill="#000" />
                      <rect x="84" y="0" width="4" height="36" fill="#000" />
                      <rect x="91" y="0" width="5" height="36" fill="#000" />
                      <rect x="99" y="0" width="2" height="36" fill="#000" />
                      <rect x="104" y="0" width="6" height="36" fill="#000" />
                      <rect x="113" y="0" width="3" height="36" fill="#000" />
                      <rect x="119" y="0" width="5" height="36" fill="#000" />
                      <rect x="127" y="0" width="2" height="36" fill="#000" />
                      <rect x="132" y="0" width="7" height="36" fill="#000" />
                      <rect x="142" y="0" width="3" height="36" fill="#000" />
                      <rect x="148" y="0" width="5" height="36" fill="#000" />
                      <rect x="156" y="0" width="2" height="36" fill="#000" />
                      <rect x="161" y="0" width="6" height="36" fill="#000" />
                      <rect x="170" y="0" width="4" height="36" fill="#000" />
                      <rect x="177" y="0" width="5" height="36" fill="#000" />
                      <rect x="185" y="0" width="3" height="36" fill="#000" />
                      <rect x="191" y="0" width="6" height="36" fill="#000" />
                      <rect x="200" y="0" width="2" height="36" fill="#000" />
                      <rect x="205" y="0" width="4" height="36" fill="#000" />
                      <rect x="212" y="0" width="7" height="36" fill="#000" />
                      <rect x="222" y="0" width="3" height="36" fill="#000" />
                      <rect x="228" y="0" width="5" height="36" fill="#000" />
                      <rect x="236" y="0" width="4" height="36" fill="#000" />
                    </svg>
                    <span className="font-mono text-[10px] tracking-widest mt-0.5">{part.barcode}</span>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    {/* SVG QR Code Simulation */}
                    <div className="w-16 h-16 bg-black p-1 flex flex-col justify-between">
                      <div className="flex justify-between">
                        <div className="w-4 h-4 bg-white flex items-center justify-center">
                          <div className="w-2 h-2 bg-black"></div>
                        </div>
                        <div className="w-4 h-4 bg-white flex items-center justify-center">
                          <div className="w-2 h-2 bg-black"></div>
                        </div>
                      </div>
                      <div className="w-2 h-2 bg-white mx-auto"></div>
                      <div className="flex justify-between">
                        <div className="w-4 h-4 bg-white flex items-center justify-center">
                          <div className="w-2 h-2 bg-black"></div>
                        </div>
                        <div className="w-2 h-2 bg-white"></div>
                      </div>
                    </div>
                    <div className="font-mono text-[10px] leading-tight">
                      <div>ID: {partNumber}</div>
                      <div>BIN: {part.rackBin}</div>
                      <div>{part.brand}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Row: Part No, Price, Rack */}
              <div className="flex items-center justify-between border-t border-black/20 pt-1 leading-none">
                {showPartNumber && (
                  <span className="font-mono font-bold text-[10px]">
                    #{partNumber} • {part.rackBin}
                  </span>
                )}

                {showPrice && (
                  <div className="font-mono font-bold text-right">
                    <span className="text-[9px] line-through text-neutral-500 mr-1">MRP ₹{part.mrp}</span>
                    <span className="text-sm text-black font-extrabold">₹{part.counterPrice}</span>
                  </div>
                )}
              </div>
            </div>

            <span className="text-[11px] text-outline mt-3">
              Will spool {labelQty} label{labelQty > 1 ? 's' : ''} to default label printer.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
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
              onClick={handleDownloadPdf}
              className="px-4 py-2 bg-surface-container hover:bg-surface-container-highest text-on-surface rounded text-xs font-semibold border border-surface-container-highest flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
              <span>Download PDF</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 bg-secondary hover:bg-secondary/90 text-on-secondary rounded text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Print {labelQty} Label{labelQty > 1 ? 's' : ''}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
