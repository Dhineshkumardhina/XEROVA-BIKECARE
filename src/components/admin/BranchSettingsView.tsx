import React, { useState } from 'react';
import { BranchRecord, UserRole } from '../../types';

interface BranchSettingsViewProps {
  branches: BranchRecord[];
  userRole: UserRole;
  onAddBranch: (branch: BranchRecord) => void;
  onUpdateBranch: (branch: BranchRecord) => void;
  onToggleBranchStatus: (branchId: string) => void;
  onTriggerPermissionDenied?: (action: string) => void;
}

export const BranchSettingsView: React.FC<BranchSettingsViewProps> = ({
  branches,
  userRole,
  onAddBranch,
  onUpdateBranch,
  onToggleBranchStatus,
  onTriggerPermissionDenied
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchRecord | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pinCode: '',
    contactPhone: '',
    contactEmail: '',
    gstin: '33AAAAA0000A1Z5',
    manager: '',
    status: 'Active' as 'Active' | 'Inactive',
    isMain: false
  });

  const isAllowedToEdit = userRole === 'super_admin' || userRole === 'admin';

  const handleOpenAdd = () => {
    if (!isAllowedToEdit) {
      if (onTriggerPermissionDenied) onTriggerPermissionDenied('Add Store Branch');
      return;
    }
    setEditingBranch(null);
    setFormData({
      name: '',
      code: `CHE-0${branches.length + 1}`,
      address: '',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pinCode: '',
      contactPhone: '',
      contactEmail: '',
      gstin: '33AAAAA0000A1Z5',
      manager: '',
      status: 'Active',
      isMain: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (branch: BranchRecord) => {
    if (!isAllowedToEdit) {
      if (onTriggerPermissionDenied) onTriggerPermissionDenied('Edit Store Branch');
      return;
    }
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      code: branch.code,
      address: branch.address,
      city: branch.city,
      state: branch.state,
      pinCode: branch.pinCode,
      contactPhone: branch.contactPhone,
      contactEmail: branch.contactEmail,
      gstin: branch.gstin,
      manager: branch.manager,
      status: branch.status,
      isMain: !!branch.isMain
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return;

    if (editingBranch) {
      onUpdateBranch({
        ...editingBranch,
        ...formData
      });
    } else {
      const newBranch: BranchRecord = {
        id: `br-${Date.now()}`,
        ...formData
      };
      onAddBranch(newBranch);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low p-4 rounded border border-surface-container-high">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-primary">store</span>
            <h1 className="text-lg font-bold text-on-surface tracking-tight">Branch & Warehouse Settings</h1>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-surface-container rounded border border-surface-container-high text-outline">
              {branches.length} Registered Locations
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Manage multi-store retail counters, wholesale distribution warehouses, and location-based user access controls.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-primary text-on-primary rounded text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 shadow-xs shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add_business</span>
          Add Branch
        </button>
      </div>

      {/* Branch Cards Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {branches.map((b) => (
          <div
            key={b.id}
            className={`p-3.5 rounded border transition-colors relative flex flex-col justify-between ${
              b.isMain
                ? 'bg-secondary/5 border-secondary/30'
                : 'bg-surface-container-low border-surface-container-high'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-on-surface">{b.name}</span>
                    {b.isMain && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-secondary text-on-secondary">
                        HQ
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-outline mt-0.5">{b.code}</div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold border flex items-center gap-1 shrink-0 ${
                    b.status === 'Active'
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${b.status === 'Active' ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                  {b.status}
                </span>
              </div>

              <div className="text-[11px] text-on-surface-variant mt-2.5 space-y-1">
                <div className="flex items-start gap-1">
                  <span className="material-symbols-outlined text-[14px] text-outline mt-0.5">location_on</span>
                  <span className="line-clamp-2">{b.address}, {b.city} - {b.pinCode}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-outline">phone</span>
                  <span>{b.contactPhone}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-outline">badge</span>
                  <span>Manager: <strong>{b.manager || 'Unassigned'}</strong></span>
                </div>
              </div>
            </div>

            <div className="pt-2.5 border-t border-surface-container-high mt-3 flex items-center justify-between text-[11px]">
              <span className="font-mono text-outline text-[10px]">GSTIN: {b.gstin}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(b)}
                  className="p-1 rounded hover:bg-surface-container text-outline hover:text-on-surface"
                  title="Edit Branch Details"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                </button>
                {!b.isMain && (
                  <button
                    onClick={() => onToggleBranchStatus(b.id)}
                    className="p-1 rounded hover:bg-surface-container text-outline hover:text-error"
                    title={b.status === 'Active' ? 'Deactivate Branch' : 'Activate Branch'}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {b.status === 'Active' ? 'toggle_on' : 'toggle_off'}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Branches Table */}
      <div className="bg-surface-container-low border border-surface-container-high rounded overflow-hidden shadow-xs">
        <div className="px-4 py-2.5 bg-surface-container border-b border-surface-container-high flex items-center justify-between">
          <span className="font-semibold text-xs text-on-surface uppercase tracking-wider">
            All Registered Locations & Multi-Branch Restriction
          </span>
          <span className="text-[11px] text-outline">
            Staff users assigned to a branch are restricted to its billing ledger and local inventory
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-container-high text-outline uppercase font-semibold text-[11px] tracking-wider">
                <th className="py-2.5 px-3">Branch Name</th>
                <th className="py-2.5 px-3">Code</th>
                <th className="py-2.5 px-3">Address & City</th>
                <th className="py-2.5 px-3">Contact</th>
                <th className="py-2.5 px-3">GSTIN</th>
                <th className="py-2.5 px-3">Manager</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high text-on-surface">
              {branches.map((b) => (
                <tr key={b.id} className="hover:bg-surface-container-highest/40 transition-colors">
                  <td className="py-2.5 px-3 font-semibold flex items-center gap-1.5">
                    <span>{b.name}</span>
                    {b.isMain && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-secondary text-on-secondary font-bold">
                        HQ
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-outline">{b.code}</td>
                  <td className="py-2.5 px-3 text-on-surface-variant max-w-[220px] truncate">
                    {b.address}, {b.city}
                  </td>
                  <td className="py-2.5 px-3 text-[11px]">{b.contactPhone}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-outline">{b.gstin}</td>
                  <td className="py-2.5 px-3 font-medium">{b.manager || '—'}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold border inline-flex items-center gap-1 ${
                        b.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                          : 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${b.status === 'Active' ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                      {b.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="p-1 rounded hover:bg-surface-container text-outline hover:text-on-surface"
                        title="Edit Branch"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      {!b.isMain && (
                        <button
                          onClick={() => onToggleBranchStatus(b.id)}
                          className={`p-1 rounded hover:bg-surface-container ${
                            b.status === 'Active' ? 'text-emerald-600 hover:text-error' : 'text-neutral-500 hover:text-emerald-600'
                          }`}
                          title={b.status === 'Active' ? 'Deactivate Branch' : 'Activate Branch'}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {b.status === 'Active' ? 'toggle_on' : 'toggle_off'}
                          </span>
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

      {/* ADD / EDIT BRANCH MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest border border-surface-container-highest rounded shadow-2xl max-w-lg w-full overflow-hidden text-on-surface">
            <div className="bg-surface-container-low px-5 py-3.5 border-b border-surface-container-high flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-primary">store</span>
                <h3 className="font-bold text-sm tracking-tight text-on-surface">
                  {editingBranch ? `Edit Location: ${editingBranch.name}` : 'Register New Store Branch'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-outline hover:text-on-surface rounded p-1"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-outline font-semibold mb-1">Branch Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ambattur Hub (Wholesale Depot)"
                    className="w-full px-2.5 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface focus:outline-hidden focus:border-primary font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-outline font-semibold mb-1">Branch Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. CHE-02"
                    className="w-full px-2.5 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface font-mono"
                  />
                </div>

                <div>
                  <label className="block text-outline font-semibold mb-1">Assigned Manager</label>
                  <input
                    type="text"
                    value={formData.manager}
                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                    placeholder="e.g. Vijay Anand"
                    className="w-full px-2.5 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-outline font-semibold mb-1">Address *</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Plot 18, SIDCO Industrial Estate"
                    className="w-full px-2.5 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface"
                  />
                </div>

                <div>
                  <label className="block text-outline font-semibold mb-1">City & State</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Chennai"
                    className="w-full px-2.5 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface"
                  />
                </div>

                <div>
                  <label className="block text-outline font-semibold mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={formData.pinCode}
                    onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                    placeholder="600058"
                    className="w-full px-2.5 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface font-mono"
                  />
                </div>

                <div>
                  <label className="block text-outline font-semibold mb-1">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="+91 98407 67890"
                    className="w-full px-2.5 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface"
                  />
                </div>

                <div>
                  <label className="block text-outline font-semibold mb-1">Branch GSTIN</label>
                  <input
                    type="text"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                    placeholder="33AAAAA0000A1Z5"
                    className="w-full px-2.5 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-surface-container-high flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded border border-surface-container-highest bg-surface hover:bg-surface-container-high text-on-surface font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-primary text-on-primary hover:bg-primary/90 font-medium flex items-center gap-1.5 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  {editingBranch ? 'Update Location' : 'Save Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
