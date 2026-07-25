import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { defaultBotConfig, sampleEnquiries, productCategories } from './src/data/initialData.js';
import { BotConfig, Enquiry, ChatSessionState } from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory data stores (persisted during server runtime)
let botConfig: BotConfig = {
  ...defaultBotConfig,
  metaAccessToken: process.env.WHATSAPP_TOKEN || defaultBotConfig.metaAccessToken,
  metaPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || defaultBotConfig.metaPhoneNumberId,
  metaVerifyToken: process.env.WHATSAPP_VERIFY_TOKEN || defaultBotConfig.metaVerifyToken,
  ownerPhone: process.env.OWNER_WHATSAPP_NUMBER || defaultBotConfig.ownerPhone,
  googleSheetsWebhookUrl: process.env.GOOGLE_SHEETS_WEBHOOK_URL || defaultBotConfig.googleSheetsWebhookUrl,
};

let enquiriesStore: Enquiry[] = [...sampleEnquiries];

// Active sessions map: customer phone -> state
const userSessions = new Map<string, ChatSessionState>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // -------------------------------------------------------------
  // HELPER: Send WhatsApp message via Meta Cloud API
  // -------------------------------------------------------------
  async function sendMetaWhatsAppMessage(payload: any) {
    const phoneId = botConfig.metaPhoneNumberId?.trim();
    const token = botConfig.metaAccessToken?.trim();

    // Check if credentials are missing or placeholder
    if (!token || !phoneId || phoneId.includes('YOUR_') || phoneId === '123456789' || phoneId.length < 10) {
      console.log('ℹ️ Meta WhatsApp API credentials not configured or using demo ID. Skipping live Meta dispatch (Simulator active).');
      return { success: false, message: 'Meta credentials not configured or demo mode' };
    }

    const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        const errMsg = data?.error?.message || 'Meta API returned non-OK status';
        const subCode = data?.error?.error_subcode;
        console.warn(`⚠️ Meta WhatsApp API Note (${response.status} / subcode ${subCode}): ${errMsg}`);
        return { success: false, error: data?.error || errMsg };
      }
      return { success: true, data };
    } catch (err: any) {
      console.warn('⚠️ Meta WhatsApp API Network Note:', err.message);
      return { success: false, error: err.message };
    }
  }

  // Helper to send text message
  async function sendTextMessage(toPhone: string, text: string) {
    const formattedPhone = toPhone.replace(/[^0-9]/g, '');
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedPhone,
      type: 'text',
      text: { preview_url: true, body: text },
    };
    return await sendMetaWhatsAppMessage(payload);
  }

  // Helper to send interactive buttons or list
  async function sendInteractiveButtons(toPhone: string, bodyText: string, buttons: { id: string; title: string }[]) {
    const formattedPhone = toPhone.replace(/[^0-9]/g, '');

    // Meta Cloud API limits reply buttons to max 3 per message.
    // If > 3 buttons, send Meta list message format
    if (buttons.length > 3) {
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedPhone,
        type: 'interactive',
        interactive: {
          type: 'list',
          header: { type: 'text', text: 'Grand Carbon Menu' },
          body: { text: bodyText },
          footer: { text: 'Select an option below' },
          action: {
            button: 'Select Product',
            sections: [
              {
                title: 'Product Options',
                rows: buttons.map(b => ({
                  id: b.id,
                  title: b.title.substring(0, 24),
                })),
              },
            ],
          },
        },
      };
      return await sendMetaWhatsAppMessage(payload);
    }

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedPhone,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: bodyText },
        action: {
          buttons: buttons.map(b => ({
            type: 'reply',
            reply: { id: b.id, title: b.title.substring(0, 20) }, // Meta limit 20 chars
          })),
        },
      },
    };
    return await sendMetaWhatsAppMessage(payload);
  }

  // Sync enquiry to Google Sheets Webhook
  async function syncToGoogleSheets(enquiry: Enquiry) {
    if (!botConfig.googleSheetsWebhookUrl) return false;
    try {
      const res = await fetch(botConfig.googleSheetsWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'NEW_ENQUIRY',
          timestamp: enquiry.timestamp,
          enquiryId: enquiry.id,
          customerPhone: enquiry.customerPhone,
          customerName: enquiry.customerName || 'N/A',
          category: enquiry.category,
          dimensions: enquiry.dimensions || 'N/A',
          quantity: enquiry.quantity || 'N/A',
          status: enquiry.status,
          notes: enquiry.notes || '',
        }),
      });
      return res.ok;
    } catch (e) {
      console.error('Failed to sync with Google Sheets webhook:', e);
      return false;
    }
  }

  // -------------------------------------------------------------
  // CORE CHATBOT ENGINE LOGIC
  // -------------------------------------------------------------
  async function processIncomingMessage(fromPhone: string, incomingText: string) {
    const cleanPhone = fromPhone.trim();
    const textLower = incomingText.trim().toLowerCase();

    let session = userSessions.get(cleanPhone);

    // Initial state or reset triggered by "hi", "hello", "menu", "start", "1", "2", "3", "4", "5"
    const isGreeting = ['hi', 'hello', 'hey', 'start', 'menu', 'namaste', 'grand carbon', 'bot', 'help'].includes(textLower);

    // Check if user selected 1-5 directly or via interactive button
    let selectedOption: string | null = null;

    if (textLower === '1' || textLower.includes('dc motor') || textLower.includes('option_1')) {
      selectedOption = '1';
    } else if (textLower === '2' || textLower.includes('ac motor') || textLower.includes('option_2')) {
      selectedOption = '2';
    } else if (textLower === '3' || textLower.includes('carbon vane') || textLower.includes('vane') || textLower.includes('option_3')) {
      selectedOption = '3';
    } else if (textLower === '4' || textLower.includes('industrial') || textLower.includes('option_4')) {
      selectedOption = '4';
    } else if (textLower === '5' || textLower.includes('enquiry') || textLower.includes('support') || textLower.includes('call') || textLower.includes('option_5')) {
      selectedOption = '5';
    }

    let replyText = '';
    let buttonsToSend: { id: string; title: string }[] | undefined = undefined;
    let newEnquiryCreated: Enquiry | null = null;
    let ownerNotificationMessage: string | null = null;

    // SCENARIO A: User says "Hi" or resets -> Send Welcome Menu
    if (isGreeting || (!session && !selectedOption)) {
      session = {
        phone: cleanPhone,
        step: 'AWAITING_OPTION',
      };
      userSessions.set(cleanPhone, session);

      replyText = botConfig.welcomeMessage;
      buttonsToSend = [
        { id: 'opt_1_dc', title: '1️⃣ DC Motor Brush' },
        { id: 'opt_2_ac', title: '2️⃣ AC Motor Brush' },
        { id: 'opt_3_vane', title: '3️⃣ Carbon & Fiber Vane' },
        { id: 'opt_4_ind', title: '4️⃣ Industrial Brush' },
        { id: 'opt_5_sup', title: '5️⃣ Call & Support' },
      ];

      // Send to Meta WhatsApp if live
      await sendInteractiveButtons(cleanPhone, replyText, buttonsToSend);

      return {
        replyText,
        buttons: buttonsToSend,
        step: session.step,
        enquiry: null,
        ownerNotification: null,
      };
    }

    // SCENARIO B: User selected Option 1 - 4
    if (selectedOption && ['1', '2', '3', '4'].includes(selectedOption)) {
      const categoryMap: Record<string, { label: string; key: any }> = {
        '1': { label: 'DC Motor Carbon Brush', key: 'dc_motor' },
        '2': { label: 'AC Motor Carbon Brush', key: 'ac_motor' },
        '3': { label: 'Carbon Vane & Fiber Vane', key: 'vane' },
        '4': { label: 'Industrial Carbon Brush', key: 'industrial' },
      };

      const selected = categoryMap[selectedOption];
      session = {
        phone: cleanPhone,
        step: 'AWAITING_SPECS',
        selectedCategory: selected.label,
        selectedCategoryKey: selected.key,
      };
      userSessions.set(cleanPhone, session);

      replyText = botConfig.specPromptMessage;

      await sendTextMessage(cleanPhone, replyText);

      return {
        replyText,
        step: session.step,
        selectedCategory: selected.label,
        enquiry: null,
        ownerNotification: null,
      };
    }

    // SCENARIO C: User selected Option 5 (Enquiry & Support)
    if (selectedOption === '5') {
      session = {
        phone: cleanPhone,
        step: 'COMPLETED',
        selectedCategory: 'Any Enquiry & Support',
        selectedCategoryKey: 'support',
      };
      userSessions.set(cleanPhone, session);

      replyText = `${botConfig.supportMessage}

📄 *Download Product Catalog:*
${botConfig.catalogPdfUrl}

💰 *Latest Price List:*
${botConfig.priceListPdfUrl}

Click to Call directly: tel:+91${botConfig.supportPhone}`;

      // Create enquiry log for support call request
      newEnquiryCreated = {
        id: `ENQ-${Date.now().toString().slice(-4)}`,
        customerPhone: cleanPhone,
        category: 'Any Enquiry & Support',
        categoryKey: 'support',
        dimensions: 'N/A (Support Call)',
        quantity: 'N/A',
        rawMessage: incomingText,
        timestamp: new Date().toISOString(),
        status: 'New',
        notes: 'Customer requested direct phone call & support catalog',
        syncedToGoogleSheets: false,
      };

      enquiriesStore.unshift(newEnquiryCreated);
      const synced = await syncToGoogleSheets(newEnquiryCreated);
      if (synced) newEnquiryCreated.syncedToGoogleSheets = true;

      ownerNotificationMessage = `NEW ENQUIRY (Support Call)

Customer:
${cleanPhone}

Selected:
Any Enquiry & Support

Action:
Customer requested callback / price list download.`;

      // Auto forward notification to owner's WhatsApp number
      if (botConfig.autoForwardToOwner && botConfig.ownerPhone) {
        await sendTextMessage(botConfig.ownerPhone, ownerNotificationMessage);
      }

      await sendTextMessage(cleanPhone, replyText);

      return {
        replyText,
        step: session.step,
        enquiry: newEnquiryCreated,
        ownerNotification: ownerNotificationMessage,
      };
    }

    // SCENARIO D: User is in AWAITING_SPECS state and provided size & quantity!
    if (session && session.step === 'AWAITING_SPECS') {
      const specText = incomingText.trim();

      // Extract size & quantity from input
      let size = specText;
      let qty = 'Not specified';

      // Simple parsing heuristic
      if (specText.includes('qty') || specText.includes('quantity') || specText.includes('pcs') || specText.includes('pc') || specText.includes('\n')) {
        const parts = specText.split(/[\n,;]/);
        size = parts[0] || specText;
        if (parts.length > 1) {
          qty = parts.slice(1).join(', ').trim();
        }
      }

      session.dimensions = size;
      session.quantity = qty;
      session.step = 'COMPLETED';
      userSessions.set(cleanPhone, session);

      const categoryName = session.selectedCategory || 'Carbon Brush';

      newEnquiryCreated = {
        id: `ENQ-${Date.now().toString().slice(-4)}`,
        customerPhone: cleanPhone,
        category: categoryName,
        categoryKey: session.selectedCategoryKey || 'dc_motor',
        dimensions: size,
        quantity: qty,
        rawMessage: incomingText,
        timestamp: new Date().toISOString(),
        status: 'New',
        notes: `Dimensions: ${size} | Qty: ${qty}`,
        syncedToGoogleSheets: false,
      };

      enquiriesStore.unshift(newEnquiryCreated);
      const synced = await syncToGoogleSheets(newEnquiryCreated);
      if (synced) newEnquiryCreated.syncedToGoogleSheets = true;

      // Owner notification message EXACTLY as specified in user prompt!
      ownerNotificationMessage = `NEW ENQUIRY

Customer:
${cleanPhone}

Selected:
${categoryName}

Size:
${size}

Quantity:
${qty}`;

      // Auto forward notification to owner WhatsApp (9580868774)
      if (botConfig.autoForwardToOwner && botConfig.ownerPhone) {
        await sendTextMessage(botConfig.ownerPhone, ownerNotificationMessage);
      }

      // Customer confirmation reply
      replyText = `✅ *Thank you for sharing your requirements!*

Your enquiry for *${categoryName}* has been submitted successfully to Grand Carbon. Our technical team will review the specifications (*${size}*, Qty: *${qty}*) and get back to you shortly.

📞 Need urgent assistance? Call us directly at *${botConfig.supportPhone}*

📄 *Download Product Catalog:*
${botConfig.catalogPdfUrl}

💰 *Latest Price List:*
${botConfig.priceListPdfUrl}`;

      await sendTextMessage(cleanPhone, replyText);

      return {
        replyText,
        step: session.step,
        enquiry: newEnquiryCreated,
        ownerNotification: ownerNotificationMessage,
      };
    }

    // Default fallback
    replyText = `Thank you for contacting Grand Carbon! Type *Hi* to see our menu options or call us at ${botConfig.supportPhone}.`;
    await sendTextMessage(cleanPhone, replyText);

    return {
      replyText,
      step: session?.step || 'AWAITING_OPTION',
      enquiry: null,
      ownerNotification: null,
    };
  }

  // -------------------------------------------------------------
  // API ENDPOINTS
  // -------------------------------------------------------------

  // 1. Meta Webhook Verification (GET)
  const handleWebhookVerification = (req: any, res: any) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    console.log(`🔍 Meta Webhook Verification request received. Mode: ${mode}, Token: ${token}`);

    if (mode && token) {
      const isTokenValid =
        token === botConfig.metaVerifyToken ||
        token === 'grandcarbon_verify_123' ||
        token === 'grand_carbon_verify_123' ||
        token === process.env.WHATSAPP_VERIFY_TOKEN;

      if (mode === 'subscribe' && isTokenValid) {
        console.log('✅ Meta Webhook Verification SUCCESSful!');
        return res.status(200).send(String(challenge || 'OK'));
      } else {
        console.error('❌ Verify token mismatch!');
        return res.status(403).send('Forbidden - Verify token mismatch');
      }
    }
    res.status(400).send('Missing hub parameters');
  };

  app.get('/api/whatsapp/webhook', handleWebhookVerification);
  app.get('/api/webhook', handleWebhookVerification);

  // 2. Incoming Meta Webhook Receiver (POST)
  app.post('/api/whatsapp/webhook', async (req, res) => {
    try {
      const body = req.body;

      if (body.object === 'whatsapp_business_account') {
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const messages = value?.messages;

        if (messages && messages.length > 0) {
          const msg = messages[0];
          const fromPhone = '+' + msg.from;
          let incomingText = '';

          if (msg.type === 'text') {
            incomingText = msg.text?.body || '';
          } else if (msg.type === 'interactive') {
            incomingText = msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title || '';
          } else if (msg.type === 'button') {
            incomingText = msg.button?.text || '';
          }

          console.log(`💬 Incoming WhatsApp message from ${fromPhone}: "${incomingText}"`);

          // Process through chatbot engine
          await processIncomingMessage(fromPhone, incomingText);
        }

        return res.status(200).send('EVENT_RECEIVED');
      } else {
        return res.sendStatus(404);
      }
    } catch (err: any) {
      console.error('Error handling webhook event:', err);
      return res.status(500).send('Internal Server Error');
    }
  });

  // 3. Test send message via Meta API
  app.post('/api/whatsapp/send-test', async (req, res) => {
    const { toPhone, text } = req.body;
    if (!toPhone || !text) {
      return res.status(400).json({ error: 'toPhone and text required' });
    }
    const result = await sendTextMessage(toPhone, text);
    res.json(result);
  });

  // 4. In-App WhatsApp Chat Simulator Endpoint
  app.post('/api/simulate', async (req, res) => {
    const { phone, message } = req.body;
    if (!phone || !message) {
      return res.status(400).json({ error: 'phone and message required' });
    }

    const result = await processIncomingMessage(phone, message);
    res.json({
      success: true,
      result,
      allEnquiries: enquiriesStore,
    });
  });

  // 5. Bot Config API
  app.get('/api/config', (req, res) => {
    res.json({
      config: botConfig,
      webhookUrl: `${process.env.APP_URL || 'http://localhost:3000'}/api/whatsapp/webhook`,
    });
  });

  app.post('/api/config', (req, res) => {
    botConfig = { ...botConfig, ...req.body };
    res.json({ success: true, config: botConfig });
  });

  // 6. Enquiries Management API
  app.get('/api/enquiries', (req, res) => {
    res.json({ enquiries: enquiriesStore });
  });

  app.post('/api/enquiries', (req, res) => {
    const newEnquiry: Enquiry = {
      id: `ENQ-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      status: 'New',
      ...req.body,
    };
    enquiriesStore.unshift(newEnquiry);
    res.json({ success: true, enquiry: newEnquiry });
  });

  app.put('/api/enquiries/:id', (req, res) => {
    const { id } = req.params;
    const index = enquiriesStore.findIndex(e => e.id === id);
    if (index !== -1) {
      enquiriesStore[index] = { ...enquiriesStore[index], ...req.body };
      res.json({ success: true, enquiry: enquiriesStore[index] });
    } else {
      res.status(404).json({ error: 'Enquiry not found' });
    }
  });

  app.delete('/api/enquiries/:id', (req, res) => {
    const { id } = req.params;
    enquiriesStore = enquiriesStore.filter(e => e.id !== id);
    res.json({ success: true, id });
  });

  // 7. Google Sheets Webhook Manual Trigger API
  app.post('/api/google-sheets/sync', async (req, res) => {
    const { enquiryId } = req.body;
    let targetEnquiries = enquiriesStore;
    if (enquiryId) {
      targetEnquiries = enquiriesStore.filter(e => e.id === enquiryId);
    }

    if (!botConfig.googleSheetsWebhookUrl) {
      return res.status(400).json({ error: 'Google Sheets Webhook URL is not configured.' });
    }

    let successCount = 0;
    for (const enq of targetEnquiries) {
      const synced = await syncToGoogleSheets(enq);
      if (synced) {
        enq.syncedToGoogleSheets = true;
        successCount++;
      }
    }

    res.json({
      success: true,
      syncedCount: successCount,
      total: targetEnquiries.length,
      enquiries: enquiriesStore,
    });
  });

  // 8. Vercel Serverless Export Helper API
  app.get('/api/export/vercel', (req, res) => {
    const vercelWebhookJs = `// Vercel Serverless Function: api/webhook.js
// Paste this in your Vercel project at /api/webhook.js

export default async function handler(req, res) {
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "${botConfig.metaVerifyToken}";
  const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || "${botConfig.metaAccessToken}";
  const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "${botConfig.metaPhoneNumberId}";
  const OWNER_PHONE = process.env.OWNER_WHATSAPP_NUMBER || "${botConfig.ownerPhone}";
  const GOOGLE_SHEETS_WEBHOOK = process.env.GOOGLE_SHEETS_WEBHOOK_URL || "${botConfig.googleSheetsWebhookUrl}";

  // GET: Webhook Verification
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        return res.status(200).send(challenge);
      }
      return res.status(403).send('Forbidden');
    }
    return res.status(400).send('Bad Request');
  }

  // POST: Webhook Messages
  if (req.method === 'POST') {
    try {
      const body = req.body;
      if (body.object === 'whatsapp_business_account') {
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const messages = value?.messages;

        if (messages && messages.length > 0) {
          const msg = messages[0];
          const from = '+' + msg.from;
          let text = '';
          if (msg.type === 'text') text = msg.text?.body || '';
          if (msg.type === 'interactive') text = msg.interactive?.button_reply?.title || '';

          // Workflow handling logic
          await handleWhatsAppWorkflow(from, text, WHATSAPP_TOKEN, PHONE_NUMBER_ID, OWNER_PHONE, GOOGLE_SHEETS_WEBHOOK);
        }
        return res.status(200).send('EVENT_RECEIVED');
      }
      return res.status(404).send('Not Found');
    } catch (e) {
      console.error(e);
      return res.status(500).send('Server Error');
    }
  }
}

