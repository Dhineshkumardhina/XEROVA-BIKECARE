import { Router } from 'express';
import { stockController } from '../controllers/stock.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/authorize.js';

const router = Router();

router.use(authenticate);

router.get('/valuation', requirePermission('inventory.view', 'reports.inventory'), stockController.getValuation);
router.get('/movements', requirePermission('inventory.view', 'reports.inventory'), stockController.getMovements);
router.get('/movements/:id', requirePermission('inventory.view'), stockController.getMovementById);
router.get('/low-stock', requirePermission('inventory.view'), stockController.getLowStock);
router.get('/out-of-stock', requirePermission('inventory.view'), stockController.getOutOfStock);
router.get('/report', requirePermission('inventory.view', 'reports.inventory'), stockController.getReport);

router.post('/adjust', requirePermission('inventory.adjust', 'inventory.adjust_stock', 'inventory.edit'), stockController.adjust);

export default router;
