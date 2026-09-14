import { Request, Response } from 'express';
import { crmService } from '../services/crm.service.js';
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerSearchSchema,
  createCustomerVehicleSchema,
  updateCustomerVehicleSchema,
  createMechanicSchema,
  updateMechanicSchema,
  loyaltyRuleSchema,
  adjustLoyaltyPointsSchema,
  recordReferralSchema,
  updateReferralStatusSchema,
  createMessageTemplateSchema,
  sendMessageSchema,
  bulkMessageSchema,
  outstandingReminderQuerySchema
} from '../validators/crm.validator.js';
import { sendSuccess, sendCreated, sendError } from '../utils/response.js';

export class CrmController {
  // --- Customers & Profiles ---
  async createCustomer(req: Request, res: Response) {
    try {
      const payload = {
        ...req.body,
        customerType: req.body.customerType || req.body.type || 'RETAIL'
      };
      const parsed = createCustomerSchema.safeParse(payload);
      if (!parsed.success) {
        return sendError(res, 'Validation error', 400, 'VALIDATION_ERROR', parsed.error.format());
      }
      const user = (req as any).user;
      const actor = user ? { userId: user.userId || user.id, username: user.username } : undefined;
      const customer = await crmService.createCustomer(parsed.data, actor);
      return sendCreated(res, customer, `Customer ${customer.name} created successfully`);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to create customer', 400);
    }
  }

