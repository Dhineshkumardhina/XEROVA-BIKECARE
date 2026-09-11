import React from 'react';
import { SystemStatusItem } from '../../types';

interface SystemStatusPanelProps {
  items: SystemStatusItem[];
  compact?: boolean;
}

export const SystemStatusPanel: React.FC<SystemStatusPanelProps> = ({ items, compact = false }) => {
  const getStatusBadge = (status: SystemStatusItem['status']) => {
    switch (status) {
      case 'Connected':
        return {
          bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
          dot: 'bg-emerald-500',
          icon: 'check_circle',
          label: 'Connected'
        };
      case 'Warning':
        return {
          bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
          dot: 'bg-amber-500',
          icon: 'warning',
          label: 'Warning'
        };
      case 'Offline':
        return {
          bg: 'bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border-neutral-500/20',
          dot: 'bg-neutral-400',
          icon: 'cloud_off',
          label: 'Offline'
        };
      case 'Error':
        return {
          bg: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
          dot: 'bg-rose-500',
          icon: 'error',
          label: 'Error'
        };
      default:
        return {
          bg: 'bg-surface-container text-on-surface border-outline/20',
          dot: 'bg-outline',
          icon: 'help',
          label: 'Unknown'
        };
    }
  };

  if (compact) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
        {items.map((item, i) => {
          const badge = getStatusBadge(item.status);
          return (
            <div
              key={i}
              className="p-2 bg-surface-container-low border border-surface-container-high rounded flex flex-col justify-between"
            >
              <span className="text-[11px] text-outline truncate font-medium">{item.component}</span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                <span className="font-semibold text-on-surface text-xs">{badge.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-surface-container-low border border-surface-container-high rounded overflow-hidden">
      <div className="px-4 py-2.5 bg-surface-container border-b border-surface-container-high flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-secondary">monitor_heart</span>
          <span className="font-semibold text-xs text-on-surface uppercase tracking-wider">
            System Infrastructure Telemetry
          </span>
        </div>
        <span className="text-[11px] text-outline font-mono">Live Engine Monitoring</span>
      </div>

      <div className="divide-y divide-surface-container-high">
        {items.map((item, idx) => {
          const badge = getStatusBadge(item.status);
          return (
            <div key={idx} className="px-4 py-2.5 flex items-center justify-between gap-4 hover:bg-surface-container-highest/30 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <span className={`material-symbols-outlined text-[18px] ${
                  item.status === 'Connected' ? 'text-secondary' : item.status === 'Warning' ? 'text-amber-500' : 'text-error'
                }`}>
                  {badge.icon}
                </span>
                <div className="min-w-0">
                  <div className="font-medium text-xs text-on-surface flex items-center gap-2">
                    <span>{item.name}</span>
                    <span className="text-[10px] text-outline px-1.5 py-0.2 bg-surface-container rounded border border-surface-container-high">
                      {item.component}
                    </span>
                  </div>
                  <div className="text-[11px] text-outline font-mono truncate mt-0.5">
                    {item.details}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-[11px] text-outline hidden sm:inline">
                  {item.lastChecked}
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border flex items-center gap-1.5 ${badge.bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                  {badge.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
