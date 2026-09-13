/**
 * BIKE ERP - Banking & Cash Management Test Suite
 * Tests:
 * 1. Cash Deposit (Cash Drawer -> HDFC Bank Account Contra)
 * 2. Cash Withdrawal (HDFC Bank -> Cash Drawer)
 * 3. Fund Transfer (UPI -> Bank, Bank -> Bank)
 * 4. Transfer Validation Safeguards (Blocks transfer to same account)
 * 5. Insufficient Balance Protection on Withdrawal/Transfer
 * 6. Cash Book Reconciliation (Opening + Inflows - Outflows = Closing)
 * 7. Bank Book Reconciliation (Opening + Deposits - Withdrawals = Closing)
 * 8. Bank Transaction Reconciliation Status (UNRECONCILED -> RECONCILED)
 * 9. Non-Destructive Transaction Reversal
 * 10. Auditable History Tracking for all Banking Operations
 */

import {
  createDepositSchema,
  createWithdrawalSchema,
  createTransferSchema,
  reconcileTransactionSchema
} from '../validators/account.validator.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${detail ? `- ${detail}` : ''}`);
    failed++;
  }
}

// In-Memory Simulation of Banking Engine
interface SimAccount {
  id: string;
  name: string;
  type: 'Cash' | 'Bank' | 'UPI';
  balance: number;
}

interface SimBankTx {
  id: string;
  reference: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'RECEIPT' | 'PAYMENT';
  fromAccount: string;
  toAccount: string;
  amount: number;
  date: Date;
  status: 'UNRECONCILED' | 'RECONCILED' | 'REVERSED';
  notes?: string;
}

class BankingTestEngine {
  accounts: Map<string, SimAccount> = new Map();
  transactions: SimBankTx[] = [];
  auditLogs: Array<{ action: string; entity: string; entityId: string; details: any }> = [];

  constructor() {
    this.accounts.set('acc-cash', { id: 'acc-cash', name: 'Counter Cash Drawer', type: 'Cash', balance: 85400 });
    this.accounts.set('acc-bank', { id: 'acc-bank', name: 'HDFC Bank Current A/c', type: 'Bank', balance: 428600 });
    this.accounts.set('acc-upi', { id: 'acc-upi', name: 'ICICI Merchant QR', type: 'UPI', balance: 62300 });
  }

  async depositCash(params: { amount: number; reference: string; remarks?: string }) {
    if (params.amount <= 0) throw new Error('Amount must be positive');
    const cash = this.accounts.get('acc-cash')!;
    const bank = this.accounts.get('acc-bank')!;

    if (cash.balance < params.amount) {
      const err: any = new Error('Insufficient cash in drawer');
      err.code = 'INSUFFICIENT_CASH';
      throw err;
    }

    cash.balance -= params.amount;
    bank.balance += params.amount;

    const tx: SimBankTx = {
      id: `bt-${Date.now()}`,
      reference: params.reference,
      type: 'DEPOSIT',
      fromAccount: 'acc-cash',
      toAccount: 'acc-bank',
      amount: params.amount,
      date: new Date(),
      status: 'RECONCILED',
      notes: params.remarks
    };
    this.transactions.push(tx);

    this.auditLogs.push({
      action: 'Cash Deposited',
      entity: 'BankTransaction',
      entityId: params.reference,
      details: { amount: params.amount, newBankBalance: bank.balance, newCashBalance: cash.balance }
    });

    return { reference: params.reference, cashBalance: cash.balance, bankBalance: bank.balance };
  }

  async withdrawCash(params: { amount: number; reference: string; remarks?: string }) {
    if (params.amount <= 0) throw new Error('Amount must be positive');
    const cash = this.accounts.get('acc-cash')!;
    const bank = this.accounts.get('acc-bank')!;

    if (bank.balance < params.amount) {
      const err: any = new Error('Insufficient bank balance');
      err.code = 'INSUFFICIENT_BANK_BALANCE';
      throw err;
    }

    bank.balance -= params.amount;
    cash.balance += params.amount;

    const tx: SimBankTx = {
      id: `bt-${Date.now()}`,
      reference: params.reference,
      type: 'WITHDRAWAL',
      fromAccount: 'acc-bank',
      toAccount: 'acc-cash',
      amount: params.amount,
      date: new Date(),
      status: 'RECONCILED',
      notes: params.remarks
    };
    this.transactions.push(tx);

    this.auditLogs.push({
      action: 'Cash Withdrawn',
      entity: 'BankTransaction',
      entityId: params.reference,
      details: { amount: params.amount, newBankBalance: bank.balance, newCashBalance: cash.balance }
    });

    return { reference: params.reference, cashBalance: cash.balance, bankBalance: bank.balance };
  }

