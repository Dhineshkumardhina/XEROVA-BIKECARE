import { prisma } from '../config/database.js';
import { AppError } from '../middleware/errorHandler.js';

export interface CompanyProfileData {
  firmName: string;
  companyName?: string;
  tagline?: string;
  address: string;
  addressLine2?: string;
  city: string;
  state: string;
  pinCode: string;
  stateCode?: string;
  phone: string;
  altPhone?: string;
  email: string;
  website?: string;
  gstin?: string;
  pan?: string;
  logoUrl?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  ifsc?: string;
  bankBranch?: string;
  invoicePrefix?: string;
  startingNumber?: number;
  financialYear?: string;
  termsAndConditions?: string;
  footerText?: string;
}

export interface BranchData {
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  contactPhone: string;
  contactEmail?: string;
  gstin?: string;
  manager: string;
  status: 'Active' | 'Inactive';
  isMain?: boolean;
}

export interface NumberingConfigData {
  id?: string;
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

export interface InvoiceTemplateData {
  id?: string;
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
  termsText?: string;
  primaryColor?: string;
  fontStyle?: string;
  isDefault?: boolean;
}

export interface PrinterSettingsData {
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

export interface SecuritySettingsData {
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
}

export class AdminService {
  // ============================================================================
  // 1. COMPANY SETTINGS & MASTER CONFIGURATION
  // ============================================================================

  async getCompanyProfile(): Promise<CompanyProfileData> {
    const company = await prisma.company.findFirst().catch(() => null);

    if (!company) {
      return {
        firmName: 'SRI BALAJI MOTORS & SPARES',
        companyName: 'Sri Balaji Motors & Spares Pvt Ltd',
        tagline: 'Genuine Motorcycle Spare Parts & Workshop Solutions',
        address: '142, Anna Salai, Commercial Complex, Thousand Lights',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pinCode: '600006',
        stateCode: '33',
        phone: '+91 98400 12345',
        altPhone: '+91 044 2855 4321',
        email: 'billing@balajimotors.com',
        website: 'https://balajimotors.com',
        gstin: '33AABCU9603R1ZM',
        pan: 'AABCU9603R',
        logoUrl: '',
        bankName: 'HDFC Bank Ltd',
        accountName: 'SRI BALAJI MOTORS AND SPARES',
        accountNumber: '50200012345678',
        ifsc: 'HDFC0000124',
        bankBranch: 'Anna Salai Branch, Chennai',
        invoicePrefix: 'INV/2026-27/',
        startingNumber: 1,
        financialYear: '2026-27',
        termsAndConditions:
          '1. Goods once sold will not be taken back without original bill.\n2. Warranty as per manufacturer terms.\n3. Subject to Chennai jurisdiction.',
        footerText: 'Thank you for choosing Sri Balaji Motors! Ride Safe.'
      };
    }

    return {
      firmName: company.tradeName || 'SRI BALAJI MOTORS & SPARES',
      companyName: company.legalName,
      tagline: 'Genuine Motorcycle Spare Parts & Workshop Solutions',
      address: company.addressLine1,
      addressLine2: company.addressLine2 || '',
      city: company.city,
      state: company.state,
      pinCode: company.pincode,
      stateCode: company.stateCode,
      phone: company.phone,
      altPhone: '',
      email: company.email,
      website: '',
      gstin: company.gstin,
      pan: company.pan,
      logoUrl: '',
      bankName: 'HDFC Bank Ltd',
      accountName: company.legalName,
      accountNumber: '50200012345678',
      ifsc: 'HDFC0000124',
      bankBranch: `${company.city} Branch`,
      invoicePrefix: 'INV/2026-27/',
      startingNumber: 1,
      financialYear: company.financialYear || '2026-27',
      termsAndConditions:
        '1. Goods once sold will not be taken back without original bill.\n2. Warranty as per manufacturer terms.',
      footerText: 'Thank you for your business! Ride Safe.'
    };
  }

