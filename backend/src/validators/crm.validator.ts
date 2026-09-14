import { z } from 'zod';
import { RecordStatus } from '@prisma/client';

export const customerTypeEnum = z.enum([
  'RETAIL',
  'WHOLESALE',
  'WHOLESALE_DEALER',
  'MECHANIC',
  'WORKSHOP',
  'WORKSHOP_GARAGE',
  'DEALER',
  'FLEET',
  'COMMERCIAL_FLEET'
]);

export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Customer name must be at least 2 characters'),
  mobile: z.string().min(10, 'Mobile must be at least 10 digits').max(15),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  gstin: z.string().max(15).optional().or(z.literal('')),
  pan: z.string().max(10).optional().or(z.literal('')),
  customerType: customerTypeEnum.optional().default('RETAIL'),
  type: customerTypeEnum.optional(),
  creditLimit: z.number().min(0).default(0),
  openingBalance: z.number().default(0),
  notes: z.string().optional(),
  status: z.nativeEnum(RecordStatus).default(RecordStatus.ACTIVE)
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const customerSearchSchema = z.object({
  query: z.string().optional(),
  type: customerTypeEnum.optional(),
  hasOutstanding: z.boolean().optional(),
  vehicleRegNo: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(5000).default(50)
});

export const createCustomerVehicleSchema = z.object({
  regNo: z.string().min(3, 'Registration number is required (e.g. TN-01-AB-1234)'),
  manufacturer: z.string().min(2, 'Manufacturer name is required (e.g. Bajaj, Hero)'),
  model: z.string().min(2, 'Model name is required (e.g. Pulsar 150)'),
  variant: z.string().optional(),
  year: z.number().int().min(1980).max(2035).optional(),
  chassisNo: z.string().optional(),
  engineNo: z.string().optional(),
  lastServiceKm: z.number().int().optional(),
  notes: z.string().optional()
});

export const updateCustomerVehicleSchema = createCustomerVehicleSchema.partial();

export const createMechanicSchema = z.object({
  name: z.string().min(2, 'Mechanic name is required'),
  workshopName: z.string().min(2, 'Workshop / Garage name is required'),
  mobile: z.string().min(10, 'Mobile must be at least 10 digits'),
  area: z.string().optional(),
  commissionRatePct: z.number().min(0).max(100).default(5),
  referralCode: z.string().optional(),
  status: z.nativeEnum(RecordStatus).default(RecordStatus.ACTIVE)
});

export const updateMechanicSchema = createMechanicSchema.partial();

export const loyaltyRuleSchema = z.object({
  pointsPerRupeesSpent: z.number().min(1).default(100), // e.g. 1 point for every 100 spent
  redemptionValuePerPoint: z.number().min(0.1).default(1.0), // 1 point = 1 INR
  minRedemptionPoints: z.number().int().min(1).default(50),
  maxRedemptionPct: z.number().min(1).max(100).default(30),
  expiryDays: z.number().int().min(30).default(365),
  isActive: z.boolean().default(true)
});

export const adjustLoyaltyPointsSchema = z.object({
  customerId: z.string().uuid(),
  pointsDelta: z.number().int(), // Positive to add, negative to deduct
  type: z.enum(['EARNED', 'BONUS', 'REDEEMED', 'ADJUSTMENT', 'EXPIRED']).default('ADJUSTMENT'),
  reason: z.string().min(3, 'Reason is required for manual point adjustment')
});

export const recordReferralSchema = z.object({
  mechanicId: z.string().uuid().optional(),
  referredCustomerId: z.string().uuid().optional(),
  invoiceNumber: z.string().min(1),
  saleAmount: z.number().min(0),
  rewardCash: z.number().min(0).default(0),
  rewardPoints: z.number().int().min(0).default(0),
  notes: z.string().optional()
});

export const updateReferralStatusSchema = z.object({
  status: z.enum(['PENDING', 'SUCCESSFUL', 'REWARDED', 'CANCELLED']),
  rewardCash: z.number().min(0).optional(),
  rewardPoints: z.number().int().min(0).optional(),
  notes: z.string().optional()
});

