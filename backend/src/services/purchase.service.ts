import { prisma } from '../config/database.js';
import {
  CreatePurchaseInput,
  PurchaseSearchQueryInput,
  CreatePurchaseReturnInput
} from '../validators/purchase.validator.js';
import { StockMovementType, StockDirection, RecordStatus, PaymentMode } from '@prisma/client';
import { stockService } from './stock.service.js';
import { recordAuditLog } from '../middleware/auditLogger.js';

export class PurchaseService {
  /**
   * Atomic, comprehensive purchase invoice creation.
   * Handles:
   * - Itemized purchase with atomic stock increase & stock movement ledger entries
   * - Non-itemized tax purchase/expense vouchers (zero stock effect)
   * - Multi-tier GST calculation (CGST/SGST vs IGST)
   * - Supplier payable & instant payment accounting
   * - GSTR-2 / ITC ledger recording
   * - Audit logging
   */
  async createPurchase(input: CreatePurchaseInput, actor?: { userId?: string; username?: string }, branchIdParam?: string) {
    return await prisma.$transaction(async (tx) => {
      // 1. Verify Supplier
      const supplier = await tx.supplier.findUnique({
        where: { id: input.supplierId }
      });

      if (!supplier) {
        throw { statusCode: 404, message: 'Supplier not found', code: 'SUPPLIER_NOT_FOUND' };
      }

      if (supplier.status === RecordStatus.INACTIVE) {
        throw { statusCode: 400, message: 'Cannot create purchase against inactive supplier', code: 'SUPPLIER_INACTIVE' };
      }

      // 2. Duplicate Supplier Bill Detection
      if (input.supplierInvoiceNo && input.supplierInvoiceNo.trim()) {
        const existingInvoice = await tx.purchase.findFirst({
          where: {
            supplierId: input.supplierId,
            supplierInvoiceNo: input.supplierInvoiceNo.trim()
          }
        });

        if (existingInvoice) {
          throw {
            statusCode: 409,
            message: `Duplicate vendor invoice #${input.supplierInvoiceNo} already exists for ${supplier.name} (PO: ${existingInvoice.poNumber})`,
            code: 'DUPLICATE_VENDOR_INVOICE'
          };
        }
      }

      // 3. Determine Branch
      let targetBranchId = input.branchId || branchIdParam;
      if (!targetBranchId) {
        const defaultBranch = await tx.branch.findFirst();
        if (!defaultBranch) {
          // If no branch exists, create default primary branch
          const company = await tx.company.findFirst() || await tx.company.create({
            data: {
              tradeName: 'BIKE ERP Motors',
              legalName: 'BIKE ERP Solutions Pvt Ltd',
              gstin: '33AAAAA0000A1Z5',
              pan: 'AAAAA0000A',
              email: 'admin@bikeerp.com',
              phone: '9876543210',
              addressLine1: 'Main Road',
              city: 'Chennai',
              state: 'Tamil Nadu',
              pincode: '600001',
              stateCode: '33',
              financialYear: '2026-2027'
            }
          });
          const newBranch = await tx.branch.create({
            data: {
              companyId: company.id,
              branchCode: 'MAIN-01',
              name: 'Main Central Hub',
              address: 'Chennai, Tamil Nadu - 33',
              phone: '9876543210'
            }
          });
          targetBranchId = newBranch.id;
        } else {
          targetBranchId = defaultBranch.id;
        }
      }

      const poNumber = input.poNumber || `PO-${Date.now().toString().slice(-6)}`;
      const isInterstate = input.isInterstate || false;

      let subtotalTaxable = 0;
      let totalCgst = 0;
      let totalSgst = 0;
      let totalIgst = 0;
      let grandTotal = 0;

      const processedItems: Array<{
        itemId: string;
        quantity: number;
        unitPrice: number;
        discountAmount: number;
        taxRate: number;
        taxableAmount: number;
        cgst: number;
        sgst: number;
        igst: number;
        totalAmount: number;
      }> = [];

      // 4. Process Items (Itemized vs Non-Itemized)
      if (input.isNonItemized) {
        // Non-itemized expense purchase (e.g. freight, office consumable, transport)
        subtotalTaxable = input.taxableAmount || 0;
        const taxRate = input.taxRate || 18;
        const totalTax = (subtotalTaxable * taxRate) / 100;

        if (isInterstate) {
          totalIgst = totalTax;
        } else {
          totalCgst = totalTax / 2;
          totalSgst = totalTax / 2;
        }
        grandTotal = subtotalTaxable + totalTax;
      } else {
        if (!input.items || input.items.length === 0) {
          throw { statusCode: 400, message: 'Itemized purchase must contain at least one line item', code: 'ITEMS_REQUIRED' };
        }

        for (const line of input.items) {
          const qty = line.quantity;
          const rate = line.unitPrice;
          const discount = line.discountAmount || 0;
          const lineTaxable = Math.max(0, qty * rate - discount);
          const taxRate = line.taxRate;
          const lineTax = (lineTaxable * taxRate) / 100;

          let lineCgst = 0;
          let lineSgst = 0;
          let lineIgst = 0;

          if (isInterstate) {
            lineIgst = lineTax;
          } else {
            lineCgst = lineTax / 2;
            lineSgst = lineTax / 2;
          }

          const lineTotal = lineTaxable + lineTax;

          subtotalTaxable += lineTaxable;
          totalCgst += lineCgst;
          totalSgst += lineSgst;
          totalIgst += lineIgst;
          grandTotal += lineTotal;

          processedItems.push({
            itemId: line.itemId,
            quantity: qty,
            unitPrice: rate,
            discountAmount: discount,
            taxRate,
            taxableAmount: lineTaxable,
            cgst: lineCgst,
            sgst: lineSgst,
            igst: lineIgst,
            totalAmount: lineTotal
          });
        }
      }

      const paidAmount = Math.min(input.paidAmount || 0, grandTotal);
      const remainingPayable = grandTotal - paidAmount;

      // 5. Create Purchase Header
      const purchase = await tx.purchase.create({
        data: {
          poNumber,
          supplierInvoiceNo: input.supplierInvoiceNo || null,
          supplierId: input.supplierId,
          branchId: targetBranchId!,
          createdById: actor?.userId || null,
          invoiceDate: input.invoiceDate ? new Date(input.invoiceDate) : new Date(),
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
          taxableAmount: subtotalTaxable,
          cgstAmount: totalCgst,
          sgstAmount: totalSgst,
          igstAmount: totalIgst,
          totalAmount: grandTotal,
          paidAmount,
          status: remainingPayable === 0 ? RecordStatus.COMPLETED : RecordStatus.APPROVED,
          grnVerified: true,
          notes: input.notes || (input.isNonItemized ? `Expense: ${input.expenseCategory || 'Non-itemized'}` : null)
        }
      });

      // 6. Create Purchase Line Items & Increase Stock (for itemized only)
      if (!input.isNonItemized && processedItems.length > 0) {
        for (const itemData of processedItems) {
          await tx.purchaseItem.create({
            data: {
              purchaseId: purchase.id,
              itemId: itemData.itemId,
              quantity: itemData.quantity,
              unitPrice: itemData.unitPrice,
              discountAmount: itemData.discountAmount,
              taxRate: itemData.taxRate,
              taxableAmount: itemData.taxableAmount,
              cgst: itemData.cgst,
              sgst: itemData.sgst,
              igst: itemData.igst,
              totalAmount: itemData.totalAmount
            }
          });

          // Atomically increase stock & generate immutable StockMovement
          await stockService.recordMovement(
            {
              itemId: itemData.itemId,
              branchId: targetBranchId,
              userId: actor?.userId,
              username: actor?.username,
              movementType: StockMovementType.PURCHASE,
              direction: StockDirection.IN,
              quantity: itemData.quantity,
              unitRate: itemData.unitPrice,
              referenceType: 'PURCHASE_BILL',
              referenceId: poNumber,
              reason: `Supplier Inward GRN: ${supplier.name} (Bill #${input.supplierInvoiceNo || poNumber})`,
              notes: input.notes || undefined
            },
            tx
          );
        }
      }

      // 7. Update Supplier Payable Balance
      if (remainingPayable > 0) {
        await tx.supplier.update({
          where: { id: supplier.id },
          data: {
            outstanding: {
              increment: remainingPayable
            }
          }
        });
      }

      // 8. Process Payments if paidAmount > 0
      if (paidAmount > 0) {
        await tx.purchasePayment.create({
          data: {
            purchaseId: purchase.id,
            paymentMode: input.paymentMode,
            amount: paidAmount,
            referenceNo: input.paymentReference || `PAY-${poNumber}`,
            paymentDate: new Date()
          }
        });

        await tx.paymentVoucher.create({
          data: {
            paymentNo: `PV-${Date.now().toString().slice(-6)}`,
            supplierId: supplier.id,
            createdById: actor?.userId || null,
            date: new Date(),
            amount: paidAmount,
            paymentMode: input.paymentMode,
            referenceNo: input.paymentReference || poNumber,
            remarks: `Payment for Purchase ${poNumber}`
          }
        });
      }

      // 9. Record GST ITC Transaction Data
      const returnPeriod = `${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${new Date().getFullYear()}`;
      await tx.gSTTransaction.create({
        data: {
          returnPeriod,
          documentType: input.isNonItemized ? 'EXPENSE_ITC' : 'PURCHASE_ITC',
          documentNumber: input.supplierInvoiceNo || poNumber,
          date: purchase.invoiceDate,
          partyGstin: supplier.gstin,
          partyName: supplier.name,
          hsnCode: input.isNonItemized ? '9965' : '8714',
          taxableValue: subtotalTaxable,
          cgst: totalCgst,
          sgst: totalSgst,
          igst: totalIgst,
          totalValue: grandTotal,
          isFiled: false
        }
      });

      // 10. System Audit Log
      await recordAuditLog({
        userId: actor?.userId,
        username: actor?.username || 'System',
        action: 'Purchase Created',
        module: 'Purchases',
        entity: 'Purchase',
        entityId: purchase.id,
        newValue: {
          poNumber: purchase.poNumber,
          supplier: supplier.name,
          totalAmount: grandTotal,
          paidAmount,
          remainingPayable,
          isNonItemized: input.isNonItemized
        },
        notes: `Created purchase ${poNumber} for ${supplier.name} total ₹${grandTotal.toFixed(2)} (${input.isNonItemized ? 'Non-itemized expense' : `${processedItems.length} items`})`
      });

      return {
        id: purchase.id,
        poNumber: purchase.poNumber,
        supplierInvoiceNo: purchase.supplierInvoiceNo,
        supplierId: purchase.supplierId,
        supplierName: supplier.name,
        totalAmount: grandTotal,
        taxableAmount: subtotalTaxable,
        cgstAmount: totalCgst,
        sgstAmount: totalSgst,
        igstAmount: totalIgst,
        paidAmount,
        remainingPayable,
        status: purchase.status,
        isNonItemized: input.isNonItemized,
        itemCount: processedItems.length
      };
    });
  }

