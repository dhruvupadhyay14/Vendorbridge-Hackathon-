import React, { useState } from 'react';
import { RFQ, Quotation, PurchaseOrder, Invoice, Vendor, User } from '../types';
import { 
  Receipt, 
  Printer, 
  Download, 
  Mail, 
  CheckCircle, 
  ChevronRight, 
  Building2,
  Lock
} from 'lucide-react';
import { formatINR, isValidEmail } from '../utils';

interface PurchaseOrderInvoiceProps {
  user: User;
  vendors: Vendor[];
  rfqs: RFQ[];
  quotations: Quotation[];
  purchaseOrders: PurchaseOrder[];
  invoices: Invoice[];
  onGeneratePO: (rfqId: string, qId: string) => void;
  onGenerateInvoice: (poId: string) => void;
  onUpdateInvoiceStatus: (invId: string, status: Invoice['status']) => void;
  onSendInvoiceEmail: (invId: string, email: string) => void;
}

export default function PurchaseOrderInvoice({
  user,
  vendors,
  rfqs,
  quotations,
  purchaseOrders,
  invoices,
  onGeneratePO,
  onGenerateInvoice,
  onUpdateInvoiceStatus,
  onSendInvoiceEmail
}: PurchaseOrderInvoiceProps) {

  const waitingForPO = rfqs.filter(r => r.status === 'Approved');

  const [activeTab, setActiveTab] = useState<'po' | 'invoice'>('po');
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(purchaseOrders.length > 0 ? purchaseOrders[0] : null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(invoices.length > 0 ? invoices[0] : null);
  
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  React.useEffect(() => {
    if (!selectedPO && purchaseOrders.length > 0) {
      setSelectedPO(purchaseOrders[0]);
    }
  }, [purchaseOrders, selectedPO]);

  React.useEffect(() => {
    if (!selectedInvoice && invoices.length > 0) {
      setSelectedInvoice(invoices[0]);
    }
  }, [invoices, selectedInvoice]);

  const handleCreatePO = (rfqId: string) => {
    const rfq = rfqs.find(r => r.id === rfqId);
    if (!rfq) return;

    const rfqQuotes = quotations.filter(q => q.rfqId === rfqId);
    const matchedQuote = rfqQuotes.find(q => q.status === 'Selected') || rfqQuotes[0];
    if (!matchedQuote) {
      alert('Internal ERP error: Sourcing comparative quote data not resolved.');
      return;
    }

    onGeneratePO(rfqId, matchedQuote.id);
    showToast('Secure electronic purchase order generated and dispatched.');
  };

  const handleCreateInvoice = (poId: string) => {
    onGenerateInvoice(poId);
    showToast('Invoice ledger has been populated.');
    setActiveTab('invoice');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2500);
  };

  const executePrint = () => {
    setShowPrintModal(true);
  };

  const executePDFDownload = (refNum: string) => {
    showToast(`Compiled document ${refNum}: Downloaded.`);
  };

  const executeSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    if (!emailRecipient || !isValidEmail(emailRecipient)) {
      showToast('Validation Error: Please enter a correct corporate email address.');
      return;
    }

    onSendInvoiceEmail(selectedInvoice.id, emailRecipient);
    setShowEmailModal(false);
    setEmailRecipient('');
    showToast(`Email dispatched to ${emailRecipient}.`);
  };

  const getPODetails = (po: PurchaseOrder) => {
    const rfq = rfqs.find(r => r.id === po.rfqId);
    const vendor = vendors.find(v => v.id === po.vendorId);
    const quote = quotations.find(q => q.id === po.quotationId);
    return { rfq, vendor, quote };
  };

  const getInvoiceDetails = (inv: Invoice) => {
    const po = purchaseOrders.find(p => p.poNumber === inv.poNumber);
    const vendor = po ? vendors.find(v => v.id === po.vendorId) : null;
    return { po, vendor };
  };

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in" id="purchase-billing-view">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 bg-slate-900 text-white shadow-xl py-3 px-5 rounded-lg text-xs font-semibold z-50 border border-slate-700 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-450" />
          {toastMessage}
        </div>
      )}

      {/* Header and selection */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-slate-900">Procurement Ledgers & Billing</h2>
          <p className="text-sm text-slate-500 mt-1">
            Produce binding Purchase Orders (POs) and execute standard GST-compliant tax invoicing loops.
          </p>
        </div>

        {/* Global tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 shrink-0 font-sans shadow-inner">
          <button
            onClick={() => setActiveTab('po')}
            className={`px-4 py-2 rounded text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              activeTab === 'po' ? 'bg-white text-slate-900 border border-slate-250 shadow-sm' : 'text-slate-550 hover:text-slate-850'
            }`}
            id="tab-switcher-po"
          >
            <Lock className="w-3.5 h-3.5" /> Purchase Orders
          </button>
          <button
            onClick={() => setActiveTab('invoice')}
            className={`px-4 py-2 rounded text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
              activeTab === 'invoice' ? 'bg-white text-slate-900 border border-slate-250 shadow-sm' : 'text-slate-550 hover:text-slate-850'
            }`}
            id="tab-switcher-invoice"
          >
            <Receipt className="w-3.5 h-3.5" /> Invoices Ledger
          </button>
        </div>
      </div>

      {waitingForPO.length > 0 && user.role === 'officer' && (
        <div className="bg-white border border-indigo-200 rounded-xl p-4 flex items-center justify-between flex-wrap gap-4 shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-indigo-700 uppercase tracking-wider block">
              Authorization Clearance: Approved Requisition Ready
            </span>
            <p className="text-xs text-slate-700">
              Approved RFQ: <strong>{waitingForPO[0].title}</strong> is verified for binding purchasing release.
            </p>
          </div>
          <button
            onClick={() => handleCreatePO(waitingForPO[0].id)}
            className="bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white py-2 px-4 rounded transition shadow-sm flex items-center gap-1 uppercase tracking-wider cursor-pointer"
            id={`generate-po-btn-${waitingForPO[0].id}`}
          >
            Dispatch Purchase Order <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main tab content */}
      {activeTab === 'po' ? (
        // PURCHASE ORDERS SEGMENT
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* PO List Left Panel */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-205 p-4 space-y-3 shadow-sm">
            <h3 className="font-bold text-xs uppercase font-mono tracking-wider text-slate-500">
              Active Purchase Orders({purchaseOrders.length})
            </h3>

            <div className="space-y-2">
              {purchaseOrders.length > 0 ? (
                purchaseOrders.map((po) => {
                  const { vendor } = getPODetails(po);
                  const isSelected = selectedPO?.id === po.id;

                  return (
                    <button
                      key={po.id}
                      onClick={() => setSelectedPO(po)}
                      className={`w-full text-left p-3.5 border rounded-lg transition flex flex-col justify-between cursor-pointer ${
                        isSelected 
                          ? 'border-indigo-650 bg-indigo-50/60 shadow-sm' 
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                      id={`po-list-card-${po.id}`}
                    >
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold font-mono text-slate-400">
                            {po.poNumber}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase border bg-slate-100 text-slate-700 border-slate-250`}>
                            {po.status}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1 mt-1">
                          Supplier: {vendor?.name || 'Supply Partner'}
                        </h4>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono mt-3 pt-2 text-slate-500 border-t border-slate-100">
                        <span>Grand Value:</span>
                        <span className="text-slate-800 font-bold">{formatINR(po.grandTotal)}</span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="bg-slate-50 p-5 border border-slate-200 text-center text-slate-500 rounded-lg text-xs font-medium">
                  No active POs found. Sign off a pending requisition inside the approvals desk to clear PO clearances.
                </div>
              )}
            </div>
          </div>

          {/* PO Detail Viewer Right Panel */}
          <div className="lg:col-span-8">
            {selectedPO ? (
              (() => {
                const { rfq, vendor, quote } = getPODetails(selectedPO);
                const poInvoice = invoices.find(inv => inv.poNumber === selectedPO.poNumber);

                return (
                  <div className="bg-white rounded-xl border border-slate-205 p-6 space-y-6 shadow-sm animate-fade-in" id="po-document">
                    
                    {/* Document Header Panel */}
                    <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-200 pb-4 gap-4">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">Purchasing Order Clearance</span>
                        <h3 className="text-lg font-bold text-slate-950 font-mono mt-0.5">{selectedPO.poNumber}</h3>
                        <p className="text-xs text-slate-500">Established: {new Date(selectedPO.createdAt).toLocaleString()}</p>
                      </div>
                      
                      <div className="sm:text-right font-mono text-xs text-slate-500">
                        <div>Billing Entity Code: <span className="font-semibold text-slate-800">VB Inc.</span></div>
                        <div>Enterprise Registry: <span className="font-semibold text-slate-804">GST-29VB98A3Z1</span></div>
                      </div>
                    </div>

                    {/* Meta section: Addresses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                        <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block">Acquisition Billing</span>
                        <p className="text-slate-700 font-semibold">{selectedPO.billingAddress}</p>
                      </div>

                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                        <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block">Logistics Delivery</span>
                        <p className="text-slate-700 font-semibold">{selectedPO.shippingAddress}</p>
                      </div>
                    </div>

                    {/* Sourcing vendor overview panel */}
                    <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg flex justify-between items-center flex-wrap gap-4 text-xs">
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 font-bold block">Accredited Supplier Partners</span>
                        <h4 className="text-sm font-bold text-slate-900 mt-0.5">{vendor?.name}</h4>
                        <p className="text-slate-500 mt-0.5">{vendor?.email} • {vendor?.phone}</p>
                      </div>
                      
                      <div className="text-right font-mono text-slate-500">
                        <p>Supplier GSTIN: <span className="font-bold text-slate-800">{vendor?.gstNumber}</span></p>
                        <p className="text-[10px] mt-0.5">Reliability SLA: <span className="text-emerald-700 font-semibold">{vendor?.reliabilityScore}%</span></p>
                      </div>
                    </div>

                    {/* Items table */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold font-mono uppercase text-slate-400 tracking-wider">
                        Procurement Line Items Registry
                      </h4>

                      <div className="overflow-x-auto text-xs min-h-[100px]">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 text-[10px] text-slate-500 font-mono uppercase">
                              <th className="py-2">Line Ref</th>
                              <th className="py-2 text-right font-mono">Qty Volume</th>
                              <th className="py-2 text-right font-mono">Locked Bid</th>
                              <th className="py-2 text-right font-mono">Line Sum</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-sans text-slate-700">
                            {quote?.items.map((item, index) => (
                              <tr key={index}>
                                <td className="py-2.5 font-sans font-medium text-slate-800">{item.name}</td>
                                <td className="py-2.5 text-right font-mono text-slate-500">
                                  {rfq?.items[index]?.quantity || item.totalPrice / (item.unitPrice || 1)} {rfq?.items[index]?.unit || 'QTY'}
                                </td>
                                <td className="py-2.5 text-right font-mono text-slate-500">{formatINR(item.unitPrice)}</td>
                                <td className="py-2.5 text-right font-mono font-semibold text-slate-900">{formatINR(item.totalPrice)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* PO totals summary list */}
                    <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg space-y-2 text-xs font-mono text-slate-500">
                      <div className="flex justify-between">
                        <span>Lines Subtotal:</span>
                        <span className="text-slate-805 font-semibold text-slate-800">{formatINR(selectedPO.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>GST / Service surcharges ({selectedPO.taxAmount > 0 ? (selectedPO.taxAmount / selectedPO.subtotal * 100).toFixed(0) : '18'}%):</span>
                        <span className="text-slate-805 font-semibold text-slate-800">{formatINR(selectedPO.taxAmount)}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-slate-900 font-sans">
                        <span>Grand PO allocation amount:</span>
                        <span className="text-indigo-850 font-mono text-sm">{formatINR(selectedPO.grandTotal)}</span>
                      </div>
                    </div>

                    {/* PO Controls: Invoice creation trigger */}
                    {user.role === 'officer' && (
                      <div className="flex justify-end gap-3 pt-2">
                        {poInvoice ? (
                          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded text-xs font-bold flex items-center gap-1.5 font-sans">
                            <CheckCircle className="w-4 h-4 text-emerald-600" /> Invoice clearance generated: Reference <strong>{poInvoice.invoiceNumber}</strong>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleCreateInvoice(selectedPO.id)}
                            className="bg-slate-900 hover:bg-slate-800 font-bold text-white text-xs px-5 py-2.5 rounded transition shadow-sm flex items-center gap-1.5 uppercase tracking-wider cursor-pointer font-sans"
                            id="trigger-generate-invoice-btn"
                          >
                            <Receipt className="w-4 h-4" /> Produce Tax-compliant Invoice
                          </button>
                        )}
                      </div>
                    )}

                  </div>
                );
              })()
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-16 text-center text-slate-550">
                Awaiting Purchase clearance selection dockets.
              </div>
            )}
          </div>

        </div>
      ) : (
        // INVOICES LEDGER SEGMENT
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Invoice List Left Panel */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-205 p-4 space-y-3 shadow-sm">
            <h3 className="font-bold text-xs uppercase font-mono tracking-wider text-slate-500">
              Tax Ledger Invoices({invoices.length})
            </h3>

            <div className="space-y-2">
              {invoices.length > 0 ? (
                invoices.map((inv) => {
                  const { vendor } = getInvoiceDetails(inv);
                  const isSelected = selectedInvoice?.id === inv.id;

                  return (
                    <button
                      key={inv.id}
                      onClick={() => setSelectedInvoice(inv)}
                      className={`w-full text-left p-3.5 border rounded-lg transition flex flex-col justify-between cursor-pointer ${
                        isSelected 
                          ? 'border-indigo-650 bg-indigo-50/60 shadow-sm' 
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                      id={`inv-list-card-${inv.id}`}
                    >
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold font-mono text-slate-400">
                            {inv.invoiceNumber}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase border ${
                            inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            inv.status === 'Sent' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                            'bg-slate-100 text-slate-700 border-slate-250'
                          }`}>
                            {inv.status}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1 mt-1">
                          Supplier: {vendor?.name || 'Supply Partner'}
                        </h4>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-mono mt-3 pt-2 text-slate-500 border-t border-slate-100">
                        <span>Invoice Amount:</span>
                        <span className="text-slate-800 font-bold">{formatINR(inv.grandTotal)}</span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="bg-slate-50 p-5 border border-slate-200 text-center text-slate-500 rounded-lg text-xs font-medium">
                  No invoices currently logs inside tax accounts database.
                </div>
              )}
            </div>
          </div>

          {/* Invoice Document Detail View */}
          <div className="lg:col-span-8">
            {selectedInvoice ? (
              (() => {
                const { po, vendor } = getInvoiceDetails(selectedInvoice);

                return (
                  <div className="space-y-4">
                    
                    {/* Document Toolbar controls */}
                    <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg flex items-center justify-between flex-wrap gap-2 text-xs font-sans shadow-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-500 font-mono">Invoice State:</span>
                        
                        {(user.role === 'admin' || user.role === 'officer') ? (
                          <select
                            value={selectedInvoice.status}
                            onChange={(e) => onUpdateInvoiceStatus(selectedInvoice.id, e.target.value as any)}
                            className="bg-white border border-slate-250 text-slate-850 py-1 px-2.5 rounded cursor-pointer font-bold font-mono focus:outline-none"
                            id="invoice-status-direct-select"
                          >
                            <option value="Draft">Draft</option>
                            <option value="Sent">Sent</option>
                            <option value="Paid">Paid</option>
                            <option value="Overdue">Overdue</option>
                          </select>
                        ) : (
                          <span className="font-bold underline text-indigo-755 uppercase font-mono">{selectedInvoice.status}</span>
                        )}
                      </div>

                      <div className="flex wrap gap-1.5 font-sans text-xs">
                        <button
                          onClick={() => setShowEmailModal(true)}
                          className="bg-white text-slate-655 border border-slate-205 hover:text-slate-900 hover:border-slate-350 px-3 py-1.5 rounded transition flex items-center gap-1 font-semibold cursor-pointer"
                          id="invoice-share-email-btn"
                        >
                          <Mail className="w-3.5 h-3.5" /> Share Email
                        </button>
                        
                        <button
                          onClick={() => executePDFDownload(selectedInvoice.invoiceNumber)}
                          className="bg-white text-slate-655 border border-slate-205 hover:text-slate-900 hover:border-slate-350 px-3 py-1.5 rounded transition flex items-center gap-1 font-semibold cursor-pointer"
                          id="invoice-download-pdf-btn"
                        >
                          <Download className="w-3.5 h-3.5" /> Export PDF
                        </button>

                        <button
                          onClick={executePrint}
                          className="bg-slate-900 text-white hover:bg-slate-800 px-3.5 py-1.5 rounded transition flex items-center gap-1 font-bold cursor-pointer"
                          id="invoice-print-document-btn"
                        >
                          <Printer className="w-3.5 h-3.5" /> Print Layout
                        </button>
                      </div>
                    </div>

                    {/* Standard Corporate Formatted Invoice Sheet container */}
                    <div className="bg-white text-slate-800 p-8 rounded-xl shadow-sm space-y-8 font-sans border border-slate-200 animate-fade-in" id="print-invoice-sheet">
                      
                      {/* Form Header */}
                      <div className="flex justify-between items-start border-b border-slate-200 pb-5">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="bg-slate-900 text-white p-2 rounded-lg">
                              <Building2 className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-base font-bold tracking-tight text-slate-900">VB Corporate Network</span>
                          </div>
                          <p className="text-slate-500 text-xs mt-1">Enterprise Procurement Solutions Ledger</p>
                        </div>
                        
                        <div className="text-right text-xs">
                          <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wide">Commercial Invoice</h2>
                          <p className="font-mono text-slate-500 font-semibold mt-1">Ref No: {selectedInvoice.invoiceNumber}</p>
                          <p className="text-slate-500 mt-0.5">PO Ref: {selectedInvoice.poNumber}</p>
                        </div>
                      </div>

                      {/* Addresses */}
                      <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block">BILL TO REMITTANCE:</span>
                          <h4 className="font-bold text-slate-800">VendorBridge Corp Inc.</h4>
                          <p className="text-slate-500 leading-normal">
                            500 Oracle Parkway,<br />
                            Redwood City, CA 94065<br />
                            SLA Tax Registry: GST-29VB98A3Z1
                          </p>
                        </div>

                        <div className="space-y-1.5 text-right font-sans">
                          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block">SUPPLIER REMITTANCE FROM:</span>
                          <h4 className="font-bold text-slate-800">{vendor?.name}</h4>
                          <p className="text-slate-505 leading-normal">
                            {vendor?.contactName} (Primary Sourcing Representative)<br />
                            SLA Email: {vendor?.email}<br />
                            Supplier Tax ID: {vendor?.gstNumber}
                          </p>
                        </div>
                      </div>

                      {/* Dates and terms */}
                      <div className="grid grid-cols-4 gap-2 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-center font-mono text-slate-600">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase">Billing date</p>
                          <p className="font-semibold text-slate-800 mt-1">{new Date(selectedInvoice.invoiceDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase">Payment Due</p>
                          <p className="font-semibold text-slate-800 mt-1">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase">Credit Terms</p>
                          <p className="font-semibold text-slate-800 mt-1">{selectedInvoice.paymentTerms}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase">GST Bracket</p>
                          <p className="font-semibold text-slate-800 mt-1">{po ? (po.taxAmount / po.subtotal * 10).toFixed(0) : '18'}% Allocated</p>
                        </div>
                      </div>

                      {/* Detailed billing table */}
                      <div className="space-y-2 text-xs">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-400 uppercase font-mono text-[10px]">
                              <th className="py-2.5">Specification Item Line Description</th>
                              <th className="py-2.5 text-right font-mono">Volume Quantity</th>
                              <th className="py-2.5 text-right font-mono">Supplier Unit (₹)</th>
                              <th className="py-2.5 text-right font-mono">Grand Subtotal (₹)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-705">
                            {po ? (
                              <tr>
                                <td className="py-3 text-slate-900 font-bold font-sans">
                                  Standard Sourcing Requisition Matching {po.poNumber}
                                  <p className="text-[10px] text-slate-400 font-mono font-normal mt-0.5">Corporate items clearance match</p>
                                </td>
                                <td className="py-3 text-right font-mono">1 Units Service</td>
                                <td className="py-3 text-right font-mono">{formatINR(po.subtotal)}</td>
                                <td className="py-3 text-right font-mono font-bold text-slate-900">{formatINR(po.subtotal)}</td>
                              </tr>
                            ) : (
                              <tr>
                                <td className="py-3 text-slate-900 font-bold">Standard Sourcing Requisition Package</td>
                                <td className="py-3 text-right font-mono">1 Service</td>
                                <td className="py-3 text-right font-mono">{formatINR(selectedInvoice.subtotal)}</td>
                                <td className="py-3 text-right font-mono font-bold text-slate-900">{formatINR(selectedInvoice.subtotal)}</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Totals panel */}
                      <div className="flex justify-end pt-4 border-t border-slate-200">
                        <div className="w-1/2 space-y-2 text-xs text-slate-550 font-mono">
                          <div className="flex justify-between font-medium">
                            <span>Subtotal Items:</span>
                            <span className="text-slate-800">{formatINR(selectedInvoice.subtotal)}</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span>GST Tax Amount:</span>
                            <span className="text-slate-800">{formatINR(selectedInvoice.taxAmount)}</span>
                          </div>
                          <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-200 pt-2 font-sans">
                            <span>Total Due Remitted:</span>
                            <span className="text-indigo-850">{formatINR(selectedInvoice.grandTotal)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Payment instruction notes */}
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-[10px] text-slate-500 space-y-1.5 leading-relaxed">
                        <span className="font-bold text-slate-600 tracking-wide uppercase block">Remittance bank directives:</span>
                        <p>Bank Remittance Directive: Execute Wire Transfer to system routing (Chase Bank Corp - Router VB92120489).</p>
                        <p>Remittance reference notes: Always specify Commercial Invoice Ref Number in bank fields to prevent clearance holding.</p>
                      </div>

                    </div>

                  </div>
                );
              })()
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-16 text-center text-slate-500 shadow-sm animate-fade-in">
                No invoices currently selected in ledger workbook.
              </div>
            )}
          </div>

        </div>
      )}

      {/* Share Invoice Email Modal layout */}
      {showEmailModal && selectedInvoice && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white border border-slate-300 p-6 rounded-lg shadow-2xl max-w-sm w-full space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 uppercase font-mono">Email Invoice Remittance</h3>
              <p className="text-xs text-slate-500 mt-1">Dispatches secure electronic invoice document directly to supplier partners.</p>
            </div>

            <form onSubmit={executeSendEmail} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Recipient Sourcing Email</label>
                <input
                  type="email"
                  required
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  placeholder="accounts@supplier.com"
                  className="w-full px-4 py-2 bg-white border border-slate-220 text-slate-800 rounded-lg text-xs"
                  id="email-modal-recipient"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1 font-semibold text-xs">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="px-3 py-1.5 border border-slate-205 text-slate-655 hover:text-slate-850 rounded bg-white hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-950 hover:bg-slate-850 font-bold text-white rounded cursor-pointer flex items-center gap-1.5"
                  id="email-modal-submit"
                >
                  <Mail className="w-3.5 h-3.5" /> Send Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Standard Print Layout Modal mockup */}
      {showPrintModal && selectedInvoice && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex justify-center items-start overflow-y-auto z-50 p-6">
          <div className="bg-white border border-slate-300 rounded-lg max-w-4xl w-full p-4 space-y-4 shadow-2xl">
            
            {/* Control panel inside print modal */}
            <div className="flex justify-between items-center bg-slate-100 px-4 py-2.5 rounded border border-slate-205 text-slate-700 text-xs">
              <span className="flex items-center gap-1.5 font-sans">
                System print queue initialized for document clearance.
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => alert('Print stream dispatched successfully to target printer.')}
                  className="bg-slate-950 hover:bg-slate-850 text-white font-bold px-3.5 py-1 rounded cursor-pointer"
                >
                  Confirm Print
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="bg-white border border-slate-220 hover:bg-slate-50 text-slate-655 font-semibold px-3 py-1 rounded cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Document wrapper duplicates invoice styles */}
            <div className="bg-white p-6 rounded border border-slate-200 text-slate-900 overflow-x-auto shadow-inner">
              <div className="min-w-[650px] space-y-8 text-xs font-sans">
                <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-850">VB Corporate Network</h3>
                    <p className="text-slate-500 text-[10px]">Standard clearance key: GST-29VB98A3Z1</p>
                  </div>
                  <div className="text-right">
                    <h4 className="text-lg font-bold text-slate-950">COMMERCIAL TAX INVOICE</h4>
                    <p className="text-slate-455 font-mono text-[9px]">{selectedInvoice.invoiceNumber}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-bold text-slate-800">Billed Accounts:</h5>
                    <p className="text-slate-600 leading-relaxed">VendorBridge Sube Floor, Plano Texas</p>
                  </div>
                  <div className="text-right">
                    <h5 className="font-bold text-slate-800">Sourced supplier:</h5>
                    <p className="text-slate-600 leading-relaxed">{vendors.find(v => v.id === purchaseOrders.find(p => p.poNumber === selectedInvoice.poNumber)?.vendorId)?.name || 'Supply Partner'}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded border border-slate-220 text-center font-mono text-[10px] grid grid-cols-3 text-slate-505 font-bold">
                  <div>Date: {new Date(selectedInvoice.invoiceDate).toLocaleDateString()}</div>
                  <div>Directives: {selectedInvoice.paymentTerms}</div>
                  <div>Remit total: <strong>{formatINR(selectedInvoice.grandTotal)}</strong></div>
                </div>

                <p className="text-[10px] text-slate-400 italic text-center font-sans">Corporate electronic record. Signature not required under safe-harbor standards.</p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
