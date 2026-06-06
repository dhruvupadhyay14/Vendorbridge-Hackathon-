import * as quotationService from './quotation.service.js';
import * as comparisonService from './quotationComparison.service.js';
import { successResponse, createdResponse, errorResponse } from '../../utils/response.js';
import { getPaginationParams } from '../../utils/pagination.js';
import { AppError } from '../../middleware/errorHandler.js';
import asyncHandler from '../../utils/asyncHandler.js';

/**
 * Quotation Controller
 * Handles all HTTP requests for Quotation module
 */

// ============================================================================
// CREATE OPERATIONS
// ============================================================================

/**
 * Submit Quotation
 * POST /quotations/rfqs/:rfqId
 */
export const submitQuotation = asyncHandler(async (req, res) => {
  const { rfqId } = req.params;
  const { vendorId, items, coverLetter, deliveryDays, paymentTerms, warranty, isDraft } =
    req.body;

  const quotation = await quotationService.submitQuotation(rfqId, vendorId, {
    items,
    coverLetter,
    deliveryDays,
    paymentTerms,
    warranty,
    isDraft,
  });

  const statusMessage = isDraft
    ? 'Quotation saved as draft'
    : 'Quotation submitted successfully';

  res.status(201).json(createdResponse(quotation, statusMessage));
});

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Get All Quotations
 * GET /quotations
 */
export const getAllQuotations = asyncHandler(async (req, res) => {
  const { page, limit } = getPaginationParams(req.query);
  const { status, search, sortBy, order } = req.query;

  const { quotations, total } = await quotationService.getAllQuotations({
    page,
    limit,
    status,
    search,
    sortBy: sortBy || 'submittedAt',
    order: order || 'desc',
  });

  const pages = Math.ceil(total / limit);

  res.json(
    successResponse(
      quotations,
      'Quotations fetched successfully',
      {
        page,
        limit,
        total,
        pages,
        hasNextPage: page < pages,
        hasPrevPage: page > 1,
      }
    )
  );
});

/**
 * Get Quotation by ID
 * GET /quotations/:quotationId
 */
export const getQuotation = asyncHandler(async (req, res) => {
  const { quotationId } = req.params;

  const quotation = await quotationService.getQuotationById(quotationId);
  if (!quotation) {
    throw new AppError('Quotation not found', 404);
  }

  res.json(successResponse(quotation, 'Quotation fetched successfully'));
});

/**
 * Get RFQ Quotations
 * GET /quotations/rfqs/:rfqId
 */
export const getRFQQuotations = asyncHandler(async (req, res) => {
  const { rfqId } = req.params;
  const { page, limit } = getPaginationParams(req.query);
  const { status } = req.query;

  const { quotations, total } = await quotationService.getQuotationsByRFQ(rfqId, {
    page,
    limit,
    status,
  });

  const pages = Math.ceil(total / limit);

  res.json(
    successResponse(
      quotations,
      'RFQ quotations fetched successfully',
      {
        page,
        limit,
        total,
        pages,
        hasNextPage: page < pages,
        hasPrevPage: page > 1,
      }
    )
  );
});

/**
 * Get Vendor Quotations
 * GET /quotations/vendor/:vendorId
 */
export const getVendorQuotations = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const { page, limit } = getPaginationParams(req.query);
  const { status, sortBy, order } = req.query;

  const { quotations, total } = await quotationService.getVendorQuotations(vendorId, {
    page,
    limit,
    status,
    sortBy: sortBy || 'submittedAt',
    order: order || 'desc',
  });

  const pages = Math.ceil(total / limit);

  res.json(
    successResponse(
      quotations,
      'Vendor quotations fetched successfully',
      {
        page,
        limit,
        total,
        pages,
        hasNextPage: page < pages,
        hasPrevPage: page > 1,
      }
    )
  );
});

/**
 * Search Quotations
 * GET /quotations/search/:query
 */
