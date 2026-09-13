import React from 'react';

interface SidebarProps {
  activeScreen: string;
  onNavigate: (screenId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeScreen, onNavigate }) => {
  const navSections = [
    {
      title: 'MAIN',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' }
      ]
    },
    {
      title: 'SALES',
      items: [
        { id: 'pos', label: 'POS', icon: 'point_of_sale', shortcut: 'F4' },
        { id: 'invoices', label: 'Invoices', icon: 'receipt_long' },
        { id: 'quotations', label: 'Quotations', icon: 'request_quote' },
        { id: 'sales-returns', label: 'Sales Returns', icon: 'assignment_return' }
      ]
    },
    {
      title: 'PURCHASE',
      items: [
        { id: 'purchase-orders', label: 'Purchase Entry', icon: 'inventory_2' },
        { id: 'suppliers-master', label: 'Suppliers', icon: 'local_shipping' },
        { id: 'purchase-returns', label: 'Purchase Returns', icon: 'replay' }
      ]
    },
    {
      title: 'INVENTORY',
      items: [
        { id: 'items-master', label: 'Items', icon: 'two_wheeler', shortcut: 'F2' },
        { id: 'live-stock-valuation', label: 'Stock', icon: 'monitoring' },
        { id: 'stock-ledger-batches', label: 'Stock Ledger', icon: 'layers' },
        { id: 'categories-master', label: 'Categories', icon: 'category' },
        { id: 'brands-master', label: 'Brands', icon: 'branding_watermark' },
        { id: 'vehicle-compatibility', label: 'Vehicles', icon: 'moped' },
        { id: 'barcode-print', label: 'Barcode', icon: 'qr_code_2' }
      ]
    },
    {
      title: 'ACCOUNTS',
      items: [
        { id: 'receivables', label: 'Customers', icon: 'groups', shortcut: 'F6' },
        { id: 'payment-receipts', label: 'Receipts', icon: 'receipt', shortcut: 'F8' },
        { id: 'payment-vouchers', label: 'Payments', icon: 'payments' },
        { id: 'customer-ledgers', label: 'Ledgers', icon: 'menu_book' },
        { id: 'banking', label: 'Banking', icon: 'account_balance' }
      ]
    },
    {
      title: 'GST',
      items: [
        { id: 'gst-dashboard', label: 'GST Dashboard', icon: 'account_balance' },
        { id: 'gstr-1', label: 'GSTR-1', icon: 'assignment' },
        { id: 'gstr-3b', label: 'GSTR-3B', icon: 'summarize' },
        { id: 'hsn-tax-report', label: 'Tax Reports', icon: 'percent' }
      ]
    },
    {
      title: 'CRM & DIRECTORY',
      items: [
        { id: 'customers', label: 'Customers', icon: 'contacts' },
        { id: 'mechanics', label: 'Mechanics', icon: 'engineering' }
      ]
    },
    {
      title: 'REPORTS',
      items: [
        { id: 'sales-reports', label: 'Sales', icon: 'point_of_sale' },
        { id: 'purchase-reports', label: 'Purchase', icon: 'local_shipping' },
        { id: 'inventory-reports', label: 'Inventory', icon: 'inventory_2' },
        { id: 'profitability-dashboard', label: 'Profitability', icon: 'trending_up' },
        { id: 'financial-reports', label: 'Financial', icon: 'balance' }
      ]
    },
    {
      title: 'ADMINISTRATION',
      items: [
        { id: 'users-roles', label: 'Users & Roles', icon: 'manage_accounts' },
        { id: 'company-settings', label: 'Company Settings', icon: 'business' },
        { id: 'invoice-templates', label: 'Invoice Templates', icon: 'receipt_long' },
        { id: 'numbering-prefixes', label: 'Numbering', icon: 'pin' },
        { id: 'tax-settings', label: 'Tax Settings', icon: 'percent' },
        { id: 'printer-settings', label: 'Printer Settings', icon: 'print' },
        { id: 'backup-restore', label: 'Backup & Restore', icon: 'settings_backup_restore' },
        { id: 'audit-logs', label: 'Audit Logs', icon: 'history' },
        { id: 'security-settings', label: 'Security', icon: 'security' }
      ]
    }
  ];

  return (
    <aside className="fixed left-0 top-14 bottom-8 w-60 bg-surface-container-lowest border-r border-surface-container-high z-40 flex flex-col">
      <nav className="flex-1 overflow-y-auto p-space-xs space-y-space-xs select-none">
        {navSections.map((sec, idx) => (
          <div key={idx}>
            <div
              className={`px-space-sm ${
                idx === 0 ? 'pt-space-xs' : 'pt-space-md'
              } pb-1 font-label-caps text-[10px] font-bold text-outline uppercase tracking-wider`}
            >
              {sec.title}
            </div>
            {sec.items.map((item) => {
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center justify-between px-space-sm py-1.5 rounded transition-colors text-left ${
                    isActive
                      ? 'bg-secondary text-on-secondary font-semibold shadow-xs'
                      : 'font-table-cell text-table-cell text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}
                >
                  <div className="flex items-center gap-space-sm min-w-0">
                    <span
                      className={`material-symbols-outlined text-[18px] flex-shrink-0 ${
                        isActive ? 'text-on-secondary' : 'text-outline'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate text-xs">{item.label}</span>
                  </div>
                  {item.shortcut && (
                    <kbd
                      className={`px-1 py-0.2 rounded font-shortcut-key text-[10px] font-mono ${
                        isActive
                          ? 'bg-on-secondary-fixed text-on-secondary'
                          : 'bg-surface-container-high text-on-surface-variant'
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
