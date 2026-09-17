import { Response, NextFunction } from 'express';
import { saleService } from '../services/sale.service.js';
import { sendCreated, sendSuccess } from '../utils/response.js';
import {
  createSaleSchema,
  saleSearchQuerySchema,
  createSaleReturnSchema
} from '../validators/sale.validator.js';
import { AuthenticatedRequest } from '../types/index.js';

export class SaleController {
  async search(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = saleSearchQuerySchema.parse(req.query);
      const branchId = validated.branchId || req.user?.branchId || undefined;
      const result = await saleService.searchSales({ ...validated, branchId });
      return sendSuccess(res, result.sales, 'Sales invoices retrieved successfully', 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const sale = await saleService.getSaleById(id);
      return sendSuccess(res, sale, 'Sale invoice details retrieved');
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = createSaleSchema.parse(req.body);
      const actor = req.user ? { userId: req.user.userId, username: req.user.username, permissions: req.user.permissions, role: req.user.role } : undefined;
      const branchId = req.user?.branchId || undefined;

      const sale = await saleService.createSale(validated, actor, branchId);
      return sendCreated(res, sale, `Invoice ${sale.invoiceNumber} processed successfully`);
    } catch (error) {
      next(error);
    }
  }

  async createReturn(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = createSaleReturnSchema.parse(req.body);
      const actor = req.user ? { userId: req.user.userId, username: req.user.username, permissions: req.user.permissions, role: req.user.role } : undefined;

      const saleReturn = await saleService.createSaleReturn(validated, actor);
      return sendCreated(res, saleReturn, `Credit note ${saleReturn.creditNoteNumber} issued successfully`);
    } catch (error) {
      next(error);
    }
  }

  async getHeldBills(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const branchId = req.user?.branchId || undefined;
      const result = await saleService.getHeldBills(branchId);
      return sendSuccess(res, result.sales, 'Held draft bills retrieved', 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async deleteHeldBill(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const actor = req.user ? { userId: req.user.userId, username: req.user.username } : undefined;
      const result = await saleService.deleteHeldBill(id, actor);
      return sendSuccess(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }
}

export const saleController = new SaleController();
