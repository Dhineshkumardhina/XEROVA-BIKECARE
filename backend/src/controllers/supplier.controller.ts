import { Response, NextFunction } from 'express';
import { supplierService } from '../services/supplier.service.js';
import { sendCreated, sendSuccess } from '../utils/response.js';
import {
  createSupplierSchema,
  updateSupplierSchema,
  supplierSearchQuerySchema
} from '../validators/supplier.validator.js';
import { AuthenticatedRequest } from '../types/index.js';

export class SupplierController {
  async search(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = supplierSearchQuerySchema.parse(req.query);
      const result = await supplierService.searchSuppliers(validated);
      return sendSuccess(res, result.suppliers, 'Suppliers retrieved successfully', 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const supplier = await supplierService.getSupplierById(id);
      return sendSuccess(res, supplier, 'Supplier details retrieved');
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = createSupplierSchema.parse(req.body);
      const actor = req.user ? { userId: req.user.userId, username: req.user.username } : undefined;
      const supplier = await supplierService.createSupplier(validated, actor);
      return sendCreated(res, supplier, `Supplier ${supplier.name} created successfully`);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const validated = updateSupplierSchema.parse(req.body);
      const actor = req.user ? { userId: req.user.userId, username: req.user.username } : undefined;
      const supplier = await supplierService.updateSupplier(id, validated, actor);
      return sendSuccess(res, supplier, 'Supplier updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async toggleStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const actor = req.user ? { userId: req.user.userId, username: req.user.username } : undefined;
      const supplier = await supplierService.toggleStatus(id, actor);
      return sendSuccess(res, supplier, `Supplier status changed to ${supplier.status}`);
    } catch (error) {
      next(error);
    }
  }
}

export const supplierController = new SupplierController();
