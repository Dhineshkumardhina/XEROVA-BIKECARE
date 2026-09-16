import React, { useState, useMemo } from 'react';
import { PurchaseReportRow, UserRole, ReportDetailData } from '../../types';
import { INITIAL_PURCHASE_REPORTS, PURCHASE_KPIS } from '../../data/gstAndReportsData';
import { CommonReportTable, ColumnDef, PresetFilter } from './CommonReportTable';
import { formatINR } from '../../utils/formatters';

interface PurchaseReportsViewProps {
  userRole: UserRole;
  onNavigate: (screenId: string) => void;
  onOpenDrawer: (data: ReportDetailData) => void;
}

type PurchaseSubReport =
  | 'all'
  | 'supplier'
  | 'item'
  | 'brand'
  | 'category'
  | 'returns'
  | 'gst'
  | 'payments';

export const PurchaseReportsView: React.FC<PurchaseReportsViewProps> = ({
  userRole,
  onNavigate,
  onOpenDrawer
}) => {
  const [subReport, setSubReport] = useState<PurchaseSubReport>('all');
  const [activePreset, setActivePreset] = useState('all_records');
  const [dateFilter, setDateFilter] = useState('October 2024');

  const subReportTabs: { id: PurchaseSubReport; label: string; icon: string }[] = [
    { id: 'all', label: 'All Purchase GRN', icon: 'local_shipping' },
    { id: 'supplier', label: 'Supplier-wise', icon: 'storefront' },
    { id: 'item', label: 'Item-wise', icon: 'inventory_2' },
    { id: 'brand', label: 'Brand-wise', icon: 'branding_watermark' },
    { id: 'category', label: 'Category-wise', icon: 'category' },
    { id: 'returns', label: 'Purchase Returns (RTV)', icon: 'assignment_return' },
    { id: 'gst', label: 'GST ITC Purchase', icon: 'percent' },
    { id: 'payments', label: 'Payment Status', icon: 'payments' }
  ];

  const presets: PresetFilter[] = [
    { id: 'all_records', label: 'All Invoices', description: 'Show all purchase bills' },
    { id: 'pending_pay', label: 'Outstanding Balance', description: 'Suppliers with pending dues' },
    { id: 'major_oem', label: 'Bajaj & TVS OEM', description: 'Direct manufacturer consignments' },
    { id: 'neft_rtgs', label: 'NEFT / RTGS Paid', description: 'Bank cleared purchases' }
  ];

  // Filtering
  const filteredData = useMemo(() => {
    let result = [...INITIAL_PURCHASE_REPORTS];

    if (subReport === 'returns') {
      result = result.filter(r => r.poNo.includes('RTV') || r.itemSummary.toLowerCase().includes('return'));
    } else if (subReport === 'payments') {
      result = result.filter(r => r.outstanding > 0 || r.status === 'PENDING');
    }

    if (activePreset === 'pending_pay') {
      result = result.filter(r => r.outstanding > 0);
    } else if (activePreset === 'major_oem') {
      result = result.filter(r => r.brand.includes('Bajaj') || r.brand.includes('TVS'));
    } else if (activePreset === 'neft_rtgs') {
      result = result.filter(r => r.payMode.includes('NEFT') || r.payMode.includes('RTGS'));
    }

    return result;
  }, [subReport, activePreset]);

  // Columns definition
  const columns: ColumnDef<PurchaseReportRow>[] = [
    {
      id: 'poNo',
      header: 'PO / GRN #',
      accessor: r => r.poNo,
      cell: r => (
        <div>
          <span className="font-mono font-bold text-secondary">{r.poNo}</span>
          <div className="text-[10px] text-outline font-mono">Inv: {r.supplierInvoiceNo}</div>
        </div>
      )
    },
    {
      id: 'date',
      header: 'Date',
      accessor: r => r.date
    },
    {
      id: 'supplier',
      header: 'Supplier / Distributor',
      accessor: r => r.supplier,
      cell: r => (
        <div>
          <div className="font-bold text-on-surface">{r.supplier}</div>
          <span className="text-[10px] text-outline font-mono">{r.supplierGstin}</span>
        </div>
      )
    },
    {
      id: 'itemSummary',
      header: 'Spares / Consignment Summary',
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
      cell: r => <span className="font-mono font-semibold">{r.qty}</span>,
      totalable: true
    },
    {
      id: 'taxableValue',
      header: 'Taxable Inward',
      accessor: r => r.taxableValue,
      align: 'right',
      formatAsINR: true,
      totalable: true
    },
    {
      id: 'tax',
      header: 'ITC GST',
      accessor: r => r.tax,
      align: 'right',
      formatAsINR: true,
      totalable: true
    },
    {
      id: 'netPurchase',
      header: 'Invoice Total',
      accessor: r => r.netPurchase,
      align: 'right',
      formatAsINR: true,
      totalable: true,
      cell: r => (
        <span className="font-mono font-bold text-on-surface">
          {formatINR(r.netPurchase)}
        </span>
      )
    },
    {
      id: 'paid',
      header: 'Paid Amount',
      accessor: r => r.paid,
      align: 'right',
      formatAsINR: true,
      totalable: true
    },
    {
      id: 'outstanding',
      header: 'Balance Due',
      accessor: r => r.outstanding,
      align: 'right',
      formatAsINR: true,
      totalable: true,
      cell: r => (
        <span className={`font-mono font-bold ${r.outstanding > 0 ? 'text-error' : 'text-outline'}`}>
          {formatINR(r.outstanding)}
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
      id: 'status',
      header: 'Status',
      accessor: r => r.status,
      align: 'center',
      cell: r => (
        <span
          className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
            r.status === 'PAID'
              ? 'bg-tertiary-fixed text-on-tertiary-fixed'
              : 'bg-warning-container text-on-warning-container'
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
            <span className="material-symbols-outlined text-secondary text-2xl">shopping_cart</span>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Purchase &amp; Inward Stock Reports</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-secondary/15 text-secondary border border-secondary/20">
              Procurement Register
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Manufacturer consignments, GST Input Tax Credits, payment settlements and vendor outstandings
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('supplier-ledgers')}
            className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded font-semibold text-xs flex items-center gap-1.5 border border-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">menu_book</span>
            <span>Supplier Ledgers</span>
          </button>
          <button
            onClick={() => onNavigate('inventory-reports')}
            className="px-3 py-1.5 bg-secondary text-on-secondary hover:bg-secondary-container rounded font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">inventory_2</span>
            <span>Stock Valuation</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-space-sm text-xs">
        <div className="p-3 bg-surface-container-lowest rounded border border-surface-container-high">
          <span className="text-[10px] text-outline font-bold uppercase block">Total Purchases</span>
          <span className="font-mono text-base font-bold text-on-surface mt-1 block">
            {formatINR(PURCHASE_KPIS.totalPurchase)}
          </span>
          <span className="text-[10px] text-outline">Gross Inward Bills</span>
        </div>

        <div className="p-3 bg-surface-container-lowest rounded border border-surface-container-high">
          <span className="text-[10px] text-error font-bold uppercase block">Purchase Returns</span>
          <span className="font-mono text-base font-bold text-error mt-1 block">
            {formatINR(PURCHASE_KPIS.purchaseReturns)}
          </span>
          <span className="text-[10px] text-outline">Defects returned to OEM</span>
        </div>

        <div className="p-3 bg-surface-container-lowest rounded border border-surface-container-high">
          <span className="text-[10px] text-tertiary font-bold uppercase block">ITC Claimable</span>
          <span className="font-mono text-base font-bold text-on-tertiary-container mt-1 block">
            {formatINR(PURCHASE_KPIS.tax)}
          </span>
          <span className="text-[10px] text-outline">Matched with GSTR-2B</span>
        </div>

        <div className="p-3 bg-surface-container-lowest rounded border border-surface-container-high">
          <span className="text-[10px] text-secondary font-bold uppercase block">Net Purchases</span>
          <span className="font-mono text-base font-bold text-secondary mt-1 block">
            {formatINR(PURCHASE_KPIS.netPurchase)}
          </span>
          <span className="text-[10px] text-secondary font-semibold">Excluding tax</span>
        </div>

        <div className="p-3 bg-surface-container-lowest rounded border border-surface-container-high">
          <span className="text-[10px] text-outline font-bold uppercase block">Amount Paid</span>
          <span className="font-mono text-base font-bold text-on-surface mt-1 block">
            {formatINR(PURCHASE_KPIS.paid)}
          </span>
          <span className="text-[10px] text-outline">Bank RTGS / Cheque</span>
        </div>

        <div className="p-3 bg-surface-container-lowest rounded border border-surface-container-high">
          <span className="text-[10px] text-warning font-bold uppercase block">Outstanding Dues</span>
          <span className="font-mono text-base font-bold text-warning mt-1 block">
            {formatINR(PURCHASE_KPIS.outstanding)}
          </span>
          <span className="text-[10px] text-outline">Due within 30 days</span>
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
      <CommonReportTable<PurchaseReportRow>
        title={`Purchase Register: ${subReportTabs.find(t => t.id === subReport)?.label} (${filteredData.length} Records)`}
        subtitle={`Period: ${dateFilter} | Direct OEM Procurement &amp; Regional Hub Inward`}
        columns={columns}
        data={filteredData}
        filterPresets={presets}
        activePreset={activePreset}
        onSelectPreset={p => setActivePreset(p)}
        searchPlaceholder="Search PO #, supplier invoice #, supplier name, brand..."
        onRowClick={r => {
          onOpenDrawer({
            id: r.id,
            type: 'Purchase',
            title: `Purchase Inward Bill: ${r.poNo}`,
            referenceNo: r.poNo,
            date: `${r.date}, 04:15 PM`,
            partyName: r.supplier,
            partyGstin: r.supplierGstin,
            paymentMode: r.payMode,
            status: r.status,
            taxableAmount: r.taxableValue,
            cgst: r.tax / 2,
            sgst: r.tax / 2,
            igst: 0,
            totalAmount: r.netPurchase,
            user: 'Current User',
            timestamp: `2024-10-23 16:15:00 IST`,
            items: [
              { name: r.itemSummary, sku: 'SKU-INW', hsn: '8714', qty: r.qty, unitPrice: r.taxableValue / r.qty, gstRate: 18, total: r.netPurchase }
            ],
            auditHistory: [
              { timestamp: r.date, action: 'Goods received in Bay 1 and quantity counted', user: 'Current User' },
              { timestamp: r.date, action: `Recorded against Supplier Invoice ${r.supplierInvoiceNo}`, user: 'Current User' }
            ],
            notes: `Supplier Invoice: ${r.supplierInvoiceNo}. Remaining outstanding: ${formatINR(r.outstanding)}.`
          });
        }}
        exportFileName={`Purchase-Report-${subReport}-${dateFilter.replace(/\s+/g, '-')}`}
      />
    </div>
  );
};
