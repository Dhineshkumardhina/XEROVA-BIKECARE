import React, { useState } from 'react';
import { InvoiceTemplateConfig, CompanyProfile, UserRole } from '../../types';

interface InvoiceTemplatesViewProps {
  templateConfig: InvoiceTemplateConfig;
  companyProfile: CompanyProfile;
  userRole: UserRole;
  onSaveTemplateConfig: (config: InvoiceTemplateConfig) => void;
  onTriggerPermissionDenied?: (action: string) => void;
}

export const InvoiceTemplatesView: React.FC<InvoiceTemplatesViewProps> = ({
  templateConfig,
  companyProfile,
  userRole,
  onSaveTemplateConfig,
  onTriggerPermissionDenied
}) => {
  const [config, setConfig] = useState<InvoiceTemplateConfig>(templateConfig || {});
  const [activePreviewFormat, setActivePreviewFormat] = useState<string>(
    templateConfig?.activeFormat || 'A4_PORTRAIT_GST'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const isAllowedToEdit = userRole === 'super_admin' || userRole === 'admin';

  const handleToggle = (key: keyof InvoiceTemplateConfig) => {
    if (!isAllowedToEdit) {
      if (onTriggerPermissionDenied) onTriggerPermissionDenied('Update Invoice Template Configuration');
      return;
    }
    setConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectFormat = (fmt: InvoiceTemplateConfig['activeFormat']) => {
    setActivePreviewFormat(fmt);
    if (isAllowedToEdit) {
      setConfig((prev) => ({ ...prev, activeFormat: fmt }));
    }
  };

  const handleSave = () => {
    if (!isAllowedToEdit) {
      if (onTriggerPermissionDenied) onTriggerPermissionDenied('Save Invoice Template Configuration');
      return;
    }
    onSaveTemplateConfig({ ...config, activeFormat: activePreviewFormat });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low p-4 rounded border border-surface-container-high">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-primary">receipt_long</span>
            <h1 className="text-lg font-bold text-on-surface tracking-tight">Invoice Templates & Print Layouts</h1>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-surface-container rounded border border-surface-container-high text-outline">
              Statutory GST Layout Engine
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Switch between full A4 wholesale invoices, counter POS thermal slips, and toggle modular print sections.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-primary text-on-primary rounded text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 shadow-xs shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          Save Layout Settings
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded text-xs font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>Invoice print template and modular section toggles updated successfully.</span>
        </div>
      )}

      {/* 2-Column: Left Settings / Right Interactive Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Configuration Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Format Selector Cards */}
          <div className="bg-surface-container-low border border-surface-container-high rounded p-3.5 space-y-2.5">
            <span className="text-[11px] font-semibold text-outline uppercase tracking-wider block">
              1. Choose Active Print Format
            </span>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'A4_TAX_INVOICE', label: 'A4 Tax Invoice', desc: 'Standard B2B wholesale with full tax breakdown' },
                { id: 'A5_COMPACT_SLIP', label: 'A5 Compact Slip', desc: 'Half-sheet bill for retail counter customers' },
                { id: 'THERMAL_3INCH_ROLL', label: '3" Thermal (80mm)', desc: 'High-speed POS roll for fast counter cash' },
                { id: 'VOUCHER_4IN1', label: '4-in-1 Compact', desc: 'Quarter-sheet voucher saving paper costs' }
              ].map((fmt) => {
                const isSelected = activePreviewFormat === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    onClick={() => handleSelectFormat(fmt.id as any)}
                    className={`p-2.5 rounded border text-left transition-colors flex flex-col justify-between ${
                      isSelected
                        ? 'bg-secondary text-on-secondary border-secondary shadow-xs'
                        : 'bg-surface hover:bg-surface-container-high text-on-surface border-surface-container-high'
                    }`}
                  >
                    <div className="font-bold text-xs">{fmt.label}</div>
                    <div className={`text-[10px] mt-1 line-clamp-2 ${isSelected ? 'text-on-secondary/80' : 'text-outline'}`}>
                      {fmt.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modular Section Switches */}
          <div className="bg-surface-container-low border border-surface-container-high rounded p-3.5 space-y-2">
            <span className="text-[11px] font-semibold text-outline uppercase tracking-wider block">
              2. Print Elements & Section Toggles
            </span>

            <div className="divide-y divide-surface-container-high text-xs">
              {[
                { key: 'showCompanyLogo', label: 'Company Brand Logo', desc: 'Prints corporate logo on top-left of bill' },
                { key: 'showHeaderTitle', label: 'Invoice Header & Tax Title', desc: 'Prints "TAX INVOICE / ORIGINAL FOR RECIPIENT"' },
                { key: 'showCustomerDetails', label: 'Customer / Buyer Details', desc: 'Prints Buyer Name, Mobile, Address, & GSTIN' },
                { key: 'showVehicleDetails', label: 'Vehicle Number & Model', desc: 'Prints Motorcycle Reg No & Odometer reading' },
                { key: 'showGstColumns', label: 'Separate GST Columns', desc: 'Prints CGST %, SGST %, and HSN sub-columns' },
                { key: 'showBankDetails', label: 'Bank Account & UPI QR Code', desc: 'Prints IFSC, Account number & payment QR' },
                { key: 'showTermsAndConditions', label: 'Statutory Terms & Conditions', desc: 'Prints legal sales & return return clauses' },
                { key: 'showFooterGreeting', label: 'Footer Greeting & Safety Slogan', desc: 'Prints thank you message and wear helmet note' }
              ].map((item) => (
                <div key={item.key} className="py-2 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-on-surface">{item.label}</div>
                    <div className="text-[11px] text-outline">{item.desc}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!config[item.key as keyof InvoiceTemplateConfig]}
                    onChange={() => handleToggle(item.key as keyof InvoiceTemplateConfig)}
                    className="w-4 h-4 rounded text-primary focus:ring-0 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Interactive Live Invoice Preview (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-low border border-surface-container-high rounded p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-surface-container-high mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-secondary">visibility</span>
              <span className="font-bold text-xs uppercase tracking-wider text-on-surface">
                Live Rendering Preview ({(activePreviewFormat || 'A4').replace(/_/g, ' ')})
              </span>
            </div>
            <span className="text-[11px] font-mono text-outline">
              WYSIWYG Simulation
            </span>
          </div>

          {/* Render Actual Invoice Sheet based on format */}
          <div className="flex-1 overflow-auto max-h-[700px] flex justify-center bg-neutral-200 dark:bg-neutral-900 p-4 rounded border border-surface-container-high">
            {activePreviewFormat === 'THERMAL_3INCH_ROLL' ? (
              /* Thermal 80mm Slip */
              <div className="w-[300px] bg-white text-black p-4 font-mono text-[11px] shadow-lg rounded-xs leading-tight">
                {config.showHeaderTitle && (
                  <div className="text-center font-bold pb-1 border-b border-dashed border-gray-400">
                    TAX INVOICE (CASH)
                  </div>
                )}

                <div className="text-center my-2">
                  <div className="font-bold text-sm">{companyProfile.firmName}</div>
                  <div className="text-[10px] text-gray-700">{companyProfile.address}, {companyProfile.city}</div>
                  <div className="text-[10px] text-gray-700">Ph: {companyProfile.phone}</div>
                  <div className="text-[10px] font-bold">GSTIN: {companyProfile.gstin}</div>
                </div>

                <div className="border-t border-b border-dashed border-gray-400 py-1.5 text-[10px] space-y-0.5">
                  <div className="flex justify-between">
                    <span>Inv: INV/26-27/001124</span>
                    <span>Date: 12-Mar-2026</span>
                  </div>
                  {config.showCustomerDetails && (
                    <div className="flex justify-between">
                      <span>Cust: Murugan Auto Spares</span>
                      <span>GST: 33BBBP1234A1Z1</span>
                    </div>
                  )}
                  {config.showVehicleDetails && (
                    <div className="flex justify-between">
                      <span>Veh: TN 09 BK 4590</span>
                      <span>Model: Splendor Plus</span>
                    </div>
                  )}
                </div>

                {/* Items */}
                <div className="py-2">
                  <div className="flex justify-between font-bold border-b border-gray-400 pb-1 text-[10px]">
                    <span className="w-1/2">Item / Part</span>
                    <span className="text-right w-1/4">Qty</span>
                    <span className="text-right w-1/4">Amt</span>
                  </div>
                  <div className="divide-y divide-gray-200 py-1 text-[10px]">
                    <div className="py-1">
                      <div>CLUTCH PLATE SET - SPLENDOR</div>
                      <div className="flex justify-between text-gray-600">
                        <span>HSN 8714</span>
                        <span>1.00 x ₹480.00</span>
                        <span className="font-bold text-black">₹480.00</span>
                      </div>
                    </div>
                    <div className="py-1">
                      <div>BRAKE SHOE REAR - PULSAR</div>
                      <div className="flex justify-between text-gray-600">
                        <span>HSN 8714</span>
                        <span>2.00 x ₹240.00</span>
                        <span className="font-bold text-black">₹480.00</span>
                      </div>
                    </div>
                    <div className="py-1">
                      <div>MOTUL 20W40 4T PLUS 1L</div>
                      <div className="flex justify-between text-gray-600">
                        <span>HSN 2710</span>
                        <span>1.00 x ₹390.00</span>
                        <span className="font-bold text-black">₹390.00</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-dashed border-gray-400 pt-1 text-[10px] space-y-0.5">
                  <div className="flex justify-between">
                    <span>Taxable Subtotal:</span>
                    <span>₹1,144.07</span>
                  </div>
                  {config.showGstColumns && (
                    <>
                      <div className="flex justify-between">
                        <span>CGST (9%):</span>
                        <span>₹102.96</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SGST (9%):</span>
                        <span>₹102.97</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between font-bold text-xs pt-1 border-t border-black">
                    <span>NET AMOUNT:</span>
                    <span>₹1,350.00</span>
                  </div>
                </div>

                {config.showBankDetails && (
                  <div className="border-t border-dashed border-gray-400 mt-2 pt-2 text-center text-[9px] text-gray-700">
                    <div>UPI QR: {companyProfile.email}</div>
                    <div>A/c: {companyProfile.accountNumber} ({companyProfile.ifsc})</div>
                  </div>
                )}

                {config.showFooterGreeting && (
                  <div className="text-center pt-2 text-[9px] text-gray-600">
                    {companyProfile.footerText}
                  </div>
                )}
              </div>
            ) : (
              /* A4 / A5 Tax Invoice Sheet */
              <div className="w-full max-w-[620px] bg-white text-black p-6 rounded-xs shadow-lg font-sans text-xs">
                {/* Header Title */}
                {config.showHeaderTitle && (
                  <div className="text-center font-bold text-xs uppercase tracking-wider pb-2 border-b border-gray-300">
                    TAX INVOICE — ORIGINAL FOR RECIPIENT
                  </div>
                )}

                {/* Firm Header */}
                <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-300">
                  <div className="flex items-start gap-3">
                    {config.showCompanyLogo && (
                      <div className="w-12 h-12 bg-primary/10 border border-primary/30 rounded flex items-center justify-center text-primary font-bold text-lg shrink-0">
                        SB
                      </div>
                    )}
                    <div>
                      <h2 className="text-base font-extrabold text-black leading-tight">
                        {companyProfile.firmName}
                      </h2>
                      <div className="text-[11px] text-gray-700 mt-0.5">{companyProfile.address}, {companyProfile.city} - {companyProfile.pinCode}</div>
                      <div className="text-[11px] text-gray-700">Phone: {companyProfile.phone} | Email: {companyProfile.email}</div>
                      <div className="font-mono text-[11px] font-bold mt-1 text-black">
                        GSTIN: {companyProfile.gstin} | PAN: {companyProfile.pan}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono text-[11px] shrink-0">
                    <div className="font-bold text-xs text-black">INV/2026-27/001124</div>
                    <div className="text-gray-600 mt-0.5">Date: 12-Mar-2026</div>
                    <div className="text-gray-600">Time: 11:42 AM</div>
                    <div className="text-gray-600 font-sans">Payment: Cash Counter</div>
                  </div>
                </div>

                {/* Buyer / Vehicle info */}
                {(config.showCustomerDetails || config.showVehicleDetails) && (
                  <div className="grid grid-cols-2 gap-4 py-2.5 border-b border-gray-300 text-[11px]">
                    {config.showCustomerDetails && (
                      <div>
                        <div className="font-bold text-gray-600 text-[10px] uppercase">Billed To (Customer):</div>
                        <div className="font-bold text-black text-xs mt-0.5">Murugan Auto Spares & Garage</div>
                        <div className="text-gray-700">No. 12, Trunk Road, Poonamallee, Chennai</div>
                        <div className="text-gray-700">Ph: +91 94441 55678</div>
                        <div className="font-mono text-[10px] font-semibold text-black">GSTIN: 33BBBP1234A1Z1</div>
                      </div>
                    )}

                    {config.showVehicleDetails && (
                      <div className="text-right">
                        <div className="font-bold text-gray-600 text-[10px] uppercase">Vehicle Reference:</div>
                        <div className="font-bold text-black text-xs font-mono mt-0.5">TN 09 BK 4590</div>
                        <div className="text-gray-700">Hero Splendor Plus (BS6)</div>
                        <div className="text-gray-700">Odometer: 42,150 KMs</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Items Table */}
                <div className="py-3">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-gray-100 border border-gray-300 font-bold text-gray-800">
                        <th className="p-1.5 w-8">#</th>
                        <th className="p-1.5">Description of Goods</th>
                        <th className="p-1.5 w-16">HSN</th>
                        <th className="p-1.5 w-12 text-right">Qty</th>
                        <th className="p-1.5 w-16 text-right">Rate</th>
                        {config.showGstColumns && (
                          <>
                            <th className="p-1.5 w-14 text-right">CGST</th>
                            <th className="p-1.5 w-14 text-right">SGST</th>
                          </>
                        )}
                        <th className="p-1.5 w-20 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="border border-gray-300 divide-y divide-gray-200">
                      <tr>
                        <td className="p-1.5">1</td>
                        <td className="p-1.5 font-medium">Clutch Plate Assembly - Splendor</td>
                        <td className="p-1.5 font-mono">8714</td>
                        <td className="p-1.5 text-right font-mono">2 Nos</td>
                        <td className="p-1.5 text-right font-mono">₹450.00</td>
                        {config.showGstColumns && (
                          <>
                            <td className="p-1.5 text-right font-mono">9%</td>
                            <td className="p-1.5 text-right font-mono">9%</td>
                          </>
                        )}
                        <td className="p-1.5 text-right font-mono font-bold">₹1,062.00</td>
                      </tr>
                      <tr>
                        <td className="p-1.5">2</td>
                        <td className="p-1.5 font-medium">Rear Brake Shoe OEM Kit</td>
                        <td className="p-1.5 font-mono">8714</td>
                        <td className="p-1.5 text-right font-mono">1 Set</td>
                        <td className="p-1.5 text-right font-mono">₹280.00</td>
                        {config.showGstColumns && (
                          <>
                            <td className="p-1.5 text-right font-mono">9%</td>
                            <td className="p-1.5 text-right font-mono">9%</td>
                          </>
                        )}
                        <td className="p-1.5 text-right font-mono font-bold">₹330.40</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Subtotals & Bank Details */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-300 text-[11px]">
                  {/* Left: Bank Details */}
                  <div>
                    {config.showBankDetails && (
                      <div className="p-2.5 bg-gray-50 border border-gray-200 rounded text-[10px] space-y-0.5">
                        <div className="font-bold text-gray-800 uppercase">Bank RTGS / NEFT / IMPS:</div>
                        <div>Bank: {companyProfile.bankName}</div>
                        <div>A/c Name: {companyProfile.accountName}</div>
                        <div className="font-mono font-bold">A/c No: {companyProfile.accountNumber}</div>
                        <div className="font-mono">IFSC: {companyProfile.ifsc}</div>
                      </div>
                    )}
                  </div>

                  {/* Right: Totals */}
                  <div className="space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between text-gray-700">
                      <span>Taxable Value:</span>
                      <span>₹1,180.00</span>
                    </div>
                    {config.showGstColumns && (
                      <>
                        <div className="flex justify-between text-gray-700">
                          <span>CGST (9.0%):</span>
                          <span>₹106.20</span>
                        </div>
                        <div className="flex justify-between text-gray-700">
                          <span>SGST (9.0%):</span>
                          <span>₹106.20</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between font-bold text-sm text-black pt-1 border-t border-gray-400">
                      <span>Total Invoice Amount:</span>
                      <span>₹1,392.40</span>
                    </div>
                    <div className="text-[10px] text-gray-600 text-right font-sans">
                      (One Thousand Three Hundred Ninety-Two and Forty Paise Only)
                    </div>
                  </div>
                </div>

                {/* Terms */}
                {config.showTermsAndConditions && (
                  <div className="mt-4 pt-2 border-t border-gray-200 text-[9px] text-gray-600">
                    <div className="font-bold text-gray-700 uppercase">Terms & Conditions:</div>
                    <p className="line-clamp-2 mt-0.5">{companyProfile.termsAndConditions}</p>
                  </div>
                )}

                {/* Footer */}
                {config.showFooterGreeting && (
                  <div className="mt-3 text-center text-[10px] text-gray-600 italic">
                    {companyProfile.footerText}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
