import { apiClient } from '../lib/api-client';

export interface CreateReceiptPayload {
  customerId: string;
  customerName?: string;
  customerMobile?: string;
  amount: number;
  paymentMode: 'CASH' | 'UPI' | 'CARD' | 'NEFT_RTGS' | 'CHEQUE';
  referenceNo?: string;
  notes?: string;
  allocations?: Array<{
    invoiceId: string;
    allocatedAmount: number;
  }>;
}

export interface CreatePaymentPayload {
  supplierId: string;
  supplierName?: string;
  amount: number;
  paymentMode: 'CASH' | 'UPI' | 'CARD' | 'NEFT_RTGS' | 'CHEQUE';
  referenceNo?: string;
  notes?: string;
  allocations?: Array<{
    purchaseId: string;
    allocatedAmount: number;
  }>;
}

export interface ReverseVoucherPayload {
  voucherType: 'RECEIPT' | 'PAYMENT';
  voucherId: string;
  reason: string;
}

export interface BankingDepositPayload {
  accountId: string;
  amount: number;
  source: 'CASH_DRAWER' | 'DIRECT_DEPOSIT' | 'OTHER';
  referenceNo?: string;
  notes?: string;
}

export interface BankingWithdrawalPayload {
  accountId: string;
  amount: number;
  purpose: 'PETTY_CASH' | 'EXPENSE' | 'SALARY' | 'OTHER';
  referenceNo?: string;
  notes?: string;
}

export interface BankingTransferPayload {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  referenceNo?: string;
  notes?: string;
}

export interface ReconcileTransactionPayload {
  transactionId: string;
  bankStatementDate: string;
  verifiedNotes?: string;
}

export const accountService = {
  getDashboardSummary: async () => {
    const res = await apiClient.get('/accounts/dashboard');
    return res.data;
  },

  getCustomerLedger: async (customerId: string) => {
    const res = await apiClient.get(`/accounts/ledgers/customer/${customerId}`);
    return res.data;
  },

  createReceipt: async (payload: CreateReceiptPayload) => {
    const res = await apiClient.post('/accounts/receipts', payload);
    return res.data;
  },

  reverseReceipt: async (payload: ReverseVoucherPayload) => {
    const res = await apiClient.post('/accounts/receipts/reverse', payload);
    return res.data;
  },

  createPayment: async (payload: CreatePaymentPayload) => {
    const res = await apiClient.post('/accounts/payments', payload);
    return res.data;
  },

  reversePayment: async (payload: ReverseVoucherPayload) => {
    const res = await apiClient.post('/accounts/payments/reverse', payload);
    return res.data;
  },

  createDeposit: async (payload: BankingDepositPayload) => {
    const res = await apiClient.post('/accounts/banking/deposit', payload);
    return res.data;
  },

  createWithdrawal: async (payload: BankingWithdrawalPayload) => {
    const res = await apiClient.post('/accounts/banking/withdrawal', payload);
    return res.data;
  },

  createTransfer: async (payload: BankingTransferPayload) => {
    const res = await apiClient.post('/accounts/banking/transfer', payload);
    return res.data;
  },

  reconcileTransaction: async (payload: ReconcileTransactionPayload) => {
    const res = await apiClient.post('/accounts/banking/reconcile', payload);
    return res.data;
  }
};
