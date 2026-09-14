import { apiClient } from '../lib/api-client';

export interface ReportFilterParams {
  type?: string;
  startDate?: string;
  endDate?: string;
  branchId?: string;
  categoryId?: string;
  brandId?: string;
  customerId?: string;
  supplierId?: string;
  paymentMode?: string;
  status?: string;
}

export const reportService = {
  getSalesReport: async (params: ReportFilterParams = {}) => {
    const res = await apiClient.get('/reports/sales', { params });
    return res.data;
  },

  getPurchaseReport: async (params: ReportFilterParams = {}) => {
    const res = await apiClient.get('/reports/purchases', { params });
    return res.data;
  },

  getInventoryReport: async (params: ReportFilterParams = {}) => {
    const res = await apiClient.get('/reports/inventory', { params });
    return res.data;
  },

  getProfitabilityReport: async (params: ReportFilterParams = {}) => {
    const res = await apiClient.get('/reports/profitability', { params });
    return res.data;
  },

  getFinancialReport: async (params: ReportFilterParams = {}) => {
    const res = await apiClient.get('/reports/financial', { params });
    return res.data;
  },

  getBusinessInsights: async () => {
    const res = await apiClient.get('/reports/insights');
    return res.data;
  }
};
