import { apiClient } from '../lib/api-client';

export interface PurchaseLineItemPayload {
  itemId: string;
  partNumber?: string;
  name?: string;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
  taxRate: number;
  hsnCode?: string;
}

export interface CreatePurchasePayload {
  poNumber?: string;
  supplierInvoiceNo?: string;
  supplierId: string;
  branchId?: string;
  invoiceDate?: string;
  dueDate?: string;
  isInterstate?: boolean;
  isNonItemized?: boolean;
  expenseCategory?: string;
  notes?: string;
  items?: PurchaseLineItemPayload[];
  taxableAmount?: number;
  taxRate?: number;
  paymentMode?: string;
  paidAmount?: number;
  paymentReference?: string;
  bankAccountId?: string;
}

export interface PurchaseReturnPayload {
  purchaseId: string;
  debitNoteNumber?: string;
  returnDate?: string;
  reason: string;
  items: Array<{
    itemId: string;
    quantity: number;
    unitPrice: number;
    defectNote?: string;
  }>;
}

export const purchaseService = {
  search: async (params?: {
    supplierId?: string;
    branchId?: string;
    status?: string;
    paymentStatus?: string;
    startDate?: string;
    endDate?: string;
    q?: string;
    page?: number;
    limit?: number;
  }) => {
    const res = await apiClient.get('/purchases/search', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get(`/purchases/${id}`);
    return res.data;
  },

  create: async (payload: CreatePurchasePayload) => {
    const res = await apiClient.post('/purchases', payload);
    return res.data;
  },

  createReturn: async (payload: PurchaseReturnPayload) => {
    const res = await apiClient.post('/purchases/returns', payload);
    return res.data;
  }
};
