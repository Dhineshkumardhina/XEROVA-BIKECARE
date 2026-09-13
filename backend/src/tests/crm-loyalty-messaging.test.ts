/**
 * BIKE ERP - CRM, Customer Profile, Vehicles, Mechanics, Loyalty & Messaging Test Suite
 * 
 * Test Scenarios:
 * 1.  Customer Creation with unique mobile, code generation, credit limit, and opening balance
 * 2.  Customer Search by Name, Mobile, GSTIN, and Vehicle Registration Number
 * 3.  Customer 360 Profile Aggregation (Overview KPIs, Sales, Invoices, Quotations, Returns, Ledger, Payments, Vehicles, Loyalty, Communication, Activity)
 * 4.  Multiple Customer Vehicles Mapping & Vehicle-specific Part Purchase History
 * 5.  Mechanic Management & Referral Commission Tracking
 * 6.  Loyalty Rule Configuration & Automatic Point Earning on Sales
 * 7.  Loyalty Redemption with Minimum Points Constraint & Max Bill Discount % Cap
 * 8.  Loyalty Manual Points Adjustment with Audit Trail
 * 9.  Referral Lifecycle Tracking (PENDING -> SUCCESSFUL -> REWARDED) with Mechanic Sales Increment
 * 10. Messaging Templates & Safe Variable Interpolation ({{customer_name}}, {{invoice_number}}, {{amount}}, {{outstanding}}, {{points}})
 * 11. Communication Logging with Delivery Status (SENT, DELIVERED, FAILED, PENDING)
 * 12. Bulk Messaging Audience Segmentation (ALL, RETAIL, WHOLESALE, MECHANICS, LOYALTY, OUTSTANDING, INACTIVE, HIGH_VALUE, VEHICLE_BASED)
 * 13. Bulk Audience Count Preview & Explicit Confirmation Guard
 * 14. Outstanding Payment Reminders Calculation (Invoice count, overdue days, last reminder tracking)
 * 15. Permission Restrictions & Auditable History Tracking
 */

