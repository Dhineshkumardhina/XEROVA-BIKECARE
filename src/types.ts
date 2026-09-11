export interface SparePart {
  id: string;
  sku: string; // Part Number (e.g. 1302 or SKU-1302)
  partNumber?: string;
  barcode: string;
  name: string;
  combinationName?: string;
  shortName?: string;
  brand: string;
  oemCode: string;
  category: string;
  subcategory?: string;
  vehicles: string[];
  hsn: string;
  rackBin: string;
  purchasePrice: number;
  wholesalePrice: number;
  mrp: number;
  counterPrice: number; // Selling Rate
  currentStock: number;
  openingStock?: number;
  minimumStock?: number;
  minReorder: number; // Reorder Level
  unit: string;
  gstRate: number;
  status: 'Normal' | 'Low Stock' | 'Out of Stock' | 'Surplus';
  isActive?: boolean;
  pendingPo?: { qty: number; poNumber: string; supplier?: string };
  physicalQty: number;
  avgLandedCost: number;
  thirtyDayVelocity: number;
  customFields?: Record<string, string>;
  imageUrl?: string;
  lastModified?: { by: string; at: string };
  previousSellingRate?: number;
  isRateLocked?: boolean;
  stockMovements: StockMovement[];
  compatMatrix: {
    model: string;
    specs: string;
    fitType: '100% Direct Fit' | 'Compatible' | 'Cross-Spec';
  }[];
}

export interface VehicleHierarchyNode {
  manufacturer: 'TVS' | 'Bajaj' | 'Hero' | 'Honda' | 'Yamaha' | 'Suzuki' | 'Royal Enfield' | 'KTM';
  models: {
    name: string;
    variants: {
      name: string;
      years?: string;
      compatiblePartIds: string[];
    }[];
  }[];
}

export type StockAdjustmentReason = 'Damaged' | 'Lost' | 'Physical Count' | 'Correction' | 'Other';

export interface StockMovement {
  date: string;
  ref: string;
  type:
    | 'POS Out'
    | 'B2B Out'
    | 'Purchase'
    | 'GRN In'
    | 'Adjustment'
    | 'Stock Adjust'
    | 'Stock In (Return)'
    | 'Sales Return'
    | 'Purchase Return'
    | 'Initial Stock';
  qty: number;
  balance: number;
  userOrParty: string;
  rate?: number;
}

export interface StockAdjustmentRecord {
  id: string;
  partId: string;
  partName: string;
  sku: string;
  previousStock: number;
  adjustmentQty: number;
  newStock: number;
  reason: StockAdjustmentReason;
  notes?: string;
  adjustedBy: string;
  date: string;
}

export interface StockReportRow {
  partId: string;
  partNumber: string;
  name: string;
  brand: string;
  category: string;
  openingStock: number;
  purchases: number;
  sales: number;
  salesReturn: number;
  purchaseReturn: number;
  adjustment: number;
  currentStock: number;
  stockValue: number;
  status: string;
}

export interface CustomerVehicle {
  id: string;
  regNo: string;
  model: string;
  chassisNo?: string;
}

export interface CustomerAccount {
  id: string;
  name: string;
  phone: string;
  gstin?: string;
  address?: string;
  balance: number;
  creditLimit: number;
  tier: 'Retail' | 'Garage Regular' | 'Wholesale';
  vehicles: CustomerVehicle[];
  rateTier: 'MRP' | 'Wholesale' | 'Special';
  lastSaleRateMap?: Record<string, number>; // partId -> last agreed rate
}

export interface CartLineItem {
  id: string; // unique cart item id
  part: SparePart;
  qty: number;
  rate: number;
  customRateApplied?: boolean;
  rateLocked?: boolean;
  discount: number;
  discountType: 'flat' | 'percent';
  selectedVehicle?: string;
}

export interface AdditionalCharges {
  fitting: number;
  freight: number;
  other: number;
  otherNote: string;
}

