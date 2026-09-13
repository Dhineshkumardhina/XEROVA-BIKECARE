import { Request, Response } from 'express';
import { reportService } from '../services/report.service.js';
import {
  salesReportQuerySchema,
  purchaseReportQuerySchema,
  inventoryReportQuerySchema,
  profitabilityReportQuerySchema,
  financialReportQuerySchema,
  businessInsightsQuerySchema
} from '../validators/report.validator.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class ReportController {
  async getSalesReport(req: Request, res: Response) {
    try {
      const parsed = salesReportQuerySchema.safeParse({
        ...req.query,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50,
        minAmount: req.query.minAmount ? parseFloat(req.query.minAmount as string) : undefined,
        maxAmount: req.query.maxAmount ? parseFloat(req.query.maxAmount as string) : undefined
      });
      if (!parsed.success) {
        return sendError(res, 'Invalid sales report query', 400, 'VALIDATION_ERROR', parsed.error.format());
      }
      const report = await reportService.getSalesReport(parsed.data);
      return sendSuccess(res, report, 'Sales report generated successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to generate sales report');
    }
  }

  async getPurchaseReport(req: Request, res: Response) {
    try {
      const parsed = purchaseReportQuerySchema.safeParse({
        ...req.query,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50
      });
      if (!parsed.success) {
        return sendError(res, 'Invalid purchase report query', 400, 'VALIDATION_ERROR', parsed.error.format());
      }
      const report = await reportService.getPurchaseReport(parsed.data);
      return sendSuccess(res, report, 'Purchase report generated successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to generate purchase report');
    }
  }

  async getInventoryReport(req: Request, res: Response) {
    try {
      const parsed = inventoryReportQuerySchema.safeParse({
        ...req.query,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50,
        inactivityDays: req.query.inactivityDays ? parseInt(req.query.inactivityDays as string, 10) : 60,
        velocityThreshold: req.query.velocityThreshold ? parseInt(req.query.velocityThreshold as string, 10) : 10
      });
      if (!parsed.success) {
        return sendError(res, 'Invalid inventory report query', 400, 'VALIDATION_ERROR', parsed.error.format());
      }
      const report = await reportService.getInventoryReport(parsed.data);
      return sendSuccess(res, report, 'Inventory report generated successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to generate inventory report');
    }
  }

  async getProfitabilityReport(req: Request, res: Response) {
    try {
      const parsed = profitabilityReportQuerySchema.safeParse({
        ...req.query,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50
      });
      if (!parsed.success) {
        return sendError(res, 'Invalid profitability report query', 400, 'VALIDATION_ERROR', parsed.error.format());
      }
      const report = await reportService.getProfitabilityReport(parsed.data);
      return sendSuccess(res, report, 'Profitability report generated successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to generate profitability report');
    }
  }

  async getFinancialReport(req: Request, res: Response) {
    try {
      const parsed = financialReportQuerySchema.safeParse({
        ...req.query,
        includeReversed: req.query.includeReversed === 'true'
      });
      if (!parsed.success) {
        return sendError(res, 'Invalid financial statement query', 400, 'VALIDATION_ERROR', parsed.error.format());
      }
      const report = await reportService.getFinancialReport(parsed.data);
      return sendSuccess(res, report, 'Financial statement generated successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to generate financial statement');
    }
  }

  async getBusinessInsights(req: Request, res: Response) {
    try {
      const parsed = businessInsightsQuerySchema.safeParse({
        ...req.query,
        days: req.query.days ? parseInt(req.query.days as string, 10) : 30
      });
      if (!parsed.success) {
        return sendError(res, 'Invalid business insights query', 400, 'VALIDATION_ERROR', parsed.error.format());
      }
      const insights = await reportService.getBusinessInsights(parsed.data);
      return sendSuccess(res, insights, 'Business intelligence insights generated');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to generate business insights');
    }
  }
}

export const reportController = new ReportController();
