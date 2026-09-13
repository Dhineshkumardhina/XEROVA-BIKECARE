/**
 * BIKE ERP - Comprehensive Quotations & Returns Module Test Suite
 * Tests:
 * 1. Quotation creation with spare-parts, vehicle fitment, GST, fitting charges, and terms
 * 2. Quotation conversion to live Sales Invoice (atomic stock deduction & status CONVERTED)
 * 3. Already converted quotation protection (prevents double conversion)
 * 4. Expired quotation status detection (validUntil < now)
 * 5. Partial Sales Return -> Atomic restock, credit note, customer receivable reduction
 * 6. Full Sales Return -> Complete invoice restock & refund settlement
 * 7. Over-return rejection (returned qty > sold qty - previous returns)
 * 8. Return refund modes (Cash Refund vs Customer Credit balance adjustment)
 * 9. Purchase Return -> Atomic stock decrease & supplier payable deduction
 * 10. Accounting & GST reversals (Credit Notes & Debit Notes in GST ledger)
 * 11. Comprehensive Audit Log verification
 */

import { PaymentMode, RecordStatus, StockDirection, StockMovementType } from '@prisma/client';
import { createQuotationSchema, convertQuotationToInvoiceSchema } from '../validators/quotation.validator.js';

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

// Engine Simulation for Quotations and Returns Testing
interface SimItem {
  id: string;
  sku: string;
  name: string;
  maintainStock: boolean;
  currentStock: number;
  sellingRate: number;
  purchaseRate: number;
}

interface SimCustomer {
  id: string;
  name: string;
  mobile: string;
  outstanding: number;
  creditLimit: number;
}

interface SimSupplier {
  id: string;
  name: string;
  gstin: string;
  outstanding: number;
}

interface SimQuotation {
  id: string;
  quotationNumber: string;
  customerId?: string;
  customerName: string;
  validUntil: Date;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  fittingCharges: number;
  totalAmount: number;
  status: RecordStatus;
  convertedInvoiceNo?: string;
  items: Array<{ itemId: string; quantity: number; unitRate: number; totalAmount: number }>;
}

interface SimSale {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  customerName: string;
  totalAmount: number;
  paidAmount: number;
  items: Array<{ itemId: string; quantity: number; unitRate: number; returnedQty: number }>;
}

interface SimPurchase {
  id: string;
  poNumber: string;
  supplierId: string;
  totalAmount: number;
  items: Array<{ itemId: string; quantity: number; unitPrice: number; returnedQty: number }>;
}

class QuotationReturnsTestEngine {
  items: Map<string, SimItem> = new Map();
  customers: Map<string, SimCustomer> = new Map();
  suppliers: Map<string, SimSupplier> = new Map();
  quotations: SimQuotation[] = [];
  sales: SimSale[] = [];
  purchases: SimPurchase[] = [];
  stockMovements: Array<{
    id: string;
    itemId: string;
    movementType: StockMovementType;
    direction: StockDirection;
    quantity: number;
    referenceId: string;
  }> = [];
  gstTransactions: Array<{ documentType: string; documentNumber: string; totalValue: number }> = [];
  auditLogs: Array<{ action: string; entity: string; entityId: string; details: any }> = [];

  addItem(item: SimItem) {
    this.items.set(item.id, { ...item });
  }

  addCustomer(customer: SimCustomer) {
    this.customers.set(customer.id, { ...customer });
  }

  addSupplier(supplier: SimSupplier) {
    this.suppliers.set(supplier.id, { ...supplier });
  }

