import React from 'react';
import { ReportDetailData, UserRole } from '../../types';
import { formatINR } from '../../utils/formatters';

interface ReportDetailDrawerProps {
  isOpen: boolean;
  data: ReportDetailData | null;
  userRole: UserRole;
  onClose: () => void;
  onViewInvoice?: (invoiceNo: string) => void;
  onViewLedger?: (partyName: string) => void;
  onPrint?: (data: ReportDetailData) => void;
  onExport?: (data: ReportDetailData) => void;
}

export const ReportDetailDrawer: React.FC<ReportDetailDrawerProps> = ({
  isOpen,
  data,
  userRole,
  onClose,
  onViewInvoice,
  onViewLedger,
  onPrint,
  onExport
}) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-surface-container-lowest h-full shadow-2xl border-l border-surface-container-high flex flex-col animate-in slide-in-from-right duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 border-b border-surface-container-high bg-surface-container-low flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-2xl">
              {data.type === 'Sale' ? 'receipt_long' : data.type === 'Purchase' ? 'inventory_2' : data.type === 'GST' ? 'account_balance' : 'description'}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline-sm text-base font-bold text-on-surface">{data.title}</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-secondary/15 text-secondary border border-secondary/20">
                  {data.referenceNo}
                </span>
              </div>
              <p className="text-xs text-outline">Recorded on {data.date}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-surface-container text-on-surface-variant transition-colors"
            title="Close Drawer [Esc]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Party & General Information Card */}
          <div className="p-3.5 bg-surface-container-low rounded border border-surface-container-high">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-outline">Party &amp; Account Summary</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                data.status === 'PAID' || data.status === 'READY'
                  ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                  : 'bg-secondary/15 text-secondary'
              }`}>
                {data.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-outline block text-[11px]">Customer / Supplier:</span>
                <span className="font-bold text-on-surface text-sm">{data.partyName}</span>
                {data.partyPhone && (
                  <span className="text-outline text-[11px] block mt-0.5">{data.partyPhone}</span>
                )}
              </div>
              <div>
                <span className="text-outline block text-[11px]">GSTIN Number:</span>
                <span className="font-mono font-semibold text-on-surface">
                  {data.partyGstin || 'Unregistered / Counter Retail (URP)'}
                </span>
              </div>
              <div>
                <span className="text-outline block text-[11px]">Settlement / Pay Mode:</span>
                <span className="font-medium text-on-surface">{data.paymentMode || 'Not Specified'}</span>
              </div>
              <div>
                <span className="text-outline block text-[11px]">Created By &amp; System Time:</span>
                <span className="text-on-surface font-medium">{data.user}</span>
                <span className="text-outline text-[10px] block">{data.timestamp}</span>
              </div>
            </div>

            {data.notes && (
              <div className="mt-2.5 pt-2 border-t border-surface-container-high text-outline italic">
                Note: {data.notes}
              </div>
            )}
          </div>

          {/* Line Items Breakdown */}
          {data.items && data.items.length > 0 && (
            <div className="rounded border border-surface-container-high overflow-hidden">
              <div className="p-2.5 bg-surface-container font-bold text-on-surface flex justify-between items-center">
                <span>Spare Parts &amp; Item Breakdown ({data.items.length} Lines)</span>
                <span className="text-[10px] font-normal text-outline">HSN 8714 / 2710 Automotive</span>
              </div>
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low text-outline text-[10px] uppercase font-bold border-b border-surface-container-high">
                  <tr>
                    <th className="p-2">Item Description</th>
                    <th className="p-2 text-center">HSN</th>
                    <th className="p-2 text-right">Qty</th>
                    <th className="p-2 text-right">Unit Rate</th>
                    <th className="p-2 text-center">GST %</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high font-table-cell">
                  {data.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-surface-container-low/50">
                      <td className="p-2">
                        <div className="font-bold text-on-surface">{item.name}</div>
                        <div className="text-[10px] font-mono text-outline">{item.sku}</div>
                      </td>
                      <td className="p-2 text-center font-mono text-outline">{item.hsn}</td>
                      <td className="p-2 text-right font-mono font-semibold">{item.qty}</td>
                      <td className="p-2 text-right font-mono">{formatINR(item.unitPrice)}</td>
                      <td className="p-2 text-center font-mono">{item.gstRate}%</td>
                      <td className="p-2 text-right font-mono font-bold text-on-surface">{formatINR(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* GST & Financial Calculation Summary */}
          <div className="p-3.5 bg-surface-container-low rounded border border-surface-container-high space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-outline block">
              GST Tax Calculation &amp; Total Value (INR)
            </span>
            <div className="space-y-1 font-mono text-xs">
              <div className="flex justify-between text-on-surface-variant">
                <span>Taxable Value:</span>
                <span>{formatINR(data.taxableAmount)}</span>
              </div>
              {data.cgst > 0 && (
                <div className="flex justify-between text-outline">
                  <span>CGST (Central Tax):</span>
                  <span>+{formatINR(data.cgst)}</span>
                </div>
              )}
              {data.sgst > 0 && (
                <div className="flex justify-between text-outline">
                  <span>SGST (State Tax):</span>
                  <span>+{formatINR(data.sgst)}</span>
                </div>
              )}
              {data.igst > 0 && (
                <div className="flex justify-between text-outline">
                  <span>IGST (Integrated Interstate Tax):</span>
                  <span>+{formatINR(data.igst)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-surface-container-high flex justify-between font-bold text-sm text-on-surface">
                <span>Total Invoice / Settlement Value:</span>
                <span className="text-secondary">{formatINR(data.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Audit History Log */}
          {data.auditHistory && data.auditHistory.length > 0 && (
            <div className="p-3 bg-surface-container-lowest rounded border border-surface-container-high">
              <span className="text-[10px] font-bold uppercase tracking-wider text-outline block mb-2">
                Audit Trail &amp; Timestamp History
              </span>
              <div className="space-y-2">
                {data.auditHistory.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[11px]">
                    <span className="material-symbols-outlined text-[14px] text-outline mt-0.5">history</span>
                    <div className="flex-1">
                      <div className="font-semibold text-on-surface">{log.action}</div>
                      <div className="text-[10px] text-outline">
                        {log.timestamp} • Executed by <span className="font-medium text-on-surface-variant">{log.user}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-surface-container-high bg-surface-container-low flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {onViewInvoice && (
              <button
                type="button"
                onClick={() => onViewInvoice(data.referenceNo)}
                className="px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high font-bold text-xs text-on-surface flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">receipt</span>
                <span>View Invoice</span>
              </button>
            )}
            {onViewLedger && data.partyName && (
              <button
                type="button"
                onClick={() => onViewLedger(data.partyName)}
                className="px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high font-bold text-xs text-on-surface flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">menu_book</span>
                <span>Party Ledger</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (onPrint) onPrint(data);
                else alert(`Printing Official Voucher ${data.referenceNo}`);
              }}
              className="px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high font-bold text-xs text-on-surface flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">print</span>
              <span>Print</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (onExport) onExport(data);
                else alert(`Exported CSV record for ${data.referenceNo}`);
              }}
              className="px-3 py-1.5 rounded bg-secondary hover:bg-secondary-container text-on-secondary font-bold text-xs flex items-center gap-1 transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[15px]">download</span>
              <span>Export Record</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
