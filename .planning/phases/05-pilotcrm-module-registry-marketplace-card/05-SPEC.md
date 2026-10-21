# Phase 5 SPEC: PilotCRM Module Registry & Marketplace Card

## Requirements Covered
- **PCRM-01**: PilotCRM registra o módulo ZapTrail em `MODULE_REGISTRY` (`apps/pilotcrm/src/lib/module-flags/types.ts`) com flags de ativação por tenant.
- **PCRM-02**: PilotCRM renderiza card do ZapTrail na página de módulos (`/crm/settings/modules`), permitindo configurar URL do ZapTrail, API Key/Token e status de ativação.

## Must-Haves
- `ModuleKey` no PilotCRM contém `"zaptrail"`.
- `MODULE_REGISTRY.zaptrail` configurado com `category: "inteligencia"`, `defaultEnabled: false`.
- `DEFAULT_MODULE_FLAGS.zaptrail === false`.
- `updateModuleSchema` aceita `"zaptrail"` sem rejeição Zod.
- UI do PilotCRM `/crm/settings/modules` exibe o ZapTrail e permite alternar seu estado e salvar parâmetros de conexão.
- Todas as alterações no PilotCRM preservam o funcionamento de todos os módulos existentes.
- Nenhum arquivo com mais de 350 linhas de código.

## Edge Coverage
- **Workspace isolado**: Mudança na flag do ZapTrail no workspace A não afeta workspace B.
- **Fallback seguro**: Se a flag não estiver configurada no banco, assume o default `false`.
- **Validação de Token**: Tokens vazios ou inválidos são rejeitados na interface antes de salvar.

## Prohibitions (must-NOT)
- Não ativar o ZapTrail por padrão (`defaultEnabled` deve ser `false`).
- Não quebrar retrocompatibilidade com flags existentes do PilotCRM.
- Não expor tokens ou secrets para membros que não sejam `owner` ou `admin`.
