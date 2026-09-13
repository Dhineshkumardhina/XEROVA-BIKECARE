/**
 * BIKE ERP - Centralized GST Tax Calculation & Validation Engine
 * 
 * Rules:
 * 1. Decimal-safe financial calculations.
 * 2. Intra-state supplies: Taxable Value -> CGST (Rate/2) + SGST (Rate/2).
 * 3. Inter-state supplies: Taxable Value -> IGST (Full Rate).
 * 4. Exempt / Nil-Rated / Non-GST supplies: 0% Tax with proper categorization.
 * 5. Strict 2-decimal rounding per line item, invoice round-off to nearest integer.
 * 6. GSTIN checksum & HSN format validators.
 */

export interface GstLineItemInput {
  itemId?: string;
  quantity: number;
  unitRate: number;
  discountAmount?: number;
  taxRate: number; // e.g. 0, 5, 12, 18, 28
  isInterstate?: boolean;
  taxType?: 'TAXABLE' | 'EXEMPT' | 'NIL' | 'NON_GST';
  hsnCode?: string;
}

export interface GstLineItemOutput {
  itemId?: string;
  quantity: number;
  unitRate: number;
  grossAmount: number;
  discountAmount: number;
  taxableAmount: number;
  taxRate: number;
  taxType: 'TAXABLE' | 'EXEMPT' | 'NIL' | 'NON_GST';
  cgstRate: number;
  cgstAmount: number;
  sgstRate: number;
  sgstAmount: number;
  igstRate: number;
  igstAmount: number;
  totalTaxAmount: number;
  totalAmount: number;
  hsnCode?: string;
}

export interface InvoiceGstSummaryInput {
  items: GstLineItemInput[];
  isInterstate?: boolean;
  invoiceDiscount?: number;
  fittingCharges?: number;
  freightCharges?: number;
  fittingGstRate?: number;
}

export interface InvoiceGstSummaryOutput {
  items: GstLineItemOutput[];
  grossTotal: number;
  totalDiscount: number;
  taxableTotal: number;
  totalCgst: number;
  totalSgst: number;
  totalIgst: number;
  totalTax: number;
  additionalCharges: number;
  subtotal: number;
  rawGrandTotal: number;
  roundOff: number;
  grandTotal: number;
  taxBreakdown: Array<{
    rate: number;
    taxable: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalTax: number;
  }>;
}

/**
 * Rounds a number safely to 2 decimal places using half-up method.
 */
export function round2Decimals(num: number): number {
  return Number(Math.round(Number(num + 'e+2')) + 'e-2');
}

/**
 * Calculates GST components for a single line item.
 */
export function calculateGstLineItem(input: GstLineItemInput): GstLineItemOutput {
  const qty = Math.max(0, Number(input.quantity) || 0);
  const rate = Math.max(0, Number(input.unitRate) || 0);
  const discount = Math.max(0, Number(input.discountAmount) || 0);
  const taxRate = Math.max(0, Number(input.taxRate) || 0);
  const isInterstate = !!input.isInterstate;
  const taxType = input.taxType || (taxRate === 0 ? 'NIL' : 'TAXABLE');

  const grossAmount = round2Decimals(qty * rate);
  const discountAmount = Math.min(grossAmount, round2Decimals(discount));
  const taxableAmount = Math.max(0, round2Decimals(grossAmount - discountAmount));

  if (taxType === 'EXEMPT' || taxType === 'NIL' || taxType === 'NON_GST' || taxRate === 0) {
    return {
      itemId: input.itemId,
      quantity: qty,
      unitRate: rate,
      grossAmount,
      discountAmount,
      taxableAmount,
      taxRate: 0,
      taxType,
      cgstRate: 0,
      cgstAmount: 0,
      sgstRate: 0,
      sgstAmount: 0,
      igstRate: 0,
      igstAmount: 0,
      totalTaxAmount: 0,
      totalAmount: taxableAmount,
      hsnCode: input.hsnCode
    };
  }

  let cgstRate = 0;
  let cgstAmount = 0;
  let sgstRate = 0;
  let sgstAmount = 0;
  let igstRate = 0;
  let igstAmount = 0;

  if (isInterstate) {
    igstRate = taxRate;
    igstAmount = round2Decimals((taxableAmount * igstRate) / 100);
  } else {
    cgstRate = round2Decimals(taxRate / 2);
    sgstRate = round2Decimals(taxRate / 2);
    cgstAmount = round2Decimals((taxableAmount * cgstRate) / 100);
    sgstAmount = round2Decimals((taxableAmount * sgstRate) / 100);
  }

  const totalTaxAmount = round2Decimals(cgstAmount + sgstAmount + igstAmount);
  const totalAmount = round2Decimals(taxableAmount + totalTaxAmount);

  return {
    itemId: input.itemId,
    quantity: qty,
    unitRate: rate,
    grossAmount,
    discountAmount,
    taxableAmount,
    taxRate,
    taxType: 'TAXABLE',
    cgstRate,
    cgstAmount,
    sgstRate,
    sgstAmount,
    igstRate,
    igstAmount,
    totalTaxAmount,
    totalAmount,
    hsnCode: input.hsnCode
  };
}

