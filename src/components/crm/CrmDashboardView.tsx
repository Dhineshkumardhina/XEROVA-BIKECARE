import React, { useState } from 'react';
import { CustomerProfileData, MechanicRecord, LoyaltyTransactionRecord, CommunicationLogRecord } from '../../types';

interface CrmDashboardViewProps {
  customers: CustomerProfileData[];
  mechanics: MechanicRecord[];
  loyaltyTransactions: LoyaltyTransactionRecord[];
  communicationLogs: CommunicationLogRecord[];
  onNavigate: (screenId: string) => void;
  onSelectCustomer: (customerId: string) => void;
  onSelectMechanic: (mechanicId: string) => void;
  onOpenNewCustomer: () => void;
}

export const CrmDashboardView: React.FC<CrmDashboardViewProps> = ({
  customers,
  mechanics,
  loyaltyTransactions,
  communicationLogs,
  onNavigate,
  onSelectCustomer,
  onSelectMechanic,
  onOpenNewCustomer
}) => {
  const [trendRange, setTrendRange] = useState<'7d' | '30d' | '90d'>('30d');

  // KPI Calculations
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'Active').length;
  const newCustomers = customers.filter(c => c.createdDate.includes('2026')).length;
  const customersWithOutstanding = customers.filter(c => c.outstanding > 0);
  const totalOutstanding = customers.reduce((sum, c) => sum + c.outstanding, 0);
  const totalMechanics = mechanics.length;
  const loyaltyMembers = customers.filter(c => c.loyaltyPoints > 0).length;
  const totalPointsIssued = customers.reduce((sum, c) => sum + c.loyaltyPoints, 0);

  // Top Customers by Total Sales
  const topCustomers = [...customers].sort((a, b) => b.totalSales - a.totalSales).slice(0, 5);

  // Top Mechanics by Referred Sales
  const topMechanics = [...mechanics].sort((a, b) => b.totalReferredSales - a.totalReferredSales).slice(0, 5);

  // Customer Acquisition Trend Data (Weekly / Monthly breakdown)
  const acquisitionTrend: any[] = [];

  // Outstanding Trend by Category
  const outstandingByType: any[] = [];

  const whatsAppCount = communicationLogs.filter(l => l.channel === 'WhatsApp').length;
  const whatsAppDelivered = communicationLogs.filter(l => l.channel === 'WhatsApp' && l.status === 'Delivered').length;
  const whatsAppRate = whatsAppCount > 0 ? ((whatsAppDelivered / whatsAppCount) * 100).toFixed(1) : '0.0';

  const smsCount = communicationLogs.filter(l => l.channel === 'SMS').length;
  const smsDelivered = communicationLogs.filter(l => l.channel === 'SMS' && l.status === 'Delivered').length;
  const smsRate = smsCount > 0 ? ((smsDelivered / smsCount) * 100).toFixed(1) : '0.0';

  return (
    <div className="flex flex-col w-full pb-12 space-y-gutter animate-in fade-in duration-150">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface-container-lowest p-gutter rounded shadow-xs gap-3 border border-surface-container-high">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">space_dashboard</span>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">CRM &amp; Customer Relationship Center</h1>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Holistic counter customer tracking, mechanic referrals, loyalty reward balances, and WhatsApp communications
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('bulk-messaging')}
            className="px-3 py-1.5 bg-surface-container text-on-surface hover:bg-surface-container-high rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-secondary">campaign</span>
            <span>Bulk Campaign</span>
          </button>
          <button
            onClick={() => onNavigate('payment-reminders')}
            className="px-3 py-1.5 bg-surface-container text-on-surface hover:bg-surface-container-high rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-error">notifications_active</span>
            <span>Outstanding Reminders</span>
          </button>
          <button
            onClick={onOpenNewCustomer}
            className="px-3.5 py-1.5 bg-secondary hover:bg-secondary-container text-on-secondary rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            <span>+ Add New Customer</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-space-sm">
        {/* Total Customers */}
        <div
          onClick={() => onNavigate('customers')}
          className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs cursor-pointer hover:border-secondary transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-outline uppercase">Total Customers</span>
            <span className="material-symbols-outlined text-[18px] text-secondary">groups</span>
          </div>
          <div className="font-numeric-lg text-xl font-bold text-on-surface mt-1">{totalCustomers}</div>
          <div className="text-[11px] text-on-tertiary-container mt-0.5 font-medium">Counter &amp; Garage B2B</div>
        </div>

        {/* Active Customers */}
        <div
          onClick={() => onNavigate('customers')}
          className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs cursor-pointer hover:border-secondary transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-outline uppercase">Active Accounts</span>
            <span className="material-symbols-outlined text-[18px] text-on-tertiary-container">verified</span>
          </div>
          <div className="font-numeric-lg text-xl font-bold text-on-surface mt-1">{activeCustomers}</div>
          <div className="text-[11px] text-outline mt-0.5 font-medium">{((activeCustomers / (totalCustomers || 1)) * 100).toFixed(0)}% retention rate</div>
        </div>

        {/* New Customers */}
        <div
          onClick={() => onNavigate('customers')}
          className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs cursor-pointer hover:border-secondary transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-outline uppercase">New Customers</span>
            <span className="material-symbols-outlined text-[18px] text-secondary">person_add</span>
          </div>
          <div className="font-numeric-lg text-xl font-bold text-secondary mt-1">{newCustomers}</div>
          <div className="text-[11px] text-outline mt-0.5 font-medium">Joined this year</div>
        </div>

        {/* Customers with Outstanding */}
        <div
          onClick={() => onNavigate('payment-reminders')}
          className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs cursor-pointer hover:border-error transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-outline uppercase">With Outstanding</span>
            <span className="material-symbols-outlined text-[18px] text-error">pending_actions</span>
          </div>
          <div className="font-numeric-lg text-xl font-bold text-error mt-1">{customersWithOutstanding.length}</div>
          <div className="text-[11px] text-error font-medium">₹{totalOutstanding.toLocaleString('en-IN')} pending</div>
        </div>

        {/* Total Mechanics */}
        <div
          onClick={() => onNavigate('mechanics')}
          className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs cursor-pointer hover:border-secondary transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-outline uppercase">Total Mechanics</span>
            <span className="material-symbols-outlined text-[18px] text-secondary">handyman</span>
          </div>
          <div className="font-numeric-lg text-xl font-bold text-on-surface mt-1">{totalMechanics}</div>
          <div className="text-[11px] text-secondary font-medium">4 Active Referrers</div>
        </div>

        {/* Loyalty Members */}
        <div
          onClick={() => onNavigate('loyalty-program')}
          className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs cursor-pointer hover:border-secondary transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-outline uppercase">Loyalty Members</span>
            <span className="material-symbols-outlined text-[18px] text-secondary">stars</span>
          </div>
          <div className="font-numeric-lg text-xl font-bold text-on-surface mt-1">{loyaltyMembers}</div>
          <div className="text-[11px] text-outline mt-0.5 font-medium">{totalPointsIssued.toLocaleString('en-IN')} total pts</div>
        </div>
      </div>

      {/* Analytics & Trends Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-sm">
        {/* Trend 1: New Customers & Sales Trend */}
        <div className="bg-surface-container-lowest p-4 rounded border border-surface-container-high shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-headline-md text-sm font-bold text-on-surface">Customer Growth &amp; Sales Trend</div>
              <div className="text-[11px] text-outline">Acquisitions &amp; aggregate billings</div>
            </div>
            <div className="flex bg-surface-container rounded p-0.5 text-[10px]">
              {(['7d', '30d', '90d'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTrendRange(t)}
                  className={`px-2 py-0.5 rounded uppercase font-bold ${
                    trendRange === t ? 'bg-secondary text-on-secondary shadow-xs' : 'text-outline hover:text-on-surface'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Structured Bars */}
          <div className="space-y-2 pt-2">
            {acquisitionTrend.length === 0 ? (
              <div className="py-8 text-center text-outline text-[11px] italic">
                No customer acquisition data available for this period.
              </div>
            ) : (
              acquisitionTrend.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-table-cell">
                    <span className="text-on-surface-variant font-medium">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-outline text-[11px]">+{item.count} new</span>
                      <span className="font-mono font-bold text-on-surface">₹{(item.sales / 1000).toFixed(0)}k</span>
                    </div>
                  </div>
                  <div className="w-full bg-surface-container-high h-2 rounded overflow-hidden flex">
                    <div
                      className="bg-secondary h-full rounded"
                      style={{ width: `${(item.sales / 300000) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="pt-2 border-t border-surface-container-high flex items-center justify-between text-[11px] text-outline">
            <span>Month-on-Month Growth:</span>
            <span className="text-on-tertiary-container font-bold">{acquisitionTrend.length > 0 ? '+18.4%' : '0.0%'} Customer Inflow</span>
          </div>
        </div>

        {/* Trend 2: Outstanding Customer Breakdown */}
        <div className="bg-surface-container-lowest p-4 rounded border border-surface-container-high shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-headline-md text-sm font-bold text-on-surface">Outstanding Distribution</div>
              <div className="text-[11px] text-outline">Receivables ageing by customer category</div>
            </div>
            <button
              onClick={() => onNavigate('payment-reminders')}
              className="text-secondary text-xs font-semibold hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>

          <div className="space-y-2.5 pt-1">
            {outstandingByType.length === 0 ? (
              <div className="py-8 text-center text-outline text-[11px] italic">
                No outstanding balances found across any categories.
              </div>
            ) : (
              outstandingByType.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-table-cell">
                    <span className="text-on-surface font-medium">{item.type}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-outline text-[11px]">{item.percent}%</span>
                      <span className="font-mono font-bold text-error">₹{item.amount.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="w-full bg-surface-container-high h-2 rounded overflow-hidden">
                    <div
                      className="bg-error h-full rounded"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-surface-container-high flex items-center justify-between text-[11px]">
            <span className="text-outline">Total Balance Pending:</span>
            <span className="font-mono font-bold text-error">₹{totalOutstanding.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Trend 3: Quick CRM Actions & Channel Stats */}
        <div className="bg-surface-container-lowest p-4 rounded border border-surface-container-high shadow-xs space-y-3">
          <div className="font-headline-md text-sm font-bold text-on-surface">Communication &amp; Referral Health</div>
          <div className="text-[11px] text-outline">Omnichannel engagement delivery</div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="p-2.5 rounded bg-surface-container-low border border-surface-container-high">
              <div className="flex items-center gap-1.5 text-on-tertiary-container text-xs font-bold">
                <span className="material-symbols-outlined text-[16px]">chat</span>
                <span>WhatsApp</span>
              </div>
              <div className="font-mono text-base font-bold text-on-surface mt-1">{whatsAppRate}%</div>
              <div className="text-[10px] text-outline">{whatsAppDelivered} delivered this week</div>
            </div>

            <div className="p-2.5 rounded bg-surface-container-low border border-surface-container-high">
              <div className="flex items-center gap-1.5 text-secondary text-xs font-bold">
                <span className="material-symbols-outlined text-[16px]">sms</span>
                <span>SMS Gateway</span>
              </div>
              <div className="font-mono text-base font-bold text-on-surface mt-1">{smsRate}%</div>
              <div className="text-[10px] text-outline">{smsDelivered} SMS reminders</div>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <div className="text-xs font-bold text-on-surface">Quick CRM Shortcuts</div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => onNavigate('customers')}
                className="p-2 text-left bg-surface-container hover:bg-surface-container-high rounded text-xs flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] text-secondary">search</span>
                <span className="truncate">Search by Vehicle</span>
              </button>
              <button
                onClick={() => onNavigate('loyalty-program')}
                className="p-2 text-left bg-surface-container hover:bg-surface-container-high rounded text-xs flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] text-secondary">tune</span>
                <span className="truncate">Configure Loyalty</span>
              </button>
              <button
                onClick={() => onNavigate('referral-system')}
                className="p-2 text-left bg-surface-container hover:bg-surface-container-high rounded text-xs flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] text-secondary">share_reviews</span>
                <span className="truncate">Referral Ledger</span>
              </button>
              <button
                onClick={() => onNavigate('crm-reports')}
                className="p-2 text-left bg-surface-container hover:bg-surface-container-high rounded text-xs flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] text-secondary">summarize</span>
                <span className="truncate">Export CRM Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Dual Grid: Top Customers & Most Active Mechanics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-sm">
        {/* Top Customers Card */}
        <div className="bg-surface-container-lowest rounded border border-surface-container-high shadow-xs overflow-hidden">
          <div className="p-3 bg-surface-container border-b border-surface-container-high flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-secondary">trophy</span>
              <span className="font-headline-md text-sm font-bold text-on-surface">Top Customers by Lifetime Sales</span>
            </div>
            <button
              onClick={() => onNavigate('customers')}
              className="text-secondary text-xs font-semibold hover:underline"
            >
              View All Customers
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-surface-container-low font-label-caps text-on-surface-variant uppercase text-[10px]">
                <tr>
                  <th className="py-2 px-3">Customer</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3 text-right">Total Sales</th>
                  <th className="py-2 px-3 text-right">Outstanding</th>
                  <th className="py-2 px-3 text-right">Loyalty Pts</th>
                  <th className="py-2 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high font-table-cell">
                {topCustomers.map(c => (
                  <tr key={c.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-2 px-3">
                      <div className="font-bold text-on-surface">{c.name}</div>
                      <div className="text-[11px] text-outline">{c.mobile} • {c.city}</div>
                    </td>
                    <td className="py-2 px-3">
                      <span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface text-[10px] font-semibold">
                        {c.customerType}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-on-surface">
                      ₹{c.totalSales.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2 px-3 text-right font-mono">
                      {c.outstanding > 0 ? (
                        <span className="text-error font-bold">₹{c.outstanding.toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="text-on-tertiary-container font-semibold">₹0.00</span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-secondary">
                      {c.loyaltyPoints}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() => onSelectCustomer(c.id)}
                        className="p-1 text-secondary hover:bg-surface-container rounded"
                        title="Open Customer Profile"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Most Active Mechanics Leaderboard */}
        <div className="bg-surface-container-lowest rounded border border-surface-container-high shadow-xs overflow-hidden">
          <div className="p-3 bg-surface-container border-b border-surface-container-high flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-secondary">engineering</span>
              <span className="font-headline-md text-sm font-bold text-on-surface">Most Active Mechanics &amp; Garages</span>
            </div>
            <button
              onClick={() => onNavigate('mechanics')}
              className="text-secondary text-xs font-semibold hover:underline"
            >
              Mechanic Portal
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-surface-container-low font-label-caps text-on-surface-variant uppercase text-[10px]">
                <tr>
                  <th className="py-2 px-3">Mechanic &amp; Workshop</th>
                  <th className="py-2 px-3">Code</th>
                  <th className="py-2 px-3 text-right">Referred Sales</th>
                  <th className="py-2 px-3 text-right">Referrals</th>
                  <th className="py-2 px-3 text-right">Points</th>
                  <th className="py-2 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high font-table-cell">
                {topMechanics.map(m => (
                  <tr key={m.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-2 px-3">
                      <div className="font-bold text-on-surface">{m.name}</div>
                      <div className="text-[11px] text-outline">{m.workshopName}</div>
                    </td>
                    <td className="py-2 px-3 font-mono text-[11px] text-secondary font-bold">
                      {m.customerCode}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-on-surface">
                      ₹{m.totalReferredSales.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-semibold text-outline">
                      {m.referralCount}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-secondary">
                      {m.loyaltyPoints}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        onClick={() => onSelectMechanic(m.id)}
                        className="p-1 text-secondary hover:bg-surface-container rounded"
                        title="View Mechanic Details"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Customer & Communication Activity Stream */}
      <div className="bg-surface-container-lowest rounded border border-surface-container-high shadow-xs p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-secondary">history</span>
            <span className="font-headline-md text-sm font-bold text-on-surface">Recent Customer Activity &amp; Communication Stream</span>
          </div>
          <span className="text-[11px] text-outline">Live Activity Log</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
          {communicationLogs.slice(0, 6).map(log => (
            <div
              key={log.id}
              className="p-2.5 rounded bg-surface-container-low border border-surface-container-high space-y-1.5 hover:border-secondary transition-colors cursor-pointer"
              onClick={() => onSelectCustomer(log.customerId)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`material-symbols-outlined text-[14px] ${log.channel === 'WhatsApp' ? 'text-on-tertiary-container' : 'text-secondary'}`}>
                    {log.channel === 'WhatsApp' ? 'chat' : 'sms'}
                  </span>
                  <span className="font-bold text-on-surface truncate max-w-[150px]">{log.customerName}</span>
                </div>
                <span className="text-[10px] text-outline font-mono">{log.date} {log.time}</span>
              </div>
              <p className="text-[11px] text-on-surface-variant line-clamp-2 italic bg-surface-container-lowest p-1.5 rounded border border-surface-container-high">
                "{log.message}"
              </p>
              <div className="flex items-center justify-between text-[10px] text-outline">
                <span>By: {log.user}</span>
                <span className="px-1.5 py-0.2 rounded bg-tertiary-fixed text-on-tertiary-fixed font-bold">
                  {log.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
