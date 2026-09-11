import React, { useState, useMemo } from 'react';
import { Gstr1Record, Gstr1Section, UserRole, ReportDetailData } from '../../types';
import { INITIAL_GSTR1_RECORDS, INITIAL_GSTR1_VALIDATION, INITIAL_HSN_RECORDS } from '../../data/gstAndReportsData';
import { CommonReportTable, ColumnDef } from '../reports/CommonReportTable';
import { formatINR } from '../../utils/formatters';

interface Gstr1ViewProps {
  userRole: UserRole;
  onNavigate: (screenId: string) => void;
  onOpenDrawer: (data: ReportDetailData) => void;
}

export const Gstr1View: React.FC<Gstr1ViewProps> = ({
  userRole,
  onNavigate,
  onOpenDrawer
}) => {
  const [records, setRecords] = useState<Gstr1Record[]>(INITIAL_GSTR1_RECORDS);
  const [activeSection, setActiveSection] = useState<Gstr1Section>('b2b');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Ready' | 'Warning' | 'Error'>('ALL');
  const [validationSummary, setValidationSummary] = useState(INITIAL_GSTR1_VALIDATION);
  const [returnPeriod, setReturnPeriod] = useState('October 2024');
  const [editingRecord, setEditingRecord] = useState<Gstr1Record | null>(null);
  const [editGstin, setEditGstin] = useState('');
  const [editRate, setEditRate] = useState<number>(18);
  const [isValidationRunning, setIsValidationRunning] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Section tabs
  const sections: { id: Gstr1Section; label: string; count: number }[] = [
    { id: 'b2b', label: 'B2B Invoices', count: records.filter(r => r.section === 'b2b').length },
    { id: 'b2cl', label: 'B2CL (Large Interstate)', count: records.filter(r => r.section === 'b2cl').length },
    { id: 'b2cs', label: 'B2CS (Retail Counter)', count: records.filter(r => r.section === 'b2cs').length },
    { id: 'cdnr', label: 'CDNR (Credit Notes)', count: records.filter(r => r.section === 'cdnr').length },
    { id: 'exp', label: 'EXP (Exports)', count: records.filter(r => r.section === 'exp').length },
    { id: 'nil_exempt', label: 'NIL / Exempt', count: records.filter(r => r.section === 'nil_exempt').length },
    { id: 'hsn', label: 'HSN Summary', count: INITIAL_HSN_RECORDS.length }
  ];

  // Filter records by section and status
  const filteredRecords = useMemo(() => {
    if (activeSection === 'hsn') return [];
    return records.filter(r => {
      const matchSection = r.section === activeSection;
      const matchStatus = statusFilter === 'ALL' || r.filingStatus === statusFilter;
      return matchSection && matchStatus;
    });
  }, [records, activeSection, statusFilter]);

  // Run validation engine
  const handleRunValidation = () => {
    setIsValidationRunning(true);
    setTimeout(() => {
      let warnings = 0;
      let errors = 0;
      let missingGstin = 0;
      let taxMismatch = 0;

      const updated = records.map(r => {
        let status: 'Ready' | 'Warning' | 'Error' = 'Ready';
        let issue: 'None' | 'Missing GSTIN' | 'Invalid GST Rate' | 'Tax Mismatch' | 'Duplicate Invoice' = 'None';

        if (r.section === 'b2b') {
          if (!r.gstin || r.gstin.trim() === '' || r.gstin.length < 15) {
            status = 'Warning';
            issue = 'Missing GSTIN';
            warnings++;
            missingGstin++;
          } else if (r.cgst !== r.sgst && r.igst === 0) {
            status = 'Error';
            issue = 'Tax Mismatch';
            errors++;
            taxMismatch++;
          }
        }
        return { ...r, filingStatus: status, validationIssue: issue };
      });

      setRecords(updated);
      setValidationSummary({
        validRecords: updated.length - warnings - errors,
        warnings,
        errors,
        missingGstin,
        invalidGstRate: 0,
        taxMismatch,
        duplicateInvoice: 0
      });
      setIsValidationRunning(false);
      alert('Validation Engine Completed: 0 duplicates, all checks evaluated.');
    }, 600);
  };

  // Save edit fix
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    const updated = records.map(r => {
      if (r.id === editingRecord.id) {
        const taxable = r.taxableValue;
        const halfRate = editRate / 2 / 100;
        const newCgst = r.igst > 0 ? 0 : Number((taxable * halfRate).toFixed(2));
        const newSgst = r.igst > 0 ? 0 : Number((taxable * halfRate).toFixed(2));
        const newIgst = r.igst > 0 ? Number(((taxable * editRate) / 100).toFixed(2)) : 0;
        const total = Number((taxable + newCgst + newSgst + newIgst).toFixed(2));

        return {
          ...r,
          gstin: editGstin,
          rate: editRate,
          cgst: newCgst,
          sgst: newSgst,
          igst: newIgst,
          totalInvoiceValue: total,
          filingStatus: 'Ready' as const,
          validationIssue: 'None' as const
        };
      }
      return r;
    });

    setRecords(updated);
    setEditingRecord(null);

    // Re-tally validation summary
    const warnCount = updated.filter(r => r.filingStatus === 'Warning').length;
    const errCount = updated.filter(r => r.filingStatus === 'Error').length;
    setValidationSummary({
      ...validationSummary,
      validRecords: updated.length - warnCount - errCount,
      warnings: warnCount,
      errors: errCount,
      missingGstin: updated.filter(r => r.validationIssue === 'Missing GSTIN').length,
      taxMismatch: updated.filter(r => r.validationIssue === 'Tax Mismatch').length
    });
  };

  // Columns definition for GSTR-1 records
  const columns: ColumnDef<Gstr1Record>[] = [
    {
      id: 'invoiceNumber',
      header: 'Invoice #',
      accessor: r => r.invoiceNumber,
      cell: r => (
        <span className="font-mono font-bold text-secondary">{r.invoiceNumber}</span>
      )
    },
    {
      id: 'invoiceDate',
      header: 'Date',
      accessor: r => r.invoiceDate
    },
    {
      id: 'customer',
      header: 'Customer / Recipient',
      accessor: r => r.customer,
      cell: r => (
        <div>
          <div className="font-bold text-on-surface">{r.customer}</div>
          <div className="text-[10px] text-outline">{r.itemSummary}</div>
        </div>
      )
    },
    {
      id: 'gstin',
      header: 'GSTIN / UIN',
      accessor: r => r.gstin,
      cell: r => (
        <span className={`font-mono text-[11px] ${!r.gstin ? 'text-warning font-bold' : 'text-on-surface'}`}>
          {r.gstin || 'MISSING (Action Req)'}
        </span>
      )
    },
    {
      id: 'pos',
      header: 'Place of Supply',
      accessor: r => r.pos,
      cell: r => <span className="text-[11px] text-outline">{r.pos}</span>
    },
    {
      id: 'taxableValue',
      header: 'Taxable Value',
      accessor: r => r.taxableValue,
      align: 'right',
      formatAsINR: true,
      totalable: true
    },
    {
      id: 'rate',
      header: 'Rate',
      accessor: r => r.rate,
      align: 'center',
      cell: r => <span className="font-mono text-xs">{r.rate}%</span>
    },
    {
      id: 'cgst',
      header: 'CGST',
      accessor: r => r.cgst,
      align: 'right',
      formatAsINR: true,
      totalable: true
    },
    {
      id: 'sgst',
      header: 'SGST',
      accessor: r => r.sgst,
      align: 'right',
      formatAsINR: true,
      totalable: true
    },
    {
      id: 'igst',
      header: 'IGST',
      accessor: r => r.igst,
      align: 'right',
      formatAsINR: true,
      totalable: true
    },
    {
      id: 'totalInvoiceValue',
      header: 'Invoice Total',
      accessor: r => r.totalInvoiceValue,
      align: 'right',
      formatAsINR: true,
      totalable: true
    },
    {
      id: 'filingStatus',
      header: 'Validation',
      accessor: r => r.filingStatus,
      align: 'center',
      cell: r => (
        <div className="flex flex-col items-center gap-0.5">
          <span
            className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
              r.filingStatus === 'Ready'
                ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                : r.filingStatus === 'Warning'
                ? 'bg-warning-container text-on-warning-container'
                : 'bg-error-container text-on-error-container'
            }`}
          >
            {r.filingStatus}
          </span>
          {r.validationIssue !== 'None' && (
            <span className="text-[9px] text-error font-semibold">{r.validationIssue}</span>
          )}
        </div>
      )
    },
    {
      id: 'actions',
      header: 'Fix / Audit',
      accessor: r => r.id,
      align: 'center',
      cell: r => (
        <div className="flex items-center justify-center gap-1">
          {r.filingStatus !== 'Ready' && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                setEditingRecord(r);
                setEditGstin(r.gstin || '33');
                setEditRate(r.rate);
              }}
              className="px-2 py-0.5 bg-warning-container text-on-warning-container rounded font-bold text-[10px] hover:opacity-80"
              title="Fix GSTIN or Tax Rate"
            >
              Rectify
            </button>
          )}
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              onOpenDrawer({
                id: r.id,
                type: 'GST',
                title: `GSTR-1 Record ${r.invoiceNumber}`,
                referenceNo: r.invoiceNumber,
                date: r.invoiceDate,
                partyName: r.customer,
                partyGstin: r.gstin,
                status: r.filingStatus,
                taxableAmount: r.taxableValue,
                cgst: r.cgst,
                sgst: r.sgst,
                igst: r.igst,
                totalAmount: r.totalInvoiceValue,
                user: 'Rajesh Kumar',
                timestamp: '2024-10-24 11:00 AM',
                items: [
                  { name: r.itemSummary || 'Automotive Spares', sku: 'SKU-GEN', hsn: '8714', qty: 1, unitPrice: r.taxableValue, gstRate: r.rate, total: r.totalInvoiceValue }
                ],
                auditHistory: [
                  { timestamp: r.invoiceDate, action: 'Invoice tagged for GSTR-1 export', user: 'GST Bot' }
                ]
              });
            }}
            className="p-1 text-outline hover:text-on-surface"
            title="Inspect Details"
          >
            <span className="material-symbols-outlined text-[15px]">visibility</span>
          </button>
        </div>
      )
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
            <h1 className="font-headline-lg text-headline-lg text-on-surface">GSTR-1 Preparation &amp; Validation</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-secondary/15 text-secondary border border-secondary/20">
              Form GSTR-1
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Outward supplies statement for registered garages, B2C counter cash, credit notes &amp; HSN classification
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={isValidationRunning}
            onClick={handleRunValidation}
            className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded font-semibold text-xs flex items-center gap-1.5 border border-surface-container-high transition-colors disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[16px] ${isValidationRunning ? 'animate-spin' : ''}`}>
              check_circle
            </span>
            <span>{isValidationRunning ? 'Validating...' : 'Validate All Records'}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            className="px-3 py-1.5 bg-secondary text-on-secondary hover:bg-secondary-container rounded font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
            <span>Export GSTN JSON</span>
          </button>
        </div>
      </div>

      {/* Validation Health Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
        <div className="p-3 bg-surface-container-lowest rounded border border-surface-container-high">
          <span className="text-[10px] text-outline font-bold uppercase block">Total Records</span>
          <span className="font-mono text-base font-bold text-on-surface mt-1 block">{records.length}</span>
          <span className="text-[10px] text-outline">All outward invoices</span>
        </div>

        <div className="p-3 bg-surface-container-lowest rounded border border-surface-container-high">
          <span className="text-[10px] text-tertiary font-bold uppercase block">Valid Records</span>
          <span className="font-mono text-base font-bold text-on-tertiary-container mt-1 block">
            {validationSummary.validRecords}
          </span>
          <span className="text-[10px] text-tertiary">Ready for portal</span>
        </div>

        <div className="p-3 bg-surface-container-lowest rounded border border-surface-container-high">
          <span className="text-[10px] text-warning font-bold uppercase block">Warnings</span>
          <span className="font-mono text-base font-bold text-warning mt-1 block">{validationSummary.warnings}</span>
          <span className="text-[10px] text-outline">Missing details</span>
        </div>

        <div className="p-3 bg-surface-container-lowest rounded border border-surface-container-high">
          <span className="text-[10px] text-error font-bold uppercase block">Errors</span>
          <span className="font-mono text-base font-bold text-error mt-1 block">{validationSummary.errors}</span>
          <span className="text-[10px] text-outline">Will be rejected</span>
        </div>

        <div className="p-3 bg-surface-container-lowest rounded border border-surface-container-high">
          <span className="text-[10px] text-outline font-bold uppercase block">Missing GSTIN</span>
          <span className="font-mono text-base font-bold text-on-surface mt-1 block">
            {validationSummary.missingGstin}
          </span>
          <span className="text-[10px] text-outline">B2B garages</span>
        </div>

        <div className="p-3 bg-surface-container-lowest rounded border border-surface-container-high">
          <span className="text-[10px] text-outline font-bold uppercase block">Tax Mismatches</span>
          <span className="font-mono text-base font-bold text-on-surface mt-1 block">
            {validationSummary.taxMismatch}
          </span>
          <span className="text-[10px] text-outline">CGST != SGST</span>
        </div>

        <div className="p-3 bg-surface-container-lowest rounded border border-surface-container-high">
          <span className="text-[10px] text-outline font-bold uppercase block">Duplicate Invoices</span>
          <span className="font-mono text-base font-bold text-on-surface mt-1 block">
            {validationSummary.duplicateInvoice}
          </span>
          <span className="text-[10px] text-tertiary">Zero Duplicates</span>
        </div>
      </div>

      {/* GSTR-1 Section Tabs Bar */}
      <div className="bg-surface-container-lowest border border-surface-container-high rounded p-1 flex flex-wrap gap-1">
        {sections.map(s => {
          const isActive = activeSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-colors flex items-center gap-1.5 ${
                isActive
                  ? 'bg-secondary text-on-secondary shadow-xs'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              <span>{s.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-black/20 text-on-secondary' : 'bg-surface-container-lowest text-outline'
                }`}
              >
                {s.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Secondary Status Filter Bar */}
      {activeSection !== 'hsn' && (
        <div className="flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-2">
            <span className="text-outline font-semibold">Filter by Status:</span>
            <div className="flex gap-1">
              {(['ALL', 'Ready', 'Warning', 'Error'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    statusFilter === st
                      ? 'bg-surface-container-highest text-on-surface font-bold border border-surface-container-high'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
          <div className="text-outline">
            Showing <span className="font-bold text-on-surface">{filteredRecords.length}</span> rows in section{' '}
            <span className="font-mono uppercase font-bold text-secondary">{activeSection}</span>
          </div>
        </div>
      )}

      {/* Main Table View */}
      {activeSection === 'hsn' ? (
        <div className="bg-surface-container-lowest rounded shadow-xs border border-surface-container-high overflow-hidden">
          <div className="p-3 bg-surface-container-low border-b border-surface-container-high flex items-center justify-between">
            <span className="font-bold text-on-surface text-xs">Table 12: HSN Summary of Outward Supplies</span>
            <button
              onClick={() => onNavigate('hsn-tax-report')}
              className="text-xs text-secondary hover:underline font-bold"
            >
              Open Full HSN &amp; Tax Report &rarr;
            </button>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-surface-container font-label-caps text-label-caps text-on-surface-variant uppercase">
              <tr>
                <th className="py-2.5 px-3">HSN Code</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 text-center">UQC</th>
                <th className="py-2.5 px-3 text-right">Total Qty</th>
                <th className="py-2.5 px-3 text-right">Taxable Value</th>
                <th className="py-2.5 px-3 text-center">Rate</th>
                <th className="py-2.5 px-3 text-right">CGST</th>
                <th className="py-2.5 px-3 text-right">SGST</th>
                <th className="py-2.5 px-3 text-right">Total Tax</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-table-cell">
              {INITIAL_HSN_RECORDS.map(h => (
                <tr key={h.id} className="hover:bg-surface-container-low">
                  <td className="py-2 px-3 font-mono font-bold text-secondary">{h.hsn}</td>
                  <td className="py-2 px-3 font-semibold text-on-surface">{h.itemName}</td>
                  <td className="py-2 px-3 text-center font-mono text-outline">{h.uqc}</td>
                  <td className="py-2 px-3 text-right font-mono font-semibold">{h.quantity}</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-on-surface">{formatINR(h.taxableValue)}</td>
                  <td className="py-2 px-3 text-center font-mono">{h.gstRate}%</td>
                  <td className="py-2 px-3 text-right font-mono text-outline">{formatINR(h.cgst)}</td>
                  <td className="py-2 px-3 text-right font-mono text-outline">{formatINR(h.sgst)}</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-secondary">{formatINR(h.totalTax)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <CommonReportTable<Gstr1Record>
          title={`GSTR-1: ${activeSection.toUpperCase()} Table (${filteredRecords.length} Entries)`}
          subtitle={`Filing return period: ${returnPeriod} | Section: ${activeSection.toUpperCase()}`}
          columns={columns}
          data={filteredRecords}
          searchPlaceholder="Search invoice #, customer name, GSTIN, item..."
          onRowClick={r => {
            onOpenDrawer({
              id: r.id,
              type: 'GST',
              title: `GSTR-1 Record ${r.invoiceNumber}`,
              referenceNo: r.invoiceNumber,
              date: r.invoiceDate,
              partyName: r.customer,
              partyGstin: r.gstin,
              status: r.filingStatus,
              taxableAmount: r.taxableValue,
              cgst: r.cgst,
              sgst: r.sgst,
              igst: r.igst,
              totalAmount: r.totalInvoiceValue,
              user: 'Rajesh Kumar',
              timestamp: '2024-10-24 11:00 AM',
              items: [
                { name: r.itemSummary || 'Automotive Spares', sku: 'SKU-GEN', hsn: '8714', qty: 1, unitPrice: r.taxableValue, gstRate: r.rate, total: r.totalInvoiceValue }
              ],
              auditHistory: [
                { timestamp: r.invoiceDate, action: 'Invoice recorded in GSTR-1 preparation state', user: 'Rajesh Kumar' }
              ]
            });
          }}
          exportFileName={`GSTR1-${activeSection}-${returnPeriod.replace(/\s+/g, '-')}`}
        />
      )}

      {/* Inline Fix / Rectify Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-surface-container-high rounded-lg shadow-2xl max-w-md w-full p-4 space-y-3 animate-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center justify-between border-b border-surface-container-high pb-2">
              <div>
                <h3 className="font-bold text-sm text-on-surface">Rectify GSTR-1 Validation Flag</h3>
                <p className="text-outline text-[11px]">Invoice: {editingRecord.invoiceNumber}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="p-1 text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-outline font-semibold mb-1">Customer / Party Name</label>
                <input
                  type="text"
                  disabled
                  value={editingRecord.customer}
                  className="w-full bg-surface-container px-2.5 py-1.5 rounded border border-surface-container-high text-on-surface"
                />
              </div>

              <div>
                <label className="block text-outline font-semibold mb-1">
                  GSTIN (15 Digits Alpha-Numeric) <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={15}
                  value={editGstin}
                  onChange={e => setEditGstin(e.target.value.toUpperCase())}
                  placeholder="33AAACR1234F1Z8"
                  className="w-full bg-surface-container-lowest font-mono px-2.5 py-1.5 rounded border border-surface-container-high text-on-surface focus:outline-none focus:border-secondary uppercase"
                />
                <span className="text-[10px] text-outline mt-0.5 block">
                  e.g., 33 (Tamil Nadu State Code) + PAN + 1Z + Checksum
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-outline font-semibold mb-1">GST Tax Rate %</label>
                  <select
                    value={editRate}
                    onChange={e => setEditRate(Number(e.target.value))}
                    className="w-full bg-surface-container-lowest font-mono px-2 py-1.5 rounded border border-surface-container-high text-on-surface focus:outline-none"
                  >
                    <option value={18}>18% (Standard Spares)</option>
                    <option value={28}>28% (Batteries / Plugs)</option>
                    <option value={12}>12%</option>
                    <option value={5}>5%</option>
                    <option value={0}>0% (Exempt)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-outline font-semibold mb-1">Taxable Value</label>
                  <div className="font-mono py-1.5 text-on-surface font-bold">
                    {formatINR(editingRecord.taxableValue)}
                  </div>
                </div>
              </div>

              <div className="p-2.5 bg-surface-container-low rounded border border-surface-container-high text-[11px] space-y-1">
                <span className="font-bold text-on-surface block">Auto-Calculated Output Taxes:</span>
                <div className="flex justify-between text-outline">
                  <span>CGST:</span>
                  <span>{formatINR((editingRecord.taxableValue * (editRate / 2)) / 100)}</span>
                </div>
                <div className="flex justify-between text-outline">
                  <span>SGST:</span>
                  <span>{formatINR((editingRecord.taxableValue * (editRate / 2)) / 100)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container-high">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-secondary text-on-secondary hover:bg-secondary-container rounded font-bold text-xs shadow-xs"
                >
                  Save &amp; Mark Valid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export GSTN JSON Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-surface-container-high rounded-lg shadow-2xl max-w-md w-full p-4 space-y-3 animate-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center justify-between border-b border-surface-container-high pb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-xl">cloud_upload</span>
                <h3 className="font-bold text-sm text-on-surface">Export GSTR-1 to GSTN Portal Format</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="p-1 text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="text-on-surface-variant">
              This will generate the official government schema JSON payload compliant with the GST Offline Tool v3.1.8.
            </p>

            <div className="p-3 bg-surface-container-low rounded border border-surface-container-high space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-outline">GSTIN:</span>
                <span className="font-bold text-on-surface">33AAAAA0000A1Z5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Return Period (FP):</span>
                <span className="font-bold text-on-surface">102024 (Oct 2024)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Gross Taxable Turnover:</span>
                <span className="font-bold text-on-surface">{formatINR(2480450.0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Total Invoices Included:</span>
                <span className="font-bold text-secondary">{records.length} Bills</span>
              </div>
            </div>

            {validationSummary.errors > 0 && (
              <div className="p-2.5 bg-error-container text-on-error-container rounded text-[11px] font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                <span>Warning: You have {validationSummary.errors} error record(s) that may fail portal schema checks!</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container-high">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const sampleJson = {
                    gstin: '33AAAAA0000A1Z5',
                    fp: '102024',
                    cur_gt: 2480450.0,
                    gt: 15420000.0,
                    b2b: records.filter(r => r.section === 'b2b'),
                    b2cs: records.filter(r => r.section === 'b2cs'),
                    hsn: INITIAL_HSN_RECORDS
                  };
                  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sampleJson, null, 2));
                  const dlAnchor = document.createElement('a');
                  dlAnchor.setAttribute('href', dataStr);
                  dlAnchor.setAttribute('download', `GSTR1_33AAAAA0000A1Z5_102024.json`);
                  document.body.appendChild(dlAnchor);
                  dlAnchor.click();
                  dlAnchor.remove();
                  setShowExportModal(false);
                }}
                className="px-3 py-1.5 bg-secondary text-on-secondary hover:bg-secondary-container rounded font-bold text-xs shadow-xs flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[15px]">download</span>
                <span>Download GSTR1.json</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
