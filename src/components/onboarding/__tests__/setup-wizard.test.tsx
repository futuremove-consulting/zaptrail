import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SetupWizard } from '../setup-wizard';

describe('SetupWizard', () => {
  it('progresses through all 4 onboarding steps and triggers onFinish', () => {
    const onFinish = vi.fn();
    render(<SetupWizard onFinish={onFinish} />);

    expect(screen.getByText(/Etapa 1 de 4/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /continuar etapa/i }));

    expect(screen.getByText(/Etapa 2 de 4/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /continuar etapa/i }));

    expect(screen.getByText(/Etapa 3 de 4/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /continuar etapa/i }));

    expect(screen.getByText(/Etapa 4 de 4/i)).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: /concluir configuração/i })
    );

    expect(onFinish).toHaveBeenCalledTimes(1);
  });
});
