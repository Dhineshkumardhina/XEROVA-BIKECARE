import { z } from 'zod';

export const gstLineItemInputSchema = z.object({
  itemId: z.string().uuid().optional(),
  quantity: z.number().min(0.001, 'Quantity must be greater than 0'),
  unitRate: z.number().min(0, 'Unit rate cannot be negative'),
  discountAmount: z.number().min(0).default(0),
  taxRate: z.number().min(0).max(100).default(18),
  isInterstate: z.boolean().default(false),
  taxType: z.enum(['TAXABLE', 'EXEMPT', 'NIL', 'NON_GST']).default('TAXABLE'),
  hsnCode: z.string().optional()
});

export const calculateTaxSchema = z.object({
  items: z.array(gstLineItemInputSchema).min(1, 'At least one item is required for tax calculation'),
  isInterstate: z.boolean().default(false),
  invoiceDiscount: z.number().min(0).default(0),
  fittingCharges: z.number().min(0).default(0),
  freightCharges: z.number().min(0).default(0),
  customerStateCode: z.string().optional(),
  customerGstin: z.string().optional()
});

export const gstPeriodQuerySchema = z.object({
  period: z.string().optional(), // "09-2026", "2026-09"
  quarter: z.string().optional(), // "Q1-2026"
  financialYear: z.string().optional(), // "2026-2027"
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  branchId: z.string().uuid().optional()
});

export const gstr1ExportSchema = z.object({
  period: z.string().min(1, 'Return period is required (e.g. 09-2026)'),
  format: z.enum(['json', 'excel', 'csv']).default('json'),
  branchId: z.string().uuid().optional()
});

export const lockPeriodSchema = z.object({
  period: z.string().min(1, 'Return period is required (e.g. 09-2026)'),
  arnNumber: z.string().optional(),
  reason: z.string().min(3, 'Reason is required for locking tax period'),
  remarks: z.string().optional()
});

export const unlockPeriodSchema = z.object({
  period: z.string().min(1, 'Return period is required (e.g. 09-2026)'),
  reason: z.string().min(5, 'Specific administrative reason is required to unlock a finalized period')
});

export const createTaxRateSchema = z.object({
  rateName: z.string().min(2, 'Rate name must be at least 2 characters'),
  cgstRate: z.number().min(0).max(50),
  sgstRate: z.number().min(0).max(50),
  igstRate: z.number().min(0).max(100),
  isDefault: z.boolean().default(false)
});

export const updateTaxRateSchema = createTaxRateSchema.partial();

export const validateGstinInputSchema = z.object({
  gstin: z.string().min(15).max(15, 'GSTIN must be exactly 15 characters')
});

export const recordGstTransactionSchema = z.object({
  returnPeriod: z.string().min(1),
  documentType: z.enum([
    'B2B_INVOICE',
    'B2C_INVOICE',
    'B2C_LARGE_INVOICE',
    'PURCHASE_ITC',
    'CREDIT_NOTE',
    'DEBIT_NOTE',
    'EXPENSE_ITC'
  ]),
  documentNumber: z.string().min(1),
  date: z.string().or(z.date()),
  partyGstin: z.string().nullable().optional(),
  partyName: z.string().min(1),
  hsnCode: z.string().default('8714'),
  taxableValue: z.number().min(0),
  cgst: z.number().min(0).default(0),
  sgst: z.number().min(0).default(0),
  igst: z.number().min(0).default(0),
  totalValue: z.number().min(0),
  isFiled: z.boolean().default(false)
});

export type GstLineItemDto = z.infer<typeof gstLineItemInputSchema>;
export type CalculateTaxDto = z.infer<typeof calculateTaxSchema>;
export type GstPeriodQueryDto = z.infer<typeof gstPeriodQuerySchema>;
export type Gstr1ExportDto = z.infer<typeof gstr1ExportSchema>;
export type LockPeriodDto = z.infer<typeof lockPeriodSchema>;
export type UnlockPeriodDto = z.infer<typeof unlockPeriodSchema>;
export type CreateTaxRateDto = z.infer<typeof createTaxRateSchema>;
export type RecordGstTransactionDto = z.infer<typeof recordGstTransactionSchema>;
