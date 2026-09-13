import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/authorize.js';

const router = Router();

router.use(authenticate);

// Users Management
router.get('/', requirePermission('admin.users.manage', 'admin.manage_users'), userController.listUsers);
router.post('/', requirePermission('admin.users.manage', 'admin.manage_users'), userController.createUser);
router.get('/roles', requirePermission('admin.roles.manage', 'admin.manage_roles', 'admin.users.manage', 'admin.manage_users'), userController.listRoles);
router.get('/permissions', requirePermission('admin.roles.manage', 'admin.manage_roles'), userController.listPermissions);
router.put('/roles/:id/permissions', requirePermission('admin.roles.manage', 'admin.manage_roles'), userController.updateRolePermissions);

router.get('/:id', requirePermission('admin.users.manage', 'admin.manage_users'), userController.getUserById);
router.put('/:id', requirePermission('admin.users.manage', 'admin.manage_users'), userController.updateUser);
router.patch('/:id/status', requirePermission('admin.users.manage', 'admin.manage_users'), userController.toggleStatus);
router.post('/:id/reset-password', requirePermission('admin.users.manage', 'admin.manage_users'), userController.resetPassword);
router.get('/:id/activity', requirePermission('admin.audit.view', 'admin.audit_logs', 'admin.users.manage', 'admin.manage_users'), userController.getUserActivity);

export default router;

