import React, { useState, useMemo } from 'react';
import {
  PurchaseReturnRecord,
  PurchaseReturnItem,
  PurchaseReturnMethod,
  SparePart,
  PayableRecord
} from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface CreatePurchaseReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  payables: PayableRecord[];
  existingPurchaseReturns: PurchaseReturnRecord[];
  parts: SparePart[];
  onConfirmReturn: (returnRecord: PurchaseReturnRecord) => void;
  currentUser?: string;
}

export const CreatePurchaseReturnModal: React.FC<CreatePurchaseReturnModalProps> = ({
  isOpen,
  onClose,
  payables,
  existingPurchaseReturns,
  parts,
  onConfirmReturn,
  currentUser = 'Rajesh (Store Admin)'
}) => {
  if (!isOpen) return null;

  // Sample Purchase Orders to return against
  const samplePurchases = useMemo(() => [
    {
      id: 'po-1',
      poNumber: 'PO-8412',
      supplierInvoiceNo: 'SUP-INV-9901',
      supplierId: 'sup-1',
      supplierName: 'Endurance Auto Tech India Ltd',
      supplierGstin: '33AABCE1234F1Z1',
      date: '02 Sep 2026',
      items: [
        {
          partId: 'part-1',
          partNumber: 'SKU-1302',
          itemName: 'TVS Genuine Clutch Plate Set (5 Plates)',
          purchasedQty: 25,
          unitPrice: 540.0,
          taxRate: 18
        },
        {
          partId: 'part-2',
          partNumber: 'SKU-4421',
          itemName: 'Front Disc Brake Pad Set (Ceramic Spec)',
          purchasedQty: 30,
          unitPrice: 260.0,
          taxRate: 18
        }
      ]
    },
    {
      id: 'po-2',
      poNumber: 'PO-8413',
      supplierInvoiceNo: 'SUP-INV-9902',
      supplierId: 'sup-2',
      supplierName: 'TVS Motor Regional Spares Division',
      supplierGstin: '33AABCT9988G1Z4',
      date: '05 Sep 2026',
      items: [
        {
          partId: 'part-3',
          partNumber: 'SKU-8819',
          itemName: '4T 10W-30 Synthetic Blend Engine Oil (1L)',
          purchasedQty: 40,
          unitPrice: 380.0,
          taxRate: 18
        },
        {
          partId: 'part-4',
          partNumber: 'SKU-0912',
          itemName: 'Heavy Duty Roller Drive Chain 428-120L',
          purchasedQty: 15,
          unitPrice: 1100.0,
          taxRate: 18
        }
      ]
    }
  ], []);

  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string>('po-1');
  const [returnDate, setReturnDate] = useState<string>(() => {
    const now = new Date();
    return now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  });

  const [debitNoteNumber, setDebitNoteNumber] = useState<string>(() => {
    return `DN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  });

  const [returnMethod, setReturnMethod] = useState<PurchaseReturnMethod>('Supplier Credit');
  const [returnReason, setReturnReason] = useState<string>('Defective / Damaged batch from factory');
  const [defectNotes, setDefectNotes] = useState<string>('');

  // Selected return quantities: Record<partId, qty>
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});

  const selectedPurchase = useMemo(() => {
    return samplePurchases.find((p) => p.id === selectedPurchaseId) || samplePurchases[0];
  }, [samplePurchases, selectedPurchaseId]);

  // Map previously returned quantities
  const previousReturnMap = useMemo(() => {
    if (!selectedPurchase) return new Map<string, number>();
    const map = new Map<string, number>();

    const matchingReturns = existingPurchaseReturns.filter(
      (r) => r.purchaseId === selectedPurchase.id || r.poNumber === selectedPurchase.poNumber
    );

    matchingReturns.forEach((r) => {
      r.items.forEach((it) => {
        const current = map.get(it.partId) || 0;
        map.set(it.partId, current + it.returnQuantity);
      });
    });

    return map;
  }, [selectedPurchase, existingPurchaseReturns]);

  const handleQtyChange = (partId: string, maxReturnable: number, val: number) => {
    const validQty = Math.max(0, Math.min(maxReturnable, val));
    setReturnQuantities((prev) => ({
      ...prev,
      [partId]: validQty
    }));
  };

  // Calculations for total debit amount
  const returnSummary = useMemo(() => {
    if (!selectedPurchase) return { items: [], totalDebit: 0, totalTax: 0, hasItemsToReturn: false };

    let totalDebit = 0;
    let totalTax = 0;
    const itemsToReturn: PurchaseReturnItem[] = [];

    selectedPurchase.items.forEach((line, idx) => {
      const qtyToReturn = returnQuantities[line.partId] || 0;
      const prevReturned = previousReturnMap.get(line.partId) || 0;

      if (qtyToReturn > 0) {
        const lineTaxable = qtyToReturn * line.unitPrice;
        const lineTax = (lineTaxable * line.taxRate) / 100;
        const lineTotal = lineTaxable + lineTax;

        totalDebit += lineTotal;
        totalTax += lineTax;

        itemsToReturn.push({
          id: `pri-${Date.now()}-${idx}`,
          partId: line.partId,
          partNumber: line.partNumber,
          itemName: line.itemName,
          purchasedQuantity: line.purchasedQty,
          previouslyReturnedQuantity: prevReturned,
          returnQuantity: qtyToReturn,
          unitPrice: line.unitPrice,
          taxRate: line.taxRate,
          amount: Number(lineTotal.toFixed(2)),
          defectNote: defectNotes || undefined
        });
      }
    });

    return {
      items: itemsToReturn,
      totalDebit: Math.round(totalDebit),
      totalTax: Number(totalTax.toFixed(2)),
      hasItemsToReturn: itemsToReturn.length > 0
    };
  }, [selectedPurchase, returnQuantities, previousReturnMap, defectNotes]);

  const handleProcessReturn = () => {
    if (!selectedPurchase) {
      alert('Please select a purchase order.');
      return;
    }

    if (!returnSummary.hasItemsToReturn) {
      alert('Please enter a return quantity of at least 1 unit for one or more items.');
      return;
    }

    const returnRecord: PurchaseReturnRecord = {
      id: `pr-${Date.now()}`,
      debitNoteNumber: debitNoteNumber.trim() || `DN-${Date.now()}`,
      date: returnDate,
      purchaseId: selectedPurchase.id,
      poNumber: selectedPurchase.poNumber,
      supplierInvoiceNo: selectedPurchase.supplierInvoiceNo,
      supplierId: selectedPurchase.supplierId,
      supplierName: selectedPurchase.supplierName,
      supplierGstin: selectedPurchase.supplierGstin,
      items: returnSummary.items,
      totalAmount: returnSummary.totalDebit,
      taxAmount: returnSummary.totalTax,
      returnMethod,
      reason: returnReason,
      notes: defectNotes ? `Defect notes: ${defectNotes}` : undefined,
      status: 'COMPLETED',
      createdBy: currentUser,
      createdAt: `${returnDate}, ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
    };

    onConfirmReturn(returnRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest border border-surface-container-high rounded shadow-xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="px-5 py-3.5 bg-surface-container-low border-b border-surface-container-high flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-xl">replay</span>
            <div>
              <h2 className="font-bold text-sm text-on-surface">Process Purchase Return &amp; Issue Debit Note</h2>
              <p className="text-[11px] text-outline">
                Deduct physical warehouse stock, issue GST debit note (GSTR-2 ITC reversal), and adjust supplier payable ledger
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface-container text-outline hover:text-on-surface">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Step 1: Select Purchase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-surface-container-low p-3.5 rounded border border-surface-container-high">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
                Step 1: Select Inward Purchase Order / Invoice <span className="text-error">*</span>
              </label>
              <select
                value={selectedPurchaseId}
                onChange={(e) => {
                  setSelectedPurchaseId(e.target.value);
                  setReturnQuantities({});
                }}
                className="w-full px-2.5 py-1.5 bg-surface-container-lowest border border-surface-container-highest rounded text-xs focus:outline-none focus:border-secondary font-medium"
              >
                {samplePurchases.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.poNumber} (Inv: {p.supplierInvoiceNo}) &bull; {p.supplierName} &bull; {p.date}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
                Debit Note # (GSTR-2)
              </label>
              <input
                type="text"
                value={debitNoteNumber}
                onChange={(e) => setDebitNoteNumber(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-surface-container-lowest border border-surface-container-highest rounded font-mono font-bold text-secondary text-xs focus:outline-none focus:border-secondary"
              />
            </div>
          </div>

          {/* Step 2: Items Table with Quantity Validation */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-on-surface uppercase tracking-wider">
                  Step 2: Select Items &amp; Return Quantities
                </span>
                <span className="text-[11px] text-outline ml-2">
                  (Supplier: <span className="font-semibold text-on-surface">{selectedPurchase.supplierName}</span>)
                </span>
              </div>
              <span className="text-[11px] text-error font-medium">
                Physical stock will be decreased atomically
              </span>
            </div>

            <div className="border border-surface-container-high rounded overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-surface-container font-label-caps text-[10px] text-outline uppercase tracking-wider">
                  <tr>
                    <th className="py-2 px-2.5 w-10 text-center">#</th>
                    <th className="py-2 px-2.5">Spare Part Name</th>
                    <th className="py-2 px-2.5 w-28">Part No (SKU)</th>
                    <th className="py-2 px-2.5 w-20 text-center">Purchased</th>
                    <th className="py-2 px-2.5 w-20 text-center">Prev. Returned</th>
                    <th className="py-2 px-2.5 w-20 text-center">Returnable</th>
                    <th className="py-2 px-2.5 w-24 text-center">Return Qty</th>
                    <th className="py-2 px-2.5 w-24 text-right">Cost Rate</th>
                    <th className="py-2 px-2.5 w-28 text-right">Debit Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high font-table-cell bg-surface-container-lowest">
                  {selectedPurchase.items.map((line, idx) => {
                    const prevReturned = previousReturnMap.get(line.partId) || 0;
                    const returnable = Math.max(0, line.purchasedQty - prevReturned);
                    const returnQty = returnQuantities[line.partId] || 0;
                    const lineTaxable = returnQty * line.unitPrice;
                    const lineTax = (lineTaxable * line.taxRate) / 100;
                    const lineTotal = lineTaxable + lineTax;

                    return (
                      <tr
                        key={line.partId}
                        className={`hover:bg-surface-container-low transition-colors ${
                          returnQty > 0 ? 'bg-secondary/5 font-semibold' : ''
                        }`}
                      >
                        <td className="py-2 px-2.5 text-center text-outline font-mono">{idx + 1}</td>
                        <td className="py-2 px-2.5 font-medium text-on-surface">{line.itemName}</td>
                        <td className="py-2 px-2.5 font-mono text-secondary font-bold">{line.partNumber}</td>
                        <td className="py-2 px-2.5 text-center font-mono">{line.purchasedQty}</td>
                        <td className="py-2 px-2.5 text-center font-mono text-outline">
                          {prevReturned > 0 ? <span className="text-error font-medium">{prevReturned}</span> : '0'}
                        </td>
                        <td className="py-2 px-2.5 text-center font-mono font-bold text-tertiary">{returnable}</td>
                        <td className="py-2 px-2.5 text-center">
                          {returnable === 0 ? (
                            <span className="text-[10px] text-outline italic">Fully Returned</span>
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="number"
                                min={0}
                                max={returnable}
                                value={returnQty}
                                onChange={(e) =>
                                  handleQtyChange(line.partId, returnable, parseInt(e.target.value) || 0)
                                }
                                className="w-16 px-1.5 py-1 bg-surface-container-low border border-surface-container-highest rounded font-mono text-center font-bold text-secondary text-xs focus:outline-none focus:border-secondary"
                              />
                              {returnable > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleQtyChange(line.partId, returnable, returnable)}
                                  className="px-1.5 py-0.5 rounded bg-surface-container hover:bg-surface-container-high text-[10px] text-outline font-mono"
                                  title="Return Maximum"
                                >
                                  All
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-2.5 text-right font-mono">{formatCurrency(line.unitPrice)}</td>
                        <td className="py-2 px-2.5 text-right font-mono font-bold text-on-surface">
                          {returnQty > 0 ? formatCurrency(lineTotal) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Step 3 & 4: Reason & Settlement Method */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-surface-container-low p-3.5 rounded border border-surface-container-high space-y-2">
                <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">
                  Step 3: Return Reason &amp; Defect Note
                </span>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-surface-container-lowest border border-surface-container-highest rounded text-xs focus:outline-none focus:border-secondary font-medium"
                >
                  <option value="Defective / Damaged batch from factory">Defective / Damaged batch from factory</option>
                  <option value="Wrong part specification dispatched by supplier">Wrong part specification dispatched</option>
                  <option value="Packaging / Transit damage">Packaging / Transit damage</option>
                  <option value="Excess / Unordered goods sent in shipment">Excess / Unordered goods sent</option>
                  <option value="Quality check failure">Quality check failure</option>
                </select>

                <textarea
                  rows={2}
                  value={defectNotes}
                  onChange={(e) => setDefectNotes(e.target.value)}
                  placeholder="Specific defect description (e.g. friction lining cracked, thread damaged)..."
                  className="w-full p-2 bg-surface-container-lowest border border-surface-container-highest rounded text-xs focus:outline-none resize-none"
                />
              </div>

              <div className="bg-surface-container-low p-3.5 rounded border border-surface-container-high space-y-2">
                <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">
                  Step 4: Supplier Settlement Method
                </span>
                <div className="space-y-2">
                  <label
                    className={`flex items-center gap-2 p-2.5 rounded border cursor-pointer select-none transition-colors ${
                      returnMethod === 'Supplier Credit'
                        ? 'bg-secondary/10 border-secondary text-secondary font-bold'
                        : 'bg-surface-container-lowest border-surface-container-highest text-on-surface'
                    }`}
                  >
                    <input
                      type="radio"
                      name="returnMethod"
                      checked={returnMethod === 'Supplier Credit'}
                      onChange={() => setReturnMethod('Supplier Credit')}
                      className="text-secondary focus:ring-0"
                    />
                    <div>
                      <span className="text-xs block">Supplier Credit (Payable Deduction)</span>
                      <span className="text-[10px] font-normal text-outline block">
                        Deducts directly from current outstanding payable balance to {selectedPurchase.supplierName}
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-2.5 rounded border cursor-pointer select-none transition-colors ${
                      returnMethod === 'Supplier Refund'
                        ? 'bg-secondary/10 border-secondary text-secondary font-bold'
                        : 'bg-surface-container-lowest border-surface-container-highest text-on-surface'
                    }`}
                  >
                    <input
                      type="radio"
                      name="returnMethod"
                      checked={returnMethod === 'Supplier Refund'}
                      onChange={() => setReturnMethod('Supplier Refund')}
                      className="text-secondary focus:ring-0"
                    />
                    <div>
                      <span className="text-xs block">Direct Bank / Cash Refund</span>
                      <span className="text-[10px] font-normal text-outline block">
                        Supplier will issue a direct payout/refund into bank account
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Summary Banner */}
            <div className="bg-secondary/5 border border-secondary/20 p-4 rounded flex items-center justify-between">
              <div>
                <span className="font-bold text-sm text-on-surface">Total Debit Value:</span>
                <div className="text-[11px] text-outline mt-0.5">
                  Includes GST ITC reversal of {formatCurrency(returnSummary.totalTax)} &bull; Deducting{' '}
                  {returnSummary.items.reduce((s, it) => s + it.returnQuantity, 0)} physical units from inventory
                </div>
              </div>
              <div className="font-mono text-xl font-bold text-secondary">
                {formatCurrency(returnSummary.totalDebit)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-surface-container-low border-t border-surface-container-high flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded border border-surface-container-highest hover:bg-surface-container text-xs font-semibold text-outline transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleProcessReturn}
            disabled={!returnSummary.hasItemsToReturn}
            className={`px-4 py-1.5 bg-secondary hover:bg-secondary-container text-on-secondary rounded text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs ${
              !returnSummary.hasItemsToReturn ? 'opacity-40 cursor-not-allowed' : ''
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>Confirm &amp; Issue Debit Note</span>
          </button>
        </div>
      </div>
    </div>
  );
};
