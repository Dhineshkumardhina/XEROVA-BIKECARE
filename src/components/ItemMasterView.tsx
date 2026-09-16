import React, { useState, useMemo, useEffect, useRef } from 'react';
import { SparePart } from '../types';
import { exportToCsv, triggerPrintWindow } from '../utils/exportUtils';

interface ItemMasterViewProps {
  parts: SparePart[];
  onOpenNewPart: () => void;
  onOpenPoModal: (partName: string) => void;
  selectedPartForDrawer: SparePart | null;
  setSelectedPartForDrawer: (part: SparePart | null) => void;
  initialStockFilter?: string;
}

export const ItemMasterView: React.FC<ItemMasterViewProps> = ({
  parts,
  onOpenNewPart,
  onOpenPoModal,
  selectedPartForDrawer,
  setSelectedPartForDrawer,
  initialStockFilter
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All Brands');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedVehicle, setSelectedVehicle] = useState('All Vehicle Models');
  const [stockFilter, setStockFilter] = useState<string>(initialStockFilter || 'ALL');
  const [selectedGst, setSelectedGst] = useState('All GST Rates');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape' && selectedPartForDrawer) {
        setSelectedPartForDrawer(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPartForDrawer, setSelectedPartForDrawer]);

  // If initialStockFilter changes
  useEffect(() => {
    if (initialStockFilter) {
      setStockFilter(initialStockFilter);
    }
  }, [initialStockFilter]);

  // Filtering
  const filteredParts = useMemo(() => {
    return parts.filter(part => {
      // Search
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchSearch =
          part.name.toLowerCase().includes(q) ||
          part.sku.toLowerCase().includes(q) ||
          part.barcode.includes(q) ||
          part.oemCode.toLowerCase().includes(q) ||
          part.hsn.includes(q) ||
          part.rackBin.toLowerCase().includes(q) ||
          part.vehicles.some(v => v.toLowerCase().includes(q));
        if (!matchSearch) return false;
      }

      // Quick filter
      if (stockFilter === 'OUT_OF_STOCK' && part.currentStock > 0) return false;
      if (stockFilter === 'LOW_REORDER' && (part.currentStock === 0 || part.currentStock >= part.minReorder)) return false;
      if (stockFilter === 'ENGINE' && !part.category.toLowerCase().includes('engine') && !part.category.toLowerCase().includes('transmission') && !part.category.toLowerCase().includes('clutch')) return false;
      if (stockFilter === 'LUBES' && !part.category.toLowerCase().includes('lubricant') && !part.category.toLowerCase().includes('oil')) return false;

      // Brand dropdown
      if (selectedBrand !== 'All Brands') {
        if (!part.brand.toLowerCase().includes(selectedBrand.toLowerCase()) && !part.name.toLowerCase().includes(selectedBrand.toLowerCase())) {
          return false;
        }
      }

      // Category dropdown
      if (selectedCategory !== 'All Categories') {
        if (!part.category.toLowerCase().includes(selectedCategory.toLowerCase())) {
          return false;
        }
      }

      // Vehicle model dropdown
      if (selectedVehicle !== 'All Vehicle Models') {
        const vehicleKeyword = selectedVehicle.split(' ')[0];
        const matchVeh = part.vehicles.some(v => v.toLowerCase().includes(vehicleKeyword.toLowerCase()));
        if (!matchVeh) return false;
      }

      return true;
    });
  }, [parts, searchTerm, stockFilter, selectedBrand, selectedCategory, selectedVehicle]);

  // Dynamic statistics
  const stats = useMemo(() => {
    const totalParts = parts.length;
    const totalValuation = parts.reduce((sum, p) => sum + ((p.currentStock || 0) * (p.purchasePrice || 0)), 0);
    const stockOut = parts.filter(p => (p.currentStock || 0) === 0).length;
    const lowStock = parts.filter(p => (p.currentStock || 0) > 0 && (p.currentStock || 0) <= (p.minReorder || 0)).length;
    const mappedVehicles = new Set(parts.flatMap(p => p.vehicles || [])).size;
    const activeBins = new Set(parts.map(p => p.rackBin).filter(Boolean)).size;
    const fastMovers = 0; // Requires sales data, defaulting to 0
    
    return {
      totalParts,
      totalValuation,
      stockOut,
      lowStock,
      mappedVehicles,
      activeBins,
      fastMovers
    };
  }, [parts]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredParts.length / rowsPerPage));
  const displayedParts = filteredParts.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Valuation of currently displayed
  const pageValuation = displayedParts.reduce((acc, p) => acc + (p.currentStock * p.purchasePrice), 0);

  const toggleSelectAll = () => {
    if (selectedIds.length === displayedParts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayedParts.map(p => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "SKU,Barcode,Part Name,Brand,OEM,Category,Rack,CurrentStock,MinReorder,PurchasePrice,MRP,CounterPrice\n"
      + filteredParts.map(p => `${p.sku},${p.barcode},"${p.name}","${p.brand}","${p.oemCode}","${p.category}",${p.rackBin},${p.currentStock},${p.minReorder},${p.purchasePrice},${p.mrp},${p.counterPrice}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Bike_Spare_Parts_Catalog_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-200">
      {/* Top Command & Action Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-gutter pb-space-md pt-space-xs">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-sm">
            <span className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
              Item Master &amp; Spare Parts Catalog
            </span>
            <span className="px-2 py-0.5 rounded-full bg-secondary text-on-secondary font-label-caps text-label-caps uppercase">
              Catalog v4.8
            </span>
          </div>
          <div className="flex items-center gap-space-sm mt-1">
            <span className="font-numeric-data text-numeric-data text-on-surface-variant font-semibold">
              {stats.totalParts.toLocaleString()} Active SKUs
            </span>
            <span className="text-outline-variant text-label-caps">•</span>
            <span 
              onClick={() => setStockFilter('LOW_REORDER')}
              className="font-numeric-data text-numeric-data text-error font-semibold flex items-center gap-1 cursor-pointer hover:underline"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping"></span>
              {stats.lowStock.toLocaleString()} Low Stock Alerts
            </span>
            <span className="text-outline-variant text-label-caps">•</span>
            <span className="font-table-cell text-table-cell text-outline flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[16px] text-secondary">warehouse</span>
              Warehouse: Central Bin Area (Zone A-E)
            </span>
          </div>
        </div>

        {/* Primary Control Triggers */}
        <div className="flex flex-wrap items-center gap-space-sm">
          <button
            onClick={onOpenNewPart}
            className="flex items-center gap-space-xs h-8 px-space-md bg-secondary text-on-secondary hover:bg-secondary-container rounded font-table-cell text-table-cell transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">add_box</span>
            <span>New Spare Part</span>
            <kbd className="px-1.5 py-0.5 rounded bg-on-secondary-fixed text-on-secondary-container font-shortcut-key text-shortcut-key ml-0.5">
              F2
            </kbd>
          </button>

          <label className="flex items-center gap-space-xs h-8 px-space-md bg-surface-container-low hover:bg-surface-container text-on-surface rounded font-table-cell text-table-cell transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[18px] text-secondary">file_upload</span>
            <span>Import CSV / Excel</span>
            <input 
              type="file" 
              accept=".csv,.xlsx" 
              className="hidden" 
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  const file = e.target.files[0];
                  const reader = new FileReader();
                  reader.onload = () => {
                    handleExportCSV();
                  };
                  reader.readAsText(file);
                }
              }}
            />
          </label>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-space-xs h-8 px-space-md bg-surface-container-low hover:bg-surface-container text-on-surface rounded font-table-cell text-table-cell transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">picture_as_pdf</span>
            <span>Export Price List</span>
          </button>

          <button
            onClick={() => {
              const selectedParts = selectedIds.length 
                ? parts.filter(p => selectedIds.includes(p.id))
                : parts.slice(0, 10);
              
              const labelsHtml = `
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                  ${selectedParts.map(p => `
                    <div style="border: 1px dashed #000; padding: 8px; text-align: center; width: 48mm; height: 24mm; box-sizing: border-box; font-family: monospace;">
                      <div style="font-weight: bold; font-size: 11px;">BIKE ERP — ${p.brand}</div>
                      <div style="font-size: 10px; margin: 2px 0;">${p.name.slice(0, 26)}</div>
                      <div style="font-size: 14px; font-weight: bold; letter-spacing: 2px;">*${p.barcode || p.sku}*</div>
                      <div style="font-size: 10px;">MRP: ₹${p.mrp} | Rack: ${p.rackBin}</div>
                    </div>
                  `).join('')}
                </div>
              `;
              triggerPrintWindow(`Bulk Barcode Labels (${selectedParts.length} items)`, labelsHtml);
            }}
            className="flex items-center gap-space-xs h-8 px-space-md bg-surface-container-low hover:bg-surface-container text-on-surface rounded font-table-cell text-table-cell transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">print</span>
            <span>Bulk Barcodes</span>
          </button>
        </div>
      </div>

      {/* Micro KPI Strip (Operational Overview) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-gutter-dense py-space-sm">
        <div className="p-space-sm rounded bg-surface-container-lowest shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-outline uppercase">Total Valuation</span>
            <span className="material-symbols-outlined text-secondary text-[16px]">account_balance_wallet</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-numeric-lg text-numeric-lg text-on-surface">{formatCurrency(stats.totalValuation)}</span>
            <span className="font-shortcut-key text-shortcut-key text-on-tertiary-container"></span>
          </div>
        </div>

        <div 
          onClick={() => setStockFilter(stockFilter === 'OUT_OF_STOCK' ? 'ALL' : 'OUT_OF_STOCK')}
          className={`p-space-sm rounded bg-surface-container-lowest shadow-xs flex flex-col justify-between cursor-pointer transition-colors ${
            stockFilter === 'OUT_OF_STOCK' ? 'ring-2 ring-error bg-error-container/20' : 'hover:bg-error-container/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-outline uppercase">Stock Out (Zero)</span>
            <span className="material-symbols-outlined text-error text-[16px]">do_not_disturb_on</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-numeric-lg text-numeric-lg text-error">{stats.stockOut.toLocaleString()} SKUs</span>
            {stats.stockOut > 0 && <span className="font-shortcut-key text-shortcut-key text-error font-semibold">Immediate PO</span>}
          </div>
        </div>

        <div 
          onClick={() => setStockFilter(stockFilter === 'LOW_REORDER' ? 'ALL' : 'LOW_REORDER')}
          className={`p-space-sm rounded bg-surface-container-lowest shadow-xs flex flex-col justify-between cursor-pointer transition-colors ${
            stockFilter === 'LOW_REORDER' ? 'ring-2 ring-secondary bg-surface-container-high' : 'hover:bg-surface-container-low'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-outline uppercase">Under Min Reorder</span>
            <span className="material-symbols-outlined text-on-secondary-fixed-variant text-[16px]">warning</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-numeric-lg text-numeric-lg text-on-secondary-fixed-variant">{stats.lowStock.toLocaleString()} Items</span>
            {stats.lowStock > 0 && <span className="font-shortcut-key text-shortcut-key text-outline">Action req.</span>}
          </div>
        </div>

        <div className="p-space-sm rounded bg-surface-container-lowest shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-outline uppercase">Fast Movers (A-Tier)</span>
            <span className="material-symbols-outlined text-on-tertiary-container text-[16px]">speed</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-numeric-lg text-numeric-lg text-on-surface">{stats.fastMovers.toLocaleString()} SKUs</span>
            {stats.fastMovers > 0 && <span className="font-shortcut-key text-shortcut-key text-secondary">High Turnover</span>}
          </div>
        </div>

        <div className="p-space-sm rounded bg-surface-container-lowest shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-outline uppercase">Mapped Vehicles</span>
            <span className="material-symbols-outlined text-secondary text-[16px]">two_wheeler</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-numeric-lg text-numeric-lg text-on-surface">{stats.mappedVehicles.toLocaleString()} Models</span>
            {stats.mappedVehicles > 0 && <span className="font-shortcut-key text-shortcut-key text-outline">BS-IV / BS-VI</span>}
          </div>
        </div>

        <div className="p-space-sm rounded bg-surface-container-lowest shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-outline uppercase">Active Racks / Bins</span>
            <span className="material-symbols-outlined text-outline text-[16px]">shelves</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="font-numeric-lg text-numeric-lg text-on-surface">{stats.activeBins.toLocaleString()} Bins</span>
            {stats.activeBins > 0 && <span className="font-shortcut-key text-shortcut-key text-on-tertiary-container">Indexed</span>}
          </div>
        </div>
      </div>

      {/* Search and Advanced Multi-filter Dock */}
      <div className="p-space-sm bg-surface-container-lowest rounded shadow-xs my-space-xs flex flex-col gap-space-sm">
        <div className="flex flex-col lg:flex-row items-center gap-space-sm">
          {/* Main Search input */}
          <div className="relative flex-1 w-full">
            <span className="material-symbols-outlined absolute left-space-md top-2 text-outline text-[18px]">
              search
            </span>
            <input
              ref={searchInputRef}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-24 bg-surface-container-low hover:bg-surface-container-lowest focus:bg-surface-container-lowest text-on-surface rounded font-body-sm text-body-sm focus:outline-none focus:ring-1 focus:ring-secondary transition-all"
              id="partCatalogSearch"
              placeholder="Search by Part #, Description, OEM Code, HSN, Barcode, or Cross-reference..."
              type="text"
            />
            <div className="absolute right-space-sm top-1.5 flex items-center gap-1">
              <span className="font-shortcut-key text-shortcut-key text-outline">Press</span>
              <kbd className="px-1 py-0.5 bg-surface-container-high rounded font-shortcut-key text-shortcut-key text-on-surface-variant font-bold">
                /
              </kbd>
            </div>
          </div>

          {/* Quick Filter Chips */}
          <div className="flex items-center gap-space-xs w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
            <button
              onClick={() => setStockFilter('ALL')}
              className={`px-space-md py-1 rounded font-shortcut-key text-shortcut-key whitespace-nowrap shadow-xs transition-colors ${
                stockFilter === 'ALL'
                  ? 'bg-secondary text-on-secondary'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'
              }`}
            >
              All SKUs ({stats.totalParts})
            </button>
            <button
              onClick={() => setStockFilter('OUT_OF_STOCK')}
              className={`px-space-md py-1 rounded font-shortcut-key text-shortcut-key whitespace-nowrap transition-colors ${
                stockFilter === 'OUT_OF_STOCK'
                  ? 'bg-error text-on-error'
                  : 'bg-surface-container-low hover:bg-surface-container text-error'
              }`}
            >
              Out of Stock ({stats.stockOut})
            </button>
            <button
              onClick={() => setStockFilter('LOW_REORDER')}
              className={`px-space-md py-1 rounded font-shortcut-key text-shortcut-key whitespace-nowrap transition-colors ${
                stockFilter === 'LOW_REORDER'
                  ? 'bg-secondary text-on-secondary'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'
              }`}
            >
              Low Reorder ({stats.lowStock})
            </button>
            <button
              onClick={() => setStockFilter('ENGINE')}
              className={`px-space-md py-1 rounded font-shortcut-key text-shortcut-key whitespace-nowrap transition-colors ${
                stockFilter === 'ENGINE'
                  ? 'bg-secondary text-on-secondary'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-tertiary-container'
              }`}
            >
              Engine Spares
            </button>
            <button
              onClick={() => setStockFilter('LUBES')}
              className={`px-space-md py-1 rounded font-shortcut-key text-shortcut-key whitespace-nowrap transition-colors ${
                stockFilter === 'LUBES'
                  ? 'bg-secondary text-on-secondary'
                  : 'bg-surface-container-low hover:bg-surface-container text-secondary'
              }`}
            >
              Lubes / Oil
            </button>
          </div>
        </div>

        {/* Dropdown Selectors Strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-space-xs pt-1">
          <div className="flex flex-col">
            <label className="font-label-caps text-label-caps text-outline uppercase mb-0.5">
              Brand / Mfr
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="h-8 bg-surface-container-low rounded px-space-sm text-on-surface font-table-cell text-table-cell focus:outline-none focus:ring-1 focus:ring-secondary"
            >
              <option>All Brands (TVS, Bajaj, Hero...)</option>
              <option>Bajaj</option>
              <option>TVS</option>
              <option>Hero</option>
              <option>Honda</option>
              <option>Yamaha</option>
              <option>Royal Enfield</option>
              <option>Rolon</option>
              <option>Endurance</option>
              <option>Motul</option>
              <option>Castrol</option>
              <option>NGK</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="font-label-caps text-label-caps text-outline uppercase mb-0.5">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-8 bg-surface-container-low rounded px-space-sm text-on-surface font-table-cell text-table-cell focus:outline-none focus:ring-1 focus:ring-secondary"
            >
              <option>All Categories</option>
              <option>Clutch &amp; Transmission</option>
              <option>Braking System &amp; Pads</option>
              <option>Drive Chains &amp; Sprockets</option>
              <option>Lubricants &amp; Fork Oils</option>
              <option>Cables &amp; Control Levers</option>
              <option>Electrical, Battery &amp; Plugs</option>
              <option>Front &amp; Rear Suspension</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="font-label-caps text-label-caps text-outline uppercase mb-0.5">
              Vehicle Compatibility
            </label>
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="h-8 bg-surface-container-low rounded px-space-sm text-on-surface font-table-cell text-table-cell focus:outline-none focus:ring-1 focus:ring-secondary"
            >
              <option>All Vehicle Models</option>
              <option>Pulsar</option>
              <option>Apache</option>
              <option>Splendor</option>
              <option>Shine</option>
              <option>Yamaha</option>
              <option>Universal</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="font-label-caps text-label-caps text-outline uppercase mb-0.5">
              Stock Level Criteria
            </label>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="h-8 bg-surface-container-low rounded px-space-sm text-on-surface font-table-cell text-table-cell focus:outline-none focus:ring-1 focus:ring-secondary"
            >
              <option value="ALL">All Stock Levels</option>
              <option value="OUT_OF_STOCK">Critical (Zero Stock)</option>
              <option value="LOW_REORDER">Low Stock (&lt; Min Reorder)</option>
              <option value="NORMAL">Optimal / In-Stock</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="font-label-caps text-label-caps text-outline uppercase mb-0.5">
              GST HSN Tax Bracket
            </label>
            <select
              value={selectedGst}
              onChange={(e) => setSelectedGst(e.target.value)}
              className="h-8 bg-surface-container-low rounded px-space-sm text-on-surface font-table-cell text-table-cell focus:outline-none focus:ring-1 focus:ring-secondary"
            >
              <option>All GST Rates</option>
              <option>18% GST (HSN 8714 Auto Spares)</option>
              <option>28% GST (Specialty Assemblies)</option>
              <option>18% GST (HSN 2710 Engine Oils)</option>
              <option>18% GST (HSN 8511 Spark Plugs)</option>
              <option>12% GST (Tubes &amp; Flaps)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Master Inventory High-Density Data Grid Container */}
      <div className="bg-surface-container-lowest rounded shadow-xs overflow-hidden flex flex-col flex-1">
        <div className="overflow-x-auto max-h-[calc(100vh-325px)] min-h-[480px]">
          <table className="w-full text-left border-collapse select-text">
            {/* Sticky Header with High Operational Contrast */}
            <thead className="sticky top-0 z-20 bg-surface-container-high shadow-[0_1px_0_rgba(11,28,48,0.08)]">
              <tr className="h-8 text-on-surface-variant font-label-caps text-label-caps uppercase tracking-wider">
                <th className="w-8 px-space-sm text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === displayedParts.length && displayedParts.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded-xs accent-secondary cursor-pointer"
                    title="Select All Items"
                  />
                </th>
                <th className="px-space-sm py-1.5 w-36">Part / Barcode</th>
                <th className="px-space-sm py-1.5 min-w-[220px]">Item Description &amp; Brand</th>
                <th className="px-space-sm py-1.5 min-w-[230px]">Vehicle Compatibility</th>
                <th className="px-space-sm py-1.5 w-20">HSN</th>
                <th className="px-space-sm py-1.5 w-24">Rack / Bin</th>
                <th className="px-space-sm py-1.5 text-right w-24">Purchase</th>
                <th className="px-space-sm py-1.5 text-right w-24">Wholesale</th>
                <th className="px-space-sm py-1.5 text-right w-36">MRP / Counter</th>
                <th className="px-space-sm py-1.5 text-right w-24">Current Stock</th>
                <th className="px-space-sm py-1.5 text-center w-16">Reorder</th>
                <th className="px-space-sm py-1.5 text-center w-14">GST</th>
                <th className="px-space-sm py-1.5 text-center w-28">Status</th>
                <th className="px-space-sm py-1.5 text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-body-sm text-body-sm text-on-surface">
              {displayedParts.length === 0 && (
                <tr>
                  <td colSpan={14} className="py-16 text-center text-outline">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-4xl opacity-50">inventory_2</span>
                      <p className="font-semibold text-on-surface text-base">No spare parts found in inventory.</p>
                      <p className="text-xs">Adjust your search, change filters, or click "New Spare Part" to add one.</p>
                    </div>
                  </td>
                </tr>
              )}
              {displayedParts.map((part) => {
                const isSelected = selectedIds.includes(part.id);
                const isOutOfStock = part.currentStock === 0;
                const isLowStock = part.currentStock > 0 && part.currentStock < part.minReorder;

                let rowBgClass = 'hover:bg-surface-container-low transition-colors group';
                if (isOutOfStock) {
                  rowBgClass = 'bg-error-container/20 hover:bg-error-container/30 transition-colors group';
                } else if (isLowStock) {
                  rowBgClass = 'bg-surface-container/40 hover:bg-surface-container transition-colors group';
                }

                return (
                  <tr key={part.id} className={rowBgClass}>
                    <td className="px-space-sm text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(part.id)}
                        className="rounded-xs accent-secondary cursor-pointer"
                      />
                    </td>
                    <td className="px-space-sm py-1.5">
                      <div className="flex flex-col">
                        <span className={`font-shortcut-key text-shortcut-key font-bold ${isOutOfStock ? 'text-error' : 'text-secondary'}`}>
                          {part.sku}
                        </span>
                        <span className="font-numeric-data text-[11px] text-outline">
                          {part.barcode}
                        </span>
                      </div>
                    </td>
                    <td className="px-space-sm py-1.5">
                      <div className="flex flex-col">
                        <span className="font-table-cell text-table-cell font-semibold text-on-surface leading-tight">
                          {part.name}
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant font-shortcut-key text-[10px]">
                            {part.brand}
                          </span>
                          <span className="text-outline text-[10px] font-shortcut-key">
                            OEM: {part.oemCode}
                          </span>
                          {part.pendingPo && (
                            <span className="text-error text-[10px] font-shortcut-key font-bold ml-1">
                              Pending {part.pendingPo.qty} pcs in PO {part.pendingPo.poNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-space-sm py-1.5">
                      <div className="flex flex-wrap gap-1 items-center">
                        {part.vehicles.map((v, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface font-shortcut-key text-[10px]"
                          >
                            {v}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-space-sm py-1.5 font-numeric-data text-numeric-data text-outline">
                      {part.hsn}
                    </td>
                    <td className="px-space-sm py-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface font-shortcut-key text-shortcut-key font-bold">
                        {part.rackBin}
                      </span>
                    </td>
                    <td className="px-space-sm py-1.5 text-right font-numeric-data text-numeric-data text-outline">
                      ₹{part.purchasePrice.toFixed(2)}
                    </td>
                    <td className="px-space-sm py-1.5 text-right font-numeric-data text-numeric-data text-on-surface font-semibold">
                      ₹{part.wholesalePrice.toFixed(2)}
                    </td>
                    <td className="px-space-sm py-1.5 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-numeric-data text-numeric-data font-bold text-on-surface">
                          ₹{part.mrp.toFixed(2)}
                        </span>
                        <span className="font-shortcut-key text-[10px] text-secondary">
                          CTR ₹{part.counterPrice.toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="px-space-sm py-1.5 text-right">
                      <span
                        className={`font-numeric-data text-numeric-data font-bold ${
                          isOutOfStock
                            ? 'text-error'
                            : isLowStock
                            ? 'text-on-secondary-fixed-variant'
                            : 'text-on-tertiary-container'
                        }`}
                      >
                        {part.currentStock} {part.unit}
                      </span>
                    </td>
                    <td className="px-space-sm py-1.5 text-center font-numeric-data text-numeric-data text-outline">
                      {part.minReorder}
                    </td>
                    <td className="px-space-sm py-1.5 text-center font-numeric-data text-numeric-data text-outline">
                      {part.gstRate}%
                    </td>
                    <td className="px-space-sm py-1.5 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full font-label-caps text-[10px] uppercase font-bold ${
                          isOutOfStock
                            ? 'bg-error text-on-error'
                            : isLowStock
                            ? 'bg-surface-container-highest text-on-secondary-fixed-variant'
                            : 'bg-surface-container text-on-tertiary-container'
                        }`}
                      >
                        {part.status}
                      </span>
                    </td>
                    <td className="px-space-sm py-1.5 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-90 group-hover:opacity-100">
                        {isOutOfStock ? (
                          <button
                            onClick={() => onOpenPoModal(part.name)}
                            className="px-2 py-0.5 bg-error text-on-error rounded font-shortcut-key text-[10px] uppercase font-bold hover:bg-on-error-container"
                            title="Create Reorder Purchase Order"
                          >
                            PO Order
                          </button>
                        ) : isLowStock ? (
                          <button
                            onClick={() => onOpenPoModal(part.name)}
                            className="px-2 py-0.5 bg-surface-container-high text-on-surface rounded font-shortcut-key text-[10px] uppercase font-bold hover:bg-secondary hover:text-on-secondary"
                            title="Order Stock"
                          >
                            Reorder
                          </button>
                        ) : null}
                        <button
                          onClick={() => setSelectedPartForDrawer(part)}
                          className="p-1 rounded hover:bg-surface-container-high text-secondary"
                          title="Stock Movement Card & Vehicle Matrix"
                        >
                          <span className="material-symbols-outlined text-[18px]">history</span>
                        </button>
                        <button
                          onClick={() => setSelectedPartForDrawer(part)}
                          className="p-1 rounded hover:bg-surface-container-high text-on-surface-variant"
                          title="Edit Item Details"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => {
                            const labelHtml = `
                              <div style="border: 1px dashed #000; padding: 12px; text-align: center; width: 50mm; height: 28mm; box-sizing: border-box; font-family: monospace; margin: auto;">
                                <div style="font-weight: bold; font-size: 12px;">BIKE ERP — ${part.brand}</div>
                                <div style="font-size: 11px; margin: 4px 0;">${part.name}</div>
                                <div style="font-size: 16px; font-weight: bold; letter-spacing: 2px;">*${part.barcode || part.sku}*</div>
                                <div style="font-size: 11px; margin-top: 4px;">MRP: ₹${part.mrp} | Rack: ${part.rackBin}</div>
                              </div>
                            `;
                            triggerPrintWindow(`Barcode - ${part.sku}`, labelHtml);
                          }}
                          className="p-1 rounded hover:bg-surface-container-high text-on-surface-variant"
                          title="Print Barcode Tag"
                        >
                          <span className="material-symbols-outlined text-[18px]">qr_code</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom Data Summary & Density Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between px-space-md py-2 bg-surface-container-low border-t border-surface-container-high gap-2">
          <div className="flex items-center gap-gutter text-on-surface-variant font-table-cell text-table-cell">
            <span>
              Showing <strong className="font-numeric-data text-on-surface">1 - {displayedParts.length}</strong> of{' '}
              <strong className="font-numeric-data text-on-surface">4,820</strong> items
            </span>
            <span className="text-outline-variant">|</span>
            <span>
              Selected: <strong className="font-numeric-data text-secondary">{selectedIds.length} items</strong>
            </span>
            <span className="text-outline-variant">|</span>
            <span>
              Stock Valuation on Page:{' '}
              <strong className="font-numeric-data text-on-surface font-bold">
                ₹{pageValuation.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-1 font-shortcut-key text-shortcut-key text-outline">
              <span>Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="h-6 bg-surface-container-lowest rounded px-1 text-on-surface font-shortcut-key focus:outline-none"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="w-6 h-6 flex items-center justify-center rounded bg-surface-container-lowest text-outline hover:text-on-surface disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>

              <span className="px-2 py-0.5 rounded bg-secondary text-on-secondary font-shortcut-key text-shortcut-key font-bold">
                1
              </span>
              <button className="px-2 py-0.5 rounded bg-surface-container-lowest hover:bg-surface-container text-on-surface font-shortcut-key text-shortcut-key">
                2
              </button>
              <button className="px-2 py-0.5 rounded bg-surface-container-lowest hover:bg-surface-container text-on-surface font-shortcut-key text-shortcut-key">
                3
              </button>
              <span className="font-shortcut-key text-shortcut-key text-outline">...</span>
              <button className="px-2 py-0.5 rounded bg-surface-container-lowest hover:bg-surface-container text-on-surface font-shortcut-key text-shortcut-key">
                193
              </button>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="w-6 h-6 flex items-center justify-center rounded bg-surface-container-lowest text-on-surface hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-Over Inspection Drawer: Stock Movement & Vehicle Matrix */}
      {selectedPartForDrawer && (
        <div
          className="fixed inset-y-0 right-0 w-full max-w-xl bg-surface-container-lowest shadow-2xl border-l border-surface-container-high z-50 transform transition-transform duration-200 ease-in-out flex flex-col"
          id="stockAuditDrawer"
        >
          {/* Drawer Header */}
          <div className="p-space-md bg-surface-container flex items-center justify-between border-b border-surface-container-high">
            <div className="flex flex-col">
              <div className="flex items-center gap-space-xs">
                <span className="font-shortcut-key text-shortcut-key text-secondary font-bold" id="drawerPartSku">
                  {selectedPartForDrawer.sku}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-secondary text-on-secondary font-label-caps text-[10px] uppercase">
                  Live Stock Ledger
                </span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface mt-0.5" id="drawerPartName">
                {selectedPartForDrawer.name}
              </h3>
            </div>
            <button
              className="p-1.5 rounded-full hover:bg-surface-container-high text-outline hover:text-on-surface"
              onClick={() => setSelectedPartForDrawer(null)}
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-space-md flex flex-col gap-space-md">
            {/* Quick Metric Tiles */}
            <div className="grid grid-cols-3 gap-space-xs">
              <div className="p-space-sm rounded bg-surface-container-low">
                <span className="font-label-caps text-label-caps text-outline uppercase">Physical Qty</span>
                <div className="font-numeric-lg text-numeric-lg text-on-surface mt-1">
                  {selectedPartForDrawer.physicalQty} {selectedPartForDrawer.unit}
                </div>
                <span className="font-shortcut-key text-[10px] text-on-tertiary-container">
                  Bin: {selectedPartForDrawer.rackBin}
                </span>
              </div>

              <div className="p-space-sm rounded bg-surface-container-low">
                <span className="font-label-caps text-label-caps text-outline uppercase">Avg Landed Cost</span>
                <div className="font-numeric-lg text-numeric-lg text-on-surface mt-1">
                  ₹{selectedPartForDrawer.avgLandedCost.toFixed(2)}
                </div>
                <span className="font-shortcut-key text-[10px] text-outline">Incl. Freight &amp; GST</span>
              </div>

              <div className="p-space-sm rounded bg-surface-container-low">
                <span className="font-label-caps text-label-caps text-outline uppercase">30-Day Velocity</span>
                <div className="font-numeric-lg text-numeric-lg text-secondary mt-1">
                  {selectedPartForDrawer.thirtyDayVelocity} Sold
                </div>
                <span className="font-shortcut-key text-[10px] text-on-tertiary-container">High Turnover</span>
              </div>
            </div>

            {/* Recent Stock Ledger Transactions */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                  Recent Stock Audits &amp; In/Out Movements
                </span>
                <span 
                  onClick={() => {
                    const headers = ['Date', 'Reference', 'Type', 'Quantity', 'Balance', 'User / Party'];
                    const rows = (selectedPartForDrawer.stockMovements || []).map(m => [
                      m.date,
                      m.ref,
                      m.type,
                      m.qty,
                      m.balance,
                      m.userOrParty
                    ]);
                    exportToCsv(`Stock_Ledger_${selectedPartForDrawer.sku}.csv`, headers, rows);
                  }}
                  className="font-shortcut-key text-shortcut-key text-secondary cursor-pointer hover:underline"
                >
                  Download Stock Card (CSV) →
                </span>
              </div>
              <div className="overflow-x-auto rounded bg-surface-container-low">
                <table className="w-full text-left text-[12px] font-body-sm">
                  <thead className="bg-surface-container-high text-on-surface-variant font-label-caps text-[10px] uppercase">
                    <tr>
                      <th className="p-1.5">Date / Ref</th>
                      <th className="p-1.5">Type</th>
                      <th className="p-1.5 text-right">Qty</th>
                      <th className="p-1.5 text-right">Balance</th>
                      <th className="p-1.5">User / Party</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-high">
                    {selectedPartForDrawer.stockMovements.map((mov, mIdx) => (
                      <tr key={mIdx}>
                        <td className="p-1.5">
                          <div className="flex flex-col">
                            <span className="font-numeric-data font-semibold">{mov.date}</span>
                            <span className="text-outline text-[10px]">{mov.ref}</span>
                          </div>
                        </td>
                        <td className="p-1.5">
                          <span
                            className={`px-1 rounded font-label-caps text-[9px] uppercase ${
                              mov.type.includes('Out')
                                ? 'bg-error-container text-on-error-container'
                                : 'bg-surface-container-highest text-on-tertiary-container'
                            }`}
                          >
                            {mov.type}
                          </span>
                        </td>
                        <td
                          className={`p-1.5 text-right font-numeric-data font-bold ${
                            mov.qty < 0 ? 'text-error' : 'text-on-tertiary-container'
                          }`}
                        >
                          {mov.qty > 0 ? `+${mov.qty}` : mov.qty}
                        </td>
                        <td className="p-1.5 text-right font-numeric-data font-semibold">
                          {mov.balance}
                        </td>
                        <td className="p-1.5 text-outline">{mov.userOrParty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Vehicle Model Compatibility Multi-Selector */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider">
                  Vehicle Compatibility Matrix
                </span>
                <button
                  onClick={() => {
                    const newModel = prompt('Enter Vehicle Model Name (e.g., Royal Enfield Hunter 350):');
                    if (newModel && selectedPartForDrawer) {
                      selectedPartForDrawer.compatMatrix.push({
                        model: newModel,
                        specs: '2023-2026 BS6 Phase 2',
                        fitType: '100% Direct Fit'
                      });
                      setSelectedPartForDrawer({ ...selectedPartForDrawer });
                    }
                  }}
                  className="font-shortcut-key text-shortcut-key text-secondary flex items-center gap-0.5 hover:underline"
                >
                  <span className="material-symbols-outlined text-[14px]">add</span> Add Vehicle Link
                </button>
              </div>
              <div className="p-space-sm bg-surface-container-low rounded flex flex-col gap-space-xs">
                {selectedPartForDrawer.compatMatrix.map((compat, cIdx) => (
                  <div
                    key={cIdx}
                    className={`flex items-center justify-between py-1 ${
                      cIdx < selectedPartForDrawer.compatMatrix.length - 1
                        ? 'border-b border-surface-container-high'
                        : ''
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-table-cell text-table-cell font-semibold">
                        {compat.model}
                      </span>
                      <span className="text-outline text-[11px] font-numeric-data">
                        {compat.specs}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded font-label-caps text-[10px] uppercase font-bold ${
                        compat.fitType === '100% Direct Fit'
                          ? 'bg-surface-container text-on-tertiary-container'
                          : compat.fitType === 'Compatible'
                          ? 'bg-surface-container text-secondary'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {compat.fitType}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-space-md bg-surface-container border-t border-surface-container-high flex items-center justify-between">
            <button
              className="px-space-md py-1.5 rounded bg-surface-container-lowest text-on-surface font-table-cell text-table-cell hover:bg-surface-container-high transition-colors"
              onClick={() => setSelectedPartForDrawer(null)}
            >
              Dismiss
            </button>
            <div className="flex items-center gap-space-sm">
              <button
                onClick={() => {
                  const newBin = prompt('Enter new rack / bin location:', selectedPartForDrawer.rackBin);
                  if (newBin && selectedPartForDrawer) {
                    selectedPartForDrawer.rackBin = newBin;
                    setSelectedPartForDrawer({ ...selectedPartForDrawer });
                  }
                }}
                className="px-space-md py-1.5 rounded bg-surface-container-lowest text-secondary font-table-cell text-table-cell hover:bg-surface-container-high border border-surface-container-high transition-colors"
              >
                Adjust Bin Location
              </button>
              <button
                onClick={() => {
                  setSelectedPartForDrawer(null);
                }}
                className="px-space-md py-1.5 rounded bg-secondary text-on-secondary font-table-cell text-table-cell hover:bg-secondary-container transition-colors"
              >
                Save Item Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
