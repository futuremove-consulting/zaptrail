import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EvidenceHighlight } from '../evidence-highlight';

describe('EvidenceHighlight', () => {
  it('renders message with highlighted quote', () => {
    render(
      <EvidenceHighlight
        messageBody="Sou o dono sim, estou vendendo por 1,2 milhão"
        quote="1,2 milhão"
      />
    );
    const mark = screen.getByRole('mark');
    expect(mark).toHaveTextContent('1,2 milhão');
    expect(mark).toHaveAttribute('aria-label', 'Trecho citado como evidência');
  });

  it('renders before/highlighted/after text segments', () => {
    render(
      <EvidenceHighlight
        messageBody="Sou o dono sim, estou vendendo por 1,2 milhão"
        quote="1,2 milhão"
      />
    );
    expect(screen.getByTestId('before-text')).toHaveTextContent(
      'Sou o dono sim, estou vendendo por ',
      { normalizeWhitespace: false }
    );
    expect(screen.getByTestId('after-text')).toHaveTextContent('');
  });

  it('falls back gracefully when quote not found in body', () => {
    render(<EvidenceHighlight messageBody="Olá" quote="xyz" />);
    expect(screen.getByTestId('evidence-fallback')).toBeInTheDocument();
  });

  it('mark element has font-semibold for color-agnostic distinction', () => {
    render(
      <EvidenceHighlight
        messageBody="vendendo por 1,2 milhão"
        quote="1,2 milhão"
      />
    );
    expect(screen.getByRole('mark')).toHaveClass('font-semibold');
  });
});
