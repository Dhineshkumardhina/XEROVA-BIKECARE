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
// GST MODULE MOCK DATA
// =========================================================================

export const GST_DASHBOARD_KPIS = {
  currentMonth: {
    periodName: 'October 2024',
    taxableSales: 2480450.0,
    outputGst: 446481.0,
    cgstOutput: 223240.5,
    sgstOutput: 223240.5,
    igstOutput: 0.0,
    taxablePurchases: 1840200.0,
    inputGst: 331236.0,
    cgstInput: 165618.0,
    sgstInput: 165618.0,
    igstInput: 0.0,
    netGstPayable: 115245.0,
    totalTransactions: 284,
    b2bCount: 46,
    b2cCount: 238,
    itcEligiblePct: 98.4
  },
  previousMonth: {
    periodName: 'September 2024',
    taxableSales: 2160300.0,
    outputGst: 388854.0,
    taxablePurchases: 1620000.0,
    inputGst: 291600.0,
    netGstPayable: 97254.0,
    totalTransactions: 251
  },
  quarter: {
    periodName: 'Q2 (Jul - Sep 2024)',
    taxableSales: 6420100.0,
    outputGst: 1155618.0,
    taxablePurchases: 4890000.0,
    inputGst: 880200.0,
    netGstPayable: 275418.0,
    totalTransactions: 742
  },
  financialYear: {
    periodName: 'FY 2024-25 (Apr - Oct)',
    taxableSales: 15420000.0,
    outputGst: 2775600.0,
    taxablePurchases: 11840000.0,
    inputGst: 2131200.0,
    netGstPayable: 644400.0,
    totalTransactions: 1860
  }
};

export const GST_TREND_DATA = [
  { month: 'May 24', salesTaxable: 2050000, outputGst: 369000, purchaseTaxable: 1520000, inputGst: 273600, netPayable: 95400 },
  { month: 'Jun 24', salesTaxable: 2210000, outputGst: 397800, purchaseTaxable: 1680000, inputGst: 302400, netPayable: 95400 },
  { month: 'Jul 24', salesTaxable: 2100000, outputGst: 378000, purchaseTaxable: 1590000, inputGst: 286200, netPayable: 91800 },
  { month: 'Aug 24', salesTaxable: 2160000, outputGst: 388800, purchaseTaxable: 1680000, inputGst: 302400, netPayable: 86400 },
  { month: 'Sep 24', salesTaxable: 2160300, outputGst: 388854, purchaseTaxable: 1620000, inputGst: 291600, netPayable: 97254 },
  { month: 'Oct 24', salesTaxable: 2480450, outputGst: 446481, purchaseTaxable: 1840200, inputGst: 331236, netPayable: 115245 }
];

export const GST_FILING_STATUSES = [
  {
    returnType: 'GSTR-1 (Outward Supplies)',
    period: 'October 2024',
    dueDate: '11 Nov 2024',
    status: 'Ready to File',
    recordsCount: 284,
    taxableValue: 2480450.0,
    taxLiability: 446481.0,
    badgeColor: 'bg-secondary/15 text-secondary'
  },
  {
    returnType: 'GSTR-3B (Summary Return)',
    period: 'October 2024',
    dueDate: '20 Nov 2024',
    status: 'Draft Prepared',
    recordsCount: 284,
    taxableValue: 2480450.0,
    taxLiability: 115245.0, // net after ITC
    badgeColor: 'bg-primary/15 text-primary'
  },
  {
    returnType: 'GSTR-2B (Auto-drafted ITC)',
    period: 'October 2024',
    dueDate: '14 Nov 2024',
    status: 'Reconciled (98.4%)',
    recordsCount: 42,
    taxableValue: 1840200.0,
    taxLiability: 331236.0,
    badgeColor: 'bg-tertiary-fixed text-on-tertiary-fixed'
  },
  {
    returnType: 'GSTR-1 (Outward Supplies)',
    period: 'September 2024',
    dueDate: '11 Oct 2024',
    status: 'Filed & Acknowledged',
    recordsCount: 251,
    taxableValue: 2160300.0,
    taxLiability: 388854.0,
    badgeColor: 'bg-tertiary-fixed text-on-tertiary-fixed'
  },
  {
    returnType: 'GSTR-3B (Summary Return)',
    period: 'September 2024',
    dueDate: '20 Oct 2024',
    status: 'Filed & Paid (Cash ₹97k)',
    recordsCount: 251,
    taxableValue: 2160300.0,
    taxLiability: 97254.0,
    badgeColor: 'bg-tertiary-fixed text-on-tertiary-fixed'
  }
];

