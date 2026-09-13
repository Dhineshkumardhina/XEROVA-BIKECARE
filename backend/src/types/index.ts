import { Request } from 'express';
import { UserRoleType } from '@prisma/client';

export interface AuthenticatedUserPayload {
  userId: string;
  username: string;
  email: string;
  role: UserRoleType;
  roleDisplayName: string;
  branchId?: string | null;
  permissions: string[];
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUserPayload;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  code?: string;
  errors?: any;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    summary?: any;
    [key: string]: any;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
