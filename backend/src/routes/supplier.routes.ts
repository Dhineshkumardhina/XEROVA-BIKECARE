import { Router } from 'express';
import { supplierController } from '../controllers/supplier.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/authorize.js';

const router = Router();

router.use(authenticate);

router.get('/search', requirePermission('purchase.view', 'purchase.create', 'inventory.view'), supplierController.search);
router.get('/:id', requirePermission('purchase.view'), supplierController.getById);
router.get('/', requirePermission('purchase.view'), supplierController.search);

router.post('/', requirePermission('purchase.create', 'purchase.edit'), supplierController.create);
router.put('/:id', requirePermission('purchase.edit'), supplierController.update);
router.patch('/:id/status', requirePermission('purchase.edit'), supplierController.toggleStatus);

export default router;
