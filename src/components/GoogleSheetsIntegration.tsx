import React, { useState } from 'react';
import { FileSpreadsheet, Copy, Check, ExternalLink, Play, CheckCircle2, PhoneCall, Table, ShieldCheck } from 'lucide-react';
import { BotConfig } from '../types';

interface GoogleSheetsIntegrationProps {
  config: BotConfig;
  onSaveConfig: (updated: Partial<BotConfig>) => void;
}

export const GoogleSheetsIntegration: React.FC<GoogleSheetsIntegrationProps> = ({
  config,
  onSaveConfig,
}) => {
  const [webhookUrl, setWebhookUrl] = useState(config.googleSheetsWebhookUrl || '');
  const [copiedScript, setCopiedScript] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const appsScriptCode = `// Google Apps Script code for Grand Carbon WhatsApp Enquiries Auto-Sync
// 1. Open Google Sheet -> Extensions -> Apps Script
// 2. Paste this code and click Deploy -> New deployment -> Select type: Web app
// 3. Set "Execute as: Me" and "Who has access: Anyone"
// 4. Copy the Web App URL and paste it in Grand Carbon Dashboard below!

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Add Header row if empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Enquiry ID",
        "Timestamp",
        "Customer Phone",
        "Category",
        "Dimensions (L x W x T mm)",
        "Quantity",
        "Status",
        "Direct Call Link"
      ]);
    }
    
    var data = JSON.parse(e.postData.contents);
    
    var phone = data.customerPhone || "";
    var callLink = "tel:" + phone;
    
    sheet.appendRow([
      data.enquiryId || "ENQ-" + new Date().getTime(),
      data.timestamp || new Date().toISOString(),
      phone,
      data.category || "",
      data.dimensions || "N/A",
      data.quantity || "N/A",
      data.status || "New",
      callLink
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ result: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
  };

  const handleSaveWebhook = () => {
    onSaveConfig({ googleSheetsWebhookUrl: webhookUrl });
    setTestResult({ success: true, message: 'Google Sheets Webhook URL saved successfully!' });
  };

  const handleTestSync = async () => {
    if (!webhookUrl) {
      setTestResult({ success: false, message: 'Please enter a valid Google Sheets Webhook URL first.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/google-sheets/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      setIsTesting(false);

      if (data.success) {
        setTestResult({
          success: true,
          message: `Successfully sent test enquiry to Google Sheets! (${data.syncedCount} records processed)`,
        });
        onSaveConfig({ googleSheetsWebhookUrl: webhookUrl });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Failed to sync with Google Sheets URL.',
        });
      }
    } catch (err: any) {
      setIsTesting(false);
      setTestResult({
        success: false,
        message: 'Network or CORS error testing Google Sheets URL. Ensure deployment is set to "Anyone".',
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg">
            <FileSpreadsheet className="w-6 h-6" />
            <h2>Google Sheets Live Sync & Direct Call Integration</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Automatically record every incoming WhatsApp enquiry into your Google Sheet in real-time. You can view orders, track status, and click to call customers directly from Google Sheets!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://sheets.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow"
          >
            <Table className="w-4 h-4" />
            <span>Open Google Sheets</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Webhook Setup Box */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            1. Webhook Configuration
          </h3>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300 block">
              Google Apps Script Web App URL:
            </label>
            <input
              type="url"
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-amber-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
            />
            <p className="text-[11px] text-slate-500">
              Paste the Web App URL generated from Google Apps Script below.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSaveWebhook}
              className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
            >
              Save URL
            </button>

            <button
              onClick={handleTestSync}
              disabled={isTesting}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isTesting ? 'Testing Sync...' : 'Test Connection'}</span>
            </button>
          </div>

          {testResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-medium ${
                testResult.success
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                  : 'bg-rose-950/60 border-rose-800 text-rose-200'
              }`}
            >
              {testResult.message}
            </div>
          )}

          {/* Features Highlight */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
            <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5" />
              Direct Call from Google Sheets Feature
            </h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              When enquiries land in your Google Sheet, the script automatically generates a <code className="text-emerald-400 font-mono">tel:+91XXXXXXXXXX</code> column link. You can open Google Sheets on your smartphone or PC and tap the link to call the customer instantly!
            </p>
          </div>
        </div>

        {/* RIGHT: Google Apps Script 1-Click Code Exporter */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Copy className="w-4 h-4 text-amber-400" />
              2. Google Apps Script Code (Copy &amp; Paste)
            </h3>

            <button
              onClick={handleCopyScript}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all shadow"
            >
              {copiedScript ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-950 rounded-xl p-3 border border-slate-800">
            <pre className="text-[11px] font-mono text-emerald-300 max-h-72 overflow-y-auto whitespace-pre leading-relaxed scrollbar-thin">
              {appsScriptCode}
            </pre>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
            <p className="font-bold text-amber-400">Step-by-step Setup:</p>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400">
              <li>Open your Google Sheet or create a new one.</li>
              <li>Go to <strong>Extensions → Apps Script</strong>.</li>
              <li>Delete any existing text and paste the copied code above.</li>
              <li>Click <strong>Deploy → New deployment</strong>.</li>
              <li>Choose <strong>Web App</strong>, set <em>Who has access</em> to <strong>Anyone</strong>.</li>
              <li>Click <strong>Deploy</strong>, copy the Web app URL and paste it on the left!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};
