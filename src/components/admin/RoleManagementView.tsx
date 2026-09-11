import React, { useState } from 'react';
import { UserRole, PermissionKey } from '../../types';
import {
  PERMISSION_CATEGORIES,
  ALL_PERMISSION_KEYS,
  DEFAULT_ROLE_PERMISSIONS
} from '../../data/adminSecurityData';

interface RoleManagementViewProps {
  userRole: UserRole;
  rolePermissions: Record<UserRole, PermissionKey[]>;
  onSaveRolePermissions: (role: UserRole, permissions: PermissionKey[]) => void;
  onTriggerPermissionDenied?: (action: string) => void;
}

export const RoleManagementView: React.FC<RoleManagementViewProps> = ({
  userRole,
  rolePermissions,
  onSaveRolePermissions,
  onTriggerPermissionDenied
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('billing_operator');
  const [currentPermissions, setCurrentPermissions] = useState<PermissionKey[]>(
    rolePermissions[selectedRole] || []
  );
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const rolesList: { role: UserRole; label: string; desc: string; icon: string }[] = [
    { role: 'super_admin', label: 'Super Admin', desc: 'Unrestricted enterprise authority across all branches', icon: 'shield_person' },
    { role: 'admin', label: 'Admin', desc: 'Store administration, company configuration & user control', icon: 'admin_panel_settings' },
    { role: 'manager', label: 'Manager', desc: 'Day-to-day store operations, discounts & approvals', icon: 'badge' },
    { role: 'billing_operator', label: 'Billing Operator', desc: 'Counter POS, invoicing & basic customer search', icon: 'point_of_sale' },
    { role: 'purchase_operator', label: 'Purchase Operator', desc: 'Supplier orders, GRN, inward freight & vendor costs', icon: 'local_shipping' },
    { role: 'accounts_operator', label: 'Accounts Operator', desc: 'Receipts, payments, bank ledger & GST filings', icon: 'account_balance' },
    { role: 'inventory_operator', label: 'Inventory Operator', desc: 'Stock physical counts, adjustments & barcode labels', icon: 'inventory_2' },
    { role: 'viewer', label: 'Viewer', desc: 'Read-only access for external accountants & auditors', icon: 'visibility' }
  ];

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    setCurrentPermissions(rolePermissions[role] || []);
  };

  const isSuperAdminRole = selectedRole === 'super_admin';
  const isUserAllowedToEdit = userRole === 'super_admin' || userRole === 'admin';

  // Toggle single permission
  const handleTogglePermission = (key: PermissionKey) => {
    if (!isUserAllowedToEdit) {
      if (onTriggerPermissionDenied) onTriggerPermissionDenied('Modify Role Permissions');
      return;
    }
    if (isSuperAdminRole) return; // Super admin always has all permissions

    if (currentPermissions.includes(key)) {
      setCurrentPermissions(currentPermissions.filter(k => k !== key));
    } else {
      setCurrentPermissions([...currentPermissions, key]);
    }
  };

  // Toggle Category
  const handleToggleCategory = (catPermissions: PermissionKey[]) => {
    if (!isUserAllowedToEdit) {
      if (onTriggerPermissionDenied) onTriggerPermissionDenied('Modify Role Permissions');
      return;
    }
    if (isSuperAdminRole) return;

    const allInCat = catPermissions.every(k => currentPermissions.includes(k));
    if (allInCat) {
      // Remove all in category
      setCurrentPermissions(currentPermissions.filter(k => !catPermissions.includes(k)));
    } else {
      // Add missing in category
      const toAdd = catPermissions.filter(k => !currentPermissions.includes(k));
      setCurrentPermissions([...currentPermissions, ...toAdd]);
    }
  };

  // Allow All
  const handleAllowAll = () => {
    if (!isUserAllowedToEdit) {
      if (onTriggerPermissionDenied) onTriggerPermissionDenied('Modify Role Permissions');
      return;
    }
    setCurrentPermissions([...ALL_PERMISSION_KEYS]);
  };

  // Deny All
  const handleDenyAll = () => {
    if (!isUserAllowedToEdit) {
      if (onTriggerPermissionDenied) onTriggerPermissionDenied('Modify Role Permissions');
      return;
    }
    if (isSuperAdminRole) return;
    setCurrentPermissions([]);
  };

  // Reset to Default
  const handleResetToDefault = () => {
    if (!isUserAllowedToEdit) {
      if (onTriggerPermissionDenied) onTriggerPermissionDenied('Modify Role Permissions');
      return;
    }
    setCurrentPermissions(DEFAULT_ROLE_PERMISSIONS[selectedRole] || []);
  };

  // Save changes
  const handleSave = () => {
    if (!isUserAllowedToEdit) {
      if (onTriggerPermissionDenied) onTriggerPermissionDenied('Save Role Permissions');
      return;
    }
    onSaveRolePermissions(selectedRole, currentPermissions);
    setSaveToast(`Permissions for role "${rolesList.find(r => r.role === selectedRole)?.label}" saved.`);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const selectedRoleObj = rolesList.find(r => r.role === selectedRole);

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low p-4 rounded border border-surface-container-high">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-primary">policy</span>
            <h1 className="text-lg font-bold text-on-surface tracking-tight">Role & Permission Matrix</h1>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-surface-container rounded border border-surface-container-high text-outline">
              8 Standard Role Profiles
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Configure granular access controls and protect sensitive purchase costs, margin profitability, and administrative functions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetToDefault}
            className="px-3 py-1.5 rounded border border-surface-container-highest bg-surface hover:bg-surface-container-high text-on-surface text-xs font-medium transition-colors"
          >
            Reset Defaults
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded bg-primary text-on-primary hover:bg-primary/90 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            Save Permissions
          </button>
        </div>
      </div>

      {saveToast && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{saveToast}</span>
          </div>
          <button onClick={() => setSaveToast(null)} className="text-outline hover:text-on-surface">
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        </div>
      )}

      {/* Main Container: Left Sidebar Roles List + Right Permissions Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Roles List */}
        <div className="lg:col-span-1 bg-surface-container-low border border-surface-container-high rounded p-2.5 space-y-1">
          <div className="px-2.5 py-1.5 text-[11px] font-semibold text-outline uppercase tracking-wider">
            Select Role to Configure
          </div>

          {rolesList.map((r) => {
            const isSelected = selectedRole === r.role;
            const permCount = (rolePermissions[r.role] || []).length;

            return (
              <button
                key={r.role}
                onClick={() => handleSelectRole(r.role)}
                className={`w-full text-left p-2.5 rounded transition-colors flex items-start gap-2.5 border ${
                  isSelected
                    ? 'bg-secondary text-on-secondary border-secondary shadow-xs font-semibold'
                    : 'bg-surface hover:bg-surface-container-high text-on-surface border-surface-container-high'
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] mt-0.5 ${isSelected ? 'text-on-secondary' : 'text-outline'}`}>
                  {r.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs truncate">{r.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                        isSelected
                          ? 'bg-on-secondary-fixed text-on-secondary'
                          : 'bg-surface-container text-outline'
                      }`}
                    >
                      {permCount}/{ALL_PERMISSION_KEYS.length}
                    </span>
                  </div>
                  <div className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-on-secondary/85' : 'text-outline'}`}>
                    {r.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Permissions Matrix Panel */}
        <div className="lg:col-span-3 bg-surface-container-low border border-surface-container-high rounded p-4 space-y-4">
          {/* Active Role Banner & Master Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-surface border border-surface-container-high rounded">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-primary">verified_user</span>
                <span className="font-bold text-sm text-on-surface">
                  {selectedRoleObj?.label} Matrix
                </span>
                {isSuperAdminRole && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                    LOCKED FULL ACCESS
                  </span>
                )}
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {selectedRoleObj?.desc}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAllowAll}
                disabled={isSuperAdminRole}
                className="px-2.5 py-1 text-xs rounded bg-surface border border-surface-container-high hover:bg-surface-container text-on-surface disabled:opacity-50"
              >
                Allow All
              </button>
              <button
                type="button"
                onClick={handleDenyAll}
                disabled={isSuperAdminRole}
                className="px-2.5 py-1 text-xs rounded bg-surface border border-surface-container-high hover:bg-surface-container text-error disabled:opacity-50"
              >
                Deny All
              </button>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="space-y-4">
            {PERMISSION_CATEGORIES.map((categoryGroup) => {
              const catKeys = categoryGroup.permissions.map((p) => p.key);
              const allowedInCat = catKeys.filter((k) => currentPermissions.includes(k)).length;
              const allChecked = allowedInCat === catKeys.length;
              const isIndeterminate = allowedInCat > 0 && allowedInCat < catKeys.length;

              return (
                <div
                  key={categoryGroup.category}
                  className="border border-surface-container-high rounded overflow-hidden bg-surface"
                >
                  {/* Category Header with Category-level toggle */}
                  <div className="px-3.5 py-2.5 bg-surface-container border-b border-surface-container-high flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={allChecked}
                        ref={(el) => {
                          if (el) el.indeterminate = isIndeterminate;
                        }}
                        disabled={isSuperAdminRole}
                        onChange={() => handleToggleCategory(catKeys)}
                        className="w-4 h-4 rounded text-primary focus:ring-0 cursor-pointer disabled:cursor-not-allowed"
                      />
                      <span className="font-bold text-xs text-on-surface uppercase tracking-wider">
                        {categoryGroup.categoryLabel}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-outline">
                      {allowedInCat} / {catKeys.length} enabled
                    </span>
                  </div>

                  {/* Permissions Checklist in Category */}
                  <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {categoryGroup.permissions.map((perm) => {
                      const isGranted = currentPermissions.includes(perm.key);

                      return (
                        <label
                          key={perm.key}
                          className={`flex items-start gap-2.5 p-2 rounded border transition-colors cursor-pointer ${
                            isGranted
                              ? 'bg-secondary/5 border-secondary/25 text-on-surface'
                              : 'bg-surface-container-low/40 border-surface-container-high/60 text-outline hover:text-on-surface'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isGranted}
                            disabled={isSuperAdminRole}
                            onChange={() => handleTogglePermission(perm.key)}
                            className="w-3.5 h-3.5 mt-0.5 rounded text-primary focus:ring-0 cursor-pointer disabled:cursor-not-allowed"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-xs leading-tight">
                              {perm.label}
                            </div>
                            <div className="text-[11px] text-outline mt-0.5 leading-normal">
                              {perm.description}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
