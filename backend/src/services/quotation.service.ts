import { prisma } from '../config/database.js';
import {
  CreateQuotationInput,
  UpdateQuotationInput,
  QuotationSearchQueryInput,
  ConvertQuotationToInvoiceInput
} from '../validators/quotation.validator.js';
import { RecordStatus, PaymentMode } from '@prisma/client';
import { saleService } from './sale.service.js';
import { recordAuditLog } from '../middleware/auditLogger.js';

export class QuotationService {
  /**
   * Create a new formal spare-parts & service estimate quotation.
   */
  async createQuotation(input: CreateQuotationInput, actor?: { userId?: string; username?: string }) {
    return await prisma.$transaction(async (tx) => {
      const quotationNumber = input.quotationNumber || `QT-${Date.now().toString().slice(-6)}`;
      const isInterstate = input.isInterstate || false;

      const validUntil = input.validUntil
        ? new Date(input.validUntil)
        : new Date(Date.now() + (input.validDays || 15) * 24 * 60 * 60 * 1000);

      let subtotalTaxable = 0;
      let totalCgst = 0;
      let totalSgst = 0;
      let totalIgst = 0;
      let totalDiscount = input.discountTotal || 0;
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

      rawGrandTotal += input.fittingCharges || 0;
      const roundedTotal = Math.round(rawGrandTotal);
      const roundOff = Number((roundedTotal - rawGrandTotal).toFixed(2));
      const grandTotal = roundedTotal;
      const totalTax = totalCgst + totalSgst + totalIgst;

      const quotation = await tx.quotation.create({
        data: {
          quotationNumber,
          customerId: input.customerId || null,
          customerName: input.customerName,
          customerMobile: input.customerMobile || null,
          customerGstin: input.customerGstin || null,
          vehicleDetails: input.vehicleDetails || null,
          validUntil,
          taxableAmount: subtotalTaxable,
          cgstAmount: totalCgst,
          sgstAmount: totalSgst,
          igstAmount: totalIgst,
          discountTotal: totalDiscount,
          fittingCharges: input.fittingCharges || 0,
          roundOff,
          subtotal: subtotalTaxable,
          taxAmount: totalTax,
          totalAmount: grandTotal,
          status: input.status || RecordStatus.PENDING,
          remarks: input.remarks || null,
          termsConditions: input.termsConditions || '1. Rates valid for 15 days.\n2. Fitting charges extra as applicable.\n3. Goods once sold cannot be returned after 7 days.'
        }
      });

      for (const itemData of processedItems) {
        await tx.quotationItem.create({
          data: {
            quotationId: quotation.id,
            itemId: itemData.itemId,
            quantity: itemData.quantity,
            unitRate: itemData.unitRate,
            mrp: itemData.mrp,
            discountAmount: itemData.discountAmount,
            taxRate: itemData.taxRate,
            taxableAmount: itemData.taxableAmount,
            cgst: itemData.cgst,
            sgst: itemData.sgst,
            igst: itemData.igst,
            totalAmount: itemData.totalAmount
          }
        });
      }

      if (actor) {
        await recordAuditLog({
          userId: actor.userId,
          username: actor.username || 'System',
          action: 'Quotation Created',
          module: 'Quotations',
          entity: 'Quotation',
          entityId: quotation.id,
          newValue: { quotationNumber, customer: quotation.customerName, totalAmount: grandTotal, items: processedItems.length },
          notes: `Created estimate quote ${quotationNumber} for ₹${grandTotal.toFixed(2)}`
        });
      }

      return {
        id: quotation.id,
        quotationNumber: quotation.quotationNumber,
        customerName: quotation.customerName,
        customerMobile: quotation.customerMobile,
        validUntil: quotation.validUntil,
        taxableAmount: subtotalTaxable,
        taxAmount: totalTax,
        totalAmount: grandTotal,
        status: quotation.status,
        itemCount: processedItems.length
      };
    });
  }

