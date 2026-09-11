import React, { useState } from 'react';
import { TaxRateConfig, UserRole } from '../../types';

interface TaxSettingsViewProps {
  taxRates: TaxRateConfig[];
  userRole: UserRole;
  onSaveTaxRates: (rates: TaxRateConfig[]) => void;
  onTriggerPermissionDenied?: (action: string) => void;
}

export const TaxSettingsView: React.FC<TaxSettingsViewProps> = ({
  taxRates,
  userRole,
  onSaveTaxRates,
  onTriggerPermissionDenied
}) => {
  const [rates, setRates] = useState<TaxRateConfig[]>(taxRates);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<TaxRateConfig | null>(null);

  // Historical impact confirmation modal
  const [pendingRevision, setPendingRevision] = useState<TaxRateConfig | null>(null);
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    slabName: '',
    rate: 18,
    cgst: 9,
    sgst: 9,
    igst: 18,
    cess: 0,
    appliesToHsns: '8714, 2710, 8487',
    description: ''
  });

  const isAllowedToEdit = userRole === 'super_admin' || userRole === 'admin';

  const handleOpenAdd = () => {
    if (!isAllowedToEdit) {
      if (onTriggerPermissionDenied) onTriggerPermissionDenied('Add GST Tax Rate');
      return;
    }
    setEditingRate(null);
    setFormData({
      slabName: '',
      rate: 18,
      cgst: 9,
      sgst: 9,
      igst: 18,
      cess: 0,
      appliesToHsns: '8714',
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rate: TaxRateConfig) => {
    if (!isAllowedToEdit) {
      if (onTriggerPermissionDenied) onTriggerPermissionDenied('Modify GST Tax Rate');
      return;
    }
    setEditingRate(rate);
    setFormData({
      slabName: rate.slabName,
      rate: rate.rate,
      cgst: rate.cgst,
      sgst: rate.sgst,
      igst: rate.igst,
      cess: rate.cess,
      appliesToHsns: rate.appliesToHsns.join(', '),
      description: rate.description
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: TaxRateConfig = {
      id: editingRate ? editingRate.id : `tax-${Date.now()}`,
      slabName: formData.slabName,
      rate: formData.rate,
      cgst: formData.cgst,
      sgst: formData.sgst,
      igst: formData.igst,
      cess: formData.cess,
      appliesToHsns: formData.appliesToHsns.split(',').map((s) => s.trim()).filter(Boolean),
      description: formData.description
    };

    if (editingRate) {
      // Show warning before modifying existing tax configuration!
      setPendingRevision(updated);
      setShowWarningModal(true);
    } else {
      const nextRates = [...rates, updated];
      setRates(nextRates);
      onSaveTaxRates(nextRates);
    }

    setIsModalOpen(false);
  };

  const handleConfirmRevision = () => {
    if (pendingRevision) {
      const nextRates = rates.map((r) => (r.id === pendingRevision.id ? pendingRevision : r));
      setRates(nextRates);
      onSaveTaxRates(nextRates);
      setPendingRevision(null);
      setShowWarningModal(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low p-4 rounded border border-surface-container-high">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-primary">percent</span>
            <h1 className="text-lg font-bold text-on-surface tracking-tight">GST Tax Slabs & HSN Mapping</h1>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-surface-container rounded border border-surface-container-high text-outline">
              GST Council Schedule
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Configure statutory CGST, SGST, IGST tax percentages, compensation cess, and associated motorcycle HSN codes.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-primary text-on-primary rounded text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 shadow-xs shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Tax Slab
        </button>
      </div>

      {/* Tax Rates Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {rates.map((tax) => (
          <div
            key={tax.id}
            className="bg-surface-container-low border border-surface-container-high rounded p-3.5 flex flex-col justify-between hover:border-primary/40 transition-colors"
          >
            <div>
              <div className="flex items-start justify-between gap-2 pb-2 border-b border-surface-container-high">
                <div>
                  <div className="font-bold text-sm text-on-surface flex items-center gap-2">
                    <span>{tax.rate}% GST</span>
                    {tax.isDefault && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-secondary text-on-secondary">
                        Standard Spares
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-on-surface-variant font-medium mt-0.5">
                    {tax.slabName}
                  </div>
                </div>

                <span className="text-lg font-mono font-bold text-primary">
                  {tax.rate}%
                </span>
              </div>

              {/* Tax Breakup Breakdown */}
              <div className="grid grid-cols-3 gap-2 py-2.5 text-center text-xs font-mono">
                <div className="p-1.5 bg-surface rounded border border-surface-container-high">
                  <div className="text-[10px] text-outline font-sans">CGST</div>
                  <div className="font-bold text-on-surface">{tax.cgst}%</div>
                </div>
                <div className="p-1.5 bg-surface rounded border border-surface-container-high">
                  <div className="text-[10px] text-outline font-sans">SGST</div>
                  <div className="font-bold text-on-surface">{tax.sgst}%</div>
                </div>
                <div className="p-1.5 bg-surface rounded border border-surface-container-high">
                  <div className="text-[10px] text-outline font-sans">IGST</div>
                  <div className="font-bold text-on-surface">{tax.igst}%</div>
                </div>
              </div>

              {/* Mapped HSNs */}
              <div className="space-y-1 text-[11px]">
                <div className="text-outline font-medium">Mapped HSN Codes:</div>
                <div className="flex flex-wrap gap-1">
                  {tax.appliesToHsns.map((hsn) => (
                    <span
                      key={hsn}
                      className="px-1.5 py-0.5 rounded bg-surface-container border border-surface-container-high font-mono text-[10px] text-secondary"
                    >
                      {hsn}
                    </span>
                  ))}
                </div>
                <div className="text-[11px] text-outline mt-1 leading-normal line-clamp-2">
                  {tax.description}
                </div>
              </div>
            </div>

            <div className="pt-2.5 border-t border-surface-container-high mt-3 flex items-center justify-between text-[11px]">
              <span className="text-[10px] text-outline">Cess: {tax.cess}%</span>
              <button
                onClick={() => handleOpenEdit(tax)}
                className="px-2.5 py-1 rounded bg-surface border border-surface-container-high hover:bg-surface-container text-on-surface flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">edit</span>
                Configure Slab
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* HISTORICAL WARNING CONFIRMATION MODAL */}
      {showWarningModal && pendingRevision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest border border-amber-500/40 rounded shadow-2xl max-w-md w-full overflow-hidden text-on-surface">
            <div className="bg-amber-500/15 border-b border-amber-500/30 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400">
                <span className="material-symbols-outlined text-[24px]">warning</span>
                <h3 className="font-semibold text-base tracking-tight text-on-surface">
                  Historical Tax Impact Warning
                </h3>
              </div>
              <button
                onClick={() => setShowWarningModal(false)}
                className="text-outline hover:text-on-surface rounded p-1"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs leading-relaxed">
              <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded text-on-surface space-y-1.5">
                <p className="font-bold text-amber-800 dark:text-amber-300">
                  Modifying an existing tax slab may affect past transactions!
                </p>
                <p className="text-on-surface-variant">
                  You are altering rate configuration for <strong>{pendingRevision.slabName}</strong> ({pendingRevision.rate}%).
                </p>
              </div>

              <p className="text-on-surface-variant">
                Historical invoices, GSTR-1 summaries, and purchase registers are calculated using the tax rate at the time of document generation. 
                Applying this change will update the active POS calculation for future bills while preserving immutable ledger journals.
              </p>

              <div className="p-2.5 bg-surface-container rounded border border-surface-container-high font-mono text-[11px] text-outline">
                New Configuration: Rate {pendingRevision.rate}% (CGST {pendingRevision.cgst}% + SGST {pendingRevision.sgst}%)
              </div>
            </div>

            <div className="bg-surface-container-low border-t border-surface-container-high px-5 py-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowWarningModal(false)}
                className="px-3.5 py-1.5 rounded border border-surface-container-highest bg-surface hover:bg-surface-container-high text-on-surface font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRevision}
                className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">verified</span>
                Confirm & Apply Rate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT TAX SLAB MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest border border-surface-container-highest rounded shadow-2xl max-w-md w-full overflow-hidden text-on-surface">
            <div className="bg-surface-container-low px-5 py-3.5 border-b border-surface-container-high flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-primary">percent</span>
                <h3 className="font-bold text-sm tracking-tight text-on-surface">
                  {editingRate ? 'Modify GST Tax Slab' : 'Add New GST Slab'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-outline hover:text-on-surface rounded p-1"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-outline font-semibold mb-1">Slab Display Title *</label>
                <input
                  type="text"
                  required
                  value={formData.slabName}
                  onChange={(e) => setFormData({ ...formData, slabName: e.target.value })}
                  placeholder="e.g. 18% Standard Automotive Spares"
                  className="w-full px-2.5 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-outline font-semibold mb-1">Total Rate (%) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    required
                    value={formData.rate}
                    onChange={(e) => {
                      const r = parseFloat(e.target.value) || 0;
                      setFormData({
                        ...formData,
                        rate: r,
                        cgst: r / 2,
                        sgst: r / 2,
                        igst: r
                      });
                    }}
                    className="w-full px-2.5 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-outline font-semibold mb-1">Cess (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.cess}
                    onChange={(e) => setFormData({ ...formData, cess: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2.5 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface font-mono"
                  />
                </div>
              </div>

              {/* Automatic Intra-State & Inter-State Breakdown */}
              <div className="p-3 bg-surface-container-low rounded border border-surface-container-high grid grid-cols-3 gap-2 text-center font-mono text-[11px]">
                <div>
                  <div className="text-[10px] text-outline">CGST (50%)</div>
                  <div className="font-semibold text-primary">{formData.cgst}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-outline">SGST (50%)</div>
                  <div className="font-semibold text-primary">{formData.sgst}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-outline">IGST (100%)</div>
                  <div className="font-semibold text-secondary">{formData.igst}%</div>
                </div>
              </div>

              <div>
                <label className="block text-outline font-semibold mb-1">Associated HSN Codes (Comma Separated)</label>
                <input
                  type="text"
                  value={formData.appliesToHsns}
                  onChange={(e) => setFormData({ ...formData, appliesToHsns: e.target.value })}
                  placeholder="8714, 2710, 8487"
                  className="w-full px-2.5 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface font-mono"
                />
              </div>

              <div>
                <label className="block text-outline font-semibold mb-1">Description / Goods Category</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Clutch plates, brake shoes, cables, filters..."
                  className="w-full px-2.5 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface text-xs"
                />
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
                  {editingRate ? 'Update Slab' : 'Create Slab'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