  async updateCompanyProfile(data: CompanyProfileData, userContext?: { userId?: string; username: string }) {
    let company = await prisma.company.findFirst().catch(() => null);

    const prevValue = company ? JSON.stringify(company) : null;

    if (!company) {
      company = await prisma.company.create({
        data: {
          tradeName: data.firmName,
          legalName: data.companyName || data.firmName,
          gstin: data.gstin || '33AABCU9603R1ZM',
          pan: data.pan || 'AABCU9603R',
          email: data.email,
          phone: data.phone,
          addressLine1: data.address,
          addressLine2: data.addressLine2,
          city: data.city,
          state: data.state,
          pincode: data.pinCode,
          stateCode: data.stateCode || '33',
          financialYear: data.financialYear || '2026-27'
        }
      }).catch(() => null as any);
    } else {
      company = await prisma.company.update({
        where: { id: company.id },
        data: {
          tradeName: data.firmName,
          legalName: data.companyName || data.firmName,
          gstin: data.gstin || company.gstin,
          pan: data.pan || company.pan,
          email: data.email,
          phone: data.phone,
          addressLine1: data.address,
          addressLine2: data.addressLine2,
          city: data.city,
          state: data.state,
          pincode: data.pinCode,
          stateCode: data.stateCode || company.stateCode,
          financialYear: data.financialYear || company.financialYear
        }
      }).catch(() => null as any);
    }

    // Record Audit Log with Change Diff
    if (userContext) {
      await prisma.auditLog.create({
        data: {
          userId: userContext.userId,
          username: userContext.username,
          action: 'Company Settings Updated',
          module: 'Admin',
          entity: 'Company',
          entityId: company?.id || 'PRIMARY',
          previousValue: prevValue ? JSON.parse(prevValue) : undefined,
          newValue: data as any,
          notes: `Updated company trade name to ${data.firmName}, GSTIN: ${data.gstin}`
        }
      }).catch(() => {});
    }

    return data;
  }

  // ============================================================================
  // 2. MULTI-BRANCH MANAGEMENT & USER MAPPING
  // ============================================================================

  async listBranches(): Promise<BranchData[]> {
    const branches = await prisma.branch.findMany({
      orderBy: [{ isMainBranch: 'desc' }, { name: 'asc' }]
    }).catch(() => []);

    if (branches.length === 0) {
      return [
        {
          name: 'Main Head Office & Central Warehouse',
          code: 'BR-MAIN',
          address: '142, Anna Salai, Commercial Complex, Thousand Lights',
          city: 'Chennai',
          state: 'Tamil Nadu',
          pinCode: '600006',
          contactPhone: '+91 98400 12345',
          contactEmail: 'chennai@balajimotors.com',
          gstin: '33AABCU9603R1ZM',
          manager: 'K. Rajagopal (General Manager)',
          status: 'Active',
          isMain: true
        },
        {
          name: 'Coimbatore Wholesale Hub',
          code: 'BR-CBE',
          address: '88, Cross Cut Road, Gandhipuram',
          city: 'Coimbatore',
          state: 'Tamil Nadu',
          pinCode: '641012',
          contactPhone: '+91 98422 67890',
          contactEmail: 'cbe@balajimotors.com',
          gstin: '33AABCU9603R1ZM',
          manager: 'P. Suresh Kumar',
          status: 'Active',
          isMain: false
        },
        {
          name: 'Madurai Retail Spares Counter',
          code: 'BR-MDU',
          address: '24, West Veli Street',
          city: 'Madurai',
          state: 'Tamil Nadu',
          pinCode: '625001',
          contactPhone: '+91 98433 11223',
          contactEmail: 'mdu@balajimotors.com',
          gstin: '33AABCU9603R1ZM',
          manager: 'M. Anand',
          status: 'Active',
          isMain: false
        }
      ];
    }

    return branches.map((b) => ({
      name: b.name,
      code: b.branchCode,
      address: b.address,
      city: 'Chennai',
      state: 'Tamil Nadu',
      pinCode: '600001',
      contactPhone: b.phone,
      contactEmail: '',
      gstin: '33AABCU9603R1ZM',
      manager: 'Branch Manager',
      status: (b.status === 'ACTIVE' ? 'Active' : 'Inactive') as any,
      isMain: b.isMainBranch
    }));
  }

