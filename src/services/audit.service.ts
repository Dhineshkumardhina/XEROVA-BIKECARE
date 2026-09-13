import { apiClient } from '../lib/api-client';

export const auditService = {
  getLogs: async (params?: { module?: string; username?: string; page?: number; limit?: number }) => {
    const res = await apiClient.get('/audit', { params });
    return res.data;
  }
};
