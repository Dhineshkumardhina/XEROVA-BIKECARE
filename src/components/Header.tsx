import React, { useState } from 'react';
import { UserRole } from '../types';

interface HeaderProps {
  onOpenGlobalSearch: () => void;
  onOpenNewPart: () => void;
  onOpenNewBill?: () => void;
  activeScreen: string;
  onNavigate: (screen: string) => void;
  showNotifications?: boolean;
  setShowNotifications?: (val: boolean) => void;
  userRole?: UserRole;
  onUserRoleChange?: (role: UserRole) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenGlobalSearch,
  onOpenNewPart,
  onOpenNewBill,
  onNavigate,
  showNotifications: propShowNotifications,
  setShowNotifications: propSetShowNotifications,
  userRole = 'store_admin',
  onUserRoleChange
}) => {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('Main Branch - Chennai Central');
  const [showBranchMenu, setShowBranchMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [internalNotifications, setInternalNotifications] = useState(false);

  const showNotifications = propShowNotifications ?? internalNotifications;
  const setShowNotifications = propSetShowNotifications ?? setInternalNotifications;

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-surface-container-lowest border-b border-surface-container-high z-50 flex items-center justify-between px-gutter select-none">
      {/* Left: Logo + Branch + GST */}
      <div className="flex items-center gap-gutter flex-shrink-0">
        <div 
          className="flex items-center gap-space-sm cursor-pointer"
          onClick={() => onNavigate('dashboard')}
          title="Go to Dashboard"
        >
          <img
            alt="BIKE ERP Logo"
            className="h-8 w-auto object-contain"
            src="https://lh3.googleusercontent.com/aida/AEtjO1UQrVlh6FYKk4LuySvgRIsF8nn74XIEttFLLvqIpALmbsblikHweqTVsVsfbyz9CVQec99jOSCQi0-6w200SnJJhKug1sBznsIbEqp6YwcGcKFz_sosQqSzjJj3uqsw4lOrN4hwOHYnnJA4EECm_o6bWCkSgQv6_GVLKOn9swzB2r6g4YC8UpHG4hjMzUlz4wLPBD5LcQDBG9v2yWQ8bqrylGSXlacstksl38Nsul6WQDjYAXXG73NPFog"
          />
          <div className="flex flex-col">
            <span className="font-headline-md text-headline-md text-primary tracking-tight leading-none">
              BIKE ERP
            </span>
            <span className="font-label-caps text-label-caps text-outline uppercase">
              Parts &amp; POS
            </span>
          </div>
        </div>

        <div className="h-6 w-px bg-surface-container-high"></div>

        {/* Branch Selector */}
        <div className="relative">
          <button
            onClick={() => setShowBranchMenu(!showBranchMenu)}
            className="flex items-center gap-space-xs px-space-sm py-space-xs rounded bg-surface-container-low hover:bg-surface-container border border-surface-container-highest transition-colors"
          >
            <span className="material-symbols-outlined text-secondary text-[18px]">
              storefront
            </span>
            <div className="flex flex-col text-left">
              <span className="font-table-cell text-table-cell text-on-surface font-semibold leading-tight">
                {selectedBranch}
              </span>
              <span className="font-shortcut-key text-shortcut-key text-outline">
                Wholesale &amp; Retail
              </span>
            </div>
            <span className="material-symbols-outlined text-outline text-[16px]">
              expand_more
            </span>
          </button>

          {showBranchMenu && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-surface-container-lowest border border-surface-container-highest rounded shadow-lg py-1 z-50">
              <div className="px-3 py-1.5 text-[11px] font-bold text-outline uppercase tracking-wider">
                Switch Active Outlet
              </div>
              <button
                onClick={() => {
                  setSelectedBranch('Main Branch - Chennai Central');
                  setShowBranchMenu(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-surface-container-low flex items-center justify-between ${
                  selectedBranch.includes('Central') ? 'bg-surface-container font-semibold text-secondary' : 'text-on-surface'
                }`}
              >
                <span>Main Branch - Chennai Central</span>
                {selectedBranch.includes('Central') && <span className="material-symbols-outlined text-[14px]">check</span>}
              </button>
              <button
                onClick={() => {
                  setSelectedBranch('Hub Warehouse - Ambattur Industrial');
                  setShowBranchMenu(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-surface-container-low flex items-center justify-between ${
                  selectedBranch.includes('Ambattur') ? 'bg-surface-container font-semibold text-secondary' : 'text-on-surface'
                }`}
              >
                <span>Hub Warehouse - Ambattur</span>
                {selectedBranch.includes('Ambattur') && <span className="material-symbols-outlined text-[14px]">check</span>}
              </button>
              <button
                onClick={() => {
                  setSelectedBranch('Express Counter - Guindy');
                  setShowBranchMenu(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-surface-container-low flex items-center justify-between ${
                  selectedBranch.includes('Guindy') ? 'bg-surface-container font-semibold text-secondary' : 'text-on-surface'
                }`}
              >
                <span>Express Counter - Guindy</span>
                {selectedBranch.includes('Guindy') && <span className="material-symbols-outlined text-[14px]">check</span>}
              </button>
            </div>
          )}
        </div>

        {/* GST Status Banner */}
        <div className="hidden xl:flex items-center gap-space-xs px-space-sm py-space-xs rounded bg-surface-container-low border border-surface-container-highest">
          <span className="w-2 h-2 rounded-full bg-on-tertiary-container animate-pulse"></span>
          <span className="font-shortcut-key text-shortcut-key text-on-surface-variant">
            GST Portal: Live Sync
          </span>
          <span className="text-outline-variant font-shortcut-key text-shortcut-key">|</span>
          <span className="font-shortcut-key text-shortcut-key text-secondary font-semibold">
            FY 2024-25
          </span>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-xl mx-gutter">
        <div
          onClick={onOpenGlobalSearch}
          className="relative flex items-center cursor-pointer group"
        >
          <span className="material-symbols-outlined absolute left-space-md text-outline group-hover:text-secondary pointer-events-none text-[18px] transition-colors">
            search
          </span>
          <div className="w-full h-9 pl-9 pr-20 bg-surface-container-low hover:bg-surface-container-lowest focus:bg-surface-container-lowest border border-surface-container-highest group-hover:border-secondary rounded font-body-sm text-body-sm text-on-surface flex items-center transition-colors">
            <span className="text-outline text-xs truncate">
              Search items by Part #, vehicle (e.g. Pulsar 150), customer mobile, or invoice...
            </span>
          </div>
          <div className="absolute right-space-sm flex items-center gap-space-xs pointer-events-none">
            <kbd className="px-space-xs py-0.5 bg-surface-container-high border border-surface-container-highest rounded font-shortcut-key text-shortcut-key text-on-surface-variant">
              Ctrl
            </kbd>
            <span className="font-shortcut-key text-shortcut-key text-outline">+</span>
            <kbd className="px-space-xs py-0.5 bg-surface-container-high border border-surface-container-highest rounded font-shortcut-key text-shortcut-key text-on-surface-variant">
              K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right: Quick Add + Due warning + Notifs + Profile */}
      <div className="flex items-center gap-space-md flex-shrink-0">
        <div className="relative">
          <button
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            className="flex items-center gap-space-xs h-8 px-space-md bg-secondary hover:bg-secondary-container text-on-secondary rounded font-table-cell text-table-cell transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>+ Quick Add</span>
            <span className="material-symbols-outlined text-[16px]">arrow_drop_down</span>
          </button>

          {showQuickAdd && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-surface-container-lowest border border-surface-container-highest rounded shadow-xl py-1 z-50">
              <button
                onClick={() => {
                  setShowQuickAdd(false);
                  onOpenNewBill();
                }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-surface-container-low flex items-center gap-2 text-on-surface"
              >
                <span className="material-symbols-outlined text-secondary text-[16px]">point_of_sale</span>
                <span className="flex-1 font-semibold">New POS Bill</span>
                <kbd className="bg-surface-container px-1 py-0.5 rounded text-[10px]">F4</kbd>
              </button>
              <button
                onClick={() => {
                  setShowQuickAdd(false);
                  onOpenNewPart();
                }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-surface-container-low flex items-center gap-2 text-on-surface"
              >
                <span className="material-symbols-outlined text-secondary text-[16px]">two_wheeler</span>
                <span className="flex-1 font-semibold">Add Spare SKU</span>
                <kbd className="bg-surface-container px-1 py-0.5 rounded text-[10px]">F2</kbd>
              </button>
              <button
                onClick={() => {
                  setShowQuickAdd(false);
                  onNavigate('invoices');
                }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-surface-container-low flex items-center gap-2 text-on-surface"
              >
                <span className="material-symbols-outlined text-outline text-[16px]">request_quote</span>
                <span>Create Quotation</span>
              </button>
              <button
                onClick={() => {
                  setShowQuickAdd(false);
                  onNavigate('purchase-orders');
                }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-surface-container-low flex items-center gap-2 text-on-surface"
              >
                <span className="material-symbols-outlined text-outline text-[16px]">input</span>
                <span>Purchase Inward (GRN)</span>
              </button>
            </div>
          )}
        </div>

        {/* GST Reminder */}
        <div
          onClick={() => onNavigate('gstr-reports')}
          className="hidden lg:flex items-center gap-space-xs px-space-sm py-1 rounded bg-surface-container border border-surface-container-highest cursor-pointer hover:bg-surface-container-high transition-colors"
          title="View GSTR filing calendar"
        >
          <span className="material-symbols-outlined text-error text-[16px]">event_upcoming</span>
          <span className="font-shortcut-key text-shortcut-key text-error font-semibold">
            GSTR-3B due in 4 days
          </span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant transition-colors"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-1 right-1 flex items-center justify-center min-w-[14px] h-[14px] px-0.5 bg-error text-on-error font-shortcut-key text-[9px] font-bold rounded-full">
              5
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-1 w-80 bg-surface-container-lowest border border-surface-container-highest rounded shadow-xl py-2 z-50">
              <div className="px-3 pb-2 border-b border-surface-container-high flex items-center justify-between">
                <span className="font-headline-md text-xs font-bold text-on-surface">
                  System Alerts (5)
                </span>
                <span className="text-[10px] text-secondary cursor-pointer hover:underline">
                  Mark all read
                </span>
              </div>
              <div className="divide-y divide-surface-container-high max-h-72 overflow-y-auto">
                <div className="p-2.5 hover:bg-surface-container-low text-xs flex gap-2">
                  <span className="material-symbols-outlined text-error text-[18px]">warning</span>
                  <div>
                    <div className="font-bold text-on-surface">Bajaj Pulsar 150 Pad is Out of Stock</div>
                    <div className="text-[11px] text-outline">Immediate Purchase Order required (0 pcs remaining)</div>
                    <div className="text-[10px] text-outline-variant mt-1">10 mins ago</div>
                  </div>
                </div>
                <div className="p-2.5 hover:bg-surface-container-low text-xs flex gap-2">
                  <span className="material-symbols-outlined text-secondary text-[18px]">receipt_long</span>
                  <div>
                    <div className="font-bold text-on-surface">Large Counter Invoice Generated</div>
                    <div className="text-[11px] text-outline">₹34,200 collected via NEFT Bank (INV-10288)</div>
                    <div className="text-[10px] text-outline-variant mt-1">1 hour ago</div>
                  </div>
                </div>
                <div className="p-2.5 hover:bg-surface-container-low text-xs flex gap-2">
                  <span className="material-symbols-outlined text-on-tertiary-container text-[18px]">check_circle</span>
                  <div>
                    <div className="font-bold text-on-surface">GST E-Way Bill Auto Synced</div>
                    <div className="text-[11px] text-outline">E-Way Bill 4412093 verified on NIC portal</div>
                    <div className="text-[10px] text-outline-variant mt-1">2 hours ago</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle placeholder */}
        <button
          className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant transition-colors"
          title="Theme Toggle"
          onClick={() => alert('Theme mode: Precision Industrial Light (optimized for high-contrast counter barcode scanning & retail visibility)')}
        >
          <span className="material-symbols-outlined text-[20px]">brightness_medium</span>
        </button>

        <div className="h-6 w-px bg-surface-container-high"></div>

        {/* Profile Card & Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-space-xs pl-space-xs p-1 rounded hover:bg-surface-container transition-colors"
            title="Switch User Role & Permissions"
          >
            <img
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover border border-surface-container-highest"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzYYQR59c4o8MMMwhVgczmrNacjWcyQfdTF9RkEJTWmXkKxa9qWdo2Ml7J9bOlGssITg0cFLGMOeBzjMTxUe_KqjJ6BjpAVQb2PJe-PpD1hB3KSvJxfL877x7n7V-Lj5VzRPSx7D8qRoIZqXCRhsyDG420AHSnWL50Z1Mz5QD8sHqc-U_rSYAiVuLFyTlbJZxiaqZnpu1yF1DkQizuApR9-SCpyLHPs7uabs7-wTqZ0DYgycpMDWIdKg"
            />
            <div className="hidden md:flex flex-col text-left">
              <span className="font-table-cell text-table-cell text-on-surface font-semibold leading-tight">
                {userRole === 'billing_operator' ? 'Kavitha S.' : 'Rajesh Kumar'}
              </span>
              <span className="font-shortcut-key text-shortcut-key text-secondary font-bold flex items-center gap-0.5">
                {userRole === 'store_admin' ? 'Store Admin' : userRole === 'manager' ? 'Store Manager' : 'Billing Operator'}
                <span className="material-symbols-outlined text-[12px]">expand_more</span>
              </span>
            </div>
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 top-full mt-1 w-64 bg-surface-container-lowest border border-surface-container-highest rounded shadow-xl py-1 z-50 text-xs">
              <div className="px-3 py-1.5 text-[11px] font-bold text-outline uppercase tracking-wider border-b border-surface-container-high">
                Role &amp; Financial Permissions
              </div>
              <button
                onClick={() => {
                  if (onUserRoleChange) onUserRoleChange('store_admin');
                  setShowRoleMenu(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-surface-container-low transition-colors ${
                  userRole === 'store_admin' ? 'bg-surface-container font-bold text-secondary' : 'text-on-surface'
                }`}
              >
                <div>
                  <div className="font-semibold">Store Admin</div>
                  <div className="text-[10px] text-outline">Full access, gross profit, disbursements, reversals</div>
                </div>
                {userRole === 'store_admin' && (
                  <span className="material-symbols-outlined text-secondary text-[16px]">check</span>
                )}
              </button>

              <button
                onClick={() => {
                  if (onUserRoleChange) onUserRoleChange('manager');
                  setShowRoleMenu(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-surface-container-low transition-colors ${
                  userRole === 'manager' ? 'bg-surface-container font-bold text-secondary' : 'text-on-surface'
                }`}
              >
                <div>
                  <div className="font-semibold">Store Manager</div>
                  <div className="text-[10px] text-outline">Ledgers, payables, stock audit, banking</div>
                </div>
                {userRole === 'manager' && (
                  <span className="material-symbols-outlined text-secondary text-[16px]">check</span>
                )}
              </button>

              <button
                onClick={() => {
                  if (onUserRoleChange) onUserRoleChange('billing_operator');
                  setShowRoleMenu(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-surface-container-low transition-colors ${
                  userRole === 'billing_operator' ? 'bg-surface-container font-bold text-secondary' : 'text-on-surface'
                }`}
              >
                <div>
                  <div className="font-semibold">Billing Operator</div>
                  <div className="text-[10px] text-outline">POS bills &amp; receipts only; profit &amp; payables hidden</div>
                </div>
                {userRole === 'billing_operator' && (
                  <span className="material-symbols-outlined text-secondary text-[16px]">check</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
