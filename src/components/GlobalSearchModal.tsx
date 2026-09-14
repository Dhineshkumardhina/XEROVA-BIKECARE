import React, { useState, useEffect, useMemo } from 'react';
import {
  SparePart,
  Invoice,
  CustomerProfileData,
  PayableRecord,
  ReceivableRecord,
  CustomerVehicleRecord
} from '../types';
import { formatCurrency } from '../utils/formatters';

interface SearchResultItem {
  id: string;
  type: 'item' | 'customer' | 'invoice' | 'supplier' | 'vehicle' | 'quotation' | 'transaction';
  title: string;
  subtitle: string;
  badge?: string;
  metaRight?: string;
  metaSubRight?: string;
  icon: string;
  action: () => void;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  parts: SparePart[];
  invoices: Invoice[];
  customers?: CustomerProfileData[];
  receivables?: ReceivableRecord[];
  payables?: PayableRecord[];
  onSelectPart: (part: SparePart) => void;
  onSelectInvoice: (invoice: Invoice) => void;
  onSelectCustomer?: (customer: CustomerProfileData | ReceivableRecord) => void;
  onSelectSupplier?: (supplier: PayableRecord) => void;
  onNavigate: (screen: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  parts,
  invoices,
  customers = [],
  receivables = [],
  payables = [],
  onSelectPart,
  onSelectInvoice,
  onSelectCustomer,
  onSelectSupplier,
  onNavigate
}) => {
  const [query, setQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState<string>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Grouped search evaluation
  const groupedResults = useMemo(() => {
    const q = query.trim().toLowerCase();

    // 1. Items
    const matchingItems: SearchResultItem[] = parts
      .filter(
        (p) =>
          !q ||
          p.name?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.oemPartNumber?.toLowerCase().includes(q) ||
          p.rackBin?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.barcode?.toLowerCase().includes(q)
      )
      .slice(0, 6)
      .map((p) => ({
        id: `item-${p.id}`,
        type: 'item',
        title: p.name || 'Unnamed Part',
        subtitle: `${p.sku || 'N/A'} • Bin: ${p.rackBin || 'N/A'} • ${p.brand || 'Generic'} ${p.oemPartNumber ? `• OEM: ${p.oemPartNumber}` : ''}`,
        badge: p.status,
        metaRight: formatCurrency(p.counterPrice || 0),
        metaSubRight: `Stock: ${p.currentStock || 0} pcs`,
        icon: 'two_wheeler',
        action: () => {
          onClose();
          onSelectPart(p);
        }
      }));

    // 2. Customers
    const matchingCustomers: SearchResultItem[] = [
      ...customers,
      ...receivables.filter((r) => !customers.some((c) => c.id === r.customerId))
    ]
      .filter(
        (c: any) =>
          !q ||
          c.name?.toLowerCase().includes(q) ||
          c.customerName?.toLowerCase().includes(q) ||
          c.mobile?.includes(q) ||
          c.gstin?.toLowerCase().includes(q)
      )
      .slice(0, 5)
      .map((c: any) => {
        const name = c.name || c.customerName || 'Customer';
        const out = c.outstanding || 0;
        return {
          id: `cust-${c.id || c.customerId}`,
          type: 'customer',
          title: name,
          subtitle: `📱 ${c.mobile || 'N/A'} • ${c.customerType || 'Customer'} ${c.gstin ? `• GSTIN: ${c.gstin}` : ''}`,
          badge: c.tier || (out > 0 ? 'DUE' : 'CLEAR'),
          metaRight: formatCurrency(out),
          metaSubRight: out > 0 ? 'Outstanding' : 'No Due',
          icon: 'person',
          action: () => {
            onClose();
            if (onSelectCustomer) onSelectCustomer(c);
            else onNavigate('customers');
          }
        };
      });

    // 3. Invoices
    const matchingInvoices: SearchResultItem[] = invoices
      .filter(
        (inv) =>
          !q ||
          inv.id?.toLowerCase().includes(q) ||
          inv.invoiceNumber?.toLowerCase().includes(q) ||
          inv.customerName?.toLowerCase().includes(q) ||
          inv.vehicleNo?.toLowerCase().includes(q) ||
          inv.bikeModel?.toLowerCase().includes(q)
      )
      .slice(0, 5)
      .map((inv) => ({
        id: `inv-${inv.id}`,
        type: 'invoice',
        title: `${inv.invoiceNumber || inv.id} — ${inv.customerName || 'Walk-in'}`,
        subtitle: `${inv.vehicleNo || 'Walk-in'} (${inv.bikeModel || 'General'}) • ${inv.createdAt || 'Today'} • ${inv.payMode || 'Cash'}`,
        badge: inv.status,
        metaRight: formatCurrency(inv.totalAmount || 0),
        metaSubRight: `${inv.lineItems?.length || 0} items`,
        icon: 'receipt_long',
        action: () => {
          onClose();
          onSelectInvoice(inv);
        }
      }));

    // 4. Suppliers
    const matchingSuppliers: SearchResultItem[] = payables
      .filter(
        (s) =>
          !q ||
          s.supplierName?.toLowerCase().includes(q) ||
          s.contactPerson?.toLowerCase().includes(q) ||
          s.mobile?.includes(q) ||
          s.gstin?.toLowerCase().includes(q)
      )
      .slice(0, 4)
      .map((s) => ({
        id: `sup-${s.supplierId}`,
        type: 'supplier',
        title: s.supplierName,
        subtitle: `Contact: ${s.contactPerson || 'N/A'} (${s.mobile || 'N/A'}) • ${s.brandFocus || 'All'}`,
        badge: s.status,
        metaRight: formatCurrency(s.outstanding || 0),
        metaSubRight: 'Payable Due',
        icon: 'local_shipping',
        action: () => {
          onClose();
          if (onSelectSupplier) onSelectSupplier(s);
          else onNavigate('payables');
        }
      }));

    // 5. Vehicles (from customer vehicles)
    const matchingVehicles: SearchResultItem[] = [];
    customers.forEach((cust) => {
      (cust.vehicles || []).forEach((veh: CustomerVehicleRecord) => {
        if (
          !q ||
          veh.regNo?.toLowerCase().includes(q) ||
          veh.model?.toLowerCase().includes(q) ||
          veh.manufacturer?.toLowerCase().includes(q) ||
          cust.name?.toLowerCase().includes(q)
        ) {
          if (matchingVehicles.length < 4) {
            matchingVehicles.push({
              id: `veh-${veh.id}`,
              type: 'vehicle' as const,
              title: `${veh.regNo || 'N/A'} — ${veh.manufacturer || ''} ${veh.model || ''}`,
              subtitle: `Owner: ${cust.name || 'Owner'} (${cust.mobile || 'N/A'}) • Year: ${veh.year || '2023'}`,
              badge: `${veh.history?.length || 0} Services`,
              metaRight: veh.variant || `${veh.year || '2023'}`,
              metaSubRight: 'Motorcycle',
              icon: 'moped',
              action: () => {
                onClose();
                if (onSelectCustomer) onSelectCustomer(cust);
                else onNavigate('customers');
              }
            });
          }
        }
      });
    });

    // 6. Transactions & Quotations
    const matchingTransactions: SearchResultItem[] = [
      {
        id: 'tx-101',
        type: 'quotation' as const,
        title: 'EST/2026/0084 — Arun Workshop Engine Overhaul',
        subtitle: 'Valid till 30 Sep 2026 • 12 Spare SKUs listed',
        badge: 'ESTIMATE',
        metaRight: '₹18,450.00',
        metaSubRight: 'Quotation',
        icon: 'request_quote',
        action: () => {
          onClose();
          onNavigate('quotations');
        }
      },
      {
        id: 'tx-102',
        type: 'transaction' as const,
        title: 'REC-9042 — Collection from Sri Balaji Auto',
        subtitle: 'Payment Receipt via UPI GPay • Ref: 489201940',
        badge: 'RECEIPT',
        metaRight: '₹12,000.00',
        metaSubRight: 'Cleared',
        icon: 'payments',
        action: () => {
          onClose();
          onNavigate('payment-receipts');
        }
      }
    ].filter((t) => !q || t.title.toLowerCase().includes(q) || t.subtitle.toLowerCase().includes(q)) as SearchResultItem[];

    return {
      all: [
        ...matchingItems,
        ...matchingCustomers,
        ...matchingInvoices,
        ...matchingSuppliers,
        ...matchingVehicles,
        ...matchingTransactions
      ],
      items: matchingItems,
      customers: matchingCustomers,
      invoices: matchingInvoices,
      suppliers: matchingSuppliers,
      vehicles: matchingVehicles,
      transactions: matchingTransactions
    };
  }, [query, parts, invoices, customers, receivables, payables, onClose, onSelectPart, onSelectInvoice, onSelectCustomer, onSelectSupplier, onNavigate]);

  const activeResults: SearchResultItem[] = groupedResults[activeGroup as keyof typeof groupedResults] || groupedResults.all;

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeGroup]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < activeResults.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : activeResults.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeResults[selectedIndex]) {
          activeResults[selectedIndex].action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeResults, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-14 p-4 animate-in fade-in duration-100">
      <div className="bg-surface-container-lowest w-full max-w-2xl rounded-lg shadow-2xl border border-surface-container-highest overflow-hidden flex flex-col max-h-[85vh]">
        {/* Search Input */}
        <div className="p-3 bg-surface-container flex items-center gap-3 border-b border-surface-container-high">
          <span className="material-symbols-outlined text-secondary text-[22px]">search</span>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search parts (BP-1234), mobile (9876543210), Pulsar 150, invoices (INV-102), suppliers..."
            className="w-full bg-transparent text-sm text-on-surface font-medium focus:outline-none placeholder:text-outline"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-outline hover:text-on-surface text-xs"
            >
              <span className="material-symbols-outlined text-[18px]">clear</span>
            </button>
          )}
          <kbd className="px-1.5 py-0.5 rounded bg-surface-container-high text-outline text-[10px] font-mono border border-surface-container-highest">
            ESC
          </kbd>
        </div>

        {/* Group Filter Tabs */}
        <div className="px-3 py-1.5 bg-surface-container-low border-b border-surface-container-high flex items-center gap-1.5 overflow-x-auto text-[11px]">
          {[
            { id: 'all', label: 'All Results', count: groupedResults.all.length },
            { id: 'items', label: 'Items & Spares', count: groupedResults.items.length },
            { id: 'customers', label: 'Customers', count: groupedResults.customers.length },
            { id: 'invoices', label: 'Invoices', count: groupedResults.invoices.length },
            { id: 'suppliers', label: 'Suppliers', count: groupedResults.suppliers.length },
            { id: 'vehicles', label: 'Vehicles', count: groupedResults.vehicles.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveGroup(tab.id)}
              className={`px-2.5 py-1 rounded-full font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
                activeGroup === tab.id
                  ? 'bg-secondary text-on-secondary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1 rounded-full text-[9px] ${
                  activeGroup === tab.id
                    ? 'bg-on-secondary-fixed text-on-secondary'
                    : 'bg-surface-container text-outline'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-surface-container-high/40">
          {activeResults.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <span className="material-symbols-outlined text-3xl text-outline">search_off</span>
              <div className="text-xs font-bold text-on-surface">No results found for "{query}"</div>
              <p className="text-[11px] text-outline max-w-xs mx-auto">
                Try searching with Part Number (e.g. "BP-1234"), Customer Name, Vehicle Reg No ("TN 01"), or 10-digit mobile number.
              </p>
            </div>
          ) : (
            activeResults.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-2.5 rounded cursor-pointer flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-secondary text-on-secondary shadow-xs'
                      : 'hover:bg-surface-container-low text-on-surface'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
                    <div
                      className={`w-7 h-7 rounded flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'bg-on-secondary-fixed text-on-secondary'
                          : 'bg-surface-container text-secondary'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-xs leading-tight truncate flex items-center gap-1.5">
                        <span className="truncate">{item.title}</span>
                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-bold flex-shrink-0 ${
                              isSelected
                                ? 'bg-secondary-container text-on-secondary'
                                : 'bg-surface-container text-outline'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-[11px] truncate mt-0.5 ${
                          isSelected ? 'text-on-secondary/80' : 'text-outline'
                        }`}
                      >
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    {item.metaRight && (
                      <div
                        className={`font-mono font-bold text-xs ${
                          isSelected ? 'text-on-secondary' : 'text-secondary'
                        }`}
                      >
                        {item.metaRight}
                      </div>
                    )}
                    {item.metaSubRight && (
                      <div
                        className={`text-[10px] ${
                          isSelected ? 'text-on-secondary/80' : 'text-outline'
                        }`}
                      >
                        {item.metaSubRight}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-2.5 bg-surface-container border-t border-surface-container-high flex items-center justify-between text-[11px] text-outline">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Open Details</span>
            <span>Esc Close</span>
          </div>
          <span className="font-mono text-[10px]">Ctrl + K Global Omnibox</span>
        </div>
      </div>
    </div>
  );
};
