import { Router } from 'express';
import { reportController } from '../controllers/report.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/authorize.js';

const router = Router();

router.use(authenticate);

// 1. Operational Sales Reports (Daily, Monthly, Customer, Item, Brand, Category, User, Payment Mode, GST)
router.get(
  '/sales',
  requirePermission('reports.view', 'sales.view'),
  reportController.getSalesReport
);

// 2. Purchase Reports (Daily, Monthly, Supplier, Item, Brand, Returns, GST ITC)
router.get(
  '/purchases',
  requirePermission('reports.view', 'purchases.view'),
  reportController.getPurchaseReport
);

// 3. Inventory & Valuation Reports (Current stock, Valuation, Fast/Slow/Dead stock, Low stock, Adjustments)
router.get(
  '/inventory',
  requirePermission('reports.view', 'inventory.view', 'items.view'),
  reportController.getInventoryReport
);

// 4. Profitability Analysis (Protected: Billing operators cannot access cost/margins)
router.get(
  '/profitability',
  requirePermission('accounts.financial.view', 'admin.all'),
  reportController.getProfitabilityReport
);

// 5. Formal Accounting & Financial Statements (Day Book, Cash Book, Bank Book, Trial Balance, P&L, Balance Sheet)
router.get(
  '/financial',
  requirePermission('accounts.financial.view', 'admin.all'),
  reportController.getFinancialReport
);

// 6. Operational Business Intelligence & Risk Insights
router.get(
  '/insights',
  requirePermission('reports.view', 'sales.view', 'admin.all'),
  reportController.getBusinessInsights
);

export default router;