export interface PaymentSplit {
  mode: 'Cash' | 'UPI (GPay)' | 'Credit Ledger' | 'Card POS' | 'Cheque' | 'NEFT Bank';
  amount: number;
  refNo?: string;
  notes?: string;
}

export interface HeldBill {
  id: string; // e.g. #H001
  heldAt: string;
  customerName: string;
  customerPhone?: string;
  vehicleNo?: string;
  bikeModel?: string;
  items: CartLineItem[];
  totalAmount: number;
  charges: AdditionalCharges;
  billDiscount: number;
  billDiscountType: 'flat' | 'percent';
  customerType: 'B2C' | 'B2B';
  garageId?: string;
  garageAccountId?: string;
  gstin?: string;
}

export interface SalesReturnItem {
  partId: string;
  sku: string;
  name: string;
  originalQty: number;
  soldRate: number;
  returnQty: number;
  gstRate: number;
  refundAmount: number;
}

export interface InvoiceLineItem {
  partId: string;
  sku: string;
  name: string;
  hsn: string;
  qty: number;
  rate: number;
  discount: number;
  taxableAmount: number;
  gstRate: number;
  total: number;
  vehicle?: string;
}

export interface Invoice {
  id: string;
  customerName: string;
  customerPhone?: string;
  vehicleNo?: string;
  bikeModel?: string;
  isGarage?: boolean;
  garageAccountId?: string;
  gstin?: string;
  customerAddress?: string;
  itemsCount: number;
  itemsSummary?: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  itemDiscountTotal?: number;
  billDiscount?: number;
  billDiscountTotal?: number;
  additionalCharges?: AdditionalCharges;
  additionalChargesTotal?: number;
  taxableAmount?: number;
  cgst: number;
  sgst: number;
  igst?: number;
  roundOff?: number;
  totalAmount: number;
  payMode: 'Cash' | 'UPI (GPay)' | 'Credit Ledger' | 'NEFT Bank' | 'Card POS' | 'Split Payment' | 'Cheque';
  paymentSplits?: PaymentSplit[];
  taxType: 'B2C' | 'B2B' | 'B2B (GST)' | 'INTERSTATE' | 'REGULAR';
  status: 'PAID' | 'CREDIT 15D' | 'PENDING' | 'UNPAID';
  operator: string;
  createdAt: string;
  isQuotation?: boolean;
  address?: string;
  cashTendered?: number;
  cashChange?: number;
}

export interface TopMovingSpare {
  rank: number;
  name: string;
  category: string;
  tag: string;
  units: number;
  revenue: number;
}

export interface HourlySalesPoint {
  timeLabel: string;
  sales: number;
  bills: number;
  isPeak?: boolean;
  peakLabel?: string;
}

export interface TenderReconciliationData {
  cashInDrawer: number;
  upiCollections: number;
  cardPosTerminal: number;
  directNeftBank: number;
  totalRealized: number;
  shiftStatus: string;
}

export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'manager'
  | 'billing_operator'
  | 'purchase_operator'
  | 'accounts_operator'
  | 'inventory_operator'
  | 'viewer'
  | 'store_admin';

export interface ReceiptVoucher {
  id: string;
  receiptNo: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  invoiceRef?: string;
  amount: number;
  paymentMode: 'Cash' | 'UPI' | 'Bank' | 'Cheque';
  refNo?: string;
  date: string;
  time: string;
  createdBy: string;
  remarks?: string;
  status: 'Active' | 'Void' | 'Reversed';
  previousBalance: number;
  newBalance: number;
  allocation?: { invoiceNo: string; amount: number }[];
  voidReason?: string;
  voidedAt?: string;
  voidedBy?: string;
}

