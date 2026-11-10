import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConfidenceSlider } from '../confidence-slider';

describe('ConfidenceSlider', () => {
  it('renders three bands with correct default values', () => {
    render(
      <ConfidenceSlider
        value={{ high: 0.85, medium: 0.65 }}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByTestId('slider-high')).toHaveValue('0.85');
    expect(screen.getByTestId('slider-medium')).toHaveValue('0.65');
  });

  it('shows impact preview percentage when values change', () => {
    render(
      <ConfidenceSlider
        value={{ high: 0.85, medium: 0.65 }}
        onChange={vi.fn()}
        recentStats={{ high: 63, medium: 28, low: 9 }}
      />
    );
    expect(
      screen.getByText(/~63% das extrações seriam automáticas/i)
    ).toBeInTheDocument();
  });
});
