import React from 'react';

interface SidebarProps {
  activeScreen: string;
  onNavigate: (screenId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeScreen, onNavigate }) => {
  const navSections = [
    {
      title: 'Main',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' }
      ]
    },
    {
      title: 'Sales & POS',
      items: [
        { id: 'fast-counter-pos', label: 'Fast Counter POS', icon: 'point_of_sale', shortcut: 'F4' },
        { id: 'invoices', label: 'Invoices (Sales Register)', icon: 'receipt_long' },
        { id: 'quotations', label: 'Quotations / Estimates', icon: 'request_quote' },
        { id: 'sales-returns', label: 'Sales Returns & Notes', icon: 'assignment_return' }
      ]
    },
    {
      title: 'Purchase',
      items: [
        { id: 'purchase-orders', label: 'Orders & GRN', icon: 'inventory_2' },
        { id: 'supplier-invoices', label: 'Supplier Invoices', icon: 'description' },
        { id: 'suppliers-master', label: 'Suppliers Master', icon: 'local_shipping' },
        { id: 'purchase-returns', label: 'Purchase Returns', icon: 'replay' }
      ]
    },
    {
      title: 'Inventory',
      items: [
        { id: 'items-master', label: 'Items Master', icon: 'two_wheeler', shortcut: 'F2' },
        { id: 'live-stock-valuation', label: 'Inventory Dashboard', icon: 'monitoring' },
        { id: 'stock-ledger-batches', label: 'Stock Ledger & Batches', icon: 'layers' },
        { id: 'stock-reports', label: 'Stock Summary Report', icon: 'bar_chart' },
        { id: 'low-stock', label: 'Low Stock Reorder', icon: 'warning' },
        { id: 'vehicle-compatibility', label: 'Vehicle Matrix', icon: 'moped' },
        { id: 'barcode-print', label: 'Barcode & Labels', icon: 'qr_code_2' }
      ]
    },
    {
      title: 'Accounts & Banking',
      items: [
        { id: 'accounts-dashboard', label: 'Accounts Dashboard', icon: 'account_balance_wallet' },
        { id: 'receivables', label: 'Receivables & Ageing', icon: 'pending_actions' },
        { id: 'customer-ledgers', label: 'Customer Ledgers', icon: 'menu_book' },
        { id: 'payment-receipts', label: 'Receipt Vouchers', icon: 'receipt' },
        { id: 'payables', label: 'Supplier Payables', icon: 'receipt_long' },
        { id: 'supplier-ledgers', label: 'Supplier Ledgers', icon: 'menu_book' },
        { id: 'payment-vouchers', label: 'Payment Vouchers', icon: 'payments' },
        { id: 'banking', label: 'Banking & Cash Book', icon: 'account_balance' }
      ]
    },
    {
      title: 'GST & Compliance',
      items: [
        { id: 'gst-dashboard', label: 'GST Dashboard', icon: 'account_balance' },
        { id: 'gstr-1', label: 'GSTR-1 Outward', icon: 'assignment' },
        { id: 'gstr-3b', label: 'GSTR-3B Summary', icon: 'summarize' },
        { id: 'hsn-tax-report', label: 'HSN Tax Report', icon: 'percent' }
      ]
    },
    {
      title: 'Reports & Analytics',
      items: [
        { id: 'sales-reports', label: 'Sales Reports', icon: 'point_of_sale' },
        { id: 'purchase-reports', label: 'Purchase Reports', icon: 'local_shipping' },
        { id: 'inventory-reports', label: 'Inventory Valuation', icon: 'inventory_2' },
        { id: 'profitability-dashboard', label: 'Profitability & Margins', icon: 'trending_up' },
        { id: 'financial-reports', label: 'Financial Statements', icon: 'balance' },
        { id: 'business-insights', label: 'Business Intelligence', icon: 'insights' }
      ]
    },
    {
      title: 'CRM & Loyalty',
      items: [
        { id: 'mechanic-loyalty', label: 'Mechanic Loyalty', icon: 'handyman' }
      ]
    },
    {
      title: 'Administration',
      items: [
        { id: 'admin-dashboard', label: 'Admin Dashboard', icon: 'admin_panel_settings' },
        { id: 'users-roles', label: 'Users & Roles', icon: 'manage_accounts' },
        { id: 'permissions', label: 'Permissions', icon: 'policy' },
        { id: 'company-settings', label: 'Company Settings', icon: 'business' },
        { id: 'branch-settings', label: 'Branch Settings', icon: 'store' },
        { id: 'invoice-templates', label: 'Invoice Templates', icon: 'receipt_long' },
        { id: 'numbering-prefixes', label: 'Numbering & Prefixes', icon: 'pin' },
        { id: 'tax-settings', label: 'Tax Settings', icon: 'percent' },
        { id: 'payment-modes', label: 'Payment Modes', icon: 'payments' },
        { id: 'printer-settings', label: 'Printer Settings', icon: 'print' },
        { id: 'backup-restore', label: 'Backup & Restore', icon: 'settings_backup_restore' },
        { id: 'audit-logs', label: 'Audit Logs', icon: 'history' },
        { id: 'system-activity', label: 'System Activity', icon: 'timeline' },
        { id: 'security-settings', label: 'Security Settings', icon: 'security' }
      ]
    }
  ];

  return (
    <aside className="fixed left-0 top-14 bottom-8 w-60 bg-surface-container-lowest border-r border-surface-container-high z-40 flex flex-col">
      <nav className="flex-1 overflow-y-auto p-space-xs space-y-space-xs select-none">
        {navSections.map((sec, idx) => (
          <div key={idx}>
            <div className={`px-space-sm ${idx === 0 ? 'pt-space-xs' : 'pt-space-md'} pb-0.5 font-label-caps text-label-caps text-outline uppercase tracking-wider`}>
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
                  <div className="flex items-center gap-space-sm">
                    <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-on-secondary' : 'text-outline'}`}>
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.shortcut && (
                    <kbd
                      className={`px-1 py-0.2 rounded font-shortcut-key text-shortcut-key ${
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
