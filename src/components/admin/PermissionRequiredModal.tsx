import React from 'react';

interface PermissionRequiredModalProps {
  isOpen: boolean;
  actionName?: string;
  moduleName?: string;
  requiredRole?: string;
  onClose: () => void;
  onRequestAccess?: (action: string) => void;
}

export const PermissionRequiredModal: React.FC<PermissionRequiredModalProps> = ({
  isOpen,
  actionName = 'perform this action',
  moduleName = 'this module',
  requiredRole = 'Manager or Administrator',
  onClose,
  onRequestAccess
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest border border-error/40 rounded shadow-2xl max-w-md w-full overflow-hidden text-on-surface">
        {/* Header */}
        <div className="bg-error-container/20 border-b border-error/30 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-error">
            <span className="material-symbols-outlined text-[24px]">gpp_maybe</span>
            <h3 className="font-semibold text-base tracking-tight text-on-surface">Permission Required</h3>
          </div>
          <button
            onClick={onClose}
            className="text-outline hover:text-on-surface transition-colors rounded p-1"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3.5">
          <div className="p-3 bg-surface-container-low border border-surface-container-high rounded text-xs leading-relaxed space-y-1.5">
            <p className="font-medium text-on-surface">
              You don't have permission to perform this action.
            </p>
            <p className="text-on-surface-variant">
              Attempted action: <span className="font-semibold text-primary font-mono">{actionName}</span> in <span className="font-medium">{moduleName}</span>.
            </p>
          </div>

          <div className="text-[12px] text-on-surface-variant space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-outline text-[16px]">verified_user</span>
              <span>Required authorization: <strong className="text-on-surface">{requiredRole}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-outline text-[11px]">
              <span className="material-symbols-outlined text-[14px]">shield</span>
              <span>This access restriction has been recorded in the security audit trail.</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-surface-container-low border-t border-surface-container-high px-5 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded border border-surface-container-highest bg-surface hover:bg-surface-container-high text-on-surface text-xs font-medium transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              if (onRequestAccess) onRequestAccess(actionName);
              onClose();
            }}
            className="px-4 py-1.5 rounded bg-primary text-on-primary hover:bg-primary/90 text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">send</span>
            Request Access
          </button>
        </div>
      </div>
    </div>
  );
};
