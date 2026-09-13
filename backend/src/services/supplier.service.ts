import { prisma } from '../config/database.js';
import { CreateSupplierInput, UpdateSupplierInput, SupplierSearchQueryInput } from '../validators/supplier.validator.js';
import { RecordStatus } from '@prisma/client';
import { recordAuditLog } from '../middleware/auditLogger.js';

export class SupplierService {
  async searchSuppliers(params: SupplierSearchQueryInput) {
    const { q, status, page, limit } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;

    if (q && q.trim()) {
      const token = q.trim();
      where.OR = [
        { name: { contains: token, mode: 'insensitive' } },
        { supplierCode: { contains: token, mode: 'insensitive' } },
        { contactPerson: { contains: token, mode: 'insensitive' } },
        { mobile: { contains: token, mode: 'insensitive' } },
        { gstin: { contains: token, mode: 'insensitive' } },
        { brandFocus: { contains: token, mode: 'insensitive' } }
      ];
    }

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { purchases: true } }
        }
      }),
      prisma.supplier.count({ where })
    ]);

    const formatted = suppliers.map((s) => ({
      id: s.id,
      supplierCode: s.supplierCode,
      name: s.name,
      contactPerson: s.contactPerson,
      mobile: s.mobile,
      email: s.email,
      gstin: s.gstin,
      pan: s.pan,
      brandFocus: s.brandFocus,
      creditDays: s.creditDays,
      creditLimit: Number(s.creditLimit),
      openingBalance: Number(s.openingBalance),
      outstanding: Number(s.outstanding),
      address: s.address,
      city: s.city,
      state: s.state,
      status: s.status,
      totalPurchasesCount: s._count.purchases,
      createdAt: s.createdAt
    }));

    return {
      suppliers: formatted,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getSupplierById(id: string) {
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        purchases: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            items: { include: { item: { select: { sku: true, name: true } } } }
          }
        },
        payments: {
          orderBy: { date: 'desc' },
          take: 10
        }
      }
    });

    if (!supplier) {
      throw { statusCode: 404, message: 'Supplier not found', code: 'SUPPLIER_NOT_FOUND' };
    }

    return {
      ...supplier,
      creditLimit: Number(supplier.creditLimit),
      openingBalance: Number(supplier.openingBalance),
      outstanding: Number(supplier.outstanding)
    };
  }

  async createSupplier(input: CreateSupplierInput, actor?: { userId?: string; username?: string }) {
    const supplierCode = input.supplierCode || `SUP-${Date.now().toString().slice(-5)}`;

    const supplier = await prisma.supplier.create({
      data: {
        name: input.name,
        supplierCode,
        contactPerson: input.contactPerson,
        mobile: input.mobile,
        email: input.email,
        gstin: input.gstin || `GSTIN-UNREG-${Date.now().toString().slice(-6)}`,
        pan: input.pan,
        brandFocus: input.brandFocus,
        creditDays: input.creditDays,
        creditLimit: input.creditLimit,
        openingBalance: input.openingBalance,
        outstanding: input.openingBalance,
        address: input.address,
        city: input.city,
        state: input.state,
        status: input.status
      }
    });

    if (actor) {
      await recordAuditLog({
        userId: actor.userId,
        username: actor.username || 'System',
        action: 'Supplier Created',
        module: 'Suppliers',
        entity: 'Supplier',
        entityId: supplier.id,
        newValue: { supplierCode: supplier.supplierCode, name: supplier.name, gstin: supplier.gstin },
        notes: `Created supplier ${supplier.name} (${supplier.supplierCode})`
      });
    }

    return {
      ...supplier,
      creditLimit: Number(supplier.creditLimit),
      openingBalance: Number(supplier.openingBalance),
      outstanding: Number(supplier.outstanding)
    };
  }

  async updateSupplier(id: string, input: UpdateSupplierInput, actor?: { userId?: string; username?: string }) {
    const existing = await prisma.supplier.findUnique({ where: { id } });
    if (!existing) {
      throw { statusCode: 404, message: 'Supplier not found', code: 'SUPPLIER_NOT_FOUND' };
    }

    const updated = await prisma.supplier.update({
      where: { id },
      data: input as any
    });

    if (actor) {
      await recordAuditLog({
        userId: actor.userId,
        username: actor.username || 'System',
        action: 'Supplier Updated',
        module: 'Suppliers',
        entity: 'Supplier',
        entityId: updated.id,
        previousValue: existing,
        newValue: updated,
        notes: `Updated supplier details for ${updated.name}`
      });
    }

    return {
      ...updated,
      creditLimit: Number(updated.creditLimit),
      openingBalance: Number(updated.openingBalance),
      outstanding: Number(updated.outstanding)
    };
  }

  async toggleStatus(id: string, actor?: { userId?: string; username?: string }) {
    const existing = await prisma.supplier.findUnique({ where: { id } });
    if (!existing) {
      throw { statusCode: 404, message: 'Supplier not found', code: 'SUPPLIER_NOT_FOUND' };
    }

    const newStatus = existing.status === RecordStatus.ACTIVE ? RecordStatus.INACTIVE : RecordStatus.ACTIVE;

    const updated = await prisma.supplier.update({
      where: { id },
      data: { status: newStatus }
    });

    if (actor) {
      await recordAuditLog({
        userId: actor.userId,
        username: actor.username || 'System',
        action: `Supplier ${newStatus === RecordStatus.ACTIVE ? 'Activated' : 'Deactivated'}`,
        module: 'Suppliers',
        entity: 'Supplier',
        entityId: updated.id,
        notes: `Changed status to ${newStatus}`
      });
    }

    return updated;
  }
}

export const supplierService = new SupplierService();
