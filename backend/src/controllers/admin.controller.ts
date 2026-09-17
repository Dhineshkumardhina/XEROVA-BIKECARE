import { Request, Response } from 'express';
import { adminService } from '../services/admin.service.js';
import { backupService } from '../services/backup.service.js';
import { auditService } from '../services/audit.service.js';
import {
  updateCompanySettingsSchema,
  createBranchSchema,
  bulkUpdateNumberingSchema,
  invoiceTemplateSchema,
  printerSettingsSchema,
  securitySettingsSchema,
  restoreDatabaseSchema,
  clearTestDataSchema,
  resetConfigSchema
} from '../validators/admin.validator.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

export class AdminController {
  // ============================================================================
  // 1. COMPANY SETTINGS
  // ============================================================================

  async getCompanySettings(_req: Request, res: Response) {
    const profile = await adminService.getCompanyProfile();
    return sendSuccess(res, profile, 'Company profile retrieved successfully');
  }

  async updateCompanySettings(req: Request, res: Response) {
    const validatedData = updateCompanySettingsSchema.parse(req.body);
    const user = (req as any).user;
    const userContext = {
      userId: user?.id,
      username: user?.username || 'admin'
    };

    const updated = await adminService.updateCompanyProfile(validatedData as any, userContext);
    return sendSuccess(res, updated, 'Company settings updated successfully');
  }

  // ============================================================================
  // 2. BRANCH MANAGEMENT
  // ============================================================================

  async listBranches(_req: Request, res: Response) {
    const branches = await adminService.listBranches();
    return sendSuccess(res, branches, 'Branches retrieved successfully');
  }

  async createBranch(req: Request, res: Response) {
    const validatedData = createBranchSchema.parse(req.body);
    const user = (req as any).user;
    const userContext = {
      userId: user?.id,
      username: user?.username || 'admin'
    };

    const branch = await adminService.createBranch(validatedData as any, userContext);
    return sendCreated(res, branch, 'Branch created successfully');
  }

  async assignUserBranch(req: Request, res: Response) {
    const { userId, branchId } = req.body;
    const user = (req as any).user;
    const userContext = {
      userId: user?.id,
      username: user?.username || 'admin'
    };

    const result = await adminService.assignUserToBranch(userId, branchId, userContext);
    return sendSuccess(res, result, 'User assigned to branch successfully');
  }

  // ============================================================================
  // 3. DOCUMENT NUMBERING
  // ============================================================================

  async getNumberingConfigs(_req: Request, res: Response) {
    const configs = await adminService.getNumberingConfigs();
    return sendSuccess(res, configs, 'Numbering sequences retrieved successfully');
  }

  async updateNumberingConfigs(req: Request, res: Response) {
    const validatedData = bulkUpdateNumberingSchema.parse(req.body);
    const user = (req as any).user;
    const userContext = {
      userId: user?.id,
      username: user?.username || 'admin'
    };

    const updated = await adminService.updateNumberingConfigs(validatedData as any, userContext);
    return sendSuccess(res, updated, 'Numbering configurations updated successfully');
  }

  async getNextDocumentNumber(req: Request, res: Response) {
    const docType = req.query.docType as any;
    const nextNumber = await adminService.getNextDocumentNumber(docType || 'Sales Invoice');
    return sendSuccess(res, { docType, nextNumber }, 'Next document number generated');
  }

  // ============================================================================
  // 4. INVOICE TEMPLATES
  // ============================================================================

  async getInvoiceTemplates(_req: Request, res: Response) {
    const templates = await adminService.getInvoiceTemplates();
    return sendSuccess(res, templates, 'Invoice templates retrieved successfully');
  }

  async updateInvoiceTemplate(req: Request, res: Response) {
    const { id } = req.params;
    const validatedData = invoiceTemplateSchema.partial().parse(req.body);
    const user = (req as any).user;
    const userContext = {
      userId: user?.id,
      username: user?.username || 'admin'
    };

    const updated = await adminService.updateInvoiceTemplate(id, validatedData as any, userContext);
    return sendSuccess(res, updated, 'Invoice template updated successfully');
  }

  // ============================================================================
  // 5. PRINTER SETTINGS & TEST PRINT
  // ============================================================================

  async getPrinterSettings(_req: Request, res: Response) {
    const settings = await adminService.getPrinterSettings();
    return sendSuccess(res, settings, 'Printer settings retrieved successfully');
  }

