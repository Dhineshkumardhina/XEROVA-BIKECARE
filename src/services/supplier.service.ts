import { apiClient } from '../lib/api-client';

export interface SupplierPayload {
  name: string;
  supplierCode?: string;
  contactPerson?: string;
  mobile: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  gstin?: string;
  pan?: string;
  brandFocus?: string;
  creditDays?: number;
  creditLimit?: number;
  openingBalance?: number;
  status?: string;
}

export const supplierService = {
  search: async (params?: { q?: string; status?: string; page?: number; limit?: number }) => {
    const res = await apiClient.get('/suppliers/search', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get(`/suppliers/${id}`);
    return res.data;
  },

  create: async (payload: SupplierPayload) => {
    const res = await apiClient.post('/suppliers', payload);
    return res.data;
  },

  update: async (id: string, payload: Partial<SupplierPayload>) => {
    const res = await apiClient.put(`/suppliers/${id}`, payload);
    return res.data;
  },

  toggleStatus: async (id: string) => {
    const res = await apiClient.patch(`/suppliers/${id}/status`);
    return res.data;
  }
};
