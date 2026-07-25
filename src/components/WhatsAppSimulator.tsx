import React, { useState, useEffect, useRef } from 'react';
import { Send, PhoneCall, FileText, CheckCheck, RefreshCw, ArrowRight, UserCheck, Bell, ExternalLink, Download, MessageSquare } from 'lucide-react';
import { BotConfig, WhatsAppSimMessage, Enquiry } from '../types';

interface WhatsAppSimulatorProps {
  config: BotConfig;
  onNewEnquiryCreated: (enquiry: Enquiry) => void;
}

export const WhatsAppSimulator: React.FC<WhatsAppSimulatorProps> = ({
  config,
  onNewEnquiryCreated,
}) => {
  const [customerPhone, setCustomerPhone] = useState<string>('+919876543210');
  const [inputMessage, setInputMessage] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<WhatsAppSimMessage[]>([]);
  const [ownerAlerts, setOwnerAlerts] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<string>('START');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome flow on mount
  useEffect(() => {
    resetChat();
  }, [config]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const resetChat = () => {
    setChatMessages([
      {
        id: 'msg-1',
        sender: 'system',
        text: '📱 Chatbot session initialized with Grand Carbon Meta WhatsApp API',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
    setActiveStep('START');
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg: WhatsAppSimMessage = {
      id: `usr-${Date.now()}`,
      sender: 'customer',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: customerPhone,
          message: text,
        }),
      });

      const data = await response.json();
      setIsTyping(false);

      if (data.success && data.result) {
        const { replyText, buttons, step, enquiry, ownerNotification } = data.result;

        const botMsg: WhatsAppSimMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          buttons: buttons,
          mediaUrl: (step === 'COMPLETED' || replyText.includes('Catalog')) ? config.catalogPdfUrl : undefined,
          mediaName: 'Grand_Carbon_Product_Catalog.pdf',
        };

        setChatMessages((prev) => [...prev, botMsg]);
        setActiveStep(step);

        if (enquiry) {
          onNewEnquiryCreated(enquiry);
        }

        if (ownerNotification) {
          setOwnerAlerts((prev) => [ownerNotification, ...prev]);
        }
      }
    } catch (err) {
      setIsTyping(false);
      console.error('Simulation error:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* LEFT / CENTER: WhatsApp Phone Frame Simulator */}
      <div className="lg:col-span-7 flex flex-col items-center">
        {/* Phone Container */}
        <div className="w-full max-w-md bg-slate-900 border-4 border-slate-800 rounded-[36px] shadow-2xl overflow-hidden flex flex-col h-[680px] ring-1 ring-slate-700/50">
          
          {/* Phone Speaker Notch */}
          <div className="bg-slate-900 py-2 flex justify-center items-center border-b border-slate-800">
            <div className="w-16 h-1.5 bg-slate-800 rounded-full"></div>
          </div>

          {/* WhatsApp Header */}
          <div className="bg-emerald-800 text-white px-4 py-3 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-sm shadow">
                GC
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-tight">Grand Carbon Mfg. Co.</h3>
                <p className="text-[10px] text-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                  Official WhatsApp Business API
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={resetChat}
                title="Restart Chat Session"
                className="p-1.5 hover:bg-emerald-700/60 rounded-full text-emerald-100 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Customer Number Simulator Bar */}
          <div className="bg-slate-800/90 text-slate-300 text-xs px-4 py-1.5 flex items-center justify-between border-b border-slate-700">
            <span className="flex items-center gap-1.5 text-slate-400">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Customer Phone:
            </span>
            <input
              type="text"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-amber-300 w-36 font-mono text-right focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 bg-slate-950/90 p-4 overflow-y-auto space-y-3 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'customer' ? 'items-end' : 'items-start'}`}>
                {msg.sender === 'system' ? (
                  <div className="w-full text-center my-1">
                    <span className="bg-slate-800/80 border border-slate-700/60 text-slate-400 text-[10px] px-3 py-1 rounded-full inline-block">
                      {msg.text}
                    </span>
                  </div>
                ) : (
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs shadow-md whitespace-pre-wrap leading-relaxed ${
                      msg.sender === 'customer'
                        ? 'bg-emerald-700 text-white rounded-tr-none'
                        : 'bg-slate-800 border border-slate-700 text-slate-100 rounded-tl-none'
                    }`}
                  >
                    {msg.text}

                    {/* Media Download preview if attached */}
                    {msg.mediaUrl && (
                      <div className="mt-2.5 p-2 bg-slate-900/80 border border-slate-700 rounded-xl flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <FileText className="w-5 h-5 text-amber-400 shrink-0" />
                          <div className="truncate">
                            <p className="font-semibold text-[11px] text-amber-200 truncate">{msg.mediaName || 'Grand_Carbon_Catalog.pdf'}</p>
                            <p className="text-[9px] text-slate-400">PDF Document • Grand Carbon</p>
                          </div>
                        </div>
                        <a
                          href={config.catalogPdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold p-1.5 rounded-lg text-[10px] flex items-center gap-1 shrink-0 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </a>
                      </div>
                    )}

                    {/* Interactive Button Options */}
                    {msg.buttons && (
                      <div className="mt-2.5 space-y-1.5 border-t border-slate-700/60 pt-2">
                        {msg.buttons.map((btn) => (
                          <button
                            key={btn.id}
                            onClick={() => handleSendMessage(btn.title)}
                            className="w-full text-left bg-slate-700/80 hover:bg-amber-500 hover:text-slate-950 text-amber-300 px-3 py-1.5 rounded-xl text-xs font-semibold border border-amber-500/30 transition-all flex items-center justify-between group"
                          >
                            <span>{btn.title}</span>
                            <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="mt-1 flex items-center justify-end gap-1 text-[9px] text-slate-400">
                      <span>{msg.timestamp}</span>
                      {msg.sender === 'customer' && <CheckCheck className="w-3 h-3 text-emerald-300" />}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-center gap-1.5 bg-slate-800 text-slate-400 text-xs px-3 py-2 rounded-2xl rounded-tl-none w-20 border border-slate-700 animate-pulse">
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Option Shortcuts */}
          <div className="bg-slate-900 border-t border-slate-800 p-2 flex gap-1.5 overflow-x-auto text-xs">
            <button
              onClick={() => handleSendMessage('Hi')}
              className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-2.5 py-1 rounded-lg shrink-0 transition-colors"
            >
              👋 Hi / Menu
            </button>
            <button
              onClick={() => handleSendMessage('1')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-2.5 py-1 rounded-lg shrink-0 transition-colors"
            >
              1️⃣ DC Motor Brush
            </button>
            <button
              onClick={() => handleSendMessage('10 x 6 x 20, 50 pcs')}
              className="bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 px-2.5 py-1 rounded-lg shrink-0 transition-colors"
            >
              📐 Send Specs (10x6x20)
            </button>
            <button
              onClick={() => handleSendMessage('5')}
              className="bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 px-2.5 py-1 rounded-lg shrink-0 transition-colors"
            >
              📞 5️⃣ Enquiry & Support
            </button>
          </div>

          {/* Input Bar */}
          <div className="bg-slate-900 border-t border-slate-800 p-3 flex items-center gap-2">
            <input
              type="text"
              placeholder="Type 'Hi' or option number (1-5)..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim()}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white p-2 rounded-xl transition-all shadow"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Real-time Workflow Explanation & Owner WhatsApp Forwarding Panel */}
      <div className="lg:col-span-5 space-y-5">
        {/* Workflow Logic Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-3">
            <Bell className="w-4 h-4" />
            <h3>Automated WhatsApp Bot Rules</h3>
          </div>

          <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <li className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <span className="font-bold text-amber-400 shrink-0">1. Greeting:</span>
              <span>Customer says <strong>Hi</strong> → Bot sends Grand Carbon welcome menu & 5 product options.</span>
            </li>
            <li className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <span className="font-bold text-amber-400 shrink-0">2. Options 1-4:</span>
              <span>Customer chooses brush type → Bot asks for <strong>Length × Width × Thickness (mm)</strong> &amp; <strong>Quantity</strong>.</span>
            </li>
            <li className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <span className="font-bold text-emerald-400 shrink-0">3. Auto Forward:</span>
              <span>When specs are submitted, bot forwards formatted alert to owner's WhatsApp (<strong>{config.ownerPhone}</strong>) &amp; Google Sheets!</span>
            </li>
            <li className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <span className="font-bold text-cyan-400 shrink-0">4. Option 5:</span>
              <span>Customer chooses Enquiry &amp; Support → Bot provides <strong>Call Link (9580868774)</strong>, Catalog PDF &amp; Price List download.</span>
            </li>
          </ul>
        </div>

        {/* Owner WhatsApp Received Notifications Feed */}
        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <MessageSquare className="w-4 h-4" />
              <h3>Simulated Owner WhatsApp Inbox (+91 {config.ownerPhone})</h3>
            </div>
            <span className="bg-emerald-950 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full border border-emerald-800">
              Live Trigger
            </span>
          </div>

          <p className="text-xs text-slate-400 mb-3">
            Messages automatically forwarded to owner number <strong>{config.ownerPhone}</strong> whenever a customer submits an enquiry:
          </p>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {ownerAlerts.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                No new enquiries received yet in owner inbox.
                <br />
                <span className="text-amber-400/80 mt-1 inline-block">Try selecting option 1-4 and sending size/qty in simulator!</span>
              </div>
            ) : (
              ownerAlerts.map((alert, idx) => (
                <div key={idx} className="bg-slate-950 border-l-4 border-emerald-500 rounded-xl p-3.5 text-xs text-slate-200 font-mono shadow">
                  <div className="flex items-center justify-between text-[10px] text-emerald-400 font-sans mb-1.5 font-semibold">
                    <span>FORWARDED TO OWNER ({config.ownerPhone})</span>
                    <span>Just now</span>
                  </div>
                  <pre className="whitespace-pre-wrap font-mono text-[11px] text-emerald-200 leading-snug">
                    {alert}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
