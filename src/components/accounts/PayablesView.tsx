import React, { useState } from 'react';
import { PayableRecord, UserRole } from '../../types';

interface PayablesViewProps {
  payables: PayableRecord[];
  onOpenSupplierLedger: (supplierId: string) => void;
  onMakePayment: (supplier: PayableRecord) => void;
  onOpenNewPayment: () => void;
  userRole: UserRole;
}

export const PayablesView: React.FC<PayablesViewProps> = ({
  payables,
  onOpenSupplierLedger,
  onMakePayment,
  onOpenNewPayment,
  userRole
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING' | 'OVERDUE'>('ALL');

  if (userRole === 'billing_operator') {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-surface-container-lowest rounded shadow-xs border border-surface-container-high text-center space-y-3">
        <span className="material-symbols-outlined text-4xl text-outline">lock</span>
        <h2 className="text-base font-bold text-on-surface">Restricted by your role</h2>
        <p className="text-xs text-outline max-w-sm">
          Billing Operators are restricted from accessing Supplier Payables and disbursement records. Please switch to Manager, Admin, or Super Admin.
        </p>
      </div>
    );
  }

  const filtered = payables.filter(p => {
    if (searchTerm && !p.supplierName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    return true;
  });

  const totalOutstanding = payables.reduce((s, p) => s + (p.outstanding || 0), 0);
  const totalPurchases = payables.reduce((s, p) => s + (p.totalPurchase ?? (p as any).totalPurchases ?? 0), 0);
  const totalPaid = payables.reduce((s, p) => s + (p.paid || 0), 0);

  return (
    <div className="flex flex-col w-full pb-10 space-y-gutter animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface-container-lowest p-gutter rounded shadow-xs gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Supplier Payables</h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-error/10 text-error border border-error/20">
              Total Payables: ₹{totalOutstanding.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Track OEM parts vendors, purchase invoice obligations, and payout schedules
          </p>
        </div>

        <button
          onClick={onOpenNewPayment}
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]">payments</span>
          <span>+ Make Supplier Payment</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-space-sm">
        <div className="bg-surface-container-lowest p-3 rounded shadow-xs border-l-4 border-l-error">
          <div className="text-[10px] font-bold text-outline uppercase tracking-wider">Total Outstanding Payables</div>
          <div className="font-mono text-xl font-bold text-error mt-0.5">
            ₹{totalOutstanding.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-outline mt-1">Across 5 Primary OEM Vendors</div>
        </div>

        <div className="bg-surface-container-lowest p-3 rounded shadow-xs border border-surface-container-high">
          <div className="text-[10px] font-bold text-outline uppercase tracking-wider">Total Purchases (YTD)</div>
          <div className="font-mono text-xl font-bold text-on-surface mt-0.5">
            ₹{totalPurchases.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-outline mt-1">59 Verified GRN Consignments</div>
        </div>

        <div className="bg-surface-container-lowest p-3 rounded shadow-xs border border-surface-container-high">
          <div className="text-[10px] font-bold text-outline uppercase tracking-wider">Total Paid Disbursed</div>
          <div className="font-mono text-xl font-bold text-tertiary mt-0.5">
            ₹{totalPaid.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-outline mt-1">94.2% Settlement Rate</div>
        </div>

        <div className="bg-surface-container-lowest p-3 rounded shadow-xs border border-surface-container-high">
          <div className="text-[10px] font-bold text-outline uppercase tracking-wider">Average Credit Term</div>
          <div className="font-mono text-xl font-bold text-secondary mt-0.5">
            30 Days Net
          </div>
          <div className="text-[10px] text-outline mt-1">Next Payout: 15 Sep 2026</div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface-container-lowest p-3 rounded shadow-xs border border-surface-container-high flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <span className="material-symbols-outlined absolute left-2.5 top-2 text-outline text-[16px]">search</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search supplier name (e.g. TVS Motors, Bajaj Auto, Rolon)..."
            className="w-full pl-8 pr-3 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-secondary font-medium"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-outline text-[11px] font-medium">Status:</span>
          {(['ALL', 'PENDING', 'OVERDUE', 'PAID'] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                statusFilter === s
                  ? 'bg-secondary text-on-secondary'
                  : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Payables Table matching prompt */}
      <div className="bg-surface-container-lowest rounded shadow-xs overflow-hidden border border-surface-container-high">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-surface-container font-label-caps text-on-surface-variant uppercase text-[10px]">
              <tr>
                <th className="p-2.5">Supplier</th>
                <th className="p-2.5 text-center">Purchases</th>
                <th className="p-2.5 text-right">Total Purchase</th>
                <th className="p-2.5 text-right">Paid</th>
                <th className="p-2.5 text-right">Outstanding</th>
                <th className="p-2.5">Last Payment</th>
                <th className="p-2.5 text-center">Status</th>
                <th className="p-2.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-table-cell">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="p-2.5">
                    <div className="font-bold text-on-surface text-sm">{p.supplierName}</div>
                    <div className="text-[11px] text-outline">Supplier ID: {p.supplierId}</div>
                  </td>
                  <td className="p-2.5 text-center font-mono font-bold text-on-surface">
                    {p.purchasesCount ?? 0}
                  </td>
                  <td className="p-2.5 text-right font-mono text-on-surface font-medium">
                    ₹{(p.totalPurchase ?? (p as any).totalPurchases ?? 0).toLocaleString('en-IN')}
                  </td>
                  <td className="p-2.5 text-right font-mono text-tertiary font-medium">
                    ₹{(p.paid ?? 0).toLocaleString('en-IN')}
                  </td>
                  <td className="p-2.5 text-right font-mono font-bold text-error text-base">
                    ₹{(p.outstanding ?? 0).toLocaleString('en-IN')}
                  </td>
                  <td className="p-2.5 text-outline text-[11px]">{p.lastPaymentDate || 'Recent'}</td>
                  <td className="p-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                      p.status === 'OVERDUE'
                        ? 'bg-error-container text-on-error-container'
                        : p.status === 'PENDING'
                        ? 'bg-amber-500/15 text-amber-800'
                        : 'bg-tertiary-fixed text-on-tertiary-fixed'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-2.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onOpenSupplierLedger(p.supplierId)}
                        className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-secondary text-[11px] font-bold flex items-center gap-1"
                        title="View Supplier Statement Ledger"
                      >
                        <span className="material-symbols-outlined text-[14px]">menu_book</span>
                        <span>Ledger</span>
                      </button>
                      <button
                        onClick={() => onMakePayment(p)}
                        className="px-2 py-1 rounded bg-primary hover:bg-primary/90 text-on-primary text-[11px] font-bold flex items-center gap-1 shadow-xs"
                        title="Create Supplier Disbursement Voucher"
                      >
                        <span className="material-symbols-outlined text-[14px]">payments</span>
                        <span>Pay</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Table Reconciliation Footer */}
            <tfoot className="bg-surface-container font-mono font-bold text-xs border-t-2 border-surface-container-highest">
              <tr>
                <td className="p-2.5 uppercase font-sans font-bold">Total Supplier Payables</td>
                <td className="p-2.5 text-center font-mono">49 Orders</td>
                <td className="p-2.5 text-right font-mono text-on-surface">₹{totalPurchases.toLocaleString('en-IN')}</td>
                <td className="p-2.5 text-right font-mono text-tertiary">₹{totalPaid.toLocaleString('en-IN')}</td>
                <td className="p-2.5 text-right font-mono text-error text-sm">₹{totalOutstanding.toLocaleString('en-IN')}</td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
