import { z } from 'zod';

// ==============================================================================
// COMPANY SETTINGS VALIDATOR
// ==============================================================================
export const updateCompanySettingsSchema = z.object({
  firmName: z.string().min(2, 'Firm name must be at least 2 characters').max(150),
  legalName: z.string().max(150).optional(),
  tagline: z.string().max(200).optional().default(''),
  address: z.string().min(5, 'Address must be at least 5 characters').max(300),
  addressLine2: z.string().max(200).optional(),
  city: z.string().min(2, 'City is required').max(100),
  state: z.string().min(2, 'State is required').max(100),
  pinCode: z.string().regex(/^\d{6}$/, 'PIN code must be a 6-digit number'),
  stateCode: z.string().regex(/^\d{2}$/, 'GST State code must be a 2-digit number').optional().default('33'),
  phone: z.string().min(8, 'Phone number must be at least 8 digits').max(20),
  altPhone: z.string().max(20).optional().default(''),
  email: z.string().email('Invalid email address'),
  website: z.string().url('Invalid website URL').or(z.literal('')).optional().default(''),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format (e.g. 33AABCU9603R1ZM)').or(z.literal('')).optional().default(''),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (e.g. AABCU9603R)').or(z.literal('')).optional().default(''),
  logoUrl: z.string().optional().default(''),
  
  // Banking details
  bankName: z.string().max(100).optional().default(''),
  accountName: z.string().max(150).optional().default(''),
  accountNumber: z.string().max(50).optional().default(''),
  ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code').or(z.literal('')).optional().default(''),
  bankBranch: z.string().max(100).optional().default(''),
  
  // Document terms & financial year
  financialYear: z.string().regex(/^\d{4}-\d{2,4}$/, 'Invalid Financial Year format (e.g. 2026-27)').optional().default('2026-27'),
  termsAndConditions: z.string().optional().default('1. Goods once sold will not be taken back without original bill.\n2. Warranty as per manufacturer terms.\n3. Subject to local jurisdiction.'),
  footerText: z.string().optional().default('Thank you for your business! Ride Safe.')
});

// ==============================================================================
// BRANCH MANAGEMENT VALIDATORS
// ==============================================================================
export const createBranchSchema = z.object({
  name: z.string().min(2, 'Branch name is required').max(100),
  code: z.string().min(2, 'Branch code is required').max(20).toUpperCase(),
  address: z.string().min(5, 'Address is required').max(300),
  city: z.string().min(2, 'City is required').max(100),
  state: z.string().min(2, 'State is required').max(100),
  pinCode: z.string().regex(/^\d{6}$/, 'PIN code must be a 6-digit number'),
  contactPhone: z.string().min(8, 'Contact phone is required').max(20),
  contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN').optional().or(z.literal('')),
  manager: z.string().min(2, 'Manager name is required').max(100),
  status: z.enum(['Active', 'Inactive']).default('Active'),
  isMain: z.boolean().default(false)
});

export const updateBranchSchema = createBranchSchema.partial();

// ==============================================================================
// DOCUMENT NUMBERING CONFIG VALIDATOR
// ==============================================================================
export const documentNumberingSchema = z.object({
  docType: z.enum([
    'Sales Invoice',
    'Purchase Invoice',
    'Quotation',
    'Sales Return',
    'Purchase Return',
    'Receipt',
    'Payment',
    'Stock Adjustment'
  ]),
  prefix: z.string().min(1, 'Prefix is required').max(30),
  startingNumber: z.number().int().min(1).default(1),
  currentNumber: z.number().int().min(0).default(0),
  financialYear: z.string().max(20).default('2026-27'),
  separator: z.string().max(5).default('/'),
  padding: z.number().int().min(1).max(10).default(6)
});

export const bulkUpdateNumberingSchema = z.array(documentNumberingSchema);

// ==============================================================================
// INVOICE TEMPLATE CONFIG VALIDATOR
// ==============================================================================
export const invoiceTemplateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Template name is required').max(100),
  format: z.enum(['A4', 'A5', 'Thermal', '4-in-1']),
  showLogo: z.boolean().default(true),
  showHeader: z.boolean().default(true),
  showCustomerDetails: z.boolean().default(true),
  showVehicleNumber: z.boolean().default(true),
  showItemTable: z.boolean().default(true),
  showGstColumns: z.boolean().default(true),
  showBankDetails: z.boolean().default(true),
  showTerms: z.boolean().default(true),
  showFooter: z.boolean().default(true),
  headerTitle: z.string().default('TAX INVOICE'),
  paperSizeLabel: z.string().default('A4 (210 x 297 mm)'),
  termsText: z.string().optional(),
  primaryColor: z.string().default('#0f766e'),
  fontStyle: z.string().default('Inter, sans-serif'),
  isDefault: z.boolean().default(false)
});

// ==============================================================================
// PRINTER SETTINGS VALIDATOR
// ==============================================================================
export const printerSettingsSchema = z.object({
  defaultPrinter: z.string().min(1, 'Default printer is required').max(100),
  a4Printer: z.string().max(100).default(''),
  thermalPrinter: z.string().max(100).default(''),
  paperSize: z.enum(['A4', 'A5', '3-inch (80mm)', '2-inch (58mm)']).default('A4'),
  copies: z.number().int().min(1).max(10).default(1),
  autoPrint: z.boolean().default(false),
  autoPrintOnSave: z.boolean().default(false),
  invoiceFormat: z.enum(['A4', 'A5', 'Thermal', '4-in-1']).default('A4'),
  printCutPaper: z.boolean().default(true),
  openCashDrawer: z.boolean().default(false)
});

// ==============================================================================
// SECURITY SETTINGS VALIDATOR
// ==============================================================================
export const securitySettingsSchema = z.object({
  sessionTimeoutMinutes: z.number().int().min(5).max(1440).default(30),
  passwordPolicy: z.object({
    minLength: z.number().int().min(6).max(32).default(8),
    requireUppercase: z.boolean().default(true),
    requireNumber: z.boolean().default(true),
    requireSpecialChar: z.boolean().default(true),
    expiryDays: z.number().int().min(0).max(365).default(90)
  }),
  loginAttemptLimit: z.number().int().min(3).max(10).default(5),
  requirePasswordChange: z.boolean().default(false),
  allowMultipleSessions: z.boolean().default(true),
  autoLogout: z.boolean().default(true),
  auditLoggingEnabled: z.boolean().default(true)
});

// ==============================================================================
// DANGER ZONE & RESTORE VALIDATORS
// ==============================================================================
export const restoreDatabaseSchema = z.object({
  backupId: z.string().min(1, 'Backup ID is required'),
  confirmationPhrase: z.literal('RESTORE_DATABASE_PROCEED'),
  reason: z.string().min(5, 'Reason for restoration is required')
});

export const clearTestDataSchema = z.object({
  confirmationPhrase: z.literal('CLEAR_TEST_DATA_CONFIRMED'),
  retainMasters: z.boolean().default(true),
  reason: z.string().min(5, 'Reason is required')
});

export const resetConfigSchema = z.object({
  confirmationPhrase: z.literal('RESET_CONFIGURATION_CONFIRMED'),
  targetModule: z.enum(['ALL', 'NUMBERING', 'TEMPLATES', 'PRINTER', 'SECURITY'])
});