export const INITIAL_GSTR1_RECORDS: Gstr1Record[] = [
  {
    id: 'g1-01',
    section: 'b2b',
    invoiceNumber: 'INV-2024-8190',
    invoiceDate: '24-10-2024',
    customer: 'Sri Balaji Auto Works (Murugan)',
    gstin: '33AAAAA0000A1Z5',
    pos: '33-Tamil Nadu',
    reverseCharge: false,
    taxableValue: 7559.32,
    rate: 18,
    cgst: 680.34,
    sgst: 680.34,
    igst: 0,
    totalInvoiceValue: 8920.0,
    filingStatus: 'Ready',
    validationIssue: 'None',
    itemSummary: 'Splendor Brake Shoes (10), Fork Oil Seals (12)'
  },
  {
    id: 'g1-02',
    section: 'b2b',
    invoiceNumber: 'INV-2024-8182',
    invoiceDate: '23-10-2024',
    customer: 'Speedline Racing & Tuning Garage',
    gstin: '33AABCS1429B1Z2',
    pos: '33-Tamil Nadu',
    reverseCharge: false,
    taxableValue: 28400.0,
    rate: 18,
    cgst: 2556.0,
    sgst: 2556.0,
    igst: 0,
    totalInvoiceValue: 33512.0,
    filingStatus: 'Ready',
    validationIssue: 'None',
    itemSummary: 'Motul 7100 4T (20), Pulsar Chain Sprocket Kits (10)'
  },
  {
    id: 'g1-03',
    section: 'b2b',
    invoiceNumber: 'INV-2024-8175',
    invoiceDate: '22-10-2024',
    customer: 'Royal Riders Bullet Clinic',
    gstin: '33AACCR8891C1ZT',
    pos: '33-Tamil Nadu',
    reverseCharge: false,
    taxableValue: 32627.12,
    rate: 18,
    cgst: 2936.44,
    sgst: 2936.44,
    igst: 0,
    totalInvoiceValue: 38500.0,
    filingStatus: 'Ready',
    validationIssue: 'None',
    itemSummary: 'Classic 350 Clutch Plates, Front Brake Disc Pads'
  },
  {
    id: 'g1-04',
    section: 'b2b',
    invoiceNumber: 'INV-2024-8160',
    invoiceDate: '21-10-2024',
    customer: 'City Bike Care & Electric Point',
    gstin: '33AAECE9912K1Z9',
    pos: '33-Tamil Nadu',
    reverseCharge: false,
    taxableValue: 14200.0,
    rate: 28,
    cgst: 1988.0,
    sgst: 1988.0,
    igst: 0,
    totalInvoiceValue: 18176.0,
    filingStatus: 'Ready',
    validationIssue: 'None',
    itemSummary: 'Bosch Spark Plugs Super 4 (40), Exide 12V 5Ah Batteries'
  },
  {
    id: 'g1-05',
    section: 'b2b',
    invoiceNumber: 'INV-2024-8148',
    invoiceDate: '20-10-2024',
    customer: 'Jayram Two Wheeler Garage',
    gstin: '', // Intentional missing GSTIN for realistic validation
    pos: '33-Tamil Nadu',
    reverseCharge: false,
    taxableValue: 8400.0,
    rate: 18,
    cgst: 756.0,
    sgst: 756.0,
    igst: 0,
    totalInvoiceValue: 9912.0,
    filingStatus: 'Warning',
    validationIssue: 'Missing GSTIN',
    itemSummary: 'TVS Clutch Plates, Cables (Treated as B2CS if unrectified)'
  },
  {
    id: 'g1-06',
    section: 'b2b',
    invoiceNumber: 'INV-2024-8132',
    invoiceDate: '19-10-2024',
    customer: 'Maruthi Auto Spares Hub',
    gstin: '33BBPPM8812L1Z4',
    pos: '33-Tamil Nadu',
    reverseCharge: false,
    taxableValue: 18500.0,
    rate: 18,
    cgst: 1665.0,
    sgst: 1665.0,
    igst: 0,
    totalInvoiceValue: 21830.0,
    filingStatus: 'Ready',
    validationIssue: 'None',
    itemSummary: 'Apache RTR Disc Pads (15), Activa Drive Belts (20)'
  },
  {
    id: 'g1-07',
    section: 'b2cl',
    invoiceNumber: 'INV-2024-8120',
    invoiceDate: '18-10-2024',
    customer: 'Apex Motorsport Club (Interstate B2C)',
    gstin: 'URP (Unregistered)',
    pos: '29-Karnataka',
    reverseCharge: false,
    taxableValue: 260000.0,
    rate: 18,
    cgst: 0,
    sgst: 0,
    igst: 46800.0,
    totalInvoiceValue: 306800.0,
    filingStatus: 'Ready',
    validationIssue: 'None',
    itemSummary: 'Custom High-Performance Spares & Motul 300V Synthetic Drums'
  },
  {
    id: 'g1-08',
    section: 'b2cs',
    invoiceNumber: 'POS-OCT-SUMM-18',
    invoiceDate: '31-10-2024',
    customer: 'Counter Cash & UPI Retail Sales (18% Bucket)',
    gstin: 'URP (Retail Consumers)',
    pos: '33-Tamil Nadu',
    reverseCharge: false,
    taxableValue: 1650000.0,
    rate: 18,
    cgst: 148500.0,
    sgst: 148500.0,
    igst: 0,
    totalInvoiceValue: 1947000.0,
    filingStatus: 'Ready',
    validationIssue: 'None',
    itemSummary: 'Consolidated Counter Cash & GPay Invoices (210 Bills)'
  },
  {
    id: 'g1-09',
    section: 'b2cs',
    invoiceNumber: 'POS-OCT-SUMM-28',
    invoiceDate: '31-10-2024',
    customer: 'Counter Cash & UPI Retail Sales (28% Bucket)',
    gstin: 'URP (Retail Consumers)',
    pos: '33-Tamil Nadu',
    reverseCharge: false,
    taxableValue: 380000.0,
    rate: 28,
    cgst: 53200.0,
    sgst: 53200.0,
    igst: 0,
    totalInvoiceValue: 486400.0,
    filingStatus: 'Ready',
    validationIssue: 'None',
    itemSummary: 'Consolidated Batteries & Spark Plugs Counter Sales'
  },
  {
    id: 'g1-10',
    section: 'cdnr',
    invoiceNumber: 'CRN-2024-004',
    invoiceDate: '24-10-2024',
    customer: 'Sri Balaji Auto Works (Murugan)',
    gstin: '33AAAAA0000A1Z5',
    pos: '33-Tamil Nadu',
    reverseCharge: false,
    taxableValue: -2881.36,
    rate: 18,
    cgst: -259.32,
    sgst: -259.32,
    igst: 0,
    totalInvoiceValue: -3400.0,
    filingStatus: 'Ready',
    validationIssue: 'None',
    itemSummary: 'Sales Return: Defective Clutch Plates batch K608 (Against INV-8104)'
  },
  {
    id: 'g1-11',
    section: 'exp',
    invoiceNumber: 'EXP-2024-001',
    invoiceDate: '15-10-2024',
    customer: 'Lanka Spares Overseas FZE',
    gstin: 'EXPORT (Without Payment of Tax / LUT)',
    pos: '96-Foreign Country',
    reverseCharge: false,
    taxableValue: 125000.0,
    rate: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    totalInvoiceValue: 125000.0,
    filingStatus: 'Ready',
    validationIssue: 'None',
    itemSummary: 'Bajaj Boxer & Pulsar Spares Consignment (LUT No: LUT/2024/098)'
  },
  {
    id: 'g1-12',
    section: 'nil_exempt',
    invoiceNumber: 'NIL-OCT-01',
    invoiceDate: '20-10-2024',
    customer: 'Govt Polytechnic Workshop Division',
    gstin: 'URP',
    pos: '33-Tamil Nadu',
    reverseCharge: false,
    taxableValue: 18500.0,
    rate: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    totalInvoiceValue: 18500.0,
    filingStatus: 'Ready',
    validationIssue: 'None',
    itemSummary: 'Technical Training Manuals & Apprentice Workshop Charts (Exempt)'
  },
  {
    id: 'g1-13',
    section: 'b2b',
    invoiceNumber: 'INV-2024-8111',
    invoiceDate: '16-10-2024',
    customer: 'Vasanth Motors (Tax Mismatch Flag)',
    gstin: '33DDJJK1928F1Z8',
    pos: '33-Tamil Nadu',
    reverseCharge: false,
    taxableValue: 6000.0,
    rate: 18,
    cgst: 540.0,
    sgst: 530.0, // Intentional mismatch: 540 vs 530
    igst: 0,
    totalInvoiceValue: 7070.0,
    filingStatus: 'Error',
    validationIssue: 'Tax Mismatch',
    itemSummary: 'Splendor Camshaft & Valve Set (CGST ₹540 != SGST ₹530)'
  }
];