export const createMessageTemplateSchema = z.object({
  name: z.string().min(2, 'Template name is required'),
  channel: z.enum(['WHATSAPP', 'SMS']).default('WHATSAPP'),
  category: z.enum(['INVOICE', 'RECEIPT', 'REMINDER', 'LOYALTY', 'PROMOTIONAL', 'SERVICE']).default('REMINDER'),
  bodyText: z.string().min(5, 'Message body is required with placeholders like {{customer_name}}'),
  placeholders: z.array(z.string()).default([]),
  isActive: z.boolean().default(true)
});

export const sendMessageSchema = z.object({
  customerId: z.string().uuid().optional(),
  recipientMobile: z.string().min(10),
  recipientName: z.string().optional(),
  channel: z.enum(['WHATSAPP', 'SMS']).default('WHATSAPP'),
  templateId: z.string().uuid().optional(),
  messageText: z.string().min(1, 'Message text cannot be empty'),
  category: z.enum(['INVOICE', 'RECEIPT', 'REMINDER', 'LOYALTY', 'PROMOTIONAL', 'SERVICE']).default('REMINDER'),
  variables: z.record(z.string()).optional()
});

export const bulkAudienceSegmentEnum = z.enum([
  'ALL',
  'RETAIL',
  'WHOLESALE',
  'MECHANICS',
  'LOYALTY_MEMBERS',
  'OUTSTANDING_CUSTOMERS',
  'INACTIVE_CUSTOMERS',
  'HIGH_VALUE_CUSTOMERS',
  'VEHICLE_BASED'
]);

export const bulkMessageSchema = z.object({
  segment: bulkAudienceSegmentEnum,
  channel: z.enum(['WHATSAPP', 'SMS']).default('WHATSAPP'),
  templateId: z.string().uuid().optional(),
  messageText: z.string().min(1, 'Message text is required'),
  category: z.enum(['INVOICE', 'RECEIPT', 'REMINDER', 'LOYALTY', 'PROMOTIONAL', 'SERVICE']).default('PROMOTIONAL'),
  variables: z.record(z.string()).optional(),
  filters: z.object({
    minOutstanding: z.number().optional(),
    inactiveDays: z.number().optional(),
    minLifetimeSales: z.number().optional(),
    vehicleManufacturer: z.string().optional(),
    vehicleModel: z.string().optional()
  }).optional(),
  isConfirmed: z.boolean().default(false)
});

export const outstandingReminderQuerySchema = z.object({
  minOutstanding: z.number().min(0).default(1),
  minOverdueDays: z.number().int().min(0).default(0),
  customerType: customerTypeEnum.optional()
});

export type CreateCustomerDto = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerDto = z.infer<typeof updateCustomerSchema>;
export type CustomerSearchDto = z.infer<typeof customerSearchSchema>;
export type CreateCustomerVehicleDto = z.infer<typeof createCustomerVehicleSchema>;
export type UpdateCustomerVehicleDto = z.infer<typeof updateCustomerVehicleSchema>;
export type CreateMechanicDto = z.infer<typeof createMechanicSchema>;
export type UpdateMechanicDto = z.infer<typeof updateMechanicSchema>;
export type LoyaltyRuleDto = z.infer<typeof loyaltyRuleSchema>;
export type AdjustLoyaltyPointsDto = z.infer<typeof adjustLoyaltyPointsSchema>;
export type RecordReferralDto = z.infer<typeof recordReferralSchema>;
export type UpdateReferralStatusDto = z.infer<typeof updateReferralStatusSchema>;
export type CreateMessageTemplateDto = z.infer<typeof createMessageTemplateSchema>;
export type SendMessageDto = z.infer<typeof sendMessageSchema>;
export type BulkMessageDto = z.infer<typeof bulkMessageSchema>;
export type OutstandingReminderQueryDto = z.infer<typeof outstandingReminderQuerySchema>;
