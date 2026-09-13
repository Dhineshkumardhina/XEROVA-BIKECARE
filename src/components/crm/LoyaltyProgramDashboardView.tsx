import React, { useState } from 'react';
import { LoyaltyRuleConfig, LoyaltyTransactionRecord, CustomerProfileData } from '../../types';

interface LoyaltyProgramDashboardViewProps {
  loyaltyRules: LoyaltyRuleConfig;
  loyaltyTransactions: LoyaltyTransactionRecord[];
  customers: CustomerProfileData[];
  onSaveLoyaltyRules: (rules: LoyaltyRuleConfig) => void;
  onOpenAdjustPoints: (customer?: CustomerProfileData) => void;
  onOpenRedeemPoints: (customer?: CustomerProfileData) => void;
  onSelectCustomer: (customerId: string) => void;
}

export const LoyaltyProgramDashboardView: React.FC<LoyaltyProgramDashboardViewProps> = ({
  loyaltyRules,
  loyaltyTransactions,
  customers,
  onSaveLoyaltyRules,
  onOpenAdjustPoints,
  onOpenRedeemPoints,
  onSelectCustomer
}) => {
  const [editableRules, setEditableRules] = useState<LoyaltyRuleConfig>(loyaltyRules);
  const [isSavedToast, setIsSavedToast] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'rules' | 'ledger'>('overview');
  const [txTypeFilter, setTxTypeFilter] = useState<string>('ALL');

  // KPIs
  const totalPointsIssued = customers.reduce((sum, c) => sum + c.loyaltyPoints, 0);
  const totalEarnedPoints = loyaltyTransactions
    .filter(t => t.pointsDelta > 0)
    .reduce((sum, t) => sum + t.pointsDelta, 0);
  const totalPointsRedeemed = Math.abs(
    loyaltyTransactions.filter(t => t.type === 'Redemption').reduce((sum, t) => sum + t.pointsDelta, 0)
  );
  const activeMembers = customers.filter(c => c.loyaltyPoints > 0).length;
  const pendingDiscountValue = totalPointsIssued * (loyaltyRules.redemptionValuePerPoint || 1);

  const handleSaveRules = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveLoyaltyRules(editableRules);
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 3000);
  };

  const filteredTransactions = loyaltyTransactions.filter(t => {
    if (txTypeFilter === 'ALL') return true;
    return t.type === txTypeFilter;
  });

  return (
    <div className="flex flex-col w-full pb-12 space-y-gutter animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface-container-lowest p-gutter rounded border border-surface-container-high shadow-xs gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">stars</span>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Loyalty Rewards &amp; Point Program Engine</h1>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Configure earn/burn rules, manage member point balances, issue manual adjustments, and audit redemption ledgers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenAdjustPoints()}
            className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-secondary">tune</span>
            <span>Manual Point Adjustment</span>
          </button>
          <button
            onClick={() => onOpenRedeemPoints()}
            className="px-3.5 py-1.5 bg-secondary hover:bg-secondary-container text-on-secondary rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">redeem</span>
            <span>Redeem Points</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm">
        <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs">
          <span className="font-label-caps text-label-caps text-outline uppercase">Active Points in Circulation</span>
          <div className="font-numeric-lg text-xl font-bold text-secondary mt-1">{totalPointsIssued.toLocaleString('en-IN')} pts</div>
          <span className="text-[11px] text-outline">Across {activeMembers} members</span>
        </div>

        <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs">
          <span className="font-label-caps text-label-caps text-outline uppercase">Total Points Redeemed</span>
          <div className="font-numeric-lg text-xl font-bold text-on-tertiary-container mt-1">{totalPointsRedeemed.toLocaleString('en-IN')} pts</div>
          <span className="text-[11px] text-outline">₹{totalPointsRedeemed.toLocaleString('en-IN')} in counter discounts</span>
        </div>

        <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs">
          <span className="font-label-caps text-label-caps text-outline uppercase">Active Club Members</span>
          <div className="font-numeric-lg text-xl font-bold text-on-surface mt-1">{activeMembers}</div>
          <span className="text-[11px] text-outline">{((activeMembers / (customers.length || 1)) * 100).toFixed(0)}% customer enrollment</span>
        </div>

        <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs">
          <span className="font-label-caps text-label-caps text-outline uppercase">Pending Reward Liability</span>
          <div className="font-numeric-lg text-xl font-bold text-error mt-1">₹{pendingDiscountValue.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-outline">At ₹{loyaltyRules.redemptionValuePerPoint}/point</span>
        </div>
      </div>

      {/* Subnavigation Tabs */}
      <div className="flex border-b border-surface-container-high bg-surface-container-lowest rounded-t">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-secondary text-secondary bg-surface-container-low'
              : 'border-transparent text-outline hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">dashboard</span>
          <span>Program Overview</span>
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'rules'
              ? 'border-secondary text-secondary bg-surface-container-low'
              : 'border-transparent text-outline hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">settings</span>
          <span>Point &amp; Tier Rules Config</span>
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
            activeTab === 'ledger'
              ? 'border-secondary text-secondary bg-surface-container-low'
              : 'border-transparent text-outline hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">history</span>
          <span>Audited Transaction Ledger</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-gutter">
          {/* Top Points Holders Table */}
          <div className="bg-surface-container-lowest rounded border border-surface-container-high shadow-xs overflow-hidden">
            <div className="p-3 bg-surface-container border-b border-surface-container-high flex items-center justify-between">
              <span className="font-headline-md text-sm font-bold text-on-surface">Loyalty Club Members &amp; Balances</span>
              <span className="text-xs text-outline">{activeMembers} Active Members</span>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-surface-container-low font-label-caps text-on-surface-variant uppercase text-[10px]">
                <tr>
                  <th className="py-2 px-3">Customer Name</th>
                  <th className="py-2 px-3">Mobile</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Tier</th>
                  <th className="py-2 px-3 text-right">Points Balance</th>
                  <th className="py-2 px-3 text-right">Discount Value</th>
                  <th className="py-2 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high font-table-cell">
                {customers.map(c => (
                  <tr key={c.id} className="hover:bg-surface-container-low">
                    <td className="py-2 px-3">
                      <strong className="text-on-surface">{c.name}</strong>
                      <div className="text-[11px] text-outline">Card #{c.loyaltyCardNumber || 'N/A'}</div>
                    </td>
                    <td className="py-2 px-3 font-mono text-on-surface">{c.mobile}</td>
                    <td className="py-2 px-3">{c.customerType}</td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded bg-surface-container-highest text-secondary text-[10px] font-bold">
                        {c.loyaltyTier || 'Silver'}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-secondary text-sm">
                      {c.loyaltyPoints} pts
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-on-tertiary-container">
                      ₹{(c.loyaltyPoints * loyaltyRules.redemptionValuePerPoint).toFixed(2)}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onSelectCustomer(c.id)}
                          className="p-1 rounded text-secondary hover:bg-surface-container"
                          title="Open Customer Profile"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                        </button>
                        <button
                          onClick={() => onOpenAdjustPoints(c)}
                          className="p-1 rounded text-outline hover:text-secondary hover:bg-surface-container"
                          title="Audit Adjust Points"
                        >
                          <span className="material-symbols-outlined text-[16px]">tune</span>
                        </button>
                        <button
                          onClick={() => onOpenRedeemPoints(c)}
                          disabled={c.loyaltyPoints < loyaltyRules.minRedemptionPoints}
                          className="px-2 py-0.5 bg-secondary text-on-secondary rounded text-[10px] font-bold disabled:opacity-40"
                          title="Redeem Points"
                        >
                          Redeem
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Configurable Loyalty Rules Panel */}
      {activeTab === 'rules' && (
        <form onSubmit={handleSaveRules} className="bg-surface-container-lowest p-6 rounded border border-surface-container-high shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
            <div>
              <h3 className="font-headline-md text-base font-bold text-on-surface">Configurable Loyalty Program Parameters</h3>
              <p className="text-xs text-outline mt-0.5">Control how points are earned, awarded, valued, and expired across retail and wholesale billing</p>
            </div>
            {isSavedToast && (
              <span className="px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed font-bold text-xs rounded animate-in fade-in">
                ✓ Loyalty Rules Updated &amp; Saved
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            {/* Purchase Points */}
            <div className="p-4 rounded bg-surface-container-low border border-surface-container-high space-y-2">
              <label className="font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-[16px]">shopping_cart</span>
                <span>Points Earn Rate (Spend Threshold)</span>
              </label>
              <p className="text-[11px] text-outline">How many rupees of customer billing awards 1 loyalty point?</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="font-mono font-bold text-on-surface">₹</span>
                <input
                  type="number"
                  min="10"
                  step="10"
                  value={editableRules.pointsPerRupeesSpent}
                  onChange={e => setEditableRules({ ...editableRules, pointsPerRupeesSpent: Number(e.target.value) })}
                  className="w-24 px-2 py-1 bg-surface-container-lowest border border-surface-container-high rounded font-mono font-bold text-on-surface focus:outline-none focus:border-secondary"
                />
                <span className="text-outline font-medium">= 1 Point Earned</span>
              </div>
            </div>

            {/* Referral Bonus */}
            <div className="p-4 rounded bg-surface-container-low border border-surface-container-high space-y-2">
              <label className="font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-[16px]">share_reviews</span>
                <span>Referral Reward Points</span>
              </label>
              <p className="text-[11px] text-outline">Points credited to referring mechanic or customer per verified sale.</p>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="number"
                  min="0"
                  value={editableRules.pointsPerReferral}
                  onChange={e => setEditableRules({ ...editableRules, pointsPerReferral: Number(e.target.value) })}
                  className="w-24 px-2 py-1 bg-surface-container-lowest border border-surface-container-high rounded font-mono font-bold text-on-surface focus:outline-none focus:border-secondary"
                />
                <span className="text-outline font-medium">Points per referral</span>
              </div>
            </div>

            {/* Welcome Bonus Points */}
            <div className="p-4 rounded bg-surface-container-low border border-surface-container-high space-y-2">
              <label className="font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-[16px]">card_giftcard</span>
                <span>Welcome Bonus Points</span>
              </label>
              <p className="text-[11px] text-outline">One-time registration bonus on customer 1st bill.</p>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="number"
                  min="0"
                  value={editableRules.bonusPointsNewCustomer}
                  onChange={e => setEditableRules({ ...editableRules, bonusPointsNewCustomer: Number(e.target.value) })}
                  className="w-24 px-2 py-1 bg-surface-container-lowest border border-surface-container-high rounded font-mono font-bold text-on-surface focus:outline-none focus:border-secondary"
                />
                <span className="text-outline font-medium">Points upon joining</span>
              </div>
            </div>

            {/* Redemption Value */}
            <div className="p-4 rounded bg-surface-container-low border border-surface-container-high space-y-2">
              <label className="font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-[16px]">currency_rupee</span>
                <span>Point Redemption Conversion Value</span>
              </label>
              <p className="text-[11px] text-outline">Rupees of cash discount allowed per 1 loyalty point.</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-outline font-medium">1 Point = ₹</span>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={editableRules.redemptionValuePerPoint}
                  onChange={e => setEditableRules({ ...editableRules, redemptionValuePerPoint: Number(e.target.value) })}
                  className="w-24 px-2 py-1 bg-surface-container-lowest border border-surface-container-high rounded font-mono font-bold text-on-surface focus:outline-none focus:border-secondary"
                />
                <span className="text-outline font-medium">Discount</span>
              </div>
            </div>

            {/* Minimum Redemption Threshold */}
            <div className="p-4 rounded bg-surface-container-low border border-surface-container-high space-y-2">
              <label className="font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-[16px]">lock_clock</span>
                <span>Minimum Redemption Threshold</span>
              </label>
              <p className="text-[11px] text-outline">Minimum points required in account before discount redemption.</p>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="number"
                  min="50"
                  step="50"
                  value={editableRules.minRedemptionPoints}
                  onChange={e => setEditableRules({ ...editableRules, minRedemptionPoints: Number(e.target.value) })}
                  className="w-24 px-2 py-1 bg-surface-container-lowest border border-surface-container-high rounded font-mono font-bold text-on-surface focus:outline-none focus:border-secondary"
                />
                <span className="text-outline font-medium">Minimum points</span>
              </div>
            </div>

            {/* Expiry Period */}
            <div className="p-4 rounded bg-surface-container-low border border-surface-container-high space-y-2">
              <label className="font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-[16px]">timer</span>
                <span>Point Expiry Validity Period</span>
              </label>
              <p className="text-[11px] text-outline">Number of days after purchase before unused points expire.</p>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="number"
                  min="30"
                  step="30"
                  value={editableRules.expiryPeriodDays}
                  onChange={e => setEditableRules({ ...editableRules, expiryPeriodDays: Number(e.target.value) })}
                  className="w-24 px-2 py-1 bg-surface-container-lowest border border-surface-container-high rounded font-mono font-bold text-on-surface focus:outline-none focus:border-secondary"
                />
                <span className="text-outline font-medium">Days (e.g. 365 days = 1 year)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-surface-container-high flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditableRules(loyaltyRules)}
              className="px-4 py-2 bg-surface-container text-on-surface rounded font-semibold text-xs"
            >
              Reset Changes
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-secondary text-on-secondary rounded font-bold text-xs shadow-xs"
            >
              Save &amp; Apply Loyalty Rules
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Audited Transaction Ledger */}
      {activeTab === 'ledger' && (
        <div className="bg-surface-container-lowest rounded border border-surface-container-high shadow-xs overflow-hidden space-y-3 p-3">
          <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
            <div>
              <span className="font-headline-md text-sm font-bold text-on-surface">Complete Loyalty Points Audit Log</span>
              <p className="text-xs text-outline">Every purchase credit, referral bonus, manual audit, and counter redemption</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-outline font-medium">Type:</span>
              <select
                value={txTypeFilter}
                onChange={e => setTxTypeFilter(e.target.value)}
                className="px-2 py-1 bg-surface-container-low border border-surface-container-high rounded text-xs text-on-surface"
              >
                <option value="ALL">All Types</option>
                <option value="Purchase">Purchase</option>
                <option value="Referral">Referral</option>
                <option value="Bonus">Bonus</option>
                <option value="Redemption">Redemption</option>
                <option value="Adjustment">Adjustment</option>
                <option value="Expiry">Expiry</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-surface-container font-label-caps text-on-surface-variant uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">Date / Time</th>
                  <th className="p-2.5">Customer Name</th>
                  <th className="p-2.5">Ref #</th>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5 text-right">Points</th>
                  <th className="p-2.5 text-right">Balance</th>
                  <th className="p-2.5">Audit Reason / Description</th>
                  <th className="p-2.5">Audited By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high font-table-cell">
                {filteredTransactions.map(t => (
                  <tr key={t.id} className="hover:bg-surface-container-low">
                    <td className="p-2.5 text-outline font-mono">{t.date} {t.time}</td>
                    <td className="p-2.5 font-bold text-on-surface">{t.customerName}</td>
                    <td className="p-2.5 font-mono text-secondary font-bold">{t.reference}</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                        t.type === 'Purchase' || t.type === 'Bonus' || t.type === 'Referral'
                          ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                          : t.type === 'Redemption'
                          ? 'bg-error-container text-on-error-container'
                          : 'bg-surface-container text-on-surface'
                      }`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold">
                      {t.pointsDelta >= 0 ? (
                        <span className="text-on-tertiary-container">+{t.pointsDelta}</span>
                      ) : (
                        <span className="text-error">{t.pointsDelta}</span>
                      )}
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold text-on-surface">{t.balanceAfter} pts</td>
                    <td className="p-2.5 text-outline">{t.notes || '—'}</td>
                    <td className="p-2.5 text-[11px] text-outline font-mono">{t.auditedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
