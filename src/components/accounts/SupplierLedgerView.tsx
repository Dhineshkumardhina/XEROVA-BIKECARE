import React, { useState } from 'react';
import { SupplierLedgerEntry, PayableRecord, UserRole } from '../../types';
import { exportToCsv } from '../../utils/exportUtils';

interface SupplierLedgerViewProps {
  payables?: PayableRecord[];
  suppliers?: PayableRecord[];
  selectedSupplierId?: string;
  supplierId?: string;
  onSelectSupplier: (id: string) => void;
  ledgerEntries?: SupplierLedgerEntry[];
  entries?: SupplierLedgerEntry[];
  onMakePayment?: (supplier: PayableRecord) => void;
  onOpenPaymentModal?: (supplier: PayableRecord) => void;
  onNewPurchase?: () => void;
  onOpenRowDetailDrawer?: (entry: SupplierLedgerEntry) => void;
  onViewEntryDetails?: (entry: SupplierLedgerEntry) => void;
  onReverseEntry?: (entry: any) => void;
  onPrintLedger?: (supplier: PayableRecord) => void;
  userRole: UserRole;
}

export const SupplierLedgerView: React.FC<SupplierLedgerViewProps> = ({
  payables: propPayables,
  suppliers: propSuppliers,
  selectedSupplierId: propSelectedSupplierId,
  supplierId: propSupplierId,
  onSelectSupplier,
  ledgerEntries: propLedgerEntries,
  entries: propEntries,
  onMakePayment,
  onOpenPaymentModal,
  onNewPurchase,
  onOpenRowDetailDrawer,
  onViewEntryDetails,
  onPrintLedger,
  userRole
}) => {
  const fallbackSupplier: PayableRecord = {
    id: 'sup-demo',
    supplierId: 'SUP-001',
    supplierName: 'General Spares Distributor',
    purchasesCount: 14,
    totalPurchase: 185000,
    paid: 133000,
    outstanding: 52000,
    lastPaymentDate: '10-Sep-2026',
    status: 'PENDING'
  };

  const payables = propPayables || propSuppliers || [];
  const selectedSupplierId = propSupplierId || propSelectedSupplierId || 'sup-1';
  const ledgerEntries = propLedgerEntries || propEntries || [];
  const handlePayment = onMakePayment || onOpenPaymentModal || (() => {});
  const handleRowDetail = onOpenRowDetailDrawer || onViewEntryDetails || (() => {});
  const currentSupplier = (payables || []).find(p => p.supplierId === selectedSupplierId) || payables[0] || fallbackSupplier;
  const [searchTerm, setSearchTerm] = useState('');

  if (userRole === 'billing_operator') {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-surface-container-lowest rounded shadow-xs border border-surface-container-high text-center space-y-3">
        <span className="material-symbols-outlined text-4xl text-outline">lock</span>
        <h2 className="text-base font-bold text-on-surface">Restricted by your role</h2>
        <p className="text-xs text-outline max-w-sm">
          Billing Operators do not have permission to view Supplier Accounts or disbursement records.
        </p>
      </div>
    );
  }

  const openingBalance = 12000;
  const currentPayable = currentSupplier ? currentSupplier.outstanding : 52000;

  const filtered = ledgerEntries.filter(e => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchPart = e.particular.toLowerCase().includes(q);
      const matchPO = e.purchase && e.purchase.toLowerCase().includes(q);
      const matchPV = e.paymentNo && e.paymentNo.toLowerCase().includes(q);
      if (!matchPart && !matchPO && !matchPV) return false;
    }
    return true;
  });

  const totalDebits = filtered.reduce((s, e) => s + e.debit, 0);
  const totalCredits = filtered.reduce((s, e) => s + e.credit, 0);

  return (
    <div className="flex flex-col w-full pb-10 space-y-gutter animate-in fade-in duration-150">
      {/* Header Card */}
      <div className="bg-surface-container-lowest p-gutter rounded shadow-xs border border-surface-container-high space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
              <span className="material-symbols-outlined text-2xl">local_shipping</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-headline-lg text-headline-lg text-on-surface">
                  {currentSupplier.supplierName}
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-surface-container text-outline">
                  Vendor Ledger
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-outline mt-0.5 font-mono">
                <span>Vendor Code: <strong className="text-on-surface">{currentSupplier.supplierId}</strong></span>
                <span>•</span>
                <span>Purchases Count: <strong className="text-on-surface">{currentSupplier.purchasesCount} Orders</strong></span>
                <span>•</span>
                <span>Last Payout: <strong className="text-on-surface">{currentSupplier.lastPaymentDate}</strong></span>
              </div>
            </div>
          </div>

          {/* Supplier Dropdown Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-outline font-medium">Select Supplier:</span>
            <select
              value={selectedSupplierId}
              onChange={(e) => onSelectSupplier(e.target.value)}
              className="bg-surface-container-low border border-surface-container-high rounded px-3 py-1.5 text-xs text-on-surface font-semibold focus:outline-none focus:border-secondary cursor-pointer"
            >
              {payables.map(p => (
                <option key={p.supplierId} value={p.supplierId}>
                  {p.supplierName} (₹{p.outstanding.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Balances & Top Actions matching prompt: [ Make Payment ] [ New Purchase ] [ Print ] [ Export ] */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-3 border-t border-surface-container-high gap-4">
          <div className="flex items-center gap-6">
            <div>
              <div className="text-[11px] text-outline uppercase font-medium">Opening Balance</div>
              <div className="font-mono text-base font-bold text-on-surface">
                ₹{openingBalance.toLocaleString('en-IN')} Cr
              </div>
            </div>
            <div className="h-8 w-px bg-surface-container-high"></div>
            <div>
              <div className="text-[11px] text-outline uppercase font-medium">Total Purchases (Credits)</div>
              <div className="font-mono text-base font-bold text-on-surface">
                ₹{totalCredits.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="h-8 w-px bg-surface-container-high"></div>
            <div>
              <div className="text-[11px] text-outline uppercase font-medium">Total Payments (Debits)</div>
              <div className="font-mono text-base font-bold text-tertiary">
                ₹{totalDebits.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="h-8 w-px bg-surface-container-high"></div>
            <div>
              <div className="text-[11px] text-outline uppercase font-bold text-error">Current Payable</div>
              <div className="font-mono text-xl font-bold text-error">
                ₹{currentPayable.toLocaleString('en-IN')} Cr
              </div>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => onMakePayment(currentSupplier)}
              className="px-3.5 py-1.5 bg-primary hover:bg-primary/90 text-on-primary rounded text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">payments</span>
              <span>Make Payment</span>
            </button>
            <button
              onClick={onNewPurchase}
              className="px-3.5 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
              <span>New Purchase</span>
            </button>
            <button
              onClick={() => onPrintLedger(currentSupplier)}
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
                exportToCsv(`Supplier_Ledger_${currentSupplier.supplierName.replace(/\s+/g, '_')}.csv`, headers, rows);
              }}
              className="px-3 py-1.5 bg-surface-container-low hover:bg-surface-container border border-surface-container-high text-on-surface rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-surface-container-lowest p-3 rounded shadow-xs border border-surface-container-high">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-2.5 top-2 text-outline text-[16px]">search</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search particulars, PO #, or payment voucher #..."
            className="w-full pl-8 pr-3 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-secondary font-medium"
          />
        </div>
      </div>

      {/* Supplier Ledger Table: Date, Particular, Purchase, Payment, Debit, Credit, Balance */}
      <div className="bg-surface-container-lowest rounded shadow-xs overflow-hidden border border-surface-container-high">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-surface-container font-label-caps text-on-surface-variant uppercase text-[10px]">
              <tr>
                <th className="p-2.5">Date</th>
                <th className="p-2.5">Particular</th>
                <th className="p-2.5">Purchase (PO)</th>
                <th className="p-2.5">Payment (Voucher)</th>
                <th className="p-2.5 text-right bg-emerald-500/5">Debit (Payment)</th>
                <th className="p-2.5 text-right bg-red-500/5">Credit (Purchase)</th>
                <th className="p-2.5 text-right">Balance (Cr)</th>
                <th className="p-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-table-cell">
              {filtered.map(entry => (
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
                    <div className="text-[10px] text-outline">Authorized by {entry.createdBy}</div>
                  </td>
                  <td className="p-2.5 font-mono">
                    {entry.purchase ? (
                      <span className="px-2 py-0.5 rounded bg-surface-container font-bold text-secondary">
                        {entry.purchase}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="p-2.5 font-mono">
                    {entry.paymentNo ? (
                      <span className="px-2 py-0.5 rounded bg-primary-container font-bold text-on-primary-container">
                        {entry.paymentNo}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="p-2.5 text-right font-mono bg-emerald-500/5 font-bold text-tertiary">
                    {entry.debit > 0 ? `₹${entry.debit.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="p-2.5 text-right font-mono bg-red-500/5 font-bold text-error">
                    {entry.credit > 0 ? `₹${entry.credit.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="p-2.5 text-right font-mono font-bold text-on-surface">
                    ₹{entry.balance.toLocaleString('en-IN')} Cr
                  </td>
                  <td className="p-2.5 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenRowDetailDrawer(entry);
                      }}
                      className="text-secondary font-semibold hover:underline text-[11px]"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Table Footer */}
            <tfoot className="bg-surface-container font-mono font-bold text-xs border-t-2 border-surface-container-highest">
              <tr>
                <td colSpan={4} className="p-2.5 uppercase font-sans font-bold">Total Statement Balance</td>
                <td className="p-2.5 text-right text-tertiary bg-emerald-500/10">₹{totalDebits.toLocaleString('en-IN')} Dr</td>
                <td className="p-2.5 text-right text-error bg-red-500/10">₹{totalCredits.toLocaleString('en-IN')} Cr</td>
                <td className="p-2.5 text-right text-error text-sm">₹{currentPayable.toLocaleString('en-IN')} Cr</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
