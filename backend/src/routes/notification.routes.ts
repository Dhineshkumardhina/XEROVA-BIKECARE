import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

// GET /api/notifications
router.get('/', notificationController.getNotifications.bind(notificationController));

export default router;
