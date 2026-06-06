import express from 'express';
import * as quotationController from './quotation.controller.js';
import * as quotationValidation from './quotation.validation.js';
import { authenticate } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/roleMiddleware.js';

const router = express.Router();

/**
 * Quotation Routes
 * Base: /api/quotations
 */

// ============================================================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================================================

/**
 * GET /api/quotations/stats/summary
 * Get quotation statistics
 */
router.get(
  '/stats/summary',
  quotationController.getQuotationStats
);

/**
 * GET /api/quotations/search/:query
 * Search quotations
 */
router.get(
  '/search/:query',
  quotationValidation.searchQuotationValidation,
  quotationValidation.handleValidationErrors,
  quotationController.searchQuotations
);

/**
 * GET /api/quotations/filter/status/:status
 * Filter quotations by status
 */
router.get(
  '/filter/status/:status',
  quotationValidation.filterQuotationValidation,
  quotationValidation.handleValidationErrors,
  quotationController.filterByStatus
);

/**
 * GET /api/quotations
 * Get all quotations
 */
router.get(
  '/',
  quotationValidation.paginationValidation,
  quotationValidation.handleValidationErrors,
  quotationController.getAllQuotations
);

/**
 * GET /api/quotations/:quotationId
 * Get quotation by ID
 */
router.get(
  '/:quotationId',
  quotationValidation.getQuotationValidation,
  quotationValidation.handleValidationErrors,
  quotationController.getQuotation
);

/**
 * POST /api/quotations/compare
 * Compare two quotations
 */
router.post(
  '/compare',
  quotationController.compareQuotations
);

/**
 * GET /api/quotations/rfqs/:rfqId/analysis
 * Analyze quotations for RFQ (comparison engine)
 */
router.get(
  '/rfqs/:rfqId/analysis',
  quotationValidation.getRFQQuotationsValidation,
  quotationValidation.handleValidationErrors,
  quotationController.analyzeQuotations
);

/**
 * GET /api/quotations/rfqs/:rfqId/top
 * Get top quotations for RFQ
 */
router.get(
  '/rfqs/:rfqId/top',
  quotationValidation.getRFQQuotationsValidation,
  quotationValidation.handleValidationErrors,
  quotationController.getTopQuotations
);

/**
 * GET /api/quotations/rfqs/:rfqId/winner/:category
 * Get category winner for RFQ
 */
router.get(
  '/rfqs/:rfqId/winner/:category',
  quotationValidation.getRFQQuotationsValidation,
  quotationValidation.handleValidationErrors,
  quotationController.getCategoryWinner
);

/**
 * GET /api/quotations/rfqs/:rfqId/report
 * Get performance report for RFQ
 */
router.get(
  '/rfqs/:rfqId/report',
  quotationValidation.getRFQQuotationsValidation,
  quotationValidation.handleValidationErrors,
  quotationController.getPerformanceReport
);

/**
 * GET /api/quotations/rfqs/:rfqId
 * Get quotations for RFQ
 */
router.get(
  '/rfqs/:rfqId',
  quotationValidation.getRFQQuotationsValidation,
  quotationValidation.handleValidationErrors,
  quotationController.getRFQQuotations
);

/**
 * GET /api/quotations/vendor/:vendorId
 * Get vendor quotations
 */
router.get(
  '/vendor/:vendorId',
  quotationValidation.paginationValidation,
  quotationValidation.handleValidationErrors,
  quotationController.getVendorQuotations
);

// ============================================================================
// PROTECTED ROUTES (Requires Authentication)
// ============================================================================

/**
 * POST /api/quotations/rfqs/:rfqId
 * Submit quotation
 */
router.post(
  '/rfqs/:rfqId',
  authenticate,
  quotationValidation.submitQuotationValidation,
  quotationValidation.handleValidationErrors,
  quotationController.submitQuotation
);

/**
 * PUT /api/quotations/:quotationId
 * Update quotation
 */
router.put(
  '/:quotationId',
  authenticate,
  quotationValidation.updateQuotationValidation,
  quotationValidation.handleValidationErrors,
  quotationController.updateQuotation
);

/**
 * PATCH /api/quotations/:quotationId/submit
 * Submit draft quotation
 */
router.patch(
  '/:quotationId/submit',
  authenticate,
  quotationValidation.getQuotationValidation,
  quotationValidation.handleValidationErrors,
  quotationController.submitDraftQuotation
);

/**
 * PATCH /api/quotations/:quotationId/accept
 * Accept quotation
 */
router.patch(
  '/:quotationId/accept',
  authenticate,
  quotationValidation.getQuotationValidation,
  quotationValidation.handleValidationErrors,
  quotationController.acceptQuotation
);

/**
 * PATCH /api/quotations/:quotationId/reject
 * Reject quotation
 */
router.patch(
  '/:quotationId/reject',
  authenticate,
  quotationValidation.updateQuotationStatusValidation,
  quotationValidation.handleValidationErrors,
  quotationController.rejectQuotation
);

/**
 * DELETE /api/quotations/:quotationId
 * Delete quotation (draft only)
 */
router.delete(
  '/:quotationId',
  authenticate,
  quotationValidation.deleteQuotationValidation,
  quotationValidation.handleValidationErrors,
  quotationController.deleteQuotation
);

export default router;
