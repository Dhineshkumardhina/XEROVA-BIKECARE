import { apiClient } from '../lib/api-client';

export const adminService = {
  getCompanySettings: async () => {
    const res = await apiClient.get('/admin/company');
    return res.data;
  },

  updateCompanySettings: async (payload: any) => {
    const res = await apiClient.put('/admin/company', payload);
    return res.data;
  },

  listBranches: async () => {
    const res = await apiClient.get('/admin/branches');
    return res.data;
  },

  createBranch: async (payload: any) => {
    const res = await apiClient.post('/admin/branches', payload);
    return res.data;
  },

  getNumberingConfigs: async () => {
    const res = await apiClient.get('/admin/numbering');
    return res.data;
  },

  updateNumberingConfigs: async (payload: any) => {
    const res = await apiClient.put('/admin/numbering', payload);
    return res.data;
  },

  getNextDocumentNumber: async (documentType: string) => {
    const res = await apiClient.get('/admin/numbering/next', { params: { documentType } });
    return res.data;
  },

  getInvoiceTemplates: async () => {
    const res = await apiClient.get('/admin/templates');
    return res.data;
  },

  updateInvoiceTemplate: async (id: string, payload: any) => {
    const res = await apiClient.put(`/admin/templates/${id}`, payload);
    return res.data;
  },

  getPrinterSettings: async () => {
    const res = await apiClient.get('/admin/printer');
    return res.data;
  },

  updatePrinterSettings: async (payload: any) => {
    const res = await apiClient.put('/admin/printer', payload);
    return res.data;
  },

  testPrint: async (payload: { printerName?: string; testType?: string }) => {
    const res = await apiClient.post('/admin/printer/test-print', payload);
    return res.data;
  },

  listBackups: async () => {
    const res = await apiClient.get('/admin/backup');
    return res.data;
  },

  createBackup: async (payload: { type: 'DATABASE' | 'FULL_SYSTEM' | 'MEDIA'; notes?: string }) => {
    const res = await apiClient.post('/admin/backup', payload);
    return res.data;
  },

  restoreBackup: async (payload: { backupId: string; confirmKey: string }) => {
    const res = await apiClient.post('/admin/restore', payload);
    return res.data;
  },

  getActivityTimeline: async (params: { page?: number; limit?: number; module?: string } = {}) => {
    const res = await apiClient.get('/admin/activity-timeline', { params });
    return res.data;
  },

  getSecuritySettings: async () => {
    const res = await apiClient.get('/admin/security');
    return res.data;
  },

  listUsers: async () => {
    const res = await apiClient.get('/admin/users');
    return res.data;
  },

  createUser: async (payload: any) => {
    const res = await apiClient.post('/admin/users', payload);
    return res.data;
  },

  updateUser: async (id: string, payload: any) => {
    const res = await apiClient.put(`/admin/users/${id}`, payload);
    return res.data;
  },

  toggleUserStatus: async (id: string) => {
    const res = await apiClient.patch(`/admin/users/${id}/status`);
    return res.data;
  },

  resetPassword: async (id: string, newPassword?: string) => {
    const res = await apiClient.post(`/admin/users/${id}/reset-password`, { newPassword });
    return res.data;
  },

  clearTestData: async (payload: { confirmKey: string }) => {
    const res = await apiClient.post('/admin/danger-zone/clear-test-data', payload);
    return res.data;
  },

  resetSystemConfig: async (payload: { confirmKey: string }) => {
    const res = await apiClient.post('/admin/danger-zone/reset-config', payload);
    return res.data;
  }
};
