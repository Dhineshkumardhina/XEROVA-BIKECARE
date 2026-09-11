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
    fullName: 'Suresh Babu',
    username: 'suresh.superadmin',
    mobile: '+91 98401 11223',
    email: 'suresh@sribalajimotors.com',
    role: 'super_admin',
    roleDisplayName: 'Super Admin',
    branch: 'Main Branch - Chennai Central',
    status: 'Active',
    lastLogin: '11 Oct 2024, 09:30 AM',
    createdDate: '01 Jan 2024'
  },
  {
    id: 'usr-2',
    fullName: 'Rajesh Kumar',
    username: 'rajesh.admin',
    mobile: '+91 98402 33445',
    email: 'rajesh@sribalajimotors.com',
    role: 'admin',
    roleDisplayName: 'Admin / Store Manager',
    branch: 'Main Branch - Chennai Central',
    status: 'Active',
    lastLogin: '11 Oct 2024, 10:15 AM',
    createdDate: '15 Jan 2024'
  },
  {
    id: 'usr-3',
    fullName: 'Kavitha M',
    username: 'kavitha.billing',
    mobile: '+91 98403 55667',
    email: 'kavitha@sribalajimotors.com',
    role: 'billing_operator',
    roleDisplayName: 'Billing Operator',
    branch: 'Main Branch - Chennai Central',
    status: 'Active',
    lastLogin: '11 Oct 2024, 11:45 AM',
    createdDate: '01 Feb 2024'
  },
  {
    id: 'usr-4',
    fullName: 'Karthik V',
    username: 'karthik.inventory',
    mobile: '+91 98404 77889',
    email: 'karthik@sribalajimotors.com',
    role: 'inventory_operator',
    roleDisplayName: 'Inventory Operator',
    branch: 'Main Branch - Chennai Central',
    status: 'Active',
    lastLogin: '11 Oct 2024, 08:45 AM',
    createdDate: '10 Feb 2024'
  },
  {
    id: 'usr-5',
    fullName: 'Ramesh Sundaram',
    username: 'ramesh.accounts',
    mobile: '+91 98405 99001',
    email: 'ramesh@sribalajimotors.com',
    role: 'accounts_operator',
    roleDisplayName: 'Accounts Operator',
    branch: 'Main Branch - Chennai Central',
    status: 'Active',
    lastLogin: '10 Oct 2024, 05:20 PM',
    createdDate: '01 Mar 2024'
  },
  {
    id: 'usr-6',
    fullName: 'Praveen S',
    username: 'praveen.purchase',
    mobile: '+91 98406 12345',
    email: 'praveen@sribalajimotors.com',
    role: 'purchase_operator',
    roleDisplayName: 'Purchase Operator',
    branch: 'Ambattur Hub',
    status: 'Active',
    lastLogin: '11 Oct 2024, 09:10 AM',
    createdDate: '15 Mar 2024'
  },
  {
    id: 'usr-7',
    fullName: 'Vijay Anand',
    username: 'vijay.manager',
    mobile: '+91 98407 67890',
    email: 'vijay@sribalajimotors.com',
    role: 'manager',
    roleDisplayName: 'Branch Manager',
    branch: 'Ambattur Hub',
    status: 'Active',
    lastLogin: '11 Oct 2024, 10:00 AM',
    createdDate: '01 Apr 2024'
  },
  {
    id: 'usr-8',
    fullName: 'Priya R',
    username: 'priya.auditor',
    mobile: '+91 98408 24680',
    email: 'priya@sribalajimotors.com',
    role: 'viewer',
    roleDisplayName: 'Auditor / Viewer',
    branch: 'Main Branch - Chennai Central',
    status: 'Inactive',
    lastLogin: '28 Sep 2024, 04:30 PM',
    createdDate: '01 Jun 2024'
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
  firmName: 'SRI BALAJI MOTORS & SPARES',
  tagline: 'Genuine OEM Two-Wheeler Parts & Accessories',
  address: 'No. 42/B, 100 Feet Road, Vadapalani',
  city: 'Chennai',
  state: 'Tamil Nadu',
  pinCode: '600026',
  phone: '+91 98401 23456',
  altPhone: '+91 44 2489 1234',
  email: 'billing@sribalajimotors.com',
  website: 'www.sribalajimotors.com',
  gstin: '33AAAAA0000A1Z5',
  pan: 'AAAAA0000A',
  logoUrl: 'https://lh3.googleusercontent.com/aida/AEtjO1UQrVlh6FYKk4LuySvgRIsF8nn74XIEttFLLvqIpALmbsblikHweqTVsVsfbyz9CVQec99jOSCQi0-6w200SnJJhKug1sBznsIbEqp6YwcGcKFz_sosQqSzjJj3uqsw4lOrN4hwOHYnnJA4EECm_o6bWCkSgQv6_GVLKOn9swzB2r6g4YC8UpHG4hjMzUlz4wLPBD5LcQDBG9v2yWQ8bqrylGSXlacstksl38Nsul6WQDjYAXXG73NPFog',
  bankName: 'HDFC Bank Ltd',
  accountName: 'SRI BALAJI MOTORS AND SPARES',
  accountNumber: '50200049281928',
  ifsc: 'HDFC0001234',
  bankBranch: 'Vadapalani Branch, Chennai',
  invoicePrefix: 'INV',
  startingNumber: 1001,
  financialYear: '2026-27',
  termsAndConditions:
    '1. Goods once sold will not be accepted back after 7 days from invoice date.\n2. Electrical components, CDI units & rubber parts carry no warranty.\n3. Defective warranty claims subject to manufacturer OEM approval.\n4. Overdue payments will attract 18% p.a. interest after 15 days credit term.\n5. All disputes subject to Chennai jurisdiction only.',
  footerText: 'Thank you for your business! Always wear a helmet and ride safely.'
};

