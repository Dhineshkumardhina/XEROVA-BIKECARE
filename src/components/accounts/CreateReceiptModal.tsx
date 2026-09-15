import React, { useState, useEffect } from 'react';
import { ReceivableRecord, ReceiptVoucher, OutstandingInvoiceItem } from '../../types';
import { INITIAL_ABC_OUTSTANDING_INVOICES } from '../../data/accountingData';

interface CreateReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receivables: ReceivableRecord[];
  preSelectedCustomer?: ReceivableRecord | null;
  onSaveReceipt: (receipt: ReceiptVoucher, printAfter: boolean) => void;
}

export const CreateReceiptModal: React.FC<CreateReceiptModalProps> = ({
  isOpen,
  onClose,
  receivables,
  preSelectedCustomer,
  onSaveReceipt
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cust-1');
  const [amount, setAmount] = useState<number>(15000);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Bank' | 'Cheque'>('UPI');
  const [referenceNo, setReferenceNo] = useState<string>('UPI/329482910481');
  const [remarks, setRemarks] = useState<string>('Clearance against August outstanding garage dues');
  const [showAllocation, setShowAllocation] = useState<boolean>(true);
  const [invoices, setInvoices] = useState<OutstandingInvoiceItem[]>(INITIAL_ABC_OUTSTANDING_INVOICES);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (preSelectedCustomer) {
      setSelectedCustomerId(preSelectedCustomer.customerId);
    }
  }, [preSelectedCustomer]);

  // Adjust reference default when mode changes
  const handleModeChange = (mode: 'Cash' | 'UPI' | 'Bank' | 'Cheque') => {
    setPaymentMode(mode);
    if (mode === 'Cash') {
      setReferenceNo('');
    } else if (mode === 'UPI' && !referenceNo) {
      setReferenceNo('UPI/48920192841');
    } else if (mode === 'Bank' && !referenceNo) {
      setReferenceNo('NEFT/HDFC' + Math.floor(10000000 + Math.random() * 90000000));
    } else if (mode === 'Cheque' && !referenceNo) {
      setReferenceNo('CHQ-00' + Math.floor(10000 + Math.random() * 90000));
    }
  };

  if (!isOpen) return null;

  const currentCustomer = receivables.find(r => r.customerId === selectedCustomerId) || receivables[0];
  const previousBalance = currentCustomer ? currentCustomer.outstanding : 0;
  const remainingBalance = Math.max(0, previousBalance - (amount || 0));

  // Auto-allocate FIFO
  const handleAutoAllocate = (paymentAmt: number) => {
    let unallocated = paymentAmt;
    const updated = invoices.map(inv => {
      if (unallocated <= 0) {
        return { ...inv, allocatedAmount: 0 };
      }
      const canTake = Math.min(unallocated, inv.dueAmount);
      unallocated -= canTake;
      return { ...inv, allocatedAmount: canTake };
    });
    setInvoices(updated);
  };

  const handleManualAllocate = (invId: string, val: number) => {
    setInvoices(prev =>
      prev.map(inv => (inv.id === invId ? { ...inv, allocatedAmount: Math.min(inv.dueAmount, Math.max(0, val)) } : inv))
    );
  };

  const totalAllocated = invoices.reduce((s, i) => s + i.allocatedAmount, 0);

  const handleSubmit = (printAfter: boolean) => {
    setValidationError(null);

    if (!selectedCustomerId) {
      setValidationError('Please select a valid customer account.');
      return;
    }
    if (!amount || amount <= 0) {
      setValidationError('Receipt amount cannot be zero or negative.');
      return;
    }
    if (paymentMode !== 'Cash' && !referenceNo.trim()) {
      setValidationError(`Payment reference / transaction ID is required for ${paymentMode} transactions.`);
      return;
    }

    const randomVoucherNum = 'RV-00' + Math.floor(292 + Math.random() * 80);
    const newReceipt: ReceiptVoucher = {
      id: 'rv-' + Date.now(),
      receiptNo: randomVoucherNum,
      customerId: currentCustomer?.customerId || selectedCustomerId,
      customerName: currentCustomer?.customerName || 'Customer',
      customerMobile: currentCustomer?.mobile || '',
      invoiceRef: invoices[0]?.invoiceNo || 'INV-DIRECT',
      amount: amount,
      paymentMode: paymentMode,
      refNo: referenceNo.trim() || undefined,
      date: new Date().toLocaleDateString('en-GB'),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdBy: 'Billing Operator',
      remarks: remarks,
      status: 'Active',
      previousBalance: previousBalance,
      newBalance: remainingBalance,
      allocation: invoices
        .filter(i => i.allocatedAmount > 0)
        .map(i => ({ invoiceNo: i.invoiceNo, amount: i.allocatedAmount }))
    };

    onSaveReceipt(newReceipt, printAfter);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest rounded-lg shadow-2xl border border-surface-container-high w-full max-w-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 bg-surface-container border-b border-surface-container-high flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">add_circle</span>
            <div>
              <h2 className="font-headline-md text-base font-bold text-on-surface">
                Create Receipt Voucher
              </h2>
              <p className="text-[11px] text-outline">Record collection against customer ledger</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto max-h-[78vh] space-y-4 text-xs">
          {validationError && (
            <div className="p-3 rounded bg-error-container text-on-error-container font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{validationError}</span>
            </div>
          )}

          {/* Customer Selection */}
          <div>
            <label className="block text-outline font-medium mb-1">
              Select Customer / Garage <span className="text-error">*</span>
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => {
                setSelectedCustomerId(e.target.value);
                const cust = receivables.find(r => r.customerId === e.target.value);
                if (cust) {
                  setAmount(Math.min(15000, cust.outstanding));
                  handleAutoAllocate(Math.min(15000, cust.outstanding));
                }
              }}
              className="w-full bg-surface-container-low border border-surface-container-high rounded p-2 text-xs font-semibold text-on-surface focus:outline-none focus:border-secondary"
            >
              {receivables.map(r => (
                <option key={r.customerId} value={r.customerId}>
                  {r.customerName} ({r.mobile}) — Outstanding: ₹{r.outstanding.toLocaleString('en-IN')}
                </option>
              ))}
            </select>
          </div>

          {/* Outstanding Balance Banner */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                Outstanding Balance
              </span>
              <span className="font-mono text-xl font-bold text-amber-700">
                ₹{previousBalance.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-[11px] text-amber-800 font-semibold">
              Status: {currentCustomer.status}
            </span>
          </div>

          {/* Amount & Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-outline font-medium mb-1">
                Receipt Amount (₹) <span className="text-error">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-outline font-bold text-sm">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setAmount(val);
                    handleAutoAllocate(val);
                  }}
                  className="w-full pl-8 pr-3 py-2 bg-surface-container-low border border-surface-container-high rounded font-mono font-bold text-sm text-on-surface focus:outline-none focus:border-secondary"
                />
              </div>
              {amount > previousBalance && (
                <span className="text-[10px] text-amber-700 font-semibold mt-1 block">
                  ⚠️ Note: Amount exceeds current outstanding. Excess ₹{(amount - previousBalance).toLocaleString('en-IN')} will be credited as Customer Advance.
                </span>
              )}
            </div>

            <div>
              <label className="block text-outline font-medium mb-1">
                Payment Mode <span className="text-error">*</span>
              </label>
              <div className="grid grid-cols-4 gap-1">
                {(['Cash', 'UPI', 'Bank', 'Cheque'] as const).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleModeChange(m)}
                    className={`py-2 rounded font-semibold text-xs transition-colors text-center ${
                      paymentMode === m
                        ? 'bg-secondary text-on-secondary font-bold shadow-xs'
                        : 'bg-surface-container-low text-on-surface hover:bg-surface-container border border-surface-container-high'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reference & Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-outline font-medium mb-1">
                Reference Number / Transaction UTR
                {paymentMode !== 'Cash' && <span className="text-error"> *</span>}
              </label>
              <input
                type="text"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                placeholder={paymentMode === 'Cash' ? 'Optional for cash' : 'e.g. UPI/329482910481'}
                className="w-full p-2 bg-surface-container-low border border-surface-container-high rounded text-xs text-on-surface font-mono focus:outline-none focus:border-secondary"
              />
            </div>

            <div>
              <label className="block text-outline font-medium mb-1">Remarks / Note</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Narration or payment description..."
                className="w-full p-2 bg-surface-container-low border border-surface-container-high rounded text-xs text-on-surface focus:outline-none focus:border-secondary"
              />
            </div>
          </div>

          {/* Invoice Payment Allocation Section */}
          <div className="border border-surface-container-high rounded overflow-hidden">
            <div
              onClick={() => setShowAllocation(!showAllocation)}
              className="p-2.5 bg-surface-container flex items-center justify-between cursor-pointer select-none"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[18px]">view_list</span>
                <span className="font-bold text-on-surface">
                  Payment Allocation Against Invoices ({invoices.length} Bills)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-outline">
                  Allocated: ₹{totalAllocated.toLocaleString('en-IN')} / ₹{amount.toLocaleString('en-IN')}
                </span>
                <span className="material-symbols-outlined text-[16px] text-outline">
                  {showAllocation ? 'expand_less' : 'expand_more'}
                </span>
              </div>
            </div>

            {showAllocation && (
              <div className="p-3 bg-surface-container-lowest space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-outline">Allocate payments to oldest invoices first (FIFO)</span>
                  <button
                    type="button"
                    onClick={() => handleAutoAllocate(amount)}
                    className="text-secondary font-bold hover:underline"
                  >
                    Auto-FIFO Allocate
                  </button>
                </div>

                <div className="divide-y divide-surface-container-high">
                  {invoices.map(inv => (
                    <div key={inv.id} className="py-2 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-mono font-bold text-on-surface">{inv.invoiceNo}</div>
                        <div className="text-[10px] text-outline">Due: ₹{inv.dueAmount.toLocaleString('en-IN')} • Date: {inv.date}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-outline">Allocated:</span>
                        <div className="relative w-28">
                          <span className="absolute left-2 top-1 text-outline font-bold text-[11px]">₹</span>
                          <input
                            type="number"
                            value={inv.allocatedAmount}
                            onChange={(e) => handleManualAllocate(inv.id, Number(e.target.value))}
                            className="w-full pl-5 pr-1 py-1 bg-surface-container-low border border-surface-container-high rounded text-right font-mono text-xs font-bold focus:outline-none focus:border-secondary"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Balance Preview Card matching prompt: Previous, Received, Remaining */}
          <div className="p-3.5 rounded bg-surface-container-low border border-surface-container-high space-y-2">
            <div className="text-[11px] font-bold text-outline uppercase tracking-wider">
              Ledger Balance Preview
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded bg-surface-container-lowest border border-surface-container">
                <span className="text-[10px] text-outline uppercase block">Previous Balance</span>
                <span className="font-mono font-bold text-on-surface text-sm">
                  ₹{previousBalance.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-2 rounded bg-surface-container-lowest border border-surface-container">
                <span className="text-[10px] text-tertiary uppercase block">Received Amount</span>
                <span className="font-mono font-bold text-tertiary text-sm">
                  -₹{(amount || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-2 rounded bg-surface-container-lowest border border-surface-container">
                <span className="text-[10px] text-secondary uppercase block">Remaining Balance</span>
                <span className="font-mono font-bold text-secondary text-sm">
                  ₹{remainingBalance.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Buttons */}
        <div className="p-4 bg-surface-container border-t border-surface-container-high flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-surface-container-low hover:bg-surface-container text-on-surface rounded text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            className="px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded text-xs font-bold transition-colors border border-surface-container-highest"
          >
            Save Receipt
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            className="px-4 py-2 bg-secondary hover:bg-secondary-container text-on-secondary rounded text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Save &amp; Print</span>
          </button>
        </div>
      </div>
    </div>
  );
};
