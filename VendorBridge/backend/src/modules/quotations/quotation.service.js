import prisma from '../../config/prisma.js';
import { logActivity } from '../activities/activity.service.js';

/**
 * Quotation Service Layer
 * Handles all business logic and database operations for Quotation module
 */

// ============================================================================
// CREATE OPERATIONS
// ============================================================================

/**
 * Submit quotation
 * @param {string} rfqId - RFQ ID
 * @param {string} vendorId - Vendor ID
 * @param {Object} quotationData - Quotation data
 * @returns {Promise<Object>} Created quotation
 */
export const submitQuotation = async (rfqId, vendorId, quotationData) => {
  try {
    // Check if RFQ exists
    const rfq = await prisma.rFQ.findUnique({
      where: { id: rfqId },
      include: { RFQItems: { where: { deletedAt: null } } },
    });

    if (!rfq) {
      throw new Error('RFQ not found');
    }

    // Check if vendor exists
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      throw new Error('Vendor not found');
    }

    // Check if quotation already exists for this RFQ-Vendor pair
    const existingQuotation = await prisma.quotation.findFirst({
      where: {
        rfqId,
        vendorId,
        deletedAt: null,
        status: { not: 'REJECTED' },
      },
    });

    if (existingQuotation && existingQuotation.status !== 'DRAFT') {
      throw new Error('Quotation already submitted for this RFQ by this vendor');
    }

    // Calculate total price
    let totalPrice = 0;
    for (const item of quotationData.items) {
      totalPrice += item.quotedPrice * (item.quantity || 1);
    }

    // Determine delivery days (use provided or oldest item delivery)
    let deliveryDays = quotationData.deliveryDays || 30;
    if (quotationData.items.length > 0 && quotationData.items[0].deliveryDays) {
      deliveryDays = quotationData.items[0].deliveryDays;
    }

    // Create quotation
    const quotation = await prisma.quotation.create({
      data: {
        rfqId,
        vendorId,
        status: quotationData.isDraft ? 'DRAFT' : 'SUBMITTED',
        totalPrice,
        itemCount: quotationData.items.length,
        deliveryDays,
        paymentTerms: quotationData.paymentTerms || null,
        warranty: quotationData.warranty || null,
        coverLetter: quotationData.coverLetter || null,
        submittedAt: quotationData.isDraft ? null : new Date(),
        QuotationItems: {
          create: quotationData.items.map((item) => ({
            rfqItemId: item.rfqItemId,
            quotedPrice: item.quotedPrice,
            quantity: item.quantity || 1,
            deliveryDays: item.deliveryDays || null,
            notes: item.notes || null,
          })),
        },
      },
      include: {
        vendor: {
          select: {
            id: true,
            companyName: true,
            email: true,
            phone: true,
            ratingScore: true,
          },
        },
        RFQ: {
          select: {
            id: true,
            title: true,
          },
        },
        QuotationItems: true,
      },
    });

    // Update quotation count in RFQ if submitted
    if (!quotationData.isDraft) {
      await prisma.rFQ.update({
        where: { id: rfqId },
        data: {
          quotationCount: {
            increment: 1,
          },
        },
      });

      await logActivity({
        userId: vendor.userId,
        type: 'CREATE',
        entity: 'Quotation',
        entityId: quotation.id,
        action: 'Quotation Submitted'
      });
    }

    return quotation;
  } catch (error) {
    console.error('Error submitting quotation:', error);
    throw error;
  }
};

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Get quotation by ID
 * @param {string} quotationId - Quotation ID
 * @returns {Promise<Object>} Quotation object
 */
export const getQuotationById = async (quotationId) => {
  try {
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
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
            status: true,
          },
        },
        RFQ: {
          select: {
            id: true,
            title: true,
            deadline: true,
            status: true,
          },
        },
        QuotationItems: {
          include: {
            rfqItem: {
              select: {
                description: true,
                quantity: true,
                unit: true,
              },
            },
          },
        },
      },
    });
    return quotation;
  } catch (error) {
    console.error('Error getting quotation:', error);
    throw error;
  }
};

/**
 * Get all quotations with pagination
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Quotations and total count
 */
