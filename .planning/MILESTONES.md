# Milestones

## v1.0.0 ZapTrail MVP Package-First (Shipped: 2026-10-21)

**Delivered:** Motor conversacional package-first para WhatsApp com envelope agnóstico, pacote imobiliário validado pelos 20 Casos-Ouro, fallback LLM estruturado, fila de revisão humana no Supabase e superfície REST/MCP.

**Phases completed:** 1-4 (9 plans total, 18 tasks)

**Key accomplishments:**
- **Núcleo Semântico Agnóstico (`@futuremove/zaptrail-core`)**: Envelope universal tipado, cálculo determinístico de `char_start`/`char_end` via `exact_quote`, separação epistêmica, evolução de valores (`superseded`) e política de faixas de confiança sem vazamento de vocabulário de domínio.
- **Pacote de Domínio Imobiliário (`@futuremove/zaptrail-domain-real-estate`)**: Classificação determinística de papéis e intenções pt-BR, oferta de segundo imóvel (`CAPTURE_OTHER_PROPERTY`), demandas condicionadas (`sale_before_purchase`), normalização de valores e resolução dos 20 Casos-Ouro canônicos (`CT-01` a `CT-20`).
- **Adaptador PilotCRM (`PilotCRMAdapter`)**: Mapeamento estrito para a constraint `enrichment_action_ck`, eliminando definitivamente o erro P0 `create_deal`.
- **Estágio 2 Híbrido & Anti-Alucinação**: Acionamento seletivo de LLM estruturado (~20% dos turnos ambíguos) com validação rígida de `exact_quote` no `quote-validator` e injeção de candidatos de campanhas outbound.
- **Persistência PostgreSQL/RLS & Inbox de Revisão**: Correção estrutural das migrações SQL 001-004, auditoria imutável (`SupabaseStoragePort`) e interface de Revisão Humana com Timeline Dual ("Mostrar na conversa").
- **Superfície Standalone Spin-Out**: Endpoint REST `/api/v1/ingest/whatsapp` e servidor MCP (`@futuremove/zaptrail-mcp`) via stdio JSON-RPC 2.0 para consumo agnóstico por agentes de IA e CRMs terceiros.
- **Blindagem e Governança de Código**: 214 testes automatizados em 14 suítes Vitest, 0 erros TypeScript e conformidade universal com o teto de 350 linhas por arquivo de produção.

**Stats:**
- 90 arquivos criados/modificados
- ~16.000 linhas de código adicionadas (TypeScript / SQL)
- 4 fases, 9 planos, 18 tasks executadas
- 214 testes automatizados passando
- 1 dia de execução (2026-10-21)

**Git range:** `466e86b` → `f894ff2`  
**Audit:** `.planning/milestones/v1.0.0-MILESTONE-AUDIT.md` (Status: PASSED)

**What's next:** Iniciar planejamento do Milestone v1.1.0 (Expansão multi-domínio para B2B/Saúde, disparo ativo de ações externas aprovadas com 1 clique e interface administrativa).

---
