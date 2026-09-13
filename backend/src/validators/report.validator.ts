import { z } from 'zod';

export const reportPeriodEnum = z.enum([
  'today',
  'yesterday',
  'this_week',
  'last_week',
  'this_month',
  'last_month',
  'this_quarter',
  'last_quarter',
  'this_fy',
  'last_fy',
  'custom'
]);

export const baseReportQuerySchema = z.object({
  period: reportPeriodEnum.default('this_month'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  branchId: z.string().uuid().optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(500).default(50),
  exportFormat: z.enum(['json', 'csv', 'excel', 'print']).optional()
});

export const salesReportQuerySchema = baseReportQuerySchema.extend({
  reportType: z.enum([
    'daily',
    'monthly',
    'customer',
    'item',
    'brand',
    'category',
    'user',
    'payment_mode',
    'gst',
    'returns'
  ]).default('daily'),
  customerId: z.string().uuid().optional(),
  itemId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  paymentMode: z.string().optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional()
});

export const purchaseReportQuerySchema = baseReportQuerySchema.extend({
  reportType: z.enum([
    'daily',
    'monthly',
    'supplier',
    'item',
    'brand',
    'category',
    'returns',
    'gst',
    'payments'
  ]).default('daily'),
  supplierId: z.string().uuid().optional(),
  itemId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional()
});

export const inventoryReportQuerySchema = baseReportQuerySchema.extend({
  reportType: z.enum([
    'current_stock',
    'valuation',
    'movement',
    'fast_moving',
    'slow_moving',
    'dead_stock',
    'low_stock',
    'out_of_stock',
    'negative_stock',
    'adjustments'
  ]).default('current_stock'),
  brandId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  inactivityDays: z.number().int().min(1).default(60),
  velocityThreshold: z.number().int().min(1).default(10)
});

export const profitabilityReportQuerySchema = baseReportQuerySchema.extend({
  groupBy: z.enum(['item', 'brand', 'category', 'customer', 'user', 'invoice', 'trend']).default('item'),
  itemId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  userId: z.string().uuid().optional()
});

export const financialReportQuerySchema = baseReportQuerySchema.extend({
  reportType: z.enum([
    'day_book',
    'cash_book',
    'bank_book',
    'receivables',
    'payables',
    'trial_balance',
    'trading_account',
    'profit_and_loss',
    'balance_sheet'
  ]).default('day_book'),
  bankAccountId: z.string().uuid().optional(),
  includeReversed: z.boolean().default(false)
});

export const businessInsightsQuerySchema = z.object({
  branchId: z.string().uuid().optional(),
  days: z.number().int().min(7).max(365).default(30)
});

export type BaseReportQueryDto = z.infer<typeof baseReportQuerySchema>;
export type SalesReportQueryDto = z.infer<typeof salesReportQuerySchema>;
export type PurchaseReportQueryDto = z.infer<typeof purchaseReportQuerySchema>;
export type InventoryReportQueryDto = z.infer<typeof inventoryReportQuerySchema>;
export type ProfitabilityReportQueryDto = z.infer<typeof profitabilityReportQuerySchema>;
export type FinancialReportQueryDto = z.infer<typeof financialReportQuerySchema>;
export type BusinessInsightsQueryDto = z.infer<typeof businessInsightsQuerySchema>;
