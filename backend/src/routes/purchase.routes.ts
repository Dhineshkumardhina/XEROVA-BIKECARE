import { Router } from 'express';
import { purchaseController } from '../controllers/purchase.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/authorize.js';

const router = Router();

router.use(authenticate);

router.get('/search', requirePermission('purchase.view', 'reports.purchase.view'), purchaseController.search);
router.get('/:id', requirePermission('purchase.view'), purchaseController.getById);
router.get('/', requirePermission('purchase.view'), purchaseController.search);

router.post('/returns', requirePermission('purchase.returns', 'purchase.edit', 'purchase.create'), purchaseController.createReturn);
router.post('/', requirePermission('purchase.create'), purchaseController.create);

export default router;
