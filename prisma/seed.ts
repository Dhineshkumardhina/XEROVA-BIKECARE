import { PrismaClient, UserRoleType, RecordStatus, StockMovementType, StockDirection, CustomerType, PaymentMode } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting BIKE ERP Database Seeding...');

  // 1. Permissions Master
  const permissionsData = [
    // Sales Permissions
    { code: 'sales.create', module: 'Sales', description: 'Create counter POS bills and sales invoices' },
    { code: 'sales.view', module: 'Sales', description: 'View sales invoices and counter register' },
    { code: 'sales.edit', module: 'Sales', description: 'Modify draft sales invoices' },
    { code: 'sales.cancel', module: 'Sales', description: 'Cancel pending sales invoices' },
    { code: 'sales.void', module: 'Sales', description: 'Void / Cancel posted sales invoices' },
    { code: 'sales.change_rate', module: 'Sales', description: 'Override default selling rate at POS counter' },
    { code: 'sales.apply_discount', module: 'Sales', description: 'Apply bill and item discounts' },
    { code: 'sales.view_profit', module: 'Sales', description: 'View gross profit margins on bills' },
    { code: 'sales.returns', module: 'Sales', description: 'Process customer returns and issue credit notes' },

    // Purchase Permissions
    { code: 'purchase.create', module: 'Purchase', description: 'Create supplier purchase orders & inward GRN' },
    { code: 'purchase.view', module: 'Purchase', description: 'View purchase orders and bills' },
    { code: 'purchase.edit', module: 'Purchase', description: 'Edit supplier purchase entries' },
    { code: 'purchase.cancel', module: 'Purchase', description: 'Cancel purchase orders and GRN entries' },
    { code: 'purchase.view_cost', module: 'Purchase', description: 'View supplier landed purchase rates' },
    { code: 'purchase.returns', module: 'Purchase', description: 'Issue debit notes to suppliers' },

    // Inventory Permissions
    { code: 'inventory.view', module: 'Inventory', description: 'View spare parts catalog and stock levels' },
    { code: 'inventory.create', module: 'Inventory', description: 'Add new spare part SKUs to catalog' },
    { code: 'inventory.create_item', module: 'Inventory', description: 'Add new spare part SKUs to catalog (alias)' },
    { code: 'inventory.edit', module: 'Inventory', description: 'Edit spare part details, pricing, HSN' },
    { code: 'inventory.edit_item', module: 'Inventory', description: 'Edit spare part details, pricing, HSN (alias)' },
    { code: 'inventory.adjust', module: 'Inventory', description: 'Perform audited stock adjustments' },
    { code: 'inventory.adjust_stock', module: 'Inventory', description: 'Perform audited stock adjustments (alias)' },
    { code: 'inventory.barcode_print', module: 'Inventory', description: 'Generate and print thermal barcode labels' },

    // Accounts Permissions
    { code: 'accounts.receipt.create', module: 'Accounts', description: 'Record customer receipt vouchers' },
    { code: 'accounts.payment.create', module: 'Accounts', description: 'Disburse supplier payment vouchers' },
    { code: 'accounts.ledger.view', module: 'Accounts', description: 'View customer and supplier account ledgers' },
    { code: 'accounts.view_ledger', module: 'Accounts', description: 'View customer and supplier account ledgers (alias)' },
    { code: 'accounts.create_receipt', module: 'Accounts', description: 'Record customer receipt vouchers (alias)' },
    { code: 'accounts.create_payment', module: 'Accounts', description: 'Disburse supplier payment vouchers (alias)' },
    { code: 'accounts.banking', module: 'Accounts', description: 'Perform bank deposits, withdrawals, contra transfers' },
    { code: 'accounts.reversal', module: 'Accounts', description: 'Post audited ledger reversal adjustments' },

    // GST Permissions
    { code: 'gst.view', module: 'GST', description: 'Access GST dashboard, GSTR-1, and GSTR-3B summaries' },
    { code: 'gst.export', module: 'GST', description: 'Export GST filing JSON payloads' },

    // CRM Permissions
    { code: 'crm.customers', module: 'CRM', description: 'Manage customer accounts, vehicles, and credit limits' },
    { code: 'crm.mechanics', module: 'CRM', description: 'Manage mechanic affiliations and commission settlements' },
    { code: 'crm.loyalty', module: 'CRM', description: 'Manage loyalty point adjustments and redemption' },
    { code: 'crm.messaging', module: 'CRM', description: 'Send SMS & WhatsApp notifications and bulk campaigns' },

    // Reports Permissions
    { code: 'reports.sales.view', module: 'Reports', description: 'View sales register and analysis reports' },
    { code: 'reports.purchase.view', module: 'Reports', description: 'View purchase summary and supplier reports' },
    { code: 'reports.profit.view', module: 'Reports', description: 'View item & category gross margin reports' },
    { code: 'reports.financial.view', module: 'Reports', description: 'View Trial Balance, P&L, and balance sheet' },
    { code: 'reports.sales', module: 'Reports', description: 'Generate sales analysis reports (alias)' },
    { code: 'reports.inventory', module: 'Reports', description: 'Generate inventory valuation and dead stock reports' },
    { code: 'reports.financial', module: 'Reports', description: 'Generate Trial Balance and P&L financial reports (alias)' },
    { code: 'reports.profitability', module: 'Reports', description: 'Generate margin and gross profit analytics (alias)' },

    // Admin Permissions
    { code: 'admin.users.manage', module: 'Admin', description: 'Create, disable, and manage ERP user accounts' },
    { code: 'admin.roles.manage', module: 'Admin', description: 'Modify role entitlements and permission matrix' },
    { code: 'admin.settings.manage', module: 'Admin', description: 'Configure company profile, numbering, tax rates' },
    { code: 'admin.backup', module: 'Admin', description: 'Generate system database snapshot backups' },
    { code: 'admin.restore', module: 'Admin', description: 'Restore database state from backup archive' },
    { code: 'admin.audit.view', module: 'Admin', description: 'Inspect enterprise security and audit trail logs' },
    { code: 'admin.manage_users', module: 'Admin', description: 'Manage ERP user accounts (alias)' },
    { code: 'admin.manage_roles', module: 'Admin', description: 'Modify role entitlements (alias)' },
    { code: 'admin.settings', module: 'Admin', description: 'Configure company settings (alias)' },
    { code: 'admin.audit_logs', module: 'Admin', description: 'Inspect security audit logs (alias)' }
  ];

  for (const p of permissionsData) {
    await prisma.permission.upsert({
      where: { code: p.code },
      update: { module: p.module, description: p.description },
      create: p
    });
  }
  console.log(`✅ Seeded ${permissionsData.length} permissions`);

  // 2. Roles Master
  const rolesData: { name: UserRoleType; displayName: string; description: string; permissions: string[] }[] = [
    {
      name: UserRoleType.SUPER_ADMIN,
      displayName: 'Super Admin',
      description: 'Unrestricted enterprise administrative & financial access',
      permissions: permissionsData.map((p) => p.code)
    },
    {
      name: UserRoleType.ADMIN,
      displayName: 'Store Admin',
      description: 'Store administration, inventory valuation, financial approvals, and user audits',
      permissions: permissionsData.map((p) => p.code).filter((c) => c !== 'admin.restore')
    },
    {
      name: UserRoleType.MANAGER,
      displayName: 'Store Manager',
      description: 'Day-to-day store operations, ledgers, payables, stock management, and reports',
      permissions: [
        'sales.create', 'sales.view', 'sales.edit', 'sales.cancel', 'sales.change_rate', 'sales.apply_discount', 'sales.returns',
        'purchase.create', 'purchase.view', 'purchase.edit', 'purchase.cancel', 'purchase.view_cost', 'purchase.returns',
        'inventory.view', 'inventory.create', 'inventory.create_item', 'inventory.edit', 'inventory.edit_item', 'inventory.adjust', 'inventory.adjust_stock', 'inventory.barcode_print',
        'accounts.receipt.create', 'accounts.payment.create', 'accounts.ledger.view', 'accounts.view_ledger', 'accounts.create_receipt', 'accounts.create_payment', 'accounts.banking',
        'gst.view', 'crm.customers', 'crm.mechanics', 'crm.loyalty', 'crm.messaging',
        'reports.sales.view', 'reports.purchase.view', 'reports.profit.view', 'reports.financial.view', 'reports.sales', 'reports.inventory', 'reports.financial', 'admin.backup'
      ]
    },
    {
      name: UserRoleType.BILLING_OPERATOR,
      displayName: 'Billing Operator',
      description: 'Fast Counter POS billing, customer search, cash receipt vouchers',
      permissions: [
        'sales.create', 'sales.view', 'sales.apply_discount', 'sales.returns',
        'inventory.view', 'inventory.barcode_print',
        'accounts.receipt.create', 'accounts.create_receipt',
        'crm.customers', 'crm.loyalty'
      ]
    },
    {
      name: UserRoleType.PURCHASE_OPERATOR,
      displayName: 'Purchase Operator',
      description: 'Purchase orders, supplier bills inward, supplier catalog',
      permissions: [
        'purchase.create', 'purchase.view', 'purchase.edit', 'purchase.cancel', 'purchase.view_cost', 'purchase.returns',
        'inventory.view', 'inventory.create', 'inventory.create_item', 'inventory.edit', 'inventory.edit_item',
        'reports.purchase.view', 'reports.inventory'
      ]
    },
    {
      name: UserRoleType.INVENTORY_OPERATOR,
      displayName: 'Inventory Operator',
      description: 'Item catalog master, bin locations, barcode printing, physical stock count',
      permissions: [
        'inventory.view', 'inventory.create', 'inventory.create_item', 'inventory.edit', 'inventory.edit_item', 'inventory.adjust', 'inventory.adjust_stock', 'inventory.barcode_print',
        'reports.inventory'
      ]
    },
    {
      name: UserRoleType.ACCOUNTS_OPERATOR,
      displayName: 'Accounts Operator',
      description: 'Receipt vouchers, payment vouchers, customer & supplier ledgers, banking',
      permissions: [
        'accounts.receipt.create', 'accounts.payment.create', 'accounts.ledger.view', 'accounts.view_ledger', 'accounts.create_receipt', 'accounts.create_payment', 'accounts.banking',
        'sales.view', 'purchase.view', 'gst.view', 'reports.financial.view', 'reports.financial'
      ]
    },
    {
      name: UserRoleType.VIEWER,
      displayName: 'Read-Only Viewer',
      description: 'Read-only view access across inventory, invoices, and sales reports',
      permissions: ['sales.view', 'purchase.view', 'inventory.view', 'reports.sales.view', 'reports.sales']
    }
  ];

  const roleMap = new Map<UserRoleType, string>();

  for (const r of rolesData) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: { displayName: r.displayName, description: r.description },
      create: { name: r.name, displayName: r.displayName, description: r.description }
    });
    roleMap.set(r.name, role.id);

    // Link permissions to role
    for (const permCode of r.permissions) {
      const perm = await prisma.permission.findUnique({ where: { code: permCode } });
      if (perm) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
          update: {},
          create: { roleId: role.id, permissionId: perm.id }
        });
      }
    }
  }
  console.log(`✅ Seeded ${rolesData.length} roles with full permissions matrix`);

  // 3. Company & Branches
  const company = await prisma.company.upsert({
    where: { gstin: '33AABCB1234A1Z5' },
    update: {},
    create: {
      tradeName: 'BIKE CARE AUTOMOTIVE ENTERPRISES',
      legalName: 'Bike Care Auto Spares Private Limited',
      gstin: '33AABCB1234A1Z5',
      pan: 'AABCB1234A',
      email: 'accounts@bikecare.erp',
      phone: '+91 98401 22334',
      addressLine1: 'Plot No. 44, Industrial Estate Road, Mount Road',
      addressLine2: 'Guindy Central Industrial Area',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600032',
      stateCode: '33',
      financialYear: '2026-2027'
    }
  });

  const mainBranch = await prisma.branch.upsert({
    where: { branchCode: 'BR-01' },
    update: {},
    create: {
      companyId: company.id,
      branchCode: 'BR-01',
      name: 'Main Branch - Chennai Central',
      isMainBranch: true,
      phone: '+91 98401 22334',
      address: 'Plot No. 44, Mount Road, Chennai - 600032'
    }
  });

  await prisma.branch.upsert({
    where: { branchCode: 'BR-02' },
    update: {},
    create: {
      companyId: company.id,
      branchCode: 'BR-02',
      name: 'Hub Warehouse - Ambattur Industrial',
      isMainBranch: false,
      phone: '+91 98401 55667',
      address: 'Phase III, Ambattur Industrial Estate, Chennai - 600058'
    }
  });
  console.log('✅ Seeded Company and Outlets');

  // 4. Default Users
  const superAdminRoleId = roleMap.get(UserRoleType.SUPER_ADMIN)!;
  const billingRoleId = roleMap.get(UserRoleType.BILLING_OPERATOR)!;
  const managerRoleId = roleMap.get(UserRoleType.MANAGER)!;

  const adminPasswordHash = await bcrypt.hash('Admin@BikeERP2026!', 10);
  const operatorPasswordHash = await bcrypt.hash('Operator@123', 10);

  const superAdminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: { passwordHash: adminPasswordHash, roleId: superAdminRoleId, branchId: mainBranch.id },
    create: {
      username: 'admin',
      email: 'admin@bikecare.erp',
      fullName: 'Rajesh Kumar (Super Admin)',
      phone: '+91 98401 11223',
      passwordHash: adminPasswordHash,
      roleId: superAdminRoleId,
      branchId: mainBranch.id,
      status: RecordStatus.ACTIVE
    }
  });

  await prisma.user.upsert({
    where: { username: 'kavitha' },
    update: { passwordHash: operatorPasswordHash, roleId: billingRoleId, branchId: mainBranch.id },
    create: {
      username: 'kavitha',
      email: 'kavitha@bikecare.erp',
      fullName: 'Kavitha S. (Counter Billing)',
      phone: '+91 98402 33445',
      passwordHash: operatorPasswordHash,
      roleId: billingRoleId,
      branchId: mainBranch.id,
      status: RecordStatus.ACTIVE
    }
  });

  await prisma.user.upsert({
    where: { username: 'suresh' },
    update: { passwordHash: operatorPasswordHash, roleId: managerRoleId, branchId: mainBranch.id },
    create: {
      username: 'suresh',
      email: 'suresh@bikecare.erp',
      fullName: 'Suresh Raina (Store Manager)',
      phone: '+91 98403 44556',
      passwordHash: operatorPasswordHash,
      roleId: managerRoleId,
      branchId: mainBranch.id,
      status: RecordStatus.ACTIVE
    }
  });
  console.log('✅ Seeded Users (admin, kavitha, suresh)');

  // 5. Document Numbering Sequences
  const sequences = [
    { documentType: 'INVOICE', prefix: 'INV/2026-27/', nextNumber: 10290 },
    { documentType: 'PURCHASE', prefix: 'PO/2026-27/', nextNumber: 8415 },
    { documentType: 'RECEIPT', prefix: 'REC/2026-27/', nextNumber: 9045 },
    { documentType: 'PAYMENT', prefix: 'PAY/2026-27/', nextNumber: 4210 },
    { documentType: 'QUOTATION', prefix: 'EST/2026-27/', nextNumber: 85 },
    { documentType: 'CREDIT_NOTE', prefix: 'CN/2026-27/', nextNumber: 15 },
    { documentType: 'DEBIT_NOTE', prefix: 'DN/2026-27/', nextNumber: 10 }
  ];

  for (const s of sequences) {
    await prisma.numberingSequence.upsert({
      where: { documentType: s.documentType },
      update: s,
      create: s
    });
  }
  console.log('✅ Seeded Document Numbering Sequences');

  // 6. Tax Rates
  const taxRates = [
    { rateName: 'GST 0% (Exempt)', cgstRate: 0, sgstRate: 0, igstRate: 0, isDefault: false },
    { rateName: 'GST 5%', cgstRate: 2.5, sgstRate: 2.5, igstRate: 5.0, isDefault: false },
    { rateName: 'GST 12%', cgstRate: 6.0, sgstRate: 6.0, igstRate: 12.0, isDefault: false },
    { rateName: 'GST 18% (Standard Auto)', cgstRate: 9.0, sgstRate: 9.0, igstRate: 18.0, isDefault: true },
    { rateName: 'GST 28% (Luxury / High CC)', cgstRate: 14.0, sgstRate: 14.0, igstRate: 28.0, isDefault: false }
  ];

  for (const t of taxRates) {
    await prisma.taxRate.upsert({
      where: { rateName: t.rateName },
      update: t,
      create: t
    });
  }
  console.log('✅ Seeded Tax Rates');

  // 7. Categories, Brands, Units
  const units = [
    { code: 'PCS', name: 'Pieces', allowDecimals: false },
    { code: 'SETS', name: 'Sets', allowDecimals: false },
    { code: 'BOX', name: 'Boxes', allowDecimals: false },
    { code: 'LTR', name: 'Litres', allowDecimals: true }
  ];
  const unitMap = new Map<string, string>();
  for (const u of units) {
    const unit = await prisma.unit.upsert({
      where: { code: u.code },
      update: u,
      create: u
    });
    unitMap.set(u.code, unit.id);
  }

  const categories = [
    { code: 'ENG', name: 'Engine & Transmission', description: 'Pistons, valves, clutch plates, gaskets, cylinders' },
    { code: 'BRK', name: 'Braking & Discs', description: 'Brake pads, shoe sets, master cylinders, brake fluid' },
    { code: 'ELE', name: 'Electricals & Sensors', description: 'Spark plugs, batteries, coils, wiring harness, horns' },
    { code: 'CHN', name: 'Chains & Sprockets', description: 'Drive chains, front/rear sprockets, sprocket kits' },
    { code: 'OIL', name: 'Oils & Lubricants', description: 'Engine 4T oils, fork oils, chain lubes, greases' }
  ];
  const categoryMap = new Map<string, string>();
  for (const c of categories) {
    const cat = await prisma.category.upsert({
      where: { code: c.code },
      update: c,
      create: c
    });
    categoryMap.set(c.code, cat.id);
  }

  const brands = [
    { code: 'BAJAJ', name: 'Bajaj Genuine Parts', isOem: true, originCountry: 'India' },
    { code: 'TVS', name: 'TVS Genuine Spares', isOem: true, originCountry: 'India' },
    { code: 'HERO', name: 'Hero MotoCorp Genuine', isOem: true, originCountry: 'India' },
    { code: 'HONDA', name: 'Honda Two-Wheeler Genuine', isOem: true, originCountry: 'India' },
    { code: 'ROLON', name: 'Rolon Chains (LGB)', isOem: false, originCountry: 'India' },
    { code: 'ENDUR', name: 'Endurance Braking Systems', isOem: false, originCountry: 'India' },
    { code: 'MOTUL', name: 'Motul Lubricants', isOem: false, originCountry: 'France/India' }
  ];
  const brandMap = new Map<string, string>();
  for (const b of brands) {
    const br = await prisma.brand.upsert({
      where: { code: b.code },
      update: b,
      create: b
    });
    brandMap.set(b.code, br.id);
  }

  // 8. Vehicle Hierarchy (Manufacturer -> Model -> Variant)
  const manufacturers = [
    { name: 'Bajaj Auto Ltd', country: 'India' },
    { name: 'TVS Motor Company', country: 'India' },
    { name: 'Hero MotoCorp', country: 'India' },
    { name: 'Honda Motorcycles India', country: 'India' }
  ];

  for (const m of manufacturers) {
    const mfg = await prisma.manufacturer.upsert({
      where: { name: m.name },
      update: m,
      create: m
    });

    if (m.name.includes('Bajaj')) {
      const pulsarModel = await prisma.vehicleModel.upsert({
        where: { manufacturerId_modelName: { manufacturerId: mfg.id, modelName: 'Pulsar' } },
        update: { cc: 150, type: 'Motorcycle' },
        create: { manufacturerId: mfg.id, modelName: 'Pulsar', cc: 150, type: 'Motorcycle' }
      });
      await prisma.vehicleVariant.upsert({
        where: { modelId_variantName: { modelId: pulsarModel.id, variantName: 'Pulsar 150 BS6' } },
        update: { yearFrom: 2020, yearTo: 2026, fuelSystem: 'FI' },
        create: { modelId: pulsarModel.id, variantName: 'Pulsar 150 BS6', yearFrom: 2020, yearTo: 2026, fuelSystem: 'FI' }
      });
    }
  }
  console.log('✅ Seeded Categories, Brands, Units & Vehicle Matrix');

  // 9. Rack/Bin Locations
  const rackBins = [
    { binCode: 'B-04-T2', zone: 'Zone B', rack: 'R-04', shelf: 'S-02', description: 'Clutch & Transmission Shelf' },
    { binCode: 'B-01-A1', zone: 'Zone B', rack: 'R-01', shelf: 'S-01', description: 'Brake Disc Pads Bay' },
    { binCode: 'D-01-B3', zone: 'Zone D', rack: 'R-01', shelf: 'S-03', description: 'Rolon Drive Chain Kits' },
    { binCode: 'E-02-L1', zone: 'Zone E', rack: 'R-02', shelf: 'S-01', description: 'Engine Oils & Lubricants Rack' }
  ];
  const binMap = new Map<string, string>();
  for (const rb of rackBins) {
    const loc = await prisma.rackBinLocation.upsert({
      where: { binCode: rb.binCode },
      update: { ...rb, branchId: mainBranch.id },
      create: { ...rb, branchId: mainBranch.id }
    });
    binMap.set(rb.binCode, loc.id);
  }

  // 10. Sample Items & Stock Movements
  const items = [
    {
      sku: 'BP-1234',
      name: 'Bajaj Pulsar 150 Front Disc Pad Set',
      shortName: 'Pulsar 150 Disc Pad',
      oemPartNumber: 'DJ-151074',
      hsnCode: '8714',
      categoryId: categoryMap.get('BRK')!,
      brandId: brandMap.get('BAJAJ')!,
      unitId: unitMap.get('SETS')!,
      mrp: 480.00,
      purchaseRate: 280.00,
      sellingRate: 450.00,
      garageRate: 390.00,
      barcode: '8901234567890',
      binCode: 'B-01-A1',
      initialQty: 42
    },
    {
      sku: 'CP-5678',
      name: 'Pulsar 150 Clutch Plate Set (5 Plates)',
      shortName: 'Pulsar 150 Clutch Plates',
      oemPartNumber: 'DH-101152',
      hsnCode: '8714',
      categoryId: categoryMap.get('ENG')!,
      brandId: brandMap.get('BAJAJ')!,
      unitId: unitMap.get('SETS')!,
      mrp: 920.00,
      purchaseRate: 560.00,
      sellingRate: 850.00,
      garageRate: 740.00,
      barcode: '8901234567891',
      binCode: 'B-04-T2',
      initialQty: 28
    },
    {
      sku: 'CH-9012',
      name: 'Rolon Brass Drive Chain & Sprocket Kit (Splendor Plus)',
      shortName: 'Rolon Splendor Chain Kit',
      oemPartNumber: 'RL-SP-428-106',
      hsnCode: '8714',
      categoryId: categoryMap.get('CHN')!,
      brandId: brandMap.get('ROLON')!,
      unitId: unitMap.get('SETS')!,
      mrp: 1450.00,
      purchaseRate: 920.00,
      sellingRate: 1350.00,
      garageRate: 1180.00,
      barcode: '8901234567892',
      binCode: 'D-01-B3',
      initialQty: 18
    },
    {
      sku: 'MO-7100',
      name: 'Motul 7100 4T 10W50 100% Synthetic 1L Oil',
      shortName: 'Motul 7100 10W50 1L',
      oemPartNumber: 'MOT-7100-10W50',
      hsnCode: '2710',
      categoryId: categoryMap.get('OIL')!,
      brandId: brandMap.get('MOTUL')!,
      unitId: unitMap.get('LTR')!,
      mrp: 1050.00,
      purchaseRate: 710.00,
      sellingRate: 980.00,
      garageRate: 890.00,
      barcode: '8901234567893',
      binCode: 'E-02-L1',
      initialQty: 35
    }
  ];

  for (const it of items) {
    const item = await prisma.item.upsert({
      where: { sku: it.sku },
      update: {
        name: it.name,
        shortName: it.shortName,
        oemPartNumber: it.oemPartNumber,
        hsnCode: it.hsnCode,
        categoryId: it.categoryId,
        brandId: it.brandId,
        unitId: it.unitId
      },
      create: {
        sku: it.sku,
        name: it.name,
        shortName: it.shortName,
        oemPartNumber: it.oemPartNumber,
        hsnCode: it.hsnCode,
        categoryId: it.categoryId,
        brandId: it.brandId,
        unitId: it.unitId,
        gstRate: 18.00
      }
    });

    // Item Price
    await prisma.itemPrice.create({
      data: {
        itemId: item.id,
        mrp: it.mrp,
        purchaseRate: it.purchaseRate,
        sellingRate: it.sellingRate,
        garageRate: it.garageRate,
        isCurrent: true
      }
    });

    // Barcode
    await prisma.itemBarcode.upsert({
      where: { barcode: it.barcode },
      update: { itemId: item.id },
      create: { itemId: item.id, barcode: it.barcode, isPrimary: true }
    });

    // Stock in Main Branch
    const stock = await prisma.stock.upsert({
      where: { itemId_branchId: { itemId: item.id, branchId: mainBranch.id } },
      update: { quantity: it.initialQty, rackBinId: binMap.get(it.binCode) },
      create: {
        itemId: item.id,
        branchId: mainBranch.id,
        rackBinId: binMap.get(it.binCode),
        quantity: it.initialQty,
        avgCostRate: it.purchaseRate
      }
    });

    // Stock Movement (Auditable Opening Balance)
    await prisma.stockMovement.create({
      data: {
        itemId: item.id,
        branchId: mainBranch.id,
        userId: superAdminUser.id,
        movementType: StockMovementType.OPENING_STOCK,
        direction: StockDirection.IN,
        quantity: it.initialQty,
        unitRate: it.purchaseRate,
        previousBalance: 0,
        newBalance: it.initialQty,
        referenceType: 'SYSTEM_SEED',
        referenceId: 'OPEN-BAL-2026',
        notes: 'Initial opening stock ledger migration'
      }
    });
  }
  console.log(`✅ Seeded ${items.length} Spare Part SKUs with opening StockMovements`);

  // 11. Initial Audit Log
  await prisma.auditLog.create({
    data: {
      userId: superAdminUser.id,
      username: superAdminUser.username,
      action: 'Database Initialized & Seeded',
      module: 'System',
      entity: 'PrismaSchema',
      entityId: 'V1.0',
      notes: 'Successfully seeded enterprise roles, permissions matrix, and spare parts catalog.',
      severity: 'INFO',
      ipAddress: '127.0.0.1'
    }
  });

  console.log('✨ BIKE ERP Database Seeding Complete!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
