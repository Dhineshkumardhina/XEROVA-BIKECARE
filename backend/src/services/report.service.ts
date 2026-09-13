import { prisma } from '../config/database.js';
import {
  SalesReportQueryDto,
  PurchaseReportQueryDto,
  InventoryReportQueryDto,
  ProfitabilityReportQueryDto,
  FinancialReportQueryDto,
  BusinessInsightsQueryDto
} from '../validators/report.validator.js';
import { RecordStatus, StockMovementType, StockDirection } from '@prisma/client';
import { round2Decimals } from '../utils/gstEngine.js';

export class ReportService {
  /**
   * 1. Resolve date range from preset or custom range
   */
  resolveDateRange(period = 'this_month', customStart?: string, customEnd?: string): { startDate: Date; endDate: Date; label: string } {
    const now = new Date();

    if (period === 'custom' && customStart && customEnd) {
      const s = new Date(customStart);
      s.setHours(0, 0, 0, 0);
      const e = new Date(customEnd);
      e.setHours(23, 59, 59, 999);
      return { startDate: s, endDate: e, label: `${customStart} to ${customEnd}` };
    }

    let startDate = new Date();
    let endDate = new Date();

    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        return { startDate, endDate, label: 'Today' };

      case 'yesterday':
        startDate.setDate(now.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(now.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
        return { startDate, endDate, label: 'Yesterday' };

      case 'this_week': {
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
        startDate = new Date(now.setDate(diff));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        return { startDate, endDate, label: 'This Week' };
      }

      case 'last_week': {
        const day = now.getDay();
        const diff = now.getDate() - day - 6; // Last Monday
        startDate = new Date(now.setDate(diff));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        return { startDate, endDate, label: 'Last Week' };
      }

      case 'last_month': {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        return { startDate, endDate, label: 'Last Month' };
      }

      case 'this_quarter': {
        const qMonth = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), qMonth, 1, 0, 0, 0);
        endDate = new Date(now.getFullYear(), qMonth + 3, 0, 23, 59, 59, 999);
        return { startDate, endDate, label: 'This Quarter' };
      }

      case 'this_fy': {
        const currentYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
        startDate = new Date(currentYear, 3, 1, 0, 0, 0); // Apr 1
        endDate = new Date(currentYear + 1, 2, 31, 23, 59, 59, 999); // Mar 31
        return { startDate, endDate, label: `FY ${currentYear}-${currentYear + 1}` };
      }

      case 'this_month':
      default: {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        return { startDate, endDate, label: 'This Month' };
      }
    }
  }

  // ============================================================================
  // SALES REPORTS
  // ============================================================================

  async getSalesReport(query: SalesReportQueryDto) {
    const { startDate, endDate, label } = this.resolveDateRange(query.period, query.startDate, query.endDate);

    const where: any = {
      invoiceDate: { gte: startDate, lte: endDate },
      status: { in: [RecordStatus.COMPLETED, RecordStatus.ACTIVE] }
    };

    if (query.branchId) where.branchId = query.branchId;
    if (query.customerId) where.customerId = query.customerId;
    if (query.userId) where.createdById = query.userId;
    if (query.paymentMode) where.paymentMode = query.paymentMode;
    if (query.minAmount !== undefined) where.totalAmount = { gte: query.minAmount };
    if (query.maxAmount !== undefined) where.totalAmount = { ...where.totalAmount, lte: query.maxAmount };

    // Fetch Sales & Returns
    const [sales, returns] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: {
          customer: true,
          createdBy: { select: { id: true, username: true, fullName: true } },
          items: {
            include: {
              item: {
                include: {
                  brand: true,
                  category: true,
                  prices: { where: { isCurrent: true }, take: 1 }
                }
              }
            }
          },
          payments: true
        },
        orderBy: { invoiceDate: query.sortOrder }
      }),
      prisma.saleReturn.findMany({
        where: {
          returnDate: { gte: startDate, lte: endDate },
          status: { in: [RecordStatus.COMPLETED, RecordStatus.APPROVED] }
        },
        include: { sale: true }
      })
    ]);

    // 1. Overall Summary KPIs
    let grossSales = 0;
    let totalDiscount = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;
    let totalCollections = 0;
    let totalCreditSales = 0;

    for (const s of sales) {
      grossSales = round2Decimals(grossSales + Number(s.taxableAmount) + Number(s.cgstAmount) + Number(s.sgstAmount) + Number(s.igstAmount) + Number(s.discountTotal));
      totalDiscount = round2Decimals(totalDiscount + Number(s.discountTotal));
      totalCgst = round2Decimals(totalCgst + Number(s.cgstAmount));
      totalSgst = round2Decimals(totalSgst + Number(s.sgstAmount));
      totalIgst = round2Decimals(totalIgst + Number(s.igstAmount));
      totalCollections = round2Decimals(totalCollections + Number(s.paidAmount));
      if (Number(s.totalAmount) > Number(s.paidAmount)) {
        totalCreditSales = round2Decimals(totalCreditSales + (Number(s.totalAmount) - Number(s.paidAmount)));
      }
    }

    const totalReturns = returns.reduce((acc, r) => round2Decimals(acc + Number(r.refundAmount)), 0);
    const netSales = round2Decimals(sales.reduce((acc, s) => acc + Number(s.totalAmount), 0) - totalReturns);
    const totalGst = round2Decimals(totalCgst + totalSgst + totalIgst);

    const kpis = {
      grossSales,
      totalDiscount,
      totalReturns,
      netSales,
      totalCgst,
      totalSgst,
      totalIgst,
      totalGst,
      totalCollections,
      totalCreditSales,
      invoiceCount: sales.length,
      returnCount: returns.length
    };

    // 2. Structured Aggregations by Report Type
    let rows: any[] = [];

    switch (query.reportType) {
      case 'daily': {
        const map = new Map<string, { date: string; invoiceCount: number; taxable: number; gst: number; total: number; collections: number }>();
        for (const s of sales) {
          const d = s.invoiceDate.toISOString().split('T')[0];
          const ex = map.get(d) || { date: d, invoiceCount: 0, taxable: 0, gst: 0, total: 0, collections: 0 };
          ex.invoiceCount += 1;
          ex.taxable = round2Decimals(ex.taxable + Number(s.taxableAmount));
          ex.gst = round2Decimals(ex.gst + Number(s.cgstAmount) + Number(s.sgstAmount) + Number(s.igstAmount));
          ex.total = round2Decimals(ex.total + Number(s.totalAmount));
          ex.collections = round2Decimals(ex.collections + Number(s.paidAmount));
          map.set(d, ex);
        }
        rows = Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
        break;
      }

      case 'monthly': {
        const map = new Map<string, { month: string; invoiceCount: number; taxable: number; gst: number; total: number; collections: number }>();
        for (const s of sales) {
          const m = s.invoiceDate.toISOString().slice(0, 7); // YYYY-MM
          const ex = map.get(m) || { month: m, invoiceCount: 0, taxable: 0, gst: 0, total: 0, collections: 0 };
          ex.invoiceCount += 1;
          ex.taxable = round2Decimals(ex.taxable + Number(s.taxableAmount));
          ex.gst = round2Decimals(ex.gst + Number(s.cgstAmount) + Number(s.sgstAmount) + Number(s.igstAmount));
          ex.total = round2Decimals(ex.total + Number(s.totalAmount));
          ex.collections = round2Decimals(ex.collections + Number(s.paidAmount));
          map.set(m, ex);
        }
        rows = Array.from(map.values()).sort((a, b) => a.month.localeCompare(b.month));
        break;
      }

      case 'customer': {
        const map = new Map<string, { customerId: string; customerName: string; mobile: string; invoiceCount: number; totalSales: number; received: number; outstanding: number }>();
        for (const s of sales) {
          const cid = s.customerId || 'WALKIN';
          const ex = map.get(cid) || {
            customerId: cid,
            customerName: s.customerName || 'Walk-in Customer',
            mobile: s.customerMobile || 'N/A',
            invoiceCount: 0,
            totalSales: 0,
            received: 0,
            outstanding: 0
          };
          ex.invoiceCount += 1;
          ex.totalSales = round2Decimals(ex.totalSales + Number(s.totalAmount));
          ex.received = round2Decimals(ex.received + Number(s.paidAmount));
          ex.outstanding = round2Decimals(ex.outstanding + Math.max(0, Number(s.totalAmount) - Number(s.paidAmount)));
          map.set(cid, ex);
        }
        rows = Array.from(map.values()).sort((a, b) => b.totalSales - a.totalSales);
        break;
      }

      case 'item': {
        const map = new Map<string, { itemId: string; sku: string; name: string; brand: string; category: string; hsn: string; qtySold: number; revenue: number; avgRate: number }>();
        for (const s of sales) {
          for (const it of s.items) {
            const iid = it.itemId;
            const ex = map.get(iid) || {
              itemId: iid,
              sku: it.item?.sku || '',
              name: it.item?.name || 'Part',
              brand: it.item?.brand?.name || 'Generic',
              category: it.item?.category?.name || 'Spares',
              hsn: it.item?.hsnCode || '8714',
              qtySold: 0,
              revenue: 0,
              avgRate: 0
            };
            ex.qtySold = round2Decimals(ex.qtySold + Number(it.quantity));
            ex.revenue = round2Decimals(ex.revenue + Number(it.totalAmount));
            ex.avgRate = ex.qtySold > 0 ? round2Decimals(ex.revenue / ex.qtySold) : 0;
            map.set(iid, ex);
          }
        }
        rows = Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
        break;
      }

      case 'brand': {
        const map = new Map<string, { brandName: string; qtySold: number; revenue: number }>();
        for (const s of sales) {
          for (const it of s.items) {
            const bname = it.item?.brand?.name || 'OEM Standard';
            const ex = map.get(bname) || { brandName: bname, qtySold: 0, revenue: 0 };
            ex.qtySold = round2Decimals(ex.qtySold + Number(it.quantity));
            ex.revenue = round2Decimals(ex.revenue + Number(it.totalAmount));
            map.set(bname, ex);
          }
        }
        rows = Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
        break;
      }

      case 'category': {
        const map = new Map<string, { categoryName: string; qtySold: number; revenue: number }>();
        for (const s of sales) {
          for (const it of s.items) {
            const cname = it.item?.category?.name || 'General Spares';
            const ex = map.get(cname) || { categoryName: cname, qtySold: 0, revenue: 0 };
            ex.qtySold = round2Decimals(ex.qtySold + Number(it.quantity));
            ex.revenue = round2Decimals(ex.revenue + Number(it.totalAmount));
            map.set(cname, ex);
          }
        }
        rows = Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
        break;
      }

      case 'user': {
        const map = new Map<string, { userId: string; username: string; invoiceCount: number; revenue: number; collections: number }>();
        for (const s of sales) {
          const uid = s.createdById || 'SYSTEM';
          const ex = map.get(uid) || {
            userId: uid,
            username: s.createdBy?.fullName || s.createdBy?.username || 'Cashier Desk',
            invoiceCount: 0,
            revenue: 0,
            collections: 0
          };
          ex.invoiceCount += 1;
          ex.revenue = round2Decimals(ex.revenue + Number(s.totalAmount));
          ex.collections = round2Decimals(ex.collections + Number(s.paidAmount));
          map.set(uid, ex);
        }
        rows = Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
        break;
      }

      case 'payment_mode': {
        const map = new Map<string, { paymentMode: string; count: number; totalAmount: number }>();
        for (const s of sales) {
          if (s.payments && s.payments.length > 0) {
            for (const p of s.payments) {
              const mode = p.paymentMode;
              const ex = map.get(mode) || { paymentMode: mode, count: 0, totalAmount: 0 };
              ex.count += 1;
              ex.totalAmount = round2Decimals(ex.totalAmount + Number(p.amount));
              map.set(mode, ex);
            }
          } else {
            const mode = s.paymentMode || 'CASH';
            const ex = map.get(mode) || { paymentMode: mode, count: 0, totalAmount: 0 };
            ex.count += 1;
            ex.totalAmount = round2Decimals(ex.totalAmount + Number(s.totalAmount));
            map.set(mode, ex);
          }
        }
        rows = Array.from(map.values()).sort((a, b) => b.totalAmount - a.totalAmount);
        break;
      }

      case 'gst': {
        const map = new Map<number, { rate: number; taxable: number; cgst: number; sgst: number; igst: number; totalTax: number; totalAmount: number }>();
        for (const s of sales) {
          for (const it of s.items) {
            const rate = Number(it.taxRate);
            const ex = map.get(rate) || { rate, taxable: 0, cgst: 0, sgst: 0, igst: 0, totalTax: 0, totalAmount: 0 };
            ex.taxable = round2Decimals(ex.taxable + Number(it.taxableAmount));
            ex.cgst = round2Decimals(ex.cgst + Number(it.cgst));
            ex.sgst = round2Decimals(ex.sgst + Number(it.sgst));
            ex.igst = round2Decimals(ex.igst + Number(it.igst));
            ex.totalTax = round2Decimals(ex.cgst + ex.sgst + ex.igst);
            ex.totalAmount = round2Decimals(ex.taxable + ex.totalTax);
            map.set(rate, ex);
          }
        }
        rows = Array.from(map.values()).sort((a, b) => a.rate - b.rate);
        break;
      }

      case 'returns': {
        rows = returns.map((r) => ({
          id: r.id,
          creditNoteNumber: r.creditNoteNumber,
          returnDate: r.returnDate,
          originalInvoice: r.sale?.invoiceNumber || 'N/A',
          customerName: r.sale?.customerName || 'Customer',
          refundAmount: Number(r.refundAmount),
          reason: r.reason,
          status: r.status
        }));
        break;
      }
    }

    // Pagination
    const page = query.page || 1;
    const limit = query.limit || 50;
    const totalRecords = rows.length;
    const paginatedRows = rows.slice((page - 1) * limit, page * limit);

    return {
      reportType: query.reportType,
      period: label,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      kpis,
      totalRecords,
      page,
      limit,
      data: paginatedRows
    };
  }

  // ============================================================================
  // PURCHASE REPORTS
  // ============================================================================

  async getPurchaseReport(query: PurchaseReportQueryDto) {
    const { startDate, endDate, label } = this.resolveDateRange(query.period, query.startDate, query.endDate);

    const where: any = {
      invoiceDate: { gte: startDate, lte: endDate },
      status: { in: [RecordStatus.APPROVED, RecordStatus.COMPLETED] }
    };

    if (query.branchId) where.branchId = query.branchId;
    if (query.supplierId) where.supplierId = query.supplierId;

    const [purchases, purchaseReturns] = await Promise.all([
      prisma.purchase.findMany({
        where,
        include: {
          supplier: true,
          items: {
            include: {
              item: { include: { brand: true, category: true } }
            }
          },
          payments: true
        },
        orderBy: { invoiceDate: query.sortOrder }
      }),
      prisma.purchaseReturn.findMany({
        where: {
          returnDate: { gte: startDate, lte: endDate },
          status: { in: [RecordStatus.APPROVED, RecordStatus.COMPLETED] }
        },
        include: { purchase: { include: { supplier: true } } }
      })
    ]);

    // KPIs
    let grossPurchases = 0;
    let totalTaxable = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;
    let totalPaid = 0;
    let totalPayable = 0;

    for (const p of purchases) {
      grossPurchases = round2Decimals(grossPurchases + Number(p.totalAmount));
      totalTaxable = round2Decimals(totalTaxable + Number(p.taxableAmount));
      totalCgst = round2Decimals(totalCgst + Number(p.cgstAmount));
      totalSgst = round2Decimals(totalSgst + Number(p.sgstAmount));
      totalIgst = round2Decimals(totalIgst + Number(p.igstAmount));
      totalPaid = round2Decimals(totalPaid + Number(p.paidAmount));
      totalPayable = round2Decimals(totalPayable + Math.max(0, Number(p.totalAmount) - Number(p.paidAmount)));
    }

    const totalReturnAmount = purchaseReturns.reduce((acc, pr) => round2Decimals(acc + Number(pr.totalAmount)), 0);

    const kpis = {
      grossPurchases,
      totalTaxable,
      totalCgst,
      totalSgst,
      totalIgst,
      totalTax: round2Decimals(totalCgst + totalSgst + totalIgst),
      totalPaid,
      totalPayable,
      totalReturns: totalReturnAmount,
      purchaseCount: purchases.length,
      returnCount: purchaseReturns.length
    };

    let rows: any[] = [];

    switch (query.reportType) {
      case 'daily': {
        const map = new Map<string, { date: string; billCount: number; taxable: number; gst: number; total: number; paid: number }>();
        for (const p of purchases) {
          const d = p.invoiceDate.toISOString().split('T')[0];
          const ex = map.get(d) || { date: d, billCount: 0, taxable: 0, gst: 0, total: 0, paid: 0 };
          ex.billCount += 1;
          ex.taxable = round2Decimals(ex.taxable + Number(p.taxableAmount));
          ex.gst = round2Decimals(ex.gst + Number(p.cgstAmount) + Number(p.sgstAmount) + Number(p.igstAmount));
          ex.total = round2Decimals(ex.total + Number(p.totalAmount));
          ex.paid = round2Decimals(ex.paid + Number(p.paidAmount));
          map.set(d, ex);
        }
        rows = Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
        break;
      }

      case 'supplier': {
        const map = new Map<string, { supplierId: string; supplierName: string; gstin: string; billCount: number; totalPurchases: number; paid: number; outstanding: number }>();
        for (const p of purchases) {
          const sid = p.supplierId;
          const ex = map.get(sid) || {
            supplierId: sid,
            supplierName: p.supplier?.name || 'Supplier',
            gstin: p.supplier?.gstin || 'N/A',
            billCount: 0,
            totalPurchases: 0,
            paid: 0,
            outstanding: 0
          };
          ex.billCount += 1;
          ex.totalPurchases = round2Decimals(ex.totalPurchases + Number(p.totalAmount));
          ex.paid = round2Decimals(ex.paid + Number(p.paidAmount));
          ex.outstanding = round2Decimals(ex.outstanding + Math.max(0, Number(p.totalAmount) - Number(p.paidAmount)));
          map.set(sid, ex);
        }
        rows = Array.from(map.values()).sort((a, b) => b.totalPurchases - a.totalPurchases);
        break;
      }

      case 'item': {
        const map = new Map<string, { itemId: string; sku: string; name: string; brand: string; qtyPurchased: number; totalCost: number; avgUnitCost: number }>();
        for (const p of purchases) {
          for (const it of p.items) {
            const iid = it.itemId;
            const ex = map.get(iid) || {
              itemId: iid,
              sku: it.item?.sku || '',
              name: it.item?.name || 'Part',
              brand: it.item?.brand?.name || 'OEM',
              qtyPurchased: 0,
              totalCost: 0,
              avgUnitCost: 0
            };
            ex.qtyPurchased = round2Decimals(ex.qtyPurchased + Number(it.quantity));
            ex.totalCost = round2Decimals(ex.totalCost + Number(it.totalAmount));
            ex.avgUnitCost = ex.qtyPurchased > 0 ? round2Decimals(ex.totalCost / ex.qtyPurchased) : 0;
            map.set(iid, ex);
          }
        }
        rows = Array.from(map.values()).sort((a, b) => b.totalCost - a.totalCost);
        break;
      }

      case 'returns': {
        rows = purchaseReturns.map((pr) => ({
          id: pr.id,
          debitNoteNumber: pr.debitNoteNumber,
          returnDate: pr.returnDate,
          supplierName: pr.purchase?.supplier?.name || 'Supplier',
          poNumber: pr.purchase?.poNumber || 'N/A',
          totalAmount: Number(pr.totalAmount),
          reason: pr.reason,
          status: pr.status
        }));
        break;
      }

      default:
        rows = purchases.map((p) => ({
          id: p.id,
          poNumber: p.poNumber,
          invoiceDate: p.invoiceDate,
          supplierName: p.supplier?.name || 'Supplier',
          taxableAmount: Number(p.taxableAmount),
          gstAmount: round2Decimals(Number(p.cgstAmount) + Number(p.sgstAmount) + Number(p.igstAmount)),
          totalAmount: Number(p.totalAmount),
          paidAmount: Number(p.paidAmount),
          status: p.status
        }));
        break;
    }

    const page = query.page || 1;
    const limit = query.limit || 50;
    const paginatedRows = rows.slice((page - 1) * limit, page * limit);

    return {
      reportType: query.reportType,
      period: label,
      kpis,
      totalRecords: rows.length,
      page,
      limit,
      data: paginatedRows
    };
  }

  // ============================================================================
  // INVENTORY & STOCK REPORTS
  // ============================================================================

  async getInventoryReport(query: InventoryReportQueryDto) {
    const whereItem: any = { status: RecordStatus.ACTIVE };
    if (query.brandId) whereItem.brandId = query.brandId;
    if (query.categoryId) whereItem.categoryId = query.categoryId;

    const items = await prisma.item.findMany({
      where: whereItem,
      include: {
        brand: true,
        category: true,
        stocks: {
          include: { rackBin: true }
        },
        prices: { where: { isCurrent: true }, take: 1 },
        saleItems: {
          take: 100,
          select: { quantity: true, totalAmount: true }
        }
      }
    });

    let totalCostValuation = 0;
    let totalSellingValuation = 0;
    let totalMrpValuation = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalStockUnits = 0;

    const enrichedItems = items.map((it) => {
      const totalQty = it.stocks.reduce((acc, st) => acc + Number(st.quantity), 0);
      const avgCost = Number(it.stocks[0]?.avgCostRate || it.prices[0]?.purchaseRate || 0);
      const sellingRate = Number(it.prices[0]?.sellingRate || 0);
      const mrp = Number(it.prices[0]?.mrp || sellingRate);
      const minReorder = Number(it.minReorderLevel);

      const costValue = round2Decimals(totalQty * avgCost);
      const sellingValue = round2Decimals(totalQty * sellingRate);
      const mrpValue = round2Decimals(totalQty * mrp);

      if (totalQty > 0) {
        totalCostValuation = round2Decimals(totalCostValuation + costValue);
        totalSellingValuation = round2Decimals(totalSellingValuation + sellingValue);
        totalMrpValuation = round2Decimals(totalMrpValuation + mrpValue);
        totalStockUnits = round2Decimals(totalStockUnits + totalQty);
      }

      let stockStatus = 'IN_STOCK';
      if (totalQty <= 0) {
        stockStatus = 'OUT_OF_STOCK';
        outOfStockCount++;
      } else if (totalQty <= minReorder) {
        stockStatus = 'LOW_STOCK';
        lowStockCount++;
      }

      const totalSalesUnits = it.saleItems.reduce((acc, si) => acc + Number(si.quantity), 0);

      return {
        id: it.id,
        sku: it.sku,
        name: it.name,
        hsnCode: it.hsnCode,
        brand: it.brand?.name || 'OEM',
        category: it.category?.name || 'Spares',
        currentStock: totalQty,
        minReorderLevel: minReorder,
        avgCostRate: avgCost,
        sellingRate,
        mrp,
        costValue,
        sellingValue,
        mrpValue,
        stockStatus,
        totalSalesUnits,
        rackLocation: it.stocks[0]?.rackBin?.binCode || 'Unassigned'
      };
    });

    const kpis = {
      totalItems: items.length,
      totalStockUnits,
      totalCostValuation,
      totalSellingValuation,
      totalMrpValuation,
      estimatedGrossMargin: totalSellingValuation > 0 ? round2Decimals(((totalSellingValuation - totalCostValuation) / totalSellingValuation) * 100) : 0,
      lowStockCount,
      outOfStockCount
    };

    let rows: any[] = [];

    switch (query.reportType) {
      case 'valuation':
        rows = enrichedItems.sort((a, b) => b.costValue - a.costValue);
        break;

      case 'low_stock':
        rows = enrichedItems.filter((i) => i.currentStock > 0 && i.currentStock <= i.minReorderLevel);
        break;

      case 'out_of_stock':
        rows = enrichedItems.filter((i) => i.currentStock === 0);
        break;

      case 'negative_stock':
        rows = enrichedItems.filter((i) => i.currentStock < 0);
        break;

      case 'fast_moving':
        rows = enrichedItems.filter((i) => i.totalSalesUnits >= (query.velocityThreshold || 10)).sort((a, b) => b.totalSalesUnits - a.totalSalesUnits);
        break;

      case 'slow_moving':
        rows = enrichedItems.filter((i) => i.currentStock > 0 && i.totalSalesUnits < (query.velocityThreshold || 5)).sort((a, b) => a.totalSalesUnits - b.totalSalesUnits);
        break;

      case 'dead_stock':
        rows = enrichedItems.filter((i) => i.currentStock > 0 && i.totalSalesUnits === 0).sort((a, b) => b.costValue - a.costValue);
        break;

      case 'adjustments': {
        const movements = await prisma.stockMovement.findMany({
          where: { movementType: StockMovementType.ADJUSTMENT },
          include: { item: true, user: true },
          orderBy: { createdAt: 'desc' },
          take: 100
        });
        rows = movements.map((m) => ({
          id: m.id,
          itemName: m.item?.name,
          sku: m.item?.sku,
          direction: m.direction,
          quantity: Number(m.quantity),
          previousBalance: Number(m.previousBalance),
          newBalance: Number(m.newBalance),
          reason: m.reason || 'Stock Reconcile Adjustment',
          performedBy: m.user?.fullName || m.user?.username || 'Staff',
          date: m.createdAt
        }));
        break;
      }

      case 'current_stock':
      default:
        rows = enrichedItems.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    const page = query.page || 1;
    const limit = query.limit || 50;
    const paginatedRows = rows.slice((page - 1) * limit, page * limit);

    return {
      reportType: query.reportType,
      kpis,
      totalRecords: rows.length,
      page,
      limit,
      data: paginatedRows
    };
  }

  // ============================================================================
  // PROFITABILITY & MARGINS
  // ============================================================================

  async getProfitabilityReport(query: ProfitabilityReportQueryDto) {
    const { startDate, endDate, label } = this.resolveDateRange(query.period, query.startDate, query.endDate);

    const whereSale: any = {
      invoiceDate: { gte: startDate, lte: endDate },
      status: { in: [RecordStatus.COMPLETED, RecordStatus.ACTIVE] }
    };

    if (query.customerId) whereSale.customerId = query.customerId;
    if (query.userId) whereSale.createdById = query.userId;

    const sales = await prisma.sale.findMany({
      where: whereSale,
      include: {
        customer: true,
        createdBy: true,
        items: {
          include: {
            item: {
              include: {
                brand: true,
                category: true,
                stocks: { take: 1 },
                prices: { where: { isCurrent: true }, take: 1 }
              }
            }
          }
        }
      }
    });

    let totalRevenue = 0;
    let totalCogs = 0;
    let totalGrossProfit = 0;
    let totalDiscountGiven = 0;
    let totalFittingRevenue = 0;

    const itemProfitMap = new Map<string, { itemId: string; name: string; sku: string; brand: string; category: string; qtySold: number; revenue: number; cogs: number; profit: number; marginPct: number }>();
    const brandProfitMap = new Map<string, { brand: string; revenue: number; cogs: number; profit: number; marginPct: number }>();
    const catProfitMap = new Map<string, { category: string; revenue: number; cogs: number; profit: number; marginPct: number }>();

    for (const s of sales) {
      totalRevenue = round2Decimals(totalRevenue + Number(s.taxableAmount));
      totalDiscountGiven = round2Decimals(totalDiscountGiven + Number(s.discountTotal));
      totalFittingRevenue = round2Decimals(totalFittingRevenue + Number(s.fittingCharges));

      for (const line of s.items) {
        const qty = Number(line.quantity);
        const lineRevenue = Number(line.taxableAmount);
        const unitCost = Number(line.item?.stocks[0]?.avgCostRate || line.item?.prices[0]?.purchaseRate || 0);
        const lineCogs = round2Decimals(qty * unitCost);
        const lineProfit = round2Decimals(lineRevenue - lineCogs);

        totalCogs = round2Decimals(totalCogs + lineCogs);
        totalGrossProfit = round2Decimals(totalGrossProfit + lineProfit);

        // Item Aggregation
        const iid = line.itemId;
        const exItem = itemProfitMap.get(iid) || {
          itemId: iid,
          name: line.item?.name || 'Part',
          sku: line.item?.sku || '',
          brand: line.item?.brand?.name || 'OEM',
          category: line.item?.category?.name || 'Spares',
          qtySold: 0,
          revenue: 0,
          cogs: 0,
          profit: 0,
          marginPct: 0
        };
        exItem.qtySold = round2Decimals(exItem.qtySold + qty);
        exItem.revenue = round2Decimals(exItem.revenue + lineRevenue);
        exItem.cogs = round2Decimals(exItem.cogs + lineCogs);
        exItem.profit = round2Decimals(exItem.revenue - exItem.cogs);
        exItem.marginPct = exItem.revenue > 0 ? round2Decimals((exItem.profit / exItem.revenue) * 100) : 0;
        itemProfitMap.set(iid, exItem);

        // Brand Aggregation
        const bname = line.item?.brand?.name || 'OEM Standard';
        const exBrand = brandProfitMap.get(bname) || { brand: bname, revenue: 0, cogs: 0, profit: 0, marginPct: 0 };
        exBrand.revenue = round2Decimals(exBrand.revenue + lineRevenue);
        exBrand.cogs = round2Decimals(exBrand.cogs + lineCogs);
        exBrand.profit = round2Decimals(exBrand.revenue - exBrand.cogs);
        exBrand.marginPct = exBrand.revenue > 0 ? round2Decimals((exBrand.profit / exBrand.revenue) * 100) : 0;
        brandProfitMap.set(bname, exBrand);

        // Category Aggregation
        const cname = line.item?.category?.name || 'General';
        const exCat = catProfitMap.get(cname) || { category: cname, revenue: 0, cogs: 0, profit: 0, marginPct: 0 };
        exCat.revenue = round2Decimals(exCat.revenue + lineRevenue);
        exCat.cogs = round2Decimals(exCat.cogs + lineCogs);
        exCat.profit = round2Decimals(exCat.revenue - exCat.cogs);
        exCat.marginPct = exCat.revenue > 0 ? round2Decimals((exCat.profit / exCat.revenue) * 100) : 0;
        catProfitMap.set(cname, exCat);
      }
    }

    const overallMarginPct = totalRevenue > 0 ? round2Decimals((totalGrossProfit / totalRevenue) * 100) : 0;

    const itemRows = Array.from(itemProfitMap.values());
    const topProfitableItems = [...itemRows].sort((a, b) => b.profit - a.profit).slice(0, 10);
    const lowestMarginItems = [...itemRows].filter((i) => i.revenue > 500).sort((a, b) => a.marginPct - b.marginPct).slice(0, 10);

    const kpis = {
      grossRevenue: totalRevenue,
      cogs: totalCogs,
      grossProfit: totalGrossProfit,
      grossMarginPct: overallMarginPct,
      discountsGiven: totalDiscountGiven,
      additionalFittingCharges: totalFittingRevenue
    };

    let dataRows: any[] = [];
    if (query.groupBy === 'brand') {
      dataRows = Array.from(brandProfitMap.values()).sort((a, b) => b.profit - a.profit);
    } else if (query.groupBy === 'category') {
      dataRows = Array.from(catProfitMap.values()).sort((a, b) => b.profit - a.profit);
    } else {
      dataRows = itemRows.sort((a, b) => b.profit - a.profit);
    }

    return {
      period: label,
      kpis,
      topProfitableItems,
      lowestMarginItems,
      mostProfitableBrands: Array.from(brandProfitMap.values()).sort((a, b) => b.profit - a.profit).slice(0, 5),
      mostProfitableCategories: Array.from(catProfitMap.values()).sort((a, b) => b.profit - a.profit).slice(0, 5),
      data: dataRows
    };
  }

  // ============================================================================
  // FINANCIAL REPORTS (Direct Double-Entry Ledger Backed)
  // ============================================================================

  async getFinancialReport(query: FinancialReportQueryDto) {
    const { startDate, endDate, label } = this.resolveDateRange(query.period, query.startDate, query.endDate);

    switch (query.reportType) {
      case 'day_book': {
        const entries = await prisma.ledgerEntry.findMany({
          where: { date: { gte: startDate, lte: endDate } },
          include: { account: true },
          orderBy: { date: 'asc' }
        });

        const totalDebit = entries.reduce((acc, e) => round2Decimals(acc + Number(e.debit)), 0);
        const totalCredit = entries.reduce((acc, e) => round2Decimals(acc + Number(e.credit)), 0);

        return {
          reportType: 'Day Book',
          period: label,
          kpis: { totalDebit, totalCredit, entryCount: entries.length },
          data: entries.map((e) => ({
            id: e.id,
            date: e.date,
            accountName: e.account.name,
            accountGroup: e.account.group,
            particulars: e.particulars,
            voucherType: e.voucherType,
            voucherNo: e.voucherNo,
            debit: Number(e.debit),
            credit: Number(e.credit),
            balanceAfter: Number(e.balanceAfter)
          }))
        };
      }

      case 'cash_book': {
        const cashAccount = await prisma.ledgerAccount.findFirst({
          where: { group: 'Cash-in-hand' },
          include: {
            entries: {
              where: { date: { gte: startDate, lte: endDate } },
              orderBy: { date: 'asc' }
            }
          }
        });

        const opening = Number(cashAccount?.openingBalance || 0);
        let current = opening;
        const mappedEntries = (cashAccount?.entries || []).map((e) => {
          const deb = Number(e.debit);
          const cred = Number(e.credit);
          current = round2Decimals(current + deb - cred);
          return {
            date: e.date,
            particulars: e.particulars,
            voucherType: e.voucherType,
            voucherNo: e.voucherNo,
            receiptDebit: deb,
            paymentCredit: cred,
            runningBalance: current
          };
        });

        const totalInflows = mappedEntries.reduce((acc, e) => round2Decimals(acc + e.receiptDebit), 0);
        const totalOutflows = mappedEntries.reduce((acc, e) => round2Decimals(acc + e.paymentCredit), 0);

        return {
          reportType: 'Cash Book',
          period: label,
          kpis: {
            openingBalance: opening,
            totalCashInflows: totalInflows,
            totalCashOutflows: totalOutflows,
            closingCashBalance: current
          },
          data: mappedEntries
        };
      }

      case 'bank_book': {
        const bankAccounts = await prisma.bankAccount.findMany({
          include: {
            transactions: {
              where: { date: { gte: startDate, lte: endDate } },
              orderBy: { date: 'asc' }
            }
          }
        });

        const totalBankBalance = bankAccounts.reduce((acc, b) => round2Decimals(acc + Number(b.balance)), 0);

        return {
          reportType: 'Bank Book',
          period: label,
          kpis: { totalBankBalance, totalAccounts: bankAccounts.length },
          accounts: bankAccounts.map((b) => ({
            id: b.id,
            bankName: b.bankName,
            accountNumber: b.accountNumber,
            ifsc: b.ifscCode,
            currentBalance: Number(b.balance),
            transactionCount: b.transactions.length,
            transactions: b.transactions.map((t) => ({
              id: t.id,
              date: t.date,
              type: t.type,
              reference: t.reference,
              party: t.party,
              debit: Number(t.debit),
              credit: Number(t.credit),
              balanceAfter: Number(t.balanceAfter)
            }))
          }))
        };
      }

      case 'trial_balance': {
        const accounts = await prisma.ledgerAccount.findMany({
          include: { entries: true },
          orderBy: { group: 'asc' }
        });

        let totalDebit = 0;
        let totalCredit = 0;

        const rows = accounts.map((acc) => {
          const debits = acc.entries.reduce((sum, e) => sum + Number(e.debit), 0);
          const credits = acc.entries.reduce((sum, e) => sum + Number(e.credit), 0);
          const net = debits - credits;

          const debitBalance = net >= 0 ? net : 0;
          const creditBalance = net < 0 ? Math.abs(net) : 0;

          totalDebit = round2Decimals(totalDebit + debitBalance);
          totalCredit = round2Decimals(totalCredit + creditBalance);

          return {
            id: acc.id,
            accountCode: acc.accountCode,
            name: acc.name,
            group: acc.group,
            debitBalance,
            creditBalance
          };
        });

        return {
          reportType: 'Trial Balance',
          period: label,
          isBalanced: Math.abs(totalDebit - totalCredit) < 1.0,
          kpis: { totalDebit, totalCredit, difference: round2Decimals(totalDebit - totalCredit) },
          data: rows
        };
      }

      case 'trading_account':
      case 'profit_and_loss': {
        const [sales, purchases, stocks] = await Promise.all([
          prisma.sale.findMany({
            where: { invoiceDate: { gte: startDate, lte: endDate }, status: RecordStatus.COMPLETED }
          }),
          prisma.purchase.findMany({
            where: { invoiceDate: { gte: startDate, lte: endDate }, status: RecordStatus.APPROVED }
          }),
          prisma.stock.findMany({
            include: { item: { include: { prices: { where: { isCurrent: true }, take: 1 } } } }
          })
        ]);

        const totalSalesRevenue = sales.reduce((sum, s) => round2Decimals(sum + Number(s.taxableAmount)), 0);
        const totalPurchasesCost = purchases.reduce((sum, p) => round2Decimals(sum + Number(p.taxableAmount)), 0);
        const closingStockValuation = stocks.reduce((sum, st) => {
          const cost = Number(st.avgCostRate || st.item?.prices[0]?.purchaseRate || 0);
          return round2Decimals(sum + Number(st.quantity) * cost);
        }, 0);

        const grossProfit = round2Decimals(totalSalesRevenue - totalPurchasesCost + (closingStockValuation * 0.1));

        return {
          reportType: 'Trading and Profit & Loss Account',
          period: label,
          tradingAccount: {
            salesRevenue: totalSalesRevenue,
            purchases: totalPurchasesCost,
            closingStock: closingStockValuation,
            grossProfit
          },
          profitAndLoss: {
            grossProfit,
            operatingExpenses: 0,
            netProfit: grossProfit
          }
        };
      }

      case 'balance_sheet': {
        const [debtors, bankAccounts, stocks, creditors] = await Promise.all([
          prisma.customer.aggregate({ _sum: { outstanding: true } }),
          prisma.bankAccount.aggregate({ _sum: { balance: true } }),
          prisma.stock.findMany({
            include: { item: { include: { prices: { where: { isCurrent: true }, take: 1 } } } }
          }),
          prisma.supplier.aggregate({ _sum: { outstanding: true } })
        ]);

        const closingStockVal = stocks.reduce((sum, st) => {
          const cost = Number(st.avgCostRate || st.item?.prices[0]?.purchaseRate || 0);
          return round2Decimals(sum + Number(st.quantity) * cost);
        }, 0);

        const totalReceivables = Number(debtors._sum.outstanding || 0);
        const totalBankBalances = Number(bankAccounts._sum.balance || 0);
        const totalPayables = Number(creditors._sum.outstanding || 0);

        const currentAssets = round2Decimals(totalReceivables + totalBankBalances + closingStockVal);
        const currentLiabilities = round2Decimals(totalPayables);
        const netWorkingCapital = round2Decimals(currentAssets - currentLiabilities);

        return {
          reportType: 'Balance Sheet',
          period: label,
          assets: {
            currentAssets: {
              tradeReceivables: totalReceivables,
              bankAndCashBalances: totalBankBalances,
              closingStockInventory: closingStockVal,
              totalCurrentAssets: currentAssets
            },
            totalAssets: currentAssets
          },
          liabilities: {
            currentLiabilities: {
              tradePayables: totalPayables,
              totalCurrentLiabilities: currentLiabilities
            },
            netWorth: netWorkingCapital,
            totalLiabilitiesAndEquity: currentAssets
          }
        };
      }

      default:
        return { message: 'Financial statement generated' };
    }
  }

  // ============================================================================
  // BUSINESS INSIGHTS ENGINE
  // ============================================================================

  async getBusinessInsights(query: BusinessInsightsQueryDto) {
    const days = query.days || 30;
    const now = new Date();
    const periodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const prevPeriodStart = new Date(periodStart.getTime() - days * 24 * 60 * 60 * 1000);

    // 1. Current vs Prior Sales
    const [currentSales, priorSales, lowStockItems, deadStockItems, topCustomers] = await Promise.all([
      prisma.sale.aggregate({
        where: { invoiceDate: { gte: periodStart }, status: RecordStatus.COMPLETED },
        _sum: { totalAmount: true },
        _count: { id: true }
      }),
      prisma.sale.aggregate({
        where: { invoiceDate: { gte: prevPeriodStart, lt: periodStart }, status: RecordStatus.COMPLETED },
        _sum: { totalAmount: true },
        _count: { id: true }
      }),
      prisma.item.findMany({
        where: {
          status: RecordStatus.ACTIVE,
          stocks: {
            some: {
              quantity: { lte: 5 }
            }
          }
        },
        select: { id: true, name: true, sku: true, minReorderLevel: true, stocks: true },
        take: 10
      }),
      prisma.item.findMany({
        where: {
          status: RecordStatus.ACTIVE,
          stocks: { some: { quantity: { gt: 0 } } },
          saleItems: { none: { sale: { invoiceDate: { gte: periodStart } } } }
        },
        include: { brand: true, stocks: true },
        take: 10
      }),
      prisma.customer.findMany({
        where: { status: RecordStatus.ACTIVE },
        orderBy: { outstanding: 'desc' },
        take: 5
      })
    ]);

    const curAmount = Number(currentSales._sum.totalAmount || 0);
    const prevAmount = Number(priorSales._sum.totalAmount || 0);
    const salesGrowthPct = prevAmount > 0 ? round2Decimals(((curAmount - prevAmount) / prevAmount) * 100) : 0;

    return {
      timeframeDays: days,
      metrics: {
        currentPeriodSales: curAmount,
        priorPeriodSales: prevAmount,
        salesGrowthPct,
        currentInvoiceCount: currentSales._count.id,
        priorInvoiceCount: priorSales._count.id
      },
      operationalAlerts: [
        ...(salesGrowthPct >= 0
          ? [{ type: 'POSITIVE', title: 'Sales Momentum', message: `Sales grew by +${salesGrowthPct}% compared to prior period` }]
          : [{ type: 'WARNING', title: 'Sales Dip', message: `Sales decreased by ${salesGrowthPct}% compared to prior period` }]),
        ...(lowStockItems.length > 0
          ? [{ type: 'CRITICAL', title: 'Low Stock Risk', message: `${lowStockItems.length} essential parts reached critical reorder thresholds` }]
          : []),
        ...(deadStockItems.length > 0
          ? [{ type: 'WARNING', title: 'Dead Inventory Alert', message: `${deadStockItems.length} parts have zero sales in the last ${days} days` }]
          : [])
      ],
      lowStockRisks: lowStockItems.map((i) => ({
        id: i.id,
        name: i.name,
        sku: i.sku,
        currentStock: i.stocks.reduce((acc, s) => acc + Number(s.quantity), 0),
        minReorder: Number(i.minReorderLevel)
      })),
      deadStockRisks: deadStockItems.map((i) => ({
        id: i.id,
        name: i.name,
        brand: i.brand?.name,
        stockUnits: i.stocks.reduce((acc, s) => acc + Number(s.quantity), 0)
      })),
      topDebtors: topCustomers.map((c) => ({
        id: c.id,
        name: c.name,
        mobile: c.mobile,
        outstanding: Number(c.outstanding)
      }))
    };
  }
}

export const reportService = new ReportService();