export interface PaymentVoucher {
  id: string;
  paymentNo: string;
  supplierId: string;
  supplierName: string;
  reference?: string;
  amount: number;
  paymentMode: 'Cash' | 'Bank' | 'UPI' | 'Cheque';
  refNo?: string;
  date: string;
  time: string;
  createdBy: string;
  approvedBy?: string;
  remarks?: string;
  status: 'Active' | 'Void' | 'Reversed';
  previousPayable: number;
  remainingPayable: number;
  allocation?: { billNo: string; amount: number }[];
  voidReason?: string;
  voidedAt?: string;
  voidedBy?: string;
}

export interface CustomerLedgerEntry {
  id: string;
  date: string;
  particular: string;
  invoice?: string;
  receiptNo?: string;
  debit: number;
  credit: number;
  balance: number;
  type: 'Opening' | 'Sales' | 'Receipt' | 'Return' | 'Adjustment' | 'Contra';
  createdBy: string;
  remarks?: string;
  status?: 'Active' | 'Void' | 'Reversed';
}

export interface SupplierLedgerEntry {
  id: string;
  date: string;
  particular: string;
  purchase?: string;
  paymentNo?: string;
  debit: number;
  credit: number;
  balance: number;
  type: 'Opening' | 'Purchase' | 'Payment' | 'Return' | 'Adjustment' | 'Contra';
  createdBy: string;
  remarks?: string;
  status?: 'Active' | 'Void' | 'Reversed';
}

export interface ReceivableRecord {
  id: string;
  customerId: string;
  customerName: string;
  mobile: string;
  invoicesCount: number;
  totalSales: number;
  received: number;
  outstanding: number;
  lastPaymentDate: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  ageing: {
    current: number;
    d1_30: number;
    d31_60: number;
    d61_90: number;
    d90Plus: number;
  };
}

export interface PayableRecord {
  id: string;
  supplierId: string;
  supplierName: string;
  purchasesCount: number;
  totalPurchase: number;
  paid: number;
  outstanding: number;
  lastPaymentDate: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
}

export interface BankTransaction {
  id: string;
  date: string;
  time: string;
  reference: string;
  description: string;
  account: 'Cash' | 'Bank' | 'UPI';
  type: 'Deposit' | 'Withdrawal' | 'Transfer' | 'Receipt' | 'Payment' | 'Charge';
  debit: number;
  credit: number;
  balance: number;
  status: 'Reconciled' | 'Pending' | 'Void';
}

export interface BankingAccount {
  id: string;
  name: string;
  type: 'Cash' | 'Bank' | 'UPI';
  accountNumber?: string;
  bankName?: string;
  balance: number;
}

export interface FinancialTimelineItem {
  id: string;
  time: string;
  date: string;
  type: 'Receipt' | 'Payment' | 'Invoice' | 'Contra';
  voucherNo: string;
  party: string;
  amount: number;
  mode?: string;
  description: string;
}

export interface OutstandingInvoiceItem {
  id: string;
  invoiceNo: string;
  date: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  allocatedAmount: number;
}

// ==========================================
// GST MODULE TYPES
// ==========================================
export type GstPeriod = 'current_month' | 'previous_month' | 'quarter' | 'financial_year' | 'custom';

export type Gstr1Section = 'b2b' | 'b2cl' | 'b2cs' | 'cdnr' | 'exp' | 'nil_exempt' | 'hsn';

export interface Gstr1Record {
  id: string;
  section: Gstr1Section;
  invoiceNumber: string;
  invoiceDate: string;
  customer: string;
  gstin: string;
  pos: string; // Place of Supply (e.g., '33-Tamil Nadu')
  reverseCharge: boolean;
  taxableValue: number;
  rate: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalInvoiceValue: number;
  filingStatus: 'Ready' | 'Filed' | 'Warning' | 'Error';
  validationIssue?: 'Missing GSTIN' | 'Invalid GST Rate' | 'Tax Mismatch' | 'Duplicate Invoice' | 'None';
  excluded?: boolean;
  itemSummary?: string;
}

