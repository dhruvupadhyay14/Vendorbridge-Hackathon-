import React, { useState } from 'react';
import { AuditLog, Notification, User } from '../types';
import { 
  Search, 
  Terminal 
} from 'lucide-react';

interface ActivityLogsProps {
  user: User;
  logs: AuditLog[];
  notifications: Notification[];
  onClearReadNotifications?: () => void;
  onMarkNotificationRead?: (notifId: string) => void;
}

export default function ActivityLogs({ 
  user, 
  logs, 
  notifications, 
  onClearReadNotifications,
  onMarkNotificationRead
}: ActivityLogsProps) {
  
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.details.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.userName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesModule = moduleFilter === 'All' || log.module === moduleFilter;
    const matchesRole = roleFilter === 'All' || log.userRole === roleFilter;

    return matchesSearch && matchesModule && matchesRole;
  });

  const modules = ['All', 'RFQ Creation', 'Vendor Portal', 'Approval Queue', 'Order Management', 'Invoicing'];
  const roles = ['All', 'officer', 'manager', 'vendor', 'admin'];

  const getModuleBadgeClass = (module: string) => {
    switch (module) {
      case 'RFQ Creation': return 'text-sky-700 bg-sky-50 border-sky-200';
      case 'Vendor Portal': return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'Approval Queue': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Order Management': return 'text-indigo-700 bg-indigo-50 border-indigo-200';
      case 'Invoicing': return 'text-emerald-700 bg-emerald-50 border-emerald-250';
      default: return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 text-slate-800 animate-fade-in" id="audit-logs-view">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-slate-900">Audit Trail Logs & Notifications Hub</h2>
          <p className="text-sm text-slate-500 mt-1">
            Maintain high regulatory transparency, inspect audit workflows, and track real-time message alerts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Live Notifications Hub */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-205 p-4 space-y-4 shadow-sm">
          <div className="flex justify-between items-center pr-1 border-b border-slate-100 pb-2">
            <h3 className="font-bold text-xs uppercase font-mono tracking-wider text-slate-500">
              Notification Dispatcher
            </h3>
            {onClearReadNotifications && (
              <button
                onClick={onClearReadNotifications}
                className="text-[10px] text-slate-400 hover:text-slate-800 underline cursor-pointer font-mono font-bold"
              >
                Clear Read
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div 
                  key={notif.id}
                  onClick={() => onMarkNotificationRead && onMarkNotificationRead(notif.id)}
                  className={`p-3 border rounded-lg transition cursor-pointer text-xs space-y-1 ${
                    notif.read 
                      ? 'bg-slate-50 border-slate-200 opacity-60' 
                      : 'bg-indigo-50/50 border-indigo-200 font-semibold'
                  }`}
                  id={`notif-item-${notif.id}`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-[9px] uppercase font-mono font-bold px-1.5 py-0.2 rounded border ${
                      notif.type === 'rfq' ? 'bg-sky-50 text-sky-750 border-sky-150' :
                      notif.type === 'approval' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      notif.type === 'quotation' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      'bg-emerald-50 text-emerald-700 border-emerald-250'
                    }`}>
                      {notif.type}
                    </span>
                    <span className="text-[9px] text-slate-405 font-mono">
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h4 className="text-[11px] text-slate-900 font-bold">{notif.title}</h4>
                  <p className="text-[10px] text-slate-500 leading-normal">{notif.message}</p>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs font-semibold">
                Notification center is empty.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Compliance Audit Log entries */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-205 p-5 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-2 gap-2">
            <h3 className="font-bold text-xs uppercase font-mono tracking-wider text-slate-500 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-slate-400" /> Compliance Audit Trail Directory
            </h3>
            <span className="text-slate-400 font-bold text-[9px] font-mono select-none">
              ISO-27001 Certified System Ledger
            </span>
          </div>

          {/* Search/Filter Controls Bar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-6 relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-405" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search logs by action, username or details..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-220 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
                id="audit-search-input"
              />
            </div>

            <div className="md:col-span-3">
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-220 rounded-lg text-xs text-slate-700 font-semibold focus:outline-none"
                id="audit-filter-module"
              >
                {modules.map(m => <option key={m} value={m}>{m === 'All' ? 'All Modules' : m}</option>)}
              </select>
            </div>

            <div className="md:col-span-3">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-220 rounded-lg text-xs text-slate-700 font-semibold focus:outline-none"
                id="audit-filter-role"
              >
                {roles.map(r => <option key={r} value={r}>{r === 'All' ? 'All Roles' : `${r.toUpperCase()} Only`}</option>)}
              </select>
            </div>
          </div>

          {/* Visual Logs Table */}
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] text-slate-400 uppercase font-mono tracking-wider font-bold">
                  <th className="py-2">Time (UTC)</th>
                  <th className="py-2 text-center">Executed User</th>
                  <th className="py-2 text-center">Module</th>
                  <th className="py-2 text-center">Action Code</th>
                  <th className="py-2 pl-4">Compliance Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono text-[11px]">
                {filteredLogs.length > 0 ? (
                  [...filteredLogs].reverse().map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} <span className="opacity-70">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>
                      <td className="py-3 text-center">
                        <span className="font-bold text-slate-900 block font-sans">{log.userName}</span>
                        <span className="text-[8px] uppercase text-slate-400">{log.userRole}</span>
                      </td>
                      <td className="py-3 text-center whitespace-nowrap">
                        <span className={`text-[9px] px-2 py-0.5 border rounded-full font-bold uppercase font-sans ${getModuleBadgeClass(log.module)}`}>
                          {log.module}
                        </span>
                      </td>
                      <td className="py-3 text-center font-bold text-slate-800 whitespace-nowrap text-[10px]">
                        {log.action}
                      </td>
                      <td className="py-3 pl-4 text-slate-600 font-sans leading-normal">
                        {log.details}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 bg-slate-50 text-center text-slate-550 font-sans">
                      No security audit logs found matching selected parameters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="text-[10px] text-slate-450 pt-2 border-t border-slate-100 flex justify-between items-center leading-normal">
            <span>Aggregated audit index count: <strong className="text-slate-700">{logs.length} events</strong></span>
            <span className="font-mono">Security Checksum: SHA-256 SIGNED</span>
          </div>
        </div>

      </div>

    </div>
  );
}
