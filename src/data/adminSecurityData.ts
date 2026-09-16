import {
  ERPUser,
  PermissionCategoryGroup,
  PermissionKey,
  UserRole,
  CompanyProfile,
  BranchRecord,
  DocumentNumberingConfig,
  TaxRateConfig,
  PaymentModeConfig,
  InvoiceTemplateConfig,
  PrinterConfig,
  BackupRecord,
  AuditLogEntry,
  UserActivityItem,
  SecuritySettingsConfig,
  SystemStatusItem
} from '../types';

// ==========================================
// 1. USERS DATA
// ==========================================
export const INITIAL_USERS: ERPUser[] = [
  {
    id: 'usr-1',
    fullName: 'System Administrator',
    username: 'admin',
    mobile: '+91 98401 11223',
    email: 'admin@bikecare.erp',
    role: 'super_admin',
    roleDisplayName: 'Super Admin',
    branch: 'Main Branch - Chennai Central',
    status: 'Active',
    lastLogin: 'Today',
    createdDate: '01 Jan 2026'
  }
];

// ==========================================
// 2. PERMISSION DEFINITIONS & CATEGORIES
// ==========================================
export const PERMISSION_CATEGORIES: PermissionCategoryGroup[] = [
  {
    category: 'SALES',
    categoryLabel: 'Sales & POS Invoicing',
    permissions: [
      { key: 'sales_create_invoice', label: 'Create Invoice', description: 'Bill customers at POS counter and wholesale' },
      { key: 'sales_edit_invoice', label: 'Edit Invoice', description: 'Modify draft or unpaid bills' },
      { key: 'sales_cancel_invoice', label: 'Cancel Invoice', description: 'Issue credit note / sales return' },
      { key: 'sales_delete_void_invoice', label: 'Delete/Void Invoice', description: 'Irreversibly void posted invoice' },
      { key: 'sales_change_selling_rate', label: 'Change Selling Rate', description: 'Override counter price per line item' },
      { key: 'sales_apply_discount', label: 'Apply Discount', description: 'Grant mechanic or trade cash discount' },
      { key: 'sales_view_profit', label: 'View Profit', description: 'View line-item markup and gross margin' },
      { key: 'sales_print_invoice', label: 'Print Invoice', description: 'Print A4/thermal counter receipts' }
    ]
  },
  {
    category: 'PURCHASE',
    categoryLabel: 'Purchase & Vendor Procurement',
    permissions: [
      { key: 'purchase_create_purchase', label: 'Create Purchase', description: 'Record supplier GRN and invoices' },
      { key: 'purchase_edit_purchase', label: 'Edit Purchase', description: 'Modify inward purchase entries' },
      { key: 'purchase_cancel_purchase', label: 'Cancel Purchase', description: 'Issue RTV return to vendor debit note' },
      { key: 'purchase_change_purchase_rate', label: 'Change Purchase Rate', description: 'Modify supplier landed unit cost' },
      { key: 'purchase_view_supplier_cost', label: 'View Supplier Cost', description: 'View landed OEM purchase price' }
    ]
  },
  {
    category: 'INVENTORY',
    categoryLabel: 'Inventory & Warehouse Stock',
    permissions: [
      { key: 'inventory_create_item', label: 'Create Item', description: 'Register new spare part SKU and OEM code' },
      { key: 'inventory_edit_item', label: 'Edit Item', description: 'Modify rack/bin, specs and pricing' },
      { key: 'inventory_adjust_stock', label: 'Adjust Stock', description: 'Perform physical count delta correction' },
      { key: 'inventory_view_stock', label: 'View Stock', description: 'View current physical quantity and bin' },
      { key: 'inventory_export_items', label: 'Export Items', description: 'Download catalog in Excel/CSV format' },
      { key: 'inventory_print_barcodes', label: 'Print Barcodes', description: 'Print 50x25 thermal labels & A4 sheets' }
    ]
  },
  {
    category: 'ACCOUNTS',
    categoryLabel: 'Accounts, Ledgers & Banking',
    permissions: [
      { key: 'accounts_create_receipt', label: 'Create Receipt', description: 'Record customer/garage payments received' },
      { key: 'accounts_create_payment', label: 'Create Payment', description: 'Disburse supplier payments & expenses' },
      { key: 'accounts_edit_receipt', label: 'Edit Receipt', description: 'Alter payment allocation & mode' },
      { key: 'accounts_cancel_receipt', label: 'Cancel Receipt', description: 'Reverse receipt voucher' },
      { key: 'accounts_view_ledger', label: 'View Ledger', description: 'Access garage customer & supplier ledgers' },
      { key: 'accounts_view_financial_reports', label: 'View Financial Reports', description: 'Access Day Book, Trial Balance, P&L' }
    ]
  },
  {
    category: 'GST',
    categoryLabel: 'GST Filing & Tax Compliance',
    permissions: [
      { key: 'gst_view_gst', label: 'View GST', description: 'View GST portal dashboard & summaries' },
      { key: 'gst_edit_gst', label: 'Edit GST', description: 'Rectify HSN & GSTIN validation errors' },
      { key: 'gst_export_gst', label: 'Export GST', description: 'Generate GST offline JSON & Excel exports' },
      { key: 'gst_prepare_gstr1', label: 'Prepare GSTR-1', description: 'Reconcile Outward Supplies (Tables 4, 7, 12)' },
      { key: 'gst_prepare_gstr3b', label: 'Prepare GSTR-3B', description: 'Calculate Net Tax liability & claim ITC' }
    ]
  },
  {
    category: 'REPORTS',
    categoryLabel: 'Reports & Intelligence',
    permissions: [
      { key: 'reports_sales_reports', label: 'Sales Reports', description: 'Access daily/monthly sales registers' },
      { key: 'reports_purchase_reports', label: 'Purchase Reports', description: 'Access procurement & vendor reports' },
      { key: 'reports_stock_reports', label: 'Stock Reports', description: 'Access stock valuation & movement reports' },
      { key: 'reports_profit_reports', label: 'Profit Reports', description: 'Access item & category margin reports' },
      { key: 'reports_financial_reports', label: 'Financial Reports', description: 'Access balance sheets & trial balances' }
    ]
  },
  {
    category: 'ADMIN',
    categoryLabel: 'System Administration',
    permissions: [
      { key: 'admin_manage_users', label: 'Manage Users', description: 'Create, edit, and deactivate user logins' },
      { key: 'admin_manage_roles', label: 'Manage Roles', description: 'Configure permission matrices' },
      { key: 'admin_company_settings', label: 'Company Settings', description: 'Modify GSTIN, firm profile & banking' },
      { key: 'admin_backup', label: 'Backup', description: 'Generate immediate manual database backup' },
      { key: 'admin_restore', label: 'Restore', description: 'Restore business database from archive' },
      { key: 'admin_audit_logs', label: 'Audit Logs', description: 'Inspect tamper-proof user activity trails' }
    ]
  }
];

