import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service.js';
import { sendSuccess } from '../utils/response.js';

export class NotificationController {
  async getNotifications(_req: Request, res: Response) {
    const notifications = await notificationService.getSystemNotifications();
    return sendSuccess(res, notifications, 'System notifications retrieved');
  }
}

export const notificationController = new NotificationController();
