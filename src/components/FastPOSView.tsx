import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  SparePart,
  Invoice,
  InvoiceLineItem,
  CustomerAccount,
  CustomerVehicle,
  CartLineItem,
  AdditionalCharges,
  PaymentSplit,
  HeldBill,
  SalesReturnItem
} from '../types';
import { INITIAL_CUSTOMERS, INITIAL_HELD_BILLS } from '../data/customerData';
import { POSHeaderRibbon } from './pos/POSHeaderRibbon';
import { POSItemSearch } from './pos/POSItemSearch';
import { POSItemDetailsPanel } from './pos/POSItemDetailsPanel';
import { POSCartTable } from './pos/POSCartTable';
import { POSCustomerSelector } from './pos/POSCustomerSelector';
import { POSBillingSummary } from './pos/POSBillingSummary';
import { POSPaymentModal } from './pos/POSPaymentModal';
import { POSPaymentSuccessModal } from './pos/POSPaymentSuccessModal';
import { POSHeldBillsModal } from './pos/POSHeldBillsModal';
import { POSSalesReturnModal } from './pos/POSSalesReturnModal';
import { POSNewCustomerModal } from './pos/POSNewCustomerModal';

interface FastPOSViewProps {
  parts: SparePart[];
  onGenerateInvoice: (newInvoice: Invoice) => void;
  onNavigate: (screen: string) => void;
  onPrintInvoice: (invoice: Invoice, format?: 'A4' | 'A5' | 'Thermal') => void;
  existingInvoices?: Invoice[];
  onStockReturn?: (returnedItems: SalesReturnItem[]) => void;
}

