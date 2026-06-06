import express from 'express';
import * as invoiceController from './invoice.controller.js';
// import { authenticate } from '../../middleware/auth.js';

const router = express.Router();

// router.use(authenticate);

router.post('/', invoiceController.createInvoice);
router.get('/', invoiceController.listInvoices);
router.get('/:invoiceId', invoiceController.getInvoiceDetails);
router.get('/:invoiceId/download', invoiceController.downloadInvoice);
router.post('/:invoiceId/send-email', invoiceController.sendEmail);
router.patch('/:invoiceId/pay', invoiceController.markAsPaid);

export default router;
