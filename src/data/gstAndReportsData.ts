import {
  Gstr1Record,
  Gstr1ValidationSummary,
  Gstr3bSupplyItem,
  Gstr3bItcItem,
  HsnTaxRecord,
  SalesReportRow,
  PurchaseReportRow,
  InventoryReportRow,
  ProfitabilityRow,
  FinancialReportRow,
  BusinessInsightItem,
  ReportDetailData
} from '../types';

// =========================================================================
// GST MODULE CLEAN DATA
// =========================================================================

export const GST_DASHBOARD_KPIS = {
  currentMonth: {
    periodName: 'Current Month',
    taxableSales: 0.0,
    outputGst: 0.0,
    cgstOutput: 0.0,
    sgstOutput: 0.0,
    igstOutput: 0.0,
    taxablePurchases: 0.0,
    inputGst: 0.0,
    cgstInput: 0.0,
    sgstInput: 0.0,
    igstInput: 0.0,
    netGstPayable: 0.0,
    totalTransactions: 0,
    b2bCount: 0,
    b2cCount: 0,
    itcEligiblePct: 100.0
  },
  previousMonth: {
    periodName: 'Previous Month',
    taxableSales: 0.0,
    outputGst: 0.0,
    taxablePurchases: 0.0,
    inputGst: 0.0,
    netGstPayable: 0.0,
    totalTransactions: 0
  },
  quarter: {
    periodName: 'Current Quarter',
    taxableSales: 0.0,
    outputGst: 0.0,
    taxablePurchases: 0.0,
    inputGst: 0.0,
    netGstPayable: 0.0,
    totalTransactions: 0
  },
  financialYear: {
    periodName: 'Current FY',
    taxableSales: 0.0,
    outputGst: 0.0,
    taxablePurchases: 0.0,
    inputGst: 0.0,
    netGstPayable: 0.0,
    totalTransactions: 0
  }
};

export const GST_TREND_DATA: any[] = [];

export const GST_FILING_STATUSES = [
  {
    returnType: 'GSTR-1 (Outward Supplies)',
    period: 'Current Tax Period',
    dueDate: '11th of next month',
    status: 'Ready',
    recordsCount: 0,
    taxableValue: 0.0,
    taxLiability: 0.0,
    badgeColor: 'bg-secondary/15 text-secondary'
  },
  {
    returnType: 'GSTR-3B (Summary Return)',
    period: 'Current Tax Period',
    dueDate: '20th of next month',
    status: 'Ready',
    recordsCount: 0,
    taxableValue: 0.0,
    taxLiability: 0.0,
    badgeColor: 'bg-primary/15 text-primary'
  },
  {
    returnType: 'GSTR-2B (Auto-drafted ITC)',
    period: 'Current Tax Period',
    dueDate: '14th of next month',
    status: 'Synchronized',
    recordsCount: 0,
    taxableValue: 0.0,
    taxLiability: 0.0,
    badgeColor: 'bg-tertiary-fixed text-on-tertiary-fixed'
  }
];

export const INITIAL_GSTR1_RECORDS: Gstr1Record[] = [];

export const INITIAL_GSTR1_VALIDATION: Gstr1ValidationSummary = {
  validRecords: 0,
  warnings: 0,
  errors: 0,
  missingGstin: 0,
  invalidGstRate: 0,
  taxMismatch: 0,
  duplicateInvoice: 0
};

export const INITIAL_GSTR3B_OUTWARD: Gstr3bSupplyItem[] = [
  {
    id: 'out-1',
    code: '3.1(a)',
    nature: '(a) Outward taxable supplies (other than zero rated, nil rated and exempted)',
    taxableValue: 0,
    igst: 0,
    cgst: 0,
    sgst: 0,
    cess: 0
  },
  {
    id: 'out-2',
    code: '3.1(b)',
    nature: '(b) Outward taxable supplies (zero rated)',
    taxableValue: 0,
    igst: 0,
    cgst: 0,
    sgst: 0,
    cess: 0
  },
  {
    id: 'out-3',
    code: '3.1(c)',
    nature: '(c) Other outward supplies (Nil rated, exempted)',
    taxableValue: 0,
    igst: 0,
    cgst: 0,
    sgst: 0,
    cess: 0
  },
  {
    id: 'out-4',
    code: '3.1(d)',
    nature: '(d) Inward supplies (liable to reverse charge)',
    taxableValue: 0,
    igst: 0,
    cgst: 0,
    sgst: 0,
    cess: 0
  },
  {
    id: 'out-5',
    code: '3.1(e)',
    nature: '(e) Non-GST outward supplies',
    taxableValue: 0,
    igst: 0,
    cgst: 0,
    sgst: 0,
    cess: 0
  }
];

