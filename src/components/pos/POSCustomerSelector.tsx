import React, { useState, useEffect, useRef } from 'react';
import { CustomerAccount, CustomerVehicle, CartLineItem } from '../../types';

interface POSCustomerSelectorProps {
  customers: CustomerAccount[];
  selectedCustomer: CustomerAccount | null;
  onSelectCustomer: (cust: CustomerAccount | null) => void;
  selectedVehicle: CustomerVehicle | null;
  onSelectVehicle: (veh: CustomerVehicle | null) => void;
  walkInName: string;
  onChangeWalkInName: (name: string) => void;
  walkInPhone: string;
  onChangeWalkInPhone: (phone: string) => void;
  walkInVehicleNo: string;
  onChangeWalkInVehicleNo: (veh: string) => void;
  walkInBikeModel: string;
  onChangeWalkInBikeModel: (model: string) => void;
  onOpenNewCustomerModal: () => void;
  onAddVehicleQuick: (regNo: string, model: string) => void;
  isWalkIn: boolean;
  onToggleWalkIn: (isWalkIn: boolean) => void;
  cart: CartLineItem[];
  onApplyCustomerRateToCart: (partId: string, customRate: number) => void;
}

export const POSCustomerSelector: React.FC<POSCustomerSelectorProps> = ({
  customers,
  selectedCustomer,
  onSelectCustomer,
  selectedVehicle,
  onSelectVehicle,
  walkInName,
  onChangeWalkInName,
  walkInPhone,
  onChangeWalkInPhone,
  walkInVehicleNo,
  onChangeWalkInVehicleNo,
  walkInBikeModel,
  onChangeWalkInBikeModel,
  onOpenNewCustomerModal,
  onAddVehicleQuick,
  isWalkIn,
  onToggleWalkIn,
  cart,
  onApplyCustomerRateToCart,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [newRegNo, setNewRegNo] = useState('');
  const [newModel, setNewModel] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter customers by name, phone or GSTIN
  const query = searchTerm.trim().toLowerCase();
  const matchedCustomers = query
    ? customers.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.phone.replace(/\s+/g, '').includes(query) ||
        (c.gstin && c.gstin.toLowerCase().includes(query))
      )
    : [];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCustomer = (cust: CustomerAccount) => {
    onSelectCustomer(cust);
    onToggleWalkIn(false);
    setIsDropdownOpen(false);
    setSearchTerm('');
    // Auto-select first vehicle if available
    if (cust.vehicles && cust.vehicles.length > 0) {
      onSelectVehicle(cust.vehicles[0]);
    } else {
      onSelectVehicle(null);
    }
  };

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRegNo.trim()) return;
    onAddVehicleQuick(newRegNo.toUpperCase().trim(), newModel.trim() || 'Motorcycle');
    setNewRegNo('');
    setNewModel('');
    setIsAddVehicleOpen(false);
  };

  return (
    <div className="bg-surface-container-lowest border border-surface-container-high rounded-md p-3 shadow-xs space-y-3">
      {/* Top Header & Fast Switcher */}
      <div className="flex items-center justify-between border-b border-surface-container-high pb-2">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-secondary text-[18px]">person</span>
          <span className="font-bold text-xs uppercase text-outline tracking-wider">
            Customer Information
          </span>
        </div>

        {/* Walk-in vs Registered Toggle */}
        <div className="flex items-center bg-surface-container-low rounded p-0.5 text-xs">
          <button
            type="button"
            onClick={() => onToggleWalkIn(true)}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
              isWalkIn
                ? 'bg-secondary text-on-secondary shadow-xs'
                : 'text-outline hover:text-on-surface'
            }`}
          >
            Walk-in Retail
          </button>
          <button
            type="button"
            onClick={() => onToggleWalkIn(false)}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
              !isWalkIn
                ? 'bg-secondary text-on-secondary shadow-xs'
                : 'text-outline hover:text-on-surface'
            }`}
          >
            Account / Garage
          </button>
        </div>
      </div>

      {/* Case 1: Walk-In Retail Customer */}
      {isWalkIn ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-on-surface flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              Fast Walk-in Retail (No Account Required)
            </span>
            <button
              type="button"
              onClick={onOpenNewCustomerModal}
              className="text-secondary hover:underline text-[11px] font-bold flex items-center gap-0.5"
            >
              <span className="material-symbols-outlined text-[13px]">person_add</span>
              + Register
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] font-bold text-outline block mb-0.5 uppercase">Customer Name</label>
              <input
                type="text"
                value={walkInName}
                onChange={(e) => onChangeWalkInName(e.target.value)}
                placeholder="Walk-in Customer"
                className="w-full h-7 px-2 bg-surface-container-low rounded border border-surface-container-high text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-outline block mb-0.5 uppercase">Mobile (Optional)</label>
              <input
                type="text"
                value={walkInPhone}
                onChange={(e) => onChangeWalkInPhone(e.target.value)}
                placeholder="10-digit phone"
                className="w-full h-7 px-2 bg-surface-container-low rounded border border-surface-container-high text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] font-bold text-outline block mb-0.5 uppercase">Vehicle Reg #</label>
              <input
                type="text"
                value={walkInVehicleNo}
                onChange={(e) => onChangeWalkInVehicleNo(e.target.value.toUpperCase())}
                placeholder="TN-01-AB-1234"
                className="w-full h-7 px-2 bg-surface-container-low rounded border border-surface-container-high text-xs text-on-surface font-mono uppercase focus:outline-none focus:ring-1 focus:ring-secondary"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-outline block mb-0.5 uppercase">Bike Model</label>
              <input
                type="text"
                value={walkInBikeModel}
                onChange={(e) => onChangeWalkInBikeModel(e.target.value)}
                placeholder="Pulsar 150 / Splendor"
                className="w-full h-7 px-2 bg-surface-container-low rounded border border-surface-container-high text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary"
              />
            </div>
          </div>
        </div>
      ) : (
        /* Case 2: Registered Customer / Garage Account */
        <div className="space-y-2.5">
          {/* Search bar & + New Customer */}
          <div className="relative" ref={dropdownRef}>
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-2 top-1.5 text-outline text-[16px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder="Search customer by name, mobile or GSTIN..."
                  className="w-full h-7 pl-7 pr-2 bg-surface-container-low rounded border border-surface-container-high text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-secondary"
                />
              </div>

              <button
                type="button"
                onClick={onOpenNewCustomerModal}
                className="h-7 px-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded border border-surface-container-highest text-xs font-bold flex items-center gap-1 shrink-0"
                title="Create a new customer or garage account"
              >
                <span className="material-symbols-outlined text-[15px]">person_add</span>
                <span>+ New</span>
              </button>
            </div>

            {/* Matching Customer Results Dropdown */}
            {isDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-surface-container-lowest border border-surface-container-highest rounded-md shadow-xl overflow-hidden divide-y divide-surface-container-high/60 max-h-60 overflow-y-auto">
                {matchedCustomers.length === 0 ? (
                  <div className="p-3 text-center text-xs text-outline">
                    {query ? 'No customer found. Click "+ New" to add.' : 'Type name, phone or GSTIN to search.'}
                  </div>
                ) : (
                  matchedCustomers.map((cust) => (
                    <div
                      key={cust.id}
                      onClick={() => handleSelectCustomer(cust)}
                      className="p-2 hover:bg-surface-container-low cursor-pointer flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <div className="font-bold text-on-surface flex items-center gap-1.5">
                          <span>{cust.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant font-mono">
                            {cust.tier}
                          </span>
                        </div>
                        <div className="text-[11px] text-outline flex items-center gap-2 mt-0.5">
                          <span>📞 {cust.phone}</span>
                          {cust.gstin && <span>• GSTIN: <strong className="font-mono">{cust.gstin}</strong></span>}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-outline uppercase font-mono">Ledger Balance</div>
                        <div className={`font-mono font-bold text-xs ${cust.balance > 0 ? 'text-error' : 'text-on-tertiary-container'}`}>
                          ₹{cust.balance.toLocaleString('en-IN')}
                        </div>
                        <button
                          type="button"
                          className="mt-1 px-2 py-0.5 rounded bg-secondary text-on-secondary text-[10px] font-bold"
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Selected Customer Card Details */}
          {selectedCustomer ? (
            <div className="bg-surface-container-low p-2.5 rounded border border-surface-container-high space-y-2 text-xs">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-bold text-sm text-on-surface flex items-center gap-2">
                    <span>{selectedCustomer.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-on-secondary font-bold">
                      {selectedCustomer.tier}
                    </span>
                  </div>
                  <div className="text-outline text-[11px] mt-0.5">
                    📞 {selectedCustomer.phone} {selectedCustomer.gstin ? `• GSTIN: ${selectedCustomer.gstin}` : ''}
                  </div>
                  {selectedCustomer.address && (
                    <div className="text-outline/80 text-[10px] mt-0.5 line-clamp-1">
                      📍 {selectedCustomer.address}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onSelectCustomer(null)}
                  className="text-outline hover:text-error text-xs p-1"
                  title="Remove customer"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>

              {/* Outstanding Ledger Balance Banner */}
              <div className="flex items-center justify-between bg-surface-container-lowest px-2 py-1.5 rounded font-mono text-[11px]">
                <span className="text-outline">Current Outstanding:</span>
                <span className={`font-bold ${selectedCustomer.balance > 0 ? 'text-error' : 'text-on-tertiary-container'}`}>
                  ₹{selectedCustomer.balance.toLocaleString('en-IN')}
                  {selectedCustomer.creditLimit > 0 && ` (Limit: ₹${selectedCustomer.creditLimit.toLocaleString('en-IN')})`}
                </span>
              </div>

              {/* Registered Customer Vehicles */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-bold text-outline">
                    Customer Vehicle:
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddVehicleOpen(prev => !prev)}
                    className="text-secondary text-[11px] font-bold hover:underline flex items-center gap-0.5"
                  >
                    <span className="material-symbols-outlined text-[12px]">add</span>
                    + Add Vehicle
                  </button>
                </div>

                {selectedCustomer.vehicles && selectedCustomer.vehicles.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCustomer.vehicles.map((v) => {
                      const isChosen = selectedVehicle?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => onSelectVehicle(v)}
                          className={`px-2 py-1 rounded border text-left flex items-center gap-1.5 font-mono text-[11px] transition-colors ${
                            isChosen
                              ? 'border-secondary bg-secondary/10 text-secondary font-bold'
                              : 'border-surface-container-highest bg-surface-container-lowest text-on-surface hover:bg-surface-container'
                          }`}
                        >
                          <span>🏍️ {v.regNo}</span>
                          <span className="text-outline text-[10px]">({v.model})</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-[11px] text-outline italic">No vehicles registered yet.</div>
                )}

                {/* Quick Add Vehicle inline form */}
                {isAddVehicleOpen && (
                  <form onSubmit={handleCreateVehicle} className="mt-2 p-2 bg-surface-container rounded space-y-1.5">
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        placeholder="Reg # (e.g. TN-01-AB-1234)"
                        value={newRegNo}
                        onChange={(e) => setNewRegNo(e.target.value.toUpperCase())}
                        className="h-6 px-1.5 text-xs bg-surface-container-lowest rounded border border-surface-container-highest uppercase font-mono"
                        autoFocus
                      />
                      <input
                        type="text"
                        placeholder="Model (e.g. Pulsar 150)"
                        value={newModel}
                        onChange={(e) => setNewModel(e.target.value)}
                        className="h-6 px-1.5 text-xs bg-surface-container-lowest rounded border border-surface-container-highest"
                      />
                    </div>
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsAddVehicleOpen(false)}
                        className="px-2 py-0.5 rounded text-[10px] text-outline"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-2.5 py-0.5 rounded bg-secondary text-on-secondary text-[10px] font-bold"
                      >
                        Save Vehicle
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Requirement 8: SMART PRICING INTELLIGENCE PANEL */}
              {selectedCustomer.lastSaleRateMap && cart.length > 0 && (
                <div className="mt-2 pt-2 border-t border-surface-container-high/70 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-outline uppercase flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-secondary">psychology</span>
                      Smart Customer Pricing
                    </span>
                    <span className="text-[10px] text-secondary font-mono">Suggested Special Rates</span>
                  </div>

                  {cart.map((cartItem) => {
                    const customAgreedRate = selectedCustomer.lastSaleRateMap?.[cartItem.part.id];
                    if (!customAgreedRate || customAgreedRate === cartItem.rate) return null;

                    return (
                      <div
                        key={cartItem.id}
                        className="bg-surface-container-lowest p-1.5 rounded border border-secondary/30 flex items-center justify-between text-[11px]"
                      >
                        <div>
                          <div className="font-semibold text-on-surface line-clamp-1">{cartItem.part.name}</div>
                          <div className="text-[10px] text-outline">
                            Standard: <span className="font-mono line-through">₹{cartItem.part.counterPrice}</span> • Last Sale: <strong className="font-mono text-secondary">₹{customAgreedRate}</strong>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onApplyCustomerRateToCart(cartItem.part.id, customAgreedRate)}
                          className="px-2 py-1 rounded bg-secondary text-on-secondary font-bold text-[10px] hover:bg-secondary-container"
                        >
                          Apply ₹{customAgreedRate}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="p-2 text-center text-xs text-outline bg-surface-container-low rounded border border-dashed border-surface-container-high">
              Search and select an account above, or click "+ New"
            </div>
          )}
        </div>
      )}
    </div>
  );
};
