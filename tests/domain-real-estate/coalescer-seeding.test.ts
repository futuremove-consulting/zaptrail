import { describe, it, expect } from 'vitest';
import {
  coalesceTurnWindowWithDebounce,
  coalesceMultipleTurnWindows,
  partitionMessagesByDebounce,
  bindSeededPropertyCandidates,
  CoalescerMessageInput,
} from '../../src/packages/domain-real-estate/turn-window-coalescer';
import {
  RealEstateDomainPack,
  interpretRealEstateTurn,
} from '../../src/packages/domain-real-estate/opportunity-orchestrator';
import {
  SeededPropertyCandidate,
  RealEstateDomainEntities,
} from '../../src/packages/domain-real-estate/types';

describe('TurnWindow Coalescing with Debounce (ING-01, E-02-04, T-02-04)', () => {
  it('coalesces 4 messages sent within 40 seconds into a single TurnWindow with combined text and preserved IDs (CT-17, E-02-04)', () => {
    const baseTime = 1700000000000;
    const rawMessages: CoalescerMessageInput[] = [
      {
        message_id: 'msg-001',
        conversation_id: 'conv-burst-1',
        raw_text: 'Oi',
        timestamp: new Date(baseTime).toISOString(),
      },
      {
        message_id: 'msg-002',
        conversation_id: 'conv-burst-1',
        raw_text: 'Sou proprietário sim',
        timestamp: new Date(baseTime + 10000).toISOString(),
      },
      {
        message_id: 'msg-003',
        conversation_id: 'conv-burst-1',
        raw_text: 'Quero vender o meu ap',
        timestamp: new Date(baseTime + 25000).toISOString(),
      },
      {
        message_id: 'msg-004',
        conversation_id: 'conv-burst-1',
        raw_text: 'Fecho por 980 mil',
        timestamp: new Date(baseTime + 40000).toISOString(),
      },
    ];

    const window = coalesceTurnWindowWithDebounce(rawMessages, 120);

    expect(window.messages).toHaveLength(4);
    expect(window.messages.map((m) => m.message_id)).toEqual([
      'msg-001',
      'msg-002',
      'msg-003',
      'msg-004',
    ]);
    expect(window.consolidated_text).toContain('Oi');
    expect(window.consolidated_text).toContain('Sou proprietário sim');
    expect(window.consolidated_text).toContain('Quero vender o meu ap');
    expect(window.consolidated_text).toContain('Fecho por 980 mil');
  });

  it('preserves media attachments across coalesced messages', () => {
    const baseTime = 1700000000000;
    const rawMessages: CoalescerMessageInput[] = [
      {
        message_id: 'msg-text-1',
        conversation_id: 'conv-media',
        raw_text: 'Segue foto da fachada',
        timestamp: new Date(baseTime).toISOString(),
        attachments: [
          {
            attachment_id: 'att-fachada-1',
            media_kind: 'image',
            mime_type: 'image/jpeg',
            caption: 'Fachada do prédio',
          },
        ],
      },
      {
        message_id: 'msg-text-2',
        conversation_id: 'conv-media',
        raw_text: 'E a planta baixa',
        timestamp: new Date(baseTime + 15000).toISOString(),
        attachments: [
          {
            attachment_id: 'att-planta-2',
            media_kind: 'document',
            mime_type: 'application/pdf',
            caption: 'Planta baixa',
          },
        ],
      },
    ];

    const window = coalesceTurnWindowWithDebounce(rawMessages, 120);

    expect(window.messages[0].attachments).toHaveLength(1);
    expect(window.messages[0].attachments[0].attachment_id).toBe('att-fachada-1');
    expect(window.messages[1].attachments).toHaveLength(1);
    expect(window.messages[1].attachments[0].attachment_id).toBe('att-planta-2');
  });

  it('separates messages sent across a gap > 120s into distinct TurnWindows (T-02-04)', () => {
    const baseTime = 1700000000000;
    const rawMessages: CoalescerMessageInput[] = [
      {
        message_id: 'msg-turn1-a',
        conversation_id: 'conv-gap',
        raw_text: 'Olá, bom dia',
        timestamp: new Date(baseTime).toISOString(),
      },
      {
        message_id: 'msg-turn1-b',
        conversation_id: 'conv-gap',
        raw_text: 'Gostaria de saber sobre meu imóvel',
        timestamp: new Date(baseTime + 30000).toISOString(), // +30s: same cluster
      },
      {
        message_id: 'msg-turn2-a',
        conversation_id: 'conv-gap',
        raw_text: 'Voltei aqui. Pode anunciar por 800 mil',
        timestamp: new Date(baseTime + 200000).toISOString(), // +200s (gap > 120s): new cluster
      },
    ];

    const clusters = partitionMessagesByDebounce(rawMessages, 120);
    expect(clusters).toHaveLength(2);
    expect(clusters[0].map((m) => m.message_id)).toEqual(['msg-turn1-a', 'msg-turn1-b']);
    expect(clusters[1].map((m) => m.message_id)).toEqual(['msg-turn2-a']);

    const windows = coalesceMultipleTurnWindows(rawMessages, 120);
    expect(windows).toHaveLength(2);
    expect(windows[0].messages).toHaveLength(2);
    expect(windows[1].messages).toHaveLength(1);
    expect(windows[1].messages[0].message_id).toBe('msg-turn2-a');

    // coalesceTurnWindowWithDebounce returns the active/latest cluster
    const activeWindow = coalesceTurnWindowWithDebounce(rawMessages, 120);
    expect(activeWindow.messages).toHaveLength(1);
    expect(activeWindow.messages[0].message_id).toBe('msg-turn2-a');
  });

  it('sorts messages arriving out-of-order chronologically before coalescing', () => {
    const baseTime = 1700000000000;
    const rawMessages: CoalescerMessageInput[] = [
      {
        message_id: 'msg-3',
        conversation_id: 'conv-ooo',
        raw_text: 'Terceira mensagem',
        timestamp: new Date(baseTime + 20000).toISOString(),
      },
      {
        message_id: 'msg-1',
        conversation_id: 'conv-ooo',
        raw_text: 'Primeira mensagem',
        timestamp: new Date(baseTime).toISOString(),
      },
      {
        message_id: 'msg-2',
        conversation_id: 'conv-ooo',
        raw_text: 'Segunda mensagem',
        timestamp: new Date(baseTime + 10000).toISOString(),
      },
    ];

    const window = coalesceTurnWindowWithDebounce(rawMessages, 120);
    expect(window.messages.map((m) => m.message_id)).toEqual(['msg-1', 'msg-2', 'msg-3']);
    const lines = window.consolidated_text.split('\n');
    expect(lines[0]).toBe('Primeira mensagem');
    expect(lines[1]).toBe('Segunda mensagem');
    expect(lines[2]).toBe('Terceira mensagem');
  });
});

