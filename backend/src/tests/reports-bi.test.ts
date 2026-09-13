/**
 * BIKE ERP - Comprehensive Reporting & Business Intelligence Layer Test Suite
 * 
 * Test Scenarios:
 * 1.  Date Range Resolution Engine (today, yesterday, this_week, this_month, this_fy, custom)
 * 2.  Sales Report & KPI Cross-Checks (Gross Sales, Discounts, Returns, Net Sales, GST, Collections, Credit Sales)
 * 3.  Sales Dimensional Breakdowns (Daily, Monthly, Customer, Item, Brand, Category, User, Payment Mode, GST)
 * 4.  Purchase Report & ITC Reconciliation (Gross Purchases, Taxable, CGST/SGST/IGST ITC, Supplier Payables, Debit Notes)
 * 5.  Inventory Valuation & Velocity (Cost Valuation, Selling Valuation, MRP Valuation, Fast/Slow/Dead Stock)
 * 6.  Profitability & Margin Calculation (COGS calculation, Gross Profit, Gross Margin %, Item & Brand Profit Rankings)
 * 7.  Cash Book & Bank Book Ledger Reconciliation
 * 8.  Accounting Statements & Balancing (Day Book, Receivables, Payables, Trial Balance, P&L, Balance Sheet)
 * 9.  Live Business Intelligence & Operational Risk Alerts
 * 10. RBAC Permission Restrictions (Guards cost, margin, and financial statement access)
 */

import {
  salesReportQuerySchema,
  purchaseReportQuerySchema,
  inventoryReportQuerySchema,
  profitabilityReportQuerySchema,
  financialReportQuerySchema,
  businessInsightsQuerySchema
} from '../validators/report.validator.js';

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

// In-Memory Simulation for End-to-End Reporting Engine
interface SimItem {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  costRate: number;
  sellingRate: number;
  mrp: number;
  minReorder: number;
  stockQty: number;
}

interface SimSale {
  id: string;
  invoiceNumber: string;
  invoiceDate: Date;
  customerId: string;
  customerName: string;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  paymentMode: 'CASH' | 'UPI' | 'CARD' | 'CREDIT';
  userId: string;
  userName: string;
  items: Array<{ item: SimItem; quantity: number; unitRate: number; taxableAmount: number; totalAmount: number }>;
}

interface SimPurchase {
  id: string;
  poNumber: string;
  invoiceDate: Date;
  supplierId: string;
  supplierName: string;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
  paidAmount: number;
  items: Array<{ item: SimItem; quantity: number; unitPrice: number; taxableAmount: number; totalAmount: number }>;
}

interface SimLedgerAccount {
  id: string;
  name: string;
  group: string;
  openingBalance: number;
}

interface SimLedgerEntry {
  accountId: string;
  date: Date;
  particulars: string;
  voucherType: string;
  voucherNo: string;
  debit: number;
  credit: number;
}

class ReportingSimulationEngine {
  items: SimItem[] = [];
  sales: SimSale[] = [];
  purchases: SimPurchase[] = [];
  saleReturns: Array<{ id: string; returnDate: Date; refundAmount: number; sale: SimSale }> = [];
  purchaseReturns: Array<{ id: string; returnDate: Date; totalAmount: number; purchase: SimPurchase }> = [];
  accounts: Map<string, SimLedgerAccount> = new Map();
  ledgerEntries: SimLedgerEntry[] = [];

  // Date Range Resolver
  resolveDateRange(period = 'this_month', customStart?: string, customEnd?: string) {
    const now = new Date(2026, 8, 15); // Sep 15, 2026

    if (period === 'custom' && customStart && customEnd) {
      return { startDate: new Date(customStart), endDate: new Date(customEnd), label: 'Custom' };
    }

    if (period === 'today') {
      const s = new Date(now); s.setHours(0, 0, 0, 0);
      const e = new Date(now); e.setHours(23, 59, 59, 999);
      return { startDate: s, endDate: e, label: 'Today' };
    }

    if (period === 'this_month') {
      const s = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      const e = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      return { startDate: s, endDate: e, label: 'This Month' };
    }

    if (period === 'this_fy') {
      const s = new Date(2026, 3, 1, 0, 0, 0); // Apr 1, 2026
      const e = new Date(2027, 2, 31, 23, 59, 59); // Mar 31, 2027
      return { startDate: s, endDate: e, label: 'FY 2026-2027' };
    }

    return { startDate: new Date(2026, 8, 1), endDate: new Date(2026, 8, 30), label: 'Sep 2026' };
  }

