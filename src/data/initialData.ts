import {
  SparePart,
  Invoice,
  TopMovingSpare,
  TenderReconciliationData,
  Quotation,
  SalesReturnRecord,
  PurchaseReturnRecord
} from '../types';

export const INITIAL_PARTS: SparePart[] = [];

export const INITIAL_INVOICES: Invoice[] = [];

export const INITIAL_TOP_MOVING: TopMovingSpare[] = [];

export const INITIAL_TENDER_DATA: TenderReconciliationData = {
  cash: 0,
  upi: 0,
  card: 0,
  credit: 0,
  total: 0
};

export const INITIAL_QUOTATIONS: Quotation[] = [];

export const INITIAL_SALES_RETURNS: SalesReturnRecord[] = [];

export const INITIAL_PURCHASE_RETURNS: PurchaseReturnRecord[] = [];
