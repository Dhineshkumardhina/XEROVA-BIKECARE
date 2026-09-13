import { z } from 'zod';
import { RecordStatus } from '@prisma/client';

export const quotationItemInputSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  partNumber: z.string().optional(),
  name: z.string().optional(),
  vehicle: z.string().optional(),
  quantity: z.coerce.number().positive('Quantity must be greater than zero'),
  unitRate: z.coerce.number().positive('Rate must be greater than zero'),
  mrp: z.coerce.number().positive().optional(),
  discountAmount: z.coerce.number().min(0).default(0),
  discountPercent: z.coerce.number().min(0).max(100).optional(),
  taxRate: z.coerce.number().refine((val) => [0, 5, 12, 18, 28].includes(val), {
    message: 'GST rate must be 0%, 5%, 12%, 18%, or 28%'
  }),
  hsnCode: z.string().optional()
});

export const createQuotationSchema = z.object({
  quotationNumber: z.string().optional(),
  customerId: z.string().optional().nullable(),
  customerName: z.string().min(1, 'Customer name is required'),
  customerMobile: z.string().optional().nullable(),
  customerGstin: z.string().optional().nullable(),
  vehicleDetails: z.string().optional().nullable(),
  validDays: z.coerce.number().int().min(1).default(15),
  validUntil: z.string().optional(),
  isInterstate: z.boolean().default(false),
  fittingCharges: z.coerce.number().min(0).default(0),
  discountTotal: z.coerce.number().min(0).default(0),
  remarks: z.string().max(500).optional().nullable(),
  termsConditions: z.string().max(1000).optional().nullable(),
  status: z.nativeEnum(RecordStatus).default(RecordStatus.PENDING),
  items: z.array(quotationItemInputSchema).min(1, 'Quotation must have at least one line item')
});

export const updateQuotationSchema = createQuotationSchema.partial();

export const quotationSearchQuerySchema = z.object({
  customerId: z.string().optional(),
  status: z.nativeEnum(RecordStatus).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(30)
});

export const convertQuotationToInvoiceSchema = z.object({
  quotationId: z.string().min(1, 'Quotation ID is required'),
  paymentMode: z.enum(['CASH', 'UPI', 'CARD', 'NEFT_RTGS', 'CHEQUE', 'CREDIT']).default('CASH'),
  paidAmount: z.coerce.number().min(0).optional(),
  paymentReference: z.string().max(100).optional().nullable()
});

export type QuotationItemInput = z.input<typeof quotationItemInputSchema>;
export type CreateQuotationInput = z.input<typeof createQuotationSchema>;
export type UpdateQuotationInput = z.input<typeof updateQuotationSchema>;
export type QuotationSearchQueryInput = z.input<typeof quotationSearchQuerySchema>;
export type ConvertQuotationToInvoiceInput = z.input<typeof convertQuotationToInvoiceSchema>;
