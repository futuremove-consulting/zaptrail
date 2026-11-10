import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DomainProvider, useDomainContext } from '../domain-context';
import { Button } from '@/components/ui/button';

function ConsumerComponent() {
  const { manifest, setDomainKey } = useDomainContext();
  return (
    <div>
      <span data-testid="active-domain-name">{manifest.display_name}</span>
      <Button type="button" onClick={() => setDomainKey('healthcare')}>
        Mudar para Saúde
      </Button>
    </div>
  );
}

describe('DomainContext', () => {
  it('propagates default real_estate manifest and updates when domain changes', () => {
    render(
      <DomainProvider initialDomainKey="real_estate">
        <ConsumerComponent />
      </DomainProvider>
    );

    expect(screen.getByTestId('active-domain-name')).toHaveTextContent(
      'Imobiliário'
    );

    fireEvent.click(screen.getByRole('button', { name: /mudar para saúde/i }));
    expect(screen.getByTestId('active-domain-name')).toHaveTextContent('Saúde');
  });
});