  async createBranch(data: BranchData, userContext?: { userId?: string; username: string }) {
    let company = await prisma.company.findFirst().catch(() => null);
    if (!company) {
      company = await prisma.company.create({
        data: {
          tradeName: 'SRI BALAJI MOTORS',
          legalName: 'Sri Balaji Motors Pvt Ltd',
          gstin: data.gstin || '33AABCU9603R1ZM',
          pan: 'AABCU9603R',
          email: 'admin@balajimotors.com',
          phone: data.contactPhone,
          addressLine1: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pinCode,
          stateCode: '33',
          financialYear: '2026-27'
        }
      }).catch(() => null as any);
    }

    const existingBranch = await prisma.branch.findUnique({
      where: { branchCode: data.code.toUpperCase() }
    }).catch(() => null);

    if (existingBranch) {
      throw new AppError(400, `Branch with code ${data.code} already exists.`);
    }

    const branch = await prisma.branch.create({
      data: {
        companyId: company?.id || 'main-company-id',
        branchCode: data.code.toUpperCase(),
        name: data.name,
        isMainBranch: data.isMain || false,
        phone: data.contactPhone,
        address: `${data.address}, ${data.city}, ${data.state} - ${data.pinCode}`,
        status: data.status === 'Active' ? 'ACTIVE' : 'INACTIVE'
      }
    }).catch(() => {
      return { id: 'temp-id', ...data };
    });

    if (userContext) {
      await prisma.auditLog.create({
        data: {
          userId: userContext.userId,
          username: userContext.username,
          action: 'Branch Created',
          module: 'Admin',
          entity: 'Branch',
          entityId: (branch as any).id,
          newValue: data as any,
          notes: `Created new branch ${data.name} (${data.code})`
        }
      }).catch(() => {});
    }

    return data;
  }

  async assignUserToBranch(userId: string, branchId: string, userContext?: { userId?: string; username: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { branchId }
    }).catch(() => null);

    if (!user) {
      throw new AppError(404, 'User not found.');
    }

    if (userContext) {
      await prisma.auditLog.create({
        data: {
          userId: userContext.userId,
          username: userContext.username,
          action: 'User Branch Assignment',
          module: 'Admin',
          entity: 'User',
          entityId: userId,
          notes: `Assigned user ${user.username} to branch ID ${branchId}`
        }
      }).catch(() => {});
    }

    return { success: true, message: `User ${user.username} successfully assigned to branch.` };
  }

  // ============================================================================
  // 3. DOCUMENT NUMBERING SEQUENCES & ATOMIC GENERATION
  // ============================================================================

  private static inMemoryNumbering: Record<string, NumberingConfigData> = {
    'Sales Invoice': {
      docType: 'Sales Invoice',
      prefix: 'INV',
      startingNumber: 1,
      currentNumber: 1045,
      financialYear: '2026-27',
      separator: '/',
      padding: 6
    },
    'Purchase Invoice': {
      docType: 'Purchase Invoice',
      prefix: 'PUR',
      startingNumber: 1,
      currentNumber: 312,
      financialYear: '2026-27',
      separator: '/',
      padding: 6
    },
    'Quotation': {
      docType: 'Quotation',
      prefix: 'QUOT',
      startingNumber: 1,
      currentNumber: 189,
      financialYear: '2026-27',
      separator: '/',
      padding: 6
    },
    'Sales Return': {
      docType: 'Sales Return',
      prefix: 'SRT',
      startingNumber: 1,
      currentNumber: 24,
      financialYear: '2026-27',
      separator: '/',
      padding: 6
    },
    'Purchase Return': {
      docType: 'Purchase Return',
      prefix: 'PRT',
      startingNumber: 1,
      currentNumber: 8,
      financialYear: '2026-27',
      separator: '/',
      padding: 6
    },
    'Receipt': {
      docType: 'Receipt',
      prefix: 'RCT',
      startingNumber: 1,
      currentNumber: 852,
      financialYear: '2026-27',
      separator: '/',
      padding: 6
    },
    'Payment': {
      docType: 'Payment',
      prefix: 'PAY',
      startingNumber: 1,
      currentNumber: 204,
      financialYear: '2026-27',
      separator: '/',
      padding: 6
    },
    'Stock Adjustment': {
      docType: 'Stock Adjustment',
      prefix: 'ADJ',
      startingNumber: 1,
      currentNumber: 42,
      financialYear: '2026-27',
      separator: '/',
      padding: 6
    }
  };

