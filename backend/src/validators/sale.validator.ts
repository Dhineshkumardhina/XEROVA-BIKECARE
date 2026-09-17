import { z } from 'zod';
import { PaymentMode, RecordStatus } from '@prisma/client';

export const saleItemInputSchema = z.object({
  itemId: z.string().uuid('Item ID must be a valid UUID'),
  partNumber: z.string().optional(),
  name: z.string().optional(),
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

export const splitPaymentItemSchema = z.object({
  paymentMode: z.nativeEnum(PaymentMode),
  amount: z.coerce.number().positive('Payment amount must be greater than zero'),
  referenceNo: z.string().max(100).optional().nullable()
});

export const createSaleSchema = z.object({
  invoiceNumber: z.string().optional(),
  customerId: z.string().uuid('Customer ID must be a valid UUID').optional().nullable(),
  customerName: z.string().min(1, 'Customer name is required').default('Walk-in Customer'),
  customerMobile: z.string().optional().nullable(),
  customerGstin: z.string().optional().nullable(),
  customerVehicleId: z.string().uuid('Vehicle ID must be a valid UUID').optional().nullable(),
  vehicleRegNo: z.string().optional().nullable(),
  branchId: z.string().uuid('Branch ID must be a valid UUID').optional(),
  invoiceDate: z.string().optional(),
  isInterstate: z.boolean().default(false),
  isB2B: z.boolean().default(false),
  fittingCharges: z.coerce.number().min(0).default(0),
  freightCharges: z.coerce.number().min(0).default(0),
  invoiceDiscount: z.coerce.number().min(0).default(0),
  notes: z.string().max(500).optional().nullable(),
  
  // Cart Items
  items: z.array(saleItemInputSchema).min(1, 'Cart cannot be empty'),

  // Payment
  paymentMode: z.nativeEnum(PaymentMode).default(PaymentMode.CASH),
  paidAmount: z.coerce.number().min(0).optional(),
  tenderedAmount: z.coerce.number().min(0).optional(),
  changeAmount: z.coerce.number().min(0).default(0),
  paymentReference: z.string().max(100).optional().nullable(),
  splitPayments: z.array(splitPaymentItemSchema).optional(),

  // Status (COMPLETED vs DRAFT / HOLD)
  status: z.nativeEnum(RecordStatus).default(RecordStatus.COMPLETED)
});

export const createSaleReturnSchema = z.object({
  saleId: z.string().uuid('Sale ID must be a valid UUID'),
  creditNoteNumber: z.string().optional(),
  returnDate: z.string().optional(),
  reason: z.string().min(2, 'Return reason is required').max(255),
  refundMode: z.nativeEnum(PaymentMode).default(PaymentMode.CASH),
  items: z.array(z.object({
    itemId: z.string().uuid('Item ID must be a valid UUID'),
    quantity: z.coerce.number().positive('Return quantity must be positive'),
    unitRate: z.coerce.number().positive('Unit rate must be positive'),
    isRestocked: z.boolean().default(true)
  })).min(1, 'At least one item must be returned')
});

export const saleSearchQuerySchema = z.object({
  customerId: z.string().optional(),
  branchId: z.string().optional(),
  status: z.nativeEnum(RecordStatus).optional(),
  paymentMode: z.nativeEnum(PaymentMode).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(30)
});

export type SaleItemInput = z.input<typeof saleItemInputSchema>;
export type SplitPaymentItem = z.input<typeof splitPaymentItemSchema>;
export type CreateSaleInput = z.input<typeof createSaleSchema>;
export type CreateSaleReturnInput = z.input<typeof createSaleReturnSchema>;
export type SaleSearchQueryInput = z.input<typeof saleSearchQuerySchema>;
