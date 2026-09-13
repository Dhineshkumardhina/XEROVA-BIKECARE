/**
 * BIKE ERP - Comprehensive GST Tax Engine & Reporting Layer Test Suite
 * 
 * Test Scenarios:
 * 1.  Intra-state sale calculation (CGST + SGST split)
 * 2.  Inter-state sale calculation (IGST full rate)
 * 3.  Intra-state purchase & Input Tax Credit (ITC)
 * 4.  Inter-state purchase & Input Tax Credit (ITC)
 * 5.  Credit Note (Sales Return CDNR & CDNUR)
 * 6.  Debit Note (Purchase Return ITC Reversal)
 * 7.  Exempt & Nil-rated item supplies (0% tax)
 * 8.  Decimal-safe calculations & nearest-rupee invoice round-off
 * 9.  GSTIN structure and Modulo-36 checksum verification
 * 10. HSN / SAC Code validation
 * 11. GSTR-1 structured generation (B2B, B2CL, B2CS, CDNR, CDNUR, Nil/Exempt, HSN Summary, Doc Summary)
 * 12. GSTR-3B summary & Net Cash Tax Liability computation
 * 13. GST Validation Engine (Errors vs Warnings, missing/invalid GSTIN, missing HSN, tax mismatch)
 * 14. GST Period Support & Period Finalization Locking safeguards
 * 15. Auditable GST operations & Tax Rate Configuration
 */

import {
  calculateGstLineItem,
  calculateInvoiceGstSummary,
  validateGstinFormat,
  validateHsnFormat,
  isInterstateSupply,
  round2Decimals
} from '../utils/gstEngine.js';

import {
  calculateTaxSchema,
  gstPeriodQuerySchema,
  lockPeriodSchema,
  createTaxRateSchema,
  validateGstinInputSchema
} from '../validators/gst.validator.js';

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

// In-Memory Simulation of Database & GST Engine for End-to-End Flow
interface SimItem {
  id: string;
  name: string;
  hsnCode: string;
  unitRate: number;
  taxRate: number;
  taxType: 'TAXABLE' | 'EXEMPT' | 'NIL' | 'NON_GST';
}

interface SimSale {
  id: string;
  invoiceNumber: string;
  invoiceDate: Date;
  customerName: string;
  customerGstin?: string;
  customerStateCode: string;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
  isB2B: boolean;
  status: string;
  items: Array<{
    item: SimItem;
    quantity: number;
    unitRate: number;
    taxableAmount: number;
    taxRate: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalAmount: number;
  }>;
}

interface SimPurchase {
  id: string;
  poNumber: string;
  invoiceDate: Date;
  supplierName: string;
  supplierGstin: string;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
  status: string;
}

interface SimSaleReturn {
  id: string;
  creditNoteNumber: string;
  sale: SimSale;
  returnDate: Date;
  refundAmount: number;
  reason: string;
}

interface SimPurchaseReturn {
  id: string;
  debitNoteNumber: string;
  purchase: SimPurchase;
  returnDate: Date;
  totalAmount: number;
  reason: string;
}

class GstSimulationEngine {
  companyStateCode = '33'; // Tamil Nadu
  companyGstin = '33AAAAA0000A1Z5';

  sales: SimSale[] = [];
  purchases: SimPurchase[] = [];
  saleReturns: SimSaleReturn[] = [];
  purchaseReturns: SimPurchaseReturn[] = [];
  lockedPeriods: Set<string> = new Set();
  taxRates: Array<{ name: string; cgst: number; sgst: number; igst: number }> = [
    { name: 'GST 0%', cgst: 0, sgst: 0, igst: 0 },
    { name: 'GST 5%', cgst: 2.5, sgst: 2.5, igst: 5 },
    { name: 'GST 12%', cgst: 6, sgst: 6, igst: 12 },
    { name: 'GST 18%', cgst: 9, sgst: 9, igst: 18 },
    { name: 'GST 28%', cgst: 14, sgst: 14, igst: 28 }
  ];
  auditLogs: Array<{ action: string; module: string; entity: string; entityId: string; details: any }> = [];

