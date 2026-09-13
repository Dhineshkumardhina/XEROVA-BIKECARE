import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/login', authRateLimiter, authController.login);
router.post('/refresh', authController.refresh);
router.get('/me', authenticate, authController.me);
router.post('/change-password', authenticate, authController.changePassword);
router.post('/logout', authenticate, authController.logout);

export default router;

