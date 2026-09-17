import { Router } from 'express';
import { accountController } from '../controllers/account.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/authorize.js';

const router = Router();

router.use(authenticate);

// Financial Dashboard & Metrics
router.get(
  '/dashboard',
  requirePermission('accounts.financial.view', 'reports.financial.view'),
  accountController.getDashboardSummary
);

// Customer & Supplier Summaries
router.get(
  '/receivables',
  requirePermission('accounts.ledger.view', 'accounts.financial.view'),
  accountController.getReceivables
);

router.get(
  '/payables',
  requirePermission('accounts.ledger.view', 'accounts.financial.view'),
  accountController.getPayables
);

router.get(
  '/receipts',
  requirePermission('accounts.receipt.create', 'sales.view'),
  accountController.getReceipts
);

router.get(
  '/payments',
  requirePermission('accounts.payment.create', 'purchase.view'),
  accountController.getPayments
);

// Customer Statement Ledger
router.get(
  '/ledgers/customer/:customerId',
  requirePermission('accounts.ledger.view', 'accounts.financial.view', 'customers.view'),
  accountController.getCustomerLedger
);

// Supplier Statement Ledger
router.get(
  '/ledgers/supplier/:supplierId',
  requirePermission('accounts.ledger.view', 'accounts.financial.view', 'purchase.view'),
  accountController.getSupplierLedger
);

// Banking Accounts & Transactions List
router.get(
  '/banking/accounts',
  requirePermission('accounts.banking', 'accounts.financial.view'),
  accountController.getBankAccounts
);

router.get(
  '/banking/transactions',
  requirePermission('accounts.banking', 'accounts.financial.view'),
  accountController.getBankTransactions
);

// Receipt Vouchers
router.post(
  '/receipts',
  requirePermission('accounts.receipt.create', 'accounts.create_receipt'),
  accountController.createReceipt
);

router.post(
  '/receipts/reverse',
  requirePermission('accounts.reversal', 'admin.all'),
  accountController.reverseReceipt
);

// Supplier Payment Vouchers
router.post(
  '/payments',
  requirePermission('accounts.payment.create', 'accounts.create_payment'),
  accountController.createPayment
);

router.post(
  '/payments/reverse',
  requirePermission('accounts.reversal', 'admin.all'),
  accountController.reversePayment
);

// Banking Operations: Deposit, Withdrawal, Transfer & Reconciliation
router.post(
  '/banking/deposit',
  requirePermission('accounts.banking', 'admin.all'),
  accountController.createDeposit
);

router.post(
  '/banking/withdrawal',
  requirePermission('accounts.banking', 'admin.all'),
  accountController.createWithdrawal
);

router.post(
  '/banking/transfer',
  requirePermission('accounts.banking', 'admin.all'),
  accountController.createTransfer
);

router.post(
  '/banking/reconcile',
  requirePermission('accounts.banking', 'admin.all'),
  accountController.reconcileTransaction
);

export default router;
