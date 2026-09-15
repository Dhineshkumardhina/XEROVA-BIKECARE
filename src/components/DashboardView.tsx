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
    setTimeout(() => setIsRefreshing(false), 500);
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
  const currentDateStr = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="flex flex-col w-full pb-10 space-y-5 animate-in fade-in duration-150">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Counter Dashboard
            </h1>
            <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-0.5 rounded-full">
              {currentDateStr}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Realtime overview of store sales, stock valuation, and counter operations
          </p>
        </div>

        {/* Header Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700">
            <span className="material-symbols-outlined text-slate-400 text-[16px] mr-1.5">calendar_today</span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer"
            >
              <option>Today vs Yesterday</option>
              <option>This Week vs Last Week</option>
              <option>This Month</option>
              <option>Custom Date Range</option>
            </select>
          </div>

          <button
            onClick={onOpenShiftSummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">point_of_sale</span>
            <span>Shift Summary</span>
          </button>

          <button
            onClick={handleExportMIS}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics: 6 Clean Modern Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Card 1: Today's Sales */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Today's Sales
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">receipt_long</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-slate-900 font-mono tracking-tight">
              ₹{totalSalesToday.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {invoices.length} bills issued
            </div>
          </div>
        </div>

        {/* Card 2: Today's Purchases */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Purchases (GRN)
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">local_shipping</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-slate-900 font-mono tracking-tight">
              ₹0.00
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              0 inwards received
            </div>
          </div>
        </div>

        {/* Card 3: Receivables */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Receivables
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-slate-900 font-mono tracking-tight">
              ₹0.00
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Customer balances
            </div>
          </div>
        </div>

        {/* Card 4: Payables */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Payables
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">pending_actions</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-slate-900 font-mono tracking-tight">
              ₹0.00
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Supplier due
            </div>
          </div>
        </div>

        {/* Card 5: Stock Valuation */}
        <div 
          onClick={() => onNavigate('items-master')}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-blue-400 transition-all cursor-pointer group"
          title="Click to view Item Master"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
              Stock Valuation
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">warehouse</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-slate-900 font-mono tracking-tight">
              ₹{stockValuation.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {parts.length} active SKUs
            </div>
          </div>
        </div>

        {/* Card 6: Low Stock Alerts */}
        <div 
          onClick={onFilterLowStock}
          className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-rose-400 transition-all cursor-pointer group"
          title="Click to filter low stock items"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">
              Stock Alerts
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">warning</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-rose-600 font-mono tracking-tight">
              {lowStockCount} Items
            </div>
            <div className="text-[11px] text-rose-500 mt-0.5 font-medium">
              {zeroStockCount} out of stock
            </div>
          </div>
        </div>
      </div>

      {/* Clean Quick Actions Strip */}
      <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between overflow-x-auto gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold uppercase tracking-wider flex-shrink-0">
          <span className="material-symbols-outlined text-[17px] text-blue-600">bolt</span>
          <span>Shortcuts:</span>
        </div>
        <div className="flex items-center gap-2 flex-nowrap">
          <button
            onClick={onOpenNewBill}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs flex-shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">shopping_cart_checkout</span>
            <span>New POS Bill</span>
            <kbd className="px-1 py-0.2 rounded bg-blue-800 text-blue-100 font-mono text-[10px] ml-1">
              F4
            </kbd>
          </button>

          <button
            onClick={onOpenPartFinder}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors flex-shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">two_wheeler</span>
            <span>Part Finder</span>
            <kbd className="px-1 py-0.2 rounded bg-slate-200 text-slate-600 font-mono text-[10px] ml-1">
              F2
            </kbd>
          </button>

          <button
            onClick={() => onNavigate('purchase-orders')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors flex-shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">input</span>
            <span>+ Purchase Inward</span>
          </button>

          <button
            onClick={() => onNavigate('payment-receipts')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors flex-shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">payments</span>
            <span>+ Receive Payment</span>
          </button>

          <button
            onClick={() => onNavigate('quotations')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors flex-shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">request_quote</span>
            <span>+ Quotation</span>
          </button>

          <button
            onClick={onOpenNewPart}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors flex-shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add_box</span>
            <span>+ Add Part SKU</span>
          </button>
        </div>
      </div>

      {/* Main Grid Layout (65% / 35% Split) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* LEFT SECTION (Width ~65% -> 8 columns) */}
        <div className="xl:col-span-8 flex flex-col space-y-5">
          {/* 1. Sales Hourly Velocity Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Counter Sales Hourly Velocity
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Billing frequency across store operating hours
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Retail Bills
                </div>
              </div>
            </div>

            {/* Inline SVG Chart */}
            <div className="w-full bg-slate-50 rounded-xl p-3 relative border border-slate-100">
              <svg className="w-full h-28 overflow-visible" preserveAspectRatio="none" viewBox="0 0 740 120">
                <line stroke="#e2e8f0" strokeDasharray="3 3" x1="0" x2="740" y1="20" y2="20" />
                <line stroke="#e2e8f0" strokeDasharray="3 3" x1="0" x2="740" y1="60" y2="60" />
                <line stroke="#e2e8f0" x1="0" x2="740" y1="100" y2="100" />

                <path
                  d="M0,100 L30,95 L70,88 L120,40 L170,22 L220,30 L270,68 L320,78 L370,72 L420,62 L480,25 L540,18 L600,28 L660,75 L740,92 L740,100 Z"
                  fill="#dbeafe"
                  opacity="0.5"
                />

                <path
                  d="M0,100 L30,95 L70,88 L120,40 L170,22 L220,30 L270,68 L320,78 L370,72 L420,62 L480,25 L540,18 L600,28 L660,75 L740,92"
                  fill="none"
                  stroke="#2563eb"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                />

                <circle
                  cx="170"
                  cy="22"
                  fill="#2563eb"
                  r="4.5"
                  className="cursor-pointer hover:scale-125 transition-transform"
                  onMouseEnter={() => setChartHoverPoint({ x: 170, y: 22, label: '11:00 AM', amount: '₹28,400 (21 bills)' })}
                  onMouseLeave={() => setChartHoverPoint(null)}
                />
                <circle
                  cx="540"
                  cy="18"
                  fill="#2563eb"
                  r="4.5"
                  className="cursor-pointer hover:scale-125 transition-transform"
                  onMouseEnter={() => setChartHoverPoint({ x: 540, y: 18, label: '06:30 PM Peak', amount: '₹36,200 (26 bills)' })}
                  onMouseLeave={() => setChartHoverPoint(null)}
                />

                <text fill="#2563eb" fontFamily="Inter, sans-serif" fontSize="10" fontWeight="600" textAnchor="middle" x="170" y="14">
                  ₹28.4k (11 AM)
                </text>
                <text fill="#2563eb" fontFamily="Inter, sans-serif" fontSize="10" fontWeight="600" textAnchor="middle" x="540" y="10">
                  ₹36.2k (6:30 PM Peak)
                </text>
              </svg>

              {chartHoverPoint && (
                <div
                  className="absolute bg-slate-900 text-white px-2.5 py-1 rounded-lg text-xs pointer-events-none shadow-lg"
                  style={{ left: `${(chartHoverPoint.x / 740) * 85}%`, top: '10px' }}
                >
                  <div className="font-semibold">{chartHoverPoint.label}</div>
                  <div className="font-mono text-[11px] text-blue-200">{chartHoverPoint.amount}</div>
                </div>
              )}

              <div className="flex justify-between text-[10px] text-slate-400 pt-2 px-1 font-medium">
                <span>09:00 AM</span>
                <span>11:00 AM (Peak)</span>
                <span>01:00 PM</span>
                <span>03:30 PM</span>
                <span>06:30 PM (Peak)</span>
                <span>08:30 PM</span>
                <span>Closing</span>
              </div>
            </div>
          </div>

          {/* 2. Recent Counter Invoices Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
            <div className="p-4 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[20px]">history_toggle_off</span>
                <h2 className="text-sm font-bold text-slate-900">
                  Recent Invoices
                </h2>
                <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md ml-1">
                  {invoices.length} Bills
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-xs">
                  <button
                    onClick={() => setInvoiceFilter('ALL')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      invoiceFilter === 'ALL' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setInvoiceFilter('PAID')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      invoiceFilter === 'PAID' ? 'bg-white text-emerald-600 font-semibold shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    Paid
                  </button>
                  <button
                    onClick={() => setInvoiceFilter('CREDIT')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      invoiceFilter === 'CREDIT' ? 'bg-white text-amber-600 font-semibold shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    Credit
                  </button>
                </div>
                <button
                  onClick={handleRefresh}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
                  title="Refresh table"
                >
                  <span className={`material-symbols-outlined text-[18px] ${isRefreshing ? 'animate-spin' : ''}`}>
                    refresh
                  </span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider select-none">
                    <th className="py-2.5 px-3.5">Invoice #</th>
                    <th className="py-2.5 px-3.5">Customer &amp; Vehicle</th>
                    <th className="py-2.5 px-3.5">Items</th>
                    <th className="py-2.5 px-3.5 text-right">Amount</th>
                    <th className="py-2.5 px-3.5">Mode</th>
                    <th className="py-2.5 px-3.5 text-center">Status</th>
                    <th className="py-2.5 px-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                        No invoices recorded yet. Start billing with F4 or "New POS Bill".
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.slice(0, 6).map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="py-2.5 px-3.5 font-mono font-semibold text-blue-600">
                          {inv.id}
                        </td>
                        <td className="py-2.5 px-3.5">
                          <div className="font-semibold text-slate-800 leading-tight">
                            {inv.customerName}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {inv.vehicleNo || 'Retail'} • {inv.bikeModel || 'Counter'}
                          </div>
                        </td>
                        <td className="py-2.5 px-3.5 text-slate-600">
                          <span className="font-medium text-slate-800">{inv.itemsCount || inv.items?.length || 0} items</span>
                          <span className="text-[11px] text-slate-400 block truncate max-w-[160px]">
                            {inv.itemsSummary}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 font-mono font-bold text-right text-slate-900">
                          ₹{(inv.totalAmount || inv.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                            {inv.payMode}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            inv.status === 'PAID'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => onPrintInvoice(inv)}
                              className="p-1 rounded-md hover:bg-slate-100 text-slate-500 hover:text-blue-600 cursor-pointer"
                              title="Print GST Bill"
                            >
                              <span className="material-symbols-outlined text-[16px]">print</span>
                            </button>
                            <button
                              onClick={() => onViewInvoice(inv)}
                              className="p-1 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
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

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing {Math.min(filteredInvoices.length, 6)} of {invoices.length} bills today
              </span>
              <button
                onClick={() => onNavigate('invoices')}
                className="text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Complete Sales Register</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION (Width ~35% -> 4 columns) */}
        <div className="xl:col-span-4 flex flex-col space-y-5">
          {/* 1. Critical Low Stock Alerts */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
            <div className="p-4 bg-rose-50/60 flex items-center justify-between border-b border-rose-100/60">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-600 text-[18px]">warning</span>
                <h2 className="text-sm font-bold text-rose-950">
                  Low Stock Alerts
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                {parts.filter((p) => (p.currentStock ?? p.stockQty ?? 0) === 0).length} Zero Stock
              </span>
            </div>

            <div className="divide-y divide-slate-100 overflow-y-auto max-h-[300px]">
              {parts.filter((p) => (p.currentStock ?? p.stockQty ?? 0) <= (p.minReorder ?? p.minStock ?? 0)).length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  <span className="material-symbols-outlined text-2xl text-emerald-500 mb-1">check_circle</span>
                  <p className="text-xs font-semibold text-slate-800">All Stock Levels Healthy</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">No parts below reorder thresholds.</p>
                </div>
              ) : (
                parts
                  .filter((p) => (p.currentStock ?? p.stockQty ?? 0) <= (p.minReorder ?? p.minStock ?? 0))
                  .slice(0, 5)
                  .map((p) => {
                    const cur = p.currentStock ?? p.stockQty ?? 0;
                    const min = p.minReorder ?? p.minStock ?? 0;
                    return (
                      <div
                        key={p.id}
                        className="p-3 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="font-semibold text-slate-800 truncate">
                            {p.name}
                          </span>
                          <span className="text-[11px] text-slate-400 truncate">
                            {p.brand} • {p.sku || p.partNumber}
                          </span>
                          <div className="flex items-center gap-3 mt-0.5 text-[11px]">
                            <span className={cur === 0 ? 'text-rose-600 font-bold' : 'text-slate-700 font-semibold'}>
                              Stock: {cur}
                            </span>
                            <span className="text-slate-400">Min: {min}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => onOrderPo(p.name)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-medium rounded-lg flex items-center gap-1 transition-colors flex-shrink-0 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">add_shopping_cart</span>
                          <span>PO</span>
                        </button>
                      </div>
                    );
                  })
              )}
            </div>

            <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
              <button
                onClick={onFilterLowStock}
                className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
              >
                View All Low Stock Spares →
              </button>
            </div>
          </div>

          {/* 2. Top Moving Fast-Turnover Parts */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[18px]">trending_up</span>
                <h2 className="text-sm font-bold text-slate-900">
                  Top Moving Spares
                </h2>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Today
              </span>
            </div>
            <div className="space-y-2.5 text-xs">
              {invoices.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  <span className="material-symbols-outlined text-2xl text-slate-300 mb-1">shopping_cart</span>
                  <p className="text-xs font-medium text-slate-700">No Sales Recorded Today</p>
                </div>
              ) : (
                invoices.slice(0, 4).map((inv, idx) => (
                  <div key={inv.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center font-mono text-[11px] font-bold text-slate-600 flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-slate-800 truncate">
                          {inv.customerName}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate">
                          {(inv.lineItems?.length || (inv as any).items?.length || inv.itemsCount || 0)} items • {inv.id}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <span className="font-bold text-slate-900 font-mono">
                        ₹{(inv.totalAmount ?? (inv as any).total ?? 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 3. Tender Cash & Register Reconciliation */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xs flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400 text-[18px]">
                  account_balance
                </span>
                <span className="text-sm font-bold text-white">
                  Tender Summary
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 text-[10px] font-semibold">
                Shift Active
              </span>
            </div>
            <div className="space-y-2 text-xs divide-y divide-slate-800">
              <div className="flex justify-between items-center pt-1.5">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">point_of_sale</span> Cash in Drawer:
                </span>
                <span className="font-mono font-bold text-white">
                  ₹{(tenderData.cash ?? (tenderData as any).cashInDrawer ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1.5">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">qr_code_scanner</span> UPI / QR Collections:
                </span>
                <span className="font-mono font-bold text-blue-300">
                  ₹{(tenderData.upi ?? (tenderData as any).upiCollections ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1.5">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">credit_card</span> Card POS Terminal:
                </span>
                <span className="font-mono font-bold text-white">
                  ₹{(tenderData.card ?? (tenderData as any).cardPosTerminal ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
              <span className="text-xs uppercase text-slate-400 font-semibold tracking-wider">
                Total Realized:
              </span>
              <span className="text-lg font-bold text-emerald-400 font-mono">
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

