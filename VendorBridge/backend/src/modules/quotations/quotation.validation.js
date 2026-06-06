import { body, param, query, validationResult } from 'express-validator';

/**
 * Quotation Validation Rules
 */

// Submit quotation validation
export const submitQuotationValidation = [
  param('rfqId')
    .isUUID()
    .withMessage('Invalid RFQ ID format'),
  
  body('vendorId')
    .notEmpty()
    .withMessage('Vendor ID is required')
    .isUUID()
    .withMessage('Invalid vendor ID format'),
  
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one quotation item is required'),
  
  body('items.*.rfqItemId')
    .notEmpty()
    .withMessage('RFQ item ID is required')
    .isUUID()
    .withMessage('Invalid RFQ item ID format'),
  
  body('items.*.quotedPrice')
    .isFloat({ min: 0 })
    .withMessage('Quoted price must be a positive number'),
  
  body('items.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  
  body('items.*.deliveryDays')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Delivery days must be a positive integer'),
  
  body('items.*.notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
  
  body('coverLetter')
    .optional()
    .trim()
    .isLength({ min: 10, max: 3000 })
    .withMessage('Cover letter must be between 10 and 3000 characters'),
  
  body('deliveryDays')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Delivery days must be a positive integer'),
  
  body('paymentTerms')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Payment terms must be between 2 and 255 characters'),
  
  body('warranty')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Warranty must be between 2 and 255 characters'),
  
  body('isDraft')
    .optional()
    .isBoolean()
    .withMessage('isDraft must be a boolean'),
];

// Update quotation validation
export const updateQuotationValidation = [
  param('quotationId')
    .isUUID()
    .withMessage('Invalid quotation ID format'),
  
  body('items')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Items must be an array with at least one item'),
  
  body('items.*.quotedPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Quoted price must be a positive number'),
  
  body('items.*.deliveryDays')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Delivery days must be a positive integer'),
  
  body('items.*.notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
  
  body('coverLetter')
    .optional()
    .trim()
    .isLength({ min: 10, max: 3000 })
    .withMessage('Cover letter must be between 10 and 3000 characters'),
  
  body('deliveryDays')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Delivery days must be a positive integer'),
  
  body('paymentTerms')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Payment terms must be between 2 and 255 characters'),
  
  body('warranty')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Warranty must be between 2 and 255 characters'),
];

// Accept/Reject quotation validation
export const updateQuotationStatusValidation = [
  param('quotationId')
    .isUUID()
    .withMessage('Invalid quotation ID format'),
  
  body('status')
    .isIn(['ACCEPTED', 'REJECTED'])
    .withMessage('Status must be either ACCEPTED or REJECTED'),
  
  body('reason')
    .optional()
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage('Reason must be between 5 and 1000 characters'),
];

// Search quotation validation
export const searchQuotationValidation = [
  param('query')
    .trim()
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Search query must be between 2 and 100 characters'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be a positive integer not exceeding 100'),
];

// Pagination validation
export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be a positive integer not exceeding 100'),
];

// Get quotation validation
export const getQuotationValidation = [
  param('quotationId')
    .isUUID()
    .withMessage('Invalid quotation ID format'),
];

// Get RFQ quotations validation
export const getRFQQuotationsValidation = [
  param('rfqId')
    .isUUID()
    .withMessage('Invalid RFQ ID format'),
];

// Delete quotation validation
export const deleteQuotationValidation = [
  param('quotationId')
    .isUUID()
    .withMessage('Invalid quotation ID format'),
];

// Get quotation comparison validation
export const getQuotationComparisonValidation = [
  param('rfqId')
    .isUUID()
    .withMessage('Invalid RFQ ID format'),
];

// Filter quotation validation
export const filterQuotationValidation = [
  param('status')
    .isIn(['DRAFT', 'SUBMITTED', 'ACCEPTED', 'REJECTED', 'EXPIRED'])
    .withMessage('Invalid quotation status'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be a positive integer not exceeding 100'),
];

/**
 * Validation error handler middleware
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};
