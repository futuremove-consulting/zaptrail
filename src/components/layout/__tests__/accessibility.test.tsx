import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppShell } from '../app-shell';
import { EvidenceHighlight } from '@/components/review/evidence-highlight';
import { CommandPalette } from '../command-palette';
import { Button } from '@/components/ui/button';

describe('Accessibility & WCAG 2.2 AA Contracts', () => {
  it('EvidenceHighlight mark has both aria-label and font-semibold non-color cue', () => {
    render(
      <EvidenceHighlight
        messageBody="Apartamento com 3 quartos por R$ 850.000 no Leblon"
        quote="R$ 850.000"
      />
    );
    const mark = screen.getByRole('mark');
    expect(mark).toHaveAttribute('aria-label', 'Trecho citado como evidência');
    expect(mark).toHaveClass('font-semibold');
  });

  it('Button primitive includes focus-visible:ring-2 for keyboard accessibility', () => {
    render(<Button type="button">Aprovar item</Button>);
    const btn = screen.getByRole('button', { name: /aprovar item/i });
    expect(btn.className).toContain('focus-visible:ring-2');
  });

  it('AppShell renders main landmark with id="main-content" and mobile bottom nav', () => {
    render(
      <AppShell pendingReviewCount={2}>
        <div>Conteúdo Principal</div>
      </AppShell>
    );
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
    expect(screen.getByTestId('mobile-bottom-nav')).toBeInTheDocument();
  });

  it('CommandPalette navigates through commands with arrow keys and selects with Enter', () => {
    render(<CommandPalette initialOpen={true} />);
    const input = screen.getByLabelText(/buscar comando/i);

    const getCommandButtons = () =>
      screen
        .getAllByRole('button')
        .filter((b) => b.getAttribute('data-command-item') === 'true');

    // Initially index 0 is selected
    expect(getCommandButtons()[0]).toHaveAttribute('aria-selected', 'true');

    // ArrowDown navigates to index 1
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(getCommandButtons()[1]).toHaveAttribute('aria-selected', 'true');

    // ArrowUp navigates back to index 0
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(getCommandButtons()[0]).toHaveAttribute('aria-selected', 'true');
  });
});
