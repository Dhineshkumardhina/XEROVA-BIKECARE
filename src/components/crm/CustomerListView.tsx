import React, { useState, useMemo } from 'react';
import { CustomerProfileData, CustomerType } from '../../types';

interface CustomerListViewProps {
  customers: CustomerProfileData[];
  onSelectCustomer: (customerId: string) => void;
  onOpenNewCustomer: () => void;
}

export const CustomerListView: React.FC<CustomerListViewProps> = ({
  customers,
  onSelectCustomer,
  onOpenNewCustomer
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [outstandingFilter, setOutstandingFilter] = useState<string>('ALL'); // ALL | OUTSTANDING_ONLY | ZERO_BALANCE
  const [statusFilter, setStatusFilter] = useState<string>('ALL'); // ALL | Active | Inactive | Blocked
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Multi-field search and filters
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      // Search by Name, Mobile, GSTIN, and any Vehicle Reg No
      const q = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.mobile.toLowerCase().includes(q) ||
        (c.gstin && c.gstin.toLowerCase().includes(q)) ||
        c.vehicles.some(v => v.regNo.toLowerCase().includes(q) || v.model.toLowerCase().includes(q));

      // Type Filter
      const matchesType = typeFilter === 'ALL' || c.customerType === typeFilter;

      // Outstanding Filter
      const matchesOutstanding =
        outstandingFilter === 'ALL' ||
        (outstandingFilter === 'OUTSTANDING_ONLY' && c.outstanding > 0) ||
        (outstandingFilter === 'ZERO_BALANCE' && c.outstanding === 0);

      // Status Filter
      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;

      return matchesSearch && matchesType && matchesOutstanding && matchesStatus;
    });
  }, [customers, searchTerm, typeFilter, outstandingFilter, statusFilter]);

  // Export to CSV
  const handleExportCsv = () => {
    const headers = [
      'Customer Name',
      'Mobile',
      'Customer Type',
      'GSTIN',
      'Total Sales',
      'Outstanding',
      'Loyalty Points',
      'Last Purchase',
      'Status',
      'City',
      'Vehicles Count'
    ];
    const rows = filteredCustomers.map(c => [
      `"${c.name}"`,
      `"${c.mobile}"`,
      `"${c.customerType}"`,
      `"${c.gstin || ''}"`,
      c.totalSales,
      c.outstanding,
      c.loyaltyPoints,
      `"${c.lastPurchaseDate}"`,
      `"${c.status}"`,
      `"${c.city}"`,
      c.vehicles.length
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `customers_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const customerTypes: (CustomerType | 'ALL')[] = [
    'ALL',
    'Retail',
    'Wholesale',
    'Mechanic',
    'Workshop',
    'Dealer',
    'Fleet'
  ];

  return (
    <div className="flex flex-col w-full pb-12 space-y-gutter animate-in fade-in duration-150">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface-container-lowest p-gutter rounded shadow-xs gap-3 border border-surface-container-high">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">groups</span>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Customer Directory &amp; Accounts</h1>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Manage counter retail buyers, wholesale distributors, bike mechanics, garages and multi-vehicle profiles
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 bg-surface-container text-on-surface hover:bg-surface-container-high rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Export filtered table to CSV"
          >
            <span className="material-symbols-outlined text-[16px] text-secondary">download</span>
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-surface-container text-on-surface hover:bg-surface-container-high rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Print</span>
          </button>
          <button
            onClick={onOpenNewCustomer}
            className="px-3.5 py-1.5 bg-secondary hover:bg-secondary-container text-on-secondary rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            <span>+ Add Customer</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-lowest p-3 rounded border border-surface-container-high shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-2">
          {/* Universal Search Input */}
          <div className="relative flex-1 w-full">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-[18px] text-outline">search</span>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by Customer Name, Mobile, GSTIN, or Vehicle Number (e.g. TN-01-AB-1234)..."
              className="w-full pl-9 pr-8 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-xs font-medium text-on-surface focus:outline-none focus:border-secondary transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-2 text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            )}
          </div>

          {/* Quick Mobile Drawer Toggle for small viewports */}
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="md:hidden w-full px-3 py-1.5 bg-surface-container text-on-surface rounded text-xs font-semibold flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">filter_list</span>
            <span>Toggle Filters</span>
          </button>

          {/* Customer Type Pills (Desktop) */}
          <div className="hidden md:flex items-center gap-1 overflow-x-auto pb-0.5 max-w-full">
            {customerTypes.map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors whitespace-nowrap ${
                  typeFilter === t
                    ? 'bg-secondary text-on-secondary shadow-xs'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {t === 'ALL' ? 'All Types' : t}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filter Row */}
        <div className={`flex flex-wrap items-center gap-3 pt-1 border-t border-surface-container-high text-xs ${isMobileFilterOpen ? 'block' : 'hidden md:flex'}`}>
          {/* Outstanding Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-outline font-medium">Balance:</span>
            <select
              value={outstandingFilter}
              onChange={e => setOutstandingFilter(e.target.value)}
              className="px-2 py-1 bg-surface-container-low border border-surface-container-high rounded text-xs font-medium text-on-surface focus:outline-none focus:border-secondary"
            >
              <option value="ALL">All Balances</option>
              <option value="OUTSTANDING_ONLY">Has Outstanding (&gt;₹0)</option>
              <option value="ZERO_BALANCE">Nil Outstanding (Settled)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-outline font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-2 py-1 bg-surface-container-low border border-surface-container-high rounded text-xs font-medium text-on-surface focus:outline-none focus:border-secondary"
            >
              <option value="ALL">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>

          {/* Result Count and Clear Filters */}
          <div className="ml-auto flex items-center gap-2 text-outline">
            <span>Showing <strong className="text-on-surface font-mono">{filteredCustomers.length}</strong> of {customers.length} customers</span>
            {(searchTerm || typeFilter !== 'ALL' || outstandingFilter !== 'ALL' || statusFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('ALL');
                  setOutstandingFilter('ALL');
                  setStatusFilter('ALL');
                }}
                className="text-secondary font-semibold hover:underline"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Customers Table */}
      <div className="bg-surface-container-lowest rounded border border-surface-container-high shadow-xs overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <span className="material-symbols-outlined text-4xl text-outline">search_off</span>
            <div className="font-bold text-on-surface text-base">No Customers Found</div>
            <p className="text-xs text-outline max-w-sm mx-auto">
              No matching customers found for your search query or selected filters. Try broadening your filter parameters.
            </p>
            <div className="pt-2">
              <button
                onClick={onOpenNewCustomer}
                className="px-4 py-2 bg-secondary text-on-secondary rounded text-xs font-bold shadow-xs"
              >
                + Register New Customer
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-surface-container font-label-caps text-on-surface-variant uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Customer Name</th>
                  <th className="py-2.5 px-3">Mobile</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">GSTIN</th>
                  <th className="py-2.5 px-3 text-right">Total Sales</th>
                  <th className="py-2.5 px-3 text-right">Outstanding</th>
                  <th className="py-2.5 px-3">City / Area</th>
                  <th className="py-2.5 px-3">Last Purchase</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high font-table-cell">
                {filteredCustomers.map(cust => (
                  <tr
                    key={cust.id}
                    className="hover:bg-surface-container-low transition-colors group cursor-pointer"
                    onClick={() => onSelectCustomer(cust.id)}
                  >
                    {/* Customer Name + Vehicles count */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-on-surface group-hover:text-secondary transition-colors">
                          {cust.name}
                        </span>
                      </div>
                      <div className="text-[11px] text-outline flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[13px]">location_on</span>
                        <span>{cust.city}</span>
                        {cust.vehicles.length > 0 && (
                          <span className="ml-1 px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant font-mono text-[10px]">
                            {cust.vehicles.length} {cust.vehicles.length === 1 ? 'vehicle' : 'vehicles'}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Mobile */}
                    <td className="py-2.5 px-3 font-mono text-on-surface font-medium">
                      {cust.mobile}
                    </td>

                    {/* Customer Type */}
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        cust.customerType === 'Wholesale' || cust.customerType === 'Dealer'
                          ? 'bg-secondary-fixed text-on-secondary-fixed'
                          : cust.customerType === 'Mechanic' || cust.customerType === 'Workshop'
                          ? 'bg-surface-container text-on-surface'
                          : cust.customerType === 'Fleet'
                          ? 'bg-primary-container text-surface-bright'
                          : 'bg-surface-container-low text-outline'
                      }`}>
                        {cust.customerType}
                      </span>
                    </td>

                    {/* GSTIN */}
                    <td className="py-2.5 px-3 font-mono text-[11px] text-outline">
                      {cust.gstin || '—'}
                    </td>

                    {/* Total Sales */}
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-on-surface">
                      ₹{cust.totalSales.toLocaleString('en-IN')}
                    </td>

                    {/* Outstanding */}
                    <td className="py-2.5 px-3 text-right font-mono">
                      {cust.outstanding > 0 ? (
                        <span className="font-bold text-error">₹{cust.outstanding.toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="text-on-tertiary-container font-semibold">₹0.00</span>
                      )}
                    </td>

                    {/* City / Area */}
                    <td className="py-2.5 px-3 text-on-surface font-medium">
                      {cust.city || '—'}
                    </td>

                    {/* Last Purchase */}
                    <td className="py-2.5 px-3 text-[11px] text-outline">
                      {cust.lastPurchaseDate}
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                        cust.status === 'Active'
                          ? 'bg-tertiary-fixed text-on-tertiary-fixed'
                          : cust.status === 'Inactive'
                          ? 'bg-surface-container text-outline'
                          : 'bg-error-container text-on-error-container'
                      }`}>
                        {cust.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td
                      className="py-2.5 px-3 text-center"
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        onClick={() => onSelectCustomer(cust.id)}
                        className="p-1 rounded text-secondary hover:bg-surface-container"
                        title="View Customer Profile"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                      </button>
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
