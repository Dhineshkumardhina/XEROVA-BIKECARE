import { apiClient } from '../lib/api-client';

export interface QuotationLineItemPayload {
  itemId: string;
  partNumber?: string;
  name?: string;
  vehicle?: string;
  quantity: number;
  unitRate: number;
  mrp?: number;
  discountAmount?: number;
  taxRate: number;
  hsnCode?: string;
}

export interface CreateQuotationPayload {
  quotationNumber?: string;
  customerId?: string;
  customerName: string;
  customerMobile?: string;
  customerGstin?: string;
  vehicleDetails?: string;
  validDays?: number;
  validUntil?: string;
  isInterstate?: boolean;
  fittingCharges?: number;
  discountTotal?: number;
  remarks?: string;
  termsConditions?: string;
  items: QuotationLineItemPayload[];
}

export interface ConvertQuotationPayload {
  quotationId: string;
  paymentMode?: 'CASH' | 'UPI' | 'CARD' | 'NEFT_RTGS' | 'CHEQUE' | 'CREDIT';
  paidAmount?: number;
  paymentReference?: string;
}

export const quotationService = {
  search: async (params?: {
    customerId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    q?: string;
    page?: number;
    limit?: number;
  }) => {
    const res = await apiClient.get('/quotations/search', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get(`/quotations/${id}`);
    return res.data;
  },

  create: async (payload: CreateQuotationPayload) => {
    const res = await apiClient.post('/quotations', payload);
    return res.data;
  },

  duplicate: async (id: string) => {
    const res = await apiClient.post(`/quotations/${id}/duplicate`);
    return res.data;
  },

  convertToInvoice: async (payload: ConvertQuotationPayload) => {
    const res = await apiClient.post('/quotations/convert', payload);
    return res.data;
  }
};
