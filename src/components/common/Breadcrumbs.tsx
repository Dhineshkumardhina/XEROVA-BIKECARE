import React from 'react';

interface BreadcrumbItem {
  label: string;
  screenId?: string;
}

interface BreadcrumbsProps {
  activeScreen: string;
  onNavigate: (screenId: string) => void;
  entityName?: string;
  customPath?: BreadcrumbItem[];
}

const SCREEN_MAP: Record<string, { section: string; title: string; parentScreen?: string }> = {
  // Main
  dashboard: { section: 'Main', title: 'Dashboard' },

  // Sales
  pos: { section: 'Sales', title: 'Fast POS Counter', parentScreen: 'dashboard' },
  'fast-counter-pos': { section: 'Sales', title: 'Fast Counter POS', parentScreen: 'dashboard' },
  invoices: { section: 'Sales', title: 'Sales Invoices', parentScreen: 'dashboard' },
  quotations: { section: 'Sales', title: 'Quotations / Estimates', parentScreen: 'dashboard' },
  'sales-returns': { section: 'Sales', title: 'Sales Returns & Credit Notes', parentScreen: 'dashboard' },

  // Purchase
  'purchase-orders': { section: 'Purchase', title: 'Purchase Entry (GRN)', parentScreen: 'dashboard' },
  'supplier-invoices': { section: 'Purchase', title: 'Supplier Bills', parentScreen: 'dashboard' },
  'suppliers-master': { section: 'Purchase', title: 'Suppliers Master', parentScreen: 'dashboard' },
  'purchase-returns': { section: 'Purchase', title: 'Purchase Returns (Debit Notes)', parentScreen: 'dashboard' },

  // Inventory
  'items-master': { section: 'Inventory', title: 'Items Master Catalog', parentScreen: 'dashboard' },
  'live-stock-valuation': { section: 'Inventory', title: 'Stock Valuation Dashboard', parentScreen: 'items-master' },
  'stock-ledger-batches': { section: 'Inventory', title: 'Stock Movement Ledger', parentScreen: 'items-master' },
  'categories-master': { section: 'Inventory', title: 'Categories', parentScreen: 'items-master' },
  'brands-master': { section: 'Inventory', title: 'Brands', parentScreen: 'items-master' },
  'stock-reports': { section: 'Inventory', title: 'Stock Reports', parentScreen: 'items-master' },
  'low-stock': { section: 'Inventory', title: 'Low Stock Replenishment', parentScreen: 'items-master' },
  'vehicle-compatibility': { section: 'Inventory', title: 'Vehicles Matrix', parentScreen: 'items-master' },
  'barcode-print': { section: 'Inventory', title: 'Barcode & Labels', parentScreen: 'items-master' },

  // Accounts
  'accounts-dashboard': { section: 'Accounts', title: 'Accounts Dashboard', parentScreen: 'dashboard' },
  receivables: { section: 'Accounts', title: 'Customer Receivables', parentScreen: 'accounts-dashboard' },
  'customer-ledgers': { section: 'Accounts', title: 'Customer Ledgers', parentScreen: 'receivables' },
  'payment-receipts': { section: 'Accounts', title: 'Receipt Vouchers', parentScreen: 'accounts-dashboard' },
  payables: { section: 'Accounts', title: 'Supplier Payables', parentScreen: 'accounts-dashboard' },
  'supplier-ledgers': { section: 'Accounts', title: 'Supplier Ledgers', parentScreen: 'payables' },
  'payment-vouchers': { section: 'Accounts', title: 'Payment Vouchers', parentScreen: 'accounts-dashboard' },
  banking: { section: 'Accounts', title: 'Banking & Cash Book', parentScreen: 'accounts-dashboard' },

  // GST
  'gst-dashboard': { section: 'GST', title: 'GST Compliance Hub', parentScreen: 'dashboard' },
  'gstr-1': { section: 'GST', title: 'GSTR-1 Outward Supplies', parentScreen: 'gst-dashboard' },
  'gstr-3b': { section: 'GST', title: 'GSTR-3B Tax Summary', parentScreen: 'gst-dashboard' },
  'hsn-tax-report': { section: 'GST', title: 'HSN Tax Reports', parentScreen: 'gst-dashboard' },

  // CRM
  'crm-dashboard': { section: 'CRM', title: 'CRM Dashboard', parentScreen: 'dashboard' },
  customers: { section: 'CRM', title: 'Customer Directory', parentScreen: 'crm-dashboard' },
  mechanics: { section: 'CRM', title: 'Mechanics & Workshops', parentScreen: 'crm-dashboard' },
  'loyalty-program': { section: 'CRM', title: 'Loyalty Rewards', parentScreen: 'crm-dashboard' },
  'referral-system': { section: 'CRM', title: 'Referral Engine', parentScreen: 'crm-dashboard' },
  messaging: { section: 'CRM', title: 'Messaging & WhatsApp', parentScreen: 'crm-dashboard' },
  'bulk-messaging': { section: 'CRM', title: 'Bulk Messaging Campaigns', parentScreen: 'messaging' },
  'payment-reminders': { section: 'CRM', title: 'Outstanding Reminders', parentScreen: 'crm-dashboard' },
  'customer-segments': { section: 'CRM', title: 'Customer Segments', parentScreen: 'crm-dashboard' },
  'crm-reports': { section: 'CRM', title: 'CRM Analytics', parentScreen: 'crm-dashboard' },

  // Reports
  'sales-reports': { section: 'Reports', title: 'Sales Analytics', parentScreen: 'dashboard' },
  'purchase-reports': { section: 'Reports', title: 'Purchase Reports', parentScreen: 'dashboard' },
  'inventory-reports': { section: 'Reports', title: 'Inventory Valuation', parentScreen: 'dashboard' },
  'profitability-dashboard': { section: 'Reports', title: 'Profitability & Margins', parentScreen: 'dashboard' },
  'financial-reports': { section: 'Reports', title: 'Financial Statements', parentScreen: 'dashboard' },
  'business-insights': { section: 'Reports', title: 'Business Intelligence', parentScreen: 'dashboard' },

  // Administration
  'admin-dashboard': { section: 'Administration', title: 'Admin Control Hub', parentScreen: 'dashboard' },
  'users-roles': { section: 'Administration', title: 'Users & Roles', parentScreen: 'admin-dashboard' },
  permissions: { section: 'Administration', title: 'Permissions Matrix', parentScreen: 'admin-dashboard' },
  'company-settings': { section: 'Administration', title: 'Company Settings', parentScreen: 'admin-dashboard' },
  'branch-settings': { section: 'Administration', title: 'Branch Management', parentScreen: 'admin-dashboard' },
  'invoice-templates': { section: 'Administration', title: 'Invoice Templates', parentScreen: 'admin-dashboard' },
  'numbering-prefixes': { section: 'Administration', title: 'Document Numbering', parentScreen: 'admin-dashboard' },
  'tax-settings': { section: 'Administration', title: 'Tax Settings', parentScreen: 'admin-dashboard' },
  'payment-modes': { section: 'Administration', title: 'Payment Modes', parentScreen: 'admin-dashboard' },
  'printer-settings': { section: 'Administration', title: 'Thermal & Laser Printers', parentScreen: 'admin-dashboard' },
  'backup-restore': { section: 'Administration', title: 'Backup & Restore', parentScreen: 'admin-dashboard' },
  'audit-logs': { section: 'Administration', title: 'Audit Trail Logs', parentScreen: 'admin-dashboard' },
  'system-activity': { section: 'Administration', title: 'User System Activity', parentScreen: 'admin-dashboard' },
  'security-settings': { section: 'Administration', title: 'Security & Auth Policy', parentScreen: 'admin-dashboard' }
};

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  activeScreen,
  onNavigate,
  entityName,
  customPath
}) => {
  if (customPath && customPath.length > 0) {
    return (
      <nav className="flex items-center gap-1.5 text-xs text-outline mb-3 select-none" aria-label="Breadcrumb">
        <button
          onClick={() => onNavigate('dashboard')}
          className="hover:text-secondary flex items-center gap-1 transition-colors"
        >
          <span className="material-symbols-outlined text-[14px]">home</span>
          <span>Dashboard</span>
        </button>
        {customPath.map((item, idx) => (
          <React.Fragment key={idx}>
            <span className="material-symbols-outlined text-[12px] text-outline-variant">chevron_right</span>
            {item.screenId ? (
              <button
                onClick={() => onNavigate(item.screenId!)}
                className="hover:text-secondary transition-colors"
              >
                {item.label}
              </button>
            ) : (
              <span className="font-semibold text-on-surface">{item.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>
    );
  }

  const screenInfo = SCREEN_MAP[activeScreen] || {
    section: 'ERP',
    title: activeScreen.replace(/-/g, ' ').toUpperCase()
  };

  return (
    <nav className="flex items-center gap-1.5 text-xs text-outline mb-3 select-none" aria-label="Breadcrumb">
      <button
        onClick={() => onNavigate('dashboard')}
        className={`hover:text-secondary flex items-center gap-1 transition-colors ${
          activeScreen === 'dashboard' ? 'font-semibold text-on-surface' : ''
        }`}
      >
        <span className="material-symbols-outlined text-[14px]">home</span>
        <span>Dashboard</span>
      </button>

      {activeScreen !== 'dashboard' && (
        <>
          <span className="material-symbols-outlined text-[12px] text-outline-variant">chevron_right</span>
          <span className="text-on-surface-variant">{screenInfo.section}</span>

          <span className="material-symbols-outlined text-[12px] text-outline-variant">chevron_right</span>
          <button
            onClick={() => onNavigate(activeScreen)}
            className={`hover:text-secondary transition-colors ${
              !entityName ? 'font-semibold text-on-surface' : ''
            }`}
          >
            {screenInfo.title}
          </button>

          {entityName && (
            <>
              <span className="material-symbols-outlined text-[12px] text-outline-variant">chevron_right</span>
              <span className="font-semibold text-secondary truncate max-w-xs">{entityName}</span>
            </>
          )}
        </>
      )}
    </nav>
  );
};
