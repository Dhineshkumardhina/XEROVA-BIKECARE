import React from 'react';

interface SidebarProps {
  activeScreen: string;
  onNavigate: (screenId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeScreen, onNavigate }) => {
  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' }
      ]
    },
    {
      title: 'SALES & BILLING',
      items: [
        { id: 'pos', label: 'Point of Sale (POS)', icon: 'point_of_sale', shortcut: 'F4' },
        { id: 'invoices', label: 'Invoices Register', icon: 'receipt_long' },
        { id: 'quotations', label: 'Quotations', icon: 'request_quote' },
        { id: 'sales-returns', label: 'Sales Returns (Credit)', icon: 'assignment_return' }
      ]
    },
    {
      title: 'PURCHASE & INWARDS',
      items: [
        { id: 'purchase-orders', label: 'Purchase Entry (GRN)', icon: 'inventory_2' },
        { id: 'suppliers-master', label: 'Suppliers Master', icon: 'local_shipping' },
        { id: 'purchase-returns', label: 'Purchase Returns (Debit)', icon: 'replay' }
      ]
    },
    {
      title: 'INVENTORY & CATALOG',
      items: [
        { id: 'items-master', label: 'Spare Parts Master', icon: 'two_wheeler', shortcut: 'F2' },
        { id: 'live-stock-valuation', label: 'Stock Valuation', icon: 'monitoring' },
        { id: 'stock-ledger-batches', label: 'Stock Ledger', icon: 'layers' },
        { id: 'categories-master', label: 'Categories', icon: 'category' },
        { id: 'brands-master', label: 'Brands', icon: 'branding_watermark' },
        { id: 'vehicle-compatibility', label: 'Vehicle Fitment', icon: 'moped' },
        { id: 'barcode-print', label: 'Barcode Print', icon: 'qr_code_2' }
      ]
    },
    {
      title: 'FINANCE & GST',
      items: [
        { id: 'accounts-dashboard', label: 'Accounts Overview', icon: 'account_balance_wallet' },
        { id: 'receivables', label: 'Receivables', icon: 'groups', shortcut: 'F6' },
        { id: 'payables', label: 'Payables', icon: 'local_shipping' },
        { id: 'payment-receipts', label: 'Receipts', icon: 'receipt', shortcut: 'F8' },
        { id: 'payment-vouchers', label: 'Payments', icon: 'payments' },
        { id: 'customer-ledgers', label: 'Customer Ledgers', icon: 'menu_book' },
        { id: 'banking', label: 'Banking & Cash', icon: 'account_balance' },
        { id: 'gst-dashboard', label: 'GST Dashboard', icon: 'analytics' },
        { id: 'gstr-1', label: 'GSTR-1 Returns', icon: 'assignment' },
        { id: 'gstr-3b', label: 'GSTR-3B Summary', icon: 'summarize' },
        { id: 'hsn-tax-report', label: 'HSN Tax Reports', icon: 'percent' }
      ]
    },
    {
      title: 'CRM & CUSTOMERS',
      items: [
        { id: 'crm-dashboard', label: 'CRM Overview', icon: 'dashboard' },
        { id: 'customers', label: 'Customer Directory', icon: 'contacts' },
        { id: 'mechanics', label: 'Mechanics & Partners', icon: 'engineering' },
        { id: 'loyalty-program', label: 'Loyalty Rewards', icon: 'loyalty' },
        { id: 'referral-system', label: 'Referral System', icon: 'share' },
        { id: 'messaging', label: 'SMS & WhatsApp', icon: 'chat' }
      ]
    },
    {
      title: 'REPORTS & BI',
      items: [
        { id: 'sales-reports', label: 'Sales Reports', icon: 'point_of_sale' },
        { id: 'purchase-reports', label: 'Purchase Reports', icon: 'local_shipping' },
        { id: 'inventory-reports', label: 'Inventory Reports', icon: 'inventory_2' },
        { id: 'profitability-dashboard', label: 'Profitability BI', icon: 'trending_up' },
        { id: 'financial-reports', label: 'Financial Statements', icon: 'balance' },
        { id: 'business-insights', label: 'Business Insights', icon: 'insights' }
      ]
    },
    {
      title: 'SETTINGS & ADMIN',
      items: [
        { id: 'admin-dashboard', label: 'Admin Hub', icon: 'admin_panel_settings' },
        { id: 'users-roles', label: 'Users & Roles', icon: 'manage_accounts' },
        { id: 'company-settings', label: 'Company Profile', icon: 'business' },
        { id: 'invoice-templates', label: 'Invoice Templates', icon: 'receipt_long' },
        { id: 'numbering-prefixes', label: 'Numbering Series', icon: 'pin' },
        { id: 'tax-settings', label: 'Tax Settings', icon: 'percent' },
        { id: 'printer-settings', label: 'Printer Settings', icon: 'print' },
        { id: 'backup-restore', label: 'Backup & Restore', icon: 'settings_backup_restore' },
        { id: 'audit-logs', label: 'Audit Trail', icon: 'history' },
        { id: 'security-settings', label: 'Security & Access', icon: 'security' }
      ]
    }
  ];

  return (
    <aside className="fixed left-0 top-14 bottom-8 w-60 bg-white border-r border-slate-200/80 z-40 flex flex-col">
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 select-none">
        {navSections.map((sec, idx) => (
          <div key={idx} className="space-y-0.5">
            <div className="px-2 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              {sec.title}
            </div>
            {sec.items.map((item) => {
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  data-screen={item.id}
                  onClick={() => onNavigate(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-all text-left group cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-normal'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`material-symbols-outlined text-[18px] flex-shrink-0 transition-colors ${
                        isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate text-xs">{item.label}</span>
                  </div>
                  {item.shortcut && (
                    <kbd
                      className={`px-1.5 py-0.2 rounded font-mono text-[10px] ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 font-semibold'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.shortcut}
                    </kbd>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
};

