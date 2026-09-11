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
    id: 'rec-1',
    customerId: 'cust-1',
    customerName: 'ABC Auto Works',
    mobile: '98765XXXXX',
    invoicesCount: 24,
    totalSales: 482000,
    received: 440000,
    outstanding: 42000,
    lastPaymentDate: '09/09/2026',
    status: 'OVERDUE',
    ageing: {
      current: 0,
      d1_30: 0,
      d31_60: 12000,
      d61_90: 10000,
      d90Plus: 20000
    }
  },
  {
    id: 'rec-2',
    customerId: 'cust-2',
    customerName: 'Sri Balaji Motors',
    mobile: '98401 88231',
    invoicesCount: 18,
    totalSales: 310000,
    received: 282000,
    outstanding: 28000,
    lastPaymentDate: '08/09/2026',
    status: 'PENDING',
    ageing: {
      current: 12000,
      d1_30: 16000,
      d31_60: 0,
      d61_90: 0,
      d90Plus: 0
    }
  },
  {
    id: 'rec-3',
    customerId: 'cust-3',
    customerName: 'Speedline Racing & Tuning',
    mobile: '98842 11990',
    invoicesCount: 32,
    totalSales: 620000,
    received: 555800,
    outstanding: 64200,
    lastPaymentDate: '05/09/2026',
    status: 'PENDING',
    ageing: {
      current: 34000,
      d1_30: 30200,
      d31_60: 0,
      d61_90: 0,
      d90Plus: 0
    }
  },
  {
    id: 'rec-4',
    customerId: 'cust-4',
    customerName: 'Royal Riders Bullet Clinic',
    mobile: '97103 44551',
    invoicesCount: 15,
    totalSales: 245000,
    received: 206500,
    outstanding: 38500,
    lastPaymentDate: '28/08/2026',
    status: 'OVERDUE',
    ageing: {
      current: 0,
      d1_30: 0,
      d31_60: 15000,
      d61_90: 8500,
      d90Plus: 15000
    }
  },
  {
    id: 'rec-5',
    customerId: 'cust-5',
    customerName: 'Classic Bike Studio',
    mobile: '99401 33221',
    invoicesCount: 28,
    totalSales: 510000,
    received: 420000,
    outstanding: 90000,
    lastPaymentDate: '07/09/2026',
    status: 'PENDING',
    ageing: {
      current: 48000,
      d1_30: 24000,
      d31_60: 18000,
      d61_90: 0,
      d90Plus: 0
    }
  },
  {
    id: 'rec-6',
    customerId: 'cust-6',
    customerName: 'KRT Auto Care Workshop',
    mobile: '98409 66778',
    invoicesCount: 12,
    totalSales: 180000,
    received: 140000,
    outstanding: 40000,
    lastPaymentDate: '04/09/2026',
    status: 'OVERDUE',
    ageing: {
      current: 10000,
      d1_30: 0,
      d31_60: 0,
      d61_90: 9500,
      d90Plus: 20500
    }
  },
  {
    id: 'rec-7',
    customerId: 'cust-7',
    customerName: 'Metro Garage Works',
    mobile: '97901 22334',
    invoicesCount: 19,
    totalSales: 350000,
    received: 309900,
    outstanding: 40100,
    lastPaymentDate: '10/09/2026',
    status: 'PAID',
    ageing: {
      current: 20000,
      d1_30: 11800,
      d31_60: 0,
      d61_90: 0,
      d90Plus: 8300
    }
  }
];

// Reconciles to:
// Current: 0 + 12000 + 34000 + 0 + 48000 + 10000 + 20000 = 124,000
// 1-30: 0 + 16000 + 30200 + 0 + 24000 + 0 + 11800 = 82,000
// 31-60: 12000 + 0 + 0 + 15000 + 18000 + 0 + 0 = 45,000
// 61-90: 10000 + 0 + 0 + 8500 + 0 + 9500 + 0 = 28,000
// 90+: 20000 + 0 + 0 + 15000 + 0 + 20500 + 8300 = 63,800
// Total: 342,800! Exact match to prompt.

