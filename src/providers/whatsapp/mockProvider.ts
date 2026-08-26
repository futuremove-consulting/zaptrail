/**
 * ZT-005 — MockWhatsAppProvider implementation
 * Ponytail: minimal mock using JSON fixtures, English identifiers only, custo zero inicial
 * MockProvider first (custo zero inicial), depois spike UAZAPI, depois alternativa se falhar
 */

import { WhatsAppProvider, WhatsAppMessage, WhatsAppChat, WhatsAppProviderStatusDetails } from './provider';
import { batchExtractObjects, type ExtractedManagementObject } from '../semantic';

// Mock conversation fixtures (imported from mock-fixtures.ts for fixture data)
import {
  conversation1x1PendingTask,
  conversationGroupDecisions,
  conversationCommitment,
  conversationOpportunity,
} from '../mocks/whatsapp/mock-fixtures';

// Chat state storage
const chatsMap = new Map<string, WhatsAppChat>();
const messagesMap = new Map<string, WhatsAppMessage[]>();
const extractedObjectsMap = new Map<string, ExtractedManagementObject[]>();

/**
 * Initialize the mock provider with fixture-based data
 */
export async function initializeMockProvider(): Promise<void> {
  // Populate chats from fixtures
  chatsMap.set('conv_1x1_001', {
    id: 'conv_1x1_001',
    participants: conversation1x1PendingTask.participants,
    isGroup: conversation1x1PendingTask.isGroup,
    lastMessage: conversation1x1PendingTask.messages[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  chatsMap.set('conv_group_001', {
    id: 'conv_group_001',
    participants: conversationGroupDecisions.participants,
    isGroup: conversationGroupDecisions.isGroup,
    groupName: conversationGroupDecisions.groupName,
    lastMessage: conversationGroupDecisions.messages[conversationGroupDecisions.messages.length - 1],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  chatsMap.set('conv_commitment_001', {
    id: 'conv_commitment_001',
    participants: conversationCommitment.participants,
    isGroup: conversationCommitment.isGroup,
    lastMessage: conversationCommitment.messages[conversationCommitment.messages.length - 1],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  chatsMap.set('conv_opportunity_001', {
    id: 'conv_opportunity_001',
    participants: conversationOpportunity.participants,
    isGroup: conversationOpportunity.isGroup,
    lastMessage: conversationOpportunity.messages[conversationOpportunity.messages.length - 1],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Populate messages map
  messagesMap.set('conv_1x1_001', conversation1x1PendingTask.messages);
  messagesMap.set('conv_group_001', conversationGroupDecisions.messages);
  messagesMap.set('conv_commitment_001', conversationCommitment.messages);
  messagesMap.set('conv_opportunity_001', conversationOpportunity.messages);

  // Extract management objects from conversation messages using semantic pipeline
  extractedObjectsMap.set('conv_1x1_001', batchExtractObjects(
    conversation1x1PendingTask.messages,
    'conv_1x1_001'
  ));
  extractedObjectsMap.set('conv_group_001', batchExtractObjects(
    conversationGroupDecisions.messages,
    'conv_group_001'
  ));
  extractedObjectsMap.set('conv_commitment_001', batchExtractObjects(
    conversationCommitment.messages,
    'conv_commitment_001'
  ));
  extractedObjectsMap.set('conv_opportunity_001', batchExtractObjects(
    conversationOpportunity.messages,
    'conv_opportunity_001'
  ));
}

/**
 * Get the current provider status
 */
export async function statusMockProvider(): Promise<WhatsAppProviderStatusDetails> {
  return {
    status: 'connected',
    connectedAt: new Date().toISOString(),
  };
}

/**
 * Connect the mock provider (no-op for mock)
 */
export async function connectMockProvider(): Promise<void> {
  // No-op: mock is always "connected"
}

/**
 * Disconnect the mock provider (no-op for mock)
 */
export async function disconnectMockProvider(): Promise<void> {
  // No-op: mock is always "connected"
}

/**
 * Get all chats from the mock provider
 */
export async function getChatsMockProvider(): Promise<WhatsAppChat[]> {
  return Array.from(chatsMap.values());
}

/**
 * Get messages for a specific chat with optional limit
 */
export async function getChatMessagesMockProvider(
  chatId: string,
  limit?: number
): Promise<WhatsAppMessage[]> {
  const messages = messagesMap.get(chatId) || [];
  return limit ? messages.slice(0, limit) : messages;
}

/**
 * Get recent messages across all chats with optional limit
 */
export async function getRecentMessagesMockProvider(limit?: number): Promise<WhatsAppMessage[]> {
  const allMessages: WhatsAppMessage[] = [];
  for (const msgs of messagesMap.values()) {
    allMessages.push(...msgs);
  }
  // Sort by timestamp descending, newest first
  allMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return limit ? allMessages.slice(0, limit) : allMessages;
}

/**
 * Get extracted management objects for a chat
 */
export async function getExtractedObjectsMockProvider(
  chatId: string
): Promise<ExtractedManagementObject[]> {
  return extractedObjectsMap.get(chatId) || [];
}

/**
 * Mock webhook verification - always returns true
 */
export async function verifyWebhookSignatureMockProvider(_request: Request): Promise<boolean> {
  return true;
}

/**
 * Mock webhook handler - no-op
 */
export async function handleWebhookMockProvider(_request: Request): Promise<any> {
  return {};
}

/**
 * Mock pairing code verification - always returns true
 */
export async function verifyPairingCodeMockProvider(_code: string): Promise<boolean> {
  return true;
}

/**
 * Mock pairing URL generation
 */
export function getPairingUrlMockProvider(): string {
  return 'https://wa.me';
}

/**
 * MockProvider class implementing the WhatsAppProvider interface
 */
export class MockWhatsAppProvider implements WhatsAppProvider {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    await initializeMockProvider();
    this.initialized = true;
  }

  async status(): Promise<WhatsAppProviderStatusDetails> {
    return statusMockProvider();
  }

  async connect(): Promise<void> {
    await connectMockProvider();
  }

  async disconnect(): Promise<void> {
    await disconnectMockProvider();
  }

  async getChats(): Promise<WhatsAppChat[]> {
    await this.initialize();
    return getChatsMockProvider();
  }

  async getChatMessages(chatId: string, limit?: number): Promise<WhatsAppMessage[]> {
    await this.initialize();
    return getChatMessagesMockProvider(chatId, limit);
  }

  async getRecentMessages(limit?: number): Promise<WhatsAppMessage[]> {
    await this.initialize();
    return getRecentMessagesMockProvider(limit);
  }

  async getExtractedObjects(chatId: string): Promise<ExtractedManagementObject[]> {
    await this.initialize();
    return getExtractedObjectsMockProvider(chatId);
  }

  async verifyWebhookSignature(request: Request): Promise<boolean> {
    await this.initialize();
    return verifyWebhookSignatureMockProvider(request);
  }

  async handleWebhook(request: Request): Promise<any> {
    await this.initialize();
    return handleWebhookMockProvider(request);
  }

  async verifyPairingCode(code: string): Promise<boolean> {
    await this.initialize();
    return verifyPairingCodeMockProvider(code);
  }

  async getPairingUrl(): string {
    await this.initialize();
    return getPairingUrlMockProvider();
  }
}