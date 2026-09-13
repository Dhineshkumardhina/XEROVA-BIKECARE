import React from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionIcon?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox',
  title,
  description,
  actionLabel,
  actionIcon = 'add',
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = ''
}) => {
  return (
    <div className={`p-8 text-center flex flex-col items-center justify-center bg-surface-container-lowest border border-dashed border-surface-container-highest rounded-lg ${className}`}>
      <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-outline mb-3">
        <span className="material-symbols-outlined text-[24px]">{icon}</span>
      </div>
      <h3 className="font-headline-md text-sm font-bold text-on-surface mb-1">{title}</h3>
      <p className="text-xs text-outline max-w-sm mx-auto mb-4">{description}</p>
      
      {(onAction || onSecondaryAction) && (
        <div className="flex items-center gap-2">
          {secondaryActionLabel && onSecondaryAction && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="px-3 py-1.5 rounded border border-surface-container-highest bg-surface-container-low hover:bg-surface-container text-xs text-on-surface font-medium transition-colors"
            >
              {secondaryActionLabel}
            </button>
          )}
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="px-3.5 py-1.5 rounded bg-secondary hover:bg-secondary-container text-on-secondary text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">{actionIcon}</span>
              <span>{actionLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
