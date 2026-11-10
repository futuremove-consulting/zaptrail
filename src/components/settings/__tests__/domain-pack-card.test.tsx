import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DomainPackCard } from '../domain-pack-card';
import { REAL_ESTATE_MANIFEST } from '@/lib/domain-manifest';

describe('DomainPackCard', () => {
  it('renders active domain card with Ativo badge', () => {
    render(
      <DomainPackCard
        manifest={REAL_ESTATE_MANIFEST}
        isActive={true}
        onSelect={vi.fn()}
      />
    );
    expect(screen.getByText('Imobiliário')).toBeInTheDocument();
    expect(screen.getByText('Ativo')).toBeInTheDocument();
  });

  it('calls onSelect when Selecionar button is clicked on inactive pack', () => {
    const onSelect = vi.fn();
    render(
      <DomainPackCard
        manifest={REAL_ESTATE_MANIFEST}
        isActive={false}
        onSelect={onSelect}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /selecionar/i }));
    expect(onSelect).toHaveBeenCalledWith('real_estate');
  });
});
