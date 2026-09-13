import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/authorize.js';

const router = Router();

// Require authenticated user for all admin operations
router.use(authenticate);

// 1. Company Settings
router.get(
  '/company',
  requirePermission('admin.settings.view', 'admin.all', 'sales.create'),
  adminController.getCompanySettings.bind(adminController)
);

router.put(
  '/company',
  requirePermission('admin.settings.manage', 'admin.all'),
  adminController.updateCompanySettings.bind(adminController)
);

// 2. Multi-Branch Management
router.get(
  '/branches',
  requirePermission('admin.settings.view', 'admin.all', 'inventory.view'),
  adminController.listBranches.bind(adminController)
);

router.post(
  '/branches',
  requirePermission('admin.settings.manage', 'admin.all'),
  adminController.createBranch.bind(adminController)
);

router.post(
  '/branches/assign-user',
  requirePermission('admin.settings.manage', 'admin.all'),
  adminController.assignUserBranch.bind(adminController)
);

// 3. Document Numbering Configurations
router.get(
  '/numbering',
  requirePermission('admin.settings.view', 'admin.all'),
  adminController.getNumberingConfigs.bind(adminController)
);

router.put(
  '/numbering',
  requirePermission('admin.settings.manage', 'admin.all'),
  adminController.updateNumberingConfigs.bind(adminController)
);

router.get(
  '/numbering/next',
  requirePermission('sales.create', 'purchases.create', 'admin.settings.view', 'admin.all'),
  adminController.getNextDocumentNumber.bind(adminController)
);

// 4. Invoice Templates
router.get(
  '/templates',
  requirePermission('admin.settings.view', 'admin.all', 'sales.create'),
  adminController.getInvoiceTemplates.bind(adminController)
);

router.put(
  '/templates/:id',
  requirePermission('admin.settings.manage', 'admin.all'),
  adminController.updateInvoiceTemplate.bind(adminController)
);

// 5. Hardware & Printer Settings
router.get(
  '/printer',
  requirePermission('admin.settings.view', 'admin.all'),
  adminController.getPrinterSettings.bind(adminController)
);

router.put(
  '/printer',
  requirePermission('admin.settings.manage', 'admin.all'),
  adminController.updatePrinterSettings.bind(adminController)
);

router.post(
  '/printer/test-print',
  requirePermission('admin.settings.manage', 'admin.all'),
  adminController.testPrint.bind(adminController)
);

// 6. Backup & Restore Operations
router.get(
  '/backup',
  requirePermission('admin.backup', 'admin.all'),
  adminController.listBackups.bind(adminController)
);

router.post(
  '/backup',
  requirePermission('admin.backup', 'admin.all'),
  adminController.createBackup.bind(adminController)
);

router.post(
  '/restore',
  requirePermission('admin.restore', 'admin.all'),
  adminController.restoreBackup.bind(adminController)
);

// 7. System Activity Timeline
router.get(
  '/activity-timeline',
  requirePermission('audit.view', 'admin.settings.view', 'admin.all'),
  adminController.getActivityTimeline.bind(adminController)
);

// 8. Security Settings
router.get(
  '/security',
  requirePermission('admin.security.manage', 'admin.all'),
  adminController.getSecuritySettings.bind(adminController)
);

router.put(
  '/security',
  requirePermission('admin.security.manage', 'admin.all'),
  adminController.updateSecuritySettings.bind(adminController)
);

// 9. Danger Zone Actions
router.post(
  '/danger-zone/clear-test-data',
  requirePermission('admin.danger_zone', 'admin.all'),
  adminController.clearTestData.bind(adminController)
);

router.post(
  '/danger-zone/reset-config',
  requirePermission('admin.danger_zone', 'admin.all'),
  adminController.resetSystemConfig.bind(adminController)
);

export default router;
