import React, { useState, useEffect } from 'react';
import { ShieldCheck, Copy, Check, ExternalLink, Server, Globe, Key, Phone, CheckCircle2, AlertCircle, Code, Rocket } from 'lucide-react';
import { BotConfig } from '../types';

interface MetaSetupGuideProps {
  config: BotConfig;
  onSaveConfig: (updated: Partial<BotConfig>) => void;
}

export const MetaSetupGuide: React.FC<MetaSetupGuideProps> = ({
  config,
  onSaveConfig,
}) => {
  const [token, setToken] = useState(config.metaAccessToken || '');
  const [phoneId, setPhoneId] = useState(config.metaPhoneNumberId || '');
  const [verifyToken, setVerifyToken] = useState(config.metaVerifyToken || 'grand_carbon_verify_123');
  const [ownerPhone, setOwnerPhone] = useState(config.ownerPhone || '9580868774');

  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedVerify, setCopiedVerify] = useState(false);
  const [copiedVercelCode, setCopiedVercelCode] = useState(false);

  const [vercelExport, setVercelExport] = useState<{ vercelWebhookJs: string; vercelJson: string } | null>(null);

  const currentAppUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const webhookUrl = `${currentAppUrl}/api/webhook`;

  useEffect(() => {
    fetch('/api/export/vercel')
      .then((res) => res.json())
      .then((data) => setVercelExport(data))
      .catch((e) => console.error(e));
  }, []);

  const handleSaveMetaCredentials = () => {
    onSaveConfig({
      metaAccessToken: token,
      metaPhoneNumberId: phoneId,
      metaVerifyToken: verifyToken,
      ownerPhone: ownerPhone,
    });
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 3000);
  };

  const handleCopyVerifyToken = () => {
    navigator.clipboard.writeText(verifyToken);
    setCopiedVerify(true);
    setTimeout(() => setCopiedVerify(false), 3000);
  };

  const handleCopyVercelCode = () => {
    if (vercelExport) {
      navigator.clipboard.writeText(vercelExport.vercelWebhookJs);
      setCopiedVercelCode(true);
      setTimeout(() => setCopiedVercelCode(false), 3000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-lg">
            <ShieldCheck className="w-6 h-6" />
            <h2>Meta WhatsApp Business Cloud API &amp; Vercel Deployment Guide</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Configure your Meta WhatsApp Access Token, Phone Number ID, Webhook Callback URL, and export 1-click code for deploying to Vercel!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://developers.facebook.com/apps"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow"
          >
            <Globe className="w-4 h-4" />
            <span>Meta Developer Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Meta Webhook URL & Credentials */}
        <div className="lg:col-span-6 space-y-6">
          {/* Webhook URLs Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Server className="w-4 h-4 text-cyan-400" />
              1. Meta Webhook Configuration Parameters
            </h3>

            {/* Webhook URL Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Callback URL (Copy &amp; Paste in Meta Dashboard):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={webhookUrl}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-amber-300 focus:outline-none"
                />
                <button
                  onClick={handleCopyWebhook}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 shrink-0 transition-colors"
                >
                  {copiedWebhook ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedWebhook ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Verify Token Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Verify Token (Default):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={verifyToken}
                  onChange={(e) => setVerifyToken(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-cyan-300 focus:outline-none"
                />
                <button
                  onClick={handleCopyVerifyToken}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs flex items-center gap-1 shrink-0 transition-colors"
                >
                  {copiedVerify ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy</span>
                </button>
              </div>
            </div>
          </div>

          {/* Meta Access Credentials Input */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Key className="w-4 h-4 text-amber-400" />
              2. Your Meta WhatsApp API Credentials
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  WhatsApp Phone Number ID:
                </label>
                <input
                  type="text"
                  placeholder="e.g. 104859201948..."
                  value={phoneId}
                  onChange={(e) => setPhoneId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  System User / Permanent Access Token (Bearer):
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. EAAG..."
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Owner WhatsApp Number (for receiving enquiry notifications):
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-bold bg-slate-950 px-3 py-2 rounded-xl border border-slate-700 text-xs">
                    +91
                  </span>
                  <input
                    type="text"
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-emerald-400 font-bold focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveMetaCredentials}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow"
              >
                Save Meta Credentials
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Vercel Serverless Export Code */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Rocket className="w-4 h-4 text-emerald-400" />
                Vercel Serverless Deployment Exporter
              </h3>

              <button
                onClick={handleCopyVercelCode}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow"
              >
                {copiedVercelCode ? <Check className="w-3.5 h-3.5" /> : <Code className="w-3.5 h-3.5" />}
                <span>{copiedVercelCode ? 'Copied Vercel Code' : 'Copy Vercel Code'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              If you want to deploy this chatbot to Vercel, copy the code below into <code className="text-amber-300 font-mono">api/webhook.js</code> in your Vercel project:
            </p>

            <div className="bg-slate-950 rounded-xl p-3 border border-slate-800">
              <pre className="text-[11px] font-mono text-cyan-300 max-h-72 overflow-y-auto whitespace-pre leading-relaxed scrollbar-thin">
                {vercelExport?.vercelWebhookJs || '// Loading Vercel exporter code...'}
              </pre>
            </div>

            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
              <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Vercel Deployment Checklist:
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400">
                <li>Export code to GitHub or Vercel CLI (<code className="text-slate-200">vercel deploy</code>).</li>
                <li>In Vercel Environment Variables, set:
                  <ul className="list-disc list-inside ml-4 text-emerald-300 font-mono text-[10px] mt-1">
                    <li>WHATSAPP_TOKEN = {token ? '••••••••' : 'Your access token'}</li>
                    <li>WHATSAPP_PHONE_NUMBER_ID = {phoneId || 'Your phone ID'}</li>
                    <li>WHATSAPP_VERIFY_TOKEN = {verifyToken}</li>
                    <li>OWNER_WHATSAPP_NUMBER = {ownerPhone}</li>
                  </ul>
                </li>
                <li>In Meta Developer Portal → WhatsApp → Configuration, paste your Vercel webhook URL: <code className="text-amber-300 font-mono">https://your-vercel-app.vercel.app/api/webhook</code></li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