export interface Gstr1ValidationSummary {
  validRecords: number;
  warnings: number;
  errors: number;
  missingGstin: number;
  invalidGstRate: number;
  taxMismatch: number;
  duplicateInvoice: number;
}

export interface Gstr3bSupplyItem {
  id: string;
  nature: string;
  code: string;
  taxableValue: number;
  igst: number;
  cgst: number;
  sgst: number;
  cess: number;
}

export interface Gstr3bItcItem {
  id: string;
  details: string;
  code: string;
  igst: number;
  cgst: number;
  sgst: number;
  cess: number;
}

export interface HsnTaxRecord {
  id: string;
  hsn: string;
  itemName: string;
  description?: string;
  uqc: string;
  quantity: number;
  taxableValue: number;
  gstRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
}

// ==========================================
// REPORTS MODULE TYPES
// ==========================================
export interface SalesReportRow {
  id: string;
  date: string;
  invoiceNo: string;
  customer: string;
  customerType: 'B2B Garage' | 'B2C Retail' | 'Mechanic';
  itemSummary: string;
  category: string;
  brand: string;
  qty: number;
  salesperson: string;
  payMode: 'Cash' | 'UPI' | 'Card' | 'Credit Ledger' | 'Split';
  grossSales: number;
  discount: number;
  returnAmount: number;
  netSales: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalGst: number;
  totalAmount: number;
  creditOutstanding?: number;
  status: 'PAID' | 'CREDIT' | 'PARTIAL' | 'RETURNED';
}

export interface PurchaseReportRow {
  id: string;
  date: string;
  poNo: string;
  supplierInvoiceNo: string;
  supplier: string;
  supplierGstin: string;
  itemSummary: string;
  category: string;
  brand: string;
  qty: number;
  taxableValue: number;
  tax: number;
  netPurchase: number;
  paid: number;
  outstanding: number;
  payMode: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
}

export interface InventoryReportRow {
  id: string;
  sku: string;
  name: string;
  oemCode?: string;
  brand: string;
  category: string;
  rackBin: string;
  quantity: number;
  unit: string;
  purchaseRate: number;
  sellingRate: number;
  mrp: number;
  stockValue: number;
  reorderLevel: number;
  movementStatus: 'Fast Moving' | 'Slow Moving' | 'Dead Stock' | 'Normal' | 'Low Stock' | 'Out of Stock' | 'Negative Stock';
  daysInStock: number;
  lastSoldDate: string;
  adjustmentQty?: number;
  adjustmentReason?: string;
}

export interface ProfitabilityRow {
  id: string;
  itemOrInvoice: string;
  sku?: string;
  category: string;
  brand: string;
  customerOrParty?: string;
  user?: string;
  date?: string;
  qtySold: number;
  grossSales: number;
  discounts: number;
  netSales: number;
  cogs: number; // Cost of goods sold
  grossProfit: number;
  grossMarginPct: number;
  additionalCharges?: number;
  returnImpact?: number;
}

export interface FinancialReportRow {
  id: string;
  date: string;
  voucherType: 'Sales' | 'Purchase' | 'Receipt' | 'Payment' | 'Contra' | 'Journal' | 'Adjustment';
  voucherNo: string;
  particulars: string;
  account: string;
  debit: number;
  credit: number;
  balance?: number;
  refNo?: string;
  notes?: string;
}

export interface BusinessInsightItem {
  id: string;
  type: 'positive' | 'warning' | 'alert' | 'info';
  category: 'Sales' | 'Inventory' | 'Pricing' | 'Customers' | 'Receivables' | 'Tax';
  title: string;
  metric: string;
  change: string;
  description: string;
  actionLabel: string;
  actionScreen: string;
}

