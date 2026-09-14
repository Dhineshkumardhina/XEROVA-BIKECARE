import React, { useState } from 'react';
import {
  CustomerProfileData,
  CustomerVehicleRecord,
  CustomerType,
  MechanicRecord,
  MessageTemplate,
  LoyaltyTransactionType,
  ReferralRecord
} from '../../types';

// ==========================================
// 1. ADD / EDIT CUSTOMER MODAL
// ==========================================
interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: CustomerProfileData) => void;
  existingCustomer?: CustomerProfileData | null;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingCustomer
}) => {
  const [name, setName] = useState(existingCustomer?.name || '');
  const [mobile, setMobile] = useState(existingCustomer?.mobile || '');
  const [email, setEmail] = useState(existingCustomer?.email || '');
  const [customerType, setCustomerType] = useState<CustomerType>(existingCustomer?.customerType || 'Retail');
  const [gstin, setGstin] = useState(existingCustomer?.gstin || '');
  const [address, setAddress] = useState(existingCustomer?.address || '');
  const [city, setCity] = useState(existingCustomer?.city || 'Chennai');
  const [creditLimit, setCreditLimit] = useState(existingCustomer?.creditLimit || 0);
  const [formError, setFormError] = useState<string | null>(null);

  // Quick initial bike
  const [vehicleRegNo, setVehicleRegNo] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim()) {
      setFormError('Please provide Customer Name and Mobile Number');
      return;
    }

    const newVehicles: CustomerVehicleRecord[] = existingCustomer?.vehicles || [];
    if (vehicleRegNo.trim()) {
      newVehicles.push({
        id: 'veh-' + Date.now(),
        regNo: vehicleRegNo.trim().toUpperCase(),
        manufacturer: vehicleMake,
        model: vehicleModel,
        history: []
      });
    }

    const customerData: CustomerProfileData = {
      id: existingCustomer?.id || 'cust-' + Date.now(),
      name: name.trim(),
      mobile: mobile.trim(),
      email: email.trim() || undefined,
      customerType,
      gstin: gstin.trim().toUpperCase() || undefined,
      address: address.trim() || 'Counter Walk-in',
      city: city.trim() || 'Chennai',
      state: 'Tamil Nadu',
      totalSales: existingCustomer?.totalSales || 0,
      outstanding: existingCustomer?.outstanding || 0,
      creditLimit: Number(creditLimit) || 0,
      loyaltyPoints: existingCustomer?.loyaltyPoints || 100, // 100 welcome bonus pts
      totalPurchasesCount: existingCustomer?.totalPurchasesCount || 0,
      lastPurchaseDate: existingCustomer?.lastPurchaseDate || 'Today',
      avgBillValue: existingCustomer?.avgBillValue || 0,
      status: 'Active',
      loyaltyTier: existingCustomer?.loyaltyTier || 'Silver',
      loyaltyCardNumber: existingCustomer?.loyaltyCardNumber || `LOY-${mobile.slice(-4)}`,
      referralCode: existingCustomer?.referralCode || `REF-${name.slice(0, 4).toUpperCase()}`,
      segmentTags: existingCustomer?.segmentTags || [customerType, 'New Customer'],
      vehicles: newVehicles,
      createdDate: existingCustomer?.createdDate || '12-Sep-2026'
    };

    onSave(customerData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest max-w-lg w-full rounded border border-surface-container-high shadow-2xl p-6 space-y-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-2xl">person_add</span>
            <h3 className="font-headline-md text-base font-bold text-on-surface">
              {existingCustomer ? 'Edit Customer Account' : 'Register New Counter Customer'}
            </h3>
          </div>
          <button onClick={onClose} className="text-outline hover:text-on-surface">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {formError && (
          <div className="p-2.5 bg-error/10 border border-error/20 rounded text-error text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-outline font-medium mb-1">Customer / Workshop Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Ramesh Kumar or Murugan Tech"
                className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-on-surface font-semibold focus:outline-none focus:border-secondary"
              />
            </div>

            <div>
              <label className="block text-outline font-medium mb-1">Mobile Number *</label>
              <input
                type="tel"
                required
                value={mobile}
                onChange={e => setMobile(e.target.value)}
                placeholder="10-digit Mobile (e.g. 98401 23456)"
                className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-on-surface font-mono font-bold focus:outline-none focus:border-secondary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-outline font-medium mb-1">Customer Classification</label>
              <select
                value={customerType}
                onChange={e => setCustomerType(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-on-surface font-semibold"
              >
                <option value="Retail">Retail (Walk-in Counter)</option>
                <option value="Mechanic">Mechanic (Independent)</option>
                <option value="Workshop">Workshop (Garage Account)</option>
                <option value="Wholesale">Wholesale (Stockist)</option>
                <option value="Dealer">Dealer (Spare Parts Reseller)</option>
                <option value="Fleet">Fleet (Commercial Operator)</option>
              </select>
            </div>

            <div>
              <label className="block text-outline font-medium mb-1">GSTIN (Optional for B2B)</label>
              <input
                type="text"
                value={gstin}
                onChange={e => setGstin(e.target.value)}
                placeholder="33AAAAA0000A1Z5"
                className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-on-surface font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-outline font-medium mb-1">Address / Street</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Street address or area"
                className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-on-surface"
              />
            </div>
            <div>
              <label className="block text-outline font-medium mb-1">City / Location</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="Chennai"
                className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-on-surface"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-outline font-medium mb-1">Credit Limit (₹)</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={creditLimit}
                onChange={e => setCreditLimit(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-on-surface font-mono"
              />
            </div>
            <div>
              <label className="block text-outline font-medium mb-1">Email ID (Optional)</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="customer@email.com"
                className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-on-surface"
              />
            </div>
          </div>

          {!existingCustomer && (
            <div className="p-3 bg-surface-container-low rounded border border-surface-container-high space-y-2">
              <span className="font-bold text-on-surface block">Primary Motorcycle Registration (Optional):</span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <input
                    type="text"
                    value={vehicleRegNo}
                    onChange={e => setVehicleRegNo(e.target.value)}
                    placeholder="TN-01-AB-1234"
                    className="w-full px-2 py-1 bg-surface-container-lowest border border-surface-container-high rounded font-mono text-on-surface font-bold text-xs"
                  />
                </div>
                <div>
                  <select
                    value={vehicleMake}
                    onChange={e => setVehicleMake(e.target.value)}
                    className="w-full px-2 py-1 bg-surface-container-lowest border border-surface-container-high rounded text-xs text-on-surface font-semibold"
                  >
                    <option value="Bajaj">Bajaj</option>
                    <option value="Hero">Hero</option>
                    <option value="TVS">TVS</option>
                    <option value="Royal Enfield">Royal Enfield</option>
                    <option value="Honda">Honda</option>
                    <option value="Yamaha">Yamaha</option>
                    <option value="Suzuki">Suzuki</option>
                    <option value="KTM">KTM</option>
                  </select>
                </div>
                <div>
                  <input
                    type="text"
                    value={vehicleModel}
                    onChange={e => setVehicleModel(e.target.value)}
                    placeholder="Model (e.g. Pulsar 150)"
                    className="w-full px-2 py-1 bg-surface-container-lowest border border-surface-container-high rounded text-xs text-on-surface font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-surface-container-high">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-secondary hover:bg-secondary-container text-on-secondary rounded font-bold text-xs shadow-xs"
            >
              Save Customer Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 2. ADD VEHICLE MODAL
// ==========================================
interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveVehicle: (vehicle: CustomerVehicleRecord) => void;
}

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({
  isOpen,
  onClose,
  onSaveVehicle
}) => {
  const [regNo, setRegNo] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [variant, setVariant] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNo.trim()) {
      setFormError('Please enter vehicle registration number');
      return;
    }

    const veh: CustomerVehicleRecord = {
      id: 'veh-' + Date.now(),
      regNo: regNo.trim().toUpperCase(),
      manufacturer,
      model,
      variant: variant || undefined,
      year: Number(year) || undefined,
      notes: notes || undefined,
      history: []
    };

    onSaveVehicle(veh);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest max-w-md w-full rounded border border-surface-container-high shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-2xl">two_wheeler</span>
            <h3 className="font-headline-md text-base font-bold text-on-surface">Attach Motorcycle to Customer</h3>
          </div>
          <button onClick={onClose} className="text-outline hover:text-on-surface">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {formError && (
          <div className="p-2.5 bg-error/10 border border-error/20 rounded text-error text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-outline font-medium mb-1">Registration Plate Number *</label>
            <input
              type="text"
              required
              value={regNo}
              onChange={e => {
                setRegNo(e.target.value);
                setFormError(null);
              }}
              placeholder="e.g. TN-01-AB-1234"
              className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded font-mono font-bold text-secondary text-sm focus:outline-none focus:border-secondary"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-outline font-medium mb-1">Manufacturer Make</label>
              <select
                value={manufacturer}
                onChange={e => setManufacturer(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded font-semibold text-on-surface"
              >
                <option value="Bajaj">Bajaj</option>
                <option value="Hero">Hero</option>
                <option value="TVS">TVS</option>
                <option value="Royal Enfield">Royal Enfield</option>
                <option value="Honda">Honda</option>
                <option value="Yamaha">Yamaha</option>
                <option value="Suzuki">Suzuki</option>
                <option value="KTM">KTM</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-outline font-medium mb-1">Model Name</label>
              <input
                type="text"
                required
                value={model}
                onChange={e => setModel(e.target.value)}
                placeholder="Pulsar 150 / Splendor"
                className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded font-semibold text-on-surface"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-outline font-medium mb-1">Variant / Trim</label>
              <input
                type="text"
                value={variant}
                onChange={e => setVariant(e.target.value)}
                placeholder="BS6 / Single Channel ABS"
                className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-on-surface"
              />
            </div>
            <div>
              <label className="block text-outline font-medium mb-1">Model Year</label>
              <input
                type="number"
                min="1990"
                max="2030"
                value={year}
                onChange={e => setYear(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded font-mono text-on-surface"
              />
            </div>
          </div>

          <div>
            <label className="block text-outline font-medium mb-1">Special Garage / Service Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Uses 10W50 synthetic oil, modified aftermarket exhaust"
              className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-on-surface"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-surface-container-high">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-surface-container text-on-surface rounded font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-secondary text-on-secondary rounded font-bold text-xs shadow-xs"
            >
              Add Vehicle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 3. ADJUST LOYALTY POINTS MODAL (AUDITED)
// ==========================================
interface AdjustLoyaltyPointsModalProps {
  isOpen: boolean;
  customer?: CustomerProfileData | null;
  onClose: () => void;
  onConfirmAdjustment: (customerId: string, pointsDelta: number, reason: string, type: LoyaltyTransactionType) => void;
}

export const AdjustLoyaltyPointsModal: React.FC<AdjustLoyaltyPointsModalProps> = ({
  isOpen,
  customer,
  onClose,
  onConfirmAdjustment
}) => {
  const [pointsDelta, setPointsDelta] = useState<number>(50);
  const [type, setType] = useState<LoyaltyTransactionType>('Bonus');
  const [reason, setReason] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen || !customer) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setFormError('Mandatory Audit Requirement: Please specify the reason for adjusting points.');
      return;
    }
    const delta = type === 'Redemption' || type === 'Expiry' ? -Math.abs(pointsDelta) : pointsDelta;
    onConfirmAdjustment(customer.id, delta, reason.trim(), type);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest max-w-md w-full rounded border border-surface-container-high shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-2xl">stars</span>
            <div>
              <h3 className="font-headline-md text-base font-bold text-on-surface">Audit Loyalty Points Adjustment</h3>
              <p className="text-xs text-outline">{customer.name} (Current: {customer.loyaltyPoints} pts)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-outline hover:text-on-surface">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {formError && (
          <div className="p-2.5 bg-error/10 border border-error/20 rounded text-error text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-outline font-medium mb-1">Adjustment Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-on-surface font-semibold"
              >
                <option value="Bonus">Bonus (+)</option>
                <option value="Adjustment">Correction (+ / -)</option>
                <option value="Referral">Referral Bonus (+)</option>
                <option value="Redemption">Redeem Discount (-)</option>
                <option value="Expiry">Manual Expiry (-)</option>
              </select>
            </div>

            <div>
              <label className="block text-outline font-medium mb-1">Points Quantity</label>
              <input
                type="number"
                required
                min="1"
                value={pointsDelta}
                onChange={e => setPointsDelta(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded font-mono font-bold text-secondary text-sm focus:outline-none focus:border-secondary"
              />
            </div>
          </div>

          <div>
            <label className="block text-outline font-medium mb-1">
              Mandatory Audit Reason / Reference Note *
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={e => {
                setReason(e.target.value);
                setFormError(null);
              }}
              placeholder="e.g. Festival goodwill bonus awarded by store manager / Counter bill discrepancy correction"
              className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-on-surface focus:outline-none focus:border-secondary"
            />
          </div>

          <div className="p-2.5 rounded bg-surface-container text-[11px] text-outline flex justify-between items-center">
            <span>New Projected Balance:</span>
            <strong className="font-mono text-sm text-on-surface">
              {type === 'Redemption' || type === 'Expiry'
                ? Math.max(0, customer.loyaltyPoints - pointsDelta)
                : customer.loyaltyPoints + pointsDelta}{' '}
              pts
            </strong>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-surface-container-high">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-surface-container text-on-surface rounded font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-secondary text-on-secondary rounded font-bold text-xs shadow-xs"
            >
              Apply &amp; Audit Log Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 4. REDEEM LOYALTY POINTS MODAL
// ==========================================
interface RedeemPointsModalProps {
  isOpen: boolean;
  customer?: CustomerProfileData | null;
  onClose: () => void;
  onConfirmRedemption: (customerId: string, pointsToRedeem: number, billRef: string) => void;
}

export const RedeemPointsModal: React.FC<RedeemPointsModalProps> = ({
  isOpen,
  customer,
  onClose,
  onConfirmRedemption
}) => {
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(200);
  const [billRef, setBillRef] = useState<string>('COUNTER-BILL');
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen || !customer) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pointsToRedeem > customer.loyaltyPoints) {
      setFormError('Cannot redeem more points than current balance');
      return;
    }
    onConfirmRedemption(customer.id, pointsToRedeem, billRef);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest max-w-md w-full rounded border border-surface-container-high shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-on-tertiary-container text-2xl">redeem</span>
            <div>
              <h3 className="font-headline-md text-base font-bold text-on-surface">Redeem Points for Cash Discount</h3>
              <p className="text-xs text-outline">{customer.name} (Available: {customer.loyaltyPoints} pts)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-outline hover:text-on-surface">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {formError && (
          <div className="p-2.5 bg-error/10 border border-error/20 rounded text-error text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-outline font-medium mb-1">Points to Redeem</label>
            <input
              type="number"
              required
              min="100"
              max={customer.loyaltyPoints}
              step="50"
              value={pointsToRedeem}
              onChange={e => setPointsToRedeem(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded font-mono font-bold text-secondary text-sm"
            />
          </div>

          <div>
            <label className="block text-outline font-medium mb-1">Invoice / Counter Reference #</label>
            <input
              type="text"
              required
              value={billRef}
              onChange={e => setBillRef(e.target.value)}
              placeholder="e.g. INV-2026-0891 or POS-COUNTER"
              className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded font-mono text-on-surface"
            />
          </div>

          <div className="p-3 bg-surface-container-low rounded border border-surface-container-high space-y-1.5">
            <div className="flex justify-between">
              <span className="text-outline">Discount Applied to Bill:</span>
              <span className="font-mono font-bold text-on-tertiary-container text-sm">₹{(pointsToRedeem * 1.0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">Remaining Points:</span>
              <span className="font-mono font-bold text-on-surface">{customer.loyaltyPoints - pointsToRedeem} pts</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-surface-container-high">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-surface-container text-on-surface rounded font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-secondary text-on-secondary rounded font-bold text-xs shadow-xs"
            >
              Confirm Discount Voucher
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 5. SEND MESSAGE (WHATSAPP / SMS) MODAL
// ==========================================
interface SendMessageModalProps {
  isOpen: boolean;
  customer?: CustomerProfileData | null;
  templates: MessageTemplate[];
  onClose: () => void;
  onSend: (mobile: string, message: string, channel: 'WhatsApp' | 'SMS', templateId?: string) => void;
}

export const SendMessageModal: React.FC<SendMessageModalProps> = ({
  isOpen,
  customer,
  templates,
  onClose,
  onSend
}) => {
  const [channel, setChannel] = useState<'WhatsApp' | 'SMS'>('WhatsApp');
  const [mobile, setMobile] = useState(customer?.mobile || '');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('CUSTOM');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTemplateChange = (tplId: string) => {
    setSelectedTemplateId(tplId);
    if (tplId === 'CUSTOM') {
      setMessage('');
    } else {
      const found = templates.find(t => t.id === tplId);
      if (found) {
        let txt = found.content;
        if (customer) {
          txt = txt.replace(/\{\{customer_name\}\}/g, customer.name);
          txt = txt.replace(/\{\{outstanding\}\}/g, customer.outstanding.toString());
          txt = txt.replace(/\{\{points\}\}/g, customer.loyaltyPoints.toString());
          txt = txt.replace(/\{\{invoice_number\}\}/g, 'INV-2026-0891');
          txt = txt.replace(/\{\{amount\}\}/g, '4,820');
        }
        setMessage(txt);
        if (found.channel !== 'Both') setChannel(found.channel as any);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile.trim() || !message.trim()) {
      setFormError('Please enter recipient mobile and message body.');
      return;
    }
    onSend(mobile.trim(), message.trim(), channel, selectedTemplateId !== 'CUSTOM' ? selectedTemplateId : undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest max-w-md w-full rounded border border-surface-container-high shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-2xl">chat</span>
            <div>
              <h3 className="font-headline-md text-base font-bold text-on-surface">Send Message to Customer</h3>
              <p className="text-xs text-outline">{customer?.name || 'Direct Recipient'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-outline hover:text-on-surface">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {formError && (
          <div className="p-2.5 bg-error/10 border border-error/20 rounded text-error text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-outline font-medium mb-1">Channel Gateway</label>
              <select
                value={channel}
                onChange={e => setChannel(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-on-surface font-semibold"
              >
                <option value="WhatsApp">WhatsApp Message</option>
                <option value="SMS">SMS Gateway</option>
              </select>
            </div>
            <div>
              <label className="block text-outline font-medium mb-1">Recipient Mobile</label>
              <input
                type="tel"
                required
                value={mobile}
                onChange={e => {
                  setMobile(e.target.value);
                  setFormError(null);
                }}
                placeholder="10-digit number"
                className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded font-mono font-bold text-on-surface"
              />
            </div>
          </div>

          <div>
            <label className="block text-outline font-medium mb-1">Apply Template</label>
            <select
              value={selectedTemplateId}
              onChange={e => handleTemplateChange(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-on-surface font-medium"
            >
              <option value="CUSTOM">Custom Manual Message</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-outline font-medium mb-1">Message Text</label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={e => {
                setMessage(e.target.value);
                setFormError(null);
              }}
              placeholder="Type message content..."
              className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded font-mono text-on-surface focus:outline-none focus:border-secondary"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-surface-container-high">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-surface-container text-on-surface rounded font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-secondary text-on-secondary rounded font-bold text-xs shadow-xs flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              <span>Send Now</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 6. ADD MECHANIC MODAL
// ==========================================
interface AddMechanicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (mechanic: MechanicRecord) => void;
}

export const AddMechanicModal: React.FC<AddMechanicModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [workshopName, setWorkshopName] = useState('');
  const [location, setLocation] = useState('');
  const [customerCode, setCustomerCode] = useState('');
  const [commissionRate, setCommissionRate] = useState(5.0);
  const [upiId, setUpiId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim() || !workshopName.trim()) {
      setFormError('Please fill mechanic name, mobile, and workshop name.');
      return;
    }

    const mech: MechanicRecord = {
      id: 'mec-' + Date.now(),
      name: name.trim(),
      mobile: mobile.trim(),
      workshopName: workshopName.trim(),
      location: location.trim() || 'Chennai',
      customerCode: customerCode.trim().toUpperCase() || `MEC-${name.slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-2)}`,
      loyaltyPoints: 0,
      totalReferredSales: 0,
      referralCount: 0,
      status: 'Active',
      commissionRatePercent: Number(commissionRate) || 5.0,
      joinedDate: '12-Sep-2026',
      upiId: upiId.trim() || undefined,
      pendingRewardAmount: 0
    };

    onSave(mech);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest max-w-md w-full rounded border border-surface-container-high shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-2xl">engineering</span>
            <h3 className="font-headline-md text-base font-bold text-on-surface">Onboard Bike Mechanic Partner</h3>
          </div>
          <button onClick={onClose} className="text-outline hover:text-on-surface">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {formError && (
          <div className="p-2.5 bg-error/10 border border-error/20 rounded text-error text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-outline font-medium mb-1">Mechanic Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  setFormError(null);
                }}
                placeholder="e.g. Ramu Asari"
                className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded font-semibold text-on-surface"
              />
            </div>
            <div>
              <label className="block text-outline font-medium mb-1">Mobile Number *</label>
              <input
                type="tel"
                required
                value={mobile}
                onChange={e => {
                  setMobile(e.target.value);
                  setFormError(null);
                }}
                placeholder="10-digit number"
                className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded font-mono font-bold text-on-surface"
              />
            </div>
          </div>

          <div>
            <label className="block text-outline font-medium mb-1">Workshop / Garage Name *</label>
            <input
              type="text"
              required
              value={workshopName}
              onChange={e => {
                setWorkshopName(e.target.value);
                setFormError(null);
              }}
              placeholder="e.g. Sri Balaji Two Wheeler Service"
              className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-on-surface font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-outline font-medium mb-1">Area / Location</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Guindy / T. Nagar"
                className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-on-surface"
              />
            </div>
            <div>
              <label className="block text-outline font-medium mb-1">Referral Code</label>
              <input
                type="text"
                value={customerCode}
                onChange={e => setCustomerCode(e.target.value)}
                placeholder="MEC-RAMU-01"
                className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded font-mono font-bold text-secondary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-outline font-medium mb-1">Commission Rate (%)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="20"
                value={commissionRate}
                onChange={e => setCommissionRate(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded font-mono text-on-surface"
              />
            </div>
            <div>
              <label className="block text-outline font-medium mb-1">UPI ID for Payout</label>
              <input
                type="text"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                placeholder="mechanic@upi"
                className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded font-mono text-on-surface"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-surface-container-high">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-surface-container text-on-surface rounded font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-secondary text-on-secondary rounded font-bold text-xs shadow-xs"
            >
              Onboard Mechanic
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 7. RECORD REFERRAL SALE MODAL
// ==========================================
interface RecordReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  mechanics: MechanicRecord[];
  customers: CustomerProfileData[];
  preselectedMechanic?: MechanicRecord | null;
  onSave: (referral: ReferralRecord) => void;
}

export const RecordReferralModal: React.FC<RecordReferralModalProps> = ({
  isOpen,
  onClose,
  mechanics,
  customers,
  preselectedMechanic,
  onSave
}) => {
  const [referrerType, setReferrerType] = useState<'Mechanic' | 'Customer'>('Mechanic');
  const [selectedMechanicId, setSelectedMechanicId] = useState<string>(preselectedMechanic?.id || (mechanics[0]?.id || ''));
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [invoiceNo, setInvoiceNo] = useState(`INV-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [salesAmount, setSalesAmount] = useState<number>(3500);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentMechanic = mechanics.find(m => m.id === selectedMechanicId);
  const commissionRate = currentMechanic?.commissionRatePercent || 5.0;
  const calculatedRewardCash = Math.round((salesAmount * commissionRate) / 100);
  const calculatedRewardPoints = Math.round(salesAmount / 100); // 1 pt per 100 Rs

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !invoiceNo.trim() || salesAmount <= 0) {
      setFormError('Please enter referred customer name, invoice number, and valid sales amount.');
      return;
    }

    const refRecord: ReferralRecord = {
      id: 'ref-' + Date.now(),
      referrerId: referrerType === 'Mechanic' ? (currentMechanic?.id || 'mec-1') : 'cust-1',
      referrerName: referrerType === 'Mechanic' ? (currentMechanic?.name || 'Mechanic') : 'Referred Customer',
      referrerType,
      referrerMobile: referrerType === 'Mechanic' ? currentMechanic?.mobile : undefined,
      referredCustomerId: 'cust-new-' + Date.now(),
      referredCustomerName: customerName.trim(),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      invoiceNo: invoiceNo.trim().toUpperCase(),
      salesAmount: Number(salesAmount),
      rewardPoints: calculatedRewardPoints,
      rewardCash: calculatedRewardCash,
      status: 'Successful',
      notes: notes.trim() || undefined
    };

    onSave(refRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest max-w-md w-full rounded border border-surface-container-high shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-2xl">share_reviews</span>
            <div>
              <h3 className="font-headline-md text-base font-bold text-on-surface">Record Referral Sale</h3>
              <p className="text-xs text-outline">Link bill to mechanic referral partner for commission credit</p>
            </div>
          </div>
          <button onClick={onClose} className="text-outline hover:text-on-surface">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {formError && (
          <div className="p-2.5 bg-error/10 border border-error/20 rounded text-error text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-outline font-medium mb-1">Referrer Category</label>
              <select
                value={referrerType}
                onChange={e => setReferrerType(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-on-surface font-semibold"
              >
                <option value="Mechanic">Mechanic / Garage</option>
                <option value="Customer">Counter Customer</option>
              </select>
            </div>

            {referrerType === 'Mechanic' ? (
              <div>
                <label className="block text-outline font-medium mb-1">Select Mechanic Partner</label>
                <select
                  value={selectedMechanicId}
                  onChange={e => setSelectedMechanicId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-on-surface font-semibold"
                >
                  {mechanics.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.customerCode})</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-outline font-medium mb-1">Referring Customer</label>
                <select
                  className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-on-surface font-semibold"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.mobile})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-outline font-medium mb-1">Referred Buyer Name *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={e => {
                  setCustomerName(e.target.value);
                  setFormError(null);
                }}
                placeholder="e.g. Ramesh Babu"
                className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-on-surface font-semibold"
              />
            </div>
            <div>
              <label className="block text-outline font-medium mb-1">Buyer Mobile</label>
              <input
                type="tel"
                value={customerMobile}
                onChange={e => setCustomerMobile(e.target.value)}
                placeholder="10-digit number"
                className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded font-mono text-on-surface"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-outline font-medium mb-1">Invoice / POS Bill # *</label>
              <input
                type="text"
                required
                value={invoiceNo}
                onChange={e => {
                  setInvoiceNo(e.target.value);
                  setFormError(null);
                }}
                className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded font-mono font-bold text-secondary text-xs"
              />
            </div>
            <div>
              <label className="block text-outline font-medium mb-1">Sales Gross Bill Value (₹) *</label>
              <input
                type="number"
                required
                min="10"
                value={salesAmount}
                onChange={e => setSalesAmount(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded font-mono font-bold text-on-surface text-sm"
              />
            </div>
          </div>

          {/* Reward Breakdown Card */}
          <div className="p-3 bg-surface-container-low rounded border border-surface-container-high space-y-1.5">
            <div className="flex justify-between">
              <span className="text-outline">Mechanic Commission ({commissionRate}%):</span>
              <span className="font-mono font-bold text-error">₹{calculatedRewardCash} Cash</span>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">Loyalty Points Credited:</span>
              <span className="font-mono font-bold text-secondary">+{calculatedRewardPoints} Points</span>
            </div>
          </div>

          <div>
            <label className="block text-outline font-medium mb-1">Spare Parts / Notes</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Clutch plate replacement, engine oil, chain kit"
              className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-on-surface"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-surface-container-high">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-surface-container text-on-surface rounded font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-secondary text-on-secondary rounded font-bold text-xs shadow-xs"
            >
              Confirm Referral Credit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 8. SETTLE MECHANIC COMMISSION MODAL
// ==========================================
interface SettleMechanicCommissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mechanic?: MechanicRecord | null;
  onConfirmSettlement: (mechanicId: string, amount: number, paymentMode: string, txnRef: string, notes: string) => void;
}

export const SettleMechanicCommissionModal: React.FC<SettleMechanicCommissionModalProps> = ({
  isOpen,
  onClose,
  mechanic,
  onConfirmSettlement
}) => {
  const [amount, setAmount] = useState<number>(mechanic?.pendingRewardAmount || 0);
  const [paymentMode, setPaymentMode] = useState<string>('UPI');
  const [txnRef, setTxnRef] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen || !mechanic) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setFormError('Please specify a valid settlement amount greater than 0.');
      return;
    }
    onConfirmSettlement(mechanic.id, amount, paymentMode, txnRef || 'CASH-SETTLE', notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest max-w-md w-full rounded border border-surface-container-high shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-2xl">payments</span>
            <div>
              <h3 className="font-headline-md text-base font-bold text-on-surface">Settle Mechanic Commission</h3>
              <p className="text-xs text-outline">{mechanic.name} ({mechanic.workshopName})</p>
            </div>
          </div>
          <button onClick={onClose} className="text-outline hover:text-on-surface">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {formError && (
          <div className="p-2.5 bg-error/10 border border-error/20 rounded text-error text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="p-3 rounded bg-surface-container-low border border-surface-container-high space-y-1">
            <div className="flex justify-between">
              <span className="text-outline">Unsettled Pending Commission:</span>
              <span className="font-mono font-bold text-error">₹{mechanic.pendingRewardAmount || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-outline">Registered UPI ID:</span>
              <span className="font-mono text-on-surface font-semibold">{mechanic.upiId || 'Not Configured'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-outline font-medium mb-1">Settlement Amount (₹) *</label>
              <input
                type="number"
                required
                min="1"
                max={mechanic.pendingRewardAmount || 100000}
                value={amount}
                onChange={e => {
                  setAmount(Number(e.target.value));
                  setFormError(null);
                }}
                className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded font-mono font-bold text-on-surface text-sm focus:outline-none focus:border-secondary"
              />
            </div>

            <div>
              <label className="block text-outline font-medium mb-1">Disbursement Mode</label>
              <select
                value={paymentMode}
                onChange={e => setPaymentMode(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-on-surface font-semibold"
              >
                <option value="UPI">UPI Transfer (Instant)</option>
                <option value="Cash">Cash at Counter</option>
                <option value="Bank NEFT">Bank NEFT / IMPS</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-outline font-medium mb-1">Transaction UTR / Ref Number</label>
            <input
              type="text"
              value={txnRef}
              onChange={e => setTxnRef(e.target.value)}
              placeholder="e.g. UPI-UTR-40918821990"
              className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded font-mono text-on-surface"
            />
          </div>

          <div>
            <label className="block text-outline font-medium mb-1">Audit Remarks / Notes</label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Weekly referral commission settlement"
              className="w-full px-2.5 py-1.5 bg-surface-container-low border border-surface-container-high rounded text-on-surface"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-surface-container-high">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-surface-container text-on-surface rounded font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-secondary text-on-secondary rounded font-bold text-xs shadow-xs"
            >
              Record Payout &amp; Clear Incentive
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
