import React, { useState, useMemo } from 'react';
import { PurchaseReturnRecord, PurchaseReturnMethod } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { EmptyState } from '../common/EmptyState';
import { Breadcrumbs } from '../common/Breadcrumbs';

interface PurchaseReturnsViewProps {
  purchaseReturns: PurchaseReturnRecord[];
  onOpenCreateModal: () => void;
  onPrintDebitNote: (ret: PurchaseReturnRecord) => void;
  onViewReturnDetail: (ret: PurchaseReturnRecord) => void;
  onNavigate?: (screen: string) => void;
}

export const PurchaseReturnsView: React.FC<PurchaseReturnsViewProps> = ({
  purchaseReturns,
  onOpenCreateModal,
  onPrintDebitNote,
  onViewReturnDetail,
  onNavigate = () => {}
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');

  const filteredReturns = useMemo(() => {
    return purchaseReturns.filter((r) => {
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        r.debitNoteNumber.toLowerCase().includes(query) ||
        r.poNumber.toLowerCase().includes(query) ||
        (r.supplierInvoiceNo && r.supplierInvoiceNo.toLowerCase().includes(query)) ||
        r.supplierName.toLowerCase().includes(query) ||
        r.reason.toLowerCase().includes(query) ||
        r.items.some((it) => it.itemName.toLowerCase().includes(query) || it.partNumber.toLowerCase().includes(query));

      const matchesMethod = methodFilter === 'ALL' || r.returnMethod === methodFilter;

      return matchesSearch && matchesMethod;
    });
  }, [purchaseReturns, searchTerm, methodFilter]);

  // Statistics
  const stats = useMemo(() => {
    const totalCount = purchaseReturns.length;
    const totalReturnValue = purchaseReturns.reduce((sum, r) => sum + r.totalAmount, 0);
    const supplierCreditValue = purchaseReturns
      .filter((r) => r.returnMethod === 'Supplier Credit')
      .reduce((sum, r) => sum + r.totalAmount, 0);
    const totalUnitsDeducted = purchaseReturns.reduce(
      (sum, r) => sum + r.items.reduce((iSum, it) => iSum + it.returnQuantity, 0),
      0
    );

    return { totalCount, totalReturnValue, supplierCreditValue, totalUnitsDeducted };
  }, [purchaseReturns]);

  return (
    <div className="flex flex-col w-full pb-10 space-y-3 animate-in fade-in duration-100">
      <Breadcrumbs activeScreen="purchase-returns" onNavigate={onNavigate} />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface-container-lowest p-4 rounded border border-surface-container-high shadow-xs gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-2xl">replay</span>
            <h1 className="font-headline-md text-base font-bold text-on-surface">
              Purchase Returns &amp; Debit Notes (GSTR-2 ITC Reversal)
            </h1>
          </div>
          <p className="text-xs text-outline mt-0.5">
            Return damaged or wrong OEM spares to suppliers, atomically deduct physical stock, issue GST debit notes, and reduce payables
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCreateModal}
            className="px-3.5 py-1.5 bg-secondary hover:bg-secondary-container text-on-secondary rounded text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">remove_shopping_cart</span>
            <span>+ Process Purchase Return</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs">
          <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Total Debit Notes</span>
          <div className="font-mono text-lg font-bold text-on-surface mt-0.5">{stats.totalCount} Returns</div>
          <span className="text-[11px] text-outline">{stats.totalUnitsDeducted} units returned to vendor</span>
        </div>
        <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs">
          <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Total Return Value</span>
          <div className="font-mono text-lg font-bold text-secondary mt-0.5">
            {formatCurrency(stats.totalReturnValue)}
          </div>
          <span className="text-[11px] text-secondary">Supplier cost value</span>
        </div>
        <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs">
          <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Payable Reductions</span>
          <div className="font-mono text-lg font-bold text-tertiary mt-0.5">
            {formatCurrency(stats.supplierCreditValue)}
          </div>
          <span className="text-[11px] text-tertiary">Deducted from supplier ledger</span>
        </div>
        <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs">
          <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Stock Ledger Impact</span>
          <div className="font-mono text-lg font-bold text-on-surface mt-0.5">
            -{stats.totalUnitsDeducted} Units
          </div>
          <span className="text-[11px] text-outline">Atomic stock decrease</span>
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
            placeholder="Search by Debit Note #, PO #, Supplier, Part SKU..."
            className="w-full pl-8 pr-3 py-1.5 bg-surface-container-low border border-surface-container-highest rounded text-xs text-on-surface focus:outline-none focus:border-secondary"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-outline font-medium">Settlement Method:</span>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-surface-container-low border border-surface-container-highest rounded text-xs text-on-surface focus:outline-none font-medium"
          >
            <option value="ALL">All Methods</option>
            <option value="Supplier Credit">Supplier Credit (Payable Deduction)</option>
            <option value="Supplier Refund">Supplier Direct Refund</option>
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

      {/* Purchase Returns Table */}
      <div className="bg-surface-container-lowest rounded border border-surface-container-high shadow-xs overflow-hidden">
        {filteredReturns.length === 0 ? (
          <EmptyState
            icon="replay"
            title="No Purchase Returns Recorded"
            description={
              searchTerm || methodFilter !== 'ALL'
                ? `No purchase return records matched your search query. Try clearing filters.`
                : 'No supplier debit notes or purchase returns recorded yet. Create a return against an existing PO.'
            }
            actionLabel="+ Process Purchase Return"
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
                  <th className="py-2.5 px-3">Debit Note #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">PO / Bill Ref</th>
                  <th className="py-2.5 px-3">Supplier Agency</th>
                  <th className="py-2.5 px-3">Returned Spares</th>
                  <th className="py-2.5 px-3 text-right">Debit Value</th>
                  <th className="py-2.5 px-3">Settlement Method</th>
                  <th className="py-2.5 px-3">Reason</th>
                  <th className="py-2.5 px-3 text-center">Stock Movement</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high font-table-cell">
                {filteredReturns.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-secondary">
                      <button onClick={() => onViewReturnDetail(r)} className="hover:underline">
                        {r.debitNoteNumber}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-outline whitespace-nowrap">{r.date}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-on-surface">
                      {r.poNumber}
                      {r.supplierInvoiceNo && (
                        <span className="text-outline font-normal block text-[11px]">
                          Inv: {r.supplierInvoiceNo}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-on-surface">{r.supplierName}</div>
                      {r.supplierGstin && (
                        <div className="text-[11px] text-outline font-mono">GSTIN: {r.supplierGstin}</div>
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
                      {formatCurrency(r.totalAmount)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider bg-tertiary-fixed text-on-tertiary-fixed">
                        {r.returnMethod.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-outline max-w-xs truncate" title={r.reason}>
                      {r.reason}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-error-container text-on-error-container font-bold text-[9px] uppercase tracking-wider flex items-center justify-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                        DEDUCTED (-{r.items.reduce((s, it) => s + it.returnQuantity, 0)})
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onPrintDebitNote(r)}
                          className="p-1 rounded hover:bg-surface-container text-secondary"
                          title="Print GST Debit Note"
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
