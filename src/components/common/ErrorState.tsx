import React from 'react';

export type ErrorStateType =
  | 'server_unavailable'
  | 'database_unavailable'
  | 'permission_denied'
  | 'session_expired'
  | 'network_disconnected'
  | 'data_loading_failed';

interface ErrorStateProps {
  type?: ErrorStateType;
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoDashboard?: () => void;
  onLoginAgain?: () => void;
  className?: string;
}

const ERROR_CONFIGS: Record<
  ErrorStateType,
  { icon: string; defaultTitle: string; defaultMessage: string; isDanger?: boolean }
> = {
  server_unavailable: {
    icon: 'dns',
    defaultTitle: 'Application Server Unavailable',
    defaultMessage: 'Unable to connect to the local ERP backend service. Please ensure the local service is running on port 8080.',
    isDanger: true
  },
  database_unavailable: {
    icon: 'database',
    defaultTitle: 'Database Connection Lost',
    defaultMessage: 'The local SQLite / indexed database cannot be reached. Data integrity guards are currently active.',
    isDanger: true
  },
  permission_denied: {
    icon: 'lock',
    defaultTitle: 'Permission Denied',
    defaultMessage: 'Your current role credentials do not allow access to this administrative or financial module.'
  },
  session_expired: {
    icon: 'schedule',
    defaultTitle: 'ERP Session Expired',
    defaultMessage: 'Your security token has expired due to inactivity. Please verify your PIN to continue.'
  },
  network_disconnected: {
    icon: 'wifi_off',
    defaultTitle: 'Offline Mode (Local Only)',
    defaultMessage: 'Internet connectivity disconnected. Counter POS and local billing continue seamlessly; GST cloud sync is paused.'
  },
  data_loading_failed: {
    icon: 'sync_problem',
    defaultTitle: 'Data Query Error',
    defaultMessage: 'Failed to retrieve requested transaction records from local storage. Please retry the query.'
  }
};

export const ErrorState: React.FC<ErrorStateProps> = ({
  type = 'data_loading_failed',
  title,
  message,
  onRetry,
  onGoDashboard,
  onLoginAgain,
  className = ''
}) => {
  const config = ERROR_CONFIGS[type];
  const displayTitle = title || config.defaultTitle;
  const displayMessage = message || config.defaultMessage;

  return (
    <div className={`p-8 text-center flex flex-col items-center justify-center bg-surface-container-lowest border border-error/20 rounded-lg max-w-lg mx-auto ${className}`}>
      <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${
        config.isDanger ? 'bg-error-container text-on-error-container' : 'bg-surface-container text-error'
      }`}>
        <span className="material-symbols-outlined text-[28px]">{config.icon}</span>
      </div>

      <h3 className="font-headline-md text-base font-bold text-on-surface mb-1.5">{displayTitle}</h3>
      <p className="text-xs text-outline max-w-sm mx-auto mb-5 leading-relaxed">{displayMessage}</p>

      <div className="flex items-center gap-2 flex-wrap justify-center">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-3.5 py-1.5 rounded bg-secondary hover:bg-secondary-container text-on-secondary text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>Retry Operation</span>
          </button>
        )}

        {onGoDashboard && (
          <button
            type="button"
            onClick={onGoDashboard}
            className="px-3.5 py-1.5 rounded bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">dashboard</span>
            <span>Go to Dashboard</span>
          </button>
        )}

        {onLoginAgain && (
          <button
            type="button"
            onClick={onLoginAgain}
            className="px-3.5 py-1.5 rounded border border-surface-container-highest bg-surface-container-low hover:bg-surface-container text-xs text-on-surface font-semibold transition-colors"
          >
            <span>Login Again</span>
          </button>
        )}
      </div>
    </div>
  );
};
