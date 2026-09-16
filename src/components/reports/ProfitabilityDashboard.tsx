import React, { useState, useMemo } from 'react';
import { ProfitabilityRow, UserRole, ReportDetailData } from '../../types';
import { INITIAL_PROFITABILITY_ITEMS, PROFITABILITY_SUMMARY } from '../../data/gstAndReportsData';
import { CommonReportTable, ColumnDef, PresetFilter } from './CommonReportTable';
import { formatINR, formatPercent } from '../../utils/formatters';

interface ProfitabilityDashboardProps {
  userRole: UserRole;
  onNavigate: (screenId: string) => void;
  onOpenDrawer: (data: ReportDetailData) => void;
}

type ProfitSubTab = 'items' | 'category' | 'brand' | 'customer';

export const ProfitabilityDashboard: React.FC<ProfitabilityDashboardProps> = ({
  userRole,
  onNavigate,
  onOpenDrawer
}) => {
  const [activeTab, setActiveTab] = useState<ProfitSubTab>('items');
  const [activePreset, setActivePreset] = useState('all');

  // Strict permission check
  const isAuthorized = userRole === 'admin' || userRole === 'store_admin';

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-surface-container-lowest rounded shadow-xs border border-surface-container-high space-y-4 text-center my-8">
        <div className="w-16 h-16 rounded-full bg-error-container text-on-error-container flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl">lock</span>
        </div>
        <div>
          <h2 className="font-headline-md text-lg font-bold text-on-surface">
            Access Restricted: Profitability &amp; Cost Intelligence
          </h2>
          <p className="font-body-sm text-outline max-w-md mt-1">
            Profit margins, purchase acquisition costs (COGS), and markup ratios are strictly confidential.
            Your current account role (<strong>Billing Operator</strong>) does not have financial audit clearance.
          </p>
        </div>
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={() => onNavigate('sales-reports')}
            className="px-4 py-2 bg-secondary text-on-secondary rounded text-xs font-bold shadow-xs hover:bg-secondary-container"
          >
            Go to Sales Register
          </button>
          <button
            onClick={() => onNavigate('inventory-reports')}
            className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded text-xs font-semibold"
          >
            Go to Inventory Stock
          </button>
        </div>
      </div>
    );
  }

  const subTabs: { id: ProfitSubTab; label: string; icon: string }[] = [
    { id: 'items', label: 'Item-wise Profitability', icon: 'inventory_2' },
    { id: 'category', label: 'Category Margins', icon: 'category' },
    { id: 'brand', label: 'Brand Profitability', icon: 'branding_watermark' },
    { id: 'customer', label: 'Customer / Garage Margin', icon: 'groups' }
  ];

  const presets: PresetFilter[] = [
    { id: 'all', label: 'All Items', description: 'Show all audited spare parts' },
    { id: 'high_margin', label: 'High Margin (> 25%)', description: 'Oils, rubber seals, gaskets' },
    { id: 'low_margin', label: 'Low Margin (< 15%)', description: 'Batteries, spark plugs, high-cost assemblies' },
    { id: 'top_profit', label: 'Top Profit Contributors', description: 'Products generating > ₹5,000 gross margin' }
  ];

  // Filtering
  const filteredData = useMemo(() => {
    let result = [...INITIAL_PROFITABILITY_ITEMS];

    if (activePreset === 'high_margin') {
      result = result.filter(r => r.grossMarginPct >= 25);
    } else if (activePreset === 'low_margin') {
      result = result.filter(r => r.grossMarginPct < 15);
    } else if (activePreset === 'top_profit') {
      result = result.filter(r => r.grossProfit >= 5000);
    }

    return result;
  }, [activePreset]);

  // Columns definition
  const columns: ColumnDef<ProfitabilityRow>[] = [
    {
      id: 'itemOrInvoice',
      header: 'Spare Part Description',
      accessor: r => r.itemOrInvoice,
      cell: r => (
        <div>
          <div className="font-bold text-on-surface">{r.itemOrInvoice}</div>
          <div className="text-[10px] text-outline font-mono">{r.sku} • {r.brand}</div>
        </div>
      )
    },
    {
      id: 'category',
      header: 'Category',
      accessor: r => r.category,
      cell: r => <span className="text-outline text-xs">{r.category}</span>
    },
    {
      id: 'qtySold',
      header: 'Units Sold',
      accessor: r => r.qtySold,
      align: 'right',
      cell: r => <span className="font-mono font-semibold">{r.qtySold}</span>,
      totalable: true
    },
    {
      id: 'grossSales',
      header: 'Gross Sales',
      accessor: r => r.grossSales,
      align: 'right',
      formatAsINR: true,
      totalable: true
    },
    {
      id: 'discounts',
      header: 'Discounts',
      accessor: r => r.discounts,
      align: 'right',
      formatAsINR: true,
      totalable: true
    },
    {
      id: 'netSales',
      header: 'Net Revenue',
      accessor: r => r.netSales,
      align: 'right',
      formatAsINR: true,
      totalable: true
    },
    {
      id: 'cogs',
      header: 'COGS (Cost)',
      accessor: r => r.cogs,
      align: 'right',
      formatAsINR: true,
      totalable: true
    },
    {
      id: 'grossProfit',
      header: 'Gross Profit',
      accessor: r => r.grossProfit,
      align: 'right',
      formatAsINR: true,
      totalable: true,
      cell: r => (
        <span className="font-mono font-bold text-secondary">
          {formatINR(r.grossProfit)}
        </span>
      )
    },
    {
      id: 'grossMarginPct',
      header: 'Gross Margin %',
      accessor: r => r.grossMarginPct,
      align: 'right',
      cell: r => (
        <span
          className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
            r.grossMarginPct >= 25
              ? 'bg-tertiary-fixed text-on-tertiary-fixed'
              : r.grossMarginPct >= 15
              ? 'bg-secondary/15 text-secondary'
              : 'bg-warning-container text-on-warning-container'
          }`}
        >
          {formatPercent(r.grossMarginPct)}
        </span>
      )
    }
  ];

  return (
    <div className="flex flex-col w-full pb-12 space-y-gutter animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface-container-lowest p-gutter rounded shadow-xs border border-surface-container-high gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-2xl">trending_up</span>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Profitability &amp; Margin Analysis</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-secondary/15 text-secondary border border-secondary/20">
              Admin Confidential
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Cost of Goods Sold (COGS), gross margins across spare-part categories, and product profitability rankings
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('business-insights')}
            className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded font-semibold text-xs flex items-center gap-1.5 border border-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">insights</span>
            <span>Business Insights</span>
          </button>
          <button
            onClick={() => onNavigate('financial-reports')}
            className="px-3 py-1.5 bg-secondary text-on-secondary hover:bg-secondary-container rounded font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">account_balance</span>
            <span>Financial Statements</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-space-sm text-xs">
        <div className="p-3.5 bg-surface-container-lowest rounded border border-surface-container-high">
          <span className="text-[10px] text-outline font-bold uppercase block">Gross Sales</span>
          <span className="font-mono text-base font-bold text-on-surface mt-1 block">
            {formatINR(PROFITABILITY_SUMMARY.grossSales)}
          </span>
          <span className="text-[10px] text-outline">Oct 2024 Turnover</span>
        </div>

        <div className="p-3.5 bg-surface-container-lowest rounded border border-surface-container-high">
          <span className="text-[10px] text-outline font-bold uppercase block">COGS (Procurement)</span>
          <span className="font-mono text-base font-bold text-outline mt-1 block">
            {formatINR(PROFITABILITY_SUMMARY.cogs)}
          </span>
          <span className="text-[10px] text-outline">Landed wholesale cost</span>
        </div>

        <div className="p-3.5 bg-surface-container-lowest rounded border border-secondary/30 bg-secondary/5">
          <span className="text-[10px] text-secondary font-bold uppercase block">Gross Profit</span>
          <span className="font-mono text-base font-bold text-secondary mt-1 block">
            {formatINR(PROFITABILITY_SUMMARY.grossProfit)}
          </span>
          <span className="text-[10px] text-secondary font-semibold">Sales minus COGS</span>
        </div>

        <div className="p-3.5 bg-surface-container-lowest rounded border border-surface-container-high">
          <span className="text-[10px] text-tertiary font-bold uppercase block">Overall Margin %</span>
          <span className="font-mono text-base font-bold text-on-tertiary-container mt-1 block">
            {formatPercent(PROFITABILITY_SUMMARY.grossMarginPct)}
          </span>
          <span className="text-[10px] text-tertiary">No prior data</span>
        </div>

        <div className="p-3.5 bg-surface-container-lowest rounded border border-surface-container-high">
          <span className="text-[10px] text-outline font-bold uppercase block">Discounts &amp; Schemes</span>
          <span className="font-mono text-base font-bold text-outline mt-1 block">
            {formatINR(PROFITABILITY_SUMMARY.discounts)}
          </span>
          <span className="text-[10px] text-outline">Mechanic commission</span>
        </div>

        <div className="p-3.5 bg-surface-container-lowest rounded border border-surface-container-high">
          <span className="text-[10px] text-primary font-bold uppercase block">Net Margin %</span>
          <span className="font-mono text-base font-bold text-primary mt-1 block">
            0.0%
          </span>
          <span className="text-[10px] text-outline">After shop overheads</span>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="bg-surface-container-lowest border border-surface-container-high rounded p-1 flex flex-wrap gap-1">
        {subTabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isActive
                  ? 'bg-secondary text-on-secondary shadow-xs font-bold'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Report Table */}
      <CommonReportTable<ProfitabilityRow>
        title={`Profitability: ${subTabs.find(t => t.id === activeTab)?.label} (${filteredData.length} Audited Items)`}
        subtitle="Confidential audit report for business owners and financial managers"
        columns={columns}
        data={filteredData}
        filterPresets={presets}
        activePreset={activePreset}
        onSelectPreset={p => setActivePreset(p)}
        searchPlaceholder="Search item name, SKU, brand, category..."
        onRowClick={r => {
          onOpenDrawer({
            id: r.id,
            type: 'Sale',
            title: `Profit Audit: ${r.itemOrInvoice}`,
            referenceNo: r.sku,
            date: 'October 2024 Cumulative Period',
            partyName: `${r.brand} Distributor / Customer Mix`,
            partyPhone: 'Margin: ' + formatPercent(r.grossMarginPct),
            paymentMode: 'Audited Margin',
            status: 'PROFITABLE',
            taxableAmount: r.netSales,
            cgst: 0,
            sgst: 0,
            igst: 0,
            totalAmount: r.grossSales,
            user: 'Store Administrator',
            timestamp: `2024-10-24 12:00:00 IST`,
            items: [
              {
                name: r.itemOrInvoice,
                sku: r.sku,
                hsn: '8714',
                qty: r.qtySold,
                unitPrice: r.netSales / r.qtySold,
                gstRate: 18,
                total: r.netSales
              }
            ],
            auditHistory: [
              { timestamp: '24-10-2024', action: 'COGS cost verified against supplier GRN purchase bills', user: 'Audit Bot' }
            ],
            notes: `Total Gross Profit: ${formatINR(r.grossProfit)} (${formatPercent(r.grossMarginPct)} gross margin). COGS: ${formatINR(r.cogs)}.`
          });
        }}
        exportFileName={`Profitability-${activeTab}-Oct-2024`}
      />
    </div>
  );
};