export const INITIAL_PAYABLES: PayableRecord[] = [
  {
    id: 'pay-1',
    supplierId: 'sup-1',
    supplierName: 'TVS Motors',
    purchasesCount: 14,
    totalPurchase: 842000,
    paid: 790000,
    outstanding: 52000,
    lastPaymentDate: '09/09/2026',
    status: 'PENDING'
  },
  {
    id: 'pay-2',
    supplierId: 'sup-2',
    supplierName: 'Bajaj Auto Genuine Spares',
    purchasesCount: 18,
    totalPurchase: 680000,
    paid: 632000,
    outstanding: 48000,
    lastPaymentDate: '05/09/2026',
    status: 'PENDING'
  },
  {
    id: 'pay-3',
    supplierId: 'sup-3',
    supplierName: 'Rolon Transmission Chains Corp',
    purchasesCount: 9,
    totalPurchase: 420000,
    paid: 384000,
    outstanding: 36000,
    lastPaymentDate: '03/09/2026',
    status: 'PENDING'
  },
  {
    id: 'pay-4',
    supplierId: 'sup-4',
    supplierName: 'Motul Lubricants India',
    purchasesCount: 11,
    totalPurchase: 540000,
    paid: 510200,
    outstanding: 29800,
    lastPaymentDate: '08/09/2026',
    status: 'PENDING'
  },
  {
    id: 'pay-5',
    supplierId: 'sup-5',
    supplierName: 'Endurance Braking Systems Ltd',
    purchasesCount: 7,
    totalPurchase: 290000,
    paid: 269600,
    outstanding: 20400,
    lastPaymentDate: '01/09/2026',
    status: 'PENDING'
  }
];
// Total Payables: 52000 + 48000 + 36000 + 29800 + 20400 = 186,200! Exact match.

export const INITIAL_CUSTOMER_LEDGERS: Record<string, CustomerLedgerEntry[]> = {
  'cust-1': [
    {
      id: 'cl-1',
      date: '01/09/2026',
      particular: 'Opening Balance',
      debit: 8500,
      credit: 0,
      balance: 8500,
      type: 'Opening',
      createdBy: 'System Migration'
    },
    {
      id: 'cl-2',
      date: '03/09/2026',
      particular: 'Sales - Spares Counter Bill',
      invoice: 'INV-10291',
      debit: 5000,
      credit: 0,
      balance: 13500,
      type: 'Sales',
      createdBy: 'Operator (F4)'
    },
    {
      id: 'cl-3',
      date: '05/09/2026',
      particular: 'Receipt - Customer On-Account Payment',
      receiptNo: 'RV-00291',
      debit: 0,
      credit: 8000,
      balance: 5500,
      type: 'Receipt',
      createdBy: 'Cashier Muthu'
    },
    {
      id: 'cl-4',
      date: '10/09/2026',
      particular: 'Sales - Garage Bulk Spares Supply',
      invoice: 'INV-10301',
      debit: 36500,
      credit: 0,
      balance: 42000,
      type: 'Sales',
      createdBy: 'Operator (F4)'
    }
  ]
};

export const INITIAL_SUPPLIER_LEDGERS: Record<string, SupplierLedgerEntry[]> = {
  'sup-1': [
    {
      id: 'sl-1',
      date: '01/09/2026',
      particular: 'Opening Balance',
      debit: 0,
      credit: 12000,
      balance: 12000,
      type: 'Opening',
      createdBy: 'System Migration'
    },
    {
      id: 'sl-2',
      date: '04/09/2026',
      particular: 'Purchase - Fork Oil, Gaskets, Cables Bulk Inward',
      purchase: 'PO-8413',
      debit: 0,
      credit: 65000,
      balance: 77000,
      type: 'Purchase',
      createdBy: 'Inventory Manager'
    },
    {
      id: 'sl-3',
      date: '07/09/2026',
      particular: 'Payment - Part Clearance via HDFC Bank NEFT',
      paymentNo: 'PV-00181',
      debit: 25000,
      credit: 0,
      balance: 52000,
      type: 'Payment',
      createdBy: 'Accountant'
    }
  ]
};