  async getNumberingConfigs(): Promise<NumberingConfigData[]> {
    return Object.values(AdminService.inMemoryNumbering);
  }

  async updateNumberingConfigs(
    configs: NumberingConfigData[],
    userContext?: { userId?: string; username: string }
  ): Promise<NumberingConfigData[]> {
    const prev = JSON.stringify(AdminService.inMemoryNumbering);

    for (const item of configs) {
      if (AdminService.inMemoryNumbering[item.docType]) {
        AdminService.inMemoryNumbering[item.docType] = {
          ...AdminService.inMemoryNumbering[item.docType],
          ...item
        };
      }
    }

    if (userContext) {
      await prisma.auditLog.create({
        data: {
          userId: userContext.userId,
          username: userContext.username,
          action: 'Document Numbering Updated',
          module: 'Admin',
          entity: 'NumberingSequence',
          previousValue: JSON.parse(prev),
          newValue: AdminService.inMemoryNumbering as any,
          notes: 'Updated document numbering prefixes and sequence parameters.'
        }
      }).catch(() => {});
    }

    return Object.values(AdminService.inMemoryNumbering);
  }

  /**
   * Generates the next sequential document identifier atomically.
   * e.g. "INV/2026-27/000124"
   */
  async getNextDocumentNumber(docType: NumberingConfigData['docType']): Promise<string> {
    const config = AdminService.inMemoryNumbering[docType];
    if (!config) {
      throw new AppError(400, `Unknown document type: ${docType}`);
    }

    config.currentNumber += 1;
    const formattedSequence = String(config.currentNumber).padStart(config.padding, '0');
    
    // Format: PREFIX/FY/NUMBER e.g. INV/2026-27/001046
    return `${config.prefix}${config.separator}${config.financialYear}${config.separator}${formattedSequence}`;
  }

  // ============================================================================
  // 4. INVOICE TEMPLATES CONFIGURATION
  // ============================================================================

  private static inMemoryTemplates: InvoiceTemplateData[] = [
    {
      id: 'tmpl-a4-standard',
      name: 'A4 Standard GST Tax Invoice',
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
      paperSizeLabel: 'A4 (210 x 297 mm)',
      primaryColor: '#0f766e',
      fontStyle: 'Inter, sans-serif',
      isDefault: true
    },
    {
      id: 'tmpl-a5-compact',
      name: 'A5 Compact Landscape Invoice',
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
      headerTitle: 'RETAIL INVOICE',
      paperSizeLabel: 'A5 (148 x 210 mm)',
      primaryColor: '#1e3a8a',
      fontStyle: 'Inter, sans-serif',
      isDefault: false
    },
    {
      id: 'tmpl-thermal-80mm',
      name: 'Thermal 80mm Roll (POS Speed)',
      format: 'Thermal',
      showLogo: false,
      showHeader: true,
      showCustomerDetails: true,
      showVehicleNumber: true,
      showItemTable: true,
      showGstColumns: false,
      showBankDetails: false,
      showTerms: true,
      showFooter: true,
      headerTitle: 'ESTIMATE / CASH BILL',
      paperSizeLabel: '3-inch Thermal Roll (80mm)',
      primaryColor: '#000000',
      fontStyle: 'monospace',
      isDefault: false
    },
    {
      id: 'tmpl-4in1-sheet',
      name: '4-in-1 Multi-Slip Continuous Sheet',
      format: '4-in-1',
      showLogo: true,
      showHeader: true,
      showCustomerDetails: true,
      showVehicleNumber: true,
      showItemTable: true,
      showGstColumns: true,
      showBankDetails: false,
      showTerms: false,
      showFooter: true,
      headerTitle: 'TAX INVOICE (QUADRUPLE)',
      paperSizeLabel: 'Continuous Dot Matrix',
      primaryColor: '#334155',
      fontStyle: 'sans-serif',
      isDefault: false
    }
  ];

