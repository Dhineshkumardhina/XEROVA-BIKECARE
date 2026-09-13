import React, { useState } from 'react';
import { UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';

export interface ErpNotification {
  id: string;
  type:
    | 'low_stock'
    | 'out_of_stock'
    | 'outstanding_payment'
    | 'backup_completed'
    | 'backup_failed'
    | 'gst_error'
    | 'permission_request'
    | 'system_warning';
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  actionScreen?: string;
  actionLabel?: string;
}

interface HeaderProps {
  onOpenGlobalSearch: () => void;
  onOpenQuickActions: () => void;
  onOpenNewPart: () => void;
  onOpenNewBill?: () => void;
  activeScreen: string;
  onNavigate: (screen: string) => void;
  userRole?: UserRole;
  onUserRoleChange?: (role: UserRole) => void;
}

const INITIAL_NOTIFICATIONS: ErpNotification[] = [];

export const Header: React.FC<HeaderProps> = ({
  onOpenGlobalSearch,
  onOpenQuickActions,
  onOpenNewPart,
  onOpenNewBill,
  onNavigate,
  userRole = 'store_admin',
  onUserRoleChange
}) => {
  const { logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'unread'>('all');
  const [notifications, setNotifications] = useState<ErpNotification[]>(INITIAL_NOTIFICATIONS);
  const [selectedBranch, setSelectedBranch] = useState('Main Branch - Chennai Central');
  const [showBranchMenu, setShowBranchMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  const filteredNotifications = notifications.filter((n) =>
    notificationFilter === 'all' ? true : !n.isRead
  );

  const getNotificationIcon = (type: ErpNotification['type']) => {
    switch (type) {
      case 'out_of_stock':
        return { icon: 'error', color: 'text-error' };
      case 'low_stock':
        return { icon: 'warning', color: 'text-tertiary-fixed' };
      case 'outstanding_payment':
        return { icon: 'pending_actions', color: 'text-secondary' };
      case 'gst_error':
        return { icon: 'report', color: 'text-error' };
      case 'backup_completed':
        return { icon: 'check_circle', color: 'text-on-tertiary-container' };
      case 'backup_failed':
        return { icon: 'cloud_off', color: 'text-error' };
      case 'permission_request':
        return { icon: 'admin_panel_settings', color: 'text-secondary' };
      default:
        return { icon: 'notifications', color: 'text-outline' };
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-surface-container-lowest border-b border-surface-container-high z-50 flex items-center justify-between px-gutter select-none">
      {/* Left: Logo + Branch + Global Status */}
      <div className="flex items-center gap-space-md flex-shrink-0">
        <div
          className="flex items-center gap-2.5 cursor-pointer group"
          onClick={() => onNavigate('dashboard')}
          title="Go to XEROVA BIKE SOFTWARE Dashboard"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-secondary via-primary to-secondary text-white flex items-center justify-center shadow-xs border border-secondary/20 group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[22px]">two_wheeler</span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-md text-sm text-primary tracking-tight leading-none font-bold flex items-center gap-1">
              <span className="text-secondary font-black tracking-wider">XEROVA</span>
              <span className="text-on-surface">BIKE SOFTWARE</span>
            </span>
            <span className="font-label-caps text-[9px] text-outline uppercase tracking-wider font-semibold mt-0.5">
              Care &amp; Spares Platform
            </span>
          </div>
        </div>

        <div className="h-6 w-px bg-surface-container-high"></div>

        {/* Branch Selector */}
        <div className="relative">
          <button
            onClick={() => setShowBranchMenu(!showBranchMenu)}
            className="flex items-center gap-space-xs px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container border border-surface-container-highest transition-colors text-xs"
          >
            <span className="material-symbols-outlined text-secondary text-[16px]">
              storefront
            </span>
            <div className="flex flex-col text-left">
              <span className="font-semibold text-on-surface leading-tight text-[11px]">
                {selectedBranch}
              </span>
              <span className="text-[9px] text-outline">
                Retail &amp; Wholesale
              </span>
            </div>
            <span className="material-symbols-outlined text-outline text-[14px]">
              expand_more
            </span>
          </button>

          {showBranchMenu && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-surface-container-lowest border border-surface-container-highest rounded shadow-xl py-1 z-50 text-xs">
              <div className="px-3 py-1 text-[10px] font-bold text-outline uppercase tracking-wider">
                Select Active Store / Outlet
              </div>
              <button
                onClick={() => {
                  setSelectedBranch('Main Branch - Chennai Central');
                  setShowBranchMenu(false);
                }}
                className={`w-full text-left px-3 py-2 hover:bg-surface-container-low flex items-center justify-between ${
                  selectedBranch.includes('Central')
                    ? 'bg-surface-container font-semibold text-secondary'
                    : 'text-on-surface'
                }`}
              >
                <span>Main Branch - Chennai Central</span>
                {selectedBranch.includes('Central') && (
                  <span className="material-symbols-outlined text-[14px]">check</span>
                )}
              </button>
              <button
                onClick={() => {
                  setSelectedBranch('Hub Warehouse - Ambattur Industrial');
                  setShowBranchMenu(false);
                }}
                className={`w-full text-left px-3 py-2 hover:bg-surface-container-low flex items-center justify-between ${
                  selectedBranch.includes('Ambattur')
                    ? 'bg-surface-container font-semibold text-secondary'
                    : 'text-on-surface'
                }`}
              >
                <span>Hub Warehouse - Ambattur</span>
                {selectedBranch.includes('Ambattur') && (
                  <span className="material-symbols-outlined text-[14px]">check</span>
                )}
              </button>
              <button
                onClick={() => {
                  setSelectedBranch('Express Counter - Guindy');
                  setShowBranchMenu(false);
                }}
                className={`w-full text-left px-3 py-2 hover:bg-surface-container-low flex items-center justify-between ${
                  selectedBranch.includes('Guindy')
                    ? 'bg-surface-container font-semibold text-secondary'
                    : 'text-on-surface'
                }`}
              >
                <span>Express Counter - Guindy</span>
                {selectedBranch.includes('Guindy') && (
                  <span className="material-symbols-outlined text-[14px]">check</span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Global System Status Indicators (Clean & Non-distracting) */}
        <div className="hidden xl:flex items-center gap-2.5 px-2.5 py-1 rounded bg-surface-container-low border border-surface-container-highest text-[11px]">
          <div className="flex items-center gap-1 text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-on-tertiary-container animate-pulse"></span>
            <span className="font-medium">Online</span>
          </div>
          <span className="text-outline-variant font-mono">|</span>
          <div className="flex items-center gap-1 text-secondary">
            <span className="material-symbols-outlined text-[14px]">sync</span>
            <span>GST Live</span>
          </div>
          <span className="text-outline-variant font-mono">|</span>
          <div className="flex items-center gap-1 text-outline">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            <span>FY 2026-27</span>
          </div>
        </div>
      </div>

      {/* Center: Global Search Omnibox (Ctrl + K) */}
      <div className="flex-1 max-w-xl mx-gutter">
        <div
          onClick={onOpenGlobalSearch}
          className="relative flex items-center cursor-pointer group"
          title="Global Search Across Parts, Barcodes, Customers, Invoices (Ctrl + K)"
        >
          <span className="material-symbols-outlined absolute left-3 text-outline group-hover:text-secondary pointer-events-none text-[18px] transition-colors">
            search
          </span>
          <div className="w-full h-9 pl-9 pr-24 bg-surface-container-low hover:bg-surface-container-lowest border border-surface-container-highest group-hover:border-secondary rounded text-xs text-on-surface flex items-center transition-colors">
            <span className="text-outline text-xs truncate">
              Search by Part # (BP-1234), Mobile, Pulsar 150, Invoice, or Supplier...
            </span>
          </div>
          <div className="absolute right-2 flex items-center gap-1 pointer-events-none">
            <kbd className="px-1.5 py-0.5 bg-surface-container-high border border-surface-container-highest rounded text-[10px] font-mono text-on-surface-variant">
              Ctrl
            </kbd>
            <span className="text-[10px] text-outline font-mono">+</span>
            <kbd className="px-1.5 py-0.5 bg-surface-container-high border border-surface-container-highest rounded text-[10px] font-mono text-on-surface-variant">
              K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right: Quick Actions + Notifications + Role Switcher */}
      <div className="flex items-center gap-space-sm flex-shrink-0">
        {/* Quick Actions (Ctrl + /) */}
        <button
          onClick={onOpenQuickActions}
          className="flex items-center gap-1.5 h-8 px-3 bg-secondary hover:bg-secondary-container text-on-secondary rounded text-xs font-bold transition-colors shadow-xs"
          title="Quick Action Command Menu (Ctrl + /)"
        >
          <span className="material-symbols-outlined text-[16px]">bolt</span>
          <span>Quick Add</span>
          <kbd className="hidden sm:inline px-1 py-0.2 bg-on-secondary-fixed text-on-secondary text-[9px] font-mono rounded">
            Ctrl + /
          </kbd>
        </button>

        {/* Notifications Center Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 rounded hover:bg-surface-container text-on-surface-variant transition-colors"
            title="Notification Center"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-[15px] h-[15px] px-0.5 bg-error text-on-error text-[9px] font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-1.5 w-88 bg-surface-container-lowest border border-surface-container-highest rounded-lg shadow-2xl py-2 z-50 text-xs">
              {/* Notification Header */}
              <div className="px-3.5 pb-2 border-b border-surface-container-high flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-on-surface">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-error-container text-on-error-container text-[10px] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setNotificationFilter(notificationFilter === 'all' ? 'unread' : 'all')
                    }
                    className="text-[10px] text-outline hover:text-on-surface underline"
                  >
                    {notificationFilter === 'all' ? 'Show unread' : 'Show all'}
                  </button>
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-secondary font-semibold hover:underline"
                  >
                    Mark all read
                  </button>
                </div>
              </div>

              {/* Notification List */}
              <div className="divide-y divide-surface-container-high max-h-80 overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                  <div className="p-6 text-center text-outline text-xs">
                    No {notificationFilter === 'unread' ? 'unread ' : ''}notifications at this time.
                  </div>
                ) : (
                  filteredNotifications.map((notif) => {
                    const iconStyle = getNotificationIcon(notif.type);
                    return (
                      <div
                        key={notif.id}
                        className={`p-3 hover:bg-surface-container-low transition-colors flex gap-2.5 ${
                          !notif.isRead ? 'bg-surface-container/30' : ''
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined text-[20px] flex-shrink-0 ${iconStyle.color}`}
                        >
                          {iconStyle.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <span
                              className={`text-xs font-semibold leading-tight ${
                                !notif.isRead ? 'text-on-surface' : 'text-on-surface-variant'
                              }`}
                            >
                              {notif.title}
                            </span>
                            <span className="text-[10px] text-outline whitespace-nowrap">
                              {notif.time}
                            </span>
                          </div>
                          <p className="text-[11px] text-outline mt-0.5 leading-snug">
                            {notif.description}
                          </p>

                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-surface-container-high/30">
                            {notif.actionScreen ? (
                              <button
                                onClick={() => {
                                  setShowNotifications(false);
                                  onNavigate(notif.actionScreen!);
                                }}
                                className="text-[11px] text-secondary font-bold hover:underline flex items-center gap-1"
                              >
                                <span>{notif.actionLabel || 'View Details'}</span>
                                <span className="material-symbols-outlined text-[12px]">
                                  arrow_forward
                                </span>
                              </button>
                            ) : (
                              <span />
                            )}
                            <button
                              onClick={() => handleToggleRead(notif.id)}
                              className="text-[10px] text-outline hover:text-on-surface"
                            >
                              {notif.isRead ? 'Mark unread' : 'Mark read'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-surface-container-high"></div>

        {/* User Profile & Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-space-xs p-1 rounded hover:bg-surface-container transition-colors"
            title="Current Operator Role & Entitlements"
          >
            <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs">
              {userRole === 'billing_operator' ? 'KS' : 'RK'}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="font-semibold text-on-surface text-xs leading-tight">
                {userRole === 'billing_operator' ? 'Kavitha S.' : 'Rajesh Kumar'}
              </span>
              <span className="text-[10px] text-secondary font-bold flex items-center gap-0.5">
                {userRole === 'store_admin'
                  ? 'Store Admin'
                  : userRole === 'manager'
                  ? 'Manager'
                  : 'Billing Operator'}
                <span className="material-symbols-outlined text-[12px]">expand_more</span>
              </span>
            </div>
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-64 bg-surface-container-lowest border border-surface-container-highest rounded-lg shadow-xl py-1 z-50 text-xs">
              <div className="px-3 py-1.5 text-[10px] font-bold text-outline uppercase tracking-wider border-b border-surface-container-high">
                Role-Based Interface
              </div>

              <button
                onClick={() => {
                  if (onUserRoleChange) onUserRoleChange('store_admin');
                  setShowRoleMenu(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-surface-container-low ${
                  userRole === 'store_admin'
                    ? 'bg-surface-container font-bold text-secondary'
                    : 'text-on-surface'
                }`}
              >
                <div>
                  <div className="font-semibold">Store Admin</div>
                  <div className="text-[10px] text-outline">Full system access, profits, audits</div>
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
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-surface-container-low ${
                  userRole === 'manager'
                    ? 'bg-surface-container font-bold text-secondary'
                    : 'text-on-surface'
                }`}
              >
                <div>
                  <div className="font-semibold">Manager</div>
                  <div className="text-[10px] text-outline">Ledgers, payables, stock management</div>
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
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-surface-container-low ${
                  userRole === 'billing_operator'
                    ? 'bg-surface-container font-bold text-secondary'
                    : 'text-on-surface'
                }`}
              >
                <div>
                  <div className="font-semibold">Billing Operator</div>
                  <div className="text-[10px] text-outline">Fast POS &amp; receipts only</div>
                </div>
                {userRole === 'billing_operator' && (
                  <span className="material-symbols-outlined text-secondary text-[16px]">check</span>
                )}
              </button>

              <div className="border-t border-surface-container-high my-1" />

              <button
                onClick={async () => {
                  setShowRoleMenu(false);
                  await logout();
                }}
                className="w-full text-left px-3 py-2 flex items-center gap-2 text-error hover:bg-error-container/20 transition-colors font-semibold"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span>Sign Out of Terminal</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
