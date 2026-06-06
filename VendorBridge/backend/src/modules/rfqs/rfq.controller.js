import * as rfqService from './rfq.service.js';
import { successResponse, createdResponse, errorResponse } from '../../utils/response.js';
import { getPaginationParams } from '../../utils/pagination.js';
import { AppError } from '../../middleware/errorHandler.js';
import asyncHandler from '../../utils/asyncHandler.js';

/**
 * RFQ Controller
 * Handles all HTTP requests for RFQ module
 */

// ============================================================================
// CREATE OPERATIONS
// ============================================================================

/**
 * Create RFQ
 * POST /rfqs
 */
export const createRFQ = asyncHandler(async (req, res) => {
  const { title, category, description, deadline, budgetMin, budgetMax, deliveryLocation, preferredVendorTypes, isDraft } = req.body;
  const userId = req.user.id;

  const rfq = await rfqService.createRFQ(
    {
      title,
      category,
      description,
      deadline,
      budgetMin,
      budgetMax,
      deliveryLocation,
      preferredVendorTypes,
      isDraft,
    },
    userId
  );

  res.status(201).json(
    createdResponse(rfq, `RFQ created successfully with status: ${rfq.status}`)
  );
});

/**
 * Add RFQ Items
 * POST /rfqs/:rfqId/items
 */
export const addRFQItems = asyncHandler(async (req, res) => {
  const { rfqId } = req.params;
  const { items } = req.body;

  // Check if RFQ exists
  const rfq = await rfqService.getRFQById(rfqId);
  if (!rfq) {
    throw new AppError('RFQ not found', 404);
  }

  // Only creator or admin can add items
  if (rfq.createdById !== req.user.id && req.user.role !== 'ADMIN') {
    throw new AppError('You do not have permission to add items to this RFQ', 403);
  }

  const createdItems = await rfqService.addRFQItems(rfqId, items);

  res.status(201).json(
    createdResponse(createdItems, `${createdItems.length} items added to RFQ successfully`)
  );
});

/**
 * Assign Vendors to RFQ
 * POST /rfqs/:rfqId/vendors
 */
export const assignVendors = asyncHandler(async (req, res) => {
  const { rfqId } = req.params;
  const { vendorIds } = req.body;

  // Check if RFQ exists
  const rfq = await rfqService.getRFQById(rfqId);
  if (!rfq) {
    throw new AppError('RFQ not found', 404);
  }

  // Only creator or admin can assign vendors
  if (rfq.createdById !== req.user.id && req.user.role !== 'ADMIN') {
    throw new AppError('You do not have permission to assign vendors to this RFQ', 403);
  }

  const assignments = await rfqService.assignVendorsToRFQ(rfqId, vendorIds);

  res.status(201).json(
    createdResponse(assignments, `${assignments.length} vendors assigned to RFQ successfully`)
  );
});

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Get All RFQs
 * GET /rfqs
 */
