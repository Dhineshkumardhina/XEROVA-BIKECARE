import React, { useState, useMemo } from 'react';
import { SparePart, StockAdjustmentReason } from '../../types';
import { ItemDetailsDrawer } from './ItemDetailsDrawer';
import { ItemAddEditModal } from './ItemAddEditModal';
import { ExcelImportModal } from './ExcelImportModal';
import { ExcelExportModal } from './ExcelExportModal';
import { BarcodeManagementModal } from '../barcode/BarcodeManagementModal';
import { BulkBarcodePrintModal } from '../barcode/BulkBarcodePrintModal';
import { StockAdjustmentModal } from '../inventory/StockAdjustmentModal';

interface ItemMasterDashboardProps {
  parts: SparePart[];
  onUpdatePart: (updatedPart: SparePart) => void;
  onAddPart: (newPart: SparePart) => void;
  onViewStockLedger: (part: SparePart) => void;
  onStockAdjustment: (partId: string, qtyDelta: number, reason: StockAdjustmentReason, notes: string) => void;
}

export const ItemMasterDashboard: React.FC<ItemMasterDashboardProps> = ({
  parts,
  onUpdatePart,
  onAddPart,
  onViewStockLedger,
  onStockAdjustment
}) => {
  // Search and filter state (Requirements 2 & 3)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedVehicle, setSelectedVehicle] = useState('ALL');
  const [selectedGst, setSelectedGst] = useState('ALL');
  const [selectedStockStatus, setSelectedStockStatus] = useState('ALL');
  const [selectedActiveStatus, setSelectedActiveStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Sorting state
  const [sortField, setSortField] = useState<keyof SparePart | 'partNumber'>('partNumber');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Selection state
  const [selectedPartIds, setSelectedPartIds] = useState<Set<string>>(new Set());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Modals / Drawers state
  const [viewingPart, setViewingPart] = useState<SparePart | null>(null);
  const [editingPart, setEditingPart] = useState<SparePart | null>(null);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isExcelImportOpen, setIsExcelImportOpen] = useState(false);
  const [isExcelExportOpen, setIsExcelExportOpen] = useState(false);
  const [barcodeModalPart, setBarcodeModalPart] = useState<SparePart | null>(null);
  const [isBulkBarcodeOpen, setIsBulkBarcodeOpen] = useState(false);
  const [adjustModalPart, setAdjustModalPart] = useState<SparePart | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // High-Speed Search & Filter Retrieval (Requirement 2 & 3)
  const filteredParts = useMemo(() => {
    return parts.filter(part => {
      // Status filter
      if (selectedActiveStatus === 'ACTIVE' && part.isActive === false) return false;
      if (selectedActiveStatus === 'INACTIVE' && part.isActive !== false) return false;

      // Brand filter
      if (selectedBrand !== 'ALL' && part.brand !== selectedBrand) return false;

      // Category filter
      if (selectedCategory !== 'ALL' && part.category !== selectedCategory) return false;

      // Vehicle filter
      if (selectedVehicle !== 'ALL') {
        const matchesVeh = part.vehicles.some(v => v.toLowerCase().includes(selectedVehicle.toLowerCase()));
        if (!matchesVeh) return false;
      }

      // GST Rate filter
      if (selectedGst !== 'ALL' && String(part.gstRate) !== selectedGst) return false;

      // Stock status filter
      if (selectedStockStatus === 'LOW' && part.currentStock > part.minReorder) return false;
      if (selectedStockStatus === 'OUT' && part.currentStock > 0) return false;
      if (selectedStockStatus === 'NORMAL' && (part.currentStock <= part.minReorder || part.currentStock === 0)) return false;

      // Search Query: supports part number ("1302"), name ("clutch plate"), short name, barcode, brand, vehicle, mid-string matching
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().replace(/%/g, ''); // strip wildcard symbols for easy typing
        const pNum = (part.partNumber || part.sku.replace('SKU-', '')).toLowerCase();
        const pName = part.name.toLowerCase();
        const pShort = (part.shortName || '').toLowerCase();
        const pComb = (part.combinationName || '').toLowerCase();
        const pBarcode = part.barcode.toLowerCase();
        const pBrand = part.brand.toLowerCase();
        const pCategory = part.category.toLowerCase();
        const pVehicles = part.vehicles.join(' ').toLowerCase();

        const matches =
          pNum.includes(q) ||
          pName.includes(q) ||
          pShort.includes(q) ||
          pComb.includes(q) ||
          pBarcode.includes(q) ||
          pBrand.includes(q) ||
          pCategory.includes(q) ||
          pVehicles.includes(q);

        if (!matches) return false;
      }

      return true;
    });
  }, [
    parts,
    searchQuery,
    selectedBrand,
    selectedCategory,
    selectedVehicle,
    selectedGst,
    selectedStockStatus,
    selectedActiveStatus
  ]);

  // Sorting
  const sortedParts = useMemo(() => {
    const list = [...filteredParts];
    list.sort((a, b) => {
      let aVal: any = a[sortField as keyof SparePart];
      let bVal: any = b[sortField as keyof SparePart];

      if (sortField === 'partNumber') {
        aVal = a.partNumber || a.sku.replace('SKU-', '');
        bVal = b.partNumber || b.sku.replace('SKU-', '');
      }

      if (typeof aVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDirection === 'asc' ? (aVal || 0) - (bVal || 0) : (bVal || 0) - (aVal || 0);
    });
    return list;
  }, [filteredParts, sortField, sortDirection]);

  // Pagination slicing
  const totalPages = Math.ceil(sortedParts.length / rowsPerPage) || 1;
  const paginatedParts = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedParts.slice(start, start + rowsPerPage);
  }, [sortedParts, currentPage, rowsPerPage]);

  // Selection handlers
  const handleToggleSelectPart = (id: string) => {
    const next = new Set(selectedPartIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedPartIds(next);
  };

  const handleSelectAllOnPage = () => {
    const next = new Set(selectedPartIds);
    const allSelected = paginatedParts.every(p => next.has(p.id));
    if (allSelected) {
      paginatedParts.forEach(p => next.delete(p.id));
    } else {
      paginatedParts.forEach(p => next.add(p.id));
    }
    setSelectedPartIds(next);
  };

  const handleClearSelection = () => {
    setSelectedPartIds(new Set());
  };

  const selectedPartsList = useMemo(() => {
    return parts.filter(p => selectedPartIds.has(p.id));
  }, [parts, selectedPartIds]);

  // Sorting click
  const handleSort = (field: keyof SparePart | 'partNumber') => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Duplicate item action
  const handleDuplicatePart = (part: SparePart) => {
    const randomNum = Math.floor(1300 + Math.random() * 8000);
    const cloned: SparePart = {
      ...part,
      id: `part-${Date.now()}`,
      sku: `SKU-${randomNum}`,
      partNumber: String(randomNum),
      name: `${part.name} (Copy)`,
      barcode: `890${Math.floor(100000000 + Math.random() * 900000000)}`,
      currentStock: 0,
      openingStock: 0,
      status: 'Out of Stock'
    };
    onAddPart(cloned);
    showToast(`Cloned Part #${part.partNumber || part.sku} as new Part #${randomNum}`);
  };

  // Toggle Active/Inactive
  const handleToggleActive = (part: SparePart) => {
    const updated = { ...part, isActive: part.isActive === false ? true : false };
    onUpdatePart(updated);
    showToast(`Marked ${part.name} as ${updated.isActive ? 'Active' : 'Inactive'}`);
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-neutral-900 text-white px-4 py-2.5 rounded shadow-lg flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-bottom-2 duration-200">
          <span className="material-symbols-outlined text-secondary text-[18px]">info</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Subtitle (Requirement 1) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-container-lowest p-4 rounded border border-surface-container-high shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-md text-xl font-bold text-on-surface">Items</h1>
            <span className="px-2 py-0.5 rounded bg-secondary/15 text-secondary text-[10px] font-bold uppercase font-mono">
              Item Master (50,000+ SKUs)
            </span>
          </div>
          <p className="text-xs text-outline mt-0.5">
            Manage spare parts, pricing, stock and vehicle compatibility.
          </p>
        </div>

        {/* Top-Right Action Buttons (Requirement 1: [ + Add Item ], [ Import Excel ], [ Export Excel ], [ Print Barcode ]) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setEditingPart(null);
              setIsAddEditOpen(true);
            }}
            className="px-3.5 py-1.5 bg-secondary hover:bg-secondary/90 text-on-secondary rounded text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Add Item</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExcelImportOpen(true)}
            className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-highest text-on-surface rounded text-xs font-bold border border-surface-container-highest flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">upload_file</span>
            <span>Import Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExcelExportOpen(true)}
            className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-highest text-on-surface rounded text-xs font-bold border border-surface-container-highest flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export Excel</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (selectedPartIds.size === 0) {
                // select current page for bulk print
                setSelectedPartIds(new Set(paginatedParts.map(p => p.id)));
              }
              setIsBulkBarcodeOpen(true);
            }}
            className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-highest text-on-surface rounded text-xs font-bold border border-surface-container-highest flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
            <span>Print Barcode</span>
          </button>
        </div>
      </div>

      {/* KPI Cards (Exact user numbers in Requirement 1) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Total Items: 49,912 */}
        <div className="p-3.5 rounded bg-surface-container-lowest border border-surface-container-high shadow-xs">
          <span className="text-outline text-[10px] uppercase font-bold block">TOTAL ITEMS</span>
          <div className="font-mono text-2xl font-bold text-on-surface mt-1">49,912</div>
          <span className="text-[10px] text-outline font-mono">50,000+ Spare Part SKUs</span>
        </div>

        {/* Active Items: 48,921 */}
        <div className="p-3.5 rounded bg-surface-container-lowest border border-surface-container-high shadow-xs">
          <span className="text-tertiary text-[10px] uppercase font-bold block">ACTIVE ITEMS</span>
          <div className="font-mono text-2xl font-bold text-tertiary mt-1">48,921</div>
          <span className="text-[10px] text-outline">Available for POS Billing</span>
        </div>

        {/* Low Stock: 127 */}
        <div className="p-3.5 rounded bg-amber-500/10 border border-amber-500/30 shadow-xs">
          <span className="text-amber-700 text-[10px] uppercase font-bold block">LOW STOCK</span>
          <div className="font-mono text-2xl font-bold text-amber-700 mt-1">127</div>
          <span className="text-[10px] text-amber-700">Below min reorder level</span>
        </div>

        {/* Out of Stock: 43 */}
        <div className="p-3.5 rounded bg-error/10 border border-error/30 shadow-xs">
          <span className="text-error text-[10px] uppercase font-bold block">OUT OF STOCK</span>
          <div className="font-mono text-2xl font-bold text-error mt-1">43</div>
          <span className="text-[10px] text-error font-semibold">Stockout attention</span>
        </div>

        {/* Stock Value: ₹28,45,000 */}
        <div className="p-3.5 rounded bg-secondary-container/20 border border-secondary/30 shadow-xs col-span-2 md:col-span-1">
          <span className="text-secondary text-[10px] uppercase font-bold block">STOCK VALUE</span>
          <div className="font-mono text-2xl font-bold text-on-surface mt-1">₹28,45,000</div>
          <span className="text-[10px] text-outline font-mono">FIFO Inventory Valuation</span>
        </div>
      </div>

      {/* High-Speed Search Bar (Requirement 2) */}
      <div className="p-3.5 bg-surface-container-lowest rounded border border-surface-container-high shadow-xs space-y-3">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-secondary">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by part number ('1302'), item name ('clutch plate'), barcode ('890...'), brand ('TVS') or vehicle ('apache', 'pulsar 150')..."
            className="w-full py-2.5 pl-11 pr-24 rounded bg-surface-container border border-surface-container-highest text-on-surface text-xs font-semibold focus:outline-none focus:border-secondary shadow-inner"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-surface-container-highest hover:bg-surface-container text-outline hover:text-on-surface rounded text-xs font-mono"
            >
              Clear
            </button>
          )}
        </div>

        {/* Real-time Filters Bar (Requirement 3: Brand, Category, Vehicle, GST, Stock Status) */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs pt-0.5">
          <div className="flex flex-wrap items-center gap-2">
            {/* Brand Filter */}
            <div>
              <select
                value={selectedBrand}
                onChange={e => {
                  setSelectedBrand(e.target.value);
                  setCurrentPage(1);
                }}
                className="py-1 px-2.5 rounded bg-surface-container border border-surface-container-highest text-on-surface font-semibold text-xs"
              >
                <option value="ALL">All Brands</option>
                <option value="TVS Genuine">TVS Genuine</option>
                <option value="Bajaj Genuine">Bajaj Genuine</option>
                <option value="Hero Genuine">Hero Genuine</option>
                <option value="Motul">Motul</option>
                <option value="Endurance OEM">Endurance OEM</option>
                <option value="Gabriel">Gabriel</option>
                <option value="Rolon">Rolon</option>
                <option value="Bosch">Bosch</option>
                <option value="NGK">NGK</option>
                <option value="Minda">Minda</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={e => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="py-1 px-2.5 rounded bg-surface-container border border-surface-container-highest text-on-surface font-semibold text-xs"
              >
                <option value="ALL">All Categories</option>
                <option value="Clutch & Transmission">Clutch &amp; Transmission</option>
                <option value="Engine & Cylinder">Engine &amp; Cylinder</option>
                <option value="Electrical & Spark">Electrical &amp; Spark</option>
                <option value="Brakes & Hydraulics">Brakes &amp; Hydraulics</option>
                <option value="Lubricants & Fluids">Lubricants &amp; Fluids</option>
                <option value="Suspension & Chassis">Suspension &amp; Chassis</option>
                <option value="Filters & Intake">Filters &amp; Intake</option>
              </select>
            </div>

            {/* Vehicle Model Filter */}
            <div>
              <select
                value={selectedVehicle}
                onChange={e => {
                  setSelectedVehicle(e.target.value);
                  setCurrentPage(1);
                }}
                className="py-1 px-2.5 rounded bg-surface-container border border-surface-container-highest text-on-surface font-semibold text-xs"
              >
                <option value="ALL">All Vehicle Fitments</option>
                <option value="Pulsar 150">Pulsar 150</option>
                <option value="Apache RTR 160">Apache RTR 160</option>
                <option value="Splendor Plus">Splendor Plus</option>
                <option value="Activa 6G">Activa 6G</option>
                <option value="Classic 350">Classic 350</option>
                <option value="Duke 200">Duke 200</option>
                <option value="FZ-S">FZ-S</option>
                <option value="Jupiter 125">Jupiter 125</option>
              </select>
            </div>

            {/* GST Rate Filter */}
            <div>
              <select
                value={selectedGst}
                onChange={e => {
                  setSelectedGst(e.target.value);
                  setCurrentPage(1);
                }}
                className="py-1 px-2.5 rounded bg-surface-container border border-surface-container-highest text-on-surface font-semibold text-xs"
              >
                <option value="ALL">All GST Rates</option>
                <option value="18">18% (Auto Spares)</option>
                <option value="28">28% (Luxury)</option>
                <option value="12">12%</option>
                <option value="5">5%</option>
              </select>
            </div>

            {/* Stock Status Filter */}
            <div>
              <select
                value={selectedStockStatus}
                onChange={e => {
                  setSelectedStockStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="py-1 px-2.5 rounded bg-surface-container border border-surface-container-highest text-on-surface font-semibold text-xs"
              >
                <option value="ALL">All Stock Levels</option>
                <option value="NORMAL">Normal In-Stock</option>
                <option value="LOW">Low Stock Alert</option>
                <option value="OUT">Out of Stock</option>
              </select>
            </div>

            {/* Active / Inactive filter */}
            <div className="flex rounded border border-surface-container-high overflow-hidden font-mono text-[11px]">
              <button
                type="button"
                onClick={() => setSelectedActiveStatus('ALL')}
                className={`px-2 py-1 ${selectedActiveStatus === 'ALL' ? 'bg-secondary text-on-secondary font-bold' : 'bg-surface-container text-outline'}`}
              >
                ALL
              </button>
              <button
                type="button"
                onClick={() => setSelectedActiveStatus('ACTIVE')}
                className={`px-2 py-1 ${selectedActiveStatus === 'ACTIVE' ? 'bg-secondary text-on-secondary font-bold' : 'bg-surface-container text-outline'}`}
              >
                ACTIVE
              </button>
              <button
                type="button"
                onClick={() => setSelectedActiveStatus('INACTIVE')}
                className={`px-2 py-1 ${selectedActiveStatus === 'INACTIVE' ? 'bg-secondary text-on-secondary font-bold' : 'bg-surface-container text-outline'}`}
              >
                INACTIVE
              </button>
            </div>
          </div>

          {/* Real-time result counter (Requirement 2) */}
          <div className="text-outline font-mono text-[11px]">
            Found <strong className="text-secondary font-bold">{filteredParts.length}</strong> matching items (from 49,912 SKUs)
          </div>
        </div>
      </div>

      {/* Bulk Action Bar (When rows selected) */}
      {selectedPartIds.size > 0 && (
        <div className="p-3 bg-secondary-container/30 border border-secondary/40 rounded flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-[11px] font-bold font-mono">
              {selectedPartIds.size}
            </span>
            <span className="font-bold text-on-surface">Items selected in master table</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsBulkBarcodeOpen(true)}
              className="px-3 py-1.5 bg-secondary hover:bg-secondary/90 text-on-secondary rounded text-xs font-bold flex items-center gap-1 shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Print Selected Barcodes ({selectedPartIds.size})</span>
            </button>

            <button
              type="button"
              onClick={() => setIsExcelExportOpen(true)}
              className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-highest text-on-surface rounded text-xs font-bold border border-surface-container-highest flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span>Export Selected</span>
            </button>

            <button
              type="button"
              onClick={handleClearSelection}
              className="px-2.5 py-1.5 text-outline hover:text-on-surface rounded text-xs"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Dense Professional Enterprise Table (Requirement 4) */}
      <div className="border border-surface-container-high rounded bg-surface-container-lowest overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs min-w-[1100px]">
          <thead className="bg-surface-container-low font-label-caps text-[10px] text-outline uppercase border-b border-surface-container-high sticky top-0 z-10 select-none">
            <tr>
              <th className="py-2.5 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={paginatedParts.length > 0 && paginatedParts.every(p => selectedPartIds.has(p.id))}
                  onChange={handleSelectAllOnPage}
                  className="rounded text-secondary focus:ring-0 cursor-pointer"
                  title="Select / Deselect all on current page"
                />
              </th>
              <th
                className="py-2.5 px-3 cursor-pointer hover:text-on-surface transition-colors"
                onClick={() => handleSort('partNumber')}
              >
                <div className="flex items-center gap-1">
                  <span>Part Number</span>
                  {sortField === 'partNumber' && (
                    <span className="material-symbols-outlined text-[14px]">
                      {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="py-2.5 px-3 cursor-pointer hover:text-on-surface transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  <span>Item Name &amp; Spec</span>
                  {sortField === 'name' && (
                    <span className="material-symbols-outlined text-[14px]">
                      {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="py-2.5 px-3 cursor-pointer hover:text-on-surface transition-colors"
                onClick={() => handleSort('brand')}
              >
                <div className="flex items-center gap-1">
                  <span>Brand</span>
                  {sortField === 'brand' && (
                    <span className="material-symbols-outlined text-[14px]">
                      {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                    </span>
                  )}
                </div>
              </th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">Compatible Vehicles</th>
              <th
                className="py-2.5 px-3 text-right cursor-pointer hover:text-on-surface transition-colors"
                onClick={() => handleSort('mrp')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>MRP (₹)</span>
                  {sortField === 'mrp' && (
                    <span className="material-symbols-outlined text-[14px]">
                      {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="py-2.5 px-3 text-right cursor-pointer hover:text-on-surface transition-colors"
                onClick={() => handleSort('purchasePrice')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Purchase (₹)</span>
                  {sortField === 'purchasePrice' && (
                    <span className="material-symbols-outlined text-[14px]">
                      {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="py-2.5 px-3 text-right cursor-pointer hover:text-on-surface transition-colors"
                onClick={() => handleSort('counterPrice')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Selling (₹)</span>
                  {sortField === 'counterPrice' && (
                    <span className="material-symbols-outlined text-[14px]">
                      {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                    </span>
                  )}
                </div>
              </th>
              <th
                className="py-2.5 px-3 text-right cursor-pointer hover:text-on-surface transition-colors"
                onClick={() => handleSort('currentStock')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Stock</span>
                  {sortField === 'currentStock' && (
                    <span className="material-symbols-outlined text-[14px]">
                      {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                    </span>
                  )}
                </div>
              </th>
              <th className="py-2.5 px-3 text-center">GST</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-high font-mono">
            {paginatedParts.length > 0 ? (
              paginatedParts.map(part => {
                const isSelected = selectedPartIds.has(part.id);
                const partNumber = part.partNumber || part.sku.replace('SKU-', '');

                return (
                  <tr
                    key={part.id}
                    className={`hover:bg-surface-container-low transition-colors ${
                      isSelected ? 'bg-secondary-container/10' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-2.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectPart(part.id)}
                        className="rounded text-secondary focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* Part Number */}
                    <td className="py-2.5 px-3 font-bold text-secondary">
                      <div className="flex items-center gap-1.5">
                        <span>{partNumber}</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(partNumber);
                            showToast(`Copied Part #${partNumber}`);
                          }}
                          className="text-outline hover:text-on-surface opacity-60 hover:opacity-100"
                          title="Copy Part Number"
                        >
                          <span className="material-symbols-outlined text-[13px]">content_copy</span>
                        </button>
                      </div>
                      <span className="text-[10px] text-outline block font-normal">{part.rackBin}</span>
                    </td>

                    {/* Item Name */}
                    <td className="py-2.5 px-3 font-sans">
                      <button
                        type="button"
                        onClick={() => setViewingPart(part)}
                        className="font-bold text-on-surface hover:text-secondary text-left line-clamp-1"
                      >
                        {part.name}
                      </button>
                      <div className="text-[10px] text-outline font-mono flex items-center gap-2">
                        <span>Barcode: {part.barcode}</span>
                        {part.oemCode && <span>• OEM: {part.oemCode}</span>}
                      </div>
                    </td>

                    {/* Brand */}
                    <td className="py-2.5 px-3 font-sans font-semibold text-on-surface">
                      {part.brand}
                    </td>

                    {/* Category */}
                    <td className="py-2.5 px-3 font-sans text-outline text-[11px]">
                      {part.category}
                    </td>

                    {/* Compatible Vehicles */}
                    <td className="py-2.5 px-3 font-sans">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {part.vehicles.slice(0, 2).map((v, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface text-[10px] truncate max-w-[95px]"
                            title={v}
                          >
                            {v}
                          </span>
                        ))}
                        {part.vehicles.length > 2 && (
                          <span className="px-1.5 py-0.5 rounded bg-surface-container-highest text-outline text-[10px]">
                            +{part.vehicles.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* MRP */}
                    <td className="py-2.5 px-3 text-right text-outline">
                      ₹{part.mrp.toFixed(2)}
                    </td>

                    {/* Purchase Rate */}
                    <td className="py-2.5 px-3 text-right text-outline">
                      ₹{part.purchasePrice.toFixed(2)}
                    </td>

                    {/* Selling Rate */}
                    <td className="py-2.5 px-3 text-right font-bold text-secondary">
                      ₹{part.counterPrice.toFixed(2)}
                    </td>

                    {/* Stock with visual status */}
                    <td className="py-2.5 px-3 text-right font-bold">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[11px] ${
                          part.currentStock === 0
                            ? 'bg-error-container text-on-error-container font-bold'
                            : part.currentStock <= part.minReorder
                            ? 'bg-amber-100 text-amber-900 font-bold'
                            : 'text-on-surface'
                        }`}
                      >
                        {part.currentStock} {part.unit}
                      </span>
                    </td>

                    {/* GST */}
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-1.5 py-0.5 rounded bg-surface-container text-outline text-[10px]">
                        {part.gstRate}%
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3 text-center font-sans">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          part.isActive !== false
                            ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                            : 'bg-surface-container-highest text-outline'
                        }`}
                      >
                        {part.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Actions Menu (Requirement 4: View, Edit, Duplicate, Barcode, Stock Ledger, Adjust) */}
                    <td className="py-2.5 px-3 text-right font-sans">
                      <div className="flex items-center justify-end gap-1 text-outline">
                        <button
                          type="button"
                          onClick={() => setViewingPart(part)}
                          className="p-1 hover:bg-surface-container rounded hover:text-on-surface transition-colors"
                          title="View Details"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingPart(part);
                            setIsAddEditOpen(true);
                          }}
                          className="p-1 hover:bg-surface-container rounded hover:text-secondary transition-colors"
                          title="Edit Item"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setBarcodeModalPart(part)}
                          className="p-1 hover:bg-surface-container rounded hover:text-secondary transition-colors"
                          title="Generate Barcode"
                        >
                          <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setAdjustModalPart(part)}
                          className="p-1 hover:bg-surface-container rounded hover:text-amber-700 transition-colors"
                          title="Stock Adjustment"
                        >
                          <span className="material-symbols-outlined text-[16px]">tune</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onViewStockLedger(part)}
                          className="p-1 hover:bg-surface-container rounded hover:text-secondary transition-colors"
                          title="Stock Ledger"
                        >
                          <span className="material-symbols-outlined text-[16px]">menu_book</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDuplicatePart(part)}
                          className="p-1 hover:bg-surface-container rounded hover:text-on-surface transition-colors"
                          title="Duplicate SKU"
                        >
                          <span className="material-symbols-outlined text-[16px]">content_copy</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleActive(part)}
                          className="p-1 hover:bg-surface-container rounded hover:text-error transition-colors"
                          title={part.isActive !== false ? 'Deactivate' : 'Activate'}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {part.isActive !== false ? 'toggle_on' : 'toggle_off'}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={13} className="py-12 text-center text-outline font-sans">
                  <span className="material-symbols-outlined text-4xl block mx-auto text-outline/50 mb-1">
                    search_off
                  </span>
                  <p className="font-semibold text-on-surface text-sm">No spare part items match your filter criteria</p>
                  <p className="text-xs text-outline mt-0.5">Try adjusting your search query or reset active filters</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedBrand('ALL');
                      setSelectedCategory('ALL');
                      setSelectedVehicle('ALL');
                      setSelectedStockStatus('ALL');
                      setSelectedGst('ALL');
                      setSelectedActiveStatus('ALL');
                    }}
                    className="mt-3 px-3 py-1.5 bg-surface-container hover:bg-surface-container-highest rounded text-xs font-semibold text-secondary"
                  >
                    Reset All Filters
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-outline p-2">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={rowsPerPage}
            onChange={e => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="py-1 px-2 rounded bg-surface-container border border-surface-container-highest text-on-surface font-mono"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="font-mono ml-2">
            Showing {paginatedParts.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} -{' '}
            {Math.min(currentPage * rowsPerPage, sortedParts.length)} of {sortedParts.length} items
          </span>
        </div>

        <div className="flex items-center gap-1 font-mono">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
            className="p-1 rounded hover:bg-surface-container disabled:opacity-30"
            title="First Page"
          >
            <span className="material-symbols-outlined text-[16px]">first_page</span>
          </button>
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="p-1 rounded hover:bg-surface-container disabled:opacity-30"
            title="Previous Page"
          >
            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          </button>

          <span className="px-2 font-bold text-on-surface">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            className="p-1 rounded hover:bg-surface-container disabled:opacity-30"
            title="Next Page"
          >
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
            className="p-1 rounded hover:bg-surface-container disabled:opacity-30"
            title="Last Page"
          >
            <span className="material-symbols-outlined text-[16px]">last_page</span>
          </button>
        </div>
      </div>

      {/* Item Details Drawer */}
      <ItemDetailsDrawer
        part={viewingPart}
        onClose={() => setViewingPart(null)}
        onEditItem={part => {
          setViewingPart(null);
          setEditingPart(part);
          setIsAddEditOpen(true);
        }}
        onPrintBarcode={part => {
          setViewingPart(null);
          setBarcodeModalPart(part);
        }}
        onViewStockLedger={part => {
          setViewingPart(null);
          onViewStockLedger(part);
        }}
        onAdjustStock={part => {
          setViewingPart(null);
          setAdjustModalPart(part);
        }}
      />

      {/* Add / Edit Item Modal */}
      <ItemAddEditModal
        isOpen={isAddEditOpen}
        onClose={() => {
          setIsAddEditOpen(false);
          setEditingPart(null);
        }}
        editPart={editingPart}
        existingParts={parts}
        onSave={(savedPart, saveAndNew) => {
          if (editingPart) {
            onUpdatePart(savedPart);
            showToast(`Updated SKU #${savedPart.partNumber || savedPart.sku}`);
          } else {
            onAddPart(savedPart);
            showToast(`Added new item Part #${savedPart.partNumber || savedPart.sku}`);
          }
          if (!saveAndNew) {
            setIsAddEditOpen(false);
            setEditingPart(null);
          }
        }}
      />

      {/* Excel Import Modal */}
      <ExcelImportModal
        isOpen={isExcelImportOpen}
        onClose={() => setIsExcelImportOpen(false)}
        onImportComplete={count => {
          showToast(`Successfully imported ${count} parts from Excel`);
        }}
      />

      {/* Excel Export Modal */}
      <ExcelExportModal
        isOpen={isExcelExportOpen}
        onClose={() => setIsExcelExportOpen(false)}
        totalCount={49912}
        filteredCount={filteredParts.length}
        selectedCount={selectedPartIds.size}
        onConfirmExport={config => {
          showToast(`Exported ${config.scope} items to ${config.format.toUpperCase()}`);
        }}
      />

      {/* Single Barcode Print Modal */}
      <BarcodeManagementModal
        isOpen={Boolean(barcodeModalPart)}
        onClose={() => setBarcodeModalPart(null)}
        part={barcodeModalPart}
      />

      {/* Bulk Barcode Print Modal */}
      <BulkBarcodePrintModal
        isOpen={isBulkBarcodeOpen}
        onClose={() => setIsBulkBarcodeOpen(false)}
        parts={selectedPartsList.length > 0 ? selectedPartsList : paginatedParts}
      />

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={Boolean(adjustModalPart)}
        onClose={() => setAdjustModalPart(null)}
        part={adjustModalPart}
        onConfirmAdjustment={(partId, qtyDelta, reason, notes) => {
          onStockAdjustment(partId, qtyDelta, reason, notes);
          showToast(`Adjusted stock by ${qtyDelta >= 0 ? `+${qtyDelta}` : qtyDelta} (${reason})`);
        }}
      />
    </div>
  );
};
