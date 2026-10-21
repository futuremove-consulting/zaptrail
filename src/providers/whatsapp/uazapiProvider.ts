/** ZT-012 — UAZAPI Provider Spike
 * Ponytail: spike implementation using UAZAPI external provider, English identifiers only
 * Build-first: MockProvider first, spike UAZAPI depois, alternativa se falhar
 * 
 * Validates UAZAPI external provider against 8 critical questions from diagnostic.
 * If spike passes → real connection limited (ZT-013); if fails → continue MockProvider.
 */

import { WhatsAppProvider, WhatsAppMessage, WhatsAppChat, WhatsAppProviderStatusDetails } from './provider';

// UAZAPI-specific types
export type UAZAPIAccountSid = string;
export type UAZAPIAuthToken = string;
export type UAZAPIApplicationSid = string;
export type UAZAPIWebhookUrl = string;
export type UAZAPIApiUrl = string;

export interface UAZAPIConfig {
  accountSid: UAZAPIAccountSid;
  authToken: UAZAPIAuthToken;
  applicationSid: UAZAPIApplicationSid;
  webhookUrl: UAZAPIWebhookUrl;
  apiUrl: UAZAPIApiUrl;
}

// Spike validation results for each of the 8 critical questions
export type UAZAPIQuestionStatus = 'pass' | 'fail' | 'unknown';

export interface UAZAPISpikeResults {
  // Q1: Provider supports agent number and source as separate connections
  supportsSeparateConnections: UAZAPIQuestionStatus;
  
  // Q2: Pairing code method available and stable
  pairingCodeStable: UAZAPIQuestionStatus;
  
  // Q3: Reliable connection, message, and disconnection events
  reliableEvents: UAZAPIQuestionStatus;
  
  // Q4: Distinguish 1:1 conversations from groups with sufficient history
  distinguishConversations: UAZAPIQuestionStatus;
  
  // Q5: Session reconnects and can be revoked without residual access
  sessionRevokeClean: UAZAPIQuestionStatus;
  
  // Q6: Webhook can be authenticated, deduplicated, processed publicly
  webhookAuthDedup: UAZAPIQuestionStatus;
  
  // Q7: Recommended account compatible with pilot profile
  accountCompatible: UAZAPIQuestionStatus;
  
  // Q8: Real cost per instance, device, volume, and retention
  costAssessed: UAZAPIQuestionStatus;
}

// Mock fallback for spike when UAZAPI is not available
export class UAZAPIMockProvider implements WhatsAppProvider {
  private status: WhatsAppProviderStatusDetails = {
    status: 'disconnected',
    connectedAt: null,
  };

  async initialize(): Promise<void> {
    this.status = { status: 'disconnected', connectedAt: null };
  }

  async status(): Promise<WhatsAppProviderStatusDetails> {
    return this.status;
  }

  async connect(): Promise<void> {
    // No-op in mock mode
  }

  async disconnect(): Promise<void> {
    this.status = { status: 'disconnected', connectedAt: null };
  }

  async getChats(): Promise<WhatsAppChat[]> {
    return [];
  }

  async getChatMessages(chatId: string, limit?: number): Promise<WhatsAppMessage[]> {
    return [];
  }

  async getRecentMessages(limit?: number): Promise<WhatsAppMessage[]> {
    return [];
  }

  async verifyWebhookSignature(request: Request): Promise<boolean> {
    return true; // mock
  }

  async handleWebhook(request: Request): Promise<any> {
    return {}; // no-op
  }

  async verifyPairingCode(code: string): Promise<boolean> {
    return true; // mock
  }

  async getPairingUrl(): Promise<string> {
    return 'https://wa.me'; // mock
  }
}