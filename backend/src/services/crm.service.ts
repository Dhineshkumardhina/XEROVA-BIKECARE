import { prisma } from '../config/database.js';
import {
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerSearchDto,
  CreateCustomerVehicleDto,
  UpdateCustomerVehicleDto,
  CreateMechanicDto,
  UpdateMechanicDto,
  LoyaltyRuleDto,
  AdjustLoyaltyPointsDto,
  RecordReferralDto,
  UpdateReferralStatusDto,
  CreateMessageTemplateDto,
  SendMessageDto,
  BulkMessageDto,
  OutstandingReminderQueryDto
} from '../validators/crm.validator.js';
import { CustomerType, RecordStatus, ReferralStatus } from '@prisma/client';
import { recordAuditLog } from '../middleware/auditLogger.js';

export class CrmService {
  /**
   * 1. Map flexible customer type string to Prisma enum
   */
  private mapCustomerType(type?: string): CustomerType {
    if (!type) return CustomerType.RETAIL;
    switch (type.toUpperCase()) {
      case 'WHOLESALE':
      case 'DEALER':
      case 'WHOLESALE_DEALER':
        return CustomerType.WHOLESALE_DEALER;
      case 'MECHANIC':
      case 'WORKSHOP':
      case 'WORKSHOP_GARAGE':
        return CustomerType.WORKSHOP_GARAGE;
      case 'FLEET':
      case 'COMMERCIAL_FLEET':
        return CustomerType.COMMERCIAL_FLEET;
      case 'RETAIL':
      default:
        return CustomerType.RETAIL;
    }
  }

