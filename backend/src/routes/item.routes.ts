import { Router } from 'express';
import { itemController } from '../controllers/item.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/authorize.js';

const router = Router();

router.use(authenticate);

router.get('/search', requirePermission('inventory.view'), itemController.search);
router.get('/barcode/:barcode', requirePermission('inventory.view'), itemController.getByBarcode);
router.get('/export/data', requirePermission('inventory.view', 'inventory.export'), itemController.exportItems);
router.get('/:id', requirePermission('inventory.view'), itemController.getById);
router.get('/', requirePermission('inventory.view'), itemController.search);

router.post('/import', requirePermission('inventory.create', 'inventory.import'), itemController.importItems);
router.post('/', requirePermission('inventory.create', 'inventory.create_item'), itemController.create);
router.put('/:id', requirePermission('inventory.edit', 'inventory.edit_item'), itemController.update);
router.patch('/:id/status', requirePermission('inventory.edit', 'inventory.edit_item'), itemController.toggleStatus);

export default router;


