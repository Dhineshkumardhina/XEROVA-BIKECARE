import React, { useState, useEffect } from 'react';
import { CustomerAccount, PaymentSplit } from '../../types';

interface POSPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalDue: number;
  customer: CustomerAccount | null;
  walkInName: string;
  onConfirmSale: (
    primaryMode: 'Cash' | 'UPI (GPay)' | 'Credit Ledger' | 'Card POS' | 'Cheque' | 'NEFT Bank' | 'Split Payment',
    splits: PaymentSplit[],
    cashReceived?: number,
    cashChange?: number
  ) => void;
}

export const POSPaymentModal: React.FC<POSPaymentModalProps> = ({
  isOpen,
  onClose,
  totalDue,
  customer,
  walkInName,
  onConfirmSale
}) => {
  const [activeTab, setActiveTab] = useState<'CASH' | 'UPI' | 'CREDIT' | 'CARD' | 'CHEQUE' | 'SPLIT'>('UPI');

  // Cash Mode State
  const [cashReceived, setCashReceived] = useState<number>(totalDue);
  const changeToReturn = Math.max(0, cashReceived - totalDue);

  // UPI Mode State
  const [upiRefNo, setUpiRefNo] = useState('');

  // Cheque / Bank State
  const [chequeNo, setChequeNo] = useState('');
  const [bankName, setBankName] = useState('HDFC Bank');

  // Split Payment State
  const [splits, setSplits] = useState<PaymentSplit[]>([
    { mode: 'Cash', amount: Math.floor(totalDue / 2), refNo: '' },
    { mode: 'UPI (GPay)', amount: totalDue - Math.floor(totalDue / 2), refNo: '' }
  ]);

  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    setCashReceived(totalDue);
    setPaymentError(null);
    // Reset splits
    setSplits([
      { mode: 'Cash', amount: Math.floor(totalDue / 2), refNo: '' },
      { mode: 'UPI (GPay)', amount: totalDue - Math.floor(totalDue / 2), refNo: '' }
    ]);
  }, [totalDue, isOpen]);

  if (!isOpen) return null;

  // Split calculation
  const splitTotal = splits.reduce((sum, s) => sum + (s.amount || 0), 0);
  const splitDifference = totalDue - splitTotal;

  const handleAddSplitLine = () => {
    setSplits(prev => [...prev, { mode: 'Cash', amount: 0, refNo: '' }]);
  };

  const handleRemoveSplitLine = (index: number) => {
    setSplits(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateSplit = (index: number, field: keyof PaymentSplit, value: any) => {
    setSplits(prev =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  const handleComplete = () => {
    setPaymentError(null);
    if (activeTab === 'CASH') {
      if (cashReceived < totalDue) {
        setPaymentError(`Received amount (₹${cashReceived}) is less than total due (₹${totalDue}).`);
        return;
      }
      onConfirmSale('Cash', [{ mode: 'Cash', amount: totalDue }], cashReceived, changeToReturn);
    } else if (activeTab === 'UPI') {
      onConfirmSale('UPI (GPay)', [{ mode: 'UPI (GPay)', amount: totalDue, refNo: upiRefNo }]);
    } else if (activeTab === 'CARD') {
      onConfirmSale('Card POS', [{ mode: 'Card POS', amount: totalDue }]);
    } else if (activeTab === 'CREDIT') {
      if (!customer) {
        setPaymentError('Credit payment requires an account with a ledger. Please select or register a customer.');
        return;
      }
      onConfirmSale('Credit Ledger', [{ mode: 'Credit Ledger', amount: totalDue }]);
    } else if (activeTab === 'CHEQUE') {
      onConfirmSale('Cheque', [{ mode: 'Cheque', amount: totalDue, refNo: chequeNo, notes: bankName }]);
    } else if (activeTab === 'SPLIT') {
      if (Math.abs(splitDifference) > 0.5) {
        setPaymentError(`Split amounts total (₹${splitTotal.toFixed(2)}) must equal invoice total (₹${totalDue.toFixed(2)}).`);
        return;
      }
      onConfirmSale('Split Payment', splits);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest w-full max-w-xl rounded-lg shadow-2xl border border-surface-container-highest overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-3 bg-surface-container flex items-center justify-between border-b border-surface-container-high select-none">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">payments</span>
            <div>
              <span className="font-bold text-sm text-on-surface block">Complete Payment &amp; Settle Bill</span>
              <span className="text-[11px] text-outline">
                Billing to: <strong className="text-on-surface">{customer ? customer.name : walkInName || 'Walk-in Retail'}</strong>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-outline hover:text-on-surface hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {paymentError && (
          <div className="mx-4 mt-3 p-2.5 bg-error/10 border border-error/20 rounded text-error text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{paymentError}</span>
          </div>
        )}

        {/* Big Total Due Strip */}
        <div className="bg-surface-container-low px-6 py-4 flex items-center justify-between border-b border-surface-container-high">
          <span className="text-xs font-bold uppercase text-outline tracking-wider">Total Due Amount</span>
          <span className="font-mono text-3xl font-extrabold text-secondary">
            ₹{totalDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Payment Modes Tabs */}
        <div className="grid grid-cols-6 border-b border-surface-container-high bg-surface-container text-xs font-bold divide-x divide-surface-container-high/60">
          <button
            type="button"
            onClick={() => setActiveTab('UPI')}
            className={`py-2.5 flex flex-col items-center gap-1 transition-colors ${
              activeTab === 'UPI' ? 'bg-surface-container-lowest text-secondary border-b-2 border-secondary' : 'text-outline hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">qr_code_2</span>
            <span>UPI / GPay</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CASH')}
            className={`py-2.5 flex flex-col items-center gap-1 transition-colors ${
              activeTab === 'CASH' ? 'bg-surface-container-lowest text-secondary border-b-2 border-secondary' : 'text-outline hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">payments</span>
            <span>Cash</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CARD')}
            className={`py-2.5 flex flex-col items-center gap-1 transition-colors ${
              activeTab === 'CARD' ? 'bg-surface-container-lowest text-secondary border-b-2 border-secondary' : 'text-outline hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">credit_card</span>
            <span>Card POS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CREDIT')}
            className={`py-2.5 flex flex-col items-center gap-1 transition-colors ${
              activeTab === 'CREDIT' ? 'bg-surface-container-lowest text-secondary border-b-2 border-secondary' : 'text-outline hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">menu_book</span>
            <span>Credit</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CHEQUE')}
            className={`py-2.5 flex flex-col items-center gap-1 transition-colors ${
              activeTab === 'CHEQUE' ? 'bg-surface-container-lowest text-secondary border-b-2 border-secondary' : 'text-outline hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">account_balance</span>
            <span>Bank/Chq</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SPLIT')}
            className={`py-2.5 flex flex-col items-center gap-1 transition-colors ${
              activeTab === 'SPLIT' ? 'bg-surface-container-lowest text-secondary border-b-2 border-secondary' : 'text-outline hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">call_split</span>
            <span>Split</span>
          </button>
        </div>

        {/* Tab Body Contents */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
          {/* TAB 1: UPI / QR SCAN */}
          {activeTab === 'UPI' && (
            <div className="flex flex-col sm:flex-row items-center gap-6 bg-surface-container-low p-4 rounded-md">
              {/* Dynamic QR Code Mockup */}
              <div className="w-36 h-36 bg-white p-2 rounded shadow-md flex flex-col items-center justify-center shrink-0 border border-surface-container-high">
                <div className="w-28 h-28 bg-surface-container-high flex flex-col items-center justify-center rounded text-center p-1">
                  <span className="material-symbols-outlined text-primary text-[42px]">qr_code</span>
                  <span className="font-mono text-[9px] text-outline mt-1 font-bold">UPI ID: bikeerp@okhdfc</span>
                </div>
                <span className="font-mono text-[10px] text-secondary font-bold mt-1">₹{totalDue.toFixed(2)}</span>
              </div>

              <div className="space-y-3 flex-1">
                <div>
                  <span className="font-bold text-sm text-on-surface block">Dynamic UPI / BharatQR</span>
                  <span className="text-outline text-[11px]">
                    Customer can scan directly using GPay, PhonePe, Paytm, or BHIM.
                  </span>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-outline uppercase block mb-1">
                    UPI Transaction / UTR Ref # (Optional)
                  </label>
                  <input
                    type="text"
                    value={upiRefNo}
                    onChange={(e) => setUpiRefNo(e.target.value)}
                    placeholder="e.g. 429182910245"
                    className="w-full h-8 px-2.5 bg-surface-container-lowest border border-surface-container-highest rounded font-mono text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CASH REGISTER WITH CHANGE CALCULATION */}
          {activeTab === 'CASH' && (
            <div className="space-y-4">
              <div className="bg-surface-container-low p-4 rounded-md space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-xs text-on-surface uppercase">Cash Received by Cashier:</label>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-base text-outline">₹</span>
                    <input
                      type="number"
                      value={cashReceived || ''}
                      onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                      className="w-36 h-9 px-2 text-right font-mono text-lg font-bold bg-surface-container-lowest border-2 border-secondary rounded text-on-surface focus:outline-none"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Quick denomination chips */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-outline">Quick:</span>
                  {[
                    Math.ceil(totalDue / 100) * 100,
                    Math.ceil(totalDue / 500) * 500,
                    Math.ceil(totalDue / 1000) * 1000,
                    totalDue
                  ]
                    .filter((v, i, a) => a.indexOf(v) === i && v >= totalDue)
                    .map((denom, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCashReceived(denom)}
                        className="px-2.5 py-1 rounded bg-surface-container-high hover:bg-surface-container hover:border-secondary border border-surface-container-highest text-on-surface font-mono text-xs font-semibold"
                      >
                        ₹{denom}
                      </button>
                    ))}
                </div>
              </div>

              {/* Change to Return Banner */}
              <div className="p-3 bg-surface-container rounded-md border border-surface-container-high flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-outline block">Change to Return to Customer</span>
                  <span className="text-[11px] text-outline">Tendered: ₹{cashReceived.toFixed(2)} - Bill: ₹{totalDue.toFixed(2)}</span>
                </div>
                <div className="font-mono text-2xl font-bold text-on-tertiary-container">
                  ₹{changeToReturn.toFixed(2)}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CARD POS SWIPE */}
          {activeTab === 'CARD' && (
            <div className="bg-surface-container-low p-4 rounded-md space-y-3">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-3xl">credit_card</span>
                <div>
                  <div className="font-bold text-sm text-on-surface">Card POS Terminal</div>
                  <div className="text-outline text-[11px]">Visa / Mastercard / RuPay / Contactless Tap</div>
                </div>
              </div>

              <div className="p-3 bg-surface-container-lowest rounded border border-surface-container-highest font-mono text-xs flex justify-between">
                <span>Amount sent to PIN-Pad Terminal:</span>
                <span className="font-bold text-secondary">₹{totalDue.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* TAB 4: CREDIT LEDGER */}
          {activeTab === 'CREDIT' && (
            <div className="space-y-3">
              {customer ? (
                <div className="bg-surface-container-low p-4 rounded-md space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-on-surface">{customer.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-secondary text-on-secondary font-bold">
                      Credit Allowed (15 Days)
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-surface-container-lowest p-2.5 rounded font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-outline uppercase block">Previous Balance</span>
                      <span className="font-bold text-error">₹{customer.balance.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-outline uppercase block">Current Invoice</span>
                      <span className="font-bold text-secondary">+₹{totalDue.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-outline uppercase block">New Outstanding</span>
                      <span className="font-extrabold text-error">
                        ₹{(customer.balance + totalDue).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-error-container/20 text-error rounded-md text-xs space-y-2">
                  <div className="font-bold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">warning</span>
                    <span>No Registered Account Selected</span>
                  </div>
                  <p>
                    Credit ledger billing is only permitted for verified Garage accounts or registered wholesale dealers.
                    Please select a customer from the right panel or register this customer first.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: CHEQUE / BANK */}
          {activeTab === 'CHEQUE' && (
            <div className="bg-surface-container-low p-4 rounded-md space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-outline uppercase block mb-1">Cheque / DD Number</label>
                  <input
                    type="text"
                    value={chequeNo}
                    onChange={(e) => setChequeNo(e.target.value)}
                    placeholder="e.g. 004912"
                    className="w-full h-8 px-2 bg-surface-container-lowest border border-surface-container-highest rounded font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-outline uppercase block mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. HDFC Bank, SBI"
                    className="w-full h-8 px-2 bg-surface-container-lowest border border-surface-container-highest rounded text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Requirement 13: SPLIT PAYMENT */}
          {activeTab === 'SPLIT' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-on-surface uppercase">Multi-Tender Splits</span>
                <button
                  type="button"
                  onClick={handleAddSplitLine}
                  className="text-secondary text-[11px] font-bold hover:underline flex items-center gap-0.5"
                >
                  <span className="material-symbols-outlined text-[13px]">add</span>
                  + Add Payment Line
                </button>
              </div>

              <div className="space-y-2">
                {splits.map((split, i) => (
                  <div key={i} className="flex items-center gap-2 bg-surface-container-low p-2 rounded">
                    {/* Mode Selector */}
                    <select
                      value={split.mode}
                      onChange={(e) => handleUpdateSplit(i, 'mode', e.target.value)}
                      className="h-7 px-2 bg-surface-container-lowest border border-surface-container-highest rounded text-xs font-semibold"
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI (GPay)">UPI (GPay)</option>
                      <option value="Card POS">Card POS</option>
                      <option value="Credit Ledger">Credit Ledger</option>
                      <option value="Cheque">Cheque</option>
                      <option value="NEFT Bank">NEFT Bank</option>
                    </select>

                    {/* Amount Input */}
                    <div className="flex items-center gap-1 flex-1">
                      <span className="text-outline text-xs">₹</span>
                      <input
                        type="number"
                        value={split.amount || ''}
                        onChange={(e) => handleUpdateSplit(i, 'amount', parseFloat(e.target.value) || 0)}
                        className="w-full h-7 px-2 font-mono text-xs font-bold bg-surface-container-lowest border border-surface-container-highest rounded text-right"
                      />
                    </div>

                    {/* Ref Note (Optional) */}
                    <input
                      type="text"
                      placeholder="Ref # (optional)"
                      value={split.refNo || ''}
                      onChange={(e) => handleUpdateSplit(i, 'refNo', e.target.value)}
                      className="w-28 h-7 px-2 text-[11px] bg-surface-container-lowest border border-surface-container-highest rounded font-mono"
                    />

                    {splits.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSplitLine(i)}
                        className="p-1 text-error hover:bg-error-container/20 rounded"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Split Totals Validation */}
              <div className="flex items-center justify-between bg-surface-container p-2.5 rounded font-mono text-xs border border-surface-container-high">
                <div>
                  <span className="text-outline">Split Sum: </span>
                  <strong className="font-bold text-on-surface">₹{splitTotal.toFixed(2)}</strong>
                </div>

                <div>
                  {Math.abs(splitDifference) < 0.01 ? (
                    <span className="text-on-tertiary-container font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Exact Match (Balanced)
                    </span>
                  ) : splitDifference > 0 ? (
                    <span className="text-error font-bold">Remaining to allocate: ₹{splitDifference.toFixed(2)}</span>
                  ) : (
                    <span className="text-error font-bold">Exceeds total by: ₹{(-splitDifference).toFixed(2)}</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-surface-container-low border-t border-surface-container-high flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-outline hover:bg-surface-container rounded text-xs font-semibold"
          >
            Cancel (Esc)
          </button>

          <button
            type="button"
            onClick={handleComplete}
            className="px-6 py-2.5 bg-secondary hover:bg-secondary-container text-on-secondary rounded font-bold text-xs md:text-sm flex items-center gap-2 shadow-md cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">check</span>
            <span>Confirm &amp; Generate Invoice</span>
          </button>
        </div>
      </div>
    </div>
  );
};
