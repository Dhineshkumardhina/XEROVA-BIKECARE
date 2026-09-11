/**
 * Indian Rupee (INR) and Number Formatters for BIKE ERP
 * Complies with Indian numbering conventions (Lakhs & Crores)
 * e.g., ₹1,25,000.00
 */

export function formatINR(val: number | undefined | null, decimals = 2): string {
  if (val === undefined || val === null || isNaN(val)) {
    return '₹0.00';
  }

  const isNegative = val < 0;
  const absVal = Math.abs(val);

  const parts = absVal.toFixed(decimals).split('.');
  const integerPart = parts[0];
  const decimalPart = parts.length > 1 && decimals > 0 ? '.' + parts[1] : '';

  // Indian format: last 3 digits, then pairs of 2 digits
  let result = '';
  if (integerPart.length <= 3) {
    result = integerPart;
  } else {
    const lastThree = integerPart.substring(integerPart.length - 3);
    const remaining = integerPart.substring(0, integerPart.length - 3);
    const formattedRemaining = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    result = formattedRemaining + ',' + lastThree;
  }

  return `${isNegative ? '-' : ''}₹${result}${decimalPart}`;
}

export function formatQty(qty: number | undefined | null, unit = 'Pcs'): string {
  if (qty === undefined || qty === null || isNaN(qty)) return `0 ${unit}`;
  return `${qty.toLocaleString('en-IN')} ${unit}`;
}

export function formatPercent(val: number | undefined | null, decimals = 1): string {
  if (val === undefined || val === null || isNaN(val)) return '0.0%';
  return `${val.toFixed(decimals)}%`;
}
