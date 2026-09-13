import React, { useState, useEffect } from 'react';
import { SparePart } from '../../types';

interface ItemAddEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (part: SparePart, saveAndNew?: boolean) => void;
  editPart?: SparePart | null;
  existingParts?: SparePart[];
}

export const ItemAddEditModal: React.FC<ItemAddEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editPart,
  existingParts = []
}) => {
  // Basic Information
  const [name, setName] = useState('');
  const [combinationName, setCombinationName] = useState('');
  const [shortName, setShortName] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [barcode, setBarcode] = useState('');

  // Classification
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [unit, setUnit] = useState('Pcs');
  const [hsn, setHsn] = useState('8714');
  const [gstRate, setGstRate] = useState<number>(18);

  // Pricing
  const [mrp, setMrp] = useState<number>(0);
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [counterPrice, setCounterPrice] = useState<number>(0); // Selling Rate
  const [previousSellingRate, setPreviousSellingRate] = useState<number | undefined>(undefined);
  const [isRateLocked, setIsRateLocked] = useState<boolean>(false);

  // Inventory
  const [maintainStock, setMaintainStock] = useState<boolean>(true);
  const [openingStock, setOpeningStock] = useState<number>(0);
  const [minimumStock, setMinimumStock] = useState<number>(5);
  const [minReorder, setMinReorder] = useState<number>(10);
  const [rackBin, setRackBin] = useState<string>('');

  // Vehicle Compatibility
  const [vehicles, setVehicles] = useState<string[]>([]);
  const [newVehicleInput, setNewVehicleInput] = useState('');

  // Custom Fields (Requirement 5)
  const [customField1, setCustomField1] = useState('');
  const [customField2, setCustomField2] = useState('');
  const [customField3, setCustomField3] = useState('');
  const [customField4, setCustomField4] = useState('');
  const [customField5, setCustomField5] = useState('');

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset or populate state when modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (editPart) {
      setName(editPart.name);
      setCombinationName(editPart.combinationName || `${editPart.name} [${editPart.brand}]`);
      setShortName(editPart.shortName || editPart.name.split(' ')[0]);
      setPartNumber(editPart.partNumber || editPart.sku.replace('SKU-', ''));
      setBarcode(editPart.barcode);
      setBrand(editPart.brand);
      setCategory(editPart.category);
      setSubcategory(editPart.subcategory || 'General Spares');
      setUnit(editPart.unit);
      setHsn(editPart.hsn);
      setGstRate(editPart.gstRate);
      setMrp(editPart.mrp);
      setPurchasePrice(editPart.purchasePrice);
      setCounterPrice(editPart.counterPrice);
      setPreviousSellingRate(editPart.previousSellingRate || editPart.counterPrice - 30);
      setIsRateLocked(Boolean(editPart.isRateLocked));
      setOpeningStock(editPart.openingStock || editPart.currentStock);
      setMinimumStock(editPart.minimumStock || 10);
      setMinReorder(editPart.minReorder);
      setRackBin(editPart.rackBin);
      setVehicles([...editPart.vehicles]);
      setCustomField1(editPart.customFields?.['Field1'] || 'OEM Standard');
      setCustomField2(editPart.customFields?.['Field2'] || 'BS-VI Ready');
      setCustomField3(editPart.customFields?.['Field3'] || '');
      setCustomField4(editPart.customFields?.['Field4'] || '');
      setCustomField5(editPart.customFields?.['Field5'] || '');
      setErrors({});
    } else {
      // New Item default
      const randomSkuNum = Math.floor(1300 + Math.random() * 8000);
      setName('');
      setCombinationName('');
      setShortName('');
      setPartNumber(String(randomSkuNum));
      setBarcode(`890${Math.floor(100000000 + Math.random() * 900000000)}`);
      setBrand('');
      setCategory('');
      setSubcategory('');
      setUnit('Pcs');
      setHsn('8714');
      setGstRate(18);
      setMrp(0);
      setPurchasePrice(0);
      setCounterPrice(0);
      setPreviousSellingRate(undefined);
      setIsRateLocked(false);
      setMaintainStock(true);
      setOpeningStock(0);
      setMinimumStock(5);
      setMinReorder(10);
      setRackBin('');
      setVehicles([]);
      setCustomField1('');
      setCustomField2('');
      setCustomField3('');
      setCustomField4('');
      setCustomField5('');
      setErrors({});
    }
  }, [isOpen, editPart]);

  if (!isOpen) return null;

  const handleAddVehicle = () => {
    if (newVehicleInput.trim() && !vehicles.includes(newVehicleInput.trim())) {
      setVehicles([...vehicles, newVehicleInput.trim()]);
      setNewVehicleInput('');
    }
  };

  const handleRemoveVehicle = (v: string) => {
    setVehicles(vehicles.filter(item => item !== v));
  };

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};

    if (!name.trim()) errs.name = 'Item Name is mandatory.';
    if (!partNumber.trim()) errs.partNumber = 'Part Number is mandatory.';
    if (!barcode.trim()) errs.barcode = 'Barcode is mandatory.';
    if (!hsn.trim()) errs.hsn = 'HSN Code is mandatory.';
    else if (!/^\d{4,8}$/.test(hsn.trim())) errs.hsn = 'HSN must be 4 to 8 numeric digits.';

    if (mrp <= 0) errs.mrp = 'MRP must be greater than 0.';
    if (purchasePrice < 0) errs.purchasePrice = 'Purchase rate cannot be negative.';
    if (counterPrice <= 0) errs.counterPrice = 'Selling rate must be greater than 0.';
    if (counterPrice > mrp) errs.counterPrice = 'Selling rate cannot exceed MRP.';

    // Check duplicate part number if new
    if (!editPart) {
      const isDup = existingParts.some(
        p => (p.partNumber === partNumber || p.sku === `SKU-${partNumber}`)
      );
      if (isDup) errs.partNumber = `Part Number "${partNumber}" already exists in Item Master.`;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveInternal = (saveAndNew: boolean = false) => {
    if (!validateForm()) return;

    const skuVal = `SKU-${partNumber}`;
    const newOrUpdatedPart: SparePart = {
      id: editPart ? editPart.id : `part-${Date.now()}`,
      sku: skuVal,
      partNumber,
      barcode,
      name,
      combinationName: combinationName || `${name} [${brand}]`,
      shortName: shortName || name.split(' ')[0],
      brand,
      category,
      subcategory,
      oemCode: editPart ? editPart.oemCode : `OEM-${partNumber}`,
      vehicles,
      hsn,
      rackBin,
      mrp,
      purchasePrice,
      wholesalePrice: Math.round(counterPrice * 0.92),
      counterPrice,
      previousSellingRate: editPart ? editPart.counterPrice : previousSellingRate,
      isRateLocked,
      currentStock: maintainStock ? (editPart ? editPart.currentStock : openingStock) : 9999,
      openingStock,
      minimumStock,
      minReorder,
      unit,
      gstRate,
      status: openingStock === 0 ? 'Out of Stock' : openingStock <= minReorder ? 'Low Stock' : 'Normal',
      isActive: true,
      physicalQty: openingStock,
      avgLandedCost: purchasePrice,
      thirtyDayVelocity: editPart ? editPart.thirtyDayVelocity : 18,
      customFields: {
        Field1: customField1,
        Field2: customField2,
        Field3: customField3,
        Field4: customField4,
        Field5: customField5
      },
      lastModified: {
        by: 'Admin (Ramesh)',
        at: new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      stockMovements: editPart
        ? editPart.stockMovements
        : [
            {
              date: 'Today',
              ref: 'Opening Balance',
              type: 'Adjustment',
              qty: openingStock,
              balance: openingStock,
              userOrParty: 'Initial Setup'
            }
          ],
      compatMatrix: editPart
        ? editPart.compatMatrix
        : vehicles.map(v => ({ model: v, specs: 'Universal OEM Fitment', fitType: '100% Direct Fit' }))
    };

    onSave(newOrUpdatedPart, saveAndNew);

    if (saveAndNew) {
      const nextNum = Math.floor(1300 + Math.random() * 8000);
      setName('');
      setCombinationName('');
      setShortName('');
      setPartNumber(String(nextNum));
      setBarcode(`890${Math.floor(100000000 + Math.random() * 900000000)}`);
      setErrors({});
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 bg-black/50 backdrop-blur-[1px] animate-in fade-in duration-150">
      <div className="w-full max-w-4xl bg-surface-container-lowest rounded shadow-2xl border border-surface-container-high flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-surface-container-low border-b border-surface-container-high flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline-md text-lg font-bold text-on-surface">
                {editPart ? `Edit Item: ${editPart.name}` : 'Add New Spare Part Item'}
              </h2>
              <span className="px-2 py-0.5 rounded bg-secondary/15 text-secondary text-[10px] font-bold uppercase font-mono">
                {editPart ? `SKU-${partNumber}` : 'Master Record'}
              </span>
            </div>
            <p className="text-xs text-outline mt-0.5">
              Enter catalog specs, tax details, inventory parameters, and vehicle fitment matrix.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-container text-outline hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Audit Indicator (Requirement 6) */}
        {editPart && (
          <div className="bg-secondary/10 border-b border-secondary/20 px-4 py-2 flex flex-wrap items-center justify-between text-xs text-secondary">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">history_edu</span>
              <span>
                Last modified by <strong>{editPart.lastModified?.by || 'Admin'}</strong> — {editPart.lastModified?.at || '11/09/2026 4:32 PM'}
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span>Prev Rate: <strong>₹{previousSellingRate || 690}</strong></span>
              <span>→</span>
              <span>New Rate: <strong className="text-on-surface">₹{counterPrice}</strong></span>
            </div>
          </div>
        )}

        {/* Form Body - Grouped Sections */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* GROUP 1: BASIC INFORMATION */}
          <div className="border border-surface-container-high rounded p-4 bg-surface-container-lowest space-y-3">
            <div className="flex items-center justify-between border-b border-surface-container pb-2">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-on-surface">
                <span className="w-5 h-5 rounded-full bg-secondary/20 text-secondary flex items-center justify-center text-[10px]">1</span>
                <span>Basic Information</span>
              </div>
              <span className="text-[10px] text-outline">* Required for billing</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="md:col-span-2">
                <label className="block text-outline font-semibold mb-1">
                  Item Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. TVS Genuine Clutch Plate Set (5 Plates)"
                  className="w-full py-1.5 px-2.5 rounded bg-surface-container border border-surface-container-highest text-on-surface focus:outline-none focus:border-secondary font-medium"
                />
                {errors.name && <span className="text-[10px] text-error mt-0.5 block">{errors.name}</span>}
              </div>

              <div>
                <label className="block text-outline font-semibold mb-1">
                  Part Number / SKU <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={partNumber}
                  onChange={e => setPartNumber(e.target.value)}
                  placeholder="e.g. 1302"
                  className="w-full py-1.5 px-2.5 rounded bg-surface-container border border-surface-container-highest text-on-surface font-mono font-bold focus:outline-none focus:border-secondary"
                />
                {errors.partNumber && <span className="text-[10px] text-error mt-0.5 block">{errors.partNumber}</span>}
              </div>

              <div>
                <label className="block text-outline font-semibold mb-1">Combination Name</label>
                <input
                  type="text"
                  value={combinationName}
                  onChange={e => setCombinationName(e.target.value)}
                  placeholder="e.g. Clutch Plate [TVS Genuine]"
                  className="w-full py-1.5 px-2.5 rounded bg-surface-container border border-surface-container-highest text-on-surface focus:outline-none focus:border-secondary"
                />
              </div>

              <div>
                <label className="block text-outline font-semibold mb-1">Short Name</label>
                <input
                  type="text"
                  value={shortName}
                  onChange={e => setShortName(e.target.value)}
                  placeholder="e.g. ClutchPlate"
                  className="w-full py-1.5 px-2.5 rounded bg-surface-container border border-surface-container-highest text-on-surface focus:outline-none focus:border-secondary font-mono"
                />
              </div>

              <div>
                <label className="block text-outline font-semibold mb-1">
                  Barcode (EAN-13 / Code 128) <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={barcode}
                    onChange={e => setBarcode(e.target.value)}
                    placeholder="e.g. 890123891001"
                    className="w-full py-1.5 px-2.5 pr-8 rounded bg-surface-container border border-surface-container-highest text-on-surface font-mono focus:outline-none focus:border-secondary"
                  />
                  <button
                    type="button"
                    onClick={() => setBarcode(`890${Math.floor(100000000 + Math.random() * 900000000)}`)}
                    title="Generate New EAN-13 Barcode"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[16px]">sync</span>
                  </button>
                </div>
                {errors.barcode && <span className="text-[10px] text-error mt-0.5 block">{errors.barcode}</span>}
              </div>
            </div>
          </div>

          {/* GROUP 2: CLASSIFICATION */}
          <div className="border border-surface-container-high rounded p-4 bg-surface-container-lowest space-y-3">
            <div className="flex items-center justify-between border-b border-surface-container pb-2">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-on-surface">
                <span className="w-5 h-5 rounded-full bg-secondary/20 text-secondary flex items-center justify-center text-[10px]">2</span>
                <span>Classification &amp; Tax Structure</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-outline font-semibold mb-1">Brand</label>
                <select
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  className="w-full py-1.5 px-2.5 rounded bg-surface-container border border-surface-container-highest text-on-surface focus:outline-none focus:border-secondary"
                >
                  <option value="TVS Genuine">TVS Genuine</option>
                  <option value="Bajaj Genuine">Bajaj Genuine</option>
                  <option value="Hero Genuine">Hero Genuine</option>
                  <option value="Motul">Motul</option>
                  <option value="Endurance OEM">Endurance OEM</option>
                  <option value="Gabriel">Gabriel</option>
                  <option value="Rolon">Rolon</option>
                  <option value="Bosch">Bosch</option>
                  <option value="NGK">NGK</option>
                  <option value="Minda">Minda</option>
                  <option value="Royal Enfield Genuine">Royal Enfield Genuine</option>
                </select>
              </div>

              <div>
                <label className="block text-outline font-semibold mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full py-1.5 px-2.5 rounded bg-surface-container border border-surface-container-highest text-on-surface focus:outline-none focus:border-secondary"
                >
                  <option value="Clutch & Transmission">Clutch &amp; Transmission</option>
                  <option value="Engine & Cylinder">Engine &amp; Cylinder</option>
                  <option value="Electrical & Spark">Electrical &amp; Spark</option>
                  <option value="Brakes & Hydraulics">Brakes &amp; Hydraulics</option>
                  <option value="Lubricants & Fluids">Lubricants &amp; Fluids</option>
                  <option value="Suspension & Steering">Suspension &amp; Steering</option>
                  <option value="Filters & Intake">Filters &amp; Intake</option>
                  <option value="Body & Frame">Body &amp; Frame</option>
                </select>
              </div>

              <div>
                <label className="block text-outline font-semibold mb-1">Subcategory</label>
                <input
                  type="text"
                  value={subcategory}
                  onChange={e => setSubcategory(e.target.value)}
                  placeholder="e.g. Friction Plates"
                  className="w-full py-1.5 px-2.5 rounded bg-surface-container border border-surface-container-highest text-on-surface focus:outline-none focus:border-secondary"
                />
              </div>

              <div>
                <label className="block text-outline font-semibold mb-1">Unit of Measure</label>
                <select
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  className="w-full py-1.5 px-2.5 rounded bg-surface-container border border-surface-container-highest text-on-surface font-mono focus:outline-none focus:border-secondary"
                >
                  <option value="Pcs">Pcs (Pieces)</option>
                  <option value="Set">Set</option>
                  <option value="Can">Can (1L / 500ml)</option>
                  <option value="Bottle">Bottle</option>
                  <option value="Pair">Pair</option>
                  <option value="Kit">Kit (Assembly)</option>
                  <option value="Box">Box</option>
                </select>
              </div>

              <div>
                <label className="block text-outline font-semibold mb-1">
                  HSN Code <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={hsn}
                  onChange={e => setHsn(e.target.value)}
                  placeholder="e.g. 8714"
                  className="w-full py-1.5 px-2.5 rounded bg-surface-container border border-surface-container-highest text-on-surface font-mono font-bold focus:outline-none focus:border-secondary"
                />
                {errors.hsn && <span className="text-[10px] text-error mt-0.5 block">{errors.hsn}</span>}
              </div>

              <div>
                <label className="block text-outline font-semibold mb-1">GST Rate</label>
                <select
                  value={gstRate}
                  onChange={e => setGstRate(Number(e.target.value))}
                  className="w-full py-1.5 px-2.5 rounded bg-surface-container border border-surface-container-highest text-on-surface font-mono font-bold focus:outline-none focus:border-secondary"
                >
                  <option value={18}>18% (Standard Auto Spares)</option>
                  <option value={28}>28% (Luxury / Specific Parts)</option>
                  <option value={12}>12% (Agricultural / Certain Fasteners)</option>
                  <option value={5}>5% (Basic Essentials)</option>
                  <option value={0}>0% (Exempted)</option>
                </select>
              </div>
            </div>
          </div>

          {/* GROUP 3: PRICING */}
          <div className="border border-surface-container-high rounded p-4 bg-surface-container-lowest space-y-3">
            <div className="flex items-center justify-between border-b border-surface-container pb-2">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-on-surface">
                <span className="w-5 h-5 rounded-full bg-secondary/20 text-secondary flex items-center justify-center text-[10px]">3</span>
                <span>Pricing &amp; Margins</span>
              </div>

              {/* Rate locked toggle for permission handling (Requirement 6) */}
              <label className="flex items-center gap-1.5 cursor-pointer text-xs select-none">
                <input
                  type="checkbox"
                  checked={isRateLocked}
                  onChange={e => setIsRateLocked(e.target.checked)}
                  className="rounded text-secondary focus:ring-0"
                />
                <span className={isRateLocked ? 'text-amber-700 font-bold flex items-center gap-1' : 'text-outline flex items-center gap-1'}>
                  <span className="material-symbols-outlined text-[14px]">lock</span>
                  <span>{isRateLocked ? 'Rate Locked (Manager Only)' : 'Lock Rate for Cashiers'}</span>
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-outline font-semibold mb-1">
                  MRP (₹) <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  value={mrp}
                  onChange={e => setMrp(Number(e.target.value))}
                  className="w-full py-1.5 px-2.5 rounded bg-surface-container border border-surface-container-highest text-on-surface font-mono font-bold text-sm focus:outline-none focus:border-secondary"
                />
                {errors.mrp && <span className="text-[10px] text-error mt-0.5 block">{errors.mrp}</span>}
              </div>

              <div>
                <label className="block text-outline font-semibold mb-1">
                  Purchase Rate (₹) <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  value={purchasePrice}
                  onChange={e => setPurchasePrice(Number(e.target.value))}
                  className="w-full py-1.5 px-2.5 rounded bg-surface-container border border-surface-container-highest text-on-surface font-mono font-bold text-sm focus:outline-none focus:border-secondary"
                />
                {errors.purchasePrice && <span className="text-[10px] text-error mt-0.5 block">{errors.purchasePrice}</span>}
              </div>

              <div>
                <label className="block text-outline font-semibold mb-1">
                  Selling Rate / POS (₹) <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={counterPrice}
                    onChange={e => setCounterPrice(Number(e.target.value))}
                    disabled={isRateLocked}
                    className={`w-full py-1.5 px-2.5 rounded border text-on-surface font-mono font-bold text-sm focus:outline-none ${
                      isRateLocked
                        ? 'bg-surface-container-high border-amber-300 text-outline cursor-not-allowed'
                        : 'bg-surface-container border-secondary text-secondary focus:border-secondary'
                    }`}
                  />
                  {isRateLocked && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-amber-700 text-[10px] font-bold uppercase">
                      Rate Locked
                    </span>
                  )}
                </div>
                {errors.counterPrice && <span className="text-[10px] text-error mt-0.5 block">{errors.counterPrice}</span>}
              </div>
            </div>

            <div className="p-2.5 rounded bg-surface-container-low text-[11px] text-outline flex items-center justify-between font-mono">
              <span>Estimated Gross Margin: <strong className="text-on-surface">₹{(counterPrice - purchasePrice).toFixed(2)}</strong> ({(((counterPrice - purchasePrice) / counterPrice) * 100).toFixed(1)}%)</span>
              <span>Wholesale Rate: <strong className="text-on-surface">₹{Math.round(counterPrice * 0.92)}</strong></span>
            </div>
          </div>

          {/* GROUP 4: INVENTORY */}
          <div className="border border-surface-container-high rounded p-4 bg-surface-container-lowest space-y-3">
            <div className="flex items-center justify-between border-b border-surface-container pb-2">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-on-surface">
                <span className="w-5 h-5 rounded-full bg-secondary/20 text-secondary flex items-center justify-center text-[10px]">4</span>
                <span>Inventory &amp; Stock Tracking</span>
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={maintainStock}
                  onChange={e => setMaintainStock(e.target.checked)}
                  className="rounded text-secondary focus:ring-0"
                />
                <span className="font-semibold text-on-surface">Maintain Stock Balance</span>
              </label>
            </div>

            {maintainStock ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-outline font-semibold mb-1">Opening Stock</label>
                  <input
                    type="number"
                    value={openingStock}
                    onChange={e => setOpeningStock(Number(e.target.value))}
                    className="w-full py-1.5 px-2.5 rounded bg-surface-container border border-surface-container-highest text-on-surface font-mono font-bold focus:outline-none focus:border-secondary"
                  />
                </div>

                <div>
                  <label className="block text-outline font-semibold mb-1">Minimum Stock</label>
                  <input
                    type="number"
                    value={minimumStock}
                    onChange={e => setMinimumStock(Number(e.target.value))}
                    className="w-full py-1.5 px-2.5 rounded bg-surface-container border border-surface-container-highest text-on-surface font-mono font-bold focus:outline-none focus:border-secondary"
                  />
                </div>

                <div>
                  <label className="block text-outline font-semibold mb-1">Reorder Level</label>
                  <input
                    type="number"
                    value={minReorder}
                    onChange={e => setMinReorder(Number(e.target.value))}
                    className="w-full py-1.5 px-2.5 rounded bg-surface-container border border-surface-container-highest text-amber-700 font-mono font-bold focus:outline-none focus:border-secondary"
                  />
                </div>

                <div>
                  <label className="block text-outline font-semibold mb-1">Rack / Bin Location</label>
                  <input
                    type="text"
                    value={rackBin}
                    onChange={e => setRackBin(e.target.value)}
                    placeholder="e.g. B-04-T2"
                    className="w-full py-1.5 px-2.5 rounded bg-surface-container border border-surface-container-highest text-on-surface font-mono font-bold focus:outline-none focus:border-secondary"
                  />
                </div>
              </div>
            ) : (
              <div className="p-3 bg-surface-container rounded text-xs text-outline text-center">
                Stock balance tracking disabled. Item will always show as in-stock for services, labor or direct drop-ship.
              </div>
            )}
          </div>

          {/* GROUP 5: VEHICLE COMPATIBILITY */}
          <div className="border border-surface-container-high rounded p-4 bg-surface-container-lowest space-y-3">
            <div className="flex items-center justify-between border-b border-surface-container pb-2">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-on-surface">
                <span className="w-5 h-5 rounded-full bg-secondary/20 text-secondary flex items-center justify-center text-[10px]">5</span>
                <span>Vehicle Compatibility Matrix</span>
              </div>
              <span className="text-[11px] text-outline">{vehicles.length} Models Linked</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {vehicles.map((v, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded bg-secondary-container/40 border border-secondary/30 text-secondary font-semibold text-xs flex items-center gap-1.5"
                >
                  <span>{v}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveVehicle(v)}
                    className="hover:text-error text-outline"
                    title={`Remove ${v}`}
                  >
                    ×
                  </button>
                </span>
              ))}

              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={newVehicleInput}
                  onChange={e => setNewVehicleInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddVehicle();
                    }
                  }}
                  placeholder="+ Add Vehicle (e.g. Splendor Plus)"
                  className="py-1 px-2 rounded bg-surface-container border border-surface-container-highest text-on-surface text-xs focus:outline-none focus:border-secondary w-52"
                />
                <button
                  type="button"
                  onClick={handleAddVehicle}
                  className="px-2.5 py-1 bg-surface-container hover:bg-surface-container-highest rounded text-xs font-bold text-on-surface"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1 text-[11px] text-outline">
              <span>Quick add popular:</span>
              {['Bajaj Pulsar 150', 'TVS Apache RTR 160 4V', 'Hero Splendor Plus', 'Honda Activa 6G', 'Royal Enfield Classic 350', 'KTM Duke 200'].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    if (!vehicles.includes(p)) setVehicles([...vehicles, p]);
                  }}
                  className="px-1.5 py-0.5 rounded bg-surface-container hover:bg-surface-container-highest text-on-surface"
                >
                  + {p}
                </button>
              ))}
            </div>
          </div>

          {/* GROUP 6: CUSTOM FIELDS (Requirement 5) */}
          <div className="border border-surface-container-high rounded p-4 bg-surface-container-lowest space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-on-surface border-b border-surface-container pb-2">
              <span className="w-5 h-5 rounded-full bg-secondary/20 text-secondary flex items-center justify-center text-[10px]">6</span>
              <span>Custom Enterprise Fields</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-xs">
              <div>
                <label className="block text-outline font-semibold mb-1">Custom Field 1</label>
                <input
                  type="text"
                  value={customField1}
                  onChange={e => setCustomField1(e.target.value)}
                  placeholder="e.g. OEM Standard"
                  className="w-full py-1.5 px-2 rounded bg-surface-container border border-surface-container-highest text-on-surface"
                />
              </div>
              <div>
                <label className="block text-outline font-semibold mb-1">Custom Field 2</label>
                <input
                  type="text"
                  value={customField2}
                  onChange={e => setCustomField2(e.target.value)}
                  placeholder="e.g. BS-VI Ready"
                  className="w-full py-1.5 px-2 rounded bg-surface-container border border-surface-container-highest text-on-surface"
                />
              </div>
              <div>
                <label className="block text-outline font-semibold mb-1">Custom Field 3</label>
                <input
                  type="text"
                  value={customField3}
                  onChange={e => setCustomField3(e.target.value)}
                  placeholder="Field 3 value"
                  className="w-full py-1.5 px-2 rounded bg-surface-container border border-surface-container-highest text-on-surface"
                />
              </div>
              <div>
                <label className="block text-outline font-semibold mb-1">Custom Field 4</label>
                <input
                  type="text"
                  value={customField4}
                  onChange={e => setCustomField4(e.target.value)}
                  placeholder="Field 4 value"
                  className="w-full py-1.5 px-2 rounded bg-surface-container border border-surface-container-highest text-on-surface"
                />
              </div>
              <div>
                <label className="block text-outline font-semibold mb-1">Custom Field 5</label>
                <input
                  type="text"
                  value={customField5}
                  onChange={e => setCustomField5(e.target.value)}
                  placeholder="Field 5 value"
                  className="w-full py-1.5 px-2 rounded bg-surface-container border border-surface-container-highest text-on-surface"
                />
              </div>
            </div>
          </div>

          {/* GROUP 7: IMAGE */}
          <div className="border border-surface-container-high rounded p-4 bg-surface-container-lowest space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-on-surface border-b border-surface-container pb-2">
              <span className="w-5 h-5 rounded-full bg-secondary/20 text-secondary flex items-center justify-center text-[10px]">7</span>
              <span>Product Image</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded bg-surface-container border border-surface-container-high flex flex-col items-center justify-center text-outline">
                <span className="material-symbols-outlined text-[24px]">image</span>
              </div>
              <div className="text-xs text-outline space-y-1">
                <button
                  type="button"
                  onClick={() => alert('Select product image from local disk or capture via scanner.')}
                  className="px-3 py-1 bg-surface-container hover:bg-surface-container-highest rounded text-on-surface font-semibold flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">upload_file</span>
                  <span>Upload Product Photo</span>
                </button>
                <p className="text-[11px]">Supports PNG, JPG, WEBP up to 5MB. Rendered in Item Details Drawer and POS Finder.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Buttons */}
        <div className="p-4 bg-surface-container-low border-t border-surface-container-high flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 hover:bg-surface-container text-on-surface rounded text-xs font-semibold"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            {!editPart && (
              <button
                type="button"
                onClick={() => handleSaveInternal(true)}
                className="px-4 py-2 bg-surface-container hover:bg-surface-container-highest text-on-surface rounded text-xs font-semibold transition-colors border border-surface-container-highest"
              >
                Save &amp; New
              </button>
            )}

            <button
              type="button"
              onClick={() => handleSaveInternal(false)}
              className="px-5 py-2 bg-secondary hover:bg-secondary/90 text-on-secondary rounded text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              <span>{editPart ? 'Save Changes' : 'Save Item'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
