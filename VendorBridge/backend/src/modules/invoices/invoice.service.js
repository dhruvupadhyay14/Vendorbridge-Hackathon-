import prisma from '../../config/prisma.js';
import { logActivity } from '../activities/activity.service.js';
import nodemailer from 'nodemailer';
// pdfkit would be used here. If install fails, user needs to run npm install pdfkit
// import PDFDocument from 'pdfkit';

/**
 * Invoice Service Layer
 */

/**
 * Calculate GST and totals
 */
const calculateInvoiceTotals = (items, taxRate = 18) => {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const tax = (subtotal * taxRate) / 100;
  const totalAmount = subtotal + tax;
  return { subtotal, tax, taxRate, totalAmount };
};

/**
 * Generate Invoice from PO
 */
export const createInvoiceFromPO = async (poId, userId) => {
  try {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id: poId },
      include: { poItems: true, vendor: true }
    });

    if (!po) throw new Error('Purchase Order not found');
    if (po.status !== 'APPROVED' && po.status !== 'COMPLETED') {
      throw new Error('PO must be approved before invoicing');
    }

    const { subtotal, tax, taxRate, totalAmount } = calculateInvoiceTotals(po.poItems);

    const invoice = await prisma.$transaction(async (tx) => {
      const inv = await tx.invoice.create({
        data: {
          invoiceNumber: `INV-${po.poNumber.split('-').slice(1).join('-')}`,
          status: 'DRAFT',
          invoiceDate: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days due
          subtotal,
          tax,
          taxRate,
          totalAmount,
          remainingAmount: totalAmount,
          purchaseOrderId: po.id,
          vendorId: po.vendorId,
        }
      });

      const invItems = po.poItems.map(item => ({
        invoiceId: inv.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.lineTotal,
        unit: item.unit
      }));

      await tx.invoiceItem.createMany({ data: invItems });
      return inv;
    });

    await logActivity({
      userId,
      type: 'CREATE',
      entity: 'Invoice',
      entityId: invoice.id,
      action: 'Invoice Generated from PO'
    });

    return await getInvoiceById(invoice.id);
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
};

/**
 * Mark Invoice as Paid
 */
export const markAsPaid = async (invoiceId, userId, amount) => {
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) throw new Error('Invoice not found');

  const paidAmount = (invoice.paidAmount || 0) + amount;
  const remainingAmount = invoice.totalAmount - paidAmount;
  const status = remainingAmount <= 0 ? 'PAID' : 'PARTIALLY_PAID';

  const updated = await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      paidAmount,
      remainingAmount,
      status,
      paidDate: status === 'PAID' ? new Date() : null
    }
  });

  await logActivity({
    userId,
    type: 'UPDATE',
    entity: 'Invoice',
    entityId: invoiceId,
    action: `Invoice marked as ${status}`,
    newValues: { paidAmount, status }
  });

  return updated;
};

/**
 * Get Invoice Details
 */
export const getInvoiceById = async (id) => {
  return await prisma.invoice.findUnique({
    where: { id },
    include: {
      invoiceItems: true,
      vendor: true,
      purchaseOrder: { select: { poNumber: true } }
    }
  });
};

/**
 * Email Invoice (Stub for Nodemailer)
 */
export const sendInvoiceEmail = async (invoiceId, userId) => {
  const invoice = await getInvoiceById(invoiceId);
  if (!invoice) throw new Error('Invoice not found');

  // Configure transporter (usually from environment variables)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: process.env.SMTP_PORT || 2525,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const mailOptions = {
    from: '"VendorBridge" <no-reply@vendorbridge.com>',
    to: invoice.vendor.email,
    subject: `Invoice ${invoice.invoiceNumber} from VendorBridge`,
    text: `Dear ${invoice.vendor.contactPersonName},\n\nPlease find attached your invoice ${invoice.invoiceNumber} for the total amount of ${invoice.totalAmount}.\n\nBest regards,\nVendorBridge Team`,
    // attachments: [{ filename: `${invoice.invoiceNumber}.pdf`, content: pdfBuffer }]
  };

  await transporter.sendMail(mailOptions);

  await logActivity({
    userId,
    type: 'APPROVE',
    entity: 'Invoice',
    entityId: invoiceId,
    action: 'Invoice Email Sent'
  });

  return { success: true, message: 'Email sent successfully' };
};

export const listInvoices = async (filters = {}) => {
  return await prisma.invoice.findMany({
    where: filters,
    include: { vendor: { select: { companyName: true } } },
    orderBy: { createdAt: 'desc' }
  });
};
