import { prisma } from '../config/database.js';
import {
  CreateSaleInput,
  SaleSearchQueryInput,
  CreateSaleReturnInput
} from '../validators/sale.validator.js';
import { StockMovementType, StockDirection, RecordStatus, PaymentMode } from '@prisma/client';
import { stockService } from './stock.service.js';
import { recordAuditLog } from '../middleware/auditLogger.js';

export class SaleService {
  /**
   * Atomic, concurrency-safe POS sale transaction.
   * Handles:
   * 1. Stock validation & atomic deduction
   * 2. Multi-tier GST (CGST/SGST or IGST)
   * 3. Cart discounts & inline rates
   * 4. Multi-mode split payments & customer credit receivables
   * 5. Held bills (DRAFT) vs live completed transactions
   * 6. GSTR-1 B2B / B2C filing records
   * 7. System audit logging
   */
  async createSale(input: CreateSaleInput, actor?: { userId?: string; username?: string }, branchIdParam?: string) {
    return await prisma.$transaction(async (tx) => {
      // 1. Determine Branch
      let targetBranchId = input.branchId || branchIdParam;
      if (!targetBranchId) {
        const defaultBranch = await tx.branch.findFirst();
        if (!defaultBranch) {
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

      const invoiceNumber = input.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`;
      const isInterstate = input.isInterstate || false;
      const isDraftHold = input.status === RecordStatus.DRAFT;

      let subtotalTaxable = 0;
      let totalCgst = 0;
      let totalSgst = 0;
      let totalIgst = 0;
      let totalDiscount = input.invoiceDiscount || 0;
      let rawGrandTotal = 0;

      const processedItems: Array<{
        itemId: string;
        quantity: number;
        unitRate: number;
        mrp: number;
        discountAmount: number;
        taxRate: number;
        taxableAmount: number;
        cgst: number;
        sgst: number;
        igst: number;
        totalAmount: number;
      }> = [];

      // 2. Line Items Calculation & Validation
      for (const line of input.items) {
        const qty = line.quantity;
        const rate = line.unitRate;
        const lineDiscount = line.discountAmount || 0;
        totalDiscount += lineDiscount;

        const lineTaxable = Math.max(0, qty * rate - lineDiscount);
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
        rawGrandTotal += lineTotal;

        processedItems.push({
          itemId: line.itemId,
          quantity: qty,
          unitRate: rate,
          mrp: line.mrp || rate,
          discountAmount: lineDiscount,
          taxRate,
          taxableAmount: lineTaxable,
          cgst: lineCgst,
          sgst: lineSgst,
          igst: lineIgst,
          totalAmount: lineTotal
        });
      }

      // Add Additional Charges (Fitting / Freight)
      const additionalCharges = (input.fittingCharges || 0) + (input.freightCharges || 0);
      rawGrandTotal += additionalCharges;

      // Indian POS Round-off computation (nearest rupee)
      const roundedTotal = Math.round(rawGrandTotal);
      const roundOff = Number((roundedTotal - rawGrandTotal).toFixed(2));
      const grandTotal = roundedTotal;

      // 3. Payment Settlement Calculations
      let totalPaid = 0;
      const paymentRecords: Array<{ paymentMode: PaymentMode; amount: number; referenceNo?: string }> = [];

      if (input.splitPayments && input.splitPayments.length > 0) {
        for (const sp of input.splitPayments) {
          totalPaid += sp.amount;
          paymentRecords.push({
            paymentMode: sp.paymentMode,
            amount: sp.amount,
            referenceNo: sp.referenceNo || undefined
          });
        }
      } else {
        const defaultMode = input.paymentMode || PaymentMode.CASH;
        if (defaultMode === PaymentMode.CREDIT) {
          totalPaid = 0;
          paymentRecords.push({ paymentMode: PaymentMode.CREDIT, amount: grandTotal });
        } else {
          totalPaid = input.paidAmount !== undefined ? input.paidAmount : grandTotal;
          paymentRecords.push({
            paymentMode: defaultMode,
            amount: totalPaid,
            referenceNo: input.paymentReference || undefined
          });
        }
      }

      const unpaidReceivable = Math.max(0, grandTotal - totalPaid);
      const isB2B = !!(input.customerGstin && input.customerGstin.length >= 15);

      // 4. Create Sale Record
      const sale = await tx.sale.create({
        data: {
          invoiceNumber,
          customerId: input.customerId || null,
          customerVehicleId: input.customerVehicleId || null,
          customerName: input.customerName || 'Walk-in Customer',
          customerMobile: input.customerMobile || null,
          branchId: targetBranchId!,
          createdById: actor?.userId || null,
          invoiceDate: input.invoiceDate ? new Date(input.invoiceDate) : new Date(),
          taxableAmount: subtotalTaxable,
          cgstAmount: totalCgst,
          sgstAmount: totalSgst,
          igstAmount: totalIgst,
          discountTotal: totalDiscount,
          roundOff,
          fittingCharges: input.fittingCharges || 0,
          notes: input.notes || null,
          totalAmount: grandTotal,
          paidAmount: totalPaid,
          paymentMode: input.paymentMode || PaymentMode.CASH,
          status: isDraftHold ? RecordStatus.DRAFT : RecordStatus.COMPLETED,
          isB2B
        }
      });

      // 5. Create Sale Item Lines & Decrement Stock (Only for Live Completed Sales)
      for (const it of processedItems) {
        await tx.saleItem.create({
          data: {
            saleId: sale.id,
            itemId: it.itemId,
            quantity: it.quantity,
            unitRate: it.unitRate,
            mrp: it.mrp,
            discountAmount: it.discountAmount,
            taxRate: it.taxRate,
            taxableAmount: it.taxableAmount,
            cgst: it.cgst,
            sgst: it.sgst,
            igst: it.igst,
            totalAmount: it.totalAmount
          }
        });

        // Deduct physical stock only if live completed sale (NOT on hold draft)
        if (!isDraftHold) {
          await stockService.recordMovement(
            {
              itemId: it.itemId,
              branchId: targetBranchId,
              userId: actor?.userId,
              username: actor?.username,
              movementType: StockMovementType.SALE,
              direction: StockDirection.OUT,
              quantity: it.quantity,
              unitRate: it.unitRate,
              referenceType: 'POS_INVOICE',
              referenceId: invoiceNumber,
              reason: `Retail Counter Sale to ${sale.customerName} (Inv #${invoiceNumber})`
            },
            tx
          );
        }
      }

      // 6. Record Payment Records & Customer Ledger Updates (Only for Live Completed Sales)
      if (!isDraftHold) {
        for (const p of paymentRecords) {
          await tx.salePayment.create({
            data: {
              saleId: sale.id,
              paymentMode: p.paymentMode,
              amount: p.amount,
              referenceNo: p.referenceNo || null,
              paymentDate: new Date()
            }
          });
        }

        // Update Customer Outstanding Receivable if Credit or Unpaid
        if (input.customerId && unpaidReceivable > 0) {
          await tx.customer.update({
            where: { id: input.customerId },
            data: {
              outstanding: {
                increment: unpaidReceivable
              }
            }
          });
        }

        // 7. Record GSTR-1 Transaction Data
        const returnPeriod = `${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${new Date().getFullYear()}`;
        await tx.gSTTransaction.create({
          data: {
            returnPeriod,
            documentType: isB2B ? 'B2B_INVOICE' : 'B2C_INVOICE',
            documentNumber: invoiceNumber,
            date: sale.invoiceDate,
            partyGstin: input.customerGstin || null,
            partyName: sale.customerName,
            hsnCode: '8714',
            taxableValue: subtotalTaxable,
            cgst: totalCgst,
            sgst: totalSgst,
            igst: totalIgst,
            totalValue: grandTotal,
            isFiled: false
          }
        });

        // 8. Record System Audit Log
        await recordAuditLog({
          userId: actor?.userId,
          username: actor?.username || 'Counter Cashier',
          action: 'Sale Invoice Created',
          module: 'Sales',
          entity: 'Sale',
          entityId: sale.id,
          newValue: {
            invoiceNumber,
            customer: sale.customerName,
            totalAmount: grandTotal,
            paidAmount: totalPaid,
            unpaidReceivable,
            itemCount: processedItems.length
          },
          notes: `POS invoice ${invoiceNumber} created for ₹${grandTotal.toFixed(2)} (${paymentRecords.map((p) => p.paymentMode).join(', ')})`
        });
      }

      return {
        id: sale.id,
        invoiceNumber: sale.invoiceNumber,
        customerName: sale.customerName,
        customerMobile: sale.customerMobile,
        taxableAmount: subtotalTaxable,
        cgstAmount: totalCgst,
        sgstAmount: totalSgst,
        igstAmount: totalIgst,
        discountTotal: totalDiscount,
        roundOff,
        totalAmount: grandTotal,
        paidAmount: totalPaid,
        unpaidReceivable,
        status: sale.status,
        itemCount: processedItems.length
      };
    });
  }

  /**
   * Search and filter sales invoices.
   */
  async searchSales(params: SaleSearchQueryInput) {
    const { customerId, branchId, status, paymentMode, startDate, endDate, q } = params;
    const page = params.page || 1;
    const limit = params.limit || 30;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (branchId) where.branchId = branchId;
    if (status) where.status = status;
    if (paymentMode) where.paymentMode = paymentMode;

    if (startDate || endDate) {
      where.invoiceDate = {};
      if (startDate) where.invoiceDate.gte = new Date(startDate);
      if (endDate) where.invoiceDate.lte = new Date(endDate);
    }

    if (q && q.trim()) {
      const token = q.trim();
      where.OR = [
        { invoiceNumber: { contains: token, mode: 'insensitive' } },
        { customerName: { contains: token, mode: 'insensitive' } },
        { customerMobile: { contains: token, mode: 'insensitive' } }
      ];
    }

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        skip,
        take: limit,
        orderBy: { invoiceDate: 'desc' },
        include: {
          items: {
            include: {
              item: { select: { id: true, sku: true, name: true, hsnCode: true } }
            }
          },
          payments: true
        }
      }),
      prisma.sale.count({ where })
    ]);

    const formatted = sales.map((s) => ({
      id: s.id,
      invoiceNumber: s.invoiceNumber,
      customerName: s.customerName,
      customerMobile: s.customerMobile || 'N/A',
      invoiceDate: s.invoiceDate,
      taxableAmount: Number(s.taxableAmount),
      cgstAmount: Number(s.cgstAmount),
      sgstAmount: Number(s.sgstAmount),
      igstAmount: Number(s.igstAmount),
      discountTotal: Number(s.discountTotal),
      roundOff: Number(s.roundOff),
      totalAmount: Number(s.totalAmount),
      paidAmount: Number(s.paidAmount),
      unpaidBalance: Math.max(0, Number(s.totalAmount) - Number(s.paidAmount)),
      paymentMode: s.paymentMode,
      status: s.status,
      isB2B: s.isB2B,
      itemCount: s.items.length,
      items: s.items.map((it) => ({
        itemId: it.itemId,
        sku: it.item.sku,
        name: it.item.name,
        quantity: Number(it.quantity),
        unitRate: Number(it.unitRate),
        totalAmount: Number(it.totalAmount)
      }))
    }));

    return {
      sales: formatted,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Deep details for a single sales invoice with all printing metadata.
   */
  async getSaleById(id: string) {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        customer: true,
        customerVehicle: true,
        branch: { include: { company: true } },
        createdBy: { select: { id: true, username: true, fullName: true } },
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

    if (!sale) {
      throw { statusCode: 404, message: 'Sale invoice record not found', code: 'SALE_NOT_FOUND' };
    }

    const total = Number(sale.totalAmount);
    const paid = Number(sale.paidAmount);

    return {
      ...sale,
      taxableAmount: Number(sale.taxableAmount),
      cgstAmount: Number(sale.cgstAmount),
      sgstAmount: Number(sale.sgstAmount),
      igstAmount: Number(sale.igstAmount),
      discountTotal: Number(sale.discountTotal),
      roundOff: Number(sale.roundOff),
      totalAmount: total,
      paidAmount: paid,
      unpaidBalance: Math.max(0, total - paid),
      items: sale.items.map((it) => ({
        id: it.id,
        itemId: it.itemId,
        sku: it.item.sku,
        name: it.item.name,
        hsnCode: it.item.hsnCode,
        brand: it.item.brand?.name || 'OEM',
        unit: it.item.unit?.code || 'PCS',
        quantity: Number(it.quantity),
        unitRate: Number(it.unitRate),
        mrp: Number(it.mrp),
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
   * Process a Sales Return (Credit Note):
   * - Restocks parts atomically with StockMovement (SALE_RETURN)
   * - Reduces customer outstanding receivable or records cash refund
   * - Generates GST credit note record
   * - Records AuditLog
   */
  async createSaleReturn(input: CreateSaleReturnInput, actor?: { userId?: string; username?: string }) {
    return await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id: input.saleId },
        include: { items: true, customer: true }
      });

      if (!sale) {
        throw { statusCode: 404, message: 'Original sales invoice not found', code: 'SALE_NOT_FOUND' };
      }

      const creditNoteNumber = input.creditNoteNumber || `CN-${Date.now().toString().slice(-6)}`;
      let refundTotal = 0;

      const returnItemsData: Array<{
        itemId: string;
        quantity: number;
        unitRate: number;
        totalAmount: number;
        isRestocked: boolean;
      }> = [];

      for (const retLine of input.items) {
        const origItem = sale.items.find((it) => it.itemId === retLine.itemId);
        if (!origItem) {
          throw {
            statusCode: 400,
            message: `Item ${retLine.itemId} was not present in the original invoice`,
            code: 'INVALID_RETURN_ITEM'
          };
        }

        const maxQty = Number(origItem.quantity);
        if (retLine.quantity > maxQty) {
          throw {
            statusCode: 400,
            message: `Return quantity (${retLine.quantity}) exceeds invoiced quantity (${maxQty})`,
            code: 'RETURN_EXCEEDS_INVOICE'
          };
        }

        const lineTotal = retLine.quantity * retLine.unitRate;
        refundTotal += lineTotal;

        returnItemsData.push({
          itemId: retLine.itemId,
          quantity: retLine.quantity,
          unitRate: retLine.unitRate,
          totalAmount: lineTotal,
          isRestocked: retLine.isRestocked !== false
        });
      }

      // 1. Create SaleReturn Record
      const saleReturn = await tx.saleReturn.create({
        data: {
          creditNoteNumber,
          saleId: sale.id,
          returnDate: input.returnDate ? new Date(input.returnDate) : new Date(),
          refundAmount: refundTotal,
          reason: input.reason,
          status: RecordStatus.COMPLETED
        }
      });

      // 2. Create SaleReturnItem records & Restock
      for (const rItem of returnItemsData) {
        await tx.saleReturnItem.create({
          data: {
            returnId: saleReturn.id,
            itemId: rItem.itemId,
            quantity: rItem.quantity,
            unitRate: rItem.unitRate,
            totalAmount: rItem.totalAmount,
            isRestocked: rItem.isRestocked
          }
        });

        if (rItem.isRestocked) {
          await stockService.recordMovement(
            {
              itemId: rItem.itemId,
              branchId: sale.branchId,
              userId: actor?.userId,
              username: actor?.username,
              movementType: StockMovementType.SALE_RETURN,
              direction: StockDirection.IN,
              quantity: rItem.quantity,
              unitRate: rItem.unitRate,
              referenceType: 'SALES_CREDIT_NOTE',
              referenceId: creditNoteNumber,
              reason: `Customer Return (${input.reason}) from ${sale.customerName}`
            },
            tx
          );
        }
      }

      // 3. Adjust Customer Outstanding if registered
      if (sale.customerId && Number(sale.paidAmount) < Number(sale.totalAmount)) {
        await tx.customer.update({
          where: { id: sale.customerId },
          data: {
            outstanding: {
              decrement: refundTotal
            }
          }
        });
      }

      // 4. Record GST Credit Note Transaction
      const returnPeriod = `${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${new Date().getFullYear()}`;
      await tx.gSTTransaction.create({
        data: {
          returnPeriod,
          documentType: 'CREDIT_NOTE',
          documentNumber: creditNoteNumber,
          date: saleReturn.returnDate,
          partyGstin: sale.customer?.gstin || null,
          partyName: sale.customerName,
          hsnCode: '8714',
          taxableValue: refundTotal,
          cgst: 0,
          sgst: 0,
          igst: 0,
          totalValue: refundTotal,
          isFiled: false
        }
      });

      // 5. Audit Log
      await recordAuditLog({
        userId: actor?.userId,
        username: actor?.username || 'Counter Cashier',
        action: 'Sale Return Created',
        module: 'Sales',
        entity: 'SaleReturn',
        entityId: saleReturn.id,
        newValue: {
          creditNoteNumber,
          saleId: sale.id,
          refundTotal,
          reason: input.reason
        },
        notes: `Created sales credit note ${creditNoteNumber} for ₹${refundTotal.toFixed(2)} (${input.reason})`
      });

      return {
        id: saleReturn.id,
        creditNoteNumber,
        saleId: sale.id,
        refundAmount: refundTotal,
        reason: input.reason,
        status: saleReturn.status
      };
    });
  }

  /**
   * List all held draft bills for recall.
   */
  async getHeldBills(branchId?: string) {
    return await this.searchSales({
      branchId,
      status: RecordStatus.DRAFT,
      page: 1,
      limit: 50
    });
  }

  /**
   * Delete a held draft bill.
   */
  async deleteHeldBill(id: string, actor?: { userId?: string; username?: string }) {
    const sale = await prisma.sale.findUnique({ where: { id } });
    if (!sale) {
      throw { statusCode: 404, message: 'Draft invoice not found', code: 'DRAFT_NOT_FOUND' };
    }
    if (sale.status !== RecordStatus.DRAFT) {
      throw { statusCode: 400, message: 'Only held draft bills can be discarded', code: 'CANNOT_DELETE_COMPLETED' };
    }

    await prisma.sale.delete({ where: { id } });

    if (actor) {
      await recordAuditLog({
        userId: actor.userId,
        username: actor.username || 'System',
        action: 'Held Bill Discarded',
        module: 'Sales',
        entity: 'Sale',
        entityId: id,
        notes: `Discarded held bill ${sale.invoiceNumber}`
      });
    }

    return { id, message: `Held bill ${sale.invoiceNumber} deleted` };
  }
}

export const saleService = new SaleService();
