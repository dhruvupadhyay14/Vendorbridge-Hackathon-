import React, { useState } from 'react';
import { Vendor, User } from '../types';
import { 
  Building2, 
  Search, 
  Check, 
  Plus, 
  Mail, 
  Phone, 
  AlertTriangle,
  X
} from 'lucide-react';
import { isValidEmail, isValidPhone, isValidGSTIN } from '../utils';

interface VendorManagementProps {
  user: User;
  vendors: Vendor[];
  onAddVendor: (vendor: Vendor) => void;
  onUpdateVendorStatus: (vendorId: string, status: Vendor['status']) => void;
}

export default function VendorManagement({ user, vendors, onAddVendor, onUpdateVendorStatus }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  
  // Registration Form State
  const [showRegModal, setShowRegModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCategory, setNewCategory] = useState('Heavy Machinery & Parts');
  const [newGst, setNewGst] = useState('');
  const [newCompetitiveness, setNewCompetitiveness] = useState<'Excellent' | 'Good' | 'Average' | 'High-Cost'>('Excellent');
  const [valErrors, setValErrors] = useState<string[]>([]);

  // Filtering Logic
  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          vendor.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vendor.gstNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'All' || vendor.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || vendor.status === statusFilter;
    const matchesRisk = riskFilter === 'All' || vendor.riskLevel === riskFilter;

    return matchesSearch && matchesCategory && matchesStatus && matchesRisk;
  });

  const handleRegisterVendor = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];
    
    if (!newName.trim()) {
      errors.push('Company Entity Name is required.');
    }
    if (!newContact.trim()) {
      errors.push('Authorized Contact Representative Name is required.');
    }
    if (!newEmail.trim()) {
      errors.push('Business Email Address is required.');
    } else if (!isValidEmail(newEmail)) {
      errors.push('Please enter a valid corporate email schema (e.g., sales@company.com).');
    }
    if (!newPhone.trim()) {
      errors.push('Authorized Office Phone is required.');
    } else if (!isValidPhone(newPhone)) {
      errors.push('Please enter a valid telephone number with at least 10 digits.');
    }
    if (!newGst.trim()) {
      errors.push('Tax Registration GSTIN / ID is required.');
    } else if (!isValidGSTIN(newGst)) {
      errors.push('Please enter a valid 15-character Indian GSTIN (format: 29AAAAA1111A1Z1).');
    }
    
    if (errors.length > 0) {
      setValErrors(errors);
      return;
    }

    const created: Vendor = {
      id: 'v_' + Date.now(),
      name: newName.trim(),
      contactName: newContact.trim(),
      email: newEmail.trim(),
      phone: newPhone.trim(),
      category: newCategory,
      gstNumber: newGst.trim().toUpperCase(),
      status: 'Active',
      rating: 5.0,
      reliabilityScore: 100,
      responseRate: 100,
      cycleTimeDays: 7,
      riskLevel: 'Low',
      pendingTasksCount: 0,
      slaComplianceRate: 100,
      pricingCompetitiveness: newCompetitiveness,
      yearsPartnered: 1
    };

    onAddVendor(created);
    setShowRegModal(false);
    
    // Reset inputs
    setNewName('');
    setNewContact('');
    setNewEmail('');
    setNewPhone('');
    setNewGst('');
    setValErrors([]);
  };

  const categories = ['All', 'Heavy Machinery & Parts', 'IT Infrastructure & Hardware', 'Logistics & Packaging Supplies'];
  const statuses = ['All', 'Active', 'Under Review', 'On Hold', 'Blacklisted'];
  const risks = ['All', 'Low', 'Medium', 'High'];

  const getReliabilityColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 font-bold';
    if (score >= 80) return 'text-blue-600 font-bold';
    if (score >= 70) return 'text-amber-600 font-bold';
    return 'text-red-600 font-bold';
  };

  const getRiskBadge = (risk: 'Low' | 'Medium' | 'High') => {
    switch (risk) {
      case 'Low': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'Medium': return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'High': return 'bg-red-50 text-red-700 border border-red-200';
    }
  };

  return (
    <div className="space-y-6 text-slate-800" id="vendors-view">
      
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-slate-900">Supplier Directory Registre</h2>
          <p className="text-sm text-slate-500 mt-1">
            Maintain compliance dossiers, corporate tax credentials, and historical reliability SLA scores.
          </p>
        </div>
        {(user.role === 'admin' || user.role === 'officer') && (
          <button
            onClick={() => setShowRegModal(true)}
            className="bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white px-5 py-2.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-sm font-mono uppercase tracking-wider"
            id="register-vendor-trigger"
          >
            <Plus className="w-4 h-4" /> Register Supplier
          </button>
        )}
      </div>

      {/* Supplier Registration Overlay Form */}
      {showRegModal && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-md relative max-w-3xl mx-auto animate-fade-in mb-6">
          <button 
            type="button"
            onClick={() => setShowRegModal(false)}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition cursor-pointer"
            id="close-registration-form"
          >
            <X className="w-5 h-5" />
          </button>
          
          <h3 className="text-sm font-bold font-mono tracking-wider text-slate-800 uppercase flex items-center gap-2">
            Supplier Accreditation Onboarding
          </h3>
          <p className="text-xs text-slate-550 mt-1 mb-4">
            Verify tax profiles and classifications. Default compliance scorecards will automatically initialize.
          </p>

          {valErrors.length > 0 && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs space-y-1">
              <strong>Rectify registration criteria:</strong>
              <ul className="list-disc list-inside">
                {valErrors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          )}

          <form onSubmit={handleRegisterVendor} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-xs font-bold text-slate-550 uppercase mb-1">Company Entity Name</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Apex Industrial Metal Partners"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs"
                id="vendor-form-name"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-555 uppercase mb-1">Tax Registration GSTIN / ID</label>
              <input
                type="text"
                required
                value={newGst}
                onChange={(e) => setNewGst(e.target.value)}
                placeholder="e.g. 29AAAAA1111A1Z1"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs uppercase"
                id="vendor-form-gst"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-555 uppercase mb-1">Authorized Contact Name</label>
              <input
                type="text"
                required
                value={newContact}
                onChange={(e) => setNewContact(e.target.value)}
                placeholder="e.g. James Miller"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-805 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs"
                id="vendor-form-contact"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-550 uppercase mb-1">Business Email Address</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="sales@apexmetal.com"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-805 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs"
                id="vendor-form-email"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-550 uppercase mb-1">Authorized Office Phone</label>
              <input
                type="tel"
                required
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+1 (555) 234-5678"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-805 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-905 text-xs"
                id="vendor-form-phone"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-550 uppercase mb-1">Primary Classification</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none text-xs"
                id="vendor-form-category"
              >
                <option>Heavy Machinery & Parts</option>
                <option>IT Infrastructure & Hardware</option>
                <option>Logistics & Packaging Supplies</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-550 uppercase mb-1">Value Competitiveness Grading</label>
              <select
                value={newCompetitiveness}
                onChange={(e) => setNewCompetitiveness(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-800 bg-white focus:outline-none text-xs"
                id="vendor-form-pricing"
              >
                <option value="Excellent">Excellent (Highly competitive)</option>
                <option value="Good">Good (Healthy discounting)</option>
                <option value="Average">Average (Fair market standards)</option>
                <option value="High-Cost">High-Cost (Premium technical services)</option>
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end gap-2.5 pt-3">
              <button
                type="button"
                onClick={() => setShowRegModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-50 transition text-xs cursor-pointer font-bold"
                id="cancel-vendor-btn"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 border border-slate-900 text-white rounded-lg hover:bg-slate-800 transition text-xs font-bold cursor-pointer shadow-sm"
                id="submit-vendor-btn"
              >
                Authorize Partnership
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Global Filters & Searching Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4 shadow-sm">
        
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by vendor name, representative, contacts or GSTIN..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-450 focus:outline-none focus:ring-1 focus:ring-slate-900 text-xs font-sans shadow-inner"
            id="vendor-search-input"
          />
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-3 gap-2 md:flex md:items-center md:gap-2">
          
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-250 rounded-lg text-slate-700 font-medium focus:outline-none text-xs w-full min-w-[140px] cursor-pointer"
              id="vendor-filter-category"
            >
              {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Classes' : c}</option>)}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-250 rounded-lg text-slate-700 font-medium focus:outline-none text-xs w-full min-w-[130px] cursor-pointer"
              id="vendor-filter-status"
            >
              {statuses.map(s => <option key={s} value={s}>{s === 'All' ? 'All Status' : s}</option>)}
            </select>
          </div>

          <div>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-250 rounded-lg text-slate-700 font-medium focus:outline-none text-xs w-full min-w-[110px] cursor-pointer"
              id="vendor-filter-risk"
            >
              {risks.map(r => <option key={r} value={r}>{r === 'All' ? 'All Risks' : `${r} Risk`}</option>)}
            </select>
          </div>

        </div>

      </div>

      {/* Main Vendor List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="vendor-cards-grid">
        {filteredVendors.length > 0 ? (
          filteredVendors.map((vendor) => (
            <div 
              key={vendor.id} 
              className={`bg-white rounded-xl border transition p-5 shadow-sm ${
                vendor.status === 'Blacklisted' ? 'border-red-301 bg-red-50/20' : 'border-slate-205 hover:border-slate-350'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900" id={`vcard-title-${vendor.id}`}>
                    {vendor.name}
                  </h4>
                  <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-slate-500">
                    ID: {vendor.id.toUpperCase()} • {vendor.category}
                  </span>
                </div>
                
                {/* Status Toggle */}
                {(user.role === 'admin' || user.role === 'officer') ? (
                  <select
                    value={vendor.status}
                    onChange={(e) => onUpdateVendorStatus(vendor.id, e.target.value as any)}
                    className={`px-2.5 py-1 text-xs rounded font-semibold font-mono border bg-white focus:outline-none cursor-pointer ${
                      vendor.status === 'Active' ? 'text-emerald-705 border-emerald-250' :
                      vendor.status === 'Under Review' ? 'text-amber-705 border-amber-250' :
                      vendor.status === 'On Hold' ? 'text-indigo-705 border-indigo-250' :
                      'text-red-705 border-red-250'
                    }`}
                    id={`vcard-status-select-${vendor.id}`}
                  >
                    <option value="Active">Active</option>
                    <option value="Under Review">Under Review</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Blacklisted">Blacklisted</option>
                  </select>
                ) : (
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                    vendor.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    vendor.status === 'Under Review' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    vendor.status === 'On Hold' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                    'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {vendor.status}
                  </span>
                )}
              </div>

              {/* Reliability telemetry strip */}
              <div className="grid grid-cols-3 gap-2 mt-4 bg-slate-50 p-3 rounded-lg border border-slate-150 text-center font-mono text-xs">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">SLA Delivery</p>
                  <p className={`text-sm mt-0.5 ${getReliabilityColor(vendor.reliabilityScore)}`}>
                    {vendor.reliabilityScore}%
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold font-sans">Cycle Time</p>
                  <p className="text-sm font-bold mt-0.5 text-slate-800">
                    {vendor.cycleTimeDays} days
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold block">Risk Index</p>
                  <span className={`inline-block text-[10px] px-2 py-0.5 rounded mt-1 font-bold ${getRiskBadge(vendor.riskLevel)}`}>
                    {vendor.riskLevel}
                  </span>
                </div>
              </div>

              {/* Vendor compliance and contact details */}
              <div className="mt-4 space-y-2 text-xs font-sans text-slate-650">
                
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>GSTIN / Corporate key: <strong className="text-slate-800 font-mono">{vendor.gstNumber}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-slate-400 font-bold" />
                  <span>Primary Representative: <strong className="text-slate-800">{vendor.contactName}</strong></span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 mt-2 font-mono text-[11px] text-slate-550">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> {vendor.email}
                  </span>
                  <span className="flex items-center gap-1 justify-end">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {vendor.phone}
                  </span>
                </div>

              </div>

              {/* Operational details bottom row */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>Value grading: <strong className="text-slate-700">{vendor.pricingCompetitiveness}</strong></span>
                <span>Active projects: <strong className="text-indigo-700">{vendor.pendingTasksCount} assigned</strong></span>
              </div>

            </div>
          ))
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-12 text-center col-span-2">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <h4 className="font-bold text-slate-750 text-sm">No Supplier Records Selected</h4>
            <p className="text-xs text-slate-500 mt-1">Refine filters or click "Register Supplier" to onboard verified partners.</p>
          </div>
        )}
      </div>

    </div>
  );
}
