import React, { useState } from 'react';
import { DocumentNumberingConfig, UserRole } from '../../types';
import { getNumberingPreview } from '../../data/adminSecurityData';

interface NumberingPrefixesViewProps {
  numberingConfigs: DocumentNumberingConfig[];
  userRole: UserRole;
  onSaveNumbering: (configs: DocumentNumberingConfig[]) => void;
  onTriggerPermissionDenied?: (action: string) => void;
}

export const NumberingPrefixesView: React.FC<NumberingPrefixesViewProps> = ({
  numberingConfigs,
  userRole,
  onSaveNumbering,
  onTriggerPermissionDenied
}) => {
  const [configs, setConfigs] = useState<DocumentNumberingConfig[]>(numberingConfigs);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const isAllowedToEdit = userRole === 'super_admin' || userRole === 'admin';

  const handleUpdate = (id: string, field: keyof DocumentNumberingConfig, value: any) => {
    setConfigs((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleSave = () => {
    if (!isAllowedToEdit) {
      if (onTriggerPermissionDenied) onTriggerPermissionDenied('Update Document Numbering');
      return;
    }
    onSaveNumbering(configs);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Duplicate prefix check
  const prefixes = configs.map(c => c.prefix.trim().toUpperCase());
  const hasDuplicatePrefix = prefixes.some((p, idx) => prefixes.indexOf(p) !== idx);

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low p-4 rounded border border-surface-container-high">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-primary">pin</span>
            <h1 className="text-lg font-bold text-on-surface tracking-tight">
              Document Sequences, Numbering & Prefixes
            </h1>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Configure automated sequential series, financial year tokens, and prevent unsafe voucher collisions.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={hasDuplicatePrefix}
          className="px-4 py-2 bg-primary text-on-primary rounded text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 shadow-xs shrink-0 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          Save Sequences
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded text-xs font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>Document numbering sequences and serial prefixes updated successfully.</span>
        </div>
      )}

      {hasDuplicatePrefix && (
        <div className="p-3 bg-error-container/20 border border-error/40 text-error rounded text-xs font-medium flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">warning</span>
          <span>
            Collision Risk: Multiple document types share identical prefixes. Each document type must possess a unique prefix to prevent duplicate invoice numbers in GST filings.
          </span>
        </div>
      )}

      {/* Numbering Table */}
      <div className="bg-surface-container-low border border-surface-container-high rounded overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container border-b border-surface-container-high text-outline uppercase font-semibold text-[11px] tracking-wider">
                <th className="py-2.5 px-3">Document Type</th>
                <th className="py-2.5 px-3">Prefix</th>
                <th className="py-2.5 px-3">Separator</th>
                <th className="py-2.5 px-3">FY Year</th>
                <th className="py-2.5 px-3">Starting No</th>
                <th className="py-2.5 px-3">Current Running No</th>
                <th className="py-2.5 px-3">Padding</th>
                <th className="py-2.5 px-3">Live Sequence Preview</th>
                <th className="py-2.5 px-3 text-center">Safety Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high text-on-surface">
              {configs.map((c) => {
                const livePreview = getNumberingPreview(c);
                const isUnderStarting = c.currentNumber < c.startingNumber;

                return (
                  <tr key={c.id} className="hover:bg-surface-container-highest/30 transition-colors">
                    {/* Doc Type */}
                    <td className="py-2.5 px-3 font-bold text-on-surface">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-outline text-[18px]">
                          {c.docType.includes('Invoice') ? 'receipt_long' : c.docType.includes('Return') ? 'assignment_return' : c.docType.includes('Quotation') ? 'request_quote' : 'receipt'}
                        </span>
                        <span>{c.docType}</span>
                      </div>
                    </td>

                    {/* Prefix */}
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={c.prefix}
                        onChange={(e) => handleUpdate(c.id, 'prefix', e.target.value.toUpperCase())}
                        className="w-16 px-2 py-1 bg-surface border border-surface-container-high rounded text-on-surface font-mono font-bold text-center focus:outline-hidden focus:border-primary uppercase"
                      />
                    </td>

                    {/* Separator */}
                    <td className="py-2.5 px-3">
                      <select
                        value={c.separator}
                        onChange={(e) => handleUpdate(c.id, 'separator', e.target.value)}
                        className="px-2 py-1 bg-surface border border-surface-container-high rounded text-on-surface font-mono focus:outline-hidden focus:border-primary"
                      >
                        <option value="/">/</option>
                        <option value="-">-</option>
                        <option value="_">_</option>
                      </select>
                    </td>

                    {/* Financial Year */}
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={c.financialYear}
                        onChange={(e) => handleUpdate(c.id, 'financialYear', e.target.value)}
                        className="w-20 px-2 py-1 bg-surface border border-surface-container-high rounded text-on-surface font-mono text-center focus:outline-hidden focus:border-primary"
                      />
                    </td>

                    {/* Starting Number */}
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min="1"
                        value={c.startingNumber}
                        onChange={(e) => handleUpdate(c.id, 'startingNumber', parseInt(e.target.value) || 1)}
                        className="w-20 px-2 py-1 bg-surface border border-surface-container-high rounded text-on-surface font-mono text-right focus:outline-hidden focus:border-primary"
                      />
                    </td>

                    {/* Current Number */}
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min="1"
                        value={c.currentNumber}
                        onChange={(e) => handleUpdate(c.id, 'currentNumber', parseInt(e.target.value) || 1)}
                        className="w-20 px-2 py-1 bg-surface border border-surface-container-high rounded text-on-surface font-mono text-right focus:outline-hidden focus:border-primary font-semibold text-primary"
                      />
                    </td>

                    {/* Padding Digits */}
                    <td className="py-2.5 px-3">
                      <select
                        value={c.padding}
                        onChange={(e) => handleUpdate(c.id, 'padding', parseInt(e.target.value))}
                        className="px-2 py-1 bg-surface border border-surface-container-high rounded text-on-surface font-mono focus:outline-hidden focus:border-primary"
                      >
                        <option value={4}>4 (0001)</option>
                        <option value={5}>5 (00001)</option>
                        <option value={6}>6 (000001)</option>
                      </select>
                    </td>

                    {/* Live Preview */}
                    <td className="py-2.5 px-3">
                      <span className="px-2.5 py-1 rounded font-mono text-xs font-bold bg-surface-container border border-surface-container-highest text-secondary inline-block">
                        {livePreview}
                      </span>
                    </td>

                    {/* Safety Status */}
                    <td className="py-2.5 px-3 text-center">
                      {isUnderStarting ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                          Reset Warning
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Locked Safe
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Informational Guidance Box */}
      <div className="p-3.5 bg-surface-container-low border border-surface-container-high rounded text-xs space-y-1.5 text-on-surface-variant">
        <div className="font-semibold text-on-surface flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-primary">gavel</span>
          GST Rule 46 Compliance Notice (Tax Invoice Numbering)
        </div>
        <p className="leading-relaxed">
          The Goods and Services Tax Rules require that each tax invoice issued must have a consecutive serial number not exceeding sixteen characters, in one or multiple series, containing alphabets or numerals or special characters like hyphen or slash symbol, unique for a financial year.
        </p>
      </div>
    </div>
  );
};
