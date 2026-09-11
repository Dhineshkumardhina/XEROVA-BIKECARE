import React, { useState } from 'react';
import { Invoice } from '../../types';

interface POSInvoicePreviewModalProps {
  invoice: Invoice | null;
  onClose: () => void;
  initialFormat?: 'A4' | 'A5' | 'Thermal' | '4-in-1';
}

export const POSInvoicePreviewModal: React.FC<POSInvoicePreviewModalProps> = ({
  invoice,
  onClose,
  initialFormat = 'A4'
}) => {
  const [format, setFormat] = useState<'A4' | 'A5' | 'Thermal' | '4-in-1'>(initialFormat);

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  // Convert number to Indian currency words
  const numberToWords = (num: number): string => {
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const n = Math.round(num);
    if (n === 0) return 'Zero Rupees Only';
    if (n < 20) return `${a[n]} Rupees Only`;
    if (n < 100) return `${b[Math.floor(n / 10)]} ${a[n % 10]} Rupees Only`;
    if (n < 1000) return `${a[Math.floor(n / 100)]} Hundred ${n % 100 !== 0 ? 'and ' + (n % 100 < 20 ? a[n % 100] : b[Math.floor((n % 100) / 10)] + ' ' + a[(n % 100) % 10]) : ''} Rupees Only`;
    return `${Math.floor(n / 1000)} Thousand Rupees Only`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest w-full max-w-3xl rounded-lg shadow-2xl border border-surface-container-highest overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Control Ribbon */}
        <div className="p-3 bg-surface-container flex flex-wrap items-center justify-between border-b border-surface-container-high gap-2 select-none">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">receipt_long</span>
            <div>
              <span className="font-bold text-sm text-on-surface block">Tax Invoice #{invoice.id}</span>
              <span className="text-[11px] text-outline">Date: {invoice.createdAt} • Cashier: {invoice.operator}</span>
            </div>
          </div>

          {/* Format Selector Tabs */}
          <div className="flex items-center bg-surface-container-high rounded p-0.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => setFormat('A4')}
              className={`px-2.5 py-1 rounded transition-colors ${
                format === 'A4' ? 'bg-secondary text-on-secondary shadow-xs' : 'text-outline hover:text-on-surface'
              }`}
            >
              A4 Full
            </button>
            <button
              type="button"
              onClick={() => setFormat('A5')}
              className={`px-2.5 py-1 rounded transition-colors ${
                format === 'A5' ? 'bg-secondary text-on-secondary shadow-xs' : 'text-outline hover:text-on-surface'
              }`}
            >
              A5 Half
            </button>
            <button
              type="button"
              onClick={() => setFormat('Thermal')}
              className={`px-2.5 py-1 rounded transition-colors ${
                format === 'Thermal' ? 'bg-secondary text-on-secondary shadow-xs' : 'text-outline hover:text-on-surface'
              }`}
            >
              Thermal 3" (80mm)
            </button>
            <button
              type="button"
              onClick={() => setFormat('4-in-1')}
              className={`px-2.5 py-1 rounded transition-colors ${
                format === '4-in-1' ? 'bg-secondary text-on-secondary shadow-xs' : 'text-outline hover:text-on-surface'
              }`}
            >
              4-in-1 Slip
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-secondary text-on-secondary hover:bg-secondary-container rounded text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Print</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-outline hover:text-on-surface hover:bg-surface-container-high"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Printable View Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-surface-container-low flex justify-center">
          {/* FORMAT 1: THERMAL 3-INCH (80mm) RECEIPT */}
          {format === 'Thermal' ? (
            <div className="w-80 bg-white text-black p-4 font-mono text-[11px] shadow-lg rounded space-y-2 border border-surface-container-high">
              <div className="text-center border-b border-black pb-2 space-y-0.5">
                <div className="font-bold text-sm uppercase">BIKE ERP SPARES</div>
                <div className="text-[10px]">No. 42, Automobile Hub, Mount Rd, Chennai</div>
                <div className="text-[10px]">Ph: +91 98401 23456 • GST: 33AAAAA8899A1Z2</div>
                <div className="font-bold pt-1">*** CASH / TAX INVOICE ***</div>
              </div>

              <div className="flex justify-between text-[10px] border-b border-dashed border-black pb-1">
                <span>Inv: {invoice.id}</span>
                <span>{invoice.createdAt}</span>
              </div>

              <div className="text-[10px] space-y-0.5 border-b border-dashed border-black pb-1">
                <div>Cust: <strong className="uppercase">{invoice.customerName}</strong></div>
                {invoice.customerPhone && <div>Mob: {invoice.customerPhone}</div>}
                {invoice.vehicleNo && <div>Veh: <strong>{invoice.vehicleNo}</strong> ({invoice.bikeModel || 'Universal'})</div>}
                <div>Cashier: {invoice.operator}</div>
              </div>

              {/* Items in Thermal */}
              <div className="border-b border-dashed border-black pb-1 space-y-1">
                <div className="flex justify-between font-bold text-[10px]">
                  <span>ITEM</span>
                  <span>QTY x RATE</span>
                  <span>AMT</span>
                </div>
                {invoice.lineItems.map((item, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="font-bold truncate">{item.name}</div>
                    <div className="flex justify-between text-[10px] text-gray-700">
                      <span>{item.sku}</span>
                      <span>{item.qty} x {item.rate.toFixed(0)}</span>
                      <span className="font-bold text-black">₹{item.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Thermal Summary */}
              <div className="space-y-0.5 text-[10px] border-b border-dashed border-black pb-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{invoice.subtotal.toFixed(2)}</span>
                </div>
                {invoice.itemDiscountTotal > 0 && (
                  <div className="flex justify-between">
                    <span>Item Discount:</span>
                    <span>-₹{invoice.itemDiscountTotal.toFixed(2)}</span>
                  </div>
                )}
                {invoice.additionalChargesTotal > 0 && (
                  <div className="flex justify-between">
                    <span>Fitting/Labour:</span>
                    <span>+₹{invoice.additionalChargesTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>CGST (9%) + SGST (9%):</span>
                  <span>₹{(invoice.cgst + invoice.sgst).toFixed(2)}</span>
                </div>
                {invoice.roundOff !== 0 && (
                  <div className="flex justify-between">
                    <span>Round Off:</span>
                    <span>{invoice.roundOff > 0 ? `+₹${invoice.roundOff.toFixed(2)}` : `-₹${Math.abs(invoice.roundOff).toFixed(2)}`}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-xs pt-1 border-t border-black">
                  <span>GRAND TOTAL:</span>
                  <span>₹{invoice.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-0.5">
                  <span>Paid via:</span>
                  <span className="font-bold uppercase">{invoice.payMode}</span>
                </div>
              </div>

              {/* Thermal Barcode Footer */}
              <div className="text-center pt-2 text-[9px] space-y-1">
                <div className="font-bold text-xs tracking-widest">||||| | |||| | |||||| |||</div>
                <div>Goods once sold cannot be returned without bill. Electrical items no warranty.</div>
                <div className="font-bold">THANK YOU! VISIT AGAIN</div>
              </div>
            </div>
          ) : (
            /* FORMAT 2 & 3: A4 & A5 FULL PROFESSIONAL GST TAX INVOICE */
            <div
              className={`bg-white text-black p-6 sm:p-8 rounded shadow-xl border border-surface-container-high space-y-4 font-sans ${
                format === 'A5' ? 'max-w-xl text-[11px]' : 'max-w-2xl text-xs'
              }`}
              id="printable-full-invoice"
            >
              {/* Header: Company Details & Tax Invoice Badge */}
              <div className="flex justify-between items-start border-b-2 border-primary/40 pb-3">
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-primary tracking-tight">
                    BIKE ERP SPARE PARTS &amp; ACCESSORIES
                  </h1>
                  <p className="text-gray-600 text-xs mt-0.5">
                    Authorized Two-Wheeler Multi-Brand Genuine Parts Distributor
                  </p>
                  <p className="text-gray-600 text-xs">
                    No. 42, Automobile Hub, Mount Road, Chennai - 600002
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs font-mono font-bold text-gray-800">
                    <span>GSTIN: 33AAAAA8899A1Z2</span>
                    <span>•</span>
                    <span>State: Tamil Nadu (33)</span>
                    <span>•</span>
                    <span>Ph: +91 98401 23456</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-block px-3 py-1 bg-secondary text-white font-bold text-xs rounded tracking-wider uppercase mb-1">
                    TAX INVOICE
                  </span>
                  <div className="font-mono text-sm font-bold text-gray-900">{invoice.id}</div>
                  <div className="text-gray-600 text-xs">{invoice.createdAt}</div>
                </div>
              </div>

              {/* Customer, Vehicle & Cashier Information Grid */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded border border-gray-200 text-xs">
                <div>
                  <span className="font-bold text-gray-500 uppercase text-[10px] block">Customer Details</span>
                  <div className="font-bold text-gray-900 text-sm">{invoice.customerName}</div>
                  {invoice.customerPhone && <div className="text-gray-700">Phone: {invoice.customerPhone}</div>}
                  {invoice.gstin && <div className="font-mono text-gray-800">GSTIN: {invoice.gstin}</div>}
                  {invoice.address && <div className="text-gray-600 truncate">Address: {invoice.address}</div>}
                </div>

                <div>
                  <span className="font-bold text-gray-500 uppercase text-[10px] block">Vehicle &amp; Counter Dispatch</span>
                  <div className="font-mono font-bold text-gray-900 text-sm">
                    {invoice.vehicleNo ? `🏍️ ${invoice.vehicleNo}` : 'Retail Counter Walk-in'}
                  </div>
                  <div className="text-gray-700">Model: {invoice.bikeModel || 'Two Wheeler'}</div>
                  <div className="text-gray-600">Cashier: {invoice.operator}</div>
                  <div className="text-gray-600">Payment: <strong className="uppercase font-bold">{invoice.payMode}</strong></div>
                </div>
              </div>

              {/* Requirement 15: Item Table */}
              <div className="border border-gray-300 rounded overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-gray-100 uppercase text-[10px] font-bold text-gray-700 border-b border-gray-300">
                    <tr>
                      <th className="py-2 px-2 text-center w-8">#</th>
                      <th className="py-2 px-2">Part No / Description</th>
                      <th className="py-2 px-2 text-center w-16">HSN</th>
                      <th className="py-2 px-2 text-center w-12">Qty</th>
                      <th className="py-2 px-2 text-right w-20">Rate</th>
                      <th className="py-2 px-2 text-right w-16">Disc</th>
                      <th className="py-2 px-2 text-right w-20">Taxable</th>
                      <th className="py-2 px-2 text-center w-12">GST</th>
                      <th className="py-2 px-2 text-right w-24">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {invoice.lineItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="py-2 px-2 text-center font-mono text-gray-500">{idx + 1}</td>
                        <td className="py-2 px-2">
                          <div className="font-semibold text-gray-900">{item.name}</div>
                          <div className="font-mono text-[10px] text-gray-500">{item.sku}</div>
                        </td>
                        <td className="py-2 px-2 text-center font-mono text-gray-600">{item.hsn}</td>
                        <td className="py-2 px-2 text-center font-mono font-bold text-gray-900">{item.qty}</td>
                        <td className="py-2 px-2 text-right font-mono">₹{item.rate.toFixed(2)}</td>
                        <td className="py-2 px-2 text-right font-mono text-gray-600">₹{item.discount.toFixed(2)}</td>
                        <td className="py-2 px-2 text-right font-mono">₹{item.taxableAmount.toFixed(2)}</td>
                        <td className="py-2 px-2 text-center font-mono text-gray-600">{item.gstRate}%</td>
                        <td className="py-2 px-2 text-right font-mono font-bold text-gray-900">₹{item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Requirement 15: Summary Box & Amount in Words */}
              <div className="grid grid-cols-2 gap-6 pt-2">
                <div className="space-y-3">
                  <div className="bg-gray-50 p-2.5 rounded border border-gray-200 text-xs">
                    <span className="font-bold text-gray-500 uppercase text-[10px] block">Amount in Words:</span>
                    <span className="font-serif italic font-bold text-gray-800">
                      {numberToWords(invoice.totalAmount)}
                    </span>
                  </div>

                  <div className="text-[10px] text-gray-600 space-y-0.5 border border-gray-200 p-2 rounded">
                    <span className="font-bold uppercase text-gray-700 block">Terms &amp; Conditions:</span>
                    <div>1. Goods once sold will not be taken back or exchanged without original bill.</div>
                    <div>2. Electrical components and coils carry no warranty or guarantee.</div>
                    <div>3. All disputes are subject to Chennai jurisdiction only.</div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-gray-700">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span className="font-mono">₹{invoice.subtotal.toFixed(2)}</span>
                  </div>

                  {invoice.itemDiscountTotal > 0 && (
                    <div className="flex justify-between text-secondary font-medium">
                      <span>Item Discounts:</span>
                      <span className="font-mono">-₹{invoice.itemDiscountTotal.toFixed(2)}</span>
                    </div>
                  )}

                  {invoice.additionalChargesTotal > 0 && (
                    <div className="flex justify-between text-gray-800">
                      <span>Fitting / Freight Charges:</span>
                      <span className="font-mono">+₹{invoice.additionalChargesTotal.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-800 font-medium">
                    <span>Taxable Value:</span>
                    <span className="font-mono">₹{(invoice.subtotal - invoice.itemDiscountTotal).toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>CGST (9%):</span>
                    <span className="font-mono">₹{invoice.cgst.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>SGST (9%):</span>
                    <span className="font-mono">₹{invoice.sgst.toFixed(2)}</span>
                  </div>

                  {invoice.roundOff !== 0 && (
                    <div className="flex justify-between text-gray-500 text-[11px]">
                      <span>Round Off:</span>
                      <span className="font-mono">
                        {invoice.roundOff > 0 ? `+₹${invoice.roundOff.toFixed(2)}` : `-₹${Math.abs(invoice.roundOff).toFixed(2)}`}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-base font-extrabold text-secondary pt-2 border-t-2 border-gray-800">
                    <span>GRAND TOTAL:</span>
                    <span className="font-mono">₹{invoice.totalAmount.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-xs pt-1 font-bold text-gray-900">
                    <span>Payment Mode:</span>
                    <span className="uppercase">{invoice.payMode}</span>
                  </div>
                </div>
              </div>

              {/* Signature Box & QR Footer */}
              <div className="pt-6 flex justify-between items-end border-t border-gray-200">
                <div className="text-left font-mono text-[10px] text-gray-500">
                  <div>Thank you for choosing BIKE ERP!</div>
                  <div className="tracking-widest font-bold text-gray-800 text-xs mt-1">||||| ||| ||||||| |||| ||</div>
                </div>

                <div className="text-right space-y-8">
                  <div className="text-xs font-semibold text-gray-800">For BIKE ERP SPARES &amp; ACCESSORIES</div>
                  <div className="text-xs text-gray-600 border-t border-gray-400 pt-1">Authorized Signatory</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-surface-container border-t border-surface-container-high flex items-center justify-between text-xs">
          <span className="text-outline font-mono">
            Print Format: <strong className="text-on-surface">{format}</strong> • Thermal (80mm ESC/POS) &amp; Laser Ready
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-surface-container-lowest hover:bg-surface-container rounded text-on-surface font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