export const getAllQuotations = async (options = {}) => {
  const {
    page = 1,
    limit = 10,
    status,
    search,
    sortBy = 'submittedAt',
    order = 'desc',
  } = options;

  const skip = (page - 1) * limit;

  let where = { deletedAt: null };

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [{ vendor: { companyName: { contains: search, mode: 'insensitive' } } }];
  }

  try {
    const [quotations, total] = await Promise.all([
      prisma.quotation.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: order },
        include: {
          vendor: {
            select: {
              id: true,
              companyName: true,
              email: true,
              ratingScore: true,
            },
          },
          RFQ: {
            select: {
              id: true,
              title: true,
            },
          },
          QuotationItems: {
            select: {
              id: true,
              quotedPrice: true,
              quantity: true,
            },
          },
        },
      }),
      prisma.quotation.count({ where }),
    ]);

    return { quotations, total };
  } catch (error) {
    console.error('Error getting all quotations:', error);
    throw error;
  }
};

/**
 * Get quotations by RFQ ID
 * @param {string} rfqId - RFQ ID
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} Quotations
 */
export const getQuotationsByRFQ = async (rfqId, options = {}) => {
  const { page = 1, limit = 100, status } = options;
  const skip = (page - 1) * limit;

  let where = {
    rfqId,
    deletedAt: null,
  };

  if (status) {
    where.status = status;
  }

  try {
    const [quotations, total] = await Promise.all([
      prisma.quotation.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { submittedAt: 'desc' },
        include: {
          vendor: {
            select: {
              id: true,
              companyName: true,
              email: true,
              phone: true,
              contactPersonName: true,
              ratingScore: true,
              totalPurchaseOrders: true,
              onTimeDeliveryRate: true,
            },
          },
          QuotationItems: {
            include: {
              rfqItem: {
                select: {
                  description: true,
                },
              },
            },
          },
        },
      }),
      prisma.quotation.count({ where }),
    ]);

    return { quotations, total };
  } catch (error) {
    console.error('Error getting quotations by RFQ:', error);
    throw error;
  }
};

/**
 * Get vendor quotations
 * @param {string} vendorId - Vendor ID
 * @param {Object} options - Pagination and filtering options
 * @returns {Promise<Object>} Vendor quotations
 */
export const getVendorQuotations = async (vendorId, options = {}) => {
  const {
    page = 1,
    limit = 10,
    status,
    sortBy = 'submittedAt',
    order = 'desc',
  } = options;

  const skip = (page - 1) * limit;

  let where = {
    vendorId,
    deletedAt: null,
  };

  if (status) {
    where.status = status;
  }

  try {
    const [quotations, total] = await Promise.all([
      prisma.quotation.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: order },
        include: {
          RFQ: {
            select: {
              id: true,
              title: true,
              deadline: true,
              status: true,
            },
          },
          QuotationItems: true,
        },
      }),
      prisma.quotation.count({ where }),
    ]);

    return { quotations, total };
  } catch (error) {
    console.error('Error getting vendor quotations:', error);
    throw error;
  }
};

/**
 * Search quotations
 * @param {string} query - Search query
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} Search results
 */
