// Vercel Serverless Function: /api/config.js
let inMemoryConfig = {
  botName: 'Grand Carbon Assistant',
  companyName: 'Grand Carbon Manufacturing Company',
  ownerPhone: '9580868774',
  welcomeMessage: '👋 Welcome to Grand Carbon Manufacturing Company, Lucknow.',
  catalogPdfUrl: 'https://www.grandcarbon.in/Grand_Carbon_Product_Catalog.pdf',
  priceListPdfUrl: 'https://www.grandcarbon.in/Grand_Carbon_Price_List.pdf',
  metaPhoneNumberId: '941937408996841',
  metaVerifyToken: 'grandcarbon_verify_123',
  googleSheetsWebhookUrl: '',
};

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      config: {
        ...inMemoryConfig,
        metaAccessToken: process.env.WHATSAPP_TOKEN || process.env.META_ACCESS_TOKEN || '',
        metaPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.META_PHONE_NUMBER_ID || '941937408996841',
        metaVerifyToken: process.env.WHATSAPP_VERIFY_TOKEN || 'grandcarbon_verify_123',
        ownerPhone: process.env.OWNER_WHATSAPP_NUMBER || '9580868774',
        googleSheetsWebhookUrl: process.env.GOOGLE_SHEETS_WEBHOOK_URL || '',
      }
    });
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    inMemoryConfig = { ...inMemoryConfig, ...body };
    return res.status(200).json({ success: true, config: inMemoryConfig });
  }

  return res.status(405).send('Method Not Allowed');
}
