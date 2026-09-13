// Standard Validation Utilities for BIKE ERP

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Validates Indian 15-character alphanumeric GSTIN
 * Pattern: 2 digits (State code) + 5 letters (PAN) + 4 digits + 1 letter + 1 char + 'Z' + 1 checksum char
 */
export const validateGstin = (gstin: string, isRequired = false): ValidationResult => {
  if (!gstin || !gstin.trim()) {
    if (isRequired) {
      return { isValid: false, errorMessage: 'GSTIN is required for B2B tax invoice' };
    }
    return { isValid: true };
  }
  const clean = gstin.trim().toUpperCase();
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!gstinRegex.test(clean)) {
    return {
      isValid: false,
      errorMessage: 'Invalid GSTIN format. Example: 33AAAAA0000A1Z5'
    };
  }
  return { isValid: true };
};

/**
 * Validates Indian 10-digit mobile number
 */
export const validateMobile = (mobile: string, isRequired = true): ValidationResult => {
  if (!mobile || !mobile.trim()) {
    if (isRequired) {
      return { isValid: false, errorMessage: 'Mobile number is required' };
    }
    return { isValid: true };
  }
  const digits = mobile.replace(/\D/g, '');
  if (digits.length !== 10) {
    return {
      isValid: false,
      errorMessage: 'Mobile number must be exactly 10 digits'
    };
  }
  if (!/^[6-9]/.test(digits)) {
    return {
      isValid: false,
      errorMessage: 'Mobile number must start with 6, 7, 8, or 9'
    };
  }
  return { isValid: true };
};

/**
 * Validates HSN / SAC code (4, 6 or 8 digits)
 */
export const validateHsn = (hsn: string, isRequired = false): ValidationResult => {
  if (!hsn || !hsn.trim()) {
    if (isRequired) {
      return { isValid: false, errorMessage: 'HSN / SAC code is required' };
    }
    return { isValid: true };
  }
  const clean = hsn.trim();
  if (!/^[0-9]{4}([0-9]{2})?([0-9]{2})?$/.test(clean)) {
    return {
      isValid: false,
      errorMessage: 'HSN code must be 4, 6, or 8 numeric digits (e.g. 8714)'
    };
  }
  return { isValid: true };
};

/**
 * Validates item quantity against available stock
 */
export const validateQuantity = (
  qty: number,
  availableStock?: number,
  allowNegativeStock = false
): ValidationResult => {
  if (qty === undefined || qty === null || isNaN(qty) || qty <= 0) {
    return { isValid: false, errorMessage: 'Quantity must be greater than zero' };
  }
  if (availableStock !== undefined && !allowNegativeStock && qty > availableStock) {
    return {
      isValid: false,
      errorMessage: `Insufficient stock! Only ${availableStock} units available`
    };
  }
  return { isValid: true };
};

/**
 * Validates unit rate / price
 */
export const validateRate = (rate: number, minRate = 0.01): ValidationResult => {
  if (rate === undefined || rate === null || isNaN(rate) || rate < minRate) {
    return { isValid: false, errorMessage: `Unit rate must be at least ₹${minRate.toFixed(2)}` };
  }
  return { isValid: true };
};

/**
 * Validates discount
 */
export const validateDiscount = (
  discountVal: number,
  discountType: 'percentage' | 'fixed',
  subtotal: number,
  maxDiscountPercent = 35
): ValidationResult => {
  if (discountVal < 0) {
    return { isValid: false, errorMessage: 'Discount cannot be negative' };
  }
  if (discountType === 'percentage') {
    if (discountVal > maxDiscountPercent) {
      return {
        isValid: false,
        errorMessage: `Discount exceeds maximum allowed limit (${maxDiscountPercent}%)`
      };
    }
  } else {
    if (discountVal > subtotal) {
      return {
        isValid: false,
        errorMessage: 'Discount amount cannot exceed item subtotal'
      };
    }
  }
  return { isValid: true };
};

/**
 * Validates payment receipt amount against outstanding balance
 */
export const validatePaymentAmount = (
  amount: number,
  outstanding: number
): ValidationResult => {
  if (amount <= 0) {
    return { isValid: false, errorMessage: 'Payment amount must be greater than zero' };
  }
  if (amount > outstanding) {
    return {
      isValid: false,
      errorMessage: `Amount exceeds current outstanding balance of ₹${outstanding.toLocaleString('en-IN')}`
    };
  }
  return { isValid: true };
};