export const INITIAL_GSTR1_VALIDATION: Gstr1ValidationSummary = {
  validRecords: 281,
  warnings: 2,
  errors: 1,
  missingGstin: 1,
  invalidGstRate: 0,
  taxMismatch: 1,
  duplicateInvoice: 0
};

// =========================================================================
// GSTR-3B TABLE 3.1 & TABLE 4 DATA
// =========================================================================

export const GSTR3B_SUPPLIES: Gstr3bSupplyItem[] = [
  {
    id: '3.1.a',
    nature: 'Outward taxable supplies (other than zero rated, nil rated and exempted)',
    code: '3.1 (a)',
    taxableValue: 2461950.0,
    igst: 46800.0,
    cgst: 199840.5,
    sgst: 199840.5,
    cess: 0
  },
  {
    id: '3.1.b',
    nature: 'Outward taxable supplies (zero rated - Exports / SEZ)',
    code: '3.1 (b)',
    taxableValue: 125000.0,
    igst: 0,
    cgst: 0,
    sgst: 0,
    cess: 0
  },
  {
    id: '3.1.c',
    nature: 'Other outward supplies (Nil rated, exempted)',
    code: '3.1 (c)',
    taxableValue: 18500.0,
    igst: 0,
    cgst: 0,
    sgst: 0,
    cess: 0
  },
  {
    id: '3.1.d',
    nature: 'Inward supplies liable to reverse charge (GTA Freight / Legal)',
    code: '3.1 (d)',
    taxableValue: 12000.0,
    igst: 0,
    cgst: 300.0,
    sgst: 300.0,
    cess: 0
  },
  {
    id: '3.1.e',
    nature: 'Non-GST outward supplies',
    code: '3.1 (e)',
    taxableValue: 0.0,
    igst: 0,
    cgst: 0,
    sgst: 0,
    cess: 0
  }
];

export const GSTR3B_ITC: Gstr3bItcItem[] = [
  {
    id: '4.a.1',
    details: 'Import of goods',
    code: '4 (A) (1)',
    igst: 0,
    cgst: 0,
    sgst: 0,
    cess: 0
  },
  {
    id: '4.a.2',
    details: 'Import of services',
    code: '4 (A) (2)',
    igst: 0,
    cgst: 0,
    sgst: 0,
    cess: 0
  },
  {
    id: '4.a.3',
    details: 'Inward supplies liable to reverse charge (Freight GTA)',
    code: '4 (A) (3)',
    igst: 0,
    cgst: 300.0,
    sgst: 300.0,
    cess: 0
  },
  {
    id: '4.a.4',
    details: 'Inward supplies from ISD',
    code: '4 (A) (4)',
    igst: 0,
    cgst: 0,
    sgst: 0,
    cess: 0
  },
  {
    id: '4.a.5',
    details: 'All other ITC (Spares purchases from TVS, Bajaj, Motul, Rolon)',
    code: '4 (A) (5)',
    igst: 0,
    cgst: 165318.0,
    sgst: 165318.0,
    cess: 0
  },
  {
    id: '4.b.1',
    details: 'ITC Reversed - As per Rule 42 & 43 of CGST Rules',
    code: '4 (B) (1)',
    igst: 0,
    cgst: -850.0,
    sgst: -850.0,
    cess: 0
  }
];

// =========================================================================
// HSN SUMMARY REPORT DATA
// =========================================================================

export const INITIAL_HSN_RECORDS: HsnTaxRecord[] = [
  {
    id: 'hsn-1',
    hsn: '8714',
    itemName: 'Parts & Accessories of Motorcycles (Clutch, Brakes, Cables, Chains)',
    description: 'Motorcycle transmission and chassis assemblies',
    uqc: 'PCS',
    quantity: 1420,
    taxableValue: 1420500.0,
    gstRate: 18,
    cgst: 127845.0,
    sgst: 127845.0,
    igst: 12400.0,
    totalTax: 268090.0
  },
  {
    id: 'hsn-2',
    hsn: '2710',
    itemName: 'Petroleum Lubricating Oils (Motul 7100, Castrol, Yamalube 4T)',
    description: 'Full synthetic & semi-synthetic engine oils',
    uqc: 'BTL',
    quantity: 680,
    taxableValue: 489600.0,
    gstRate: 18,
    cgst: 44064.0,
    sgst: 44064.0,
    igst: 0,
    totalTax: 88128.0
  },
  {
    id: 'hsn-3',
    hsn: '8511',
    itemName: 'Electrical Ignition Equipment (Spark Plugs, CDI Units, Ignition Coils)',
    description: 'Spark plugs & electrical sensors',
    uqc: 'PCS',
    quantity: 540,
    taxableValue: 248000.0,
    gstRate: 28,
    cgst: 34720.0,
    sgst: 34720.0,
    igst: 0,
    totalTax: 69440.0
  },
  {
    id: 'hsn-4',
    hsn: '8487',
    itemName: 'Machinery Parts Not Elsewhere Specified (Fork Oil Seals, Wheel Bearings)',
    description: 'NBR front fork seals & rubber components',
    uqc: 'PRS',
    quantity: 380,
    taxableValue: 84200.0,
    gstRate: 18,
    cgst: 7578.0,
    sgst: 7578.0,
    igst: 0,
    totalTax: 15156.0
  },
  {
    id: 'hsn-5',
    hsn: '8507',
    itemName: 'Lead-Acid Motorcycle Batteries (Exide 12V 5Ah, Amaron Pro Bike)',
    description: 'Maintenance-free MF motorcycle storage batteries',
    uqc: 'PCS',
    quantity: 65,
    taxableValue: 132000.0,
    gstRate: 28,
    cgst: 18480.0,
    sgst: 18480.0,
    igst: 0,
    totalTax: 36960.0
  },
  {
    id: 'hsn-6',
    hsn: '4016',
    itemName: 'Vulcanised Rubber Articles (Engine Gaskets, Fuel Pipes, Intake Manifold)',
    description: 'Synthetic rubber oil pipes and sealing rings',
    uqc: 'PCS',
    quantity: 210,
    taxableValue: 34150.0,
    gstRate: 18,
    cgst: 3073.5,
    sgst: 3073.5,
    igst: 0,
    totalTax: 6147.0
  },
  {
    id: 'hsn-7',
    hsn: '8409',
    itemName: 'Internal Combustion Engine Spares (Cylinders, Pistons, Piston Rings)',
    description: 'Alloy cylinders and piston ring assemblies',
    uqc: 'SET',
    quantity: 45,
    taxableValue: 72000.0,
    gstRate: 28,
    cgst: 10080.0,
    sgst: 10080.0,
    igst: 0,
    totalTax: 20160.0
  }
];

