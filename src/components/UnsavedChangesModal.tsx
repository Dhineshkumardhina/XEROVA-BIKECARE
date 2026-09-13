import React, { useEffect } from 'react';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onStay: () => void;
  onDiscard: () => void;
  onSave?: () => void;
  title?: string;
  message?: string;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  onStay,
  onDiscard,
  onSave,
  title = 'Unsaved Changes',
  message = "Your changes haven't been saved. Leaving this screen will cause you to lose entered data."
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onStay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onStay]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100">
      <div className="bg-surface-container-lowest w-full max-w-md rounded-lg shadow-2xl border border-surface-container-highest overflow-hidden">
        <div className="p-5 border-b border-surface-container-high flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full bg-error-container text-on-error-container flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[22px]">warning</span>
          </div>
          <div>
            <h3 className="font-headline-md text-base font-bold text-on-surface">{title}</h3>
            <p className="text-xs text-outline mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="p-3.5 bg-surface-container flex items-center justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={onStay}
            className="px-3.5 py-1.5 rounded border border-surface-container-highest bg-surface-container-low hover:bg-surface-container text-on-surface font-semibold transition-colors"
          >
            Stay on Form
          </button>
          
          <button
            type="button"
            onClick={onDiscard}
            className="px-3.5 py-1.5 rounded bg-error-container hover:bg-error text-on-error-container hover:text-on-error font-bold transition-colors"
          >
            Discard Changes
          </button>

          {onSave && (
            <button
              type="button"
              onClick={onSave}
              className="px-4 py-1.5 rounded bg-secondary hover:bg-secondary-container text-on-secondary font-bold transition-colors shadow-xs"
            >
              Save &amp; Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
