import React, { useState } from 'react';
import {
  ReceivableRecord,
  PayableRecord,
  ReceiptVoucher,
  PaymentVoucher,
  BankingAccount,
  UserRole,
  FinancialTimelineItem
} from '../../types';

interface AccountsDashboardProps {
  userRole: UserRole;
  onChangeUserRole: (role: UserRole) => void;
  receivables: ReceivableRecord[];
  payables: PayableRecord[];
  receipts: ReceiptVoucher[];
  payments: PaymentVoucher[];
  bankAccounts: BankingAccount[];
  timelineItems: FinancialTimelineItem[];
  onNavigate: (screen: string) => void;
  onOpenNewReceipt: () => void;
  onOpenNewPayment: () => void;
  onOpenBankingModal: (type: 'deposit' | 'withdrawal' | 'transfer') => void;
  onOpenTimeline: () => void;
  onViewReceipt: (rv: ReceiptVoucher) => void;
  onViewPayment: (pv: PaymentVoucher) => void;
}

export const AccountsDashboard: React.FC<AccountsDashboardProps> = ({
  userRole,
  onChangeUserRole,
  receivables,
  payables,
  receipts,
  payments,
  bankAccounts,
  timelineItems,
  onNavigate,
  onOpenNewReceipt,
  onOpenNewPayment,
  onOpenBankingModal,
  onOpenTimeline,
  onViewReceipt,
  onViewPayment
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilterType, setSearchFilterType] = useState<'ALL' | 'RECEIPT' | 'PAYMENT' | 'CUSTOMER' | 'SUPPLIER'>('ALL');

  // KPI Calculations
  const totalReceivables = receivables.reduce((sum, r) => sum + r.outstanding, 0);
  const totalPayables = payables.reduce((sum, p) => sum + p.outstanding, 0);
  const cashAcc = bankAccounts.find(a => a.type === 'Cash');
  const bankAcc = bankAccounts.find(a => a.type === 'Bank');
  const upiAcc = bankAccounts.find(a => a.type === 'UPI');

  const cashBalance = cashAcc ? cashAcc.balance : 85400;
  const bankBalance = bankAcc ? bankAcc.balance : 428600;
  const upiBalance = upiAcc ? upiAcc.balance : 62300;
  const todaysCollections = 45800;

  // Monthly trend mock data
  const trendMonths = [
    { month: 'May', rec: 280000, pay: 140000, net: 140000 },
    { month: 'Jun', rec: 310000, pay: 165000, net: 145000 },
    { month: 'Jul', rec: 295000, pay: 152000, net: 143000 },
    { month: 'Aug', rec: 360000, pay: 190000, net: 170000 },
    { month: 'Sep (Current)', rec: 342800, pay: 186200, net: 156600 }
  ];

  // Accounting Search Results
  const filteredSearchResults = () => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: Array<{
      type: 'Receipt' | 'Payment' | 'Customer' | 'Supplier';
      title: string;
      subtitle: string;
      amount?: number;
      date?: string;
      rawObj?: any;
    }> = [];

    // Search Receipts
    if (searchFilterType === 'ALL' || searchFilterType === 'RECEIPT') {
      receipts.forEach(r => {
        if (
          r.receiptNo.toLowerCase().includes(q) ||
          r.customerName.toLowerCase().includes(q) ||
          (r.refNo && r.refNo.toLowerCase().includes(q)) ||
          (r.invoiceRef && r.invoiceRef.toLowerCase().includes(q))
        ) {
          results.push({
            type: 'Receipt',
            title: `Receipt ${r.receiptNo} - ${r.customerName}`,
            subtitle: `${r.paymentMode} • ${r.date} • Ref: ${r.refNo || 'N/A'}`,
            amount: r.amount,
            date: r.date,
            rawObj: r
          });
        }
      });
    }

    // Search Payments
    if (searchFilterType === 'ALL' || searchFilterType === 'PAYMENT') {
      payments.forEach(p => {
        if (
          p.paymentNo.toLowerCase().includes(q) ||
          p.supplierName.toLowerCase().includes(q) ||
          (p.refNo && p.refNo.toLowerCase().includes(q)) ||
          (p.reference && p.reference.toLowerCase().includes(q))
        ) {
          results.push({
            type: 'Payment',
            title: `Payment ${p.paymentNo} - ${p.supplierName}`,
            subtitle: `${p.paymentMode} • ${p.date} • Ref: ${p.refNo || p.reference || 'N/A'}`,
            amount: p.amount,
            date: p.date,
            rawObj: p
          });
        }
      });
    }

    // Search Customers
    if (searchFilterType === 'ALL' || searchFilterType === 'CUSTOMER') {
      receivables.forEach(c => {
        if (
          c.customerName.toLowerCase().includes(q) ||
          c.mobile.toLowerCase().includes(q)
        ) {
          results.push({
            type: 'Customer',
            title: `${c.customerName}`,
            subtitle: `Mobile: ${c.mobile} • Invoices: ${c.invoicesCount} • Status: ${c.status}`,
            amount: c.outstanding,
            date: c.lastPaymentDate
          });
        }
      });
    }

    // Search Suppliers
    if (searchFilterType === 'ALL' || searchFilterType === 'SUPPLIER') {
      payables.forEach(s => {
        if (s.supplierName.toLowerCase().includes(q)) {
          results.push({
            type: 'Supplier',
            title: `${s.supplierName}`,
            subtitle: `Purchases: ${s.purchasesCount} • Outstanding: ₹${s.outstanding.toLocaleString('en-IN')}`,
            amount: s.outstanding,
            date: s.lastPaymentDate
          });
        }
      });
    }

    return results;
  };

  const searchHits = filteredSearchResults();

  return (
    <div className="flex flex-col w-full pb-10 space-y-gutter animate-in fade-in duration-150">
      {/* Header & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface-container-lowest p-gutter rounded shadow-xs gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Accounts</h1>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase bg-surface-container text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">verified_user</span>
              <span>Role: {userRole.replace('_', ' ')}</span>
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Track receivables, payables, cash and bank transactions.
          </p>
        </div>

        {/* Header Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Role Selector */}
          <div className="flex items-center bg-surface-container-low rounded border border-surface-container-high px-2 py-1 text-xs">
            <span className="text-outline text-[11px] mr-1.5 font-medium">Switch View:</span>
            <select
              value={userRole}
              onChange={(e) => onChangeUserRole(e.target.value as UserRole)}
              className="bg-transparent text-on-surface font-semibold focus:outline-none cursor-pointer"
            >
              <option value="super_admin">Super Admin (Full Access)</option>
              <option value="admin">Admin (Accounts Manager)</option>
              <option value="manager">Manager (Ledger & Approval)</option>
              <option value="billing_operator">Billing Operator (Restricted)</option>
            </select>
          </div>

          <button
            onClick={onOpenTimeline}
            className="px-3 py-1.5 bg-surface-container-low hover:bg-surface-container text-on-surface rounded text-xs font-semibold flex items-center gap-1.5 transition-colors border border-surface-container-high"
            title="View financial activity timeline"
          >
            <span className="material-symbols-outlined text-[16px] text-secondary">timeline</span>
            <span>Activity Timeline</span>
          </button>

          <button
            onClick={onOpenNewReceipt}
            className="px-3.5 py-1.5 bg-secondary hover:bg-secondary-container text-on-secondary rounded text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>+ New Receipt</span>
          </button>

          {userRole !== 'billing_operator' ? (
            <button
              onClick={onOpenNewPayment}
              className="px-3.5 py-1.5 bg-primary hover:bg-primary/90 text-on-primary rounded text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">payments</span>
              <span>+ New Payment</span>
            </button>
          ) : (
            <div className="px-3 py-1 bg-surface-container-high text-outline rounded text-xs italic flex items-center gap-1" title="Restricted by your role">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              <span>Supplier Payments Restricted</span>
            </div>
          )}
        </div>
      </div>

      {/* Role Restriction Banner if Billing Operator */}
      {userRole === 'billing_operator' && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-900 rounded p-3 text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-600 text-[18px]">lock</span>
          <div>
            <span className="font-bold">Role Note: </span>
            <span>You are logged in as a <strong>Billing Operator</strong>. Supplier payments, bank adjustments, and profit metrics are <em>Restricted by your role</em>.</span>
          </div>
        </div>
      )}

      {/* Global Accounting Search Box */}
      <div className="bg-surface-container-lowest p-3.5 rounded shadow-xs border border-surface-container-high">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-[18px]">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Accounting Search: search customer, supplier, invoice, receipt (e.g. 'RV-00291'), payment or reference..."
              className="w-full pl-9 pr-8 py-2 bg-surface-container-low border border-surface-container-high rounded text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-secondary font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-center">
            {(['ALL', 'RECEIPT', 'PAYMENT', 'CUSTOMER', 'SUPPLIER'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSearchFilterType(filter)}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                  searchFilterType === filter
                    ? 'bg-secondary text-on-secondary'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results Dropdown / Preview */}
        {searchQuery.trim() !== '' && (
          <div className="mt-3 pt-3 border-t border-surface-container-high">
            <div className="text-[11px] font-bold text-outline uppercase mb-2">
              Found {searchHits.length} matching accounting records:
            </div>
            {searchHits.length === 0 ? (
              <div className="p-4 text-center text-xs text-outline italic">
                No matching financial voucher, party, or invoice found for "{searchQuery}".
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {searchHits.map((hit, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      if (hit.type === 'Receipt' && hit.rawObj) onViewReceipt(hit.rawObj);
                      else if (hit.type === 'Payment' && hit.rawObj) onViewPayment(hit.rawObj);
                      else if (hit.type === 'Customer') onNavigate('customer-ledgers');
                      else if (hit.type === 'Supplier') onNavigate('supplier-ledgers');
                    }}
                    className="p-2.5 bg-surface-container-low hover:bg-surface-container rounded border border-surface-container cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        hit.type === 'Receipt'
                          ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                          : hit.type === 'Payment'
                          ? 'bg-primary-container text-on-primary-container'
                          : 'bg-surface-container text-on-surface'
                      }`}>
                        {hit.type}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-on-surface">{hit.title}</div>
                        <div className="text-[11px] text-outline">{hit.subtitle}</div>
                      </div>
                    </div>
                    {hit.amount !== undefined && (
                      <div className="text-right">
                        <div className="font-mono text-xs font-bold text-on-surface">
                          ₹{hit.amount.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-secondary hover:underline">View Ledger →</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Primary KPI Cards (6 Key Financial Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-space-sm">
        {/* Total Receivables */}
        <div
          onClick={() => onNavigate('receivables')}
          className="bg-surface-container-lowest p-3.5 rounded shadow-xs border-l-4 border-l-amber-500 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between text-outline">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Receivables</span>
            <span className="material-symbols-outlined text-[16px] text-amber-500">pending_actions</span>
          </div>
          <div className="font-mono text-xl font-bold text-amber-600 mt-1">
            ₹{totalReceivables.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between text-[10px] text-outline mt-1.5">
            <span>7 Garages Active</span>
            <span className="text-secondary font-semibold hover:underline">Ageing →</span>
          </div>
        </div>

        {/* Total Payables */}
        <div
          onClick={() => {
            if (userRole === 'billing_operator') return;
            onNavigate('payables');
          }}
          className={`bg-surface-container-lowest p-3.5 rounded shadow-xs border-l-4 border-l-error transition-shadow ${
            userRole !== 'billing_operator' ? 'hover:shadow-md cursor-pointer' : 'opacity-80'
          }`}
        >
          <div className="flex items-center justify-between text-outline">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Payables</span>
            <span className="material-symbols-outlined text-[16px] text-error">receipt_long</span>
          </div>
          {userRole !== 'billing_operator' ? (
            <div className="font-mono text-xl font-bold text-error mt-1">
              ₹{totalPayables.toLocaleString('en-IN')}
            </div>
          ) : (
            <div className="text-xs text-outline font-semibold italic mt-2">Restricted by role</div>
          )}
          <div className="flex items-center justify-between text-[10px] text-outline mt-1.5">
            <span>5 Suppliers</span>
            <span className="text-error font-semibold hover:underline">Payables →</span>
          </div>
        </div>

        {/* Cash Balance */}
        <div
          onClick={() => onNavigate('banking')}
          className="bg-surface-container-lowest p-3.5 rounded shadow-xs border-l-4 border-l-emerald-600 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between text-outline">
            <span className="text-[11px] font-bold uppercase tracking-wider">Cash Balance</span>
            <span className="material-symbols-outlined text-[16px] text-emerald-600">payments</span>
          </div>
          <div className="font-mono text-xl font-bold text-emerald-700 mt-1">
            ₹{cashBalance.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between text-[10px] text-outline mt-1.5">
            <span>Counter Drawer</span>
            <span className="text-secondary font-semibold hover:underline">Cash Book →</span>
          </div>
        </div>

        {/* Bank Balance */}
        <div
          onClick={() => onNavigate('banking')}
          className="bg-surface-container-lowest p-3.5 rounded shadow-xs border-l-4 border-l-secondary hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between text-outline">
            <span className="text-[11px] font-bold uppercase tracking-wider">Bank Balance</span>
            <span className="material-symbols-outlined text-[16px] text-secondary">account_balance</span>
          </div>
          <div className="font-mono text-xl font-bold text-secondary mt-1">
            ₹{bankBalance.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between text-[10px] text-outline mt-1.5">
            <span>HDFC Current</span>
            <span className="text-secondary font-semibold hover:underline">Bank Book →</span>
          </div>
        </div>

        {/* UPI Balance */}
        <div
          onClick={() => onNavigate('banking')}
          className="bg-surface-container-lowest p-3.5 rounded shadow-xs border-l-4 border-l-blue-500 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between text-outline">
            <span className="text-[11px] font-bold uppercase tracking-wider">UPI Balance</span>
            <span className="material-symbols-outlined text-[16px] text-blue-500">qr_code_2</span>
          </div>
          <div className="font-mono text-xl font-bold text-blue-600 mt-1">
            ₹{upiBalance.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between text-[10px] text-outline mt-1.5">
            <span>ICICI QR Hub</span>
            <span className="text-secondary font-semibold hover:underline">Settle →</span>
          </div>
        </div>

        {/* Today's Collections */}
        <div
          onClick={() => onNavigate('payment-receipts')}
          className="bg-surface-container-lowest p-3.5 rounded shadow-xs border-l-4 border-l-purple-600 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between text-outline">
            <span className="text-[11px] font-bold uppercase tracking-wider">Today's Collections</span>
            <span className="material-symbols-outlined text-[16px] text-purple-600">point_of_sale</span>
          </div>
          <div className="font-mono text-xl font-bold text-purple-700 mt-1">
            ₹{todaysCollections.toLocaleString('en-IN')}
          </div>
          <div className="flex items-center justify-between text-[10px] text-outline mt-1.5">
            <span>Cash + UPI + NEFT</span>
            <span className="text-secondary font-semibold hover:underline">Receipts →</span>
          </div>
        </div>
      </div>

      {/* Trend Charts & Cash Flow Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-sm">
        {/* Receivables & Payables Trend Chart */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-4 rounded shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
              <div>
                <h3 className="font-headline-md text-sm font-bold text-on-surface">
                  Receivables vs Payables Trend
                </h3>
                <p className="text-[11px] text-outline">5-Month working capital and liquidity comparison</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-amber-500"></span>
                  <span className="text-on-surface">Receivables</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-error"></span>
                  <span className="text-on-surface">Payables</span>
                </div>
              </div>
            </div>

            {/* Custom Bar Comparison Graph */}
            <div className="pt-4 pb-2 space-y-4">
              {trendMonths.map((m, idx) => {
                const maxVal = 400000;
                const recPercent = Math.min(100, Math.round((m.rec / maxVal) * 100));
                const payPercent = Math.min(100, Math.round((m.pay / maxVal) * 100));
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-on-surface">{m.month}</span>
                      <div className="font-mono text-[11px] space-x-3">
                        <span className="text-amber-700 font-bold">Rec: ₹{m.rec.toLocaleString('en-IN')}</span>
                        <span className="text-error font-bold">Pay: ₹{m.pay.toLocaleString('en-IN')}</span>
                        <span className="text-outline">Net: ₹{m.net.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {/* Receivables Bar */}
                      <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden flex">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-300"
                          style={{ width: `${recPercent}%` }}
                        ></div>
                      </div>
                      {/* Payables Bar */}
                      <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden flex">
                        <div
                          className="h-full bg-error rounded-full transition-all duration-300"
                          style={{ width: `${payPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-surface-container-high flex items-center justify-between text-xs">
            <span className="text-outline">Receivables Recovery Velocity: <strong className="text-tertiary">91.4% on-schedule</strong></span>
            <button
              onClick={() => onNavigate('receivables')}
              className="text-secondary font-bold hover:underline flex items-center gap-1"
            >
              <span>View Full Ageing Schedule</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Cash Flow & Liquidity Summary */}
        <div className="bg-surface-container-lowest p-4 rounded shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-surface-container-high">
              <div>
                <h3 className="font-headline-md text-sm font-bold text-on-surface">Cash Flow &amp; Liquidity</h3>
                <p className="text-[11px] text-outline">Real-time liquid assets across registers</p>
              </div>
              <span className="material-symbols-outlined text-secondary text-[20px]">account_balance_wallet</span>
            </div>

            <div className="mt-3 space-y-3">
              <div className="p-3 rounded bg-surface-container-low border border-surface-container flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-outline font-medium">Total Liquid Reserve</div>
                  <div className="font-mono text-lg font-bold text-on-surface">
                    ₹{(cashBalance + bankBalance + upiBalance).toLocaleString('en-IN')}
                  </div>
                </div>
                <span className="px-2 py-1 rounded bg-tertiary-fixed text-on-tertiary-fixed font-bold text-[10px]">
                  HEALTHY
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-surface-container-high">
                  <span className="text-outline">Physical Counter Cash</span>
                  <span className="font-mono font-bold text-on-surface">₹{cashBalance.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-surface-container-high">
                  <span className="text-outline">HDFC Bank Current A/c</span>
                  <span className="font-mono font-bold text-on-surface">₹{bankBalance.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-surface-container-high">
                  <span className="text-outline">Instant UPI QR Balance</span>
                  <span className="font-mono font-bold text-on-surface">₹{upiBalance.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-surface-container-high">
                  <span className="text-outline">Net Working Capital (Rec - Pay)</span>
                  <span className="font-mono font-bold text-secondary">
                    +₹{(totalReceivables - totalPayables).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-surface-container-high">
            <div className="text-[11px] font-bold text-outline uppercase">Quick Banking Transfers</div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => onOpenBankingModal('deposit')}
                className="p-1.5 rounded bg-surface-container-low hover:bg-surface-container border border-surface-container-high text-[11px] font-bold text-on-surface text-center transition-colors"
              >
                Deposit
              </button>
              <button
                onClick={() => onOpenBankingModal('withdrawal')}
                className="p-1.5 rounded bg-surface-container-low hover:bg-surface-container border border-surface-container-high text-[11px] font-bold text-on-surface text-center transition-colors"
              >
                Withdraw
              </button>
              <button
                onClick={() => onOpenBankingModal('transfer')}
                className="p-1.5 rounded bg-surface-container-low hover:bg-surface-container border border-surface-container-high text-[11px] font-bold text-on-surface text-center transition-colors"
              >
                Transfer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Financial Transactions Table */}
      <div className="bg-surface-container-lowest rounded shadow-xs overflow-hidden">
        <div className="p-3 bg-surface-container border-b border-surface-container-high flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-headline-md text-sm font-bold text-on-surface">
              Recent Financial Transactions
            </h3>
            <p className="text-[11px] text-outline">
              Latest receipts, supplier disbursements, and bank contra operations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('payment-receipts')}
              className="text-xs text-secondary font-bold hover:underline"
            >
              All Receipts →
            </button>
            <span className="text-outline">•</span>
            <button
              onClick={() => {
                if (userRole === 'billing_operator') return;
                onNavigate('payment-vouchers');
              }}
              className={`text-xs font-bold ${
                userRole !== 'billing_operator' ? 'text-secondary hover:underline' : 'text-outline cursor-not-allowed'
              }`}
            >
              All Payments →
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-surface-container-low font-label-caps text-on-surface-variant uppercase text-[10px]">
              <tr>
                <th className="p-2.5">Time / Date</th>
                <th className="p-2.5">Type</th>
                <th className="p-2.5">Voucher / Ref</th>
                <th className="p-2.5">Party / Account</th>
                <th className="p-2.5">Payment Mode</th>
                <th className="p-2.5 text-right">Debit (₹)</th>
                <th className="p-2.5 text-right">Credit (₹)</th>
                <th className="p-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-table-cell">
              {/* Receipt Example */}
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="p-2.5 text-outline">Today, 11:32 AM</td>
                <td className="p-2.5">
                  <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-bold text-[10px]">
                    RECEIPT
                  </span>
                </td>
                <td className="p-2.5 font-mono font-bold text-secondary">RV-00291</td>
                <td className="p-2.5 font-semibold text-on-surface">ABC Auto Works</td>
                <td className="p-2.5">
                  <span className="px-1.5 py-0.5 rounded bg-surface-container font-mono text-[11px]">UPI</span>
                </td>
                <td className="p-2.5 text-right font-mono text-outline">—</td>
                <td className="p-2.5 text-right font-mono font-bold text-tertiary">₹15,000.00</td>
                <td className="p-2.5 text-center">
                  <button
                    onClick={() => {
                      const rv = receipts.find(r => r.receiptNo === 'RV-00291') || receipts[0];
                      onViewReceipt(rv);
                    }}
                    className="text-secondary hover:underline font-semibold text-[11px]"
                  >
                    View
                  </button>
                </td>
              </tr>

              {/* Payment Example */}
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="p-2.5 text-outline">Today, 10:18 AM</td>
                <td className="p-2.5">
                  <span className="px-2 py-0.5 rounded bg-primary-container text-on-primary-container font-bold text-[10px]">
                    PAYMENT
                  </span>
                </td>
                <td className="p-2.5 font-mono font-bold text-on-surface">PV-00181</td>
                <td className="p-2.5 font-semibold text-on-surface">TVS Motors</td>
                <td className="p-2.5">
                  <span className="px-1.5 py-0.5 rounded bg-surface-container font-mono text-[11px]">NEFT Bank</span>
                </td>
                <td className="p-2.5 text-right font-mono font-bold text-error">₹25,000.00</td>
                <td className="p-2.5 text-right font-mono text-outline">—</td>
                <td className="p-2.5 text-center">
                  {userRole !== 'billing_operator' ? (
                    <button
                      onClick={() => {
                        const pv = payments.find(p => p.paymentNo === 'PV-00181') || payments[0];
                        onViewPayment(pv);
                      }}
                      className="text-secondary hover:underline font-semibold text-[11px]"
                    >
                      View
                    </button>
                  ) : (
                    <span className="text-[10px] text-outline italic">Restricted</span>
                  )}
                </td>
              </tr>

              {/* POS Bill Entry */}
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="p-2.5 text-outline">Today, 09:42 AM</td>
                <td className="p-2.5">
                  <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-bold text-[10px]">
                    INVOICE
                  </span>
                </td>
                <td className="p-2.5 font-mono font-bold text-secondary">INV-10291</td>
                <td className="p-2.5 font-semibold text-on-surface">Sri Balaji Motors</td>
                <td className="p-2.5">
                  <span className="px-1.5 py-0.5 rounded bg-surface-container font-mono text-[11px]">Cash POS</span>
                </td>
                <td className="p-2.5 text-right font-mono text-outline">—</td>
                <td className="p-2.5 text-right font-mono font-bold text-on-surface">₹3,068.00</td>
                <td className="p-2.5 text-center">
                  <button
                    onClick={() => onNavigate('invoices')}
                    className="text-secondary hover:underline font-semibold text-[11px]"
                  >
                    View
                  </button>
                </td>
              </tr>

              {/* Bank Contra Deposit */}
              <tr className="hover:bg-surface-container-low transition-colors">
                <td className="p-2.5 text-outline">Today, 09:10 AM</td>
                <td className="p-2.5">
                  <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-bold text-[10px]">
                    CONTRA
                  </span>
                </td>
                <td className="p-2.5 font-mono font-bold text-outline">DEP-8910</td>
                <td className="p-2.5 font-semibold text-on-surface">HDFC Bank Deposit (Cash Drawer)</td>
                <td className="p-2.5">
                  <span className="px-1.5 py-0.5 rounded bg-surface-container font-mono text-[11px]">Cash → Bank</span>
                </td>
                <td className="p-2.5 text-right font-mono font-bold text-on-surface">₹20,000.00</td>
                <td className="p-2.5 text-right font-mono font-bold text-on-surface">₹20,000.00</td>
                <td className="p-2.5 text-center">
                  <button
                    onClick={() => onNavigate('banking')}
                    className="text-secondary hover:underline font-semibold text-[11px]"
                  >
                    Slip
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
