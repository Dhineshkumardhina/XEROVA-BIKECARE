import React from 'react';
import { Quotation } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface QuotationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: Quotation | null;
  onEdit: (quote: Quotation) => void;
  onDuplicate: (quote: Quotation) => void;
  onPrint: (quote: Quotation) => void;
  onShare: (quote: Quotation) => void;
  onConvertToInvoice: (quote: Quotation) => void;
  onCancelQuotation: (quote: Quotation) => void;
}

export const QuotationDetailModal: React.FC<QuotationDetailModalProps> = ({
  isOpen,
  onClose,
  quotation,
  onEdit,
  onDuplicate,
  onPrint,
  onShare,
  onConvertToInvoice,
  onCancelQuotation
}) => {
  if (!isOpen || !quotation) return null;

  const isExpired = new Date(quotation.validUntil).getTime() < Date.now() && quotation.status !== 'CONVERTED';
  const displayStatus = quotation.status === 'CONVERTED' ? 'CONVERTED' : isExpired ? 'EXPIRED' : quotation.status;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest border border-surface-container-high rounded shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-xs">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-surface-container-low border-b border-surface-container-high flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary text-2xl">request_quote</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-sm text-on-surface">
                  Estimate Quotation #{quotation.quotationNumber}
                </h2>
                <span className="px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider bg-surface-container-highest text-secondary">
                  {displayStatus}
                </span>
              </div>
              <p className="text-[11px] text-outline">
                Created on {quotation.date} by {quotation.createdBy} &bull; Valid till {quotation.validUntil}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-surface-container text-outline hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Customer & Vehicle Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface-container-low p-4 rounded border border-surface-container-high">
            <div>
              <h3 className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">
                Customer Details
              </h3>
              <div className="font-semibold text-sm text-on-surface">{quotation.customerName}</div>
              {quotation.customerMobile && (
                <div className="text-outline font-mono mt-0.5">Mobile: {quotation.customerMobile}</div>
              )}
              {quotation.customerGstin && (
                <div className="text-outline font-mono mt-0.5">GSTIN: {quotation.customerGstin}</div>
              )}
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1.5">
                Vehicle &amp; Validity
              </h3>
              <div>
                <span className="text-outline">Vehicle Reg: </span>
                <span className="font-mono font-bold text-on-surface">
                  {quotation.vehicleNumber || 'Counter Spare Estimate'}
                </span>
              </div>
              {quotation.vehicleModel && (
                <div className="text-outline mt-0.5">Model: {quotation.vehicleModel}</div>
              )}
              <div className="mt-1">
                <span className="text-outline">Valid Until: </span>
                <span className={isExpired ? 'font-bold text-error' : 'font-semibold text-on-surface'}>
                  {quotation.validUntil} {isExpired ? '(EXPIRED)' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h3 className="text-[10px] font-bold text-outline uppercase tracking-wider mb-2">
              Quotation Item Breakdown ({quotation.items.length} Spares)
            </h3>
            <div className="border border-surface-container-high rounded overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-surface-container font-label-caps text-[10px] text-outline uppercase tracking-wider">
                  <tr>
                    <th className="py-2 px-3 w-10 text-center">#</th>
                    <th className="py-2 px-3">Part No (SKU)</th>
                    <th className="py-2 px-3">Item Description</th>
                    <th className="py-2 px-3">Vehicle Fitment</th>
                    <th className="py-2 px-3 text-center">Qty</th>
                    <th className="py-2 px-3 text-right">Rate</th>
                    <th className="py-2 px-3 text-right">Discount</th>
                    <th className="py-2 px-3 text-center">GST %</th>
                    <th className="py-2 px-3 text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high font-table-cell bg-surface-container-lowest">
                  {quotation.items.map((it, idx) => (
                    <tr key={it.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-2 px-3 text-center text-outline font-mono">{idx + 1}</td>
                      <td className="py-2 px-3 font-mono font-bold text-secondary">{it.partNumber}</td>
                      <td className="py-2 px-3 font-semibold text-on-surface">{it.itemName}</td>
                      <td className="py-2 px-3 text-outline">{it.vehicle || '-'}</td>
                      <td className="py-2 px-3 text-center font-mono font-medium">{it.quantity}</td>
                      <td className="py-2 px-3 text-right font-mono">{formatCurrency(it.rate)}</td>
                      <td className="py-2 px-3 text-right font-mono text-tertiary">
                        {it.discount > 0 ? `-${formatCurrency(it.discount)}` : '-'}
                      </td>
                      <td className="py-2 px-3 text-center font-mono">{it.taxRate}%</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-on-surface">
                        {formatCurrency(it.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing & Terms Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              {quotation.remarks && (
                <div className="bg-surface-container-low p-3 rounded border border-surface-container-high">
                  <span className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-1">
                    Remarks / Inspection Notes
                  </span>
                  <p className="text-on-surface whitespace-pre-wrap">{quotation.remarks}</p>
                </div>
              )}

              {quotation.termsConditions && (
                <div className="bg-surface-container-low p-3 rounded border border-surface-container-high">
                  <span className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-1">
                    Terms &amp; Conditions
                  </span>
                  <p className="text-outline font-mono text-[11px] whitespace-pre-wrap">
                    {quotation.termsConditions}
                  </p>
                </div>
              )}
            </div>

            {/* Financial Summary */}
            <div className="bg-surface-container-low p-4 rounded border border-surface-container-high space-y-1.5 font-table-cell">
              <div className="flex justify-between">
                <span className="text-outline">Subtotal (Gross):</span>
                <span className="font-mono font-medium">{formatCurrency(quotation.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Discounts:</span>
                <span className="font-mono text-tertiary">-{formatCurrency(quotation.discountTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-outline">Taxable Value:</span>
                <span className="font-mono font-semibold">{formatCurrency(quotation.taxableAmount)}</span>
              </div>
              {quotation.cgst > 0 && (
                <div className="flex justify-between">
                  <span className="text-outline">CGST:</span>
                  <span className="font-mono">{formatCurrency(quotation.cgst)}</span>
                </div>
              )}
              {quotation.sgst > 0 && (
                <div className="flex justify-between">
                  <span className="text-outline">SGST:</span>
                  <span className="font-mono">{formatCurrency(quotation.sgst)}</span>
                </div>
              )}
              {quotation.igst > 0 && (
                <div className="flex justify-between">
                  <span className="text-outline">IGST:</span>
                  <span className="font-mono">{formatCurrency(quotation.igst)}</span>
                </div>
              )}
              {quotation.fittingCharges > 0 && (
                <div className="flex justify-between pt-1 border-t border-surface-container-high">
                  <span className="text-on-surface font-medium">Fitting &amp; Labour Charges:</span>
                  <span className="font-mono font-semibold">{formatCurrency(quotation.fittingCharges)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-surface-container-highest">
                <span className="font-bold text-sm text-on-surface">Estimate Grand Total:</span>
                <span className="font-mono text-base font-bold text-secondary">
                  {formatCurrency(quotation.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 py-3 bg-surface-container-low border-t border-surface-container-high flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrint(quotation)}
              className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high rounded text-xs font-bold text-secondary flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Print Proforma</span>
            </button>
            <button
              onClick={() => onShare(quotation)}
              className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high rounded text-xs font-bold text-tertiary flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">share</span>
              <span>Share WhatsApp</span>
            </button>
            <button
              onClick={() => onDuplicate(quotation)}
              className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high rounded text-xs font-semibold text-on-surface flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">content_copy</span>
              <span>Duplicate</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {quotation.status !== 'CONVERTED' && !isExpired && (
              <>
                <button
                  onClick={() => onEdit(quotation)}
                  className="px-3 py-1.5 rounded border border-surface-container-highest hover:bg-surface-container text-xs font-semibold text-outline hover:text-on-surface"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onConvertToInvoice(quotation);
                  }}
                  className="px-4 py-1.5 bg-secondary hover:bg-secondary-container text-on-secondary rounded text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                  <span>Convert to Invoice</span>
                </button>
              </>
            )}

            {quotation.status === 'CONVERTED' && quotation.convertedInvoiceNo && (
              <span className="px-3 py-1 rounded bg-primary-container text-on-primary-container font-mono text-xs font-bold">
                Converted to POS #{quotation.convertedInvoiceNo}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
