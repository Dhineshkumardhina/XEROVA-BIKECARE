import React from 'react';
import { SalesReturnRecord, PurchaseReturnRecord, CompanyProfile } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface PrintReturnNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  salesReturn?: SalesReturnRecord | null;
  purchaseReturn?: PurchaseReturnRecord | null;
  companyProfile?: CompanyProfile;
}

export const PrintReturnNoteModal: React.FC<PrintReturnNoteModalProps> = ({
  isOpen,
  onClose,
  salesReturn,
  purchaseReturn,
  companyProfile
}) => {
  if (!isOpen || (!salesReturn && !purchaseReturn)) return null;

  const isSalesCreditNote = !!salesReturn;
  const docTitle = isSalesCreditNote ? 'GST CREDIT NOTE (GSTR-1 CDNR)' : 'GST DEBIT NOTE (GSTR-2 ITC)';
  const docNumber = isSalesCreditNote ? salesReturn!.creditNoteNumber : purchaseReturn!.debitNoteNumber;
  const docDate = isSalesCreditNote ? salesReturn!.date : purchaseReturn!.date;
  const partyName = isSalesCreditNote ? salesReturn!.customerName : purchaseReturn!.supplierName;
  const partyPhone = isSalesCreditNote ? salesReturn!.customerMobile : '';
  const partyGstin = isSalesCreditNote ? '' : purchaseReturn!.supplierGstin || '';
  const refDoc = isSalesCreditNote ? `Invoice #${salesReturn!.invoiceNumber}` : `PO #${purchaseReturn!.poNumber}`;
  const totalAmount = isSalesCreditNote ? salesReturn!.refundAmount : purchaseReturn!.totalAmount;
  const reason = isSalesCreditNote ? salesReturn!.reason : purchaseReturn!.reason;
  const method = isSalesCreditNote ? salesReturn!.refundMethod : purchaseReturn!.returnMethod;
  const items = isSalesCreditNote ? salesReturn!.items : purchaseReturn!.items;

  const firmName = companyProfile?.firmName || 'BIKE ERP AUTO SPARES & SERVICE';
  const address = companyProfile?.address || '102 Anna Salai, Mount Road, Chennai, Tamil Nadu - 600002';
  const gstin = companyProfile?.gstin || '33AAAAA0000A1Z5';
  const phone = companyProfile?.phone || '+91 98401 23456';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150 print:p-0 print:static print:bg-white">
      <div className="bg-surface-container-lowest border border-surface-container-high rounded shadow-2xl w-full max-w-3xl max-h-[95vh] flex flex-col overflow-hidden text-xs print:border-none print:shadow-none print:max-w-none print:max-h-none">
        {/* Toolbar */}
        <div className="px-5 py-3 bg-surface-container-low border-b border-surface-container-high flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-xl">print</span>
            <span className="font-bold text-sm text-on-surface">
              Print {docTitle} ({docNumber})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
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

        {/* Printable Paper */}
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
                <span
                  className={`inline-block px-3 py-1 font-bold text-xs uppercase tracking-wider rounded border ${
                    isSalesCreditNote
                      ? 'bg-blue-50 text-blue-900 border-blue-400'
                      : 'bg-amber-50 text-amber-900 border-amber-400'
                  }`}
                >
                  {isSalesCreditNote ? 'GST CREDIT NOTE' : 'GST DEBIT NOTE'}
                </span>
                <div className="font-mono font-bold text-sm mt-1 text-gray-900">{docNumber}</div>
                <div className="text-[11px] text-gray-600 mt-0.5">Date: {docDate}</div>
              </div>
            </div>
          </div>

          {/* Party and Reference Box */}
          <div className="grid grid-cols-2 gap-4 border border-gray-300 rounded p-3 mb-4 text-[11px]">
            <div>
              <span className="font-bold text-gray-500 uppercase tracking-wider block text-[9px]">
                {isSalesCreditNote ? 'Issued To Customer' : 'Issued To Supplier'}
              </span>
              <div className="font-bold text-gray-900 text-xs mt-0.5">{partyName}</div>
              {partyPhone && <div className="text-gray-700 font-mono mt-0.5">Phone: {partyPhone}</div>}
              {partyGstin && <div className="text-gray-700 font-mono">GSTIN: {partyGstin}</div>}
            </div>

            <div>
              <span className="font-bold text-gray-500 uppercase tracking-wider block text-[9px]">
                Original Reference &amp; Settlement
              </span>
              <div className="font-bold text-gray-900 mt-0.5">
                Reference: <span className="font-mono">{refDoc}</span>
              </div>
              <div className="text-gray-700 mt-0.5">
                Settlement Mode: <span className="font-semibold">{method}</span>
              </div>
              <div className="text-gray-700 mt-0.5">
                Reason: <span className="italic">{reason}</span>
              </div>
            </div>
          </div>

          {/* Returned Items Table */}
          <table className="w-full border-collapse border border-gray-300 text-xs mb-4">
            <thead>
              <tr className="bg-gray-100 font-bold text-gray-800 border-b border-gray-300">
                <th className="py-2 px-2 border-r border-gray-300 text-center w-8">#</th>
                <th className="py-2 px-2 border-r border-gray-300 text-left">Returned Spare Part</th>
                <th className="py-2 px-2 border-r border-gray-300 text-left w-24">Part No (SKU)</th>
                <th className="py-2 px-2 border-r border-gray-300 text-center w-16">Return Qty</th>
                <th className="py-2 px-2 border-r border-gray-300 text-right w-24">Rate (₹)</th>
                <th className="py-2 px-2 border-r border-gray-300 text-center w-14">GST %</th>
                <th className="py-2 px-2 text-right w-24">Reversed (₹)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it: any, idx: number) => {
                const rate = isSalesCreditNote ? it.rate : it.unitPrice;
                return (
                  <tr key={it.id || idx} className="border-b border-gray-200">
                    <td className="py-1.5 px-2 border-r border-gray-200 text-center font-mono">{idx + 1}</td>
                    <td className="py-1.5 px-2 border-r border-gray-200 font-semibold text-gray-900">
                      {it.itemName}
                      {it.defectNote && (
                        <span className="text-gray-500 font-normal block text-[10px]">
                          Note: {it.defectNote}
                        </span>
                      )}
                    </td>
                    <td className="py-1.5 px-2 border-r border-gray-200 font-mono text-gray-700">{it.partNumber}</td>
                    <td className="py-1.5 px-2 border-r border-gray-200 text-center font-mono font-bold text-gray-900">
                      {it.returnQuantity}
                    </td>
                    <td className="py-1.5 px-2 border-r border-gray-200 text-right font-mono">{formatCurrency(rate)}</td>
                    <td className="py-1.5 px-2 border-r border-gray-200 text-center font-mono">{it.taxRate}%</td>
                    <td className="py-1.5 px-2 text-right font-mono font-bold text-gray-900">
                      {formatCurrency(it.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Financial Reversal Summary */}
          <div className="flex justify-end mb-6">
            <div className="w-64 border border-gray-300 rounded p-3 text-xs space-y-1.5 bg-gray-50">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Reversed Value:</span>
                <span className="font-mono font-bold text-sm text-gray-950">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              <div className="text-[10px] text-gray-500 pt-1 border-t border-gray-200">
                * Adjusted in {isSalesCreditNote ? 'GSTR-1 CDNR Return & Customer Balance' : 'GSTR-2 ITC Reversal & Supplier Balance'}
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="border-t border-gray-300 pt-4 flex justify-between items-end text-[10px]">
            <div>
              <span className="font-bold uppercase text-gray-700 block mb-0.5">Verification Note:</span>
              <p className="text-gray-600">
                Goods physically inspected and restocked / returned to warehouse stock ledger.
              </p>
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
