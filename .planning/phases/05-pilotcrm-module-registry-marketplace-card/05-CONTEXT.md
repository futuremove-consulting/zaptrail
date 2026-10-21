# Phase 5 Context: PilotCRM Module Registry & Marketplace Card

## Context & Objectives

- **Phase:** 5
- **Goal:** Registrar o ZapTrail como módulo no PilotCRM e permitir ativação e configuração por tenant em `/crm/settings/modules`.
- **Target Requirements:** `PCRM-01`, `PCRM-02`.

## Decisions

- **D-5-01 (Module Registry Key):** Adicionar `zaptrail` à união `ModuleKey`, ao objeto `MODULE_REGISTRY`, a `DEFAULT_MODULE_FLAGS` e a `updateModuleSchema` em `apps/pilotcrm/src/lib/module-flags/types.ts`.
- **D-5-02 (Default Opt-In):** `defaultEnabled: false` — o módulo ZapTrail inicia desativado até que o gestor do workspace o ative explicitamente nas configurações do PilotCRM.
- **D-5-03 (Settings UI & Card):** Em `apps/pilotcrm/src/app/crm/settings/modules/page.tsx`, o ZapTrail é exibido na seção "Inteligência & Mercado". Ao expandir ou clicar em configurar, permite definir `zaptrail_api_url` e `zaptrail_api_key`.
- **D-5-04 (Configuration Persistence):** Armazenamento de configurações de integração por workspace, garantindo isolamento entre diferentes imobiliárias.
- **D-5-05 (Contract & Safety):** Qualquer chamada subsequente do PilotCRM ao ZapTrail só ocorre se o módulo `zaptrail` estiver com flag `true` para o tenant ativo.

## Codebase Locations

- PilotCRM Repo: `C:\Users\Gustavo\pilotcrm`
  - Types: `apps/pilotcrm/src/lib/module-flags/types.ts`
  - Modules API: `apps/pilotcrm/src/app/api/crm/modules/route.ts`
  - Settings UI: `apps/pilotcrm/src/app/crm/settings/modules/page.tsx`
  - Tests: `apps/pilotcrm/src/lib/module-flags/__tests__/` ou `apps/pilotcrm/tests/`
- ZapTrail Repo: `c:\Users\Gustavo\Documents\antigravity\dazzling-goodall`
  - Adapter & Ingest: `src/packages/api/ingest-handler.ts`, `src/packages/domain-real-estate/adapters/pilotcrm-adapter.ts`