export const INITIAL_GSTR3B_ITC: Gstr3bItcItem[] = [
  {
    id: 'itc-1',
    code: '4(A)(1)',
    details: '(1) Import of goods',
    igst: 0,
    cgst: 0,
    sgst: 0,
    cess: 0
  },
  {
    id: 'itc-2',
    code: '4(A)(2)',
    details: '(2) Import of services',
    igst: 0,
    cgst: 0,
    sgst: 0,
    cess: 0
  },
  {
    id: 'itc-3',
    code: '4(A)(3)',
    details: '(3) Inward supplies liable to reverse charge',
    igst: 0,
    cgst: 0,
    sgst: 0,
    cess: 0
  },
  {
    id: 'itc-4',
    code: '4(A)(4)',
    details: '(4) Inward supplies from ISD',
    igst: 0,
    cgst: 0,
    sgst: 0,
    cess: 0
  },
  {
    id: 'itc-5',
    code: '4(A)(5)',
    details: '(5) All other ITC (Domestic standard inward purchases)',
    igst: 0,
    cgst: 0,
    sgst: 0,
    cess: 0
  }
];

export const GSTR3B_SUPPLIES = INITIAL_GSTR3B_OUTWARD;
export const GSTR3B_ITC = INITIAL_GSTR3B_ITC;

export const INITIAL_HSN_RECORDS: HsnTaxRecord[] = [];

// =========================================================================
// REPORTS & BI CLEAN DATA
// =========================================================================

export const INITIAL_SALES_REPORT_ROWS: SalesReportRow[] = [];
export const INITIAL_SALES_REPORTS: SalesReportRow[] = INITIAL_SALES_REPORT_ROWS;
export const SALES_DASHBOARD_CARDS = {
  grossSales: 0,
  netSales: 0,
  gstCollected: 0,
  ordersCount: 0,
  discounts: 0,
  returns: 0,
  gst: 0,
  collection: 0,
  creditSales: 0
};

export const INITIAL_PURCHASE_REPORT_ROWS: PurchaseReportRow[] = [];
export const INITIAL_PURCHASE_REPORTS: PurchaseReportRow[] = INITIAL_PURCHASE_REPORT_ROWS;
export const PURCHASE_KPIS = {
  totalPurchases: 0,
  totalPurchase: 0,
  purchaseReturns: 0,
  tax: 0,
  netPurchase: 0,
  paid: 0,
  outstanding: 0,
  netPayables: 0,
  itcAvailable: 0,
  poCount: 0
};
export const PURCHASE_DASHBOARD_CARDS = PURCHASE_KPIS;

export const INITIAL_INVENTORY_REPORT_ROWS: InventoryReportRow[] = [];
export const INITIAL_INVENTORY_REPORTS: InventoryReportRow[] = INITIAL_INVENTORY_REPORT_ROWS;
export const INVENTORY_DASHBOARD_CARDS = { totalValuation: 0, lowStockCount: 0, deadStockValuation: 0, turnoverRatio: 0 };

export const INITIAL_PROFITABILITY_ROWS: ProfitabilityRow[] = [];
export const INITIAL_PROFITABILITY_ITEMS: ProfitabilityRow[] = INITIAL_PROFITABILITY_ROWS;
export const PROFITABILITY_SUMMARY = {
  grossSales: 0,
  cogs: 0,
  grossProfit: 0,
  grossMarginPct: 0,
  discounts: 0,
  netMarginPct: 0,
  directExpenses: 0
};
export const PROFITABILITY_CARDS = PROFITABILITY_SUMMARY;

export const INITIAL_FINANCIAL_REPORT_ROWS: FinancialReportRow[] = [];
export const INITIAL_FINANCIAL_REPORTS: FinancialReportRow[] = INITIAL_FINANCIAL_REPORT_ROWS;
export const FINANCIAL_DASHBOARD_CARDS = { totalReceivables: 0, totalPayables: 0, netCashBalance: 0, ledgerMismatch: 0 };

export const TRIAL_BALANCE_ITEMS: any[] = [];

export const INITIAL_BUSINESS_INSIGHTS: BusinessInsightItem[] = [];

export const SAMPLE_REPORT_DRAWER_DATA: Record<string, ReportDetailData> = {};

