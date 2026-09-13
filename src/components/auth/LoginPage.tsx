import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { login, isLoading, loginState, loginErrorMessage } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    const result = await login(username.trim(), password);
    if (result.success) {
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    }
  };

  const handleQuickFill = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
  };

  return (
    <div className="bg-surface min-h-screen flex flex-col md:flex-row font-sans text-on-surface selection:bg-primary selection:text-white">
      {/* Left Panel: Branding & Mission */}
      <div className="hidden md:flex flex-col justify-center items-start w-1/2 bg-surface-container-low border-r border-outline-variant p-[8%] lg:p-[10%] relative overflow-hidden">
        {/* Minimal Graphic Grid Element */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }}
        />

        <div className="relative z-10 max-w-lg">
          {/* Logo & Header */}
          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-secondary via-primary to-secondary text-white flex items-center justify-center shadow-md border border-secondary/20">
              <span className="material-symbols-outlined text-[30px]">two_wheeler</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl text-primary tracking-tight font-extrabold flex items-center gap-1.5">
                <span className="text-secondary font-black">XEROVA</span> BIKE SOFTWARE
              </span>
              <span className="text-[11px] text-on-surface-variant uppercase tracking-widest font-semibold">
                Professional Bike Care &amp; Workshop ERP
              </span>
            </div>
          </div>

          <h1 className="text-3xl lg:text-4xl font-bold text-primary mb-4 tracking-tight leading-tight">
            Smart Care &amp; Management for Every Two-Wheeler
          </h1>

          <p className="text-base text-on-surface-variant leading-relaxed mb-8">
            High-speed counter POS, complete spare-part inventory, automated GST compliance, and precision diagnostics for two-wheeler service workshops and spare-parts retailers.
          </p>

          <div className="flex flex-wrap gap-2.5 pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container border border-outline-variant rounded text-xs font-medium text-on-surface">
              <span className="material-symbols-outlined text-[16px] text-primary">two_wheeler</span>
              Bike Spares Master
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container border border-outline-variant rounded text-xs font-medium text-on-surface">
              <span className="material-symbols-outlined text-[16px] text-primary">point_of_sale</span>
              Fast POS Billing (F4)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container border border-outline-variant rounded text-xs font-medium text-on-surface">
              <span className="material-symbols-outlined text-[16px] text-primary">receipt_long</span>
              GST &amp; Accounts Ledger
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container border border-outline-variant rounded text-xs font-medium text-on-surface">
              <span className="material-symbols-outlined text-[16px] text-primary">engineering</span>
              Mechanic &amp; Workshop Care
            </span>
          </div>
        </div>

        {/* Institutional Footer */}
        <div className="absolute bottom-[6%] left-[8%] lg:left-[10%] z-10">
          <p className="font-mono text-xs text-on-surface-variant opacity-70 uppercase tracking-widest">
            XEROVA BIKE SOFTWARE v4.2 • Certified Two-Wheeler ERP Platform
          </p>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-surface-container-lowest p-6 sm:p-12 md:p-16 min-h-screen">
        <div className="w-full max-w-sm">
          {/* Mobile Header (Visible only on small screens) */}
          <div className="md:hidden mb-8 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-secondary via-primary to-secondary text-white flex items-center justify-center mb-2 shadow-sm">
              <span className="material-symbols-outlined text-[28px]">two_wheeler</span>
            </div>
            <h1 className="text-2xl font-bold text-primary">
              <span className="text-secondary font-black">XEROVA</span> BIKE SOFTWARE
            </h1>
            <p className="text-xs text-on-surface-variant uppercase tracking-wider">
              Bike Service &amp; Spare Parts Management
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-primary mb-1 tracking-tight">Welcome Back</h2>
            <p className="text-sm text-on-surface-variant">Sign in to your Xerova Bike Software account</p>
          </div>

          {/* Security Portal Note */}
          <div className="flex items-center gap-2 px-3 py-2 mb-6 bg-surface-container border border-outline-variant rounded text-xs font-medium text-on-surface">
            <span className="material-symbols-outlined text-primary text-[18px]">handyman</span>
            <span>Service Bay &amp; Care Team Portal</span>
          </div>

          {/* Alert / Error Banner */}
          {loginState === 'invalid_credentials' && (
            <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-red-600 text-[18px] mt-0.5">error</span>
              <div className="text-xs text-red-700 font-medium">
                {loginErrorMessage || 'Invalid username or password. Please verify credentials.'}
              </div>
            </div>
          )}

          {loginState === 'account_disabled' && (
            <div className="mb-4 p-3 rounded bg-amber-50 border border-amber-200 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-amber-600 text-[18px] mt-0.5">block</span>
              <div className="text-xs text-amber-700 font-medium">
                {loginErrorMessage || 'Your account is deactivated. Contact store administrator.'}
              </div>
            </div>
          )}

          {loginState === 'account_locked' && (
            <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-red-600 text-[18px] mt-0.5">lock_clock</span>
              <div className="text-xs text-red-700 font-medium">
                {loginErrorMessage || 'Account is temporarily locked due to repeated failed login attempts.'}
              </div>
            </div>
          )}

          {loginState === 'server_unavailable' && (
            <div className="mb-4 p-3 rounded bg-slate-100 border border-slate-300 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-slate-600 text-[18px] mt-0.5">cloud_off</span>
              <div className="text-xs text-slate-700 font-medium">
                {loginErrorMessage || 'Offline Mode: Local credentials verified.'}
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5" htmlFor="officer-id">
                Email or Technician ID
              </label>
              <input
                className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
                id="officer-id"
                placeholder="name@bikeworkshop.com or admin"
                required
                disabled={isLoading}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                type="text"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  className="w-full h-10 px-3 pr-10 bg-surface-container-lowest border border-outline-variant rounded text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50"
                  id="password"
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? 'text' : 'password'}
                />
                <button
                  aria-label="Toggle password visibility"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center"
                  id="toggle-password"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]" id="toggle-icon">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary focus:ring-offset-0 bg-surface-container-lowest cursor-pointer"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="text-xs text-on-surface-variant group-hover:text-on-surface transition-colors">
                  Remember me
                </span>
              </label>
              <button
                type="button"
                onClick={() => alert('Please contact your Store Administrator (admin@bikecare.erp) to reset your password.')}
                className="text-xs font-medium text-primary hover:underline underline-offset-2"
              >
                Forgot password?
              </button>
            </div>

            <div className="pt-2">
              <button
                className="w-full h-11 flex justify-center items-center gap-2 bg-primary text-on-primary font-semibold text-sm rounded hover:bg-slate-800 active:scale-[0.99] transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60 cursor-pointer"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Bike Care</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Demo Sign-in Helpers */}
            <div className="pt-4 border-t border-outline-variant">
              <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-2 text-center">
                Quick Demo Accounts
              </p>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin', 'Admin@123')}
                  className="px-2 py-1.5 text-[11px] font-medium bg-surface-container hover:bg-surface-container-high border border-outline-variant rounded text-on-surface transition-colors truncate"
                  title="Super Admin (admin / Admin@123)"
                >
                  👑 Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('billing', 'Billing@123')}
                  className="px-2 py-1.5 text-[11px] font-medium bg-surface-container hover:bg-surface-container-high border border-outline-variant rounded text-on-surface transition-colors truncate"
                  title="Billing Operator (billing / Billing@123)"
                >
                  💳 Billing
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('purchase', 'Purchase@123')}
                  className="px-2 py-1.5 text-[11px] font-medium bg-surface-container hover:bg-surface-container-high border border-outline-variant rounded text-on-surface transition-colors truncate"
                  title="Purchase Mgr (purchase / Purchase@123)"
                >
                  📦 Purchase
                </button>
              </div>
            </div>

            <div className="pt-2 text-center">
              <p className="text-xs text-on-surface-variant">
                Need service desk access?{' '}
                <button
                  type="button"
                  onClick={() => alert('Please contact the workshop manager or IT administrator.')}
                  className="font-semibold text-primary hover:underline underline-offset-2 ml-1"
                >
                  Contact Shop Manager
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
