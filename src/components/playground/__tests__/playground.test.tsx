import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlaygroundSplitPane } from '../playground-split-pane';

describe('PlaygroundSplitPane', () => {
  it('disables Extrair button when textarea is empty', () => {
    render(<PlaygroundSplitPane />);
    const btn = screen.getByRole('button', { name: /extrair dados/i });
    expect(btn).toBeDisabled();
  });

  it('calls onExtract and displays extraction result and processing time', async () => {
    const mockExtract = vi.fn().mockResolvedValue({
      processingMs: 120,
      envelope: {
        envelope_id: 'env_play_1',
        tenant_id: 'playground',
        conversation_id: 'conv_play_1',
        turn_id: 'turn_1',
        domain_key: 'real_estate',
        parser_version: '1.0.0',
        duplicate: false,
        review_required: false,
        do_not_contact: false,
        participants: [{ participant_id: 'p1', role_label: 'buyer' }],
        intents: [{ intent_id: 'i1', intent_label: 'intent.buy', confidence: 0.92 }],
        facts: [],
        values: [
          {
            key: 'sale_asking_price',
            value_type: 'currency',
            normalized_value: 850000,
            confidence: 0.95,
          },
        ],
        relationships: [],
        conditions: [],
        opportunities: [
          {
            opportunity_id: 'opp_1',
            opportunity_type: 'opp.buyer_demand',
            stage: 'qualified',
            confidence: 0.91,
            attributes: {},
          },
        ],
        actions: [],
        media_results: [],
        evidence_refs: [],
        review_items: [],
      },
    });

    render(<PlaygroundSplitPane onExtract={mockExtract} />);

    fireEvent.change(
      screen.getByPlaceholderText(/cole uma conversa de exemplo/i),
      {
        target: {
          value: 'Cliente: Procuro apartamento no Leblon até R$ 850.000',
        },
      }
    );

    const btn = screen.getByRole('button', { name: /extrair dados/i });
    expect(btn).not.toBeDisabled();
    fireEvent.click(btn);

    expect(await screen.findByText(/120ms/i)).toBeInTheDocument();
    expect(screen.getByText(/env_play_1/i)).toBeInTheDocument();
  });
});
