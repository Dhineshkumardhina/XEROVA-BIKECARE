import { prisma } from '../config/database.js';
import { CreateUserInput, UpdateUserInput, CreateRoleInput, UpdateRoleInput } from '../validators/user.validator.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { RecordStatus, UserRoleType, AuditSeverity } from '@prisma/client';
import { recordAuditLog } from '../middleware/auditLogger.js';

export interface UserListFilter {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: string;
  role?: string;
  branchId?: string;
  status?: RecordStatus;
}

export class UserService {
  /**
   * List users with search, role/branch/status filtering and pagination.
   */
  async listUsers(filter: UserListFilter = {}) {
    const page = filter.page && filter.page > 0 ? Number(filter.page) : 1;
    const limit = filter.limit && filter.limit > 0 ? Number(filter.limit) : 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filter.search) {
      const search = filter.search.trim();
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (filter.roleId) {
      where.roleId = filter.roleId;
    }

    if (filter.role) {
      where.role = { name: filter.role as UserRoleType };
    }

    if (filter.branchId) {
      where.branchId = filter.branchId;
    }

    if (filter.status) {
      where.status = filter.status;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          role: true,
          branch: true
        }
      }),
      prisma.user.count({ where })
    ]);

    const sanitized = users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      fullName: u.fullName,
      phone: u.phone,
      roleId: u.roleId,
      role: u.role.name,
      roleDisplayName: u.role.displayName,
      branchId: u.branchId,
      branch: u.branch?.name || 'All Branches',
      status: u.status,
      failedAttempts: u.failedAttempts,
      lockedUntil: u.lockedUntil,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt
    }));

    return {
      users: sanitized,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get single user by ID with role & branch
   */
  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true }
            }
          }
        },
        branch: true
      }
    });

    if (!user) throw { statusCode: 404, message: 'User not found' };

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      roleId: user.roleId,
      role: user.role.name,
      roleDisplayName: user.role.displayName,
      branchId: user.branchId,
      branch: user.branch?.name || 'All Branches',
      status: user.status,
      permissions: user.role.permissions.map((rp) => rp.permission.code),
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt
    };
  }

  /**
   * Create a new user with password hash and audit logging.
   */
  async createUser(input: CreateUserInput, actor?: { userId: string; username: string; role?: string }) {
    // Check privilege escalation: Only SUPER_ADMIN can assign the SUPER_ADMIN role
    const targetRole = await prisma.role.findUnique({ where: { id: input.roleId } });
    if (targetRole && targetRole.name === UserRoleType.SUPER_ADMIN && actor?.role !== 'SUPER_ADMIN') {
      throw { statusCode: 403, message: 'Permission Denied: Only a Super Admin can create Super Admin accounts.', code: 'FORBIDDEN' };
    }

    // Check unique username and email
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ username: input.username }, { email: input.email }]
      }
    });

    if (existing) {
      if (existing.username === input.username) {
        throw { statusCode: 400, message: 'Username is already taken' };
      }
      throw { statusCode: 400, message: 'Email is already registered' };
    }

    const passwordHash = await hashPassword(input.password);
    const user = await prisma.user.create({
      data: {
        username: input.username,
        email: input.email,
        fullName: input.fullName,
        phone: input.phone || null,
        passwordHash,
        roleId: input.roleId,
        branchId: input.branchId || null,
        status: input.status || RecordStatus.ACTIVE
      },
      include: { role: true, branch: true }
    });

    if (actor) {
      await recordAuditLog({
        userId: actor.userId,
        username: actor.username,
        action: 'User Created',
        module: 'Admin',
        entity: 'User',
        entityId: user.id,
        newValue: JSON.stringify({
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          role: user.role.name,
          status: user.status
        }),
        notes: `Created new user account '${user.username}' with role '${user.role.displayName}'`,
        severity: AuditSeverity.INFO
      });
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role.name,
      roleDisplayName: user.role.displayName,
      branch: user.branch?.name || 'All Branches',
      status: user.status
    };
  }

  /**
   * Update user details and record audit log.
   */
  async updateUser(id: string, input: UpdateUserInput, actor?: { userId: string; username: string; role?: string }) {
    const existing = await prisma.user.findUnique({
      where: { id },
      include: { role: true }
    });
    if (!existing) throw { statusCode: 404, message: 'User not found' };

    // Prevent non-SUPER_ADMIN from elevating any user to SUPER_ADMIN
    if (input.roleId && input.roleId !== existing.roleId) {
      const targetRole = await prisma.role.findUnique({ where: { id: input.roleId } });
      if (targetRole && targetRole.name === UserRoleType.SUPER_ADMIN && actor?.role !== 'SUPER_ADMIN') {
        throw { statusCode: 403, message: 'Permission Denied: Only a Super Admin can assign the Super Admin role.', code: 'FORBIDDEN' };
      }
    }

    // Prevent changing role if this is the only active SUPER_ADMIN
    if (input.roleId && input.roleId !== existing.roleId && existing.role.name === UserRoleType.SUPER_ADMIN) {
      const superAdminCount = await prisma.user.count({
        where: {
          role: { name: UserRoleType.SUPER_ADMIN },
          status: RecordStatus.ACTIVE
        }
      });
      if (superAdminCount <= 1) {
        throw { statusCode: 400, message: 'Cannot demote the sole active Super Admin user.' };
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        fullName: input.fullName,
        email: input.email,
        phone: input.phone !== undefined ? input.phone : undefined,
        roleId: input.roleId,
        branchId: input.branchId !== undefined ? input.branchId : undefined,
        status: input.status
      },
      include: { role: true, branch: true }
    });

    if (actor) {
      await recordAuditLog({
        userId: actor.userId,
        username: actor.username,
        action: 'User Updated',
        module: 'Admin',
        entity: 'User',
        entityId: updated.id,
        previousValue: JSON.stringify({
          fullName: existing.fullName,
          email: existing.email,
          roleId: existing.roleId,
          status: existing.status
        }),
        newValue: JSON.stringify({
          fullName: updated.fullName,
          email: updated.email,
          roleId: updated.roleId,
          status: updated.status
        }),
        notes: `Updated user profile for '${updated.username}'`,
        severity: AuditSeverity.INFO
      });
    }

    return {
      id: updated.id,
      username: updated.username,
      email: updated.email,
      fullName: updated.fullName,
      role: updated.role.name,
      roleDisplayName: updated.role.displayName,
      branch: updated.branch?.name || 'All Branches',
      status: updated.status
    };
  }

  /**
   * Toggle user active/inactive status with safeguard against deactivating sole Super Admin.
   */
  async toggleUserStatus(id: string, actor?: { userId: string; username: string; role?: UserRoleType }) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { role: true }
    });
    if (!user) throw { statusCode: 404, message: 'User not found' };

    if (user.role.name === UserRoleType.SUPER_ADMIN && actor && actor.role !== UserRoleType.SUPER_ADMIN) {
      throw { statusCode: 403, message: 'Only Super Administrators can modify Super Administrator status.' };
    }

    const newStatus = user.status === RecordStatus.ACTIVE ? RecordStatus.INACTIVE : RecordStatus.ACTIVE;

    // Protection for super admin
    if (user.role.name === UserRoleType.SUPER_ADMIN && newStatus === RecordStatus.INACTIVE) {
      const activeSuperAdmins = await prisma.user.count({
        where: {
          role: { name: UserRoleType.SUPER_ADMIN },
          status: RecordStatus.ACTIVE
        }
      });
      if (activeSuperAdmins <= 1) {
        throw { statusCode: 400, message: 'Cannot deactivate the sole active Super Admin account.' };
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status: newStatus },
      include: { role: true }
    });

    // Revoke refresh tokens if user is deactivated
    if (newStatus === RecordStatus.INACTIVE) {
      await prisma.refreshToken.updateMany({
        where: { userId: id, isRevoked: false },
        data: { isRevoked: true }
      });
    }

    if (actor) {
      await recordAuditLog({
        userId: actor.userId,
        username: actor.username,
        action: newStatus === RecordStatus.ACTIVE ? 'User Activated' : 'User Deactivated',
        module: 'Admin',
        entity: 'User',
        entityId: updated.id,
        notes: `Changed status of '${updated.username}' from ${user.status} to ${newStatus}`,
        severity: AuditSeverity.WARNING
      });
    }

    return {
      id: updated.id,
      username: updated.username,
      status: updated.status
    };
  }

  /**
   * Administrative reset of user password.
   */
  async resetPassword(id: string, newPass: string, actor?: { userId: string; username: string; role?: UserRoleType }) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { role: true }
    });
    if (!user) throw { statusCode: 404, message: 'User not found' };

    if (user.role.name === UserRoleType.SUPER_ADMIN && actor && actor.role !== UserRoleType.SUPER_ADMIN) {
      throw { statusCode: 403, message: 'Only Super Administrators can reset passwords for Super Administrator accounts.' };
    }

    const passwordHash = await hashPassword(newPass);
    const updated = await prisma.user.update({
      where: { id },
      data: { passwordHash, failedAttempts: 0, lockedUntil: null }
    });

    // Invalidate old refresh tokens
    await prisma.refreshToken.updateMany({
      where: { userId: id, isRevoked: false },
      data: { isRevoked: true }
    });

    if (actor) {
      await recordAuditLog({
        userId: actor.userId,
        username: actor.username,
        action: 'Password Reset',
        module: 'Admin',
        entity: 'User',
        entityId: user.id,
        notes: `Admin password reset for user '${user.username}'`,
        severity: AuditSeverity.WARNING
      });
    }

    return { id: updated.id, username: updated.username, message: 'Password reset successfully' };
  }

  /**
   * Self password change by authenticated user.
   */
  async changePassword(userId: string, oldPass: string, newPass: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw { statusCode: 404, message: 'User not found' };

    const isMatch = await comparePassword(oldPass, user.passwordHash);
    if (!isMatch) {
      throw { statusCode: 400, message: 'Current password is incorrect' };
    }

    const passwordHash = await hashPassword(newPass);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });

    // Invalidate all active sessions across all devices upon password change
    await prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true }
    });

    await recordAuditLog({
      userId: user.id,
      username: user.username,
      action: 'Password Changed',
      module: 'Security',
      entity: 'User',
      entityId: user.id,
      notes: `User '${user.username}' changed their own account password`,
      severity: AuditSeverity.INFO
    });

    return { message: 'Password changed successfully' };
  }

  /**
   * List all roles with attached permissions and user count.
   */
  async listRoles() {
    const roles = await prisma.role.findMany({
      orderBy: { createdAt: 'asc' },
      include: {
        permissions: {
          include: { permission: true }
        },
        _count: {
          select: { users: true }
        }
      }
    });

    return roles.map((r) => ({
      id: r.id,
      name: r.name,
      displayName: r.displayName,
      description: r.description,
      isSystem: r.isSystem,
      userCount: r._count.users,
      permissions: r.permissions.map((rp) => rp.permission.code)
    }));
  }

  /**
   * Update role permissions matrix.
   * Protects SUPER_ADMIN role against accidental removal of essential permissions.
   */
  async updateRolePermissions(roleId: string, permissionCodes: string[], actor?: { userId: string; username: string }) {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: { permissions: { include: { permission: true } } }
    });

    if (!role) throw { statusCode: 404, message: 'Role not found' };

    // Prevent stripping Super Admin permissions
    if (role.name === UserRoleType.SUPER_ADMIN) {
      const allPermissions = await prisma.permission.findMany();
      if (permissionCodes.length < allPermissions.length) {
        throw {
          statusCode: 400,
          message: 'Cannot restrict or remove permissions from the Super Admin role.'
        };
      }
    }

    // Resolve permission IDs from codes
    const permissions = await prisma.permission.findMany({
      where: { code: { in: permissionCodes } }
    });

    // Delete existing mappings
    await prisma.rolePermission.deleteMany({
      where: { roleId }
    });

    // Create new mappings
    if (permissions.length > 0) {
      await prisma.rolePermission.createMany({
        data: permissions.map((p) => ({
          roleId,
          permissionId: p.id
        }))
      });
    }

    if (actor) {
      await recordAuditLog({
        userId: actor.userId,
        username: actor.username,
        action: 'Role Permissions Modified',
        module: 'Admin',
        entity: 'Role',
        entityId: role.id,
        notes: `Updated permissions for role '${role.displayName}' (${permissions.length} permissions assigned)`,
        severity: AuditSeverity.WARNING
      });
    }

    return {
      roleId: role.id,
      roleName: role.name,
      assignedPermissions: permissions.map((p) => p.code)
    };
  }

  /**
   * List all available permissions in the system.
   */
  async listPermissions() {
    return await prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { code: 'asc' }]
    });
  }

  /**
   * Get user activity audit logs.
   */
  async getUserActivity(userId?: string, username?: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (userId) where.userId = userId;
    if (username) where.username = username;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.auditLog.count({ where })
    ]);

    return {
      activities: logs,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
  }
}

export const userService = new UserService();

