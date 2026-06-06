import * as quotationService from './quotation.service.js';
import prisma from '../../config/prisma.js';

/**
 * Quotation Comparison Service
 * Handles comparison engine and scoring logic for quotations
 */

/**
 * Get comparison engine results for RFQ (40% Price, 30% Delivery, 30% Rating)
 * @param {string} rfqId - RFQ ID
 * @returns {Promise<Object>} Comparison analysis and recommendation
 */
export const analyzeQuotations = async (rfqId) => {
  try {
    // Get all submitted quotations for RFQ
    const { quotations } = await quotationService.getQuotationsByRFQ(rfqId, {
      limit: 1000,
      status: 'SUBMITTED',
    });

    if (quotations.length === 0) {
      return {
        rfqId,
        quotationCount: 0,
        message: 'No submitted quotations available for comparison',
        metrics: null,
        recommendation: null,
      };
    }

    // Extract metrics and normalize
    const metrics = quotations.map((q) => ({
      quotationId: q.id,
      vendorId: q.vendor.id,
      companyName: q.vendor.companyName,
      email: q.vendor.email,
      phone: q.vendor.phone,
      ratingScore: q.vendor.ratingScore || 0,
      price: q.totalPrice,
      deliveryDays: q.deliveryDays || 30,
      submittedAt: q.submittedAt,
    }));

    // Normalize metrics to 0-100 scale
    const normalizedMetrics = normalizeMetrics(metrics);

    // Calculate composite score (40% price, 30% delivery, 30% rating)
    const scoredMetrics = normalizedMetrics.map((m) => ({
      ...m,
      compositeScore: m.priceScore * 0.4 + m.deliveryScore * 0.3 + m.ratingScore * 0.3,
    }));

    // Sort by composite score (highest first)
    scoredMetrics.sort((a, b) => b.compositeScore - a.compositeScore);

    // Get individual winners
    const lowestPriceVendor = normalizedMetrics.reduce((a, b) =>
      a.price < b.price ? a : b
    );

    const fastestDeliveryVendor = normalizedMetrics.reduce((a, b) =>
      a.deliveryDays < b.deliveryDays ? a : b
    );

    const highestRatedVendor = normalizedMetrics.reduce((a, b) =>
      a.ratingScore > b.ratingScore ? a : b
    );

    // Top recommendation
    const recommendedVendor = scoredMetrics[0];

    return {
      rfqId,
      quotationCount: quotations.length,
      analysis: {
        totalMetrics: scoredMetrics.map((m) => ({
          quotationId: m.quotationId,
          vendorId: m.vendorId,
          companyName: m.companyName,
          email: m.email,
          phone: m.phone,
          price: parseFloat(m.price.toFixed(2)),
          deliveryDays: m.deliveryDays,
          vendorRating: m.ratingScore,
          priceScore: parseFloat(m.priceScore.toFixed(2)),
          deliveryScore: parseFloat(m.deliveryScore.toFixed(2)),
          ratingScore: parseFloat(m.ratingScore.toFixed(2)),
          compositeScore: parseFloat(m.compositeScore.toFixed(2)),
          rank: scoredMetrics.indexOf(m) + 1,
        })),
        winners: {
          lowestPrice: {
            quotationId: lowestPriceVendor.quotationId,
            vendorId: lowestPriceVendor.vendorId,
            companyName: lowestPriceVendor.companyName,
            price: parseFloat(lowestPriceVendor.price.toFixed(2)),
            savings: 'Lowest cost option',
          },
          fastestDelivery: {
            quotationId: fastestDeliveryVendor.quotationId,
            vendorId: fastestDeliveryVendor.vendorId,
            companyName: fastestDeliveryVendor.companyName,
            deliveryDays: fastestDeliveryVendor.deliveryDays,
            advantage: 'Fastest delivery timeline',
          },
          highestRated: {
            quotationId: highestRatedVendor.quotationId,
            vendorId: highestRatedVendor.vendorId,
            companyName: highestRatedVendor.companyName,
            rating: parseFloat(highestRatedVendor.ratingScore.toFixed(2)),
            advantage: 'Best vendor reputation',
          },
        },
      },
      recommendation: {
        quotationId: recommendedVendor.quotationId,
        vendorId: recommendedVendor.vendorId,
        companyName: recommendedVendor.companyName,
        email: recommendedVendor.email,
        phone: recommendedVendor.phone,
        price: parseFloat(recommendedVendor.price.toFixed(2)),
        deliveryDays: recommendedVendor.deliveryDays,
        vendorRating: parseFloat(recommendedVendor.ratingScore.toFixed(2)),
        compositeScore: parseFloat(recommendedVendor.compositeScore.toFixed(2)),
        scoreBreakdown: {
          price: parseFloat((recommendedVendor.priceScore * 0.4).toFixed(2)),
          delivery: parseFloat((recommendedVendor.deliveryScore * 0.3).toFixed(2)),
          rating: parseFloat((recommendedVendor.ratingScore * 0.3).toFixed(2)),
        },
        reason: `Recommended based on composite scoring: 40% price (${parseFloat(
          (recommendedVendor.priceScore * 0.4).toFixed(2)
        )}), 30% delivery speed (${parseFloat(
          (recommendedVendor.deliveryScore * 0.3).toFixed(2)
        )}), 30% vendor rating (${parseFloat(
          (recommendedVendor.ratingScore * 0.3).toFixed(2)
        )})`,
      },
    };
  } catch (error) {
    console.error('Error analyzing quotations:', error);
    throw error;
  }
};

