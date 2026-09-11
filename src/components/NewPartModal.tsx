import React, { useState } from 'react';
import { SparePart } from '../types';

interface NewPartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePart: (part: SparePart) => void;
}

export const NewPartModal: React.FC<NewPartModalProps> = ({
  isOpen,
  onClose,
  onSavePart
}) => {
  if (!isOpen) return null;

  const [sku, setSku] = useState(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('Bajaj');
  const [oemCode, setOemCode] = useState('');
  const [category, setCategory] = useState('Clutch & Transmission');
  const [hsn, setHsn] = useState('87141090');
  const [rackBin, setRackBin] = useState('B-01-A1');
  const [purchasePrice, setPurchasePrice] = useState(450);
  const [wholesalePrice, setWholesalePrice] = useState(550);
  const [mrp, setMrp] = useState(690);
  const [counterPrice, setCounterPrice] = useState(650);
  const [currentStock, setCurrentStock] = useState(15);
  const [minReorder, setMinReorder] = useState(5);
  const [gstRate, setGstRate] = useState(18);
  const [vehicles, setVehicles] = useState('Pulsar 150, Apache RTR');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a part name');
      return;
    }

    const newPart: SparePart = {
      id: `part-${Date.now()}`,
      sku,
      barcode: `8901${Math.floor(10000000 + Math.random() * 90000000)}`,
      name,
      brand,
      oemCode: oemCode || `OEM-${Math.floor(1000 + Math.random() * 9000)}`,
      category,
      hsn,
      rackBin,
      purchasePrice: Number(purchasePrice),
      wholesalePrice: Number(wholesalePrice),
      mrp: Number(mrp),
      counterPrice: Number(counterPrice),
      currentStock: Number(currentStock),
      unit: 'Pcs',
      minReorder: Number(minReorder),
      gstRate: Number(gstRate),
      status: Number(currentStock) === 0 ? 'Out of Stock' : Number(currentStock) < Number(minReorder) ? 'Low Stock' : 'Normal',
      vehicles: vehicles.split(',').map(v => v.trim()).filter(Boolean),
      physicalQty: Number(currentStock),
      avgLandedCost: Number(purchasePrice) * 1.05,
      thirtyDayVelocity: 8,
      stockMovements: [
        {
          date: new Date().toLocaleDateString('en-GB'),
          ref: 'INITIAL-STOCK',
          type: 'Purchase',
          qty: Number(currentStock),
          balance: Number(currentStock),
          userOrParty: 'Initial Opening Balance'
        }
      ],
      compatMatrix: [
        {
          model: vehicles.split(',')[0] || 'Universal',
          specs: 'Direct Replacement',
          fitType: '100% Direct Fit'
        }
      ]
    };

    onSavePart(newPart);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest w-full max-w-2xl rounded-lg shadow-2xl border border-surface-container-highest overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-3 bg-surface-container flex items-center justify-between border-b border-surface-container-high">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">add_box</span>
            <span className="font-headline-md text-sm text-on-surface font-bold">
              Add New Spare SKU to Catalog
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-surface-container-high text-outline hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-outline uppercase block mb-1">SKU Code</label>
              <input
                type="text"
                value={sku}
                onChange={e => setSku(e.target.value)}
                className="w-full h-8 px-2 bg-surface-container-low rounded border border-surface-container-highest font-mono font-bold text-secondary"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="font-bold text-outline uppercase block mb-1">Part Name &amp; Description</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. TVS Apache 160 Rear Brake Disc Plate"
                className="w-full h-8 px-2 bg-surface-container-low rounded border border-surface-container-highest text-on-surface"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-outline uppercase block mb-1">Brand / Mfr</label>
              <select
                value={brand}
                onChange={e => setBrand(e.target.value)}
                className="w-full h-8 px-2 bg-surface-container-low rounded border border-surface-container-highest"
              >
                <option>Bajaj</option>
                <option>TVS</option>
                <option>Hero</option>
                <option>Honda</option>
                <option>Yamaha</option>
                <option>Rolon</option>
                <option>Endurance</option>
                <option>Motul</option>
                <option>Castrol</option>
                <option>Bosch</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-outline uppercase block mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full h-8 px-2 bg-surface-container-low rounded border border-surface-container-highest"
              >
                <option>Clutch &amp; Transmission</option>
                <option>Braking System &amp; Pads</option>
                <option>Drive Chains &amp; Sprockets</option>
                <option>Lubricants &amp; Fork Oils</option>
                <option>Cables &amp; Control Levers</option>
                <option>Electrical, Battery &amp; Plugs</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-outline uppercase block mb-1">OEM Part Code</label>
              <input
                type="text"
                value={oemCode}
                onChange={e => setOemCode(e.target.value)}
                placeholder="e.g. BJ-3312"
                className="w-full h-8 px-2 bg-surface-container-low rounded border border-surface-container-highest uppercase font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-outline uppercase block mb-1">HSN Code</label>
              <input
                type="text"
                value={hsn}
                onChange={e => setHsn(e.target.value)}
                className="w-full h-8 px-2 bg-surface-container-low rounded border border-surface-container-highest font-mono"
              />
            </div>
            <div>
              <label className="font-bold text-outline uppercase block mb-1">Rack / Bin Location</label>
              <input
                type="text"
                value={rackBin}
                onChange={e => setRackBin(e.target.value)}
                placeholder="e.g. B-04-T2"
                className="w-full h-8 px-2 bg-surface-container-low rounded border border-surface-container-highest font-mono font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-outline uppercase block mb-1">GST Rate (%)</label>
              <select
                value={gstRate}
                onChange={e => setGstRate(Number(e.target.value))}
                className="w-full h-8 px-2 bg-surface-container-low rounded border border-surface-container-highest font-mono"
              >
                <option value={18}>18% GST (Standard)</option>
                <option value={28}>28% GST (Assemblies)</option>
                <option value={12}>12% GST (Tubes)</option>
              </select>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="p-3 bg-surface-container-low rounded space-y-2">
            <span className="font-label-caps text-label-caps text-outline uppercase tracking-wider block">
              Pricing &amp; Margins (₹)
            </span>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="font-bold text-outline uppercase block mb-0.5">Purchase</label>
                <input
                  type="number"
                  value={purchasePrice}
                  onChange={e => setPurchasePrice(Number(e.target.value))}
                  className="w-full h-8 px-2 bg-surface-container-lowest rounded border border-surface-container-highest font-mono text-right font-semibold"
                />
              </div>
              <div>
                <label className="font-bold text-outline uppercase block mb-0.5">Wholesale</label>
                <input
                  type="number"
                  value={wholesalePrice}
                  onChange={e => setWholesalePrice(Number(e.target.value))}
                  className="w-full h-8 px-2 bg-surface-container-lowest rounded border border-surface-container-highest font-mono text-right font-semibold"
                />
              </div>
              <div>
                <label className="font-bold text-outline uppercase block mb-0.5">MRP</label>
                <input
                  type="number"
                  value={mrp}
                  onChange={e => setMrp(Number(e.target.value))}
                  className="w-full h-8 px-2 bg-surface-container-lowest rounded border border-surface-container-highest font-mono text-right font-semibold"
                />
              </div>
              <div>
                <label className="font-bold text-secondary uppercase block mb-0.5">Counter Price</label>
                <input
                  type="number"
                  value={counterPrice}
                  onChange={e => setCounterPrice(Number(e.target.value))}
                  className="w-full h-8 px-2 bg-surface-container-lowest rounded border border-secondary font-mono text-right font-bold text-secondary"
                />
              </div>
            </div>
          </div>

          {/* Stock & Reorder */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-outline uppercase block mb-1">Opening Stock Qty</label>
              <input
                type="number"
                value={currentStock}
                onChange={e => setCurrentStock(Number(e.target.value))}
                className="w-full h-8 px-2 bg-surface-container-low rounded border border-surface-container-highest font-mono font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-outline uppercase block mb-1">Min Reorder Level</label>
              <input
                type="number"
                value={minReorder}
                onChange={e => setMinReorder(Number(e.target.value))}
                className="w-full h-8 px-2 bg-surface-container-low rounded border border-surface-container-highest font-mono font-bold text-error"
              />
            </div>
            <div>
              <label className="font-bold text-outline uppercase block mb-1">Compatible Vehicles</label>
              <input
                type="text"
                value={vehicles}
                onChange={e => setVehicles(e.target.value)}
                placeholder="Comma separated models"
                className="w-full h-8 px-2 bg-surface-container-low rounded border border-surface-container-highest"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-surface-container-high">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-surface-container-low hover:bg-surface-container text-on-surface rounded font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-secondary hover:bg-secondary-container text-on-secondary rounded font-semibold transition-colors shadow-xs"
            >
              Save Part to Master
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
