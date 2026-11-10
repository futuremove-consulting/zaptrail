import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IntegrationCard } from '../integration-card';

describe('IntegrationCard', () => {
  it('renders CRM card with health status', () => {
    render(
      <IntegrationCard
        type="crm"
        label="PilotCRM"
        status="ok"
        lastEventAt={new Date()}
        eventsToday={47}
        url="https://crm.app/api"
        token="abc"
      />
    );
    expect(screen.getByTestId('health-dot-ok')).toBeInTheDocument();
    expect(screen.getByText('47')).toBeInTheDocument();
  });

  it('shows masked token with only last 3 chars visible', () => {
    render(
      <IntegrationCard
        type="crm"
        label="PilotCRM"
        token="secret123"
        status="ok"
      />
    );
    expect(screen.getByTestId('token-masked')).toHaveTextContent(
      '••••••••••123'
    );
  });

  it('test-connection button calls API and shows result', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ connected: true, latencyMs: 42 }),
    });
    render(
      <IntegrationCard
        type="crm"
        label="PilotCRM"
        status="ok"
        onTest={mockFetch}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /testar conexão/i }));
    expect(await screen.findByText(/conexão bem-sucedida/i)).toBeInTheDocument();
  });
});