  /**
   * Search and filter purchase invoices.
   */
  async searchPurchases(params: PurchaseSearchQueryInput) {
    const { supplierId, branchId, status, paymentStatus, startDate, endDate, q, page, limit } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (supplierId) where.supplierId = supplierId;
    if (branchId) where.branchId = branchId;
    if (status) where.status = status;

    if (startDate || endDate) {
      where.invoiceDate = {};
      if (startDate) where.invoiceDate.gte = new Date(startDate);
      if (endDate) where.invoiceDate.lte = new Date(endDate);
    }

    if (q && q.trim()) {
      const token = q.trim();
      where.OR = [
        { poNumber: { contains: token, mode: 'insensitive' } },
        { supplierInvoiceNo: { contains: token, mode: 'insensitive' } },
        { supplier: { name: { contains: token, mode: 'insensitive' } } },
        { supplier: { gstin: { contains: token, mode: 'insensitive' } } }
      ];
    }

    const [purchases, total] = await Promise.all([
      prisma.purchase.findMany({
        where,
        skip,
        take: limit,
        orderBy: { invoiceDate: 'desc' },
        include: {
          supplier: { select: { id: true, name: true, supplierCode: true, gstin: true, mobile: true } },
          items: {
            include: {
              item: { select: { id: true, sku: true, name: true, hsnCode: true } }
            }
          },
          payments: true
        }
      }),
      prisma.purchase.count({ where })
    ]);

    const formatted = purchases
      .map((p) => {
        const total = Number(p.totalAmount);
        const paid = Number(p.paidAmount);
        const outstanding = Math.max(0, total - paid);

        let derivedPaymentStatus = 'UNPAID';
        if (paid >= total) derivedPaymentStatus = 'PAID';
        else if (paid > 0) derivedPaymentStatus = 'PARTIAL';

        return {
          id: p.id,
          poNumber: p.poNumber,
          supplierInvoiceNo: p.supplierInvoiceNo || 'N/A',
          supplierId: p.supplierId,
          supplierName: p.supplier.name,
          supplierGstin: p.supplier.gstin,
          invoiceDate: p.invoiceDate,
          dueDate: p.dueDate,
          taxableAmount: Number(p.taxableAmount),
          cgstAmount: Number(p.cgstAmount),
          sgstAmount: Number(p.sgstAmount),
          igstAmount: Number(p.igstAmount),
          totalAmount: total,
          paidAmount: paid,
          outstandingBalance: outstanding,
          status: p.status,
          paymentStatus: derivedPaymentStatus,
          itemCount: p.items.length,
          items: p.items.map((it) => ({
            itemId: it.itemId,
            sku: it.item.sku,
            name: it.item.name,
            quantity: Number(it.quantity),
            unitPrice: Number(it.unitPrice),
            totalAmount: Number(it.totalAmount)
          }))
        };
      })
      .filter((p) => {
        if (paymentStatus === 'PAID') return p.paymentStatus === 'PAID';
        if (paymentStatus === 'PARTIAL') return p.paymentStatus === 'PARTIAL';
        if (paymentStatus === 'UNPAID') return p.paymentStatus === 'UNPAID';
        return true;
      });

    return {
      purchases: formatted,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Deep details for a single purchase invoice.
   */
  async getPurchaseById(id: string) {
    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: {
          include: {
            item: {
              select: {
                id: true,
                sku: true,
                name: true,
                shortName: true,
                hsnCode: true,
                brand: { select: { name: true } },
                unit: { select: { code: true } }
              }
            }
          }
        },
        payments: true,
        returns: {
          include: {
            items: true
          }
        }
      }
    });

