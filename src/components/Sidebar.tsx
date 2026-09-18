import React, { useState } from 'react';

interface SidebarProps {
  activeScreen: string;
  onNavigate: (screenId: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
  shortcut?: string;
  children?: { id: string; label: string }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ activeScreen, onNavigate }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(() => {
    if (['invoices', 'quotations', 'sales-returns'].includes(activeScreen)) return 'sales';
    if (['items-master', 'live-stock-valuation', 'stock-ledger-batches', 'categories-master', 'brands-master', 'vehicle-compatibility', 'barcode-print'].includes(activeScreen)) return 'inventory';
    if (['purchase-orders', 'suppliers-master', 'purchase-returns'].includes(activeScreen)) return 'purchases';
    if (['accounts-dashboard', 'receivables', 'payables', 'payment-receipts', 'payment-vouchers', 'customer-ledgers', 'banking', 'gst-dashboard', 'gstr-1', 'gstr-3b', 'hsn-tax-report'].includes(activeScreen)) return 'accounts';
    if (['customers', 'mechanics', 'loyalty-program', 'referral-system', 'messaging', 'crm-dashboard'].includes(activeScreen)) return 'crm';
    if (['company-settings', 'sales-reports', 'purchase-reports', 'inventory-reports', 'profitability-dashboard', 'financial-reports', 'users-roles', 'tax-settings', 'backup-restore', 'audit-logs', 'security-settings', 'admin-dashboard', 'system-updates'].includes(activeScreen)) return 'settings';
    return null;
  });

  const toggleSection = (sectionId: string, defaultScreenId?: string) => {
    if (expandedSection === sectionId) {
      setExpandedSection(null);
    } else {
      setExpandedSection(sectionId);
      if (defaultScreenId && activeScreen !== defaultScreenId) {
        onNavigate(defaultScreenId);
      }
    }
  };

  const navItems: { sectionId: string; item: NavItem }[] = [
    {
      sectionId: 'dashboard',
      item: { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' }
    },
    {
      sectionId: 'pos',
      item: { id: 'pos', label: 'Point of Sale (POS)', icon: 'point_of_sale', shortcut: 'F4' }
    },
    {
      sectionId: 'sales',
      item: {
        id: 'invoices',
        label: 'Sales & Billing',
        icon: 'receipt_long',
        children: [
          { id: 'invoices', label: 'Invoices Register' },
          { id: 'quotations', label: 'Quotations & Estimates' },
          { id: 'sales-returns', label: 'Sales Returns (Credit)' }
        ]
      }
    },
    {
      sectionId: 'inventory',
      item: {
        id: 'items-master',
        label: 'Inventory & Spares',
        icon: 'two_wheeler',
        shortcut: 'F2',
        children: [
          { id: 'items-master', label: 'Spare Parts Master' },
          { id: 'live-stock-valuation', label: 'Stock Valuation' },
          { id: 'stock-ledger-batches', label: 'Stock Movement Ledger' },
          { id: 'vehicle-compatibility', label: 'Vehicle Compatibility' },
          { id: 'barcode-print', label: 'Barcode Print' }
        ]
      }
    },
    {
      sectionId: 'purchases',
      item: {
        id: 'purchase-orders',
        label: 'Purchases & Suppliers',
        icon: 'local_shipping',
        children: [
          { id: 'purchase-orders', label: 'Purchase Entry (GRN)' },
          { id: 'suppliers-master', label: 'Suppliers Master' },
          { id: 'purchase-returns', label: 'Purchase Returns (Debit)' }
        ]
      }
    },
    {
      sectionId: 'accounts',
      item: {
        id: 'accounts-dashboard',
        label: 'Accounts & GST',
        icon: 'account_balance_wallet',
        shortcut: 'F6',
        children: [
          { id: 'accounts-dashboard', label: 'Financial Overview' },
          { id: 'receivables', label: 'Customer Receivables' },
          { id: 'payables', label: 'Supplier Payables' },
          { id: 'payment-receipts', label: 'Payment Receipts' },
          { id: 'banking', label: 'Banking & Cash' },
          { id: 'gst-dashboard', label: 'GST Filings & Reports' }
        ]
      }
    },
    {
      sectionId: 'crm',
      item: {
        id: 'customers',
        label: 'Customers & CRM',
        icon: 'contacts',
        children: [
          { id: 'customers', label: 'Customer Directory' },
          { id: 'mechanics', label: 'Mechanic Partners' },
          { id: 'loyalty-program', label: 'Loyalty Rewards' },
          { id: 'messaging', label: 'SMS & WhatsApp' }
        ]
      }
    },
    {
      sectionId: 'reports',
      item: {
        id: 'sales-reports',
        label: 'Reports & Analytics',
        icon: 'trending_up',
        children: [
          { id: 'sales-reports', label: 'Sales Reports' },
          { id: 'purchase-reports', label: 'Purchase Reports' },
          { id: 'inventory-reports', label: 'Inventory Reports' },
          { id: 'profitability-dashboard', label: 'Profit & Loss BI' }
        ]
      }
    },
    {
      sectionId: 'settings',
      item: {
        id: 'company-settings',
        label: 'Settings & Admin',
        icon: 'settings',
        children: [
          { id: 'company-settings', label: 'Company Profile' },
          { id: 'users-roles', label: 'Users & Permissions' },
          { id: 'backup-restore', label: 'Backup & Restore' },
          { id: 'audit-logs', label: 'Audit Trail' },
          { id: 'system-updates', label: 'System Updates' }
        ]
      }
    }
  ];

  return (
    <aside className="fixed left-0 top-14 bottom-0 w-60 bg-white border-r border-slate-200/80 z-40 flex flex-col shadow-xs">
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 select-none">
        <div className="px-2 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Main Menu
        </div>

        {navItems.map(({ sectionId, item }) => {
          const isDirectActive = activeScreen === item.id;
          const isChildActive = item.children?.some(c => c.id === activeScreen);
          const isExpanded = expandedSection === sectionId;
          const hasChildren = !!item.children?.length;

          return (
            <div key={sectionId} className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  if (hasChildren) {
                    toggleSection(sectionId, item.id);
                  } else {
                    onNavigate(item.id);
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all text-left group cursor-pointer ${
                  isDirectActive || isChildActive
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`material-symbols-outlined text-[19px] flex-shrink-0 transition-colors ${
                      isDirectActive || isChildActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate text-xs">{item.label}</span>
                </div>

                <div className="flex items-center gap-1">
                  {item.shortcut && (
                    <kbd
                      className={`px-1.5 py-0.2 rounded font-mono text-[10px] ${
                        isDirectActive
                          ? 'bg-blue-100 text-blue-700 font-bold'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.shortcut}
                    </kbd>
                  )}
                  {hasChildren && (
                    <span
                      className={`material-symbols-outlined text-[16px] text-slate-400 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180 text-blue-600' : ''
                      }`}
                    >
                      expand_more
                    </span>
                  )}
                </div>
              </button>

              {/* Collapsible Sub-menu */}
              {hasChildren && isExpanded && (
                <div className="pl-8 pr-1 py-1 space-y-0.5 animate-in slide-in-from-top-1 duration-150 border-l-2 border-slate-100 ml-5">
                  {item.children!.map((child) => {
                    const isSelected = activeScreen === child.id;
                    return (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => onNavigate(child.id)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? 'font-bold text-blue-600 bg-blue-50/80'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-normal'
                        }`}
                      >
                        {child.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};


