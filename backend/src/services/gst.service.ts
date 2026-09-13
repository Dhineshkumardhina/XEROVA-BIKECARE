import { prisma } from '../config/database.js';
import {
  CalculateTaxDto,
  GstPeriodQueryDto,
  LockPeriodDto,
  UnlockPeriodDto,
  CreateTaxRateDto,
  RecordGstTransactionDto
} from '../validators/gst.validator.js';
import {
  calculateInvoiceGstSummary,
  validateGstinFormat,
  validateHsnFormat,
  isInterstateSupply,
  round2Decimals,
  GST_STATE_CODES,
  GstLineItemInput
} from '../utils/gstEngine.js';
import { recordAuditLog } from '../middleware/auditLogger.js';
import { RecordStatus } from '@prisma/client';

export class GstService {
  /**
   * Helper to normalize period string from various formats (e.g. "09-2026", "2026-09", or date ranges)
   */
  private normalizePeriod(period?: string): string {
    if (!period) {
      const now = new Date();
      return `${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()}`;
    }
    if (period.includes('-')) {
      const parts = period.split('-');
      if (parts[0].length === 4) {
        // "2026-09" -> "09-2026"
        return `${parts[1].padStart(2, '0')}-${parts[0]}`;
      }
      return `${parts[0].padStart(2, '0')}-${parts[1]}`;
    }
    return period;
  }

  /**
   * Get start and end dates for a given period or quarter or FY
   */
  private getDateRangeFromQuery(query: GstPeriodQueryDto): { startDate: Date; endDate: Date; periodLabel: string } {
    if (query.startDate && query.endDate) {
      return {
        startDate: new Date(query.startDate),
        endDate: new Date(query.endDate),
        periodLabel: `${query.startDate} to ${query.endDate}`
      };
    }

    if (query.financialYear) {
      // e.g. "2026-2027" -> 01-04-2026 to 31-03-2027
      const [startYr, endYr] = query.financialYear.split('-').map(y => parseInt(y, 10));
      return {
        startDate: new Date(startYr, 3, 1, 0, 0, 0), // Apr 1
        endDate: new Date(endYr, 2, 31, 23, 59, 59), // Mar 31
        periodLabel: `FY ${query.financialYear}`
      };
    }

    if (query.quarter) {
      // e.g. "Q1-2026" (Apr-Jun), "Q2-2026" (Jul-Sep), "Q3-2026" (Oct-Dec), "Q4-2026" (Jan-Mar)
      const parts = query.quarter.toUpperCase().split('-');
      const q = parts[0];
      const yr = parseInt(parts[1] || `${new Date().getFullYear()}`, 10);
      let sMonth = 3, eMonth = 5; // Q1: Apr-Jun
      if (q === 'Q2') { sMonth = 6; eMonth = 8; }
      else if (q === 'Q3') { sMonth = 9; eMonth = 11; }
      else if (q === 'Q4') { sMonth = 0; eMonth = 2; }

      const startDate = new Date(yr, sMonth, 1, 0, 0, 0);
      const endDate = new Date(yr, eMonth + 1, 0, 23, 59, 59);
      return { startDate, endDate, periodLabel: query.quarter };
    }

    const norm = this.normalizePeriod(query.period);
    const [mStr, yStr] = norm.split('-');
    const m = parseInt(mStr, 10) - 1;
    const y = parseInt(yStr, 10);

    const startDate = new Date(y, m, 1, 0, 0, 0);
    const endDate = new Date(y, m + 1, 0, 23, 59, 59);

    return { startDate, endDate, periodLabel: norm };
  }

  /**
   * 1. Centralized Tax Calculation
   */
  async calculateTaxes(input: CalculateTaxDto) {
    const company = await prisma.company.findFirst();
    const companyStateCode = company?.stateCode || '33';

    let isInterstate = input.isInterstate;
    if (input.customerStateCode) {
      isInterstate = isInterstateSupply(companyStateCode, input.customerStateCode);
    } else if (input.customerGstin && input.customerGstin.length >= 2) {
      isInterstate = isInterstateSupply(companyStateCode, input.customerGstin.substring(0, 2));
    }

    const mappedItems: GstLineItemInput[] = input.items.map(it => ({
      itemId: it.itemId,
      quantity: it.quantity,
      unitRate: it.unitRate,
      discountAmount: it.discountAmount || 0,
      taxRate: it.taxRate,
      isInterstate,
      taxType: it.taxType,
      hsnCode: it.hsnCode
    }));

    return calculateInvoiceGstSummary({
      items: mappedItems,
      isInterstate,
      invoiceDiscount: input.invoiceDiscount,
      fittingCharges: input.fittingCharges,
      freightCharges: input.freightCharges
    });
  }

