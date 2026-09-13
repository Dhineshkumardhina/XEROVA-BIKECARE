import { Router } from 'express';
import { quotationController } from '../controllers/quotation.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/authorize.js';

const router = Router();

router.use(authenticate);

router.get('/search', requirePermission('sales.view'), quotationController.search);
router.get('/:id', requirePermission('sales.view'), quotationController.getById);
router.get('/', requirePermission('sales.view'), quotationController.search);

router.post('/:id/duplicate', requirePermission('sales.create'), quotationController.duplicate);
router.post('/convert', requirePermission('sales.create'), quotationController.convertToInvoice);
router.post('/', requirePermission('sales.create'), quotationController.create);

export default router;
