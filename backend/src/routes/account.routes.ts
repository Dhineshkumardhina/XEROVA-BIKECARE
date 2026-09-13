import { Router } from 'express';
import { accountController } from '../controllers/account.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/authorize.js';

const router = Router();

router.use(authenticate);

// Financial Dashboard & Metrics
router.get(
  '/dashboard',
  requirePermission('accounts.financial.view', 'reports.view', 'sales.view'),
  accountController.getDashboardSummary
);

// Customer Statement Ledger
router.get(
  '/ledgers/customer/:customerId',
  requirePermission('accounts.ledger.view', 'accounts.financial.view', 'customers.view'),
  accountController.getCustomerLedger
);

// Receipt Vouchers
router.post(
  '/receipts',
  requirePermission('accounts.receipt.create', 'sales.create'),
  accountController.createReceipt
);

router.post(
  '/receipts/reverse',
  requirePermission('accounts.receipt.create', 'accounts.financial.view'),
  accountController.reverseReceipt
);

// Supplier Payment Vouchers
router.post(
  '/payments',
  requirePermission('accounts.payment.create', 'purchases.create'),
  accountController.createPayment
);

router.post(
  '/payments/reverse',
  requirePermission('accounts.payment.create', 'accounts.financial.view'),
  accountController.reversePayment
);

// Banking Operations: Deposit, Withdrawal, Transfer & Reconciliation
router.post(
  '/banking/deposit',
  requirePermission('accounts.financial.view', 'accounts.receipt.create'),
  accountController.createDeposit
);

router.post(
  '/banking/withdrawal',
  requirePermission('accounts.financial.view', 'accounts.payment.create'),
  accountController.createWithdrawal
);

router.post(
  '/banking/transfer',
  requirePermission('accounts.financial.view', 'accounts.payment.create'),
  accountController.createTransfer
);

router.post(
  '/banking/reconcile',
  requirePermission('accounts.financial.view', 'accounts.ledger.view'),
  accountController.reconcileTransaction
);

export default router;
