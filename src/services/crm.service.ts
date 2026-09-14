import { apiClient } from '../lib/api-client';

export interface CustomerSearchParams {
  q?: string;
  type?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CustomerPayload {
  name: string;
  type: 'RETAIL' | 'WORKSHOP_GARAGE' | 'WHOLESALE_DEALER' | 'COMMERCIAL_FLEET';
  mobile: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gstin?: string;
  creditLimit?: number;
  creditDays?: number;
  notes?: string;
}

export interface VehiclePayload {
  registrationNo: string;
  brand?: string;
  model: string;
  variant?: string;
  engineNo?: string;
  chassisNo?: string;
  modelYear?: number;
  color?: string;
  lastOdometer?: number;
}

export interface MechanicPayload {
  name: string;
  mobile: string;
  workshopName: string;
  workshopAddress?: string;
  commissionType: 'PERCENTAGE' | 'FLAT_PER_BILL';
  commissionRate: number;
}

export interface LoyaltyAdjustPayload {
  customerId: string;
  pointsDelta: number;
  type: 'ADMIN_ADJUSTMENT' | 'MANUAL_BONUS' | 'REDEEMED' | 'EARNED';
  notes: string;
}

export interface RecordReferralPayload {
  mechanicId: string;
  customerName: string;
  customerMobile: string;
  saleInvoiceId?: string;
  salesAmount: number;
  notes?: string;
}

export interface SendMessagePayload {
  recipientMobile: string;
  recipientName?: string;
  channel: 'WHATSAPP' | 'SMS';
  templateId?: string;
  messageBody: string;
  entityType?: string;
  entityId?: string;
}

export const crmService = {
  searchCustomers: async (params: CustomerSearchParams = {}) => {
    const res = await apiClient.get('/crm/customers', { params });
    return res.data;
  },

  createCustomer: async (payload: CustomerPayload) => {
    const res = await apiClient.post('/crm/customers', payload);
    return res.data;
  },

  getCustomerProfile: async (id: string) => {
    const res = await apiClient.get(`/crm/customers/${id}`);
    return res.data;
  },

  updateCustomer: async (id: string, payload: Partial<CustomerPayload>) => {
    const res = await apiClient.put(`/crm/customers/${id}`, payload);
    return res.data;
  },

  addVehicle: async (customerId: string, payload: VehiclePayload) => {
    const res = await apiClient.post(`/crm/customers/${customerId}/vehicles`, payload);
    return res.data;
  },

  updateVehicle: async (vehicleId: string, payload: Partial<VehiclePayload>) => {
    const res = await apiClient.put(`/crm/customers/vehicles/${vehicleId}`, payload);
    return res.data;
  },

  getMechanics: async (params: { q?: string; status?: string } = {}) => {
    const res = await apiClient.get('/crm/mechanics', { params });
    return res.data;
  },

  createMechanic: async (payload: MechanicPayload) => {
    const res = await apiClient.post('/crm/mechanics', payload);
    return res.data;
  },

  recordReferral: async (payload: RecordReferralPayload) => {
    const res = await apiClient.post('/crm/referrals', payload);
    return res.data;
  },

  updateReferralStatus: async (referralId: string, status: 'CONVERTED' | 'REWARDED' | 'EXPIRED') => {
    const res = await apiClient.patch(`/crm/referrals/${referralId}`, { status });
    return res.data;
  },

  getLoyaltyRule: async () => {
    const res = await apiClient.get('/crm/loyalty/rule');
    return res.data;
  },

  updateLoyaltyRule: async (payload: any) => {
    const res = await apiClient.put('/crm/loyalty/rule', payload);
    return res.data;
  },

  adjustLoyaltyPoints: async (payload: LoyaltyAdjustPayload) => {
    const res = await apiClient.post('/crm/loyalty/adjust', payload);
    return res.data;
  },

  getMessageTemplates: async () => {
    const res = await apiClient.get('/crm/messages/templates');
    return res.data;
  },

  createMessageTemplate: async (payload: { title: string; category: string; content: string }) => {
    const res = await apiClient.post('/crm/messages/templates', payload);
    return res.data;
  },

  sendMessage: async (payload: SendMessagePayload) => {
    const res = await apiClient.post('/crm/messages/send', payload);
    return res.data;
  },

  previewBulkAudience: async (payload: { segment: string }) => {
    const res = await apiClient.post('/crm/messages/bulk/preview', payload);
    return res.data;
  },

  sendBulkMessage: async (payload: { segment: string; channel: string; templateId?: string; customMessage?: string }) => {
    const res = await apiClient.post('/crm/messages/bulk/send', payload);
    return res.data;
  },

  getCommunicationHistory: async (params: { page?: number; limit?: number } = {}) => {
    const res = await apiClient.get('/crm/messages/history', { params });
    return res.data;
  },

  getOutstandingReminders: async () => {
    const res = await apiClient.get('/crm/reminders/outstanding');
    return res.data;
  },

  sendOutstandingReminder: async (customerId: string, payload: { channel: 'WHATSAPP' | 'SMS' }) => {
    const res = await apiClient.post(`/crm/reminders/send/${customerId}`, payload);
    return res.data;
  }
};
