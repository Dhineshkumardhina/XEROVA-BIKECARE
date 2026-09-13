import { z } from 'zod';
import { UserRoleType, RecordStatus } from '@prisma/client';

export const createUserSchema = z.object({
  username: z.string().min(3).max(50).trim().toLowerCase(),
  email: z.string().email('Valid email is required').trim().toLowerCase(),
  fullName: z.string().min(2).max(100).trim(),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  roleId: z.string().uuid('Valid role UUID is required'),
  branchId: z.string().uuid().optional().nullable(),
  status: z.nativeEnum(RecordStatus).default(RecordStatus.ACTIVE)
});

export const updateUserSchema = z.object({
  fullName: z.string().min(2).max(100).trim().optional(),
  email: z.string().email().trim().toLowerCase().optional(),
  phone: z.string().optional().nullable(),
  roleId: z.string().uuid().optional(),
  branchId: z.string().uuid().optional().nullable(),
  status: z.nativeEnum(RecordStatus).optional()
});

export const resetUserPasswordSchema = z.object({
  newPassword: z.string().min(6, 'New password must be at least 6 characters')
});

export const updateRolePermissionsSchema = z.object({
  permissionCodes: z.array(z.string()).min(0)
});

export const createRoleSchema = z.object({
  name: z.nativeEnum(UserRoleType),
  displayName: z.string().min(2).max(100).trim(),
  description: z.string().max(255).optional(),
  permissionCodes: z.array(z.string()).default([])
});

export const updateRoleSchema = z.object({
  displayName: z.string().min(2).max(100).trim().optional(),
  description: z.string().max(255).optional()
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ResetUserPasswordInput = z.infer<typeof resetUserPasswordSchema>;
export type UpdateRolePermissionsInput = z.infer<typeof updateRolePermissionsSchema>;
export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;

