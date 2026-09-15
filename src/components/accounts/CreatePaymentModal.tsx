import React, { useState, useEffect } from 'react';
import { PayableRecord, PaymentVoucher, BankingAccount } from '../../types';

interface CreatePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payables: PayableRecord[];
  bankAccounts: BankingAccount[];
  preSelectedSupplier?: PayableRecord | null;
  onSavePayment: (payment: PaymentVoucher, printAfter: boolean) => void;
}

export const CreatePaymentModal: React.FC<CreatePaymentModalProps> = ({
  isOpen,
  onClose,
  payables,
  bankAccounts,
  preSelectedSupplier,
  onSavePayment
}) => {
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('sup-1');
  const [amount, setAmount] = useState<number>(25000);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'Bank' | 'UPI' | 'Cheque'>('Bank');
  const [referenceNo, setReferenceNo] = useState<string>('NEFT/HDFC22910398');
  const [remarks, setRemarks] = useState<string>('Part payment against Apache RTR fork oil & gasket shipments');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (preSelectedSupplier) {
      setSelectedSupplierId(preSelectedSupplier.supplierId);
    }
  }, [preSelectedSupplier]);

  if (!isOpen) return null;

  const currentSupplier = payables.find(p => p.supplierId === selectedSupplierId) || payables[0];
  const previousPayable = currentSupplier ? currentSupplier.outstanding : 0;
  const remainingPayable = Math.max(0, previousPayable - (amount || 0));

  const cashAcc = bankAccounts.find(a => a.type === 'Cash');
  const currentCashBalance = cashAcc ? cashAcc.balance : 0;

  const handleModeChange = (mode: 'Cash' | 'Bank' | 'UPI' | 'Cheque') => {
    setPaymentMode(mode);
    if (mode === 'Cash') {
      setReferenceNo('');
    } else if (mode === 'Bank' && !referenceNo) {
      setReferenceNo('NEFT/HDFC' + Math.floor(10000000 + Math.random() * 90000000));
    } else if (mode === 'UPI' && !referenceNo) {
      setReferenceNo('UPI/PAY' + Math.floor(100000000 + Math.random() * 900000000));
    } else if (mode === 'Cheque' && !referenceNo) {
      setReferenceNo('CHQ-00' + Math.floor(10000 + Math.random() * 90000));
    }
  };

  const handleSubmit = (printAfter: boolean) => {
    setValidationError(null);

    if (!selectedSupplierId) {
      setValidationError('Please select a supplier.');
      return;
    }
    if (!amount || amount <= 0) {
      setValidationError('Payment amount cannot be zero or negative.');
      return;
    }

    // Critical Accounting Validation: Insufficient cash balance check
    if (paymentMode === 'Cash' && amount > currentCashBalance && currentCashBalance > 0) {
      setValidationError(
        `Insufficient cash balance: Available ₹${currentCashBalance.toLocaleString('en-IN')}, Requested ₹${amount.toLocaleString('en-IN')}. Please deposit cash or use Bank Transfer.`
      );
      return;
    }

    if (paymentMode !== 'Cash' && !referenceNo.trim()) {
      setValidationError(`Payment reference / UTR is required for ${paymentMode} transactions.`);
      return;
    }

    const randomVoucherNum = 'PV-00' + Math.floor(182 + Math.random() * 80);
    const newPayment: PaymentVoucher = {
      id: 'pv-' + Date.now(),
      paymentNo: randomVoucherNum,
      supplierId: currentSupplier?.supplierId || selectedSupplierId,
      supplierName: currentSupplier?.supplierName || 'Supplier',
      reference: 'PO-DIRECT',
      amount: amount,
      paymentMode: paymentMode,
      refNo: referenceNo.trim() || undefined,
      date: new Date().toLocaleDateString('en-GB'),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdBy: 'Accounts Executive',
      approvedBy: 'Managing Director',
      remarks: remarks,
      status: 'Active',
      previousPayable: previousPayable,
      remainingPayable: remainingPayable
    };

    onSavePayment(newPayment, printAfter);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest rounded-lg shadow-2xl border border-surface-container-high w-full max-w-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-surface-container border-b border-surface-container-high flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">payments</span>
            <div>
              <h2 className="font-headline-md text-base font-bold text-on-surface">
                Create Payment Voucher
              </h2>
              <p className="text-[11px] text-outline">Disburse payment to parts supplier / OEM</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto max-h-[78vh] space-y-4 text-xs">
          {validationError && (
            <div className="p-3 rounded bg-error-container text-on-error-container font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{validationError}</span>
            </div>
          )}

          {/* Supplier Select */}
          <div>
            <label className="block text-outline font-medium mb-1">
              Supplier <span className="text-error">*</span>
            </label>
            <select
              value={selectedSupplierId}
              onChange={(e) => {
                setSelectedSupplierId(e.target.value);
                const sup = payables.find(p => p.supplierId === e.target.value);
                if (sup) setAmount(Math.min(25000, sup.outstanding));
              }}
              className="w-full bg-surface-container-low border border-surface-container-high rounded p-2 text-xs font-semibold text-on-surface focus:outline-none focus:border-secondary"
            >
              {payables.map(p => (
                <option key={p.supplierId} value={p.supplierId}>
                  {p.supplierName} — Outstanding: ₹{p.outstanding.toLocaleString('en-IN')}
                </option>
              ))}
            </select>
          </div>

          {/* Outstanding Banner */}
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-error uppercase tracking-wider block">
                Outstanding Payable
              </span>
              <span className="font-mono text-xl font-bold text-error">
                ₹{previousPayable.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-[11px] text-error font-semibold">
              Status: {currentSupplier.status}
            </span>
          </div>

          {/* Amount & Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-outline font-medium mb-1">
                Disbursement Amount (₹) <span className="text-error">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-outline font-bold text-sm">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2 bg-surface-container-low border border-surface-container-high rounded font-mono font-bold text-sm text-on-surface focus:outline-none focus:border-secondary"
                />
              </div>
            </div>

            <div>
              <label className="block text-outline font-medium mb-1">
                Payment Mode <span className="text-error">*</span>
              </label>
              <div className="grid grid-cols-4 gap-1">
                {(['Cash', 'Bank', 'UPI', 'Cheque'] as const).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleModeChange(m)}
                    className={`py-2 rounded font-semibold text-xs transition-colors text-center ${
                      paymentMode === m
                        ? 'bg-primary text-on-primary font-bold shadow-xs'
                        : 'bg-surface-container-low text-on-surface hover:bg-surface-container border border-surface-container-high'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              {paymentMode === 'Cash' && (
                <div className="text-[10px] text-outline mt-1 font-mono">
                  Available in Drawer: ₹{currentCashBalance.toLocaleString('en-IN')}
                </div>
              )}
            </div>
          </div>

          {/* Reference & Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-outline font-medium mb-1">
                Reference / UTR Number
                {paymentMode !== 'Cash' && <span className="text-error"> *</span>}
              </label>
              <input
                type="text"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                placeholder={paymentMode === 'Cash' ? 'Optional for cash' : 'e.g. NEFT/HDFC22910398'}
                className="w-full p-2 bg-surface-container-low border border-surface-container-high rounded text-xs text-on-surface font-mono focus:outline-none focus:border-secondary"
              />
            </div>

            <div>
              <label className="block text-outline font-medium mb-1">Remarks / Note</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Disbursement purpose..."
                className="w-full p-2 bg-surface-container-low border border-surface-container-high rounded text-xs text-on-surface focus:outline-none focus:border-secondary"
              />
            </div>
          </div>

          {/* Balance Preview: Previous, Payment, Remaining */}
          <div className="p-3.5 rounded bg-surface-container-low border border-surface-container-high space-y-2">
            <div className="text-[11px] font-bold text-outline uppercase tracking-wider">
              Supplier Balance Preview
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded bg-surface-container-lowest border border-surface-container">
                <span className="text-[10px] text-outline uppercase block">Previous Payable</span>
                <span className="font-mono font-bold text-on-surface text-sm">
                  ₹{previousPayable.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-2 rounded bg-surface-container-lowest border border-surface-container">
                <span className="text-[10px] text-error uppercase block">Payment Amount</span>
                <span className="font-mono font-bold text-error text-sm">
                  -₹{(amount || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-2 rounded bg-surface-container-lowest border border-surface-container">
                <span className="text-[10px] text-on-surface uppercase block">Remaining Payable</span>
                <span className="font-mono font-bold text-on-surface text-sm">
                  ₹{remainingPayable.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
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
            Save Payment
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Save &amp; Print</span>
          </button>
        </div>
      </div>
    </div>
  );
};
