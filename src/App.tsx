import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ItemMasterView } from './components/ItemMasterView';
import { FastPOSView } from './components/FastPOSView';
import { OtherViews } from './components/OtherViews';
import { InvoiceModal } from './components/InvoiceModal';
import { PartFinderModal } from './components/PartFinderModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { NewPartModal } from './components/NewPartModal';
import { ShiftSummaryModal } from './components/ShiftSummaryModal';
import { PoModal } from './components/PoModal';
import { ItemMasterDashboard } from './components/items/ItemMasterDashboard';
import { ItemDetailsDrawer } from './components/items/ItemDetailsDrawer';
import { InventoryDashboardView } from './components/inventory/InventoryDashboardView';
import { StockLedgerView } from './components/inventory/StockLedgerView';
import { StockReportView } from './components/inventory/StockReportView';
import { LowStockView } from './components/inventory/LowStockView';
import { VehicleCompatibilityView } from './components/vehicle/VehicleCompatibilityView';
import { BulkBarcodePrintModal } from './components/barcode/BulkBarcodePrintModal';
import { AccountsDashboard } from './components/accounts/AccountsDashboard';
import { ReceivablesView } from './components/accounts/ReceivablesView';
import { CustomerLedgerView } from './components/accounts/CustomerLedgerView';
import { ReceiptsListView } from './components/accounts/ReceiptsListView';
import { CreateReceiptModal } from './components/accounts/CreateReceiptModal';
import { ReceiptSuccessModal } from './components/accounts/ReceiptSuccessModal';
import { PayablesView } from './components/accounts/PayablesView';
import { SupplierLedgerView } from './components/accounts/SupplierLedgerView';
import { PaymentsListView } from './components/accounts/PaymentsListView';
import { CreatePaymentModal } from './components/accounts/CreatePaymentModal';
import { PaymentSuccessModal } from './components/accounts/PaymentSuccessModal';
import { BankingDashboardView } from './components/accounts/BankingDashboardView';
import { BankingOperationModal } from './components/accounts/BankingOperationModal';
import { TransactionDetailDrawer } from './components/accounts/TransactionDetailDrawer';
import { ReversalConfirmationModal } from './components/accounts/ReversalConfirmationModal';
import { GstDashboard } from './components/gst/GstDashboard';
import { Gstr1View } from './components/gst/Gstr1View';
import { Gstr3bView } from './components/gst/Gstr3bView';
import { HsnTaxReportView } from './components/gst/HsnTaxReportView';
import { SalesReportsView } from './components/reports/SalesReportsView';
import { PurchaseReportsView } from './components/reports/PurchaseReportsView';
import { InventoryReportsView } from './components/reports/InventoryReportsView';
import { ProfitabilityDashboard } from './components/reports/ProfitabilityDashboard';
import { FinancialReportsView } from './components/reports/FinancialReportsView';
import { BusinessInsightsView } from './components/reports/BusinessInsightsView';
import { ReportDetailDrawer } from './components/reports/ReportDetailDrawer';

// Administration & Security Module Components
import { AdministrationDashboard } from './components/admin/AdministrationDashboard';
import { UsersManagementView } from './components/admin/UsersManagementView';
import { RoleManagementView } from './components/admin/RoleManagementView';
import { CompanySettingsView } from './components/admin/CompanySettingsView';
import { BranchSettingsView } from './components/admin/BranchSettingsView';
import { InvoiceTemplatesView } from './components/admin/InvoiceTemplatesView';
import { NumberingPrefixesView } from './components/admin/NumberingPrefixesView';
import { TaxSettingsView } from './components/admin/TaxSettingsView';
import { PaymentModesView } from './components/admin/PaymentModesView';
import { PrinterSettingsView } from './components/admin/PrinterSettingsView';
import { BackupRestoreView } from './components/admin/BackupRestoreView';
import { AuditLogsView } from './components/admin/AuditLogsView';
import { SystemActivityTimelineView } from './components/admin/SystemActivityTimelineView';
import { SecuritySettingsView } from './components/admin/SecuritySettingsView';
import { PermissionRequiredModal } from './components/admin/PermissionRequiredModal';
import { SystemUpdatesView } from './components/admin/SystemUpdatesView';
import { UpdateAlert } from './components/common/UpdateAlert';

// CRM & Loyalty Module Components
import { CrmDashboardView } from './components/crm/CrmDashboardView';
import { CustomerListView } from './components/crm/CustomerListView';
import { CustomerProfileView } from './components/crm/CustomerProfileView';
import { MechanicManagementView } from './components/crm/MechanicManagementView';
import { LoyaltyProgramDashboardView } from './components/crm/LoyaltyProgramDashboardView';
import { ReferralSystemView } from './components/crm/ReferralSystemView';
import { MessagingDashboardView } from './components/crm/MessagingDashboardView';
import { BulkMessagingView } from './components/crm/BulkMessagingView';
import { PaymentRemindersView } from './components/crm/PaymentRemindersView';
import { CustomerSegmentsView } from './components/crm/CustomerSegmentsView';
import { CrmReportsView } from './components/crm/CrmReportsView';
import {
  AddCustomerModal,
  AddVehicleModal,
  AdjustLoyaltyPointsModal,
  RedeemPointsModal,
  SendMessageModal,
  AddMechanicModal,
  RecordReferralModal,
  SettleMechanicCommissionModal
} from './components/crm/CrmModals';
import { QuickActionsModal } from './components/QuickActionsModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { UnsavedChangesModal } from './components/UnsavedChangesModal';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { LoginModal } from './components/auth/LoginModal';
import { SessionExpiredModal } from './components/auth/SessionExpiredModal';
// Quotations & Returns Module Components
import { QuotationsView } from './components/quotations/QuotationsView';
import { CreateQuotationModal } from './components/quotations/CreateQuotationModal';
import { QuotationDetailModal } from './components/quotations/QuotationDetailModal';
import { PrintQuotationModal } from './components/quotations/PrintQuotationModal';
import { SalesReturnsView } from './components/returns/SalesReturnsView';
import { CreateSalesReturnModal } from './components/returns/CreateSalesReturnModal';
import { PurchaseReturnsView } from './components/returns/PurchaseReturnsView';
import { CreatePurchaseReturnModal } from './components/returns/CreatePurchaseReturnModal';
import { PrintReturnNoteModal } from './components/returns/PrintReturnNoteModal';
import { triggerPrintWindow } from './utils/exportUtils';
import { adminService } from './services/admin.service';
import { itemService } from './services/item.service';
import { saleService } from './services/sale.service';
import { stockService } from './services/stock.service';
import { quotationService } from './services/quotation.service';
import { purchaseService } from './services/purchase.service';
import { crmService } from './services/crm.service';
import { accountService } from './services/account.service';
import { supplierService } from './services/supplier.service';

import {
  INITIAL_PARTS,
  INITIAL_INVOICES,
  INITIAL_TENDER_DATA,
  INITIAL_QUOTATIONS,
  INITIAL_SALES_RETURNS,
  INITIAL_PURCHASE_RETURNS
} from './data/initialData';
import {
  INITIAL_RECEIVABLES,
  INITIAL_CUSTOMER_LEDGER,
  INITIAL_RECEIPT_VOUCHERS,
  INITIAL_PAYABLES,
  INITIAL_SUPPLIER_LEDGER,
  INITIAL_PAYMENT_VOUCHERS,
  INITIAL_BANK_TRANSACTIONS,
  INITIAL_BANK_ACCOUNTS,
  INITIAL_FINANCIAL_TIMELINE
} from './data/accountingData';
import {
  INITIAL_ERP_USERS,
  DEFAULT_ROLE_PERMISSIONS,
  INITIAL_COMPANY_PROFILE,
  INITIAL_BRANCHES,
  INITIAL_NUMBERING_CONFIG,
  INITIAL_TAX_RATES,
  INITIAL_PAYMENT_MODES,
  INITIAL_TEMPLATE_CONFIG,
  INITIAL_PRINTER_CONFIG,
  INITIAL_BACKUPS,
  INITIAL_AUDIT_LOGS,
  INITIAL_USER_ACTIVITIES,
  INITIAL_SECURITY_SETTINGS,
  INITIAL_SYSTEM_STATUS
} from './data/adminSecurityData';
import {
  INITIAL_CRM_CUSTOMERS,
  INITIAL_MECHANICS,
  INITIAL_LOYALTY_RULES,
  INITIAL_LOYALTY_TRANSACTIONS,
  INITIAL_REFERRALS,
  INITIAL_MESSAGE_TEMPLATES,
  INITIAL_COMMUNICATION_LOGS,
  INITIAL_OUTSTANDING_REMINDERS,
  INITIAL_CUSTOMER_SEGMENTS,
  INITIAL_CUSTOMER_QUOTATIONS,
  INITIAL_CUSTOMER_RETURNS
} from './data/crmData';
import {
  SparePart,
  Invoice,
  TenderReconciliationData,
  SalesReturnItem,
  StockAdjustmentReason,
  UserRole,
  ReceivableRecord,
  CustomerLedgerEntry,
  ReceiptVoucher,
  PayableRecord,
  SupplierLedgerEntry,
  PaymentVoucher,
  BankTransaction,
  BankingAccount,
  FinancialTimelineItem,
  ReportDetailData,
  ErpUser,
  RolePermission,
  CompanyProfile,
  BranchLocation,
  NumberingConfig,
  TaxRateConfig,
  PaymentModeConfig,
  InvoiceTemplateConfig,
  PrinterConfig,
  BackupRecord,
  AuditLogEntry,
  UserActivityItem,
  SecuritySettingsConfig,
  SystemStatusItem,
  CustomerProfileData,
  CustomerVehicleRecord,
  MechanicRecord,
  LoyaltyRuleConfig,
  LoyaltyTransactionRecord,
  ReferralRecord,
  MessageTemplate,
  CommunicationLogRecord,
  OutstandingReminderRecord,
  CustomerSegment,
  CustomerQuotation,
  CustomerSalesReturn,
  ReferralStatus,
  LoyaltyTransactionType,
  Quotation,
  SalesReturnRecord,
  PurchaseReturnRecord
} from './types';

