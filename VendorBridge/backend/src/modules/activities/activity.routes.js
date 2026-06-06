import express from 'express';
import * as activityController from './activity.controller.js';
// import { authenticate, authorize } from '../../middleware/auth.js';

const router = express.Router();

// router.use(authenticate);
// router.use(authorize('ADMIN', 'MANAGER'));

router.get('/', activityController.getLogs);

export default router;