    if (!purchase) {
      throw { statusCode: 404, message: 'Purchase record not found', code: 'PURCHASE_NOT_FOUND' };
    }

    const total = Number(purchase.totalAmount);
    const paid = Number(purchase.paidAmount);

    return {
      ...purchase,
      taxableAmount: Number(purchase.taxableAmount),
      cgstAmount: Number(purchase.cgstAmount),
      sgstAmount: Number(purchase.sgstAmount),
      igstAmount: Number(purchase.igstAmount),
      totalAmount: total,
      paidAmount: paid,
      outstandingBalance: Math.max(0, total - paid),
      items: purchase.items.map((it) => ({
        id: it.id,
        itemId: it.itemId,
        sku: it.item.sku,
        name: it.item.name,
        hsnCode: it.item.hsnCode,
        brand: it.item.brand?.name || 'OEM',
        unit: it.item.unit?.code || 'PCS',
        quantity: Number(it.quantity),
        unitPrice: Number(it.unitPrice),
        discountAmount: Number(it.discountAmount),
        taxRate: Number(it.taxRate),
        taxableAmount: Number(it.taxableAmount),
        cgst: Number(it.cgst),
        sgst: Number(it.sgst),
        igst: Number(it.igst),
        totalAmount: Number(it.totalAmount)
      }))
    };
  }

  /**
   * Process a Purchase Return (Debit Note):
   * - Atomically decreases item stock with StockMovement (PURCHASE_RETURN)
   * - Reduces Supplier outstanding payable
   * - Generates GST debit note record
   * - Records AuditLog
   */
  async createPurchaseReturn(input: CreatePurchaseReturnInput, actor?: { userId?: string; username?: string }) {
    return await prisma.$transaction(async (tx) => {
      const purchase = await tx.purchase.findUnique({
        where: { id: input.purchaseId },
        include: { supplier: true, items: true }
      });

      if (!purchase) {
        throw { statusCode: 404, message: 'Original purchase record not found', code: 'PURCHASE_NOT_FOUND' };
      }

      const debitNoteNumber = input.debitNoteNumber || `DN-${Date.now().toString().slice(-6)}`;
      let returnTotal = 0;

      const returnItemsData: Array<{
        itemId: string;
        quantity: number;
        unitPrice: number;
        totalAmount: number;
        defectNote?: string;
      }> = [];

      for (const retLine of input.items) {
        const origItem = purchase.items.find((it) => it.itemId === retLine.itemId);
        if (!origItem) {
          throw {
            statusCode: 400,
            message: `Item ${retLine.itemId} was not present in the original purchase invoice`,
            code: 'INVALID_RETURN_ITEM'
          };
        }

        const maxQty = Number(origItem.quantity);
        if (retLine.quantity > maxQty) {
          throw {
            statusCode: 400,
            message: `Return quantity (${retLine.quantity}) cannot exceed purchased quantity (${maxQty})`,
            code: 'RETURN_EXCEEDS_PURCHASE'
          };
        }

        const lineTotal = retLine.quantity * retLine.unitPrice;
        returnTotal += lineTotal;

        returnItemsData.push({
          itemId: retLine.itemId,
          quantity: retLine.quantity,
          unitPrice: retLine.unitPrice,
          totalAmount: lineTotal,
          defectNote: retLine.defectNote || undefined
        });
      }

      // 1. Create PurchaseReturn Record
      const purchaseReturn = await tx.purchaseReturn.create({
        data: {
          debitNoteNumber,
          purchaseId: purchase.id,
          returnDate: input.returnDate ? new Date(input.returnDate) : new Date(),
          totalAmount: returnTotal,
          reason: input.reason,
          status: RecordStatus.APPROVED
        }
      });

      // 2. Create PurchaseReturnItem entries & Atomically Decrease Stock
      for (const rItem of returnItemsData) {
        await tx.purchaseReturnItem.create({
          data: {
            returnId: purchaseReturn.id,
            itemId: rItem.itemId,
            quantity: rItem.quantity,
            unitPrice: rItem.unitPrice,
            totalAmount: rItem.totalAmount,
            defectNote: rItem.defectNote
          }
        });

        await stockService.recordMovement(
          {
            itemId: rItem.itemId,
            branchId: purchase.branchId,
            userId: actor?.userId,
            username: actor?.username,
            movementType: StockMovementType.PURCHASE_RETURN,
            direction: StockDirection.OUT,
            quantity: rItem.quantity,
            unitRate: rItem.unitPrice,
            referenceType: 'PURCHASE_DEBIT_NOTE',
            referenceId: debitNoteNumber,
            reason: `Supplier Return (${input.reason}) to ${purchase.supplier.name}`
          },
          tx
        );
      }

      // 3. Reduce Supplier Payable Balance
      await tx.supplier.update({
        where: { id: purchase.supplierId },
        data: {
          outstanding: {
            decrement: returnTotal
          }
        }
      });

      // 4. Record GST Debit Note Transaction
      const returnPeriod = `${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${new Date().getFullYear()}`;
      await tx.gSTTransaction.create({
        data: {
          returnPeriod,
          documentType: 'DEBIT_NOTE_ITC',
          documentNumber: debitNoteNumber,
          date: purchaseReturn.returnDate,
          partyGstin: purchase.supplier.gstin,
          partyName: purchase.supplier.name,
          hsnCode: '8714',
          taxableValue: returnTotal,
          cgst: 0,
          sgst: 0,
          igst: 0,
          totalValue: returnTotal,
          isFiled: false
        }
      });

      // 5. System Audit Log
      await recordAuditLog({
        userId: actor?.userId,
        username: actor?.username || 'System',
        action: 'Purchase Return Created',
        module: 'Purchases',
        entity: 'PurchaseReturn',
        entityId: purchaseReturn.id,
        newValue: {
          debitNoteNumber,
          purchaseId: purchase.id,
          totalAmount: returnTotal,
          reason: input.reason
        },
        notes: `Created purchase return debit note ${debitNoteNumber} for ₹${returnTotal.toFixed(2)}`
      });

      return {
        id: purchaseReturn.id,
        debitNoteNumber,
        purchaseId: purchase.id,
        totalAmount: returnTotal,
        reason: input.reason,
        status: purchaseReturn.status
      };
    });
  }
}

export const purchaseService = new PurchaseService();
