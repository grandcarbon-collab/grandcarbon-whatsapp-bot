// Vercel Serverless Function: /api/webhook.js
// Handles WhatsApp Meta Cloud API Webhook verification and incoming message processing on Vercel

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || process.env.VERIFY_TOKEN || "grandcarbon_verify_123";
const OWNER_PHONE = process.env.OWNER_WHATSAPP_NUMBER || "9580868774";
const CATALOG_URL = "https://www.grandcarbon.in/Grand_Carbon_Product_Catalog.pdf";
const PRICE_LIST_URL = "https://www.grandcarbon.in/Grand_Carbon_Price_List.pdf";

// In-memory state tracking per user phone number
const userSessions = new Map();

export default async function handler(req, res) {
  const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || process.env.META_ACCESS_TOKEN || "";
  const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.META_PHONE_NUMBER_ID || "941937408996841";
  const SHEETS_WEBHOOK = process.env.GOOGLE_SHEETS_WEBHOOK_URL || "";

  // 1. GET: Webhook Verification for Meta Developer Portal
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    console.log(`🔍 Meta Webhook GET verification attempt. Mode: ${mode}, Token: ${token}, Challenge: ${challenge}`);

    if (mode && token) {
      const isTokenValid =
        token === VERIFY_TOKEN ||
        token === 'grandcarbon_verify_123' ||
        token === 'grand_carbon_verify_123' ||
        token === process.env.WHATSAPP_VERIFY_TOKEN ||
        token === process.env.META_VERIFY_TOKEN;

      if (mode === 'subscribe' && isTokenValid) {
        console.log('✅ Meta Webhook Verification Successful on Vercel!');
        // MUST convert challenge to String to prevent numeric status code errors in Express/Vercel
        return res.status(200).send(String(challenge || 'OK'));
      }
      console.error('❌ Verify token mismatch!');
      return res.status(403).send('Forbidden - Verify token mismatch');
    }
    return res.status(400).send('Bad Request - Missing hub parameters');
  }

  // 2. POST: Incoming Messages from Meta WhatsApp API
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      console.log('📩 Incoming Webhook Event:', JSON.stringify(body));

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
            incomingText = msg.interactive?.button_reply?.title || msg.interactive?.list_reply?.title || msg.interactive?.button_reply?.id || '';
          }

          if (incomingText) {
            console.log(`💬 Message from ${fromPhone}: "${incomingText}"`);
            await handleWorkflow(fromPhone, incomingText, WHATSAPP_TOKEN, PHONE_NUMBER_ID, OWNER_PHONE, SHEETS_WEBHOOK);
          }
        }
        return res.status(200).send('EVENT_RECEIVED');
      }
      return res.status(200).send('OK');
    } catch (e) {
      console.error('Vercel Webhook Error:', e);
      return res.status(200).send('ERROR_HANDLED');
    }
  }

  return res.status(405).send('Method Not Allowed');
}

