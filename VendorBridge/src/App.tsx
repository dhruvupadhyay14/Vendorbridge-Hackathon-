import React, { useState, useEffect } from 'react';
import { User, Vendor, RFQ, Quotation, PurchaseOrder, Invoice, AuditLog, Notification, UserRole } from './types';
import { 
  DEMO_USERS, 
  INITIAL_VENDORS, 
  INITIAL_RFQS, 
  INITIAL_QUOTATIONS, 
  INITIAL_POS, 
  INITIAL_INVOICES, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_NOTIFICATIONS, 
  loadStorage, 
  saveStorage 
} from './data';

// Import Modular Components
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import VendorManagement from './components/VendorManagement';
import RFQCreation from './components/RFQCreation';
import VendorPortal from './components/VendorPortal';
import QuotationComparison from './components/QuotationComparison';
import ApprovalWorkflow from './components/ApprovalWorkflow';
import PurchaseOrderInvoice from './components/PurchaseOrderInvoice';
import ActivityLogs from './components/ActivityLogs';
import ReportsAnalytics from './components/ReportsAnalytics';
import { formatINR } from './utils';

import { 
  Building2, 
  LayoutDashboard, 
  Users, 
  FilePlus, 
  ArrowRightLeft, 
  CheckSquare, 
  Receipt, 
  ScrollText, 
  LineChart, 
  LogOut, 
  Bell, 
  RefreshCw,
  Sliders,
  ChevronRight
} from 'lucide-react';

