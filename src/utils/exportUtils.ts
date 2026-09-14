/**
 * BIKE ERP - Core Export & Print Utilities
 * High-reliability browser download, thermal/A4 printing, CSV serialization, and WhatsApp sharing
 */

/**
 * Converts data rows to CSV string and initiates a browser file download.
 */
export function exportToCsv(
  filename: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
): void {
  const escapeCell = (val: string | number | boolean | null | undefined): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => row.map(escapeCell).join(','))
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads arbitrary text/JSON content as a file (e.g., database backups, audit JSON).
 */
export function downloadJsonFile(filename: string, data: any): void {
  const jsonStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.json') ? filename : `${filename}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Triggers clean printable HTML window for thermal vouchers, A4 invoices, or returns.
 */
export function triggerPrintWindow(title: string, htmlContent: string): void {
  const printWindow = window.open('', '_blank', 'width=800,height=900,menubar=no,toolbar=no,location=no,status=no');
  if (!printWindow) {
    window.print();
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          @page { size: auto; margin: 15mm; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #111827;
            background: #ffffff;
            margin: 0;
            padding: 20px;
            font-size: 12px;
          }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border: 1px solid #e5e7eb; padding: 6px 10px; text-align: left; }
          th { background-color: #f3f4f6; font-weight: 600; text-transform: uppercase; font-size: 10px; }
          .header { text-align: center; border-bottom: 2px solid #111827; padding-bottom: 12px; margin-bottom: 15px; }
          .title { font-size: 18px; font-weight: bold; margin: 0; }
          .subtitle { font-size: 11px; color: #4b5563; margin-top: 4px; }
          .total-box { margin-top: 20px; float: right; width: 280px; }
          .total-row { display: flex; justify-content: space-between; padding: 4px 0; font-weight: bold; font-size: 14px; }
          .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #9ca3af; clear: both; }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        ${htmlContent}
        <script>
          window.onload = function() {
            window.focus();
            window.print();
            setTimeout(function() { window.close(); }, 500);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

/**
 * Builds WhatsApp Click-to-Chat URL
 */
export function getWhatsAppShareUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates and downloads the official standard Item Master import CSV template.
 */
export function downloadItemMasterTemplateCsv(): void {
  const headers = [
    'Part Number / SKU',
    'Part Name',
    'Short Name',
    'Category',
    'Brand / OEM',
    'Vehicle Model Compatibility',
    'HSN Code',
    'GST Rate (%)',
    'Purchase Rate (Excl GST)',
    'MRP (Incl GST)',
    'Selling Rate (Incl GST)',
    'Opening Stock',
    'Min Reorder Level',
    'Rack / Bin Location',
    'Barcode'
  ];

  const sampleRows = [
    [
      'SKU-DISC-01',
      'Front Disc Brake Pad Set',
      'F-Disc Pad',
      'Brake System',
      'Bosch OEM',
      'Bajaj Pulsar 150/180/220; TVS Apache RTR',
      '87141090',
      '18',
      '220.00',
      '450.00',
      '380.00',
      '25',
      '5',
      'RACK-A1-BIN04',
      '890123456701'
    ],
    [
      'SKU-PLUG-02',
      'Twin Spark Plug RG6YC',
      'Spark Plug RG6',
      'Electricals',
      'Champion',
      'Hero Splendor Plus; Passion Pro',
      '85111000',
      '18',
      '65.00',
      '140.00',
      '120.00',
      '100',
      '20',
      'RACK-B2-BIN11',
      '890123456702'
    ],
    [
      'SKU-OIL-03',
      '4T 10W-30 Synthetic Motorcycle Engine Oil 1L',
      'Motul 10W30 1L',
      'Lubricants & Fluids',
      'Motul',
      'Honda Activa 5G/6G; Dio; Shine',
      '27101990',
      '18',
      '310.00',
      '520.00',
      '480.00',
      '48',
      '12',
      'RACK-OIL-01',
      '890123456703'
    ]
  ];

  exportToCsv('BIKE_ERP_Item_Master_Template.csv', headers, sampleRows);
}
