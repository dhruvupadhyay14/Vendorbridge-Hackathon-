import { body, param, query, validationResult } from 'express-validator';

/**
 * RFQ Validation Rules
 */

// Create RFQ validation
export const createRFQValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('RFQ title is required')
    .isLength({ min: 5, max: 255 })
    .withMessage('Title must be between 5 and 255 characters'),
  
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Category must be between 2 and 100 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Description must be between 10 and 5000 characters'),
  
  body('deadline')
    .notEmpty()
    .withMessage('Deadline is required')
    .isISO8601()
    .withMessage('Invalid deadline date format')
    .custom((value) => {
      const deadline = new Date(value);
      const now = new Date();
      if (deadline <= now) {
        throw new Error('Deadline must be in the future');
      }
      return true;
    }),
  
  body('budgetMin')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Budget minimum must be a positive number'),
  
  body('budgetMax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Budget maximum must be a positive number')
    .custom((value, { req }) => {
      if (req.body.budgetMin && value && value < req.body.budgetMin) {
        throw new Error('Budget maximum must be greater than or equal to minimum');
      }
      return true;
    }),
  
  body('deliveryLocation')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Delivery location must be between 2 and 255 characters'),
  
  body('preferredVendorTypes')
    .optional()
    .isArray()
    .withMessage('Preferred vendor types must be an array'),
  
  body('isDraft')
    .optional()
    .isBoolean()
    .withMessage('isDraft must be a boolean'),
];

// Update RFQ validation
export const updateRFQValidation = [
  param('rfqId')
    .isUUID()
    .withMessage('Invalid RFQ ID format'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 255 })
    .withMessage('Title must be between 5 and 255 characters'),
  
  body('category')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category must be between 2 and 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Description must be between 10 and 5000 characters'),
  
  body('deadline')
    .optional()
    .isISO8601()
    .withMessage('Invalid deadline date format')
    .custom((value) => {
      const deadline = new Date(value);
      const now = new Date();
      if (deadline <= now) {
        throw new Error('Deadline must be in the future');
      }
      return true;
    }),
  
  body('budgetMin')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Budget minimum must be a positive number'),
  
  body('budgetMax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Budget maximum must be a positive number')
    .custom((value, { req }) => {
      if (req.body.budgetMin && value && value < req.body.budgetMin) {
        throw new Error('Budget maximum must be greater than or equal to minimum');
      }
      return true;
    }),
  
  body('deliveryLocation')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Delivery location must be between 2 and 255 characters'),
];

// Publish RFQ validation
export const publishRFQValidation = [
  param('rfqId')
    .isUUID()
    .withMessage('Invalid RFQ ID format'),
];

// Assign vendors validation
export const assignVendorsValidation = [
  param('rfqId')
    .isUUID()
    .withMessage('Invalid RFQ ID format'),
  
  body('vendorIds')
    .isArray({ min: 1 })
    .withMessage('At least one vendor ID is required')
    .custom((value) => {
      if (!Array.isArray(value)) {
        throw new Error('Vendor IDs must be an array');
      }
      for (const id of value) {
        if (!id || typeof id !== 'string') {
          throw new Error('All vendor IDs must be valid strings');
        }
      }
      return true;
    }),
];

// Remove vendor validation
export const removeVendorValidation = [
  param('rfqId')
    .isUUID()
    .withMessage('Invalid RFQ ID format'),
  
  param('vendorId')
    .isUUID()
    .withMessage('Invalid vendor ID format'),
];

// Search RFQ validation
export const searchRFQValidation = [
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

// Filter validation
export const filterRFQValidation = [
  param('status')
    .isIn(['DRAFT', 'PUBLISHED', 'CLOSED', 'CANCELLED', 'AWARDED'])
    .withMessage('Invalid RFQ status'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be a positive integer not exceeding 100'),
];

// Get RFQ by ID validation
export const getRFQValidation = [
  param('rfqId')
    .isUUID()
    .withMessage('Invalid RFQ ID format'),
];

// Add RFQ items validation
export const addRFQItemsValidation = [
  param('rfqId')
    .isUUID()
    .withMessage('Invalid RFQ ID format'),
  
  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),
  
  body('items.*.description')
    .notEmpty()
    .withMessage('Item description is required')
    .isLength({ min: 3, max: 500 })
    .withMessage('Description must be between 3 and 500 characters'),
  
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  
  body('items.*.unit')
    .notEmpty()
    .withMessage('Unit is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Unit must be between 1 and 50 characters'),
  
  body('items.*.estimatedBudget')
    .isFloat({ min: 0 })
    .withMessage('Estimated budget must be a positive number'),
];

// Delete RFQ validation
export const deleteRFQValidation = [
  param('rfqId')
    .isUUID()
    .withMessage('Invalid RFQ ID format'),
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
