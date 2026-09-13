import React, { useState } from 'react';
import {
  CustomerProfileData,
  MechanicRecord,
  LoyaltyTransactionRecord,
  ReferralRecord,
  CommunicationLogRecord,
  OutstandingReminderRecord
} from '../../types';

interface CrmReportsViewProps {
  customers: CustomerProfileData[];
  mechanics: MechanicRecord[];
  loyaltyTransactions: LoyaltyTransactionRecord[];
  referrals: ReferralRecord[];
  communicationLogs: CommunicationLogRecord[];
  reminders: OutstandingReminderRecord[];
  onSelectCustomer: (customerId: string) => void;
}

export const CrmReportsView: React.FC<CrmReportsViewProps> = ({
  customers,
  mechanics,
  loyaltyTransactions,
  referrals,
  communicationLogs,
  reminders,
  onSelectCustomer
}) => {
  const [activeReport, setActiveReport] = useState<
    'sales' | 'outstanding' | 'frequency' | 'mechanics' | 'loyalty' | 'comms'
  >('sales');

  const [dateRange, setDateRange] = useState<'this-month' | 'last-quarter' | 'fy-2026-27' | 'all'>('this-month');
  const [searchTerm, setSearchTerm] = useState('');

  const handleExportCsv = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    const nowStr = new Date().toISOString().slice(0, 10);

    if (activeReport === 'sales') {
      headers = ['Customer Name', 'Mobile', 'Type', 'GSTIN', 'Total Sales', 'Avg Bill', 'Orders Count', 'City'];
      rows = customers.map(c => [
        `"${c.name}"`,
        `"${c.mobile}"`,
        `"${c.customerType}"`,
        `"${c.gstin || ''}"`,
        c.totalSales,
        c.avgBillValue,
        c.totalPurchasesCount,
        `"${c.city}"`
      ]);
    } else if (activeReport === 'outstanding') {
      headers = ['Customer Name', 'Mobile', 'Type', 'Outstanding Balance', 'Oldest Due Days', 'Status', 'Last Reminder'];
      rows = reminders.map(r => [
        `"${r.customerName}"`,
        `"${r.mobile}"`,
        `"${r.customerType}"`,
        r.outstanding,
        r.oldestDueDays,
        `"${r.reminderStatus}"`,
        `"${r.lastReminderDate || 'None'}"`
      ]);
    } else if (activeReport === 'frequency') {
      headers = ['Customer Name', 'Type', 'Purchases Count', 'Total Sales', 'Avg Interval Days', 'Last Purchase'];
      rows = customers.map(c => [
        `"${c.name}"`,
        `"${c.customerType}"`,
        c.totalPurchasesCount,
        c.totalSales,
        '14 Days',
        `"${c.lastPurchaseDate}"`
      ]);
    } else if (activeReport === 'mechanics') {
      headers = ['Mechanic Name', 'Workshop', 'Code', 'Referrals Count', 'Total Referred Sales', 'Points', 'Pending Cash'];
      rows = mechanics.map(m => [
        `"${m.name}"`,
        `"${m.workshopName}"`,
        `"${m.customerCode}"`,
        m.referralCount,
        m.totalReferredSales,
        m.loyaltyPoints,
        m.pendingRewardAmount || 0
      ]);
    } else if (activeReport === 'loyalty') {
      headers = ['Customer Name', 'Type', 'Loyalty Tier', 'Card Number', 'Points Balance', 'Discount Worth'];
      rows = customers.map(c => [
        `"${c.name}"`,
        `"${c.customerType}"`,
        `"${c.loyaltyTier || 'Silver'}"`,
        `"${c.loyaltyCardNumber || ''}"`,
        c.loyaltyPoints,
        c.loyaltyPoints * 1.0
      ]);
    } else {
      headers = ['Date', 'Time', 'Channel', 'Customer Name', 'Mobile', 'Message', 'Status', 'Sender'];
      rows = communicationLogs.map(l => [
        `"${l.date}"`,
        `"${l.time}"`,
        `"${l.channel}"`,
        `"${l.customerName}"`,
        `"${l.mobile}"`,
        `"${l.message.replace(/"/g, '""')}"`,
        `"${l.status}"`,
        `"${l.user}"`
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `crm_${activeReport}_report_${nowStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reportTabs = [
    { id: 'sales', label: 'Customer Sales Report', icon: 'point_of_sale' },
    { id: 'outstanding', label: 'Outstanding & Ageing Report', icon: 'pending_actions' },
    { id: 'frequency', label: 'Purchase Frequency & Recency', icon: 'repeat' },
    { id: 'mechanics', label: 'Mechanic Referrals & Incentive', icon: 'handyman' },
    { id: 'loyalty', label: 'Loyalty Points Audit Report', icon: 'stars' },
    { id: 'comms', label: 'Communication Delivery Report', icon: 'chat' }
  ] as const;

  return (
    <div className="flex flex-col w-full pb-12 space-y-gutter animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface-container-lowest p-gutter rounded border border-surface-container-high shadow-xs gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">analytics</span>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">CRM Analytics &amp; Statutory Business Reports</h1>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Comprehensive audit reports for customer sales volume, credit ageing, mechanic incentives, and messaging delivery
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-1.5 bg-secondary hover:bg-secondary-container text-on-secondary rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export Excel / CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Reports Horizontal Selector Tabs */}
      <div className="border-b border-surface-container-high bg-surface-container-lowest rounded-t overflow-x-auto">
        <div className="flex items-center min-w-max">
          {reportTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id as any)}
              className={`px-3.5 py-2.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap ${
                activeReport === tab.id
                  ? 'border-secondary text-secondary bg-surface-container-low'
                  : 'border-transparent text-outline hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-2.5 top-2 text-[18px] text-outline">search</span>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search report records..."
            className="w-full pl-9 pr-3 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-on-surface focus:outline-none focus:border-secondary"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-outline font-medium">Period:</span>
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value as any)}
            className="px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-on-surface font-semibold"
          >
            <option value="this-month">September 2026 (Current Month)</option>
            <option value="last-quarter">Q2 (Jul - Sep 2026)</option>
            <option value="fy-2026-27">FY 2026-27 (YTD)</option>
            <option value="all">All Time (Historical)</option>
          </select>
        </div>
      </div>

      {/* Main Report Table Container */}
      <div className="bg-surface-container-lowest rounded border border-surface-container-high shadow-xs overflow-hidden">
        {/* REPORT 1: Customer Sales Report */}
        {activeReport === 'sales' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-surface-container font-label-caps text-on-surface-variant uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">Customer Name</th>
                  <th className="p-2.5">Mobile</th>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5">GSTIN</th>
                  <th className="p-2.5 text-right">Bills Count</th>
                  <th className="p-2.5 text-right">Avg Bill Value</th>
                  <th className="p-2.5 text-right">Total Net Sales</th>
                  <th className="p-2.5 text-right">Outstanding</th>
                  <th className="p-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high font-table-cell">
                {customers.map(c => (
                  <tr key={c.id} className="hover:bg-surface-container-low">
                    <td className="p-2.5 font-bold text-on-surface">{c.name}</td>
                    <td className="p-2.5 font-mono text-outline">{c.mobile}</td>
                    <td className="p-2.5">{c.customerType}</td>
                    <td className="p-2.5 font-mono text-outline">{c.gstin || '—'}</td>
                    <td className="p-2.5 text-right font-mono">{c.totalPurchasesCount}</td>
                    <td className="p-2.5 text-right font-mono">₹{c.avgBillValue.toLocaleString('en-IN')}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-on-surface">₹{c.totalSales.toLocaleString('en-IN')}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-error">
                      {c.outstanding > 0 ? `₹${c.outstanding.toLocaleString('en-IN')}` : '₹0.00'}
                    </td>
                    <td className="p-2.5 text-center">
                      <button onClick={() => onSelectCustomer(c.id)} className="text-secondary hover:underline font-semibold">
                        Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 2: Customer Outstanding & Ageing Report */}
        {activeReport === 'outstanding' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-surface-container font-label-caps text-on-surface-variant uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">Customer Name</th>
                  <th className="p-2.5">Mobile</th>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5 text-right">Invoices Due</th>
                  <th className="p-2.5 text-right">Outstanding (₹)</th>
                  <th className="p-2.5 text-right">Oldest Due (Days)</th>
                  <th className="p-2.5">Last Reminder Date</th>
                  <th className="p-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high font-table-cell">
                {reminders.map(r => (
                  <tr key={r.customerId} className="hover:bg-surface-container-low">
                    <td className="p-2.5 font-bold text-on-surface">{r.customerName}</td>
                    <td className="p-2.5 font-mono text-outline">{r.mobile}</td>
                    <td className="p-2.5">{r.customerType}</td>
                    <td className="p-2.5 text-right font-mono">{r.invoiceCount} bills</td>
                    <td className="p-2.5 text-right font-mono font-bold text-error">₹{r.outstanding.toLocaleString('en-IN')}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-error">{r.oldestDueDays} days</td>
                    <td className="p-2.5 text-outline">{r.lastReminderDate || 'Never'}</td>
                    <td className="p-2.5 text-center">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] uppercase bg-tertiary-fixed text-on-tertiary-fixed">
                        {r.reminderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 3: Purchase Frequency */}
        {activeReport === 'frequency' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-surface-container font-label-caps text-on-surface-variant uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">Customer</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5 text-right">Lifetime Bills</th>
                  <th className="p-2.5 text-right">Total Net Sales</th>
                  <th className="p-2.5 text-right">Avg Order Frequency</th>
                  <th className="p-2.5">Last Active Purchase</th>
                  <th className="p-2.5 text-center">Retention Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high font-table-cell">
                {customers.map(c => (
                  <tr key={c.id} className="hover:bg-surface-container-low">
                    <td className="p-2.5 font-bold text-on-surface">{c.name}</td>
                    <td className="p-2.5">{c.customerType}</td>
                    <td className="p-2.5 text-right font-mono font-bold">{c.totalPurchasesCount} orders</td>
                    <td className="p-2.5 text-right font-mono font-bold text-on-surface">₹{c.totalSales.toLocaleString('en-IN')}</td>
                    <td className="p-2.5 text-right font-mono text-outline">~{Math.max(4, Math.floor(60 / (c.totalPurchasesCount || 1)))} Days</td>
                    <td className="p-2.5 font-mono text-outline">{c.lastPurchaseDate}</td>
                    <td className="p-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                        c.status === 'Active' ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-error-container text-on-error-container'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 4: Mechanic Referral Report */}
        {activeReport === 'mechanics' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-surface-container font-label-caps text-on-surface-variant uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">Mechanic &amp; Workshop</th>
                  <th className="p-2.5">Referral Code</th>
                  <th className="p-2.5 text-right">Total Referrals</th>
                  <th className="p-2.5 text-right">Total Sales Generated</th>
                  <th className="p-2.5 text-right">Commission Rate</th>
                  <th className="p-2.5 text-right">Loyalty Points Earned</th>
                  <th className="p-2.5 text-right">Pending Cash Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high font-table-cell">
                {mechanics.map(m => (
                  <tr key={m.id} className="hover:bg-surface-container-low">
                    <td className="p-2.5 font-bold text-on-surface">
                      {m.name}
                      <div className="text-[11px] text-outline font-normal">{m.workshopName}</div>
                    </td>
                    <td className="p-2.5 font-mono text-secondary font-bold">{m.customerCode}</td>
                    <td className="p-2.5 text-right font-mono font-bold">{m.referralCount}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-on-surface">₹{m.totalReferredSales.toLocaleString('en-IN')}</td>
                    <td className="p-2.5 text-right font-mono text-on-tertiary-container">{m.commissionRatePercent}%</td>
                    <td className="p-2.5 text-right font-mono font-bold text-secondary">{m.loyaltyPoints} pts</td>
                    <td className="p-2.5 text-right font-mono font-bold text-error">
                      ₹{(m.pendingRewardAmount || 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 5: Loyalty Points Report */}
        {activeReport === 'loyalty' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-surface-container font-label-caps text-on-surface-variant uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">Customer Name</th>
                  <th className="p-2.5">Card #</th>
                  <th className="p-2.5">Club Tier</th>
                  <th className="p-2.5 text-right">Active Points Balance</th>
                  <th className="p-2.5 text-right">Discount Equivalent</th>
                  <th className="p-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high font-table-cell">
                {customers.map(c => (
                  <tr key={c.id} className="hover:bg-surface-container-low">
                    <td className="p-2.5 font-bold text-on-surface">{c.name}</td>
                    <td className="p-2.5 font-mono text-outline">{c.loyaltyCardNumber || '—'}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded bg-surface-container text-secondary text-[10px] font-bold">
                        {c.loyaltyTier || 'Silver'}
                      </span>
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold text-secondary text-sm">{c.loyaltyPoints} pts</td>
                    <td className="p-2.5 text-right font-mono font-bold text-on-tertiary-container">
                      ₹{(c.loyaltyPoints * 1.0).toFixed(2)}
                    </td>
                    <td className="p-2.5 text-center">
                      <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-bold text-[10px] uppercase">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 6: Communication Delivery Report */}
        {activeReport === 'comms' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-surface-container font-label-caps text-on-surface-variant uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">Date / Time</th>
                  <th className="p-2.5">Channel</th>
                  <th className="p-2.5">Customer Name</th>
                  <th className="p-2.5">Mobile</th>
                  <th className="p-2.5">Category</th>
                  <th className="p-2.5">Message Content</th>
                  <th className="p-2.5 text-center">Status</th>
                  <th className="p-2.5">Sender</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high font-table-cell">
                {communicationLogs.map(log => (
                  <tr key={log.id} className="hover:bg-surface-container-low">
                    <td className="p-2.5 text-outline font-mono">{log.date} {log.time}</td>
                    <td className="p-2.5 font-bold">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                        log.channel === 'WhatsApp' ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-secondary-fixed text-on-secondary-fixed'
                      }`}>
                        {log.channel}
                      </span>
                    </td>
                    <td className="p-2.5 font-bold text-on-surface">{log.customerName}</td>
                    <td className="p-2.5 font-mono text-outline">{log.mobile}</td>
                    <td className="p-2.5 text-outline">{log.category}</td>
                    <td className="p-2.5 max-w-xs truncate text-on-surface-variant font-mono text-[11px]" title={log.message}>
                      {log.message}
                    </td>
                    <td className="p-2.5 text-center">
                      <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-bold text-[10px] uppercase">
                        {log.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-outline text-[11px]">{log.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