/**
 * Normalize metrics to 0-100 scale
 * @param {Array} metrics - Array of vendor metrics
 * @returns {Array} Normalized metrics
 */
const normalizeMetrics = (metrics) => {
  if (metrics.length === 0) return [];

  // Find min and max for each metric
  const prices = metrics.map((m) => m.price);
  const deliveryDays = metrics.map((m) => m.deliveryDays);
  const ratings = metrics.map((m) => m.ratingScore);

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minDelivery = Math.min(...deliveryDays);
  const maxDelivery = Math.max(...deliveryDays);
  const minRating = Math.min(...ratings);
  const maxRating = Math.max(...ratings);

  // Normalize to 0-100 scale
  return metrics.map((m) => {
    // For price: lower is better, so invert the normalization
    const priceScore =
      maxPrice === minPrice
        ? 100
        : ((maxPrice - m.price) / (maxPrice - minPrice)) * 100;

    // For delivery: lower is better (faster), so invert the normalization
    const deliveryScore =
      maxDelivery === minDelivery
        ? 100
        : ((maxDelivery - m.deliveryDays) / (maxDelivery - minDelivery)) * 100;

    // For rating: higher is better
    const ratingScore =
      maxRating === minRating
        ? 100
        : ((m.ratingScore - minRating) / (maxRating - minRating)) * 100;

    return {
      ...m,
      priceScore,
      deliveryScore,
      ratingScore,
    };
  });
};

/**
 * Get top 5 quotations ranked by composite score
 * @param {string} rfqId - RFQ ID
 * @returns {Promise<Array>} Top 5 quotations with scores
 */
export const getTopQuotations = async (rfqId) => {
  try {
    const analysis = await analyzeQuotations(rfqId);

    if (!analysis.analysis) {
      return [];
    }

    return analysis.analysis.totalMetrics.slice(0, 5);
  } catch (error) {
    console.error('Error getting top quotations:', error);
    throw error;
  }
};

/**
 * Get specific category winner
 * @param {string} rfqId - RFQ ID
 * @param {string} category - Category (price, delivery, rating)
 * @returns {Promise<Object>} Winner in category
 */
export const getCategoryWinner = async (rfqId, category) => {
  try {
    const analysis = await analyzeQuotations(rfqId);

    const categoryMap = {
      price: 'lowestPrice',
      delivery: 'fastestDelivery',
      rating: 'highestRated',
    };

    const categoryKey = categoryMap[category.toLowerCase()];

    if (!categoryKey || !analysis.analysis.winners[categoryKey]) {
      throw new Error(`Invalid category: ${category}`);
    }

    return {
      category,
      winner: analysis.analysis.winners[categoryKey],
    };
  } catch (error) {
    console.error('Error getting category winner:', error);
    throw error;
  }
};

/**
 * Compare two specific quotations
 * @param {string} quotationId1 - First quotation ID
 * @param {string} quotationId2 - Second quotation ID
 * @returns {Promise<Object>} Comparison result
 */
