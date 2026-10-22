# Phase 07 Plan 01 Summary: Outbound Webhook Suggestions Dispatcher (PCRM-06)

**Plan:** `07-01`  
**Phase:** `07-outbound-webhook-proposal-persistence-loop`  
**Requirements:** `PCRM-06`  
**Status:** Completed  
**Date:** 2026-10-22  

---

## 1. What was built

1. **TDD Test Suite for Outbound Suggestions Dispatcher (`tests/api/outbound-dispatcher.test.ts`)**:
   - Desenvolvido seguindo estritamente o ciclo TDD (Red -> Green -> Refactor).
   - Cobertura completa de casos de teste:
     - Retorna `{ dispatched: false, reason: 'no_callback_url' }` sem chamar `fetch` quando `callbackUrl` for omitida.
     - Retorna `{ dispatched: false, reason: 'duplicate_envelope' }` sem chamar `fetch` quando o envelope for duplicado (`duplicate: true`).
     - Converte o envelope de interpretação em propostas CRM via `PilotCRMAdapter.toProposals(envelope)`.
     - Dispara requisição HTTP POST para `callbackUrl` com cabeçalhos canônicos:
       - `Content-Type: application/json`
       - `Authorization: Bearer <callbackToken>` (omitido com segurança se token não fornecido)
       - `x-zaptrail-tenant-id: <tenantId>`
     - Envia payload canônico `{ tenant_id, conversation_id, source: "zaptrail", suggestions: [...] }`.
     - Retorna `{ dispatched: true, status: 200, count: N }` em respostas 200/201.
     - Captura falhas 5xx e retorna `{ dispatched: false, status: 500, error: string }` sem lançar exceção.
     - Captura timeouts (`AbortSignal`) e erros de rede com resiliência sem propagar erro para o chamador (`T-07-03`).

2. **Módulo Despachador Outbound (`src/packages/api/outbound-dispatcher.ts`)**:
   - Implementa a função `dispatchOutboundSuggestions(input: OutboundDispatcherInput): Promise<OutboundDispatcherResult>`.
   - Utiliza `PilotCRMAdapter` para transformar o `UniversalInterpretationEnvelope` em propostas estruturadas (`ai_suggestions`).
   - Aplica timeout máximo de 8000ms através de `AbortSignal.timeout(8000)` para mitigar exaustão de conexões (`T-07-03`).
   - Garante que nenhum token seja exposto em texto claro em logs ou mensagens de erro (`T-07-04`).

3. **Integração no Pipeline de Ingestão (`src/packages/api/ingest-handler.ts`)**:
   - Atualizado `IngestWhatsappPayloadSchema` com os campos opcionais `callback_url: z.string().url().optional()` e `callback_token: z.string().optional()`.
   - Adicionada opção `fetchFn` em `IngestTurnOptions` para injeção de dependência e desacoplamento nos testes.
   - Em `ingestWhatsappTurn`, após a interpretação do turno e com status 201 (turno inédito), invoca `dispatchOutboundSuggestions`.
   - Proteção estrita contra falhas no callback: falhas de rede, 5xx ou timeouts no webhook externo jamais afetam o status ou o retorno da rota principal de ingestão do ZapTrail.

4. **Exportações do Módulo (`src/packages/api/index.ts`)**:
   - Exporta `dispatchOutboundSuggestions`, `OutboundDispatcherInput`, `OutboundDispatcherResult` e `OutboundSuggestionsPayload`.

---

## 2. Artifacts Produced & Line Counts

| Repositório | Arquivo | Tipo | Linhas | Status |
|---|---|---|---|---|
| ZapTrail | `src/packages/api/outbound-dispatcher.ts` | Production Code (New) | 106 | Verified (<= 350 limit) |
| ZapTrail | `src/packages/api/ingest-handler.ts` | Production Code (Modified) | 253 | Verified (<= 350 limit) |
| ZapTrail | `src/packages/api/index.ts` | Production Code (Modified) | 25 | Verified (<= 350 limit) |
| ZapTrail | `tests/api/outbound-dispatcher.test.ts` | Test Suite (New) | 218 | Verified (6/6 passing) |
| ZapTrail | `tests/api/ingest-whatsapp.test.ts` | Test Suite (Modified) | 483 | Verified (17/17 passing) |

---

## 3. Verification Results

1. **Vitest - Suíte de Despacho e Ingestão**:
   - `npx.cmd vitest run tests/api/outbound-dispatcher.test.ts tests/api/ingest-whatsapp.test.ts`:
     - 2 passed test files (23 passed tests) em ~0.9s.

2. **Vitest - Suíte Completa do ZapTrail**:
   - `npx.cmd vitest run`:
     - 16 passed test files (236 passed tests) em ~2.1s.

3. **TypeScript Type Check**:
   - `npx.cmd tsc --noEmit`:
     - 0 errors, exit code 0.

4. **Conformidade de Linhas (`quality/max-lines`)**:
   - `src/packages/api/outbound-dispatcher.ts`: 106 linhas <= 350
   - `src/packages/api/ingest-handler.ts`: 253 linhas <= 350
   - `src/packages/api/index.ts`: 25 linhas <= 350

---

## 4. Threat Model & Prohibitions Verification

- **T-07-03 (Outbound Starvation)**: Mitigado via `AbortSignal.timeout(8000)` em todas as chamadas HTTP efetuadas pelo despachador.
- **T-07-04 (Sensitive Data Exposure in Logs)**: Mitigado garantindo que o `callback_token` seja utilizado exclusivamente no header `Authorization` e nunca concatenado em logs ou capturas de erro.
- **Proibição de falha na ingestão**: Testado deterministamente em `tests/api/ingest-whatsapp.test.ts` — falhas no webhook retornam 201 na ingestão com `outboundResult.dispatched: false`, sem interromper o fluxo principal.