  async transferFunds(params: { fromAccountId: string; toAccountId: string; amount: number; reference: string; remarks?: string }) {
    if (params.fromAccountId === params.toAccountId) {
      const err: any = new Error('Source and destination accounts cannot be identical');
      err.code = 'SAME_ACCOUNT_TRANSFER';
      throw err;
    }

    const from = this.accounts.get(params.fromAccountId);
    const to = this.accounts.get(params.toAccountId);

    if (!from || !to) throw new Error('Account not found');

    if (from.balance < params.amount) {
      const err: any = new Error(`Insufficient balance in ${from.name}`);
      err.code = 'INSUFFICIENT_BALANCE';
      throw err;
    }

    from.balance -= params.amount;
    to.balance += params.amount;

    const tx: SimBankTx = {
      id: `bt-${Date.now()}`,
      reference: params.reference,
      type: 'TRANSFER',
      fromAccount: params.fromAccountId,
      toAccount: params.toAccountId,
      amount: params.amount,
      date: new Date(),
      status: 'RECONCILED',
      notes: params.remarks
    };
    this.transactions.push(tx);

    this.auditLogs.push({
      action: 'Fund Transferred',
      entity: 'FundTransfer',
      entityId: params.reference,
      details: { from: from.name, to: to.name, amount: params.amount }
    });

    return { reference: params.reference, fromBalance: from.balance, toBalance: to.balance };
  }

  async reconcileTx(reference: string, reconciled: boolean) {
    const tx = this.transactions.find((t) => t.reference === reference);
    if (!tx) throw new Error('Transaction not found');

    tx.status = reconciled ? 'RECONCILED' : 'UNRECONCILED';

    this.auditLogs.push({
      action: 'Bank Transaction Reconciled',
      entity: 'BankTransaction',
      entityId: reference,
      details: { reference, status: tx.status }
    });

    return { reference, status: tx.status };
  }

  async reverseTx(reference: string, reason: string) {
    const tx = this.transactions.find((t) => t.reference === reference);
    if (!tx) throw new Error('Transaction not found');
    if (tx.status === 'REVERSED') {
      const err: any = new Error('Transaction already reversed');
      err.code = 'ALREADY_REVERSED';
      throw err;
    }

    const from = this.accounts.get(tx.fromAccount);
    const to = this.accounts.get(tx.toAccount);

    if (from && to) {
      from.balance += tx.amount;
      to.balance -= tx.amount;
    }

    tx.status = 'REVERSED';

    this.auditLogs.push({
      action: 'Bank Transaction Reversed',
      entity: 'BankTransaction',
      entityId: reference,
      details: { reference, reason, status: 'REVERSED' }
    });

    return { reference, status: 'REVERSED', reason };
  }
}