export const compareQuotations = async (quotationId1, quotationId2) => {
  try {
    const q1 = await quotationService.getQuotationById(quotationId1);
    const q2 = await quotationService.getQuotationById(quotationId2);

    if (!q1 || !q2) {
      throw new Error('One or both quotations not found');
    }

    if (q1.rfqId !== q2.rfqId) {
      throw new Error('Quotations must be for the same RFQ');
    }

    // Prepare metrics
    const metrics = [
      {
        quotationId: q1.id,
        vendorId: q1.vendor.id,
        companyName: q1.vendor.companyName,
        price: q1.totalPrice,
        deliveryDays: q1.deliveryDays || 30,
        ratingScore: q1.vendor.ratingScore || 0,
      },
      {
        quotationId: q2.id,
        vendorId: q2.vendor.id,
        companyName: q2.vendor.companyName,
        price: q2.totalPrice,
        deliveryDays: q2.deliveryDays || 30,
        ratingScore: q2.vendor.ratingScore || 0,
      },
    ];

    const normalized = normalizeMetrics(metrics);

    return {
      comparison: {
        quotation1: {
          ...normalized[0],
          compositeScore:
            normalized[0].priceScore * 0.4 +
            normalized[0].deliveryScore * 0.3 +
            normalized[0].ratingScore * 0.3,
          metrics: {
            price: parseFloat(normalized[0].price.toFixed(2)),
            deliveryDays: normalized[0].deliveryDays,
            vendorRating: parseFloat(normalized[0].ratingScore.toFixed(2)),
          },
        },
        quotation2: {
          ...normalized[1],
          compositeScore:
            normalized[1].priceScore * 0.4 +
            normalized[1].deliveryScore * 0.3 +
            normalized[1].ratingScore * 0.3,
          metrics: {
            price: parseFloat(normalized[1].price.toFixed(2)),
            deliveryDays: normalized[1].deliveryDays,
            vendorRating: parseFloat(normalized[1].ratingScore.toFixed(2)),
          },
        },
        winner:
          normalized[0].priceScore * 0.4 + normalized[0].deliveryScore * 0.3 + normalized[0].ratingScore * 0.3 >
          normalized[1].priceScore * 0.4 + normalized[1].deliveryScore * 0.3 + normalized[1].ratingScore * 0.3
            ? normalized[0].companyName
            : normalized[1].companyName,
      },
    };
  } catch (error) {
    console.error('Error comparing quotations:', error);
    throw error;
  }
};

/**
 * Get quotation performance report
 * @param {string} rfqId - RFQ ID
 * @returns {Promise<Object>} Performance report
 */
export const getPerformanceReport = async (rfqId) => {
  try {
    const analysis = await analyzeQuotations(rfqId);

    if (!analysis.analysis) {
      return {
        rfqId,
        message: 'Insufficient data for performance report',
      };
    }

    const totalMetrics = analysis.analysis.totalMetrics;

    // Calculate statistics
    const prices = totalMetrics.map((m) => m.price);
    const deliveries = totalMetrics.map((m) => m.deliveryDays);
    const ratings = totalMetrics.map((m) => m.vendorRating);
    const scores = totalMetrics.map((m) => m.compositeScore);

    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const avgDelivery = deliveries.reduce((a, b) => a + b, 0) / deliveries.length;
    const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    return {
      rfqId,
      summary: {
        totalQuotations: totalMetrics.length,
        averagePrice: parseFloat(avgPrice.toFixed(2)),
        averageDeliveryDays: parseFloat(avgDelivery.toFixed(1)),
        averageVendorRating: parseFloat(avgRating.toFixed(2)),
        averageCompositeScore: parseFloat(avgScore.toFixed(2)),
      },
      range: {
        priceRange: {
          min: parseFloat(Math.min(...prices).toFixed(2)),
          max: parseFloat(Math.max(...prices).toFixed(2)),
          difference: parseFloat((Math.max(...prices) - Math.min(...prices)).toFixed(2)),
          percentDifference: parseFloat(
            (((Math.max(...prices) - Math.min(...prices)) / Math.min(...prices)) * 100).toFixed(2)
          ),
        },
        deliveryRange: {
          min: Math.min(...deliveries),
          max: Math.max(...deliveries),
          difference: Math.max(...deliveries) - Math.min(...deliveries),
        },
        ratingRange: {
          min: parseFloat(Math.min(...ratings).toFixed(2)),
          max: parseFloat(Math.max(...ratings).toFixed(2)),
        },
      },
      topVendors: totalMetrics.slice(0, 3),
      bottomVendors: totalMetrics.slice(-3).reverse(),
    };
  } catch (error) {
    console.error('Error getting performance report:', error);
    throw error;
  }
};
