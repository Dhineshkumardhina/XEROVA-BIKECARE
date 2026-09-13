import { Response, NextFunction } from 'express';
import { UserRoleType } from '@prisma/client';
import { AuthenticatedRequest } from '../types/index.js';
import { sendForbidden, sendUnauthorized } from '../utils/response.js';

/**
 * Requires at least one of the specified granular permission codes (e.g. "sales.create", "inventory.adjust_stock")
 */
export const requirePermission = (...permissionCodes: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendUnauthorized(res);
    }

    // Super Admin has all permissions
    if (req.user.role === UserRoleType.SUPER_ADMIN) {
      return next();
    }

    const userPerms = req.user.permissions || [];
    const hasPermission = permissionCodes.some((code) => userPerms.includes(code));

    if (!hasPermission) {
      return sendForbidden(
        res,
        `Access denied: Missing required [${permissionCodes.join(' or ')}] operational permission`
      );
    }

    next();
  };
};

/**
 * Requires one of the specified roles
 */
export const requireRole = (allowedRoles: UserRoleType[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendUnauthorized(res);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendForbidden(
        res,
        `Access denied: Action requires role [${allowedRoles.join(', ')}]`
      );
    }

    next();
  };
};
