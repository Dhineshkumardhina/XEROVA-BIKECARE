import { Response, NextFunction } from 'express';
import { AuditSeverity } from '@prisma/client';
import { prisma } from '../config/database.js';
import { AuthenticatedRequest } from '../types/index.js';
import { sanitizeUuid } from '../utils/uuid.js';

export interface AuditLogParams {
  userId?: string;
  username: string;
  action: string;
  module: string;
  entity: string;
  entityId?: string;
  previousValue?: any;
  newValue?: any;
  notes?: string;
  severity?: AuditSeverity;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Service method to record an immutable audit log entry in PostgreSQL
 */
export const recordAuditLog = async (params: AuditLogParams): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: sanitizeUuid(params.userId),
        username: params.username,
        action: params.action,
        module: params.module,
        entity: params.entity,
        entityId: params.entityId,
        previousValue: params.previousValue,
        newValue: params.newValue,
        notes: params.notes,
        severity: params.severity || AuditSeverity.INFO,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent
      }
    });
  } catch (error) {
    console.error('❌ Failed to record audit log:', error);
  }
};

/**
 * Express middleware helper to automatically attach audit logger to the request
 */
export const auditLoggerMiddleware = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  (req as any).logAudit = async (action: string, module: string, entity: string, entityId?: string, notes?: string, severity?: AuditSeverity) => {
    const username = req.user?.username || 'Anonymous';
    const userId = req.user?.userId;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    await recordAuditLog({
      userId,
      username,
      action,
      module,
      entity,
      entityId,
      notes,
      severity,
      ipAddress,
      userAgent
    });
  };

  next();
};
