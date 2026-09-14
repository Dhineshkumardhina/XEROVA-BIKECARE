import React, { useState, useMemo } from 'react';
import {
  Invoice,
  SalesReturnRecord,
  SalesReturnItem,
  SalesReturnMethod,
  SparePart
} from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface CreateSalesReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
  existingReturns: SalesReturnRecord[];
  parts: SparePart[];
  onConfirmReturn: (returnRecord: SalesReturnRecord) => void;
  currentUser?: string;
}

export const CreateSalesReturnModal: React.FC<CreateSalesReturnModalProps> = ({
  isOpen,
  onClose,
  invoices,
  existingReturns,
  parts,
  onConfirmReturn,
  currentUser = 'Rajesh (Store Admin)'
}) => {
  if (!isOpen) return null;

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [returnDate, setReturnDate] = useState<string>(() => {
    const now = new Date();
    return now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  });

  const [creditNoteNumber, setCreditNoteNumber] = useState<string>(() => {
    return `CN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  });

  const [refundMethod, setRefundMethod] = useState<SalesReturnMethod>('Customer Credit');
  const [returnReason, setReturnReason] = useState<string>('Customer cancelled repair job');
  const [customReasonNotes, setCustomReasonNotes] = useState<string>('');

  // Selected return quantities: Record<lineItemId, returnQty>
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const selectedInvoice = useMemo(() => {
    return invoices.find((inv) => inv.id === selectedInvoiceId) || null;
  }, [invoices, selectedInvoiceId]);

  // Calculate previously returned quantities for items on this invoice
  const previousReturnMap = useMemo(() => {
    if (!selectedInvoice) return new Map<string, number>();
    const map = new Map<string, number>();

    const matchingReturns = existingReturns.filter(
      (r) => r.saleId === selectedInvoice.id || r.invoiceNumber === selectedInvoice.id
    );

    matchingReturns.forEach((r) => {
      r.items.forEach((it) => {
        const current = map.get(it.partId) || 0;
        map.set(it.partId, current + it.returnQuantity);
      });
    });

    return map;
  }, [selectedInvoice, existingReturns]);

  // When invoice changes, initialize return quantities
  const handleInvoiceSelect = (invId: string) => {
    setSelectedInvoiceId(invId);
    setReturnQuantities({});
  };

  const handleQtyChange = (itemId: string, maxReturnable: number, val: number) => {
    const validQty = Math.max(0, Math.min(maxReturnable, val));
    setReturnQuantities((prev) => ({
      ...prev,
      [itemId]: validQty
    }));
  };

  // Calculations for total refund
  const returnSummary = useMemo(() => {
    if (!selectedInvoice) return { items: [], totalRefund: 0, totalTax: 0, hasItemsToReturn: false };

    let totalRefund = 0;
    let totalTax = 0;
    const itemsToReturn: SalesReturnItem[] = [];

    selectedInvoice.lineItems.forEach((line, idx) => {
      const partId = line.partId || `part-sku-${line.partNumber || idx}`;
      const qtyToReturn = returnQuantities[line.id || `line-${idx}`] || 0;
      const prevReturned = previousReturnMap.get(partId) || 0;

      if (qtyToReturn > 0) {
        const unitRate = line.sellingRate || line.rate || 0;
        const taxRate = line.gstRate || 18;
        const lineTaxable = qtyToReturn * unitRate;
        const lineTax = (lineTaxable * taxRate) / 100;
        const lineTotal = lineTaxable + lineTax;

        totalRefund += lineTotal;
        totalTax += lineTax;

        itemsToReturn.push({
          id: `sri-${Date.now()}-${idx}`,
          partId,
          partNumber: line.partNumber || line.sku || 'SKU-GEN',
          itemName: line.name || line.description || 'Spare Item',
          soldQuantity: line.qty,
          previouslyReturnedQuantity: prevReturned,
          returnQuantity: qtyToReturn,
          rate: unitRate,
          taxRate,
          amount: Number(lineTotal.toFixed(2)),
          restocked: true
        });
      }
    });

    return {
      items: itemsToReturn,
      totalRefund: Math.round(totalRefund),
      totalTax: Number(totalTax.toFixed(2)),
      hasItemsToReturn: itemsToReturn.length > 0
    };
  }, [selectedInvoice, returnQuantities, previousReturnMap]);

  const handleProcessReturn = () => {
    if (!selectedInvoice) {
      setFormError('Please select an invoice to return items from.');
      return;
    }

    if (!returnSummary.hasItemsToReturn) {
      setFormError('Please specify a return quantity of at least 1 unit for one or more items.');
      return;
    }
    setFormError(null);

    const returnRecord: SalesReturnRecord = {
      id: `sr-${Date.now()}`,
      creditNoteNumber: creditNoteNumber.trim() || `CN-${Date.now()}`,
      date: returnDate,
      saleId: selectedInvoice.id,
      invoiceNumber: selectedInvoice.id,
      customerId: selectedInvoice.garageAccountId,
      customerName: selectedInvoice.customerName,
      customerMobile: selectedInvoice.customerPhone,
      items: returnSummary.items,
      refundAmount: returnSummary.totalRefund,
      taxAmount: returnSummary.totalTax,
      refundMethod,
      reason: returnReason + (customReasonNotes ? ` - ${customReasonNotes}` : ''),
      notes: `Credit Note issued for ${selectedInvoice.id}. Mode: ${refundMethod}.`,
      restocked: true,
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
            <span className="material-symbols-outlined text-secondary text-xl">assignment_return</span>
            <div>
              <h2 className="font-bold text-sm text-on-surface">Process Sales Return &amp; Issue Credit Note</h2>
              <p className="text-[11px] text-outline">
                Verify original invoice, inspect damaged/returned spare items, adjust customer ledger &amp; GST CDNR
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface-container text-outline hover:text-on-surface">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {formError && (
            <div className="p-2.5 rounded bg-error/15 border border-error/30 text-error font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{formError}</span>
            </div>
          )}
          {/* Step 1: Select Invoice & Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-surface-container-low p-3.5 rounded border border-surface-container-high">
            {/* Invoice Picker */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
                Step 1: Select Original Sales Invoice <span className="text-error">*</span>
              </label>
              <select
                value={selectedInvoiceId}
                onChange={(e) => handleInvoiceSelect(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-surface-container-lowest border border-surface-container-highest rounded text-xs focus:outline-none focus:border-secondary font-medium"
              >
                <option value="">-- Choose Invoice to Return --</option>
                {invoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.id} &bull; {inv.createdAt} &bull; {inv.customerName} ({inv.vehicleNo || 'Counter'}) - {formatCurrency(inv.totalAmount)}
                  </option>
                ))}
              </select>
            </div>

            {/* Credit Note Number */}
            <div>
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
                Credit Note # (GSTR-1 CDNR)
              </label>
              <input
                type="text"
                value={creditNoteNumber}
                onChange={(e) => setCreditNoteNumber(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-surface-container-lowest border border-surface-container-highest rounded font-mono font-bold text-secondary text-xs focus:outline-none focus:border-secondary"
              />
            </div>
          </div>

          {/* If Invoice is Selected: Show Items with Returnable Quantity Validation */}
          {selectedInvoice && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-on-surface uppercase tracking-wider">
                    Step 2: Select Items to Return
                  </span>
                  <span className="text-[11px] text-outline ml-2">
                    (Customer: <span className="font-semibold text-on-surface">{selectedInvoice.customerName}</span>, Vehicle:{' '}
                    <span className="font-mono">{selectedInvoice.vehicleNo || 'Counter'}</span>)
                  </span>
                </div>
                <span className="text-[11px] text-tertiary font-medium">
                  Restocking into inventory automatically
                </span>
              </div>

              <div className="border border-surface-container-high rounded overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-surface-container font-label-caps text-[10px] text-outline uppercase tracking-wider">
                    <tr>
                      <th className="py-2 px-2.5 w-10 text-center">#</th>
                      <th className="py-2 px-2.5">Spare Part Name</th>
                      <th className="py-2 px-2.5 w-28">Part No (SKU)</th>
                      <th className="py-2 px-2.5 w-20 text-center">Sold Qty</th>
                      <th className="py-2 px-2.5 w-20 text-center">Prev. Returned</th>
                      <th className="py-2 px-2.5 w-20 text-center">Available</th>
                      <th className="py-2 px-2.5 w-24 text-center">Return Qty</th>
                      <th className="py-2 px-2.5 w-24 text-right">Unit Rate</th>
                      <th className="py-2 px-2.5 w-28 text-right">Refund Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-high font-table-cell bg-surface-container-lowest">
                    {selectedInvoice.lineItems.map((line, idx) => {
                      const lineKey = line.id || `line-${idx}`;
                      const partId = line.partId || `part-sku-${line.partNumber || idx}`;
                      const prevReturned = previousReturnMap.get(partId) || 0;
                      const returnable = Math.max(0, line.qty - prevReturned);
                      const returnQty = returnQuantities[lineKey] || 0;
                      const unitRate = line.sellingRate || line.rate || 0;
                      const taxRate = line.gstRate || 18;
                      const lineTaxable = returnQty * unitRate;
                      const lineTax = (lineTaxable * taxRate) / 100;
                      const lineTotal = lineTaxable + lineTax;

                      return (
                        <tr
                          key={lineKey}
                          className={`hover:bg-surface-container-low transition-colors ${
                            returnQty > 0 ? 'bg-secondary/5 font-semibold' : ''
                          }`}
                        >
                          <td className="py-2 px-2.5 text-center text-outline font-mono">{idx + 1}</td>
                          <td className="py-2 px-2.5 font-medium text-on-surface">
                            {line.name || line.description}
                          </td>
                          <td className="py-2 px-2.5 font-mono text-secondary font-bold">
                            {line.partNumber || line.sku || '-'}
                          </td>
                          <td className="py-2 px-2.5 text-center font-mono">{line.qty}</td>
                          <td className="py-2 px-2.5 text-center font-mono text-outline">
                            {prevReturned > 0 ? (
                              <span className="text-error font-medium">{prevReturned}</span>
                            ) : (
                              '0'
                            )}
                          </td>
                          <td className="py-2 px-2.5 text-center font-mono font-bold text-tertiary">
                            {returnable}
                          </td>
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
                                    handleQtyChange(lineKey, returnable, parseInt(e.target.value) || 0)
                                  }
                                  className="w-16 px-1.5 py-1 bg-surface-container-low border border-surface-container-highest rounded font-mono text-center font-bold text-secondary text-xs focus:outline-none focus:border-secondary"
                                />
                                {returnable > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleQtyChange(lineKey, returnable, returnable)}
                                    className="px-1.5 py-0.5 rounded bg-surface-container hover:bg-surface-container-high text-[10px] text-outline font-mono"
                                    title="Return Maximum"
                                  >
                                    All
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-2 px-2.5 text-right font-mono">{formatCurrency(unitRate)}</td>
                          <td className="py-2 px-2.5 text-right font-mono font-bold text-on-surface">
                            {returnQty > 0 ? formatCurrency(lineTotal) : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Step 3 & 4: Reason & Refund Method */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Reason */}
                <div className="bg-surface-container-low p-3.5 rounded border border-surface-container-high space-y-2">
                  <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">
                    Step 3: Return Reason
                  </span>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-surface-container-lowest border border-surface-container-highest rounded text-xs focus:outline-none focus:border-secondary font-medium"
                  >
                    <option value="Customer cancelled repair job">Customer cancelled repair job</option>
                    <option value="Wrong model / variant purchased by mechanic">Wrong model / variant purchased</option>
                    <option value="Defective / Damaged friction lining or part">Defective / Damaged part</option>
                    <option value="Fitting incompatibility on vehicle">Fitting incompatibility</option>
                    <option value="Excess unneeded spare returned">Excess unneeded spare returned</option>
                    <option value="Other">Other reason...</option>
                  </select>

                  <input
                    type="text"
                    value={customReasonNotes}
                    onChange={(e) => setCustomReasonNotes(e.target.value)}
                    placeholder="Specific remarks / inspector notes..."
                    className="w-full px-2.5 py-1.5 bg-surface-container-lowest border border-surface-container-highest rounded text-xs focus:outline-none"
                  />
                </div>

                {/* Refund Method & Accounting Impact */}
                <div className="bg-surface-container-low p-3.5 rounded border border-surface-container-high space-y-2">
                  <span className="text-[10px] font-bold text-outline uppercase tracking-wider block">
                    Step 4: Refund / Settlement Method
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Customer Credit', 'Cash Refund', 'UPI Refund', 'Bank Refund'] as SalesReturnMethod[]).map(
                      (m) => (
                        <label
                          key={m}
                          className={`flex items-center gap-2 p-2 rounded border cursor-pointer select-none transition-colors ${
                            refundMethod === m
                              ? 'bg-secondary/10 border-secondary text-secondary font-bold'
                              : 'bg-surface-container-lowest border-surface-container-highest text-on-surface'
                          }`}
                        >
                          <input
                            type="radio"
                            name="refundMethod"
                            checked={refundMethod === m}
                            onChange={() => setRefundMethod(m)}
                            className="text-secondary focus:ring-0"
                          />
                          <span className="text-[11px]">{m}</span>
                        </label>
                      )
                    )}
                  </div>

                  <div className="p-2 rounded bg-surface-container-lowest border border-surface-container-highest text-[11px] text-outline">
                    {refundMethod === 'Customer Credit' ? (
                      <span className="text-tertiary font-medium">
                        &bull; Adjusts customer receivable balance or adds to their store credit ledger.
                      </span>
                    ) : (
                      <span className="text-secondary font-medium">
                        &bull; Records cash or electronic bank payout in tender reconciliation ledger.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 5: Summary Banner */}
              <div className="bg-secondary/5 border border-secondary/20 p-4 rounded flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm text-on-surface">Total Refund &amp; Credit Amount:</span>
                  <div className="text-[11px] text-outline mt-0.5">
                    Includes GST tax reversal of {formatCurrency(returnSummary.totalTax)} &bull; Restocking{' '}
                    {returnSummary.items.reduce((s, it) => s + it.returnQuantity, 0)} units
                  </div>
                </div>
                <div className="font-mono text-xl font-bold text-secondary">
                  {formatCurrency(returnSummary.totalRefund)}
                </div>
              </div>
            </div>
          )}
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
            <span>Confirm &amp; Issue Credit Note</span>
          </button>
        </div>
      </div>
    </div>
  );
};