  async updatePrinterSettings(req: Request, res: Response) {
    const validatedData = printerSettingsSchema.partial().parse(req.body);
    const user = (req as any).user;
    const userContext = {
      userId: user?.id,
      username: user?.username || 'admin'
    };

    const updated = await adminService.updatePrinterSettings(validatedData as any, userContext);
    return sendSuccess(res, updated, 'Printer settings updated successfully');
  }

  async testPrint(req: Request, res: Response) {
    const printerType = (req.body.printerType || 'default') as 'default' | 'a4' | 'thermal';
    const result = await adminService.testPrint(printerType);
    return sendSuccess(res, result, 'Test print job sent');
  }

  // ============================================================================
  // 6. BACKUP & RESTORE
  // ============================================================================

  async createBackup(req: Request, res: Response) {
    const user = (req as any).user;
    const userContext = {
      userId: user?.id,
      username: user?.username || 'admin',
      type: (req.body.type || 'Manual') as any
    };

    const backup = await backupService.createBackup(userContext);
    return sendCreated(res, backup, 'Database backup created successfully');
  }

  async listBackups(_req: Request, res: Response) {
    const backups = await backupService.listBackups();
    return sendSuccess(res, backups, 'Backup history retrieved successfully');
  }

  async restoreBackup(req: Request, res: Response) {
    const validatedData = restoreDatabaseSchema.parse(req.body);
    const user = (req as any).user;
    const userContext = {
      backupId: validatedData.backupId,
      userId: user?.id || 'admin-id',
      username: user?.username || 'admin',
      confirmationPhrase: validatedData.confirmationPhrase,
      reason: validatedData.reason
    };

    const result = await backupService.restoreBackup(userContext);
    return sendSuccess(res, result, 'Database restore operation completed successfully');
  }

  // ============================================================================
  // 7. SYSTEM ACTIVITY TIMELINE & AUDIT
  // ============================================================================

  async getActivityTimeline(req: Request, res: Response) {
    const limit = Number(req.query.limit) || 50;
    const timeline = await auditService.getActivityTimeline(limit);
    return sendSuccess(res, timeline, 'System activity timeline retrieved successfully');
  }

  // ============================================================================
  // 8. SECURITY SETTINGS
  // ============================================================================

  async getSecuritySettings(_req: Request, res: Response) {
    const settings = await adminService.getSecuritySettings();
    return sendSuccess(res, settings, 'Security policies retrieved successfully');
  }

  async updateSecuritySettings(req: Request, res: Response) {
    const validatedData = securitySettingsSchema.parse(req.body);
    const user = (req as any).user;
    const userContext = {
      userId: user?.id,
      username: user?.username || 'admin'
    };

    const updated = await adminService.updateSecuritySettings(validatedData as any, userContext);
    return sendSuccess(res, updated, 'Security settings updated successfully');
  }

  // ============================================================================
  // 9. DANGER ZONE
  // ============================================================================

  async clearTestData(req: Request, res: Response) {
    const validatedData = clearTestDataSchema.parse(req.body);
    const user = (req as any).user;
    const userRole = typeof user?.role === 'string' ? user.role : (user?.role?.name || 'VIEWER');

    if (userRole !== 'SUPER_ADMIN') {
      throw { statusCode: 403, message: 'Permission Denied: Danger Zone operations require SUPER_ADMIN role.', code: 'FORBIDDEN' };
    }

    const userContext = {
      userId: user?.userId || user?.id,
      username: user?.username || 'admin',
      userRole
    };

    const result = await adminService.clearTestData({
      confirmationPhrase: validatedData.confirmationPhrase,
      retainMasters: validatedData.retainMasters ?? true,
      reason: validatedData.reason,
      userContext
    });
    return sendSuccess(res, result, 'Test data cleared successfully');
  }

  async resetSystemConfig(req: Request, res: Response) {
    const validatedData = resetConfigSchema.parse(req.body);
    const user = (req as any).user;
    const userRole = typeof user?.role === 'string' ? user.role : (user?.role?.name || 'VIEWER');

    if (userRole !== 'SUPER_ADMIN') {
      throw { statusCode: 403, message: 'Permission Denied: Resetting system config requires SUPER_ADMIN role.', code: 'FORBIDDEN' };
    }

    const userContext = {
      userId: user?.userId || user?.id,
      username: user?.username || 'admin',
      userRole
    };

    const result = await adminService.resetSystemConfig({
      confirmationPhrase: validatedData.confirmationPhrase,
      targetModule: validatedData.targetModule,
      userContext
    });
    return sendSuccess(res, result, 'System configuration reset successfully');
  }
}

export const adminController = new AdminController();
