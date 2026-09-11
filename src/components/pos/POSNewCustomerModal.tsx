import React, { useState } from 'react';
import { CustomerAccount } from '../../types';

interface POSNewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCustomer: (newCustomer: CustomerAccount) => void;
}

export const POSNewCustomerModal: React.FC<POSNewCustomerModalProps> = ({
  isOpen,
  onClose,
  onSaveCustomer
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gstin, setGstin] = useState('');
  const [address, setAddress] = useState('');
  const [tier, setTier] = useState<'Retail' | 'Garage Regular' | 'Wholesale'>('Garage Regular');
  const [creditLimit, setCreditLimit] = useState<number>(25000);
  const [openingBalance, setOpeningBalance] = useState<number>(0);

  // Vehicle info
  const [regNo, setRegNo] = useState('');
  const [bikeModel, setBikeModel] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a Customer or Garage name.');
      return;
    }

    const newCust: CustomerAccount = {
      id: `cust-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      gstin: gstin.trim().toUpperCase() || undefined,
      address: address.trim() || undefined,
      tier,
      rateTier: tier === 'Retail' ? 'MRP' : 'Wholesale',
      balance: openingBalance,
      creditLimit,
      vehicles: regNo.trim()
        ? [
            {
              id: `veh-${Date.now()}`,
              regNo: regNo.trim().toUpperCase(),
              model: bikeModel.trim() || 'Motorcycle'
            }
          ]
        : []
    };

    onSaveCustomer(newCust);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest w-full max-w-lg rounded-lg shadow-2xl border border-surface-container-highest overflow-hidden text-xs flex flex-col">
        {/* Header */}
        <div className="p-3 bg-surface-container flex items-center justify-between border-b border-surface-container-high">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[20px]">person_add</span>
            <span className="font-bold text-sm text-on-surface">Quick Add Customer / Garage</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-outline hover:text-on-surface hover:bg-surface-container-high"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-outline uppercase block mb-1">
                Customer / Garage Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sri Balaji Motors"
                className="w-full h-8 px-2.5 bg-surface-container-low border border-surface-container-high rounded text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary"
                autoFocus
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-outline uppercase block mb-1">
                Mobile Number *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile"
                className="w-full h-8 px-2.5 bg-surface-container-low border border-surface-container-high rounded text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-outline uppercase block mb-1">
                Customer Category
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as any)}
                className="w-full h-8 px-2 bg-surface-container-low border border-surface-container-high rounded text-xs font-semibold"
              >
                <option value="Garage Regular">Garage Account (Wholesale Rate)</option>
                <option value="Retail">Retail Walk-in (Counter MRP)</option>
                <option value="Wholesale">Wholesale Dealer</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-outline uppercase block mb-1">
                GSTIN (Tax Credit)
              </label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                placeholder="33AAAAA0000A1Z5"
                className="w-full h-8 px-2.5 bg-surface-container-low border border-surface-container-high rounded text-xs font-mono uppercase"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-outline uppercase block mb-1">
              Shop / Garage Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 14 Industrial Estate, Guindy, Chennai"
              className="w-full h-8 px-2.5 bg-surface-container-low border border-surface-container-high rounded text-xs text-on-surface"
            />
          </div>

          {/* Vehicle Section */}
          <div className="bg-surface-container-low p-2.5 rounded border border-surface-container-high space-y-2">
            <span className="text-[10px] font-bold uppercase text-outline block">
              Default Vehicle Registration (Optional)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={regNo}
                onChange={(e) => setRegNo(e.target.value.toUpperCase())}
                placeholder="Reg # (e.g. TN-01-AB-1234)"
                className="h-7 px-2 text-xs bg-surface-container-lowest border border-surface-container-highest rounded font-mono uppercase"
              />
              <input
                type="text"
                value={bikeModel}
                onChange={(e) => setBikeModel(e.target.value)}
                placeholder="Model (e.g. Pulsar 150)"
                className="h-7 px-2 text-xs bg-surface-container-lowest border border-surface-container-highest rounded"
              />
            </div>
          </div>

          {/* Credit & Balance */}
          {tier !== 'Retail' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-outline uppercase block mb-1">
                  Credit Limit (₹)
                </label>
                <input
                  type="number"
                  value={creditLimit || ''}
                  onChange={(e) => setCreditLimit(parseFloat(e.target.value) || 0)}
                  placeholder="25000"
                  className="w-full h-8 px-2.5 text-right font-mono bg-surface-container-low border border-surface-container-high rounded text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-outline uppercase block mb-1">
                  Opening Balance (₹)
                </label>
                <input
                  type="number"
                  value={openingBalance || ''}
                  onChange={(e) => setOpeningBalance(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full h-8 px-2.5 text-right font-mono bg-surface-container-low border border-surface-container-high rounded text-xs"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-surface-container-high">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded text-outline hover:bg-surface-container text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-secondary hover:bg-secondary-container text-on-secondary rounded font-bold text-xs shadow-xs"
            >
              Save &amp; Select Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
