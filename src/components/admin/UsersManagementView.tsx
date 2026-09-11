import React, { useState, useMemo } from 'react';
import { ERPUser, UserRole } from '../../types';
import { INITIAL_BRANCHES } from '../../data/adminSecurityData';

interface UsersManagementViewProps {
  users: ERPUser[];
  userRole: UserRole;
  onAddUser: (user: ERPUser) => void;
  onUpdateUser: (user: ERPUser) => void;
  onToggleUserStatus: (userId: string) => void;
  onResetPassword: (userId: string, username: string) => void;
  onViewUserActivity: (username: string) => void;
  onTriggerPermissionDenied?: (action: string) => void;
}

export const UsersManagementView: React.FC<UsersManagementViewProps> = ({
  users,
  userRole,
  onAddUser,
  onUpdateUser,
  onToggleUserStatus,
  onResetPassword,
  onViewUserActivity,
  onTriggerPermissionDenied
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ERPUser | null>(null);
  const [resettingUser, setResettingUser] = useState<ERPUser | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    mobile: '',
    email: '',
    role: 'billing_operator' as UserRole,
    branch: 'Main Branch - Chennai Central',
    status: 'Active' as 'Active' | 'Inactive',
    password: '',
    confirmPassword: ''
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Reset Password Form State
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  const isAdminOrSuper = userRole === 'admin' || userRole === 'super_admin' || userRole === 'store_admin';

  // Open Add Modal
  const handleOpenAdd = () => {
    if (!isAdminOrSuper) {
      if (onTriggerPermissionDenied) onTriggerPermissionDenied('Add New User');
      return;
    }
    setFormData({
      fullName: '',
      username: '',
      mobile: '',
      email: '',
      role: 'billing_operator',
      branch: 'Main Branch - Chennai Central',
      status: 'Active',
      password: '',
      confirmPassword: ''
    });
    setFormError(null);
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (user: ERPUser) => {
    if (!isAdminOrSuper) {
      if (onTriggerPermissionDenied) onTriggerPermissionDenied('Edit User Account');
      return;
    }
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      username: user.username,
      mobile: user.mobile,
      email: user.email,
      role: user.role,
      branch: user.branch,
      status: user.status,
      password: '',
      confirmPassword: ''
    });
    setFormError(null);
    setIsAddModalOpen(true);
  };

  // Submit User Form (Add or Edit)
  const handleSubmitUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.fullName.trim() || !formData.username.trim() || !formData.mobile.trim()) {
      setFormError('Please fill in all mandatory fields: Full Name, Username, and Mobile.');
      return;
    }

    if (!editingUser) {
      // Password validation for new user
      if (!formData.password) {
        setFormError('Password is required for new accounts.');
        return;
      }
      if (formData.password.length < 8) {
        setFormError('Password must be at least 8 characters long.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setFormError('Passwords do not match.');
        return;
      }
    }

    const roleNameMap: Record<UserRole, string> = {
      super_admin: 'Super Admin',
      admin: 'Admin / Store Manager',
      store_admin: 'Store Admin',
      manager: 'Branch Manager',
      billing_operator: 'Billing Operator',
      purchase_operator: 'Purchase Operator',
      accounts_operator: 'Accounts Operator',
      inventory_operator: 'Inventory Operator',
      viewer: 'Viewer / Auditor'
    };

    if (editingUser) {
      onUpdateUser({
        ...editingUser,
        fullName: formData.fullName,
        username: formData.username,
        mobile: formData.mobile,
        email: formData.email,
        role: formData.role,
        roleDisplayName: roleNameMap[formData.role] || formData.role,
        branch: formData.branch,
        status: formData.status
      });
    } else {
      const newUser: ERPUser = {
        id: `usr-${Date.now()}`,
        fullName: formData.fullName,
        username: formData.username.toLowerCase().replace(/\s+/g, '.'),
        mobile: formData.mobile,
        email: formData.email,
        role: formData.role,
        roleDisplayName: roleNameMap[formData.role] || formData.role,
        branch: formData.branch,
        status: formData.status,
        lastLogin: 'Never Logged In',
        createdDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      };
      onAddUser(newUser);
    }

    setIsAddModalOpen(false);
    setEditingUser(null);
  };

  // Submit Password Reset
  const handleConfirmResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    if (!newPassword || newPassword.length < 8) {
      setResetError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setResetError('New passwords do not match.');
      return;
    }

    if (resettingUser) {
      onResetPassword(resettingUser.id, resettingUser.username);
      setResetSuccess(`Password for ${resettingUser.fullName} successfully updated.`);
      setTimeout(() => {
        setResettingUser(null);
        setResetSuccess(null);
        setNewPassword('');
        setConfirmNewPassword('');
      }, 1200);
    }
  };

  // Filter Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.mobile.includes(searchQuery) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = selectedRoleFilter === 'ALL' || u.role === selectedRoleFilter;
      const matchesBranch = selectedBranchFilter === 'ALL' || u.branch.includes(selectedBranchFilter);
      const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;

      return matchesSearch && matchesRole && matchesBranch && matchesStatus;
    });
  }, [users, searchQuery, selectedRoleFilter, selectedBranchFilter, statusFilter]);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30 font-semibold';
      case 'admin':
      case 'store_admin':
        return 'bg-primary/10 text-primary border-primary/25 font-semibold';
      case 'manager':
        return 'bg-secondary/15 text-secondary border-secondary/30 font-medium';
      case 'billing_operator':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/25';
      case 'purchase_operator':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25';
      case 'accounts_operator':
        return 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/25';
      case 'inventory_operator':
        return 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/25';
      case 'viewer':
      default:
        return 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/25';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low p-4 rounded border border-surface-container-high">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-primary">manage_accounts</span>
            <h1 className="text-lg font-bold text-on-surface tracking-tight">Users Management</h1>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-surface-container rounded border border-surface-container-high text-outline">
              {users.length} Active Staff Accounts
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Configure system user accounts, login credentials, store branches, and administrative role assignment.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-primary text-on-primary rounded text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 shadow-xs shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Add User
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-surface-container-low p-3 rounded border border-surface-container-high flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-outline">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, username, phone, or email..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface border border-surface-container-high rounded focus:outline-hidden focus:border-primary text-on-surface"
          />
        </div>

        {/* Role Filter */}
        <select
          value={selectedRoleFilter}
          onChange={(e) => setSelectedRoleFilter(e.target.value)}
          className="px-2.5 py-1.5 text-xs bg-surface border border-surface-container-high rounded text-on-surface focus:outline-hidden focus:border-primary"
        >
          <option value="ALL">All Roles ({users.length})</option>
          <option value="super_admin">Super Admin</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="billing_operator">Billing Operator</option>
          <option value="purchase_operator">Purchase Operator</option>
          <option value="accounts_operator">Accounts Operator</option>
          <option value="inventory_operator">Inventory Operator</option>
          <option value="viewer">Viewer</option>
        </select>

        {/* Branch Filter */}
        <select
          value={selectedBranchFilter}
          onChange={(e) => setSelectedBranchFilter(e.target.value)}
          className="px-2.5 py-1.5 text-xs bg-surface border border-surface-container-high rounded text-on-surface focus:outline-hidden focus:border-primary"
        >
          <option value="ALL">All Branches</option>
          {INITIAL_BRANCHES.map((b) => (
            <option key={b.id} value={b.name}>{b.name}</option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-2.5 py-1.5 text-xs bg-surface border border-surface-container-high rounded text-on-surface focus:outline-hidden focus:border-primary"
        >
          <option value="ALL">All Statuses</option>
          <option value="Active">Active Only</option>
          <option value="Inactive">Inactive Only</option>
        </select>

        {(searchQuery || selectedRoleFilter !== 'ALL' || selectedBranchFilter !== 'ALL' || statusFilter !== 'ALL') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedRoleFilter('ALL');
              setSelectedBranchFilter('ALL');
              setStatusFilter('ALL');
            }}
            className="text-xs text-secondary hover:underline px-2 py-1"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-surface-container-low border border-surface-container-high rounded overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container border-b border-surface-container-high text-outline uppercase font-semibold text-[11px] tracking-wider">
                <th className="py-2.5 px-3">User</th>
                <th className="py-2.5 px-3">Username</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Branch</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3">Last Login</th>
                <th className="py-2.5 px-3">Created Date</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high text-on-surface">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-outline">
                    <span className="material-symbols-outlined text-3xl mb-1 block">search_off</span>
                    No user accounts match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const initials = u.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <tr key={u.id} className="hover:bg-surface-container-highest/40 transition-colors">
                      {/* User Avatar + Full Name + Contact */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary-container font-bold text-[11px] flex items-center justify-center shrink-0 border border-primary/20">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-on-surface leading-tight">{u.fullName}</div>
                            <div className="text-[11px] text-outline mt-0.5">{u.mobile}</div>
                          </div>
                        </div>
                      </td>

                      {/* Username */}
                      <td className="py-2.5 px-3 font-mono text-[11px] text-on-surface-variant">
                        @{u.username}
                      </td>

                      {/* Role Badge */}
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] border inline-block ${getRoleBadge(u.role)}`}>
                          {u.roleDisplayName}
                        </span>
                      </td>

                      {/* Branch */}
                      <td className="py-2.5 px-3 text-on-surface-variant text-[11px] max-w-[160px] truncate">
                        {u.branch}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold border inline-flex items-center gap-1 ${
                            u.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                          {u.status}
                        </span>
                      </td>

                      {/* Last Login */}
                      <td className="py-2.5 px-3 font-mono text-[11px] text-outline whitespace-nowrap">
                        {u.lastLogin}
                      </td>

                      {/* Created Date */}
                      <td className="py-2.5 px-3 font-mono text-[11px] text-outline whitespace-nowrap">
                        {u.createdDate}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(u)}
                            title="Edit User Details"
                            className="p-1 rounded hover:bg-surface-container text-outline hover:text-on-surface transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>

                          {/* Toggle Status (Activate / Deactivate) */}
                          <button
                            onClick={() => {
                              if (!isAdminOrSuper) {
                                if (onTriggerPermissionDenied) onTriggerPermissionDenied('Toggle User Status');
                                return;
                              }
                              onToggleUserStatus(u.id);
                            }}
                            title={u.status === 'Active' ? 'Deactivate User' : 'Activate User'}
                            className={`p-1 rounded hover:bg-surface-container transition-colors ${
                              u.status === 'Active' ? 'text-emerald-600 hover:text-error' : 'text-neutral-500 hover:text-emerald-600'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              {u.status === 'Active' ? 'toggle_on' : 'toggle_off'}
                            </span>
                          </button>

                          {/* Reset Password */}
                          <button
                            onClick={() => {
                              if (!isAdminOrSuper) {
                                if (onTriggerPermissionDenied) onTriggerPermissionDenied('Reset User Password');
                                return;
                              }
                              setResettingUser(u);
                              setNewPassword('');
                              setConfirmNewPassword('');
                              setResetError(null);
                              setResetSuccess(null);
                            }}
                            title="Reset Password"
                            className="p-1 rounded hover:bg-surface-container text-outline hover:text-amber-600 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">lock_reset</span>
                          </button>

                          {/* View Activity */}
                          <button
                            onClick={() => onViewUserActivity(u.username)}
                            title="View User Activity Audit Trail"
                            className="p-1 rounded hover:bg-surface-container text-outline hover:text-secondary transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">history</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT USER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest border border-surface-container-highest rounded shadow-2xl max-w-lg w-full overflow-hidden text-on-surface">
            {/* Header */}
            <div className="bg-surface-container-low px-5 py-3.5 border-b border-surface-container-high flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-primary">
                  {editingUser ? 'manage_accounts' : 'person_add'}
                </span>
                <h3 className="font-bold text-sm tracking-tight text-on-surface">
                  {editingUser ? `Edit User: ${editingUser.fullName}` : 'Add New System User'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-outline hover:text-on-surface rounded p-1"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitUser} className="p-5 space-y-3.5 text-xs">
              {formError && (
                <div className="p-2.5 bg-error-container/20 border border-error/30 text-error rounded flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Full Name */}
                <div>
                  <label className="block text-outline font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Ramesh Sundaram"
                    className="w-full px-2.5 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface focus:outline-hidden focus:border-primary"
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="block text-outline font-semibold mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="e.g. ramesh.accounts"
                    className="w-full px-2.5 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface focus:outline-hidden focus:border-primary font-mono text-[11px]"
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-outline font-semibold mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="+91 98401 23456"
                    className="w-full px-2.5 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface focus:outline-hidden focus:border-primary"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-outline font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@sribalajimotors.com"
                    className="w-full px-2.5 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface focus:outline-hidden focus:border-primary"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-outline font-semibold mb-1">System Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-2.5 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface focus:outline-hidden focus:border-primary font-medium"
                  >
                    <option value="billing_operator">Billing Operator</option>
                    <option value="purchase_operator">Purchase Operator</option>
                    <option value="inventory_operator">Inventory Operator</option>
                    <option value="accounts_operator">Accounts Operator</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin / Store Manager</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="viewer">Viewer / Auditor</option>
                  </select>
                </div>

                {/* Branch */}
                <div>
                  <label className="block text-outline font-semibold mb-1">Assigned Branch *</label>
                  <select
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface focus:outline-hidden focus:border-primary"
                  >
                    {INITIAL_BRANCHES.map((b) => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="pt-2 border-t border-surface-container-high flex items-center justify-between">
                <div>
                  <div className="font-semibold text-on-surface">Account Status</div>
                  <div className="text-[11px] text-outline">Enable or suspend system login access</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold ${formData.status === 'Active' ? 'text-emerald-600' : 'text-neutral-500'}`}>
                    {formData.status}
                  </span>
                  <input
                    type="checkbox"
                    checked={formData.status === 'Active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'Active' : 'Inactive' })}
                    className="w-4 h-4 rounded text-primary focus:ring-0"
                  />
                </div>
              </div>

              {/* Password Fields (Only for new users) */}
              {!editingUser && (
                <div className="pt-2 border-t border-surface-container-high space-y-2.5 bg-surface-container-low p-3 rounded">
                  <div className="text-[11px] text-outline font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                    Initial Security Password (Never Displayed)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-outline text-[11px] mb-1">Password (Min 8 chars) *</label>
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••••••"
                        className="w-full px-2.5 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface focus:outline-hidden focus:border-primary font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-outline text-[11px] mb-1">Confirm Password *</label>
                      <input
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="••••••••••••"
                        className="w-full px-2.5 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface focus:outline-hidden focus:border-primary font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-3 border-t border-surface-container-high flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 rounded border border-surface-container-highest bg-surface hover:bg-surface-container-high text-on-surface font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-primary text-on-primary hover:bg-primary/90 font-medium flex items-center gap-1.5 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  {editingUser ? 'Update User' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {resettingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest border border-surface-container-highest rounded shadow-2xl max-w-sm w-full overflow-hidden text-on-surface">
            <div className="bg-surface-container-low px-4 py-3 border-b border-surface-container-high flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-amber-500">lock_reset</span>
                <h3 className="font-bold text-xs tracking-tight text-on-surface">
                  Reset Password for @{resettingUser.username}
                </h3>
              </div>
              <button
                onClick={() => setResettingUser(null)}
                className="text-outline hover:text-on-surface rounded p-1"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <form onSubmit={handleConfirmResetPassword} className="p-4 space-y-3 text-xs">
              {resetError && (
                <div className="p-2 bg-error-container/20 border border-error/30 text-error rounded text-[11px]">
                  {resetError}
                </div>
              )}
              {resetSuccess && (
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded text-[11px] font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">check</span>
                  {resetSuccess}
                </div>
              )}

              <div>
                <label className="block text-outline text-[11px] font-medium mb-1">
                  New Password (Min 8 characters)
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-2.5 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface font-mono"
                />
              </div>

              <div>
                <label className="block text-outline text-[11px] font-medium mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-2.5 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface font-mono"
                />
              </div>

              <div className="text-[11px] text-outline flex items-center gap-1 bg-surface-container p-2 rounded">
                <span className="material-symbols-outlined text-[14px]">security</span>
                <span>Passwords are hashed with bcrypt and are never logged or visible.</span>
              </div>

              <div className="pt-2 border-t border-surface-container-high flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResettingUser(null)}
                  className="px-3 py-1 rounded border border-surface-container-highest bg-surface hover:bg-surface-container-high text-on-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-medium"
                >
                  Confirm Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
