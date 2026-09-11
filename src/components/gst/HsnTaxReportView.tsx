import React, { useState, useMemo } from 'react';
import { HsnTaxRecord, UserRole, ReportDetailData } from '../../types';
import { INITIAL_HSN_RECORDS } from '../../data/gstAndReportsData';
import { CommonReportTable, ColumnDef } from '../reports/CommonReportTable';
import { formatINR, formatQty } from '../../utils/formatters';

interface HsnTaxReportViewProps {
  userRole: UserRole;
  onNavigate: (screenId: string) => void;
  onOpenDrawer: (data: ReportDetailData) => void;
}

export const HsnTaxReportView: React.FC<HsnTaxReportViewProps> = ({
  userRole,
  onNavigate,
  onOpenDrawer
}) => {
  const [records] = useState<HsnTaxRecord[]>(INITIAL_HSN_RECORDS);
  const [selectedRate, setSelectedRate] = useState<string>('ALL');
  const [period] = useState('October 2024');

  // Rate Wise breakdown summary
  const rateSummary = useMemo(() => {
    const summary: Record<number, { count: number; taxable: number; tax: number }> = {
      18: { count: 0, taxable: 0, tax: 0 },
      28: { count: 0, taxable: 0, tax: 0 }
    };
    records.forEach(r => {
      if (!summary[r.gstRate]) {
        summary[r.gstRate] = { count: 0, taxable: 0, tax: 0 };
      }
      summary[r.gstRate].count += 1;
      summary[r.gstRate].taxable += r.taxableValue;
      summary[r.gstRate].tax += r.totalTax;
    });
    return summary;
  }, [records]);

  // Filter records
  const filteredRecords = useMemo(() => {
    if (selectedRate === 'ALL') return records;
    const rateNum = Number(selectedRate);
    return records.filter(r => r.gstRate === rateNum);
  }, [records, selectedRate]);

  // Columns definition
  const columns: ColumnDef<HsnTaxRecord>[] = [
    {
      id: 'hsn',
      header: 'HSN Code',
      accessor: r => r.hsn,
      cell: r => <span className="font-mono font-bold text-secondary">{r.hsn}</span>
    },
    {
      id: 'itemName',
      header: 'HSN Classification & Spares Group',
      accessor: r => r.itemName,
      cell: r => (
        <div>
          <div className="font-bold text-on-surface">{r.itemName}</div>
          <div className="text-[10px] text-outline">{r.description}</div>
        </div>
      )
    },
    {
      id: 'uqc',
      header: 'UQC',
      accessor: r => r.uqc,
      align: 'center',
      cell: r => <span className="font-mono text-outline text-[11px] uppercase">{r.uqc}</span>
    },
    {
      id: 'quantity',
      header: 'Quantity Sold',
      accessor: r => r.quantity,
      align: 'right',
      cell: r => <span className="font-mono font-semibold">{formatQty(r.quantity, r.uqc)}</span>,
      totalable: true
    },
    {
      id: 'taxableValue',
      header: 'Taxable Turnover',
      accessor: r => r.taxableValue,
      align: 'right',
      formatAsINR: true,
      totalable: true
    },
    {
      id: 'gstRate',
      header: 'GST Rate',
      accessor: r => r.gstRate,
      align: 'center',
      cell: r => (
        <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-surface-container text-on-surface">
          {r.gstRate}%
        </span>
      )
    },
    {
      id: 'cgst',
      header: 'CGST (Central)',
      accessor: r => r.cgst,
      align: 'right',
      formatAsINR: true,
      totalable: true
    },
    {
      id: 'sgst',
      header: 'SGST (State)',
      accessor: r => r.sgst,
      align: 'right',
      formatAsINR: true,
      totalable: true
    },
    {
      id: 'igst',
      header: 'IGST (Interstate)',
      accessor: r => r.igst,
      align: 'right',
      formatAsINR: true,
      totalable: true
    },
    {
      id: 'totalTax',
      header: 'Total Tax Amount',
      accessor: r => r.totalTax,
      align: 'right',
      formatAsINR: true,
      totalable: true,
      cell: r => <span className="font-mono font-bold text-secondary">{formatINR(r.totalTax)}</span>
    }
  ];

  return (
    <div className="flex flex-col w-full pb-12 space-y-gutter animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface-container-lowest p-gutter rounded shadow-xs border border-surface-container-high gap-3">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('gst-dashboard')}
              className="p-1 rounded hover:bg-surface-container text-on-surface-variant transition-colors"
              title="Back to GST Dashboard"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">HSN &amp; Tax Summary Report</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-secondary/15 text-secondary border border-secondary/20">
              Table 12 Compliance
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Harmonized System of Nomenclature (HSN) classification of motorcycle components, lubricants &amp; electricals
          </p>
        </div>

        {/* Global Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('gstr-1')}
            className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded font-semibold text-xs flex items-center gap-1.5 border border-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">assignment</span>
            <span>View GSTR-1 Outward</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-secondary text-on-secondary hover:bg-secondary-container rounded font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Print HSN Statement</span>
          </button>
        </div>
      </div>

      {/* Tax Rate Wise Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-sm text-xs">
        <div className="p-3.5 bg-surface-container-lowest rounded border border-surface-container-high flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">18% Standard Spares</span>
            <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-secondary/15 text-secondary">
              18% GST
            </span>
          </div>
          <div className="my-2">
            <div className="font-mono text-base font-bold text-on-surface">
              {formatINR(rateSummary[18]?.taxable || 0)}
            </div>
            <span className="text-[10px] text-outline">Clutch, Chains, Gaskets &amp; Engine Oils</span>
          </div>
          <div className="text-[11px] font-mono text-secondary font-bold">
            Tax: {formatINR(rateSummary[18]?.tax || 0)}
          </div>
        </div>

        <div className="p-3.5 bg-surface-container-lowest rounded border border-surface-container-high flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">28% High Slab</span>
            <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-primary/15 text-primary">
              28% GST
            </span>
          </div>
          <div className="my-2">
            <div className="font-mono text-base font-bold text-on-surface">
              {formatINR(rateSummary[28]?.taxable || 0)}
            </div>
            <span className="text-[10px] text-outline">Batteries, Spark Plugs &amp; Cylinders</span>
          </div>
          <div className="text-[11px] font-mono text-primary font-bold">
            Tax: {formatINR(rateSummary[28]?.tax || 0)}
          </div>
        </div>

        <div className="p-3.5 bg-surface-container-lowest rounded border border-surface-container-high flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">0% / Nil / Exempt</span>
            <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-surface-container text-outline">
              0% GST
            </span>
          </div>
          <div className="my-2">
            <div className="font-mono text-base font-bold text-on-surface">{formatINR(18500.0)}</div>
            <span className="text-[10px] text-outline">Technical manuals &amp; battery scrap</span>
          </div>
          <div className="text-[11px] font-mono text-outline font-bold">Tax: ₹0.00</div>
        </div>

        <div className="p-3.5 bg-secondary/5 rounded border border-secondary/20 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Total HSN Outward Tax</span>
            <span className="material-symbols-outlined text-[18px] text-secondary">fact_check</span>
          </div>
          <div className="my-2">
            <div className="font-mono text-base font-bold text-secondary">
              {formatINR(
                (rateSummary[18]?.tax || 0) + (rateSummary[28]?.tax || 0)
              )}
            </div>
            <span className="text-[10px] text-outline">Total 7 HSN Categories in {period}</span>
          </div>
          <div className="text-[10px] text-secondary font-semibold">100% GSTR-1 Mapped</div>
        </div>
      </div>

      {/* Rate Filter Bar */}
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-2">
          <span className="text-outline font-bold uppercase text-[11px]">Filter by Tax Rate:</span>
          <div className="flex gap-1">
            {['ALL', '18', '28'].map(rate => (
              <button
                key={rate}
                onClick={() => setSelectedRate(rate)}
                className={`px-2.5 py-1 rounded text-xs font-semibold ${
                  selectedRate === rate
                    ? 'bg-secondary text-on-secondary shadow-xs'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {rate === 'ALL' ? 'All Tax Slabs' : `${rate}% GST`}
              </button>
            ))}
          </div>
        </div>
        <div className="text-outline">
          Reporting Period: <strong className="text-on-surface">{period}</strong>
        </div>
      </div>

      {/* Main HSN Table */}
      <CommonReportTable<HsnTaxRecord>
        title={`HSN Summary Table (${filteredRecords.length} Codes)`}
        subtitle="Compliant with GSTN Table 12 format for GSTR-1 return filing"
        columns={columns}
        data={filteredRecords}
        searchPlaceholder="Search HSN code, item group, description..."
        onRowClick={r => {
          onOpenDrawer({
            id: r.id,
            type: 'GST',
            title: `HSN Code ${r.hsn} - ${r.itemName}`,
            referenceNo: `HSN-${r.hsn}`,
            date: 'October 2024 Filing Period',
            partyName: 'Consolidated Sales Register',
            partyGstin: '33AAAAA0000A1Z5',
            status: 'COMPLIANT',
            taxableAmount: r.taxableValue,
            cgst: r.cgst,
            sgst: r.sgst,
            igst: r.igst,
            totalAmount: r.taxableValue + r.totalTax,
            user: 'System Tax Aggregator',
            timestamp: '2024-10-24 11:30 AM',
            items: [
              { name: r.itemName, sku: `HSN-${r.hsn}`, hsn: r.hsn, qty: r.quantity, unitPrice: r.taxableValue / r.quantity, gstRate: r.gstRate, total: r.taxableValue + r.totalTax }
            ],
            auditHistory: [
              { timestamp: '24-10-2024', action: 'Auto-aggregated from POS counter and garage ledger invoices', user: 'GST Engine' }
            ],
            notes: `HSN ${r.hsn} qualifies for standard ${r.gstRate}% rate.`
          });
        }}
        exportFileName={`HSN-Tax-Report-${period.replace(/\s+/g, '-')}`}
      />
    </div>
  );
};
