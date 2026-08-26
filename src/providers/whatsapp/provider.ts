/**
 * ZT-004 — WhatsAppProvider contract
 * Ponytail: interface-first approach, English identifiers only, MockProvider first
 * Provider adapter pattern: substituiível, MockProvider antes do provider real
 */

// WhatsAppProvider Status type
export type WhatsAppProviderStatus = 'disconnected' | 'connecting' | 'connected' | 'disconnecting' | 'error';

// WhatsAppMessage interface
export interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  body: string;
  mediaUrl?: string;
  timestamp: string;
  kind: 'message' | 'status' | 'reaction' | 'typing';
  metadata?: Record<string, unknown>;
}

// WhatsAppChat interface
export interface WhatsAppChat {
  id: string;
  lastMessage?: WhatsAppMessage;
  participants: string[];
  isGroup: boolean;
  createdAt: string;
  updatedAt: string;
}

// WhatsAppProviderConfig interface
export interface WhatsAppProviderConfig {
  accountSid: string;
  authToken: string;
  applicationSid: string;
  webhookUrl: string;
  apiUrl: string;
}

// WhatsAppProviderStatus interface
export interface WhatsAppProviderStatusDetails {
  status: WhatsAppProviderStatus;
  connectedAt?: string;
  disconnectedAt?: string;
  error?: string;
}

// WhatsAppProvider interface
export interface WhatsAppProvider {
  initialize(): Promise<void>;
  status(): Promise<WhatsAppProviderStatusDetails>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getChats(): Promise<WhatsAppChat[]>;
  getChatMessages(chatId: string, limit?: number): Promise<WhatsAppMessage[]>;
  getRecentMessages(limit?: number): Promise<WhatsAppMessage[]>;
  verifyWebhookSignature(request: Request): Promise<boolean>;
  handleWebhook(request: Request): Promise<any>;
  verifyPairingCode(code: string): Promise<boolean>;
  getPairingUrl(): string;
}