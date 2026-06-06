import express from 'express';
import * as reportController from './report.controller.js';
// import { authenticate, authorize } from '../../middleware/auth.js';

const router = express.Router();

// router.use(authenticate);
// router.use(authorize('ADMIN', 'MANAGER'));

router.get('/dashboard', reportController.getDashboardStats);
router.get('/spending', reportController.getSpendingReport);
router.get('/vendor-performance', reportController.getVendorPerformance);
router.get('/trends', reportController.getTrends);
router.get('/top-vendors', reportController.getTopVendors);

export default router;
