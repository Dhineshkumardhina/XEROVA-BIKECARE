import { z } from 'zod';
import { CustomerType } from '@prisma/client';

export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Customer name is required').max(150).trim(),
  mobile: z.string().regex(/^[0-9]{10}$/, 'Must be a 10-digit mobile number'),
  email: z.string().email().optional().or(z.literal('')),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format').optional().or(z.literal('')),
  customerType: z.nativeEnum(CustomerType).default(CustomerType.RETAIL),
  creditLimit: z.coerce.number().min(0).default(0),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional()
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const addVehicleSchema = z.object({
  regNo: z.string().min(6).max(20).trim().toUpperCase(),
  manufacturer: z.string().min(2).max(100).trim(),
  model: z.string().min(2).max(100).trim(),
  year: z.coerce.number().int().min(1980).max(2030).optional(),
  chassisNo: z.string().max(50).optional(),
  engineNo: z.string().max(50).optional()
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type AddVehicleInput = z.infer<typeof addVehicleSchema>;