  createSale(params: {
    invoiceNumber: string;
    invoiceDate: Date;
    customerName: string;
    customerGstin?: string;
    customerStateCode: string;
    items: Array<{ item: SimItem; quantity: number; discountAmount?: number }>;
    fittingCharges?: number;
  }): SimSale {
    const period = `${(params.invoiceDate.getMonth() + 1).toString().padStart(2, '0')}-${params.invoiceDate.getFullYear()}`;
    if (this.lockedPeriods.has(period)) {
      throw new Error(`Cannot record sale in locked GST return period ${period}`);
    }

    const isInterstate = isInterstateSupply(this.companyStateCode, params.customerStateCode);
    const lineInputs = params.items.map(it => ({
      itemId: it.item.id,
      quantity: it.quantity,
      unitRate: it.item.unitRate,
      discountAmount: it.discountAmount || 0,
      taxRate: it.item.taxRate,
      taxType: it.item.taxType,
      hsnCode: it.item.hsnCode,
      isInterstate
    }));

    const calcSummary = calculateInvoiceGstSummary({
      items: lineInputs,
      isInterstate,
      fittingCharges: params.fittingCharges || 0
    });

    const isB2B = !!(params.customerGstin && params.customerGstin.length >= 15);

    const saleRecord: SimSale = {
      id: `SALE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      invoiceNumber: params.invoiceNumber,
      invoiceDate: params.invoiceDate,
      customerName: params.customerName,
      customerGstin: params.customerGstin,
      customerStateCode: params.customerStateCode,
      taxableAmount: calcSummary.taxableTotal,
      cgstAmount: calcSummary.totalCgst,
      sgstAmount: calcSummary.totalSgst,
      igstAmount: calcSummary.totalIgst,
      totalAmount: calcSummary.grandTotal,
      isB2B,
      status: 'COMPLETED',
      items: calcSummary.items.map((it, idx) => ({
        item: params.items[idx].item,
        quantity: it.quantity,
        unitRate: it.unitRate,
        taxableAmount: it.taxableAmount,
        taxRate: it.taxRate,
        cgst: it.cgstAmount,
        sgst: it.sgstAmount,
        igst: it.igstAmount,
        totalAmount: it.totalAmount
      }))
    };

    this.sales.push(saleRecord);
    this.auditLogs.push({
      action: 'Sale Created',
      module: 'Sales',
      entity: 'Sale',
      entityId: saleRecord.id,
      details: { invoiceNumber: saleRecord.invoiceNumber, total: saleRecord.totalAmount }
    });

    return saleRecord;
  }

  createPurchase(params: {
    poNumber: string;
    invoiceDate: Date;
    supplierName: string;
    supplierGstin: string;
    supplierStateCode: string;
    taxableAmount: number;
    taxRate: number;
  }): SimPurchase {
    const period = `${(params.invoiceDate.getMonth() + 1).toString().padStart(2, '0')}-${params.invoiceDate.getFullYear()}`;
    if (this.lockedPeriods.has(period)) {
      throw new Error(`Cannot record purchase in locked GST return period ${period}`);
    }

    const isInterstate = isInterstateSupply(this.companyStateCode, params.supplierStateCode);
    const tax = round2Decimals((params.taxableAmount * params.taxRate) / 100);
    let cgst = 0, sgst = 0, igst = 0;

    if (isInterstate) {
      igst = tax;
    } else {
      cgst = round2Decimals(tax / 2);
      sgst = round2Decimals(tax / 2);
    }

    const purchase: SimPurchase = {
      id: `PO-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      poNumber: params.poNumber,
      invoiceDate: params.invoiceDate,
      supplierName: params.supplierName,
      supplierGstin: params.supplierGstin,
      taxableAmount: params.taxableAmount,
      cgstAmount: cgst,
      sgstAmount: sgst,
      igstAmount: igst,
      totalAmount: round2Decimals(params.taxableAmount + tax),
      status: 'APPROVED'
    };

    this.purchases.push(purchase);
    return purchase;
  }

  createSaleReturn(params: {
    creditNoteNumber: string;
    sale: SimSale;
    returnDate: Date;
    refundAmount: number;
    reason: string;
  }): SimSaleReturn {
    const saleReturn: SimSaleReturn = {
      id: `CR-${Date.now()}`,
      creditNoteNumber: params.creditNoteNumber,
      sale: params.sale,
      returnDate: params.returnDate,
      refundAmount: params.refundAmount,
      reason: params.reason
    };
    this.saleReturns.push(saleReturn);
    return saleReturn;
  }

  createPurchaseReturn(params: {
    debitNoteNumber: string;
    purchase: SimPurchase;
    returnDate: Date;
    totalAmount: number;
    reason: string;
  }): SimPurchaseReturn {
    const purchaseReturn: SimPurchaseReturn = {
      id: `DR-${Date.now()}`,
      debitNoteNumber: params.debitNoteNumber,
      purchase: params.purchase,
      returnDate: params.returnDate,
      totalAmount: params.totalAmount,
      reason: params.reason
    };
    this.purchaseReturns.push(purchaseReturn);
    return purchaseReturn;
  }

