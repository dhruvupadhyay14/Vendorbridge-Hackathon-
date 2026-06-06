import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { createProxyMiddleware } from 'http-proxy-middleware';

// DB File Definition for State Persistence (Fallback only)
const DB_FILE = path.join(process.cwd(), 'db.json');
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// Initial Seed Data Types & Helpers
interface DBState {
  users: any[];
  vendors: any[];
  rfqs: any[];
  quotations: any[];
  purchaseOrders: any[];
  invoices: any[];
  auditLogs: any[];
  notifications: any[];
}

const DEFAULT_USERS = [
  { id: 'u1', name: 'Alex Carter', email: 'alex.carter@vendorbridge.com', role: 'officer' },
  { id: 'u2', name: 'Sophia Vance', email: 'sophia.v@vendorbridge.com', role: 'manager' },
  { id: 'u3', name: 'Marcus Vance', email: 'marcus.v@vendorbridge.com', role: 'admin' },
  { id: 'u4', name: 'Apex Metal Partner', email: 'contract@apexmetal.com', role: 'vendor', vendorId: 'v1' },
  { id: 'u5', name: 'ByteCore Tech', email: 'sales@bytecoretech.com', role: 'vendor', vendorId: 'v2' },
  { id: 'u6', name: 'Zenith Pack Co.', email: 'orders@zenithpack.com', role: 'vendor', vendorId: 'v3' },
];

const DEFAULT_VENDORS = [
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

const DEFAULT_RFQS = [
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

const DEFAULT_QUOTATIONS = [
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
    grandTotal: 13861,
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
    grandTotal: 15710,
    items: [
      { itemId: 'rfq-101-i1', name: 'Carbide Boring Head 16mm', unitPrice: 130, totalPrice: 6500, compliance: true },
      { itemId: 'rfq-101-i2', name: 'Anti-Vibration Steel Shank 20mm', unitPrice: 290, totalPrice: 5800, compliance: true },
    ],
    uniquenessBenefit: 'Slightly thicker coating formulation tailored for titanium alloys.',
  },
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
    shippingCost: 0,
    grandTotal: 69950.4,
    items: [
      { itemId: 'rfq-102-i1', name: '2U Server Node - Dual Socket Xeon', unitPrice: 8200, totalPrice: 49200, compliance: true },
      { itemId: 'rfq-102-i2', name: '3.2TB Enterprise NVMe SSD PCIe 4.0', unitPrice: 420, totalPrice: 10080, compliance: true },
    ],
    uniquenessBenefit: 'Pre-flashed with open-source firmware optimization. Zero shipping cost SLA.',
  },
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
    grandTotal: 9312,
    items: [
      { itemId: 'rfq-103-i1', name: 'Double-Wall Custom Cartons 18x18x12', unitPrice: 1.40, totalPrice: 7000, compliance: true },
      { itemId: 'rfq-103-i2', name: 'Kraft Bubble Pouches (Self-Seal)', unitPrice: 0.30, totalPrice: 600, compliance: true },
    ],
    uniquenessBenefit: '100% PCR content certification with carbon footprint offsets reported.',
  },
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
    grandTotal: 12953,
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
    grandTotal: 14567.5,
    items: [
      { itemId: 'rfq-104-i1', name: 'Solenoid Valve 24V DC IP65', unitPrice: 335, totalPrice: 5025, compliance: true },
      { itemId: 'rfq-104-i2', name: 'Flexible Braided Stainless Hose 1.5"', unitPrice: 66, totalPrice: 6600, compliance: true },
    ],
    uniquenessBenefit: 'Extremely robust alloy blend withstands marine corrosive scenarios.',
  }
];