// All permission keys flat list
export const ALL_PERMISSION_KEYS: PermissionKey[] = PERMISSION_CATEGORIES.flatMap(c =>
  c.permissions.map(p => p.key)
);

// Default Role to Permissions Mapping
export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, PermissionKey[]> = {
  super_admin: [...ALL_PERMISSION_KEYS],
  admin: ALL_PERMISSION_KEYS.filter(k => k !== 'admin_restore' && k !== 'sales_delete_void_invoice'),
  store_admin: ALL_PERMISSION_KEYS.filter(k => k !== 'admin_restore'),
  manager: [
    'sales_create_invoice',
    'sales_edit_invoice',
    'sales_cancel_invoice',
    'sales_change_selling_rate',
    'sales_apply_discount',
    'sales_view_profit',
    'sales_print_invoice',
    'purchase_create_purchase',
    'purchase_edit_purchase',
    'purchase_cancel_purchase',
    'purchase_view_supplier_cost',
    'inventory_create_item',
    'inventory_edit_item',
    'inventory_adjust_stock',
    'inventory_view_stock',
    'inventory_export_items',
    'inventory_print_barcodes',
    'accounts_create_receipt',
    'accounts_create_payment',
    'accounts_view_ledger',
    'gst_view_gst',
    'gst_export_gst',
    'reports_sales_reports',
    'reports_purchase_reports',
    'reports_stock_reports',
    'reports_profit_reports'
  ],
  billing_operator: [
    'sales_create_invoice',
    'sales_edit_invoice',
    'sales_print_invoice',
    'sales_apply_discount',
    'inventory_view_stock',
    'inventory_print_barcodes'
  ],
  purchase_operator: [
    'purchase_create_purchase',
    'purchase_edit_purchase',
    'purchase_view_supplier_cost',
    'purchase_change_purchase_rate',
    'inventory_create_item',
    'inventory_view_stock',
    'reports_purchase_reports'
  ],
  accounts_operator: [
    'accounts_create_receipt',
    'accounts_create_payment',
    'accounts_edit_receipt',
    'accounts_view_ledger',
    'accounts_view_financial_reports',
    'gst_view_gst',
    'gst_export_gst',
    'gst_prepare_gstr1',
    'gst_prepare_gstr3b',
    'reports_sales_reports',
    'reports_purchase_reports',
    'reports_financial_reports'
  ],
  inventory_operator: [
    'inventory_create_item',
    'inventory_edit_item',
    'inventory_adjust_stock',
    'inventory_view_stock',
    'inventory_export_items',
    'inventory_print_barcodes',
    'reports_stock_reports'
  ],
  viewer: [
    'inventory_view_stock',
    'reports_sales_reports',
    'reports_purchase_reports',
    'reports_stock_reports'
  ]
};

