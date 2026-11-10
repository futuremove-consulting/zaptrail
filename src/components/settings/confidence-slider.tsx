'use client';

import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface ConfidenceThresholds {
  high: number;
  medium: number;
}

interface ConfidenceSliderProps {
  value: ConfidenceThresholds;
  onChange: (next: ConfidenceThresholds) => void;
  recentStats?: {
    high: number;
    medium: number;
    low: number;
  };
}

export function ConfidenceSlider({
  value,
  onChange,
  recentStats = { high: 63, medium: 28, low: 9 },
}: ConfidenceSliderProps) {
  const total = Math.max(
    1,
    recentStats.high + recentStats.medium + recentStats.low
  );
  const autoPct = Math.round((recentStats.high / total) * 100);
  const reviewPct = Math.round(
    ((recentStats.medium + recentStats.low) / total) * 100
  );

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-semibold">
          Limiares de Governança por Confiança
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 p-4 pt-2 text-xs">
        <div className="space-y-1.5">
          <div className="flex justify-between">
            <label htmlFor="slider-high" className="font-medium text-foreground">
              Banda Alta (Atualização Automática)
            </label>
            <span className="font-mono font-bold text-success">
              ≥ {Math.round(value.high * 100)}%
            </span>
          </div>
          <Input
            id="slider-high"
            data-testid="slider-high"
            type="range"
            min="0.50"
            max="0.99"
            step="0.01"
            value={value.high}
            onChange={(e) =>
              onChange({
                ...value,
                high: parseFloat(e.target.value),
              })
            }
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between">
            <label
              htmlFor="slider-medium"
              className="font-medium text-foreground"
            >
              Banda Média (Revisão Condicional)
            </label>
            <span className="font-mono font-bold text-warning">
              ≥ {Math.round(value.medium * 100)}%
            </span>
          </div>
          <Input
            id="slider-medium"
            data-testid="slider-medium"
            type="range"
            min="0.30"
            max="0.84"
            step="0.01"
            value={value.medium}
            onChange={(e) =>
              onChange({
                ...value,
                medium: parseFloat(e.target.value),
              })
            }
          />
        </div>

        <div className="rounded-md border border-border bg-muted/40 p-3">
          <p className="font-medium text-foreground">
            Simulação de Impacto: ~{autoPct}% das extrações seriam automáticas e ~
            {reviewPct}% iriam para a Fila de Revisão.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
