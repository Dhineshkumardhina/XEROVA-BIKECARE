import { z } from 'zod';
import { PaymentMode } from '@prisma/client';

export const createReceiptSchema = z.object({
  customerId: z.string().uuid({ message: 'Valid customer UUID required' }),
  receiptNo: z.string().optional(),
  amount: z.number().positive({ message: 'Receipt amount must be strictly greater than 0' }),
  paymentMode: z.nativeEnum(PaymentMode, { errorMap: () => ({ message: 'Invalid payment mode' }) }),
  referenceNo: z.string().optional(),
  date: z.string().or(z.date()).optional(),
  remarks: z.string().optional(),
  invoiceAllocations: z.array(
    z.object({
      invoiceId: z.string().optional(),
      invoiceNo: z.string().optional(),
      amount: z.number().positive({ message: 'Allocated amount must be positive' })
    })
  ).optional()
});

export const createPaymentSchema = z.object({
  supplierId: z.string().uuid({ message: 'Valid supplier UUID required' }),
  paymentNo: z.string().optional(),
  amount: z.number().positive({ message: 'Payment amount must be strictly greater than 0' }),
  paymentMode: z.nativeEnum(PaymentMode, { errorMap: () => ({ message: 'Invalid payment mode' }) }),
  referenceNo: z.string().optional(),
  date: z.string().or(z.date()).optional(),
  remarks: z.string().optional(),
  purchaseAllocations: z.array(
    z.object({
      purchaseId: z.string().optional(),
      poNumber: z.string().optional(),
      amount: z.number().positive({ message: 'Allocated amount must be positive' })
    })
  ).optional()
});

export const reverseVoucherSchema = z.object({
  voucherId: z.string().uuid({ message: 'Valid voucher UUID required' }),
  reason: z.string().min(3, { message: 'Reversal reason required (minimum 3 characters)' })
});

export const searchLedgerSchema = z.object({
  partyId: z.string().uuid().optional(),
  partyType: z.enum(['CUSTOMER', 'SUPPLIER']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  q: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(30)
});

export const createDepositSchema = z.object({
  cashAccountId: z.string().optional(),
  bankAccountId: z.string().optional(),
  amount: z.number().positive({ message: 'Deposit amount must be strictly greater than 0' }),
  date: z.string().or(z.date()).optional(),
  reference: z.string().min(1, { message: 'Reference number / slip ID required' }),
  remarks: z.string().optional()
});

export const createWithdrawalSchema = z.object({
  bankAccountId: z.string().optional(),
  cashAccountId: z.string().optional(),
  amount: z.number().positive({ message: 'Withdrawal amount must be strictly greater than 0' }),
  date: z.string().or(z.date()).optional(),
  reference: z.string().min(1, { message: 'Reference / cheque number required' }),
  remarks: z.string().optional()
});

export const createTransferSchema = z.object({
  fromAccountId: z.string().min(1, { message: 'Source account required' }),
  toAccountId: z.string().min(1, { message: 'Destination account required' }),
  amount: z.number().positive({ message: 'Transfer amount must be strictly greater than 0' }),
  date: z.string().or(z.date()).optional(),
  reference: z.string().min(1, { message: 'Reference number / UTR required' }),
  remarks: z.string().optional()
}).refine(data => data.fromAccountId !== data.toAccountId, {
  message: 'Source and destination accounts must be different',
  path: ['toAccountId']
});

export const reconcileTransactionSchema = z.object({
  transactionId: z.string().min(1, { message: 'Transaction ID required' }),
  reconciled: z.boolean(),
  notes: z.string().optional()
});

export type CreateReceiptInput = z.infer<typeof createReceiptSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type ReverseVoucherInput = z.infer<typeof reverseVoucherSchema>;
export type SearchLedgerQueryInput = z.infer<typeof searchLedgerSchema>;
export type CreateDepositInput = z.infer<typeof createDepositSchema>;
export type CreateWithdrawalInput = z.infer<typeof createWithdrawalSchema>;
export type CreateTransferInput = z.infer<typeof createTransferSchema>;
export type ReconcileTransactionInput = z.infer<typeof reconcileTransactionSchema>;

