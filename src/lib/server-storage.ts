import {
  InMemorySupabaseTableClient,
  SupabaseStoragePort,
} from '@/packages/core/supabase-storage';
import { ReviewInboxService } from '@/packages/core/review-inbox';
import type { DomainPackUIManifest } from './domain-manifest.types';
import { DOMAIN_MANIFESTS, registerDomainManifest } from './domain-manifest';

export const DEFAULT_TENANT_ID = 'tenant_default';

const globalForZapTrail = globalThis as unknown as {
  zaptrailTableClient?: InMemorySupabaseTableClient;
  zaptrailStorage?: SupabaseStoragePort;
  zaptrailReviewService?: ReviewInboxService;
  zaptrailActiveDomain?: string;
  zaptrailConfidenceConfig?: { high: number; medium: number };
  zaptrailWorkspaceMembers?: Array<{
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'reviewer' | 'viewer';
  }>;
  zaptrailIntegrations?: {
    crm: {
      label: string;
      url: string;
      token: string;
      status: 'ok' | 'warning' | 'error';
      lastEventAt: string;
      eventsToday: number;
    };
    whatsapp: {
      label: string;
      url: string;
      token: string;
      webhookUrl: string;
      status: 'ok' | 'warning' | 'error';
      lastEventAt: string;
      eventsToday: number;
    };
  };
};

export function getSharedStorage(): SupabaseStoragePort {
  if (!globalForZapTrail.zaptrailTableClient) {
    globalForZapTrail.zaptrailTableClient = new InMemorySupabaseTableClient();
  }
  if (!globalForZapTrail.zaptrailStorage) {
    globalForZapTrail.zaptrailStorage = new SupabaseStoragePort(
      globalForZapTrail.zaptrailTableClient
    );
  }
  return globalForZapTrail.zaptrailStorage;
}

export function getSharedReviewService(): ReviewInboxService {
  if (!globalForZapTrail.zaptrailReviewService) {
    globalForZapTrail.zaptrailReviewService = new ReviewInboxService(
      getSharedStorage()
    );
  }
  return globalForZapTrail.zaptrailReviewService;
}

export function getActiveDomainKey(): string {
  return globalForZapTrail.zaptrailActiveDomain ?? 'real_estate';
}

export function setActiveDomainKey(domainKey: string): void {
  globalForZapTrail.zaptrailActiveDomain = domainKey;
}

export function saveCustomDomainManifest(manifest: DomainPackUIManifest): void {
  registerDomainManifest(manifest);
  globalForZapTrail.zaptrailActiveDomain = manifest.domain_key;
}

export function getAllDomainManifests(): Record<string, DomainPackUIManifest> {
  return DOMAIN_MANIFESTS;
}

export function getConfidenceConfig(): { high: number; medium: number } {
  return (
    globalForZapTrail.zaptrailConfidenceConfig ?? {
      high: 0.85,
      medium: 0.65,
    }
  );
}

export function setConfidenceConfig(config: {
  high: number;
  medium: number;
}): void {
  globalForZapTrail.zaptrailConfidenceConfig = config;
}

export function getWorkspaceMembers() {
  if (!globalForZapTrail.zaptrailWorkspaceMembers) {
    globalForZapTrail.zaptrailWorkspaceMembers = [
      {
        id: 'usr_1',
        name: 'Gustavo Admin',
        email: 'gustavo@pilotcrm.com',
        role: 'admin',
      },
      {
        id: 'usr_2',
        name: 'Ana Revisora',
        email: 'ana@pilotcrm.com',
        role: 'reviewer',
      },
    ];
  }
  return globalForZapTrail.zaptrailWorkspaceMembers;
}

export function setWorkspaceMembers(
  members: Array<{
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'reviewer' | 'viewer';
  }>
) {
  globalForZapTrail.zaptrailWorkspaceMembers = members;
}

export function getIntegrationsConfig() {
  if (!globalForZapTrail.zaptrailIntegrations) {
    globalForZapTrail.zaptrailIntegrations = {
      crm: {
        label: 'PilotCRM',
        url: process.env.PILOTCRM_WEBHOOK_URL ?? 'https://pilotcrm.app/api/crm/whatsapp/ai-suggestions/ingest',
        token: 'pilot_secret_token_987',
        status: 'ok',
        lastEventAt: new Date(Date.now() - 90_000).toISOString(),
        eventsToday: 47,
      },
      whatsapp: {
        label: 'UAZAPI WhatsApp Gateway',
        url: 'https://api.uazapi.com/v2',
        token: 'uaz_secret_key_456',
        webhookUrl: 'https://zaptrail.app/api/v1/ingest/whatsapp',
        status: 'ok',
        lastEventAt: new Date(Date.now() - 60_000).toISOString(),
        eventsToday: 128,
      },
    };
  }
  return globalForZapTrail.zaptrailIntegrations;
}
