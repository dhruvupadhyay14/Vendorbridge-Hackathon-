import { body, param, query, validationResult } from 'express-validator';

/**
 * Purchase Order Validation Rules
 */

export const createPOValidation = [
  body('quotationId')
    .notEmpty()
    .withMessage('Quotation ID is required')
    .isUUID()
    .withMessage('Invalid Quotation ID format'),
];

export const getPOValidation = [
  param('poId')
    .isUUID()
    .withMessage('Invalid Purchase Order ID format'),
];

export const listPOValidation = [
  query('status')
    .optional()
    .isIn(['DRAFT', 'SUBMITTED', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED', 'COMPLETED'])
    .withMessage('Invalid PO status'),

  query('vendorId')
    .optional()
    .isUUID()
    .withMessage('Invalid vendor ID format'),
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
        field: err.param || err.path,
        message: err.msg,
      })),
    });
  }
  next();
};
