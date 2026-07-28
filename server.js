const express = require('express');
const crypto = require('crypto');

const app = express();

// Capture raw body for signature verification if needed
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'TEST_TOKEN';
const APP_SECRET = process.env.APP_SECRET || ''; // Optional: for X-Hub-Signature-256 verification

function verifySignature(req) {
  if (!APP_SECRET) return true; // skip verification if no secret set
  const signature = req.get('x-hub-signature-256') || req.get('x-hub-signature');
  if (!signature) return false;
  const hash = 'sha256=' + crypto.createHmac('sha256', APP_SECRET).update(req.rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
}

function webhookHandler(req, res) {
  try {
    if (req.method === 'GET') {
      // Facebook/WhatsApp verification query params
      const mode = req.query['hub.mode'] || req.query['hub.mode'];
      const token = req.query['hub.verify_token'] || req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'] || req.query['hub.challenge'];

      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('Webhook verified, responding with challenge:', challenge);
        return res.status(200).send(challenge);
      } else {
        console.warn('Webhook verification failed', { mode, token });
        return res.status(403).send('Forbidden');
      }
    }

    if (req.method === 'POST') {
      // Optional signature verification
      if (APP_SECRET && !verifySignature(req)) {
        console.warn('Signature verification failed');
        return res.status(401).send('Invalid signature');
      }

      // Process the webhook payload
      const body = req.body;
      console.log('Incoming webhook POST:', JSON.stringify(body).slice(0, 1000));
      // TODO: Add your message handling logic here

      // Acknowledge receipt
      return res.sendStatus(200);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).send(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error('Webhook handler error', err);
    return res.status(500).send('Server error');
  }
}

// Mount the same handler on both routes
app.get(['/webhook', '/api/webhook'], webhookHandler);
app.post(['/webhook', '/api/webhook'], webhookHandler);

// Simple health check
app.get('/', (req, res) => res.send('OK'));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
