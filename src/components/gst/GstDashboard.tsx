import React, { useState } from 'react';
import { GstPeriod, UserRole, ReportDetailData } from '../../types';
import { GST_DASHBOARD_KPIS, GST_TREND_DATA, GST_FILING_STATUSES, INITIAL_GSTR1_RECORDS, SAMPLE_REPORT_DRAWER_DATA } from '../../data/gstAndReportsData';
import { formatINR } from '../../utils/formatters';

interface GstDashboardProps {
  userRole: UserRole;
  onNavigate: (screenId: string) => void;
  onOpenDrawer: (data: ReportDetailData) => void;
}

export const GstDashboard: React.FC<GstDashboardProps> = ({
  userRole,
  onNavigate,
  onOpenDrawer
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<GstPeriod>('current_month');
  const [customStartDate, setCustomStartDate] = useState('2024-10-01');
  const [customEndDate, setCustomEndDate] = useState('2024-10-31');

  // Select active KPI metrics
  const activeKpi =
    selectedPeriod === 'previous_month'
      ? GST_DASHBOARD_KPIS.previousMonth
      : selectedPeriod === 'quarter'
      ? GST_DASHBOARD_KPIS.quarter
      : selectedPeriod === 'financial_year'
      ? GST_DASHBOARD_KPIS.financialYear
      : GST_DASHBOARD_KPIS.currentMonth;

  return (
    <div className="flex flex-col w-full pb-12 space-y-gutter animate-in fade-in duration-150">
      {/* Top Header & Tax Period Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface-container-lowest p-gutter rounded shadow-xs border border-surface-container-high gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-2xl">account_balance</span>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">GST Compliance &amp; Tax Portal</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-secondary/15 text-secondary border border-secondary/20">
              GSTIN: 33AAAAA0000A1Z5
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Real-time Goods and Services Tax ledger, GSTR-1 outward reconciliation, ITC input credits &amp; GSTR-3B liabilities
          </p>
        </div>

        {/* Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('gstr-1')}
            className="px-3 py-1.5 bg-secondary text-on-secondary hover:bg-secondary-container rounded font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">assignment</span>
            <span>GSTR-1 Preparation</span>
          </button>
          <button
            onClick={() => onNavigate('gstr-3b')}
            className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded font-semibold text-xs flex items-center gap-1.5 border border-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">summarize</span>
            <span>GSTR-3B Summary</span>
          </button>
          <button
            onClick={() => onNavigate('hsn-tax-report')}
            className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded font-semibold text-xs flex items-center gap-1.5 border border-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">percent</span>
            <span>HSN Tax Report</span>
          </button>
        </div>
      </div>

      {/* Tax Period Selector Bar */}
      <div className="p-3 bg-surface-container-lowest rounded shadow-xs border border-surface-container-high flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-outline uppercase text-[11px]">Tax Return Period:</span>
          <div className="flex flex-wrap gap-1">
            {[
              { id: 'current_month', label: 'Current Month (Oct 24)' },
              { id: 'previous_month', label: 'Previous Month (Sep 24)' },
              { id: 'quarter', label: 'Quarter (Q2)' },
              { id: 'financial_year', label: 'Financial Year (2024-25)' },
              { id: 'custom', label: 'Custom Range' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedPeriod(p.id as GstPeriod)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  selectedPeriod === p.id
                    ? 'bg-secondary text-on-secondary shadow-xs'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {selectedPeriod === 'custom' && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customStartDate}
              onChange={e => setCustomStartDate(e.target.value)}
              className="bg-surface-container px-2 py-1 rounded border border-surface-container-high text-xs text-on-surface"
            />
            <span className="text-outline">to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={e => setCustomEndDate(e.target.value)}
              className="bg-surface-container px-2 py-1 rounded border border-surface-container-high text-xs text-on-surface"
            />
          </div>
        )}

        <div className="text-outline font-mono">
          Showing Data for: <span className="font-bold text-on-surface">{activeKpi.periodName}</span>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-space-sm">
        {/* Taxable Sales */}
        <div className="bg-surface-container-lowest p-3.5 rounded shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Taxable Sales</span>
            <span className="material-symbols-outlined text-[18px] text-secondary">trending_up</span>
          </div>
          <div className="my-2">
            <div className="font-mono text-lg font-bold text-on-surface">
              {formatINR(activeKpi.taxableSales)}
            </div>
            <span className="text-[10px] text-outline">B2B + B2C Outward</span>
          </div>
          <div className="text-[10px] text-secondary font-semibold">100% Reconciled</div>
        </div>

        {/* Output GST */}
        <div className="bg-surface-container-lowest p-3.5 rounded shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Output GST</span>
            <span className="material-symbols-outlined text-[18px] text-primary">receipt_long</span>
          </div>
          <div className="my-2">
            <div className="font-mono text-lg font-bold text-primary">
              {formatINR(activeKpi.outputGst)}
            </div>
            <span className="text-[10px] text-outline">Tax collected on sales</span>
          </div>
          <div className="text-[10px] text-outline">CGST + SGST (18%/28%)</div>
        </div>

        {/* Taxable Purchases */}
        <div className="bg-surface-container-lowest p-3.5 rounded shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Taxable Purchases</span>
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">shopping_bag</span>
          </div>
          <div className="my-2">
            <div className="font-mono text-lg font-bold text-on-surface">
              {formatINR(activeKpi.taxablePurchases)}
            </div>
            <span className="text-[10px] text-outline">Inward stock GRN</span>
          </div>
          <div className="text-[10px] text-outline">Registered Distributors</div>
        </div>

        {/* Input GST (ITC) */}
        <div className="bg-surface-container-lowest p-3.5 rounded shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Input GST (ITC)</span>
            <span className="material-symbols-outlined text-[18px] text-tertiary">check_circle</span>
          </div>
          <div className="my-2">
            <div className="font-mono text-lg font-bold text-on-tertiary-container">
              {formatINR(activeKpi.inputGst)}
            </div>
            <span className="text-[10px] text-outline">GSTR-2B Claimable</span>
          </div>
          <div className="text-[10px] text-on-tertiary-container font-semibold">98.4% Matched</div>
        </div>

        {/* Net GST Payable */}
        <div className="bg-surface-container-lowest p-3.5 rounded shadow-xs border border-secondary/30 bg-secondary/5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Net GST Payable</span>
            <span className="material-symbols-outlined text-[18px] text-secondary">account_balance_wallet</span>
          </div>
          <div className="my-2">
            <div className="font-mono text-lg font-bold text-secondary">
              {formatINR(activeKpi.netGstPayable)}
            </div>
            <span className="text-[10px] text-outline">Output minus Input ITC</span>
          </div>
          <div className="text-[10px] text-outline">Payable via Cash Ledger</div>
        </div>

        {/* Total GST Transactions */}
        <div className="bg-surface-container-lowest p-3.5 rounded shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Total Transactions</span>
            <span className="material-symbols-outlined text-[18px] text-outline">table_rows</span>
          </div>
          <div className="my-2">
            <div className="font-mono text-lg font-bold text-on-surface">
              {activeKpi.totalTransactions} Bills
            </div>
            <span className="text-[10px] text-outline">Counter &amp; Garage</span>
          </div>
          <div className="text-[10px] text-secondary font-semibold">Ready for GSTR-1</div>
        </div>
      </div>

      {/* Output vs Input Comparison & GST Liability Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-sm">
        {/* Output vs Input Comparison Chart & Ratio */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-4 rounded shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-headline-sm text-sm font-bold text-on-surface">
                Output vs Input GST Monthly Trend (Last 6 Months)
              </h2>
              <p className="text-[11px] text-outline">
                Comparison of tax collected on sales vs Input Tax Credit on inventory purchases
              </p>
            </div>
            <span className="text-[10px] font-mono text-outline">Amounts in INR (₹)</span>
          </div>

          {/* Graphical Bars */}
          <div className="space-y-3 my-2">
            {GST_TREND_DATA.map(t => {
              const maxVal = 460000;
              const outputPct = Math.min(100, Math.round((t.outputGst / maxVal) * 100));
              const inputPct = Math.min(100, Math.round((t.inputGst / maxVal) * 100));

              return (
                <div key={t.month} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-on-surface">{t.month}</span>
                    <div className="flex gap-4 font-mono text-[11px]">
                      <span className="text-primary font-semibold">Output: {formatINR(t.outputGst, 0)}</span>
                      <span className="text-on-tertiary-container font-semibold">ITC: {formatINR(t.inputGst, 0)}</span>
                      <span className="text-secondary font-bold">Net: {formatINR(t.netPayable, 0)}</span>
                    </div>
                  </div>
                  <div className="h-4 w-full bg-surface-container rounded overflow-hidden flex gap-1 p-0.5">
                    <div
                      style={{ width: `${outputPct}%` }}
                      className="bg-primary/80 h-full rounded-xs transition-all"
                      title={`Output GST: ${formatINR(t.outputGst)}`}
                    />
                    <div
                      style={{ width: `${inputPct}%` }}
                      className="bg-tertiary-fixed-dim h-full rounded-xs transition-all"
                      title={`Input Tax Credit: ${formatINR(t.inputGst)}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-surface-container-high flex items-center justify-between text-[11px] text-outline">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-xs bg-primary/80" />
                <span>Output Tax (Sales Liability)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-xs bg-tertiary-fixed-dim" />
                <span>Input Tax Credit (ITC)</span>
              </div>
            </div>
            <span>Average Net Tax Rate: 4.8% of Gross Turn</span>
          </div>
        </div>

        {/* GST Liability & Offset Summary */}
        <div className="bg-surface-container-lowest p-4 rounded shadow-xs border border-surface-container-high flex flex-col justify-between">
          <div>
            <h2 className="font-headline-sm text-sm font-bold text-on-surface mb-1">
              October 2024 GST Liability Breakdown
            </h2>
            <p className="text-[11px] text-outline mb-3">Electronic Liability Ledger vs Input Credit Ledger</p>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="p-2.5 bg-surface-container-low rounded border border-surface-container-high">
                <div className="flex justify-between font-bold text-on-surface mb-1">
                  <span>Central GST (CGST)</span>
                  <span className="text-primary">{formatINR(activeKpi.outputGst / 2)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-outline">
                  <span>Eligible ITC:</span>
                  <span>-{formatINR(activeKpi.inputGst / 2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-secondary pt-1 border-t border-surface-container-high mt-1 text-[11px]">
                  <span>Net CGST Payable:</span>
                  <span>{formatINR((activeKpi.outputGst / 2) - (activeKpi.inputGst / 2))}</span>
                </div>
              </div>

              <div className="p-2.5 bg-surface-container-low rounded border border-surface-container-high">
                <div className="flex justify-between font-bold text-on-surface mb-1">
                  <span>State GST (SGST)</span>
                  <span className="text-primary">{formatINR(activeKpi.outputGst / 2)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-outline">
                  <span>Eligible ITC:</span>
                  <span>-{formatINR(activeKpi.inputGst / 2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-secondary pt-1 border-t border-surface-container-high mt-1 text-[11px]">
                  <span>Net SGST Payable:</span>
                  <span>{formatINR((activeKpi.outputGst / 2) - (activeKpi.inputGst / 2))}</span>
                </div>
              </div>

              <div className="p-2.5 bg-surface-container-low rounded border border-surface-container-high">
                <div className="flex justify-between font-bold text-on-surface mb-1">
                  <span>Integrated GST (IGST)</span>
                  <span className="text-on-surface font-semibold">{formatINR(0.0)}</span>
                </div>
                <div className="text-[10px] text-outline">Zero Interstate Purchases in October</div>
              </div>
            </div>
          </div>

          <div className="mt-3 p-3 bg-secondary/10 border border-secondary/20 rounded">
            <div className="flex justify-between items-center text-xs font-bold text-secondary">
              <span>Total Challan to be Generated:</span>
              <span className="text-sm font-mono">{formatINR(activeKpi.netGstPayable)}</span>
            </div>
            <p className="text-[10px] text-outline mt-1">Due before 20th November for GSTR-3B offset.</p>
          </div>
        </div>
      </div>

      {/* Statutory Filing Status Calendar */}
      <div className="bg-surface-container-lowest p-4 rounded shadow-xs border border-surface-container-high">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-headline-sm text-sm font-bold text-on-surface">
              Statutory Return Filing Schedule &amp; Compliance Status
            </h2>
            <p className="text-[11px] text-outline">Direct integration with GSTN Portal rules and deadlines</p>
          </div>
          <button
            onClick={() => alert('Refreshing GSTN portal status... All records verified.')}
            className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high rounded text-xs text-on-surface font-semibold flex items-center gap-1 border border-surface-container-high"
          >
            <span className="material-symbols-outlined text-[15px]">sync</span>
            <span>Check GSTN Status</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          {GST_FILING_STATUSES.map((f, idx) => (
            <div key={idx} className="p-3 bg-surface-container-low rounded border border-surface-container-high flex flex-col justify-between">
              <div>
                <div className="font-bold text-on-surface">{f.returnType}</div>
                <div className="text-[11px] text-outline">{f.period}</div>
                <div className="mt-2 text-[11px]">
                  <span className="text-outline">Due: </span>
                  <span className="font-bold text-on-surface">{f.dueDate}</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-surface-container-high flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${f.badgeColor}`}>
                  {f.status}
                </span>
                <span className="font-mono text-[11px] font-bold text-on-surface">
                  {formatINR(f.taxLiability, 0)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent GST Transactions Table */}
      <div className="bg-surface-container-lowest rounded shadow-xs border border-surface-container-high overflow-hidden">
        <div className="p-3 bg-surface-container-low border-b border-surface-container-high flex items-center justify-between">
          <div>
            <h2 className="font-headline-sm text-sm font-bold text-on-surface">Recent GST Outward &amp; Inward Transactions</h2>
            <p className="text-[11px] text-outline">Click any transaction to open the tax audit drawer</p>
          </div>
          <button
            onClick={() => onNavigate('gstr-1')}
            className="text-xs text-secondary hover:underline font-bold flex items-center gap-1"
          >
            <span>View All in GSTR-1</span>
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-surface-container font-label-caps text-label-caps text-on-surface-variant uppercase">
              <tr>
                <th className="py-2.5 px-3">Inv #</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Customer / Supplier</th>
                <th className="py-2.5 px-3">GSTIN</th>
                <th className="py-2.5 px-3 text-center">Type</th>
                <th className="py-2.5 px-3 text-right">Taxable</th>
                <th className="py-2.5 px-3 text-right">CGST + SGST</th>
                <th className="py-2.5 px-3 text-right">Total</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-table-cell">
              {INITIAL_GSTR1_RECORDS.slice(0, 6).map(r => (
                <tr
                  key={r.id}
                  onClick={() => {
                    const sampleDrawer = SAMPLE_REPORT_DRAWER_DATA[r.invoiceNumber] || {
                      id: r.id,
                      type: 'GST',
                      title: `GST Record ${r.invoiceNumber}`,
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
                        { timestamp: r.invoiceDate, action: 'Recorded in GST Sales Ledger', user: 'Rajesh Kumar' }
                      ]
                    };
                    onOpenDrawer(sampleDrawer);
                  }}
                  className="hover:bg-surface-container-low cursor-pointer transition-colors"
                >
                  <td className="py-2 px-3 font-mono font-bold text-secondary">{r.invoiceNumber}</td>
                  <td className="py-2 px-3 text-outline">{r.invoiceDate}</td>
                  <td className="py-2 px-3 font-semibold text-on-surface">{r.customer}</td>
                  <td className="py-2 px-3 font-mono text-[11px] text-outline">{r.gstin || 'URP'}</td>
                  <td className="py-2 px-3 text-center uppercase font-bold text-[10px] text-outline">
                    {r.section}
                  </td>
                  <td className="py-2 px-3 text-right font-mono">{formatINR(r.taxableValue)}</td>
                  <td className="py-2 px-3 text-right font-mono text-outline">{formatINR(r.cgst + r.sgst)}</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-on-surface">{formatINR(r.totalInvoiceValue)}</td>
                  <td className="py-2 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                      r.filingStatus === 'Ready'
                        ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                        : r.filingStatus === 'Warning'
                        ? 'bg-warning-container text-on-warning-container'
                        : 'bg-error-container text-on-error-container'
                    }`}>
                      {r.filingStatus}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <button
                      type="button"
                      className="p-1 rounded hover:bg-surface-container text-secondary"
                      title="Inspect Tax Audit"
                    >
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