/**
 * Calculates complete GST breakdown and round-off for an entire invoice.
 */
export function calculateInvoiceGstSummary(input: InvoiceGstSummaryInput): InvoiceGstSummaryOutput {
  const isInterstate = !!input.isInterstate;
  const processedItems: GstLineItemOutput[] = [];

  let grossTotal = 0;
  let totalDiscount = Math.max(0, Number(input.invoiceDiscount) || 0);
  let taxableTotal = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;

  const breakdownMap = new Map<number, { taxable: number; cgst: number; sgst: number; igst: number }>();

  for (const item of input.items) {
    const calc = calculateGstLineItem({
      ...item,
      isInterstate
    });
    processedItems.push(calc);

    grossTotal = round2Decimals(grossTotal + calc.grossAmount);
    totalDiscount = round2Decimals(totalDiscount + calc.discountAmount);
    taxableTotal = round2Decimals(taxableTotal + calc.taxableAmount);
    totalCgst = round2Decimals(totalCgst + calc.cgstAmount);
    totalSgst = round2Decimals(totalSgst + calc.sgstAmount);
    totalIgst = round2Decimals(totalIgst + calc.igstAmount);

    const rateKey = calc.taxRate;
    const existing = breakdownMap.get(rateKey) || { taxable: 0, cgst: 0, sgst: 0, igst: 0 };
    existing.taxable = round2Decimals(existing.taxable + calc.taxableAmount);
    existing.cgst = round2Decimals(existing.cgst + calc.cgstAmount);
    existing.sgst = round2Decimals(existing.sgst + calc.sgstAmount);
    existing.igst = round2Decimals(existing.igst + calc.igstAmount);
    breakdownMap.set(rateKey, existing);
  }

  // Handle Additional Charges (Fitting / Freight)
  const fittingCharges = Math.max(0, Number(input.fittingCharges) || 0);
  const freightCharges = Math.max(0, Number(input.freightCharges) || 0);
  const additionalCharges = round2Decimals(fittingCharges + freightCharges);

  const totalTax = round2Decimals(totalCgst + totalSgst + totalIgst);
  const subtotal = round2Decimals(taxableTotal + totalTax);
  const rawGrandTotal = round2Decimals(subtotal + additionalCharges);

  // Indian POS Standard: Nearest Rupee Round-Off
  const roundedGrandTotal = Math.round(rawGrandTotal);
  const roundOff = round2Decimals(roundedGrandTotal - rawGrandTotal);
  const grandTotal = roundedGrandTotal;

  const taxBreakdown = Array.from(breakdownMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([rate, vals]) => ({
      rate,
      taxable: vals.taxable,
      cgst: vals.cgst,
      sgst: vals.sgst,
      igst: vals.igst,
      totalTax: round2Decimals(vals.cgst + vals.sgst + vals.igst)
    }));

  return {
    items: processedItems,
    grossTotal,
    totalDiscount,
    taxableTotal,
    totalCgst,
    totalSgst,
    totalIgst,
    totalTax,
    additionalCharges,
    subtotal,
    rawGrandTotal,
    roundOff,
    grandTotal,
    taxBreakdown
  };
}

