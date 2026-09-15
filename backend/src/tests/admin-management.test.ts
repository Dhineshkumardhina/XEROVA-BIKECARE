/**
 * ==============================================================================
 * BIKE ERP - ADMINISTRATION & SYSTEM MANAGEMENT TEST SUITE
 * ==============================================================================
 * Comprehensive test verification for:
 * 1. Company Profile & Master Settings (Firm Name, GSTIN, PAN, Bank Details)
 * 2. Multi-Branch Operations & User Assignment
 * 3. Document Numbering Sequence Engine (Atomic formatting & Zero duplication)
 * 4. Invoice Templates (A4, A5, Thermal 80mm, 4-in-1 layouts)
 * 5. Printer Settings & Test Print Signaling
 * 6. Real Database Backup Generation & SHA-256 Checksum Verification
 * 7. Controlled Restore Workflow & Safety Snapshot Pre-flight
 * 8. Comprehensive Audit Logs (Diff Tracking & Activity Timeline)
 * 9. Security Policies (Session Timeout, Password Complexity, Lockout Limit)
 * 10. Danger Zone Destructive Action Safeguards (Confirmation Token Verification)
 * 11. RBAC & Permission Enforcements
 * ==============================================================================
 */

import { adminService } from '../services/admin.service.js';
import { backupService } from '../services/backup.service.js';
import { auditService } from '../services/audit.service.js';
import {
  updateCompanySettingsSchema,
  createBranchSchema,
  bulkUpdateNumberingSchema,
  invoiceTemplateSchema,
  printerSettingsSchema,
  securitySettingsSchema,
  restoreDatabaseSchema,
  clearTestDataSchema
} from '../validators/admin.validator.js';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedTests++;
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runAdminManagementTestSuite() {
  console.log('\n======================================================');
  console.log('🛠️  BIKE ERP - ADMINISTRATION & SYSTEM MANAGEMENT SUITE');
  console.log('======================================================\n');

  // --------------------------------------------------------------------------
  console.log('--- Test 1: Company Profile & Master Settings Configuration ---');
  // --------------------------------------------------------------------------
  const initialCompany = await adminService.getCompanyProfile();
  assert(typeof initialCompany.firmName === 'string', 'Initial company profile loaded with firm name');
  assert(initialCompany.gstin?.length === 15, 'Valid 15-digit GSTIN registered for company');
  assert(initialCompany.stateCode === '33', 'Default GST State Code is 33 (Tamil Nadu)');

  const updateCompanyPayload = {
    firmName: 'SRI BALAJI MOTORS & SPARES (HEADQUARTERS)',
    legalName: 'Sri Balaji Motors & Spares Pvt Ltd',
    tagline: 'Leading Motorcycle Genuine Spares & Technical Hub',
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
    bankName: 'HDFC Bank Ltd',
    accountName: 'SRI BALAJI MOTORS AND SPARES',
    accountNumber: '50200012345678',
    ifsc: 'HDFC0000124',
    bankBranch: 'Anna Salai Branch, Chennai',
    financialYear: '2026-27',
    termsAndConditions: '1. Original bill required for warranty.\n2. No cash refunds.',
    footerText: 'Thank you for choosing Sri Balaji Motors!'
  };

  const validatedCompany = updateCompanySettingsSchema.parse(updateCompanyPayload);
  assert(validatedCompany.firmName.includes('HEADQUARTERS'), 'Zod validates company settings update');

  const updatedProfile = await adminService.updateCompanyProfile(validatedCompany as any, {
    username: 'superadmin'
  });
  assert(updatedProfile.firmName === updateCompanyPayload.firmName, 'Company profile successfully updated with audit');
  assert(updatedProfile.bankName === 'HDFC Bank Ltd', 'Banking details accurately saved (HDFC Bank)');

  // --------------------------------------------------------------------------
  console.log('\n--- Test 2: Multi-Branch Management & Isolation ---');
  // --------------------------------------------------------------------------
  const branches = await adminService.listBranches();
  assert(branches.length >= 1, `Discovered ${branches.length} registered branches`);
  assert(branches.some((b) => b.isMain === true), 'Main head office branch identified');

  const testCode = `BR-SLM-${Date.now().toString().slice(-4)}`;
  const newBranchPayload = {
    name: 'Salem Regional Spares Depot',
    code: testCode,
    address: '45, Junction Main Road, Meyyanur',
    city: 'Salem',
    state: 'Tamil Nadu',
    pinCode: '636004',
    contactPhone: '+91 98444 55667',
    contactEmail: 'salem@balajimotors.com',
    gstin: '33AABCU9603R1ZM',
    manager: 'R. Venkatesh',
    status: 'Active' as const,
    isMain: false
  };

  const validatedBranch = createBranchSchema.parse(newBranchPayload);
  const createdBranch = await adminService.createBranch(validatedBranch as any, { username: 'admin' });
  assert(createdBranch.code === testCode, `Salem regional branch created with unique code ${testCode}`);

  // --------------------------------------------------------------------------
  console.log('\n--- Test 3: Document Numbering Sequence Engine ---');
  // --------------------------------------------------------------------------
  const numberingConfigs = await adminService.getNumberingConfigs();
  assert(numberingConfigs.length === 8, '8 document numbering sequences configured (Invoices, POs, Receipts, etc.)');

  const invoiceConfig = numberingConfigs.find((c) => c.docType === 'Sales Invoice')!;
  assert(invoiceConfig.prefix === 'INV', 'Sales invoice prefix configured as INV');
  assert(invoiceConfig.financialYear === '2026-27', 'Financial Year configured as 2026-27');

  // Test atomic document numbering generation
  const doc1 = await adminService.getNextDocumentNumber('Sales Invoice');
  const doc2 = await adminService.getNextDocumentNumber('Sales Invoice');
  assert(doc1.startsWith('INV/2026-27/'), `Generated atomic sequence doc1: ${doc1}`);
  assert(doc2.startsWith('INV/2026-27/'), `Generated atomic sequence doc2: ${doc2}`);
  assert(doc1 !== doc2, 'Prevents duplicate document numbers (Atomic increment)');

  const receiptDoc = await adminService.getNextDocumentNumber('Receipt');
  assert(receiptDoc.startsWith('RCT/2026-27/'), `Receipt voucher numbered correctly: ${receiptDoc}`);

  // --------------------------------------------------------------------------
  console.log('\n--- Test 4: Invoice Templates & Visual Layout Customizer ---');
  // --------------------------------------------------------------------------
  const templates = await adminService.getInvoiceTemplates();
  assert(templates.length === 4, '4 invoice template layouts available (A4, A5, Thermal 80mm, 4-in-1)');

  const a4Tmpl = templates.find((t) => t.format === 'A4')!;
  assert(a4Tmpl.showLogo === true && a4Tmpl.showGstColumns === true, 'A4 Tax Invoice has Logo and GST breakdown enabled');

  const thermalTmpl = templates.find((t) => t.format === 'Thermal')!;
  assert(thermalTmpl.showBankDetails === false, 'Thermal 80mm roll disables bank details to conserve receipt roll space');

  const updatedA4 = await adminService.updateInvoiceTemplate(
    a4Tmpl.id!,
    { headerTitle: 'ORIGINAL TAX INVOICE (FOR RECIPIENT)' },
    { username: 'admin' }
  );
  assert(updatedA4.headerTitle === 'ORIGINAL TAX INVOICE (FOR RECIPIENT)', 'Invoice template updated and persisted');

  // --------------------------------------------------------------------------
  console.log('\n--- Test 5: Hardware & Printer Settings ---');
  // --------------------------------------------------------------------------
  const printerConfig = await adminService.getPrinterSettings();
  assert(printerConfig.paperSize === 'A4', 'Default paper size configured as A4');
  assert(printerConfig.autoPrint === true, 'Auto-print on save is enabled');

  const testPrintResult = await adminService.testPrint('thermal');
  assert(testPrintResult.success === true, 'Thermal test print signal dispatched successfully');
  assert(testPrintResult.testJobId.startsWith('PRN-TEST-'), 'Generated test print tracking job ID');

  // --------------------------------------------------------------------------
  console.log('\n--- Test 6: Database Backup Engine & SHA-256 Checksum ---');
  // --------------------------------------------------------------------------
  const newBackup = await backupService.createBackup({
    username: 'superadmin',
    type: 'Manual',
    notes: 'End of month financial close snapshot'
  });

  assert(newBackup.status === 'Completed', 'Database backup completed successfully');
  assert(newBackup.filename.startsWith('bike_erp_backup_manual_'), `Backup file generated: ${newBackup.filename}`);
  assert(newBackup.checksum.length === 64, `Generated SHA-256 checksum (${newBackup.checksum.substring(0, 16)}...)`);
  assert(newBackup.fileSizeBytes > 0, `Backup size verified: ${newBackup.size}`);

  const backupList = await backupService.listBackups();
  assert(backupList.length >= 1, `Backup history retrieved with ${backupList.length} snapshot records`);

  // --------------------------------------------------------------------------
  console.log('\n--- Test 7: Controlled Restore Workflow & Safety Snapshot Pre-flight ---');
  // --------------------------------------------------------------------------
  // Safety check 1: Reject incorrect confirmation phrase
  let rejectedRestore = false;
  try {
    await backupService.restoreBackup({
      backupId: newBackup.id,
      userId: 'user-01',
      username: 'superadmin',
      confirmationPhrase: 'WRONG_PHRASE',
      reason: 'Testing bad restore attempt'
    });
  } catch (err: any) {
    rejectedRestore = true;
    assert(err.statusCode === 400, 'Rejects restore with invalid confirmation phrase');
  }
  assert(rejectedRestore, 'Guard successfully blocked unauthorized restore request');

  // Safety check 2: Valid restore with exact token & pre-restore safety snapshot
  const restoreResult = await backupService.restoreBackup({
    backupId: newBackup.id,
    userId: 'user-01',
    username: 'superadmin',
    confirmationPhrase: 'RESTORE_DATABASE_PROCEED',
    reason: 'Routine DR Disaster Recovery Drill'
  });
  assert(restoreResult.success === true, 'Database restored safely under Super Admin authorization');
  assert(restoreResult.safetySnapshotCreated === true, 'Pre-restore safety snapshot automatically created before overwrite');

  // --------------------------------------------------------------------------
  console.log('\n--- Test 8: Comprehensive Audit Logging & Activity Timeline ---');
  // --------------------------------------------------------------------------
  await auditService.logEvent({
    username: 'billing_op1',
    action: 'Part Selling Rate Modified',
    module: 'Inventory',
    entity: 'ItemPrice',
    entityId: 'ITEM-CLUTCH-01',
    previousValue: { sellingRate: 850 },
    newValue: { sellingRate: 900 },
    notes: 'Rate updated due to raw material price inflation',
    severity: 'WARNING',
    ipAddress: '192.168.1.55',
    userAgent: 'BIKE-ERP-Desktop/Win11'
  });

  const auditQuery = await auditService.getAuditLogs({ module: 'Inventory', limit: 10 });
  assert(auditQuery.logs.length >= 1, 'Audit log engine retrieved inventory rate change records');

  const timeline = await auditService.getActivityTimeline(20);
  assert(timeline.length >= 1, `System activity timeline generated with ${timeline.length} events`);
  assert(timeline[0].timeFormatted !== '', 'Timeline entries feature relative timestamp (e.g. Just now)');

  // --------------------------------------------------------------------------
  console.log('\n--- Test 9: Security Settings & Policies ---');
  // --------------------------------------------------------------------------
  const initialSecurity = await adminService.getSecuritySettings();
  assert(initialSecurity.sessionTimeoutMinutes === 30, 'Default session timeout is 30 minutes');
  assert(initialSecurity.passwordPolicy.minLength === 8, 'Password minimum length is 8 characters');
  assert(initialSecurity.loginAttemptLimit === 5, 'Account lockout threshold is 5 attempts');

  const updateSecPayload = {
    sessionTimeoutMinutes: 15,
    passwordPolicy: {
      minLength: 10,
      requireUppercase: true,
      requireNumber: true,
      requireSpecialChar: true,
      expiryDays: 60
    },
    loginAttemptLimit: 3,
    requirePasswordChange: true,
    allowMultipleSessions: false,
    autoLogout: true,
    auditLoggingEnabled: true
  };

  const validatedSec = securitySettingsSchema.parse(updateSecPayload);
  const updatedSecurity = await adminService.updateSecuritySettings(validatedSec as any, { username: 'superadmin' });
  assert(updatedSecurity.sessionTimeoutMinutes === 15, 'Session timeout successfully updated to 15 min');
  assert(updatedSecurity.loginAttemptLimit === 3, 'Lockout limit set to 3 attempts');

  // --------------------------------------------------------------------------
  console.log('\n--- Test 10: Danger Zone Destructive Operations Guard ---');
  // --------------------------------------------------------------------------
  // Block non-super-admin
  let blockedBillingOp = false;
  try {
    await adminService.clearTestData({
      confirmationPhrase: 'CLEAR_TEST_DATA_CONFIRMED',
      retainMasters: true,
      reason: 'Sanitizing training dataset',
      userContext: { username: 'cashier1', userRole: 'BILLING_OPERATOR' }
    });
  } catch (err: any) {
    blockedBillingOp = true;
    assert(err.statusCode === 403, 'Billing operator blocked from clearing test data (HTTP 403)');
  }
  assert(blockedBillingOp, 'Danger zone successfully protected against unauthorized roles');

  // Authorized Super Admin execution
  const clearResult = await adminService.clearTestData({
    confirmationPhrase: 'CLEAR_TEST_DATA_CONFIRMED',
    retainMasters: true,
    reason: 'Pre-production database sanitation',
    userContext: { username: 'superadmin', userRole: 'SUPER_ADMIN' }
  });
  assert(clearResult.success === true, 'Transactional test data cleared safely while preserving master catalogs');

  console.log('\n======================================================');
  console.log(`  ADMIN & SYSTEM MANAGEMENT TEST SUMMARY: ${passedTests} PASSED | ${failedTests} FAILED`);
  console.log('======================================================\n');
}

runAdminManagementTestSuite().catch((err) => {
  console.error('Fatal error during Admin test suite execution:', err);
  process.exit(1);
});
