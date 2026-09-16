import React from 'react';
import { UserRole, SystemStatusItem } from '../../types';
import { SystemStatusPanel } from './SystemStatusPanel';

interface AdministrationDashboardProps {
  userRole: UserRole;
  systemStatus: SystemStatusItem[];
  onNavigateAdmin: (screenId: string) => void;
  onQuickBackup: () => void;
}

export const AdministrationDashboard: React.FC<AdministrationDashboardProps> = ({
  userRole,
  systemStatus,
  onNavigateAdmin,
  onQuickBackup
}) => {
  const adminModules = [
    {
      id: 'users-roles',
      title: 'Users & Roles',
      desc: 'Create operator logins, passwords, contact info, and role assignment.',
      icon: 'manage_accounts',
      badge: 'Staff Accounts',
      category: 'Access'
    },
    {
      id: 'permissions',
      title: 'Permissions Matrix',
      desc: 'Granular permissions matrix for Sales, Purchase, Inventory, Accounts & GST.',
      icon: 'policy',
      badge: 'Role Controls',
      category: 'Access'
    },
    {
      id: 'company-settings',
      title: 'Company Settings',
      desc: 'Legal firm identity, GSTIN, PAN, bank settlement accounts, terms and footers.',
      icon: 'business',
      badge: 'Profile & Tax',
      category: 'Configuration'
    },
    {
      id: 'branch-settings',
      title: 'Branch Settings',
      desc: 'Multi-store retail counters, regional distribution warehouses, and location access.',
      icon: 'store',
      badge: 'Branches',
      category: 'Configuration'
    },
    {
      id: 'invoice-templates',
      title: 'Invoice Templates',
      desc: 'A4 tax invoices, A5 compact counter slips, and 3" thermal POS roll receipts.',
      icon: 'receipt_long',
      badge: 'Print Formats',
      category: 'Printing'
    },
    {
      id: 'numbering-prefixes',
      title: 'Numbering & Prefixes',
      desc: 'Sequential document numbering, FY prefixes, padding, and collision prevention.',
      icon: 'pin',
      badge: 'Document Types',
      category: 'Configuration'
    },
    {
      id: 'tax-settings',
      title: 'Tax Settings',
      desc: 'Statutory GST slabs (0%, 5%, 12%, 18%, 28%), CGST/SGST, and HSN mappings.',
      icon: 'percent',
      badge: 'GST Schedular',
      category: 'Compliance'
    },
    {
      id: 'payment-modes',
      title: 'Payment Modes',
      desc: 'Cash, UPI QR, Bank Transfer, Cheque, Card POS, and Chart of Accounts mapping.',
      icon: 'payments',
      badge: 'Modes Active',
      category: 'Finance'
    },
    {
      id: 'printer-settings',
      title: 'Printer Settings',
      desc: 'Thermal 80mm ESC/POS, A4 laser printers, auto-print on save, and test printing.',
      icon: 'print',
      badge: 'Hardware Drivers',
      category: 'Printing'
    },
    {
      id: 'backup-restore',
      title: 'Backup & Restore',
      desc: 'Instant database snapshots, point-in-time restores, downloads, and auto-backup cron.',
      icon: 'settings_backup_restore',
      badge: 'Snapshot Verified',
      category: 'Security'
    },
    {
      id: 'audit-logs',
      title: 'Audit Logs',
      desc: 'Immutable audit trail with previous vs new values for invoices, rates, and permissions.',
      icon: 'history',
      badge: 'Statutory Ledger',
      category: 'Audit'
    },
    {
      id: 'system-activity',
      title: 'System Activity',
      desc: 'Real-time chronological activity feed showing who created what and from which terminal.',
      icon: 'timeline',
      badge: 'Live Timeline',
      category: 'Audit'
    },
    {
      id: 'security-settings',
      title: 'Security Settings',
      desc: 'Session timeouts, lockout rules, password policies, and protected Danger Zone.',
      icon: 'security',
      badge: 'ISO Controls',
      category: 'Security'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low p-4 rounded border border-surface-container-high">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-primary">admin_panel_settings</span>
            <h1 className="text-lg font-bold text-on-surface tracking-tight">Administration & Security Control Center</h1>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-surface-container rounded border border-surface-container-high text-outline">
              Control Suite
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Enterprise administration, multi-branch governance, hardware routing, compliance audit trails, and data protection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateAdmin('audit-logs')}
            className="px-3.5 py-1.5 rounded border border-surface-container-highest bg-surface hover:bg-surface-container-high text-on-surface text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">history</span>
            Audit Logs
          </button>
          <button
            onClick={onQuickBackup}
            className="px-4 py-1.5 rounded bg-primary text-on-primary hover:bg-primary/90 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
            Instant Backup
          </button>
        </div>
      </div>

      {/* System Status Telemetry Panel */}
      <SystemStatusPanel items={systemStatus} />

      {/* Administration Modules Grid */}
      <div className="space-y-2">
        <div className="px-1 text-[11px] font-semibold text-outline uppercase tracking-wider">
          Management & Configuration Modules
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {adminModules.map((mod) => (
            <button
              key={mod.id}
              onClick={() => onNavigateAdmin(mod.id)}
              className="p-3.5 bg-surface-container-low hover:bg-surface-container border border-surface-container-high hover:border-primary/40 rounded transition-all text-left flex flex-col justify-between group shadow-2xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2 pb-2">
                  <div className="p-2 rounded bg-surface border border-surface-container-high text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px]">{mod.icon}</span>
                  </div>

                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface text-outline border border-surface-container-high font-mono">
                    {mod.badge}
                  </span>
                </div>

                <h3 className="font-bold text-xs text-on-surface group-hover:text-primary transition-colors">
                  {mod.title}
                </h3>
                <p className="text-[11px] text-on-surface-variant mt-1 line-clamp-2 leading-relaxed">
                  {mod.desc}
                </p>
              </div>

              <div className="pt-2.5 border-t border-surface-container-high/60 mt-3 flex items-center justify-between text-[11px] text-outline group-hover:text-primary font-medium">
                <span>Configure Module</span>
                <span className="material-symbols-outlined text-[14px] group-hover:translate-x-0.5 transition-transform">
                  arrow_forward
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
