import React, { useState } from 'react';
import { PrinterConfig, UserRole } from '../../types';

interface PrinterSettingsViewProps {
  printerConfig: PrinterConfig;
  userRole: UserRole;
  onSavePrinterConfig: (config: PrinterConfig) => void;
  onTriggerPermissionDenied?: (action: string) => void;
}

export const PrinterSettingsView: React.FC<PrinterSettingsViewProps> = ({
  printerConfig,
  userRole,
  onSavePrinterConfig,
  onTriggerPermissionDenied
}) => {
  const [config, setConfig] = useState<PrinterConfig>(printerConfig);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testPrinting, setTestPrinting] = useState<string | null>(null);

  const isAllowedToEdit = userRole === 'super_admin' || userRole === 'admin';

  const handleChange = (field: keyof PrinterConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!isAllowedToEdit) {
      if (onTriggerPermissionDenied) onTriggerPermissionDenied('Save Printer Settings');
      return;
    }
    onSavePrinterConfig(config);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleTestPrint = (printerName: string) => {
    setTestPrinting(printerName);
    setTimeout(() => {
      setTestPrinting(null);
    }, 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low p-4 rounded border border-surface-container-high">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] text-primary">print</span>
            <h1 className="text-lg font-bold text-on-surface tracking-tight">Hardware Printer Settings & Hardware Drivers</h1>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-surface-container rounded border border-surface-container-high text-outline">
              ESC/POS & Laser Routing
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            Map POS counter billing directly to thermal roll receipt printers and wholesale accounting to laser jet printers.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-primary text-on-primary rounded text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 shadow-xs shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          Save Configuration
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded text-xs font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>Printer routes, paper sizes, and spooler preferences updated successfully.</span>
        </div>
      )}

      {/* Printer Hardware Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Thermal Receipt Printer (Fast Counter POS) */}
        <div className="bg-surface-container-low border border-surface-container-high rounded p-4 space-y-3.5">
          <div className="flex items-start justify-between pb-2 border-b border-surface-container-high">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded bg-primary-container text-on-primary-container border border-primary/20">
                <span className="material-symbols-outlined text-[22px]">receipt</span>
              </div>
              <div>
                <h2 className="font-bold text-xs text-on-surface">Thermal POS Roll Printer</h2>
                <div className="text-[11px] text-outline">ESC/POS High Speed Receipt Driver</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleTestPrint(config.thermalPrinter)}
              disabled={!!testPrinting}
              className="px-2.5 py-1 rounded bg-surface border border-surface-container-high hover:bg-surface-container text-on-surface text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">print</span>
              {testPrinting === config.thermalPrinter ? 'Sending Test...' : 'Test Print'}
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-outline font-semibold mb-1">Assigned Thermal Hardware</label>
              <select
                value={config.thermalPrinter}
                onChange={(e) => handleChange('thermalPrinter', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface font-mono text-[11px]"
              >
                <option value="EPSON TM-T82III (USB/LAN)">EPSON TM-T82III (USB/LAN)</option>
                <option value="TVS RP-3160 Gold (Thermal 80mm)">TVS RP-3160 Gold (Thermal 80mm)</option>
                <option value="NGX POS P-80 Thermal">NGX POS P-80 Thermal</option>
                <option value="Generic 58mm Bluetooth Mini POS">Generic 58mm Bluetooth Mini POS</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-outline font-semibold mb-1">Roll Paper Size</label>
                <select
                  value={config.paperSize}
                  onChange={(e) => handleChange('paperSize', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface"
                >
                  <option value="3-inch (80mm)">3-inch (80mm)</option>
                  <option value="2-inch (58mm)">2-inch (58mm)</option>
                </select>
              </div>

              <div>
                <label className="block text-outline font-semibold mb-1">Auto Paper Cutter</label>
                <div className="pt-2">
                  <label className="flex items-center gap-1.5 text-xs text-on-surface cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded text-primary focus:ring-0"
                    />
                    <span>Full Partial Cut</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: A4 / A5 Laser Printer (Wholesale & Accounts) */}
        <div className="bg-surface-container-low border border-surface-container-high rounded p-4 space-y-3.5">
          <div className="flex items-start justify-between pb-2 border-b border-surface-container-high">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded bg-secondary-container text-on-secondary-container border border-secondary/20">
                <span className="material-symbols-outlined text-[22px]">description</span>
              </div>
              <div>
                <h2 className="font-bold text-xs text-on-surface">Office Laser Jet Printer</h2>
                <div className="text-[11px] text-outline">Wholesale Invoices, Ledgers & GSTR</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleTestPrint(config.a4Printer)}
              disabled={!!testPrinting}
              className="px-2.5 py-1 rounded bg-surface border border-surface-container-high hover:bg-surface-container text-on-surface text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">print</span>
              {testPrinting === config.a4Printer ? 'Sending Test...' : 'Test Print'}
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-outline font-semibold mb-1">Assigned Laser Hardware</label>
              <select
                value={config.a4Printer}
                onChange={(e) => handleChange('a4Printer', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface font-mono text-[11px]"
              >
                <option value="HP LaserJet Pro MFP 4104dw (Network)">HP LaserJet Pro MFP 4104dw (Network)</option>
                <option value="Canon imageCLASS LBP2900B (USB)">Canon imageCLASS LBP2900B (USB)</option>
                <option value="Brother DCP-L2541DW (Wi-Fi)">Brother DCP-L2541DW (Wi-Fi)</option>
                <option value="Microsoft Print to PDF">Microsoft Print to PDF</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-outline font-semibold mb-1">Default Copies</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={config.copies}
                  onChange={(e) => handleChange('copies', parseInt(e.target.value) || 1)}
                  className="w-full px-2.5 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface font-mono"
                />
              </div>

              <div>
                <label className="block text-outline font-semibold mb-1">Sheet Format</label>
                <select
                  defaultValue="A4 (210 x 297 mm)"
                  className="w-full px-2.5 py-1.5 bg-surface border border-surface-container-high rounded text-on-surface"
                >
                  <option value="A4">A4 Standard Sheet</option>
                  <option value="A5">A5 Half Sheet</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Printing Behaviors */}
      <div className="bg-surface-container-low border border-surface-container-high rounded p-4 space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-on-surface">
          Automated Spooling & Workflow Behaviors
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <label className="flex items-start gap-2.5 p-3 rounded border border-surface-container-high bg-surface cursor-pointer">
            <input
              type="checkbox"
              checked={config.autoPrintOnSave}
              onChange={(e) => handleChange('autoPrintOnSave', e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded text-primary focus:ring-0 cursor-pointer"
            />
            <div>
              <div className="font-semibold text-on-surface">Auto-Print On Save (F12 Shortcut)</div>
              <div className="text-[11px] text-outline mt-0.5">
                Automatically triggers printer spooling without showing intermediate browser print preview dialog.
              </div>
            </div>
          </label>

          <label className="flex items-start gap-2.5 p-3 rounded border border-surface-container-high bg-surface cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="w-4 h-4 mt-0.5 rounded text-primary focus:ring-0 cursor-pointer"
            />
            <div>
              <div className="font-semibold text-on-surface">Kick Electronic Cash Drawer</div>
              <div className="text-[11px] text-outline mt-0.5">
                Sends pulse voltage on pin 2 to release cash register drawer on cash bill completion.
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Test Print Toast Modal */}
      {testPrinting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest border border-primary/30 rounded p-5 max-w-sm w-full text-center space-y-3 text-on-surface shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container mx-auto flex items-center justify-center animate-pulse">
              <span className="material-symbols-outlined text-[28px]">print</span>
            </div>
            <div>
              <h4 className="font-bold text-sm">Spooling Test Slip...</h4>
              <p className="text-xs text-outline mt-1 font-mono">{testPrinting}</p>
            </div>
            <div className="text-[11px] text-emerald-600 font-medium">
              Diagnostic test page transmitted to printer port successfully.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