  generateGstr1(period: string) {
    const [month, year] = period.split('-').map(Number);
    const matchingSales = this.sales.filter(s => {
      return s.invoiceDate.getMonth() + 1 === month && s.invoiceDate.getFullYear() === year;
    });
    const matchingReturns = this.saleReturns.filter(r => {
      return r.returnDate.getMonth() + 1 === month && r.returnDate.getFullYear() === year;
    });

    const b2b = matchingSales.filter(s => s.isB2B);
    const b2cl = matchingSales.filter(s => !s.isB2B && isInterstateSupply(this.companyStateCode, s.customerStateCode) && s.totalAmount > 250000);
    const b2cs = matchingSales.filter(s => !s.isB2B && (!isInterstateSupply(this.companyStateCode, s.customerStateCode) || s.totalAmount <= 250000));
    
    const cdnr = matchingReturns.filter(r => r.sale.isB2B);
    const cdnur = matchingReturns.filter(r => !r.sale.isB2B);

    const hsnSummaryMap = new Map<string, { hsn: string; qty: number; taxable: number; cgst: number; sgst: number; igst: number; total: number }>();
    let nilExemptTotal = 0;

    for (const s of matchingSales) {
      for (const line of s.items) {
        if (line.taxRate === 0) {
          nilExemptTotal = round2Decimals(nilExemptTotal + line.taxableAmount);
        }
        const hsn = line.item.hsnCode;
        const ex = hsnSummaryMap.get(hsn) || { hsn, qty: 0, taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0 };
        ex.qty = round2Decimals(ex.qty + line.quantity);
        ex.taxable = round2Decimals(ex.taxable + line.taxableAmount);
        ex.cgst = round2Decimals(ex.cgst + line.cgst);
        ex.sgst = round2Decimals(ex.sgst + line.sgst);
        ex.igst = round2Decimals(ex.igst + line.igst);
        ex.total = round2Decimals(ex.total + line.totalAmount);
        hsnSummaryMap.set(hsn, ex);
      }
    }

    const totalTaxable = matchingSales.reduce((sum, s) => round2Decimals(sum + s.taxableAmount), 0);
    const totalCgst = matchingSales.reduce((sum, s) => round2Decimals(sum + s.cgstAmount), 0);
    const totalSgst = matchingSales.reduce((sum, s) => round2Decimals(sum + s.sgstAmount), 0);
    const totalIgst = matchingSales.reduce((sum, s) => round2Decimals(sum + s.igstAmount), 0);

    return {
      period,
      summary: {
        totalInvoices: matchingSales.length,
        b2bCount: b2b.length,
        b2clCount: b2cl.length,
        b2csCount: b2cs.length,
        cdnrCount: cdnr.length,
        cdnurCount: cdnur.length,
        totalTaxable,
        totalCgst,
        totalSgst,
        totalIgst,
        totalTax: round2Decimals(totalCgst + totalSgst + totalIgst)
      },
      b2b,
      b2cl,
      b2cs,
      cdnr,
      cdnur,
      nilExempt: { nilRated: nilExemptTotal },
      hsnSummary: Array.from(hsnSummaryMap.values()),
      docSummary: {
        invoicesIssued: matchingSales.length,
        creditNotesIssued: matchingReturns.length
      }
    };
  }

  generateGstr3b(period: string) {
    const [month, year] = period.split('-').map(Number);
    const matchingSales = this.sales.filter(s => s.invoiceDate.getMonth() + 1 === month && s.invoiceDate.getFullYear() === year);
    const matchingPurchases = this.purchases.filter(p => p.invoiceDate.getMonth() + 1 === month && p.invoiceDate.getFullYear() === year);
    const matchingPReturns = this.purchaseReturns.filter(pr => pr.returnDate.getMonth() + 1 === month && pr.returnDate.getFullYear() === year);

    // Outward liability
    const outwardTaxable = matchingSales.reduce((sum, s) => round2Decimals(sum + s.taxableAmount), 0);
    const outwardCgst = matchingSales.reduce((sum, s) => round2Decimals(sum + s.cgstAmount), 0);
    const outwardSgst = matchingSales.reduce((sum, s) => round2Decimals(sum + s.sgstAmount), 0);
    const outwardIgst = matchingSales.reduce((sum, s) => round2Decimals(sum + s.igstAmount), 0);

    // Inward ITC
    const itcTaxable = matchingPurchases.reduce((sum, p) => round2Decimals(sum + p.taxableAmount), 0);
    const itcCgst = matchingPurchases.reduce((sum, p) => round2Decimals(sum + p.cgstAmount), 0);
    const itcSgst = matchingPurchases.reduce((sum, p) => round2Decimals(sum + p.sgstAmount), 0);
    const itcIgst = matchingPurchases.reduce((sum, p) => round2Decimals(sum + p.igstAmount), 0);

    // ITC Reversals from debit notes
    let itcReversedCgst = 0, itcReversedSgst = 0, itcReversedIgst = 0;
    for (const pr of matchingPReturns) {
      const orig = pr.purchase;
      const ratio = pr.totalAmount / (orig.totalAmount || 1);
      itcReversedCgst = round2Decimals(itcReversedCgst + orig.cgstAmount * ratio);
      itcReversedSgst = round2Decimals(itcReversedSgst + orig.sgstAmount * ratio);
      itcReversedIgst = round2Decimals(itcReversedIgst + orig.igstAmount * ratio);
    }

    const netItcCgst = Math.max(0, round2Decimals(itcCgst - itcReversedCgst));
    const netItcSgst = Math.max(0, round2Decimals(itcSgst - itcReversedSgst));
    const netItcIgst = Math.max(0, round2Decimals(itcIgst - itcReversedIgst));

    // Net Cash Liability (Table 6.1)
    const netPayableCgst = Math.max(0, round2Decimals(outwardCgst - netItcCgst));
    const netPayableSgst = Math.max(0, round2Decimals(outwardSgst - netItcSgst));
    const netPayableIgst = Math.max(0, round2Decimals(outwardIgst - netItcIgst));

    return {
      period,
      table3_1_Outward: {
        taxableValue: outwardTaxable,
        cgst: outwardCgst,
        sgst: outwardSgst,
        igst: outwardIgst,
        totalTax: round2Decimals(outwardCgst + outwardSgst + outwardIgst)
      },
      table4_ITC: {
        taxableValue: itcTaxable,
        grossCgst: itcCgst,
        grossSgst: itcSgst,
        grossIgst: itcIgst,
        reversedCgst: itcReversedCgst,
        reversedSgst: itcReversedSgst,
        reversedIgst: itcReversedIgst,
        netCgst: netItcCgst,
        netSgst: netItcSgst,
        netIgst: netItcIgst,
        totalNetItc: round2Decimals(netItcCgst + netItcSgst + netItcIgst)
      },
      table6_1_PaymentOfTax: {
        netPayableCgst,
        netPayableSgst,
        netPayableIgst,
        totalCashPayable: round2Decimals(netPayableCgst + netPayableSgst + netPayableIgst)
      }
    };
  }