  /**
   * 2. Record GST Transaction in Ledger
   */
  async recordGstTransaction(input: RecordGstTransactionDto, tx?: any) {
    const db = tx || prisma;
    const returnPeriod = this.normalizePeriod(input.returnPeriod);

    // Verify period is not locked
    const isLocked = await this.isPeriodLocked(returnPeriod);
    if (isLocked) {
      throw new Error(`Cannot record transaction in locked GST return period ${returnPeriod}`);
    }

    return await db.gSTTransaction.create({
      data: {
        returnPeriod,
        documentType: input.documentType,
        documentNumber: input.documentNumber,
        date: new Date(input.date),
        partyGstin: input.partyGstin || null,
        partyName: input.partyName,
        hsnCode: input.hsnCode || '8714',
        taxableValue: input.taxableValue,
        cgst: input.cgst,
        sgst: input.sgst,
        igst: input.igst,
        totalValue: input.totalValue,
        isFiled: input.isFiled || false
      }
    });
  }

  /**
   * 3. Structured GSTR-1 Generator
   */
  async generateGstr1Data(query: GstPeriodQueryDto) {
    const { startDate, endDate, periodLabel } = this.getDateRangeFromQuery(query);
    const company = await prisma.company.findFirst();
    const companyGstin = company?.gstin || '33AAAAA0000A1Z5';
    const companyStateCode = company?.stateCode || '33';

    // Fetch Sales for the period
    const sales = await prisma.sale.findMany({
      where: {
        invoiceDate: { gte: startDate, lte: endDate },
        status: { in: [RecordStatus.COMPLETED, RecordStatus.ACTIVE] },
        ...(query.branchId ? { branchId: query.branchId } : {})
      },
      include: {
        customer: true,
        items: {
          include: {
            item: true
          }
        }
      },
      orderBy: { invoiceDate: 'asc' }
    });

    // Fetch Sales Returns (Credit Notes)
    const returns = await prisma.saleReturn.findMany({
      where: {
        returnDate: { gte: startDate, lte: endDate },
        status: { in: [RecordStatus.COMPLETED, RecordStatus.APPROVED] }
      },
      include: {
        sale: {
          include: { customer: true }
        },
        items: true
      },
      orderBy: { returnDate: 'asc' }
    });

    // Categories
    const b2bInvoices: any[] = [];
    const b2clInvoices: any[] = [];
    const b2csSummaryMap = new Map<string, { pos: string; taxRate: number; taxableValue: number; cgst: number; sgst: number; igst: number; totalValue: number }>();
    const cdnrList: any[] = [];
    const cdnurList: any[] = [];
    const hsnMap = new Map<string, { hsnCode: string; description: string; uqc: string; totalQty: number; totalValue: number; taxableValue: number; cgst: number; sgst: number; igst: number }>();
    
    let nilRatedTotal = 0;
    let exemptTotal = 0;
    let nonGstTotal = 0;

    let grandTaxable = 0;
    let grandCgst = 0;
    let grandSgst = 0;
    let grandIgst = 0;
    let grandTotal = 0;

    for (const s of sales) {
      const customerGstin = s.customer?.gstin || null;
      const custStateCode = customerGstin ? customerGstin.substring(0, 2) : companyStateCode;
      const isInterstate = isInterstateSupply(companyStateCode, custStateCode);
      const isB2B = !!(customerGstin && customerGstin.length >= 15);
      const saleTaxable = Number(s.taxableAmount);
      const saleCgst = Number(s.cgstAmount);
      const saleSgst = Number(s.sgstAmount);
      const saleIgst = Number(s.igstAmount);
      const saleTotal = Number(s.totalAmount);

      grandTaxable = round2Decimals(grandTaxable + saleTaxable);
      grandCgst = round2Decimals(grandCgst + saleCgst);
      grandSgst = round2Decimals(grandSgst + saleSgst);
      grandIgst = round2Decimals(grandIgst + saleIgst);
      grandTotal = round2Decimals(grandTotal + saleTotal);

      // Process Line Items for HSN Summary
      for (const line of s.items) {
        const hsn = line.item?.hsnCode || '8714';
        const qty = Number(line.quantity);
        const lineTaxable = Number(line.taxableAmount);
        const lineCgst = Number(line.cgst);
        const lineSgst = Number(line.sgst);
        const lineIgst = Number(line.igst);
        const lineTotal = Number(line.totalAmount);
        const rate = Number(line.taxRate);

        if (rate === 0) {
          nilRatedTotal = round2Decimals(nilRatedTotal + lineTaxable);
        }

        const existingHsn = hsnMap.get(hsn) || {
          hsnCode: hsn,
          description: line.item?.name || 'Motorcycle Spare Parts',
          uqc: 'NOS',
          totalQty: 0,
          totalValue: 0,
          taxableValue: 0,
          cgst: 0,
          sgst: 0,
          igst: 0
        };

        existingHsn.totalQty = round2Decimals(existingHsn.totalQty + qty);
        existingHsn.totalValue = round2Decimals(existingHsn.totalValue + lineTotal);
        existingHsn.taxableValue = round2Decimals(existingHsn.taxableValue + lineTaxable);
        existingHsn.cgst = round2Decimals(existingHsn.cgst + lineCgst);
        existingHsn.sgst = round2Decimals(existingHsn.sgst + lineSgst);
        existingHsn.igst = round2Decimals(existingHsn.igst + lineIgst);
        hsnMap.set(hsn, existingHsn);
      }

      if (isB2B) {
        b2bInvoices.push({
          gstin: customerGstin,
          customerName: s.customerName,
          invoiceNumber: s.invoiceNumber,
          invoiceDate: s.invoiceDate.toISOString().split('T')[0],
          invoiceValue: saleTotal,
          placeOfSupply: `${custStateCode}-${GST_STATE_CODES[custStateCode] || 'Unknown'}`,
          reverseCharge: 'N',
          invoiceType: 'Regular',
          taxableValue: saleTaxable,
          cgst: saleCgst,
          sgst: saleSgst,
          igst: saleIgst
        });
      } else if (isInterstate && saleTotal > 250000) {
        // B2CL (B2C Large)
        b2clInvoices.push({
          invoiceNumber: s.invoiceNumber,
          invoiceDate: s.invoiceDate.toISOString().split('T')[0],
          invoiceValue: saleTotal,
          placeOfSupply: `${custStateCode}-${GST_STATE_CODES[custStateCode] || 'Unknown'}`,
          taxableValue: saleTaxable,
          igst: saleIgst
        });
      } else {
        // B2CS (B2C Small) aggregated by POS & Tax Rate
        for (const line of s.items) {
          const rate = Number(line.taxRate);
          const key = `${custStateCode}_${rate}`;
          const existing = b2csSummaryMap.get(key) || {
            pos: `${custStateCode}-${GST_STATE_CODES[custStateCode] || 'Tamil Nadu'}`,
            taxRate: rate,
            taxableValue: 0,
            cgst: 0,
            sgst: 0,
            igst: 0,
            totalValue: 0
          };
          existing.taxableValue = round2Decimals(existing.taxableValue + Number(line.taxableAmount));
          existing.cgst = round2Decimals(existing.cgst + Number(line.cgst));
          existing.sgst = round2Decimals(existing.sgst + Number(line.sgst));
          existing.igst = round2Decimals(existing.igst + Number(line.igst));
          existing.totalValue = round2Decimals(existing.totalValue + Number(line.totalAmount));
          b2csSummaryMap.set(key, existing);
        }
      }
    }

    // Process Credit Notes (CDNR / CDNUR)
    for (const r of returns) {
      const origSale = r.sale;
      const customerGstin = origSale?.customer?.gstin || null;
      const isB2B = !!(customerGstin && customerGstin.length >= 15);
      const refund = Number(r.refundAmount);

      if (isB2B) {
        cdnrList.push({
          gstin: customerGstin,
          customerName: origSale?.customerName || 'B2B Customer',
          noteNumber: r.creditNoteNumber,
          noteDate: r.returnDate.toISOString().split('T')[0],
          noteType: 'C',
          originalInvoiceNumber: origSale?.invoiceNumber || '',
          originalInvoiceDate: origSale?.invoiceDate.toISOString().split('T')[0] || '',
          noteValue: refund,
          reason: r.reason
        });
      } else {
        cdnurList.push({
          noteNumber: r.creditNoteNumber,
          noteDate: r.returnDate.toISOString().split('T')[0],
          noteType: 'C',
          originalInvoiceNumber: origSale?.invoiceNumber || '',
          noteValue: refund,
          reason: r.reason
        });
      }
    }

    const hsnSummary = Array.from(hsnMap.values());
    const b2csList = Array.from(b2csSummaryMap.values());

    const docSummary = {
      invoicesIssued: sales.length,
      creditNotesIssued: returns.length,
      netDocuments: sales.length + returns.length
    };

    return {
      period: periodLabel,
      companyGstin,
      companyStateCode,
      summary: {
        totalInvoices: sales.length,
        b2bCount: b2bInvoices.length,
        b2clCount: b2clInvoices.length,
        b2csCount: b2csList.length,
        cdnrCount: cdnrList.length,
        cdnurCount: cdnurList.length,
        totalTaxable: grandTaxable,
        totalCgst: grandCgst,
        totalSgst: grandSgst,
        totalIgst: grandIgst,
        totalTax: round2Decimals(grandCgst + grandSgst + grandIgst),
        grandTotal
      },
      b2b: b2bInvoices,
      b2cl: b2clInvoices,
      b2cs: b2csList,
      cdnr: cdnrList,
      cdnur: cdnurList,
      nilExempt: {
        nilRated: nilRatedTotal,
        exempted: exemptTotal,
        nonGst: nonGstTotal,
        total: round2Decimals(nilRatedTotal + exemptTotal + nonGstTotal)
      },
      hsnSummary,
      docSummary
    };
  }