export interface ReportDetailData {
  id: string;
  type: 'Sale' | 'Purchase' | 'GST' | 'Stock' | 'Financial';
  title: string;
  referenceNo: string;
  date: string;
  partyName: string;
  partyGstin?: string;
  partyPhone?: string;
  paymentMode?: string;
  status: string;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
  user: string;
  timestamp: string;
  items: {
    name: string;
    sku: string;
    hsn: string;
    qty: number;
    unitPrice: number;
    gstRate: number;
    total: number;
  }[];
  auditHistory: {
    timestamp: string;
    action: string;
    user: string;
  }[];
  notes?: string;
}

// ==========================================
// ADMINISTRATION & SECURITY TYPES
// ==========================================

export interface ERPUser {
  id: string;
  fullName: string;
  username: string;
  mobile: string;
  email: string;
  role: UserRole;
  roleDisplayName: string;
  branch: string;
  status: 'Active' | 'Inactive' | 'DISABLED' | 'ACTIVE';
  lastLogin: string;
  createdDate: string;
}

export type ErpUser = ERPUser;

export interface RolePermission {
  role: UserRole;
  roleDisplayName: string;
  description: string;
  permissions: Record<PermissionKey, boolean>;
}

export type PermissionKey =
  // SALES
  | 'sales_create_invoice'
  | 'sales_edit_invoice'
  | 'sales_cancel_invoice'
  | 'sales_delete_void_invoice'
  | 'sales_change_selling_rate'
  | 'sales_apply_discount'
  | 'sales_view_profit'
  | 'sales_print_invoice'
  // PURCHASE
  | 'purchase_create_purchase'
  | 'purchase_edit_purchase'
  | 'purchase_cancel_purchase'
  | 'purchase_change_purchase_rate'
  | 'purchase_view_supplier_cost'
  // INVENTORY
  | 'inventory_create_item'
  | 'inventory_edit_item'
  | 'inventory_adjust_stock'
  | 'inventory_view_stock'
  | 'inventory_export_items'
  | 'inventory_print_barcodes'
  // ACCOUNTS
  | 'accounts_create_receipt'
  | 'accounts_create_payment'
  | 'accounts_edit_receipt'
  | 'accounts_cancel_receipt'
  | 'accounts_view_ledger'
  | 'accounts_view_financial_reports'
  // GST
  | 'gst_view_gst'
  | 'gst_edit_gst'
  | 'gst_export_gst'
  | 'gst_prepare_gstr1'
  | 'gst_prepare_gstr3b'
  // REPORTS
  | 'reports_sales_reports'
  | 'reports_purchase_reports'
  | 'reports_stock_reports'
  | 'reports_profit_reports'
  | 'reports_financial_reports'
  // ADMIN
  | 'admin_manage_users'
  | 'admin_manage_roles'
  | 'admin_company_settings'
  | 'admin_backup'
  | 'admin_restore'
  | 'admin_audit_logs';

export interface PermissionCategoryGroup {
  category: string;
  categoryLabel: string;
  permissions: {
    key: PermissionKey;
    label: string;
    description: string;
  }[];
}

export interface CompanyProfile {
  firmName: string;
  companyName?: string;
  tagline: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  phone: string;
  altPhone: string;
  email: string;
  website: string;
  gstin: string;
  pan: string;
  logoUrl: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifsc: string;
  bankBranch: string;
  invoicePrefix: string;
  startingNumber: number;
  financialYear: string;
  termsAndConditions: string;
  footerText: string;
}

export interface BranchRecord {
  id: string;
  name: string;
  branchName?: string;
  code: string;
  branchCode?: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  contactPhone: string;
  contactEmail: string;
  gstin: string;
  manager: string;
  status: 'Active' | 'Inactive';
  isMain?: boolean;
}

export type BranchLocation = BranchRecord;

export interface DocumentNumberingConfig {
  id: string;
  docType:
    | 'Sales Invoice'
    | 'Purchase Invoice'
    | 'Quotation'
    | 'Sales Return'
    | 'Purchase Return'
    | 'Receipt'
    | 'Payment'
    | 'Stock Adjustment';
  prefix: string;
  startingNumber: number;
  currentNumber: number;
  financialYear: string;
  separator: string;
  padding: number;
}

