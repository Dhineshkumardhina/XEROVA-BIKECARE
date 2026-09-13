// Indian Localization & Number Formatting Utilities for BIKE ERP

/**
 * Formats a number to Indian Rupee currency standard: ₹1,25,000.00
 */
export const formatCurrency = (amount: number | string | undefined | null, includeDecimals = true): string => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return includeDecimals ? '₹0.00' : '₹0';
  }
  const numericVal = Number(amount);
  const formatted = numericVal.toLocaleString('en-IN', {
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0
  });
  return `₹${formatted}`;
};

// Backward-compatible alias
export const formatINR = formatCurrency;

/**
 * Formats standard Indian integer number: 1,25,000
 */
export const formatNumber = (val: number | string | undefined | null): string => {
  if (val === undefined || val === null || isNaN(Number(val))) return '0';
  return Number(val).toLocaleString('en-IN');
};

/**
 * Formats inventory quantities with unit suffix: "12 pcs", "4 sets", "2 boxes"
 */
export const formatQuantity = (qty: number | string | undefined | null, unit = 'pcs'): string => {
  if (qty === undefined || qty === null || isNaN(Number(qty))) return `0 ${unit}`;
  return `${Number(qty).toLocaleString('en-IN')} ${unit}`;
};

// Backward-compatible alias
export const formatQty = formatQuantity;

/**
 * Formats percentages: "18.00%" or "28.00%"
 */
export const formatPercent = (rate: number | string | undefined | null): string => {
  if (rate === undefined || rate === null || isNaN(Number(rate))) return '0.00%';
  return `${Number(rate).toFixed(2)}%`;
};

// Backward-compatible alias
export const formatGstRate = formatPercent;

/**
 * Standard Indian date formatting: "12 Sep 2026"
 */
export const formatDate = (dateInput?: string | Date | null): string => {
  if (!dateInput) return '12 Sep 2026';
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) {
      return dateInput.toString();
    }
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateInput.toString();
  }
};

/**
 * Standard Indian date and time formatting: "12 Sep 2026, 03:30 PM"
 */
export const formatDateTime = (dateInput?: string | Date | null, timeStr?: string): string => {
  const dStr = formatDate(dateInput);
  if (timeStr) return `${dStr}, ${timeStr}`;
  return dStr;
};

/**
 * Formats Indian vehicle registration number: "TN 01 AB 1234"
 */
export const formatVehicleNo = (regNo?: string): string => {
  if (!regNo) return '';
  const cleaned = regNo.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  if (cleaned.length >= 8 && cleaned.length <= 11) {
    const state = cleaned.slice(0, 2);
    const rto = cleaned.slice(2, 4);
    const series = cleaned.slice(4, cleaned.length - 4);
    const num = cleaned.slice(-4);
    return `${state} ${rto} ${series} ${num}`.replace(/\s+/g, ' ').trim();
  }
  return regNo.toUpperCase();
};

/**
 * Formats Indian 10-digit mobile number: "+91 98765 43210"
 */
export const formatMobile = (mobile?: string): string => {
  if (!mobile) return '';
  const digits = mobile.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return mobile;
};
