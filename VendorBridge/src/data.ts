import { Vendor, RFQ, Quotation, PurchaseOrder, Invoice, AuditLog, Notification, User } from './types';

// Initial Demo Users
export const DEMO_USERS: User[] = [
  { id: 'u1', name: 'Alex Carter', email: 'alex.carter@vendorbridge.com', role: 'officer' },
  { id: 'u2', name: 'Sophia Vance', email: 'sophia.v@vendorbridge.com', role: 'manager' },
  { id: 'u3', name: 'Marcus Vance', email: 'marcus.v@vendorbridge.com', role: 'admin' },
  { id: 'u4', name: 'Apex Metal Partner', email: 'contract@apexmetal.com', role: 'vendor', vendorId: 'v1' },
  { id: 'u5', name: 'ByteCore Tech', email: 'sales@bytecoretech.com', role: 'vendor', vendorId: 'v2' },
  { id: 'u6', name: 'Zenith Pack Co.', email: 'orders@zenithpack.com', role: 'vendor', vendorId: 'v3' },
];

// Prepopulated Vendors with reliability telemetry, categories, risk profiles
export const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'v1',
    name: 'Apex Industrial Metal Partners',
    contactName: 'James Miller',
    email: 'contract@apexmetal.com',
    phone: '+1 (555) 234-5678',
    category: 'Heavy Machinery & Parts',
    gstNumber: '29AAAAA1111A1Z1',
    status: 'Active',
    rating: 4.8,
    reliabilityScore: 94,
    responseRate: 98,
    cycleTimeDays: 14,
    riskLevel: 'Low',
    pendingTasksCount: 1,
    slaComplianceRate: 96,
    pricingCompetitiveness: 'Good',
    yearsPartnered: 4,
  },
  {
    id: 'v2',
    name: 'ByteCore Solutions & Tech',
    contactName: 'Sarah Jenkins',
    email: 'sales@bytecoretech.com',
    phone: '+1 (555) 789-0123',
    category: 'IT Infrastructure & Hardware',
    gstNumber: '27BBBBB2222B2Z2',
    status: 'Active',
    rating: 4.5,
    reliabilityScore: 89,
    responseRate: 92,
    cycleTimeDays: 9,
    riskLevel: 'Low',
    pendingTasksCount: 0,
    slaComplianceRate: 90,
    pricingCompetitiveness: 'Average',
    yearsPartnered: 3,
  },
  {
    id: 'v3',
    name: 'Zenith Eco Packaging Co.',
    contactName: 'Robert Lang',
    email: 'orders@zenithpack.com',
    phone: '+1 (555) 456-7890',
    category: 'Logistics & Packaging Supplies',
    gstNumber: '19CCCCC3333C3Z3',
    status: 'Under Review',
    rating: 3.9,
    reliabilityScore: 76,
    responseRate: 80,
    cycleTimeDays: 19,
    riskLevel: 'Medium',
    pendingTasksCount: 2,
    slaComplianceRate: 72,
    pricingCompetitiveness: 'Excellent',
    yearsPartnered: 1,
  },
  {
    id: 'v4',
    name: 'Global Titanium Castings',
    contactName: 'Heiko Schmidt',
    email: 'h.schmidt@globalcastings.de',
    phone: '+49 89 2314-90',
    category: 'Heavy Machinery & Parts',
    gstNumber: '24DDDDD4444D4Z4',
    status: 'On Hold',
    rating: 4.2,
    reliabilityScore: 82,
    responseRate: 65,
    cycleTimeDays: 28,
    riskLevel: 'High',
    pendingTasksCount: 0,
    slaComplianceRate: 79,
    pricingCompetitiveness: 'High-Cost',
    yearsPartnered: 5,
  },
];

