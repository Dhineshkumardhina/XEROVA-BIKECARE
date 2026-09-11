import React, { useState } from 'react';
import { SparePart } from '../../types';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (importedCount: number) => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [fileName, setFileName] = useState<string>('spare_parts_master_5000_skus.xlsx');
  const [fileSize, setFileSize] = useState<string>('2.4 MB');

  // Step 2 Mapping
  const [mappings, setMappings] = useState({
    partNo: 'Part Number',
    product: 'Item Name',
    brand: 'Brand',
    gst: 'GST Rate',
    mrp: 'MRP',
    purchaseRate: 'Purchase Rate',
    sellingRate: 'Selling Rate',
    stock: 'Opening Stock',
    rackBin: 'Rack / Bin'
  });

  // Step 3 Validation stats (exact as in user request: Total 5000, Valid 4982, Warnings 12, Errors 6)
  const validationStats = {
    totalRows: 5000,
    validRows: 4982,
    warnings: 12,
    errors: 6
  };

  const samplePreviewRows = [
    {
      rowNum: 2,
      partNumber: '1302',
      name: 'Clutch Plate Friction Disc Set (5 Pcs)',
      brand: 'TVS Genuine',
      gst: '18%',
      mrp: '₹850.00',
      rate: '₹720.00',
      stock: '18',
      status: 'VALID'
    },
    {
      rowNum: 3,
      partNumber: '2214',
      name: 'Front Brake Pad Ceramic Heavy Duty',
      brand: 'Bybre / Bosch',
      gst: '18%',
      mrp: '₹480.00',
      rate: '₹390.00',
      stock: '24',
      status: 'VALID'
    },
    {
      rowNum: 4,
      partNumber: '4011',
      name: 'Motul 4T 7100 10W50 Synthetic 1L',
      brand: 'Motul',
      gst: '18%',
      mrp: '₹925.00',
      rate: '₹790.00',
      stock: '32',
      status: 'VALID'
    },
    {
      rowNum: 5,
      partNumber: '8910',
      name: 'Drive Chain & Sprocket Kit 428H',
      brand: 'Rolon',
      gst: '18%',
      mrp: '₹1,450.00',
      rate: '₹1,220.00',
      stock: '7',
      status: 'WARNING: Missing Vehicle Year'
    },
    {
      rowNum: 6,
      partNumber: '9901',
      name: 'LED Headlamp Bulb H4 12V 35W',
      brand: 'Osram OEM',
      gst: '28%',
      mrp: '₹320.00',
      rate: '₹260.00',
      stock: '45',
      status: 'VALID'
    }
  ];

  if (!isOpen) return null;

  const handleDownloadErrorReport = () => {
    const csvContent =
      'Row,PartNumber,Field,ErrorType,Description\n' +
      '142,SKU-4912,Barcode,ERROR,Barcode already exists in database (890123891001)\n' +
      '319,SKU-6120,HSN,ERROR,Invalid HSN code length "87" (Must be 4 or 8 digits)\n' +
      '844,SKU-7721,SellingRate,ERROR,Selling rate (₹920) cannot exceed MRP (₹850)\n' +
      '1209,SKU-8104,GST,ERROR,Unsupported GST slab "19%" (Allowed: 0, 5, 12, 18, 28)\n' +
      '2401,SKU-9021,PartNo,ERROR,Duplicate Part Number in uploaded sheet\n' +
      '3881,SKU-9941,Unit,ERROR,Unrecognized unit "Dozen" (Allowed: Pcs, Set, Can, Bottle)\n' +
      '441,SKU-5510,Vehicles,WARNING,Model year range not specified\n' +
      '912,SKU-7801,RackBin,WARNING,Rack Bin location empty, defaulted to UNASSIGNED';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'item_import_validation_errors.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 bg-black/50 backdrop-blur-[1px] animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-surface-container-lowest rounded shadow-2xl border border-surface-container-high flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-surface-container-low border-b border-surface-container-high flex items-center justify-between">
          <div>
            <h2 className="font-headline-md text-base font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[20px]">upload_file</span>
              <span>Bulk Excel Import Wizard</span>
            </h2>
            <p className="text-xs text-outline mt-0.5">
              Import 50,000+ spare parts, pricing updates, and vehicle compatibility in 5 verified steps.
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

        {/* Stepper Wizard Bar */}
        <div className="grid grid-cols-5 border-b border-surface-container-high text-xs font-semibold select-none bg-surface-container-lowest">
          {[
            { step: 1, label: '1. Upload Excel' },
            { step: 2, label: '2. Map Columns' },
            { step: 3, label: '3. Validation' },
            { step: 4, label: '4. Preview' },
            { step: 5, label: '5. Import' }
          ].map(s => (
            <div
              key={s.step}
              className={`py-2 px-3 text-center border-b-2 transition-colors ${
                currentStep === s.step
                  ? 'border-secondary text-secondary font-bold bg-secondary-container/20'
                  : currentStep > s.step
                  ? 'border-tertiary text-tertiary'
                  : 'border-transparent text-outline'
              }`}
            >
              {s.label}
            </div>
          ))}
        </div>

        {/* Step Contents */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* STEP 1: UPLOAD */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-surface-container-highest hover:border-secondary rounded p-8 text-center bg-surface-container-low transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-4xl text-secondary">table_chart</span>
                <h3 className="font-bold text-on-surface text-sm mt-2">Drag and drop your Excel / CSV file here</h3>
                <p className="text-xs text-outline mt-1">Supports .xlsx, .xls, .csv up to 100,000 rows (Max 50MB)</p>
                <div className="mt-4">
                  <span className="px-4 py-2 bg-secondary text-on-secondary rounded text-xs font-semibold inline-block">
                    Browse Computer Files
                  </span>
                </div>
              </div>

              <div className="p-3 bg-surface-container rounded border border-surface-container-high flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-secondary text-[20px]">description</span>
                  <div>
                    <strong className="text-on-surface">{fileName}</strong>
                    <span className="text-outline text-[11px] block">{fileSize} • 5,000 detected rows</span>
                  </div>
                </div>
                <span className="text-tertiary font-bold text-[11px] uppercase">✓ File Parsed</span>
              </div>

              <div className="flex items-center justify-between text-xs text-outline pt-2">
                <span>Need the official template?</span>
                <button
                  type="button"
                  onClick={() => alert('Downloading BIKE_ERP_Item_Master_Template.xlsx')}
                  className="text-secondary hover:underline font-semibold flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  <span>Download Blank Excel Template (.xlsx)</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: MAP COLUMNS */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-xs text-outline flex items-center justify-between">
                <span>Map the columns from your Excel sheet to BIKE ERP database fields:</span>
                <span className="font-mono text-secondary">9 of 9 columns mapped</span>
              </div>

              <div className="border border-surface-container-high rounded overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-container-low font-label-caps text-[10px] text-outline uppercase border-b border-surface-container-high">
                    <tr>
                      <th className="py-2.5 px-3">Excel Column Header</th>
                      <th className="py-2.5 px-3">Sample Row Value</th>
                      <th className="py-2.5 px-3">System Field Target</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-high font-mono">
                    {[
                      { excel: 'Part No', sample: '1302', system: 'Part Number', required: true },
                      { excel: 'Product', sample: 'Clutch Plate Friction Disc Set', system: 'Item Name', required: true },
                      { excel: 'Brand', sample: 'TVS Genuine', system: 'Brand', required: true },
                      { excel: 'GST', sample: '18%', system: 'GST Rate', required: true },
                      { excel: 'MRP', sample: '850.00', system: 'MRP', required: true },
                      { excel: 'Purchase Rate', sample: '560.00', system: 'Purchase Rate', required: true },
                      { excel: 'Selling Rate', sample: '720.00', system: 'Selling Rate', required: true },
                      { excel: 'Stock', sample: '18', system: 'Opening Stock', required: false },
                      { excel: 'Rack / Bin', sample: 'B-04-T2', system: 'Rack / Bin Location', required: false }
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-surface-container-low">
                        <td className="py-2 px-3 font-bold text-on-surface">{row.excel}</td>
                        <td className="py-2 px-3 text-outline">{row.sample}</td>
                        <td className="py-2 px-3">
                          <select
                            defaultValue={row.system}
                            className="py-1 px-2 rounded bg-surface-container border border-surface-container-highest text-secondary font-sans font-semibold text-xs focus:outline-none"
                          >
                            <option value={row.system}>{row.system}</option>
                            <option value="Ignore">-- Do Not Import --</option>
                          </select>
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="text-tertiary font-bold text-[10px]">AUTO-MATCHED</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 3: VALIDATION */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded bg-surface-container-low border border-surface-container">
                  <span className="text-outline text-[10px] uppercase font-bold">TOTAL ROWS</span>
                  <div className="font-mono text-2xl font-bold text-on-surface mt-1">
                    {validationStats.totalRows.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-outline">Detected in file</span>
                </div>

                <div className="p-3 rounded bg-tertiary/10 border border-tertiary/30">
                  <span className="text-tertiary text-[10px] uppercase font-bold">VALID ROWS</span>
                  <div className="font-mono text-2xl font-bold text-tertiary mt-1">
                    {validationStats.validRows.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-tertiary font-semibold">99.64% clean</span>
                </div>

                <div className="p-3 rounded bg-amber-500/10 border border-amber-500/30">
                  <span className="text-amber-700 text-[10px] uppercase font-bold">WARNINGS</span>
                  <div className="font-mono text-2xl font-bold text-amber-700 mt-1">
                    {validationStats.warnings}
                  </div>
                  <span className="text-[10px] text-amber-700">Can be imported</span>
                </div>

                <div className="p-3 rounded bg-error/10 border border-error/30">
                  <span className="text-error text-[10px] uppercase font-bold">ERRORS</span>
                  <div className="font-mono text-2xl font-bold text-error mt-1">
                    {validationStats.errors}
                  </div>
                  <span className="text-[10px] text-error font-semibold">Will be skipped</span>
                </div>
              </div>

              {/* Error explanation card */}
              <div className="border border-surface-container-high rounded p-3 bg-surface-container-low space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-on-surface">
                  <div className="flex items-center gap-1.5 text-error">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    <span>Validation Summary (6 Blocking Errors, 12 Warnings)</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadErrorReport}
                    className="text-secondary hover:underline font-semibold flex items-center gap-1 text-[11px]"
                  >
                    <span className="material-symbols-outlined text-[14px]">download</span>
                    <span>Download Error Report (.csv)</span>
                  </button>
                </div>

                <div className="space-y-1 text-outline font-mono text-[11px] pt-1">
                  <p>• Row 142: Duplicate Barcode "890123891001" already exists.</p>
                  <p>• Row 319: Invalid HSN "87" must be 4 or 8 digits.</p>
                  <p>• Row 844: Selling Rate ₹920.00 is higher than MRP ₹850.00.</p>
                  <p>• Row 1209: Unsupported GST slab "19%".</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PREVIEW */}
          {currentStep === 4 && (
            <div className="space-y-3">
              <div className="text-xs text-outline flex items-center justify-between">
                <span>Sample preview of the first 5 records to be created or updated:</span>
                <span className="font-mono text-on-surface">Showing 5 of {validationStats.validRows} rows</span>
              </div>

              <div className="border border-surface-container-high rounded overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-container-low font-label-caps text-[10px] text-outline uppercase border-b border-surface-container-high">
                    <tr>
                      <th className="py-2 px-2.5">Row</th>
                      <th className="py-2 px-2.5">Part No</th>
                      <th className="py-2 px-2.5">Item Name</th>
                      <th className="py-2 px-2.5">Brand</th>
                      <th className="py-2 px-2.5 text-right">MRP</th>
                      <th className="py-2 px-2.5 text-right">Selling</th>
                      <th className="py-2 px-2.5 text-right">Stock</th>
                      <th className="py-2 px-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-high font-mono">
                    {samplePreviewRows.map((r, i) => (
                      <tr key={i} className="hover:bg-surface-container-low">
                        <td className="py-2 px-2.5 text-outline">{r.rowNum}</td>
                        <td className="py-2 px-2.5 font-bold text-secondary">{r.partNumber}</td>
                        <td className="py-2 px-2.5 font-sans font-semibold text-on-surface">{r.name}</td>
                        <td className="py-2 px-2.5 font-sans">{r.brand}</td>
                        <td className="py-2 px-2.5 text-right font-bold">{r.mrp}</td>
                        <td className="py-2 px-2.5 text-right font-bold text-secondary">{r.rate}</td>
                        <td className="py-2 px-2.5 text-right font-bold">{r.stock}</td>
                        <td className="py-2 px-2.5 text-center">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-sans font-bold ${
                              r.status === 'VALID'
                                ? 'bg-tertiary/15 text-tertiary'
                                : 'bg-amber-500/15 text-amber-700'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 5: COMPLETE */}
          {currentStep === 5 && (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-tertiary/15 text-tertiary flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-4xl">task_alt</span>
              </div>
              <h3 className="font-bold text-lg text-on-surface">Excel Import Complete!</h3>
              <p className="text-xs text-outline max-w-md mx-auto">
                Successfully created and synchronized <strong>4,982 spare parts items</strong> into Item Master. 6 erroneous rows were bypassed and written to error log.
              </p>
              <div className="p-3 bg-surface-container rounded inline-block text-xs font-mono text-secondary">
                Audit Batch ID: BATCH-IMP-2026-09-5000
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-surface-container-low border-t border-surface-container-high flex items-center justify-between">
          {currentStep > 1 && currentStep < 5 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((currentStep - 1) as any)}
              className="px-4 py-2 hover:bg-surface-container text-on-surface rounded text-xs font-semibold"
            >
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 hover:bg-surface-container text-on-surface rounded text-xs font-semibold"
            >
              Cancel
            </button>
          )}

          <div className="flex items-center gap-2">
            {currentStep === 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2 bg-secondary hover:bg-secondary/90 text-on-secondary rounded text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5"
              >
                <span>Continue to Map Columns</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            )}

            {currentStep === 2 && (
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2 bg-secondary hover:bg-secondary/90 text-on-secondary rounded text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5"
              >
                <span>Run Validation Check</span>
                <span className="material-symbols-outlined text-[16px]">verified</span>
              </button>
            )}

            {currentStep === 3 && (
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-5 py-2 bg-secondary hover:bg-secondary/90 text-on-secondary rounded text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5"
              >
                <span>Preview Valid Items</span>
                <span className="material-symbols-outlined text-[16px]">preview</span>
              </button>
            )}

            {currentStep === 4 && (
              <button
                type="button"
                onClick={() => {
                  setCurrentStep(5);
                  onImportComplete(validationStats.validRows);
                }}
                className="px-5 py-2 bg-tertiary hover:bg-tertiary/90 text-on-tertiary rounded text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">upload</span>
                <span>Execute Final Import (4,982 Items)</span>
              </button>
            )}

            {currentStep === 5 && (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-secondary hover:bg-secondary/90 text-on-secondary rounded text-xs font-semibold transition-colors shadow-xs"
              >
                Done &amp; View Catalog
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
