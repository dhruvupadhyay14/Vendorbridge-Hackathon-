import express from 'express';
import * as approvalController from './approval.controller.js';
import * as approvalValidation from './approval.validation.js';
// Assuming there is an auth middleware
// import { authenticate, authorize } from '../../middleware/auth.js';

const router = express.Router();

// All routes require authentication
// router.use(authenticate);

router.post(
  '/',
  approvalValidation.createApprovalValidation,
  approvalValidation.handleValidationErrors,
  approvalController.createApproval
);

router.get(
  '/',
  approvalValidation.paginationValidation,
  approvalValidation.handleValidationErrors,
  approvalController.listApprovals
);

router.get(
  '/:approvalId',
  approvalValidation.getApprovalValidation,
  approvalValidation.handleValidationErrors,
  approvalController.getApprovalDetails
);

router.patch(
  '/:approvalId/approve-l1',
  // authorize('MANAGER', 'ADMIN'),
  approvalController.approveL1
);

router.patch(
  '/:approvalId/approve-l2',
  // authorize('ADMIN'),
  approvalController.approveL2
);

router.patch(
  '/:approvalId/reject',
  // authorize('MANAGER', 'ADMIN'),
  approvalController.rejectApproval
);

export default router;
