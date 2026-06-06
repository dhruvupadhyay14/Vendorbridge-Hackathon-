import express from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import vendorRoutes from '../modules/vendors/vendor.routes.js';
import rfqRoutes from '../modules/rfqs/rfq.routes.js';
import quotationRoutes from '../modules/quotations/quotation.routes.js';
import approvalRoutes from '../modules/approvals/approval.routes.js';
import poRoutes from '../modules/purchase-orders/po.routes.js';
import invoiceRoutes from '../modules/invoices/invoice.routes.js';
import activityRoutes from '../modules/activities/activity.routes.js';
import reportRoutes from '../modules/reports/report.routes.js';

const router = express.Router();

// ============== HEALTH CHECK ENDPOINTS ==============

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API status endpoint
router.get('/status', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'VendorBridge API is operational',
    version: process.env.API_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// API info endpoint
router.get('/info', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      name: 'VendorBridge API',
      description: 'Procurement & Vendor Management ERP Backend',
      version: process.env.API_VERSION || '1.0.0',
      environment: process.env.NODE_ENV,
      uptime: process.uptime(),
    },
  });
});

// ============== MODULE ROUTES ==============

// Authentication routes
router.use('/auth', authRoutes);

// Vendor routes
router.use('/vendors', vendorRoutes);

// RFQ routes
router.use('/rfqs', rfqRoutes);

// Quotation routes
router.use('/quotations', quotationRoutes);

// Approval routes
router.use('/approvals', approvalRoutes);

// Purchase Order routes
router.use('/purchase-orders', poRoutes);

// Invoice routes
router.use('/invoices', invoiceRoutes);

// Activity Log routes
router.use('/activities', activityRoutes);

// Report routes
router.use('/reports', reportRoutes);

export default router;
