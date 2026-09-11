import React from 'react';

interface FooterProps {
  onSearchPart: () => void;
  onNewSale: () => void;
  onGlobalSearch: () => void;
  onPrintLastBill: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSearchPart,
  onNewSale,
  onGlobalSearch,
  onPrintLastBill
}) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 h-8 bg-surface-container-lowest border-t border-surface-container-high z-50 flex items-center justify-between px-gutter select-none">
      <div className="flex items-center gap-gutter font-shortcut-key text-shortcut-key text-on-surface-variant">
        <button
          onClick={onSearchPart}
          className="flex items-center gap-space-xs hover:text-secondary transition-colors"
        >
          <kbd className="px-1.5 py-0.5 rounded bg-surface-container border border-surface-container-highest text-primary font-bold">
            F2
          </kbd>
          <span>Search Part</span>
        </button>
        <div className="h-3 w-px bg-surface-container-high"></div>
        <button
          onClick={onNewSale}
          className="flex items-center gap-space-xs hover:text-secondary transition-colors"
        >
          <kbd className="px-1.5 py-0.5 rounded bg-surface-container border border-surface-container-highest text-primary font-bold">
            F4
          </kbd>
          <span>New Sale / POS</span>
        </button>
        <div className="h-3 w-px bg-surface-container-high"></div>
        <button
          onClick={onGlobalSearch}
          className="flex items-center gap-space-xs hover:text-secondary transition-colors"
        >
          <kbd className="px-1.5 py-0.5 rounded bg-surface-container border border-surface-container-highest text-primary font-bold">
            Ctrl+K
          </kbd>
          <span>Global Search</span>
        </button>
        <div className="h-3 w-px bg-surface-container-high"></div>
        <button
          onClick={onPrintLastBill}
          className="flex items-center gap-space-xs hover:text-secondary transition-colors"
        >
          <kbd className="px-1.5 py-0.5 rounded bg-surface-container border border-surface-container-highest text-primary font-bold">
            Alt+P
          </kbd>
          <span>Print Last Bill</span>
        </button>
      </div>

      <div className="flex items-center gap-gutter font-shortcut-key text-shortcut-key">
        <div className="flex items-center gap-space-xs text-on-tertiary-container">
          <span className="w-2 h-2 rounded-full bg-on-tertiary-container animate-pulse"></span>
          <span>DB: Online</span>
        </div>
        <span className="text-outline font-numeric-data text-numeric-data">v4.8.2 Pro</span>
      </div>
    </footer>
  );
};