/**
 * Validates GSTIN format according to Indian GST specifications:
 * Format: 2 digits (State Code) + 5 letters (PAN) + 4 digits + 1 letter + 1 char (entity num) + 'Z' + 1 char (checksum).
 */
export function validateGstinFormat(gstin?: string | null): { isValid: boolean; stateCode?: string; pan?: string; error?: string } {
  if (!gstin) {
    return { isValid: false, error: 'GSTIN is empty' };
  }

  const cleanGstin = gstin.trim().toUpperCase();

  if (cleanGstin.length !== 15) {
    return { isValid: false, error: `GSTIN must be exactly 15 characters (received ${cleanGstin.length})` };
  }

  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!gstinRegex.test(cleanGstin)) {
    return { isValid: false, error: 'Invalid GSTIN structure or pattern' };
  }

  const stateCode = cleanGstin.substring(0, 2);
  const stateNum = parseInt(stateCode, 10);
  if (stateNum < 1 || (stateNum > 38 && stateNum !== 97 && stateNum !== 99)) {
    return { isValid: false, stateCode, error: `Invalid Indian GST state code: ${stateCode}` };
  }

  const pan = cleanGstin.substring(2, 12);

  // Checksum calculation (Indian GST Luhn Mod 36 variant)
  const isValidChecksum = verifyGstinChecksum(cleanGstin);
  if (!isValidChecksum) {
    return { isValid: false, stateCode, pan, error: 'Invalid GSTIN checksum digit' };
  }

  return { isValid: true, stateCode, pan };
}

/**
 * Computes the exact Indian GSTIN checksum character for a 14-character prefix
 * using the Base-36 Luhn variant specified by GSTN.
 */
export function computeGstinChecksum(prefix14: string): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const clean = prefix14.trim().toUpperCase();
  if (clean.length < 14) return 'Z';

  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const codePoint = chars.indexOf(clean[i]);
    if (codePoint === -1) return 'Z';

    const factor = (i % 2 === 0) ? 1 : 2;
    const digit = codePoint * factor;
    const quotient = Math.floor(digit / 36);
    const remainder = digit % 36;
    sum += quotient + remainder;
  }

  const checkRemainder = sum % 36;
  const checkCodePoint = (36 - checkRemainder) % 36;
  return chars[checkCodePoint];
}

/**
 * GSTIN Checksum calculation (Base 36 algorithm per GSTN specs)
 */
export function verifyGstinChecksum(gstin: string): boolean {
  if (!gstin || gstin.length !== 15) return false;
  const expectedChar = computeGstinChecksum(gstin.substring(0, 14));
  return gstin[14].toUpperCase() === expectedChar;
}

/**
 * Validates HSN / SAC Code
 * Typical goods HSN: 4, 6, or 8 digits.
 * SAC for services: 6 digits starting with 99.
 */
export function validateHsnFormat(hsn?: string | null): { isValid: boolean; error?: string } {
  if (!hsn) {
    return { isValid: false, error: 'HSN code is missing' };
  }

  const cleanHsn = hsn.trim();
  if (!/^[0-9]{2,8}$/.test(cleanHsn)) {
    return { isValid: false, error: 'HSN code must contain between 2 and 8 digits' };
  }

  return { isValid: true };
}

/**
 * Determines whether a transaction is Intra-State or Inter-State by comparing State Codes.
 */
export function isInterstateSupply(companyStateCode: string, customerStateCode?: string | null): boolean {
  if (!customerStateCode) return false;
  const cleanComp = companyStateCode.trim().padStart(2, '0');
  const cleanCust = customerStateCode.trim().padStart(2, '0');
  return cleanComp !== cleanCust;
}

/**
 * Extracts 2-digit state code from GSTIN if present.
 */
export function extractStateCodeFromGstin(gstin?: string | null): string | null {
  if (!gstin || gstin.trim().length < 2) return null;
  const code = gstin.trim().substring(0, 2);
  return /^[0-9]{2}$/.test(code) ? code : null;
}

/**
 * Standard Indian State Code Directory for GST
 */
export const GST_STATE_CODES: Record<string, string> = {
  '01': 'Jammu and Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '26': 'Dadra and Nagar Haveli and Daman and Diu',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman and Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '38': 'Ladakh',
  '97': 'Other Territory',
  '99': 'Centre Jurisdiction'
};
