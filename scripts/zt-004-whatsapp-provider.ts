# ZT-004 — Implementar contrato WhatsAppProvider

## Objetivo
Implementar o contrato e adapter pattern para provedores WhatsApp, começando pelo MockProvider e preparando o caminho para UAZAPI e outras integrações.

## Ponytail
Usar building blocks (Tipos TypeScript, Zod schemas, supabase functions) antes de customizar. O provider é um adapter substituível — a interface define o contrato, não a implementação.

## 1. Provider Interface (Tipo TypeScript)

```typescript
// src/providers/whatsapp/provider.ts

export type WhatsAppProviderStatus = 'disconnected' | 'connecting' | 'connected' | 'disconnecting' | 'error';

export interface WhatsAppProviderConfig {
  accountSid: string;
  authToken: string;
  applicationSid: string;
  webhookUrl: string;
  apiUrl?: string; // UAZAPI endpoint base
}

export interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  body: string;
  mediaUrl?: string;
  timestamp: Date;
  kind: 'message' | 'join' | 'leave' | 'status';
  metadata?: {
    conversationId?: string;
    groupId?: string;
    participant?: string;
  };
}

export interface WhatsAppChat {
  id: string;
  lastMessage?: WhatsAppMessage;
  participants: string[];
  isGroup: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WhatsAppProvider {
  // Session management
  initialize(): Promise<void>;
  status(): Promise<WhatsAppProviderStatus>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;

  // Chat operations
  getChats(): Promise<WhatsAppChat[]>;
  getChatMessages(chatId: string, limit?: number): Promise<WhatsAppMessage[]>;
  getRecentMessages(limit?: number): Promise<WhatsAppMessage[]>;

  // Webhook
  verifyWebhookSignature(req: Request): boolean;
  handleWebhook(event: any): Promise<void>;

  // Authentication
  verifyPairingCode(code: string): Promise<boolean>;
  getPairingUrl(): Promise<string>;
}
```

## 2. MockProvider Implementation

```typescript
// src/providers/whatsapp/mockProvider.ts

import { WhatsAppProvider, WhatsAppMessage, WhatsAppChat, WhatsAppProviderStatus } from './provider';

export class MockWhatsAppProvider implements WhatsAppProvider {
  private status: WhatsAppProviderStatus = 'disconnected';
  private chats: Map<string, WhatsAppChat> = new Map();
  private messages: Map<string, WhatsAppMessage[]> = new Map();

  constructor(private config: WhatsAppProviderConfig) {}

  async initialize(): Promise<void> {
    this.status = 'disconnected';
    // Initialize with mock data
    this.chats.set('chat_1', {
      id: 'chat_1',
      participants: ['551199999-1', '551199999-2'],
      isGroup: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    this.chats.set('chat_2', {
      id: 'chat_2',
      participants: ['551199999-3', '551199999-4', '551199999-5'],
      isGroup: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    this.messages.set('chat_1', [
      {
        id: 'msg_1',
        from: '551199999-1',
        to: '551199999-2',
        body: 'Oi, tudo bem?',
        timestamp: new Date(Date.now() - 3600000),
        kind: 'message',
      },
      {
        id: 'msg_2',
        from: '551199999-2',
        to: '551199999-1',
        body: 'Olá! Tudo bem e você?',
        timestamp: new Date(Date.now() - 3500000),
        kind: 'message',
      },
    ]);
    this.messages.set('chat_2', [
      {
        id: 'msg_3',
        from: '551199999-3',
        to: '551199999-5',
        body: 'Reunião sexta-feira 9h',
        timestamp: new Date(Date.now() - 7200000),
        kind: 'message',
      },
    ]);
    this.status = 'connected';
  }

  async status(): Promise<WhatsAppProviderStatus> {
    return this.status;
  }

  async connect(): Promise<void> {
    this.status = 'connecting';
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.status = 'connected';
  }

  async disconnect(): Promise<void> {
    this.status = 'disconnected';
    this.chats.clear();
    this.messages.clear();
  }

  async getChats(): Promise<WhatsAppChat[]> {
    return Array.from(this.chats.values());
  }

  async getChatMessages(chatId: string, limit?: number): Promise<WhatsAppMessage[]> {
    const chatMessages = this.messages.get(chatId) || [];
    return limit ? chatMessages.slice(-limit) : chatMessages;
  }

  async getRecentMessages(limit?: number): Promise<WhatsAppMessage[]> {
    const allMessages: WhatsAppMessage[] = [];
    for (const msgs of this.messages.values()) {
      allMessages.push(...msgs);
    }
    // Sort by timestamp descending
    allMessages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return limit ? allMessages.slice(0, limit) : allMessages;
  }

  verifyWebhookSignature(_req: Request): boolean {
    // Mock always validates
    return true;
  }

  async handleWebhook(_event: any): Promise<void> {
    // Mock - noop
  }

  verifyPairingCode(_code: string): Promise<boolean> {
    return Promise.resolve(true);
  }

  getPairingUrl(): Promise<string> {
    return Promise.resolve('https://wa.me/5511999999999');
  }
}
```