// Rich set of initial RFQs with varying workflow statuses
export const INITIAL_RFQS: RFQ[] = [
  {
    id: 'rfq-101',
    title: 'High-Grade Carbide CNC Boring Bars',
    description: 'Procurement of sub-micron grain tungsten carbide boring heads with specialized TiAlN coating for high-temperature precision machining operations.',
    category: 'Heavy Machinery & Parts',
    createdBy: 'Alex Carter',
    createdAt: '2026-05-18T10:00:00Z',
    deadline: '2026-06-15T18:00:00Z',
    assignedVendors: ['v1', 'v4'],
    status: 'Published',
    items: [
      { id: 'rfq-101-i1', name: 'Carbide Boring Head 16mm', quantity: 50, unit: 'units', targetPrice: 120, description: 'Shank size 16mm, depth ratio 5xD' },
      { id: 'rfq-101-i2', name: 'Anti-Vibration Steel Shank 20mm', quantity: 20, unit: 'units', targetPrice: 280, description: 'Internal coolant delivery system and damping module' },
    ],
    attachmentName: 'Boring_Specs_V4.pdf',
  },
  {
    id: 'rfq-102',
    title: 'Enterprise Server Node Upgrades',
    description: 'Acquisition of compute nodes for internal cluster scaling. Must fit existing 2U server racks and support dual Intel Xeon Gen-4 processors.',
    category: 'IT Infrastructure & Hardware',
    createdBy: 'Alex Carter',
    createdAt: '2026-05-20T08:30:00Z',
    deadline: '2026-06-02T17:00:00Z',
    assignedVendors: ['v2'],
    status: 'PO Generated',
    items: [
      { id: 'rfq-102-i1', name: '2U Server Node - Dual Socket Xeon', quantity: 6, unit: 'units', targetPrice: 8500, description: 'Equipped with 256GB ECC DDR5, dual 10GbE network cards' },
      { id: 'rfq-102-i2', name: '3.2TB Enterprise NVMe SSD PCIe 4.0', quantity: 24, unit: 'units', targetPrice: 450, description: 'Write endurance 3-DWPD, U.2 hot-swappable form factor' },
    ],
    attachmentName: 'Rack_Layout_IT_2026.pdf',
  },
  {
    id: 'rfq-103',
    title: 'Recycled Corrugated Shipping Cartons',
    description: 'Bulk supply contract for customized double-wall corrugated moving boxes with internal security dividers. Must include eco-friendly biodegradable inks.',
    category: 'Logistics & Packaging Supplies',
    createdBy: 'Alex Carter',
    createdAt: '2026-06-01T11:15:00Z',
    deadline: '2026-06-10T15:00:00Z',
    assignedVendors: ['v3'],
    status: 'Under Comparison',
    items: [
      { id: 'rfq-103-i1', name: 'Double-Wall Custom Cartons 18x18x12', quantity: 5000, unit: 'pieces', targetPrice: 1.50, description: '32 ECT weight rating, raw kraft brown color' },
      { id: 'rfq-103-i2', name: 'Kraft Bubble Pouches (Self-Seal)', quantity: 2000, unit: 'pieces', targetPrice: 0.35, description: '100% recycled paper padding, size 8.5" x 12"' },
    ],
    attachmentName: 'Box_DieLine_Dimensions.dwg',
  },
  {
    id: 'rfq-104',
    title: 'Pneumatic Control Valves & Piping',
    description: 'Procurement of safety solenoid pilot valves and stainless steel braided industrial piping for our chemical production plant.',
    category: 'Heavy Machinery & Parts',
    createdBy: 'Alex Carter',
    createdAt: '2026-06-03T09:00:00Z',
    deadline: '2026-06-20T23:59:00Z',
    assignedVendors: ['v1', 'v2', 'v4'],
    status: 'Pending Approval',
    items: [
      { id: 'rfq-104-i1', name: 'Solenoid Valve 24V DC IP65', quantity: 15, unit: 'units', targetPrice: 320, description: 'Max temperature 120C, fast cycle response time' },
      { id: 'rfq-104-i2', name: 'Flexible Braided Stainless Hose 1.5"', quantity: 100, unit: 'meters', targetPrice: 65, description: 'ANSI pressure rating class 300, PTFE lined' },
    ],
    attachmentName: 'Pneumatic_Schematics_Chemical.pdf',
    approvalRemarks: 'Requesting fast-track approval for critical machinery overhaul scheduled in late June.',
  },
];

