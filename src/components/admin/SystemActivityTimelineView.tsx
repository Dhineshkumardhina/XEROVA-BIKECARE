import React, { useState, useMemo } from 'react';
import { UserActivityItem, UserRole } from '../../types';

interface SystemActivityTimelineViewProps {
  activities: UserActivityItem[];
  userRole: UserRole;
  targetUsername?: string;
  onClearTargetUser?: () => void;
  onInspectRecord?: (recordId: string) => void;
}

export const SystemActivityTimelineView: React.FC<SystemActivityTimelineViewProps> = ({
  activities,
  userRole,
  targetUsername,
  onClearTargetUser,
  onInspectRecord
}) => {
  const [selectedUser, setSelectedUser] = useState<string>(targetUsername || 'ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  React.useEffect(() => {
    if (targetUsername) {
      setSelectedUser(targetUsername);
    }
  }, [targetUsername]);

  const uniqueUsers = useMemo(() => {
    return Array.from(new Set(activities.map((a) => a.username))).sort();
  }, [activities]);

  const uniqueTypes = useMemo(() => {
    return Array.from(new Set(activities.map((a) => a.activityType))).sort();
  }, [activities]);

  const filteredActivities = useMemo(() => {
    return activities.filter((a) => {
      const matchUser = selectedUser === 'ALL' || a.username === selectedUser;
      const matchType = selectedType === 'ALL' || a.activityType === selectedType;
      return matchUser && matchType;
    });
  }, [activities, selectedUser, selectedType]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'INVOICE':
        return { icon: 'point_of_sale', color: 'text-primary' };
      case 'PURCHASE':
        return { icon: 'local_shipping', color: 'text-secondary' };
      case 'INVENTORY':
        return { icon: 'inventory_2', color: 'text-amber-500' };
      case 'ACCOUNTS':
        return { icon: 'account_balance', color: 'text-teal-600' };
      case 'GST':
        return { icon: 'percent', color: 'text-purple-600' };
      case 'ADMIN':
        return { icon: 'admin_panel_settings', color: 'text-rose-600' };
      case 'SECURITY':
      default:
        return { icon: 'security', color: 'text-neutral-500' };
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low p-4 rounded border border-surface-container-high">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-primary">timeline</span>
            <h1 className="text-lg font-bold text-on-surface tracking-tight">System Activity Stream & User Timeline</h1>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-surface-container rounded border border-surface-container-high text-outline">
              Real-Time Feed
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Chronological live operational stream of all billing operators, warehouse managers, and accountants.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-surface border border-surface-container-high rounded text-on-surface focus:outline-hidden focus:border-primary"
          >
            <option value="ALL">All Operators ({uniqueUsers.length})</option>
            {uniqueUsers.map((u) => (
              <option key={u} value={u}>@{u}</option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-surface border border-surface-container-high rounded text-on-surface focus:outline-hidden focus:border-primary"
          >
            <option value="ALL">All Stream Types</option>
            {uniqueTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {(selectedUser !== 'ALL' || selectedType !== 'ALL') && (
            <button
              onClick={() => {
                setSelectedUser('ALL');
                setSelectedType('ALL');
                if (onClearTargetUser) onClearTargetUser();
              }}
              className="text-xs text-secondary hover:underline px-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Chronological Timeline Container */}
      <div className="bg-surface-container-low border border-surface-container-high rounded p-4">
        {filteredActivities.length === 0 ? (
          <div className="py-12 text-center text-outline text-xs">
            <span className="material-symbols-outlined text-4xl mb-1 block">history_toggle_off</span>
            No operational events recorded for the selected timeline filter.
          </div>
        ) : (
          <div className="relative pl-6 border-l-2 border-surface-container-highest space-y-6">
            {filteredActivities.map((act) => {
              const iconObj = getActivityIcon(act.activityType);

              return (
                <div key={act.id} className="relative group">
                  {/* Timeline bullet node */}
                  <div className="absolute -left-[31px] top-1 w-5 h-5 rounded-full bg-surface border-2 border-surface-container-highest flex items-center justify-center group-hover:border-primary transition-colors">
                    <span className={`material-symbols-outlined text-[13px] ${iconObj.color}`}>
                      {iconObj.icon}
                    </span>
                  </div>

                  {/* Activity Card */}
                  <div className="bg-surface border border-surface-container-high rounded p-3 text-xs hover:border-primary/40 transition-colors shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1.5 border-b border-surface-container-high">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-on-surface">@{act.username}</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-surface-container text-outline border border-surface-container-high">
                          {act.activityType}
                        </span>
                        <span className="text-[11px] text-on-surface-variant font-medium">
                          {act.action}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-[11px] text-outline">
                        <span>{act.timestamp}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:inline">{act.device}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="text-on-surface leading-normal text-xs">
                        {act.details}
                      </div>

                      {act.relatedRecord && (
                        <div className="shrink-0">
                          <button
                            onClick={() => onInspectRecord && onInspectRecord(act.relatedRecord!)}
                            className="px-2 py-0.5 rounded font-mono text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 flex items-center gap-1"
                          >
                            <span>{act.relatedRecord}</span>
                            <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
