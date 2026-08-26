/**
 * ZT-004/005 — WhatsAppProvider factory
 * Ponytail: factory pattern reading APP_MODE from .env.local, English identifiers only
 * createWhatsAppProvider(type, config) returns the appropriate provider instance
 * Provider adapter pattern: substituiível; MockProvider primeiro; spike UAZAPI depois
 */

import { WhatsAppProvider } from './provider';
import { MockWhatsAppProvider } from './mockProvider';

// Factory function that creates the appropriate provider based on type
export function createWhatsAppProvider(
  type: 'mock' | 'uazapi' | 'evolution' | 'waha',
  config: Record<string, unknown> = {}
): WhatsAppProvider {
  switch (type) {
    case 'mock':
      const mockProvider = new MockWhatsAppProvider();
      mockProvider.initialize();
      return mockProvider;

    case 'uazapi':
      // TODO: Implement real UAZAPI provider when available
      throw new Error('UAZAPI provider not yet implemented. See ZT-012 spike.');

    case 'evolution':
      // TODO: Implement Evolution API provider when available
      throw new Error('Evolution API provider not yet implemented.');

    case 'waha':
      // TODO: Implement WABA provider when available
      throw new Error('WABA provider not yet implemented.');

    default:
      throw new Error(`Unknown WhatsApp provider type: ${type}. Use 'mock', 'uazapi', 'evolution', or 'waha'.`);
  }
}