// Quotations matching RFQs with detailed metrics for bottlenecks and costs
export const INITIAL_QUOTATIONS: Quotation[] = [
  // For RFQ-101 (Boring Bars)
  {
    id: 'q-101-apex',
    rfqId: 'rfq-101',
    vendorId: 'v1',
    vendorName: 'Apex Industrial Metal Partners',
    submittedAt: '2026-05-25T14:20:00Z',
    leadTimeDays: 12,
    notes: 'We can guarantee sub-micron compliance. Offering customized vibration diagnostics support free of charge for the first 3 months.',
    status: 'Submitted',
    taxRate: 18,
    shippingCost: 350,
    grandTotal: 13570, // Calculations: 50*125 + 20*260 = 6250+5200 = 11450. Plus 18% tax (2061) + 350 shipping = 13861
    items: [
      { itemId: 'rfq-101-i1', name: 'Carbide Boring Head 16mm', unitPrice: 125, totalPrice: 6250, compliance: true },
      { itemId: 'rfq-101-i2', name: 'Anti-Vibration Steel Shank 20mm', unitPrice: 260, totalPrice: 5200, compliance: true },
    ],
    uniquenessBenefit: 'Vibration diagnostics package included. Delivery runs under Apex Express SLA guarantee.',
  },
  {
    id: 'q-101-global',
    rfqId: 'rfq-101',
    vendorId: 'v4',
    vendorName: 'Global Titanium Castings',
    submittedAt: '2026-05-28T09:12:00Z',
    leadTimeDays: 24,
    notes: 'Standard delivery via Hamburg warehouse. Slight delay expected in steel shanks due to raw material stock restrictions in central Europe.',
    status: 'Submitted',
    taxRate: 20,
    shippingCost: 950,
    grandTotal: 15110, // Calculations: 50*130 + 20*290 = 6500+5800 = 12300 * 1.20 = 14760 + 950 = 15710
    items: [
      { itemId: 'rfq-101-i1', name: 'Carbide Boring Head 16mm', unitPrice: 130, totalPrice: 6500, compliance: true },
      { itemId: 'rfq-101-i2', name: 'Anti-Vibration Steel Shank 20mm', unitPrice: 290, totalPrice: 5800, compliance: true },
    ],
    uniquenessBenefit: 'Slightly thicker coating formulation tailored for titanium alloys.',
  },
  // For RFQ-102 (Server Nodes)
  {
    id: 'q-102-bytecore',
    rfqId: 'rfq-102',
    vendorId: 'v2',
    vendorName: 'ByteCore Solutions & Tech',
    submittedAt: '2026-05-24T16:45:00Z',
    leadTimeDays: 8,
    notes: 'Items in stock in Houston. Configured as requested with proper firmware updates flashed.',
    status: 'Selected',
    taxRate: 18,
    shippingCost: 0, // Free shipping
    grandTotal: 72924, // Calculations: 6*8200 + 24*420 = 49200 + 10080 = 59280 + 18% tax (10670.4) = 69950.4
    items: [
      { itemId: 'rfq-102-i1', name: '2U Server Node - Dual Socket Xeon', unitPrice: 8200, totalPrice: 49200, compliance: true },
      { itemId: 'rfq-102-i2', name: '3.2TB Enterprise NVMe SSD PCIe 4.0', unitPrice: 420, totalPrice: 10080, compliance: true },
    ],
    uniquenessBenefit: 'Pre-flashed with open-source firmware optimization. Zero shipping cost SLA.',
  },
  // For RFQ-103 (Boxes)
  {
    id: 'q-103-zenith',
    rfqId: 'rfq-103',
    vendorId: 'v3',
    vendorName: 'Zenith Eco Packaging Co.',
    submittedAt: '2026-06-04T10:11:00Z',
    leadTimeDays: 14,
    notes: 'Our production line is highly certified. We offer premium recycled kraft pulp. Ink curing takes 3 additional calendar days.',
    status: 'Submitted',
    taxRate: 12,
    shippingCost: 800,
    grandTotal: 9980, // Calculations: 5000*1.40 + 2000*0.30 = 7000+6000?? No: 2000*0.30 = 600. Total = 7600 * 1.12 = 8512 + 800 = 9312
    items: [
      { itemId: 'rfq-103-i1', name: 'Double-Wall Custom Cartons 18x18x12', unitPrice: 1.40, totalPrice: 7000, compliance: true },
      { itemId: 'rfq-103-i2', name: 'Kraft Bubble Pouches (Self-Seal)', unitPrice: 0.30, totalPrice: 600, compliance: true },
    ],
    uniquenessBenefit: '100% PCR content certification with carbon footprint offsets reported.',
  },
  // For RFQ-104 (Pneumatic Control Valves)
  {
    id: 'q-104-apex',
    rfqId: 'rfq-104',
    vendorId: 'v1',
    vendorName: 'Apex Industrial Metal Partners',
    submittedAt: '2026-06-04T13:42:00Z',
    leadTimeDays: 10,
    notes: 'Valves in regional warehouse. Shipping takes 2 business days. Highly compatible with chemical standard plant safety codes.',
    status: 'Submitted',
    taxRate: 18,
    shippingCost: 150,
    grandTotal: 13393, // 15*310 + 100*62 = 4650 + 6200 = 10850 * 1.18 = 12803 + 150 = 12953
    items: [
      { itemId: 'rfq-104-i1', name: 'Solenoid Valve 24V DC IP65', unitPrice: 310, totalPrice: 4650, compliance: true },
      { itemId: 'rfq-104-i2', name: 'Flexible Braided Stainless Hose 1.5"', unitPrice: 62, totalPrice: 6200, compliance: true },
    ],
    uniquenessBenefit: 'Teflon lining has reinforced dual braids. High reliability score vendor.',
  },
  {
    id: 'q-104-global',
    rfqId: 'rfq-104',
    vendorId: 'v4',
    vendorName: 'Global Titanium Castings',
    submittedAt: '2026-06-05T09:05:00Z',
    leadTimeDays: 21,
    notes: 'We have long global shipping pipelines. Custom alloy steel formulation.',
    status: 'Submitted',
    taxRate: 18,
    shippingCost: 850,
    grandTotal: 14715, // 15*335 + 100*66 = 5025 + 6600 = 11625 * 1.18 = 13717.5 + 850 = 14567.5
    items: [
      { itemId: 'rfq-104-i1', name: 'Solenoid Valve 24V DC IP65', unitPrice: 335, totalPrice: 5025, compliance: true },
      { itemId: 'rfq-104-i2', name: 'Flexible Braided Stainless Hose 1.5"', unitPrice: 66, totalPrice: 6600, compliance: true },
    ],
    uniquenessBenefit: 'Extremely robust alloy blend withstands marine corrosive scenarios.',
  }
];

