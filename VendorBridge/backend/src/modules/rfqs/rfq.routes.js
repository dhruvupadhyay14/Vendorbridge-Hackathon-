import express from 'express';
import * as rfqController from './rfq.controller.js';
import * as rfqValidation from './rfq.validation.js';
import { authenticate } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/roleMiddleware.js';

const router = express.Router();

/**
 * RFQ Routes
 * Base: /api/rfqs
 */

// ============================================================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================================================

/**
 * GET /api/rfqs/stats/summary
 * Get RFQ statistics
 */
router.get(
  '/stats/summary',
  rfqController.getRFQStats
);

/**
 * GET /api/rfqs/search/:query
 * Search RFQs
 */
router.get(
  '/search/:query',
  rfqValidation.searchRFQValidation,
  rfqValidation.handleValidationErrors,
  rfqController.searchRFQs
);

/**
 * GET /api/rfqs/filter/status/:status
 * Filter RFQs by status
 */
router.get(
  '/filter/status/:status',
  rfqValidation.filterRFQValidation,
  rfqValidation.handleValidationErrors,
  rfqController.filterByStatus
);

/**
 * GET /api/rfqs
 * Get all RFQs with pagination and filtering
 */
router.get(
  '/',
  rfqValidation.paginationValidation,
  rfqValidation.handleValidationErrors,
  rfqController.getAllRFQs
);

/**
 * GET /api/rfqs/:rfqId
 * Get RFQ by ID
 */
router.get(
  '/:rfqId',
  rfqValidation.getRFQValidation,
  rfqValidation.handleValidationErrors,
  rfqController.getRFQ
);

/**
 * GET /api/rfqs/:rfqId/items
 * Get RFQ items
 */
router.get(
  '/:rfqId/items',
  rfqValidation.getRFQValidation,
  rfqValidation.handleValidationErrors,
  rfqController.getRFQItems
);

/**
 * GET /api/rfqs/:rfqId/vendors
 * Get vendors assigned to RFQ
 */
router.get(
  '/:rfqId/vendors',
  rfqValidation.getRFQValidation,
  rfqValidation.handleValidationErrors,
  rfqController.getAssignedVendors
);

// ============================================================================
// PROTECTED ROUTES (Requires Authentication)
// ============================================================================

/**
 * GET /api/rfqs/my
 * Get current user's RFQs
 */
router.get(
  '/my',
  authenticate,
  rfqValidation.paginationValidation,
  rfqValidation.handleValidationErrors,
  rfqController.getMyRFQs
);

/**
 * POST /api/rfqs
 * Create new RFQ
 */
router.post(
  '/',
  authenticate,
  rfqValidation.createRFQValidation,
  rfqValidation.handleValidationErrors,
  rfqController.createRFQ
);

/**
 * PUT /api/rfqs/:rfqId
 * Update RFQ
 */
router.put(
  '/:rfqId',
  authenticate,
  rfqValidation.updateRFQValidation,
  rfqValidation.handleValidationErrors,
  rfqController.updateRFQ
);

/**
 * PATCH /api/rfqs/:rfqId/publish
 * Publish RFQ (change from DRAFT to PUBLISHED)
 */
router.patch(
  '/:rfqId/publish',
  authenticate,
  rfqValidation.publishRFQValidation,
  rfqValidation.handleValidationErrors,
  rfqController.publishRFQ
);

/**
 * PATCH /api/rfqs/:rfqId/close
 * Close RFQ
 */
router.patch(
  '/:rfqId/close',
  authenticate,
  rfqValidation.publishRFQValidation,
  rfqValidation.handleValidationErrors,
  rfqController.closeRFQ
);

/**
 * DELETE /api/rfqs/:rfqId
 * Delete RFQ (only DRAFT RFQs can be deleted)
 */
router.delete(
  '/:rfqId',
  authenticate,
  rfqValidation.deleteRFQValidation,
  rfqValidation.handleValidationErrors,
  rfqController.deleteRFQ
);

/**
 * POST /api/rfqs/:rfqId/items
 * Add items to RFQ
 */
router.post(
  '/:rfqId/items',
  authenticate,
  rfqValidation.addRFQItemsValidation,
  rfqValidation.handleValidationErrors,
  rfqController.addRFQItems
);

/**
 * DELETE /api/rfqs/:rfqId/items/:itemId
 * Delete RFQ item
 */
router.delete(
  '/:rfqId/items/:itemId',
  authenticate,
  rfqValidation.deleteRFQValidation,
  rfqValidation.handleValidationErrors,
  rfqController.deleteRFQItem
);

/**
 * POST /api/rfqs/:rfqId/vendors
 * Assign vendors to RFQ
 */
router.post(
  '/:rfqId/vendors',
  authenticate,
  rfqValidation.assignVendorsValidation,
  rfqValidation.handleValidationErrors,
  rfqController.assignVendors
);

/**
 * DELETE /api/rfqs/:rfqId/vendors/:vendorId
 * Remove vendor from RFQ
 */
router.delete(
  '/:rfqId/vendors/:vendorId',
  authenticate,
  rfqValidation.removeVendorValidation,
  rfqValidation.handleValidationErrors,
  rfqController.removeVendor
);

export default router;
