import { Response, NextFunction } from 'express';
import { quotationService } from '../services/quotation.service.js';
import { sendCreated, sendSuccess } from '../utils/response.js';
import {
  createQuotationSchema,
  updateQuotationSchema,
  quotationSearchQuerySchema,
  convertQuotationToInvoiceSchema
} from '../validators/quotation.validator.js';
import { AuthenticatedRequest } from '../types/index.js';

export class QuotationController {
  async search(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = quotationSearchQuerySchema.parse(req.query);
      const result = await quotationService.searchQuotations(validated);
      return sendSuccess(res, result.quotations, 'Quotations retrieved successfully', 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const quotation = await quotationService.getQuotationById(id);
      return sendSuccess(res, quotation, 'Quotation details retrieved');
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = createQuotationSchema.parse(req.body);
      const actor = req.user ? { userId: req.user.userId, username: req.user.username } : undefined;

      const quotation = await quotationService.createQuotation(validated, actor);
      return sendCreated(res, quotation, `Quotation ${quotation.quotationNumber} created successfully`);
    } catch (error) {
      next(error);
    }
  }

  async duplicate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const actor = req.user ? { userId: req.user.userId, username: req.user.username } : undefined;

      const duplicated = await quotationService.duplicateQuotation(id, actor);
      return sendCreated(res, duplicated, `Quotation duplicated as ${duplicated.quotationNumber}`);
    } catch (error) {
      next(error);
    }
  }

  async convertToInvoice(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = convertQuotationToInvoiceSchema.parse(req.body);
      const actor = req.user ? { userId: req.user.userId, username: req.user.username } : undefined;
      const branchId = req.user?.branchId || undefined;

      const result = await quotationService.convertToInvoice(validated, actor, branchId);
      return sendCreated(res, result, `Quotation ${result.quotationNumber} successfully converted to Invoice #${result.invoiceNumber}`);
    } catch (error) {
      next(error);
    }
  }
}

export const quotationController = new QuotationController();
