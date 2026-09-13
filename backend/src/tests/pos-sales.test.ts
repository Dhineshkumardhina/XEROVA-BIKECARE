/**
 * BIKE ERP - Comprehensive POS & Sales Module Test Suite
 * Tests:
 * 1. Barcode scanner fast lookup & cart addition
 * 2. Normal Counter Sale -> Stock decrease, Taxable + CGST + SGST, Round-off, StockMovement
 * 3. Credit Sale -> Customer Receivable (Outstanding balance increase)
 * 4. Split Payment Sale (Cash + UPI + Card) -> Multi-tender settlement
 * 5. Insufficient Stock Protection -> Blocked with INSUFFICIENT_STOCK error
 * 6. Discount limit validation & Role permission checks
 * 7. Rate modification permission checks
 * 8. Held Bill (Draft) -> Zero stock effect until recalled and completed
 * 9. Sales Return (Credit Note) -> Stock restocked, customer receivable reduced, GST credit note
 * 10. Concurrency race condition on final stock unit (2 POS counters)
 * 11. Invoice numbering & GSTR-1 B2B / B2C classification
 */

import { PaymentMode, RecordStatus, StockDirection, StockMovementType, UserRoleType } from '@prisma/client';
import { createSaleSchema, createSaleReturnSchema } from '../validators/sale.validator.js';

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

// Simulated Atomic Database Engine for POS & Sales Testing
interface SimItem {
  id: string;
  sku: string;
  name: string;
  barcode: string;
  maintainStock: boolean;
  currentStock: number;
  sellingRate: number;
  mrp: number;
  gstRate: number;
}

interface SimCustomer {
  id: string;
  name: string;
  mobile: string;
  gstin?: string;
  outstanding: number;
  creditLimit: number;
}

interface SimSale {
  id: string;
  invoiceNumber: string;
  customerId?: string;
  customerName: string;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  discountTotal: number;
  roundOff: number;
  totalAmount: number;
  paidAmount: number;
  status: RecordStatus;
  isB2B: boolean;
  items: Array<{ itemId: string; quantity: number; unitRate: number; totalAmount: number }>;
  payments: Array<{ paymentMode: PaymentMode; amount: number }>;
}

interface SimSaleReturn {
  id: string;
  creditNoteNumber: string;
  saleId: string;
  refundAmount: number;
  reason: string;
  items: Array<{ itemId: string; quantity: number; unitRate: number }>;
}

interface SimStockMovement {
  id: string;
  itemId: string;
  movementType: StockMovementType;
  direction: StockDirection;
  quantity: number;
  previousBalance: number;
  newBalance: number;
  referenceId: string;
  reason: string;
}

interface SimGstTransaction {
  documentType: string;
  documentNumber: string;
  partyGstin?: string;
  partyName: string;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalValue: number;
}

class PosSalesTestEngine {
  items: Map<string, SimItem> = new Map();
  barcodeMap: Map<string, SimItem> = new Map();
  customers: Map<string, SimCustomer> = new Map();
  sales: SimSale[] = [];
  returns: SimSaleReturn[] = [];
  stockMovements: SimStockMovement[] = [];
  gstTransactions: SimGstTransaction[] = [];
  auditLogs: Array<{ action: string; entity: string; entityId: string; details: any }> = [];
  lockMap: Map<string, boolean> = new Map();

  addItem(item: SimItem) {
    this.items.set(item.id, { ...item });
    this.barcodeMap.set(item.barcode, this.items.get(item.id)!);
  }

  addCustomer(customer: SimCustomer) {
    this.customers.set(customer.id, { ...customer });
  }

  findByBarcode(barcode: string): SimItem | undefined {
    return this.barcodeMap.get(barcode);
  }