export const FastPOSView: React.FC<FastPOSViewProps> = ({
  parts,
  onGenerateInvoice,
  onNavigate,
  onPrintInvoice,
  existingInvoices = [],
  onStockReturn
}) => {
  // --- Customers & Accounts State ---
  const [customers, setCustomers] = useState<CustomerAccount[]>(INITIAL_CUSTOMERS);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerAccount | null>(INITIAL_CUSTOMERS[0]); // ABC Auto Works
  const [selectedVehicle, setSelectedVehicle] = useState<CustomerVehicle | null>(
    INITIAL_CUSTOMERS[0]?.vehicles?.[0] || null
  );

  // Walk-in fallback state
  const [isWalkIn, setIsWalkIn] = useState<boolean>(false);
  const [walkInName, setWalkInName] = useState<string>('');
  const [walkInPhone, setWalkInPhone] = useState<string>('');
  const [walkInVehicleNo, setWalkInVehicleNo] = useState<string>('');
  const [walkInBikeModel, setWalkInBikeModel] = useState<string>('');

  // --- Cart State ---
  // Seed initial realistic cart with Clutch Plate and Motul Oil
  const [cart, setCart] = useState<CartLineItem[]>([
    {
      id: 'cart-line-1',
      part: parts[0] || {
        id: 'part-1',
        sku: 'SKU-1302',
        barcode: '8901234567890',
        name: 'Clutch Plate Friction Disc Set (6 pcs)',
        brand: 'TVS / Gabriel',
        category: 'Engine & Clutch',
        rackBin: 'A-12',
        hsn: '87141090',
        currentStock: 18,
        minReorder: 10,
        mrp: 850,
        counterPrice: 720,
        wholesalePrice: 650,
        gstRate: 18,
        unit: 'Set',
        vehicles: ['Bajaj Pulsar 150', 'TVS Apache RTR 160']
      },
      qty: 2,
      rate: 690, // Customer specific agreed rate for ABC Auto Works
      discount: 0,
      discountType: 'flat',
      selectedVehicle: 'Bajaj Pulsar 150'
    },
    {
      id: 'cart-line-2',
      part: parts[3] || {
        id: 'part-4',
        sku: 'SKU-4011',
        barcode: '8904455667788',
        name: 'Motul 4T 7100 10W50 100% Synthetic 1L',
        brand: 'Motul',
        category: 'Lubricants & Oils',
        rackBin: 'B-04',
        hsn: '27101981',
        currentStock: 32,
        minReorder: 12,
        mrp: 925,
        counterPrice: 790,
        wholesalePrice: 720,
        gstRate: 18,
        unit: 'Can',
        vehicles: ['Universal', 'KTM Duke 200', 'Yamaha R15']
      },
      qty: 1,
      rate: 730,
      discount: 20,
      discountType: 'flat',
      selectedVehicle: 'Universal'
    }
  ]);

  // Selected item details drawer
  const [selectedPartForDetails, setSelectedPartForDetails] = useState<SparePart | null>(null);
  const [selectedCartItemId, setSelectedCartItemId] = useState<string | null>(null);

  // Rate Editing Authorization toggle (Role based simulation)
  const [isRateEditAuthorized, setIsRateEditAuthorized] = useState<boolean>(true);

  // Billing discounts & additional charges
  const [billDiscount, setBillDiscount] = useState<number>(0);
  const [billDiscountType, setBillDiscountType] = useState<'flat' | 'percent'>('flat');
  const [additionalCharges, setAdditionalCharges] = useState<AdditionalCharges>({
    fitting: 0,
    freight: 0,
    other: 0,
    otherNote: ''
  });

  // Quotation / Proforma Mode
  const [isQuotation, setIsQuotation] = useState<boolean>(false);

  // Interstate Tax Toggle (CGST+SGST vs IGST)
  const [isInterstate, setIsInterstate] = useState<boolean>(false);

  // Held Bills System
  const [heldBills, setHeldBills] = useState<HeldBill[]>(INITIAL_HELD_BILLS);

  // Modals visibility
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isHeldBillsModalOpen, setIsHeldBillsModalOpen] = useState(false);
  const [isSalesReturnModalOpen, setIsSalesReturnModalOpen] = useState(false);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);

  // Generated / Last Invoice
  const [lastInvoice, setLastInvoice] = useState<Invoice | null>(null);

  // Toast / Alert banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- Cart Actions ---
  const handleAddToCart = useCallback((part: SparePart) => {
    if (part.currentStock <= 0) {
      showToast(`Warning: ${part.name} is currently Out of Stock.`);
    }

    // Determine initial rate based on customer tier and negotiated map
    let initialRate = part.counterPrice;
    if (selectedCustomer) {
      if (selectedCustomer.lastSaleRateMap?.[part.id]) {
        initialRate = selectedCustomer.lastSaleRateMap[part.id];
      } else if (selectedCustomer.rateTier === 'Wholesale') {
        initialRate = part.wholesalePrice;
      }
    }

    setCart(prev => {
      const existing = prev.find(item => item.part.id === part.id);
      if (existing) {
        // Increase quantity
        const nextQty = existing.qty + 1;
        if (nextQty > part.currentStock) {
          showToast(`Warning: Requested quantity (${nextQty}) exceeds available stock (${part.currentStock}).`);
        }
        return prev.map(item =>
          item.part.id === part.id ? { ...item, qty: nextQty } : item
        );
      }
      // Add new row
      return [
        ...prev,
        {
          id: `cart-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          part,
          qty: 1,
          rate: initialRate,
          discount: 0,
          discountType: 'flat',
          selectedVehicle: selectedVehicle?.model || part.vehicles[0] || 'Universal'
        }
      ];
    });

    showToast(`Added ${part.name} to cart.`);
  }, [selectedCustomer, selectedVehicle]);

  const handleUpdateQty = (cartItemId: string, newQty: number) => {
    setCart(prev =>
      prev
        .map(item => (item.id === cartItemId ? { ...item, qty: newQty } : item))
        .filter(item => item.qty > 0)
    );
  };

  const handleUpdateRate = (cartItemId: string, newRate: number) => {
    setCart(prev =>
      prev.map(item => (item.id === cartItemId ? { ...item, rate: newRate } : item))
    );
  };

  const handleUpdateDiscount = (cartItemId: string, discount: number, discountType: 'flat' | 'percent') => {
    setCart(prev =>
      prev.map(item => (item.id === cartItemId ? { ...item, discount, discountType } : item))
    );
  };

  const handleUpdateVehicle = (cartItemId: string, vehicle: string) => {
    setCart(prev =>
      prev.map(item => (item.id === cartItemId ? { ...item, selectedVehicle: vehicle } : item))
    );
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const handleDuplicateItem = (cartItemId: string) => {
    const item = cart.find(i => i.id === cartItemId);
    if (!item) return;
    const duplicated: CartLineItem = {
      ...item,
      id: `cart-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };
    setCart(prev => [...prev, duplicated]);
  };

  const handleApplyCustomerRateToCart = (partId: string, customRate: number) => {
    setCart(prev =>
      prev.map(item => (item.part.id === partId ? { ...item, rate: customRate } : item))
    );
    showToast(`Applied smart customer rate ₹${customRate} for ${partId}.`);
  };

  const handleClearCart = () => {
    setCart([]);
    setBillDiscount(0);
    setAdditionalCharges({ fitting: 0, freight: 0, other: 0, otherNote: '' });
  };

  // --- Calculations ---
  const {
    subtotal,
    itemDiscountTotal,
    taxableAmount,
    cgst,
    sgst,
    igst,
    totalBeforeRound,
    roundOff,
    grandTotal
  } = useMemo(() => {
    let sub = 0;
    let itemDisc = 0;

    cart.forEach(item => {
      const gross = item.rate * item.qty;
      const disc =
        item.discountType === 'percent'
          ? (gross * item.discount) / 100
          : item.discount;
      sub += gross;
      itemDisc += disc;
    });

    const billDiscAmount =
      billDiscountType === 'percent'
        ? ((sub - itemDisc) * billDiscount) / 100
        : billDiscount;

    const totalCharges =
      additionalCharges.fitting + additionalCharges.freight + additionalCharges.other;

    const effectiveTaxable = Math.max(0, sub - itemDisc - billDiscAmount + totalCharges);

    // GST calculation: standard 18% weighted average
    let calculatedCgst = 0;
    let calculatedSgst = 0;
    let calculatedIgst = 0;

    if (isInterstate) {
      calculatedIgst = effectiveTaxable * 0.18;
    } else {
      calculatedCgst = effectiveTaxable * 0.09;
      calculatedSgst = effectiveTaxable * 0.09;
    }

    const rawTotal = effectiveTaxable + calculatedCgst + calculatedSgst + calculatedIgst;
    const rounded = Math.round(rawTotal);
    const roundOffDiff = rounded - rawTotal;

    return {
      subtotal: sub,
      itemDiscountTotal: itemDisc,
      taxableAmount: effectiveTaxable,
      cgst: calculatedCgst,
      sgst: calculatedSgst,
      igst: calculatedIgst,
      totalBeforeRound: rawTotal,
      roundOff: roundOffDiff,
      grandTotal: rounded
    };
  }, [cart, billDiscount, billDiscountType, additionalCharges, isInterstate]);

  // --- Hold Bill Functionality ---
  const handleHoldCurrentBill = () => {
    if (cart.length === 0) {
      showToast('Cannot hold an empty cart.');
      return;
    }

    const newHeldBill: HeldBill = {
      id: `BILL #H${String(heldBills.length + 1).padStart(3, '0')}`,
      heldAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      customerName: isWalkIn
        ? walkInName || 'Walk-in Counter Customer'
        : selectedCustomer?.name || 'Walk-in Counter Customer',
      customerPhone: isWalkIn ? walkInPhone : selectedCustomer?.phone,
      vehicleNo: isWalkIn ? walkInVehicleNo : selectedVehicle?.regNo,
      bikeModel: isWalkIn ? walkInBikeModel : selectedVehicle?.model,
      customerType: selectedCustomer?.tier === 'Retail' || isWalkIn ? 'B2C' : 'B2B',
      garageAccountId: selectedCustomer?.id,
      items: [...cart],
      totalAmount: grandTotal,
      billDiscount,
      billDiscountType,
      charges: { ...additionalCharges }
    };

    setHeldBills(prev => [newHeldBill, ...prev]);
    handleClearCart();
    showToast(`Bill parked to queue as ${newHeldBill.id}`);
  };

  const handleResumeHeldBill = (bill: HeldBill) => {
    setCart(bill.items);
    setBillDiscount(bill.billDiscount);
    setBillDiscountType(bill.billDiscountType);
    setAdditionalCharges(bill.charges);

    if (bill.garageAccountId) {
      const match = customers.find(c => c.id === bill.garageAccountId);
      if (match) {
        setSelectedCustomer(match);
        setIsWalkIn(false);
      }
    } else {
      setIsWalkIn(true);
      setWalkInName(bill.customerName);
      setWalkInPhone(bill.customerPhone || '');
      setWalkInVehicleNo(bill.vehicleNo || '');
      setWalkInBikeModel(bill.bikeModel || '');
    }

    // Remove resumed bill from held bills
    setHeldBills(prev => prev.filter(b => b.id !== bill.id));
    setIsHeldBillsModalOpen(false);
    showToast(`Resumed ${bill.id}`);
  };

  const handleDeleteHeldBill = (billId: string) => {
    setHeldBills(prev => prev.filter(b => b.id !== billId));
    showToast(`Discarded ${billId}`);
  };

  // --- Complete Sale Handler ---
  const handleConfirmSale = (
    primaryMode: 'Cash' | 'UPI (GPay)' | 'Credit Ledger' | 'Card POS' | 'Cheque' | 'NEFT Bank' | 'Split Payment',
    splits: PaymentSplit[],
    cashReceived?: number,
    cashChange?: number
  ) => {
    const invId = `INV-${Math.floor(10292 + Math.random() * 800)}`;
    const lineItems: InvoiceLineItem[] = cart.map(item => {
      const lineTotal =
        item.discountType === 'percent'
          ? (item.rate * item.qty) - (item.rate * item.qty * item.discount) / 100
          : (item.rate * item.qty) - item.discount;

      return {
        partId: item.part.id,
        sku: item.part.sku,
        name: item.part.name,
        hsn: item.part.hsn,
        qty: item.qty,
        rate: item.rate,
        discount:
          item.discountType === 'percent'
            ? (item.rate * item.qty * item.discount) / 100
            : item.discount,
        taxableAmount: lineTotal / (1 + item.part.gstRate / 100),
        gstRate: item.part.gstRate,
        total: lineTotal
      };
    });

    const newInvoice: Invoice = {
      id: invId,
      customerName: isWalkIn
        ? walkInName || 'Counter Retail Customer'
        : selectedCustomer?.name || 'Counter Retail Customer',
      customerPhone: isWalkIn ? walkInPhone : selectedCustomer?.phone,
      vehicleNo: isWalkIn ? walkInVehicleNo : selectedVehicle?.regNo,
      bikeModel: isWalkIn ? walkInBikeModel : selectedVehicle?.model,
      isGarage: !isWalkIn && selectedCustomer?.tier !== 'Retail',
      garageAccountId: selectedCustomer?.id,
      gstin: !isWalkIn ? selectedCustomer?.gstin : undefined,
      address: !isWalkIn ? selectedCustomer?.address : undefined,
      itemsCount: cart.reduce((acc, c) => acc + c.qty, 0),
      subtotal,
      itemDiscountTotal,
      billDiscountTotal:
        billDiscountType === 'percent'
          ? (subtotal * billDiscount) / 100
          : billDiscount,
      additionalChargesTotal:
        additionalCharges.fitting + additionalCharges.freight + additionalCharges.other,
      cgst,
      sgst,
      igst,
      roundOff,
      totalAmount: grandTotal,
      status: primaryMode === 'Credit Ledger' ? 'UNPAID' : 'PAID',
      payMode: primaryMode,
      paymentSplits: splits,
      cashTendered: cashReceived,
      cashChange,
      taxType: isInterstate ? 'INTERSTATE' : 'REGULAR',
      createdAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      operator: 'Ramesh (Terminal 1)',
      lineItems
    };

    // Update customer ledger if credit
    if (primaryMode === 'Credit Ledger' && selectedCustomer) {
      setCustomers(prev =>
        prev.map(c =>
          c.id === selectedCustomer.id
            ? { ...c, balance: c.balance + grandTotal }
            : c
        )
      );
    }

    onGenerateInvoice(newInvoice);
    setLastInvoice(newInvoice);
    setIsPaymentModalOpen(false);
    setIsSuccessModalOpen(true);
    handleClearCart();
  };

  // --- Sales Return Handler ---
  const handleConfirmReturn = (
    invoiceId: string,
    returnedItems: SalesReturnItem[],
    totalRefund: number,
    refundMode: 'Cash' | 'UPI (GPay)' | 'Credit Ledger'
  ) => {
    if (onStockReturn) {
      onStockReturn(returnedItems);
    }
    showToast(`Sales return processed against ${invoiceId}. Restocked ${returnedItems.length} items. Refund ₹${totalRefund.toFixed(2)} via ${refundMode}`);
  };

  // --- Keyboard Shortcuts (Requirement 21 & 25) ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F4 -> New Sale
      if (e.key === 'F4') {
        e.preventDefault();
        handleClearCart();
        showToast('Fresh sale initialized.');
      }
      // F8 -> Complete Sale / Checkout
      if (e.key === 'F8') {
        e.preventDefault();
        if (cart.length > 0) {
          setIsPaymentModalOpen(true);
        } else {
          showToast('Cart is empty. Add parts before checkout.');
        }
      }
      // Ctrl+S -> Hold Bill
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleHoldCurrentBill();
      }
      // Alt+R -> Recall Held Bills
      if (e.altKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        setIsHeldBillsModalOpen(true);
      }
      // Alt+P -> Print Last Invoice
      if (e.altKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        if (lastInvoice) {
          onPrintInvoice(lastInvoice, 'A4');
        } else {
          showToast('No recent invoice available to print.');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, lastInvoice, heldBills]);

  return (
    <div className="space-y-3 pb-8 animate-in fade-in duration-150">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-14 right-6 z-50 bg-on-surface text-surface py-2 px-3.5 rounded shadow-lg font-mono text-xs flex items-center gap-2 border border-surface-container-highest animate-in slide-in-from-top-2">
          <span className="material-symbols-outlined text-[16px] text-secondary">info</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP AREA: Header Ribbon with Mode Toggle, Quick Actions & Fast Spares Chips */}
      <POSHeaderRibbon
        isQuotation={isQuotation}
        onToggleQuotation={setIsQuotation}
        heldCount={heldBills.length}
        onOpenHeldBills={() => setIsHeldBillsModalOpen(true)}
        onHoldCurrentBill={handleHoldCurrentBill}
        onOpenSalesReturn={() => setIsSalesReturnModalOpen(true)}
        onOpenNewCustomer={() => setIsNewCustomerModalOpen(true)}
        onPrintLastInvoice={() => {
          if (lastInvoice) onPrintInvoice(lastInvoice, 'A4');
          else showToast('No recent bill to print');
        }}
        hasLastInvoice={Boolean(lastInvoice)}
        parts={parts}
        onAddToCart={handleAddToCart}
        onNewSale={() => {
          handleClearCart();
          showToast('Fresh sale initialized.');
        }}
        cartCount={cart.length}
      />

      {/* MAIN LAYOUT: TWO-COLUMN STRUCTURE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* ============================================================ */}
        {/* LEFT / MAIN AREA (Col 1 to 7 on desktop): Search, Cart, Details */}
        {/* ============================================================ */}
        <div className="lg:col-span-7 space-y-3">
          {/* Requirement 2: PRIMARY LARGE BARCODE & ITEM SEARCH BOX */}
          <POSItemSearch
            parts={parts}
            onAddToCart={handleAddToCart}
            onSelectItemForDetails={setSelectedPartForDetails}
            isScannerReady={true}
          />

          {/* Requirement 5: ITEM DETAILS COMPACT PANEL (When item selected) */}
          {selectedPartForDetails && (
            <POSItemDetailsPanel
              part={selectedPartForDetails}
              onClose={() => setSelectedPartForDetails(null)}
              onAddToCart={handleAddToCart}
              lastSaleRate={
                selectedCustomer?.lastSaleRateMap?.[selectedPartForDetails.id] ||
                selectedPartForDetails.counterPrice - 30
              }
              lastPurchaseRate={selectedPartForDetails.wholesalePrice - 60}
            />
          )}

          {/* Requirement 4: DENSE READABLE CART TABLE */}
          <POSCartTable
            cart={cart}
            onUpdateQty={handleUpdateQty}
            onUpdateRate={handleUpdateRate}
            onUpdateDiscount={handleUpdateDiscount}
            onUpdateVehicle={handleUpdateVehicle}
            onRemoveItem={handleRemoveItem}
            onDuplicateItem={handleDuplicateItem}
            onSelectItemForDetails={setSelectedPartForDetails}
            selectedCartItemId={selectedCartItemId}
            onSelectCartItem={setSelectedCartItemId}
            isRateEditAuthorized={isRateEditAuthorized}
            onToggleRateAuth={() => setIsRateEditAuthorized(prev => !prev)}
            selectedCustomerVehicle={selectedVehicle?.model}
          />

          {/* Cart Bottom Action Bar */}
          {cart.length > 0 && (
            <div className="flex items-center justify-between text-xs text-outline px-1">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="hover:text-error flex items-center gap-1 text-[11px]"
                >
                  <span className="material-symbols-outlined text-[14px]">delete_sweep</span>
                  <span>Clear Entire Cart</span>
                </button>
              </div>

              <div className="font-mono text-[11px]">
                Items: <strong className="text-on-surface">{cart.length}</strong> | Total Units: <strong className="text-on-surface">{cart.reduce((a, b) => a + b.qty, 0)}</strong>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* RIGHT AREA (Col 8 to 12 on desktop): Customer, Summary, Settle */}
        {/* ============================================================ */}
        <div className="lg:col-span-5 space-y-3">
          {/* Requirement 6, 7, 8, 19: CUSTOMER & VEHICLE SELECTION + SMART PRICING */}
          <POSCustomerSelector
            customers={customers}
            selectedCustomer={selectedCustomer}
            onSelectCustomer={setSelectedCustomer}
            selectedVehicle={selectedVehicle}
            onSelectVehicle={setSelectedVehicle}
            walkInName={walkInName}
            onChangeWalkInName={setWalkInName}
            walkInPhone={walkInPhone}
            onChangeWalkInPhone={setWalkInPhone}
            walkInVehicleNo={walkInVehicleNo}
            onChangeWalkInVehicleNo={setWalkInVehicleNo}
            walkInBikeModel={walkInBikeModel}
            onChangeWalkInBikeModel={setWalkInBikeModel}
            onOpenNewCustomerModal={() => setIsNewCustomerModalOpen(true)}
            onAddVehicleQuick={(regNo, model) => {
              if (selectedCustomer) {
                const newVeh: CustomerVehicle = {
                  id: `veh-${Date.now()}`,
                  regNo,
                  model
                };
                const updatedVehicles = [...(selectedCustomer.vehicles || []), newVeh];
                setCustomers(prev =>
                  prev.map(c =>
                    c.id === selectedCustomer.id ? { ...c, vehicles: updatedVehicles } : c
                  )
                );
                setSelectedCustomer(prev => (prev ? { ...prev, vehicles: updatedVehicles } : prev));
                setSelectedVehicle(newVeh);
                showToast(`Vehicle ${regNo} registered for ${selectedCustomer.name}`);
              }
            }}
            isWalkIn={isWalkIn}
            onToggleWalkIn={setIsWalkIn}
            cart={cart}
            onApplyCustomerRateToCart={handleApplyCustomerRateToCart}
          />

          {/* Requirement 10 & 11: FIXED RIGHT-SIDE BILLING SUMMARY & CHARGES */}
          <POSBillingSummary
            subtotal={subtotal}
            itemDiscountTotal={itemDiscountTotal}
            billDiscount={billDiscount}
            billDiscountType={billDiscountType}
            onChangeBillDiscount={(val, type) => {
              setBillDiscount(val);
              setBillDiscountType(type);
            }}
            additionalCharges={additionalCharges}
            onChangeAdditionalCharges={setAdditionalCharges}
            taxableAmount={taxableAmount}
            cgst={cgst}
            sgst={sgst}
            igst={igst}
            isInterstate={isInterstate}
            onToggleInterstate={() => setIsInterstate(prev => !prev)}
            roundOff={roundOff}
            grandTotal={grandTotal}
            onOpenPaymentModal={() => {
              if (cart.length === 0) {
                showToast('Cart is empty.');
                return;
              }
              setIsPaymentModalOpen(true);
            }}
            cartCount={cart.length}
            isQuotation={isQuotation}
          />
        </div>
      </div>

      {/* Requirement 21 & 25: PERMANENT KEYBOARD SHORTCUTS REFERENCE STRIP */}
      <div className="bg-surface-container-low border border-surface-container-high rounded px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-outline select-none">
        <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] text-on-surface">
          <span className="material-symbols-outlined text-secondary text-[14px]">keyboard</span>
          <span>Keyboard Shortcuts:</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 font-mono">
          <span><kbd className="px-1 py-0.5 rounded bg-surface-container border border-surface-container-highest text-on-surface">F2</kbd> Item Search</span>
          <span><kbd className="px-1 py-0.5 rounded bg-surface-container border border-surface-container-highest text-on-surface">F4</kbd> New Sale</span>
          <span><kbd className="px-1 py-0.5 rounded bg-surface-container border border-surface-container-highest text-on-surface">F8</kbd> Complete Sale</span>
          <span><kbd className="px-1 py-0.5 rounded bg-surface-container border border-surface-container-highest text-on-surface">Ctrl+S</kbd> Hold Bill</span>
          <span><kbd className="px-1 py-0.5 rounded bg-surface-container border border-surface-container-highest text-on-surface">Alt+R</kbd> Recall Bill</span>
          <span><kbd className="px-1 py-0.5 rounded bg-surface-container border border-surface-container-highest text-on-surface">Alt+P</kbd> Print Last Bill</span>
        </div>
      </div>

      {/* MODAL 1: Payment Screen & Split Payment */}
      <POSPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalDue={grandTotal}
        customer={isWalkIn ? null : selectedCustomer}
        walkInName={walkInName}
        onConfirmSale={handleConfirmSale}
      />

      {/* MODAL 2: Payment Success Screen */}
      <POSPaymentSuccessModal
        invoice={lastInvoice}
        onClose={() => setIsSuccessModalOpen(false)}
        onPrint={(inv, format) => onPrintInvoice(inv, format)}
        onNewSale={() => {
          setIsSuccessModalOpen(false);
          handleClearCart();
          showToast('Ready for new sale.');
        }}
      />

      {/* MODAL 3: Held Bills Recall Drawer */}
      <POSHeldBillsModal
        isOpen={isHeldBillsModalOpen}
        onClose={() => setIsHeldBillsModalOpen(false)}
        heldBills={heldBills}
        onResumeBill={handleResumeHeldBill}
        onDeleteHeldBill={handleDeleteHeldBill}
      />

      {/* MODAL 4: Sales Return Workflow */}
      <POSSalesReturnModal
        isOpen={isSalesReturnModalOpen}
        onClose={() => setIsSalesReturnModalOpen(false)}
        invoices={existingInvoices}
        onConfirmReturn={handleConfirmReturn}
      />

      {/* MODAL 5: Quick Add Customer Modal */}
      <POSNewCustomerModal
        isOpen={isNewCustomerModalOpen}
        onClose={() => setIsNewCustomerModalOpen(false)}
        onSaveCustomer={(newCust) => {
          setCustomers(prev => [newCust, ...prev]);
          setSelectedCustomer(newCust);
          setIsWalkIn(false);
          if (newCust.vehicles && newCust.vehicles.length > 0) {
            setSelectedVehicle(newCust.vehicles[0]);
          }
          showToast(`Customer "${newCust.name}" added and selected.`);
        }}
      />
    </div>
  );
};
