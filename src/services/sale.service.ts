import { apiClient } from '../lib/api-client';

export interface CartItemPayload {
  itemId: string;
  partNumber?: string;
  name?: string;
  quantity: number;
  unitRate: number;
  mrp?: number;
  discountAmount?: number;
  discountPercent?: number;
  taxRate: number;
  hsnCode?: string;
}

export interface SplitPaymentPayload {
  paymentMode: 'CASH' | 'UPI' | 'CARD' | 'NEFT_RTGS' | 'CHEQUE' | 'CREDIT';
  amount: number;
  referenceNo?: string;
}

export interface CreateSalePayload {
  invoiceNumber?: string;
  customerId?: string;
  customerName?: string;
  customerMobile?: string;
  customerGstin?: string;
  customerVehicleId?: string;
  vehicleRegNo?: string;
  branchId?: string;
  invoiceDate?: string;
  isInterstate?: boolean;
  isB2B?: boolean;
  fittingCharges?: number;
  freightCharges?: number;
  invoiceDiscount?: number;
  notes?: string;
  items: CartItemPayload[];
  paymentMode?: 'CASH' | 'UPI' | 'CARD' | 'NEFT_RTGS' | 'CHEQUE' | 'CREDIT';
  paidAmount?: number;
  tenderedAmount?: number;
  changeAmount?: number;
  paymentReference?: string;
  splitPayments?: SplitPaymentPayload[];
  status?: 'COMPLETED' | 'DRAFT';
}

export interface SaleReturnPayload {
  saleId: string;
  creditNoteNumber?: string;
  returnDate?: string;
  reason: string;
  refundMode?: 'CASH' | 'UPI' | 'CREDIT';
  items: Array<{
    itemId: string;
    quantity: number;
    unitRate: number;
    isRestocked?: boolean;
  }>;
}

export const saleService = {
  search: async (params?: {
    customerId?: string;
    branchId?: string;
    status?: string;
    paymentMode?: string;
    startDate?: string;
    endDate?: string;
    q?: string;
    page?: number;
    limit?: number;
  }) => {
    const res = await apiClient.get('/sales/search', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get(`/sales/${id}`);
    return res.data;
  },

  create: async (payload: CreateSalePayload) => {
    const res = await apiClient.post('/sales', payload);
    return res.data;
  },

  createReturn: async (payload: SaleReturnPayload) => {
    const res = await apiClient.post('/sales/returns', payload);
    return res.data;
  },

  getHeldBills: async () => {
    const res = await apiClient.get('/sales/held-bills');
    return res.data;
  },

  deleteHeldBill: async (id: string) => {
    const res = await apiClient.delete(`/sales/held-bills/${id}`);
    return res.data;
  }
};