// ==========================================
// 3. COMPANY PROFILE INITIAL DATA
// ==========================================
export const INITIAL_COMPANY_PROFILE: CompanyProfile = {
  firmName: 'XEROVA BIKE SOFTWARE',
  tagline: 'Two-Wheeler Spares & Service Management',
  address: '',
  city: '',
  state: 'Tamil Nadu',
  pinCode: '',
  phone: '',
  altPhone: '',
  email: '',
  website: '',
  gstin: '',
  pan: '',
  logoUrl: '',
  bankName: '',
  accountName: '',
  accountNumber: '',
  ifsc: '',
  bankBranch: '',
  invoicePrefix: 'INV',
  startingNumber: 1001,
  financialYear: '2026-27',
  termsAndConditions:
    '1. Goods once sold will not be accepted back after 7 days from invoice date.\n2. Electrical components carry manufacturer warranty only.\n3. Warranty claims subject to OEM approval.',
  footerText: 'Thank you for your business!'
};

// ==========================================
// 4. BRANCHES INITIAL DATA
// ==========================================
export const INITIAL_BRANCHES: BranchRecord[] = [
  {
    id: 'br-1',
    name: 'Main Branch',
    code: 'HQ-01',
    address: '',
    city: '',
    state: 'Tamil Nadu',
    pinCode: '',
    contactPhone: '',
    contactEmail: '',
    gstin: '',
    manager: 'Administrator',
    status: 'Active',
    isMain: true
  }
];

