import { Router } from 'express';
import { gstController } from '../controllers/gst.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/authorize.js';

const router = Router();

router.use(authenticate);

// 1. Centralized Backend Tax Calculation (Used by POS, Quotations, Sales, Purchases)
router.post(
  '/calculate-tax',
  requirePermission('sales.create', 'purchases.create', 'quotations.create', 'reports.view'),
  gstController.calculateTax
);

// 2. GSTR-1 structured generation
router.get(
  '/gstr-1',
  requirePermission('reports.view', 'accounts.financial.view', 'sales.view'),
  gstController.getGstr1
);

// 3. GSTR-3B structured summary & ITC
router.get(
  '/gstr-3b',
  requirePermission('reports.view', 'accounts.financial.view'),
  gstController.getGstr3b
);

// 4. GST Validation and Audit Health Check
router.get(
  '/validate',
  requirePermission('reports.view', 'accounts.financial.view'),
  gstController.validateRecords
);

// 5. GST Return Period Status
router.get(
  '/period-status',
  requirePermission('reports.view', 'accounts.financial.view'),
  gstController.getPeriodStatus
);

// 6. Lock Period (Finalize Filing)
router.post(
  '/lock-period',
  requirePermission('accounts.financial.view', 'admin.all'),
  gstController.lockPeriod
);

// 7. Unlock Period (Admin Only)
router.post(
  '/unlock-period',
  requirePermission('admin.all'),
  gstController.unlockPeriod
);

// 8. Tax Rates Master
router.get(
  '/rates',
  requirePermission('sales.view', 'items.view', 'reports.view'),
  gstController.getRates
);

router.post(
  '/rates',
  requirePermission('admin.all', 'items.create'),
  gstController.createRate
);

// 9. GSTIN Verification helper
router.post(
  '/validate-gstin',
  requirePermission('sales.create', 'purchases.create', 'customers.create'),
  gstController.validateGstin
);

export default router;