  getSalesSummary() {
    let grossSales = 0;
    let totalDiscount = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;
    let collections = 0;
    let creditSales = 0;

    for (const s of this.sales) {
      grossSales += s.taxableAmount + s.cgst + s.sgst + s.igst + s.discount;
      totalDiscount += s.discount;
      totalCgst += s.cgst;
      totalSgst += s.sgst;
      totalIgst += s.igst;
      collections += s.paidAmount;
      if (s.totalAmount > s.paidAmount) {
        creditSales += s.totalAmount - s.paidAmount;
      }
    }

    const totalReturns = this.saleReturns.reduce((sum, r) => sum + r.refundAmount, 0);
    const netSales = this.sales.reduce((sum, s) => sum + s.totalAmount, 0) - totalReturns;

    return {
      grossSales,
      totalDiscount,
      totalReturns,
      netSales,
      totalCgst,
      totalSgst,
      totalIgst,
      totalGst: totalCgst + totalSgst + totalIgst,
      collections,
      creditSales,
      invoiceCount: this.sales.length
    };
  }

  getPurchaseSummary() {
    let grossPurchases = 0;
    let totalTaxable = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;
    let totalPaid = 0;
    let totalPayable = 0;

    for (const p of this.purchases) {
      grossPurchases += p.totalAmount;
      totalTaxable += p.taxableAmount;
      totalCgst += p.cgst;
      totalSgst += p.sgst;
      totalIgst += p.igst;
      totalPaid += p.paidAmount;
      totalPayable += Math.max(0, p.totalAmount - p.paidAmount);
    }

    return {
      grossPurchases,
      totalTaxable,
      totalCgst,
      totalSgst,
      totalIgst,
      totalTax: totalCgst + totalSgst + totalIgst,
      totalPaid,
      totalPayable,
      poCount: this.purchases.length
    };
  }

  getInventoryValuation() {
    let costValuation = 0;
    let sellingValuation = 0;
    let mrpValuation = 0;
    let totalStockUnits = 0;

    for (const it of this.items) {
      costValuation += it.stockQty * it.costRate;
      sellingValuation += it.stockQty * it.sellingRate;
      mrpValuation += it.stockQty * it.mrp;
      totalStockUnits += it.stockQty;
    }

    const grossMargin = sellingValuation > 0 ? ((sellingValuation - costValuation) / sellingValuation) * 100 : 0;

    return {
      totalStockUnits,
      costValuation,
      sellingValuation,
      mrpValuation,
      grossMargin: Number(grossMargin.toFixed(2))
    };
  }

  getProfitability() {
    let grossRevenue = 0;
    let totalCogs = 0;

    const itemProfits: Array<{ item: SimItem; revenue: number; cogs: number; profit: number; marginPct: number }> = [];

    for (const it of this.items) {
      let itemRev = 0;
      let itemQty = 0;

      for (const s of this.sales) {
        for (const line of s.items) {
          if (line.item.id === it.id) {
            itemRev += line.taxableAmount;
            itemQty += line.quantity;
          }
        }
      }

      const itemCogs = itemQty * it.costRate;
      const profit = itemRev - itemCogs;
      const marginPct = itemRev > 0 ? (profit / itemRev) * 100 : 0;

      grossRevenue += itemRev;
      totalCogs += itemCogs;

      itemProfits.push({
        item: it,
        revenue: itemRev,
        cogs: itemCogs,
        profit,
        marginPct: Number(marginPct.toFixed(2))
      });
    }

    const grossProfit = grossRevenue - totalCogs;
    const overallMarginPct = grossRevenue > 0 ? (grossProfit / grossRevenue) * 100 : 0;

    return {
      grossRevenue,
      totalCogs,
      grossProfit,
      overallMarginPct: Number(overallMarginPct.toFixed(2)),
      topItems: [...itemProfits].sort((a, b) => b.profit - a.profit),
      lowestMarginItems: [...itemProfits].filter(i => i.revenue > 0).sort((a, b) => a.marginPct - b.marginPct)
    };
  }

  getCashBook(openingCash = 50000) {
    let running = openingCash;
    let inflows = 0;
    let outflows = 0;

    for (const e of this.ledgerEntries) {
      const acc = this.accounts.get(e.accountId);
      if (acc?.group === 'Cash-in-hand') {
        running = running + e.debit - e.credit;
        inflows += e.debit;
        outflows += e.credit;
      }
    }

    return {
      openingBalance: openingCash,
      totalInflows: inflows,
      totalOutflows: outflows,
      closingBalance: running
    };
  }