export const INITIAL_RECEIPT_VOUCHERS: ReceiptVoucher[] = [
  {
    id: 'rv-1',
    receiptNo: 'RV-00291',
    customerId: 'cust-1',
    customerName: 'ABC Auto Works',
    customerMobile: '98765XXXXX',
    invoiceRef: 'INV-10291',
    amount: 15000,
    paymentMode: 'UPI',
    refNo: 'UPI/329482910481',
    date: '09/09/2026',
    time: '11:32 AM',
    createdBy: 'Billing Operator',
    remarks: 'Clearance against August outstanding garage dues',
    status: 'Active',
    previousBalance: 42000,
    newBalance: 27000,
    allocation: [
      { invoiceNo: 'INV-101', amount: 10000 },
      { invoiceNo: 'INV-108', amount: 5000 }
    ]
  },
  {
    id: 'rv-2',
    receiptNo: 'RV-00290',
    customerId: 'cust-2',
    customerName: 'Sri Balaji Motors',
    customerMobile: '98401 88231',
    invoiceRef: 'INV-10285',
    amount: 12000,
    paymentMode: 'Cash',
    date: '08/09/2026',
    time: '04:15 PM',
    createdBy: 'Cashier Muthu',
    remarks: 'Counter cash received for Splendor clutch kits',
    status: 'Active',
    previousBalance: 40000,
    newBalance: 28000
  },
  {
    id: 'rv-3',
    receiptNo: 'RV-00289',
    customerId: 'cust-3',
    customerName: 'Speedline Racing & Tuning',
    customerMobile: '98842 11990',
    invoiceRef: 'INV-10270',
    amount: 18800,
    paymentMode: 'Bank',
    refNo: 'NEFT/HDFC901823901',
    date: '07/09/2026',
    time: '02:20 PM',
    createdBy: 'Admin',
    remarks: 'Direct IMPS settlement for race disc assembly',
    status: 'Active',
    previousBalance: 83000,
    newBalance: 64200
  }
];

export const INITIAL_PAYMENT_VOUCHERS: PaymentVoucher[] = [
  {
    id: 'pv-1',
    paymentNo: 'PV-00181',
    supplierId: 'sup-1',
    supplierName: 'TVS Motors',
    reference: 'PO-8413',
    amount: 25000,
    paymentMode: 'Bank',
    refNo: 'NEFT/HDFC22910398',
    date: '09/09/2026',
    time: '10:18 AM',
    createdBy: 'Accounts Executive',
    approvedBy: 'Managing Director',
    remarks: 'Part payment against Apache RTR fork oil & gasket shipments',
    status: 'Active',
    previousPayable: 52000,
    remainingPayable: 27000
  },
  {
    id: 'pv-2',
    paymentNo: 'PV-00180',
    supplierId: 'sup-2',
    supplierName: 'Bajaj Auto Genuine Spares',
    reference: 'PO-8412',
    amount: 35000,
    paymentMode: 'Cheque',
    refNo: 'CHQ-0049182 (HDFC)',
    date: '06/09/2026',
    time: '03:00 PM',
    createdBy: 'Accounts Executive',
    approvedBy: 'Admin',
    remarks: 'Cheque issued for Pulsar 150 clutch plates bulk consignment',
    status: 'Active',
    previousPayable: 83000,
    remainingPayable: 48000
  },
  {
    id: 'pv-3',
    paymentNo: 'PV-00179',
    supplierId: 'sup-3',
    supplierName: 'Rolon Transmission Chains Corp',
    reference: 'PO-8410',
    amount: 15000,
    paymentMode: 'Cash',
    date: '03/09/2026',
    time: '11:45 AM',
    createdBy: 'Cashier',
    approvedBy: 'Store Manager',
    remarks: 'Cash handed to delivery logistics representative against gate pass',
    status: 'Active',
    previousPayable: 51000,
    remainingPayable: 36000
  }
];

export const INITIAL_BANK_ACCOUNTS: BankingAccount[] = [
  {
    id: 'acc-cash',
    name: 'Cash in Counter Drawer',
    type: 'Cash',
    balance: 85400
  },
  {
    id: 'acc-bank',
    name: 'HDFC Bank (Current A/c 50200018294)',
    type: 'Bank',
    accountNumber: '50200018294',
    bankName: 'HDFC Bank - Guindy Branch',
    balance: 428600
  },
  {
    id: 'acc-upi',
    name: 'ICICI Merchant QR (UPI)',
    type: 'UPI',
    accountNumber: 'bikeerp@icici',
    bankName: 'ICICI UPI Merchant Hub',
    balance: 62300
  }
];

