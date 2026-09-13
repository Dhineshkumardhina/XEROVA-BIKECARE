import React, { useEffect, useState } from 'react';

interface QuickActionItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  shortcut?: string;
  action: () => void;
  category: string;
}

interface QuickActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (screen: string) => void;
  onOpenNewSale: () => void;
  onOpenNewPurchase: () => void;
  onOpenNewCustomer: () => void;
  onOpenNewSupplier: () => void;
  onOpenNewItem: () => void;
  onOpenNewReceipt: () => void;
  onOpenNewPayment: () => void;
  onOpenNewQuotation: () => void;
  onOpenStockAdjustment: () => void;
}

export const QuickActionsModal: React.FC<QuickActionsModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenNewSale,
  onOpenNewPurchase,
  onOpenNewCustomer,
  onOpenNewSupplier,
  onOpenNewItem,
  onOpenNewReceipt,
  onOpenNewPayment,
  onOpenNewQuotation,
  onOpenStockAdjustment
}) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const actions: QuickActionItem[] = [
    {
      id: 'new-sale',
      title: 'New Sale / POS Counter Bill',
      description: 'Start a fast retail counter sale or B2B garage invoice with barcode scanning',
      icon: 'point_of_sale',
      shortcut: 'F4',
      category: 'Sales',
      action: () => {
        onClose();
        onOpenNewSale();
      }
    },
    {
      id: 'new-purchase',
      title: 'New Purchase Entry (GRN)',
      description: 'Record supplier inward invoice, tax breakdown, and automatic bin allocation',
      icon: 'local_shipping',
      category: 'Purchase',
      action: () => {
        onClose();
        onOpenNewPurchase();
      }
    },
    {
      id: 'new-customer',
      title: 'New Customer',
      description: 'Register retail customer, workshop garage, or trade partner with credit limit',
      icon: 'person_add',
      shortcut: 'F6',
      category: 'CRM & Accounts',
      action: () => {
        onClose();
        onOpenNewCustomer();
      }
    },
    {
      id: 'new-supplier',
      title: 'New Supplier',
      description: 'Onboard spares distributor, OEM manufacturer, or lubricant vendor',
      icon: 'storefront',
      category: 'Purchase',
      action: () => {
        onClose();
        onOpenNewSupplier();
      }
    },
    {
      id: 'new-item',
      title: 'New Item (Spare Part SKU)',
      description: 'Create catalog item with HSN code, GST rate, rack/bin, and vehicle compatibility',
      icon: 'two_wheeler',
      shortcut: 'F2',
      category: 'Inventory',
      action: () => {
        onClose();
        onOpenNewItem();
      }
    },
    {
      id: 'new-receipt',
      title: 'New Receipt Voucher',
      description: 'Record customer payment collection against outstanding invoice balances',
      icon: 'receipt',
      shortcut: 'F8',
      category: 'Accounts',
      action: () => {
        onClose();
        onOpenNewReceipt();
      }
    },
    {
      id: 'new-payment',
      title: 'New Payment Voucher',
      description: 'Disburse payment to supplier against purchase bills via Bank / Cash / UPI',
      icon: 'payments',
      category: 'Accounts',
      action: () => {
        onClose();
        onOpenNewPayment();
      }
    },
    {
      id: 'new-quotation',
      title: 'New Quotation / Estimate',
      description: 'Draft parts estimate with pricing and validity for customer approval',
      icon: 'request_quote',
      category: 'Sales',
      action: () => {
        onClose();
        onOpenNewQuotation();
      }
    },
    {
      id: 'stock-adjustment',
      title: 'Stock Adjustment',
      description: 'Audited physical count reconciliation for damaged, lost, or found spare parts',
      icon: 'tune',
      category: 'Inventory',
      action: () => {
        onClose();
        onOpenStockAdjustment();
      }
    }
  ];

  const filtered = actions.filter(
    (a) =>
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4 animate-in fade-in duration-100">
      <div className="bg-surface-container-lowest w-full max-w-xl rounded-lg shadow-2xl border border-surface-container-highest overflow-hidden flex flex-col">
        {/* Search header */}
        <div className="p-3.5 bg-surface-container flex items-center gap-3 border-b border-surface-container-high">
          <span className="material-symbols-outlined text-secondary text-[22px]">bolt</span>
          <input
            type="text"
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a quick action or shortcut (Ctrl + /)..."
            className="w-full bg-transparent text-sm text-on-surface font-medium focus:outline-none placeholder:text-outline"
          />
          <div className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-surface-container-high text-outline text-[10px] font-mono border border-surface-container-highest">
              ESC
            </kbd>
          </div>
        </div>

        {/* List of actions */}
        <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-surface-container-high/40">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-outline">
              No matching actions found for "{search}"
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left p-3 rounded flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-secondary text-on-secondary shadow-xs'
                      : 'hover:bg-surface-container-low text-on-surface'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded flex items-center justify-center ${
                        isSelected
                          ? 'bg-on-secondary-fixed text-on-secondary'
                          : 'bg-surface-container text-secondary'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-xs leading-tight flex items-center gap-2">
                        <span>{item.title}</span>
                        <span
                          className={`text-[10px] font-normal uppercase px-1.5 py-0.2 rounded ${
                            isSelected
                              ? 'bg-secondary-container text-on-secondary'
                              : 'bg-surface-container text-outline'
                          }`}
                        >
                          {item.category}
                        </span>
                      </div>
                      <div
                        className={`text-[11px] line-clamp-1 mt-0.5 ${
                          isSelected ? 'text-on-secondary/80' : 'text-outline'
                        }`}
                      >
                        {item.description}
                      </div>
                    </div>
                  </div>

                  {item.shortcut && (
                    <kbd
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isSelected
                          ? 'bg-on-secondary-fixed text-on-secondary'
                          : 'bg-surface-container-high text-on-surface-variant'
                      }`}
                    >
                      {item.shortcut}
                    </kbd>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="p-2.5 bg-surface-container border-t border-surface-container-high flex items-center justify-between text-[11px] text-outline">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
          <span className="font-mono text-[10px]">Ctrl + /</span>
        </div>
      </div>
    </div>
  );
};
