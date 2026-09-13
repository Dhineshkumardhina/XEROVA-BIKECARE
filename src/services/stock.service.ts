import { apiClient } from '../lib/api-client';

export interface StockMovementParams {
  itemId?: string;
  branchId?: string;
  movementType?: string;
  referenceType?: string;
  startDate?: string;
  endDate?: string;
  q?: string;
  page?: number;
  limit?: number;
}

export interface StockAdjustmentPayload {
  itemId: string;
  branchId?: string;
  direction: 'IN' | 'OUT';
  quantity: number;
  reason: string;
  notes?: string;
}

export interface LowStockParams {
  branchId?: string;
  filterType?: 'ALL_LOW' | 'OUT_OF_STOCK' | 'BELOW_REORDER';
  q?: string;
  page?: number;
  limit?: number;
}

export interface StockReportParams {
  branchId?: string;
  categoryId?: string;
  brandId?: string;
  status?: 'ALL' | 'NORMAL' | 'LOW' | 'OUT';
  startDate?: string;
  endDate?: string;
}

export const stockService = {
  getValuation: async (branchId?: string) => {
    const res = await apiClient.get('/stock/valuation', { params: { branchId } });
    return res.data;
  },

  getMovements: async (params?: StockMovementParams) => {
    const res = await apiClient.get('/stock/movements', { params });
    return res.data;
  },

  getMovementById: async (id: string) => {
    const res = await apiClient.get(`/stock/movements/${id}`);
    return res.data;
  },

  adjustStock: async (adjustmentData: StockAdjustmentPayload) => {
    const res = await apiClient.post('/stock/adjust', adjustmentData);
    return res.data;
  },

  getLowStock: async (params?: LowStockParams) => {
    const res = await apiClient.get('/stock/low-stock', { params });
    return res.data;
  },

  getOutOfStock: async (params?: { branchId?: string; q?: string }) => {
    const res = await apiClient.get('/stock/out-of-stock', { params });
    return res.data;
  },

  getStockReport: async (params?: StockReportParams) => {
    const res = await apiClient.get('/stock/report', { params });
    return res.data;
  }
};