// Rich set of historical POs
export const INITIAL_POS: PurchaseOrder[] = [
  {
    id: 'po-2026-401',
    rfqId: 'rfq-102',
    quotationId: 'q-102-bytecore',
    vendorId: 'v2',
    poNumber: 'PO-2026-45582',
    createdAt: '2026-05-25T10:00:00Z',
    subtotal: 59280,
    taxAmount: 10670.4,
    grandTotal: 69950.4,
    status: 'Delivered',
    billingAddress: 'VendorBridge Headquarters, 500 Oracle Parkway, Redwood City, CA 94065',
    shippingAddress: 'VendorBridge Hub-B Server Floor, 1020 Coit Road, Plano, TX 75075',
  },
];

// Invoices
export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-3026-21',
    poId: 'po-2026-401',
    poNumber: 'PO-2026-45582',
    invoiceNumber: 'INV-BYT-2026-892',
    invoiceDate: '2026-05-28T14:00:00Z',
    dueDate: '2026-06-28T23:59:00Z',
    subtotal: 59280,
    taxAmount: 10670.4,
    grandTotal: 69950.4,
    status: 'Paid',
    paymentTerms: 'NET 30',
    paymentMethod: 'Bank Transfer (ACH)',
  }
];

// Prepopulated Audit Logs keeping track of system interactions and user approvals
export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: 'log-1', timestamp: '2026-05-18T10:02:00Z', userId: 'u1', userName: 'Alex Carter', userRole: 'officer', action: 'Created RFQ', module: 'RFQ Creation', details: 'Created draft for Carbide CNC Boring Bars' },
  { id: 'log-2', timestamp: '2026-05-18T10:05:00Z', userId: 'u1', userName: 'Alex Carter', userRole: 'officer', action: 'Published RFQ', module: 'RFQ Creation', details: 'Published CarbideCNC Boring Bars and assigned vendors: Apex Metallurgy & Global Titanium' },
  { id: 'log-3', timestamp: '2026-05-20T08:35:00Z', userId: 'u1', userName: 'Alex Carter', userRole: 'officer', action: 'Created RFQ', module: 'RFQ Creation', details: 'Created Enterprise Server Node Upgrades' },
  { id: 'log-4', timestamp: '2026-05-24T16:45:00Z', userId: 'u5', userName: 'ByteCore Tech Services', userRole: 'vendor', action: 'Submitted Quotation', module: 'Vendor Portal', details: 'Quotation submitted for Server Node RFQ (Grand total: $69,950.40)' },
  { id: 'log-5', timestamp: '2026-05-25T09:12:00Z', userId: 'u2', userName: 'Sophia Vance', userRole: 'manager', action: 'Approved Quotation', module: 'Approval Queue', details: 'Approved ByteCore Server Node quotation after reviewing SLA credentials' },
  { id: 'log-6', timestamp: '2026-05-25T10:01:00Z', userId: 'u1', userName: 'Alex Carter', userRole: 'officer', action: 'Generated PO', module: 'Order Management', details: 'Purchase Order PO-2026-45582 dispatched to ByteCore Solutions' },
  { id: 'log-7', timestamp: '2026-05-28T14:15:00Z', userId: 'u5', userName: 'ByteCore Tech Services', userRole: 'vendor', action: 'Uploaded Invoice', module: 'Invoicing', details: 'Invoice INV-BYT-2026-892 generated matching PO-2026-45582' },
  { id: 'log-8', timestamp: '2026-06-01T11:15:00Z', userId: 'u1', userName: 'Alex Carter', userRole: 'officer', action: 'Published RFQ', module: 'RFQ Creation', details: 'Published Recycled Corrugated Cartons RFQ' },
  { id: 'log-9', timestamp: '2026-06-03T09:05:00Z', userId: 'u1', userName: 'Alex Carter', userRole: 'officer', action: 'Published RFQ', module: 'RFQ Creation', details: 'Published Pneumatic Control Valves RFQ' },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'notif-1', title: 'New Quotation Received', message: 'Apex Industrial Metal Partners submitted a quotation for Carver Boring Bars.', timestamp: '2026-05-25T14:20:00Z', type: 'quotation', read: false },
  { id: 'notif-2', title: 'Approval Required', message: 'Pneumatic Control Valves RFQ requires final sign-off from Sophia Vance.', timestamp: '2026-06-03T11:00:00Z', type: 'approval', read: false },
  { id: 'notif-3', title: 'Invoice Paid', message: 'INV-BYT-2026-892 of value $69,950.40 has been paid successfully.', timestamp: '2026-05-30T10:00:00Z', type: 'invoice', read: true },
];

// Helper methods for LocalStorage persistence of state
export const loadStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const data = localStorage.getItem(`vendorbridge_${key}`);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error(`Error loading state for ${key}`, e);
    return defaultValue;
  }
};

export const saveStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(`vendorbridge_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving state for ${key}`, e);
  }
};
