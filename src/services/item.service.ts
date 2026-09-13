import { apiClient } from '../lib/api-client';

export interface ItemSearchParams {
  q?: string;
  categoryId?: string;
  brandId?: string;
  vehicle?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ItemPayload {
  sku: string;
  name: string;
  shortName?: string;
  oemPartNumber?: string;
  hsnCode?: string;
  categoryId: string;
  brandId?: string;
  unit: string;
  gstRate: number;
  maintainStock?: boolean;
  minStock?: number;
  maxStock?: number;
  reorderLevel?: number;
  rackLocation?: string;
  description?: string;
  imageUrl?: string;
  status?: string;
  customField1?: string;
  customField2?: string;
  customField3?: string;
  customField4?: string;
  customField5?: string;
  mrp: number;
  purchaseRate: number;
  sellingRate: number;
  barcodes?: Array<{
    barcode: string;
    type?: string;
    isPrimary?: boolean;
  }>;
  vehicles?: Array<{
    variantId: string;
    fromYear?: number;
    toYear?: number;
    notes?: string;
  }>;
}

export const itemService = {
  search: async (params: ItemSearchParams = {}) => {
    const res = await apiClient.get('/items/search', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get(`/items/${id}`);
    return res.data;
  },

  getByBarcode: async (barcode: string) => {
    const res = await apiClient.get(`/items/barcode/${encodeURIComponent(barcode)}`);
    return res.data;
  },

  create: async (itemData: ItemPayload) => {
    const res = await apiClient.post('/items', itemData);
    return res.data;
  },

  update: async (id: string, itemData: Partial<ItemPayload>) => {
    const res = await apiClient.put(`/items/${id}`, itemData);
    return res.data;
  },

  toggleStatus: async (id: string) => {
    const res = await apiClient.patch(`/items/${id}/status`);
    return res.data;
  },

  importItems: async (items: any[]) => {
    const res = await apiClient.post('/items/import', { items });
    return res.data;
  },

  exportItems: async (params: { ids?: string[]; categoryId?: string; brandId?: string; status?: string } = {}) => {
    const res = await apiClient.get('/items/export/data', { params });
    return res.data;
  }
};

