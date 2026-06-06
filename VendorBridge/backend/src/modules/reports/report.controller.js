import * as reportService from './report.service.js';

export const getDashboardStats = async (req, res) => {
  try {
    const data = await reportService.getDashboardAnalytics();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getSpendingReport = async (req, res) => {
  try {
    const data = await reportService.getMonthlySpending();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getVendorPerformance = async (req, res) => {
  try {
    const data = await reportService.getVendorPerformance();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getTrends = async (req, res) => {
  try {
    const data = await reportService.getProcurementTrends();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getTopVendors = async (req, res) => {
  try {
    const data = await reportService.getTopVendors();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
