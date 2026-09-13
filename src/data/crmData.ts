import {
  CustomerProfileData,
  MechanicRecord,
  LoyaltyRuleConfig,
  LoyaltyTransactionRecord,
  ReferralRecord,
  MessageTemplate,
  CommunicationLogRecord,
  OutstandingReminderRecord,
  CustomerSegment,
  CustomerQuotation,
  CustomerSalesReturn
} from '../types';

export const INITIAL_CRM_CUSTOMERS: CustomerProfileData[] = [];

export const INITIAL_MECHANICS: MechanicRecord[] = [];

export const INITIAL_LOYALTY_RULES: LoyaltyRuleConfig = {
  pointsPerRupeesSpent: 100, // ₹100 = 1 point
  pointsPerReferral: 50,     // 50 points per referral
  bonusPointsNewCustomer: 100, // 100 points on 1st purchase
  redemptionValuePerPoint: 1.0, // 1 point = ₹1.00 discount
  minRedemptionPoints: 200,   // Minimum 200 points to redeem
  expiryPeriodDays: 365,      // Valid for 1 year
  mechanicBonusPercent: 2.0   // 2% extra bonus points on workshop volume
};

export const INITIAL_LOYALTY_TRANSACTIONS: LoyaltyTransactionRecord[] = [];

export const INITIAL_REFERRALS: ReferralRecord[] = [];

export const INITIAL_MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Invoice Confirmation & Receipt',
    category: 'Invoice',
    channel: 'WhatsApp',
    subject: 'Invoice {invoice_no} Generated',
    body: 'Dear {customer_name}, thank you for purchasing from {company_name}. Your invoice {invoice_no} for Rs.{amount} has been generated.',
    variables: ['customer_name', 'company_name', 'invoice_no', 'amount'],
    isSystem: true
  },
  {
    id: 'tpl-2',
    name: 'Payment Due Reminder',
    category: 'Payment Reminder',
    channel: 'WhatsApp',
    subject: 'Payment Reminder - Balance Rs.{amount}',
    body: 'Dear {customer_name}, your outstanding balance with {company_name} is Rs.{amount}. Kindly arrange payment via UPI/Bank transfer.',
    variables: ['customer_name', 'company_name', 'amount'],
    isSystem: true
  },
  {
    id: 'tpl-3',
    name: 'Loyalty Points Balance Alert',
    category: 'Loyalty',
    channel: 'WhatsApp',
    subject: 'Your Loyalty Balance: {points} Points',
    body: 'Hello {customer_name}, your loyalty reward balance at {company_name} is {points} points (worth Rs.{points} discount on next visit).',
    variables: ['customer_name', 'company_name', 'points'],
    isSystem: true
  },
  {
    id: 'tpl-4',
    name: 'Welcome & Registration',
    category: 'Welcome',
    channel: 'WhatsApp',
    subject: 'Welcome to {company_name}',
    body: 'Hi {customer_name}, welcome to {company_name}! We are your trusted partner for genuine bike spares and workshop care.',
    variables: ['customer_name', 'company_name'],
    isSystem: true
  }
];

export const INITIAL_COMMUNICATION_LOGS: CommunicationLogRecord[] = [];

export const INITIAL_OUTSTANDING_REMINDERS: OutstandingReminderRecord[] = [];

export const INITIAL_CUSTOMER_SEGMENTS: CustomerSegment[] = [
  {
    id: 'seg-1',
    name: 'High Value (Gold & VIP)',
    description: 'Lifetime purchases > ₹1,00,000 with strong repeat orders',
    icon: 'star',
    color: 'text-secondary',
    criteria: 'totalSales >= 100000',
    customerCount: 0,
    totalSales: 0,
    isSystem: true
  },
  {
    id: 'seg-2',
    name: 'Frequent Buyers',
    description: 'More than 15 lifetime orders and active in past 30 days',
    icon: 'repeat',
    color: 'text-on-tertiary-container',
    criteria: 'totalPurchasesCount >= 15',
    customerCount: 0,
    totalSales: 0,
    isSystem: true
  },
  {
    id: 'seg-3',
    name: 'Inactive / Dormant (>45 Days)',
    description: 'No purchase in the past 45 days. Re-engagement target',
    icon: 'bedtime',
    color: 'text-error',
    criteria: 'daysSinceLastPurchase > 45',
    customerCount: 0,
    totalSales: 0,
    isSystem: true
  },
  {
    id: 'seg-4',
    name: 'Outstanding Balance Due',
    description: 'Customers with unpaid invoices > ₹0',
    icon: 'pending_actions',
    color: 'text-error',
    criteria: 'outstanding > 0',
    customerCount: 0,
    totalSales: 0,
    isSystem: true
  },
  {
    id: 'seg-5',
    name: 'New Counter Customers',
    description: 'Registered within the last 90 days',
    icon: 'person_add',
    color: 'text-secondary-fixed-dim',
    criteria: 'createdDays <= 90',
    customerCount: 0,
    totalSales: 0,
    isSystem: true
  },
  {
    id: 'seg-6',
    name: 'Wholesale & Workshops',
    description: 'B2B commercial workshops and spare-parts distributors',
    icon: 'store',
    color: 'text-on-secondary-fixed',
    criteria: 'customerType in ["Wholesale", "Workshop", "Dealer", "Fleet"]',
    customerCount: 0,
    totalSales: 0,
    isSystem: true
  },
  {
    id: 'seg-7',
    name: 'Affiliated Mechanics',
    description: 'Independent bike mechanics and workshop technicians',
    icon: 'handyman',
    color: 'text-tertiary-fixed-dim',
    criteria: 'customerType == "Mechanic"',
    customerCount: 0,
    totalSales: 0,
    isSystem: true
  },
  {
    id: 'seg-8',
    name: 'Loyalty Program VIPs',
    description: 'Active loyalty club members with > 1,000 points balance',
    icon: 'stars',
    color: 'text-secondary',
    criteria: 'loyaltyPoints >= 1000',
    customerCount: 0,
    totalSales: 0,
    isSystem: true
  }
];

export const INITIAL_CUSTOMER_QUOTATIONS: CustomerQuotation[] = [];

export const INITIAL_CUSTOMER_RETURNS: CustomerSalesReturn[] = [];
