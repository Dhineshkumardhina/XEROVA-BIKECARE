import React, { useState, useMemo } from 'react';
import { InventoryReportRow, UserRole, ReportDetailData } from '../../types';
import { INITIAL_INVENTORY_REPORTS } from '../../data/gstAndReportsData';
import { CommonReportTable, ColumnDef, PresetFilter } from './CommonReportTable';
import { formatINR, formatQty } from '../../utils/formatters';

interface InventoryReportsViewProps {
  userRole: UserRole;
  onNavigate: (screenId: string) => void;
  onOpenDrawer: (data: ReportDetailData) => void;
}

type InventorySubReport =
  | 'valuation'
  | 'movement'
  | 'low_stock'
  | 'out_of_stock'
  | 'dead_stock'
  | 'adjustments';

export const InventoryReportsView: React.FC<InventoryReportsViewProps> = ({
  userRole,
  onNavigate,
  onOpenDrawer
}) => {
  const [subReport, setSubReport] = useState<InventorySubReport>('valuation');
  const [activePreset, setActivePreset] = useState('all');

  // Role check: Only store_admin and admin can see cost and valuation
  const canViewCosts = userRole === 'admin' || userRole === 'store_admin';

  const subReportTabs: { id: InventorySubReport; label: string; icon: string }[] = [
    { id: 'valuation', label: 'Stock Valuation & Racks', icon: 'account_balance' },
    { id: 'movement', label: 'Movement Velocity', icon: 'speed' },
    { id: 'low_stock', label: 'Low Stock Alerts', icon: 'warning' },
    { id: 'out_of_stock', label: 'Out of Stock', icon: 'remove_shopping_cart' },
    { id: 'dead_stock', label: 'Dead Stock Analysis', icon: 'hourglass_empty' },
    { id: 'adjustments', label: 'Stock Adjustments Audit', icon: 'tune' }
  ];

  const presets: PresetFilter[] = [
    { id: 'all', label: 'All Inventory', description: 'Complete catalog of spare parts' },
    { id: 'fast_moving', label: 'Fast Moving', description: 'Sold within last 7 days' },
    { id: 'reorder_needed', label: 'Needs Reorder', description: 'Current Qty <= Reorder Level' },
    { id: 'lubricants', label: 'Oils & Fluids', description: 'Motul and synthetic lubricants' },
    { id: 'high_value', label: 'High Stock Value', description: 'Parts locking > ₹5,000 capital' }
  ];

  // Filtering
  const filteredData = useMemo(() => {
    let result = [...INITIAL_INVENTORY_REPORTS];

    if (subReport === 'low_stock') {
      result = result.filter(r => r.quantity <= r.reorderLevel && r.quantity > 0);
    } else if (subReport === 'out_of_stock') {
      result = result.filter(r => r.quantity === 0);
    } else if (subReport === 'dead_stock') {
      result = result.filter(r => r.daysInStock > 90 || r.movementStatus === 'Dead Stock');
    } else if (subReport === 'movement') {
      result = result.filter(r => r.movementStatus === 'Fast Moving' || r.movementStatus === 'Normal');
    }

    if (activePreset === 'fast_moving') {
      result = result.filter(r => r.movementStatus === 'Fast Moving');
    } else if (activePreset === 'reorder_needed') {
      result = result.filter(r => r.quantity <= r.reorderLevel);
    } else if (activePreset === 'lubricants') {
      result = result.filter(r => r.category === 'Oils & Fluids');
    } else if (activePreset === 'high_value') {
      result = result.filter(r => r.stockValue >= 5000);
    }

    return result;
  }, [subReport, activePreset]);

  // Totals
  const totalStockValuation = INITIAL_INVENTORY_REPORTS.reduce((sum, r) => sum + r.stockValue, 0);
  const totalItemsCount = INITIAL_INVENTORY_REPORTS.reduce((sum, r) => sum + r.quantity, 0);
  const lowStockCount = INITIAL_INVENTORY_REPORTS.filter(r => r.quantity <= r.reorderLevel && r.quantity > 0).length;
  const outOfStockCount = INITIAL_INVENTORY_REPORTS.filter(r => r.quantity === 0).length;
  const deadStockValue = INITIAL_INVENTORY_REPORTS.filter(r => r.movementStatus === 'Dead Stock').reduce((sum, r) => sum + r.stockValue, 0);

  // Columns definition
  const columns: ColumnDef<InventoryReportRow>[] = [
    {
      id: 'sku',
      header: 'SKU / OEM Code',
      accessor: r => r.sku,
      cell: r => (
        <div>
          <span className="font-mono font-bold text-secondary">{r.sku}</span>
          <div className="text-[10px] text-outline font-mono">{r.oemCode}</div>
        </div>
      )
    },
    {
      id: 'name',
      header: 'Spare Part Description',
      accessor: r => r.name,
      cell: r => (
        <div>
          <div className="font-bold text-on-surface">{r.name}</div>
          <span className="text-[10px] text-outline">{r.brand} • {r.category}</span>
        </div>
      )
    },
    {
      id: 'rackBin',
      header: 'Rack / Bin',
      accessor: r => r.rackBin,
      align: 'center',
      cell: r => (
        <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-surface-container border border-surface-container-high text-on-surface">
          {r.rackBin}
        </span>
      )
    },
    {
      id: 'quantity',
      header: 'Stock Qty',
      accessor: r => r.quantity,
      align: 'right',
      cell: r => (
        <span className={`font-mono font-bold text-xs ${
          r.quantity === 0
            ? 'text-error'
            : r.quantity <= r.reorderLevel
            ? 'text-warning'
            : 'text-on-surface'
        }`}>
          {formatQty(r.quantity, r.unit)}
        </span>
      ),
      totalable: true
    },
    {
      id: 'reorderLevel',
      header: 'Reorder Level',
      accessor: r => r.reorderLevel,
      align: 'right',
      cell: r => <span className="font-mono text-outline">{r.reorderLevel} {r.unit}</span>
    },
    // Conditionally include Purchase Rate and Stock Value only if user has permissions!
    ...(canViewCosts
      ? ([
          {
            id: 'purchaseRate',
            header: 'Purchase Rate (Cost)',
            accessor: r => r.purchaseRate,
            align: 'right' as const,
            formatAsINR: true
          },
          {
            id: 'stockValue',
            header: 'Stock Valuation (Cost)',
            accessor: r => r.stockValue,
            align: 'right' as const,
            formatAsINR: true,
            totalable: true,
            cell: (r: InventoryReportRow) => (
              <span className="font-mono font-bold text-secondary">
                {formatINR(r.stockValue)}
              </span>
            )
          }
        ] as ColumnDef<InventoryReportRow>[])
      : []),
    {
      id: 'sellingRate',
      header: 'Retail Counter Rate',
      accessor: r => r.sellingRate,
      align: 'right',
      formatAsINR: true
    },
    {
      id: 'mrp',
      header: 'MRP',
      accessor: r => r.mrp,
      align: 'right',
      formatAsINR: true
    },
    {
      id: 'movementStatus',
      header: 'Movement Velocity',
      accessor: r => r.movementStatus,
      align: 'center',
      cell: r => (
        <span
          className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
            r.movementStatus === 'Fast Moving'
              ? 'bg-tertiary-fixed text-on-tertiary-fixed'
              : r.movementStatus === 'Low Stock'
              ? 'bg-warning-container text-on-warning-container'
              : r.movementStatus === 'Out of Stock'
              ? 'bg-error-container text-on-error-container'
              : r.movementStatus === 'Dead Stock'
              ? 'bg-black/10 text-outline'
              : 'bg-surface-container text-on-surface'
          }`}
        >
          {r.movementStatus}
        </span>
      )
    },
    {
      id: 'daysInStock',
      header: 'Days in Bin',
      accessor: r => r.daysInStock,
      align: 'right',
      cell: r => <span className="font-mono text-outline">{r.daysInStock}d</span>
    }
  ];

  return (
    <div className="flex flex-col w-full pb-12 space-y-gutter animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface-container-lowest p-gutter rounded shadow-xs border border-surface-container-high gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-2xl">warehouse</span>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Inventory &amp; Stock Valuation Reports</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-secondary/15 text-secondary border border-secondary/20">
              Warehouse &amp; Bins
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Real-time rack/bin tracking, stock valuation at landed cost, reorder alerts and dead stock identification
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!canViewCosts && (
            <span className="text-[11px] text-outline italic flex items-center gap-1 bg-surface-container px-2.5 py-1 rounded">
              <span className="material-symbols-outlined text-[15px]">lock</span>
              <span>Cost prices masked for operator role</span>
            </span>
          )}
          <button
            onClick={() => onNavigate('low-stock')}
            className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded font-semibold text-xs flex items-center gap-1.5 border border-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">notification_important</span>
            <span>Reorder Checklist</span>
          </button>
          <button
            onClick={() => onNavigate('purchase-reports')}
            className="px-3 py-1.5 bg-secondary text-on-secondary hover:bg-secondary-container rounded font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">local_shipping</span>
            <span>Purchase Inward</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-space-sm text-xs">
        {canViewCosts && (
          <div className="p-3 bg-surface-container-lowest rounded border border-surface-container-high">
            <span className="text-[10px] text-secondary font-bold uppercase block">Total Stock Valuation</span>
            <span className="font-mono text-base font-bold text-secondary mt-1 block">
              {formatINR(totalStockValuation)}
            </span>
            <span className="text-[10px] text-outline">At Purchase Cost</span>
          </div>
        )}

        <div className="p-3 bg-surface-container-lowest rounded border border-surface-container-high">
          <span className="text-[10px] text-outline font-bold uppercase block">Physical Units</span>
          <span className="font-mono text-base font-bold text-on-surface mt-1 block">
            {totalItemsCount} Units
          </span>
          <span className="text-[10px] text-outline">{INITIAL_INVENTORY_REPORTS.length} Registered SKUs</span>
        </div>

        <div className="p-3 bg-surface-container-lowest rounded border border-surface-container-high">
          <span className="text-[10px] text-tertiary font-bold uppercase block">Fast-Moving SKUs</span>
          <span className="font-mono text-base font-bold text-on-tertiary-container mt-1 block">
            0 Lines
          </span>
          <span className="text-[10px] text-tertiary">Turnover &lt; 7 days</span>
        </div>

        <div className="p-3 bg-surface-container-lowest rounded border border-surface-container-high">
          <span className="text-[10px] text-warning font-bold uppercase block">Low Stock Items</span>
          <span className="font-mono text-base font-bold text-warning mt-1 block">
            {lowStockCount} SKUs
          </span>
          <span className="text-[10px] text-outline">Below safety threshold</span>
        </div>

        <div className="p-3 bg-surface-container-lowest rounded border border-surface-container-high">
          <span className="text-[10px] text-error font-bold uppercase block">Out of Stock</span>
          <span className="font-mono text-base font-bold text-error mt-1 block">
            {outOfStockCount} SKUs
          </span>
          <span className="text-[10px] text-outline">Immediate PO required</span>
        </div>

        {canViewCosts ? (
          <div className="p-3 bg-surface-container-lowest rounded border border-surface-container-high">
            <span className="text-[10px] text-outline font-bold uppercase block">Dead Stock Value</span>
            <span className="font-mono text-base font-bold text-outline mt-1 block">
              {formatINR(deadStockValue)}
            </span>
            <span className="text-[10px] text-outline">&gt; 180 days idle</span>
          </div>
        ) : (
          <div className="p-3 bg-surface-container-lowest rounded border border-surface-container-high">
            <span className="text-[10px] text-outline font-bold uppercase block">Dead Stock Items</span>
            <span className="font-mono text-base font-bold text-outline mt-1 block">
              0 SKUs (0 Units)
            </span>
            <span className="text-[10px] text-outline">&gt; 180 days idle</span>
          </div>
        )}
      </div>

      {/* Sub-report Tabs Bar */}
      <div className="bg-surface-container-lowest border border-surface-container-high rounded p-1 flex flex-wrap gap-1">
        {subReportTabs.map(tab => {
          const isActive = subReport === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubReport(tab.id)}
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
      <CommonReportTable<InventoryReportRow>
        title={`Inventory: ${subReportTabs.find(t => t.id === subReport)?.label} (${filteredData.length} Lines)`}
        subtitle={canViewCosts ? 'Valuation calculated using Landed Purchase Cost (FIFO)' : 'Quantity and Bin Location Registry'}
        columns={columns}
        data={filteredData}
        filterPresets={presets}
        activePreset={activePreset}
        onSelectPreset={p => setActivePreset(p)}
        searchPlaceholder="Search SKU, spare part name, OEM code, rack bin..."
        onRowClick={r => {
          onOpenDrawer({
            id: r.id,
            type: 'Stock',
            title: `Inventory SKU: ${r.name}`,
            referenceNo: r.sku,
            date: `Last Sold: ${r.lastSoldDate}`,
            partyName: `${r.brand} OEM Distributor`,
            partyPhone: 'Rack Bin: ' + r.rackBin,
            paymentMode: `Stock Velocity: ${r.movementStatus}`,
            status: r.movementStatus.toUpperCase(),
            taxableAmount: r.stockValue,
            cgst: 0,
            sgst: 0,
            igst: 0,
            totalAmount: r.quantity * r.sellingRate,
            user: 'Inventory Supervisor',
            timestamp: `2024-10-24 10:00:00 IST`,
            items: [
              { name: r.name, sku: 'SKU-' + r.rackBin, hsn: '8714', qty: r.quantity, unitPrice: r.purchaseRate || 0, gstRate: 28, total: r.stockValue || 0 }
            ],
            auditHistory: [
              { timestamp: r.lastSoldDate, action: 'Stock level updated after POS counter invoice sale', user: 'System' },
              { timestamp: '01 Oct 2024', action: 'Physical count verified in Rack ' + r.rackBin, user: 'Current User' }
            ],
            notes: `OEM Code: ${r.oemCode}. MRP: ${formatINR(r.mrp)}. Reorder safety minimum: ${r.reorderLevel} ${r.unit}.`
          });
        }}
        exportFileName={`Inventory-Report-${subReport}`}
      />
    </div>
  );
};
