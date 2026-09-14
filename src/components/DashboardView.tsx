import React, { useState } from 'react';
import { Invoice, SparePart, TenderReconciliationData } from '../types';

interface DashboardViewProps {
  invoices: Invoice[];
  parts: SparePart[];
  tenderData: TenderReconciliationData;
  onNavigate: (screen: string) => void;
  onOpenNewBill: () => void;
  onOpenPartFinder: () => void;
  onOpenNewPart: () => void;
  onViewInvoice: (invoice: Invoice) => void;
  onPrintInvoice: (invoice: Invoice) => void;
  onOpenShiftSummary: () => void;
  onOrderPo: (partName: string) => void;
  onFilterLowStock: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  invoices,
  parts,
  tenderData,
  onNavigate,
  onOpenNewBill,
  onOpenPartFinder,
  onOpenNewPart,
  onViewInvoice,
  onPrintInvoice,
  onOpenShiftSummary,
  onOrderPo,
  onFilterLowStock
}) => {
  const [timeRange, setTimeRange] = useState('Today vs Yesterday');
  const [invoiceFilter, setInvoiceFilter] = useState<'ALL' | 'PAID' | 'CREDIT'>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [chartHoverPoint, setChartHoverPoint] = useState<{ x: number; y: number; label: string; amount: string } | null>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleExportMIS = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Invoice No,Customer,Amount,PayMode,TaxType,Status,Operator\n"
      + invoices.map(e => `${e.id},"${e.customerName}",${e.totalAmount},${e.payMode},${e.taxType},${e.status},"${e.operator}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MIS_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredInvoices = invoices.filter(inv => {
    if (invoiceFilter === 'PAID') return inv.status === 'PAID';
    if (invoiceFilter === 'CREDIT') return inv.status.includes('CREDIT');
    return true;
  });

  const totalSalesToday = invoices.reduce((sum, inv) => sum + (inv.totalAmount || inv.total || 0), 0);
  const stockValuation = parts.reduce((sum, p) => sum + ((p.stockQty ?? p.currentStock ?? 0) * (p.mrp || p.purchasePrice || 0)), 0);
  const lowStockCount = parts.filter(p => (p.stockQty ?? p.currentStock ?? 0) <= (p.minStock ?? p.minReorder ?? 0)).length;
  const zeroStockCount = parts.filter(p => (p.stockQty ?? p.currentStock ?? 0) === 0).length;
  const currentDateStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="flex flex-col w-full pb-10 space-y-gutter animate-in fade-in duration-200">
      {/* Top Command & Greeting Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between bg-surface-container-lowest p-gutter rounded shadow-xs gap-space-md">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-sm">
            <span className="inline-flex items-center px-space-xs py-0.5 rounded bg-surface-container font-label-caps text-label-caps text-secondary uppercase tracking-wider">
              Counter Operations
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container animate-pulse"></span>
            <span className="font-shortcut-key text-shortcut-key text-on-tertiary-container font-semibold">
              Live Realtime Sync
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface mt-0.5 tracking-tight">
            Counter Terminal Dashboard
          </h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Bike spare parts &amp; service management • {currentDateStr} •{' '}
            <span className="font-semibold text-on-surface">
              Shift Active (08:30 AM - 09:00 PM)
            </span>
          </p>
        </div>

        {/* Header Action Controls */}
        <div className="flex flex-wrap items-center gap-space-sm">
          <div className="flex items-center bg-surface-container px-space-sm py-1 rounded gap-space-xs">
            <span className="material-symbols-outlined text-outline text-[16px]">calendar_today</span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-transparent font-table-cell text-table-cell text-on-surface font-semibold focus:outline-none cursor-pointer"
            >
              <option>Today vs Yesterday</option>
              <option>This Week vs Last Week</option>
              <option>This Month vs Target</option>
              <option>Custom Date Range</option>
            </select>
          </div>

          <button
            onClick={onOpenShiftSummary}
            className="flex items-center gap-space-xs px-space-sm py-1.5 rounded bg-surface-container-high hover:bg-surface-variant text-on-surface font-table-cell text-table-cell transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">point_of_sale</span>
            <span>Shift Closing Summary</span>
          </button>

          <button
            onClick={handleExportMIS}
            className="flex items-center gap-space-xs px-space-sm py-1.5 rounded bg-primary-container text-surface-bright hover:bg-primary transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span className="font-table-cell text-table-cell">Export MIS</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Strip: 6 Cards in compact responsive row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-space-sm">
        {/* Card 1: Today's Sales */}
        <div className="bg-surface-container-lowest p-space-md rounded flex flex-col justify-between shadow-xs relative overflow-hidden">
          <div className="flex items-start justify-between">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
              Today's Sales
            </span>
            <span className="p-1 rounded bg-secondary/10 text-secondary">
              <span className="material-symbols-outlined text-[16px]">receipt_long</span>
            </span>
          </div>
          <div className="mt-space-sm">
            <div className="font-numeric-lg text-numeric-lg text-on-surface font-bold">
              ₹{totalSalesToday.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1 mt-0.5 font-body-sm text-body-sm">
              <span className="text-on-surface-variant font-shortcut-key text-shortcut-key">
                ({invoices.length} bills)
              </span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary"></div>
        </div>

        {/* Card 2: Today's Purchases */}
        <div className="bg-surface-container-lowest p-space-md rounded flex flex-col justify-between shadow-xs relative overflow-hidden">
          <div className="flex items-start justify-between">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
              Purchases (GRN)
            </span>
            <span className="p-1 rounded bg-surface-container text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px]">local_shipping</span>
            </span>
          </div>
          <div className="mt-space-sm">
            <div className="font-numeric-lg text-numeric-lg text-on-surface font-bold">
              ₹0.00
            </div>
            <div className="text-on-surface-variant font-shortcut-key text-shortcut-key mt-0.5">
              0 Inwards Recd
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-outline"></div>
        </div>

        {/* Card 3: Receivables */}
        <div className="bg-surface-container-lowest p-space-md rounded flex flex-col justify-between shadow-xs relative overflow-hidden">
          <div className="flex items-start justify-between">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
              Total Receivables
            </span>
            <span className="p-1 rounded bg-surface-container text-secondary">
              <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
            </span>
          </div>
          <div className="mt-space-sm">
            <div className="font-numeric-lg text-numeric-lg text-on-surface font-bold">
              ₹0.00
            </div>
            <div className="text-on-surface-variant font-shortcut-key text-shortcut-key mt-0.5">
              0 Customer Ledgers
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary-container"></div>
        </div>

        {/* Card 4: Payables */}
        <div className="bg-surface-container-lowest p-space-md rounded flex flex-col justify-between shadow-xs relative overflow-hidden">
          <div className="flex items-start justify-between">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
              Total Payables
            </span>
            <span className="p-1 rounded bg-surface-container text-error">
              <span className="material-symbols-outlined text-[16px]">pending_actions</span>
            </span>
          </div>
          <div className="mt-space-sm">
            <div className="font-numeric-lg text-numeric-lg text-on-surface font-bold">
              ₹0.00
            </div>
            <div className="text-on-surface-variant font-shortcut-key text-shortcut-key mt-0.5 font-semibold">
              Due this week: ₹0.00
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-error"></div>
        </div>

        {/* Card 5: Stock Valuation */}
        <div 
          onClick={() => onNavigate('items-master')}
          className="bg-surface-container-lowest p-space-md rounded flex flex-col justify-between shadow-xs relative overflow-hidden cursor-pointer hover:bg-surface-container-low transition-colors"
          title="Click to view Item Master"
        >
          <div className="flex items-start justify-between">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
              Stock Valuation
            </span>
            <span className="p-1 rounded bg-surface-container text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px]">warehouse</span>
            </span>
          </div>
          <div className="mt-space-sm">
            <div className="font-numeric-lg text-numeric-lg text-on-surface font-bold">
              ₹{stockValuation.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-on-surface-variant font-shortcut-key text-shortcut-key mt-0.5">
              {parts.length} Active SKUs
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-outline-variant"></div>
        </div>

        {/* Card 6: Low Stock Alerts */}
        <div 
          onClick={onFilterLowStock}
          className="bg-surface-container-lowest p-space-md rounded flex flex-col justify-between shadow-xs relative overflow-hidden cursor-pointer hover:bg-error-container/20 transition-colors"
          title="Click to filter low stock items"
        >
          <div className="flex items-start justify-between">
            <span className="font-label-caps text-label-caps text-error uppercase font-bold">
              Stock Alerts
            </span>
            <span className="p-1 rounded bg-error-container text-on-error-container">
              <span className="material-symbols-outlined text-[16px]">warning</span>
            </span>
          </div>
          <div className="mt-space-sm">
            <div className="font-numeric-lg text-numeric-lg text-error font-bold">
              {lowStockCount} Items
            </div>
            <div className="text-error font-shortcut-key text-shortcut-key mt-0.5 font-bold">
              {zeroStockCount} Critical Zero-Stock
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-error"></div>
        </div>
      </div>

      {/* Rapid Counter Quick Actions Ribbon */}
      <div className="bg-surface-container-lowest px-gutter py-space-sm rounded shadow-xs flex items-center justify-between overflow-x-auto gap-space-sm">
        <div className="flex items-center gap-space-xs text-on-surface-variant flex-shrink-0">
          <span className="material-symbols-outlined text-[18px] text-secondary">bolt</span>
          <span className="font-label-caps text-label-caps uppercase tracking-wider text-outline">
            Quick Trigger:
          </span>
        </div>
        <div className="flex items-center gap-space-sm flex-nowrap">
          {/* F4 POS Bill */}
          <button
            onClick={onOpenNewBill}
            className="flex items-center gap-space-xs px-space-md py-1.5 bg-secondary hover:bg-secondary-container text-on-secondary rounded transition-colors shadow-xs flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">shopping_cart_checkout</span>
            <span className="font-table-cell text-table-cell font-semibold">New POS Counter Bill</span>
            <kbd className="px-1.5 py-0.5 rounded bg-on-secondary-fixed text-on-secondary font-shortcut-key text-shortcut-key ml-1">
              F4
            </kbd>
          </button>

          {/* F2 Part Finder */}
          <button
            onClick={onOpenPartFinder}
            className="flex items-center gap-space-xs px-space-md py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded transition-colors flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">two_wheeler</span>
            <span className="font-table-cell text-table-cell font-semibold">Fast Part Finder</span>
            <kbd className="px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface font-shortcut-key text-shortcut-key ml-1">
              F2
            </kbd>
          </button>

          {/* Purchase Inward */}
          <button
            onClick={() => onNavigate('purchase-orders')}
            className="flex items-center gap-space-xs px-space-md py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded transition-colors flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">input</span>
            <span className="font-table-cell text-table-cell font-semibold">+ Purchase Inward (GRN)</span>
          </button>

          {/* Receive Payment */}
          <button
            onClick={() => onNavigate('payment-receipts')}
            className="flex items-center gap-space-xs px-space-md py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded transition-colors flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">payments</span>
            <span className="font-table-cell text-table-cell font-semibold">+ Receive Payment</span>
          </button>

          {/* Quotation */}
          <button
            onClick={() => onNavigate('quotations')}
            className="flex items-center gap-space-xs px-space-md py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded transition-colors flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">request_quote</span>
            <span className="font-table-cell text-table-cell font-semibold">+ Quotation</span>
          </button>

          {/* Add New Spare SKU */}
          <button
            onClick={onOpenNewPart}
            className="flex items-center gap-space-xs px-space-md py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded transition-colors flex-shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">add_box</span>
            <span className="font-table-cell text-table-cell font-semibold">+ Add Spare SKU</span>
          </button>
        </div>
      </div>

      {/* Main Grid Layout (65% / 35% Split) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter items-start">
        {/* LEFT SECTION (Width ~65% -> 8 columns) */}
        <div className="xl:col-span-8 flex flex-col space-y-gutter">
          {/* 1. Sales & Collection Hourly Velocity Chart Widget */}
          <div className="bg-surface-container-lowest p-gutter rounded shadow-xs flex flex-col">
            <div className="flex items-center justify-between mb-space-sm">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface">
                  Hourly Counter Velocity
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Billing frequency &amp; transaction density (Peak: 10:00 AM - 1:00 PM and 5:00 PM - 8:30 PM)
                </p>
              </div>
              <div className="flex items-center gap-space-sm text-body-sm">
                <div className="flex items-center gap-1 font-shortcut-key text-shortcut-key text-on-surface-variant">
                  <span className="w-3 h-3 rounded-xs bg-secondary"></span> Retail Bills
                </div>
                <div className="flex items-center gap-1 font-shortcut-key text-shortcut-key text-on-surface-variant">
                  <span className="w-3 h-3 rounded-xs bg-surface-variant"></span> Wholesale/Ledger
                </div>
              </div>
            </div>

            {/* Inline SVG Visualization representing hourly timeline spikes */}
            <div className="w-full bg-surface-container-low rounded p-space-sm relative">
              <svg className="w-full h-28 overflow-visible" preserveAspectRatio="none" viewBox="0 0 740 120">
                {/* Grid Lines */}
                <line stroke="#dce9ff" strokeDasharray="3 3" x1="0" x2="740" y1="20" y2="20" />
                <line stroke="#dce9ff" strokeDasharray="3 3" x1="0" x2="740" y1="60" y2="60" />
                <line stroke="#dce9ff" x1="0" x2="740" y1="100" y2="100" />

                {/* Area Fill */}
                <path
                  d="M0,100 L30,95 L70,88 L120,40 L170,22 L220,30 L270,68 L320,78 L370,72 L420,62 L480,25 L540,18 L600,28 L660,75 L740,92 L740,100 Z"
                  fill="#d3e4fe"
                  opacity="0.6"
                />

                {/* Sales Line */}
                <path
                  d="M0,100 L30,95 L70,88 L120,40 L170,22 L220,30 L270,68 L320,78 L370,72 L420,62 L480,25 L540,18 L600,28 L660,75 L740,92"
                  fill="none"
                  stroke="#0051d5"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                />

                {/* Interactive Points */}
                <circle
                  cx="170"
                  cy="22"
                  fill="#0051d5"
                  r="5"
                  className="cursor-pointer hover:scale-125 transition-transform"
                  onMouseEnter={() => setChartHoverPoint({ x: 170, y: 22, label: '11:00 AM', amount: '₹28,400 (21 bills)' })}
                  onMouseLeave={() => setChartHoverPoint(null)}
                />
                <circle
                  cx="540"
                  cy="18"
                  fill="#0051d5"
                  r="5"
                  className="cursor-pointer hover:scale-125 transition-transform"
                  onMouseEnter={() => setChartHoverPoint({ x: 540, y: 18, label: '06:30 PM Peak', amount: '₹36,200 (26 bills)' })}
                  onMouseLeave={() => setChartHoverPoint(null)}
                />

                {/* Labels within SVG */}
                <text fill="#0051d5" fontFamily="JetBrains Mono" fontSize="10" fontWeight="bold" textAnchor="middle" x="170" y="14">
                  ₹28.4k (11 AM)
                </text>
                <text fill="#0051d5" fontFamily="JetBrains Mono" fontSize="10" fontWeight="bold" textAnchor="middle" x="540" y="10">
                  ₹36.2k (6:30 PM Peak)
                </text>
              </svg>

              {chartHoverPoint && (
                <div
                  className="absolute bg-inverse-surface text-inverse-on-surface px-2 py-1 rounded text-xs pointer-events-none shadow-md"
                  style={{ left: `${(chartHoverPoint.x / 740) * 90}%`, top: '10px' }}
                >
                  <div className="font-bold">{chartHoverPoint.label}</div>
                  <div className="font-mono text-[11px]">{chartHoverPoint.amount}</div>
                </div>
              )}

              <div className="flex justify-between font-shortcut-key text-shortcut-key text-on-surface-variant pt-1 px-1">
                <span>09:00 AM</span>
                <span>11:00 AM (Peak 1)</span>
                <span>01:00 PM</span>
                <span>03:30 PM</span>
                <span>06:30 PM (Peak 2)</span>
                <span>08:30 PM</span>
                <span>Closed</span>
              </div>
            </div>
          </div>

          {/* 2. Recent Counter Sales & Invoices Live Stream (Dense Table) */}
          <div className="bg-surface-container-lowest rounded shadow-xs overflow-hidden flex flex-col">
            <div className="p-space-md flex items-center justify-between bg-surface-container-lowest border-b border-surface-container-high">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary text-[20px]">history_toggle_off</span>
                <h2 className="font-headline-md text-headline-md text-on-surface">
                  Recent Counter Invoices Live Stream
                </h2>
                <span className="ml-space-xs px-space-xs py-0.5 rounded bg-surface-container font-shortcut-key text-shortcut-key text-on-surface font-semibold">
                  Today: {invoices.length} Bills
                </span>
              </div>
              <div className="flex items-center gap-space-xs">
                <div className="flex items-center bg-surface-container-low rounded p-0.5 text-xs font-shortcut-key">
                  <button
                    onClick={() => setInvoiceFilter('ALL')}
                    className={`px-2 py-0.5 rounded ${invoiceFilter === 'ALL' ? 'bg-secondary text-on-secondary' : 'text-outline'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setInvoiceFilter('PAID')}
                    className={`px-2 py-0.5 rounded ${invoiceFilter === 'PAID' ? 'bg-secondary text-on-secondary' : 'text-outline'}`}
                  >
                    Paid
                  </button>
                  <button
                    onClick={() => setInvoiceFilter('CREDIT')}
                    className={`px-2 py-0.5 rounded ${invoiceFilter === 'CREDIT' ? 'bg-secondary text-on-secondary' : 'text-outline'}`}
                  >
                    Credit
                  </button>
                </div>
                <button
                  onClick={handleRefresh}
                  className="px-space-xs py-1 rounded hover:bg-surface-container text-on-surface-variant font-shortcut-key text-shortcut-key flex items-center gap-1"
                >
                  <span className={`material-symbols-outlined text-[16px] ${isRefreshing ? 'animate-spin' : ''}`}>
                    refresh
                  </span>{' '}
                  Refresh
                </button>
              </div>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider select-none">
                    <th className="py-2 px-space-sm font-semibold">Inv #</th>
                    <th className="py-2 px-space-sm font-semibold">Customer &amp; Bike Model</th>
                    <th className="py-2 px-space-sm font-semibold">Items / Parts Summary</th>
                    <th className="py-2 px-space-sm font-semibold text-right">Amount</th>
                    <th className="py-2 px-space-sm font-semibold">Pay Mode</th>
                    <th className="py-2 px-space-sm font-semibold text-center">Tax Type</th>
                    <th className="py-2 px-space-sm font-semibold text-center">Status</th>
                    <th className="py-2 px-space-sm font-semibold">Operator</th>
                    <th className="py-2 px-space-sm font-semibold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high font-table-cell text-table-cell">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-on-surface-variant font-body-sm italic">
                        No sales invoices recorded yet. Start billing with F4 or "New POS Counter Bill".
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.slice(0, 6).map((inv) => (
                      <tr key={inv.id} className="hover:bg-surface-container-low transition-colors group">
                        <td className="py-2 px-space-sm font-numeric-data text-numeric-data font-bold text-secondary">
                          {inv.id}
                        </td>
                        <td className="py-2 px-space-sm">
                          <div className="font-semibold text-on-surface leading-tight">
                            {inv.customerName}
                          </div>
                          <div className={`font-shortcut-key text-shortcut-key ${inv.isGarage ? 'text-secondary font-semibold' : 'text-on-surface-variant'}`}>
                            {inv.isGarage ? `Garage Account ${inv.garageAccountId}` : `${inv.vehicleNo || 'Retail'} • ${inv.bikeModel || 'Counter'}`}
                          </div>
                        </td>
                        <td className="py-2 px-space-sm text-on-surface-variant">
                          <span className="font-semibold text-on-surface">{inv.itemsCount || inv.items?.length || 0} items</span>
                          <span className="text-outline text-xs block truncate max-w-[180px]">
                            {inv.itemsSummary}
                          </span>
                        </td>
                        <td className="py-2 px-space-sm font-numeric-data text-numeric-data font-bold text-right text-on-surface">
                          ₹{(inv.totalAmount || inv.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2 px-space-sm">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-container text-on-surface font-shortcut-key text-shortcut-key">
                            {inv.payMode === 'UPI (GPay)' && (
                              <span className="material-symbols-outlined text-[13px] text-secondary">qr_code_2</span>
                            )}
                            {inv.payMode === 'Credit Ledger' && (
                              <span className="material-symbols-outlined text-[13px] text-outline">menu_book</span>
                            )}
                            {inv.payMode === 'Cash' && (
                              <span className="material-symbols-outlined text-[13px] text-on-tertiary-container">payments</span>
                            )}
                            {inv.payMode === 'NEFT Bank' && (
                              <span className="material-symbols-outlined text-[13px] text-secondary">account_balance</span>
                            )}
                            {inv.payMode === 'Card POS' && (
                              <span className="material-symbols-outlined text-[13px] text-secondary">credit_card</span>
                            )}
                            {inv.payMode}
                          </span>
                        </td>
                        <td className="py-2 px-space-sm text-center">
                          <span className={`px-1.5 py-0.5 rounded font-shortcut-key text-shortcut-key ${
                            inv.taxType?.includes('B2B')
                              ? 'bg-surface-variant text-secondary font-bold'
                              : 'bg-surface-container text-on-surface-variant'
                          }`}>
                            {inv.taxType || 'B2C'}
                          </span>
                        </td>
                        <td className="py-2 px-space-sm text-center">
                          <span className={`inline-block px-1.5 py-0.5 rounded font-shortcut-key text-shortcut-key font-bold ${
                            inv.status === 'PAID'
                              ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                              : 'bg-error-container text-on-error-container'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-2 px-space-sm text-on-surface-variant font-shortcut-key text-shortcut-key">
                          {inv.operator}
                        </td>
                        <td className="py-2 px-space-sm text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => onPrintInvoice(inv)}
                              className="p-1 rounded hover:bg-surface-container text-on-surface-variant hover:text-secondary"
                              title="Print GST Bill"
                            >
                              <span className="material-symbols-outlined text-[16px]">print</span>
                            </button>
                            <button
                              onClick={() => onViewInvoice(inv)}
                              className="p-1 rounded hover:bg-surface-container text-on-surface-variant"
                              title="View Invoice Detail"
                            >
                              <span className="material-symbols-outlined text-[16px]">visibility</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-space-sm bg-surface-container-low flex items-center justify-between text-body-sm text-on-surface-variant">
              <span className="font-shortcut-key text-shortcut-key">
                Showing latest {Math.min(filteredInvoices.length, 5)} of {invoices.length} bills today
              </span>
              <button
                onClick={() => onNavigate('invoices')}
                className="text-secondary font-semibold hover:underline flex items-center gap-0.5 font-table-cell text-table-cell"
              >
                View Complete Sales Register{' '}
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION (Width ~35% -> 4 columns) */}
        <div className="xl:col-span-4 flex flex-col space-y-gutter">
          {/* 1. Critical Low Stock & Reorder Alert */}
          <div className="bg-surface-container-lowest rounded shadow-xs overflow-hidden flex flex-col">
            <div className="p-space-md bg-error-container/40 flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-error text-[18px]">emergency</span>
                <h2 className="font-headline-md text-headline-md text-on-error-container font-bold">
                  Critical Low Stock Alert
                </h2>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-error text-on-error font-shortcut-key text-shortcut-key font-bold">
                {parts.filter((p) => p.currentStock === 0).length} Zero
              </span>
            </div>

            <div className="divide-y divide-surface-container-high overflow-y-auto max-h-[340px]">
              {parts.filter((p) => p.currentStock <= p.minReorder).length === 0 ? (
                <div className="p-6 text-center text-outline">
                  <span className="material-symbols-outlined text-3xl text-secondary mb-1">check_circle</span>
                  <p className="text-xs font-semibold text-on-surface">All Stock Levels Healthy</p>
                  <p className="text-[11px] text-outline mt-0.5">No parts currently below reorder thresholds.</p>
                </div>
              ) : (
                parts
                  .filter((p) => p.currentStock <= p.minReorder)
                  .slice(0, 5)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="p-space-sm hover:bg-surface-container-low transition-colors flex items-center justify-between gap-space-sm"
                    >
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-table-cell text-table-cell font-semibold text-on-surface truncate">
                          {p.name}
                        </span>
                        <span className="font-shortcut-key text-shortcut-key text-on-surface-variant truncate">
                          {p.brand} • {p.sku || p.partNumber}
                        </span>
                        <div className="flex items-center gap-space-sm mt-0.5 font-shortcut-key text-shortcut-key">
                          <span className={p.currentStock === 0 ? 'text-error font-bold' : 'text-on-surface font-bold'}>
                            Stock: {p.currentStock}
                          </span>
                          <span className="text-outline">Min: {p.minReorder}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => onOrderPo(p.name)}
                        className="px-space-sm py-1 bg-surface-container hover:bg-secondary hover:text-on-secondary text-on-surface font-shortcut-key text-shortcut-key rounded flex items-center gap-1 transition-colors flex-shrink-0"
                      >
                        <span className="material-symbols-outlined text-[14px]">add_shopping_cart</span> PO
                      </button>
                    </div>
                  ))
              )}
            </div>

            <div className="p-space-xs bg-surface-container-low text-center">
              <button
                onClick={onFilterLowStock}
                className="font-shortcut-key text-shortcut-key text-secondary font-semibold hover:underline"
              >
                View Low Stock Inventory →
              </button>
            </div>
          </div>

          {/* 2. Top Moving Fast-Turnover Parts Today */}
          <div className="bg-surface-container-lowest p-gutter rounded shadow-xs flex flex-col">
            <div className="flex items-center justify-between mb-space-sm">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary text-[18px]">trending_up</span>
                <h2 className="font-headline-md text-headline-md text-on-surface">
                  Top Moving Spares Today
                </h2>
              </div>
              <span className="font-label-caps text-label-caps text-outline uppercase">
                Fast Movers
              </span>
            </div>
            <div className="space-y-space-sm">
              {invoices.length === 0 ? (
                <div className="p-6 text-center text-outline">
                  <span className="material-symbols-outlined text-3xl text-outline mb-1">shopping_cart</span>
                  <p className="text-xs font-semibold text-on-surface">No Sales Recorded Today</p>
                  <p className="text-[11px] text-outline mt-0.5">Top performing spare parts will rank here in real time.</p>
                </div>
              ) : (
                invoices.slice(0, 4).map((inv, idx) => (
                  <div key={inv.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-space-sm">
                      <div className="w-6 h-6 rounded bg-surface-container flex items-center justify-center font-numeric-data text-numeric-data font-bold text-on-surface">
                        {idx + 1}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-table-cell text-table-cell font-semibold text-on-surface">
                          {inv.customerName}
                        </span>
                        <span className="font-shortcut-key text-shortcut-key text-outline">
                          {(inv.lineItems?.length || (inv as any).items?.length || inv.itemsCount || 0)} items • {inv.id}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-numeric-data text-numeric-data font-bold text-secondary">
                        {(inv.lineItems?.length || (inv as any).items?.length || inv.itemsCount || 0)} units
                      </span>
                      <span className="block font-shortcut-key text-shortcut-key text-on-surface-variant">
                        ₹{(inv.totalAmount ?? (inv as any).total ?? 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 3. Cash & Bank Counter Reconciliation Widget */}
          <div className="bg-primary-container text-surface-bright p-gutter rounded shadow-xs flex flex-col space-y-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary-fixed text-[18px]">
                  account_balance
                </span>
                <span className="font-headline-md text-headline-md text-surface-bright font-semibold">
                  Tender Reconciliation
                </span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-surface-container-high/20 font-shortcut-key text-shortcut-key text-tertiary-fixed font-semibold">
                {(tenderData as any).shiftStatus || 'Shift Active'}
              </span>
            </div>
            <div className="space-y-space-xs divide-y divide-surface-container-high/10 font-body-sm text-body-sm">
              <div className="flex justify-between items-center pt-1">
                <span className="text-on-primary-container flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">point_of_sale</span> Cash in Register Drawer:
                </span>
                <span className="font-numeric-data text-numeric-data font-bold text-surface-bright">
                  ₹{(tenderData.cash ?? (tenderData as any).cashInDrawer ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-on-primary-container flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">qr_code_scanner</span> UPI / QR Digital Collections:
                </span>
                <span className="font-numeric-data text-numeric-data font-bold text-secondary-fixed">
                  ₹{(tenderData.upi ?? (tenderData as any).upiCollections ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-on-primary-container flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">credit_card</span> Card POS Swipe Terminal:
                </span>
                <span className="font-numeric-data text-numeric-data font-bold text-surface-bright">
                  ₹{(tenderData.card ?? (tenderData as any).cardPosTerminal ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-on-primary-container flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">swap_horiz</span> Direct Bank NEFT Inward:
                </span>
                <span className="font-numeric-data text-numeric-data font-bold text-surface-bright">
                  ₹{((tenderData as any).directNeftBank ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <div className="pt-space-xs mt-space-xs border-t border-surface-container-high/20 flex justify-between items-center">
              <span className="font-label-caps text-label-caps uppercase text-on-primary-container">
                Total Counter Realized:
              </span>
              <span className="font-numeric-lg text-numeric-lg text-tertiary-fixed font-bold">
                ₹{(tenderData.total ?? (tenderData as any).totalRealized ?? (
                  (tenderData.cash || 0) + (tenderData.upi || 0) + (tenderData.card || 0)
                )).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
