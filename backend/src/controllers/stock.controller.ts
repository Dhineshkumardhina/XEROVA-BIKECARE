import { Response, NextFunction } from 'express';
import { stockService } from '../services/stock.service.js';
import { sendSuccess } from '../utils/response.js';
import {
  stockAdjustmentSchema,
  stockMovementQuerySchema,
  stockReportQuerySchema,
  lowStockQuerySchema
} from '../validators/stock.validator.js';
import { AuthenticatedRequest } from '../types/index.js';

export class StockController {
  async getValuation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const branchId = (req.query.branchId as string) || req.user?.branchId || undefined;
      const result = await stockService.getStockValuation(branchId);
      return sendSuccess(res, result, 'Stock valuation summary retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getMovements(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validatedQuery = stockMovementQuerySchema.parse(req.query);
      const result = await stockService.getStockMovements(validatedQuery);
      return sendSuccess(res, result.movements, 'Stock movement ledger retrieved', 200, {
        ...result.meta,
        summary: result.summary
      });
    } catch (error) {
      next(error);
    }
  }

  async getMovementById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const movement = await stockService.getStockMovementById(id);
      return sendSuccess(res, movement, 'Movement transaction details retrieved');
    } catch (error) {
      next(error);
    }
  }

  async adjust(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validatedInput = stockAdjustmentSchema.parse(req.body);
      const userId = req.user?.userId;
      const username = req.user?.username || 'Admin';

      const result = await stockService.adjustStock(validatedInput, userId, username);
      return sendSuccess(res, result, `Stock adjusted successfully (${result.referenceId})`);
    } catch (error) {
      next(error);
    }
  }

  async getLowStock(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validatedQuery = lowStockQuerySchema.parse(req.query);
      const branchId = validatedQuery.branchId || req.user?.branchId || undefined;
      const result = await stockService.getLowStock({ ...validatedQuery, branchId });
      return sendSuccess(res, result.items, 'Low stock items retrieved', 200, {
        ...result.meta,
        summary: result.summary
      });
    } catch (error) {
      next(error);
    }
  }

  async getOutOfStock(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const branchId = (req.query.branchId as string) || req.user?.branchId || undefined;
      const q = req.query.q as string | undefined;
      const result = await stockService.getOutOfStock(branchId, q);
      return sendSuccess(res, result.items, 'Out of stock items retrieved', 200, {
        ...result.meta,
        summary: result.summary
      });
    } catch (error) {
      next(error);
    }
  }

  async getReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validatedQuery = stockReportQuerySchema.parse(req.query);
      const branchId = validatedQuery.branchId || req.user?.branchId || undefined;
      const result = await stockService.getStockReport({ ...validatedQuery, branchId });
      return sendSuccess(res, result.rows, 'Stock movement summary report generated', 200, {
        summary: result.summary
      });
    } catch (error) {
      next(error);
    }
  }
}

export const stockController = new StockController();