  /**
   * 4. Structured GSTR-3B Summary Generator
   */
  async generateGstr3bSummary(query: GstPeriodQueryDto) {
    const { startDate, endDate, periodLabel } = this.getDateRangeFromQuery(query);
    const company = await prisma.company.findFirst();

    // 1. Fetch Outward Supplies (Sales)
    const sales = await prisma.sale.findMany({
      where: {
        invoiceDate: { gte: startDate, lte: endDate },
        status: { in: [RecordStatus.COMPLETED, RecordStatus.ACTIVE] },
        ...(query.branchId ? { branchId: query.branchId } : {})
      },
      include: { items: true }
    });

    let outwardTaxable = 0;
    let outwardCgst = 0;
    let outwardSgst = 0;
    let outwardIgst = 0;
    let outwardZeroRated = 0;
    let outwardNilExempt = 0;
    let outwardNonGst = 0;

    for (const s of sales) {
      const taxable = Number(s.taxableAmount);
      const cgst = Number(s.cgstAmount);
      const sgst = Number(s.sgstAmount);
      const igst = Number(s.igstAmount);

      if (cgst > 0 || sgst > 0 || igst > 0) {
        outwardTaxable = round2Decimals(outwardTaxable + taxable);
        outwardCgst = round2Decimals(outwardCgst + cgst);
        outwardSgst = round2Decimals(outwardSgst + sgst);
        outwardIgst = round2Decimals(outwardIgst + igst);
      } else {
        outwardNilExempt = round2Decimals(outwardNilExempt + taxable);
      }
    }

    // 2. Fetch Inward Supplies (Purchases) for Input Tax Credit (ITC)
    const purchases = await prisma.purchase.findMany({
      where: {
        invoiceDate: { gte: startDate, lte: endDate },
        status: { in: [RecordStatus.APPROVED, RecordStatus.COMPLETED] },
        ...(query.branchId ? { branchId: query.branchId } : {})
      },
      include: { items: true }
    });

    let itcTaxable = 0;
    let itcCgst = 0;
    let itcSgst = 0;
    let itcIgst = 0;

    for (const p of purchases) {
      itcTaxable = round2Decimals(itcTaxable + Number(p.taxableAmount));
      itcCgst = round2Decimals(itcCgst + Number(p.cgstAmount));
      itcSgst = round2Decimals(itcSgst + Number(p.sgstAmount));
      itcIgst = round2Decimals(itcIgst + Number(p.igstAmount));
    }

    // 3. Fetch Purchase Returns (Debit Notes) for ITC Reversals
    const purchaseReturns = await prisma.purchaseReturn.findMany({
      where: {
        returnDate: { gte: startDate, lte: endDate },
        status: { in: [RecordStatus.APPROVED, RecordStatus.COMPLETED] }
      },
      include: { purchase: true }
    });

    let itcReversedCgst = 0;
    let itcReversedSgst = 0;
    let itcReversedIgst = 0;

    for (const pr of purchaseReturns) {
      const refund = Number(pr.totalAmount);
      // Allocate reversal proportionally based on original purchase tax split
      const origPurchase = pr.purchase;
      const origTotal = Number(origPurchase?.totalAmount) || refund;
      const cgstRatio = (Number(origPurchase?.cgstAmount) || 0) / (origTotal || 1);
      const sgstRatio = (Number(origPurchase?.sgstAmount) || 0) / (origTotal || 1);
      const igstRatio = (Number(origPurchase?.igstAmount) || 0) / (origTotal || 1);

      itcReversedCgst = round2Decimals(itcReversedCgst + (refund * cgstRatio));
      itcReversedSgst = round2Decimals(itcReversedSgst + (refund * sgstRatio));
      itcReversedIgst = round2Decimals(itcReversedIgst + (refund * igstRatio));
    }

    // 4. Calculate Net Available ITC
    const netItcCgst = Math.max(0, round2Decimals(itcCgst - itcReversedCgst));
    const netItcSgst = Math.max(0, round2Decimals(itcSgst - itcReversedSgst));
    const netItcIgst = Math.max(0, round2Decimals(itcIgst - itcReversedIgst));
    const totalNetItc = round2Decimals(netItcCgst + netItcSgst + netItcIgst);

    // 5. Calculate Net Cash Tax Liability (Table 6.1)
    const netPayableCgst = Math.max(0, round2Decimals(outwardCgst - netItcCgst));
    const netPayableSgst = Math.max(0, round2Decimals(outwardSgst - netItcSgst));
    const netPayableIgst = Math.max(0, round2Decimals(outwardIgst - netItcIgst));
    const totalCashPayable = round2Decimals(netPayableCgst + netPayableSgst + netPayableIgst);

    return {
      period: periodLabel,
      companyGstin: company?.gstin || '33AAAAA0000A1Z5',
      companyTradeName: company?.tradeName || 'BIKE ERP',
      
      // Table 3.1: Details of Outward Supplies and Inward supplies liable to reverse charge
      table3_1_OutwardSupplies: {
        a_taxableSupplies: {
          description: '(a) Outward taxable supplies (other than zero rated, nil rated and exempted)',
          taxableValue: outwardTaxable,
          igst: outwardIgst,
          cgst: outwardCgst,
          sgst: outwardSgst,
          cess: 0
        },
        b_zeroRated: {
          description: '(b) Outward taxable supplies (zero rated)',
          taxableValue: outwardZeroRated,
          igst: 0,
          cess: 0
        },
        c_nilExempt: {
          description: '(c) Other outward supplies (Nil rated, exempted)',
          taxableValue: outwardNilExempt
        },
        d_reverseCharge: {
          description: '(d) Inward supplies (liable to reverse charge)',
          taxableValue: 0,
          igst: 0,
          cgst: 0,
          sgst: 0,
          cess: 0
        },
        e_nonGst: {
          description: '(e) Non-GST outward supplies',
          taxableValue: outwardNonGst
        },
        totalOutwardLiability: {
          igst: outwardIgst,
          cgst: outwardCgst,
          sgst: outwardSgst,
          total: round2Decimals(outwardIgst + outwardCgst + outwardSgst)
        }
      },

      // Table 4: Eligible Input Tax Credit (ITC)
      table4_EligibleItc: {
        a_itcAvailable: {
          description: '(A) ITC Available (whether in full or part)',
          importOfGoods: { igst: 0, cess: 0 },
          importOfServices: { igst: 0, cess: 0 },
          inwardRcm: { igst: 0, cgst: 0, sgst: 0, cess: 0 },
          inwardIsd: { igst: 0, cgst: 0, sgst: 0, cess: 0 },
          allOtherItc: {
            description: '(5) All other ITC (Purchases)',
            taxableValue: itcTaxable,
            igst: itcIgst,
            cgst: itcCgst,
            sgst: itcSgst,
            cess: 0
          }
        },
        b_itcReversed: {
          description: '(B) ITC Reversed (Purchase Returns / Debit Notes)',
          asPerRules: { igst: 0, cgst: 0, sgst: 0 },
          others: {
            igst: itcReversedIgst,
            cgst: itcReversedCgst,
            sgst: itcReversedSgst
          }
        },
        c_netItcAvailable: {
          description: '(C) Net ITC Available (A) - (B)',
          igst: netItcIgst,
          cgst: netItcCgst,
          sgst: netItcSgst,
          total: totalNetItc
        }
      },

      // Table 5: Inward supplies (exempt/nil-rated)
      table5_InwardExempt: {
        fromSupplierUnderCompScheme: 0,
        nonGstSupply: 0
      },

      // Table 6.1: Payment of Tax (Net cash liability)
      table6_1_PaymentOfTax: {
        igst: {
          taxPayable: outwardIgst,
          paidThroughItc: Math.min(outwardIgst, netItcIgst),
          taxPaidInCash: netPayableIgst
        },
        cgst: {
          taxPayable: outwardCgst,
          paidThroughItc: Math.min(outwardCgst, netItcCgst),
          taxPaidInCash: netPayableCgst
        },
        sgst: {
          taxPayable: outwardSgst,
          paidThroughItc: Math.min(outwardSgst, netItcSgst),
          taxPaidInCash: netPayableSgst
        },
        totalCashPayable
      }
    };
  }