// =========================================================================
// SALES REPORTS DATA
// =========================================================================

export const INITIAL_SALES_REPORTS: SalesReportRow[] = [
  {
    id: 'sr-101',
    date: '24-10-2024',
    invoiceNo: 'INV-10291',
    customer: 'Suresh Babu',
    customerType: 'B2C Retail',
    itemSummary: 'Clutch Plate Set, Cable, Motul Oil',
    category: 'Clutch & Transmission',
    brand: 'TVS Genuine',
    qty: 4,
    salesperson: 'Rajesh Kumar',
    payMode: 'UPI',
    grossSales: 2450.0,
    discount: 0,
    returnAmount: 0,
    netSales: 2450.0,
    cgst: 186.86,
    sgst: 186.86,
    igst: 0,
    totalGst: 373.72,
    totalAmount: 2450.0,
    status: 'PAID'
  },
  {
    id: 'sr-102',
    date: '24-10-2024',
    invoiceNo: 'INV-10290',
    customer: 'Sri Balaji Auto Works',
    customerType: 'B2B Garage',
    itemSummary: 'Splendor Brake Shoes (10), Fork Seals (12)',
    category: 'Braking Systems',
    brand: 'Endurance OEM',
    qty: 22,
    salesperson: 'Rajesh Kumar',
    payMode: 'Credit Ledger',
    grossSales: 8970.0,
    discount: 50.0,
    returnAmount: 0,
    netSales: 8920.0,
    cgst: 680.34,
    sgst: 680.34,
    igst: 0,
    totalGst: 1360.68,
    totalAmount: 8920.0,
    creditOutstanding: 8920.0,
    status: 'CREDIT'
  },
  {
    id: 'sr-103',
    date: '24-10-2024',
    invoiceNo: 'INV-10289',
    customer: 'Karthik Raja',
    customerType: 'B2C Retail',
    itemSummary: 'Rolon Chain & Sprocket Kit Heavy Duty',
    category: 'Clutch & Transmission',
    brand: 'Rolon',
    qty: 1,
    salesperson: 'Kavitha S.',
    payMode: 'Cash',
    grossSales: 940.0,
    discount: 0,
    returnAmount: 0,
    netSales: 940.0,
    cgst: 71.69,
    sgst: 71.69,
    igst: 0,
    totalGst: 143.38,
    totalAmount: 940.0,
    status: 'PAID'
  },
  {
    id: 'sr-104',
    date: '23-10-2024',
    invoiceNo: 'INV-10285',
    customer: 'Speedline Racing & Tuning Garage',
    customerType: 'B2B Garage',
    itemSummary: 'Motul 7100 4T (15), NGK Iridium Plugs (10)',
    category: 'Oils & Fluids',
    brand: 'Motul',
    qty: 25,
    salesperson: 'Rajesh Kumar',
    payMode: 'Credit Ledger',
    grossSales: 18450.0,
    discount: 250.0,
    returnAmount: 0,
    netSales: 18200.0,
    cgst: 1388.13,
    sgst: 1388.13,
    igst: 0,
    totalGst: 2776.26,
    totalAmount: 18200.0,
    creditOutstanding: 18200.0,
    status: 'CREDIT'
  },
  {
    id: 'sr-105',
    date: '23-10-2024',
    invoiceNo: 'INV-10280',
    customer: 'Vignesh M. (Mechanic)',
    customerType: 'Mechanic',
    itemSummary: 'Pulsar Front Fork Oil & Gasket Kit',
    category: 'Oils & Fluids',
    brand: 'Bajaj Genuine',
    qty: 3,
    salesperson: 'Kavitha S.',
    payMode: 'UPI',
    grossSales: 680.0,
    discount: 30.0,
    returnAmount: 0,
    netSales: 650.0,
    cgst: 49.57,
    sgst: 49.57,
    igst: 0,
    totalGst: 99.14,
    totalAmount: 650.0,
    status: 'PAID'
  },
  {
    id: 'sr-106',
    date: '22-10-2024',
    invoiceNo: 'INV-10272',
    customer: 'Murugesan Walk-in',
    customerType: 'B2C Retail',
    itemSummary: 'Exide 12V 5Ah Maintenance Free Battery',
    category: 'Electricals & Ignition',
    brand: 'Exide',
    qty: 1,
    salesperson: 'Kavitha S.',
    payMode: 'Card',
    grossSales: 1680.0,
    discount: 50.0,
    returnAmount: 0,
    netSales: 1630.0,
    cgst: 178.28,
    sgst: 178.28,
    igst: 0,
    totalGst: 356.56,
    totalAmount: 1630.0,
    status: 'PAID'
  },
  {
    id: 'sr-107',
    date: '21-10-2024',
    invoiceNo: 'RET-2024-009',
    customer: 'Royal Riders Bullet Clinic',
    customerType: 'B2B Garage',
    itemSummary: 'Sales Return: Royal Enfield Disc Pad Mismatch',
    category: 'Braking Systems',
    brand: 'Endurance OEM',
    qty: -2,
    salesperson: 'Rajesh Kumar',
    payMode: 'Credit Ledger',
    grossSales: -1420.0,
    discount: 0,
    returnAmount: 1420.0,
    netSales: -1420.0,
    cgst: -108.30,
    sgst: -108.30,
    igst: 0,
    totalGst: -216.60,
    totalAmount: -1420.0,
    status: 'RETURNED'
  }
];

