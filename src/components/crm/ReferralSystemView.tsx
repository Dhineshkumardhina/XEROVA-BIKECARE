import React, { useState } from 'react';
import { ReferralRecord, ReferralStatus } from '../../types';

interface ReferralSystemViewProps {
  referrals: ReferralRecord[];
  onOpenRecordReferral: () => void;
  onUpdateReferralStatus: (referralId: string, newStatus: ReferralStatus) => void;
}

export const ReferralSystemView: React.FC<ReferralSystemViewProps> = ({
  referrals,
  onOpenRecordReferral,
  onUpdateReferralStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // KPIs
  const totalReferrals = referrals.length;
  const successfulReferrals = referrals.filter(r => r.status === 'Successful' || r.status === 'Rewarded').length;
  const totalReferralSales = referrals.reduce((sum, r) => sum + r.salesAmount, 0);
  const totalRewardPoints = referrals.reduce((sum, r) => sum + r.rewardPoints, 0);
  const totalRewardCash = referrals.reduce((sum, r) => sum + r.rewardCash, 0);

  const filteredReferrals = referrals.filter(r => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      r.referrerName.toLowerCase().includes(q) ||
      r.referredCustomerName.toLowerCase().includes(q) ||
      r.invoiceNo.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col w-full pb-12 space-y-gutter animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface-container-lowest p-gutter rounded border border-surface-container-high shadow-xs gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">share_reviews</span>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Customer &amp; Mechanic Referral System</h1>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Track customer recommendations, mechanic commission incentives, and referral revenue growth
          </p>
        </div>

        <button
          onClick={onOpenRecordReferral}
          className="px-3.5 py-1.5 bg-secondary hover:bg-secondary-container text-on-secondary rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
          <span>+ Record Referral Sale</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm">
        <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs">
          <span className="font-label-caps text-label-caps text-outline uppercase">Total Referrals</span>
          <div className="font-numeric-lg text-xl font-bold text-on-surface mt-1">{totalReferrals}</div>
          <span className="text-[11px] text-outline">Leads &amp; recommendations</span>
        </div>

        <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs">
          <span className="font-label-caps text-label-caps text-outline uppercase">Successful Referrals</span>
          <div className="font-numeric-lg text-xl font-bold text-on-tertiary-container mt-1">{successfulReferrals}</div>
          <span className="text-[11px] text-outline">{((successfulReferrals / (totalReferrals || 1)) * 100).toFixed(0)}% conversion rate</span>
        </div>

        <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs">
          <span className="font-label-caps text-label-caps text-outline uppercase">Referral Sales Volume</span>
          <div className="font-numeric-lg text-xl font-bold text-secondary mt-1">₹{totalReferralSales.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-outline">Generated revenue</span>
        </div>

        <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs">
          <span className="font-label-caps text-label-caps text-outline uppercase">Total Rewards Distributed</span>
          <div className="font-numeric-lg text-xl font-bold text-on-surface mt-1">
            {totalRewardPoints} pts {totalRewardCash > 0 ? `+ ₹${totalRewardCash}` : ''}
          </div>
          <span className="text-[11px] text-on-tertiary-container font-medium">Incentives awarded</span>
        </div>
      </div>

      {/* Main Referrals Table */}
      <div className="bg-surface-container-lowest rounded border border-surface-container-high shadow-xs overflow-hidden space-y-3 p-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 border-b border-surface-container-high pb-3">
          <div className="relative w-full md:w-80">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-[18px] text-outline">search</span>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search Referrer, Customer, Invoice #..."
              className="w-full pl-9 pr-3 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-xs text-on-surface focus:outline-none focus:border-secondary"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-outline font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-2 py-1 bg-surface-container-low border border-surface-container-high rounded text-xs text-on-surface"
            >
              <option value="ALL">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Successful">Successful</option>
              <option value="Rewarded">Rewarded</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-surface-container font-label-caps text-on-surface-variant uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Referrer</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Referred Customer</th>
                <th className="py-2.5 px-3">Invoice #</th>
                <th className="py-2.5 px-3 text-right">Sales Amount</th>
                <th className="py-2.5 px-3 text-right">Reward Earned</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-table-cell">
              {filteredReferrals.map(ref => (
                <tr key={ref.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="py-2.5 px-3 font-mono text-outline">{ref.date}</td>

                  <td className="py-2.5 px-3">
                    <strong className="text-on-surface">{ref.referrerName}</strong>
                    {ref.referrerMobile && (
                      <div className="text-[11px] text-outline font-mono">{ref.referrerMobile}</div>
                    )}
                  </td>

                  <td className="py-2.5 px-3">
                    <span className="px-1.5 py-0.2 rounded bg-surface-container text-on-surface font-semibold text-[10px]">
                      {ref.referrerType}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 font-semibold text-on-surface">
                    {ref.referredCustomerName}
                  </td>

                  <td className="py-2.5 px-3 font-mono font-bold text-secondary">
                    {ref.invoiceNo}
                  </td>

                  <td className="py-2.5 px-3 text-right font-mono font-bold text-on-surface">
                    ₹{ref.salesAmount.toLocaleString('en-IN')}
                  </td>

                  <td className="py-2.5 px-3 text-right font-mono font-bold text-on-tertiary-container">
                    +{ref.rewardPoints} pts {ref.rewardCash > 0 ? `(₹${ref.rewardCash})` : ''}
                  </td>

                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                      ref.status === 'Rewarded' || ref.status === 'Successful'
                        ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                        : ref.status === 'Pending'
                        ? 'bg-secondary-fixed text-on-secondary-fixed'
                        : 'bg-error-container text-on-error-container'
                    }`}>
                      {ref.status}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {ref.status === 'Pending' && (
                        <button
                          onClick={() => onUpdateReferralStatus(ref.id, 'Rewarded')}
                          className="px-2 py-0.5 bg-secondary text-on-secondary rounded text-[10px] font-bold shadow-xs"
                        >
                          Approve Reward
                        </button>
                      )}
                      {ref.status === 'Successful' && (
                        <button
                          onClick={() => onUpdateReferralStatus(ref.id, 'Rewarded')}
                          className="px-2 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed rounded text-[10px] font-bold"
                        >
                          Disburse
                        </button>
                      )}
                      {ref.status !== 'Cancelled' && (
                        <button
                          onClick={() => onUpdateReferralStatus(ref.id, 'Cancelled')}
                          className="p-1 rounded text-outline hover:text-error"
                          title="Cancel Referral"
                        >
                          <span className="material-symbols-outlined text-[14px]">cancel</span>
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
