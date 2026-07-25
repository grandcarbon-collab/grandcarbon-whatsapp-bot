import React, { useState } from 'react';
import {
  PhoneCall,
  MessageSquare,
  FileSpreadsheet,
  Search,
  Filter,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Clock,
  Download,
  RefreshCw,
  Tag,
  Ruler,
  Boxes,
  UserCheck
} from 'lucide-react';
import { Enquiry, BotConfig } from '../types';

interface EnquiryDashboardProps {
  enquiries: Enquiry[];
  config: BotConfig;
  onUpdateStatus: (id: string, status: Enquiry['status'], notes?: string) => void;
  onDeleteEnquiry: (id: string) => void;
  onSyncGoogleSheets: (id?: string) => void;
  onRefreshEnquiries: () => void;
}

export const EnquiryDashboard: React.FC<EnquiryDashboardProps> = ({
  enquiries,
  config,
  onUpdateStatus,
  onDeleteEnquiry,
  onSyncGoogleSheets,
  onRefreshEnquiries,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [isSyncing, setIsSyncing] = useState(false);

  // Filtered list
  const filteredEnquiries = enquiries.filter((enq) => {
    const matchesSearch =
      enq.customerPhone.includes(searchQuery) ||
      (enq.customerName && enq.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      enq.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (enq.dimensions && enq.dimensions.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategoryFilter === 'ALL' || enq.categoryKey === selectedCategoryFilter;

    const matchesStatus =
      selectedStatusFilter === 'ALL' || enq.status === selectedStatusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleSyncAll = async () => {
    setIsSyncing(true);
    await onSyncGoogleSheets();
    setIsSyncing(false);
  };

  const exportToCSV = () => {
    const headers = ['Enquiry ID', 'Customer Phone', 'Category', 'Dimensions (L x W x T)', 'Quantity', 'Timestamp', 'Status', 'Notes'];
    const rows = enquiries.map(e => [
      e.id,
      e.customerPhone,
      `"${e.category}"`,
      `"${e.dimensions || 'N/A'}"`,
      `"${e.quantity || 'N/A'}"`,
      new Date(e.timestamp).toLocaleString(),
      e.status,
      `"${(e.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Grand_Carbon_Enquiries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Stats
  const newCount = enquiries.filter(e => e.status === 'New').length;
  const inProgressCount = enquiries.filter(e => e.status === 'In Progress' || e.status === 'Contacted').length;
  const completedCount = enquiries.filter(e => e.status === 'Completed').length;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Top Banner & Quick Action Buttons */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Grand Carbon Customer Enquiries</h2>
            <span className="bg-amber-500/10 text-amber-400 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Live Order Stream
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Click to Call directly, chat on WhatsApp, update order status, or sync directly to Google Sheets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onRefreshEnquiries}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleSyncAll}
            disabled={isSyncing}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{isSyncing ? 'Syncing...' : 'Sync to Google Sheets'}</span>
          </button>

          <button
            onClick={exportToCSV}
            className="bg-slate-800 hover:bg-slate-700 text-amber-300 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Total Enquiries</p>
            <h3 className="text-2xl font-extrabold text-white mt-0.5">{enquiries.length}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center font-bold">
            {enquiries.length}
          </div>
        </div>

        <div className="bg-slate-900 border border-amber-500/30 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-amber-300">New / Pending Orders</p>
            <h3 className="text-2xl font-extrabold text-amber-400 mt-0.5">{newCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Contacted / In Followup</p>
            <h3 className="text-2xl font-extrabold text-cyan-400 mt-0.5">{inProgressCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-950 text-cyan-400 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Completed Orders</p>
            <h3 className="text-2xl font-extrabold text-emerald-400 mt-0.5">{completedCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search phone number, size, category or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Categories</option>
            <option value="dc_motor">DC Motor Carbon Brush</option>
            <option value="ac_motor">AC Motor Carbon Brush</option>
            <option value="vane">Carbon Vane & Fiber Vane</option>
            <option value="industrial">Industrial Carbon Brush</option>
            <option value="support">Any Enquiry & Support</option>
          </select>

          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Enquiries Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/80 border-b border-slate-700 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                <th className="p-4">Customer Contact &amp; Direct Call</th>
                <th className="p-4">Category</th>
                <th className="p-4">Size (L x W x T mm)</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Date / Time</th>
                <th className="p-4">Status</th>
                <th className="p-4">Google Sheets</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {filteredEnquiries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No enquiries match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredEnquiries.map((enq) => (
                  <tr key={enq.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Customer Phone & Direct Call */}
                    <td className="p-4">
                      <div className="font-bold text-white text-sm flex items-center gap-1.5">
                        <span>{enq.customerPhone}</span>
                      </div>
                      {enq.customerName && (
                        <p className="text-[11px] text-slate-400">{enq.customerName}</p>
                      )}

                      {/* DIRECT CALL BUTTON & WHATSAPP CHAT BUTTON */}
                      <div className="flex items-center gap-2 mt-2">
                        <a
                          href={`tel:${enq.customerPhone}`}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow transition-colors"
                        >
                          <PhoneCall className="w-3 h-3" />
                          <span>Call Now</span>
                        </a>

                        <a
                          href={`https://wa.me/${enq.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello! This is Grand Carbon Manufacturing Co., Lucknow. Regarding your enquiry for ${enq.category}...`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1 transition-colors"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-4">
                      <span className="bg-slate-800 text-amber-300 font-medium px-2.5 py-1 rounded-lg border border-slate-700 inline-block text-[11px]">
                        {enq.category}
                      </span>
                    </td>

                    {/* Size / Dimensions */}
                    <td className="p-4 font-mono text-emerald-300 font-semibold">
                      <div className="flex items-center gap-1">
                        <Ruler className="w-3.5 h-3.5 text-slate-500" />
                        <span>{enq.dimensions || 'N/A'}</span>
                      </div>
                    </td>

                    {/* Quantity */}
                    <td className="p-4 font-semibold text-slate-200">
                      <div className="flex items-center gap-1">
                        <Boxes className="w-3.5 h-3.5 text-amber-500" />
                        <span>{enq.quantity || 'N/A'}</span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="p-4 text-slate-400 whitespace-nowrap">
                      {new Date(enq.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    {/* Status Dropdown */}
                    <td className="p-4">
                      <select
                        value={enq.status}
                        onChange={(e) => onUpdateStatus(enq.id, e.target.value as Enquiry['status'])}
                        className={`text-[11px] font-bold rounded-lg px-2.5 py-1 border focus:outline-none ${
                          enq.status === 'New'
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : enq.status === 'Contacted'
                            ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                            : enq.status === 'In Progress'
                            ? 'bg-blue-950 text-blue-300 border-blue-800'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        }`}
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    {/* Google Sheets Sync Indicator */}
                    <td className="p-4">
                      {enq.syncedToGoogleSheets ? (
                        <span className="text-emerald-400 text-[10px] font-semibold flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                          <CheckCircle2 className="w-3 h-3" /> Synced
                        </span>
                      ) : (
                        <button
                          onClick={() => onSyncGoogleSheets(enq.id)}
                          className="text-amber-400 hover:text-amber-300 text-[10px] font-semibold flex items-center gap-1 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60 transition-colors"
                        >
                          <FileSpreadsheet className="w-3 h-3" /> Sync Now
                        </button>
                      )}
                    </td>

                    {/* Delete Action */}
                    <td className="p-4 text-right">
                      <button
                        onClick={() => onDeleteEnquiry(enq.id)}
                        className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-950/30 transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