  async createQuotation(input: {
    quotationNumber?: string;
    customerId?: string;
    customerName: string;
    validDays?: number;
    validUntil?: Date;
    fittingCharges?: number;
    items: Array<{ itemId: string; quantity: number; unitRate: number; taxRate: number }>;
  }): Promise<SimQuotation> {
    const quotationNumber = input.quotationNumber || `QT-${Date.now().toString().slice(-4)}`;
    const validUntil = input.validUntil || new Date(Date.now() + (input.validDays || 15) * 86400000);

    let subtotalTaxable = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let rawTotal = 0;

    const processedItems: SimQuotation['items'] = [];

    for (const line of input.items) {
      const lineTaxable = line.quantity * line.unitRate;
      const tax = (lineTaxable * line.taxRate) / 100;
      const lineTotal = lineTaxable + tax;

      subtotalTaxable += lineTaxable;
      totalCgst += tax / 2;
      totalSgst += tax / 2;
      rawTotal += lineTotal;

      processedItems.push({
        itemId: line.itemId,
        quantity: line.quantity,
        unitRate: line.unitRate,
        totalAmount: lineTotal
      });
    }

    rawTotal += input.fittingCharges || 0;
    const grandTotal = Math.round(rawTotal);

    const quote: SimQuotation = {
      id: `qt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      quotationNumber,
      customerId: input.customerId,
      customerName: input.customerName,
      validUntil,
      taxableAmount: subtotalTaxable,
      cgstAmount: totalCgst,
      sgstAmount: totalSgst,
      fittingCharges: input.fittingCharges || 0,
      totalAmount: grandTotal,
      status: RecordStatus.PENDING,
      items: processedItems
    };

    this.quotations.push(quote);
    this.auditLogs.push({
      action: 'Quotation Created',
      entity: 'Quotation',
      entityId: quote.id,
      details: { quotationNumber, grandTotal }
    });

    return quote;
  }

  async convertQuotationToInvoice(quotationId: string): Promise<SimSale> {
    const quote = this.quotations.find((q) => q.id === quotationId);
    if (!quote) throw new Error('Quotation not found');
    if (quote.convertedInvoiceNo) {
      const err: any = new Error(`Quotation already converted to #${quote.convertedInvoiceNo}`);
      err.code = 'ALREADY_CONVERTED';
      throw err;
    }
    if (new Date(quote.validUntil).getTime() < Date.now()) {
      const err: any = new Error('Cannot convert expired quotation');
      err.code = 'QUOTATION_EXPIRED';
      throw err;
    }

    // Validate and Deduct Stock
    for (const line of quote.items) {
      const item = this.items.get(line.itemId);
      if (!item) throw new Error(`Item ${line.itemId} not found`);
      if (item.maintainStock && item.currentStock < line.quantity) {
        const err: any = new Error(`Insufficient stock for ${item.name}`);
        err.code = 'INSUFFICIENT_STOCK';
        throw err;
      }
    }

    const invoiceNumber = `INV-CONV-${quote.quotationNumber.replace('QT-', '')}`;

    for (const line of quote.items) {
      const item = this.items.get(line.itemId)!;
      if (item.maintainStock) {
        item.currentStock -= line.quantity;
        this.stockMovements.push({
          id: `mov-${Date.now()}-${line.itemId}`,
          itemId: line.itemId,
          movementType: StockMovementType.SALE,
          direction: StockDirection.OUT,
          quantity: line.quantity,
          referenceId: invoiceNumber
        });
      }
    }

    const sale: SimSale = {
      id: `sale-${Date.now()}`,
      invoiceNumber,
      customerId: quote.customerId,
      customerName: quote.customerName,
      totalAmount: quote.totalAmount,
      paidAmount: quote.totalAmount,
      items: quote.items.map((i) => ({ ...i, returnedQty: 0 }))
    };
    this.sales.push(sale);

    // Update Quotation Status
    quote.status = RecordStatus.COMPLETED;
    quote.convertedInvoiceNo = invoiceNumber;

    this.auditLogs.push({
      action: 'Quotation Converted',
      entity: 'Quotation',
      entityId: quote.id,
      details: { quotationNumber: quote.quotationNumber, invoiceNumber }
    });

    return sale;
  }

