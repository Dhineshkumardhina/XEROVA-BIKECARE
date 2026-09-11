import React, { useState, useMemo } from 'react';
import { SalesReportRow, UserRole, ReportDetailData } from '../../types';
import { INITIAL_SALES_REPORTS, SALES_DASHBOARD_CARDS, SAMPLE_REPORT_DRAWER_DATA } from '../../data/gstAndReportsData';
import { CommonReportTable, ColumnDef, PresetFilter } from './CommonReportTable';
import { formatINR } from '../../utils/formatters';

interface SalesReportsViewProps {
  userRole: UserRole;
  onNavigate: (screenId: string) => void;
  onOpenDrawer: (data: ReportDetailData) => void;
}

type SalesSubReport =
  | 'all'
  | 'customer'
  | 'item'
  | 'brand'
  | 'category'
  | 'salesperson'
  | 'paymode'
  | 'gst'
  | 'returns';

export const SalesReportsView: React.FC<SalesReportsViewProps> = ({
  userRole,
  onNavigate,
  onOpenDrawer
}) => {
  const [subReport, setSubReport] = useState<SalesSubReport>('all');
  const [activePreset, setActivePreset] = useState('all_records');
  const [dateFilter, setDateFilter] = useState('October 2024');

  const subReportTabs: { id: SalesSubReport; label: string; icon: string }[] = [
    { id: 'all', label: 'All Sales Register', icon: 'view_list' },
    { id: 'customer', label: 'Customer-wise', icon: 'person' },
    { id: 'item', label: 'Item-wise', icon: 'inventory_2' },
    { id: 'brand', label: 'Brand-wise', icon: 'branding_watermark' },
    { id: 'category', label: 'Category-wise', icon: 'category' },
    { id: 'salesperson', label: 'Salesperson-wise', icon: 'badge' },
    { id: 'paymode', label: 'Payment Mode-wise', icon: 'payments' },
    { id: 'gst', label: 'GST Sales', icon: 'percent' },
    { id: 'returns', label: 'Sales Returns', icon: 'keyboard_return' }
  ];

  const presets: PresetFilter[] = [
    { id: 'all_records', label: 'All Records', description: 'Show all sales transactions' },
    { id: 'today', label: 'Today (24 Oct)', description: 'Transactions booked today' },
    { id: 'credit_unpaid', label: 'Credit Ledger Outstandings', description: 'B2B Garage credit sales not yet collected' },
    { id: 'high_value', label: 'High Value (> ₹5,000)', description: 'Wholesale & bulk garage invoices' },
    { id: 'upi_cash', label: 'Cash / UPI Tendered', description: 'Immediate counter settlements' }
  ];

  // Filtering data based on sub-report tab and preset
  const filteredData = useMemo(() => {
    let result = [...INITIAL_SALES_REPORTS];

    if (subReport === 'returns') {
      result = result.filter(r => r.returnAmount > 0 || r.status === 'RETURNED');
    } else if (subReport === 'gst') {
      result = result.filter(r => r.totalGst > 0);
    }

    if (activePreset === 'today') {
      result = result.filter(r => r.date === '24-10-2024');
    } else if (activePreset === 'credit_unpaid') {
      result = result.filter(r => r.status === 'CREDIT' || (r.creditOutstanding && r.creditOutstanding > 0));
    } else if (activePreset === 'high_value') {
      result = result.filter(r => r.totalAmount >= 5000);
    } else if (activePreset === 'upi_cash') {
      result = result.filter(r => r.payMode === 'Cash' || r.payMode === 'UPI');
    }

    return result;
  }, [subReport, activePreset]);

  // Columns definition
  const columns: ColumnDef<SalesReportRow>[] = [
    {
      id: 'invoiceNo',
      header: 'Invoice #',
      accessor: r => r.invoiceNo,
      cell: r => (
        <span className="font-mono font-bold text-secondary">{r.invoiceNo}</span>
      )
    },
    {
      id: 'date',
      header: 'Date',
      accessor: r => r.date
    },
    {
      id: 'customer',
      header: 'Customer / Buyer',
      accessor: r => r.customer,
      cell: r => (
        <div>
          <div className="font-bold text-on-surface">{r.customer}</div>
          <span className="text-[10px] text-outline">{r.customerType}</span>
        </div>
      )
    },
    {
      id: 'itemSummary',
      header: 'Spares Description',
      accessor: r => r.itemSummary,
      cell: r => (
        <div>
          <div className="text-on-surface">{r.itemSummary}</div>
          <div className="text-[10px] text-outline font-mono">
            {r.brand} • {r.category}
          </div>
        </div>
      )
    },
    {
      id: 'qty',
      header: 'Qty',
      accessor: r => r.qty,
      align: 'right',
      cell: r => <span className="font-mono">{r.qty}</span>,
      totalable: true
    },
    {
      id: 'grossSales',
      header: 'Gross Sales',
      accessor: r => r.grossSales,
      align: 'right',
      formatAsINR: true,
      totalable: true
    },
    {
      id: 'discount',
      header: 'Discount',
      accessor: r => r.discount,
      align: 'right',
      formatAsINR: true,
      totalable: true
    },
    {
      id: 'netSales',
      header: 'Taxable Sales',
      accessor: r => r.netSales,
      align: 'right',
      formatAsINR: true,
      totalable: true
    },
    {
      id: 'totalGst',
      header: 'GST (18%/28%)',
      accessor: r => r.totalGst,
      align: 'right',
      formatAsINR: true,
      totalable: true
    },
    {
      id: 'totalAmount',
      header: 'Total Value',
      accessor: r => r.totalAmount,
      align: 'right',
      formatAsINR: true,
      totalable: true,
      cell: r => (
        <span className="font-mono font-bold text-on-surface">
          {formatINR(r.totalAmount)}
        </span>
      )
    },
    {
      id: 'payMode',
      header: 'Pay Mode',
      accessor: r => r.payMode,
      align: 'center',
      cell: r => (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-container text-on-surface">
          {r.payMode}
        </span>
      )
    },
    {
      id: 'salesperson',
      header: 'Executive',
      accessor: r => r.salesperson,
      cell: r => <span className="text-outline text-[11px]">{r.salesperson}</span>
    },
    {
      id: 'status',
      header: 'Status',
      accessor: r => r.status,
      align: 'center',
      cell: r => (
        <span
          className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
            r.status === 'PAID'
              ? 'bg-tertiary-fixed text-on-tertiary-fixed'
              : r.status === 'CREDIT'
              ? 'bg-secondary/15 text-secondary'
              : 'bg-error-container text-on-error-container'
          }`}
        >
          {r.status}
        </span>
      )
    }
  ];

  return (
    <div className="flex flex-col w-full pb-12 space-y-gutter animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface-container-lowest p-gutter rounded shadow-xs border border-surface-container-high gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-2xl">point_of_sale</span>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Comprehensive Sales Reports</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-secondary/15 text-secondary border border-secondary/20">
              Sales Register &amp; Analytics
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Detailed breakdown of counter retail, garage wholesale, brand performance, and GST collections
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('accounts-dashboard')}
            className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded font-semibold text-xs flex items-center gap-1.5 border border-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">account_balance</span>
            <span>Accounts Overview</span>
          </button>
          <button
            onClick={() => onNavigate('gst-dashboard')}
            className="px-3 py-1.5 bg-secondary text-on-secondary hover:bg-secondary-container rounded font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">verified</span>
            <span>GST Portal</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-space-sm text-xs">
        <div className="p-3 bg-surface-container-lowest rounded border border-surface-container-high">
          <span className="text-[10px] text-outline font-bold uppercase block">Gross Sales</span>
          <span className="font-mono text-base font-bold text-on-surface mt-1 block">
            {formatINR(SALES_DASHBOARD_CARDS.grossSales)}
          </span>
          <span className="text-[10px] text-outline">Before deductions</span>
        </div>

        <div className="p-3 bg-surface-container-lowest rounded border border-surface-container-high">
          <span className="text-[10px] text-outline font-bold uppercase block">Discounts Given</span>
          <span className="font-mono text-base font-bold text-outline mt-1 block">
            {formatINR(SALES_DASHBOARD_CARDS.discounts)}
          </span>
          <span className="text-[10px] text-outline">1.65% average rate</span>
        </div>

        <div className="p-3 bg-surface-container-lowest rounded border border-surface-container-high">
          <span className="text-[10px] text-error font-bold uppercase block">Sales Returns</span>
          <span className="font-mono text-base font-bold text-error mt-1 block">
            {formatINR(SALES_DASHBOARD_CARDS.returns)}
          </span>
          <span className="text-[10px] text-outline">Mismatch &amp; warranty</span>
        </div>

        <div className="p-3 bg-surface-container-lowest rounded border border-surface-container-high">
          <span className="text-[10px] text-secondary font-bold uppercase block">Net Taxable Sales</span>
          <span className="font-mono text-base font-bold text-secondary mt-1 block">
            {formatINR(SALES_DASHBOARD_CARDS.netSales)}
          </span>
          <span className="text-[10px] text-secondary font-semibold">Excluding GST</span>
        </div>

        <div className="p-3 bg-surface-container-lowest rounded border border-surface-container-high">
          <span className="text-[10px] text-primary font-bold uppercase block">GST Collected</span>
          <span className="font-mono text-base font-bold text-primary mt-1 block">
            {formatINR(SALES_DASHBOARD_CARDS.gst)}
          </span>
          <span className="text-[10px] text-outline">CGST + SGST (18%/28%)</span>
        </div>

        <div className="p-3 bg-surface-container-lowest rounded border border-surface-container-high">
          <span className="text-[10px] text-tertiary font-bold uppercase block">Total Collections</span>
          <span className="font-mono text-base font-bold text-on-tertiary-container mt-1 block">
            {formatINR(SALES_DASHBOARD_CARDS.collection)}
          </span>
          <span className="text-[10px] text-outline">Cash &amp; Bank UPI</span>
        </div>

        <div className="p-3 bg-surface-container-lowest rounded border border-surface-container-high">
          <span className="text-[10px] text-outline font-bold uppercase block">Credit Sales</span>
          <span className="font-mono text-base font-bold text-on-surface mt-1 block">
            {formatINR(SALES_DASHBOARD_CARDS.creditSales)}
          </span>
          <span className="text-[10px] text-outline">15-Day Garage terms</span>
        </div>
      </div>

      {/* Sub-report Tabs Bar */}
      <div className="bg-surface-container-lowest border border-surface-container-high rounded p-1 flex flex-wrap gap-1">
        {subReportTabs.map(tab => {
          const isActive = subReport === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubReport(tab.id)}
              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isActive
                  ? 'bg-secondary text-on-secondary shadow-xs font-bold'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Report Table */}
      <CommonReportTable<SalesReportRow>
        title={`Sales Register: ${subReportTabs.find(t => t.id === subReport)?.label} (${filteredData.length} Bills)`}
        subtitle={`Period: ${dateFilter} | Mode: Enterprise Dense View | Formatted in INR`}
        columns={columns}
        data={filteredData}
        filterPresets={presets}
        activePreset={activePreset}
        onSelectPreset={p => setActivePreset(p)}
        searchPlaceholder="Search invoice #, customer, item, brand, executive..."
        onRowClick={r => {
          const drawer = SAMPLE_REPORT_DRAWER_DATA[r.invoiceNo] || {
            id: r.id,
            type: 'Sale',
            title: `Sales Invoice ${r.invoiceNo}`,
            referenceNo: r.invoiceNo,
            date: `${r.date}, 11:30 AM`,
            partyName: r.customer,
            partyPhone: '+91 98401 00000',
            paymentMode: r.payMode,
            status: r.status,
            taxableAmount: r.netSales,
            cgst: r.cgst,
            sgst: r.sgst,
            igst: r.igst,
            totalAmount: r.totalAmount,
            user: r.salesperson,
            timestamp: `2024-10-24 11:30:00 IST`,
            items: [
              { name: r.itemSummary, sku: 'SKU-GEN', hsn: '8714', qty: r.qty, unitPrice: r.netSales / (r.qty || 1), gstRate: 18, total: r.totalAmount }
            ],
            auditHistory: [
              { timestamp: r.date, action: 'Invoice generated and finalized at POS Counter', user: r.salesperson }
            ],
            notes: `Customer type: ${r.customerType}`
          };
          onOpenDrawer(drawer);
        }}
        exportFileName={`Sales-Report-${subReport}-${dateFilter.replace(/\s+/g, '-')}`}
      />
    </div>
  );
};
