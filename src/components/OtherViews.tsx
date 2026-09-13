import React, { useState } from 'react';
import { Invoice, SparePart } from '../types';
import { formatCurrency, formatQuantity, formatDate } from '../utils/formatters';
import { EmptyState } from './common/EmptyState';
import { Breadcrumbs } from './common/Breadcrumbs';

interface OtherViewsProps {
  view: string;
  invoices: Invoice[];
  parts: SparePart[];
  onViewInvoice: (inv: Invoice) => void;
  onPrintInvoice: (inv: Invoice) => void;
  onOpenNewBill: () => void;
  onOpenPoModal: (partName: string) => void;
  onNavigate?: (screen: string) => void;
  onRequestVoidInvoice?: (invoice: Invoice) => void;
}

export const OtherViews: React.FC<OtherViewsProps> = ({
  view,
  invoices,
  parts,
  onViewInvoice,
  onPrintInvoice,
  onOpenNewBill,
  onOpenPoModal,
  onNavigate = (_screen: string) => {},
  onRequestVoidInvoice
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // ==========================================
  // 1. SALES INVOICES REGISTER
  // ==========================================
  if (view === 'invoices') {
    const filtered = invoices.filter((inv) => {
      const matchesSearch =
        !searchTerm ||
        inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (inv.vehicleNo && inv.vehicleNo.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return (
      <div className="flex flex-col w-full pb-10 space-y-3 animate-in fade-in duration-100">
        <Breadcrumbs activeScreen="invoices" onNavigate={onNavigate} />

        <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface-container-lowest p-4 rounded border border-surface-container-high shadow-xs gap-3">
          <div>
            <h1 className="font-headline-md text-base font-bold text-on-surface">
              Sales Invoices &amp; Counter Register
            </h1>
            <p className="text-xs text-outline mt-0.5">
              Chronological ledger of retail counter bills, B2B workshop invoices, and credit sales
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenNewBill}
              className="px-3.5 py-1.5 bg-secondary hover:bg-secondary-container text-on-secondary rounded text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>New POS Sale [F4]</span>
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-outline text-[16px]">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Invoice #, Customer, Vehicle Reg No..."
              className="w-full pl-8 pr-3 py-1.5 bg-surface-container-low border border-surface-container-highest rounded text-xs text-on-surface focus:outline-none focus:border-secondary"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-surface-container-low border border-surface-container-highest rounded text-xs text-on-surface focus:outline-none font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="PAID">PAID</option>
              <option value="CREDIT">CREDIT / DUE</option>
              <option value="PARTIAL">PARTIALLY PAID</option>
              <option value="VOID">VOID / CANCELLED</option>
            </select>
          </div>
        </div>

        {/* Table / Empty state */}
        {filtered.length === 0 ? (
          <EmptyState
            icon="receipt_long"
            title="No Invoices Found"
            description="No sales invoices have been recorded yet. Launch the POS counter to create your first invoice."
            actionLabel="Start New Sale [F4]"
            onAction={onOpenNewBill}
          />
        ) : (
          <div className="bg-surface-container-lowest rounded border border-surface-container-high shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-surface-container font-label-caps text-[10px] text-outline uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Date &amp; Time</th>
                  <th className="py-2.5 px-3">Customer / Party</th>
                  <th className="py-2.5 px-3">Vehicle #</th>
                  <th className="py-2.5 px-3 text-right">Items</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                  <th className="py-2.5 px-3 text-right">GST</th>
                  <th className="py-2.5 px-3 text-right">Grand Total</th>
                  <th className="py-2.5 px-3">Tender Mode</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high font-table-cell">
                {filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-2 px-3 font-mono font-bold text-secondary">{inv.id}</td>
                    <td className="py-2 px-3 text-outline">{inv.date}</td>
                    <td className="py-2 px-3 font-semibold text-on-surface">{inv.customerName}</td>
                    <td className="py-2 px-3 font-mono text-outline">{inv.vehicleNo || '—'}</td>
                    <td className="py-2 px-3 text-right font-mono">{inv.items.length}</td>
                    <td className="py-2 px-3 text-right font-mono">{formatCurrency(inv.subtotal)}</td>
                    <td className="py-2 px-3 text-right font-mono">{formatCurrency(inv.tax)}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-on-surface">
                      {formatCurrency(inv.total)}
                    </td>
                    <td className="py-2 px-3">
                      <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface font-semibold text-[10px]">
                        {inv.paymentMethod}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase ${
                          inv.status === 'PAID'
                            ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                            : inv.status === 'CREDIT'
                            ? 'bg-error-container text-on-error-container'
                            : 'bg-surface-container-high text-outline'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onViewInvoice(inv)}
                          className="p-1 rounded hover:bg-surface-container text-outline hover:text-on-surface"
                          title="View Invoice"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                        </button>
                        <button
                          onClick={() => onPrintInvoice(inv)}
                          className="p-1 rounded hover:bg-surface-container text-secondary"
                          title="Print Thermal / A4"
                        >
                          <span className="material-symbols-outlined text-[16px]">print</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // 2. QUOTATIONS / ESTIMATES
  // ==========================================
  if (view === 'quotations') {
    return (
      <div className="flex flex-col w-full pb-10 space-y-3 animate-in fade-in duration-100">
        <Breadcrumbs activeScreen="quotations" onNavigate={onNavigate} />

        <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface-container-lowest p-4 rounded border border-surface-container-high shadow-xs gap-3">
          <div>
            <h1 className="font-headline-md text-base font-bold text-on-surface">
              Quotations &amp; Spare Estimates
            </h1>
            <p className="text-xs text-outline mt-0.5">
              Draft formal proforma quotations with price lock and convert directly to sales invoices
            </p>
          </div>
          <button
            onClick={onOpenNewBill}
            className="px-3.5 py-1.5 bg-secondary hover:bg-secondary-container text-on-secondary rounded text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>+ Create Quotation</span>
          </button>
        </div>

        <EmptyState
          icon="request_quote"
          title="No Quotations Recorded"
          description="Create proforma spare-part estimates for customers and workshops."
          actionLabel="Create First Quotation"
          onAction={onOpenNewBill}
        />
      </div>
    );
  }

  // ==========================================
  // 3. SALES RETURNS & CREDIT NOTES
  // ==========================================
  if (view === 'sales-returns') {
    return (
      <div className="flex flex-col w-full pb-10 space-y-3 animate-in fade-in duration-100">
        <Breadcrumbs activeScreen="sales-returns" onNavigate={onNavigate} />

        <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface-container-lowest p-4 rounded border border-surface-container-high shadow-xs gap-3">
          <div>
            <h1 className="font-headline-md text-base font-bold text-on-surface">
              Sales Returns &amp; Credit Notes
            </h1>
            <p className="text-xs text-outline mt-0.5">
              Audited counter returns register, automatic inventory restock, and GST credit note generation
            </p>
          </div>
          <button
            onClick={() => onNavigate('pos')}
            className="px-3.5 py-1.5 bg-secondary hover:bg-secondary-container text-on-secondary rounded text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">assignment_return</span>
            <span>+ Process POS Return</span>
          </button>
        </div>

        <EmptyState
          icon="assignment_return"
          title="No Sales Returns Recorded"
          description="Returns processed at the POS counter will be recorded here with complete audit trail and restock notes."
          actionLabel="Go to POS Counter"
          onAction={() => onNavigate('pos')}
        />
      </div>
    );
  }

  // ==========================================
  // 4. PURCHASE ENTRY / PO & GRN
  // ==========================================
  if (view === 'purchase-orders') {
    return (
      <div className="flex flex-col w-full pb-10 space-y-3 animate-in fade-in duration-100">
        <Breadcrumbs activeScreen="purchase-orders" onNavigate={onNavigate} />

        <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface-container-lowest p-4 rounded border border-surface-container-high shadow-xs gap-3">
          <div>
            <h1 className="font-headline-md text-base font-bold text-on-surface">
              Purchase Orders (PO) &amp; Goods Receipt (GRN)
            </h1>
            <p className="text-xs text-outline mt-0.5">
              Inward stock verification, supplier invoice reconciliation, and automatic rack allocation
            </p>
          </div>
          <button
            onClick={() => onOpenPoModal('New Spares Bulk Purchase Inward')}
            className="px-3.5 py-1.5 bg-secondary hover:bg-secondary-container text-on-secondary rounded text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
            <span>+ Create Supplier PO</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-surface-container-lowest p-3.5 rounded border border-surface-container-high shadow-xs">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">
              Active Purchase Orders
            </span>
            <div className="font-mono text-lg font-bold text-on-surface mt-1">0 Orders</div>
            <span className="text-[11px] text-secondary">₹0.00 in transit</span>
          </div>
          <div className="bg-surface-container-lowest p-3.5 rounded border border-surface-container-high shadow-xs">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">
              Pending GRN Inward
            </span>
            <div className="font-mono text-lg font-bold text-on-surface mt-1">0 Shipments</div>
            <span className="text-[11px] text-outline">All shipments inwarded</span>
          </div>
          <div className="bg-surface-container-lowest p-3.5 rounded border border-surface-container-high shadow-xs">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">
              Month Purchases
            </span>
            <div className="font-mono text-lg font-bold text-on-surface mt-1">₹0.00</div>
            <span className="text-[11px] text-on-tertiary-container">Clean procurement cycle</span>
          </div>
        </div>

        <EmptyState
          icon="inventory"
          title="No Inward Shipments"
          description="Create purchase orders to inward supplier spare parts into warehouse racks."
          actionLabel="Create First PO"
          onAction={() => onOpenPoModal('New Spares Inward')}
        />
      </div>
    );
  }

  // ==========================================
  // 5. PURCHASE RETURNS / DEBIT NOTES
  // ==========================================
  if (view === 'purchase-returns') {
    return (
      <div className="flex flex-col w-full pb-10 space-y-3 animate-in fade-in duration-100">
        <Breadcrumbs activeScreen="purchase-returns" onNavigate={onNavigate} />

        <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface-container-lowest p-4 rounded border border-surface-container-high shadow-xs gap-3">
          <div>
            <h1 className="font-headline-md text-base font-bold text-on-surface">
              Purchase Returns &amp; Supplier Debit Notes
            </h1>
            <p className="text-xs text-outline mt-0.5">
              Record damaged in-transit goods, defective spare parts return, and issue GST debit notes to suppliers
            </p>
          </div>
        </div>

        <EmptyState
          icon="replay"
          title="No Supplier Debit Notes"
          description="When returning defective parts to suppliers, debit notes will be listed here with financial reconciliation."
          actionLabel="Go to Item Master"
          onAction={() => onNavigate('items-master')}
        />
      </div>
    );
  }

  // ==========================================
  // 6. CATEGORIES & BRANDS MASTER
  // ==========================================
  if (view === 'categories-master' || view === 'brands-master') {
    const isCategory = view === 'categories-master';
    
    // Dynamically derive categories and brands from current parts inventory
    const categoryMap = new Map<string, { count: number; value: number }>();
    const brandMap = new Map<string, number>();

    parts.forEach((p) => {
      const cat = p.category || 'General Spares';
      const prevC = categoryMap.get(cat) || { count: 0, value: 0 };
      categoryMap.set(cat, {
        count: prevC.count + 1,
        value: prevC.value + (p.currentStock * p.purchasePrice)
      });

      const br = p.brand || 'Aftermarket';
      brandMap.set(br, (brandMap.get(br) || 0) + 1);
    });

    const categoryList = Array.from(categoryMap.entries()).map(([name, data]) => ({
      name,
      skus: data.count,
      value: data.value,
      icon: 'category'
    }));

    const brandList = Array.from(brandMap.entries()).map(([name, count]) => ({
      name,
      skus: count,
      country: 'India'
    }));

    return (
      <div className="flex flex-col w-full pb-10 space-y-3 animate-in fade-in duration-100">
        <Breadcrumbs activeScreen={view} onNavigate={onNavigate} />

        <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface-container-lowest p-4 rounded border border-surface-container-high shadow-xs gap-3">
          <div>
            <h1 className="font-headline-md text-base font-bold text-on-surface">
              {isCategory ? 'Spare Parts Category Master' : 'OEM & Aftermarket Brand Master'}
            </h1>
            <p className="text-xs text-outline mt-0.5">
              {isCategory
                ? 'Structured categorization for two-wheeler motorcycle components and fast lookup'
                : 'Authorized spare parts manufacturers, OEM genuine lines, and high-performance brands'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('items-master')}
            className="px-3.5 py-1.5 bg-secondary hover:bg-secondary-container text-on-secondary rounded text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">list</span>
            <span>View Item Master (F2)</span>
          </button>
        </div>

        {isCategory && categoryList.length === 0 && (
          <EmptyState
            icon="category"
            title="No Categories Defined"
            description="Categories are automatically populated as you add spare parts to your Item Master."
            actionLabel="Add New Part"
            onAction={() => onNavigate('items-master')}
          />
        )}

        {!isCategory && brandList.length === 0 && (
          <EmptyState
            icon="branding_watermark"
            title="No Brands Registered"
            description="Brands are automatically organized as you catalog new OEM and aftermarket spares."
            actionLabel="Add New Part"
            onAction={() => onNavigate('items-master')}
          />
        )}

        {isCategory && categoryList.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {categoryList.map((cat, idx) => (
              <div
                key={idx}
                onClick={() => onNavigate('items-master')}
                className="p-4 bg-surface-container-lowest rounded border border-surface-container-high shadow-xs hover:border-secondary cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-surface-container text-secondary flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface text-xs">{cat.name}</h3>
                    <div className="text-[11px] text-outline mt-0.5">
                      {formatQuantity(cat.skus, 'SKUs')} • Valuation: {formatCurrency(cat.value)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isCategory && brandList.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {brandList.map((br, idx) => (
              <div
                key={idx}
                onClick={() => onNavigate('items-master')}
                className="p-4 bg-surface-container-lowest rounded border border-surface-container-high shadow-xs hover:border-secondary cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-on-surface text-xs">{br.name}</h3>
                    <div className="text-[11px] text-outline mt-0.5">
                      {formatQuantity(br.skus, 'Catalog Parts')} • {br.country}
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline text-[18px]">chevron_right</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Default Fallback
  return (
    <div className="flex flex-col w-full pb-10 space-y-3 animate-in fade-in duration-100">
      <Breadcrumbs activeScreen={view} onNavigate={onNavigate} />
      <EmptyState
        icon="dashboard"
        title={`View: ${view.replace(/-/g, ' ').toUpperCase()}`}
        description="This operational ERP module is ready for use."
        actionLabel="Go to Dashboard"
        onAction={() => onNavigate('dashboard')}
      />
    </div>
  );
};
