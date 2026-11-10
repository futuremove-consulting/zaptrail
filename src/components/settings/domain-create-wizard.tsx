'use client';

import { useState } from 'react';
import { DomainPackUIManifest } from '@/lib/domain-manifest.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface DomainCreateWizardProps {
  onComplete: (manifest: DomainPackUIManifest) => void;
}

export function DomainCreateWizard({ onComplete }: DomainCreateWizardProps) {
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [intents, setIntents] = useState<Array<{ key: string; label: string }>>([
    { key: 'intent.buy', label: 'Comprar' },
    { key: 'intent.sell', label: 'Vender' },
  ]);
  const [newIntentLabel, setNewIntentLabel] = useState('');
  const [opportunities, setOpportunities] = useState<
    Array<{ key: string; label: string }>
  >([{ key: 'opp.lead', label: 'Oportunidade Comercial' }]);
  const [roles, setRoles] = useState<Array<{ key: string; label: string }>>([
    { key: 'customer', label: 'Cliente' },
    { key: 'specialist', label: 'Especialista' },
  ]);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    if (step === 1 && !displayName.trim()) {
      setError('O nome do domínio é obrigatório.');
      return;
    }
    setError(null);
    setStep((prev) => Math.min(5, prev + 1));
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleAddIntent = () => {
    if (!newIntentLabel.trim()) return;
    const key = `intent.${newIntentLabel.trim().toLowerCase().replace(/\s+/g, '_')}`;
    setIntents((prev) => [...prev, { key, label: newIntentLabel.trim() }]);
    setNewIntentLabel('');
  };

  const handlePublish = () => {
    const domainKey =
      displayName
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '_') || 'custom_domain';

    const manifest: DomainPackUIManifest = {
      domain_key: domainKey,
      display_name: displayName.trim(),
      description:
        description.trim() ||
        `Pacote de domínio customizado para ${displayName.trim()}.`,
      icon: 'Sparkles',
      labels: {
        opportunity: 'Oportunidade',
        participant: 'Participante',
        intent: 'Intenção',
        entity: 'Entidade',
      },
      extra_columns: [],
      extra_filters: [],
      intent_labels: Object.fromEntries(intents.map((i) => [i.key, i.label])),
      opportunity_labels: Object.fromEntries(
        opportunities.map((o) => [o.key, o.label])
      ),
      role_labels: Object.fromEntries(roles.map((r) => [r.key, r.label])),
    };

    onComplete(manifest);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
        <CardTitle className="text-sm font-semibold">
          Criar Pacote de Domínio Customizado
        </CardTitle>
        <Badge variant="secondary">Passo {step} de 5</Badge>
      </CardHeader>
      <CardContent className="space-y-4 p-4 pt-2 text-xs">
        {error && (
          <div
            role="alert"
            className="rounded-md border border-destructive/40 bg-destructive/10 p-2.5 text-destructive"
          >
            {error}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <div className="space-y-1">
              <label
                htmlFor="domain-name"
                className="font-medium text-foreground"
              >
                Nome do Domínio
              </label>
              <Input
                id="domain-name"
                placeholder="Ex: Automotivo, Educação, Seguros"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="domain-desc"
                className="font-medium text-foreground"
              >
                Descrição Operacional
              </label>
              <Textarea
                id="domain-desc"
                placeholder="Descreva o contexto de atendimento deste domínio..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <p className="font-medium text-foreground">
              Intenções do Domínio
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Nova intenção (ex: Agendar Test Drive)"
                value={newIntentLabel}
                onChange={(e) => setNewIntentLabel(e.target.value)}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddIntent}
              >
                Adicionar intenção
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {intents.map((i) => (
                <Badge key={i.key} variant="secondary">
                  {i.label}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <p className="font-medium text-foreground">
              Tipos de Oportunidade
            </p>
            <div className="flex flex-wrap gap-1.5">
              {opportunities.map((o) => (
                <Badge key={o.key} variant="secondary">
                  {o.label}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <p className="font-medium text-foreground">
              Papéis dos Participantes
            </p>
            <div className="flex flex-wrap gap-1.5">
              {roles.map((r) => (
                <Badge key={r.key} variant="secondary">
                  {r.label}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-2 rounded-md border border-border bg-muted/30 p-3">
            <p className="font-semibold text-foreground">
              Resumo de Revisão: {displayName}
            </p>
            <p className="text-muted-foreground">
              {intents.length} intenções, {opportunities.length} tipos de
              oportunidade e {roles.length} papéis configurados.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={step === 1}
            onClick={handleBack}
          >
            Voltar etapa
          </Button>
          {step < 5 ? (
            <Button type="button" size="sm" onClick={handleNext}>
              Próximo passo
            </Button>
          ) : (
            <Button type="button" size="sm" onClick={handlePublish}>
              Publicar domínio
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
