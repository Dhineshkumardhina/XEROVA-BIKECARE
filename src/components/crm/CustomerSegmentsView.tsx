import React, { useState } from 'react';
import { CustomerSegment, CustomerProfileData } from '../../types';

interface CustomerSegmentsViewProps {
  segments: CustomerSegment[];
  customers: CustomerProfileData[];
  onSelectCustomer: (customerId: string) => void;
  onNavigateBulkWithSegment: (segmentName: string) => void;
  onSaveNewSegment: (newSegment: CustomerSegment) => void;
}

export const CustomerSegmentsView: React.FC<CustomerSegmentsViewProps> = ({
  segments,
  customers,
  onSelectCustomer,
  onNavigateBulkWithSegment,
  onSaveNewSegment
}) => {
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>(segments[0]?.id || 'seg-1');
  const [isCreatingSegment, setIsCreatingSegment] = useState(false);
  const [newSegName, setNewSegName] = useState('');
  const [newSegDesc, setNewSegDesc] = useState('');
  const [newSegCriteria, setNewSegCriteria] = useState('totalSales > 50000');

  const currentSegment = segments.find(s => s.id === selectedSegmentId) || segments[0];

  // Evaluate matching customers for active segment
  const segmentCustomers = customers.filter(c => {
    if (!currentSegment) return true;
    const sId = currentSegment.id;
    if (sId === 'seg-1') return c.totalSales >= 100000;
    if (sId === 'seg-2') return c.totalPurchasesCount >= 15;
    if (sId === 'seg-3') return c.status === 'Inactive';
    if (sId === 'seg-4') return c.outstanding > 0;
    if (sId === 'seg-5') return c.createdDate.includes('2026');
    if (sId === 'seg-6') return ['Wholesale', 'Workshop', 'Dealer', 'Fleet'].includes(c.customerType);
    if (sId === 'seg-7') return c.customerType === 'Mechanic';
    if (sId === 'seg-8') return c.loyaltyPoints >= 1000;
    return true;
  });

  const handleCreateSegmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSegName.trim()) return;

    const seg: CustomerSegment = {
      id: 'seg-' + Date.now(),
      name: newSegName,
      description: newSegDesc || 'Custom filtered buyer audience',
      icon: 'category',
      color: 'text-secondary',
      criteria: newSegCriteria,
      customerCount: 3,
      totalSales: 84000,
      isSystem: false
    };

    onSaveNewSegment(seg);
    setSelectedSegmentId(seg.id);
    setIsCreatingSegment(false);
    setNewSegName('');
    setNewSegDesc('');
  };

  return (
    <div className="flex flex-col w-full pb-12 space-y-gutter animate-in fade-in duration-150">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface-container-lowest p-gutter rounded border border-surface-container-high shadow-xs gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">pie_chart</span>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Customer Intelligence &amp; Dynamic Segmentation</h1>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Segment buyers by purchase volume, frequency, overdue balances, and mechanic affiliation for targeted outreach
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreatingSegment(true)}
            className="px-3.5 py-1.5 bg-secondary hover:bg-secondary-container text-on-secondary rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>+ New Custom Segment</span>
          </button>
        </div>
      </div>

      {/* Segment Cards Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-space-sm">
        {segments.map(seg => {
          const isSelected = seg.id === selectedSegmentId;
          return (
            <div
              key={seg.id}
              onClick={() => setSelectedSegmentId(seg.id)}
              className={`p-3.5 rounded border transition-colors cursor-pointer space-y-2 ${
                isSelected
                  ? 'bg-surface-container-low border-secondary shadow-xs'
                  : 'bg-surface-container-lowest border-surface-container-high hover:border-secondary'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`material-symbols-outlined text-xl ${seg.color}`}>
                  {seg.icon}
                </span>
                <span className="font-mono text-xs font-bold text-on-surface">
                  {seg.customerCount} customers
                </span>
              </div>
              <div>
                <h4 className="font-bold text-on-surface text-xs">{seg.name}</h4>
                <p className="text-[11px] text-outline line-clamp-2 mt-0.5">{seg.description}</p>
              </div>
              <div className="pt-1 border-t border-surface-container-high flex justify-between items-center text-[10px]">
                <span className="text-outline">Sales:</span>
                <span className="font-mono font-bold text-secondary">₹{seg.totalSales.toLocaleString('en-IN')}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create New Segment Modal / Panel */}
      {isCreatingSegment && (
        <form onSubmit={handleCreateSegmentSubmit} className="p-4 bg-surface-container-lowest rounded border border-secondary shadow-sm space-y-3 animate-in fade-in">
          <div className="flex justify-between items-center border-b border-surface-container-high pb-2">
            <h3 className="font-headline-md text-xs font-bold text-on-surface">+ Define New Custom Customer Segment</h3>
            <button
              type="button"
              onClick={() => setIsCreatingSegment(false)}
              className="text-outline hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-outline font-medium mb-1">Segment Name</label>
              <input
                type="text"
                required
                value={newSegName}
                onChange={e => setNewSegName(e.target.value)}
                placeholder="e.g. Royal Enfield Enthusiasts"
                className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-on-surface"
              />
            </div>

            <div>
              <label className="block text-outline font-medium mb-1">Description</label>
              <input
                type="text"
                value={newSegDesc}
                onChange={e => setNewSegDesc(e.target.value)}
                placeholder="e.g. Frequent bullet spares counter buyers"
                className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-on-surface"
              />
            </div>

            <div>
              <label className="block text-outline font-medium mb-1">Filter Condition Rule</label>
              <input
                type="text"
                value={newSegCriteria}
                onChange={e => setNewSegCriteria(e.target.value)}
                placeholder="e.g. vehicle.make == 'Royal Enfield'"
                className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded font-mono text-on-surface"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-surface-container-high">
            <button
              type="button"
              onClick={() => setIsCreatingSegment(false)}
              className="px-3 py-1.5 bg-surface-container text-on-surface rounded text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-secondary text-on-secondary rounded text-xs font-bold shadow-xs"
            >
              Save Segment
            </button>
          </div>
        </form>
      )}

      {/* Segment Member Customers Table */}
      <div className="bg-surface-container-lowest rounded border border-surface-container-high shadow-xs overflow-hidden space-y-3 p-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 border-b border-surface-container-high pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-headline-md text-sm font-bold text-on-surface">
                {currentSegment?.name} Members
              </span>
              <span className="px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold">
                {segmentCustomers.length} Matching
              </span>
            </div>
            <p className="text-xs text-outline mt-0.5">{currentSegment?.description}</p>
          </div>

          <button
            onClick={() => onNavigateBulkWithSegment(currentSegment?.name || 'Segment')}
            className="px-3.5 py-1.5 bg-secondary text-on-secondary rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">campaign</span>
            <span>Broadcast Campaign to this Segment</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-surface-container font-label-caps text-on-surface-variant uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Customer Name</th>
                <th className="py-2.5 px-3">Mobile</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">City</th>
                <th className="py-2.5 px-3 text-right">Lifetime Sales</th>
                <th className="py-2.5 px-3 text-right">Outstanding</th>
                <th className="py-2.5 px-3 text-right">Loyalty Points</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-table-cell">
              {segmentCustomers.map(c => (
                <tr key={c.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="py-2.5 px-3">
                    <strong className="text-on-surface">{c.name}</strong>
                    {c.vehicles.length > 0 && (
                      <div className="text-[11px] text-outline">{c.vehicles[0].manufacturer} {c.vehicles[0].model}</div>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-on-surface">{c.mobile}</td>
                  <td className="py-2.5 px-3">{c.customerType}</td>
                  <td className="py-2.5 px-3 text-outline">{c.city}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-on-surface">
                    ₹{c.totalSales.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    {c.outstanding > 0 ? (
                      <span className="text-error font-bold">₹{c.outstanding.toLocaleString('en-IN')}</span>
                    ) : (
                      <span className="text-on-tertiary-container font-semibold">₹0.00</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-secondary">
                    {c.loyaltyPoints}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => onSelectCustomer(c.id)}
                      className="p-1 rounded text-secondary hover:bg-surface-container"
                      title="Open Profile"
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
  );
};