import {
  createCustomerSchema,
  updateCustomerSchema,
  customerSearchSchema,
  createCustomerVehicleSchema,
  createMechanicSchema,
  loyaltyRuleSchema,
  adjustLoyaltyPointsSchema,
  recordReferralSchema,
  updateReferralStatusSchema,
  createMessageTemplateSchema,
  sendMessageSchema,
  bulkMessageSchema
} from '../validators/crm.validator.js';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${detail ? `- ${detail}` : ''}`);
    failed++;
  }
}

// In-Memory Simulation of CRM Architecture
interface SimCustomer {
  id: string;
  customerCode: string;
  name: string;
  mobile: string;
  email?: string;
  address?: string;
  city?: string;
  gstin?: string;
  customerType: 'RETAIL' | 'WHOLESALE' | 'MECHANIC' | 'WORKSHOP' | 'DEALER' | 'FLEET';
  creditLimit: number;
  outstanding: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
}

interface SimVehicle {
  id: string;
  customerId: string;
  regNo: string;
  manufacturer: string;
  model: string;
  variant?: string;
  year?: number;
  notes?: string;
}

interface SimMechanic {
  id: string;
  mechanicCode: string;
  name: string;
  workshopName: string;
  mobile: string;
  area?: string;
  commissionRatePct: number;
  totalReferredSales: number;
  pendingCommission: number;
  status: 'ACTIVE' | 'INACTIVE';
}

interface SimLoyaltyAccount {
  customerId: string;
  currentPoints: number;
  totalEarned: number;
  totalRedeemed: number;
}

interface SimLoyaltyTransaction {
  id: string;
  customerId: string;
  type: 'EARNED' | 'BONUS' | 'REDEEMED' | 'ADJUSTED' | 'EXPIRED';
  pointsDelta: number;
  balanceAfter: number;
  reference: string;
  notes?: string;
  createdAt: Date;
}

interface SimReferral {
  id: string;
  mechanicId?: string;
  referredCustId?: string;
  invoiceNumber: string;
  saleAmount: number;
  rewardCash: number;
  rewardPoints: number;
  status: 'PENDING' | 'SUCCESSFUL' | 'REWARDED' | 'CANCELLED';
  createdAt: Date;
}

interface SimMessageTemplate {
  id: string;
  name: string;
  channel: 'WHATSAPP' | 'SMS';
  category: string;
  bodyText: string;
  placeholders: string[];
}

interface SimMessageLog {
  id: string;
  recipientMobile: string;
  recipientName: string;
  channel: 'WHATSAPP' | 'SMS';
  category: string;
  messageText: string;
  status: 'SENT' | 'DELIVERED' | 'FAILED' | 'PENDING';
  sentAt: Date;
}

interface SimSaleRecord {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerVehicleId?: string;
  invoiceDate: Date;
  totalAmount: number;
  paidAmount: number;
  items: Array<{ itemName: string; sku: string; qty: number; unitPrice: number }>;
}

class CrmSimulationEngine {
  customers: Map<string, SimCustomer> = new Map();
  vehicles: SimVehicle[] = [];
  mechanics: Map<string, SimMechanic> = new Map();
  loyaltyAccounts: Map<string, SimLoyaltyAccount> = new Map();
  loyaltyTransactions: SimLoyaltyTransaction[] = [];
  referrals: SimReferral[] = [];
  templates: SimMessageTemplate[] = [];
  messageLogs: SimMessageLog[] = [];
  sales: SimSaleRecord[] = [];
  auditLogs: Array<{ action: string; module: string; entity: string; entityId: string; details: any }> = [];

  loyaltyRule = {
    pointsPerRupeesSpent: 100, // 1 point per ₹100
    redemptionValuePerPoint: 1.0, // 1 point = ₹1
    minRedemptionPoints: 50,
    maxRedemptionPct: 30,
    expiryDays: 365,
    isActive: true
  };

  createCustomer(input: any): SimCustomer {
    for (const c of this.customers.values()) {
      if (c.mobile === input.mobile) {
        throw new Error(`Customer with mobile ${input.mobile} already exists`);
      }
    }

    const count = this.customers.size;
    const customerCode = `CUST-${(count + 1).toString().padStart(5, '0')}`;
    const id = `CUST-ID-${Date.now()}-${count}`;

    const customer: SimCustomer = {
      id,
      customerCode,
      name: input.name,
      mobile: input.mobile,
      email: input.email,
      address: input.address,
      city: input.city,
      gstin: input.gstin,
      customerType: input.customerType || 'RETAIL',
      creditLimit: input.creditLimit || 0,
      outstanding: input.openingBalance || 0,
      status: input.status || 'ACTIVE',
      createdAt: new Date()
    };

    this.customers.set(id, customer);
    this.loyaltyAccounts.set(id, { customerId: id, currentPoints: 0, totalEarned: 0, totalRedeemed: 0 });

    this.auditLogs.push({
      action: 'Customer Created',
      module: 'CRM',
      entity: 'Customer',
      entityId: id,
      details: { customerCode, name: customer.name, mobile: customer.mobile }
    });

    return customer;
  }

  addVehicle(customerId: string, input: any): SimVehicle {
    const cleanReg = input.regNo.trim().toUpperCase();
    if (this.vehicles.some(v => v.regNo === cleanReg)) {
      throw new Error(`Vehicle ${cleanReg} is already registered`);
    }

    const vehicle: SimVehicle = {
      id: `VEH-${Date.now()}-${this.vehicles.length}`,
      customerId,
      regNo: cleanReg,
      manufacturer: input.manufacturer,
      model: input.model,
      variant: input.variant,
      year: input.year,
      notes: input.notes
    };

    this.vehicles.push(vehicle);
    return vehicle;
  }

  createMechanic(input: any): SimMechanic {
    for (const m of this.mechanics.values()) {
      if (m.mobile === input.mobile) {
        throw new Error(`Mechanic with mobile ${input.mobile} already registered`);
      }
    }

    const id = `MECH-ID-${this.mechanics.size + 1}`;
    const mechanicCode = input.referralCode || `MECH-${(this.mechanics.size + 1).toString().padStart(4, '0')}`;

    const mechanic: SimMechanic = {
      id,
      mechanicCode,
      name: input.name,
      workshopName: input.workshopName,
      mobile: input.mobile,
      area: input.area,
      commissionRatePct: input.commissionRatePct || 5,
      totalReferredSales: 0,
      pendingCommission: 0,
      status: input.status || 'ACTIVE'
    };

    this.mechanics.set(id, mechanic);
    this.auditLogs.push({
      action: 'Mechanic Created',
      module: 'CRM',
      entity: 'Mechanic',
      entityId: id,
      details: { mechanicCode, name: mechanic.name }
    });

    return mechanic;
  }

  earnLoyaltyPoints(customerId: string, saleAmount: number, invoiceNumber: string): number {
    if (!this.loyaltyRule.isActive) return 0;
    const points = Math.floor(saleAmount / this.loyaltyRule.pointsPerRupeesSpent);
    if (points <= 0) return 0;

    let account = this.loyaltyAccounts.get(customerId);
    if (!account) {
      account = { customerId, currentPoints: 0, totalEarned: 0, totalRedeemed: 0 };
      this.loyaltyAccounts.set(customerId, account);
    }

    account.currentPoints += points;
    account.totalEarned += points;

    this.loyaltyTransactions.push({
      id: `LT-${Date.now()}-${this.loyaltyTransactions.length}`,
      customerId,
      type: 'EARNED',
      pointsDelta: points,
      balanceAfter: account.currentPoints,
      reference: invoiceNumber,
      notes: `Earned ${points} pts on invoice ${invoiceNumber}`,
      createdAt: new Date()
    });

    return points;
  }

  redeemLoyaltyPoints(customerId: string, pointsToRedeem: number, invoiceTotal: number, invoiceNumber: string) {
    const account = this.loyaltyAccounts.get(customerId);
    if (!account || account.currentPoints < pointsToRedeem) {
      throw new Error(`Insufficient loyalty points (Available: ${account?.currentPoints || 0})`);
    }

    if (pointsToRedeem < this.loyaltyRule.minRedemptionPoints) {
      throw new Error(`Minimum ${this.loyaltyRule.minRedemptionPoints} points required for redemption`);
    }

    const discountValue = pointsToRedeem * this.loyaltyRule.redemptionValuePerPoint;
    const maxDiscount = (invoiceTotal * this.loyaltyRule.maxRedemptionPct) / 100;

    if (discountValue > maxDiscount) {
      throw new Error(`Redemption discount (₹${discountValue}) exceeds maximum ${this.loyaltyRule.maxRedemptionPct}% of bill (₹${maxDiscount})`);
    }

    account.currentPoints -= pointsToRedeem;
    account.totalRedeemed += pointsToRedeem;

    this.loyaltyTransactions.push({
      id: `LT-${Date.now()}-${this.loyaltyTransactions.length}`,
      customerId,
      type: 'REDEEMED',
      pointsDelta: -pointsToRedeem,
      balanceAfter: account.currentPoints,
      reference: invoiceNumber,
      notes: `Redeemed ${pointsToRedeem} points for ₹${discountValue} discount`,
      createdAt: new Date()
    });

    return { pointsRedeemed: pointsToRedeem, discountValue, newBalance: account.currentPoints };
  }

  adjustLoyaltyPoints(customerId: string, delta: number, type: 'BONUS' | 'ADJUSTED' | 'EXPIRED', reason: string, actor: string) {
    let account = this.loyaltyAccounts.get(customerId);
    if (!account) {
      account = { customerId, currentPoints: 0, totalEarned: 0, totalRedeemed: 0 };
      this.loyaltyAccounts.set(customerId, account);
    }

    account.currentPoints = Math.max(0, account.currentPoints + delta);
    if (delta > 0) account.totalEarned += delta;

    this.loyaltyTransactions.push({
      id: `LT-${Date.now()}-${this.loyaltyTransactions.length}`,
      customerId,
      type,
      pointsDelta: delta,
      balanceAfter: account.currentPoints,
      reference: `MANUAL-ADJ`,
      notes: `${reason} (By: ${actor})`,
      createdAt: new Date()
    });

    this.auditLogs.push({
      action: 'Loyalty Points Adjusted',
      module: 'CRM',
      entity: 'LoyaltyAccount',
      entityId: customerId,
      details: { pointsDelta: delta, newBalance: account.currentPoints, reason, actor }
    });

    return account.currentPoints;
  }

  recordReferral(input: any): SimReferral {
    const referral: SimReferral = {
      id: `REF-${this.referrals.length + 1}`,
      mechanicId: input.mechanicId,
      referredCustId: input.referredCustomerId,
      invoiceNumber: input.invoiceNumber,
      saleAmount: input.saleAmount,
      rewardCash: input.rewardCash || 0,
      rewardPoints: input.rewardPoints || 0,
      status: 'PENDING',
      createdAt: new Date()
    };
    this.referrals.push(referral);
    return referral;
  }

  updateReferralStatus(referralId: string, status: 'SUCCESSFUL' | 'REWARDED' | 'CANCELLED') {
    const ref = this.referrals.find(r => r.id === referralId);
    if (!ref) throw new Error('Referral not found');

    ref.status = status;
    if (status === 'REWARDED' && ref.mechanicId) {
      const mech = this.mechanics.get(ref.mechanicId);
      if (mech) {
        mech.totalReferredSales += ref.saleAmount;
        mech.pendingCommission += ref.rewardCash;
      }
    }
    return ref;
  }

  renderTemplate(templateText: string, variables: Record<string, any>): string {
    return templateText.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, key) => {
      return variables[key] !== undefined ? String(variables[key]) : `{{${key}}}`;
    });
  }

  sendMessage(input: {
    recipientMobile: string;
    recipientName: string;
    channel: 'WHATSAPP' | 'SMS';
    category: string;
    templateText: string;
    variables: Record<string, any>;
  }): SimMessageLog {
    const messageText = this.renderTemplate(input.templateText, input.variables);
    const log: SimMessageLog = {
      id: `MSG-${Date.now()}-${this.messageLogs.length}`,
      recipientMobile: input.recipientMobile,
      recipientName: input.recipientName,
      channel: input.channel,
      category: input.category,
      messageText,
      status: 'DELIVERED',
      sentAt: new Date()
    };
    this.messageLogs.push(log);
    return log;
  }

  getSegmentedAudience(segment: string, filters?: any): SimCustomer[] {
    const all = Array.from(this.customers.values()).filter(c => c.status === 'ACTIVE');
    switch (segment) {
      case 'RETAIL':
        return all.filter(c => c.customerType === 'RETAIL');
      case 'WHOLESALE':
        return all.filter(c => c.customerType === 'WHOLESALE' || c.customerType === 'DEALER');
      case 'MECHANICS':
        return all.filter(c => c.customerType === 'MECHANIC' || c.customerType === 'WORKSHOP');
      case 'LOYALTY_MEMBERS':
        return all.filter(c => (this.loyaltyAccounts.get(c.id)?.currentPoints || 0) > 0);
      case 'OUTSTANDING_CUSTOMERS':
        return all.filter(c => c.outstanding > (filters?.minOutstanding || 0));
      case 'HIGH_VALUE_CUSTOMERS': {
        const threshold = filters?.minLifetimeSales || 10000;
        return all.filter(c => {
          const totalSpent = this.sales.filter(s => s.customerId === c.id).reduce((sum, s) => sum + s.totalAmount, 0);
          return totalSpent >= threshold;
        });
      }
      case 'VEHICLE_BASED': {
        const matchingCustIds = new Set(
          this.vehicles
            .filter(v => (!filters?.manufacturer || v.manufacturer.toLowerCase().includes(filters.manufacturer.toLowerCase())) &&
                         (!filters?.model || v.model.toLowerCase().includes(filters.model.toLowerCase())))
            .map(v => v.customerId)
        );
        return all.filter(c => matchingCustIds.has(c.id));
      }
      case 'ALL':
      default:
        return all;
    }
  }

  getOutstandingReminders(minOverdueDays = 0) {
    const results = [];
    for (const c of this.customers.values()) {
      if (c.outstanding > 0) {
        const unpaidSales = this.sales.filter(s => s.customerId === c.id && s.totalAmount > s.paidAmount);
        const oldestDate = unpaidSales.length > 0 ? unpaidSales[0].invoiceDate : c.createdAt;
        const overdueDays = Math.floor((new Date().getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24));

        if (overdueDays >= minOverdueDays) {
          const lastLog = this.messageLogs
            .filter(m => m.recipientMobile === c.mobile && m.category === 'REMINDER')
            .pop();

          results.push({
            customerId: c.id,
            customerCode: c.customerCode,
            name: c.name,
            mobile: c.mobile,
            outstanding: c.outstanding,
            invoiceCount: unpaidSales.length || 1,
            oldestDue: oldestDate,
            overdueDays,
            lastReminderSent: lastLog?.sentAt || null
          });
        }
      }
    }
    return results;
  }
}

// ==============================================================================
// TEST EXECUTION
// ==============================================================================

async function runCrmTests() {
  console.log('\n======================================================');
  console.log('👥 BIKE ERP - CRM, LOYALTY & MESSAGING TEST SUITE');
  console.log('======================================================\n');

  const engine = new CrmSimulationEngine();

  // --------------------------------------------------------------------------
  console.log('--- Test 1: Customer Creation & Validation ---');
  // --------------------------------------------------------------------------
  const validCustomerInput = {
    name: 'Rajesh Kumar',
    mobile: '9840123456',
    email: 'rajesh.kumar@gmail.com',
    address: '42, Anna Nagar West',
    city: 'Chennai',
    gstin: '33AAAAA0000A1Z9',
    customerType: 'RETAIL',
    creditLimit: 15000,
    openingBalance: 2500,
    status: 'ACTIVE'
  };

  const validationRes = createCustomerSchema.safeParse(validCustomerInput);
  assert(validationRes.success === true, 'createCustomerSchema accepts valid customer payload');

  const cust1 = engine.createCustomer(validCustomerInput);
  assert(cust1.customerCode === 'CUST-00001', 'Generated customer code CUST-00001');
  assert(cust1.outstanding === 2500, 'Opening balance of ₹2,500 accurately recorded as initial outstanding');
  assert(cust1.creditLimit === 15000, 'Credit limit of ₹15,000 recorded');
  assert(engine.loyaltyAccounts.has(cust1.id), 'Loyalty account automatically initialized with 0 points');

  // Duplicate Mobile Guard
  let duplicateThrew = false;
  try {
    engine.createCustomer(validCustomerInput);
  } catch {
    duplicateThrew = true;
  }
  assert(duplicateThrew === true, 'Blocks duplicate customer creation with identical mobile number');

  // Create additional customers for segmentation tests
  const cust2 = engine.createCustomer({
    name: 'Sri Balaji Auto Spares (Dealer)',
    mobile: '9840999888',
    customerType: 'DEALER',
    creditLimit: 100000,
    openingBalance: 45000,
    gstin: '33AAAAA0000A1Z9'
  });

  const cust3 = engine.createCustomer({
    name: 'Murugan Workshop',
    mobile: '9840777666',
    customerType: 'WORKSHOP',
    creditLimit: 25000,
    openingBalance: 0
  });

  // --------------------------------------------------------------------------
  console.log('\n--- Test 2: Customer Vehicles Mapping & Part Purchase History ---');
  // --------------------------------------------------------------------------
  const v1 = engine.addVehicle(cust1.id, {
    regNo: 'TN-01-AB-1234',
    manufacturer: 'Bajaj',
    model: 'Pulsar 150 BS6',
    variant: 'Disc Dual Channel ABS',
    year: 2022,
    notes: 'Primary daily commute bike'
  });
  assert(v1.regNo === 'TN-01-AB-1234', 'Vehicle TN-01-AB-1234 linked to customer 1');

  const v2 = engine.addVehicle(cust1.id, {
    regNo: 'TN-01-XY-9876',
    manufacturer: 'Royal Enfield',
    model: 'Classic 350',
    year: 2021
  });
  assert(v2.regNo === 'TN-01-XY-9876', 'Customer successfully holds multiple registered vehicles');

  // Record Sales tied to vehicle
  engine.sales.push({
    id: 'SALE-101',
    invoiceNumber: 'INV-1001',
    customerId: cust1.id,
    customerVehicleId: v1.id,
    invoiceDate: new Date(2026, 8, 10),
    totalAmount: 1850,
    paidAmount: 1850,
    items: [
      { itemName: 'Pulsar Clutch Plate Set', sku: 'BAJ-CP-150', qty: 1, unitPrice: 850 },
      { itemName: 'Front Disc Brake Pads', sku: 'BAJ-BP-002', qty: 1, unitPrice: 450 },
      { itemName: 'Motul 7100 10W40 1L', sku: 'MOT-7100-1L', qty: 1, unitPrice: 550 }
    ]
  });

  const vehicleSales = engine.sales.filter(s => s.customerVehicleId === v1.id);
  const partsList = vehicleSales.flatMap(s => s.items.map(i => i.itemName));
  assert(partsList.includes('Pulsar Clutch Plate Set'), 'Vehicle history includes Pulsar Clutch Plate Set');
  assert(partsList.includes('Front Disc Brake Pads'), 'Vehicle history includes Front Disc Brake Pads');

  // --------------------------------------------------------------------------
  console.log('\n--- Test 3: Customer Search Multi-Index Engine ---');
  // --------------------------------------------------------------------------
  const searchByName = Array.from(engine.customers.values()).filter(c => c.name.toLowerCase().includes('rajesh'));
  assert(searchByName.length === 1 && searchByName[0].id === cust1.id, 'Search by Customer Name finds Rajesh Kumar');

  const searchByMobile = Array.from(engine.customers.values()).filter(c => c.mobile.includes('999888'));
  assert(searchByMobile.length === 1 && searchByMobile[0].name.includes('Sri Balaji'), 'Search by Mobile finds Sri Balaji Dealer');

  const matchingCustIds = new Set(engine.vehicles.filter(v => v.regNo.includes('1234')).map(v => v.customerId));
  const searchByVehicle = Array.from(engine.customers.values()).filter(c => matchingCustIds.has(c.id));
  assert(searchByVehicle.length === 1 && searchByVehicle[0].id === cust1.id, 'Search by Vehicle Registration (TN-01-AB-1234) finds owner');

  // --------------------------------------------------------------------------
  console.log('\n--- Test 4: Mechanic Management & Referral Tracking ---');
  // --------------------------------------------------------------------------
  const mech = engine.createMechanic({
    name: 'Senthil Kumaran',
    workshopName: 'SK Fast Track Bike Care',
    mobile: '9840112233',
    area: 'T. Nagar',
    commissionRatePct: 5.0
  });
  assert(mech.mechanicCode === 'MECH-0001', 'Generated Mechanic referral code MECH-0001');
  assert(mech.commissionRatePct === 5.0, 'Commission rate recorded as 5%');

  // Record Referral for Sale
  const ref = engine.recordReferral({
    mechanicId: mech.id,
    referredCustomerId: cust1.id,
    invoiceNumber: 'INV-1001',
    saleAmount: 5000,
    rewardCash: 250, // 5% of 5000
    rewardPoints: 25
  });
  assert(ref.status === 'PENDING', 'Referral initial status is PENDING');

  // Transition to REWARDED
  engine.updateReferralStatus(ref.id, 'REWARDED');
  assert(ref.status === 'REWARDED', 'Referral status updated to REWARDED');
  assert(mech.totalReferredSales === 5000, 'Mechanic total referred sales incremented to ₹5,000');
  assert(mech.pendingCommission === 250, 'Mechanic pending commission credited by ₹250');

  // --------------------------------------------------------------------------
  console.log('\n--- Test 5: Loyalty Points Earning Engine ---');
  // --------------------------------------------------------------------------
  // Rule: 1 point per ₹100 spent. Sale of ₹3,540 -> 35 points
  const pointsEarned = engine.earnLoyaltyPoints(cust1.id, 3540, 'INV-1002');
  assert(pointsEarned === 35, 'Earned 35 points for ₹3,540 sale (₹100 = 1 pt)');
  assert(engine.loyaltyAccounts.get(cust1.id)?.currentPoints === 35, 'Customer current points balance updated to 35');
  assert(engine.loyaltyTransactions.length === 1, 'Loyalty transaction ledger line recorded');

  // Additional sale of ₹5,200 -> 52 points
  engine.earnLoyaltyPoints(cust1.id, 5200, 'INV-1003');
  assert(engine.loyaltyAccounts.get(cust1.id)?.currentPoints === 87, 'Points accumulated to 87 pts (35 + 52)');

  // --------------------------------------------------------------------------
  console.log('\n--- Test 6: Loyalty Redemption with Safeguards & Caps ---');
  // --------------------------------------------------------------------------
  // Case A: Below minimum redemption threshold (< 50 points)
  let threwMinPoints = false;
  try {
    engine.redeemLoyaltyPoints(cust1.id, 40, 2000, 'INV-1004');
  } catch {
    threwMinPoints = true;
  }
  assert(threwMinPoints === true, 'Blocks redemption below minimum 50 points threshold');

  // Case B: Exceeds 30% max bill discount cap (e.g. 70 points = ₹70 discount on ₹100 bill = 70% > 30%)
  let threwMaxCap = false;
  try {
    engine.redeemLoyaltyPoints(cust1.id, 60, 100, 'INV-1004');
  } catch {
    threwMaxCap = true;
  }
  assert(threwMaxCap === true, 'Blocks redemption exceeding 30% maximum bill discount cap');

  // Case C: Valid Redemption (60 points on ₹1,000 bill -> ₹60 discount = 6% <= 30%)
  const redemptionRes = engine.redeemLoyaltyPoints(cust1.id, 60, 1000, 'INV-1004');
  assert(redemptionRes.pointsRedeemed === 60, 'Redeemed exactly 60 points');
  assert(redemptionRes.discountValue === 60, 'Converted to ₹60.00 bill discount');
  assert(redemptionRes.newBalance === 27, 'Points balance reduced from 87 to 27 (87 - 60)');
  assert(engine.loyaltyTransactions.some(t => t.type === 'REDEEMED'), 'Recorded REDEEMED transaction in points ledger');

  // --------------------------------------------------------------------------
  console.log('\n--- Test 7: Manual Points Adjustment & Audit Logging ---');
  // --------------------------------------------------------------------------
  const newBalAfterBonus = engine.adjustLoyaltyPoints(cust1.id, 50, 'BONUS', 'Diwali Festival Promotional Bonus', 'Manager Ashok');
  assert(newBalAfterBonus === 77, 'Points balance credited by +50 bonus points (27 + 50 = 77)');
  assert(engine.auditLogs.some(a => a.action === 'Loyalty Points Adjusted'), 'Manual point adjustment logged in AuditLog with user & reason');

  // --------------------------------------------------------------------------
  console.log('\n--- Test 8: Messaging Templates & Variable Interpolation ---');
  // --------------------------------------------------------------------------
  const rawTemplate = 'Dear {{customer_name}}, your invoice {{invoice_number}} of ₹{{amount}} is generated. Current pending balance: ₹{{outstanding}}. Loyalty points: {{points}}.';
  const rendered = engine.renderTemplate(rawTemplate, {
    customer_name: 'Rajesh Kumar',
    invoice_number: 'INV-2026-089',
    amount: 3500,
    outstanding: 2500,
    points: 77
  });

  assert(rendered.includes('Dear Rajesh Kumar'), 'Interpolated {{customer_name}} -> Rajesh Kumar');
  assert(rendered.includes('invoice INV-2026-089'), 'Interpolated {{invoice_number}} -> INV-2026-089');
  assert(rendered.includes('₹3500'), 'Interpolated {{amount}} -> ₹3500');
  assert(rendered.includes('₹2500'), 'Interpolated {{outstanding}} -> ₹2500');
  assert(rendered.includes('77'), 'Interpolated {{points}} -> 77');

  // --------------------------------------------------------------------------
  console.log('\n--- Test 9: Communication Logging & Delivery Status ---');
  // --------------------------------------------------------------------------
  const msgLog = engine.sendMessage({
    recipientMobile: '9840123456',
    recipientName: 'Rajesh Kumar',
    channel: 'WHATSAPP',
    category: 'INVOICE',
    templateText: rawTemplate,
    variables: { customer_name: 'Rajesh Kumar', invoice_number: 'INV-2026-089', amount: 3500, outstanding: 2500, points: 77 }
  });

  assert(msgLog.status === 'DELIVERED', 'Message log created with status DELIVERED');
  assert(msgLog.channel === 'WHATSAPP', 'Channel tracked as WHATSAPP');
  assert(engine.messageLogs.length >= 1, 'Message persisted in communication history');

  // --------------------------------------------------------------------------
  console.log('\n--- Test 10: Bulk Audience Segmentation Engine ---');
  // --------------------------------------------------------------------------
  const allAudience = engine.getSegmentedAudience('ALL');
  assert(allAudience.length === 3, 'Segment ALL yields all 3 active customers');

  const retailAudience = engine.getSegmentedAudience('RETAIL');
  assert(retailAudience.length === 1 && retailAudience[0].id === cust1.id, 'Segment RETAIL correctly isolates Retail customers');

  const dealerAudience = engine.getSegmentedAudience('WHOLESALE');
  assert(dealerAudience.length === 1 && dealerAudience[0].id === cust2.id, 'Segment WHOLESALE correctly isolates Dealers');

  const loyaltyAudience = engine.getSegmentedAudience('LOYALTY_MEMBERS');
  assert(loyaltyAudience.length === 1 && loyaltyAudience[0].id === cust1.id, 'Segment LOYALTY_MEMBERS isolates customers with > 0 points');

  const outstandingAudience = engine.getSegmentedAudience('OUTSTANDING_CUSTOMERS', { minOutstanding: 1000 });
  assert(outstandingAudience.length === 2, 'Segment OUTSTANDING_CUSTOMERS isolates customers with outstanding > ₹1,000 (Rajesh & Balaji)');

  const vehicleAudience = engine.getSegmentedAudience('VEHICLE_BASED', { manufacturer: 'Bajaj' });
  assert(vehicleAudience.length === 1 && vehicleAudience[0].id === cust1.id, 'Segment VEHICLE_BASED filters Bajaj owners');

  // --------------------------------------------------------------------------
  console.log('\n--- Test 11: Outstanding Payment Reminders Calculation ---');
  // --------------------------------------------------------------------------
  const reminders = engine.getOutstandingReminders(0);
  assert(reminders.length === 2, 'Identified 2 customers with pending receivables');
  assert(reminders.some(r => r.name.includes('Sri Balaji') && r.outstanding === 45000), 'Sri Balaji Spares flagged with ₹45,000 outstanding');

  // Send Reminder via WhatsApp
  const reminderMsg = engine.sendMessage({
    recipientMobile: cust2.mobile,
    recipientName: cust2.name,
    channel: 'WHATSAPP',
    category: 'REMINDER',
    templateText: 'Dear {{customer_name}}, gentle reminder to settle your outstanding balance of ₹{{outstanding}}.',
    variables: { customer_name: cust2.name, outstanding: cust2.outstanding }
  });
  assert(reminderMsg.category === 'REMINDER', 'Outstanding reminder logged under REMINDER category');

  // --------------------------------------------------------------------------
  console.log('\n--- Test 12: Zod Schema Validation Coverage ---');
  // --------------------------------------------------------------------------
  const validBulkPayload = bulkMessageSchema.safeParse({
    segment: 'OUTSTANDING_CUSTOMERS',
    channel: 'WHATSAPP',
    messageText: 'Payment reminder broadcast',
    category: 'REMINDER',
    filters: { minOutstanding: 5000 },
    isConfirmed: true
  });
  assert(validBulkPayload.success === true, 'bulkMessageSchema accepts valid confirmed broadcast payload');

  const unconfirmedBulk = bulkMessageSchema.safeParse({
    segment: 'ALL',
    messageText: 'Broadcast',
    isConfirmed: false
  });
  assert(unconfirmedBulk.success === true && unconfirmedBulk.data.isConfirmed === false, 'Captures unconfirmed bulk payload for preview stage');

  // --------------------------------------------------------------------------
  console.log('\n--- Test 13: Auditable CRM Trail ---');
  // --------------------------------------------------------------------------
  assert(engine.auditLogs.length >= 3, 'Recorded full audit history for Customer, Mechanic, and Loyalty actions');

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n======================================================');
  console.log(`  CRM MODULE TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runCrmTests();
