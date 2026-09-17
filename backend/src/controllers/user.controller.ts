import { Response, NextFunction } from 'express';
import { userService } from '../services/user.service.js';
import { sendCreated, sendSuccess } from '../utils/response.js';
import {
  createUserSchema,
  resetUserPasswordSchema,
  updateUserSchema,
  updateRolePermissionsSchema
} from '../validators/user.validator.js';
import { AuthenticatedRequest } from '../types/index.js';
import { RecordStatus } from '@prisma/client';

export class UserController {
  async listUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const search = req.query.search as string | undefined;
      const roleId = req.query.roleId as string | undefined;
      const role = req.query.role as string | undefined;
      const branchId = req.query.branchId as string | undefined;
      const status = req.query.status as RecordStatus | undefined;

      const result = await userService.listUsers({ page, limit, search, roleId, role, branchId, status });
      return sendSuccess(res, result.users, 'Users retrieved successfully', 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id);
      return sendSuccess(res, user, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validatedInput = createUserSchema.parse(req.body);
      const actor = req.user ? { userId: req.user.userId, username: req.user.username, role: req.user.role } : undefined;
      const user = await userService.createUser(validatedInput, actor);
      return sendCreated(res, user, `User @${user.username} created successfully`);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validatedInput = updateUserSchema.parse(req.body);
      const actor = req.user ? { userId: req.user.userId, username: req.user.username, role: req.user.role } : undefined;
      const user = await userService.updateUser(id, validatedInput, actor);
      return sendSuccess(res, user, `User updated successfully`);
    } catch (error) {
      next(error);
    }
  }

  async toggleStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const actor = req.user ? { userId: req.user.userId, username: req.user.username } : undefined;
      const user = await userService.toggleUserStatus(id, actor);
      return sendSuccess(res, user, `User status updated to ${user.status}`);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validatedInput = resetUserPasswordSchema.parse(req.body);
      const actor = req.user ? { userId: req.user.userId, username: req.user.username } : undefined;
      const result = await userService.resetPassword(id, validatedInput.newPassword, actor);
      return sendSuccess(res, result, 'User password reset successfully');
    } catch (error) {
      next(error);
    }
  }

  async listRoles(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const roles = await userService.listRoles();
      return sendSuccess(res, roles, 'Roles matrix retrieved');
    } catch (error) {
      next(error);
    }
  }

  async updateRolePermissions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validatedInput = updateRolePermissionsSchema.parse(req.body);
      const actor = req.user ? { userId: req.user.userId, username: req.user.username } : undefined;
      const result = await userService.updateRolePermissions(id, validatedInput.permissionCodes, actor);
      return sendSuccess(res, result, 'Role permissions updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async listPermissions(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const permissions = await userService.listPermissions();
      return sendSuccess(res, permissions, 'Permissions catalog retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getUserActivity(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 50;
      const result = await userService.getUserActivity(id, undefined, page, limit);
      return sendSuccess(res, result.activities, 'User activity logs retrieved', 200, result.meta);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();

