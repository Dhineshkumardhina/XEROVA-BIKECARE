import React, { useState } from 'react';
import { MechanicRecord, ReferralRecord } from '../../types';

interface MechanicManagementViewProps {
  mechanics: MechanicRecord[];
  referrals: ReferralRecord[];
  onOpenNewMechanic: () => void;
  onOpenRecordReferral: (mechanic?: MechanicRecord) => void;
  onSelectMechanic: (mechanicId: string) => void;
  onSettleMechanicCommission: (mechanic: MechanicRecord) => void;
}

export const MechanicManagementView: React.FC<MechanicManagementViewProps> = ({
  mechanics,
  referrals,
  onOpenNewMechanic,
  onOpenRecordReferral,
  onSelectMechanic,
  onSettleMechanicCommission
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Inactive'>('ALL');
  const [selectedMechanicForDrawer, setSelectedMechanicForDrawer] = useState<MechanicRecord | null>(null);

  // KPIs
  const totalMechanics = mechanics.length;
  const activeMechanics = mechanics.filter(m => m.status === 'Active').length;
  const totalReferredSales = mechanics.reduce((sum, m) => sum + m.totalReferredSales, 0);
  const totalMechanicPoints = mechanics.reduce((sum, m) => sum + m.loyaltyPoints, 0);
  const totalPendingRewards = mechanics.reduce((sum, m) => sum + (m.pendingRewardAmount || 0), 0);

  // Top Mechanics Leaderboard
  const topMechanics = [...mechanics].sort((a, b) => b.totalReferredSales - a.totalReferredSales);

  // Filtered mechanics
  const filteredMechanics = mechanics.filter(m => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.workshopName.toLowerCase().includes(q) ||
      m.mobile.includes(q) ||
      m.customerCode.toLowerCase().includes(q) ||
      m.location.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col w-full pb-12 space-y-gutter animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface-container-lowest p-gutter rounded border border-surface-container-high shadow-xs gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">engineering</span>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Mechanic Management &amp; Referral Partner Network</h1>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Manage affiliated bike mechanics, workshop technicians, referral commission incentives and loyalty rewards
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenRecordReferral()}
            className="px-3 py-1.5 bg-surface-container text-on-surface hover:bg-surface-container-high rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-secondary">share_reviews</span>
            <span>+ Record Referral Sale</span>
          </button>
          <button
            onClick={onOpenNewMechanic}
            className="px-3.5 py-1.5 bg-secondary hover:bg-secondary-container text-on-secondary rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            <span>+ Add Mechanic</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-space-sm">
        <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs">
          <span className="font-label-caps text-label-caps text-outline uppercase">Total Mechanics</span>
          <div className="font-numeric-lg text-xl font-bold text-on-surface mt-1">{totalMechanics}</div>
          <span className="text-[11px] text-outline">{activeMechanics} active partners</span>
        </div>

        <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs">
          <span className="font-label-caps text-label-caps text-outline uppercase">Total Referred Sales</span>
          <div className="font-numeric-lg text-xl font-bold text-secondary mt-1">₹{totalReferredSales.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-on-tertiary-container font-medium">Brought via referrals</span>
        </div>

        <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs">
          <span className="font-label-caps text-label-caps text-outline uppercase">Total Loyalty Points</span>
          <div className="font-numeric-lg text-xl font-bold text-on-surface mt-1">{totalMechanicPoints.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-outline">Credited points</span>
        </div>

        <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs">
          <span className="font-label-caps text-label-caps text-outline uppercase">Pending Cash Rewards</span>
          <div className="font-numeric-lg text-xl font-bold text-error mt-1">₹{totalPendingRewards.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-outline">Unsettled incentives</span>
        </div>

        <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs">
          <span className="font-label-caps text-label-caps text-outline uppercase">Avg Commission</span>
          <div className="font-numeric-lg text-xl font-bold text-on-surface mt-1">5.0%</div>
          <span className="text-[11px] text-outline">On counter spares</span>
        </div>
      </div>

      {/* Top Mechanics Leaderboard & Recent Referrals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-sm">
        {/* Top 3 Mechanics High Performers */}
        <div className="lg:col-span-1 bg-surface-container-lowest p-4 rounded border border-surface-container-high shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-headline-md text-sm font-bold text-on-surface">Top Performing Mechanics</span>
            <span className="material-symbols-outlined text-secondary text-[18px]">trophy</span>
          </div>

          <div className="space-y-2.5">
            {topMechanics.length === 0 ? (
              <div className="py-6 text-center text-outline text-[11px] italic">
                No active mechanics found.
              </div>
            ) : (
              topMechanics.slice(0, 3).map((m, idx) => (
                <div key={m.id} className="p-2.5 rounded bg-surface-container-low border border-surface-container-high space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-secondary text-on-secondary text-[11px] font-bold flex items-center justify-center font-mono">
                        #{idx + 1}
                      </span>
                      <strong className="text-xs text-on-surface">{m.name}</strong>
                    </div>
                    <span className="font-mono text-xs font-bold text-secondary">
                      ₹{m.totalReferredSales.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-[11px] text-outline flex justify-between">
                    <span>{m.workshopName}</span>
                    <span>{m.referralCount} referrals</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Referrals Stream */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-4 rounded border border-surface-container-high shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-headline-md text-sm font-bold text-on-surface">Recent Referral Sales Log</span>
            <span className="text-xs text-outline">{referrals.length} Referrals Tracked</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-surface-container-low font-label-caps text-on-surface-variant uppercase text-[10px]">
                <tr>
                  <th className="p-2">Date</th>
                  <th className="p-2">Mechanic / Referrer</th>
                  <th className="p-2">Referred Customer</th>
                  <th className="p-2">Invoice #</th>
                  <th className="p-2 text-right">Bill Value</th>
                  <th className="p-2 text-right">Reward</th>
                  <th className="p-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high font-table-cell">
                {referrals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-outline text-[11px] italic">
                      No recent referral sales logged.
                    </td>
                  </tr>
                ) : (
                  referrals.slice(0, 4).map(r => (
                    <tr key={r.id} className="hover:bg-surface-container-low">
                      <td className="p-2 text-outline font-mono">{r.date}</td>
                      <td className="p-2 font-bold text-on-surface">{r.referrerName}</td>
                      <td className="p-2 text-on-surface-variant">{r.referredCustomerName}</td>
                      <td className="p-2 font-mono text-secondary font-bold">{r.invoiceNo}</td>
                      <td className="p-2 text-right font-mono font-bold">₹{r.salesAmount.toLocaleString('en-IN')}</td>
                      <td className="p-2 text-right font-mono text-on-tertiary-container font-semibold">
                        +{r.rewardPoints} pts {r.rewardCash > 0 ? `(₹${r.rewardCash})` : ''}
                      </td>
                      <td className="p-2 text-center">
                        <span className={`px-1.5 py-0.2 rounded font-bold text-[9px] uppercase ${
                          r.status === 'Rewarded' || r.status === 'Successful'
                            ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                            : r.status === 'Pending'
                            ? 'bg-secondary-fixed text-on-secondary-fixed'
                            : 'bg-error-container text-on-error-container'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Main Mechanics Table */}
      <div className="bg-surface-container-lowest rounded border border-surface-container-high shadow-xs overflow-hidden space-y-3 p-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 border-b border-surface-container-high pb-3">
          <div className="relative w-full md:w-80">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-[18px] text-outline">search</span>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search Mechanic, Workshop, Mobile, Code..."
              className="w-full pl-9 pr-3 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-xs text-on-surface focus:outline-none focus:border-secondary"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-outline font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="px-2 py-1 bg-surface-container-low border border-surface-container-high rounded text-xs text-on-surface"
            >
              <option value="ALL">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-surface-container font-label-caps text-on-surface-variant uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Mechanic Name</th>
                <th className="py-2.5 px-3">Mobile</th>
                <th className="py-2.5 px-3">Workshop &amp; Area</th>
                <th className="py-2.5 px-3">Referral Code</th>
                <th className="py-2.5 px-3 text-right">Loyalty Points</th>
                <th className="py-2.5 px-3 text-right">Total Referred Sales</th>
                <th className="py-2.5 px-3 text-right">Pending Cash</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-table-cell">
              {filteredMechanics.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-outline">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-4xl opacity-50">engineering</span>
                      <p className="font-semibold text-on-surface text-base">No mechanics found.</p>
                      <p className="text-xs">Try adjusting your filters or add a new mechanic.</p>
                    </div>
                  </td>
                </tr>
              )}
              {filteredMechanics.map(m => (
                <tr key={m.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-on-surface">{m.name}</div>
                    <div className="text-[11px] text-outline">Joined: {m.joinedDate}</div>
                  </td>

                  <td className="py-2.5 px-3 font-mono text-on-surface font-medium">
                    {m.mobile}
                  </td>

                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-on-surface">{m.workshopName}</div>
                    <div className="text-[11px] text-outline">{m.location}</div>
                  </td>

                  <td className="py-2.5 px-3 font-mono text-secondary font-bold">
                    {m.customerCode}
                  </td>

                  <td className="py-2.5 px-3 text-right font-mono font-bold text-secondary">
                    {m.loyaltyPoints} pts
                  </td>

                  <td className="py-2.5 px-3 text-right font-mono font-bold text-on-surface">
                    ₹{m.totalReferredSales.toLocaleString('en-IN')}
                    <div className="text-[10px] text-outline font-normal">{m.referralCount} referrals</div>
                  </td>

                  <td className="py-2.5 px-3 text-right font-mono">
                    {m.pendingRewardAmount && m.pendingRewardAmount > 0 ? (
                      <span className="font-bold text-error">₹{m.pendingRewardAmount.toLocaleString('en-IN')}</span>
                    ) : (
                      <span className="text-on-tertiary-container font-semibold">₹0.00</span>
                    )}
                  </td>

                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                      m.status === 'Active' ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-surface-container text-outline'
                    }`}>
                      {m.status}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setSelectedMechanicForDrawer(m)}
                        className="p-1 rounded text-secondary hover:bg-surface-container"
                        title="View Details"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                      </button>
                      <button
                        onClick={() => onOpenRecordReferral(m)}
                        className="p-1 rounded text-on-tertiary-container hover:bg-surface-container"
                        title="Add Referral Sale"
                      >
                        <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                      </button>
                      {m.pendingRewardAmount && m.pendingRewardAmount > 0 ? (
                        <button
                          onClick={() => onSettleMechanicCommission(m)}
                          className="px-2 py-0.5 bg-secondary text-on-secondary rounded text-[10px] font-bold shadow-xs"
                          title="Settle via UPI"
                        >
                          Settle ₹{m.pendingRewardAmount}
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mechanic Details Drawer */}
      {selectedMechanicForDrawer && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-end">
          <div className="w-full max-w-md bg-surface-container-lowest h-full shadow-2xl p-6 overflow-y-auto space-y-4 border-l border-surface-container-high">
            <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
              <div>
                <h3 className="font-headline-md text-base font-bold text-on-surface">{selectedMechanicForDrawer.name}</h3>
                <p className="text-xs text-outline">{selectedMechanicForDrawer.workshopName}</p>
              </div>
              <button
                onClick={() => setSelectedMechanicForDrawer(null)}
                className="text-outline hover:text-on-surface p-1 rounded"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded bg-surface-container-low border border-surface-container-high space-y-2">
                <div className="flex justify-between">
                  <span className="text-outline">Referral Code:</span>
                  <span className="font-mono font-bold text-secondary">{selectedMechanicForDrawer.customerCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Mobile:</span>
                  <span className="font-mono font-bold text-on-surface">{selectedMechanicForDrawer.mobile}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">UPI ID:</span>
                  <span className="font-mono text-on-surface">{selectedMechanicForDrawer.upiId || 'Not Configured'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Commission Rate:</span>
                  <span className="font-bold text-on-tertiary-container">{selectedMechanicForDrawer.commissionRatePercent}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-outline">Location:</span>
                  <span className="text-on-surface">{selectedMechanicForDrawer.location}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded bg-surface-container text-center">
                  <span className="text-[10px] text-outline uppercase font-bold block">Loyalty Balance</span>
                  <span className="font-mono text-lg font-bold text-secondary mt-1 block">
                    {selectedMechanicForDrawer.loyaltyPoints} pts
                  </span>
                </div>
                <div className="p-3 rounded bg-surface-container text-center">
                  <span className="text-[10px] text-outline uppercase font-bold block">Pending Cash</span>
                  <span className="font-mono text-lg font-bold text-error mt-1 block">
                    ₹{selectedMechanicForDrawer.pendingRewardAmount || 0}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-surface-container-high space-y-2">
                <button
                  onClick={() => {
                    const m = selectedMechanicForDrawer;
                    setSelectedMechanicForDrawer(null);
                    onOpenRecordReferral(m);
                  }}
                  className="w-full py-2 bg-secondary text-on-secondary rounded text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                  <span>Record New Referral Sale</span>
                </button>
                {selectedMechanicForDrawer.pendingRewardAmount && selectedMechanicForDrawer.pendingRewardAmount > 0 ? (
                  <button
                    onClick={() => {
                      const m = selectedMechanicForDrawer;
                      setSelectedMechanicForDrawer(null);
                      onSettleMechanicCommission(m);
                    }}
                    className="w-full py-2 bg-tertiary-fixed text-on-tertiary-fixed rounded text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">payments</span>
                    <span>Settle Incentive (₹{selectedMechanicForDrawer.pendingRewardAmount})</span>
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
