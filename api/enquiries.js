// Vercel Serverless Function: /api/enquiries.js
let enquiriesStore = [
  {
    id: 'ENQ-1001',
    customerPhone: '+919876543210',
    customerName: 'Rajesh Kumar',
    category: 'DC Motor Carbon Brush',
    categoryKey: 'dc_motor',
    dimensions: '25 x 12.5 x 32 mm',
    quantity: '50 pcs',
    timestamp: new Date().toISOString(),
    status: 'New',
    notes: 'Customer requires quote for industrial batch.',
    syncedToGoogleSheets: true,
  }
];

export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ enquiries: enquiriesStore });
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const newEnquiry = {
      id: `ENQ-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      status: 'New',
      ...body
    };
    enquiriesStore.unshift(newEnquiry);
    return res.status(200).json({ success: true, enquiry: newEnquiry });
  }

  return res.status(405).send('Method Not Allowed');
}