  /**
   * 5. GST Validation Engine
   * Validates transactions and detects errors/warnings
   */
  async validateGstRecords(query: GstPeriodQueryDto) {
    const { startDate, endDate, periodLabel } = this.getDateRangeFromQuery(query);
    const company = await prisma.company.findFirst();
    const companyStateCode = company?.stateCode || '33';

    const errors: Array<{
      code: string;
      message: string;
      documentNumber: string;
      entityId: string;
      field: string;
      severity: 'ERROR';
    }> = [];

    const warnings: Array<{
      code: string;
      message: string;
      documentNumber: string;
      entityId: string;
      field: string;
      severity: 'WARNING';
    }> = [];

    // Check if period is locked
    const isLocked = await this.isPeriodLocked(periodLabel);
    if (isLocked) {
      warnings.push({
        code: 'PERIOD_LOCKED',
        message: `Tax period ${periodLabel} is finalized and locked against direct edits`,
        documentNumber: 'PERIOD',
        entityId: periodLabel,
        field: 'period',
        severity: 'WARNING'
      });
    }

    // 1. Validate Sales
    const sales = await prisma.sale.findMany({
      where: {
        invoiceDate: { gte: startDate, lte: endDate },
        status: { in: [RecordStatus.COMPLETED, RecordStatus.ACTIVE] }
      },
      include: {
        customer: true,
        items: { include: { item: true } }
      }
    });

    const seenInvoiceNumbers = new Set<string>();

    for (const s of sales) {
      // Duplicate invoice check
      if (seenInvoiceNumbers.has(s.invoiceNumber)) {
        errors.push({
          code: 'DUPLICATE_INVOICE',
          message: `Duplicate sale invoice number detected: ${s.invoiceNumber}`,
          documentNumber: s.invoiceNumber,
          entityId: s.id,
          field: 'invoiceNumber',
          severity: 'ERROR'
        });
      }
      seenInvoiceNumbers.add(s.invoiceNumber);

      // Check B2B GSTIN
      if (s.isB2B) {
        const gstin = s.customer?.gstin;
        if (!gstin) {
          errors.push({
            code: 'MISSING_GSTIN',
            message: `Invoice marked as B2B but customer GSTIN is missing`,
            documentNumber: s.invoiceNumber,
            entityId: s.id,
            field: 'gstin',
            severity: 'ERROR'
          });
        } else {
          const gstinVal = validateGstinFormat(gstin);
          if (!gstinVal.isValid) {
            errors.push({
              code: 'INVALID_GSTIN',
              message: `Invalid GSTIN (${gstin}): ${gstinVal.error}`,
              documentNumber: s.invoiceNumber,
              entityId: s.id,
              field: 'gstin',
              severity: 'ERROR'
            });
          }
        }
      }

      // Check Items HSN & Tax Calculations
      const custStateCode = s.customer?.gstin ? s.customer.gstin.substring(0, 2) : companyStateCode;
      const isInterstate = isInterstateSupply(companyStateCode, custStateCode);

      for (const itemLine of s.items) {
        const hsn = itemLine.item?.hsnCode;
        if (!hsn) {
          errors.push({
            code: 'MISSING_HSN',
            message: `Item '${itemLine.item?.name || itemLine.itemId}' is missing HSN code`,
            documentNumber: s.invoiceNumber,
            entityId: itemLine.id,
            field: 'hsnCode',
            severity: 'ERROR'
          });
        } else {
          const hsnVal = validateHsnFormat(hsn);
          if (!hsnVal.isValid) {
            warnings.push({
              code: 'INVALID_HSN_FORMAT',
              message: `HSN '${hsn}' does not meet standard format requirements`,
              documentNumber: s.invoiceNumber,
              entityId: itemLine.id,
              field: 'hsnCode',
              severity: 'WARNING'
            });
          }
        }

        // Tax mismatch check
        const cgst = Number(itemLine.cgst);
        const sgst = Number(itemLine.sgst);
        const igst = Number(itemLine.igst);

        if (!isInterstate) {
          if (Math.abs(cgst - sgst) > 0.05) {
            errors.push({
              code: 'TAX_MISMATCH_CGST_SGST',
              message: `Intra-state supply must have equal CGST (₹${cgst}) and SGST (₹${sgst})`,
              documentNumber: s.invoiceNumber,
              entityId: itemLine.id,
              field: 'taxAmount',
              severity: 'ERROR'
            });
          }
          if (igst > 0) {
            errors.push({
              code: 'INVALID_IGST_ON_INTRASTATE',
              message: `Intra-state supply should not have IGST charged (found ₹${igst})`,
              documentNumber: s.invoiceNumber,
              entityId: itemLine.id,
              field: 'igst',
              severity: 'ERROR'
            });
          }
        } else {
          if (cgst > 0 || sgst > 0) {
            errors.push({
              code: 'INVALID_CGST_SGST_ON_INTERSTATE',
              message: `Inter-state supply must charge IGST only, found CGST/SGST`,
              documentNumber: s.invoiceNumber,
              entityId: itemLine.id,
              field: 'cgst_sgst',
              severity: 'ERROR'
            });
          }
        }
      }
    }

    // 2. Validate Purchases
    const purchases = await prisma.purchase.findMany({
      where: {
        invoiceDate: { gte: startDate, lte: endDate },
        status: { in: [RecordStatus.APPROVED, RecordStatus.COMPLETED] }
      },
      include: { supplier: true, items: true }
    });

    for (const p of purchases) {
      if (p.supplier?.gstin) {
        const supGstinVal = validateGstinFormat(p.supplier.gstin);
        if (!supGstinVal.isValid) {
          warnings.push({
            code: 'INVALID_SUPPLIER_GSTIN',
            message: `Supplier '${p.supplier.name}' has invalid GSTIN (${p.supplier.gstin})`,
            documentNumber: p.poNumber,
            entityId: p.id,
            field: 'supplierGstin',
            severity: 'WARNING'
          });
        }
      }
    }

    return {
      period: periodLabel,
      isValid: errors.length === 0,
      totalErrors: errors.length,
      totalWarnings: warnings.length,
      errors,
      warnings,
      summary: {
        totalSalesChecked: sales.length,
        totalPurchasesChecked: purchases.length,
        isPeriodLocked: isLocked
      }
    };
  }

