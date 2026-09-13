import React, { useState } from 'react';
import { BankingAccount, BankTransaction, UserRole } from '../../types';

interface BankingDashboardViewProps {
  accounts: BankingAccount[];
  transactions: BankTransaction[];
  onOpenDeposit: () => void;
  onOpenWithdrawal: () => void;
  onOpenTransfer: () => void;
  onToggleReconcile?: (txId: string) => void;
  userRole: UserRole;
}

export const BankingDashboardView: React.FC<BankingDashboardViewProps> = ({
  accounts,
  transactions,
  onOpenDeposit,
  onOpenWithdrawal,
  onOpenTransfer,
  userRole
}) => {
  const [activeTab, setActiveTab] = useState<'transactions' | 'cashbook' | 'bankbook'>('transactions');
  const [accountFilter, setAccountFilter] = useState<'ALL' | 'Cash' | 'Bank' | 'UPI'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'Deposit' | 'Withdrawal' | 'Transfer' | 'Receipt' | 'Payment'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const cashAcc = accounts.find(a => a.type === 'Cash') || { balance: 85400 };
  const bankAcc = accounts.find(a => a.type === 'Bank') || { balance: 428600 };
  const upiAcc = accounts.find(a => a.type === 'UPI') || { balance: 62300 };

  const filteredTransactions = transactions.filter(t => {
    if (accountFilter !== 'ALL' && t.account !== accountFilter) return false;
    if (typeFilter !== 'ALL' && t.type !== typeFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchDesc = t.description.toLowerCase().includes(q);
      const matchRef = t.reference.toLowerCase().includes(q);
      if (!matchDesc && !matchRef) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full pb-10 space-y-gutter animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface-container-lowest p-gutter rounded shadow-xs gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Banking &amp; Cash Management</h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-tertiary-fixed text-on-tertiary-fixed">
              Total Liquidity: ₹{(cashAcc.balance + bankAcc.balance + upiAcc.balance).toLocaleString('en-IN')}
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Cash register in-drawer balance, HDFC current account, UPI settlements, and daily Contra transfers
          </p>
        </div>

        {/* Quick Actions: Cash Deposit, Cash Withdrawal, Fund Transfer */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenDeposit}
            className="px-3.5 py-1.5 bg-secondary hover:bg-secondary-container text-on-secondary rounded text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">south</span>
            <span>Cash Deposit</span>
          </button>
          <button
            onClick={onOpenWithdrawal}
            className="px-3.5 py-1.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded text-xs font-bold flex items-center gap-1.5 transition-colors border border-surface-container-highest"
          >
            <span className="material-symbols-outlined text-[16px]">north</span>
            <span>Cash Withdrawal</span>
          </button>
          <button
            onClick={onOpenTransfer}
            className="px-3.5 py-1.5 bg-primary hover:bg-primary/90 text-on-primary rounded text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">sync_alt</span>
            <span>Fund Transfer</span>
          </button>
        </div>
      </div>

      {/* Account Balances & Daily Flow KPI Cards (6 Metrics) matching prompt */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-space-sm">
        {/* Cash Balance */}
        <div className="bg-surface-container-lowest p-3.5 rounded shadow-xs border-l-4 border-l-emerald-600 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Cash Balance</span>
            <span className="material-symbols-outlined text-emerald-600 text-[16px]">point_of_sale</span>
          </div>
          <div className="font-mono text-lg font-bold text-emerald-700">
            ₹{cashAcc.balance.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-outline">Counter Register</div>
        </div>

        {/* Bank Balance */}
        <div className="bg-surface-container-lowest p-3.5 rounded shadow-xs border-l-4 border-l-secondary space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Bank Balance</span>
            <span className="material-symbols-outlined text-secondary text-[16px]">account_balance</span>
          </div>
          <div className="font-mono text-lg font-bold text-secondary">
            ₹{bankAcc.balance.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-outline">HDFC Current A/c</div>
        </div>

        {/* UPI Balance */}
        <div className="bg-surface-container-lowest p-3.5 rounded shadow-xs border-l-4 border-l-blue-500 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">UPI Balance</span>
            <span className="material-symbols-outlined text-blue-500 text-[16px]">qr_code_2</span>
          </div>
          <div className="font-mono text-lg font-bold text-blue-600">
            ₹{upiAcc.balance.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-outline">ICICI QR Hub</div>
        </div>

        {/* Today's Cash In */}
        <div className="bg-surface-container-lowest p-3.5 rounded shadow-xs border-l-4 border-l-teal-600 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Today's Cash In</span>
            <span className="material-symbols-outlined text-teal-600 text-[16px]">arrow_downward</span>
          </div>
          <div className="font-mono text-lg font-bold text-teal-700">
            +₹43,000
          </div>
          <div className="text-[10px] text-outline">Counter Collections</div>
        </div>

        {/* Today's Cash Out */}
        <div className="bg-surface-container-lowest p-3.5 rounded shadow-xs border-l-4 border-l-amber-600 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Today's Cash Out</span>
            <span className="material-symbols-outlined text-amber-600 text-[16px]">arrow_upward</span>
          </div>
          <div className="font-mono text-lg font-bold text-amber-700">
            -₹20,000
          </div>
          <div className="text-[10px] text-outline">Bank Drops &amp; Freight</div>
        </div>

        {/* Today's Bank Transactions */}
        <div className="bg-surface-container-lowest p-3.5 rounded shadow-xs border-l-4 border-l-purple-600 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Today's Bank Tx</span>
            <span className="material-symbols-outlined text-purple-600 text-[16px]">receipt_long</span>
          </div>
          <div className="font-mono text-lg font-bold text-purple-700">
            5 Cleared
          </div>
          <div className="text-[10px] text-outline">100% Reconciled</div>
        </div>
      </div>

      {/* Tabs Navigation: Bank Transactions, Cash Book, Bank Book */}
      <div className="flex items-center justify-between bg-surface-container-lowest p-2 rounded border border-surface-container-high">
        <div className="flex gap-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3.5 py-1.5 rounded transition-colors ${
              activeTab === 'transactions'
                ? 'bg-secondary text-on-secondary font-bold shadow-xs'
                : 'text-on-surface hover:bg-surface-container'
            }`}
          >
            Bank &amp; Cash Transactions
          </button>
          <button
            onClick={() => setActiveTab('cashbook')}
            className={`px-3.5 py-1.5 rounded transition-colors ${
              activeTab === 'cashbook'
                ? 'bg-secondary text-on-secondary font-bold shadow-xs'
                : 'text-on-surface hover:bg-surface-container'
            }`}
          >
            Cash Book (Counter Register)
          </button>
          <button
            onClick={() => setActiveTab('bankbook')}
            className={`px-3.5 py-1.5 rounded transition-colors ${
              activeTab === 'bankbook'
                ? 'bg-secondary text-on-secondary font-bold shadow-xs'
                : 'text-on-surface hover:bg-surface-container'
            }`}
          >
            Bank Book (HDFC Reconciliation)
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => alert('Exporting statements to Excel spreadsheet...')}
            className="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container border border-surface-container-high text-on-surface flex items-center gap-1 font-semibold"
          >
            <span className="material-symbols-outlined text-[14px]">file_download</span>
            <span>Excel</span>
          </button>
          <button
            onClick={() => alert('Exporting official statement PDF...')}
            className="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container border border-surface-container-high text-on-surface flex items-center gap-1 font-semibold"
          >
            <span className="material-symbols-outlined text-[14px]">picture_as_pdf</span>
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Bank Transactions Table */}
      {activeTab === 'transactions' && (
        <div className="space-y-3">
          {/* Filters Bar */}
          <div className="bg-surface-container-lowest p-3 rounded shadow-xs border border-surface-container-high flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 min-w-[220px]">
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-outline text-[16px]">search</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search description, reference UTR, or counter slip..."
                className="w-full pl-8 pr-3 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-secondary font-medium"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                <span className="text-outline text-[11px] font-medium">Account:</span>
                {(['ALL', 'Cash', 'Bank', 'UPI'] as const).map(acc => (
                  <button
                    key={acc}
                    onClick={() => setAccountFilter(acc)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                      accountFilter === acc
                        ? 'bg-secondary text-on-secondary'
                        : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                    }`}
                  >
                    {acc}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1">
                <span className="text-outline text-[11px] font-medium">Type:</span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="bg-surface-container-low border border-surface-container-high rounded px-2 py-1 text-xs text-on-surface font-semibold focus:outline-none"
                >
                  <option value="ALL">All Types</option>
                  <option value="Deposit">Deposit</option>
                  <option value="Withdrawal">Withdrawal</option>
                  <option value="Transfer">Transfer</option>
                  <option value="Receipt">Receipt</option>
                  <option value="Payment">Payment</option>
                </select>
              </div>
            </div>
          </div>

          {/* Transactions Table: Date, Reference, Description, Account, Debit, Credit, Balance */}
          <div className="bg-surface-container-lowest rounded shadow-xs overflow-hidden border border-surface-container-high">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-surface-container font-label-caps text-on-surface-variant uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Date &amp; Time</th>
                    <th className="p-2.5">Reference</th>
                    <th className="p-2.5">Description</th>
                    <th className="p-2.5 text-center">Account</th>
                    <th className="p-2.5 text-right">Debit (₹)</th>
                    <th className="p-2.5 text-right">Credit (₹)</th>
                    <th className="p-2.5 text-right">Resulting Balance</th>
                    <th className="p-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high font-table-cell">
                  {filteredTransactions.map(t => (
                    <tr key={t.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="p-2.5 text-outline font-mono text-[11px] whitespace-nowrap">
                        {t.date} {t.time}
                      </td>
                      <td className="p-2.5 font-mono font-bold text-secondary">
                        {t.reference}
                      </td>
                      <td className="p-2.5">
                        <div className="font-semibold text-on-surface">{t.description}</div>
                        <span className="text-[10px] text-outline uppercase font-mono">{t.type}</span>
                      </td>
                      <td className="p-2.5 text-center">
                        <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-mono text-[11px]">
                          {t.account}
                        </span>
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-error">
                        {t.debit > 0 ? `₹${t.debit.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-tertiary">
                        {t.credit > 0 ? `₹${t.credit.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-on-surface">
                        ₹{t.balance.toLocaleString('en-IN')}
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => {
                            if (userRole === 'billing_operator') {
                              alert('Reconciliation permissions restricted for Billing Operators.');
                              return;
                            }
                            if (onToggleReconcile) onToggleReconcile(t.id);
                          }}
                          className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase tracking-wider transition-colors ${
                            t.status === 'Reconciled'
                              ? 'bg-tertiary-fixed text-on-tertiary-fixed hover:bg-tertiary-fixed/80'
                              : 'bg-amber-500/20 text-amber-800 hover:bg-amber-500/30'
                          }`}
                          title={userRole !== 'billing_operator' ? 'Click to toggle reconciliation state' : 'Restricted'}
                        >
                          {t.status === 'Reconciled' ? '✓ RECONCILED' : 'UNRECONCILED'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Cash Book */}
      {activeTab === 'cashbook' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-space-sm">
            <div className="bg-surface-container-lowest p-3 rounded shadow-xs border border-surface-container-high">
              <span className="text-[10px] text-outline uppercase font-bold">Opening Cash (01/09)</span>
              <div className="font-mono text-lg font-bold text-on-surface mt-0.5">₹65,400</div>
            </div>
            <div className="bg-surface-container-lowest p-3 rounded shadow-xs border border-surface-container-high">
              <span className="text-[10px] text-tertiary uppercase font-bold">Total Cash Receipts</span>
              <div className="font-mono text-lg font-bold text-tertiary mt-0.5">+₹72,000</div>
            </div>
            <div className="bg-surface-container-lowest p-3 rounded shadow-xs border border-surface-container-high">
              <span className="text-[10px] text-error uppercase font-bold">Total Cash Disbursements</span>
              <div className="font-mono text-lg font-bold text-error mt-0.5">-₹52,000</div>
            </div>
            <div className="bg-surface-container-lowest p-3 rounded shadow-xs border-l-4 border-l-emerald-600">
              <span className="text-[10px] text-emerald-800 uppercase font-bold">Closing Cash in Drawer</span>
              <div className="font-mono text-lg font-bold text-emerald-700 mt-0.5">₹85,400</div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded shadow-xs overflow-hidden border border-surface-container-high">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-surface-container font-label-caps text-on-surface-variant uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Particular</th>
                  <th className="p-2.5 text-right text-tertiary">Receipt (Inflow)</th>
                  <th className="p-2.5 text-right text-error">Payment (Outflow)</th>
                  <th className="p-2.5 text-right">Cash Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high font-table-cell font-mono">
                <tr>
                  <td className="p-2.5 text-outline">01/09/2026</td>
                  <td className="p-2.5 font-sans font-semibold text-on-surface">Opening Cash in Hand</td>
                  <td className="p-2.5 text-right text-outline">—</td>
                  <td className="p-2.5 text-right text-outline">—</td>
                  <td className="p-2.5 text-right font-bold text-on-surface">₹65,400.00</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-outline">03/09/2026</td>
                  <td className="p-2.5 font-sans">Payment to Rolon Transmission logistics rep</td>
                  <td className="p-2.5 text-right text-outline">—</td>
                  <td className="p-2.5 text-right font-bold text-error">₹15,000.00</td>
                  <td className="p-2.5 text-right font-bold text-on-surface">₹50,400.00</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-outline">08/09/2026</td>
                  <td className="p-2.5 font-sans">Counter Cash Receipt (Sri Balaji Motors RV-00290)</td>
                  <td className="p-2.5 text-right font-bold text-tertiary">₹12,000.00</td>
                  <td className="p-2.5 text-right text-outline">—</td>
                  <td className="p-2.5 text-right font-bold text-on-surface">₹62,400.00</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-outline">09/09/2026</td>
                  <td className="p-2.5 font-sans">Daily Retail Counter Cash Sales</td>
                  <td className="p-2.5 text-right font-bold text-tertiary">₹43,000.00</td>
                  <td className="p-2.5 text-right text-outline">—</td>
                  <td className="p-2.5 text-right font-bold text-on-surface">₹1,05,400.00</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-outline">10/09/2026</td>
                  <td className="p-2.5 font-sans">Contra - Deposited Cash into HDFC Bank</td>
                  <td className="p-2.5 text-right text-outline">—</td>
                  <td className="p-2.5 text-right font-bold text-error">₹20,000.00</td>
                  <td className="p-2.5 text-right font-bold text-emerald-700">₹85,400.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Bank Book */}
      {activeTab === 'bankbook' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-space-sm">
            <div className="bg-surface-container-lowest p-3 rounded shadow-xs border border-surface-container-high">
              <span className="text-[10px] text-outline uppercase font-bold">Opening Balance (01/09)</span>
              <div className="font-mono text-lg font-bold text-on-surface mt-0.5">₹4,18,954</div>
            </div>
            <div className="bg-surface-container-lowest p-3 rounded shadow-xs border border-surface-container-high">
              <span className="text-[10px] text-tertiary uppercase font-bold">Deposits &amp; Inward IMPS</span>
              <div className="font-mono text-lg font-bold text-tertiary mt-0.5">+₹45,000</div>
            </div>
            <div className="bg-surface-container-lowest p-3 rounded shadow-xs border border-surface-container-high">
              <span className="text-[10px] text-error uppercase font-bold">Withdrawals &amp; Vendor NEFT</span>
              <div className="font-mono text-lg font-bold text-error mt-0.5">-₹35,354</div>
            </div>
            <div className="bg-surface-container-lowest p-3 rounded shadow-xs border-l-4 border-l-secondary">
              <span className="text-[10px] text-secondary uppercase font-bold">HDFC Closing Balance</span>
              <div className="font-mono text-lg font-bold text-secondary mt-0.5">₹4,28,600</div>
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded shadow-xs overflow-hidden border border-surface-container-high">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-surface-container font-label-caps text-on-surface-variant uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Description</th>
                  <th className="p-2.5 font-mono">Reference</th>
                  <th className="p-2.5 text-right text-tertiary">Deposits (Cr)</th>
                  <th className="p-2.5 text-right text-error">Withdrawals (Dr)</th>
                  <th className="p-2.5 text-right">Bank Balance</th>
                  <th className="p-2.5 text-center">Reconcile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high font-table-cell font-mono">
                <tr>
                  <td className="p-2.5 text-outline">01/09/2026</td>
                  <td className="p-2.5 font-sans font-semibold text-on-surface">Opening HDFC Bank Balance</td>
                  <td className="p-2.5 text-outline">—</td>
                  <td className="p-2.5 text-right text-outline">—</td>
                  <td className="p-2.5 text-right text-outline">—</td>
                  <td className="p-2.5 text-right font-bold text-on-surface">₹4,18,954.00</td>
                  <td className="p-2.5 text-center text-[10px] text-tertiary font-bold">MATCHED</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-outline">07/09/2026</td>
                  <td className="p-2.5 font-sans">Self Cash Withdrawal for Shop Petty Cash</td>
                  <td className="p-2.5 text-secondary">WDL-401</td>
                  <td className="p-2.5 text-right text-outline">—</td>
                  <td className="p-2.5 text-right font-bold text-error">₹10,000.00</td>
                  <td className="p-2.5 text-right font-bold text-on-surface">₹4,08,954.00</td>
                  <td className="p-2.5 text-center text-[10px] text-tertiary font-bold">MATCHED</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-outline">08/09/2026</td>
                  <td className="p-2.5 font-sans">SMS Alert &amp; Quarterly Bank Service Charges</td>
                  <td className="p-2.5 text-outline">CHG-102</td>
                  <td className="p-2.5 text-right text-outline">—</td>
                  <td className="p-2.5 text-right font-bold text-error">₹354.00</td>
                  <td className="p-2.5 text-right font-bold text-on-surface">₹4,08,600.00</td>
                  <td className="p-2.5 text-center text-[10px] text-tertiary font-bold">MATCHED</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-outline">09/09/2026</td>
                  <td className="p-2.5 font-sans">Vendor NEFT to TVS Motors (PO-8413)</td>
                  <td className="p-2.5 text-primary font-bold">PV-00181</td>
                  <td className="p-2.5 text-right text-outline">—</td>
                  <td className="p-2.5 text-right font-bold text-error">₹25,000.00</td>
                  <td className="p-2.5 text-right font-bold text-on-surface">₹3,83,600.00</td>
                  <td className="p-2.5 text-center text-[10px] text-tertiary font-bold">MATCHED</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-outline">10/09/2026</td>
                  <td className="p-2.5 font-sans">Cash Counter Deposit (Branch Drop)</td>
                  <td className="p-2.5 text-secondary font-bold">DEP-8910</td>
                  <td className="p-2.5 text-right font-bold text-tertiary">₹45,000.00</td>
                  <td className="p-2.5 text-right text-outline">—</td>
                  <td className="p-2.5 text-right font-bold text-secondary">₹4,28,600.00</td>
                  <td className="p-2.5 text-center text-[10px] text-tertiary font-bold">MATCHED</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