export const getAllRFQs = asyncHandler(async (req, res) => {
  const { page, limit } = getPaginationParams(req.query);
  const { status, category, search, sortBy, order } = req.query;

  const { rfqs, total } = await rfqService.getAllRFQs({
    page,
    limit,
    status,
    category,
    search,
    sortBy: sortBy || 'createdAt',
    order: order || 'desc',
  });

  const pages = Math.ceil(total / limit);

  res.json(
    successResponse(
      rfqs,
      'RFQs fetched successfully',
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
 * Get My RFQs
 * GET /rfqs/my
 */
export const getMyRFQs = asyncHandler(async (req, res) => {
  const { page, limit } = getPaginationParams(req.query);
  const { status, sortBy, order } = req.query;
  const userId = req.user.id;

  const { rfqs, total } = await rfqService.getMyRFQs(userId, {
    page,
    limit,
    status,
    sortBy: sortBy || 'createdAt',
    order: order || 'desc',
  });

  const pages = Math.ceil(total / limit);

  res.json(
    successResponse(
      rfqs,
      'Your RFQs fetched successfully',
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
 * Get RFQ by ID
 * GET /rfqs/:rfqId
 */
export const getRFQ = asyncHandler(async (req, res) => {
  const { rfqId } = req.params;

  const rfq = await rfqService.getRFQById(rfqId);
  if (!rfq) {
    throw new AppError('RFQ not found', 404);
  }

  res.json(successResponse(rfq, 'RFQ fetched successfully'));
});

/**
 * Search RFQs
 * GET /rfqs/search/:query
 */
export const searchRFQs = asyncHandler(async (req, res) => {
  const { query } = req.params;
  const { page, limit } = getPaginationParams(req.query);

  const { rfqs, total } = await rfqService.searchRFQs(query, { page, limit });

  const pages = Math.ceil(total / limit);

  res.json(
    successResponse(
      rfqs,
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
 * Filter RFQs by Status
 * GET /rfqs/filter/status/:status
 */
export const filterByStatus = asyncHandler(async (req, res) => {
  const { status } = req.params;
  const { page, limit } = getPaginationParams(req.query);

  const { rfqs, total } = await rfqService.filterRFQsByStatus(status, { page, limit });

  const pages = Math.ceil(total / limit);

  res.json(
    successResponse(
      rfqs,
      `RFQs with status ${status} fetched successfully`,
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
 * Get RFQ Stats
 * GET /rfqs/stats/summary
 */
export const getRFQStats = asyncHandler(async (req, res) => {
  const stats = await rfqService.getRFQStats();

  res.json(successResponse(stats, 'RFQ statistics fetched successfully'));
});

/**
 * Get Assigned Vendors
 * GET /rfqs/:rfqId/vendors
 */
export const getAssignedVendors = asyncHandler(async (req, res) => {
  const { rfqId } = req.params;

  // Check if RFQ exists
  const rfq = await rfqService.getRFQById(rfqId);
  if (!rfq) {
    throw new AppError('RFQ not found', 404);
  }

  const vendors = await rfqService.getAssignedVendors(rfqId);

  res.json(
    successResponse(vendors, `${vendors.length} vendors assigned to this RFQ`)
  );
});

/**
 * Get RFQ Items
 * GET /rfqs/:rfqId/items
 */
export const getRFQItems = asyncHandler(async (req, res) => {
  const { rfqId } = req.params;

  // Check if RFQ exists
  const rfq = await rfqService.getRFQById(rfqId);
  if (!rfq) {
    throw new AppError('RFQ not found', 404);
  }

  const items = await rfqService.getRFQItems(rfqId);

  res.json(successResponse(items, `${items.length} items in this RFQ`));
});

// ============================================================================
// UPDATE OPERATIONS
// ============================================================================

/**
 * Update RFQ
 * PUT /rfqs/:rfqId
 */
export const updateRFQ = asyncHandler(async (req, res) => {
  const { rfqId } = req.params;
  const updateData = req.body;

  // Check if RFQ exists
  const rfq = await rfqService.getRFQById(rfqId);
  if (!rfq) {
    throw new AppError('RFQ not found', 404);
  }

  // Only creator or admin can update
  if (rfq.createdById !== req.user.id && req.user.role !== 'ADMIN') {
    throw new AppError('You do not have permission to update this RFQ', 403);
  }

  // Cannot update if RFQ is published or closed
  if (rfq.status === 'PUBLISHED' || rfq.status === 'CLOSED') {
    throw new AppError(`Cannot update RFQ with status ${rfq.status}`, 400);
  }

  const updatedRFQ = await rfqService.updateRFQ(rfqId, updateData);

  res.json(successResponse(updatedRFQ, 'RFQ updated successfully'));
});

/**
 * Publish RFQ
 * PATCH /rfqs/:rfqId/publish
 */
export const publishRFQ = asyncHandler(async (req, res) => {
  const { rfqId } = req.params;

  // Check if RFQ exists
  const rfq = await rfqService.getRFQById(rfqId);
  if (!rfq) {
    throw new AppError('RFQ not found', 404);
  }

  // Only creator or admin can publish
  if (rfq.createdById !== req.user.id && req.user.role !== 'ADMIN') {
    throw new AppError('You do not have permission to publish this RFQ', 403);
  }

  // Can only publish drafts
  if (rfq.status !== 'DRAFT') {
    throw new AppError(`Cannot publish RFQ with status ${rfq.status}`, 400);
  }

  // Check if RFQ has items and vendors
  if (rfq.RFQItems.length === 0) {
    throw new AppError('RFQ must have at least one item before publishing', 400);
  }

  if (rfq.RFQVendors.length === 0) {
    throw new AppError('RFQ must have at least one vendor before publishing', 400);
  }

  const publishedRFQ = await rfqService.publishRFQ(rfqId);

  res.json(successResponse(publishedRFQ, 'RFQ published successfully'));
});

/**
 * Close RFQ
 * PATCH /rfqs/:rfqId/close
 */
export const closeRFQ = asyncHandler(async (req, res) => {
  const { rfqId } = req.params;

  // Check if RFQ exists
  const rfq = await rfqService.getRFQById(rfqId);
  if (!rfq) {
    throw new AppError('RFQ not found', 404);
  }

  // Only creator or admin can close
  if (rfq.createdById !== req.user.id && req.user.role !== 'ADMIN') {
    throw new AppError('You do not have permission to close this RFQ', 403);
  }

  // Can only close published RFQs
  if (rfq.status !== 'PUBLISHED') {
    throw new AppError(`Cannot close RFQ with status ${rfq.status}`, 400);
  }

  const closedRFQ = await rfqService.closeRFQ(rfqId);

  res.json(successResponse(closedRFQ, 'RFQ closed successfully'));
});

// ============================================================================
// DELETE OPERATIONS
// ============================================================================

/**
 * Delete RFQ
 * DELETE /rfqs/:rfqId
 */
export const deleteRFQ = asyncHandler(async (req, res) => {
  const { rfqId } = req.params;

  // Check if RFQ exists
  const rfq = await rfqService.getRFQById(rfqId);
  if (!rfq) {
    throw new AppError('RFQ not found', 404);
  }

  // Only creator or admin can delete
  if (rfq.createdById !== req.user.id && req.user.role !== 'ADMIN') {
    throw new AppError('You do not have permission to delete this RFQ', 403);
  }

  // Can only delete drafts
  if (rfq.status !== 'DRAFT') {
    throw new AppError(`Cannot delete RFQ with status ${rfq.status}. Only draft RFQs can be deleted.`, 400);
  }

  await rfqService.deleteRFQ(rfqId);

  res.json(successResponse(null, 'RFQ deleted successfully'));
});

/**
 * Remove Vendor from RFQ
 * DELETE /rfqs/:rfqId/vendors/:vendorId
 */
export const removeVendor = asyncHandler(async (req, res) => {
  const { rfqId, vendorId } = req.params;

  // Check if RFQ exists
  const rfq = await rfqService.getRFQById(rfqId);
  if (!rfq) {
    throw new AppError('RFQ not found', 404);
  }

  // Only creator or admin can remove vendors
  if (rfq.createdById !== req.user.id && req.user.role !== 'ADMIN') {
    throw new AppError('You do not have permission to remove vendors from this RFQ', 403);
  }

  await rfqService.removeVendorFromRFQ(rfqId, vendorId);

  res.json(successResponse(null, 'Vendor removed from RFQ successfully'));
});

/**
 * Delete RFQ Item
 * DELETE /rfqs/:rfqId/items/:itemId
 */
export const deleteRFQItem = asyncHandler(async (req, res) => {
  const { rfqId, itemId } = req.params;

  // Check if RFQ exists
  const rfq = await rfqService.getRFQById(rfqId);
  if (!rfq) {
    throw new AppError('RFQ not found', 404);
  }

  // Only creator or admin can delete items
  if (rfq.createdById !== req.user.id && req.user.role !== 'ADMIN') {
    throw new AppError('You do not have permission to delete items from this RFQ', 403);
  }

  await rfqService.deleteRFQItem(itemId);

  res.json(successResponse(null, 'RFQ item deleted successfully'));
});
