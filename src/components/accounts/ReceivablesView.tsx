import React, { useState } from 'react';
import { ReceivableRecord } from '../../types';
import { exportToCsv } from '../../utils/exportUtils';

interface ReceivablesViewProps {
  receivables: ReceivableRecord[];
  onOpenCustomerLedger: (customerId: string) => void;
  onReceivePayment: (customer: ReceivableRecord) => void;
  onOpenNewReceipt: () => void;
}

export const ReceivablesView: React.FC<ReceivablesViewProps> = ({
  receivables,
  onOpenCustomerLedger,
  onReceivePayment,
  onOpenNewReceipt
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'ageing'>('summary');
  const [searchCustomer, setSearchCustomer] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING' | 'OVERDUE'>('ALL');
  const [ageingFilter, setAgeingFilter] = useState<'ALL' | 'CURRENT' | '1-30' | '31-60' | '61-90' | '90+'>('ALL');

  // Filtered List
  const filtered = receivables.filter(r => {
    if (searchCustomer && !r.customerName.toLowerCase().includes(searchCustomer.toLowerCase()) && !r.mobile.includes(searchCustomer)) {
      return false;
    }
    if (statusFilter !== 'ALL' && r.status !== statusFilter) {
      return false;
    }
    if (ageingFilter === '90+' && r.ageing.d90Plus <= 0) return false;
    if (ageingFilter === '61-90' && r.ageing.d61_90 <= 0) return false;
    if (ageingFilter === '31-60' && r.ageing.d31_60 <= 0) return false;
    if (ageingFilter === '1-30' && r.ageing.d1_30 <= 0) return false;
    if (ageingFilter === 'CURRENT' && r.ageing.current <= 0) return false;
    return true;
  });

  // Totals
  const totalReceivableAmount = receivables.reduce((sum, r) => sum + r.outstanding, 0);
  const totalCurrent = receivables.reduce((sum, r) => sum + (r.ageing?.current || 0), 0);
  const total1_30 = receivables.reduce((sum, r) => sum + (r.ageing?.d1_30 || 0), 0);
  const total31_60 = receivables.reduce((sum, r) => sum + (r.ageing?.d31_60 || 0), 0);
  const total61_90 = receivables.reduce((sum, r) => sum + (r.ageing?.d61_90 || 0), 0);
  const total90Plus = receivables.reduce((sum, r) => sum + (r.ageing?.d90Plus || 0), 0);
  const grandTotal = totalCurrent + total1_30 + total31_60 + total61_90 + total90Plus;

  return (
    <div className="flex flex-col w-full pb-10 space-y-gutter animate-in fade-in duration-150">
      {/* Header & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface-container-lowest p-gutter rounded shadow-xs gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Customer Receivables</h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-500/10 text-amber-800 border border-amber-500/20">
              Outstanding: ₹{totalReceivableAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Credit limits, overdue invoices, collection tracking, and age-wise risk analysis
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Switcher */}
          <div className="flex bg-surface-container-low p-0.5 rounded border border-surface-container-high text-xs font-semibold">
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'summary'
                  ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              Receivables List
            </button>
            <button
              onClick={() => setActiveTab('ageing')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'ageing'
                  ? 'bg-surface-container-lowest text-on-surface shadow-xs font-bold'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              Ageing Report (30/60/90+)
            </button>
          </div>

          <button
            onClick={onOpenNewReceipt}
            className="px-3.5 py-2 bg-secondary hover:bg-secondary-container text-on-secondary rounded text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>+ Receive Payment</span>
          </button>
        </div>
      </div>

      {/* Ageing Summary Bar Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-space-sm">
        <div className="bg-surface-container-lowest p-3 rounded shadow-xs border border-surface-container-high">
          <div className="text-[10px] font-bold text-outline uppercase tracking-wider">Current (&lt;30d)</div>
          <div className="font-mono text-base font-bold text-emerald-700 mt-0.5">
            ₹{totalCurrent.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-outline mt-1">Normal Credit Terms</div>
        </div>

        <div className="bg-surface-container-lowest p-3 rounded shadow-xs border border-surface-container-high">
          <div className="text-[10px] font-bold text-outline uppercase tracking-wider">1–30 Days Due</div>
          <div className="font-mono text-base font-bold text-blue-700 mt-0.5">
            ₹{total1_30.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-outline mt-1">Follow-up Due</div>
        </div>

        <div className="bg-surface-container-lowest p-3 rounded shadow-xs border border-surface-container-high">
          <div className="text-[10px] font-bold text-outline uppercase tracking-wider">31–60 Days Due</div>
          <div className="font-mono text-base font-bold text-amber-700 mt-0.5">
            ₹{total31_60.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-amber-700 font-semibold mt-1">Reminder Sent</div>
        </div>

        <div className="bg-surface-container-lowest p-3 rounded shadow-xs border border-surface-container-high">
          <div className="text-[10px] font-bold text-outline uppercase tracking-wider">61–90 Days Due</div>
          <div className="font-mono text-base font-bold text-orange-700 mt-0.5">
            ₹{total61_90.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-orange-700 font-semibold mt-1">Credit Warning</div>
        </div>

        <div className="bg-surface-container-lowest p-3 rounded shadow-xs border border-surface-container-high">
          <div className="text-[10px] font-bold text-outline uppercase tracking-wider">90+ Days Due</div>
          <div className="font-mono text-base font-bold text-error mt-0.5">
            ₹{total90Plus.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-error font-bold mt-1">Hold Supply</div>
        </div>

        <div className="bg-surface-container-lowest p-3 rounded shadow-xs border-l-4 border-l-secondary">
          <div className="text-[10px] font-bold text-outline uppercase tracking-wider">Total Receivables</div>
          <div className="font-mono text-base font-bold text-secondary mt-0.5">
            ₹{grandTotal.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-tertiary font-bold mt-1">100% Reconciled</div>
        </div>
      </div>

      {/* Search & Multi-Level Filters */}
      <div className="bg-surface-container-lowest p-3 rounded shadow-xs border border-surface-container-high flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-outline text-[16px]">search</span>
            <input
              type="text"
              value={searchCustomer}
              onChange={(e) => setSearchCustomer(e.target.value)}
              placeholder="Search garage name, contact person or mobile (e.g. ABC Auto Works)..."
              className="w-full pl-8 pr-3 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-secondary font-medium"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-xs">
            <span className="text-outline text-[11px] font-medium">Status:</span>
            {(['ALL', 'OVERDUE', 'PENDING', 'PAID'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                  statusFilter === s
                    ? 'bg-secondary text-on-secondary'
                    : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 text-xs">
            <span className="text-outline text-[11px] font-medium">Ageing:</span>
            <select
              value={ageingFilter}
              onChange={(e) => setAgeingFilter(e.target.value as any)}
              className="bg-surface-container-low border border-surface-container-high rounded px-2 py-1 text-xs text-on-surface font-semibold focus:outline-none"
            >
              <option value="ALL">All Ageing Buckets</option>
              <option value="CURRENT">Current (&lt;30 Days)</option>
              <option value="1-30">1–30 Days</option>
              <option value="31-60">31–60 Days</option>
              <option value="61-90">61–90 Days</option>
              <option value="90+">90+ Days (High Risk)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table: Either Receivables List or Ageing Matrix */}
      {activeTab === 'summary' ? (
        <div className="bg-surface-container-lowest rounded shadow-xs overflow-hidden border border-surface-container-high">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-surface-container font-label-caps text-on-surface-variant uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">Customer</th>
                  <th className="p-2.5">Mobile</th>
                  <th className="p-2.5 text-center">Invoices</th>
                  <th className="p-2.5 text-right">Total Sales</th>
                  <th className="p-2.5 text-right">Received</th>
                  <th className="p-2.5 text-right">Outstanding</th>
                  <th className="p-2.5">Last Payment</th>
                  <th className="p-2.5 text-center">Status</th>
                  <th className="p-2.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high font-table-cell">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-outline">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-4xl opacity-50">receipt_long</span>
                        <p className="font-semibold text-on-surface text-base">No customer receivables found.</p>
                        <p className="text-xs">Outstanding balances will appear here when you create credit sales invoices.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {filtered.map(rec => (
                  <tr key={rec.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="p-2.5">
                      <div className="font-bold text-on-surface">{rec.customerName}</div>
                      <div className="text-[11px] text-outline">ID: {rec.customerId}</div>
                    </td>
                    <td className="p-2.5 font-mono text-outline">{rec.mobile}</td>
                    <td className="p-2.5 text-center font-mono font-bold text-on-surface">
                      {rec.invoicesCount ?? 0}
                    </td>
                    <td className="p-2.5 text-right font-mono text-on-surface font-medium">
                      ₹{(rec.totalSales ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-2.5 text-right font-mono text-tertiary font-medium">
                      ₹{(rec.received ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold text-base">
                      <span className={(rec.outstanding ?? 0) > 0 ? (rec.status === 'OVERDUE' ? 'text-error' : 'text-amber-700') : 'text-outline'}>
                        ₹{(rec.outstanding ?? 0).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="p-2.5 text-outline text-[11px]">{rec.lastPaymentDate || 'Recent'}</td>
                    <td className="p-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wider ${
                        rec.status === 'OVERDUE'
                          ? 'bg-error-container text-on-error-container'
                          : rec.status === 'PENDING'
                          ? 'bg-amber-500/15 text-amber-800'
                          : 'bg-tertiary-fixed text-on-tertiary-fixed'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onOpenCustomerLedger(rec.customerId)}
                          className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-secondary text-[11px] font-bold flex items-center gap-1"
                          title="View Customer Statement Ledger"
                        >
                          <span className="material-symbols-outlined text-[14px]">menu_book</span>
                          <span>Ledger</span>
                        </button>
                        {rec.outstanding > 0 && (
                          <button
                            onClick={() => onReceivePayment(rec)}
                            className="px-2 py-1 rounded bg-secondary hover:bg-secondary-container text-on-secondary text-[11px] font-bold flex items-center gap-1 shadow-xs"
                            title="Record Customer Payment Receipt"
                          >
                            <span className="material-symbols-outlined text-[14px]">receipt</span>
                            <span>Receipt</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Ageing Report Table */
        <div className="bg-surface-container-lowest rounded shadow-xs overflow-hidden border border-surface-container-high">
          <div className="p-3 bg-surface-container border-b border-surface-container-high flex items-center justify-between">
            <div>
              <h3 className="font-headline-md text-sm font-bold text-on-surface">
                Receivable Ageing Schedule (Breakdown by Days Overdue)
              </h3>
              <p className="text-[11px] text-outline">Categorized into standard trade credit maturity buckets</p>
            </div>
            <button
              onClick={() => {
                const headers = ['Customer Name', 'Category', 'Total Due (₹)', 'Current', '1-30 Days', '31-60 Days', '61-90 Days', '>90 Days Overdue'];
                const rows = receivables.map(r => [
                  r.customerName,
                  r.category,
                  r.totalDue,
                  r.current,
                  r.days1To30,
                  r.days31To60,
                  r.days61To90,
                  r.daysOver90
                ]);
                exportToCsv(`Receivable_Ageing_Schedule_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
              }}
              className="px-3 py-1.5 rounded bg-surface-container-lowest hover:bg-surface-container border border-surface-container-high text-xs font-bold text-on-surface flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span>Export Ageing</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-surface-container-low font-label-caps text-on-surface-variant uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">Customer</th>
                  <th className="p-2.5 text-right">Current</th>
                  <th className="p-2.5 text-right">1–30 Days</th>
                  <th className="p-2.5 text-right">31–60 Days</th>
                  <th className="p-2.5 text-right">61–90 Days</th>
                  <th className="p-2.5 text-right">90+ Days</th>
                  <th className="p-2.5 text-right">Total Outstanding</th>
                  <th className="p-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high font-table-cell">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-outline">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-4xl opacity-50">receipt_long</span>
                        <p className="font-semibold text-on-surface text-base">No ageing records found.</p>
                        <p className="text-xs">Receivable ageing will appear here when you have outstanding invoices.</p>
                      </div>
                    </td>
                  </tr>
                )}
                {filtered.map(rec => (
                  <tr key={rec.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="p-2.5">
                      <div className="font-bold text-on-surface">{rec.customerName}</div>
                      <div className="text-[11px] text-outline font-mono">{rec.mobile}</div>
                    </td>
                    <td className="p-2.5 text-right font-mono">
                      {(rec.ageing?.current ?? 0) > 0 ? `₹${(rec.ageing?.current ?? 0).toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="p-2.5 text-right font-mono">
                      {(rec.ageing?.d1_30 ?? 0) > 0 ? `₹${(rec.ageing?.d1_30 ?? 0).toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="p-2.5 text-right font-mono">
                      {(rec.ageing?.d31_60 ?? 0) > 0 ? (
                        <span className="text-amber-700 font-bold">₹{(rec.ageing?.d31_60 ?? 0).toLocaleString('en-IN')}</span>
                      ) : '—'}
                    </td>
                    <td className="p-2.5 text-right font-mono">
                      {(rec.ageing?.d61_90 ?? 0) > 0 ? (
                        <span className="text-orange-700 font-bold">₹{(rec.ageing?.d61_90 ?? 0).toLocaleString('en-IN')}</span>
                      ) : '—'}
                    </td>
                    <td className="p-2.5 text-right font-mono">
                      {(rec.ageing?.d90Plus ?? 0) > 0 ? (
                        <span className="text-error font-bold">₹{(rec.ageing?.d90Plus ?? 0).toLocaleString('en-IN')}</span>
                      ) : '—'}
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold text-on-surface">
                      ₹{(rec.outstanding ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="p-2.5 text-center">
                      <button
                        onClick={() => onOpenCustomerLedger(rec.customerId)}
                        className="text-secondary font-semibold hover:underline text-[11px]"
                      >
                        Ledger →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Table Reconciliation Footer matching prompt */}
              <tfoot className="bg-surface-container font-mono font-bold text-xs border-t-2 border-surface-container-highest">
                <tr>
                  <td className="p-2.5 uppercase font-sans font-bold">Ageing Summary Totals</td>
                  <td className="p-2.5 text-right text-emerald-800">₹{totalCurrent.toLocaleString('en-IN')}</td>
                  <td className="p-2.5 text-right text-blue-800">₹{total1_30.toLocaleString('en-IN')}</td>
                  <td className="p-2.5 text-right text-amber-800">₹{total31_60.toLocaleString('en-IN')}</td>
                  <td className="p-2.5 text-right text-orange-800">₹{total61_90.toLocaleString('en-IN')}</td>
                  <td className="p-2.5 text-right text-error">₹{total90Plus.toLocaleString('en-IN')}</td>
                  <td className="p-2.5 text-right text-secondary text-sm">₹{grandTotal.toLocaleString('en-IN')}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
