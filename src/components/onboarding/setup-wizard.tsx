'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface SetupWizardProps {
  onFinish: (config: {
    domainKey: string;
    crmUrl: string;
    whatsappProvider: string;
  }) => void;
}

export function SetupWizard({ onFinish }: SetupWizardProps) {
  const [step, setStep] = useState(1);
  const [domainKey, setDomainKey] = useState('real_estate');
  const [crmUrl, setCrmUrl] = useState(
    'https://app.pilotcrm.com.br/api/crm/whatsapp/ai-suggestions/ingest'
  );
  const [whatsappProvider, setWhatsappProvider] = useState('z-api');

  return (
    <Card className="mx-auto max-w-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5 pb-3">
        <CardTitle className="text-base font-semibold text-foreground">
          Configuração Inicial do ZapTrail
        </CardTitle>
        <Badge variant="secondary">Etapa {step} de 4</Badge>
      </CardHeader>
      <CardContent className="space-y-5 p-5 pt-2 text-xs">
        {step === 1 && (
          <div className="space-y-2">
            <label
              htmlFor="onboard-domain"
              className="font-medium text-foreground"
            >
              Selecione o Domínio de Negócio Principal
            </label>
            <Select
              id="onboard-domain"
              value={domainKey}
              onChange={(e) => setDomainKey(e.target.value)}
            >
              <option value="real_estate">Imobiliário (PilotCRM)</option>
              <option value="healthcare">Saúde e Clínicas</option>
              <option value="b2b_services">Serviços B2B</option>
            </Select>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-2">
            <label
              htmlFor="onboard-crm"
              className="font-medium text-foreground"
            >
              Endereço de Callback do CRM
            </label>
            <Input
              id="onboard-crm"
              value={crmUrl}
              onChange={(e) => setCrmUrl(e.target.value)}
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-2">
            <label
              htmlFor="onboard-wa"
              className="font-medium text-foreground"
            >
              Provedor de Mensageria WhatsApp
            </label>
            <Select
              id="onboard-wa"
              value={whatsappProvider}
              onChange={(e) => setWhatsappProvider(e.target.value)}
            >
              <option value="z-api">Z-API Enterprise</option>
              <option value="evolution">Evolution API</option>
              <option value="meta-cloud">Meta Cloud API Oficial</option>
            </Select>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-2 rounded-md border border-border bg-muted/30 p-3">
            <p className="font-semibold text-foreground">
              Pronto para iniciar a operação
            </p>
            <p className="text-muted-foreground">
              Domínio selecionado: <strong>{domainKey}</strong>. Todas as
              extrações passarão pela validação anti-alucinação antes de
              atualizar o CRM.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={step === 1}
            onClick={() => setStep((s) => Math.max(1, s - 1))}
          >
            Voltar etapa
          </Button>
          {step < 4 ? (
            <Button
              type="button"
              size="sm"
              onClick={() => setStep((s) => Math.min(4, s + 1))}
            >
              Continuar etapa
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={() =>
                onFinish({ domainKey, crmUrl, whatsappProvider })
              }
            >
              Concluir configuração
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
