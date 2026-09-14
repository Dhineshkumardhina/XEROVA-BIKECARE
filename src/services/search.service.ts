import { apiClient } from '../lib/api-client';

export interface GlobalSearchResult {
  parts: any[];
  invoices: any[];
  customers: any[];
  suppliers: any[];
  quotations?: any[];
}

export const searchService = {
  globalSearch: async (query: string): Promise<GlobalSearchResult> => {
    if (!query || !query.trim()) {
      return { parts: [], invoices: [], customers: [], suppliers: [], quotations: [] };
    }
    const res = await apiClient.get('/search', { params: { q: query } });
    return res.data?.data || { parts: [], invoices: [], customers: [], suppliers: [], quotations: [] };
  }
};
