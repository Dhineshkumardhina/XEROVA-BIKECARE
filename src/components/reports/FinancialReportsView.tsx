import React, { useState, useMemo } from 'react';
import { FinancialReportRow, UserRole, ReportDetailData } from '../../types';
import { INITIAL_FINANCIAL_REPORTS, TRIAL_BALANCE_ITEMS } from '../../data/gstAndReportsData';
import { CommonReportTable, ColumnDef, PresetFilter } from './CommonReportTable';
import { formatINR } from '../../utils/formatters';

interface FinancialReportsViewProps {
  userRole: UserRole;
  onNavigate: (screenId: string) => void;
  onOpenDrawer: (data: ReportDetailData) => void;
}

type FinancialSubReport =
  | 'daybook'
  | 'cashbook'
  | 'bankbook'
  | 'trial_balance'
  | 'pnl'
  | 'balance_sheet';

export const FinancialReportsView: React.FC<FinancialReportsViewProps> = ({
  userRole,
  onNavigate,
  onOpenDrawer
}) => {
  const [subReport, setSubReport] = useState<FinancialSubReport>('daybook');
  const [activePreset, setActivePreset] = useState('all');

  const subReportTabs: { id: FinancialSubReport; label: string; icon: string }[] = [
    { id: 'daybook', label: 'Day Book (Journal)', icon: 'calendar_today' },
    { id: 'cashbook', label: 'Cash Book', icon: 'payments' },
    { id: 'bankbook', label: 'Bank Book', icon: 'account_balance' },
    { id: 'trial_balance', label: 'Trial Balance', icon: 'balance' },
    { id: 'pnl', label: 'Profit & Loss A/c', icon: 'analytics' },
    { id: 'balance_sheet', label: 'Balance Sheet', icon: 'account_tree' }
  ];

  const presets: PresetFilter[] = [
    { id: 'all', label: 'All Entries', description: 'Show all financial vouchers' },
    { id: 'receipts', label: 'Receipts Only', description: 'Collections from garages & counter' },
    { id: 'payments', label: 'Payments Only', description: 'Vendor settlements & shop expenses' },
    { id: 'contras', label: 'Contra (Cash <-> Bank)', description: 'Internal cash transfers' }
  ];

  // Filter Daybook data
  const filteredDaybook = useMemo(() => {
    let result = [...INITIAL_FINANCIAL_REPORTS];

    if (subReport === 'cashbook') {
      result = result.filter(r => r.account.includes('Cash') || r.voucherType === 'Receipt' || r.voucherType === 'Contra');
    } else if (subReport === 'bankbook') {
      result = result.filter(r => r.account.includes('Bank') || r.voucherType === 'Payment' || r.voucherType === 'Contra');
    }

    if (activePreset === 'receipts') {
      result = result.filter(r => r.voucherType === 'Receipt');
    } else if (activePreset === 'payments') {
      result = result.filter(r => r.voucherType === 'Payment');
    } else if (activePreset === 'contras') {
      result = result.filter(r => r.voucherType === 'Contra');
    }

    return result;
  }, [subReport, activePreset]);

  // Trial Balance Totals
  const trialTotalDebit = TRIAL_BALANCE_ITEMS.reduce((sum, r) => sum + r.debit, 0);
  const trialTotalCredit = TRIAL_BALANCE_ITEMS.reduce((sum, r) => sum + r.credit, 0);

  // Columns definition for Day Book
  const daybookColumns: ColumnDef<FinancialReportRow>[] = [
    {
      id: 'voucherNo',
      header: 'Voucher #',
      accessor: r => r.voucherNo,
      cell: r => (
        <span className="font-mono font-bold text-secondary">{r.voucherNo}</span>
      )
    },
    {
      id: 'date',
      header: 'Date',
      accessor: r => r.date
    },
    {
      id: 'voucherType',
      header: 'Voucher Type',
      accessor: r => r.voucherType,
      align: 'center',
      cell: r => (
        <span
          className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
            r.voucherType === 'Receipt'
              ? 'bg-tertiary-fixed text-on-tertiary-fixed'
              : r.voucherType === 'Payment'
              ? 'bg-secondary/15 text-secondary'
              : r.voucherType === 'Sales'
              ? 'bg-primary/15 text-primary'
              : 'bg-surface-container text-on-surface'
          }`}
        >
          {r.voucherType}
        </span>
      )
    },
    {
      id: 'particulars',
      header: 'Particulars & Ledger Head',
      accessor: r => r.particulars,
      cell: r => (
        <div>
          <div className="font-bold text-on-surface">{r.particulars}</div>
          <div className="text-[10px] text-outline">{r.account}</div>
        </div>
      )
    },
    {
      id: 'refNo',
      header: 'Ref / Cheque #',
      accessor: r => r.refNo,
      cell: r => <span className="font-mono text-outline text-[11px]">{r.refNo}</span>
    },
    {
      id: 'debit',
      header: 'Debit Amount (₹)',
      accessor: r => r.debit,
      align: 'right',
      formatAsINR: true,
      totalable: true,
      cell: r => (
        <span className={`font-mono ${r.debit > 0 ? 'font-bold text-on-surface' : 'text-outline'}`}>
          {r.debit > 0 ? formatINR(r.debit) : '-'}
        </span>
      )
    },
    {
      id: 'credit',
      header: 'Credit Amount (₹)',
      accessor: r => r.credit,
      align: 'right',
      formatAsINR: true,
      totalable: true,
      cell: r => (
        <span className={`font-mono ${r.credit > 0 ? 'font-bold text-on-surface' : 'text-outline'}`}>
          {r.credit > 0 ? formatINR(r.credit) : '-'}
        </span>
      )
    }
  ];

  return (
    <div className="flex flex-col w-full pb-12 space-y-gutter animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface-container-lowest p-gutter rounded shadow-xs border border-surface-container-high gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-2xl">menu_book</span>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Financial Reports &amp; Ledgers</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-secondary/15 text-secondary border border-secondary/20">
              Double Entry System
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Day Book, Cash &amp; Bank Registers, Trial Balance, Trading Account and Balance Sheet statements
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('accounts-dashboard')}
            className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded font-semibold text-xs flex items-center gap-1.5 border border-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">account_balance</span>
            <span>Accounts Dashboard</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-secondary text-on-secondary hover:bg-secondary-container rounded font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Print Financials</span>
          </button>
        </div>
      </div>

      {/* Sub-report Navigation Tabs */}
      <div className="bg-surface-container-lowest border border-surface-container-high rounded p-1 flex flex-wrap gap-1">
        {subReportTabs.map(tab => {
          const isActive = subReport === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubReport(tab.id)}
              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isActive
                  ? 'bg-secondary text-on-secondary shadow-xs font-bold'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* VIEW: Trial Balance */}
      {subReport === 'trial_balance' && (
        <div className="bg-surface-container-lowest rounded shadow-xs border border-surface-container-high overflow-hidden text-xs">
          <div className="p-3 bg-surface-container-low border-b border-surface-container-high flex items-center justify-between">
            <div>
              <span className="font-bold text-on-surface text-sm">Trial Balance as of 24 October 2024</span>
              <p className="text-[11px] text-outline">Verified balance of all nominal, real, and personal ledger heads</p>
            </div>
            <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-tertiary-fixed text-on-tertiary-fixed">
              Balanced (Diff: ₹0.00)
            </span>
          </div>

          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container font-label-caps text-label-caps text-on-surface-variant uppercase">
              <tr>
                <th className="py-2.5 px-3">Account / Ledger Head</th>
                <th className="py-2.5 px-3 text-right">Debit (Dr)</th>
                <th className="py-2.5 px-3 text-right">Credit (Cr)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-table-cell">
              {TRIAL_BALANCE_ITEMS.map((item, idx) => (
                <tr key={idx} className="hover:bg-surface-container-low">
                  <td className="py-2 px-3 font-semibold text-on-surface">{item.account}</td>
                  <td className="py-2 px-3 text-right font-mono">
                    {item.debit > 0 ? formatINR(item.debit) : '-'}
                  </td>
                  <td className="py-2 px-3 text-right font-mono">
                    {item.credit > 0 ? formatINR(item.credit) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-surface-container font-bold border-t-2 border-surface-container-high">
              <tr>
                <td className="py-2.5 px-3 uppercase text-[10px] tracking-wider text-outline">
                  Total Trial Balance
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-secondary text-sm">
                  {formatINR(trialTotalDebit)}
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-secondary text-sm">
                  {formatINR(trialTotalCredit)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* VIEW: Profit & Loss Statement */}
      {subReport === 'pnl' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm text-xs">
          {/* Expenses Column */}
          <div className="bg-surface-container-lowest rounded shadow-xs border border-surface-container-high overflow-hidden">
            <div className="p-3 bg-surface-container-low border-b border-surface-container-high font-bold text-on-surface">
              Trading &amp; Profit / Loss (Debit - Expenses &amp; Purchases)
            </div>
            <div className="p-3 space-y-2 font-mono divide-y divide-surface-container-high">
              <div className="flex justify-between py-1 text-on-surface">
                <span>To Opening Stock</span>
                <span>{formatINR(1840000.0)}</span>
              </div>
              <div className="flex justify-between py-1 text-on-surface">
                <span>To Purchases (Net of Returns)</span>
                <span>{formatINR(1825400.0)}</span>
              </div>
              <div className="flex justify-between py-1 text-on-surface">
                <span>To Freight &amp; Cartage Inward</span>
                <span>{formatINR(24500.0)}</span>
              </div>
              <div className="flex justify-between py-1 font-bold text-secondary">
                <span>To Gross Profit c/d</span>
                <span>{formatINR(640250.0)}</span>
              </div>
              <div className="flex justify-between py-1 text-outline pt-2">
                <span>To Staff Salaries (Operators)</span>
                <span>{formatINR(45000.0)}</span>
              </div>
              <div className="flex justify-between py-1 text-outline">
                <span>To Shop Rent &amp; Electricity</span>
                <span>{formatINR(18200.0)}</span>
              </div>
              <div className="flex justify-between py-1 text-outline">
                <span>To Discount Allowed to Garages</span>
                <span>{formatINR(42150.0)}</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-base text-tertiary pt-3 border-t-2 border-surface-container-high">
                <span>Net Profit Transferred to Capital</span>
                <span>{formatINR(534900.0)}</span>
              </div>
            </div>
          </div>

          {/* Incomes Column */}
          <div className="bg-surface-container-lowest rounded shadow-xs border border-surface-container-high overflow-hidden">
            <div className="p-3 bg-surface-container-low border-b border-surface-container-high font-bold text-on-surface">
              Trading &amp; Profit / Loss (Credit - Revenues &amp; Incomes)
            </div>
            <div className="p-3 space-y-2 font-mono divide-y divide-surface-container-high">
              <div className="flex justify-between py-1 text-on-surface">
                <span>By Sales (Domestic Net)</span>
                <span>{formatINR(2480450.0)}</span>
              </div>
              <div className="flex justify-between py-1 text-on-surface">
                <span>By Closing Stock (Estimated)</span>
                <span>{formatINR(1849700.0)}</span>
              </div>
              <div className="flex justify-between py-1 text-outline">
                <span>By Scrap &amp; Battery Core Rebate</span>
                <span>{formatINR(4800.0)}</span>
              </div>
              <div className="flex justify-between py-1 font-bold text-secondary pt-3 border-t-2 border-surface-container-high">
                <span>By Gross Profit b/d</span>
                <span>{formatINR(640250.0)}</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-base text-tertiary pt-3 border-t-2 border-surface-container-high">
                <span>Total Net Revenue Balanced</span>
                <span>{formatINR(645050.0)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: Balance Sheet */}
      {subReport === 'balance_sheet' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm text-xs">
          {/* Liabilities */}
          <div className="bg-surface-container-lowest rounded shadow-xs border border-surface-container-high overflow-hidden">
            <div className="p-3 bg-surface-container-low border-b border-surface-container-high font-bold text-on-surface">
              Liabilities &amp; Capital
            </div>
            <div className="p-3 space-y-2 font-mono divide-y divide-surface-container-high">
              <div className="flex justify-between py-1 text-on-surface">
                <span>Capital Account (Proprietor)</span>
                <span>{formatINR(1500000.0)}</span>
              </div>
              <div className="flex justify-between py-1 text-tertiary font-semibold">
                <span>Add: Net Profit for Year</span>
                <span>+{formatINR(534900.0)}</span>
              </div>
              <div className="flex justify-between py-1 text-on-surface">
                <span>Sundry Creditors (Spares Distributors)</span>
                <span>{formatINR(186200.0)}</span>
              </div>
              <div className="flex justify-between py-1 text-primary">
                <span>Net GST Payable (Oct 24)</span>
                <span>{formatINR(115245.0)}</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-base text-secondary pt-3 border-t-2 border-surface-container-high">
                <span>Total Liabilities</span>
                <span>{formatINR(2336345.0)}</span>
              </div>
            </div>
          </div>

          {/* Assets */}
          <div className="bg-surface-container-lowest rounded shadow-xs border border-surface-container-high overflow-hidden">
            <div className="p-3 bg-surface-container-low border-b border-surface-container-high font-bold text-on-surface">
              Assets &amp; Receivables
            </div>
            <div className="p-3 space-y-2 font-mono divide-y divide-surface-container-high">
              <div className="flex justify-between py-1 text-on-surface">
                <span>Closing Stock (Spares Inventory)</span>
                <span>{formatINR(1417245.0)}</span>
              </div>
              <div className="flex justify-between py-1 text-on-surface">
                <span>Sundry Debtors (Affiliated Garages)</span>
                <span>{formatINR(342800.0)}</span>
              </div>
              <div className="flex justify-between py-1 text-on-surface">
                <span>HDFC Current Account</span>
                <span>{formatINR(428600.0)}</span>
              </div>
              <div className="flex justify-between py-1 text-on-surface">
                <span>Cash-in-Hand (Counter Floats)</span>
                <span>{formatINR(85400.0)}</span>
              </div>
              <div className="flex justify-between py-1 text-on-surface">
                <span>ICICI UPI Settlement Ledger</span>
                <span>{formatINR(62300.0)}</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-base text-secondary pt-3 border-t-2 border-surface-container-high">
                <span>Total Assets</span>
                <span>{formatINR(2336345.0)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: Day Book / Cash Book / Bank Book */}
      {(subReport === 'daybook' || subReport === 'cashbook' || subReport === 'bankbook') && (
        <CommonReportTable<FinancialReportRow>
          title={`${subReportTabs.find(t => t.id === subReport)?.label} (${filteredDaybook.length} Vouchers)`}
          subtitle="Real-time chronological journal of debit & credit postings"
          columns={daybookColumns}
          data={filteredDaybook}
          filterPresets={presets}
          activePreset={activePreset}
          onSelectPreset={p => setActivePreset(p)}
          searchPlaceholder="Search voucher #, account, particulars, cheque #..."
          onRowClick={r => {
            onOpenDrawer({
              id: r.id,
              type: 'Financial',
              title: `${r.voucherType} Voucher: ${r.voucherNo}`,
              referenceNo: r.voucherNo,
              date: `${r.date}`,
              partyName: r.particulars,
              paymentMode: r.account,
              status: 'POSTED',
              taxableAmount: r.debit || r.credit,
              cgst: 0,
              sgst: 0,
              igst: 0,
              totalAmount: r.debit || r.credit,
              user: 'Accounts Manager (Rajesh)',
              timestamp: `${r.date} 10:30:00 IST`,
              items: [],
              auditHistory: [
                { timestamp: r.date, action: `Posted to ${r.account} in General Ledger`, user: 'Rajesh' }
              ],
              notes: r.notes || `Ref: ${r.refNo}`
            });
          }}
          exportFileName={`Financial-${subReport}`}
        />
      )}
    </div>
  );
};
