import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TeamSettingsPage from '@/app/settings/team/page';

describe('TeamSettingsPage & MemberRow', () => {
  it('renders member list with role dropdown', () => {
    render(
      <TeamSettingsPage
        _testMembers={[
          { id: '1', name: 'Gustavo', email: 'g@g.com', role: 'admin' },
        ]}
      />
    );
    expect(screen.getByText('Gustavo')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /role/i })).toHaveValue(
      'admin'
    );
  });

  it('shows floating save bar when form is dirty', () => {
    render(
      <TeamSettingsPage
        _testMembers={[
          { id: '1', name: 'Gustavo', email: 'g@g.com', role: 'admin' },
        ]}
      />
    );
    fireEvent.change(screen.getByRole('combobox', { name: /role/i }), {
      target: { value: 'reviewer' },
    });
    expect(screen.getByTestId('floating-save-bar')).toBeVisible();
  });
});
