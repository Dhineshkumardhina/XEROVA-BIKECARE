import React, { useState } from 'react';
import { AdditionalCharges } from '../../types';

interface POSBillingSummaryProps {
  subtotal: number;
  itemDiscountTotal: number;
  billDiscount: number;
  billDiscountType: 'flat' | 'percent';
  onChangeBillDiscount: (amount: number, type: 'flat' | 'percent') => void;
  additionalCharges: AdditionalCharges;
  onChangeAdditionalCharges: (charges: AdditionalCharges) => void;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  isInterstate: boolean;
  onToggleInterstate: () => void;
  roundOff: number;
  grandTotal: number;
  onOpenPaymentModal: () => void;
  cartCount: number;
  isQuotation?: boolean;
}

export const POSBillingSummary: React.FC<POSBillingSummaryProps> = ({
  subtotal,
  itemDiscountTotal,
  billDiscount,
  billDiscountType,
  onChangeBillDiscount,
  additionalCharges,
  onChangeAdditionalCharges,
  taxableAmount,
  cgst,
  sgst,
  igst,
  isInterstate,
  onToggleInterstate,
  roundOff,
  grandTotal,
  onOpenPaymentModal,
  cartCount,
  isQuotation = false
}) => {
  const [isChargesExpanded, setIsChargesExpanded] = useState(false);
  const [isBillDiscExpanded, setIsBillDiscExpanded] = useState(false);

  const totalCharges = additionalCharges.fitting + additionalCharges.freight + additionalCharges.other;

  return (
    <div className="bg-surface-container-lowest border border-surface-container-high rounded-md p-3 shadow-xs space-y-2.5">
      {/* Summary Header */}
      <div className="flex items-center justify-between border-b border-surface-container-high pb-2">
        <span className="font-bold text-xs uppercase text-outline tracking-wider flex items-center gap-1">
          <span className="material-symbols-outlined text-secondary text-[16px]">receipt</span>
          Bill Summary
        </span>

        {/* GST State Switcher (Intra-state CGST+SGST vs Inter-state IGST) */}
        <button
          type="button"
          onClick={onToggleInterstate}
          className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
            isInterstate
              ? 'border-secondary bg-secondary/10 text-secondary font-bold'
              : 'border-surface-container-high text-outline hover:text-on-surface'
          }`}
          title="Toggle between Tamil Nadu State GST (CGST+SGST) and Interstate IGST"
        >
          {isInterstate ? 'IGST (Interstate 18%)' : 'CGST + SGST (Local)'}
        </button>
      </div>

      {/* Bill Discount Row */}
      <div className="bg-surface-container-low p-2 rounded text-xs space-y-1.5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsBillDiscExpanded(prev => !prev)}
            className="flex items-center gap-1 font-semibold text-on-surface hover:text-secondary text-[11px]"
          >
            <span className="material-symbols-outlined text-[14px]">
              {isBillDiscExpanded ? 'expand_less' : 'expand_more'}
            </span>
            <span>Bill Level Discount</span>
            {billDiscount > 0 && (
              <span className="text-secondary font-mono text-[10px] font-bold">
                ({billDiscountType === 'percent' ? `${billDiscount}%` : `₹${billDiscount}`})
              </span>
            )}
          </button>
          <span className="font-mono font-semibold text-secondary">
            {billDiscount > 0 ? (
              billDiscountType === 'percent'
                ? `-₹${((subtotal * billDiscount) / 100).toFixed(2)}`
                : `-₹${billDiscount.toFixed(2)}`
            ) : (
              '₹0.00'
            )}
          </span>
        </div>

        {isBillDiscExpanded && (
          <div className="flex items-center gap-2 pt-1 border-t border-surface-container-high/60">
            <input
              type="number"
              min="0"
              value={billDiscount || ''}
              onChange={(e) => onChangeBillDiscount(parseFloat(e.target.value) || 0, billDiscountType)}
              placeholder="0"
              className="w-20 h-6 px-1.5 text-right font-mono bg-surface-container-lowest rounded border border-surface-container-highest text-xs text-on-surface"
            />
            <div className="flex bg-surface-container-high rounded p-0.5 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => onChangeBillDiscount(billDiscount, 'flat')}
                className={`px-2 py-0.5 rounded ${billDiscountType === 'flat' ? 'bg-secondary text-on-secondary' : 'text-outline'}`}
              >
                ₹ Flat
              </button>
              <button
                type="button"
                onClick={() => onChangeBillDiscount(billDiscount, 'percent')}
                className={`px-2 py-0.5 rounded ${billDiscountType === 'percent' ? 'bg-secondary text-on-secondary' : 'text-outline'}`}
              >
                % Percent
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Requirement 11: Compact Additional Charges Section */}
      <div className="bg-surface-container-low p-2 rounded text-xs space-y-1.5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsChargesExpanded(prev => !prev)}
            className="flex items-center gap-1 font-semibold text-on-surface hover:text-secondary text-[11px]"
          >
            <span className="material-symbols-outlined text-[14px]">
              {isChargesExpanded ? 'expand_less' : 'expand_more'}
            </span>
            <span>Additional Charges (Fitting, Freight)</span>
          </button>
          <span className="font-mono font-semibold text-on-surface">
            +₹{totalCharges.toFixed(2)}
          </span>
        </div>

        {isChargesExpanded && (
          <div className="space-y-1.5 pt-1 border-t border-surface-container-high/60">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-outline uppercase font-bold block mb-0.5">Fitting / Labour</label>
                <div className="flex items-center gap-1">
                  <span className="text-outline text-[11px]">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={additionalCharges.fitting || ''}
                    onChange={(e) =>
                      onChangeAdditionalCharges({
                        ...additionalCharges,
                        fitting: parseFloat(e.target.value) || 0
                      })
                    }
                    placeholder="150"
                    className="w-full h-6 px-1.5 text-right font-mono bg-surface-container-lowest rounded border border-surface-container-highest text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-outline uppercase font-bold block mb-0.5">Freight / Parcel</label>
                <div className="flex items-center gap-1">
                  <span className="text-outline text-[11px]">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={additionalCharges.freight || ''}
                    onChange={(e) =>
                      onChangeAdditionalCharges({
                        ...additionalCharges,
                        freight: parseFloat(e.target.value) || 0
                      })
                    }
                    placeholder="50"
                    className="w-full h-6 px-1.5 text-right font-mono bg-surface-container-lowest rounded border border-surface-container-highest text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={additionalCharges.otherNote}
                onChange={(e) =>
                  onChangeAdditionalCharges({
                    ...additionalCharges,
                    otherNote: e.target.value
                  })
                }
                placeholder="Other charge note (e.g. lathe work)"
                className="flex-1 h-6 px-1.5 text-[11px] bg-surface-container-lowest rounded border border-surface-container-highest"
              />
              <div className="flex items-center gap-1 w-24">
                <span className="text-outline text-[11px]">₹</span>
                <input
                  type="number"
                  min="0"
                  value={additionalCharges.other || ''}
                  onChange={(e) =>
                    onChangeAdditionalCharges({
                      ...additionalCharges,
                      other: parseFloat(e.target.value) || 0
                    })
                  }
                  placeholder="0"
                  className="w-full h-6 px-1 text-right font-mono bg-surface-container-lowest rounded border border-surface-container-highest text-xs"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Numerical Breakdown Rows */}
      <div className="space-y-1.5 text-xs text-on-surface divide-y divide-surface-container-high/60 pt-1">
        <div className="flex justify-between text-outline pt-1">
          <span>Subtotal:</span>
          <span className="font-mono">₹{subtotal.toFixed(2)}</span>
        </div>

        {itemDiscountTotal > 0 && (
          <div className="flex justify-between text-secondary pt-1">
            <span>Item Discount:</span>
            <span className="font-mono">-₹{itemDiscountTotal.toFixed(2)}</span>
          </div>
        )}

        {totalCharges > 0 && (
          <div className="flex justify-between text-outline pt-1">
            <span>Additional Charges:</span>
            <span className="font-mono">+₹{totalCharges.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-on-surface font-medium pt-1">
          <span>Taxable Amount:</span>
          <span className="font-mono">₹{taxableAmount.toFixed(2)}</span>
        </div>

        {isInterstate ? (
          <div className="flex justify-between text-outline pt-1">
            <span>IGST (18%):</span>
            <span className="font-mono">₹{igst.toFixed(2)}</span>
          </div>
        ) : (
          <>
            <div className="flex justify-between text-outline pt-1">
              <span>CGST (9%):</span>
              <span className="font-mono">₹{cgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-outline pt-1">
              <span>SGST (9%):</span>
              <span className="font-mono">₹{sgst.toFixed(2)}</span>
            </div>
          </>
        )}

        {roundOff !== 0 && (
          <div className="flex justify-between text-outline text-[11px] pt-1">
            <span>Round Off:</span>
            <span className="font-mono">{roundOff >= 0 ? `+₹${roundOff.toFixed(2)}` : `-₹${Math.abs(roundOff).toFixed(2)}`}</span>
          </div>
        )}
      </div>

      {/* Requirement 10: The GRAND TOTAL should be visually dominant */}
      <div className="p-3 bg-surface-container rounded-md border-2 border-secondary/40 flex items-center justify-between mt-2">
        <div>
          <span className="font-bold uppercase text-[10px] text-outline tracking-wider block">
            {isQuotation ? 'Quotation Total' : 'Grand Total Due'}
          </span>
          <span className="text-[11px] text-outline">
            {cartCount} {cartCount === 1 ? 'part' : 'parts'} (Incl. Taxes)
          </span>
        </div>

        <div className="text-right">
          <div className="font-mono text-2xl md:text-3xl font-extrabold text-secondary tracking-tight">
            ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Primary COMPLETE SALE Button (F8 shortcut) */}
      <button
        type="button"
        disabled={cartCount === 0}
        onClick={onOpenPaymentModal}
        className="w-full py-3 px-4 bg-secondary hover:bg-secondary-container disabled:opacity-40 disabled:cursor-not-allowed text-on-secondary rounded-md font-bold text-sm md:text-base flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer select-none active:scale-[0.99]"
      >
        <span className="material-symbols-outlined text-[20px]">
          {isQuotation ? 'request_quote' : 'payments'}
        </span>
        <span>{isQuotation ? 'Generate Quotation' : 'COMPLETE SALE (F8)'}</span>
        <kbd className="hidden sm:inline bg-on-secondary-fixed text-on-secondary px-1.5 py-0.5 rounded text-[11px] font-mono">
          F8
        </kbd>
      </button>
    </div>
  );
};