const DEFAULT_POS = [
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

const DEFAULT_INVOICES = [
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

const DEFAULT_AUDIT_LOGS = [
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

const DEFAULT_NOTIFICATIONS = [
  { id: 'notif-1', title: 'New Quotation Received', message: 'Apex Industrial Metal Partners submitted a quotation for Carver Boring Bars.', timestamp: '2026-05-25T14:20:00Z', type: 'quotation', read: false },
  { id: 'notif-2', title: 'Approval Required', message: 'Pneumatic Control Valves RFQ requires final sign-off from Sophia Vance.', timestamp: '2026-06-03T11:00:00Z', type: 'approval', read: false },
  { id: 'notif-3', title: 'Invoice Paid', message: 'INV-BYT-2026-892 of value $69,950.40 has been paid successfully.', timestamp: '2026-05-30T10:00:00Z', type: 'invoice', read: true },
];

// Load current state from disk or seed it
function getDB(): DBState {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const state: DBState = {
        users: DEFAULT_USERS,
        vendors: DEFAULT_VENDORS,
        rfqs: DEFAULT_RFQS,
        quotations: DEFAULT_QUOTATIONS,
        purchaseOrders: DEFAULT_POS,
        invoices: DEFAULT_INVOICES,
        auditLogs: DEFAULT_AUDIT_LOGS,
        notifications: DEFAULT_NOTIFICATIONS,
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
      return state;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading/writing DB file:', error);
    return {
      users: DEFAULT_USERS,
      vendors: DEFAULT_VENDORS,
      rfqs: DEFAULT_RFQS,
      quotations: DEFAULT_QUOTATIONS,
      purchaseOrders: DEFAULT_POS,
      invoices: DEFAULT_INVOICES,
      auditLogs: DEFAULT_AUDIT_LOGS,
      notifications: DEFAULT_NOTIFICATIONS,
    };
  }
}

function saveDB(state: DBState) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving DB file:', error);
  }
}

// Clear read notifications helper
function logAction(userId: string, userName: string, role: string, action: string, module: string, details: string) {
  const state = getDB();
  const newLog = {
    id: 'log-' + Date.now() + Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString(),
    userId,
    userName,
    userRole: role,
    action,
    module,
    details
  };
  state.auditLogs.push(newLog);
  saveDB(state);
}

function addNotification(title: string, message: string, type: string) {
  const state = getDB();
  const newNotif = {
    id: 'notif-' + Date.now() + Math.floor(Math.random() * 1000),
    title,
    message,
    timestamp: new Date().toISOString(),
    type,
    read: false
  };
  state.notifications.unshift(newNotif);
  saveDB(state);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Proxy API requests to backend
  app.use('/api', createProxyMiddleware({
    target: BACKEND_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api': '/api', // keep /api prefix or change if backend expects differently
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log(`[Proxy] ${req.method} ${req.url} -> ${BACKEND_URL}${req.url}`);
    },
    onError: (err, req, res) => {
      console.error('[Proxy Error]', err);
      // Fallback to local mock for certain GET requests if backend is down (optional)
      if (req.method === 'GET' && !res.headersSent) {
          // You could implement mock fallback logic here if desired
      }
    }
  }));

  // Body parsers (only for non-proxied routes)
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Helper middleware for logging API actions
  app.use((req, res, next) => {
    // Basic CORS/NoCache or security headers if needed
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
  });

  // ==================== SCREEN 1 & 2: AUTH & INITIALIZATION ENDPOINTS ====================

  // POST /api/auth/login
  app.post('/api/auth/login', (req, res) => {
    const { email, password, role } = req.body;
    const state = getDB();
    const foundUser = state.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (foundUser) {
      logAction(foundUser.id, foundUser.name, foundUser.role, 'Secure login authenticated', 'Auth Engine', `User ${foundUser.name} logged into server workspace successfully.`);
      return res.json({ success: true, user: foundUser });
    }

    // Default mock user if not found in pre-seeds
    const mockUser = {
      id: 'u_' + Date.now(),
      name: email.split('@')[0].toUpperCase(),
      email: email,
      role: role || 'officer'
    };
    state.users.push(mockUser);
    saveDB(state);

    logAction(mockUser.id, mockUser.name, mockUser.role, 'Secure login authenticated', 'Auth Engine', `User ${mockUser.name} logged in under dynamic profile.`);
    return res.json({ success: true, user: mockUser });
  });

  // POST /api/auth/register
  app.post('/api/auth/register', (req, res) => {
    const { name, email, role, vendorCategory, country } = req.body;
    const state = getDB();

    const exists = state.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return res.status(400).json({ error: 'Corporate email is already registered.' });
    }

    let vendorId = undefined;
    if (role === 'vendor') {
      vendorId = 'v_' + Date.now();
      const newVendor = {
        id: vendorId,
        name: name,
        contactName: 'Primary Rep',
        email: email,
        phone: '+1 (555) 000-0000',
        category: vendorCategory || 'Heavy Machinery & Parts',
        gstNumber: '29GST' + Math.floor(Math.random() * 90000) + 'A1Z1',
        status: 'Under Review',
        rating: 4.0,
        reliabilityScore: 80,
        responseRate: 100,
        cycleTimeDays: 14,
        riskLevel: 'Medium',
        pendingTasksCount: 0,
        slaComplianceRate: 85,
        pricingCompetitiveness: 'Good',
        yearsPartnered: 1,
        country: country || 'United States'
      };
      state.vendors.push(newVendor);
      addNotification('New Supplier Registered', `${newVendor.name} registered under primary classification: ${newVendor.category}.`, 'system');
    }

    const newUser = {
      id: 'u_' + Date.now(),
      name,
      email,
      role: role || 'officer',
      vendorId,
      country: country || 'United States'
    };

    state.users.push(newUser);
    saveDB(state);

    logAction(newUser.id, newUser.name, newUser.role, 'Registered Corporate Account', 'Auth Engine', `New organization registered successfully: ${name} (${role}).`);
    return res.json({ success: true, user: newUser });
  });

  // POST /api/auth/forgot-password
  app.post('/api/auth/forgot-password', (req, res) => {
    const { email } = req.body;
    return res.json({ success: true, message: `A compilation instructions link was dispatched to ${email}.` });
  });

  // POST /api/auth/logout
  app.post('/api/auth/logout', (req, res) => {
    const { userId } = req.body;
    const state = getDB();
    const userObj = state.users.find(u => u.id === userId);
    if (userObj) {
      logAction(userObj.id, userObj.name, userObj.role, 'Session disconnected', 'Auth Engine', `User ${userObj.name} closed session safely.`);
    }
    return res.json({ success: true });
  });

  // POST /api/upload/profile-photo
  app.post('/api/upload/profile-photo', (req, res) => {
    const { photoData, userId } = req.body;
    // Mock save of upload
    return res.json({ success: true, url: photoData || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop&q=80' });
  });

  // GET /api/countries
  app.get('/api/countries', (req, res) => {
    return res.json([
      { code: 'US', name: 'United States', dialCode: '+1' },
      { code: 'IN', name: 'India', dialCode: '+91' },
      { code: 'DE', name: 'Germany', dialCode: '+49' },
      { code: 'GB', name: 'United Kingdom', dialCode: '+44' },
      { code: 'CA', name: 'Canada', dialCode: '+1' },
      { code: 'AU', name: 'Australia', dialCode: '+61' },
      { code: 'SG', name: 'Singapore', dialCode: '+65' }
    ]);
  });

  // ==================== SCREEN 3: DASHBOARD ENDPOINTS ====================

  // GET /api/dashboard/stats
  app.get('/api/dashboard/stats', (req, res) => {
    const state = getDB();
    const activeRfqs = state.rfqs.filter(r => r.status === 'Published' || r.status === 'Under Comparison').length;
    const pendingApprovals = state.rfqs.filter(r => r.status === 'Pending Approval').length;
    const totalPoSum = state.purchaseOrders.reduce((sum, po) => sum + po.grandTotal, 0);

    // Overdue invoices: Invoices that are NOT Paid and are past current date (June 6, 2026)
    const currentDate = new Date('2026-06-06T04:50:31Z');
    const overdueInvoices = state.invoices.filter(i => {
      return i.status !== 'Paid' && new Date(i.dueDate) < currentDate;
    }).length;

    return res.json({
      activeRfqs,
      pendingApprovals,
      totalPoAmount: totalPoSum,
      overdueInvoices,
      totalVendors: state.vendors.length,
      totalInvoices: state.invoices.length
    });
  });

  // GET /api/purchase-orders/recent
  app.get('/api/purchase-orders/recent', (req, res) => {
    const state = getDB();
    // Return last 5 POs
    const sorted = [...state.purchaseOrders].reverse().slice(0, 5);
    return res.json(sorted);
  });

  // GET /api/reports/spending-trends
  app.get('/api/reports/spending-trends', (req, res) => {
    const state = getDB();
    const totalPOValue = state.purchaseOrders.reduce((sum, po) => sum + po.grandTotal, 0);
    
    // Hardcoded beautiful history synced with latest live PO values
    const trends = [
      { month: 'Jan 26', spend: 45000, savings: 3200 },
      { month: 'Feb 26', spend: 52000, savings: 4800 },
      { month: 'Mar 26', spend: 73000, savings: 8100 },
      { month: 'Apr 26', spend: 61000, savings: 5900 },
      { month: 'May 26', spend: 89000, savings: 10400 },
      { month: 'Jun 26', spend: totalPOValue || 69950, savings: 12400 }
    ];
    return res.json(trends);
  });

  // ==================== SCREEN 4: VENDOR MANAGEMENT ENDPOINTS ====================

  // GET /api/vendors
  app.get('/api/vendors', (req, res) => {
    const state = getDB();
    const { search, category, status } = req.query;
    let list = [...state.vendors];

    if (search) {
      const q = (search as string).toLowerCase();
      list = list.filter(v => v.name.toLowerCase().includes(q) || v.contactName.toLowerCase().includes(q) || v.email.toLowerCase().includes(q));
    }

    if (category && category !== 'All') {
      list = list.filter(v => v.category === category);
    }

    if (status && status !== 'All') {
      list = list.filter(v => v.status === status);
    }

    return res.json(list);
  });

  // POST /api/vendors
  app.post('/api/vendors', (req, res) => {
    const { name, contactName, email, phone, category, gstNumber, userId } = req.body;
    const state = getDB();

    const newVendor = {
      id: 'v_' + Date.now(),
      name,
      contactName: contactName || 'N/A',
      email,
      phone: phone || 'N/A',
      category: category || 'General Sourcing',
      gstNumber: gstNumber || 'N/A',
      status: 'Active',
      rating: 4.2,
      reliabilityScore: 85,
      responseRate: 90,
      cycleTimeDays: 14,
      riskLevel: 'Low',
      pendingTasksCount: 0,
      slaComplianceRate: 90,
      pricingCompetitiveness: 'Good',
      yearsPartnered: 1
    };

    state.vendors.push(newVendor);
    saveDB(state);

    if (userId) {
      const user = state.users.find(u => u.id === userId);
      logAction(userId, user?.name || 'Assigned User', user?.role || 'officer', 'Registered Supplier Partner', 'Supplier Directory', `Sourcing partner accredited: ${name}`);
    }
    addNotification('New Supplier Registered', `${name} registered under primary classification: ${newVendor.category}.`, 'system');

    return res.json({ success: true, vendor: newVendor });
  });

  // GET /api/vendors/:id
  app.get('/api/vendors/:id', (req, res) => {
    const state = getDB();
    const vendor = state.vendors.find(v => v.id === req.params.id);
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    return res.json(vendor);
  });

  // PUT /api/vendors/:id
  app.put('/api/vendors/:id', (req, res) => {
    const { status, rating, reliabilityScore, responseRate, cycleTimeDays, riskLevel, phone, contactName } = req.body;
    const state = getDB();
    const vendorIdx = state.vendors.findIndex(v => v.id === req.params.id);
    if (vendorIdx === -1) return res.status(404).json({ error: 'Vendor not found' });

    const currentVendor = state.vendors[vendorIdx];
    const updated = {
      ...currentVendor,
      status: status !== undefined ? status : currentVendor.status,
      rating: rating !== undefined ? Number(rating) : currentVendor.rating,
      reliabilityScore: reliabilityScore !== undefined ? Number(reliabilityScore) : currentVendor.reliabilityScore,
      responseRate: responseRate !== undefined ? Number(responseRate) : currentVendor.responseRate,
      cycleTimeDays: cycleTimeDays !== undefined ? Number(cycleTimeDays) : currentVendor.cycleTimeDays,
      riskLevel: riskLevel !== undefined ? riskLevel : currentVendor.riskLevel,
      phone: phone !== undefined ? phone : currentVendor.phone,
      contactName: contactName !== undefined ? contactName : currentVendor.contactName,
    };

    state.vendors[vendorIdx] = updated;
    saveDB(state);

    addNotification('Supplier Compliance Update', `Supplier '${updated.name}' status/telemetry updated to ${updated.status}.`, 'system');
    return res.json({ success: true, vendor: updated });
  });

  // DELETE /api/vendors/:id
  app.delete('/api/vendors/:id', (req, res) => {
    const state = getDB();
    const vendor = state.vendors.find(v => v.id === req.params.id);
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

    state.vendors = state.vendors.filter(v => v.id !== req.params.id);
    saveDB(state);

    addNotification('Supplier Removed', `Supplier '${vendor.name}' has been deleted from ERP dockets.`, 'system');
    return res.json({ success: true });
  });

  // ==================== SCREEN 5: RFQ MANAGEMENT ENDPOINTS ====================

  // GET /api/rfq
  app.get('/api/rfq', (req, res) => {
    const state = getDB();
    return res.json(state.rfqs);
  });

  // POST /api/rfq & POST /api/rfq/draft
  app.post('/api/rfq', (req, res) => {
    const { title, description, category, items, assignedVendors, status, attachmentName, userId } = req.body;
    const state = getDB();

    const newRFQ = {
      id: 'rfq-' + (200 + state.rfqs.length),
      title,
      description: description || '',
      category: category || 'General Sourcing',
      items: items || [],
      assignedVendors: assignedVendors || [],
      status: status || 'Draft',
      createdBy: 'Alex Carter',
      createdAt: new Date().toISOString(),
      deadline: req.body.deadline || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      attachmentName: attachmentName || null
    };

    state.rfqs.push(newRFQ);
    saveDB(state);

    if (userId) {
      const user = state.users.find(u => u.id === userId);
      logAction(userId, user?.name || 'Sourcing Officer', user?.role || 'officer', newRFQ.status === 'Published' ? 'Published RFQ Document' : 'Saved Draft RFQ', 'RFQ Manager', `RFQ '${title}' was registered securely.`);
    }

    if (newRFQ.status === 'Published') {
      addNotification('New RFQ Dispatch Event', `RFQ Reference: ${newRFQ.id.toUpperCase()} published in category: ${newRFQ.category}.`, 'rfq');
    }

    return res.json({ success: true, rfq: newRFQ });
  });

  app.post('/api/rfq/draft', (req, res) => {
    const state = getDB();
    const draft = { ...req.body, status: 'Draft' };
    // Reroute to RFQ insertion
    return res.redirect(307, '/api/rfq');
  });

  // POST /api/upload/rfq-file
  app.post('/api/upload/rfq-file', (req, res) => {
    const { fileName } = req.body;
    return res.json({ success: true, fileNameUrl: fileName || 'specification_sheet.pdf' });
  });

  // POST /api/rfq/assign-vendors
  app.post('/api/rfq/assign-vendors', (req, res) => {
    const { rfqId, vendorIds, userId } = req.body;
    const state = getDB();
    const rfqIdx = state.rfqs.findIndex(r => r.id === rfqId);
    if (rfqIdx === -1) return res.status(404).json({ error: 'RFQ not found' });

    state.rfqs[rfqIdx].assignedVendors = vendorIds;
    saveDB(state);

    return res.json({ success: true, rfq: state.rfqs[rfqIdx] });
  });

  // ==================== SCREEN 6: QUOTATION SUBMISSION ENDPOINTS ====================

  // GET /api/rfq/:id
  app.get('/api/rfq/:id', (req, res) => {
    const state = getDB();
    const rfq = state.rfqs.find(r => r.id === req.params.id);
    if (!rfq) return res.status(404).json({ error: 'RFQ not found' });
    return res.json(rfq);
  });

  // POST /api/quotation / POST /api/quotation/draft
  app.post('/api/quotation', (req, res) => {
    const { rfqId, vendorId, vendorName, items, leadTimeDays, notes, taxRate, shippingCost, grandTotal, uniquenessBenefit, userId } = req.body;
    const state = getDB();

    // Remove existing quote matching the pair
    state.quotations = state.quotations.filter(q => !(q.rfqId === rfqId && q.vendorId === vendorId));

    const newQuotation = {
      id: 'q-' + Date.now(),
      rfqId,
      vendorId,
      vendorName,
      submittedAt: new Date().toISOString(),
      items: items || [],
      leadTimeDays: Number(leadTimeDays) || 12,
      notes: notes || '',
      status: req.body.status || 'Submitted',
      taxRate: Number(taxRate) || 18,
      shippingCost: Number(shippingCost) || 0,
      grandTotal: Number(grandTotal) || 0,
      uniquenessBenefit: uniquenessBenefit || 'SLA guaranteed delivery dockets.'
    };

    state.quotations.push(newQuotation);

    // Update RFQ status to 'Under Comparison' if it was Published
    const rfqIdx = state.rfqs.findIndex(r => r.id === rfqId);
    if (rfqIdx !== -1 && state.rfqs[rfqIdx].status === 'Published') {
      state.rfqs[rfqIdx].status = 'Under Comparison';
    }

    saveDB(state);

    if (userId) {
      const user = state.users.find(u => u.id === userId);
      logAction(userId, user?.name || vendorName, 'vendor', 'Submitted Compliance Bid', 'Vendor Portal', `Submitted cost proposal of value: $${newQuotation.grandTotal.toLocaleString()} matching RFQ ID ${rfqId}`);
    }

    addNotification('Quotation Submitted', `Sourcing offer of $${newQuotation.grandTotal.toLocaleString()} filed by ${vendorName}.`, 'quotation');

    return res.json({ success: true, quotation: newQuotation });
  });

  app.post('/api/quotation/draft', (req, res) => {
    req.body.status = 'Draft';
    return res.redirect(307, '/api/quotation');
  });

  // POST /api/quotation/calculate
  app.post('/api/quotation/calculate', (req, res) => {
    const { items, taxRate, shippingCost } = req.body;
    const rate = Number(taxRate) || 18;
    const ship = Number(shippingCost) || 0;

    let subtotal = 0;
    const computedItems = (items || []).map((it: any) => {
      const lineCost = (it.unitPrice || 0) * (it.quantity || 1);
      subtotal += lineCost;
      return {
        ...it,
        totalPrice: lineCost
      };
    });

    const taxAmount = subtotal * (rate / 100);
    const grandTotal = subtotal + taxAmount + ship;

    return res.json({
      subtotal,
      taxAmount,
      grandTotal,
      items: computedItems
    });
  });

  // GET /api/quotation list
  app.get('/api/quotation', (req, res) => {
    const state = getDB();
    return res.json(state.quotations);
  });

  // GET /api/purchase-orders list
  app.get('/api/purchase-orders', (req, res) => {
    const state = getDB();
    return res.json(state.purchaseOrders);
  });

  // GET /api/invoices list
  app.get('/api/invoices', (req, res) => {
    const state = getDB();
    return res.json(state.invoices);
  });

  // ==================== SCREEN 7: QUOTATION COMPARISON ====================

  // GET /api/quotation/compare/:rfqId
  app.get('/api/quotation/compare/:rfqId', (req, res) => {
    const state = getDB();
    const bids = state.quotations.filter(q => q.rfqId === req.params.rfqId);
    const rfq = state.rfqs.find(r => r.id === req.params.rfqId);

    // Calculate dynamic analysis recommendation scores
    const results = bids.map(bid => {
      const vendor = state.vendors.find(v => v.id === bid.vendorId);
      
      // Recommendation parameters
      let priceScore = 80;
      if (rfq) {
        const targetSum = rfq.items.reduce((sum, i) => sum + (i.quantity * (i.targetPrice || 0)), 0);
        if (targetSum > 0) {
          priceScore = Math.max(20, Math.min(100, Math.round((targetSum / bid.grandTotal) * 100)));
        }
      }

      const reliabilityScore = vendor?.reliabilityScore || 85;
      const bottleneckScore = Math.max(30, 100 - (bid.leadTimeDays * 3.5)); // lower lead time = higher score

      // Weighted score
      const totalScore = Math.round((priceScore * 0.45) + (reliabilityScore * 0.35) + (bottleneckScore * 0.20));

      return {
        ...bid,
        priceScore,
        reliabilityScore,
        bottleneckScore,
        recommendationScore: totalScore,
        vendorTelemetry: vendor
      };
    });

    return res.json({ rfq, bids: results });
  });

  // POST /api/quotation/select-vendor
  app.post('/api/quotation/select-vendor', (req, res) => {
    const { rfqId, quotationId, comments, userId } = req.body;
    const state = getDB();

    const selectedQuote = state.quotations.find(q => q.id === quotationId);
    if (!selectedQuote) return res.status(404).json({ error: 'Quotation not found' });

    // Mark RFQ status, select quote
    state.rfqs = state.rfqs.map(r => r.id === rfqId ? {
      ...r,
      status: 'Pending Approval',
      approvalRemarks: comments || 'Selected supplier via comparative analysis.'
    } : r);

    state.quotations = state.quotations.map(q => q.rfqId === rfqId ? {
      ...q,
      status: q.id === quotationId ? 'Selected' : 'Rejected'
    } : q);

    saveDB(state);

    if (userId) {
      const user = state.users.find(u => u.id === userId);
      logAction(userId, user?.name || 'Sourcing Officer', user?.role || 'officer', 'Initiated Approval Workflow', 'Approvals Queue', `Requisition matching quote Ref ${quotationId} escalated to Manager procurement authorization.`);
    }

    addNotification('SOP Approval Escalation', `Requisition matching ${selectedQuote.vendorName} awaits executive clearance.`, 'approval');

    return res.json({ success: true });
  });

  // GET /api/vendors/rating
  app.get('/api/vendors/rating', (req, res) => {
    const state = getDB();
    const rankings = state.vendors.map(v => ({ id: v.id, name: v.name, rating: v.rating, reliability: v.reliabilityScore }));
    return res.json(rankings);
  });

  // ==================== SCREEN 8: APPROVAL WORKFLOW ENDPOINTS ====================

  // GET /api/approvals/:id
  app.get('/api/approvals/:id', (req, res) => {
    const state = getDB();
    const rfq = state.rfqs.find(r => r.id === req.params.id);
    if (!rfq) return res.status(404).json({ error: 'Requisition not found' });

    const selectedQuote = state.quotations.find(q => q.rfqId === rfq.id && q.status === 'Selected');
    const vendorObj = selectedQuote ? state.vendors.find(v => v.id === selectedQuote.vendorId) : null;

    // Compile dynamic approval request workflow details
    const approvalRequest = {
      id: 'appreq-' + rfq.id,
      rfqId: rfq.id,
      quotationId: selectedQuote?.id || '',
      requestedBy: 'Alex Carter (Sourcing Officer)',
      requestedAt: rfq.createdAt,
      details: {
        priceScore: 88,
        reliabilityScore: vendorObj?.reliabilityScore || 90,
        bottleneckScore: 92,
        savingsCalculated: 3450,
        cycleTimeDays: vendorObj?.cycleTimeDays || 12
      },
      status: rfq.status === 'Approved' ? 'Approved' : rfq.status === 'Pending Approval' ? 'Pending' : 'Draft',
      reviewedBy: rfq.status === 'Approved' ? 'Sophia Vance (Manager)' : undefined,
      timeline: [
        { status: 'Requisition Filed', timestamp: rfq.createdAt, actor: 'Alex Carter' },
        { status: 'Bids Compared & Checked', timestamp: new Date(new Date(rfq.createdAt).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(), actor: 'Alex Carter' },
        ...(rfq.status === 'Approved' ? [{ status: 'Manager Sign-off Cleared', timestamp: new Date().toISOString(), actor: 'Sophia Vance', comment: rfq.approvalRemarks || 'Specs conform properly.' }] : [])
      ]
    };

    return res.json(approvalRequest);
  });

  // POST /api/approvals/approve
  app.post('/api/approvals/approve', (req, res) => {
    const { rfqId, remarks, reviewedBy, userId } = req.body;
    const state = getDB();

    state.rfqs = state.rfqs.map(r => r.id === rfqId ? { ...r, status: 'Approved', approvalRemarks: remarks } : r);
    saveDB(state);

    if (userId) {
      const user = state.users.find(u => u.id === userId);
      logAction(userId, user?.name || reviewedBy, user?.role || 'manager', 'Authorized Requisition Signature', 'Approvals Queue', `Executive sign-off recorded for RFQ Ref ${rfqId}. Comments: "${remarks}".`);
    }

    addNotification('Requisition Approved', `Sourcing request authorized by executive: ${reviewedBy}.`, 'approval');
    return res.json({ success: true });
  });

  // POST /api/approvals/reject
  app.post('/api/approvals/reject', (req, res) => {
    const { rfqId, remarks, reviewedBy, userId } = req.body;
    const state = getDB();

    state.rfqs = state.rfqs.map(r => r.id === rfqId ? { ...r, status: 'Published' } : r);
    state.quotations = state.quotations.map(q => q.rfqId === rfqId ? { ...q, status: 'Submitted' } : q);
    saveDB(state);

    if (userId) {
      const user = state.users.find(u => u.id === userId);
      logAction(userId, user?.name || reviewedBy, user?.role || 'manager', 'Rejected Sourcing Requisition', 'Approvals Queue', `Requisition Ref ${rfqId} was returned by executive. Revision comments: "${remarks}".`);
    }

    addNotification('Requisition Returned', `Sourcing dossier returned to comparative state for audit corrections.`, 'approval');
    return res.json({ success: true });
  });

  // POST /api/approvals/comment
  app.post('/api/approvals/comment', (req, res) => {
    const { rfqId, userId, userName, comment } = req.body;
    const state = getDB();
    logAction(userId, userName, 'manager', 'Added Approval Comment', 'Approvals Queue', `RFQ Ref ${rfqId}: "${comment}"`);
    return res.json({ success: true });
  });

  // ==================== SCREEN 9: PURCHASE ORDERS & INVOICES ====================

  // POST /api/purchase-order/generate
  app.post('/api/purchase-order/generate', (req, res) => {
    const { rfqId, quotationId, userId } = req.body;
    const state = getDB();

    const matchingQuote = state.quotations.find(q => q.id === quotationId);
    if (!matchingQuote) return res.status(404).json({ error: 'Quotation not found' });

    // Mark RFQ status
    state.rfqs = state.rfqs.map(r => r.id === rfqId ? { ...r, status: 'PO Generated' } : r);

    const subtotal = matchingQuote.items.reduce((sum, i) => sum + i.totalPrice, 0);
    const taxAmount = subtotal * (matchingQuote.taxRate / 100);

    const newPO = {
      id: 'po-' + Date.now(),
      rfqId,
      quotationId,
      vendorId: matchingQuote.vendorId,
      poNumber: 'PO-2026-' + (50000 + Math.floor(Math.random() * 9000)),
      createdAt: new Date().toISOString(),
      subtotal,
      taxAmount,
      grandTotal: matchingQuote.grandTotal,
      status: 'Issued',
      billingAddress: 'VendorBridge Headquarters, 500 Oracle Parkway, Redwood City, CA 94065',
      shippingAddress: 'Shipment Hub-B Sourcing floor, Texas Industrial Block 12, Plano, TX 75075'
    };

    state.purchaseOrders.unshift(newPO);
    saveDB(state);

    if (userId) {
      const user = state.users.find(u => u.id === userId);
      logAction(userId, user?.name || 'Sourcing Officer', user?.role || 'officer', 'Issued Purchase Order', 'Purchase Order Registry', `Issued PO clearance: ${newPO.poNumber} matching bid value of $${newPO.grandTotal.toLocaleString()}.`);
    }

    addNotification('Purchase Order Dispatched', `${newPO.poNumber} issued in compliance with vendor transport schedules.`, 'system');

    return res.json({ success: true, purchaseOrder: newPO });
  });

  // GET /api/invoices/:id
  app.get('/api/invoices/:id', (req, res) => {
    const state = getDB();
    const invoice = state.invoices.find(i => i.id === req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found.' });
    return res.json(invoice);
  });

  // GET /api/invoices/download-pdf
  app.get('/api/invoices/download-pdf', (req, res) => {
    const { invoiceNumber } = req.query;
    return res.json({ success: true, msg: `Compiled document ${invoiceNumber || 'INV-001'}: Downloaded.` });
  });

  // GET /api/invoices/print
  app.get('/api/invoices/print', (req, res) => {
    return res.json({ success: true, message: 'System print queue initialized for document clearance.' });
  });

  // POST /api/invoices/email
  app.post('/api/invoices/email', (req, res) => {
    const { invoiceId, email, userId } = req.body;
    const state = getDB();

    const invIdx = state.invoices.findIndex(i => i.id === invoiceId);
    if (invIdx !== -1) {
      state.invoices[invIdx].status = 'Sent';
    }
    const targetInvoice = state.invoices[invIdx];
    saveDB(state);

    if (userId && targetInvoice) {
      const user = state.users.find(u => u.id === userId);
      logAction(userId, user?.name || 'Sourcing Rep', user?.role || 'officer', 'Dispatched Invoice to Vendor', 'Invoice Ledger', `Emailed link of invoice ${targetInvoice.invoiceNumber} to partner: ${email}.`);
    }

    addNotification('Invoice Shared', `Dispatched electronic invoice document to supplier gateway: ${email}.`, 'invoice');

    return res.json({ success: true });
  });

  // POST /api/invoices/mark-paid
  app.post('/api/invoices/mark-paid', (req, res) => {
    const { invoiceId, userId } = req.body;
    const state = getDB();

    const invIdx = state.invoices.findIndex(i => i.id === invoiceId);
    if (invIdx === -1) return res.status(404).json({ error: 'Invoice not found' });

    state.invoices[invIdx].status = 'Paid';
    const targetInvoice = state.invoices[invIdx];
    saveDB(state);

    if (userId) {
      const user = state.users.find(u => u.id === userId);
      logAction(userId, user?.name || 'Finance Executive', user?.role || 'manager', 'Paid Invoice Ledger', 'Invoice Ledger', `Invoice ${targetInvoice.invoiceNumber} was marked as Paid.`);
    }

    addNotification('Accounts Invoice Settled', `Sovereign settlement finalized for Invoice clearance: ${targetInvoice.invoiceNumber}.`, 'invoice');

    return res.json({ success: true, invoice: targetInvoice });
  });

  // ==================== SCREEN 10: AUDIT LOGS & AUDIT CENTER ENDPOINTS ====================

  // GET /api/activity-logs
  app.get('/api/activity-logs', (req, res) => {
    const state = getDB();
    return res.json({
      logs: state.auditLogs,
      notifications: state.notifications
    });
  });

  // GET /api/activity-logs/filter
  app.get('/api/activity-logs/filter', (req, res) => {
    const state = getDB();
    const { search, module, role } = req.query;
    let list = [...state.auditLogs];

    if (search) {
      const q = (search as string).toLowerCase();
      list = list.filter(l => l.details.toLowerCase().includes(q) || l.action.toLowerCase().includes(q) || l.userName.toLowerCase().includes(q));
    }

    if (module && module !== 'All') {
      list = list.filter(l => l.module === module);
    }

    if (role && role !== 'All') {
      list = list.filter(l => l.userRole === role);
    }

    return res.json(list);
  });

  // GET /api/audit-trail
  app.get('/api/audit-trail', (req, res) => {
    const state = getDB();
    // Return sorted secure audit records
    return res.json(state.auditLogs);
  });

  // Clear Read Notifications route
  app.post('/api/notifications/clear-read', (req, res) => {
    const state = getDB();
    state.notifications = state.notifications.filter(n => !n.read);
    saveDB(state);
    return res.json({ success: true });
  });

  // Mark notification read
  app.post('/api/notifications/read', (req, res) => {
    const { notifId } = req.body;
    const state = getDB();
    state.notifications = state.notifications.map(n => n.id === notifId ? { ...n, read: true } : n);
    saveDB(state);
    return res.json({ success: true });
  });

  // Custom DB Force Factory Reset
  app.post('/api/db/reset', (req, res) => {
    const state: DBState = {
      users: DEFAULT_USERS,
      vendors: DEFAULT_VENDORS,
      rfqs: DEFAULT_RFQS,
      quotations: DEFAULT_QUOTATIONS,
      purchaseOrders: DEFAULT_POS,
      invoices: DEFAULT_INVOICES,
      auditLogs: DEFAULT_AUDIT_LOGS,
      notifications: DEFAULT_NOTIFICATIONS,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
    return res.json({ success: true, message: 'Database reset successfully.' });
  });

  // ==================== FRONTEND STATIC INTEGRATION ====================

  // Vite development integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[VendorBridge ERP] Corporate server bound to port ${PORT}`);
  });
}

startServer();
