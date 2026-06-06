import * as poService from './po.service.js';

/**
 * Generate PO from approved quotation
 */
export const createPO = async (req, res) => {
  try {
    const { quotationId } = req.body;
    const po = await poService.createPOFromQuotation(quotationId, req.user.id);
    res.status(201).json({
      success: true,
      message: 'Purchase Order generated successfully',
      data: po,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get PO Details
 */
export const getPODetails = async (req, res) => {
  try {
    const po = await poService.getPOById(req.params.poId);
    if (!po) {
      return res.status(404).json({ success: false, message: 'Purchase Order not found' });
    }
    res.status(200).json({
      success: true,
      data: po,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * List Purchase Orders
 */
export const listPOs = async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.vendorId) filters.vendorId = req.query.vendorId;

    const pos = await poService.listPurchaseOrders(filters);
    res.status(200).json({
      success: true,
      data: pos,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
