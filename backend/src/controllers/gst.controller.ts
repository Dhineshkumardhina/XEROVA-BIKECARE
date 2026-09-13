import { Request, Response } from 'express';
import { gstService } from '../services/gst.service.js';
import {
  calculateTaxSchema,
  gstPeriodQuerySchema,
  lockPeriodSchema,
  unlockPeriodSchema,
  createTaxRateSchema,
  validateGstinInputSchema
} from '../validators/gst.validator.js';
import { validateGstinFormat } from '../utils/gstEngine.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class GstController {
  /**
   * POST /api/gst/calculate-tax
   * Centralized backend tax calculator for POS, Billing, Quotations, and Purchases
   */
  async calculateTax(req: Request, res: Response) {
    try {
      const parsed = calculateTaxSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'Invalid GST calculation payload', 400, 'VALIDATION_ERROR', parsed.error.format());
      }
      const result = await gstService.calculateTaxes(parsed.data);
      return sendSuccess(res, result, 'GST taxes calculated successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Tax calculation failed');
    }
  }

  /**
   * GET /api/gst/gstr-1
   * Structured GSTR-1 data generation (B2B, B2CL, B2CS, CDNR, CDNUR, Nil/Exempt, HSN Summary, Doc Summary)
   */
  async getGstr1(req: Request, res: Response) {
    try {
      const queryParsed = gstPeriodQuerySchema.safeParse(req.query);
      if (!queryParsed.success) {
        return sendError(res, 'Invalid period filter query', 400, 'VALIDATION_ERROR', queryParsed.error.format());
      }
      const data = await gstService.generateGstr1Data(queryParsed.data);
      return sendSuccess(res, data, 'GSTR-1 report generated successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to generate GSTR-1 report');
    }
  }

  /**
   * GET /api/gst/gstr-3b
   * Structured GSTR-3B Summary (Table 3.1 Outward supplies, Table 4 ITC, Table 6.1 Net cash liability)
   */
  async getGstr3b(req: Request, res: Response) {
    try {
      const queryParsed = gstPeriodQuerySchema.safeParse(req.query);
      if (!queryParsed.success) {
        return sendError(res, 'Invalid period filter query', 400, 'VALIDATION_ERROR', queryParsed.error.format());
      }
      const data = await gstService.generateGstr3bSummary(queryParsed.data);
      return sendSuccess(res, data, 'GSTR-3B summary generated successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to generate GSTR-3B summary');
    }
  }

  /**
   * GET /api/gst/validate
   * Comprehensive GST Validation engine (Detects missing/invalid GSTIN, missing HSN, tax mismatches)
   */
  async validateRecords(req: Request, res: Response) {
    try {
      const queryParsed = gstPeriodQuerySchema.safeParse(req.query);
      if (!queryParsed.success) {
        return sendError(res, 'Invalid period query', 400, 'VALIDATION_ERROR', queryParsed.error.format());
      }
      const report = await gstService.validateGstRecords(queryParsed.data);
      return sendSuccess(res, report, 'GST validation report completed');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to validate GST records');
    }
  }

  /**
   * GET /api/gst/period-status
   * Checks whether a period is locked, open, or filed
   */
  async getPeriodStatus(req: Request, res: Response) {
    try {
      const period = req.query.period as string;
      const status = await gstService.getPeriodStatus(period);
      return sendSuccess(res, status, 'Period status retrieved');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to check period status');
    }
  }

  /**
   * POST /api/gst/lock-period
   * Lock finalized period with ARN reference
   */
  async lockPeriod(req: Request, res: Response) {
    try {
      const parsed = lockPeriodSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'Invalid lock period input', 400, 'VALIDATION_ERROR', parsed.error.format());
      }
      const actor = {
        userId: (req as any).user?.id,
        username: (req as any).user?.username
      };
      const result = await gstService.lockPeriod(parsed.data, actor);
      return sendSuccess(res, result, `Period ${parsed.data.period} finalized and locked`);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to lock period', 400);
    }
  }

  /**
   * POST /api/gst/unlock-period
   * Unlock period (Admin only)
   */
  async unlockPeriod(req: Request, res: Response) {
    try {
      const parsed = unlockPeriodSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'Invalid unlock period input', 400, 'VALIDATION_ERROR', parsed.error.format());
      }
      const actor = {
        userId: (req as any).user?.id,
        username: (req as any).user?.username
      };
      const result = await gstService.unlockPeriod(parsed.data, actor);
      return sendSuccess(res, result, `Period ${parsed.data.period} unlocked successfully`);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to unlock period', 400);
    }
  }

  /**
   * GET /api/gst/rates
   */
  async getRates(_req: Request, res: Response) {
    try {
      const rates = await gstService.getTaxRates();
      return sendSuccess(res, rates, 'Tax rates retrieved');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch tax rates');
    }
  }

  /**
   * POST /api/gst/rates
   */
  async createRate(req: Request, res: Response) {
    try {
      const parsed = createTaxRateSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'Invalid tax rate data', 400, 'VALIDATION_ERROR', parsed.error.format());
      }
      const actor = {
        userId: (req as any).user?.id,
        username: (req as any).user?.username
      };
      const rate = await gstService.createTaxRate(parsed.data, actor);
      return sendSuccess(res, rate, 'Tax rate created successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to create tax rate');
    }
  }

  /**
   * POST /api/gst/validate-gstin
   */
  async validateGstin(req: Request, res: Response) {
    try {
      const parsed = validateGstinInputSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'Invalid GSTIN payload', 400, 'VALIDATION_ERROR', parsed.error.format());
      }
      const result = validateGstinFormat(parsed.data.gstin);
      return sendSuccess(res, result, result.isValid ? 'Valid GSTIN' : 'Invalid GSTIN');
    } catch (err: any) {
      return sendError(res, err.message || 'GSTIN verification failed');
    }
  }
}

export const gstController = new GstController();
