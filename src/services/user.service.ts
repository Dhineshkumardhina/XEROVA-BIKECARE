import { apiClient } from '../lib/api-client';

export interface FrontendUserFilter {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: string;
  role?: string;
  branchId?: string;
  status?: string;
}

export const userService = {
  listUsers: async (filter: FrontendUserFilter = {}) => {
    const res = await apiClient.get('/users', { params: filter });
    return res.data;
  },

  getUserById: async (id: string) => {
    const res = await apiClient.get(`/users/${id}`);
    return res.data;
  },

  createUser: async (userData: any) => {
    const res = await apiClient.post('/users', userData);
    return res.data;
  },

  updateUser: async (id: string, userData: any) => {
    const res = await apiClient.put(`/users/${id}`, userData);
    return res.data;
  },

  toggleUserStatus: async (id: string) => {
    const res = await apiClient.patch(`/users/${id}/status`);
    return res.data;
  },

  resetPassword: async (id: string, newPassword: string) => {
    const res = await apiClient.post(`/users/${id}/reset-password`, { newPassword });
    return res.data;
  },

  listRoles: async () => {
    const res = await apiClient.get('/users/roles');
    return res.data;
  },

  listPermissions: async () => {
    const res = await apiClient.get('/users/permissions');
    return res.data;
  },

  updateRolePermissions: async (roleId: string, permissionCodes: string[]) => {
    const res = await apiClient.put(`/users/roles/${roleId}/permissions`, { permissionCodes });
    return res.data;
  },

  getUserActivity: async (userId: string, page = 1, limit = 50) => {
    const res = await apiClient.get(`/users/${userId}/activity`, { params: { page, limit } });
    return res.data;
  }
};