describe('Outbound Campaign Candidate Seeding & Relative Affirmation (ING-01, E-02-05, E-02-06, T-02-03)', () => {
  const seedCandidate: SeededPropertyCandidate = {
    external_property_id: 'prop-crm-9901',
    address_line: 'Rua Bela Cintra, 1200 - Apto 82',
    neighborhood: 'Consolação',
    city: 'São Paulo',
    listing_type: 'sale',
    expected_price: 1100000,
    campaign_id: 'camp-captacao-outubro-2026',
    outbound_message_text:
      'Olá Marcos! Temos clientes qualificados buscando apartamentos na Rua Bela Cintra. Você teria interesse em anunciar seu apto 82 para venda por 1,1 mi?',
    outbound_timestamp: '2026-10-21T10:00:00.000Z',
  };

  it('binds SeededPropertyCandidate to TurnWindow metadata and synthesizes prior outbound message', () => {
    const rawMessage: CoalescerMessageInput = {
      message_id: 'msg-inbound-1',
      conversation_id: 'conv-seed-1',
      raw_text: 'Sim',
      timestamp: '2026-10-21T10:05:00.000Z',
    };

    const window = coalesceTurnWindowWithDebounce([rawMessage], 120);
    const enrichedWindow = bindSeededPropertyCandidates(window, [seedCandidate]);

    expect(enrichedWindow.seeded_context?.seeded_property_candidates).toEqual([seedCandidate]);
    expect(enrichedWindow.prior_outbound_message).toBeDefined();
    expect(enrichedWindow.prior_outbound_message?.raw_text).toContain('Rua Bela Cintra');
  });

  it('resolves short affirmation "Sim" to seeded property with capture_for_sale (E-02-05, ING-01)', async () => {
    const rawMessage: CoalescerMessageInput = {
      message_id: 'msg-aff-1',
      conversation_id: 'conv-aff-1',
      raw_text: 'Sim',
      timestamp: '2026-10-21T10:02:00.000Z',
    };

    const window = coalesceTurnWindowWithDebounce([rawMessage], 120);
    const seededWindow = bindSeededPropertyCandidates(window, [seedCandidate]);

    const envelope = await interpretRealEstateTurn(seededWindow);

    expect(envelope.intents.some((i) => i.intent_label === 'intent.capture_for_sale')).toBe(true);
    expect(envelope.participants[0].role_label).toBe('owner');
    expect(envelope.opportunities.some((o) => o.opportunity_type === 'real_estate.capture_sale')).toBe(true);

    const domainEntities = envelope.domain_entities as RealEstateDomainEntities;
    expect(domainEntities.property_candidates).toHaveLength(1);
    const primary = domainEntities.property_candidates[0];
    expect(primary.origin_kind).toBe('seeded_primary');
    expect(primary.label).toBe('Rua Bela Cintra, 1200 - Apto 82');
    expect(primary.sale_asking_price).toBe(1100000);
  });

  it('resolves relative affirmation "Pode anunciar esse mesmo" to seeded property', async () => {
    const rawMessage: CoalescerMessageInput = {
      message_id: 'msg-aff-2',
      conversation_id: 'conv-aff-2',
      raw_text: 'Pode anunciar esse mesmo',
      timestamp: '2026-10-21T10:03:00.000Z',
    };

    const window = coalesceTurnWindowWithDebounce([rawMessage], 120);
    const seededWindow = bindSeededPropertyCandidates(window, [seedCandidate]);

    const envelope = await interpretRealEstateTurn(seededWindow);

    expect(envelope.intents.some((i) => i.intent_label === 'intent.capture_for_sale')).toBe(true);
    expect(envelope.participants[0].role_label).toBe('owner');
    const domainEntities = envelope.domain_entities as RealEstateDomainEntities;
    expect(domainEntities.property_candidates[0].sale_asking_price).toBe(1100000);
  });

  it('handles refusal of seeded property with offer of 2nd property without context confusion (E-02-06, T-02-03)', async () => {
    // Interlocutor refuses the campaign property ("Esse do centro já vendi")
    // but offers an alternative property ("mas tenho um nos Jardins para vender por 1 milhão")
    const rawMessage: CoalescerMessageInput = {
      message_id: 'msg-other-1',
      conversation_id: 'conv-other-1',
      raw_text:
        'Esse do centro já vendi, mas tenho um nos Jardins para vender por 1 milhão',
      timestamp: '2026-10-21T10:04:00.000Z',
    };

    const window = coalesceTurnWindowWithDebounce([rawMessage], 120);
    const seededWindow = bindSeededPropertyCandidates(window, [seedCandidate]);

    const envelope = await interpretRealEstateTurn(seededWindow);

    // 1. Primary property is marked not interested
    const notInterestedPrimary = envelope.intents.find(
      (i) => i.intent_label === 'intent.not_interested_property'
    );
    expect(notInterestedPrimary).toBeDefined();
    expect(notInterestedPrimary?.target_entity_key).toBe('property_primary');

    // 2. Secondary property is captured
    const captureOther = envelope.intents.find(
      (i) => i.intent_label === 'intent.capture_other_property'
    );
    expect(captureOther).toBeDefined();
    expect(captureOther?.target_entity_key).toBe('property_secondary');

    // 3. Sale opportunity targets property_secondary, NOT the rejected seeded property
    const opp = envelope.opportunities.find((o) => o.opportunity_type === 'real_estate.capture_sale');
    expect(opp).toBeDefined();
    expect(opp?.entity_key).toBe('property_secondary');

    // 4. Two property candidates exist: seeded primary and offered alternative
    const domainEntities = envelope.domain_entities as RealEstateDomainEntities;
    expect(domainEntities.property_candidates).toHaveLength(2);

    const primaryProp = domainEntities.property_candidates.find((p) => p.property_key === 'property_primary');
    expect(primaryProp?.origin_kind).toBe('seeded_primary');

    const secondaryProp = domainEntities.property_candidates.find((p) => p.property_key === 'property_secondary');
    expect(secondaryProp?.origin_kind).toBe('offered_alternative');
    expect(secondaryProp?.sale_asking_price).toBe(1000000);
  });
});
