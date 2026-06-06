import prisma from '../../config/prisma.js';

/**
 * Report Service Layer - MongoDB Compatible
 */

/**
 * Get Dashboard Analytics
 */
export const getDashboardAnalytics = async () => {
  const [
    vendorCount,
    rfqCount,
    activePoCount,
    totalSpent
  ] = await Promise.all([
    prisma.vendor.count({ where: { status: 'ACTIVE' } }),
    prisma.rFQ.count(),
    prisma.purchaseOrder.count({ where: { status: 'APPROVED' } }),
    prisma.purchaseOrder.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { totalAmount: true }
    })
  ]);

  const recentActivities = await prisma.activityLog.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { firstName: true, lastName: true } } }
  });

  return {
    stats: {
      vendors: vendorCount,
      rfqs: rfqCount,
      activePurchaseOrders: activePoCount,
      totalProcurementValue: totalSpent._sum.totalAmount || 0
    },
    recentActivities
  };
};

/**
 * Get Monthly Spending (Last 12 Months)
 */
export const getMonthlySpending = async () => {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const pos = await prisma.purchaseOrder.findMany({
    where: {
      status: { in: ['APPROVED', 'COMPLETED', 'RECEIVED'] },
      createdAt: { gte: twelveMonthsAgo }
    },
    select: {
      totalAmount: true,
      createdAt: true
    }
  });

  const groups = pos.reduce((acc, po) => {
    const month = po.createdAt.toISOString().substring(0, 7); // YYYY-MM
    if (!acc[month]) {
      acc[month] = { month, totalAmount: 0, poCount: 0 };
    }
    acc[month].totalAmount += po.totalAmount;
    acc[month].poCount += 1;
    return acc;
  }, {});

  return Object.values(groups).sort((a, b) => a.month.localeCompare(b.month));
};

/**
 * Get Vendor Performance
 */
export const getVendorPerformance = async () => {
  return await prisma.vendor.findMany({
    select: {
      id: true,
      companyName: true,
      ratingScore: true,
      totalPurchaseOrders: true,
      totalSpent: true,
      onTimeDeliveryRate: true
    },
    orderBy: { totalSpent: 'desc' },
    take: 10
  });
};

/**
 * Get Procurement Trends
 */
export const getProcurementTrends = async () => {
  const rfqData = await prisma.rFQ.findMany({
    take: 100,
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true }
  });

  const poData = await prisma.purchaseOrder.findMany({
    take: 100,
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true }
  });

  const groupData = (data) => {
    const groups = data.reduce((acc, item) => {
      const month = item.createdAt.toISOString().substring(0, 7);
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(groups)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 6);
  };

  return {
    rfqTrends: groupData(rfqData),
    poTrends: groupData(poData)
  };
};

/**
 * Top Vendors by Transaction Value
 */
export const getTopVendors = async () => {
  return await prisma.vendor.findMany({
    take: 5,
    orderBy: { totalSpent: 'desc' },
    select: {
      companyName: true,
      totalSpent: true,
      totalPurchaseOrders: true,
      ratingScore: true
    }
  });
};
