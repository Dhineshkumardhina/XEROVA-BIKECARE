import { z } from 'zod';
import { RecordStatus } from '@prisma/client';

export const createItemSchema = z.object({
  sku: z.string().min(2, 'SKU / Item code is required').max(50).trim().toUpperCase(),
  name: z.string().min(2, 'Item name is required').max(200).trim(),
  shortName: z.string().max(100).optional().nullable(),
  oemPartNumber: z.string().max(100).optional().nullable(),
  hsnCode: z.string().regex(/^[0-9]{2,8}$/, 'HSN code must be 2 to 8 digits').default('8714'),
  categoryId: z.string().min(1, 'Category is required'),
  brandId: z.string().min(1, 'Brand is required'),
  unitId: z.string().min(1, 'Unit is required').optional(),
  unit: z.string().optional(),
  gstRate: z.coerce.number().refine((val) => [0, 5, 12, 18, 28].includes(val), {
    message: 'GST rate must be 0%, 5%, 12%, 18%, or 28%'
  }),
  maintainStock: z.boolean().default(true),
  minReorderLevel: z.coerce.number().min(0).default(5),
  maxReorderLevel: z.coerce.number().min(0).optional().nullable(),
  imageUrl: z.string().max(500).optional().nullable(),
  
  // Custom Fields 1 - 5
  customField1: z.string().max(100).optional().nullable(),
  customField2: z.string().max(100).optional().nullable(),
  customField3: z.string().max(100).optional().nullable(),
  customField4: z.string().max(100).optional().nullable(),
  customField5: z.string().max(100).optional().nullable(),

  status: z.nativeEnum(RecordStatus).default(RecordStatus.ACTIVE),

  // Pricing
  mrp: z.coerce.number().positive('MRP must be greater than zero'),
  purchaseRate: z.coerce.number().positive('Purchase rate must be greater than zero'),
  sellingRate: z.coerce.number().positive('Selling rate must be greater than zero'),
  garageRate: z.coerce.number().positive().optional().nullable(),
  wholesaleRate: z.coerce.number().positive().optional().nullable(),

  // Multiple Barcodes
  barcodes: z.array(z.object({
    barcode: z.string().min(1).max(100),
    barcodeType: z.string().optional().default('CODE128'),
    type: z.string().optional(),
    isPrimary: z.boolean().default(false)
  })).optional(),
  barcode: z.string().max(100).optional().nullable(), // single shortcut barcode

  // Vehicle Compatibility
  vehicleVariantIds: z.array(z.string().uuid()).optional().default([]),

  // Initial Stock in Branch (Optional on creation)
  rackBinId: z.string().uuid().optional().nullable(),
  initialStock: z.coerce.number().min(0).default(0)
});

export const updateItemSchema = createItemSchema.partial();

export const itemSearchQuerySchema = z.object({
  q: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  vehicleModelId: z.string().uuid().optional(),
  vehicleVariantId: z.string().uuid().optional(),
  status: z.nativeEnum(RecordStatus).optional(),
  stockStatus: z.enum(['ALL', 'NORMAL', 'LOW_STOCK', 'OUT_OF_STOCK']).default('ALL'),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['name', 'sku', 'createdAt', 'sellingRate', 'oemPartNumber']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
});

export const importItemRowSchema = z.object({
  sku: z.string().min(1).max(50).trim().toUpperCase(),
  name: z.string().min(2).max(200).trim(),
  shortName: z.string().optional(),
  partNumber: z.string().optional(),
  hsn: z.string().default('8714'),
  gstRate: z.coerce.number().default(18),
  brand: z.string().min(1),
  category: z.string().min(1),
  unit: z.string().default('PCS'),
  mrp: z.coerce.number().positive(),
  purchaseRate: z.coerce.number().positive(),
  sellingRate: z.coerce.number().positive(),
  barcode: z.string().optional(),
  maintainStock: z.coerce.boolean().default(true),
  customField1: z.string().optional(),
  customField2: z.string().optional(),
  customField3: z.string().optional(),
  customField4: z.string().optional(),
  customField5: z.string().optional()
});

export const importItemsBatchSchema = z.object({
  items: z.array(importItemRowSchema).min(1, 'At least one item row is required')
});

export const exportItemsQuerySchema = z.object({
  q: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  status: z.nativeEnum(RecordStatus).optional(),
  selectedIds: z.array(z.string().uuid()).optional()
});

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type ItemSearchQueryInput = z.infer<typeof itemSearchQuerySchema>;
export type ImportItemRowInput = z.infer<typeof importItemRowSchema>;
export type ImportItemsBatchInput = z.infer<typeof importItemsBatchSchema>;
export type ExportItemsQueryInput = z.infer<typeof exportItemsQuerySchema>;

