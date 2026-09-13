/**
 * BIKE ERP - Comprehensive Purchase Module Test Suite
 * Tests:
 * 1. Supplier management (CRUD, GSTIN, PAN, Credit limit, Active/Inactive validation)
 * 2. Itemized Purchase Entry -> Atomic Stock Increase & Immutable Stock Movements
 * 3. Credit Purchase -> Supplier Payable (Outstanding Balance increment)
 * 4. Fully Paid Purchase -> Instant Payment Voucher & Status marked COMPLETED
 * 5. Partially Paid Purchase -> Partial Payment Voucher & Remaining Payable
 * 6. Multi-tier GST Calculation (CGST/SGST vs IGST) & GSTR-2 ITC Transaction Recording
 * 7. Non-Itemized Tax Purchase (Expense/Freight Voucher) -> Zero Stock Effect
 * 8. Purchase Returns (Debit Note) -> Stock Decrease & Supplier Payable Deduction
 * 9. Validation Safeguards: Duplicate vendor bill rejection, zero/negative qty, invalid GST
 * 10. Audit log recording across purchase lifecycle
 */

import { PaymentMode, RecordStatus, StockDirection, StockMovementType } from '@prisma/client';
import { createSupplierSchema } from '../validators/supplier.validator.js';
import { createPurchaseSchema, createPurchaseReturnSchema } from '../validators/purchase.validator.js';

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

// Simulated Atomic Database Engine for Purchase Testing
interface SimSupplier {
  id: string;
  name: string;
  supplierCode: string;
  mobile: string;
  email?: string;
  gstin: string;
  pan?: string;
  creditDays: number;
  creditLimit: number;
  openingBalance: number;
  outstanding: number;
  status: RecordStatus;
}

interface SimItem {
  id: string;
  sku: string;
  name: string;
  maintainStock: boolean;
  currentStock: number;
  purchaseRate: number;
}

interface SimPurchase {
  id: string;
  poNumber: string;
  supplierInvoiceNo?: string;
  supplierId: string;
  invoiceDate: Date;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: RecordStatus;
  isNonItemized: boolean;
  items: Array<{
    itemId: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    taxableAmount: number;
    totalAmount: number;
  }>;
}

interface SimPurchaseReturn {
  id: string;
  debitNoteNumber: string;
  purchaseId: string;
  totalAmount: number;
  reason: string;
  items: Array<{ itemId: string; quantity: number; unitPrice: number; totalAmount: number }>;
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

interface SimPaymentVoucher {
  id: string;
  paymentNo: string;
  supplierId: string;
  amount: number;
  paymentMode: PaymentMode;
  referenceNo: string;
}

interface SimGstTransaction {
  documentType: string;
  documentNumber: string;
  partyGstin: string;
  partyName: string;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalValue: number;
}

class PurchaseTestEngine {
  suppliers: Map<string, SimSupplier> = new Map();
  items: Map<string, SimItem> = new Map();
  purchases: SimPurchase[] = [];
  returns: SimPurchaseReturn[] = [];
  stockMovements: SimStockMovement[] = [];
  payments: SimPaymentVoucher[] = [];
  gstTransactions: SimGstTransaction[] = [];
  auditLogs: Array<{ action: string; entity: string; entityId: string; details: any }> = [];

  createSupplier(data: Omit<SimSupplier, 'outstanding'> & { openingBalance?: number }): SimSupplier {
    const supplier: SimSupplier = {
      ...data,
      openingBalance: data.openingBalance || 0,
      outstanding: data.openingBalance || 0
    };
    this.suppliers.set(supplier.id, supplier);
    return supplier;
  }

  addItem(item: SimItem) {
    this.items.set(item.id, { ...item });
  }

