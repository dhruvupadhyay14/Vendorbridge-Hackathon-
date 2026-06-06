import React, { useState } from 'react';
import { RFQ, RFQItem, Vendor, User } from '../types';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  FileUp, 
  CheckCircle2, 
  AlertOctagon,
  Search
} from 'lucide-react';
import { formatINR } from '../utils';

interface RFQCreationProps {
  user: User;
  vendors: Vendor[];
  onAddRFQ: (rfq: RFQ) => void;
  onNavigate: (screen: string) => void;
}

export default function RFQCreation({ user, vendors, onAddRFQ, onNavigate }: RFQCreationProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Heavy Machinery & Parts');
  const [deadline, setDeadline] = useState('');
  const [items, setItems] = useState<RFQItem[]>([
    { id: 'item_1', name: '', quantity: 1, unit: 'units', targetPrice: 100, description: '' }
  ]);
  const [assignedVendors, setAssignedVendors] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [attachmentName, setAttachmentName] = useState('');
  const [feedback, setFeedback] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const categoryVendors = vendors.filter(v => v.category === category && v.status === 'Active');

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: 'item_' + Date.now() + Math.random().toString(36).substr(2, 4), name: '', quantity: 1, unit: 'units', targetPrice: 100, description: '' }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof RFQItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleToggleVendor = (vendorId: string) => {
    if (assignedVendors.includes(vendorId)) {
      setAssignedVendors(assignedVendors.filter(id => id !== vendorId));
    } else {
      setAssignedVendors([...assignedVendors, vendorId]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setAttachmentName(e.dataTransfer.files[0].name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachmentName(e.target.files[0].name);
    }
  };

  const handleCreateRFQ = (status: RFQ['status']) => {
    setErrorMessage('');
    setFeedback('');

    if (!title.trim() || title.trim().length < 5) {
      setErrorMessage('Validation Error: Project Requisition Title must be at least 5 characters long.');
      return;
    }
    if (!description.trim() || description.trim().length < 15) {
      setErrorMessage('Validation Error: Technical Scope Guidance must be at least 15 characters long.');
      return;
    }
    if (!deadline) {
      setErrorMessage('Validation Error: Requisition closing timeline date is required.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (deadline < todayStr) {
      setErrorMessage('Validation Error: RFQ timeline deadline cannot be chosen in the past.');
      return;
    }

    // Check item rows
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.name.trim()) {
        setErrorMessage(`Validation Error: Product Designation is required on Item Line #${i + 1}.`);
        return;
      }
      if (item.quantity < 1 || isNaN(item.quantity)) {
        setErrorMessage(`Validation Error: Product Quantity must be at least 1 unit on Item Line #${i + 1}.`);
        return;
      }
      if (item.targetPrice <= 0 || isNaN(item.targetPrice)) {
        setErrorMessage(`Validation Error: Target Price estimate must be greater than ₹0 on Item Line #${i + 1}.`);
        return;
      }
    }

    if (assignedVendors.length === 0) {
      setErrorMessage('Validation Error: Operational SLA mandate requires assigning at least 1 verified supplier partner.');
      return;
    }

    const targetDeadline = `${deadline}T18:00:00Z`;

    const newRfq: RFQ = {
      id: 'rfq-' + (100 + Math.floor(Math.random() * 900)),
      title,
      description,
      category,
      items,
      createdBy: user.name,
      createdAt: new Date().toISOString(),
      deadline: targetDeadline,
      assignedVendors,
      status,
      attachmentName: attachmentName || undefined
    };

    onAddRFQ(newRfq);
    setFeedback(`Success! RFQ has been initialized and ${status === 'Published' ? 'dispatched to suppliers' : 'saved as draft'}.`);
    
    setTimeout(() => {
      onNavigate('dashboard');
    }, 1500);
  };

  return (
    <div className="space-y-6 text-slate-800" id="rfq-creation-view">
      
      <div>
        <h2 className="text-xl font-bold font-sans tracking-tight text-slate-900">Initialize Procurement Request (RFQ)</h2>
        <p className="text-sm text-slate-500 mt-1">
          Specify lines, target pricing limits, attach technical specifications, and assign accredited partners.
        </p>
      </div>

      {feedback && (
        <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 p-4 rounded-lg flex items-center gap-3 font-semibold text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-655" />
          {feedback}
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-lg flex items-center gap-3 font-semibold text-xs animate-pulse">
          <AlertOctagon className="w-5 h-5 text-red-600" />
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
        
        {/* Left Side: General Info & Items */}
        <div className="lg:col-span-8 space-y-5">
          
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
            <h3 className="font-bold text-xs uppercase font-mono tracking-wider text-slate-500">1. Requisition Header Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Project Requisition Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sub-micron Grain Tungsten Carbide Boring Heads"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 font-sans text-xs shadow-inner"
                  id="rfq-title-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Purchasing Category</label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setAssignedVendors([]);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-220 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 font-sans text-xs cursor-pointer shadow-sm"
                  id="rfq-category-select"
                >
                  <option>Heavy Machinery & Parts</option>
                  <option>IT Infrastructure & Hardware</option>
                  <option>Logistics & Packaging Supplies</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Submission Timeline Deadline</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-220 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 font-sans text-xs cursor-pointer shadow-sm"
                    id="rfq-deadline-input"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1.5">Technical Scope Guidance</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe dimensions, certifications requirements, warranty policies, and target delivery addresses..."
                  className="w-full px-3 py-2 bg-white border border-slate-220 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 font-sans text-xs resize-none shadow-inner"
                  id="rfq-desc-textarea"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Item Form */}
          <div className="bg-white rounded-xl border border-slate-205 p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase font-mono tracking-wider text-slate-500">2. Requisition Lines</h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1 cursor-pointer"
                id="add-rfq-item-btn"
              >
                <Plus className="w-3.5 h-3.5" /> Append Item Line
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={item.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3 relative group" id={`rfq-item-${item.id}`}>
                  
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-red-650 transition cursor-pointer"
                      title="Delete Line Item"
                      id={`remove-item-btn-${index}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <span className="text-[10px] font-mono text-slate-500 font-bold uppercase block select-none">
                    Item Line Sequence #{index + 1}
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                    
                    <div className="md:col-span-5">
                      <label className="block text-[10px] text-slate-505 uppercase font-bold mb-1">Product Designation</label>
                      <input
                        type="text"
                        required
                        value={item.name}
                        onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                        placeholder="e.g. Carbide Boring Head 16mm"
                        className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-900 rounded-lg shadow-sm focus:ring-1 focus:ring-slate-900 outline-none"
                        id={`rfq-item-name-${index}`}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[10px] text-slate-505 uppercase font-bold mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-900 rounded-lg shadow-sm focus:ring-1 focus:ring-slate-900 outline-none"
                        id={`rfq-item-quantity-${index}`}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[10px] text-slate-505 uppercase font-bold mb-1">Unit</label>
                      <input
                        type="text"
                        required
                        value={item.unit}
                        onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                        placeholder="e.g. units"
                        className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-900 rounded-lg shadow-sm focus:ring-1 focus:ring-slate-900 outline-none"
                        id={`rfq-item-unit-${index}`}
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-[10px] text-slate-505 uppercase font-bold mb-1">Target Price Estimate (₹)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={item.targetPrice}
                        onChange={(e) => handleItemChange(item.id, 'targetPrice', parseFloat(e.target.value) || 0)}
                        placeholder="120.00"
                        className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-900 rounded-lg shadow-sm focus:ring-1 focus:ring-slate-900 outline-none"
                        id={`rfq-item-price-${index}`}
                      />
                    </div>

                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Technical Spec / Quality Benchmark (Optional)</label>
                    <input
                      type="text"
                      value={item.description || ''}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      placeholder="e.g. Submicrom tungsten alloy coating, TiAlN finished shank"
                      className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs rounded-lg shadow-sm focus:ring-1 focus:ring-slate-900 outline-none"
                      id={`rfq-item-spec-${index}`}
                    />
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Attachment upload */}
          <div className="bg-white rounded-xl border border-slate-205 p-5 space-y-4 shadow-sm">
            <h3 className="font-bold text-xs uppercase font-mono tracking-wider text-slate-500">3. Blueprint Specifications Attachment</h3>
            
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition ${
                dragActive ? 'border-slate-800 bg-slate-50' : 'border-slate-300 bg-slate-50/50 hover:border-slate-400'
              }`}
            >
              <input
                id="file-upload-input"
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload-input" className="cursor-pointer space-y-2 block select-none">
                <FileUp className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-650">
                  <span className="font-semibold text-indigo-700 hover:underline">Drag & drop technical dwg schematics</span> or browse files
                </p>
                <p className="text-[10px] text-slate-400">PDF, CAD, DWG, CSV up to 15MB</p>
              </label>

              {attachmentName && (
                <div className="mt-4 bg-slate-100 border border-slate-200 text-slate-700 text-xs py-1.5 px-3 rounded-lg inline-block font-mono font-medium">
                  Attached file: <strong>{attachmentName}</strong>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Side: Smart Supplier Assignment Panel */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-xs uppercase font-mono tracking-wider text-slate-800">4. Target Supplier Invitation</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Accredited in <strong>{category}</strong>
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-sans">
              Select accredited vendors to receive automated RFP dispatch notices:
            </p>

            <div className="space-y-2">
              {categoryVendors.length > 0 ? (
                categoryVendors.map((vendor) => {
                  const isAssigned = assignedVendors.includes(vendor.id);
                  return (
                    <div 
                      key={vendor.id}
                      onClick={() => handleToggleVendor(vendor.id)}
                      className={`p-3 rounded-lg border transition cursor-pointer text-left flex items-start justify-between ${
                        isAssigned 
                          ? 'border-slate-900 bg-slate-50' 
                          : 'border-slate-200 hover:bg-slate-50/50'
                      }`}
                      id={`rfq-vendor-assign-card-${vendor.id}`}
                    >
                      <div className="space-y-0.5">
                        <p className={`text-xs font-bold ${isAssigned ? 'text-slate-900 font-bold' : 'text-slate-705'}`}>
                          {vendor.name}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                          <span>SLA Score: <strong className="text-emerald-600">{vendor.reliabilityScore}%</strong></span>
                          <span>•</span>
                          <span>Cycle: <strong>{vendor.cycleTimeDays}d</strong></span>
                        </div>
                      </div>
                      
                      <div className={`w-3.5 h-3.5 rounded border mt-0.5 flex items-center justify-center transition-colors ${
                        isAssigned ? 'bg-slate-900 border-slate-900 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isAssigned && <span className="text-[9px] font-bold">✓</span>}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-red-50 border border-red-150 p-4 text-red-800 text-xs rounded-lg flex items-start gap-2 leading-relaxed">
                  <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold">Accredited Suppliers Alert</h5>
                    <p className="text-red-700 text-[10px] mt-0.5">
                      No suppliers registered as 'Active' in category {category}. Update credentials in the <strong>Partner Vendor Network</strong> folder.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {categoryVendors.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-150 p-3.5 rounded-lg space-y-1">
                <span className="text-[10px] uppercase font-mono font-bold text-emerald-800 tracking-wider">
                  SLA Sourcing Analytics
                </span>
                <p className="text-emerald-950 text-[11px] leading-relaxed">
                  Based on historical transport parameters, we recommend inviting <strong>{categoryVendors.sort((a,b)=>b.reliabilityScore - a.reliabilityScore)[0]?.name}</strong> to fulfill this sourcing requirement because of their outstanding {categoryVendors.sort((a,b)=>b.reliabilityScore - a.reliabilityScore)[0]?.reliabilityScore}% SLA scorecard rate.
                </p>
              </div>
            )}
          </div>

          {/* Action Dispatch Buttons */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-2 shadow-sm">
            <button
              type="button"
              onClick={() => handleCreateRFQ('Published')}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white rounded-lg shadow-sm transition cursor-pointer text-center font-mono uppercase tracking-wider"
              id="publish-rfq-btn"
            >
              Dispatch to Suppliers
            </button>
            <button
              type="button"
              onClick={() => handleCreateRFQ('Draft')}
              className="w-full py-2.5 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 border border-slate-200 rounded-lg transition cursor-pointer text-center font-mono uppercase tracking-wider"
              id="draft-rfq-btn"
            >
              Save Requisition Draft
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
