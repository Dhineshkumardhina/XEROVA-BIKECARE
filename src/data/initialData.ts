import { SparePart, Invoice, TopMovingSpare, TenderReconciliationData } from '../types';

export const INITIAL_PARTS: SparePart[] = [
  {
    id: 'part-1',
    sku: 'SKU-1302',
    barcode: '890123891001',
    name: 'TVS Genuine Clutch Plate Set (5 Plates)',
    brand: 'Endurance OEM',
    oemCode: 'K6080230',
    category: 'Clutch & Transmission',
    vehicles: ['Apache RTR 160 4V', 'Pulsar 150', 'Discover 125'],
    hsn: '8714',
    rackBin: 'B-04-T2',
    purchasePrice: 540.0,
    wholesalePrice: 670.0,
    mrp: 850.0,
    counterPrice: 720.0,
    currentStock: 18,
    minReorder: 15,
    unit: 'Pcs',
    gstRate: 18,
    status: 'Normal',
    physicalQty: 18,
    avgLandedCost: 532.4,
    thirtyDayVelocity: 42,
    stockMovements: [
      {
        date: '24-Oct-2024',
        ref: 'INV-2024-8192',
        type: 'POS Out',
        qty: -2,
        balance: 18,
        userOrParty: 'Counter 1 (Rajesh)'
      },
      {
        date: '22-Oct-2024',
        ref: 'INV-2024-8104',
        type: 'B2B Out',
        qty: -5,
        balance: 20,
        userOrParty: 'Sri Balaji Motors'
      },
      {
        date: '18-Oct-2024',
        ref: 'GRN-4420-TVS',
        type: 'Purchase',
        qty: 25,
        balance: 25,
        userOrParty: 'Endurance Auto Tech'
      }
    ],
    compatMatrix: [
      {
        model: 'TVS Apache RTR 160 4V',
        specs: 'Engine: 159.7 cc Single Cylinder (BS-IV, BS-VI)',
        fitType: '100% Direct Fit'
      },
      {
        model: 'Bajaj Pulsar 150 (Twin Spark DTS-i)',
        specs: 'UG3, UG4, UG4.5 Variants (Year 2011 - 2021)',
        fitType: 'Compatible'
      },
      {
        model: 'Bajaj Discover 125 ST / DTS-i',
        specs: 'Clutch Hub Dia: 120mm',
        fitType: 'Cross-Spec'
      }
    ]
  },
  {
    id: 'part-2',
    sku: 'SKU-4421',
    barcode: '890123891002',
    name: 'Front Disc Brake Pad Set (Ceramic Spec)',
    brand: 'Brembo Spec',
    oemCode: 'BJ-9912',
    category: 'Braking System & Pads',
    vehicles: ['Pulsar 150 UG4/5', 'Pulsar 180', 'Pulsar 220'],
    hsn: '8714',
    rackBin: 'A-02-T1',
    purchasePrice: 260.0,
    wholesalePrice: 330.0,
    mrp: 420.0,
    counterPrice: 360.0,
    currentStock: 0,
    minReorder: 20,
    unit: 'Pcs',
    gstRate: 18,
    status: 'Out of Stock',
    pendingPo: { qty: 40, poNumber: '#8812' },
    physicalQty: 0,
    avgLandedCost: 258.0,
    thirtyDayVelocity: 65,
    stockMovements: [
      {
        date: '23-Oct-2024',
        ref: 'INV-2024-8140',
        type: 'POS Out',
        qty: -3,
        balance: 0,
        userOrParty: 'Counter 2 (Suresh)'
      },
      {
        date: '20-Oct-2024',
        ref: 'INV-2024-8090',
        type: 'POS Out',
        qty: -7,
        balance: 3,
        userOrParty: 'Counter 1 (Rajesh)'
      }
    ],
    compatMatrix: [
      {
        model: 'Bajaj Pulsar 150 UG4/5',
        specs: 'Caliper Dual Piston Bybre / Brembo',
        fitType: '100% Direct Fit'
      },
      {
        model: 'Bajaj Pulsar 180 UG4',
        specs: 'Front Dual Piston Master Cylinder',
        fitType: '100% Direct Fit'
      },
      {
        model: 'Bajaj Pulsar 220 F',
        specs: 'Twin Pot Front Disc Assembly',
        fitType: 'Compatible'
      }
    ]
  },
  {
    id: 'part-3',
    sku: 'SKU-7710',
    barcode: '890123891003',
    name: 'Rolon Heavy Duty Chain & Sprocket Kit (428-112L)',
    brand: 'Rolon Genuine',
    oemCode: 'K04-SPL-HD',
    category: 'Drive Chains & Sprockets',
    vehicles: ['Hero Splendor Plus', 'Passion Pro', 'HF Deluxe'],
    hsn: '8714',
    rackBin: 'C-01-T3',
    purchasePrice: 710.0,
    wholesalePrice: 820.0,
    mrp: 1050.0,
    counterPrice: 940.0,
    currentStock: 4,
    minReorder: 12,
    unit: 'Pcs',
    gstRate: 18,
    status: 'Low Stock',
    physicalQty: 4,
    avgLandedCost: 705.5,
    thirtyDayVelocity: 38,
    stockMovements: [
      {
        date: '24-Oct-2024',
        ref: 'INV-10289',
        type: 'POS Out',
        qty: -1,
        balance: 4,
        userOrParty: 'Counter 2 (Suresh)'
      },
      {
        date: '21-Oct-2024',
        ref: 'INV-2024-8110',
        type: 'POS Out',
        qty: -2,
        balance: 5,
        userOrParty: 'Counter 1 (Rajesh)'
      }
    ],
    compatMatrix: [
      {
        model: 'Hero Splendor Plus (All BS-IV/VI)',
        specs: '14T Front / 44T Rear - 112 Links',
        fitType: '100% Direct Fit'
      },
      {
        model: 'Hero Passion Pro / Xpro',
        specs: 'Standard Pitch 428',
        fitType: '100% Direct Fit'
      },
      {
        model: 'Hero HF Deluxe Eco',
        specs: 'Standard 428 pitch chain hub',
        fitType: 'Compatible'
      }
    ]
  },
  {
    id: 'part-4',
    sku: 'SKU-0891',
    barcode: '890123891004',
    name: 'Motul 7100 4T 10W-50 100% Synthetic Ester (1 Litre)',
    brand: 'Motul Tech',
    oemCode: 'M71-2024-B9',
    category: 'Lubricants & Fork Oils',
    vehicles: ['Universal 4-Stroke', 'KTM Duke / RC', 'Dominar 400'],
    hsn: '2710',
    rackBin: 'OIL-01',
    purchasePrice: 640.0,
    wholesalePrice: 760.0,
    mrp: 925.0,
    counterPrice: 820.0,
    currentStock: 45,
    minReorder: 10,
    unit: 'Btls',
    gstRate: 18,
    status: 'Normal',
    physicalQty: 45,
    avgLandedCost: 638.0,
    thirtyDayVelocity: 88,
    stockMovements: [
      {
        date: '24-Oct-2024',
        ref: 'INV-10291',
        type: 'POS Out',
        qty: -1,
        balance: 45,
        userOrParty: 'Counter 1 (Rajesh)'
      },
      {
        date: '23-Oct-2024',
        ref: 'GRN-4418-MOTUL',
        type: 'Purchase',
        qty: 30,
        balance: 46,
        userOrParty: 'Motul Distributor'
      }
    ],
    compatMatrix: [
      {
        model: 'KTM Duke 200 / 250 / 390',
        specs: 'JASO MA2, API SN Full Synthetic',
        fitType: '100% Direct Fit'
      },
      {
        model: 'Bajaj Dominar 400 DOHC',
        specs: 'Recommended Viscosity 10W-50',
        fitType: '100% Direct Fit'
      },
      {
        model: 'Universal 4-Stroke Performance Motorcycles',
        specs: 'High Temperature High Shear (HTHS) > 4.5 mPa.s',
        fitType: 'Compatible'
      }
    ]
  },
  {
    id: 'part-5',
    sku: 'SKU-2019',
    barcode: '890123891005',
    name: 'Accelerator Cable Assembly (Teflon Lined)',
    brand: 'Bajaj Genuine',
    oemCode: 'DJ191024',
    category: 'Cables & Control Levers',
    vehicles: ['Pulsar 150 UG3/UG4', 'Pulsar 180 UG4'],
    hsn: '8714',
    rackBin: 'CAB-02',
    purchasePrice: 95.0,
    wholesalePrice: 130.0,
    mrp: 190.0,
    counterPrice: 150.0,
    currentStock: 12,
    minReorder: 10,
    unit: 'Pcs',
    gstRate: 18,
    status: 'Normal',
    physicalQty: 12,
    avgLandedCost: 94.2,
    thirtyDayVelocity: 29,
    stockMovements: [
      {
        date: '24-Oct-2024',
        ref: 'INV-10291',
        type: 'POS Out',
        qty: -1,
        balance: 12,
        userOrParty: 'Counter 1 (Rajesh)'
      }
    ],
    compatMatrix: [
      {
        model: 'Bajaj Pulsar 150 UG3 / UG4 / UG4.5',
        specs: 'Outer Sleeve: 920mm, Inner Wire: 1010mm',
        fitType: '100% Direct Fit'
      },
      {
        model: 'Bajaj Pulsar 180 UG4',
        specs: 'Direct replacement for clip-on handle models',
        fitType: '100% Direct Fit'
      }
    ]
  },
  {
    id: 'part-6',
    sku: 'SKU-9102',
    barcode: '890123891006',
    name: 'NGK Laser Iridium Spark Plug (CR8EIX 4218)',
    brand: 'NGK Spark Co.',
    oemCode: 'CR8EIX-4218',
    category: 'Electrical, Battery & Plugs',
    vehicles: ['Yamaha R15 V3/V4', 'Yamaha MT-15', 'FZ25 250cc'],
    hsn: '8511',
    rackBin: 'ELEC-04',
    purchasePrice: 490.0,
    wholesalePrice: 610.0,
    mrp: 750.0,
    counterPrice: 680.0,
    currentStock: 3,
    minReorder: 15,
    unit: 'Pcs',
    gstRate: 18,
    status: 'Low Stock',
    physicalQty: 3,
    avgLandedCost: 485.0,
    thirtyDayVelocity: 22,
    stockMovements: [
      {
        date: '23-Oct-2024',
        ref: 'INV-2024-8144',
        type: 'POS Out',
        qty: -1,
        balance: 3,
        userOrParty: 'Counter 2 (Suresh)'
      }
    ],
    compatMatrix: [
      {
        model: 'Yamaha YZF R15 V3 / V4 (VVA)',
        specs: '10mm Thread, 19mm Reach, 16mm Hex',
        fitType: '100% Direct Fit'
      },
      {
        model: 'Yamaha MT-15 BS-IV / BS-VI',
        specs: 'Heat Range 8, Fine Wire 0.6mm Iridium Tip',
        fitType: '100% Direct Fit'
      },
      {
        model: 'Yamaha FZ-25 / FZS-25',
        specs: 'Standard replacement for superior ignition',
        fitType: 'Compatible'
      }
    ]
  },
  {
    id: 'part-7',
    sku: 'SKU-5501',
    barcode: '890123891007',
    name: 'Front Fork Oil Seal 31mm Dual-Lip (Pair)',
    brand: 'Honda Genuine',
    oemCode: '51490-KRM-860',
    category: 'Front & Rear Suspension',
    vehicles: ['Honda Shine 125', 'Unicorn 150/160', 'CB Trigger'],
    hsn: '8487',
    rackBin: 'SUSP-02',
    purchasePrice: 65.0,
    wholesalePrice: 95.0,
    mrp: 140.0,
    counterPrice: 120.0,
    currentStock: 32,
    minReorder: 10,
    unit: 'Pairs',
    gstRate: 18,
    status: 'Normal',
    physicalQty: 32,
    avgLandedCost: 64.0,
    thirtyDayVelocity: 35,
    stockMovements: [
      {
        date: '24-Oct-2024',
        ref: 'INV-10290',
        type: 'B2B Out',
        qty: -2,
        balance: 32,
        userOrParty: 'Counter 1 (Rajesh)'
      }
    ],
    compatMatrix: [
      {
        model: 'Honda CB Shine 125 / SP 125',
        specs: '31 x 43 x 10.5 mm Dual Lip',
        fitType: '100% Direct Fit'
      },
      {
        model: 'Honda CB Unicorn 150 / 160',
        specs: 'Standard 31mm fork stanchion',
        fitType: '100% Direct Fit'
      },
      {
        model: 'Honda CB Trigger',
        specs: 'Direct OEM spec fit',
        fitType: '100% Direct Fit'
      }
    ]
  },
  {
    id: 'part-8',
    sku: 'SKU-3312',
    barcode: '890123891008',
    name: 'Castrol Activ 4T 20W-40 1L Engine Oil',
    brand: 'Castrol',
    oemCode: 'CAS-ACT-20W40',
    category: 'Lubricants & Fork Oils',
    vehicles: ['Universal 4T Bike Lubricant', 'Hero Splendor', 'Bajaj Discover'],
    hsn: '2710',
    rackBin: 'OIL-02',
    purchasePrice: 320.0,
    wholesalePrice: 380.0,
    mrp: 470.0,
    counterPrice: 420.0,
    currentStock: 5,
    minReorder: 30,
    unit: 'Btls',
    gstRate: 18,
    status: 'Low Stock',
    physicalQty: 5,
    avgLandedCost: 318.0,
    thirtyDayVelocity: 94,
    stockMovements: [
      {
        date: '24-Oct-2024',
        ref: 'INV-2024-8178',
        type: 'POS Out',
        qty: -4,
        balance: 5,
        userOrParty: 'Counter 2 (Suresh)'
      }
    ],
    compatMatrix: [
      {
        model: 'Hero Splendor / Passion / HF 100cc',
        specs: 'Viscosity 20W-40 JASO MA2',
        fitType: '100% Direct Fit'
      },
      {
        model: 'Universal Commuter Motorcycles (100cc - 150cc)',
        specs: 'Continuous Protection Actibond Molecules',
        fitType: 'Compatible'
      }
    ]
  },
  {
    id: 'part-9',
    sku: 'SKU-6109',
    barcode: '890123891009',
    name: 'Splendor Brake Shoe Endurance (Rear Drum)',
    brand: 'Endurance OEM',
    oemCode: 'EB-4410',
    category: 'Braking System & Pads',
    vehicles: ['Hero Splendor Plus', 'Passion Pro', 'Super Splendor'],
    hsn: '8714',
    rackBin: 'BRK-01',
    purchasePrice: 110.0,
    wholesalePrice: 160.0,
    mrp: 230.0,
    counterPrice: 195.0,
    currentStock: 17,
    minReorder: 10,
    unit: 'Pcs',
    gstRate: 18,
    status: 'Normal',
    physicalQty: 17,
    avgLandedCost: 108.5,
    thirtyDayVelocity: 55,
    stockMovements: [
      {
        date: '24-Oct-2024',
        ref: 'INV-10290',
        type: 'B2B Out',
        qty: -4,
        balance: 17,
        userOrParty: 'Counter 1 (Rajesh)'
      }
    ],
    compatMatrix: [
      {
        model: 'Hero Splendor Plus / Pro',
        specs: '130mm Drum Diameter, Asbestos Free',
        fitType: '100% Direct Fit'
      },
      {
        model: 'Hero Super Splendor 125',
        specs: 'Standard OEM replacement spring included',
        fitType: '100% Direct Fit'
      }
    ]
  },
  {
    id: 'part-10',
    sku: 'SKU-2210',
    partNumber: '2210',
    barcode: '890123891010',
    name: 'Pulsar 150 Front Disc Brake Pad Set',
    brand: 'Bajaj Genuine',
    oemCode: 'DK-151065',
    category: 'Brakes & Hydraulics',
    vehicles: ['Pulsar 150', 'Pulsar 180', 'Pulsar 220F'],
    hsn: '8714',
    rackBin: 'BRK-03',
    purchasePrice: 180.0,
    wholesalePrice: 220.0,
    mrp: 310.0,
    counterPrice: 260.0,
    currentStock: 12,
    minReorder: 10,
    unit: 'Pcs',
    gstRate: 18,
    status: 'Normal',
    physicalQty: 12,
    avgLandedCost: 178.0,
    thirtyDayVelocity: 44,
    stockMovements: [],
    compatMatrix: [
      {
        model: 'Bajaj Pulsar 150 (Twin Spark DTS-i)',
        specs: 'Bybre Front Caliper Disc Fitment',
        fitType: '100% Direct Fit'
      }
    ]
  },
  {
    id: 'part-11',
    sku: 'SKU-3190',
    partNumber: '3190',
    barcode: '890123891011',
    name: 'Pulsar 150 High Flow Air Filter Element',
    brand: 'Bajaj Genuine',
    oemCode: 'DH-121038',
    category: 'Filters & Intake',
    vehicles: ['Pulsar 150', 'Pulsar 180 DTS-i'],
    hsn: '8421',
    rackBin: 'FLT-01',
    purchasePrice: 90.0,
    wholesalePrice: 120.0,
    mrp: 175.0,
    counterPrice: 145.0,
    currentStock: 24,
    minReorder: 15,
    unit: 'Pcs',
    gstRate: 18,
    status: 'Normal',
    physicalQty: 24,
    avgLandedCost: 89.0,
    thirtyDayVelocity: 52,
    stockMovements: [],
    compatMatrix: [
      {
        model: 'Bajaj Pulsar 150',
        specs: 'OEM Polyurethane foam filter element',
        fitType: '100% Direct Fit'
      }
    ]
  },
  {
    id: 'part-12',
    sku: 'SKU-4105',
    partNumber: '4105',
    barcode: '890123891012',
    name: 'Pulsar 150 Spin-on Engine Oil Filter Cartridge',
    brand: 'Bajaj Genuine',
    oemCode: 'JG-571014',
    category: 'Filters & Intake',
    vehicles: ['Pulsar 150', 'Pulsar 180', 'Avenger 160'],
    hsn: '8421',
    rackBin: 'FLT-02',
    purchasePrice: 45.0,
    wholesalePrice: 60.0,
    mrp: 90.0,
    counterPrice: 75.0,
    currentStock: 42,
    minReorder: 20,
    unit: 'Pcs',
    gstRate: 18,
    status: 'Normal',
    physicalQty: 42,
    avgLandedCost: 44.5,
    thirtyDayVelocity: 88,
    stockMovements: [],
    compatMatrix: [
      {
        model: 'Bajaj Pulsar 150',
        specs: 'High filtration micronic cellulose paper',
        fitType: '100% Direct Fit'
      }
    ]
  },
  {
    id: 'part-13',
    sku: 'SKU-5812',
    partNumber: '5812',
    barcode: '890123891013',
    name: 'Rolon Chain & Sprocket Kit for Pulsar 150 (42T / 15T)',
    brand: 'Rolon Genuine',
    oemCode: 'RL-PUL150-KIT',
    category: 'Clutch & Transmission',
    vehicles: ['Pulsar 150'],
    hsn: '8714',
    rackBin: 'CHN-04',
    purchasePrice: 840.0,
    wholesalePrice: 980.0,
    mrp: 1280.0,
    counterPrice: 1120.0,
    currentStock: 7,
    minReorder: 10,
    unit: 'Pcs',
    gstRate: 18,
    status: 'Low Stock',
    physicalQty: 7,
    avgLandedCost: 835.0,
    thirtyDayVelocity: 26,
    stockMovements: [],
    compatMatrix: [
      {
        model: 'Bajaj Pulsar 150',
        specs: '428 Pitch Heavy Duty O-Ring Chain Kit',
        fitType: '100% Direct Fit'
      }
    ]
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'INV-10291',
    customerName: 'Suresh Babu',
    vehicleNo: 'TN-09-CB-4412',
    bikeModel: 'Pulsar 150',
    itemsCount: 4,
    itemsSummary: 'Clutch Plate, Cable, Motul Oil',
    lineItems: [
      {
        partId: 'part-1',
        sku: 'SKU-1302',
        name: 'TVS Genuine Clutch Plate Set',
        hsn: '8714',
        qty: 1,
        rate: 720.0,
        discount: 0,
        taxableAmount: 610.17,
        gstRate: 18,
        total: 720.0
      },
      {
        partId: 'part-5',
        sku: 'SKU-2019',
        name: 'Accelerator Cable Assembly',
        hsn: '8714',
        qty: 1,
        rate: 150.0,
        discount: 0,
        taxableAmount: 127.12,
        gstRate: 18,
        total: 150.0
      },
      {
        partId: 'part-4',
        sku: 'SKU-0891',
        name: 'Motul 7100 4T 10W-50 (1L)',
        hsn: '2710',
        qty: 1,
        rate: 820.0,
        discount: 0,
        taxableAmount: 694.92,
        gstRate: 18,
        total: 820.0
      },
      {
        partId: 'part-7',
        sku: 'SKU-5501',
        name: 'Front Fork Oil Seal 31mm (Pair)',
        hsn: '8487',
        qty: 1,
        rate: 120.0,
        discount: 0,
        taxableAmount: 101.69,
        gstRate: 18,
        total: 120.0
      }
    ],
    subtotal: 2076.27,
    cgst: 186.86,
    sgst: 186.86,
    totalAmount: 2450.0,
    payMode: 'UPI (GPay)',
    taxType: 'B2C',
    status: 'PAID',
    operator: 'Rajesh (Op1)',
    createdAt: '24 Oct 2024, 11:24 AM'
  },
  {
    id: 'INV-10290',
    customerName: 'Sri Balaji Auto Works',
    isGarage: true,
    garageAccountId: '#GB-21',
    gstin: '33AAAAA0000A1Z5',
    itemsCount: 12,
    itemsSummary: 'Brake Shoes, Filters, Plugs',
    lineItems: [
      {
        partId: 'part-9',
        sku: 'SKU-6109',
        name: 'Splendor Brake Shoe Endurance',
        hsn: '8714',
        qty: 10,
        rate: 160.0,
        discount: 50,
        taxableAmount: 6200.0,
        gstRate: 18,
        total: 7316.0
      },
      {
        partId: 'part-7',
        sku: 'SKU-5501',
        name: 'Front Fork Oil Seal 31mm (Pair)',
        hsn: '8487',
        qty: 12,
        rate: 95.0,
        discount: 0,
        taxableAmount: 1359.32,
        gstRate: 18,
        total: 1604.0
      }
    ],
    subtotal: 7559.32,
    cgst: 680.34,
    sgst: 680.34,
    totalAmount: 8920.0,
    payMode: 'Credit Ledger',
    taxType: 'B2B (GST)',
    status: 'CREDIT 15D',
    operator: 'Rajesh (Op1)',
    createdAt: '24 Oct 2024, 10:48 AM'
  },
  {
    id: 'INV-10289',
    customerName: 'Karthik Raja',
    vehicleNo: 'TN-22-AK-9011',
    bikeModel: 'RTR 160',
    itemsCount: 2,
    itemsSummary: 'Chain Sprocket Kit Rolon',
    lineItems: [
      {
        partId: 'part-3',
        sku: 'SKU-7710',
        name: 'Rolon Heavy Duty Chain & Sprocket Kit',
        hsn: '8714',
        qty: 1,
        rate: 940.0,
        discount: 0,
        taxableAmount: 1567.8,
        gstRate: 18,
        total: 1850.0
      }
    ],
    subtotal: 1567.8,
    cgst: 141.1,
    sgst: 141.1,
    totalAmount: 1850.0,
    payMode: 'Cash',
    taxType: 'B2C',
    status: 'PAID',
    operator: 'Suresh (Op2)',
    createdAt: '24 Oct 2024, 10:15 AM'
  },
  {
    id: 'INV-10288',
    customerName: 'Royal Enfield Spares Hub',
    isGarage: true,
    garageAccountId: 'Wholesale Distribution',
    gstin: '33AABCR1234F1Z9',
    itemsCount: 28,
    itemsSummary: 'Classic 350 Consumables Bulk',
    lineItems: [
      {
        partId: 'part-4',
        sku: 'SKU-0891',
        name: 'Motul 7100 4T 10W-50 1L (Case of 24)',
        hsn: '2710',
        qty: 24,
        rate: 760.0,
        discount: 240,
        taxableAmount: 28983.05,
        gstRate: 18,
        total: 34200.0
      }
    ],
    subtotal: 28983.05,
    cgst: 2608.47,
    sgst: 2608.47,
    totalAmount: 34200.0,
    payMode: 'NEFT Bank',
    taxType: 'B2B',
    status: 'PAID',
    operator: 'Rajesh (Op1)',
    createdAt: '24 Oct 2024, 09:50 AM'
  },
  {
    id: 'INV-10287',
    customerName: 'Walking Customer',
    bikeModel: 'Hero Splendor Plus',
    itemsCount: 1,
    itemsSummary: 'Spark Plug Champion',
    lineItems: [
      {
        partId: 'part-gen',
        sku: 'SKU-PLUG-1',
        name: 'Spark Plug Champion RG4HC',
        hsn: '8511',
        qty: 1,
        rate: 145.0,
        discount: 0,
        taxableAmount: 122.88,
        gstRate: 18,
        total: 145.0
      }
    ],
    subtotal: 122.88,
    cgst: 11.06,
    sgst: 11.06,
    totalAmount: 145.0,
    payMode: 'Cash',
    taxType: 'B2C',
    status: 'PAID',
    operator: 'Suresh (Op2)',
    createdAt: '24 Oct 2024, 09:12 AM'
  }
];