// ==========================================
// 5. DOCUMENT NUMBERING & PREFIXES
// ==========================================
export const INITIAL_NUMBERING: DocumentNumberingConfig[] = [
  {
    id: 'num-1',
    docType: 'Sales Invoice',
    prefix: 'INV',
    startingNumber: 1001,
    currentNumber: 1001,
    financialYear: '2026-27',
    separator: '/',
    padding: 6
  },
  {
    id: 'num-2',
    docType: 'Purchase Invoice',
    prefix: 'PUR',
    startingNumber: 2001,
    currentNumber: 2001,
    financialYear: '2026-27',
    separator: '/',
    padding: 5
  },
  {
    id: 'num-3',
    docType: 'Quotation',
    prefix: 'QTN',
    startingNumber: 501,
    currentNumber: 501,
    financialYear: '2026-27',
    separator: '/',
    padding: 4
  },
  {
    id: 'num-4',
    docType: 'Sales Return',
    prefix: 'CN',
    startingNumber: 101,
    currentNumber: 101,
    financialYear: '2026-27',
    separator: '/',
    padding: 4
  },
  {
    id: 'num-5',
    docType: 'Purchase Return',
    prefix: 'DN',
    startingNumber: 101,
    currentNumber: 101,
    financialYear: '2026-27',
    separator: '/',
    padding: 4
  },
  {
    id: 'num-6',
    docType: 'Receipt',
    prefix: 'REC',
    startingNumber: 3001,
    currentNumber: 3001,
    financialYear: '2026-27',
    separator: '/',
    padding: 5
  },
  {
    id: 'num-7',
    docType: 'Payment',
    prefix: 'PAY',
    startingNumber: 4001,
    currentNumber: 4001,
    financialYear: '2026-27',
    separator: '/',
    padding: 5
  },
  {
    id: 'num-8',
    docType: 'Stock Adjustment',
    prefix: 'ADJ',
    startingNumber: 101,
    currentNumber: 101,
    financialYear: '2026-27',
    separator: '/',
    padding: 4
  }
];

// Helper to format live preview
export const getNumberingPreview = (config: DocumentNumberingConfig): string => {
  const padded = String(config.currentNumber).padStart(config.padding, '0');
  return `${config.prefix}${config.separator}${config.financialYear}${config.separator}${padded}`;
};

// ==========================================
// 6. TAX SETTINGS
// ==========================================
export const INITIAL_TAX_RATES: TaxRateConfig[] = [
  {
    id: 'tax-1',
    slabName: '18% Standard Automotive Spares',
    rate: 18,
    cgst: 9,
    sgst: 9,
    igst: 18,
    cess: 0,
    appliesToHsns: ['8714', '2710', '8487', '4016'],
    description: 'Clutch plates, drive chains, cables, gaskets, brake pads & lubricants',
    isDefault: true
  },
  {
    id: 'tax-2',
    slabName: '28% High Slab Electricals & Engine',
    rate: 28,
    cgst: 14,
    sgst: 14,
    igst: 28,
    cess: 0,
    appliesToHsns: ['8507', '8511', '8409'],
    description: 'Lead-acid batteries, spark plugs, ignition coils, cylinder blocks'
  },
  {
    id: 'tax-3',
    slabName: '12% Fasteners & Hardware',
    rate: 12,
    cgst: 6,
    sgst: 6,
    igst: 12,
    cess: 0,
    appliesToHsns: ['7318', '8301'],
    description: 'Flange bolts, studs, nuts, wheel bearings & lock sets'
  },
  {
    id: 'tax-4',
    slabName: '5% Basic Consumables & Grease',
    rate: 5,
    cgst: 2.5,
    sgst: 2.5,
    igst: 5,
    cess: 0,
    appliesToHsns: ['2710', '3403'],
    description: 'Bulk petroleum petroleum jelly, chain lube sprays & rust removers'
  },
  {
    id: 'tax-5',
    slabName: '0% Exempt / Scrap',
    rate: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    cess: 0,
    appliesToHsns: ['4901', '7204'],
    description: 'Technical repair service manuals, lead scrap exchange credits'
  }
];

