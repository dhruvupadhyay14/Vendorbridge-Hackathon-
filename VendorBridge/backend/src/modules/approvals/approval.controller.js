import * as approvalService from './approval.service.js';

/**
 * Create a new approval request
 */
export const createApproval = async (req, res) => {
  try {
    const approval = await approvalService.createApprovalRequest(req.body, req.user.id);
    res.status(201).json({
      success: true,
      message: 'Approval request created successfully',
      data: approval,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * L1 Approval
 */
export const approveL1 = async (req, res) => {
  try {
    const { approvalId } = req.params;
    const { remarks } = req.body;
    const approval = await approvalService.approveL1(approvalId, req.user.id, remarks);
    res.status(200).json({
      success: true,
      message: 'L1 Approval successful',
      data: approval,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * L2 Approval (Final)
 */
export const approveL2 = async (req, res) => {
  try {
    const { approvalId } = req.params;
    const { remarks } = req.body;
    const approval = await approvalService.approveL2(approvalId, req.user.id, remarks);
    res.status(200).json({
      success: true,
      message: 'L2 Approval successful. Quotation accepted.',
      data: approval,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Reject Approval Request
 */
export const rejectApproval = async (req, res) => {
  try {
    const { approvalId } = req.params;
    const { reason } = req.body;
    const approval = await approvalService.rejectApproval(approvalId, req.user.id, reason);
    res.status(200).json({
      success: true,
      message: 'Approval request rejected',
      data: approval,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Get Approval Details
 */
export const getApprovalDetails = async (req, res) => {
  try {
    const approval = await approvalService.getApprovalById(req.params.approvalId);
    if (!approval) {
      return res.status(404).json({ success: false, message: 'Approval not found' });
    }
    res.status(200).json({
      success: true,
      data: approval,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * List Approvals
 */
export const listApprovals = async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;

    const approvals = await approvalService.listApprovals(filters);
    res.status(200).json({
      success: true,
      data: approvals,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
