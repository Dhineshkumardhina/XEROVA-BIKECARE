import React from 'react';

interface SessionExpiredModalProps {
  isOpen: boolean;
  onLoginAgain: () => void;
}

export const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({
  isOpen,
  onLoginAgain
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-surface-container-lowest border border-surface-container-highest rounded-lg shadow-2xl overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3 mb-4 text-tertiary">
          <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl">timer_off</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-on-surface">Session Expired</h3>
            <p className="text-xs text-outline">Security timeout</p>
          </div>
        </div>

        <div className="bg-surface-container-low p-4 rounded border border-surface-container-highest mb-5">
          <p className="text-xs text-on-surface font-medium leading-relaxed">
            Your session has expired due to inactivity or invalid authorization tokens.
          </p>
          <p className="text-[11px] text-outline mt-1">
            Please log in again to continue managing your counter, stock, and accounts safely.
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onLoginAgain}
            className="w-full py-2 px-4 bg-primary hover:bg-primary-hover text-on-primary rounded text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">login</span>
            <span>Login Again</span>
          </button>
        </div>
      </div>
    </div>
  );
};
