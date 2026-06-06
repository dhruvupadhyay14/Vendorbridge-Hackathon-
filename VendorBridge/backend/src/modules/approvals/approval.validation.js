import { body, param, query, validationResult } from 'express-validator';

/**
 * Approval Validation Rules
 */

// Create approval request validation
export const createApprovalValidation = [
  body('rfqId')
    .notEmpty()
    .withMessage('RFQ ID is required')
    .isUUID()
    .withMessage('Invalid RFQ ID format'),
  
  body('quotationId')
    .notEmpty()
    .withMessage('Quotation ID is required')
    .isUUID()
    .withMessage('Invalid quotation ID format'),
  
  body('requiredApprovals')
    .optional()
    .isInt({ min: 1, max: 2 })
    .withMessage('Required approvals must be 1 or 2'),
  
  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Remarks must not exceed 1000 characters'),
];

// Approve/Reject validation
export const updateApprovalStatusValidation = [
  param('approvalId')
    .isUUID()
    .withMessage('Invalid approval ID format'),
  
  body('status')
    .isIn(['L1_APPROVED', 'L2_APPROVED', 'REJECTED'])
    .withMessage('Status must be L1_APPROVED, L2_APPROVED, or REJECTED'),
  
  body('remarks')
    .optional()
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage('Remarks must be between 5 and 1000 characters'),
];

// Get approval by ID validation
export const getApprovalValidation = [
  param('approvalId')
    .isUUID()
    .withMessage('Invalid approval ID format'),
];

// Filter by status validation
export const filterApprovalValidation = [
  param('status')
    .isIn(['PENDING', 'L1_APPROVED', 'L2_APPROVED', 'REJECTED'])
    .withMessage('Invalid approval status'),
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
