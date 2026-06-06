import prisma from '../../config/prisma.js';
import { logActivity } from '../activities/activity.service.js';

/**
 * Approval Service Layer
 * Handles all business logic for approval workflow
 */

// ============================================================================
// CREATE OPERATIONS
// ============================================================================

/**
 * Create approval request for an RFQ/Quotation
 * @param {Object} data - Approval data { rfqId, quotationId, approvalType, remarks }
 * @param {string} userId - User requesting approval
 * @returns {Promise<Object>} Created approval
 */
export const createApprovalRequest = async (data, userId) => {
  const { rfqId, quotationId, approvalType, remarks } = data;

  try {
    // Check if an approval already exists for this quotation
    const existing = await prisma.approval.findFirst({
      where: { quotationId, status: { not: 'REJECTED' } }
    });

    if (existing) {
      throw new Error('An active approval request already exists for this quotation.');
    }

    const timeline = [
      {
        status: 'PENDING',
        userId,
        timestamp: new Date(),
        remarks: remarks || 'Approval requested'
      }
    ];

    const approval = await prisma.approval.create({
      data: {
        rfqId,
        quotationId,
        approvalType: approvalType || 'QUOTATION_APPROVAL',
        requestedByUserId: userId,
        status: 'PENDING',
        currentLevel: 0,
        remarks,
        timeline
      },
      include: {
        quotation: true,
        rfq: true
      }
    });

    return approval;
  } catch (error) {
    console.error('Error creating approval request:', error);
    throw error;
  }
};

// ============================================================================
// UPDATE OPERATIONS
// ============================================================================

/**
 * Approve RFQ/Quotation at Level 1
 */
export const approveL1 = async (approvalId, userId, remarks) => {
  try {
    const approval = await prisma.approval.findUnique({ where: { id: approvalId } });
    if (!approval) throw new Error('Approval request not found');
    if (approval.status !== 'PENDING') throw new Error('Invalid status for L1 approval');

    const updatedTimeline = Array.isArray(approval.timeline) ? approval.timeline : [];
    updatedTimeline.push({
      status: 'L1_APPROVED',
      userId,
      timestamp: new Date(),
      remarks
    });

    return await prisma.approval.update({
      where: { id: approvalId },
      data: {
        status: 'L1_APPROVED',
        currentLevel: 1,
        approvedByL1Id: userId,
        remarks,
        timeline: updatedTimeline
      }
    });
  } catch (error) {
    console.error('Error in L1 approval:', error);
    throw error;
  }
};

/**
 * Approve RFQ/Quotation at Level 2 (Final Approval)
 */
export const approveL2 = async (approvalId, userId, remarks) => {
  try {
    const approval = await prisma.approval.findUnique({ where: { id: approvalId } });
    if (!approval) throw new Error('Approval request not found');
    if (approval.status !== 'L1_APPROVED') throw new Error('L1 approval required before L2');

    const updatedTimeline = Array.isArray(approval.timeline) ? approval.timeline : [];
    updatedTimeline.push({
      status: 'L2_APPROVED',
      userId,
      timestamp: new Date(),
      remarks
    });

    // When L2 is approved, we mark the main status as L2_APPROVED or APPROVED
    const updatedApproval = await prisma.approval.update({
      where: { id: approvalId },
      data: {
        status: 'L2_APPROVED',
        currentLevel: 2,
        approvedByL2Id: userId,
        remarks,
        timeline: updatedTimeline
      }
    });

    await logActivity({
      userId,
      type: 'APPROVE',
      entity: 'Approval',
      entityId: updatedApproval.id,
      action: 'Approval Completed (L2)'
    });

    // Additionally, update the Quotation status to ACCEPTED
    await prisma.quotation.update({
      where: { id: approval.quotationId },
      data: { status: 'ACCEPTED' }
    });

    return updatedApproval;
  } catch (error) {
    console.error('Error in L2 approval:', error);
    throw error;
  }
};

/**
 * Reject RFQ/Quotation
 */
export const rejectApproval = async (approvalId, userId, reason) => {
  try {
    const approval = await prisma.approval.findUnique({ where: { id: approvalId } });
    if (!approval) throw new Error('Approval request not found');

    const updatedTimeline = Array.isArray(approval.timeline) ? approval.timeline : [];
    updatedTimeline.push({
      status: 'REJECTED',
      userId,
      timestamp: new Date(),
      remarks: reason
    });

    const updatedApproval = await prisma.approval.update({
      where: { id: approvalId },
      data: {
        status: 'REJECTED',
        rejectedById: userId,
        rejectionReason: reason,
        timeline: updatedTimeline
      }
    });

    // Update quotation status back to SUBMITTED or REJECTED
    await prisma.quotation.update({
      where: { id: approval.quotationId },
      data: { status: 'REJECTED' }
    });

    return updatedApproval;
  } catch (error) {
    console.error('Error rejecting approval:', error);
    throw error;
  }
};

// ============================================================================
// READ OPERATIONS
// ============================================================================

export const getApprovalById = async (id) => {
  return await prisma.approval.findUnique({
    where: { id },
    include: {
      quotation: { include: { vendor: true, quotationItems: true } },
      rfq: { include: { rfqItems: true } },
      requestedBy: true,
      approvedByL1: true,
      approvedByL2: true,
      rejectedBy: true
    }
  });
};

export const listApprovals = async (filters = {}) => {
  return await prisma.approval.findMany({
    where: filters,
    include: {
      quotation: { select: { quotationNumber: true, totalAmount: true, vendor: { select: { companyName: true } } } },
      rfq: { select: { rfqNumber: true, title: true } },
      requestedBy: { select: { firstName: true, lastName: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
};
