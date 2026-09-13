import React from 'react';
import { Quotation, CompanyProfile } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface PrintQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: Quotation | null;
  companyProfile?: CompanyProfile;
}

export const PrintQuotationModal: React.FC<PrintQuotationModalProps> = ({
  isOpen,
  onClose,
  quotation,
  companyProfile
}) => {
  if (!isOpen || !quotation) return null;

  const handleBrowserPrint = () => {
    window.print();
  };

  const firmName = companyProfile?.firmName || 'BIKE ERP AUTO SPARES & SERVICE';
  const address = companyProfile?.address || '102 Anna Salai, Mount Road, Chennai, Tamil Nadu - 600002';
  const gstin = companyProfile?.gstin || '33AAAAA0000A1Z5';
  const phone = companyProfile?.phone || '+91 98401 23456';
  const bankName = companyProfile?.bankName || 'HDFC Bank';
  const accountNo = companyProfile?.accountNumber || '50200012345678';
  const ifsc = companyProfile?.ifsc || 'HDFC0001234';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 print:p-0 print:static print:bg-white">
      <div className="bg-surface-container-lowest border border-surface-container-high rounded shadow-2xl w-full max-w-3xl max-h-[95vh] flex flex-col overflow-hidden text-xs print:border-none print:shadow-none print:max-w-none print:max-h-none">
        {/* Modal Toolbar (hidden when printing) */}
        <div className="px-5 py-3 bg-surface-container-low border-b border-surface-container-high flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-xl">print</span>
            <span className="font-bold text-sm text-on-surface">
              Print Proforma Estimate ({quotation.quotationNumber})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBrowserPrint}
              className="px-3.5 py-1.5 bg-secondary hover:bg-secondary-container text-on-secondary rounded text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Print Document</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-surface-container text-outline hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        {/* Printable Document Paper */}
        <div className="flex-1 overflow-y-auto p-8 bg-white text-black font-sans print:p-0 print:overflow-visible">
          {/* Header */}
          <div className="border-b-2 border-black pb-4 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-black tracking-tight text-gray-950 uppercase">
                  {firmName}
                </h1>
                <p className="text-[11px] text-gray-700 mt-0.5">{address}</p>
                <div className="flex gap-4 text-[11px] text-gray-700 mt-1 font-mono">
                  <span>GSTIN: {gstin}</span>
                  <span>Ph: {phone}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-gray-100 border border-gray-400 font-bold text-xs uppercase tracking-wider rounded">
                  PROFORMA ESTIMATE
                </span>
                <div className="font-mono font-bold text-sm mt-1 text-gray-900">
                  {quotation.quotationNumber}
                </div>
                <div className="text-[11px] text-gray-600 mt-0.5">Date: {quotation.date}</div>
              </div>
            </div>
          </div>

          {/* Customer & Vehicle Info */}
          <div className="grid grid-cols-2 gap-4 border border-gray-300 rounded p-3 mb-4 text-[11px]">
            <div>
              <span className="font-bold text-gray-500 uppercase tracking-wider block text-[9px]">
                Quotation Issued To
              </span>
              <div className="font-bold text-gray-900 text-xs mt-0.5">{quotation.customerName}</div>
              {quotation.customerMobile && (
                <div className="text-gray-700 font-mono mt-0.5">Mobile: {quotation.customerMobile}</div>
              )}
              {quotation.customerGstin && (
                <div className="text-gray-700 font-mono">GSTIN: {quotation.customerGstin}</div>
              )}
            </div>

            <div>
              <span className="font-bold text-gray-500 uppercase tracking-wider block text-[9px]">
                Vehicle &amp; Terms
              </span>
              <div className="font-bold text-gray-900 mt-0.5">
                Reg No: <span className="font-mono">{quotation.vehicleNumber || 'Counter Estimate'}</span>
              </div>
              {quotation.vehicleModel && (
                <div className="text-gray-700">Model: {quotation.vehicleModel}</div>
              )}
              <div className="text-gray-800 font-semibold mt-1">
                Valid Until: <span className="underline">{quotation.validUntil}</span> (15 Days)
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <table className="w-full border-collapse border border-gray-300 text-xs mb-4">
            <thead>
              <tr className="bg-gray-100 font-bold text-gray-800 border-b border-gray-300">
                <th className="py-2 px-2 border-r border-gray-300 text-center w-8">#</th>
                <th className="py-2 px-2 border-r border-gray-300 text-left">Spare Part / Description</th>
                <th className="py-2 px-2 border-r border-gray-300 text-left w-24">SKU / HSN</th>
                <th className="py-2 px-2 border-r border-gray-300 text-center w-12">Qty</th>
                <th className="py-2 px-2 border-r border-gray-300 text-right w-20">Rate (₹)</th>
                <th className="py-2 px-2 border-r border-gray-300 text-right w-16">Disc (₹)</th>
                <th className="py-2 px-2 border-r border-gray-300 text-center w-14">GST %</th>
                <th className="py-2 px-2 text-right w-24">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {quotation.items.map((it, idx) => (
                <tr key={it.id} className="border-b border-gray-200">
                  <td className="py-1.5 px-2 border-r border-gray-200 text-center font-mono">{idx + 1}</td>
                  <td className="py-1.5 px-2 border-r border-gray-200 font-semibold text-gray-900">
                    {it.itemName}
                    {it.vehicle && <span className="text-gray-500 font-normal block text-[10px]">{it.vehicle}</span>}
                  </td>
                  <td className="py-1.5 px-2 border-r border-gray-200 font-mono text-gray-700">{it.partNumber}</td>
                  <td className="py-1.5 px-2 border-r border-gray-200 text-center font-mono font-medium">{it.quantity}</td>
                  <td className="py-1.5 px-2 border-r border-gray-200 text-right font-mono">{formatCurrency(it.rate)}</td>
                  <td className="py-1.5 px-2 border-r border-gray-200 text-right font-mono text-gray-600">
                    {it.discount > 0 ? formatCurrency(it.discount) : '-'}
                  </td>
                  <td className="py-1.5 px-2 border-r border-gray-200 text-center font-mono">{it.taxRate}%</td>
                  <td className="py-1.5 px-2 text-right font-mono font-bold text-gray-900">{formatCurrency(it.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pricing Calculation & Bank Details */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="border border-gray-300 rounded p-3 text-[11px] space-y-1">
              <span className="font-bold text-gray-700 uppercase tracking-wider block text-[9px] mb-1">
                Bank Details for NEFT / UPI
              </span>
              <div>Bank: <span className="font-semibold">{bankName}</span></div>
              <div>A/C No: <span className="font-mono font-semibold">{accountNo}</span></div>
              <div>IFSC Code: <span className="font-mono font-semibold">{ifsc}</span></div>
              <div className="pt-2 text-gray-600 italic">
                * This is a formal proforma estimate, not a tax invoice.
              </div>
            </div>

            <div className="border border-gray-300 rounded p-3 text-xs space-y-1.5 bg-gray-50">
              <div className="flex justify-between">
                <span className="text-gray-600">Taxable Value:</span>
                <span className="font-mono font-semibold">{formatCurrency(quotation.taxableAmount)}</span>
              </div>
              {quotation.cgst > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">CGST Total:</span>
                  <span className="font-mono">{formatCurrency(quotation.cgst)}</span>
                </div>
              )}
              {quotation.sgst > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">SGST Total:</span>
                  <span className="font-mono">{formatCurrency(quotation.sgst)}</span>
                </div>
              )}
              {quotation.igst > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">IGST Total:</span>
                  <span className="font-mono">{formatCurrency(quotation.igst)}</span>
                </div>
              )}
              {quotation.fittingCharges > 0 && (
                <div className="flex justify-between border-t border-gray-300 pt-1">
                  <span className="text-gray-800 font-medium">Fitting &amp; Labour:</span>
                  <span className="font-mono font-semibold">{formatCurrency(quotation.fittingCharges)}</span>
                </div>
              )}
              <div className="flex justify-between border-t-2 border-black pt-2">
                <span className="font-bold text-sm text-gray-950">Grand Total:</span>
                <span className="font-mono text-base font-bold text-gray-950">
                  {formatCurrency(quotation.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Terms and Signature */}
          <div className="border-t border-gray-300 pt-3 flex justify-between items-end text-[10px]">
            <div className="max-w-md text-gray-600">
              <span className="font-bold uppercase text-gray-700 block mb-0.5">Terms &amp; Conditions:</span>
              <p className="whitespace-pre-wrap">{quotation.termsConditions || '1. Rates valid for 15 days.\n2. Fitting charges extra as applicable.'}</p>
            </div>
            <div className="text-center">
              <div className="w-36 border-b border-black mb-1"></div>
              <span className="font-semibold text-gray-800">Authorized Signatory</span>
              <div className="text-gray-500 text-[9px]">{firmName}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
