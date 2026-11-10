import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppShell } from '../app-shell';

// ─── TDD RED: these tests MUST fail before AppShell is implemented ───

describe('AppShell', () => {
  it('renders sidebar with w-64 nav', () => {
    render(
      <AppShell domainKey="real_estate" pendingReviewCount={3}>
        <div>content</div>
      </AppShell>
    );
    const nav = screen.getByRole('navigation', { name: /navegação principal/i });
    expect(nav).toBeInTheDocument();
  });

  it('renders datum line header at h-14', () => {
    render(
      <AppShell domainKey="real_estate" pendingReviewCount={0}>
        <div>content</div>
      </AppShell>
    );
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
    expect(header.className).toMatch(/h-14/);
  });

  it('renders nav links for all primary routes', () => {
    render(
      <AppShell domainKey="real_estate" pendingReviewCount={5}>
        <div>content</div>
      </AppShell>
    );
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /revisão/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /extrações/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /conversas/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /configurações/i })).toBeInTheDocument();
  });

  it('shows pending review count badge when count > 0', () => {
    render(
      <AppShell domainKey="real_estate" pendingReviewCount={7}>
        <div>content</div>
      </AppShell>
    );
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('shows domain name in domain indicator', () => {
    render(
      <AppShell domainKey="real_estate" pendingReviewCount={0}>
        <div>content</div>
      </AppShell>
    );
    expect(screen.getByText('Imobiliário')).toBeInTheDocument();
  });
});
