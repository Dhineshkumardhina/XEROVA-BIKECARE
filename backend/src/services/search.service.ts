import { prisma } from '../config/database.js';

export interface GroupedSearchResults {
  items: Array<{
    id: string;
    type: 'item';
    title: string;
    subtitle: string;
    badge?: string;
    metaRight?: string;
    metaSubRight?: string;
    sku: string;
    oemPartNumber?: string;
    barcode?: string;
  }>;
  customers: Array<{
    id: string;
    type: 'customer';
    title: string;
    subtitle: string;
    badge?: string;
    metaRight?: string;
    mobile: string;
    gstin?: string;
  }>;
  suppliers: Array<{
    id: string;
    type: 'supplier';
    title: string;
    subtitle: string;
    badge?: string;
    metaRight?: string;
    mobile: string;
    gstin?: string;
  }>;
  invoices: Array<{
    id: string;
    type: 'invoice';
    title: string;
    subtitle: string;
    badge?: string;
    metaRight?: string;
    invoiceNumber: string;
    date: string;
  }>;
  purchases: Array<{
    id: string;
    type: 'purchase';
    title: string;
    subtitle: string;
    badge?: string;
    metaRight?: string;
    poNumber: string;
    date: string;
  }>;
  quotations: Array<{
    id: string;
    type: 'quotation';
    title: string;
    subtitle: string;
    badge?: string;
    metaRight?: string;
    quotationNumber: string;
  }>;
  vehicles: Array<{
    id: string;
    type: 'vehicle';
    title: string;
    subtitle: string;
    regNo: string;
    customerName?: string;
  }>;
  vouchers: Array<{
    id: string;
    type: 'voucher';
    title: string;
    subtitle: string;
    voucherType: string;
    voucherNo: string;
    amount: string;
  }>;
}

