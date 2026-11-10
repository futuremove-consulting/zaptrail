import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DomainCreateWizard } from '../domain-create-wizard';

describe('DomainCreateWizard', () => {
  it('renders step 1 of 5 initially', () => {
    render(<DomainCreateWizard onComplete={vi.fn()} />);
    expect(screen.getByText(/Passo 1 de 5/i)).toBeInTheDocument();
  });

  it('validates required name before advancing from step 1', () => {
    render(<DomainCreateWizard onComplete={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      /nome do domínio é obrigatório/i
    );
  });

  it('advances through all 5 steps and calls onComplete on Publicar', () => {
    const onComplete = vi.fn();
    render(<DomainCreateWizard onComplete={onComplete} />);

    fireEvent.change(screen.getByLabelText(/nome do domínio/i), {
      target: { value: 'Automotivo' },
    });
    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));
    expect(screen.getByText(/Passo 2 de 5/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));
    expect(screen.getByText(/Passo 3 de 5/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));
    expect(screen.getByText(/Passo 4 de 5/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /próximo/i }));
    expect(screen.getByText(/Passo 5 de 5/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /publicar domínio/i }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