export const TOP_MOVING_SPARES: TopMovingSpare[] = [
  {
    rank: 1,
    name: 'Motul 3000 4T 10W30 (1L)',
    category: 'Engine Oil',
    tag: 'Fast Counter',
    units: 38,
    revenue: 14820
  },
  {
    rank: 2,
    name: 'TVS Apache Front Disc Pad',
    category: 'Braking',
    tag: 'TVS Genuine',
    units: 22,
    revenue: 7260
  },
  {
    rank: 3,
    name: 'Pulsar 150 Throttle Cable OEM',
    category: 'Cables',
    tag: 'Bajaj OEM',
    units: 19,
    revenue: 2850
  },
  {
    rank: 4,
    name: 'Splendor Brake Shoe Endurance',
    category: 'Drum Brake',
    tag: 'Endurance OEM',
    units: 17,
    revenue: 3910
  }
];

export const INITIAL_TENDER_DATA: TenderReconciliationData = {
  cashInDrawer: 42150.0,
  upiCollections: 58430.0,
  cardPosTerminal: 14920.0,
  directNeftBank: 9000.0,
  totalRealized: 124500.0,
  shiftStatus: 'Shift #1 In-Balance'
};

export const HOURLY_VELOCITY_DATA = [
  { time: '09:00 AM', amount: 8200, count: 6 },
  { time: '11:00 AM', amount: 28400, count: 21, isPeak: true, label: '₹28.4k (11 AM)' },
  { time: '01:00 PM', amount: 16500, count: 12 },
  { time: '03:30 PM', amount: 12100, count: 9 },
  { time: '06:30 PM', amount: 36200, count: 26, isPeak: true, label: '₹36.2k (6:30 PM Peak)' },
  { time: '08:30 PM', amount: 18600, count: 10 },
  { time: 'Closed', amount: 4500, count: 0 }
];
