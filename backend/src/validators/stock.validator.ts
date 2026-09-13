import { z } from 'zod';
import { StockMovementType, StockDirection } from '@prisma/client';

export const stockAdjustmentSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  branchId: z.string().optional(),
  direction: z.nativeEnum(StockDirection),
  quantity: z.coerce.number().positive('Adjustment quantity must be greater than zero'),
  reason: z.string().min(1, 'Reason for adjustment is required'),
  notes: z.string().max(500).optional().nullable()
});

export const stockMovementQuerySchema = z.object({
  itemId: z.string().optional(),
  branchId: z.string().optional(),
  movementType: z.nativeEnum(StockMovementType).optional(),
  referenceType: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(30)
});

export const stockReportQuerySchema = z.object({
  branchId: z.string().optional(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  status: z.enum(['ALL', 'NORMAL', 'LOW', 'OUT']).default('ALL'),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

export const lowStockQuerySchema = z.object({
  branchId: z.string().optional(),
  filterType: z.enum(['ALL_LOW', 'OUT_OF_STOCK', 'BELOW_REORDER']).default('ALL_LOW'),
  q: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50)
});

export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;
export type StockMovementQueryInput = z.infer<typeof stockMovementQuerySchema>;
export type StockReportQueryInput = z.infer<typeof stockReportQuerySchema>;
export type LowStockQueryInput = z.infer<typeof lowStockQuerySchema>;
