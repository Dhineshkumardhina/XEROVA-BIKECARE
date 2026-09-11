import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
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

import { INITIAL_PARTS, INITIAL_INVOICES, INITIAL_TENDER_DATA } from './data/initialData';
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
  SystemStatusItem
} from './types';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<string>('accounts-dashboard');
  const [userRole, setUserRole] = useState<UserRole>('store_admin');
  const [parts, setParts] = useState<SparePart[]>(INITIAL_PARTS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [tenderData, setTenderData] = useState<TenderReconciliationData>(INITIAL_TENDER_DATA);

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
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cust-1');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('sup-1');

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

  // Administration UI Interactive States
  const [permissionDeniedAction, setPermissionDeniedAction] = useState<string | null>(null);
  const [targetedUserForAudit, setTargetedUserForAudit] = useState<string | undefined>(undefined);

  // Toast notification system
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Keyboard shortcut listener for F2, F4, Ctrl+K, Alt+P
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
      // Ctrl+K -> Global Omnibox Search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(prev => !prev);
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

  // Handler: Generate new invoice from POS
  const handleGenerateInvoice = (newInvoice: Invoice) => {
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
        const lineItem = newInvoice.lineItems.find(item => item.partId === p.id);
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
  };

  // Handler: Add new spare part
  const handleSavePart = (newPart: SparePart) => {
    setParts(prev => [newPart, ...prev]);
    showToast(`Spare part "${newPart.name}" added with SKU ${newPart.sku}`);
  };

  // Handler: Update existing spare part
  const handleUpdatePart = (updatedPart: SparePart) => {
    setParts(prev => prev.map(p => (p.id === updatedPart.id ? updatedPart : p)));
    showToast(`Updated SKU ${updatedPart.sku} (${updatedPart.name})`);
  };

  // Handler: Stock Adjustment
  const handleStockAdjustment = (
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
  };

  // Handler: Confirm PO
  const handleConfirmPo = (partName: string, supplier: string, qty: number) => {
    const poNumber = `PO-${Math.floor(8000 + Math.random() * 1000)}`;
    setParts(prev =>
      prev.map(p =>
        p.name === partName
          ? { ...p, pendingPo: { poNumber, qty, supplier } }
          : p
      )
    );
    showToast(`Purchase Order ${poNumber} issued for ${qty}x ${partName} to ${supplier}`);
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

  // Handler: Save Receipt Voucher
  const handleSaveReceipt = (newReceipt: ReceiptVoucher, printAfter: boolean) => {
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
      setTimeout(() => alert(`Printing Receipt Voucher ${newReceipt.receiptNo}...`), 300);
    }
  };

  // Handler: Save Supplier Payment Voucher
  const handleSavePayment = (newPayment: PaymentVoucher, printAfter: boolean) => {
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
      setTimeout(() => alert(`Printing Payment Voucher ${newPayment.paymentNo}...`), 300);
    }
  };

  // Handler: Banking Contra Operation (Deposit, Withdrawal, Transfer)
  const handleExecuteBankingOperation = (tx: BankTransaction, updatedAccounts: BankingAccount[]) => {
    setBankTransactions(prev => [tx, ...prev]);
    setBankAccounts(updatedAccounts);
    setBankingOperationType(null);
    showToast(`${tx.type} transaction ${tx.reference} executed successfully`);
  };

  // Handler: Non-destructive audited reversal
  const handleConfirmReversal = (target: any, reason: string) => {
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
  const handleSaveCompanyProfile = (updated: CompanyProfile) => {
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
  };

  const handleSaveBranch = (branch: BranchLocation) => {
    const exists = branches.find((b) => b.id === branch.id);
    if (exists) {
      setBranches((prev) => prev.map((b) => (b.id === branch.id ? branch : b)));
      logAuditEvent('Branch Updated', 'Branches', branch.code || branch.branchCode || '', exists.name || exists.branchName || '', branch.name || branch.branchName || '', `Updated branch ${branch.name || branch.branchName}`);
      showToast(`Branch ${branch.name || branch.branchName} updated`);
    } else {
      setBranches((prev) => [...prev, branch]);
      logAuditEvent('Branch Created', 'Branches', branch.code || branch.branchCode || '', 'None', branch.name || branch.branchName || '', `Added new retail branch/warehouse ${branch.name || branch.branchName}`);
      showToast(`Branch ${branch.name || branch.branchName} registered`);
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

  const handleSaveNumberingConfigs = (configs: NumberingConfig[]) => {
    setNumberingConfigs(configs);
    logAuditEvent('Document Numbering Updated', 'Settings', 'VOUCHER_SERIES', 'Previous Series', 'Updated Series', 'Modified running numbering sequences and prefixes');
    showToast('Document numbering sequences saved');
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

  const handleSavePrinterConfig = (config: PrinterConfig) => {
    setPrinterConfig(config);
    logAuditEvent('Printer Configuration Updated', 'Hardware', 'PRINTER_ROUTING', 'Previous Driver', config.thermalPrinter, 'Updated hardware spooling and printer routing');
    showToast('Printer hardware configuration saved');
  };

  const handleCreateBackup = () => {
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
  };

  const handleRestoreBackup = (backupId: string) => {
    const b = backups.find((item) => item.id === backupId);
    if (b) {
      logAuditEvent('Backup Restored', 'System', b.filename, 'Active Database', b.filename, `Restored system state from archive ${b.filename}`, 'Warning');
      showToast(`Database successfully restored from ${b.filename}`);
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

  const handleSaveUser = (user: ErpUser) => {
    const exists = erpUsers.find((u) => u.id === user.id);
    if (exists) {
      setErpUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)));
      logAuditEvent('User Account Updated', 'Security', user.username, exists.role, user.role, `Updated user account details for @${user.username}`);
      showToast(`User @${user.username} updated`);
    } else {
      setErpUsers((prev) => [...prev, user]);
      logAuditEvent('User Account Created', 'Security', user.username, 'None', user.role, `Created new ERP user account @${user.username}`);
      showToast(`User @${user.username} registered`);
    }
  };

  const handleToggleUserStatus = (userId: string) => {
    setErpUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus = u.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
          logAuditEvent('User Status Toggled', 'Security', u.username, u.status, newStatus, `Account status changed to ${newStatus}`, newStatus === 'DISABLED' ? 'Warning' : 'Success');
          showToast(`User @${u.username} marked as ${newStatus}`);
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  const handleResetUserPassword = (userId: string) => {
    const user = erpUsers.find((u) => u.id === userId);
    if (user) {
      logAuditEvent('Password Reset', 'Security', user.username, 'Encrypted', 'Temporary Key', `Admin reset password for @${user.username}`, 'Warning');
      showToast(`Temporary password generated for @${user.username}`);
    }
  };

  const handleSaveRolePermissions = (roles: RolePermission[]) => {
    setRolePermissions(roles);
    logAuditEvent('Permissions Matrix Altered', 'Security', 'RBAC_MATRIX', 'Previous Matrix', 'Updated Matrix', 'Super Admin modified role permission entitlements');
    showToast('Role permissions matrix saved successfully');
  };

  const handleFactoryReset = () => {
    setCompanyProfile(INITIAL_COMPANY_PROFILE);
    setNumberingConfigs(INITIAL_NUMBERING_CONFIG);
    setTaxRates(INITIAL_TAX_RATES);
    logAuditEvent('Factory Reset Executed', 'System', 'SYSTEM_CORE', 'Configured', 'Factory Defaults', 'Danger Zone: Restored default system configuration', 'Warning');
    showToast('System configuration reset to OEM factory template');
  };

  const handleClearTestData = () => {
    logAuditEvent('Test Data Cleared', 'System', 'TRANSACTIONS', 'Active Invoices', 'Purged', 'Danger Zone: Purged test transactions and reset invoice sequence', 'Warning');
    showToast('Test transactions cleared');
  };

  const handleReindexDatabase = () => {
    logAuditEvent('Database Re-indexed', 'System', 'B_TREE_INDEXES', 'Old Indexes', 'Rebuilt Indexes', 'Danger Zone: Rebuilt parts catalog and ledger search indexes');
    showToast('All database indexes rebuilt and optimized');
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body-sm text-on-surface antialiased selection:bg-secondary selection:text-on-secondary">
      {/* Fixed Application Header */}
      <Header
        activeScreen={activeScreen}
        onNavigate={setActiveScreen}
        onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
        onOpenNewPart={() => setIsNewPartOpen(true)}
        userRole={userRole}
        onUserRoleChange={setUserRole}
      />

      {/* Main Structural Body */}
      <div className="flex flex-1 pt-12 pb-8">
        {/* Fixed ERP Module Sidebar */}
        <Sidebar activeScreen={activeScreen} onNavigate={setActiveScreen} />

        {/* Dynamic Main Workspace Container */}
        <main className="flex-1 ml-60 p-gutter overflow-x-hidden min-h-[calc(100vh-80px)]">
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

          {['invoices', 'purchase-orders', 'garage-ledgers', 'stock-adjustments', 'reports', 'customers'].includes(activeScreen) && (
            <OtherViews
              view={activeScreen}
              invoices={invoices}
              parts={parts}
              onViewInvoice={setViewingInvoice}
              onPrintInvoice={setViewingInvoice}
              onOpenNewBill={() => setActiveScreen('pos')}
              onOpenPoModal={(name) => setPoModalPartName(name)}
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

          {activeScreen === 'receivables' && (
            <ReceivablesView
              receivables={receivables}
              userRole={userRole}
              onNavigate={setActiveScreen}
              onSelectCustomer={(custId) => {
                setSelectedCustomerId(custId);
                setActiveScreen('customer-ledgers');
              }}
              onRecordReceipt={(cust) => {
                setPreSelectedCustomerForReceipt(cust);
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

          {activeScreen === 'payables' && (
            <PayablesView
              payables={payables}
              userRole={userRole}
              onNavigate={setActiveScreen}
              onSelectSupplier={(supId) => {
                setSelectedSupplierId(supId);
                setActiveScreen('supplier-ledgers');
              }}
              onRecordPayment={(sup) => {
                setPreSelectedSupplierForPayment(sup);
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
              onNavigate={setActiveScreen}
              onOpenOperation={(type) => setBankingOperationType(type)}
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
        </main>
      </div>

      {/* Fixed Operational Shortcut Footer */}
      <Footer
        onSearchPart={() => setIsPartFinderOpen(true)}
        onNewSale={() => setActiveScreen('pos')}
        onGlobalSearch={() => setIsGlobalSearchOpen(true)}
        onPrintLastBill={() => {
          if (invoices.length > 0) setViewingInvoice(invoices[0]);
          else showToast('No invoices available to print');
        }}
      />

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
        onSelectPart={(part) => {
          setSelectedPartForDrawer(part);
          setActiveScreen('items-master');
        }}
        onSelectInvoice={(inv) => {
          setViewingInvoice(inv);
        }}
        onNavigate={setActiveScreen}
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
          alert(`Printing Official Receipt Voucher ${r.receiptNo}...`);
        }}
        onNewReceipt={() => {
          setRecordedReceiptForSuccess(null);
          setPreSelectedCustomerForReceipt(null);
          setIsCreateReceiptOpen(true);
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
          alert(`Printing Official Supplier Payment Voucher ${p.paymentNo}...`);
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
    </div>
  );
}
