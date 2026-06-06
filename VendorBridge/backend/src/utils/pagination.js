// Pagination helper
export const getPaginationParams = (page = 1, limit = 10, maxLimit = 100) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(
    Math.max(1, parseInt(limit) || 10),
    maxLimit
  );

  const skip = (pageNum - 1) * limitNum;

  return {
    page: pageNum,
    limit: limitNum,
    skip,
  };
};

// Format pagination response
export const formatPaginationMeta = (page, limit, total) => {
  return {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPrevPage: page > 1,
  };
};

// Get pagination query conditions
export const getPaginationQuery = (page, limit) => {
  const { skip, limit: take } = getPaginationParams(page, limit);
  return {
    skip,
    take,
  };
};
