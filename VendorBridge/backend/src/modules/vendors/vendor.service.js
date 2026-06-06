import prisma from '../../config/prisma.js';
import { logActivity } from '../activities/activity.service.js';

// ============== CREATE VENDOR ==============

/**
 * Create a new vendor
 */
export const createVendor = async (vendorData) => {
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
    userId,
  } = vendorData;

  try {
    const vendor = await prisma.vendor.create({
      data: {
        companyName,
        registrationNumber: registrationNumber || `REG-${Date.now()}`,
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
        status: 'PENDING',
        userId,
      },
    });

    await logActivity({
      userId,
      type: 'CREATE',
      entity: 'Vendor',
      entityId: vendor.id,
      action: 'Vendor Created',
      newValues: vendor
    });

    return vendor;
  } catch (error) {
    if (error.code === 'P2002') {
      throw new Error('Vendor with this email already exists');
    }
    throw error;
  }
};

// ============== READ VENDORS ==============

/**
 * Find vendor by email
 */
export const findVendorByEmail = async (email) => {
  return await prisma.vendor.findUnique({
    where: { email: email.toLowerCase() },
  });
};

/**
 * Get vendor by ID
 */
export const getVendorById = async (vendorId) => {
  return await prisma.vendor.findUnique({
    where: { id: vendorId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
};

/**
 * Get vendor with RFQs
 */
export const getVendorWithRFQs = async (vendorId) => {
  return await prisma.vendor.findUnique({
    where: { id: vendorId },
    include: {
      rfqVendors: {
        include: {
          rfq: true,
        },
      },
    },
  });
};

/**
 * Get vendor with quotations
 */
export const getVendorWithQuotations = async (vendorId) => {
  return await prisma.vendor.findUnique({
    where: { id: vendorId },
    include: {
      quotations: {
        include: {
          rfq: true,
        },
      },
    },
  });
};

/**
 * Get vendor with purchase orders
 */
export const getVendorWithPurchaseOrders = async (vendorId) => {
  return await prisma.vendor.findUnique({
    where: { id: vendorId },
    include: {
      purchaseOrders: {
        include: {
          vendor: true,
        },
      },
    },
  });
};

/**
 * Get all vendors with filters, search, and pagination
 */
export const getAllVendors = async (whereCondition = {}, skip = 0, take = 10, orderBy = 'createdAt', order = 'desc') => {
  // Add soft delete filter
  const fullWhereCondition = {
    ...whereCondition,
    deletedAt: null,
  };

  return await prisma.vendor.findMany({
    where: fullWhereCondition,
    skip,
    take,
    orderBy: {
      [orderBy]: order,
    },
    include: {
      user: {
        select: {
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });
};

/**
 * Get vendor count
 */
export const getVendorCount = async (whereCondition = {}) => {
  // Add soft delete filter
  const fullWhereCondition = {
    ...whereCondition,
    deletedAt: null,
  };

  return await prisma.vendor.count({
    where: fullWhereCondition,
  });
};

// ============== UPDATE VENDOR ==============

/**
 * Update vendor details
 */
export const updateVendor = async (vendorId, updateData) => {
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
  } = updateData;

  // Build update object
  const dataToUpdate = {};
  if (companyName !== undefined) dataToUpdate.companyName = companyName;
  if (taxId !== undefined) dataToUpdate.taxId = taxId;
  if (phone !== undefined) dataToUpdate.phone = phone;
  if (website !== undefined) dataToUpdate.website = website;
  if (contactPersonName !== undefined) dataToUpdate.contactPersonName = contactPersonName;
  if (contactPersonEmail !== undefined) dataToUpdate.contactPersonEmail = contactPersonEmail;
  if (contactPersonPhone !== undefined) dataToUpdate.contactPersonPhone = contactPersonPhone;
  if (street !== undefined) dataToUpdate.street = street;
  if (city !== undefined) dataToUpdate.city = city;
  if (state !== undefined) dataToUpdate.state = state;
  if (country !== undefined) dataToUpdate.country = country;
  if (postalCode !== undefined) dataToUpdate.postalCode = postalCode;
  if (companyLogo !== undefined) dataToUpdate.companyLogo = companyLogo;

  return await prisma.vendor.update({
    where: { id: vendorId },
    data: dataToUpdate,
  });
};

/**
 * Update vendor status
 */
export const updateVendorStatus = async (vendorId, status) => {
  return await prisma.vendor.update({
    where: { id: vendorId },
    data: { status },
  });
};

/**
 * Update vendor rating
 */
export const updateVendorRating = async (vendorId, ratingScore) => {
  return await prisma.vendor.update({
    where: { id: vendorId },
    data: { ratingScore },
  });
};

/**
 * Update vendor statistics
 */
export const updateVendorStatistics = async (vendorId, statistics) => {
  const {
    totalOrders,
    totalSpent,
    onTimeDeliveryRate,
    qualityScore,
  } = statistics;

  const dataToUpdate = {};
  if (totalOrders !== undefined) dataToUpdate.totalPurchaseOrders = totalOrders;
  if (totalSpent !== undefined) dataToUpdate.totalSpent = totalSpent;
  if (onTimeDeliveryRate !== undefined) dataToUpdate.onTimeDeliveryRate = onTimeDeliveryRate;
  if (qualityScore !== undefined) dataToUpdate.qualityScore = qualityScore;

  return await prisma.vendor.update({
    where: { id: vendorId },
    data: dataToUpdate,
  });
};

// ============== DELETE VENDOR ==============

/**
 * Soft delete vendor
 */
export const deleteVendor = async (vendorId) => {
  return await prisma.vendor.update({
    where: { id: vendorId },
    data: { deletedAt: new Date() },
  });
};

/**
 * Hard delete vendor (permanent)
 */
export const hardDeleteVendor = async (vendorId) => {
  return await prisma.vendor.delete({
    where: { id: vendorId },
  });
};

// ============== SEARCH & FILTER ==============

/**
 * Search vendors by company name, email, or contact person
 */
export const searchVendors = async (query, skip = 0, take = 10) => {
  return await prisma.vendor.findMany({
    where: {
      AND: [
        {
          deletedAt: null,
        },
        {
          OR: [
            { companyName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { contactPersonName: { contains: query, mode: 'insensitive' } },
          ],
        },
      ],
    },
    skip,
    take,
    orderBy: { companyName: 'asc' },
  });
};

/**
 * Filter vendors by country
 */
export const filterVendorsByCountry = async (country, skip = 0, take = 10) => {
  return await prisma.vendor.findMany({
    where: {
      country: { contains: country, mode: 'insensitive' },
      deletedAt: null,
    },
    skip,
    take,
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Filter vendors by status
 */
export const filterVendorsByStatus = async (status, skip = 0, take = 10) => {
  return await prisma.vendor.findMany({
    where: {
      status,
      deletedAt: null,
    },
    skip,
    take,
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Filter vendors by rating
 */
export const filterVendorsByRating = async (minRating = 0, skip = 0, take = 10) => {
  return await prisma.vendor.findMany({
    where: {
      ratingScore: { gte: minRating },
      deletedAt: null,
    },
    skip,
    take,
    orderBy: { ratingScore: 'desc' },
  });
};

/**
 * Get top-rated vendors
 */
export const getTopRatedVendors = async (limit = 5) => {
  return await prisma.vendor.findMany({
    where: { deletedAt: null, status: 'ACTIVE' },
    orderBy: { ratingScore: 'desc' },
    take: limit,
  });
};

/**
 * Get vendors by category (if stored in custom field)
 */
export const filterVendorsByCity = async (city, skip = 0, take = 10) => {
  return await prisma.vendor.findMany({
    where: {
      city: { contains: city, mode: 'insensitive' },
      deletedAt: null,
    },
    skip,
    take,
    orderBy: { createdAt: 'desc' },
  });
};

// ============== STATISTICS ==============

/**
 * Get vendor statistics
 */
export const getVendorStats = async () => {
  const [
    totalVendors,
    activeVendors,
    approvedVendors,
    pendingVendors,
    suspendedVendors,
    topRatedVendors,
  ] = await Promise.all([
    prisma.vendor.count({ where: { deletedAt: null } }),
    prisma.vendor.count({ where: { status: 'ACTIVE', deletedAt: null } }),
    prisma.vendor.count({ where: { status: 'APPROVED', deletedAt: null } }),
    prisma.vendor.count({ where: { status: 'PENDING', deletedAt: null } }),
    prisma.vendor.count({ where: { status: 'SUSPENDED', deletedAt: null } }),
    getTopRatedVendors(5),
  ]);

  // Calculate average rating
  const avgRatingResult = await prisma.vendor.aggregate({
    _avg: { ratingScore: true },
    where: { deletedAt: null },
  });

  const averageRating = avgRatingResult._avg.ratingScore || 0;

  return {
    totalVendors,
    activeVendors,
    approvedVendors,
    pendingVendors,
    suspendedVendors,
    averageRating: Math.round(averageRating * 100) / 100,
    topRatedVendors,
  };
};

/**
 * Get vendor summary
 */
export const getVendorSummary = async (vendorId) => {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: {
      id: true,
      companyName: true,
      status: true,
      ratingScore: true,
      totalRFQs: true,
      totalQuotations: true,
      totalPurchaseOrders: true,
      totalSpent: true,
      onTimeDeliveryRate: true,
      qualityScore: true,
      createdAt: true,
    },
  });

  if (!vendor) {
    throw new Error('Vendor not found');
  }

  return vendor;
};

// ============== VENDOR RELATIONSHIPS ==============

/**
 * Get vendor with all related data
 */
export const getVendorFull = async (vendorId) => {
  return await prisma.vendor.findUnique({
    where: { id: vendorId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
        },
      },
      rfqVendors: {
        include: { rfq: true },
      },
      quotations: {
        include: { rfq: true },
      },
      purchaseOrders: true,
      invoices: true,
    },
  });
};

/**
 * Get vendors created by user
 */
export const getVendorsByCreator = async (userId, skip = 0, take = 10) => {
  return await prisma.vendor.findMany({
    where: {
      createdByUserId: userId,
      deletedAt: null,
    },
    skip,
    take,
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Check if vendor exists
 */
export const vendorExists = async (vendorId) => {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
  });
  return !!vendor && !vendor.deletedAt;
};

/**
 * Get vendor contact info
 */
export const getVendorContactInfo = async (vendorId) => {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    select: {
      id: true,
      companyName: true,
      email: true,
      phone: true,
      contactPersonName: true,
      contactPersonEmail: true,
      contactPersonPhone: true,
      street: true,
      city: true,
      state: true,
      country: true,
      postalCode: true,
    },
  });
  return vendor;
};
