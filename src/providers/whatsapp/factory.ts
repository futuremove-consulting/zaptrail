/**
 * ZT-004/005/013 — WhatsAppProvider factory
 * Ponytail: factory pattern reading WHATSAPP_PROVIDER_TYPE from .env.local, English identifiers only
 * createWhatsAppProvider(type, config) returns the appropriate provider instance
 * Provider adapter pattern: substituiível; MockProvider primeiro; spike UAZAPI depois; alternativa se falhar
 * Build-first: MockProvider always available; real provider integration when configured
 */

import { WhatsAppProvider } from './provider';
import { MockWhatsAppProvider } from './mockProvider';
import { UAZAPIMockProvider } from './uazapiProvider';

// Read provider type from environment, default to 'mock' for safety
const WHATSAPP_PROVIDER_TYPE = process.env.WHATSAPP_PROVIDER_TYPE || 'mock';

// Factory function that creates the appropriate provider based on type
export function createWhatsAppProvider(
  type: string = WHATSAPP_PROVIDER_TYPE,
  config: Record<string, unknown> = {}
): WhatsAppProvider {
  switch (type) {
    case 'mock':
      const mockProvider = new MockWhatsAppProvider();
      mockProvider.initialize();
      return mockProvider;

    case 'uazapi':
      // UAZAPI spike provider — uses mock fallback since no real account configured
      const uazapiProvider = new UAZAPIMockProvider();
      uazapiProvider.initialize();
      return uazapiProvider;

    case 'evolution':
      // TODO: Implement Evolution API provider when available
      throw new Error('Evolution API provider not yet implemented.');

    case 'waha':
      // TODO: Implement WABA provider when available
      throw new Error('WABA provider not yet implemented.');

    default:
      throw new Error(`Unknown WhatsApp provider type: ${type}. Use 'mock', 'uazapi', 'evolution', or 'waha'. Set WHATSAPP_PROVIDER_TYPE in .env.local.`);
  }
}