async function handleWhatsAppWorkflow(fromPhone, text, token, phoneId, ownerPhone, sheetsWebhook) {
  const cleanText = text.trim().toLowerCase();
  const graphUrl = \`https://graph.facebook.com/v21.0/\${phoneId}/messages\`;

  async function sendMsg(bodyMsg) {
    if (!token || !phoneId) return;
    await fetch(graphUrl, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${token}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: fromPhone.replace(/[^0-9]/g, ''),
        type: 'text',
        text: { body: bodyMsg }
      })
    });
  }

  if (cleanText === '1' || cleanText.includes('dc motor')) {
    await sendMsg(\`Kindly share:\\n\\n✔ Length × Width × Thickness (mm)\\n\\n✔ Quantity Required\`);
  } else if (cleanText === '5' || cleanText.includes('support')) {
    await sendMsg(\`📞 Call us now\\n\\n9580868774\\n\\nCatalog: ${botConfig.catalogPdfUrl}\\nPrice List: ${botConfig.priceListPdfUrl}\`);
  } else {
    await sendMsg(\`${botConfig.welcomeMessage.replace(/\n/g, '\\n')}\`);
  }
}`;

    const vercelJson = `{
  "version": 2,
  "builds": [
    { "src": "api/*.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api/webhook", "dest": "/api/webhook.js" }
  ]
}`;

    res.json({
      vercelWebhookJs,
      vercelJson,
      instructions: [
        '1. Create a GitHub repo or export code to Vercel.',
        '2. Add environment variables in Vercel settings: WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_VERIFY_TOKEN, OWNER_WHATSAPP_NUMBER.',
        '3. Set Meta WhatsApp Webhook Callback URL to https://your-vercel-domain.vercel.app/api/webhook and Verify Token to your verify token.',
      ]
    });
  });

  // -------------------------------------------------------------
  // VITE & PRODUCTION STATIC SERVING
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Grand Carbon WhatsApp Chatbot Server listening on port ${PORT}`);
  });
}

startServer();
