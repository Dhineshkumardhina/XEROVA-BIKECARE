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
  const [selectedBranch, setSelectedBranch] = useState('Main Branch - Chennai');
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
        return { icon: 'error', color: 'text-rose-500' };
      case 'low_stock':
        return { icon: 'warning', color: 'text-amber-500' };
      case 'outstanding_payment':
        return { icon: 'pending_actions', color: 'text-blue-500' };
      case 'gst_error':
        return { icon: 'report', color: 'text-rose-500' };
      case 'backup_completed':
        return { icon: 'check_circle', color: 'text-emerald-500' };
      case 'backup_failed':
        return { icon: 'cloud_off', color: 'text-rose-500' };
      case 'permission_request':
        return { icon: 'admin_panel_settings', color: 'text-blue-500' };
      default:
        return { icon: 'notifications', color: 'text-slate-400' };
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-200/80 z-50 flex items-center justify-between px-4 select-none shadow-xs">
      {/* Left: Brand Logo + Branch Selector */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <div
          className="flex items-center gap-2.5 cursor-pointer group"
          onClick={() => onNavigate('dashboard')}
          title="Go to Dashboard"
        >
          <img src="/logo.png" alt="Xerova Logo" className="w-9 h-9 object-contain drop-shadow-sm group-hover:scale-105 transition-transform" />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5 leading-none">
              <span>XEROVA</span>
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                BIKE ERP
              </span>
            </span>
          </div>
        </div>

        <div className="h-5 w-px bg-slate-200"></div>

        {/* Branch Selector */}
        <div className="relative">
          <button
            onClick={() => setShowBranchMenu(!showBranchMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition-colors text-xs font-medium"
          >
            <span className="material-symbols-outlined text-slate-500 text-[15px]">
              storefront
            </span>
            <span className="truncate max-w-[150px]">{selectedBranch}</span>
            <span className="material-symbols-outlined text-slate-400 text-[14px]">
              expand_more
            </span>
          </button>

          {showBranchMenu && (
            <div className="absolute top-full left-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 text-xs">
              <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Select Store Branch
              </div>
              <button
                onClick={() => {
                  setSelectedBranch('Main Branch - Chennai');
                  setShowBranchMenu(false);
                }}
                className={`w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between ${
                  selectedBranch.includes('Chennai')
                    ? 'bg-blue-50 font-semibold text-blue-600'
                    : 'text-slate-700'
                }`}
              >
                <span>Main Branch - Chennai</span>
                {selectedBranch.includes('Chennai') && (
                  <span className="material-symbols-outlined text-[14px]">check</span>
                )}
              </button>
              <button
                onClick={() => {
                  setSelectedBranch('Hub Warehouse - Ambattur');
                  setShowBranchMenu(false);
                }}
                className={`w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between ${
                  selectedBranch.includes('Ambattur')
                    ? 'bg-blue-50 font-semibold text-blue-600'
                    : 'text-slate-700'
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
                className={`w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between ${
                  selectedBranch.includes('Guindy')
                    ? 'bg-blue-50 font-semibold text-blue-600'
                    : 'text-slate-700'
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
      </div>

      {/* Center: Minimalist Global Search (Ctrl + K) */}
      <div className="flex-1 max-w-lg mx-6">
        <div
          onClick={onOpenGlobalSearch}
          className="relative flex items-center cursor-pointer group"
          title="Search parts, customers, invoices (Ctrl + K)"
        >
          <span className="material-symbols-outlined absolute left-3 text-slate-400 group-hover:text-blue-600 pointer-events-none text-[18px] transition-colors">
            search
          </span>
          <div className="w-full h-9 pl-9 pr-18 bg-slate-50 group-hover:bg-white border border-slate-200 group-hover:border-blue-400 rounded-lg text-xs text-slate-700 flex items-center transition-all shadow-xs">
            <span className="text-slate-400 text-xs truncate">
              Search parts, bikes, invoices, customers...
            </span>
          </div>
          <div className="absolute right-2.5 flex items-center pointer-events-none">
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-500 shadow-2xs">
              Ctrl+K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right: Quick Action + Notifications + User Avatar */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        {/* Quick Add Button */}
        <button
          onClick={onOpenQuickActions}
          className="flex items-center gap-1.5 h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer"
          title="Quick Action Command Menu (Ctrl + /)"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span>Quick Add</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[19px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[14px] h-[14px] px-0.5 bg-rose-500 text-white text-[9px] font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-1.5 w-80 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 text-xs">
              <div className="px-3.5 pb-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-50 text-rose-600 text-[10px] font-semibold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setNotificationFilter(notificationFilter === 'all' ? 'unread' : 'all')
                    }
                    className="text-[10px] text-slate-500 hover:text-slate-900 underline"
                  >
                    {notificationFilter === 'all' ? 'Unread only' : 'All'}
                  </button>
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-blue-600 font-semibold hover:underline"
                  >
                    Mark all read
                  </button>
                </div>
              </div>

              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    No notifications at this time.
                  </div>
                ) : (
                  filteredNotifications.map((notif) => {
                    const iconStyle = getNotificationIcon(notif.type);
                    return (
                      <div
                        key={notif.id}
                        className={`p-3 hover:bg-slate-50 transition-colors flex gap-2.5 ${
                          !notif.isRead ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <span
                          className={`material-symbols-outlined text-[18px] flex-shrink-0 ${iconStyle.color}`}
                        >
                          {iconStyle.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <span
                              className={`text-xs font-semibold leading-tight ${
                                !notif.isRead ? 'text-slate-900' : 'text-slate-600'
                              }`}
                            >
                              {notif.title}
                            </span>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">
                              {notif.time}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            {notif.description}
                          </p>

                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
                            {notif.actionScreen ? (
                              <button
                                onClick={() => {
                                  setShowNotifications(false);
                                  onNavigate(notif.actionScreen!);
                                }}
                                className="text-[11px] text-blue-600 font-semibold hover:underline flex items-center gap-1"
                              >
                                <span>{notif.actionLabel || 'View'}</span>
                                <span className="material-symbols-outlined text-[12px]">
                                  arrow_forward
                                </span>
                              </button>
                            ) : (
                              <span />
                            )}
                            <button
                              onClick={() => handleToggleRead(notif.id)}
                              className="text-[10px] text-slate-400 hover:text-slate-700"
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

        <div className="h-5 w-px bg-slate-200"></div>

        {/* User Profile & Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="User Profile"
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              {userRole === 'billing_operator' ? 'KS' : 'RK'}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="font-semibold text-slate-800 text-xs leading-tight">
                {userRole === 'billing_operator' ? 'Kavitha S.' : 'Rajesh Kumar'}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {userRole === 'store_admin'
                  ? 'Store Admin'
                  : userRole === 'manager'
                  ? 'Manager'
                  : 'Billing Operator'}
              </span>
            </div>
            <span className="material-symbols-outlined text-slate-400 text-[14px]">
              expand_more
            </span>
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-60 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 text-xs">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                Switch Role Mode
              </div>

              <button
                onClick={() => {
                  if (onUserRoleChange) onUserRoleChange('store_admin');
                  setShowRoleMenu(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 ${
                  userRole === 'store_admin'
                    ? 'bg-blue-50 font-semibold text-blue-600'
                    : 'text-slate-700'
                }`}
              >
                <div>
                  <div className="font-semibold">Store Admin</div>
                  <div className="text-[10px] text-slate-400">Full system access</div>
                </div>
                {userRole === 'store_admin' && (
                  <span className="material-symbols-outlined text-blue-600 text-[16px]">check</span>
                )}
              </button>

              <button
                onClick={() => {
                  if (onUserRoleChange) onUserRoleChange('manager');
                  setShowRoleMenu(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 ${
                  userRole === 'manager'
                    ? 'bg-blue-50 font-semibold text-blue-600'
                    : 'text-slate-700'
                }`}
              >
                <div>
                  <div className="font-semibold">Manager</div>
                  <div className="text-[10px] text-slate-400">Ledgers &amp; stock management</div>
                </div>
                {userRole === 'manager' && (
                  <span className="material-symbols-outlined text-blue-600 text-[16px]">check</span>
                )}
              </button>

              <button
                onClick={() => {
                  if (onUserRoleChange) onUserRoleChange('billing_operator');
                  setShowRoleMenu(false);
                }}
                className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 ${
                  userRole === 'billing_operator'
                    ? 'bg-blue-50 font-semibold text-blue-600'
                    : 'text-slate-700'
                }`}
              >
                <div>
                  <div className="font-semibold">Billing Operator</div>
                  <div className="text-[10px] text-slate-400">Fast POS &amp; receipts</div>
                </div>
                {userRole === 'billing_operator' && (
                  <span className="material-symbols-outlined text-blue-600 text-[16px]">check</span>
                )}
              </button>

              <div className="border-t border-slate-100 my-1" />

              <button
                onClick={async () => {
                  setShowRoleMenu(false);
                  await logout();
                }}
                className="w-full text-left px-3 py-2 flex items-center gap-2 text-rose-600 hover:bg-rose-50 transition-colors font-semibold"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

