'use client';

import { Button } from '@/components/ui/button';

interface FloatingSaveBarProps {
  isDirty: boolean;
  onSave: () => void;
  onReset: () => void;
}

export function FloatingSaveBar({
  isDirty,
  onSave,
  onReset,
}: FloatingSaveBarProps) {
  if (!isDirty) return null;

  return (
    <div
      data-testid="floating-save-bar"
      className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-lg border border-border bg-card px-5 py-3 text-card-foreground shadow-2xl"
    >
      <span className="text-xs font-medium text-foreground">
        Alterações pendentes
      </span>
      <div className="flex items-center gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onReset}>
          Restaurar
        </Button>
        <Button type="button" size="sm" onClick={onSave}>
          Salvar alterações
        </Button>
      </div>
    </div>
  );
}
