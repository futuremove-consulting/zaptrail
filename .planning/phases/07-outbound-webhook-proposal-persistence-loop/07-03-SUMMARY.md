# Phase 07 Plan 03 Summary: Outbound Webhook Loop Integration & Radar Auto-Refresh (PCRM-06, PCRM-07)

**Plan:** `07-03`  
**Phase:** `07-outbound-webhook-proposal-persistence-loop`  
**Requirements:** `PCRM-06`, `PCRM-07`  
**Status:** Completed  
**Date:** 2026-10-22  

---

## 1. What was built

1. **Injeção Automática de Callback Reverso no ZapTrailClient (`apps/pilotcrm/src/lib/integrations/zaptrail-client.ts`)**:
   - Implementada a função auxiliar `getPilotCrmCallbackUrl()` resolvendo a URL canônica do PilotCRM a partir de variáveis de ambiente (`PILOTCRM_APP_URL` ou `NEXT_PUBLIC_APP_URL`, fallback para `http://localhost:3000`) concatenada com `/api/crm/whatsapp/ai-suggestions/ingest`.
   - Atualizado `dispatchTurnToZapTrail` para injetar automaticamente `callback_url` e `callback_token` (`credentials.apiToken`) no corpo enviado ao ZapTrail.
   - Atualizado `dispatchBatchToZapTrail` para propagar opções de callback através de `turnInput` em cada turno processado.
   - Atualizada a interface `DispatchTurnInput` e `DispatchBatchInput` com os campos opcionais `callbackUrl` e `callbackToken`.
   - Arquivo mantido estritamente abaixo do limite canônico de 350 linhas (308 linhas).

2. **Atualização Automática do Radar de Oportunidades (`apps/pilotcrm/src/app/crm/components/WhatsAppRadarCard.tsx`)**:
   - Garantido recarregamento imediato de propostas (`fetchProposals()`) no bloco `finally` de `handleAnalyzeNow`, assegurando que o Radar de Oportunidades se atualize automaticamente sem necessidade de recarregar a página (F5).
   - Disponibilizado alias canônico `handleSyncAndAnalyze`.
   - Arquivo mantido estritamente abaixo do limite canônico de 350 linhas (293 linhas).

3. **Suíte de Testes E2E do Loop Completo (`apps/pilotcrm/src/lib/whatsapp/__tests__/ai-suggestions-loop.test.ts`)**:
   - Desenvolvido seguindo estritamente a disciplina de TDD (Red -> Green -> Refactor).
   - Teste 1: Validação de que `dispatchTurnToZapTrail` injeta automaticamente `callback_url` e `callback_token` no corpo da requisição ao ZapTrail.
   - Teste 2: Simulação completa do ciclo ponta a ponta:
     - Turno do WhatsApp recebido e despachado para análise no ZapTrail.
     - Webhook reverso do ZapTrail aciona o endpoint de ingestão de sugestões do PilotCRM.
     - Persistência em `enrichment_proposals` com status `pending`.
     - `listWhatsAppProposals` exibe a oportunidade pendente no Radar.
     - `approveWhatsAppProposal` é executado com sucesso: cria o Deal no Pipeline padrão (`deals`), marca a proposta como `approved` e o Radar passa a listar 0 pendências.
   - Teste 3: Idempotência do loop: reenvio duplicado do callback do ZapTrail é deduplicado sem criar propostas ou Deals repetidos.

4. **Regressão e Atualização dos Testes de Integração (`apps/pilotcrm/src/lib/integrations/__tests__/zaptrail-client.test.ts`)**:
   - Atualizada a asserção de payload em `zaptrail-client.test.ts` para verificar os novos campos de callback.

---

## 2. Artifacts Produced & Line Counts

| Repositório | Arquivo | Tipo | Linhas | Status |
|---|---|---|---|---|
| PilotCRM | `apps/pilotcrm/src/lib/integrations/zaptrail-client.ts` | Production Code (Modified) | 308 | Verified (<= 350 limit) |
| PilotCRM | `apps/pilotcrm/src/app/crm/components/WhatsAppRadarCard.tsx` | UI Component (Modified) | 293 | Verified (<= 350 limit) |
| PilotCRM | `apps/pilotcrm/src/lib/whatsapp/proposals-service.ts` | Service (Modified) | 204 | Verified (<= 350 limit) |
| PilotCRM | `apps/pilotcrm/src/lib/whatsapp/__tests__/ai-suggestions-loop.test.ts` | Test Suite (New) | 379 | Verified (3/3 passing) |
| PilotCRM | `apps/pilotcrm/src/lib/integrations/__tests__/zaptrail-client.test.ts` | Test Suite (Modified) | 308 | Verified (10/10 passing) |

---

## 3. Verification Results

1. **Vitest no PilotCRM**:
   - `npx.cmd vitest run src/lib/whatsapp/__tests__/ai-suggestions-loop.test.ts src/lib/integrations/__tests__/zaptrail-client.test.ts`:
     - 2 arquivos de teste, 13 testes passando (100% Green).
   - Suíte de regressão WhatsApp + Integrations:
     - `npx.cmd vitest run src/lib/whatsapp/__tests__/ src/lib/integrations/__tests__/`:
     - 15 arquivos de teste, 178 testes passando (0 falhas).

2. **TypeScript Typecheck**:
   - `npx.cmd tsc --noEmit` em `apps/pilotcrm`:
     - 0 erros de tipagem, exit code 0.

3. **Quality Gates do Monorepo**:
   - `quality/max-lines`: OK (todos os arquivos de produção <= 350 linhas).
   - `quality/no-direct-console`: OK.
   - `quality/no-direct-data-access`: OK.
   - `quality/no-raw-color`: OK.
   - Design System Quality Gate: OK.
   - UI/UX Writing Quality Gate: OK.

4. **Commits Realizados no PilotCRM**:
   - `65c5091`: `test(whatsapp): add E2E loop integration tests for ai suggestions (PCRM-06, PCRM-07)`
   - `1dbbfa3`: `feat(integrations): wire automatic callback url and radar proposal refresh (PCRM-06, PCRM-07)`

---

## 4. Threat Model & Prohibitions Verification

- **T-07-03 (Timeout ou indisponibilidade no callback reverso)**: ZapTrailClient tolera indisponibilidade transitória com timeout de 8s; PilotCRM processa respostas de forma assíncrona e resiliente.
- **T-07-04 (Sugestões órfãs ou desencontradas)**: Assegurada a rastreabilidade via `conversation_id`, `idempotency_key` e metadados contextuais preservados desde o turno até o Deal gerado.
- **Proibição de configuração manual de URL**: A `callback_url` é calculada e injetada de forma 100% automática pelo cliente, sem exigir intervenção do usuário nas configurações.
- **Proibição de ultrapassar 350 linhas**: Rigorosamente respeitada em todos os arquivos modificados.
