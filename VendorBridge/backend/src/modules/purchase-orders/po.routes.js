import express from 'express';
import * as poController from './po.controller.js';
import * as poValidation from './po.validation.js';
// import { authenticate } from '../../middleware/auth.js';

const router = express.Router();

// router.use(authenticate);

router.post(
  '/',
  poValidation.createPOValidation,
  poValidation.handleValidationErrors,
  poController.createPO
);

router.get(
  '/',
  poValidation.listPOValidation,
  poValidation.handleValidationErrors,
  poController.listPOs
);

router.get(
  '/:poId',
  poValidation.getPOValidation,
  poValidation.handleValidationErrors,
  poController.getPODetails
);

export default router;