export class SearchService {
  /**
   * Fast, indexed, multi-entity search across entire ERP database.
   * Returns max top 5-10 records per group to prevent client memory bloat.
   */
  async globalSearch(query: string, limitPerGroup: number = 6): Promise<GroupedSearchResults> {
    const q = query.trim();
    if (!q) {
      return {
        items: [],
        customers: [],
        suppliers: [],
        invoices: [],
        purchases: [],
        quotations: [],
        vehicles: [],
        vouchers: []
      };
    }

    try {
      const [
        items,
        customers,
        suppliers,
        sales,
        purchases,
        quotations,
        vehicles,
        receipts,
        payments
      ] = await Promise.all([
        // 1. Items & Spare Parts (SKU, Name, OEM, Barcode)
        prisma.item.findMany({
          where: {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { sku: { contains: q, mode: 'insensitive' } },
              { oemPartNumber: { contains: q, mode: 'insensitive' } },
              { shortName: { contains: q, mode: 'insensitive' } }
            ]
          },
          take: limitPerGroup,
          include: {
            brand: { select: { name: true } },
            prices: { where: { isCurrent: true }, take: 1 },
            stocks: { take: 1 }
          }
        }).catch(() => []),

        // 2. Customers
        prisma.customer.findMany({
          where: {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { customerCode: { contains: q, mode: 'insensitive' } },
              { mobile: { contains: q } },
              { gstin: { contains: q, mode: 'insensitive' } }
            ]
          },
          take: limitPerGroup
        }).catch(() => []),

        // 3. Suppliers
        prisma.supplier.findMany({
          where: {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { supplierCode: { contains: q, mode: 'insensitive' } },
              { mobile: { contains: q } },
              { gstin: { contains: q, mode: 'insensitive' } }
            ]
          },
          take: limitPerGroup
        }).catch(() => []),

        // 4. Sales Invoices
        prisma.sale.findMany({
          where: {
            OR: [
              { invoiceNumber: { contains: q, mode: 'insensitive' } },
              { customerName: { contains: q, mode: 'insensitive' } }
            ]
          },
          take: limitPerGroup,
          include: { customer: { select: { name: true } } }
        }).catch(() => []),

        // 5. Purchases
        prisma.purchase.findMany({
          where: {
            OR: [
              { poNumber: { contains: q, mode: 'insensitive' } },
              { supplierInvoiceNo: { contains: q, mode: 'insensitive' } },
              { supplier: { name: { contains: q, mode: 'insensitive' } } }
            ]
          },
          take: limitPerGroup,
          include: { supplier: { select: { name: true } } }
        }).catch(() => []),

        // 6. Quotations
        prisma.quotation.findMany({
          where: {
            OR: [
              { quotationNumber: { contains: q, mode: 'insensitive' } },
              { customerName: { contains: q, mode: 'insensitive' } },
              { vehicleDetails: { contains: q, mode: 'insensitive' } }
            ]
          },
          take: limitPerGroup
        }).catch(() => []),

        // 7. Vehicles
        prisma.customerVehicle.findMany({
          where: {
            OR: [
              { regNo: { contains: q, mode: 'insensitive' } },
              { chassisNo: { contains: q, mode: 'insensitive' } },
              { customer: { name: { contains: q, mode: 'insensitive' } } }
            ]
          },
          take: limitPerGroup,
          include: { customer: { select: { name: true } } }
        }).catch(() => []),

        // 8. Receipts
        (prisma as any).receiptVoucher?.findMany ? (prisma as any).receiptVoucher.findMany({
          where: {
            OR: [
              { voucherNumber: { contains: q, mode: 'insensitive' } },
              { customer: { name: { contains: q, mode: 'insensitive' } } }
            ]
          },
          take: limitPerGroup,
          include: { customer: { select: { name: true } } }
        }).catch(() => []) : Promise.resolve([]),

        // 9. Payments
        (prisma as any).paymentVoucher?.findMany ? (prisma as any).paymentVoucher.findMany({
          where: {
            OR: [
              { voucherNumber: { contains: q, mode: 'insensitive' } },
              { supplier: { name: { contains: q, mode: 'insensitive' } } }
            ]
          },
          take: limitPerGroup,
          include: { supplier: { select: { name: true } } }
        }).catch(() => []) : Promise.resolve([])
      ]);

      return {
        items: items.map((i: any) => ({
          id: i.id,
          type: 'item',
          title: i.name,
          subtitle: `${i.sku} • ${i.brand?.name || 'OEM'} ${i.oemPartNumber ? `• OEM: ${i.oemPartNumber}` : ''}`,
          badge: i.status,
          metaRight: i.prices?.[0]?.sellingRate ? `₹${Number(i.prices[0].sellingRate).toFixed(2)}` : undefined,
          metaSubRight: i.stocks?.[0]?.quantity !== undefined ? `Stock: ${Number(i.stocks[0].quantity)} pcs` : undefined,
          sku: i.sku,
          oemPartNumber: i.oemPartNumber || undefined
        })),

        customers: customers.map((c: any) => ({
          id: c.id,
          type: 'customer',
          title: c.name,
          subtitle: `${c.customerCode} • ${c.mobile} ${c.city ? `• ${c.city}` : ''}`,
          badge: c.customerType,
          metaRight: c.outstanding ? `₹${Number(c.outstanding).toFixed(2)}` : '₹0.00',
          mobile: c.mobile,
          gstin: c.gstin || undefined
        })),

        suppliers: suppliers.map((s: any) => ({
          id: s.id,
          type: 'supplier',
          title: s.name,
          subtitle: `${s.supplierCode} • ${s.mobile} ${s.city ? `• ${s.city}` : ''}`,
          badge: 'Supplier',
          metaRight: s.outstanding ? `₹${Number(s.outstanding).toFixed(2)}` : '₹0.00',
          mobile: s.mobile,
          gstin: s.gstin || undefined
        })),

        invoices: sales.map((sale: any) => ({
          id: sale.id,
          type: 'invoice',
          title: sale.invoiceNumber,
          subtitle: `${sale.customer?.name || 'Cash Counter'} • ${new Date(sale.invoiceDate).toLocaleDateString()}`,
          badge: sale.paymentStatus || 'PAID',
          metaRight: `₹${Number(sale.netAmount).toFixed(2)}`,
          invoiceNumber: sale.invoiceNumber,
          date: new Date(sale.invoiceDate).toLocaleDateString()
        })),

        purchases: purchases.map((po: any) => ({
          id: po.id,
          type: 'purchase',
          title: po.poNumber,
          subtitle: `${po.supplier?.name || 'Vendor'} • ${new Date(po.invoiceDate).toLocaleDateString()}`,
          badge: po.status,
          metaRight: `₹${Number(po.totalAmount).toFixed(2)}`,
          poNumber: po.poNumber,
          date: new Date(po.invoiceDate).toLocaleDateString()
        })),

        quotations: quotations.map((q: any) => ({
          id: q.id,
          type: 'quotation',
          title: q.quotationNumber,
          subtitle: `${q.customerName} • ${q.vehicleDetails || ''}`,
          badge: q.status,
          metaRight: `₹${Number(q.totalAmount).toFixed(2)}`,
          quotationNumber: q.quotationNumber
        })),

        vehicles: vehicles.map((v: any) => ({
          id: v.id,
          type: 'vehicle',
          title: v.regNo,
          subtitle: `${v.manufacturer} ${v.model} (${v.year || 'BS6'}) • Owner: ${v.customer?.name || 'Unknown'}`,
          regNo: v.regNo,
          customerName: v.customer?.name
        })),

        vouchers: [
          ...receipts.map((r: any) => ({
            id: r.id,
            type: 'voucher' as const,
            title: `Receipt #${r.voucherNumber}`,
            subtitle: `Customer: ${r.customer?.name || 'Cash'} • Mode: ${r.paymentMode}`,
            voucherType: 'RECEIPT',
            voucherNo: r.voucherNumber,
            amount: `₹${Number(r.amount).toFixed(2)}`
          })),
          ...payments.map((p: any) => ({
            id: p.id,
            type: 'voucher' as const,
            title: `Payment #${p.voucherNumber}`,
            subtitle: `Supplier: ${p.supplier?.name || 'Vendor'} • Mode: ${p.paymentMode}`,
            voucherType: 'PAYMENT',
            voucherNo: p.voucherNumber,
            amount: `₹${Number(p.amount).toFixed(2)}`
          }))
        ]
      };
    } catch {
      return {
        items: [],
        customers: [],
        suppliers: [],
        invoices: [],
        purchases: [],
        quotations: [],
        vehicles: [],
        vouchers: []
      };
    }
  }
}

export const searchService = new SearchService();
