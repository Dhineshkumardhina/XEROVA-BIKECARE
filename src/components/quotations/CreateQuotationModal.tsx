import React, { useState, useEffect } from 'react';
import { Quotation, QuotationItem, QuotationStatus, SparePart, CustomerProfileData } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface CreateQuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (quote: Quotation) => void;
  parts: SparePart[];
  customers: CustomerProfileData[];
  editingQuote?: Quotation | null;
  currentUser?: string;
}

export const CreateQuotationModal: React.FC<CreateQuotationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  parts,
  customers,
  editingQuote,
  currentUser = 'Rajesh (Store Admin)'
}) => {
  if (!isOpen) return null;

  // Header State
  const [quotationNumber, setQuotationNumber] = useState<string>(() => {
    if (editingQuote) return editingQuote.quotationNumber;
    return `QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  });

  const [date, setDate] = useState<string>(() => {
    if (editingQuote) return editingQuote.date;
    const now = new Date();
    return now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  });

  const [validDays, setValidDays] = useState<number>(editingQuote?.validDays || 15);
  const [validUntil, setValidUntil] = useState<string>(() => {
    if (editingQuote) return editingQuote.validUntil;
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  });

  // Customer State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(editingQuote?.customerId || '');
  const [customerName, setCustomerName] = useState<string>(editingQuote?.customerName || '');
  const [customerMobile, setCustomerMobile] = useState<string>(editingQuote?.customerMobile || '');
  const [customerGstin, setCustomerGstin] = useState<string>(editingQuote?.customerGstin || '');
  const [vehicleNumber, setVehicleNumber] = useState<string>(editingQuote?.vehicleNumber || '');
  const [vehicleModel, setVehicleModel] = useState<string>(editingQuote?.vehicleModel || '');
  const [isInterstate, setIsInterstate] = useState<boolean>(
    editingQuote ? editingQuote.igst > 0 : false
  );

  // Additional Charges & Notes
  const [fittingCharges, setFittingCharges] = useState<number>(editingQuote?.fittingCharges || 0);
  const [remarks, setRemarks] = useState<string>(editingQuote?.remarks || '');
  const [termsConditions, setTermsConditions] = useState<string>(
    editingQuote?.termsConditions ||
      '1. Rates valid for 15 days from date of estimate.\n2. Fitting charges extra as indicated.\n3. Goods once sold are non-refundable after 7 days.'
  );

  // Line Items State
  const [items, setItems] = useState<QuotationItem[]>(() => {
    if (editingQuote && editingQuote.items.length > 0) {
      return [...editingQuote.items];
    }
    return [
      {
        id: `qti-${Date.now()}-1`,
        partNumber: '',
        itemName: '',
        vehicle: '',
        quantity: 1,
        rate: 0,
        discount: 0,
        taxRate: 18,
        cgst: 0,
        sgst: 0,
        igst: 0,
        amount: 0
      }
    ];
  });

  // Auto-fill customer details when picked from dropdown
  const handleCustomerSelect = (custId: string) => {
    setSelectedCustomerId(custId);
    if (!custId) return;
    const cust = customers.find((c) => c.id === custId);
    if (cust) {
      setCustomerName(cust.name);
      setCustomerMobile(cust.mobile);
      setCustomerGstin(cust.gstin || '');
      if (cust.vehicles && cust.vehicles.length > 0) {
        setVehicleNumber(cust.vehicles[0].regNo);
        setVehicleModel(`${cust.vehicles[0].manufacturer} ${cust.vehicles[0].model}`);
      }
    }
  };

  // Update validUntil date when validDays change
  const handleValidDaysChange = (days: number) => {
    setValidDays(days);
    const d = new Date();
    d.setDate(d.getDate() + days);
    setValidUntil(d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }));
  };

  // Item row changes
  const handleItemPartSelect = (index: number, partId: string) => {
    const part = parts.find((p) => p.id === partId);
    if (!part) return;

    const newItems = [...items];
    const qty = newItems[index].quantity || 1;
    const rate = part.counterPrice;
    const discount = newItems[index].discount || 0;
    const taxRate = part.gstRate || 18;

    const lineTaxable = Math.max(0, qty * rate - discount);
    const lineTax = (lineTaxable * taxRate) / 100;
    const lineTotal = lineTaxable + lineTax;

    newItems[index] = {
      ...newItems[index],
      partId: part.id,
      partNumber: part.sku,
      itemName: part.name,
      vehicle: part.vehicles?.[0] || 'Universal',
      rate,
      taxRate,
      amount: Number(lineTotal.toFixed(2)),
      cgst: isInterstate ? 0 : Number((lineTax / 2).toFixed(2)),
      sgst: isInterstate ? 0 : Number((lineTax / 2).toFixed(2)),
      igst: isInterstate ? Number(lineTax.toFixed(2)) : 0
    };
    setItems(newItems);
  };

  const handleItemFieldChange = (
    index: number,
    field: 'quantity' | 'rate' | 'discount' | 'taxRate' | 'vehicle' | 'itemName' | 'partNumber',
    value: any
  ) => {
    const newItems = [...items];
    const current = { ...newItems[index], [field]: value };

    const qty = Number(current.quantity) || 0;
    const rate = Number(current.rate) || 0;
    const discount = Number(current.discount) || 0;
    const taxRate = Number(current.taxRate) || 0;

    const lineTaxable = Math.max(0, qty * rate - discount);
    const lineTax = (lineTaxable * taxRate) / 100;
    const lineTotal = lineTaxable + lineTax;

    newItems[index] = {
      ...current,
      amount: Number(lineTotal.toFixed(2)),
      cgst: isInterstate ? 0 : Number((lineTax / 2).toFixed(2)),
      sgst: isInterstate ? 0 : Number((lineTax / 2).toFixed(2)),
      igst: isInterstate ? Number(lineTax.toFixed(2)) : 0
    };
    setItems(newItems);
  };

  const handleAddItemRow = () => {
    setItems([
      ...items,
      {
        id: `qti-${Date.now()}-${items.length + 1}`,
        partNumber: '',
        itemName: '',
        vehicle: '',
        quantity: 1,
        rate: 0,
        discount: 0,
        taxRate: 18,
        cgst: 0,
        sgst: 0,
        igst: 0,
        amount: 0
      }
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Calculations
  const calculations = React.useMemo(() => {
    let subtotal = 0;
    let discountTotal = 0;
    let taxableAmount = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    items.forEach((item) => {
      const lineGross = (item.quantity || 0) * (item.rate || 0);
      const lineDisc = item.discount || 0;
      const lineTaxable = Math.max(0, lineGross - lineDisc);
      const lineTax = (lineTaxable * (item.taxRate || 0)) / 100;

      subtotal += lineGross;
      discountTotal += lineDisc;
      taxableAmount += lineTaxable;

      if (isInterstate) {
        igst += lineTax;
      } else {
        cgst += lineTax / 2;
        sgst += lineTax / 2;
      }
    });

    const taxAmount = cgst + sgst + igst;
    const rawGrandTotal = taxableAmount + taxAmount + (Number(fittingCharges) || 0);
    const roundOff = Number((Math.round(rawGrandTotal) - rawGrandTotal).toFixed(2));
    const totalAmount = Math.round(rawGrandTotal);

    return {
      subtotal: Number(subtotal.toFixed(2)),
      discountTotal: Number(discountTotal.toFixed(2)),
      taxableAmount: Number(taxableAmount.toFixed(2)),
      cgst: Number(cgst.toFixed(2)),
      sgst: Number(sgst.toFixed(2)),
      igst: Number(igst.toFixed(2)),
      taxAmount: Number(taxAmount.toFixed(2)),
      roundOff,
      totalAmount
    };
  }, [items, fittingCharges, isInterstate]);

  const handleSubmit = (statusToSet: QuotationStatus) => {
    if (!customerName.trim()) {
      alert('Please enter or select a customer name.');
      return;
    }

    const validItems = items.filter((i) => i.itemName.trim() || i.partNumber.trim());
    if (validItems.length === 0) {
      alert('Please add at least one valid spare-part or service item.');
      return;
    }

    const quotationRecord: Quotation = {
      id: editingQuote?.id || `qt-${Date.now()}`,
      quotationNumber: quotationNumber.trim() || `QT-${Date.now()}`,
      date,
      validUntil,
      validDays,
      customerId: selectedCustomerId || undefined,
      customerName: customerName.trim(),
      customerMobile: customerMobile.trim() || undefined,
      customerGstin: customerGstin.trim() || undefined,
      vehicleNumber: vehicleNumber.trim() || undefined,
      vehicleModel: vehicleModel.trim() || undefined,
      remarks: remarks.trim() || undefined,
      termsConditions: termsConditions.trim(),
      items: validItems,
      subtotal: calculations.subtotal,
      discountTotal: calculations.discountTotal,
      taxableAmount: calculations.taxableAmount,
      cgst: calculations.cgst,
      sgst: calculations.sgst,
      igst: calculations.igst,
      taxAmount: calculations.taxAmount,
      fittingCharges: Number(fittingCharges) || 0,
      roundOff: calculations.roundOff,
      totalAmount: calculations.totalAmount,
      status: editingQuote ? (editingQuote.status === 'CONVERTED' ? 'CONVERTED' : statusToSet) : statusToSet,
      convertedInvoiceNo: editingQuote?.convertedInvoiceNo,
      convertedAt: editingQuote?.convertedAt,
      createdBy: editingQuote?.createdBy || currentUser,
      createdAt: editingQuote?.createdAt || `${date}, ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
    };

    onSave(quotationRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest border border-surface-container-high rounded shadow-xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-xs">
        {/* Header */}
        <div className="px-5 py-3.5 bg-surface-container-low border-b border-surface-container-high flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-xl">request_quote</span>
            <div>
              <h2 className="font-bold text-sm text-on-surface">
                {editingQuote ? `Edit Quotation (${editingQuote.quotationNumber})` : 'New Spare Estimate Quotation'}
              </h2>
              <p className="text-[11px] text-outline">
                Enter customer details, select spare parts, apply fitting charges &amp; proforma terms
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-surface-container text-outline hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Top Section: Quotation Info & Customer Selection */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-surface-container-low p-3.5 rounded border border-surface-container-high">
            {/* Quotation No */}
            <div>
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
                Quotation No
              </label>
              <input
                type="text"
                value={quotationNumber}
                onChange={(e) => setQuotationNumber(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-surface-container-lowest border border-surface-container-highest rounded font-mono font-bold text-secondary text-xs focus:outline-none focus:border-secondary"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
                Estimate Date
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-surface-container-lowest border border-surface-container-highest rounded text-xs focus:outline-none focus:border-secondary"
              />
            </div>

            {/* Validity Days */}
            <div>
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
                Validity Period
              </label>
              <select
                value={validDays}
                onChange={(e) => handleValidDaysChange(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-surface-container-lowest border border-surface-container-highest rounded text-xs focus:outline-none focus:border-secondary font-medium"
              >
                <option value={7}>7 Days (Short Estimate)</option>
                <option value={15}>15 Days (Standard)</option>
                <option value={30}>30 Days (Extended)</option>
                <option value={45}>45 Days (Institutional)</option>
              </select>
            </div>

            {/* Valid Until */}
            <div>
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
                Valid Until
              </label>
              <input
                type="text"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-surface-container border border-surface-container-highest rounded text-xs font-medium text-on-surface"
              />
            </div>

            {/* Quick Customer Picker */}
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
                Existing Customer / Garage
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => handleCustomerSelect(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-surface-container-lowest border border-surface-container-highest rounded text-xs focus:outline-none focus:border-secondary"
              >
                <option value="">-- Walk-in / New Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.mobile}) - {c.customerType}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
                Customer Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Name or Workshop"
                className="w-full px-2.5 py-1.5 bg-surface-container-lowest border border-surface-container-highest rounded text-xs focus:outline-none focus:border-secondary font-semibold"
              />
            </div>

            {/* Customer Mobile */}
            <div>
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
                Mobile Number
              </label>
              <input
                type="text"
                value={customerMobile}
                onChange={(e) => setCustomerMobile(e.target.value)}
                placeholder="10-digit mobile"
                className="w-full px-2.5 py-1.5 bg-surface-container-lowest border border-surface-container-highest rounded font-mono text-xs focus:outline-none focus:border-secondary"
              />
            </div>

            {/* Vehicle Number */}
            <div>
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
                Vehicle Reg No
              </label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                placeholder="e.g. TN 01 AB 1234"
                className="w-full px-2.5 py-1.5 bg-surface-container-lowest border border-surface-container-highest rounded font-mono text-xs uppercase focus:outline-none focus:border-secondary"
              />
            </div>

            {/* Vehicle Model */}
            <div>
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
                Bike Model &amp; Variant
              </label>
              <input
                type="text"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                placeholder="e.g. Pulsar 150 UG4"
                className="w-full px-2.5 py-1.5 bg-surface-container-lowest border border-surface-container-highest rounded text-xs focus:outline-none focus:border-secondary"
              />
            </div>

            {/* Customer GSTIN */}
            <div>
              <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
                GSTIN (Optional)
              </label>
              <input
                type="text"
                value={customerGstin}
                onChange={(e) => setCustomerGstin(e.target.value.toUpperCase())}
                placeholder="33AAAAA0000A1Z5"
                className="w-full px-2.5 py-1.5 bg-surface-container-lowest border border-surface-container-highest rounded font-mono text-xs uppercase focus:outline-none focus:border-secondary"
              />
            </div>

            {/* Tax Regime */}
            <div className="flex items-center gap-2 pt-4">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isInterstate}
                  onChange={(e) => setIsInterstate(e.target.checked)}
                  className="rounded border-surface-container-highest text-secondary focus:ring-0"
                />
                <span className="text-[11px] font-medium text-on-surface">Interstate IGST (Out of state)</span>
              </label>
            </div>
          </div>

          {/* Quotation Line Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-on-surface uppercase tracking-wider">
                Spare-Parts &amp; Service Items ({items.length})
              </span>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-high rounded text-xs font-bold text-secondary flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">add</span>
                <span>+ Add Item Line</span>
              </button>
            </div>

            <div className="border border-surface-container-high rounded overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-surface-container font-label-caps text-[10px] text-outline uppercase tracking-wider">
                  <tr>
                    <th className="py-2 px-2.5 w-10 text-center">#</th>
                    <th className="py-2 px-2.5 min-w-[180px]">Spare Part / Item Name</th>
                    <th className="py-2 px-2.5 w-28">Part No (SKU)</th>
                    <th className="py-2 px-2.5 w-28">Vehicle Fit</th>
                    <th className="py-2 px-2.5 w-16 text-center">Qty</th>
                    <th className="py-2 px-2.5 w-24 text-right">Rate (₹)</th>
                    <th className="py-2 px-2.5 w-20 text-right">Disc (₹)</th>
                    <th className="py-2 px-2.5 w-18 text-center">GST %</th>
                    <th className="py-2 px-2.5 w-24 text-right">Amount (₹)</th>
                    <th className="py-2 px-2 w-8 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high font-table-cell bg-surface-container-lowest">
                  {items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-1.5 px-2.5 text-center text-outline font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      {/* Part Selector / Name */}
                      <td className="py-1.5 px-2">
                        <select
                          value={item.partId || ''}
                          onChange={(e) => handleItemPartSelect(idx, e.target.value)}
                          className="w-full px-2 py-1 bg-surface-container-low border border-surface-container-highest rounded text-xs focus:outline-none focus:border-secondary mb-1"
                        >
                          <option value="">-- Select Master Spare --</option>
                          {parts.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} [{p.sku}] (Stock: {p.currentStock}) - ₹{p.counterPrice}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={item.itemName}
                          onChange={(e) => handleItemFieldChange(idx, 'itemName', e.target.value)}
                          placeholder="Custom description..."
                          className="w-full px-2 py-0.5 bg-surface-container-lowest border border-surface-container-highest rounded text-[11px] text-outline focus:outline-none"
                        />
                      </td>

                      {/* Part No */}
                      <td className="py-1.5 px-2">
                        <input
                          type="text"
                          value={item.partNumber}
                          onChange={(e) => handleItemFieldChange(idx, 'partNumber', e.target.value)}
                          placeholder="SKU"
                          className="w-full px-2 py-1 bg-surface-container-low border border-surface-container-highest rounded font-mono text-xs focus:outline-none"
                        />
                      </td>

                      {/* Vehicle */}
                      <td className="py-1.5 px-2">
                        <input
                          type="text"
                          value={item.vehicle || ''}
                          onChange={(e) => handleItemFieldChange(idx, 'vehicle', e.target.value)}
                          placeholder="Fitment"
                          className="w-full px-2 py-1 bg-surface-container-low border border-surface-container-highest rounded text-xs focus:outline-none"
                        />
                      </td>

                      {/* Quantity */}
                      <td className="py-1.5 px-2">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => handleItemFieldChange(idx, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full px-1.5 py-1 bg-surface-container-low border border-surface-container-highest rounded font-mono text-center text-xs focus:outline-none"
                        />
                      </td>

                      {/* Rate */}
                      <td className="py-1.5 px-2">
                        <input
                          type="number"
                          step="any"
                          min={0}
                          value={item.rate}
                          onChange={(e) => handleItemFieldChange(idx, 'rate', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 bg-surface-container-low border border-surface-container-highest rounded font-mono text-right text-xs focus:outline-none"
                        />
                      </td>

                      {/* Discount */}
                      <td className="py-1.5 px-2">
                        <input
                          type="number"
                          min={0}
                          value={item.discount}
                          onChange={(e) => handleItemFieldChange(idx, 'discount', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 bg-surface-container-low border border-surface-container-highest rounded font-mono text-right text-xs focus:outline-none"
                        />
                      </td>

                      {/* GST % */}
                      <td className="py-1.5 px-2">
                        <select
                          value={item.taxRate}
                          onChange={(e) => handleItemFieldChange(idx, 'taxRate', parseFloat(e.target.value) || 0)}
                          className="w-full px-1 py-1 bg-surface-container-low border border-surface-container-highest rounded text-center text-xs font-mono focus:outline-none"
                        >
                          <option value={0}>0%</option>
                          <option value={5}>5%</option>
                          <option value={12}>12%</option>
                          <option value={18}>18%</option>
                          <option value={28}>28%</option>
                        </select>
                      </td>

                      {/* Line Amount */}
                      <td className="py-1.5 px-2.5 text-right font-mono font-bold text-on-surface">
                        {formatCurrency(item.amount)}
                      </td>

                      {/* Remove Row */}
                      <td className="py-1.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          disabled={items.length <= 1}
                          className={`p-1 rounded text-outline hover:text-error ${
                            items.length <= 1 ? 'opacity-30 cursor-not-allowed' : ''
                          }`}
                        >
                          <span className="material-symbols-outlined text-[15px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Section: Terms & Summary Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Left: Remarks & Terms */}
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
                  Estimate Remarks / Vehicle Condition
                </label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Front brake disc worn out, rear suspension squeaking..."
                  className="w-full p-2 bg-surface-container-low border border-surface-container-highest rounded text-xs focus:outline-none focus:border-secondary resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-outline uppercase tracking-wider mb-1">
                  Terms &amp; Conditions
                </label>
                <textarea
                  rows={3}
                  value={termsConditions}
                  onChange={(e) => setTermsConditions(e.target.value)}
                  className="w-full p-2 bg-surface-container-low border border-surface-container-highest rounded text-[11px] font-mono focus:outline-none focus:border-secondary resize-none"
                />
              </div>
            </div>

            {/* Right: Calculations Summary Box */}
            <div className="bg-surface-container-low p-4 rounded border border-surface-container-high space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-outline">Items Subtotal:</span>
                <span className="font-mono font-semibold">{formatCurrency(calculations.subtotal)}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-outline">Total Item Discounts:</span>
                <span className="font-mono text-tertiary">-{formatCurrency(calculations.discountTotal)}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-outline">Taxable Value:</span>
                <span className="font-mono font-semibold">{formatCurrency(calculations.taxableAmount)}</span>
              </div>

              {isInterstate ? (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-outline">IGST (Interstate):</span>
                  <span className="font-mono">{formatCurrency(calculations.igst)}</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-outline">CGST Total:</span>
                    <span className="font-mono">{formatCurrency(calculations.cgst)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-outline">SGST Total:</span>
                    <span className="font-mono">{formatCurrency(calculations.sgst)}</span>
                  </div>
                </>
              )}

              {/* Fitting / Labour Charges */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-surface-container-high">
                <span className="font-medium text-on-surface">Fitting &amp; Labour Charges:</span>
                <div className="flex items-center gap-1">
                  <span className="text-outline">₹</span>
                  <input
                    type="number"
                    min={0}
                    value={fittingCharges}
                    onChange={(e) => setFittingCharges(parseFloat(e.target.value) || 0)}
                    className="w-24 px-2 py-1 bg-surface-container-lowest border border-surface-container-highest rounded text-right font-mono font-bold text-xs"
                  />
                </div>
              </div>

              {calculations.roundOff !== 0 && (
                <div className="flex items-center justify-between text-xs text-outline">
                  <span>Round Off:</span>
                  <span className="font-mono">{calculations.roundOff > 0 ? `+₹${calculations.roundOff}` : `-₹${Math.abs(calculations.roundOff)}`}</span>
                </div>
              )}

              {/* Grand Total */}
              <div className="flex items-center justify-between pt-2 border-t border-surface-container-highest">
                <span className="font-bold text-sm text-on-surface">Estimate Grand Total:</span>
                <span className="font-mono text-base font-bold text-secondary">
                  {formatCurrency(calculations.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 bg-surface-container-low border-t border-surface-container-high flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded border border-surface-container-highest hover:bg-surface-container text-xs font-semibold text-outline transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSubmit('DRAFT')}
              className="px-3.5 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded text-xs font-bold transition-colors"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('SENT')}
              className="px-4 py-1.5 bg-secondary hover:bg-secondary-container text-on-secondary rounded text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              <span>Save &amp; Issue Estimate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
