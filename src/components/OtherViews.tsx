import React, { useState } from 'react';
import { Invoice, SparePart } from '../types';

interface OtherViewsProps {
  view: string;
  invoices: Invoice[];
  parts: SparePart[];
  onViewInvoice: (inv: Invoice) => void;
  onPrintInvoice: (inv: Invoice) => void;
  onOpenNewBill: () => void;
  onOpenPoModal: (partName: string) => void;
}

export const OtherViews: React.FC<OtherViewsProps> = ({
  view,
  invoices,
  parts,
  onViewInvoice,
  onPrintInvoice,
  onOpenNewBill,
  onOpenPoModal
}) => {
  // Invoices Register
  if (view === 'invoices') {
    return (
      <div className="flex flex-col w-full pb-10 space-y-gutter animate-in fade-in duration-150">
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface-container-lowest p-gutter rounded shadow-xs gap-3">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Sales Invoices &amp; Counter Register</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Complete chronological ledger of B2C counter sales and B2B garage invoices
            </p>
          </div>
          <button
            onClick={onOpenNewBill}
            className="px-4 py-2 bg-secondary hover:bg-secondary-container text-on-secondary rounded font-table-cell text-table-cell font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>New Counter Bill [F4]</span>
          </button>
        </div>

        <div className="bg-surface-container-lowest rounded shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-surface-container font-label-caps text-label-caps text-on-surface-variant uppercase">
                <tr>
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Date / Time</th>
                  <th className="py-2.5 px-3">Customer / Garage</th>
                  <th className="py-2.5 px-3">Vehicle Model</th>
                  <th className="py-2.5 px-3 text-right">Taxable</th>
                  <th className="py-2.5 px-3 text-right">CGST + SGST</th>
                  <th className="py-2.5 px-3 text-right">Total Amount</th>
                  <th className="py-2.5 px-3">Pay Mode</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high font-table-cell">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-2 px-3 font-mono font-bold text-secondary">{inv.id}</td>
                    <td className="py-2 px-3 text-outline">{inv.createdAt}</td>
                    <td className="py-2 px-3 font-semibold text-on-surface">{inv.customerName}</td>
                    <td className="py-2 px-3 text-outline">{inv.vehicleNo} ({inv.bikeModel})</td>
                    <td className="py-2 px-3 text-right font-mono">₹{inv.subtotal.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right font-mono text-outline">₹{(inv.cgst + inv.sgst).toFixed(2)}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-on-surface">₹{inv.totalAmount.toFixed(2)}</td>
                    <td className="py-2 px-3">
                      <span className="px-1.5 py-0.5 rounded bg-surface-container text-on-surface font-mono text-[11px]">
                        {inv.payMode}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                        inv.status === 'PAID' ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-error-container text-on-error-container'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onPrintInvoice(inv)}
                          className="p-1 rounded hover:bg-surface-container text-secondary"
                          title="Print Bill"
                        >
                          <span className="material-symbols-outlined text-[16px]">print</span>
                        </button>
                        <button
                          onClick={() => onViewInvoice(inv)}
                          className="p-1 rounded hover:bg-surface-container text-on-surface-variant"
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
        </div>
      </div>
    );
  }

  // Purchase Orders & GRN
  if (view === 'purchase-orders') {
    return (
      <div className="flex flex-col w-full pb-10 space-y-gutter animate-in fade-in duration-150">
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface-container-lowest p-gutter rounded shadow-xs gap-3">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Purchase Orders (PO) &amp; Goods Receipt (GRN)</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Inward stock verification, supplier bills reconciliation, and automatic rack allocation
            </p>
          </div>
          <button
            onClick={() => onOpenPoModal('New Spares Bulk Purchase Inward')}
            className="px-4 py-2 bg-secondary hover:bg-secondary-container text-on-secondary rounded font-table-cell text-table-cell font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
            <span>+ Create Supplier PO</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
          <div className="bg-surface-container-lowest p-4 rounded shadow-xs">
            <span className="text-[11px] font-bold text-outline uppercase">Active Purchase Orders</span>
            <div className="font-mono text-xl font-bold text-on-surface mt-1">12 Orders</div>
            <span className="text-[11px] text-secondary">₹4,86,200 in transit</span>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded shadow-xs">
            <span className="text-[11px] font-bold text-outline uppercase">Pending GRN Inward</span>
            <div className="font-mono text-xl font-bold text-error mt-1">3 Shipments</div>
            <span className="text-[11px] text-outline">Arriving at Central Bay today</span>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded shadow-xs">
            <span className="text-[11px] font-bold text-outline uppercase">Monthly Purchases</span>
            <div className="font-mono text-xl font-bold text-on-surface mt-1">₹14,28,000</div>
            <span className="text-[11px] text-on-tertiary-container">99.2% on-time delivery</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded shadow-xs overflow-hidden">
          <div className="p-3 bg-surface-container border-b border-surface-container-high font-headline-md text-sm font-bold text-on-surface">
            Recent Inward Shipments &amp; GRN Logs
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-surface-container-low font-label-caps text-on-surface-variant uppercase text-[10px]">
              <tr>
                <th className="p-2.5">PO #</th>
                <th className="p-2.5">Supplier Agency</th>
                <th className="p-2.5">Items / SKUs</th>
                <th className="p-2.5 text-right">Invoice Value</th>
                <th className="p-2.5">Target Rack Bin</th>
                <th className="p-2.5 text-center">GRN Status</th>
                <th className="p-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-table-cell">
              <tr className="hover:bg-surface-container-low">
                <td className="p-2.5 font-mono font-bold text-secondary">PO-8412</td>
                <td className="p-2.5 font-semibold">Bajaj Auto Genuine Spares Ltd</td>
                <td className="p-2.5">Pulsar Clutch Plates (50), Disc Pads (30)</td>
                <td className="p-2.5 text-right font-mono font-bold">₹48,200.00</td>
                <td className="p-2.5 font-mono">B-04-T2 &amp; B-01-A1</td>
                <td className="p-2.5 text-center">
                  <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-bold text-[10px]">
                    GRN VERIFIED
                  </span>
                </td>
                <td className="p-2.5 text-center">
                  <button onClick={() => alert('Viewing Goods Receipt Note for PO-8412')} className="text-secondary hover:underline font-semibold">View GRN</button>
                </td>
              </tr>
              <tr className="hover:bg-surface-container-low">
                <td className="p-2.5 font-mono font-bold text-secondary">PO-8413</td>
                <td className="p-2.5 font-semibold">TVS Motor Spares Regional Hub</td>
                <td className="p-2.5">Apache Front Fork Oil, Gaskets, Cables (80)</td>
                <td className="p-2.5 text-right font-mono font-bold">₹34,100.00</td>
                <td className="p-2.5 font-mono">C-02-F1</td>
                <td className="p-2.5 text-center">
                  <span className="px-2 py-0.5 rounded bg-surface-container-highest text-on-secondary-fixed-variant font-bold text-[10px]">
                    IN TRANSIT
                  </span>
                </td>
                <td className="p-2.5 text-center">
                  <button onClick={() => alert('Tracking Transit for PO-8413')} className="text-secondary hover:underline font-semibold">Track</button>
                </td>
              </tr>
              <tr className="hover:bg-surface-container-low">
                <td className="p-2.5 font-mono font-bold text-secondary">PO-8414</td>
                <td className="p-2.5 font-semibold">Rolon Transmission Chains Corp</td>
                <td className="p-2.5">Splendor &amp; Pulsar Drive Chain Sprocket Kits (40)</td>
                <td className="p-2.5 text-right font-mono font-bold">₹28,600.00</td>
                <td className="p-2.5 font-mono">D-01-B3</td>
                <td className="p-2.5 text-center">
                  <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-bold text-[10px]">
                    STOCKED IN BIN
                  </span>
                </td>
                <td className="p-2.5 text-center">
                  <button onClick={() => alert('Viewing Bin Allocation for PO-8414')} className="text-secondary hover:underline font-semibold">Bin Map</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Garage Ledgers (B2B Accounts)
  if (view === 'garage-ledgers' || view === 'customers') {
    return (
      <div className="flex flex-col w-full pb-10 space-y-gutter animate-in fade-in duration-150">
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface-container-lowest p-gutter rounded shadow-xs gap-3">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Garage &amp; Mechanic Credit Ledgers</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Manage 15-day credit limits, invoice billing, and payment collection for affiliated bike workshops
            </p>
          </div>
          <button
            onClick={() => alert('New Garage Onboarding Form: enter Trade Name, GSTIN, and Credit Limit.')}
            className="px-4 py-2 bg-secondary hover:bg-secondary-container text-on-secondary rounded font-table-cell text-table-cell font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>+ Add Garage Account</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-space-sm">
          <div className="bg-surface-container-lowest p-4 rounded shadow-xs">
            <span className="text-[11px] font-bold text-outline uppercase">Active Workshop Accounts</span>
            <div className="font-mono text-xl font-bold text-on-surface mt-1">42 Garages</div>
            <span className="text-[11px] text-outline">Tier 1 &amp; Tier 2 Partners</span>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded shadow-xs">
            <span className="text-[11px] font-bold text-outline uppercase">Total Outstanding Credit</span>
            <div className="font-mono text-xl font-bold text-secondary mt-1">₹3,42,800</div>
            <span className="text-[11px] text-outline">Within 15-day terms</span>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded shadow-xs">
            <span className="text-[11px] font-bold text-outline uppercase">Overdue (&gt;15 Days)</span>
            <div className="font-mono text-xl font-bold text-error mt-1">₹38,500</div>
            <span className="text-[11px] text-error font-bold">3 Accounts Blocked</span>
          </div>
          <div className="bg-surface-container-lowest p-4 rounded shadow-xs">
            <span className="text-[11px] font-bold text-outline uppercase">Month Collections</span>
            <div className="font-mono text-xl font-bold text-on-surface mt-1">₹8,92,400</div>
            <span className="text-[11px] text-on-tertiary-container font-semibold">96% Recovery Rate</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-surface-container font-label-caps text-on-surface-variant uppercase text-[10px]">
              <tr>
                <th className="p-2.5">Code</th>
                <th className="p-2.5">Garage &amp; Contact Person</th>
                <th className="p-2.5">Area / Location</th>
                <th className="p-2.5 text-right">Credit Limit</th>
                <th className="p-2.5 text-right">Current Balance</th>
                <th className="p-2.5">Last Payment</th>
                <th className="p-2.5 text-center">Account Status</th>
                <th className="p-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high font-table-cell">
              <tr className="hover:bg-surface-container-low">
                <td className="p-2.5 font-mono font-bold text-secondary">#GB-21</td>
                <td className="p-2.5">
                  <div className="font-bold text-on-surface">Sri Balaji Auto Works</div>
                  <div className="text-outline text-[11px]">Murugan (98401 55667)</div>
                </td>
                <td className="p-2.5 text-outline">T. Nagar, Chennai</td>
                <td className="p-2.5 text-right font-mono">₹1,00,000</td>
                <td className="p-2.5 text-right font-mono font-bold text-secondary">₹18,500.00</td>
                <td className="p-2.5 text-outline">Yesterday (₹12,000 via UPI)</td>
                <td className="p-2.5 text-center">
                  <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-bold text-[10px]">ACTIVE</span>
                </td>
                <td className="p-2.5 text-center">
                  <button onClick={() => alert('Opening statement ledger for Sri Balaji Auto Works')} className="text-secondary font-semibold hover:underline">Statement</button>
                </td>
              </tr>
              <tr className="hover:bg-surface-container-low">
                <td className="p-2.5 font-mono font-bold text-secondary">#GB-04</td>
                <td className="p-2.5">
                  <div className="font-bold text-on-surface">Speedline Racing &amp; Tuning Garage</div>
                  <div className="text-outline text-[11px]">Karthik (98842 11990)</div>
                </td>
                <td className="p-2.5 text-outline">Velachery, Chennai</td>
                <td className="p-2.5 text-right font-mono">₹1,50,000</td>
                <td className="p-2.5 text-right font-mono font-bold text-secondary">₹64,200.00</td>
                <td className="p-2.5 text-outline">21 Oct 2024 (NEFT Bank)</td>
                <td className="p-2.5 text-center">
                  <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-bold text-[10px]">ACTIVE</span>
                </td>
                <td className="p-2.5 text-center">
                  <button onClick={() => alert('Opening statement ledger for Speedline Racing')} className="text-secondary font-semibold hover:underline">Statement</button>
                </td>
              </tr>
              <tr className="hover:bg-surface-container-low">
                <td className="p-2.5 font-mono font-bold text-secondary">#GB-38</td>
                <td className="p-2.5">
                  <div className="font-bold text-error">Royal Riders Bullet Clinic</div>
                  <div className="text-outline text-[11px]">Deva (97103 44551)</div>
                </td>
                <td className="p-2.5 text-outline">Anna Nagar, Chennai</td>
                <td className="p-2.5 text-right font-mono">₹50,000</td>
                <td className="p-2.5 text-right font-mono font-bold text-error">₹38,500.00</td>
                <td className="p-2.5 text-outline">28 Sep 2024 (Overdue 26 days)</td>
                <td className="p-2.5 text-center">
                  <span className="px-2 py-0.5 rounded bg-error-container text-on-error-container font-bold text-[10px]">OVERDUE HOLD</span>
                </td>
                <td className="p-2.5 text-center">
                  <button onClick={() => alert('Reminder SMS & WhatsApp invoice sent to Royal Riders Bullet Clinic')} className="text-error font-semibold hover:underline">Send Notice</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Stock Adjustments / Barcode Audit
  if (view === 'stock-adjustments') {
    return (
      <div className="flex flex-col w-full pb-10 space-y-gutter animate-in fade-in duration-150">
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface-container-lowest p-gutter rounded shadow-xs gap-3">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Physical Stock Audit &amp; Bin Reconciliation</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Perform handheld scanner stock counts, reconcile system inventory, and record authorized variance adjustments
            </p>
          </div>
          <button
            onClick={() => alert('Barcode Scan Mode activated. Use wireless handheld 2D scanner to sweep racks.')}
            className="px-4 py-2 bg-secondary hover:bg-secondary-container text-on-secondary rounded font-table-cell text-table-cell font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">barcode_scanner</span>
            <span>Start Handheld Audit</span>
          </button>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded shadow-xs">
          <div className="font-bold text-on-surface mb-2">Central Warehouse Bin Zones (A through E)</div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div className="p-3 rounded bg-surface-container-low border border-surface-container-high">
              <div className="font-bold text-secondary">Zone A (Engine &amp; Gearbox)</div>
              <div className="text-outline mt-1">68 Bins • 100% Audited</div>
            </div>
            <div className="p-3 rounded bg-surface-container-low border border-surface-container-high">
              <div className="font-bold text-secondary">Zone B (Clutch &amp; Braking)</div>
              <div className="text-outline mt-1">94 Bins • 98% Audited</div>
            </div>
            <div className="p-3 rounded bg-surface-container-low border border-surface-container-high">
              <div className="font-bold text-secondary">Zone C (Cables &amp; Levers)</div>
              <div className="text-outline mt-1">52 Bins • 100% Audited</div>
            </div>
            <div className="p-3 rounded bg-surface-container-low border border-surface-container-high">
              <div className="font-bold text-secondary">Zone D (Chains &amp; Sprockets)</div>
              <div className="text-outline mt-1">45 Bins • 95% Audited</div>
            </div>
            <div className="p-3 rounded bg-surface-container-low border border-surface-container-high">
              <div className="font-bold text-secondary">Zone E (Oils &amp; Chemicals)</div>
              <div className="text-outline mt-1">65 Bins • 100% Audited</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Reports & GST
  return (
    <div className="flex flex-col w-full pb-10 space-y-gutter animate-in fade-in duration-150">
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface-container-lowest p-gutter rounded shadow-xs gap-3">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">GST Tax Filing &amp; Business Reports</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            GSTR-1, GSTR-3B summaries, HSN 8714 analytics, and exportable financial returns
          </p>
        </div>
        <button
          onClick={() => alert('Exporting monthly GSTR-1 JSON payload compatible with GST Portal upload.')}
          className="px-4 py-2 bg-secondary hover:bg-secondary-container text-on-secondary rounded font-table-cell text-table-cell font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          <span>Download GSTR-1 JSON</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm">
        <div className="bg-surface-container-lowest p-4 rounded shadow-xs">
          <span className="text-[11px] font-bold text-outline uppercase">October Total Taxable Sales</span>
          <div className="font-mono text-xl font-bold text-on-surface mt-1">₹24,80,450</div>
          <span className="text-[11px] text-outline">B2B: ₹14.2L • B2C: ₹10.6L</span>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded shadow-xs">
          <span className="text-[11px] font-bold text-outline uppercase">Output GST Liability</span>
          <div className="font-mono text-xl font-bold text-secondary mt-1">₹4,46,481</div>
          <span className="text-[11px] text-outline">CGST: ₹2.23L • SGST: ₹2.23L</span>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded shadow-xs">
          <span className="text-[11px] font-bold text-outline uppercase">Input Tax Credit (ITC)</span>
          <div className="font-mono text-xl font-bold text-on-tertiary-container mt-1">₹3,18,240</div>
          <span className="text-[11px] text-outline">Net payable to Govt: ₹1,28,241</span>
        </div>
      </div>
    </div>
  );
};
