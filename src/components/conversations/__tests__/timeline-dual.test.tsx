import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type {
  ConversationMessage,
  UniversalInterpretationEnvelope,
} from '@/packages/core/types';
import { REAL_ESTATE_MANIFEST } from '@/lib/domain-manifest';
import { TimelineDual } from '../timeline-dual';

const mockMessages: ConversationMessage[] = [
  {
    message_id: 'msg_1',
    external_message_id: 'ext_1',
    tenant_id: 't1',
    provider: 'uazapi',
    conversation_id: 'conv_abc',
    direction: 'inbound',
    sender_id: '5511999999999',
    sender_name: 'Carlos',
    raw_text: 'Oi, bom dia',
    normalized_text: 'oi, bom dia',
    timestamp: '2026-11-05T10:00:00Z',
    attachments: [],
  },
  {
    message_id: 'msg_2',
    external_message_id: 'ext_2',
    tenant_id: 't1',
    provider: 'uazapi',
    conversation_id: 'conv_abc',
    direction: 'inbound',
    sender_id: '5511999999999',
    sender_name: 'Carlos',
    raw_text: 'Sou o dono sim, estou vendendo por 1,2 milhão',
    normalized_text: 'sou o dono sim, estou vendendo por 1,2 milhão',
    timestamp: '2026-11-05T10:01:00Z',
    attachments: [],
  },
];

const mockEnvelopes: UniversalInterpretationEnvelope[] = [
  {
    envelope_id: 'env_1',
    tenant_id: 't1',
    conversation_id: 'conv_abc',
    turn_id: 'turn_1',
    domain_key: 'real_estate',
    parser_version: '1.0.0',
    duplicate: false,
    review_required: false,
    do_not_contact: false,
    participants: [],
    intents: [],
    facts: [],
    values: [],
    relationships: [],
    conditions: [],
    opportunities: [
      {
        opportunity_id: 'opp_1',
        opportunity_type: 'real_estate.sale',
        entity_key: 'prop_1',
        stage: 'qualified',
        epistemic_status: 'declared',
        confidence: 0.92,
        linked_condition_ids: [],
        attributes: { sale_asking_price: 1200000 },
        evidence_refs: [
          {
            evidence_id: 'ev_1',
            message_id: 'msg_2',
            conversation_id: 'conv_abc',
            exact_quote: 'estou vendendo por 1,2 milhão',
            timestamp: '2026-11-05T10:01:00Z',
            extractor_type: 'rule',
            parser_version: '1.0.0',
            confidence: 0.92,
          },
        ],
      },
    ],
    actions: [],
    media_results: [],
    evidence_refs: [
      {
        evidence_id: 'ev_1',
        message_id: 'msg_2',
        conversation_id: 'conv_abc',
        exact_quote: 'estou vendendo por 1,2 milhão',
        timestamp: '2026-11-05T10:01:00Z',
        extractor_type: 'rule',
        parser_version: '1.0.0',
        confidence: 0.92,
      },
    ],
    review_items: [],
  },
];

describe('TimelineDual', () => {
  it('renders both message and extraction panels', () => {
    render(
      <TimelineDual
        messages={mockMessages}
        envelopes={mockEnvelopes}
        manifest={REAL_ESTATE_MANIFEST}
      />
    );
    expect(screen.getByTestId('messages-panel')).toBeInTheDocument();
    expect(screen.getByTestId('extractions-panel')).toBeInTheDocument();
  });

  it('highlights anchor message with ring-2 when anchorMessageId is passed', () => {
    render(
      <TimelineDual
        messages={mockMessages}
        envelopes={mockEnvelopes}
        manifest={REAL_ESTATE_MANIFEST}
        anchorMessageId="msg_2"
      />
    );
    const msg = screen.getByTestId('message-msg_2');
    expect(msg).toBeVisible();
    expect(msg).toHaveClass('ring-2');
  });

  it('highlights exact quote in message body when envelope is hovered', () => {
    render(
      <TimelineDual
        messages={mockMessages}
        envelopes={mockEnvelopes}
        manifest={REAL_ESTATE_MANIFEST}
      />
    );
    const extractionCard = screen.getByTestId('extraction-env_1');
    fireEvent.mouseEnter(extractionCard);
    expect(screen.getByRole('mark')).toBeInTheDocument();
  });
});
