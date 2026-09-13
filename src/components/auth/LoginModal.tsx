import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { login, isLoading, loginState, loginErrorMessage } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@BikeERP2026!');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    const result = await login(username.trim(), password);
    if (result.success) {
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    }
  };

  const getAlertBanner = () => {
    if (loginState === 'invalid_credentials') {
      return (
        <div className="mb-4 p-3 rounded bg-error-container/20 border border-error/40 flex items-start gap-2.5">
          <span className="material-symbols-outlined text-error text-[18px] mt-0.5">error</span>
          <div className="text-xs text-error font-medium">
            {loginErrorMessage || 'Invalid username or password. Please verify credentials.'}
          </div>
        </div>
      );
    }

    if (loginState === 'account_disabled') {
      return (
        <div className="mb-4 p-3 rounded bg-tertiary-container/20 border border-tertiary/40 flex items-start gap-2.5">
          <span className="material-symbols-outlined text-tertiary text-[18px] mt-0.5">block</span>
          <div className="text-xs text-tertiary font-medium">
            {loginErrorMessage || 'Your account is deactivated. Contact store administrator.'}
          </div>
        </div>
      );
    }

    if (loginState === 'account_locked') {
      return (
        <div className="mb-4 p-3 rounded bg-error-container/20 border border-error/40 flex items-start gap-2.5">
          <span className="material-symbols-outlined text-error text-[18px] mt-0.5">lock_clock</span>
          <div className="text-xs text-error font-medium">
            {loginErrorMessage || 'Account is temporarily locked due to repeated failed login attempts.'}
          </div>
        </div>
      );
    }

    if (loginState === 'server_unavailable') {
      return (
        <div className="mb-4 p-3 rounded bg-surface-container-high border border-outline/30 flex items-start gap-2.5">
          <span className="material-symbols-outlined text-outline text-[18px] mt-0.5">cloud_off</span>
          <div className="text-xs text-outline font-medium">
            {loginErrorMessage || 'Cannot connect to backend server. Reconnecting...'}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-surface-container-lowest border border-surface-container-highest rounded-lg shadow-2xl overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-surface-container-high">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded bg-primary text-on-primary flex items-center justify-center font-bold text-sm shadow-xs">
              <span className="material-symbols-outlined text-[20px]">two_wheeler</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-on-surface uppercase tracking-wide">
                BIKE ERP Authentication
              </h2>
              <p className="text-[11px] text-outline">
                Motorcycle Spare-Parts &amp; Inventory Management
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-outline hover:text-on-surface rounded hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {getAlertBanner()}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1">
              Username or Email
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">
                person
              </span>
              <input
                type="text"
                required
                disabled={isLoading}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter operator username..."
                className="w-full h-9 pl-9 pr-3 rounded bg-surface-container-low border border-surface-container-highest focus:border-secondary focus:bg-surface-container-lowest text-xs text-on-surface outline-none transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1">
              Account Password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">
                lock
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full h-9 pl-9 pr-9 rounded bg-surface-container-low border border-surface-container-highest focus:border-secondary focus:bg-surface-container-lowest text-xs text-on-surface outline-none transition-colors disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Quick Credential Hints */}
          <div className="p-2.5 rounded bg-surface-container-low border border-surface-container-highest text-[11px] space-y-1">
            <div className="font-semibold text-outline text-[10px] uppercase">Default Credentials:</div>
            <div className="flex justify-between text-on-surface">
              <span>Super Admin: <code className="text-secondary font-mono">admin</code></span>
              <span className="font-mono text-outline">Admin@BikeERP2026!</span>
            </div>
            <div className="flex justify-between text-on-surface">
              <span>Billing Counter: <code className="text-secondary font-mono">kavitha</code></span>
              <span className="font-mono text-outline">Operator@123</span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-9 bg-primary hover:bg-primary-hover text-on-primary font-bold rounded text-xs transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">login</span>
                <span>Sign In to Terminal</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
