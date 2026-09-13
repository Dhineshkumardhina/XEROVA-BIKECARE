import { Response, NextFunction } from 'express';
import { itemService } from '../services/item.service.js';
import { sendCreated, sendSuccess } from '../utils/response.js';
import {
  createItemSchema,
  itemSearchQuerySchema,
  updateItemSchema,
  importItemsBatchSchema,
  exportItemsQuerySchema
} from '../validators/item.validator.js';
import { AuthenticatedRequest } from '../types/index.js';

export class ItemController {
  async search(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validatedQuery = itemSearchQuerySchema.parse(req.query);
      const branchId = req.user?.branchId || undefined;
      const result = await itemService.searchItems(validatedQuery, branchId);
      return sendSuccess(res, result.items, 'Items retrieved successfully', 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const item = await itemService.getItemById(id);
      return sendSuccess(res, item, 'Item details retrieved');
    } catch (error) {
      next(error);
    }
  }

  async getByBarcode(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { barcode } = req.params;
      const branchId = req.user?.branchId || undefined;
      const item = await itemService.getItemByBarcode(barcode, branchId);
      return sendSuccess(res, item, 'Item retrieved from barcode');
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validatedInput = createItemSchema.parse(req.body);
      const actor = req.user ? { userId: req.user.userId, username: req.user.username } : undefined;
      const branchId = req.user?.branchId || undefined;

      const item = await itemService.createItem(validatedInput, actor, branchId);
      return sendCreated(res, item, `Item ${item.sku} created successfully`);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validatedInput = updateItemSchema.parse(req.body);
      const actor = req.user ? { userId: req.user.userId, username: req.user.username } : undefined;

      const item = await itemService.updateItem(id, validatedInput, actor);
      return sendSuccess(res, item, `Item updated successfully`);
    } catch (error) {
      next(error);
    }
  }

  async toggleStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const actor = req.user ? { userId: req.user.userId, username: req.user.username } : undefined;

      const item = await itemService.toggleStatus(id, actor);
      return sendSuccess(res, item, `Item status changed to ${item.status}`);
    } catch (error) {
      next(error);
    }
  }

  async importItems(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = importItemsBatchSchema.parse(req.body);
      const actor = req.user ? { userId: req.user.userId, username: req.user.username } : undefined;

      const summary = await itemService.importItems(validated.items, actor);
      return sendSuccess(res, summary, 'Items batch import completed');
    } catch (error) {
      next(error);
    }
  }

  async exportItems(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = exportItemsQuerySchema.parse(req.query);
      const data = await itemService.exportItems(validated);
      return sendSuccess(res, data, 'Item master export data prepared');
    } catch (error) {
      next(error);
    }
  }
}

export const itemController = new ItemController();

