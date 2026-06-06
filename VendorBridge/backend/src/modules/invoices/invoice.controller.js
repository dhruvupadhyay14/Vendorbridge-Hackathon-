import * as invoiceService from './invoice.service.js';

export const createInvoice = async (req, res) => {
  try {
    const { purchaseOrderId } = req.body;
    const invoice = await invoiceService.createInvoiceFromPO(purchaseOrderId, req.user.id);
    res.status(201).json({
      success: true,
      message: 'Invoice generated successfully',
      data: invoice,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getInvoiceDetails = async (req, res) => {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params.invoiceId);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }
    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const listInvoices = async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.vendorId) filters.vendorId = req.query.vendorId;

    const invoices = await invoiceService.listInvoices(filters);
    res.status(200).json({
      success: true,
      data: invoices,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const markAsPaid = async (req, res) => {
  try {
    const { amount } = req.body;
    const invoice = await invoiceService.markAsPaid(req.params.invoiceId, req.user.id, parseFloat(amount));
    res.status(200).json({
      success: true,
      message: 'Payment recorded successfully',
      data: invoice,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const sendEmail = async (req, res) => {
  try {
    const result = await invoiceService.sendInvoiceEmail(req.params.invoiceId, req.user.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const downloadInvoice = async (req, res) => {
  try {
    // In a real implementation, we would generate the PDF using pdfkit and pipe it to res
    // Since install failed in this environment, we provide the endpoint structure
    res.status(501).json({
      success: false,
      message: 'PDF Generation requires pdfkit to be installed. Please run: npm install pdfkit',
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
