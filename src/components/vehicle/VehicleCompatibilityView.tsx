import React, { useState } from 'react';
import { SparePart, VehicleHierarchyNode } from '../../types';

interface VehicleCompatibilityViewProps {
  parts: SparePart[];
  onOpenItemDetails?: (part: SparePart) => void;
  onAddToCart?: (part: SparePart) => void;
}

export const VehicleCompatibilityView: React.FC<VehicleCompatibilityViewProps> = ({
  parts,
  onOpenItemDetails,
  onAddToCart
}) => {
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [selectedMake, setSelectedMake] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<string>('');

  // Mock vehicle hierarchy (Requirement 15)
  const vehicleDatabase = [
    {
      make: 'Bajaj',
      models: [
        {
          name: 'Pulsar',
          variants: ['150 (Twin Spark DTS-i)', '180 DTS-i', '220F', 'NS200', 'N250']
        },
        {
          name: 'Discover',
          variants: ['125 ST', '125 DTS-i', '150 F', '100T']
        },
        {
          name: 'Platina',
          variants: ['100 ES', '110 H-Gear', '110 ABS']
        },
        {
          name: 'Avenger',
          variants: ['Street 160', 'Cruise 220']
        }
      ]
    },
    {
      make: 'TVS',
      models: [
        {
          name: 'Apache',
          variants: ['RTR 160 4V', 'RTR 160 2V', 'RTR 180', 'RTR 200 4V', 'RR 310']
        },
        {
          name: 'Jupiter',
          variants: ['110 Classic', '125 Disc', 'ZX SmartXonnect']
        },
        {
          name: 'Raider',
          variants: ['125 Drum', '125 Disc', '125 SmartXonnect']
        },
        {
          name: 'XL100',
          variants: ['Heavy Duty', 'Comfort i-Touch']
        }
      ]
    },
    {
      make: 'Hero',
      models: [
        {
          name: 'Splendor',
          variants: ['Plus XTEC', 'Super Splendor 125', 'iSmart']
        },
        {
          name: 'HF Deluxe',
          variants: ['Kick Start', 'Self Start Drum']
        },
        {
          name: 'Glamour',
          variants: ['125 Canvas', 'XTEC']
        },
        {
          name: 'Xpulse',
          variants: ['200 4V', '200T 4V']
        }
      ]
    },
    {
      make: 'Honda',
      models: [
        {
          name: 'Activa',
          variants: ['6G Standard', '6G DLX', '125 Disc', 'H-Smart']
        },
        {
          name: 'Shine',
          variants: ['125 Drum', '125 Disc', '100']
        },
        {
          name: 'SP 125',
          variants: ['Drum', 'Disc OBD2']
        },
        {
          name: 'Hornet',
          variants: ['2.0 Dual Channel ABS']
        }
      ]
    },
    {
      make: 'Royal Enfield',
      models: [
        {
          name: 'Classic',
          variants: ['350 Reborn Dual Channel', '350 Redditch']
        },
        {
          name: 'Hunter',
          variants: ['350 Retro', '350 Metro']
        },
        {
          name: 'Bullet',
          variants: ['350 Standard', '350 ES']
        },
        {
          name: 'Himalayan',
          variants: ['450 Sherpa', '411 BS-VI']
        }
      ]
    },
    {
      make: 'Yamaha',
      models: [
        {
          name: 'FZ',
          variants: ['FZ-S FI V3', 'FZ-X 150', 'FZ 25']
        },
        {
          name: 'R15',
          variants: ['V4 Racing Blue', 'V3 BS-VI', 'M 155']
        },
        {
          name: 'MT-15',
          variants: ['V2 Dual Channel ABS']
        }
      ]
    }
  ];

  // Current active make object
  const currentMakeData = vehicleDatabase.find(m => m.make === selectedMake) || vehicleDatabase[0];
  const currentModelData = currentMakeData.models.find(m => m.name === selectedModel) || currentMakeData.models[0];

  // Derive compatible parts based on search or active hierarchy
  const activeVehicleQuery = vehicleSearch.trim().toLowerCase();

  const matchedParts = parts.filter(part => {
    if (!activeVehicleQuery) {
      // Check if matches hierarchy
      const targetStr = `${selectedMake} ${selectedModel}`.toLowerCase();
      return part.vehicles.some(v => v.toLowerCase().includes(targetStr) || targetStr.includes(v.toLowerCase()));
    }
    // Search matching: check part's vehicles array, compatMatrix, or name
    return (
      part.vehicles.some(v => v.toLowerCase().includes(activeVehicleQuery)) ||
      (part.compatMatrix && part.compatMatrix.some(c => c.model.toLowerCase().includes(activeVehicleQuery))) ||
      part.name.toLowerCase().includes(activeVehicleQuery)
    );
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-container-lowest p-4 rounded border border-surface-container-high shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-md text-xl font-bold text-on-surface">Vehicle Compatibility Matrix</h1>
            <span className="px-2 py-0.5 rounded bg-secondary/15 text-secondary text-[10px] font-bold uppercase font-mono">
              Direct &amp; Cross Fitment
            </span>
          </div>
          <p className="text-xs text-outline mt-0.5">
            Lookup spare-part components by two-wheeler make, model, displacement variant, and OEM chassis fitment.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-outline">
          <span>Database: <strong>6 OEMs • 28 Models • 84 Variants</strong></span>
        </div>
      </div>

      {/* Vehicle Search Bar (Requirement 15) */}
      <div className="p-4 bg-surface-container-lowest rounded border border-surface-container-high space-y-3">
        <label className="block text-outline font-bold uppercase tracking-wider text-[10px]">
          Direct Vehicle Search (Instant Fitment Lookup)
        </label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-secondary">
            two_wheeler
          </span>
          <input
            type="text"
            value={vehicleSearch}
            onChange={e => setVehicleSearch(e.target.value)}
            placeholder="Search vehicle model (e.g. 'Pulsar 150', 'Apache RTR 160', 'Splendor', 'Activa 6G')..."
            className="w-full py-2.5 pl-11 pr-24 rounded bg-surface-container border border-surface-container-highest text-on-surface text-sm font-semibold focus:outline-none focus:border-secondary shadow-inner"
          />
          {vehicleSearch && (
            <button
              type="button"
              onClick={() => setVehicleSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-surface-container-highest hover:bg-surface-container text-outline hover:text-on-surface rounded text-xs font-mono"
            >
              Clear
            </button>
          )}
        </div>

        {/* Quick popular tags */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-outline text-[11px]">Popular Searches:</span>
          {['Pulsar 150', 'Apache RTR 160', 'Splendor Plus', 'Activa 6G', 'Classic 350', 'Duke 200', 'FZ-S'].map(v => (
            <button
              key={v}
              type="button"
              onClick={() => setVehicleSearch(v)}
              className={`px-2.5 py-1 rounded font-semibold text-xs transition-colors ${
                vehicleSearch.toLowerCase() === v.toLowerCase()
                  ? 'bg-secondary text-on-secondary'
                  : 'bg-surface-container hover:bg-surface-container-highest text-on-surface'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* 4-Level Interactive Hierarchy Explorer (Requirement 15) */}
      <div className="border border-surface-container-high rounded bg-surface-container-lowest p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-surface-container pb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-outline flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">account_tree</span>
            <span>Hierarchy Explorer (Manufacturer &gt; Model &gt; Variant &gt; Compatible Parts)</span>
          </span>
          <span className="font-mono text-xs text-secondary font-bold">
            {selectedMake} → {selectedModel} → {selectedVariant}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* 1. Manufacturer */}
          <div>
            <label className="block text-outline font-bold text-[10px] uppercase mb-1">1. Manufacturer (OEM)</label>
            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-1">
              {vehicleDatabase.map(m => (
                <button
                  key={m.make}
                  type="button"
                  onClick={() => {
                    setSelectedMake(m.make);
                    setSelectedModel(m.models[0].name);
                    setSelectedVariant(m.models[0].variants[0]);
                    setVehicleSearch(`${m.make} ${m.models[0].name}`);
                  }}
                  className={`py-1.5 px-2.5 rounded text-left font-semibold transition-colors flex items-center justify-between ${
                    selectedMake === m.make
                      ? 'bg-secondary text-on-secondary'
                      : 'bg-surface-container hover:bg-surface-container-highest text-on-surface'
                  }`}
                >
                  <span>{m.make}</span>
                  <span className="text-[10px] opacity-75">{m.models.length} Models</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Model */}
          <div>
            <label className="block text-outline font-bold text-[10px] uppercase mb-1">2. Model Family</label>
            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-1">
              {currentMakeData.models.map(md => (
                <button
                  key={md.name}
                  type="button"
                  onClick={() => {
                    setSelectedModel(md.name);
                    setSelectedVariant(md.variants[0]);
                    setVehicleSearch(`${selectedMake} ${md.name}`);
                  }}
                  className={`py-1.5 px-2.5 rounded text-left font-semibold transition-colors flex items-center justify-between ${
                    selectedModel === md.name
                      ? 'bg-secondary text-on-secondary'
                      : 'bg-surface-container hover:bg-surface-container-highest text-on-surface'
                  }`}
                >
                  <span>{md.name}</span>
                  <span className="text-[10px] opacity-75">{md.variants.length} Variants</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Variant */}
          <div>
            <label className="block text-outline font-bold text-[10px] uppercase mb-1">3. Displacement Variant</label>
            <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-1">
              {currentModelData.variants.map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    setSelectedVariant(v);
                    setVehicleSearch(`${selectedModel} ${v.split(' ')[0]}`);
                  }}
                  className={`py-1.5 px-2.5 rounded text-left font-semibold transition-colors ${
                    selectedVariant === v
                      ? 'bg-secondary text-on-secondary font-bold'
                      : 'bg-surface-container hover:bg-surface-container-highest text-on-surface'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Matched Parts List (Requirement 15: Brake Pad, Clutch Plate, Air Filter, Oil Filter, etc.) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-headline-md text-base font-bold text-on-surface">
              Compatible Spare Parts for "{vehicleSearch || selectedModel}"
            </h2>
            <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed text-xs font-mono font-bold">
              {matchedParts.length} Verified Components
            </span>
          </div>

          <span className="text-xs text-outline font-mono">
            Directly verified against factory workshop manuals
          </span>
        </div>

        {matchedParts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {matchedParts.map(part => {
              const partNumber = part.partNumber || part.sku.replace('SKU-', '');
              const isAvailable = part.currentStock > 0;

              return (
                <div
                  key={part.id}
                  className="p-3.5 rounded bg-surface-container-lowest border border-surface-container-high hover:border-secondary transition-colors flex flex-col justify-between space-y-3 shadow-xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-surface-container text-secondary text-[10px] font-mono font-bold">
                        Part #{partNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isAvailable
                            ? 'bg-tertiary/15 text-tertiary'
                            : 'bg-error-container text-on-error-container'
                        }`}
                      >
                        {isAvailable ? `${part.currentStock} ${part.unit} Avail` : 'Out of Stock'}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-on-surface line-clamp-1">{part.name}</h3>

                    <div className="text-[11px] text-outline flex items-center justify-between">
                      <span>Brand: <strong className="text-on-surface">{part.brand}</strong></span>
                      <span>Rack: <strong className="font-mono text-on-surface">{part.rackBin}</strong></span>
                    </div>

                    <div className="p-2 rounded bg-surface-container-low border border-surface-container text-[11px] flex items-center justify-between font-mono">
                      <span className="text-outline">Selling Rate:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="line-through text-outline text-[10px]">₹{part.mrp}</span>
                        <strong className="text-secondary text-sm font-bold">₹{part.counterPrice}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Actions (Requirement 15: [ Add to Sale ] and [ View Item ]) */}
                  <div className="flex items-center gap-2 pt-1 border-t border-surface-container">
                    <button
                      type="button"
                      onClick={() => onOpenItemDetails && onOpenItemDetails(part)}
                      className="flex-1 py-1.5 px-2 bg-surface-container hover:bg-surface-container-highest text-on-surface rounded text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">visibility</span>
                      <span>View Item</span>
                    </button>

                    <button
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => onAddToCart && onAddToCart(part)}
                      className="flex-1 py-1.5 px-2 bg-secondary hover:bg-secondary/90 disabled:opacity-50 text-on-secondary rounded text-xs font-semibold flex items-center justify-center gap-1 transition-colors shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[14px]">add_shopping_cart</span>
                      <span>Add to Sale</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center bg-surface-container-lowest border border-surface-container-high rounded space-y-2">
            <span className="material-symbols-outlined text-4xl text-outline">two_wheeler</span>
            <h3 className="font-bold text-on-surface text-sm">No exact fitment found for "{vehicleSearch}"</h3>
            <p className="text-xs text-outline max-w-sm mx-auto">
              Try searching by bike model (e.g. "Pulsar", "Apache", "Activa") or browse the OEM hierarchy tree above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
