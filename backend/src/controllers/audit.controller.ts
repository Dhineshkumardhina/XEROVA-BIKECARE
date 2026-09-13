import { Response, NextFunction } from 'express';
import { auditService } from '../services/audit.service.js';
import { sendSuccess } from '../utils/response.js';
import { AuthenticatedRequest } from '../types/index.js';

export class AuditController {
  async getLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { module, username, action, page, limit } = req.query;
      const result = await auditService.getAuditLogs({
        module: module as string,
        username: username as string,
        action: action as string,
        page: Number(page) || 1,
        limit: Number(limit) || 30
      });

      return sendSuccess(res, result.logs, 'Audit logs retrieved', 200, result.meta);
    } catch (error) {
      next(error);
    }
  }
}

export const auditController = new AuditController();
