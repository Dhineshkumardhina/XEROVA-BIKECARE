import React, { useState, useMemo } from 'react';
import { Quotation, QuotationStatus } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { EmptyState } from '../common/EmptyState';
import { Breadcrumbs } from '../common/Breadcrumbs';

interface QuotationsViewProps {
  quotations: Quotation[];
  onOpenCreateModal: () => void;
  onViewQuotation: (quote: Quotation) => void;
  onEditQuotation: (quote: Quotation) => void;
  onDuplicateQuotation: (quote: Quotation) => void;
  onPrintQuotation: (quote: Quotation) => void;
  onShareQuotation: (quote: Quotation) => void;
  onCancelQuotation: (quote: Quotation) => void;
  onConvertToInvoice: (quote: Quotation) => void;
  onNavigate?: (screen: string) => void;
}

export const QuotationsView: React.FC<QuotationsViewProps> = ({
  quotations,
  onOpenCreateModal,
  onViewQuotation,
  onEditQuotation,
  onDuplicateQuotation,
  onPrintQuotation,
  onShareQuotation,
  onCancelQuotation,
  onConvertToInvoice,
  onNavigate = () => {}
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');

  const filteredQuotations = useMemo(() => {
    return quotations.filter((q) => {
      // Search term match
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        q.quotationNumber.toLowerCase().includes(query) ||
        q.customerName.toLowerCase().includes(query) ||
        (q.customerMobile && q.customerMobile.includes(query)) ||
        (q.vehicleNumber && q.vehicleNumber.toLowerCase().includes(query)) ||
        (q.vehicleModel && q.vehicleModel.toLowerCase().includes(query)) ||
        q.items.some((it) => it.itemName.toLowerCase().includes(query) || it.partNumber.toLowerCase().includes(query));

      // Status filter
      const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;

      // Amount filter
      const numMin = minAmount ? parseFloat(minAmount) : null;
      const numMax = maxAmount ? parseFloat(maxAmount) : null;
      const matchesMin = numMin === null || isNaN(numMin) || q.totalAmount >= numMin;
      const matchesMax = numMax === null || isNaN(numMax) || q.totalAmount <= numMax;

      return matchesSearch && matchesStatus && matchesMin && matchesMax;
    });
  }, [quotations, searchTerm, statusFilter, minAmount, maxAmount]);

  // Statistics Summary
  const stats = useMemo(() => {
    const totalCount = quotations.length;
    const pendingCount = quotations.filter((q) => q.status === 'SENT' || q.status === 'ACCEPTED').length;
    const convertedCount = quotations.filter((q) => q.status === 'CONVERTED').length;
    const totalEstimateValue = quotations.reduce((sum, q) => sum + q.totalAmount, 0);
    const convertedValue = quotations
      .filter((q) => q.status === 'CONVERTED')
      .reduce((sum, q) => sum + q.totalAmount, 0);

    return { totalCount, pendingCount, convertedCount, totalEstimateValue, convertedValue };
  }, [quotations]);

  const getStatusBadge = (status: QuotationStatus) => {
    switch (status) {
      case 'DRAFT':
        return (
          <span className="px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider bg-surface-container-highest text-outline flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
            DRAFT
          </span>
        );
      case 'SENT':
        return (
          <span className="px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider bg-secondary-container text-on-secondary-container flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            SENT
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider bg-tertiary-fixed text-on-tertiary-fixed flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
            ACCEPTED
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider bg-error-container text-on-error-container flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
            REJECTED
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider bg-surface-container-high text-outline flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
            EXPIRED
          </span>
        );
      case 'CONVERTED':
        return (
          <span className="px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider bg-primary-container text-on-primary-container flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            CONVERTED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded font-bold text-[9px] uppercase tracking-wider bg-surface-container text-outline">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col w-full pb-10 space-y-3 animate-in fade-in duration-100">
      <Breadcrumbs activeScreen="quotations" onNavigate={onNavigate} />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface-container-lowest p-4 rounded border border-surface-container-high shadow-xs gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-2xl">request_quote</span>
            <h1 className="font-headline-md text-base font-bold text-on-surface">
              Quotations &amp; Spare Estimates
            </h1>
          </div>
          <p className="text-xs text-outline mt-0.5">
            Draft proforma spare-parts &amp; service estimates with GST, vehicle fitment, 15-day price locking, and 1-click invoice conversion
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCreateModal}
            className="px-3.5 py-1.5 bg-secondary hover:bg-secondary-container text-on-secondary rounded text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>+ Create Quotation</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs">
          <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Total Quotations</span>
          <div className="font-mono text-lg font-bold text-on-surface mt-0.5">{stats.totalCount} Quotes</div>
          <span className="text-[11px] text-outline">{formatCurrency(stats.totalEstimateValue)} total value</span>
        </div>
        <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs">
          <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Active / Pending</span>
          <div className="font-mono text-lg font-bold text-secondary mt-0.5">{stats.pendingCount} Active</div>
          <span className="text-[11px] text-secondary">Awaiting customer approval</span>
        </div>
        <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs">
          <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Converted to POS</span>
          <div className="font-mono text-lg font-bold text-tertiary mt-0.5">{stats.convertedCount} Invoices</div>
          <span className="text-[11px] text-tertiary">{formatCurrency(stats.convertedValue)} realized</span>
        </div>
        <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs">
          <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Conversion Ratio</span>
          <div className="font-mono text-lg font-bold text-on-surface mt-0.5">
            {stats.totalCount > 0 ? `${Math.round((stats.convertedCount / stats.totalCount) * 100)}%` : '0%'}
          </div>
          <span className="text-[11px] text-outline">From estimates to counter sales</span>
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
            placeholder="Search by Quote #, Customer, Mobile, Vehicle, SKU..."
            className="w-full pl-8 pr-3 py-1.5 bg-surface-container-low border border-surface-container-highest rounded text-xs text-on-surface focus:outline-none focus:border-secondary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-outline font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-surface-container-low border border-surface-container-highest rounded text-xs text-on-surface focus:outline-none font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">DRAFT</option>
              <option value="SENT">SENT</option>
              <option value="ACCEPTED">ACCEPTED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="EXPIRED">EXPIRED</option>
              <option value="CONVERTED">CONVERTED</option>
            </select>
          </div>

          {/* Amount Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-outline font-medium">Amount:</span>
            <input
              type="number"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              placeholder="Min ₹"
              className="w-16 px-2 py-1.5 bg-surface-container-low border border-surface-container-highest rounded text-xs font-mono"
            />
            <span className="text-outline">-</span>
            <input
              type="number"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              placeholder="Max ₹"
              className="w-16 px-2 py-1.5 bg-surface-container-low border border-surface-container-highest rounded text-xs font-mono"
            />
          </div>

          {(searchTerm || statusFilter !== 'ALL' || minAmount || maxAmount) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
                setMinAmount('');
                setMaxAmount('');
              }}
              className="px-2 py-1 text-outline hover:text-error text-xs font-medium flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">close</span>
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-surface-container-lowest rounded border border-surface-container-high shadow-xs overflow-hidden">
        {filteredQuotations.length === 0 ? (
          <EmptyState
            icon="request_quote"
            title="No Quotations Found"
            description={
              searchTerm || statusFilter !== 'ALL'
                ? `No quotations matched your current filter criteria. Try resetting filters.`
                : 'No estimate quotations created yet. Draft a new quotation to get started.'
            }
            actionLabel="+ Create Quotation"
            onAction={onOpenCreateModal}
            secondaryActionLabel={searchTerm || statusFilter !== 'ALL' ? 'Clear Filters' : undefined}
            onSecondaryAction={
              searchTerm || statusFilter !== 'ALL'
                ? () => {
                    setSearchTerm('');
                    setStatusFilter('ALL');
                    setMinAmount('');
                    setMaxAmount('');
                  }
                : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-surface-container font-label-caps text-[10px] text-outline uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Quotation No</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Customer / Mobile</th>
                  <th className="py-2.5 px-3">Vehicle Details</th>
                  <th className="py-2.5 px-3 text-center">Items</th>
                  <th className="py-2.5 px-3 text-right">Taxable</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3">Valid Until</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3">Created By</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high font-table-cell">
                {filteredQuotations.map((q) => {
                  const isExpired = new Date(q.validUntil).getTime() < Date.now() && q.status !== 'CONVERTED';
                  const displayStatus = q.status === 'CONVERTED' ? 'CONVERTED' : isExpired ? 'EXPIRED' : q.status;

                  return (
                    <tr key={q.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-secondary">
                        <button
                          onClick={() => onViewQuotation(q)}
                          className="hover:underline text-left"
                        >
                          {q.quotationNumber}
                        </button>
                      </td>
                      <td className="py-2.5 px-3 text-outline whitespace-nowrap">{q.date}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-on-surface">{q.customerName}</div>
                        {q.customerMobile && (
                          <div className="text-[11px] text-outline font-mono">{q.customerMobile}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-outline">
                        {q.vehicleNumber ? (
                          <div>
                            <span className="font-mono text-on-surface font-medium">{q.vehicleNumber}</span>
                            {q.vehicleModel && (
                              <span className="text-[11px] text-outline block">{q.vehicleModel}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-outline italic">Counter Spare Estimate</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface font-medium">
                          {q.items.length} SKUs
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-outline">
                        {formatCurrency(q.taxableAmount)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-on-surface">
                        {formatCurrency(q.totalAmount)}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={isExpired ? 'text-error font-medium' : 'text-outline'}>
                          {q.validUntil}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {getStatusBadge(displayStatus)}
                      </td>
                      <td className="py-2.5 px-3 text-outline text-[11px] whitespace-nowrap">
                        {q.createdBy}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* View Detail */}
                          <button
                            onClick={() => onViewQuotation(q)}
                            className="p-1 rounded hover:bg-surface-container text-on-surface-variant"
                            title="View Quotation Details"
                          >
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                          </button>

                          {/* Print Estimate */}
                          <button
                            onClick={() => onPrintQuotation(q)}
                            className="p-1 rounded hover:bg-surface-container text-secondary"
                            title="Print Proforma Estimate"
                          >
                            <span className="material-symbols-outlined text-[16px]">print</span>
                          </button>

                          {/* Share WhatsApp */}
                          <button
                            onClick={() => onShareQuotation(q)}
                            className="p-1 rounded hover:bg-surface-container text-tertiary"
                            title="Share via WhatsApp / Web"
                          >
                            <span className="material-symbols-outlined text-[16px]">share</span>
                          </button>

                          {/* Duplicate */}
                          <button
                            onClick={() => onDuplicateQuotation(q)}
                            className="p-1 rounded hover:bg-surface-container text-outline hover:text-on-surface"
                            title="Duplicate as New Revision"
                          >
                            <span className="material-symbols-outlined text-[16px]">content_copy</span>
                          </button>

                          {/* Convert to Invoice */}
                          {q.status !== 'CONVERTED' && !isExpired && (
                            <button
                              onClick={() => onConvertToInvoice(q)}
                              className="px-2 py-0.5 rounded bg-secondary hover:bg-secondary-container text-on-secondary text-[10px] font-bold transition-colors ml-1"
                              title="Convert directly to POS Sales Invoice"
                            >
                              Convert
                            </button>
                          )}

                          {q.status === 'CONVERTED' && q.convertedInvoiceNo && (
                            <span
                              className="px-1.5 py-0.5 rounded bg-surface-container text-primary font-mono text-[10px] font-bold"
                              title={`Converted to Invoice #${q.convertedInvoiceNo}`}
                            >
                              #{q.convertedInvoiceNo}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
