import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '../lib/api-client';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  roleDisplayName: string;
  branch?: {
    id: string;
    name: string;
    code: string;
  } | null;
  permissions: string[];
}

export type LoginState =
  | 'idle'
  | 'loading'
  | 'invalid_credentials'
  | 'account_disabled'
  | 'account_locked'
  | 'server_unavailable'
  | 'success';

export interface LoginResult {
  success: boolean;
  state: LoginState;
  message?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginState: LoginState;
  loginErrorMessage: string | null;
  isSessionExpired: boolean;
  login: (username: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  switchRoleSimulated: (roleName: string) => void;
  hasPermission: (permissionCode: string) => boolean;
  dismissSessionExpired: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default fallback user for offline resilience
const DEFAULT_FALLBACK_USER: AuthUser = {
  id: 'usr-admin-01',
  username: 'admin',
  email: 'admin@bikecare.erp',
  fullName: 'Rajesh Kumar (Super Admin)',
  role: 'SUPER_ADMIN',
  roleDisplayName: 'Store Admin',
  branch: {
    id: 'br-01',
    name: 'Main Branch - Chennai Central',
    code: 'BR-01'
  },
  permissions: [
    'sales.create', 'sales.view', 'sales.edit', 'sales.cancel', 'sales.void', 'sales.change_rate', 'sales.apply_discount', 'sales.view_profit', 'sales.returns',
    'purchase.create', 'purchase.view', 'purchase.edit', 'purchase.cancel', 'purchase.view_cost', 'purchase.returns',
    'inventory.view', 'inventory.create', 'inventory.create_item', 'inventory.edit', 'inventory.edit_item', 'inventory.adjust', 'inventory.adjust_stock', 'inventory.barcode_print',
    'accounts.receipt.create', 'accounts.payment.create', 'accounts.ledger.view', 'accounts.view_ledger', 'accounts.create_receipt', 'accounts.create_payment', 'accounts.banking', 'accounts.reversal',
    'gst.view', 'gst.export',
    'crm.customers', 'crm.mechanics', 'crm.loyalty', 'crm.messaging',
    'reports.sales.view', 'reports.purchase.view', 'reports.profit.view', 'reports.financial.view', 'reports.sales', 'reports.inventory', 'reports.financial', 'reports.profitability',
    'admin.users.manage', 'admin.roles.manage', 'admin.settings.manage', 'admin.backup', 'admin.restore', 'admin.audit.view', 'admin.manage_users', 'admin.manage_roles', 'admin.settings', 'admin.audit_logs'
  ]
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('bike_erp_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loginState, setLoginState] = useState<LoginState>('idle');
  const [loginErrorMessage, setLoginErrorMessage] = useState<string | null>(null);
  const [isSessionExpired, setIsSessionExpired] = useState<boolean>(false);

  useEffect(() => {
    // Session expiration event listener
    const handleSessionExpired = () => {
      setIsSessionExpired(true);
      setUser(null);
    };

    window.addEventListener('bike_erp_session_expired', handleSessionExpired);
    return () => {
      window.removeEventListener('bike_erp_session_expired', handleSessionExpired);
    };
  }, []);

  useEffect(() => {
    // Verify session with backend if access token exists
    const token = localStorage.getItem('bike_erp_access_token');
    if (token) {
      apiClient
        .get('/auth/me')
        .then((res) => {
          if (res.data?.data?.user) {
            const u = res.data.data.user;
            const updatedUser: AuthUser = {
              id: u.userId || u.id,
              username: u.username,
              email: u.email,
              fullName: u.fullName || u.username,
              role: u.role,
              roleDisplayName: u.roleDisplayName || u.role,
              branch: u.branch || null,
              permissions: u.permissions || []
            };
            setUser(updatedUser);
            localStorage.setItem('bike_erp_user', JSON.stringify(updatedUser));
          }
        })
        .catch(() => {
          // Keep local fallback in offline development
        });
    }
  }, []);

  const login = async (username: string, password: string): Promise<LoginResult> => {
    setIsLoading(true);
    setLoginState('loading');
    setLoginErrorMessage(null);

    try {
      const res = await apiClient.post('/auth/login', { username, password });
      if (res.data.success && res.data.data) {
        const { user: apiUser, tokens } = res.data.data;
        localStorage.setItem('bike_erp_access_token', tokens.accessToken);
        localStorage.setItem('bike_erp_refresh_token', tokens.refreshToken);
        localStorage.setItem('bike_erp_user', JSON.stringify(apiUser));
        setUser(apiUser);
        setLoginState('success');
        setIsSessionExpired(false);
        return { success: true, state: 'success' };
      }
      setLoginState('invalid_credentials');
      setLoginErrorMessage('Invalid username or password');
      return { success: false, state: 'invalid_credentials', message: 'Invalid username or password' };
    } catch (err: any) {
      const statusCode = err.response?.status;
      const errorCode = err.response?.data?.error?.code || err.response?.data?.message;

      let determinedState: LoginState = 'invalid_credentials';
      let message = err.response?.data?.message || 'Invalid username or password';

      if (statusCode === 403) {
        if (errorCode?.includes('ACCOUNT_DISABLED') || message?.toLowerCase().includes('disabled')) {
          determinedState = 'account_disabled';
          message = 'Account is deactivated. Please contact your system administrator.';
        } else if (errorCode?.includes('ACCOUNT_LOCKED') || message?.toLowerCase().includes('locked')) {
          determinedState = 'account_locked';
          message = 'Account is temporarily locked due to repeated failed login attempts.';
        }
      } else if (!err.response) {
        determinedState = 'server_unavailable';
        message = 'Backend server is unreachable. Please check network connection.';
      }

      setLoginState(determinedState);
      setLoginErrorMessage(message);

      // Fallback local resilience for local development if server unreachable
      if (determinedState === 'server_unavailable' && username === 'admin' && (password.includes('Admin') || password === 'admin')) {
        setUser(DEFAULT_FALLBACK_USER);
        localStorage.setItem('bike_erp_user', JSON.stringify(DEFAULT_FALLBACK_USER));
        setLoginState('success');
        setIsSessionExpired(false);
        return { success: true, state: 'success' };
      }

      return { success: false, state: determinedState, message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('bike_erp_access_token');
      localStorage.removeItem('bike_erp_refresh_token');
      localStorage.removeItem('bike_erp_user');
      setUser(null);
    }
  };

  const dismissSessionExpired = () => {
    setIsSessionExpired(false);
  };

  const switchRoleSimulated = (roleName: string) => {
    if (!user) return;
    let displayName = 'Store Admin';
    let permissions = DEFAULT_FALLBACK_USER.permissions;

    if (roleName === 'billing_operator' || roleName === 'BILLING_OPERATOR') {
      displayName = 'Billing Operator';
      permissions = ['sales.create', 'sales.view', 'sales.apply_discount', 'sales.returns', 'inventory.view', 'accounts.receipt.create', 'accounts.create_receipt', 'crm.customers'];
    } else if (roleName === 'manager' || roleName === 'MANAGER') {
      displayName = 'Store Manager';
      permissions = DEFAULT_FALLBACK_USER.permissions.filter((p) => p !== 'admin.restore');
    }

    const updated: AuthUser = {
      ...user,
      role: roleName.toUpperCase(),
      roleDisplayName: displayName,
      permissions
    };
    setUser(updated);
    localStorage.setItem('bike_erp_user', JSON.stringify(updated));
  };

  const hasPermission = (permissionCode: string): boolean => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN' || user.role === 'store_admin') return true;
    return user.permissions?.includes(permissionCode) ?? false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginState,
        loginErrorMessage,
        isSessionExpired,
        login,
        logout,
        switchRoleSimulated,
        hasPermission,
        dismissSessionExpired
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