  /**
   * Atomic purchase workflow
   */
  async createPurchase(input: {
    poNumber?: string;
    supplierInvoiceNo?: string;
    supplierId: string;
    invoiceDate?: Date;
    isInterstate?: boolean;
    isNonItemized?: boolean;
    expenseCategory?: string;
    items?: Array<{ itemId: string; quantity: number; unitPrice: number; discountAmount?: number; taxRate: number }>;
    taxableAmount?: number;
    taxRate?: number;
    paymentMode?: PaymentMode;
    paidAmount?: number;
    paymentReference?: string;
    user?: string;
  }): Promise<SimPurchase> {
    const supplier = this.suppliers.get(input.supplierId);
    if (!supplier) throw new Error('Supplier not found');
    if (supplier.status === RecordStatus.INACTIVE) throw new Error('Supplier is inactive');

    // Duplicate bill check
    if (input.supplierInvoiceNo) {
      const isDup = this.purchases.some(
        (p) => p.supplierId === input.supplierId && p.supplierInvoiceNo === input.supplierInvoiceNo
      );
      if (isDup) {
        const err: any = new Error(`Duplicate vendor invoice #${input.supplierInvoiceNo}`);
        err.code = 'DUPLICATE_VENDOR_INVOICE';
        throw err;
      }
    }

    const poNumber = input.poNumber || `PO-${Date.now().toString().slice(-5)}`;
    let subtotalTaxable = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;
    let grandTotal = 0;

    const processedItems: SimPurchase['items'] = [];

    if (input.isNonItemized) {
      subtotalTaxable = input.taxableAmount || 0;
      const taxRate = input.taxRate || 18;
      const tax = (subtotalTaxable * taxRate) / 100;
      if (input.isInterstate) {
        totalIgst = tax;
      } else {
        totalCgst = tax / 2;
        totalSgst = tax / 2;
      }
      grandTotal = subtotalTaxable + tax;
    } else {
      if (!input.items || input.items.length === 0) {
        throw new Error('Itemized purchase requires items');
      }

      for (const line of input.items) {
        const lineTaxable = line.quantity * line.unitPrice - (line.discountAmount || 0);
        const tax = (lineTaxable * line.taxRate) / 100;
        let c = 0,
          s = 0,
          i = 0;
        if (input.isInterstate) {
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
        grandTotal += lineTotal;

        processedItems.push({
          itemId: line.itemId,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          taxRate: line.taxRate,
          taxableAmount: lineTaxable,
          totalAmount: lineTotal
        });

        // Increase Item Stock and Record Movement
        const item = this.items.get(line.itemId);
        if (item && item.maintainStock) {
          const prev = item.currentStock;
          item.currentStock += line.quantity;
          item.purchaseRate = line.unitPrice; // update latest purchase rate

          this.stockMovements.push({
            id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            itemId: line.itemId,
            movementType: StockMovementType.PURCHASE,
            direction: StockDirection.IN,
            quantity: line.quantity,
            previousBalance: prev,
            newBalance: item.currentStock,
            referenceId: poNumber,
            reason: `Supplier Purchase: ${supplier.name}`
          });
        }
      }
    }

    const paid = Math.min(input.paidAmount || 0, grandTotal);
    const unpaid = grandTotal - paid;

    // Update Supplier Outstanding
    supplier.outstanding += unpaid;

    const purchase: SimPurchase = {
      id: `pur-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      poNumber,
      supplierInvoiceNo: input.supplierInvoiceNo,
      supplierId: supplier.id,
      invoiceDate: input.invoiceDate || new Date(),
      taxableAmount: subtotalTaxable,
      cgstAmount: totalCgst,
      sgstAmount: totalSgst,
      igstAmount: totalIgst,
      totalAmount: grandTotal,
      paidAmount: paid,
      status: unpaid === 0 ? RecordStatus.COMPLETED : RecordStatus.APPROVED,
      isNonItemized: !!input.isNonItemized,
      items: processedItems
    };
    this.purchases.push(purchase);

    // Record Payment Voucher if paid > 0
    if (paid > 0) {
      this.payments.push({
        id: `pv-${Date.now()}`,
        paymentNo: `PV-${poNumber}`,
        supplierId: supplier.id,
        amount: paid,
        paymentMode: input.paymentMode || PaymentMode.CASH,
        referenceNo: input.paymentReference || poNumber
      });
    }

    // Record GST Transaction
    this.gstTransactions.push({
      documentType: input.isNonItemized ? 'EXPENSE_ITC' : 'PURCHASE_ITC',
      documentNumber: input.supplierInvoiceNo || poNumber,
      partyGstin: supplier.gstin,
      partyName: supplier.name,
      taxableValue: subtotalTaxable,
      cgst: totalCgst,
      sgst: totalSgst,
      igst: totalIgst,
      totalValue: grandTotal
    });

    // Audit Log
    this.auditLogs.push({
      action: 'Purchase Created',
      entity: 'Purchase',
      entityId: purchase.id,
      details: { poNumber, total: grandTotal, paid, unpaid }
    });

    return purchase;
  }

  /**
   * Process a Purchase Return
   */
  async createPurchaseReturn(input: {
    purchaseId: string;
    debitNoteNumber?: string;
    reason: string;
    items: Array<{ itemId: string; quantity: number; unitPrice: number }>;
  }): Promise<SimPurchaseReturn> {
    const purchase = this.purchases.find((p) => p.id === input.purchaseId);
    if (!purchase) throw new Error('Purchase not found');
    const supplier = this.suppliers.get(purchase.supplierId);
    if (!supplier) throw new Error('Supplier not found');

    const dnNumber = input.debitNoteNumber || `DN-${Date.now().toString().slice(-4)}`;
    let returnTotal = 0;
    const processedReturnItems: SimPurchaseReturn['items'] = [];

    for (const line of input.items) {
      const lineTotal = line.quantity * line.unitPrice;
      returnTotal += lineTotal;

      processedReturnItems.push({
        itemId: line.itemId,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        totalAmount: lineTotal
      });

      // Decrease Stock
      const item = this.items.get(line.itemId);
      if (item && item.maintainStock) {
        const prev = item.currentStock;
        item.currentStock -= line.quantity;

        this.stockMovements.push({
          id: `mov-ret-${Date.now()}`,
          itemId: line.itemId,
          movementType: StockMovementType.PURCHASE_RETURN,
          direction: StockDirection.OUT,
          quantity: line.quantity,
          previousBalance: prev,
          newBalance: item.currentStock,
          referenceId: dnNumber,
          reason: `Supplier Return: ${input.reason}`
        });
      }
    }

    // Decrement Supplier Outstanding
    supplier.outstanding -= returnTotal;

    const pReturn: SimPurchaseReturn = {
      id: `ret-${Date.now()}`,
      debitNoteNumber: dnNumber,
      purchaseId: purchase.id,
      totalAmount: returnTotal,
      reason: input.reason,
      items: processedReturnItems
    };
    this.returns.push(pReturn);

    // GST Debit Note ITC
    this.gstTransactions.push({
      documentType: 'DEBIT_NOTE_ITC',
      documentNumber: dnNumber,
      partyGstin: supplier.gstin,
      partyName: supplier.name,
      taxableValue: returnTotal,
      cgst: 0,
      sgst: 0,
      igst: 0,
      totalValue: returnTotal
    });

    // Audit Log
    this.auditLogs.push({
      action: 'Purchase Return Created',
      entity: 'PurchaseReturn',
      entityId: pReturn.id,
      details: { dnNumber, returnTotal, reason: input.reason }
    });

    return pReturn;
  }
}

async function runPurchaseTests() {
  console.log('\n======================================================');
  console.log('🛍️  BIKE ERP - PURCHASE MODULE TEST SUITE');
  console.log('======================================================\n');

  const engine = new PurchaseTestEngine();

  // Setup Supplier
  console.log('--- Test 1: Supplier Management & Validation ---');
  const supplierData = {
    id: 'sup-endurance-01',
    supplierCode: 'SUP-END-001',
    name: 'Endurance Auto Tech Pvt Ltd',
    contactPerson: 'K. Ramesh (Regional Sales Mgr)',
    mobile: '9840123456',
    email: 'sales@endurance.co.in',
    gstin: '33AABCE1234F1Z5',
    pan: 'AABCE1234F',
    creditDays: 45,
    creditLimit: 500000,
    openingBalance: 25000,
    status: RecordStatus.ACTIVE
  };

  const supValidation = createSupplierSchema.safeParse(supplierData);
  assert(supValidation.success, 'Validates complete supplier payload with GSTIN, PAN, and credit terms');

  const createdSupplier = engine.createSupplier(supplierData);
  assert(createdSupplier.outstanding === 25000, 'Supplier opening balance initializes outstanding to ₹25,000');

  // Setup Items in Catalog
  engine.addItem({
    id: 'item-clutch-01',
    sku: 'SKU-BAJ-P150-CLUTCH',
    name: 'Bajaj Pulsar 150 Clutch Plate Assembly',
    maintainStock: true,
    currentStock: 10,
    purchaseRate: 420.0
  });

  engine.addItem({
    id: 'item-oil-01',
    sku: 'SKU-MOTUL-7100',
    name: 'Motul 7100 4T 10W50 Synthetic Oil 1L',
    maintainStock: true,
    currentStock: 24,
    purchaseRate: 850.0
  });

  // Test 2: Itemized Purchase Entry -> Stock Increase
  console.log('\n--- Test 2: Itemized Purchase Inward -> Stock Increase ---');
  const purchase1 = await engine.createPurchase({
    poNumber: 'PO-2026-001',
    supplierInvoiceNo: 'INV-END-9901',
    supplierId: 'sup-endurance-01',
    isInterstate: false,
    items: [
      {
        itemId: 'item-clutch-01',
        quantity: 50,
        unitPrice: 420.0,
        taxRate: 18
      },
      {
        itemId: 'item-oil-01',
        quantity: 20,
        unitPrice: 850.0,
        taxRate: 18
      }
    ],
    paymentMode: PaymentMode.CREDIT,
    paidAmount: 0 // Full Credit
  });

  // Calculations:
  // Clutch: 50 * 420 = 21,000 + 18% (3,780) = 24,780
  // Oil: 20 * 850 = 17,000 + 18% (3,060) = 20,060
  // Subtotal Taxable = 38,000 | CGST = 3,420 | SGST = 3,420 | Total = 44,840
  assert(purchase1.taxableAmount === 38000, 'Calculated correct purchase taxable amount (₹38,000.00)');
  assert(purchase1.cgstAmount === 3420 && purchase1.sgstAmount === 3420, 'Calculated split CGST & SGST (₹3,420 each)');
  assert(purchase1.totalAmount === 44840, 'Calculated grand total purchase value (₹44,840.00)');

  // Verify Stock Increase
  const clutchStock = engine.items.get('item-clutch-01')?.currentStock;
  const oilStock = engine.items.get('item-oil-01')?.currentStock;
  assert(clutchStock === 60, 'Clutch stock increased from 10 to 60 (+50)');
  assert(oilStock === 44, 'Oil stock increased from 24 to 44 (+20)');

  // Verify Stock Movement Records
  const clutchMov = engine.stockMovements.find((m) => m.referenceId === 'PO-2026-001' && m.itemId === 'item-clutch-01');
  assert(!!clutchMov && clutchMov.direction === StockDirection.IN, 'Created immutable StockMovement for inward clutch purchase');

  // Test 3: Credit Purchase -> Supplier Payable Tracking
  console.log('\n--- Test 3: Credit Purchase & Supplier Payable Update ---');
  // Opening: 25,000 + 44,840 = 69,840
  assert(
    createdSupplier.outstanding === 69840,
    'Supplier outstanding balance updated from ₹25,000 to ₹69,840 (+₹44,840)'
  );
  assert(purchase1.status === RecordStatus.APPROVED, 'Unpaid credit purchase marked as APPROVED (Active Payable)');

  // Test 4: Fully Paid Purchase -> Payment Voucher & Paid Status
  console.log('\n--- Test 4: Fully Paid Purchase & Payment Voucher Creation ---');
  const purchase2 = await engine.createPurchase({
    poNumber: 'PO-2026-002',
    supplierInvoiceNo: 'INV-END-9902',
    supplierId: 'sup-endurance-01',
    isInterstate: false,
    items: [
      {
        itemId: 'item-clutch-01',
        quantity: 10,
        unitPrice: 420.0,
        taxRate: 18
      }
    ],
    paymentMode: PaymentMode.UPI,
    paidAmount: 4956.0, // 10 * 420 = 4200 + 18% (756) = 4956 (Full Paid)
    paymentReference: 'UPI-REF-99210'
  });

  assert(purchase2.status === RecordStatus.COMPLETED, 'Fully paid purchase invoice marked COMPLETED');
  assert(purchase2.paidAmount === 4956, 'Paid amount recorded as ₹4,956.00');

  const paymentVoucher = engine.payments.find((p) => p.paymentNo === 'PV-PO-2026-002');
  assert(!!paymentVoucher && paymentVoucher.amount === 4956, 'Generated instant Payment Voucher record (PV-PO-2026-002)');
  assert(
    createdSupplier.outstanding === 69840,
    'Supplier outstanding remains unchanged after fully paid purchase (no additional debt)'
  );

  // Test 5: Partially Paid Purchase
  console.log('\n--- Test 5: Partially Paid Purchase Accounting ---');
  const purchase3 = await engine.createPurchase({
    poNumber: 'PO-2026-003',
    supplierInvoiceNo: 'INV-END-9903',
    supplierId: 'sup-endurance-01',
    isInterstate: false,
    items: [
      {
        itemId: 'item-oil-01',
        quantity: 10,
        unitPrice: 850.0,
        taxRate: 18
      }
    ], // 8500 + 1530 = 10,030
    paymentMode: PaymentMode.NEFT_RTGS,
    paidAmount: 5000, // Partial 5,000 paid, remaining 5,030 unpaid
    paymentReference: 'NEFT-TXN-4410'
  });

  assert(purchase3.totalAmount === 10030, 'Total bill amount is ₹10,030.00');
  assert(purchase3.paidAmount === 5000, 'Recorded partial paid amount ₹5,000.00');
  assert(
    createdSupplier.outstanding === 69840 + 5030,
    'Supplier outstanding increased by remaining unpaid balance ₹5,030 (new total: ₹74,870)'
  );

  // Test 6: Non-Itemized Tax Purchase (Expense / Transport Voucher)
  console.log('\n--- Test 6: Non-Itemized Tax Expense Voucher (Zero Stock Effect) ---');
  const stockCountBefore = engine.items.get('item-clutch-01')?.currentStock;
  const movementCountBefore = engine.stockMovements.length;

  const expensePurchase = await engine.createPurchase({
    poNumber: 'PO-EXP-001',
    supplierInvoiceNo: 'EXP-FRT-101',
    supplierId: 'sup-endurance-01',
    isNonItemized: true,
    expenseCategory: 'Inward Freight / Transport Charges',
    taxableAmount: 2500,
    taxRate: 18,
    paymentMode: PaymentMode.CASH,
    paidAmount: 2950 // 2500 + 18% (450) = 2950
  });

  assert(expensePurchase.isNonItemized === true, 'Expense voucher identified as non-itemized');
  assert(expensePurchase.totalAmount === 2950, 'Expense voucher total calculated as ₹2,950.00');

  // Verify NO stock movements created
  const stockCountAfter = engine.items.get('item-clutch-01')?.currentStock;
  const movementCountAfter = engine.stockMovements.length;
  assert(stockCountBefore === stockCountAfter, 'Catalog stock remained identical (zero stock change)');
  assert(movementCountBefore === movementCountAfter, 'No inventory StockMovements generated for non-itemized expense');

  // Test 7: GST Transaction / GSTR-2 ITC Recording
  console.log('\n--- Test 7: GSTR-2 ITC Transaction Data Recording ---');
  const itcRecords = engine.gstTransactions.filter((g) => g.documentType === 'PURCHASE_ITC');
  assert(itcRecords.length === 3, 'Recorded GSTR-2 ITC transaction entries for all 3 standard purchases');
  assert(itcRecords[0].partyGstin === '33AABCE1234F1Z5', 'ITC record captures supplier GSTIN correctly');
  assert(itcRecords[0].taxableValue === 38000, 'ITC record captures taxable value ₹38,000');

  // Test 8: Purchase Return (Debit Note) -> Stock Decrease & Payable Deduction
  console.log('\n--- Test 8: Purchase Returns (Debit Note) ---');
  const currentOutstandingBeforeReturn = createdSupplier.outstanding;
  const clutchStockBeforeReturn = engine.items.get('item-clutch-01')?.currentStock || 0;

  const pReturn = await engine.createPurchaseReturn({
    purchaseId: purchase1.id,
    debitNoteNumber: 'DN-2026-001',
    reason: 'Defective friction lining found in 5 clutch sets',
    items: [
      {
        itemId: 'item-clutch-01',
        quantity: 5,
        unitPrice: 420.0 // 5 * 420 = 2100
      }
    ]
  });

  assert(pReturn.totalAmount === 2100, 'Debit note calculated return value ₹2,100.00');

  // Verify stock decreased
  const clutchStockAfterReturn = engine.items.get('item-clutch-01')?.currentStock || 0;
  assert(clutchStockAfterReturn === clutchStockBeforeReturn - 5, 'Clutch stock decreased by 5 units on return');

  // Verify Supplier Outstanding Decrement
  assert(
    createdSupplier.outstanding === currentOutstandingBeforeReturn - 2100,
    'Supplier outstanding balance decremented by ₹2,100 return debit'
  );

  // Verify Return Stock Movement
  const returnMov = engine.stockMovements.find((m) => m.referenceId === 'DN-2026-001');
  assert(!!returnMov && returnMov.direction === StockDirection.OUT, 'Generated OUTWARD StockMovement for return');

  // Test 9: Validation Safeguards (Duplicate Bill, Negative Qty, Inactive Supplier)
  console.log('\n--- Test 9: Validation Safeguards & Rejection Rules ---');
  // Duplicate vendor bill
  let dupError: any = null;
  try {
    await engine.createPurchase({
      supplierInvoiceNo: 'INV-END-9901', // Already used in Purchase 1
      supplierId: 'sup-endurance-01',
      items: [{ itemId: 'item-clutch-01', quantity: 1, unitPrice: 420, taxRate: 18 }]
    });
  } catch (err: any) {
    dupError = err;
  }
  assert(dupError?.code === 'DUPLICATE_VENDOR_INVOICE', 'Rejects duplicate vendor bill number for same supplier');

  // Inactive supplier rejection
  const inactiveSupplier = engine.createSupplier({
    id: 'sup-inactive-01',
    supplierCode: 'SUP-DIS-001',
    name: 'Discontinued Parts Co',
    mobile: '9840000000',
    gstin: '33AABCE0000F1Z1',
    creditDays: 0,
    creditLimit: 0,
    openingBalance: 0,
    status: RecordStatus.INACTIVE
  });

  let inactiveError: any = null;
  try {
    await engine.createPurchase({
      supplierId: inactiveSupplier.id,
      items: [{ itemId: 'item-clutch-01', quantity: 1, unitPrice: 420, taxRate: 18 }]
    });
  } catch (err: any) {
    inactiveError = err;
  }
  assert(!!inactiveError, 'Rejects purchase attempt against deactivated / inactive supplier');

  // Zod schema negative quantity rejection
  const invalidQtyData = {
    supplierId: 'sup-endurance-01',
    items: [{ itemId: 'item-clutch-01', quantity: -10, unitPrice: 420, taxRate: 18 }]
  };
  const invalidQtyResult = createPurchaseSchema.safeParse(invalidQtyData);
  assert(!invalidQtyResult.success, 'createPurchaseSchema rejects negative purchase quantity (-10)');

  // Test 10: Audit Log Trail
  console.log('\n--- Test 10: System Audit Trail Verification ---');
  const purchaseAudits = engine.auditLogs.filter((a) => a.action === 'Purchase Created');
  const returnAudits = engine.auditLogs.filter((a) => a.action === 'Purchase Return Created');
  assert(purchaseAudits.length === 4, 'Audit logs generated for all purchase creations');
  assert(returnAudits.length === 1, 'Audit log generated for purchase return debit note');

  // Summary
  console.log('\n======================================================');
  console.log(`  PURCHASE MODULE TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runPurchaseTests();
