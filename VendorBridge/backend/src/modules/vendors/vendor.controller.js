import { asyncHandler } from '../../utils/asyncHandler.js';
import { successResponse, createdResponse, badRequestResponse, notFoundResponse, serverErrorResponse } from '../../utils/response.js';
import { getPaginationParams, formatPaginationMeta } from '../../utils/pagination.js';
import * as vendorService from './vendor.service.js';

/**
 * Create a new vendor
 * POST /vendors
 */
export const createVendor = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const {
    companyName,
    registrationNumber,
    taxId,
    email,
    phone,
    website,
    contactPersonName,
    contactPersonEmail,
    contactPersonPhone,
    street,
    city,
    state,
    country,
    postalCode,
    gstNumber,
    category,
  } = req.body;

  // Check if vendor already exists with same company name or email
  const existingVendor = await vendorService.findVendorByEmail(email);
  if (existingVendor) {
    return badRequestResponse(res, 'Vendor with this email already exists');
  }

  // Create vendor
  const vendor = await vendorService.createVendor({
    companyName,
    registrationNumber,
    taxId,
    email,
    phone,
    website,
    contactPersonName,
    contactPersonEmail,
    contactPersonPhone,
    street,
    city,
    state,
    country,
    postalCode,
    userId,
  });

  return createdResponse(res, 'Vendor created successfully', {
    id: vendor.id,
    companyName: vendor.companyName,
    email: vendor.email,
    phone: vendor.phone,
    status: vendor.status,
    createdAt: vendor.createdAt,
  });
});

/**
 * Get all vendors with pagination, search, and filter
 * GET /vendors?page=1&limit=10&search=&status=ACTIVE&country=&sortBy=createdAt&order=desc
 */
export const getAllVendors = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '', status = '', country = '', sortBy = 'createdAt', order = 'desc' } = req.query;

  // Get pagination params
  const { page: pageNum, limit: limitNum, skip } = getPaginationParams(page, limit);

  // Build filter conditions
  const whereCondition = {};

  // Search filter
  if (search && search.trim()) {
    whereCondition.OR = [
      { companyName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { contactPersonName: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Status filter
  if (status && status.trim()) {
    whereCondition.status = status;
  }

  // Country filter
  if (country && country.trim()) {
    whereCondition.country = { contains: country, mode: 'insensitive' };
  }

  // Get total count
  const total = await vendorService.getVendorCount(whereCondition);

  // Validate sortBy field
  const validSortFields = ['createdAt', 'updatedAt', 'companyName', 'ratingScore', 'totalSpent'];
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const sortOrder = order?.toLowerCase() === 'asc' ? 'asc' : 'desc';

  // Get vendors
  const vendors = await vendorService.getAllVendors(
    whereCondition,
    skip,
    limitNum,
    sortField,
    sortOrder
  );

  // Format response
  const vendorData = vendors.map(vendor => ({
    id: vendor.id,
    companyName: vendor.companyName,
    email: vendor.email,
    phone: vendor.phone,
    country: vendor.country,
    status: vendor.status,
    ratingScore: vendor.ratingScore,
    totalPurchaseOrders: vendor.totalPurchaseOrders,
    totalSpent: vendor.totalSpent,
    createdAt: vendor.createdAt,
  }));

  return successResponse(res, 'Vendors fetched successfully', vendorData, {
    meta: formatPaginationMeta(pageNum, limitNum, total),
  });
});

/**
 * Get vendor by ID
 * GET /vendors/:vendorId
 */
export const getVendorById = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;

  const vendor = await vendorService.getVendorById(vendorId);
  if (!vendor) {
    return notFoundResponse(res, 'Vendor not found');
  }

  return successResponse(res, 'Vendor fetched successfully', {
    id: vendor.id,
    companyName: vendor.companyName,
    registrationNumber: vendor.registrationNumber,
    taxId: vendor.taxId,
    email: vendor.email,
    phone: vendor.phone,
    website: vendor.website,
    contactPersonName: vendor.contactPersonName,
    contactPersonEmail: vendor.contactPersonEmail,
    contactPersonPhone: vendor.contactPersonPhone,
    street: vendor.street,
    city: vendor.city,
    state: vendor.state,
    country: vendor.country,
    postalCode: vendor.postalCode,
    status: vendor.status,
    ratingScore: vendor.ratingScore,
    totalPurchaseOrders: vendor.totalPurchaseOrders,
    totalSpent: vendor.totalSpent,
    onTimeDeliveryRate: vendor.onTimeDeliveryRate,
    qualityScore: vendor.qualityScore,
    companyLogo: vendor.companyLogo,
    createdAt: vendor.createdAt,
    updatedAt: vendor.updatedAt,
  });
});

/**
 * Update vendor
 * PUT /vendors/:vendorId
 */
