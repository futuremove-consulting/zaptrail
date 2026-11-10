'use client';

import { useState } from 'react';
import { UniversalInterpretationEnvelope } from '@/packages/core/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { ExtractionPreview } from './extraction-preview';

export interface PlaygroundExtractResponse {
  envelope: UniversalInterpretationEnvelope;
  processingMs: number;
}

interface PlaygroundSplitPaneProps {
  onExtract?: (
    text: string,
    domainKey: string
  ) => Promise<PlaygroundExtractResponse>;
}

export function PlaygroundSplitPane({ onExtract }: PlaygroundSplitPaneProps) {
  const [text, setText] = useState('');
  const [domainKey, setDomainKey] = useState('real_estate');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PlaygroundExtractResponse | null>(null);

  const handleExtract = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    try {
      if (onExtract) {
        const res = await onExtract(text, domainKey);
        setResult(res);
      } else {
        const response = await fetch('/api/playground/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationText: text, domainKey }),
        });
        const data = await response.json();
        setResult(data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
          <CardTitle className="text-sm font-semibold text-foreground">
            Entrada de Conversa
          </CardTitle>
          <Select
            aria-label="Domínio de teste"
            value={domainKey}
            onChange={(e) => setDomainKey(e.target.value)}
            className="w-40"
          >
            <option value="real_estate">Imobiliário</option>
            <option value="healthcare">Saúde</option>
            <option value="b2b_services">Serviços B2B</option>
          </Select>
        </CardHeader>
        <CardContent className="space-y-4 p-4 pt-2">
          <Textarea
            rows={8}
            placeholder="Cole uma conversa de exemplo do WhatsApp para testar a extração..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              disabled={!text.trim() || isLoading}
              onClick={handleExtract}
            >
              {isLoading ? 'Processando...' : 'Extrair dados'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ExtractionPreview
        envelope={result?.envelope ?? null}
        processingMs={result?.processingMs}
        isLoading={isLoading}
      />
    </div>
  );
}
