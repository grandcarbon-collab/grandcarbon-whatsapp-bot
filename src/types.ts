export type ProductCategoryKey = 'dc_motor' | 'ac_motor' | 'vane' | 'industrial' | 'support';

export interface Enquiry {
  id: string;
  customerPhone: string;
  customerName?: string;
  category: string;
  categoryKey: ProductCategoryKey;
  dimensions?: string;
  quantity?: string;
  rawMessage?: string;
  timestamp: string;
  status: 'New' | 'Contacted' | 'In Progress' | 'Completed' | 'Cancelled';
  notes?: string;
  syncedToGoogleSheets?: boolean;
}

export interface BotConfig {
  companyName: string;
  location: string;
  supportPhone: string;
  ownerPhone: string;
  metaAccessToken: string;
  metaPhoneNumberId: string;
  metaVerifyToken: string;
  googleSheetsWebhookUrl: string;
  catalogPdfUrl: string;
  priceListPdfUrl: string;
  welcomeMessage: string;
  specPromptMessage: string;
  supportMessage: string;
  autoForwardToOwner: boolean;
}

export interface WhatsAppSimMessage {
  id: string;
  sender: 'customer' | 'bot' | 'system';
  text: string;
  timestamp: string;
  buttons?: { id: string; title: string }[];
  mediaUrl?: string;
  mediaType?: 'pdf' | 'image';
  mediaName?: string;
}

export interface ChatSessionState {
  phone: string;
  step: 'AWAITING_OPTION' | 'AWAITING_SPECS' | 'COMPLETED';
  selectedCategory?: string;
  selectedCategoryKey?: ProductCategoryKey;
  dimensions?: string;
  quantity?: string;
}
