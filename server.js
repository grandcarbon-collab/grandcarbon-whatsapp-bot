import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 10000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || process.env.META_VERIFY_TOKEN || process.env.WHATSAPP_VERIFY_TOKEN || 'grand_carbon_verify_123';
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || process.env.META_ACCESS_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN || '';
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || process.env.META_PHONE_NUMBER_ID || '941937408996841';
const ADMIN_NUMBER = process.env.ADMIN_NUMBER || process.env.OWNER_WHATSAPP_NUMBER || '919580868774';

// In-memory conversation state for customer interaction
const userSessions = new Map();

// Helper to send text message via Meta WhatsApp Graph API
async function sendWhatsAppMessage(toPhone, messageBody) {
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
    console.error('❌ Missing WHATSAPP_TOKEN or PHONE_NUMBER_ID in environment variables.');
    return;
  }

  const cleanPhone = toPhone.replace(/[^0-9]/g, '');
  const url = `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`;

  try {
    const response = await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'text',
        text: {
          preview_url: false,
          body: messageBody,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log(`✅ Message sent to ${cleanPhone}:`, response.data?.messages?.[0]?.id || 'OK');
  } catch (error) {
    console.error(`❌ Error sending message to ${cleanPhone}:`, error.response?.data || error.message);
  }
}

// Category Mapping
const CATEGORIES = {
  '1': 'DC Motor Carbon Brush',
  '2': 'AC Motor Carbon Brush',
  '3': 'Carbon Vane & Fiber Vane',
  '4': 'Industrial Carbon Brush',
  '5': 'Any Enquiry & Support',
};

// Main Bot Flow Handler
async function handleIncomingMessage(fromPhone, incomingText, senderName = 'Customer') {
  const cleanPhone = '+' + fromPhone.replace(/[^0-9]/g, '');
  const trimmed = incomingText.trim();
  let session = userSessions.get(cleanPhone);

  const welcomeMenu = `Hello 👋\n\nWelcome to Grand Carbon Manufacturing Company\nLucknow, Uttar Pradesh, India\n\nPlease choose an option.\n\n1️⃣ DC Motor Carbon Brush\n2️⃣ AC Motor Carbon Brush\n3️⃣ Carbon Vane & Fiber Vane\n4️⃣ Industrial Carbon Brush\n5️⃣ Any Enquiry & Support`;

  // Option 1, 2, 3, 4 selection
  if (['1', '2', '3', '4'].includes(trimmed)) {
    const selectedCat = CATEGORIES[trimmed];
    userSessions.set(cleanPhone, {
      step: 'AWAITING_SPECS',
      category: selectedCat,
    });

    const reply = `Kindly share\n\nLength × Width × Thickness (mm)\nQuantity Required\n\nExample\n12.5 × 6.3 × 4 mm\nQuantity : 100 Pair`;
    await sendWhatsAppMessage(cleanPhone, reply);
    return;
  }

  // Option 5 selection
  if (trimmed === '5') {
    userSessions.delete(cleanPhone);
    const reply = `Please call us\n+91 9580868774\n\nand also send\nhttps://wa.me/919580868774`;
    await sendWhatsAppMessage(cleanPhone, reply);

    // Notify Admin about support request
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
    const timeStr = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });

    const adminMsg = `NEW ENQUIRY\n\nCustomer\n${cleanPhone}\n\nCategory\nAny Enquiry & Support\n\nRequirement\nCustomer requested phone call / direct support link.\n\nDate\n${dateStr}\n\nTime\n${timeStr}`;
    await sendWhatsAppMessage(ADMIN_NUMBER, adminMsg);
    return;
  }

  // Customer is providing size and quantity after choosing 1, 2, 3, or 4
  if (session && session.step === 'AWAITING_SPECS') {
    const category = session.category;
    userSessions.delete(cleanPhone);

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
    const timeStr = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' });

    // Send confirmation to customer
    const customerAck = `Thank you for sharing your requirements! 🙏\nOur technical team at Grand Carbon Manufacturing Co. will review your specification and get back to you shortly.\n\nFor urgent assistance, call us: +91 9580868774`;
    await sendWhatsAppMessage(cleanPhone, customerAck);

    // Send instant alert to Admin (+919580868774)
    const adminMsg = `NEW ENQUIRY\n\nCustomer\n${cleanPhone}\n\nCategory\n${category}\n\nRequirement\n${trimmed}\n\nDate\n${dateStr}\n\nTime\n${timeStr}`;
    await sendWhatsAppMessage(ADMIN_NUMBER, adminMsg);
    return;
  }

  // Default / Menu reply
  userSessions.set(cleanPhone, { step: 'MAIN_MENU' });
  await sendWhatsAppMessage(cleanPhone, welcomeMenu);
}

// Health Check Endpoint
app.get('/', (req, res) => {
  res.status(200).send('Grand Carbon WhatsApp Bot Running');
});

// Meta Webhook Verification (GET /webhook, /api/webhook, /api/whatsapp/webhook)
const verifyWebhookHandler = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log(`🔍 Webhook verification request received. Mode: ${mode}, Token: ${token}`);

  const isTokenValid =
    token === VERIFY_TOKEN ||
    token === 'grand_carbon_verify_123' ||
    token === 'grandcarbon_verify_123' ||
    token === process.env.VERIFY_TOKEN ||
    token === process.env.META_VERIFY_TOKEN;

  if (mode === 'subscribe' && isTokenValid) {
    console.log('✅ Webhook verified successfully!');
    return res.status(200).send(String(challenge || 'OK'));
  } else {
    console.error('❌ Verification failed. Token mismatch.');
    return res.status(403).send('Forbidden - Verify Token Mismatch');
  }
};

app.get('/webhook', verifyWebhookHandler);
app.get('/api/webhook', verifyWebhookHandler);
app.get('/api/whatsapp/webhook', verifyWebhookHandler);

// Meta Incoming Messages Endpoint (POST /webhook, /api/webhook, /api/whatsapp/webhook)
const incomingWebhookHandler = async (req, res) => {
  try {
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
      // Respond to Meta immediately with HTTP 200 OK
      res.status(200).send('EVENT_RECEIVED');

      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const messages = value?.messages;

      if (messages && messages.length > 0) {
        const message = messages[0];
        const from = message.from;
        const contactName = value?.contacts?.[0]?.profile?.name || 'Customer';

        let text = '';
        if (message.type === 'text') {
          text = message.text?.body || '';
        } else if (message.type === 'interactive') {
          text = message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || '';
        } else if (message.type === 'button') {
          text = message.button?.text || '';
        }

        if (text) {
          console.log(`💬 Incoming message from ${from} (${contactName}): "${text}"`);
          await handleIncomingMessage(from, text, contactName);
        }
      }
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error('❌ Error handling webhook event:', error);
  }
};

app.post('/webhook', incomingWebhookHandler);
app.post('/api/webhook', incomingWebhookHandler);
app.post('/api/whatsapp/webhook', incomingWebhookHandler);

// 404 Handler
app.use((req, res) => {
  res.status(404).send('Endpoint Not Found');
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Grand Carbon WhatsApp Bot is running on port ${PORT}`);
});
