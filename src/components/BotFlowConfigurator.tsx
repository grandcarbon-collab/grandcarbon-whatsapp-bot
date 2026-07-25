import React, { useState } from 'react';
import { Bot, FileText, Phone, Settings, Save, Check, ExternalLink } from 'lucide-react';
import { BotConfig } from '../types';

interface BotFlowConfiguratorProps {
  config: BotConfig;
  onSaveConfig: (updated: Partial<BotConfig>) => void;
}

export const BotFlowConfigurator: React.FC<BotFlowConfiguratorProps> = ({
  config,
  onSaveConfig,
}) => {
  const [welcomeMsg, setWelcomeMsg] = useState(config.welcomeMessage);
  const [specPromptMsg, setSpecPromptMsg] = useState(config.specPromptMessage);
  const [supportMsg, setSupportMsg] = useState(config.supportMessage);
  const [catalogUrl, setCatalogUrl] = useState(config.catalogPdfUrl);
  const [priceListUrl, setPriceListUrl] = useState(config.priceListPdfUrl);
  const [supportPhone, setSupportPhone] = useState(config.supportPhone);
  const [ownerPhone, setOwnerPhone] = useState(config.ownerPhone);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    onSaveConfig({
      welcomeMessage: welcomeMsg,
      specPromptMessage: specPromptMsg,
      supportMessage: supportMsg,
      catalogPdfUrl: catalogUrl,
      priceListPdfUrl: priceListUrl,
      supportPhone: supportPhone,
      ownerPhone: ownerPhone,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-lg">
            <Bot className="w-6 h-6" />
            <h2>Grand Carbon Chatbot Message &amp; Catalog Manager</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Customize automated messages, catalog PDF links, price lists, and support phone numbers.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Bot Settings</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Messages Customization */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Settings className="w-4 h-4 text-amber-400" />
            Automated WhatsApp Message Templates
          </h3>

          {/* 1. Welcome Message */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              1. Welcome Menu Message (Triggered by "Hi" or "Start"):
            </label>
            <textarea
              rows={8}
              value={welcomeMsg}
              onChange={(e) => setWelcomeMsg(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 font-sans leading-relaxed"
            />
          </div>

          {/* 2. Specification Prompt */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              2. Dimension &amp; Quantity Prompt Message (When customer chooses option 1-4):
            </label>
            <textarea
              rows={4}
              value={specPromptMsg}
              onChange={(e) => setSpecPromptMsg(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 font-sans leading-relaxed"
            />
          </div>

          {/* 3. Support Message */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              3. Support Call Message (When customer chooses option 5):
            </label>
            <textarea
              rows={3}
              value={supportMsg}
              onChange={(e) => setSupportMsg(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 font-sans leading-relaxed"
            />
          </div>
        </div>

        {/* Catalog Links & Support Numbers */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <FileText className="w-4 h-4 text-emerald-400" />
              Product Catalog &amp; Price List Documents
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Product Catalog PDF / Link:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={catalogUrl}
                    onChange={(e) => setCatalogUrl(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-300 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <a
                    href={catalogUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 flex items-center justify-center transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Latest Price List PDF / Link:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={priceListUrl}
                    onChange={(e) => setPriceListUrl(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-300 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <a
                    href={priceListUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 flex items-center justify-center transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Phone className="w-4 h-4 text-cyan-400" />
              Contact Numbers Configuration
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Customer Support Phone (Click-to-Call):
                </label>
                <input
                  type="text"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-400 font-bold focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Owner WhatsApp Number (Receives Order Alerts):
                </label>
                <input
                  type="text"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-400 font-bold focus:outline-none font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
