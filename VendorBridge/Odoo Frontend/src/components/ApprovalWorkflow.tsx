import React, { useState } from 'react';
import { RFQ, Quotation, Vendor, User } from '../types';
import { 
  ShieldCheck, 
  UserCheck, 
  CheckCircle, 
  XSquare, 
  Sparkles
} from 'lucide-react';
import { formatINR } from '../utils';

interface ApprovalWorkflowProps {
  user: User;
  vendors: Vendor[];
  rfqs: RFQ[];
  quotations: Quotation[];
  onApproveRFQ: (rfqId: string, remarks: string, reviewedBy: string) => void;
  onRejectRFQ: (rfqId: string, remarks: string, reviewedBy: string) => void;
}

export default function ApprovalWorkflow({ 
  user, 
  vendors, 
  rfqs, 
  quotations, 
  onApproveRFQ, 
  onRejectRFQ 
}: ApprovalWorkflowProps) {
  
  const pendingRFQs = rfqs.filter(r => r.status === 'Pending Approval');

  const [selectedRFQ, setSelectedRFQ] = useState<RFQ | null>(pendingRFQs.length > 0 ? pendingRFQs[0] : null);
  const [managerRemarks, setManagerRemarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [errorFeedback, setErrorFeedback] = useState('');

  React.useEffect(() => {
    if (!selectedRFQ && pendingRFQs.length > 0) {
      setSelectedRFQ(pendingRFQs[0]);
    } else if (selectedRFQ && !pendingRFQs.find(r => r.id === selectedRFQ.id)) {
      setSelectedRFQ(pendingRFQs.length > 0 ? pendingRFQs[0] : null);
    }
  }, [pendingRFQs, selectedRFQ]);

  const rfqQuotations = selectedRFQ ? quotations.filter(q => q.rfqId === selectedRFQ.id) : [];
  const matchingQuote = rfqQuotations.find(q => q.status === 'Selected') || rfqQuotations[0];
  const vendorProfile = matchingQuote ? vendors.find(v => v.id === matchingQuote.vendorId) : null;

  const getApprovalSchema = () => {
    if (!selectedRFQ || !matchingQuote) return null;
    
    const targetPrice = selectedRFQ.items.reduce((sum, item) => sum + (item.quantity * (item.targetPrice || 0)), 0);
    const savingsCalculated = targetPrice > matchingQuote.grandTotal ? targetPrice - matchingQuote.grandTotal : 0;
    
    const priceScore = Math.round((matchingQuote.grandTotal / (targetPrice || 1)) * 100);
    const priceRating = Math.max(20, 100 - Math.max(0, priceScore - 100));
    
    const reliabilityScore = vendorProfile?.reliabilityScore || 85;
    const bottleneckScore = Math.max(10, 100 - (matchingQuote.leadTimeDays * 3) - ((vendorProfile?.pendingTasksCount || 0) * 12));

    return {
      priceScore: Math.round(priceRating),
      reliabilityScore,
      bottleneckScore,
      savingsCalculated,
      cycleTimeDays: matchingQuote.leadTimeDays
    };
  };

  const metrics = getApprovalSchema();

  const handleAction = (type: 'Approve' | 'Reject') => {
    if (!selectedRFQ) return;
    
    setErrorFeedback('');
    setFeedback('');

    if (!managerRemarks.trim() || managerRemarks.trim().length < 10) {
      setErrorFeedback('Validation Error: Regulatory policy requires providing at least 10 characters of compliance justifications in the comments box.');
      return;
    }

    if (type === 'Approve') {
      onApproveRFQ(selectedRFQ.id, managerRemarks, user.name);
      setFeedback(`Authorized! Requisition has been approved. Purchase order clearance is created.`);
    } else {
      onRejectRFQ(selectedRFQ.id, managerRemarks, user.name);
      setFeedback(`Rejected! Requisition returned to quotation evaluation status.`);
    }

    setManagerRemarks('');
    setSelectedRFQ(null);
    setErrorFeedback('');

    setTimeout(() => {
      setFeedback('');
    }, 2000);
  };

  return (
    <div className="space-y-6 text-slate-800" id="approval-queue-view">
      
      {/* Header Panel */}
      <div>
        <h2 className="text-xl font-bold font-sans tracking-tight text-slate-900">Executive Approvals Queue</h2>
        <p className="text-sm text-slate-500 mt-1">
          Review comparative pricing dockets, inspect supplier reliability metrics, and authorize capital expenditures.
        </p>
      </div>

      {feedback && (
        <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 p-4 rounded-lg flex items-center gap-3 font-semibold text-sm">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          {feedback}
        </div>
      )}

      {errorFeedback && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-center gap-3 font-semibold text-sm animate-pulse">
          <ShieldCheck className="w-5 h-5 text-red-650" />
          {errorFeedback}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
        
        {/* Left Side: Pending list */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-slate-205 p-4 shadow-sm">
            <h3 className="font-bold text-xs font-mono uppercase tracking-wider text-slate-500 mb-3 block">
              Pending Authorization Queue ({pendingRFQs.length})
            </h3>

            <div className="space-y-2">
              {pendingRFQs.length > 0 ? (
                pendingRFQs.map((rfq) => {
                  const rfqBids = quotations.filter(q => q.rfqId === rfq.id);
                  const selectedBid = rfqBids.find(q => q.status === 'Selected') || rfqBids[0];
                  
                  return (
                    <button
                      key={rfq.id}
                      onClick={() => { setSelectedRFQ(rfq); setManagerRemarks(''); }}
                      className={`w-full text-left p-3.5 border rounded-lg transition flex flex-col justify-between cursor-pointer ${
                        selectedRFQ?.id === rfq.id 
                          ? 'border-indigo-650 bg-indigo-50/60 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                      id={`approval-rfq-card-${rfq.id}`}
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          ID: {rfq.id.toUpperCase()}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1 mt-1.5">
                          {rfq.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                          Category: {rfq.category}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mt-3 pt-2 border-t border-slate-100">
                        <span>Lead Quote Value:</span>
                        {selectedBid ? (
                          <span className="text-indigo-805 font-bold">{formatINR(selectedBid.grandTotal)}</span>
                        ) : (
                          <span className="text-red-700 font-bold">No Bid Selected</span>
                        )}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="bg-slate-50 p-5 border border-slate-200 text-center text-slate-500 rounded-lg text-xs space-y-1">
                  <UserCheck className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="font-bold text-slate-700">Queue Cleared</p>
                  <p className="text-slate-500 text-[11px]">All submitted procurement requisitions are cleared.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Detailed Review Panel */}
        <div className="lg:col-span-8">
          {selectedRFQ && matchingQuote && metrics ? (
            <div className="bg-white rounded-xl border border-indigo-150 p-5 space-y-5 shadow-sm" id="approval-workdesk">
              
              {/* Card headers */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                <div>
                  <h3 className="font-bold text-sm uppercase font-mono tracking-wider text-slate-800">
                    Requisition Sourcing Dossier
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Requester Officer: <strong>{selectedRFQ.createdBy}</strong> • Category: {selectedRFQ.category}
                  </p>
                </div>
                <span className="bg-amber-50 text-amber-700 text-[10px] font-mono px-2.5 py-1 rounded border border-amber-200 uppercase font-bold tracking-wider self-start sm:self-center">
                  Awaiting Executive Clearance
                </span>
              </div>

              {/* Dynamic metrics scores panels */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center font-mono">
                
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Estimated Savings</p>
                  <p className="text-sm font-bold text-emerald-700 mt-1">
                    {formatINR(metrics.savingsCalculated)}
                  </p>
                  <p className="text-[9px] text-slate-500 font-sans mt-0.5">vs Target ceiling</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Cost Utility</p>
                  <p className="text-sm font-bold text-indigo-700 mt-1">
                    {metrics.priceScore}%
                  </p>
                  <p className="text-[9px] text-slate-500 font-sans mt-0.5">Market Competence</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Supplier SLA</p>
                  <p className="text-sm font-bold text-blue-700 mt-1">
                    {metrics.reliabilityScore}%
                  </p>
                  <p className="text-[9px] text-slate-500 font-sans mt-0.5">Fulfillment reliability</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Pipeline Lag</p>
                  <span className={`inline-block text-[10px] px-2 py-0.5 rounded mt-1 font-bold ${
                    metrics.bottleneckScore >= 80 ? 'bg-emerald-50 text-emerald-700 border border-emerald-250' :
                    metrics.bottleneckScore >= 60 ? 'bg-amber-50 text-amber-700 border border-amber-250' :
                    'bg-red-50 text-red-700 border border-red-250'
                  }`}>
                    {metrics.bottleneckScore >= 80 ? 'Low Delay' : metrics.bottleneckScore >= 60 ? 'Medium Risk' : 'Logistics Risk'}
                  </span>
                  <p className="text-[9px] text-slate-500 font-sans mt-0.5">Fulfillment duration</p>
                </div>

              </div>

              {/* Selected Quotation Brief */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 text-xs">
                
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-indigo-700 uppercase font-bold">Forwarded Pricing Proposal</span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">{matchingQuote.vendorName}</h4>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-[10px] text-slate-500 uppercase block font-sans font-semibold">Total Invoice Amount</span>
                    <strong className="text-base text-indigo-750 font-bold">{formatINR(matchingQuote.grandTotal)}</strong>
                  </div>
                </div>

                {/* Line Items breakdown list */}
                <div className="space-y-1.5 pt-2.5 border-t border-slate-200 max-w-full font-mono text-slate-600">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-1 font-sans">Requisition Lines items</span>
                  {matchingQuote.items.map(item => (
                    <div key={item.itemId} className="flex justify-between">
                      <span className="font-sans">{item.name} (Specs Match: <strong className="text-emerald-700">{item.compliance ? 'YES' : 'NO'}</strong>)</span>
                      <span>{formatINR(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>

                {matchingQuote.uniquenessBenefit && (
                  <div className="bg-emerald-50 border border-emerald-200 p-2 rounded text-emerald-805 font-mono text-[10px] flex items-center gap-1 font-sans">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" /> Sourcing advantage benefit: {matchingQuote.uniquenessBenefit}
                  </div>
                )}
              </div>

              {/* Approval interactive timeline tracking */}
              <div className="space-y-3 font-sans text-xs">
                <h4 className="text-xs font-bold font-mono uppercase text-slate-505 tracking-wider">
                  Requisition Sourcing Event Logs
                </h4>

                <div className="space-y-2 relative pl-4 border-l border-slate-200 text-slate-655">
                  <div className="absolute top-1 left-[-4.5px] w-2 h-2 bg-indigo-600 rounded-full"></div>
                  <div>
                    <strong className="text-slate-800">Draft Requisition Released</strong> - <span>Alex Carter (Procurement Officer)</span>
                    <p className="text-[10px] text-slate-500 font-mono">Date: {new Date(selectedRFQ.createdAt).toLocaleString()} • Dispatched to partners</p>
                  </div>

                  <div className="absolute top-[44px] left-[0px] w-2 h-2 bg-indigo-600 rounded-full"></div>
                  <div className="pt-2">
                    <strong className="text-slate-800">Supplier Proposal Signed</strong> - <span>{matchingQuote.vendorName}</span>
                    <p className="text-[10px] text-slate-500 font-mono font-medium">Date: {new Date(matchingQuote.submittedAt).toLocaleString()} • Technical metrics verified</p>
                  </div>

                  {selectedRFQ.approvalRemarks && (
                    <div className="pt-2 border-t border-slate-100 mt-2">
                      <p className="text-slate-700 font-semibold">Procurement Officer Comments:</p>
                      <p className="text-slate-600 text-[11px] leading-relaxed italic pl-2.5 border-l-2 border-slate-200 mt-0.5">
                        "{selectedRFQ.approvalRemarks}"
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Input for Manager Remarks */}
              {user.role === 'manager' ? (
                <div className="space-y-2.5 pt-4 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-550 uppercase tracking-wider font-mono">
                    Executive Sourcing Audit Justification
                  </label>
                  <textarea
                    rows={2.5}
                    required
                    value={managerRemarks}
                    onChange={(e) => setManagerRemarks(e.target.value)}
                    placeholder="Provide compliance comments, financial clearance parameters, or rejecting grounds..."
                    className="w-full px-4 py-2.5 bg-white border border-slate-220 rounded-lg text-xs text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:ring-1 focus:ring-slate-900 font-sans shadow-inner"
                    id="manager-remarks-textarea"
                  />
                  <p className="text-[10px] text-slate-500">
                    Signing off will authorize line items in compliance with our budget guidelines.
                  </p>

                  {/* Actions buttons */}
                  <div className="flex flex-wrap gap-2 justify-end pt-2 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => handleAction('Reject')}
                      className="px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-red-700 font-bold rounded-lg transition cursor-pointer flex items-center gap-1.5 uppercase font-mono tracking-wider"
                      id="reject-requisition-btn"
                    >
                      Reject and Return
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction('Approve')}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition cursor-pointer flex items-center gap-1.5 shadow-sm uppercase font-mono tracking-wider"
                      id="approve-requisition-btn"
                    >
                      Authorize & Release capital CO
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-red-50 border border-red-150 rounded text-xs text-red-700">
                  View-only credentials. Only <strong>Sophia Vance (System Manager)</strong> role is authorized to approve this capital expenditure. Switch role perspectives on the dashboard sandbox to sign.
                </div>
              )}

            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-16 text-center select-none text-slate-500 animate-fade-in">
              <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-705 text-sm">Approvals Queue Cleared</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No requisitions are currently awaiting executive clearance. Procurement offices must lock quotation bids before manager sign-off cycles can start.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
