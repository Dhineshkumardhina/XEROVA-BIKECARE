import React, { useState } from 'react';

interface ExcelExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalCount: number;
  filteredCount: number;
  selectedCount: number;
  onConfirmExport: (config: any) => void;
}

export const ExcelExportModal: React.FC<ExcelExportModalProps> = ({
  isOpen,
  onClose,
  totalCount,
  filteredCount,
  selectedCount,
  onConfirmExport
}) => {
  const [scope, setScope] = useState<'all' | 'filtered' | 'selected'>(
    selectedCount > 0 ? 'selected' : 'filtered'
  );
  const [format, setFormat] = useState<'xlsx' | 'csv'>('xlsx');

  // Optional Field Groups (Requirement 8)
  const [includeBasic, setIncludeBasic] = useState(true);
  const [includePricing, setIncludePricing] = useState(true);
  const [includeInventory, setIncludeInventory] = useState(true);
  const [includeGst, setIncludeGst] = useState(true);
  const [includeVehicles, setIncludeVehicles] = useState(true);

  if (!isOpen) return null;

  const countToExport =
    scope === 'selected' ? selectedCount : scope === 'filtered' ? filteredCount : totalCount;

  const handleExport = () => {
    onConfirmExport({
      scope,
      format,
      fields: {
        basic: includeBasic,
        pricing: includePricing,
        inventory: includeInventory,
        gst: includeGst,
        vehicles: includeVehicles
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 bg-black/50 backdrop-blur-[1px] animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-surface-container-lowest rounded shadow-2xl border border-surface-container-high flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-surface-container-low border-b border-surface-container-high flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">download</span>
            <h2 className="font-headline-md text-base font-bold text-on-surface">Export Item Master to Excel</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-container text-outline hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Export Scope */}
          <div className="space-y-2">
            <label className="block text-outline font-bold uppercase tracking-wider text-[10px]">
              1. Select Export Scope
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setScope('filtered')}
                className={`p-3 rounded border text-left transition-colors ${
                  scope === 'filtered'
                    ? 'border-secondary bg-secondary-container/20 text-on-surface'
                    : 'border-surface-container-high bg-surface-container-low hover:bg-surface-container text-outline'
                }`}
              >
                <span className="font-bold block text-sm text-on-surface">{filteredCount.toLocaleString()}</span>
                <span className="text-[11px]">Filtered Items</span>
              </button>

              <button
                type="button"
                onClick={() => setScope('all')}
                className={`p-3 rounded border text-left transition-colors ${
                  scope === 'all'
                    ? 'border-secondary bg-secondary-container/20 text-on-surface'
                    : 'border-surface-container-high bg-surface-container-low hover:bg-surface-container text-outline'
                }`}
              >
                <span className="font-bold block text-sm text-on-surface">{totalCount.toLocaleString()}</span>
                <span className="text-[11px]">All Catalog Items</span>
              </button>

              <button
                type="button"
                disabled={selectedCount === 0}
                onClick={() => setScope('selected')}
                className={`p-3 rounded border text-left transition-colors ${
                  selectedCount === 0
                    ? 'opacity-40 cursor-not-allowed border-surface-container-high bg-surface-container-low'
                    : scope === 'selected'
                    ? 'border-secondary bg-secondary-container/20 text-on-surface'
                    : 'border-surface-container-high bg-surface-container-low hover:bg-surface-container text-outline'
                }`}
              >
                <span className="font-bold block text-sm text-on-surface">{selectedCount}</span>
                <span className="text-[11px]">Selected Rows</span>
              </button>
            </div>
          </div>

          {/* Export Format */}
          <div className="space-y-2">
            <label className="block text-outline font-bold uppercase tracking-wider text-[10px]">
              2. File Format
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  checked={format === 'xlsx'}
                  onChange={() => setFormat('xlsx')}
                  className="text-secondary focus:ring-0"
                />
                <span className="font-semibold text-on-surface">Excel Workbook (.xlsx)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="format"
                  checked={format === 'csv'}
                  onChange={() => setFormat('csv')}
                  className="text-secondary focus:ring-0"
                />
                <span className="font-semibold text-on-surface">Comma Separated Values (.csv)</span>
              </label>
            </div>
          </div>

          {/* Optional Fields (Requirement 8) */}
          <div className="space-y-2">
            <label className="block text-outline font-bold uppercase tracking-wider text-[10px]">
              3. Select Included Columns
            </label>
            <div className="space-y-1.5 p-3 rounded bg-surface-container-low border border-surface-container-high">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeBasic}
                  onChange={e => setIncludeBasic(e.target.checked)}
                  className="rounded text-secondary focus:ring-0"
                />
                <span><strong>Basic Information</strong> (Part Number, Item Name, Brand, Category, Barcode)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includePricing}
                  onChange={e => setIncludePricing(e.target.checked)}
                  className="rounded text-secondary focus:ring-0"
                />
                <span><strong>Pricing &amp; Margins</strong> (MRP, Purchase Rate, Selling Rate, Wholesale Rate)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeInventory}
                  onChange={e => setIncludeInventory(e.target.checked)}
                  className="rounded text-secondary focus:ring-0"
                />
                <span><strong>Inventory Levels</strong> (Current Stock, Min Stock, Reorder Level, Rack/Bin)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeGst}
                  onChange={e => setIncludeGst(e.target.checked)}
                  className="rounded text-secondary focus:ring-0"
                />
                <span><strong>GST &amp; Taxation</strong> (HSN Code, GST Rate %)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeVehicles}
                  onChange={e => setIncludeVehicles(e.target.checked)}
                  className="rounded text-secondary focus:ring-0"
                />
                <span><strong>Vehicle Compatibility</strong> (Compatible Models, Engine Sizes, Fitment Types)</span>
              </label>
            </div>
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

          <button
            type="button"
            onClick={handleExport}
            className="px-5 py-2 bg-secondary hover:bg-secondary/90 text-on-secondary rounded text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span>Export {countToExport.toLocaleString()} Records</span>
          </button>
        </div>
      </div>
    </div>
  );
};
