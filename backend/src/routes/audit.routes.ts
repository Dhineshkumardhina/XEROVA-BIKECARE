import { Router } from 'express';
import { auditController } from '../controllers/audit.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/authorize.js';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission('admin.audit.view', 'admin.audit_logs'), auditController.getLogs);

export default router;