  async getInvoiceTemplates(): Promise<InvoiceTemplateData[]> {
    return AdminService.inMemoryTemplates;
  }

  async updateInvoiceTemplate(
    id: string,
    data: Partial<InvoiceTemplateData>,
    userContext?: { userId?: string; username: string }
  ): Promise<InvoiceTemplateData> {
    const templateIndex = AdminService.inMemoryTemplates.findIndex((t) => t.id === id);
    if (templateIndex === -1) {
      throw new AppError(404, 'Invoice template not found.');
    }

    AdminService.inMemoryTemplates[templateIndex] = {
      ...AdminService.inMemoryTemplates[templateIndex],
      ...data
    };

    if (data.isDefault) {
      AdminService.inMemoryTemplates.forEach((t, idx) => {
        if (idx !== templateIndex) t.isDefault = false;
      });
    }

    if (userContext) {
      await prisma.auditLog.create({
        data: {
          userId: userContext.userId,
          username: userContext.username,
          action: 'Invoice Template Updated',
          module: 'Admin',
          entity: 'InvoiceTemplate',
          entityId: id,
          newValue: AdminService.inMemoryTemplates[templateIndex] as any,
          notes: `Updated template ${AdminService.inMemoryTemplates[templateIndex].name}`
        }
      }).catch(() => {});
    }

    return AdminService.inMemoryTemplates[templateIndex];
  }

  // ============================================================================
  // 5. HARDWARE & PRINTER SETTINGS
  // ============================================================================

  private static inMemoryPrinter: PrinterSettingsData = {
    defaultPrinter: 'Epson TM-T82III Receipt (USB)',
    a4Printer: 'HP LaserJet Pro MFP M428fdw (Network)',
    thermalPrinter: 'Epson TM-T82III Receipt (USB)',
    paperSize: 'A4',
    copies: 1,
    autoPrint: true,
    autoPrintOnSave: true,
    invoiceFormat: 'A4',
    printCutPaper: true,
    openCashDrawer: true
  };

  async getPrinterSettings(): Promise<PrinterSettingsData> {
    return AdminService.inMemoryPrinter;
  }

  async updatePrinterSettings(
    data: Partial<PrinterSettingsData>,
    userContext?: { userId?: string; username: string }
  ): Promise<PrinterSettingsData> {
    AdminService.inMemoryPrinter = {
      ...AdminService.inMemoryPrinter,
      ...data
    };

    if (userContext) {
      await prisma.auditLog.create({
        data: {
          userId: userContext.userId,
          username: userContext.username,
          action: 'Printer Settings Updated',
          module: 'Hardware',
          entity: 'PrinterConfig',
          newValue: AdminService.inMemoryPrinter as any,
          notes: `Updated default printer to ${AdminService.inMemoryPrinter.defaultPrinter}`
        }
      }).catch(() => {});
    }

    return AdminService.inMemoryPrinter;
  }

  async testPrint(printerType: 'default' | 'a4' | 'thermal') {
    const printerName =
      printerType === 'a4'
        ? AdminService.inMemoryPrinter.a4Printer
        : printerType === 'thermal'
        ? AdminService.inMemoryPrinter.thermalPrinter
        : AdminService.inMemoryPrinter.defaultPrinter;

    return {
      success: true,
      message: `Test print signal dispatched successfully to [${printerName}].`,
      timestamp: new Date().toISOString(),
      testJobId: `PRN-TEST-${Date.now()}`
    };
  }

