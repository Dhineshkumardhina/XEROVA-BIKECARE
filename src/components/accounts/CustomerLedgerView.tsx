import React, { useState } from 'react';
import { CustomerLedgerEntry, ReceivableRecord, Invoice, ReceiptVoucher } from '../../types';
import { exportToCsv } from '../../utils/exportUtils';

interface CustomerLedgerViewProps {
  receivables?: ReceivableRecord[];
  customers?: ReceivableRecord[];
  selectedCustomerId?: string;
  customerId?: string;
  onSelectCustomer: (id: string) => void;
  ledgerEntries?: CustomerLedgerEntry[];
  entries?: CustomerLedgerEntry[];
  onReceivePayment?: (cust: ReceivableRecord) => void;
  onOpenReceiptModal?: (cust: ReceivableRecord) => void;
  onNewSale?: () => void;
  onViewInvoiceDetail?: (invNumber: string) => void;
  onViewReceiptDetail?: (receiptNumber: string) => void;
  onOpenRowDetailDrawer?: (entry: CustomerLedgerEntry) => void;
  onViewEntryDetails?: (entry: CustomerLedgerEntry) => void;
  onReverseEntry?: (entry: any) => void;
  onPrintLedger?: (cust: ReceivableRecord) => void;
  userRole?: any;
}

