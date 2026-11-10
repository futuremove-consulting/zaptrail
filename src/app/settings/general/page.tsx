'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { FloatingSaveBar } from '@/components/settings/floating-save-bar';

export default function GeneralSettingsPage() {
  const [workspaceName, setWorkspaceName] = useState('Imobiliária Atlântica');
  const [timezone, setTimezone] = useState('America/Sao_Paulo');
  const [isDirty, setIsDirty] = useState(false);

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Configurações Gerais"
        description="Identidade do workspace, fuso horário operacional e preferências de governança."
      />

      <Card>
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold">
            Identidade do Workspace
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-4 pt-2 text-xs">
          <div className="space-y-1.5">
            <label
              htmlFor="workspace-name"
              className="font-medium text-foreground"
            >
              Nome do Workspace
            </label>
            <Input
              id="workspace-name"
              value={workspaceName}
              onChange={(e) => {
                setWorkspaceName(e.target.value);
                setIsDirty(true);
              }}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="workspace-tz"
              className="font-medium text-foreground"
            >
              Fuso Horário
            </label>
            <Select
              id="workspace-tz"
              value={timezone}
              onChange={(e) => {
                setTimezone(e.target.value);
                setIsDirty(true);
              }}
            >
              <option value="America/Sao_Paulo">
                América - São Paulo (BRT)
              </option>
              <option value="America/Manaus">América - Manaus (AMT)</option>
              <option value="UTC">Tempo Universal Coordenado (UTC)</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <FloatingSaveBar
        isDirty={isDirty}
        onSave={() => setIsDirty(false)}
        onReset={() => {
          setWorkspaceName('Imobiliária Atlântica');
          setTimezone('America/Sao_Paulo');
          setIsDirty(false);
        }}
      />
    </div>
  );
}
