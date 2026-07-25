import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { WhatsAppSimulator } from './components/WhatsAppSimulator';
import { CatalogViewer } from './components/CatalogViewer';
import { EnquiryDashboard } from './components/EnquiryDashboard';
import { GoogleSheetsIntegration } from './components/GoogleSheetsIntegration';
import { MetaSetupGuide } from './components/MetaSetupGuide';
import { BotFlowConfigurator } from './components/BotFlowConfigurator';
import { BotConfig, Enquiry } from './types';
import { defaultBotConfig, sampleEnquiries } from './data/initialData';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('simulator');
  const [config, setConfig] = useState<BotConfig>(defaultBotConfig);
  const [enquiries, setEnquiries] = useState<Enquiry[]>(sampleEnquiries);
  const [loading, setLoading] = useState<boolean>(true);

  // Load configuration & enquiries on mount
  useEffect(() => {
    async function loadData() {
      try {
        const configRes = await fetch('/api/config');
        if (configRes.ok) {
          const configData = await configRes.json();
          if (configData.config) {
            setConfig(configData.config);
          }
        }

        const enquiriesRes = await fetch('/api/enquiries');
        if (enquiriesRes.ok) {
          const enquiriesData = await enquiriesRes.json();
          if (enquiriesData.enquiries) {
            setEnquiries(enquiriesData.enquiries);
          }
        }
      } catch (err) {
        console.error('Error fetching initial app data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Save config changes
  const handleSaveConfig = async (updated: Partial<BotConfig>) => {
    const newConfig = { ...config, ...updated };
    setConfig(newConfig);

    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error('Failed to save config to server:', err);
    }
  };

  // Add new enquiry from simulator or external trigger
  const handleNewEnquiryCreated = (newEnquiry: Enquiry) => {
    setEnquiries((prev) => [newEnquiry, ...prev]);
  };

  // Update enquiry status
  const handleUpdateStatus = async (id: string, status: Enquiry['status'], notes?: string) => {
    setEnquiries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status, notes: notes !== undefined ? notes : e.notes } : e))
    );

    try {
      await fetch(`/api/enquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });
    } catch (err) {
      console.error('Failed to update enquiry status:', err);
    }
  };

  // Delete enquiry
  const handleDeleteEnquiry = async (id: string) => {
    setEnquiries((prev) => prev.filter((e) => e.id !== id));

    try {
      await fetch(`/api/enquiries/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to delete enquiry:', err);
    }
  };

  // Trigger Google Sheets sync
  const handleSyncGoogleSheets = async (id?: string) => {
    try {
      const res = await fetch('/api/google-sheets/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enquiryId: id }),
      });
      const data = await res.json();
      if (data.success && data.enquiries) {
        setEnquiries(data.enquiries);
      }
    } catch (err) {
      console.error('Error syncing with Google Sheets:', err);
    }
  };

  // Refresh enquiries list
  const handleRefreshEnquiries = async () => {
    try {
      const res = await fetch('/api/enquiries');
      if (res.ok) {
        const data = await res.json();
        if (data.enquiries) {
          setEnquiries(data.enquiries);
        }
      }
    } catch (err) {
      console.error('Failed to refresh enquiries:', err);
    }
  };

  const newEnquiriesCount = enquiries.filter((e) => e.status === 'New').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400 font-medium">Initializing Grand Carbon WhatsApp Bot...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        config={config}
        enquiriesCount={enquiries.length}
        newEnquiriesCount={newEnquiriesCount}
      />

      <main className="flex-1 py-6">
        {activeTab === 'simulator' && (
          <WhatsAppSimulator
            config={config}
            onNewEnquiryCreated={handleNewEnquiryCreated}
          />
        )}

        {activeTab === 'catalog' && (
          <CatalogViewer
            config={config}
            onSelectCategoryForChat={() => setActiveTab('simulator')}
          />
        )}

        {activeTab === 'dashboard' && (
          <EnquiryDashboard
            enquiries={enquiries}
            config={config}
            onUpdateStatus={handleUpdateStatus}
            onDeleteEnquiry={handleDeleteEnquiry}
            onSyncGoogleSheets={handleSyncGoogleSheets}
            onRefreshEnquiries={handleRefreshEnquiries}
          />
        )}

        {activeTab === 'sheets' && (
          <GoogleSheetsIntegration
            config={config}
            onSaveConfig={handleSaveConfig}
          />
        )}

        {activeTab === 'meta-setup' && (
          <MetaSetupGuide
            config={config}
            onSaveConfig={handleSaveConfig}
          />
        )}

        {activeTab === 'config' && (
          <BotFlowConfigurator
            config={config}
            onSaveConfig={handleSaveConfig}
          />
        )}
      </main>

      <footer className="bg-slate-900 border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© Grand Carbon Manufacturing Company, Lucknow, Uttar Pradesh, India. All rights reserved.</span>
          <span className="text-amber-500/80 font-mono text-[11px]">Meta WhatsApp Business Cloud API v21.0</span>
        </div>
      </footer>
    </div>
  );
}
