export type UserRole = 'officer' | 'vendor' | 'manager' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  vendorId?: string; // set if role is 'vendor'
}

export interface Vendor {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  category: string;
  gstNumber: string;
  status: 'Active' | 'Under Review' | 'On Hold' | 'Blacklisted';
  rating: number; // 0 - 5
  reliabilityScore: number; // 0 - 100 based on delivery SLA and quality
  responseRate: number; // 0 - 100 percentage of RFQs responded in time
  cycleTimeDays: number; // average days from RFQ to delivery
  riskLevel: 'Low' | 'Medium' | 'High';
  pendingTasksCount: number;
  slaComplianceRate: number; // 0 - 100 progress
  pricingCompetitiveness: 'Excellent' | 'Good' | 'Average' | 'High-Cost';
  yearsPartnered: number;
}

export interface RFQItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  description?: string;
  targetPrice?: number;
}

export interface RFQ {
  id: string;
  title: string;
  description: string;
  category: string;
  items: RFQItem[];
  createdBy: string;
  createdAt: string;
  deadline: string;
  assignedVendors: string[]; // Vendor IDs
  status: 'Draft' | 'Published' | 'Under Comparison' | 'Pending Approval' | 'Approved' | 'PO Generated' | 'Closed';
  attachmentName?: string;
  approvalRemarks?: string;
}

export interface QuotationItem {
  itemId: string;
  name: string;
  unitPrice: number;
  totalPrice: number;
  compliance: boolean; // meets specification
}

export interface Quotation {
  id: string;
  rfqId: string;
  vendorId: string;
  vendorName: string;
  submittedAt: string;
  items: QuotationItem[];
  leadTimeDays: number;
  notes: string;
  status: 'Submitted' | 'Selected' | 'Rejected';
  taxRate: number; // percentage (e.g. 18 for 18% GST)
  shippingCost: number;
  grandTotal: number;
  uniquenessBenefit?: string; // e.g., "Contains 5% volume discount", "Custom premium warranty included"
}

export interface ApprovalTimelineEvent {
  status: string;
  timestamp: string;
  actor: string;
  comment?: string;
}

export interface ApprovalRequest {
  id: string;
  rfqId: string;
  quotationId: string;
  requestedBy: string;
  requestedAt: string;
  details: {
    priceScore: number; // 0-100
    reliabilityScore: number; // 0-100
    bottleneckScore: number; // 0-100 bottleneck level (lower is better, or higher is safer)
    savingsCalculated: number; // in currency, vs target or vs next highest quotation
    cycleTimeDays: number;
  };
  status: 'Pending' | 'Approved' | 'Rejected';
  reviewersComment?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  timeline: ApprovalTimelineEvent[];
}

export interface PurchaseOrder {
  id: string;
  rfqId: string;
  quotationId: string;
  vendorId: string;
  poNumber: string;
  createdAt: string;
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  status: 'Issued' | 'Acknowledged' | 'In Transit' | 'Delivered' | 'Paid';
  billingAddress: string;
  shippingAddress: string;
}

export interface Invoice {
  id: string;
  poId: string;
  poNumber: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  status: 'Draft' | 'Sent' | 'Overdue' | 'Paid';
  paymentTerms: string;
  paymentMethod?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: string;
  details: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'rfq' | 'quotation' | 'approval' | 'invoice' | 'system';
  read: boolean;
}
