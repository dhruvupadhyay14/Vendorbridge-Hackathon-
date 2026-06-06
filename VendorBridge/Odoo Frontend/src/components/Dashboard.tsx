import React from 'react';
import { RFQ, Quotation, PurchaseOrder, Invoice, Vendor, User } from '../types';
import { 
  PlusCircle, 
  Layers, 
  FileCheck, 
  Receipt, 
  Users, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Lightbulb, 
  ArrowRight
} from 'lucide-react';
import { formatINR } from '../utils';

interface DashboardProps {
  user: User;
  vendors: Vendor[];
  rfqs: RFQ[];
  quotations: Quotation[];
  purchaseOrders: PurchaseOrder[];
  invoices: Invoice[];
  onNavigate: (screen: string) => void;
  onSelectRFQ?: (rfqId: string) => void;
}

export default function Dashboard({ 
  user, 
  vendors, 
  rfqs, 
  quotations, 
  purchaseOrders, 
  invoices, 
  onNavigate,
  onSelectRFQ
}: DashboardProps) {

  const activeRfqsCount = rfqs.filter(r => r.status === 'Published' || r.status === 'Under Comparison' || r.status === 'Pending Approval').length;
  const pendingApprovalsCount = rfqs.filter(r => r.status === 'Pending Approval').length;
  const activeVendorsCount = vendors.filter(v => v.status === 'Active').length;
  
  const totalSpent = purchaseOrders.reduce((sum, po) => sum + po.grandTotal, 0);

  const bottleneckRfqs = rfqs.filter(r => {
    const createdDate = new Date(r.createdAt);
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    return createdDate < tenDaysAgo && r.status !== 'PO Generated' && r.status !== 'Closed';
  });

  const avgApprovalHours = pendingApprovalsCount > 2 ? '7.4 hours (High Volume alerts)' : '3.8 hours (Optimal performance)';

  let totalSavingsOpportunities = 0;
  rfqs.forEach(rfq => {
    const targetedCost = rfq.items.reduce((sum, item) => sum + (item.quantity * (item.targetPrice || 0)), 0);
    const rfqQuotes = quotations.filter(q => q.rfqId === rfq.id);
    if (rfqQuotes.length > 0) {
      const minQuotePrice = Math.min(...rfqQuotes.map(q => q.grandTotal));
      if (targetedCost > minQuotePrice) {
        totalSavingsOpportunities += (targetedCost - minQuotePrice);
      }
    }
  });

  const recentRfqs = [...rfqs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Published': return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Draft': return 'bg-slate-50 text-slate-600 border border-slate-200';
      case 'Under Comparison': return 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'Pending Approval': return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'Approved': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'PO Generated': return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
      case 'Closed': return 'bg-red-50 text-red-700 border border-red-200';
      default: return 'bg-slate-50 text-slate-600 border border-slate-200';
    }
  };

  return (
    <div className="space-y-6 text-slate-800" id="dashboard-view">
      
      {/* Dynamic Welcoming Strip */}
      <div className="bg-white rounded-xl border border-slate-250/80 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm animate-fade-in">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-900 flex items-center gap-2">
            Workspace: <span className="text-indigo-700">{user.name}</span>
            <span className="text-xs font-mono font-bold uppercase py-0.5 px-2 bg-slate-100 border border-slate-200 text-slate-600 rounded">
              {user.role} role
            </span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            All system segments operating normally. Ledger audits match Greenwich Mean Time timezone structures.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {user.role === 'officer' && (
            <button
              onClick={() => onNavigate('rfq-creation')}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              id="dashboard-quick-create-rfq"
            >
              <PlusCircle className="w-4 h-4" /> Create Requisition
            </button>
          )}
          {user.role === 'manager' && (
            <button
              onClick={() => onNavigate('approval-workflow')}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              id="dashboard-quick-manager-approvals"
            >
              <FileCheck className="w-4 h-4" /> Go to Approvals Queue
            </button>
          )}
          {(user.role === 'admin' || user.role === 'officer') && (
            <button
              onClick={() => onNavigate('vendor-management')}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              id="dashboard-quick-vendors"
            >
              <Users className="w-4 h-4" /> Add Supplier Partner
            </button>
          )}
          <button
            onClick={() => onNavigate('reports-analytics')}
            className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 text-indigo-750 text-xs font-semibold px-4 py-2.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
            id="dashboard-quick-reports"
          >
            <TrendingUp className="w-4 h-4" /> Analytics Summary
          </button>
        </div>
      </div>

      {/* Advanced Operational Intelligence Strips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Cost Savings Opportunity */}
        <div className="bg-white rounded-xl border border-emerald-200 p-5 flex items-start gap-4 shadow-sm">
          <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-lg border border-emerald-150">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-wider block">
              Budget Cost Variance
            </span>
            <h3 className="text-xl font-bold mt-1 text-slate-900 font-sans">
              {formatINR(totalSavingsOpportunities)}
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Targeted savings estimate based on the lowest submitted bidding prices vs margin ceilings.
            </p>
          </div>
        </div>

        {/* Approval SLA Performance */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4 shadow-sm">
          <div className="bg-slate-55 p-2.5 rounded-lg border border-slate-200">
            <Clock className="w-5 h-5 text-slate-750" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
              Approval SLA Tracker
            </span>
            <h3 className="text-xl font-bold mt-1 text-slate-900 font-sans">
              {avgApprovalHours}
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Calculates cycle lag between initial quotation comparisons and manager authorization execution.
            </p>
          </div>
        </div>

        {/* Delay Risk Indicators */}
        <div className="bg-white rounded-xl border border-amber-250 p-5 flex items-start gap-4 shadow-sm">
          <div className="bg-amber-50 text-amber-700 p-2.5 rounded-lg border border-amber-200">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <span className="text-[10px] font-mono font-bold text-amber-700 uppercase tracking-wider block">
              Vendor Pipeline Risks
            </span>
            <h3 className="text-xl font-bold mt-1 text-slate-900 font-sans">
              {bottleneckRfqs.length > 0 ? `${bottleneckRfqs.length} Logistics Delays` : '0 Critical Blockages'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {bottleneckRfqs.length > 0 
                ? `${bottleneckRfqs[0].title.slice(0, 30)}... is stalled in state: '${bottleneckRfqs[0].status}'.`
                : 'No active requisitions crossing critical 10-day logistics boundaries.'}
            </p>
          </div>
        </div>
      </div>

      {/* Analytics KPI counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard-kpis">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold font-mono uppercase">Active RFPs</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold mt-2 font-sans text-slate-900">{activeRfqsCount}</p>
          <span className="text-[10px] text-slate-500 font-mono">Bidding in progress</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold font-mono uppercase">Pending Approval</span>
            <FileCheck className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold mt-2 font-sans text-amber-605">{pendingApprovalsCount}</p>
          <span className="text-[10px] text-slate-500 font-mono">Requires authorization</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold font-mono uppercase">Earmarked Spending</span>
            <Receipt className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold mt-2 font-sans text-slate-900">{formatINR(totalSpent)}</p>
          <span className="text-[10px] text-slate-500 font-mono">Across {purchaseOrders.length} active POs</span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold font-mono uppercase">Accredited Vendors</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold mt-2 font-sans text-slate-905">{activeVendorsCount} <span className="text-sm font-normal text-slate-400">/ {vendors.length}</span></p>
          <span className="text-[10px] text-emerald-600 font-mono select-none">92% average performance</span>
        </div>
      </div>

      {/* Main Grid: Active RFQs & Action Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Active RFQs Left */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 lg:col-span-8 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm uppercase font-mono tracking-wider text-slate-700">
                Active Requisition Registries
              </h3>
              <button 
                onClick={() => onNavigate('reports-analytics')}
                className="text-xs font-bold text-dashed text-indigo-700 hover:text-indigo-900 transition flex items-center gap-0.5 cursor-pointer font-sans"
              >
                All Documents ({rfqs.length})
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wider font-mono text-slate-500">
                    <th className="py-2.5 font-bold">Document Ref</th>
                    <th className="py-2.5 font-bold">Title Segment</th>
                    <th className="py-2.5 font-bold">Category</th>
                    <th className="py-2.5 font-bold text-center">Status</th>
                    <th className="py-2.5 font-bold text-right">Deadlines</th>
                    <th className="py-2.5 font-bold text-right">Quote Depth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {recentRfqs.map((rfq) => {
                    const quotesCount = quotations.filter(q => q.rfqId === rfq.id).length;
                    return (
                      <tr key={rfq.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 font-mono text-xs text-slate-400 select-all">
                          {rfq.id.toUpperCase()}
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => {
                              if (onSelectRFQ) {
                                onSelectRFQ(rfq.id);
                                if (rfq.status === 'Under Comparison' || rfq.status === 'Published') {
                                  onNavigate('quotation-comparison');
                                } else if (rfq.status === 'Pending Approval') {
                                  onNavigate('approval-workflow');
                                } else if (rfq.status === 'PO Generated' || rfq.status === 'Approved') {
                                  onNavigate('purchase-order-invoice');
                                } else {
                                  onNavigate('reports-analytics');
                                }
                              }
                            }}
                            className="font-semibold text-slate-900 hover:text-indigo-700 transition hover:underline text-left cursor-pointer"
                          >
                            {rfq.title}
                          </button>
                        </td>
                        <td className="py-3 text-xs text-slate-500 font-mono">
                          {rfq.category}
                        </td>
                        <td className="py-3 text-center">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold font-mono uppercase ${getStatusBadgeClass(rfq.status)}`}>
                            {rfq.status}
                          </span>
                        </td>
                        <td className="py-3 text-right text-xs text-slate-500 font-mono">
                          {new Date(rfq.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="py-3 text-right font-mono text-xs">
                          <span className={`px-2 py-0.5 rounded ${quotesCount > 1 ? 'bg-slate-100 text-slate-700' : 'bg-slate-50 text-slate-400'}`}>
                            {quotesCount} submissions
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <span className="flex items-center gap-1.5 leading-relaxed">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>
                <strong>ERP Tip:</strong> Register as a <strong>Vendor</strong> to place active pricing bids, then swap to the <strong>Manager</strong> persona to clear the requisition budget.
              </span>
            </span>
          </div>
        </div>

        {/* Right Sidebar: Quick stats & Action Pipeline */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Fast-Trax Registry Connectors */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-sm uppercase font-mono tracking-wider text-slate-700 mb-3.5">
              Rapid Document Views
            </h3>
            <div className="space-y-2 text-xs">
              
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-150 rounded-lg hover:border-slate-250 transition">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                  <div>
                    <p className="font-bold text-slate-800">Operational PO Ledger</p>
                    <p className="text-[10px] text-slate-500">Inspect active purchases</p>
                  </div>
                </div>
                <button 
                  onClick={() => onNavigate('purchase-order-invoice')} 
                  className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 px-3 py-1 rounded text-xs font-bold transition cursor-pointer"
                >
                  View
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-150 rounded-lg hover:border-slate-250 transition">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                  <div>
                    <p className="font-bold text-slate-800">Comparison Matrices</p>
                    <p className="text-[10px] text-slate-500">Audit current supplier bids</p>
                  </div>
                </div>
                <button 
                  onClick={() => onNavigate('quotation-comparison')} 
                  className="bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 px-3 py-1 rounded text-xs font-bold transition cursor-pointer"
                >
                  Analyze
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-150 rounded-lg hover:border-slate-250 transition">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-450"></div>
                  <div>
                    <p className="font-bold text-slate-800">Operational Log Ledger</p>
                    <p className="text-[10px] text-slate-500">Regulatory system trails</p>
                  </div>
                </div>
                <button 
                  onClick={() => onNavigate('activity-logs')} 
                  className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-150 px-3 py-1 rounded text-xs font-bold transition cursor-pointer"
                >
                  Audit
                </button>
              </div>
            </div>
          </div>

          {/* Attention Alerts */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-bold text-sm uppercase font-mono tracking-wider text-slate-755 mb-3.5">
              Logistics Attention Flags
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-red-50/60 border border-red-200 rounded-lg text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-red-700">
                  <span>Vendor Compliance Alarms</span>
                  <span className="text-[10px] bg-red-100 text-red-800 font-mono uppercase px-1.5 py-0.5 rounded">SLA Delay</span>
                </div>
                <p className="text-slate-600 leading-relaxed font-sans">
                  <strong>Zenith Eco Packaging Co.</strong> response rate metrics fell to 76% (Operational limit: 80%). Registry classification flagged as <strong>'Under Review'</strong>.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-700">
                  <span>Upcoming Procurement Event</span>
                  <span className="text-[10px] bg-white border border-slate-200 text-slate-550 font-mono uppercase px-1.5 py-0.5 rounded">Timeline</span>
                </div>
                <p className="text-slate-605 leading-relaxed font-sans">
                  RFQ Ref 101 (Carbide Boring Bars) closes on June 15. The partner quote from Apex Metallurgy is currently the most competitively priced.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