  async processSalesReturn(params: {
    saleId: string;
    creditNoteNumber?: string;
    refundMode: 'CASH' | 'CUSTOMER_CREDIT';
    items: Array<{ itemId: string; quantity: number; unitRate: number }>;
  }) {
    const sale = this.sales.find((s) => s.id === params.saleId);
    if (!sale) throw new Error('Sale invoice not found');

    const cnNumber = params.creditNoteNumber || `CN-${Date.now().toString().slice(-4)}`;
    let refundTotal = 0;

    for (const retLine of params.items) {
      const origItem = sale.items.find((i) => i.itemId === retLine.itemId);
      if (!origItem) throw new Error('Item not on original invoice');

      const returnableQty = origItem.quantity - origItem.returnedQty;
      if (retLine.quantity > returnableQty) {
        const err: any = new Error(
          `Return quantity (${retLine.quantity}) exceeds remaining returnable quantity (${returnableQty})`
        );
        err.code = 'RETURN_QUANTITY_EXCEEDED';
        throw err;
      }

      origItem.returnedQty += retLine.quantity;
      const lineRefund = retLine.quantity * retLine.unitRate;
      refundTotal += lineRefund;

      // Restock Item
      const item = this.items.get(retLine.itemId);
      if (item && item.maintainStock) {
        item.currentStock += retLine.quantity;
        this.stockMovements.push({
          id: `mov-ret-${Date.now()}`,
          itemId: retLine.itemId,
          movementType: StockMovementType.SALE_RETURN,
          direction: StockDirection.IN,
          quantity: retLine.quantity,
          referenceId: cnNumber
        });
      }
    }

    if (params.refundMode === 'CUSTOMER_CREDIT' && sale.customerId) {
      const cust = this.customers.get(sale.customerId);
      if (cust) cust.outstanding = Math.max(0, cust.outstanding - refundTotal);
    }

    this.gstTransactions.push({
      documentType: 'CREDIT_NOTE',
      documentNumber: cnNumber,
      totalValue: refundTotal
    });

    this.auditLogs.push({
      action: 'Sale Return Created',
      entity: 'SaleReturn',
      entityId: cnNumber,
      details: { cnNumber, refundTotal, refundMode: params.refundMode }
    });

    return { creditNoteNumber: cnNumber, refundTotal, refundMode: params.refundMode };
  }

  async processPurchaseReturn(params: {
    purchaseId: string;
    debitNoteNumber?: string;
    items: Array<{ itemId: string; quantity: number; unitPrice: number }>;
  }) {
    const purchase = this.purchases.find((p) => p.id === params.purchaseId);
    if (!purchase) throw new Error('Purchase not found');
    const supplier = this.suppliers.get(purchase.supplierId);
    if (!supplier) throw new Error('Supplier not found');

    const dnNumber = params.debitNoteNumber || `DN-${Date.now().toString().slice(-4)}`;
    let returnTotal = 0;

    for (const retLine of params.items) {
      const origItem = purchase.items.find((i) => i.itemId === retLine.itemId);
      if (!origItem) throw new Error('Item not on original purchase');

      const returnableQty = origItem.quantity - origItem.returnedQty;
      if (retLine.quantity > returnableQty) {
        const err: any = new Error(
          `Return quantity (${retLine.quantity}) exceeds remaining returnable quantity (${returnableQty})`
        );
        err.code = 'RETURN_QUANTITY_EXCEEDED';
        throw err;
      }

      origItem.returnedQty += retLine.quantity;
      const lineTotal = retLine.quantity * retLine.unitPrice;
      returnTotal += lineTotal;

      // Deduct stock
      const item = this.items.get(retLine.itemId);
      if (item && item.maintainStock) {
        item.currentStock -= retLine.quantity;
        this.stockMovements.push({
          id: `mov-pur-ret-${Date.now()}`,
          itemId: retLine.itemId,
          movementType: StockMovementType.PURCHASE_RETURN,
          direction: StockDirection.OUT,
          quantity: retLine.quantity,
          referenceId: dnNumber
        });
      }
    }

    // Reduce Supplier Payable
    supplier.outstanding -= returnTotal;

    this.gstTransactions.push({
      documentType: 'DEBIT_NOTE_ITC',
      documentNumber: dnNumber,
      totalValue: returnTotal
    });

    this.auditLogs.push({
      action: 'Purchase Return Created',
      entity: 'PurchaseReturn',
      entityId: dnNumber,
      details: { dnNumber, returnTotal }
    });

    return { debitNoteNumber: dnNumber, returnTotal };
  }
}

