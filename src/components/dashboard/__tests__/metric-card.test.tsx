import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MetricCard } from '../metric-card';
import { HealthIndicator } from '../health-indicator';

describe('MetricCard & HealthIndicator', () => {
  it('renders metric card with value, trend, and label', () => {
    render(
      <MetricCard
        label="Extrações Hoje"
        value={47}
        trend={15}
        trendLabel="vs. ontem"
      />
    );
    expect(screen.getByText('47')).toHaveClass('font-mono');
    expect(screen.getByText('↑ 15%')).toBeInTheDocument();
  });

  it('renders health indicator with correct ok status', () => {
    render(
      <HealthIndicator
        label="CRM"
        status="ok"
        lastEventAt={new Date(Date.now() - 120_000)}
      />
    );
    expect(screen.getByTestId('health-dot-ok')).toBeInTheDocument();
    expect(screen.getByText(/há 2 minutos/i)).toBeInTheDocument();
  });

  it('degrades health to warning when last event > 5min', () => {
    render(
      <HealthIndicator
        label="CRM"
        status="ok"
        lastEventAt={new Date(Date.now() - 400_000)}
      />
    );
    expect(screen.getByTestId('health-dot-warning')).toBeInTheDocument();
  });
});
