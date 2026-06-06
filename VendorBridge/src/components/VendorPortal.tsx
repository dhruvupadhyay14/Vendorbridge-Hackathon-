import React, { useState, useEffect } from 'react';
import { RFQ, Quotation, Vendor, User, QuotationItem } from '../types';
import { 
  Building2, 
  Layers, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  IndianRupee
} from 'lucide-react';
import { formatINR } from '../utils';

interface VendorPortalProps {
  user: User;
  vendors: Vendor[];
  rfqs: RFQ[];
  quotations: Quotation[];
  onSubmitQuotation: (quotation: Quotation) => void;
}

export default function VendorPortal({ user, vendors, rfqs, quotations, onSubmitQuotation }: VendorPortalProps) {
  const vendorId = user.vendorId || 'v1';
  const vendorProfile = vendors.find(v => v.id === vendorId);

  // Filter RFQs assigned to this specific vendor
  const assignedRFQs = rfqs.filter(r => r.assignedVendors.includes(vendorId));

  const [selectedRFQ, setSelectedRFQ] = useState<RFQ | null>(null);
  const [submittedQuotations, setSubmittedQuotations] = useState<Quotation[]>([]);

  // Bid form state
  const [itemBids, setItemBids] = useState<{ [itemId: string]: { unitPrice: number; compliance: boolean } }>({});
  const [leadTime, setLeadTime] = useState(10);
  const [shipping, setShipping] = useState(250);
  const [taxRate, setTaxRate] = useState(18);
  const [notes, setNotes] = useState('');
  const [uniqueness, setUniqueness] = useState('');
  const [formFeedback, setFormFeedback] = useState('');

  useEffect(() => {
    const quotes = quotations.filter(q => q.vendorId === vendorId);
    setSubmittedQuotations(quotes);
  }, [quotations, vendorId]);

  useEffect(() => {
    if (selectedRFQ) {
      const initialBids: typeof itemBids = {};
      selectedRFQ.items.forEach(item => {
        initialBids[item.id] = { 
          unitPrice: item.targetPrice || 100, 
          compliance: true 
        };
      });
      setItemBids(initialBids);
      
      const existing = quotations.find(q => q.rfqId === selectedRFQ.id && q.vendorId === vendorId);
      if (existing) {
        const loadedBids: typeof itemBids = {};
        existing.items.forEach(item => {
          loadedBids[item.itemId] = { unitPrice: item.unitPrice, compliance: item.compliance };
        });
        setItemBids(loadedBids);
        setLeadTime(existing.leadTimeDays);
        setShipping(existing.shippingCost);
        setTaxRate(existing.taxRate);
        setNotes(existing.notes);
        setUniqueness(existing.uniquenessBenefit || '');
      } else {
        setLeadTime(vendorProfile?.cycleTimeDays || 10);
        setShipping(200);
        setTaxRate(18);
        setNotes('');
        setUniqueness('');
      }
    }
  }, [selectedRFQ, quotations, vendorId, vendorProfile]);

  const handleBidPriceChange = (itemId: string, price: number) => {
    setItemBids({
      ...itemBids,
      [itemId]: { ...itemBids[itemId], unitPrice: price }
    });
  };

  const handleBidComplianceChange = (itemId: string, compliance: boolean) => {
    setItemBids({
      ...itemBids,
      [itemId]: { ...itemBids[itemId], compliance }
    });
  };

  const calculateTotals = () => {
    if (!selectedRFQ) return { subtotal: 0, taxAmount: 0, grandTotal: 0 };
    
    let subtotal = 0;
    selectedRFQ.items.forEach(item => {
      const bid = itemBids[item.id];
      const unitPrice = bid ? bid.unitPrice : 0;
      subtotal += item.quantity * unitPrice;
    });

    const taxAmount = subtotal * (taxRate / 100);
    const grandTotal = subtotal + taxAmount + shipping;

    return { subtotal, taxAmount, grandTotal };
  };

  const { subtotal, taxAmount, grandTotal } = calculateTotals();

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRFQ) return;
    setFormFeedback('');

    // Input range check validations
    const errors: string[] = [];
    selectedRFQ.items.forEach(item => {
      const bid = itemBids[item.id];
      if (!bid || bid.unitPrice <= 0 || isNaN(bid.unitPrice)) {
        errors.push(`Please enter a valid unit price for "${item.name}" (must be greater than ₹0).`);
      }
    });

    if (leadTime < 1 || isNaN(leadTime)) {
      errors.push('Guaranteed lead time must be at least 1 calendar day.');
    }
    if (shipping < 0 || isNaN(shipping)) {
      errors.push('Freight carrier transport fee cannot be negative.');
    }
    if (taxRate < 0 || isNaN(taxRate)) {
      errors.push('Tax rate cannot be negative.');
    }

    if (errors.length > 0) {
      setFormFeedback(`Validation Error: ${errors[0]}`);
      return;
    }

    const submissionItems: QuotationItem[] = selectedRFQ.items.map(item => {
      const bid = itemBids[item.id];
      const unitPrice = bid ? bid.unitPrice : 0;
      return {
        itemId: item.id,
        name: item.name,
        unitPrice: unitPrice,
        totalPrice: item.quantity * unitPrice,
        compliance: bid ? bid.compliance : true
      };
    });

    const quote: Quotation = {
      id: 'q_' + selectedRFQ.id + '_' + vendorId,
      rfqId: selectedRFQ.id,
      vendorId: vendorId,
      vendorName: vendorProfile?.name || 'Authorized Supplier Partner',
      submittedAt: new Date().toISOString(),
      items: submissionItems,
      leadTimeDays: leadTime,
      notes: notes,
      status: 'Submitted',
      taxRate: taxRate,
      shippingCost: shipping,
      grandTotal: grandTotal,
      uniquenessBenefit: uniqueness || undefined
    };

    onSubmitQuotation(quote);
    setFormFeedback('Succeeded! Quotation dispatched in compliance with your vendor agreement.');
    
    setTimeout(() => {
      setFormFeedback('');
      setSelectedRFQ(null);
    }, 1500);
  };

  return (
    <div className="space-y-6 text-slate-800" id="vendor-portal-view">
      
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div>
          <span className="text-[10px] font-mono uppercase bg-slate-100 border border-slate-220 px-2 py-0.5 rounded text-slate-600 font-bold block w-fit">
            Portal Environment: Secure Supplier Gateway
          </span>
          <h2 className="text-xl font-bold font-sans mt-2.5 flex items-center gap-2 text-slate-900">
            <Building2 className="w-5 h-5 text-slate-700" /> {vendorProfile?.name || 'Authorized Corporate Supplier'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Registered Category: <strong className="text-slate-700">{vendorProfile?.category}</strong> • GST Registration ID: <strong className="text-slate-700 font-mono">{vendorProfile?.gstNumber}</strong>
          </p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-right font-mono text-xs text-slate-500 shrink-0 shadow-inner">
          <div>Reliability SLA Score: <span className="text-emerald-700 font-bold">{vendorProfile?.reliabilityScore}%</span></div>
          <div className="mt-0.5">Response SLA Status: <span className="text-indigo-750 font-bold">{vendorProfile?.responseRate}%</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
        
        {/* Left Side: Assigned RFQs List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <h3 className="font-bold text-xs uppercase font-mono tracking-wider text-slate-500 mb-3 block">
              RFQ Incoming Feed
            </h3>

            <div className="space-y-2">
              {assignedRFQs.length > 0 ? (
                assignedRFQs.map((rfq) => {
                  const existingQuote = submittedQuotations.find(q => q.rfqId === rfq.id);
                  const isSelected = selectedRFQ?.id === rfq.id;
                  
                  return (
                    <button
                      key={rfq.id}
                      onClick={() => { setSelectedRFQ(rfq); setFormFeedback(''); }}
                      className={`w-full text-left p-3.5 border rounded-lg transition flex flex-col justify-between cursor-pointer ${
                        isSelected 
                          ? 'border-indigo-650 bg-indigo-50/60 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                      id={`vendor-rfq-card-${rfq.id}`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold font-mono text-slate-400">
                            {rfq.id.toUpperCase()}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                            existingQuote ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {existingQuote ? 'Quoted' : 'Awaiting Bid'}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                          {rfq.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 line-clamp-2">
                          {rfq.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-3 pt-2 border-t border-slate-100">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" /> Closes: {new Date(rfq.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        {existingQuote && (
                          <span className="text-emerald-700 font-bold">
                            {formatINR(existingQuote.grandTotal)}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="bg-slate-50 p-4 border border-slate-200 text-center text-slate-500 rounded-lg text-xs font-medium">
                  <AlertCircle className="w-8 h-8 text-slate-404 mx-auto mb-2" />
                  No RFQs currently assigned to category.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Active Bid Worksheet Form */}
        <div className="lg:col-span-8">
          {selectedRFQ ? (
            <form onSubmit={handleFormSubmit} className="bg-white rounded-xl border border-indigo-150 p-5 space-y-4 shadow-sm" id="vendor-bid-sheet">
              
              {/* Bid form Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-sm uppercase font-mono tracking-wider text-slate-800">
                    Pricing Proposal Worksheet
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Original Requester: <strong>{selectedRFQ.createdBy}</strong> • Category: <strong>{selectedRFQ.category}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRFQ(null)}
                  className="px-3 py-1 bg-slate-100 text-slate-600 hover:text-slate-805 rounded border border-slate-200 text-xs font-semibold cursor-pointer transition"
                  id="close-bid-sheet-btn"
                >
                  Close Proposal
                </button>
              </div>

              {formFeedback && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {formFeedback}
                </div>
              )}

              {/* Specifications panel */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
                <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Original Acquisition Description</span>
                <p className="text-slate-700 leading-normal">{selectedRFQ.description}</p>
                {selectedRFQ.attachmentName && (
                  <div className="pt-2">
                    <span className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded inline-flex items-center gap-1 font-mono">
                      Attached File: {selectedRFQ.attachmentName}
                    </span>
                  </div>
                )}
              </div>

              {/* Item Lines inputs */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold font-mono uppercase text-slate-500 tracking-wider">
                  Price Breakdown Declarations
                </h4>

                <div className="space-y-2.5">
                  {selectedRFQ.items.map((item, index) => {
                    const bid = itemBids[item.id] || { unitPrice: 0, compliance: true };
                    return (
                      <div key={item.id} className="bg-slate-50/50 p-4 rounded-lg border border-slate-200 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                          <div>
                            <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">Item Line #{index + 1}</span>
                            <h5 className="text-xs font-bold text-slate-905">{item.name}</h5>
                            {item.description && <p className="text-[10px] text-slate-500">{item.description}</p>}
                          </div>
                          <div className="text-right text-xs font-mono font-medium">
                            <span className="text-slate-400 font-sans">Target Benchmark: </span>
                            <span className="text-indigo-900 font-bold">{formatINR(item.targetPrice || 0)} / {item.unit}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs pt-2.5 border-t border-slate-100">
                          <div className="md:col-span-3">
                            <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">Target Volume</label>
                            <div className="py-2 px-3 bg-slate-100 border border-slate-200 text-slate-600 text-xs rounded-lg font-mono">
                              {item.quantity} {item.unit}
                            </div>
                          </div>

                          <div className="md:col-span-5 relative">
                            <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">Your Corporate Bid (₹)</label>
                            <div className="relative">
                              <IndianRupee className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                              <input
                                type="number"
                                required
                                min="0.01"
                                step="0.01"
                                value={bid.unitPrice}
                                onChange={(e) => handleBidPriceChange(item.id, parseFloat(e.target.value) || 0)}
                                className="w-full pl-8 pr-3 py-2 bg-white border border-slate-220 text-slate-900 rounded-lg text-xs font-mono focus:ring-1 focus:ring-slate-900 focus:outline-none"
                                id={`bid-item-price-${item.id}`}
                              />
                            </div>
                          </div>

                          <div className="md:col-span-4 flex items-center justify-end">
                            <label className="flex items-center gap-2 cursor-pointer mt-4">
                              <input
                                type="checkbox"
                                checked={bid.compliance}
                                onChange={(e) => handleBidComplianceChange(item.id, e.target.checked)}
                                className="h-4 w-4 bg-white border-slate-250 text-indigo-700 rounded cursor-pointer"
                                id={`bid-item-compliance-${item.id}`}
                              />
                              <span className="text-[11px] text-slate-600 font-medium select-none">
                                Technical compliance verified
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Lead Time & Taxes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-4 text-xs font-sans">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">Guaranteed Lead Time</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={leadTime}
                    onChange={(e) => setLeadTime(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-220 text-slate-900 rounded-lg font-mono focus:ring-1 focus:ring-slate-900 focus:outline-none"
                    id="bid-lead-time-input"
                  />
                  <span className="text-[9px] text-slate-400 mt-1 block">In calendar days</span>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">Freight Transport Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={shipping}
                    onChange={(e) => setShipping(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-220 text-slate-900 rounded-lg font-mono focus:ring-1 focus:ring-slate-900 focus:outline-none"
                    id="bid-shipping-input"
                  />
                  <span className="text-[9px] text-slate-400 mt-1 block">Logistics/Freight handling charge</span>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">Tax / Surcharge Bracket</label>
                  <select
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseInt(e.target.value) || 18)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-220 text-slate-800 rounded-lg font-mono cursor-pointer focus:outline-none"
                    id="bid-tax-rate-select"
                  >
                    <option value="5">5% GST (Standard)</option>
                    <option value="12">12% GST (Industrial supplies)</option>
                    <option value="18">18% GST (IT & Machinery)</option>
                    <option value="20">20% VAT (European machinery)</option>
                  </select>
                </div>
              </div>

              {/* Notes & Custom Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">Warranty Details & Terms</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Specify service level guarantees, bulk discount options, or warehousing constraints..."
                    className="w-full px-3 py-2 bg-white border border-slate-220 text-slate-900 rounded-lg text-xs resize-none focus:outline-none focus:ring-1 focus:ring-slate-900 shadow-inner"
                    id="bid-notes-textarea"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-semibold mb-1">Differentiating Sourcing Advantage</label>
                  <textarea
                    rows={2}
                    value={uniqueness}
                    onChange={(e) => setUniqueness(e.target.value)}
                    placeholder="e.g. Extended SLA 5-year replacement parts, zero-carbon manufacturing certifications..."
                    className="w-full px-3 py-2 bg-white border border-slate-220 text-emerald-900 font-medium placeholder:text-slate-400 rounded-lg text-xs resize-none focus:outline-none focus:ring-1 focus:ring-slate-900 shadow-inner"
                    id="bid-uniqueness-textarea"
                  />
                  <span className="text-[9px] text-slate-400 mt-1 block">Highlight unique points to raise comparative selection score!</span>
                </div>
              </div>

              {/* Calculations list */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2 font-mono text-xs text-slate-500">
                <div className="flex justify-between">
                  <span>Product Lines Subtotal:</span>
                  <span className="text-slate-900 font-semibold">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Tax Bracket ({taxRate}%):</span>
                  <span className="text-slate-900 font-semibold">{formatINR(taxAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Freight Carrier Delivery:</span>
                  <span className="text-slate-900 font-semibold">{formatINR(shipping)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-2 font-sans">
                  <span>Authorized Bid Grand Total:</span>
                  <span className="text-indigo-850 font-mono text-sm">{formatINR(grandTotal)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedRFQ(null)}
                  className="px-4 py-2 border border-slate-205 text-slate-550 hover:text-slate-800 rounded-lg hover:bg-slate-50 transition cursor-pointer font-bold"
                  id="cancel-bid-submit"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-slate-900 hover:bg-slate-800 font-bold text-white rounded-lg transition cursor-pointer shadow-sm uppercase tracking-wider"
                  id="submit-bid-btn"
                >
                  Confirm Compliance Dispatch
                </button>
              </div>

            </form>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-16 text-center text-slate-400">
              <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-700 text-sm">Bid Response Desktop</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Review assigned RFQs on the left checklist inboxes. Click any document to generate legal pricing structures.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
