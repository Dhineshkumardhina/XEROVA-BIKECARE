import React, { useState } from 'react';
import { Invoice, SalesReturnItem } from '../../types';

interface POSSalesReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
  onConfirmReturn: (
    invoiceId: string,
    returnedItems: SalesReturnItem[],
    totalRefund: number,
    refundMode: 'Cash' | 'UPI (GPay)' | 'Credit Ledger'
  ) => void;
}

export const POSSalesReturnModal: React.FC<POSSalesReturnModalProps> = ({
  isOpen,
  onClose,
  invoices,
  onConfirmReturn
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [returnQtys, setReturnQtys] = useState<Record<string, number>>({});
  const [refundMode, setRefundMode] = useState<'Cash' | 'UPI (GPay)' | 'Credit Ledger'>('Cash');

  if (!isOpen) return null;

  // Filter invoices for return search
  const q = searchQuery.trim().toLowerCase();
  const matchedInvoices = q
    ? invoices.filter(inv =>
        inv.id.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q) ||
        (inv.customerPhone && inv.customerPhone.includes(q)) ||
        (inv.vehicleNo && inv.vehicleNo.toLowerCase().includes(q))
      ).slice(0, 5)
    : invoices.slice(0, 5);

  const handleSelectInvoice = (inv: Invoice) => {
    setSelectedInvoice(inv);
    // Initialize return quantities to 0
    const initial: Record<string, number> = {};
    inv.lineItems.forEach(item => {
      initial[item.partId] = 0;
    });
    setReturnQtys(initial);
  };

  const handleQtyChange = (partId: string, maxQty: number, qty: number) => {
    const clamped = Math.max(0, Math.min(maxQty, qty));
    setReturnQtys(prev => ({ ...prev, [partId]: clamped }));
  };

  // Calculate refund items and totals
  const returnItems: SalesReturnItem[] = selectedInvoice
    ? selectedInvoice.lineItems
        .filter(item => (returnQtys[item.partId] || 0) > 0)
        .map(item => {
          const qty = returnQtys[item.partId] || 0;
          const rate = item.rate;
          const refundAmount = rate * qty;
          return {
            partId: item.partId,
            sku: item.sku,
            name: item.name,
            originalQty: item.qty,
            soldRate: rate,
            returnQty: qty,
            gstRate: item.gstRate,
            refundAmount
          };
        })
    : [];

  const totalRefund = returnItems.reduce((acc, item) => acc + item.refundAmount, 0);

  const handleProcessReturn = () => {
    if (!selectedInvoice) return;
    if (returnItems.length === 0) {
      alert('Please specify return quantity for at least one item.');
      return;
    }

    onConfirmReturn(selectedInvoice.id, returnItems, totalRefund, refundMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest w-full max-w-2xl rounded-lg shadow-2xl border border-surface-container-highest overflow-hidden text-xs flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-3 bg-surface-container flex items-center justify-between border-b border-surface-container-high">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">assignment_return</span>
            <div>
              <span className="font-bold text-sm text-on-surface block">Sales Return / Credit Note</span>
              <span className="text-[11px] text-outline">Direct inventory restoration with customer credit/refund</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-outline hover:text-on-surface hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Search Box */}
          <div>
            <label className="text-[10px] font-bold text-outline uppercase block mb-1">
              Search Original Bill / Invoice Number or Mobile
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-outline text-[16px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. INV-10290, Suresh Babu, 98401..."
                className="w-full h-8 pl-8 pr-3 bg-surface-container-low border border-surface-container-high rounded text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary"
              />
            </div>
          </div>

          {/* If no invoice selected yet: Show Matching Invoices */}
          {!selectedInvoice ? (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-outline uppercase block">Recent Invoices</span>
              <div className="divide-y divide-surface-container-high/60 border border-surface-container-high rounded-md overflow-hidden">
                {matchedInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => handleSelectInvoice(inv)}
                    className="p-3 hover:bg-surface-container-low cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-secondary">{inv.id}</span>
                        <span className="font-semibold text-on-surface">{inv.customerName}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-container font-mono">
                          {inv.payMode}
                        </span>
                      </div>
                      <div className="text-[11px] text-outline mt-0.5">
                        <span>{inv.createdAt}</span> • <span>{inv.itemsCount} items</span>
                        {inv.vehicleNo && <span> • {inv.vehicleNo}</span>}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-on-surface text-sm">
                        ₹{inv.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      <span className="text-[10px] text-secondary font-bold hover:underline">Select for Return →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Selected Invoice Items for Return */
            <div className="space-y-3">
              <div className="bg-surface-container-low p-3 rounded-md border border-surface-container-high flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-secondary text-sm">{selectedInvoice.id}</span>
                    <span className="font-bold text-on-surface">{selectedInvoice.customerName}</span>
                  </div>
                  <div className="text-[11px] text-outline mt-0.5">
                    Original Date: {selectedInvoice.createdAt} • Total: ₹{selectedInvoice.totalAmount.toFixed(2)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="text-outline hover:text-on-surface text-xs underline"
                >
                  Change Invoice
                </button>
              </div>

              {/* Requirement 20: Table with Original Qty, Sold Qty, Return Qty, Refund Amount */}
              <div className="border border-surface-container-high rounded-md overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-container font-label-caps text-[10px] uppercase text-outline">
                    <tr>
                      <th className="py-2 px-2.5">Item</th>
                      <th className="py-2 px-2.5 text-center">Sold Qty</th>
                      <th className="py-2 px-2.5 text-right">Sold Rate</th>
                      <th className="py-2 px-2.5 text-center w-28">Return Qty</th>
                      <th className="py-2 px-2.5 text-right">Refund Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-high font-table-cell">
                    {selectedInvoice.lineItems.map((item) => {
                      const retQty = returnQtys[item.partId] || 0;
                      const refundVal = item.rate * retQty;

                      return (
                        <tr key={item.partId} className={retQty > 0 ? 'bg-secondary/10' : ''}>
                          <td className="py-2 px-2.5">
                            <div className="font-semibold text-on-surface">{item.name}</div>
                            <div className="font-mono text-[10px] text-outline">{item.sku}</div>
                          </td>
                          <td className="py-2 px-2.5 text-center font-mono font-bold">{item.qty}</td>
                          <td className="py-2 px-2.5 text-right font-mono">₹{item.rate.toFixed(2)}</td>
                          <td className="py-2 px-2.5 text-center">
                            <div className="inline-flex items-center bg-surface-container rounded border border-surface-container-high">
                              <button
                                type="button"
                                onClick={() => handleQtyChange(item.partId, item.qty, retQty - 1)}
                                className="px-2 py-0.5 font-bold hover:bg-surface-container-high"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-mono font-bold">{retQty}</span>
                              <button
                                type="button"
                                onClick={() => handleQtyChange(item.partId, item.qty, retQty + 1)}
                                className="px-2 py-0.5 font-bold hover:bg-surface-container-high"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="py-2 px-2.5 text-right font-mono font-bold text-secondary">
                            ₹{refundVal.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Requirement 20: Clearly Indicate "Stock will increase after return." */}
              <div className="p-2.5 bg-secondary/10 border border-secondary/30 rounded-md flex items-center gap-2 text-on-surface text-xs">
                <span className="material-symbols-outlined text-secondary text-[18px]">inventory_2</span>
                <span className="font-medium">
                  <strong>Automatic Inventory Restock:</strong> Stock count for returned items will automatically increase in the Item Master upon confirmation.
                </span>
              </div>

              {/* Refund Method Selector */}
              <div className="bg-surface-container-low p-3 rounded-md space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-outline">Refund Method:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setRefundMode('Cash')}
                      className={`px-3 py-1 rounded text-xs font-semibold ${
                        refundMode === 'Cash' ? 'bg-secondary text-on-secondary' : 'bg-surface-container text-outline'
                      }`}
                    >
                      Cash Out
                    </button>
                    <button
                      type="button"
                      onClick={() => setRefundMode('UPI (GPay)')}
                      className={`px-3 py-1 rounded text-xs font-semibold ${
                        refundMode === 'UPI (GPay)' ? 'bg-secondary text-on-secondary' : 'bg-surface-container text-outline'
                      }`}
                    >
                      UPI Reversal
                    </button>
                    <button
                      type="button"
                      onClick={() => setRefundMode('Credit Ledger')}
                      className={`px-3 py-1 rounded text-xs font-semibold ${
                        refundMode === 'Credit Ledger' ? 'bg-secondary text-on-secondary' : 'bg-surface-container text-outline'
                      }`}
                    >
                      Credit Note
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-surface-container-high">
                  <span className="font-bold text-on-surface">Total Refund to Customer:</span>
                  <span className="font-mono text-xl font-extrabold text-secondary">
                    ₹{totalRefund.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-surface-container-low border-t border-surface-container-high flex justify-between items-center">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-outline hover:bg-surface-container rounded font-semibold text-xs"
          >
            Cancel
          </button>

          {selectedInvoice && (
            <button
              type="button"
              disabled={totalRefund <= 0}
              onClick={handleProcessReturn}
              className="px-5 py-2 bg-secondary hover:bg-secondary-container disabled:opacity-40 text-on-secondary rounded font-bold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              <span>Confirm Return (₹{totalRefund.toFixed(2)})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
