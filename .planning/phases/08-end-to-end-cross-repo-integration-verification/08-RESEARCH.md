# Phase 08 Research: End-to-End Cross-Repo Integration & Verification

## 1. Contexto & Estado Atual dos Repositórios

A arquitetura bidirecional foi implementada entre as Fases 5, 6 e 7:
- **Fase 5 (Marketplace & Módulo)**: Módulo `zaptrail` registrado no PilotCRM com credenciais cifradas (AES-256-GCM) em `tenant_integration_settings`.
- **Fase 6 (3 Gatilhos de Ingestão)**:
  1. Webhook realtime OpenWA (`/api/crm/whatsapp/webhook` via `after()`).
  2. Crons periódicas (`/api/cron/whatsapp-sync` e `/api/cron/whatsapp-analysis`).
  3. CTAs sob demanda no Radar e Inbox (`/api/crm/whatsapp/sync-conversations` e `/api/crm/whatsapp/analyze-now`).
- **Fase 7 (Outbound Webhook & AI Suggestions Loop)**:
  - ZapTrail envia sugestões comerciais via `outbound-dispatcher.ts` e `PilotCRMAdapter`.
  - PilotCRM consome e persiste em `enrichment_proposals` (alias `ai_suggestions`) via rota canônica `/api/crm/whatsapp/ai-suggestions/ingest`.
  - `WhatsAppRadarCard.tsx` escuta e atualiza propostas pendentes em tempo real.
  - `approveWhatsAppProposal` cria registros em `deals` no Pipeline Padrão.

---

## 2. Gaps & Desafios Identificados para a Fase 8

### Gap 1: Testes E2E Unificados dos 3 Gatilhos
Atualmente, os 3 gatilhos foram testados isoladamente em testes unitários (`zaptrail-triggers.test.ts` e `openwa-webhook.test.ts`), enquanto o loop de retorno foi testado em `ai-suggestions-loop.test.ts` usando diretamente o `dispatchTurnToZapTrail`. Falta um cenário E2E ponta a ponta que execute:
- **Gatilho 1 (Realtime)**: Mensagem bruta recebida no webhook -> disparo assíncrono -> processamento -> sugestão persistida.
- **Gatilho 2 (Crons)**: Sincronização periódica -> detecção de conversas pendentes -> despacho em lote -> lote de sugestões persistido.
- **Gatilho 3 (CTAs)**: Clique em "Sincronizar Conversas" / "Analisar agora" -> lote disparado -> feedback na UI e propostas prontas para aprovação.

### Gap 2: Testes de Estresse, Concorrência e Idempotência de Deals
- Na ingestão de sugestões (`ai-suggestions-service.ts`), o banco de dados possui a restrição única `(tenant_id, idempotency_key)`, e a deduplicação em memória impede duplicações em lote.
- Contudo, em `proposals-service.ts`, a função `approveWhatsAppProposal` busca a proposta mas **não verifica explicitamente se `proposal.status === 'approved'`**, o que significa que cliques múltiplos e rápidos no botão de aprovação (ou retentativas concorrentes) poderiam gerar Deals duplicados no pipeline.
- Precisamos proteger `approveWhatsAppProposal` com verificação de idempotência (`if (proposal.status === "approved") return { success: true, deal: existingDeal, alreadyApproved: true }`) e validar esse comportamento sob rajadas concorrentes de chamadas (`Promise.all`).

### Gap 3: Validação Completa de Atributos do Deal
O Critério de Sucesso 3 exige que a aprovação gere Deal com **todas as propriedades extraídas preenchidas**:
- `value`: Valor numérico sanitizado a partir de moedas brasileiras (ex: "R$ 1.500.000,00" -> "1500000").
- `title`: Título claro com nome do lead e tipo de intenção/bairro.
- `contact_id`: Associação ao contato correspondente.
- `stage_id`: Primeiro estágio do pipeline padrão ("Qualificação" ou similar).
- `notes`: Metadados completos da IA (intenção, prazo, bairro, origem WhatsApp e próxima ação).
- `contacts.name`: Atualização do nome do contato se `suffixAnalysis.suggestedName` estiver presente.

### Gap 4: Harness / Script de Verificação Cross-Repo Automatizado
Para garantir que a integração possa ser validada continuamente sem atrito entre os dois repositórios locais (`dazzling-goodall` e `pilotcrm`), um script unificado (`scripts/verify-cross-repo-e2e.mjs`) deve ser criado em ZapTrail, orquestrando as checagens e testes de ambos os projetos com saída estruturada.

---

## 3. Estratégia de Implementação e Arquitetura de Testes

1. **Plano 08-01: Suíte E2E dos 3 Gatilhos (PCRM-08)**:
   - Expandir `apps/pilotcrm/src/lib/whatsapp/__tests__/ai-suggestions-loop.test.ts` (ou criar `cross-repo-triggers-e2e.test.ts`) cobrindo cenários completos dos 3 gatilhos com conversas reais de compra, venda e locação.
2. **Plano 08-02: Hardening de Idempotência e Testes de Concorrência (PCRM-08)**:
   - Proteger `approveWhatsAppProposal` contra dupla aprovação e criação duplicada de Deals.
   - Criar suíte de concorrência (`stress-concurrency-idempotency.test.ts`) disparando 50 requisições simultâneas para webhook, ingestão e aprovação.
   - Garantir 0 duplicatas em `enrichment_proposals` e 0 duplicatas em `deals`.
3. **Plano 08-03: Validação Completa dos Atributos de Deals & Script Cross-Repo (PCRM-08)**:
   - Teste de ponta a ponta auditando cada campo do Deal persistido.
   - Implementação do script `scripts/verify-cross-repo-e2e.mjs` no ZapTrail executando verificações cruzadas e emitindo relatório unificado.
