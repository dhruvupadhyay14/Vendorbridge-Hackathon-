import express from 'express';
import { validationResult } from 'express-validator';
import { authenticate } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/roleMiddleware.js';
import * as vendorController from './vendor.controller.js';
import * as vendorValidation from './vendor.validation.js';

const router = express.Router();

/**
 * Validation error handler middleware
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value,
      })),
    });
  }
  next();
};

// ============== PUBLIC ROUTES ==============

/**
 * GET /vendors
 * Get all vendors (public - no auth required)
 * Query params: page, limit, search, status, country, sortBy, order
 */
router.get(
  '/',
  vendorController.getAllVendors
);

/**
 * GET /vendors/stats/summary
 * Get vendor statistics (must be before /:vendorId route)
 */
router.get(
  '/stats/summary',
  vendorController.getVendorStats
);

/**
 * GET /vendors/:vendorId
 * Get vendor by ID
 */
router.get(
  '/:vendorId',
  vendorController.getVendorById
);

/**
 * GET /vendors/search/:query
 * Search vendors (must be before general filter routes)
 */
router.get(
  '/search/:query',
  vendorController.searchVendors
);

/**
 * GET /vendors/filter/status/:status
 * Get vendors by status
 */
router.get(
  '/filter/status/:status',
  vendorController.getVendorsByStatus
);

// ============== PROTECTED ROUTES (AUTHENTICATION REQUIRED) ==============

/**
 * POST /vendors
 * Create new vendor
 * Any authenticated user can create vendor
 */
router.post(
  '/',
  authenticate,
  vendorValidation.createVendorValidation(),
  handleValidationErrors,
  vendorController.createVendor
);

/**
 * PUT /vendors/:vendorId
 * Update vendor
 * Only vendor owner or admin can update
 */
router.put(
  '/:vendorId',
  authenticate,
  vendorValidation.updateVendorValidation(),
  handleValidationErrors,
  vendorController.updateVendor
);

/**
 * DELETE /vendors/:vendorId
 * Delete vendor (soft delete)
 * Only admin can delete
 */
router.delete(
  '/:vendorId',
  authenticate,
  authorize('ADMIN'),
  vendorController.deleteVendor
);

/**
 * PATCH /vendors/:vendorId/status
 * Update vendor status
 * Only admin can update status
 */
router.patch(
  '/:vendorId/status',
  authenticate,
  authorize('ADMIN'),
  vendorValidation.updateStatusValidation(),
  handleValidationErrors,
  vendorController.updateVendorStatus
);

export default router;
