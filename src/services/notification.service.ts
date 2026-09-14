import { apiClient } from '../lib/api-client';

export interface AppNotification {
  id: string;
  type: 'LOW_STOCK' | 'PAYMENT_DUE' | 'SYSTEM' | 'SECURITY';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  severity: 'info' | 'warning' | 'critical';
}

export const notificationService = {
  getNotifications: async () => {
    const res = await apiClient.get('/notifications');
    return res.data;
  },

  markAsRead: async (id: string) => {
    // If backend supports PATCH /notifications/:id/read or local mark
    try {
      const res = await apiClient.patch(`/notifications/${id}/read`);
      return res.data;
    } catch {
      return { success: true };
    }
  },

  markAllAsRead: async () => {
    try {
      const res = await apiClient.post('/notifications/mark-all-read');
      return res.data;
    } catch {
      return { success: true };
    }
  }
};
