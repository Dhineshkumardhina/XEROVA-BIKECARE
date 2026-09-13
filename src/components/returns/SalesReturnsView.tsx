import React, { useState, useMemo } from 'react';
import { SalesReturnRecord, SalesReturnMethod } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { EmptyState } from '../common/EmptyState';
import { Breadcrumbs } from '../common/Breadcrumbs';

interface SalesReturnsViewProps {
  salesReturns: SalesReturnRecord[];
  onOpenCreateModal: () => void;
  onPrintCreditNote: (ret: SalesReturnRecord) => void;
  onViewReturnDetail: (ret: SalesReturnRecord) => void;
  onNavigate?: (screen: string) => void;
}

export const SalesReturnsView: React.FC<SalesReturnsViewProps> = ({
  salesReturns,
  onOpenCreateModal,
  onPrintCreditNote,
  onViewReturnDetail,
  onNavigate = () => {}
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');

  const filteredReturns = useMemo(() => {
    return salesReturns.filter((r) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        r.creditNoteNumber.toLowerCase().includes(query) ||
        r.invoiceNumber.toLowerCase().includes(query) ||
        r.customerName.toLowerCase().includes(query) ||
        (r.customerMobile && r.customerMobile.includes(query)) ||
        r.reason.toLowerCase().includes(query) ||
        r.items.some((it) => it.itemName.toLowerCase().includes(query) || it.partNumber.toLowerCase().includes(query));

      const matchesMethod = methodFilter === 'ALL' || r.refundMethod === methodFilter;

      return matchesSearch && matchesMethod;
    });
  }, [salesReturns, searchTerm, methodFilter]);

  // Statistics
  const stats = useMemo(() => {
    const totalCount = salesReturns.length;
    const totalRefundValue = salesReturns.reduce((sum, r) => sum + r.refundAmount, 0);
    const customerCreditValue = salesReturns
      .filter((r) => r.refundMethod === 'Customer Credit')
      .reduce((sum, r) => sum + r.refundAmount, 0);
    const cashUpiRefundValue = salesReturns
      .filter((r) => r.refundMethod !== 'Customer Credit')
      .reduce((sum, r) => sum + r.refundAmount, 0);
    const totalUnitsRestocked = salesReturns.reduce(
      (sum, r) => sum + r.items.reduce((iSum, it) => iSum + it.returnQuantity, 0),
      0
    );

    return { totalCount, totalRefundValue, customerCreditValue, cashUpiRefundValue, totalUnitsRestocked };
  }, [salesReturns]);

  const getMethodBadge = (method: SalesReturnMethod) => {
    switch (method) {
      case 'Customer Credit':
        return (
          <span className="px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider bg-tertiary-fixed text-on-tertiary-fixed">
            CUSTOMER CREDIT
          </span>
        );
      case 'Cash Refund':
        return (
          <span className="px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider bg-secondary-container text-on-secondary-container">
            CASH REFUND
          </span>
        );
      case 'UPI Refund':
        return (
          <span className="px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider bg-primary-container text-on-primary-container">
            UPI REFUND
          </span>
        );
      case 'Bank Refund':
        return (
          <span className="px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider bg-surface-container-highest text-on-surface">
            BANK REFUND
          </span>
        );
      default:
        return <span className="text-outline text-xs">{method}</span>;
    }
  };

  return (
    <div className="flex flex-col w-full pb-10 space-y-3 animate-in fade-in duration-100">
      <Breadcrumbs activeScreen="sales-returns" onNavigate={onNavigate} />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface-container-lowest p-4 rounded border border-surface-container-high shadow-xs gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-2xl">assignment_return</span>
            <h1 className="font-headline-md text-base font-bold text-on-surface">
              Sales Returns &amp; Credit Notes (GSTR-1 CDNR)
            </h1>
          </div>
          <p className="text-xs text-outline mt-0.5">
            Process customer counter returns, restock inventory atomically, issue GST credit notes, and adjust receivables or cash refunds
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCreateModal}
            className="px-3.5 py-1.5 bg-secondary hover:bg-secondary-container text-on-secondary rounded text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
            <span>+ Process Sales Return</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs">
          <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Total Credit Notes</span>
          <div className="font-mono text-lg font-bold text-on-surface mt-0.5">{stats.totalCount} Returns</div>
          <span className="text-[11px] text-outline">{stats.totalUnitsRestocked} units restocked</span>
        </div>
        <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs">
          <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Total Return Value</span>
          <div className="font-mono text-lg font-bold text-secondary mt-0.5">
            {formatCurrency(stats.totalRefundValue)}
          </div>
          <span className="text-[11px] text-secondary">Reversed from sales</span>
        </div>
        <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs">
          <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Customer Credits</span>
          <div className="font-mono text-lg font-bold text-tertiary mt-0.5">
            {formatCurrency(stats.customerCreditValue)}
          </div>
          <span className="text-[11px] text-tertiary">Adjusted in ledger balance</span>
        </div>
        <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs">
          <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Cash / Bank Refunds</span>
          <div className="font-mono text-lg font-bold text-on-surface mt-0.5">
            {formatCurrency(stats.cashUpiRefundValue)}
          </div>
          <span className="text-[11px] text-outline">Paid back to customers</span>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <span className="material-symbols-outlined absolute left-2.5 top-2 text-outline text-[16px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Credit Note #, Invoice #, Customer, Part SKU..."
            className="w-full pl-8 pr-3 py-1.5 bg-surface-container-low border border-surface-container-highest rounded text-xs text-on-surface focus:outline-none focus:border-secondary"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-outline font-medium">Refund Method:</span>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-surface-container-low border border-surface-container-highest rounded text-xs text-on-surface focus:outline-none font-medium"
          >
            <option value="ALL">All Methods</option>
            <option value="Customer Credit">Customer Credit</option>
            <option value="Cash Refund">Cash Refund</option>
            <option value="UPI Refund">UPI Refund</option>
            <option value="Bank Refund">Bank Refund</option>
          </select>

          {(searchTerm || methodFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setMethodFilter('ALL');
              }}
              className="px-2 py-1 text-outline hover:text-error text-xs font-medium flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Sales Returns Table */}
      <div className="bg-surface-container-lowest rounded border border-surface-container-high shadow-xs overflow-hidden">
        {filteredReturns.length === 0 ? (
          <EmptyState
            icon="assignment_return"
            title="No Sales Returns Recorded"
            description={
              searchTerm || methodFilter !== 'ALL'
                ? `No sales return records matched your search query. Try clearing filters.`
                : 'No counter sales returns or credit notes issued yet. Process a return against an existing invoice.'
            }
            actionLabel="+ Process Sales Return"
            onAction={onOpenCreateModal}
            secondaryActionLabel={searchTerm || methodFilter !== 'ALL' ? 'Clear Filters' : undefined}
            onSecondaryAction={
              searchTerm || methodFilter !== 'ALL'
                ? () => {
                    setSearchTerm('');
                    setMethodFilter('ALL');
                  }
                : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-surface-container font-label-caps text-[10px] text-outline uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Credit Note #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Orig. Invoice</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Returned Items</th>
                  <th className="py-2.5 px-3 text-right">Refund Value</th>
                  <th className="py-2.5 px-3">Return Method</th>
                  <th className="py-2.5 px-3">Reason</th>
                  <th className="py-2.5 px-3 text-center">Stock Ledger</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high font-table-cell">
                {filteredReturns.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-secondary">
                      <button onClick={() => onViewReturnDetail(r)} className="hover:underline">
                        {r.creditNoteNumber}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-outline whitespace-nowrap">{r.date}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-on-surface">
                      {r.invoiceNumber}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-on-surface">{r.customerName}</div>
                      {r.customerMobile && (
                        <div className="text-[11px] text-outline font-mono">{r.customerMobile}</div>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="max-w-xs">
                        {r.items.map((it, i) => (
                          <div key={i} className="text-on-surface truncate">
                            <span className="font-mono font-bold text-secondary">[{it.partNumber}]</span>{' '}
                            {it.itemName} ({it.returnQuantity} pcs)
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-on-surface">
                      {formatCurrency(r.refundAmount)}
                    </td>
                    <td className="py-2.5 px-3">{getMethodBadge(r.refundMethod)}</td>
                    <td className="py-2.5 px-3 text-outline max-w-xs truncate" title={r.reason}>
                      {r.reason}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-bold text-[9px] uppercase tracking-wider flex items-center justify-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                        RESTOCKED (+{r.items.reduce((s, it) => s + it.returnQuantity, 0)})
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onPrintCreditNote(r)}
                          className="p-1 rounded hover:bg-surface-container text-secondary"
                          title="Print GST Credit Note"
                        >
                          <span className="material-symbols-outlined text-[16px]">print</span>
                        </button>
                        <button
                          onClick={() => onViewReturnDetail(r)}
                          className="p-1 rounded hover:bg-surface-container text-on-surface-variant"
                          title="View Return Details"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
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
    </div>
  );
};
