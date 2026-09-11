import React, { useState } from 'react';
import { PaymentVoucher, UserRole } from '../../types';

interface PaymentsListViewProps {
  payments: PaymentVoucher[];
  onOpenNewPayment: () => void;
  onViewPayment: (payment: PaymentVoucher) => void;
  onPrintPayment: (payment: PaymentVoucher) => void;
  onRequestVoidPayment: (payment: PaymentVoucher) => void;
  userRole: UserRole;
}

export const PaymentsListView: React.FC<PaymentsListViewProps> = ({
  payments,
  onOpenNewPayment,
  onViewPayment,
  onPrintPayment,
  onRequestVoidPayment,
  userRole
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modeFilter, setModeFilter] = useState<'ALL' | 'Cash' | 'Bank' | 'UPI' | 'Cheque'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Void' | 'Reversed'>('ALL');

  if (userRole === 'billing_operator') {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-surface-container-lowest rounded shadow-xs border border-surface-container-high text-center space-y-3">
        <span className="material-symbols-outlined text-4xl text-outline">lock</span>
        <h2 className="text-base font-bold text-on-surface">Restricted by your role</h2>
        <p className="text-xs text-outline max-w-sm">
          Billing Operators are not permitted to manage or disburse Supplier Payment Vouchers.
        </p>
      </div>
    );
  }

  const filtered = payments.filter(p => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchNo = p.paymentNo.toLowerCase().includes(q);
      const matchSup = p.supplierName.toLowerCase().includes(q);
      const matchRef = p.reference && p.reference.toLowerCase().includes(q);
      const matchUtr = p.refNo && p.refNo.toLowerCase().includes(q);
      if (!matchNo && !matchSup && !matchRef && !matchUtr) return false;
    }
    if (modeFilter !== 'ALL' && p.paymentMode !== modeFilter) return false;
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    return true;
  });

  const totalPaidAmount = filtered
    .filter(p => p.status === 'Active')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="flex flex-col w-full pb-10 space-y-gutter animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface-container-lowest p-gutter rounded shadow-xs gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Payment Vouchers</h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-primary-container text-on-primary-container">
              Total Disbursed: ₹{totalPaidAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Vendor payout vouchers, bank transfers, cheques, and cash disbursements
          </p>
        </div>

        <button
          onClick={onOpenNewPayment}
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]">payments</span>
          <span>+ New Payment</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface-container-lowest p-3 rounded shadow-xs border border-surface-container-high flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <span className="material-symbols-outlined absolute left-2.5 top-2 text-outline text-[16px]">search</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search payment voucher # (e.g. PV-00181), supplier, or bank ref..."
            className="w-full pl-8 pr-3 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-secondary font-medium"
          />
        </div>

        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span className="text-outline text-[11px] font-medium">Mode:</span>
          {(['ALL', 'Cash', 'Bank', 'UPI', 'Cheque'] as const).map(m => (
            <button
              key={m}
              onClick={() => setModeFilter(m)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                modeFilter === m
                  ? 'bg-secondary text-on-secondary'
                  : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-surface-container-lowest rounded shadow-xs overflow-hidden border border-surface-container-high">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-surface-container font-label-caps text-on-surface-variant uppercase text-[10px]">
              <tr>
                <th className="p-2.5">Payment No</th>
                <th className="p-2.5">Supplier</th>
                <th className="p-2.5">Reference (PO/Bill)</th>
                <th className="p-2.5 text-right">Amount (₹)</th>
                <th className="p-2.5">Payment Mode</th>
                <th className="p-2.5">Date &amp; Time</th>
                <th className="p-2.5">Approved By</th>
                <th className="p-2.5 text-center">Status</th>
                <th className="p-2.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-table-cell">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="p-2.5 font-mono font-bold text-primary">
                    {p.paymentNo}
                  </td>
                  <td className="p-2.5">
                    <div className="font-bold text-on-surface">{p.supplierName}</div>
                    <div className="text-[11px] text-outline font-mono">Vendor: {p.supplierId}</div>
                  </td>
                  <td className="p-2.5 font-mono text-outline font-semibold">
                    {p.reference || 'On-Account'}
                  </td>
                  <td className="p-2.5 text-right font-mono font-bold text-sm text-error">
                    ₹{p.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="p-2.5">
                    <span className="px-2 py-0.5 rounded bg-surface-container font-mono text-[11px]">
                      {p.paymentMode}
                    </span>
                    {p.refNo && (
                      <div className="text-[10px] text-outline truncate max-w-[140px] font-mono mt-0.5">
                        {p.refNo}
                      </div>
                    )}
                  </td>
                  <td className="p-2.5 text-outline text-[11px]">
                    <div>{p.date}</div>
                    <div className="text-[10px]">{p.time}</div>
                  </td>
                  <td className="p-2.5 text-outline text-[11px]">
                    {p.approvedBy || p.createdBy}
                  </td>
                  <td className="p-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                      p.status === 'Active'
                        ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                        : 'bg-error-container text-on-error-container'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-2.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onViewPayment(p)}
                        className="p-1 rounded hover:bg-surface-container text-secondary"
                        title="View Payment Details"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                      </button>
                      <button
                        onClick={() => onPrintPayment(p)}
                        className="p-1 rounded hover:bg-surface-container text-on-surface"
                        title="Print Payment Voucher"
                      >
                        <span className="material-symbols-outlined text-[16px]">print</span>
                      </button>
                      <button
                        onClick={() => alert(`Generated PDF for Payment ${p.paymentNo}`)}
                        className="p-1 rounded hover:bg-surface-container text-outline"
                        title="Download PDF"
                      >
                        <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                      </button>
                      {p.status === 'Active' && (
                        <button
                          onClick={() => onRequestVoidPayment(p)}
                          className="p-1 rounded hover:bg-error-container text-outline hover:text-error"
                          title="Void / Reverse Payment Voucher"
                        >
                          <span className="material-symbols-outlined text-[16px]">undo</span>
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
    </div>
  );
};