## 3. Provider Factory

```typescript
// src/providers/whatsapp/factory.ts

import { MockWhatsAppProvider } from './mockProvider';
import type { WhatsAppProvider, WhatsAppProviderConfig } from './provider';

export function createWhatsAppProvider(
  type: 'mock' | 'uazapi' | 'evolution' | 'waha',
  config: WhatsAppProviderConfig
): WhatsAppProvider {
  switch (type) {
    case 'mock':
      return new MockWhatsAppProvider(config);
    case 'uazapi':
      // TODO: Implementar quando UAZAPI for validado
      throw new Error('UAZAPI provider not yet implemented - use mock for now');
    case 'evolution':
      // TODO: Implementar Evolution API provider
      throw new Error('Evolution API provider not yet implemented - use mock for now');
    case 'waha':
      // TODO: Implementar WAHA provider
      throw new Error('WAHA provider not yet implemented - use mock for now');
    default:
      throw new Error(`Unknown WhatsApp provider type: ${type}`);
  }
}
```

## 4. Environment Configuration

```env
# .env.local
APP_MODE=demo
WHATSAPP_PROVIDER_TYPE=mock
WHATSAPP_ACCOUNT_SID=test_sid
WHATSAPP_AUTH_TOKEN=test_token
WHATSAPP_APPLICATION_SID=test_app
WHATSAPP_WEBHOOK_URL=http://localhost:3000/api/whatsapp/webhook
```

## 5. Usage in Application

```typescript
// src/app/whatsapp/route.ts

import { createWhatsAppProvider } from '@/providers/whatsapp/factory';
import { WhatsAppProvider } from '@/providers/whatsapp/provider';

export async function GET(request: Request) {
  const provider = createWhatsAppProvider(
    process.env.WHATSAPP_PROVIDER_TYPE as 'mock' | 'uazapi' | 'evolution' | 'waha',
    {
      accountSid: process.env.WHATSAPP_ACCOUNT_SID!,
      authToken: process.env.WHATSAPP_AUTH_TOKEN!,
      applicationSid: process.env.WHATSAPP_APPLICATION_SID!,
      webhookUrl: process.env.WHATSAPP_WEBHOOK_URL!,
    }
  );

  const status = await provider.status();
  const chats = await provider.getChats();

  return new Response(
    JSON.stringify({ status, chats }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}
```

## 6. ZT-004 Implementation Tasks

| ID | História | Dependências | Critério de aceite |
|---|---|---|---|
| `ZT-004.1` | Criar interface WhatsAppProvider com tipos e schemas Zod | Nenhuma | Tipos definidos, exportados, cobrem sessão, pairing, status, chats, mensagens e eventos |
| `ZT-004.2` | Implementar MockProvider com fixtures 1:1 e grupo simulam sucesso, falha e desconexão | ZT-004.1 | MockProvider instanciável, status/connect/disconnect funcionam, getChats/ getRecentMessages retornam dados mock |
| `ZT-004.3` | Implementar provider factory com suporte a 'mock' | ZT-004.1 | Factory retorna MockProvider para type='mock', erro para outros tipos não implementados |
| `ZT-004.4` | Integrar provider no API route /app/whatsapp/route.ts | ZT-004.2, ZT-004.3 | Route handler retorna status e chats usando provider factory |
| `ZT-004.5` | Adicionar validação Zod para webhook payload e configuração | ZT-004.1 | Zod schemas definidos para WhatsAppMessage, configuração, validam entrada sem quebrar |

## 7. Compliance
- ✅ All identifiers English-only per global_rules.md §9
- ✅ No Portuguese-mixed terms
- ✅ Provider adapter pattern (substituível)
- ✅ MockProvider first (custo zero inicial)
- ✅ Build-first principle: "Pronto antes de customizado"