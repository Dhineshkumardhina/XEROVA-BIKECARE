import { z } from 'zod';
import { RecordStatus } from '@prisma/client';

export const createSupplierSchema = z.object({
  name: z.string().min(2, 'Supplier name is required').max(150).trim(),
  supplierCode: z.string().max(30).trim().optional(),
  contactPerson: z.string().max(100).optional().nullable(),
  mobile: z.string().regex(/^[0-9+\s-]{8,20}$/, 'Valid mobile number is required'),
  email: z.string().email('Valid email address is required').optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).default('Tamil Nadu'),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format').or(z.string().min(15).max(15)).or(z.literal('')).optional(),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format').or(z.literal('')).optional().nullable(),
  brandFocus: z.string().max(150).optional().nullable(),
  creditDays: z.coerce.number().int().min(0).default(30),
  creditLimit: z.coerce.number().min(0).default(0),
  openingBalance: z.coerce.number().default(0),
  status: z.nativeEnum(RecordStatus).default(RecordStatus.ACTIVE)
});

export const updateSupplierSchema = createSupplierSchema.partial();

export const supplierSearchQuerySchema = z.object({
  q: z.string().optional(),
  status: z.nativeEnum(RecordStatus).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50)
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
export type SupplierSearchQueryInput = z.infer<typeof supplierSearchQuerySchema>;
