# Phase 08 Specification: End-to-End Cross-Repo Integration & Verification

## 1. Objetivo & Escopo

Formalizar os contratos de teste, cenários de concorrência, validações de integridade de dados e script unificado de verificação para o requisito **PCRM-08** no Milestone v1.1.0.

---

## 2. Threat Modeling & Requisitos de Segurança (ASVS Level 1)

| Ameaça | Vetor | Mitigação Obrigatória |
|---|---|---|
| **T-08-01: Race Condition em Aprovação de Deal** | Corretor clica duas vezes rapidamente no botão "Aprovar" ou duas requisições simultâneas chegam para a mesma proposta. | `approveWhatsAppProposal` deve checar o status da proposta atomicamente; se já estiver `approved`, deve retornar sucesso idempotente sem inserir novo registro em `deals`. |
| **T-08-02: Tempestade de Mensagens e Duplicação** | Gateway de WhatsApp reenvia rajadas de webhooks repetidos ou concorrentes (50 requisições simultâneas). | Chave de idempotência SHA-256 e restrição única `(tenant_id, idempotency_key)` com `.onConflictDoNothing()` garantem exatamente 0 inserções adicionais. |
| **T-08-03: Vazamento de Tokens em Scripts Cross-Repo** | O script unificado de verificação executa comandos e lê variáveis de ambiente. | O script jamais deve exibir tokens Bearer, senhas ou strings sensíveis em stdout/stderr. |

---

## 3. Especificação Técnica dos Cenários de Teste

### Cenário 1: E2E dos 3 Gatilhos (PCRM-08)
1. **Gatilho Realtime**:
   - Requisição `POST /api/crm/whatsapp/webhook` com mensagem de proprietário ("Quero vender meu apartamento em Moema por 1.2M").
   - `after()` despacha para `POST /api/v1/ingest/whatsapp`.
   - ZapTrail interpreta (papel `owner`, intenção `capture_for_sale`, valor 1.200.000, bairro Moema) e envia callback reverso para `/api/crm/whatsapp/ai-suggestions/ingest`.
   - Proposta pendente é listada por `listWhatsAppProposals`.
2. **Gatilho Crons**:
   - `GET /api/cron/whatsapp-sync` e `GET /api/cron/whatsapp-analysis` detectam conversas e disparam lote para o ZapTrail.
   - Respostas do ZapTrail geram sugestões persistidas sem bloquear a execução da cron.
3. **Gatilho CTAs**:
   - `POST /api/crm/whatsapp/sync-conversations` e `POST /api/crm/whatsapp/analyze-now` despacham lote para o ZapTrail e retornam sumário com contadores de sucesso.

### Cenário 2: Testes de Estresse & Idempotência Concorrente (PCRM-08)
1. **Rajada de Ingestão**: Disparo de 50 requisições simultâneas contendo payloads idênticos ou com o mesmo ID de mensagem externa.
   - Resultado esperado: Exatamente 1 registro persistido em `enrichment_proposals`, 49 duplicatas ignoradas (`inserted: 0, duplicates: 1`), status 200/idempotent.
2. **Rajada de Aprovação**: Execução concorrente de 5 chamadas `approveWhatsAppProposal` para a mesma proposta.
   - Resultado esperado: Exatamente 1 Deal criado na tabela `deals`, status `approved` na proposta, 0 duplicações de pipeline.

### Cenário 3: Validação Completa de Atributos do Deal (PCRM-08)
Ao aprovar a sugestão gerada pela IA, o Deal criado na tabela `deals` deve possuir:
- `title`: Não-vazio, contendo nome do contato e intenção (ex: "Mariana Souza - Venda Moema").
- `value`: Valor numérico sanitizado ("1200000").
- `contact_id`: ID válido do contato.
- `stage_id`: Primeiro estágio do pipeline de venda padrão.
- `status`: `"open"`.
- `notes`: Texto descritivo incluindo origem WhatsApp, telefone verificado, intenção, prazo e bairro.
- `contacts`: Nome do contato atualizado se `suffixAnalysis.suggestedName` estiver presente.

### Cenário 4: Script Cross-Repo de Verificação (`scripts/verify-cross-repo-e2e.mjs`)
- Script executável via Node.js em `c:\Users\Gustavo\Documents\antigravity\dazzling-goodall`.
- Executa testes automatizados no ZapTrail e no PilotCRM.
- Valida tipagem (`tsc --noEmit`) em ambos os repositórios.
- Emite relatório com código de saída 0 se tudo passar.

---

## 4. Acceptance Criteria & Quality Gates

1. Todos os 3 planos de teste e hardening devem ter 100% dos testes passando.
2. Todos os arquivos criados ou modificados devem ter $\le 350$ linhas.
3. Zero regressão nas 16 suítes do ZapTrail e 15 suítes do PilotCRM.