export const searchQuotations = asyncHandler(async (req, res) => {
  const { query } = req.params;
  const { page, limit } = getPaginationParams(req.query);

  const { quotations, total } = await quotationService.searchQuotations(query, {
    page,
    limit,
  });

  const pages = Math.ceil(total / limit);

  res.json(
    successResponse(
      quotations,
      'Search results fetched successfully',
      {
        page,
        limit,
        total,
        pages,
        hasNextPage: page < pages,
        hasPrevPage: page > 1,
      }
    )
  );
});

/**
 * Filter Quotations by Status
 * GET /quotations/filter/status/:status
 */
export const filterByStatus = asyncHandler(async (req, res) => {
  const { status } = req.params;
  const { page, limit } = getPaginationParams(req.query);

  const { quotations, total } = await quotationService.filterQuotationsByStatus(status, {
    page,
    limit,
  });

  const pages = Math.ceil(total / limit);

  res.json(
    successResponse(
      quotations,
      `Quotations with status ${status} fetched successfully`,
      {
        page,
        limit,
        total,
        pages,
        hasNextPage: page < pages,
        hasPrevPage: page > 1,
      }
    )
  );
});

/**
 * Get Quotation Statistics
 * GET /quotations/stats/summary
 */
export const getQuotationStats = asyncHandler(async (req, res) => {
  const stats = await quotationService.getQuotationStats();

  res.json(successResponse(stats, 'Quotation statistics fetched successfully'));
});

// ============================================================================
// COMPARISON ENGINE
// ============================================================================

/**
 * Analyze Quotations - Comparison Engine
 * GET /quotations/rfqs/:rfqId/analysis
 */
export const analyzeQuotations = asyncHandler(async (req, res) => {
  const { rfqId } = req.params;

  const analysis = await comparisonService.analyzeQuotations(rfqId);

  res.json(
    successResponse(
      analysis,
      'Quotation analysis completed successfully'
    )
  );
});

/**
 * Get Top Quotations
 * GET /quotations/rfqs/:rfqId/top
 */
export const getTopQuotations = asyncHandler(async (req, res) => {
  const { rfqId } = req.params;
  const limit = req.query.limit ? parseInt(req.query.limit) : 5;

  const topQuotations = await comparisonService.getTopQuotations(rfqId);
  const limited = topQuotations.slice(0, Math.min(limit, topQuotations.length));

  res.json(
    successResponse(
      limited,
      `Top ${limited.length} quotations fetched successfully`
    )
  );
});

/**
 * Get Category Winner
 * GET /quotations/rfqs/:rfqId/winner/:category
 */
export const getCategoryWinner = asyncHandler(async (req, res) => {
  const { rfqId, category } = req.params;

  const result = await comparisonService.getCategoryWinner(rfqId, category);

  res.json(
    successResponse(
      result,
      `${category} category winner determined`
    )
  );
});

/**
 * Compare Two Quotations
 * POST /quotations/compare
 */
export const compareQuotations = asyncHandler(async (req, res) => {
  const { quotationId1, quotationId2 } = req.body;

  if (!quotationId1 || !quotationId2) {
    throw new AppError('Both quotation IDs are required', 400);
  }

  const comparison = await comparisonService.compareQuotations(quotationId1, quotationId2);

  res.json(
    successResponse(
      comparison,
      'Quotations compared successfully'
    )
  );
});

/**
 * Get Performance Report
 * GET /quotations/rfqs/:rfqId/report
 */
export const getPerformanceReport = asyncHandler(async (req, res) => {
  const { rfqId } = req.params;

  const report = await comparisonService.getPerformanceReport(rfqId);

  res.json(
    successResponse(
      report,
      'Performance report generated successfully'
    )
  );
});

// ============================================================================
// UPDATE OPERATIONS
// ============================================================================

/**
 * Update Quotation
 * PUT /quotations/:quotationId
 */
