import React, { useState } from 'react';
import { UserRole } from '../../types';
import { GSTR3B_SUPPLIES, GSTR3B_ITC } from '../../data/gstAndReportsData';
import { formatINR } from '../../utils/formatters';

interface Gstr3bViewProps {
  userRole: UserRole;
  onNavigate: (screenId: string) => void;
}

export const Gstr3bView: React.FC<Gstr3bViewProps> = ({ userRole, onNavigate }) => {
  const [returnPeriod, setReturnPeriod] = useState('October 2024');
  const [activeTab, setActiveTab] = useState<'3.1' | '4' | 'offset'>('3.1');
  const [challanGenerated, setChallanGenerated] = useState(false);
  const [isReturnFiled, setIsReturnFiled] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Table 3.1 Totals
  const totalTaxable = GSTR3B_SUPPLIES.reduce((acc, row) => acc + row.taxableValue, 0);
  const total31Igst = GSTR3B_SUPPLIES.reduce((acc, row) => acc + row.igst, 0);
  const total31Cgst = GSTR3B_SUPPLIES.reduce((acc, row) => acc + row.cgst, 0);
  const total31Sgst = GSTR3B_SUPPLIES.reduce((acc, row) => acc + row.sgst, 0);

  // Table 4 Totals
  const totalItcAvailableCgst = GSTR3B_ITC.filter(r => !r.id.startsWith('4.b')).reduce((acc, r) => acc + r.cgst, 0);
  const totalItcAvailableSgst = GSTR3B_ITC.filter(r => !r.id.startsWith('4.b')).reduce((acc, r) => acc + r.sgst, 0);
  const totalItcReversedCgst = Math.abs(GSTR3B_ITC.find(r => r.id === '4.b.1')?.cgst || 0);
  const totalItcReversedSgst = Math.abs(GSTR3B_ITC.find(r => r.id === '4.b.1')?.sgst || 0);

  const netItcCgst = totalItcAvailableCgst - totalItcReversedCgst;
  const netItcSgst = totalItcAvailableSgst - totalItcReversedSgst;

  // Offset calculations
  const payableCgst = Math.max(0, total31Cgst - netItcCgst);
  const payableSgst = Math.max(0, total31Sgst - netItcSgst);
  const payableIgst = total31Igst; // Zero ITC in IGST, offset from CGST/SGST if applicable
  const netCashPayable = payableCgst + payableSgst + payableIgst;

  return (
    <div className="flex flex-col w-full pb-12 space-y-gutter animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface-container-lowest p-gutter rounded shadow-xs border border-surface-container-high gap-3">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('gst-dashboard')}
              className="p-1 rounded hover:bg-surface-container text-on-surface-variant transition-colors"
              title="Back to GST Dashboard"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Form GSTR-3B Summary &amp; Tax Offset</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-secondary/15 text-secondary border border-secondary/20">
              Monthly Self-Assessment
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Auto-computed summary of outward supplies, eligible Input Tax Credit (ITC) and net cash ledger liability
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded font-semibold text-xs flex items-center gap-1.5 border border-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Print GSTR-3B</span>
          </button>

          {!challanGenerated ? (
            <button
              type="button"
              onClick={() => {
                setChallanGenerated(true);
                showToast(`Challan PMT-06 for ${formatINR(netCashPayable)} generated successfully.`);
              }}
              className="px-3 py-1.5 bg-secondary text-on-secondary hover:bg-secondary-container rounded font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">receipt</span>
              <span>Generate Challan ({formatINR(netCashPayable, 0)})</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={isReturnFiled}
              onClick={() => {
                setIsReturnFiled(true);
                showToast('GSTR-3B Return successfully marked as Filed! ARN generated.');
              }}
              className="px-3 py-1.5 bg-tertiary-fixed text-on-tertiary-fixed font-bold rounded text-xs flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>{isReturnFiled ? 'Return Filed (ARN: AA331024009182Z)' : 'Mark as Filed & Offset'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Period & High-Level Liability Banner */}
      <div className="p-4 bg-surface-container-lowest rounded shadow-xs border border-surface-container-high flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-outline text-[11px] block">Selected Return Period</span>
            <span className="font-bold text-base text-on-surface">{returnPeriod}</span>
          </div>
          <div className="h-8 w-px bg-surface-container-high hidden md:block" />
          <div>
            <span className="text-outline text-[11px] block">Filing Due Date</span>
            <span className="font-bold text-sm text-on-surface">20 November 2024</span>
          </div>
          <div className="h-8 w-px bg-surface-container-high hidden md:block" />
          <div>
            <span className="text-outline text-[11px] block">Current Filing Status</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              isReturnFiled
                ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                : challanGenerated
                ? 'bg-secondary/20 text-secondary'
                : 'bg-warning-container text-on-warning-container'
            }`}>
              {isReturnFiled ? 'Filed with GSTN' : challanGenerated ? 'Challan Generated' : 'Draft Ready'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 font-mono text-xs">
          <div>
            <span className="text-outline text-[11px] block">Total Tax Liability</span>
            <span className="font-bold text-sm text-primary">{formatINR(total31Cgst + total31Sgst + total31Igst)}</span>
          </div>
          <div>
            <span className="text-outline text-[11px] block">Net ITC Available</span>
            <span className="font-bold text-sm text-on-tertiary-container">{formatINR(netItcCgst + netItcSgst)}</span>
          </div>
          <div className="p-2 bg-secondary/10 rounded border border-secondary/20">
            <span className="text-secondary text-[11px] font-bold block">Net Cash Payable</span>
            <span className="font-bold text-base text-secondary">{formatINR(netCashPayable)}</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-surface-container-high gap-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('3.1')}
          className={`px-4 py-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === '3.1'
              ? 'border-secondary text-secondary'
              : 'border-transparent text-outline hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">trending_up</span>
          <span>Table 3.1: Outward &amp; RCM Inward Supplies</span>
        </button>
        <button
          onClick={() => setActiveTab('4')}
          className={`px-4 py-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === '4'
              ? 'border-secondary text-secondary'
              : 'border-transparent text-outline hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          <span>Table 4: Eligible Input Tax Credit (ITC)</span>
        </button>
        <button
          onClick={() => setActiveTab('offset')}
          className={`px-4 py-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
            activeTab === 'offset'
              ? 'border-secondary text-secondary'
              : 'border-transparent text-outline hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
          <span>Table 6.1: Payment of Tax &amp; ITC Set-Off</span>
        </button>
      </div>

      {/* Tab 3.1: Outward Supplies */}
      {activeTab === '3.1' && (
        <div className="bg-surface-container-lowest rounded shadow-xs border border-surface-container-high overflow-hidden text-xs">
          <div className="p-3 bg-surface-container-low border-b border-surface-container-high flex items-center justify-between">
            <div>
              <span className="font-bold text-on-surface text-sm">
                3.1 Details of Outward Supplies and Inward Supplies Liable to Reverse Charge
              </span>
              <p className="text-[11px] text-outline">
                Values auto-populated from validated sales invoices and GTA freight receipts
              </p>
            </div>
            <span className="text-[10px] text-outline uppercase font-mono">Government Format</span>
          </div>

          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container font-label-caps text-label-caps text-on-surface-variant uppercase">
              <tr>
                <th className="py-2.5 px-3 w-16 text-center">Section</th>
                <th className="py-2.5 px-3">Nature of Supplies</th>
                <th className="py-2.5 px-3 text-right">Total Taxable Value</th>
                <th className="py-2.5 px-3 text-right">Integrated Tax (IGST)</th>
                <th className="py-2.5 px-3 text-right">Central Tax (CGST)</th>
                <th className="py-2.5 px-3 text-right">State Tax (SGST)</th>
                <th className="py-2.5 px-3 text-right">Cess</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-table-cell">
              {GSTR3B_SUPPLIES.map(row => (
                <tr key={row.id} className="hover:bg-surface-container-low">
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-outline">{row.code}</td>
                  <td className="py-2.5 px-3 font-semibold text-on-surface">{row.nature}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-on-surface">
                    {formatINR(row.taxableValue)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-outline">
                    {row.igst > 0 ? formatINR(row.igst) : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-outline">
                    {row.cgst > 0 ? formatINR(row.cgst) : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-outline">
                    {row.sgst > 0 ? formatINR(row.sgst) : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-outline">-</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-surface-container font-bold border-t-2 border-surface-container-high">
              <tr>
                <td colSpan={2} className="py-2.5 px-3 uppercase text-[10px] tracking-wider text-outline">
                  Total Outward Supplies Liability
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-on-surface">{formatINR(totalTaxable)}</td>
                <td className="py-2.5 px-3 text-right font-mono text-primary">{formatINR(total31Igst)}</td>
                <td className="py-2.5 px-3 text-right font-mono text-primary">{formatINR(total31Cgst)}</td>
                <td className="py-2.5 px-3 text-right font-mono text-primary">{formatINR(total31Sgst)}</td>
                <td className="py-2.5 px-3 text-right font-mono text-outline">₹0.00</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Tab 4: Eligible ITC */}
      {activeTab === '4' && (
        <div className="bg-surface-container-lowest rounded shadow-xs border border-surface-container-high overflow-hidden text-xs">
          <div className="p-3 bg-surface-container-low border-b border-surface-container-high flex items-center justify-between">
            <div>
              <span className="font-bold text-on-surface text-sm">4. Eligible Input Tax Credit (ITC)</span>
              <p className="text-[11px] text-outline">
                Auto-reconciled with GSTR-2B purchase invoices from registered suppliers
              </p>
            </div>
            <span className="text-[10px] text-outline uppercase font-mono">GSTR-2B Matched</span>
          </div>

          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container font-label-caps text-label-caps text-on-surface-variant uppercase">
              <tr>
                <th className="py-2.5 px-3 w-20 text-center">Section</th>
                <th className="py-2.5 px-3">Details</th>
                <th className="py-2.5 px-3 text-right">Integrated Tax (IGST)</th>
                <th className="py-2.5 px-3 text-right">Central Tax (CGST)</th>
                <th className="py-2.5 px-3 text-right">State Tax (SGST)</th>
                <th className="py-2.5 px-3 text-right">Cess</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-table-cell">
              {GSTR3B_ITC.map(row => (
                <tr key={row.id} className="hover:bg-surface-container-low">
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-outline">{row.code}</td>
                  <td className="py-2.5 px-3 font-semibold text-on-surface">{row.details}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-outline">
                    {row.igst !== 0 ? formatINR(row.igst) : '-'}
                  </td>
                  <td className={`py-2.5 px-3 text-right font-mono ${row.cgst < 0 ? 'text-error font-bold' : 'text-on-surface'}`}>
                    {row.cgst !== 0 ? formatINR(row.cgst) : '-'}
                  </td>
                  <td className={`py-2.5 px-3 text-right font-mono ${row.sgst < 0 ? 'text-error font-bold' : 'text-on-surface'}`}>
                    {row.sgst !== 0 ? formatINR(row.sgst) : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-outline">-</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-surface-container font-bold border-t-2 border-surface-container-high">
              <tr>
                <td colSpan={2} className="py-2.5 px-3 uppercase text-[10px] tracking-wider text-outline">
                  (C) Net ITC Available (4.A - 4.B)
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-outline">₹0.00</td>
                <td className="py-2.5 px-3 text-right font-mono text-tertiary">{formatINR(netItcCgst)}</td>
                <td className="py-2.5 px-3 text-right font-mono text-tertiary">{formatINR(netItcSgst)}</td>
                <td className="py-2.5 px-3 text-right font-mono text-outline">₹0.00</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Tab offset: Payment of Tax (Table 6.1) */}
      {activeTab === 'offset' && (
        <div className="bg-surface-container-lowest rounded shadow-xs border border-surface-container-high overflow-hidden text-xs">
          <div className="p-3 bg-surface-container-low border-b border-surface-container-high flex items-center justify-between">
            <div>
              <span className="font-bold text-on-surface text-sm">
                Table 6.1: Payment of Tax &amp; Credit Ledger Utilization
              </span>
              <p className="text-[11px] text-outline">
                Offsetting Output Tax liability against available Input Tax Credit and cash payment calculation
              </p>
            </div>
            <span className="text-[10px] text-outline uppercase font-mono">Tax Settlement</span>
          </div>

          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container font-label-caps text-label-caps text-on-surface-variant uppercase">
              <tr>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 text-right">Total Tax Payable</th>
                <th className="py-2.5 px-3 text-right">Paid Through ITC</th>
                <th className="py-2.5 px-3 text-right">Tax Paid in Cash</th>
                <th className="py-2.5 px-3 text-right">Interest / Fee</th>
                <th className="py-2.5 px-3 text-right">Challan Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-table-cell">
              <tr className="hover:bg-surface-container-low">
                <td className="py-2.5 px-3 font-bold text-on-surface">Integrated Tax (IGST)</td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-primary">{formatINR(total31Igst)}</td>
                <td className="py-2.5 px-3 text-right font-mono text-tertiary">₹0.00</td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-secondary">{formatINR(payableIgst)}</td>
                <td className="py-2.5 px-3 text-right font-mono text-outline">₹0.00</td>
                <td className="py-2.5 px-3 text-right font-mono text-secondary">{formatINR(payableIgst)}</td>
              </tr>
              <tr className="hover:bg-surface-container-low">
                <td className="py-2.5 px-3 font-bold text-on-surface">Central Tax (CGST)</td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-primary">{formatINR(total31Cgst)}</td>
                <td className="py-2.5 px-3 text-right font-mono text-tertiary">{formatINR(netItcCgst)}</td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-secondary">{formatINR(payableCgst)}</td>
                <td className="py-2.5 px-3 text-right font-mono text-outline">₹0.00</td>
                <td className="py-2.5 px-3 text-right font-mono text-secondary">{formatINR(payableCgst)}</td>
              </tr>
              <tr className="hover:bg-surface-container-low">
                <td className="py-2.5 px-3 font-bold text-on-surface">State Tax (SGST)</td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-primary">{formatINR(total31Sgst)}</td>
                <td className="py-2.5 px-3 text-right font-mono text-tertiary">{formatINR(netItcSgst)}</td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-secondary">{formatINR(payableSgst)}</td>
                <td className="py-2.5 px-3 text-right font-mono text-outline">₹0.00</td>
                <td className="py-2.5 px-3 text-right font-mono text-secondary">{formatINR(payableSgst)}</td>
              </tr>
            </tbody>
            <tfoot className="bg-surface-container font-bold border-t-2 border-surface-container-high">
              <tr>
                <td className="py-2.5 px-3 uppercase text-[10px] tracking-wider text-outline">Total Settlement</td>
                <td className="py-2.5 px-3 text-right font-mono text-primary">
                  {formatINR(total31Igst + total31Cgst + total31Sgst)}
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-tertiary">
                  {formatINR(netItcCgst + netItcSgst)}
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-secondary">{formatINR(netCashPayable)}</td>
                <td className="py-2.5 px-3 text-right font-mono text-outline">₹0.00</td>
                <td className="py-2.5 px-3 text-right font-mono text-secondary text-sm">{formatINR(netCashPayable)}</td>
              </tr>
            </tfoot>
          </table>

          <div className="p-4 bg-surface-container-low border-t border-surface-container-high flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-outline">
              <span className="material-symbols-outlined text-[18px] text-secondary">info</span>
              <span>Available Electronic Cash Ledger Balance: <strong className="text-on-surface font-mono">₹4,28,600.00</strong> (HDFC A/c)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => showToast(`Creating GST Challan PMT-06 with CPIN 2410330018912 for ${formatINR(netCashPayable)}`)}
                className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded font-semibold text-xs border border-surface-container-high cursor-pointer"
              >
                Create PMT-06 Challan
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsReturnFiled(true);
                  showToast(`Offset successful. GSTR-3B filed with ARN AA331024009182Z.`);
                }}
                className="px-3.5 py-1.5 bg-secondary text-on-secondary hover:bg-secondary-container rounded font-bold text-xs shadow-xs cursor-pointer"
              >
                File GSTR-3B with EVC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 bg-neutral-900 text-white px-4 py-2.5 rounded shadow-lg flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-bottom-2 duration-200">
          <span className="material-symbols-outlined text-secondary text-[18px]">verified</span>
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
};
