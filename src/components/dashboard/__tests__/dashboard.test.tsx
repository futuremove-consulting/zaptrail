import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardPage from '@/app/dashboard/page';

describe('DashboardPage', () => {
  it('dashboard shows empty state for new workspace', () => {
    render(<DashboardPage _testStats={{ totalExtractions: 0 }} />);
    expect(screen.getByText(/nenhuma extração ainda/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /configurar integrações/i })
    ).toBeInTheDocument();
  });

  it('renders metrics and histograms when workspace has extractions', () => {
    render(
      <DashboardPage
        _testStats={{
          totalExtractions: 47,
          pendingReviews: 4,
          averageConfidence: 0.89,
          confidenceDistribution: { high: 32, medium: 11, low: 4 },
          topIntents: [{ label: 'intent.sell', count: 18 }],
        }}
      />
    );
    expect(screen.getByText('47')).toBeInTheDocument();
    expect(screen.getByText('Vender')).toBeInTheDocument();
  });
});