  /**
   * 2. Variable interpolation for Message Templates
   */
  renderTemplate(templateText: string, variables: Record<string, any> = {}): string {
    return templateText.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, key) => {
      return variables[key] !== undefined ? String(variables[key]) : `{{${key}}}`;
    });
  }

  // ============================================================================
  // CUSTOMER MANAGEMENT
  // ============================================================================

  async createCustomer(input: CreateCustomerDto, actor?: { userId?: string; username?: string }) {
    const existing = await prisma.customer.findFirst({
      where: { mobile: input.mobile }
    });
    if (existing) {
      throw new Error(`Customer with mobile number ${input.mobile} already exists (${existing.name})`);
    }

    const count = await prisma.customer.count();
    const customerCode = `CUST-${(count + 1).toString().padStart(5, '0')}`;
    const mappedType = this.mapCustomerType(input.customerType);

    const customer = await prisma.customer.create({
      data: {
        customerCode,
        name: input.name,
        mobile: input.mobile,
        email: input.email || null,
        address: input.address || null,
        city: input.city || null,
        gstin: input.gstin || null,
        customerType: mappedType,
        creditLimit: input.creditLimit,
        outstanding: input.openingBalance || 0,
        status: input.status || RecordStatus.ACTIVE
      }
    });

    // Automatically initialize Loyalty Account
    await prisma.loyaltyAccount.create({
      data: {
        customerId: customer.id,
        currentPoints: 0,
        totalEarned: 0,
        totalRedeemed: 0
      }
    });

    await recordAuditLog({
      userId: actor?.userId,
      username: actor?.username || 'Admin',
      action: 'Customer Created',
      module: 'CRM',
      entity: 'Customer',
      entityId: customer.id,
      newValue: {
        customerCode,
        name: customer.name,
        mobile: customer.mobile,
        type: customer.customerType,
        creditLimit: customer.creditLimit
      }
    });

    return customer;
  }

  async updateCustomer(id: string, input: UpdateCustomerDto, actor?: { userId?: string; username?: string }) {
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Customer not found');
    }

    const data: any = { ...input };
    if (input.customerType) {
      data.customerType = this.mapCustomerType(input.customerType);
    }

    const updated = await prisma.customer.update({
      where: { id },
      data
    });

    await recordAuditLog({
      userId: actor?.userId,
      username: actor?.username || 'Admin',
      action: 'Customer Profile Updated',
      module: 'CRM',
      entity: 'Customer',
      entityId: id,
      previousValue: existing,
      newValue: updated
    });

    return updated;
  }

  async searchCustomers(query: CustomerSearchDto) {
    const where: any = {};

    if (query.query && query.query.trim()) {
      const q = query.query.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { mobile: { contains: q } },
        { customerCode: { contains: q, mode: 'insensitive' } },
        { gstin: { contains: q, mode: 'insensitive' } },
        {
          vehicles: {
            some: {
              regNo: { contains: q, mode: 'insensitive' }
            }
          }
        }
      ];
    }

    if (query.vehicleRegNo) {
      where.vehicles = {
        some: {
          regNo: { contains: query.vehicleRegNo.trim(), mode: 'insensitive' }
        }
      };
    }

    if (query.type) {
      where.customerType = this.mapCustomerType(query.type);
    }

    if (query.hasOutstanding) {
      where.outstanding = { gt: 0 };
    }

    const skip = (query.page - 1) * query.limit;
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          vehicles: true,
          loyaltyAccount: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit
      }),
      prisma.customer.count({ where })
    ]);

    return {
      customers: customers.map((c) => ({
        id: c.id,
        customerCode: c.customerCode,
        name: c.name,
        mobile: c.mobile,
        email: c.email,
        gstin: c.gstin,
        customerType: c.customerType,
        creditLimit: Number(c.creditLimit),
        outstanding: Number(c.outstanding),
        city: c.city,
        address: c.address,
        status: c.status,
        vehicleCount: c.vehicles.length,
        loyaltyPoints: c.loyaltyAccount?.currentPoints || 0
      })),
      total,
      page: query.page,
      limit: query.limit
    };
  }

  // ============================================================================
  // COMPLETE 360° CUSTOMER PROFILE
  // ============================================================================

  async getCustomerProfile(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        vehicles: true,
        loyaltyAccount: {
          include: {
            transactions: {
              orderBy: { createdAt: 'desc' },
              take: 20
            }
          }
        },
        sales: {
          where: { status: { in: [RecordStatus.COMPLETED, RecordStatus.ACTIVE] } },
          include: {
            items: {
              include: { item: true }
            }
          },
          orderBy: { invoiceDate: 'desc' },
          take: 30
        },
        quotations: {
          orderBy: { createdAt: 'desc' },
          take: 20
        },
        receipts: {
          orderBy: { date: 'desc' },
          take: 20
        }
      }
    });

    if (!customer) {
      throw new Error('Customer profile not found');
    }

    // 1. Overview KPIs
    const totalSalesAmount = customer.sales.reduce((acc, s) => acc + Number(s.totalAmount), 0);
    const invoiceCount = customer.sales.length;
    const avgBillValue = invoiceCount > 0 ? totalSalesAmount / invoiceCount : 0;
    const lastPurchase = customer.sales.length > 0 ? customer.sales[0].invoiceDate : null;

    // 2. Returns (Credit Notes)
    const saleIds = customer.sales.map((s) => s.id);
    const returns = await prisma.saleReturn.findMany({
      where: { saleId: { in: saleIds } },
      orderBy: { returnDate: 'desc' }
    });

    // 3. Ledger Entries
    const debtorAccount = await prisma.ledgerAccount.findFirst({
      where: { accountCode: `ACC-CUST-${customer.id.slice(0, 8)}` },
      include: {
        entries: {
          orderBy: { date: 'desc' },
          take: 30
        }
      }
    });

    // 4. Communication Logs
    const messageLogs = await prisma.messageLog.findMany({
      where: { recipientMobile: customer.mobile },
      orderBy: { sentAt: 'desc' },
      take: 20
    });

    // 5. Audit Log Activities
    const activityLogs = await prisma.auditLog.findMany({
      where: {
        OR: [
          { entity: 'Customer', entityId: customer.id },
          { module: 'CRM', entityId: customer.id }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 15
    });

    // 6. Vehicles with Purchase History
    const vehiclesWithParts = customer.vehicles.map((v) => {
      const vehicleSales = customer.sales.filter((s) => s.customerVehicleId === v.id);
      const partsPurchased: Array<{ itemName: string; sku: string; qty: number; date: Date }> = [];
      for (const s of vehicleSales) {
        for (const itemLine of s.items) {
          partsPurchased.push({
            itemName: itemLine.item?.name || 'Spare Part',
            sku: itemLine.item?.sku || '',
            qty: Number(itemLine.quantity),
            date: s.invoiceDate
          });
        }
      }
      return {
        id: v.id,
        regNo: v.regNo,
        manufacturer: v.manufacturer,
        model: v.model,
        year: v.year,
        chassisNo: v.chassisNo,
        engineNo: v.engineNo,
        lastServiceKm: v.lastServiceKm,
        partsPurchased
      };
    });

    return {
      overview: {
        id: customer.id,
        customerCode: customer.customerCode,
        name: customer.name,
        mobile: customer.mobile,
        email: customer.email,
        gstin: customer.gstin,
        customerType: customer.customerType,
        creditLimit: Number(customer.creditLimit),
        outstanding: Number(customer.outstanding),
        address: customer.address,
        city: customer.city,
        status: customer.status,
        totalSales: totalSalesAmount,
        totalInvoices: invoiceCount,
        averageBillValue: Math.round(avgBillValue),
        lastPurchaseDate: lastPurchase,
        loyaltyPoints: customer.loyaltyAccount?.currentPoints || 0,
        lifetimePointsEarned: customer.loyaltyAccount?.totalEarned || 0,
        lifetimePointsRedeemed: customer.loyaltyAccount?.totalRedeemed || 0
      },
      sales: customer.sales.map((s) => ({
        id: s.id,
        invoiceNumber: s.invoiceNumber,
        invoiceDate: s.invoiceDate,
        totalAmount: Number(s.totalAmount),
        paidAmount: Number(s.paidAmount),
        paymentMode: s.paymentMode,
        status: s.status,
        itemCount: s.items.length
      })),
      quotations: customer.quotations.map((q) => ({
        id: q.id,
        quotationNumber: q.quotationNumber,
        createdAt: q.createdAt,
        validUntil: q.validUntil,
        totalAmount: Number(q.totalAmount),
        status: q.status,
        convertedInvoiceNo: q.convertedInvoiceNo
      })),
      returns: returns.map((r) => ({
        id: r.id,
        creditNoteNumber: r.creditNoteNumber,
        returnDate: r.returnDate,
        refundAmount: Number(r.refundAmount),
        reason: r.reason
      })),
      ledger: debtorAccount?.entries.map((e) => ({
        id: e.id,
        date: e.date,
        voucherType: e.voucherType,
        voucherNo: e.voucherNo,
        particulars: e.particulars,
        debit: Number(e.debit),
        credit: Number(e.credit),
        balanceAfter: Number(e.balanceAfter)
      })) || [],
      payments: customer.receipts.map((r) => ({
        id: r.id,
        receiptNo: r.receiptNo,
        date: r.date,
        amount: Number(r.amount),
        paymentMode: r.paymentMode,
        referenceNo: r.referenceNo,
        status: r.status
      })),
      vehicles: vehiclesWithParts,
      loyalty: {
        pointsBalance: customer.loyaltyAccount?.currentPoints || 0,
        totalEarned: customer.loyaltyAccount?.totalEarned || 0,
        totalRedeemed: customer.loyaltyAccount?.totalRedeemed || 0,
        history: customer.loyaltyAccount?.transactions || []
      },
      communication: messageLogs,
      activity: activityLogs
    };
  }

  // ============================================================================
  // CUSTOMER VEHICLES
  // ============================================================================

  async addCustomerVehicle(customerId: string, input: CreateCustomerVehicleDto) {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) throw new Error('Customer not found');

    const cleanReg = input.regNo.trim().toUpperCase();
    const existing = await prisma.customerVehicle.findUnique({ where: { regNo: cleanReg } });
    if (existing) {
      throw new Error(`Vehicle registration ${cleanReg} is already registered`);
    }

    const fullModel = input.variant ? `${input.model} ${input.variant}`.trim() : input.model;

    return await prisma.customerVehicle.create({
      data: {
        customerId,
        regNo: cleanReg,
        manufacturer: input.manufacturer,
        model: fullModel,
        year: input.year || null,
        chassisNo: input.chassisNo || null,
        engineNo: input.engineNo || null,
        lastServiceKm: input.lastServiceKm || null
      }
    });
  }

  async updateCustomerVehicle(vehicleId: string, input: UpdateCustomerVehicleDto) {
    const updateData: any = {};
    if (input.regNo) updateData.regNo = input.regNo.trim().toUpperCase();
    if (input.manufacturer) updateData.manufacturer = input.manufacturer;
    if (input.model) updateData.model = input.variant ? `${input.model} ${input.variant}`.trim() : input.model;
    if (input.year !== undefined) updateData.year = input.year;
    if (input.chassisNo !== undefined) updateData.chassisNo = input.chassisNo;
    if (input.engineNo !== undefined) updateData.engineNo = input.engineNo;
    if (input.lastServiceKm !== undefined) updateData.lastServiceKm = input.lastServiceKm;

    return await prisma.customerVehicle.update({
      where: { id: vehicleId },
      data: updateData
    });
  }

  // ============================================================================
  // MECHANIC MANAGEMENT & REFERRALS
  // ============================================================================

  async createMechanic(input: CreateMechanicDto, actor?: { userId?: string; username?: string }) {
    const existing = await prisma.mechanic.findUnique({ where: { mobile: input.mobile } });
    if (existing) throw new Error(`Mechanic with mobile ${input.mobile} already registered`);

    const count = await prisma.mechanic.count();
    const mechanicCode = input.referralCode || `MECH-${(count + 1).toString().padStart(4, '0')}`;

    const mechanic = await prisma.mechanic.create({
      data: {
        mechanicCode,
        name: input.name,
        workshopName: input.workshopName,
        mobile: input.mobile,
        area: input.area || null,
        commissionRatePct: input.commissionRatePct,
        status: input.status || RecordStatus.ACTIVE
      }
    });

    await recordAuditLog({
      userId: actor?.userId,
      username: actor?.username || 'Admin',
      action: 'Mechanic Created',
      module: 'CRM',
      entity: 'Mechanic',
      entityId: mechanic.id,
      newValue: mechanic
    });

    return mechanic;
  }

  async getMechanics() {
    const mechanics = await prisma.mechanic.findMany({
      include: {
        referrals: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { totalReferredSales: 'desc' }
    });

    return mechanics.map((m) => ({
      id: m.id,
      mechanicCode: m.mechanicCode,
      name: m.name,
      workshopName: m.workshopName,
      mobile: m.mobile,
      area: m.area,
      commissionRatePct: Number(m.commissionRatePct),
      totalReferredSales: Number(m.totalReferredSales),
      pendingCommission: Number(m.pendingCommission),
      status: m.status,
      referralCount: m.referrals.length,
      successfulReferrals: m.referrals.filter((r) => r.status === ReferralStatus.REWARDED).length
    }));
  }

  async recordReferral(input: RecordReferralDto) {
    return await prisma.referral.create({
      data: {
        mechanicId: input.mechanicId || null,
        referredCustId: input.referredCustomerId || null,
        invoiceNumber: input.invoiceNumber,
        saleAmount: input.saleAmount,
        rewardCash: input.rewardCash,
        rewardPoints: input.rewardPoints,
        status: ReferralStatus.PENDING
      }
    });
  }

  async updateReferralStatus(referralId: string, input: UpdateReferralStatusDto, actor?: { userId?: string; username?: string }) {
    const referral = await prisma.referral.findUnique({
      where: { id: referralId },
      include: { mechanic: true }
    });
    if (!referral) throw new Error('Referral record not found');

    const mappedStatus = input.status as ReferralStatus;

    const updated = await prisma.referral.update({
      where: { id: referralId },
      data: {
        status: mappedStatus,
        rewardCash: input.rewardCash !== undefined ? input.rewardCash : referral.rewardCash,
        rewardPoints: input.rewardPoints !== undefined ? input.rewardPoints : referral.rewardPoints
      }
    });

    // If marked as rewarded or successful and mechanic is linked, update mechanic totals
    if (mappedStatus === ReferralStatus.REWARDED && referral.mechanicId) {
      await prisma.mechanic.update({
        where: { id: referral.mechanicId },
        data: {
          totalReferredSales: { increment: Number(referral.saleAmount) },
          pendingCommission: { decrement: Number(updated.rewardCash) }
        }
      });
    }

    await recordAuditLog({
      userId: actor?.userId,
      username: actor?.username || 'Admin',
      action: 'Referral Status Updated',
      module: 'CRM',
      entity: 'Referral',
      entityId: referralId,
      newValue: { status: mappedStatus, rewardCash: updated.rewardCash }
    });

    return updated;
  }

  // ============================================================================
  // LOYALTY PROGRAM & POINTS ENGINE
  // ============================================================================

  async getLoyaltyRule(): Promise<LoyaltyRuleDto> {
    let rule = await prisma.loyaltyRule.findFirst({ where: { isActive: true } });
    if (!rule) {
      rule = await prisma.loyaltyRule.create({
        data: {
          pointsPerRupeesSpent: 100.0,
          redemptionValuePerPoint: 1.0,
          minRedemptionPoints: 50,
          maxRedemptionPct: 30.0,
          expiryDays: 365,
          isActive: true
        }
      });
    }

    return {
      pointsPerRupeesSpent: Number(rule.pointsPerRupeesSpent),
      redemptionValuePerPoint: Number(rule.redemptionValuePerPoint),
      minRedemptionPoints: rule.minRedemptionPoints,
      maxRedemptionPct: Number(rule.maxRedemptionPct),
      expiryDays: rule.expiryDays,
      isActive: rule.isActive
    };
  }

  async updateLoyaltyRule(input: LoyaltyRuleDto, actor?: { userId?: string; username?: string }) {
    const existing = await prisma.loyaltyRule.findFirst();
    let updated;
    if (existing) {
      updated = await prisma.loyaltyRule.update({
        where: { id: existing.id },
        data: input
      });
    } else {
      updated = await prisma.loyaltyRule.create({ data: input });
    }

    await recordAuditLog({
      userId: actor?.userId,
      username: actor?.username || 'Admin',
      action: 'Loyalty Rules Updated',
      module: 'CRM',
      entity: 'LoyaltyRule',
      entityId: updated.id,
      newValue: input
    });

    return updated;
  }

  /**
   * Automatically calculate and grant loyalty points on sale
   */
  async grantSalePoints(customerId: string, saleAmount: number, invoiceNumber: string, tx?: any) {
    const db = tx || prisma;
    const rule = await this.getLoyaltyRule();
    if (!rule.isActive || rule.pointsPerRupeesSpent <= 0) return 0;

    const pointsEarned = Math.floor(saleAmount / rule.pointsPerRupeesSpent);
    if (pointsEarned <= 0) return 0;

    let account = await db.loyaltyAccount.findUnique({ where: { customerId } });
    if (!account) {
      account = await db.loyaltyAccount.create({
        data: { customerId, currentPoints: 0, totalEarned: 0, totalRedeemed: 0 }
      });
    }

    const newBalance = account.currentPoints + pointsEarned;
    await db.loyaltyAccount.update({
      where: { customerId },
      data: {
        currentPoints: newBalance,
        totalEarned: { increment: pointsEarned }
      }
    });

    await db.loyaltyTransaction.create({
      data: {
        accountId: account.id,
        type: 'EARNED',
        pointsDelta: pointsEarned,
        balanceAfter: newBalance,
        reference: invoiceNumber,
        notes: `Earned ${pointsEarned} points on invoice ${invoiceNumber} (₹${saleAmount})`
      }
    });

    return pointsEarned;
  }

  /**
   * Redeem loyalty points against an invoice
   */
  async redeemPoints(customerId: string, pointsToRedeem: number, invoiceTotal: number, invoiceNumber: string, tx?: any) {
    const db = tx || prisma;
    const rule = await this.getLoyaltyRule();
    if (!rule.isActive) throw new Error('Loyalty program is not currently active');

    const account = await db.loyaltyAccount.findUnique({ where: { customerId } });
    if (!account || account.currentPoints < pointsToRedeem) {
      throw new Error(`Insufficient loyalty points (Available: ${account?.currentPoints || 0}, Requested: ${pointsToRedeem})`);
    }

    if (pointsToRedeem < rule.minRedemptionPoints) {
      throw new Error(`Minimum ${rule.minRedemptionPoints} points required for redemption`);
    }

    const discountValue = pointsToRedeem * rule.redemptionValuePerPoint;
    const maxDiscountAllowed = (invoiceTotal * rule.maxRedemptionPct) / 100;

    if (discountValue > maxDiscountAllowed) {
      throw new Error(`Redemption discount (₹${discountValue}) exceeds maximum allowed ${rule.maxRedemptionPct}% of bill (₹${maxDiscountAllowed.toFixed(2)})`);
    }

    const newBalance = account.currentPoints - pointsToRedeem;
    await db.loyaltyAccount.update({
      where: { customerId },
      data: {
        currentPoints: newBalance,
        totalRedeemed: { increment: pointsToRedeem }
      }
    });

    await db.loyaltyTransaction.create({
      data: {
        accountId: account.id,
        type: 'REDEEMED',
        pointsDelta: -pointsToRedeem,
        balanceAfter: newBalance,
        reference: invoiceNumber,
        notes: `Redeemed ${pointsToRedeem} points for ₹${discountValue} discount on ${invoiceNumber}`
      }
    });

    return { pointsRedeemed: pointsToRedeem, discountValue, newBalance };
  }

  /**
   * Manual Point Adjustment (Requires permission & audit log)
   */
  async adjustLoyaltyPoints(input: AdjustLoyaltyPointsDto, actor?: { userId?: string; username?: string }) {
    let account = await prisma.loyaltyAccount.findUnique({ where: { customerId: input.customerId } });
    if (!account) {
      account = await prisma.loyaltyAccount.create({
        data: { customerId: input.customerId, currentPoints: 0, totalEarned: 0, totalRedeemed: 0 }
      });
    }

    const newBalance = Math.max(0, account.currentPoints + input.pointsDelta);
    await prisma.loyaltyAccount.update({
      where: { customerId: input.customerId },
      data: {
        currentPoints: newBalance,
        ...(input.pointsDelta > 0 ? { totalEarned: { increment: input.pointsDelta } } : {})
      }
    });

    const tx = await prisma.loyaltyTransaction.create({
      data: {
        accountId: account.id,
        type: input.type,
        pointsDelta: input.pointsDelta,
        balanceAfter: newBalance,
        reference: `ADJ-${Date.now()}`,
        notes: `${input.reason} (By: ${actor?.username || 'Admin'})`
      }
    });

    await recordAuditLog({
      userId: actor?.userId,
      username: actor?.username || 'Admin',
      action: 'Loyalty Points Adjusted',
      module: 'CRM',
      entity: 'LoyaltyAccount',
      entityId: account.id,
      newValue: { pointsDelta: input.pointsDelta, newBalance, reason: input.reason }
    });

    return { success: true, newBalance, transaction: tx };
  }

  // ============================================================================
  // MESSAGING INFRASTRUCTURE & TEMPLATES
  // ============================================================================

  async getMessageTemplates() {
    let templates = await prisma.messageTemplate.findMany({
      where: { isActive: true }
    });

    if (templates.length === 0) {
      // Seed default industry standard templates
      const defaults = [
        {
          name: 'Invoice Receipt Notification',
          channel: 'WHATSAPP',
          category: 'INVOICE',
          bodyText: 'Dear {{customer_name}}, thank you for choosing BIKE ERP. Your invoice {{invoice_number}} for ₹{{amount}} has been generated. Loyalty points earned: {{points}}.',
          placeholders: ['customer_name', 'invoice_number', 'amount', 'points']
        },
        {
          name: 'Payment Receipt Confirmation',
          channel: 'WHATSAPP',
          category: 'RECEIPT',
          bodyText: 'Dear {{customer_name}}, we have received your payment of ₹{{amount}} against receipt {{receipt_no}}. Current outstanding balance: ₹{{outstanding}}.',
          placeholders: ['customer_name', 'amount', 'receipt_no', 'outstanding']
        },
        {
          name: 'Outstanding Payment Reminder',
          channel: 'WHATSAPP',
          category: 'REMINDER',
          bodyText: 'Dear {{customer_name}}, a gentle reminder that your pending balance of ₹{{outstanding}} is overdue. Please settle at your earliest convenience.',
          placeholders: ['customer_name', 'outstanding']
        },
        {
          name: 'Loyalty Points Milestone',
          channel: 'WHATSAPP',
          category: 'LOYALTY',
          bodyText: 'Hello {{customer_name}}, you currently have {{points}} loyalty points ready to be redeemed on your next bike service or spare parts purchase!',
          placeholders: ['customer_name', 'points']
        },
        {
          name: 'Service Due Promotional',
          channel: 'SMS',
          category: 'PROMOTIONAL',
          bodyText: 'Hi {{customer_name}}, special monsoon checkup offer for your {{vehicle_model}}! Get 10% off on engine oil & genuine spares this week.',
          placeholders: ['customer_name', 'vehicle_model']
        }
      ];

      for (const d of defaults) {
        await prisma.messageTemplate.create({ data: d });
      }

      templates = await prisma.messageTemplate.findMany({ where: { isActive: true } });
    }

    return templates;
  }

  async createMessageTemplate(input: CreateMessageTemplateDto, actor?: { userId?: string; username?: string }) {
    const template = await prisma.messageTemplate.create({
      data: input
    });

    await recordAuditLog({
      userId: actor?.userId,
      username: actor?.username || 'Admin',
      action: 'Message Template Created',
      module: 'CRM',
      entity: 'MessageTemplate',
      entityId: template.id,
      newValue: input
    });

    return template;
  }

  async sendMessage(input: SendMessageDto, actor?: { userId?: string; username?: string }) {
    let finalMessage = input.messageText;

    if (input.templateId) {
      const tpl = await prisma.messageTemplate.findUnique({ where: { id: input.templateId } });
      if (tpl) {
        finalMessage = this.renderTemplate(tpl.bodyText, input.variables || {});
      }
    } else if (input.variables) {
      finalMessage = this.renderTemplate(input.messageText, input.variables);
    }

    const log = await prisma.messageLog.create({
      data: {
        recipientMobile: input.recipientMobile,
        recipientName: input.recipientName || 'Customer',
        channel: input.channel,
        category: input.category,
        messageText: finalMessage,
        status: 'DELIVERED',
        sentAt: new Date()
      }
    });

    await recordAuditLog({
      userId: actor?.userId,
      username: actor?.username || 'Staff',
      action: 'Message Sent',
      module: 'CRM',
      entity: 'MessageLog',
      entityId: log.id,
      newValue: { recipient: input.recipientMobile, channel: input.channel }
    });

    return log;
  }

  // ============================================================================
  // BULK MESSAGING & AUDIENCE SEGMENTATION
  // ============================================================================

  async getSegmentedAudience(segment: string, filters?: any): Promise<Array<{ id: string; name: string; mobile: string; outstanding: number; points: number }>> {
    let where: any = { status: RecordStatus.ACTIVE };

    switch (segment) {
      case 'RETAIL':
        where.customerType = CustomerType.RETAIL;
        break;
      case 'WHOLESALE':
        where.customerType = CustomerType.WHOLESALE_DEALER;
        break;
      case 'MECHANICS':
        where.customerType = CustomerType.WORKSHOP_GARAGE;
        break;
      case 'LOYALTY_MEMBERS':
        where.loyaltyAccount = { currentPoints: { gt: 0 } };
        break;
      case 'OUTSTANDING_CUSTOMERS':
        where.outstanding = { gt: filters?.minOutstanding || 0 };
        break;
      case 'INACTIVE_CUSTOMERS': {
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() - (filters?.inactiveDays || 60));
        where.sales = {
          none: {
            invoiceDate: { gte: thresholdDate }
          }
        };
        break;
      }
      case 'HIGH_VALUE_CUSTOMERS': {
        where.sales = {
          some: {
            totalAmount: { gte: filters?.minLifetimeSales || 10000 }
          }
        };
        break;
      }
      case 'VEHICLE_BASED': {
        if (filters?.vehicleManufacturer || filters?.vehicleModel) {
          where.vehicles = {
            some: {
              ...(filters.vehicleManufacturer ? { manufacturer: { contains: filters.vehicleManufacturer, mode: 'insensitive' } } : {}),
              ...(filters.vehicleModel ? { model: { contains: filters.vehicleModel, mode: 'insensitive' } } : {})
            }
          };
        }
        break;
      }
      case 'ALL':
      default:
        break;
    }

    const customers = await prisma.customer.findMany({
      where,
      include: { loyaltyAccount: true }
    });

    return customers.map((c) => ({
      id: c.id,
      name: c.name,
      mobile: c.mobile,
      outstanding: Number(c.outstanding),
      points: c.loyaltyAccount?.currentPoints || 0
    }));
  }

  async previewBulkAudience(input: BulkMessageDto) {
    const audience = await this.getSegmentedAudience(input.segment, input.filters);
    const sampleRecipient = audience[0] || { name: 'Valued Customer', mobile: '9876543210', outstanding: 2500, points: 150 };

    const sampleVariables = {
      customer_name: sampleRecipient.name,
      outstanding: sampleRecipient.outstanding,
      points: sampleRecipient.points,
      ...(input.variables || {})
    };

    let previewMessage = input.messageText;
    if (input.templateId) {
      const tpl = await prisma.messageTemplate.findUnique({ where: { id: input.templateId } });
      if (tpl) {
        previewMessage = this.renderTemplate(tpl.bodyText, sampleVariables);
      }
    } else {
      previewMessage = this.renderTemplate(input.messageText, sampleVariables);
    }

    return {
      segment: input.segment,
      recipientCount: audience.length,
      sampleRecipients: audience.slice(0, 5),
      previewMessage
    };
  }

  async sendBulkMessage(input: BulkMessageDto, actor?: { userId?: string; username?: string }) {
    if (!input.isConfirmed) {
      throw new Error('Bulk transmission requires explicit confirmation confirmation flag');
    }

    const audience = await this.getSegmentedAudience(input.segment, input.filters);
    if (audience.length === 0) {
      throw new Error(`No active recipients found for segment ${input.segment}`);
    }

    let templateBody = input.messageText;
    if (input.templateId) {
      const tpl = await prisma.messageTemplate.findUnique({ where: { id: input.templateId } });
      if (tpl) templateBody = tpl.bodyText;
    }

    const logs = [];
    for (const recipient of audience) {
      const msg = this.renderTemplate(templateBody, {
        customer_name: recipient.name,
        outstanding: recipient.outstanding,
        points: recipient.points,
        ...(input.variables || {})
      });

      const log = await prisma.messageLog.create({
        data: {
          recipientMobile: recipient.mobile,
          recipientName: recipient.name,
          channel: input.channel,
          category: input.category,
          messageText: msg,
          status: 'DELIVERED',
          sentAt: new Date()
        }
      });
      logs.push(log);
    }

    await recordAuditLog({
      userId: actor?.userId,
      username: actor?.username || 'Admin',
      action: 'Bulk Message Broadcast Sent',
      module: 'CRM',
      entity: 'MessageLog',
      newValue: { segment: input.segment, recipientCount: audience.length, channel: input.channel }
    });

    return {
      success: true,
      deliveredCount: logs.length,
      segment: input.segment
    };
  }

  // ============================================================================
  // OUTSTANDING REMINDERS & PAYMENT TRACKING
  // ============================================================================

  async getOutstandingReminders(query: OutstandingReminderQueryDto) {
    const where: any = {
      outstanding: { gt: query.minOutstanding || 0 },
      status: RecordStatus.ACTIVE
    };

    if (query.customerType) {
      where.customerType = this.mapCustomerType(query.customerType);
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        sales: {
          where: { status: RecordStatus.COMPLETED },
          orderBy: { invoiceDate: 'asc' }
        }
      },
      orderBy: { outstanding: 'desc' }
    });

    const results = [];
    for (const c of customers) {
      const unpaidSales = c.sales.filter((s) => Number(s.totalAmount) > Number(s.paidAmount));
      const oldestDue = unpaidSales.length > 0 ? unpaidSales[0].invoiceDate : c.createdAt;
      const overdueDays = Math.floor((new Date().getTime() - oldestDue.getTime()) / (1000 * 60 * 60 * 24));

      if (overdueDays >= (query.minOverdueDays || 0)) {
        const lastReminderLog = await prisma.messageLog.findFirst({
          where: { recipientMobile: c.mobile, category: 'REMINDER' },
          orderBy: { sentAt: 'desc' }
        });

        results.push({
          customerId: c.id,
          customerCode: c.customerCode,
          name: c.name,
          mobile: c.mobile,
          customerType: c.customerType,
          outstanding: Number(c.outstanding),
          invoiceCount: unpaidSales.length,
          oldestDue,
          overdueDays,
          lastReminderSent: lastReminderLog?.sentAt || null
        });
      }
    }

    return results;
  }

  async sendOutstandingReminder(customerId: string, channel: 'WHATSAPP' | 'SMS' = 'WHATSAPP', actor?: { userId?: string; username?: string }) {
    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) throw new Error('Customer not found');
    if (Number(customer.outstanding) <= 0) throw new Error('Customer has no pending outstanding balance');

    const msg = `Dear ${customer.name}, friendly reminder that your pending balance of ₹${Number(customer.outstanding).toFixed(2)} with BIKE ERP is due. Please settle via UPI / Bank or visit the store. Thank you!`;

    const log = await prisma.messageLog.create({
      data: {
        recipientMobile: customer.mobile,
        recipientName: customer.name,
        channel,
        category: 'REMINDER',
        messageText: msg,
        status: 'DELIVERED',
        sentAt: new Date()
      }
    });

    await recordAuditLog({
      userId: actor?.userId,
      username: actor?.username || 'Staff',
      action: 'Outstanding Reminder Sent',
      module: 'CRM',
      entity: 'Customer',
      entityId: customer.id,
      newValue: { outstanding: customer.outstanding, channel }
    });

    return { success: true, log };
  }

  async getCommunicationHistory(mobile?: string) {
    return await prisma.messageLog.findMany({
      where: mobile ? { recipientMobile: mobile } : {},
      orderBy: { sentAt: 'desc' },
      take: 100
    });
  }
}

export const crmService = new CrmService();
