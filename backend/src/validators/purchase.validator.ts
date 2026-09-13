import { z } from 'zod';
import { PaymentMode, RecordStatus } from '@prisma/client';

export const purchaseItemInputSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  partNumber: z.string().optional(),
  name: z.string().optional(),
  quantity: z.coerce.number().positive('Quantity must be greater than zero'),
  unitPrice: z.coerce.number().positive('Purchase rate must be greater than zero'),
  discountAmount: z.coerce.number().min(0).default(0),
  taxRate: z.coerce.number().refine((val) => [0, 5, 12, 18, 28].includes(val), {
    message: 'GST rate must be 0%, 5%, 12%, 18%, or 28%'
  }),
  hsnCode: z.string().optional()
});

export const createPurchaseSchema = z.object({
  poNumber: z.string().optional(),
  supplierInvoiceNo: z.string().max(100).optional().nullable(),
  supplierId: z.string().min(1, 'Supplier is required'),
  branchId: z.string().optional(),
  invoiceDate: z.string().optional(),
  dueDate: z.string().optional().nullable(),
  isInterstate: z.boolean().default(false),
  isNonItemized: z.boolean().default(false),
  expenseCategory: z.string().max(100).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  
  // Items (Required for itemized purchase, optional for non-itemized expense purchase)
  items: z.array(purchaseItemInputSchema).optional().default([]),
  
  // Non-itemized direct amounts
  taxableAmount: z.coerce.number().min(0).optional(),
  taxRate: z.coerce.number().optional(),

  // Payment
  paymentMode: z.nativeEnum(PaymentMode).default(PaymentMode.CREDIT),
  paidAmount: z.coerce.number().min(0).default(0),
  paymentReference: z.string().max(100).optional().nullable(),
  bankAccountId: z.string().optional().nullable()
});

export const purchaseReturnItemInputSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  quantity: z.coerce.number().positive('Return quantity must be greater than zero'),
  unitPrice: z.coerce.number().positive('Unit price must be greater than zero'),
  defectNote: z.string().max(255).optional().nullable()
});

export const createPurchaseReturnSchema = z.object({
  purchaseId: z.string().min(1, 'Original Purchase ID is required'),
  debitNoteNumber: z.string().optional(),
  returnDate: z.string().optional(),
  reason: z.string().min(2, 'Return reason is required').max(255),
  items: z.array(purchaseReturnItemInputSchema).min(1, 'At least one item must be returned')
});

export const purchaseSearchQuerySchema = z.object({
  supplierId: z.string().optional(),
  branchId: z.string().optional(),
  status: z.nativeEnum(RecordStatus).optional(),
  paymentStatus: z.enum(['ALL', 'PAID', 'PARTIAL', 'UNPAID']).default('ALL'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(30)
});

export type PurchaseItemInput = z.infer<typeof purchaseItemInputSchema>;
export type CreatePurchaseInput = z.infer<typeof createPurchaseSchema>;
export type PurchaseReturnItemInput = z.infer<typeof purchaseReturnItemInputSchema>;
export type CreatePurchaseReturnInput = z.infer<typeof createPurchaseReturnSchema>;
export type PurchaseSearchQueryInput = z.infer<typeof purchaseSearchQuerySchema>;