  /**
   * Search and filter quotations with automatic expiry detection.
   */
  async searchQuotations(params: QuotationSearchQueryInput) {
    const { customerId, status, startDate, endDate, q } = params;
    const page = params.page || 1;
    const limit = params.limit || 30;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (status) where.status = status;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    if (q && q.trim()) {
      const token = q.trim();
      where.OR = [
        { quotationNumber: { contains: token, mode: 'insensitive' } },
        { customerName: { contains: token, mode: 'insensitive' } },
        { customerMobile: { contains: token, mode: 'insensitive' } },
        { vehicleDetails: { contains: token, mode: 'insensitive' } }
      ];
    }

    const [quotations, total] = await Promise.all([
      prisma.quotation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              item: { select: { id: true, sku: true, name: true, hsnCode: true } }
            }
          }
        }
      }),
      prisma.quotation.count({ where })
    ]);

    const now = new Date();
    const formatted = quotations.map((q) => {
      const isExpired = q.validUntil < now && q.status === RecordStatus.PENDING;
      const derivedStatus = q.convertedInvoiceNo
        ? 'CONVERTED'
        : isExpired
        ? 'EXPIRED'
        : q.status;

      return {
        id: q.id,
        quotationNumber: q.quotationNumber,
        customerName: q.customerName,
        customerMobile: q.customerMobile || 'N/A',
        customerGstin: q.customerGstin || null,
        vehicleDetails: q.vehicleDetails || 'General',
        validUntil: q.validUntil,
        taxableAmount: Number(q.taxableAmount),
        cgstAmount: Number(q.cgstAmount),
        sgstAmount: Number(q.sgstAmount),
        igstAmount: Number(q.igstAmount),
        discountTotal: Number(q.discountTotal),
        fittingCharges: Number(q.fittingCharges),
        totalAmount: Number(q.totalAmount),
        status: derivedStatus,
        convertedInvoiceNo: q.convertedInvoiceNo || null,
        itemCount: q.items.length,
        items: q.items.map((it) => ({
          itemId: it.itemId,
          sku: it.item.sku,
          name: it.item.name,
          quantity: Number(it.quantity),
          unitRate: Number(it.unitRate),
          totalAmount: Number(it.totalAmount)
        })),
        createdAt: q.createdAt
      };
    });

    return {
      quotations: formatted,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Deep details for a single quotation.
   */
  async getQuotationById(id: string) {
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        customer: true,
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
        }
      }
    });

    if (!quotation) {
      throw { statusCode: 404, message: 'Quotation record not found', code: 'QUOTATION_NOT_FOUND' };
    }

    const now = new Date();
    const isExpired = quotation.validUntil < now && quotation.status === RecordStatus.PENDING;

    return {
      ...quotation,
      taxableAmount: Number(quotation.taxableAmount),
      cgstAmount: Number(quotation.cgstAmount),
      sgstAmount: Number(quotation.sgstAmount),
      igstAmount: Number(quotation.igstAmount),
      discountTotal: Number(quotation.discountTotal),
      fittingCharges: Number(quotation.fittingCharges),
      roundOff: Number(quotation.roundOff),
      subtotal: Number(quotation.subtotal),
      taxAmount: Number(quotation.taxAmount),
      totalAmount: Number(quotation.totalAmount),
      status: quotation.convertedInvoiceNo ? 'CONVERTED' : isExpired ? 'EXPIRED' : quotation.status,
      items: quotation.items.map((it) => ({
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
   * Duplicate an existing quotation for quick revisions.
   */
  async duplicateQuotation(id: string, actor?: { userId?: string; username?: string }) {
    const original = await this.getQuotationById(id);
    const newQuotationNumber = `QT-${Date.now().toString().slice(-6)}`;

    return await this.createQuotation(
      {
        quotationNumber: newQuotationNumber,
        customerId: original.customerId || undefined,
        customerName: original.customerName,
        customerMobile: original.customerMobile || undefined,
        customerGstin: original.customerGstin || undefined,
        vehicleDetails: original.vehicleDetails || undefined,
        validDays: 15,
        fittingCharges: Number(original.fittingCharges),
        discountTotal: Number(original.discountTotal),
        remarks: `Revised copy of ${original.quotationNumber}`,
        termsConditions: original.termsConditions || undefined,
        items: original.items.map((it) => ({
          itemId: it.itemId,
          quantity: it.quantity,
          unitRate: it.unitRate,
          mrp: it.mrp,
          discountAmount: it.discountAmount,
          taxRate: it.taxRate,
          hsnCode: it.hsnCode
        }))
      },
      actor
    );
  }

  /**
   * Convert an approved quotation directly into a live POS Sales Invoice without manual re-entry.
   * Revalidates live inventory stock and creates complete sales ledger records.
   */
  async convertToInvoice(input: ConvertQuotationToInvoiceInput, actor?: { userId?: string; username?: string }, branchIdParam?: string) {
    const quotation = await prisma.quotation.findUnique({
      where: { id: input.quotationId },
      include: { items: true }
    });

    if (!quotation) {
      throw { statusCode: 404, message: 'Quotation not found', code: 'QUOTATION_NOT_FOUND' };
    }

    if (quotation.convertedInvoiceNo) {
      throw {
        statusCode: 400,
        message: `Quotation ${quotation.quotationNumber} has already been converted to Invoice #${quotation.convertedInvoiceNo}`,
        code: 'ALREADY_CONVERTED'
      };
    }

    if (quotation.validUntil < new Date()) {
      throw {
        statusCode: 400,
        message: `Quotation ${quotation.quotationNumber} expired on ${new Date(quotation.validUntil).toLocaleDateString()}`,
        code: 'QUOTATION_EXPIRED'
      };
    }

    // Convert directly into Sale Invoice
    const sale = await saleService.createSale(
      {
        customerId: quotation.customerId || undefined,
        customerName: quotation.customerName,
        customerMobile: quotation.customerMobile || undefined,
        customerGstin: quotation.customerGstin || undefined,
        vehicleRegNo: quotation.vehicleDetails || undefined,
        branchId: branchIdParam,
        fittingCharges: Number(quotation.fittingCharges),
        invoiceDiscount: Number(quotation.discountTotal),
        notes: `Converted from Quotation ${quotation.quotationNumber}`,
        paymentMode: (input.paymentMode as PaymentMode) || PaymentMode.CASH,
        paidAmount: input.paidAmount,
        paymentReference: input.paymentReference || undefined,
        items: quotation.items.map((it) => ({
          itemId: it.itemId,
          quantity: Number(it.quantity),
          unitRate: Number(it.unitRate),
          mrp: Number(it.mrp),
          discountAmount: Number(it.discountAmount),
          taxRate: Number(it.taxRate)
        }))
      },
      actor,
      branchIdParam
    );

    // Update Quotation to CONVERTED
    await prisma.quotation.update({
      where: { id: quotation.id },
      data: {
        convertedInvoiceNo: sale.invoiceNumber,
        status: RecordStatus.COMPLETED
      }
    });

    if (actor) {
      await recordAuditLog({
        userId: actor.userId,
        username: actor.username || 'System',
        action: 'Quotation Converted',
        module: 'Quotations',
        entity: 'Quotation',
        entityId: quotation.id,
        newValue: { quotationNumber: quotation.quotationNumber, invoiceNumber: sale.invoiceNumber },
        notes: `Converted quotation ${quotation.quotationNumber} into sale invoice ${sale.invoiceNumber}`
      });
    }

    return {
      quotationNumber: quotation.quotationNumber,
      invoiceNumber: sale.invoiceNumber,
      saleId: sale.id,
      totalAmount: sale.totalAmount,
      paidAmount: sale.paidAmount,
      unpaidReceivable: sale.unpaidReceivable
    };
  }
}

export const quotationService = new QuotationService();
