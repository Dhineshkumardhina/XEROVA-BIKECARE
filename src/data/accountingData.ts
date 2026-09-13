import {
  ReceivableRecord,
  PayableRecord,
  CustomerLedgerEntry,
  SupplierLedgerEntry,
  ReceiptVoucher,
  PaymentVoucher,
  BankTransaction,
  BankingAccount,
  FinancialTimelineItem,
  OutstandingInvoiceItem
} from '../types';

export const INITIAL_RECEIVABLES: ReceivableRecord[] = [];

export const INITIAL_CUSTOMER_LEDGER: CustomerLedgerEntry[] = [];

export const INITIAL_RECEIPT_VOUCHERS: ReceiptVoucher[] = [];

export const INITIAL_PAYABLES: PayableRecord[] = [];

export const INITIAL_SUPPLIER_LEDGER: SupplierLedgerEntry[] = [];

export const INITIAL_PAYMENT_VOUCHERS: PaymentVoucher[] = [];

export const INITIAL_BANK_ACCOUNTS: BankingAccount[] = [
  {
    id: 'acc-cash',
    name: 'Cash in Counter Drawer',
    type: 'Cash',
    balance: 0
  },
  {
    id: 'acc-bank',
    name: 'Current Bank Account',
    type: 'Bank',
    accountNumber: '50200018294',
    bankName: 'Commercial Bank - Primary Branch',
    balance: 0
  },
  {
    id: 'acc-upi',
    name: 'UPI Merchant Account',
    type: 'UPI',
    accountNumber: 'bikeerp@upi',
    bankName: 'UPI Merchant Payment Gateway',
    balance: 0
  }
];

export const INITIAL_BANK_TRANSACTIONS: BankTransaction[] = [];

export const INITIAL_TIMELINE_ITEMS: FinancialTimelineItem[] = [];

export const INITIAL_FINANCIAL_TIMELINE: FinancialTimelineItem[] = [];

export const INITIAL_ABC_OUTSTANDING_INVOICES: OutstandingInvoiceItem[] = [];