export const INITIAL_BANK_TRANSACTIONS: BankTransaction[] = [
  {
    id: 'bt-1',
    date: '10/09/2026',
    time: '02:30 PM',
    reference: 'DEP-8910',
    description: 'Cash Deposit into HDFC Current Account',
    account: 'Bank',
    type: 'Deposit',
    debit: 0,
    credit: 25000,
    balance: 428600,
    status: 'Reconciled'
  },
  {
    id: 'bt-2',
    date: '09/09/2026',
    time: '10:18 AM',
    reference: 'PV-00181',
    description: 'NEFT Payment to TVS Motors (PO-8413)',
    account: 'Bank',
    type: 'Payment',
    debit: 25000,
    credit: 0,
    balance: 403600,
    status: 'Reconciled'
  },
  {
    id: 'bt-3',
    date: '09/09/2026',
    time: '11:32 AM',
    reference: 'RV-00291',
    description: 'UPI Receipt from ABC Auto Works (QR Scan)',
    account: 'UPI',
    type: 'Receipt',
    debit: 0,
    credit: 15000,
    balance: 62300,
    status: 'Reconciled'
  },
  {
    id: 'bt-4',
    date: '08/09/2026',
    time: '05:00 PM',
    reference: 'CHG-102',
    description: 'HDFC SMS Alert & Quarterly Bank Service Charges',
    account: 'Bank',
    type: 'Charge',
    debit: 354,
    credit: 0,
    balance: 428600,
    status: 'Reconciled'
  },
  {
    id: 'bt-5',
    date: '07/09/2026',
    time: '03:15 PM',
    reference: 'WDL-401',
    description: 'Self Cash Withdrawal for Shop Petty Cash / Freight',
    account: 'Bank',
    type: 'Withdrawal',
    debit: 10000,
    credit: 0,
    balance: 428954,
    status: 'Reconciled'
  }
];

export const INITIAL_TIMELINE_ITEMS: FinancialTimelineItem[] = [
  {
    id: 'tl-1',
    time: '11:32 AM',
    date: 'Today',
    type: 'Receipt',
    voucherNo: 'RV-00291',
    party: 'ABC Auto Works',
    amount: 15000,
    mode: 'UPI',
    description: '₹15,000 received from ABC Auto Works'
  },
  {
    id: 'tl-2',
    time: '10:18 AM',
    date: 'Today',
    type: 'Payment',
    voucherNo: 'PV-00181',
    party: 'TVS Motors',
    amount: 25000,
    mode: 'Bank Transfer',
    description: '₹25,000 paid to TVS Motors'
  },
  {
    id: 'tl-3',
    time: '09:42 AM',
    date: 'Today',
    type: 'Invoice',
    voucherNo: 'INV-10291',
    party: 'Sri Balaji Motors',
    amount: 3068,
    mode: 'Cash POS',
    description: '₹3,068 sale recorded'
  },
  {
    id: 'tl-4',
    time: '09:10 AM',
    date: 'Today',
    type: 'Contra',
    voucherNo: 'DEP-8910',
    party: 'HDFC Current A/c',
    amount: 20000,
    mode: 'Cash Deposit',
    description: '₹20,000 Cash deposited to HDFC Bank'
  }
];

export const INITIAL_ABC_OUTSTANDING_INVOICES: OutstandingInvoiceItem[] = [
  {
    id: 'oi-1',
    invoiceNo: 'INV-101',
    date: '15/08/2026',
    totalAmount: 10000,
    paidAmount: 0,
    dueAmount: 10000,
    allocatedAmount: 10000
  },
  {
    id: 'oi-2',
    invoiceNo: 'INV-108',
    date: '22/08/2026',
    totalAmount: 15000,
    paidAmount: 0,
    dueAmount: 15000,
    allocatedAmount: 15000
  },
  {
    id: 'oi-3',
    invoiceNo: 'INV-115',
    date: '29/08/2026',
    totalAmount: 20000,
    paidAmount: 0,
    dueAmount: 20000,
    allocatedAmount: 0
  }
];

export const INITIAL_CUSTOMER_LEDGER: CustomerLedgerEntry[] = INITIAL_CUSTOMER_LEDGERS['cust-1'] || [];
export const INITIAL_SUPPLIER_LEDGER: SupplierLedgerEntry[] = INITIAL_SUPPLIER_LEDGERS['sup-1'] || [];
export const INITIAL_FINANCIAL_TIMELINE: FinancialTimelineItem[] = INITIAL_TIMELINE_ITEMS;