  async updateCustomer(req: Request, res: Response) {
    try {
      const parsed = updateCustomerSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'Validation error', 400, 'VALIDATION_ERROR', parsed.error.format());
      }
      const user = (req as any).user;
      const actor = user ? { userId: user.userId || user.id, username: user.username } : undefined;
      const customer = await crmService.updateCustomer(req.params.id, parsed.data, actor);
      return sendSuccess(res, customer, 'Customer updated successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to update customer', 400);
    }
  }

  async searchCustomers(req: Request, res: Response) {
    try {
      const parsed = customerSearchSchema.safeParse({
        ...req.query,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50,
        hasOutstanding: req.query.hasOutstanding === 'true'
      });
      if (!parsed.success) {
        return sendError(res, 'Invalid search query', 400, 'VALIDATION_ERROR', parsed.error.format());
      }
      const result = await crmService.searchCustomers(parsed.data);
      return sendSuccess(res, result, 'Customers retrieved');
    } catch (err: any) {
      return sendError(res, err.message || 'Customer search failed');
    }
  }

  async getCustomerProfile(req: Request, res: Response) {
    try {
      const profile = await crmService.getCustomerProfile(req.params.id);
      return sendSuccess(res, profile, 'Customer 360 profile retrieved');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch customer profile', 404);
    }
  }

  // --- Customer Vehicles ---
  async addVehicle(req: Request, res: Response) {
    try {
      const parsed = createCustomerVehicleSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'Invalid vehicle data', 400, 'VALIDATION_ERROR', parsed.error.format());
      }
      const vehicle = await crmService.addCustomerVehicle(req.params.customerId, parsed.data);
      return sendCreated(res, vehicle, `Vehicle ${vehicle.regNo} registered successfully`);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to add vehicle', 400);
    }
  }

  async updateVehicle(req: Request, res: Response) {
    try {
      const parsed = updateCustomerVehicleSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'Invalid vehicle update data', 400, 'VALIDATION_ERROR', parsed.error.format());
      }
      const updated = await crmService.updateCustomerVehicle(req.params.vehicleId, parsed.data);
      return sendSuccess(res, updated, 'Vehicle updated successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to update vehicle', 400);
    }
  }

  // --- Mechanics & Referrals ---
  async createMechanic(req: Request, res: Response) {
    try {
      const parsed = createMechanicSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'Invalid mechanic data', 400, 'VALIDATION_ERROR', parsed.error.format());
      }
      const user = (req as any).user;
      const actor = user ? { userId: user.userId || user.id, username: user.username } : undefined;
      const mechanic = await crmService.createMechanic(parsed.data, actor);
      return sendCreated(res, mechanic, 'Mechanic registered successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to create mechanic', 400);
    }
  }

  async getMechanics(_req: Request, res: Response) {
    try {
      const mechanics = await crmService.getMechanics();
      return sendSuccess(res, mechanics, 'Mechanics list retrieved');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch mechanics');
    }
  }

  async recordReferral(req: Request, res: Response) {
    try {
      const parsed = recordReferralSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'Invalid referral data', 400, 'VALIDATION_ERROR', parsed.error.format());
      }
      const referral = await crmService.recordReferral(parsed.data);
      return sendCreated(res, referral, 'Referral recorded successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to record referral', 400);
    }
  }

  async updateReferralStatus(req: Request, res: Response) {
    try {
      const parsed = updateReferralStatusSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'Invalid referral status payload', 400, 'VALIDATION_ERROR', parsed.error.format());
      }
      const user = (req as any).user;
      const actor = user ? { userId: user.userId || user.id, username: user.username } : undefined;
      const referral = await crmService.updateReferralStatus(req.params.referralId, parsed.data, actor);
      return sendSuccess(res, referral, 'Referral status updated');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to update referral status', 400);
    }
  }

  // --- Loyalty Program ---
  async getLoyaltyRule(_req: Request, res: Response) {
    try {
      const rule = await crmService.getLoyaltyRule();
      return sendSuccess(res, rule, 'Loyalty configuration retrieved');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch loyalty rule');
    }
  }

  async updateLoyaltyRule(req: Request, res: Response) {
    try {
      const parsed = loyaltyRuleSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'Invalid loyalty rule config', 400, 'VALIDATION_ERROR', parsed.error.format());
      }
      const user = (req as any).user;
      const actor = user ? { userId: user.userId || user.id, username: user.username } : undefined;
      const updated = await crmService.updateLoyaltyRule(parsed.data, actor);
      return sendSuccess(res, updated, 'Loyalty rules updated successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to update loyalty rules', 400);
    }
  }

  async adjustLoyaltyPoints(req: Request, res: Response) {
    try {
      const parsed = adjustLoyaltyPointsSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'Invalid point adjustment payload', 400, 'VALIDATION_ERROR', parsed.error.format());
      }
      const user = (req as any).user;
      const actor = user ? { userId: user.userId || user.id, username: user.username } : undefined;
      const result = await crmService.adjustLoyaltyPoints(parsed.data, actor);
      return sendSuccess(res, result, `Points adjusted. New balance: ${result.newBalance}`);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to adjust points', 400);
    }
  }

  // --- Messaging & Bulk Broadcast ---
  async getMessageTemplates(_req: Request, res: Response) {
    try {
      const templates = await crmService.getMessageTemplates();
      return sendSuccess(res, templates, 'Message templates retrieved');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch templates');
    }
  }

  async createMessageTemplate(req: Request, res: Response) {
    try {
      const parsed = createMessageTemplateSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'Invalid template payload', 400, 'VALIDATION_ERROR', parsed.error.format());
      }
      const user = (req as any).user;
      const actor = user ? { userId: user.userId || user.id, username: user.username } : undefined;
      const template = await crmService.createMessageTemplate(parsed.data, actor);
      return sendCreated(res, template, 'Message template created successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to create message template', 400);
    }
  }

  async sendMessage(req: Request, res: Response) {
    try {
      const parsed = sendMessageSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'Invalid message payload', 400, 'VALIDATION_ERROR', parsed.error.format());
      }
      const user = (req as any).user;
      const actor = user ? { userId: user.userId || user.id, username: user.username } : undefined;
      const log = await crmService.sendMessage(parsed.data, actor);
      return sendSuccess(res, log, `Message sent via ${log.channel}`);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to send message', 400);
    }
  }

  async previewBulkAudience(req: Request, res: Response) {
    try {
      const parsed = bulkMessageSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'Invalid bulk broadcast payload', 400, 'VALIDATION_ERROR', parsed.error.format());
      }
      const preview = await crmService.previewBulkAudience(parsed.data);
      return sendSuccess(res, preview, 'Audience preview generated');
    } catch (err: any) {
      return sendError(res, err.message || 'Audience preview failed', 400);
    }
  }

  async sendBulkMessage(req: Request, res: Response) {
    try {
      const parsed = bulkMessageSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'Invalid bulk broadcast payload', 400, 'VALIDATION_ERROR', parsed.error.format());
      }
      const user = (req as any).user;
      const actor = user ? { userId: user.userId || user.id, username: user.username } : undefined;
      const result = await crmService.sendBulkMessage(parsed.data, actor);
      return sendSuccess(res, result, `Bulk message dispatched to ${result.deliveredCount} recipients`);
    } catch (err: any) {
      return sendError(res, err.message || 'Bulk message dispatch failed', 400);
    }
  }

  // --- Outstanding Reminders & History ---
  async getOutstandingReminders(req: Request, res: Response) {
    try {
      const parsed = outstandingReminderQuerySchema.safeParse({
        ...req.query,
        minOutstanding: req.query.minOutstanding ? parseFloat(req.query.minOutstanding as string) : 1,
        minOverdueDays: req.query.minOverdueDays ? parseInt(req.query.minOverdueDays as string, 10) : 0
      });
      if (!parsed.success) {
        return sendError(res, 'Invalid query', 400, 'VALIDATION_ERROR', parsed.error.format());
      }
      const reminders = await crmService.getOutstandingReminders(parsed.data);
      return sendSuccess(res, reminders, 'Outstanding reminders retrieved');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch outstanding reminders');
    }
  }

  async sendOutstandingReminder(req: Request, res: Response) {
    try {
      const channel = (req.body.channel as 'WHATSAPP' | 'SMS') || 'WHATSAPP';
      const user = (req as any).user;
      const actor = user ? { userId: user.userId || user.id, username: user.username } : undefined;
      const result = await crmService.sendOutstandingReminder(req.params.customerId, channel, actor);
      return sendSuccess(res, result, 'Reminder sent successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to send reminder', 400);
    }
  }

  async getCommunicationHistory(req: Request, res: Response) {
    try {
      const mobile = req.query.mobile as string | undefined;
      const logs = await crmService.getCommunicationHistory(mobile);
      return sendSuccess(res, logs, 'Communication history retrieved');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch communication history');
    }
  }
}

export const crmController = new CrmController();
