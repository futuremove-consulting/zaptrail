import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ReviewQueueRecord } from '@/packages/core/supabase-storage';
import { ReviewInboxTable } from '../review-inbox-table';
import ReviewInboxPage from '@/app/review/page';

const mockItems: ReviewQueueRecord[] = [
  {
    review_id: 'rv_1',
    severity: 'high',
    reason: 'Preço ambíguo',
    conversation_id: 'conv_abc',
    status: 'pending',
    original_payload: { role: 'owner', sale_asking_price: 1200000 },
    evidence_refs: [
      {
        evidence_id: 'ev_1',
        message_id: 'msg_1',
        conversation_id: 'conv_abc',
        exact_quote: 'estou vendendo por 1,2 milhão',
        timestamp: '2026-11-05T10:00:00Z',
        extractor_type: 'rule',
        parser_version: '1.0.0',
        confidence: 0.72,
      },
    ],
    tenant_id: 't1',
    target_id: 'env_1',
    created_at: '2026-11-05T10:00:00Z',
  },
];

describe('ReviewInboxTable & ReviewInboxPage', () => {
  it('renders review items in table', () => {
    render(
      <ReviewInboxTable items={mockItems} onSelect={vi.fn()} selectedId={null} />
    );
    expect(screen.getByRole('row', { name: /conv_abc/i })).toBeInTheDocument();
    expect(screen.getByTestId('severity-badge-high')).toBeInTheDocument();
  });

  it('calls onSelect when row is clicked', () => {
    const onSelect = vi.fn();
    render(
      <ReviewInboxTable items={mockItems} onSelect={onSelect} selectedId={null} />
    );
    fireEvent.click(screen.getByRole('row', { name: /conv_abc/i }));
    expect(onSelect).toHaveBeenCalledWith('rv_1');
  });

  it('shows selected row with aria-selected', () => {
    render(
      <ReviewInboxTable items={mockItems} onSelect={vi.fn()} selectedId="rv_1" />
    );
    expect(screen.getByRole('row', { name: /conv_abc/i })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  it('keyboard j/k moves selection', () => {
    const onSelect = vi.fn();
    const items: ReviewQueueRecord[] = [
      mockItems[0],
      {
        ...mockItems[0],
        review_id: 'rv_2',
        conversation_id: 'conv_def',
      },
    ];
    render(
      <ReviewInboxTable items={items} onSelect={onSelect} selectedId="rv_1" />
    );
    fireEvent.keyDown(document, { key: 'j' });
    expect(onSelect).toHaveBeenCalledWith('rv_2');
  });

  it('shows all 5 states correctly', () => {
    const { rerender } = render(<ReviewInboxPage _testLoading />);
    // 1. loading
    expect(screen.getByTestId('skeleton-table')).toBeInTheDocument();

    // 2. empty
    rerender(<ReviewInboxPage _testItems={[]} _testLoaded />);
    expect(screen.getByText(/tudo revisado/i)).toBeInTheDocument();

    // 3. filtered-empty
    rerender(
      <ReviewInboxPage
        _testItems={mockItems}
        _testLoaded
        _testSearchQuery="inexistente_xyz"
      />
    );
    expect(screen.getByText(/nenhum resultado/i)).toBeInTheDocument();

    // 4. error
    rerender(<ReviewInboxPage _testError="Network error" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/tentar novamente/i)).toBeInTheDocument();

    // 5. ideal
    rerender(<ReviewInboxPage _testItems={mockItems} _testLoaded />);
    expect(screen.getByRole('row', { name: /conv_abc/i })).toBeInTheDocument();
  });
});