export const SALES_DASHBOARD_CARDS = {
  grossSales: 2548200.0,
  discounts: 42150.0,
  returns: 25600.0,
  netSales: 2480450.0,
  gst: 446481.0,
  collection: 1795050.0,
  creditSales: 685400.0
};

// =========================================================================
// PURCHASE REPORTS DATA
// =========================================================================

export const INITIAL_PURCHASE_REPORTS: PurchaseReportRow[] = [
  {
    id: 'pr-201',
    date: '23-10-2024',
    poNo: 'PO-8412',
    supplierInvoiceNo: 'SUP-BAJ-99120',
    supplier: 'Bajaj Auto Genuine Spares Ltd',
    supplierGstin: '33AABCB0012A1Z1',
    itemSummary: 'Pulsar Clutch Plates (50), Disc Pads (30)',
    category: 'Clutch & Transmission',
    brand: 'Bajaj Genuine',
    qty: 80,
    taxableValue: 40847.46,
    tax: 7352.54,
    netPurchase: 48200.0,
    paid: 48200.0,
    outstanding: 0,
    payMode: 'NEFT Bank',
    status: 'PAID'
  },
  {
    id: 'pr-202',
    date: '22-10-2024',
    poNo: 'PO-8413',
    supplierInvoiceNo: 'TVS-INV-44102',
    supplier: 'TVS Motor Spares Regional Hub',
    supplierGstin: '33AAACT8819F1Z3',
    itemSummary: 'Apache Front Fork Oil, Gaskets, Cables',
    category: 'Cables & Controls',
    brand: 'TVS Genuine',
    qty: 120,
    taxableValue: 28898.30,
    tax: 5201.70,
    netPurchase: 34100.0,
    paid: 15000.0,
    outstanding: 19100.0,
    payMode: 'Cheque',
    status: 'PENDING'
  },
  {
    id: 'pr-203',
    date: '21-10-2024',
    poNo: 'PO-8414',
    supplierInvoiceNo: 'ROL-8812-BLR',
    supplier: 'Rolon Transmission Chains Corp',
    supplierGstin: '29AABCR4419K1ZV',
    itemSummary: 'Drive Chain Sprocket Kits Splendor/Pulsar (40)',
    category: 'Clutch & Transmission',
    brand: 'Rolon',
    qty: 40,
    taxableValue: 24237.29,
    tax: 4362.71,
    netPurchase: 28600.0,
    paid: 28600.0,
    outstanding: 0,
    payMode: 'RTGS',
    status: 'PAID'
  },
  {
    id: 'pr-204',
    date: '19-10-2024',
    poNo: 'PO-8410',
    supplierInvoiceNo: 'MOT-77120',
    supplier: 'Motul India Lubricants Regional',
    supplierGstin: '33AABCM1918J1Z6',
    itemSummary: 'Motul 7100 4T 10W-50 Drums & 1L Bottles (60)',
    category: 'Oils & Fluids',
    brand: 'Motul',
    qty: 60,
    taxableValue: 38400.0,
    tax: 6912.0,
    netPurchase: 45312.0,
    paid: 20000.0,
    outstanding: 25312.0,
    payMode: 'NEFT',
    status: 'PENDING'
  },
  {
    id: 'pr-205',
    date: '18-10-2024',
    poNo: 'PO-8408',
    supplierInvoiceNo: 'EXD-CHN-1102',
    supplier: 'Exide Industries Warehouse Depot',
    supplierGstin: '33AABCE4412P1ZF',
    itemSummary: 'Exide 12V 2.5Ah & 5Ah MF Batteries (25)',
    category: 'Electricals & Ignition',
    brand: 'Exide',
    qty: 25,
    taxableValue: 26000.0,
    tax: 7280.0,
    netPurchase: 33280.0,
    paid: 33280.0,
    outstanding: 0,
    payMode: 'NEFT',
    status: 'PAID'
  }
];

export const PURCHASE_KPIS = {
  totalPurchase: 1840200.0,
  purchaseReturns: 14800.0,
  tax: 331236.0,
  netPurchase: 1825400.0,
  paid: 1639200.0,
  outstanding: 186200.0
};

// =========================================================================
// INVENTORY REPORTS & STOCK VALUATION DATA
// =========================================================================

