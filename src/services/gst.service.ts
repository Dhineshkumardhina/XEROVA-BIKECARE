import { apiClient } from '../lib/api-client';

export interface GstTaxCalculationItem {
  partId?: string;
  name: string;
  hsnCode?: string;
  qty: number;
  rate: number;
  discountAmount?: number;
  gstRate: number;
}

export interface CalculateTaxPayload {
  items: GstTaxCalculationItem[];
  supplyType: 'INTRA_STATE' | 'INTER_STATE';
  customerGstin?: string;
}

export const gstService = {
  calculateTax: async (payload: CalculateTaxPayload) => {
    const res = await apiClient.post('/gst/calculate-tax', payload);
    return res.data;
  },

  getGstr1: async (params: { month?: number; year?: number; fromDate?: string; toDate?: string } = {}) => {
    const res = await apiClient.get('/gst/gstr-1', { params });
    return res.data;
  },

  getGstr3b: async (params: { month?: number; year?: number } = {}) => {
    const res = await apiClient.get('/gst/gstr-3b', { params });
    return res.data;
  },

  validateRecords: async (params: { month?: number; year?: number } = {}) => {
    const res = await apiClient.get('/gst/validate', { params });
    return res.data;
  },

  getPeriodStatus: async (params: { month: number; year: number }) => {
    const res = await apiClient.get('/gst/period-status', { params });
    return res.data;
  },

  lockPeriod: async (payload: { month: number; year: number; arnNumber?: string; notes?: string }) => {
    const res = await apiClient.post('/gst/lock-period', payload);
    return res.data;
  },

  unlockPeriod: async (payload: { month: number; year: number; reason: string }) => {
    const res = await apiClient.post('/gst/unlock-period', payload);
    return res.data;
  },

  getRates: async () => {
    const res = await apiClient.get('/gst/rates');
    return res.data;
  },

  createRate: async (payload: { name: string; rate: number; cgst: number; sgst: number; igst: number; isDefault?: boolean }) => {
    const res = await apiClient.post('/gst/rates', payload);
    return res.data;
  },

  validateGstin: async (gstin: string) => {
    const res = await apiClient.post('/gst/validate-gstin', { gstin });
    return res.data;
  }
};
