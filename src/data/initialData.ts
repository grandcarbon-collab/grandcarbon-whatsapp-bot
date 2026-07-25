import { BotConfig, Enquiry } from '../types';

export const defaultBotConfig: BotConfig = {
  companyName: 'Grand Carbon Manufacturing Company',
  location: '395/15 Kashmiri Mohallah Road Area, Chowk, Lucknow - 226003 (U.P.) INDIA',
  supportPhone: '9580868774',
  ownerPhone: '9580868774',
  metaAccessToken: '',
  metaPhoneNumberId: '',
  metaVerifyToken: 'grand_carbon_verify_123',
  googleSheetsWebhookUrl: '',
  catalogPdfUrl: 'https://www.grandcarbon.in/Grand_Carbon_Product_Catalog.pdf',
  priceListPdfUrl: 'https://www.grandcarbon.in/Grand_Carbon_Price_List.pdf',
  welcomeMessage: `👋 Welcome to Grand Carbon.

Hello! This is Grand Carbon Manufacturing Company,
Lucknow, Uttar Pradesh, India.
(O.E.M. Manufacturer of Carbon Brushes & Graphite Solutions since 1995)

Please choose one option:

1️⃣ DC Motor Carbon Brush
2️⃣ AC Motor Carbon Brush
3️⃣ Carbon Vane & Fiber Vane
4️⃣ Industrial Carbon Brush
5️⃣ Any Enquiry & Support`,
  specPromptMessage: `Kindly share:

✔ Length × Width × Thickness (mm)

✔ Quantity Required`,
  supportMessage: `📞 Call us now

9580868774

📍 Address: 395/15 Kashmiri Mohallah Road Area, Chowk, Lucknow - 226003 (U.P.)
📧 Email: care@grandcarbon.com | grandcarbon@gmail.com
🌐 Website: www.grandcarbon.in`,
  autoForwardToOwner: true,
};

export const sampleEnquiries: Enquiry[] = [
  {
    id: 'ENQ-1001',
    customerPhone: '+919876543210',
    customerName: 'Rahul Verma (Lucknow Electric)',
    category: 'DC Motor Carbon Brush',
    categoryKey: 'dc_motor',
    dimensions: '10 x 6 x 20 mm',
    quantity: '50 pcs',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    status: 'New',
    notes: 'Urgent requirement for industrial motor repair in Transport Nagar',
    syncedToGoogleSheets: true,
  },
  {
    id: 'ENQ-1002',
    customerPhone: '+919415012345',
    customerName: 'Sanjay Kumar (Kanpur Motors)',
    category: 'Carbon Vane & Fiber Vane',
    categoryKey: 'vane',
    dimensions: '85 x 45 x 4 mm',
    quantity: '12 sets',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    status: 'Contacted',
    notes: 'Requested price list sent via WhatsApp. Followup scheduled.',
    syncedToGoogleSheets: true,
  },
  {
    id: 'ENQ-1003',
    customerPhone: '+919120987654',
    customerName: 'Amit Singh',
    category: 'AC Motor Carbon Brush',
    categoryKey: 'ac_motor',
    dimensions: '16 x 10 x 32 mm',
    quantity: '100 pcs',
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    status: 'In Progress',
    notes: 'Sample requested before bulk order.',
    syncedToGoogleSheets: false,
  },
  {
    id: 'ENQ-1004',
    customerPhone: '+919580868774',
    customerName: 'Grand Carbon Direct Support',
    category: 'Any Enquiry & Support',
    categoryKey: 'support',
    dimensions: 'N/A',
    quantity: '1',
    timestamp: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
    status: 'Completed',
    notes: 'Direct support call made to customer.',
    syncedToGoogleSheets: true,
  }
];

export const productCategories = [
  { id: '1', key: 'dc_motor', label: '1️⃣ DC Motor Carbon Brush', title: 'DC Motor Carbon Brush' },
  { id: '2', key: 'ac_motor', label: '2️⃣ AC Motor Carbon Brush', title: 'AC Motor Carbon Brush' },
  { id: '3', key: 'vane', label: '3️⃣ Carbon Vane & Fiber Vane', title: 'Carbon Vane & Fiber Vane' },
  { id: '4', key: 'industrial', label: '4️⃣ Industrial Carbon Brush', title: 'Industrial Carbon Brush' },
  { id: '5', key: 'support', label: '5️⃣ Any Enquiry & Support', title: 'Any Enquiry & Support' },
];