export const INITIAL_INVENTORY_REPORTS: InventoryReportRow[] = [
  {
    id: 'ir-1',
    sku: 'SKU-1302',
    name: 'TVS Genuine Clutch Plate Set (5 Plates)',
    oemCode: 'K6080230',
    brand: 'Endurance OEM',
    category: 'Clutch & Transmission',
    rackBin: 'B-04-T2',
    quantity: 18,
    unit: 'Pcs',
    purchaseRate: 540.0,
    sellingRate: 720.0,
    mrp: 850.0,
    stockValue: 9720.0,
    reorderLevel: 15,
    movementStatus: 'Fast Moving',
    daysInStock: 6,
    lastSoldDate: '24-10-2024'
  },
  {
    id: 'ir-2',
    sku: 'SKU-0891',
    name: 'Motul 7100 4T 10W-50 Fully Synthetic (1L)',
    oemCode: 'MOT-7100-1L',
    brand: 'Motul',
    category: 'Oils & Fluids',
    rackBin: 'OIL-01',
    quantity: 45,
    unit: 'Btls',
    purchaseRate: 640.0,
    sellingRate: 820.0,
    mrp: 925.0,
    stockValue: 28800.0,
    reorderLevel: 10,
    movementStatus: 'Fast Moving',
    daysInStock: 2,
    lastSoldDate: '24-10-2024'
  },
  {
    id: 'ir-3',
    sku: 'SKU-7710',
    name: 'Rolon Heavy Duty Chain & Sprocket Kit (Pulsar 150)',
    oemCode: 'ROL-P150-HD',
    brand: 'Rolon',
    category: 'Clutch & Transmission',
    rackBin: 'D-01-B3',
    quantity: 7,
    unit: 'Sets',
    purchaseRate: 840.0,
    sellingRate: 1120.0,
    mrp: 1280.0,
    stockValue: 5880.0,
    reorderLevel: 10,
    movementStatus: 'Low Stock',
    daysInStock: 4,
    lastSoldDate: '24-10-2024'
  },
  {
    id: 'ir-4',
    sku: 'SKU-5501',
    name: 'Front Fork Oil Seal 31mm (Pair)',
    oemCode: 'FOS-31MM-PR',
    brand: 'Bajaj Genuine',
    category: 'Oils & Fluids',
    rackBin: 'C-02-F1',
    quantity: 32,
    unit: 'Prs',
    purchaseRate: 70.0,
    sellingRate: 120.0,
    mrp: 150.0,
    stockValue: 2240.0,
    reorderLevel: 15,
    movementStatus: 'Normal',
    daysInStock: 12,
    lastSoldDate: '24-10-2024'
  },
  {
    id: 'ir-5',
    sku: 'SKU-9902',
    name: 'Karizma R Headlight Fairing Cowl (Black OEM)',
    oemCode: 'HMC-KZ-COWL',
    brand: 'Hero Genuine',
    category: 'Body & Chassis',
    rackBin: 'E-09-T1',
    quantity: 4,
    unit: 'Pcs',
    purchaseRate: 1850.0,
    sellingRate: 2450.0,
    mrp: 2750.0,
    stockValue: 7400.0,
    reorderLevel: 2,
    movementStatus: 'Dead Stock',
    daysInStock: 214,
    lastSoldDate: '12-03-2024'
  },
  {
    id: 'ir-6',
    sku: 'SKU-4419',
    name: 'TVS Apache Rear Disc Brake Pads Endurance',
    oemCode: 'K9090120',
    brand: 'Endurance OEM',
    category: 'Braking Systems',
    rackBin: 'B-02-P4',
    quantity: 0,
    unit: 'Sets',
    purchaseRate: 280.0,
    sellingRate: 420.0,
    mrp: 490.0,
    stockValue: 0.0,
    reorderLevel: 8,
    movementStatus: 'Out of Stock',
    daysInStock: 0,
    lastSoldDate: '23-10-2024'
  },
  {
    id: 'ir-7',
    sku: 'SKU-3120',
    name: 'Bosch Spark Plug Super 4 W8DC (Box of 10)',
    oemCode: 'BSH-W8DC-10',
    brand: 'Bosch',
    category: 'Electricals & Ignition',
    rackBin: 'A-01-S3',
    quantity: 28,
    unit: 'Pcs',
    purchaseRate: 95.0,
    sellingRate: 150.0,
    mrp: 180.0,
    stockValue: 2660.0,
    reorderLevel: 15,
    movementStatus: 'Fast Moving',
    daysInStock: 5,
    lastSoldDate: '24-10-2024'
  }
];

// =========================================================================
// PROFITABILITY DATA
// =========================================================================

export const INITIAL_PROFITABILITY_ITEMS: ProfitabilityRow[] = [
  {
    id: 'p-01',
    itemOrInvoice: 'Motul 7100 4T 10W-50 Synthetic (1L)',
    sku: 'SKU-0891',
    category: 'Oils & Fluids',
    brand: 'Motul',
    customerOrParty: 'Multiple Walk-in & Garages',
    qtySold: 88,
    grossSales: 72160.0,
    discounts: 880.0,
    netSales: 71280.0,
    cogs: 56320.0,
    grossProfit: 14960.0,
    grossMarginPct: 21.0
  },
  {
    id: 'p-02',
    itemOrInvoice: 'TVS Genuine Clutch Plate Set (5 Plates)',
    sku: 'SKU-1302',
    category: 'Clutch & Transmission',
    brand: 'Endurance OEM',
    customerOrParty: 'Sri Balaji Auto & POS Counter',
    qtySold: 42,
    grossSales: 30240.0,
    discounts: 450.0,
    netSales: 29790.0,
    cogs: 22680.0,
    grossProfit: 7110.0,
    grossMarginPct: 23.9
  },
  {
    id: 'p-03',
    itemOrInvoice: 'Rolon Heavy Duty Chain & Sprocket Kit',
    sku: 'SKU-7710',
    category: 'Clutch & Transmission',
    brand: 'Rolon',
    customerOrParty: 'Counter Retail & Speedline Garage',
    qtySold: 26,
    grossSales: 29120.0,
    discounts: 260.0,
    netSales: 28860.0,
    cogs: 21840.0,
    grossProfit: 7020.0,
    grossMarginPct: 24.3
  },
  {
    id: 'p-04',
    itemOrInvoice: 'Splendor Brake Shoe Set Endurance',
    sku: 'SKU-6109',
    category: 'Braking Systems',
    brand: 'Endurance OEM',
    customerOrParty: 'Garages Bulk Wholesale',
    qtySold: 94,
    grossSales: 15040.0,
    discounts: 470.0,
    netSales: 14570.0,
    cogs: 9870.0,
    grossProfit: 4700.0,
    grossMarginPct: 32.3
  },
  {
    id: 'p-05',
    itemOrInvoice: 'Front Fork Oil Seal 31mm (Pair)',
    sku: 'SKU-5501',
    category: 'Oils & Fluids',
    brand: 'Bajaj Genuine',
    customerOrParty: 'Garages & Retail',
    qtySold: 65,
    grossSales: 7800.0,
    discounts: 130.0,
    netSales: 7670.0,
    cogs: 4550.0,
    grossProfit: 3120.0,
    grossMarginPct: 40.7
  },
  {
    id: 'p-06',
    itemOrInvoice: 'Exide 12V 5Ah Maintenance Free Battery',
    sku: 'SKU-8821',
    category: 'Electricals & Ignition',
    brand: 'Exide',
    customerOrParty: 'Retail Bike Owners',
    qtySold: 18,
    grossSales: 29340.0,
    discounts: 540.0,
    netSales: 28800.0,
    cogs: 26100.0,
    grossProfit: 2700.0,
    grossMarginPct: 9.4 // Low margin item
  }
];

