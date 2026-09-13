import { apiClient } from '../lib/api-client';

export const authService = {
  login: async (credentials: { username: string; password: string }) => {
    const res = await apiClient.post('/auth/login', credentials);
    return res.data;
  },

  getCurrentUser: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  changePassword: async (data: { oldPassword: string; newPassword: string }) => {
    const res = await apiClient.post('/auth/change-password', data);
    return res.data;
  },

  refreshToken: async (refreshToken: string) => {
    const res = await apiClient.post('/auth/refresh', { refreshToken });
    return res.data;
  },

  logout: async () => {
    const res = await apiClient.post('/auth/logout');
    return res.data;
  }
};

