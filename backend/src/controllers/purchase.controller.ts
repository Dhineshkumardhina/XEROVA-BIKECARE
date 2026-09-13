import { Response, NextFunction } from 'express';
import { purchaseService } from '../services/purchase.service.js';
import { sendCreated, sendSuccess } from '../utils/response.js';
import {
  createPurchaseSchema,
  purchaseSearchQuerySchema,
  createPurchaseReturnSchema
} from '../validators/purchase.validator.js';
import { AuthenticatedRequest } from '../types/index.js';

export class PurchaseController {
  async search(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = purchaseSearchQuerySchema.parse(req.query);
      const branchId = validated.branchId || req.user?.branchId || undefined;
      const result = await purchaseService.searchPurchases({ ...validated, branchId });
      return sendSuccess(res, result.purchases, 'Purchases retrieved successfully', 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const purchase = await purchaseService.getPurchaseById(id);
      return sendSuccess(res, purchase, 'Purchase details retrieved');
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = createPurchaseSchema.parse(req.body);
      const actor = req.user ? { userId: req.user.userId, username: req.user.username } : undefined;
      const branchId = req.user?.branchId || undefined;

      const purchase = await purchaseService.createPurchase(validated, actor, branchId);
      return sendCreated(res, purchase, `Purchase ${purchase.poNumber} created successfully`);
    } catch (error) {
      next(error);
    }
  }

  async createReturn(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = createPurchaseReturnSchema.parse(req.body);
      const actor = req.user ? { userId: req.user.userId, username: req.user.username } : undefined;

      const purchaseReturn = await purchaseService.createPurchaseReturn(validated, actor);
      return sendCreated(res, purchaseReturn, `Purchase return ${purchaseReturn.debitNoteNumber} created successfully`);
    } catch (error) {
      next(error);
    }
  }
}

export const purchaseController = new PurchaseController();
