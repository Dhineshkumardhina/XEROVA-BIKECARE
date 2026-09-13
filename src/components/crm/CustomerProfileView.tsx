import React, { useState } from 'react';
import {
  CustomerProfileData,
  CustomerVehicleRecord,
  Invoice,
  CustomerLedgerEntry,
  ReceiptVoucher,
  LoyaltyTransactionRecord,
  CommunicationLogRecord,
  CustomerQuotation,
  CustomerSalesReturn
} from '../../types';

interface CustomerProfileViewProps {
  customer: CustomerProfileData;
  invoices: Invoice[];
  customerLedger: CustomerLedgerEntry[];
  receipts: ReceiptVoucher[];
  loyaltyTransactions: LoyaltyTransactionRecord[];
  communicationLogs: CommunicationLogRecord[];
  quotations?: CustomerQuotation[];
  salesReturns?: CustomerSalesReturn[];
  onBack: () => void;
  onOpenAddVehicle: () => void;
  onOpenSendMessage: () => void;
  onOpenAdjustPoints: () => void;
  onOpenRedeemPoints: () => void;
  onOpenCreateReceipt: () => void;
  onViewInvoice: (inv: Invoice) => void;
  onPrintInvoice: (inv: Invoice) => void;
}

export const CustomerProfileView: React.FC<CustomerProfileViewProps> = ({
  customer,
  invoices,
  customerLedger,
  receipts,
  loyaltyTransactions,
  communicationLogs,
  quotations = [],
  salesReturns = [],
  onBack,
  onOpenAddVehicle,
  onOpenSendMessage,
  onOpenAdjustPoints,
  onOpenRedeemPoints,
  onOpenCreateReceipt,
  onViewInvoice,
  onPrintInvoice
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'sales' | 'quotations' | 'returns' | 'ledger' | 'payments' | 'vehicles'
  >('overview');

  const [selectedVehicleForFilter, setSelectedVehicleForFilter] = useState<string>('ALL');

  // Customer specific records
  const customerInvoices = invoices.filter(
    i => i.customerName.toLowerCase() === customer.name.toLowerCase() || (i.gstin && i.gstin === customer.gstin)
  );

  const customerReceipts = receipts.filter(
    r => r.customerId === customer.id || r.customerName.toLowerCase() === customer.name.toLowerCase()
  );

  // Tabs list
  const tabs = [
    { id: 'overview', label: '1. Overview', icon: 'dashboard' },
    { id: 'sales', label: '2. Sales Invoices', icon: 'receipt_long', count: customerInvoices.length },
    { id: 'quotations', label: '3. Quotations', icon: 'request_quote', count: quotations.length },
    { id: 'returns', label: '4. Returns', icon: 'assignment_return', count: salesReturns.length },
    { id: 'ledger', label: '5. Ledger Statement', icon: 'menu_book' },
    { id: 'payments', label: '6. Payment Receipts', icon: 'payments', count: customerReceipts.length },
    { id: 'vehicles', label: '7. Vehicles & Spares History', icon: 'two_wheeler', count: customer.vehicles.length }
  ] as const;

  // Filtered vehicles history
  const allVehiclePartsHistory = customer.vehicles.flatMap(v =>
    v.history.map(h => ({ ...h, vehicleRegNo: v.regNo, vehicleModel: `${v.manufacturer} ${v.model}` }))
  );

  const displayedVehicleParts = selectedVehicleForFilter === 'ALL'
    ? allVehiclePartsHistory
    : allVehiclePartsHistory.filter(h => h.vehicleRegNo === selectedVehicleForFilter);

  return (
    <div className="flex flex-col w-full pb-14 space-y-gutter animate-in fade-in duration-150">
      {/* Back navigation & Top Control Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded text-xs font-semibold transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Back to Customers Directory</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSendMessage}
            className="px-3 py-1.5 bg-surface-container text-on-surface hover:bg-surface-container-high rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-secondary">chat</span>
            <span>WhatsApp / SMS</span>
          </button>
          {customer.outstanding > 0 && (
            <button
              onClick={onOpenCreateReceipt}
              className="px-3 py-1.5 bg-secondary text-on-secondary hover:bg-secondary-container rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">receipt</span>
              <span>Record Payment Receipt</span>
            </button>
          )}
        </div>
      </div>

      {/* Customer Master Profile Header Card */}
      <div className="bg-surface-container-lowest p-gutter rounded border border-surface-container-high shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Identity Info */}
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded bg-surface-container flex items-center justify-center text-secondary font-bold text-lg">
              {customer.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-headline-lg text-xl font-bold text-on-surface">{customer.name}</h1>
                <span className="px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed text-xs font-bold uppercase">
                  {customer.customerType}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                  customer.status === 'Active' ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-error-container text-on-error-container'
                }`}>
                  {customer.status}
                </span>
                {customer.loyaltyTier && (
                  <span className="px-2 py-0.5 rounded bg-surface-container-highest text-secondary text-xs font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">stars</span>
                    <span>{customer.loyaltyTier} Club</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-outline mt-1.5 font-medium">
                <span className="flex items-center gap-1 text-on-surface font-mono">
                  <span className="material-symbols-outlined text-[14px] text-outline">call</span>
                  {customer.mobile}
                </span>
                {customer.email && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">mail</span>
                    {customer.email}
                  </span>
                )}
                {customer.gstin && (
                  <span className="flex items-center gap-1 font-mono">
                    <span className="material-symbols-outlined text-[14px]">badge</span>
                    GSTIN: <strong className="text-on-surface">{customer.gstin}</strong>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">home_pin</span>
                  {customer.address}, {customer.city}
                </span>
              </div>
            </div>
          </div>

          {/* Core Balance & Points Badges */}
          <div className="flex items-center gap-3 border-t lg:border-t-0 lg:border-l border-surface-container-high pt-3 lg:pt-0 lg:pl-4">
            {/* Outstanding Balance */}
            <div className="p-2.5 rounded bg-surface-container-low border border-surface-container-high text-right min-w-[130px]">
              <span className="text-[10px] font-bold text-outline uppercase block">Outstanding Balance</span>
              <div className={`font-mono text-lg font-bold mt-0.5 ${customer.outstanding > 0 ? 'text-error' : 'text-on-tertiary-container'}`}>
                ₹{customer.outstanding.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-outline">
                Limit: ₹{customer.creditLimit.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Loyalty Points */}
            <div className="p-2.5 rounded bg-surface-container-low border border-surface-container-high text-right min-w-[130px]">
              <span className="text-[10px] font-bold text-outline uppercase block">Loyalty Points</span>
              <div className="font-mono text-lg font-bold text-secondary mt-0.5">
                {customer.loyaltyPoints} pts
              </div>
              <span className="text-[10px] text-outline">
                Worth ₹{(customer.loyaltyPoints * 1.0).toFixed(0)} discount
              </span>
            </div>
          </div>
        </div>

        {/* Quick Tags / Segment labels */}
        {customer.segmentTags && customer.segmentTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-surface-container-high">
            <span className="text-[11px] font-bold text-outline">Segments:</span>
            {customer.segmentTags.map(tag => (
              <span key={tag} className="px-2 py-0.5 rounded bg-surface-container text-on-surface text-[11px] font-medium">
                {tag}
              </span>
            ))}
            {customer.referredByMechanicName && (
              <span className="px-2 py-0.5 rounded bg-surface-container-high text-secondary text-[11px] font-semibold flex items-center gap-1 ml-auto">
                <span className="material-symbols-outlined text-[13px]">handyman</span>
                <span>Referred by: {customer.referredByMechanicName}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Profile Horizontal Tabs Navigation (Responsive scrollable) */}
      <div className="border-b border-surface-container-high bg-surface-container-lowest rounded-t overflow-x-auto">
        <div className="flex items-center min-w-max">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-secondary text-secondary bg-surface-container-low'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              <span>{tab.label}</span>
              {'count' in tab && tab.count !== undefined && (
                <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeTab === tab.id ? 'bg-secondary text-on-secondary' : 'bg-surface-container text-outline'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-gutter">
          {/* Overview Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-space-sm">
            <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs">
              <span className="font-label-caps text-label-caps text-outline uppercase">Total Sales</span>
              <div className="font-mono text-lg font-bold text-on-surface mt-1">₹{customer.totalSales.toLocaleString('en-IN')}</div>
              <span className="text-[11px] text-outline">Gross billings</span>
            </div>

            <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs">
              <span className="font-label-caps text-label-caps text-outline uppercase">Total Invoices</span>
              <div className="font-mono text-lg font-bold text-on-surface mt-1">{customer.totalPurchasesCount} orders</div>
              <span className="text-[11px] text-outline">Counter &amp; B2B</span>
            </div>

            <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs">
              <span className="font-label-caps text-label-caps text-outline uppercase">Average Bill Value</span>
              <div className="font-mono text-lg font-bold text-on-surface mt-1">₹{customer.avgBillValue.toLocaleString('en-IN')}</div>
              <span className="text-[11px] text-outline">Per transaction</span>
            </div>

            <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs">
              <span className="font-label-caps text-label-caps text-outline uppercase">Outstanding</span>
              <div className={`font-mono text-lg font-bold mt-1 ${customer.outstanding > 0 ? 'text-error' : 'text-on-tertiary-container'}`}>
                ₹{customer.outstanding.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-outline">Due balance</span>
            </div>

            <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs">
              <span className="font-label-caps text-label-caps text-outline uppercase">Last Purchase</span>
              <div className="font-mono text-sm font-bold text-on-surface mt-1.5">{customer.lastPurchaseDate}</div>
              <span className="text-[11px] text-outline">Recent visit</span>
            </div>

            <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs">
              <span className="font-label-caps text-label-caps text-outline uppercase">Loyalty Points</span>
              <div className="font-mono text-lg font-bold text-secondary mt-1">{customer.loyaltyPoints} pts</div>
              <span className="text-[11px] text-secondary font-medium">Active points</span>
            </div>
          </div>

          {/* Dual Overview Sections: Registered Vehicles & Recent Invoices */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-sm">
            {/* Registered Bikes */}
            <div className="bg-surface-container-lowest rounded border border-surface-container-high shadow-xs p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-secondary">two_wheeler</span>
                  <h3 className="font-headline-md text-sm font-bold text-on-surface">Registered Customer Bikes ({customer.vehicles.length})</h3>
                </div>
                <button
                  onClick={onOpenAddVehicle}
                  className="text-secondary text-xs font-semibold hover:underline"
                >
                  + Add Vehicle
                </button>
              </div>

              {customer.vehicles.length === 0 ? (
                <div className="p-6 text-center text-outline text-xs bg-surface-container-low rounded border border-surface-container-high">
                  No vehicles linked to this customer yet. Click "+ Add Vehicle" to attach bikes.
                </div>
              ) : (
                <div className="space-y-2">
                  {customer.vehicles.map(veh => (
                    <div
                      key={veh.id}
                      onClick={() => {
                        setSelectedVehicleForFilter(veh.regNo);
                        setActiveTab('vehicles');
                      }}
                      className="p-3 rounded bg-surface-container-low border border-surface-container-high hover:border-secondary transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-secondary text-xs">{veh.regNo}</span>
                          <span className="font-bold text-on-surface text-xs">{veh.manufacturer} {veh.model}</span>
                        </div>
                        <div className="text-[11px] text-outline mt-0.5">
                          {veh.variant || 'Standard'} • Year: {veh.year || 'N/A'} • {veh.history.length} parts purchased
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-[16px] text-outline">arrow_forward</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Sales History */}
            <div className="bg-surface-container-lowest rounded border border-surface-container-high shadow-xs p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-secondary">receipt_long</span>
                  <h3 className="font-headline-md text-sm font-bold text-on-surface">Recent Counter Bills</h3>
                </div>
                <button
                  onClick={() => setActiveTab('sales')}
                  className="text-secondary text-xs font-semibold hover:underline"
                >
                  View All Sales
                </button>
              </div>

              <div className="space-y-2">
                {customerInvoices.slice(0, 4).map(inv => (
                  <div key={inv.id} className="p-2.5 rounded bg-surface-container-low border border-surface-container-high flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-secondary">{inv.id}</span>
                        <span className="text-outline">{inv.createdAt}</span>
                      </div>
                      <div className="text-[11px] text-outline mt-0.5">
                        {inv.vehicleNo || 'Counter Sale'} • {inv.lineItems.length} items • Pay: {inv.payMode}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-on-surface">₹{inv.totalAmount.toFixed(2)}</div>
                      <span className="text-[10px] font-bold text-on-tertiary-container uppercase">{inv.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Sales Invoices */}
      {activeTab === 'sales' && (
        <div className="bg-surface-container-lowest rounded border border-surface-container-high shadow-xs overflow-hidden">
          <div className="p-3 bg-surface-container border-b border-surface-container-high flex items-center justify-between">
            <span className="font-headline-md text-sm font-bold text-on-surface">Sales Invoices &amp; Inward Receipts Ledger</span>
            <span className="text-xs text-outline">{customerInvoices.length} Invoices on record</span>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-surface-container-low font-label-caps text-on-surface-variant uppercase text-[10px]">
              <tr>
                <th className="p-2.5">Invoice #</th>
                <th className="p-2.5">Date / Time</th>
                <th className="p-2.5">Vehicle</th>
                <th className="p-2.5 text-right">Subtotal</th>
                <th className="p-2.5 text-right">GST</th>
                <th className="p-2.5 text-right">Total Amount</th>
                <th className="p-2.5">Pay Mode</th>
                <th className="p-2.5 text-center">Status</th>
                <th className="p-2.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-table-cell">
              {customerInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-surface-container-low">
                  <td className="p-2.5 font-mono font-bold text-secondary">{inv.id}</td>
                  <td className="p-2.5 text-outline">{inv.createdAt}</td>
                  <td className="p-2.5 text-on-surface">{inv.vehicleNo || 'Walk-in'} ({inv.bikeModel || 'General'})</td>
                  <td className="p-2.5 text-right font-mono">₹{inv.subtotal.toFixed(2)}</td>
                  <td className="p-2.5 text-right font-mono text-outline">₹{(inv.cgst + inv.sgst).toFixed(2)}</td>
                  <td className="p-2.5 text-right font-mono font-bold text-on-surface">₹{inv.totalAmount.toFixed(2)}</td>
                  <td className="p-2.5 font-mono text-[11px]">{inv.payMode}</td>
                  <td className="p-2.5 text-center">
                    <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-bold text-[10px] uppercase">
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-2.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onPrintInvoice(inv)}
                        className="p-1 rounded text-secondary hover:bg-surface-container"
                        title="Print"
                      >
                        <span className="material-symbols-outlined text-[16px]">print</span>
                      </button>
                      <button
                        onClick={() => onViewInvoice(inv)}
                        className="p-1 rounded text-on-surface-variant hover:bg-surface-container"
                        title="View Invoice"
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

      {/* Tab 3: Quotations */}
      {activeTab === 'quotations' && (
        <div className="bg-surface-container-lowest rounded border border-surface-container-high shadow-xs overflow-hidden">
          <div className="p-3 bg-surface-container border-b border-surface-container-high flex items-center justify-between">
            <span className="font-headline-md text-sm font-bold text-on-surface">Estimates &amp; Proforma Quotations</span>
            <button
              onClick={() => alert(`Creating new quotation for ${customer.name}...`)}
              className="px-3 py-1 bg-secondary text-on-secondary rounded text-xs font-semibold flex items-center gap-1 shadow-xs"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              <span>+ Create Quotation</span>
            </button>
          </div>

          {quotations.length === 0 ? (
            <div className="p-8 text-center text-outline text-xs">No quotations recorded for this customer yet.</div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-surface-container-low font-label-caps text-on-surface-variant uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">Quotation #</th>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Validity</th>
                  <th className="p-2.5">Bike Model</th>
                  <th className="p-2.5 text-right">Items</th>
                  <th className="p-2.5 text-right">Total Value</th>
                  <th className="p-2.5 text-center">Status</th>
                  <th className="p-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high font-table-cell">
                {quotations.map(q => (
                  <tr key={q.id} className="hover:bg-surface-container-low">
                    <td className="p-2.5 font-mono font-bold text-secondary">{q.id}</td>
                    <td className="p-2.5 text-outline">{q.date}</td>
                    <td className="p-2.5 text-outline">{q.expiryDate}</td>
                    <td className="p-2.5">{q.bikeModel || 'General'}</td>
                    <td className="p-2.5 text-right font-mono">{q.itemsCount}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-on-surface">₹{q.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="p-2.5 text-center">
                      <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-bold text-[10px] uppercase">
                        {q.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-center">
                      <button onClick={() => alert(`Printing Quotation ${q.id}...`)} className="text-secondary hover:underline font-semibold">Print</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab 4: Returns */}
      {activeTab === 'returns' && (
        <div className="bg-surface-container-lowest rounded border border-surface-container-high shadow-xs overflow-hidden">
          <div className="p-3 bg-surface-container border-b border-surface-container-high flex items-center justify-between">
            <span className="font-headline-md text-sm font-bold text-on-surface">Sales Returns &amp; Credit Notes</span>
            <span className="text-xs text-outline">{salesReturns.length} Return Notes</span>
          </div>

          {salesReturns.length === 0 ? (
            <div className="p-8 text-center text-outline text-xs">No sales returns recorded for this customer.</div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-surface-container-low font-label-caps text-on-surface-variant uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">Return #</th>
                  <th className="p-2.5">Date</th>
                  <th className="p-2.5">Invoice Ref</th>
                  <th className="p-2.5">Reason</th>
                  <th className="p-2.5 text-right">Items Count</th>
                  <th className="p-2.5 text-right">Credit Amount</th>
                  <th className="p-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high font-table-cell">
                {salesReturns.map(r => (
                  <tr key={r.id} className="hover:bg-surface-container-low">
                    <td className="p-2.5 font-mono font-bold text-error">{r.id}</td>
                    <td className="p-2.5 text-outline">{r.date}</td>
                    <td className="p-2.5 font-mono text-secondary font-bold">{r.invoiceRef}</td>
                    <td className="p-2.5 text-on-surface-variant">{r.reason}</td>
                    <td className="p-2.5 text-right font-mono">{r.itemsCount}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-error">₹{r.creditAmount.toFixed(2)}</td>
                    <td className="p-2.5 text-center">
                      <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-bold text-[10px] uppercase">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab 5: Ledger Statement */}
      {activeTab === 'ledger' && (
        <div className="bg-surface-container-lowest rounded border border-surface-container-high shadow-xs overflow-hidden space-y-3 p-4">
          <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
            <div>
              <h3 className="font-headline-md text-sm font-bold text-on-surface">Customer Running Ledger Statement</h3>
              <p className="text-xs text-outline">Debit (Invoices) / Credit (Payments &amp; Returns) chronological statement</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded text-xs font-semibold flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Print Statement</span>
              </button>
            </div>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-surface-container font-label-caps text-on-surface-variant uppercase text-[10px]">
              <tr>
                <th className="p-2.5">Date</th>
                <th className="p-2.5">Particulars / Description</th>
                <th className="p-2.5">Voucher / Ref #</th>
                <th className="p-2.5 text-right">Debit (₹)</th>
                <th className="p-2.5 text-right">Credit (₹)</th>
                <th className="p-2.5 text-right">Balance (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-table-cell">
              {customerLedger.map(entry => (
                <tr key={entry.id} className="hover:bg-surface-container-low">
                  <td className="p-2.5 text-outline font-mono">{entry.date}</td>
                  <td className="p-2.5 font-medium text-on-surface">{entry.particular}</td>
                  <td className="p-2.5 font-mono text-secondary font-bold">{entry.invoiceNo || entry.receiptNo || '—'}</td>
                  <td className="p-2.5 text-right font-mono">{entry.debit > 0 ? `₹${entry.debit.toLocaleString('en-IN')}` : '—'}</td>
                  <td className="p-2.5 text-right font-mono text-on-tertiary-container">{entry.credit > 0 ? `₹${entry.credit.toLocaleString('en-IN')}` : '—'}</td>
                  <td className="p-2.5 text-right font-mono font-bold text-on-surface">₹{entry.balance.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 6: Payment Receipts */}
      {activeTab === 'payments' && (
        <div className="bg-surface-container-lowest rounded border border-surface-container-high shadow-xs overflow-hidden">
          <div className="p-3 bg-surface-container border-b border-surface-container-high flex items-center justify-between">
            <span className="font-headline-md text-sm font-bold text-on-surface">Official Payment Receipts Received</span>
            <button
              onClick={onOpenCreateReceipt}
              className="px-3 py-1 bg-secondary text-on-secondary rounded text-xs font-semibold flex items-center gap-1 shadow-xs"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              <span>+ Record New Receipt</span>
            </button>
          </div>

          {customerReceipts.length === 0 ? (
            <div className="p-8 text-center text-outline text-xs">No payment receipt vouchers found.</div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-surface-container-low font-label-caps text-on-surface-variant uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">Receipt #</th>
                  <th className="p-2.5">Date / Time</th>
                  <th className="p-2.5">Payment Mode</th>
                  <th className="p-2.5">Reference / Txn #</th>
                  <th className="p-2.5 text-right">Amount Received</th>
                  <th className="p-2.5">Recorded By</th>
                  <th className="p-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high font-table-cell">
                {customerReceipts.map(rec => (
                  <tr key={rec.id} className="hover:bg-surface-container-low">
                    <td className="p-2.5 font-mono font-bold text-secondary">{rec.receiptNo}</td>
                    <td className="p-2.5 text-outline">{rec.date} {rec.time}</td>
                    <td className="p-2.5 font-medium">{rec.paymentMode}</td>
                    <td className="p-2.5 font-mono text-[11px] text-outline">{rec.refNo || 'Cash Receipt'}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-on-tertiary-container">₹{rec.amount.toLocaleString('en-IN')}</td>
                    <td className="p-2.5 text-outline text-[11px]">{rec.createdBy}</td>
                    <td className="p-2.5 text-center">
                      <button onClick={() => alert(`Printing Receipt Voucher ${rec.receiptNo}...`)} className="text-secondary hover:underline font-semibold">Print</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab 7: Vehicles & Multi-Vehicle Spare Parts History */}
      {activeTab === 'vehicles' && (
        <div className="space-y-gutter">
          {/* Header & Filter by vehicle */}
          <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface-container-lowest p-gutter rounded border border-surface-container-high shadow-xs gap-3">
            <div>
              <h3 className="font-headline-md text-sm font-bold text-on-surface">Customer Multi-Vehicle Fleet &amp; Spare Parts History</h3>
              <p className="text-xs text-outline">View parts purchased, service consumables, and replacement dates per bike</p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedVehicleForFilter}
                onChange={e => setSelectedVehicleForFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-surface-container border border-surface-container-high rounded text-xs font-semibold text-on-surface"
              >
                <option value="ALL">All Registered Bikes ({customer.vehicles.length})</option>
                {customer.vehicles.map(v => (
                  <option key={v.id} value={v.regNo}>{v.regNo} - {v.manufacturer} {v.model}</option>
                ))}
              </select>

              <button
                onClick={onOpenAddVehicle}
                className="px-3.5 py-1.5 bg-secondary text-on-secondary hover:bg-secondary-container rounded text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>+ Add Vehicle</span>
              </button>
            </div>
          </div>

          {/* Vehicle Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-sm">
            {customer.vehicles.map(veh => (
              <div
                key={veh.id}
                className={`p-3.5 rounded border transition-colors ${
                  selectedVehicleForFilter === veh.regNo
                    ? 'bg-surface-container-low border-secondary shadow-xs'
                    : 'bg-surface-container-lowest border-surface-container-high'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono font-bold text-sm text-secondary block">{veh.regNo}</span>
                    <h4 className="font-bold text-on-surface text-sm mt-0.5">{veh.manufacturer} {veh.model}</h4>
                    <div className="text-[11px] text-outline mt-0.5">{veh.variant || 'Standard'} • Model Year: {veh.year || 'N/A'}</div>
                  </div>
                  <span className="material-symbols-outlined text-2xl text-outline">two_wheeler</span>
                </div>

                {veh.notes && (
                  <div className="mt-2 p-1.5 rounded bg-surface-container text-[11px] text-on-surface-variant italic">
                    Note: {veh.notes}
                  </div>
                )}

                <div className="mt-3 pt-2 border-t border-surface-container-high flex items-center justify-between text-xs">
                  <span className="text-outline">{veh.history.length} parts recorded</span>
                  <button
                    onClick={() => setSelectedVehicleForFilter(veh.regNo)}
                    className="text-secondary font-semibold hover:underline"
                  >
                    Filter Parts &gt;
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Spare Parts & Service Purchase Log Table */}
          <div className="bg-surface-container-lowest rounded border border-surface-container-high shadow-xs overflow-hidden">
            <div className="p-3 bg-surface-container border-b border-surface-container-high flex items-center justify-between">
              <span className="font-headline-md text-sm font-bold text-on-surface">
                Spare Parts &amp; Service Consumables Replaced
                {selectedVehicleForFilter !== 'ALL' ? ` (For ${selectedVehicleForFilter})` : ' (All Bikes)'}
              </span>
              <span className="text-xs text-outline">{displayedVehicleParts.length} Records</span>
            </div>

            {displayedVehicleParts.length === 0 ? (
              <div className="p-8 text-center text-outline text-xs">No spare parts purchased for this vehicle yet.</div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-surface-container-low font-label-caps text-on-surface-variant uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Vehicle</th>
                    <th className="p-2.5">Invoice #</th>
                    <th className="p-2.5">Spare Part Name &amp; SKU</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5 text-right">Qty</th>
                    <th className="p-2.5 text-right">Rate</th>
                    <th className="p-2.5 text-right">Amount</th>
                    <th className="p-2.5 text-center">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high font-table-cell">
                  {displayedVehicleParts.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-surface-container-low">
                      <td className="p-2.5 text-outline font-mono">{item.date}</td>
                      <td className="p-2.5 font-bold text-on-surface">
                        <span className="font-mono text-secondary mr-1">{item.vehicleRegNo}</span>
                        <span className="text-[11px] text-outline">({item.vehicleModel})</span>
                      </td>
                      <td className="p-2.5 font-mono text-secondary font-bold">{item.invoiceNo}</td>
                      <td className="p-2.5">
                        <div className="font-semibold text-on-surface">{item.partName}</div>
                        <div className="font-mono text-[10px] text-outline">SKU: {item.sku}</div>
                      </td>
                      <td className="p-2.5 text-outline">{item.category}</td>
                      <td className="p-2.5 text-right font-mono">{item.qty}</td>
                      <td className="p-2.5 text-right font-mono">₹{item.rate.toFixed(2)}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-on-surface">₹{item.amount.toFixed(2)}</td>
                      <td className="p-2.5 text-center">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                          item.isService ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-surface-container text-on-surface'
                        }`}>
                          {item.isService ? 'Service Oil' : 'Spare Part'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