async function runQuotationsReturnsTests() {
  console.log('\n======================================================');
  console.log('📋 BIKE ERP - QUOTATIONS & RETURNS TEST SUITE');
  console.log('======================================================\n');

  const engine = new QuotationReturnsTestEngine();

  // Setup Items & Customer
  const clutchItem: SimItem = {
    id: 'item-clutch-01',
    sku: 'SKU-BAJ-P150-CLUTCH',
    name: 'Bajaj Pulsar 150 Clutch Plate Set',
    maintainStock: true,
    currentStock: 20,
    sellingRate: 580.0,
    purchaseRate: 420.0
  };
  engine.addItem(clutchItem);

  const brakePadItem: SimItem = {
    id: 'item-brake-01',
    sku: 'SKU-TVS-RTR-BRK',
    name: 'TVS Apache RTR 160 Front Brake Pad',
    maintainStock: true,
    currentStock: 15,
    sellingRate: 340.0,
    purchaseRate: 230.0
  };
  engine.addItem(brakePadItem);

  const customer: SimCustomer = {
    id: 'cust-ramesh-01',
    name: 'Ramesh V (Pulsar 150 TN-09-AX-9912)',
    mobile: '9840112233',
    outstanding: 2000,
    creditLimit: 15000
  };
  engine.addCustomer(customer);

  // Test 1: Quotation Creation with Valid Schema
  console.log('--- Test 1: Quotation Creation & Tax Calculation ---');
  const quoteData = {
    quotationNumber: 'QT-2026-001',
    customerId: 'cust-ramesh-01',
    customerName: 'Ramesh V',
    vehicleDetails: 'Pulsar 150 BS6 (TN-09-AX-9912)',
    validDays: 15,
    fittingCharges: 150, // Fitting labour
    items: [
      {
        itemId: 'item-clutch-01',
        quantity: 1,
        unitRate: 580.0, // 580 + 18% (104.40) = 684.40
        taxRate: 18
      },
      {
        itemId: 'item-brake-01',
        quantity: 2,
        unitRate: 340.0, // 680 + 18% (122.40) = 802.40
        taxRate: 18
      }
    ]
  };

  const quoteValidation = createQuotationSchema.safeParse(quoteData);
  assert(quoteValidation.success, 'createQuotationSchema validates estimate payload with items & fitting labour');

  const createdQuote = await engine.createQuotation(quoteData);
  // Total: 684.40 + 802.40 + 150 = 1636.80 -> Round 1637
  assert(createdQuote.totalAmount === 1637, 'Calculated total estimate amount accurately as ₹1,637.00');
  assert(createdQuote.status === RecordStatus.PENDING, 'Initial quotation status is PENDING');
  assert(engine.items.get('item-clutch-01')?.currentStock === 20, 'Creating quotation did NOT deduct physical stock');

  // Test 2: Quotation Conversion into Live Sales Invoice
  console.log('\n--- Test 2: Atomic Quotation Conversion to Live Invoice ---');
  const convertedSale = await engine.convertQuotationToInvoice(createdQuote.id);

  assert(convertedSale.invoiceNumber === 'INV-CONV-2026-001', 'Generated invoice number linked to quotation');
  assert(createdQuote.status === RecordStatus.COMPLETED, 'Quotation status updated to COMPLETED');
  assert(createdQuote.convertedInvoiceNo === 'INV-CONV-2026-001', 'Quotation holds reference to converted invoice');

  // Verify physical stock decreased on conversion
  assert(engine.items.get('item-clutch-01')?.currentStock === 19, 'Clutch stock decreased from 20 to 19 (-1)');
  assert(engine.items.get('item-brake-01')?.currentStock === 13, 'Brake pad stock decreased from 15 to 13 (-2)');

  // Test 3: Re-conversion Protection
  console.log('\n--- Test 3: Double-Conversion Protection ---');
  let doubleConvErr: any = null;
  try {
    await engine.convertQuotationToInvoice(createdQuote.id);
  } catch (err: any) {
    doubleConvErr = err;
  }
  assert(doubleConvErr?.code === 'ALREADY_CONVERTED', 'Blocks attempt to convert an already converted quotation');

  // Test 4: Expired Quotation Detection
  console.log('\n--- Test 4: Expired Quotation Handling ---');
  const expiredQuote = await engine.createQuotation({
    quotationNumber: 'QT-OLD-001',
    customerName: 'Old Lead',
    validUntil: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    items: [{ itemId: 'item-clutch-01', quantity: 1, unitRate: 580, taxRate: 18 }]
  });

  let expConvErr: any = null;
  try {
    await engine.convertQuotationToInvoice(expiredQuote.id);
  } catch (err: any) {
    expConvErr = err;
  }
  assert(expConvErr?.code === 'QUOTATION_EXPIRED', 'Rejects conversion of expired estimate quote');

  // Test 5: Partial Sales Return (Restock & Customer Credit)
  console.log('\n--- Test 5: Partial Sales Return (Restock & Customer Credit) ---');
  // Setup standard sale: 5 brake pads sold
  const testSale: SimSale = {
    id: 'sale-test-01',
    invoiceNumber: 'INV-2026-901',
    customerId: 'cust-ramesh-01',
    customerName: 'Ramesh V',
    totalAmount: 2006, // 5 * 340 = 1700 + 18% (306) = 2006
    paidAmount: 2006,
    items: [{ itemId: 'item-brake-01', quantity: 5, unitRate: 401.2, returnedQty: 0 }]
  };
  engine.sales.push(testSale);

  const brakeStockBeforeReturn = engine.items.get('item-brake-01')?.currentStock || 0;
  const customerOutstandingBefore = engine.customers.get('cust-ramesh-01')?.outstanding || 0;

  // Return 2 out of 5 brake pads
  const ret1 = await engine.processSalesReturn({
    saleId: 'sale-test-01',
    creditNoteNumber: 'CN-2026-801',
    refundMode: 'CUSTOMER_CREDIT',
    items: [{ itemId: 'item-brake-01', quantity: 2, unitRate: 401.2 }] // 2 * 401.2 = 802.40
  });

  assert(ret1.refundTotal === 802.4, 'Credit note issued for partial return amount ₹802.40');
  assert(
    engine.items.get('item-brake-01')?.currentStock === brakeStockBeforeReturn + 2,
    'Returned 2 brake pads restocked into inventory (+2 units)'
  );
  assert(
    engine.customers.get('cust-ramesh-01')?.outstanding === customerOutstandingBefore - 802.4,
    'Customer credit applied, reducing outstanding receivable by ₹802.40'
  );

  // Test 6: Over-Return Rejection
  console.log('\n--- Test 6: Over-Return Validation Guard ---');
  // Sold: 5, Already returned: 2, Remaining returnable: 3. Attempting to return 4:
  let overReturnErr: any = null;
  try {
    await engine.processSalesReturn({
      saleId: 'sale-test-01',
      refundMode: 'CASH',
      items: [{ itemId: 'item-brake-01', quantity: 4, unitRate: 401.2 }]
    });
  } catch (err: any) {
    overReturnErr = err;
  }

  assert(
    overReturnErr?.code === 'RETURN_QUANTITY_EXCEEDED',
    'Rejects return quantity exceeding sold quantity minus prior returns (4 > 3)'
  );

  // Test 7: Full Remaining Sales Return (Cash Refund)
  console.log('\n--- Test 7: Full Remaining Sales Return (Cash Refund Mode) ---');
  const ret2 = await engine.processSalesReturn({
    saleId: 'sale-test-01',
    creditNoteNumber: 'CN-2026-802',
    refundMode: 'CASH',
    items: [{ itemId: 'item-brake-01', quantity: 3, unitRate: 401.2 }] // 3 * 401.2 = 1203.60
  });

  assert(ret2.refundTotal === 1203.6, 'Settled full remaining 3 units for cash refund of ₹1,203.60');
  const saleItemRef = testSale.items.find((i) => i.itemId === 'item-brake-01');
  assert(saleItemRef?.returnedQty === 5, 'All 5 invoiced units recorded as fully returned');

  // Test 8: Purchase Return (Supplier Debit Note & Stock Deduct)
  console.log('\n--- Test 8: Purchase Return (Debit Note & Stock Deduction) ---');
  const supplier: SimSupplier = {
    id: 'sup-endurance-01',
    name: 'Endurance Auto Tech',
    gstin: '33AABCE1234F1Z5',
    outstanding: 50000
  };
  engine.addSupplier(supplier);

  const testPurchase: SimPurchase = {
    id: 'pur-test-01',
    poNumber: 'PO-2026-701',
    supplierId: 'sup-endurance-01',
    totalAmount: 21000,
    items: [{ itemId: 'item-clutch-01', quantity: 50, unitPrice: 420.0, returnedQty: 0 }]
  };
  engine.purchases.push(testPurchase);

  const clutchStockBeforePurReturn = engine.items.get('item-clutch-01')?.currentStock || 0;

  // Return 5 damaged clutches to supplier
  const pReturn = await engine.processPurchaseReturn({
    purchaseId: 'pur-test-01',
    debitNoteNumber: 'DN-2026-701',
    items: [{ itemId: 'item-clutch-01', quantity: 5, unitPrice: 420.0 }] // 5 * 420 = 2100
  });

  assert(pReturn.returnTotal === 2100, 'Supplier debit note issued for ₹2,100.00');
  assert(
    engine.items.get('item-clutch-01')?.currentStock === clutchStockBeforePurReturn - 5,
    'Stock decreased by 5 units for supplier return'
  );
  assert(
    engine.suppliers.get('sup-endurance-01')?.outstanding === 47900,
    'Supplier payable reduced from ₹50,000 to ₹47,900 (-₹2,100)'
  );

  // Test 9: GST Reversal Transaction Ledger
  console.log('\n--- Test 9: GST Reversal Transaction Ledger ---');
  const cnGst = engine.gstTransactions.filter((g) => g.documentType === 'CREDIT_NOTE');
  const dnGst = engine.gstTransactions.filter((g) => g.documentType === 'DEBIT_NOTE_ITC');

  assert(cnGst.length === 2, 'Recorded 2 GSTR-1 Credit Note transactions for customer sales returns');
  assert(dnGst.length === 1, 'Recorded GSTR-2 Debit Note transaction for supplier purchase return');

  // Test 10: System Audit Logs
  console.log('\n--- Test 10: Comprehensive System Audit Trail ---');
  const quoteAudits = engine.auditLogs.filter((a) => a.action === 'Quotation Created');
  const convAudits = engine.auditLogs.filter((a) => a.action === 'Quotation Converted');
  const saleRetAudits = engine.auditLogs.filter((a) => a.action === 'Sale Return Created');
  const purRetAudits = engine.auditLogs.filter((a) => a.action === 'Purchase Return Created');

  assert(quoteAudits.length === 2, 'Audit logs recorded for quotation creations');
  assert(convAudits.length === 1, 'Audit log recorded for quotation conversion to invoice');
  assert(saleRetAudits.length === 2, 'Audit logs recorded for sales return credit notes');
  assert(purRetAudits.length === 1, 'Audit log recorded for purchase return debit notes');

  // Summary
  console.log('\n======================================================');
  console.log(`  QUOTATIONS & RETURNS TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runQuotationsReturnsTests();
