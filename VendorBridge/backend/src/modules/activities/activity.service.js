import prisma from '../../config/prisma.js';

/**
 * Activity Log Service
 */

/**
 * Log a new activity
 * @param {Object} data - Activity data
 */
export const logActivity = async ({
  userId,
  type,
  entity,
  entityId,
  action,
  oldValues = null,
  newValues = null,
  ipAddress = null,
  userAgent = null
}) => {
  try {
    return await prisma.activityLog.create({
      data: {
        userId,
        type,
        entity,
        entityId,
        action,
        oldValues: oldValues ? JSON.stringify(oldValues) : null,
        newValues: newValues ? JSON.stringify(newValues) : null,
        ipAddress,
        userAgent
      }
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    // We don't throw here to avoid breaking the main flow
  }
};

/**
 * Get activity logs with filters
 */
export const getActivityLogs = async (filters = {}, options = {}) => {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  return await prisma.activityLog.findMany({
    where: filters,
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          role: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit
  });
};
