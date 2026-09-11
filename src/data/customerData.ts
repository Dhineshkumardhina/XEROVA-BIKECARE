import { CustomerAccount, HeldBill } from '../types';
import { INITIAL_PARTS } from './initialData';

export const INITIAL_CUSTOMERS: CustomerAccount[] = [
  {
    id: 'cust-1',
    name: 'ABC Auto Works',
    phone: '98765 43210',
    gstin: '33AAAAA9876B1Z4',
    address: '14 Industrial Estate, Guindy, Chennai - 600032',
    balance: 12500,
    creditLimit: 50000,
    tier: 'Garage Regular',
    rateTier: 'Wholesale',
    vehicles: [
      { id: 'veh-1', regNo: 'TN-01-AB-1234', model: 'Bajaj Pulsar 150 DTS-i' },
      { id: 'veh-2', regNo: 'TN-01-CD-5678', model: 'TVS Apache RTR 160 4V' }
    ],
    lastSaleRateMap: {
      'part-1': 690.0, // Special negotiated clutch plate rate
      'part-4': 730.0  // Motul oil negotiated
    }
  },
  {
    id: 'cust-2',
    name: 'Sri Balaji Motors (Muthu Tech)',
    phone: '98401 88231',
    gstin: '33AAAAA0000A1Z5',
    address: '88 Car Street, Triplicane, Chennai - 600005',
    balance: 8920,
    creditLimit: 30000,
    tier: 'Garage Regular',
    rateTier: 'Wholesale',
    vehicles: [
      { id: 'veh-3', regNo: 'TN-05-AL-9988', model: 'Hero Splendor Plus BS6' },
      { id: 'veh-4', regNo: 'TN-05-BM-1122', model: 'Hero Passion Pro' }
    ],
    lastSaleRateMap: {
      'part-9': 155.0
    }
  },
  {
    id: 'cust-3',
    name: 'Royal Enfield Spares Hub & Service',
    phone: '99403 44556',
    gstin: '33AABCR1234F1Z9',
    address: '21 Anna Salai, Thousand Lights, Chennai - 600006',
    balance: 34200,
    creditLimit: 100000,
    tier: 'Wholesale',
    rateTier: 'Wholesale',
    vehicles: [
      { id: 'veh-5', regNo: 'TN-02-RE-3500', model: 'Royal Enfield Classic 350 Reborn' },
      { id: 'veh-6', regNo: 'TN-02-HN-4512', model: 'Royal Enfield Hunter 350' }
    ],
    lastSaleRateMap: {
      'part-4': 710.0
    }
  },
  {
    id: 'cust-4',
    name: 'Suresh Babu',
    phone: '98401 22345',
    address: 'Flat 4B, Green Park Apts, T. Nagar, Chennai - 600017',
    balance: 0,
    creditLimit: 0,
    tier: 'Retail',
    rateTier: 'MRP',
    vehicles: [
      { id: 'veh-7', regNo: 'TN-09-CB-4412', model: 'Bajaj Pulsar 150 UG4' }
    ]
  },
  {
    id: 'cust-5',
    name: 'Karthik Raja',
    phone: '97910 12345',
    address: '18 Velachery Main Road, Chennai - 600042',
    balance: 1850,
    creditLimit: 5000,
    tier: 'Retail',
    rateTier: 'MRP',
    vehicles: [
      { id: 'veh-8', regNo: 'TN-22-AK-9011', model: 'TVS Apache RTR 160' }
    ]
  }
];

export const INITIAL_HELD_BILLS: HeldBill[] = [
  {
    id: 'BILL #H001',
    heldAt: '10:42 AM',
    customerName: 'Walk-in Counter Customer',
    customerPhone: '98840 91823',
    vehicleNo: 'TN-07-BL-4091',
    bikeModel: 'Hero Splendor Plus',
    customerType: 'B2C',
    totalAmount: 4820,
    billDiscount: 100,
    billDiscountType: 'flat',
    charges: {
      fitting: 150,
      freight: 50,
      other: 0,
      otherNote: ''
    },
    items: [
      {
        id: 'held-item-1',
        part: INITIAL_PARTS[3], // Motul 7100
        qty: 4,
        rate: 820,
        discount: 0,
        discountType: 'flat',
        selectedVehicle: 'Hero Splendor Plus'
      },
      {
        id: 'held-item-2',
        part: INITIAL_PARTS[8], // Splendor Brake Shoe
        qty: 8,
        rate: 180,
        discount: 40,
        discountType: 'flat',
        selectedVehicle: 'Hero Splendor Plus'
      }
    ]
  },
  {
    id: 'BILL #H002',
    heldAt: '11:15 AM',
    customerName: 'ABC Auto Works',
    customerPhone: '98765 43210',
    vehicleNo: 'TN-01-AB-1234',
    bikeModel: 'Bajaj Pulsar 150',
    customerType: 'B2B',
    garageId: '#GB-09',
    gstin: '33AAAAA9876B1Z4',
    totalAmount: 1280,
    billDiscount: 0,
    billDiscountType: 'flat',
    charges: {
      fitting: 0,
      freight: 0,
      other: 0,
      otherNote: ''
    },
    items: [
      {
        id: 'held-item-3',
        part: INITIAL_PARTS[0], // Clutch plate
        qty: 1,
        rate: 670,
        discount: 0,
        discountType: 'flat',
        selectedVehicle: 'Bajaj Pulsar 150'
      },
      {
        id: 'held-item-4',
        part: INITIAL_PARTS[4], // Cable
        qty: 3,
        rate: 125,
        discount: 0,
        discountType: 'flat',
        selectedVehicle: 'Bajaj Pulsar 150'
      }
    ]
  }
];
