import * as activityService from './activity.service.js';

/**
 * Get activity logs
 */
export const getLogs = async (req, res) => {
  try {
    const { type, entity, userId, page, limit } = req.query;
    const filters = {};
    if (type) filters.type = type;
    if (entity) filters.entity = entity;
    if (userId) filters.userId = userId;

    const logs = await activityService.getActivityLogs(filters, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });

    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
