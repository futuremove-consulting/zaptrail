# Phase 07 Plan 02 Summary: PilotCRM AI Suggestions Ingest & Persistence Endpoint (PCRM-07)

**Plan:** `07-02`  
**Phase:** `07-outbound-webhook-proposal-persistence-loop`  
**Requirements:** `PCRM-07`  
**Status:** Completed  
**Date:** 2026-10-22  

---

## 1. What was built

1. **Canonical Schema Alias (`apps/pilotcrm/src/db/schema/conversationEngine.ts`)**:
   - Adicionada exportação canônica `export const ai_suggestions = enrichment_proposals;` no schema Drizzle do PilotCRM, garantindo compatibilidade total com a tabela de propostas de enriquecimento (`enrichment_proposals`) e viabilizando a transição léxica sem migrações destrutivas (`D-7-01`).

2. **AI Suggestions Ingestion Service (`apps/pilotcrm/src/lib/whatsapp/ai-suggestions-service.ts`)**:
   - Definidos esquemas de validação Zod: `AiSuggestionItemSchema` e `AiSuggestionsIngestPayloadSchema`.
   - Validação estrita do conjunto de ações permitidas pela constraint PostgreSQL `enrichment_action_ck`:
     `('NO_CHANGE', 'CONFIRM', 'UPDATE', 'ADD', 'RELATE', 'CONTRADICT', 'INVALIDATE', 'SUPPRESS', 'DEFER', 'REVIEW', 'CREATE_DEAL', 'create_deal')`.
   - Implementada a função `ingestAiSuggestions(tenantId, payload, options)`.
   - Cálculo determinístico de chave de idempotência baseado em hash SHA-256 do payload proposto quando não fornecida explicitamente pelo ZapTrail.
   - Deduplicação em memória no lote e checagem de conflitos no banco por `(tenant_id, idempotency_key)` com cláusula `.onConflictDoNothing()`.
   - Contabilização exata de itens processados, inseridos e duplicados (`{ count, inserted, duplicates }`).

3. **Canonical REST Route Handler (`apps/pilotcrm/src/app/api/crm/whatsapp/ai-suggestions/ingest/route.ts`)**:
   - Implementado endpoint HTTP POST canônico `/api/crm/whatsapp/ai-suggestions/ingest`.
   - Resolução robusta de tenant via headers (`x-zaptrail-tenant-id`, `x-tenant-id`) ou payload body com fallback seguro.
   - Autenticação e segurança conforme ASVS Level 1 (`T-07-01`): validação do token Bearer contra as credenciais cifradas do ZapTrail configuradas para o tenant.
   - Retornos HTTP padronizados:
     - `201 Created` quando há sugestões novas inseridas.
     - `200 OK` com `{ idempotent: true }` quando todas as sugestões do lote já haviam sido persistidas.
     - `400 Bad Request` para corpo malformado, schema inválido ou violação de restrição.
     - `401 Unauthorized` quando o Bearer token for inválido.
     - `500 Internal Server Error` capturado com mensagem segura sem vazamento de segredos.

4. **Legacy Route Handler Alias (`apps/pilotcrm/src/app/api/crm/whatsapp/proposals/ingest/route.ts`)**:
   - Implementado alias com retrocompatibilidade total reexportando o handler POST da rota canônica.

5. **TDD Test Suite (`apps/pilotcrm/src/lib/whatsapp/__tests__/ai-suggestions-ingest.test.ts`)**:
   - 12 testes unitários e de integração cobrindo:
     - Alias de schema e igualdade de referência com `enrichment_proposals`.
     - Conformidade estrita à constraint `enrichment_action_ck`.
     - Rejeição de `action_type` ilegal.
     - Mapeamento de campos legados e flexíveis (`enrichment_action`, `payload`).
     - Inserção de lote com contadores precisos.
     - Idempotência e deduplicação sem duplicação de registros.
     - Autenticação via token Bearer (401 quando inválido).
     - Rota canônica (201 para novos, 200 para idempotentes).
     - Rota legado `/proposals/ingest` com delegação transparente.

---

## 2. Artifacts Produced & Line Counts

| Repositório | Arquivo | Tipo | Linhas | Status |
|---|---|---|---|---|
| PilotCRM | `apps/pilotcrm/src/db/schema/conversationEngine.ts` | Schema (Modified) | 223 | Verified (<= 350 limit) |
| PilotCRM | `apps/pilotcrm/src/lib/whatsapp/ai-suggestions-service.ts` | Service (New) | 224 | Verified (<= 350 limit) |
| PilotCRM | `apps/pilotcrm/src/app/api/crm/whatsapp/ai-suggestions/ingest/route.ts` | API Route (New) | 108 | Verified (<= 350 limit) |
| PilotCRM | `apps/pilotcrm/src/app/api/crm/whatsapp/proposals/ingest/route.ts` | API Route (New) | 3 | Verified (<= 350 limit) |
| PilotCRM | `apps/pilotcrm/src/lib/whatsapp/__tests__/ai-suggestions-ingest.test.ts` | Test Suite (New) | 340 | Verified (12/12 passing) |

---

## 3. Verification Results

1. **Vitest no PilotCRM**:
   - `npx.cmd vitest run src/lib/whatsapp/__tests__/ai-suggestions-ingest.test.ts`:
     - 12/12 testes passando (36ms).
   - Suíte de regressão WhatsApp + Integrations:
     - 14 arquivos de teste, 175 testes passando, 0 falhas.

2. **TypeScript Typecheck**:
   - `npx.cmd tsc --noEmit` em `apps/pilotcrm`:
     - 0 erros de tipagem.

3. **Commits Realizados no PilotCRM**:
   - `3a98539`: `test(whatsapp): add unit test suite for ai suggestions ingestion and idempotency (PCRM-07)`
   - `675745c`: `feat(whatsapp): implement ai_suggestions schema alias, ingestion service and routes (PCRM-07)`