// ==========================================
// 7. PAYMENT MODES CONFIG
// ==========================================
export const INITIAL_PAYMENT_MODES: PaymentModeConfig[] = [
  {
    id: 'pm-1',
    name: 'Cash',
    displayName: 'Cash in Drawer',
    isEnabled: true,
    isReferenceRequired: false,
    mappedAccount: 'Counter Cash Float Ledger',
    icon: 'payments',
    description: 'Immediate cash tender at POS billing counter'
  },
  {
    id: 'pm-2',
    name: 'UPI',
    displayName: 'UPI / QR Code (GPay, PhonePe, Paytm)',
    isEnabled: true,
    isReferenceRequired: true,
    mappedAccount: 'ICICI UPI Merchant Settlement A/c',
    icon: 'qr_code_2',
    description: 'Instant UPI dynamic QR code payment with 12-digit UTR verification'
  },
  {
    id: 'pm-3',
    name: 'Bank',
    displayName: 'Direct Bank Transfer (NEFT / RTGS / IMPS)',
    isEnabled: true,
    isReferenceRequired: true,
    mappedAccount: 'HDFC Bank Current Account',
    icon: 'account_balance',
    description: 'High-value wholesale garage transfer directly into HDFC'
  },
  {
    id: 'pm-4',
    name: 'Cheque',
    displayName: 'Bank Cheque / Clearing',
    isEnabled: true,
    isReferenceRequired: true,
    mappedAccount: 'Cheques in Hand Clearing Account',
    icon: 'receipt',
    description: 'Physical cheque with bank name, cheque number and clearance date'
  },
  {
    id: 'pm-5',
    name: 'Credit',
    displayName: 'Garage Credit Ledger (15 Days Term)',
    isEnabled: true,
    isReferenceRequired: false,
    mappedAccount: 'Sundry Debtors (Affiliated Garages)',
    icon: 'menu_book',
    description: 'Post invoice to mechanic ledger; settled on weekly statement'
  },
  {
    id: 'pm-6',
    name: 'Card POS',
    displayName: 'Debit / Credit Card (EDC Terminal)',
    isEnabled: true,
    isReferenceRequired: true,
    mappedAccount: 'HDFC EDC Swipe Terminal Account',
    icon: 'credit_card',
    description: 'Physical swipe/chip insertion terminal with approval code'
  }
];

// ==========================================
// 8. INVOICE TEMPLATES CONFIG
// ==========================================
export const INITIAL_TEMPLATES: InvoiceTemplateConfig[] = [
  {
    id: 'tmpl-1',
    name: 'A4 Standard GST Tax Invoice (B2B)',
    format: 'A4',
    showLogo: true,
    showHeader: true,
    showCustomerDetails: true,
    showVehicleNumber: true,
    showItemTable: true,
    showGstColumns: true,
    showBankDetails: true,
    showTerms: true,
    showFooter: true,
    headerTitle: 'TAX INVOICE',
    paperSizeLabel: 'Standard 210 x 297 mm'
  },
  {
    id: 'tmpl-2',
    name: 'A5 Compact Wholesale Slip (B2C & B2B)',
    format: 'A5',
    showLogo: true,
    showHeader: true,
    showCustomerDetails: true,
    showVehicleNumber: true,
    showItemTable: true,
    showGstColumns: true,
    showBankDetails: true,
    showTerms: false,
    showFooter: true,
    headerTitle: 'INVOICE SLIP',
    paperSizeLabel: 'Compact 148 x 210 mm'
  },
  {
    id: 'tmpl-3',
    name: '3-Inch (80mm) Thermal POS Cash Receipt',
    format: 'Thermal',
    showLogo: false,
    showHeader: true,
    showCustomerDetails: false,
    showVehicleNumber: true,
    showItemTable: true,
    showGstColumns: false,
    showBankDetails: false,
    showTerms: false,
    showFooter: true,
    headerTitle: 'CASH MEMO',
    paperSizeLabel: '80mm Continuous Roll'
  },
  {
    id: 'tmpl-4',
    name: '4-in-1 Mini Voucher Sheet (A4 Quad)',
    format: '4-in-1',
    showLogo: false,
    showHeader: true,
    showCustomerDetails: true,
    showVehicleNumber: true,
    showItemTable: true,
    showGstColumns: true,
    showBankDetails: false,
    showTerms: false,
    showFooter: false,
    headerTitle: 'RETAIL BILL',
    paperSizeLabel: 'A4 Cut into 4 Vouchers'
  }
];