export const CustomerLedgerView: React.FC<CustomerLedgerViewProps> = ({
  receivables: propReceivables,
  customers: propCustomers,
  selectedCustomerId: propSelectedCustomerId,
  customerId: propCustomerId,
  onSelectCustomer,
  ledgerEntries: propLedgerEntries,
  entries: propEntries,
  onReceivePayment,
  onOpenReceiptModal,
  onNewSale,
  onViewInvoiceDetail,
  onViewReceiptDetail,
  onOpenRowDetailDrawer,
  onViewEntryDetails,
  onPrintLedger
}) => {
  const receivables = propReceivables || propCustomers || [];
  const selectedCustomerId = propCustomerId || propSelectedCustomerId || 'cust-1';
  const ledgerEntries = propLedgerEntries || propEntries || [];
  const fallbackCustomer: ReceivableRecord = {
    id: 'cust-fallback',
    customerId: 'cust-1',
    customerName: 'General Workshop Customer',
    mobile: '9840123456',
    invoicesCount: 1,
    totalSales: 25000,
    received: 15000,
    outstanding: 10000,
    lastPaymentDate: '10-Sep-2026',
    status: 'PENDING',
    ageing: { current: 10000, d1_30: 0, d31_60: 0, d61_90: 0, d90Plus: 0 }
  };

  const handleReceivePayment = onReceivePayment || onOpenReceiptModal || (() => {});
  const handleRowDetail = onOpenRowDetailDrawer || onViewEntryDetails || (() => {});
  const currentCustomer = (receivables || []).find(r => r.customerId === selectedCustomerId) || receivables[0] || fallbackCustomer;
  const [dateFilter, setDateFilter] = useState<'ALL' | 'THIS_MONTH' | 'LAST_MONTH'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const openingBalance = 8500;
  const currentBalance = currentCustomer ? currentCustomer.outstanding : 42000;

  // Filter entries
  const filteredEntries = ledgerEntries.filter(entry => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchPart = entry.particular.toLowerCase().includes(q);
      const matchInv = entry.invoice && entry.invoice.toLowerCase().includes(q);
      const matchRec = entry.receiptNo && entry.receiptNo.toLowerCase().includes(q);
      if (!matchPart && !matchInv && !matchRec) return false;
    }
    return true;
  });

  const totalDebits = filteredEntries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredits = filteredEntries.reduce((sum, e) => sum + e.credit, 0);

  return (
    <div className="flex flex-col w-full pb-10 space-y-gutter animate-in fade-in duration-150">
      {/* Customer Header Card */}
      <div className="bg-surface-container-lowest p-gutter rounded shadow-xs border border-surface-container-high space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded bg-secondary/10 text-secondary flex items-center justify-center font-bold text-xl">
              <span className="material-symbols-outlined text-2xl">storefront</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-headline-lg text-headline-lg text-on-surface">
                  {currentCustomer.customerName}
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-surface-container text-outline">
                  Customer Ledger
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-outline mt-0.5 font-mono">
                <span>Mobile: <strong className="text-on-surface">{currentCustomer.mobile}</strong></span>
                <span>•</span>
                <span>Customer ID: <strong className="text-on-surface">{currentCustomer.customerId}</strong></span>
                <span>•</span>
                <span>Status: <strong className={currentCustomer.status === 'OVERDUE' ? 'text-error' : 'text-amber-700'}>{currentCustomer.status}</strong></span>
              </div>
            </div>
          </div>

          {/* Customer Selector Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-outline font-medium">Select Account:</span>
            <select
              value={selectedCustomerId}
              onChange={(e) => onSelectCustomer(e.target.value)}
              className="bg-surface-container-low border border-surface-container-high rounded px-3 py-1.5 text-xs text-on-surface font-semibold focus:outline-none focus:border-secondary cursor-pointer"
            >
              {receivables.map(r => (
                <option key={r.customerId} value={r.customerId}>
                  {r.customerName} (₹{r.outstanding.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ledger Balance Highlights & Quick Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-3 border-t border-surface-container-high gap-4">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-[11px] text-outline uppercase font-medium">Opening Balance</div>
              <div className="font-mono text-base font-bold text-on-surface">
                ₹{openingBalance.toLocaleString('en-IN')} Dr
              </div>
            </div>
            <div className="h-8 w-px bg-surface-container-high"></div>
            <div>
              <div className="text-[11px] text-outline uppercase font-medium">Total Debits (Sales)</div>
              <div className="font-mono text-base font-bold text-on-surface">
                ₹{totalDebits.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="h-8 w-px bg-surface-container-high"></div>
            <div>
              <div className="text-[11px] text-outline uppercase font-medium">Total Credits (Receipts)</div>
              <div className="font-mono text-base font-bold text-tertiary">
                ₹{totalCredits.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="h-8 w-px bg-surface-container-high"></div>
            <div>
              <div className="text-[11px] text-outline uppercase font-bold text-amber-700">Current Balance</div>
              <div className="font-mono text-xl font-bold text-amber-700">
                ₹{currentBalance.toLocaleString('en-IN')} Dr
              </div>
            </div>
          </div>

          {/* Action Buttons matching prompt: [ Receive Payment ] [ New Sale ] [ Print ] [ Export ] */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => onReceivePayment(currentCustomer)}
              className="px-3.5 py-1.5 bg-secondary hover:bg-secondary-container text-on-secondary rounded text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">receipt</span>
              <span>Receive Payment</span>
            </button>
            <button
              onClick={onNewSale}
              className="px-3.5 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
              <span>New Sale</span>
            </button>
            <button
              onClick={() => onPrintLedger(currentCustomer)}
              className="px-3 py-1.5 bg-surface-container-low hover:bg-surface-container border border-surface-container-high text-on-surface rounded text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Print</span>
            </button>
            <button
              onClick={() => {
                const headers = ['Date', 'Type', 'Voucher Number', 'Particulars', 'Debit (₹)', 'Credit (₹)', 'Running Balance (₹)'];
                const rows = ledgerEntries.map(e => [
                  e.date,
                  e.type,
                  e.voucherNumber,
                  e.particulars,
                  e.debit || 0,
                  e.credit || 0,
                  e.balance
                ]);
                exportToCsv(`Customer_Ledger_${currentCustomer.customerName.replace(/\s+/g, '_')}.csv`, headers, rows);
              }}
              className="px-3 py-1.5 bg-surface-container-low hover:bg-surface-container border border-surface-container-high text-on-surface rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-surface-container-lowest p-3 rounded shadow-xs border border-surface-container-high flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <span className="material-symbols-outlined absolute left-2.5 top-2 text-outline text-[16px]">search</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search statement particulars, invoice #, receipt #..."
            className="w-full pl-8 pr-3 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-secondary font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-outline text-xs font-medium">Period:</span>
          {(['ALL', 'THIS_MONTH', 'LAST_MONTH'] as const).map(p => (
            <button
              key={p}
              onClick={() => setDateFilter(p)}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                dateFilter === p
                  ? 'bg-secondary text-on-secondary'
                  : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
              }`}
            >
              {p.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table: Date, Particular, Invoice, Debit, Credit, Balance */}
      <div className="bg-surface-container-lowest rounded shadow-xs overflow-hidden border border-surface-container-high">
        <div className="p-3 bg-surface-container border-b border-surface-container-high flex items-center justify-between">
          <div className="text-xs font-bold text-on-surface uppercase tracking-wider">
            Statement of Account ({filteredEntries.length} Transactions)
          </div>
          <div className="text-[11px] text-outline">
            Click any row to view transaction details &amp; source document
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-surface-container-low font-label-caps text-on-surface-variant uppercase text-[10px]">
              <tr>
                <th className="p-2.5">Date</th>
                <th className="p-2.5">Particular</th>
                <th className="p-2.5">Reference / Doc</th>
                <th className="p-2.5 text-right bg-red-500/5">Debit (Dr)</th>
                <th className="p-2.5 text-right bg-emerald-500/5">Credit (Cr)</th>
                <th className="p-2.5 text-right">Running Balance</th>
                <th className="p-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-table-cell">
              {filteredEntries.map(entry => (
                <tr
                  key={entry.id}
                  onClick={() => onOpenRowDetailDrawer(entry)}
                  className="hover:bg-surface-container-low transition-colors cursor-pointer group"
                >
                  <td className="p-2.5 text-outline font-mono text-[11px] whitespace-nowrap">
                    {entry.date}
                  </td>
                  <td className="p-2.5">
                    <div className="font-semibold text-on-surface">{entry.particular}</div>
                    <div className="text-[10px] text-outline">Recorded by {entry.createdBy}</div>
                  </td>
                  <td className="p-2.5">
                    {entry.invoice ? (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewInvoiceDetail(entry.invoice!);
                        }}
                        className="px-2 py-0.5 rounded bg-surface-container font-mono font-bold text-secondary hover:underline cursor-pointer inline-block"
                      >
                        {entry.invoice}
                      </span>
                    ) : entry.receiptNo ? (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewReceiptDetail(entry.receiptNo!);
                        }}
                        className="px-2 py-0.5 rounded bg-tertiary-fixed font-mono font-bold text-on-tertiary-fixed hover:underline cursor-pointer inline-block"
                      >
                        {entry.receiptNo}
                      </span>
                    ) : (
                      <span className="text-outline font-mono">—</span>
                    )}
                  </td>
                  {/* Debit Column - visually distinct */}
                  <td className="p-2.5 text-right font-mono bg-red-500/5 border-l border-surface-container-high">
                    {entry.debit > 0 ? (
                      <div className="flex items-center justify-end gap-1 font-bold text-on-surface">
                        <span>₹{entry.debit.toLocaleString('en-IN')}</span>
                        <span className="text-[10px] font-mono px-1 rounded bg-red-100 text-red-800">Dr</span>
                      </div>
                    ) : (
                      <span className="text-outline">—</span>
                    )}
                  </td>
                  {/* Credit Column - visually distinct */}
                  <td className="p-2.5 text-right font-mono bg-emerald-500/5 border-l border-surface-container-high">
                    {entry.credit > 0 ? (
                      <div className="flex items-center justify-end gap-1 font-bold text-tertiary">
                        <span>₹{entry.credit.toLocaleString('en-IN')}</span>
                        <span className="text-[10px] font-mono px-1 rounded bg-emerald-100 text-emerald-800">Cr</span>
                      </div>
                    ) : (
                      <span className="text-outline">—</span>
                    )}
                  </td>
                  {/* Balance Column */}
                  <td className="p-2.5 text-right font-mono font-bold text-on-surface border-l border-surface-container-high">
                    ₹{entry.balance.toLocaleString('en-IN')} Dr
                  </td>
                  <td className="p-2.5 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenRowDetailDrawer(entry);
                      }}
                      className="text-secondary font-semibold hover:underline text-[11px] opacity-80 group-hover:opacity-100"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Summary Footer */}
            <tfoot className="bg-surface-container font-mono font-bold text-xs border-t-2 border-surface-container-highest">
              <tr>
                <td colSpan={3} className="p-2.5 uppercase font-sans font-bold">Total Statement Activity</td>
                <td className="p-2.5 text-right text-on-surface bg-red-500/10">
                  ₹{totalDebits.toLocaleString('en-IN')} Dr
                </td>
                <td className="p-2.5 text-right text-tertiary bg-emerald-500/10">
                  ₹{totalCredits.toLocaleString('en-IN')} Cr
                </td>
                <td className="p-2.5 text-right text-amber-700 text-sm">
                  ₹{currentBalance.toLocaleString('en-IN')} Dr
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
