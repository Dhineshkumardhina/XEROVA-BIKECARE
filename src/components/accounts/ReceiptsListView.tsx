import React, { useState } from 'react';
import { ReceiptVoucher, UserRole } from '../../types';

interface ReceiptsListViewProps {
  receipts: ReceiptVoucher[];
  onOpenNewReceipt: () => void;
  onViewReceipt: (receipt: ReceiptVoucher) => void;
  onPrintReceipt: (receipt: ReceiptVoucher) => void;
  onRequestVoidReceipt: (receipt: ReceiptVoucher) => void;
  userRole: UserRole;
}

export const ReceiptsListView: React.FC<ReceiptsListViewProps> = ({
  receipts,
  onOpenNewReceipt,
  onViewReceipt,
  onPrintReceipt,
  onRequestVoidReceipt,
  userRole
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modeFilter, setModeFilter] = useState<'ALL' | 'Cash' | 'UPI' | 'Bank' | 'Cheque'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Void' | 'Reversed'>('ALL');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH'>('ALL');

  const filteredReceipts = receipts.filter(r => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchNo = r.receiptNo.toLowerCase().includes(q);
      const matchCust = r.customerName.toLowerCase().includes(q);
      const matchRef = r.refNo && r.refNo.toLowerCase().includes(q);
      const matchInv = r.invoiceRef && r.invoiceRef.toLowerCase().includes(q);
      if (!matchNo && !matchCust && !matchRef && !matchInv) return false;
    }
    if (modeFilter !== 'ALL' && r.paymentMode !== modeFilter) return false;
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    return true;
  });

  const totalReceiptsAmount = filteredReceipts
    .filter(r => r.status === 'Active')
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="flex flex-col w-full pb-10 space-y-gutter animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface-container-lowest p-gutter rounded shadow-xs gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Receipt Vouchers</h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-tertiary-fixed text-on-tertiary-fixed">
              Total Realized: ₹{totalReceiptsAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Collection receipts recorded against customer balances, invoices, and advance payments
          </p>
        </div>

        <button
          onClick={onOpenNewReceipt}
          className="px-4 py-2 bg-secondary hover:bg-secondary-container text-on-secondary rounded text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>+ New Receipt</span>
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
            placeholder="Search receipt # (e.g. RV-00291), customer name, or payment ref..."
            className="w-full pl-8 pr-3 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-secondary font-medium"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Payment Mode Filter */}
          <div className="flex items-center gap-1">
            <span className="text-outline text-[11px] font-medium">Mode:</span>
            {(['ALL', 'Cash', 'UPI', 'Bank', 'Cheque'] as const).map(m => (
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

          {/* Date Filter */}
          <div className="flex items-center gap-1">
            <span className="text-outline text-[11px] font-medium">Date:</span>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="bg-surface-container-low border border-surface-container-high rounded px-2 py-1 text-xs text-on-surface font-semibold focus:outline-none"
            >
              <option value="ALL">All Dates</option>
              <option value="TODAY">Today</option>
              <option value="THIS_WEEK">This Week</option>
              <option value="THIS_MONTH">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="bg-surface-container-lowest rounded shadow-xs overflow-hidden border border-surface-container-high">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-surface-container font-label-caps text-on-surface-variant uppercase text-[10px]">
              <tr>
                <th className="p-2.5">Receipt No</th>
                <th className="p-2.5">Customer</th>
                <th className="p-2.5">Invoice Reference</th>
                <th className="p-2.5 text-right">Amount (₹)</th>
                <th className="p-2.5">Payment Mode</th>
                <th className="p-2.5">Date &amp; Time</th>
                <th className="p-2.5">Created By</th>
                <th className="p-2.5 text-center">Status</th>
                <th className="p-2.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-table-cell">
              {filteredReceipts.map(r => (
                <tr key={r.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="p-2.5 font-mono font-bold text-secondary">
                    {r.receiptNo}
                  </td>
                  <td className="p-2.5">
                    <div className="font-bold text-on-surface">{r.customerName}</div>
                    <div className="text-[11px] text-outline font-mono">{r.customerMobile}</div>
                  </td>
                  <td className="p-2.5">
                    {r.invoiceRef ? (
                      <span className="px-1.5 py-0.5 rounded bg-surface-container font-mono text-[11px] font-semibold text-on-surface">
                        {r.invoiceRef}
                      </span>
                    ) : (
                      <span className="text-outline italic text-[11px]">On-Account</span>
                    )}
                  </td>
                  <td className="p-2.5 text-right font-mono font-bold text-sm text-tertiary">
                    ₹{r.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="p-2.5">
                    <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-mono text-[11px]">
                      {r.paymentMode}
                    </span>
                    {r.refNo && (
                      <div className="text-[10px] text-outline truncate max-w-[140px] font-mono mt-0.5">
                        {r.refNo}
                      </div>
                    )}
                  </td>
                  <td className="p-2.5 text-outline text-[11px]">
                    <div>{r.date}</div>
                    <div className="text-[10px]">{r.time}</div>
                  </td>
                  <td className="p-2.5 text-outline text-[11px]">
                    {r.createdBy}
                  </td>
                  <td className="p-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                      r.status === 'Active'
                        ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                        : 'bg-error-container text-on-error-container'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-2.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onViewReceipt(r)}
                        className="p-1 rounded hover:bg-surface-container text-secondary"
                        title="View Receipt Details"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                      </button>
                      <button
                        onClick={() => onPrintReceipt(r)}
                        className="p-1 rounded hover:bg-surface-container text-on-surface"
                        title="Print Receipt Voucher"
                      >
                        <span className="material-symbols-outlined text-[16px]">print</span>
                      </button>
                      <button
                        onClick={() => onPrintReceipt(r)}
                        className="p-1 rounded hover:bg-surface-container text-outline hover:text-on-surface"
                        title="Download / Print PDF"
                      >
                        <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                      </button>
                      {userRole !== 'billing_operator' && r.status === 'Active' && (
                        <button
                          onClick={() => onRequestVoidReceipt(r)}
                          className="p-1 rounded hover:bg-error-container text-outline hover:text-error"
                          title="Void / Reverse Receipt"
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
