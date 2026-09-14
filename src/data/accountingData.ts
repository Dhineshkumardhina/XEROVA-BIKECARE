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

export const INITIAL_RECEIVABLES: ReceivableRecord[] = [
  {
    id: 'rec-01',
    customerId: 'cust-1',
    customerName: 'Karthik Raja Auto Works',
    mobile: '9840123456',
    invoicesCount: 8,
    totalSales: 84500,
    received: 52000,
    outstanding: 32500,
    lastPaymentDate: '10-Sep-2026',
    status: 'PENDING',
    ageing: { current: 12000, d1_30: 15500, d31_60: 5000, d61_90: 0, d90Plus: 0 }
  },
  {
    id: 'rec-02',
    customerId: 'cust-2',
    customerName: 'Senthil Kumar (Speed Motors)',
    mobile: '9791098765',
    invoicesCount: 14,
    totalSales: 165000,
    received: 120000,
    outstanding: 45000,
    lastPaymentDate: '08-Sep-2026',
    status: 'OVERDUE',
    ageing: { current: 15000, d1_30: 10000, d31_60: 12000, d61_90: 8000, d90Plus: 0 }
  },
  {
    id: 'rec-03',
    customerId: 'cust-3',
    customerName: 'Balaji Two Wheeler Workshop',
    mobile: '9444112233',
    invoicesCount: 6,
    totalSales: 48000,
    received: 48000,
    outstanding: 0,
    lastPaymentDate: '12-Sep-2026',
    status: 'PAID',
    ageing: { current: 0, d1_30: 0, d31_60: 0, d61_90: 0, d90Plus: 0 }
  }
];

export const INITIAL_CUSTOMER_LEDGER: CustomerLedgerEntry[] = [
  {
    id: 'cl-1',
    date: '02-Sep-2026',
    particular: 'Tax Invoice #INV-2026-0041 (Parts + Service)',
    invoice: 'INV-2026-0041',
    debit: 18500,
    credit: 0,
    balance: 18500,
    status: 'Active',
    type: 'Sales',
    createdBy: 'System (POS Admin)'
  },
  {
    id: 'cl-2',
    date: '10-Sep-2026',
    particular: 'Payment Receipt Voucher #RV-00291 (GPay UPI)',
    receiptNo: 'RV-00291',
    debit: 0,
    credit: 10000,
    balance: 8500,
    status: 'Active',
    type: 'Receipt',
    createdBy: 'System (POS Admin)'
  }
];

export const INITIAL_RECEIPT_VOUCHERS: ReceiptVoucher[] = [];

export const INITIAL_PAYABLES: PayableRecord[] = [
  {
    id: 'pay-01',
    supplierId: 'sup-1',
    supplierName: 'Spark Spares & OEM Distributors',
    purchasesCount: 12,
    totalPurchase: 280000,
    paid: 220000,
    outstanding: 60000,
    lastPaymentDate: '05-Sep-2026',
    status: 'PENDING'
  },
  {
    id: 'pay-02',
    supplierId: 'sup-2',
    supplierName: 'Bosch & Bajaj Genuine Spares',
    purchasesCount: 9,
    totalPurchase: 195000,
    paid: 145000,
    outstanding: 50000,
    lastPaymentDate: '01-Sep-2026',
    status: 'OVERDUE'
  }
];

export const INITIAL_SUPPLIER_LEDGER: SupplierLedgerEntry[] = [
  {
    id: 'sl-1',
    date: '01-Sep-2026',
    particular: 'Purchase Receipt PO #PO-88210 (Lubricants & Filters)',
    purchase: 'PO-88210',
    debit: 0,
    credit: 35000,
    balance: 35000,
    status: 'Active',
    type: 'Purchase',
    createdBy: 'System (Purchase Mgr)'
  },
  {
    id: 'sl-2',
    date: '05-Sep-2026',
    particular: 'Bank Transfer Neft to Spark Spares #PV-00181',
    paymentNo: 'PV-00181',
    debit: 20000,
    credit: 0,
    balance: 15000,
    status: 'Active',
    type: 'Payment',
    createdBy: 'System (Accounts Admin)'
  }
];

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