  /**
   * 6. Period Lock Status & Management
   */
  async isPeriodLocked(period: string): Promise<boolean> {
    const norm = this.normalizePeriod(period);
    const lockSetting = await prisma.systemSetting.findUnique({
      where: { key: `GST_LOCK_${norm}` }
    });
    if (!lockSetting) return false;
    try {
      const data = JSON.parse(lockSetting.value);
      return !!data.isLocked;
    } catch {
      return false;
    }
  }

  async getPeriodStatus(period: string) {
    const norm = this.normalizePeriod(period);
    const isLocked = await this.isPeriodLocked(norm);
    const lockSetting = await prisma.systemSetting.findUnique({
      where: { key: `GST_LOCK_${norm}` }
    });

    let lockData: any = null;
    if (lockSetting) {
      try {
        lockData = JSON.parse(lockSetting.value);
      } catch {
        lockData = null;
      }
    }

    // Transaction stats for the period
    const txCount = await prisma.gSTTransaction.count({
      where: { returnPeriod: norm }
    });

    return {
      period: norm,
      isLocked,
      lockDetails: lockData,
      transactionCount: txCount
    };
  }

  async lockPeriod(input: LockPeriodDto, actor?: { userId?: string; username?: string }) {
    const norm = this.normalizePeriod(input.period);

    // Validate if any fatal GST errors exist prior to locking
    const validation = await this.validateGstRecords({ period: norm });
    if (!validation.isValid) {
      throw new Error(`Cannot lock period ${norm} with ${validation.totalErrors} unresolved GST validation errors`);
    }

    const lockPayload = {
      isLocked: true,
      period: norm,
      lockedAt: new Date().toISOString(),
      lockedBy: actor?.username || 'Admin',
      userId: actor?.userId || null,
      arnNumber: input.arnNumber || null,
      reason: input.reason,
      remarks: input.remarks || null
    };

    await prisma.systemSetting.upsert({
      where: { key: `GST_LOCK_${norm}` },
      create: {
        key: `GST_LOCK_${norm}`,
        value: JSON.stringify(lockPayload),
        category: 'GST',
        description: `Finalized lock for GST return period ${norm}`
      },
      update: {
        value: JSON.stringify(lockPayload),
        category: 'GST',
        description: `Finalized lock for GST return period ${norm}`
      }
    });

    // Mark GSTTransaction records as filed
    await prisma.gSTTransaction.updateMany({
      where: { returnPeriod: norm },
      data: { isFiled: true }
    });

    // Audit log
    await recordAuditLog({
      userId: actor?.userId,
      username: actor?.username || 'Admin',
      action: 'GST Period Locked',
      module: 'GST',
      entity: 'GSTPeriod',
      entityId: norm,
      newValue: lockPayload,
      notes: `GST return period ${norm} locked and finalized with ARN: ${input.arnNumber || 'N/A'}`
    });

    return lockPayload;
  }

