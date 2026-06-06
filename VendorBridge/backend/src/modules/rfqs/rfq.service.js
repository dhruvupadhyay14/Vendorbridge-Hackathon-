import prisma from '../../config/prisma.js';
import { logActivity } from '../activities/activity.service.js';

/**
 * RFQ Service Layer
 * Handles all business logic and database operations for RFQ module
 */

// ============================================================================
// CREATE OPERATIONS
// ============================================================================

/**
 * Create new RFQ
 * @param {Object} rfqData - RFQ data
 * @param {string} userId - User ID (creator)
 * @returns {Promise<Object>} Created RFQ
 */
export const createRFQ = async (rfqData, userId) => {
  try {
    const rfq = await prisma.rFQ.create({
      data: {
        title: rfqData.title,
        category: rfqData.category,
        description: rfqData.description,
        deadline: new Date(rfqData.deadline),
        status: rfqData.isDraft ? 'DRAFT' : 'DRAFT',
        budgetMin: rfqData.budgetMin || null,
        budgetMax: rfqData.budgetMax || null,
        deliveryLocation: rfqData.deliveryLocation || null,
        preferredVendorTypes: rfqData.preferredVendorTypes || [],
        createdById: userId,
        itemCount: 0,
        vendorCount: 0,
        quotationCount: 0,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            fullName: true,
            companyName: true,
          },
        },
        RFQItems: true,
        RFQVendors: true,
      },
    });
    return rfq;
  } catch (error) {
    console.error('Error creating RFQ:', error);
    throw error;
  }
};

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Get RFQ by ID
 * @param {string} rfqId - RFQ ID
 * @returns {Promise<Object>} RFQ object
 */
export const getRFQById = async (rfqId) => {
  try {
    const rfq = await prisma.rFQ.findUnique({
      where: { id: rfqId },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            fullName: true,
            companyName: true,
            role: true,
          },
        },
        RFQItems: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
        },
        RFQVendors: {
          include: {
            vendor: {
              select: {
                id: true,
                companyName: true,
                email: true,
                phone: true,
                contactPersonName: true,
                country: true,
                status: true,
                ratingScore: true,
              },
            },
          },
          where: { deletedAt: null },
        },
        Quotations: {
          where: { deletedAt: null },
          select: {
            id: true,
            vendorId: true,
            totalPrice: true,
            status: true,
            submittedAt: true,
          },
        },
      },
    });
    return rfq;
  } catch (error) {
    console.error('Error getting RFQ:', error);
    throw error;
  }
};

/**
 * Get all RFQs with pagination and filtering
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of RFQs
 */
export const getAllRFQs = async (options = {}) => {
  const {
    page = 1,
    limit = 10,
    status,
    category,
    search,
    sortBy = 'createdAt',
    order = 'desc',
  } = options;

  const skip = (page - 1) * limit;

  let where = { deletedAt: null };

  // Filter by status
  if (status) {
    where.status = status;
  }

  // Filter by category
  if (category) {
    where.category = {
      contains: category,
      mode: 'insensitive',
    };
  }

  // Search in title and description
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { category: { contains: search, mode: 'insensitive' } },
    ];
  }

  try {
    const [rfqs, total] = await Promise.all([
      prisma.rFQ.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: order },
        include: {
          createdBy: {
            select: {
              id: true,
              email: true,
              fullName: true,
              companyName: true,
            },
          },
          RFQItems: {
            where: { deletedAt: null },
          },
          RFQVendors: {
            where: { deletedAt: null },
          },
          Quotations: {
            where: { deletedAt: null },
          },
        },
      }),
      prisma.rFQ.count({ where }),
    ]);

    return { rfqs, total };
  } catch (error) {
    console.error('Error getting all RFQs:', error);
    throw error;
  }
};

/**
 * Get RFQs created by user
 * @param {string} userId - User ID
 * @param {Object} options - Pagination and filtering options
 * @returns {Promise<Object>} RFQs and total count
 */
export const getMyRFQs = async (userId, options = {}) => {
  const {
    page = 1,
    limit = 10,
    status,
    sortBy = 'createdAt',
    order = 'desc',
  } = options;

  const skip = (page - 1) * limit;

  let where = {
    deletedAt: null,
    createdById: userId,
  };

  if (status) {
    where.status = status;
  }

  try {
    const [rfqs, total] = await Promise.all([
      prisma.rFQ.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: order },
        include: {
          RFQItems: { where: { deletedAt: null } },
          RFQVendors: { where: { deletedAt: null } },
          Quotations: { where: { deletedAt: null } },
        },
      }),
      prisma.rFQ.count({ where }),
    ]);

    return { rfqs, total };
  } catch (error) {
    console.error('Error getting my RFQs:', error);
    throw error;
  }
};