export default function App() {
  // 1. Core State Persistence
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadStorage<User | null>('current_user', null));
  const [vendors, setVendors] = useState<Vendor[]>(() => loadStorage<Vendor[]>('vendors', INITIAL_VENDORS));
  const [rfqs, setRfqs] = useState<RFQ[]>(() => loadStorage<RFQ[]>('rfqs', INITIAL_RFQS));
  const [quotations, setQuotations] = useState<Quotation[]>(() => loadStorage<Quotation[]>('quotations', INITIAL_QUOTATIONS));
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => loadStorage<PurchaseOrder[]>('purchase_orders', INITIAL_POS));
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadStorage<Invoice[]>('invoices', INITIAL_INVOICES));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadStorage<AuditLog[]>('audit_logs', INITIAL_AUDIT_LOGS));
  const [notifications, setNotifications] = useState<Notification[]>(() => loadStorage<Notification[]>('notifications', INITIAL_NOTIFICATIONS));

  // Dynamic reload counter for background synch
  const [syncReload, setSyncReload] = useState(0);
  const triggerReload = () => setSyncReload(prev => prev + 1);

  // Navigation State
  const [activeScreen, setActiveScreen] = useState<string>('dashboard');
  const [selectedRFQId, setSelectedRFQId] = useState<string | undefined>(undefined);

  // Synchronize state with live db.json back-end on mount and trigger events
  useEffect(() => {
    let active = true;

    async function fetchERPState() {
      try {
        const resLogs = await fetch('/api/activity-logs');
        if (resLogs.ok && active) {
          const lData = await resLogs.json();
          if (lData.logs) {
            setAuditLogs(lData.logs);
            saveStorage('audit_logs', lData.logs);
          }
          if (lData.notifications) {
            setNotifications(lData.notifications);
            saveStorage('notifications', lData.notifications);
          }
        }
      } catch (e) {}

      try {
        const resVendors = await fetch('/api/vendors');
        if (resVendors.ok && active) {
          const vData = await resVendors.json();
          setVendors(vData);
          saveStorage('vendors', vData);
        }
      } catch (e) {}

      try {
        const resRfqs = await fetch('/api/rfq');
        if (resRfqs.ok && active) {
          const rData = await resRfqs.json();
          setRfqs(rData);
          saveStorage('rfqs', rData);
        }
      } catch (e) {}

      try {
        const resQuotes = await fetch('/api/quotation');
        if (resQuotes.ok && active) {
          const qData = await resQuotes.json();
          setQuotations(qData);
          saveStorage('quotations', qData);
        }
      } catch (e) {}

      try {
        const resPO = await fetch('/api/purchase-orders');
        if (resPO.ok && active) {
          const pData = await resPO.json();
          setPurchaseOrders(pData);
          saveStorage('purchase_orders', pData);
        }
      } catch (e) {}

      try {
        const resInv = await fetch('/api/invoices');
        if (resInv.ok && active) {
          const iData = await resInv.json();
          setInvoices(iData);
          saveStorage('invoices', iData);
        }
      } catch (e) {}
    }

    fetchERPState();
    return () => { active = false; };
  }, [currentUser, syncReload]);

  // Sync current user to local storage
  useEffect(() => {
    saveStorage('current_user', currentUser);
  }, [currentUser]);

  // Clean data factory reset
  const handleFactoryReset = async () => {
    if (window.confirm('Do you want to reset the database back to standard clean seed files? This restores all original workflows.')) {
      try {
        const res = await fetch('/api/db/reset', { method: 'POST' });
        if (res.ok) {
          triggerReload();
          setActiveScreen('dashboard');
          return;
        }
      } catch (err) {}
      
      // Local fallback reset if backend unreachable
      setVendors(INITIAL_VENDORS);
      setRfqs(INITIAL_RFQS);
      setQuotations(INITIAL_QUOTATIONS);
      setPurchaseOrders(INITIAL_POS);
      setInvoices(INITIAL_INVOICES);
      setAuditLogs(INITIAL_AUDIT_LOGS);
      setNotifications(INITIAL_NOTIFICATIONS);
      setActiveScreen('dashboard');
    }
  };

  // 2. Real API actions backed by fallback local modifiers
  const handleLogin = async (user: User) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, role: user.role })
      });
      if (response.ok) {
        const result = await response.json();
        const serverUser = result.user;
        setCurrentUser(serverUser);
        setActiveScreen(serverUser.role === 'vendor' ? 'vendor-portal' : 'dashboard');
        triggerReload();
        return;
      }
    } catch (err) {}

    // Fallback login
    setCurrentUser(user);
    setActiveScreen(user.role === 'vendor' ? 'vendor-portal' : 'dashboard');
    logAction(user, 'Secure login authenticated', 'Auth Engine', `User ${user.name} logged into local storage fallback cache.`);
  };

  const handleLogout = async () => {
    if (currentUser) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id })
        });
      } catch (err) {}
    }
    setCurrentUser(null);
  };

  const logAction = (user: User | null, action: string, module: string, details: string) => {
    const newLog: AuditLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: user?.id || 'sys',
      userName: user?.name || 'Automated System',
      userRole: user?.role || 'admin',
      action,
      module,
      details
    };
    setAuditLogs(prev => [...prev, newLog]);
  };

  const addNotification = (title: string, message: string, type: Notification['type']) => {
    const newNotif: Notification = {
      id: 'notif-' + Date.now(),
      title,
      message,
      timestamp: new Date().toISOString(),
      type,
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Add Vendor
  const handleAddVendor = async (newVendor: Vendor) => {
    try {
      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newVendor, userId: currentUser?.id })
      });
      if (response.ok) {
        triggerReload();
        return;
      }
    } catch (err) {}

    setVendors(prev => [...prev, newVendor]);
    if (currentUser) {
      logAction(currentUser, 'Registered Supplier Partner', 'Supplier Directory', `Sourcing partner accredited: ${newVendor.name}.`);
    }
    addNotification('New Supplier Registered', `${newVendor.name} registered under primary classification: ${newVendor.category}.`, 'system');
  };

  // Update Vendor Status (Active, Hold, Blocked)
  const handleUpdateVendorStatus = async (vendorId: string, status: Vendor['status']) => {
    try {
      const response = await fetch(`/api/vendors/${vendorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        triggerReload();
        return;
      }
    } catch (err) {}

    setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, status } : v));
    const targetVendor = vendors.find(v => v.id === vendorId);
    if (currentUser && targetVendor) {
      logAction(currentUser, `Updated Supplier Status`, 'Supplier Directory', `Supplier status updated for ${targetVendor.name} to '${status}'.`);
    }
    addNotification('Supplier Compliance Update', `Supplier status changed to '${status}'.`, 'system');
  };

  // Create/Publish RFQs
  const handleAddRFQ = async (newRFQ: RFQ) => {
    try {
      const response = await fetch('/api/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newRFQ, userId: currentUser?.id })
      });
      if (response.ok) {
        triggerReload();
        return;
      }
    } catch (err) {}

    setRfqs(prev => [...prev, newRFQ]);
    if (currentUser) {
      logAction(currentUser, newRFQ.status === 'Published' ? 'Published RFQ Document' : 'Saved Draft RFQ', 'RFQ Manager', `RFQ '${newRFQ.title}' was added by officer.`);
    }
    if (newRFQ.status === 'Published') {
      addNotification('New RFQ Dispatch Event', `RFQ Reference: ${newRFQ.id.toUpperCase()} published in category: ${newRFQ.category}.`, 'rfq');
    }
  };

  // Vendor Quotation submissions
  const handleSubmitQuotation = async (newQuotation: Quotation) => {
    try {
      const response = await fetch('/api/quotation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newQuotation, userId: currentUser?.id })
      });
      if (response.ok) {
        triggerReload();
        return;
      }
    } catch (err) {}

    setQuotations(prev => {
      const filtered = prev.filter(q => !(q.rfqId === newQuotation.rfqId && q.vendorId === newQuotation.vendorId));
      return [...filtered, newQuotation];
    });
    setRfqs(prev => prev.map(r => r.id === newQuotation.rfqId ? { ...r, status: 'Under Comparison' } : r));
    if (currentUser) {
      logAction(currentUser, 'Submitted Compliance Bid', 'Vendor Portal', `Submitted cost proposal of value: ${formatINR(newQuotation.grandTotal)} matching RFQ ID ${newQuotation.rfqId}.`);
    }
    addNotification('Quotation Submitted', `Sourcing offer of ${formatINR(newQuotation.grandTotal)} filed by ${newQuotation.vendorName}.`, 'quotation');
  };

  // Initiate Manager Approval Loops from Comparative board
  const handleInitiateApproval = async (rfqId: string, qId: string, details: any, comments: string) => {
    try {
      const response = await fetch('/api/quotation/select-vendor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rfqId, quotationId: qId, comments, userId: currentUser?.id })
      });
      if (response.ok) {
        triggerReload();
        return;
      }
    } catch (err) {}

    const selectedQuote = quotations.find(q => q.id === qId);
    setRfqs(prev => prev.map(r => r.id === rfqId ? { ...r, status: 'Pending Approval', approvalRemarks: comments } : r));
    setQuotations(prev => prev.map(q => q.rfqId === rfqId ? { ...q, status: q.id === qId ? 'Selected' : 'Rejected' } : q));
    if (currentUser) {
      logAction(currentUser, 'Initiated Approval Workflow', 'Approvals Queue', `Requisition matching quote Ref ${qId} escalated to Manager procurement authorization.`);
    }
    addNotification('SOP Approval Escalation', `Requisition matching ${selectedQuote?.vendorName} awaits executive clearance.`, 'approval');
  };

  // Manager Approve Requisition
  const handleApproveRFQ = async (rfqId: string, remarks: string, reviewedBy: string) => {
    try {
      const response = await fetch('/api/approvals/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rfqId, remarks, reviewedBy, userId: currentUser?.id })
      });
      if (response.ok) {
        triggerReload();
        return;
      }
    } catch (err) {}

    setRfqs(prev => prev.map(r => r.id === rfqId ? { ...r, status: 'Approved' } : r));
    if (currentUser) {
      logAction(currentUser, 'Authorized Requisition Signature', 'Approvals Queue', `Executive sign-off recorded for RFQ Ref ${rfqId}. Comments: "${remarks}".`);
    }
    addNotification('Requisition Approved', `Sourcing request authorized by executive: ${reviewedBy}.`, 'approval');
  };

  // Manager Reject Requisition
  const handleRejectRFQ = async (rfqId: string, remarks: string, reviewedBy: string) => {
    try {
      const response = await fetch('/api/approvals/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rfqId, remarks, reviewedBy, userId: currentUser?.id })
      });
      if (response.ok) {
        triggerReload();
        return;
      }
    } catch (err) {}

    setRfqs(prev => prev.map(r => r.id === rfqId ? { ...r, status: 'Published' } : r));
    setQuotations(prev => prev.map(q => q.rfqId === rfqId ? { ...q, status: 'Submitted' } : q));
    if (currentUser) {
      logAction(currentUser, 'Rejected Sourcing Requisition', 'Approvals Queue', `Requisition Ref ${rfqId} was returned by executive. Revision comments: "${remarks}".`);
    }
    addNotification('Requisition Returned', `Sourcing dossier returned to comparative state for audit corrections.`, 'approval');
  };

  // Generate Purchase Order
  const handleGeneratePO = async (rfqId: string, qId: string) => {
    try {
      const response = await fetch('/api/purchase-order/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rfqId, quotationId: qId, userId: currentUser?.id })
      });
      if (response.ok) {
        triggerReload();
        return;
      }
    } catch (err) {}

    const matchingQuote = quotations.find(q => q.id === qId);
    if (!matchingQuote) return;

    setRfqs(prev => prev.map(r => r.id === rfqId ? { ...r, status: 'PO Generated' } : r));
    const subtotal = matchingQuote.items.reduce((sum, i) => sum + i.totalPrice, 0);
    const taxAmount = subtotal * (matchingQuote.taxRate / 100);

    const newPO: PurchaseOrder = {
      id: 'po-' + Date.now(),
      rfqId,
      quotationId: qId,
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

    setPurchaseOrders(prev => [newPO, ...prev]);
    if (currentUser) {
      logAction(currentUser, 'Issued Purchase Order', 'Purchase Order Registry', `Issued PO clearance: ${newPO.poNumber} matching bid value of ${formatINR(newPO.grandTotal)}.`);
    }
    addNotification('Purchase Order Dispatched', `${newPO.poNumber} issued in compliance with vendor transport schedules.`, 'system');
  };

  // Generate Invoice
  const handleGenerateInvoice = async (poId: string) => {
    const poObj = purchaseOrders.find(p => p.id === poId);
    if (!poObj) return;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // NET 30 standard

    const newInvoice: Invoice = {
      id: 'inv-' + Date.now(),
      poId,
      poNumber: poObj.poNumber,
      invoiceNumber: 'INV-' + (800 + Math.floor(Math.random() * 199)) + '-BYT',
      invoiceDate: new Date().toISOString(),
      dueDate: dueDate.toISOString(),
      subtotal: poObj.subtotal,
      taxAmount: poObj.taxAmount,
      grandTotal: poObj.grandTotal,
      status: 'Draft',
      paymentTerms: 'NET 30'
    };

    setInvoices(prev => [newInvoice, ...prev]);
    if (currentUser) {
      logAction(currentUser, 'Invoiced Purchase Order', 'Invoice Ledger', `Invoice ${newInvoice.invoiceNumber} created matching PO Ref ${poObj.poNumber}.`);
    }
    addNotification('Accounts Invoice Created', `Registered standard invoice matching PO clearance: ${newInvoice.invoiceNumber}.`, 'invoice');
  };

  // Transition invoice status (Draft, Sent, Paid, Overdue)
  const handleUpdateInvoiceStatus = async (invId: string, status: Invoice['status']) => {
    if (status === 'Paid') {
      try {
        const response = await fetch('/api/invoices/mark-paid', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invoiceId: invId, userId: currentUser?.id })
        });
        if (response.ok) {
          triggerReload();
          return;
        }
      } catch (err) {}
    }

    setInvoices(prev => prev.map(i => i.id === invId ? { ...i, status } : i));
    const targetInvoice = invoices.find(i => i.id === invId);
    if (currentUser && targetInvoice) {
      logAction(currentUser, `Transitioned Invoice Status`, 'Invoice Ledger', `Invoice ${targetInvoice.invoiceNumber} status set to '${status}'.`);
    }
    addNotification('Invoice Ledger Updated', `Invoice status changed to '${status}'.`, 'invoice');
  };

  // Dispatch invoice email
  const handleSendInvoiceEmail = async (invId: string, email: string) => {
    try {
      const response = await fetch('/api/invoices/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invId, email, userId: currentUser?.id })
      });
      if (response.ok) {
        triggerReload();
        return;
      }
    } catch (err) {}

    setInvoices(prev => prev.map(i => i.id === invId ? { ...i, status: 'Sent' } : i));
    const targetInvoice = invoices.find(i => i.id === invId);
    if (currentUser && targetInvoice) {
      logAction(currentUser, 'Dispatched Invoice to Vendor', 'Invoice Ledger', `Emailed link of invoice ${targetInvoice.invoiceNumber} to partner: ${email}.`);
    }
    addNotification('Invoice Shared', `Dispatched electronic invoice document to supplier gateway: ${email}.`, 'invoice');
  };

  // Notification management
  const handleClearReadNotifs = async () => {
    try {
      const response = await fetch('/api/notifications/clear-read', { method: 'POST' });
      if (response.ok) {
        triggerReload();
        return;
      }
    } catch (err) {}

    setNotifications(prev => prev.filter(n => !n.read));
    addNotification('Notifications Cleared', 'Read notifications removed from local memory registers.', 'system');
  };

  const handleMarkNotifRead = async (id: string) => {
    try {
      const response = await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifId: id })
      });
      if (response.ok) {
        triggerReload();
        return;
      }
    } catch (err) {}

    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // ERP Role Sandbox Switcher (Fulfills multi-role testing in one click!)
  const handleSandboxRoleChange = (role: UserRole) => {
    const correspondingUser = DEMO_USERS.find(u => u.role === role);
    if (correspondingUser) {
      handleLogin(correspondingUser);
    }
  };

  // Render Login screen if not authenticated
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Sidebar checklist navigation items
  const sidebarNavigation = [
    { id: 'dashboard', label: 'Monitor Dashboard', icon: LayoutDashboard, visible: true },
    { id: 'vendor-management', label: 'Vendor Directory', icon: Users, visible: (currentUser.role !== 'vendor') },
    { id: 'rfq-creation', label: 'Initiate RFQ', icon: FilePlus, visible: (currentUser.role === 'officer' || currentUser.role === 'admin') },
    { id: 'vendor-portal', label: 'Vendor Portal Bid', icon: ArrowRightLeft, visible: (currentUser.role === 'vendor' || currentUser.role === 'admin') },
    { id: 'quotation-comparison', label: 'Quotation Comparison', icon: CheckSquare, visible: (currentUser.role !== 'vendor') },
    { id: 'approval-workflow', label: 'Approvals Queue', icon: CheckSquare, visible: (currentUser.role !== 'vendor'), badge: rfqs.filter(r => r.status === 'Pending Approval').length },
    { id: 'purchase-order-invoice', label: 'PO & Billing Ledgers', icon: Receipt, visible: true },
    { id: 'activity-logs', label: 'Audit Logs & Alarms', icon: ScrollText, visible: true, badge: notifications.filter(n => !n.read).length },
    { id: 'reports-analytics', label: 'Reports & Sourcing KPI', icon: LineChart, visible: true },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans relative" id="applet-shell">
      
      {/* Enterprise Sandbox Controller (Differentiation Feature) */}
      <div className="bg-white border-b border-slate-200 py-3 px-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 z-30 relative shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="bg-slate-800 p-2 rounded-lg text-white">
            <Sliders className="w-4 h-4 text-slate-300" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Sandbox Workspace Controller</span>
            <span className="text-xs text-slate-700 font-sans font-medium">Instantly toggle role perspectives to test end-to-end document lifecycles:</span>
          </div>
        </div>

        {/* Dynamic Sandbox Selector Controls */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-sans">
          {(['officer', 'manager', 'vendor', 'admin'] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => handleSandboxRoleChange(r)}
              className={`px-3 py-1.5 rounded-lg border font-semibold text-[11px] transition cursor-pointer ${
                currentUser.role === r 
                  ? 'bg-slate-900 border-slate-900 text-white shadow-sm font-bold' 
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-350'
              }`}
              id={`sandbox-toggle-${r}`}
            >
              Perspective: {r === 'officer' ? 'Officer' : r === 'manager' ? 'Manager' : r === 'vendor' ? 'Vendor' : 'Admin'}
            </button>
          ))}
          
          <span className="text-slate-300 font-mono text-xs font-bold px-1.5">|</span>

          {/* Reset button */}
          <button
            onClick={handleFactoryReset}
            className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 px-2.5 py-1.5 bg-rose-50 border border-slate-200 rounded-lg hover:border-rose-200 transition flex items-center gap-1 cursor-pointer"
            id="erp-factory-reset-btn"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Purge Cache
          </button>
        </div>
      </div>

      {/* Main ERP Layout container */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Core Sidebar Menu */}
        <aside className="w-64 bg-slate-900 text-slate-300 border-r border-slate-800 hidden lg:flex flex-col justify-between shrink-0 z-20">
          <div className="space-y-6 py-5 px-3">
            
            {/* Sourcing title block */}
            <div className="flex items-center gap-2 px-3">
              <div className="bg-white/10 p-2 rounded-lg text-white">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-white font-sans">
                  VendorBridge
                </h1>
                <p className="text-[10px] text-slate-400 font-mono">Operations Ledger Suite v3.2</p>
              </div>
            </div>

            {/* Sourcing Menu list */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold px-3 select-none">Procurement Menu</span>
              <nav className="space-y-1 pt-1.5 animate-fade-in">
                {sidebarNavigation.filter(n => n.visible).map((item) => {
                  const isSelected = activeScreen === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveScreen(item.id);
                        if (item.id === 'quotation-comparison') {
                          setSelectedRFQId(undefined); // Reset specific select if clicking tab
                        }
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition cursor-pointer group ${
                        isSelected 
                          ? 'bg-white/10 text-white font-bold' 
                          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                      id={`sidebar-link-${item.id}`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-500 group-hover:text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          item.id === 'approval-workflow' ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

          </div>

          {/* User profile capsule bottom */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/40">
            <div className="flex items-center justify-between gap-2">
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-200 truncate">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500 font-mono truncate">{currentUser.email}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="text-slate-500 hover:text-red-400 transition cursor-pointer shrink-0"
                title="Disconnect Corporate Portal"
                id="sidebar-logout-btn"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-2 text-[10px] text-slate-400 text-center font-mono font-semibold uppercase tracking-wider bg-slate-800 py-1.5 rounded">
              Role: <strong className="text-indigo-400">{currentUser.role}</strong>
            </div>
          </div>
        </aside>

        {/* Content Area viewport limits */}
        <main className="flex-1 bg-slate-50 flex flex-col overflow-y-auto">
          
          {/* Mobile Navigation Header */}
          <header className="lg:hidden bg-slate-900 border-b border-slate-800 py-3 px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="bg-white/10 p-1.5 rounded text-white">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-white block">VendorBridge</span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={activeScreen}
                onChange={(e) => setActiveScreen(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
                id="mobile-nav-selector"
              >
                {sidebarNavigation.filter(n => n.visible).map(n => <option key={n.id} value={n.id}>{n.label}</option>)}
              </select>
              <button 
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-400 p-1"
                id="mobile-logout-btn"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Core Dynamic Screen Injection viewport with padding */}
          <div className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-16 z-10 relative">
            
            {activeScreen === 'dashboard' && (
              <Dashboard 
                user={currentUser} 
                vendors={vendors}
                rfqs={rfqs} 
                quotations={quotations}
                purchaseOrders={purchaseOrders}
                invoices={invoices}
                onNavigate={setActiveScreen}
                onSelectRFQ={setSelectedRFQId}
              />
            )}

            {activeScreen === 'vendor-management' && (
              <VendorManagement 
                user={currentUser}
                vendors={vendors}
                onAddVendor={handleAddVendor}
                onUpdateVendorStatus={handleUpdateVendorStatus}
              />
            )}

            {activeScreen === 'rfq-creation' && (
              <RFQCreation 
                user={currentUser}
                vendors={vendors}
                onAddRFQ={handleAddRFQ}
                onNavigate={setActiveScreen}
              />
            )}

            {activeScreen === 'vendor-portal' && (
              <VendorPortal 
                user={currentUser}
                vendors={vendors}
                rfqs={rfqs}
                quotations={quotations}
                onSubmitQuotation={handleSubmitQuotation}
              />
            )}

            {activeScreen === 'quotation-comparison' && (
              <QuotationComparison 
                user={currentUser}
                vendors={vendors}
                rfqs={rfqs}
                quotations={quotations}
                onInitiateApproval={handleInitiateApproval}
                selectedRFQId={selectedRFQId}
                onSelectRFQ={setSelectedRFQId}
              />
            )}

            {activeScreen === 'approval-workflow' && (
              <ApprovalWorkflow 
                user={currentUser}
                vendors={vendors}
                rfqs={rfqs}
                quotations={quotations}
                onApproveRFQ={handleApproveRFQ}
                onRejectRFQ={handleRejectRFQ}
              />
            )}

            {activeScreen === 'purchase-order-invoice' && (
              <PurchaseOrderInvoice 
                user={currentUser}
                vendors={vendors}
                rfqs={rfqs}
                quotations={quotations}
                purchaseOrders={purchaseOrders}
                invoices={invoices}
                onGeneratePO={handleGeneratePO}
                onGenerateInvoice={handleGenerateInvoice}
                onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
                onSendInvoiceEmail={handleSendInvoiceEmail}
              />
            )}

            {activeScreen === 'activity-logs' && (
              <ActivityLogs 
                user={currentUser}
                logs={auditLogs}
                notifications={notifications}
                onClearReadNotifications={handleClearReadNotifs}
                onMarkNotificationRead={handleMarkNotifRead}
              />
            )}

            {activeScreen === 'reports-analytics' && (
              <ReportsAnalytics 
                user={currentUser}
                vendors={vendors}
                rfqs={rfqs}
                quotations={quotations}
                purchaseOrders={purchaseOrders}
                invoices={invoices}
              />
            )}

          </div>

        </main>

      </div>

    </div>
  );
}
