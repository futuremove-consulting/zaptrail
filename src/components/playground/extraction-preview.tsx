'use client';

import Link from 'next/link';
import { UniversalInterpretationEnvelope } from '@/packages/core/types';
import { getDomainManifest } from '@/lib/domain-manifest';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ExtractionPreviewProps {
  envelope: UniversalInterpretationEnvelope | null;
  processingMs?: number | null;
  isLoading?: boolean;
}

export function ExtractionPreview({
  envelope,
  processingMs,
  isLoading = false,
}: ExtractionPreviewProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex h-64 items-center justify-center p-6 text-xs text-muted-foreground">
          Processando conversa no motor híbrido...
        </CardContent>
      </Card>
    );
  }

  if (!envelope) {
    return (
      <Card>
        <CardContent className="flex h-64 items-center justify-center p-6 text-center text-xs text-muted-foreground">
          Insira uma conversa ao lado e acione a extração para inspecionar o
          envelope semântico gerado.
        </CardContent>
      </Card>
    );
  }

  const manifest = getDomainManifest(envelope.domain_key);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
        <CardTitle className="font-mono text-xs font-semibold text-foreground">
          {envelope.envelope_id}
        </CardTitle>
        <div className="flex items-center gap-2">
          {processingMs !== undefined && processingMs !== null && (
            <Badge variant="outline" className="font-mono">
              Concluído em {processingMs}ms
            </Badge>
          )}
          <Badge variant="secondary">{manifest.display_name}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-2 text-xs">
        <div className="grid grid-cols-3 gap-2 rounded-md border border-border bg-muted/30 p-3 text-center">
          <div>
            <p className="font-mono text-lg font-bold text-foreground">
              {envelope.participants.length}
            </p>
            <p className="text-muted-foreground">Participantes</p>
          </div>
          <div>
            <p className="font-mono text-lg font-bold text-foreground">
              {envelope.opportunities.length}
            </p>
            <p className="text-muted-foreground">Oportunidades</p>
          </div>
          <div>
            <p className="font-mono text-lg font-bold text-foreground">
              {envelope.values.length}
            </p>
            <p className="text-muted-foreground">Valores</p>
          </div>
        </div>

        {envelope.intents.length > 0 && (
          <div className="space-y-1.5">
            <p className="font-semibold text-foreground">
              Intenções Detectadas
            </p>
            <div className="flex flex-wrap gap-1.5">
              {envelope.intents.map((intent, idx) => (
                <Badge key={idx} variant="default">
                  {manifest.intent_labels[intent.intent_label] ??
                    intent.intent_label}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2">
          <Link
            href={`/extractions/${envelope.envelope_id}`}
            className="text-xs font-medium text-primary hover:underline"
          >
            Inspecionar envelope completo →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