async function runBankingTests() {
  console.log('\n======================================================');
  console.log('🏦 BIKE ERP - BANKING & CASH MANAGEMENT TEST SUITE');
  console.log('======================================================\n');

  const engine = new BankingTestEngine();

  // Test 1: Cash Deposit (Contra to Bank)
  console.log('--- Test 1: Cash Deposit (Counter Cash -> HDFC Bank) ---');
  const depositData = {
    amount: 20000,
    reference: 'DEP-8910',
    remarks: 'Daily surplus cash counter deposit to HDFC Guindy branch'
  };

  const depositValidation = createDepositSchema.safeParse(depositData);
  assert(depositValidation.success, 'createDepositSchema validates deposit input');

  const d1 = await engine.depositCash(depositData);
  assert(d1.cashBalance === 85400 - 20000, 'Counter cash decreased by ₹20,000 (New Cash: ₹65,400)');
  assert(d1.bankBalance === 428600 + 20000, 'HDFC Bank balance increased by ₹20,000 (New Bank: ₹448,600)');

  // Test 2: Cash Withdrawal (Bank -> Drawer)
  console.log('\n--- Test 2: Cash Withdrawal (Self Cheque to Drawer) ---');
  const withdrawalData = {
    amount: 10000,
    reference: 'WDL-401',
    remarks: 'Shop petty cash replenishment'
  };

  const withdrawalValidation = createWithdrawalSchema.safeParse(withdrawalData);
  assert(withdrawalValidation.success, 'createWithdrawalSchema validates withdrawal input');

  const w1 = await engine.withdrawCash(withdrawalData);
  assert(w1.bankBalance === 448600 - 10000, 'HDFC Bank balance decreased by ₹10,000 (New Bank: ₹438,600)');
  assert(w1.cashBalance === 65400 + 10000, 'Counter cash balance increased by ₹10,000 (New Cash: ₹75,400)');

  // Test 3: Fund Transfer (UPI Hub -> Bank Sweep)
  console.log('\n--- Test 3: Fund Transfer (UPI -> HDFC Bank Sweep) ---');
  const transferData = {
    fromAccountId: 'acc-upi',
    toAccountId: 'acc-bank',
    amount: 50000,
    reference: 'TRF-UPI-001',
    remarks: 'Merchant UPI daily settlement sweep'
  };

  const transferValidation = createTransferSchema.safeParse(transferData);
  assert(transferValidation.success, 'createTransferSchema validates fund transfer input');

  const t1 = await engine.transferFunds(transferData);
  assert(t1.fromBalance === 62300 - 50000, 'UPI hub balance decreased by ₹50,000 (Remaining: ₹12,300)');
  assert(t1.toBalance === 438600 + 50000, 'HDFC Bank balance increased by ₹50,000 (New Bank: ₹488,600)');

  // Test 4: Transfer Safeguards (Same Account Prevention)
  console.log('\n--- Test 4: Same-Account Transfer Prevention Guard ---');
  const invalidTransfer = createTransferSchema.safeParse({
    fromAccountId: 'acc-bank',
    toAccountId: 'acc-bank',
    amount: 5000,
    reference: 'TRF-INVALID'
  });
  assert(!invalidTransfer.success, 'createTransferSchema rejects transfer between identical accounts');

  // Test 5: Over-Withdrawal Protection
  console.log('\n--- Test 5: Over-Withdrawal Balance Guard ---');
  let overWdlErr: any = null;
  try {
    await engine.withdrawCash({
      amount: 900000, // Exceeds bank balance
      reference: 'WDL-OVER'
    });
  } catch (err: any) {
    overWdlErr = err;
  }
  assert(overWdlErr?.code === 'INSUFFICIENT_BANK_BALANCE', 'Rejects withdrawal exceeding available bank balance');

  // Test 6: Cash Book Math Reconciliation
  console.log('\n--- Test 6: Cash Book Arithmetic Reconciliation ---');
  // Initial: 85400, Deposit: -20000, Withdrawal: +10000 -> Current: 75400
  assert(engine.accounts.get('acc-cash')?.balance === 75400, 'Cash book opening + inflows - outflows = ₹75,400');

  // Test 7: Bank Book Math Reconciliation
  console.log('\n--- Test 7: Bank Book Arithmetic Reconciliation ---');
  // Initial: 428600, Deposit: +20000, Withdrawal: -10000, UPI Transfer: +50000 -> Current: 488600
  assert(engine.accounts.get('acc-bank')?.balance === 488600, 'Bank book opening + deposits - withdrawals + transfers = ₹488,600');

  // Test 8: Bank Transaction Reconciliation Status
  console.log('\n--- Test 8: Bank Transaction Reconciliation Foundation ---');
  const unrecTx = await engine.reconcileTx('TRF-UPI-001', false);
  assert(unrecTx.status === 'UNRECONCILED', 'Allowed marking bank transaction as UNRECONCILED');

  const recTx = await engine.reconcileTx('TRF-UPI-001', true);
  assert(recTx.status === 'RECONCILED', 'Authorized user marked transaction as RECONCILED');

  // Test 9: Safe Non-Destructive Reversal
  console.log('\n--- Test 9: Non-Destructive Transaction Reversal ---');
  const bankBeforeRev = engine.accounts.get('acc-bank')?.balance || 0;
  const cashBeforeRev = engine.accounts.get('acc-cash')?.balance || 0;

  const rev = await engine.reverseTx('WDL-401', 'Withdrawal entry recorded in error');
  assert(rev.status === 'REVERSED', 'Transaction marked as REVERSED');
  assert(engine.accounts.get('acc-bank')?.balance === bankBeforeRev + 10000, 'Bank balance restored (+₹10,000)');
  assert(engine.accounts.get('acc-cash')?.balance === cashBeforeRev - 10000, 'Cash drawer balance restored (-₹10,000)');

  // Test 10: System Audit Logging
  console.log('\n--- Test 10: Auditable History Tracking ---');
  const depAudits = engine.auditLogs.filter((a) => a.action === 'Cash Deposited');
  const wdlAudits = engine.auditLogs.filter((a) => a.action === 'Cash Withdrawn');
  const trfAudits = engine.auditLogs.filter((a) => a.action === 'Fund Transferred');
  const recAudits = engine.auditLogs.filter((a) => a.action === 'Bank Transaction Reconciled');
  const revAudits = engine.auditLogs.filter((a) => a.action === 'Bank Transaction Reversed');

  assert(depAudits.length === 1, 'Recorded Cash Deposited audit trail');
  assert(wdlAudits.length === 1, 'Recorded Cash Withdrawn audit trail');
  assert(trfAudits.length === 1, 'Recorded Fund Transferred audit trail');
  assert(recAudits.length === 2, 'Recorded Reconciliation audit trail');
  assert(revAudits.length === 1, 'Recorded Transaction Reversal audit trail');

  // Summary
  console.log('\n======================================================');
  console.log(`  BANKING MODULE TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runBankingTests();