export const updateQuotation = asyncHandler(async (req, res) => {
  const { quotationId } = req.params;
  const updateData = req.body;

  // Check if quotation exists
  const quotation = await quotationService.getQuotationById(quotationId);
  if (!quotation) {
    throw new AppError('Quotation not found', 404);
  }

  // Check authorization - vendor can only update their own draft quotations
  if (quotation.vendorId !== req.user.id && req.user.role !== 'ADMIN') {
    throw new AppError('You do not have permission to update this quotation', 403);
  }

  const updatedQuotation = await quotationService.updateQuotation(quotationId, updateData);

  res.json(successResponse(updatedQuotation, 'Quotation updated successfully'));
});

/**
 * Update Quotation Status (Submit Draft)
 * PATCH /quotations/:quotationId/submit
 */
export const submitDraftQuotation = asyncHandler(async (req, res) => {
  const { quotationId } = req.params;

  // Check if quotation exists
  const quotation = await quotationService.getQuotationById(quotationId);
  if (!quotation) {
    throw new AppError('Quotation not found', 404);
  }

  // Check authorization
  if (quotation.vendorId !== req.user.id && req.user.role !== 'ADMIN') {
    throw new AppError('You do not have permission to submit this quotation', 403);
  }

  if (quotation.status !== 'DRAFT') {
    throw new AppError('Only draft quotations can be submitted', 400);
  }

  const updated = await quotationService.updateQuotationStatus(quotationId, 'SUBMITTED');

  res.json(successResponse(updated, 'Quotation submitted successfully'));
});

/**
 * Accept Quotation
 * PATCH /quotations/:quotationId/accept
 */
export const acceptQuotation = asyncHandler(async (req, res) => {
  const { quotationId } = req.params;

  // Check if quotation exists
  const quotation = await quotationService.getQuotationById(quotationId);
  if (!quotation) {
    throw new AppError('Quotation not found', 404);
  }

  if (quotation.status === 'ACCEPTED') {
    throw new AppError('Quotation is already accepted', 400);
  }

  if (quotation.status === 'REJECTED') {
    throw new AppError('Cannot accept a rejected quotation', 400);
  }

  const updated = await quotationService.updateQuotationStatus(quotationId, 'ACCEPTED');

  res.json(successResponse(updated, 'Quotation accepted successfully'));
});

/**
 * Reject Quotation
 * PATCH /quotations/:quotationId/reject
 */
export const rejectQuotation = asyncHandler(async (req, res) => {
  const { quotationId } = req.params;
  const { reason } = req.body;

  // Check if quotation exists
  const quotation = await quotationService.getQuotationById(quotationId);
  if (!quotation) {
    throw new AppError('Quotation not found', 404);
  }

  if (quotation.status === 'REJECTED') {
    throw new AppError('Quotation is already rejected', 400);
  }

  const updated = await quotationService.updateQuotationStatus(quotationId, 'REJECTED', reason);

  res.json(
    successResponse(updated, 'Quotation rejected successfully')
  );
});

// ============================================================================
// DELETE OPERATIONS
// ============================================================================

/**
 * Delete Quotation
 * DELETE /quotations/:quotationId
 */
export const deleteQuotation = asyncHandler(async (req, res) => {
  const { quotationId } = req.params;

  // Check if quotation exists
  const quotation = await quotationService.getQuotationById(quotationId);
  if (!quotation) {
    throw new AppError('Quotation not found', 404);
  }

  // Check authorization - vendor can only delete their own draft quotations
  if (quotation.vendorId !== req.user.id && req.user.role !== 'ADMIN') {
    throw new AppError('You do not have permission to delete this quotation', 403);
  }

  // Can only delete draft quotations
  if (quotation.status !== 'DRAFT') {
    throw new AppError('Only draft quotations can be deleted', 400);
  }

  await quotationService.deleteQuotation(quotationId);

  res.json(successResponse(null, 'Quotation deleted successfully'));
});
