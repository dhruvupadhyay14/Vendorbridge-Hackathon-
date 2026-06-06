import React, { useState, useEffect } from 'react';
import { RFQ, Quotation, Vendor, User } from '../types';
import { 
  BarChart4, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  AlertTriangle 
} from 'lucide-react';
import { formatINR } from '../utils';

interface QuotationComparisonProps {
  user: User;
  vendors: Vendor[];
  rfqs: RFQ[];
  quotations: Quotation[];
  onInitiateApproval: (rfqId: string, qId: string, details: {
    priceScore: number;
    reliabilityScore: number;
    bottleneckScore: number;
    savingsCalculated: number;
    cycleTimeDays: number;
  }, comments: string) => void;
  selectedRFQId?: string;
  onSelectRFQ?: (rfqId: string) => void;
}

export default function QuotationComparison({ 
  user, 
  vendors, 
  rfqs, 
  quotations, 
  onInitiateApproval,
  selectedRFQId,
  onSelectRFQ
}: QuotationComparisonProps) {

  const availableRFQs = rfqs.filter(r => r.status !== 'Draft');

  const [activeRFQ, setActiveRFQ] = useState<RFQ | null>(null);
  const [remarks, setRemarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [errorFeedback, setErrorFeedback] = useState('');

  useEffect(() => {
    if (selectedRFQId) {
      const found = rfqs.find(r => r.id === selectedRFQId);
      if (found) setActiveRFQ(found);
    } else if (availableRFQs.length > 0 && !activeRFQ) {
      setActiveRFQ(availableRFQs[0]);
    }
  }, [selectedRFQId, rfqs]);

  // Quotations submitted for the actively selected RFQ
  const activeBids = quotations.filter(q => q.rfqId === activeRFQ?.id);

  // Sorting & Filtering of Bids
  const [sortBy, setSortBy] = useState<'price' | 'leadTime' | 'reliability'>('price');

  const getSortedBids = () => {
    return [...activeBids].sort((a, b) => {
      if (sortBy === 'price') {
        return a.grandTotal - b.grandTotal;
      } else if (sortBy === 'leadTime') {
        return a.leadTimeDays - b.leadTimeDays;
      } else {
        const vA = vendors.find(v => v.id === a.vendorId);
        const vB = vendors.find(v => v.id === b.vendorId);
        return (vB?.reliabilityScore || 0) - (vA?.reliabilityScore || 0);
      }
    });
  };

  const sortedBids = getSortedBids();

  // Find lowest price
  const lowestPrice = activeBids.length > 0 
    ? Math.min(...activeBids.map(b => b.grandTotal)) 
    : 0;

  // Find fastest delivery
  const fastestDelivery = activeBids.length > 0 
    ? Math.min(...activeBids.map(b => b.leadTimeDays)) 
    : 0;

  // Smart recommendation index matching
  const getSmartRecommendation = () => {
    if (activeBids.length === 0) return null;
    
    const weightedBids = activeBids.map(bid => {
      const vendor = vendors.find(v => v.id === bid.vendorId);
      const reliabilityScore = vendor?.reliabilityScore || 70;
      
      const maxPrice = Math.max(...activeBids.map(b => b.grandTotal));
      const minPrice = Math.min(...activeBids.map(b => b.grandTotal));
      const priceFactor = maxPrice === minPrice 
        ? 100 
        : 100 - (((bid.grandTotal - minPrice) / (maxPrice - minPrice)) * 60);

      const maxLead = Math.max(...activeBids.map(b => b.leadTimeDays));
      const minLead = Math.min(...activeBids.map(b => b.leadTimeDays));
      const leadFactor = maxLead === minLead 
        ? 100 
        : 100 - (((bid.leadTimeDays - minLead) / (maxLead - minLead)) * 50);

      const compositeScore = (reliabilityScore * 0.45) + (priceFactor * 0.40) + (leadFactor * 0.15);

      return {
        bid,
        score: compositeScore,
        priceUtility: priceFactor,
        reliability: reliabilityScore,
        leadTime: bid.leadTimeDays,
        vendorName: bid.vendorName,
      };
    });

    const recommended = weightedBids.sort((a, b) => b.score - a.score)[0];
    
    const targetPrice = activeRFQ?.items.reduce((sum, item) => sum + (item.quantity * (item.targetPrice || 0)), 0) || 0;
    const savingsCalculated = targetPrice > recommended.bid.grandTotal ? targetPrice - recommended.bid.grandTotal : 0;

    return {
      ...recommended,
      savingsCalculated
    };
  };

  const recommendation = getSmartRecommendation();

  const handleSubmitForApproval = (quotationId: string) => {
    if (!activeRFQ) return;
    
    setErrorFeedback('');
    setFeedback('');

    if (!remarks.trim() || remarks.trim().length < 10) {
      setErrorFeedback('Validation Error: Regulatory compliance mandates providing at least 10 characters of sourcing justification remarks before dispatching this selection.');
      return;
    }
    
    const bid = activeBids.find(q => q.id === quotationId);
    if (!bid) return;

    const vendor = vendors.find(v => v.id === bid.vendorId);

    const priceScore = Math.round((lowestPrice / bid.grandTotal) * 100);
    const reliabilityScore = vendor?.reliabilityScore || 80;
    
    const bottleneckScore = Math.max(0, 100 - (bid.leadTimeDays * 3) - ((vendor?.pendingTasksCount || 0) * 10));

    const targetPrice = activeRFQ.items.reduce((sum, item) => sum + (item.quantity * (item.targetPrice || 0)), 0);
    const savingsCalculated = targetPrice > bid.grandTotal ? targetPrice - bid.grandTotal : 0;

    onInitiateApproval(
      activeRFQ.id, 
      quotationId, 
      {
        priceScore,
        reliabilityScore,
        bottleneckScore,
        savingsCalculated,
        cycleTimeDays: bid.leadTimeDays
      },
      remarks
    );

    setFeedback('Success! Requisition was verified and forwarded to Manager approvals queue.');
    setRemarks('');
    setErrorFeedback('');

    setTimeout(() => {
      setFeedback('');
    }, 2000);
  };

  return (
    <div className="space-y-6 text-slate-800" id="quotation-comparison-view">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-slate-900">Bid Evaluation Comparison Ledger</h2>
          <p className="text-sm text-slate-500 mt-1">
            Analyze pricing benchmarks, target lead margins, and auto-recommend supply awards.
          </p>
        </div>

        {/* Selected RFQ Dropdown Selector */}
        <div>
          <select
            value={activeRFQ?.id || ''}
            onChange={(e) => {
              const found = rfqs.find(r => r.id === e.target.value);
              if (found) {
                setActiveRFQ(found);
                setRemarks('');
                if (onSelectRFQ) onSelectRFQ(found.id);
              }
            }}
            className="px-4 py-2.5 bg-white border border-slate-250 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer max-w-xs shadow-sm"
            id="comparison-rfq-selector"
          >
            {availableRFQs.map(r => (
              <option key={r.id} value={r.id}>
                {r.id.toUpperCase()}: {r.title.slice(0, 30)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {feedback && (
        <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 p-4 rounded-lg flex items-center gap-3 font-semibold text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          {feedback}
        </div>
      )}

      {errorFeedback && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-center gap-3 font-semibold text-sm animate-pulse">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          {errorFeedback}
        </div>
      )}

      {activeRFQ ? (
        <div className="space-y-6">
          
          {/* Active RFQ Metadata Summary Board */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 grid grid-cols-1 md:grid-cols-4 gap-6 shadow-sm">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block">Acquisition Reference</span>
              <p className="text-sm font-bold text-slate-900 leading-snug">{activeRFQ.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">{activeRFQ.category}</p>
            </div>
            
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block">Budget Margin Ceiling</span>
              <p className="text-sm font-bold text-slate-900 font-mono">
                {formatINR(activeRFQ.items.reduce((sum, i) => sum + (i.quantity * (i.targetPrice || 0)), 0))}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{activeRFQ.items.length} line counts itemized</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block">Current Procurement State</span>
              <div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase border bg-slate-100 text-slate-700 border-slate-250`}>
                  {activeRFQ.status}
                </span>
              </div>
              <p className="text-xs text-slate-550 mt-1">Closes: {new Date(activeRFQ.deadline).toLocaleDateString()}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block">Side-by-Side Sorters</span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => setSortBy('price')}
                  className={`px-2.5 py-1.5 rounded text-[10px] font-bold border transition cursor-pointer ${sortBy === 'price' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-800'}`}
                >
                  By Cost
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('leadTime')}
                  className={`px-2.5 py-1.5 rounded text-[10px] font-bold border transition cursor-pointer ${sortBy === 'leadTime' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-800'}`}
                >
                  By Lead Time
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('reliability')}
                  className={`px-2.5 py-1.5 rounded text-[10px] font-bold border transition cursor-pointer ${sortBy === 'reliability' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-800'}`}
                >
                  By SLA Score
                </button>
              </div>
            </div>
          </div>

          {/* Sourcing Recommendation Index */}
          {recommendation && (
            <div className="bg-slate-50 rounded-xl border border-indigo-100 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm animate-fade-in">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="bg-indigo-100 text-indigo-700 p-1.5 rounded-lg border border-indigo-200">
                    <Sparkles className="w-4 h-4 text-indigo-700" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-indigo-805 block">
                      Automated Supplier Fit Recommendation
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      Primary Partner Candidate: <span className="text-indigo-850 font-bold">{recommendation.vendorName}</span>
                    </h3>
                  </div>
                </div>
                
                <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                  Compliance scorecard balances a perfect <strong>{recommendation.reliability}% SLA reliability index</strong> with a <strong>{recommendation.leadTime}-day lead response limit</strong>. This pairing creates a budget margin surplus of <strong>{formatINR(recommendation.savingsCalculated)}</strong> compared to our ceiling parameters.
                </p>
              </div>

              <div className="bg-white p-4 border border-slate-220 rounded-lg space-y-1.5 font-mono text-xs text-right min-w-[200px] shadow-sm">
                <div>Fit Score Match: <span className="text-indigo-700 font-bold">{recommendation.score.toFixed(1)} / 100</span></div>
                <div>Bid Total Quote: <span className="text-slate-705 font-bold">{formatINR(recommendation.bid.grandTotal)}</span></div>
                {user.role === 'officer' && activeRFQ.status === 'Under Comparison' && (
                  <button
                    onClick={() => handleSubmitForApproval(recommendation.bid.id)}
                    className="mt-2.5 w-full bg-slate-900 hover:bg-slate-800 text-[10px] uppercase font-bold text-white py-1.5 rounded transition flex items-center justify-center gap-1 cursor-pointer font-mono"
                    id="recommendation-quick-forward-btn"
                  >
                    Lock & Forward <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Side by side bids view */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="compare-bids-cards">
            {sortedBids.length > 0 ? (
              sortedBids.map((bid) => {
                const vendorModel = vendors.find(v => v.id === bid.vendorId);
                const isLowestPrice = bid.grandTotal === lowestPrice;
                const isFastestTime = bid.leadTimeDays === fastestDelivery;
                
                return (
                  <div 
                    key={bid.id} 
                    className={`bg-white rounded-xl border p-5 space-y-4 relative transition shadow-sm ${
                      isLowestPrice 
                        ? 'border-emerald-300 bg-emerald-50/10' 
                        : 'border-slate-205 hover:border-slate-300'
                    }`}
                    id={`compare-card-${bid.id}`}
                  >
                    {/* Badge flags */}
                    <div className="flex gap-1 absolute top-3 right-4">
                      {isLowestPrice && (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-semibold uppercase font-mono px-1.5 py-0.5 rounded">
                          Cost Leader
                        </span>
                      )}
                      {isFastestTime && (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-semibold uppercase font-mono px-1.5 py-0.5 rounded">
                          SLA Fast Ship
                        </span>
                      )}
                    </div>

                    {/* Vendor Bio */}
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block">
                        Bid Ref: {bid.id.toUpperCase()}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-1 leading-snug">{bid.vendorName}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Submitted: {new Date(bid.submittedAt).toLocaleDateString()}</p>
                    </div>

                    {/* Historical statistics snippet */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 space-y-1 text-xs font-mono text-slate-500">
                      <div className="flex justify-between">
                        <span>Quality Rating:</span>
                        <span className="text-slate-800 font-bold">
                          {vendorModel?.rating || '4.0'} / 5.0
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reliability Score:</span>
                        <span className="text-emerald-700 font-bold">{vendorModel?.reliabilityScore}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lead Guarantee:</span>
                        <span className="text-slate-800 font-bold">{bid.leadTimeDays} days</span>
                      </div>
                    </div>

                    {/* Bid items specific pricing breakdown list */}
                    <div className="space-y-2">
                      <h5 className="text-[10px] font-bold font-mono text-slate-505 uppercase tracking-wider">Line Pricing</h5>
                      <div className="space-y-1.5 text-xs text-slate-650">
                        {bid.items.map((bitem) => (
                          <div key={bitem.itemId} className="flex justify-between items-start gap-2 max-w-full">
                            <span className="line-clamp-1">{bitem.name}:</span>
                            <span className="font-mono font-bold text-slate-800">{formatINR(bitem.unitPrice)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Document value calculations */}
                    <div className="pt-3 border-t border-slate-100 space-y-1 text-xs font-mono text-slate-500">
                      <div className="flex justify-between">
                        <span>Product Subtotal:</span>
                        <span>{formatINR(bid.grandTotal - bid.shippingCost - (bid.grandTotal * (bid.taxRate / 100)))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Logistics & Taxes:</span>
                        <span>{formatINR(bid.shippingCost)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-1.5 font-sans">
                        <span>Total Bid Value:</span>
                        <span className="text-indigo-850 font-mono text-sm">{formatINR(bid.grandTotal)}</span>
                      </div>
                    </div>

                    {/* Extra Uniqueness Benefit */}
                    {bid.uniquenessBenefit && (
                      <div className="bg-indigo-50 border border-indigo-150 p-2 rounded text-[10px] text-indigo-900 font-medium">
                        Advantage: {bid.uniquenessBenefit}
                      </div>
                    )}

                    {bid.notes && (
                      <div className="text-[11px] text-slate-500 leading-normal pl-2 border-l-2 border-slate-350 italic">
                        "{bid.notes}"
                      </div>
                    )}

                    {/* Operational controls */}
                    {user.role === 'officer' && activeRFQ.status === 'Published' && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => handleSubmitForApproval(bid.id)}
                          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white rounded-lg shadow-sm transition cursor-pointer text-center font-mono uppercase tracking-wider"
                          id={`select-bid-btn-${bid.id}`}
                        >
                          Lock & Award Contract
                        </button>
                      </div>
                    )}

                  </div>
                );
              })
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-16 text-center col-span-3">
                <AlertTriangle className="w-12 h-12 text-rose-500/80 mx-auto mb-3" />
                <h4 className="font-bold text-slate-700 text-sm">No Supplier Proposals Found</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Accredited Supply partners have not submitted bidding sheets. Swap to a <strong>Vendor</strong> perspective on the sandbox header to place bids.
                </p>
              </div>
            )}
          </div>

          {/* Review Action Comments */}
          {user.role === 'officer' && activeRFQ.status === 'Published' && sortedBids.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-sm">
              <h4 className="font-bold text-xs uppercase font-mono tracking-wider text-slate-500">
                Audit Log Sourcing Justification Comments
              </h4>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Details of warranty terms, pricing clearances or SLA speed justifications that back this choice..."
                className="w-full px-4 py-2.5 bg-white border border-slate-220 rounded-lg text-xs text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:ring-1 focus:ring-slate-900 font-sans shadow-inner"
                id="review-remarks-textarea"
              />
              <p className="text-[10px] text-slate-500 leading-normal">
                Note: Standard corporate procurement rules require documenting choices for regulatory audits. Lock selections to dispatch files to authorized managers.
              </p>
            </div>
          )}

        </div>
      ) : (
        <div className="bg-slate-30 border border-slate-200 rounded-xl p-16 text-center select-none text-slate-500">
          <BarChart4 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h4 className="font-bold text-slate-700 text-sm">Awaiting RFP Dataset Selection</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Select a verified RFQ procurement docket from the dropdown selection box to evaluate side-by-side biddings.
          </p>
        </div>
      )}

    </div>
  );
}