export type NumberingConfig = DocumentNumberingConfig;

export interface TaxRateConfig {
  id: string;
  slabName: string;
  rate: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  appliesToHsns: string[];
  description: string;
  isDefault?: boolean;
}

export interface PaymentModeConfig {
  id: string;
  name: string;
  displayName: string;
  isEnabled: boolean;
  isReferenceRequired: boolean;
  mappedAccount: string;
  icon: string;
  description: string;
}

export interface InvoiceTemplateConfig {
  id: string;
  name: string;
  format: 'A4' | 'A5' | 'Thermal' | '4-in-1';
  showLogo: boolean;
  showHeader: boolean;
  showCustomerDetails: boolean;
  showVehicleNumber: boolean;
  showItemTable: boolean;
  showGstColumns: boolean;
  showBankDetails: boolean;
  showTerms: boolean;
  showFooter: boolean;
  headerTitle: string;
  paperSizeLabel: string;
  // Visual template customizer properties
  activeFormat?: string;
  templateType?: string;
  primaryColor?: string;
  fontStyle?: string;
  termsText?: string;
}

export interface PrinterConfig {
  defaultPrinter: string;
  a4Printer: string;
  thermalPrinter: string;
  paperSize: 'A4' | 'A5' | '3-inch (80mm)' | '2-inch (58mm)';
  copies: number;
  autoPrint: boolean;
  autoPrintOnSave?: boolean;
  invoiceFormat: 'A4' | 'A5' | 'Thermal' | '4-in-1';
  printCutPaper: boolean;
  openCashDrawer: boolean;
}

export interface BackupRecord {
  id: string;
  filename: string;
  fileName?: string;
  date: string;
  time: string;
  size: string;
  fileSize?: string;
  createdBy: string;
  status: 'Success' | 'Failed' | 'In Progress' | 'Completed';
  type: 'Manual' | 'Scheduled' | 'Pre-Update';
  location: string;
  storageLocation?: string;
  recordsCount?: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  username?: string;
  userRole?: UserRole;
  action: string;
  module: 'Sales' | 'Purchase' | 'Inventory' | 'Accounts' | 'GST' | 'Admin' | 'Security' | 'Reports' | 'Settings' | 'Branches' | 'Hardware' | 'System';
  record: string;
  recordId?: string;
  previousValue?: string;
  newValue?: string;
  ipDevice: string;
  ipAddress?: string;
  details?: string;
  status: 'Success' | 'Warning' | 'Failed' | 'Denied' | 'Error';
}

export interface UserActivityItem {
  id: string;
  timestamp: string;
  user: string;
  username?: string;
  userRole?: UserRole;
  action: string;
  activityType?: string;
  relatedRecord: string;
  device: string;
  details?: string;
}

export interface SecuritySettingsConfig {
  sessionTimeoutMinutes: number;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireNumber: boolean;
    requireSpecialChar: boolean;
    expiryDays: number;
  };
  loginAttemptLimit: number;
  requirePasswordChange: boolean;
  allowMultipleSessions: boolean;
  autoLogout: boolean;
  auditLoggingEnabled: boolean;
  passwordMinLength?: number;
  passwordExpiryDays?: number;
  passwordRequireUppercase?: boolean;
  passwordRequireNumber?: boolean;
  passwordRequireSpecial?: boolean;
  requirePasswordChangeOnFirstLogin?: boolean;
  maxLoginAttempts?: number;
  autoLogoutOnIdle?: boolean;
}

export interface SystemStatusItem {
  name: string;
  component: 'Database' | 'Application' | 'Backup' | 'Printer' | 'Network' | 'Authentication';
  status: 'Connected' | 'Warning' | 'Offline' | 'Error';
  details: string;
  lastChecked: string;
}
