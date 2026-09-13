import { Router } from 'express';
import { saleController } from '../controllers/sale.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/authorize.js';

const router = Router();

router.use(authenticate);

router.get('/search', requirePermission('sales.view', 'reports.sales.view'), saleController.search);
router.get('/held-bills', requirePermission('sales.create', 'sales.view'), saleController.getHeldBills);
router.delete('/held-bills/:id', requirePermission('sales.create', 'sales.edit'), saleController.deleteHeldBill);
router.get('/:id', requirePermission('sales.view'), saleController.getById);
router.get('/', requirePermission('sales.view'), saleController.search);

router.post('/returns', requirePermission('sales.returns', 'sales.edit', 'sales.create'), saleController.createReturn);
router.post('/', requirePermission('sales.create'), saleController.create);

export default router;