/**
 * Search RFQs
 * @param {string} query - Search query
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} Search results
 */
export const searchRFQs = async (query, options = {}) => {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  try {
    const [rfqs, total] = await Promise.all([
      prisma.rFQ.findMany({
        where: {
          deletedAt: null,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } },
          ],
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
          RFQItems: { where: { deletedAt: null } },
          RFQVendors: { where: { deletedAt: null } },
        },
      }),
      prisma.rFQ.count({
        where: {
          deletedAt: null,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { category: { contains: query, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    return { rfqs, total };
  } catch (error) {
    console.error('Error searching RFQs:', error);
    throw error;
  }
};

/**
 * Filter RFQs by status
 * @param {string} status - RFQ status
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} Filtered RFQs
 */
export const filterRFQsByStatus = async (status, options = {}) => {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  try {
    const [rfqs, total] = await Promise.all([
      prisma.rFQ.findMany({
        where: {
          deletedAt: null,
          status,
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
          RFQItems: { where: { deletedAt: null } },
          RFQVendors: { where: { deletedAt: null } },
        },
      }),
      prisma.rFQ.count({
        where: {
          deletedAt: null,
          status,
        },
      }),
    ]);

    return { rfqs, total };
  } catch (error) {
    console.error('Error filtering RFQs by status:', error);
    throw error;
  }
};

// ============================================================================
// UPDATE OPERATIONS
// ============================================================================

/**
 * Update RFQ
 * @param {string} rfqId - RFQ ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated RFQ
 */
export const updateRFQ = async (rfqId, updateData) => {
  try {
    const updateObject = {};

    if (updateData.title) updateObject.title = updateData.title;
    if (updateData.category) updateObject.category = updateData.category;
    if (updateData.description) updateObject.description = updateData.description;
    if (updateData.deadline) updateObject.deadline = new Date(updateData.deadline);
    if (updateData.budgetMin !== undefined) updateObject.budgetMin = updateData.budgetMin;
    if (updateData.budgetMax !== undefined) updateObject.budgetMax = updateData.budgetMax;
    if (updateData.deliveryLocation !== undefined)
      updateObject.deliveryLocation = updateData.deliveryLocation;

    const rfq = await prisma.rFQ.update({
      where: { id: rfqId },
      data: updateObject,
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        RFQItems: { where: { deletedAt: null } },
        RFQVendors: { where: { deletedAt: null } },
      },
    });

    return rfq;
  } catch (error) {
    console.error('Error updating RFQ:', error);
    throw error;
  }
};

/**
 * Publish RFQ (change status from DRAFT to PUBLISHED)
 * @param {string} rfqId - RFQ ID
 * @returns {Promise<Object>} Published RFQ
 */
export const publishRFQ = async (rfqId) => {
  try {
    const rfq = await prisma.rFQ.update({
      where: { id: rfqId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        RFQItems: { where: { deletedAt: null } },
        RFQVendors: { where: { deletedAt: null } },
      },
    });

    await logActivity({
      userId: rfq.createdById,
      type: 'UPDATE',
      entity: 'RFQ',
      entityId: rfq.id,
      action: 'RFQ Published'
    });

    return rfq;
  } catch (error) {
    console.error('Error publishing RFQ:', error);
    throw error;
  }
};

/**
 * Close RFQ
 * @param {string} rfqId - RFQ ID
 * @returns {Promise<Object>} Closed RFQ
 */
export const closeRFQ = async (rfqId) => {
  try {
    const rfq = await prisma.rFQ.update({
      where: { id: rfqId },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
      },
      include: {
        RFQItems: { where: { deletedAt: null } },
        RFQVendors: { where: { deletedAt: null } },
      },
    });

    return rfq;
  } catch (error) {
    console.error('Error closing RFQ:', error);
    throw error;
  }
};

// ============================================================================
// DELETE OPERATIONS
// ============================================================================

/**
 * Delete RFQ (soft delete)
 * @param {string} rfqId - RFQ ID
 * @returns {Promise<Object>} Deleted RFQ
 */
export const deleteRFQ = async (rfqId) => {
  try {
    const rfq = await prisma.rFQ.update({
      where: { id: rfqId },
      data: { deletedAt: new Date() },
    });

    return rfq;
  } catch (error) {
    console.error('Error deleting RFQ:', error);
    throw error;
  }
};

/**
 * Hard delete RFQ (permanent delete)
 * @param {string} rfqId - RFQ ID
 * @returns {Promise<void>}
 */
export const hardDeleteRFQ = async (rfqId) => {
  try {
    // Delete related records first
    await prisma.rFQItem.deleteMany({
      where: { rfqId },
    });

    await prisma.rFQVendor.deleteMany({
      where: { rfqId },
    });

    // Delete RFQ
    await prisma.rFQ.delete({
      where: { id: rfqId },
    });
  } catch (error) {
    console.error('Error hard deleting RFQ:', error);
    throw error;
  }
};

// ============================================================================
// RFQ ITEMS OPERATIONS
// ============================================================================

/**
 * Add RFQ items
 * @param {string} rfqId - RFQ ID
 * @param {Array} items - Array of items to add
 * @returns {Promise<Array>} Created items
 */
export const addRFQItems = async (rfqId, items) => {
  try {
    const createdItems = await Promise.all(
      items.map((item) =>
        prisma.rFQItem.create({
          data: {
            rfqId,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            estimatedBudget: item.estimatedBudget,
            specifications: item.specifications || null,
          },
        })
      )
    );

    // Update item count in RFQ
    await prisma.rFQ.update({
      where: { id: rfqId },
      data: {
        itemCount: {
          increment: createdItems.length,
        },
      },
    });

    return createdItems;
  } catch (error) {
    console.error('Error adding RFQ items:', error);
    throw error;
  }
};

/**
 * Get RFQ items
 * @param {string} rfqId - RFQ ID
 * @returns {Promise<Array>} RFQ items
 */
export const getRFQItems = async (rfqId) => {
  try {
    const items = await prisma.rFQItem.findMany({
      where: {
        rfqId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'asc' },
    });

    return items;
  } catch (error) {
    console.error('Error getting RFQ items:', error);
    throw error;
  }
};

/**
 * Delete RFQ item (soft delete)
 * @param {string} itemId - Item ID
 * @returns {Promise<Object>} Deleted item
 */
export const deleteRFQItem = async (itemId) => {
  try {
    const item = await prisma.rFQItem.update({
      where: { id: itemId },
      data: { deletedAt: new Date() },
    });

    return item;
  } catch (error) {
    console.error('Error deleting RFQ item:', error);
    throw error;
  }
};

// ============================================================================
// VENDOR ASSIGNMENT OPERATIONS
// ============================================================================

/**
 * Assign vendors to RFQ
 * @param {string} rfqId - RFQ ID
 * @param {Array} vendorIds - Array of vendor IDs
 * @returns {Promise<Array>} Created vendor assignments
 */
export const assignVendorsToRFQ = async (rfqId, vendorIds) => {
  try {
    // Check if vendors already exist for this RFQ
    const existingAssignments = await prisma.rFQVendor.findMany({
      where: {
        rfqId,
        vendorId: { in: vendorIds },
        deletedAt: null,
      },
    });

    const existingVendorIds = existingAssignments.map((a) => a.vendorId);
    const newVendorIds = vendorIds.filter((id) => !existingVendorIds.includes(id));

    if (newVendorIds.length === 0) {
      return existingAssignments;
    }

    // Create new assignments
    const assignments = await Promise.all(
      newVendorIds.map((vendorId) =>
        prisma.rFQVendor.create({
          data: {
            rfqId,
            vendorId,
            status: 'INVITED',
            invitedAt: new Date(),
          },
          include: {
            vendor: {
              select: {
                id: true,
                companyName: true,
                email: true,
              },
            },
          },
        })
      )
    );

    // Update vendor count in RFQ
    await prisma.rFQ.update({
      where: { id: rfqId },
      data: {
        vendorCount: {
          increment: newVendorIds.length,
        },
      },
    });

    return assignments;
  } catch (error) {
    console.error('Error assigning vendors to RFQ:', error);
    throw error;
  }
};

/**
 * Remove vendor from RFQ
 * @param {string} rfqId - RFQ ID
 * @param {string} vendorId - Vendor ID
 * @returns {Promise<Object>} Removed assignment
 */
export const removeVendorFromRFQ = async (rfqId, vendorId) => {
  try {
    const assignment = await prisma.rFQVendor.updateMany({
      where: {
        rfqId,
        vendorId,
      },
      data: { deletedAt: new Date() },
    });

    // Decrement vendor count
    await prisma.rFQ.update({
      where: { id: rfqId },
      data: {
        vendorCount: {
          decrement: 1,
        },
      },
    });

    return assignment;
  } catch (error) {
    console.error('Error removing vendor from RFQ:', error);
    throw error;
  }
};

/**
 * Get vendors assigned to RFQ
 * @param {string} rfqId - RFQ ID
 * @returns {Promise<Array>} Assigned vendors
 */
export const getAssignedVendors = async (rfqId) => {
  try {
    const vendors = await prisma.rFQVendor.findMany({
      where: {
        rfqId,
        deletedAt: null,
      },
      include: {
        vendor: {
          select: {
            id: true,
            companyName: true,
            email: true,
            phone: true,
            contactPersonName: true,
            country: true,
            ratingScore: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return vendors;
  } catch (error) {
    console.error('Error getting assigned vendors:', error);
    throw error;
  }
};

// ============================================================================
// UTILITY OPERATIONS
// ============================================================================

/**
 * Check if RFQ exists
 * @param {string} rfqId - RFQ ID
 * @returns {Promise<boolean>} True if RFQ exists
 */
export const rfqExists = async (rfqId) => {
  try {
    const rfq = await prisma.rFQ.findUnique({
      where: { id: rfqId },
    });
    return !!rfq;
  } catch (error) {
    console.error('Error checking RFQ existence:', error);
    throw error;
  }
};

/**
 * Get RFQ statistics
 * @returns {Promise<Object>} RFQ statistics
 */
export const getRFQStats = async () => {
  try {
    const [totalRFQs, publishedRFQs, draftRFQs, closedRFQs, totalVendors] =
      await Promise.all([
        prisma.rFQ.count({ where: { deletedAt: null } }),
        prisma.rFQ.count({ where: { deletedAt: null, status: 'PUBLISHED' } }),
        prisma.rFQ.count({ where: { deletedAt: null, status: 'DRAFT' } }),
        prisma.rFQ.count({ where: { deletedAt: null, status: 'CLOSED' } }),
        prisma.rFQVendor.count({ where: { deletedAt: null } }),
      ]);

    return {
      totalRFQs,
      publishedRFQs,
      draftRFQs,
      closedRFQs,
      totalVendorInvitations: totalVendors,
    };
  } catch (error) {
    console.error('Error getting RFQ statistics:', error);
    throw error;
  }
};

/**
 * Get RFQ with all related data
 * @param {string} rfqId - RFQ ID
 * @returns {Promise<Object>} Complete RFQ data
 */
export const getRFQFull = async (rfqId) => {
  try {
    const rfq = await prisma.rFQ.findUnique({
      where: { id: rfqId },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            fullName: true,
            companyName: true,
            phone: true,
          },
        },
        RFQItems: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' },
        },
        RFQVendors: {
          where: { deletedAt: null },
          include: {
            vendor: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        Quotations: {
          where: { deletedAt: null },
          include: {
            vendor: {
              select: {
                id: true,
                companyName: true,
                email: true,
              },
            },
            QuotationItems: true,
          },
          orderBy: { submittedAt: 'desc' },
        },
      },
    });

    return rfq;
  } catch (error) {
    console.error('Error getting full RFQ:', error);
    throw error;
  }
};

/**
 * Get upcoming RFQ deadlines
 * @param {number} days - Number of days to look ahead
 * @returns {Promise<Array>} RFQs with upcoming deadlines
 */
export const getUpcomingDeadlines = async (days = 7) => {
  try {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const rfqs = await prisma.rFQ.findMany({
      where: {
        deletedAt: null,
        status: 'PUBLISHED',
        deadline: {
          gte: now,
          lte: futureDate,
        },
      },
      orderBy: { deadline: 'asc' },
      include: {
        createdBy: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
        RFQVendors: { where: { deletedAt: null } },
      },
    });

    return rfqs;
  } catch (error) {
    console.error('Error getting upcoming RFQ deadlines:', error);
    throw error;
  }
};