export const PROFITABILITY_SUMMARY = {
  grossSales: 2480450.0,
  cogs: 1840200.0,
  grossProfit: 640250.0,
  grossMarginPct: 25.8,
  discounts: 42150.0,
  returns: 25600.0,
  additionalCharges: 8200.0
};

// =========================================================================
// FINANCIAL REPORTS (DAY BOOK, CASH BOOK, BANK BOOK, TRIAL BALANCE, P&L)
// =========================================================================

export const INITIAL_FINANCIAL_REPORTS: FinancialReportRow[] = [
  {
    id: 'fr-01',
    date: '24-10-2024',
    voucherType: 'Sales',
    voucherNo: 'INV-10291',
    particulars: 'To Counter Sales (Suresh Babu)',
    account: 'Sales Account (Domestic)',
    debit: 0,
    credit: 2450.0,
    balance: 2480450.0,
    refNo: 'UPI-GPAY-9941',
    notes: '4 items pos out'
  },
  {
    id: 'fr-02',
    date: '24-10-2024',
    voucherType: 'Receipt',
    voucherNo: 'REC-2024-001',
    particulars: 'From Sri Balaji Auto Works (Part Payment)',
    account: 'Cash-in-Hand (Counter 1)',
    debit: 15000.0,
    credit: 0,
    balance: 85400.0,
    refNo: 'CASH-REC',
    notes: 'Received by Rajesh'
  },
  {
    id: 'fr-03',
    date: '24-10-2024',
    voucherType: 'Payment',
    voucherNo: 'PAY-2024-001',
    particulars: 'To TVS Motor Spares Regional Hub',
    account: 'HDFC Current A/c - 50200012345',
    debit: 0,
    credit: 25000.0,
    balance: 403600.0,
    refNo: 'NEFT-TVS-4412',
    notes: 'Approved by Store Admin'
  },
  {
    id: 'fr-04',
    date: '24-10-2024',
    voucherType: 'Contra',
    voucherNo: 'CON-2024-012',
    particulars: 'Cash Deposit: Excess Counter Cash to Bank',
    account: 'HDFC Bank & Cash-in-Hand',
    debit: 30000.0,
    credit: 30000.0,
    balance: 433600.0,
    refNo: 'BANK-DEP-SLIP-412',
    notes: 'Counter float maintained at ₹20,000'
  },
  {
    id: 'fr-05',
    date: '23-10-2024',
    voucherType: 'Purchase',
    voucherNo: 'GRN-4420',
    particulars: 'By Bajaj Auto Genuine Spares Ltd',
    account: 'Purchase Account (Domestic 18%)',
    debit: 48200.0,
    credit: 0,
    balance: 1840200.0,
    refNo: 'PO-8412',
    notes: 'Goods received & verified in rack B-04'
  }
];

export const TRIAL_BALANCE_ITEMS = [
  { account: 'Capital Account (Proprietor)', debit: 0, credit: 1500000.0 },
  { account: 'Cash-in-Hand (Counter Drawers)', debit: 85400.0, credit: 0 },
  { account: 'HDFC Bank Current Account', debit: 428600.0, credit: 0 },
  { account: 'ICICI UPI Merchant Settlement A/c', debit: 62300.0, credit: 0 },
  { account: 'Sundry Debtors (Affiliated Garages)', debit: 342800.0, credit: 0 },
  { account: 'Sundry Creditors (Spares Distributors)', debit: 0, credit: 186200.0 },
  { account: 'Opening Stock (Spares Inventory)', debit: 1840000.0, credit: 0 },
  { account: 'Sales Account (Domestic)', debit: 0, credit: 2480450.0 },
  { account: 'Purchase Account (Domestic)', debit: 1840200.0, credit: 0 },
  { account: 'Output CGST Account', debit: 0, credit: 223240.5 },
  { account: 'Output SGST Account', debit: 0, credit: 223240.5 },
  { account: 'Input CGST Account', debit: 165618.0, credit: 0 },
  { account: 'Input SGST Account', debit: 165618.0, credit: 0 },
  { account: 'Freight & Cartage Inward', debit: 24500.0, credit: 0 },
  { account: 'Shop Electricity & Maintenance', debit: 18200.0, credit: 0 },
  { account: 'Staff Salaries (Operators & Packing)', debit: 45000.0, credit: 0 },
  { account: 'Discount Allowed to Garages', debit: 42150.0, credit: 0 }
];

// =========================================================================
// BUSINESS INTELLIGENCE & OPERATIONAL INSIGHTS
// =========================================================================

