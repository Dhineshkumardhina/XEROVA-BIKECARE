import React, { useState } from 'react';
import { BankingAccount, BankTransaction } from '../../types';

interface BankingOperationModalProps {
  type: 'deposit' | 'withdrawal' | 'transfer' | null;
  isOpen: boolean;
  onClose: () => void;
  accounts: BankingAccount[];
  onExecuteOperation: (tx: BankTransaction, updatedAccounts: BankingAccount[]) => void;
}

export const BankingOperationModal: React.FC<BankingOperationModalProps> = ({
  type,
  isOpen,
  onClose,
  accounts,
  onExecuteOperation
}) => {
  if (!isOpen || !type) return null;

  const cashAcc = accounts.find(a => a.type === 'Cash') || { id: 'acc-cash', name: 'Cash in Counter', type: 'Cash' as const, balance: 85400 };
  const bankAcc = accounts.find(a => a.type === 'Bank') || { id: 'acc-bank', name: 'HDFC Bank Current', type: 'Bank' as const, balance: 428600 };
  const upiAcc = accounts.find(a => a.type === 'UPI') || { id: 'acc-upi', name: 'ICICI UPI Hub', type: 'UPI' as const, balance: 62300 };

  const [amount, setAmount] = useState<number>(type === 'deposit' ? 20000 : 10000);
  const [reference, setReference] = useState<string>(
    type === 'deposit' ? 'DEP-8912' : type === 'withdrawal' ? 'WDL-402' : 'TRF-901'
  );
  const [remarks, setRemarks] = useState<string>(
    type === 'deposit'
      ? 'Daily surplus cash counter deposit to HDFC Guindy branch'
      : type === 'withdrawal'
      ? 'Shop petty cash replenishment for local transport & freight'
      : 'UPI settlement sweep into HDFC primary operating account'
  );
  const [fromAccount, setFromAccount] = useState<'Cash' | 'Bank' | 'UPI'>(
    type === 'deposit' ? 'Cash' : type === 'withdrawal' ? 'Bank' : 'UPI'
  );
  const [toAccount, setToAccount] = useState<'Cash' | 'Bank' | 'UPI'>(
    type === 'deposit' ? 'Bank' : type === 'withdrawal' ? 'Cash' : 'Bank'
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  // Calculate balances before and after
  const getSourceAccountBalance = () => {
    if (type === 'deposit') return cashAcc.balance;
    if (type === 'withdrawal') return bankAcc.balance;
    // Transfer:
    return fromAccount === 'Cash' ? cashAcc.balance : fromAccount === 'Bank' ? bankAcc.balance : upiAcc.balance;
  };

  const getTargetAccountBalance = () => {
    if (type === 'deposit') return bankAcc.balance;
    if (type === 'withdrawal') return cashAcc.balance;
    // Transfer:
    return toAccount === 'Cash' ? cashAcc.balance : toAccount === 'Bank' ? bankAcc.balance : upiAcc.balance;
  };

  const sourceBalBefore = getSourceAccountBalance();
  const targetBalBefore = getTargetAccountBalance();

  const sourceBalAfter = Math.max(0, sourceBalBefore - (amount || 0));
  const targetBalAfter = targetBalBefore + (amount || 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!amount || amount <= 0) {
      setValidationError('Amount must be greater than zero.');
      return;
    }

    // Balance check
    if (amount > sourceBalBefore) {
      const sourceName = type === 'deposit' ? 'Cash Drawer' : type === 'withdrawal' ? 'HDFC Bank' : fromAccount;
      setValidationError(
        `Insufficient balance in ${sourceName}: Available ₹${sourceBalBefore.toLocaleString('en-IN')}, Requested ₹${amount.toLocaleString('en-IN')}.`
      );
      return;
    }

    if (type === 'transfer' && fromAccount === toAccount) {
      setValidationError('Source and destination accounts must be different.');
      return;
    }

    // Build updated accounts
    let updatedCash = cashAcc.balance;
    let updatedBank = bankAcc.balance;
    let updatedUpi = upiAcc.balance;

    if (type === 'deposit') {
      updatedCash -= amount;
      updatedBank += amount;
    } else if (type === 'withdrawal') {
      updatedBank -= amount;
      updatedCash += amount;
    } else if (type === 'transfer') {
      if (fromAccount === 'Cash') updatedCash -= amount;
      else if (fromAccount === 'Bank') updatedBank -= amount;
      else if (fromAccount === 'UPI') updatedUpi -= amount;

      if (toAccount === 'Cash') updatedCash += amount;
      else if (toAccount === 'Bank') updatedBank += amount;
      else if (toAccount === 'UPI') updatedUpi += amount;
    }

    const updatedAccountsList: BankingAccount[] = [
      { ...cashAcc, balance: updatedCash },
      { ...bankAcc, balance: updatedBank },
      { ...upiAcc, balance: updatedUpi }
    ];

    const newTx: BankTransaction = {
      id: 'bt-' + Date.now(),
      date: new Date().toLocaleDateString('en-GB'),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reference: reference,
      description: remarks || `${type.toUpperCase()} operation`,
      account: type === 'deposit' ? 'Bank' : type === 'withdrawal' ? 'Cash' : toAccount,
      type: type === 'deposit' ? 'Deposit' : type === 'withdrawal' ? 'Withdrawal' : 'Transfer',
      debit: type === 'withdrawal' ? amount : 0,
      credit: type === 'deposit' ? amount : amount,
      balance: type === 'deposit' ? updatedBank : type === 'withdrawal' ? updatedCash : targetBalAfter,
      status: 'Reconciled'
    };

    onExecuteOperation(newTx, updatedAccountsList);
  };

  const title =
    type === 'deposit'
      ? 'Cash Deposit (Contra to Bank)'
      : type === 'withdrawal'
      ? 'Cash Withdrawal (Self Cheque)'
      : 'Fund Transfer Between Accounts';

  const subtitle =
    type === 'deposit'
      ? 'Transfer surplus cash from physical register drawer into HDFC Bank'
      : type === 'withdrawal'
      ? 'Withdraw bank funds into physical register for petty cash & freight'
      : 'Move liquidity between Cash, Bank, and Merchant UPI';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest rounded-lg shadow-2xl border border-surface-container-high w-full max-w-lg overflow-hidden flex flex-col text-xs">
        {/* Header */}
        <div className="p-4 bg-surface-container border-b border-surface-container-high flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">
              {type === 'deposit' ? 'south' : type === 'withdrawal' ? 'north' : 'sync_alt'}
            </span>
            <div>
              <h2 className="font-headline-md text-base font-bold text-on-surface">{title}</h2>
              <p className="text-[11px] text-outline">{subtitle}</p>
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {validationError && (
            <div className="p-3 rounded bg-error-container text-on-error-container font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{validationError}</span>
            </div>
          )}

          {/* Account Route Selector if Transfer */}
          {type === 'transfer' && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-surface-container-low rounded border border-surface-container">
              <div>
                <label className="block text-outline font-medium mb-1">From Account</label>
                <select
                  value={fromAccount}
                  onChange={(e) => setFromAccount(e.target.value as any)}
                  className="w-full bg-surface-container border border-surface-container-high rounded p-2 text-xs font-semibold text-on-surface focus:outline-none"
                >
                  <option value="UPI">ICICI Merchant UPI (₹{upiAcc.balance.toLocaleString('en-IN')})</option>
                  <option value="Bank">HDFC Current Bank (₹{bankAcc.balance.toLocaleString('en-IN')})</option>
                  <option value="Cash">Cash in Drawer (₹{cashAcc.balance.toLocaleString('en-IN')})</option>
                </select>
              </div>

              <div>
                <label className="block text-outline font-medium mb-1">To Account</label>
                <select
                  value={toAccount}
                  onChange={(e) => setToAccount(e.target.value as any)}
                  className="w-full bg-surface-container border border-surface-container-high rounded p-2 text-xs font-semibold text-on-surface focus:outline-none"
                >
                  <option value="Bank">HDFC Current Bank (₹{bankAcc.balance.toLocaleString('en-IN')})</option>
                  <option value="UPI">ICICI Merchant UPI (₹{upiAcc.balance.toLocaleString('en-IN')})</option>
                  <option value="Cash">Cash in Drawer (₹{cashAcc.balance.toLocaleString('en-IN')})</option>
                </select>
              </div>
            </div>
          )}

          {/* Amount & Reference */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-outline font-medium mb-1">
                Amount (₹) <span className="text-error">*</span>
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
                Challan / Slip Ref # <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full p-2 bg-surface-container-low border border-surface-container-high rounded font-mono font-semibold text-xs text-on-surface focus:outline-none focus:border-secondary"
              />
            </div>
          </div>

          <div>
            <label className="block text-outline font-medium mb-1">Reason / Remarks</label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full p-2 bg-surface-container-low border border-surface-container-high rounded text-xs text-on-surface focus:outline-none focus:border-secondary"
            />
          </div>

          {/* Live Before / After Balance Matrix (Required by prompt) */}
          <div className="p-3.5 rounded bg-surface-container-low border border-surface-container-high space-y-2">
            <div className="text-[11px] font-bold text-outline uppercase tracking-wider">
              Contra Balance Impact Matrix
            </div>
            <div className="grid grid-cols-2 gap-3">
              {/* Source Account */}
              <div className="p-2.5 rounded bg-surface-container-lowest border border-surface-container space-y-1">
                <div className="text-[10px] font-bold text-error uppercase">
                  Source: {type === 'deposit' ? 'Cash in Drawer' : type === 'withdrawal' ? 'HDFC Bank' : fromAccount}
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-outline">Before:</span>
                  <span className="text-on-surface">₹{sourceBalBefore.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between font-mono font-bold pt-1 border-t border-surface-container">
                  <span className="text-error">After:</span>
                  <span className="text-error">₹{sourceBalAfter.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Target Account */}
              <div className="p-2.5 rounded bg-surface-container-lowest border border-surface-container space-y-1">
                <div className="text-[10px] font-bold text-tertiary uppercase">
                  Target: {type === 'deposit' ? 'HDFC Bank' : type === 'withdrawal' ? 'Cash in Drawer' : toAccount}
                </div>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-outline">Before:</span>
                  <span className="text-on-surface">₹{targetBalBefore.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between font-mono font-bold pt-1 border-t border-surface-container">
                  <span className="text-tertiary">After:</span>
                  <span className="text-tertiary">₹{targetBalAfter.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container-high">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-surface-container-low hover:bg-surface-container text-on-surface rounded text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-secondary hover:bg-secondary-container text-on-secondary rounded text-xs font-bold transition-colors shadow-xs"
            >
              Execute {type === 'deposit' ? 'Deposit' : type === 'withdrawal' ? 'Withdrawal' : 'Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