// ==========================================
// 4. BRANCHES INITIAL DATA
// ==========================================
export const INITIAL_BRANCHES: BranchRecord[] = [
  {
    id: 'br-1',
    name: 'Main Branch - Chennai Central',
    code: 'CHE-01',
    address: 'No. 42/B, 100 Feet Road, Vadapalani',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pinCode: '600026',
    contactPhone: '+91 98401 23456',
    contactEmail: 'central@sribalajimotors.com',
    gstin: '33AAAAA0000A1Z5',
    manager: 'Rajesh Kumar',
    status: 'Active',
    isMain: true
  },
  {
    id: 'br-2',
    name: 'Ambattur Hub (Wholesale Depot)',
    code: 'CHE-02',
    address: 'Plot 18, SIDCO Industrial Estate, Ambattur',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pinCode: '600058',
    contactPhone: '+91 98407 67890',
    contactEmail: 'ambattur@sribalajimotors.com',
    gstin: '33AAAAA0000A1Z5',
    manager: 'Vijay Anand',
    status: 'Active',
    isMain: false
  },
  {
    id: 'br-3',
    name: 'Tambaram Service Counter',
    code: 'CHE-03',
    address: 'No. 12, GST Road, Near Bus Stand, Tambaram',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pinCode: '600045',
    contactPhone: '+91 98405 88990',
    contactEmail: 'tambaram@sribalajimotors.com',
    gstin: '33AAAAA0000A1Z5',
    manager: 'Dinesh K',
    status: 'Active',
    isMain: false
  },
  {
    id: 'br-4',
    name: 'Madurai Regional Depot',
    code: 'MDU-01',
    address: 'Shop 4, Simmakkal Auto Market, Madurai',
    city: 'Madurai',
    state: 'Tamil Nadu',
    pinCode: '625001',
    contactPhone: '+91 98421 55443',
    contactEmail: 'madurai@sribalajimotors.com',
    gstin: '33AAAAA0000A1Z5',
    manager: 'Muthuraman S',
    status: 'Inactive',
    isMain: false
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
    currentNumber: 1125,
    financialYear: '2026-27',
    separator: '/',
    padding: 6
  },
  {
    id: 'num-2',
    docType: 'Purchase Invoice',
    prefix: 'PUR',
    startingNumber: 2001,
    currentNumber: 2084,
    financialYear: '2026-27',
    separator: '/',
    padding: 5
  },
  {
    id: 'num-3',
    docType: 'Quotation',
    prefix: 'QTN',
    startingNumber: 501,
    currentNumber: 542,
    financialYear: '2026-27',
    separator: '/',
    padding: 4
  },
  {
    id: 'num-4',
    docType: 'Sales Return',
    prefix: 'CN',
    startingNumber: 101,
    currentNumber: 118,
    financialYear: '2026-27',
    separator: '/',
    padding: 4
  },
  {
    id: 'num-5',
    docType: 'Purchase Return',
    prefix: 'DN',
    startingNumber: 101,
    currentNumber: 107,
    financialYear: '2026-27',
    separator: '/',
    padding: 4
  },
  {
    id: 'num-6',
    docType: 'Receipt',
    prefix: 'REC',
    startingNumber: 3001,
    currentNumber: 3140,
    financialYear: '2026-27',
    separator: '/',
    padding: 5
  },
  {
    id: 'num-7',
    docType: 'Payment',
    prefix: 'PAY',
    startingNumber: 4001,
    currentNumber: 4092,
    financialYear: '2026-27',
    separator: '/',
    padding: 5
  },
  {
    id: 'num-8',
    docType: 'Stock Adjustment',
    prefix: 'ADJ',
    startingNumber: 101,
    currentNumber: 134,
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
export const INITIAL_BACKUPS: BackupRecord[] = [
  {
    id: 'bk-1',
    filename: 'BIKE_ERP_BACKUP_20241024_080000.sql.gz',
    date: '24 Oct 2024',
    time: '08:00 AM',
    size: '48.6 MB',
    createdBy: 'Automated Daily Cron',
    status: 'Success',
    type: 'Scheduled',
    location: 'Local (D:\\Backups) + Cloud S3 Mirror'
  },
  {
    id: 'bk-2',
    filename: 'BIKE_ERP_BACKUP_20241023_200000.sql.gz',
    date: '23 Oct 2024',
    time: '08:00 PM',
    size: '48.2 MB',
    createdBy: 'Rajesh Kumar',
    status: 'Success',
    type: 'Manual',
    location: 'Local (D:\\Backups)'
  },
  {
    id: 'bk-3',
    filename: 'BIKE_ERP_BACKUP_20241022_080000.sql.gz',
    date: '22 Oct 2024',
    time: '08:00 AM',
    size: '47.9 MB',
    createdBy: 'Automated Daily Cron',
    status: 'Success',
    type: 'Scheduled',
    location: 'Local (D:\\Backups) + Cloud S3 Mirror'
  },
  {
    id: 'bk-4',
    filename: 'BIKE_ERP_BACKUP_20241020_193000.sql.gz',
    date: '20 Oct 2024',
    time: '07:30 PM',
    size: '47.5 MB',
    createdBy: 'Suresh Babu',
    status: 'Success',
    type: 'Pre-Update',
    location: 'Encrypted Cloud Vault'
  }
];

// ==========================================
// 11. AUDIT LOGS DATA
// ==========================================
export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-1',
    timestamp: '24 Oct 2024, 11:45:12 AM',
    user: 'Kavitha M (Billing Operator)',
    action: 'Invoice Created',
    module: 'Sales',
    record: 'INV/2026-27/001125',
    previousValue: 'None (New Record)',
    newValue: 'Total ₹1,850.00 (Customer: Royal Riders Clinic)',
    ipDevice: '192.168.1.104 (POS Terminal 1)',
    status: 'Success'
  },
  {
    id: 'aud-2',
    timestamp: '24 Oct 2024, 11:32:05 AM',
    user: 'Rajesh Kumar (Admin)',
    action: 'Rate Changed',
    module: 'Inventory',
    record: 'SKU-1302 (Pulsar Clutch Plate)',
    previousValue: 'Selling Rate: ₹620.00',
    newValue: 'Selling Rate: ₹650.00 (OEM Hike)',
    ipDevice: '192.168.1.101 (Manager Desktop)',
    status: 'Success'
  },
  {
    id: 'aud-3',
    timestamp: '24 Oct 2024, 11:15:40 AM',
    user: 'Ramesh Sundaram (Accounts)',
    action: 'Receipt Created',
    module: 'Accounts',
    record: 'REC/2026-27/03140',
    previousValue: 'Pending Due: ₹12,450.00',
    newValue: 'Receipt ₹4,500.00 via UPI (Ref: 429810294812)',
    ipDevice: '192.168.1.103 (Accounts PC)',
    status: 'Success'
  },
  {
    id: 'aud-4',
    timestamp: '24 Oct 2024, 10:48:22 AM',
    user: 'Karthik V (Inventory)',
    action: 'Stock Adjusted',
    module: 'Inventory',
    record: 'SKU-1405 (Motul 7100 10W50 1L)',
    previousValue: 'Physical Count: 18 units',
    newValue: 'Adjusted: +6 units (Found in Bay 2 Bins)',
    ipDevice: '192.168.1.102 (Warehouse Handheld)',
    status: 'Success'
  },
  {
    id: 'aud-5',
    timestamp: '24 Oct 2024, 10:12:18 AM',
    user: 'Suresh Babu (Super Admin)',
    action: 'Permission Changed',
    module: 'Security',
    record: 'Role: Billing Operator',
    previousValue: 'Apply Discount: Up to 5%',
    newValue: 'Apply Discount: Up to 10%',
    ipDevice: '192.168.1.100 (Super Admin Terminal)',
    status: 'Success'
  },
  {
    id: 'aud-6',
    timestamp: '24 Oct 2024, 09:55:01 AM',
    user: 'Kavitha M (Billing Operator)',
    action: 'Access Denied',
    module: 'Reports',
    record: 'Profitability & Margins Dashboard',
    previousValue: 'Permission Check',
    newValue: 'Denied: Operator role restricted from viewing profit margins',
    ipDevice: '192.168.1.104 (POS Terminal 1)',
    status: 'Denied'
  },
  {
    id: 'aud-7',
    timestamp: '24 Oct 2024, 09:20:15 AM',
    user: 'Praveen S (Purchase)',
    action: 'Payment Created',
    module: 'Purchase',
    record: 'PAY/2026-27/04092',
    previousValue: 'Outstanding: ₹48,600.00',
    newValue: 'Payment ₹25,000.00 to Bajaj Auto Genuine Parts Hub',
    ipDevice: '192.168.2.105 (Ambattur Hub Desktop)',
    status: 'Success'
  },
  {
    id: 'aud-8',
    timestamp: '24 Oct 2024, 08:00:02 AM',
    user: 'System Automated Daemon',
    action: 'Backup Created',
    module: 'Admin',
    record: 'BIKE_ERP_BACKUP_20241024_080000.sql.gz',
    previousValue: 'None',
    newValue: 'Snapshot 48.6 MB generated & verified',
    ipDevice: '127.0.0.1 (Local Database Host)',
    status: 'Success'
  },
  {
    id: 'aud-9',
    timestamp: '23 Oct 2024, 06:14:22 PM',
    user: 'Rajesh Kumar (Admin)',
    action: 'Invoice Cancelled',
    module: 'Sales',
    record: 'INV/2026-27/001112',
    previousValue: 'Status: Active',
    newValue: 'Cancelled: Wrong model cable issued by mistake',
    ipDevice: '192.168.1.101 (Manager Desktop)',
    status: 'Warning'
  },
  {
    id: 'aud-10',
    timestamp: '23 Oct 2024, 04:30:10 PM',
    user: 'Suresh Babu (Super Admin)',
    action: 'User Created',
    module: 'Admin',
    record: 'User: praveen.purchase',
    previousValue: 'None',
    newValue: 'Praveen S assigned to Ambattur Hub with Purchase Operator role',
    ipDevice: '192.168.1.100 (Super Admin Terminal)',
    status: 'Success'
  }
];

