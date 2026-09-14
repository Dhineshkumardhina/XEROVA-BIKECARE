import React, { useState } from 'react';
import { CompanyProfile, UserRole } from '../../types';
import { INITIAL_COMPANY_PROFILE } from '../../data/adminSecurityData';

interface CompanySettingsViewProps {
  initialProfile?: CompanyProfile;
  companyProfile?: CompanyProfile;
  userRole: UserRole;
  onSaveProfile?: (profile: CompanyProfile) => void;
  onSaveCompanyProfile?: (profile: CompanyProfile) => void;
  onPreviewInvoice?: (profile: CompanyProfile) => void;
  onTriggerPermissionDenied?: (action: string) => void;
}

export const CompanySettingsView: React.FC<CompanySettingsViewProps> = ({
  initialProfile,
  companyProfile,
  userRole,
  onSaveProfile,
  onSaveCompanyProfile,
  onPreviewInvoice,
  onTriggerPermissionDenied
}) => {
  const profileToUse = companyProfile || initialProfile || INITIAL_COMPANY_PROFILE;
  const [profile, setProfile] = useState<CompanyProfile>(profileToUse);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const isAllowedToEdit = userRole === 'super_admin' || userRole === 'admin' || userRole === 'store_admin';

  const handleChange = (field: keyof CompanyProfile, value: any) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAllowedToEdit) {
      if (onTriggerPermissionDenied) onTriggerPermissionDenied('Update Company Settings');
      return;
    }
    const saveFn = onSaveCompanyProfile || onSaveProfile;
    if (saveFn) saveFn(profile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleCancel = () => {
    setProfile(profileToUse);
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low p-4 rounded border border-surface-container-high">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-primary">business</span>
            <h1 className="text-lg font-bold text-on-surface tracking-tight">Company Profile & Master Configuration</h1>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Configure legal registered entity details, GSTIN tax identification, banking instructions, and billing terms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPreviewInvoice(profile)}
            className="px-3.5 py-1.5 rounded border border-surface-container-highest bg-surface hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            Preview Invoice
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-3 py-1.5 rounded border border-surface-container-highest bg-surface hover:bg-surface-container-high text-on-surface text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded bg-primary text-on-primary hover:bg-primary/90 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            Save Settings
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded text-xs font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>Company profile and billing configurations have been updated successfully.</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="space-y-4">
        {/* Section 1: Firm Entity & Identity */}
        <div className="bg-surface-container-low border border-surface-container-high rounded p-4 space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-surface-container-high">
            <span className="material-symbols-outlined text-[18px] text-secondary">storefront</span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-on-surface">
              1. Firm Legal Entity & Tax Registrations
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
            {/* Firm Name */}
            <div className="sm:col-span-2">
              <label className="block text-outline font-semibold mb-1">Company / Firm Legal Name *</label>
              <input
                type="text"
                required
                value={profile.firmName}
                onChange={(e) => handleChange('firmName', e.target.value)}
                placeholder="e.g. SRI BALAJI MOTORS & SPARES"
                className="w-full px-3 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface font-semibold focus:outline-hidden focus:border-primary"
              />
            </div>

            {/* Tagline */}
            <div>
              <label className="block text-outline font-semibold mb-1">Tagline / Sub-heading</label>
              <input
                type="text"
                value={profile.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                placeholder="Genuine OEM Two-Wheeler Spares"
                className="w-full px-3 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface focus:outline-hidden focus:border-primary"
              />
            </div>

            {/* GSTIN */}
            <div>
              <label className="block text-outline font-semibold mb-1">GSTIN Number (15 Digits) *</label>
              <input
                type="text"
                required
                value={profile.gstin}
                onChange={(e) => handleChange('gstin', e.target.value.toUpperCase())}
                placeholder="33AAAAA0000A1Z5"
                className="w-full px-3 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface font-mono text-[11px] focus:outline-hidden focus:border-primary"
              />
            </div>

            {/* PAN */}
            <div>
              <label className="block text-outline font-semibold mb-1">Income Tax PAN *</label>
              <input
                type="text"
                required
                value={profile.pan}
                onChange={(e) => handleChange('pan', e.target.value.toUpperCase())}
                placeholder="AAAAA0000A"
                className="w-full px-3 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface font-mono text-[11px] focus:outline-hidden focus:border-primary"
              />
            </div>

            {/* Logo URL */}
            <div>
              <label className="block text-outline font-semibold mb-1">Logo URL / Image Path</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={profile.logoUrl}
                  onChange={(e) => handleChange('logoUrl', e.target.value)}
                  placeholder="https://.../logo.png"
                  className="w-full px-3 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface font-mono text-[11px] focus:outline-hidden focus:border-primary"
                />
                {profile.logoUrl && (
                  <img
                    src={profile.logoUrl}
                    alt="Logo Preview"
                    className="w-8 h-8 rounded border border-surface-container-high object-contain bg-white p-0.5 shrink-0"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs pt-2 border-t border-surface-container-high/60">
            <div>
              <label className="block text-outline font-semibold mb-1">Primary Phone / Mobile *</label>
              <input
                type="tel"
                required
                value={profile.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+91 98401 23456"
                className="w-full px-3 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface focus:outline-hidden focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-outline font-semibold mb-1">Alternate Landline / Phone</label>
              <input
                type="tel"
                value={profile.altPhone}
                onChange={(e) => handleChange('altPhone', e.target.value)}
                placeholder="+91 44 2489 1234"
                className="w-full px-3 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface focus:outline-hidden focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-outline font-semibold mb-1">Official Email Address *</label>
              <input
                type="email"
                required
                value={profile.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="billing@sribalajimotors.com"
                className="w-full px-3 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface focus:outline-hidden focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-outline font-semibold mb-1">Company Website</label>
              <input
                type="text"
                value={profile.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="www.sribalajimotors.com"
                className="w-full px-3 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface focus:outline-hidden focus:border-primary"
              />
            </div>
          </div>

          {/* Address Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 text-xs pt-2 border-t border-surface-container-high/60">
            <div className="sm:col-span-2">
              <label className="block text-outline font-semibold mb-1">Registered Street Address *</label>
              <input
                type="text"
                required
                value={profile.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="No. 42/B, 100 Feet Road, Vadapalani"
                className="w-full px-3 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface focus:outline-hidden focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-outline font-semibold mb-1">City *</label>
              <input
                type="text"
                required
                value={profile.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="Chennai"
                className="w-full px-3 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface focus:outline-hidden focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-outline font-semibold mb-1">State & PIN Code *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={profile.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  placeholder="Tamil Nadu"
                  className="w-2/3 px-3 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface focus:outline-hidden focus:border-primary"
                />
                <input
                  type="text"
                  required
                  value={profile.pinCode}
                  onChange={(e) => handleChange('pinCode', e.target.value)}
                  placeholder="600026"
                  className="w-1/3 px-3 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface font-mono text-[11px] focus:outline-hidden focus:border-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Bank Settlement Details */}
        <div className="bg-surface-container-low border border-surface-container-high rounded p-4 space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-surface-container-high">
            <span className="material-symbols-outlined text-[18px] text-secondary">account_balance</span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-on-surface">
              2. Bank Account Details (Printed on Invoices & Estimates)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
            <div>
              <label className="block text-outline font-semibold mb-1">Bank Name *</label>
              <input
                type="text"
                required
                value={profile.bankName}
                onChange={(e) => handleChange('bankName', e.target.value)}
                placeholder="HDFC Bank Ltd"
                className="w-full px-3 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface focus:outline-hidden focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-outline font-semibold mb-1">Account Holder Name *</label>
              <input
                type="text"
                required
                value={profile.accountName}
                onChange={(e) => handleChange('accountName', e.target.value)}
                placeholder="SRI BALAJI MOTORS AND SPARES"
                className="w-full px-3 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface focus:outline-hidden focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-outline font-semibold mb-1">Account Number *</label>
              <input
                type="text"
                required
                value={profile.accountNumber}
                onChange={(e) => handleChange('accountNumber', e.target.value)}
                placeholder="50200049281928"
                className="w-full px-3 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface font-mono text-[11px] focus:outline-hidden focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-outline font-semibold mb-1">Bank IFSC Code *</label>
              <input
                type="text"
                required
                value={profile.ifsc}
                onChange={(e) => handleChange('ifsc', e.target.value.toUpperCase())}
                placeholder="HDFC0001234"
                className="w-full px-3 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface font-mono text-[11px] focus:outline-hidden focus:border-primary"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-outline font-semibold mb-1">Bank Branch Location</label>
              <input
                type="text"
                value={profile.bankBranch}
                onChange={(e) => handleChange('bankBranch', e.target.value)}
                placeholder="Vadapalani Branch, Chennai"
                className="w-full px-3 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface focus:outline-hidden focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Invoice Terms & Footer */}
        <div className="bg-surface-container-low border border-surface-container-high rounded p-4 space-y-3.5">
          <div className="flex items-center gap-2 pb-2 border-b border-surface-container-high">
            <span className="material-symbols-outlined text-[18px] text-secondary">description</span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-on-surface">
              3. Invoice Terms & Conditions & Footer
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 text-xs">
            <div className="lg:col-span-2">
              <label className="block text-outline font-semibold mb-1">
                Standard Terms & Conditions (Printed on Invoices)
              </label>
              <textarea
                rows={5}
                value={profile.termsAndConditions}
                onChange={(e) => handleChange('termsAndConditions', e.target.value)}
                placeholder="1. Goods once sold will not be accepted back after 7 days..."
                className="w-full px-3 py-2 bg-surface border border-surface-container-high rounded text-on-surface font-mono text-[11px] focus:outline-hidden focus:border-primary leading-relaxed"
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-outline font-semibold mb-1">Invoice Footer Greeting</label>
                <textarea
                  rows={2}
                  value={profile.footerText}
                  onChange={(e) => handleChange('footerText', e.target.value)}
                  placeholder="Thank you for your business! Always wear a helmet."
                  className="w-full px-3 py-2 bg-surface border border-surface-container-high rounded text-on-surface text-xs focus:outline-hidden focus:border-primary"
                />
              </div>

              <div className="p-3 bg-surface rounded border border-surface-container-high text-[11px] space-y-1 text-on-surface-variant">
                <div className="font-semibold text-primary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">info</span>
                  Statutory Note
                </div>
                <p>
                  As per Section 31 of the CGST Act, 2017, all B2B tax invoices must include customer GSTIN, HSN codes, and registered business address.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
