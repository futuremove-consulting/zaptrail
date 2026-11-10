'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ReviewQueueRecord } from '@/packages/core/supabase-storage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { EvidenceHighlight } from './evidence-highlight';
import { ConfidenceBadge } from './confidence-badge';

interface ReviewPeekSheetProps {
  item: ReviewQueueRecord | null;
  mode?: 'inspect' | 'edit' | 'reject';
  onModeChange?: (mode: 'inspect' | 'edit' | 'reject') => void;
  onClose: () => void;
  onApprove: (item: ReviewQueueRecord) => void;
  onEdit: (item: ReviewQueueRecord, editedPayload: Record<string, unknown>, notes?: string) => void;
  onReject: (item: ReviewQueueRecord, notes: string) => void;
}

export function ReviewPeekSheet({
  item,
  mode: controlledMode,
  onModeChange,
  onClose,
  onApprove,
  onEdit,
  onReject,
}: ReviewPeekSheetProps) {
  const [internalMode, setInternalMode] = useState<'inspect' | 'edit' | 'reject'>('inspect');
  const mode = controlledMode ?? internalMode;
  const setMode = (m: 'inspect' | 'edit' | 'reject') => {
    setInternalMode(m);
    onModeChange?.(m);
  };
  const [notes, setNotes] = useState('');
  const [editedJson, setEditedJson] = useState('');

  if (!item) return null;

  const firstEvidence = item.evidence_refs?.[0];

  const handleOpenEdit = () => {
    setEditedJson(JSON.stringify(item.original_payload ?? {}, null, 2));
    setMode('edit');
  };

  const handleSaveEdit = () => {
    try {
      const parsed = JSON.parse(editedJson) as Record<string, unknown>;
      onEdit(item, parsed, notes);
      setMode('inspect');
    } catch {
      onEdit(item, item.original_payload, notes);
      setMode('inspect');
    }
  };

  const handleConfirmReject = () => {
    onReject(item, notes || 'Rejeitado pelo operador');
    setMode('inspect');
  };

  return (
    <aside
      data-testid="peek-sheet"
      aria-label={`Inspeção do item ${item.review_id}`}
      className="flex w-full max-w-md flex-col border-l border-border bg-card p-6 shadow-xl"
    >
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">
            {item.review_id}
          </span>
          <Badge
            variant={
              item.severity === 'high'
                ? 'destructive'
                : item.severity === 'medium'
                ? 'warning'
                : 'secondary'
            }
          >
            {item.severity}
          </Badge>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          Fechar (Esc)
        </Button>
      </div>

      <div className="mt-4 flex-1 space-y-5 overflow-y-auto">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{item.reason}</h3>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            Conversa: {item.conversation_id}
          </p>
        </div>

        {/* Evidence Highlight */}
        {firstEvidence && (
          <div className="rounded-md border border-border bg-muted/40 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Evidência literal
              </span>
              <ConfidenceBadge confidence={firstEvidence.confidence} />
            </div>
            <p className="text-sm">
              <EvidenceHighlight
                messageBody={firstEvidence.exact_quote}
                quote={firstEvidence.exact_quote}
                conversationId={firstEvidence.conversation_id}
                messageId={firstEvidence.message_id}
              />
            </p>
            <div className="mt-2">
              <Link
                href={`/conversations/${item.conversation_id}?anchor=${firstEvidence.message_id}`}
                className="text-xs font-medium text-primary hover:underline"
              >
                Mostrar na conversa →
              </Link>
            </div>
          </div>
        )}

        {/* Payload inspection / edit */}
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
            Dados Extraídos
          </h4>
          {mode === 'edit' ? (
            <div className="space-y-3">
              <Textarea
                aria-label="Dados extraídos editados"
                value={editedJson}
                onChange={(e) => setEditedJson(e.target.value)}
                className="font-mono text-xs"
              />
              <Input
                placeholder="Notas da revisão (opcional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div className="flex gap-2">
                <Button type="button" size="sm" onClick={handleSaveEdit}>
                  Salvar edição
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setMode('inspect')}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : mode === 'reject' ? (
            <div className="space-y-3">
              <Textarea
                aria-label="Motivo da rejeição"
                placeholder="Descreva o motivo da rejeição..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleConfirmReject}
                >
                  Confirmar rejeição
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setMode('inspect')}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <dl className="divide-y divide-border rounded-md border border-border bg-background text-xs">
              {Object.entries(item.original_payload ?? {}).map(([key, val]) => (
                <div key={key} className="flex justify-between px-3 py-2">
                  <dt className="text-muted-foreground">{key}</dt>
                  <dd className="font-mono font-medium text-foreground">
                    {String(val)}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>

      {/* Action Footer */}
      {mode === 'inspect' && (
        <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
          <Button
            type="button"
            className="flex-1"
            onClick={() => onApprove(item)}
          >
            Aprovar (Enter)
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleOpenEdit}
          >
            Editar (E)
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => setMode('reject')}
          >
            Rejeitar (R)
          </Button>
        </div>
      )}
    </aside>
  );
}
