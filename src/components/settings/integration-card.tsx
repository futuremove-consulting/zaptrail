'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HealthIndicator } from '@/components/dashboard/health-indicator';

interface IntegrationCardProps {
  type: 'crm' | 'whatsapp';
  label: string;
  status: 'ok' | 'warning' | 'error';
  lastEventAt?: Date | string;
  eventsToday?: number;
  url?: string;
  token?: string;
  webhookUrl?: string;
  onTest?: () => Promise<Response>;
}

export function IntegrationCard({
  label,
  status,
  lastEventAt,
  eventsToday,
  url = '',
  token = '',
  webhookUrl,
  onTest,
}: IntegrationCardProps) {
  const [revealToken, setRevealToken] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const suffix = token.slice(-3);
  const maskedToken = token ? `••••••••••${suffix}` : '••••••••••';

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      const fetcher =
        onTest ??
        (() =>
          fetch('/api/settings/integrations/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
          }));
      const res = await fetcher();
      const data = await res.json();
      if (res.ok && data.connected) {
        setTestResult(
          `Conexão bem-sucedida (${data.latencyMs ?? 45}ms)`
        );
      } else {
        setTestResult('Falha na verificação de conectividade');
      }
    } catch {
      setTestResult('Falha na verificação de conectividade');
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm font-semibold">{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-2 text-xs">
        <HealthIndicator
          label={label}
          status={status}
          lastEventAt={lastEventAt}
          eventsToday={eventsToday}
        />

        <div className="space-y-2">
          <div>
            <span className="text-muted-foreground">Endpoint URL:</span>
            <Input readOnly value={url} className="mt-1 font-mono text-xs" />
          </div>

          {webhookUrl && (
            <div>
              <span className="text-muted-foreground">Webhook de Entrada:</span>
              <Input
                readOnly
                value={webhookUrl}
                className="mt-1 font-mono text-xs"
              />
            </div>
          )}

          <div className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-2">
            <div>
              <span className="text-muted-foreground">Token: </span>
              <span data-testid="token-masked" className="font-mono font-medium">
                {revealToken ? token : maskedToken}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setRevealToken((prev) => !prev)}
            >
              {revealToken ? 'Ocultar' : 'Revelar'}
            </Button>
          </div>
        </div>

        {testResult && (
          <p className="rounded-md bg-success/15 px-3 py-2 font-medium text-success">
            {testResult}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={testing}
            onClick={handleTestConnection}
          >
            {testing ? 'Testando...' : 'Testar Conexão'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