// ==========================================
// 12. USER ACTIVITY TIMELINE
// ==========================================
export const INITIAL_USER_ACTIVITIES: UserActivityItem[] = [
  {
    id: 'act-1',
    timestamp: '11:45 AM',
    user: 'Kavitha M',
    action: 'Invoice created',
    relatedRecord: 'INV/2026-27/001125',
    device: 'POS Counter 1',
    details: '₹1,850.00 cash counter bill for Royal Riders Clinic'
  },
  {
    id: 'act-2',
    timestamp: '11:32 AM',
    user: 'Rajesh Kumar',
    action: 'Selling rate changed',
    relatedRecord: 'SKU-1302 (Pulsar Clutch Plate)',
    device: 'Manager PC',
    details: 'Increased from ₹620.00 to ₹650.00 following Bajaj price revision'
  },
  {
    id: 'act-3',
    timestamp: '11:15 AM',
    user: 'Ramesh Sundaram',
    action: 'Payment received',
    relatedRecord: 'REC/2026-27/03140',
    device: 'Accounts PC',
    details: '₹4,500.00 credited via UPI from Speed Motors'
  },
  {
    id: 'act-4',
    timestamp: '10:48 AM',
    user: 'Karthik V',
    action: 'Stock adjusted',
    relatedRecord: 'SKU-1405 (Motul 7100)',
    device: 'Warehouse Tab',
    details: '+6 units re-shelved into Rack B-04'
  },
  {
    id: 'act-5',
    timestamp: '10:12 AM',
    user: 'Suresh Babu',
    action: 'Permission policy updated',
    relatedRecord: 'Role: Billing Operator',
    device: 'Admin Terminal',
    details: 'Allowed discount authorization up to 10%'
  },
  {
    id: 'act-6',
    timestamp: '09:40 AM',
    user: 'Praveen S',
    action: 'PO dispatched',
    relatedRecord: 'PO-8492',
    device: 'Ambattur Hub',
    details: 'Order placed with TVS Motor Genuine Parts for 40 spark plugs'
  },
  {
    id: 'act-7',
    timestamp: '08:00 AM',
    user: 'System Bot',
    action: 'Database backed up',
    relatedRecord: 'Daily Snapshot',
    device: 'Cloud Storage Server',
    details: 'Daily automated incremental snapshot 48.6 MB verified'
  }
];

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
    details: 'Token Session Guard active, 7 user sessions verified',
    lastChecked: 'Just now'
  }
];

export const INITIAL_ERP_USERS: ERPUser[] = INITIAL_USERS;
export const INITIAL_NUMBERING_CONFIG: DocumentNumberingConfig[] = INITIAL_NUMBERING;
export const INITIAL_TEMPLATE_CONFIG: InvoiceTemplateConfig = INITIAL_TEMPLATES[0];