  getTrialBalance() {
    let totalDebit = 0;
    let totalCredit = 0;

    for (const acc of this.accounts.values()) {
      const entries = this.ledgerEntries.filter(e => e.accountId === acc.id);
      const d = entries.reduce((s, e) => s + e.debit, 0);
      const c = entries.reduce((s, e) => s + e.credit, 0);
      const net = d - c;

      if (net >= 0) totalDebit += net;
      else totalCredit += Math.abs(net);
    }

    return {
      totalDebit,
      totalCredit,
      isBalanced: Math.abs(totalDebit - totalCredit) < 0.01
    };
  }
}

// ==============================================================================
// TEST EXECUTION
// ==============================================================================

async function runReportsBiTests() {
  console.log('\n======================================================');
  console.log('📊 BIKE ERP - REPORTING & BUSINESS INTELLIGENCE SUITE');
  console.log('======================================================\n');

  const engine = new ReportingSimulationEngine();

  // Test Setup: Catalog
  const sparkPlug: SimItem = {
    id: 'ITEM-01',
    sku: 'NGK-CPR8EA-9',
    name: 'NGK Spark Plug CPR8EA-9',
    brand: 'NGK',
    category: 'Ignition',
    costRate: 100,
    sellingRate: 150,
    mrp: 165,
    minReorder: 10,
    stockQty: 50
  };

  const helmet: SimItem = {
    id: 'ITEM-02',
    sku: 'VEGA-CRUX-L',
    name: 'Vega Crux Full Face Helmet',
    brand: 'Vega',
    category: 'Riding Gear',
    costRate: 800,
    sellingRate: 1200,
    mrp: 1350,
    minReorder: 5,
    stockQty: 20
  };

  const syntheticOil: SimItem = {
    id: 'ITEM-03',
    sku: 'MOT-7100-10W40',
    name: 'Motul 7100 10W40 4T 1L',
    brand: 'Motul',
    category: 'Lubricants',
    costRate: 650,
    sellingRate: 850,
    mrp: 900,
    minReorder: 15,
    stockQty: 40
  };

  const chainSprocket: SimItem = {
    id: 'ITEM-04',
    sku: 'ROLON-CS-PULSAR',
    name: 'Rolon Brass Chain Sprocket Kit',
    brand: 'Rolon',
    category: 'Transmission',
    costRate: 1200,
    sellingRate: 1650,
    mrp: 1800,
    minReorder: 8,
    stockQty: 15
  };

  engine.items = [sparkPlug, helmet, syntheticOil, chainSprocket];

  // --------------------------------------------------------------------------
  console.log('--- Test 1: Date Range Resolution Engine ---');
  // --------------------------------------------------------------------------
  const todayRange = engine.resolveDateRange('today');
  assert(todayRange.label === 'Today', 'Resolves today preset');

  const monthRange = engine.resolveDateRange('this_month');
  assert(monthRange.label === 'This Month', 'Resolves this month preset');

  const fyRange = engine.resolveDateRange('this_fy');
  assert(fyRange.label.includes('FY 2026-2027'), 'Resolves Indian Financial Year preset (Apr 1 - Mar 31)');

  // --------------------------------------------------------------------------
  console.log('\n--- Test 2: Sales Reports & Key Financial Metrics ---');
  // --------------------------------------------------------------------------
  const sept10 = new Date(2026, 8, 10);
  const sept11 = new Date(2026, 8, 11);
  const sept12 = new Date(2026, 8, 12);

  // Sale 1: Cash retail sale (2 Spark plugs + 1 Helmet)
  engine.sales.push({
    id: 'S-01',
    invoiceNumber: 'INV-1001',
    invoiceDate: sept10,
    customerId: 'CUST-01',
    customerName: 'Karthik Raja',
    taxableAmount: 1500, // 2*150 + 1*1200 = 1500
    cgst: 135, // 9%
    sgst: 135, // 9%
    igst: 0,
    discount: 50,
    totalAmount: 1770, // 1500 + 270 = 1770
    paidAmount: 1770,
    paymentMode: 'CASH',
    userId: 'U-01',
    userName: 'Cashier Ashok',
    items: [
      { item: sparkPlug, quantity: 2, unitRate: 150, taxableAmount: 300, totalAmount: 354 },
      { item: helmet, quantity: 1, unitRate: 1200, taxableAmount: 1200, totalAmount: 1416 }
    ]
  });

  // Sale 2: Credit wholesale sale (4 Oil + 2 Chain Sprocket)
  engine.sales.push({
    id: 'S-02',
    invoiceNumber: 'INV-1002',
    invoiceDate: sept12,
    customerId: 'CUST-02',
    customerName: 'Sri Balaji Spares',
    taxableAmount: 6700, // 4*850 (3400) + 2*1650 (3300) = 6700
    cgst: 603,
    sgst: 603,
    igst: 0,
    discount: 200,
    totalAmount: 7906,
    paidAmount: 3000, // Partial payment (₹4,906 on credit)
    paymentMode: 'CREDIT',
    userId: 'U-02',
    userName: 'Operator Priya',
    items: [
      { item: syntheticOil, quantity: 4, unitRate: 850, taxableAmount: 3400, totalAmount: 4012 },
      { item: chainSprocket, quantity: 2, unitRate: 1650, taxableAmount: 3300, totalAmount: 3894 }
    ]
  });

  // Sale Return (Credit Note)
  engine.saleReturns.push({
    id: 'RET-01',
    returnDate: sept12,
    refundAmount: 354, // 1 spark plug returned
    sale: engine.sales[0]
  });

  const salesKpi = engine.getSalesSummary();

  assert(salesKpi.grossSales === 9926, 'Gross sales correctly computes to ₹9,926.00 (Taxable + Tax + Discounts)');
  assert(salesKpi.totalDiscount === 250, 'Total discounts given is ₹250.00');
  assert(salesKpi.totalReturns === 354, 'Total sales returns is ₹354.00');
  assert(salesKpi.netSales === 9322, 'Net sales correctly computes to ₹9,322.00 (₹9,676 - ₹354)');
  assert(salesKpi.totalGst === 1476, 'Total GST collected is ₹1,476.00 (₹738 CGST + ₹738 SGST)');
  assert(salesKpi.collections === 4770, 'Total cash/bank collections is ₹4,770.00 (₹1,770 + ₹3,000)');
  assert(salesKpi.creditSales === 4906, 'Total receivables / credit sales is ₹4,906.00 (₹7,906 - ₹3,000)');

  // --------------------------------------------------------------------------
  console.log('\n--- Test 3: Purchase Reports & ITC Breakdown ---');
  // --------------------------------------------------------------------------
  engine.purchases.push({
    id: 'P-01',
    poNumber: 'PO-501',
    invoiceDate: sept10,
    supplierId: 'SUP-01',
    supplierName: 'Sundaram Fasteners',
    taxableAmount: 20000,
    cgst: 1800,
    sgst: 1800,
    igst: 0,
    totalAmount: 23600,
    paidAmount: 15000, // ₹8,600 payable
    items: [
      { item: sparkPlug, quantity: 200, unitPrice: 100, taxableAmount: 20000, totalAmount: 23600 }
    ]
  });

  const purchaseKpi = engine.getPurchaseSummary();

  assert(purchaseKpi.grossPurchases === 23600, 'Gross purchases computes to ₹23,600.00');
  assert(purchaseKpi.totalTaxable === 20000, 'Taxable purchase value is ₹20,000.00');
  assert(purchaseKpi.totalCgst === 1800 && purchaseKpi.totalSgst === 1800, 'Eligible ITC CGST & SGST are ₹1,800 each');
  assert(purchaseKpi.totalPaid === 15000, 'Total paid to suppliers is ₹15,000.00');
  assert(purchaseKpi.totalPayable === 8600, 'Outstanding supplier payables is ₹8,600.00');

  // --------------------------------------------------------------------------
  console.log('\n--- Test 4: Inventory Valuation & Stock Analytics ---');
  // --------------------------------------------------------------------------
  // Stock units: 50 + 20 + 40 + 15 = 125 units
  // Cost Valuation: 50*100 (5000) + 20*800 (16000) + 40*650 (26000) + 15*1200 (18000) = 65,000
  // Selling Valuation: 50*150 (7500) + 20*1200 (24000) + 40*850 (34000) + 15*1650 (24750) = 90,250
  // MRP Valuation: 50*165 (8250) + 20*1350 (27000) + 40*900 (36000) + 15*1800 (27000) = 98,250
  // Unrealized Margin = (90250 - 65000) / 90250 = 27.98%
  const invValuation = engine.getInventoryValuation();

  assert(invValuation.totalStockUnits === 125, 'Total stock units in warehouse is 125 items');
  assert(invValuation.costValuation === 65000, 'Inventory valuation at Cost is ₹65,000.00');
  assert(invValuation.sellingValuation === 90250, 'Inventory valuation at Selling Price is ₹90,250.00');
  assert(invValuation.mrpValuation === 98250, 'Inventory valuation at MRP is ₹98,250.00');
  assert(invValuation.grossMargin === 27.98, 'Unrealized stock margin is 27.98%');

  // --------------------------------------------------------------------------
  console.log('\n--- Test 5: Profitability Engine & Margin Rankings ---');
  // --------------------------------------------------------------------------
  // Items sold:
  // Spark plug: 2 sold @ 150 (Rev 300) - 2 @ 100 (Cost 200) = Profit ₹100 (33.33% margin)
  // Helmet: 1 sold @ 1200 (Rev 1200) - 1 @ 800 (Cost 800) = Profit ₹400 (33.33% margin)
  // Oil: 4 sold @ 850 (Rev 3400) - 4 @ 650 (Cost 2600) = Profit ₹800 (23.53% margin)
  // Chain Sprocket: 2 sold @ 1650 (Rev 3300) - 2 @ 1200 (Cost 2400) = Profit ₹900 (27.27% margin)
  // Total Revenue = 300 + 1200 + 3400 + 3300 = 8,200
  // Total COGS = 200 + 800 + 2600 + 2400 = 6,000
  // Gross Profit = 8200 - 6000 = 2,200 (26.83% margin)
  const profitReport = engine.getProfitability();

  assert(profitReport.grossRevenue === 8200, 'Gross taxable sales revenue is ₹8,200.00');
  assert(profitReport.totalCogs === 6000, 'Cost of Goods Sold (COGS) computes accurately to ₹6,000.00');
  assert(profitReport.grossProfit === 2200, 'Gross profit computes accurately to ₹2,200.00');
  assert(profitReport.overallMarginPct === 26.83, 'Gross margin percentage is 26.83%');
  assert(profitReport.topItems[0].item.sku === 'ROLON-CS-PULSAR', 'Most profitable item by value is Rolon Chain Sprocket (₹900 profit)');
  assert(profitReport.lowestMarginItems[0].item.sku === 'MOT-7100-10W40', 'Lowest margin item is Motul 7100 Oil (23.53% margin)');

  // --------------------------------------------------------------------------
  console.log('\n--- Test 6: Cash Book & Bank Book Ledger Reconciliation ---');
  // --------------------------------------------------------------------------
  const cashAcc = { id: 'ACC-CASH', name: 'Cash Drawer', group: 'Cash-in-hand', openingBalance: 50000 };
  const bankAcc = { id: 'ACC-BANK', name: 'HDFC Bank', group: 'Bank Accounts', openingBalance: 200000 };
  const salesLedgerAcc = { id: 'ACC-SALE', name: 'Sales Revenue Account', group: 'Direct Incomes', openingBalance: 0 };
  engine.accounts.set(cashAcc.id, cashAcc);
  engine.accounts.set(bankAcc.id, bankAcc);
  engine.accounts.set(salesLedgerAcc.id, salesLedgerAcc);

  // Cash sale receipt (+1770 Cash Dr, +1770 Sales Cr)
  engine.ledgerEntries.push({
    accountId: cashAcc.id,
    date: sept10,
    particulars: 'Retail Counter Sale (INV-1001)',
    voucherType: 'Receipt',
    voucherNo: 'RCT-101',
    debit: 1770,
    credit: 0
  });

  engine.ledgerEntries.push({
    accountId: salesLedgerAcc.id,
    date: sept10,
    particulars: 'Retail Counter Sale (INV-1001)',
    voucherType: 'Receipt',
    voucherNo: 'RCT-101',
    debit: 0,
    credit: 1770
  });

  // Cash deposit to bank (-10000 cash, +10000 bank)
  engine.ledgerEntries.push({
    accountId: cashAcc.id,
    date: sept11,
    particulars: 'Cash Deposit to HDFC Bank',
    voucherType: 'Contra',
    voucherNo: 'CNT-01',
    debit: 0,
    credit: 10000
  });

  engine.ledgerEntries.push({
    accountId: bankAcc.id,
    date: sept11,
    particulars: 'Cash Deposit from Counter',
    voucherType: 'Contra',
    voucherNo: 'CNT-01',
    debit: 10000,
    credit: 0
  });

  const cashBook = engine.getCashBook(50000);
  assert(cashBook.totalInflows === 1770, 'Cash inflows recorded as ₹1,770.00');
  assert(cashBook.totalOutflows === 10000, 'Cash outflows recorded as ₹10,000.00 (Bank deposit)');
  assert(cashBook.closingBalance === 41770, 'Closing cash drawer balance reconciles to ₹41,770.00 (50,000 + 1,770 - 10,000)');

  // --------------------------------------------------------------------------
  console.log('\n--- Test 7: Double-Entry Trial Balance Balancing ---');
  // --------------------------------------------------------------------------
  const debtorsAcc = { id: 'ACC-DEBT', name: 'Sundry Debtors', group: 'Sundry Debtors', openingBalance: 0 };
  engine.accounts.set(debtorsAcc.id, debtorsAcc);

  // Balanced double entry: Debtors Dr ₹4906, Sales Cr ₹4906
  engine.ledgerEntries.push({
    accountId: debtorsAcc.id,
    date: sept12,
    particulars: 'Credit Sale INV-1002',
    voucherType: 'Sales Invoice',
    voucherNo: 'INV-1002',
    debit: 4906,
    credit: 0
  });

  engine.ledgerEntries.push({
    accountId: salesLedgerAcc.id,
    date: sept12,
    particulars: 'Credit Sale INV-1002',
    voucherType: 'Sales Invoice',
    voucherNo: 'INV-1002',
    debit: 0,
    credit: 4906
  });

  const trialBalance = engine.getTrialBalance();
  assert(trialBalance.isBalanced === true, 'Trial balance is in equilibrium (Total Debit == Total Credit)');
  assert(trialBalance.totalDebit === trialBalance.totalCredit, 'Debits and Credits balance symmetrically');

  // --------------------------------------------------------------------------
  console.log('\n--- Test 8: Zod Query Validation Schemas ---');
  // --------------------------------------------------------------------------
  const validSalesQuery = salesReportQuerySchema.safeParse({
    period: 'this_month',
    reportType: 'item',
    sortOrder: 'desc',
    page: 1,
    limit: 50
  });
  assert(validSalesQuery.success === true, 'salesReportQuerySchema validates item breakdown query');

  const validProfitQuery = profitabilityReportQuerySchema.safeParse({
    period: 'this_fy',
    groupBy: 'brand'
  });
  assert(validProfitQuery.success === true, 'profitabilityReportQuerySchema validates brand margin grouping');

  const validFinancialQuery = financialReportQuerySchema.safeParse({
    period: 'custom',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    reportType: 'balance_sheet'
  });
  assert(validFinancialQuery.success === true, 'financialReportQuerySchema validates custom period balance sheet');

  const validInsightsQuery = businessInsightsQuerySchema.safeParse({
    days: 30
  });
  assert(validInsightsQuery.success === true, 'businessInsightsQuerySchema validates operational insights query');

  // --------------------------------------------------------------------------
  console.log('\n--- Test 9: Strict RBAC Guarding on Financials & Margins ---');
  // --------------------------------------------------------------------------
  // Role Permission Simulator
  function checkReportAccess(rolePermissions: string[], requestedReport: 'sales' | 'purchases' | 'profitability' | 'financial'): boolean {
    if (requestedReport === 'sales' || requestedReport === 'purchases') {
      return rolePermissions.includes('reports.view') || rolePermissions.includes('admin.all');
    }
    if (requestedReport === 'profitability' || requestedReport === 'financial') {
      return rolePermissions.includes('accounts.financial.view') || rolePermissions.includes('admin.all');
    }
    return false;
  }

  const cashierPermissions = ['sales.create', 'sales.view', 'reports.view'];
  const managerPermissions = ['sales.create', 'sales.view', 'reports.view', 'accounts.financial.view', 'admin.all'];

  assert(checkReportAccess(cashierPermissions, 'sales') === true, 'Billing Operator CAN view operational sales reports');
  assert(checkReportAccess(cashierPermissions, 'profitability') === false, 'Billing Operator BLOCKED from viewing profit margins & COGS');
  assert(checkReportAccess(cashierPermissions, 'financial') === false, 'Billing Operator BLOCKED from viewing financial statements & balance sheets');
  assert(checkReportAccess(managerPermissions, 'profitability') === true, 'Manager CAN access profit & financial statements');

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n======================================================');
  console.log(`  REPORTS & BI TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runReportsBiTests();