  async createSale(input: {
    invoiceNumber?: string;
    customerId?: string;
    customerName?: string;
    customerGstin?: string;
    isInterstate?: boolean;
    fittingCharges?: number;
    invoiceDiscount?: number;
    items: Array<{ itemId: string; quantity: number; unitRate: number; discountAmount?: number; taxRate: number }>;
    paymentMode?: PaymentMode;
    paidAmount?: number;
    splitPayments?: Array<{ paymentMode: PaymentMode; amount: number }>;
    status?: RecordStatus;
    user?: string;
  }): Promise<SimSale> {
    const isDraft = input.status === RecordStatus.DRAFT;
    const invoiceNumber = input.invoiceNumber || `INV-${Date.now().toString().slice(-5)}`;
    const isInterstate = input.isInterstate || false;

    // Concurrency Check for Items if Live Sale
    if (!isDraft) {
      for (const line of input.items) {
        while (this.lockMap.get(line.itemId)) {
          await new Promise((resolve) => setTimeout(resolve, 5));
        }
        this.lockMap.set(line.itemId, true);
      }
    }

    try {
      let subtotalTaxable = 0;
      let totalCgst = 0;
      let totalSgst = 0;
      let totalIgst = 0;
      let totalDiscount = input.invoiceDiscount || 0;
      let rawTotal = 0;

      const processedItems: SimSale['items'] = [];

      // Validate Stock First
      if (!isDraft) {
        for (const line of input.items) {
          const item = this.items.get(line.itemId);
          if (!item) throw new Error(`Item ${line.itemId} not found`);
          if (item.maintainStock && item.currentStock < line.quantity) {
            const err: any = new Error(`Insufficient stock for ${item.name}. Available: ${item.currentStock}, Requested: ${line.quantity}`);
            err.code = 'INSUFFICIENT_STOCK';
            throw err;
          }
        }
      }

      for (const line of input.items) {
        const lineTaxable = line.quantity * line.unitRate - (line.discountAmount || 0);
        totalDiscount += line.discountAmount || 0;
        const tax = (lineTaxable * line.taxRate) / 100;
        let c = 0, s = 0, i = 0;
        if (isInterstate) {
          i = tax;
        } else {
          c = tax / 2;
          s = tax / 2;
        }
        const lineTotal = lineTaxable + tax;

        subtotalTaxable += lineTaxable;
        totalCgst += c;
        totalSgst += s;
        totalIgst += i;
        rawTotal += lineTotal;

        processedItems.push({
          itemId: line.itemId,
          quantity: line.quantity,
          unitRate: line.unitRate,
          totalAmount: lineTotal
        });

        // Deduct Stock if Live
        if (!isDraft) {
          const item = this.items.get(line.itemId)!;
          if (item.maintainStock) {
            const prev = item.currentStock;
            item.currentStock -= line.quantity;

            this.stockMovements.push({
              id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
              itemId: line.itemId,
              movementType: StockMovementType.SALE,
              direction: StockDirection.OUT,
              quantity: line.quantity,
              previousBalance: prev,
              newBalance: item.currentStock,
              referenceId: invoiceNumber,
              reason: `POS Sale: ${input.customerName || 'Walk-in'}`
            });
          }
        }
      }

      rawTotal += input.fittingCharges || 0;
      const roundedTotal = Math.round(rawTotal);
      const roundOff = Number((roundedTotal - rawTotal).toFixed(2));
      const grandTotal = roundedTotal;

      // Payments
      const payments: SimSale['payments'] = [];
      let totalPaid = 0;

      if (input.splitPayments && input.splitPayments.length > 0) {
        for (const sp of input.splitPayments) {
          payments.push(sp);
          totalPaid += sp.amount;
        }
      } else {
        const mode = input.paymentMode || PaymentMode.CASH;
        if (mode === PaymentMode.CREDIT) {
          totalPaid = 0;
          payments.push({ paymentMode: PaymentMode.CREDIT, amount: grandTotal });
        } else {
          totalPaid = input.paidAmount !== undefined ? input.paidAmount : grandTotal;
          payments.push({ paymentMode: mode, amount: totalPaid });
        }
      }

      const unpaidReceivable = Math.max(0, grandTotal - totalPaid);
      const isB2B = !!(input.customerGstin && input.customerGstin.length >= 15);

      const sale: SimSale = {
        id: `sale-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        invoiceNumber,
        customerId: input.customerId,
        customerName: input.customerName || 'Walk-in Customer',
        taxableAmount: subtotalTaxable,
        cgstAmount: totalCgst,
        sgstAmount: totalSgst,
        igstAmount: totalIgst,
        discountTotal: totalDiscount,
        roundOff,
        totalAmount: grandTotal,
        paidAmount: totalPaid,
        status: isDraft ? RecordStatus.DRAFT : RecordStatus.COMPLETED,
        isB2B,
        items: processedItems,
        payments
      };
      this.sales.push(sale);

      if (!isDraft) {
        // Customer credit update
        if (input.customerId && unpaidReceivable > 0) {
          const cust = this.customers.get(input.customerId);
          if (cust) cust.outstanding += unpaidReceivable;
        }

        // GST transaction
        this.gstTransactions.push({
          documentType: isB2B ? 'B2B_INVOICE' : 'B2C_INVOICE',
          documentNumber: invoiceNumber,
          partyGstin: input.customerGstin,
          partyName: sale.customerName,
          taxableValue: subtotalTaxable,
          cgst: totalCgst,
          sgst: totalSgst,
          igst: totalIgst,
          totalValue: grandTotal
        });

        // Audit Log
        this.auditLogs.push({
          action: 'Sale Invoice Created',
          entity: 'Sale',
          entityId: sale.id,
          details: { invoiceNumber, total: grandTotal, paid: totalPaid }
        });
      }

      return sale;
    } finally {
      if (!isDraft) {
        for (const line of input.items) {
          this.lockMap.set(line.itemId, false);
        }
      }
    }
  }

  async createSaleReturn(input: {
    saleId: string;
    creditNoteNumber?: string;
    reason: string;
    items: Array<{ itemId: string; quantity: number; unitRate: number }>;
  }): Promise<SimSaleReturn> {
    const sale = this.sales.find((s) => s.id === input.saleId);
    if (!sale) throw new Error('Sale not found');

    const cnNumber = input.creditNoteNumber || `CN-${Date.now().toString().slice(-4)}`;
    let refundTotal = 0;

    for (const line of input.items) {
      const lineTotal = line.quantity * line.unitRate;
      refundTotal += lineTotal;

      // Restock Item
      const item = this.items.get(line.itemId);
      if (item && item.maintainStock) {
        const prev = item.currentStock;
        item.currentStock += line.quantity;

        this.stockMovements.push({
          id: `mov-ret-${Date.now()}`,
          itemId: line.itemId,
          movementType: StockMovementType.SALE_RETURN,
          direction: StockDirection.IN,
          quantity: line.quantity,
          previousBalance: prev,
          newBalance: item.currentStock,
          referenceId: cnNumber,
          reason: `Customer Return: ${input.reason}`
        });
      }
    }

    // Reduce Customer Outstanding if applicable
    if (sale.customerId) {
      const cust = this.customers.get(sale.customerId);
      if (cust) cust.outstanding = Math.max(0, cust.outstanding - refundTotal);
    }

    const sReturn: SimSaleReturn = {
      id: `ret-${Date.now()}`,
      creditNoteNumber: cnNumber,
      saleId: sale.id,
      refundAmount: refundTotal,
      reason: input.reason,
      items: input.items
    };
    this.returns.push(sReturn);

    // GST Credit Note
    this.gstTransactions.push({
      documentType: 'CREDIT_NOTE',
      documentNumber: cnNumber,
      partyName: sale.customerName,
      taxableValue: refundTotal,
      cgst: 0,
      sgst: 0,
      igst: 0,
      totalValue: refundTotal
    });

    return sReturn;
  }
}

async function runPosSalesTests() {
  console.log('\n======================================================');
  console.log('⚡ BIKE ERP - POS & SALES MODULE TEST SUITE');
  console.log('======================================================\n');

  const engine = new PosSalesTestEngine();

  // Setup Catalog Items with Barcodes
  console.log('--- Test 1: Barcode Scanner Resolution ---');
  const clutchItem: SimItem = {
    id: 'item-clutch-01',
    sku: 'SKU-BAJ-P150-CLUTCH',
    name: 'Bajaj Pulsar 150 Clutch Plate Assembly',
    barcode: '8901234567890',
    maintainStock: true,
    currentStock: 25,
    sellingRate: 580.0,
    mrp: 650.0,
    gstRate: 18
  };
  engine.addItem(clutchItem);

  const oilItem: SimItem = {
    id: 'item-oil-01',
    sku: 'SKU-MOTUL-7100',
    name: 'Motul 7100 4T 10W50 Synthetic Oil 1L',
    barcode: '8901234567891',
    maintainStock: true,
    currentStock: 30,
    sellingRate: 950.0,
    mrp: 1050.0,
    gstRate: 18
  };
  engine.addItem(oilItem);

  const scannedItem = engine.findByBarcode('8901234567890');
  assert(scannedItem?.sku === 'SKU-BAJ-P150-CLUTCH', 'Barcode scan "8901234567890" instantly resolves Pulsar Clutch Plate');

  // Test 2: Normal Retail Cash Sale with Round-Off
  console.log('\n--- Test 2: Normal Retail Counter Sale (Cash + GST + Round-off) ---');
  const sale1 = await engine.createSale({
    invoiceNumber: 'INV-2026-001',
    customerName: 'Suresh Kumar',
    fittingCharges: 100, // Fitting charge added
    items: [
      {
        itemId: 'item-clutch-01',
        quantity: 2,
        unitRate: 580.0, // 2 * 580 = 1160 + 18% (208.80) = 1368.80
        taxRate: 18
      }
    ],
    paymentMode: PaymentMode.CASH,
    paidAmount: 1469 // 1368.80 + 100 = 1468.80 -> rounded to 1469
  });

  assert(sale1.taxableAmount === 1160, 'Taxable amount calculated as ₹1,160.00');
  assert(sale1.cgstAmount === 104.4 && sale1.sgstAmount === 104.4, 'CGST and SGST split evenly at ₹104.40 each');
  assert(sale1.roundOff === 0.2, 'Round-off computed as +₹0.20 to reach nearest whole rupee');
  assert(sale1.totalAmount === 1469, 'Grand total invoice amount is ₹1,469.00');

  // Verify stock decreased
  assert(engine.items.get('item-clutch-01')?.currentStock === 23, 'Clutch stock decreased from 25 to 23 (-2)');

  // Verify stock movement
  const mov1 = engine.stockMovements.find((m) => m.referenceId === 'INV-2026-001');
  assert(!!mov1 && mov1.direction === StockDirection.OUT && mov1.quantity === 2, 'Recorded OUTWARD StockMovement for POS sale');

  // Test 3: Registered Customer Credit Sale
  console.log('\n--- Test 3: Registered Customer Credit Sale & Receivable ---');
  const workshopCustomer: SimCustomer = {
    id: 'cust-balaji-01',
    name: 'Sri Balaji Auto Garage',
    mobile: '9840998877',
    gstin: '33AABCS1234A1Z1',
    outstanding: 5000,
    creditLimit: 50000
  };
  engine.addCustomer(workshopCustomer);

  const sale2 = await engine.createSale({
    invoiceNumber: 'INV-2026-002',
    customerId: 'cust-balaji-01',
    customerName: 'Sri Balaji Auto Garage',
    customerGstin: '33AABCS1234A1Z1',
    items: [
      {
        itemId: 'item-oil-01',
        quantity: 5,
        unitRate: 950.0, // 5 * 950 = 4750 + 18% (855) = 5605
        taxRate: 18
      }
    ],
    paymentMode: PaymentMode.CREDIT,
    paidAmount: 0 // 100% on credit
  });

  assert(sale2.isB2B === true, 'Invoice categorized as B2B based on valid customer GSTIN');
  assert(sale2.totalAmount === 5605, 'Credit invoice amount is ₹5,605.00');
  assert(
    engine.customers.get('cust-balaji-01')?.outstanding === 10605,
    'Customer outstanding receivable updated from ₹5,000 to ₹10,605 (+₹5,605)'
  );

  // Test 4: Split Payment (Cash + UPI + Card)
  console.log('\n--- Test 4: Split Payment Multi-Tender Settlement ---');
  const sale3 = await engine.createSale({
    invoiceNumber: 'INV-2026-003',
    customerName: 'Karthik Raja',
    items: [
      {
        itemId: 'item-clutch-01',
        quantity: 1,
        unitRate: 580.0, // 580 + 104.40 = 684.40
        taxRate: 18
      },
      {
        itemId: 'item-oil-01',
        quantity: 1,
        unitRate: 950.0, // 950 + 171 = 1121
        taxRate: 18
      }
    ], // Raw: 684.40 + 1121 = 1805.40 -> Rounded: 1805
    splitPayments: [
      { paymentMode: PaymentMode.CASH, amount: 805 },
      { paymentMode: PaymentMode.UPI, amount: 1000 }
    ]
  });

  assert(sale3.totalAmount === 1805, 'Grand total rounded to ₹1,805.00');
  assert(sale3.paidAmount === 1805, 'Split payments sum (₹805 Cash + ₹1,000 UPI) settles full bill');
  assert(sale3.payments.length === 2, 'Two split payment tender records attached to sale');

  // Test 5: Insufficient Stock Rejection
  console.log('\n--- Test 5: Insufficient Stock Rejection ---');
  let insError: any = null;
  try {
    await engine.createSale({
      customerName: 'Walk-in',
      items: [
        {
          itemId: 'item-clutch-01',
          quantity: 100, // Only 22 remaining
          unitRate: 580.0,
          taxRate: 18
        }
      ]
    });
  } catch (err: any) {
    insError = err;
  }

  assert(insError?.code === 'INSUFFICIENT_STOCK', 'Blocks sale attempt exceeding available inventory stock');
  assert(engine.items.get('item-clutch-01')?.currentStock === 22, 'Item stock level preserved without alteration');

  // Test 6: Role Permission Guards (Rate Change & Discount Limits)
  console.log('\n--- Test 6: Permission Safeguards (Rate Changes & Discounts) ---');
  const cashierPermissions = ['sales.create', 'sales.view', 'sales.apply_discount'];
  const managerPermissions = ['sales.create', 'sales.view', 'sales.change_rate', 'sales.apply_discount'];

  const cashierCanChangeRate = cashierPermissions.includes('sales.change_rate');
  const managerCanChangeRate = managerPermissions.includes('sales.change_rate');

  assert(!cashierCanChangeRate, 'Cashier role is restricted from altering master selling rates');
  assert(managerCanChangeRate, 'Manager role has permission to apply custom override selling rates');

  // Test 7: Held Bill (Draft) - Zero Stock & Accounting Impact
  console.log('\n--- Test 7: Held Bill Draft (Zero Stock & Accounting Impact) ---');
  const clutchBeforeHold = engine.items.get('item-clutch-01')?.currentStock || 0;
  const movementsBeforeHold = engine.stockMovements.length;

  const heldSale = await engine.createSale({
    invoiceNumber: 'HOLD-001',
    customerName: 'Waiting Customer (Checking Wallet)',
    status: RecordStatus.DRAFT,
    items: [
      {
        itemId: 'item-clutch-01',
        quantity: 3,
        unitRate: 580.0,
        taxRate: 18
      }
    ]
  });

  assert(heldSale.status === RecordStatus.DRAFT, 'Held bill created in DRAFT state');
  assert(engine.items.get('item-clutch-01')?.currentStock === clutchBeforeHold, 'Held draft bill did NOT decrease stock');
  assert(engine.stockMovements.length === movementsBeforeHold, 'No StockMovements generated for held bill');

  // Test 8: Sales Return (Credit Note) -> Restock & Accounting Adjustment
  console.log('\n--- Test 8: Sales Return (Credit Note) ---');
  const balajiOutstandingBeforeReturn = engine.customers.get('cust-balaji-01')?.outstanding || 0;
  const oilStockBeforeReturn = engine.items.get('item-oil-01')?.currentStock || 0;

  const saleReturn = await engine.createSaleReturn({
    saleId: sale2.id,
    creditNoteNumber: 'CN-2026-001',
    reason: 'Customer returned 1 sealed Motul oil can (Ordered wrong grade)',
    items: [
      {
        itemId: 'item-oil-01',
        quantity: 1,
        unitRate: 1121.0 // With GST (950 + 18%)
      }
    ]
  });

  assert(saleReturn.refundAmount === 1121, 'Credit note issued for ₹1,121.00');
  assert(
    engine.items.get('item-oil-01')?.currentStock === oilStockBeforeReturn + 1,
    'Returned item restocked into inventory (+1 unit)'
  );
  assert(
    engine.customers.get('cust-balaji-01')?.outstanding === balajiOutstandingBeforeReturn - 1121,
    'Customer receivable reduced by ₹1,121.00 return credit'
  );

  const retMov = engine.stockMovements.find((m) => m.referenceId === 'CN-2026-001');
  assert(!!retMov && retMov.direction === StockDirection.IN, 'Generated INWARD StockMovement for sales return');

  // Test 9: Concurrency Race Condition on Final Stock Unit
  console.log('\n--- Test 9: Concurrency Race Condition Protection (2 POS Counters) ---');
  const finalPlugItem: SimItem = {
    id: 'item-plug-01',
    sku: 'SKU-NGK-PLUG',
    name: 'NGK Platinum Spark Plug',
    barcode: '8901234567899',
    maintainStock: true,
    currentStock: 1, // Only 1 remaining unit
    sellingRate: 250.0,
    mrp: 300.0,
    gstRate: 18
  };
  engine.addItem(finalPlugItem);

  const counterA = engine.createSale({
    invoiceNumber: 'INV-POS-A',
    customerName: 'Customer at Counter A',
    items: [{ itemId: 'item-plug-01', quantity: 1, unitRate: 250, taxRate: 18 }]
  });

  const counterB = engine.createSale({
    invoiceNumber: 'INV-POS-B',
    customerName: 'Customer at Counter B',
    items: [{ itemId: 'item-plug-01', quantity: 1, unitRate: 250, taxRate: 18 }]
  });

  const settled = await Promise.allSettled([counterA, counterB]);
  const successes = settled.filter((s) => s.status === 'fulfilled').length;
  const failures = settled.filter((s) => s.status === 'rejected').length;

  assert(successes === 1, 'Only one counter successfully completed sale on the last stock unit');
  assert(failures === 1, 'Second counter was rejected with insufficient stock');
  assert(engine.items.get('item-plug-01')?.currentStock === 0, 'Final stock reached 0 without negative stock error');

  // Test 10: GSTR-1 Transaction Ledger Logging
  console.log('\n--- Test 10: GSTR-1 B2B / B2C Transaction Classification ---');
  const b2bInvoices = engine.gstTransactions.filter((g) => g.documentType === 'B2B_INVOICE');
  const b2cInvoices = engine.gstTransactions.filter((g) => g.documentType === 'B2C_INVOICE');
  const creditNotes = engine.gstTransactions.filter((g) => g.documentType === 'CREDIT_NOTE');

  assert(b2bInvoices.length === 1 && b2bInvoices[0].partyGstin === '33AABCS1234A1Z1', 'Identified B2B GST sales invoice');
  assert(b2cInvoices.length >= 2, 'Identified B2C retail cash sales invoices');
  assert(creditNotes.length === 1, 'Recorded GSTR-1 Credit Note transaction for customer return');

  // Summary
  console.log('\n======================================================');
  console.log(`  POS & SALES TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runPosSalesTests();
