/**
 * Utility functions for VendorBridge ERP.
 * Implements Indian currency formatting and robust validation helpers.
 */

/**
 * Formats a number to Indian Rupee (INR) currency format with proper grouping (e.g. ₹1,25,000.00).
 */
export const formatINR = (value: number): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '₹0.00';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Formats a number with Indian comma grouping without the currency symbol (e.g. 1,25,000.00).
 */
export const formatIndianNumber = (value: number): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '0.00';
  }
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

/**
 * Validates a business/corporate email syntax.
 */
export const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
};

/**
 * Validates corporate/office telephone numbers (supports Indian standards +91, 10-digit mobile, and international formats).
 */
export const isValidPhone = (phone: string): boolean => {
  if (!phone) return false;
  // Lenient phone checklist: matches ten digits, or with optional country codes (+ or digits)
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
};

/**
 * Validates Indian GSTIN (15 character alphanumeric of standard format: 29AAAAA1111A1Z1).
 * Format:
 *  - 2 digits (state code)
 *  - 5 letters (PAN letters)
 *  - 4 digits (PAN number)
 *  - 1 letter (PAN check char)
 *  - 1 digit/alphanumeric (entity count)
 *  - 1 character (default 'Z' or alphanumeric)
 *  - 1 character (checksum)
 */
export const isValidGSTIN = (gst: string): boolean => {
  if (!gst) return false;
  const gstClean = gst.trim().toUpperCase();
  if (gstClean.length !== 15) return false;
  
  // High-fidelity standard Indian GSTIN regex
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z|A-Z0-9]{1}[0-9A-Z]{1}$/;
  return gstRegex.test(gstClean);
};

/**
 * Validates Indian PAN (10 character alphanumeric: 5 letters, 4 digits, 1 letter).
 */
export const isValidPAN = (pan: string): boolean => {
  if (!pan) return false;
  const panClean = pan.trim().toUpperCase();
  if (panClean.length !== 10) return false;
  
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(panClean);
};