export const INITIAL_BUSINESS_INSIGHTS: BusinessInsightItem[] = [
  {
    id: 'bi-01',
    type: 'positive',
    category: 'Sales',
    title: 'Pre-Festival Servicing Surge (+14.8%)',
    metric: '₹24.80 Lakhs',
    change: '+14.8% vs Sep 2024',
    description: 'B2C counter revenue and affiliated garage orders grew by ₹3.20 Lakhs driven by Diwali vehicle servicing preparation.',
    actionLabel: 'View Sales Register',
    actionScreen: 'sales-reports'
  },
  {
    id: 'bi-02',
    type: 'positive',
    category: 'Inventory',
    title: 'Top Fast-Moving Velocity: Motul 7100 4T',
    metric: '88 Bottles Sold',
    change: 'Turnover: 2.1 days',
    description: 'Motul 7100 4T 10W-50 generated ₹72,160 with highest replenishment velocity. Only 45 bottles left in rack OIL-01.',
    actionLabel: 'Check Stock & Reorder',
    actionScreen: 'inventory-reports'
  },
  {
    id: 'bi-03',
    type: 'alert',
    category: 'Receivables',
    title: 'Overdue Credit Risk: Royal Riders Bullet Clinic',
    metric: '₹38,500.00 Overdue',
    change: '26 Days Past Terms',
    description: 'Garage credit limit exceeded. Account automatically placed on billing hold. Murugan received notice.',
    actionLabel: 'Open Garage Ledger',
    actionScreen: 'customer-ledgers'
  },
  {
    id: 'bi-04',
    type: 'warning',
    category: 'Inventory',
    title: 'Critical Stockout Risk: Pulsar Chain Kits',
    metric: '7 Kits Remaining',
    change: 'Stock runs out in 3.5 days',
    description: 'Rolon Heavy Duty Sprocket Kits selling 2.2 kits/day. Recommended replenishment: 25 kits immediately.',
    actionLabel: 'Create PO for Rolon',
    actionScreen: 'low-stock'
  },
  {
    id: 'bi-05',
    type: 'warning',
    category: 'Inventory',
    title: 'Dead Stock Alert: Karizma R Body Fairings',
    metric: '₹7,400 Locked Capital',
    change: '214 Days in Rack E-09',
    description: '4 units of OEM fairings unsold since March 2024. Consider clearance discount or returning to distributor.',
    actionLabel: 'View Dead Stock',
    actionScreen: 'inventory-reports'
  },
  {
    id: 'bi-06',
    type: 'info',
    category: 'Pricing',
    title: 'Distributor Price Hike Notice: Bajaj Pulsar Spares',
    metric: '+4.5% Cost Increase',
    change: 'Effective 01-Oct-2024',
    description: 'Bajaj revised wholesale invoice cost of clutch plates from ₹515 to ₹540. Counter selling rate recommended to rise from ₹720 to ₹745.',
    actionLabel: 'Review Margins',
    actionScreen: 'profitability-dashboard'
  },
  {
    id: 'bi-07',
    type: 'positive',
    category: 'Tax',
    title: 'October GSTR-1 Reconciliation Ready',
    metric: '98.9% Clean Records',
    change: '1 Missing GSTIN flag',
    description: '281 invoices validated cleanly for GSTR-1 export. Jayram Two Wheeler Garage GSTIN needs rectification before upload.',
    actionLabel: 'Open GSTR-1 Validator',
    actionScreen: 'gstr-1'
  }
];

// Sample detailed drawer data
export const SAMPLE_REPORT_DRAWER_DATA: Record<string, ReportDetailData> = {
  'INV-10291': {
    id: 'drw-01',
    type: 'Sale',
    title: 'Counter Retail Invoice Details',
    referenceNo: 'INV-10291',
    date: '24 Oct 2024, 11:24 AM',
    partyName: 'Suresh Babu',
    partyPhone: '+91 98401 99212',
    paymentMode: 'UPI (GPay)',
    status: 'PAID',
    taxableAmount: 2076.27,
    cgst: 186.86,
    sgst: 186.86,
    igst: 0,
    totalAmount: 2450.0,
    user: 'Rajesh Kumar (Counter 1)',
    timestamp: '2024-10-24 11:24:18 IST',
    items: [
      { name: 'TVS Genuine Clutch Plate Set', sku: 'SKU-1302', hsn: '8714', qty: 1, unitPrice: 720.0, gstRate: 18, total: 720.0 },
      { name: 'Accelerator Cable Assembly', sku: 'SKU-2019', hsn: '8714', qty: 1, unitPrice: 150.0, gstRate: 18, total: 150.0 },
      { name: 'Motul 7100 4T 10W-50 (1L)', sku: 'SKU-0891', hsn: '2710', qty: 1, unitPrice: 820.0, gstRate: 18, total: 820.0 },
      { name: 'Front Fork Oil Seal 31mm (Pair)', sku: 'SKU-5501', hsn: '8487', qty: 1, unitPrice: 120.0, gstRate: 18, total: 120.0 }
    ],
    auditHistory: [
      { timestamp: '24 Oct 2024, 11:24 AM', action: 'Invoice generated and tender settled via UPI', user: 'Rajesh Kumar' },
      { timestamp: '24 Oct 2024, 11:24 AM', action: 'Stock deducted from rack bins B-04, CAB-02, OIL-01, C-02', user: 'System Inventory Bot' },
      { timestamp: '24 Oct 2024, 11:25 AM', action: 'Thermal 80mm slip printed', user: 'Rajesh Kumar' }
    ],
    notes: 'Customer vehicle: Bajaj Pulsar 150 (TN-09-CB-4412)'
  },
  'INV-10290': {
    id: 'drw-02',
    type: 'GST',
    title: 'B2B Garage Tax Invoice & Ledger Post',
    referenceNo: 'INV-10290',
    date: '24 Oct 2024, 10:48 AM',
    partyName: 'Sri Balaji Auto Works (Murugan)',
    partyGstin: '33AAAAA0000A1Z5',
    partyPhone: '+91 98401 55667',
    paymentMode: 'Credit Ledger (15-Day Terms)',
    status: 'CREDIT POSTED',
    taxableAmount: 7559.32,
    cgst: 680.34,
    sgst: 680.34,
    igst: 0,
    totalAmount: 8920.0,
    user: 'Rajesh Kumar',
    timestamp: '2024-10-24 10:48:02 IST',
    items: [
      { name: 'Splendor Brake Shoe Endurance', sku: 'SKU-6109', hsn: '8714', qty: 10, unitPrice: 620.0, gstRate: 18, total: 7316.0 },
      { name: 'Front Fork Oil Seal 31mm (Pair)', sku: 'SKU-5501', hsn: '8487', qty: 12, unitPrice: 133.67, gstRate: 18, total: 1604.0 }
    ],
    auditHistory: [
      { timestamp: '24 Oct 2024, 10:48 AM', action: 'B2B invoice generated with e-Way and GST verification', user: 'Rajesh Kumar' },
      { timestamp: '24 Oct 2024, 10:48 AM', action: 'Posted to Customer Credit Ledger (#GB-21)', user: 'System Accounting' },
      { timestamp: '24 Oct 2024, 10:49 AM', action: 'WhatsApp invoice PDF delivered to 9840155667', user: 'API Bot' }
    ],
    notes: 'Mechanic Murugan signed delivery challan'
  }
};