export const updateVendor = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const userId = req.user.userId;
  const {
    companyName,
    taxId,
    phone,
    website,
    contactPersonName,
    contactPersonEmail,
    contactPersonPhone,
    street,
    city,
    state,
    country,
    postalCode,
    companyLogo,
  } = req.body;

  // Get vendor
  const vendor = await vendorService.getVendorById(vendorId);
  if (!vendor) {
    return notFoundResponse(res, 'Vendor not found');
  }

  // Check authorization - only vendor owner or admin can update
  if (vendor.userId !== userId && req.user.role !== 'ADMIN') {
    return badRequestResponse(res, 'You do not have permission to update this vendor');
  }

  // Update vendor
  const updatedVendor = await vendorService.updateVendor(vendorId, {
    companyName,
    taxId,
    phone,
    website,
    contactPersonName,
    contactPersonEmail,
    contactPersonPhone,
    street,
    city,
    state,
    country,
    postalCode,
    companyLogo,
  });

  return successResponse(res, 'Vendor updated successfully', {
    id: updatedVendor.id,
    companyName: updatedVendor.companyName,
    email: updatedVendor.email,
    phone: updatedVendor.phone,
    status: updatedVendor.status,
    updatedAt: updatedVendor.updatedAt,
  });
});

/**
 * Delete vendor (soft delete)
 * DELETE /vendors/:vendorId
 */
export const deleteVendor = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const userId = req.user.userId;

  // Get vendor
  const vendor = await vendorService.getVendorById(vendorId);
  if (!vendor) {
    return notFoundResponse(res, 'Vendor not found');
  }

  // Check authorization - only admin can delete vendors
  if (req.user.role !== 'ADMIN') {
    return badRequestResponse(res, 'Only administrators can delete vendors');
  }

  // Soft delete vendor
  await vendorService.deleteVendor(vendorId);

  return successResponse(res, 'Vendor deleted successfully');
});

/**
 * Update vendor status
 * PATCH /vendors/:vendorId/status
 */
export const updateVendorStatus = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const { status } = req.body;

  // Validate status
  const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'SUSPENDED', 'INACTIVE'];
  if (!validStatuses.includes(status)) {
    return badRequestResponse(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  // Get vendor
  const vendor = await vendorService.getVendorById(vendorId);
  if (!vendor) {
    return notFoundResponse(res, 'Vendor not found');
  }

  // Check authorization - only admin can change status
  if (req.user.role !== 'ADMIN') {
    return badRequestResponse(res, 'Only administrators can change vendor status');
  }

  // Update status
  const updatedVendor = await vendorService.updateVendorStatus(vendorId, status);

  return successResponse(res, 'Vendor status updated successfully', {
    id: updatedVendor.id,
    companyName: updatedVendor.companyName,
    status: updatedVendor.status,
    updatedAt: updatedVendor.updatedAt,
  });
});

/**
 * Search vendors by company name
 * GET /vendors/search/:query
 */
export const searchVendors = asyncHandler(async (req, res) => {
  const { query } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!query || query.trim().length < 2) {
    return badRequestResponse(res, 'Search query must be at least 2 characters');
  }

  // Get pagination params
  const { page: pageNum, limit: limitNum, skip } = getPaginationParams(page, limit);

  // Search condition
  const whereCondition = {
    AND: [
      {
        deletedAt: null,
      },
      {
        OR: [
          { companyName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { contactPersonName: { contains: query, mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } },
          { country: { contains: query, mode: 'insensitive' } },
        ],
      },
    ],
  };

  // Get total count
  const total = await vendorService.getVendorCount(whereCondition);

  // Search vendors
  const vendors = await vendorService.getAllVendors(whereCondition, skip, limitNum, 'companyName', 'asc');

  return successResponse(res, 'Search completed', vendors.map(v => ({
    id: v.id,
    companyName: v.companyName,
    email: v.email,
    phone: v.phone,
    country: v.country,
    status: v.status,
    ratingScore: v.ratingScore,
  })), {
    meta: formatPaginationMeta(pageNum, limitNum, total),
  });
});

/**
 * Get vendors by status
 * GET /vendors/filter/status/:status
 */
export const getVendorsByStatus = asyncHandler(async (req, res) => {
  const { status } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // Validate status
  const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'SUSPENDED', 'INACTIVE'];
  if (!validStatuses.includes(status)) {
    return badRequestResponse(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  // Get pagination params
  const { page: pageNum, limit: limitNum, skip } = getPaginationParams(page, limit);

  // Filter condition
  const whereCondition = { status, deletedAt: null };

  // Get total count
  const total = await vendorService.getVendorCount(whereCondition);

  // Get vendors
  const vendors = await vendorService.getAllVendors(whereCondition, skip, limitNum, 'createdAt', 'desc');

  return successResponse(res, `Vendors with status ${status} fetched successfully`, vendors.map(v => ({
    id: v.id,
    companyName: v.companyName,
    email: v.email,
    status: v.status,
    ratingScore: v.ratingScore,
    totalPurchaseOrders: v.totalPurchaseOrders,
  })), {
    meta: formatPaginationMeta(pageNum, limitNum, total),
  });
});

/**
 * Get vendor statistics
 * GET /vendors/stats/summary
 */
export const getVendorStats = asyncHandler(async (req, res) => {
  const stats = await vendorService.getVendorStats();

  return successResponse(res, 'Vendor statistics fetched successfully', {
    totalVendors: stats.totalVendors,
    activeVendors: stats.activeVendors,
    approvedVendors: stats.approvedVendors,
    pendingVendors: stats.pendingVendors,
    suspendedVendors: stats.suspendedVendors,
    averageRating: stats.averageRating,
    topRatedVendors: stats.topRatedVendors,
  });
});
