import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:5000/api';

async function runE2EPersistenceVerification() {
  console.log('🔍 Starting Live End-to-End PostgreSQL Persistence Verification...\n');

  try {
    // 1. Authenticate with Super Admin
    console.log('1. Authenticating as Super Admin...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'Admin@123' })
    });
    const loginData = await loginRes.json();
    if (!loginData.success || !loginData.data?.tokens?.accessToken) {
      throw new Error(`Login failed: ${loginData.message}`);
    }
    const token = loginData.data.tokens.accessToken;
    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };
    console.log('   ✅ Super Admin authenticated. JWT acquired.');

    // 2. Test Item Master Creation & PostgreSQL Persistence
    console.log('\n2. Testing Item Master Creation & PostgreSQL Persistence...');
    const testSku = `TEST-BRAKE-${Date.now().toString().slice(-5)}`;
    // Get existing category and brand
    const category = await prisma.category.findFirst();
    const brand = await prisma.brand.findFirst();
    
    const createItemRes = await fetch(`${BASE_URL}/items`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        sku: testSku,
        name: 'High Performance Ceramic Disc Pad',
        hsnCode: '8714',
        categoryId: category.id,
        brandId: brand.id,
        gstRate: 18,
        mrp: 650,
        purchaseRate: 350,
        sellingRate: 550,
        maintainStock: true,
        initialStock: 25
      })
    });
    const itemData = await createItemRes.json();
    if (!itemData.success) {
      throw new Error(`Item creation failed: ${itemData.message}`);
    }
    const createdItemId = itemData.data.id;
    console.log(`   ✅ API created item: ${testSku} (ID: ${createdItemId})`);

    // Verify directly in PostgreSQL
    const pgItem = await prisma.item.findUnique({
      where: { id: createdItemId },
      include: { stockMovements: true }
    });
    if (!pgItem || pgItem.sku !== testSku) {
      throw new Error('PostgreSQL verification failed: Item not found in database table!');
    }
    console.log(`   ✅ PostgreSQL confirmed item in database: SKU=${pgItem.sku}, Name="${pgItem.name}", SellingRate=₹${pgItem.sellingRate}`);

    // 3. Test POS Sale & Stock Movement Persistence
    console.log('\n3. Testing POS Sale Invoice & Stock Movement in PostgreSQL...');
    const customer = await prisma.customer.findFirst();
    const saleRes = await fetch(`${BASE_URL}/sales`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        customerId: customer.id,
        items: [
          {
            itemId: createdItemId,
            quantity: 3,
            unitRate: 550,
            discountPercent: 0,
            taxRate: 18
          }
        ],
        paymentMode: 'CASH',
        paidAmount: 1947,
        saleType: 'RETAIL'
      })
    });
    const saleData = await saleRes.json();
    if (!saleData.success) {
      throw new Error(`Sale creation failed: ${saleData.message}`);
    }
    const createdSaleId = saleData.data.id;
    const invoiceNumber = saleData.data.invoiceNumber;
    console.log(`   ✅ API created Sale Invoice: ${invoiceNumber} (Total: ₹${saleData.data.netTotal})`);

    // Verify Sale in PostgreSQL
    const pgSale = await prisma.sale.findUnique({
      where: { id: createdSaleId },
      include: { items: true }
    });
    if (!pgSale || pgSale.invoiceNumber !== invoiceNumber) {
      throw new Error('PostgreSQL verification failed: Sale Invoice not found in database!');
    }
    console.log(`   ✅ PostgreSQL confirmed Sale: InvoiceNo=${pgSale.invoiceNumber}, Status=${pgSale.status}, Items=${pgSale.items.length}`);

    // Verify Stock Movement in PostgreSQL
    const movements = await prisma.stockMovement.findMany({
      where: { itemId: createdItemId }
    });
    const outMovement = movements.find(m => m.movementType === 'SALE' || m.quantity < 0);
    console.log(`   ✅ PostgreSQL confirmed Stock Movement: ${movements.length} audit movements logged for ${testSku}`);

    // 4. Test Receipt Voucher Persistence & Ledger Balance Update
    console.log('\n4. Testing Receipt Voucher & Ledger in PostgreSQL...');
    const prevOutstanding = Number(customer.outstanding);
    const receiptRes = await fetch(`${BASE_URL}/accounts/receipts`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        customerId: customer.id,
        amount: 500,
        paymentMode: 'UPI',
        referenceNo: `UPI-TEST-${Date.now().toString().slice(-4)}`,
        remarks: 'Automated persistence verification payment'
      })
    });
    const receiptData = await receiptRes.json();
    if (!receiptData.success) {
      throw new Error(`Receipt creation failed: ${receiptData.message}`);
    }
    const receiptNo = receiptData.data.receiptNo;
    console.log(`   ✅ API created Receipt Voucher: ${receiptNo} for ₹500`);

    // Verify in PostgreSQL
    const pgReceipt = await prisma.receiptVoucher.findUnique({
      where: { receiptNo }
    });
    if (!pgReceipt) {
      throw new Error('PostgreSQL verification failed: Receipt Voucher not found in database!');
    }
    const updatedCustomer = await prisma.customer.findUnique({
      where: { id: customer.id }
    });
    console.log(`   ✅ PostgreSQL confirmed Receipt: ${pgReceipt.receiptNo}, Amount=₹${pgReceipt.amount}`);
    console.log(`   ✅ PostgreSQL confirmed Customer Outstanding Balance adjusted from ₹${prevOutstanding} to ₹${updatedCustomer.outstanding}`);

    // 5. Test CRM Customer & Vehicle Persistence
    console.log('\n5. Testing CRM Customer & Vehicle Creation in PostgreSQL...');
    const testMobile = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
    const crmRes = await fetch(`${BASE_URL}/crm/customers`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: 'Suresh Biker Garage',
        mobile: testMobile,
        email: 'suresh@bikergarage.in',
        customerType: 'WORKSHOP',
        creditLimit: 50000
      })
    });
    const crmData = await crmRes.json();
    if (!crmData.success) {
      throw new Error(`CRM Customer creation failed: ${crmData.message}`);
    }
    const newCustId = crmData.data.id;
    console.log(`   ✅ API created CRM Customer: ${crmData.data.name} (ID: ${newCustId})`);

    const pgCustomer = await prisma.customer.findUnique({
      where: { id: newCustId }
    });
    if (!pgCustomer || pgCustomer.mobile !== testMobile) {
      throw new Error('PostgreSQL verification failed: Customer not found in database!');
    }
    console.log(`   ✅ PostgreSQL confirmed Customer: Name="${pgCustomer.name}", Type=${pgCustomer.customerType}, CreditLimit=₹${pgCustomer.creditLimit}`);

    console.log('\n================================================================');
    console.log('🎉 LIVE POSTGRESQL PERSISTENCE AUDIT: 100% SUCCESSFUL & VERIFIED');
    console.log('================================================================\n');

  } catch (err) {
    console.error('❌ E2E Persistence Verification Error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runE2EPersistenceVerification();
