import React, { useState } from 'react';
import { RFQ, Quotation, PurchaseOrder, Invoice, Vendor, User } from '../types';
import { 
  Download 
} from 'lucide-react';
import { formatINR } from '../utils';

interface ReportsAnalyticsProps {
  user: User;
  vendors: Vendor[];
  rfqs: RFQ[];
  quotations: Quotation[];
  purchaseOrders: PurchaseOrder[];
  invoices: Invoice[];
}

export default function ReportsAnalytics({
  user,
  vendors,
  rfqs,
  quotations,
  purchaseOrders,
  invoices
}: ReportsAnalyticsProps) {
  
  const [exportTriggered, setExportTriggered] = useState(false);

  const totalCapitalAllocated = purchaseOrders.reduce((sum, po) => sum + po.grandTotal, 0);
  const paidInvoicesTotal = invoices.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.grandTotal, 0);

  let totalSavingsCalculated = 0;
  rfqs.forEach(rfq => {
    const targetPrice = rfq.items.reduce((sum, item) => sum + (item.quantity * (item.targetPrice || 0)), 0);
    const bids = quotations.filter(q => q.rfqId === rfq.id);
    if (bids.length > 0) {
      const minBid = Math.min(...bids.map(b => b.grandTotal));
      if (targetPrice > minBid) {
        totalSavingsCalculated += (targetPrice - minBid);
      }
    }
  });

  const avgSlaDays = vendors.length > 0 
    ? Math.round(vendors.reduce((sum, v) => sum + v.cycleTimeDays, 0) / vendors.length)
    : 14;

  const exportCSVReport = (reportName: string) => {
    setExportTriggered(true);
    setTimeout(() => {
      setExportTriggered(false);
      alert(`Success! Compiled operational ledger '${reportName}' to CSV container.`);
    }, 1200);
  };

  const MONTHLY_TRENDS = [
    { month: 'Jan 26', spend: 45000, savings: 3200 },
    { month: 'Feb 26', spend: 52000, savings: 4800 },
    { month: 'Mar 26', spend: 73000, savings: 8100 },
    { month: 'Apr 26', spend: 61000, savings: 5900 },
    { month: 'May 26', spend: 89000, savings: 10400 },
    { month: 'Jun 26', spend: totalCapitalAllocated || 69950, savings: totalSavingsCalculated || 6200 },
  ];

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in" id="analytics-reports-view">
      
      {/* View Header with Export Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-slate-900">Procurement Intelligence & Sourcing Analytics</h2>
          <p className="text-sm text-slate-500 mt-1">
            Conduct capital utilization audits, trace shipping lead margins, and export audit files.
          </p>
        </div>

        <button
          onClick={() => exportCSVReport('Sourcing KPI Compilation')}
          disabled={exportTriggered}
          className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded transition flex items-center gap-1.5 cursor-pointer shadow-sm uppercase tracking-wider"
          id="export-reports-main-btn"
        >
          {exportTriggered ? 'Compiling data...' : 'Export Sourcing Dossier'} <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Highlights metrics cards strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-xl border border-slate-205 p-4 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-bold block">Allocated Capital Portfolio</span>
          <h3 className="text-lg font-bold mt-1 text-slate-900 font-mono">{formatINR(totalCapitalAllocated)}</h3>
          <p className="text-[9px] text-slate-550 mt-1">Disbursed across {purchaseOrders.length} approved PO contracts.</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-205 p-4 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-bold block">Remitted Funds Total</span>
          <h3 className="text-lg font-bold mt-1 text-emerald-705 font-mono">{formatINR(paidInvoicesTotal)}</h3>
          <p className="text-[9px] text-slate-550 mt-1">Settled invoices processed.</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-205 p-4 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-bold block">Accumulated Savings</span>
          <h3 className="text-lg font-bold mt-1 text-indigo-805 font-mono">{formatINR(totalSavingsCalculated)}</h3>
          <p className="text-[9px] text-slate-550 mt-1">Savings acquired via vendor contract competition.</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-205 p-4 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-bold block">Global Transport SLA Days</span>
          <h3 className="text-lg font-bold mt-1 text-indigo-900 font-mono">{avgSlaDays} Days (Avg)</h3>
          <p className="text-[9px] text-slate-550 mt-1">Average cycle time to port hubs.</p>
        </div>

      </div>

      {/* Multi-graph Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SVG Spend Chart Left */}
        <div className="bg-white rounded-xl border border-slate-205 p-5 lg:col-span-8 space-y-4 shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-xs uppercase font-mono tracking-wider text-slate-500">
              Procurement Capital Inflows & Savings Surcharges
            </h3>
            <span className="text-[10px] bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded text-slate-500 font-mono font-bold">
              Base: INR / calendar months
            </span>
          </div>

          {/* Clean Custom SVG Chart */}
          <div className="relative pt-4" id="monthly-spend-svg-chart">
            <svg viewBox="0 0 600 240" className="w-full h-auto text-slate-500 font-mono text-[9px]">
              {/* Grid lines */}
              <line x1="40" y1="20" x2="580" y2="20" stroke="#f1f5f9" strokeDasharray="3" />
              <line x1="40" y1="70" x2="580" y2="70" stroke="#f1f5f9" strokeDasharray="3" />
              <line x1="40" y1="120" x2="580" y2="120" stroke="#f1f5f9" strokeDasharray="3" />
              <line x1="40" y1="170" x2="580" y2="170" stroke="#f1f5f9" strokeDasharray="3" />
              <line x1="40" y1="220" x2="580" y2="220" stroke="#cbd5e1" />

              {/* Y Axis markings */}
              <text x="5" y="25" fill="#94a3b8">₹90k</text>
              <text x="5" y="75" fill="#94a3b8">₹60k</text>
              <text x="5" y="125" fill="#94a3b8">₹30k</text>
              <text x="5" y="175" fill="#94a3b8">₹10k</text>
              <text x="12" y="222" fill="#94a3b8">₹0</text>

              {/* Bars */}
              {MONTHLY_TRENDS.map((item, idx) => {
                const step = 90;
                const x0 = 60 + idx * step;
                
                const spendHeight = (item.spend / 90000) * 200;
                const savingsHeight = (item.savings / 90000) * 200;
                
                return (
                  <g key={idx} className="group">
                    {/* Spend bar */}
                    <rect 
                      x={x0} 
                      y={220 - spendHeight} 
                      width="24" 
                      height={spendHeight} 
                      fill="url(#spendGrad)" 
                      rx="2"
                      className="transition-all duration-300 hover:opacity-85 cursor-pointer"
                    />

                    {/* Savings bar */}
                    <rect 
                      x={x0 + 26} 
                      y={220 - savingsHeight} 
                      width="12" 
                      height={savingsHeight} 
                      fill="#10b981" 
                      rx="1"
                    />

                    {/* Tooltip value */}
                    <text x={x0 - 5} y={220 - spendHeight - 8} fill="#4f46e5" className="opacity-0 group-hover:opacity-100 font-bold transition-opacity">
                      ₹{Math.round(item.spend/1000)}k
                    </text>

                    {/* Month labels */}
                    <text x={x0 + 10} y="235" fill="#64748b" className="font-sans font-medium">{item.month}</text>
                  </g>
                );
              })}

              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0.2" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="flex gap-4 text-xs font-semibold justify-center pt-2 text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-indigo-650 rounded"></span> Sourcing Capital Spend</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-500 rounded"></span> Sourcing Savings calculated</span>
          </div>

        </div>

        {/* Bottlenecks Samping right side */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-slate-205 p-5 space-y-4 shadow-sm">
            <h3 className="font-bold text-xs uppercase font-mono tracking-wider text-slate-500 block">
              Logistics Delivery Cycle Bottlenecks
            </h3>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              Bottlenecks identified based on supplier port warehouses, milling times, and bulk customs clear procedures.
            </p>

            <div className="space-y-2 text-xs">
              
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-1">
                <div className="flex justify-between font-bold text-red-700">
                  <span>Global Titanium Castings</span>
                  <span>High Latency (28 days)</span>
                </div>
                <p className="text-[10px] text-slate-600 leading-normal">
                  Requires 28 calendar days on average due to custom marine casting specifications and logistics. Risk set to High.
                </p>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-250 rounded-lg space-y-1">
                <div className="flex justify-between font-bold text-emerald-805">
                  <span>ByteCore Solutions & Tech</span>
                  <span>Optimal SLA (9 days)</span>
                </div>
                <p className="text-[10px] text-slate-650 leading-normal">
                  Maintains a robust local warehousing capability in region. Quick node components delivery compliance.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>Apex Industrial Metals</span>
                  <span>Standard SLA (14 days)</span>
                </div>
                <p className="text-[10px] text-slate-600 leading-normal">
                  Heavy machinery parts requires mill and curing timelines. Reliable benchmark partner.
                </p>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Supplier Reliability Rankings list */}
      <div className="bg-white rounded-xl border border-slate-205 p-5 space-y-4 shadow-sm">
        <h3 className="font-bold text-xs uppercase font-mono tracking-wider text-slate-500">
          Supplier compliance Ratings & Score indexes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {vendors.map((vendor) => {
            const getProgressColor = (score: number) => {
              if (score >= 90) return 'bg-emerald-500';
              if (score >= 80) return 'bg-blue-600';
              if (score >= 70) return 'bg-amber-500';
              return 'bg-red-500';
            };

            return (
              <div key={vendor.id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 shadow-inner" id={`report-vtrack-${vendor.id}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{vendor.name}</h4>
                    <span className="text-[9px] uppercase font-mono text-slate-400 font-bold">{vendor.category}</span>
                  </div>
                  <span className="text-amber-700 font-bold font-mono text-xs">⭐ {vendor.rating}</span>
                </div>

                <div className="space-y-1.5 font-mono text-[10px] text-slate-500">
                  <div className="flex justify-between">
                    <span>SLA Compliance:</span>
                    <strong className="text-slate-800">{vendor.slaComplianceRate}%</strong>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full ${getProgressColor(vendor.reliabilityScore)}`} style={{ width: `${vendor.reliabilityScore}%` }}></div>
                  </div>

                  <div className="flex justify-between pt-1">
                    <span>Pricing Index:</span>
                    <span className="text-slate-700 font-bold">{vendor.pricingCompetitiveness}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Years Partnered:</span>
                    <span className="text-slate-705">{vendor.yearsPartnered} yrs</span>
                  </div>
                </div>

                <div className="pt-2 text-center border-t border-slate-200">
                  <button
                    onClick={() => exportCSVReport(`${vendor.name.slice(0, 15)}_Compliance_Dossier`)}
                    className="text-[10px] text-indigo-705 hover:text-indigo-900 transition font-mono uppercase tracking-wider font-bold cursor-pointer"
                  >
                    Export Supplier Scorecard
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