async function sendWhatsAppMsg(toPhone, bodyText, token, phoneId, buttons = null) {
  if (!token || !phoneId) {
    console.log('ℹ️ WhatsApp Token or Phone ID missing on Vercel environment variables.');
    return;
  }

  const cleanPhone = toPhone.replace(/[^0-9]/g, '');
  const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`;

  let payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: cleanPhone,
    type: 'text',
    text: { body: bodyText }
  };

  if (buttons && Array.isArray(buttons) && buttons.length > 0) {
    if (buttons.length <= 3) {
      payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text: bodyText },
          action: {
            buttons: buttons.map(b => ({
              type: 'reply',
              reply: { id: b.id, title: b.title }
            }))
          }
        }
      };
    } else {
      payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
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
                  title: b.title.substring(0, 24)
                }))
              }
            ]
          }
        }
      };
    }
  }

  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const resData = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      console.error('❌ Meta Graph API Error:', resp.status, JSON.stringify(resData));

      // If interactive payload failed, retry sending as simple plain text!
      if (buttons && payload.type === 'interactive') {
        console.log('🔄 Retrying as plain text fallback...');
        const plainTextPayload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'text',
          text: { body: bodyText }
        };
        await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(plainTextPayload)
        });
      }
    } else {
      console.log('✅ Meta WhatsApp message sent successfully:', resData);
    }
  } catch (err) {
    console.error('Error sending WhatsApp message via Graph API:', err);
  }
}

async function handleWorkflow(fromPhone, incomingText, token, phoneId, ownerPhone, sheetsWebhook) {
  const cleanInput = incomingText.trim().toLowerCase();
  let session = userSessions.get(fromPhone);

  const welcomeMenu = `👋 Welcome to Grand Carbon.

Hello! This is Grand Carbon Manufacturing Company, Lucknow, Uttar Pradesh, India.
(O.E.M. Manufacturer of Carbon Brushes & Graphite Solutions since 1995)

Please choose one option:

1️⃣ DC Motor Carbon Brush
2️⃣ AC Motor Carbon Brush
3️⃣ Carbon Vane & Fiber Vane
4️⃣ Industrial Carbon Brush
5️⃣ Any Enquiry & Support`;

  const menuButtons = [
    { id: 'opt_1_dc', title: '1️⃣ DC Motor Brush' },
    { id: 'opt_2_ac', title: '2️⃣ AC Motor Brush' },
    { id: 'opt_3_vane', title: '3️⃣ Carbon & Fiber Vane' },
    { id: 'opt_4_ind', title: '4️⃣ Industrial Brush' },
    { id: 'opt_5_sup', title: '5️⃣ Call & Support' }
  ];

  const specPrompt = `Kindly share:

✔ Length × Width × Thickness (mm)

✔ Quantity Required`;

  // 1. Reset / Hi / Hello
  if (cleanInput === 'hi' || cleanInput === 'hello' || cleanInput === 'menu' || cleanInput === 'start') {
    userSessions.set(fromPhone, { step: 'AWAITING_OPTION' });
    await sendWhatsAppMsg(fromPhone, welcomeMenu, token, phoneId, menuButtons);
    return;
  }

  // 2. Options 1, 2, 3, 4
  if (['1', '2', '3', '4'].includes(cleanInput) || cleanInput.includes('dc motor') || cleanInput.includes('ac motor') || cleanInput.includes('vane') || cleanInput.includes('industrial')) {
    let catName = 'DC Motor Carbon Brush';
    if (cleanInput === '2' || cleanInput.includes('ac motor')) catName = 'AC Motor Carbon Brush';
    if (cleanInput === '3' || cleanInput.includes('vane')) catName = 'Carbon Vane & Fiber Vane';
    if (cleanInput === '4' || cleanInput.includes('industrial')) catName = 'Industrial Carbon Brush';

    userSessions.set(fromPhone, { step: 'AWAITING_SPECS', selectedCategory: catName });
    await sendWhatsAppMsg(fromPhone, `Selected: *${catName}*\n\n${specPrompt}`, token, phoneId);
    return;
  }

  // 3. Option 5: Support / Call
  if (cleanInput === '5' || cleanInput.includes('support') || cleanInput.includes('call')) {
    const supportMsg = `📞 Call us now

9580868774

📍 Address: 395/15 Kashmiri Mohallah Road Area, Chowk, Lucknow - 226003 (U.P.)
📧 Email: care@grandcarbon.com | grandcarbon@gmail.com
🌐 Website: www.grandcarbon.in

📄 Product Catalog:
${CATALOG_URL}

💰 Price List:
${PRICE_LIST_URL}`;

    userSessions.set(fromPhone, { step: 'COMPLETED' });
    await sendWhatsAppMsg(fromPhone, supportMsg, token, phoneId);

    // Notify owner
    const ownerNotify = `NEW ENQUIRY (Support Request)

Customer:
${fromPhone}

Action:
Customer requested callback & product info.`;

    if (ownerPhone) {
      await sendWhatsAppMsg(ownerPhone, ownerNotify, token, phoneId);
    }
    return;
  }

  // 4. Entering specifications
  if (session && session.step === 'AWAITING_SPECS') {
    const category = session.selectedCategory || 'Carbon Brush';
    userSessions.set(fromPhone, { step: 'COMPLETED' });

    const customerReply = `✅ *Thank you for sharing your requirements!*

Your enquiry for *${category}* has been submitted successfully to Grand Carbon. Our technical team will review specifications (*${incomingText}*) and get back to you shortly.

📞 Urgent query? Call: 9580868774

📄 *Product Catalog:*
${CATALOG_URL}

💰 *Price List:*
${PRICE_LIST_URL}`;

    await sendWhatsAppMsg(fromPhone, customerReply, token, phoneId);

    // Owner notification
    const ownerMsg = `NEW ENQUIRY

Customer:
${fromPhone}

Selected:
${category}

Details/Specs:
${incomingText}`;

    if (ownerPhone) {
      await sendWhatsAppMsg(ownerPhone, ownerMsg, token, phoneId);
    }

    // Google Sheets webhook sync if configured
    if (sheetsWebhook) {
      try {
        await fetch(sheetsWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            timestamp: new Date().toISOString(),
            customerPhone: fromPhone,
            category: category,
            dimensions: incomingText,
            status: 'New'
          })
        });
      } catch (e) {
        console.error('Sheets sync error:', e);
      }
    }
    return;
  }

  // Default Fallback
  await sendWhatsAppMsg(fromPhone, `Thank you for reaching Grand Carbon! Type *Hi* to see option numbers (1-5) or call 9580868774.`, token, phoneId);
}