// ==========================================
// 9. PRINTER CONFIGURATION
// ==========================================
export const INITIAL_PRINTER_CONFIG: PrinterConfig = {
  defaultPrinter: 'HP LaserJet Pro MFP 4104dw (A4 Network)',
  a4Printer: 'HP LaserJet Pro MFP 4104dw (A4 Network)',
  thermalPrinter: 'EPSON TM-T82III (80mm Thermal Receipt USB)',
  paperSize: 'A4',
  copies: 2,
  autoPrint: true,
  invoiceFormat: 'A4',
  printCutPaper: true,
  openCashDrawer: false
};

// ==========================================
// 10. BACKUP & RESTORE DATA
// ==========================================
export const INITIAL_BACKUPS: BackupRecord[] = [];

// ==========================================
// 11. AUDIT LOGS DATA
// ==========================================
export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [];

// ==========================================
// 12. USER ACTIVITY TIMELINE
// ==========================================
export const INITIAL_USER_ACTIVITIES: UserActivityItem[] = [];

// ==========================================
// 13. SECURITY SETTINGS INITIAL DATA
// ==========================================
export const INITIAL_SECURITY_SETTINGS: SecuritySettingsConfig = {
  sessionTimeoutMinutes: 30,
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireNumber: true,
    requireSpecialChar: true,
    expiryDays: 90
  },
  loginAttemptLimit: 5,
  requirePasswordChange: false,
  allowMultipleSessions: false,
  autoLogout: true,
  auditLoggingEnabled: true
};

// ==========================================
// 14. SYSTEM STATUS INITIAL DATA
// ==========================================
export const INITIAL_SYSTEM_STATUS: SystemStatusItem[] = [
  {
    name: 'Database Storage Engine',
    component: 'Database',
    status: 'Connected',
    details: 'PostgreSQL Relational DB Engine (Cluster 1, Ping 12ms, 0 locks)',
    lastChecked: 'Just now'
  },
  {
    name: 'ERP Application Server',
    component: 'Application',
    status: 'Connected',
    details: 'BIKE ERP v4.2.8 Enterprise Build (Node v20 LTS, Memory 182 MB)',
    lastChecked: 'Just now'
  },
  {
    name: 'Automated Backup Vault',
    component: 'Backup',
    status: 'Connected',
    details: 'Local Disk D:\\ 412 GB Free, Cloud Mirror verified 4 hrs ago',
    lastChecked: '4 hours ago'
  },
  {
    name: 'POS Thermal & A4 Printers',
    component: 'Printer',
    status: 'Connected',
    details: 'EPSON TM-T82III (USB001 Ready), HP LaserJet (Network Ready)',
    lastChecked: '2 minutes ago'
  },
  {
    name: 'Local Network & Ingress Proxy',
    component: 'Network',
    status: 'Connected',
    details: 'Primary Fiber Gateway 100 Mbps, Port 3000 Ingress Operational',
    lastChecked: 'Just now'
  },
  {
    name: 'RBAC Security & Authentication',
    component: 'Authentication',
    status: 'Connected',
    details: 'Token Session Guard active, 1 user session verified',
    lastChecked: 'Just now'
  }
];

export const INITIAL_ERP_USERS: ERPUser[] = INITIAL_USERS;
export const INITIAL_NUMBERING_CONFIG: DocumentNumberingConfig[] = INITIAL_NUMBERING;
export const INITIAL_TEMPLATE_CONFIG: InvoiceTemplateConfig = INITIAL_TEMPLATES[0];

