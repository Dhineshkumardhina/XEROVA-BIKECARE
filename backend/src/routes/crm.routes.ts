import { Router } from 'express';
import { crmController } from '../controllers/crm.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { requirePermission } from '../middleware/authorize.js';

const router = Router();

router.use(authenticate);

// ==============================================================================
// CUSTOMER MANAGEMENT & 360 PROFILE
// ==============================================================================
router.get(
  '/customers',
  requirePermission('customers.view', 'sales.view', 'sales.create'),
  crmController.searchCustomers
);

router.post(
  '/customers',
  requirePermission('customers.create', 'sales.create'),
  crmController.createCustomer
);

router.get(
  '/customers/:id',
  requirePermission('customers.view', 'sales.view'),
  crmController.getCustomerProfile
);

router.put(
  '/customers/:id',
  requirePermission('customers.edit', 'admin.all'),
  crmController.updateCustomer
);

// Customer Vehicles
router.post(
  '/customers/:customerId/vehicles',
  requirePermission('customers.create', 'customers.edit', 'sales.create'),
  crmController.addVehicle
);

router.put(
  '/customers/vehicles/:vehicleId',
  requirePermission('customers.edit', 'sales.create'),
  crmController.updateVehicle
);

// ==============================================================================
// MECHANIC MANAGEMENT & REFERRALS
// ==============================================================================
router.get(
  '/mechanics',
  requirePermission('customers.view', 'sales.view'),
  crmController.getMechanics
);

router.post(
  '/mechanics',
  requirePermission('customers.create', 'admin.all'),
  crmController.createMechanic
);

router.post(
  '/referrals',
  requirePermission('sales.create', 'customers.create'),
  crmController.recordReferral
);

router.patch(
  '/referrals/:referralId',
  requirePermission('customers.edit', 'admin.all'),
  crmController.updateReferralStatus
);

// ==============================================================================
// LOYALTY PROGRAM & POINTS ENGINE
// ==============================================================================
router.get(
  '/loyalty/rule',
  requirePermission('customers.view', 'sales.view'),
  crmController.getLoyaltyRule
);

router.put(
  '/loyalty/rule',
  requirePermission('admin.all'),
  crmController.updateLoyaltyRule
);

router.post(
  '/loyalty/adjust',
  requirePermission('admin.all'),
  crmController.adjustLoyaltyPoints
);

// ==============================================================================
// MESSAGING & BULK BROADCAST
// ==============================================================================
router.get(
  '/messages/templates',
  requirePermission('customers.view', 'sales.view'),
  crmController.getMessageTemplates
);

router.post(
  '/messages/templates',
  requirePermission('admin.all'),
  crmController.createMessageTemplate
);

router.post(
  '/messages/send',
  requirePermission('customers.view', 'sales.create'),
  crmController.sendMessage
);

router.post(
  '/messages/bulk/preview',
  requirePermission('customers.view', 'admin.all'),
  crmController.previewBulkAudience
);

router.post(
  '/messages/bulk/send',
  requirePermission('admin.all'),
  crmController.sendBulkMessage
);

router.get(
  '/messages/history',
  requirePermission('customers.view', 'reports.view'),
  crmController.getCommunicationHistory
);

// ==============================================================================
// OUTSTANDING REMINDERS
// ==============================================================================
router.get(
  '/reminders/outstanding',
  requirePermission('accounts.financial.view', 'customers.view', 'sales.view'),
  crmController.getOutstandingReminders
);

router.post(
  '/reminders/send/:customerId',
  requirePermission('accounts.financial.view', 'customers.view'),
  crmController.sendOutstandingReminder
);

export default router;