export const searchQuotations = async (query, options = {}) => {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  try {
    const [quotations, total] = await Promise.all([
      prisma.quotation.findMany({
        where: {
          deletedAt: null,
          OR: [
            { vendor: { companyName: { contains: query, mode: 'insensitive' } } },
            { RFQ: { title: { contains: query, mode: 'insensitive' } } },
          ],
        },
        skip,
        take: parseInt(limit),
        orderBy: { submittedAt: 'desc' },
        include: {
          vendor: {
            select: {
              id: true,
              companyName: true,
              email: true,
              ratingScore: true,
            },
          },
          RFQ: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
      prisma.quotation.count({
        where: {
          deletedAt: null,
          OR: [
            { vendor: { companyName: { contains: query, mode: 'insensitive' } } },
            { RFQ: { title: { contains: query, mode: 'insensitive' } } },
          ],
        },
      }),
    ]);

    return { quotations, total };
  } catch (error) {
    console.error('Error searching quotations:', error);
    throw error;
  }
};

/**
 * Filter quotations by status
 * @param {string} status - Quotation status
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} Filtered quotations
 */
export const filterQuotationsByStatus = async (status, options = {}) => {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  try {
    const [quotations, total] = await Promise.all([
      prisma.quotation.findMany({
        where: {
          deletedAt: null,
          status,
        },
        skip,
        take: parseInt(limit),
        orderBy: { submittedAt: 'desc' },
        include: {
          vendor: {
            select: {
              id: true,
              companyName: true,
              email: true,
              ratingScore: true,
            },
          },
          RFQ: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),
      prisma.quotation.count({
        where: {
          deletedAt: null,
          status,
        },
      }),
    ]);

    return { quotations, total };
  } catch (error) {
    console.error('Error filtering quotations:', error);
    throw error;
  }
};

// ============================================================================
// UPDATE OPERATIONS
// ============================================================================

/**
 * Update quotation
 * @param {string} quotationId - Quotation ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated quotation
 */
export const updateQuotation = async (quotationId, updateData) => {
  try {
    // Get existing quotation
    const existing = await getQuotationById(quotationId);
    if (!existing) {
      throw new Error('Quotation not found');
    }

    // Cannot update submitted quotations
    if (existing.status !== 'DRAFT') {
      throw new Error('Can only update draft quotations');
    }

    let updateObject = {};

    if (updateData.items) {
      // Delete existing items
      await prisma.quotationItem.deleteMany({
        where: { quotationId },
      });

      // Create new items
      await prisma.quotationItem.createMany({
        data: updateData.items.map((item) => ({
          quotationId,
          rfqItemId: item.rfqItemId,
          quotedPrice: item.quotedPrice,
          quantity: item.quantity || 1,
          deliveryDays: item.deliveryDays || null,
          notes: item.notes || null,
        })),
      });

      // Calculate total price
      let totalPrice = 0;
      for (const item of updateData.items) {
        totalPrice += item.quotedPrice * (item.quantity || 1);
      }
      updateObject.totalPrice = totalPrice;
      updateObject.itemCount = updateData.items.length;
    }

    if (updateData.deliveryDays) updateObject.deliveryDays = updateData.deliveryDays;
    if (updateData.paymentTerms) updateObject.paymentTerms = updateData.paymentTerms;
    if (updateData.warranty) updateObject.warranty = updateData.warranty;
    if (updateData.coverLetter) updateObject.coverLetter = updateData.coverLetter;

    const quotation = await prisma.quotation.update({
      where: { id: quotationId },
      data: updateObject,
      include: {
        vendor: {
          select: {
            id: true,
            companyName: true,
            email: true,
            ratingScore: true,
          },
        },
        RFQ: {
          select: {
            id: true,
            title: true,
          },
        },
        QuotationItems: true,
      },
    });

    return quotation;
  } catch (error) {
    console.error('Error updating quotation:', error);
    throw error;
  }
};

/**
 * Update quotation status
 * @param {string} quotationId - Quotation ID
 * @param {string} newStatus - New status
 * @param {string} reason - Reason (for rejection)
 * @returns {Promise<Object>} Updated quotation
 */
export const updateQuotationStatus = async (quotationId, newStatus, reason = null) => {
  try {
    const updateData = { status: newStatus };

    if (newStatus === 'SUBMITTED') {
      updateData.submittedAt = new Date();
    } else if (newStatus === 'REJECTED') {
      updateData.rejectionReason = reason || null;
      updateData.rejectedAt = new Date();
    } else if (newStatus === 'ACCEPTED') {
      updateData.acceptedAt = new Date();
    }

    const quotation = await prisma.quotation.update({
      where: { id: quotationId },
      data: updateData,
      include: {
        vendor: {
          select: {
            id: true,
            companyName: true,
            email: true,
          },
        },
        RFQ: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // Update RFQ quotation count and vendor status if needed
    if (newStatus === 'SUBMITTED' && !quotation.submittedAt) {
      await prisma.rFQ.update({
        where: { id: quotation.rfqId },
        data: {
          quotationCount: {
            increment: 1,
          },
        },
      });
    }

    return quotation;
  } catch (error) {
    console.error('Error updating quotation status:', error);
    throw error;
  }
};

// ============================================================================
// DELETE OPERATIONS
// ============================================================================

/**
 * Delete quotation (soft delete)
 * @param {string} quotationId - Quotation ID
 * @returns {Promise<Object>} Deleted quotation
 */
export const deleteQuotation = async (quotationId) => {
  try {
    const quotation = await prisma.quotation.update({
      where: { id: quotationId },
      data: { deletedAt: new Date() },
    });

    return quotation;
  } catch (error) {
    console.error('Error deleting quotation:', error);
    throw error;
  }
};

// ============================================================================
// UTILITY OPERATIONS
// ============================================================================

/**
 * Check if quotation exists
 * @param {string} quotationId - Quotation ID
 * @returns {Promise<boolean>} True if exists
 */
export const quotationExists = async (quotationId) => {
  try {
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
    });
    return !!quotation;
  } catch (error) {
    console.error('Error checking quotation existence:', error);
    throw error;
  }
};

/**
 * Get quotation statistics
 * @returns {Promise<Object>} Statistics
 */
export const getQuotationStats = async () => {
  try {
    const [totalQuotations, submitted, drafted, accepted, rejected] = await Promise.all([
      prisma.quotation.count({ where: { deletedAt: null } }),
      prisma.quotation.count({ where: { deletedAt: null, status: 'SUBMITTED' } }),
      prisma.quotation.count({ where: { deletedAt: null, status: 'DRAFT' } }),
      prisma.quotation.count({ where: { deletedAt: null, status: 'ACCEPTED' } }),
      prisma.quotation.count({ where: { deletedAt: null, status: 'REJECTED' } }),
    ]);

    return {
      totalQuotations,
      submittedQuotations: submitted,
      draftQuotations: drafted,
      acceptedQuotations: accepted,
      rejectedQuotations: rejected,
    };
  } catch (error) {
    console.error('Error getting quotation statistics:', error);
    throw error;
  }
};

/**
 * Get quotation with all related data
 * @param {string} quotationId - Quotation ID
 * @returns {Promise<Object>} Complete quotation data
 */
export const getQuotationFull = async (quotationId) => {
  try {
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
      include: {
        vendor: true,
        RFQ: {
          include: {
            createdBy: {
              select: {
                id: true,
                email: true,
                fullName: true,
              },
            },
            RFQItems: {
              where: { deletedAt: null },
            },
          },
        },
        QuotationItems: {
          include: {
            rfqItem: true,
          },
        },
      },
    });

    return quotation;
  } catch (error) {
    console.error('Error getting full quotation:', error);
    throw error;
  }
};

/**
 * Get lowest priced quotation for RFQ
 * @param {string} rfqId - RFQ ID
 * @returns {Promise<Object>} Lowest priced quotation
 */
export const getLowestPricedQuotation = async (rfqId) => {
  try {
    const quotation = await prisma.quotation.findFirst({
      where: {
        rfqId,
        deletedAt: null,
        status: { in: ['SUBMITTED', 'ACCEPTED'] },
      },
      orderBy: { totalPrice: 'asc' },
      include: {
        vendor: {
          select: {
            id: true,
            companyName: true,
            email: true,
            ratingScore: true,
          },
        },
      },
    });

    return quotation;
  } catch (error) {
    console.error('Error getting lowest priced quotation:', error);
    throw error;
  }
};

/**
 * Get fastest delivery quotation for RFQ
 * @param {string} rfqId - RFQ ID
 * @returns {Promise<Object>} Fastest delivery quotation
 */
export const getFastestDeliveryQuotation = async (rfqId) => {
  try {
    const quotation = await prisma.quotation.findFirst({
      where: {
        rfqId,
        deletedAt: null,
        status: { in: ['SUBMITTED', 'ACCEPTED'] },
      },
      orderBy: { deliveryDays: 'asc' },
      include: {
        vendor: {
          select: {
            id: true,
            companyName: true,
            email: true,
            ratingScore: true,
          },
        },
      },
    });

    return quotation;
  } catch (error) {
    console.error('Error getting fastest delivery quotation:', error);
    throw error;
  }
};

/**
 * Get highest rated vendor quotation for RFQ
 * @param {string} rfqId - RFQ ID
 * @returns {Promise<Object>} Highest rated quotation
 */
export const getHighestRatedVendorQuotation = async (rfqId) => {
  try {
    const quotation = await prisma.quotation.findFirst({
      where: {
        rfqId,
        deletedAt: null,
        status: { in: ['SUBMITTED', 'ACCEPTED'] },
      },
      orderBy: {
        vendor: {
          ratingScore: 'desc',
        },
      },
      include: {
        vendor: {
          select: {
            id: true,
            companyName: true,
            email: true,
            ratingScore: true,
          },
        },
      },
    });

    return quotation;
  } catch (error) {
    console.error('Error getting highest rated vendor quotation:', error);
    throw error;
  }
};