  validate(period: string) {
    const [month, year] = period.split('-').map(Number);
    const matchingSales = this.sales.filter(s => s.invoiceDate.getMonth() + 1 === month && s.invoiceDate.getFullYear() === year);

    const errors: string[] = [];
    const warnings: string[] = [];

    for (const s of matchingSales) {
      if (s.isB2B) {
        if (!s.customerGstin) {
          errors.push(`Missing GSTIN on B2B invoice ${s.invoiceNumber}`);
        } else {
          const val = validateGstinFormat(s.customerGstin);
          if (!val.isValid) {
            errors.push(`Invalid GSTIN format (${s.customerGstin}) on invoice ${s.invoiceNumber}: ${val.error}`);
          }
        }
      }

      for (const line of s.items) {
        if (!line.item.hsnCode) {
          errors.push(`Missing HSN code on item '${line.item.name}' in invoice ${s.invoiceNumber}`);
        }
        const isInterstate = isInterstateSupply(this.companyStateCode, s.customerStateCode);
        if (!isInterstate && Math.abs(line.cgst - line.sgst) > 0.05) {
          errors.push(`Tax mismatch: CGST (${line.cgst}) and SGST (${line.sgst}) must match on intra-state invoice ${s.invoiceNumber}`);
        }
      }
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  lockPeriod(period: string, arnNumber?: string) {
    const val = this.validate(period);
    if (!val.isValid) {
      throw new Error(`Cannot lock period ${period} with unresolved errors`);
    }
    this.lockedPeriods.add(period);
    this.auditLogs.push({
      action: 'Period Locked',
      module: 'GST',
      entity: 'GSTPeriod',
      entityId: period,
      details: { period, arnNumber }
    });
  }
}

// ==============================================================================
// TEST EXECUTION
// ==============================================================================

async function runGstTests() {
  console.log('\n======================================================');
  console.log('🏛️  BIKE ERP - GST TAX ENGINE & REPORTING TEST SUITE');
  console.log('======================================================\n');

  const engine = new GstSimulationEngine();

  // Test Catalog
  const sparkPlug: SimItem = {
    id: 'ITEM-01',
    name: 'NGK Spark Plug CPR8EA-9',
    hsnCode: '8714',
    unitRate: 150.00,
    taxRate: 18.00,
    taxType: 'TAXABLE'
  };

  const helmet: SimItem = {
    id: 'ITEM-02',
    name: 'Vega Full Face Helmet',
    hsnCode: '6506',
    unitRate: 1200.00,
    taxRate: 18.00,
    taxType: 'TAXABLE'
  };

  const engineOil: SimItem = {
    id: 'ITEM-03',
    name: 'Motul 7100 10W40 4T Synthetic Oil 1L',
    hsnCode: '2710',
    unitRate: 850.00,
    taxRate: 28.00,
    taxType: 'TAXABLE'
  };

  const organicChainLube: SimItem = {
    id: 'ITEM-04',
    name: 'Agricultural Bio-Degradable Chain Cleaner',
    hsnCode: '3402',
    unitRate: 250.00,
    taxRate: 0.00,
    taxType: 'EXEMPT'
  };

  const serviceManual: SimItem = {
    id: 'ITEM-05',
    name: 'Motorcycle Safety Pamphlet & Manual',
    hsnCode: '4901',
    unitRate: 50.00,
    taxRate: 0.00,
    taxType: 'NIL'
  };

  // --------------------------------------------------------------------------
  console.log('--- Test 1: Intra-State Tax Calculation (CGST + SGST) ---');
  // --------------------------------------------------------------------------
  const intraItem = calculateGstLineItem({
    itemId: sparkPlug.id,
    quantity: 2,
    unitRate: 150.00,
    discountAmount: 0,
    taxRate: 18.00,
    isInterstate: false,
    taxType: 'TAXABLE',
    hsnCode: sparkPlug.hsnCode
  });

  assert(intraItem.taxableAmount === 300.00, 'Taxable value calculated as ₹300.00 (2 x ₹150)');
  assert(intraItem.cgstRate === 9.00, 'Intra-state CGST rate is 9.00% (Half of 18%)');
  assert(intraItem.sgstRate === 9.00, 'Intra-state SGST rate is 9.00% (Half of 18%)');
  assert(intraItem.igstRate === 0.00, 'Intra-state IGST rate is 0.00%');
  assert(intraItem.cgstAmount === 27.00, 'Intra-state CGST amount is ₹27.00 (9% of ₹300)');
  assert(intraItem.sgstAmount === 27.00, 'Intra-state SGST amount is ₹27.00 (9% of ₹300)');
  assert(intraItem.igstAmount === 0.00, 'Intra-state IGST amount is ₹0.00');
  assert(intraItem.totalAmount === 354.00, 'Line total is ₹354.00 (₹300 + ₹27 + ₹27)');

  // --------------------------------------------------------------------------
  console.log('\n--- Test 2: Inter-State Tax Calculation (IGST) ---');
  // --------------------------------------------------------------------------
  const interItem = calculateGstLineItem({
    itemId: engineOil.id,
    quantity: 4,
    unitRate: 850.00,
    discountAmount: 100.00,
    taxRate: 28.00,
    isInterstate: true,
    taxType: 'TAXABLE',
    hsnCode: engineOil.hsnCode
  });

  // Gross = 4 * 850 = 3400. Discount = 100. Taxable = 3300.
  assert(interItem.taxableAmount === 3300.00, 'Taxable value calculated as ₹3,300.00 (₹3,400 - ₹100 disc)');
  assert(interItem.igstRate === 28.00, 'Inter-state IGST rate is 28.00% (Full rate)');
  assert(interItem.cgstAmount === 0.00 && interItem.sgstAmount === 0.00, 'Inter-state CGST and SGST are ₹0.00');
  assert(interItem.igstAmount === 924.00, 'Inter-state IGST amount is ₹924.00 (28% of ₹3,300)');
  assert(interItem.totalAmount === 4224.00, 'Line total is ₹4,224.00 (₹3,300 + ₹924)');

  // --------------------------------------------------------------------------
  console.log('\n--- Test 3: Exempt & Nil-Rated Items ---');
  // --------------------------------------------------------------------------
  const exemptItem = calculateGstLineItem({
    itemId: organicChainLube.id,
    quantity: 3,
    unitRate: 250.00,
    taxRate: 0.00,
    taxType: 'EXEMPT',
    hsnCode: organicChainLube.hsnCode
  });
  assert(exemptItem.taxableAmount === 750.00, 'Exempt supply taxable value ₹750.00');
  assert(exemptItem.totalTaxAmount === 0.00, 'Exempt supply total tax is ₹0.00');
  assert(exemptItem.taxType === 'EXEMPT', 'Item marked as EXEMPT');

  const nilItem = calculateGstLineItem({
    itemId: serviceManual.id,
    quantity: 10,
    unitRate: 50.00,
    taxRate: 0.00,
    taxType: 'NIL',
    hsnCode: serviceManual.hsnCode
  });
  assert(nilItem.totalTaxAmount === 0.00, 'Nil-rated supply total tax is ₹0.00');
  assert(nilItem.taxType === 'NIL', 'Item marked as NIL');

  // --------------------------------------------------------------------------
  console.log('\n--- Test 4: Decimal-Safe Multi-Item Invoice Rounding ---');
  // --------------------------------------------------------------------------
  const invoiceSummary = calculateInvoiceGstSummary({
    items: [
      { itemId: 'A', quantity: 3, unitRate: 133.33, taxRate: 18, isInterstate: false },
      { itemId: 'B', quantity: 1, unitRate: 88.88, taxRate: 12, isInterstate: false }
    ],
    isInterstate: false,
    fittingCharges: 50.00
  });

  // Item A: 3 * 133.33 = 399.99. Tax 18% = 71.9982 -> CGST 36.00, SGST 36.00 -> 72.00. Total = 471.99
  // Item B: 1 * 88.88 = 88.88. Tax 12% = 10.6656 -> CGST 5.33, SGST 5.33 -> 10.66. Total = 99.54
  // Subtotal = 471.99 + 99.54 = 571.53 + Fitting 50 = 621.53
  // Rounded Grand Total = 622.00, roundOff = +0.47
  assert(invoiceSummary.rawGrandTotal === 621.53, 'Raw grand total computes precisely to ₹621.53');
  assert(invoiceSummary.grandTotal === 622, 'Invoice grand total rounds to nearest integer ₹622.00');
  assert(invoiceSummary.roundOff === 0.47, 'Round-off differential is recorded as +₹0.47');

  // --------------------------------------------------------------------------
  console.log('\n--- Test 5: GSTIN Format & Modulo-36 Checksum Validation ---');
  // --------------------------------------------------------------------------
  // Valid Tamil Nadu GSTIN with verified checksum (33AAAAA0000A1Z9)
  const validGstinCheck = validateGstinFormat('33AAAAA0000A1Z9');
  assert(validGstinCheck.isValid === true, '33AAAAA0000A1Z9 is a valid GSTIN with verified checksum');
  assert(validGstinCheck.stateCode === '33', 'Extracted state code 33 (Tamil Nadu)');
  assert(validGstinCheck.pan === 'AAAAA0000A', 'Extracted PAN AAAAA0000A');

  // Valid Karnataka GSTIN: 29AABCU9603R1ZJ
  const validKarGstin = validateGstinFormat('29AABCU9603R1ZJ');
  assert(validKarGstin.isValid === true, '29AABCU9603R1ZJ is a valid Karnataka GSTIN');

  // Invalid length
  const shortGstin = validateGstinFormat('33AAAAA0000A1Z');
  assert(shortGstin.isValid === false && !!shortGstin.error?.includes('15 characters'), 'Rejects GSTIN with invalid length');

  // Invalid checksum (expected 9, provided 5)
  const badChecksumGstin = validateGstinFormat('33AAAAA0000A1Z5');
  assert(badChecksumGstin.isValid === false && !!badChecksumGstin.error?.includes('checksum'), 'Rejects GSTIN with corrupted checksum digit');

  // --------------------------------------------------------------------------
  console.log('\n--- Test 6: HSN / SAC Code Validation ---');
  // --------------------------------------------------------------------------
  assert(validateHsnFormat('8714').isValid === true, 'Valid 4-digit automotive parts HSN (8714)');
  assert(validateHsnFormat('27101981').isValid === true, 'Valid 8-digit lubricant HSN (27101981)');
  assert(validateHsnFormat('996511').isValid === true, 'Valid 6-digit freight SAC (996511)');
  assert(validateHsnFormat('ABC').isValid === false, 'Rejects alphabetic non-numeric HSN');
  assert(validateHsnFormat('').isValid === false, 'Rejects empty HSN');

  // --------------------------------------------------------------------------
  console.log('\n--- Test 7: Intra-State vs Inter-State Supply Detection ---');
  // --------------------------------------------------------------------------
  assert(isInterstateSupply('33', '33') === false, 'Supplier TN (33) -> Customer TN (33) is Intra-State');
  assert(isInterstateSupply('33', '29') === true, 'Supplier TN (33) -> Customer KA (29) is Inter-State');
  assert(isInterstateSupply('33', '07') === true, 'Supplier TN (33) -> Customer DL (07) is Inter-State');

  // --------------------------------------------------------------------------
  console.log('\n--- Test 8: End-to-End Sales, Purchases, Credit/Debit Notes ---');
  // --------------------------------------------------------------------------
  const septDate = new Date(2026, 8, 15); // 15-Sep-2026

  // 1. B2B Intra-State Sale (Registered Customer)
  const b2bSale = engine.createSale({
    invoiceNumber: 'INV-2026-001',
    invoiceDate: septDate,
    customerName: 'Chennai Moto Spares Pvt Ltd',
    customerGstin: '33AAAAA0000A1Z9',
    customerStateCode: '33',
    items: [
      { item: sparkPlug, quantity: 20 }, // 20 * 150 = 3000 @ 18% -> CGST 270, SGST 270 -> 3540
      { item: helmet, quantity: 5 }       // 5 * 1200 = 6000 @ 18% -> CGST 540, SGST 540 -> 7080
    ]
  });
  assert(b2bSale.isB2B === true, 'Sale correctly classified as B2B (GSTIN present)');
  assert(b2bSale.taxableAmount === 9000.00, 'B2B Sale taxable amount is ₹9,000.00');
  assert(b2bSale.cgstAmount === 810.00 && b2bSale.sgstAmount === 810.00, 'B2B Sale CGST & SGST are ₹810.00 each');
  assert(b2bSale.totalAmount === 10620.00, 'B2B Sale total is ₹10,620.00');

  // 2. B2CS Intra-State Retail Sale (Walk-in unregistered customer)
  const b2csSale = engine.createSale({
    invoiceNumber: 'INV-2026-002',
    invoiceDate: septDate,
    customerName: 'Karthik Raja',
    customerStateCode: '33',
    items: [
      { item: sparkPlug, quantity: 2 },  // 300 @ 18% -> 354
      { item: organicChainLube, quantity: 1 } // 250 @ 0% (Exempt) -> 250
    ]
  });
  assert(b2csSale.isB2B === false, 'Retail Sale classified as B2C');
  assert(b2csSale.taxableAmount === 550.00, 'Retail Sale taxable amount ₹550.00 (₹300 taxable + ₹250 exempt)');
  assert(b2csSale.cgstAmount === 27.00 && b2csSale.sgstAmount === 27.00, 'Retail Sale CGST/SGST ₹27.00');

  // 3. B2CL Inter-State High-Value Sale (> 2.5L to unregistered customer in Kerala)
  const b2clSale = engine.createSale({
    invoiceNumber: 'INV-2026-003',
    invoiceDate: septDate,
    customerName: 'Cochin Superbike Club',
    customerStateCode: '32', // Kerala
    items: [
      { item: engineOil, quantity: 300 } // 300 * 850 = 2,55,000 @ 28% -> IGST 71,400 -> Total 3,26,400
    ]
  });
  assert(b2clSale.igstAmount === 71400.00, 'Inter-state B2CL IGST is ₹71,400.00 (28% of ₹2,55,000)');
  assert(b2clSale.totalAmount === 326400.00, 'Inter-state B2CL total value > ₹2.5L (₹3,26,400.00)');

  // 4. Inward Purchases for Input Tax Credit (ITC)
  const intraPurchase = engine.createPurchase({
    poNumber: 'PO-2026-001',
    invoiceDate: septDate,
    supplierName: 'Sundaram Fasteners Ltd',
    supplierGstin: '33AAAAA0000A1Z9',
    supplierStateCode: '33',
    taxableAmount: 20000.00,
    taxRate: 18.00 // CGST 1800, SGST 1800 -> 3600 Tax
  });
  assert(intraPurchase.cgstAmount === 1800.00 && intraPurchase.sgstAmount === 1800.00, 'Inward purchase generates ₹1,800 CGST + ₹1,800 SGST ITC');

  const interPurchase = engine.createPurchase({
    poNumber: 'PO-2026-002',
    invoiceDate: septDate,
    supplierName: 'Bosch Automotive Bengaluru',
    supplierGstin: '29AABCU9603R1ZJ',
    supplierStateCode: '29',
    taxableAmount: 15000.00,
    taxRate: 28.00 // IGST 4200
  });
  assert(interPurchase.igstAmount === 4200.00, 'Inter-state purchase generates ₹4,200 IGST ITC');

  // 5. Credit Note (Sales Return)
  const creditNote = engine.createSaleReturn({
    creditNoteNumber: 'CR-2026-001',
    sale: b2bSale,
    returnDate: septDate,
    refundAmount: 3540.00, // Returning spark plugs
    reason: 'Defective batch returned by dealer'
  });
  assert(creditNote.creditNoteNumber === 'CR-2026-001', 'Generated B2B Credit Note (CDNR)');

  // 6. Debit Note (Purchase Return ITC Reversal)
  const debitNote = engine.createPurchaseReturn({
    debitNoteNumber: 'DR-2026-001',
    purchase: intraPurchase,
    returnDate: septDate,
    totalAmount: 2360.00, // Taxable 2000 + 360 Tax (180 CGST + 180 SGST)
    reason: 'Damaged cartons returned to Sundaram Fasteners'
  });
  assert(debitNote.debitNoteNumber === 'DR-2026-001', 'Generated Supplier Debit Note for ITC Reversal');

  // --------------------------------------------------------------------------
  console.log('\n--- Test 9: GSTR-1 Structured Data Generation ---');
  // --------------------------------------------------------------------------
  const gstr1 = engine.generateGstr1('09-2026');

  assert(gstr1.period === '09-2026', 'GSTR-1 generated for period 09-2026');
  assert(gstr1.summary.totalInvoices === 3, 'Total 3 invoices generated');
  assert(gstr1.b2b.length === 1, 'B2B category holds 1 registered dealer invoice');
  assert(gstr1.b2cl.length === 1, 'B2CL category holds 1 high-value inter-state invoice (Cochin > 2.5L)');
  assert(gstr1.b2cs.length === 1, 'B2CS category holds 1 retail consumer invoice');
  assert(gstr1.cdnr.length === 1, 'CDNR category holds 1 registered credit note');
  assert(gstr1.nilExempt.nilRated === 250.00, 'Nil/Exempt category captures ₹250.00 exempt supply');
  assert(gstr1.hsnSummary.length >= 3, 'HSN Summary aggregates line items across 8714, 6506, 2710');
  assert(gstr1.docSummary.invoicesIssued === 3 && gstr1.docSummary.creditNotesIssued === 1, 'Doc summary tracks 3 invoices and 1 credit note');

  // --------------------------------------------------------------------------
  console.log('\n--- Test 10: GSTR-3B Summary & Net Cash Tax Liability ---');
  // --------------------------------------------------------------------------
  const gstr3b = engine.generateGstr3b('09-2026');

  // Outward:
  // Taxable: 9000 (B2B) + 550 (B2C) + 255000 (B2CL) = 264550.00
  // CGST: 810 + 27 = 837.00
  // SGST: 810 + 27 = 837.00
  // IGST: 71400.00
  assert(gstr3b.table3_1_Outward.taxableValue === 264550.00, 'Table 3.1 Outward Taxable Value is ₹2,64,550.00');
  assert(gstr3b.table3_1_Outward.cgst === 837.00, 'Table 3.1 Outward CGST liability is ₹837.00');
  assert(gstr3b.table3_1_Outward.sgst === 837.00, 'Table 3.1 Outward SGST liability is ₹837.00');
  assert(gstr3b.table3_1_Outward.igst === 71400.00, 'Table 3.1 Outward IGST liability is ₹71,400.00');

  // Inward ITC:
  // Gross Inward: CGST 1800, SGST 1800, IGST 4200
  // Reversal from Debit Note DR-2026-001 (2360/23600 = 10%): CGST 180, SGST 180
  // Net ITC: CGST 1620, SGST 1620, IGST 4200
  assert(gstr3b.table4_ITC.grossCgst === 1800.00, 'Table 4 Gross Inward CGST is ₹1,800.00');
  assert(gstr3b.table4_ITC.reversedCgst === 180.00, 'Table 4 ITC Reversal CGST is ₹180.00');
  assert(gstr3b.table4_ITC.netCgst === 1620.00, 'Table 4 Net Available CGST ITC is ₹1,620.00 (₹1,800 - ₹180)');
  assert(gstr3b.table4_ITC.netIgst === 4200.00, 'Table 4 Net Available IGST ITC is ₹4,200.00');

  // Net Cash Liability:
  // CGST: Outward 837 <= Net ITC 1620 -> Cash Payable = ₹0 (ITC surplus carried forward)
  // SGST: Outward 837 <= Net ITC 1620 -> Cash Payable = ₹0 (ITC surplus carried forward)
  // IGST: Outward 71400 - Net ITC 4200 -> Cash Payable = ₹67,200.00
  assert(gstr3b.table6_1_PaymentOfTax.netPayableCgst === 0.00, 'CGST is fully offset by available ITC (₹0 cash payable)');
  assert(gstr3b.table6_1_PaymentOfTax.netPayableSgst === 0.00, 'SGST is fully offset by available ITC (₹0 cash payable)');
  assert(gstr3b.table6_1_PaymentOfTax.netPayableIgst === 67200.00, 'Net IGST cash liability is ₹67,200.00 (₹71,400 - ₹4,200)');
  assert(gstr3b.table6_1_PaymentOfTax.totalCashPayable === 67200.00, 'Total Net Cash Tax Payable is ₹67,200.00');

  // --------------------------------------------------------------------------
  console.log('\n--- Test 11: GST Validation Engine (Error & Warning Detection) ---');
  // --------------------------------------------------------------------------
  const cleanValidation = engine.validate('09-2026');
  assert(cleanValidation.isValid === true, 'Clean ledger passes validation with 0 errors');

  // Simulate Corrupted Invoice for Validation Testing
  const corruptEngine = new GstSimulationEngine();
  const badItem: SimItem = { id: 'BAD', name: 'Corrupt Part', hsnCode: '', unitRate: 100, taxRate: 18, taxType: 'TAXABLE' };
  
  corruptEngine.sales.push({
    id: 'BAD-SALE',
    invoiceNumber: 'INV-BAD-01',
    invoiceDate: septDate,
    customerName: 'Bad Trader',
    customerGstin: '33INVALIDGSTIN1Z', // Bad checksum & format
    customerStateCode: '33',
    taxableAmount: 1000,
    cgstAmount: 100, // CGST (100) != SGST (80) Mismatch!
    sgstAmount: 80,
    igstAmount: 0,
    totalAmount: 1180,
    isB2B: true,
    status: 'COMPLETED',
    items: [
      { item: badItem, quantity: 1, unitRate: 100, taxableAmount: 100, taxRate: 18, cgst: 100, sgst: 80, igst: 0, totalAmount: 118 }
    ]
  });

  const corruptValidation = corruptEngine.validate('09-2026');
  assert(corruptValidation.isValid === false, 'Validation catches errors in corrupted invoice');
  assert(corruptValidation.errors.some(e => e.includes('Invalid GSTIN format')), 'Detected Invalid GSTIN format error');
  assert(corruptValidation.errors.some(e => e.includes('Missing HSN')), 'Detected Missing HSN code error');
  assert(corruptValidation.errors.some(e => e.includes('Tax mismatch')), 'Detected CGST != SGST mismatch error');

  // --------------------------------------------------------------------------
  console.log('\n--- Test 12: GST Period Finalization & Locking Safeguards ---');
  // --------------------------------------------------------------------------
  // Lock period 09-2026
  engine.lockPeriod('09-2026', 'ARN-AA3309260001234');
  assert(engine.lockedPeriods.has('09-2026'), 'Period 09-2026 is successfully finalized and locked with ARN');

  // Attempt to add a sale to locked period -> MUST THROW
  let threwOnLockedSale = false;
  try {
    engine.createSale({
      invoiceNumber: 'INV-POST-LOCK',
      invoiceDate: septDate,
      customerName: 'Late Walkin',
      customerStateCode: '33',
      items: [{ item: sparkPlug, quantity: 1 }]
    });
  } catch (err: any) {
    threwOnLockedSale = true;
  }
  assert(threwOnLockedSale === true, 'Blocks creation of sales in finalized and locked GST return period');

  // Attempt to add purchase to locked period -> MUST THROW
  let threwOnLockedPurchase = false;
  try {
    engine.createPurchase({
      poNumber: 'PO-POST-LOCK',
      invoiceDate: septDate,
      supplierName: 'Late Supplier',
      supplierGstin: '33AAAAA0000A1Z9',
      supplierStateCode: '33',
      taxableAmount: 5000,
      taxRate: 18
    });
  } catch (err: any) {
    threwOnLockedPurchase = true;
  }
  assert(threwOnLockedPurchase === true, 'Blocks creation of purchases in finalized and locked GST return period');

  // --------------------------------------------------------------------------
  console.log('\n--- Test 13: Schema Validation Coverage (Zod) ---');
  // --------------------------------------------------------------------------
  const calcSchemaTest = calculateTaxSchema.safeParse({
    items: [
      { itemId: '00000000-0000-0000-0000-000000000001', quantity: 5, unitRate: 100, taxRate: 18, isInterstate: false }
    ],
    isInterstate: false,
    fittingCharges: 100
  });
  assert(calcSchemaTest.success === true, 'calculateTaxSchema accepts valid calculation payload');

  const lockSchemaTest = lockPeriodSchema.safeParse({
    period: '09-2026',
    reason: 'Monthly GSTR-1 & 3B filing submitted to GST Portal',
    arnNumber: 'ARN-12345678'
  });
  assert(lockSchemaTest.success === true, 'lockPeriodSchema accepts valid period lock input');

  const taxRateSchemaTest = createTaxRateSchema.safeParse({
    rateName: 'GST 18%',
    cgstRate: 9.0,
    sgstRate: 9.0,
    igstRate: 18.0,
    isDefault: true
  });
  assert(taxRateSchemaTest.success === true, 'createTaxRateSchema validates standard GST tax rate');

  // --------------------------------------------------------------------------
  console.log('\n--- Test 14: Comprehensive Audit History ---');
  // --------------------------------------------------------------------------
  assert(engine.auditLogs.length >= 4, 'Audit engine tracks sales creation, lock events and modifications');
  assert(engine.auditLogs.some(l => l.action === 'Period Locked'), 'Recorded Period Locked audit entry with ARN');

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n======================================================');
  console.log(`  GST ENGINE TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runGstTests();
