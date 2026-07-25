import React from 'react';
import { MessageSquare, PhoneCall, FileSpreadsheet, Bot, ShieldCheck, CheckCircle2, BookOpen } from 'lucide-react';
import { BotConfig } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  config: BotConfig;
  enquiriesCount: number;
  newEnquiriesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  config,
  enquiriesCount,
  newEnquiriesCount,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 px-4 py-2 text-xs font-medium text-amber-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Grand Carbon Manufacturing Co. — Lucknow, Uttar Pradesh, India</span>
          <span className="hidden md:inline border-l border-amber-500/40 pl-2 text-amber-200">
            Support: +91 {config.supportPhone}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`tel:+91${config.supportPhone}`}
            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-0.5 rounded text-xs font-semibold transition-colors"
          >
            <PhoneCall className="w-3 h-3" />
            <span>Call Support ({config.supportPhone})</span>
          </a>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-bold text-slate-950 text-xl shadow-lg ring-2 ring-amber-400/30">
            GC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">Grand Carbon</h1>
              <span className="bg-emerald-950/80 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-800/50 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> WhatsApp Bot Active
              </span>
            </div>
            <p className="text-xs text-slate-400">
              WhatsApp Cloud API Automation &amp; Enquiry Management System
            </p>
          </div>
        </div>

        {/* System Badges */}
        <div className="flex items-center gap-2 text-xs">
          <div className="bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2 text-slate-300">
            <Bot className="w-3.5 h-3.5 text-amber-400" />
            <span>Owner Forwarding: <strong className="text-emerald-400">+91 {config.ownerPhone}</strong></span>
          </div>

          <div className="bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2 text-slate-300 hidden sm:flex">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Google Sheets: {config.googleSheetsWebhookUrl ? <strong className="text-emerald-400">Connected</strong> : <strong className="text-amber-400">Ready to Sync</strong>}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto border-t border-slate-800/80">
        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'simulator'
              ? 'border-amber-500 text-amber-400 bg-slate-800/50'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <span>Live Chatbot Simulator</span>
          <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
            Interactive
          </span>
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'catalog'
              ? 'border-amber-500 text-amber-400 bg-slate-800/50'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span>Product Catalog Brochure</span>
          <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
            8 Pages PDF
          </span>
        </button>

        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'dashboard'
              ? 'border-amber-500 text-amber-400 bg-slate-800/50'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-amber-400" />
          <span>Customer Enquiries</span>
          {newEnquiriesCount > 0 ? (
            <span className="bg-amber-500 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-full animate-bounce">
              {newEnquiriesCount} NEW
            </span>
          ) : (
            <span className="bg-slate-700 text-slate-300 text-[10px] px-1.5 py-0.2 rounded-full">
              {enquiriesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('sheets')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'sheets'
              ? 'border-amber-500 text-amber-400 bg-slate-800/50'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Google Sheets Sync</span>
        </button>

        <button
          onClick={() => setActiveTab('meta-setup')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'meta-setup'
              ? 'border-amber-500 text-amber-400 bg-slate-800/50'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Meta API &amp; Vercel Deploy</span>
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'config'
              ? 'border-amber-500 text-amber-400 bg-slate-800/50'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
          }`}
        >
          <Bot className="w-4 h-4 text-amber-400" />
          <span>Bot Messages &amp; Config</span>
        </button>
      </div>
    </header>
  );
};