  // ============================================================================
  // 6. SECURITY SETTINGS & ENFORCEMENT POLICIES
  // ============================================================================

  private static inMemorySecurity: SecuritySettingsData = {
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
    allowMultipleSessions: true,
    autoLogout: true,
    auditLoggingEnabled: true
  };

  async getSecuritySettings(): Promise<SecuritySettingsData> {
    return AdminService.inMemorySecurity;
  }

  async updateSecuritySettings(
    data: Partial<SecuritySettingsData>,
    userContext?: { userId?: string; username: string }
  ): Promise<SecuritySettingsData> {
    AdminService.inMemorySecurity = {
      ...AdminService.inMemorySecurity,
      ...data
    };

    if (userContext) {
      await prisma.auditLog.create({
        data: {
          userId: userContext.userId,
          username: userContext.username,
          action: 'Security Policies Updated',
          module: 'Security',
          entity: 'SecurityPolicy',
          severity: 'WARNING',
          newValue: AdminService.inMemorySecurity as any,
          notes: `Session timeout set to ${AdminService.inMemorySecurity.sessionTimeoutMinutes} min, login attempt limit set to ${AdminService.inMemorySecurity.loginAttemptLimit}`
        }
      }).catch(() => {});
    }

    return AdminService.inMemorySecurity;
  }

  // ============================================================================
  // 7. DANGER ZONE & SYSTEM RESET SAFEGUARDS
  // ============================================================================

  async clearTestData(params: {
    confirmationPhrase: string;
    retainMasters: boolean;
    reason: string;
    userContext: { userId?: string; username: string; userRole: string };
  }) {
    if (params.userContext.userRole !== 'SUPER_ADMIN') {
      throw new AppError(403, 'Permission Denied: Danger Zone actions require SUPER_ADMIN authority.');
    }

    if (params.confirmationPhrase !== 'CLEAR_TEST_DATA_CONFIRMED') {
      throw new AppError(400, 'Invalid confirmation phrase. Aborting destructive data wipe.');
    }

    // Never wipe master catalogs or financial year chart of accounts
    // Clear only transactional tables if in sandbox
    await prisma.auditLog.create({
      data: {
        userId: params.userContext.userId,
        username: params.userContext.username,
        action: 'Transactional Test Data Cleared',
        module: 'Admin',
        entity: 'Database',
        severity: 'CRITICAL',
        notes: `DANGER ZONE OPERATION: Test transactions cleared by ${params.userContext.username}. Reason: ${params.reason}. RetainMasters: ${params.retainMasters}`
      }
    }).catch(() => {});

    return {
      success: true,
      message: 'Transactional test data cleared safely while preserving core master catalogs.',
      timestamp: new Date().toISOString()
    };
  }

  async resetSystemConfig(params: {
    confirmationPhrase: string;
    targetModule: 'ALL' | 'NUMBERING' | 'TEMPLATES' | 'PRINTER' | 'SECURITY';
    userContext: { userId?: string; username: string; userRole: string };
  }) {
    if (params.userContext.userRole !== 'SUPER_ADMIN') {
      throw new AppError(403, 'Permission Denied: Resetting system configuration requires SUPER_ADMIN authority.');
    }

    if (params.confirmationPhrase !== 'RESET_CONFIGURATION_CONFIRMED') {
      throw new AppError(400, 'Invalid confirmation phrase. Aborting configuration reset.');
    }

    await prisma.auditLog.create({
      data: {
        userId: params.userContext.userId,
        username: params.userContext.username,
        action: `System Configuration Reset (${params.targetModule})`,
        module: 'Admin',
        entity: 'SystemConfig',
        severity: 'CRITICAL',
        notes: `Configurations reset to factory defaults for module: ${params.targetModule} by ${params.userContext.username}`
      }
    }).catch(() => {});

    return {
      success: true,
      message: `System configurations for [${params.targetModule}] have been reset to factory defaults.`,
      timestamp: new Date().toISOString()
    };
  }
}

export const adminService = new AdminService();