  async unlockPeriod(input: UnlockPeriodDto, actor?: { userId?: string; username?: string }) {
    const norm = this.normalizePeriod(input.period);

    await prisma.systemSetting.deleteMany({
      where: { key: `GST_LOCK_${norm}` }
    });

    await prisma.gSTTransaction.updateMany({
      where: { returnPeriod: norm },
      data: { isFiled: false }
    });

    await recordAuditLog({
      userId: actor?.userId,
      username: actor?.username || 'Admin',
      action: 'GST Period Unlocked',
      module: 'GST',
      entity: 'GSTPeriod',
      entityId: norm,
      notes: `GST period ${norm} unlocked by ${actor?.username || 'Admin'}. Reason: ${input.reason}`
    });

    return { success: true, message: `Period ${norm} successfully unlocked` };
  }

  /**
   * 7. Tax Rate Masters
   */
  async getTaxRates() {
    let rates = await prisma.taxRate.findMany({
      orderBy: { igstRate: 'asc' }
    });

    if (rates.length === 0) {
      // Seed default Indian GST Tax Slabs
      const defaults = [
        { rateName: 'GST 0% (Exempt)', cgstRate: 0, sgstRate: 0, igstRate: 0, isDefault: false },
        { rateName: 'GST 5%', cgstRate: 2.5, sgstRate: 2.5, igstRate: 5, isDefault: false },
        { rateName: 'GST 12%', cgstRate: 6, sgstRate: 6, igstRate: 12, isDefault: false },
        { rateName: 'GST 18%', cgstRate: 9, sgstRate: 9, igstRate: 18, isDefault: true },
        { rateName: 'GST 28%', cgstRate: 14, sgstRate: 14, igstRate: 28, isDefault: false }
      ];

      for (const d of defaults) {
        await prisma.taxRate.create({ data: d });
      }

      rates = await prisma.taxRate.findMany({ orderBy: { igstRate: 'asc' } });
    }

    return rates;
  }

  async createTaxRate(input: CreateTaxRateDto, actor?: { userId?: string; username?: string }) {
    const rate = await prisma.taxRate.create({
      data: {
        rateName: input.rateName,
        cgstRate: input.cgstRate,
        sgstRate: input.sgstRate,
        igstRate: input.igstRate,
        isDefault: input.isDefault ?? false
      }
    });

    await recordAuditLog({
      userId: actor?.userId,
      username: actor?.username || 'Admin',
      action: 'Tax Rate Created',
      module: 'GST',
      entity: 'TaxRate',
      entityId: rate.id,
      newValue: input
    });

    return rate;
  }
}

export const gstService = new GstService();
