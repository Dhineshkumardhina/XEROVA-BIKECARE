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
    <footer className="fixed bottom-0 left-0 right-0 h-8 bg-white border-t border-slate-200/80 z-50 flex items-center justify-between px-4 select-none text-xs text-slate-500">
      <div className="flex items-center gap-4">
        <button
          onClick={onSearchPart}
          className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px] font-semibold">
            F2
          </kbd>
          <span>Search Part</span>
        </button>
        <div className="h-3 w-px bg-slate-200"></div>
        <button
          onClick={onNewSale}
          className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px] font-semibold">
            F4
          </kbd>
          <span>New Sale / POS</span>
        </button>
        <div className="h-3 w-px bg-slate-200"></div>
        <button
          onClick={onGlobalSearch}
          className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px] font-semibold">
            Ctrl+K
          </kbd>
          <span>Global Search</span>
        </button>
        <div className="h-3 w-px bg-slate-200"></div>
        <button
          onClick={onPrintLastBill}
          className="flex items-center gap-1.5 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[10px] font-semibold">
            Alt+P
          </kbd>
          <span>Print Last Bill</span>
        </button>
      </div>

      <div className="flex items-center gap-4 text-[11px]">
        <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>System Online</span>
        </div>
        <span className="text-slate-400 font-mono">v4.8 Pro</span>
      </div>
    </footer>
  );
};

