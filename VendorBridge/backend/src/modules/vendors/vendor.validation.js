import { body } from 'express-validator';

/**
 * Validation rules for vendor endpoints
 */

// ============== CREATE VENDOR VALIDATION ==============

export const createVendorValidation = () => [
  body('companyName')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Company name must be between 2 and 255 characters'),

  body('registrationNumber')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Registration number must not exceed 100 characters'),

  body('taxId')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Tax ID must not exceed 100 characters'),

  body('gstNumber')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('GST number must not exceed 50 characters'),

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  body('phone')
    .trim()
    .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)
    .withMessage('Please provide a valid phone number'),

  body('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please provide a valid website URL'),

  body('contactPersonName')
    .trim()
    .notEmpty()
    .withMessage('Contact person name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Contact person name must be between 2 and 255 characters'),

  body('contactPersonEmail')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid contact person email'),

  body('contactPersonPhone')
    .trim()
    .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)
    .withMessage('Please provide a valid contact person phone number'),

  body('street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required')
    .isLength({ max: 255 })
    .withMessage('Street address must not exceed 255 characters'),

  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required')
    .isLength({ max: 100 })
    .withMessage('City must not exceed 100 characters'),

  body('state')
    .trim()
    .notEmpty()
    .withMessage('State is required')
    .isLength({ max: 100 })
    .withMessage('State must not exceed 100 characters'),

  body('country')
    .trim()
    .notEmpty()
    .withMessage('Country is required')
    .isLength({ max: 100 })
    .withMessage('Country must not exceed 100 characters'),

  body('postalCode')
    .trim()
    .notEmpty()
    .withMessage('Postal code is required')
    .isLength({ max: 20 })
    .withMessage('Postal code must not exceed 20 characters'),

  body('category')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Category must not exceed 100 characters'),
];

// ============== UPDATE VENDOR VALIDATION ==============

export const updateVendorValidation = () => [
  body('companyName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Company name cannot be empty')
    .isLength({ min: 2, max: 255 })
    .withMessage('Company name must be between 2 and 255 characters'),

  body('taxId')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Tax ID must not exceed 100 characters'),

  body('phone')
    .optional()
    .trim()
    .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)
    .withMessage('Please provide a valid phone number'),

  body('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please provide a valid website URL'),

  body('contactPersonName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Contact person name cannot be empty')
    .isLength({ min: 2, max: 255 })
    .withMessage('Contact person name must be between 2 and 255 characters'),

  body('contactPersonEmail')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid contact person email'),

  body('contactPersonPhone')
    .optional()
    .trim()
    .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)
    .withMessage('Please provide a valid contact person phone number'),

  body('street')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Street address must be between 1 and 255 characters'),

  body('city')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('City must be between 1 and 100 characters'),

  body('state')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('State must be between 1 and 100 characters'),

  body('country')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Country must be between 1 and 100 characters'),

  body('postalCode')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Postal code must be between 1 and 20 characters'),

  body('companyLogo')
    .optional()
    .trim()
    .isURL()
    .withMessage('Company logo must be a valid URL'),
];

// ============== UPDATE STATUS VALIDATION ==============

export const updateStatusValidation = () => [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'SUSPENDED', 'INACTIVE'])
    .withMessage('Invalid status. Must be one of: PENDING, APPROVED, REJECTED, ACTIVE, SUSPENDED, INACTIVE'),
];

// ============== SEARCH VALIDATION ==============

export const searchValidation = () => [
  body('query')
    .trim()
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 2 })
    .withMessage('Search query must be at least 2 characters'),
];

// ============== PAGINATION VALIDATION ==============

export const paginationValidation = () => [
  body('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

// ============== FILTER VALIDATION ==============

export const filterValidation = () => [
  body('status')
    .optional()
    .isIn(['PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'SUSPENDED', 'INACTIVE'])
    .withMessage('Invalid status filter'),

  body('country')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Country must be at least 2 characters'),

  body('city')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('City must be at least 2 characters'),

  body('minRating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Minimum rating must be between 0 and 5'),

  body('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'companyName', 'ratingScore', 'totalSpent'])
    .withMessage('Invalid sort field'),

  body('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc'),
];