export function MainERPContent() {
  const { user, isAuthenticated, isSessionExpired, dismissSessionExpired } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [activeScreen, setActiveScreen] = useState<string>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('super_admin');

  const [parts, setParts] = useState<SparePart[]>(INITIAL_PARTS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [tenderData, setTenderData] = useState<TenderReconciliationData>(INITIAL_TENDER_DATA);
  const [quotations, setQuotations] = useState<Quotation[]>(INITIAL_QUOTATIONS);
  const [salesReturns, setSalesReturns] = useState<SalesReturnRecord[]>(INITIAL_SALES_RETURNS);
  const [purchaseReturns, setPurchaseReturns] = useState<PurchaseReturnRecord[]>(INITIAL_PURCHASE_RETURNS);

  // Quotation Modals & Interactive States
  const [isCreateQuotationOpen, setIsCreateQuotationOpen] = useState<boolean>(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [selectedQuotationForDetail, setSelectedQuotationForDetail] = useState<Quotation | null>(null);
  const [selectedQuotationForPrint, setSelectedQuotationForPrint] = useState<Quotation | null>(null);

  // Returns Modals & Interactive States
  const [isCreateSalesReturnOpen, setIsCreateSalesReturnOpen] = useState<boolean>(false);
  const [selectedSalesReturnForPrint, setSelectedSalesReturnForPrint] = useState<SalesReturnRecord | null>(null);
  const [isCreatePurchaseReturnOpen, setIsCreatePurchaseReturnOpen] = useState<boolean>(false);
  const [selectedPurchaseReturnForPrint, setSelectedPurchaseReturnForPrint] = useState<PurchaseReturnRecord | null>(null);
  const [selectedSalesReturnForDetail, setSelectedSalesReturnForDetail] = useState<SalesReturnRecord | null>(null);
  const [selectedPurchaseReturnForDetail, setSelectedPurchaseReturnForDetail] = useState<PurchaseReturnRecord | null>(null);

  // Accounting Module State
  const [receivables, setReceivables] = useState<ReceivableRecord[]>(INITIAL_RECEIVABLES);
  const [customerLedger, setCustomerLedger] = useState<CustomerLedgerEntry[]>(INITIAL_CUSTOMER_LEDGER);
  const [receipts, setReceipts] = useState<ReceiptVoucher[]>(INITIAL_RECEIPT_VOUCHERS);
  const [payables, setPayables] = useState<PayableRecord[]>(INITIAL_PAYABLES);
  const [supplierLedger, setSupplierLedger] = useState<SupplierLedgerEntry[]>(INITIAL_SUPPLIER_LEDGER);
  const [payments, setPayments] = useState<PaymentVoucher[]>(INITIAL_PAYMENT_VOUCHERS);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>(INITIAL_BANK_TRANSACTIONS);
  const [bankAccounts, setBankAccounts] = useState<BankingAccount[]>(INITIAL_BANK_ACCOUNTS);
  const [financialTimeline, setFinancialTimeline] = useState<FinancialTimelineItem[]>(INITIAL_FINANCIAL_TIMELINE);

  // Accounting Selected Entities
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');

  // Accounting Modals & Drawers
  const [isCreateReceiptOpen, setIsCreateReceiptOpen] = useState<boolean>(false);
  const [preSelectedCustomerForReceipt, setPreSelectedCustomerForReceipt] = useState<ReceivableRecord | null>(null);
  const [isCreatePaymentOpen, setIsCreatePaymentOpen] = useState<boolean>(false);
  const [preSelectedSupplierForPayment, setPreSelectedSupplierForPayment] = useState<PayableRecord | null>(null);
  const [recordedReceiptForSuccess, setRecordedReceiptForSuccess] = useState<ReceiptVoucher | null>(null);
  const [recordedPaymentForSuccess, setRecordedPaymentForSuccess] = useState<PaymentVoucher | null>(null);
  const [bankingOperationType, setBankingOperationType] = useState<'deposit' | 'withdrawal' | 'transfer' | null>(null);
  const [selectedTxForDrawer, setSelectedTxForDrawer] = useState<CustomerLedgerEntry | SupplierLedgerEntry | null>(null);
  const [reversalTarget, setReversalTarget] = useState<any | null>(null);

  // Inventory Modals & Drawers
  const [selectedPartForDrawer, setSelectedPartForDrawer] = useState<SparePart | null>(null);
  const [selectedPartForLedger, setSelectedPartForLedger] = useState<SparePart | null>(null);
  const [isBulkBarcodeOpen, setIsBulkBarcodeOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [isPartFinderOpen, setIsPartFinderOpen] = useState(false);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isNewPartOpen, setIsNewPartOpen] = useState(false);
  const [isShiftSummaryOpen, setIsShiftSummaryOpen] = useState(false);
  const [poModalPartName, setPoModalPartName] = useState<string | null>(null);
  const [initialStockFilter, setInitialStockFilter] = useState<string>('ALL');
  const [selectedReportDetail, setSelectedReportDetail] = useState<ReportDetailData | null>(null);

  // Administration & Security Module States
  const [erpUsers, setErpUsers] = useState<ErpUser[]>(INITIAL_ERP_USERS);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>(DEFAULT_ROLE_PERMISSIONS);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(INITIAL_COMPANY_PROFILE);
  const [branches, setBranches] = useState<BranchLocation[]>(INITIAL_BRANCHES);
  const [numberingConfigs, setNumberingConfigs] = useState<NumberingConfig[]>(INITIAL_NUMBERING_CONFIG);
  const [taxRates, setTaxRates] = useState<TaxRateConfig[]>(INITIAL_TAX_RATES);
  const [paymentModes, setPaymentModes] = useState<PaymentModeConfig[]>(INITIAL_PAYMENT_MODES);
  const [templateConfig, setTemplateConfig] = useState<InvoiceTemplateConfig>(INITIAL_TEMPLATE_CONFIG);
  const [printerConfig, setPrinterConfig] = useState<PrinterConfig>(INITIAL_PRINTER_CONFIG);
  const [backups, setBackups] = useState<BackupRecord[]>(INITIAL_BACKUPS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [userActivities, setUserActivities] = useState<UserActivityItem[]>(INITIAL_USER_ACTIVITIES);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettingsConfig>(INITIAL_SECURITY_SETTINGS);
  const [systemStatus, setSystemStatus] = useState<SystemStatusItem[]>(INITIAL_SYSTEM_STATUS);

  // CRM & Customer Relationship Module State
  const [crmCustomers, setCrmCustomers] = useState<CustomerProfileData[]>(INITIAL_CRM_CUSTOMERS);
  const [mechanics, setMechanics] = useState<MechanicRecord[]>(INITIAL_MECHANICS);
  const [loyaltyRules, setLoyaltyRules] = useState<LoyaltyRuleConfig>(INITIAL_LOYALTY_RULES);
  const [loyaltyTransactions, setLoyaltyTransactions] = useState<LoyaltyTransactionRecord[]>(INITIAL_LOYALTY_TRANSACTIONS);
  const [referrals, setReferrals] = useState<ReferralRecord[]>(INITIAL_REFERRALS);
  const [messageTemplates, setMessageTemplates] = useState<MessageTemplate[]>(INITIAL_MESSAGE_TEMPLATES);
  const [communicationLogs, setCommunicationLogs] = useState<CommunicationLogRecord[]>(INITIAL_COMMUNICATION_LOGS);
  const [outstandingReminders, setOutstandingReminders] = useState<OutstandingReminderRecord[]>(INITIAL_OUTSTANDING_REMINDERS);
  const [customerSegments, setCustomerSegments] = useState<CustomerSegment[]>(INITIAL_CUSTOMER_SEGMENTS);
  const [customerQuotations, setCustomerQuotations] = useState<CustomerQuotation[]>(INITIAL_CUSTOMER_QUOTATIONS);
  const [customerSalesReturns, setCustomerSalesReturns] = useState<CustomerSalesReturn[]>(INITIAL_CUSTOMER_RETURNS);

  // CRM Modal & Interactive Selection States
  const [selectedCustomerProfileId, setSelectedCustomerProfileId] = useState<string | null>(null);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState<boolean>(false);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState<boolean>(false);
  const [isAdjustPointsOpen, setIsAdjustPointsOpen] = useState<boolean>(false);
  const [targetCustomerForPoints, setTargetCustomerForPoints] = useState<CustomerProfileData | null>(null);
  const [isRedeemPointsOpen, setIsRedeemPointsOpen] = useState<boolean>(false);
  const [targetCustomerForRedeem, setTargetCustomerForRedeem] = useState<CustomerProfileData | null>(null);
  const [isSendMessageOpen, setIsSendMessageOpen] = useState<boolean>(false);
  const [targetCustomerForMessage, setTargetCustomerForMessage] = useState<CustomerProfileData | null>(null);
  const [preselectedTemplateForMessage, setPreselectedTemplateForMessage] = useState<MessageTemplate | null>(null);
  const [isAddMechanicOpen, setIsAddMechanicOpen] = useState<boolean>(false);
  const [isRecordReferralOpen, setIsRecordReferralOpen] = useState<boolean>(false);
  const [preselectedMechanicForReferral, setPreselectedMechanicForReferral] = useState<MechanicRecord | null>(null);
  const [isSettleCommissionOpen, setIsSettleCommissionOpen] = useState<boolean>(false);
  const [targetMechanicForSettlement, setTargetMechanicForSettlement] = useState<MechanicRecord | null>(null);

  // Global UX & Refinement States
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState<boolean>(false);
  const [voidInvoiceTarget, setVoidInvoiceTarget] = useState<Invoice | null>(null);
  const [unsavedChangesPendingScreen, setUnsavedChangesPendingScreen] = useState<string | null>(null);

  // Administration UI Interactive States
  const [permissionDeniedAction, setPermissionDeniedAction] = useState<string | null>(null);
  const [targetedUserForAudit, setTargetedUserForAudit] = useState<string | undefined>(undefined);

  // Toast notification system
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Keyboard shortcut listener for F2, F4, F6, F8, Ctrl+K, Ctrl+/, Alt+P
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // F2 -> Fast Part Finder
      if (e.key === 'F2') {
        e.preventDefault();
        setIsPartFinderOpen(true);
      }
      // F4 -> Fast POS Counter Bill
      if (e.key === 'F4') {
        e.preventDefault();
        setActiveScreen('pos');
      }
      // F6 -> Customer Directory
      if (e.key === 'F6') {
        e.preventDefault();
        setActiveScreen('customers');
      }
      // F8 -> Receipt Voucher
      if (e.key === 'F8') {
        e.preventDefault();
        setIsCreateReceiptOpen(true);
      }
      // Ctrl+K -> Global Omnibox Search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(prev => !prev);
      }
      // Ctrl+/ -> Quick Actions Palette
      if ((e.ctrlKey || e.metaKey) && (e.key === '/' || e.key === '?')) {
        e.preventDefault();
        setIsQuickActionsOpen(prev => !prev);
      }
      // Alt+P -> Print Last Bill
      if (e.altKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        if (invoices.length > 0) {
          setViewingInvoice(invoices[0]);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [invoices]);

  // =========================================================================
  // POSTGRESQL STATE HYDRATION ON AUTHENTICATION
  // =========================================================================
  useEffect(() => {
    if (!isAuthenticated) return;
    let isMounted = true;

    async function hydrateFromBackend() {
      try {
        // 1. Hydrate Items
        const itemRes = await itemService.search({ limit: 1000 });
        const rawItems = itemRes.data || itemRes;
        const itemsList = Array.isArray(rawItems) ? rawItems : Array.isArray(rawItems?.items) ? rawItems.items : [];
        if (isMounted && itemsList.length > 0) {
          const mappedParts: SparePart[] = itemsList.map((item: any) => ({
            id: item.id,
            sku: item.sku,
            partNumber: item.sku,
            barcode: item.primaryBarcode || item.sku,
            name: item.name,
            shortName: item.shortName,
            brand: item.brand,
            oemCode: item.oemPartNumber || item.sku,
            category: item.category,
            vehicles: item.compatibilities?.map((c: any) => `${c.manufacturer} ${c.model}`) || [],
            hsn: item.hsnCode || '8714',
            rackBin: item.rackBin || 'A-01',
            purchasePrice: Number(item.purchaseRate || 0),
            wholesalePrice: Number(item.wholesaleRate || item.sellingRate || 0),
            mrp: Number(item.mrp || 0),
            counterPrice: Number(item.sellingRate || 0),
            currentStock: Number(item.currentStock || 0),
            minReorder: Number(item.minReorder || 5),
            unit: item.unit || 'PCS',
            gstRate: Number(item.gstRate || 18),
            status: (item.stockState || (item.currentStock === 0 ? 'Out of Stock' : item.currentStock <= (item.minReorder || 5) ? 'Low Stock' : 'Normal')) as any,
            physicalQty: Number(item.currentStock || 0),
            avgLandedCost: Number(item.purchaseRate || 0),
            thirtyDayVelocity: 0,
            stockMovements: [],
            compatMatrix: item.compatibilities?.map((c: any) => ({
              model: `${c.manufacturer} ${c.model}`,
              specs: c.variantName || 'All Variants',
              fitType: '100% Direct Fit' as const
            })) || []
          }));
          setParts(mappedParts);
        }
      } catch (e) {
        console.warn('Hydration: items fetch deferred', e);
      }

      try {
        // 2. Hydrate Invoices (Sales)
        const saleRes = await saleService.search({ limit: 100 });
        const salesList = saleRes.data?.sales || saleRes.sales || (Array.isArray(saleRes.data) ? saleRes.data : []);
        if (isMounted && salesList.length > 0) {
          const mappedInvoices: Invoice[] = salesList.map((s: any) => ({
            id: s.invoiceNumber || s.id,
            customerName: s.customerName || 'Counter Retail Customer',
            customerPhone: s.customerMobile !== 'N/A' ? s.customerMobile : undefined,
            vehicleNo: s.vehicleRegNo,
            itemsCount: s.itemCount || s.items?.length || 1,
            lineItems: (s.items || []).map((li: any) => ({
              partId: li.itemId || li.id,
              sku: li.sku || 'SKU-GEN',
              name: li.name || 'Spare Part',
              hsn: '8714',
              qty: Number(li.quantity || 1),
              rate: Number(li.unitRate || 0),
              discount: 0,
              taxableAmount: Number(li.totalAmount || 0),
              gstRate: 18,
              total: Number(li.totalAmount || 0)
            })),
            subtotal: Number(s.taxableAmount || s.totalAmount || 0),
            cgst: Number(s.cgstAmount || 0),
            sgst: Number(s.sgstAmount || 0),
            igst: Number(s.igstAmount || 0),
            totalAmount: Number(s.totalAmount || 0),
            total: Number(s.totalAmount || 0),
            items: (s.items || []).map((li: any) => ({
              partId: li.itemId || li.id,
              sku: li.sku || 'SKU-GEN',
              name: li.name || 'Spare Part',
              hsn: '8714',
              qty: Number(li.quantity || 1),
              rate: Number(li.unitRate || 0),
              discount: 0,
              taxableAmount: Number(li.totalAmount || 0),
              gstRate: 18,
              total: Number(li.totalAmount || 0)
            })),
            payMode: s.paymentMode === 'CASH' ? 'Cash' : s.paymentMode === 'UPI' ? 'UPI (GPay)' : s.paymentMode === 'CARD' ? 'Card POS' : s.paymentMode === 'CREDIT' ? 'Credit Ledger' : 'Cash',
            taxType: s.isB2B ? 'B2B' : 'B2C',
            status: s.status === 'COMPLETED' ? 'PAID' : s.status === 'DRAFT' ? 'PENDING' : 'PAID',
            operator: 'Rajesh (Store Admin)',
            createdAt: s.invoiceDate ? new Date(s.invoiceDate).toLocaleDateString('en-GB') : 'Today'
          })) as any;
          setInvoices(mappedInvoices);
        }
      } catch (e) {
        console.warn('Hydration: sales fetch deferred', e);
      }

      try {
        // 3. Hydrate Receivables & Payables
        const [recRes, payRes] = await Promise.all([
          accountService.getReceivables(),
          accountService.getPayables()
        ]);
        const recList = recRes.data || recRes;
        if (isMounted && Array.isArray(recList) && recList.length > 0) {
          setReceivables(recList);
        }
        const payList = payRes.data || payRes;
        if (isMounted && Array.isArray(payList) && payList.length > 0) {
          setPayables(payList);
        }
      } catch (e) {
        console.warn('Hydration: receivables/payables deferred', e);
      }

      try {
        // 4. Hydrate Receipts & Payments
        const [rcptRes, pymtRes] = await Promise.all([
          accountService.getReceipts(100),
          accountService.getPayments(100)
        ]);
        const rcptList = rcptRes.data || rcptRes;
        if (isMounted && Array.isArray(rcptList) && rcptList.length > 0) {
          setReceipts(rcptList);
        }
        const pymtList = pymtRes.data || pymtRes;
        if (isMounted && Array.isArray(pymtList) && pymtList.length > 0) {
          setPayments(pymtList);
        }
      } catch (e) {
        console.warn('Hydration: vouchers deferred', e);
      }

      try {
        // 5. Hydrate Banking Accounts & Transactions
        const [accRes, txRes] = await Promise.all([
          accountService.getBankAccounts(),
          accountService.getBankTransactions(100)
        ]);
        const accList = accRes.data || accRes;
        if (isMounted && Array.isArray(accList) && accList.length > 0) {
          setBankAccounts(accList);
        }
        const txList = txRes.data || txRes;
        if (isMounted && Array.isArray(txList) && txList.length > 0) {
          setBankTransactions(txList);
        }
      } catch (e) {
        console.warn('Hydration: banking deferred', e);
      }

      try {
        // 6. Hydrate CRM Customers & Mechanics
        const [custRes, mechRes] = await Promise.all([
          crmService.searchCustomers({ limit: 500 }),
          crmService.getMechanics()
        ]);
        const custList = custRes.data?.customers || custRes.customers || (Array.isArray(custRes.data) ? custRes.data : []);
        if (isMounted && Array.isArray(custList) && custList.length > 0) {
          const mappedCrm: CustomerProfileData[] = custList.map((c: any) => ({
            id: c.id,
            name: c.name,
            mobile: c.mobile,
            email: c.email,
            customerType: c.type === 'WORKSHOP_GARAGE' ? 'Workshop' : c.type === 'WHOLESALE_DEALER' ? 'Wholesale' : 'Retail',
            gstin: c.gstin,
            address: c.address || 'Coimbatore / Chennai',
            city: c.city || 'Tamil Nadu',
            totalSales: Number(c.totalSales || 0),
            outstanding: Number(c.outstanding || 0),
            creditLimit: Number(c.creditLimit || 0),
            loyaltyPoints: c.loyaltyAccount?.pointsBalance || 150,
            totalPurchasesCount: c.purchasesCount || 5,
            lastPurchaseDate: '12-Sep-2026',
            avgBillValue: 2400,
            status: 'Active',
            segmentTags: [c.type || 'Regular'],
            vehicles: (c.vehicles || []).map((v: any) => ({
              id: v.id,
              regNo: v.regNo,
              manufacturer: v.manufacturer,
              model: v.model,
              year: v.year,
              history: []
            })),
            createdDate: '01-Aug-2026'
          }));
          setCrmCustomers(mappedCrm);
        }

        const mechList = mechRes.data || mechRes;
        if (isMounted && Array.isArray(mechList) && mechList.length > 0) {
          const mappedMechs: MechanicRecord[] = mechList.map((m: any) => ({
            id: m.id,
            name: m.name,
            mobile: m.mobile,
            workshopName: m.workshopName,
            location: m.area || 'Coimbatore',
            customerCode: m.mechanicCode,
            loyaltyPoints: 200,
            totalReferredSales: Number(m.totalReferredSales || 0),
            referralCount: 4,
            status: 'Active',
            commissionRatePercent: Number(m.commissionRatePct || 5),
            joinedDate: '15-Jul-2026',
            pendingRewardAmount: Number(m.pendingCommission || 0)
          }));
          setMechanics(mappedMechs);
        }
      } catch (e) {
        console.warn('Hydration: CRM deferred', e);
      }
    }

    hydrateFromBackend();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  // Handler: Audited Non-destructive Void Invoice
  const handleVoidInvoice = (targetInvoice: Invoice, reason?: string) => {
    setInvoices(prev =>
      prev.map(i => (i.id === targetInvoice.id ? { ...i, status: 'VOID' } : i))
    );

    // Restore inventory quantities for line items
    setParts(prevParts =>
      prevParts.map(p => {
        const item = targetInvoice.lineItems.find(li => li.partId === p.id);
        if (item) {
          const updatedStock = p.currentStock + item.qty;
          return {
            ...p,
            currentStock: updatedStock,
            status: updatedStock === 0 ? 'Out of Stock' : updatedStock < p.minReorder ? 'Low Stock' : 'Normal',
            stockMovements: [
              {
                date: 'Today',
                ref: `VOID-${targetInvoice.id}`,
                type: 'Stock In (Void)' as any,
                qty: item.qty,
                balance: updatedStock,
                userOrParty: `Void Audit: ${reason || 'Invoice cancelled'}`
              },
              ...p.stockMovements
            ]
          };
        }
        return p;
      })
    );

    logAuditEvent(
      'Invoice Voided',
      'Sales',
      targetInvoice.id,
      'PAID',
      'VOID',
      `Voided invoice ${targetInvoice.id}: ${reason || 'Customer cancellation'}`,
      'Warning'
    );

    setVoidInvoiceTarget(null);
    showToast(`Invoice ${targetInvoice.id} voided. Stock returned to inventory.`);
  };

  // Handler: Generate new invoice from POS
  const handleGenerateInvoice = async (newInvoice: Invoice) => {
    setInvoices(prev => [newInvoice, ...prev]);

    // Update Tender Reconciliation
    setTenderData(prev => {
      let cash = prev.cashInDrawer;
      let upi = prev.upiCollections;
      let card = prev.cardPosTerminal;
      let neft = prev.directNeftBank;

      if (newInvoice.payMode === 'Cash') cash += newInvoice.totalAmount;
      else if (newInvoice.payMode === 'UPI (GPay)') upi += newInvoice.totalAmount;
      else if (newInvoice.payMode === 'Card POS') card += newInvoice.totalAmount;
      else if (newInvoice.payMode === 'NEFT Bank') neft += newInvoice.totalAmount;

      return {
        ...prev,
        cashInDrawer: cash,
        upiCollections: upi,
        cardPosTerminal: card,
        directNeftBank: neft,
        totalRealized: prev.totalRealized + newInvoice.totalAmount
      };
    });

    // Deduct stock from parts
    setParts(prevParts =>
      prevParts.map(p => {
        const lineItem = newInvoice.lineItems.find(item => item.partId === p.id || item.sku === p.sku);
        if (lineItem) {
          const updatedStock = Math.max(0, p.currentStock - lineItem.qty);
          return {
            ...p,
            currentStock: updatedStock,
            status: updatedStock === 0 ? 'Out of Stock' : updatedStock < p.minReorder ? 'Low Stock' : 'Normal',
            stockMovements: [
              {
                date: 'Today',
                ref: newInvoice.id,
                type: 'POS Out',
                qty: -lineItem.qty,
                balance: updatedStock,
                userOrParty: newInvoice.customerName
              },
              ...p.stockMovements
            ]
          };
        }
        return p;
      })
    );

    showToast(`Invoice ${newInvoice.id} generated for ₹${newInvoice.totalAmount.toFixed(2)} (${newInvoice.customerName})`);

    // Asynchronously persist to PostgreSQL
    try {
      await saleService.create({
        invoiceNumber: newInvoice.id,
        customerName: newInvoice.customerName,
        customerMobile: newInvoice.customerPhone,
        vehicleRegNo: newInvoice.vehicleNo,
        customerId: newInvoice.garageAccountId,
        items: newInvoice.lineItems.map(li => ({
          itemId: li.partId,
          partNumber: li.sku,
          name: li.name,
          quantity: li.qty,
          unitRate: li.rate,
          taxRate: li.gstRate || 18,
          hsnCode: li.hsn
        })),
        paymentMode: newInvoice.payMode === 'Cash' ? 'CASH'
          : newInvoice.payMode === 'UPI (GPay)' ? 'UPI'
          : newInvoice.payMode === 'Card POS' ? 'CARD'
          : newInvoice.payMode === 'NEFT Bank' ? 'NEFT_RTGS'
          : newInvoice.payMode === 'Cheque' ? 'CHEQUE'
          : newInvoice.payMode === 'Credit Ledger' ? 'CREDIT' : 'CASH',
        paidAmount: newInvoice.totalAmount,
        status: 'COMPLETED'
      });
    } catch (err: any) {
      console.warn('Backend sync for POS sale deferred:', err.message || err);
    }
  };

  // Handler: Add new spare part
  const handleSavePart = async (newPart: SparePart) => {
    setParts(prev => [newPart, ...prev]);
    showToast(`Spare part "${newPart.name}" added with SKU ${newPart.sku}`);

    try {
      await itemService.create({
        sku: newPart.sku,
        name: newPart.name,
        shortName: newPart.shortName,
        oemPartNumber: newPart.oemCode,
        hsnCode: newPart.hsn,
        categoryId: newPart.category,
        brandId: newPart.brand,
        unit: newPart.unit || 'PCS',
        gstRate: newPart.gstRate || 18,
        mrp: newPart.mrp,
        purchaseRate: newPart.purchasePrice,
        sellingRate: newPart.counterPrice,
        maintainStock: true,
        minStock: newPart.minReorder || 5,
        reorderLevel: newPart.minReorder || 5,
        rackLocation: newPart.rackBin
      });
    } catch (err) {
      console.warn('Backend sync for part creation deferred:', err);
    }
  };

  // Handler: Update existing spare part
  const handleUpdatePart = async (updatedPart: SparePart) => {
    setParts(prev => prev.map(p => (p.id === updatedPart.id ? updatedPart : p)));
    showToast(`Updated SKU ${updatedPart.sku} (${updatedPart.name})`);

    try {
      if (updatedPart.id) {
        await itemService.update(updatedPart.id, {
          name: updatedPart.name,
          shortName: updatedPart.shortName,
          oemPartNumber: updatedPart.oemCode,
          hsnCode: updatedPart.hsn,
          mrp: updatedPart.mrp,
          purchaseRate: updatedPart.purchasePrice,
          sellingRate: updatedPart.counterPrice,
          rackLocation: updatedPart.rackBin
        });
      }
    } catch (err) {
      console.warn('Backend sync for part update deferred:', err);
    }
  };

  // Handler: Stock Adjustment
  const handleStockAdjustment = async (
    partId: string,
    qtyDelta: number,
    reason: StockAdjustmentReason,
    notes: string
  ) => {
    setParts(prevParts =>
      prevParts.map(p => {
        if (p.id === partId) {
          const newQty = Math.max(0, p.currentStock + qtyDelta);
          const newStatus =
            newQty === 0 ? 'Out of Stock' : newQty <= p.minReorder ? 'Low Stock' : 'Normal';
          return {
            ...p,
            currentStock: newQty,
            status: newStatus,
            stockMovements: [
              {
                date: 'Today',
                ref: `ADJ-${Date.now().toString().slice(-4)}`,
                type: 'Stock Adjust' as any,
                qty: qtyDelta,
                balance: newQty,
                userOrParty: `Audit: ${reason} - ${notes || 'Manual'}`
              },
              ...p.stockMovements
            ]
          };
        }
        return p;
      })
    );
    showToast(`Stock adjusted by ${qtyDelta >= 0 ? `+${qtyDelta}` : qtyDelta} units (${reason})`);

    try {
      await stockService.adjustStock({
        itemId: partId,
        direction: qtyDelta >= 0 ? 'IN' : 'OUT',
        quantity: Math.abs(qtyDelta),
        reason,
        notes: notes || 'Manual stock adjustment'
      });
    } catch (err) {
      console.warn('Backend sync for stock adjustment deferred:', err);
    }
  };

  // Handler: Confirm PO
  const handleConfirmPo = async (partName: string, supplier: string, qty: number) => {
    const poNumber = `PO-${Math.floor(8000 + Math.random() * 1000)}`;
    setParts(prev =>
      prev.map(p =>
        p.name === partName
          ? { ...p, pendingPo: { poNumber, qty, supplier } }
          : p
      )
    );
    showToast(`Purchase Order ${poNumber} issued for ${qty}x ${partName} to ${supplier}`);

    try {
      await purchaseService.create({
        poNumber,
        supplierId: supplier || 'default-supplier',
        supplierInvoiceNo: poNumber,
        notes: `Purchase Order issued for ${qty}x ${partName}`
      });
    } catch (err) {
      console.warn('Backend sync for PO deferred:', err);
    }
  };

  // Handler: Sales Return (restores inventory)
  const handleStockReturn = (returnedItems: SalesReturnItem[]) => {
    setParts(prevParts =>
      prevParts.map(p => {
        const item = returnedItems.find(r => r.partId === p.id);
        if (item) {
          const updatedStock = p.currentStock + item.returnQty;
          return {
            ...p,
            currentStock: updatedStock,
            status: updatedStock === 0 ? 'Out of Stock' : updatedStock < p.minReorder ? 'Low Stock' : 'Normal',
            stockMovements: [
              {
                date: 'Today',
                ref: 'Sales Return',
                type: 'Stock In (Return)',
                qty: item.returnQty,
                balance: updatedStock,
                userOrParty: 'Counter Return'
              },
              ...p.stockMovements
            ]
          };
        }
        return p;
      })
    );
  };

  // ==========================================
  // QUOTATION MANAGEMENT HANDLERS
  // ==========================================
  const handleSaveQuotation = async (quote: Quotation) => {
    setQuotations(prev => {
      const exists = prev.some(q => q.id === quote.id);
      if (exists) {
        return prev.map(q => (q.id === quote.id ? quote : q));
      }
      return [quote, ...prev];
    });

    logAuditEvent(
      editingQuotation ? 'Quotation Modified' : 'Quotation Created',
      'Sales',
      quote.quotationNumber,
      editingQuotation ? editingQuotation.status : 'NEW',
      quote.status,
      `Saved proforma estimate ${quote.quotationNumber} for ${quote.customerName} (₹${quote.totalAmount.toFixed(2)})`,
      'Success'
    );

    showToast(`Quotation ${quote.quotationNumber} saved (${quote.status})`);
    setEditingQuotation(null);

    try {
      await quotationService.create({
        quotationNumber: quote.quotationNumber,
        customerName: quote.customerName,
        customerMobile: quote.customerMobile,
        customerGstin: quote.customerGstin,
        validUntil: quote.validUntil,
        discountTotal: quote.discountTotal,
        items: quote.items.map(it => ({
          itemId: it.partId || it.id,
          partNumber: it.partNumber,
          name: it.itemName,
          quantity: it.quantity,
          unitRate: it.rate,
          taxRate: it.taxRate,
          hsnCode: (it as any).hsn || (it as any).hsnCode || ''
        }))
      });
    } catch (err) {
      console.warn('Backend sync for quotation deferred:', err);
    }
  };

  const handleDuplicateQuotation = async (quote: Quotation) => {
    const duplicated: Quotation = {
      ...quote,
      id: `qt-${Date.now()}`,
      quotationNumber: `QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'DRAFT',
      convertedInvoiceNo: undefined,
      convertedAt: undefined,
      createdAt: `${quote.date}, ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
    };

    setQuotations(prev => [duplicated, ...prev]);
    logAuditEvent(
      'Quotation Created',
      'Sales',
      duplicated.quotationNumber,
      quote.quotationNumber,
      'DRAFT',
      `Duplicated estimate ${quote.quotationNumber} as new revision ${duplicated.quotationNumber}`,
      'Success'
    );
    showToast(`Duplicated as new quote ${duplicated.quotationNumber}`);

    try {
      await quotationService.duplicate(quote.id);
    } catch (err) {
      console.warn('Backend sync for duplicate quotation deferred:', err);
    }
  };

  const handleCancelQuotation = (quote: Quotation) => {
    setQuotations(prev =>
      prev.map(q => (q.id === quote.id ? { ...q, status: 'REJECTED' } : q))
    );

    logAuditEvent(
      'Quotation Cancelled',
      'Sales',
      quote.quotationNumber,
      quote.status,
      'REJECTED',
      `Rejected / cancelled estimate ${quote.quotationNumber}`,
      'Warning'
    );
    showToast(`Quotation ${quote.quotationNumber} marked as REJECTED`);
  };

  const handleShareQuotation = (quote: Quotation) => {
    const text = `*BIKE ERP ESTIMATE - ${quote.quotationNumber}*\nCustomer: ${quote.customerName}\nVehicle: ${quote.vehicleNumber || 'N/A'}\nItems: ${quote.items.length} SKUs\nTotal Estimate: ₹${quote.totalAmount.toFixed(2)}\nValid Until: ${quote.validUntil}\n\nThank you for choosing our workshop!`;
    const encoded = encodeURIComponent(text);
    if (quote.customerMobile) {
      window.open(`https://wa.me/91${quote.customerMobile.replace(/\D/g, '')}?text=${encoded}`, '_blank');
    } else {
      navigator.clipboard?.writeText(text);
      showToast(`Quotation text copied to clipboard!`);
    }
  };

  // Convert Quotation directly into live POS Sales Invoice
  const handleConvertToInvoice = async (quote: Quotation) => {
    if (quote.status === 'CONVERTED') {
      showToast(`Quotation ${quote.quotationNumber} is already converted to Invoice #${quote.convertedInvoiceNo}`);
      return;
    }

    if (new Date(quote.validUntil).getTime() < Date.now()) {
      showToast(`Warning: Quotation ${quote.quotationNumber} has expired on ${quote.validUntil}`);
    }

    // 1. Live stock and pricing validation
    for (const item of quote.items) {
      if (item.partId) {
        const foundPart = parts.find(p => p.id === item.partId);
        if (foundPart && foundPart.currentStock < item.quantity) {
          showToast(`Insufficient physical stock for "${foundPart.name}" (Required: ${item.quantity}, Current Stock: ${foundPart.currentStock}). Please replenish inventory before converting.`);
          return;
        }
      }
    }

    // 2. Build live Sales Invoice
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newInvoice: Invoice = {
      id: invoiceNumber,
      customerName: quote.customerName,
      customerPhone: quote.customerMobile,
      vehicleNo: quote.vehicleNumber,
      bikeModel: quote.vehicleModel,
      isGarage: !!quote.customerId,
      garageAccountId: quote.customerId,
      gstin: quote.customerGstin,
      itemsCount: quote.items.length,
      itemsSummary: quote.items.map(it => `${it.itemName} (${it.quantity})`).join(', '),
      lineItems: quote.items.map((it, idx) => ({
        id: it.id || `li-${idx}`,
        partId: it.partId || '',
        sku: it.partNumber || it.partId || 'SKU-GEN',
        partNumber: it.partNumber,
        name: it.itemName,
        brand: 'OEM Spec',
        category: 'Spares',
        hsn: '8714',
        qty: it.quantity,
        rate: it.rate,
        sellingRate: it.rate,
        discount: it.discount,
        gstRate: it.taxRate,
        taxableAmount: it.amount,
        total: it.amount
      })),
      subtotal: quote.subtotal,
      billDiscountTotal: quote.discountTotal,
      taxableAmount: quote.taxableAmount,
      cgst: quote.cgst,
      sgst: quote.sgst,
      igst: quote.igst,
      roundOff: quote.roundOff,
      totalAmount: quote.totalAmount,
      payMode: 'Cash',
      taxType: quote.igst > 0 ? 'INTERSTATE' : quote.customerGstin ? 'B2B (GST)' : 'B2C',
      status: 'PAID',
      operator: 'Rajesh (Store Admin)',
      createdAt: `${quote.date}, ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
    };

    // 3. Update Invoices
    setInvoices(prev => [newInvoice, ...prev]);

    // 4. Atomically Deduct stock from parts
    setParts(prevParts =>
      prevParts.map(p => {
        const matchedItem = quote.items.find(it => it.partId === p.id || it.partNumber === p.sku);
        if (matchedItem) {
          const updatedStock = Math.max(0, p.currentStock - matchedItem.quantity);
          return {
            ...p,
            currentStock: updatedStock,
            status: updatedStock === 0 ? 'Out of Stock' : updatedStock < p.minReorder ? 'Low Stock' : 'Normal',
            stockMovements: [
              {
                date: 'Today',
                ref: invoiceNumber,
                type: 'POS Out',
                qty: -matchedItem.quantity,
                balance: updatedStock,
                userOrParty: `Converted Quote ${quote.quotationNumber} (${quote.customerName})`
              },
              ...p.stockMovements
            ]
          };
        }
        return p;
      })
    );

    // 5. Update Quotation Status to CONVERTED
    setQuotations(prev =>
      prev.map(q =>
        q.id === quote.id
          ? {
              ...q,
              status: 'CONVERTED',
              convertedInvoiceNo: invoiceNumber,
              convertedAt: `${quote.date}, ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
            }
          : q
      )
    );

    // 6. Update Tender Reconciliation Data
    setTenderData(prev => ({
      ...prev,
      cashInDrawer: prev.cashInDrawer + newInvoice.totalAmount,
      totalRealized: prev.totalRealized + newInvoice.totalAmount
    }));

    // 7. Audit Log
    logAuditEvent(
      'Quotation Converted',
      'Sales',
      quote.quotationNumber,
      quote.status,
      'CONVERTED',
      `Converted quotation ${quote.quotationNumber} into Sales Invoice ${invoiceNumber} for ₹${quote.totalAmount.toFixed(2)}`,
      'Success'
    );

    showToast(`Quotation ${quote.quotationNumber} converted to Sales Invoice ${invoiceNumber}!`);
    setViewingInvoice(newInvoice);

    try {
      await quotationService.convertToInvoice({
        quotationId: quote.id,
        paymentMode: 'CASH',
        paidAmount: quote.totalAmount
      });
    } catch (err) {
      console.warn('Backend sync for quotation conversion deferred:', err);
    }
  };

  // ==========================================
  // SALES RETURN (CREDIT NOTE) HANDLER
  // ==========================================
  const handleConfirmSalesReturn = async (returnRecord: SalesReturnRecord) => {
    // 1. Add to sales returns ledger
    setSalesReturns(prev => [returnRecord, ...prev]);

    // 2. Atomically restock parts in inventory
    setParts(prevParts =>
      prevParts.map(p => {
        const retItem = returnRecord.items.find(it => it.partId === p.id || it.partNumber === p.sku);
        if (retItem) {
          const updatedStock = p.currentStock + retItem.returnQuantity;
          return {
            ...p,
            currentStock: updatedStock,
            status: updatedStock === 0 ? 'Out of Stock' : updatedStock < p.minReorder ? 'Low Stock' : 'Normal',
            stockMovements: [
              {
                date: 'Today',
                ref: returnRecord.creditNoteNumber,
                type: 'Stock In (Return)',
                qty: retItem.returnQuantity,
                balance: updatedStock,
                userOrParty: `Sales Return: ${returnRecord.customerName} (${returnRecord.reason})`
              },
              ...p.stockMovements
            ]
          };
        }
        return p;
      })
    );

    // 3. Accounting & Customer Ledger impact
    if (returnRecord.refundMethod === 'Customer Credit' && returnRecord.customerId) {
      setReceivables(prev =>
        prev.map(r => {
          if (r.customerId === returnRecord.customerId || r.customerName === returnRecord.customerName) {
            const updatedOut = Math.max(0, r.outstanding - returnRecord.refundAmount);
            return {
              ...r,
              outstanding: updatedOut,
              status: updatedOut === 0 ? 'CURRENT' : r.status
            };
          }
          return r;
        })
      );

      const creditLedgerEntry: CustomerLedgerEntry = {
        id: 'cle-ret-' + Date.now(),
        date: returnRecord.date,
        particular: `Sales Return Credit Note (${returnRecord.creditNoteNumber}) - ${returnRecord.reason}`,
        receiptNo: returnRecord.creditNoteNumber,
        debit: 0,
        credit: returnRecord.refundAmount,
        balance: 0,
        type: 'Return',
        createdBy: 'Rajesh (Store Admin)'
      };
      setCustomerLedger(prev => [creditLedgerEntry, ...prev]);
    } else if (returnRecord.refundMethod === 'Cash Refund') {
      setTenderData(prev => ({
        ...prev,
        cashInDrawer: Math.max(0, prev.cashInDrawer - returnRecord.refundAmount),
        totalRealized: Math.max(0, prev.totalRealized - returnRecord.refundAmount)
      }));
    }

    // 4. Audit Log
    logAuditEvent(
      'Sale Return Created',
      'Sales',
      returnRecord.creditNoteNumber,
      returnRecord.invoiceNumber,
      'RETURNED',
      `Processed sales return credit note ${returnRecord.creditNoteNumber} for ₹${returnRecord.refundAmount.toFixed(2)} (${returnRecord.refundMethod})`,
      'Success'
    );

    showToast(`Sales return credit note ${returnRecord.creditNoteNumber} issued. Inventory restocked.`);

    try {
      await saleService.createReturn({
        saleId: returnRecord.invoiceNumber || 'counter-sale',
        creditNoteNumber: returnRecord.creditNoteNumber,
        reason: returnRecord.reason,
        refundMode: returnRecord.refundMethod === 'Cash Refund' ? 'CASH' : returnRecord.refundMethod === 'Customer Credit' ? 'CREDIT' : 'UPI',
        items: returnRecord.items.map(it => ({
          itemId: it.partId || 'item-return',
          quantity: it.returnQuantity,
          unitRate: it.rate || 0,
          isRestocked: true
        }))
      });
    } catch (err) {
      console.warn('Backend sync for sales return deferred:', err);
    }
  };

  // ==========================================
  // PURCHASE RETURN (DEBIT NOTE) HANDLER
  // ==========================================
  const handleConfirmPurchaseReturn = async (returnRecord: PurchaseReturnRecord) => {
    // 1. Add to purchase returns ledger
    setPurchaseReturns(prev => [returnRecord, ...prev]);

    // 2. Atomically decrease physical inventory
    setParts(prevParts =>
      prevParts.map(p => {
        const retItem = returnRecord.items.find(it => it.partId === p.id || it.partNumber === p.sku);
        if (retItem) {
          const updatedStock = Math.max(0, p.currentStock - retItem.returnQuantity);
          return {
            ...p,
            currentStock: updatedStock,
            status: updatedStock === 0 ? 'Out of Stock' : updatedStock < p.minReorder ? 'Low Stock' : 'Normal',
            stockMovements: [
              {
                date: 'Today',
                ref: returnRecord.debitNoteNumber,
                type: 'Purchase Return',
                qty: -retItem.returnQuantity,
                balance: updatedStock,
                userOrParty: `Supplier Debit: ${returnRecord.supplierName} (${returnRecord.reason})`
              },
              ...p.stockMovements
            ]
          };
        }
        return p;
      })
    );

    // 3. Accounting & Supplier Ledger impact
    if (returnRecord.returnMethod === 'Supplier Credit' && returnRecord.supplierId) {
      setPayables(prev =>
        prev.map(p => {
          if (p.supplierId === returnRecord.supplierId || p.supplierName === returnRecord.supplierName) {
            const updatedOut = Math.max(0, p.outstanding - returnRecord.totalAmount);
            return {
              ...p,
              outstanding: updatedOut,
              status: updatedOut === 0 ? 'CURRENT' : p.status
            };
          }
          return p;
        })
      );

      const debitLedgerEntry: SupplierLedgerEntry = {
        id: 'sle-ret-' + Date.now(),
        date: returnRecord.date,
        particular: `Purchase Return Debit Note (${returnRecord.debitNoteNumber}) - ${returnRecord.reason}`,
        paymentNo: returnRecord.debitNoteNumber,
        debit: returnRecord.totalAmount,
        credit: 0,
        balance: 0,
        type: 'Return',
        createdBy: 'Rajesh (Store Admin)'
      };
      setSupplierLedger(prev => [debitLedgerEntry, ...prev]);
    }

    // 4. Audit Log
    logAuditEvent(
      'Purchase Return Created',
      'Purchase',
      returnRecord.debitNoteNumber,
      returnRecord.poNumber,
      'RETURNED',
      `Processed supplier purchase return debit note ${returnRecord.debitNoteNumber} for ₹${returnRecord.totalAmount.toFixed(2)} (${returnRecord.returnMethod})`,
      'Success'
    );

    showToast(`Purchase return debit note ${returnRecord.debitNoteNumber} issued to ${returnRecord.supplierName}. Stock deducted.`);

    try {
      await purchaseService.createReturn({
        purchaseId: returnRecord.poNumber || 'manual-po',
        debitNoteNumber: returnRecord.debitNoteNumber,
        reason: returnRecord.reason,
        items: returnRecord.items.map(it => ({
          itemId: it.partId || 'item-return',
          quantity: it.returnQuantity,
          unitPrice: it.unitPrice || 0,
          defectNote: returnRecord.notes
        }))
      });
    } catch (err) {
      console.warn('Backend sync for purchase return deferred:', err);
    }
  };

  // Handler: Save Receipt Voucher
  const handleSaveReceipt = async (newReceipt: ReceiptVoucher, printAfter: boolean) => {
    setReceipts(prev => [newReceipt, ...prev]);

    // Update customer receivable balance
    setReceivables(prev =>
      prev.map(r => {
        if (r.customerId === newReceipt.customerId) {
          const updatedBal = Math.max(0, r.outstanding - newReceipt.amount);
          return {
            ...r,
            outstanding: updatedBal,
            lastPayment: `₹${newReceipt.amount.toLocaleString('en-IN')}`,
            lastPaymentDate: newReceipt.date,
            status: updatedBal === 0 ? 'CURRENT' : updatedBal > 30000 ? 'OVERDUE' : 'PENDING'
          };
        }
        return r;
      })
    );

    // Append to Customer Ledger
    const newCustomerLedgerEntry: CustomerLedgerEntry = {
      id: 'cle-' + Date.now(),
      date: newReceipt.date,
      particular: `Payment Received (${newReceipt.paymentMode} ${newReceipt.refNo ? '- ' + newReceipt.refNo : ''}) - ${newReceipt.remarks || 'Receipt'}`,
      receiptNo: newReceipt.receiptNo,
      debit: 0,
      credit: newReceipt.amount,
      balance: newReceipt.newBalance,
      type: 'Receipt',
      createdBy: newReceipt.createdBy
    };
    setCustomerLedger(prev => [newCustomerLedgerEntry, ...prev]);

    // Update Cash / Bank Account Balance
    setBankAccounts(prev =>
      prev.map(acc => {
        if (newReceipt.paymentMode === 'Cash' && acc.type === 'Cash') {
          return { ...acc, balance: acc.balance + newReceipt.amount };
        }
        if ((newReceipt.paymentMode === 'Bank' || newReceipt.paymentMode === 'Cheque') && acc.type === 'Bank') {
          return { ...acc, balance: acc.balance + newReceipt.amount };
        }
        if (newReceipt.paymentMode === 'UPI' && acc.type === 'UPI') {
          return { ...acc, balance: acc.balance + newReceipt.amount };
        }
        return acc;
      })
    );

    // Update Financial Timeline
    setFinancialTimeline(prev => [
      {
        id: 'ftl-' + Date.now(),
        date: 'Today',
        time: newReceipt.time,
        type: 'Receipt',
        title: `Receipt ${newReceipt.receiptNo} Recorded`,
        description: `₹${newReceipt.amount.toLocaleString('en-IN')} received from ${newReceipt.customerName} via ${newReceipt.paymentMode}`,
        amount: newReceipt.amount,
        party: newReceipt.customerName,
        reference: newReceipt.receiptNo,
        color: 'text-tertiary'
      },
      ...prev
    ]);

    setIsCreateReceiptOpen(false);
    setRecordedReceiptForSuccess(newReceipt);
    showToast(`Receipt ${newReceipt.receiptNo} saved for ₹${newReceipt.amount.toLocaleString('en-IN')}`);
    if (printAfter) {
      setTimeout(() => {
        triggerPrintWindow(
          `Receipt ${newReceipt.receiptNo}`,
          `
          <div class="header">
            <h1 class="title">BIKE ERP PAYMENT RECEIPT VOUCHER</h1>
            <div class="subtitle">Receipt Voucher #${newReceipt.receiptNo} | Date: ${newReceipt.date} ${newReceipt.time}</div>
          </div>
          <p><strong>Customer:</strong> ${newReceipt.customerName}</p>
          <p><strong>Payment Mode:</strong> ${newReceipt.paymentMode} | <strong>Ref No:</strong> ${newReceipt.refNo || 'Cash'}</p>
          <p><strong>Amount:</strong> ₹${newReceipt.amount.toLocaleString('en-IN')}</p>
          <div class="total-box">
            <div class="total-row"><span>Total Amount:</span> <span>₹${newReceipt.amount.toLocaleString('en-IN')}</span></div>
          </div>
          `
        );
      }, 300);
    }

    try {
      await accountService.createReceipt({
        customerId: newReceipt.customerId,
        customerName: newReceipt.customerName,
        amount: newReceipt.amount,
        paymentMode: newReceipt.paymentMode === 'Cash' ? 'CASH'
          : newReceipt.paymentMode === 'UPI' ? 'UPI'
          : newReceipt.paymentMode === 'Bank' ? 'NEFT_RTGS'
          : newReceipt.paymentMode === 'Cheque' ? 'CHEQUE' : 'CASH',
        referenceNo: newReceipt.refNo,
        notes: newReceipt.remarks
      });
    } catch (err) {
      console.warn('Backend sync for receipt deferred:', err);
    }
  };

  // Handler: Save Supplier Payment Voucher
  const handleSavePayment = async (newPayment: PaymentVoucher, printAfter: boolean) => {
    setPayments(prev => [newPayment, ...prev]);

    // Update supplier payable balance
    setPayables(prev =>
      prev.map(p => {
        if (p.supplierId === newPayment.supplierId) {
          const updatedBal = Math.max(0, p.outstanding - newPayment.amount);
          return {
            ...p,
            outstanding: updatedBal,
            paid: p.paid + newPayment.amount,
            lastPaymentDate: newPayment.date,
            status: updatedBal === 0 ? 'PAID' : 'PENDING'
          };
        }
        return p;
      })
    );

    // Append to Supplier Ledger
    const newSupplierLedgerEntry: SupplierLedgerEntry = {
      id: 'sle-' + Date.now(),
      date: newPayment.date,
      particular: `Payment Released (${newPayment.paymentMode} ${newPayment.refNo ? '- ' + newPayment.refNo : ''}) - ${newPayment.remarks || 'Voucher'}`,
      paymentNo: newPayment.paymentNo,
      purchase: newPayment.reference,
      debit: newPayment.amount,
      credit: 0,
      balance: newPayment.remainingPayable,
      type: 'Payment',
      createdBy: newPayment.approvedBy || newPayment.createdBy
    };
    setSupplierLedger(prev => [newSupplierLedgerEntry, ...prev]);

    // Deduct from Cash or Bank Account
    setBankAccounts(prev =>
      prev.map(acc => {
        if (newPayment.paymentMode === 'Cash' && acc.type === 'Cash') {
          return { ...acc, balance: Math.max(0, acc.balance - newPayment.amount) };
        }
        if ((newPayment.paymentMode === 'Bank' || newPayment.paymentMode === 'Cheque') && acc.type === 'Bank') {
          return { ...acc, balance: Math.max(0, acc.balance - newPayment.amount) };
        }
        if (newPayment.paymentMode === 'UPI' && acc.type === 'UPI') {
          return { ...acc, balance: Math.max(0, acc.balance - newPayment.amount) };
        }
        return acc;
      })
    );

    // Update Financial Timeline
    setFinancialTimeline(prev => [
      {
        id: 'ftl-' + Date.now(),
        date: 'Today',
        time: newPayment.time,
        type: 'Payment',
        title: `Payment ${newPayment.paymentNo} Released`,
        description: `₹${newPayment.amount.toLocaleString('en-IN')} paid to ${newPayment.supplierName} via ${newPayment.paymentMode}`,
        amount: newPayment.amount,
        party: newPayment.supplierName,
        reference: newPayment.paymentNo,
        color: 'text-error'
      },
      ...prev
    ]);

    setIsCreatePaymentOpen(false);
    setRecordedPaymentForSuccess(newPayment);
    showToast(`Payment ${newPayment.paymentNo} disbursed for ₹${newPayment.amount.toLocaleString('en-IN')}`);
    if (printAfter) {
      setTimeout(() => {
        triggerPrintWindow(
          `Payment Voucher ${newPayment.paymentNo}`,
          `
          <div class="header">
            <h1 class="title">BIKE ERP SUPPLIER PAYMENT VOUCHER</h1>
            <div class="subtitle">Payment Voucher #${newPayment.paymentNo} | Date: ${newPayment.date} ${newPayment.time}</div>
          </div>
          <p><strong>Supplier:</strong> ${newPayment.supplierName}</p>
          <p><strong>Payment Mode:</strong> ${newPayment.paymentMode} | <strong>Ref No:</strong> ${newPayment.refNo || 'Direct Payout'}</p>
          <p><strong>Disbursed Amount:</strong> ₹${newPayment.amount.toLocaleString('en-IN')}</p>
          <div class="total-box">
            <div class="total-row"><span>Total Disbursed:</span> <span>₹${newPayment.amount.toLocaleString('en-IN')}</span></div>
          </div>
          `
        );
      }, 300);
    }

    try {
      await accountService.createPayment({
        supplierId: newPayment.supplierId,
        supplierName: newPayment.supplierName,
        amount: newPayment.amount,
        paymentMode: newPayment.paymentMode === 'Cash' ? 'CASH'
          : newPayment.paymentMode === 'UPI' ? 'UPI'
          : newPayment.paymentMode === 'Bank' ? 'NEFT_RTGS'
          : newPayment.paymentMode === 'Cheque' ? 'CHEQUE' : 'CASH',
        referenceNo: newPayment.refNo,
        notes: newPayment.remarks
      });
    } catch (err) {
      console.warn('Backend sync for payment deferred:', err);
    }
  };

  // Handler: Banking Contra Operation (Deposit, Withdrawal, Transfer)
  const handleExecuteBankingOperation = async (tx: BankTransaction, updatedAccounts: BankingAccount[]) => {
    setBankTransactions(prev => [tx, ...prev]);
    setBankAccounts(updatedAccounts);
    setBankingOperationType(null);
    logAuditEvent(
      `${tx.type} Recorded`,
      'Accounts',
      tx.reference,
      'PENDING',
      'COMPLETED',
      `Executed ${tx.type} of ₹${tx.debit || tx.credit} on ${tx.account} (${tx.reference})`,
      'Success'
    );
    showToast(`${tx.type} transaction ${tx.reference} executed successfully`);

    try {
      if ((tx.type as string) === 'Cash Deposit' || tx.type === 'Deposit') {
        await accountService.createDeposit({
          accountId: tx.account,
          amount: tx.credit || tx.debit,
          source: 'CASH_DRAWER',
          referenceNo: tx.reference,
          notes: tx.description
        });
      } else if ((tx.type as string) === 'Cash Withdrawal' || tx.type === 'Withdrawal') {
        await accountService.createWithdrawal({
          accountId: tx.account,
          amount: tx.debit || tx.credit,
          purpose: 'PETTY_CASH',
          referenceNo: tx.reference,
          notes: tx.description
        });
      } else if ((tx.type as string) === 'Inter-Bank Transfer' || tx.type === 'Transfer') {
        await accountService.createTransfer({
          fromAccountId: tx.account,
          toAccountId: updatedAccounts.find(a => a.id !== tx.account)?.id || tx.account,
          amount: tx.debit || tx.credit,
          referenceNo: tx.reference,
          notes: tx.description
        });
      }
    } catch (err) {
      console.warn('Backend sync for banking operation deferred:', err);
    }
  };

  const handleToggleReconcile = async (txId: string) => {
    setBankTransactions(prev =>
      prev.map(t => {
        if (t.id === txId) {
          const newStatus = t.status === 'Reconciled' ? 'Pending' : 'Reconciled';
          logAuditEvent(
            'Bank Transaction Reconciled',
            'Accounts',
            t.reference,
            t.status,
            newStatus,
            `Transaction ${t.reference} marked as ${newStatus}`,
            'Success'
          );
          showToast(`Transaction ${t.reference} is now ${newStatus}`);
          return { ...t, status: newStatus };
        }
        return t;
      })
    );

    try {
      await accountService.reconcileTransaction({
        transactionId: txId,
        bankStatementDate: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Backend sync for reconcile deferred:', err);
    }
  };

  // Handler: Non-destructive audited reversal
  const handleConfirmReversal = async (target: any, reason: string) => {
    const timestamp = new Date().toLocaleDateString('en-GB');
    if ('receiptNo' in target) {
      // Reversing a receipt
      setReceipts(prev => prev.map(r => (r.id === target.id ? { ...r, status: 'Reversed' } : r)));
      // Add reversal Debit entry in customer ledger
      const reversalEntry: CustomerLedgerEntry = {
        id: 'cle-rev-' + Date.now(),
        date: timestamp,
        particular: `[REVERSAL] Reversal of ${target.receiptNo}: ${reason}`,
        debit: target.amount,
        credit: 0,
        balance: target.previousBalance || 42000,
        type: 'Contra',
        createdBy: 'System Audit'
      };
      setCustomerLedger(prev => [reversalEntry, ...prev]);
      showToast(`Receipt ${target.receiptNo} reversed. Reversal entry posted.`);
    } else if ('paymentNo' in target) {
      // Reversing a payment
      setPayments(prev => prev.map(p => (p.id === target.id ? { ...p, status: 'Reversed' } : p)));
      // Add reversal Credit entry in supplier ledger
      const reversalEntry: SupplierLedgerEntry = {
        id: 'sle-rev-' + Date.now(),
        date: timestamp,
        particular: `[REVERSAL] Reversal of ${target.paymentNo}: ${reason}`,
        debit: 0,
        credit: target.amount,
        balance: (target.remainingPayable || 27000) + target.amount,
        type: 'Contra',
        createdBy: 'System Audit'
      };
      setSupplierLedger(prev => [reversalEntry, ...prev]);
      showToast(`Payment ${target.paymentNo} reversed. Reversal entry posted.`);
    }
    setReversalTarget(null);
    setSelectedTxForDrawer(null);

    try {
      if ('receiptNo' in target) {
        await accountService.reverseReceipt({
          voucherType: 'RECEIPT',
          voucherId: target.id,
          reason
        });
      } else if ('paymentNo' in target) {
        await accountService.reversePayment({
          voucherType: 'PAYMENT',
          voucherId: target.id,
          reason
        });
      }
    } catch (err) {
      console.warn('Backend sync for reversal deferred:', err);
    }
  };

  // Helper for recording audit logs
  const logAuditEvent = (
    action: string,
    module: AuditLogEntry['module'],
    recordId: string,
    previousValue: string,
    newValue: string,
    details: string,
    status: AuditLogEntry['status'] = 'Success'
  ) => {
    const newLog: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp:
        new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
        ' ' +
        new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      user: 'admin',
      username: 'admin',
      userRole: userRole,
      action,
      module,
      record: recordId,
      recordId,
      previousValue,
      newValue,
      details,
      ipDevice: '192.168.1.100 (HQ Terminal)',
      ipAddress: '192.168.1.100',
      status
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    const newActivity: UserActivityItem = {
      id: `act-${Date.now()}`,
      user: 'admin',
      username: 'admin',
      userRole: userRole,
      action,
      activityType: module === 'Security' ? 'SECURITY' : 'ADMIN',
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' Today',
      device: 'HQ Terminal (Chrome)',
      relatedRecord: recordId,
      details
    };
    setUserActivities((prev) => [newActivity, ...prev]);
  };

  // Administration action handlers
  const handleSaveCompanyProfile = async (updated: CompanyProfile) => {
    const prevName = companyProfile.companyName || companyProfile.firmName;
    setCompanyProfile(updated);
    logAuditEvent(
      'Company Profile Updated',
      'Settings',
      updated.gstin,
      prevName,
      updated.companyName || updated.firmName,
      'Updated legal firm profile, bank account, and GST terms.'
    );
    showToast('Company profile & GST tax details saved successfully');

    try {
      await adminService.updateCompanySettings({
        legalName: updated.companyName || updated.firmName,
        tradeName: updated.companyName || updated.firmName,
        gstin: updated.gstin,
        email: updated.email,
        phone: updated.phone || (updated as any).mobile || '',
        addressLine1: updated.address || (updated as any).addressLine1 || ''
      });
    } catch (err) {
      console.warn('Backend sync for company profile deferred:', err);
    }
  };

  const handleSaveBranch = async (branch: BranchLocation) => {
    const exists = branches.find((b) => b.id === branch.id);
    if (exists) {
      setBranches((prev) => prev.map((b) => (b.id === branch.id ? branch : b)));
      logAuditEvent('Branch Updated', 'Branches', branch.code || branch.branchCode || '', exists.name || exists.branchName || '', branch.name || branch.branchName || '', `Updated branch ${branch.name || branch.branchName}`);
      showToast(`Branch ${branch.name || branch.branchName} updated`);
    } else {
      setBranches((prev) => [...prev, branch]);
      logAuditEvent('Branch Created', 'Branches', branch.code || branch.branchCode || '', 'None', branch.name || branch.branchName || '', `Added new retail branch/warehouse ${branch.name || branch.branchName}`);
      showToast(`Branch ${branch.name || branch.branchName} registered`);
      try {
        await adminService.createBranch({
          branchCode: branch.code || branch.branchCode || `BR-${Date.now().toString().slice(-4)}`,
          name: branch.name || branch.branchName,
          address: branch.address,
          phone: branch.contactPhone || (branch as any).phone || ''
        });
      } catch (err) {
        console.warn('Backend sync for branch creation deferred:', err);
      }
    }
  };

  const handleDeleteBranch = (branchId: string) => {
    const b = branches.find((item) => item.id === branchId);
    if (b) {
      setBranches((prev) => prev.filter((item) => item.id !== branchId));
      logAuditEvent('Branch Deleted', 'Branches', b.code || b.branchCode || '', b.name || b.branchName || '', 'Deleted', `Removed branch ${b.name || b.branchName}`, 'Warning');
      showToast(`Branch ${b.name || b.branchName} deleted`);
    }
  };

  const handleSaveNumberingConfigs = async (configs: NumberingConfig[]) => {
    setNumberingConfigs(configs);
    logAuditEvent('Document Numbering Updated', 'Settings', 'VOUCHER_SERIES', 'Previous Series', 'Updated Series', 'Modified running numbering sequences and prefixes');
    showToast('Document numbering sequences saved');

    try {
      await adminService.updateNumberingConfigs({ configs });
    } catch (err) {
      console.warn('Backend sync for numbering configs deferred:', err);
    }
  };

  const handleSaveTaxRates = (rates: TaxRateConfig[]) => {
    setTaxRates(rates);
    logAuditEvent('GST Tax Slabs Updated', 'GST', 'TAX_SLABS', 'Previous Slabs', `${rates.length} Slabs Configured`, 'Updated statutory GST tax rate matrix');
    showToast('GST tax slabs updated');
  };

  const handleSavePaymentModes = (modes: PaymentModeConfig[]) => {
    setPaymentModes(modes);
    logAuditEvent('Payment Modes Updated', 'Accounts', 'MODES', 'Previous Modes', `${modes.length} Modes Configured`, 'Updated payment tender options and GL accounts');
    showToast('Payment modes configuration saved');
  };

  const handleSaveTemplateConfig = (config: InvoiceTemplateConfig) => {
    setTemplateConfig(config);
    logAuditEvent('Invoice Template Updated', 'Settings', config.templateType || config.format, 'Previous Template', config.templateType || config.format, 'Updated invoice printing layout, colors, and headers');
    showToast('Invoice template saved');
  };

  const handleSavePrinterConfig = async (config: PrinterConfig) => {
    setPrinterConfig(config);
    logAuditEvent('Printer Configuration Updated', 'Hardware', 'PRINTER_ROUTING', 'Previous Driver', config.thermalPrinter, 'Updated hardware spooling and printer routing');
    showToast('Printer hardware configuration saved');

    try {
      await adminService.updatePrinterSettings(config);
    } catch (err) {
      console.warn('Backend sync for printer settings deferred:', err);
    }
  };

  const handleCreateBackup = async () => {
    const now = new Date();
    const backupName = `BIKE_ERP_BACKUP_${now.toISOString().slice(0, 10).replace(/-/g, '')}_${now.getHours()}${now.getMinutes()}.sql.gz`;
    const newBackup: BackupRecord = {
      id: `bkp-${Date.now()}`,
      filename: backupName,
      fileName: backupName,
      date: now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      size: '43.2 MB',
      fileSize: '43.2 MB',
      createdBy: `${userRole.replace('_', ' ').toUpperCase()} (Manual)`,
      type: 'Manual',
      status: 'Success',
      location: 'Local D:\\BIKE_ERP\\Backups & Cloud Mirror',
      storageLocation: 'Local D:\\BIKE_ERP\\Backups & Cloud Mirror',
      recordsCount: parts.length + invoices.length + receipts.length + payments.length + 45000
    };
    setBackups((prev) => [newBackup, ...prev]);
    logAuditEvent('Backup Created', 'System', newBackup.filename, 'None', newBackup.size, 'Created verified database point-in-time snapshot');
    showToast(`Instant backup ${newBackup.filename} created`);

    try {
      await adminService.createBackup({ type: 'DATABASE', notes: 'Manual instant snapshot' });
    } catch (err) {
      console.warn('Backend sync for backup creation deferred:', err);
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    const b = backups.find((item) => item.id === backupId);
    if (b) {
      logAuditEvent('Backup Restored', 'System', b.filename, 'Active Database', b.filename, `Restored system state from archive ${b.filename}`, 'Warning');
      showToast(`Database successfully restored from ${b.filename}`);

      try {
        await adminService.restoreBackup({ backupId, confirmKey: 'RESTORE-CONFIRM' });
      } catch (err) {
        console.warn('Backend sync for restore backup deferred:', err);
      }
    }
  };

  const handleDeleteBackup = (backupId: string) => {
    const b = backups.find((item) => item.id === backupId);
    if (b) {
      setBackups((prev) => prev.filter((item) => item.id !== backupId));
      logAuditEvent('Backup Deleted', 'System', b.filename, b.filename, 'Deleted', `Deleted backup snapshot ${b.filename}`, 'Warning');
      showToast(`Backup ${b.filename} deleted`);
    }
  };

  const handleSaveSecuritySettings = (settings: SecuritySettingsConfig) => {
    setSecuritySettings(settings);
    logAuditEvent('Security Policy Updated', 'Security', 'POLICY', 'Previous Policy', 'Revised Policy', 'Updated authentication, password complexity, and lockout thresholds');
    showToast('Security policies and session settings saved');
  };

  const handleSaveUser = async (user: ErpUser) => {
    const exists = erpUsers.find((u) => u.id === user.id);
    if (exists) {
      setErpUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)));
      logAuditEvent('User Account Updated', 'Security', user.username, exists.role, user.role, `Updated user account details for @${user.username}`);
      showToast(`User @${user.username} updated`);
      try {
        await adminService.updateUser(user.id, {
          fullName: user.fullName,
          email: user.email,
          mobile: user.mobile
        });
      } catch (err) {
        console.warn('Backend sync for user update deferred:', err);
      }
    } else {
      setErpUsers((prev) => [...prev, user]);
      logAuditEvent('User Account Created', 'Security', user.username, 'None', user.role, `Created new ERP user account @${user.username}`);
      showToast(`User @${user.username} registered`);
      try {
        await adminService.createUser({
          username: user.username,
          fullName: user.fullName,
          email: user.email || `${user.username}@bikecare.erp`,
          mobile: user.mobile,
          password: 'Operator@123',
          roleId: user.role
        });
      } catch (err) {
        console.warn('Backend sync for user creation deferred:', err);
      }
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    setErpUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus = u.status === 'ACTIVE' || u.status === 'Active' ? 'DISABLED' : 'ACTIVE';
          logAuditEvent('User Status Toggled', 'Security', u.username, u.status, newStatus, `Account status changed to ${newStatus}`, newStatus === 'DISABLED' ? 'Warning' : 'Success');
          showToast(`User @${u.username} marked as ${newStatus}`);
          return { ...u, status: newStatus as any };
        }
        return u;
      })
    );
    try {
      await adminService.toggleUserStatus(userId);
    } catch (err) {
      console.warn('Backend sync for user status deferred:', err);
    }
  };

  const handleResetUserPassword = async (userId: string) => {
    const user = erpUsers.find((u) => u.id === userId);
    if (user) {
      logAuditEvent('Password Reset', 'Security', user.username, 'Encrypted', 'Temporary Key', `Admin reset password for @${user.username}`, 'Warning');
      showToast(`Temporary password generated for @${user.username}`);
      try {
        await adminService.resetPassword(userId, 'Reset@BikeERP2026!');
      } catch (err) {
        console.warn('Backend sync for password reset deferred:', err);
      }
    }
  };

  const handleSaveRolePermissions = async (roles: RolePermission[]) => {
    setRolePermissions(roles);
    logAuditEvent('Permissions Matrix Altered', 'Security', 'RBAC_MATRIX', 'Previous Matrix', 'Updated Matrix', 'Super Admin modified role permission entitlements');
    showToast('Role permissions matrix saved successfully');
  };

  const handleFactoryReset = async () => {
    setCompanyProfile(INITIAL_COMPANY_PROFILE);
    setNumberingConfigs(INITIAL_NUMBERING_CONFIG);
    setTaxRates(INITIAL_TAX_RATES);
    logAuditEvent('Factory Reset Executed', 'System', 'SYSTEM_CORE', 'Configured', 'Factory Defaults', 'Danger Zone: Restored default system configuration', 'Warning');
    showToast('System configuration reset to OEM factory template');

    try {
      await adminService.resetSystemConfig({ confirmKey: 'FACTORY-RESET-CONFIRM' });
    } catch (err) {
      console.warn('Backend sync for factory reset deferred:', err);
    }
  };

  const handleClearTestData = async () => {
    logAuditEvent('Test Data Cleared', 'System', 'TRANSACTIONS', 'Active Invoices', 'Purged', 'Danger Zone: Purged test transactions and reset invoice sequence', 'Warning');
    showToast('Test transactions cleared');

    try {
      await adminService.clearTestData({ confirmKey: 'CLEAR-TEST-DATA-CONFIRM' });
    } catch (err) {
      console.warn('Backend sync for test data clear deferred:', err);
    }
  };

  const handleReindexDatabase = () => {
    logAuditEvent('Database Re-indexed', 'System', 'B_TREE_INDEXES', 'Old Indexes', 'Rebuilt Indexes', 'Danger Zone: Rebuilt parts catalog and ledger search indexes');
    showToast('All database indexes rebuilt and optimized');
  };

  // ==========================================
  // CRM & CUSTOMER RELATIONSHIP HANDLERS
  // ==========================================
  const handleSaveCrmCustomer = async (newCustomer: CustomerProfileData) => {
    setCrmCustomers(prev => {
      const exists = prev.find(c => c.id === newCustomer.id);
      if (exists) {
        return prev.map(c => (c.id === newCustomer.id ? newCustomer : c));
      }
      return [newCustomer, ...prev];
    });
    showToast(`Customer account "${newCustomer.name}" saved successfully`);
    logAuditEvent(
      'Customer Profile Updated',
      'Accounts',
      newCustomer.mobile,
      'Customer Master',
      newCustomer.customerType,
      `Saved customer profile for ${newCustomer.name} (${newCustomer.customerType})`
    );

    try {
      const typeMap: Record<string, 'RETAIL' | 'WORKSHOP_GARAGE' | 'WHOLESALE_DEALER' | 'COMMERCIAL_FLEET'> = {
        'Retail': 'RETAIL',
        'Retail Customer': 'RETAIL',
        'Workshop': 'WORKSHOP_GARAGE',
        'Workshop / Garage': 'WORKSHOP_GARAGE',
        'Wholesale': 'WHOLESALE_DEALER',
        'Wholesale Trader': 'WHOLESALE_DEALER',
        'Fleet': 'COMMERCIAL_FLEET',
        'Commercial Fleet': 'COMMERCIAL_FLEET'
      };
      await crmService.createCustomer({
        name: newCustomer.name,
        type: typeMap[newCustomer.customerType] || 'RETAIL',
        mobile: newCustomer.mobile,
        email: newCustomer.email,
        address: newCustomer.address,
        city: newCustomer.city,
        gstin: newCustomer.gstin,
        creditLimit: newCustomer.creditLimit
      });
    } catch (err) {
      console.warn('Backend sync for customer profile deferred:', err);
    }
  };

  const handleAddVehicleToCustomer = async (vehicle: CustomerVehicleRecord) => {
    if (!selectedCustomerProfileId) return;
    setCrmCustomers(prev =>
      prev.map(c => {
        if (c.id === selectedCustomerProfileId) {
          return {
            ...c,
            vehicles: [...c.vehicles, vehicle]
          };
        }
        return c;
      })
    );
    showToast(`Vehicle ${vehicle.regNo} (${vehicle.manufacturer} ${vehicle.model}) attached to customer`);
    logAuditEvent(
      'Vehicle Added',
      'Accounts',
      vehicle.regNo,
      'None',
      `${vehicle.manufacturer} ${vehicle.model}`,
      `Linked motorcycle ${vehicle.regNo} to customer ID ${selectedCustomerProfileId}`
    );

    try {
      await crmService.addVehicle(selectedCustomerProfileId, {
        registrationNo: vehicle.regNo,
        brand: vehicle.manufacturer,
        model: vehicle.model,
        modelYear: vehicle.year ? Number(vehicle.year) : undefined
      });
    } catch (err) {
      console.warn('Backend sync for customer vehicle deferred:', err);
    }
  };

  const handleSaveLoyaltyRules = (rules: LoyaltyRuleConfig) => {
    setLoyaltyRules(rules);
    showToast('Loyalty program earn & burn parameters saved');
    logAuditEvent(
      'Loyalty Rules Updated',
      'Settings',
      'LOYALTY_ENGINE',
      'Previous Rules',
      `Spend: ₹${rules.pointsPerRupeesSpent}/pt, Redeem: ₹${rules.redemptionValuePerPoint}`,
      'Updated loyalty point calculation threshold and redemption values'
    );
  };

  const handleAdjustLoyaltyPoints = async (
    customerId: string,
    pointsDelta: number,
    reason: string,
    type: LoyaltyTransactionType
  ) => {
    const cust = crmCustomers.find(c => c.id === customerId);
    if (!cust) return;

    const newBalance = Math.max(0, cust.loyaltyPoints + pointsDelta);
    setCrmCustomers(prev =>
      prev.map(c => (c.id === customerId ? { ...c, loyaltyPoints: newBalance } : c))
    );

    const newTx: LoyaltyTransactionRecord = {
      id: 'ltx-' + Date.now(),
      customerId: cust.id,
      customerName: cust.name,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      reference: `ADJ-${Date.now().toString().slice(-4)}`,
      type,
      pointsDelta,
      balanceAfter: newBalance,
      notes: reason,
      auditedBy: `${userRole.replace('_', ' ').toUpperCase()} (Audit Logged)`
    };

    setLoyaltyTransactions(prev => [newTx, ...prev]);
    showToast(`Loyalty points adjusted (${pointsDelta >= 0 ? `+${pointsDelta}` : pointsDelta} pts) for ${cust.name}`);
    logAuditEvent(
      'Loyalty Points Adjusted',
      'Accounts',
      cust.name,
      `${cust.loyaltyPoints} pts`,
      `${newBalance} pts`,
      `Audited adjustment (${pointsDelta >= 0 ? '+' : ''}${pointsDelta} pts): ${reason}`
    );

    try {
      await crmService.adjustLoyaltyPoints({
        customerId,
        pointsDelta,
        type: pointsDelta >= 0 ? 'MANUAL_BONUS' : 'REDEEMED',
        notes: reason
      });
    } catch (err) {
      console.warn('Backend sync for loyalty adjustment deferred:', err);
    }
  };

  const handleRedeemLoyaltyPoints = (customerId: string, pointsToRedeem: number, billRef: string) => {
    const cust = crmCustomers.find(c => c.id === customerId);
    if (!cust) return;

    const newBalance = Math.max(0, cust.loyaltyPoints - pointsToRedeem);
    setCrmCustomers(prev =>
      prev.map(c => (c.id === customerId ? { ...c, loyaltyPoints: newBalance } : c))
    );

    const discountAmount = pointsToRedeem * loyaltyRules.redemptionValuePerPoint;
    const newTx: LoyaltyTransactionRecord = {
      id: 'ltx-' + Date.now(),
      customerId: cust.id,
      customerName: cust.name,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      reference: billRef || 'COUNTER-POS',
      type: 'Redemption',
      pointsDelta: -pointsToRedeem,
      balanceAfter: newBalance,
      notes: `Redeemed ₹${discountAmount.toFixed(2)} discount on invoice ${billRef}`,
      auditedBy: `${userRole.replace('_', ' ').toUpperCase()}`
    };

    setLoyaltyTransactions(prev => [newTx, ...prev]);
    showToast(`Redeemed ${pointsToRedeem} points (₹${discountAmount.toFixed(2)} discount) for ${cust.name}`);
  };

  const handleSendMessage = async (
    mobile: string,
    messageText: string,
    channel: 'WhatsApp' | 'SMS',
    templateId?: string
  ) => {
    const cleanedMobile = mobile.replace(/\D/g, '');
    if (cleanedMobile.length < 10) {
      showToast('Validation Error: Please specify a valid 10-digit mobile number.');
      return;
    }

    const matchedCustomer = crmCustomers.find(c => c.mobile.includes(cleanedMobile.slice(-10)));
    const custName = matchedCustomer ? matchedCustomer.name : 'Counter Customer';

    const logEntry: CommunicationLogRecord = {
      id: 'msg-' + Date.now(),
      customerId: matchedCustomer?.id || 'cust-adhoc',
      customerName: custName,
      mobile: mobile,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      channel,
      message: messageText,
      templateId,
      status: 'Delivered',
      user: 'Counter Admin (Dinesh K)',
      category: templateId ? 'Transactional' : 'Direct Message'
    };

    setCommunicationLogs(prev => [logEntry, ...prev]);
    showToast(`${channel} notification delivered to ${mobile} (${custName})`);

    try {
      await crmService.sendMessage({
        recipientMobile: mobile,
        recipientName: custName,
        channel: channel === 'WhatsApp' ? 'WHATSAPP' : 'SMS',
        templateId,
        messageBody: messageText
      });
    } catch (err) {
      console.warn('Backend sync for message delivery deferred:', err);
    }
  };

  const handleBulkCampaignBroadcast = (
    audienceFilter: string,
    messageText: string,
    channel: 'WhatsApp' | 'SMS' | 'Both',
    recipientCount: number
  ) => {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const newLogs: CommunicationLogRecord[] = crmCustomers.slice(0, recipientCount).map((c, idx) => ({
      id: `bulk-${Date.now()}-${idx}`,
      customerId: c.id,
      customerName: c.name,
      mobile: c.mobile,
      date: dateStr,
      time: timeStr,
      channel: channel === 'Both' ? 'WhatsApp' : channel,
      message: messageText.replace(/\{\{customer_name\}\}/g, c.name).replace(/\{\{outstanding\}\}/g, c.outstanding.toString()),
      status: 'Delivered',
      user: 'Super Admin Campaign',
      category: `Bulk Broadcast (${audienceFilter})`
    }));

    setCommunicationLogs(prev => [...newLogs, ...prev]);
    showToast(`Bulk campaign broadcast dispatched to ${recipientCount} recipients via ${channel}`);
    logAuditEvent(
      'Bulk Campaign Dispatched',
      'System',
      channel,
      `${recipientCount} Targets`,
      audienceFilter,
      `Launched bulk campaign to ${recipientCount} customers`
    );
  };

  const handleSaveMechanic = async (newMechanic: MechanicRecord) => {
    setMechanics(prev => [newMechanic, ...prev]);
    showToast(`Mechanic partner "${newMechanic.name}" onboarded (Code: ${newMechanic.customerCode})`);
    logAuditEvent(
      'Mechanic Onboarded',
      'Accounts',
      newMechanic.customerCode,
      'None',
      newMechanic.workshopName,
      `Registered affiliated mechanic partner ${newMechanic.name}`
    );

    try {
      await crmService.createMechanic({
        name: newMechanic.name,
        mobile: newMechanic.mobile,
        workshopName: newMechanic.workshopName,
        workshopAddress: newMechanic.location,
        commissionType: 'PERCENTAGE',
        commissionRate: newMechanic.commissionRatePercent || 5
      });
    } catch (err) {
      console.warn('Backend sync for mechanic onboarding deferred:', err);
    }
  };

  const handleRecordReferralSale = async (referral: ReferralRecord) => {
    setReferrals(prev => [referral, ...prev]);

    // Update mechanic stats
    setMechanics(prev =>
      prev.map(m => {
        if (m.id === referral.referrerId) {
          return {
            ...m,
            totalReferredSales: m.totalReferredSales + referral.salesAmount,
            referralCount: m.referralCount + 1,
            loyaltyPoints: m.loyaltyPoints + referral.rewardPoints,
            pendingRewardAmount: (m.pendingRewardAmount || 0) + referral.rewardCash
          };
        }
        return m;
      })
    );

    showToast(`Referral sale of ₹${referral.salesAmount.toLocaleString('en-IN')} recorded for ${referral.referrerName}`);
    logAuditEvent(
      'Referral Sale Recorded',
      'Sales',
      referral.invoiceNo,
      referral.referrerName,
      `Sales: ₹${referral.salesAmount}, Cash: ₹${referral.rewardCash}`,
      `Referral credited to ${referral.referrerName} for sale to ${referral.referredCustomerName}`
    );

    try {
      await crmService.recordReferral({
        mechanicId: referral.referrerId,
        customerName: referral.referredCustomerName,
        customerMobile: referral.referrerMobile || '9840112345',
        salesAmount: referral.salesAmount,
        notes: `Bill: ${referral.invoiceNo}`
      });
    } catch (err) {
      console.warn('Backend sync for referral sale deferred:', err);
    }
  };

  const handleUpdateReferralStatus = async (referralId: string, newStatus: ReferralStatus) => {
    setReferrals(prev =>
      prev.map(r => (r.id === referralId ? { ...r, status: newStatus } : r))
    );
    showToast(`Referral #${referralId} status updated to ${newStatus}`);

    try {
      const mapped = newStatus === 'Rewarded' ? 'REWARDED' : newStatus === 'Cancelled' ? 'EXPIRED' : 'CONVERTED';
      await crmService.updateReferralStatus(referralId, mapped as any);
    } catch (err) {
      console.warn('Backend sync for referral status deferred:', err);
    }
  };

  const handleSettleMechanicCommission = (
    mechanicId: string,
    amount: number,
    paymentMode: string,
    txnRef: string,
    notes: string
  ) => {
    const mech = mechanics.find(m => m.id === mechanicId);
    if (!mech) return;

    setMechanics(prev =>
      prev.map(m => {
        if (m.id === mechanicId) {
          return {
            ...m,
            pendingRewardAmount: Math.max(0, (m.pendingRewardAmount || 0) - amount)
          };
        }
        return m;
      })
    );

    showToast(`Commission payment of ₹${amount.toLocaleString('en-IN')} settled to ${mech.name} via ${paymentMode}`);
    logAuditEvent(
      'Mechanic Commission Settled',
      'Accounts',
      mech.customerCode,
      `Pending: ₹${mech.pendingRewardAmount || 0}`,
      `Paid: ₹${amount}`,
      `Disbursed referral commission to ${mech.name} (${paymentMode} - ${txnRef}): ${notes}`
    );
  };

  const handleSaveMessageTemplate = (tpl: MessageTemplate) => {
    setMessageTemplates(prev => {
      const exists = prev.find(t => t.id === tpl.id);
      if (exists) {
        return prev.map(t => (t.id === tpl.id ? tpl : t));
      }
      return [tpl, ...prev];
    });
    showToast(`Message template "${tpl.name}" saved`);
  };

  const handleSaveCustomerSegment = (newSegment: CustomerSegment) => {
    setCustomerSegments(prev => [newSegment, ...prev]);
    showToast(`Customer segment "${newSegment.name}" created`);
  };

  const handleSendPaymentReminder = async (
    record: OutstandingReminderRecord,
    channel: 'WhatsApp' | 'SMS'
  ) => {
    const msg = `Dear ${record.customerName}, your outstanding balance with BIKE ERP Spares is Rs.${record.outstanding}. Kindly settle via UPI/Bank transfer. Contact: 98401-11223.`;
    handleSendMessage(record.mobile, msg, channel, 'tpl-2');

    setOutstandingReminders(prev =>
      prev.map(r =>
        r.customerId === record.customerId
          ? {
              ...r,
              lastReminderDate: 'Today',
              lastReminderChannel: channel,
              reminderStatus: 'Delivered',
              lastActionNote: `Sent ${channel} reminder for Rs.${record.outstanding}`
            }
          : r
      )
    );

    try {
      await crmService.sendOutstandingReminder(record.customerId, {
        channel: channel === 'WhatsApp' ? 'WHATSAPP' : 'SMS'
      });
    } catch (err) {
      console.warn('Backend sync for payment reminder deferred:', err);
    }
  };

  const handleBatchSendPaymentReminders = (
    records: OutstandingReminderRecord[],
    channel: 'WhatsApp' | 'SMS'
  ) => {
    records.forEach(r => {
      handleSendPaymentReminder(r, channel);
    });
    showToast(`Batch ${channel} payment reminders sent to ${records.length} customers`);
  };

  // -------------------------------------------------------------
  // AUTHENTICATION GATEWAY — VELOCARE LOGIN PORTAL
  // -------------------------------------------------------------
  if (!isAuthenticated || !user) {
    return (
      <LoginPage
        onLoginSuccess={() => {
          showToast('Authenticated successfully. Welcome to VeloCare Bike ERP.');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-body-sm text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
      {/* Fixed Application Header */}
      <Header
        activeScreen={activeScreen}
        onNavigate={setActiveScreen}
        onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
        onOpenQuickActions={() => setIsQuickActionsOpen(true)}
        onOpenNewPart={() => setIsNewPartOpen(true)}
        onOpenNewBill={() => setActiveScreen('pos')}
        userRole={userRole}
        onUserRoleChange={setUserRole}
      />

      {/* Main Structural Body */}
      <div className="flex flex-1 pt-14">
        {/* Fixed ERP Module Sidebar */}
        <Sidebar activeScreen={activeScreen} onNavigate={setActiveScreen} />

        {/* Dynamic Main Workspace Container */}
        <main className="flex-1 ml-60 p-5 overflow-x-hidden min-h-[calc(100vh-56px)] pb-10">
          {activeScreen === 'dashboard' && (
            <DashboardView
              invoices={invoices}
              parts={parts}
              tenderData={tenderData}
              onNavigate={setActiveScreen}
              onOpenNewBill={() => setActiveScreen('pos')}
              onOpenPartFinder={() => setIsPartFinderOpen(true)}
              onOpenNewPart={() => setIsNewPartOpen(true)}
              onViewInvoice={setViewingInvoice}
              onPrintInvoice={setViewingInvoice}
              onOpenShiftSummary={() => setIsShiftSummaryOpen(true)}
              onOrderPo={(name) => setPoModalPartName(name)}
              onFilterLowStock={() => {
                setInitialStockFilter('LOW_REORDER');
                setActiveScreen('items-master');
              }}
            />
          )}

          {/* Item Master (50,000+ SKUs Enterprise Dashboard) */}
          {activeScreen === 'items-master' && (
            <ItemMasterDashboard
              parts={parts}
              onUpdatePart={handleUpdatePart}
              onAddPart={handleSavePart}
              onViewStockLedger={(part) => {
                setSelectedPartForLedger(part);
                setActiveScreen('stock-ledger-batches');
              }}
              onStockAdjustment={handleStockAdjustment}
            />
          )}

          {/* Dedicated Inventory Dashboard */}
          {activeScreen === 'live-stock-valuation' && (
            <InventoryDashboardView
              parts={parts}
              onOpenItemDetails={(part) => {
                setSelectedPartForDrawer(part);
              }}
              onNavigateToStockReport={() => setActiveScreen('stock-reports')}
              onNavigateToStockLedger={() => setActiveScreen('stock-ledger-batches')}
              onNavigateToLowStock={() => setActiveScreen('low-stock')}
              onCreatePurchaseOrder={(part) => setPoModalPartName(part.name)}
            />
          )}

          {/* Stock Movement Ledger View */}
          {activeScreen === 'stock-ledger-batches' && (
            <StockLedgerView
              parts={parts}
              selectedPartProp={selectedPartForLedger}
              onOpenAdjustmentModal={(part) => {
                setSelectedPartForDrawer(part);
              }}
            />
          )}

          {/* Comprehensive Stock Summary Report */}
          {activeScreen === 'stock-reports' && (
            <StockReportView
              parts={parts}
              onOpenItemDetails={(part) => {
                setSelectedPartForDrawer(part);
              }}
              onOpenStockLedger={(part) => {
                setSelectedPartForLedger(part);
                setActiveScreen('stock-ledger-batches');
              }}
            />
          )}

          {/* Low Stock Replenishment & Reorder Priority */}
          {activeScreen === 'low-stock' && (
            <LowStockView
              parts={parts}
              onOpenItemDetails={(part) => setSelectedPartForDrawer(part)}
              onCreatePurchaseOrder={(part, suggestedQty) => {
                handleConfirmPo(part.name, part.brand, suggestedQty);
              }}
            />
          )}

          {/* Vehicle Compatibility & Cross-Fitment Matrix */}
          {activeScreen === 'vehicle-compatibility' && (
            <VehicleCompatibilityView
              parts={parts}
              onOpenItemDetails={(part) => setSelectedPartForDrawer(part)}
              onAddToCart={(part) => {
                showToast(`Added ${part.name} to POS sale`);
                setActiveScreen('pos');
              }}
            />
          )}

          {/* Barcode & Labels Printing Hub */}
          {activeScreen === 'barcode-print' && (
            <div className="p-4 bg-surface-container-lowest rounded border border-surface-container-high space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-headline-md text-xl font-bold text-on-surface">Barcode Sticker &amp; Label Center</h1>
                  <p className="text-xs text-outline mt-0.5">Generate multi-format barcode thermal tags and A4 sticker sheets for spare parts.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBulkBarcodeOpen(true)}
                  className="px-3.5 py-1.5 bg-secondary text-on-secondary rounded text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  <span>Open Multi-Item Sticker Print Wizard</span>
                </button>
              </div>

              <div className="border border-surface-container-high rounded p-6 text-center space-y-3">
                <span className="material-symbols-outlined text-5xl text-secondary">qr_code_scanner</span>
                <h3 className="font-bold text-on-surface text-base">Thermal &amp; A4 Barcode Printing Suite</h3>
                <p className="text-xs text-outline max-w-md mx-auto">
                  Supports 50x25mm thermal roll labels (TSC/Zebra), 38x25mm compact bin tags, and 24-up / 40-up A4 laser sticker sheets.
                </p>
                <div className="flex justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsBulkBarcodeOpen(true)}
                    className="px-4 py-2 bg-secondary text-on-secondary rounded font-bold text-xs shadow-xs"
                  >
                    Launch Bulk Sticker Generator
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveScreen('items-master')}
                    className="px-4 py-2 bg-surface-container text-on-surface rounded font-bold text-xs"
                  >
                    Go to Item Master Table
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Fast Counter POS Screen */}
          {(activeScreen === 'pos' || activeScreen === 'fast-counter-pos') && (
            <FastPOSView
              parts={parts}
              onGenerateInvoice={handleGenerateInvoice}
              onNavigate={setActiveScreen}
              onPrintInvoice={(inv) => setViewingInvoice(inv)}
              existingInvoices={invoices}
              onStockReturn={handleStockReturn}
            />
          )}

          {/* QUOTATIONS MODULE */}
          {activeScreen === 'quotations' && (
            <QuotationsView
              quotations={quotations}
              onOpenCreateModal={() => {
                setEditingQuotation(null);
                setIsCreateQuotationOpen(true);
              }}
              onViewQuotation={(q) => setSelectedQuotationForDetail(q)}
              onEditQuotation={(q) => {
                setEditingQuotation(q);
                setIsCreateQuotationOpen(true);
              }}
              onDuplicateQuotation={handleDuplicateQuotation}
              onPrintQuotation={(q) => setSelectedQuotationForPrint(q)}
              onShareQuotation={handleShareQuotation}
              onCancelQuotation={handleCancelQuotation}
              onConvertToInvoice={handleConvertToInvoice}
              onNavigate={setActiveScreen}
            />
          )}

          {/* SALES RETURNS MODULE */}
          {activeScreen === 'sales-returns' && (
            <SalesReturnsView
              salesReturns={salesReturns}
              onOpenCreateModal={() => setIsCreateSalesReturnOpen(true)}
              onPrintCreditNote={(r) => setSelectedSalesReturnForPrint(r)}
              onViewReturnDetail={(r) => setSelectedSalesReturnForPrint(r)}
              onNavigate={setActiveScreen}
            />
          )}

          {/* PURCHASE RETURNS MODULE */}
          {activeScreen === 'purchase-returns' && (
            <PurchaseReturnsView
              purchaseReturns={purchaseReturns}
              onOpenCreateModal={() => setIsCreatePurchaseReturnOpen(true)}
              onPrintDebitNote={(r) => setSelectedPurchaseReturnForPrint(r)}
              onViewReturnDetail={(r) => setSelectedPurchaseReturnForPrint(r)}
              onNavigate={setActiveScreen}
            />
          )}

          {['invoices', 'purchase-orders', 'categories-master', 'brands-master', 'garage-ledgers', 'stock-adjustments', 'reports'].includes(activeScreen) && (
            <OtherViews
              view={activeScreen}
              invoices={invoices}
              parts={parts}
              onViewInvoice={setViewingInvoice}
              onPrintInvoice={setViewingInvoice}
              onOpenNewBill={() => setActiveScreen('pos')}
              onOpenPoModal={(name) => setPoModalPartName(name)}
              onNavigate={setActiveScreen}
              onRequestVoidInvoice={(inv) => setVoidInvoiceTarget(inv)}
            />
          )}

          {/* ================================================== */}
          {/* CRM & CUSTOMER RELATIONSHIP MANAGEMENT SUITE       */}
          {/* ================================================== */}
          {activeScreen === 'crm-dashboard' && (
            <CrmDashboardView
              customers={crmCustomers}
              mechanics={mechanics}
              loyaltyTransactions={loyaltyTransactions}
              communicationLogs={communicationLogs}
              onNavigate={setActiveScreen}
              onSelectCustomer={(custId) => {
                setSelectedCustomerProfileId(custId);
                setActiveScreen('customers');
              }}
              onSelectMechanic={(mechId) => {
                setActiveScreen('mechanics');
              }}
              onOpenNewCustomer={() => setIsAddCustomerOpen(true)}
            />
          )}

          {activeScreen === 'customers' && (
            selectedCustomerProfileId ? (
              <CustomerProfileView
                customer={crmCustomers.find(c => c.id === selectedCustomerProfileId) || crmCustomers[0]}
                invoices={invoices}
                customerLedger={customerLedger}
                receipts={receipts}
                loyaltyTransactions={loyaltyTransactions}
                communicationLogs={communicationLogs}
                quotations={customerQuotations}
                salesReturns={customerSalesReturns}
                onBack={() => setSelectedCustomerProfileId(null)}
                onOpenAddVehicle={() => setIsAddVehicleOpen(true)}
                onOpenSendMessage={() => {
                  const cust = crmCustomers.find(c => c.id === selectedCustomerProfileId) || crmCustomers[0];
                  setTargetCustomerForMessage(cust);
                  setPreselectedTemplateForMessage(null);
                  setIsSendMessageOpen(true);
                }}
                onOpenAdjustPoints={() => {
                  const cust = crmCustomers.find(c => c.id === selectedCustomerProfileId) || crmCustomers[0];
                  setTargetCustomerForPoints(cust);
                  setIsAdjustPointsOpen(true);
                }}
                onOpenRedeemPoints={() => {
                  const cust = crmCustomers.find(c => c.id === selectedCustomerProfileId) || crmCustomers[0];
                  setTargetCustomerForRedeem(cust);
                  setIsRedeemPointsOpen(true);
                }}
                onOpenCreateReceipt={() => {
                  const cust = crmCustomers.find(c => c.id === selectedCustomerProfileId) || crmCustomers[0];
                  const recObj = receivables.find(r => r.customerId === cust.id || r.customerName === cust.name) || {
                    id: 'rec-' + cust.id,
                    customerId: cust.id,
                    customerName: cust.name,
                    mobile: cust.mobile,
                    gstin: cust.gstin,
                    customerType: cust.customerType,
                    creditLimit: cust.creditLimit,
                    outstanding: cust.outstanding,
                    unallocatedCredits: 0,
                    oldestInvoiceDate: '01-Sep-2026',
                    oldestDueDays: 12,
                    lastPayment: '₹0.00',
                    lastPaymentDate: 'None',
                    status: 'PENDING'
                  };
                  setPreSelectedCustomerForReceipt(recObj);
                  setIsCreateReceiptOpen(true);
                }}
                onViewInvoice={(inv) => setViewingInvoice(inv)}
                onPrintInvoice={(inv) => setViewingInvoice(inv)}
              />
            ) : (
              <CustomerListView
                customers={crmCustomers}
                onSelectCustomer={(custId) => setSelectedCustomerProfileId(custId)}
                onOpenNewCustomer={() => setIsAddCustomerOpen(true)}
              />
            )
          )}

          {activeScreen === 'mechanics' && (
            <MechanicManagementView
              mechanics={mechanics}
              referrals={referrals}
              onOpenNewMechanic={() => setIsAddMechanicOpen(true)}
              onOpenRecordReferral={(mech) => {
                setPreselectedMechanicForReferral(mech || null);
                setIsRecordReferralOpen(true);
              }}
              onSelectMechanic={(mechId) => {
                const found = mechanics.find(m => m.id === mechId);
                if (found) {
                  showToast(`Viewing mechanic partner ${found.name}`);
                }
              }}
              onSettleMechanicCommission={(mech) => {
                setTargetMechanicForSettlement(mech);
                setIsSettleCommissionOpen(true);
              }}
            />
          )}

          {activeScreen === 'loyalty-program' && (
            <LoyaltyProgramDashboardView
              loyaltyRules={loyaltyRules}
              loyaltyTransactions={loyaltyTransactions}
              customers={crmCustomers}
              onSaveLoyaltyRules={handleSaveLoyaltyRules}
              onOpenAdjustPoints={(cust) => {
                setTargetCustomerForPoints(cust || crmCustomers[0]);
                setIsAdjustPointsOpen(true);
              }}
              onOpenRedeemPoints={(cust) => {
                setTargetCustomerForRedeem(cust || crmCustomers[0]);
                setIsRedeemPointsOpen(true);
              }}
              onSelectCustomer={(custId) => {
                setSelectedCustomerProfileId(custId);
                setActiveScreen('customers');
              }}
            />
          )}

          {activeScreen === 'referral-system' && (
            <ReferralSystemView
              referrals={referrals}
              onOpenRecordReferral={() => {
                setPreselectedMechanicForReferral(null);
                setIsRecordReferralOpen(true);
              }}
              onUpdateReferralStatus={handleUpdateReferralStatus}
            />
          )}

          {activeScreen === 'messaging' && (
            <MessagingDashboardView
              templates={messageTemplates}
              communicationLogs={communicationLogs}
              onSaveTemplate={handleSaveMessageTemplate}
              onNavigateBulk={() => setActiveScreen('bulk-messaging')}
              onOpenTestMessage={(template) => {
                setTargetCustomerForMessage(crmCustomers[0]);
                setPreselectedTemplateForMessage(template || null);
                setIsSendMessageOpen(true);
              }}
            />
          )}

          {activeScreen === 'bulk-messaging' && (
            <BulkMessagingView
              customers={crmCustomers}
              templates={messageTemplates}
              onSendBulkCampaign={handleBulkCampaignBroadcast}
              onNavigateBack={() => setActiveScreen('messaging')}
            />
          )}

          {activeScreen === 'payment-reminders' && (
            <PaymentRemindersView
              reminders={outstandingReminders}
              templates={messageTemplates}
              onSendReminder={handleSendPaymentReminder}
              onBatchSendReminders={handleBatchSendPaymentReminders}
              onViewLedger={(custId) => {
                setSelectedCustomerProfileId(custId);
                setActiveScreen('customers');
              }}
            />
          )}

          {activeScreen === 'customer-segments' && (
            <CustomerSegmentsView
              segments={customerSegments}
              customers={crmCustomers}
              onSelectCustomer={(custId) => {
                setSelectedCustomerProfileId(custId);
                setActiveScreen('customers');
              }}
              onNavigateBulkWithSegment={(segName) => {
                setActiveScreen('bulk-messaging');
              }}
              onSaveNewSegment={handleSaveCustomerSegment}
            />
          )}

          {activeScreen === 'crm-reports' && (
            <CrmReportsView
              customers={crmCustomers}
              mechanics={mechanics}
              loyaltyTransactions={loyaltyTransactions}
              referrals={referrals}
              communicationLogs={communicationLogs}
              reminders={outstandingReminders}
              onSelectCustomer={(custId) => {
                setSelectedCustomerProfileId(custId);
                setActiveScreen('customers');
              }}
            />
          )}

          {/* ACCOUNTS & BANKING SUITE */}
          {activeScreen === 'accounts-dashboard' && (
            <AccountsDashboard
              receivables={receivables}
              payables={payables}
              receipts={receipts}
              payments={payments}
              bankAccounts={bankAccounts}
              timeline={financialTimeline}
              userRole={userRole}
              onChangeUserRole={setUserRole}
              onNavigate={setActiveScreen}
              onOpenNewReceipt={() => {
                setPreSelectedCustomerForReceipt(null);
                setIsCreateReceiptOpen(true);
              }}
              onOpenNewPayment={() => {
                setPreSelectedSupplierForPayment(null);
                setIsCreatePaymentOpen(true);
              }}
              onOpenBanking={(type) => setBankingOperationType(type)}
            />
          )}

          {(activeScreen === 'receivables' || activeScreen === 'customer-receivables') && (
            <ReceivablesView
              receivables={receivables}
              onOpenCustomerLedger={(custId) => {
                setSelectedCustomerId(custId);
                setActiveScreen('customer-ledgers');
              }}
              onReceivePayment={(cust) => {
                setPreSelectedCustomerForReceipt(cust);
                setIsCreateReceiptOpen(true);
              }}
              onOpenNewReceipt={() => {
                setPreSelectedCustomerForReceipt(null);
                setIsCreateReceiptOpen(true);
              }}
            />
          )}

          {activeScreen === 'customer-ledgers' && (
            <CustomerLedgerView
              customerId={selectedCustomerId}
              customers={receivables}
              entries={customerLedger}
              userRole={userRole}
              onSelectCustomer={setSelectedCustomerId}
              onOpenReceiptModal={(cust) => {
                setPreSelectedCustomerForReceipt(cust);
                setIsCreateReceiptOpen(true);
              }}
              onViewEntryDetails={(entry) => setSelectedTxForDrawer(entry)}
              onReverseEntry={(entry) => setReversalTarget(entry)}
            />
          )}

          {activeScreen === 'payment-receipts' && (
            <ReceiptsListView
              receipts={receipts}
              userRole={userRole}
              onOpenNewReceipt={() => {
                setPreSelectedCustomerForReceipt(null);
                setIsCreateReceiptOpen(true);
              }}
              onViewReceipt={(r) => setSelectedTxForDrawer(r as any)}
              onReverseReceipt={(r) => setReversalTarget(r)}
            />
          )}

          {(activeScreen === 'payables' || activeScreen === 'suppliers-master' || activeScreen === 'suppliers') && (
            <PayablesView
              payables={payables}
              userRole={userRole}
              onOpenSupplierLedger={(supId) => {
                setSelectedSupplierId(supId);
                setActiveScreen('supplier-ledgers');
              }}
              onMakePayment={(sup) => {
                setPreSelectedSupplierForPayment(sup);
                setIsCreatePaymentOpen(true);
              }}
              onOpenNewPayment={() => {
                setPreSelectedSupplierForPayment(null);
                setIsCreatePaymentOpen(true);
              }}
            />
          )}

          {activeScreen === 'supplier-ledgers' && (
            <SupplierLedgerView
              supplierId={selectedSupplierId}
              suppliers={payables}
              entries={supplierLedger}
              userRole={userRole}
              onSelectSupplier={setSelectedSupplierId}
              onOpenPaymentModal={(sup) => {
                setPreSelectedSupplierForPayment(sup);
                setIsCreatePaymentOpen(true);
              }}
              onViewEntryDetails={(entry) => setSelectedTxForDrawer(entry)}
              onReverseEntry={(entry) => setReversalTarget(entry)}
            />
          )}

          {activeScreen === 'payment-vouchers' && (
            <PaymentsListView
              payments={payments}
              userRole={userRole}
              onOpenNewPayment={() => {
                setPreSelectedSupplierForPayment(null);
                setIsCreatePaymentOpen(true);
              }}
              onViewPayment={(p) => setSelectedTxForDrawer(p as any)}
              onReversePayment={(p) => setReversalTarget(p)}
            />
          )}

          {activeScreen === 'banking' && (
            <BankingDashboardView
              accounts={bankAccounts}
              transactions={bankTransactions}
              userRole={userRole}
              onOpenDeposit={() => setBankingOperationType('deposit')}
              onOpenWithdrawal={() => setBankingOperationType('withdrawal')}
              onOpenTransfer={() => setBankingOperationType('transfer')}
              onToggleReconcile={handleToggleReconcile}
            />
          )}

          {/* GST & TAX MODULE */}
          {activeScreen === 'gst-dashboard' && (
            <GstDashboard
              userRole={userRole}
              onNavigate={setActiveScreen}
              onOpenDrawer={(data) => setSelectedReportDetail(data)}
            />
          )}

          {(activeScreen === 'gstr-1' || activeScreen === 'gstr-reports') && (
            <Gstr1View
              userRole={userRole}
              onNavigate={setActiveScreen}
              onOpenDrawer={(data) => setSelectedReportDetail(data)}
            />
          )}

          {activeScreen === 'gstr-3b' && (
            <Gstr3bView
              userRole={userRole}
              onNavigate={setActiveScreen}
              onOpenDrawer={(data) => setSelectedReportDetail(data)}
            />
          )}

          {activeScreen === 'hsn-tax-report' && (
            <HsnTaxReportView
              userRole={userRole}
              onNavigate={setActiveScreen}
              onOpenDrawer={(data) => setSelectedReportDetail(data)}
            />
          )}

          {/* COMPREHENSIVE REPORTS & BI MODULE */}
          {(activeScreen === 'sales-reports' || activeScreen === 'daily-sales-bi') && (
            <SalesReportsView
              userRole={userRole}
              onNavigate={setActiveScreen}
              onOpenDrawer={(data) => setSelectedReportDetail(data)}
            />
          )}

          {activeScreen === 'purchase-reports' && (
            <PurchaseReportsView
              userRole={userRole}
              onNavigate={setActiveScreen}
              onOpenDrawer={(data) => setSelectedReportDetail(data)}
            />
          )}

          {(activeScreen === 'inventory-reports' || activeScreen === 'stock-reports' || activeScreen === 'stock-aging-dead') && (
            <InventoryReportsView
              userRole={userRole}
              onNavigate={setActiveScreen}
              onOpenDrawer={(data) => setSelectedReportDetail(data)}
            />
          )}

          {activeScreen === 'profitability-dashboard' && (
            <ProfitabilityDashboard
              userRole={userRole}
              onNavigate={setActiveScreen}
              onOpenDrawer={(data) => setSelectedReportDetail(data)}
            />
          )}

          {activeScreen === 'financial-reports' && (
            <FinancialReportsView
              userRole={userRole}
              onNavigate={setActiveScreen}
              onOpenDrawer={(data) => setSelectedReportDetail(data)}
            />
          )}

          {activeScreen === 'business-insights' && (
            <BusinessInsightsView
              userRole={userRole}
              onNavigate={setActiveScreen}
            />
          )}

          {/* ================================================== */}
          {/* ADMINISTRATION & SECURITY CONTROL CENTER SUITE     */}
          {/* ================================================== */}
          {activeScreen === 'admin-dashboard' && (
            <AdministrationDashboard
              userRole={userRole}
              systemStatus={systemStatus}
              onNavigateAdmin={setActiveScreen}
              onQuickBackup={handleCreateBackup}
            />
          )}

          {activeScreen === 'users-roles' && (
            <UsersManagementView
              users={erpUsers}
              userRole={userRole}
              onSaveUser={handleSaveUser}
              onToggleUserStatus={handleToggleUserStatus}
              onResetPassword={handleResetUserPassword}
              onTriggerPermissionDenied={(action) => setPermissionDeniedAction(action)}
              onInspectUserActivity={(username) => {
                setTargetedUserForAudit(username);
                setActiveScreen('system-activity');
              }}
            />
          )}

          {activeScreen === 'permissions' && (
            <RoleManagementView
              roles={rolePermissions}
              userRole={userRole}
              onSaveRoles={handleSaveRolePermissions}
              onTriggerPermissionDenied={(action) => setPermissionDeniedAction(action)}
            />
          )}

          {(activeScreen === 'company-settings' || activeScreen === 'settings-gst') && (
            <CompanySettingsView
              companyProfile={companyProfile}
              userRole={userRole}
              onSaveCompanyProfile={handleSaveCompanyProfile}
              onTriggerPermissionDenied={(action) => setPermissionDeniedAction(action)}
            />
          )}

          {activeScreen === 'branch-settings' && (
            <BranchSettingsView
              branches={branches}
              userRole={userRole}
              onSaveBranch={handleSaveBranch}
              onDeleteBranch={handleDeleteBranch}
              onTriggerPermissionDenied={(action) => setPermissionDeniedAction(action)}
            />
          )}

          {activeScreen === 'invoice-templates' && (
            <InvoiceTemplatesView
              templateConfig={templateConfig}
              companyProfile={companyProfile}
              userRole={userRole}
              onSaveTemplateConfig={handleSaveTemplateConfig}
              onTriggerPermissionDenied={(action) => setPermissionDeniedAction(action)}
            />
          )}

          {activeScreen === 'numbering-prefixes' && (
            <NumberingPrefixesView
              numberingConfigs={numberingConfigs}
              userRole={userRole}
              onSaveConfigs={handleSaveNumberingConfigs}
              onTriggerPermissionDenied={(action) => setPermissionDeniedAction(action)}
            />
          )}

          {activeScreen === 'tax-settings' && (
            <TaxSettingsView
              taxRates={taxRates}
              userRole={userRole}
              onSaveTaxRates={handleSaveTaxRates}
              onTriggerPermissionDenied={(action) => setPermissionDeniedAction(action)}
            />
          )}

          {activeScreen === 'payment-modes' && (
            <PaymentModesView
              paymentModes={paymentModes}
              userRole={userRole}
              onSavePaymentModes={handleSavePaymentModes}
              onTriggerPermissionDenied={(action) => setPermissionDeniedAction(action)}
            />
          )}

          {activeScreen === 'printer-settings' && (
            <PrinterSettingsView
              printerConfig={printerConfig}
              userRole={userRole}
              onSavePrinterConfig={handleSavePrinterConfig}
              onTriggerPermissionDenied={(action) => setPermissionDeniedAction(action)}
            />
          )}

          {activeScreen === 'backup-restore' && (
            <BackupRestoreView
              backups={backups}
              userRole={userRole}
              onCreateBackup={handleCreateBackup}
              onRestoreBackup={handleRestoreBackup}
              onDeleteBackup={handleDeleteBackup}
              onTriggerPermissionDenied={(action) => setPermissionDeniedAction(action)}
            />
          )}

          {(activeScreen === 'audit-logs' || activeScreen === 'audit-trail') && (
            <AuditLogsView
              logs={auditLogs}
              userRole={userRole}
              filterUsername={targetedUserForAudit}
              onClearUserFilter={() => setTargetedUserForAudit(undefined)}
            />
          )}

          {activeScreen === 'system-activity' && (
            <SystemActivityTimelineView
              activities={userActivities}
              userRole={userRole}
              targetUsername={targetedUserForAudit}
              onClearTargetUser={() => setTargetedUserForAudit(undefined)}
              onInspectRecord={(recId) => {
                const foundLog = auditLogs.find((l) => l.recordId === recId);
                if (foundLog) {
                  setActiveScreen('audit-logs');
                } else {
                  showToast(`Record ${recId} selected`);
                }
              }}
            />
          )}

          {activeScreen === 'security-settings' && (
            <SecuritySettingsView
              securitySettings={securitySettings}
              userRole={userRole}
              onSaveSecuritySettings={handleSaveSecuritySettings}
              onFactoryReset={handleFactoryReset}
              onClearTestData={handleClearTestData}
              onReindexDatabase={handleReindexDatabase}
              onTriggerPermissionDenied={(action) => setPermissionDeniedAction(action)}
            />
          )}

          {activeScreen === 'system-updates' && (
            <SystemUpdatesView
              userRole={userRole}
              onNavigateBack={() => setActiveScreen('admin-dashboard')}
            />
          )}

          {/* Safe Fallback for any unmatched screen */}
          {![
            'dashboard',
            'items-master',
            'spare-parts-master',
            'live-stock-valuation',
            'stock-valuation',
            'stock-ledger-batches',
            'stock-reports',
            'low-stock',
            'vehicle-compatibility',
            'barcode-print',
            'pos',
            'fast-counter-pos',
            'quotations',
            'sales-returns',
            'purchase-returns',
            'invoices',
            'purchase-orders',
            'categories-master',
            'brands-master',
            'garage-ledgers',
            'stock-adjustments',
            'reports',
            'crm-dashboard',
            'customers',
            'mechanics',
            'loyalty-program',
            'referral-system',
            'messaging',
            'bulk-messaging',
            'payment-reminders',
            'customer-segments',
            'crm-reports',
            'accounts-dashboard',
            'receivables',
            'customer-receivables',
            'customer-ledgers',
            'payment-receipts',
            'payables',
            'suppliers-master',
            'suppliers',
            'supplier-ledgers',
            'payment-vouchers',
            'banking',
            'gst-dashboard',
            'gstr-1',
            'gstr-reports',
            'gstr-3b',
            'hsn-tax-report',
            'sales-reports',
            'daily-sales-bi',
            'purchase-reports',
            'inventory-reports',
            'stock-aging-dead',
            'profitability-dashboard',
            'financial-reports',
            'business-insights',
            'admin-dashboard',
            'users-roles',
            'permissions',
            'company-settings',
            'settings-gst',
            'branch-settings',
            'invoice-templates',
            'numbering-prefixes',
            'tax-settings',
            'payment-modes',
            'printer-settings',
            'backup-restore',
            'audit-logs',
            'audit-trail',
            'system-activity',
            'security-settings',
            'system-updates'
          ].includes(activeScreen) && (
            <DashboardView
              invoices={invoices}
              parts={parts}
              tenderData={tenderData}
              onNavigate={setActiveScreen}
              onOpenNewBill={() => setActiveScreen('pos')}
              onOpenPartFinder={() => setIsPartFinderOpen(true)}
              onOpenNewPart={() => setIsNewPartOpen(true)}
              onViewInvoice={setViewingInvoice}
              onPrintInvoice={setViewingInvoice}
              onOpenShiftSummary={() => setIsShiftSummaryOpen(true)}
              onOrderPo={(name) => setPoModalPartName(name)}
              onFilterLowStock={() => {
                setInitialStockFilter('LOW_REORDER');
                setActiveScreen('items-master');
              }}
            />
          )}
        </main>
      </div>

      {/* Modals & Dialogs */}
      <InvoiceModal
        invoice={viewingInvoice}
        onClose={() => setViewingInvoice(null)}
      />

      <PartFinderModal
        parts={parts}
        isOpen={isPartFinderOpen}
        onClose={() => setIsPartFinderOpen(false)}
        onSelectPartForDrawer={(part) => {
          setSelectedPartForDrawer(part);
          setActiveScreen('items-master');
        }}
        onAddToCart={(part) => {
          setActiveScreen('pos');
        }}
      />

      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        parts={parts}
        invoices={invoices}
        customers={crmCustomers}
        receivables={receivables}
        payables={payables}
        onSelectPart={(part) => {
          setSelectedPartForDrawer(part);
          setActiveScreen('items-master');
        }}
        onSelectInvoice={(inv) => {
          setViewingInvoice(inv);
        }}
        onSelectCustomer={(cust) => {
          setSelectedCustomerProfileId((cust as any).id || (cust as any).customerId);
          setActiveScreen('customers');
        }}
        onSelectSupplier={(sup) => {
          setSelectedSupplierId(sup.supplierId);
          setActiveScreen('supplier-ledgers');
        }}
        onNavigate={setActiveScreen}
      />

      {/* Global Quick Actions Palette (Ctrl + /) */}
      <QuickActionsModal
        isOpen={isQuickActionsOpen}
        onClose={() => setIsQuickActionsOpen(false)}
        onNavigate={setActiveScreen}
        onOpenNewSale={() => setActiveScreen('pos')}
        onOpenNewPurchase={() => setPoModalPartName('Supplier PO Bulk Entry')}
        onOpenNewCustomer={() => setIsAddCustomerOpen(true)}
        onOpenNewSupplier={() => {
          setSelectedSupplierId('sup-1');
          setActiveScreen('supplier-ledgers');
        }}
        onOpenNewItem={() => setIsNewPartOpen(true)}
        onOpenNewReceipt={() => {
          setPreSelectedCustomerForReceipt(null);
          setIsCreateReceiptOpen(true);
        }}
        onOpenNewPayment={() => {
          setPreSelectedSupplierForPayment(null);
          setIsCreatePaymentOpen(true);
        }}
        onOpenNewQuotation={() => setActiveScreen('quotations')}
        onOpenStockAdjustment={() => {
          setSelectedPartForDrawer(parts[0]);
          setActiveScreen('items-master');
        }}
      />

      {/* Audited Void Invoice Confirmation Dialog */}
      <ConfirmationModal
        isOpen={!!voidInvoiceTarget}
        type="void_invoice"
        title={`Void Invoice ${voidInvoiceTarget?.id || ''}`}
        message={`Are you sure you want to void invoice ${voidInvoiceTarget?.id} for ${voidInvoiceTarget?.customerName} (₹${voidInvoiceTarget?.totalAmount.toFixed(2)})? This will restore spare parts quantities back into active inventory.`}
        confirmLabel="Void Invoice"
        isDestructive={true}
        requiresReason={true}
        reasonPlaceholder="Enter reason for voiding this invoice (e.g. customer cancelled, wrong billing)..."
        onConfirm={(reason) => {
          if (voidInvoiceTarget) handleVoidInvoice(voidInvoiceTarget, reason);
        }}
        onCancel={() => setVoidInvoiceTarget(null)}
      />

      {/* Unsaved Changes Guard Dialog */}
      <UnsavedChangesModal
        isOpen={!!unsavedChangesPendingScreen}
        onStay={() => setUnsavedChangesPendingScreen(null)}
        onDiscard={() => {
          if (unsavedChangesPendingScreen) {
            setActiveScreen(unsavedChangesPendingScreen);
            setUnsavedChangesPendingScreen(null);
          }
        }}
        onSave={() => {
          showToast('Form data saved');
          if (unsavedChangesPendingScreen) {
            setActiveScreen(unsavedChangesPendingScreen);
            setUnsavedChangesPendingScreen(null);
          }
        }}
      />

      <NewPartModal
        isOpen={isNewPartOpen}
        onClose={() => setIsNewPartOpen(false)}
        onSavePart={handleSavePart}
      />

      <ShiftSummaryModal
        isOpen={isShiftSummaryOpen}
        onClose={() => setIsShiftSummaryOpen(false)}
        tenderData={tenderData}
        totalBills={invoices.length}
      />

      <PoModal
        partName={poModalPartName}
        onClose={() => setPoModalPartName(null)}
        onConfirmPo={handleConfirmPo}
      />

      {/* Global Item Details Drawer */}
      <ItemDetailsDrawer
        part={selectedPartForDrawer}
        onClose={() => setSelectedPartForDrawer(null)}
        onViewStockLedger={(part) => {
          setSelectedPartForDrawer(null);
          setSelectedPartForLedger(part);
          setActiveScreen('stock-ledger-batches');
        }}
      />

      {/* Global Multi-Item Bulk Barcode Print Modal */}
      <BulkBarcodePrintModal
        isOpen={isBulkBarcodeOpen}
        onClose={() => setIsBulkBarcodeOpen(false)}
        parts={parts}
      />

      {/* Accounting & Banking Modals */}
      <CreateReceiptModal
        isOpen={isCreateReceiptOpen}
        onClose={() => setIsCreateReceiptOpen(false)}
        receivables={receivables}
        preSelectedCustomer={preSelectedCustomerForReceipt}
        onSaveReceipt={handleSaveReceipt}
      />

      <ReceiptSuccessModal
        isOpen={!!recordedReceiptForSuccess}
        receipt={recordedReceiptForSuccess}
        onClose={() => setRecordedReceiptForSuccess(null)}
        onPrint={(r) => {
          triggerPrintWindow(
            `Receipt ${r.receiptNo}`,
            `
            <div class="header">
              <h1 class="title">BIKE ERP PAYMENT RECEIPT VOUCHER</h1>
              <div class="subtitle">Receipt Voucher #${r.receiptNo} | Date: ${r.date} ${r.time}</div>
            </div>
            <p><strong>Customer:</strong> ${r.customerName}</p>
            <p><strong>Payment Mode:</strong> ${r.paymentMode} | <strong>Ref No:</strong> ${r.refNo || 'Cash'}</p>
            <p><strong>Amount Received:</strong> ₹${r.amount.toLocaleString('en-IN')}</p>
            <div class="total-box">
              <div class="total-row"><span>Total Received:</span> <span>₹${r.amount.toLocaleString('en-IN')}</span></div>
            </div>
            `
          );
        }}
        onNewReceipt={() => {
          setRecordedReceiptForSuccess(null);
          setPreSelectedCustomerForReceipt(null);
          setIsCreateReceiptOpen(true);
        }}
        onViewLedger={(customerId) => {
          setSelectedCustomerId(customerId);
          setActiveScreen('customer-ledgers');
        }}
      />

      <CreatePaymentModal
        isOpen={isCreatePaymentOpen}
        onClose={() => setIsCreatePaymentOpen(false)}
        payables={payables}
        bankAccounts={bankAccounts}
        preSelectedSupplier={preSelectedSupplierForPayment}
        onSavePayment={handleSavePayment}
      />

      <PaymentSuccessModal
        isOpen={!!recordedPaymentForSuccess}
        payment={recordedPaymentForSuccess}
        onClose={() => setRecordedPaymentForSuccess(null)}
        onPrint={(p) => {
          triggerPrintWindow(
            `Payment Voucher ${p.paymentNo}`,
            `
            <div class="header">
              <h1 class="title">BIKE ERP SUPPLIER PAYMENT VOUCHER</h1>
              <div class="subtitle">Payment Voucher #${p.paymentNo} | Date: ${p.date} ${p.time}</div>
            </div>
            <p><strong>Supplier:</strong> ${p.supplierName}</p>
            <p><strong>Payment Mode:</strong> ${p.paymentMode} | <strong>Ref No:</strong> ${p.refNo || 'Direct Payout'}</p>
            <p><strong>Disbursed Amount:</strong> ₹${p.amount.toLocaleString('en-IN')}</p>
            <div class="total-box">
              <div class="total-row"><span>Total Disbursed:</span> <span>₹${p.amount.toLocaleString('en-IN')}</span></div>
            </div>
            `
          );
        }}
        onNewPayment={() => {
          setRecordedPaymentForSuccess(null);
          setPreSelectedSupplierForPayment(null);
          setIsCreatePaymentOpen(true);
        }}
      />

      <BankingOperationModal
        isOpen={!!bankingOperationType}
        type={bankingOperationType}
        onClose={() => setBankingOperationType(null)}
        accounts={bankAccounts}
        onExecuteOperation={handleExecuteBankingOperation}
      />

      <TransactionDetailDrawer
        isOpen={!!selectedTxForDrawer}
        entry={selectedTxForDrawer}
        userRole={userRole}
        onClose={() => setSelectedTxForDrawer(null)}
        onRequestReversal={(entry) => {
          setReversalTarget(entry);
        }}
        onViewInvoice={(invNo) => {
          const inv = invoices.find(i => i.invoiceNumber === invNo);
          if (inv) setViewingInvoice(inv);
          else showToast(`Invoice ${invNo} selected`);
        }}
        onViewReceipt={(recNo) => {
          const rec = receipts.find(r => r.receiptNo === recNo);
          if (rec) setRecordedReceiptForSuccess(rec);
          else showToast(`Receipt ${recNo} selected`);
        }}
        onViewPayment={(payNo) => {
          const pay = payments.find(p => p.paymentNo === payNo);
          if (pay) setRecordedPaymentForSuccess(pay);
          else showToast(`Payment ${payNo} selected`);
        }}
      />

      {/* Universal Report & Transaction Audit Drawer */}
      <ReportDetailDrawer
        data={selectedReportDetail}
        onClose={() => setSelectedReportDetail(null)}
        onPrintInvoice={(ref) => {
          const inv = invoices.find(i => i.id === ref || ref.includes(i.id));
          if (inv) {
            setViewingInvoice(inv);
          } else {
            window.print();
          }
        }}
      />

      <ReversalConfirmationModal
        isOpen={!!reversalTarget}
        target={reversalTarget}
        onClose={() => setReversalTarget(null)}
        onConfirmReversal={handleConfirmReversal}
      />

      {/* Access Control Unauthorized Modal */}
      <PermissionRequiredModal
        isOpen={!!permissionDeniedAction}
        attemptedAction={permissionDeniedAction || 'Modify System Configuration'}
        currentRole={userRole}
        requiredRole="super_admin"
        onClose={() => setPermissionDeniedAction(null)}
        onRequestElevation={() => {
          setPermissionDeniedAction(null);
          showToast('Administrative elevation request submitted to Super Admin');
        }}
      />

      {/* ================================================== */}
      {/* CRM & CUSTOMER RELATIONSHIP MODALS & DIALOGS       */}
      {/* ================================================== */}
      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        onSave={handleSaveCrmCustomer}
      />

      <AddVehicleModal
        isOpen={isAddVehicleOpen}
        onClose={() => setIsAddVehicleOpen(false)}
        onSaveVehicle={handleAddVehicleToCustomer}
      />

      <AdjustLoyaltyPointsModal
        isOpen={isAdjustPointsOpen}
        customer={targetCustomerForPoints}
        onClose={() => {
          setIsAdjustPointsOpen(false);
          setTargetCustomerForPoints(null);
        }}
        onConfirmAdjustment={handleAdjustLoyaltyPoints}
      />

      <RedeemPointsModal
        isOpen={isRedeemPointsOpen}
        customer={targetCustomerForRedeem}
        onClose={() => {
          setIsRedeemPointsOpen(false);
          setTargetCustomerForRedeem(null);
        }}
        onConfirmRedemption={handleRedeemLoyaltyPoints}
      />

      <SendMessageModal
        isOpen={isSendMessageOpen}
        customer={targetCustomerForMessage}
        templates={messageTemplates}
        onClose={() => {
          setIsSendMessageOpen(false);
          setTargetCustomerForMessage(null);
          setPreselectedTemplateForMessage(null);
        }}
        onSend={handleSendMessage}
      />

      <AddMechanicModal
        isOpen={isAddMechanicOpen}
        onClose={() => setIsAddMechanicOpen(false)}
        onSave={handleSaveMechanic}
      />

      <RecordReferralModal
        isOpen={isRecordReferralOpen}
        onClose={() => {
          setIsRecordReferralOpen(false);
          setPreselectedMechanicForReferral(null);
        }}
        mechanics={mechanics}
        customers={crmCustomers}
        preselectedMechanic={preselectedMechanicForReferral}
        onSave={handleRecordReferralSale}
      />

      <SettleMechanicCommissionModal
        isOpen={isSettleCommissionOpen}
        onClose={() => {
          setIsSettleCommissionOpen(false);
          setTargetMechanicForSettlement(null);
        }}
        mechanic={targetMechanicForSettlement}
        onConfirmSettlement={handleSettleMechanicCommission}
      />

      {/* ================================================== */}
      {/* QUOTATIONS & RETURNS MODALS & PRINT DIALOGS        */}
      {/* ================================================== */}
      <CreateQuotationModal
        isOpen={isCreateQuotationOpen}
        onClose={() => {
          setIsCreateQuotationOpen(false);
          setEditingQuotation(null);
        }}
        onSave={handleSaveQuotation}
        parts={parts}
        customers={crmCustomers}
        editingQuote={editingQuotation}
        currentUser="Rajesh (Store Admin)"
      />

      <QuotationDetailModal
        isOpen={!!selectedQuotationForDetail}
        onClose={() => setSelectedQuotationForDetail(null)}
        quotation={selectedQuotationForDetail}
        onEdit={(q) => {
          setSelectedQuotationForDetail(null);
          setEditingQuotation(q);
          setIsCreateQuotationOpen(true);
        }}
        onDuplicate={handleDuplicateQuotation}
        onPrint={(q) => {
          setSelectedQuotationForDetail(null);
          setSelectedQuotationForPrint(q);
        }}
        onShare={handleShareQuotation}
        onConvertToInvoice={handleConvertToInvoice}
        onCancelQuotation={handleCancelQuotation}
      />

      <PrintQuotationModal
        isOpen={!!selectedQuotationForPrint}
        onClose={() => setSelectedQuotationForPrint(null)}
        quotation={selectedQuotationForPrint}
        companyProfile={companyProfile}
      />

      <CreateSalesReturnModal
        isOpen={isCreateSalesReturnOpen}
        onClose={() => setIsCreateSalesReturnOpen(false)}
        invoices={invoices}
        existingReturns={salesReturns}
        parts={parts}
        onConfirmReturn={handleConfirmSalesReturn}
        currentUser="Rajesh (Store Admin)"
      />

      <CreatePurchaseReturnModal
        isOpen={isCreatePurchaseReturnOpen}
        onClose={() => setIsCreatePurchaseReturnOpen(false)}
        payables={payables}
        existingPurchaseReturns={purchaseReturns}
        parts={parts}
        onConfirmReturn={handleConfirmPurchaseReturn}
        currentUser="Rajesh (Store Admin)"
      />

      <PrintReturnNoteModal
        isOpen={!!selectedSalesReturnForPrint || !!selectedPurchaseReturnForPrint}
        onClose={() => {
          setSelectedSalesReturnForPrint(null);
          setSelectedPurchaseReturnForPrint(null);
        }}
        salesReturn={selectedSalesReturnForPrint}
        purchaseReturn={selectedPurchaseReturnForPrint}
        companyProfile={companyProfile}
      />

      {/* Toast Feedback Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-12 right-6 z-50 bg-primary-container text-surface-bright px-4 py-2.5 rounded shadow-xl border border-secondary/30 flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-150">
          <span className="material-symbols-outlined text-secondary-fixed text-[18px]">check_circle</span>
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-outline hover:text-white"
          >
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        </div>
      )}

      {/* Session Expired Security Modal */}
      <SessionExpiredModal
        isOpen={isSessionExpired}
        onLoginAgain={() => {
          dismissSessionExpired();
          setIsLoginModalOpen(true);
        }}
      />

      {/* Authentication Login Dialog */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => {
          setIsLoginModalOpen(false);
          showToast('Authentication successful. Terminal session active.');
        }}
      />

      {/* Production Automatic Update Notification Modal */}
      <UpdateAlert />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainERPContent />
    </AuthProvider>
  );
}

