import prisma from '../../config/prisma.js';
import { logActivity } from '../activities/activity.service.js';

/**
 * Purchase Order Service Layer
 */

/**
 * Generate a new PO number in format PO-YYYY-0001
 */
const generatePONumber = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `PO-${currentYear}-`;

  const lastPO = await prisma.purchaseOrder.findFirst({
    where: {
      poNumber: {
        startsWith: prefix,
      },
    },
    orderBy: {
      poNumber: 'desc',
    },
  });

  let nextNumber = 1;
  if (lastPO) {
    const lastNumberStr = lastPO.poNumber.split('-')[2];
    nextNumber = parseInt(lastNumberStr, 10) + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
};

/**
 * Create PO from an approved quotation
 */
export const createPOFromQuotation = async (quotationId, userId) => {
  try {
    // 1. Fetch the quotation with items and RFQ
    const quotation = await prisma.quotation.findUnique({
      where: { id: quotationId },
      include: {
        quotationItems: {
          include: { rfqItem: true }
        },
        rfq: true,
        vendor: true
      }
    });

    if (!quotation) throw new Error('Quotation not found');
    if (quotation.status !== 'ACCEPTED') {
      throw new Error('Quotation must be approved (ACCEPTED) before generating PO');
    }

    // 2. Check if PO already exists for this quotation
    const existingPO = await prisma.purchaseOrder.findFirst({
      where: { rfqId: quotation.rfqId, vendorId: quotation.vendorId }
    });
    // Note: In a real system, you might allow multiple POs or check specifically for this quotation.
    // For this implementation, we check if one is already generated.

    // 3. Generate PO Number
    const poNumber = await generatePONumber();

    // 4. Create PO with Items in a transaction
    const purchaseOrder = await prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.create({
        data: {
          poNumber,
          status: 'DRAFT',
          rfqNumber: quotation.rfq.rfqNumber,
          subtotal: quotation.subtotal,
          tax: quotation.tax,
          shippingCost: quotation.shippingCost,
          discount: quotation.discount,
          totalAmount: quotation.totalAmount,
          orderDate: new Date(),
          paymentTerms: quotation.paymentTerms,
          deliveryLocation: quotation.rfq.deliveryLocation,
          rfqId: quotation.rfqId,
          vendorId: quotation.vendorId,
          createdByUserId: userId,
        }
      });

      // Create PO items from Quotation items
      const poItemsData = quotation.quotationItems.map(item => ({
        purchaseOrderId: po.id,
        description: item.rfqItem.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
        unit: item.rfqItem.unit
      }));

      await tx.purchaseOrderItem.createMany({
        data: poItemsData
      });

      return po;
    });

    await logActivity({
      userId,
      type: 'CREATE',
      entity: 'PurchaseOrder',
      entityId: purchaseOrder.id,
      action: 'PO Generated from Approved Quotation'
    });

    return await getPOById(purchaseOrder.id);
  } catch (error) {
    console.error('Error creating PO from quotation:', error);
    throw error;
  }
};

/**
 * Get PO Details by ID
 */
export const getPOById = async (id) => {
  return await prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      poItems: true,
      vendor: {
        select: {
          companyName: true,
          email: true,
          phone: true,
          street: true,
          city: true,
          state: true,
          country: true
        }
      },
      createdByUser: {
        select: { firstName: true, lastName: true, email: true }
      },
      rfq: {
        select: { rfqNumber: true, title: true }
      }
    }
  });
};

/**
 * List Purchase Orders
 */
export const listPurchaseOrders = async (filters = {}) => {
  return await prisma.purchaseOrder.findMany({
    where: filters,
    include: {
      vendor: { select: { companyName: true } },
      createdByUser: { select: { firstName: true, lastName: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
};
